#!/usr/bin/env python3
"""
集成测试 - 完整的模型训练和预测流程测试
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.train_model import (
    get_model, train_model, evaluate_model, save_model,
    load_processed_data, hyperparameter_tuning,
    ModelManager, get_cv_scores, get_learning_curve
)
from src.models.predict_model import (
    load_model, predict, save_predictions,
    PredictionService, estimate_property_value
)


class TestIntegration:
    """集成测试类"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """测试设置"""
        np.random.seed(42)
        n_samples = 500
        n_features = 8
        
        self.X = np.random.rand(n_samples, n_features) * 10
        self.y = np.random.rand(n_samples) * 100 + 50
        
        self.test_data_dir = 'test_integration_data'
        self.test_model_dir = 'test_integration_models'
        os.makedirs(self.test_data_dir, exist_ok=True)
        os.makedirs(self.test_model_dir, exist_ok=True)
        
        np.save(os.path.join(self.test_data_dir, 'X_train.npy'), self.X[:400])
        np.save(os.path.join(self.test_data_dir, 'X_test.npy'), self.X[400:])
        np.save(os.path.join(self.test_data_dir, 'y_train.npy'), self.y[:400])
        np.save(os.path.join(self.test_data_dir, 'y_test.npy'), self.y[400:])
        
        yield
        
        import shutil
        if os.path.exists(self.test_data_dir):
            shutil.rmtree(self.test_data_dir)
        if os.path.exists(self.test_model_dir):
            shutil.rmtree(self.test_model_dir)
    
    def test_complete_training_pipeline(self):
        """测试完整的训练流程"""
        X_train, X_test = self.X[:400], self.X[400:]
        y_train, y_test = self.y[:400], self.y[400:]
        
        model = get_model('random_forest', {'n_estimators': 50, 'random_state': 42})
        trained_model = train_model(model, X_train, y_train)
        metrics = evaluate_model(trained_model, X_test, y_test)
        
        assert metrics['r2'] > 0, "R²分数应该大于0"
        assert metrics['rmse'] > 0, "RMSE应该大于0"
        assert metrics['mae'] > 0, "MAE应该大于0"
        
        print(f"\n模型评估结果:")
        print(f"R²: {metrics['r2']:.4f}")
        print(f"RMSE: {metrics['rmse']:.4f}")
        print(f"MAE: {metrics['mae']:.4f}")
    
    def test_model_manager(self):
        """测试模型管理器"""
        model_configs = {
            'random_forest': {'n_estimators': 50, 'random_state': 42},
            'ridge': {'alpha': 1.0, 'random_state': 42},
            'linear_regression': {}
        }
        
        manager = ModelManager(model_configs)
        
        X_train, X_test = self.X[:400], self.X[400:]
        y_train, y_test = self.y[:400], self.y[400:]
        
        results = manager.train_all(X_train, y_train, X_test, y_test)
        
        assert len(results) > 0, "应该训练了至少一个模型"
        
        best_name, best_model, best_score = manager.get_best_model()
        assert best_name is not None, "应该有最佳模型"
        assert best_score > 0, "最佳分数应该大于0"
        
        summary = manager.get_model_summary()
        assert 'random_forest' in summary or 'ridge' in summary, "摘要应该包含模型名称"
        
        print(f"\n最佳模型: {best_name}")
        print(f"最佳R²分数: {best_score:.4f}")
    
    def test_model_comparison(self):
        """测试模型比较功能"""
        model_configs = {
            'random_forest': {'n_estimators': 30, 'random_state': 42},
            'ridge': {'alpha': 0.5, 'random_state': 42}
        }
        
        manager = ModelManager(model_configs)
        
        X_train, X_test = self.X[:400], self.X[400:]
        y_train, y_test = self.y[:400], self.y[400:]
        
        manager.train_all(X_train, y_train, X_test, y_test)
        
        comparison_df = manager.compare_models(sort_by='r2', ascending=False)
        
        assert not comparison_df.empty, "比较结果不应为空"
        assert 'model_name' in comparison_df.columns, "比较结果应包含模型名称列"
        assert 'r2' in comparison_df.columns, "比较结果应包含R²列"
        
        print("\n模型比较结果:")
        print(comparison_df.to_string(index=False))
    
    def test_cross_validation(self):
        """测试交叉验证"""
        model = get_model('ridge', {'alpha': 1.0, 'random_state': 42})
        
        X_train, y_train = self.X[:400], self.y[:400]
        
        cv_results = get_cv_scores(model, X_train, y_train, cv=3, scoring='r2')
        
        assert 'mean_score' in cv_results, "交叉验证结果应包含平均分数"
        assert 'std_score' in cv_results, "交叉验证结果应包含标准差"
        assert cv_results['mean_score'] > -1, "平均分数应该在合理范围内"
        
        print(f"\n3折交叉验证结果:")
        print(f"平均R²分数: {cv_results['mean_score']:.4f}")
        print(f"标准差: {cv_results['std_score']:.4f}")
    
    def test_model_saving_and_loading(self):
        """测试模型保存和加载"""
        X_train, y_train = self.X[:400], self.y[:400]
        
        model = get_model('ridge', {'alpha': 1.0, 'random_state': 42})
        trained_model = train_model(model, X_train, y_train)
        
        model_path = save_model(trained_model, self.test_model_dir, 'ridge_test', 'v1')
        
        assert os.path.exists(model_path), "模型文件应该存在"
        
        loaded_model = load_model(self.test_model_dir, 'ridge_test_model_v1.joblib')
        
        predictions = loaded_model.predict(X_train[:5])
        assert len(predictions) == 5, "预测数量应该正确"
        
        print(f"\n模型保存路径: {model_path}")
        print(f"预测示例: {predictions}")
    
    def test_prediction_service(self):
        """测试预测服务"""
        X_train, y_train = self.X[:400], self.y[:400]
        
        model = get_model('random_forest', {'n_estimators': 30, 'random_state': 42})
        trained_model = train_model(model, X_train, y_train)
        
        model_path = save_model(trained_model, self.test_model_dir, 'rf_service', 'v1')
        
        service = PredictionService(self.test_model_dir, 'rf_service', lazy_load=False)
        
        single_sample = self.X[450]
        result = service.predict(single_sample)
        
        assert 'prediction' in result, "预测结果应包含prediction字段"
        assert 'model_used' in result, "预测结果应包含model_used字段"
        
        batch_result = service.batch_predict(self.X[400:450])
        assert len(batch_result) == 50, "批量预测数量应该正确"
        
        model_info = service.get_model_info()
        assert 'model_type' in model_info, "模型信息应包含model_type"
        
        print(f"\n单样本预测结果: {result['prediction']:.2f}万元")
        print(f"模型类型: {model_info['model_type']}")
    
    def test_property_estimation(self):
        """测试房产估价"""
        X_train, y_train = self.X[:400], self.y[:400]
        
        model = get_model('ridge', {'alpha': 1.0, 'random_state': 42})
        trained_model = train_model(model, X_train, y_train)
        
        model_path = save_model(trained_model, self.test_model_dir, 'house_estimator', 'v1')
        
        service = PredictionService(self.test_model_dir, 'house_estimator', lazy_load=False)
        
        property_features = {
            'MedInc': 5.0,
            'HouseAge': 20,
            'AveRooms': 5,
            'AveBedrms': 2,
            'Population': 1000,
            'AveOccup': 3,
            'Latitude': 34.0,
            'Longitude': -118.0
        }
        
        result = estimate_property_value(service, property_features)
        
        assert 'prediction' in result, "估价结果应包含prediction字段"
        assert 'formatted_value' in result, "估价结果应包含formatted_value字段"
        
        print(f"\n房产估价结果:")
        print(f"预测价格: {result['prediction']:.2f}万元")
        print(f"格式化结果: {result['formatted_value']}")
    
    def test_model_with_different_params(self):
        """测试不同模型参数"""
        models_to_test = [
            ('random_forest', {'n_estimators': 20, 'max_depth': 5, 'random_state': 42}),
            ('gradient_boosting', {'n_estimators': 20, 'learning_rate': 0.1, 'random_state': 42}),
            ('elastic_net', {'alpha': 0.5, 'l1_ratio': 0.5, 'random_state': 42}),
            ('ridge', {'alpha': 1.0, 'random_state': 42}),
            ('lasso', {'alpha': 0.1, 'random_state': 42}),
            ('svr', {'kernel': 'rbf', 'C': 1.0}),
        ]
        
        X_train, X_test = self.X[:400], self.X[400:]
        y_train, y_test = self.y[:400], self.y[400:]
        
        results = {}
        for model_name, params in models_to_test:
            try:
                model = get_model(model_name, params)
                trained = train_model(model, X_train, y_train)
                metrics = evaluate_model(trained, X_test, y_test)
                results[model_name] = metrics
                print(f"{model_name}: R²={metrics['r2']:.4f}, RMSE={metrics['rmse']:.4f}")
            except Exception as e:
                print(f"{model_name}: 训练失败 - {str(e)}")
        
        successful_models = [k for k, v in results.items() if v['r2'] > 0]
        assert len(successful_models) > 0, "至少应该有一个模型训练成功"
    
    def test_edge_cases(self):
        """测试边界情况"""
        X_train, y_train = self.X[:400], self.y[:400]
        
        service = PredictionService(self.test_model_dir, 'rf_edge', lazy_load=False)
        
        model = get_model('ridge', {'alpha': 1.0, 'random_state': 42})
        trained_model = train_model(model, X_train, y_train)
        save_model(trained_model, self.test_model_dir, 'rf_edge', 'v1')
        
        single_sample = self.X[450]
        result = service.predict(single_sample)
        assert result['prediction'] > 0, "预测值应该为正数"
        
        feature_names = [f'feature_{i}' for i in range(8)]
        property_features = dict(zip(feature_names, single_sample))
        result = estimate_property_value(service, property_features)
        assert result['prediction'] > 0, "房产估价应该为正数"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
