// 估价相关类型定义

export interface PropertyInfo {
  city: string;
  district: string;
  area: number;
  rooms: number;
  bathrooms: number;
  year: number;
  buildingType: string;
  floor: number;
  totalFloors: number;
  orientation: string;
  decorationLevel: string;
  nearbyFacilities: string[];
  transportation: string[];
  // 新增估价因子
  lotRatio: number; // 容积率
  greenRatio: number; // 绿化率
  propertyType: string; // 物业类型
  managementFee: number; // 物业管理费
  parkingSpaces: number; // 停车位数量
  elevator: boolean; // 是否有电梯
  heating: boolean; // 是否有暖气
  cooling: boolean; // 是否有空调
  securityLevel: string; // 安全等级
  communityQuality: string; // 社区品质
  schoolDistrict: boolean; // 是否学区房
  hospitalDistance: number; // 医院距离（米）
  shoppingDistance: number; // 购物中心距离（米）
  parkDistance: number; // 公园距离（米）
  subwayDistance: number; // 地铁距离（米）
  busStopDistance: number; // 公交站距离（米）
  noiseLevel: number; // 噪音水平（0-100）
  airQuality: number; // 空气质量指数
  floodRisk: string; // 洪水风险等级
  earthquakeRisk: string; // 地震风险等级
  futurePlan: string; // 未来规划影响
  marketTrend: string; // 市场趋势
  // GIS相关估价因子
  gisLocationId?: string; // GIS位置ID
  gisCostIndex?: number; // GIS造价指数
  gisLandPrice?: number; // GIS地价数据
  gisInfrastructureScore?: number; // GIS基础设施评分
  gisEnvironmentalScore?: number; // GIS环境评分
  gisTransportationScore?: number; // GIS交通便利度评分
  gisCommercialScore?: number; // GIS商业配套评分
  gisEducationalScore?: number; // GIS教育配套评分
  gisMedicalScore?: number; // GIS医疗配套评分
  gisGreenSpaceRatio?: number; // GIS绿地率
}

export interface ValuationResult {
  price: number;
  unitPrice: number;
  algorithm: string;
  factors: {
    name: string;
    value: number;
    weight: number;
    algorithm?: string;
  }[];
  algorithmWeights?: {
    name: string;
    weight: number;
    resultPrice: number;
  }[];
  timestamp: Date;
}

export interface ComparisonProperty {
  id: string;
  area: number;
  price: number;
  unitPrice: number;
  distance: number;
  similarity: number;
  transactionDate: Date;
}

export interface ValuationAlgorithm {
  name: string;
  description: string;
  calculate(property: PropertyInfo, additionalData?: any): ValuationResult;
}

// 基础估价算法
class BasicValuationAlgorithm implements ValuationAlgorithm {
  name = '基础估价法';
  description = '基于基础参数的简单估价算法';

  calculate(property: PropertyInfo): ValuationResult {
    // 基础单价，根据城市和区域设定
    const basePriceMap: Record<string, number> = {
      '湘潭-雨湖': 8000,
      '湘潭-岳塘': 7500,
      '湘潭-湘潭县': 6500,
    };

    // 使用GIS地价数据调整基础单价（如果有）
    let basePrice = basePriceMap[`${property.city}-${property.district}`] || 7000;
    if (property.gisLandPrice) {
      // 使用GIS地价数据调整基础单价，权重60%
      basePrice = Math.round(basePrice * 0.4 + property.gisLandPrice * 0.6);
    }

    // 影响因素权重
    const factors = [
      {
        name: '房龄',
        value: this.calculateYearFactor(property.year),
        weight: 0.12,
      },
      {
        name: '楼层',
        value: this.calculateFloorFactor(property.floor, property.totalFloors),
        weight: 0.08,
      },
      {
        name: '朝向',
        value: this.calculateOrientationFactor(property.orientation),
        weight: 0.06,
      },
      {
        name: '装修',
        value: this.calculateDecorationFactor(property.decorationLevel),
        weight: 0.08,
      },
      {
        name: '容积率',
        value: this.calculateLotRatioFactor(property.lotRatio),
        weight: 0.06,
      },
      {
        name: '绿化率',
        value: this.calculateGreenRatioFactor(property.greenRatio),
        weight: 0.06,
      },
      {
        name: '物业类型',
        value: this.calculatePropertyTypeFactor(property.propertyType),
        weight: 0.07,
      },
      {
        name: '社区品质',
        value: this.calculateCommunityQualityFactor(property.communityQuality),
        weight: 0.08,
      },
      {
        name: '学区房',
        value: this.calculateSchoolDistrictFactor(property.schoolDistrict),
        weight: 0.09,
      },
      {
        name: '交通便利度',
        value: this.calculateTransportationFactorV2(property),
        weight: 0.08,
      },
      {
        name: '生活便利性',
        value: this.calculateLivingConvenienceFactor(property),
        weight: 0.05,
      },
      // 新增GIS相关因子
      {
        name: 'GIS造价指数',
        value: this.calculateGisCostIndexFactor(property.gisCostIndex),
        weight: 0.08,
      },
      {
        name: 'GIS基础设施评分',
        value: this.calculateGisInfrastructureFactor(property.gisInfrastructureScore),
        weight: 0.05,
      },
      {
        name: 'GIS环境评分',
        value: this.calculateGisEnvironmentalFactor(property.gisEnvironmentalScore),
        weight: 0.05,
      },
      {
        name: 'GIS交通便利度评分',
        value: this.calculateGisTransportationFactor(property.gisTransportationScore),
        weight: 0.06,
      },
      {
        name: 'GIS商业配套评分',
        value: this.calculateGisCommercialFactor(property.gisCommercialScore),
        weight: 0.05,
      },
      {
        name: 'GIS教育配套评分',
        value: this.calculateGisEducationalFactor(property.gisEducationalScore),
        weight: 0.09,
      },
      {
        name: 'GIS医疗配套评分',
        value: this.calculateGisMedicalFactor(property.gisMedicalScore),
        weight: 0.05,
      },
      {
        name: 'GIS绿地率',
        value: this.calculateGisGreenSpaceFactor(property.gisGreenSpaceRatio),
        weight: 0.04,
      },
    ];

    // 计算综合系数
    const totalFactor = factors.reduce(
      (sum, factor) => sum + factor.value * factor.weight,
      0
    );
    const finalPrice = Math.round(basePrice * property.area * totalFactor);

    return {
      price: finalPrice,
      unitPrice: Math.round(finalPrice / property.area),
      algorithm: this.name,
      factors,
      timestamp: new Date(),
    };
  }

  private calculateYearFactor(year: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    if (age < 5) return 1.1;
    if (age < 10) return 1.0;
    if (age < 20) return 0.9;
    if (age < 30) return 0.8;
    return 0.7;
  }

  private calculateFloorFactor(floor: number, totalFloors: number): number {
    if (totalFloors <= 6) {
      // 多层建筑
      if (floor === 3 || floor === 4) return 1.1;
      if (floor === 2 || floor === 5) return 1.0;
      if (floor === 1 || floor === 6) return 0.9;
    } else {
      // 高层建筑
      const middleFloor = Math.floor(totalFloors / 2);
      if (floor >= middleFloor - 2 && floor <= middleFloor + 2) return 1.1;
      if (floor >= 2 && floor <= totalFloors - 1) return 1.0;
      return 0.9;
    }
    return 1.0;
  }

  private calculateOrientationFactor(orientation: string): number {
    const goodOrientations = ['南北', '南'];
    const averageOrientations = ['东西', '东'];
    const poorOrientations = ['西', '北'];

    if (goodOrientations.includes(orientation)) return 1.1;
    if (averageOrientations.includes(orientation)) return 1.0;
    if (poorOrientations.includes(orientation)) return 0.9;
    return 1.0;
  }

  private calculateDecorationFactor(decorationLevel: string): number {
    const decorationMap: Record<string, number> = {
      豪华装修: 1.2,
      精装修: 1.1,
      简装修: 1.0,
      毛坯: 0.8,
    };
    return decorationMap[decorationLevel] || 1.0;
  }

  private calculateFacilityFactor(facilities: string[]): number {
    const facilityScore = facilities.length * 0.05;
    return Math.min(1.2, 1.0 + facilityScore);
  }

  private calculateTransportationFactor(transportation: string[]): number {
    const transportationScore = transportation.length * 0.08;
    return Math.min(1.2, 1.0 + transportationScore);
  }

  // 新增估价因子计算方法
  private calculateLotRatioFactor(lotRatio: number): number {
    // 容积率越低越好
    if (lotRatio < 1.5) return 1.15;
    if (lotRatio < 2.5) return 1.05;
    if (lotRatio < 3.5) return 1.0;
    if (lotRatio < 4.5) return 0.95;
    return 0.9;
  }

  private calculateGreenRatioFactor(greenRatio: number): number {
    // 绿化率越高越好
    if (greenRatio >= 40) return 1.2;
    if (greenRatio >= 30) return 1.1;
    if (greenRatio >= 20) return 1.0;
    if (greenRatio >= 10) return 0.9;
    return 0.8;
  }

  private calculatePropertyTypeFactor(propertyType: string): number {
    const propertyTypeMap: Record<string, number> = {
      '住宅': 1.0,
      '别墅': 1.3,
      '公寓': 0.95,
      '写字楼': 1.2,
      '商铺': 1.4,
      '工业': 0.7,
      '仓库': 0.65,
      '厂房': 0.75,
    };
    return propertyTypeMap[propertyType] || 1.0;
  }

  private calculateCommunityQualityFactor(quality: string): number {
    const qualityMap: Record<string, number> = {
      '高档': 1.2,
      '中档': 1.0,
      '普通': 0.9,
      '较差': 0.8,
    };
    return qualityMap[quality] || 1.0;
  }

  private calculateSchoolDistrictFactor(isSchoolDistrict: boolean): number {
    return isSchoolDistrict ? 1.2 : 1.0;
  }

  private calculateTransportationFactorV2(property: PropertyInfo): number {
    // 综合考虑地铁、公交、距离等因素
    let score = 1.0;
    
    // 地铁距离影响
    if (property.subwayDistance < 500) score += 0.15;
    else if (property.subwayDistance < 1000) score += 0.1;
    else if (property.subwayDistance < 2000) score += 0.05;
    
    // 公交站距离影响
    if (property.busStopDistance < 200) score += 0.08;
    else if (property.busStopDistance < 500) score += 0.05;
    
    // 交通方式数量影响
    score += property.transportation.length * 0.03;
    
    return Math.min(1.3, score);
  }

  private calculateLivingConvenienceFactor(property: PropertyInfo): number {
    // 综合考虑医院、购物中心、公园等因素
    let score = 1.0;
    
    // 医院距离影响
    if (property.hospitalDistance < 1000) score += 0.08;
    else if (property.hospitalDistance < 2000) score += 0.05;
    
    // 购物中心距离影响
    if (property.shoppingDistance < 500) score += 0.1;
    else if (property.shoppingDistance < 1000) score += 0.07;
    
    // 公园距离影响
    if (property.parkDistance < 500) score += 0.08;
    else if (property.parkDistance < 1000) score += 0.05;
    
    // 配套设施数量影响
    score += property.nearbyFacilities.length * 0.03;
    
    return Math.min(1.3, score);
  }

  // GIS相关因子计算方法
  private calculateGisCostIndexFactor(costIndex?: number): number {
    // GIS造价指数越高，价值越高
    if (!costIndex) return 1.0;
    // 归一化处理，确保在0.8-1.5之间
    const normalizedIndex = Math.max(0.8, Math.min(1.5, costIndex));
    return normalizedIndex;
  }

  private calculateGisInfrastructureFactor(score?: number): number {
    // GIS基础设施评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.3的系数
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.3;
  }

  private calculateGisEnvironmentalFactor(score?: number): number {
    // GIS环境评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.2的系数
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.2;
  }

  private calculateGisTransportationFactor(score?: number): number {
    // GIS交通便利度评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.25的系数
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.25;
  }

  private calculateGisCommercialFactor(score?: number): number {
    // GIS商业配套评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.3的系数
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.3;
  }

  private calculateGisEducationalFactor(score?: number): number {
    // GIS教育配套评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.4的系数（教育对房价影响较大）
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.4;
  }

  private calculateGisMedicalFactor(score?: number): number {
    // GIS医疗配套评分越高，价值越高
    if (!score) return 1.0;
    // 将评分(0-100)转换为1.0-1.25的系数
    const normalizedScore = Math.max(0, Math.min(100, score));
    return 1.0 + (normalizedScore / 100) * 0.25;
  }

  private calculateGisGreenSpaceFactor(ratio?: number): number {
    // GIS绿地率越高，价值越高
    if (!ratio) return 1.0;
    // 将比率(0-100)转换为1.0-1.15的系数
    const normalizedRatio = Math.max(0, Math.min(100, ratio));
    return 1.0 + (normalizedRatio / 100) * 0.15;
  }
}

// 市场比较法
class MarketComparisonAlgorithm implements ValuationAlgorithm {
  name = '市场比较法';
  description = '基于市场成交案例的比较估价算法';

  calculate(
    property: PropertyInfo,
    comparisonProperties?: ComparisonProperty[]
  ): ValuationResult {
    // 如果没有提供比较案例，使用默认数据
    const defaultComparisons: ComparisonProperty[] = [
      {
        id: '1',
        area: property.area * 0.95,
        price: 850000,
        unitPrice: 7083,
        distance: 500,
        similarity: 0.92,
        transactionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前
      },
      {
        id: '2',
        area: property.area * 1.05,
        price: 920000,
        unitPrice: 7109,
        distance: 800,
        similarity: 0.88,
        transactionDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45天前
      },
      {
        id: '3',
        area: property.area * 0.98,
        price: 880000,
        unitPrice: 7213,
        distance: 300,
        similarity: 0.95,
        transactionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15天前
      },
    ];

    const comparisons = comparisonProperties || defaultComparisons;

    // 计算比较案例的权重
    const weightedComparisons = comparisons.map((comp) => {
      // 距离权重 (越近权重越高)
      const distanceWeight = Math.max(0.5, 1 - comp.distance / 2000);
      // 相似度权重
      const similarityWeight = comp.similarity;
      // 成交时间权重 (越近权重越高)
      const daysSinceTransaction =
        (Date.now() - comp.transactionDate.getTime()) / (24 * 60 * 60 * 1000);
      const timeWeight = Math.max(0.5, 1 - daysSinceTransaction / 365);

      // 综合权重
      const totalWeight =
        distanceWeight * 0.4 + similarityWeight * 0.4 + timeWeight * 0.2;

      return {
        ...comp,
        weight: totalWeight,
      };
    });

    // 计算加权平均单价
    const totalWeight = weightedComparisons.reduce(
      (sum, comp) => sum + comp.weight,
      0
    );
    const weightedUnitPrice =
      weightedComparisons.reduce(
        (sum, comp) => sum + comp.unitPrice * comp.weight,
        0
      ) / totalWeight;

    // 面积调整
    const areaAdjustment =
      (property.area /
        weightedComparisons.reduce(
          (sum, comp) => sum + comp.area * comp.weight,
          0
        )) *
      totalWeight;
    const finalUnitPrice = weightedUnitPrice * areaAdjustment;
    const finalPrice = Math.round(finalUnitPrice * property.area);

    return {
      price: finalPrice,
      unitPrice: Math.round(finalUnitPrice),
      algorithm: this.name,
      factors: [
        { name: '加权平均单价', value: weightedUnitPrice, weight: 0.6 },
        { name: '面积调整系数', value: areaAdjustment, weight: 0.4 },
      ],
      timestamp: new Date(),
    };
  }
}

// 收益法
class IncomeApproachAlgorithm implements ValuationAlgorithm {
  name = '收益法';
  description = '基于预期收益的估价算法';

  calculate(property: PropertyInfo): ValuationResult {
    // 假设年运营费用率
    const operatingExpenseRate = 0.3;

    // 假设资本化率
    const capitalizationRate = 0.06;

    // 计算潜在毛租金收入 (基于市场租金)
    const marketRentPerSquare = 25; // 假设每平米月租金
    const potentialGrossIncome = property.area * marketRentPerSquare * 12;

    // 计算有效毛收入 (考虑空置率)
    const vacancyRate = 0.1;
    const effectiveGrossIncome = potentialGrossIncome * (1 - vacancyRate);

    // 计算运营费用
    const operatingExpenses = effectiveGrossIncome * operatingExpenseRate;

    // 计算净运营收入
    const netOperatingIncome = effectiveGrossIncome - operatingExpenses;

    // 使用资本化率计算物业价值
    const propertyValue = netOperatingIncome / capitalizationRate;

    // 考虑物业剩余经济寿命
    const remainingEconomicLife = Math.max(
      0,
      70 - (new Date().getFullYear() - property.year)
    );
    const lifeFactor = Math.min(1, remainingEconomicLife / 50);

    const finalPrice = Math.round(propertyValue * lifeFactor);
    const finalUnitPrice = Math.round(finalPrice / property.area);

    return {
      price: finalPrice,
      unitPrice: finalUnitPrice,
      algorithm: this.name,
      factors: [
        { name: '净运营收入', value: netOperatingIncome, weight: 0.5 },
        { name: '资本化率', value: capitalizationRate, weight: 0.3 },
        { name: '剩余经济寿命系数', value: lifeFactor, weight: 0.2 },
      ],
      timestamp: new Date(),
    };
  }
}

// 成本法
class CostApproachAlgorithm implements ValuationAlgorithm {
  name = '成本法';
  description = '基于重置成本的估价算法';

  calculate(property: PropertyInfo): ValuationResult {
    // 土地取得成本 (每平米)
    const landCostMap: Record<string, number> = {
      '湘潭-雨湖': 3000,
      '湘潭-岳塘': 2800,
      '湘潭-湘潭县': 2200,
    };
    const landCostPerSquare =
      landCostMap[`${property.city}-${property.district}`] || 2600;

    // 建筑安装工程费 (每平米)
    const constructionCostMap: Record<string, number> = {
      豪华装修: 5000,
      精装修: 3500,
      简装修: 2000,
      毛坯: 1200,
    };
    const constructionCostPerSquare =
      constructionCostMap[property.decorationLevel] || 2000;

    // 基础设施配套费 (每平米)
    const infrastructureCostPerSquare = 800;

    // 管理费用 (土地取得成本 + 建筑安装工程费 + 基础设施配套费) * 0.05
    const managementCost =
      (landCostPerSquare +
        constructionCostPerSquare +
        infrastructureCostPerSquare) *
      0.05;

    // 投资利息 (假设开发周期2年，年利率4%)
    const totalCost =
      landCostPerSquare +
      constructionCostPerSquare +
      infrastructureCostPerSquare +
      managementCost;
    const interestCost = totalCost * 0.04 * 2;

    // 销售税费 (售价的0.05)
    const salesTaxRate = 0.05;

    // 开发利润 (总成本的0.15)
    const profit = totalCost * 0.15;

    // 重置成本 = 土地取得成本 + 建筑安装工程费 + 基础设施配套费 + 管理费用 + 投资利息 + 开发利润
    const replacementCostPerSquare = totalCost + interestCost + profit;

    // 折旧计算 (直线法，假设使用寿命50年)
    const buildingAge = new Date().getFullYear() - property.year;
    const depreciationRate = Math.min(0.8, buildingAge / 50);
    const depreciatedCostPerSquare =
      replacementCostPerSquare * (1 - depreciationRate);

    // 最终价格 = 折旧后成本 * 面积 / (1 - 销售税费率)
    const finalUnitPrice = depreciatedCostPerSquare / (1 - salesTaxRate);
    const finalPrice = Math.round(finalUnitPrice * property.area);

    return {
      price: finalPrice,
      unitPrice: Math.round(finalUnitPrice),
      algorithm: this.name,
      factors: [
        { name: '重置成本', value: replacementCostPerSquare, weight: 0.4 },
        { name: '折旧率', value: depreciationRate, weight: 0.4 },
        { name: '销售税费率', value: salesTaxRate, weight: 0.2 },
      ],
      timestamp: new Date(),
    };
  }
}

// 估价算法工厂
export class ValuationAlgorithmFactory {
  private static algorithms: Map<string, ValuationAlgorithm> = new Map();

  static registerAlgorithm(algorithm: ValuationAlgorithm) {
    this.algorithms.set(algorithm.name, algorithm);
  }

  static getAlgorithm(name: string): ValuationAlgorithm | undefined {
    return this.algorithms.get(name);
  }

  static getAllAlgorithms(): ValuationAlgorithm[] {
    return Array.from(this.algorithms.values());
  }
}

// 综合估价算法
class ComprehensiveValuationAlgorithm implements ValuationAlgorithm {
  name = '综合估价法';
  description = '结合多种估价方法的综合估价算法';

  calculate(property: PropertyInfo): ValuationResult {
    // 创建各算法实例
    const basicAlgorithm = new BasicValuationAlgorithm();
    const marketAlgorithm = new MarketComparisonAlgorithm();
    const incomeAlgorithm = new IncomeApproachAlgorithm();
    const costAlgorithm = new CostApproachAlgorithm();

    // 使用各算法计算结果
    const basicResult = basicAlgorithm.calculate(property);
    const marketResult = marketAlgorithm.calculate(property);
    const incomeResult = incomeAlgorithm.calculate(property);
    const costResult = costAlgorithm.calculate(property);

    // 算法权重配置
    const algorithmWeights = [
      { name: '基础估价法', weight: 0.3 },
      { name: '市场比较法', weight: 0.35 },
      { name: '收益法', weight: 0.2 },
      { name: '成本法', weight: 0.15 },
    ];

    // 计算加权平均价格
    const totalWeight = algorithmWeights.reduce((sum, item) => sum + item.weight, 0);
    const weightedPrice = (
      basicResult.price * algorithmWeights[0].weight +
      marketResult.price * algorithmWeights[1].weight +
      incomeResult.price * algorithmWeights[2].weight +
      costResult.price * algorithmWeights[3].weight
    ) / totalWeight;

    // 计算加权平均单价
    const weightedUnitPrice = (
      basicResult.unitPrice * algorithmWeights[0].weight +
      marketResult.unitPrice * algorithmWeights[1].weight +
      incomeResult.unitPrice * algorithmWeights[2].weight +
      costResult.unitPrice * algorithmWeights[3].weight
    ) / totalWeight;



    return {
      price: Math.round(weightedPrice),
      unitPrice: Math.round(weightedUnitPrice),
      algorithm: this.name,
      factors: algorithmWeights.map(item => ({
        name: item.name,
        value: item.name === '基础估价法' ? basicResult.unitPrice :
               item.name === '市场比较法' ? marketResult.unitPrice :
               item.name === '收益法' ? incomeResult.unitPrice :
               costResult.unitPrice,
        weight: item.weight
      })),
      algorithmWeights: [
        { name: '基础估价法', weight: algorithmWeights[0].weight, resultPrice: basicResult.price },
        { name: '市场比较法', weight: algorithmWeights[1].weight, resultPrice: marketResult.price },
        { name: '收益法', weight: algorithmWeights[2].weight, resultPrice: incomeResult.price },
        { name: '成本法', weight: algorithmWeights[3].weight, resultPrice: costResult.price },
      ],
      timestamp: new Date(),
    };
  }
}

// 注册默认算法
ValuationAlgorithmFactory.registerAlgorithm(new BasicValuationAlgorithm());
ValuationAlgorithmFactory.registerAlgorithm(new MarketComparisonAlgorithm());
ValuationAlgorithmFactory.registerAlgorithm(new IncomeApproachAlgorithm());
ValuationAlgorithmFactory.registerAlgorithm(new CostApproachAlgorithm());
ValuationAlgorithmFactory.registerAlgorithm(new ComprehensiveValuationAlgorithm());

// 估价服务
export class ValuationService {
  static async calculate(
    property: PropertyInfo,
    algorithmName?: string
  ): Promise<ValuationResult[]> {
    if (algorithmName) {
      // 使用指定算法
      const algorithm = ValuationAlgorithmFactory.getAlgorithm(algorithmName);
      if (!algorithm) {
        throw new Error(`估价算法 ${algorithmName} 不存在`);
      }
      return [algorithm.calculate(property)];
    } else {
      // 使用所有算法
      const algorithms = ValuationAlgorithmFactory.getAllAlgorithms();
      return algorithms.map((algorithm) => algorithm.calculate(property));
    }
  }

  static async compareResults(results: ValuationResult[]): Promise<{
    averagePrice: number;
    averageUnitPrice: number;
    minPrice: number;
    maxPrice: number;
    algorithmResults: ValuationResult[];
  }> {
    const prices = results.map((result) => result.price);
    const unitPrices = results.map((result) => result.unitPrice);

    return {
      averagePrice: Math.round(
        prices.reduce((sum, price) => sum + price, 0) / prices.length
      ),
      averageUnitPrice: Math.round(
        unitPrices.reduce((sum, price) => sum + price, 0) / unitPrices.length
      ),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      algorithmResults: results,
    };
  }
}
