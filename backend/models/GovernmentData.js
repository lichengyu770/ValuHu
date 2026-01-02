const mongoose = require('mongoose');

/**
 * 政府数据模型
 */
const GovernmentDataSchema = new mongoose.Schema({
  // 数据类型
  dataType: {
    type: String,
    enum: [
      'benchmark_price', // 基准地价
      'transaction_data', // 交易数据
      'policy_data', // 政策数据
      'market_statistics', // 市场统计数据
      'property_registration' // 房产登记数据
    ],
    required: [true, '请选择数据类型']
  },
  // 数据名称
  name: {
    type: String,
    required: [true, '请输入数据名称'],
    trim: true,
    maxlength: [200, '数据名称不能超过200个字符']
  },
  // 数据描述
  description: {
    type: String,
    trim: true,
    maxlength: [500, '数据描述不能超过500个字符']
  },
  // 数据来源（政府部门）
  source: {
    type: String,
    required: [true, '请输入数据来源'],
    trim: true,
    maxlength: [100, '数据来源不能超过100个字符']
  },
  // 数据版本
  version: {
    type: String,
    required: [true, '请输入数据版本'],
    trim: true,
    default: '1.0'
  },
  // 数据文件URL
  fileUrl: {
    type: String,
    required: [true, '请上传数据文件']
  },
  // 数据状态
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewing', 'approved', 'rejected', 'published'],
    default: 'draft'
  },
  // 数据有效期
  validFrom: {
    type: Date,
    required: [true, '请输入数据生效日期']
  },
  validTo: {
    type: Date,
    required: [true, '请输入数据失效日期']
  },
  // 数据访问权限
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'private'],
    default: 'restricted'
  },
  // 访问授权列表
  authorizedParties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise'
  }],
  // 数据哈希值（用于验证完整性）
  hash: {
    type: String,
    trim: true
  },
  // 脱敏规则
  desensitizationRules: {
    type: Object,
    default: {}
  },
  // 数据质量评分
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // 数据审核记录
  reviewHistory: [{
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewerName: {
      type: String,
      trim: true
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['approved', 'rejected', 'pending']
    },
    comments: {
      type: String,
      trim: true
    }
  }],
  // 数据使用统计
  usageStats: {
    totalAccesses: {
      type: Number,
      default: 0
    },
    lastAccessedAt: {
      type: Date,
      default: null
    },
    accessByParty: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  // 数据提供者ID
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// 更新使用统计
GovernmentDataSchema.methods.updateUsage = async function(partyId) {
  this.usageStats.totalAccesses += 1;
  this.usageStats.lastAccessedAt = new Date();
  
  // 更新按机构访问统计
  const partyKey = partyId.toString();
  if (this.usageStats.accessByParty.has(partyKey)) {
    this.usageStats.accessByParty.set(partyKey, this.usageStats.accessByParty.get(partyKey) + 1);
  } else {
    this.usageStats.accessByParty.set(partyKey, 1);
  }
  
  await this.save();
};

module.exports = mongoose.model('GovernmentData', GovernmentDataSchema);