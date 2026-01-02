// 精选内容数据模型

// 精选内容类型枚举
export enum FeaturedContentType {
  VALUATION_MODEL = 'valuation_model',
  REPORT_TEMPLATE = 'report_template',
  VALUATION_CASE = 'valuation_case',
  MARKET_TREND = 'market_trend',
  VALUATION_TIP = 'valuation_tip',
}

// 精选内容数据模型接口
export interface FeaturedContentData {
  id?: string;
  type: FeaturedContentType;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  url: string;
  rating?: number;
  usageCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isManual?: boolean;
  manualExpiryDate?: Date | string | null;
}

// 精选内容类
export class FeaturedContent {
  id: string;
  type: FeaturedContentType;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  url: string;
  rating: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isManual: boolean;
  manualExpiryDate: Date | null;

  constructor(data: FeaturedContentData) {
    this.id = data.id || `featured-${data.type}-${Date.now()}`;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.content = data.content;
    this.thumbnail = data.thumbnail;
    this.url = data.url;
    this.rating = data.rating || 0;
    this.usageCount = data.usageCount || 0;
    this.createdAt =
      typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt || new Date();
    this.updatedAt =
      typeof data.updatedAt === 'string'
        ? new Date(data.updatedAt)
        : data.updatedAt || new Date();
    this.isManual = data.isManual || false;
    this.manualExpiryDate = data.manualExpiryDate
      ? new Date(data.manualExpiryDate)
      : null;
  }
}

// 精选内容服务
export class FeaturedContentService {
  private storageKey: string = 'featured-content';

  constructor() {
    this.initializeDefaultContent();
  }

  // 初始化默认精选内容
  initializeDefaultContent(): void {
    const existingContent = this.getAllFeaturedContent();
    if (existingContent.length === 0) {
      const defaultContent = [
        // 精选估价模型
        new FeaturedContent({
          type: FeaturedContentType.VALUATION_MODEL,
          title: '市场比较法',
          description:
            '最常用的估价方法，通过比较相似房产的交易价格来估算房产价值',
          content:
            '市场比较法是一种常用的房产估价方法，通过比较近期交易的相似房产的价格，结合房产的差异因素进行调整，从而估算出被估价房产的市场价值。',
          thumbnail: '/src/assets/images/market-comparison.jpg',
          url: '/valuation?method=market-comparison',
          rating: 4.8,
          usageCount: 1250,
        }),
        new FeaturedContent({
          type: FeaturedContentType.VALUATION_MODEL,
          title: '收益法',
          description: '适合商业房产的估价方法，通过预测未来收益来估算房产价值',
          content:
            '收益法是一种基于未来收益的估价方法，通过预测房产未来的收益能力，结合资本化率或折现率，计算出房产的现值。',
          thumbnail: '/src/assets/images/income-method.jpg',
          url: '/valuation?method=income',
          rating: 4.6,
          usageCount: 890,
        }),
        new FeaturedContent({
          type: FeaturedContentType.VALUATION_MODEL,
          title: '成本法',
          description: '适合新建房产的估价方法，通过计算重置成本来估算房产价值',
          content:
            '成本法是一种基于重置成本的估价方法，通过计算重新建造类似房产所需的成本，减去折旧，从而估算出房产的价值。',
          thumbnail: '/src/assets/images/cost-method.jpg',
          url: '/valuation?method=cost',
          rating: 4.4,
          usageCount: 670,
        }),
        // 精选报告模板
        new FeaturedContent({
          type: FeaturedContentType.REPORT_TEMPLATE,
          title: '基础估价报告',
          description: '包含基本房产信息和估价结果的报告模板',
          content:
            '基础估价报告模板，包含房产基本信息、估价结果和简单的分析，适合快速生成估价报告。',
          thumbnail: '/src/assets/images/basic-report.jpg',
          url: '/report?template=basic',
          rating: 4.7,
          usageCount: 2130,
        }),
        new FeaturedContent({
          type: FeaturedContentType.REPORT_TEMPLATE,
          title: '详细估价报告',
          description: '包含详细房产信息和估价过程的报告模板',
          content:
            '详细估价报告模板，包含房产基本信息、估价过程、结果分析和建议，适合专业用户使用。',
          thumbnail: '/src/assets/images/detailed-report.jpg',
          url: '/report?template=detailed',
          rating: 4.9,
          usageCount: 1560,
        }),
        // 热门估价案例
        new FeaturedContent({
          type: FeaturedContentType.VALUATION_CASE,
          title: '长沙市岳麓区某住宅估价案例',
          description: '位于长沙市岳麓区的一套120平方米住宅的估价案例',
          content:
            '本案例展示了如何使用市场比较法对长沙市岳麓区的一套120平方米住宅进行估价，包括相似房产的选择、调整因素的确定和最终价值的计算。',
          thumbnail: '/src/assets/images/case-changsha.jpg',
          url: '/valuation/case/1',
          rating: 4.5,
          usageCount: 980,
        }),
        // 市场趋势精选
        new FeaturedContent({
          type: FeaturedContentType.MARKET_TREND,
          title: '2025年上半年全国房价走势',
          description: '2025年上半年全国主要城市的房价走势分析',
          content:
            '2025年上半年，全国主要城市的房价呈现稳中有涨的趋势，其中一线城市涨幅较小，二线城市涨幅较大，三线城市保持稳定。',
          thumbnail: '/src/assets/images/trend-2025.jpg',
          url: '/market/trend/2025-h1',
          rating: 4.6,
          usageCount: 1890,
        }),
        // 估价技巧精选
        new FeaturedContent({
          type: FeaturedContentType.VALUATION_TIP,
          title: '如何选择合适的估价方法',
          description: '根据房产类型和市场情况选择合适的估价方法',
          content:
            '选择合适的估价方法是保证估价准确性的关键。本文介绍了如何根据房产类型、市场情况和估价目的选择合适的估价方法。',
          thumbnail: '/src/assets/images/tip-method-selection.jpg',
          url: '/tips/method-selection',
          rating: 4.7,
          usageCount: 1450,
        }),
      ];

      this.saveFeaturedContent(defaultContent);
    }
  }

  // 保存精选内容到本地存储
  saveFeaturedContent(contentList: FeaturedContent[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(contentList));
  }

  // 获取所有精选内容
  getAllFeaturedContent(): FeaturedContent[] {
    const contentJson = localStorage.getItem(this.storageKey);
    if (!contentJson) {
      return [];
    }

    try {
      const contentList = JSON.parse(contentJson);
      return contentList.map((content: any) => new FeaturedContent(content));
    } catch (error) {
      console.error('Failed to parse featured content:', error);
      return [];
    }
  }

  // 根据类型获取精选内容
  getFeaturedContentByType(
    type: FeaturedContentType,
    limit: number = 10
  ): FeaturedContent[] {
    const allContent = this.getAllFeaturedContent();
    return allContent
      .filter((content) => content.type === type)
      .sort((a, b) => b.rating - a.rating || b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // 获取推荐的精选内容
  getRecommendedContent(limit: number = 6): FeaturedContent[] {
    const allContent = this.getAllFeaturedContent();
    return allContent
      .sort((a, b) => b.rating - a.rating || b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // 添加精选内容
  addFeaturedContent(content: FeaturedContentData): FeaturedContent {
    const allContent = this.getAllFeaturedContent();
    const newContent = new FeaturedContent(content);
    allContent.push(newContent);
    this.saveFeaturedContent(allContent);
    return newContent;
  }

  // 更新精选内容
  updateFeaturedContent(
    id: string,
    updates: Partial<FeaturedContentData>
  ): FeaturedContent | null {
    const allContent = this.getAllFeaturedContent();
    const index = allContent.findIndex((content) => content.id === id);
    if (index === -1) {
      return null;
    }

    const updatedContent = new FeaturedContent({
      ...allContent[index],
      ...updates,
      updatedAt: new Date(),
    });
    allContent[index] = updatedContent;
    this.saveFeaturedContent(allContent);
    return updatedContent;
  }

  // 删除精选内容
  deleteFeaturedContent(id: string): boolean {
    const allContent = this.getAllFeaturedContent();
    const filteredContent = allContent.filter((content) => content.id !== id);
    if (filteredContent.length === allContent.length) {
      return false;
    }

    this.saveFeaturedContent(filteredContent);
    return true;
  }

  // 增加使用次数
  incrementUsageCount(id: string): FeaturedContent | null {
    const content = this.getFeaturedContentById(id);
    if (content) {
      return this.updateFeaturedContent(id, {
        usageCount: content.usageCount + 1,
      });
    }
    return null;
  }

  // 根据ID获取精选内容
  getFeaturedContentById(id: string): FeaturedContent | null {
    const allContent = this.getAllFeaturedContent();
    return allContent.find((content) => content.id === id) || null;
  }

  // 获取手动推荐的内容
  getManualFeaturedContent(): FeaturedContent[] {
    const allContent = this.getAllFeaturedContent();
    const now = new Date();
    return allContent.filter((content) => {
      if (!content.isManual) return false;
      if (!content.manualExpiryDate) return true;
      return content.manualExpiryDate > now;
    });
  }

  // 更新推荐内容（根据使用频率和评分）
  updateRecommendedContent(): void {
    // 这里可以实现更复杂的推荐算法
    // 目前使用简单的排序算法
    const allContent = this.getAllFeaturedContent();
    allContent.sort(
      (a, b) => b.rating - a.rating || b.usageCount - a.usageCount
    );
    this.saveFeaturedContent(allContent);
  }
}

// 导出单例实例
export default new FeaturedContentService();
