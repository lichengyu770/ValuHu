// 政府公开数据API采集器

const axios = require('axios');
const logger = require('../utils/logger');
const { API_CONFIG } = require('../config/apiConfig');

// 从政府公开数据API获取房产数据
async function fetchFromGovernmentAPI() {
    try {
        logger.info('开始从政府公开数据API获取数据');
        
        const { url, headers, params, maxRetries = 3 } = API_CONFIG.government;
        
        let retryCount = 0;
        let response;
        
        // 重试机制
        while (retryCount < maxRetries) {
            try {
                response = await axios.get(url, {
                    headers,
                    params,
                    timeout: 15000 // 15秒超时，政府API可能响应较慢
                });
                break; // 成功获取数据，退出重试循环
            } catch (error) {
                retryCount++;
                logger.warn(`从政府API获取数据失败（第${retryCount}次尝试）: ${error.message}`);
                
                if (retryCount >= maxRetries) {
                    logger.error(`从政府API获取数据失败，已达到最大重试次数（${maxRetries}次）`);
                    throw error;
                }
                
                // 指数退避策略
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
        }
        
        // 处理API响应数据
        const rawData = response.data;
        logger.info(`从政府API成功获取 ${rawData.length || 0} 条数据`);
        
        // 转换为标准格式
        const formattedData = transformToStandardFormat(rawData);
        logger.info(`政府API数据转换完成，共 ${formattedData.length} 条标准格式数据`);
        
        return formattedData;
    } catch (error) {
        logger.error(`从政府API获取数据时发生错误: ${error.message}`);
        logger.error(error.stack);
        return [];
    }
}

// 将政府API响应转换为标准数据格式
function transformToStandardFormat(rawData) {
    if (!rawData || !rawData.results) {
        logger.warn('政府API返回的数据格式不符合预期');
        return [];
    }
    
    const results = Array.isArray(rawData.results) ? rawData.results : [rawData.results];
    
    return results.map(item => {
        try {
            // 提取关键字段并转换为标准格式
            return {
                source: 'government_api',
                property_id: item.id || `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                address: item.address || item.location || item.house_address || '',
                city: item.city || item.province || '',
                district: item.district || item.county || '',
                area: parseFloat(item.area) || parseFloat(item.building_area) || 0,
                price: parseFloat(item.price) || parseFloat(item.transaction_price) || 0,
                price_per_sqm: parseFloat(item.price_per_sqm) || parseFloat(item.unit_price) || 0,
                rooms: parseInt(item.rooms) || parseInt(item.house_rooms) || 0,
                bathrooms: parseInt(item.bathrooms) || parseInt(item.house_bathrooms) || 0,
                floor_level: parseInt(item.floor) || parseInt(item.floor_level) || 0,
                total_floors: parseInt(item.total_floors) || parseInt(item.building_floors) || 0,
                building_year: parseInt(item.building_year) || parseInt(item.construction_year) || 0,
                property_type: item.property_type || item.house_type || 'apartment',
                orientation: item.orientation || '',
                decoration_status: item.decoration_status || item.fitment || 'simple',
                transaction_date: item.transaction_date || item.deal_date || new Date().toISOString(),
                source_url: item.url || API_CONFIG.government.url,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            logger.warn(`转换政府API数据项失败: ${error.message}`);
            logger.debug(`失败的数据项: ${JSON.stringify(item)}`);
            return null;
        }
    }).filter(item => item !== null); // 过滤掉转换失败的数据项
}

module.exports = {
    fetchFromGovernmentAPI
};