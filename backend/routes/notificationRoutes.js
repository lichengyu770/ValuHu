const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  sendNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotifications
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// 获取通知列表（需要认证）
router.get('/', protect, getNotifications);

// 获取单个通知详情（需要认证）
router.get('/:id', protect, getNotificationById);

// 发送系统通知（需要管理员权限）
router.post('/', protect, authorize('admin'), sendNotification);

// 发送批量通知（需要管理员权限）
router.post('/bulk', protect, authorize('admin'), sendBulkNotifications);

// 标记通知为已读（需要认证）
router.put('/:id/read', protect, markAsRead);

// 标记所有通知为已读（需要认证）
router.put('/read-all', protect, markAllAsRead);

// 删除通知（需要认证）
router.delete('/:id', protect, deleteNotification);

module.exports = router;