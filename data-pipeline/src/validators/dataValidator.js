// 数据质量验证器

const logger = require('../utils/logger');

// 数据质量规则配置
const DATA_QUALITY_RULES = {
    // 必需字段
    requiredFields: ['property_id', 'address', 'city', 'area', 'price', 'property_type'],
    
    // 数值字段范围验证
    numericRules: {
        area: { min: 10, max: 1000 }, // 面积在10-1000平方米之间
        price: { min: 10000, max: 100000000 }, // 价格在1万-1亿元之间
        price_per_sqm: { min: 1000, max: 200000 }, // 单价在1000-200000元/平方米之间
        rooms: { min: 1, max: 20 }, // 房间数在1-20之间
        bathrooms: { min: 1, max: 10 }, // 卫生间数在1-10之间
        floor_level: { min: 1, max: 100 }, // 楼层在1-100之间
        total_floors: { min: 1, max: 200 }, // 总楼层在1-200之间
        building_year: { min: 1900, max: new Date().getFullYear() + 5 }, // 建筑年份在1900年到未来5年之间
        plot_ratio: { min: 0.5, max: 10 }, // 容积率在0.5-10之间
        greening_rate: { min: 0, max: 1 } // 绿化率在0-1之间
    },
    
    // 枚举值验证
    enumRules: {
        property_type: ['apartment', 'villa', 'townhouse', 'commercial', 'office', 'retail'],
        decoration_status: ['luxury', 'fine', 'simple', 'rough'],
        orientation: ['north', 'east', 'south', 'west', 'northeast', 'northwest', 'southeast', 'southwest']
    },
    
    // 正则表达式验证
    regexRules: {
        property_id: /^[a-zA-Z0-9_\-]+$/ // 只允许字母、数字、下划线和连字符
    },
    
    // 数据一致性规则
    consistencyRules: {
        checkPriceConsistency: true, // 检查总价与单价的一致性
        checkFloorConsistency: true // 检查楼层与总楼层的一致性
    }
};

// 验证数据质量
function validateDataQuality(data) {
    logger.info('开始数据质量验证');
    
    const validData = [];
    const invalidData = [];
    
    data.forEach((item, index) => {
        const validationResult = validateSingleItem(item, index);
        
        if (validationResult.isValid) {
            validData.push(item);
        } else {
            invalidData.push({
                item,
                errors: validationResult.errors
            });
        }
    });
    
    logger.info(`数据质量验证完成 - 有效数据: ${validData.length}条, 无效数据: ${invalidData.length}条`);
    
    return {
        valid: validData,
        invalid: invalidData
    };
}

// 验证单个数据项
function validateSingleItem(item, index) {
    const errors = [];
    
    // 1. 检查必需字段
    DATA_QUALITY_RULES.requiredFields.forEach(field => {
        if (!item[field] && item[field] !== 0) {
            errors.push(`缺少必需字段: ${field}`);
        }
    });
    
    // 2. 验证数值字段
    Object.entries(DATA_QUALITY_RULES.numericRules).forEach(([field, rules]) => {
        if (item[field] !== undefined && item[field] !== null) {
            const value = parseFloat(item[field]);
            
            if (isNaN(value)) {
                errors.push(`字段 ${field} 不是有效数字`);
            } else {
                if (value < rules.min) {
                    errors.push(`字段 ${field} 小于最小值 ${rules.min}`);
                }
                if (value > rules.max) {
                    errors.push(`字段 ${field} 大于最大值 ${rules.max}`);
                }
            }
        }
    });
    
    // 3. 验证枚举值
    Object.entries(DATA_QUALITY_RULES.enumRules).forEach(([field, allowedValues]) => {
        if (item[field] && !allowedValues.includes(item[field])) {
            errors.push(`字段 ${field} 的值 "${item[field]}" 不在允许值列表中: ${allowedValues.join(', ')}`);
        }
    });
    
    // 4. 验证正则表达式
    Object.entries(DATA_QUALITY_RULES.regexRules).forEach(([field, regex]) => {
        if (item[field] && !regex.test(item[field])) {
            errors.push(`字段 ${field} 格式不符合要求`);
        }
    });
    
    // 5. 验证数据一致性
    if (DATA_QUALITY_RULES.consistencyRules.checkFloorConsistency && 
        item.floor_level && item.total_floors && item.floor_level > item.total_floors) {
        errors.push(`楼层 ${item.floor_level} 大于总楼层 ${item.total_floors}`);
    }
    
    if (DATA_QUALITY_RULES.consistencyRules.checkPriceConsistency) {
        if (item.price && item.area && !item.price_per_sqm) {
            // 如果提供了总价和面积，但没有单价，则计算并添加单价
            item.price_per_sqm = parseFloat((item.price / item.area).toFixed(2));
        } else if (item.price && item.area && item.price_per_sqm) {
            // 检查总价、面积和单价的一致性
            const calculatedPricePerSqm = parseFloat((item.price / item.area).toFixed(2));
            const priceDiff = Math.abs(calculatedPricePerSqm - item.price_per_sqm);
            const priceDiffPercentage = (priceDiff / calculatedPricePerSqm) * 100;
            
            // 允许5%的误差
            if (priceDiffPercentage > 5) {
                errors.push(`总价、面积和单价不一致，计算的单价为 ${calculatedPricePerSqm}，但提供的单价为 ${item.price_per_sqm}`);
            }
        }
    }
    
    // 6. 验证字符串长度
    if (item.address && item.address.length > 200) {
        errors.push(`地址长度超过200个字符`);
    }
    
    if (item.city && item.city.length > 50) {
        errors.push(`城市名称长度超过50个字符`);
    }
    
    if (item.district && item.district.length > 50) {
        errors.push(`区域名称长度超过50个字符`);
    }
    
    // 7. 验证日期格式
    if (item.transaction_date) {
        const transactionDate = new Date(item.transaction_date);
        if (isNaN(transactionDate.getTime())) {
            errors.push(`交易日期 "${item.transaction_date}" 不是有效日期格式`);
        }
    }
    
    // 8. 验证坐标范围
    if (item.latitude) {
        const lat = parseFloat(item.latitude);
        if (lat < -90 || lat > 90) {
            errors.push(`纬度 "${item.latitude}" 不在有效范围内 (-90 到 90)`);
        }
    }
    
    if (item.longitude) {
        const lon = parseFloat(item.longitude);
        if (lon < -180 || lon > 180) {
            errors.push(`经度 "${item.longitude}" 不在有效范围内 (-180 到 180)`);
        }
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
        logger.warn(`数据项 ${index} 验证失败，错误: ${errors.join(', ')}`);
    }
    
    return {
        isValid,
        errors
    };
}

// 生成数据质量报告
function generateDataQualityReport(validData, invalidData) {
    const total = validData.length + invalidData.length;
    const validPercentage = total > 0 ? ((validData.length / total) * 100).toFixed(2) : 0;
    
    // 计算各数据源的质量情况
    const sourceStats = {};
    
    validData.forEach(item => {
        sourceStats[item.source] = sourceStats[item.source] || { valid: 0, invalid: 0 };
        sourceStats[item.source].valid++;
    });
    
    invalidData.forEach(item => {
        sourceStats[item.item.source] = sourceStats[item.item.source] || { valid: 0, invalid: 0 };
        sourceStats[item.item.source].invalid++;
    });
    
    // 生成报告
    const report = {
        timestamp: new Date().toISOString(),
        totalRecords: total,
        validRecords: validData.length,
        invalidRecords: invalidData.length,
        validPercentage: parseFloat(validPercentage),
        sourceStatistics: sourceStats,
        invalidDataSample: invalidData.slice(0, 10) // 只包含前10条无效数据作为样本
    };
    
    logger.info('数据质量报告生成完成');
    return report;
}

module.exports = {
    validateDataQuality,
    generateDataQualityReport
};