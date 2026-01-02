// 简单的短信验证功能测试脚本
// 这个脚本直接测试短信服务的核心逻辑，不依赖于Express服务器

// 验证码存储（复制自smsService.js）
const verificationCodes = new Map();

// 验证码配置（复制自smsService.js）
const CODE_EXPIRY = 5 * 60 * 1000; // 5分钟
const MAX_ATTEMPTS = 5;
const CODE_LENGTH = 6;

// 生成随机验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码（简化版本）
function sendVerificationCode(phoneNumber) {
  try {
    const code = generateVerificationCode();
    const expiresAt = Date.now() + CODE_EXPIRY;
    
    verificationCodes.set(phoneNumber, {
      code,
      expiresAt,
      attempts: 0
    });
    
    console.log(`发送验证码到 ${phoneNumber}: ${code}`);
    return true;
  } catch (error) {
    console.error('发送验证码失败:', error);
    return false;
  }
}

// 验证验证码（简化版本）
function verifyCode(phoneNumber, code) {
  try {
    const verificationCode = verificationCodes.get(phoneNumber);
    
    if (!verificationCode) {
      return false;
    }
    
    // 检查验证码是否过期
    if (Date.now() > verificationCode.expiresAt) {
      verificationCodes.delete(phoneNumber);
      return false;
    }
    
    // 检查尝试次数是否超过限制
    if (verificationCode.attempts >= MAX_ATTEMPTS) {
      verificationCodes.delete(phoneNumber);
      return false;
    }
    
    // 检查验证码是否正确
    if (verificationCode.code === code) {
      // 验证成功，删除验证码
      verificationCodes.delete(phoneNumber);
      return true;
    } else {
      // 验证失败，增加尝试次数
      verificationCode.attempts++;
      verificationCodes.set(phoneNumber, verificationCode);
      return false;
    }
  } catch (error) {
    console.error('验证验证码失败:', error);
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试短信验证功能...');
  
  const phoneNumber = '13800138000';
  
  // 1. 测试发送验证码
  console.log('\n1. 测试发送验证码...');
  const sendResult = sendVerificationCode(phoneNumber);
  console.log('发送验证码结果:', sendResult);
  
  if (!sendResult) {
    console.error('发送验证码失败');
    return;
  }
  
  // 获取验证码信息
  const codeInfo = verificationCodes.get(phoneNumber);
  console.log('验证码信息:', codeInfo);
  
  if (!codeInfo) {
    console.error('验证码未存储');
    return;
  }
  
  const { code } = codeInfo;
  
  // 2. 测试验证正确验证码
  console.log('\n2. 测试验证正确验证码...');
  const verifyCorrectResult = verifyCode(phoneNumber, code);
  console.log('验证正确验证码结果:', verifyCorrectResult);
  
  if (!verifyCorrectResult) {
    console.error('验证正确验证码失败');
    return;
  }
  
  // 3. 测试验证错误验证码
  console.log('\n3. 测试验证错误验证码...');
  sendVerificationCode(phoneNumber);
  const wrongCode = '123456';
  const verifyWrongResult = verifyCode(phoneNumber, wrongCode);
  console.log('验证错误验证码结果:', verifyWrongResult);
  
  if (verifyWrongResult) {
    console.error('验证错误验证码不应该成功');
    return;
  }
  
  // 4. 测试验证过期验证码
  console.log('\n4. 测试验证过期验证码...');
  sendVerificationCode(phoneNumber);
  const expiredCodeInfo = verificationCodes.get(phoneNumber);
  
  if (expiredCodeInfo) {
    // 手动设置验证码为过期
    expiredCodeInfo.expiresAt = Date.now() - 1000;
    const verifyExpiredResult = verifyCode(phoneNumber, expiredCodeInfo.code);
    console.log('验证过期验证码结果:', verifyExpiredResult);
    
    if (verifyExpiredResult) {
      console.error('验证过期验证码不应该成功');
      return;
    }
  }
  
  // 5. 测试验证码尝试次数限制
  console.log('\n5. 测试验证码尝试次数限制...');
  sendVerificationCode(phoneNumber);
  
  // 连续尝试5次错误验证码
  for (let i = 0; i < 5; i++) {
    const result = verifyCode(phoneNumber, '000000');
    console.log(`第${i+1}次尝试错误验证码结果:`, result);
  }
  
  // 第6次尝试应该失败（已达到最大尝试次数）
  const finalAttemptResult = verifyCode(phoneNumber, '000000');
  console.log('第6次尝试错误验证码结果:', finalAttemptResult);
  
  if (finalAttemptResult) {
    console.error('超过最大尝试次数后应该验证失败');
    return;
  }
  
  console.log('\n✅ 所有测试通过！');
}

// 注释掉自动执行代码，防止误发送短信
// runTests().catch(err => {
//   console.error('测试失败:', err);
// });
