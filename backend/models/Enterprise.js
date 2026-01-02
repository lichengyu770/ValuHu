const mongoose = require('mongoose');

const EnterpriseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入企业名称'],
    unique: true,
    trim: true,
    maxlength: [200, '企业名称不能超过200个字符']
  },
  legalName: {
    type: String,
    required: [true, '请输入法人名称'],
    trim: true,
    maxlength: [100, '法人名称不能超过100个字符']
  },
  registrationNumber: {
    type: String,
    required: [true, '请输入营业执照号码'],
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: [true, '请输入所属行业'],
    trim: true
  },
  address: {
    type: String,
    required: [true, '请输入企业地址'],
    trim: true,
    maxlength: [500, '企业地址不能超过500个字符']
  },
  contactPhone: {
    type: String,
    required: [true, '请输入联系电话'],
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, '请输入联系邮箱'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '请输入有效的邮箱地址']
  },
  // 企业状态
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending',
    required: true
  },
  // 企业创建者
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 企业管理员列表
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // 企业所属团队
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  // API Key 信息
  apiKeys: [{
    key: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enterprise', EnterpriseSchema);
