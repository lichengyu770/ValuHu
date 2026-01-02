import crypto from 'crypto';

/**
 * 双因素认证服务类
 * 处理验证码生成、存储和验证逻辑
 */
class TwoFactorAuthService {
  // 验证码存储，使用Map存储验证码信息
  static verificationCodes = new Map();

  // 验证码有效期（毫秒），默认5分钟
  static CODE_EXPIRY_TIME = 5 * 60 * 1000;

  /**
   * 生成6位数字验证码
   * @returns {string} - 6位数字验证码
   */
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 为用户生成并存储验证码
   * @param {string} userId - 用户ID
   * @param {string} contact - 联系方式（邮箱或手机号）
   * @param {string} contactType - 联系方式类型（email或sms）
   * @returns {Object} - 验证码信息
   */
  static generateAndStoreCode(userId, contact, contactType) {
    // 生成验证码
    const code = this.generateVerificationCode();

    // 生成过期时间
    const expiryTime = Date.now() + this.CODE_EXPIRY_TIME;

    // 生成唯一的验证码ID
    const codeId = crypto.randomUUID();

    // 存储验证码信息
    this.verificationCodes.set(codeId, {
      userId,
      code,
      expiryTime,
      contact,
      contactType,
      attempts: 0,
      verified: false,
    });

    // 返回验证码信息（不包含实际验证码）
    return {
      codeId,
      contact: this.maskContact(contact, contactType),
      contactType,
      expiryTime,
    };
  }

  /**
   * 发送验证码
   * @param {string} codeId - 验证码ID
   * @returns {Promise<Object>} - 发送结果
   */
  static async sendVerificationCode(codeId) {
    const codeInfo = this.verificationCodes.get(codeId);

    if (!codeInfo) {
      throw new Error('验证码不存在');
    }

    if (codeInfo.expiryTime < Date.now()) {
      this.verificationCodes.delete(codeId);
      throw new Error('验证码已过期');
    }

    try {
      // 根据联系方式类型发送验证码
      if (codeInfo.contactType === 'email') {
        // 模拟发送邮件
        await this.sendEmail(codeInfo.contact, codeInfo.code);
      } else if (codeInfo.contactType === 'sms') {
        // 模拟发送短信
        await this.sendSms(codeInfo.contact, codeInfo.code);
      } else {
        throw new Error('不支持的联系方式类型');
      }

      return {
        success: true,
        message: `验证码已发送至${this.maskContact(codeInfo.contact, codeInfo.contactType)}`,
        contactType: codeInfo.contactType,
      };
    } catch (error) {
      console.error('发送验证码失败:', error);
      throw new Error('发送验证码失败，请稍后重试');
    }
  }

  /**
   * 验证验证码
   * @param {string} codeId - 验证码ID
   * @param {string} code - 用户输入的验证码
   * @returns {Object} - 验证结果
   */
  static verifyCode(codeId, code) {
    const codeInfo = this.verificationCodes.get(codeId);

    if (!codeInfo) {
      return {
        success: false,
        message: '验证码不存在',
      };
    }

    if (codeInfo.expiryTime < Date.now()) {
      this.verificationCodes.delete(codeId);
      return {
        success: false,
        message: '验证码已过期',
      };
    }

    if (codeInfo.verified) {
      return {
        success: false,
        message: '验证码已被使用',
      };
    }

    if (codeInfo.attempts >= 5) {
      this.verificationCodes.delete(codeId);
      return {
        success: false,
        message: '验证码尝试次数过多，请重新获取',
      };
    }

    if (codeInfo.code === code) {
      // 验证码正确，标记为已使用
      codeInfo.verified = true;
      this.verificationCodes.set(codeId, codeInfo);

      return {
        success: true,
        message: '验证码验证成功',
        userId: codeInfo.userId,
      };
    } else {
      // 验证码错误，增加尝试次数
      codeInfo.attempts += 1;
      this.verificationCodes.set(codeId, codeInfo);

      return {
        success: false,
        message: '验证码错误',
        attemptsLeft: 5 - codeInfo.attempts,
      };
    }
  }

  /**
   * 发送邮件（模拟）
   * @param {string} email - 收件人邮箱
   * @param {string} code - 验证码
   * @returns {Promise<void>}
   */
  static async sendEmail(email, code) {
    // 模拟邮件发送延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 实际项目中，这里应该调用邮件服务API
    console.log(`[模拟发送邮件] 收件人: ${email}, 验证码: ${code}`);

    // 模拟发送成功
    return;
  }

  /**
   * 发送短信（模拟）
   * @param {string} phone - 收件人手机号
   * @param {string} code - 验证码
   * @returns {Promise<void>}
   */
  static async sendSms(phone, code) {
    // 模拟短信发送延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 实际项目中，这里应该调用短信服务API
    console.log(`[模拟发送短信] 收件人: ${phone}, 验证码: ${code}`);

    // 模拟发送成功
    return;
  }

  /**
   * 格式化联系方式，隐藏部分内容
   * @param {string} contact - 联系方式
   * @param {string} contactType - 联系方式类型
   * @returns {string} - 格式化后的联系方式
   */
  static maskContact(contact, contactType) {
    if (contactType === 'email') {
      // 邮箱格式：example***@domain.com
      const [username, domain] = contact.split('@');
      if (username.length <= 3) {
        return `${username}***@${domain}`;
      } else {
        return `${username.slice(0, 3)}***@${domain}`;
      }
    } else if (contactType === 'sms') {
      // 手机号格式：138****8888
      return `${contact.slice(0, 3)}****${contact.slice(-4)}`;
    }
    return contact;
  }

  /**
   * 清理过期的验证码
   * 定期调用此方法清理过期的验证码，释放内存
   */
  static cleanupExpiredCodes() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [codeId, codeInfo] of this.verificationCodes.entries()) {
      if (codeInfo.expiryTime < now || codeInfo.verified) {
        this.verificationCodes.delete(codeId);
        deletedCount++;
      }
    }

    console.log(`清理了 ${deletedCount} 个过期或已使用的验证码`);
  }

  /**
   * 启动定期清理任务
   * 每小时清理一次过期验证码
   */
  static startCleanupTask() {
    // 立即清理一次
    this.cleanupExpiredCodes();

    // 每小时清理一次
    setInterval(
      () => {
        this.cleanupExpiredCodes();
      },
      60 * 60 * 1000
    );

    console.log('双因素认证验证码定期清理任务已启动');
  }
}

// 导出服务类
export default TwoFactorAuthService;
