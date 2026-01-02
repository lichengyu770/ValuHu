const axios = require('axios');
const crypto = require('crypto');
const Webhook = require('../models/Webhook');

/**
 * Webhook服务，用于发送Webhook事件通知
 */
class WebhookService {
  /**
   * 构造函数
   */
  constructor() {
    this.retryQueue = [];
    this.isProcessingRetryQueue = false;
  }

  /**
   * 发送Webhook事件
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   */
  async sendWebhook(eventType, eventData) {
    try {
      // 查找所有匹配的Webhook配置
      const webhooks = await Webhook.find({
        status: 'active',
        eventType: { $in: [eventType] }
      });

      if (webhooks.length === 0) {
        return { success: true, message: '没有匹配的Webhook配置' };
      }

      // 并行发送Webhook请求
      const results = await Promise.all(
        webhooks.map(async (webhook) => {
          try {
            const success = await this.sendWebhookRequest(webhook, eventType, eventData);
            return { webhookId: webhook._id, success };
          } catch (error) {
            console.error(`发送Webhook ${webhook._id} 失败:`, error);
            return { webhookId: webhook._id, success: false };
          }
        })
      );

      return { success: true, results };
    } catch (error) {
      console.error('发送Webhook事件错误:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 发送单个Webhook请求
   * @param {Object} webhook - Webhook配置
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   * @param {number} attempt - 当前重试次数
   */
  async sendWebhookRequest(webhook, eventType, eventData, attempt = 1) {
    try {
      // 生成请求体
      const payload = {
        event: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        webhook_id: webhook._id.toString()
      };

      // 生成签名
      const signature = this.generateSignature(payload, webhook.secret);

      // 发送HTTP请求
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': eventType,
          'X-Webhook-Id': webhook._id.toString()
        },
        timeout: 10000 // 10秒超时
      });

      // 更新Webhook使用统计
      await webhook.updateUsage(true, response.status, '成功');

      return true;
    } catch (error) {
      console.error(`发送Webhook请求失败 (尝试 ${attempt}/${webhook.retryPolicy.maxAttempts}):`, error.message);

      // 更新Webhook使用统计
      const statusCode = error.response ? error.response.status : 0;
      await webhook.updateUsage(false, statusCode, error.message);

      // 检查是否需要重试
      if (attempt < webhook.retryPolicy.maxAttempts) {
        // 将请求添加到重试队列
        this.addToRetryQueue(webhook, eventType, eventData, attempt + 1);
      }

      return false;
    }
  }

  /**
   * 生成Webhook签名
   * @param {Object} payload - 请求体
   * @param {string} secret - 签名密钥
   */
  generateSignature(payload, secret) {
    const payloadStr = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payloadStr);
    return hmac.digest('hex');
  }

  /**
   * 将请求添加到重试队列
   * @param {Object} webhook - Webhook配置
   * @param {string} eventType - 事件类型
   * @param {Object} eventData - 事件数据
   * @param {number} attempt - 下一次重试次数
   */
  addToRetryQueue(webhook, eventType, eventData, attempt) {
    const delay = webhook.retryPolicy.retryDelay * 1000; // 转换为毫秒

    setTimeout(async () => {
      await this.sendWebhookRequest(webhook, eventType, eventData, attempt);
    }, delay);
  }

  /**
   * 处理估价更新事件
   * @param {Object} valuation - 估价数据
   */
  async handleValuationUpdated(valuation) {
    const eventType = 'valuation.updated';
    const eventData = {
      valuation_id: valuation.id,
      property_id: valuation.property_id,
      estimated_price: valuation.estimated_price,
      price_per_sqm: valuation.price_per_sqm,
      confidence_level: valuation.confidence_level,
      model_type: valuation.model_type,
      created_at: valuation.created_at,
      updated_at: valuation.updated_at
    };

    return await this.sendWebhook(eventType, eventData);
  }

  /**
   * 处理估价创建事件
   * @param {Object} valuation - 估价数据
   */
  async handleValuationCreated(valuation) {
    const eventType = 'valuation.created';
    const eventData = {
      valuation_id: valuation.id,
      property_id: valuation.property_id,
      estimated_price: valuation.estimated_price,
      price_per_sqm: valuation.price_per_sqm,
      confidence_level: valuation.confidence_level,
      model_type: valuation.model_type,
      created_at: valuation.created_at
    };

    return await this.sendWebhook(eventType, eventData);
  }

  /**
   * 处理报告生成事件
   * @param {Object} report - 报告数据
   */
  async handleReportGenerated(report) {
    const eventType = 'report.generated';
    const eventData = {
      report_id: report.id,
      valuation_id: report.valuation_id,
      property_id: report.property_id,
      format: report.format,
      pdf_url: report.pdf_url,
      created_at: report.created_at
    };

    return await this.sendWebhook(eventType, eventData);
  }

  /**
   * 处理房产创建事件
   * @param {Object} property - 房产数据
   */
  async handlePropertyCreated(property) {
    const eventType = 'property.created';
    const eventData = {
      property_id: property.id,
      name: property.name,
      type: property.type,
      area: property.area,
      address: property.address,
      created_at: property.created_at
    };

    return await this.sendWebhook(eventType, eventData);
  }

  /**
   * 处理房产更新事件
   * @param {Object} property - 房产数据
   */
  async handlePropertyUpdated(property) {
    const eventType = 'property.updated';
    const eventData = {
      property_id: property.id,
      name: property.name,
      type: property.type,
      area: property.area,
      address: property.address,
      updated_at: property.updated_at
    };

    return await this.sendWebhook(eventType, eventData);
  }
}

// 导出单例
const webhookService = new WebhookService();
module.exports = webhookService;
