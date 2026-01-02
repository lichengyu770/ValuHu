const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入团队名称'],
    trim: true,
    maxlength: [100, '团队名称不能超过100个字符']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, '团队描述不能超过500个字符']
  },
  // 关联的企业
  enterpriseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: true
  },
  // 团队创建者
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 团队管理员
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 团队成员列表
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    // 成员在团队中的权限
    permissions: [{
      type: String,
      enum: [
        'view_properties',
        'create_properties',
        'edit_properties',
        'delete_properties',
        'view_valuations',
        'create_valuations',
        'edit_valuations',
        'delete_valuations',
        'view_reports',
        'create_reports',
        'edit_reports',
        'delete_reports',
        'manage_team',
        'manage_api_keys'
      ]
    }]
  }],
  // 团队状态
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
    required: true
  },
  // 团队默认权限
  defaultPermissions: [{
    type: String,
    enum: [
      'view_properties',
      'create_properties',
      'edit_properties',
      'delete_properties',
      'view_valuations',
      'create_valuations',
      'edit_valuations',
      'delete_valuations',
      'view_reports',
      'create_reports',
      'edit_reports',
      'delete_reports',
      'manage_team',
      'manage_api_keys'
    ],
    default: [
      'view_properties',
      'view_valuations',
      'view_reports'
    ]
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

module.exports = mongoose.model('Team', TeamSchema);
