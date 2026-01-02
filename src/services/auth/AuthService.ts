// 认证服务：处理用户登录、注销和权限验证
import SmsService from './SmsService';
import securityService from '../security/SecurityService';

// 定义JWT令牌接口
export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

// 定义套餐接口
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  maxValuations: number;
  maxUsers: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  exclusiveFeatures: boolean;
}

// 定义使用量接口
export interface Usage {
  id: string;
  userId: string;
  planId: string;
  valuationsUsed: number;
  storageUsed: number;
  apiCallsUsed: number;
  periodStart: Date;
  periodEnd: Date;
  isCurrent: boolean;
}

// 定义发票接口
export interface Invoice {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paymentMethod?: string;
  paymentDate?: Date;
  invoiceNumber: string;
}

// 定义用户接口
export interface User {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  twoFactorVerified?: boolean;
  freeTrialCount: number;
  phoneNumber?: string;
  phoneVerified?: boolean;
  // 计费相关字段
  currentPlanId?: string;
  currentPlan?: Plan;
  usage?: Usage;
  invoices?: Invoice[];
  billingCycle?: 'monthly' | 'yearly';
  paymentMethod?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'cancelled' | 'past_due';
  trialEndDate?: Date;
  // 铁杆粉丝相关字段
  isIronFan?: boolean; // 是否为铁杆粉丝
  fanLevel?: number; // 粉丝等级
  fanBadges?: string[]; // 粉丝徽章
  joinDate?: string; // 加入日期
  contributionPoints?: number; // 贡献积分
  totalValuations?: number; // 累计估价次数
  contentCreated?: number; // 创作内容数量
  lastActiveDate?: string; // 最后活跃日期
  exclusiveAccess?: boolean; // 专属访问权限
  prioritySupport?: boolean; // 优先支持
  earlyAccess?: boolean; // 提前体验新功能
}

// 定义双因素认证结果接口
export interface TwoFactorResult {
  secret: string;
  qrCodeUrl: string;
}

class AuthService {
  // 短信服务实例
  private static readonly smsService = new SmsService;
  // 令牌存储键
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly CURRENT_USER_KEY = 'currentUser';

  // 获取访问令牌
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      return null;
    }
  }

  // 获取刷新令牌
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('获取刷新令牌失败:', error);
      return null;
    }
  }

  // 设置令牌
  static setTokens(tokens: JwtTokens): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch (error) {
      console.error('设置令牌失败:', error);
    }
  }

  // 清除令牌
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('清除令牌失败:', error);
    }
  }

  // 解析JWT令牌（客户端解析，仅用于获取过期时间等信息）
  static parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('解析JWT令牌失败:', error);
      return null;
    }
  }

  // 检查令牌是否过期
  static isTokenExpired(token: string): boolean {
    const decoded = this.parseJwt(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Date.now() / 1000;
  }

  // 检查令牌是否即将过期（提前5分钟）
  static isTokenAboutToExpire(token: string): boolean {
    const decoded = this.parseJwt(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < (Date.now() / 1000) + 300;
  }

  // 刷新令牌
  static async refreshToken(): Promise<JwtTokens | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('刷新令牌不存在');
      }

      // 这里应该是实际的刷新令牌API调用
      // 模拟刷新成功，返回新的令牌
      const newTokens: JwtTokens = {
        accessToken: `new-access-token-${Date.now()}`,
        refreshToken: `new-refresh-token-${Date.now()}`,
        expiresIn: 3600, // 1小时
        refreshExpiresIn: 86400, // 24小时
      };

      this.setTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      // 刷新失败，清除所有令牌
      this.logout();
      return null;
    }
  }

  // 获取当前用户信息
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
      return null;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      return null;
    }
  }

  // 登录方法
  static async login(username: string, _password: string): Promise<User> {
    try {
      // 这里应该是实际的登录API调用
      // 模拟登录成功，返回用户信息和令牌
      const user: User = {
        id: '1',
        name: username,
        role: 'admin',
        permissions: [
          'view_dashboard',
          'view_gis',
          'view_building',
          'view_encryption',
          'view_cert',
          'view_revenue',
          'manage_system',
          'manage_users',
          'view_logs',
          'view_monitor',
          'manage_data',
        ],
        twoFactorEnabled: false, // 默认未启用双因素认证
        twoFactorSecret: null, // 双因素认证密钥
        freeTrialCount: 10, // 新用户默认赠送10次试用次数
      };

      // 模拟返回的JWT令牌
      const tokens: JwtTokens = {
        accessToken: `access-token-${Date.now()}`,
        refreshToken: `refresh-token-${Date.now()}`,
        expiresIn: 3600, // 1小时
        refreshExpiresIn: 86400, // 24小时
      };

      // 存储用户信息和令牌
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      this.setTokens(tokens);
      
      // 记录登录审计事件
      securityService.logAuditEvent({
        eventType: 'user_login',
        userId: user.id,
        resource: 'auth',
        action: 'login',
        ipAddress: '127.0.0.1', // 实际应该从请求中获取
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        result: 'success',
        details: {
          username,
          role: user.role
        }
      });
      
      return user;
    } catch (error: any) {
      console.error('登录失败:', error);
      
      // 记录登录失败审计事件
      securityService.logAuditEvent({
        eventType: 'user_login',
        userId: 'anonymous',
        resource: 'auth',
        action: 'login',
        ipAddress: '127.0.0.1', // 实际应该从请求中获取
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        result: 'failure',
        details: {
          username,
          error: error.message
        }
      });
      
      // 这里可以添加错误处理，比如调用message.error
      throw error;
    }
  }

  // 验证双因素认证代码
  static async verifyTwoFactorCode(): Promise<boolean> {
    try {
      // 这里应该是实际的API调用，验证TOTP代码
      // 模拟验证成功
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('用户未登录');
      }

      // 简单的模拟验证，实际项目中应该使用真实的TOTP验证
      // 验证通过后，更新用户的双因素认证状态
      const updatedUser: User = {
        ...user,
        twoFactorVerified: true,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error('双因素认证失败:', error);
      throw error;
    }
  }

  // 启用双因素认证
  static async enableTwoFactor(): Promise<TwoFactorResult> {
    try {
      // 这里应该是实际的API调用，生成TOTP密钥
      // 模拟生成密钥
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('用户未登录');
      }

      // 生成TOTP密钥（模拟）
      const secret = this.generateTOTPSecret();

      // 更新用户信息
      const updatedUser: User = {
        ...user,
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return {
        secret,
        qrCodeUrl: `otpauth://totp/数智估价系统:${user.name}?secret=${secret}&issuer=数智估价系统`,
      };
    } catch (error) {
      console.error('启用双因素认证失败:', error);
      throw error;
    }
  }

  // 禁用双因素认证
  static async disableTwoFactor(): Promise<boolean> {
    try {
      // 这里应该是实际的API调用，禁用TOTP
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('用户未登录');
      }

      // 更新用户信息
      const updatedUser: User = {
        ...user,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorVerified: false,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error('禁用双因素认证失败:', error);
      throw error;
    }
  }

  // 生成TOTP密钥
  static generateTOTPSecret(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // 验证TOTP代码（客户端验证，仅用于测试，实际项目中应该在服务端验证）
  static validateTOTPCode(secret: string, code: string): boolean {
    // 简化的TOTP验证，实际项目中应该使用专业的TOTP库
    // 这里仅作演示，不用于生产环境
    const codeInt = parseInt(code);
    if (isNaN(codeInt)) {
      return false;
    }
    return codeInt >= 100000 && codeInt <= 999999; // 验证代码格式
  }

  // 注销方法
  static logout(): void {
    try {
      const user = this.getCurrentUser();
      const userId = user?.id || 'anonymous';
      
      // 记录登出审计事件
      securityService.logAuditEvent({
        eventType: 'user_logout',
        userId,
        resource: 'auth',
        action: 'logout',
        ipAddress: '127.0.0.1', // 实际应该从请求中获取
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        result: 'success',
        details: {
          username: user?.name
        }
      });
      
      localStorage.removeItem(this.CURRENT_USER_KEY);
      this.clearTokens();
      // 可以在这里添加其他清理操作
    } catch (error) {
      console.error('注销失败:', error);
      
      // 记录登出失败审计事件
      securityService.logAuditEvent({
        eventType: 'user_logout',
        userId: 'anonymous',
        resource: 'auth',
        action: 'logout',
        ipAddress: '127.0.0.1', // 实际应该从请求中获取
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        result: 'failure',
        details: {
          error: (error as Error).message
        }
      });
    }
  }

  // 检查用户是否有权限
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.permissions) {
      return false;
    }
    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return true;
    }
    // 检查用户是否拥有指定权限
    return user.permissions.includes(permission);
  }

  // 检查用户是否是管理员
  static isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'admin';
  }

  // 检查用户是否已登录
  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // 检查用户的双因素认证是否已验证
  static isTwoFactorVerified(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.twoFactorVerified === true;
  }

  // 检查用户是否启用了双因素认证
  static isTwoFactorEnabled(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.twoFactorEnabled === true;
  }

  // 更新用户信息
  static updateUserInfo(userInfo: Partial<User>): User | null {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser: User = { ...currentUser, ...userInfo };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return null;
    }
  }

  // 发送短信验证码
  static async sendPhoneVerificationCode(phoneNumber: string): Promise<boolean> {
    try {
      return await this.smsService.sendVerificationCode(phoneNumber);
    } catch (error) {
      console.error('发送短信验证码失败:', error);
      return false;
    }
  }

  // 验证手机号验证码
  static async verifyPhoneCode(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const result = await this.smsService.verifyCode(phoneNumber, code);
      if (result) {
        // 验证成功，更新用户的手机号验证状态
        const user = this.getCurrentUser();
        if (user) {
          this.updateUserInfo({ phoneNumber, phoneVerified: true });
        }
      }
      return result;
    } catch (error) {
      console.error('验证手机号验证码失败:', error);
      return false;
    }
  }

  // 更新用户手机号（需要重新验证）
  static updatePhoneNumber(phoneNumber: string): void {
    const user = this.getCurrentUser();
    if (user) {
      this.updateUserInfo({ phoneNumber, phoneVerified: false });
    }
  }

  // 检查手机号是否已验证
  static isPhoneVerified(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.phoneVerified === true;
  }

  // 获取用户手机号
  static getPhoneNumber(): string | undefined {
    const user = this.getCurrentUser();
    return user?.phoneNumber;
  }

  // 加密敏感数据（使用AES加密，密钥可以从服务端获取）
  static encryptSensitiveData<T>(data: T): string {
    try {
      // 简单的加密实现，实际项目中应该使用更安全的加密方式
      // 这里使用Base64编码作为示例，实际应该使用AES加密
      return btoa(JSON.stringify(data));
    } catch (error) {
      console.error('加密数据失败:', error);
      throw error;
    }
  }

  // 解密敏感数据
  static decryptSensitiveData<T>(encryptedData: string): T {
    try {
      // 简单的解密实现，实际应该使用更安全的解密方式
      // 这里使用Base64解码作为示例，实际应该使用AES解密
      return JSON.parse(atob(encryptedData)) as T;
    } catch (error) {
      console.error('解密数据失败:', error);
      throw error;
    }
  }
}

export default AuthService;
