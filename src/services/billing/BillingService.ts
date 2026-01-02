// 计费服务：处理套餐管理、使用量追踪和发票支付集成
import { Plan, User, Usage, Invoice } from '../auth/AuthService';

// 预定义套餐列表
const PREDEFINED_PLANS: Plan[] = [
  {
    id: 'free',
    name: '免费版',
    description: '适合个人用户和测试使用',
    price: 0,
    period: 'monthly',
    features: ['10次免费估价/月', '基本数据分析', '标准支持'],
    maxValuations: 10,
    maxUsers: 1,
    prioritySupport: false,
    earlyAccess: false,
    exclusiveFeatures: false
  },
  {
    id: 'basic',
    name: '基础版',
    description: '适合小型团队和专业用户',
    price: 99,
    period: 'monthly',
    features: ['100次估价/月', '高级数据分析', '优先支持', 'API访问'],
    maxValuations: 100,
    maxUsers: 5,
    prioritySupport: true,
    earlyAccess: false,
    exclusiveFeatures: false
  },
  {
    id: 'pro',
    name: '专业版',
    description: '适合中型企业和机构',
    price: 299,
    period: 'monthly',
    features: ['500次估价/月', '高级数据分析', '专属支持', 'API访问', '团队管理'],
    maxValuations: 500,
    maxUsers: 20,
    prioritySupport: true,
    earlyAccess: true,
    exclusiveFeatures: true
  },
  {
    id: 'enterprise',
    name: '企业版',
    description: '适合大型企业和机构',
    price: 999,
    period: 'monthly',
    features: ['无限次估价', '高级数据分析', '专属客户经理', 'API访问', '团队管理', '私有化部署'],
    maxValuations: Infinity,
    maxUsers: 100,
    prioritySupport: true,
    earlyAccess: true,
    exclusiveFeatures: true
  }
];

class BillingService {
  // 获取所有套餐
  static getAllPlans(): Plan[] {
    return PREDEFINED_PLANS;
  }

  // 获取单个套餐
  static getPlan(planId: string): Plan | undefined {
    return PREDEFINED_PLANS.find(plan => plan.id === planId);
  }

  // 获取用户当前套餐
  static getUserCurrentPlan(user: User): Plan | undefined {
    if (user.currentPlan) {
      return user.currentPlan;
    }
    return this.getPlan(user.currentPlanId || 'free');
  }

  // 检查用户是否可以执行估价
  static canUserValuate(user: User): boolean {
    const plan = this.getUserCurrentPlan(user);
    if (!plan) return false;

    // 免费版用户检查免费次数
    if (plan.id === 'free') {
      return (user.freeTrialCount || 0) > 0;
    }

    // 付费用户检查使用量
    if (user.usage && plan.maxValuations > 0) {
      return user.usage.valuationsUsed < plan.maxValuations;
    }

    return true;
  }

  // 更新用户估价使用量
  static updateValuationUsage(user: User): User {
    const updatedUser = { ...user };
    
    // 初始化使用量（如果不存在）
    if (!updatedUser.usage) {
      const now = new Date();
      updatedUser.usage = {
        id: `usage-${Date.now()}`,
        userId: user.id,
        planId: user.currentPlanId || 'free',
        valuationsUsed: 0,
        storageUsed: 0,
        apiCallsUsed: 0,
        periodStart: now,
        periodEnd: new Date(now.setMonth(now.getMonth() + 1)),
        isCurrent: true
      };
    }

    // 更新使用量
    updatedUser.usage.valuationsUsed += 1;

    // 更新累计估价次数
    if (updatedUser.totalValuations) {
      updatedUser.totalValuations += 1;
    } else {
      updatedUser.totalValuations = 1;
    }

    return updatedUser;
  }

  // 生成发票
  static generateInvoice(user: User, amount: number, planId: string): Invoice {
    const now = new Date();
    const dueDate = new Date(now.setDate(now.getDate() + 30));
    
    return {
      id: `invoice-${Date.now()}`,
      userId: user.id,
      planId,
      amount,
      status: 'issued',
      issueDate: new Date(),
      dueDate,
      invoiceNumber: `INV-${Date.now()}`,
      paymentMethod: user.paymentMethod
    };
  }

  // 处理支付
  static processPayment(invoiceId: string, paymentMethod: string): boolean {
    // 模拟支付处理
    console.log(`处理发票 ${invoiceId} 的支付，支付方式：${paymentMethod}`);
    return true;
  }

  // 升级套餐
  static upgradePlan(user: User, newPlanId: string): User {
    const newPlan = this.getPlan(newPlanId);
    if (!newPlan) {
      throw new Error('无效的套餐ID');
    }

    const updatedUser = { ...user };
    updatedUser.currentPlanId = newPlanId;
    updatedUser.currentPlan = newPlan;
    updatedUser.subscriptionStatus = 'active';

    // 生成升级发票
    const invoice = this.generateInvoice(updatedUser, newPlan.price, newPlanId);
    if (!updatedUser.invoices) {
      updatedUser.invoices = [];
    }
    updatedUser.invoices.push(invoice);

    return updatedUser;
  }

  // 降级套餐
  static downgradePlan(user: User, newPlanId: string): User {
    const newPlan = this.getPlan(newPlanId);
    if (!newPlan) {
      throw new Error('无效的套餐ID');
    }

    const updatedUser = { ...user };
    updatedUser.currentPlanId = newPlanId;
    updatedUser.currentPlan = newPlan;

    return updatedUser;
  }

  // 取消订阅
  static cancelSubscription(user: User): User {
    const updatedUser = { ...user };
    updatedUser.subscriptionStatus = 'cancelled';
    updatedUser.currentPlanId = 'free';
    updatedUser.currentPlan = this.getPlan('free');

    return updatedUser;
  }

  // 检查使用量是否接近上限
  static checkUsageLimit(user: User): { isNearLimit: boolean; remaining: number; percentage: number } {
    const plan = this.getUserCurrentPlan(user);
    if (!plan || !user.usage || plan.maxValuations === Infinity) {
      return { isNearLimit: false, remaining: Infinity, percentage: 0 };
    }

    const remaining = plan.maxValuations - user.usage.valuationsUsed;
    const percentage = (user.usage.valuationsUsed / plan.maxValuations) * 100;
    const isNearLimit = percentage > 80;

    return { isNearLimit, remaining, percentage };
  }

  // 计算使用量统计
  static calculateUsageStats(user: User): { total: number; used: number; remaining: number } {
    const plan = this.getUserCurrentPlan(user);
    if (!plan) {
      return { total: 0, used: 0, remaining: 0 };
    }

    const used = user.usage?.valuationsUsed || 0;
    const total = plan.maxValuations;
    const remaining = total - used;

    return { total, used, remaining };
  }
}

export default BillingService;
