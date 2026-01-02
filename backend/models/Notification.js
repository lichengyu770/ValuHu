const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 通知模型
const NotificationSchema = new Schema({
  // 通知标题
  title: {
    type: String,
    required: true,
    trim: true
  },
  // 通知内容
  content: {
    type: String,
    required: true
  },
  // 通知类型：system(系统通知), marketing(营销通知), warning(警告通知)
  type: {
    type: String,
    enum: ['system', 'marketing', 'warning'],
    default: 'system'
  },
  // 目标用户ID，如果为空则发送给所有用户
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 目标用户角色，如果user_id为空，则按角色发送
  target_roles: {
    type: [String],
    enum: ['admin', 'enterprise', 'government', 'academic', 'developer']
  },
  // 是否已读
  is_read: {
    type: Boolean,
    default: false
  },
  // 阅读时间
  read_at: {
    type: Date
  },
  // 过期时间
  expires_at: {
    type: Date
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
NotificationSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);