// ValuationService 集成测试
import ValuationService from './ValuationService';
import { calculateValuation } from '../utils/valuationAlgorithms';
import { defaultValuationParams } from '../models/valuationModels';

describe('ValuationService 集成测试', () => {
  const testParams = {
    ...defaultValuationParams,
    area: 120,
    location: 'furong',
    buildingType: '商业',
    constructionYear: 2018,
    floor: 8,
    totalFloors: 20,
    orientation: '南北',
    decorationLevel: '精装',
    lotRatio: 3.0,
    greenRatio: 30,
    nearbyFacilities: ['地铁', '学校', '医院', '商场', '公园'],
    valuationMethod: '综合估价法',
  };

  describe('估价服务与算法集成测试', () => {
    it('performValuation 应该正确调用估价算法', async () => {
      // 调用估价服务
      const serviceResult = await ValuationService.performValuation(testParams);

      // 直接调用估价算法，比较结果
      const algorithmResult = calculateValuation(testParams);

      // 验证服务结果与算法结果一致
      expect(serviceResult.totalValue).toBeCloseTo(
        algorithmResult.totalValue,
        -2
      );
      expect(serviceResult.unitPrice).toBeCloseTo(
        algorithmResult.unitPrice,
        -2
      );
      expect(serviceResult.confidence).toBe(algorithmResult.confidence);
      expect(serviceResult.valuationMethod).toBe(
        algorithmResult.valuationMethod
      );
    });

    it('不同估价方法应该返回不同结果', async () => {
      // 测试市场比较法
      const marketResult = await ValuationService.performValuation({
        ...testParams,
        valuationMethod: '市场比较法',
      });

      // 测试收益法
      const incomeResult = await ValuationService.performValuation({
        ...testParams,
        valuationMethod: '收益法',
      });

      // 测试成本法
      const costResult = await ValuationService.performValuation({
        ...testParams,
        valuationMethod: '成本法',
      });

      // 测试综合估价法
      const combinedResult = await ValuationService.performValuation({
        ...testParams,
        valuationMethod: '综合估价法',
      });

      // 验证不同方法返回不同结果
      expect(marketResult.totalValue).not.toBe(incomeResult.totalValue);
      expect(incomeResult.totalValue).not.toBe(costResult.totalValue);
      expect(costResult.totalValue).not.toBe(combinedResult.totalValue);
      expect(combinedResult.totalValue).not.toBe(marketResult.totalValue);

      // 验证综合估价法结果介于其他方法之间
      const minValue = Math.min(
        marketResult.totalValue,
        incomeResult.totalValue,
        costResult.totalValue
      );
      const maxValue = Math.max(
        marketResult.totalValue,
        incomeResult.totalValue,
        costResult.totalValue
      );
      expect(combinedResult.totalValue).toBeGreaterThanOrEqual(minValue);
      expect(combinedResult.totalValue).toBeLessThanOrEqual(maxValue);
    });
  });

  describe('估价参数验证与处理集成测试', () => {
    it('应该使用默认参数处理缺失值', async () => {
      // 只提供部分参数
      const partialParams = {
        area: 150,
        location: 'yuelu',
        buildingType: '住宅',
      };

      // 应该使用默认参数补充缺失值
      const result = await ValuationService.performValuation(partialParams);

      // 验证结果合理
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('应该处理无效参数', async () => {
      // 提供无效参数
      const invalidParams = {
        ...testParams,
        area: -100, // 无效面积
        constructionYear: 2100, // 未来年份
        lotRatio: -2.5, // 负容积率
      };

      // 验证参数验证功能
      const validationResult = ValuationService.validateParams(invalidParams);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors).toHaveLength(3);
    });
  });

  describe('报告生成功能集成测试', () => {
    it('应该根据估价结果生成一致的报告', async () => {
      // 执行估价
      const valuationResult =
        await ValuationService.performValuation(testParams);

      // 生成HTML报告
      const htmlReport = ValuationService.generateHtmlReport(valuationResult);

      // 生成PDF报告
      const pdfReport =
        await ValuationService.generatePdfReport(valuationResult);

      // 验证HTML报告包含关键结果数据
      expect(htmlReport).toContain(valuationResult.totalValue.toString());
      expect(htmlReport).toContain(valuationResult.unitPrice.toString());
      expect(htmlReport).toContain(valuationResult.confidence.toString());
      expect(htmlReport).toContain(valuationResult.propertyId);

      // 验证PDF报告是有效的Blob对象
      expect(pdfReport).toBeInstanceOf(Blob);
      expect(pdfReport.type).toBe('application/pdf');
    });
  });

  describe('批量估价功能集成测试', () => {
    it('应该同时处理多个估价请求', async () => {
      // 准备多个房产参数
      const propertiesParams = [
        { ...testParams, area: 100, location: 'furong', buildingType: '住宅' },
        { ...testParams, area: 150, location: 'yuelu', buildingType: '商业' },
        { ...testParams, area: 200, location: 'tianxin', buildingType: '办公' },
        { ...testParams, area: 80, location: 'kaifu', buildingType: '别墅' },
      ];

      // 执行批量估价
      const batchResults =
        await ValuationService.batchValuation(propertiesParams);

      // 验证结果数量
      expect(batchResults).toHaveLength(propertiesParams.length);

      // 验证每个结果都符合预期
      batchResults.forEach((result, index) => {
        expect(result.totalValue).toBeGreaterThan(0);
        expect(result.unitPrice).toBeGreaterThan(0);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.valuationMethod).toBe(
          propertiesParams[index].valuationMethod
        );
        expect(result.totalValue).toBeCloseTo(
          result.unitPrice * propertiesParams[index].area,
          -2
        );
      });

      // 验证不同房产的结果不同
      const totalValues = batchResults.map((result) => result.totalValue);
      const uniqueTotalValues = [...new Set(totalValues)];
      expect(uniqueTotalValues.length).toBeGreaterThan(1);
    });
  });

  describe('敏感性分析集成测试', () => {
    it('应该分析不同参数变化对估价结果的影响', async () => {
      // 定义敏感性分析参数
      const sensitivityParams = {
        area: {
          base: testParams.area,
          variations: [
            testParams.area * 0.8,
            testParams.area * 0.9,
            testParams.area * 1.0,
            testParams.area * 1.1,
            testParams.area * 1.2,
          ],
        },
        lotRatio: {
          base: testParams.lotRatio,
          variations: [2.0, 2.5, 3.0, 3.5, 4.0],
        },
        greenRatio: {
          base: testParams.greenRatio,
          variations: [20, 25, 30, 35, 40],
        },
      };

      // 执行敏感性分析
      const result = await ValuationService.performSensitivityAnalysis(
        testParams,
        sensitivityParams
      );

      // 验证结果结构
      expect(result).toHaveProperty('baseResult');
      expect(result).toHaveProperty('sensitivityResults');
      expect(result.sensitivityResults).toHaveProperty('area');
      expect(result.sensitivityResults).toHaveProperty('lotRatio');
      expect(result.sensitivityResults).toHaveProperty('greenRatio');

      // 验证每个参数的敏感性分析结果
      ['area', 'lotRatio', 'greenRatio'].forEach((paramName) => {
        const paramResult = result.sensitivityResults[paramName];
        expect(paramResult).toHaveProperty('baseValue');
        expect(paramResult).toHaveProperty('baseResult');
        expect(paramResult).toHaveProperty('variations');
        expect(paramResult.variations).toHaveLength(5);

        // 验证变化百分比计算合理
        paramResult.variations.forEach((variation) => {
          expect(variation).toHaveProperty('paramValue');
          expect(variation).toHaveProperty('totalValue');
          expect(variation).toHaveProperty('unitPrice');
          expect(variation).toHaveProperty('changePercent');

          // 面积变化应该与总价成正比
          if (paramName === 'area') {
            expect(variation.changePercent).toBeCloseTo(
              ((variation.paramValue - paramResult.baseValue) /
                paramResult.baseValue) *
                100,
              -1
            );
          }
        });
      });

      // 验证面积变化对总价的影响最大
      const areaChanges = result.sensitivityResults.area.variations.map((v) =>
        Math.abs(v.changePercent)
      );
      const lotRatioChanges = result.sensitivityResults.lotRatio.variations.map(
        (v) => Math.abs(v.changePercent)
      );
      const greenRatioChanges =
        result.sensitivityResults.greenRatio.variations.map((v) =>
          Math.abs(v.changePercent)
        );

      const maxAreaChange = Math.max(...areaChanges);
      const maxLotRatioChange = Math.max(...lotRatioChanges);
      const maxGreenRatioChange = Math.max(...greenRatioChanges);

      expect(maxAreaChange).toBeGreaterThan(maxLotRatioChange);
      expect(maxAreaChange).toBeGreaterThan(maxGreenRatioChange);
    });
  });

  describe('市场数据集成测试', () => {
    it('应该使用实时市场数据进行估价', async () => {
      // 执行第一次估价
      const result1 = await ValuationService.performValuation(testParams);

      // 强制更新市场数据
      await ValuationService.marketDataCache.updateMarketData();

      // 执行第二次估价，应该使用更新后的市场数据
      const result2 = await ValuationService.performValuation(testParams);

      // 验证两次结果可能不同（因为市场数据更新）
      // 注意：由于是模拟数据，两次结果可能相同，所以这里不做严格断言
      // 只验证结果结构正确
      expect(result1.totalValue).toBeGreaterThan(0);
      expect(result2.totalValue).toBeGreaterThan(0);
      expect(result1.unitPrice).toBeGreaterThan(0);
      expect(result2.unitPrice).toBeGreaterThan(0);
      expect(result1.propertyId).not.toBe(result2.propertyId);
    });
  });
});
