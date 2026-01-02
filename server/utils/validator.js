// 参数验证工具函数

/**
 * 验证是否为必填字段
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const required = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName}不能为空`;
  }
  return null;
};

/**
 * 验证是否为有效的字符串
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @param {number} minLength - 最小长度
 * @param {number} maxLength - 最大长度
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const string = (value, fieldName, minLength = 0, maxLength = Infinity) => {
  if (value === undefined || value === null) {
    return null; // 非必填字段
  }

  if (typeof value !== 'string') {
    return `${fieldName}必须是字符串类型`;
  }

  if (value.length < minLength) {
    return `${fieldName}长度不能少于${minLength}个字符`;
  }

  if (value.length > maxLength) {
    return `${fieldName}长度不能超过${maxLength}个字符`;
  }

  return null;
};

/**
 * 验证是否为有效的数字
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const number = (value, fieldName, min = -Infinity, max = Infinity) => {
  if (value === undefined || value === null) {
    return null; // 非必填字段
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return `${fieldName}必须是数字类型`;
  }

  if (numValue < min) {
    return `${fieldName}不能小于${min}`;
  }

  if (numValue > max) {
    return `${fieldName}不能大于${max}`;
  }

  return null;
};

/**
 * 验证是否为有效的整数
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const integer = (value, fieldName, min = -Infinity, max = Infinity) => {
  if (value === undefined || value === null) {
    return null; // 非必填字段
  }

  const intValue = parseInt(value);
  if (isNaN(intValue) || intValue !== parseFloat(value)) {
    return `${fieldName}必须是整数类型`;
  }

  if (intValue < min) {
    return `${fieldName}不能小于${min}`;
  }

  if (intValue > max) {
    return `${fieldName}不能大于${max}`;
  }

  return null;
};

/**
 * 验证是否为有效的邮箱地址
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const email = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null; // 非必填字段
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${fieldName}不是有效的邮箱地址`;
  }

  return null;
};

/**
 * 验证是否为有效的手机号
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const phone = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null; // 非必填字段
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(value)) {
    return `${fieldName}不是有效的手机号`;
  }

  return null;
};

/**
 * 验证是否为有效的URL地址
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const url = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null; // 非必填字段
  }

  try {
    new URL(value);
    return null;
  } catch (error) {
    return `${fieldName}不是有效的URL地址`;
  }
};

/**
 * 验证是否在指定的枚举值列表中
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @param {Array} enumValues - 枚举值列表
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const enumValue = (value, fieldName, enumValues) => {
  if (value === undefined || value === null) {
    return null; // 非必填字段
  }

  if (!enumValues.includes(value)) {
    return `${fieldName}必须是${enumValues.join('、')}中的一个`;
  }

  return null;
};

/**
 * 验证是否为有效的JSON字符串
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const json = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null; // 非必填字段
  }

  try {
    JSON.parse(value);
    return null;
  } catch (error) {
    return `${fieldName}不是有效的JSON字符串`;
  }
};

/**
 * 验证是否为有效的日期格式
 * @param {any} value - 要验证的值
 * @param {string} fieldName - 字段名称
 * @returns {string|null} 错误信息，为null表示验证通过
 */
const date = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null; // 非必填字段
  }

  if (isNaN(Date.parse(value))) {
    return `${fieldName}不是有效的日期格式`;
  }

  return null;
};

/**
 * 验证对象中指定字段的规则
 * @param {Object} data - 要验证的数据对象
 * @param {Object} rules - 验证规则，键为字段名，值为验证函数数组
 * @returns {Object|null} 验证结果，为null表示验证通过，否则返回包含错误信息的对象
 */
const validate = (data, rules) => {
  const errors = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(data[fieldName], fieldName);
      if (error) {
        errors[fieldName] = error;
        break; // 一个字段只返回一个错误信息
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  required,
  string,
  number,
  integer,
  email,
  phone,
  url,
  enumValue,
  json,
  date,
  validate
};
