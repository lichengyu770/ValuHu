const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入评价人姓名']
  },
  title: {
    type: String,
    required: [true, '请输入评价人职位']
  },
  content: {
    type: String,
    required: [true, '请输入评价内容']
  },
  avatar: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);