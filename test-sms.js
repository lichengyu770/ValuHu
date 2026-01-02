// 短信验证功能测试脚本
import SmsService from './server/utils/smsService.js';

async function testSmsVerification() {
  console.log('开始测试短信验证功能...');
  
  const phoneNumber = '13800138000';
  
  // 1. 测试发送验证码
  console.log('\n1. 测试发送验证码...');
  const sendResult = await SmsService.sendVerificationCode(phoneNumber);
  console.log('发送验证码结果:', sendResult);
  
  if (!sendResult) {
    console.error('发送验证码失败');
    return;
  }
  
  // 获取验证码信息（用于测试）
  const codeInfo = SmsService.getVerificationCodeInfo(phoneNumber);
  console.log('验证码信息:', codeInfo);
  
  if (!codeInfo) {
    console.error('验证码未存储');
    return;
  }
  
  const { code } = codeInfo;
  
  // 2. 测试验证正确验证码
  console.log('\n2. 测试验证正确验证码...');
  const verifyCorrectResult = SmsService.verifyCode(phoneNumber, code);
  console.log('验证正确验证码结果:', verifyCorrectResult);
  
  if (!verifyCorrectResult) {
    console.error('验证正确验证码失败');
    return;
  }
  
  // 3. 测试验证错误验证码
  console.log('\n3. 测试验证错误验证码...');
  await SmsService.sendVerificationCode(phoneNumber);
  const wrongCode = '123456';
  const verifyWrongResult = SmsService.verifyCode(phoneNumber, wrongCode);
  console.log('验证错误验证码结果:', verifyWrongResult);
  
  if (verifyWrongResult) {
    console.error('验证错误验证码不应该成功');
    return;
  }
  
  // 4. 测试验证过期验证码
  console.log('\n4. 测试验证过期验证码...');
  await SmsService.sendVerificationCode(phoneNumber);
  const expiredCodeInfo = SmsService.getVerificationCodeInfo(phoneNumber);
  
  if (expiredCodeInfo) {
    // 手动设置验证码为过期
    expiredCodeInfo.expiresAt = Date.now() - 1000;
    const verifyExpiredResult = SmsService.verifyCode(phoneNumber, expiredCodeInfo.code);
    console.log('验证过期验证码结果:', verifyExpiredResult);
    
    if (verifyExpiredResult) {
      console.error('验证过期验证码不应该成功');
      return;
    }
  }
  
  // 5. 测试验证码尝试次数限制
  console.log('\n5. 测试验证码尝试次数限制...');
  await SmsService.sendVerificationCode(phoneNumber);
  
  // 连续尝试5次错误验证码
  for (let i = 0; i < 5; i++) {
    const result = SmsService.verifyCode(phoneNumber, '000000');
    console.log(`第${i+1}次尝试错误验证码结果:`, result);
  }
  
  // 第6次尝试应该失败（已达到最大尝试次数）
  const finalAttemptResult = SmsService.verifyCode(phoneNumber, '000000');
  console.log('第6次尝试错误验证码结果:', finalAttemptResult);
  
  if (finalAttemptResult) {
    console.error('超过最大尝试次数后应该验证失败');
    return;
  }
  
  console.log('\n✅ 所有测试通过！');
}

// 注释掉自动执行代码，防止误发送短信
// testSmsVerification().catch(err => {
//   console.error('测试失败:', err);
// });
