// 公开交易平台API数据采集器

const axios = require('axios');
const logger = require('../utils/logger');
const { API_CONFIG } = require('../config/apiConfig');

// 从公开交易平台API获取房产数据
async function fetchFromPublicAPI() {
    try {
        logger.info('开始从公开交易平台API获取数据');
        
        const { url, headers, params, maxRetries = 3 } = API_CONFIG.public;
        
        let retryCount = 0;
        let response;
        
        // 重试机制
        while (retryCount < maxRetries) {
            try {
                response = await axios.get(url, {
                    headers,
                    params,
                    timeout: 10000 // 10秒超时
                });
                break; // 成功获取数据，退出重试循环
            } catch (error) {
                retryCount++;
                logger.warn(`从公开API获取数据失败（第${retryCount}次尝试）: ${error.message}`);
                
                if (retryCount >= maxRetries) {
                    logger.error(`从公开API获取数据失败，已达到最大重试次数（${maxRetries}次）`);
                    throw error;
                }
                
                // 指数退避策略
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
        }
        
        // 处理API响应数据
        const rawData = response.data;
        logger.info(`从公开API成功获取 ${rawData.length || 0} 条数据`);
        
        // 转换为标准格式
        const formattedData = transformToStandardFormat(rawData);
        logger.info(`公开API数据转换完成，共 ${formattedData.length} 条标准格式数据`);
        
        return formattedData;
    } catch (error) {
        logger.error(`从公开API获取数据时发生错误: ${error.message}`);
        logger.error(error.stack);
        return [];
    }
}

// 将API响应转换为标准数据格式
function transformToStandardFormat(rawData) {
    if (!Array.isArray(rawData)) {
        logger.warn('公开API返回的数据不是数组格式');
        return [];
    }
    
    return rawData.map(item => {
        try {
            // 提取关键字段并转换为标准格式
            return {
                source: 'public_api',
                property_id: item.id || `public_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                address: item.address || item.location || '',
                city: item.city || item.region || '',
                district: item.district || '',
                area: parseFloat(item.area) || 0,
                price: parseFloat(item.price) || 0,
                price_per_sqm: parseFloat(item.price_per_sqm) || 0,
                rooms: parseInt(item.rooms) || 0,
                bathrooms: parseInt(item.bathrooms) || 0,
                floor_level: parseInt(item.floor_level) || 0,
                total_floors: parseInt(item.total_floors) || 0,
                building_year: parseInt(item.building_year) || 0,
                property_type: item.property_type || 'apartment',
                orientation: item.orientation || '',
                decoration_status: item.decoration_status || 'simple',
                transaction_date: item.transaction_date || new Date().toISOString(),
                source_url: item.url || API_CONFIG.public.url,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            logger.warn(`转换公开API数据项失败: ${error.message}`);
            logger.debug(`失败的数据项: ${JSON.stringify(item)}`);
            return null;
        }
    }).filter(item => item !== null); // 过滤掉转换失败的数据项
}

module.exports = {
    fetchFromPublicAPI
};