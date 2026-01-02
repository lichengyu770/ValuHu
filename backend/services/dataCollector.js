// 数据采集服务
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// 配置文件路径
const DATA_DIR = path.join(__dirname, '../data');

// 数据源配置
const dataSources = [
    {
        id: 'source_1',
        name: '公开房产交易平台',
        type: 'api',
        url: 'https://api.example.com/properties',
        enabled: true
    },
    {
        id: 'source_2',
        name: '政府房产数据',
        type: 'crawler',
        url: 'https://gov.example.com/properties',
        enabled: true
    },
    {
        id: 'source_3',
        name: '行政区划信息',
        type: 'api',
        url: 'https://geo.example.com/districts',
        enabled: true
    }
];

/**
 * 数据采集器类
 */
class DataCollector {
    constructor() {
        this.dataSources = dataSources;
        this.collectedData = [];
        this.cronJob = null;
    }

    /**
     * 从API获取数据
     * @param {Object} source 数据源配置
     * @returns {Promise<Object>} 采集的数据
     */
    async fetchFromApi(source) {
        try {
            const response = await axios.get(source.url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'ValuHub Data Collector/1.0'
                }
            });
            return {
                source: source.id,
                data: response.data,
                timestamp: new Date().toISOString(),
                status: 'success'
            };
        } catch (error) {
            console.error(`从API ${source.name} 获取数据失败:`, error.message);
            return {
                source: source.id,
                data: null,
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * 从网页爬取数据
     * @param {Object} source 数据源配置
     * @returns {Promise<Object>} 采集的数据
     */
    async fetchFromCrawler(source) {
        try {
            const response = await axios.get(source.url, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'ValuHub Data Collector/1.0'
                }
            });
            
            const $ = cheerio.load(response.data);
            const properties = [];
            
            // 这里根据实际网页结构调整选择器
            $('.property-item').each((index, element) => {
                const property = {
                    title: $(element).find('.property-title').text().trim(),
                    address: $(element).find('.property-address').text().trim(),
                    price: parseFloat($(element).find('.property-price').text().replace(/[^\d.]/g, '')),
                    area: parseFloat($(element).find('.property-area').text().replace(/[^\d.]/g, '')),
                    rooms: parseInt($(element).find('.property-rooms').text().replace(/[^\d]/g, '')),
                    floor: $(element).find('.property-floor').text().trim(),
                    year: parseInt($(element).find('.property-year').text().replace(/[^\d]/g, ''))
                };
                properties.push(property);
            });
            
            return {
                source: source.id,
                data: properties,
                timestamp: new Date().toISOString(),
                status: 'success'
            };
        } catch (error) {
            console.error(`从网页 ${source.name} 爬取数据失败:`, error.message);
            return {
                source: source.id,
                data: null,
                timestamp: new Date().toISOString(),
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * 采集所有数据源的数据
     * @returns {Promise<Array>} 所有采集结果
     */
    async collectAllData() {
        console.log('开始采集数据...');
        const results = [];
        
        for (const source of this.dataSources) {
            if (source.enabled) {
                console.log(`正在从 ${source.name} 采集数据...`);
                let result;
                
                if (source.type === 'api') {
                    result = await this.fetchFromApi(source);
                } else if (source.type === 'crawler') {
                    result = await this.fetchFromCrawler(source);
                }
                
                results.push(result);
                this.collectedData.push(result);
                
                // 保存原始数据
                this.saveRawData(result);
            }
        }
        
        console.log('数据采集完成');
        return results;
    }

    /**
     * 保存原始数据到文件
     * @param {Object} data 采集的数据
     */
    saveRawData(data) {
        const filename = `${data.source}_${new Date().toISOString().slice(0, 10)}.json`;
        const filepath = path.join(DATA_DIR, 'raw_data', filename);
        
        // 确保目录存在
        if (!fs.existsSync(path.join(DATA_DIR, 'raw_data'))) {
            fs.mkdirSync(path.join(DATA_DIR, 'raw_data'), { recursive: true });
        }
        
        try {
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`原始数据已保存到 ${filepath}`);
        } catch (error) {
            console.error('保存原始数据失败:', error.message);
        }
    }

    /**
     * 获取数据源列表
     * @returns {Array} 数据源列表
     */
    getSources() {
        return this.dataSources;
    }

    /**
     * 启用/禁用数据源
     * @param {string} sourceId 数据源ID
     * @param {boolean} enabled 是否启用
     */
    toggleSource(sourceId, enabled) {
        const source = this.dataSources.find(s => s.id === sourceId);
        if (source) {
            source.enabled = enabled;
            console.log(`${source.name} 已${enabled ? '启用' : '禁用'}`);
            return true;
        }
        return false;
    }

    /**
     * 设置定时任务，定期采集数据
     * @param {string} cronExpression Cron表达式，默认为每天凌晨2点执行
     */
    setupScheduledCollection(cronExpression = '0 2 * * *') {
        console.log(`设置定时数据采集任务，Cron表达式: ${cronExpression}`);
        
        // 取消现有任务
        if (this.cronJob) {
            this.cronJob.stop();
        }
        
        // 创建新任务
        this.cronJob = cron.schedule(cronExpression, async () => {
            console.log('===== 执行定时数据采集 =====');
            try {
                await this.collectAllData();
                console.log('===== 定时数据采集完成 =====');
            } catch (error) {
                console.error('定时数据采集失败:', error.message);
            }
        });
        
        console.log('定时任务已启动');
    }

    /**
     * 停止定时任务
     */
    stopScheduledCollection() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
            console.log('定时任务已停止');
            return true;
        }
        return false;
    }
}

// 导出数据采集器实例
const dataCollector = new DataCollector();

// 测试数据采集
async function testDataCollection() {
    console.log('测试数据采集服务...');
    const results = await dataCollector.collectAllData();
    console.log('测试完成，采集结果:', results);
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testDataCollection();
}

module.exports = {
    DataCollector,
    dataCollector
};
