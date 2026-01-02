// 合作伙伴API数据采集器

const axios = require('axios');
const logger = require('../utils/logger');
const { API_CONFIG } = require('../config/apiConfig');

// 从合作伙伴API获取房产数据
async function fetchFromPartnerAPI() {
    try {
        logger.info('开始从合作伙伴API获取数据');
        
        const { url, headers, params, maxRetries = 3 } = API_CONFIG.partner;
        
        let retryCount = 0;
        let response;
        
        // 重试机制
        while (retryCount < maxRetries) {
            try {
                response = await axios.get(url, {
                    headers,
                    params,
                    timeout: 12000 // 12秒超时
                });
                break; // 成功获取数据，退出重试循环
            } catch (error) {
                retryCount++;
                logger.warn(`从合作伙伴API获取数据失败（第${retryCount}次尝试）: ${error.message}`);
                
                if (retryCount >= maxRetries) {
                    logger.error(`从合作伙伴API获取数据失败，已达到最大重试次数（${maxRetries}次）`);
                    throw error;
                }
                
                // 指数退避策略
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
        }
        
        // 处理API响应数据
        const rawData = response.data;
        logger.info(`从合作伙伴API成功获取 ${rawData.length || 0} 条数据`);
        
        // 转换为标准格式
        const formattedData = transformToStandardFormat(rawData);
        logger.info(`合作伙伴API数据转换完成，共 ${formattedData.length} 条标准格式数据`);
        
        return formattedData;
    } catch (error) {
        logger.error(`从合作伙伴API获取数据时发生错误: ${error.message}`);
        logger.error(error.stack);
        return [];
    }
}

// 将合作伙伴API响应转换为标准数据格式
function transformToStandardFormat(rawData) {
    if (!rawData || !Array.isArray(rawData.data)) {
        logger.warn('合作伙伴API返回的数据格式不符合预期');
        return [];
    }
    
    return rawData.data.map(item => {
        try {
            // 提取关键字段并转换为标准格式
            return {
                source: 'partner_api',
                property_id: item.id || `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                address: item.address || item.location || item.full_address || '',
                city: item.city || item.municipality || '',
                district: item.district || item.region || '',
                area: parseFloat(item.area) || parseFloat(item.size) || 0,
                price: parseFloat(item.price) || parseFloat(item.total_price) || 0,
                price_per_sqm: parseFloat(item.price_per_sqm) || parseFloat(item.unit_price) || 0,
                rooms: parseInt(item.rooms) || parseInt(item.bedrooms) || 0,
                bathrooms: parseInt(item.bathrooms) || parseInt(item.toilets) || 0,
                floor_level: parseInt(item.floor) || parseInt(item.level) || 0,
                total_floors: parseInt(item.total_floors) || parseInt(item.building_floors) || 0,
                building_year: parseInt(item.year_built) || parseInt(item.construction_year) || 0,
                property_type: item.type || item.property_type || 'apartment',
                orientation: item.orientation || '',
                decoration_status: item.decoration || item.finishing || 'simple',
                transaction_date: item.transaction_date || item.date_sold || new Date().toISOString(),
                source_url: item.url || API_CONFIG.partner.url,
                created_at: new Date().toISOString()
            };
        } catch (error) {
            logger.warn(`转换合作伙伴API数据项失败: ${error.message}`);
            logger.debug(`失败的数据项: ${JSON.stringify(item)}`);
            return null;
        }
    }).filter(item => item !== null); // 过滤掉转换失败的数据项
}

module.exports = {
    fetchFromPartnerAPI
};