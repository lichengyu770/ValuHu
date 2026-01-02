const mongoose = require('mongoose');

const WorkorderSchema = new mongoose.Schema({
  // 工单基本信息
  workorderTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  workorderType: {
    type: String,
    required: true,
    enum: ['维修', '保养', '安装', '巡检', '其他'],
    default: '维修'
  },
  workorderContent: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  // 工单状态信息
  status: {
    type: String,
    enum: ['待处理', '处理中', '已完成', '已关闭', '已取消'],
    default: '待处理'
  },
  priority: {
    type: String,
    enum: ['低', '中', '高', '紧急'],
    default: '中'
  },
  // 时间信息
  createTime: {
    type: Date,
    default: Date.now
  },
  assignTime: {
    type: Date
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  // 关联信息
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device'
  },
  creator: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  assignee: {
    type: String,
    trim: true,
    maxlength: 100
  },
  // 处理结果
  processingResult: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  processingPerson: {
    type: String,
    trim: true,
    maxlength: 100
  },
  processingCost: {
    type: Number,
    default: 0
  },
  // 附件信息
  attachments: [{
    fileName: {
      type: String,
      trim: true,
      maxlength: 255
    },
    filePath: {
      type: String,
      trim: true,
      maxlength: 500
    },
    fileType: {
      type: String,
      trim: true,
      maxlength: 100
    },
    uploadTime: {
      type: Date,
      default: Date.now
    }
  }],
  // 备注信息
  remarks: {
    type: String,
    trim: true,
    maxlength: 1000
  },
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
WorkorderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 虚拟字段：工单处理时长
WorkorderSchema.virtual('processingDuration').get(function() {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)); // 处理时长，单位：分钟
  }
  return 0;
});

const Workorder = mongoose.model('Workorder', WorkorderSchema);

module.exports = Workorder;
