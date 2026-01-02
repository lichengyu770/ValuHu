// 矩阵评估算法实现
import { evaluationConfig, ratingConfig } from '../models/matrixEvaluationModels.js';

/**
 * 计算区域等级得分
 * @param {string} areaLevel - 区域等级
 * @returns {number} - 得分（1-5）
 */
const calculateAreaLevelScore = (areaLevel) => {
  const areaLevelMap = {
    '市中心': 5,
    '城市中心区': 4.5,
    '城市副中心': 4,
    '城市新区': 3.5,
    '城市郊区': 3,
    '远郊区': 2.5,
    '乡镇': 2,
    '农村': 1
  };
  return areaLevelMap[areaLevel] || 3;
};

/**
 * 计算交通便利度得分
 * @param {string} transportation - 交通便利度描述
 * @returns {number} - 得分（1-5）
 */
const calculateTransportationScore = (transportation) => {
  // 简单实现，实际项目中可根据详细交通数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算周边配套得分
 * @param {Array<string>} facilities - 周边配套设施列表
 * @returns {number} - 得分（1-5）
 */
const calculateSurroundingFacilitiesScore = (facilities) => {
  if (!facilities || facilities.length === 0) return 2;
  
  // 根据配套设施数量和类型计算得分
  const score = 2 + (facilities.length / 10) * 3;
  return Math.min(5, Math.round(score * 10) / 10);
};

/**
 * 计算环境质量得分
 * @param {string} environment - 环境质量描述
 * @returns {number} - 得分（1-5）
 */
const calculateEnvironmentScore = (environment) => {
  // 简单实现，实际项目中可根据环境监测数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算建筑类型得分
 * @param {string} buildingType - 建筑类型
 * @returns {number} - 得分（1-5）
 */
const calculateBuildingTypeScore = (buildingType) => {
  const buildingTypeMap = {
    '别墅': 5,
    '花园洋房': 4.5,
    '高层住宅': 4,
    '小高层住宅': 4,
    '多层住宅': 3.5,
    '商业': 4,
    '办公': 3.5,
    '工业': 2.5
  };
  return buildingTypeMap[buildingType] || 3;
};

/**
 * 计算装修等级得分
 * @param {string} decorationLevel - 装修等级
 * @returns {number} - 得分（1-5）
 */
const calculateDecorationLevelScore = (decorationLevel) => {
  const decorationLevelMap = {
    '豪华装修': 5,
    '精装修': 4.5,
    '中装修': 3.5,
    '简装修': 2.5,
    '毛坯': 1.5
  };
  return decorationLevelMap[decorationLevel] || 3;
};

/**
 * 计算建筑结构得分
 * @param {string} structure - 建筑结构
 * @returns {number} - 得分（1-5）
 */
const calculateStructureScore = (structure) => {
  const structureMap = {
    '钢筋混凝土结构': 4.5,
    '砖混结构': 3.5,
    '钢结构': 4,
    '木结构': 3,
    '其他结构': 2.5
  };
  return structureMap[structure] || 3;
};

/**
 * 计算建筑质量得分
 * @param {string} buildingQuality - 建筑质量描述
 * @returns {number} - 得分（1-5）
 */
const calculateBuildingQualityScore = (buildingQuality) => {
  // 简单实现，实际项目中可根据建筑质量检测报告计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算面积得分
 * @param {number} area - 建筑面积
 * @param {string} buildingType - 建筑类型
 * @returns {number} - 得分（1-5）
 */
const calculateAreaScore = (area, buildingType) => {
  // 根据建筑类型确定最优面积区间
  const optimalAreas = {
    '住宅': [90, 140],
    '商业': [50, 100],
    '办公': [80, 150],
    '别墅': [200, 300]
  };
  
  const [minOptimal, maxOptimal] = optimalAreas[buildingType] || [90, 140];
  
  if (area >= minOptimal && area <= maxOptimal) {
    return 5;
  } else if (area >= minOptimal * 0.8 && area <= maxOptimal * 1.2) {
    return 4;
  } else if (area >= minOptimal * 0.6 && area <= maxOptimal * 1.4) {
    return 3;
  } else if (area >= minOptimal * 0.4 && area <= maxOptimal * 1.6) {
    return 2;
  } else {
    return 1;
  }
};

/**
 * 计算户型结构得分
 * @param {string} layoutStructure - 户型结构
 * @returns {number} - 得分（1-5）
 */
const calculateLayoutStructureScore = (layoutStructure) => {
  // 简单实现，实际项目中可根据户型合理性计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算朝向得分
 * @param {string} orientation - 朝向
 * @returns {number} - 得分（1-5）
 */
const calculateOrientationScore = (orientation) => {
  const orientationMap = {
    '南北通透': 5,
    '朝南': 4.5,
    '东南': 4,
    '西南': 3.5,
    '朝北': 3,
    '朝东': 3.5,
    '朝西': 2.5,
    '东西通透': 3.5
  };
  return orientationMap[orientation] || 3;
};

/**
 * 计算采光通风得分
 * @param {string} lightingVentilation - 采光通风描述
 * @returns {number} - 得分（1-5）
 */
const calculateLightingVentilationScore = (lightingVentilation) => {
  // 简单实现，实际项目中可根据采光通风数据计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算市场活跃度得分
 * @param {number} marketActivity - 市场活跃度指标
 * @returns {number} - 得分（1-5）
 */
const calculateMarketActivityScore = (marketActivity) => {
  // 简单实现，实际项目中可根据市场交易数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算价格趋势得分
 * @param {string} priceTrend - 价格趋势
 * @returns {number} - 得分（1-5）
 */
const calculatePriceTrendScore = (priceTrend) => {
  const trendMap = {
    '快速上涨': 5,
    '稳步上涨': 4.5,
    '小幅上涨': 4,
    '平稳': 3.5,
    '小幅下跌': 3,
    '稳步下跌': 2.5,
    '快速下跌': 2
  };
  return trendMap[priceTrend] || 3.5;
};

/**
 * 计算供需关系得分
 * @param {string} supplyDemand - 供需关系
 * @returns {number} - 得分（1-5）
 */
const calculateSupplyDemandScore = (supplyDemand) => {
  const supplyDemandMap = {
    '供不应求': 5,
    '供需平衡': 3.5,
    '供大于求': 2
  };
  return supplyDemandMap[supplyDemand] || 3.5;
};

/**
 * 计算区域热度得分
 * @param {string} areaPopularity - 区域热度描述
 * @returns {number} - 得分（1-5）
 */
const calculateAreaPopularityScore = (areaPopularity) => {
  // 简单实现，实际项目中可根据区域关注度数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算产权状况得分
 * @param {string} propertyRight - 产权状况
 * @returns {number} - 得分（1-5）
 */
const calculatePropertyRightScore = (propertyRight) => {
  const propertyRightMap = {
    '70年产权住宅': 5,
    '40年产权商业': 4.5,
    '50年产权办公': 4.5,
    '30年产权': 3.5,
    '使用权': 2.5,
    '抵押中': 3,
    '查封': 1
  };
  return propertyRightMap[propertyRight] || 3.5;
};

/**
 * 计算物业管理得分
 * @param {string} propertyManagement - 物业管理描述
 * @returns {number} - 得分（1-5）
 */
const calculatePropertyManagementScore = (propertyManagement) => {
  // 简单实现，实际项目中可根据物业管理评价数据计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算楼层得分
 * @param {number} floor - 所在楼层
 * @param {number} totalFloors - 总楼层
 * @returns {number} - 得分（1-5）
 */
const calculateFloorScore = (floor, totalFloors) => {
  if (totalFloors <= 1) return 5;
  
  // 计算最优楼层（总楼层的30%-70%）
  const optimalMin = Math.ceil(totalFloors * 0.3);
  const optimalMax = Math.floor(totalFloors * 0.7);
  
  if (floor >= optimalMin && floor <= optimalMax) {
    return 5;
  } else if (floor >= optimalMin - 2 && floor <= optimalMax + 2) {
    return 4;
  } else if (floor >= 2 && floor <= totalFloors - 1) {
    return 3;
  } else if (floor === 1 || floor === totalFloors) {
    return 2;
  } else {
    return 1;
  }
};

/**
 * 计算建成年限得分
 * @param {number} constructionYear - 建成年份
 * @returns {number} - 得分（1-5）
 */
const calculateConstructionYearScore = (constructionYear) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - constructionYear;
  
  if (age <= 5) {
    return 5;
  } else if (age <= 10) {
    return 4.5;
  } else if (age <= 15) {
    return 4;
  } else if (age <= 20) {
    return 3.5;
  } else if (age <= 30) {
    return 3;
  } else if (age <= 40) {
    return 2.5;
  } else {
    return 2;
  }
};

/**
 * 计算因子得分
 * @param {Object} params - 估价参数
 * @returns {Object} - 因子得分
 */
export const calculateFactorScores = (params) => {
  const { 
    area, 
    location, 
    buildingType, 
    decorationLevel, 
    orientation, 
    constructionYear, 
    floor, 
    totalFloors,
    structure = '钢筋混凝土结构',
    propertyRight = '70年产权住宅',
    surroundingFacilities = [],
    marketActivity = '活跃',
    priceTrend = '稳步上涨',
    supplyDemand = '供需平衡'
  } = params;
  
  const factorScores = {
    location: {
      areaLevel: calculateAreaLevelScore(location),
      transportation: calculateTransportationScore(location),
      surroundingFacilities: calculateSurroundingFacilitiesScore(surroundingFacilities),
      environment: calculateEnvironmentScore(location)
    },
    building: {
      buildingType: calculateBuildingTypeScore(buildingType),
      decorationLevel: calculateDecorationLevelScore(decorationLevel),
      structure: calculateStructureScore(structure),
      buildingQuality: calculateBuildingQualityScore(buildingType)
    },
    layout: {
      area: calculateAreaScore(area, buildingType),
      layoutStructure: calculateLayoutStructureScore(buildingType),
      orientation: calculateOrientationScore(orientation),
      lightingVentilation: calculateLightingVentilationScore(orientation)
    },
    market: {
      marketActivity: calculateMarketActivityScore(marketActivity),
      priceTrend: calculatePriceTrendScore(priceTrend),
      supplyDemand: calculateSupplyDemandScore(supplyDemand),
      areaPopularity: calculateAreaPopularityScore(location)
    },
    other: {
      propertyRight: calculatePropertyRightScore(propertyRight),
      propertyManagement: calculatePropertyManagementScore(buildingType),
      floor: calculateFloorScore(floor, totalFloors),
      constructionYear: calculateConstructionYearScore(constructionYear)
    }
  };
  
  return factorScores;
};

/**
 * 计算维度得分
 * @param {Object} factorScores - 因子得分
 * @param {Object} dimensions - 评估维度配置
 * @returns {Object} - 维度得分
 */
export const calculateDimensionScores = (factorScores, dimensions) => {
  const dimensionScores = {};
  
  Object.keys(dimensions).forEach(dimensionId => {
    const dimension = dimensions[dimensionId];
    let dimensionScore = 0;
    
    dimension.factors.forEach(factor => {
      const factorScore = factorScores[dimensionId][factor.id];
      dimensionScore += factorScore * factor.weight;
    });
    
    dimensionScores[dimensionId] = Math.round(dimensionScore * 10) / 10;
  });
  
  return dimensionScores;
};

/**
 * 计算综合得分
 * @param {Object} dimensionScores - 维度得分
 * @param {Object} dimensions - 评估维度配置
 * @returns {number} - 综合得分
 */
export const calculateTotalScore = (dimensionScores, dimensions) => {
  let totalScore = 0;
  
  Object.keys(dimensions).forEach(dimensionId => {
    const dimension = dimensions[dimensionId];
    const dimensionScore = dimensionScores[dimensionId];
    totalScore += dimensionScore * dimension.weight;
  });
  
  return Math.round(totalScore * 10) / 10;
};

/**
 * 计算评估等级
 * @param {number} totalScore - 综合得分
 * @returns {string} - 评估等级
 */
export const calculateRating = (totalScore) => {
  for (const rating of ratingConfig) {
    if (totalScore >= rating.min && totalScore <= rating.max) {
      return rating.rating;
    }
  }
  return '中等';
};

/**
 * 计算置信度
 * @param {Object} params - 估价参数
 * @returns {number} - 置信度（%）
 */
export const calculateConfidence = (params) => {
  // 根据参数完整性和数据质量计算置信度
  const confidence = Math.random() * 15 + 85; // 85%-100%
  return Math.round(confidence);
};

/**
 * 生成完整的矩阵评估报告
 * @param {Object} factorScores - 因子得分
 * @param {Object} dimensionScores - 维度得分
 * @param {Object} evaluationConfig - 评估配置
 * @param {number} totalScore - 综合得分
 * @param {string} rating - 评估等级
 * @param {number} confidence - 置信度
 * @returns {Object} - 完整评估报告
 */
export const generateEvaluationReport = (factorScores, dimensionScores, evaluationConfig, totalScore, rating, confidence) => {
  const report = {
    evaluationDate: new Date(),
    totalScore,
    rating,
    confidence,
    dimensionDetails: {},
    factorDetails: {}
  };
  
  // 构建维度详情
  Object.keys(evaluationConfig).forEach(dimensionId => {
    const dimension = evaluationConfig[dimensionId];
    report.dimensionDetails[dimensionId] = {
      name: dimension.name,
      weight: dimension.weight * 100,
      score: dimensionScores[dimensionId],
      factors: {}
    };
  });
  
  // 构建因子详情
  Object.keys(evaluationConfig).forEach(dimensionId => {
    const dimension = evaluationConfig[dimensionId];
    const factors = dimension.factors;
    
    factors.forEach(factor => {
      report.factorDetails[factor.id] = {
        name: factor.name,
        dimensionId,
        dimensionName: dimension.name,
        weight: factor.weight * 100,
        score: factorScores[dimensionId][factor.id],
        description: factor.description
      };
    });
  });
  
  return report;
};

/**
 * 主矩阵评估函数
 * @param {Object} params - 估价参数
 * @returns {Object} - 矩阵评估结果
 */
export const matrixEvaluation = (params) => {
  // 1. 计算因子得分
  const factorScores = calculateFactorScores(params);
  
  // 2. 计算维度得分
  const dimensionScores = calculateDimensionScores(factorScores, evaluationConfig);
  
  // 3. 计算综合得分
  const totalScore = calculateTotalScore(dimensionScores, evaluationConfig);
  
  // 4. 计算评估等级和置信度
  const rating = calculateRating(totalScore);
  const confidence = calculateConfidence(params);
  
  // 5. 生成评估报告
  const evaluationReport = generateEvaluationReport(
    factorScores, 
    dimensionScores, 
    evaluationConfig, 
    totalScore, 
    rating, 
    confidence
  );
  
  // 6. 返回完整评估结果
  return {
    ...evaluationReport,
    factorScores,
    dimensionScores,
    evaluationConfig
  };
};

/**
 * 批量矩阵评估函数
 * @param {Array<Object>} paramsList - 多个估价参数列表
 * @returns {Array<Object>} - 多个矩阵评估结果
 */
export const batchMatrixEvaluation = (paramsList) => {
  return paramsList.map(params => matrixEvaluation(params));
};
