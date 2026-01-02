#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据准备与预处理模块

该模块负责数据加载、清洗、转换、划分和保存，是模型训练流程的基础。
支持多种数据格式，包括CSV、Excel和JSON。
"""

import os
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, Optional, List
from sklearn.model_selection import train_test_split

# 导入日志系统
from src.utils.logging import get_logger

# 初始化日志记录器
logger = get_logger(__name__)


# 数据加载函数
def load_data(
    file_path: str,
    file_format: str = 'csv',
    encoding: str = 'utf-8',
    **kwargs
) -> pd.DataFrame:
    """
    从文件加载数据，支持多种格式
    
    Args:
        file_path: 文件路径
        file_format: 文件格式，支持 'csv', 'excel', 'json'
        encoding: 文件编码
        **kwargs: 传递给pandas读取函数的额外参数
        
    Returns:
        加载的数据DataFrame
    """
    logger.info(f"开始加载数据: {file_path}")
    logger.info(f"文件格式: {file_format}, 编码: {encoding}")
    
    try:
        if file_format == 'csv':
            data = pd.read_csv(file_path, encoding=encoding, **kwargs)
        elif file_format == 'excel' or file_format == 'xlsx':
            data = pd.read_excel(file_path, engine='openpyxl', **kwargs)
        elif file_format == 'json':
            data = pd.read_json(file_path, encoding=encoding, **kwargs)
        else:
            raise ValueError(f"不支持的文件格式: {file_format}")
        
        logger.info(f"数据加载成功！形状: {data.shape}")
        logger.info(f"数据列: {list(data.columns)}")
        return data
    except Exception as e:
        logger.error(f"数据加载失败: {str(e)}")
        raise


# 数据清洗函数
def clean_data(
    data: pd.DataFrame,
    drop_duplicates: bool = True,
    handle_missing: str = 'mean',
    numeric_imputation: str = 'mean',
    categorical_imputation: str = 'mode',
    outlier_method: str = 'iqr',
    iqr_multiplier: float = 1.5,
    zscore_threshold: float = 3.0,
    drop_columns: Optional[List[str]] = None,
    **kwargs
) -> pd.DataFrame:
    """
    数据清洗，处理缺失值、异常值和重复值
    
    Args:
        data: 输入数据DataFrame
        drop_duplicates: 是否删除重复行
        handle_missing: 缺失值处理方式，'drop'或'fill'
        numeric_imputation: 数值型缺失值填充方式，'mean', 'median', 'mode'
        categorical_imputation: 分类型缺失值填充方式，'mode', 'constant'
        outlier_method: 异常值检测方法，'iqr', 'zscore'或None
        iqr_multiplier: IQR方法的倍数
        zscore_threshold: Z-score方法的阈值
        drop_columns: 要删除的列列表
        
    Returns:
        清洗后的数据DataFrame
    """
    logger.info("开始数据清洗...")
    data_cleaned = data.copy()
    
    # 1. 删除指定列
    if drop_columns:
        logger.info(f"删除列: {drop_columns}")
        data_cleaned = data_cleaned.drop(columns=drop_columns, errors='ignore')
    
    # 2. 处理重复值
    if drop_duplicates:
        initial_rows = len(data_cleaned)
        data_cleaned = data_cleaned.drop_duplicates()
        logger.info(f"删除重复值: {initial_rows - len(data_cleaned)} 行")
    
    # 3. 处理缺失值
    logger.info(f"缺失值处理方式: {handle_missing}")
    missing_info = data_cleaned.isnull().sum()
    missing_cols = missing_info[missing_info > 0]
    
    if len(missing_cols) > 0:
        logger.info(f"存在缺失值的列: {list(missing_cols.index)}")
        
        if handle_missing == 'drop':
            # 删除包含缺失值的行
            initial_rows = len(data_cleaned)
            data_cleaned = data_cleaned.dropna()
            logger.info(f"删除缺失值: {initial_rows - len(data_cleaned)} 行")
        elif handle_missing == 'fill':
            # 填充缺失值
            numeric_cols = data_cleaned.select_dtypes(include=[np.number]).columns
            categorical_cols = data_cleaned.select_dtypes(include=['object', 'category']).columns
            
            # 填充数值型缺失值
            if len(numeric_cols) > 0:
                logger.info(f"填充数值型缺失值，方法: {numeric_imputation}")
                for col in numeric_cols:
                    if data_cleaned[col].isnull().sum() > 0:
                        if numeric_imputation == 'mean':
                            fill_value = data_cleaned[col].mean()
                        elif numeric_imputation == 'median':
                            fill_value = data_cleaned[col].median()
                        elif numeric_imputation == 'mode':
                            fill_value = data_cleaned[col].mode()[0]
                        else:
                            fill_value = 0
                        
                        data_cleaned[col] = data_cleaned[col].fillna(fill_value)
            
            # 填充分类型缺失值
            if len(categorical_cols) > 0:
                logger.info(f"填充分类型缺失值，方法: {categorical_imputation}")
                for col in categorical_cols:
                    if data_cleaned[col].isnull().sum() > 0:
                        if categorical_imputation == 'mode':
                            fill_value = data_cleaned[col].mode()[0]
                        elif categorical_imputation == 'constant':
                            fill_value = 'missing'
                        else:
                            fill_value = 'missing'
                        
                        data_cleaned[col] = data_cleaned[col].fillna(fill_value)
    
    # 4. 处理异常值
    if outlier_method:
        logger.info(f"异常值处理方法: {outlier_method}")
        numeric_cols = data_cleaned.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            if outlier_method == 'iqr':
                # IQR方法
                Q1 = data_cleaned[col].quantile(0.25)
                Q3 = data_cleaned[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - iqr_multiplier * IQR
                upper_bound = Q3 + iqr_multiplier * IQR
            elif outlier_method == 'zscore':
                # Z-score方法
                mean = data_cleaned[col].mean()
                std = data_cleaned[col].std()
                lower_bound = mean - zscore_threshold * std
                upper_bound = mean + zscore_threshold * std
            else:
                continue
            
            # 过滤异常值
            initial_rows = len(data_cleaned)
            data_cleaned = data_cleaned[(data_cleaned[col] >= lower_bound) & (data_cleaned[col] <= upper_bound)]
            removed = initial_rows - len(data_cleaned)
            if removed > 0:
                logger.info(f"列 {col} 删除异常值: {removed} 行")
    
    logger.info(f"数据清洗完成！最终形状: {data_cleaned.shape}")
    return data_cleaned


# 数据转换函数
def transform_data(
    data: pd.DataFrame,
    date_columns: Optional[List[str]] = None,
    lowercase_columns: bool = False,
    strip_columns: bool = False,
    **kwargs
) -> pd.DataFrame:
    """
    数据转换，包括日期处理、列名处理等
    
    Args:
        data: 输入数据DataFrame
        date_columns: 需要转换为日期类型的列列表
        lowercase_columns: 是否将列名转换为小写
        strip_columns: 是否去除列名的空格
        
    Returns:
        转换后的数据DataFrame
    """
    logger.info("开始数据转换...")
    data_transformed = data.copy()
    
    # 1. 处理列名
    if lowercase_columns:
        logger.info("将列名转换为小写")
        data_transformed.columns = [col.lower() for col in data_transformed.columns]
    
    if strip_columns:
        logger.info("去除列名空格")
        data_transformed.columns = [col.strip() for col in data_transformed.columns]
    
    # 2. 处理日期列
    if date_columns:
        logger.info(f"处理日期列: {date_columns}")
        for col in date_columns:
            if col in data_transformed.columns:
                data_transformed[col] = pd.to_datetime(data_transformed[col], errors='coerce')
                logger.info(f"列 {col} 转换为日期类型")
    
    logger.info("数据转换完成！")
    return data_transformed


# 数据划分函数
def split_data(
    data: pd.DataFrame,
    target_column: str,
    test_size: float = 0.2,
    val_size: float = 0.0,
    random_state: int = 42,
    stratify: Optional[str] = None,
    use_stratify: bool = False,
    **kwargs
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """
    数据划分，分为训练集、测试集和验证集
    
    Args:
        data: 输入数据DataFrame
        target_column: 目标变量列名
        test_size: 测试集比例
        val_size: 验证集比例（从训练集中划分）
        random_state: 随机种子
        stratify: 分层抽样列名
        use_stratify: 是否使用分层抽样（仅适用于分类问题）
        
    Returns:
        训练集特征, 验证集特征, 测试集特征, 训练集目标, 验证集目标, 测试集目标
        如果val_size为0，则验证集返回None
    """
    logger.info("开始数据划分...")
    logger.info(f"目标变量: {target_column}")
    logger.info(f"测试集比例: {test_size}, 验证集比例: {val_size}")
    
    # 分离特征和目标变量
    X = data.drop(columns=[target_column])
    y = data[target_column]
    
    # 分层抽样参数，仅在use_stratify为True时使用
    stratify_param = (y if stratify is None else data[stratify]) if use_stratify else None
    
    # 第一次划分：训练集+验证集 vs 测试集
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, 
        test_size=test_size, 
        random_state=random_state, 
        stratify=stratify_param
    )
    
    logger.info(f"第一次划分完成：")
    logger.info(f"  训练集+验证集形状: {X_train_val.shape}, {y_train_val.shape}")
    logger.info(f"  测试集形状: {X_test.shape}, {y_test.shape}")
    
    # 如果需要验证集，第二次划分
    if val_size > 0:
        # 计算相对于训练集+验证集的验证集比例
        val_ratio = val_size / (1 - test_size)
        
        # 验证集划分不使用分层抽样
        X_train, X_val, y_train, y_val = train_test_split(
            X_train_val, y_train_val, 
            test_size=val_ratio, 
            random_state=random_state,
            stratify=None
        )
        
        logger.info(f"第二次划分完成：")
        logger.info(f"  训练集形状: {X_train.shape}, {y_train.shape}")
        logger.info(f"  验证集形状: {X_val.shape}, {y_val.shape}")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    else:
        logger.info("跳过验证集划分")
        return X_train_val, None, X_test, y_train_val, None, y_test


# 数据保存函数
def save_data(
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    output_path: str,
    X_val: Optional[pd.DataFrame] = None,
    y_val: Optional[pd.Series] = None,
    format: str = 'npy',
    **kwargs
) -> None:
    """
    保存处理后的数据
    
    Args:
        X_train: 训练集特征
        X_test: 测试集特征
        y_train: 训练集目标
        y_test: 测试集目标
        output_path: 输出路径
        X_val: 验证集特征
        y_val: 验证集目标
        format: 保存格式，'npy'或'csv'
        
    Returns:
        None
    """
    logger.info(f"开始保存数据到: {output_path}")
    
    # 确保输出目录存在
    os.makedirs(output_path, exist_ok=True)
    
    try:
        if format == 'npy':
            # 保存为numpy格式
            np.save(os.path.join(output_path, 'X_train.npy'), X_train.values)
            np.save(os.path.join(output_path, 'X_test.npy'), X_test.values)
            np.save(os.path.join(output_path, 'y_train.npy'), y_train.values)
            np.save(os.path.join(output_path, 'y_test.npy'), y_test.values)
            
            if X_val is not None and y_val is not None:
                np.save(os.path.join(output_path, 'X_val.npy'), X_val.values)
                np.save(os.path.join(output_path, 'y_val.npy'), y_val.values)
        elif format == 'csv':
            # 保存为CSV格式
            X_train.to_csv(os.path.join(output_path, 'X_train.csv'), index=False)
            X_test.to_csv(os.path.join(output_path, 'X_test.csv'), index=False)
            y_train.to_csv(os.path.join(output_path, 'y_train.csv'), index=False)
            y_test.to_csv(os.path.join(output_path, 'y_test.csv'), index=False)
            
            if X_val is not None and y_val is not None:
                X_val.to_csv(os.path.join(output_path, 'X_val.csv'), index=False)
                y_val.to_csv(os.path.join(output_path, 'y_val.csv'), index=False)
        else:
            raise ValueError(f"不支持的保存格式: {format}")
        
        logger.info("数据保存完成！")
        logger.info(f"训练集特征: {os.path.join(output_path, 'X_train.npy' if format == 'npy' else 'X_train.csv')}")
        logger.info(f"测试集特征: {os.path.join(output_path, 'X_test.npy' if format == 'npy' else 'X_test.csv')}")
        logger.info(f"训练集目标: {os.path.join(output_path, 'y_train.npy' if format == 'npy' else 'y_train.csv')}")
        logger.info(f"测试集目标: {os.path.join(output_path, 'y_test.npy' if format == 'npy' else 'y_test.csv')}")
        
        if X_val is not None and y_val is not None:
            logger.info(f"验证集特征: {os.path.join(output_path, 'X_val.npy' if format == 'npy' else 'X_val.csv')}")
            logger.info(f"验证集目标: {os.path.join(output_path, 'y_val.npy' if format == 'npy' else 'y_val.csv')}")
    except Exception as e:
        logger.error(f"数据保存失败: {str(e)}")
        raise


# 主函数，演示数据处理流程
def main():
    """
    主函数，演示完整的数据处理流程
    """
    logger.info("=== 数据处理流程演示 ===")
    
    # 示例：使用sklearn内置数据集
    try:
        from sklearn.datasets import fetch_california_housing
        
        # 加载数据集
        logger.info("\n1. 加载示例数据 (California Housing)")
        housing = fetch_california_housing()
        data = pd.DataFrame(housing.data, columns=housing.feature_names)
        data['target'] = housing.target
        logger.info(f"数据形状: {data.shape}")
        
        # 数据清洗
        logger.info("\n2. 数据清洗")
        cleaned_data = clean_data(
            data, 
            drop_duplicates=True,
            handle_missing='fill',
            outlier_method='iqr'
        )
        
        # 数据转换
        logger.info("\n3. 数据转换")
        transformed_data = transform_data(
            cleaned_data, 
            lowercase_columns=True,
            strip_columns=True
        )
        
        # 数据划分
        logger.info("\n4. 数据划分")
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(
            transformed_data, 
            target_column='target',
            test_size=0.2,
            val_size=0.1
        )
        
        # 数据保存
        logger.info("\n5. 数据保存")
        output_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data', 'processed')
        save_data(X_train, X_test, y_train, y_test, output_path, X_val, y_val)
        
        logger.info("\n=== 数据处理流程演示完成！===")
        logger.info("可以通过以下步骤继续:")
        logger.info("1. 特征工程: 使用 src/data/features.py")
        logger.info("2. 模型训练: 使用 src/models/train_model.py")
        logger.info("3. 模型预测: 使用 src/models/predict_model.py")
        logger.info("4. 数据可视化: 使用 src/visualization/visualize.py")
        
    except Exception as e:
        logger.error(f"演示失败: {str(e)}")
        raise


if __name__ == "__main__":
    main()
