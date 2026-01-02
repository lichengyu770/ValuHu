const mongoose = require('mongoose');

// 监控指标模型
const MetricSchema = new mongoose.Schema({
  // 指标基本信息
  name: {
    type: String,
    required: [true, '请输入指标名称'],
    unique: true
  },
  description: {
    type: String,
    required: [true, '请输入指标描述']
  },
  // 指标类型
  type: {
    type: String,
    required: [true, '请选择指标类型'],
    enum: ['counter', 'gauge', 'histogram', 'summary']
  },
  // 指标单位
  unit: {
    type: String
  },
  // 标签
  labels: [{
    name: {
      type: String,
      required: [true, '请输入标签名称']
    },
    description: {
      type: String
    }
  }],
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
  },
  // 指标状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive']
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

// 监控数据点模型
const MetricDataSchema = new mongoose.Schema({
  // 关联指标
  metricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metric',
    required: [true, '请指定指标ID']
  },
  // 指标名称（冗余，便于查询）
  metricName: {
    type: String,
    required: [true, '请输入指标名称']
  },
  // 指标值
  value: {
    type: Number,
    required: [true, '请输入指标值']
  },
  // 标签值
  labels: {
    type: Object
  },
  // 时间戳
  timestamp: {
    type: Date,
    default: Date.now
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise'
  }
});

// 告警规则模型
const AlertRuleSchema = new mongoose.Schema({
  // 规则基本信息
  name: {
    type: String,
    required: [true, '请输入规则名称'],
    unique: true
  },
  description: {
    type: String,
    required: [true, '请输入规则描述']
  },
  // 关联指标
  metricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metric',
    required: [true, '请指定指标ID']
  },
  // 告警条件
  condition: {
    type: String,
    required: [true, '请输入告警条件'],
    enum: ['>', '>=', '<', '<=', '==', '!=']
  },
  // 阈值
  threshold: {
    type: Number,
    required: [true, '请输入告警阈值']
  },
  // 评估周期
  evaluationPeriod: {
    type: Number,
    default: 60, // 单位：秒
    required: [true, '请输入评估周期']
  },
  // 触发次数
  for: {
    type: Number,
    default: 1 // 连续触发次数
  },
  // 告警级别
  severity: {
    type: String,
    default: 'warning',
    enum: ['info', 'warning', 'error', 'critical']
  },
  // 告警渠道
  notificationChannels: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    slack: {
      type: Boolean,
      default: false
    },
    webhook: {
      type: Boolean,
      default: false
    }
  },
  // 通知接收人
  recipients: [{
    type: {
      type: String,
      enum: ['user', 'email', 'phone']
    },
    value: {
      type: String
    }
  }],
  // 规则状态
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive', 'paused']
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
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

// 告警记录模型
const AlertSchema = new mongoose.Schema({
  // 告警基本信息
  alertId: {
    type: String,
    required: [true, '请输入告警ID'],
    unique: true
  },
  // 关联告警规则
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AlertRule',
    required: [true, '请指定告警规则ID']
  },
  ruleName: {
    type: String,
    required: [true, '请输入规则名称']
  },
  // 关联指标
  metricId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metric',
    required: [true, '请指定指标ID']
  },
  metricName: {
    type: String,
    required: [true, '请输入指标名称']
  },
  // 告警级别
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: [true, '请选择告警级别']
  },
  // 告警状态
  status: {
    type: String,
    default: 'firing',
    enum: ['firing', 'resolved']
  },
  // 告警条件
  condition: {
    type: String
  },
  // 阈值
  threshold: {
    type: Number
  },
  // 实际值
  actualValue: {
    type: Number,
    required: [true, '请输入实际值']
  },
  // 开始时间
  startTime: {
    type: Date,
    default: Date.now
  },
  // 结束时间
  endTime: {
    type: Date
  },
  // 持续时间
  duration: {
    type: Number // 单位：秒
  },
  // 标签
  labels: {
    type: Object
  },
  // 注释
  annotations: {
    type: Object
  },
  // 通知状态
  notificationStatus: {
    email: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    },
    sms: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    },
    slack: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    },
    webhook: {
      type: String,
      enum: ['sent', 'failed', 'pending']
    }
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
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

// 成本监控模型
const CostSchema = new mongoose.Schema({
  // 成本基本信息
  name: {
    type: String,
    required: [true, '请输入成本名称']
  },
  description: {
    type: String,
    required: [true, '请输入成本描述']
  },
  // 成本类型
  type: {
    type: String,
    required: [true, '请选择成本类型'],
    enum: ['cloud_service', 'data_storage', 'api_calls', 'other']
  },
  // 成本金额
  amount: {
    type: Number,
    required: [true, '请输入成本金额']
  },
  // 货币类型
  currency: {
    type: String,
    default: 'CNY',
    enum: ['CNY', 'USD', 'EUR']
  },
  // 时间信息
  startTime: {
    type: Date,
    required: [true, '请输入开始时间']
  },
  endTime: {
    type: Date,
    required: [true, '请输入结束时间']
  },
  // 资源信息
  resource: {
    type: Object
  },
  // 关联信息
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: [true, '请指定租户ID']
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
const Metric = mongoose.model('Metric', MetricSchema);
const MetricData = mongoose.model('MetricData', MetricDataSchema);
const AlertRule = mongoose.model('AlertRule', AlertRuleSchema);
const Alert = mongoose.model('Alert', AlertSchema);
const Cost = mongoose.model('Cost', CostSchema);

module.exports = { Metric, MetricData, AlertRule, Alert, Cost };
