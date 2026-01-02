const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiKeySchema = new mongoose.Schema({
  // API Key 所属用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // API Key 所属企业（可选）
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    default: null
  },
  // API Key 名称
  name: {
    type: String,
    required: [true, '请输入API Key名称'],
    trim: true,
    maxlength: [100, 'API Key名称不能超过100个字符']
  },
  // API Key 值
  key: {
    type: String,
    required: true,
    unique: true
  },
  // API Key 哈希值（用于验证）
  keyHash: {
    type: String,
    required: true
  },
  // API Key 状态
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired'],
    default: 'active',
    required: true
  },
  // API Key 权限范围
  permissions: [{
    type: String,
    enum: [
      'property:read',
      'property:write',
      'valuation:read',
      'valuation:write',
      'report:read',
      'report:write',
      'data:read',
      'data:write',
      'batch:valuation'
    ],
    default: ['property:read', 'valuation:read', 'report:read']
  }],
  // API Key 有效期
  expiresAt: {
    type: Date,
    default: null
  },
  // API Key 使用统计
  usageStats: {
    totalCalls: {
      type: Number,
      default: 0
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    callsThisMonth: {
      type: Number,
      default: 0
    },
    callsThisDay: {
      type: Number,
      default: 0
    },
    callsThisHour: {
      type: Number,
      default: 0
    },
    callsThisMinute: {
      type: Number,
      default: 0
    }
  },
  // API Key 调用频率限制
  rateLimit: {
    // 每分钟调用限制
    perMinute: {
      type: Number,
      default: 60 // 默认每分钟60次
    },
    // 每小时调用限制
    perHour: {
      type: Number,
      default: 1000 // 默认每小时1000次
    },
    // 每天调用限制
    perDay: {
      type: Number,
      default: 10000 // 默认每天10000次
    }
  },
  // 各种时间窗口的重置时间
  lastResetAt: {
    minute: {
      type: Date,
      default: Date.now
    },
    hour: {
      type: Date,
      default: Date.now
    },
    day: {
      type: Date,
      default: Date.now
    },
    month: {
      type: Date,
      default: Date.now
    }
  },
  // API Key 备注
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'API Key描述不能超过500个字符']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 生成API Key
ApiKeySchema.pre('save', function(next) {
  // 如果是新创建的API Key，生成key值
  if (this.isNew) {
    // 生成随机API Key
    const key = crypto.randomBytes(32).toString('hex');
    this.key = key;
    // 生成哈希值用于验证
    this.keyHash = crypto.createHash('sha256').update(key).digest('hex');
  }
  
  next();
});

// 静态方法：通过key值查找API Key
ApiKeySchema.statics.findByKey = async function(key) {
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  return await this.findOne({ keyHash, status: 'active' });
};

// 更新API Key使用统计
ApiKeySchema.methods.updateUsage = async function() {
  const now = new Date();
  
  // 更新总调用次数和最后使用时间
  this.usageStats.totalCalls += 1;
  this.usageStats.lastUsedAt = now;
  
  // 检查并重置每分钟调用计数
  const lastMinute = new Date(this.lastResetAt.minute);
  if (now - lastMinute > 60 * 1000) {
    this.usageStats.callsThisMinute = 1;
    this.lastResetAt.minute = now;
  } else {
    this.usageStats.callsThisMinute += 1;
  }
  
  // 检查并重置每小时调用计数
  const lastHour = new Date(this.lastResetAt.hour);
  if (now - lastHour > 60 * 60 * 1000) {
    this.usageStats.callsThisHour = 1;
    this.lastResetAt.hour = now;
  } else {
    this.usageStats.callsThisHour += 1;
  }
  
  // 检查并重置每天调用计数
  const lastDay = new Date(this.lastResetAt.day);
  if (now - lastDay > 24 * 60 * 60 * 1000) {
    this.usageStats.callsThisDay = 1;
    this.lastResetAt.day = now;
  } else {
    this.usageStats.callsThisDay += 1;
  }
  
  // 检查并重置每月调用计数
  const lastMonth = new Date(this.lastResetAt.month);
  if (now.getMonth() !== lastMonth.getMonth() || now.getFullYear() !== lastMonth.getFullYear()) {
    this.usageStats.callsThisMonth = 1;
    this.lastResetAt.month = now;
  } else {
    this.usageStats.callsThisMonth += 1;
  }
  
  await this.save();
};

// 检查API Key是否超过速率限制
ApiKeySchema.methods.isRateLimited = async function() {
  const now = new Date();
  
  // 检查并重置每分钟调用计数（如果需要）
  const lastMinute = new Date(this.lastResetAt.minute);
  if (now - lastMinute > 60 * 1000) {
    this.usageStats.callsThisMinute = 0;
    this.lastResetAt.minute = now;
    await this.save();
  }
  
  // 检查并重置每小时调用计数（如果需要）
  const lastHour = new Date(this.lastResetAt.hour);
  if (now - lastHour > 60 * 60 * 1000) {
    this.usageStats.callsThisHour = 0;
    this.lastResetAt.hour = now;
    await this.save();
  }
  
  // 检查并重置每天调用计数（如果需要）
  const lastDay = new Date(this.lastResetAt.day);
  if (now - lastDay > 24 * 60 * 60 * 1000) {
    this.usageStats.callsThisDay = 0;
    this.lastResetAt.day = now;
    await this.save();
  }
  
  // 检查是否超过速率限制
  if (this.usageStats.callsThisMinute >= this.rateLimit.perMinute) {
    return { limited: true, reason: 'per_minute', limit: this.rateLimit.perMinute };
  }
  
  if (this.usageStats.callsThisHour >= this.rateLimit.perHour) {
    return { limited: true, reason: 'per_hour', limit: this.rateLimit.perHour };
  }
  
  if (this.usageStats.callsThisDay >= this.rateLimit.perDay) {
    return { limited: true, reason: 'per_day', limit: this.rateLimit.perDay };
  }
  
  return { limited: false };
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);
