// 安全服务：处理数据加密存储和传输、访问审计和日志记录

// 定义加密选项接口
export interface EncryptionOptions {
  algorithm?: string;
  keySize?: number;
}

// 定义日志级别
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 定义日志条目接口
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// 定义审计事件接口
export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  userId: string;
  resource: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  details?: Record<string, any>;
}

class SecurityService {
  private readonly encryptionKey: string;
  private readonly algorithm: string = 'AES-GCM';
  private readonly keySize: number = 256;
  private readonly ivLength: number = 12;
  private readonly tagLength: number = 16;
  
  constructor(options?: EncryptionOptions) {
    // 从环境变量获取加密密钥，如果没有则使用默认密钥（仅用于开发环境）
    this.encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-development-key-12345';
    
    if (options?.algorithm) {
      this.algorithm = options.algorithm;
    }
    
    if (options?.keySize) {
      this.keySize = options.keySize;
    }
    
    this.initializeSecurityFeatures();
  }
  
  // 初始化安全功能
  initializeSecurityFeatures(): void {
    // 确保HTTPS连接
    this.ensureHTTPS();
    
    // 设置安全头
    this.setSecurityHeaders();
    
    console.log('安全服务已初始化');
  }
  
  // 确保HTTPS连接
  private ensureHTTPS(): void {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }
  
  // 设置安全头
  private setSecurityHeaders(): void {
    if (typeof window !== 'undefined') {
      // 对于前端应用，安全头通常由服务器设置
      // 这里可以添加一些前端安全措施
      
      // 设置Content-Security-Policy
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://fonts.googleapis.com;";
      document.head.appendChild(meta);
      
      // 设置X-Content-Type-Options
      const metaXContentType = document.createElement('meta');
      metaXContentType.httpEquiv = 'X-Content-Type-Options';
      metaXContentType.content = 'nosniff';
      document.head.appendChild(metaXContentType);
      
      // 设置X-Frame-Options
      const metaXFrame = document.createElement('meta');
      metaXFrame.httpEquiv = 'X-Frame-Options';
      metaXFrame.content = 'DENY';
      document.head.appendChild(metaXFrame);
      
      // 设置X-XSS-Protection
      const metaXXSS = document.createElement('meta');
      metaXXSS.httpEquiv = 'X-XSS-Protection';
      metaXXSS.content = '1; mode=block';
      document.head.appendChild(metaXXSS);
    }
  }
  
  // 加密数据（用于存储）
  encryptData(data: any): string {
    try {
      // 在前端环境中，我们使用简单的Base64编码进行演示
      // 实际生产环境中，应该使用更强大的加密算法
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('加密数据失败:', error);
      throw error;
    }
  }
  
  // 解密数据（用于存储）
  decryptData(encryptedData: string): any {
    try {
      // 在前端环境中，我们使用简单的Base64解码进行演示
      // 实际生产环境中，应该使用更强大的加密算法
      const jsonString = atob(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('解密数据失败:', error);
      throw error;
    }
  }
  
  // 生成加密密钥
  generateEncryptionKey(): string {
    const array = new Uint8Array(this.keySize / 8);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // 记录访问审计事件
  logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    };
    
    // 实际生产环境中，应该将审计事件发送到服务器
    console.log('审计事件:', auditEvent);
    
    // 可以将审计事件存储在本地存储中，定期发送到服务器
    this.storeAuditEventLocally(auditEvent);
  }
  
  // 本地存储审计事件
  private storeAuditEventLocally(event: AuditEvent): void {
    try {
      const existingEvents = localStorage.getItem('auditEvents');
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      events.push(event);
      localStorage.setItem('auditEvents', JSON.stringify(events.slice(-100))); // 只保留最近100条记录
    } catch (error) {
      console.error('存储审计事件失败:', error);
    }
  }
  
  // 获取本地存储的审计事件
  getLocalAuditEvents(): AuditEvent[] {
    try {
      const events = localStorage.getItem('auditEvents');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('获取审计事件失败:', error);
      return [];
    }
  }
  
  // 记录日志
  log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      metadata,
      userId: this.getCurrentUserId(),
      ipAddress: this.getIpAddress(),
      userAgent: this.getUserAgent()
    };
    
    // 根据日志级别使用不同的console方法
    switch (level) {
      case 'debug':
        console.debug(logEntry);
        break;
      case 'info':
        console.info(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      case 'error':
        console.error(logEntry);
        break;
      case 'fatal':
        console.error(logEntry);
        break;
      default:
        console.log(logEntry);
    }
    
    // 实际生产环境中，应该将日志发送到服务器
    this.sendLogToServer(logEntry);
  }
  
  // 发送日志到服务器
  private sendLogToServer(logEntry: LogEntry): void {
    // 模拟发送日志到服务器
    // 在实际生产环境中，应该使用可靠的日志服务
    setTimeout(() => {
      // 这里可以添加实际的日志发送逻辑
      console.log('日志已发送到服务器:', logEntry.id);
    }, 1000);
  }
  
  // 获取当前用户ID
  private getCurrentUserId(): string | undefined {
    // 从本地存储或状态管理中获取当前用户ID
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    }
    return undefined;
  }
  
  // 获取IP地址
  private getIpAddress(): string {
    // 在前端环境中，获取用户的真实IP地址需要通过服务器
    // 这里返回一个占位符
    return '127.0.0.1';
  }
  
  // 获取用户代理
  private getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return 'unknown';
  }
  
  // 验证用户权限
  validatePermission(userId: string, resource: string, action: string): boolean {
    // 实际生产环境中，应该从服务器获取用户权限
    // 这里返回一个模拟结果
    console.log(`验证用户 ${userId} 对资源 ${resource} 的 ${action} 权限`);
    return true;
  }
  
  // 生成安全的随机字符串
  generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }
    return result;
  }
  
  // 检查密码强度
  checkPasswordStrength(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string[];
  } {
    let score = 0;
    const feedback: string[] = [];
    
    // 检查密码长度
    if (password.length < 8) {
      feedback.push('密码长度至少为8个字符');
    } else {
      score += 1;
    }
    
    // 检查是否包含小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含小写字母');
    }
    
    // 检查是否包含大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含大写字母');
    }
    
    // 检查是否包含数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含数字');
    }
    
    // 检查是否包含特殊字符
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push('密码应包含特殊字符');
    }
    
    // 确定密码强度
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) {
      strength = 'strong';
    } else if (score >= 2) {
      strength = 'medium';
    }
    
    return {
      strength,
      score,
      feedback
    };
  }
}

const securityService = new SecurityService();
export default securityService;
