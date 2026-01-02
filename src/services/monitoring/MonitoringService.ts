// 监控服务：处理应用性能监控、业务指标监控和成本监控

// 定义监控数据接口
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: Date;
  type: 'performance' | 'business' | 'cost';
  tags?: Record<string, string>;
}

// 定义应用性能指标接口
export interface AppPerformanceData {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  ttfb: number; // Time to First Byte
  tti: number; // Time to Interactive
}

// 定义业务指标接口
export interface BusinessMetricData {
  valuationCount: number; // 估价次数
  userCount: number; // 用户数量
  apiCallCount: number; // API调用次数
  pageViewCount: number; // 页面浏览次数
  conversionRate: number; // 转化率
}

// 定义成本指标接口
export interface CostMetricData {
  apiCost: number; // API成本
  storageCost: number; // 存储成本
  bandwidthCost: number; // 带宽成本
  totalCost: number; // 总成本
}

class MonitoringService {
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: PerformanceMetric[] = [];
  private costMetrics: PerformanceMetric[] = [];
  private isInitialized = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  // 初始化监控服务
  initialize(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    
    // 初始化性能监控
    this.initializePerformanceMonitoring();
    
    // 初始化业务监控
    this.initializeBusinessMonitoring();
    
    // 初始化成本监控
    this.initializeCostMonitoring();
    
    // 定期发送监控数据
    this.intervalId = setInterval(() => {
      this.sendMetrics();
    }, 60000); // 每分钟发送一次
    
    console.log('监控服务已初始化');
  }
  
  // 初始化性能监控
  private initializePerformanceMonitoring(): void {
    // 使用web-vitals库收集核心Web指标
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => this.recordPerformanceMetric('CLS', metric.value));
        onFID((metric) => this.recordPerformanceMetric('FID', metric.value));
        onFCP((metric) => this.recordPerformanceMetric('FCP', metric.value));
        onLCP((metric) => this.recordPerformanceMetric('LCP', metric.value));
        onTTFB((metric) => this.recordPerformanceMetric('TTFB', metric.value));
      });
    }
  }
  
  // 初始化业务监控
  private initializeBusinessMonitoring(): void {
    // 监听页面浏览事件
    if (typeof window !== 'undefined') {
      window.addEventListener('pageview', () => {
        this.recordBusinessMetric('pageViewCount', 1);
      });
      
      // 模拟页面浏览事件
      this.recordBusinessMetric('pageViewCount', 1);
    }
  }
  
  // 初始化成本监控
  private initializeCostMonitoring(): void {
    // 监听API调用事件
    // 这里可以通过拦截API请求来实现
  }
  
  // 记录性能指标
  recordPerformanceMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      id: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      timestamp: new Date(),
      type: 'performance',
      tags
    };
    
    this.performanceMetrics.push(metric);
    this.sendMetric(metric);
  }
  
  // 记录业务指标
  recordBusinessMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      id: `biz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      timestamp: new Date(),
      type: 'business',
      tags
    };
    
    this.businessMetrics.push(metric);
    this.sendMetric(metric);
  }
  
  // 记录成本指标
  recordCostMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      id: `cost-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      value,
      timestamp: new Date(),
      type: 'cost',
      tags
    };
    
    this.costMetrics.push(metric);
    this.sendMetric(metric);
  }
  
  // 发送单个指标
  private sendMetric(metric: PerformanceMetric): void {
    // 实际项目中，这里应该发送到监控服务器
    console.log('发送监控指标:', metric);
    
    // 模拟发送到服务器
    // fetch('/api/monitoring/metrics', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(metric)
    // });
  }
  
  // 批量发送指标
  private sendMetrics(): void {
    const allMetrics = [
      ...this.performanceMetrics,
      ...this.businessMetrics,
      ...this.costMetrics
    ];
    
    if (allMetrics.length === 0) return;
    
    // 实际项目中，这里应该批量发送到监控服务器
    console.log('批量发送监控指标:', allMetrics.length, '个指标');
    
    // 清空指标列表
    this.performanceMetrics = [];
    this.businessMetrics = [];
    this.costMetrics = [];
  }
  
  // 获取性能指标
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }
  
  // 获取业务指标
  getBusinessMetrics(): PerformanceMetric[] {
    return [...this.businessMetrics];
  }
  
  // 获取成本指标
  getCostMetrics(): PerformanceMetric[] {
    return [...this.costMetrics];
  }
  
  // 获取所有指标
  getAllMetrics(): PerformanceMetric[] {
    return [
      ...this.performanceMetrics,
      ...this.businessMetrics,
      ...this.costMetrics
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // 生成应用性能报告
  generatePerformanceReport(): AppPerformanceData {
    // 模拟应用性能数据
    return {
      fcp: 1000, // 1秒
      lcp: 2000, // 2秒
      cls: 0.1, // 0.1
      fid: 100, // 100毫秒
      ttfb: 500, // 500毫秒
      tti: 3000 // 3秒
    };
  }
  
  // 生成业务指标报告
  generateBusinessReport(): BusinessMetricData {
    // 模拟业务指标数据
    return {
      valuationCount: 1234,
      userCount: 567,
      apiCallCount: 8901,
      pageViewCount: 2345,
      conversionRate: 0.05 // 5%
    };
  }
  
  // 生成成本指标报告
  generateCostReport(): CostMetricData {
    // 模拟成本指标数据
    return {
      apiCost: 123.45,
      storageCost: 67.89,
      bandwidthCost: 34.56,
      totalCost: 225.90
    };
  }
  
  // 停止监控服务
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isInitialized = false;
    console.log('监控服务已停止');
  }
}

const monitoringService = new MonitoringService();
export default monitoringService;
