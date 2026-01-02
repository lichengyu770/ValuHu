// 手动测试估价功能
import { calculateValuation } from './valuationAlgorithms';
import ValuationService from '../services/ValuationService';

// 测试数据
const testParams = {
  area: 100,
  location: 'yuelu',
  buildingType: '住宅',
  decorationLevel: '中等',
  orientation: '南北',
  constructionYear: 2015,
  floor: 5,
  totalFloors: 18,
  lotRatio: 2.5,
  greenRatio: 35,
  nearbyFacilities: ['地铁', '学校', '医院', '商场'],
  valuationMethod: '市场比较法',
};

console.log('开始测试估价功能...');
console.log('测试参数:', JSON.stringify(testParams, null, 2));

// 测试1: 直接调用算法
console.log('\n=== 测试1: 直接调用市场比较法算法 ===');
try {
  const marketResult = calculateValuation(testParams);
  console.log('市场比较法结果:', JSON.stringify(marketResult, null, 2));
} catch (error) {
  console.error('市场比较法测试失败:', error.message);
}

// 测试2: 测试不同估价方法
console.log('\n=== 测试2: 测试不同估价方法 ===');
try {
  const methods = ['市场比较法', '收益法', '成本法', '综合估价法'];
  for (const method of methods) {
    const result = calculateValuation({
      ...testParams,
      valuationMethod: method,
    });
    console.log(
      `${method}结果: 单价=${result.unitPrice}元/㎡, 总价=${result.totalValue}元, 置信度=${result.confidence}%`
    );

    // 如果是综合估价法，输出更详细的信息
    if (method === '综合估价法') {
      console.log(
        '  - 市场比较法权重:',
        result.factors.weights.market * 100 + '%'
      );
      console.log('  - 收益法权重:', result.factors.weights.income * 100 + '%');
      console.log('  - 成本法权重:', result.factors.weights.cost * 100 + '%');
    }
  }
} catch (error) {
  console.error('不同估价方法测试失败:', error.message);
}

// 测试3: 测试估价服务
console.log('\n=== 测试3: 测试估价服务层 ===');
(async () => {
  try {
    const result = await ValuationService.performValuation(testParams);
    console.log('估价服务结果:');
    console.log(`- 总估价: ${result.totalValue}元`);
    console.log(`- 单价: ${result.unitPrice}元/㎡`);
    console.log(`- 置信度: ${result.confidence}%`);
    console.log(`- 估价方法: ${result.valuationMethod}`);
    console.log(`- 可比案例数量: ${result.comparableProperties.length}`);
    console.log(`- 生成了趋势分析: ${!!result.trendAnalysis}`);
    console.log(
      `- 生成了影响因素分析: ${!!result.evaluationDetails.factorsAnalysis}`
    );

    console.log('\n=== 测试完成 ===');
    console.log('估价功能运行正常!');
  } catch (error) {
    console.error('估价服务测试失败:', error.message);
  }
})();
