// 估价算法模块
// 包含完整的参数校验、异常处理和估价逻辑

/**
 * 估价参数类型定义
 * @typedef {Object} ValuationParams
 * @property {number} area - 面积（平方米）
 * @property {string} city - 城市
 * @property {string} district - 区域
 * @property {number} floor - 所在楼层
 * @property {number} total_floors - 总楼层
 * @property {number} building_year - 建筑年份
 * @property {string} property_type - 房产类型
 * @property {string} orientation - 朝向
 * @property {string} decoration - 装修情况
 * @property {string} rooms - 户型
 */

/**
 * 估价结果类型定义
 * @typedef {Object} ValuationResult
 * @property {number} estimated_value - 估价金额（元）
 * @property {number} unit_price - 单价（元/平方米）
 * @property {number} confidence_level - 置信度（0-100）
 * @property {string} valuation_method - 估价方法
 * @property {string} valuation_algorithm - 估价算法版本
 * @property {Object} detailed_analysis - 详细分析
 */

/**
 * 验证估价参数
 * @param {ValuationParams} params - 估价参数
 * @returns {Object} 验证结果
 * @throws {Error} 参数验证失败时抛出错误
 */
function validateValuationParams(params) {
  if (!params) {
    throw new Error('估价参数不能为空');
  }

  const requiredFields = [
    'area',
    'city',
    'district',
    'floor',
    'total_floors',
    'building_year',
    'property_type',
    'orientation',
    'decoration',
    'rooms',
  ];

  // 检查必填字段
  for (const field of requiredFields) {
    if (
      params[field] === undefined ||
      params[field] === null ||
      params[field] === ''
    ) {
      throw new Error(`必填字段缺失: ${field}`);
    }
  }

  // 验证面积
  if (
    typeof params.area !== 'number' ||
    params.area <= 0 ||
    params.area > 10000
  ) {
    throw new Error('面积必须是大于0且小于10000的数字');
  }

  // 验证楼层
  if (typeof params.floor !== 'number' || params.floor <= 0) {
    throw new Error('所在楼层必须是大于0的数字');
  }

  if (typeof params.total_floors !== 'number' || params.total_floors <= 0) {
    throw new Error('总楼层必须是大于0的数字');
  }

  if (params.floor > params.total_floors) {
    throw new Error('所在楼层不能超过总楼层');
  }

  // 验证建筑年份
  const currentYear = new Date().getFullYear();
  if (
    typeof params.building_year !== 'number' ||
    params.building_year < 1900 ||
    params.building_year > currentYear + 1
  ) {
    throw new Error(`建筑年份必须在1900到${currentYear + 1}之间`);
  }

  // 验证房产类型
  const validPropertyTypes = ['住宅', '商业', '工业'];
  if (!validPropertyTypes.includes(params.property_type)) {
    throw new Error(`房产类型必须是以下之一: ${validPropertyTypes.join(', ')}`);
  }

  // 验证装修情况
  const validDecorations = ['毛坯', '简装', '中装', '精装', '豪装'];
  if (!validDecorations.includes(params.decoration)) {
    throw new Error(`装修情况必须是以下之一: ${validDecorations.join(', ')}`);
  }

  // 验证城市和区域
  if (typeof params.city !== 'string' || params.city.trim().length === 0) {
    throw new Error('城市名称无效');
  }

  if (
    typeof params.district !== 'string' ||
    params.district.trim().length === 0
  ) {
    throw new Error('区域名称无效');
  }

  // 验证朝向
  if (
    typeof params.orientation !== 'string' ||
    params.orientation.trim().length === 0
  ) {
    throw new Error('朝向信息无效');
  }

  // 验证户型
  if (typeof params.rooms !== 'string' || params.rooms.trim().length === 0) {
    throw new Error('户型信息无效');
  }

  return { valid: true, message: '参数验证通过' };
}

/**
 * 计算楼层系数
 * @param {number} floor - 所在楼层
 * @param {number} total_floors - 总楼层
 * @returns {number} 楼层系数
 */
function calculateFloorFactor(floor, total_floors) {
  // 中间楼层系数最高，向上下递减
  const middleFloor = Math.floor(total_floors / 2);
  const distanceFromMiddle = Math.abs(floor - middleFloor);
  const maxDistance = Math.max(middleFloor, total_floors - middleFloor);

  // 楼层系数范围：0.85 - 1.15
  const floorFactor = 1 - (distanceFromMiddle / maxDistance) * 0.3 + 0.85;
  return Number(floorFactor.toFixed(2));
}

/**
 * 计算房龄系数
 * @param {number} building_year - 建筑年份
 * @returns {number} 房龄系数
 */
function calculateAgeFactor(building_year) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - building_year;

  if (age <= 5) {
    return 1.1; // 新房
  } else if (age <= 10) {
    return 1.05; // 次新房
  } else if (age <= 20) {
    return 1.0; // 成熟房
  } else if (age <= 30) {
    return 0.95; // 老房
  } else {
    return 0.9; // 很老的房
  }
}

/**
 * 计算装修系数
 * @param {string} decoration - 装修情况
 * @returns {number} 装修系数
 */
function calculateDecorationFactor(decoration) {
  const decorationFactors = {
    毛坯: 0.85,
    简装: 0.95,
    中装: 1.0,
    精装: 1.05,
    豪装: 1.1,
  };

  return decorationFactors[decoration] || 1.0;
}

/**
 * 计算朝向系数
 * @param {string} orientation - 朝向
 * @returns {number} 朝向系数
 */
function calculateOrientationFactor(orientation) {
  // 南北通透最优，其次朝南，再次朝北，最差朝西
  const orientationFactors = {
    南北通透: 1.1,
    朝南: 1.05,
    朝东: 1.0,
    朝北: 0.95,
    朝西: 0.9,
  };

  // 处理复杂朝向（如：东南、西南等）
  if (orientation.includes('南北')) {
    return 1.08;
  } else if (orientation.includes('南')) {
    return 1.03;
  } else if (orientation.includes('东')) {
    return 0.98;
  } else if (orientation.includes('北')) {
    return 0.93;
  } else if (orientation.includes('西')) {
    return 0.88;
  }

  return 1.0;
}

/**
 * 获取区域基准价格（Mock数据）
 * @param {string} city - 城市
 * @param {string} district - 区域
 * @param {string} property_type - 房产类型
 * @returns {number} 基准价格（元/平方米）
 */
function getBasePrice(city, district, property_type) {
  // Mock基准价格数据
  const basePrices = {
    北京: {
      朝阳区: { 住宅: 80000, 商业: 150000, 工业: 30000 },
      海淀区: { 住宅: 90000, 商业: 160000, 工业: 35000 },
      西城区: { 住宅: 100000, 商业: 180000, 工业: 40000 },
      东城区: { 住宅: 95000, 商业: 170000, 工业: 38000 },
    },
    上海: {
      浦东新区: { 住宅: 75000, 商业: 140000, 工业: 28000 },
      黄浦区: { 住宅: 110000, 商业: 200000, 工业: 45000 },
      徐汇区: { 住宅: 85000, 商业: 155000, 工业: 32000 },
    },
    广州: {
      天河区: { 住宅: 60000, 商业: 120000, 工业: 25000 },
      越秀区: { 住宅: 55000, 商业: 110000, 工业: 22000 },
    },
    深圳: {
      南山区: { 住宅: 100000, 商业: 180000, 工业: 40000 },
      福田区: { 住宅: 95000, 商业: 170000, 工业: 38000 },
    },
    长沙: {
      岳麓区: { 住宅: 15000, 商业: 30000, 工业: 8000 },
      芙蓉区: { 住宅: 18000, 商业: 35000, 工业: 10000 },
      天心区: { 住宅: 16000, 商业: 32000, 工业: 9000 },
    },
  };

  // 获取城市基准价格
  const cityPrices = basePrices[city] || {};
  const districtPrices = cityPrices[district] || {};
  const propertyPrice = districtPrices[property_type] || 10000; // 默认基准价

  return propertyPrice;
}

/**
 * 估价算法主函数
 * @param {ValuationParams} params - 估价参数
 * @returns {ValuationResult} 估价结果
 * @throws {Error} 估价过程中出现错误时抛出
 */
function performValuation(params) {
  try {
    // 参数验证
    validateValuationParams(params);

    // 获取基准价格
    const basePrice = getBasePrice(
      params.city,
      params.district,
      params.property_type
    );

    // 计算各项系数
    const floorFactor = calculateFloorFactor(params.floor, params.total_floors);
    const ageFactor = calculateAgeFactor(params.building_year);
    const decorationFactor = calculateDecorationFactor(params.decoration);
    const orientationFactor = calculateOrientationFactor(params.orientation);

    // 综合系数计算
    const comprehensiveFactor =
      floorFactor * ageFactor * decorationFactor * orientationFactor;

    // 计算单价（元/平方米）
    const unit_price = Math.round(basePrice * comprehensiveFactor);

    // 计算总价（元）
    const estimated_value = Math.round(unit_price * params.area);

    // 计算置信度
    // 基于参数完整性和数据质量计算置信度
    let confidence_level = 90;

    // 根据城市和区域数据完整性调整置信度
    const basePrices = {
      北京: true,
      上海: true,
      广州: true,
      深圳: true,
      长沙: true,
    };

    if (!basePrices[params.city]) {
      confidence_level -= 10;
    }

    // 根据建筑年份新旧调整置信度
    const currentYear = new Date().getFullYear();
    const age = currentYear - params.building_year;
    if (age > 30) {
      confidence_level -= 5;
    }

    // 确保置信度在0-100之间
    confidence_level = Math.max(60, Math.min(100, confidence_level));

    // 生成详细分析
    const detailed_analysis = {
      base_price: basePrice,
      floor_factor: floorFactor,
      age_factor: ageFactor,
      decoration_factor: decorationFactor,
      orientation_factor: orientationFactor,
      comprehensive_factor: Number(comprehensiveFactor.toFixed(2)),
      calculation_formula: `总价 = 基准价格(${basePrice}元/㎡) × 楼层系数(${floorFactor}) × 房龄系数(${ageFactor}) × 装修系数(${decorationFactor}) × 朝向系数(${orientationFactor}) × 面积(${params.area}㎡)`,
    };

    // 构建估价结果
    const result = {
      estimated_value,
      unit_price,
      confidence_level,
      valuation_method: '市场比较法',
      valuation_algorithm: 'v1.0.0',
      detailed_analysis,
      timestamp: new Date().toISOString(),
    };

    return result;
  } catch (error) {
    console.error('估价算法执行失败:', error.message);
    throw error;
  }
}

/**
 * 批量估价函数
 * @param {ValuationParams[]} paramsList - 估价参数列表
 * @returns {Array} 估价结果列表
 */
function batchValuation(paramsList) {
  if (!Array.isArray(paramsList)) {
    throw new Error('批量估价参数必须是数组');
  }

  if (paramsList.length === 0) {
    return [];
  }

  if (paramsList.length > 100) {
    throw new Error('批量估价数量不能超过100个');
  }

  // 批量执行估价
  return paramsList.map((params, index) => {
    try {
      return {
        index,
        success: true,
        result: performValuation(params),
      };
    } catch (error) {
      return {
        index,
        success: false,
        error: error.message,
      };
    }
  });
}

/**
 * Mock API 调用函数
 * @param {ValuationParams} params - 估价参数
 * @returns {Promise<ValuationResult>} 估价结果Promise
 */
async function callMockValuationAPI(params) {
  try {
    // 模拟API延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 调用估价算法
    const result = performValuation(params);

    return result;
  } catch (error) {
    console.error('Mock API调用失败:', error.message);
    throw error;
  }
}

/**
 * 真实API调用函数（预留）
 * @param {ValuationParams} params - 估价参数
 * @returns {Promise<ValuationResult>} 估价结果Promise
 */
async function callRealValuationAPI(params) {
  try {
    // 这里可以替换为真实的API调用逻辑
    // 例如：使用fetch或axios调用外部估价API
    console.log('调用真实估价API:', params);

    // 暂时返回模拟结果
    return await callMockValuationAPI(params);
  } catch (error) {
    console.error('真实API调用失败:', error.message);
    throw error;
  }
}

/**
 * 统一估价入口函数
 * @param {ValuationParams} params - 估价参数
 * @param {boolean} useMock - 是否使用Mock API
 * @returns {Promise<ValuationResult>} 估价结果Promise
 */
async function valuationService(params, useMock = true) {
  try {
    // 参数验证
    validateValuationParams(params);

    // 根据配置选择API
    if (useMock) {
      return await callMockValuationAPI(params);
    } else {
      return await callRealValuationAPI(params);
    }
  } catch (error) {
    console.error('估价服务执行失败:', error.message);
    throw error;
  }
}

// 导出估价函数
module.exports = {
  // 核心估价函数
  performValuation,
  batchValuation,
  valuationService,

  // 辅助函数（可用于测试）
  validateValuationParams,
  calculateFloorFactor,
  calculateAgeFactor,
  calculateDecorationFactor,
  calculateOrientationFactor,
  getBasePrice,

  // API调用函数
  callMockValuationAPI,
  callRealValuationAPI,
};
