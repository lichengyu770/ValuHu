const mongoose = require('mongoose');

const TrainingProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入实训项目标题']
  },
  description: {
    type: String,
    required: [true, '请输入实训项目描述']
  },
  // 关联案例
  cases: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, '请选择至少一个关联案例']
  }],
  // 实训项目状态
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  },
  // 项目创建者
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请输入创建者ID']
  },
  // 参与学生
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // 开始和结束时间
  startTime: {
    type: Date,
    required: [true, '请输入实训开始时间']
  },
  endTime: {
    type: Date,
    required: [true, '请输入实训结束时间']
  },
  // 项目评估方式
  assessmentMethod: {
    type: String,
    enum: ['自动评分', '人工评分', '混合评分'],
    default: '混合评分'
  },
  // 项目进度
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // 实训报告模板
  reportTemplate: {
    type: String
  },
  // 项目统计信息
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    completedParticipants: {
      type: Number,
      default: 0
    },
    avgScore: {
      type: Number,
      default: 0
    },
    avgCompletionTime: {
      type: Number,
      default: 0
    }
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

// 更新updatedAt字段的中间件
TrainingProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('TrainingProject', TrainingProjectSchema);