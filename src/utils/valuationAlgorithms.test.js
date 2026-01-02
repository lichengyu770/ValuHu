// 估价算法单元测试
import {
  marketComparisonMethod,
  incomeMethod,
  costMethod,
  calculateValuation,
  generateComparableProperties,
  generateTrendAnalysis,
  generateFactorsAnalysis,
} from './valuationAlgorithms.js';

describe('估价算法测试', () => {
  // 测试数据
  const testParams = {
    area: 100,
    location: 'yuelu',
    buildingType: '住宅',
    decorationLevel: '中等',
    orientation: '南北',
    constructionYear: 2015,
    floor: 5,
    totalFloors: 18,
    lotRatio: 2.5,
    greenRatio: 35,
    nearbyFacilities: ['地铁', '学校', '医院', '商场'],
    valuationMethod: '市场比较法',
  };

  describe('市场比较法测试', () => {
    it('应该返回合理的估价结果', () => {
      const result = marketComparisonMethod(testParams);

      // 验证结果结构
      expect(result).toHaveProperty('unitPrice');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('valuationMethod', '市场比较法');
      expect(result).toHaveProperty('factors');

      // 验证数值合理性
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // 验证总价计算正确性
      expect(result.totalValue).toBeCloseTo(
        result.unitPrice * testParams.area,
        -2
      );
    });
  });

  describe('收益法测试', () => {
    it('应该返回合理的估价结果', () => {
      const result = incomeMethod(testParams);

      // 验证结果结构
      expect(result).toHaveProperty('unitPrice');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('valuationMethod', '收益法');
      expect(result).toHaveProperty('factors');

      // 验证数值合理性
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // 验证总价计算正确性
      expect(result.totalValue).toBeCloseTo(
        result.unitPrice * testParams.area,
        -2
      );
    });
  });

  describe('成本法测试', () => {
    it('应该返回合理的估价结果', () => {
      const result = costMethod(testParams);

      // 验证结果结构
      expect(result).toHaveProperty('unitPrice');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('valuationMethod', '成本法');
      expect(result).toHaveProperty('factors');

      // 验证数值合理性
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // 验证总价计算正确性
      expect(result.totalValue).toBeCloseTo(
        result.unitPrice * testParams.area,
        -2
      );
    });
  });

  describe('calculateValuation 测试', () => {
    it('应该根据不同估价方法返回正确结果', () => {
      // 测试市场比较法
      const marketResult = calculateValuation({
        ...testParams,
        valuationMethod: '市场比较法',
      });
      expect(marketResult.valuationMethod).toBe('市场比较法');

      // 测试收益法
      const incomeResult = calculateValuation({
        ...testParams,
        valuationMethod: '收益法',
      });
      expect(incomeResult.valuationMethod).toBe('收益法');

      // 测试成本法
      const costResult = calculateValuation({
        ...testParams,
        valuationMethod: '成本法',
      });
      expect(costResult.valuationMethod).toBe('成本法');

      // 测试综合估价法
      const combinedResult = calculateValuation({
        ...testParams,
        valuationMethod: '综合估价法',
      });
      expect(combinedResult.valuationMethod).toBe('综合估价法');

      // 测试默认方法
      const defaultResult = calculateValuation({
        ...testParams,
        valuationMethod: 'unknown',
      });
      expect(defaultResult.valuationMethod).toBe('市场比较法');
    });
  });

  describe('combinedValuationMethod 测试', () => {
    it('应该返回综合估价结果', () => {
      const result = combinedValuationMethod(testParams);

      // 验证结果结构
      expect(result).toHaveProperty('unitPrice');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('valuationMethod', '综合估价法');
      expect(result).toHaveProperty('factors');
      expect(result.factors).toHaveProperty('marketResult');
      expect(result.factors).toHaveProperty('incomeResult');
      expect(result.factors).toHaveProperty('costResult');
      expect(result.factors).toHaveProperty('weights');

      // 验证数值合理性
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // 验证权重配置
      expect(result.factors.weights.market).toBe(0.4);
      expect(result.factors.weights.income).toBe(0.3);
      expect(result.factors.weights.cost).toBe(0.3);

      // 验证总价计算正确性
      expect(result.totalValue).toBeCloseTo(
        result.unitPrice * testParams.area,
        -2
      );
    });
  });

  describe('generateComparableProperties 测试', () => {
    it('应该生成指定数量的可比案例', () => {
      const properties = generateComparableProperties(testParams);
      expect(properties).toHaveLength(3);

      // 验证每个案例的结构
      properties.forEach((property) => {
        expect(property).toHaveProperty('caseId');
        expect(property).toHaveProperty('area');
        expect(property).toHaveProperty('buildingType');
        expect(property).toHaveProperty('location');
        expect(property).toHaveProperty('unitPrice');
        expect(property).toHaveProperty('totalPrice');
        expect(property).toHaveProperty('transactionDate');
        expect(property).toHaveProperty('similarity');
      });
    });
  });

  describe('generateTrendAnalysis 测试', () => {
    it('应该生成趋势分析数据', () => {
      const trend = generateTrendAnalysis(testParams);

      expect(trend).toHaveProperty('monthlyTrend');
      expect(trend).toHaveProperty('yearOnYearGrowth');
      expect(trend).toHaveProperty('prediction');

      // 验证月度趋势数据
      expect(trend.monthlyTrend).toHaveLength(12);
      trend.monthlyTrend.forEach((item) => {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('price');
        expect(item.price).toBeGreaterThan(0);
      });

      // 验证年度涨幅范围
      expect(trend.yearOnYearGrowth).toBeGreaterThanOrEqual(-2);
      expect(trend.yearOnYearGrowth).toBeLessThanOrEqual(8);
    });
  });

  describe('generateFactorsAnalysis 测试', () => {
    it('应该生成影响因素分析数据', () => {
      const factors = generateFactorsAnalysis(testParams);

      expect(Array.isArray(factors)).toBe(true);
      expect(factors.length).toBeGreaterThan(0);

      // 验证每个因素的结构
      factors.forEach((factor) => {
        expect(factor).toHaveProperty('name');
        expect(factor).toHaveProperty('value');
        expect(factor).toHaveProperty('weight');

        // 验证数值范围
        expect(factor.value).toBeGreaterThanOrEqual(0);
        expect(factor.value).toBeLessThanOrEqual(100);
        expect(factor.weight).toBeGreaterThan(0);
      });
    });
  });
});
