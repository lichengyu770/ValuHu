// 短信服务模块
import crypto from 'crypto';

// 验证码存储（实际项目中应该使用Redis或数据库）
const verificationCodes = new Map();

// 阿里云短信API配置（从环境变量加载）
const aliyunConfig = {
  accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  regionId: process.env.ALIBABA_CLOUD_REGION_ID || 'cn-hangzhou',
  signName: process.env.ALIBABA_CLOUD_SMS_SIGN_NAME,
  templateCode: process.env.ALIBABA_CLOUD_SMS_TEMPLATE_CODE,
};

class SmsService {
  // 验证码有效期（5分钟）
  static CODE_EXPIRY = 5 * 60 * 1000;
  
  // 最大尝试次数
  static MAX_ATTEMPTS = 5;
  
  // 验证码长度
  static CODE_LENGTH = 6;
  
  // 生成随机验证码
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // 发送短信验证码
  static async sendVerificationCode(phoneNumber) {
    try {
      // 生成验证码
      const code = this.generateVerificationCode();
      const expiresAt = Date.now() + this.CODE_EXPIRY;
      
      // 存储验证码
      verificationCodes.set(phoneNumber, {
        code,
        expiresAt,
        attempts: 0
      });
      
      // 检查环境变量，只有生产环境才允许实际发送短信
      const isProduction = process.env.NODE_ENV === 'production';
      const enableRealSms = process.env.ENABLE_REAL_SMS === 'true';
      
      if (isProduction && enableRealSms) {
        // 生产环境且启用了实际短信发送
        console.log(`[实际发送] 验证码到 ${phoneNumber}: ${code}`);
        
        // TODO: 集成阿里云短信API
        /*
        const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
        const OpenApi = require('@alicloud/openapi-client');
        const Util = require('@alicloud/tea-util');
        const Credential = require('@alicloud/credentials');
        
        let credential = new Credential.default({
          accessKeyId: aliyunConfig.accessKeyId,
          accessKeySecret: aliyunConfig.accessKeySecret,
        });
        
        let config = new OpenApi.Config({
          credential: credential,
          endpoint: 'dysmsapi.aliyuncs.com',
          regionId: aliyunConfig.regionId,
        });
        
        let client = new Dysmsapi20170525.default(config);
        let sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
          phoneNumbers: phoneNumber,
          signName: aliyunConfig.signName,
          templateCode: aliyunConfig.templateCode,
          templateParam: JSON.stringify({ code })
        });
        
        let resp = await client.sendSmsWithOptions(sendSmsRequest, new Util.RuntimeOptions({ }));
        console.log(JSON.stringify(resp, null, 2));
        */
      } else {
        // 开发环境或未启用实际短信发送，仅模拟发送
        console.log(`[模拟发送] 验证码到 ${phoneNumber}: ${code}`);
      }
      
      return true;
    } catch (error) {
      console.error('发送验证码失败:', error);
      return false;
    }
  }
  
  // 验证验证码
  static verifyCode(phoneNumber, code) {
    try {
      // 获取验证码
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
      if (verificationCode.attempts >= this.MAX_ATTEMPTS) {
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
  
  // 清除过期验证码
  static clearExpiredCodes() {
    const now = Date.now();
    verificationCodes.forEach((value, key) => {
      if (value.expiresAt < now) {
        verificationCodes.delete(key);
      }
    });
  }
  
  // 获取验证码信息（仅用于调试）
  static getVerificationCodeInfo(phoneNumber) {
    return verificationCodes.get(phoneNumber);
  }
}

// 每小时清除一次过期验证码
setInterval(SmsService.clearExpiredCodes, 60 * 60 * 1000);

export default SmsService;