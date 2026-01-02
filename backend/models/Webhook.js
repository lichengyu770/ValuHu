const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
  // Webhook 所属用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Webhook 所属企业（可选）
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    default: null
  },
  // Webhook 名称
  name: {
    type: String,
    required: [true, '请输入Webhook名称'],
    trim: true,
    maxlength: [100, 'Webhook名称不能超过100个字符']
  },
  // Webhook URL
  url: {
    type: String,
    required: [true, '请输入Webhook URL'],
    trim: true,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      '请输入有效的URL'
    ]
  },
  // Webhook 事件类型
  eventType: {
    type: [String],
    enum: [
      'valuation.created',
      'valuation.updated',
      'property.created',
      'property.updated',
      'report.generated'
    ],
    required: [true, '请选择Webhook事件类型'],
    default: ['valuation.updated']
  },
  // Webhook 状态
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true
  },
  // 签名密钥（用于验证请求来源）
  secret: {
    type: String,
    required: true,
    unique: true
  },
  // 重试策略
  retryPolicy: {
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    retryDelay: {
      type: Number,
      default: 60, // 秒
      min: 1,
      max: 3600
    }
  },
  // Webhook 使用统计
  usageStats: {
    totalCalls: {
      type: Number,
      default: 0
    },
    successCalls: {
      type: Number,
      default: 0
    },
    failedCalls: {
      type: Number,
      default: 0
    },
    lastCalledAt: {
      type: Date,
      default: null
    }
  },
  // 最后一次成功调用时间
  lastSuccessAt: {
    type: Date,
    default: null
  },
  // 最后一次失败调用信息
  lastFailure: {
    type: {
      timestamp: {
        type: Date
      },
      statusCode: {
        type: Number
      },
      message: {
        type: String
      }
    },
    default: null
  },
  // Webhook 描述
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Webhook描述不能超过500个字符']
  },
  // 创建时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 生成Webhook签名密钥
WebhookSchema.pre('save', function(next) {
  // 如果是新创建的Webhook，生成secret值
  if (this.isNew) {
    // 生成随机secret
    const secret = require('crypto').randomBytes(32).toString('hex');
    this.secret = secret;
  }
  
  next();
});

// 静态方法：通过用户ID获取Webhook列表
WebhookSchema.statics.findByUserId = async function(userId) {
  return await this.find({ userId });
};

// 静态方法：通过企业ID获取Webhook列表
WebhookSchema.statics.findByEnterpriseId = async function(enterpriseId) {
  return await this.find({ enterpriseId });
};

// 方法：更新Webhook使用统计
WebhookSchema.methods.updateUsage = async function(success, statusCode, message) {
  this.usageStats.totalCalls += 1;
  
  if (success) {
    this.usageStats.successCalls += 1;
    this.lastSuccessAt = new Date();
    this.lastFailure = null;
  } else {
    this.usageStats.failedCalls += 1;
    this.lastFailure = {
      timestamp: new Date(),
      statusCode,
      message
    };
  }
  
  this.usageStats.lastCalledAt = new Date();
  await this.save();
};

module.exports = mongoose.model('Webhook', WebhookSchema);
