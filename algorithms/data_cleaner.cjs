// 数据清洗工具 - JavaScript版本

// 清洗房产估价数据
exports.cleanData = function(data) {
    // 创建数据副本，避免修改原始数据
    const cleanedData = { ...data };
    
    // 1. 处理面积数据
    if (cleanedData.area) {
        cleanedData.area = parseFloat(cleanedData.area);
        // 确保面积为正数
        if (isNaN(cleanedData.area) || cleanedData.area <= 0) {
            cleanedData.area = 100; // 默认值
        }
    } else {
        cleanedData.area = 100; // 默认值
    }
    
    // 2. 处理楼层数据
    if (cleanedData.floor_level) {
        cleanedData.floor_level = parseInt(cleanedData.floor_level);
        // 确保楼层为正数
        if (isNaN(cleanedData.floor_level) || cleanedData.floor_level <= 0) {
            cleanedData.floor_level = 5; // 默认值
        }
    } else {
        cleanedData.floor_level = 5; // 默认值
    }
    
    // 3. 处理建筑年份数据
    if (cleanedData.building_year) {
        cleanedData.building_year = parseInt(cleanedData.building_year);
        const currentYear = new Date().getFullYear();
        // 确保建筑年份在合理范围内 (1900-当前年份)
        if (isNaN(cleanedData.building_year) || cleanedData.building_year < 1900 || cleanedData.building_year > currentYear) {
            cleanedData.building_year = currentYear - 10; // 默认10年房龄
        }
    } else {
        cleanedData.building_year = new Date().getFullYear() - 10; // 默认10年房龄
    }
    
    // 4. 处理房间数量数据
    if (cleanedData.rooms) {
        cleanedData.rooms = parseInt(cleanedData.rooms);
        // 确保房间数量在合理范围内 (1-10)
        if (isNaN(cleanedData.rooms) || cleanedData.rooms < 1 || cleanedData.rooms > 10) {
            cleanedData.rooms = 3; // 默认3室
        }
    } else {
        cleanedData.rooms = 3; // 默认3室
    }
    
    // 5. 处理卫生间数量数据
    if (cleanedData.bathrooms) {
        cleanedData.bathrooms = parseInt(cleanedData.bathrooms);
        // 确保卫生间数量在合理范围内 (1-5)
        if (isNaN(cleanedData.bathrooms) || cleanedData.bathrooms < 1 || cleanedData.bathrooms > 5) {
            cleanedData.bathrooms = 2; // 默认2卫
        }
    } else {
        cleanedData.bathrooms = 2; // 默认2卫
    }
    
    // 6. 处理房产类型数据
    const validPropertyTypes = ['apartment', 'villa', 'townhouse', 'commercial'];
    if (cleanedData.property_type) {
        cleanedData.property_type = cleanedData.property_type.toLowerCase();
        // 确保房产类型有效
        if (!validPropertyTypes.includes(cleanedData.property_type)) {
            cleanedData.property_type = 'apartment'; // 默认住宅
        }
    } else {
        cleanedData.property_type = 'apartment'; // 默认住宅
    }
    
    // 7. 处理朝向数据
    const validOrientations = ['north', 'south', 'east', 'west'];
    if (cleanedData.orientation) {
        cleanedData.orientation = cleanedData.orientation.toLowerCase();
        // 确保朝向有效
        if (!validOrientations.includes(cleanedData.orientation)) {
            cleanedData.orientation = 'south'; // 默认朝南
        }
    } else {
        cleanedData.orientation = 'south'; // 默认朝南
    }
    
    // 8. 处理装修状况数据
    const validDecorationStatus = ['rough', 'simple', 'fine', 'luxury'];
    if (cleanedData.decoration_status) {
        cleanedData.decoration_status = cleanedData.decoration_status.toLowerCase();
        // 确保装修状况有效
        if (!validDecorationStatus.includes(cleanedData.decoration_status)) {
            cleanedData.decoration_status = 'simple'; // 默认简装
        }
    } else {
        cleanedData.decoration_status = 'simple'; // 默认简装
    }
    
    return cleanedData;
};

// 标准化数据 (用于模型训练，当前简化实现)
exports.normalizeData = function(data) {
    // 简化的标准化，实际项目中应使用更复杂的标准化方法
    const normalizedData = { ...data };
    
    // 面积标准化到 0-1
    normalizedData.area = Math.min(normalizedData.area / 500, 1); // 最大500平米
    
    // 楼层标准化到 0-1
    normalizedData.floor_level = Math.min(normalizedData.floor_level / 50, 1); // 最大50层
    
    // 建筑年份标准化到 0-1 (1900年为0，当前年份为1)
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    normalizedData.building_year = (normalizedData.building_year - minYear) / (currentYear - minYear);
    
    // 房间数量标准化到 0-1
    normalizedData.rooms = Math.min(normalizedData.rooms / 10, 1); // 最大10室
    
    // 卫生间数量标准化到 0-1
    normalizedData.bathrooms = Math.min(normalizedData.bathrooms / 5, 1); // 最大5卫
    
    return normalizedData;
};

// 数据验证
exports.validateData = function(data) {
    const errors = [];
    
    // 基本验证
    if (!data || typeof data !== 'object') {
        errors.push('无效的数据格式');
        return { valid: false, errors };
    }
    
    // 面积验证
    if (!data.area || isNaN(data.area) || data.area <= 0) {
        errors.push('无效的面积数据');
    }
    
    // 楼层验证
    if (!data.floor_level || isNaN(data.floor_level) || data.floor_level <= 0) {
        errors.push('无效的楼层数据');
    }
    
    // 建筑年份验证
    if (!data.building_year || isNaN(data.building_year)) {
        errors.push('无效的建筑年份数据');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};
