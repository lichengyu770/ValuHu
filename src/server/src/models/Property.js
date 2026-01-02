const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  // 物业基本信息
  propertyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  propertyAddress: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  propertyType: {
    type: String,
    required: true,
    enum: ['住宅', '商业', '工业', '办公', '其他'],
    default: '住宅'
  },
  totalArea: {
    type: Number,
    required: true,
    min: 0
  },
  floorAreaRatio: {
    type: Number,
    default: 0
  },
  greeningRate: {
    type: Number,
    default: 0
  },
  completionYear: {
    type: Number,
    default: new Date().getFullYear()
  },
  managementCompany: {
    type: String,
    trim: true,
    maxlength: 255
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: 100
  },
  contactPhone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  // 地理位置信息
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  // 状态信息
  status: {
    type: String,
    enum: ['正常', '维护中', '停用'],
    default: '正常'
  },
  // 关联信息
  devices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  }],
  workorders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workorder'
  }],
  tenants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  }],
  // 时间信息
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建地理位置索引
PropertySchema.index({ location: '2dsphere' });

// 自动更新updatedAt字段
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 虚拟字段：物业设备数量
PropertySchema.virtual('deviceCount').get(function() {
  return this.devices.length;
});

// 虚拟字段：物业工单数量
PropertySchema.virtual('workorderCount').get(function() {
  return this.workorders.length;
});

// 虚拟字段：物业租户数量
PropertySchema.virtual('tenantCount').get(function() {
  return this.tenants.length;
});

const Property = mongoose.model('Property', PropertySchema);

module.exports = Property;
