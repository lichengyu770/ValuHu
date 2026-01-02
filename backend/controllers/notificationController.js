const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * 通知控制器
 * 提供系统通知的发送、管理和查询功能
 */

/**
 * 获取通知列表
 */
const getNotifications = async (req, res) => {
  try {
    const { type, is_read, limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;
    
    // 构建查询条件
    const query = {
      $or: [
        { user_id: userId },
        { user_id: null, target_roles: { $in: [req.user.role] } }
      ]
    };
    
    if (type) query.type = type;
    if (is_read !== undefined) query.is_read = is_read === 'true';
    
    // 查询通知列表
    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    // 获取总数
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        notifications,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 获取单个通知详情
 */
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查询通知
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    
    // 检查通知权限
    if (notification.user_id && notification.user_id.toString() !== userId) {
      return res.status(403).json({ success: false, message: '无权访问该通知' });
    }
    
    // 如果通知未读，则标记为已读
    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await notification.save();
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('获取通知详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 发送系统通知
 */
const sendNotification = async (req, res) => {
  try {
    const { title, content, type = 'system', user_id, target_roles, expires_at } = req.body;
    
    // 构建通知数据
    const notificationData = {
      title,
      content,
      type,
      expires_at: expires_at ? new Date(expires_at) : undefined
    };
    
    // 如果指定了用户ID，则发送给特定用户
    if (user_id) {
      notificationData.user_id = user_id;
      const notification = await Notification.create(notificationData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: '通知发送成功'
      });
    } 
    // 如果指定了目标角色，则发送给所有对应角色的用户
    else if (target_roles && target_roles.length > 0) {
      notificationData.target_roles = target_roles;
      const notification = await Notification.create(notificationData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: '通知发送成功'
      });
    } 
    // 否则发送给所有用户
    else {
      // 这里可以实现发送给所有用户的逻辑，例如创建一个全局通知
      notificationData.target_roles = []; // 空数组表示所有用户
      const notification = await Notification.create(notificationData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: '通知发送成功'
      });
    }
  } catch (error) {
    console.error('发送通知错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 标记通知为已读
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查询通知
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    
    // 检查通知权限
    if (notification.user_id && notification.user_id.toString() !== userId) {
      return res.status(403).json({ success: false, message: '无权访问该通知' });
    }
    
    // 标记为已读
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
    
    res.status(200).json({
      success: true,
      data: notification,
      message: '通知已标记为已读'
    });
  } catch (error) {
    console.error('标记通知为已读错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 标记所有通知为已读
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 标记所有通知为已读
    await Notification.updateMany(
      {
        $or: [
          { user_id: userId, is_read: false },
          { user_id: null, target_roles: { $in: [req.user.role] }, is_read: false }
        ]
      },
      { is_read: true, read_at: new Date() }
    );
    
    res.status(200).json({
      success: true,
      message: '所有通知已标记为已读'
    });
  } catch (error) {
    console.error('标记所有通知为已读错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 删除通知
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // 查询通知
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: '通知不存在' });
    }
    
    // 检查通知权限（只有管理员可以删除系统通知）
    if (req.user.role !== 'admin' && notification.user_id && notification.user_id.toString() !== userId) {
      return res.status(403).json({ success: false, message: '无权删除该通知' });
    }
    
    // 删除通知
    await Notification.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: '通知已删除'
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

/**
 * 发送批量通知
 */
const sendBulkNotifications = async (req, res) => {
  try {
    const { title, content, type = 'system', user_ids, target_roles } = req.body;
    
    // 验证参数
    if (!user_ids && (!target_roles || target_roles.length === 0)) {
      return res.status(400).json({ success: false, message: '必须指定用户ID或目标角色' });
    }
    
    const notifications = [];
    
    // 如果指定了用户ID列表，则发送给多个用户
    if (user_ids && user_ids.length > 0) {
      for (const userId of user_ids) {
        const notification = await Notification.create({
          title,
          content,
          type,
          user_id: userId
        });
        notifications.push(notification);
      }
    } 
    // 如果指定了目标角色，则发送给所有对应角色的用户
    else if (target_roles && target_roles.length > 0) {
      const notification = await Notification.create({
        title,
        content,
        type,
        target_roles
      });
      notifications.push(notification);
    }
    
    res.status(201).json({
      success: true,
      data: notifications,
      message: '批量通知发送成功'
    });
  } catch (error) {
    console.error('发送批量通知错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  sendNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotifications
};