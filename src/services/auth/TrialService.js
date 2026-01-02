// 试用次数管理服务
import AuthService from './AuthService';

class TrialService {
  // 获取当前用户剩余试用次数
  static getRemainingTrialCount() {
    const user = AuthService.getCurrentUser();
    if (!user) {
      return 0;
    }
    // 如果用户没有freeTrialCount字段，初始化10次试用次数
    if (user.freeTrialCount === undefined || user.freeTrialCount === null) {
      this.initializeTrialCount();
      return 10;
    }
    return user.freeTrialCount;
  }

  // 初始化新用户的试用次数
  static initializeTrialCount() {
    const user = AuthService.getCurrentUser();
    if (
      user &&
      (user.freeTrialCount === undefined || user.freeTrialCount === null)
    ) {
      const updatedUser = {
        ...user,
        freeTrialCount: 10,
      };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return user;
  }

  // 检查是否有可用的试用次数
  static hasRemainingTrial() {
    const remainingCount = this.getRemainingTrialCount();
    return remainingCount > 0;
  }

  // 检查试用次数是否已用尽
  static isTrialExhausted() {
    return this.getRemainingTrialCount() <= 0;
  }

  // 扣减试用次数
  static deductTrialCount(count = 1) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    // 确保用户有freeTrialCount字段
    const currentCount = user.freeTrialCount || 10;
    if (currentCount < count) {
      return false;
    }

    // 扣减试用次数
    const updatedUser = {
      ...user,
      freeTrialCount: currentCount - count,
    };

    // 更新用户信息
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return true;
  }

  // 重置试用次数（管理员功能，可选）
  static resetTrialCount() {
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const updatedUser = {
      ...user,
      freeTrialCount: 10,
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }

  // 更新试用次数（管理员功能，可选）
  static updateTrialCount(newCount) {
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const updatedUser = {
      ...user,
      freeTrialCount: Math.max(0, newCount), // 确保次数不为负数
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
}

export default TrialService;
