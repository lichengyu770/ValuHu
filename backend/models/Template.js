const mongoose = require('mongoose');

const TemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '请输入模板标题']
  },
  description: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: [true, '请输入模板内容']
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
TemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', TemplateSchema);