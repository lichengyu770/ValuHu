const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户权限枚举
const permissionsEnum = {
  // 仪表盘相关
  VIEW_DASHBOARD: 'view_dashboard',

  // GIS相关
  VIEW_GIS: 'view_gis',
  MANAGE_GIS_DATA: 'manage_gis_data',

  // 建筑相关
  VIEW_BUILDING: 'view_building',
  MANAGE_BUILDING: 'manage_building',

  // 加密相关
  VIEW_ENCRYPTION: 'view_encryption',
  MANAGE_ENCRYPTION: 'manage_encryption',

  // 证书相关
  VIEW_CERT: 'view_cert',
  MANAGE_CERT: 'manage_cert',

  // 收益相关
  VIEW_REVENUE: 'view_revenue',
  MANAGE_REVENUE: 'manage_revenue',

  // 系统管理
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_USERS: 'manage_users',
  VIEW_LOGS: 'view_logs',
  VIEW_MONITOR: 'view_monitor',
  MANAGE_DATA: 'manage_data',

  // 估价相关
  SUBMIT_VALUATION: 'submit_valuation',
  VIEW_VALUATION: 'view_valuation',
  MANAGE_VALUATION: 'manage_valuation',

  // 数据分析
  VIEW_ANALYTICS: 'view_analytics',
  GENERATE_REPORTS: 'generate_reports',
};

// 用户角色枚举
const rolesEnum = {
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
  USER: 'user',
  GUEST: 'guest',
};

// 用户角色权限映射
const rolePermissionsMap = {
  [rolesEnum.ADMIN]: Object.values(permissionsEnum),
  [rolesEnum.REVIEWER]: [
    permissionsEnum.VIEW_DASHBOARD,
    permissionsEnum.VIEW_GIS,
    permissionsEnum.VIEW_BUILDING,
    permissionsEnum.VIEW_ENCRYPTION,
    permissionsEnum.VIEW_CERT,
    permissionsEnum.VIEW_REVENUE,
    permissionsEnum.VIEW_VALUATION,
    permissionsEnum.VIEW_ANALYTICS,
  ],
  [rolesEnum.USER]: [
    permissionsEnum.VIEW_DASHBOARD,
    permissionsEnum.VIEW_GIS,
    permissionsEnum.VIEW_BUILDING,
    permissionsEnum.SUBMIT_VALUATION,
    permissionsEnum.VIEW_VALUATION,
  ],
  [rolesEnum.GUEST]: [permissionsEnum.VIEW_DASHBOARD],
};

// 用户模式定义
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: (props) => `${props.value} 不是有效的邮箱地址！`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: Object.values(rolesEnum),
    default: rolesEnum.USER,
  },
  permissions: {
    type: [String],
    enum: Object.values(permissionsEnum),
    default: function () {
      return rolePermissionsMap[this.role] || [];
    },
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active',
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  freeTrialCount: {
    type: Number,
    default: 10,
  },
});

// 中间件：在保存前自动哈希密码
UserSchema.pre('save', async function (next) {
  // 只有当密码被修改或创建新用户时才哈希密码
  if (!this.isModified('password')) return next();

  try {
    // 生成盐
    const salt = await bcrypt.genSalt(10);
    // 哈希密码
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 中间件：在保存前更新updatedAt字段
UserSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// 方法：验证密码
UserSchema.methods.validatePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 方法：检查用户是否被锁定
UserSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// 方法：重置登录尝试次数
UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
};

// 方法：增加登录尝试次数
UserSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts++;

  // 如果尝试次数超过5次，锁定账号1小时
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 60 * 60 * 1000; // 1小时后自动解锁
  }

  await this.save();
};

// 方法：检查用户是否具有特定权限
UserSchema.methods.hasPermission = function (permission) {
  // 管理员拥有所有权限
  if (this.role === rolesEnum.ADMIN) {
    return true;
  }

  // 检查用户是否拥有指定权限
  return this.permissions.includes(permission);
};

// 静态方法：获取所有权限
UserSchema.statics.getPermissions = function () {
  return permissionsEnum;
};

// 静态方法：获取所有角色
UserSchema.statics.getRoles = function () {
  return rolesEnum;
};

// 静态方法：获取角色权限映射
UserSchema.statics.getRolePermissions = function () {
  return rolePermissionsMap;
};

// 创建用户模型
const User = mongoose.model('User', UserSchema);

module.exports = User;
