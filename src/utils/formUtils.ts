/**
 * 表单工具类，提供统一的表单验证和交互功能
 */

// 定义密码强度验证结果接口
interface PasswordStrengthResult {
  score: number;
  message: string;
  strong: boolean;
}

// 定义验证规则接口
interface ValidationRule {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  idCard?: boolean;
  url?: boolean;
  chinese?: boolean;
  english?: boolean;
  min?: number;
  max?: number;
  validator?: (value: any, formData: any) => string | null;
  message?: string;
}

// 定义验证规则映射接口
interface ValidationRules {
  [field: string]: ValidationRule[];
}

// 定义表单验证结果接口
interface FormValidationResult {
  isValid: boolean;
  errors: { [field: string]: string };
}

// 定义长度验证选项接口
interface LengthOptions {
  min?: number;
  max?: number;
}

const formUtils = {
  /**
   * 验证邮箱格式
   * @param email - 邮箱地址
   * @returns 包含验证结果和消息的对象
   */
  validateEmail: (email: string): { isValid: boolean; message: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    return {
      isValid,
      message: isValid ? '' : '请输入有效的邮箱地址'
    };
  },

  /**
   * 验证手机号格式（中国大陆）
   * @param phone - 手机号码
   * @returns 包含验证结果和消息的对象
   */
  validatePhone: (phone: string): { isValid: boolean; message: string } => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    const isValid = phoneRegex.test(phone);
    return {
      isValid,
      message: isValid ? '' : '请输入有效的手机号码'
    };
  },

  /**
   * 验证密码强度
   * @param password - 密码
   * @returns 包含密码强度信息的对象
   */
  validatePassword: (password: string): { isValid: boolean; strength: string; message: string } => {
    let strengthScore = 0;
    let strengthText = 'weak';

    if (!password) {
      return {
        isValid: false,
        strength: 'weak',
        message: '密码不能为空'
      };
    }

    // 长度验证
    if (password.length >= 8) {
      strengthScore += 1;
    }
    if (password.length >= 12) {
      strengthScore += 1;
    }

    // 包含数字
    if (/\d/.test(password)) {
      strengthScore += 1;
    }

    // 包含小写字母
    if (/[a-z]/.test(password)) {
      strengthScore += 1;
    }

    // 包含大写字母
    if (/[A-Z]/.test(password)) {
      strengthScore += 1;
    }

    // 包含特殊字符
    if (/[^A-Za-z0-9]/.test(password)) {
      strengthScore += 1;
    }

    // 生成强度消息
    if (strengthScore <= 2) {
      strengthText = 'weak';
    } else if (strengthScore <= 4) {
      strengthText = 'medium';
    } else {
      strengthText = 'strong';
    }

    return {
      isValid: strengthScore >= 3,
      strength: strengthText,
      message: strengthScore < 3 ? '密码强度不足，请使用更强的密码' : ''
    };
  },

  /**
   * 验证必填字段
   * @param value - 字段值
   * @returns 包含验证结果和消息的对象
   */
  validateRequired: (value: any): { isValid: boolean; message: string } => {
    const isValid = value !== undefined && value !== null && value.toString().trim() !== '';
    return {
      isValid,
      message: isValid ? '' : '该字段为必填项'
    };
  },

  /**
   * 验证字段长度
   * @param value - 字段值
   * @param options - 选项
   * @returns 是否在指定长度范围内
   */
  validateLength: (value: any, options: LengthOptions): boolean => {
    const length = value.toString().length;
    if (options.min !== undefined && length < options.min) {
      return false;
    }
    if (options.max !== undefined && length > options.max) {
      return false;
    }
    return true;
  },

  /**
   * 验证数字格式
   * @param value - 字段值
   * @returns 包含验证结果和消息的对象
   */
  validateNumber: (value: any): { isValid: boolean; message: string } => {
    const isValid = !isNaN(Number(value)) && value !== '';
    return {
      isValid,
      message: isValid ? '' : '请输入有效的数字'
    };
  },

  /**
   * 验证数值范围
   * @param value - 字段值
   * @param min - 最小值
   * @param max - 最大值
   * @returns 包含验证结果和消息的对象
   */
  validateRange: (value: any, min: number, max: number): { isValid: boolean; message: string } => {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return {
        isValid: false,
        message: '请输入有效的数字'
      };
    }
    const isValid = numValue >= min && numValue <= max;
    return {
      isValid,
      message: isValid ? '' : `请输入${min}到${max}之间的数字`
    };
  },

  /**
   * 验证身份证号码（中国大陆）
   * @param idCard - 身份证号码
   * @returns 包含验证结果和消息的对象
   */
  validateIdCard: (idCard: string): { isValid: boolean; message: string } => {
    const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    const isValid = idCardRegex.test(idCard);
    return {
      isValid,
      message: isValid ? '' : '请输入有效的身份证号码'
    };
  },

  /**
   * 验证URL格式
   * @param url - URL地址
   * @returns 包含验证结果和消息的对象
   */
  validateUrl: (url: string): { isValid: boolean; message: string } => {
    try {
      new URL(url);
      return {
        isValid: true,
        message: ''
      };
    } catch {
      return {
        isValid: false,
        message: '请输入有效的URL地址'
      };
    }
  },

  /**
   * 验证两个密码是否一致
   * @param password - 密码
   * @param confirmPassword - 确认密码
   * @returns 包含验证结果和消息的对象
   */
  validatePasswordMatch: (password: string, confirmPassword: string): { isValid: boolean; message: string } => {
    const isValid = password === confirmPassword;
    return {
      isValid,
      message: isValid ? '' : '两次输入的密码不一致'
    };
  },

  /**
   * 验证是否为中文
   * @param str - 字符串
   * @returns 包含验证结果和消息的对象
   */
  validateChinese: (str: string): { isValid: boolean; message: string } => {
    const chineseRegex = /^[\u4e00-\u9fa5]+$/;
    const isValid = chineseRegex.test(str);
    return {
      isValid,
      message: isValid ? '' : '请输入中文'
    };
  },

  /**
   * 验证是否为英文
   * @param str - 字符串
   * @returns 包含验证结果和消息的对象
   */
  validateEnglish: (str: string): { isValid: boolean; message: string } => {
    const englishRegex = /^[A-Za-z]+$/;
    const isValid = englishRegex.test(str);
    return {
      isValid,
      message: isValid ? '' : '请输入英文'
    };
  },

  /**
   * 统一的表单验证函数
   * @param formData - 表单数据
   * @param rules - 验证规则
   * @returns 包含验证结果的对象
   */
  validateForm: (
    formData: any,
    rules: ValidationRules
  ): FormValidationResult => {
    const errors: { [field: string]: string } = {};
    let isValid = true;

    // 遍历所有规则
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = formData[field];

      // 遍历该字段的所有验证规则
      for (const rule of fieldRules) {
        let error = '';

        if (rule.required && !formUtils.validateRequired(value).isValid) {
          error = rule.message || `${field}是必填字段`;
        } else if (rule.email && value && !formUtils.validateEmail(value).isValid) {
          error = rule.message || '请输入有效的邮箱地址';
        } else if (rule.phone && value && !formUtils.validatePhone(value).isValid) {
          error = rule.message || '请输入有效的手机号码';
        } else if (rule.idCard && value && !formUtils.validateIdCard(value).isValid) {
          error = rule.message || '请输入有效的身份证号码';
        } else if (rule.url && value && !formUtils.validateUrl(value).isValid) {
          error = rule.message || '请输入有效的URL地址';
        } else if (rule.chinese && value && !formUtils.validateChinese(value).isValid) {
          error = rule.message || '请输入中文';
        } else if (rule.english && value && !formUtils.validateEnglish(value).isValid) {
          error = rule.message || '请输入英文';
        } else if (rule.min || rule.max) {
          if (
            !formUtils.validateLength(value, { min: rule.min, max: rule.max })
          ) {
            if (rule.min && rule.max) {
              error = 
                rule.message ||
                `${field}长度必须在${rule.min}到${rule.max}个字符之间`;
            } else if (rule.min) {
              error = rule.message || `${field}长度不能少于${rule.min}个字符`;
            } else {
              error = rule.message || `${field}长度不能超过${rule.max}个字符`;
            }
          }
        } else if (rule.validator) {
          // 自定义验证函数
          const customError = rule.validator(value, formData);
          if (customError) {
            error = customError;
          }
        }

        if (error) {
          errors[field] = error;
          isValid = false;
          break; // 跳出当前字段的验证规则循环
        }
      }
    }

    return {
      isValid,
      errors,
    };
  },

  /**
   * 生成唯一ID
   * @param prefix - ID前缀
   * @returns 唯一ID
   */
  generateId: (prefix: string = 'form'): string => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  },

  /**
   * 格式化表单数据（去除首尾空格）
   * @param formData - 表单数据
   * @returns 格式化后的表单数据
   */
  formatFormData: <T extends Record<string, any>>(formData: T): T => {
    const formattedData = { ...formData } as T;
    for (const field in formattedData) {
      if (typeof formattedData[field] === 'string') {
        formattedData[field] = formattedData[field].trim() as T[Extract<
          keyof T,
          string
        >];
      }
    }
    return formattedData;
  },
};

// 导出所有验证函数，供测试和其他模块使用
export const { 
  validateEmail,
  validatePhone,
  validateIdCard,
  validateUrl,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validateNumber,
  validateRange,
  validateChinese,
  validateEnglish,
  validateForm,
  generateId,
  formatFormData
} = formUtils;

export default formUtils;

export type {
  PasswordStrengthResult,
  ValidationRule,
  ValidationRules,
  FormValidationResult,
  LengthOptions,
};
