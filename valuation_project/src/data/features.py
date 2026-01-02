# 特征工程脚本

该脚本负责特征提取、选择和转换功能，用于从原始数据中创建更有效的特征。
支持多种特征工程技术，包括缩放、编码、时间特征、选择和降维。
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple, Optional, Union
from sklearn.preprocessing import (StandardScaler, MinMaxScaler, RobustScaler, 
                                   OneHotEncoder, LabelEncoder, TargetEncoder, 
                                   PolynomialFeatures, PowerTransformer)
from sklearn.feature_selection import (VarianceThreshold, SelectKBest, 
                                      f_regression, mutual_info_regression, 
                                      RFE, SelectFromModel, SequentialFeatureSelector)
from sklearn.decomposition import PCA
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Lasso, Ridge

# 导入日志系统
from src.utils.logging import get_logger

# 初始化日志记录器
logger = get_logger(__name__)


# 数值特征处理
def scale_features(X: pd.DataFrame, method: str = 'standard', columns: Optional[List[str]] = None) -> Tuple[pd.DataFrame, Any]:
    """
    对数值特征进行缩放
    
    Args:
        X: 包含数值特征的DataFrame
        method: 缩放方法，可选值：'standard'（标准化）、'minmax'（归一化）、'robust'（稳健缩放）
        columns: 要缩放的列列表，如果为None则自动选择所有数值列
        
    Returns:
        缩放后的DataFrame和使用的缩放器
    """
    logger.info(f"开始缩放数值特征，方法: {method}")
    
    # 选择数值列
    if columns is None:
        numeric_cols = X.select_dtypes(include=[np.number]).columns
    else:
        numeric_cols = columns
    
    if len(numeric_cols) == 0:
        logger.info("没有找到数值特征")
        return X, None
    
    # 初始化缩放器
    if method == 'standard':
        scaler = StandardScaler()
    elif method == 'minmax':
        scaler = MinMaxScaler()
    elif method == 'robust':
        scaler = RobustScaler()
    else:
        raise ValueError(f"不支持的缩放方法: {method}")
    
    # 拟合和转换数据
    X_scaled = X.copy()
    X_scaled[numeric_cols] = scaler.fit_transform(X_scaled[numeric_cols])
    
    logger.info(f"数值特征缩放完成，共处理 {len(numeric_cols)} 个特征")
    
    return X_scaled, scaler


def log_transform(X: pd.DataFrame, columns: List[str]) -> pd.DataFrame:
    """
    对指定列进行对数转换
    
    Args:
        X: 输入DataFrame
        columns: 需要进行对数转换的列名列表
        
    Returns:
        转换后的DataFrame
    """
    logger.info(f"开始对数转换，列: {columns}")
    
    X_transformed = X.copy()
    
    for col in columns:
        if col not in X.columns:
            logger.warning(f"列 {col} 不存在")
            continue
        
        # 检查是否有非正数
        if (X[col] <= 0).any():
            # 添加一个小值避免对数(0)错误
            X_transformed[col] = np.log(X_transformed[col] + 1e-6)
        else:
            X_transformed[col] = np.log(X_transformed[col])
    
    logger.info("对数转换完成")
    
    return X_transformed


def power_transform(X: pd.DataFrame, columns: List[str], method: str = 'yeo-johnson') -> Tuple[pd.DataFrame, Any]:
    """
    对指定列进行幂变换（Box-Cox或Yeo-Johnson）
    
    Args:
        X: 输入DataFrame
        columns: 需要进行幂变换的列名列表
        method: 变换方法，可选值：'box-cox'（要求数据为正）或'yeo-johnson'（支持负数）
        
    Returns:
        转换后的DataFrame和使用的转换器
    """
    logger.info(f"开始幂变换，列: {columns}，方法: {method}")
    
    X_transformed = X.copy()
    
    # 初始化幂变换器
    transformer = PowerTransformer(method=method, standardize=True)
    
    # 拟合和转换数据
    X_transformed[columns] = transformer.fit_transform(X_transformed[columns])
    
    logger.info("幂变换完成")
    
    return X_transformed, transformer


# 类别特征处理
def encode_categorical_features(X: pd.DataFrame, y: Optional[pd.Series] = None, method: str = 'onehot', 
                               columns: Optional[List[str]] = None) -> Tuple[pd.DataFrame, Any]:
    """
    对类别特征进行编码
    
    Args:
        X: 包含类别特征的DataFrame
        y: 目标变量Series，用于目标编码
        method: 编码方法，可选值：'onehot'（独热编码）、'label'（标签编码）、'target'（目标编码）
        columns: 需要编码的列名列表，如果为None则自动选择所有类别列
        
    Returns:
        编码后的DataFrame和使用的编码器
    """
    logger.info(f"开始编码类别特征，方法: {method}")
    
    # 选择类别列
    if columns is None:
        categorical_cols = X.select_dtypes(include=['object', 'category']).columns
    else:
        categorical_cols = columns
    
    if len(categorical_cols) == 0:
        logger.info("没有找到类别特征")
        return X, None
    
    X_encoded = X.copy()
    encoder = None
    
    if method == 'onehot':
        # 独热编码
        encoder = OneHotEncoder(sparse_output=False, drop='first', handle_unknown='ignore')
        encoded_data = encoder.fit_transform(X_encoded[categorical_cols])
        
        # 创建新的列名
        new_columns = encoder.get_feature_names_out(categorical_cols)
        
        # 创建编码后的DataFrame
        encoded_df = pd.DataFrame(encoded_data, columns=new_columns, index=X_encoded.index)
        
        # 替换原始类别列
        X_encoded = X_encoded.drop(columns=categorical_cols)
        X_encoded = pd.concat([X_encoded, encoded_df], axis=1)
    
    elif method == 'label':
        # 标签编码
        encoder = {}
        for col in categorical_cols:
            le = LabelEncoder()
            X_encoded[col] = le.fit_transform(X_encoded[col])
            encoder[col] = le
    
    elif method == 'target':
        # 目标编码（需要目标变量）
        if y is None:
            raise ValueError("目标编码需要提供目标变量y")
        
        encoder = {}
        for col in categorical_cols:
            te = TargetEncoder(smooth="auto")
            X_encoded[col] = te.fit_transform(X_encoded[[col]], y)
            encoder[col] = te
    
    else:
        raise ValueError(f"不支持的编码方法: {method}")
    
    logger.info(f"类别特征编码完成，共处理 {len(categorical_cols)} 个特征")
    
    return X_encoded, encoder


# 时间特征处理
def extract_time_features(X: pd.DataFrame, date_column: str) -> pd.DataFrame:
    """
    从日期列提取时间特征
    
    Args:
        X: 包含日期列的DataFrame
        date_column: 日期列名
        
    Returns:
        提取时间特征后的DataFrame
    """
    logger.info(f"开始从列 {date_column} 提取时间特征")
    
    if date_column not in X.columns:
        raise ValueError(f"列 {date_column} 不存在")
    
    X_extracted = X.copy()
    
    # 确保列是 datetime 类型
    if not pd.api.types.is_datetime64_any_dtype(X_extracted[date_column]):
        X_extracted[date_column] = pd.to_datetime(X_extracted[date_column])
    
    # 提取时间特征
    X_extracted[f'{date_column}_year'] = X_extracted[date_column].dt.year
    X_extracted[f'{date_column}_month'] = X_extracted[date_column].dt.month
    X_extracted[f'{date_column}_day'] = X_extracted[date_column].dt.day
    X_extracted[f'{date_column}_weekday'] = X_extracted[date_column].dt.weekday
    X_extracted[f'{date_column}_quarter'] = X_extracted[date_column].dt.quarter
    X_extracted[f'{date_column}_season'] = X_extracted[date_column].dt.month % 12 // 3 + 1
    
    # 可以选择删除原始日期列
    # X_extracted = X_extracted.drop(columns=[date_column])
    
    logger.info(f"时间特征提取完成，新增 6 个特征")
    
    return X_extracted


# 特征选择
def select_features_by_variance(X: pd.DataFrame, threshold: float = 0.0) -> pd.DataFrame:
    """
    根据方差选择特征
    
    Args:
        X: 输入DataFrame
        threshold: 方差阈值，低于该阈值的特征将被删除
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始根据方差选择特征，阈值: {threshold}")
    
    selector = VarianceThreshold(threshold=threshold)
    selector.fit(X)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"方差特征选择完成，保留 {len(selected_features)} 个特征，删除 {len(X.columns) - len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


def select_features_by_correlation(X: pd.DataFrame, y: pd.Series, k: int) -> pd.DataFrame:
    """
    根据相关性选择前k个特征
    
    Args:
        X: 输入特征DataFrame
        y: 目标变量Series
        k: 要选择的特征数量
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始根据相关性选择前 {k} 个特征")
    
    selector = SelectKBest(score_func=f_regression, k=k)
    selector.fit(X, y)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"相关性特征选择完成，保留 {len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


def select_features_by_mutual_info(X: pd.DataFrame, y: pd.Series, k: int) -> pd.DataFrame:
    """
    根据互信息选择前k个特征
    
    Args:
        X: 输入特征DataFrame
        y: 目标变量Series
        k: 要选择的特征数量
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始根据互信息选择前 {k} 个特征")
    
    selector = SelectKBest(score_func=mutual_info_regression, k=k)
    selector.fit(X, y)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"互信息特征选择完成，保留 {len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


def select_features_by_rfe(X: pd.DataFrame, y: pd.Series, n_features: int, estimator_type: str = 'random_forest') -> pd.DataFrame:
    """
    使用递归特征消除选择特征
    
    Args:
        X: 输入特征DataFrame
        y: 目标变量Series
        n_features: 要选择的特征数量
        estimator_type: 基模型类型，可选值：'random_forest'、'gradient_boosting'、'lasso'
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始使用递归特征消除选择 {n_features} 个特征，基模型: {estimator_type}")
    
    # 选择基模型
    if estimator_type == 'random_forest':
        estimator = RandomForestRegressor(n_estimators=100, random_state=42)
    elif estimator_type == 'gradient_boosting':
        estimator = GradientBoostingRegressor(n_estimators=100, random_state=42)
    elif estimator_type == 'lasso':
        estimator = Lasso(alpha=0.1, random_state=42)
    else:
        raise ValueError(f"不支持的基模型类型: {estimator_type}")
    
    # 创建RFE选择器
    selector = RFE(estimator=estimator, n_features_to_select=n_features, step=1)
    selector.fit(X, y)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"递归特征消除完成，保留 {len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


def select_features_from_model(X: pd.DataFrame, y: pd.Series, estimator_type: str = 'random_forest', threshold: str = 'mean') -> pd.DataFrame:
    """
    使用SelectFromModel选择特征
    
    Args:
        X: 输入特征DataFrame
        y: 目标变量Series
        estimator_type: 基模型类型，可选值：'random_forest'、'gradient_boosting'、'lasso'、'ridge'
        threshold: 特征选择阈值，可选值：'mean'、'median'或具体数值
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始使用SelectFromModel选择特征，基模型: {estimator_type}")
    
    # 选择基模型
    if estimator_type == 'random_forest':
        estimator = RandomForestRegressor(n_estimators=100, random_state=42)
    elif estimator_type == 'gradient_boosting':
        estimator = GradientBoostingRegressor(n_estimators=100, random_state=42)
    elif estimator_type == 'lasso':
        estimator = Lasso(alpha=0.1, random_state=42)
    elif estimator_type == 'ridge':
        estimator = Ridge(alpha=1.0, random_state=42)
    else:
        raise ValueError(f"不支持的基模型类型: {estimator_type}")
    
    # 创建SelectFromModel选择器
    selector = SelectFromModel(estimator=estimator, threshold=threshold)
    selector.fit(X, y)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"SelectFromModel特征选择完成，保留 {len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


def select_features_sequential(X: pd.DataFrame, y: pd.Series, n_features: int, direction: str = 'forward') -> pd.DataFrame:
    """
    使用SequentialFeatureSelector选择特征（前向或后向选择）
    
    Args:
        X: 输入特征DataFrame
        y: 目标变量Series
        n_features: 要选择的特征数量
        direction: 选择方向，可选值：'forward'（前向选择）或'backward'（后向选择）
        
    Returns:
        选择后的DataFrame
    """
    logger.info(f"开始使用顺序特征选择选择 {n_features} 个特征，方向: {direction}")
    
    # 使用随机森林作为基模型
    estimator = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    
    # 创建SequentialFeatureSelector选择器
    selector = SequentialFeatureSelector(
        estimator=estimator,
        n_features_to_select=n_features,
        direction=direction,
        cv=5,
        n_jobs=-1
    )
    selector.fit(X, y)
    
    # 获取选择的特征索引
    selected_indices = selector.get_support(indices=True)
    selected_features = X.columns[selected_indices]
    
    X_selected = X[selected_features]
    
    logger.info(f"顺序特征选择完成，保留 {len(selected_features)} 个特征")
    logger.info(f"保留的特征: {list(selected_features)}")
    
    return X_selected


# 特征降维
def reduce_dimensionality_pca(X: pd.DataFrame, n_components: Union[int, float]) -> Tuple[pd.DataFrame, PCA]:
    """
    使用PCA进行特征降维
    
    Args:
        X: 输入特征DataFrame
        n_components: 要保留的主成分数量或方差比例（0.0到1.0之间的浮点数）
        
    Returns:
        降维后的DataFrame和PCA模型
    """
    if isinstance(n_components, float):
        logger.info(f"开始使用PCA进行特征降维，保留 {n_components*100:.1f}% 方差")
    else:
        logger.info(f"开始使用PCA进行特征降维，保留 {n_components} 个主成分")
    
    # 初始化PCA
    pca = PCA(n_components=n_components, random_state=42)
    
    # 拟合和转换数据
    X_pca = pca.fit_transform(X)
    
    # 转换为DataFrame
    n_components_actual = pca.n_components_
    pca_columns = [f'pca_component_{i+1}' for i in range(n_components_actual)]
    X_pca_df = pd.DataFrame(X_pca, columns=pca_columns, index=X.index)
    
    logger.info(f"PCA降维完成，实际保留 {n_components_actual} 个主成分，解释方差比例: {sum(pca.explained_variance_ratio_):.4f}")
    logger.info(f"各主成分解释方差比例: {[f'{ratio:.4f}' for ratio in pca.explained_variance_ratio_]}")
    
    return X_pca_df, pca


# 多项式特征
def generate_polynomial_features(X: pd.DataFrame, degree: int, 
                                 interaction_only: bool = False) -> Tuple[pd.DataFrame, PolynomialFeatures]:
    """
    生成多项式特征
    
    Args:
        X: 输入特征DataFrame
        degree: 多项式的次数
        interaction_only: 是否只生成交互项，不生成平方项等
        
    Returns:
        生成多项式特征后的DataFrame和PolynomialFeatures模型
    """
    logger.info(f"开始生成多项式特征，次数: {degree}, 仅交互项: {interaction_only}")
    
    # 初始化PolynomialFeatures
    poly = PolynomialFeatures(degree=degree, interaction_only=interaction_only, include_bias=False)
    
    # 拟合和转换数据
    X_poly = poly.fit_transform(X)
    
    # 获取生成的特征名称
    poly_feature_names = poly.get_feature_names_out(X.columns)
    
    # 转换为DataFrame
    X_poly_df = pd.DataFrame(X_poly, columns=poly_feature_names, index=X.index)
    
    logger.info(f"多项式特征生成完成，特征数量从 {X.shape[1]} 增加到 {X_poly_df.shape[1]}")
    
    return X_poly_df, poly


# 主函数示例
def main():
    """
    主函数，演示特征工程流程
    """
    # 示例：假设我们有一个包含各种类型特征的数据集
    data = {
        'numeric1': [1.0, 2.0, 3.0, 4.0, 5.0],
        'numeric2': [10.0, 20.0, 30.0, 40.0, 50.0],
        'category': ['A', 'B', 'A', 'C', 'B'],
        'date': ['2020-01-01', '2020-02-01', '2020-03-01', '2020-04-01', '2020-05-01'],
        'target': [100, 200, 150, 300, 250]
    }
    
    df = pd.DataFrame(data)
    
    logger.info("原始数据:")
    logger.info(df.to_string())
    
    # 1. 提取时间特征
    df_with_time = extract_time_features(df, 'date')
    logger.info("提取时间特征后:")
    logger.info(df_with_time.head().to_string())
    
    # 2. 编码类别特征
    df_encoded, encoder = encode_categorical_features(df_with_time, method='onehot', columns=['category'])
    logger.info("编码类别特征后:")
    logger.info(df_encoded.head().to_string())
    
    # 3. 缩放数值特征
    # 首先分离特征和目标变量
    X = df_encoded.drop(columns=['target'])
    y = df_encoded['target']
    
    X_scaled, scaler = scale_features(X, method='standard')
    logger.info("缩放数值特征后:")
    logger.info(X_scaled.head().to_string())
    
    # 4. 生成多项式特征
    X_poly, poly = generate_polynomial_features(X_scaled, degree=2, interaction_only=True)
    logger.info("生成多项式特征后:")
    logger.info(X_poly.head().to_string())
    
    # 5. 特征选择
    X_selected = select_features_by_correlation(X_poly, y, k=5)
    logger.info("相关性特征选择后:")
    logger.info(X_selected.head().to_string())
    
    logger.info("特征工程流程演示完成！")


if __name__ == "__main__":
    main()
