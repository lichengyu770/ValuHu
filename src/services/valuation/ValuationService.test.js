// ValuationService 单元测试
import ValuationService from './ValuationService.js';
import { defaultValuationParams } from '../models/valuationModels.js';

describe('ValuationService 测试', () => {
  const testParams = {
    ...defaultValuationParams,
    area: 100,
    location: 'yuelu',
    buildingType: '住宅',
    constructionYear: 2015,
    floor: 5,
    totalFloors: 18,
    orientation: '南北',
    decorationLevel: '中等',
    lotRatio: 2.5,
    greenRatio: 35,
    nearbyFacilities: ['地铁', '学校', '医院', '商场'],
    valuationMethod: '市场比较法',
  };

  describe('performValuation 测试', () => {
    it('应该返回完整的估价结果', async () => {
      const result = await ValuationService.performValuation(testParams);

      // 验证结果结构
      expect(result).toHaveProperty('propertyId');
      expect(result).toHaveProperty('valuationDate');
      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('unitPrice');
      expect(result).toHaveProperty('valuationMethod');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('comparableProperties');
      expect(result).toHaveProperty('trendAnalysis');
      expect(result).toHaveProperty('evaluationDetails');

      // 验证数值合理性
      expect(result.totalValue).toBeGreaterThan(0);
      expect(result.unitPrice).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);

      // 验证总价计算正确性
      expect(result.totalValue).toBeCloseTo(
        result.unitPrice * testParams.area,
        -2
      );

      // 验证可比案例数量
      expect(result.comparableProperties).toHaveLength(3);

      // 验证趋势分析
      expect(result.trendAnalysis).toHaveProperty('monthlyTrend');
      expect(result.trendAnalysis.monthlyTrend).toHaveLength(12);
    });

    it('应该使用缓存结果提高性能', async () => {
      // 第一次调用，应该执行完整计算
      const result1 = await ValuationService.performValuation(testParams);

      // 第二次调用，应该返回缓存结果（propertyId会不同）
      const result2 = await ValuationService.performValuation(testParams);

      // 验证两次结果基本相同（除了propertyId和valuationDate）
      expect(result1.totalValue).toBe(result2.totalValue);
      expect(result1.unitPrice).toBe(result2.unitPrice);
      expect(result1.confidence).toBe(result2.confidence);
      expect(result1.propertyId).not.toBe(result2.propertyId);
    });
  });

  describe('validateParams 测试', () => {
    it('应该验证参数的完整性和有效性', () => {
      // 验证有效参数
      const validResult = ValuationService.validateParams(testParams);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      // 验证无效参数
      const invalidParams = {
        ...testParams,
        area: -100, // 无效面积
        constructionYear: new Date().getFullYear() + 1, // 未来年份
        floor: 10, // 楼层高于总楼层
        totalFloors: 5,
        lotRatio: -2.5, // 负容积率
        greenRatio: 150, // 绿化率超过100%
      };

      const invalidResult = ValuationService.validateParams(invalidParams);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toHaveLength(5);
    });
  });

  describe('模板管理功能测试', () => {
    it('应该能够保存和获取估价模板', async () => {
      // 保存模板
      const template = {
        name: '测试模板',
        params: testParams,
      };

      const savedTemplate =
        await ValuationService.saveValuationTemplate(template);
      expect(savedTemplate).toHaveProperty('id');
      expect(savedTemplate.name).toBe('测试模板');
      expect(savedTemplate).toHaveProperty('createdAt');
      expect(savedTemplate).toHaveProperty('updatedAt');

      // 获取模板列表
      const templates = ValuationService.getValuationTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('测试模板');

      // 根据ID获取模板
      const retrievedTemplate = ValuationService.getValuationTemplateById(
        savedTemplate.id
      );
      expect(retrievedTemplate).not.toBeNull();
      expect(retrievedTemplate.name).toBe('测试模板');
      expect(retrievedTemplate.params).toEqual(testParams);

      // 更新模板
      const updatedTemplateData = {
        name: '更新后的模板',
        params: { ...testParams, area: 150 },
      };
      await ValuationService.updateValuationTemplate(
        savedTemplate.id,
        updatedTemplateData
      );
      const updatedTemplate = ValuationService.getValuationTemplateById(
        savedTemplate.id
      );
      expect(updatedTemplate.name).toBe('更新后的模板');
      expect(updatedTemplate.params.area).toBe(150);
      expect(updatedTemplate.createdAt).toBe(savedTemplate.createdAt);
      expect(updatedTemplate.updatedAt).not.toBe(savedTemplate.updatedAt);

      // 删除模板
      await ValuationService.deleteValuationTemplate(savedTemplate.id);
      const templatesAfterDelete = ValuationService.getValuationTemplates();
      expect(templatesAfterDelete).toHaveLength(0);

      // 验证删除后无法获取
      const deletedTemplate = ValuationService.getValuationTemplateById(
        savedTemplate.id
      );
      expect(deletedTemplate).toBeNull();
    });

    it('应该处理无效的模板操作', async () => {
      // 保存无效模板（缺少name）
      await expect(
        ValuationService.saveValuationTemplate({ params: testParams })
      ).rejects.toThrow();

      // 更新不存在的模板
      await expect(
        ValuationService.updateValuationTemplate('non_existent_id', {
          name: '无效更新',
        })
      ).rejects.toThrow();

      // 删除不存在的模板
      await expect(
        ValuationService.deleteValuationTemplate('non_existent_id')
      ).resolves.toBe(true);

      // 获取不存在的模板
      const nonExistentTemplate =
        ValuationService.getValuationTemplateById('non_existent_id');
      expect(nonExistentTemplate).toBeNull();
    });
  });

  describe('分享功能测试', () => {
    it('应该能够保存和获取分享结果', async () => {
      // 执行估价
      const valuationResult =
        await ValuationService.performValuation(testParams);

      // 保存分享结果
      const shareId =
        await ValuationService.saveResultForSharing(valuationResult);
      expect(shareId).toHaveLength(18); // SHARE + 时间戳 + 随机数

      // 根据分享ID获取结果
      const sharedResult = ValuationService.getSharedResultById(shareId);
      expect(sharedResult).not.toBeNull();
      expect(sharedResult.totalValue).toBe(valuationResult.totalValue);
      expect(sharedResult.unitPrice).toBe(valuationResult.unitPrice);
      expect(sharedResult.propertyId).toBe(valuationResult.propertyId);

      // 生成分享链接
      const shareLink = ValuationService.generateShareLink(shareId);
      expect(shareLink).toContain(shareId);
      expect(shareLink).toContain(window.location.origin);
    });

    it('应该处理过期的分享结果', async () => {
      // 执行估价
      const valuationResult =
        await ValuationService.performValuation(testParams);

      // 保存分享结果，设置1天过期
      const shareId = await ValuationService.saveResultForSharing(
        valuationResult,
        1
      );

      // 验证分享结果可以正常获取
      const sharedResult = ValuationService.getSharedResultById(shareId);
      expect(sharedResult).not.toBeNull();

      // 清理过期分享结果
      const cleanupResult = await ValuationService.cleanupExpiredShares();
      expect(cleanupResult).toBe(true);
    });

    it('应该处理无效的分享ID', () => {
      // 获取不存在的分享结果
      const nonExistentResult = ValuationService.getSharedResultById(
        'non_existent_share_id'
      );
      expect(nonExistentResult).toBeNull();
    });

    it('应该从URL获取分享ID', () => {
      // 模拟URL参数
      const testShareId = 'SHARE1234567890123456';
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          pathname: '/valuation',
          search: `?shareId=${testShareId}`,
        },
        writable: true,
      });

      // 从URL获取分享ID
      const shareId = ValuationService.getShareIdFromUrl();
      expect(shareId).toBe(testShareId);

      // 模拟没有分享ID的URL
      Object.defineProperty(window, 'location', {
        value: {
          origin: 'http://localhost:3000',
          pathname: '/valuation',
          search: '',
        },
        writable: true,
      });

      // 从URL获取分享ID（应该返回null）
      const noShareId = ValuationService.getShareIdFromUrl();
      expect(noShareId).toBeNull();
    });
  });

  describe('自定义估价方法测试', () => {
    it('应该能够保存和执行自定义估价方法', async () => {
      // 保存自定义方法
      const customMethod = {
        name: '测试自定义方法',
        formula: '10000 * area * (1 + (2023 - constructionYear) * 0.01)',
        description: '简单的自定义估价公式',
        weight: 0.8,
      };

      const savedMethod =
        await ValuationService.saveCustomValuationMethod(customMethod);
      expect(savedMethod).toHaveProperty('id');
      expect(savedMethod.name).toBe('测试自定义方法');
      expect(savedMethod.description).toBe('简单的自定义估价公式');
      expect(savedMethod.weight).toBe(0.8);
      expect(savedMethod).toHaveProperty('createdAt');
      expect(savedMethod).toHaveProperty('updatedAt');

      // 获取自定义方法列表
      const methods = ValuationService.getCustomValuationMethods();
      expect(methods).toHaveLength(1);
      expect(methods[0].name).toBe('测试自定义方法');

      // 根据ID获取自定义方法
      const retrievedMethod = ValuationService.getCustomValuationMethodById(
        savedMethod.id
      );
      expect(retrievedMethod).not.toBeNull();
      expect(retrievedMethod.id).toBe(savedMethod.id);

      // 执行自定义方法
      const customResult = ValuationService.executeCustomValuationMethod(
        testParams,
        savedMethod
      );
      expect(customResult).toHaveProperty('unitPrice');
      expect(customResult).toHaveProperty('totalValue');
      expect(customResult).toHaveProperty('confidence');
      expect(customResult).toHaveProperty('valuationMethod', '测试自定义方法');
      expect(customResult.totalValue).toBeGreaterThan(0);
      expect(customResult.unitPrice).toBeGreaterThan(0);
      expect(customResult.confidence).toBeGreaterThan(0);
      expect(customResult.confidence).toBeLessThanOrEqual(95);

      // 更新自定义方法
      const updatedMethodData = {
        name: '更新后的自定义方法',
        formula: '12000 * area',
        weight: 1.0,
      };
      await ValuationService.updateCustomValuationMethod(
        savedMethod.id,
        updatedMethodData
      );
      const updatedMethod = ValuationService.getCustomValuationMethodById(
        savedMethod.id
      );
      expect(updatedMethod.name).toBe('更新后的自定义方法');
      expect(updatedMethod.formula).toBe('12000 * area');
      expect(updatedMethod.weight).toBe(1.0);
      expect(updatedMethod.createdAt).toBe(savedMethod.createdAt);
      expect(updatedMethod.updatedAt).not.toBe(savedMethod.updatedAt);

      // 删除自定义方法
      await ValuationService.deleteCustomValuationMethod(savedMethod.id);
      const methodsAfterDelete = ValuationService.getCustomValuationMethods();
      expect(methodsAfterDelete).toHaveLength(0);

      // 验证删除后无法获取
      const deletedMethod = ValuationService.getCustomValuationMethodById(
        savedMethod.id
      );
      expect(deletedMethod).toBeNull();
    });

    it('应该处理无效的自定义方法', async () => {
      // 保存无效自定义方法（缺少name和formula）
      await expect(
        ValuationService.saveCustomValuationMethod({ description: '无效方法' })
      ).rejects.toThrow();

      // 更新不存在的自定义方法
      await expect(
        ValuationService.updateCustomValuationMethod('non_existent_id', {
          name: '无效更新',
        })
      ).rejects.toThrow();

      // 删除不存在的自定义方法
      await expect(
        ValuationService.deleteCustomValuationMethod('non_existent_id')
      ).resolves.toBe(true);

      // 获取不存在的自定义方法
      const nonExistentMethod =
        ValuationService.getCustomValuationMethodById('non_existent_id');
      expect(nonExistentMethod).toBeNull();

      // 执行无效的自定义公式
      const invalidMethod = {
        name: '无效公式方法',
        formula: 'invalid_formula * area',
        weight: 1.0,
      };
      expect(() =>
        ValuationService.executeCustomValuationMethod(testParams, invalidMethod)
      ).toThrow();
    });
  });

  describe('市场数据缓存测试', () => {
    it('应该获取和更新市场数据', async () => {
      // 获取市场数据
      let marketData = await ValuationService.marketDataCache.getMarketData();
      expect(marketData).not.toBeNull();
      expect(marketData).toHaveProperty('areaIndexes');
      expect(marketData).toHaveProperty('buildingTypeIndexes');
      expect(marketData).toHaveProperty('trends');
      expect(marketData).toHaveProperty('basePrices');

      // 手动更新市场数据
      await ValuationService.marketDataCache.updateMarketData();
      const updatedMarketData =
        await ValuationService.marketDataCache.getMarketData();
      expect(updatedMarketData).not.toBeNull();

      // 验证市场数据包含预期的属性
      expect(updatedMarketData.areaIndexes).toHaveProperty('yuelu');
      expect(updatedMarketData.areaIndexes).toHaveProperty('furong');
      expect(updatedMarketData.areaIndexes).toHaveProperty('tianxin');
      expect(updatedMarketData.areaIndexes).toHaveProperty('kaifu');

      expect(updatedMarketData.buildingTypeIndexes).toHaveProperty('住宅');
      expect(updatedMarketData.buildingTypeIndexes).toHaveProperty('商业');
      expect(updatedMarketData.buildingTypeIndexes).toHaveProperty('办公');
      expect(updatedMarketData.buildingTypeIndexes).toHaveProperty('工业');
      expect(updatedMarketData.buildingTypeIndexes).toHaveProperty('别墅');

      expect(updatedMarketData.basePrices).toHaveProperty('住宅');
      expect(updatedMarketData.basePrices).toHaveProperty('商业');
      expect(updatedMarketData.basePrices).toHaveProperty('办公');
      expect(updatedMarketData.basePrices).toHaveProperty('工业');
      expect(updatedMarketData.basePrices).toHaveProperty('别墅');
    });
  });

  describe('generateHtmlReport 测试', () => {
    it('应该生成HTML格式的估价报告', async () => {
      const valuationResult =
        await ValuationService.performValuation(testParams);
      const htmlReport = ValuationService.generateHtmlReport(valuationResult);

      // 验证HTML报告包含必要信息
      expect(htmlReport).toContain('<html');
      expect(htmlReport).toContain('房产估价报告');
      expect(htmlReport).toContain(valuationResult.propertyId);
      expect(htmlReport).toContain(valuationResult.totalValue.toString());
      expect(htmlReport).toContain(valuationResult.unitPrice.toString());
    });
  });

  describe('generatePdfReport 测试', () => {
    it('应该生成PDF格式的估价报告', async () => {
      const valuationResult =
        await ValuationService.performValuation(testParams);
      const pdfReport =
        await ValuationService.generatePdfReport(valuationResult);

      // 验证PDF报告是Blob对象
      expect(pdfReport).toBeInstanceOf(Blob);
      expect(pdfReport.type).toBe('application/pdf');
    });
  });

  describe('batchValuation 测试', () => {
    it('应该支持批量估价', async () => {
      const propertiesParams = [
        { ...testParams, area: 100 },
        { ...testParams, area: 150 },
        { ...testParams, area: 200 },
      ];

      const results = await ValuationService.batchValuation(propertiesParams);
      expect(results).toHaveLength(3);

      // 验证批量结果
      results.forEach((result, index) => {
        expect(result.totalValue).toBeGreaterThan(0);
        expect(result.unitPrice).toBeGreaterThan(0);
        expect(result.totalValue).toBeCloseTo(
          result.unitPrice * propertiesParams[index].area,
          -2
        );
      });
    });
  });

  describe('performSensitivityAnalysis 测试', () => {
    it('应该执行敏感性分析', async () => {
      const sensitivityParams = {
        area: {
          base: 100,
          variations: [80, 90, 100, 110, 120],
        },
        constructionYear: {
          base: 2015,
          variations: [2010, 2013, 2015, 2017, 2020],
        },
      };

      const result = await ValuationService.performSensitivityAnalysis(
        testParams,
        sensitivityParams
      );

      expect(result).toHaveProperty('baseResult');
      expect(result).toHaveProperty('sensitivityResults');
      expect(result.sensitivityResults).toHaveProperty('area');
      expect(result.sensitivityResults).toHaveProperty('constructionYear');

      // 验证敏感性分析结果
      expect(result.sensitivityResults.area.variations).toHaveLength(5);
      expect(
        result.sensitivityResults.constructionYear.variations
      ).toHaveLength(5);

      // 验证变化百分比计算
      result.sensitivityResults.area.variations.forEach((variation) => {
        expect(variation).toHaveProperty('changePercent');
      });
    });
  });
});
