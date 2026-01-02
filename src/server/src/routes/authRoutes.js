const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  generateToken,
  verifyToken,
  requirePermission,
  requireAdmin,
} = require('../middleware/authMiddleware');

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    // 验证请求数据
    const { username, email, password, fullName, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要字段',
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已存在',
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      fullName,
      role: role || 'user',
    });

    // 保存用户
    await user.save();

    // 生成token
    const token = generateToken(user);

    // 返回用户信息和token
    res.status(201).json({
      code: 201,
      message: '用户注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    // 验证请求数据
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要字段',
      });
    }

    // 查找用户
    const user = await User.findOne({ username });

    // 检查用户是否存在
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 检查用户是否被锁定
    if (user.isLocked()) {
      return res.status(401).json({
        code: 401,
        message: '账号已被锁定，请稍后重试',
      });
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      // 增加登录尝试次数
      await user.incrementLoginAttempts();
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 重置登录尝试次数
    await user.resetLoginAttempts();

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    // 生成token
    const token = generateToken(user);

    // 返回用户信息和token
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取当前用户信息
router.get('/me', verifyToken, async (req, res) => {
  try {
    // 从token中获取用户id
    const userId = req.user.id;

    // 查找用户
    const user = await User.findById(userId).select(
      '-password -twoFactorSecret'
    );

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.status(200).json({
      code: 200,
      message: '获取用户信息成功',
      data: user,
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 更新用户信息
router.put('/me', verifyToken, async (req, res) => {
  try {
    // 从token中获取用户id
    const userId = req.user.id;

    // 验证请求数据
    const { fullName, email } = req.body;

    // 查找用户
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    // 更新用户信息
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    // 保存更新
    await user.save();

    // 返回更新后的用户信息
    res.status(200).json({
      code: 200,
      message: '更新用户信息成功',
      data: user,
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 更改密码
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    // 从token中获取用户id
    const userId = req.user.id;

    // 验证请求数据
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要字段',
      });
    }

    // 查找用户
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    // 验证旧密码
    const isPasswordValid = await user.validatePassword(oldPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        message: '旧密码错误',
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      code: 200,
      message: '密码更改成功',
    });
  } catch (error) {
    console.error('更改密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取所有用户（管理员权限）
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    // 获取查询参数
    const { page = 1, limit = 10, role, status } = req.query;

    // 构建查询条件
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    // 计算分页
    const skip = (page - 1) * limit;

    // 查找用户
    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总记录数
    const total = await User.countDocuments(query);

    res.status(200).json({
      code: 200,
      message: '获取用户列表成功',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 更新用户状态（管理员权限）
router.put('/users/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    // 获取用户id
    const userId = req.params.id;

    // 验证请求数据
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要字段',
      });
    }

    // 查找用户
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    // 更新状态
    user.status = status;
    await user.save();

    res.status(200).json({
      code: 200,
      message: '更新用户状态成功',
      data: user,
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取权限列表
router.get('/permissions', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      code: 200,
      message: '获取权限列表成功',
      data: User.getPermissions(),
    });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取角色列表
router.get('/roles', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      code: 200,
      message: '获取角色列表成功',
      data: User.getRoles(),
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取角色权限映射
router.get('/role-permissions', verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      code: 200,
      message: '获取角色权限映射成功',
      data: User.getRolePermissions(),
    });
  } catch (error) {
    console.error('获取角色权限映射失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

module.exports = router;
