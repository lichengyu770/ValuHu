// 数据管道集成脚本
// 用于协调数据采集、清洗和存储的完整流程

const { dataCollector } = require('./services/dataCollector');
const { dataCleaner } = require('./services/dataCleaner');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const DATA_DIR = path.join(__dirname, 'data');

/**
 * 完整的数据处理流程
 * 1. 采集数据
 * 2. 清洗数据
 * 3. 存储数据到文件
 * 4. 存储数据到数据库
 */
async function runDataPipeline() {
    console.log('===== 启动数据处理管道 =====');
    
    try {
        // 步骤1: 采集数据
        console.log('步骤1: 采集数据...');
        const collectedResults = await dataCollector.collectAllData();
        console.log(`成功采集 ${collectedResults.length} 个数据源的数据`);
        
        // 步骤2: 清洗数据
        console.log('步骤2: 清洗数据...');
        
        // 获取原始数据目录
        const rawDataDir = path.join(DATA_DIR, 'raw_data');
        
        // 确保目录存在
        if (!fs.existsSync(rawDataDir)) {
            console.log('原始数据目录不存在，创建目录:', rawDataDir);
            fs.mkdirSync(rawDataDir, { recursive: true });
        }
        
        // 读取所有原始数据文件
        const rawFiles = fs.readdirSync(rawDataDir).filter(file => file.endsWith('.json'));
        console.log(`发现 ${rawFiles.length} 个原始数据文件`);
        
        // 批量清洗数据
        const allCleanedData = dataCleaner.batchClean(rawDataDir);
        console.log(`成功清洗 ${allCleanedData.length} 条记录`);
        
        // 步骤3: 存储数据到数据库
        console.log('步骤3: 存储数据到数据库...');
        const savedCount = await dataCleaner.saveToDatabase(allCleanedData);
        console.log(`成功将 ${savedCount} 条记录保存到数据库`);
        
        console.log('===== 数据处理管道执行完成 =====');
        return {
            success: true,
            collectedSources: collectedResults.length,
            processedFiles: rawFiles.length,
            cleanedData: allCleanedData.length,
            savedToDatabase: savedCount
        };
        
    } catch (error) {
        console.error('数据处理管道执行失败:', error.message);
        console.error(error.stack);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 启动定时数据更新
 * 默认每天凌晨2点执行
 */
function startScheduledPipeline() {
    console.log('===== 启动定时数据更新 =====');
    
    // 使用node-cron设置定时任务
    const cron = require('node-cron');
    
    // 每天凌晨2点执行
    const cronExpression = '0 2 * * *';
    console.log(`设置定时任务，Cron表达式: ${cronExpression}`);
    
    const job = cron.schedule(cronExpression, async () => {
        console.log('===== 执行定时数据更新 =====');
        await runDataPipeline();
        console.log('===== 定时数据更新完成 =====');
    });
    
    return job;
}

// 如果直接运行此文件，则执行数据管道
if (require.main === module) {
    runDataPipeline();
}

module.exports = {
    runDataPipeline,
    startScheduledPipeline
};
