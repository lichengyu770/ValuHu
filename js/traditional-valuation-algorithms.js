// 传统JavaScript版本的估价算法
// 移除ES模块语法，使用全局函数声明

// 修正系数配置
const areaCorrectionFactors = {
  xjang: 1.0,
  furong: 1.26,
  yuelu: 0.896,
  tianxin: 1.088,
  kaifu: 1.136,
};

const buildingTypeCorrectionFactors = {
  住宅: 1.0,
  商业: 1.8,
  办公: 1.5,
  工业: 0.8,
  别墅: 2.0,
};

const decorationLevelCorrectionFactors = {
  毛坯: 0.8,
  简装: 0.9,
  中等: 1.0,
  精装: 1.1,
  豪华: 1.2,
};

const orientationCorrectionFactors = {
  南北: 1.0,
  南: 0.95,
  北: 0.85,
  东西: 0.9,
  东: 0.92,
  西: 0.88,
};

// 基准价格（元/㎡）
const basePrices = {
  住宅: 12500,
  商业: 22500,
  办公: 18750,
  工业: 10000,
  别墅: 25000,
};

/**
 * 市场比较法
 * 基于相似房产的市场成交价格进行比较
 * @param {Object} params - 估价参数
 * @returns {Object} - 估价结果
 */
function marketComparisonMethod(params) {
  const {
    area,
    location,
    buildingType,
    decorationLevel,
    orientation,
    constructionYear,
    floor,
    totalFloors,
  } = params;

  // 1. 确定基准价格
  const basePrice = basePrices[buildingType] || basePrices['住宅'];

  // 2. 计算年限修正系数（每年折旧率1.5%）
  const currentYear = new Date().getFullYear();
  const age = currentYear - constructionYear;
  const ageCorrection = Math.max(0.5, 1 - age * 0.015); // 最低折旧至50%

  // 3. 计算楼层修正系数
  let floorCorrection = 1.0;
  if (totalFloors > 1) {
    const optimalFloor = Math.floor(totalFloors * 0.3); // 最优楼层为总楼层的30%
    const floorDiff = Math.abs(floor - optimalFloor);
    floorCorrection = Math.max(0.85, 1 - floorDiff * 0.01); // 每层差异影响1%
  }

  // 4. 计算综合修正系数
  const totalCorrection =
    (areaCorrectionFactors[location] || 1.0) *
    (buildingTypeCorrectionFactors[buildingType] || 1.0) *
    (decorationLevelCorrectionFactors[decorationLevel] || 1.0) *
    (orientationCorrectionFactors[orientation] || 1.0) *
    ageCorrection *
    floorCorrection;

  // 5. 计算最终单价和总价
  const unitPrice = Math.round(basePrice * totalCorrection);
  const totalValue = Math.round(unitPrice * area);

  // 6. 计算置信度（基于修正系数数量和合理性）
  const confidence = Math.min(
    98,
    Math.max(70, 95 - Math.abs(totalCorrection - 1) * 50)
  );

  return {
    unitPrice,
    totalValue,
    confidence,
    valuationMethod: '市场比较法',
    factors: {
      basePrice,
      ageCorrection,
      floorCorrection,
      totalCorrection,
    },
  };
}

/**
 * 收益法
 * 基于房产未来预期收益进行折现
 * @param {Object} params - 估价参数
 * @returns {Object} - 估价结果
 */
function incomeMethod(params) {
  const { area, buildingType, location, constructionYear } = params;

  // 1. 确定年租金（元/㎡/年）
  const annualRentPerSquare = {
    住宅: 360,
    商业: 1800,
    办公: 900,
    工业: 300,
    别墅: 720,
  };

  const rentPerSquare =
    annualRentPerSquare[buildingType] || annualRentPerSquare['住宅'];
  const grossAnnualIncome = area * rentPerSquare;

  // 2. 计算年运营成本（占总收入的20-30%）
  const operatingCostRatio = buildingType === '商业' ? 0.3 : 0.25;
  const annualOperatingCost = grossAnnualIncome * operatingCostRatio;

  // 3. 计算年净收益
  const netAnnualIncome = grossAnnualIncome - annualOperatingCost;

  // 4. 确定资本化率（%）
  const capitalizationRates = {
    住宅: 3.5,
    商业: 5.0,
    办公: 4.5,
    工业: 4.0,
    别墅: 3.8,
  };

  const capitalizationRate =
    capitalizationRates[buildingType] || capitalizationRates['住宅'];

  // 5. 计算估价结果
  const totalValue = Math.round(netAnnualIncome / (capitalizationRate / 100));
  const unitPrice = Math.round(totalValue / area);

  // 6. 计算置信度
  const confidence = Math.min(95, Math.max(65, 90 - capitalizationRate * 2));

  return {
    unitPrice,
    totalValue,
    confidence,
    valuationMethod: '收益法',
    factors: {
      grossAnnualIncome,
      annualOperatingCost,
      netAnnualIncome,
      capitalizationRate,
    },
  };
}

/**
 * 成本法
 * 基于房产重置成本进行评估
 * @param {Object} params - 估价参数
 * @returns {Object} - 估价结果
 */
function costMethod(params) {
  const { area, buildingType, constructionYear, lotRatio } = params;

  // 1. 计算土地取得成本（元/㎡）
  const landCosts = {
    住宅: 4500,
    商业: 9000,
    办公: 6750,
    工业: 3600,
    别墅: 9000,
  };

  const landCost = landCosts[buildingType] || landCosts['住宅'];
  const totalLandCost = area * landCost;

  // 2. 计算开发成本（元/㎡）
  const developmentCosts = {
    住宅: 6000,
    商业: 12000,
    办公: 9000,
    工业: 4800,
    别墅: 12000,
  };

  const developmentCost =
    developmentCosts[buildingType] || developmentCosts['住宅'];
  const totalDevelopmentCost = area * developmentCost;

  // 3. 计算管理费用（开发成本的3-5%）
  const managementFee = totalDevelopmentCost * 0.04;

  // 4. 计算销售费用（销售额的2-3%）
  const estimatedSalePrice = (totalLandCost + totalDevelopmentCost) * 1.3;
  const salesFee = estimatedSalePrice * 0.025;

  // 5. 计算投资利息（年利率4.5%，开发周期2年）
  const totalInvestment = totalLandCost + totalDevelopmentCost + managementFee;
  const interest = totalInvestment * 0.045 * 2;

  // 6. 计算销售税费（销售额的5.6%）
  const salesTax = estimatedSalePrice * 0.056;

  // 7. 计算开发利润（投资的20-30%）
  const profitMargin = buildingType === '商业' ? 0.3 : 0.25;
  const profit = totalInvestment * profitMargin;

  // 8. 计算重置成本
  const replacementCost =
    totalLandCost +
    totalDevelopmentCost +
    managementFee +
    salesFee +
    interest +
    salesTax +
    profit;

  // 9. 计算折旧（年限法，残值率5%，使用年限50年）
  const currentYear = new Date().getFullYear();
  const age = currentYear - constructionYear;
  const residualValue = replacementCost * 0.05;
  const annualDepreciation = (replacementCost - residualValue) / 50;
  const totalDepreciation = Math.min(
    replacementCost - residualValue,
    annualDepreciation * age
  );

  // 10. 计算最终估价
  const totalValue = Math.round(replacementCost - totalDepreciation);
  const unitPrice = Math.round(totalValue / area);

  // 11. 计算置信度
  const confidence = Math.min(90, Math.max(60, 85 - age * 0.5));

  return {
    unitPrice,
    totalValue,
    confidence,
    valuationMethod: '成本法',
    factors: {
      totalLandCost,
      totalDevelopmentCost,
      managementFee,
      salesFee,
      interest,
      salesTax,
      profit,
      replacementCost,
      totalDepreciation,
    },
  };
}

/**
 * 综合估价法
 * 结合三种估价方法的加权平均结果
 * @param {Object} params - 估价参数
 * @returns {Object} - 综合估价结果
 */
function combinedValuationMethod(params) {
  // 计算三种方法的估价结果
  const marketResult = marketComparisonMethod(params);
  const incomeResult = incomeMethod(params);
  const costResult = costMethod(params);

  // 方法权重配置（可根据实际情况调整）
  const methodWeights = {
    market: 0.4, // 市场比较法权重
    income: 0.3, // 收益法权重
    cost: 0.3, // 成本法权重
  };

  // 计算加权平均单价
  const weightedUnitPrice = Math.round(
    marketResult.unitPrice * methodWeights.market +
      incomeResult.unitPrice * methodWeights.income +
      costResult.unitPrice * methodWeights.cost
  );

  // 计算加权平均总价
  const weightedTotalValue = Math.round(weightedUnitPrice * params.area);

  // 计算综合置信度（加权平均）
  const combinedConfidence = Math.round(
    marketResult.confidence * methodWeights.market +
      incomeResult.confidence * methodWeights.income +
      costResult.confidence * methodWeights.cost
  );

  // 构建综合估价结果
  return {
    unitPrice: weightedUnitPrice,
    totalValue: weightedTotalValue,
    confidence: combinedConfidence,
    valuationMethod: '综合估价法',
    factors: {
      marketResult,
      incomeResult,
      costResult,
      weights: methodWeights,
    },
  };
}

/**
 * 根据估价方法调用相应的估价算法
 * @param {Object} params - 估价参数
 * @returns {Object} - 估价结果
 */
function calculateValuation(params) {
  const { valuationMethod } = params;

  switch (valuationMethod) {
    case '市场比较法':
      return marketComparisonMethod(params);
    case '收益法':
      return incomeMethod(params);
    case '成本法':
      return costMethod(params);
    case '综合估价法':
      return combinedValuationMethod(params);
    default:
      // 默认使用市场比较法
      return marketComparisonMethod(params);
  }
}

/**
 * 生成可比案例
 * @param {Object} params - 估价参数
 * @returns {Array} - 可比案例列表
 */
function generateComparableProperties(params) {
  const { area, buildingType, location } = params;

  // 模拟生成3个可比案例
  const comparableProperties = [];
  for (let i = 1; i <= 3; i++) {
    // 随机生成面积差异（±10%）
    const caseArea = area * (0.9 + Math.random() * 0.2);

    // 随机生成价格差异（±5%）
    const basePrice = basePrices[buildingType] || basePrices['住宅'];
    const casePrice = basePrice * (0.95 + Math.random() * 0.1);

    comparableProperties.push({
      caseId: `CASE${Date.now()}${i}`,
      area: Math.round(caseArea),
      buildingType,
      location,
      unitPrice: Math.round(casePrice),
      totalPrice: Math.round(casePrice * caseArea),
      transactionDate: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      similarity: Math.round(85 + Math.random() * 15), // 相似度85-100%
    });
  }

  return comparableProperties;
}

/**
 * 生成趋势分析
 * @param {Object} params - 估价参数
 * @returns {Object} - 趋势分析结果
 */
function generateTrendAnalysis(params) {
  const { buildingType, location } = params;

  // 模拟生成趋势数据
  const months = [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ];
  const basePrice = basePrices[buildingType] || basePrices['住宅'];

  // 生成月度价格趋势
  const monthlyTrend = months.map((month, index) => ({
    month,
    price: Math.round(basePrice * (0.95 + index * 0.01 + Math.random() * 0.02)),
  }));

  // 生成年度涨幅
  const yearOnYearGrowth = (Math.random() * 10 - 2).toFixed(1); // -2% 到 8%

  return {
    monthlyTrend,
    yearOnYearGrowth: parseFloat(yearOnYearGrowth),
    prediction: `预计未来6个月${buildingType}价格${parseFloat(yearOnYearGrowth) > 0 ? '上涨' : '下跌'}${Math.abs(parseFloat(yearOnYearGrowth))}%`,
  };
}

/**
 * 生成影响因素分析
 * @param {Object} params - 估价参数
 * @returns {Object} - 影响因素分析结果
 */
function generateFactorsAnalysis(params) {
  const {
    location,
    buildingType,
    decorationLevel,
    orientation,
    constructionYear,
    nearbyFacilities,
  } = params;

  // 影响因素权重
  const factors = [
    {
      name: '地理位置',
      value: Math.round(areaCorrectionFactors[location] * 100),
      weight: 0.3,
    },
    {
      name: '建筑类型',
      value: Math.round(buildingTypeCorrectionFactors[buildingType] * 100),
      weight: 0.2,
    },
    {
      name: '装修等级',
      value: Math.round(
        decorationLevelCorrectionFactors[decorationLevel] * 100
      ),
      weight: 0.15,
    },
    {
      name: '朝向',
      value: Math.round(orientationCorrectionFactors[orientation] * 100),
      weight: 0.1,
    },
    {
      name: '房龄',
      value: Math.max(
        50,
        100 - (new Date().getFullYear() - constructionYear) * 2
      ),
      weight: 0.15,
    },
    {
      name: '周边配套',
      value: Math.round((nearbyFacilities.length / 8) * 100),
      weight: 0.1,
    },
  ];

  return factors;
}

/**
 * 完整估价流程
 * @param {Object} params - 估价参数
 * @returns {Object} - 完整估价结果
 */
function performValuation(params) {
  try {
    // 计算基本估价结果
    const basicResult = calculateValuation(params);

    // 生成可比案例
    const comparableProperties = generateComparableProperties(params);

    // 生成趋势分析
    const trendAnalysis = generateTrendAnalysis(params);

    // 生成影响因素分析
    const factorsAnalysis = generateFactorsAnalysis(params);

    // 构建完整估价结果
    const valuationResult = {
      ...basicResult,
      propertyId: `PROP${Date.now()}`,
      valuationDate: new Date(),
      comparableProperties,
      trendAnalysis,
      evaluationDetails: {
        factorsAnalysis,
        valuationParams: params,
        confidenceLevel: basicResult.confidence,
      },
    };

    return valuationResult;
  } catch (error) {
    console.error('估价计算失败:', error);
    throw new Error('估价计算失败，请检查输入参数并重试');
  }
}

/**
 * 参数验证
 * @param {Object} params - 待验证的估价参数
 * @returns {Object} - 验证结果
 */
function validateValuationParams(params) {
  const errors = [];

  // 验证建筑面积
  if (params.area && (typeof params.area !== 'number' || params.area <= 0)) {
    errors.push('建筑面积必须是正数');
  }

  // 验证建成年份
  if (
    params.constructionYear &&
    (typeof params.constructionYear !== 'number' ||
      params.constructionYear > new Date().getFullYear())
  ) {
    errors.push('建成年份不能大于当前年份');
  }

  // 验证楼层
  if (
    params.floor &&
    params.totalFloors &&
    (params.floor > params.totalFloors || params.floor <= 0)
  ) {
    errors.push('楼层必须在1到总楼层之间');
  }

  // 验证绿化率
  if (
    params.greenRatio &&
    (typeof params.greenRatio !== 'number' ||
      params.greenRatio < 0 ||
      params.greenRatio > 100)
  ) {
    errors.push('绿化率必须在0到100之间');
  }

  // 验证容积率
  if (
    params.lotRatio &&
    (typeof params.lotRatio !== 'number' || params.lotRatio <= 0)
  ) {
    errors.push('容积率必须是正数');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 将函数暴露到全局对象，方便在HTML中调用
window.valuationEngine = {
  performValuation,
  validateValuationParams,
  calculateValuation,
  marketComparisonMethod,
  incomeMethod,
  costMethod,
  combinedValuationMethod,
  generateComparableProperties,
  generateTrendAnalysis,
  generateFactorsAnalysis,
};
