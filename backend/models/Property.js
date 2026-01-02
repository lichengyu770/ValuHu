const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入房产名称']
  },
  price: {
    type: Number,
    required: [true, '请输入房产价格']
  },
  type: {
    type: String,
    required: [true, '请输入房产类型'],
    enum: ['住宅', '别墅', '公寓', '商铺', '写字楼', '其他']
  },
  lng: {
    type: Number,
    required: [true, '请输入经度']
  },
  lat: {
    type: Number,
    required: [true, '请输入纬度']
  },
  address: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  // 资产分组字段
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetGroup',
    index: true
  },
  // 标签字段
  tags: {
    type: [String],
    default: [],
    index: true
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', PropertySchema);