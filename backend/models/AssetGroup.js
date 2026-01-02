const mongoose = require('mongoose');

const AssetGroupSchema = new mongoose.Schema({
  // 分组名称
  name: {
    type: String,
    required: [true, '请输入分组名称']
  },
  // 分组描述
  description: {
    type: String,
    default: ''
  },
  // 分组颜色（用于UI展示）
  color: {
    type: String,
    default: '#3498db'
  },
  // 资产数量（用于快速展示）
  assetCount: {
    type: Number,
    default: 0
  },
  // 资产总值（用于快速展示）
  totalValue: {
    type: Number,
    default: 0
  },
  // 租户ID字段 - 实现多租户隔离
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    required: true,
    index: true
  },
  // 创建者ID
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

module.exports = mongoose.model('AssetGroup', AssetGroupSchema);
