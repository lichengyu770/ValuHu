// 前端连接后端测试脚本
// 模拟浏览器环境测试API请求

async function testFrontendBackendConnection() {
  const API_BASE_URL = 'http://localhost:3000/api';
  
  console.log('🧪 开始测试前端连接后端...\n');
  
  // 测试1: 健康检查
  console.log('1️⃣ 测试健康检查端点...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log(`   ✅ 健康检查: ${healthData.message}`);
  } catch (error) {
    console.log(`   ❌ 健康检查失败: ${error.message}`);
  }
  
  // 测试2: 获取评价数据（模拟前端评价轮播）
  console.log('\n2️⃣ 测试评价数据API（模拟用户评价轮播）...');
  try {
    const testimonialResponse = await fetch(`${API_BASE_URL}/testimonials`);
    const testimonials = await testimonialResponse.json();
    console.log(`   ✅ 成功获取 ${testimonials.length} 条评价数据`);
    testimonials.forEach((t, i) => {
      console.log(`   - [${i+1}] ${t.name} (${t.title}): ${t.content.substring(0, 30)}...`);
    });
  } catch (error) {
    console.log(`   ❌ 获取评价数据失败: ${error.message}`);
  }
  
  // 测试3: 获取房产数据（模拟地图标记）
  console.log('\n3️⃣ 测试房产数据API（模拟房价地图标记）...');
  try {
    const propertyResponse = await fetch(`${API_BASE_URL}/properties`);
    const properties = await propertyResponse.json();
    console.log(`   ✅ 成功获取 ${properties.length} 条房产数据`);
    properties.forEach((p, i) => {
      console.log(`   - [${i+1}] ${p.name} - ${p.type} - ${p.price}万元 (坐标: ${p.longitude}, ${p.latitude})`);
    });
  } catch (error) {
    console.log(`   ❌ 获取房产数据失败: ${error.message}`);
  }
  
  // 测试4: 模拟贷款计算器请求
  console.log('\n4️⃣ 测试贷款计算器（前端本地计算）...');
  const loanCalculatorTest = () => {
    const housePrice = 200; // 万元
    const downPaymentRatio = 30; // %
    const loanTerm = 30; // 年
    const interestRate = 4.2; // %
    
    const loanAmount = housePrice * (1 - downPaymentRatio / 100);
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    
    // 等额本息计算
    const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - loanAmount;
    
    console.log(`   ✅ 贷款计算结果:`);
    console.log(`   - 房屋总价: ${housePrice}万元`);
    console.log(`   - 贷款金额: ${loanAmount}万元`);
    console.log(`   - 每月还款: ${monthlyPayment.toFixed(2)}元`);
    console.log(`   - 总还款额: ${totalPayment.toFixed(2)}万元`);
    console.log(`   - 总利息: ${totalInterest.toFixed(2)}万元`);
  };
  loanCalculatorTest();
  
  console.log('\n📊 测试完成！');
  console.log('\n💡 提示:');
  console.log('- 前端页面: visual-index.html');
  console.log('- 后端服务: http://localhost:3000');
  console.log('- API文档: http://localhost:3000/health');
}

// 执行测试
testFrontendBackendConnection().catch(console.error);