const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入案例标题']
  },
  content: {
    type: String,
    required: [true, '请输入案例内容']
  },
  // 学术工坊2.0新增字段
  caseType: {
    type: String,
    enum: ['住宅', '写字楼', '商铺', '别墅', '厂房', '公寓'],
    required: [true, '请选择案例类型']
  },
  teachingGuide: {
    type: String,
    required: [true, '请输入教学指导']
  },
  difficultyLevel: {
    type: String,
    enum: ['基础', '进阶', '高级'],
    default: '基础'
  },
  targetAudience: {
    type: String,
    enum: ['本科生', '研究生', '职业院校', '企业培训'],
    default: '本科生'
  },
  estimatedTime: {
    type: Number,
    required: [true, '请输入预计完成时间（分钟）']
  },
  relatedKnowledge: {
    type: [String],
    default: []
  },
  assessmentCriteria: {
    type: String,
    required: [true, '请输入评估标准']
  },
  sampleAnswer: {
    type: String
  },
  // 实训相关字段
  requiredTools: {
    type: [String],
    default: []
  },
  datasets: {
    type: [String], // 数据集文件路径
    default: []
  },
  // 统计信息
  usageCount: {
    type: Number,
    default: 0
  },
  avgScore: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  // 基础字段
  images: {
    type: [String],
    default: []
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

// 更新updatedAt字段的中间件
CaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', CaseSchema);