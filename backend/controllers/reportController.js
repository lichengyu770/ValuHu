const Report = require('../models/Report');
const { query } = require('../config/db');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const webhookService = require('../services/webhookService');

// 复用浏览器实例，减少启动时间
let browserInstance = null;

// 初始化浏览器实例
const initBrowser = async () => {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-infobars',
        '--disable-browser-side-navigation'
      ],
      defaultViewport: {
        width: 1200,
        height: 1080
      },
      ignoreHTTPSErrors: true
    });
  }
  return browserInstance;
};

// 关闭浏览器实例
const closeBrowser = async () => {
  if (browserInstance && browserInstance.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
};

// 定期关闭浏览器实例（防止内存泄漏）
setInterval(closeBrowser, 3600000); // 每小时关闭一次

// @desc    获取报告列表
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    获取单个报告详情
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: '报告未找到' });
    }
    
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    创建新报告
// @route   POST /api/reports
// @access  Private (Admin)
const createReport = async (req, res) => {
  const { title, content, coverImage } = req.body;
  
  try {
    const report = await Report.create({
      title,
      content,
      coverImage
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    基于估价结果生成报告
// @route   POST /api/reports/generate
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { valuation_id, format = 'pdf', template_id } = req.body;
    
    // 获取估价结果
    const valuationSql = 'SELECT * FROM valuations WHERE id = $1';
    const { rows: valuationRows } = await query(valuationSql, [valuation_id]);
    
    if (!valuationRows.length) {
      return res.status(404).json({ success: false, message: '估价结果不存在' });
    }
    
    const valuation = valuationRows[0];
    
    // 获取房产信息
    const propertySql = 'SELECT * FROM properties WHERE id = $1';
    const { rows: propertyRows } = await query(propertySql, [valuation.property_id]);
    
    if (!propertyRows.length) {
      return res.status(404).json({ success: false, message: '房产信息不存在' });
    }
    
    const property = propertyRows[0];
    
    // 生成HTML报告内容
    const htmlContent = await generateHTMLReport(valuation, property);
    
    // 生成PDF文件
    let pdfUrl = '';
    if (format === 'pdf') {
      pdfUrl = await generatePDFReport(htmlContent, valuation, property);
    }
    
    // 创建报告记录
    const report = await Report.create({
      title: `房产估价报告 - ${property.address}`,
      content: format === 'html' ? htmlContent : generateMarkdownReport(valuation, property),
      html_content: htmlContent,
      pdf_url: pdfUrl,
      valuation_id,
      user_id: valuation.user_id,
      property_id: property.id,
      status: 'generated',
      format,
      template_id
    });
    
    // 发送Webhook通知
    await webhookService.handleReportGenerated(report);
    
    res.status(201).json({
      success: true,
      data: report,
      message: '报告生成成功'
    });
  } catch (error) {
    console.error('生成报告错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    生成HTML报告
// @private
const generateHTMLReport = async (valuation, property, templatePath) => {
  // 准备模板数据
  const featureMap = {
    area: '面积',
    property_type: '物业类型',
    building_year: '建筑年份',
    floor_level: '楼层',
    rooms: '室数',
    bathrooms: '厅数',
    orientation: '朝向',
    decoration_status: '装修状况'
  };
  
  // 准备特征重要性数据
  const featureImportance = Object.entries(JSON.parse(valuation.result_details).feature_importance || {}).map(([feature, importance]) => {
    return `
    <tr>
      <td>${featureMap[feature] || feature}</td>
      <td>${(importance * 100).toFixed(1)}%</td>
      <td>该特征对估价结果的影响程度</td>
    </tr>`;
  }).join('');
  
  // 准备模板数据
  const templateData = {
    reportNo: Date.now(),
    reportDate: new Date().toLocaleDateString('zh-CN'),
    valuationDate: new Date(valuation.created_at).toLocaleDateString('zh-CN'),
    modelType: valuation.model_type,
    confidenceLevel: (valuation.confidence_level * 100).toFixed(1),
    property: {
      address: property.address,
      city: property.city,
      district: property.district || '未知',
      area: property.area,
      rooms: property.rooms,
      bathrooms: property.bathrooms,
      floorLevel: property.floor_level,
      buildingYear: property.building_year,
      orientation: property.orientation,
      decorationStatus: property.decoration_status,
      propertyType: property.property_type
    },
    estimatedPrice: valuation.estimated_price.toLocaleString(),
    pricePerSqm: valuation.price_per_sqm.toLocaleString(),
    modelDescription: valuation.model_type === 'ensemble' ? '集成模型，结合了多种算法的优点' : 
                     valuation.model_type === 'linear' ? '线性回归模型，基于历史数据的线性关系' : 
                     '随机森林模型，擅长处理复杂特征关系',
    featureImportance
  };
  
  // 读取模板文件
  const finalTemplatePath = templatePath || path.join(__dirname, '../templates/valuation_report.html');
  const template = fs.readFileSync(finalTemplatePath, 'utf8');
  
  // 使用EJS渲染模板
  return ejs.render(template, templateData);
};

// @desc    生成PDF报告
// @private
const generatePDFReport = async (htmlContent, valuation, property) => {
  // 使用复用的浏览器实例
  const browser = await initBrowser();
  
  // 创建页面
  const page = await browser.newPage();
  
  // 优化页面性能
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    // 拦截图片和音频请求，减少资源加载时间
    if (request.resourceType() === 'image' || request.resourceType() === 'audio' || request.resourceType() === 'font') {
      request.abort();
    } else {
      request.continue();
    }
  });
  
  // 设置页面内容，优化等待时间
  await page.setContent(htmlContent, {
    waitUntil: 'domcontentloaded', // 只等待DOM加载完成，不等待网络空闲
    timeout: 30000 // 设置超时时间
  });
  
  // 优化PDF生成选项
  const pdfOptions = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    },
    printBackground: true,
    path: null, // 先不保存到文件，返回Buffer
    preferCSSPageSize: true, // 优先使用CSS定义的页面大小
    timeout: 30000 // 设置超时时间
  };
  
  // 生成PDF
  const pdfBuffer = await page.pdf(pdfOptions);
  
  // 关闭页面（不关闭浏览器，以便复用）
  await page.close();
  
  // 保存PDF到文件
  const pdfDir = path.join(__dirname, '../reports');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  
  const pdfFilename = `valuation_report_${valuation.id}_${Date.now()}.pdf`;
  const pdfPath = path.join(pdfDir, pdfFilename);
  fs.writeFileSync(pdfPath, pdfBuffer);
  
  // 返回PDF文件路径
  return `/reports/${pdfFilename}`;
};

// @desc    生成Markdown报告内容
// @private
const generateMarkdownReport = (valuation, property) => {
  const currentDate = new Date().toLocaleDateString('zh-CN');
  
  return `
# 房产估价报告

## 报告基本信息
- **报告编号**: ${Date.now()}
- **生成日期**: ${currentDate}
- **估价日期**: ${new Date(valuation.created_at).toLocaleDateString('zh-CN')}
- **估价模型**: ${valuation.model_type}
- **置信度**: ${(valuation.confidence_level * 100).toFixed(1)}%

## 房产基本信息
- **地址**: ${property.address}
- **城市**: ${property.city}
- **区域**: ${property.district || '未知'}
- **建筑面积**: ${property.area} ㎡
- **户型**: ${property.rooms}室${property.bathrooms}厅
- **楼层**: ${property.floor_level}层
- **建筑年份**: ${property.building_year}年
- **朝向**: ${property.orientation}
- **装修状况**: ${property.decoration_status}

## 估价结果
- **预估总价**: ${valuation.estimated_price.toLocaleString()} 元
- **预估单价**: ${valuation.price_per_sqm.toLocaleString()} 元/㎡

## 估价说明
1. **估价依据**: 基于房产的物理属性、市场数据和历史成交记录
2. **模型说明**: ${valuation.model_type === 'ensemble' ? '集成模型，结合了多种算法的优点' : 
   valuation.model_type === 'linear' ? '线性回归模型，基于历史数据的线性关系' : 
   '随机森林模型，擅长处理复杂特征关系'}
3. **置信度说明**: 置信度表示估价结果的可靠性，越高表示越可靠

## 市场趋势分析
- **当前区域平均单价**: 15,500 元/㎡
- **价格趋势**: 上升
- **同比增长**: 12.5%

## 特征重要性分析
${Object.entries(JSON.parse(valuation.result_details).feature_importance || {}).map(([feature, importance]) => {
  const featureMap = {
    area: '面积',
    property_type: '物业类型',
    building_year: '建筑年份',
    floor_level: '楼层',
    rooms: '室数',
    bathrooms: '厅数',
    orientation: '朝向',
    decoration_status: '装修状况'
  };
  return `- ${featureMap[feature] || feature}: ${(importance * 100).toFixed(1)}%`;
}).join('\n')}

## 估价结论
根据AI估价模型分析，该房产的合理市场价值为 ${valuation.estimated_price.toLocaleString()} 元。

## 风险提示
1. 本报告仅供参考，不构成任何投资建议
2. 实际成交价格可能受市场波动、交易双方议价等因素影响
3. 如需更准确的估价，请联系专业评估机构进行实地评估

---
**ValuHub AI估价平台**
**联系电话**: 400-123-4567
**官网**: www.valu-hub.com
  `;
};

// @desc    下载报告
// @route   GET /api/reports/download/:id
// @access  Private
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取报告
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: '报告未找到' });
    }
    
    // 如果是PDF格式，直接下载文件
    if (report.format === 'pdf' && report.pdf_url) {
      const pdfPath = path.join(__dirname, `..${report.pdf_url}`);
      
      if (fs.existsSync(pdfPath)) {
        res.download(pdfPath, `${report.title}.pdf`);
      } else {
        res.status(404).json({ success: false, message: 'PDF文件不存在' });
      }
    } else {
      // 其他格式，返回内容
      res.send(report.content);
    }
  } catch (error) {
    console.error('下载报告错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    更新报告
// @route   PUT /api/reports/:id
// @access  Private (Admin)
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: '报告未找到' });
    }
    
    const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    res.json(updatedReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    删除报告
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: '报告未找到' });
    }
    
    // 删除对应的PDF文件
    if (report.pdf_url) {
      const pdfPath = path.join(__dirname, `..${report.pdf_url}`);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }
    
    await report.remove();
    
    res.json({ message: '报告已删除' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    批量生成报告
// @route   POST /api/reports/batch-generate
// @access  Private
const batchGenerateReports = async (req, res) => {
  try {
    const { valuation_ids, format = 'pdf', template_id } = req.body;
    
    if (!valuation_ids || !Array.isArray(valuation_ids) || valuation_ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的估价ID数组' });
    }
    
    // 验证估价ID数量，限制最大批量生成数量
    if (valuation_ids.length > 100) {
      return res.status(400).json({ success: false, message: '单次批量生成报告数量不能超过100份' });
    }
    
    // 准备模板路径（如果有自定义模板）
    let templatePath = null;
    if (template_id) {
      // 这里应该根据template_id获取模板路径
      // 暂时使用默认模板
      templatePath = path.join(__dirname, '../templates/valuation_report.html');
    }
    
    // 批量生成报告
    const reportPromises = valuation_ids.map(async (valuation_id) => {
      try {
        // 获取估价结果
        const valuationSql = 'SELECT * FROM valuations WHERE id = $1';
        const { rows: valuationRows } = await query(valuationSql, [valuation_id]);
        
        if (!valuationRows.length) {
          return { success: false, valuation_id, message: '估价结果不存在' };
        }
        
        const valuation = valuationRows[0];
        
        // 获取房产信息
        const propertySql = 'SELECT * FROM properties WHERE id = $1';
        const { rows: propertyRows } = await query(propertySql, [valuation.property_id]);
        
        if (!propertyRows.length) {
          return { success: false, valuation_id, message: '房产信息不存在' };
        }
        
        const property = propertyRows[0];
        
        // 生成HTML报告内容
        const htmlContent = await generateHTMLReport(valuation, property, templatePath);
        
        // 生成PDF文件
        let pdfUrl = '';
        if (format === 'pdf') {
          pdfUrl = await generatePDFReport(htmlContent, valuation, property);
        }
        
        // 创建报告记录
        const report = await Report.create({
          title: `房产估价报告 - ${property.address}`,
          content: format === 'html' ? htmlContent : generateMarkdownReport(valuation, property),
          html_content: htmlContent,
          pdf_url: pdfUrl,
          valuation_id,
          user_id: valuation.user_id,
          property_id: property.id,
          status: 'generated',
          format,
          template_id
        });
        
        // 发送Webhook通知
        await webhookService.handleReportGenerated(report);
        
        return { success: true, report };
      } catch (error) {
        console.error(`生成报告失败 (估价ID: ${valuation_id}):`, error);
        return { success: false, valuation_id, message: '生成报告失败' };
      }
    });
    
    // 等待所有报告生成完成
    const results = await Promise.all(reportPromises);
    
    // 统计成功和失败的报告数量
    const successfulReports = results.filter(result => result.success).map(result => result.report);
    const failedValuations = results.filter(result => !result.success);
    
    // 如果成功生成的报告数量为0，返回错误
    if (successfulReports.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: '所有报告生成失败',
        failedValuations 
      });
    }
    
    res.status(201).json({
      success: true,
      message: `成功生成${successfulReports.length}份报告，失败${failedValuations.length}份`,
      data: {
        successfulReports: successfulReports.map(report => ({
          id: report._id,
          title: report.title,
          format: report.format,
          pdf_url: report.pdf_url,
          download_url: `/api/reports/download/${report._id}`
        })),
        failedValuations
      }
    });
    
  } catch (error) {
    console.error('批量生成报告错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// @desc    批量下载报告
// @route   GET /api/reports/batch-download
// @access  Private
const batchDownloadReports = async (req, res) => {
  try {
    const { report_ids } = req.query;
    
    if (!report_ids) {
      return res.status(400).json({ success: false, message: '请提供报告ID列表' });
    }
    
    const reportIdArray = report_ids.split(',').map(id => id.trim());
    
    if (reportIdArray.length === 0) {
      return res.status(400).json({ success: false, message: '请提供有效的报告ID列表' });
    }
    
    // 限制最大下载数量
    if (reportIdArray.length > 50) {
      return res.status(400).json({ success: false, message: '单次批量下载报告数量不能超过50份' });
    }
    
    // 获取报告信息
    const reports = await Report.find({ _id: { $in: reportIdArray } });
    
    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: '未找到匹配的报告' });
    }
    
    // 如果只有一份报告，直接下载
    if (reports.length === 1) {
      const report = reports[0];
      if (report.format === 'pdf' && report.pdf_url) {
        const pdfPath = path.join(__dirname, `..${report.pdf_url}`);
        if (fs.existsSync(pdfPath)) {
          res.download(pdfPath, `${report.title}.pdf`);
        } else {
          res.status(404).json({ success: false, message: 'PDF文件不存在' });
        }
      } else {
        res.send(report.content);
      }
      return;
    }
    
    // 多份报告，准备打包下载
    // 这里简化处理，返回报告列表，实际项目中应该实现打包下载功能
    res.status(200).json({
      success: true,
      message: `找到${reports.length}份报告，支持单独下载`,
      data: reports.map(report => ({
        id: report._id,
        title: report.title,
        format: report.format,
        download_url: `/api/reports/download/${report._id}`,
        pdf_url: report.pdf_url
      }))
    });
    
  } catch (error) {
    console.error('批量下载报告错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getReports,
  getReportById,
  createReport,
  generateReport,
  downloadReport,
  updateReport,
  deleteReport,
  batchGenerateReports,
  batchDownloadReports
};