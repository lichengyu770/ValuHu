// 矩阵评估模型定义

/**
 * 评估因子模型
 * @typedef {Object} EvaluationFactor
 * @property {string} factorId - 因子ID
 * @property {string} factorName - 因子名称
 * @property {number} score - 得分（1-5）
 * @property {number} weight - 权重（0-1）
 * @property {string} description - 描述
 */

/**
 * 评估维度模型
 * @typedef {Object} EvaluationDimension
 * @property {string} dimensionId - 维度ID
 * @property {string} dimensionName - 维度名称
 * @property {number} weight - 权重（0-1）
 * @property {Array<EvaluationFactor>} factors - 包含的因子
 * @property {number} dimensionScore - 维度得分
 */

/**
 * 矩阵评估结果模型
 * @typedef {Object} MatrixEvaluationResult
 * @property {number} totalScore - 综合得分（1-5）
 * @property {string} rating - 评估等级（优秀、良好、中等、较差、差）
 * @property {number} confidence - 置信度（%）
 * @property {Object} dimensionScores - 维度得分
 * @property {Object} factorScores - 因子得分
 * @property {Object} evaluationDimensions - 评估维度和权重
 * @property {Date} evaluationDate - 评估日期
 */

/**
 * 评估维度和因子配置
 */
export const evaluationConfig = {
  // 位置因素 - 权重25%
  location: {
    weight: 0.25,
    name: '位置因素',
    factors: [
      {
        id: 'areaLevel',
        name: '区域等级',
        weight: 0.3,
        description: '房产所在区域的等级划分'
      },
      {
        id: 'transportation',
        name: '交通便利度',
        weight: 0.25,
        description: '周边交通设施的便利程度'
      },
      {
        id: 'surroundingFacilities',
        name: '周边配套',
        weight: 0.25,
        description: '周边商业、教育、医疗等配套设施'
      },
      {
        id: 'environment',
        name: '环境质量',
        weight: 0.2,
        description: '周边环境质量和景观'
      }
    ]
  },
  
  // 建筑因素 - 权重25%
  building: {
    weight: 0.25,
    name: '建筑因素',
    factors: [
      {
        id: 'buildingType',
        name: '建筑类型',
        weight: 0.3,
        description: '住宅、商业、办公等建筑类型'
      },
      {
        id: 'decorationLevel',
        name: '装修等级',
        weight: 0.25,
        description: '装修程度和质量'
      },
      {
        id: 'structure',
        name: '建筑结构',
        weight: 0.25,
        description: '钢筋混凝土、砖混等结构类型'
      },
      {
        id: 'buildingQuality',
        name: '建筑质量',
        weight: 0.2,
        description: '建筑施工质量和维护状况'
      }
    ]
  },
  
  // 户型因素 - 权重15%
  layout: {
    weight: 0.15,
    name: '户型因素',
    factors: [
      {
        id: 'area',
        name: '面积',
        weight: 0.25,
        description: '房产建筑面积'
      },
      {
        id: 'layoutStructure',
        name: '户型结构',
        weight: 0.25,
        description: '房间数量和布局合理性'
      },
      {
        id: 'orientation',
        name: '朝向',
        weight: 0.25,
        description: '房产朝向（南北、东西等）'
      },
      {
        id: 'lightingVentilation',
        name: '采光通风',
        weight: 0.25,
        description: '采光和通风状况'
      }
    ]
  },
  
  // 市场因素 - 权重20%
  market: {
    weight: 0.20,
    name: '市场因素',
    factors: [
      {
        id: 'marketActivity',
        name: '市场活跃度',
        weight: 0.3,
        description: '区域市场交易活跃度'
      },
      {
        id: 'priceTrend',
        name: '价格趋势',
        weight: 0.3,
        description: '近期价格走势'
      },
      {
        id: 'supplyDemand',
        name: '供需关系',
        weight: 0.2,
        description: '区域供需平衡状况'
      },
      {
        id: 'areaPopularity',
        name: '区域热度',
        weight: 0.2,
        description: '区域市场热度和关注度'
      }
    ]
  },
  
  // 其他因素 - 权重15%
  other: {
    weight: 0.15,
    name: '其他因素',
    factors: [
      {
        id: 'propertyRight',
        name: '产权状况',
        weight: 0.3,
        description: '产权类型和年限'
      },
      {
        id: 'propertyManagement',
        name: '物业管理',
        weight: 0.25,
        description: '物业服务质量'
      },
      {
        id: 'floor',
        name: '楼层',
        weight: 0.25,
        description: '所在楼层位置'
      },
      {
        id: 'constructionYear',
        name: '建成年限',
        weight: 0.2,
        description: '建筑使用年限'
      }
    ]
  }
};

/**
 * 评估等级配置
 */
export const ratingConfig = [
  { min: 4.5, max: 5.0, rating: '优秀', color: '#52c41a' },
  { min: 3.5, max: 4.4, rating: '良好', color: '#1890ff' },
  { min: 2.5, max: 3.4, rating: '中等', color: '#faad14' },
  { min: 1.5, max: 2.4, rating: '较差', color: '#fa8c16' },
  { min: 1.0, max: 1.4, rating: '差', color: '#f5222d' }
];

/**
 * 默认矩阵评估参数
 */
export const defaultMatrixParams = {
  area: 100,
  location: '市中心',
  buildingType: '住宅',
  decorationLevel: '精装修',
  orientation: '南北通透',
  constructionYear: 2015,
  floor: 5,
  totalFloors: 10
};
