#!/usr/bin/env python3
"""
模型训练脚本

该脚本负责从processed目录读取预处理好的数据，训练模型，并将训练好的模型保存到models目录。
支持多种算法、超参数调优、模型比较和自动选择最佳模型。
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, Tuple, List
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.metrics import (
    mean_squared_error, 
    mean_absolute_error, 
    r2_score,
    explained_variance_score,
    max_error,
    median_absolute_error
)
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, train_test_split, cross_val_score, learning_curve
from sklearn.base import RegressorMixin, BaseEstimator

# 导入日志系统
from src.utils.logging import get_logger

# 尝试导入高级算法（如果可用）
try:
    import xgboost as xgb
    has_xgboost = True
except ImportError:
    has_xgboost = False

try:
    import lightgbm as lgb
    has_lightgbm = True
except ImportError:
    has_lightgbm = False

# 初始化日志记录器
logger = get_logger(__name__)


def load_processed_data(processed_data_path: str) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    从processed目录读取预处理好的数据
    
    Args:
        processed_data_path: 预处理数据目录路径
        
    Returns:
        训练集特征、测试集特征、训练集目标、测试集目标
    """
    logger.info(f"从 {processed_data_path} 读取数据...")
    
    # 读取数据
    X_train = np.load(os.path.join(processed_data_path, 'X_train.npy'))
    X_test = np.load(os.path.join(processed_data_path, 'X_test.npy'))
    y_train = np.load(os.path.join(processed_data_path, 'y_train.npy'))
    y_test = np.load(os.path.join(processed_data_path, 'y_test.npy'))
    
    logger.info(f"训练集特征形状: {X_train.shape}")
    logger.info(f"测试集特征形状: {X_test.shape}")
    logger.info(f"训练集目标形状: {y_train.shape}")
    logger.info(f"测试集目标形状: {y_test.shape}")
    
    return X_train, X_test, y_train, y_test


def get_model(model_name: str, params: Optional[Dict[str, Any]] = None) -> RegressorMixin:
    """
    获取指定的模型实例
    
    Args:
        model_name: 模型名称
        params: 模型参数
        
    Returns:
        模型实例
    """
    if params is None:
        params = {}
    
    models = {
        'random_forest': RandomForestRegressor,
        'gradient_boosting': GradientBoostingRegressor,
        'linear_regression': LinearRegression,
        'ridge': Ridge,
        'lasso': Lasso,
        'elastic_net': ElasticNet,
        'svr': SVR
    }
    
    if has_xgboost:
        models['xgboost'] = xgb.XGBRegressor
    
    if has_lightgbm:
        models['lightgbm'] = lgb.LGBMRegressor
    
    if model_name not in models:
        supported_models = list(models.keys())
        raise ValueError(f"不支持的模型: {model_name}。支持的模型: {', '.join(supported_models)}")
    
    no_random_state_models = {'linear_regression'}
    
    if model_name not in no_random_state_models and 'random_state' not in params:
        params['random_state'] = 42
    
    if model_name in no_random_state_models:
        params = {k: v for k, v in params.items() if k != 'random_state'}
    
    return models[model_name](**params)


def train_model(model: Any, X_train: np.ndarray, y_train: np.ndarray) -> Any:
    """
    训练模型
    
    Args:
        model: 模型实例
        X_train: 训练集特征
        y_train: 训练集目标
        
    Returns:
        训练好的模型
    """
    logger.info(f"开始训练模型: {model.__class__.__name__}")
    
    # 训练模型
    model.fit(X_train, y_train)
    
    logger.info("模型训练完成")
    
    return model


def evaluate_model(model: RegressorMixin, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, float]:
    """
    评估模型性能
    
    Args:
        model: 训练好的模型
        X_test: 测试集特征
        y_test: 测试集目标
        
    Returns:
        模型评估指标
    """
    logger.info("开始评估模型...")
    
    # 预测
    y_pred = model.predict(X_test)
    
    # 计算评估指标
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    median_ae = median_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    explained_var = explained_variance_score(y_test, y_pred)
    max_err = max_error(y_test, y_pred)
    
    # 记录评估结果
    logger.info("模型评估结果:")
    logger.info(f"MSE: {mse:.4f}")
    logger.info(f"RMSE: {rmse:.4f}")
    logger.info(f"MAE: {mae:.4f}")
    logger.info(f"Median MAE: {median_ae:.4f}")
    logger.info(f"R²: {r2:.4f}")
    logger.info(f"Explained Variance: {explained_var:.4f}")
    logger.info(f"Max Error: {max_err:.4f}")
    
    return {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'median_ae': median_ae,
        'r2': r2,
        'explained_var': explained_var,
        'max_error': max_err
    }


def save_model(model: Any, models_path: str, model_name: str, version: str = 'v1') -> str:
    """
    保存训练好的模型
    
    Args:
        model: 训练好的模型
        models_path: 模型保存目录
        model_name: 模型名称
        version: 模型版本
        
    Returns:
        保存的模型文件路径
    """
    logger.info("开始保存模型...")
    
    # 确保模型目录存在
    os.makedirs(models_path, exist_ok=True)
    
    # 生成模型文件名
    model_filename = f"{model_name}_model_{version}.joblib"
    model_path = os.path.join(models_path, model_filename)
    
    # 保存模型
    joblib.dump(model, model_path)
    
    logger.info(f"模型已保存至: {model_path}")
    
    return model_path


def hyperparameter_tuning(
    model_name: str, 
    X_train: np.ndarray, 
    y_train: np.ndarray, 
    param_grid: Dict[str, Any],
    tuning_method: str = 'grid_search',
    cv: int = 5,
    scoring: str = 'neg_mean_squared_error',
    n_iter: int = 100
) -> Tuple[RegressorMixin, Dict[str, Any]]:
    """
    超参数调优，支持网格搜索和随机搜索
    
    Args:
        model_name: 模型名称
        X_train: 训练集特征
        y_train: 训练集目标
        param_grid: 超参数网格
        tuning_method: 调优方法，'grid_search'或'random_search'
        cv: 交叉验证折数
        scoring: 评分指标
        n_iter: 随机搜索的迭代次数
        
    Returns:
        调优后的最佳模型和最佳参数
    """
    logger.info(f"开始超参数调优: {model_name}, 方法: {tuning_method}")
    
    # 获取模型类
    model_class = get_model(model_name).__class__
    
    if tuning_method == 'grid_search':
        # 创建GridSearchCV实例
        search = GridSearchCV(
            estimator=model_class(),
            param_grid=param_grid,
            cv=cv,
            scoring=scoring,
            n_jobs=-1,
            verbose=1
        )
    elif tuning_method == 'random_search':
        # 创建RandomizedSearchCV实例
        search = RandomizedSearchCV(
            estimator=model_class(),
            param_distributions=param_grid,
            n_iter=n_iter,
            cv=cv,
            scoring=scoring,
            n_jobs=-1,
            random_state=42,
            verbose=1
        )
    else:
        raise ValueError(f"不支持的调优方法: {tuning_method}")
    
    # 执行搜索
    search.fit(X_train, y_train)
    
    logger.info(f"最佳参数: {search.best_params_}")
    logger.info(f"最佳交叉验证分数: {-search.best_score_:.4f}")
    
    return search.best_estimator_, search.best_params_


def get_cv_scores(model: BaseEstimator, X_train: np.ndarray, y_train: np.ndarray, 
                  cv: int = 5, scoring: str = 'r2') -> Dict[str, float]:
    """
    计算交叉验证分数
    
    Args:
        model: 模型实例
        X_train: 训练集特征
        y_train: 训练集目标
        cv: 交叉验证折数
        scoring: 评分指标
        
    Returns:
        交叉验证分数字典
    """
    logger.info(f"执行{cv}折交叉验证，评分指标: {scoring}")
    
    scores = cross_val_score(model, X_train, y_train, cv=cv, scoring=scoring)
    
    cv_results = {
        'mean_score': scores.mean(),
        'std_score': scores.std(),
        'all_scores': scores.tolist()
    }
    
    logger.info(f"交叉验证分数: {scores.mean():.4f} (+/- {scores.std()*2:.4f})")
    
    return cv_results


def get_learning_curve(model: BaseEstimator, X_train: np.ndarray, y_train: np.ndarray,
                       train_sizes: np.ndarray = None, cv: int = 5) -> Dict[str, np.ndarray]:
    """
    计算学习曲线
    
    Args:
        model: 模型实例
        X_train: 训练集特征
        y_train: 训练集目标
        train_sizes: 训练集大小比例数组
        cv: 交叉验证折数
        
    Returns:
        学习曲线数据字典
    """
    if train_sizes is None:
        train_sizes = np.linspace(0.1, 1.0, 10)
    
    logger.info("计算学习曲线...")
    
    train_sizes_abs, train_scores, val_scores = learning_curve(
        model, X_train, y_train,
        train_sizes=train_sizes,
        cv=cv,
        scoring='r2',
        n_jobs=-1
    )
    
    learning_curve_data = {
        'train_sizes': train_sizes_abs,
        'train_scores_mean': train_scores.mean(axis=1),
        'train_scores_std': train_scores.std(axis=1),
        'val_scores_mean': val_scores.mean(axis=1),
        'val_scores_std': val_scores.std(axis=1)
    }
    
    logger.info("学习曲线计算完成")
    
    return learning_curve_data


class ModelManager:
    """
    模型管理器，统一管理多个模型的训练、评估和选择
    """
    
    def __init__(self, model_configs: Dict[str, Dict[str, Any]] = None, default_params: Dict[str, Any] = None):
        """
        初始化模型管理器
        
        Args:
            model_configs: 模型配置字典
            default_params: 默认参数
        """
        self.model_configs = model_configs or {}
        self.default_params = default_params or {'random_state': 42}
        self.trained_models = {}
        self.model_results = {}
        self.best_model_name = None
        self.best_model = None
        self.best_score = -float('inf')
        
        logger.info("模型管理器初始化完成")
        logger.info(f"配置模型数量: {len(self.model_configs)}")
    
    def add_model(self, model_name: str, params: Dict[str, Any] = None):
        """
        添加模型配置
        
        Args:
            model_name: 模型名称
            params: 模型参数
        """
        self.model_configs[model_name] = params or {}
        logger.info(f"添加模型配置: {model_name}")
    
    def train_all(self, X_train: np.ndarray, y_train: np.ndarray, 
                  X_test: np.ndarray = None, y_test: np.ndarray = None,
                  tune_hyperparams: bool = False, 
                  tuning_config: Dict[str, Any] = None) -> Dict[str, Dict[str, Any]]:
        """
        训练所有配置的模型
        
        Args:
            X_train: 训练集特征
            y_train: 训练集目标
            X_test: 测试集特征（可选）
            y_test: 测试集目标（可选）
            tune_hyperparams: 是否进行超参数调优
            tuning_config: 超参数调优配置
            
        Returns:
            模型结果字典
        """
        logger.info(f"开始训练 {len(self.model_configs)} 个模型")
        
        for model_name in self.model_configs:
            logger.info(f"\n训练模型: {model_name}")
            
            try:
                # 获取模型参数
                params = self.model_configs.get(model_name, {}).copy()
                
                # 合并默认参数
                if model_name != 'linear_regression':
                    params.update(self.default_params)
                
                # 获取模型
                model = get_model(model_name, params)
                
                # 超参数调优
                if tune_hyperparams and tuning_config:
                    param_grids = tuning_config.get('param_grids', {})
                    if model_name in param_grids:
                        logger.info(f"执行 {model_name} 超参数调优...")
                        model, best_params = hyperparameter_tuning(
                            model_name, X_train, y_train,
                            param_grids[model_name],
                            tuning_method=tuning_config.get('method', 'random_search'),
                            cv=tuning_config.get('cv', 5),
                            scoring=tuning_config.get('scoring', 'neg_mean_squared_error'),
                            n_iter=tuning_config.get('n_iter', 50)
                        )
                        logger.info(f"最佳参数: {best_params}")
                
                # 训练模型
                trained_model = train_model(model, X_train, y_train)
                
                # 评估模型
                metrics = {}
                if X_test is not None and y_test is not None:
                    metrics = evaluate_model(trained_model, X_test, y_test)
                
                # 交叉验证
                cv_scores = get_cv_scores(trained_model, X_train, y_train, cv=5, scoring='r2')
                
                # 保存结果
                self.trained_models[model_name] = trained_model
                self.model_results[model_name] = {
                    'model': trained_model,
                    'metrics': metrics,
                    'cv_scores': cv_scores,
                    'params': params
                }
                
                # 更新最佳模型
                if 'r2' in metrics and metrics['r2'] > self.best_score:
                    self.best_score = metrics['r2']
                    self.best_model_name = model_name
                    self.best_model = trained_model
                
                logger.info(f"模型 {model_name} 训练完成")
                
            except Exception as e:
                logger.error(f"模型 {model_name} 训练失败: {str(e)}")
                continue
        
        logger.info(f"\n所有模型训练完成！最佳模型: {self.best_model_name} (R²: {self.best_score:.4f})")
        
        return self.model_results
    
    def get_best_model(self) -> Tuple[Optional[str], Optional[BaseEstimator], Optional[float]]:
        """
        获取最佳模型
        
        Returns:
            模型名称、模型实例、最佳分数
        """
        return self.best_model_name, self.best_model, self.best_score
    
    def compare_models(self, sort_by: str = 'r2', ascending: bool = False) -> pd.DataFrame:
        """
        比较所有训练好的模型
        
        Args:
            sort_by: 排序依据的指标
            ascending: 是否升序排序
            
        Returns:
            模型比较DataFrame
        """
        if not self.model_results:
            logger.warning("没有可比较的模型结果")
            return pd.DataFrame()
        
        comparison_data = []
        
        for model_name, result in self.model_results.items():
            row = {'model_name': model_name}
            row.update(result.get('metrics', {}))
            row['cv_r2_mean'] = result.get('cv_scores', {}).get('mean_score', 0)
            row['cv_r2_std'] = result.get('cv_scores', {}).get('std_score', 0)
            comparison_data.append(row)
        
        df = pd.DataFrame(comparison_data)
        
        if sort_by in df.columns:
            df = df.sort_values(by=sort_by, ascending=ascending)
        
        logger.info("\n模型比较结果:")
        logger.info(df.to_string(index=False))
        
        return df
    
    def save_all(self, save_path: str, include_best: bool = True):
        """
        保存所有训练好的模型
        
        Args:
            save_path: 保存路径
            include_best: 是否同时保存最佳模型
        """
        logger.info(f"保存所有模型到: {save_path}")
        
        os.makedirs(save_path, exist_ok=True)
        
        for model_name, model in self.trained_models.items():
            save_model(model, save_path, model_name, 'v1')
        
        if include_best and self.best_model is not None:
            save_model(self.best_model, save_path, f"{self.best_model_name}_best", 'v1')
            logger.info(f"最佳模型已保存: {self.best_model_name}")
    
    def get_model_summary(self) -> str:
        """
        获取模型摘要报告
        
        Returns:
            模型摘要字符串
        """
        if not self.trained_models:
            return "没有训练任何模型"
        
        summary_lines = []
        summary_lines.append("\n" + "="*70)
        summary_lines.append("模型训练摘要报告")
        summary_lines.append("="*70)
        summary_lines.append(f"\n训练模型总数: {len(self.trained_models)}")
        summary_lines.append(f"最佳模型: {self.best_model_name}")
        summary_lines.append(f"最佳R²分数: {self.best_score:.4f}")
        summary_lines.append("\n模型性能排名:")
        summary_lines.append("-"*70)
        summary_lines.append(f"{'模型名称':<25} {'R²':<12} {'RMSE':<12} {'MAE':<12}")
        summary_lines.append("-"*70)
        
        # 按R²排序
        sorted_models = sorted(
            self.model_results.items(),
            key=lambda x: x[1].get('metrics', {}).get('r2', 0),
            reverse=True
        )
        
        for model_name, result in sorted_models:
            metrics = result.get('metrics', {})
            summary_lines.append(
                f"{model_name:<25} {metrics.get('r2', 0):<12.4f} "
                f"{metrics.get('rmse', 0):<12.4f} {metrics.get('mae', 0):<12.4f}"
            )
        
        summary_lines.append("="*70)
        
        return "\n".join(summary_lines)


def main():
    """
    主函数，演示增强后的模型训练功能
    """
    # 定义数据和模型的路径
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    processed_data_path = os.path.join(project_root, 'data', 'processed')
    models_path = os.path.join(project_root, 'models')
    
    logger.info("=== 增强版模型训练流程演示 ===")
    
    # 1. 从 data/processed/ 读取数据
    logger.info("\n1. 加载处理后的数据")
    try:
        X_train, X_test, y_train, y_test = load_processed_data(processed_data_path)
    except Exception as e:
        logger.error(f"数据加载失败: {str(e)}")
        logger.info("使用示例数据进行演示")
        # 使用示例数据
        from sklearn.datasets import fetch_california_housing
        housing = fetch_california_housing()
        X, y = housing.data, housing.target
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 2. 演示多种模型训练
    logger.info("\n2. 演示多种模型训练")
    
    # 模型列表，包括新增的模型
    model_names = ['random_forest', 'gradient_boosting', 'elastic_net']
    
    # 如果高级模型可用，添加到列表
    if has_xgboost:
        model_names.append('xgboost')
    if has_lightgbm:
        model_names.append('lightgbm')
    
    model_results = {}
    
    for model_name in model_names[:2]:  # 演示前两个模型
        logger.info(f"\n2.1 训练模型: {model_name}")
        
        # 获取模型实例
        if model_name == 'random_forest':
            params = {
                'n_estimators': 100,
                'random_state': 42
            }
        elif model_name == 'gradient_boosting':
            params = {
                'n_estimators': 100,
                'learning_rate': 0.1,
                'random_state': 42
            }
        elif model_name == 'elastic_net':
            params = {
                'alpha': 1.0,
                'l1_ratio': 0.5,
                'random_state': 42
            }
        else:
            params = {'random_state': 42}
        
        model = get_model(model_name, params)
        
        # 训练模型
        trained_model = train_model(model, X_train, y_train)
        
        # 评估模型
        metrics = evaluate_model(trained_model, X_test, y_test)
        model_results[model_name] = metrics
        
        # 保存模型
        model_path = save_model(trained_model, models_path, model_name, 'v1')
        logger.info(f"模型已保存: {model_path}")
    
    # 3. 演示超参数调优
    logger.info("\n3. 演示超参数调优")
    
    # 定义超参数网格
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5, 10]
    }
    
    # 使用随机搜索进行调优
    best_model, best_params = hyperparameter_tuning(
        'random_forest',
        X_train, y_train,
        param_grid,
        tuning_method='random_search',  # 使用随机搜索
        n_iter=10
    )
    
    # 评估调优后的模型
    logger.info("\n4. 评估调优后的模型")
    tuned_metrics = evaluate_model(best_model, X_test, y_test)
    
    # 保存调优后的模型
    logger.info("\n5. 保存调优后的模型")
    tuned_model_path = save_model(best_model, models_path, 'random_forest', 'tuned')
    logger.info(f"调优后模型已保存: {tuned_model_path}")
    
    # 6. 记录模型比较结果
    logger.info("\n6. 模型比较结果")
    logger.info("="*60)
    logger.info(f"{'模型名称':<20} {'R²':<10} {'RMSE':<10} {'MAE':<10} {'MSE':<10}")
    logger.info("="*60)
    
    # 添加调优后模型结果
    model_results['random_forest_tuned'] = tuned_metrics
    
    for model_name, metrics in model_results.items():
        logger.info(f"{model_name:<20} {metrics['r2']:<10.4f} {metrics['rmse']:<10.4f} {metrics['mae']:<10.4f} {metrics['mse']:<10.4f}")
    
    logger.info("="*60)
    logger.info("\n模型训练流程演示完成！")
    logger.info("\n可以通过以下步骤继续:")
    logger.info("1. 模型预测: 使用 src/models/predict_model.py")
    logger.info("2. 数据可视化: 使用 src/visualization/visualize.py")


if __name__ == "__main__":
    main()
