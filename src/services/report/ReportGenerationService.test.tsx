import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportGenerationService, ReportFormat, ReportType } from './ReportGenerationService';
import { PropertyInfo, ValuationResult } from '../utils/valuationAlgorithms';
import { HistoryRecord } from './HistoryDataService';
import wpsService from './WpsService';

// 模拟WPS服务
vi.mock('./WpsService');
const mockedWpsService = wpsService as vi.Mocked<typeof wpsService>;

describe('ReportGenerationService', () => {
  let reportService: ReportGenerationService;
  
  // 模拟数据
  const mockProperty: PropertyInfo = {
    city: '北京',
    district: '朝阳区',
    community: '测试小区',
    buildingType: 'apartment',
    area: 120,
    floor: 5,
    totalFloors: 10,
    orientation: 'south',
    decoration: 'medium',
    age: 8,
    lotRatio: 2.5,
    greenRatio: 30,
    nearbyFacilities: ['school', 'hospital', 'park'],
    constructionYear: 2015
  };

  const mockValuationResults: ValuationResult[] = [
    {
      id: 'result-1',
      algorithm: 'basic',
      price: 1200000,
      unitPrice: 10000,
      confidence: 90,
      timestamp: new Date(),
      details: {
        factors: { buildingType: 1.0, floor: 1.0, orientation: 1.0, decoration: 1.0 },
        trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
        comparableProperties: []
      },
      propertyInfo: mockProperty,
      propertyId: 'beijing-chaoyang-120'
    }
  ];

  const mockHistoryRecords: HistoryRecord[] = [
    {
      id: 'history-1',
      property: mockProperty,
      valuationResult: mockValuationResults[0],
      timestamp: new Date(),
      notes: '测试记录'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    reportService = new ReportGenerationService();
    
    // 清除localStorage中的模板数据
    localStorage.removeItem('valuation-report-templates');
    localStorage.removeItem('valuation-generated-reports');
  });

  describe('template management', () => {
    it('should get all templates successfully', () => {
      const templates = reportService.getAllTemplates();
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should get template by id successfully', () => {
      const templates = reportService.getAllTemplates();
      const templateId = templates[0].id;
      
      const template = reportService.getTemplateById(templateId);
      expect(template).not.toBeNull();
      expect(template?.id).toBe(templateId);
    });

    it('should return null for non-existent template', () => {
      const template = reportService.getTemplateById('non-existent-template-id');
      expect(template).toBeNull();
    });

    it('should create new template successfully', () => {
      const newTemplate = reportService.createTemplate({
        name: '测试模板',
        type: ReportType.BASIC,
        description: '测试模板描述',
        fields: ['propertyInfo', 'valuationResults'],
        isDefault: false
      });
      
      expect(newTemplate).toBeDefined();
      expect(newTemplate.id).toBeDefined();
      expect(newTemplate.name).toBe('测试模板');
      expect(newTemplate.type).toBe(ReportType.BASIC);
      
      // 验证模板是否已保存
      const templates = reportService.getAllTemplates();
      expect(templates.some(t => t.id === newTemplate.id)).toBe(true);
    });

    it('should update template successfully', () => {
      // 创建测试模板
      const newTemplate = reportService.createTemplate({
        name: '测试模板',
        type: ReportType.BASIC,
        description: '测试模板描述',
        fields: ['propertyInfo', 'valuationResults'],
        isDefault: false
      });
      
      // 更新模板
      const updatedTemplate = reportService.updateTemplate(newTemplate.id, {
        name: '更新后的测试模板',
        description: '更新后的测试模板描述'
      });
      
      expect(updatedTemplate).not.toBeNull();
      expect(updatedTemplate?.name).toBe('更新后的测试模板');
      expect(updatedTemplate?.description).toBe('更新后的测试模板描述');
      
      // 验证模板是否已更新
      const template = reportService.getTemplateById(newTemplate.id);
      expect(template?.name).toBe('更新后的测试模板');
    });

    it('should delete template successfully', () => {
      // 创建测试模板
      const newTemplate = reportService.createTemplate({
        name: '测试模板',
        type: ReportType.BASIC,
        description: '测试模板描述',
        fields: ['propertyInfo', 'valuationResults'],
        isDefault: false
      });
      
      // 删除模板
      const result = reportService.deleteTemplate(newTemplate.id);
      expect(result).toBe(true);
      
      // 验证模板是否已删除
      const template = reportService.getTemplateById(newTemplate.id);
      expect(template).toBeNull();
    });

    it('should not delete default template', () => {
      // 获取默认模板
      const templates = reportService.getAllTemplates();
      const defaultTemplate = templates.find(t => t.isDefault);
      
      if (defaultTemplate) {
        // 尝试删除默认模板
        const result = reportService.deleteTemplate(defaultTemplate.id);
        expect(result).toBe(false);
        
        // 验证模板未被删除
        const template = reportService.getTemplateById(defaultTemplate.id);
        expect(template).not.toBeNull();
      }
    });
  });

  describe('report generation', () => {
    it('should generate HTML report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.HTML);
      expect(report.content).toBeDefined();
      expect(report.content.length).toBeGreaterThan(0);
    });

    it('should generate PDF report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.PDF);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.PDF);
      expect(report.content).toBeDefined();
    });

    it('should generate WORD report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.WORD);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.WORD);
      expect(report.content).toBeDefined();
    });

    it('should generate EXCEL report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.EXCEL);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.EXCEL);
      expect(report.content).toBeDefined();
    });

    it('should generate JSON report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.JSON);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.JSON);
      expect(report.content).toBeDefined();
      
      // 验证JSON格式
      const jsonContent = JSON.parse(report.content);
      expect(jsonContent).toBeInstanceOf(Object);
    });

    it('should generate CSV report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      const report = await reportService.generateReport(params, ReportFormat.CSV);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.CSV);
      expect(report.content).toBeDefined();
      expect(report.content).toContain(',');
    });

    it('should generate WPS report successfully when useWps is true', async () => {
      // 模拟WPS服务返回结果
      mockedWpsService.generateDocument.mockResolvedValue({
        documentId: 'doc-123',
        title: 'Generated Document',
        size: 1024,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        status: 'completed',
        downloadUrl: 'https://example.com/download/doc-123',
        previewUrl: 'https://example.com/preview/doc-123'
      });
      
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults,
        useWps: true,
        wpsTemplateId: 'wps-template-123'
      };
      
      const report = await reportService.generateReport(params, ReportFormat.WORD);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.WORD);
      expect(report.content).toBeDefined();
      
      // 验证WPS服务被调用
      expect(mockedWpsService.generateDocument).toHaveBeenCalledTimes(1);
    });

    it('should fallback to traditional report generation when WPS fails', async () => {
      // 模拟WPS服务调用失败
      mockedWpsService.generateDocument.mockRejectedValue(new Error('WPS API error'));
      
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults,
        useWps: true
      };
      
      const report = await reportService.generateReport(params, ReportFormat.WORD);
      
      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.WORD);
      expect(report.content).toBeDefined();
      
      // 验证WPS服务被调用
      expect(mockedWpsService.generateDocument).toHaveBeenCalledTimes(1);
    });

    it('should generate report with history records', async () => {
      const params = {
        templateId: 'template-comparative-001',
        property: mockProperty,
        valuationResults: mockValuationResults,
        historyRecords: mockHistoryRecords
      };
      
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      expect(report).toBeDefined();
      expect(report.content).toBeDefined();
      expect(report.content.length).toBeGreaterThan(0);
    });

    it('should generate report with custom fields', async () => {
      const params = {
        templateId: 'template-custom-001',
        property: mockProperty,
        valuationResults: mockValuationResults,
        customFields: ['propertyInfo', 'valuationResults', 'averagePrice']
      };
      
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      expect(report).toBeDefined();
      expect(report.content).toBeDefined();
      expect(report.content.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent template', async () => {
      const params = {
        templateId: 'non-existent-template-id',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      await expect(reportService.generateReport(params, ReportFormat.HTML)).rejects.toThrow('模板不存在: non-existent-template-id');
    });
  });

  describe('report storage', () => {
    it('should save and retrieve reports', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      // 生成报告
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      // 验证报告已保存
      const savedReports = reportService.getGeneratedReports();
      expect(savedReports).toBeInstanceOf(Array);
      expect(savedReports.some(r => r.id === report.id)).toBe(true);
    });

    it('should retrieve report by id', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      // 生成报告
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      // 按id获取报告
      const retrievedReport = reportService.getReportById(report.id);
      expect(retrievedReport).not.toBeNull();
      expect(retrievedReport?.id).toBe(report.id);
    });

    it('should delete report successfully', async () => {
      const params = {
        templateId: 'template-basic-001',
        property: mockProperty,
        valuationResults: mockValuationResults
      };
      
      // 生成报告
      const report = await reportService.generateReport(params, ReportFormat.HTML);
      
      // 删除报告
      const result = reportService.deleteReport(report.id);
      expect(result).toBe(true);
      
      // 验证报告已删除
      const retrievedReport = reportService.getReportById(report.id);
      expect(retrievedReport).toBeNull();
    });
  });
});
