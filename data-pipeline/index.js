// 实时市场数据管道主程序

const { fetchFromPublicAPI } = require('./src/fetchers/publicApiFetcher');
const { fetchFromGovernmentAPI } = require('./src/fetchers/governmentApiFetcher');
const { fetchFromPartnerAPI } = require('./src/fetchers/partnerApiFetcher');
const { cleanAndTransformData } = require('./src/transformers/dataTransformer');
const { loadToDatabase } = require('./src/loaders/databaseLoader');
const { validateDataQuality } = require('./src/validators/dataValidator');
const { schedulePipeline } = require('./src/utils/scheduler');
const logger = require('./src/utils/logger');

// 主ETL流程
async function runETLPipeline() {
    try {
        logger.info('开始执行实时市场数据ETL流程');
        
        // 1. 数据采集 (Extract)
        logger.info('步骤1: 开始数据采集');
        
        // 并行从多个数据源获取数据
        const [publicData, governmentData, partnerData] = await Promise.all([
            fetchFromPublicAPI(),
            fetchFromGovernmentAPI(),
            fetchFromPartnerAPI()
        ]);
        
        logger.info(`采集完成 - 公开API: ${publicData.length}条, 政府数据: ${governmentData.length}条, 合作伙伴数据: ${partnerData.length}条`);
        
        // 合并所有数据源
        const rawData = [...publicData, ...governmentData, ...partnerData];
        logger.info(`合并后总数据量: ${rawData.length}条`);
        
        // 2. 数据质量验证
        logger.info('步骤2: 开始数据质量验证');
        const validatedData = validateDataQuality(rawData);
        logger.info(`数据质量验证完成 - 有效数据: ${validatedData.valid.length}条, 无效数据: ${validatedData.invalid.length}条`);
        
        // 记录无效数据
        if (validatedData.invalid.length > 0) {
            logger.warn(`发现${validatedData.invalid.length}条无效数据，详细信息已记录`);
            validatedData.invalid.forEach((item, index) => {
                logger.debug(`无效数据 ${index + 1}: ${JSON.stringify(item)}`);
            });
        }
        
        // 3. 生成数据质量报告
        logger.info('步骤3: 生成数据质量报告');
        const dataQualityReport = validateDataQuality.generateDataQualityReport(validatedData.valid, validatedData.invalid);
        logger.info(`数据质量报告生成完成，有效性: ${dataQualityReport.validPercentage}%`);
        
        // 4. 数据清洗和转换 (Transform)
        logger.info('步骤4: 开始数据清洗和转换');
        const transformedData = cleanAndTransformData(validatedData.valid);
        logger.info(`数据清洗和转换完成 - 转换后数据量: ${transformedData.length}条`);
        
        // 5. 数据加载 (Load)
        logger.info('步骤5: 开始数据加载');
        const loadResult = await loadToDatabase(transformedData);
        logger.info(`数据加载完成 - 成功: ${loadResult.success}条, 失败: ${loadResult.failed}条`);
        
        // 记录加载失败的数据
        if (loadResult.failedItems.length > 0) {
            logger.warn(`数据加载失败: ${loadResult.failedItems.length}条`);
            loadResult.failedItems.forEach((item, index) => {
                logger.debug(`加载失败 ${index + 1}: ${JSON.stringify(item)}`);
            });
        }
        
        logger.info('实时市场数据ETL流程执行完成');
        return {
            success: true,
            stats: {
                raw: rawData.length,
                validated: validatedData.valid.length,
                transformed: transformedData.length,
                loaded: loadResult.success
            }
        };
    } catch (error) {
        logger.error(`ETL流程执行失败: ${error.message}`);
        logger.error(error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

// 立即执行一次ETL流程
runETLPipeline();

// 调度定期执行（每小时一次）
schedulePipeline(runETLPipeline, '0 * * * *');

// 导出主函数，用于测试和外部调用
module.exports = { runETLPipeline };