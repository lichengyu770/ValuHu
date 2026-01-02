const mongoose = require('mongoose');

// 套餐模型
const PlanSchema = new mongoose.Schema({
  // 套餐基本信息
  name: {
    type: String,
    required: [true, '请输入套餐名称'],
    unique: true
  },
  description: {
    type: String,
    required: [true, '请输入套餐描述']
  },
  // 套餐类型
  type: {
    type: String,
    enum: ['free', 'professional', 'enterprise'],
    required: [true, '请选择套餐类型']
  },
  // 价格信息
  price: {
    type: Number,
    required: [true, '请输入套餐价格']
  },
  currency: {
    type: String,
    default: 'CNY',
    enum: ['CNY', 'USD', 'EUR']
  },
  billingCycle: {
    type: String,
    default: 'monthly',
    enum: ['monthly', 'quarterly', 'yearly']
  },
  // 套餐限制
  limits: {
    apiCalls: {
      type: Number,
      default: 0 // 0表示无限制
    },
    dataStorage: {
      type: Number,
      default: 0 // 单位：GB
    },
    users: {
      type: Number,
      default: 0
    },
    customDomains: {
      type: Number,
      default: 0
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    advancedAnalytics: {
      type: Boolean,
      default: false
    },
    apiVersion: {
      type: String,
      default: 'v1',
      enum: ['v1', 'v2', 'v3']
    }
  },
  // 套餐状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'deprecated']
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 使用量模型
const UsageSchema = new mongoose.Schema({
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请指定用户ID']
  },
  // 使用量类型
  usageType: {
    type: String,
    required: [true, '请指定使用量类型'],
    enum: ['api_call', 'data_storage', 'user_management', 'report_generation', 'batch_processing']
  },
  // 使用量数据
  quantity: {
    type: Number,
    required: [true, '请输入使用量数量']
  },
  // 时间信息
  timestamp: {
    type: Date,
    default: Date.now
  },
  // 时间段
  period: {
    type: String,
    required: [true, '请指定时间段'],
    enum: ['hourly', 'daily', 'monthly', 'yearly']
  },
  // 关联的API或功能
  resource: {
    type: String
  },
  // 附加信息
  metadata: {
    type: Object
  }
});

// 发票模型
const InvoiceSchema = new mongoose.Schema({
  // 基本信息
  invoiceNumber: {
    type: String,
    required: [true, '请输入发票编号'],
    unique: true
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请指定用户ID']
  },
  // 套餐信息
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, '请指定套餐ID']
  },
  // 金额信息
  amount: {
    type: Number,
    required: [true, '请输入发票金额']
  },
  currency: {
    type: String,
    default: 'CNY',
    enum: ['CNY', 'USD', 'EUR']
  },
  // 状态信息
  status: {
    type: String,
    default: 'unpaid',
    enum: ['unpaid', 'paid', 'cancelled', 'refunded', 'failed']
  },
  // 时间信息
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, '请输入付款截止日期']
  },
  paidDate: {
    type: Date
  },
  // 支付信息
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat', 'bank_transfer', 'credit_card']
  },
  transactionId: {
    type: String
  },
  // 发票详情
  items: [{
    description: {
      type: String,
      required: [true, '请输入项目描述']
    },
    quantity: {
      type: Number,
      required: [true, '请输入数量']
    },
    unitPrice: {
      type: Number,
      required: [true, '请输入单价']
    },
    total: {
      type: Number,
      required: [true, '请输入总价']
    }
  }],
  // 附件信息
  attachments: [{
    name: {
      type: String
    },
    url: {
      type: String
    },
    type: {
      type: String
    }
  }],
  // 备注信息
  notes: {
    type: String
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 企业订阅模型
const SubscriptionSchema = new mongoose.Schema({
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID'],
    unique: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: [true, '请指定套餐ID']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请指定用户ID']
  },
  // 订阅状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'trialing', 'cancelled', 'paused', 'expired']
  },
  // 时间信息
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, '请输入订阅结束日期']
  },
  // 自动续费
  autoRenew: {
    type: Boolean,
    default: true
  },
  // 当前周期
  currentPeriod: {
    start: {
      type: Date,
      default: Date.now
    },
    end: {
      type: Date
    }
  },
  // 计费周期
  billingCycle: {
    type: String,
    default: 'monthly',
    enum: ['monthly', 'quarterly', 'yearly']
  },
  // 最后发票
  lastInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  // 创建和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 导出模型
const Plan = mongoose.model('Plan', PlanSchema);
const Usage = mongoose.model('Usage', UsageSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = { Plan, Usage, Invoice, Subscription };
