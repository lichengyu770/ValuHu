const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('./mysql-db.js');
require('dotenv').config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});
app.use(limiter);

// 统一响应格式
const sendResponse = (res, code, message, data = null, pagination = null) => {
  const response = {
    code,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  if (pagination) {
    response.pagination = pagination;
  }

  res.status(code).json(response);
};

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  sendResponse(res, 500, '服务器内部错误', null);
});

// 参数校验错误处理
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return sendResponse(res, 400, '请求参数错误', { errors: errorMessages });
  }
  next();
};

// 初始化数据库表
async function initializeDatabase() {
  try {
    const connection = await db.query('SELECT 1 FROM users LIMIT 1');
    console.log('数据库表已存在');
  } catch (error) {
    console.log('数据库表不存在，开始初始化');
    // 这里可以添加创建表的逻辑，如果需要的话
  }
}

// -------------------- 用户管理API --------------------

// 用户注册
app.post(
  '/api/users/register',
  [
    body('username')
      .isLength({ min: 6 })
      .withMessage('用户名长度不能少于6个字符'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('密码长度不能少于8个字符'),
    body('email').isEmail().withMessage('无效的邮箱格式'),
    body('phone').isMobilePhone('zh-CN').withMessage('无效的手机号格式'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { username, password, email, phone } = req.body;

      // 检查用户名是否已存在
      const existingUser = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?',
        [username, email, phone]
      );
      if (existingUser.length > 0) {
        return sendResponse(res, 400, '用户名、邮箱或手机号已存在');
      }

      // 密码哈希（实际项目中应该使用bcrypt等库）
      const hashedPassword = password; // 临时实现，实际项目中需要哈希处理

      // 创建用户
      const userId = await db.insert(
        'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, phone]
      );

      sendResponse(res, 201, '用户注册成功', { userId });
    } catch (error) {
      sendResponse(res, 500, '注册失败', { error: error.message });
    }
  }
);

// 用户登录
app.post(
  '/api/users/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // 查询用户
      const users = await db.query('SELECT * FROM users WHERE username = ?', [
        username,
      ]);
      if (users.length === 0) {
        return sendResponse(res, 401, '用户名或密码错误');
      }

      const user = users[0];

      // 验证密码（实际项目中应该使用bcrypt等库）
      if (user.password !== password) {
        return sendResponse(res, 401, '用户名或密码错误');
      }

      // 更新最后登录时间
      await db.update(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      sendResponse(res, 200, '登录成功', {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      sendResponse(res, 500, '登录失败', { error: error.message });
    }
  }
);

// 获取用户列表（带分页）
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const role = req.query.role || '';
    const status = req.query.status || '';

    // 构建查询条件
    let whereClause = '';
    let params = [];
    let conditionCount = 0;

    if (role) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} role = ?`;
      params.push(role);
      conditionCount++;
    }

    if (status) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} status = ?`;
      params.push(status);
      conditionCount++;
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM users${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 查询用户列表
    const usersSql = `SELECT * FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    const users = await db.query(usersSql, params);

    sendResponse(res, 200, '获取用户列表成功', users, {
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    sendResponse(res, 500, '获取用户列表失败', { error: error.message });
  }
});

// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return sendResponse(res, 404, '用户不存在');
    }

    sendResponse(res, 200, '获取用户成功', users[0]);
  } catch (error) {
    sendResponse(res, 500, '获取用户失败', { error: error.message });
  }
});

// 更新用户
app.put(
  '/api/users/:id',
  [
    body('email').optional().isEmail().withMessage('无效的邮箱格式'),
    body('phone')
      .optional()
      .isMobilePhone('zh-CN')
      .withMessage('无效的手机号格式'),
    body('role')
      .optional()
      .isIn(['admin', 'user', 'guest'])
      .withMessage('无效的用户角色'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('无效的用户状态'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email, phone, role, status } = req.body;

      // 检查用户是否存在
      const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (users.length === 0) {
        return sendResponse(res, 404, '用户不存在');
      }

      // 构建更新语句
      let updateFields = [];
      let params = [];

      if (email) {
        updateFields.push('email = ?');
        params.push(email);
      }

      if (phone) {
        updateFields.push('phone = ?');
        params.push(phone);
      }

      if (role) {
        updateFields.push('role = ?');
        params.push(role);
      }

      if (status) {
        updateFields.push('status = ?');
        params.push(status);
      }

      if (updateFields.length === 0) {
        return sendResponse(res, 400, '没有需要更新的字段');
      }

      params.push(id);

      // 执行更新
      const affectedRows = await db.update(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if (affectedRows === 0) {
        return sendResponse(res, 400, '更新失败');
      }

      sendResponse(res, 200, '更新用户成功');
    } catch (error) {
      sendResponse(res, 500, '更新用户失败', { error: error.message });
    }
  }
);

// 删除用户
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查用户是否存在
    const users = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return sendResponse(res, 404, '用户不存在');
    }

    // 执行删除
    const affectedRows = await db.del('DELETE FROM users WHERE id = ?', [id]);

    if (affectedRows === 0) {
      return sendResponse(res, 400, '删除失败');
    }

    sendResponse(res, 200, '删除用户成功');
  } catch (error) {
    sendResponse(res, 500, '删除用户失败', { error: error.message });
  }
});

// -------------------- 房产管理API --------------------

// 创建房产
app.post(
  '/api/properties',
  [
    body('user_id').isInt().withMessage('无效的用户ID'),
    body('title')
      .isLength({ min: 5 })
      .withMessage('房产标题长度不能少于5个字符'),
    body('city').notEmpty().withMessage('城市不能为空'),
    body('district').notEmpty().withMessage('区域不能为空'),
    body('address').notEmpty().withMessage('详细地址不能为空'),
    body('rooms').notEmpty().withMessage('户型不能为空'),
    body('area').isFloat({ min: 1 }).withMessage('面积必须大于0'),
    body('floor').isInt({ min: 1 }).withMessage('所在楼层必须大于0'),
    body('total_floors').isInt({ min: 1 }).withMessage('总楼层必须大于0'),
    body('building_year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('建筑年份无效'),
    body('orientation').notEmpty().withMessage('朝向不能为空'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const {
        user_id,
        title,
        city,
        district,
        address,
        rooms,
        area,
        floor,
        total_floors,
        building_year,
        property_type = '住宅',
        orientation,
        decoration = '简装',
        features,
        image,
      } = req.body;

      // 检查用户是否存在
      const users = await db.query('SELECT * FROM users WHERE id = ?', [
        user_id,
      ]);
      if (users.length === 0) {
        return sendResponse(res, 404, '用户不存在');
      }

      // 检查楼层是否合理
      if (floor > total_floors) {
        return sendResponse(res, 400, '所在楼层不能超过总楼层');
      }

      // 创建房产
      const propertyId = await db.insert(
        'INSERT INTO properties (user_id, title, city, district, address, rooms, area, floor, total_floors, building_year, property_type, orientation, decoration, features, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user_id,
          title,
          city,
          district,
          address,
          rooms,
          area,
          floor,
          total_floors,
          building_year,
          property_type,
          orientation,
          decoration,
          features,
          image,
        ]
      );

      sendResponse(res, 201, '创建房产成功', { propertyId });
    } catch (error) {
      sendResponse(res, 500, '创建房产失败', { error: error.message });
    }
  }
);

// 获取房产列表（带分页）
app.get('/api/properties', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const user_id = req.query.user_id || '';
    const city = req.query.city || '';
    const district = req.query.district || '';
    const property_type = req.query.property_type || '';
    const status = req.query.status || '';

    // 构建查询条件
    let whereClause = '';
    let params = [];
    let conditionCount = 0;

    if (user_id) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} user_id = ?`;
      params.push(user_id);
      conditionCount++;
    }

    if (city) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} city = ?`;
      params.push(city);
      conditionCount++;
    }

    if (district) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} district = ?`;
      params.push(district);
      conditionCount++;
    }

    if (property_type) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} property_type = ?`;
      params.push(property_type);
      conditionCount++;
    }

    if (status) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} status = ?`;
      params.push(status);
      conditionCount++;
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM properties${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 查询房产列表
    const propertiesSql = `SELECT * FROM properties${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    const properties = await db.query(propertiesSql, params);

    sendResponse(res, 200, '获取房产列表成功', properties, {
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    sendResponse(res, 500, '获取房产列表失败', { error: error.message });
  }
});

// 获取单个房产
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const properties = await db.query('SELECT * FROM properties WHERE id = ?', [
      id,
    ]);

    if (properties.length === 0) {
      return sendResponse(res, 404, '房产不存在');
    }

    sendResponse(res, 200, '获取房产成功', properties[0]);
  } catch (error) {
    sendResponse(res, 500, '获取房产失败', { error: error.message });
  }
});

// 更新房产
app.put(
  '/api/properties/:id',
  [
    body('title')
      .optional()
      .isLength({ min: 5 })
      .withMessage('房产标题长度不能少于5个字符'),
    body('area').optional().isFloat({ min: 1 }).withMessage('面积必须大于0'),
    body('floor').optional().isInt({ min: 1 }).withMessage('所在楼层必须大于0'),
    body('total_floors')
      .optional()
      .isInt({ min: 1 })
      .withMessage('总楼层必须大于0'),
    body('building_year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('建筑年份无效'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        city,
        district,
        address,
        rooms,
        area,
        floor,
        total_floors,
        building_year,
        property_type,
        orientation,
        decoration,
        features,
        image,
        status,
      } = req.body;

      // 检查房产是否存在
      const properties = await db.query(
        'SELECT * FROM properties WHERE id = ?',
        [id]
      );
      if (properties.length === 0) {
        return sendResponse(res, 404, '房产不存在');
      }

      // 检查楼层是否合理
      if (floor && total_floors && floor > total_floors) {
        return sendResponse(res, 400, '所在楼层不能超过总楼层');
      }

      // 构建更新语句
      let updateFields = [];
      let params = [];

      if (title) (updateFields.push('title = ?'), params.push(title));
      if (city) (updateFields.push('city = ?'), params.push(city));
      if (district) (updateFields.push('district = ?'), params.push(district));
      if (address) (updateFields.push('address = ?'), params.push(address));
      if (rooms) (updateFields.push('rooms = ?'), params.push(rooms));
      if (area) (updateFields.push('area = ?'), params.push(area));
      if (floor) (updateFields.push('floor = ?'), params.push(floor));
      if (total_floors)
        (updateFields.push('total_floors = ?'), params.push(total_floors));
      if (building_year)
        (updateFields.push('building_year = ?'), params.push(building_year));
      if (property_type)
        (updateFields.push('property_type = ?'), params.push(property_type));
      if (orientation)
        (updateFields.push('orientation = ?'), params.push(orientation));
      if (decoration)
        (updateFields.push('decoration = ?'), params.push(decoration));
      if (features) (updateFields.push('features = ?'), params.push(features));
      if (image) (updateFields.push('image = ?'), params.push(image));
      if (status) (updateFields.push('status = ?'), params.push(status));

      if (updateFields.length === 0) {
        return sendResponse(res, 400, '没有需要更新的字段');
      }

      params.push(id);

      // 执行更新
      const affectedRows = await db.update(
        `UPDATE properties SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if (affectedRows === 0) {
        return sendResponse(res, 400, '更新失败');
      }

      sendResponse(res, 200, '更新房产成功');
    } catch (error) {
      sendResponse(res, 500, '更新房产失败', { error: error.message });
    }
  }
);

// 删除房产
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查房产是否存在
    const properties = await db.query('SELECT * FROM properties WHERE id = ?', [
      id,
    ]);
    if (properties.length === 0) {
      return sendResponse(res, 404, '房产不存在');
    }

    // 执行删除
    const affectedRows = await db.del('DELETE FROM properties WHERE id = ?', [
      id,
    ]);

    if (affectedRows === 0) {
      return sendResponse(res, 400, '删除失败');
    }

    sendResponse(res, 200, '删除房产成功');
  } catch (error) {
    sendResponse(res, 500, '删除房产失败', { error: error.message });
  }
});

// -------------------- 估价记录API --------------------

// 创建估价记录
app.post(
  '/api/valuation-records',
  [
    body('property_id').isInt().withMessage('无效的房产ID'),
    body('user_id').isInt().withMessage('无效的用户ID'),
    body('estimated_value')
      .isFloat({ min: 0.01 })
      .withMessage('估价金额必须大于0'),
    body('unit_price').isFloat({ min: 0.01 }).withMessage('单价必须大于0'),
    body('confidence_level')
      .isInt({ min: 0, max: 100 })
      .withMessage('置信度必须在0-100之间'),
    body('valuation_method')
      .isIn(['市场比较法', '收益法', '成本法'])
      .withMessage('估价方法无效'),
    body('valuation_algorithm').notEmpty().withMessage('估价算法版本不能为空'),
    body('input_params').isJSON().withMessage('输入参数必须是有效的JSON格式'),
    body('output_data').isJSON().withMessage('输出数据必须是有效的JSON格式'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const {
        property_id,
        user_id,
        estimated_value,
        unit_price,
        confidence_level,
        valuation_method,
        valuation_algorithm,
        input_params,
        output_data,
        status = 'success',
        error_message,
      } = req.body;

      // 检查房产是否存在
      const properties = await db.query(
        'SELECT * FROM properties WHERE id = ?',
        [property_id]
      );
      if (properties.length === 0) {
        return sendResponse(res, 404, '房产不存在');
      }

      // 检查用户是否存在
      const users = await db.query('SELECT * FROM users WHERE id = ?', [
        user_id,
      ]);
      if (users.length === 0) {
        return sendResponse(res, 404, '用户不存在');
      }

      // 检查状态和错误信息的关系
      if (status === 'failed' && !error_message) {
        return sendResponse(res, 400, '错误状态必须提供错误信息');
      }

      // 创建估价记录
      const recordId = await db.insert(
        'INSERT INTO valuation_records (property_id, user_id, estimated_value, unit_price, confidence_level, valuation_method, valuation_algorithm, input_params, output_data, status, error_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          property_id,
          user_id,
          estimated_value,
          unit_price,
          confidence_level,
          valuation_method,
          valuation_algorithm,
          input_params,
          output_data,
          status,
          error_message,
        ]
      );

      sendResponse(res, 201, '创建估价记录成功', { recordId });
    } catch (error) {
      sendResponse(res, 500, '创建估价记录失败', { error: error.message });
    }
  }
);

// 获取估价记录列表（带分页）
app.get('/api/valuation-records', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    const property_id = req.query.property_id || '';
    const user_id = req.query.user_id || '';
    const status = req.query.status || '';
    const valuation_method = req.query.valuation_method || '';

    // 构建查询条件
    let whereClause = '';
    let params = [];
    let conditionCount = 0;

    if (property_id) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} property_id = ?`;
      params.push(property_id);
      conditionCount++;
    }

    if (user_id) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} user_id = ?`;
      params.push(user_id);
      conditionCount++;
    }

    if (status) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} status = ?`;
      params.push(status);
      conditionCount++;
    }

    if (valuation_method) {
      whereClause += `${conditionCount > 0 ? ' AND' : ' WHERE'} valuation_method = ?`;
      params.push(valuation_method);
      conditionCount++;
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM valuation_records${whereClause}`;
    const countResult = await db.query(countSql, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 查询估价记录列表
    const recordsSql = `SELECT * FROM valuation_records${whereClause} ORDER BY valuation_date DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    const records = await db.query(recordsSql, params);

    sendResponse(res, 200, '获取估价记录列表成功', records, {
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    sendResponse(res, 500, '获取估价记录列表失败', { error: error.message });
  }
});

// 获取单个估价记录
app.get('/api/valuation-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await db.query(
      'SELECT * FROM valuation_records WHERE id = ?',
      [id]
    );

    if (records.length === 0) {
      return sendResponse(res, 404, '估价记录不存在');
    }

    sendResponse(res, 200, '获取估价记录成功', records[0]);
  } catch (error) {
    sendResponse(res, 500, '获取估价记录失败', { error: error.message });
  }
});

// 更新估价记录
app.put(
  '/api/valuation-records/:id',
  [
    body('estimated_value')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('估价金额必须大于0'),
    body('unit_price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('单价必须大于0'),
    body('confidence_level')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('置信度必须在0-100之间'),
    body('valuation_method')
      .optional()
      .isIn(['市场比较法', '收益法', '成本法'])
      .withMessage('估价方法无效'),
    body('input_params')
      .optional()
      .isJSON()
      .withMessage('输入参数必须是有效的JSON格式'),
    body('output_data')
      .optional()
      .isJSON()
      .withMessage('输出数据必须是有效的JSON格式'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        estimated_value,
        unit_price,
        confidence_level,
        valuation_method,
        valuation_algorithm,
        input_params,
        output_data,
        status,
        error_message,
      } = req.body;

      // 检查估价记录是否存在
      const records = await db.query(
        'SELECT * FROM valuation_records WHERE id = ?',
        [id]
      );
      if (records.length === 0) {
        return sendResponse(res, 404, '估价记录不存在');
      }

      // 检查状态和错误信息的关系
      if (status === 'failed' && !error_message) {
        return sendResponse(res, 400, '错误状态必须提供错误信息');
      }

      // 构建更新语句
      let updateFields = [];
      let params = [];

      if (estimated_value)
        (updateFields.push('estimated_value = ?'),
          params.push(estimated_value));
      if (unit_price)
        (updateFields.push('unit_price = ?'), params.push(unit_price));
      if (confidence_level)
        (updateFields.push('confidence_level = ?'),
          params.push(confidence_level));
      if (valuation_method)
        (updateFields.push('valuation_method = ?'),
          params.push(valuation_method));
      if (valuation_algorithm)
        (updateFields.push('valuation_algorithm = ?'),
          params.push(valuation_algorithm));
      if (input_params)
        (updateFields.push('input_params = ?'), params.push(input_params));
      if (output_data)
        (updateFields.push('output_data = ?'), params.push(output_data));
      if (status) (updateFields.push('status = ?'), params.push(status));
      if (error_message)
        (updateFields.push('error_message = ?'), params.push(error_message));

      if (updateFields.length === 0) {
        return sendResponse(res, 400, '没有需要更新的字段');
      }

      params.push(id);

      // 执行更新
      const affectedRows = await db.update(
        `UPDATE valuation_records SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      if (affectedRows === 0) {
        return sendResponse(res, 400, '更新失败');
      }

      sendResponse(res, 200, '更新估价记录成功');
    } catch (error) {
      sendResponse(res, 500, '更新估价记录失败', { error: error.message });
    }
  }
);

// 删除估价记录
app.delete('/api/valuation-records/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查估价记录是否存在
    const records = await db.query(
      'SELECT * FROM valuation_records WHERE id = ?',
      [id]
    );
    if (records.length === 0) {
      return sendResponse(res, 404, '估价记录不存在');
    }

    // 执行删除
    const affectedRows = await db.del(
      'DELETE FROM valuation_records WHERE id = ?',
      [id]
    );

    if (affectedRows === 0) {
      return sendResponse(res, 400, '删除失败');
    }

    sendResponse(res, 200, '删除估价记录成功');
  } catch (error) {
    sendResponse(res, 500, '删除估价记录失败', { error: error.message });
  }
});

// -------------------- 健康检查API --------------------

app.get('/api/health', async (req, res) => {
  try {
    const isConnected = await db.testConnection();
    sendResponse(res, 200, '服务运行正常', {
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  } catch (error) {
    sendResponse(res, 500, '服务运行异常', { error: error.message });
  }
});

// 404处理
app.use('*', (req, res) => {
  sendResponse(res, 404, '接口不存在');
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  await initializeDatabase();
});

// 处理退出信号
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await db.closePool();
  process.exit(0);
});
