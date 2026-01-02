// 矩阵评估算法实现
import {
  evaluationConfig,
  ratingConfig,
} from '../models/matrixEvaluationModels';

// 定义评估因子接口
export interface EvaluationFactor {
  id: string;
  name: string;
  weight: number;
  description: string;
}

// 定义评估维度接口
export interface EvaluationDimension {
  weight: number;
  name: string;
  factors: EvaluationFactor[];
}

// 定义评估配置接口
export interface EvaluationConfig {
  [dimensionId: string]: EvaluationDimension;
}

// 定义评估等级接口
export interface Rating {
  min: number;
  max: number;
  rating: string;
  color: string;
}

// 定义位置因子得分接口
export interface LocationFactorScores {
  areaLevel: number;
  transportation: number;
  surroundingFacilities: number;
  environment: number;
}

// 定义建筑因子得分接口
export interface BuildingFactorScores {
  buildingType: number;
  decorationLevel: number;
  structure: number;
  buildingQuality: number;
}

// 定义户型因子得分接口
export interface LayoutFactorScores {
  area: number;
  layoutStructure: number;
  orientation: number;
  lightingVentilation: number;
}

// 定义市场因子得分接口
export interface MarketFactorScores {
  marketActivity: number;
  priceTrend: number;
  supplyDemand: number;
  areaPopularity: number;
}

// 定义其他因子得分接口
export interface OtherFactorScores {
  propertyRight: number;
  propertyManagement: number;
  floor: number;
  constructionYear: number;
}

// 定义因子得分接口
export interface FactorScores {
  location: LocationFactorScores;
  building: BuildingFactorScores;
  layout: LayoutFactorScores;
  market: MarketFactorScores;
  other: OtherFactorScores;
}

// 定义维度得分接口
export interface DimensionScores {
  [dimensionId: string]: number;
}

// 定义评估参数接口
export interface MatrixEvaluationParams {
  area: number;
  location: string;
  buildingType: string;
  decorationLevel: string;
  orientation: string;
  constructionYear: number;
  floor: number;
  totalFloors: number;
  structure?: string;
  propertyRight?: string;
  surroundingFacilities?: string[];
  marketActivity?: string;
  priceTrend?: string;
  supplyDemand?: string;
}

// 定义维度详情接口
export interface DimensionDetail {
  name: string;
  weight: number;
  score: number;
  factors: { [factorId: string]: any };
}

// 定义因子详情接口
export interface FactorDetail {
  name: string;
  dimensionId: string;
  dimensionName: string;
  weight: number;
  score: number;
  description: string;
}

// 定义评估报告接口
export interface EvaluationReport {
  evaluationDate: Date;
  totalScore: number;
  rating: string;
  confidence: number;
  dimensionDetails: { [dimensionId: string]: DimensionDetail };
  factorDetails: { [factorId: string]: FactorDetail };
}

// 定义完整评估结果接口
export interface MatrixEvaluationResult extends EvaluationReport {
  factorScores: FactorScores;
  dimensionScores: DimensionScores;
  evaluationConfig: EvaluationConfig;
}

/**
 * 计算区域等级得分
 * @param areaLevel - 区域等级
 * @returns 得分（1-5）
 */
const calculateAreaLevelScore = (areaLevel: string): number => {
  const areaLevelMap: { [key: string]: number } = {
    市中心: 5,
    城市中心区: 4.5,
    城市副中心: 4,
    城市新区: 3.5,
    城市郊区: 3,
    远郊区: 2.5,
    乡镇: 2,
    农村: 1,
  };
  return areaLevelMap[areaLevel] || 3;
};

/**
 * 计算交通便利度得分
 * @param transportation - 交通便利度描述
 * @returns 得分（1-5）
 */
const calculateTransportationScore = (_: string): number => {
  // 简单实现，实际项目中可根据详细交通数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算周边配套得分
 * @param facilities - 周边配套设施列表
 * @returns 得分（1-5）
 */
const calculateSurroundingFacilitiesScore = (facilities: string[]): number => {
  if (!facilities || facilities.length === 0) return 2;

  // 根据配套设施数量和类型计算得分
  const score = 2 + (facilities.length / 10) * 3;
  return Math.min(5, Math.round(score * 10) / 10);
};

/**
 * 计算环境质量得分
 * @param environment - 环境质量描述
 * @returns 得分（1-5）
 */
const calculateEnvironmentScore = (_: string): number => {
  // 简单实现，实际项目中可根据环境监测数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算建筑类型得分
 * @param buildingType - 建筑类型
 * @returns 得分（1-5）
 */
const calculateBuildingTypeScore = (buildingType: string): number => {
  const buildingTypeMap: { [key: string]: number } = {
    别墅: 5,
    花园洋房: 4.5,
    高层住宅: 4,
    小高层住宅: 4,
    多层住宅: 3.5,
    商业: 4,
    办公: 3.5,
    工业: 2.5,
  };
  return buildingTypeMap[buildingType] || 3;
};

/**
 * 计算装修等级得分
 * @param decorationLevel - 装修等级
 * @returns 得分（1-5）
 */
const calculateDecorationLevelScore = (decorationLevel: string): number => {
  const decorationLevelMap: { [key: string]: number } = {
    豪华装修: 5,
    精装修: 4.5,
    中装修: 3.5,
    简装修: 2.5,
    毛坯: 1.5,
  };
  return decorationLevelMap[decorationLevel] || 3;
};

/**
 * 计算建筑结构得分
 * @param structure - 建筑结构
 * @returns 得分（1-5）
 */
const calculateStructureScore = (structure: string): number => {
  const structureMap: { [key: string]: number } = {
    钢筋混凝土结构: 4.5,
    砖混结构: 3.5,
    钢结构: 4,
    木结构: 3,
    其他结构: 2.5,
  };
  return structureMap[structure] || 3;
};

/**
 * 计算建筑质量得分
 * @param buildingQuality - 建筑质量描述
 * @returns 得分（1-5）
 */
const calculateBuildingQualityScore = (_: string): number => {
  // 简单实现，实际项目中可根据建筑质量检测报告计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算面积得分
 * @param area - 建筑面积
 * @param buildingType - 建筑类型
 * @returns 得分（1-5）
 */
const calculateAreaScore = (area: number, buildingType: string): number => {
  // 根据建筑类型确定最优面积区间
  const optimalAreas: { [key: string]: [number, number] } = {
    住宅: [90, 140],
    商业: [50, 100],
    办公: [80, 150],
    别墅: [200, 300],
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
 * @param layoutStructure - 户型结构
 * @returns 得分（1-5）
 */
const calculateLayoutStructureScore = (_: string): number => {
  // 简单实现，实际项目中可根据户型合理性计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算朝向得分
 * @param orientation - 朝向
 * @returns 得分（1-5）
 */
const calculateOrientationScore = (orientation: string): number => {
  const orientationMap: { [key: string]: number } = {
    南北通透: 5,
    朝南: 4.5,
    东南: 4,
    西南: 3.5,
    朝北: 3,
    朝东: 3.5,
    朝西: 2.5,
    东西通透: 3.5,
  };
  return orientationMap[orientation] || 3;
};

/**
 * 计算采光通风得分
 * @param lightingVentilation - 采光通风描述
 * @returns 得分（1-5）
 */
const calculateLightingVentilationScore = (
  _: string
): number => {
  // 简单实现，实际项目中可根据采光通风数据计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算市场活跃度得分
 * @param marketActivity - 市场活跃度指标
 * @returns 得分（1-5）
 */
const calculateMarketActivityScore = (_: string): number => {
  // 简单实现，实际项目中可根据市场交易数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算价格趋势得分
 * @param priceTrend - 价格趋势
 * @returns 得分（1-5）
 */
const calculatePriceTrendScore = (priceTrend: string): number => {
  const trendMap: { [key: string]: number } = {
    快速上涨: 5,
    稳步上涨: 4.5,
    小幅上涨: 4,
    平稳: 3.5,
    小幅下跌: 3,
    稳步下跌: 2.5,
    快速下跌: 2,
  };
  return trendMap[priceTrend] || 3.5;
};

/**
 * 计算供需关系得分
 * @param supplyDemand - 供需关系
 * @returns 得分（1-5）
 */
const calculateSupplyDemandScore = (supplyDemand: string): number => {
  const supplyDemandMap: { [key: string]: number } = {
    供不应求: 5,
    供需平衡: 3.5,
    供大于求: 2,
  };
  return supplyDemandMap[supplyDemand] || 3.5;
};

/**
 * 计算区域热度得分
 * @param areaPopularity - 区域热度描述
 * @returns 得分（1-5）
 */
const calculateAreaPopularityScore = (_: string): number => {
  // 简单实现，实际项目中可根据区域关注度数据计算
  const score = Math.random() * 2 + 3; // 3-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算产权状况得分
 * @param propertyRight - 产权状况
 * @returns 得分（1-5）
 */
const calculatePropertyRightScore = (propertyRight: string): number => {
  const propertyRightMap: { [key: string]: number } = {
    '70年产权住宅': 5,
    '40年产权商业': 4.5,
    '50年产权办公': 4.5,
    '30年产权': 3.5,
    使用权: 2.5,
    抵押中: 3,
    查封: 1,
  };
  return propertyRightMap[propertyRight] || 3.5;
};

/**
 * 计算物业管理得分
 * @param propertyManagement - 物业管理描述
 * @returns 得分（1-5）
 */
const calculatePropertyManagementScore = (
  _: string
): number => {
  // 简单实现，实际项目中可根据物业管理评价数据计算
  const score = Math.random() * 1.5 + 3.5; // 3.5-5分
  return Math.round(score * 10) / 10;
};

/**
 * 计算楼层得分
 * @param floor - 所在楼层
 * @param totalFloors - 总楼层
 * @returns 得分（1-5）
 */
const calculateFloorScore = (floor: number, totalFloors: number): number => {
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
 * @param constructionYear - 建成年份
 * @returns 得分（1-5）
 */
const calculateConstructionYearScore = (constructionYear: number): number => {
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
 * @param params - 估价参数
 * @returns 因子得分
 */
export const calculateFactorScores = (
  params: MatrixEvaluationParams
): FactorScores => {
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
    supplyDemand = '供需平衡',
  } = params;

  const factorScores: FactorScores = {
    location: {
      areaLevel: calculateAreaLevelScore(location),
      transportation: calculateTransportationScore(location),
      surroundingFacilities: calculateSurroundingFacilitiesScore(
        surroundingFacilities
      ),
      environment: calculateEnvironmentScore(location),
    },
    building: {
      buildingType: calculateBuildingTypeScore(buildingType),
      decorationLevel: calculateDecorationLevelScore(decorationLevel),
      structure: calculateStructureScore(structure),
      buildingQuality: calculateBuildingQualityScore(buildingType),
    },
    layout: {
      area: calculateAreaScore(area, buildingType),
      layoutStructure: calculateLayoutStructureScore(buildingType),
      orientation: calculateOrientationScore(orientation),
      lightingVentilation: calculateLightingVentilationScore(orientation),
    },
    market: {
      marketActivity: calculateMarketActivityScore(marketActivity),
      priceTrend: calculatePriceTrendScore(priceTrend),
      supplyDemand: calculateSupplyDemandScore(supplyDemand),
      areaPopularity: calculateAreaPopularityScore(location),
    },
    other: {
      propertyRight: calculatePropertyRightScore(propertyRight),
      propertyManagement: calculatePropertyManagementScore(buildingType),
      floor: calculateFloorScore(floor, totalFloors),
      constructionYear: calculateConstructionYearScore(constructionYear),
    },
  };

  return factorScores;
};

/**
 * 计算维度得分
 * @param factorScores - 因子得分
 * @param dimensions - 评估维度配置
 * @returns 维度得分
 */
export const calculateDimensionScores = (
  factorScores: FactorScores,
  dimensions: EvaluationConfig
): DimensionScores => {
  const dimensionScores: DimensionScores = {};

  Object.keys(dimensions).forEach((dimensionId) => {
    const dimension = dimensions[dimensionId];
    let dimensionScore = 0;

    dimension.factors.forEach((factor) => {
      const factorScore = (factorScores as any)[dimensionId][factor.id];
      dimensionScore += factorScore * factor.weight;
    });

    dimensionScores[dimensionId] = Math.round(dimensionScore * 10) / 10;
  });

  return dimensionScores;
};

/**
 * 计算综合得分
 * @param dimensionScores - 维度得分
 * @param dimensions - 评估维度配置
 * @returns 综合得分
 */
export const calculateTotalScore = (
  dimensionScores: DimensionScores,
  dimensions: EvaluationConfig
): number => {
  let totalScore = 0;

  Object.keys(dimensions).forEach((dimensionId) => {
    const dimension = dimensions[dimensionId];
    const dimensionScore = dimensionScores[dimensionId];
    totalScore += dimensionScore * dimension.weight;
  });

  return Math.round(totalScore * 10) / 10;
};

/**
 * 计算评估等级
 * @param totalScore - 综合得分
 * @returns 评估等级
 */
export const calculateRating = (totalScore: number): string => {
  for (const rating of ratingConfig) {
    if (totalScore >= rating.min && totalScore <= rating.max) {
      return rating.rating;
    }
  }
  return '中等';
};

/**
 * 计算置信度
 * @param params - 估价参数
 * @returns 置信度（%）
 */
export const calculateConfidence = (_: MatrixEvaluationParams): number => {
  // 根据参数完整性和数据质量计算置信度
  const confidence = Math.random() * 15 + 85; // 85%-100%
  return Math.round(confidence);
};

/**
 * 生成完整的矩阵评估报告
 * @param factorScores - 因子得分
 * @param dimensionScores - 维度得分
 * @param evaluationConfig - 评估配置
 * @param totalScore - 综合得分
 * @param rating - 评估等级
 * @param confidence - 置信度
 * @returns 完整评估报告
 */
export const generateEvaluationReport = (
  factorScores: FactorScores,
  dimensionScores: DimensionScores,
  evaluationConfig: EvaluationConfig,
  totalScore: number,
  rating: string,
  confidence: number
): EvaluationReport => {
  const report: EvaluationReport = {
    evaluationDate: new Date(),
    totalScore,
    rating,
    confidence,
    dimensionDetails: {},
    factorDetails: {},
  };

  // 构建维度详情
  Object.keys(evaluationConfig).forEach((dimensionId) => {
    const dimension = evaluationConfig[dimensionId];
    report.dimensionDetails[dimensionId] = {
      name: dimension.name,
      weight: dimension.weight * 100,
      score: dimensionScores[dimensionId],
      factors: {},
    };
  });

  // 构建因子详情
  Object.keys(evaluationConfig).forEach((dimensionId) => {
    const dimension = evaluationConfig[dimensionId];
    const factors = dimension.factors;

    factors.forEach((factor) => {
      report.factorDetails[factor.id] = {
        name: factor.name,
        dimensionId,
        dimensionName: dimension.name,
        weight: factor.weight * 100,
        score: (factorScores as any)[dimensionId][factor.id],
        description: factor.description,
      };
    });
  });

  return report;
};

/**
 * 主矩阵评估函数
 * @param params - 估价参数
 * @returns 矩阵评估结果
 */
export const matrixEvaluation = (
  params: MatrixEvaluationParams
): MatrixEvaluationResult => {
  // 1. 计算因子得分
  const factorScores = calculateFactorScores(params);

  // 2. 计算维度得分
  const dimensionScores = calculateDimensionScores(
    factorScores,
    evaluationConfig
  );

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
    evaluationConfig,
  };
};

/**
 * 批量矩阵评估函数
 * @param paramsList - 多个估价参数列表
 * @returns 多个矩阵评估结果
 */
export const batchMatrixEvaluation = (
  paramsList: MatrixEvaluationParams[]
): MatrixEvaluationResult[] => {
  return paramsList.map((params) => matrixEvaluation(params));
};
