/**
 * 字符串工具类
 */
export class StringUtils {
  /**
   * 检查字符串是否为空
   */
  static isEmpty(value: string | null | undefined): boolean {
    return value === null || value === undefined || value.trim() === '';
  }

  /**
   * 检查字符串是否非空
   */
  static isNotEmpty(value: string | null | undefined): boolean {
    return !this.isEmpty(value);
  }

  /**
   * 截断字符串，超过指定长度时添加省略号
   */
  static truncate(
    str: string,
    maxLength: number,
    options: { ellipsis?: string; keepWords?: boolean } = {}
  ): string {
    if (str.length <= maxLength) {
      return str;
    }

    const { ellipsis = '...', keepWords = false } = options;
    let truncated = str.substring(0, maxLength - ellipsis.length);

    if (keepWords) {
      // 保留完整单词
      truncated = truncated.replace(/\s+[^\s]*$/, '');
    }

    return truncated + ellipsis;
  }

  /**
   * 格式化字符串（类似Python的format）
   */
  static format(str: string, ...args: any[]): string {
    return str.replace(/\{(\d+)\}/g, (match, index) => {
      return args[parseInt(index)] !== undefined ? args[parseInt(index)] : match;
    });
  }

  /**
   * 驼峰式命名转换为下划线命名
   */
  static camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  /**
   * 下划线命名转换为驼峰式命名
   */
  static snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (match, letter) => {
      return letter.toUpperCase();
    });
  }

  /**
   * 下划线命名转换为帕斯卡命名（首字母大写）
   */
  static snakeToPascal(str: string): string {
    const camel = this.snakeToCamel(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  /**
   * 驼峰式命名转换为中划线命名
   */
  static camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * 中划线命名转换为驼峰式命名
   */
  static kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => {
      return letter.toUpperCase();
    });
  }

  /**
   * 生成随机字符串
   */
  static random(length: number, options: { charset?: string } = {}): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charset = options.charset || defaultCharset;
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset.charAt(randomIndex);
    }

    return result;
  }

  /**
   * 移除字符串两端的空白字符
   */
  static trim(str: string): string {
    return str.trim();
  }

  /**
   * 移除字符串左侧的空白字符
   */
  static ltrim(str: string): string {
    return str.replace(/^\s+/, '');
  }

  /**
   * 移除字符串右侧的空白字符
   */
  static rtrim(str: string): string {
    return str.replace(/\s+$/, '');
  }

  /**
   * 将字符串转换为小写
   */
  static toLower(str: string): string {
    return str.toLowerCase();
  }

  /**
   * 将字符串转换为大写
   */
  static toUpper(str: string): string {
    return str.toUpperCase();
  }

  /**
   * 将字符串首字母大写
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * 将每个单词的首字母大写
   */
  static titleCase(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * 检查字符串是否包含指定子串
   */
  static contains(str: string, substring: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return this.toLower(str).includes(this.toLower(substring));
    }
    return str.includes(substring);
  }

  /**
   * 检查字符串是否以指定子串开头
   */
  static startsWith(str: string, prefix: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return this.toLower(str).startsWith(this.toLower(prefix));
    }
    return str.startsWith(prefix);
  }

  /**
   * 检查字符串是否以指定子串结尾
   */
  static endsWith(str: string, suffix: string, caseSensitive: boolean = true): boolean {
    if (!caseSensitive) {
      return this.toLower(str).endsWith(this.toLower(suffix));
    }
    return str.endsWith(suffix);
  }

  /**
   * 替换所有匹配的子串
   */
  static replaceAll(str: string, search: string, replacement: string): string {
    return str.split(search).join(replacement);
  }

  /**
   * 分割字符串并去除空白字符
   */
  static splitTrim(str: string, separator: string = ','): string[] {
    return str.split(separator).map(s => s.trim()).filter(s => s !== '');
  }

  /**
   * 生成唯一ID
   */
  static uniqueId(prefix: string = ''): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 转义HTML特殊字符
   */
  static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 反转义HTML特殊字符
   */
  static unescapeHtml(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  /**
   * 检查字符串是否为有效的邮箱地址
   */
  static isEmail(str: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  /**
   * 检查字符串是否为有效的手机号码（中国）
   */
  static isPhoneNumber(str: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(str);
  }

  /**
   * 检查字符串是否为有效的URL
   */
  static isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检查字符串是否为有效的身份证号码（中国）
   */
  static isIdCard(str: string): boolean {
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    return idCardRegex.test(str);
  }

  /**
   * 格式化手机号码（中国），例如：138****8888
   */
  static formatPhoneNumber(phone: string): string {
    if (phone.length === 11) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    return phone;
  }

  /**
   * 格式化身份证号码，例如：110101********1234
   */
  static formatIdCard(idCard: string): string {
    if (idCard.length === 18) {
      return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
    }
    return idCard;
  }

  /**
   * 计算字符串的字节长度
   */
  static getByteLength(str: string): number {
    return new Blob([str]).size;
  }

  /**
   * 生成指定长度的随机字符串
   */
  static randomString(length: number, charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * 移除字符串中的所有空白字符
   */
  static removeWhitespace(str: string): string {
    return str.replace(/\s+/g, '');
  }

  /**
   * 将字符串转换为Base64编码
   */
  static toBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }

  /**
   * 将Base64编码转换为字符串
   */
  static fromBase64(str: string): string {
    return decodeURIComponent(escape(atob(str)));
  }

  /**
   * 生成密码强度评分（0-100）
   */
  static getPasswordStrength(password: string): number {
    let score = 0;

    // 长度评分
    if (password.length >= 8) score += 25;
    else if (password.length >= 6) score += 15;
    else score += 5;

    // 包含小写字母
    if (/[a-z]/.test(password)) score += 15;

    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 15;

    // 包含数字
    if (/\d/.test(password)) score += 20;

    // 包含特殊字符
    if (/[^a-zA-Z0-9]/.test(password)) score += 25;

    return Math.min(score, 100);
  }

  /**
   * 检查密码强度是否足够
   */
  static isStrongPassword(password: string): boolean {
    return this.getPasswordStrength(password) >= 70;
  }

  /**
   * 生成可读的文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * 移除字符串中的HTML标签
   */
  static stripHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '');
  }

  /**
   * 获取字符串中的纯文本（移除HTML标签并解码）
   */
  static getPlainText(html: string): string {
    const stripped = this.stripHtml(html);
    return this.unescapeHtml(stripped);
  }

  /**
   * 比较两个字符串的相似度（Levenshtein距离）
   */
  static similarity(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // 删除
          dp[i][j - 1] + 1,      // 插入
          dp[i - 1][j - 1] + cost // 替换
        );
      }
    }

    const maxLength = Math.max(m, n);
    return 1 - dp[m][n] / maxLength;
  }
}

/**
 * 检查字符串是否为空
 */
export function isEmpty(value: string | null | undefined): boolean {
  return StringUtils.isEmpty(value);
}

/**
 * 检查字符串是否非空
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return StringUtils.isNotEmpty(value);
}

/**
 * 截断字符串
 */
export function truncate(
  str: string,
  maxLength: number,
  options?: { ellipsis?: string; keepWords?: boolean }
): string {
  return StringUtils.truncate(str, maxLength, options);
}

/**
 * 格式化字符串
 */
export function formatString(str: string, ...args: any[]): string {
  return StringUtils.format(str, ...args);
}

/**
 * 驼峰式命名转换为下划线命名
 */
export function camelToSnake(str: string): string {
  return StringUtils.camelToSnake(str);
}

/**
 * 下划线命名转换为驼峰式命名
 */
export function snakeToCamel(str: string): string {
  return StringUtils.snakeToCamel(str);
}

/**
 * 生成唯一ID
 */
export function uniqueId(prefix: string = ''): string {
  return StringUtils.uniqueId(prefix);
}

/**
 * 转义HTML特殊字符
 */
export function escapeHtml(str: string): string {
  return StringUtils.escapeHtml(str);
}

/**
 * 反转义HTML特殊字符
 */
export function unescapeHtml(str: string): string {
  return StringUtils.unescapeHtml(str);
}

/**
 * 检查字符串是否为有效的邮箱地址
 */
export function isEmail(str: string): boolean {
  return StringUtils.isEmail(str);
}

/**
 * 检查字符串是否为有效的手机号码
 */
export function isPhoneNumber(str: string): boolean {
  return StringUtils.isPhoneNumber(str);
}

/**
 * 格式化手机号码
 */
export function formatPhoneNumber(phone: string): string {
  return StringUtils.formatPhoneNumber(phone);
}

/**
 * 生成随机字符串
 */
export function randomString(length: number, charset?: string): string {
  return StringUtils.randomString(length, charset);
}
