const mongoose = require('mongoose');

/**
 * 行业标准模型
 */
const IndustryStandardSchema = new mongoose.Schema({
  // 标准编号
  standardNumber: {
    type: String,
    required: [true, '请输入标准编号'],
    trim: true,
    unique: true,
    maxlength: [50, '标准编号不能超过50个字符']
  },
  // 标准名称
  name: {
    type: String,
    required: [true, '请输入标准名称'],
    trim: true,
    maxlength: [200, '标准名称不能超过200个字符']
  },
  // 标准类型
  type: {
    type: String,
    enum: [
      'valuation_method', // 估价方法标准
      'data_format', // 数据格式标准
      'quality_standard', // 质量标准
      'security_standard', // 安全标准
      'process_standard' // 流程标准
    ],
    required: [true, '请选择标准类型']
  },
  // 标准版本
  version: {
    type: String,
    required: [true, '请输入标准版本'],
    trim: true,
    default: '1.0'
  },
  // 发布机构
  issuingBody: {
    type: String,
    required: [true, '请输入发布机构'],
    trim: true,
    maxlength: [100, '发布机构不能超过100个字符']
  },
  // 发布日期
  issueDate: {
    type: Date,
    required: [true, '请输入发布日期']
  },
  // 实施日期
  implementationDate: {
    type: Date,
    required: [true, '请输入实施日期']
  },
  // 标准状态
  status: {
    type: String,
    enum: ['draft', 'reviewing', 'approved', 'published', 'revised', 'deprecated'],
    default: 'draft'
  },
  // 标准内容
  content: {
    type: String,
    required: [true, '请输入标准内容']
  },
  // 标准文件URL
  fileUrl: {
    type: String,
    required: [true, '请上传标准文件']
  },
  // 适用范围
  scope: {
    type: String,
    trim: true,
    maxlength: [500, '适用范围不能超过500个字符']
  },
  // 术语定义
  terminology: [{
    term: {
      type: String,
      required: [true, '请输入术语']
    },
    definition: {
      type: String,
      required: [true, '请输入术语定义']
    }
  }],
  // 评分权重
  scoringWeights: {
    type: Object,
    default: {}
  },
  // 相关标准
  relatedStandards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IndustryStandard'
  }],
  // 审核记录
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
  // 使用统计
  usageStats: {
    totalDownloads: {
      type: Number,
      default: 0
    },
    lastDownloadedAt: {
      type: Date,
      default: null
    },
    adoptionByEnterprises: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  // 创建者ID
  creatorId: {
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
IndustryStandardSchema.methods.updateUsage = async function(enterpriseId) {
  this.usageStats.totalDownloads += 1;
  this.usageStats.lastDownloadedAt = new Date();
  
  // 更新按企业采用统计
  const enterpriseKey = enterpriseId.toString();
  if (this.usageStats.adoptionByEnterprises.has(enterpriseKey)) {
    this.usageStats.adoptionByEnterprises.set(enterpriseKey, this.usageStats.adoptionByEnterprises.get(enterpriseKey) + 1);
  } else {
    this.usageStats.adoptionByEnterprises.set(enterpriseKey, 1);
  }
  
  await this.save();
};

module.exports = mongoose.model('IndustryStandard', IndustryStandardSchema);