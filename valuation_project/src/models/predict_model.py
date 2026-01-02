#!/usr/bin/env python3
"""
模型预测脚本

该脚本负责加载训练好的模型，并使用它进行预测。
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Any, List, Dict

# 导入日志系统
from src.utils.logging import get_logger

# 初始化日志记录器
logger = get_logger(__name__)


def load_model(models_path: str, model_filename: str) -> Any:
    """
    加载训练好的模型
    
    Args:
        models_path: 模型保存目录
        model_filename: 模型文件名
        
    Returns:
        加载的模型
    """
    logger.info(f"开始加载模型: {model_filename}")
    
    # 构建模型路径
    model_path = os.path.join(models_path, model_filename)
    
    # 检查模型文件是否存在
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"模型文件不存在: {model_path}")
    
    # 加载模型
    model = joblib.load(model_path)
    
    logger.info(f"模型已成功加载: {model_path}")
    
    return model


def load_prediction_data(data_path: str, filename: str) -> np.ndarray:
    """
    加载用于预测的数据
    
    Args:
        data_path: 数据目录
        filename: 数据文件名
        
    Returns:
        加载的数据数组
    """
    logger.info(f"开始加载预测数据: {filename}")
    
    # 构建数据路径
    file_path = os.path.join(data_path, filename)
    
    # 检查数据文件是否存在
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"数据文件不存在: {file_path}")
    
    # 根据文件扩展名选择加载方式
    if filename.endswith('.npy'):
        data = np.load(file_path)
    elif filename.endswith('.csv'):
        data = pd.read_csv(file_path)
        # 如果是DataFrame，转换为numpy数组
        if isinstance(data, pd.DataFrame):
            data = data.values
    elif filename.endswith('.xlsx'):
        data = pd.read_excel(file_path)
        # 如果是DataFrame，转换为numpy数组
        if isinstance(data, pd.DataFrame):
            data = data.values
    else:
        raise ValueError(f"不支持的文件格式: {filename}")
    
    logger.info(f"预测数据已成功加载: {file_path}")
    logger.info(f"数据形状: {data.shape}")
    
    return data


def predict(model: Any, data: np.ndarray) -> np.ndarray:
    """
    使用模型进行预测
    
    Args:
        model: 加载的模型
        data: 用于预测的数据
        
    Returns:
        预测结果
    """
    logger.info("开始进行预测...")
    
    # 进行预测
    predictions = model.predict(data)
    
    logger.info(f"预测完成，共预测 {len(predictions)} 个样本")
    logger.info(f"预测结果示例: {predictions[:5]}")
    
    return predictions


def save_predictions(predictions: np.ndarray, output_path: str, output_filename: str) -> str:
    """
    保存预测结果
    
    Args:
        predictions: 预测结果
        output_path: 输出目录
        output_filename: 输出文件名
        
    Returns:
        保存的文件路径
    """
    logger.info(f"开始保存预测结果: {output_filename}")
    
    # 确保输出目录存在
    os.makedirs(output_path, exist_ok=True)
    
    # 构建输出路径
    output_file_path = os.path.join(output_path, output_filename)
    
    # 保存预测结果
    if output_filename.endswith('.npy'):
        np.save(output_file_path, predictions)
    elif output_filename.endswith('.csv'):
        # 转换为DataFrame并保存
        pd.DataFrame(predictions, columns=['predictions']).to_csv(output_file_path, index=False)
    elif output_filename.endswith('.txt'):
        # 保存为文本文件
        np.savetxt(output_file_path, predictions, fmt='%.4f')
    else:
        raise ValueError(f"不支持的输出文件格式: {output_filename}")
    
    logger.info(f"预测结果已保存至: {output_file_path}")
    
    return output_file_path


def evaluate_predictions(predictions: np.ndarray, true_values: np.ndarray) -> Dict[str, float]:
    """
    评估预测结果
    
    Args:
        predictions: 预测结果
        true_values: 真实值
        
    Returns:
        评估指标
    """
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
    
    logger.info("开始评估预测结果...")
    
    # 计算评估指标
    mse = mean_squared_error(true_values, predictions)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(true_values, predictions)
    r2 = r2_score(true_values, predictions)
    
    # 记录评估结果
    logger.info("预测结果评估:")
    logger.info(f"MSE: {mse:.4f}")
    logger.info(f"RMSE: {rmse:.4f}")
    logger.info(f"MAE: {mae:.4f}")
    logger.info(f"R²: {r2:.4f}")
    
    return {
        'mse': mse,
        'rmse': rmse,
        'mae': mae,
        'r2': r2
    }


class PredictionService:
    """
    预测服务类，提供统一的模型加载和预测接口
    """
    
    def __init__(self, model_path: str, model_name: str = None, lazy_load: bool = True):
        """
        初始化预测服务
        
        Args:
            model_path: 模型文件路径或目录
            model_name: 模型文件名（当model_path是目录时必填）
            lazy_load: 是否使用懒加载
        """
        self.model_path = model_path
        self.model_name = model_name
        self.lazy_load = lazy_load
        self.model = None
        self.model_info = {}
        
        if not lazy_load:
            self.load_model()
        
        logger.info(f"预测服务初始化完成，懒加载: {lazy_load}")
    
    def load_model(self, version: str = 'v1') -> Any:
        """
        加载模型
        
        Args:
            version: 模型版本
            
        Returns:
            加载的模型
        """
        if self.model is not None:
            return self.model
        
        if os.path.isdir(self.model_path):
            if self.model_name is None:
                raise ValueError("当model_path是目录时，必须提供model_name")
            
            model_filename = f"{self.model_name}_model_{version}.joblib"
            self.model = load_model(self.model_path, model_filename)
        else:
            self.model = load_model(os.path.dirname(self.model_path), os.path.basename(self.model_path))
        
        logger.info("模型加载完成")
        return self.model
    
    def validate_input(self, features: np.ndarray, expected_features: int = None) -> bool:
        """
        验证输入特征
        
        Args:
            features: 输入特征
            expected_features: 期望的特征数量
            
        Returns:
            验证是否通过
        """
        if not isinstance(features, np.ndarray):
            raise TypeError("特征必须是numpy数组")
        
        if len(features.shape) == 1:
            features = features.reshape(1, -1)
        
        if expected_features and features.shape[1] != expected_features:
            raise ValueError(
                f"特征维度不匹配：期望 {expected_features} 个特征，实际 {features.shape[1]} 个"
            )
        
        return True
    
    def predict(self, features: np.ndarray, return_confidence: bool = False) -> Dict[str, Any]:
        """
        单样本预测
        
        Args:
            features: 输入特征
            return_confidence: 是否返回置信度
            
        Returns:
            预测结果字典
        """
        if self.model is None:
            self.load_model()
        
        if len(features.shape) == 1:
            features = features.reshape(1, -1)
        
        self.validate_input(features)
        
        prediction = self.model.predict(features)[0]
        
        result = {
            'prediction': float(prediction),
            'model_used': self.model_name or os.path.basename(self.model_path)
        }
        
        if return_confidence and hasattr(self.model, 'predict_proba'):
            try:
                confidence = self.model.predict_proba(features)[0]
                result['confidence'] = float(max(confidence))
            except Exception:
                pass
        
        logger.info(f"预测结果: {result['prediction']:.4f}")
        
        return result
    
    def batch_predict(self, features: np.ndarray, batch_size: int = 1000) -> np.ndarray:
        """
        批量预测
        
        Args:
            features: 输入特征矩阵
            batch_size: 批处理大小
            
        Returns:
            预测结果数组
        """
        if self.model is None:
            self.load_model()
        
        self.validate_input(features)
        
        n_samples = features.shape[0]
        predictions = np.zeros(n_samples)
        
        logger.info(f"开始批量预测，共 {n_samples} 个样本，批大小: {batch_size}")
        
        for i in range(0, n_samples, batch_size):
            batch_end = min(i + batch_size, n_samples)
            batch_features = features[i:batch_end]
            
            batch_predictions = self.model.predict(batch_features)
            predictions[i:batch_end] = batch_predictions
            
            logger.info(f"已处理 {batch_end}/{n_samples} 个样本")
        
        logger.info(f"批量预测完成")
        
        return predictions
    
    def predict_dataframe(self, df: pd.DataFrame, feature_columns: List[str] = None) -> np.ndarray:
        """
        使用DataFrame进行预测
        
        Args:
            df: 输入DataFrame
            feature_columns: 特征列名列表
            
        Returns:
            预测结果数组
        """
        if feature_columns:
            df = df[feature_columns]
        
        features = df.values.astype(float)
        
        return self.batch_predict(features)
    
    def format_prediction_result(self, prediction: float, confidence: float = None, 
                                 unit: str = '', decimals: int = 4) -> str:
        """
        格式化预测结果
        
        Args:
            prediction: 预测值
            confidence: 置信度
            unit: 单位
            decimals: 小数位数
            
        Returns:
            格式化的结果字符串
        """
        formatted = f"{round(prediction, decimals):,}{unit}"
        
        if confidence is not None:
            formatted += f" (置信度: {confidence*100:.1f}%)"
        
        return formatted
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        获取模型信息
        
        Returns:
            模型信息字典
        """
        if self.model is None:
            self.load_model()
        
        info = {
            'model_type': type(self.model).__name__,
            'model_path': self.model_path,
            'model_name': self.model_name
        }
        
        if hasattr(self.model, 'feature_importances_'):
            info['n_features'] = len(self.model.feature_importances_)
            info['n_estimators'] = getattr(self.model, 'n_estimators', None)
        
        if hasattr(self.model, 'best_params_'):
            info['best_params'] = self.model.best_params_
        
        return info


def estimate_property_value(
    prediction_service: PredictionService,
    property_features: Dict[str, float],
    feature_mapping: Dict[str, str] = None
) -> Dict[str, Any]:
    """
    便捷函数：估计房产价值
    
    Args:
        prediction_service: 预测服务实例
        property_features: 房产特征字典
        feature_mapping: 特征名称映射
        
    Returns:
        估价结果字典
    """
    if feature_mapping:
        property_features = {feature_mapping.get(k, k): v for k, v in property_features.items()}
    
    feature_values = list(property_features.values())
    feature_names = list(property_features.keys())
    
    result = prediction_service.predict(np.array(feature_values))
    
    result['property_features'] = property_features
    result['formatted_value'] = prediction_service.format_prediction_result(
        result['prediction'], 
        result.get('confidence'),
        unit='万元'
    )
    
    return result


def main():
    """
    主函数
    """
    # 定义路径
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    models_path = os.path.join(project_root, 'models')
    processed_data_path = os.path.join(project_root, 'data', 'processed')
    output_path = os.path.join(project_root, 'data', 'processed')
    
    # 模型文件名
    model_filename = 'random_forest_model_v1.joblib'
    
    # 测试数据文件名
    test_data_filename = 'X_test.npy'
    test_labels_filename = 'y_test.npy'
    
    # 1. 加载模型
    model = load_model(models_path, model_filename)
    
    # 2. 加载测试数据
    X_test = load_prediction_data(processed_data_path, test_data_filename)
    
    # 3. 进行预测
    predictions = predict(model, X_test)
    
    # 4. 加载真实值并评估
    y_test = np.load(os.path.join(processed_data_path, test_labels_filename))
    evaluate_predictions(predictions, y_test)
    
    # 5. 保存预测结果
    save_predictions(predictions, output_path, 'predictions.npy')
    
    logger.info("预测流程完成！")


if __name__ == "__main__":
    main()
