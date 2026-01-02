// 模型注册表 - 支持可插拔的模型架构
class ModelRegistry {
    constructor() {
        this.models = {};
        this.modelApi = {};
    }

    /**
     * 注册新模型
     * @param {string} modelType - 模型类型
     * @param {Object} modelInfo - 模型信息
     * @param {Function} modelFunc - 模型函数
     * @param {Object} apiSpec - API接口规范
     */
    registerModel(modelType, modelInfo, modelFunc, apiSpec) {
        this.models[modelType] = {
            ...modelInfo,
            model: modelFunc
        };

        this.modelApi[modelType] = apiSpec;

        return true;
    }

    /**
     * 获取模型
     * @param {string} modelType - 模型类型
     */
    getModel(modelType) {
        return this.models[modelType] || null;
    }

    /**
     * 获取模型API规范
     * @param {string} modelType - 模型类型
     */
    getModelApi(modelType) {
        return this.modelApi[modelType] || null;
    }

    /**
     * 获取所有模型
     */
    getAllModels() {
        return Object.entries(this.models).map(([modelType, modelInfo]) => ({
            model_type: modelType,
            name: modelInfo.name,
            description: modelInfo.description,
            default_weight: modelInfo.weight,
            confidence_level: modelInfo.confidence_level || 0
        }));
    }

    /**
     * 更新模型权重
     * @param {string} modelType - 模型类型
     * @param {number} weight - 新权重
     */
    updateModelWeight(modelType, weight) {
        if (this.models[modelType]) {
            this.models[modelType].weight = weight;
            return true;
        }
        return false;
    }

    /**
     * 移除模型
     * @param {string} modelType - 模型类型
     */
    removeModel(modelType) {
        if (this.models[modelType]) {
            delete this.models[modelType];
            delete this.modelApi[modelType];
            return true;
        }
        return false;
    }

    /**
     * 获取模型数量
     */
    getModelCount() {
        return Object.keys(this.models).length;
    }
}

// 导出模型注册表实例
const modelRegistry = new ModelRegistry();

module.exports = modelRegistry;