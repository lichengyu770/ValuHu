import { ValuationParams, SmartSuggestion } from '../types/valuation';

// 定义市场趋势数据接口
export interface MarketTrend {
  averagePrice: number;
  priceChange: number;
  transactionVolume: number;
  region: string;
  propertyType: string;
}

// 智能建议服务类
class SmartSuggestionService {
  // 生成智能建议
  generateSmartSuggestions(params: ValuationParams): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // 获取市场趋势数据（模拟数据）
    const marketTrend = this.getMarketTrend(params.location, params.propertyType);
    
    // 基于房产面积的建议
    if (params.area > 0) {
      const areaSuggestion = this.generateAreaSuggestion(params, marketTrend);
      if (areaSuggestion) {
        suggestions.push(areaSuggestion);
      }
    }
    
    // 基于房龄的建议
    if (params.yearBuilt) {
      const yearBuiltSuggestion = this.generateYearBuiltSuggestion(params, marketTrend);
      if (yearBuiltSuggestion) {
        suggestions.push(yearBuiltSuggestion);
      }
    }
    
    // 基于位置的建议
    if (params.location) {
      const locationSuggestion = this.generateLocationSuggestion(params, marketTrend);
      if (locationSuggestion) {
        suggestions.push(locationSuggestion);
      }
    }
    
    // 基于楼层的建议
    if (params.floorLevel && params.totalFloors) {
      const floorSuggestion = this.generateFloorSuggestion(params, marketTrend);
      if (floorSuggestion) {
        suggestions.push(floorSuggestion);
      }
    }
    
    // 基于市场趋势的建议
    const marketTrendSuggestion = this.generateMarketTrendSuggestion(params, marketTrend);
    if (marketTrendSuggestion) {
      suggestions.push(marketTrendSuggestion);
    }
    
    return suggestions;
  }
  
  // 获取市场趋势数据（模拟实现）
  private getMarketTrend(region: string, propertyType: string): MarketTrend {
    // 模拟不同地区和房产类型的市场趋势数据
    const mockTrends: Record<string, Record<string, MarketTrend>> = {
      '北京市': {
        '住宅': {
          averagePrice: 65000,
          priceChange: 2.5,
          transactionVolume: 1200,
          region: '北京市',
          propertyType: '住宅'
        },
        '公寓': {
          averagePrice: 58000,
          priceChange: 1.8,
          transactionVolume: 850,
          region: '北京市',
          propertyType: '公寓'
        },
        '别墅': {
          averagePrice: 120000,
          priceChange: 3.2,
          transactionVolume: 280,
          region: '北京市',
          propertyType: '别墅'
        }
      },
      '上海市': {
        '住宅': {
          averagePrice: 72000,
          priceChange: 3.1,
          transactionVolume: 1500,
          region: '上海市',
          propertyType: '住宅'
        },
        '公寓': {
          averagePrice: 65000,
          priceChange: 2.3,
          transactionVolume: 980,
          region: '上海市',
          propertyType: '公寓'
        }
      },
      '广州市': {
        '住宅': {
          averagePrice: 48000,
          priceChange: 2.8,
          transactionVolume: 1100,
          region: '广州市',
          propertyType: '住宅'
        }
      },
      '深圳市': {
        '住宅': {
          averagePrice: 85000,
          priceChange: 3.5,
          transactionVolume: 1300,
          region: '深圳市',
          propertyType: '住宅'
        }
      }
    };
    
    // 默认市场趋势
    const defaultTrend: MarketTrend = {
      averagePrice: 50000,
      priceChange: 2.0,
      transactionVolume: 1000,
      region: region || '全国',
      propertyType: propertyType || '住宅'
    };
    
    // 返回对应地区和房产类型的市场趋势，否则返回默认值
    return mockTrends[region]?.[propertyType] || defaultTrend;
  }
  
  // 生成基于面积的建议
  private generateAreaSuggestion(params: ValuationParams, marketTrend: MarketTrend): SmartSuggestion | null {
    if (!params.area) return null;
    
    let title = '';
    let content = '';
    let confidence = 0.8;
    const suggestedParams: Partial<ValuationParams> = {};
    
    // 根据不同房产类型的面积建议
    if (params.propertyType === '住宅') {
      if (params.area < 60) {
        title = '小户型增值潜力建议';
        content = `根据${marketTrend.region}市场趋势，小户型住宅（<60㎡）在过去12个月价格上涨了${marketTrend.priceChange}%，建议关注周边交通便利度和配套设施，这些因素对小户型价值影响较大。`;
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '交通便利', '配套完善'];
      } else if (params.area > 144) {
        title = '大户型市场定位建议';
        content = `根据${marketTrend.region}市场趋势，大户型住宅（>144㎡）交易活跃度相对较低，建议突出房屋的舒适性和高端配套，以吸引改善型购房者。`;
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '舒适性高', '高端配套'];
        confidence = 0.75;
      }
    }
    
    return title ? {
      id: `area-${Date.now()}`,
      title,
      content,
      confidence,
      suggestedParams,
      marketTrend
    } : null;
  }
  
  // 生成基于房龄的建议
  private generateYearBuiltSuggestion(params: ValuationParams, marketTrend: MarketTrend): SmartSuggestion | null {
    if (!params.yearBuilt) return null;
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - params.yearBuilt;
    let title = '';
    let content = '';
    let confidence = 0.85;
    const suggestedParams: Partial<ValuationParams> = {};
    
    if (age < 5) {
      title = '次新房市场优势';
      content = `根据${marketTrend.region}市场数据，房龄5年以内的次新房价格比同区域平均价格高${marketTrend.priceChange + 1.5}%，建议突出房屋的新颖性和现代化设施。`;
      suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '房龄新', '现代化设施'];
    } else if (age > 20) {
      title = '老房改造建议';
      content = `根据${marketTrend.region}市场趋势，房龄超过20年的老房价格相对较低，但通过改造升级可以提升10-15%的价值。建议关注装修质量和结构安全性。`;
      suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '装修良好', '结构安全'];
      confidence = 0.7;
    }
    
    return title ? {
      id: `year-${Date.now()}`,
      title,
      content,
      confidence,
      suggestedParams,
      marketTrend
    } : null;
  }
  
  // 生成基于位置的建议
  private generateLocationSuggestion(params: ValuationParams, marketTrend: MarketTrend): SmartSuggestion | null {
    if (!params.location) return null;
    
    let title = '';
    let content = '';
    let confidence = 0.8;
    const suggestedParams: Partial<ValuationParams> = {};
    
    // 模拟位置分析
    const primeLocations = ['北京市朝阳区', '上海市浦东新区', '深圳市南山区', '广州市天河区'];
    const isPrimeLocation = primeLocations.some(location => params.location?.includes(location));
    
    if (isPrimeLocation) {
      title = '核心区域价值优势';
      content = `${params.location}属于核心区域，市场需求旺盛，价格稳定性高。建议突出地理位置优势和周边高端配套。`;
      suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '核心地段', '高端配套'];
    } else {
      title = '非核心区域增值潜力';
      content = `${params.location}属于非核心区域，目前价格相对较低，但随着城市发展，未来增值潜力较大。建议关注区域规划和基础设施建设。`;
      suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '规划利好', '基础设施完善'];
      confidence = 0.7;
    }
    
    return title ? {
      id: `location-${Date.now()}`,
      title,
      content,
      confidence,
      suggestedParams,
      marketTrend
    } : null;
  }
  
  // 生成基于楼层的建议
  private generateFloorSuggestion(params: ValuationParams, marketTrend: MarketTrend): SmartSuggestion | null {
    if (!params.floorLevel || !params.totalFloors) return null;
    
    const floorRatio = params.floorLevel / params.totalFloors;
    let title = '';
    let content = '';
    let confidence = 0.8;
    const suggestedParams: Partial<ValuationParams> = {};
    
    if (params.totalFloors <= 6) {
      // 多层建筑
      if (params.floorLevel === 1) {
        title = '多层建筑一层优势';
        content = '多层建筑的一层适合有老人或小孩的家庭，建议突出便利性和可能的花园/庭院优势。';
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '便利性高', '带花园'];
      } else if (params.floorLevel === params.totalFloors) {
        title = '多层建筑顶层建议';
        content = '多层建筑的顶层通常采光通风好，但夏季可能较热，建议关注隔热措施和是否有阁楼。';
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '采光通风好', '带阁楼'];
        confidence = 0.75;
      }
    } else {
      // 高层建筑
      if (floorRatio > 0.7) {
        title = '高层建筑高楼层优势';
        content = '高层建筑的高楼层（70%以上）通常视野好、噪音小，建议突出景观优势和居住舒适度。';
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '视野好', '噪音小'];
      } else if (floorRatio < 0.3) {
        title = '高层建筑低楼层建议';
        content = '高层建筑的低楼层（30%以下）上下楼方便，但可能受到噪音和采光影响，建议关注窗户外的景观和隔音措施。';
        suggestedParams.propertyFeatures = [...(params.propertyFeatures || []), '上下楼方便', '隔音良好'];
        confidence = 0.7;
      }
    }
    
    return title ? {
      id: `floor-${Date.now()}`,
      title,
      content,
      confidence,
      suggestedParams,
      marketTrend
    } : null;
  }
  
  // 生成基于市场趋势的建议
  private generateMarketTrendSuggestion(params: ValuationParams, marketTrend: MarketTrend): SmartSuggestion | null {
    let title = '';
    let content = '';
    let confidence = 0.9;
    const suggestedParams: Partial<ValuationParams> = {};
    
    if (marketTrend.priceChange > 3) {
      title = '市场上涨趋势建议';
      content = `根据${marketTrend.region}${marketTrend.propertyType}市场数据，过去12个月价格上涨了${marketTrend.priceChange}%，市场处于上升通道，建议关注交易时机和市场流动性。`;
      suggestedParams.marketTrends = {
        ...(params.marketTrends || {}),
        averagePrice: marketTrend.averagePrice,
        priceChange: marketTrend.priceChange,
        transactionVolume: marketTrend.transactionVolume
      };
    } else if (marketTrend.priceChange < 0) {
      title = '市场调整期策略';
      content = `根据${marketTrend.region}${marketTrend.propertyType}市场数据，过去12个月价格下跌了${Math.abs(marketTrend.priceChange)}%，市场处于调整期，建议关注优质房源和长期投资价值。`;
      suggestedParams.marketTrends = {
        ...(params.marketTrends || {}),
        averagePrice: marketTrend.averagePrice,
        priceChange: marketTrend.priceChange,
        transactionVolume: marketTrend.transactionVolume
      };
      confidence = 0.75;
    } else {
      title = '稳定市场建议';
      content = `根据${marketTrend.region}${marketTrend.propertyType}市场数据，过去12个月价格稳定上涨了${marketTrend.priceChange}%，建议关注房屋的性价比和居住体验。`;
      suggestedParams.marketTrends = {
        ...(params.marketTrends || {}),
        averagePrice: marketTrend.averagePrice,
        priceChange: marketTrend.priceChange,
        transactionVolume: marketTrend.transactionVolume
      };
    }
    
    return {
      id: `trend-${Date.now()}`,
      title,
      content,
      confidence,
      suggestedParams,
      marketTrend
    };
  }
  
  // 获取市场趋势预测（模拟数据）
  getMarketTrendPrediction(): { predictedPriceChange: number; confidence: number } {
    // 模拟市场趋势预测
    return {
      predictedPriceChange: (Math.random() - 0.5) * 10, // -5% 到 5% 之间的随机值
      confidence: 0.7 + Math.random() * 0.25 // 70% 到 95% 之间的置信度
    };
  }
}

// 创建并导出智能建议服务实例
const smartSuggestionService = new SmartSuggestionService();

export default smartSuggestionService;
export { SmartSuggestionService };
