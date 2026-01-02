class PaymentService {
  static async createPayment(orderData) {
    try {
      // 模拟支付创建过程
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('支付创建失败');
      }

      return await response.json();
    } catch (error) {
      console.error('创建支付失败:', error);
      throw error;
    }
  }

  static async getPaymentHistory() {
    try {
      const response = await fetch('/api/payment/history', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取支付历史失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取支付历史失败:', error);
      throw error;
    }
  }

  static async getPaymentDetails(paymentId) {
    try {
      const response = await fetch(`/api/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取支付详情失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取支付详情失败:', error);
      throw error;
    }
  }

  static async cancelPayment(paymentId) {
    try {
      const response = await fetch(`/api/payment/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('取消支付失败');
      }

      return await response.json();
    } catch (error) {
      console.error('取消支付失败:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentId) {
    try {
      const response = await fetch(`/api/payment/${paymentId}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('验证支付失败');
      }

      return await response.json();
    } catch (error) {
      console.error('验证支付失败:', error);
      throw error;
    }
  }

  static async getPaymentMethods() {
    try {
      const response = await fetch('/api/payment/methods', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取支付方式失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取支付方式失败:', error);
      throw error;
    }
  }

  static async updatePaymentMethod(methodId, data) {
    try {
      const response = await fetch(`/api/payment/methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('更新支付方式失败');
      }

      return await response.json();
    } catch (error) {
      console.error('更新支付方式失败:', error);
      throw error;
    }
  }

  static async deletePaymentMethod(methodId) {
    try {
      const response = await fetch(`/api/payment/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('删除支付方式失败');
      }

      return await response.json();
    } catch (error) {
      console.error('删除支付方式失败:', error);
      throw error;
    }
  }

  static async addPaymentMethod(data) {
    try {
      const response = await fetch('/api/payment/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('添加支付方式失败');
      }

      return await response.json();
    } catch (error) {
      console.error('添加支付方式失败:', error);
      throw error;
    }
  }

  static async getSubscriptionPlans() {
    try {
      const response = await fetch('/api/payment/plans', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('获取订阅计划失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取订阅计划失败:', error);
      throw error;
    }
  }

  static async subscribeToPlan(planId, paymentMethodId) {
    try {
      const response = await fetch('/api/payment/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          planId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('订阅计划失败');
      }

      return await response.json();
    } catch (error) {
      console.error('订阅计划失败:', error);
      throw error;
    }
  }

  static async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(
        `/api/payment/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('取消订阅失败');
      }

      return await response.json();
    } catch (error) {
      console.error('取消订阅失败:', error);
      throw error;
    }
  }

  static async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await fetch(
        `/api/payment/subscriptions/${subscriptionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('获取订阅详情失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取订阅详情失败:', error);
      throw error;
    }
  }
}

export default PaymentService;
