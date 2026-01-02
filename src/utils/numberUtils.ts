/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  /** 小数位数 */
  decimalPlaces?: number;
  /** 是否使用千分位分隔符 */
  thousandSeparator?: boolean;
  /** 小数分隔符 */
  decimalSeparator?: string;
  /** 千分位分隔符 */
  thousandSeparatorChar?: string;
  /** 是否显示正负号 */
  showSign?: boolean;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 是否四舍五入 */
  round?: boolean;
  /** 是否保留小数位（即使为0） */
  keepDecimalZeros?: boolean;
}

/**
 * 数字工具类
 */
export class NumberUtils {
  /**
   * 格式化数字
   */
  static format(
    num: number | string,
    options: NumberFormatOptions = {}
  ): string {
    const number = this.toNumber(num);
    if (isNaN(number)) return '';

    const {
      decimalPlaces = 2,
      thousandSeparator = true,
      decimalSeparator = '.',
      thousandSeparatorChar = ',',
      showSign = false,
      prefix = '',
      suffix = '',
      round = true,
      keepDecimalZeros = true
    } = options;

    let formatted: string;

    // 四舍五入处理
    if (round) {
      formatted = number.toFixed(decimalPlaces);
    } else {
      formatted = number.toString();
      const parts = formatted.split('.');
      if (parts.length > 1) {
        parts[1] = parts[1].substring(0, decimalPlaces);
        formatted = parts.join('.');
      } else if (decimalPlaces > 0) {
        formatted = `${parts[0]}.${'0'.repeat(decimalPlaces)}`;
      }
    }

    // 处理小数位
    let [integerPart, decimalPart] = formatted.split('.');
    if (!decimalPart) {
      decimalPart = keepDecimalZeros ? '0'.repeat(decimalPlaces) : '';
    } else if (decimalPlaces === 0) {
      decimalPart = '';
    } else if (!keepDecimalZeros) {
      decimalPart = decimalPart.replace(/0+$/, '');
      if (decimalPart === '') {
        decimalPart = '';
      } else if (decimalPart.length < decimalPlaces) {
        decimalPart = decimalPart.padEnd(decimalPlaces, '0');
      }
    }

    // 添加千分位分隔符
    if (thousandSeparator) {
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparatorChar);
    }

    // 组合结果
    let result = '';
    if (showSign && number > 0) {
      result += '+';
    }
    result += prefix;
    result += integerPart;
    if (decimalPart) {
      result += decimalSeparator + decimalPart;
    }
    result += suffix;

    return result;
  }

  /**
   * 将字符串转换为数字
   */
  static toNumber(value: number | string): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // 移除千分位分隔符
      const cleanValue = value.replace(/[,，]/g, '');
      // 转换为数字
      const num = parseFloat(cleanValue);
      return isNaN(num) ? 0 : num;
    }

    return 0;
  }

  /**
   * 生成随机数
   */
  static random(min: number, max: number, decimalPlaces: number = 0): number {
    const randomNum = Math.random() * (max - min) + min;
    return this.round(randomNum, decimalPlaces);
  }

  /**
   * 四舍五入
   */
  static round(num: number, decimalPlaces: number = 0): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  /**
   * 向上取整
   */
  static ceil(num: number, decimalPlaces: number = 0): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(num * factor) / factor;
  }

  /**
   * 向下取整
   */
  static floor(num: number, decimalPlaces: number = 0): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(num * factor) / factor;
  }

  /**
   * 限制数字范围
   */
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  /**
   * 检查是否为数字
   */
  static isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * 检查是否为整数
   */
  static isInteger(value: number | string): boolean {
    const num = this.toNumber(value);
    return Number.isInteger(num);
  }

  /**
   * 检查是否为正数
   */
  static isPositive(value: number | string): boolean {
    const num = this.toNumber(value);
    return num > 0;
  }

  /**
   * 检查是否为负数
   */
  static isNegative(value: number | string): boolean {
    const num = this.toNumber(value);
    return num < 0;
  }

  /**
   * 检查是否为零
   */
  static isZero(value: number | string): boolean {
    const num = this.toNumber(value);
    return num === 0;
  }

  /**
   * 计算百分比
   */
  static toPercentage(
    value: number | string,
    total: number | string,
    decimalPlaces: number = 2
  ): number {
    const num = this.toNumber(value);
    const totalNum = this.toNumber(total);
    if (totalNum === 0) return 0;
    return this.round((num / totalNum) * 100, decimalPlaces);
  }

  /**
   * 格式化百分比
   */
  static formatPercentage(
    value: number | string,
    options: Omit<NumberFormatOptions, 'suffix'> = {}
  ): string {
    const num = this.toNumber(value);
    return this.format(num, {
      ...options,
      suffix: '%',
      decimalPlaces: options.decimalPlaces || 2
    });
  }

  /**
   * 格式化金额
   */
  static formatCurrency(
    value: number | string,
    options: Omit<NumberFormatOptions, 'prefix'> = {}
  ): string {
    const num = this.toNumber(value);
    return this.format(num, {
      ...options,
      prefix: options.prefix || '¥',
      decimalPlaces: options.decimalPlaces || 2,
      thousandSeparator: true
    });
  }

  /**
   * 格式化大数字（如1K, 2M, 3B）
   */
  static formatLargeNumber(
    value: number | string,
    options: NumberFormatOptions = {}
  ): string {
    const num = this.toNumber(value);
    if (isNaN(num)) return '';

    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffixIndex = 0;
    let formattedNum = Math.abs(num);

    while (formattedNum >= 1000 && suffixIndex < suffixes.length - 1) {
      formattedNum /= 1000;
      suffixIndex++;
    }

    return this.format(formattedNum, {
      ...options,
      suffix: `${options.suffix || ''}${suffixes[suffixIndex]}`,
      decimalPlaces: options.decimalPlaces || 1
    });
  }

  /**
   * 计算平均值
   */
  static average(numbers: (number | string)[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, curr) => acc + this.toNumber(curr), 0);
    return sum / numbers.length;
  }

  /**
   * 计算总和
   */
  static sum(numbers: (number | string)[]): number {
    return numbers.reduce((acc, curr) => acc + this.toNumber(curr), 0);
  }

  /**
   * 计算最大值
   */
  static max(numbers: (number | string)[]): number {
    if (numbers.length === 0) return 0;
    const nums = numbers.map(n => this.toNumber(n));
    return Math.max(...nums);
  }

  /**
   * 计算最小值
   */
  static min(numbers: (number | string)[]): number {
    if (numbers.length === 0) return 0;
    const nums = numbers.map(n => this.toNumber(n));
    return Math.min(...nums);
  }

  /**
   * 转换为中文数字
   */
  static toChineseNumber(num: number | string): string {
    const number = this.toNumber(num);
    if (isNaN(number) || number < 0 || number > 999999999999) {
      return '';
    }

    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const units = ['', '十', '百', '千'];
    const bigUnits = ['', '万', '亿'];

    const strNum = Math.floor(number).toString();
    let result = '';

    for (let i = 0; i < strNum.length; i++) {
      const digit = parseInt(strNum[i]);
      const unitIndex = (strNum.length - 1 - i) % 4;
      const bigUnitIndex = Math.floor((strNum.length - 1 - i) / 4);

      if (digit !== 0) {
        if (i > 0 && parseInt(strNum[i - 1]) === 0) {
          result += digits[0];
        }
        result += digits[digit] + units[unitIndex];
      }

      if (unitIndex === 0 && digit !== 0) {
        result += bigUnits[bigUnitIndex];
      }
    }

    // 处理特殊情况：十开头的数字
    if (result.startsWith('一十')) {
      result = result.substring(1);
    }

    return result;
  }

  /**
   * 生成数字数组
   */
  static range(start: number, end: number, step: number = 1): number[] {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  /**
   * 检查数字是否在范围内
   */
  static inRange(num: number | string, min: number, max: number): boolean {
    const number = this.toNumber(num);
    return number >= min && number <= max;
  }

  /**
   * 计算数字的绝对值
   */
  static abs(num: number | string): number {
    const number = this.toNumber(num);
    return Math.abs(number);
  }

  /**
   * 计算数字的平方根
   */
  static sqrt(num: number | string): number {
    const number = this.toNumber(num);
    return Math.sqrt(number);
  }

  /**
   * 计算数字的平方
   */
  static square(num: number | string): number {
    const number = this.toNumber(num);
    return number * number;
  }

  /**
   * 计算数字的立方
   */
  static cube(num: number | string): number {
    const number = this.toNumber(num);
    return number * number * number;
  }

  /**
   * 计算数字的幂
   */
  static pow(num: number | string, exponent: number): number {
    const number = this.toNumber(num);
    return Math.pow(number, exponent);
  }
}

/**
 * 将字符串转换为数字
 */
export function toNumber(value: number | string): number {
  return NumberUtils.toNumber(value);
}

/**
 * 格式化数字
 */
export function formatNumber(
  num: number | string,
  options: NumberFormatOptions = {}
): string {
  return NumberUtils.format(num, options);
}

/**
 * 格式化金额
 */
export function formatCurrency(
  value: number | string,
  options: Omit<NumberFormatOptions, 'prefix'> = {}
): string {
  return NumberUtils.formatCurrency(value, options);
}

/**
 * 格式化百分比
 */
export function formatPercentage(
  value: number | string,
  options: Omit<NumberFormatOptions, 'suffix'> = {}
): string {
  return NumberUtils.formatPercentage(value, options);
}

/**
 * 生成随机数
 */
export function random(min: number, max: number, decimalPlaces: number = 0): number {
  return NumberUtils.random(min, max, decimalPlaces);
}

/**
 * 四舍五入
 */
export function round(num: number, decimalPlaces: number = 0): number {
  return NumberUtils.round(num, decimalPlaces);
}

/**
 * 限制数字范围
 */
export function clamp(num: number, min: number, max: number): number {
  return NumberUtils.clamp(num, min, max);
}

/**
 * 计算平均值
 */
export function average(numbers: (number | string)[]): number {
  return NumberUtils.average(numbers);
}

/**
 * 计算总和
 */
export function sum(numbers: (number | string)[]): number {
  return NumberUtils.sum(numbers);
}

/**
 * 格式化大数字
 */
export function formatLargeNumber(
  value: number | string,
  options: NumberFormatOptions = {}
): string {
  return NumberUtils.formatLargeNumber(value, options);
}
