const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  // 设备基本信息
  deviceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  deviceModel: {
    type: String,
    trim: true,
    maxlength: 255
  },
  deviceType: {
    type: String,
    required: true,
    enum: ['电梯', '空调', '消防设备', '照明设备', '监控设备', '其他'],
    default: '其他'
  },
  installationLocation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  maintenanceCycle: {
    type: Number,
    default: 30 // 维护周期，单位：天
  },
  lastMaintenanceDate: {
    type: Date,
    default: Date.now
  },
  nextMaintenanceDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  },
  // 设备状态信息
  status: {
    type: String,
    enum: ['正常', '维护中', '故障', '停用'],
    default: '正常'
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: 255
  },
  warrantyPeriod: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
  },
  // 关联信息
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  // 维护记录
  maintenanceRecords: [{
    maintenanceDate: {
      type: Date,
      default: Date.now
    },
    maintenancePerson: {
      type: String,
      trim: true,
      maxlength: 100
    },
    maintenanceContent: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    maintenanceResult: {
      type: String,
      enum: ['正常', '故障修复', '待观察', '更换设备'],
      default: '正常'
    },
    maintenanceCost: {
      type: Number,
      default: 0
    }
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

// 自动更新updatedAt字段
DeviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 虚拟字段：维护记录数量
DeviceSchema.virtual('maintenanceCount').get(function() {
  return this.maintenanceRecords.length;
});

// 虚拟字段：设备是否需要维护
DeviceSchema.virtual('needMaintenance').get(function() {
  return this.nextMaintenanceDate <= new Date();
});

const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;
