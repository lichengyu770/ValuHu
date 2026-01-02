import { describe, it, expect } from 'vitest';
import {
  basicValuation,
  marketComparisonValuation,
  incomeCapitalizationValuation,
  costApproachValuation,
  calculateMarketAdjustment,
  calculateDepreciation
} from './valuationAlgorithms';

describe('估价算法测试', () => {
  // 测试数据
  const testParams = {
    area: 120,
    unitPrice: 10000,
    buildingType: 'apartment',
    floor: 5,
    totalFloors: 10,
    constructionYear: 2015,
    decorationLevel: 'medium',
    orientation: 'south'
  };

  describe('基础估价算法', () => {
    it('应该根据面积和单价计算基础估价', () => {
      const result = basicValuation(testParams);
      expect(result).toBeDefined();
      expect(result.estimatedValue).toBe(1200000); // 120 * 10000
      expect(result.currency).toBe('CNY');
    });

    it('应该处理不同的建筑类型', () => {
      const villaParams = { ...testParams, buildingType: 'villa', unitPrice: 15000 };
      const result = basicValuation(villaParams);
      expect(result.estimatedValue).toBe(1800000); // 120 * 15000
    });
  });

  describe('市场比较法估价', () => {
    it('应该根据比较案例计算估价', () => {
      const comparableCases = [
        { price: 11000, area: 115, buildingType: 'apartment' },
        { price: 10500, area: 125, buildingType: 'apartment' },
        { price: 11200, area: 118, buildingType: 'apartment' }
      ];

      const result = marketComparisonValuation(testParams, comparableCases);
      expect(result).toBeDefined();
      expect(result.estimatedValue).toBeGreaterThan(0);
      expect(result.comparableCases).toEqual(comparableCases);
    });

    it('应该处理空的比较案例', () => {
      const result = marketComparisonValuation(testParams, []);
      expect(result.estimatedValue).toBeCloseTo(1200000, -3); // 回退到基础估价
    });
  });

  describe('收益还原法估价', () => {
    it('应该根据租金收入计算估价', () => {
      const incomeParams = {
        ...testParams,
        monthlyRent: 3000,
        annualGrowthRate: 0.02,
        discountRate: 0.05
      };

      const result = incomeCapitalizationValuation(incomeParams);
      expect(result).toBeDefined();
      expect(result.estimatedValue).toBeGreaterThan(0);
      expect(result.method).toBe('incomeCapitalization');
    });

    it('应该处理缺失租金数据', () => {
      const result = incomeCapitalizationValuation(testParams as any);
      expect(result.estimatedValue).toBeCloseTo(1200000, -3); // 回退到基础估价
    });
  });

  describe('成本法估价', () => {
    it('应该根据成本计算估价', () => {
      const costParams = {
        ...testParams,
        landPrice: 5000,
        constructionCost: 3000,
        otherCosts: 1000
      };

      const result = costApproachValuation(costParams);
      expect(result).toBeDefined();
      expect(result.estimatedValue).toBe(1080000); // (5000 + 3000 + 1000) * 120
      expect(result.method).toBe('costApproach');
    });
  });

  describe('市场调整计算', () => {
    it('应该根据比较案例计算市场调整系数', () => {
      const comparableCases = [
        { price: 11000, area: 115, buildingType: 'apartment' },
        { price: 10500, area: 125, buildingType: 'apartment' }
      ];

      const adjustment = calculateMarketAdjustment(testParams, comparableCases);
      expect(adjustment).toBeGreaterThan(0);
      expect(adjustment).toBeLessThanOrEqual(2);
    });
  });

  describe('折旧计算', () => {
    it('应该计算建筑物折旧', () => {
      const depreciation = calculateDepreciation(2015, 'medium');
      expect(depreciation).toBeGreaterThan(0);
      expect(depreciation).toBeLessThanOrEqual(1);
    });

    it('应该处理不同的装修等级', () => {
      const highDepreciation = calculateDepreciation(2015, 'high');
      const mediumDepreciation = calculateDepreciation(2015, 'medium');
      const lowDepreciation = calculateDepreciation(2015, 'low');
      
      expect(highDepreciation).toBeLessThan(mediumDepreciation);
      expect(mediumDepreciation).toBeLessThan(lowDepreciation);
    });
  });
});