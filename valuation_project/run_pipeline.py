#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
估值项目主入口脚本

该脚本整合了数据处理、特征工程、模型训练、评估和可视化的完整流程，
通过配置文件控制整个项目的运行。
"""

import os
import yaml
import pandas as pd
import numpy as np
from datetime import datetime

# 导入自定义日志系统
from src.utils.logging import setup_logging, get_logger

# 确保日志目录存在
os.makedirs('logs', exist_ok=True)

# 设置日志
setup_logging(log_level='INFO', log_file=f'valuation_pipeline_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
logger = get_logger(__name__)

# 导入项目模块
try:
    from src.data.make_dataset import load_data, clean_data, transform_data, split_data, save_data
    from src.data.features import (
        scale_features, encode_categorical_features, 
        extract_time_features, select_features_by_correlation,
        reduce_dimensionality_pca
    )
    from src.models.train_model import (
        train_model, evaluate_model, save_model, 
        get_model, hyperparameter_tuning
    )
    from src.visualization.visualize import (
        plot_histograms, plot_correlation_heatmap,
        plot_feature_importance, plot_prediction_distribution
    )
    logger.info("成功导入所有项目模块！")
except Exception as e:
    logger.error(f"导入模块失败: {str(e)}")
    raise


def load_config(config_path: str = 'configs/config.yaml') -> dict:
    """
    加载配置文件
    
    Args:
        config_path: 配置文件路径
        
    Returns:
        配置字典
    """
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        logger.info(f"成功加载配置文件: {config_path}")
        return config
    except Exception as e:
        logger.error(f"加载配置文件失败: {str(e)}")
        raise


def run_data_pipeline(config: dict) -> tuple:
    """
    运行数据处理流水线
    
    Args:
        config: 配置字典
        
    Returns:
        处理后的数据 (X_train, X_test, y_train, y_test, X_val, y_val)
    """
    logger.info("=== 开始数据处理流水线 ===")
    
    # 1. 数据加载
    data_config = config['data']
    
    # 查找数据文件
    raw_data_path = data_config['raw_data_path']
    file_extension = data_config['file_extension'].lstrip('.')
    
    # 获取所有匹配的文件
    data_files = [f for f in os.listdir(raw_data_path) 
                 if f.endswith(f'.{file_extension}')]
    
    if not data_files:
        logger.error(f"在 {raw_data_path} 目录下未找到 {file_extension} 文件！")
        raise FileNotFoundError(f"未找到数据文件: {raw_data_path}/*.{file_extension}")
    
    # 使用第一个数据文件
    data_file = os.path.join(raw_data_path, data_files[0])
    logger.info(f"使用数据文件: {data_file}")
    
    # 加载数据
    data = load_data(
        data_file,
        file_format=file_extension,
        encoding=data_config['encoding'],
        index_col=data_config['index_col']
    )
    
    # 2. 数据清洗
    cleaned_data = clean_data(
        data,
        drop_duplicates=True,
        handle_missing=data_config.get('handle_missing', 'fill'),
        numeric_imputation=data_config.get('numeric_imputation', 'mean'),
        categorical_imputation=data_config.get('categorical_imputation', 'mode'),
        outlier_method=data_config.get('outlier_method', 'iqr')
    )
    
    # 3. 数据转换
    transformed_data = transform_data(
        cleaned_data,
        date_columns=data_config.get('date_columns', []),
        lowercase_columns=True,
        strip_columns=True
    )
    
    # 4. 数据划分
    target_column = data_config['target_column']
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(
        transformed_data,
        target_column=target_column,
        test_size=config['data_splitting']['test_size'],
        val_size=config['data_splitting']['val_size'],
        random_state=config['data_splitting']['random_state']
    )
    
    # 5. 保存处理后的数据
    processed_data_path = data_config['processed_data_path']
    save_data(
        X_train, X_test, y_train, y_test,
        processed_data_path,
        X_val, y_val
    )
    
    logger.info("=== 数据处理流水线完成 ===")
    return X_train, X_test, y_train, y_test, X_val, y_val


def run_feature_engineering(
    X_train: pd.DataFrame, 
    X_test: pd.DataFrame, 
    y_train: pd.Series,
    X_val: pd.DataFrame = None,
    config: dict = None
) -> tuple:
    """
    运行特征工程流水线
    
    Args:
        X_train: 训练集特征
        X_test: 测试集特征
        y_train: 训练集目标
        X_val: 验证集特征（可选）
        config: 配置字典
        
    Returns:
        特征工程处理后的数据
    """
    logger.info("=== 开始特征工程流水线 ===")
    
    fe_config = config['feature_engineering']
    
    # 1. 编码类别特征
    if fe_config['encoding']['enabled']:
        logger.info("执行类别特征编码...")
        X_train, encoder = encode_categorical_features(
            X_train,
            y=y_train if fe_config['encoding']['methods']['nominal'] == 'target' else None,
            method=fe_config['encoding']['methods']['nominal'],
            columns=fe_config['encoding']['categorical_columns'] or None
        )
        
        # 转换测试集和验证集
        X_test, _ = encode_categorical_features(
            X_test,
            method=fe_config['encoding']['methods']['nominal'],
            columns=fe_config['encoding']['categorical_columns'] or None
        )
        
        if X_val is not None:
            X_val, _ = encode_categorical_features(
                X_val,
                method=fe_config['encoding']['methods']['nominal'],
                columns=fe_config['encoding']['categorical_columns'] or None
            )
    
    # 2. 数值特征缩放
    if fe_config['scaling']['enabled']:
        logger.info("执行数值特征缩放...")
        X_train, scaler = scale_features(
            X_train,
            method=fe_config['scaling']['method'],
            columns=fe_config['scaling']['columns'] or None
        )
        
        # 转换测试集和验证集
        X_test_scaled = X_test.copy()
        numeric_cols = X_test.select_dtypes(include=[np.number]).columns
        X_test_scaled[numeric_cols] = scaler.transform(X_test_scaled[numeric_cols])
        X_test = X_test_scaled
        
        if X_val is not None:
            X_val_scaled = X_val.copy()
            X_val_scaled[numeric_cols] = scaler.transform(X_val_scaled[numeric_cols])
            X_val = X_val_scaled
    
    # 3. 时间特征提取（如果需要）
    if fe_config['time_features']['enabled'] and fe_config['time_features']['time_columns']:
        logger.info("提取时间特征...")
        for col in fe_config['time_features']['time_columns']:
            X_train = extract_time_features(X_train, col)
            X_test = extract_time_features(X_test, col)
            if X_val is not None:
                X_val = extract_time_features(X_val, col)
    
    # 4. 特征选择
    if fe_config['feature_selection']['enabled']:
        logger.info("执行特征选择...")
        selection_method = fe_config['feature_selection']['method']
        
        if selection_method == 'correlation':
            # 基于相关性的特征选择
            from src.data.features import select_features_by_correlation
            
            # 选择前k个特征
            k = fe_config['feature_selection']['k'] or min(20, X_train.shape[1])
            X_train = select_features_by_correlation(X_train, y_train, k)
            
            # 只保留选中的特征
            selected_features = X_train.columns
            X_test = X_test[selected_features]
            if X_val is not None:
                X_val = X_val[selected_features]
    
    # 5. PCA降维（如果需要）
    if fe_config['pca']['enabled']:
        logger.info("执行PCA降维...")
        X_train, pca = reduce_dimensionality_pca(
            X_train,
            n_components=fe_config['pca']['n_components']
        )
        
        # 转换测试集和验证集
        X_test = pca.transform(X_test)
        if X_val is not None:
            X_val = pca.transform(X_val)
    
    logger.info("=== 特征工程流水线完成 ===")
    return X_train, X_test, X_val


def run_model_training(
    X_train: pd.DataFrame, 
    X_test: pd.DataFrame, 
    y_train: pd.Series, 
    y_test: pd.Series,
    X_val: pd.DataFrame = None, 
    y_val: pd.Series = None,
    config: dict = None
) -> dict:
    """
    运行模型训练流水线
    
    Args:
        X_train: 训练集特征
        X_test: 测试集特征
        y_train: 训练集目标
        y_test: 测试集目标
        X_val: 验证集特征（可选）
        y_val: 验证集目标（可选）
        config: 配置字典
        
    Returns:
        模型结果字典
    """
    logger.info("=== 开始模型训练流水线 ===")
    
    model_config = config['models']
    tuning_config = config['hyperparameter_tuning']
    
    # 模型结果字典
    model_results = {}
    best_model = None
    best_score = -float('inf')
    best_model_name = None
    
    # 遍历所有模型
    for model_name in model_config['model_list']:
        logger.info(f"=== 训练模型: {model_name} ===")
        
        # 1. 获取模型默认参数
        model_params = model_config.get(model_name, {})
        
        # 2. 初始化模型
        model = get_model(model_name, model_params)
        
        # 3. 超参数调优（如果启用）
        if tuning_config['enabled']:
            param_grid = tuning_config['param_grids'].get(model_name, {})
            if param_grid:
                logger.info(f"执行{model_name}超参数调优...")
                model, best_params = hyperparameter_tuning(
                    model_name,
                    X_train, y_train,
                    param_grid,
                    tuning_method=tuning_config['method'],
                    cv=tuning_config['cv'],
                    scoring=tuning_config['scoring']
                )
                logger.info(f"最佳参数: {best_params}")
        
        # 4. 训练模型
        trained_model = train_model(model, X_train, y_train)
        
        # 5. 评估模型
        metrics = evaluate_model(trained_model, X_test, y_test)
        logger.info(f"模型 {model_name} 评估结果: {metrics}")
        
        # 6. 保存模型
        model_path = save_model(
            trained_model, 
            model_config['save_path'], 
            model_name
        )
        logger.info(f"模型 {model_name} 已保存: {model_path}")
        
        # 7. 保存模型结果
        model_results[model_name] = {
            'model': trained_model,
            'metrics': metrics,
            'path': model_path
        }
        
        # 8. 比较模型性能
        # 使用R²作为主要评分指标
        current_score = metrics['r2']
        if current_score > best_score:
            best_score = current_score
            best_model = trained_model
            best_model_name = model_name
    
    # 保存最佳模型
    if best_model is not None:
        best_model_path = save_model(
            best_model, 
            model_config['save_path'], 
            f"{best_model_name}_best"
        )
        logger.info(f"最佳模型: {best_model_name} (R²: {best_score:.4f})")
        logger.info(f"最佳模型已保存: {best_model_path}")
        
        # 添加最佳模型信息到结果
        model_results['best_model'] = {
            'name': best_model_name,
            'model': best_model,
            'score': best_score,
            'path': best_model_path
        }
    
    logger.info("=== 模型训练流水线完成 ===")
    return model_results


def run_visualization(
    data: pd.DataFrame,
    model_results: dict,
    config: dict
) -> None:
    """
    运行数据可视化
    
    Args:
        data: 原始数据
        model_results: 模型结果字典
        config: 配置字典
        
    Returns:
        None
    """
    logger.info("=== 开始数据可视化 ===")
    
    viz_config = config['visualization']
    output_path = viz_config['output_path']
    
    # 确保输出目录存在
    os.makedirs(output_path, exist_ok=True)
    
    # 1. 绘制直方图
    if viz_config['plots']['histograms']:
        logger.info("绘制直方图...")
        plot_histograms(
            data,
            output_dir=output_path
        )
    
    # 2. 绘制相关性热力图
    if viz_config['plots']['correlation_heatmap']:
        logger.info("绘制相关性热力图...")
        plot_correlation_heatmap(
            data,
            output_dir=output_path
        )
    
    # 3. 绘制特征重要性（仅适用于树模型）
    if viz_config['plots']['feature_importance'] and 'best_model' in model_results:
        best_model_info = model_results['best_model']
        best_model = best_model_info['model']
        
        # 检查模型是否支持feature_importances_
        if hasattr(best_model, 'feature_importances_'):
            logger.info("绘制特征重要性图...")
            # 获取特征名称
            feature_names = getattr(best_model, 'feature_names_in_', 
                                  [f'feature_{i}' for i in range(len(best_model.feature_importances_))])
            
            feature_importance = dict(zip(feature_names, best_model.feature_importances_))
            plot_feature_importance(
                feature_importance,
                output_dir=output_path
            )
    
    logger.info("=== 数据可视化完成 ===")


def main():
    """
    主函数，运行完整的估值项目流水线
    """
    logger.info("=== 启动估值项目流水线 ===")
    
    try:
        # 1. 加载配置
        config = load_config()
        
        # 2. 运行数据处理流水线
        X_train, X_test, y_train, y_test, X_val, y_val = run_data_pipeline(config)
        
        # 3. 运行特征工程流水线
        X_train_fe, X_test_fe, X_val_fe = run_feature_engineering(
            X_train, X_test, y_train, X_val, config
        )
        
        # 4. 运行模型训练流水线
        model_results = run_model_training(
            X_train_fe, X_test_fe, y_train, y_test,
            X_val_fe, y_val, config
        )
        
        # 5. 运行可视化
        # 重新加载原始数据用于可视化
        data_config = config['data']
        raw_data_path = data_config['raw_data_path']
        file_extension = data_config['file_extension'].lstrip('.')
        data_files = [f for f in os.listdir(raw_data_path) 
                     if f.endswith(f'.{file_extension}')]
        
        if data_files:
            data_file = os.path.join(raw_data_path, data_files[0])
            data = load_data(data_file, file_format=file_extension)
            run_visualization(data, model_results, config)
        
        # 6. 生成最终报告
        logger.info("=== 生成最终报告 ===")
        
        # 打印最佳模型信息
        if 'best_model' in model_results:
            best_model_info = model_results['best_model']
            logger.info(f"\n=== 最佳模型信息 ===")
            logger.info(f"模型名称: {best_model_info['name']}")
            logger.info(f"R²分数: {best_model_info['score']:.4f}")
            logger.info(f"模型路径: {best_model_info['path']}")
        
        # 打印所有模型结果
        logger.info(f"\n=== 所有模型结果 ===")
        for model_name, result in model_results.items():
            if model_name != 'best_model':
                logger.info(f"{model_name}: R² = {result['metrics']['r2']:.4f}, RMSE = {result['metrics']['rmse']:.4f}")
        
        logger.info("\n=== 估值项目流水线运行完成！ ===")
        logger.info("可以通过以下方式使用结果:")
        logger.info("1. 查看模型文件: models/trained/")
        logger.info("2. 查看可视化结果: reports/figures/")
        logger.info("3. 查看日志文件: logs/")
        
    except Exception as e:
        logger.error(f"流水线运行失败: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
