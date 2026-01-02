// 响应格式化工具函数

/**
 * 成功响应
 * @param {Object} res - Express响应对象
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @param {number} statusCode - 状态码
 * @returns {Object} 格式化后的响应
 */
const successResponse = (res, data = null, message = '操作成功', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * 错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {number} statusCode - 状态码
 * @param {any} errors - 错误详情
 * @returns {Object} 格式化后的错误响应
 */
const errorResponse = (res, message = '操作失败', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * 分页响应
 * @param {Object} res - Express响应对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总数据量
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页数据量
 * @param {string} message - 响应消息
 * @returns {Object} 格式化后的分页响应
 */
const paginatedResponse = (res, list, total, page = 1, pageSize = 20, message = '操作成功') => {
  const totalPages = Math.ceil(total / pageSize);

  return res.json({
    success: true,
    message,
    data: {
      list,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: total || 0,
        totalPages
      }
    }
  });
};

/**
 * 未授权响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {Object} 格式化后的未授权响应
 */
const unauthorizedResponse = (res, message = '未授权访问') => {
  return errorResponse(res, message, 401);
};

/**
 * 禁止访问响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {Object} 格式化后的禁止访问响应
 */
const forbiddenResponse = (res, message = '无权访问该资源') => {
  return errorResponse(res, message, 403);
};

/**
 * 资源不存在响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @returns {Object} 格式化后的资源不存在响应
 */
const notFoundResponse = (res, message = '请求的资源不存在') => {
  return errorResponse(res, message, 404);
};

/**
 * 服务器内部错误响应
 * @param {Object} res - Express响应对象
 * @param {string} message - 错误消息
 * @param {any} error - 错误详情（仅开发环境返回）
 * @returns {Object} 格式化后的服务器内部错误响应
 */
const serverErrorResponse = (res, message = '服务器内部错误，请稍后重试', error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(500).json(response);
};

export {
  successResponse,
  errorResponse,
  paginatedResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse
};
