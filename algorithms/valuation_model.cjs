// AI估价模型 - JavaScript版本

// 模型注册表 - 支持可插拔的模型架构
const modelRegistry = {
    'linear_regression': {
        name: '线性回归模型',
        description: '基于特征工程的基准估价模型',
        weight: 0.25,
        model: null
    },
    'random_forest': {
        name: '随机森林模型',
        description: '基于机器学习的多特征估价模型',
        weight: 0.3,
        model: null
    },
    'market_comparison': {
        name: '市场比较模型',
        description: '基于相似房产成交数据的估价模型',
        weight: 0.25,
        model: null
    },
    'cost': {
        name: '成本模型',
        description: '基于重建成本的估价模型',
        weight: 0.15,
        model: null
    },
    'income': {
        name: '收益模型',
        description: '用于商业地产的现金流折现模型',
        weight: 0.2,
        model: null
    }
};

// 线性回归模型（基准模型）
function linearRegression(data) {
    // 简化的线性回归模型
    const { area, floor_level, building_year, rooms, bathrooms } = data;
    
    // 基础价格计算
    let basePrice = 10000; // 每平米基础价格
    
    // 面积因素
    let areaFactor = area * basePrice * 0.8;
    
    // 楼层因素 (中间楼层价格最高)
    let floorFactor = 1.0;
    if (floor_level <= 3) floorFactor = 0.95;
    else if (floor_level > 15) floorFactor = 0.98;
    else floorFactor = 1.05;
    
    // 房龄因素
    const currentYear = new Date().getFullYear();
    const age = currentYear - building_year;
    let ageFactor = 1.0;
    if (age < 5) ageFactor = 1.1;
    else if (age < 10) ageFactor = 1.05;
    else if (age < 20) ageFactor = 1.0;
    else ageFactor = 0.95;
    
    // 房间数量因素
    let roomFactor = 1.0;
    if (rooms === 2) roomFactor = 1.02;
    else if (rooms === 3) roomFactor = 1.05;
    else if (rooms > 3) roomFactor = 1.08;
    
    // 卫生间数量因素
    let bathroomFactor = 1.0;
    if (bathrooms === 2) bathroomFactor = 1.03;
    else if (bathrooms > 2) bathroomFactor = 1.06;
    
    // 计算总价
    const totalPrice = area * basePrice * floorFactor * ageFactor * roomFactor * bathroomFactor;
    const pricePerSqm = totalPrice / area;
    
    return {
        estimated_price: Math.round(totalPrice),
        price_per_sqm: Math.round(pricePerSqm),
        confidence_level: 0.75,
        model_version: "v2.0.0",
        model_type: "linear_regression"
    };
}

// 随机森林模型
function randomForest(data) {
    // 简化的随机森林模型，结合多种特征
    const { area, floor_level, building_year, property_type, rooms, bathrooms, orientation, decoration_status } = data;
    
    // 基础价格
    let basePrice = 10000;
    
    // 房产类型因素
    let typeFactor = 1.0;
    if (property_type === 'apartment') typeFactor = 1.0;
    else if (property_type === 'villa') typeFactor = 1.5;
    else if (property_type === 'townhouse') typeFactor = 1.2;
    else if (property_type === 'commercial') typeFactor = 1.3;
    
    // 朝向因素
    let orientationFactor = 1.0;
    if (orientation === 'south') orientationFactor = 1.05;
    else if (orientation === 'east') orientationFactor = 1.02;
    else if (orientation === 'west') orientationFactor = 1.0;
    else if (orientation === 'north') orientationFactor = 0.98;
    
    // 装修状况因素
    let decorationFactor = 1.0;
    if (decoration_status === 'luxury') decorationFactor = 1.15;
    else if (decoration_status === 'fine') decorationFactor = 1.1;
    else if (decoration_status === 'simple') decorationFactor = 1.0;
    else if (decoration_status === 'rough') decorationFactor = 0.95;
    
    // 综合计算
    const currentYear = new Date().getFullYear();
    const age = currentYear - building_year;
    
    let totalPrice = area * basePrice * typeFactor * orientationFactor * decorationFactor;
    
    // 加入楼层和房龄的复杂交互
    if (age < 10 && floor_level > 5 && floor_level <= 15) {
        totalPrice *= 1.1;
    } else if (age > 20 && floor_level <= 3) {
        totalPrice *= 0.9;
    }
    
    // 房间和卫生间的组合因素
    if (rooms >= 3 && bathrooms >= 2) {
        totalPrice *= 1.05;
    }
    
    const pricePerSqm = totalPrice / area;
    
    return {
        estimated_price: Math.round(totalPrice),
        price_per_sqm: Math.round(pricePerSqm),
        confidence_level: 0.82,
        model_version: "v2.0.0",
        model_type: "random_forest"
    };
}

// 市场比较模型
function marketComparisonModel(data) {
    // 基于相似房产成交数据的估价模型
    const { area, property_type, city, district, rooms, bathrooms, floor_level, building_year } = data;
    
    // 模拟相似房产数据（实际应用中应从数据库获取）
    const similarProperties = [
        { area: 100, price: 1200000, similarity: 0.95 },
        { area: 95, price: 1150000, similarity: 0.92 },
        { area: 105, price: 1250000, similarity: 0.88 },
        { area: 98, price: 1180000, similarity: 0.85 },
        { area: 102, price: 1220000, similarity: 0.83 }
    ];
    
    // 计算加权平均价格
    let weightedSum = 0;
    let similaritySum = 0;
    
    similarProperties.forEach(property => {
        // 面积调整系数
        const areaAdjustment = area / property.area;
        
        // 加权价格
        const weightedPrice = property.price * areaAdjustment * property.similarity;
        weightedSum += weightedPrice;
        similaritySum += property.similarity;
    });
    
    // 基础价格
    let estimatedPrice = weightedSum / similaritySum;
    
    // 房龄调整
    const currentYear = new Date().getFullYear();
    const age = currentYear - building_year;
    if (age > 10) {
        estimatedPrice *= (1 - (age - 10) * 0.01); // 每年折旧1%
    }
    
    // 楼层调整
    if (floor_level <= 3) estimatedPrice *= 0.98;
    else if (floor_level > 15) estimatedPrice *= 1.02;
    
    const pricePerSqm = estimatedPrice / area;
    
    return {
        estimated_price: Math.round(estimatedPrice),
        price_per_sqm: Math.round(pricePerSqm),
        confidence_level: 0.85,
        model_version: "v2.0.0",
        model_type: "market_comparison"
    };
}

// 成本模型
function costModel(data) {
    // 基于重建成本的估价模型
    const { area, building_year, property_type, plot_ratio, greening_rate } = data;
    
    // 基础建筑成本（元/平米）
    let baseConstructionCost = 5000;
    
    // 房产类型调整
    let typeFactor = 1.0;
    if (property_type === 'apartment') typeFactor = 1.0;
    else if (property_type === 'villa') typeFactor = 1.8;
    else if (property_type === 'townhouse') typeFactor = 1.4;
    else if (property_type === 'commercial') typeFactor = 1.6;
    
    // 容积率调整
    let plotRatioFactor = 1.0;
    if (plot_ratio < 2) plotRatioFactor = 1.1;
    else if (plot_ratio > 4) plotRatioFactor = 0.9;
    
    // 绿化率调整
    let greeningFactor = 1.0;
    if (greening_rate > 0.35) greeningFactor = 1.05;
    
    // 计算建筑成本
    const constructionCost = area * baseConstructionCost * typeFactor * plotRatioFactor * greeningFactor;
    
    // 土地成本（简化计算）
    const landCost = area * 4000;
    
    // 开发商利润
    const profit = (constructionCost + landCost) * 0.2;
    
    // 基础价格
    let estimatedPrice = constructionCost + landCost + profit;
    
    // 房龄折旧
    const currentYear = new Date().getFullYear();
    const age = currentYear - building_year;
    const depreciationRate = 0.02; // 每年折旧2%
    const depreciation = estimatedPrice * Math.min(age * depreciationRate, 0.5); // 最大折旧50%
    estimatedPrice -= depreciation;
    
    const pricePerSqm = estimatedPrice / area;
    
    return {
        estimated_price: Math.round(estimatedPrice),
        price_per_sqm: Math.round(pricePerSqm),
        confidence_level: 0.78,
        model_version: "v2.0.0",
        model_type: "cost"
    };
}

// 收益模型（用于商业地产）
function incomeModel(data) {
    // 用于商业地产的现金流折现模型
    const { area, property_type, building_year, price_per_sqm } = data;
    
    // 仅对商业地产使用收益模型
    if (property_type !== 'commercial') {
        // 非商业地产返回默认值
        return {
            estimated_price: Math.round(area * price_per_sqm),
            price_per_sqm: price_per_sqm,
            confidence_level: 0.65,
            model_version: "v2.0.0",
            model_type: "income"
        };
    }
    
    // 假设年租金回报率
    const annualRentalYield = 0.05;
    
    // 运营成本率
    const operatingCostRate = 0.3;
    
    // 折现率
    const discountRate = 0.08;
    
    // 剩余使用年限
    const currentYear = new Date().getFullYear();
    const remainingYears = Math.max(40 - (currentYear - building_year), 10);
    
    // 计算年租金收入
    const marketPrice = area * price_per_sqm;
    const annualRentalIncome = marketPrice * annualRentalYield;
    
    // 计算年净收益
    const annualNetIncome = annualRentalIncome * (1 - operatingCostRate);
    
    // 现金流折现计算
    let estimatedPrice = 0;
    for (let i = 1; i <= remainingYears; i++) {
        estimatedPrice += annualNetIncome / Math.pow(1 + discountRate, i);
    }
    
    // 残值
    const salvageValue = marketPrice * 0.1;
    estimatedPrice += salvageValue / Math.pow(1 + discountRate, remainingYears);
    
    const finalPricePerSqm = estimatedPrice / area;
    
    return {
        estimated_price: Math.round(estimatedPrice),
        price_per_sqm: Math.round(finalPricePerSqm),
        confidence_level: 0.80,
        model_version: "v2.0.0",
        model_type: "income"
    };
}

// 异常值检测函数
function detectOutliers(values) {
    // 使用四分位数方法检测异常值
    const sortedValues = values.sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.map(value => (value >= lowerBound && value <= upperBound) ? value : null);
}

// 多模型融合引擎
function multiModelEnsemble(data, modelWeights = null) {
    // 使用自定义权重或默认权重
    let weights = modelWeights || {
        'linear_regression': 0.25,
        'random_forest': 0.3,
        'market_comparison': 0.25,
        'cost': 0.15,
        'income': 0.2
    };
    
    // 运行所有模型
    const modelResults = {
        'linear_regression': linearRegression(data),
        'random_forest': randomForest(data),
        'market_comparison': marketComparisonModel(data),
        'cost': costModel(data),
        'income': incomeModel(data)
    };
    
    // 提取所有模型价格结果
    const allPrices = Object.values(modelResults).map(result => result.estimated_price);
    
    // 检测异常值
    const validPrices = detectOutliers(allPrices);
    const validModels = [];
    
    // 过滤掉异常模型结果
    Object.entries(modelResults).forEach(([modelType, result], index) => {
        if (validPrices[index] !== null) {
            validModels.push([modelType, result]);
        }
    });
    
    // 计算加权平均价格
    let weightedPriceSum = 0;
    let weightedConfidenceSum = 0;
    let weightSum = 0;
    
    // 仅对有效模型进行加权计算
    validModels.forEach(([modelType, result]) => {
        if (weights[modelType]) {
            // 添加置信度加权，使高置信度模型获得更高权重
            const confidenceWeighted = weights[modelType] * result.confidence_level;
            weightedPriceSum += result.estimated_price * confidenceWeighted;
            weightedConfidenceSum += result.confidence_level * confidenceWeighted;
            weightSum += confidenceWeighted;
        }
    });
    
    // 归一化权重
    const estimated_price = Math.round(weightedPriceSum / weightSum);
    const confidence_level = parseFloat((weightedConfidenceSum / weightSum).toFixed(2));
    const price_per_sqm = Math.round(estimated_price / data.area);
    
    // 收集各模型的详细结果
    const modelDetails = {};
    Object.entries(modelResults).forEach(([modelType, result]) => {
        const isOutlier = !validModels.some(([validType]) => validType === modelType);
        modelDetails[modelType] = {
            price: result.estimated_price,
            confidence: result.confidence_level,
            weight: weights[modelType] || 0,
            is_outlier: isOutlier
        };
    });
    
    return {
        estimated_price,
        price_per_sqm,
        confidence_level,
        model_version: "v2.1.0",
        model_type: "ensemble",
        model_details: modelDetails,
        outlier_detection: {
            total_models: Object.keys(modelResults).length,
            valid_models: validModels.length,
            outlier_models: Object.keys(modelResults).length - validModels.length
        }
    };
}

// 特征重要性分析
function getFeatureImportance(data) {
    return {
        area: 0.35,
        property_type: 0.20,
        building_year: 0.15,
        floor_level: 0.10,
        rooms: 0.08,
        bathrooms: 0.06,
        orientation: 0.03,
        decoration_status: 0.03
    };
}

// 获取模型列表
function getModels() {
    return Object.entries(modelRegistry).map(([modelType, modelInfo]) => ({
        model_type: modelType,
        name: modelInfo.name,
        description: modelInfo.description,
        default_weight: modelInfo.weight
    }));
}

// 设置模型权重
exports.setModelWeight = function(modelType, weight) {
    if (modelRegistry[modelType]) {
        modelRegistry[modelType].weight = weight;
        return true;
    }
    return false;
};

// 主估价函数
exports.estimatePrice = function(data, model_type = 'ensemble', model_weights = null) {
    let result;
    const startTime = Date.now();
    
    // 注册模型
    modelRegistry['linear_regression'].model = linearRegression;
    modelRegistry['random_forest'].model = randomForest;
    modelRegistry['market_comparison'].model = marketComparisonModel;
    modelRegistry['cost'].model = costModel;
    modelRegistry['income'].model = incomeModel;
    
    switch (model_type) {
        case 'linear_regression':
        case 'random_forest':
        case 'market_comparison':
        case 'cost':
        case 'income':
            // 调用特定模型
            if (modelRegistry[model_type] && modelRegistry[model_type].model) {
                result = modelRegistry[model_type].model(data);
            } else {
                // 默认使用集成模型
                result = multiModelEnsemble(data, model_weights);
            }
            break;
        case 'ensemble':
        default:
            // 使用多模型融合
            result = multiModelEnsemble(data, model_weights);
            break;
    }
    
    // 计算处理时间
    const processingTime = Date.now() - startTime;
    
    // 添加特征和详细结果
    return {
        ...result,
        features: data,
        processing_time_ms: processingTime,
        result_details: {
            feature_importance: getFeatureImportance(data),
            valuation_time: new Date().toISOString(),
            model_used: model_type,
            models: getModels(),
            model_count: Object.keys(modelRegistry).length,
            processing_efficiency: {
                time_ms: processingTime,
                status: processingTime < 1000 ? 'fast' : processingTime < 5000 ? 'normal' : 'slow'
            }
        },
        metadata: {
            valuation_id: `val_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            version: 'v2.1.0',
            environment: process.env.NODE_ENV || 'development'
        }
    };
};

// 获取所有可用模型
exports.getAvailableModels = function() {
    return getModels();
};
