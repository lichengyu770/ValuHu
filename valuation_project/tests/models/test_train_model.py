#!/usr/bin/env python3
"""
模型训练模块单元测试
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np
from sklearn.datasets import fetch_california_housing

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.models.train_model import (
    get_model,
    train_model,
    evaluate_model,
    save_model,
    load_processed_data,
    hyperparameter_tuning
)


class TestTrainModel:
    """测试模型训练模块"""
    
    def setup_class(self):
        """在所有测试前设置测试数据"""
        # 使用本地生成的随机数据，避免网络下载问题
        np.random.seed(42)
        n_samples = 2000
        n_features = 8
        
        # 生成随机特征和目标值
        X = np.random.rand(n_samples, n_features)
        y = np.random.rand(n_samples) * 5  # 目标值在0-5之间
        
        # 创建特征名称
        feature_names = [f'feature_{i}' for i in range(n_features)]
        
        self.X = pd.DataFrame(X, columns=feature_names)
        self.y = pd.Series(y, name='target')
        
        # 创建测试数据目录
        self.test_data_dir = 'test_processed_data'
        os.makedirs(self.test_data_dir, exist_ok=True)
        
        # 保存测试数据
        np.save(os.path.join(self.test_data_dir, 'X_train.npy'), self.X.values[:1500])
        np.save(os.path.join(self.test_data_dir, 'X_test.npy'), self.X.values[1500:])
        np.save(os.path.join(self.test_data_dir, 'y_train.npy'), self.y.values[:1500])
        np.save(os.path.join(self.test_data_dir, 'y_test.npy'), self.y.values[1500:])
        
        # 创建模型保存目录
        self.model_save_dir = 'test_models'
        os.makedirs(self.model_save_dir, exist_ok=True)
    
    def teardown_class(self):
        """在所有测试后清理测试数据"""
        # 清理测试数据文件
        import shutil
        if os.path.exists(self.test_data_dir):
            shutil.rmtree(self.test_data_dir)
        
        if os.path.exists(self.model_save_dir):
            shutil.rmtree(self.model_save_dir)
    
    def test_get_model(self):
        """测试获取模型实例"""
        # 测试基础模型
        model = get_model('random_forest', {'n_estimators': 50, 'random_state': 42})
        assert model is not None
        assert hasattr(model, 'fit')
        assert hasattr(model, 'predict')
        
        # 测试不同模型
        models_to_test = ['linear_regression', 'ridge', 'lasso', 'elastic_net', 'gradient_boosting']
        for model_name in models_to_test:
            # LinearRegression不支持random_state参数
            if model_name == 'linear_regression':
                model = get_model(model_name)
            else:
                model = get_model(model_name, {'random_state': 42})
            assert model is not None
    
    def test_get_unsupported_model(self):
        """测试获取不支持的模型"""
        with pytest.raises(ValueError):
            get_model('unsupported_model')
    
    def test_train_model(self):
        """测试模型训练"""
        # 获取模型 - LinearRegression不支持random_state参数
        model = get_model('linear_regression')
        
        # 训练模型
        trained_model = train_model(model, self.X.values[:1000], self.y.values[:1000])
        
        # 验证模型已训练
        assert hasattr(trained_model, 'coef_') or hasattr(trained_model, 'feature_importances_')
    
    def test_evaluate_model(self):
        """测试模型评估"""
        # 获取并训练模型 - LinearRegression不支持random_state参数
        model = get_model('linear_regression')
        trained_model = train_model(model, self.X.values[:1000], self.y.values[:1000])
        
        # 评估模型
        metrics = evaluate_model(trained_model, self.X.values[1000:2000], self.y.values[1000:2000])
        
        # 验证评估指标
        assert isinstance(metrics, dict)
        assert 'mse' in metrics
        assert 'rmse' in metrics
        assert 'mae' in metrics
        assert 'r2' in metrics
        assert metrics['mse'] >= 0
        assert metrics['rmse'] >= 0
        assert metrics['mae'] >= 0
    
    def test_save_model(self):
        """测试模型保存"""
        # 获取并训练模型 - LinearRegression不支持random_state参数
        model = get_model('linear_regression')
        trained_model = train_model(model, self.X.values[:1000], self.y.values[:1000])
        
        # 保存模型
        model_path = save_model(trained_model, self.model_save_dir, 'test_model', 'v1')
        
        # 验证模型文件存在
        assert os.path.exists(model_path)
        assert model_path.endswith('.joblib')
    
    def test_load_processed_data(self):
        """测试加载处理后的数据"""
        # 加载数据
        X_train, X_test, y_train, y_test = load_processed_data(self.test_data_dir)
        
        # 验证数据形状
        assert X_train.shape[0] == 1500
        assert X_test.shape[0] == len(self.X) - 1500
        assert y_train.shape[0] == 1500
        assert y_test.shape[0] == len(self.y) - 1500
    
    def test_hyperparameter_tuning(self):
        """测试超参数调优"""
        # 使用随机搜索进行简单调优
        best_model, best_params = hyperparameter_tuning(
            'ridge',
            self.X.values[:1000], self.y.values[:1000],
            param_grid={'alpha': [0.1, 1.0, 10.0]},
            tuning_method='random_search',
            n_iter=2
        )
        
        # 验证调优结果
        assert best_model is not None
        assert isinstance(best_params, dict)
        assert 'alpha' in best_params
    
    def test_hyperparameter_tuning_grid_search(self):
        """测试网格搜索超参数调优"""
        # 使用网格搜索进行简单调优
        best_model, best_params = hyperparameter_tuning(
            'ridge',
            self.X.values[:1000], self.y.values[:1000],
            param_grid={'alpha': [0.1, 1.0]},
            tuning_method='grid_search',
            cv=2
        )
        
        # 验证调优结果
        assert best_model is not None
        assert isinstance(best_params, dict)
        assert 'alpha' in best_params
