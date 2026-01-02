const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 博客模型
const BlogSchema = new Schema({
  // 博客标题
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  // 博客副标题
  subtitle: {
    type: String,
    trim: true,
    maxlength: 300
  },
  // 博客内容
  content: {
    type: String,
    required: true
  },
  // 博客摘要
  excerpt: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // 博客封面图片URL
  cover_image: {
    type: String,
    trim: true
  },
  // 博客分类：news(新闻), industry(行业动态), policy(政策解读), analysis(数据分析)
  category: {
    type: String,
    enum: ['news', 'industry', 'policy', 'analysis'],
    required: true
  },
  // 博客标签
  tags: {
    type: [String],
    trim: true
  },
  // 博客状态：draft(草稿), published(已发布), archived(已归档)
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // 发布时间
  published_at: {
    type: Date
  },
  // 作者ID
  author_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 阅读量
  views: {
    type: Number,
    default: 0
  },
  // 点赞数
  likes: {
    type: Number,
    default: 0
  },
  // 评论数
  comment_count: {
    type: Number,
    default: 0
  },
  // SEO相关字段
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    keywords: {
      type: [String],
      trim: true
    }
  },
  // 创建时间
  created_at: {
    type: Date,
    default: Date.now
  },
  // 更新时间
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// 更新时间中间件
BlogSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  // 如果状态变为已发布且未设置发布时间，则设置发布时间
  if (this.status === 'published' && !this.published_at) {
    this.published_at = Date.now();
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);