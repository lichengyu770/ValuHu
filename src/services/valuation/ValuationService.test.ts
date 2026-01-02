import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValuationService } from './ValuationService';
import {
  basicValuation,
  marketComparisonValuation,
  incomeCapitalizationValuation,
  costApproachValuation
} from '../utils/valuationAlgorithms';

// 模拟估价算法
vi.mock('../utils/valuationAlgorithms', () => ({
  basicValuation: vi.fn().mockReturnValue({
    estimatedValue: 1200000,
    currency: 'CNY',
    method: 'basic'
  }),
  marketComparisonValuation: vi.fn().mockReturnValue({
    estimatedValue: 1250000,
    currency: 'CNY',
    method: 'marketComparison',
    comparableCases: []
  }),
  incomeCapitalizationValuation: vi.fn().mockReturnValue({
    estimatedValue: 1300000,
    currency: 'CNY',
    method: 'incomeCapitalization'
  }),
  costApproachValuation: vi.fn().mockReturnValue({
    estimatedValue: 1150000,
    currency: 'CNY',
    method: 'costApproach'
  })
}));

describe('估价服务集成测试', () => {
  let valuationService: ValuationService;
  const mockPropertyData = {
    id: 'prop-001',
    area: 120,
    unitPrice: 10000,
    buildingType: 'apartment',
    floor: 5,
    totalFloors: 10,
    constructionYear: 2015,
    decorationLevel: 'medium',
    orientation: 'south',
    location: {
      province: '湖南省',
      city: '长沙市',
      district: '雨花区',
      address: '测试地址'
    }
  };

  beforeEach(() => {
    valuationService = new ValuationService();
    // 清除所有模拟调用
    vi.clearAllMocks();
  });

  describe('基础估价功能', () => {
    it('应该调用基础估价算法并返回结果', async () => {
      const result = await valuationService.estimatePropertyValue(mockPropertyData, 'basic');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.estimatedValue).toBe(1200000);
      expect(result.data?.method).toBe('basic');
      expect(basicValuation).toHaveBeenCalledTimes(1);
      expect(basicValuation).toHaveBeenCalledWith(mockPropertyData);
    });
  });

  describe('市场比较法估价', () => {
    it('应该调用市场比较法算法并返回结果', async () => {
      const comparableCases = [
        { price: 11000, area: 115, buildingType: 'apartment' },
        { price: 10500, area: 125, buildingType: 'apartment' }
      ];
      
      const result = await valuationService.estimatePropertyValue(mockPropertyData, 'marketComparison', comparableCases);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.estimatedValue).toBe(1250000);
      expect(result.data?.method).toBe('marketComparison');
      expect(marketComparisonValuation).toHaveBeenCalledTimes(1);
      expect(marketComparisonValuation).toHaveBeenCalledWith(mockPropertyData, comparableCases);
    });
  });

  describe('收益还原法估价', () => {
    it('应该调用收益还原法算法并返回结果', async () => {
      const incomeParams = {
        monthlyRent: 3000,
        annualGrowthRate: 0.02,
        discountRate: 0.05
      };
      
      const result = await valuationService.estimatePropertyValue({
        ...mockPropertyData,
        ...incomeParams
      }, 'incomeCapitalization');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.estimatedValue).toBe(1300000);
      expect(result.data?.method).toBe('incomeCapitalization');
      expect(incomeCapitalizationValuation).toHaveBeenCalledTimes(1);
    });
  });

  describe('成本法估价', () => {
    it('应该调用成本法算法并返回结果', async () => {
      const costParams = {
        landPrice: 5000,
        constructionCost: 3000,
        otherCosts: 1000
      };
      
      const result = await valuationService.estimatePropertyValue({
        ...mockPropertyData,
        ...costParams
      }, 'costApproach');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.estimatedValue).toBe(1150000);
      expect(result.data?.method).toBe('costApproach');
      expect(costApproachValuation).toHaveBeenCalledTimes(1);
    });
  });

  describe('多种方法综合估价', () => {
    it('应该使用多种方法进行综合估价', async () => {
      const result = await valuationService.estimatePropertyValue(mockPropertyData, 'comprehensive', []);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data?.estimatedValue).toBeDefined();
      expect(result.data?.method).toBe('comprehensive');
      
      // 综合估价应该调用所有估价方法
      expect(basicValuation).toHaveBeenCalledTimes(1);
      expect(marketComparisonValuation).toHaveBeenCalledTimes(1);
      expect(incomeCapitalizationValuation).toHaveBeenCalledTimes(1);
      expect(costApproachValuation).toHaveBeenCalledTimes(1);
    });
  });

  describe('估价历史记录', () => {
    it('应该保存估价历史记录', async () => {
      const result = await valuationService.estimatePropertyValue(mockPropertyData, 'basic');
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      
      // 获取历史记录
      const history = valuationService.getValuationHistory();
      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].propertyId).toBe(mockPropertyData.id);
    });

    it('应该获取特定估价记录', async () => {
      const result = await valuationService.estimatePropertyValue(mockPropertyData, 'basic');
      const valuationId = result.data?.id;
      
      expect(valuationId).toBeDefined();
      
      const valuation = valuationService.getValuationById(valuationId as string);
      expect(valuation).toBeDefined();
      expect(valuation?.propertyId).toBe(mockPropertyData.id);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的估价方法', async () => {
      const result = await valuationService.estimatePropertyValue(
        mockPropertyData,
        'invalid-method' as any
      );
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('应该处理缺少必要参数的情况', async () => {
      const invalidData = { ...mockPropertyData, area: undefined };
      const result = await valuationService.estimatePropertyValue(
        invalidData as any,
        'basic'
      );
      
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });
});