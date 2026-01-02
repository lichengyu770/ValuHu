/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  hour12?: boolean;
  timeZone?: string;
  locale?: string;
}

/**
 * 日期工具类
 */
export class DateUtils {
  /**
   * 格式化日期
   */
  static format(date: Date | string | number, format: string | DateFormatOptions = 'YYYY-MM-DD HH:mm:ss'): string {
    const dateObj = this.parse(date);
    if (!dateObj) return '';

    // 如果是字符串格式
    if (typeof format === 'string') {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const seconds = dateObj.getSeconds();

      return format
        .replace('YYYY', year.toString())
        .replace('YY', year.toString().slice(-2))
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('M', month.toString())
        .replace('DD', day.toString().padStart(2, '0'))
        .replace('D', day.toString())
        .replace('HH', hours.toString().padStart(2, '0'))
        .replace('H', hours.toString())
        .replace('hh', hours % 12 || 12).toString().padStart(2, '0')
        .replace('h', hours % 12 || 12).toString()
        .replace('mm', minutes.toString().padStart(2, '0'))
        .replace('m', minutes.toString())
        .replace('ss', seconds.toString().padStart(2, '0'))
        .replace('s', seconds.toString())
        .replace('a', hours >= 12 ? 'PM' : 'AM')
        .replace('A', hours >= 12 ? 'PM' : 'AM');
    }

    // 如果是Intl选项
    const { locale = 'zh-CN', ...options } = format;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  }

  /**
   * 解析日期字符串
   */
  static parse(date: Date | string | number): Date | null {
    if (date instanceof Date) {
      return date;
    }

    if (typeof date === 'number') {
      return new Date(date);
    }

    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    return null;
  }

  /**
   * 获取两个日期之间的天数差
   */
  static getDaysDiff(startDate: Date | string | number, endDate: Date | string | number): number {
    const start = this.parse(startDate);
    const end = this.parse(endDate);
    if (!start || !end) return 0;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取两个日期之间的月数差
   */
  static getMonthsDiff(startDate: Date | string | number, endDate: Date | string | number): number {
    const start = this.parse(startDate);
    const end = this.parse(endDate);
    if (!start || !end) return 0;

    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();

    return (endYear - startYear) * 12 + (endMonth - startMonth);
  }

  /**
   * 获取两个日期之间的年数差
   */
  static getYearsDiff(startDate: Date | string | number, endDate: Date | string | number): number {
    const start = this.parse(startDate);
    const end = this.parse(endDate);
    if (!start || !end) return 0;

    return end.getFullYear() - start.getFullYear();
  }

  /**
   * 判断是否是闰年
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * 获取某个月的天数
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  /**
   * 获取当前日期
   */
  static today(): Date {
    return new Date();
  }

  /**
   * 获取当前时间戳
   */
  static now(): number {
    return Date.now();
  }

  /**
   * 添加天数
   */
  static addDays(date: Date | string | number, days: number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * 添加月数
   */
  static addMonths(date: Date | string | number, months: number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setMonth(d.getMonth() + months);
    return d;
  }

  /**
   * 添加年数
   */
  static addYears(date: Date | string | number, years: number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  /**
   * 获取本周的第一天（周一）
   */
  static getFirstDayOfWeek(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d;
  }

  /**
   * 获取本周的最后一天（周日）
   */
  static getLastDayOfWeek(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    const day = d.getDay() || 7;
    d.setDate(d.getDate() + (7 - day));
    return d;
  }

  /**
   * 获取本月的第一天
   */
  static getFirstDayOfMonth(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setDate(1);
    return d;
  }

  /**
   * 获取本月的最后一天
   */
  static getLastDayOfMonth(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d;
  }

  /**
   * 获取本季度的第一天
   */
  static getFirstDayOfQuarter(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    const quarter = Math.floor(d.getMonth() / 3);
    d.setMonth(quarter * 3);
    d.setDate(1);
    return d;
  }

  /**
   * 获取本季度的最后一天
   */
  static getLastDayOfQuarter(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    const quarter = Math.floor(d.getMonth() / 3);
    d.setMonth(quarter * 3 + 3);
    d.setDate(0);
    return d;
  }

  /**
   * 获取本年的第一天
   */
  static getFirstDayOfYear(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setMonth(0);
    d.setDate(1);
    return d;
  }

  /**
   * 获取本年的最后一天
   */
  static getLastDayOfYear(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setMonth(11);
    d.setDate(31);
    return d;
  }

  /**
   * 判断是否是今天
   */
  static isToday(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  /**
   * 判断是否是昨天
   */
  static isYesterday(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()
    );
  }

  /**
   * 判断是否是明天
   */
  static isTomorrow(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate()
    );
  }

  /**
   * 判断是否是本周
   */
  static isThisWeek(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const firstDay = this.getFirstDayOfWeek(new Date());
    const lastDay = this.getLastDayOfWeek(new Date());
    return d >= firstDay && d <= lastDay;
  }

  /**
   * 判断是否是本月
   */
  static isThisMonth(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth()
    );
  }

  /**
   * 判断是否是本年
   */
  static isThisYear(date: Date | string | number): boolean {
    const d = this.parse(date);
    if (!d) return false;
    const today = new Date();
    return d.getFullYear() === today.getFullYear();
  }

  /**
   * 格式化相对时间
   */
  static formatRelative(date: Date | string | number): string {
    const d = this.parse(date);
    if (!d) return '';

    const now = Date.now();
    const diff = now - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return '刚刚';
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 30) {
      return `${days}天前`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months}个月前`;
    } else {
      const years = Math.floor(days / 365);
      return `${years}年前`;
    }
  }

  /**
   * 获取日期的开始时间（00:00:00）
   */
  static getStartOfDay(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * 获取日期的结束时间（23:59:59）
   */
  static getEndOfDay(date: Date | string | number): Date | null {
    const d = this.parse(date);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  }

  /**
   * 获取当前时间的时区偏移（分钟）
   */
  static getTimezoneOffset(date: Date | string | number): number {
    const d = this.parse(date);
    return d ? d.getTimezoneOffset() : 0;
  }

  /**
   * 获取当前时间的时区名称
   */
  static getTimezoneName(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

/**
 * 获取当前日期
 */
export function today(): Date {
  return DateUtils.today();
}

/**
 * 获取当前时间戳
 */
export function now(): number {
  return DateUtils.now();
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return DateUtils.format(date, format);
}

/**
 * 解析日期
 */
export function parseDate(date: Date | string | number): Date | null {
  return DateUtils.parse(date);
}

/**
 * 获取相对时间
 */
export function getRelativeTime(date: Date | string | number): string {
  return DateUtils.formatRelative(date);
}

/**
 * 获取两个日期之间的天数差
 */
export function getDaysBetween(startDate: Date | string | number, endDate: Date | string | number): number {
  return DateUtils.getDaysDiff(startDate, endDate);
}