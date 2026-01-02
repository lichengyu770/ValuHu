// 短信服务：处理短信发送和验证码验证

// 定义短信服务接口
export interface SmsServiceInterface {
  sendVerificationCode(phoneNumber: string): Promise<boolean>;
  verifyCode(phoneNumber: string, code: string): Promise<boolean>;
}

// 定义验证码存储接口
interface VerificationCode {
  code: string;
  expiresAt: number;
  attempts: number;
}

// 验证码存储（实际项目中应该使用Redis或数据库）
const verificationCodes: Map<string, VerificationCode> = new Map();

class SmsService implements SmsServiceInterface {
  // 验证码有效期（5分钟）
  private static readonly CODE_EXPIRY = 5 * 60 * 1000;
  // 最大尝试次数
  private static readonly MAX_ATTEMPTS = 5;
  // 验证码长度
  private static readonly CODE_LENGTH = 6;
  
  // 生成随机验证码
  private static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // 发送验证码
  async sendVerificationCode(phoneNumber: string): Promise<boolean> {
    try {
      // 生成验证码
      const code = SmsService.generateVerificationCode();
      const expiresAt = Date.now() + SmsService.CODE_EXPIRY;
      
      // 存储验证码
      verificationCodes.set(phoneNumber, {
        code,
        expiresAt,
        attempts: 0
      });
      
      // 检查环境变量，只有生产环境才允许实际发送短信
      const isProduction = import.meta.env.PROD;
      const enableRealSms = import.meta.env.VITE_ENABLE_REAL_SMS === 'true';
      
      if (isProduction && enableRealSms) {
        // 生产环境且启用了实际短信发送
        console.log(`[实际发送] 验证码到 ${phoneNumber}: ${code}`);
        
        // 实际项目中应该调用阿里云短信API
        /*
        import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
        import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
        import Util, * as $Util from '@alicloud/tea-util';
        import Credential from '@alicloud/credentials';
        
        let credential = new Credential();
        let config = new $OpenApi.Config({
          credential: credential,
        });
        config.endpoint = `dysmsapi.aliyuncs.com`;
        let client = new Dysmsapi20170525(config);
        let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
          phoneNumbers: phoneNumber,
          signName: "你的短信签名",
          templateCode: "你的短信模板Code",
          templateParam: JSON.stringify({ code })
        });
        let resp = await client.sendSmsWithOptions(sendSmsRequest, new $Util.RuntimeOptions({ }));
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
  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
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
      if (verificationCode.attempts >= SmsService.MAX_ATTEMPTS) {
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
  static clearExpiredCodes(): void {
    const now = Date.now();
    verificationCodes.forEach((value, key) => {
      if (value.expiresAt < now) {
        verificationCodes.delete(key);
      }
    });
  }
  
  // 获取验证码信息（仅用于调试）
  static getVerificationCodeInfo(phoneNumber: string): VerificationCode | undefined {
    return verificationCodes.get(phoneNumber);
  }
}

// 每小时清除一次过期验证码
setInterval(SmsService.clearExpiredCodes, 60 * 60 * 1000);

export default SmsService;