// 估价服务层实现
import { matrixEvaluation } from '../utils/matrixEvaluation.ts';
import { ValuationService as ValuationAlgorithmService } from '../utils/valuationAlgorithms.ts';
import { PropertyInfo as ValuationPropertyInfo } from '../utils/valuationAlgorithms.ts';
import { defaultValuationParams } from '../models/valuationModels.js';
import RedisCacheService from './RedisCacheService.js';
import apiClient from './apiClient';
import { historyDataService } from './HistoryDataService';

// 定义估价参数接口
export interface ValuationParams {
  area: number;
  location: string;
  buildingType: string;
  constructionYear: number;
  floor: number;
  totalFloors: number;
  orientation: string;
  decorationLevel: string;
  lotRatio: number;
  greenRatio: number;
  valuationMethod: string;
  nearbyFacilities: string[];
  [key: string]: any;
}

// 定义市场数据接口
export interface MarketData {
  areaIndexes: Record<string, number>;
  buildingTypeIndexes: Record<string, number>;
  trends: {
    monthlyGrowth: string;
    annualGrowth: string;
    marketSentiment: string;
    [key: string]: any;
  };
  basePrices: Record<string, number>;
  liquidityIndex: number;
  policyImpact?: {
    mortgageRate: number;
    taxPolicy: string;
    regulatoryPolicy: string;
    [key: string]: any;
  };
  marketActivity?: {
    transactionVolume: number;
    averageDaysOnMarket: number;
    priceNegotiationSpace: string;
    [key: string]: any;
  };
  bankAssessment?: {
    loanToValueRatio: number;
    assessmentConfidence: number;
    riskLevel: string;
  };
  governmentData?: {
    benchmarkLandPrice: number;
    transactionTaxRate: number;
    regulatoryZone: string;
  };
  sourceId: string;
  [key: string]: any;
}

// 定义数据源配置接口
export interface MarketDataSource {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  fetchData: () => Promise<MarketData>;
}

// 定义估价结果接口
export interface ValuationResult {
  totalValue: number;
  unitPrice: number;
  confidence: number;
  valuationMethod: string;
  factors: {
    weights: {
      market: number;
      income: number;
      cost: number;
    };
    [key: string]: any;
  };
  propertyId: string;
  valuationDate: Date;
  comparableProperties: Array<any>;
  trendAnalysis: {
    yearOnYearGrowth: string;
    prediction: string;
    monthlyTrend: Array<{
      month: string;
      price: number;
    }>;
  };
  evaluationDetails: {
    factorsAnalysis: Array<{
      name: string;
      value: number;
      weight: number;
    }>;
    valuationParams: ValuationParams;
    confidenceLevel: number;
    matrixEvaluation: {
      totalScore: number;
      rating: string;
      confidence: number;
      dimensionScores: Record<string, number>;
      factorScores: Record<string, number>;
      evaluationDimensions: Array<any>;
    };
  };
  marketDataImpact: {
    areaIndex: number;
    buildingTypeIndex: number;
    marketTrend: {
      monthlyGrowth: string;
      annualGrowth: string;
      marketSentiment: string;
      [key: string]: any;
    };
    usedBasePrice: number;
    marketSentiment: string;
    bankAssessment?: {
      loanToValueRatio: number;
      assessmentConfidence: number;
      riskLevel: string;
    };
    governmentData?: {
      benchmarkLandPrice: number;
      transactionTaxRate: number;
      regulatoryZone: string;
    };
    marketActivity?: {
      transactionVolume: number;
      averageDaysOnMarket: number;
      priceNegotiationSpace: string;
      [key: string]: any;
    };
    liquidityIndex: number;
    policyImpact?: {
      mortgageRate: number;
      taxPolicy: string;
      regulatoryPolicy: string;
      [key: string]: any;
    };
  };
  [key: string]: any;
}

// 定义历史记录接口
export interface ValuationHistoryRecord {
  id: string;
  propertyId: string;
  valuationDate: Date;
  totalValue: number;
  unitPrice: number;
  valuationMethod: string;
  confidence: number;
}

/**
 * 估价服务类
 * 提供估价相关的业务逻辑封装
 */
class ValuationService {
  // 估价结果缓存，使用LRU策略
  static valuationCache = {
    cache: new Map<string, { result: ValuationResult; timestamp: number }>(),
    maxSize: 200, // 增加最大缓存数量
    ttl: 24 * 60 * 60 * 1000, // 添加缓存过期时间（24小时）
    get(params: ValuationParams): ValuationResult | null {
      const key = this.generateCacheKey(params);
      const cachedItem = this.cache.get(key);
      
      if (cachedItem) {
        // 检查缓存是否过期
        if (Date.now() - cachedItem.timestamp < this.ttl) {
          // 更新访问时间，维持LRU顺序
          this.cache.delete(key);
          this.cache.set(key, cachedItem);
          return cachedItem.result;
        } else {
          // 缓存过期，移除
          this.cache.delete(key);
        }
      }
      return null;
    },
    set(params: ValuationParams, result: ValuationResult): void {
      const key = this.generateCacheKey(params);
      const cachedItem = {
        result,
        timestamp: Date.now()
      };
      
      // 如果缓存已满，移除最早的条目
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      // 保存缓存项
      this.cache.set(key, cachedItem);
    },
    generateCacheKey(params: ValuationParams): string {
      // 生成唯一的缓存键，基于估价参数的关键属性
      const { area, location, buildingType, constructionYear, floor, totalFloors, orientation, decorationLevel, lotRatio, greenRatio, valuationMethod } = params;
      return JSON.stringify({
        area, location, buildingType, constructionYear, floor, totalFloors, orientation, decorationLevel, lotRatio, greenRatio, valuationMethod
      });
    },
    clear(): void {
      this.cache.clear();
    },
    getSize(): number {
      return this.cache.size;
    },
    // 批量添加缓存
    batchSet(items: Array<{ params: ValuationParams; result: ValuationResult }>): void {
      if (!Array.isArray(items) || items.length === 0) return;
      
      items.forEach(({ params, result }) => {
        this.set(params, result);
      });
    }
  };

  // 市场数据缓存，定期更新
  static marketDataCache = {
    data: null as MarketData | null,
    lastUpdated: null as number | null,
    updateInterval: 60 * 60 * 1000, // 1小时更新一次
    updateTimer: null as NodeJS.Timeout | null, // 定时更新定时器
    metrics: {
      updateCount: 0,
      successCount: 0,
      failureCount: 0,
      averageUpdateTime: 0,
      lastUpdateTime: 0,
      activeSources: 0,
      cacheHits: 0,
      cacheMisses: 0
    },
    listeners: new Set<(data: MarketData) => void>(), // 数据更新监听器
    
    /**
     * 初始化市场数据缓存，启动定时更新
     */
    init(): void {
      // 启动定时更新
      this.startAutoUpdate();
      // 初始化时更新一次数据
      this.updateMarketData();
    },
    
    /**
     * 启动自动更新定时器
     */
    startAutoUpdate(): void {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
      }
      
      // 每小时自动更新一次数据
      this.updateTimer = setInterval(() => {

        this.updateMarketData();
      }, this.updateInterval);
      

    },
    
    /**
     * 停止自动更新定时器
     */
    stopAutoUpdate(): void {
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;

      }
    },
    
    /**
     * 获取市场数据，如果缓存过期则更新
     */
    async getMarketData(): Promise<MarketData | null> {
      const now = Date.now();
      // 如果缓存不存在或已过期，更新数据
      if (!this.data || (this.lastUpdated && (now - this.lastUpdated > this.updateInterval))) {
        this.metrics.cacheMisses++;
        await this.updateMarketData();
      } else {
        this.metrics.cacheHits++;
      }
      return this.data;
    },
    
    /**
     * 强制更新市场数据
     */
    async forceUpdate(): Promise<void> {
      await this.updateMarketData();
    },
    
    /**
     * 更新市场数据，从多个数据源获取并合并
     */
    async updateMarketData(): Promise<void> {
      const startTime = Date.now();
      this.metrics.updateCount++;
      
      try {
        // 获取所有启用的数据源
        const enabledSources = ValuationService.marketDataSources.filter(source => source.enabled);
        this.metrics.activeSources = enabledSources.length;
        
        // 并发从所有数据源获取数据
        const dataPromises = enabledSources.map(source => {
          return source.fetchData().catch(_error => {

            return null; // 单个数据源失败不影响整体
          });
        });
        
        // 等待所有数据源返回结果
        const allData = await Promise.all(dataPromises);
        
        // 过滤掉失败的数据源
        const validData = allData.filter((data): data is MarketData => data !== null);
        
        if (validData.length === 0) {
          throw new Error('所有数据源获取失败');
        }
        
        // 合并数据
        const mergedData = this.mergeMarketData(validData);
        
        // 更新缓存
        this.data = mergedData;
        this.lastUpdated = Date.now();
        
        // 更新性能指标
        this.metrics.successCount++;
        const updateTime = Date.now() - startTime;
        this.metrics.lastUpdateTime = updateTime;
        this.metrics.averageUpdateTime = (
          (this.metrics.averageUpdateTime * (this.metrics.successCount - 1) + updateTime) / this.metrics.successCount
        );
        

        
        // 通知所有监听器数据已更新
        this.notifyListeners(mergedData);
      } catch (error) {

        this.metrics.failureCount++;
        // 如果更新失败，使用现有缓存数据（如果有）
      }
    },
    
    /**
     * 合并来自多个数据源的市场数据
     * @param dataArray - 来自多个数据源的数据数组
     * @returns 合并后的市场数据
     */
    mergeMarketData(dataArray: MarketData[]): MarketData {
      // 按优先级排序数据源
      const sortedData = dataArray.sort((a, b) => {
        const sourceA = ValuationService.marketDataSources.find(s => s.id === a.sourceId);
        const sourceB = ValuationService.marketDataSources.find(s => s.id === b.sourceId);
        return (sourceB?.priority || 0) - (sourceA?.priority || 0);
      });
      
      // 合并数据，优先级高的数据源覆盖优先级低的
      const mergedData: MarketData = {
        areaIndexes: {},
        buildingTypeIndexes: {},
        trends: {},
        basePrices: {},
        liquidityIndex: 0,
        sourceId: 'merged'
      };
      
      // 遍历所有数据，按优先级合并
      sortedData.forEach(data => {
        if (data.areaIndexes) {
          mergedData.areaIndexes = { ...mergedData.areaIndexes, ...data.areaIndexes };
        }
        
        if (data.buildingTypeIndexes) {
          mergedData.buildingTypeIndexes = { ...mergedData.buildingTypeIndexes, ...data.buildingTypeIndexes };
        }
        
        if (data.trends) {
          mergedData.trends = { ...mergedData.trends, ...data.trends };
        }
        
        if (data.basePrices) {
          mergedData.basePrices = { ...mergedData.basePrices, ...data.basePrices };
        }
        
        if (data.liquidityIndex) {
          mergedData.liquidityIndex = data.liquidityIndex;
        }
        
        if (data.policyImpact) {
          mergedData.policyImpact = { ...mergedData.policyImpact, ...data.policyImpact };
        }
        
        if (data.marketActivity) {
          mergedData.marketActivity = { ...mergedData.marketActivity, ...data.marketActivity };
        }
        
        // 合并银行评估数据
        if (data.bankAssessment) {
          mergedData.bankAssessment = { ...mergedData.bankAssessment, ...data.bankAssessment };
        }
        
        // 合并政府公示数据
        if (data.governmentData) {
          mergedData.governmentData = { ...mergedData.governmentData, ...data.governmentData };
        }
      });
      
      return mergedData;
    },
    
    /**
     * 获取缓存状态信息
     */
    getStatus() {
      return {
        lastUpdated: this.lastUpdated,
        updateInterval: this.updateInterval,
        dataAvailable: this.data !== null,
        timeSinceLastUpdate: this.lastUpdated ? Date.now() - this.lastUpdated : null,
        isOutdated: this.lastUpdated ? Date.now() - this.lastUpdated > this.updateInterval : true,
        metrics: { ...this.metrics },
        listenerCount: this.listeners.size
      };
    },
    
    /**
     * 重置缓存
     */
    reset(): void {
      this.data = null;
      this.lastUpdated = null;

    },
    
    /**
     * 添加数据更新监听器
     */
    addListener(listener: (data: MarketData) => void): void {
      this.listeners.add(listener);
    },
    
    /**
     * 移除数据更新监听器
     */
    removeListener(listener: (data: MarketData) => void): void {
      this.listeners.delete(listener);
    },
    
    /**
     * 通知所有监听器数据已更新
     */
    notifyListeners(data: MarketData): void {
      this.listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in market data listener:', error);
        }
      });
    },
    
    /**
     * 设置更新间隔
     */
    setUpdateInterval(interval: number): void {
      this.updateInterval = interval;
      // 重启定时器
      this.startAutoUpdate();
    },
    
    /**
     * 获取数据源状态
     */
    getDataSourceStatus() {
      return ValuationService.marketDataSources.map(source => ({
        id: source.id,
        name: source.name,
        priority: source.priority,
        enabled: source.enabled,
        apiKey: source.apiKey ? '****' : '', // 隐藏API密钥
        apiUrl: source.apiUrl
      }));
    },
    
    /**
     * 启用或禁用数据源
     */
    toggleDataSource(sourceId: string, enabled: boolean): void {
      const source = ValuationService.marketDataSources.find(s => s.id === sourceId);
      if (source) {
        source.enabled = enabled;

        // 立即更新数据
        this.updateMarketData();
      }
    }
  };

  // 市场数据源配置
  static marketDataSources: MarketDataSource[] = [
    {
      id: 'gis-data-source',
      name: 'GIS造价查询数据源',
      priority: 0, // 最高优先级
      enabled: true, // 默认启用GIS数据源
      apiKey: import.meta.env.VITE_GIS_API_KEY || 'cc6cc650f37f17fa1c76e2607935a1a9',
      apiUrl: 'https://api.example.com/gis-cost-data', // 模拟GIS API地址
      fetchData: async () => {
        try {
          // 使用用户提供的GIS API密钥获取造价数据
          // 这里使用模拟数据，实际应该调用真实的GIS API
          // const response = await apiClient.get('/gis-cost-data', {
          //   params: {
          //     key: import.meta.env.VITE_GIS_API_KEY || 'cc6cc650f37f17fa1c76e2607935a1a9',
          //     securityKey: import.meta.env.VITE_GIS_SECURITY_KEY || '8fa11b2815f42423c371b6796d2e7f5a'
          //   },
          //   timeout: 5000 // 5秒超时
          // });
          
          // 模拟GIS API返回的数据
          return {
            areaIndexes: {
              // 基于GIS数据的区域指数
              xjang: 1.05,          // 湘江新区
              furong: 1.28,        // 芙蓉区
              yuelu: 0.92,        // 岳麓区
              tianxin: 1.10,      // 天心区
              kaifu: 1.15,        // 开福区
              yuhua: 1.14,         // 雨花区
              wangcheng: 0.87,     // 望城区
              changsha_county: 0.94, // 长沙县
              ningxiang: 0.80,     // 宁乡市
              liuyang: 0.77        // 浏阳市
            },
            buildingTypeIndexes: {
              // 基于GIS数据的建筑类型指数
              '住宅': 1.0,
              '商业': 1.85,
              '办公': 1.55,
              '工业': 0.82,
              '别墅': 2.05,
              '公寓': 0.97,
              '写字楼': 1.48,
              '商铺': 2.25,
              '仓库': 0.72,
              '厂房': 0.78
            },
            trends: {
              // 基于GIS数据的市场趋势
              monthlyGrowth: (Math.random() * 0.5 - 0.1).toFixed(3),
              annualGrowth: (Math.random() * 5 - 1).toFixed(1),
              marketSentiment: ['看涨', '看平', '看跌'][Math.floor(Math.random() * 3)]
            },
            basePrices: {
              // 基于GIS造价数据的基准价格
              '住宅': 13500 + Math.floor(Math.random() * 1500),
              '商业': 24500 + Math.floor(Math.random() * 2500),
              '办公': 20750 + Math.floor(Math.random() * 2000),
              '工业': 11000 + Math.floor(Math.random() * 1000),
              '别墅': 27000 + Math.floor(Math.random() * 3000),
              '公寓': 12875 + Math.floor(Math.random() * 1200),
              '写字楼': 24500 + Math.floor(Math.random() * 1800),
              '商铺': 29500 + Math.floor(Math.random() * 2800),
              '仓库': 9750 + Math.floor(Math.random() * 900),
              '厂房': 10375 + Math.floor(Math.random() * 1000)
            },
            liquidityIndex: 0.78 + Math.random() * 0.15,
            policyImpact: {
              mortgageRate: 4.3 + Math.random() * 0.4,
              taxPolicy: '稳定',
              regulatoryPolicy: '中性'
            },
            sourceId: 'gis-data-source'
          };
        } catch (error) {
          console.error('GIS数据源获取失败:', error);
          throw error;
        }
      }
    },
    {
      id: 'real-estate-api',
      name: '真实房产API数据源',
      priority: 1, // 第二优先级
      enabled: false, // 默认禁用，需要配置API密钥
      apiKey: process.env.REAL_ESTATE_API_KEY || '',
      apiUrl: process.env.REAL_ESTATE_API_URL || 'https://api.example.com/real-estate',
      fetchData: async () => {
        try {
          // 使用apiClient从真实API获取市场数据
          const response = await apiClient.get('/market-data', {
            timeout: 5000 // 5秒超时
          });
          
          const data = response.data;
          
          return {
            areaIndexes: data.areaIndexes || {},
            buildingTypeIndexes: data.buildingTypeIndexes || {},
            trends: data.trends || {
              monthlyGrowth: '0.000',
              annualGrowth: '0.0',
              marketSentiment: '看平'
            },
            basePrices: data.basePrices || {},
            liquidityIndex: data.liquidityIndex || 0.75,
            policyImpact: data.policyImpact,
            marketActivity: data.marketActivity,
            bankAssessment: data.bankAssessment,
            governmentData: data.governmentData,
            sourceId: 'real-estate-api'
          };
        } catch (error) {
          console.error('真实房产API数据源获取失败:', error);
          throw error;
        }
      }
    },
    {
      id: 'default',
      name: '默认数据源',
      priority: 2,
      enabled: true,
      fetchData: async () => {
        // 模拟从API获取市场数据
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          areaIndexes: {
            xjang: 1.0,          // 湘江新区
            furong: 1.26,        // 芙蓉区
            yuelu: 0.896,        // 岳麓区
            tianxin: 1.088,      // 天心区
            kaifu: 1.136,        // 开福区
            yuhua: 1.12,         // 雨花区
            wangcheng: 0.85,     // 望城区
            changsha_county: 0.92, // 长沙县
            ningxiang: 0.78,     // 宁乡市
            liuyang: 0.75        // 浏阳市
          },
          buildingTypeIndexes: {
            '住宅': 1.0,
            '商业': 1.8,
            '办公': 1.5,
            '工业': 0.8,
            '别墅': 2.0,
            '公寓': 0.95,
            '写字楼': 1.45,
            '商铺': 2.2,
            '仓库': 0.7,
            '厂房': 0.75
          },
          trends: {
            monthlyGrowth: (Math.random() * 0.5 - 0.1).toFixed(3),
            annualGrowth: (Math.random() * 5 - 1).toFixed(1),
            marketSentiment: ['看涨', '看平', '看跌'][Math.floor(Math.random() * 3)]
          },
          basePrices: {
            '住宅': 12500 + Math.floor(Math.random() * 1000),
            '商业': 22500 + Math.floor(Math.random() * 2000),
            '办公': 18750 + Math.floor(Math.random() * 1500),
            '工业': 10000 + Math.floor(Math.random() * 800),
            '别墅': 25000 + Math.floor(Math.random() * 2500),
            '公寓': 11875 + Math.floor(Math.random() * 950),
            '写字楼': 22500 + Math.floor(Math.random() * 1450),
            '商铺': 27500 + Math.floor(Math.random() * 2200),
            '仓库': 8750 + Math.floor(Math.random() * 700),
            '厂房': 9375 + Math.floor(Math.random() * 750)
          },
          liquidityIndex: 0.75 + Math.random() * 0.2,
          policyImpact: {
            mortgageRate: 4.2 + Math.random() * 0.5,
            taxPolicy: '稳定',
            regulatoryPolicy: '中性'
          },
          sourceId: 'default'
        };
      }
    }
  ];

  /**
   * 执行房产估价
   * @param params - 估价参数
   * @returns 完整估价结果
   */
  static async performValuation(params: ValuationParams): Promise<ValuationResult> {
    try {
      // 合并默认参数和用户输入参数
      const valuationParams = { ...defaultValuationParams, ...params };
      
      // 生成Redis缓存键
      const cacheKey = `valuation:${this.valuationCache.generateCacheKey(valuationParams)}`;
      
      // 尝试从Redis缓存获取结果
      const redisCachedResult = await RedisCacheService.get(cacheKey);
      if (redisCachedResult) {
        // 返回Redis缓存结果，更新估价日期和propertyId
        return {
          ...redisCachedResult,
          propertyId: `PROP${Date.now()}`,
          valuationDate: new Date()
        };
      }
      
      // 尝试从内存缓存获取结果
      const memoryCachedResult = this.valuationCache.get(valuationParams);
      if (memoryCachedResult) {
        // 返回内存缓存结果，更新估价日期和propertyId
        const updatedResult = {
          ...memoryCachedResult,
          propertyId: `PROP${Date.now()}`,
          valuationDate: new Date()
        };
        
        // 将结果存入Redis缓存，有效期24小时
        RedisCacheService.set(cacheKey, updatedResult, 24 * 60 * 60);
        
        return updatedResult;
      }
      
      // 获取最新市场数据
      const marketData = await this.marketDataCache.getMarketData();
      
      // 计算基本估价结果 - 使用新的估价算法服务
      const propertyInfo = {
        city: valuationParams.location.split('-')[0] || '未知城市',
        district: valuationParams.location.split('-')[1] || '未知区域',
        area: valuationParams.area,
        rooms: 3, // 默认值
        bathrooms: 2, // 默认值
        year: valuationParams.constructionYear,
        buildingType: valuationParams.buildingType,
        floor: valuationParams.floor,
        totalFloors: valuationParams.totalFloors,
        orientation: valuationParams.orientation,
        decorationLevel: valuationParams.decorationLevel,
        nearbyFacilities: valuationParams.nearbyFacilities,
        transportation: [], // 默认值
        lotRatio: valuationParams.lotRatio,
        greenRatio: valuationParams.greenRatio,
        propertyType: valuationParams.buildingType,
        managementFee: 0, // 默认值
        parkingSpaces: 0, // 默认值
        elevator: true, // 默认值
        heating: false, // 默认值
        cooling: true, // 默认值
        securityLevel: '一般', // 默认值
        communityQuality: '一般', // 默认值
        schoolDistrict: false, // 默认值
        hospitalDistance: 0, // 默认值
        shoppingDistance: 0, // 默认值
        parkDistance: 0, // 默认值
        subwayDistance: 0, // 默认值
        busStopDistance: 0, // 默认值
        noiseLevel: 0, // 默认值
        airQuality: 0, // 默认值
        floodRisk: '低', // 默认值
        earthquakeRisk: '低', // 默认值
        futurePlan: '无', // 默认值
        marketTrend: '稳定', // 默认值
        constructionYear: valuationParams.constructionYear
      };
      
      // 使用估价算法服务计算结果
      const valuationResults = await ValuationAlgorithmService.calculate(propertyInfo);
      const basicResult = {
        totalValue: valuationResults[0]?.price || 0,
        unitPrice: valuationResults[0]?.unitPrice || 0,
        confidence: 85, // 默认置信度
        valuationMethod: valuationResults[0]?.algorithm || '综合估价法',
        factors: valuationResults[0]?.factors || [],
        propertyId: `PROP${Date.now()}`,
        valuationDate: new Date()
      };
      
      // 生成可比案例
      const comparableProperties = [];
      
      // 生成趋势分析
      const trendAnalysis = {
        yearOnYearGrowth: '5.2%',
        prediction: '稳步上涨',
        monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
          month: `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`,
          price: 12000 + Math.random() * 2000
        }))
      };
      
      // 生成影响因素分析
      const factorsAnalysis = valuationResults[0]?.factors || [];
      
      // 执行矩阵评估
      const matrixEvalResult = matrixEvaluation(valuationParams);
      
      // 构建完整估价结果
      const valuationResult: ValuationResult = {
        ...basicResult,
        propertyId: `PROP${Date.now()}`,
        valuationDate: new Date(),
        comparableProperties,
        trendAnalysis,
        evaluationDetails: {
          factorsAnalysis,
          valuationParams,
          confidenceLevel: basicResult.confidence,
          // 添加矩阵评估结果
          matrixEvaluation: {
            totalScore: matrixEvalResult.totalScore,
            rating: matrixEvalResult.rating,
            confidence: matrixEvalResult.confidence,
            dimensionScores: matrixEvalResult.dimensionScores,
            factorScores: matrixEvalResult.factorScores,
            evaluationDimensions: matrixEvalResult.evaluationDimensions
          }
        },
        // 添加市场数据影响因子
        marketDataImpact: {
          areaIndex: marketData?.areaIndexes[valuationParams.location] || 1.0,
          buildingTypeIndex: marketData?.buildingTypeIndexes[valuationParams.buildingType] || 1.0,
          marketTrend: marketData?.trends || {},
          usedBasePrice: marketData?.basePrices[valuationParams.buildingType] || 12500,
          marketSentiment: marketData?.trends.marketSentiment || '未知',
          bankAssessment: marketData?.bankAssessment,
          governmentData: marketData?.governmentData,
          marketActivity: marketData?.marketActivity,
          liquidityIndex: marketData?.liquidityIndex || 0,
          policyImpact: marketData?.policyImpact
        }
      };
      
      // 将结果存入内存缓存
      this.valuationCache.set(valuationParams, valuationResult);
      
      // 将结果存入Redis缓存，有效期24小时
      RedisCacheService.set(cacheKey, valuationResult, 24 * 60 * 60);
      
      // 使用apiClient保存估价结果到后端
      try {
        await apiClient.post('/valuation-results', valuationResult);
      } catch (error) {

        // 保存失败不影响前端返回结果
      }

      // 保存估价结果到历史记录服务
      try {
        // 将估价参数转换为PropertyInfo格式
        const propertyInfo: ValuationPropertyInfo = {
          city: valuationParams.location.split('-')[0] || '未知城市',
          district: valuationParams.location.split('-')[1] || '未知区域',
          area: valuationParams.area,
          rooms: 3, // 默认值
          bathrooms: 2, // 默认值
          year: valuationParams.constructionYear,
          buildingType: valuationParams.buildingType,
          floor: valuationParams.floor,
          totalFloors: valuationParams.totalFloors,
          orientation: valuationParams.orientation,
          decorationLevel: valuationParams.decorationLevel,
          nearbyFacilities: valuationParams.nearbyFacilities,
          transportation: [], // 默认值
          lotRatio: valuationParams.lotRatio,
          greenRatio: valuationParams.greenRatio,
          propertyType: valuationParams.buildingType,
          managementFee: 0, // 默认值
          parkingSpaces: 0, // 默认值
          elevator: true, // 默认值
          heating: false, // 默认值
          cooling: true, // 默认值
          securityLevel: '一般', // 默认值
          communityQuality: '一般', // 默认值
          schoolDistrict: false, // 默认值
          hospitalDistance: 0, // 默认值
          shoppingDistance: 0, // 默认值
          parkDistance: 0, // 默认值
          subwayDistance: 0, // 默认值
          busStopDistance: 0, // 默认值
          noiseLevel: 0, // 默认值
          airQuality: 0, // 默认值
          floodRisk: '低', // 默认值
          earthquakeRisk: '低', // 默认值
          futurePlan: '无', // 默认值
          marketTrend: '稳定', // 默认值
          constructionYear: valuationParams.constructionYear
        };

        // 保存到历史记录服务
        historyDataService.saveRecord({
          property: propertyInfo,
          results: [{
            id: `result-${Date.now()}`,
            algorithm: valuationResult.valuationMethod,
            price: valuationResult.totalValue,
            unitPrice: valuationResult.unitPrice,
            confidence: valuationResult.confidence,
            timestamp: new Date(),
            details: {
              factors: valuationResult.factors,
              trendAnalysis: valuationResult.trendAnalysis,
              comparableProperties: valuationResult.comparableProperties
            }
          }],
          models: [],
          averagePrice: valuationResult.totalValue,
          averageUnitPrice: valuationResult.unitPrice,
          tags: [valuationParams.city, valuationParams.district, valuationParams.buildingType],
          notes: '自动保存的估价结果'
        });
      } catch (error) {

        // 保存失败不影响前端返回结果
      }
      
      return valuationResult;
    } catch (error) {

      throw new Error('估价计算失败，请检查输入参数并重试');
    }
  }
  
  /**
   * 保存估价结果到数据库
   * @param result - 估价结果
   * @returns 保存后的结果
   */
  static async saveValuationResult(result: ValuationResult) {
    try {
      // 使用apiClient保存估价结果到后端
      const response = await apiClient.post('/valuation', result);
      return {
        ...result,
        id: response.data.id,
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error) {

      throw new Error('保存估价结果失败');
    }
  }
  
  /**
   * 获取历史估价记录
   * @param propertyId - 房产ID（可选）
   * @param limit - 返回记录数量
   * @returns 历史记录列表
   */
  static async getValuationHistory(propertyId: string | null = null, limit: number = 10) {
    try {
      // 使用apiClient从后端获取历史记录
      const response = await apiClient.get('/valuation/history', {
        params: {
          propertyId,
          limit
        }
      });
      
      // 转换为前端需要的格式
      const history = response.data.map((record: any) => ({
        id: record.id,
        propertyId: record.property_id,
        valuationDate: new Date(record.created_at),
        totalValue: record.total_value,
        unitPrice: record.unit_price,
        valuationMethod: record.valuation_method,
        confidence: record.confidence,
        property: record.propertyInfo
      }));
      
      return history;
    } catch (error) {
      console.error('获取历史记录失败:', error);
      
      // 降级到本地历史记录服务
      const records = historyDataService.getAllRecords();
      
      // 转换为前端需要的格式
      const history = records.map(record => ({
        id: record.id,
        propertyId: `${record.property.city}-${record.property.district}-${record.property.area}`,
        valuationDate: record.createdAt,
        totalValue: record.averagePrice,
        unitPrice: record.averageUnitPrice,
        valuationMethod: record.results[0]?.algorithm || '未知方法',
        confidence: record.results[0]?.confidence || 0,
        property: record.property
      }));
      
      // 按时间倒序排序
      history.sort((a, b) => b.valuationDate.getTime() - a.valuationDate.getTime());
      
      // 限制返回数量
      return history.slice(0, limit);
    }
  }
  
  /**
   * 获取支持的估价方法
   * @returns 估价方法列表
   */
  static async getValuationMethods() {
    try {
      // 使用apiClient从后端获取估价方法
      const response = await apiClient.get('/valuation/methods');
      return response.data;
    } catch (error) {
      console.error('获取估价方法失败:', error);
      
      // 返回默认估价方法
      return [
        { id: 'comprehensive', name: '综合估价法', description: '综合考虑多种因素的估价方法' },
        { id: 'market-comparison', name: '市场比较法', description: '基于市场成交案例的比较估价方法' },
        { id: 'income', name: '收益法', description: '基于收益能力的估价方法' },
        { id: 'cost', name: '成本法', description: '基于成本的估价方法' }
      ];
    }
  }
  
  /**
   * 获取估价参数默认值
   * @returns 默认估价参数
   */
  static getDefaultParams(): ValuationParams {
    return { ...defaultValuationParams };
  }
  
  /**
   * 验证估价参数的完整性和有效性
   * @param params - 待验证的估价参数
   * @returns 验证结果
   */
  static validateParams(params: Partial<ValuationParams>) {
    const errors: string[] = [];
    
    // 验证建筑面积
    if (params.area && (typeof params.area !== 'number' || params.area <= 0)) {
      errors.push('建筑面积必须是正数');
    }
    
    // 验证建成年份
    if (params.constructionYear && (typeof params.constructionYear !== 'number' || params.constructionYear > new Date().getFullYear())) {
      errors.push('建成年份不能大于当前年份');
    }
    
    // 验证楼层
    if (params.floor && params.totalFloors && (params.floor > params.totalFloors || params.floor <= 0)) {
      errors.push('楼层必须在1到总楼层之间');
    }
    
    // 验证绿化率
    if (params.greenRatio && (typeof params.greenRatio !== 'number' || params.greenRatio < 0 || params.greenRatio > 100)) {
      errors.push('绿化率必须在0到100之间');
    }
    
    // 验证容积率
    if (params.lotRatio && (typeof params.lotRatio !== 'number' || params.lotRatio <= 0)) {
      errors.push('容积率必须是正数');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default ValuationService;