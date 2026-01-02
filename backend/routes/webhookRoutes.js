const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * Webhook路由配置
 */

// 获取Webhook列表
router.get('/', webhookController.getWebhooks);

// 获取单个Webhook
router.get('/:id', webhookController.getWebhook);

// 创建Webhook
router.post('/', webhookController.createWebhook);

// 更新Webhook
router.put('/:id', webhookController.updateWebhook);

// 删除Webhook
router.delete('/:id', webhookController.deleteWebhook);

// 切换Webhook状态
router.patch('/:id/toggle-status', webhookController.toggleWebhookStatus);

// 测试Webhook连接
router.post('/:id/test', webhookController.testWebhook);

module.exports = router;