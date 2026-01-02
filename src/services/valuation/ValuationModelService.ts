import {
  PropertyInfo,
  ValuationResult,
  ValuationAlgorithmFactory,
  ComparisonProperty,
} from '../utils/valuationAlgorithms';

// 估价模型类型定义
export interface ValuationModel {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelComparisonResult {
  models: ValuationModel[];
  results: ValuationResult[];
  comparison: {
    averagePrice: number;
    averageUnitPrice: number;
    minPrice: number;
    maxPrice: number;
    priceRange: number;
    algorithmDifferences: {
      algorithm: string;
      price: number;
      difference: number;
      differencePercentage: number;
    }[];
  };
}

export class ValuationModelService {
  private models: Map<string, ValuationModel> = new Map();
  private activeModelId: string | null = null;

  // 初始化默认模型
  constructor() {
    this.initDefaultModels();
  }

  // 初始化默认模型
  private initDefaultModels() {
    const defaultModels: ValuationModel[] = [
      {
        id: 'basic-model',
        name: '基础估价模型',
        description: '基于基础参数的估价模型，适合快速估价',
        algorithm: '基础估价法',
        parameters: {
          weightFactors: {
            year: 0.2,
            floor: 0.15,
            orientation: 0.1,
            decoration: 0.15,
            facilities: 0.2,
            transportation: 0.2,
          },
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'market-model',
        name: '市场比较模型',
        description: '基于市场成交案例的估价模型，适合精准估价',
        algorithm: '市场比较法',
        parameters: {
          comparisonCount: 5,
          maxDistance: 2000,
          weightFactors: {
            distance: 0.4,
            similarity: 0.4,
            transactionDate: 0.2,
          },
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'income-model',
        name: '收益估价模型',
        description: '基于预期收益的估价模型，适合投资性房产',
        algorithm: '收益法',
        parameters: {
          rentalYield: 0.045,
          operatingExpenseRate: 0.3,
          capitalizationRate: 0.06,
          vacancyRate: 0.1,
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'cost-model',
        name: '成本估价模型',
        description: '基于重置成本的估价模型，适合新建房产',
        algorithm: '成本法',
        parameters: {
          landCostFactor: 1.0,
          constructionCostFactor: 1.0,
          depreciationMethod: 'straight-line',
          serviceLife: 50,
        },
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultModels.forEach((model) => {
      this.models.set(model.id, model);
      if (model.isActive) {
        this.activeModelId = model.id;
      }
    });
  }

  // 获取所有模型
  getAllModels(): ValuationModel[] {
    return Array.from(this.models.values());
  }

  // 获取活跃模型
  getActiveModel(): ValuationModel | null {
    if (!this.activeModelId) {
      return null;
    }
    return this.models.get(this.activeModelId) || null;
  }

  // 根据ID获取模型
  getModelById(modelId: string): ValuationModel | null {
    return this.models.get(modelId) || null;
  }

  // 注册新模型
  registerModel(
    model: Omit<ValuationModel, 'id' | 'createdAt' | 'updatedAt'>
  ): ValuationModel {
    const newModel: ValuationModel = {
      ...model,
      id: `model-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.models.set(newModel.id, newModel);
    return newModel;
  }

  // 更新模型
  updateModel(
    modelId: string,
    updates: Partial<ValuationModel>
  ): ValuationModel | null {
    const model = this.models.get(modelId);
    if (!model) {
      return null;
    }

    const updatedModel: ValuationModel = {
      ...model,
      ...updates,
      updatedAt: new Date(),
    };

    this.models.set(modelId, updatedModel);
    return updatedModel;
  }

  // 删除模型
  deleteModel(modelId: string): boolean {
    // 不能删除活跃模型
    if (modelId === this.activeModelId) {
      return false;
    }

    return this.models.delete(modelId);
  }

  // 切换活跃模型
  setActiveModel(modelId: string): boolean {
    if (!this.models.has(modelId)) {
      return false;
    }

    // 先将所有模型设置为非活跃
    this.models.forEach((model, id) => {
      this.models.set(id, {
        ...model,
        isActive: false,
        updatedAt: new Date(),
      });
    });

    // 设置新的活跃模型
    const model = this.models.get(modelId);
    if (model) {
      this.models.set(modelId, {
        ...model,
        isActive: true,
        updatedAt: new Date(),
      });
      this.activeModelId = modelId;
      return true;
    }

    return false;
  }

  // 使用指定模型进行估价
  async calculateWithModel(
    modelId: string,
    property: PropertyInfo,
    additionalData?: {
      comparisonProperties?: ComparisonProperty[];
    }
  ): Promise<ValuationResult> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`模型 ${modelId} 不存在`);
    }

    const algorithm = ValuationAlgorithmFactory.getAlgorithm(model.algorithm);
    if (!algorithm) {
      throw new Error(`算法 ${model.algorithm} 不存在`);
    }

    return algorithm.calculate(property, additionalData?.comparisonProperties);
  }

  // 使用活跃模型进行估价
  async calculateWithActiveModel(
    property: PropertyInfo,
    additionalData?: {
      comparisonProperties?: ComparisonProperty[];
    }
  ): Promise<ValuationResult> {
    const activeModel = this.getActiveModel();
    if (!activeModel) {
      throw new Error('没有活跃的估价模型');
    }

    return this.calculateWithModel(activeModel.id, property, additionalData);
  }

  // 使用多个模型进行估价并对比结果
  async compareModels(
    modelIds: string[],
    property: PropertyInfo,
    additionalData?: {
      comparisonProperties?: ComparisonProperty[];
    }
  ): Promise<ModelComparisonResult> {
    const models = modelIds
      .map((id) => this.models.get(id))
      .filter((model): model is ValuationModel => model !== undefined);
    if (models.length === 0) {
      throw new Error('没有找到有效的估价模型');
    }

    // 使用每个模型进行估价
    const results = await Promise.all(
      models.map((model) =>
        this.calculateWithModel(model.id, property, additionalData)
      )
    );

    // 计算对比结果
    const prices = results.map((result) => result.price);
    const unitPrices = results.map((result) => result.unitPrice);
    const averagePrice = Math.round(
      prices.reduce((sum, price) => sum + price, 0) / prices.length
    );
    const averageUnitPrice = Math.round(
      unitPrices.reduce((sum, price) => sum + price, 0) / unitPrices.length
    );
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // 计算各算法与平均值的差异
    const algorithmDifferences = results.map((result) => {
      const difference = result.price - averagePrice;
      const differencePercentage = Math.round(
        (difference / averagePrice) * 100
      );
      return {
        algorithm: result.algorithm,
        price: result.price,
        difference,
        differencePercentage,
      };
    });

    return {
      models,
      results,
      comparison: {
        averagePrice,
        averageUnitPrice,
        minPrice,
        maxPrice,
        priceRange,
        algorithmDifferences,
      },
    };
  }

  // 使用所有模型进行估价并对比结果
  async compareAllModels(
    property: PropertyInfo,
    additionalData?: {
      comparisonProperties?: ComparisonProperty[];
    }
  ): Promise<ModelComparisonResult> {
    const modelIds = Array.from(this.models.keys());
    return this.compareModels(modelIds, property, additionalData);
  }

  // 导出模型配置
  exportModelConfiguration(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`模型 ${modelId} 不存在`);
    }

    return JSON.stringify(model, null, 2);
  }

  // 导入模型配置
  importModelConfiguration(configJson: string): ValuationModel {
    const modelConfig = JSON.parse(configJson);

    // 验证模型配置
    if (
      !modelConfig.name ||
      !modelConfig.description ||
      !modelConfig.algorithm
    ) {
      throw new Error('无效的模型配置');
    }

    const algorithm = ValuationAlgorithmFactory.getAlgorithm(
      modelConfig.algorithm
    );
    if (!algorithm) {
      throw new Error(`算法 ${modelConfig.algorithm} 不存在`);
    }

    // 创建新模型
    return this.registerModel({
      name: modelConfig.name,
      description: modelConfig.description,
      algorithm: modelConfig.algorithm,
      parameters: modelConfig.parameters || {},
      isActive: false,
    });
  }

  // 获取模型统计信息
  getModelStatistics() {
    const totalModels = this.models.size;
    const algorithms = Array.from(
      new Set(Array.from(this.models.values()).map((model) => model.algorithm))
    );
    const activeModel = this.getActiveModel();

    return {
      totalModels,
      algorithmTypes: algorithms.length,
      algorithms,
      activeModel: activeModel ? activeModel.name : null,
      modelBreakdown: algorithms.map((algorithm) => {
        const count = Array.from(this.models.values()).filter(
          (model) => model.algorithm === algorithm
        ).length;
        return {
          algorithm,
          count,
        };
      }),
    };
  }
}

// 创建单例实例
export const valuationModelService = new ValuationModelService();
