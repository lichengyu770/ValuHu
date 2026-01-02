// 知识记忆服务
// 用于管理用户估价历史、偏好学习和智能建议
import RedisCacheService from './RedisCacheService.js';

/**
 * 知识记忆服务类
 * 管理用户估价历史、偏好和智能建议
 */
class KnowledgeMemoryService {
  // 历史记录存储键名
  static HISTORY_KEY = 'knowledge:valuation:history';
  // 用户偏好存储键名
  static PREFERENCES_KEY = 'knowledge:user:preferences';
  // 智能模板存储键名
  static SMART_TEMPLATES_KEY = 'knowledge:smart:templates';
  // 学习周期（毫秒）
  static LEARNING_INTERVAL = 60 * 60 * 1000; // 1小时
  // 学习定时器
  static learningTimer = null;

  /**
   * 初始化知识记忆服务
   */
  static init() {
    // 启动定期学习任务
    this.startLearningTask();
  }

  /**
   * 启动定期学习任务
   */
  static startLearningTask() {
    if (this.learningTimer) {
      clearInterval(this.learningTimer);
    }

    this.learningTimer = setInterval(() => {
      console.log('执行知识学习任务...');
      this.learnFromHistory();
    }, this.LEARNING_INTERVAL);

    console.log(
      '知识学习任务已启动，学习周期:',
      this.LEARNING_INTERVAL / 1000 / 60,
      '分钟'
    );
  }

  /**
   * 停止定期学习任务
   */
  static stopLearningTask() {
    if (this.learningTimer) {
      clearInterval(this.learningTimer);
      this.learningTimer = null;
      console.log('知识学习任务已停止');
    }
  }

  /**
   * 保存估价历史记录
   * @param {Object} valuationData - 估价数据（包含params和result）
   * @returns {Promise<void>}
   */
  static async saveValuationHistory(valuationData) {
    try {
      // 生成唯一ID
      const historyId = `HIST${Date.now()}`;
      const historyItem = {
        id: historyId,
        ...valuationData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 从Redis获取现有历史记录
      const history = (await RedisCacheService.get(this.HISTORY_KEY)) || [];

      // 添加新记录到历史列表开头
      history.unshift(historyItem);

      // 限制历史记录数量（最多保存100条）
      if (history.length > 100) {
        history.splice(100);
      }

      // 保存更新后的历史记录
      await RedisCacheService.set(this.HISTORY_KEY, history, 30 * 24 * 60 * 60); // 保存30天

      // 立即进行一次学习
      await this.learnFromHistory();

      return historyItem;
    } catch (error) {
      console.error('保存估价历史失败:', error);
      throw new Error('保存估价历史失败');
    }
  }

  /**
   * 获取估价历史记录
   * @param {number} limit - 返回记录数量
   * @returns {Promise<Array>} - 历史记录列表
   */
  static async getValuationHistory(limit = 20) {
    try {
      const history = (await RedisCacheService.get(this.HISTORY_KEY)) || [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('获取估价历史失败:', error);
      return [];
    }
  }

  /**
   * 从历史记录中学习用户偏好
   * @returns {Promise<Object>} - 学习到的用户偏好
   */
  static async learnFromHistory() {
    try {
      const history = await this.getValuationHistory(100);
      if (history.length === 0) {
        return null;
      }

      // 分析历史数据，提取用户偏好
      const preferences = this.analyzePreferences(history);

      // 生成智能模板
      const smartTemplates = this.generateSmartTemplates(preferences, history);

      // 保存用户偏好
      await RedisCacheService.set(
        this.PREFERENCES_KEY,
        preferences,
        30 * 24 * 60 * 60
      );

      // 保存智能模板
      await RedisCacheService.set(
        this.SMART_TEMPLATES_KEY,
        smartTemplates,
        30 * 24 * 60 * 60
      );

      console.log('知识学习完成，生成了', smartTemplates.length, '个智能模板');
      return preferences;
    } catch (error) {
      console.error('从历史记录学习失败:', error);
      return null;
    }
  }

  /**
   * 分析用户偏好
   * @param {Array} history - 估价历史记录
   * @returns {Object} - 用户偏好
   */
  static analyzePreferences(history) {
    const preferences = {
      // 常用建筑类型
      commonBuildingTypes: {},
      // 常用地理位置
      commonLocations: {},
      // 常用估价方法
      commonValuationMethods: {},
      // 面积分布
      areaDistribution: { min: Infinity, max: 0, avg: 0 },
      // 建成年份分布
      yearDistribution: { min: Infinity, max: 0, avg: 0 },
      // 楼层分布
      floorDistribution: { min: Infinity, max: 0, avg: 0 },
      // 总楼层分布
      totalFloorsDistribution: { min: Infinity, max: 0, avg: 0 },
      // 装修等级偏好
      decorationLevelPreferences: {},
      // 朝向偏好
      orientationPreferences: {},
      // 周边配套偏好
      nearbyFacilitiesPreferences: {},
      // 估价置信度统计
      confidenceStats: { min: 100, max: 0, avg: 0 },
      // 历史记录数量
      historyCount: history.length,
    };

    // 计算各种统计数据
    let totalArea = 0;
    let totalYear = 0;
    let totalFloor = 0;
    let totalTotalFloors = 0;
    let totalConfidence = 0;

    history.forEach((item) => {
      const params = item.valuationParams;
      const result = item.valuationResult;

      // 统计建筑类型
      preferences.commonBuildingTypes[params.buildingType] =
        (preferences.commonBuildingTypes[params.buildingType] || 0) + 1;

      // 统计地理位置
      preferences.commonLocations[params.location] =
        (preferences.commonLocations[params.location] || 0) + 1;

      // 统计估价方法
      preferences.commonValuationMethods[params.valuationMethod] =
        (preferences.commonValuationMethods[params.valuationMethod] || 0) + 1;

      // 统计面积分布
      preferences.areaDistribution.min = Math.min(
        preferences.areaDistribution.min,
        params.area
      );
      preferences.areaDistribution.max = Math.max(
        preferences.areaDistribution.max,
        params.area
      );
      totalArea += params.area;

      // 统计建成年份分布
      preferences.yearDistribution.min = Math.min(
        preferences.yearDistribution.min,
        params.constructionYear
      );
      preferences.yearDistribution.max = Math.max(
        preferences.yearDistribution.max,
        params.constructionYear
      );
      totalYear += params.constructionYear;

      // 统计楼层分布
      preferences.floorDistribution.min = Math.min(
        preferences.floorDistribution.min,
        params.floor
      );
      preferences.floorDistribution.max = Math.max(
        preferences.floorDistribution.max,
        params.floor
      );
      totalFloor += params.floor;

      // 统计总楼层分布
      preferences.totalFloorsDistribution.min = Math.min(
        preferences.totalFloorsDistribution.min,
        params.totalFloors
      );
      preferences.totalFloorsDistribution.max = Math.max(
        preferences.totalFloorsDistribution.max,
        params.totalFloors
      );
      totalTotalFloors += params.totalFloors;

      // 统计装修等级偏好
      preferences.decorationLevelPreferences[params.decorationLevel] =
        (preferences.decorationLevelPreferences[params.decorationLevel] || 0) +
        1;

      // 统计朝向偏好
      preferences.orientationPreferences[params.orientation] =
        (preferences.orientationPreferences[params.orientation] || 0) + 1;

      // 统计周边配套偏好
      params.nearbyFacilities.forEach((facility) => {
        preferences.nearbyFacilitiesPreferences[facility] =
          (preferences.nearbyFacilitiesPreferences[facility] || 0) + 1;
      });

      // 统计置信度
      if (result && result.confidence) {
        preferences.confidenceStats.min = Math.min(
          preferences.confidenceStats.min,
          result.confidence
        );
        preferences.confidenceStats.max = Math.max(
          preferences.confidenceStats.max,
          result.confidence
        );
        totalConfidence += result.confidence;
      }
    });

    // 计算平均值
    const count = history.length;
    preferences.areaDistribution.avg = totalArea / count;
    preferences.yearDistribution.avg = totalYear / count;
    preferences.floorDistribution.avg = totalFloor / count;
    preferences.totalFloorsDistribution.avg = totalTotalFloors / count;
    preferences.confidenceStats.avg = totalConfidence / count;

    // 转换为排序后的数组，便于前端使用
    preferences.commonBuildingTypes = this.sortPreferences(
      preferences.commonBuildingTypes
    );
    preferences.commonLocations = this.sortPreferences(
      preferences.commonLocations
    );
    preferences.commonValuationMethods = this.sortPreferences(
      preferences.commonValuationMethods
    );
    preferences.decorationLevelPreferences = this.sortPreferences(
      preferences.decorationLevelPreferences
    );
    preferences.orientationPreferences = this.sortPreferences(
      preferences.orientationPreferences
    );
    preferences.nearbyFacilitiesPreferences = this.sortPreferences(
      preferences.nearbyFacilitiesPreferences
    );

    return preferences;
  }

  /**
   * 生成智能模板
   * @param {Object} preferences - 用户偏好
   * @param {Array} history - 估价历史记录
   * @returns {Array} - 智能模板列表
   */
  static generateSmartTemplates(preferences, history) {
    const templates = [];

    // 基于常用建筑类型生成模板
    preferences.commonBuildingTypes.slice(0, 3).forEach((buildingTypeItem) => {
      const buildingType = buildingTypeItem.key;

      // 为每个常用建筑类型生成模板
      const template = this.generateTemplateForBuildingType(
        buildingType,
        preferences,
        history
      );
      if (template) {
        templates.push(template);
      }
    });

    // 基于常用地理位置生成模板
    preferences.commonLocations.slice(0, 3).forEach((locationItem) => {
      const location = locationItem.key;

      // 为每个常用地理位置生成模板
      const template = this.generateTemplateForLocation(
        location,
        preferences,
        history
      );
      if (template) {
        templates.push(template);
      }
    });

    // 生成综合智能模板
    const comprehensiveTemplate = this.generateComprehensiveTemplate(
      preferences,
      history
    );
    if (comprehensiveTemplate) {
      templates.push(comprehensiveTemplate);
    }

    return templates;
  }

  /**
   * 为特定建筑类型生成模板
   * @param {string} buildingType - 建筑类型
   * @param {Object} preferences - 用户偏好
   * @param {Array} history - 估价历史记录
   * @returns {Object|null} - 生成的模板
   */
  static generateTemplateForBuildingType(buildingType, preferences, history) {
    // 筛选该建筑类型的历史记录
    const typeHistory = history.filter(
      (item) => item.valuationParams.buildingType === buildingType
    );
    if (typeHistory.length < 3) {
      return null;
    }

    // 计算该建筑类型的平均参数
    const avgParams = this.calculateAverageParams(typeHistory);

    return {
      id: `smart:building-type:${buildingType}:${Date.now()}`,
      name: `${buildingType}智能模板`,
      description: `基于${typeHistory.length}条${buildingType}估价历史生成的智能模板`,
      type: 'building-type',
      buildingType: buildingType,
      params: avgParams,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 为特定地理位置生成模板
   * @param {string} location - 地理位置
   * @param {Object} preferences - 用户偏好
   * @param {Array} history - 估价历史记录
   * @returns {Object|null} - 生成的模板
   */
  static generateTemplateForLocation(location, preferences, history) {
    // 筛选该地理位置的历史记录
    const locationHistory = history.filter(
      (item) => item.valuationParams.location === location
    );
    if (locationHistory.length < 3) {
      return null;
    }

    // 计算该地理位置的平均参数
    const avgParams = this.calculateAverageParams(locationHistory);

    return {
      id: `smart:location:${location}:${Date.now()}`,
      name: `${location}智能模板`,
      description: `基于${locationHistory.length}条${location}估价历史生成的智能模板`,
      type: 'location',
      location: location,
      params: avgParams,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 生成综合智能模板
   * @param {Object} preferences - 用户偏好
   * @param {Array} history - 估价历史记录
   * @returns {Object} - 综合智能模板
   */
  static generateComprehensiveTemplate(preferences, history) {
    // 使用所有历史记录计算平均参数
    const avgParams = this.calculateAverageParams(history);

    return {
      id: `smart:comprehensive:${Date.now()}`,
      name: '综合智能模板',
      description: `基于${history.length}条估价历史生成的综合智能模板`,
      type: 'comprehensive',
      params: avgParams,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 计算平均参数
   * @param {Array} history - 估价历史记录
   * @returns {Object} - 平均参数
   */
  static calculateAverageParams(history) {
    if (history.length === 0) {
      return {};
    }

    const paramsSum = {
      area: 0,
      constructionYear: 0,
      floor: 0,
      totalFloors: 0,
      lotRatio: 0,
      greenRatio: 0,
    };

    // 统计数值型参数
    history.forEach((item) => {
      const params = item.valuationParams;
      paramsSum.area += params.area;
      paramsSum.constructionYear += params.constructionYear;
      paramsSum.floor += params.floor;
      paramsSum.totalFloors += params.totalFloors;
      paramsSum.lotRatio += params.lotRatio;
      paramsSum.greenRatio += params.greenRatio;
    });

    // 计算平均值
    const avgParams = {
      area: Math.round(paramsSum.area / history.length),
      constructionYear: Math.round(paramsSum.constructionYear / history.length),
      floor: Math.round(paramsSum.floor / history.length),
      totalFloors: Math.round(paramsSum.totalFloors / history.length),
      lotRatio: Number((paramsSum.lotRatio / history.length).toFixed(1)),
      greenRatio: Math.round(paramsSum.greenRatio / history.length),
    };

    // 选择最常用的非数值型参数
    const mostCommon = {
      buildingType: this.getMostCommonValue(
        history.map((item) => item.valuationParams.buildingType)
      ),
      location: this.getMostCommonValue(
        history.map((item) => item.valuationParams.location)
      ),
      decorationLevel: this.getMostCommonValue(
        history.map((item) => item.valuationParams.decorationLevel)
      ),
      orientation: this.getMostCommonValue(
        history.map((item) => item.valuationParams.orientation)
      ),
      valuationMethod: this.getMostCommonValue(
        history.map((item) => item.valuationParams.valuationMethod)
      ),
    };

    // 选择最常用的周边配套
    const allFacilities = history.flatMap(
      (item) => item.valuationParams.nearbyFacilities
    );
    const facilityCounts = {};
    allFacilities.forEach((facility) => {
      facilityCounts[facility] = (facilityCounts[facility] || 0) + 1;
    });
    const sortedFacilities = Object.entries(facilityCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([facility]) => facility)
      .slice(0, 4); // 选择前4个最常用的配套

    return {
      ...avgParams,
      ...mostCommon,
      nearbyFacilities: sortedFacilities,
    };
  }

  /**
   * 获取最常用的值
   * @param {Array} values - 值数组
   * @returns {any} - 最常用的值
   */
  static getMostCommonValue(values) {
    const counts = {};
    values.forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });

    let mostCommon = null;
    let maxCount = 0;

    for (const [value, count] of Object.entries(counts)) {
      if (count > maxCount) {
        mostCommon = value;
        maxCount = count;
      }
    }

    return mostCommon;
  }

  /**
   * 对偏好进行排序
   * @param {Object} preferences - 偏好对象
   * @returns {Array} - 排序后的偏好数组
   */
  static sortPreferences(preferences) {
    return Object.entries(preferences)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  /**
   * 获取用户偏好
   * @returns {Promise<Object>} - 用户偏好
   */
  static async getUserPreferences() {
    try {
      const preferences = await RedisCacheService.get(this.PREFERENCES_KEY);
      if (!preferences) {
        // 如果没有偏好数据，尝试从历史记录学习
        return await this.learnFromHistory();
      }
      return preferences;
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return null;
    }
  }

  /**
   * 获取智能模板
   * @returns {Promise<Array>} - 智能模板列表
   */
  static async getSmartTemplates() {
    try {
      const templates = await RedisCacheService.get(this.SMART_TEMPLATES_KEY);
      if (!templates || templates.length === 0) {
        // 如果没有模板，尝试从历史记录生成
        await this.learnFromHistory();
        return (await RedisCacheService.get(this.SMART_TEMPLATES_KEY)) || [];
      }
      return templates;
    } catch (error) {
      console.error('获取智能模板失败:', error);
      return [];
    }
  }

  /**
   * 获取基于历史的智能建议
   * @param {Object} currentParams - 当前估价参数
   * @returns {Promise<Object>} - 智能建议
   */
  static async getSmartSuggestions(currentParams = {}) {
    try {
      const preferences = await this.getUserPreferences();
      const templates = await this.getSmartTemplates();

      if (!preferences) {
        return {
          suggestions: [],
          recommendedTemplates: [],
        };
      }

      // 生成智能建议
      const suggestions = this.generateSuggestions(currentParams, preferences);

      // 推荐相关模板
      const recommendedTemplates = this.recommendTemplates(
        currentParams,
        templates
      );

      return {
        suggestions,
        recommendedTemplates,
      };
    } catch (error) {
      console.error('获取智能建议失败:', error);
      return {
        suggestions: [],
        recommendedTemplates: [],
      };
    }
  }

  /**
   * 生成智能建议
   * @param {Object} currentParams - 当前估价参数
   * @param {Object} preferences - 用户偏好
   * @returns {Array} - 智能建议列表
   */
  static generateSuggestions(currentParams, preferences) {
    const suggestions = [];

    // 基于建筑类型的建议
    if (currentParams.buildingType) {
      const buildingTypeStats = preferences.commonBuildingTypes.find(
        (item) => item.key === currentParams.buildingType
      );
      if (buildingTypeStats && buildingTypeStats.value > 3) {
        suggestions.push({
          type: 'building-type',
          title: `${currentParams.buildingType}类房产估价建议`,
          content: `您经常评估${currentParams.buildingType}类房产，建议使用${preferences.commonValuationMethods[0]?.key || '市场比较法'}进行估价`,
          confidence: Math.min(90, buildingTypeStats.value * 10),
        });
      }
    }

    // 基于面积的建议
    if (currentParams.area) {
      const avgArea = preferences.areaDistribution.avg;
      if (Math.abs(currentParams.area - avgArea) > avgArea * 0.3) {
        suggestions.push({
          type: 'area',
          title: '面积异常提醒',
          content: `您当前输入的面积(${currentParams.area}㎡)与您常用的平均面积(${Math.round(avgArea)}㎡)差异较大，建议确认是否正确`,
          confidence: 75,
        });
      }
    }

    // 基于建成年份的建议
    if (currentParams.constructionYear) {
      const avgYear = preferences.yearDistribution.avg;
      if (Math.abs(currentParams.constructionYear - avgYear) > 10) {
        suggestions.push({
          type: 'construction-year',
          title: '建成年份提醒',
          content: `您当前输入的建成年份(${currentParams.constructionYear})与您常用的平均年份(${Math.round(avgYear)})差异较大，建议确认是否正确`,
          confidence: 70,
        });
      }
    }

    // 基于地理位置的建议
    if (currentParams.location) {
      const locationStats = preferences.commonLocations.find(
        (item) => item.key === currentParams.location
      );
      if (locationStats && locationStats.value > 2) {
        suggestions.push({
          type: 'location',
          title: `${locationStats.key}区域估价建议`,
          content: `您多次评估${locationStats.key}区域的房产，该区域的平均置信度为${Math.round(preferences.confidenceStats.avg)}%`,
          confidence: Math.min(85, locationStats.value * 15),
        });
      }
    }

    return suggestions;
  }

  /**
   * 推荐相关模板
   * @param {Object} currentParams - 当前估价参数
   * @param {Array} templates - 智能模板列表
   * @returns {Array} - 推荐模板列表
   */
  static recommendTemplates(currentParams, templates) {
    if (!templates || templates.length === 0) {
      return [];
    }

    // 根据当前参数与模板的匹配度排序
    return templates
      .map((template) => {
        const matchScore = this.calculateTemplateMatchScore(
          currentParams,
          template
        );
        return {
          ...template,
          matchScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // 推荐前3个模板
  }

  /**
   * 计算模板匹配分数
   * @param {Object} currentParams - 当前估价参数
   * @param {Object} template - 智能模板
   * @returns {number} - 匹配分数
   */
  static calculateTemplateMatchScore(currentParams, template) {
    let score = 0;

    // 建筑类型匹配
    if (
      currentParams.buildingType &&
      template.params.buildingType === currentParams.buildingType
    ) {
      score += 30;
    }

    // 地理位置匹配
    if (
      currentParams.location &&
      template.params.location === currentParams.location
    ) {
      score += 25;
    }

    // 估价方法匹配
    if (
      currentParams.valuationMethod &&
      template.params.valuationMethod === currentParams.valuationMethod
    ) {
      score += 20;
    }

    // 面积接近度
    if (currentParams.area && template.params.area) {
      const areaDiff = Math.abs(currentParams.area - template.params.area);
      const areaThreshold =
        Math.max(currentParams.area, template.params.area) * 0.3;
      if (areaDiff < areaThreshold) {
        score += 15 - Math.round((areaDiff / areaThreshold) * 15);
      }
    }

    // 建成年份接近度
    if (currentParams.constructionYear && template.params.constructionYear) {
      const yearDiff = Math.abs(
        currentParams.constructionYear - template.params.constructionYear
      );
      if (yearDiff < 10) {
        score += 10 - yearDiff;
      }
    }

    return score;
  }

  /**
   * 重置知识记忆
   * @returns {Promise<void>}
   */
  static async resetKnowledge() {
    try {
      await RedisCacheService.delete(this.HISTORY_KEY);
      await RedisCacheService.delete(this.PREFERENCES_KEY);
      await RedisCacheService.delete(this.SMART_TEMPLATES_KEY);
      console.log('知识记忆已重置');
    } catch (error) {
      console.error('重置知识记忆失败:', error);
    }
  }
}

// 导出知识记忆服务
export default KnowledgeMemoryService;
