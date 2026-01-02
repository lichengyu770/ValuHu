const IndustryStandard = require('../models/IndustryStandard');
const fs = require('fs');
const path = require('path');

/**
 * 行业标准控制器，处理行业标准的CRUD操作和管理功能
 */
const industryStandardController = {
  /**
   * 获取行业标准列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getIndustryStandards(req, res) {
    try {
      const { type, status, page = 1, limit = 10 } = req.query;
      
      let query = {};
      if (type) {
        query.type = type;
      }
      if (status) {
        query.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const [standards, total] = await Promise.all([
        IndustryStandard.find(query)
          .populate('creatorId', 'name email')
          .populate('relatedStandards', 'name standardNumber')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        IndustryStandard.countDocuments(query)
      ]);
      
      res.status(200).json({
        success: true,
        standards,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('获取行业标准列表错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取单个行业标准详情
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getIndustryStandardById(req, res) {
    try {
      const standard = await IndustryStandard.findById(req.params.id)
        .populate('creatorId', 'name email')
        .populate('relatedStandards', 'name standardNumber');
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      res.status(200).json({ success: true, standard });
    } catch (error) {
      console.error('获取行业标准详情错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 创建行业标准
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async createIndustryStandard(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: '请上传标准文件' });
      }
      
      const { standardNumber, name, type, version, issuingBody, issueDate, implementationDate, scope, terminology, scoringWeights, relatedStandards } = req.body;
      
      // 解析术语定义
      let parsedTerminology = [];
      if (terminology) {
        parsedTerminology = typeof terminology === 'string' ? JSON.parse(terminology) : terminology;
      }
      
      // 解析评分权重
      let parsedScoringWeights = {};
      if (scoringWeights) {
        parsedScoringWeights = typeof scoringWeights === 'string' ? JSON.parse(scoringWeights) : scoringWeights;
      }
      
      // 解析相关标准
      let parsedRelatedStandards = [];
      if (relatedStandards) {
        parsedRelatedStandards = typeof relatedStandards === 'string' ? JSON.parse(relatedStandards) : relatedStandards;
      }
      
      // 保存行业标准记录
      const standard = await IndustryStandard.create({
        standardNumber,
        name,
        type,
        version,
        issuingBody,
        issueDate: new Date(issueDate),
        implementationDate: new Date(implementationDate),
        scope,
        terminology: parsedTerminology,
        scoringWeights: parsedScoringWeights,
        relatedStandards: parsedRelatedStandards,
        content: req.body.content,
        fileUrl: `/uploads/${req.file.filename}`,
        creatorId: req.user.id
      });
      
      res.status(201).json({ success: true, standard, message: '行业标准创建成功' });
    } catch (error) {
      console.error('创建行业标准错误:', error);
      res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
  },

  /**
   * 更新行业标准
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async updateIndustryStandard(req, res) {
    try {
      const standard = await IndustryStandard.findById(req.params.id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 解析术语定义
      let parsedTerminology = standard.terminology;
      if (req.body.terminology) {
        parsedTerminology = typeof req.body.terminology === 'string' ? JSON.parse(req.body.terminology) : req.body.terminology;
      }
      
      // 解析评分权重
      let parsedScoringWeights = standard.scoringWeights;
      if (req.body.scoringWeights) {
        parsedScoringWeights = typeof req.body.scoringWeights === 'string' ? JSON.parse(req.body.scoringWeights) : req.body.scoringWeights;
      }
      
      // 解析相关标准
      let parsedRelatedStandards = standard.relatedStandards;
      if (req.body.relatedStandards) {
        parsedRelatedStandards = typeof req.body.relatedStandards === 'string' ? JSON.parse(req.body.relatedStandards) : req.body.relatedStandards;
      }
      
      // 如果上传了新文件，更新文件URL
      if (req.file) {
        // 删除旧文件
        const oldFilePath = path.join(__dirname, '..', standard.fileUrl.substring(1));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
        req.body.fileUrl = `/uploads/${req.file.filename}`;
      }
      
      // 更新行业标准
      const updatedStandard = await IndustryStandard.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          terminology: parsedTerminology,
          scoringWeights: parsedScoringWeights,
          relatedStandards: parsedRelatedStandards
        },
        { new: true, runValidators: true }
      );
      
      res.status(200).json({ success: true, standard: updatedStandard, message: '行业标准更新成功' });
    } catch (error) {
      console.error('更新行业标准错误:', error);
      res.status(500).json({ success: false, message: error.message || '服务器错误' });
    }
  },

  /**
   * 删除行业标准
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async deleteIndustryStandard(req, res) {
    try {
      const standard = await IndustryStandard.findById(req.params.id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 删除对应的文件
      const filePath = path.join(__dirname, '..', standard.fileUrl.substring(1));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 删除行业标准记录
      await standard.remove();
      
      res.status(200).json({ success: true, message: '行业标准删除成功' });
    } catch (error) {
      console.error('删除行业标准错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 审核行业标准
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async reviewIndustryStandard(req, res) {
    try {
      const { status, comments } = req.body;
      const standard = await IndustryStandard.findById(req.params.id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 更新审核状态
      standard.status = status;
      
      // 添加审核记录
      standard.reviewHistory.push({
        reviewerId: req.user.id,
        reviewerName: req.user.name || req.user.email,
        reviewDate: new Date(),
        status,
        comments
      });
      
      await standard.save();
      
      res.status(200).json({ success: true, standard, message: '行业标准审核成功' });
    } catch (error) {
      console.error('审核行业标准错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 下载行业标准文件
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async downloadIndustryStandard(req, res) {
    try {
      const standard = await IndustryStandard.findById(req.params.id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 更新使用统计
      await standard.updateUsage(req.user.enterpriseId || req.user.id);
      
      // 发送文件下载
      const filePath = path.join(__dirname, '..', standard.fileUrl.substring(1));
      if (fs.existsSync(filePath)) {
        res.download(filePath, `${standard.standardNumber}-${standard.name}-${standard.version}.${standard.fileUrl.split('.').pop()}`);
      } else {
        res.status(404).json({ success: false, message: '文件不存在' });
      }
    } catch (error) {
      console.error('下载行业标准错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取标准采用情况报告
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getAdoptionReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const query = {};
      if (startDate && endDate) {
        query.issueDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const standards = await IndustryStandard.find(query)
        .select('name standardNumber type usageStats issueDate');
      
      // 生成采用情况报告
      const report = {
        reportDate: new Date().toISOString(),
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        totalStandards: standards.length,
        standardsByType: {},
        adoptionSummary: {
          totalDownloads: 0,
          totalEnterprises: 0,
          mostAdoptedStandard: null,
          adoptionByType: {}
        },
        detailedAdoption: standards.map(standard => {
          const enterpriseCount = standard.usageStats.adoptionByEnterprises.size;
          return {
            name: standard.name,
            standardNumber: standard.standardNumber,
            type: standard.type,
            issueDate: standard.issueDate,
            totalDownloads: standard.usageStats.totalDownloads,
            enterpriseCount,
            adoptionByEnterprise: Object.fromEntries(standard.usageStats.adoptionByEnterprises)
          };
        })
      };
      
      // 计算采用统计
      const allEnterprises = new Set();
      
      standards.forEach(standard => {
        // 按标准类型统计
        report.standardsByType[standard.type] = (report.standardsByType[standard.type] || 0) + 1;
        
        // 总下载量
        report.adoptionSummary.totalDownloads += standard.usageStats.totalDownloads;
        
        // 企业数量
        const enterpriseCount = standard.usageStats.adoptionByEnterprises.size;
        
        // 按类型统计采用情况
        report.adoptionSummary.adoptionByType[standard.type] = 
          (report.adoptionSummary.adoptionByType[standard.type] || 0) + enterpriseCount;
        
        // 收集所有企业
        for (const enterpriseId of standard.usageStats.adoptionByEnterprises.keys()) {
          allEnterprises.add(enterpriseId);
        }
        
        // 最常采用的标准
        if (!report.adoptionSummary.mostAdoptedStandard || 
            enterpriseCount > report.adoptionSummary.mostAdoptedStandard.enterpriseCount) {
          report.adoptionSummary.mostAdoptedStandard = {
            name: standard.name,
            standardNumber: standard.standardNumber,
            enterpriseCount
          };
        }
      });
      
      // 总企业数
      report.adoptionSummary.totalEnterprises = allEnterprises.size;
      
      res.status(200).json({ success: true, report });
    } catch (error) {
      console.error('获取标准采用情况报告错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },

  /**
   * 获取标准合规性检查
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getComplianceCheck(req, res) {
    try {
      const { enterpriseId, standardIds } = req.body;
      
      if (!enterpriseId || !standardIds || !Array.isArray(standardIds)) {
        return res.status(400).json({ success: false, message: '请提供企业ID和标准ID列表' });
      }
      
      const standards = await IndustryStandard.find({ _id: { $in: standardIds } });
      
      // 增强的合规性检查逻辑
      const complianceResults = standards.map(standard => {
        const hasAdopted = standard.usageStats.adoptionByEnterprises.has(enterpriseId);
        const adoptionCount = hasAdopted ? standard.usageStats.adoptionByEnterprises.get(enterpriseId) : 0;
        
        // 基于标准类型的合规性评分
        let complianceScore = 0;
        if (hasAdopted) {
          switch (standard.type) {
            case 'valuation_method':
              complianceScore = adoptionCount >= 3 ? 100 : adoptionCount * 33.33;
              break;
            case 'data_format':
              complianceScore = adoptionCount >= 2 ? 100 : adoptionCount * 50;
              break;
            case 'quality_standard':
              complianceScore = adoptionCount >= 5 ? 100 : adoptionCount * 20;
              break;
            case 'security_standard':
              complianceScore = adoptionCount >= 1 ? 100 : 0;
              break;
            case 'process_standard':
              complianceScore = adoptionCount >= 4 ? 100 : adoptionCount * 25;
              break;
            default:
              complianceScore = hasAdopted ? 100 : 0;
          }
        }
        
        // 确定合规状态
        let complianceStatus = 'non_compliant';
        if (complianceScore >= 80) {
          complianceStatus = 'fully_compliant';
        } else if (complianceScore >= 50) {
          complianceStatus = 'partially_compliant';
        }
        
        return {
          standardId: standard._id,
          standardNumber: standard.standardNumber,
          name: standard.name,
          type: standard.type,
          hasAdopted,
          adoptionCount,
          lastAdoptionDate: standard.usageStats.lastDownloadedAt,
          complianceScore: parseFloat(complianceScore.toFixed(2)),
          complianceStatus
        };
      });
      
      // 计算合规率和平均合规分数
      const totalStandards = complianceResults.length;
      const compliantStandards = complianceResults.filter(result => result.complianceStatus === 'fully_compliant').length;
      const partiallyCompliantStandards = complianceResults.filter(result => result.complianceStatus === 'partially_compliant').length;
      const complianceRate = totalStandards > 0 ? (compliantStandards / totalStandards) * 100 : 0;
      const averageComplianceScore = totalStandards > 0 ? 
        complianceResults.reduce((sum, result) => sum + result.complianceScore, 0) / totalStandards : 0;
      
      // 生成合规性检查报告
      const report = {
        reportDate: new Date().toISOString(),
        enterpriseId,
        totalStandards,
        compliantStandards,
        partiallyCompliantStandards,
        nonCompliantStandards: totalStandards - compliantStandards - partiallyCompliantStandards,
        complianceRate: parseFloat(complianceRate.toFixed(2)),
        averageComplianceScore: parseFloat(averageComplianceScore.toFixed(2)),
        overallComplianceStatus: averageComplianceScore >= 80 ? 'fully_compliant' : 
                                averageComplianceScore >= 50 ? 'partially_compliant' : 'non_compliant',
        detailedResults: complianceResults,
        recommendations: this.generateComplianceRecommendations(complianceResults)
      };
      
      res.status(200).json({ success: true, report });
    } catch (error) {
      console.error('获取标准合规性检查错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 生成合规性建议
   * @param {Array} complianceResults - 合规性检查结果
   * @returns {Array} - 合规性建议列表
   */
  generateComplianceRecommendations(complianceResults) {
    const recommendations = [];
    
    // 找出不合规的标准类型
    const nonCompliantTypes = new Set();
    const partiallyCompliantTypes = new Set();
    
    complianceResults.forEach(result => {
      if (result.complianceStatus === 'non_compliant') {
        nonCompliantTypes.add(result.type);
      } else if (result.complianceStatus === 'partially_compliant') {
        partiallyCompliantTypes.add(result.type);
      }
    });
    
    // 生成建议
    if (nonCompliantTypes.has('valuation_method')) {
      recommendations.push('建议企业加强估价方法标准的培训和应用，提高标准采用率');
    }
    
    if (nonCompliantTypes.has('data_format')) {
      recommendations.push('建议企业统一数据格式，确保与行业标准保持一致');
    }
    
    if (nonCompliantTypes.has('quality_standard')) {
      recommendations.push('建议企业建立质量控制体系，严格按照行业质量标准执行');
    }
    
    if (nonCompliantTypes.has('security_standard')) {
      recommendations.push('建议企业立即采用行业安全标准，保障数据安全');
    }
    
    if (nonCompliantTypes.has('process_standard')) {
      recommendations.push('建议企业优化业务流程，使其符合行业标准要求');
    }
    
    if (partiallyCompliantTypes.size > 0) {
      recommendations.push('建议企业针对部分合规的标准类型，加强培训和监督，提高合规水平');
    }
    
    return recommendations;
  },
  
  /**
   * 发布行业标准
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async publishIndustryStandard(req, res) {
    try {
      const { id } = req.params;
      const { publishNotes } = req.body;
      
      const standard = await IndustryStandard.findById(id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 更新标准状态为已发布
      standard.status = 'published';
      
      // 添加发布记录到审核历史
      standard.reviewHistory.push({
        reviewerId: req.user.id,
        reviewerName: req.user.name || req.user.email,
        reviewDate: new Date(),
        status: 'approved',
        comments: publishNotes || '标准已发布'
      });
      
      await standard.save();
      
      res.status(200).json({ success: true, standard, message: '行业标准发布成功' });
    } catch (error) {
      console.error('发布行业标准错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 创建标准新版本
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async createNewVersion(req, res) {
    try {
      const { id } = req.params;
      const { version, content, publishNotes } = req.body;
      
      const originalStandard = await IndustryStandard.findById(id);
      
      if (!originalStandard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 创建新版本的标准
      const newStandard = new IndustryStandard({
        standardNumber: originalStandard.standardNumber,
        name: originalStandard.name,
        type: originalStandard.type,
        version: version || this.incrementVersion(originalStandard.version),
        issuingBody: originalStandard.issuingBody,
        issueDate: new Date(),
        implementationDate: new Date(),
        scope: originalStandard.scope,
        terminology: originalStandard.terminology,
        scoringWeights: originalStandard.scoringWeights,
        relatedStandards: originalStandard.relatedStandards,
        content: content || originalStandard.content,
        fileUrl: originalStandard.fileUrl,
        creatorId: req.user.id
      });
      
      await newStandard.save();
      
      // 更新原标准状态为已修订
      originalStandard.status = 'revised';
      await originalStandard.save();
      
      res.status(201).json({ 
        success: true, 
        newStandard, 
        message: '标准新版本创建成功' 
      });
    } catch (error) {
      console.error('创建标准新版本错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 版本号自动递增
   * @param {String} currentVersion - 当前版本号
   * @returns {String} - 递增后的版本号
   */
  incrementVersion(currentVersion) {
    const parts = currentVersion.split('.');
    if (parts.length === 2) {
      return `${parts[0]}.${parseInt(parts[1]) + 1}`;
    } else if (parts.length === 3) {
      return `${parts[0]}.${parts[1]}.${parseInt(parts[2]) + 1}`;
    }
    return `${currentVersion}.1`;
  },
  
  /**
   * 配置标准参数
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async configureStandardParams(req, res) {
    try {
      const { id } = req.params;
      const { scoringWeights, terminology, scope } = req.body;
      
      const standard = await IndustryStandard.findById(id);
      
      if (!standard) {
        return res.status(404).json({ success: false, message: '行业标准不存在' });
      }
      
      // 更新标准参数
      if (scoringWeights) {
        standard.scoringWeights = scoringWeights;
      }
      
      if (terminology) {
        standard.terminology = terminology;
      }
      
      if (scope) {
        standard.scope = scope;
      }
      
      await standard.save();
      
      res.status(200).json({ 
        success: true, 
        standard, 
        message: '标准参数配置成功' 
      });
    } catch (error) {
      console.error('配置标准参数错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 获取标准版本历史
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getStandardVersions(req, res) {
    try {
      const { standardNumber } = req.params;
      
      const versions = await IndustryStandard.find({ standardNumber })
        .sort({ version: 1 })
        .select('version status issueDate implementationDate creatorId');
      
      res.status(200).json({ 
        success: true, 
        standardNumber, 
        versions, 
        totalVersions: versions.length 
      });
    } catch (error) {
      console.error('获取标准版本历史错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  },
  
  /**
   * 批量检查成员单位合规性
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async batchCheckCompliance(req, res) {
    try {
      const { enterpriseIds, standardIds } = req.body;
      
      if (!enterpriseIds || !Array.isArray(enterpriseIds) || 
          !standardIds || !Array.isArray(standardIds)) {
        return res.status(400).json({ success: false, message: '请提供企业ID列表和标准ID列表' });
      }
      
      // 批量检查每个企业的合规性
      const batchResults = await Promise.all(enterpriseIds.map(async (enterpriseId) => {
        const standards = await IndustryStandard.find({ _id: { $in: standardIds } });
        
        const complianceResults = standards.map(standard => {
          const hasAdopted = standard.usageStats.adoptionByEnterprises.has(enterpriseId);
          const adoptionCount = hasAdopted ? standard.usageStats.adoptionByEnterprises.get(enterpriseId) : 0;
          
          // 计算合规分数
          let complianceScore = 0;
          if (hasAdopted) {
            switch (standard.type) {
              case 'valuation_method':
                complianceScore = adoptionCount >= 3 ? 100 : adoptionCount * 33.33;
                break;
              case 'data_format':
                complianceScore = adoptionCount >= 2 ? 100 : adoptionCount * 50;
                break;
              case 'quality_standard':
                complianceScore = adoptionCount >= 5 ? 100 : adoptionCount * 20;
                break;
              case 'security_standard':
                complianceScore = adoptionCount >= 1 ? 100 : 0;
                break;
              case 'process_standard':
                complianceScore = adoptionCount >= 4 ? 100 : adoptionCount * 25;
                break;
              default:
                complianceScore = hasAdopted ? 100 : 0;
            }
          }
          
          return {
            standardId: standard._id,
            standardNumber: standard.standardNumber,
            name: standard.name,
            type: standard.type,
            complianceScore: parseFloat(complianceScore.toFixed(2))
          };
        });
        
        // 计算企业的平均合规分数
        const averageComplianceScore = complianceResults.reduce((sum, result) => sum + result.complianceScore, 0) / complianceResults.length;
        
        return {
          enterpriseId,
          complianceResults,
          averageComplianceScore: parseFloat(averageComplianceScore.toFixed(2)),
          overallStatus: averageComplianceScore >= 80 ? 'fully_compliant' : 
                        averageComplianceScore >= 50 ? 'partially_compliant' : 'non_compliant'
        };
      }));
      
      // 生成批量合规性报告
      const report = {
        reportDate: new Date().toISOString(),
        totalEnterprises: enterpriseIds.length,
        totalStandards: standardIds.length,
        fullyCompliantCount: batchResults.filter(result => result.overallStatus === 'fully_compliant').length,
        partiallyCompliantCount: batchResults.filter(result => result.overallStatus === 'partially_compliant').length,
        nonCompliantCount: batchResults.filter(result => result.overallStatus === 'non_compliant').length,
        averageComplianceRate: parseFloat(
          (batchResults.reduce((sum, result) => sum + result.averageComplianceScore, 0) / batchResults.length).toFixed(2)
        ),
        detailedResults: batchResults
      };
      
      res.status(200).json({ success: true, report });
    } catch (error) {
      console.error('批量检查成员单位合规性错误:', error);
      res.status(500).json({ success: false, message: '服务器错误' });
    }
  }
};

module.exports = industryStandardController;