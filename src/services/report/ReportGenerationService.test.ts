import { describe, it, expect, beforeEach } from 'vitest';
import { ReportGenerationService, ReportFormat, ReportType } from './ReportGenerationService';
import { PropertyInfo, ValuationResult } from '../utils/valuationAlgorithms';

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
    }
  },
  {
    id: 'result-2',
    algorithm: 'marketComparison',
    price: 1250000,
    unitPrice: 10416.67,
    confidence: 85,
    timestamp: new Date(),
    details: {
      factors: { buildingType: 1.1, floor: 1.0, orientation: 1.05, decoration: 1.0 },
      trendAnalysis: { yearOnYearGrowth: 6, monthlyTrend: [] },
      comparableProperties: []
    }
  }
];

describe('ReportGenerationService', () => {
  let reportService: ReportGenerationService;

  beforeEach(() => {
    // 在每个测试前创建新的实例
    reportService = new ReportGenerationService();
  });

  describe('模板管理', () => {
    it('应该获取所有默认模板', () => {
      const templates = reportService.getAllTemplates();
      expect(templates).toHaveLength(4);
      expect(templates[0].type).toBe(ReportType.BASIC);
      expect(templates[1].type).toBe(ReportType.DETAILED);
      expect(templates[2].type).toBe(ReportType.COMPARATIVE);
      expect(templates[3].type).toBe(ReportType.STATISTICAL);
    });

    it('应该根据ID获取模板', () => {
      const templates = reportService.getAllTemplates();
      const template = reportService.getTemplateById(templates[0].id);
      expect(template).toBeDefined();
      expect(template?.id).toBe(templates[0].id);
    });

    it('应该创建新模板', () => {
      const newTemplate = reportService.createTemplate({
        name: '测试模板',
        type: ReportType.CUSTOM,
        description: '测试自定义模板',
        fields: ['propertyInfo', 'valuationResults'],
        isDefault: false
      });

      expect(newTemplate).toBeDefined();
      expect(newTemplate.id).toContain('template-custom');
      expect(newTemplate.name).toBe('测试模板');
      expect(newTemplate.type).toBe(ReportType.CUSTOM);
    });

    it('应该更新模板', () => {
      const templates = reportService.getAllTemplates();
      const updatedTemplate = reportService.updateTemplate(templates[0].id, {
        name: '更新后的基础模板'
      });

      expect(updatedTemplate).toBeDefined();
      expect(updatedTemplate?.name).toBe('更新后的基础模板');
    });

    it('应该删除模板', () => {
      // 先创建一个可删除的模板
      const newTemplate = reportService.createTemplate({
        name: '可删除模板',
        type: ReportType.CUSTOM,
        description: '测试可删除模板',
        fields: ['propertyInfo'],
        isDefault: false
      });

      // 删除模板
      const result = reportService.deleteTemplate(newTemplate.id);
      expect(result).toBe(true);

      // 验证模板已删除
      const deletedTemplate = reportService.getTemplateById(newTemplate.id);
      expect(deletedTemplate).toBeNull();
    });

    it('不应该删除默认模板', () => {
      const templates = reportService.getAllTemplates();
      const defaultTemplate = templates.find(t => t.isDefault);
      if (defaultTemplate) {
        const result = reportService.deleteTemplate(defaultTemplate.id);
        expect(result).toBe(false);
        
        // 验证模板未被删除
        const template = reportService.getTemplateById(defaultTemplate.id);
        expect(template).toBeDefined();
      }
    });
  });

  describe('报告生成', () => {
    it('应该生成HTML报告', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.HTML
      );

      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.HTML);
      expect(report.content).toContain('<html');
      expect(report.content).toContain('测试小区');
      expect(report.content).toContain('1200000');
    });

    it('应该生成JSON报告', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.JSON
      );

      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.JSON);
      
      const reportData = JSON.parse(report.content);
      expect(reportData).toHaveProperty('title');
      expect(reportData).toHaveProperty('property');
      expect(reportData).toHaveProperty('valuationResults');
      expect(reportData.property.city).toBe('北京');
    });

    it('应该生成CSV报告', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.CSV
      );

      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.CSV);
      expect(report.content).toContain('算法,总价 (元),单价 (元/平方米),置信度,生成时间');
      expect(report.content).toContain('basic,1200000,10000,90');
    });

    it('应该生成PDF报告', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.PDF
      );

      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.PDF);
      // PDF报告内容是HTML，在导出时会转换为PDF
      expect(report.content).toContain('<html');
    });

    it('应该生成Excel报告', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.EXCEL
      );

      expect(report).toBeDefined();
      expect(report.format).toBe(ReportFormat.EXCEL);
      // Excel报告内容是JSON，在导出时会转换为Excel
      expect(report.content).toContain('propertyInfo');
      expect(report.content).toContain('valuationResults');
    });

    it('应该处理自定义标题和作者', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults,
          title: '自定义报告标题',
          author: '测试用户'
        },
        ReportFormat.HTML
      );

      expect(report.title).toBe('自定义报告标题');
      expect(report.author).toBe('测试用户');
      expect(report.content).toContain('自定义报告标题');
      expect(report.content).toContain('测试用户');
    });

    it('应该包含备注信息', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[1].id, // 使用详细模板
          property: mockProperty,
          valuationResults: mockValuationResults,
          notes: '这是一个测试备注信息'
        },
        ReportFormat.HTML
      );

      expect(report.content).toContain('这是一个测试备注信息');
    });
  });

  describe('报告管理', () => {
    it('应该保存和获取生成的报告', () => {
      const templates = reportService.getAllTemplates();
      const generatedReport = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.HTML
      );

      // 获取保存的报告
      const savedReport = reportService.getGeneratedReportById(generatedReport.id);
      expect(savedReport).toBeDefined();
      expect(savedReport?.id).toBe(generatedReport.id);
      expect(savedReport?.title).toBe(generatedReport.title);
    });

    it('应该获取所有生成的报告', () => {
      // 先清空可能存在的旧报告
      localStorage.removeItem('valuation-generated-reports');

      const templates = reportService.getAllTemplates();
      
      // 生成两个报告
      reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.HTML
      );
      
      reportService.generateReport(
        {
          templateId: templates[1].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.JSON
      );

      // 获取所有报告
      const allReports = reportService.getAllGeneratedReports();
      expect(allReports).toHaveLength(2);
    });

    it('应该删除生成的报告', () => {
      const templates = reportService.getAllTemplates();
      const generatedReport = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: mockValuationResults
        },
        ReportFormat.HTML
      );

      // 删除报告
      const result = reportService.deleteGeneratedReport(generatedReport.id);
      expect(result).toBe(true);

      // 验证报告已删除
      const deletedReport = reportService.getGeneratedReportById(generatedReport.id);
      expect(deletedReport).toBeNull();
    });
  });

  describe('边缘情况处理', () => {
    it('应该处理不存在的模板', () => {
      expect(() => {
        reportService.generateReport(
          {
            templateId: 'non-existent-template',
            property: mockProperty,
            valuationResults: mockValuationResults
          },
          ReportFormat.HTML
        );
      }).toThrow('模板不存在');
    });

    it('应该处理空的估价结果', () => {
      const templates = reportService.getAllTemplates();
      const report = reportService.generateReport(
        {
          templateId: templates[0].id,
          property: mockProperty,
          valuationResults: []
        },
        ReportFormat.HTML
      );

      expect(report).toBeDefined();
      expect(report.content).toContain('估价结果');
    });
  });
});