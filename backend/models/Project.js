const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  // 实训项目基本信息
  name: {
    type: String,
    required: [true, '请输入项目名称']
  },
  description: {
    type: String,
    required: [true, '请输入项目描述']
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, '请关联案例']
  },
  // 项目配置
  startDate: {
    type: Date,
    required: [true, '请输入开始日期']
  },
  endDate: {
    type: Date,
    required: [true, '请输入结束日期']
  },
  isGroupProject: {
    type: Boolean,
    default: true
  },
  maxGroupSize: {
    type: Number,
    default: 5
  },
  // 项目状态
  status: {
    type: String,
    enum: ['未开始', '进行中', '已结束'],
    default: '未开始'
  },
  // 参与信息
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请指定负责教师']
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groups: [{
    name: {
      type: String,
      required: [true, '请输入小组名称']
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '请指定组长']
    },
    memberIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    progress: {
      type: Number,
      default: 0
    },
    score: {
      type: Number
    },
    submission: {
      type: String
    },
    submissionDate: {
      type: Date
    }
  }],
  // 评分标准
  gradingCriteria: [{
    name: {
      type: String,
      required: [true, '请输入评分项名称']
    },
    weight: {
      type: Number,
      required: [true, '请输入权重'],
      min: 0,
      max: 100
    },
    description: {
      type: String
    }
  }],
  // 项目资源
  resources: [{
    name: {
      type: String,
      required: [true, '请输入资源名称']
    },
    type: {
      type: String,
      enum: ['文档', '数据集', '代码', '视频'],
      required: [true, '请选择资源类型']
    },
    url: {
      type: String,
      required: [true, '请输入资源URL']
    }
  }],
  // 里程碑
  milestones: [{
    name: {
      type: String,
      required: [true, '请输入里程碑名称']
    },
    description: {
      type: String
    },
    deadline: {
      type: Date,
      required: [true, '请输入截止日期']
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // 提交历史
  submissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId
    },
    content: {
      type: String,
      required: [true, '请输入提交内容']
    },
    files: [{
      name: {
        type: String,
        required: [true, '请输入文件名']
      },
      url: {
        type: String,
        required: [true, '请输入文件URL']
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number
    },
    feedback: {
      type: String
    },
    gradedAt: {
      type: Date
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // 自动评分结果
  autoGradingResults: [{
    submissionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    score: {
      type: Number
    },
    evaluation: {
      type: String
    },
    metrics: {
      type: Object
    },
    gradedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // 基础字段
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
ProjectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
