const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  // 关联的案例
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: [true, '请输入案例ID']
  },
  // 关联的实训项目
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingProject',
    required: [true, '请输入实训项目ID']
  },
  // 学生ID
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请输入学生ID']
  },
  // 评分状态
  status: {
    type: String,
    enum: ['待评分', '自动评分完成', '人工复核中', '评分完成'],
    default: '待评分'
  },
  // 自动评分结果
  autoScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // 人工评分结果
  manualScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // 最终评分（自动评分和人工评分的综合结果）
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // 评分规则ID
  scoreRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScoreRule'
  },
  // 评分详情
  scoreDetails: {
    type: [{
      // 评分项名称
      itemName: {
        type: String,
        required: [true, '请输入评分项名称']
      },
      // 权重
      weight: {
        type: Number,
        required: [true, '请输入权重'],
        min: 0,
        max: 100
      },
      // 学生得分
      studentScore: {
        type: Number,
        required: [true, '请输入学生得分'],
        min: 0,
        max: 100
      },
      // 自动评分是否通过
      isPass: {
        type: Boolean,
        default: false
      },
      // 评分说明
      description: {
        type: String
      }
    }],
    default: []
  },
  // 学生提交内容
  submission: {
    type: String,
    required: [true, '请输入学生提交内容']
  },
  // 自动评分反馈
  autoFeedback: {
    type: String
  },
  // 人工复核反馈
  manualFeedback: {
    type: String
  },
  // 人工复核人ID
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 提交时间
  submissionTime: {
    type: Date,
    default: Date.now
  },
  // 自动评分时间
  autoScoreTime: {
    type: Date
  },
  // 人工评分时间
  manualScoreTime: {
    type: Date
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
ScoreSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // 如果有人工评分，计算最终评分
  if (this.manualScore !== undefined && this.manualScore !== null) {
    this.finalScore = this.manualScore;
    this.status = '评分完成';
  } else if (this.autoScore !== undefined && this.autoScore !== null) {
    // 只有自动评分，最终评分等于自动评分
    this.finalScore = this.autoScore;
    this.status = '自动评分完成';
  }
  
  next();
});

module.exports = mongoose.model('Score', ScoreSchema);