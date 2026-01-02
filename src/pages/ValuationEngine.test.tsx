import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ValuationEngine from './ValuationEngine';
import ValuationService from '../services/ValuationService';
import KnowledgeMemoryService from '../services/KnowledgeMemoryService';
import TrialService from '../services/TrialService';

// 模拟服务
vi.mock('../services/ValuationService');
vi.mock('../services/KnowledgeMemoryService');
vi.mock('../services/TrialService');

const mockedValuationService = ValuationService as vi.Mocked<typeof ValuationService>;
const mockedKnowledgeMemoryService = KnowledgeMemoryService as vi.Mocked<typeof KnowledgeMemoryService>;
const mockedTrialService = TrialService as vi.Mocked<typeof TrialService>;

describe('ValuationEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 模拟默认返回值
    mockedTrialService.hasRemainingTrial.mockReturnValue(true);
    mockedValuationService.validateParams.mockReturnValue({ isValid: true, errors: [] });
    mockedKnowledgeMemoryService.getSmartSuggestions.mockResolvedValue({ suggestions: [], recommendedTemplates: [] });
  });

  it('should render ValuationEngine component successfully', () => {
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 验证组件是否渲染
    expect(screen.getByText('估价参数输入')).toBeInTheDocument();
  });

  it('should render step navigation correctly', () => {
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 验证步骤导航是否渲染
    expect(screen.getByText('参数输入')).toBeInTheDocument();
    expect(screen.getByText('结果预览')).toBeInTheDocument();
    expect(screen.getByText('报告生成')).toBeInTheDocument();
  });

  it('should show loading indicator when submitting form', async () => {
    // 模拟估价服务返回结果
    const mockResult = {
      id: 'result-1',
      algorithm: 'basic',
      price: 1200000,
      unitPrice: 10000,
      confidence: 90,
      timestamp: new Date(),
      details: {
        factors: { buildingType: 1.0, floor: 1.0 },
        trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
        comparableProperties: []
      },
      propertyInfo: {
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
        nearbyFacilities: ['school'],
        constructionYear: 2015
      },
      propertyId: 'beijing-chaoyang-120'
    };
    
    mockedValuationService.performValuation.mockResolvedValue(mockResult);
    
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText(/区域/i), { target: { value: '朝阳区' } });
    fireEvent.change(screen.getByLabelText(/小区/i), { target: { value: '测试小区' } });
    fireEvent.change(screen.getByLabelText(/建筑面积/i), { target: { value: 120 } });
    
    // 提交表单
    fireEvent.click(screen.getByText(/开始估价/i));
    
    // 验证加载状态
    expect(screen.getByText(/正在计算估价结果，请稍候.../i)).toBeInTheDocument();
  });

  it('should show valuation result after successful submission', async () => {
    // 模拟估价服务返回结果
    const mockResult = {
      id: 'result-1',
      algorithm: 'basic',
      price: 1200000,
      unitPrice: 10000,
      confidence: 90,
      timestamp: new Date(),
      details: {
        factors: { buildingType: 1.0, floor: 1.0 },
        trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
        comparableProperties: []
      },
      propertyInfo: {
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
        nearbyFacilities: ['school'],
        constructionYear: 2015
      },
      propertyId: 'beijing-chaoyang-120'
    };
    
    mockedValuationService.performValuation.mockResolvedValue(mockResult);
    
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 填写表单
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText(/区域/i), { target: { value: '朝阳区' } });
    fireEvent.change(screen.getByLabelText(/小区/i), { target: { value: '测试小区' } });
    fireEvent.change(screen.getByLabelText(/建筑面积/i), { target: { value: 120 } });
    
    // 提交表单
    fireEvent.click(screen.getByText(/开始估价/i));
    
    // 等待结果显示
    await waitFor(() => {
      expect(screen.getByText(/估价结果/i)).toBeInTheDocument();
    });
    
    // 验证结果显示
    expect(screen.getByText(/1200000/i)).toBeInTheDocument();
    expect(screen.getByText(/10000/i)).toBeInTheDocument();
  });

  it('should show report generation buttons after successful valuation', async () => {
    // 模拟估价服务返回结果
    const mockResult = {
      id: 'result-1',
      algorithm: 'basic',
      price: 1200000,
      unitPrice: 10000,
      confidence: 90,
      timestamp: new Date(),
      details: {
        factors: { buildingType: 1.0, floor: 1.0 },
        trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
        comparableProperties: []
      },
      propertyInfo: {
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
        nearbyFacilities: ['school'],
        constructionYear: 2015
      },
      propertyId: 'beijing-chaoyang-120'
    };
    
    mockedValuationService.performValuation.mockResolvedValue(mockResult);
    mockedValuationService.generateHtmlReport.mockReturnValue('<html><body>Report</body></html>');
    
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 填写表单并提交
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText(/区域/i), { target: { value: '朝阳区' } });
    fireEvent.change(screen.getByLabelText(/小区/i), { target: { value: '测试小区' } });
    fireEvent.change(screen.getByLabelText(/建筑面积/i), { target: { value: 120 } });
    fireEvent.click(screen.getByText(/开始估价/i));
    
    // 等待结果显示
    await waitFor(() => {
      expect(screen.getByText(/估价结果/i)).toBeInTheDocument();
    });
    
    // 点击下一步进入报告生成页面
    fireEvent.click(screen.getByText(/下一步/i));
    
    // 验证报告生成按钮是否显示
    await waitFor(() => {
      expect(screen.getByText(/生成HTML报告/i)).toBeInTheDocument();
      expect(screen.getByText(/生成PDF报告/i)).toBeInTheDocument();
      expect(screen.getByText(/生成Excel报告/i)).toBeInTheDocument();
      expect(screen.getByText(/生成WPS报告/i)).toBeInTheDocument();
    });
  });

  it('should show WPS template selection when generating WPS report', async () => {
    // 模拟估价服务返回结果
    const mockResult = {
      id: 'result-1',
      algorithm: 'basic',
      price: 1200000,
      unitPrice: 10000,
      confidence: 90,
      timestamp: new Date(),
      details: {
        factors: { buildingType: 1.0, floor: 1.0 },
        trendAnalysis: { yearOnYearGrowth: 5, monthlyTrend: [] },
        comparableProperties: []
      },
      propertyInfo: {
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
        nearbyFacilities: ['school'],
        constructionYear: 2015
      },
      propertyId: 'beijing-chaoyang-120'
    };
    
    mockedValuationService.performValuation.mockResolvedValue(mockResult);
    
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 填写表单并提交
    fireEvent.change(screen.getByLabelText(/城市/i), { target: { value: '北京' } });
    fireEvent.change(screen.getByLabelText(/区域/i), { target: { value: '朝阳区' } });
    fireEvent.change(screen.getByLabelText(/小区/i), { target: { value: '测试小区' } });
    fireEvent.change(screen.getByLabelText(/建筑面积/i), { target: { value: 120 } });
    fireEvent.click(screen.getByText(/开始估价/i));
    
    // 等待结果显示
    await waitFor(() => {
      expect(screen.getByText(/估价结果/i)).toBeInTheDocument();
    });
    
    // 点击下一步进入报告生成页面
    fireEvent.click(screen.getByText(/下一步/i));
    
    // 验证WPS模板选择是否显示
    await waitFor(() => {
      expect(screen.getByText(/选择WPS模板/i)).toBeInTheDocument();
    });
    
    // 验证默认模板选项是否存在
    expect(screen.getByText(/默认估价模板/i)).toBeInTheDocument();
  });

  it('should handle form validation errors', async () => {
    // 模拟表单验证失败
    mockedValuationService.validateParams.mockReturnValue({
      isValid: false,
      errors: ['城市不能为空', '区域不能为空']
    });
    
    render(
      <MemoryRouter>
        <ValuationEngine />
      </MemoryRouter>
    );
    
    // 直接提交空表单
    fireEvent.click(screen.getByText(/开始估价/i));
    
    // 验证错误提示是否显示
    await waitFor(() => {
      expect(screen.getByText(/城市不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/区域不能为空/i)).toBeInTheDocument();
    });
  });
});
