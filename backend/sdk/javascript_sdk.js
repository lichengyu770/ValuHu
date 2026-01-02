/**
 * ValuHub JavaScript SDK
 * 用于访问ValuHub API的JavaScript客户端库
 * 支持浏览器和Node.js环境
 */

class ValuHubClient {
    /**
     * 初始化ValuHub客户端
     * @param {string} apiKey - API密钥
     * @param {string} baseUrl - API基础URL，默认为生产环境
     * @param {number} timeout - 请求超时时间，默认30秒
     */
    constructor(apiKey, baseUrl = 'https://api.valu-hub.com/api', timeout = 30000) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * 发送HTTP请求
     * @param {string} method - 请求方法，如GET、POST、PUT、DELETE
     * @param {string} endpoint - API端点路径
     * @param {Object} [data] - 请求体数据
     * @param {Object} [params] - URL参数
     * @returns {Promise<Object>} API响应数据
     * @throws {Error} 请求失败时抛出异常
     */
    async _makeRequest(method, endpoint, data = null, params = null) {
        const url = `${this.baseUrl}${endpoint}`;
        
        // 处理URL参数
        const urlWithParams = new URL(url);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                urlWithParams.searchParams.append(key, value);
            });
        }

        // 配置请求选项
        const options = {
            method: method,
            headers: this.headers,
            timeout: this.timeout
        };

        // 添加请求体
        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            // 发送请求
            const response = await fetch(urlWithParams.toString(), options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    /**
     * 获取房产列表
     * @param {number} [limit=20] - 每页数量，默认20
     * @param {number} [offset=0] - 偏移量，默认0
     * @returns {Promise<Object>} 房产列表数据
     */
    async getProperties(limit = 20, offset = 0) {
        return this._makeRequest('GET', '/v1/properties', null, { limit, offset });
    }

    /**
     * 获取单个房产详情
     * @param {string} propertyId - 房产ID
     * @returns {Promise<Object>} 房产详情数据
     */
    async getProperty(propertyId) {
        return this._makeRequest('GET', `/v1/properties/${propertyId}`);
    }

    /**
     * 房产估价（API v2）
     * @param {Object} propertyData - 房产数据，包含以下字段：
     * @param {string} propertyData.address - 房产地址
     * @param {string} propertyData.city - 城市
     * @param {string} propertyData.district - 区县
     * @param {number} propertyData.area - 建筑面积（平方米）
     * @param {number} propertyData.rooms - 房间数量
     * @param {number} propertyData.bathrooms - 卫生间数量
     * @param {number} propertyData.floor_level - 所在楼层
     * @param {number} propertyData.total_floors - 总楼层
     * @param {number} propertyData.building_year - 建筑年份
     * @param {string} propertyData.property_type - 房产类型
     * @param {string} propertyData.orientation - 朝向
     * @param {string} propertyData.decoration_status - 装修状况
     * @param {number} [propertyData.latitude] - 纬度（可选）
     * @param {number} [propertyData.longitude] - 经度（可选）
     * @param {Object} [propertyData.additional_features] - 额外特征（可选）
     * @param {string} [propertyData.model_type='ensemble'] - 估价模型类型（可选，默认ensemble）
     * @returns {Promise<Object>} 估价结果
     */
    async valuateProperty(propertyData) {
        return this._makeRequest('POST', '/v2/valuate', propertyData);
    }

    /**
     * 批量房产估价
     * @param {Array<Object>} properties - 房产数据列表，每个元素为房产数据字典
     * @returns {Promise<Object>} 批量估价结果
     */
    async batchValuate(properties) {
        return this._makeRequest('POST', '/v1/valuations/batch', { properties });
    }

    /**
     * 获取企业详情
     * @param {string} enterpriseId - 企业ID
     * @returns {Promise<Object>} 企业详情数据
     */
    async getEnterprise(enterpriseId) {
        return this._makeRequest('GET', `/enterprises/${enterpriseId}`);
    }

    /**
     * 获取团队列表
     * @returns {Promise<Object>} 团队列表数据
     */
    async getTeams() {
        return this._makeRequest('GET', '/teams');
    }

    /**
     * 获取API Key列表
     * @returns {Promise<Object>} API Key列表数据
     */
    async getApiKeys() {
        return this._makeRequest('GET', '/api-keys');
    }

    /**
     * 创建API Key
     * @param {string} name - API Key名称
     * @param {Array<string>} [permissions] - 权限列表
     * @param {string} [expiresAt] - 过期时间，ISO格式
     * @param {string} [description] - 描述
     * @returns {Promise<Object>} 创建的API Key数据
     */
    async createApiKey(name, permissions = null, expiresAt = null, description = null) {
        const data = { name };
        if (permissions) data.permissions = permissions;
        if (expiresAt) data.expiresAt = expiresAt;
        if (description) data.description = description;
        
        return this._makeRequest('POST', '/api-keys', data);
    }
}

// 浏览器环境下暴露到全局
if (typeof window !== 'undefined') {
    window.ValuHubClient = ValuHubClient;
}

// Node.js环境下导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValuHubClient;
}

// ES模块导出
export default ValuHubClient;

/**
 * 使用示例
 */
// async function example() {
//     // 初始化客户端
//     const client = new ValuHubClient(
//         'your_api_key_here',
//         'http://localhost:3000/api'  // 开发环境
//     );

//     // 房产估价示例
//     const propertyData = {
//         address: '北京市朝阳区建国路88号',
//         city: '北京市',
//         district: '朝阳区',
//         area: 120.0,
//         rooms: 3,
//         bathrooms: 2,
//         floor_level: 15,
//         total_floors: 30,
//         building_year: 2015,
//         property_type: 'apartment',
//         orientation: 'south',
//         decoration_status: 'fine'
//     };

//     try {
//         // 调用估价API
//         const result = await client.valuateProperty(propertyData);
//         console.log('估价结果:', result);
//     } catch (error) {
//         console.error('调用API失败:', error);
//     }
// }
