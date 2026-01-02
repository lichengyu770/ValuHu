const Webhook = require('../models/Webhook');

/**
 * Webhook控制器，处理Webhook相关的CRUD操作
 */
const webhookController = {
  /**
   * 获取Webhook列表
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getWebhooks(req, res) {
    try {
      const { userId, enterpriseId } = req.query;
      
      let query = {};
      if (userId) {
        query.userId = userId;
      }
      if (enterpriseId) {
        query.enterpriseId = enterpriseId;
      }
      
      const webhooks = await Webhook.find(query).populate('userId', 'name email').populate('enterpriseId', 'name');
      res.status(200).json({
        success: true,
        count: webhooks.length,
        data: webhooks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取Webhook列表失败'
      });
    }
  },

  /**
   * 获取单个Webhook
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async getWebhook(req, res) {
    try {
      const webhook = await Webhook.findById(req.params.id).populate('userId', 'name email').populate('enterpriseId', 'name');
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook不存在'
        });
      }
      
      res.status(200).json({
        success: true,
        data: webhook
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '获取Webhook失败'
      });
    }
  },

  /**
   * 创建Webhook
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async createWebhook(req, res) {
    try {
      const webhook = await Webhook.create(req.body);
      
      res.status(201).json({
        success: true,
        data: webhook
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || '创建Webhook失败'
      });
    }
  },

  /**
   * 更新Webhook
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async updateWebhook(req, res) {
    try {
      const webhook = await Webhook.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook不存在'
        });
      }
      
      res.status(200).json({
        success: true,
        data: webhook
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || '更新Webhook失败'
      });
    }
  },

  /**
   * 删除Webhook
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async deleteWebhook(req, res) {
    try {
      const webhook = await Webhook.findByIdAndDelete(req.params.id);
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook不存在'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Webhook删除成功'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '删除Webhook失败'
      });
    }
  },

  /**
   * 切换Webhook状态
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async toggleWebhookStatus(req, res) {
    try {
      const webhook = await Webhook.findById(req.params.id);
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook不存在'
        });
      }
      
      // 切换状态
      webhook.status = webhook.status === 'active' ? 'inactive' : 'active';
      await webhook.save();
      
      res.status(200).json({
        success: true,
        data: webhook
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '切换Webhook状态失败'
      });
    }
  },

  /**
   * 测试Webhook连接
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async testWebhook(req, res) {
    try {
      const webhook = await Webhook.findById(req.params.id);
      
      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook不存在'
        });
      }
      
      // 导入Webhook服务
      const webhookService = require('../services/webhookService');
      
      // 发送测试事件
      const result = await webhookService.sendWebhook('test.event', {
        message: '这是一个测试Webhook事件',
        test_id: Date.now()
      });
      
      res.status(200).json({
        success: true,
        message: 'Webhook测试事件已发送',
        result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message || '测试Webhook失败'
      });
    }
  }
};

module.exports = webhookController;