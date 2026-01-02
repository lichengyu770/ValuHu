/**
 * 服务端推送通知服务
 * 处理推送订阅管理和通知发送功能
 */

const webpush = require('web-push');

class ServerPushNotificationService {
  constructor() {
    // VAPID密钥对
    // 注意：在生产环境中，这些密钥应该从环境变量加载，而不是硬编码
    this.vapidKeys = {
      publicKey:
        'BLBx4PzpO93iB2B2zKc7r_4XZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3XKZ9C3X',
      privateKey: 'your-private-vapid-key-here',
    };

    // 存储用户订阅信息的内存数据库
    // 在生产环境中，应使用持久化存储（如数据库）
    this.subscriptions = new Map();

    // 配置web-push
    webpush.setVapidDetails(
      'mailto:your-email@example.com', // 您的联系邮箱
      this.vapidKeys.publicKey,
      this.vapidKeys.privateKey
    );

    // 初始化Express路由处理函数
    this.initializeRoutes = this.initializeRoutes.bind(this);
    this.handleSubscribe = this.handleSubscribe.bind(this);
    this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
    this.handleSendNotification = this.handleSendNotification.bind(this);
    this.sendNotification = this.sendNotification.bind(this);
  }

  /**
   * 初始化Express路由
   * @param {Object} app - Express应用实例
   */
  initializeRoutes(app) {
    // 订阅推送通知
    app.post('/api/push-subscribe', this.handleSubscribe);

    // 取消推送订阅
    app.post('/api/push-subscribe/unsubscribe', this.handleUnsubscribe);

    // 发送测试通知
    app.post('/api/push-notification/send', this.handleSendNotification);

    // 获取VAPID公钥
    app.get('/api/push-vapid-key', (req, res) => {
      res.json({
        publicKey: this.vapidKeys.publicKey,
      });
    });

    console.log('推送通知API路由已初始化');
  }

  /**
   * 处理订阅请求
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async handleSubscribe(req, res) {
    try {
      const subscription = req.body;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({
          error: '无效的订阅信息',
        });
      }

      // 生成订阅ID（可以基于用户ID或endpoint生成）
      const subscriptionId = this.generateSubscriptionId(subscription.endpoint);

      // 存储订阅信息
      this.subscriptions.set(subscriptionId, subscription);

      console.log(`新订阅已保存，ID: ${subscriptionId}`);
      console.log(`当前订阅总数: ${this.subscriptions.size}`);

      // 返回成功响应
      res.status(201).json({
        success: true,
        message: '推送订阅成功',
        subscriptionId,
      });
    } catch (error) {
      console.error('处理推送订阅失败:', error);
      res.status(500).json({
        error: '处理推送订阅时发生错误',
      });
    }
  }

  /**
   * 处理取消订阅请求
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async handleUnsubscribe(req, res) {
    try {
      const subscription = req.body;

      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({
          error: '无效的订阅信息',
        });
      }

      // 查找并删除订阅
      const subscriptionId = this.generateSubscriptionId(subscription.endpoint);
      const wasDeleted = this.subscriptions.delete(subscriptionId);

      if (wasDeleted) {
        console.log(`订阅已取消，ID: ${subscriptionId}`);
        console.log(`当前订阅总数: ${this.subscriptions.size}`);

        res.json({
          success: true,
          message: '推送订阅已取消',
        });
      } else {
        res.status(404).json({
          error: '未找到指定的订阅',
        });
      }
    } catch (error) {
      console.error('处理取消订阅失败:', error);
      res.status(500).json({
        error: '处理取消订阅时发生错误',
      });
    }
  }

  /**
   * 处理发送通知请求
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   */
  async handleSendNotification(req, res) {
    try {
      const { title, body, url, recipients = 'all' } = req.body;

      // 验证必要字段
      if (!title && !body) {
        return res.status(400).json({
          error: '通知标题或内容不能为空',
        });
      }

      // 创建通知数据
      const notificationData = {
        title: title || '系统通知',
        body: body || '',
        url: url || '/',
        timestamp: Date.now(),
      };

      // 发送通知
      if (recipients === 'all') {
        // 发送给所有订阅者
        const results = await this.sendToAllSubscribers(notificationData);

        res.json({
          success: true,
          totalSubscriptions: results.total,
          successful: results.successful,
          failed: results.failed,
          message: `已向 ${results.successful} 个订阅发送通知，${results.failed} 个失败`,
        });
      } else if (Array.isArray(recipients)) {
        // 发送给特定订阅者
        const results = await this.sendToSpecificSubscribers(
          recipients,
          notificationData
        );

        res.json({
          success: true,
          totalSubscriptions: results.total,
          successful: results.successful,
          failed: results.failed,
          message: `已向 ${results.successful} 个指定订阅发送通知，${results.failed} 个失败`,
        });
      } else {
        res.status(400).json({
          error: '无效的接收者参数',
        });
      }
    } catch (error) {
      console.error('处理发送通知请求失败:', error);
      res.status(500).json({
        error: '发送通知时发生错误',
      });
    }
  }

  /**
   * 向单个订阅者发送通知
   * @param {Object} subscription - 推送订阅对象
   * @param {Object} data - 通知数据
   * @returns {Promise<boolean>} - 是否发送成功
   */
  async sendNotification(subscription, data) {
    try {
      // 将数据序列化为JSON字符串
      const payload = JSON.stringify(data);

      // 发送推送通知
      await webpush.sendNotification(subscription, payload);

      console.log('通知发送成功');
      return true;
    } catch (error) {
      console.error('发送通知失败:', error);

      // 处理常见错误
      if (error.statusCode === 410 || error.statusCode === 404) {
        // 订阅已过期或不存在，应从存储中移除
        console.log('订阅已过期，将被移除');
        const subscriptionId = this.generateSubscriptionId(
          subscription.endpoint
        );
        this.subscriptions.delete(subscriptionId);
      }

      return false;
    }
  }

  /**
   * 向所有订阅者发送通知
   * @param {Object} data - 通知数据
   * @returns {Promise<Object>} - 发送结果统计
   */
  async sendToAllSubscribers(data) {
    const results = {
      total: this.subscriptions.size,
      successful: 0,
      failed: 0,
    };

    if (results.total === 0) {
      return results;
    }

    // 并行发送通知
    const promises = Array.from(this.subscriptions.values()).map(
      async (subscription) => {
        const success = await this.sendNotification(subscription, data);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
        }
      }
    );

    await Promise.all(promises);
    return results;
  }

  /**
   * 向特定订阅者发送通知
   * @param {Array<string>} subscriptionIds - 订阅ID数组
   * @param {Object} data - 通知数据
   * @returns {Promise<Object>} - 发送结果统计
   */
  async sendToSpecificSubscribers(subscriptionIds, data) {
    const results = {
      total: subscriptionIds.length,
      successful: 0,
      failed: 0,
    };

    // 并行发送通知
    const promises = subscriptionIds.map(async (id) => {
      const subscription = this.subscriptions.get(id);
      if (subscription) {
        const success = await this.sendNotification(subscription, data);
        if (success) {
          results.successful++;
        } else {
          results.failed++;
        }
      } else {
        results.failed++;
      }
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * 根据endpoint生成订阅ID
   * @param {string} endpoint - 推送端点URL
   * @returns {string} - 订阅ID
   */
  generateSubscriptionId(endpoint) {
    // 简单实现：使用endpoint的哈希或截取部分作为ID
    // 在生产环境中，可以使用更安全的方法
    return endpoint.substring(endpoint.lastIndexOf('/') + 1);
  }

  /**
   * 获取当前所有订阅
   * @returns {Array<Object>} - 订阅数组
   */
  getAllSubscriptions() {
    return Array.from(this.subscriptions.values());
  }

  /**
   * 获取订阅统计信息
   * @returns {Object} - 统计信息
   */
  getSubscriptionStats() {
    return {
      totalSubscriptions: this.subscriptions.size,
    };
  }
}

// 导出服务实例
const pushService = new ServerPushNotificationService();

module.exports = {
  pushService,
  ServerPushNotificationService,
};
