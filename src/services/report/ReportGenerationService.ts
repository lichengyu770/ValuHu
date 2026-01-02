import { PropertyInfo, ValuationResult } from '../utils/valuationAlgorithms';
import { HistoryRecord } from './HistoryDataService';
import wpsService from './WpsService';

// 报告类型定义
export enum ReportType {
  BASIC = 'basic',
  DETAILED = 'detailed',
  COMPARATIVE = 'comparative',
  STATISTICAL = 'statistical',
  CUSTOM = 'custom',
}

// 报告格式定义
export enum ReportFormat {
  HTML = 'html',
  PDF = 'pdf',
  WORD = 'word',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

// 报告模板类型
export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  fields: string[];
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

// 报告生成参数
export interface ReportGenerationParams {
  templateId: string;
  property: PropertyInfo;
  valuationResults: ValuationResult[];
  historyRecords?: HistoryRecord[];
  customFields?: string[];
  title?: string;
  author?: string;
  notes?: string;
  includeCharts?: boolean;
  chartTypes?: string[];
  useWps?: boolean;
  wpsTemplateId?: string;
}

// 报告内容
export interface ReportContent {
  id: string;
  title: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  format: ReportFormat;
  metadata: {
    templateId: string;
    propertyId: string;
    valuationResultIds: string[];
    historyRecordIds?: string[];
    includeCharts: boolean;
    chartTypes: string[];
  };
}

// 报告生成服务
export class ReportGenerationService {
  private storageKey = 'valuation-report-templates';
  private reportStorageKey = 'valuation-generated-reports';

  // 获取所有报告模板
  getAllTemplates(): ReportTemplate[] {
    const templatesJson = localStorage.getItem(this.storageKey);
    if (!templatesJson) {
      // 如果没有模板，创建默认模板
      const defaultTemplates = this.createDefaultTemplates();
      this.saveTemplates(defaultTemplates);
      return defaultTemplates;
    }

    try {
      const templates = JSON.parse(templatesJson);
      return templates.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse report templates:', error);
      return this.createDefaultTemplates();
    }
  }

  // 创建默认模板
  private createDefaultTemplates(): ReportTemplate[] {
    return [
      {
        id: 'template-basic-001',
        name: '基础估价报告',
        type: ReportType.BASIC,
        description: '包含基本房产信息和估价结果的报告',
        fields: ['propertyInfo', 'valuationResults', 'averagePrice'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-detailed-001',
        name: '详细估价报告',
        type: ReportType.DETAILED,
        description: '包含详细房产信息、估价过程和结果分析的报告',
        fields: [
          'propertyInfo',
          'valuationResults',
          'valuationDetails',
          'averagePrice',
          'unitPrice',
          'confidenceAnalysis',
          'valuationFactors',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-comparative-001',
        name: '比较估价报告',
        type: ReportType.COMPARATIVE,
        description: '包含历史估价记录比较分析的报告',
        fields: [
          'propertyInfo',
          'valuationResults',
          'historyComparison',
          'priceTrend',
          'averagePrice',
          'marketComparison',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-statistical-001',
        name: '统计分析报告',
        type: ReportType.STATISTICAL,
        description: '包含统计数据和图表分析的报告',
        fields: [
          'propertyInfo',
          'valuationResults',
          'statistics',
          'charts',
          'averagePrice',
          'unitPrice',
          'distributionAnalysis',
          'correlationAnalysis',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-simple-001',
        name: '简洁估价报告',
        type: ReportType.BASIC,
        description: '简洁的估价报告，适合快速查看',
        fields: ['propertyInfo', 'valuationResults', 'averagePrice'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-professional-001',
        name: '专业估价报告',
        type: ReportType.DETAILED,
        description: '专业的正式估价报告，适合正式场合',
        fields: [
          'propertyInfo',
          'valuationResults',
          'valuationDetails',
          'averagePrice',
          'unitPrice',
          'confidenceAnalysis',
          'valuationFactors',
          'riskAssessment',
          'marketTrends',
          'recommendations',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-chart-001',
        name: '图表估价报告',
        type: ReportType.STATISTICAL,
        description: '侧重于数据可视化的估价报告',
        fields: [
          'propertyInfo',
          'valuationResults',
          'charts',
          'priceTrend',
          'distributionAnalysis',
          'comparisonCharts',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-comparison-001',
        name: '多房产对比报告',
        type: ReportType.COMPARATIVE,
        description: '对比多个房产的估价结果',
        fields: [
          'propertyInfo',
          'valuationResults',
          'propertyComparison',
          'priceComparison',
          'factorComparison',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
      {
        id: 'template-market-001',
        name: '市场分析报告',
        type: ReportType.STATISTICAL,
        description: '包含详细市场分析的估价报告',
        fields: [
          'propertyInfo',
          'valuationResults',
          'marketAnalysis',
          'priceTrend',
          'supplyDemand',
          'marketForecast',
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: true,
      },
    ];
  }

  // 保存模板
  private saveTemplates(templates: ReportTemplate[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(templates));
  }

  // 获取模板
  getTemplateById(id: string): ReportTemplate | null {
    const templates = this.getAllTemplates();
    return templates.find((template) => template.id === id) || null;
  }

  // 创建模板
  createTemplate(
    template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): ReportTemplate {
    const templates = this.getAllTemplates();

    const newTemplate: ReportTemplate = {
      ...template,
      id: `template-${template.type}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    templates.push(newTemplate);
    this.saveTemplates(templates);

    return newTemplate;
  }

  // 更新模板
  updateTemplate(
    id: string,
    updates: Partial<ReportTemplate>
  ): ReportTemplate | null {
    const templates = this.getAllTemplates();
    const index = templates.findIndex((template) => template.id === id);

    if (index === -1) {
      return null;
    }

    const updatedTemplate: ReportTemplate = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    };

    templates[index] = updatedTemplate;
    this.saveTemplates(templates);

    return updatedTemplate;
  }

  // 删除模板
  deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates();
    const filteredTemplates = templates.filter(
      (template) => template.id !== id && !template.isDefault
    );

    if (filteredTemplates.length === templates.length) {
      return false;
    }

    this.saveTemplates(filteredTemplates);
    return true;
  }

  // 生成报告
  async generateReport(
    params: ReportGenerationParams,
    format: ReportFormat
  ): Promise<ReportContent> {
    const template = this.getTemplateById(params.templateId);
    if (!template) {
      throw new Error(`模板不存在: ${params.templateId}`);
    }

    let content: string;
    
    // 如果使用WPS生成报告
    if (params.useWps) {
      content = await this.generateWpsReport(params, template, format);
    } else {
      // 否则使用传统方式生成报告内容
      content = this.generateReportContent(params, template, format);
    }

    const report: ReportContent = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title:
        params.title ||
        `${template.name} - ${params.property.city} ${params.property.district}`,
      author: params.author || '系统',
      createdAt: new Date(),
      updatedAt: new Date(),
      content,
      format,
      metadata: {
        templateId: params.templateId,
        propertyId: `${params.property.city}-${params.property.district}-${params.property.area}`,
        valuationResultIds: params.valuationResults.map((result) => result.id),
        historyRecordIds: params.historyRecords?.map((record) => record.id),
        includeCharts: params.includeCharts || false,
        chartTypes: params.chartTypes || [],
      },
    };

    // 保存报告
    this.saveReport(report);

    return report;
  }

  // 生成报告内容
  private generateReportContent(
    params: ReportGenerationParams,
    template: ReportTemplate,
    format: ReportFormat
  ): string {
    // 根据格式生成不同内容
    switch (format) {
      case ReportFormat.HTML:
        return this.generateHTMLReport(params, template);
      case ReportFormat.JSON:
        return this.generateJSONReport(params, template);
      case ReportFormat.CSV:
        return this.generateCSVReport(params, template);
      case ReportFormat.PDF:
        return this.generatePDFReport(params, template);
      case ReportFormat.EXCEL:
        return this.generateExcelReport(params, template);
      case ReportFormat.WORD:
        // WORD格式需要更复杂的处理，这里简化实现
        return this.generateHTMLReport(params, template);
      default:
        throw new Error(`不支持的报告格式: ${format}`);
    }
  }

  // 生成WPS报告
  private async generateWpsReport(
    params: ReportGenerationParams,
    template: ReportTemplate,
    format: ReportFormat
  ): Promise<string> {
    try {
      // 转换报告格式为WPS支持的格式
      const wpsFormatMap: Record<ReportFormat, 'docx' | 'pdf' | 'html'> = {
        [ReportFormat.WORD]: 'docx',
        [ReportFormat.PDF]: 'pdf',
        [ReportFormat.HTML]: 'html',
        // 默认转换为docx格式
        [ReportFormat.EXCEL]: 'docx',
        [ReportFormat.CSV]: 'docx',
        [ReportFormat.JSON]: 'docx',
      };

      const wpsOutputFormat = wpsFormatMap[format] || 'docx';

      // 准备WPS生成参数
      const wpsParams = {
        templateId: params.wpsTemplateId || 'default-valuation-template',
        data: {
          property: params.property,
          valuationResults: params.valuationResults,
          template: template,
          metadata: {
            title: params.title || `${template.name} - ${params.property.city} ${params.property.district}`,
            author: params.author || '系统',
            createdAt: new Date().toISOString(),
            includeCharts: params.includeCharts || false,
          },
        },
        outputFormat: wpsOutputFormat,
        title: params.title || `${template.name} - ${params.property.city} ${params.property.district}`,
      };

      // 调用WPS服务生成报告
      const documentInfo = await wpsService.generateDocument(wpsParams);

      // 返回WPS生成的报告信息JSON字符串
      return JSON.stringify(documentInfo);
    } catch (error) {
      console.error('WPS报告生成失败:', error);
      // 如果WPS生成失败，降级使用传统方式生成报告
      return this.generateReportContent(params, template, format);
    }
  }

  // 生成HTML报告
  private generateHTMLReport(
    params: ReportGenerationParams,
    _template: ReportTemplate
  ): string {
    const { property, valuationResults, historyRecords } = params;
    const averagePrice =
      valuationResults.reduce((sum, result) => sum + result.price, 0) /
      valuationResults.length;
    const averageUnitPrice =
      valuationResults.reduce((sum, result) => sum + result.unitPrice, 0) /
      valuationResults.length;

    // HTML模板
    let html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${params.title || template.name}</title>
        <style>
          body {
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          .report-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007AFF;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 10px;
          }
          .report-meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 4px solid #007AFF;
          }
          .property-info {
            background-color: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .results-table th,
          .results-table td {
            border: 1px solid #e0e0e0;
            padding: 12px;
            text-align: left;
          }
          .results-table th {
            background-color: #f0f8ff;
            font-weight: bold;
            color: #333;
          }
          .results-table tr:nth-child(even) {
            background-color: #f5f5f5;
          }
          .chart-container {
            margin: 20px 0;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 8px;
          }
          .chart-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #555;
          }
          .average-section {
            background-color: #e8f5e8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .average-item {
            display: inline-block;
            margin-right: 30px;
            font-size: 16px;
          }
          .average-label {
            font-weight: bold;
            color: #4CAF50;
          }
          .average-value {
            font-size: 18px;
            font-weight: bold;
            color: #2E7D32;
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">${params.title || template.name}</div>
          <div class="report-meta">作者: ${params.author || '系统'}</div>
          <div class="report-meta">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
          <div class="report-meta">报告类型: ${template.name}</div>
        </div>
    `;

    // 房产信息部分
    if (template.fields.includes('propertyInfo')) {
      html += `
        <div class="section">
          <div class="section-title">房产基本信息</div>
          <div class="property-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">城市:</span>
                <span class="info-value">${property.city}</span>
              </div>
              <div class="info-item">
                <span class="info-label">区域:</span>
                <span class="info-value">${property.district}</span>
              </div>
              <div class="info-item">
                <span class="info-label">小区名称:</span>
                <span class="info-value">${property.community || '未提供'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">房屋类型:</span>
                <span class="info-value">${property.buildingType}</span>
              </div>
              <div class="info-item">
                <span class="info-label">建筑面积:</span>
                <span class="info-value">${property.area} 平方米</span>
              </div>
              <div class="info-item">
                <span class="info-label">楼层:</span>
                <span class="info-value">${property.floor || '未提供'}/${property.totalFloors || '未提供'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">朝向:</span>
                <span class="info-value">${property.orientation || '未提供'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">装修情况:</span>
                <span class="info-value">${property.decoration || '未提供'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">房龄:</span>
                <span class="info-value">${property.age || '未提供'} 年</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 估价结果部分
    if (
      template.fields.includes('valuationResults') ||
      template.fields.includes('averagePrice')
    ) {
      html += `
        <div class="section">
          <div class="section-title">估价结果</div>
          <table class="results-table">
            <thead>
              <tr>
                <th>估价方法</th>
                <th>总价 (元)</th>
                <th>单价 (元/平方米)</th>
                <th>置信度</th>
                <th>生成时间</th>
              </tr>
            </thead>
            <tbody>
      `;

      valuationResults.forEach((result) => {
        html += `
          <tr>
            <td>${result.algorithm}</td>
            <td>${result.price.toLocaleString('zh-CN')}</td>
            <td>${result.unitPrice.toLocaleString('zh-CN')}</td>
            <td>${result.confidence}%</td>
            <td>${new Date(result.timestamp).toLocaleString('zh-CN')}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
      `;

      // 平均价格
      if (
        template.fields.includes('averagePrice') ||
        template.fields.includes('unitPrice')
      ) {
        html += `
          <div class="average-section">
            <div class="average-item">
              <span class="average-label">平均总价:</span>
              <span class="average-value">${averagePrice.toLocaleString('zh-CN')} 元</span>
            </div>
            <div class="average-item">
              <span class="average-label">平均单价:</span>
              <span class="average-value">${averageUnitPrice.toLocaleString('zh-CN')} 元/平方米</span>
            </div>
          </div>
        `;
      }

      html += `
        </div>
      `;
    }

    // 历史比较部分
    if (
      template.fields.includes('historyComparison') &&
      historyRecords &&
      historyRecords.length > 0
    ) {
      html += `
        <div class="section">
          <div class="section-title">历史记录比较</div>
          <table class="results-table">
            <thead>
              <tr>
                <th>记录时间</th>
                <th>平均总价 (元)</th>
                <th>平均单价 (元/平方米)</th>
                <th>算法数量</th>
              </tr>
            </thead>
            <tbody>
      `;

      historyRecords.forEach((record) => {
        html += `
          <tr>
            <td>${new Date(record.createdAt).toLocaleString('zh-CN')}</td>
            <td>${record.averagePrice.toLocaleString('zh-CN')}</td>
            <td>${record.averageUnitPrice.toLocaleString('zh-CN')}</td>
            <td>${record.results.length}</td>
          </tr>
        `;
      });

      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // 自定义内容
    if (params.notes) {
      html += `
        <div class="section">
          <div class="section-title">备注</div>
          <div style="padding: 15px; background-color: #fff3cd; border: 1px solid #ffeeba; border-radius: 8px;">
            ${params.notes}
          </div>
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    return html;
  }

  // 生成JSON报告
  private generateJSONReport(
    params: ReportGenerationParams,
    template: ReportTemplate
  ): string {
    const reportData = {
      title: params.title || template.name,
      author: params.author || '系统',
      createdAt: new Date(),
      template: template,
      property: params.property,
      valuationResults: params.valuationResults,
      historyRecords: params.historyRecords,
      averagePrice:
        params.valuationResults.reduce((sum, result) => sum + result.price, 0) /
        params.valuationResults.length,
      averageUnitPrice:
        params.valuationResults.reduce(
          (sum, result) => sum + result.unitPrice,
          0
        ) / params.valuationResults.length,
      notes: params.notes,
    };

    return JSON.stringify(reportData, null, 2);
  }

  // 生成CSV报告
  private generateCSVReport(
    params: ReportGenerationParams,
    _template: ReportTemplate
  ): string {
    const headers = [
      '算法',
      '总价(元)',
      '单价(元/平方米)',
      '置信度(%)',
      '生成时间',
    ];
    const rows = params.valuationResults.map((result) => [
      result.algorithm,
      result.price,
      result.unitPrice,
      result.confidence,
      new Date(result.timestamp).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csvContent;
  }

  // 保存报告
  private saveReport(report: ReportContent): void {
    const reports = this.getAllGeneratedReports();
    reports.push(report);
    localStorage.setItem(this.reportStorageKey, JSON.stringify(reports));
  }

  // 获取所有生成的报告
  getAllGeneratedReports(): ReportContent[] {
    const reportsJson = localStorage.getItem(this.reportStorageKey);
    if (!reportsJson) {
      return [];
    }

    try {
      const reports = JSON.parse(reportsJson);
      return reports.map((report: any) => ({
        ...report,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to parse generated reports:', error);
      return [];
    }
  }

  // 获取生成的报告
  getGeneratedReportById(id: string): ReportContent | null {
    const reports = this.getAllGeneratedReports();
    return reports.find((report) => report.id === id) || null;
  }

  // 删除生成的报告
  deleteGeneratedReport(id: string): boolean {
    const reports = this.getAllGeneratedReports();
    const filteredReports = reports.filter((report) => report.id !== id);

    if (filteredReports.length === reports.length) {
      return false;
    }

    localStorage.setItem(
      this.reportStorageKey,
      JSON.stringify(filteredReports)
    );
    return true;
  }

  // 生成PDF报告
  private generatePDFReport(
    params: ReportGenerationParams,
    template: ReportTemplate
  ): string {
    // 使用HTML内容生成PDF
    const htmlContent = this.generateHTMLReport(params, template);
    
    // 这里返回HTML内容，在导出时会使用html2pdf.js进行转换
    return htmlContent;
  }

  // 生成Excel报告
  private generateExcelReport(
    params: ReportGenerationParams,
    _: ReportTemplate
  ): string {
    const { property, valuationResults } = params;
    
    // 准备Excel数据
    const excelData = {
      propertyInfo: [
        ['城市', property.city],
        ['区域', property.district],
        ['小区名称', property.community || '未提供'],
        ['房屋类型', property.buildingType],
        ['建筑面积', `${property.area} 平方米`],
        ['楼层', `${property.floor || '未提供'}/${property.totalFloors || '未提供'}`],
        ['朝向', property.orientation || '未提供'],
        ['装修情况', property.decoration || '未提供'],
        ['房龄', `${property.age || '未提供'} 年`],
      ],
      valuationResults: [
        ['估价方法', '总价 (元)', '单价 (元/平方米)', '置信度', '生成时间'],
        ...valuationResults.map(result => [
          result.algorithm,
          result.price,
          result.unitPrice,
          `${result.confidence}%`,
          new Date(result.timestamp).toLocaleString('zh-CN')
        ])
      ],
      summary: [
        ['平均总价 (元)', valuationResults.reduce((sum, r) => sum + r.price, 0) / valuationResults.length],
        ['平均单价 (元/平方米)', valuationResults.reduce((sum, r) => sum + r.unitPrice, 0) / valuationResults.length],
      ]
    };
    
    // 返回JSON格式的Excel数据，在导出时会使用xlsx库进行转换
    return JSON.stringify(excelData);
  }

  // 导出报告
  exportReport(report: ReportContent): void {
    if (report.format === ReportFormat.PDF) {
      this.exportPDFReport(report);
    } else if (report.format === ReportFormat.EXCEL) {
      this.exportExcelReport(report);
    } else {
      // 其他格式直接下载
      const blob = new Blob([report.content], {
        type: this.getMimeType(report.format),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // 导出PDF报告
  private exportPDFReport(report: ReportContent): void {
    // 创建临时DOM元素
    const tempElement = document.createElement('div');
    tempElement.innerHTML = report.content;
    tempElement.style.position = 'fixed';
    tempElement.style.left = '-9999px';
    document.body.appendChild(tempElement);

    // 使用html2pdf.js生成PDF
    import('html2pdf.js').then((html2pdf) => {
      const opt = {
        margin: 1,
        filename: `${report.title}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf.default().set(opt).from(tempElement).save().then(() => {
        // 移除临时元素
        document.body.removeChild(tempElement);
      });
    });
  }

  // 导出Excel报告
  private exportExcelReport(report: ReportContent): void {
    import('xlsx').then((XLSX) => {
      const excelData = JSON.parse(report.content);
      const wb = XLSX.utils.book_new();

      // 添加房产信息工作表
      const propertyWs = XLSX.utils.aoa_to_sheet(excelData.propertyInfo);
      XLSX.utils.book_append_sheet(wb, propertyWs, '房产信息');

      // 添加估价结果工作表
      const valuationWs = XLSX.utils.aoa_to_sheet(excelData.valuationResults);
      XLSX.utils.book_append_sheet(wb, valuationWs, '估价结果');

      // 添加汇总信息工作表
      const summaryWs = XLSX.utils.aoa_to_sheet(excelData.summary);
      XLSX.utils.book_append_sheet(wb, summaryWs, '汇总信息');

      // 生成并下载Excel文件
      XLSX.writeFile(wb, `${report.title}.xlsx`);
    });
  }

  // 获取MIME类型
  private getMimeType(format: ReportFormat): string {
    switch (format) {
      case ReportFormat.HTML:
        return 'text/html';
      case ReportFormat.JSON:
        return 'application/json';
      case ReportFormat.CSV:
        return 'text/csv';
      case ReportFormat.PDF:
        return 'application/pdf';
      case ReportFormat.WORD:
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case ReportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}

// 创建单例实例
export const reportGenerationService = new ReportGenerationService();
