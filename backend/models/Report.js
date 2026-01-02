const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入报告标题']
  },
  content: {
    type: String,
    required: [true, '请输入报告内容']
  },
  html_content: {
    type: String,
    default: ''
  },
  pdf_url: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  valuation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Valuation',
    default: null
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },
  enterprise_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enterprise',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'generated', 'failed'],
    default: 'pending'
  },
  format: {
    type: String,
    enum: ['pdf', 'html', 'word', 'excel'],
    default: 'pdf'
  },
  template_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate',
    default: null
  },
  metadata: {
    type: Object,
    default: {}
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
ReportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', ReportSchema);