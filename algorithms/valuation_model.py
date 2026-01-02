"""
ValuHub AI估价模型
使用机器学习进行房产价值评估
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from datetime import datetime
from typing import Dict, List, Tuple, Optional


class ValuationModel:
    """
    房产估价模型
    支持多种机器学习算法
    """
    
    def __init__(self, model_type: str = 'linear'):
        """
        初始化估价模型
        
        Args:
            model_type: 模型类型 ('linear', 'random_forest', 'ensemble')
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_trained = False
        
        # 初始化模型
        if model_type == 'linear':
            self.model = LinearRegression()
        elif model_type == 'random_forest':
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
        elif model_type == 'ensemble':
            # 集成模型（组合多个模型）
            self.models = {
                'linear': LinearRegression(),
                'rf': RandomForestRegressor(n_estimators=100, random_state=42)
            }
        else:
            raise ValueError(f"不支持的模型类型: {model_type}")
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        特征工程
        
        Args:
            df: 原始数据DataFrame
            
        Returns:
            处理后的特征DataFrame
        """
        # 创建特征副本
        features = df.copy()
        
        # 1. 数值特征标准化
        numeric_features = ['area', 'floor_level', 'building_year', 'rooms', 'bathrooms']
        for feature in numeric_features:
            if feature in features.columns:
                features[feature] = pd.to_numeric(features[feature], errors='coerce')
                features[feature] = features[feature].fillna(features[feature].median())
        
        # 2. 分类特征编码
        categorical_features = ['property_type', 'orientation', 'decoration_status', 'city', 'district']
        for feature in categorical_features:
            if feature in features.columns:
                if feature not in self.label_encoders:
                    self.label_encoders[feature] = LabelEncoder()
                features[feature] = self.label_encoders[feature].fit_transform(
                    features[feature].astype(str)
                )
        
        # 3. 创建衍生特征
        if 'area' in features.columns and 'rooms' in features.columns:
            features['area_per_room'] = features['area'] / features['rooms'].replace(0, 1)
        
        if 'building_year' in features.columns:
            current_year = datetime.now().year
            features['property_age'] = current_year - features['building_year']
            features['age_squared'] = features['property_age'] ** 2
        
        if 'area' in features.columns and 'floor_level' in features.columns:
            features['floor_area_ratio'] = features['floor_level'] / features['area'].replace(0, 1)
        
        return features
    
    def train(self, X: pd.DataFrame, y: pd.Series):
        """
        训练模型
        
        Args:
            X: 特征DataFrame
            y: 目标变量（价格）
        """
        # 特征标准化
        X_scaled = self.scaler.fit_transform(X)
        
        if self.model_type == 'ensemble':
            # 集成模型训练
            for name, model in self.models.items():
                model.fit(X_scaled, y)
            self.is_trained = True
        else:
            # 单一模型训练
            self.model.fit(X_scaled, y)
            self.is_trained = True
        
        print(f"模型训练完成: {self.model_type}")
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        预测房产价格
        
        Args:
            X: 特征DataFrame
            
        Returns:
            预测价格数组
        """
        if not self.is_trained:
            raise ValueError("模型尚未训练，请先调用train()方法")
        
        # 特征标准化
        X_scaled = self.scaler.transform(X)
        
        if self.model_type == 'ensemble':
            # 集成模型预测（平均）
            predictions = []
            for model in self.models.values():
                pred = model.predict(X_scaled)
                predictions.append(pred)
            return np.mean(predictions, axis=0)
        else:
            # 单一模型预测
            return self.model.predict(X_scaled)
    
    def evaluate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        """
        评估模型性能
        
        Args:
            X: 特征DataFrame
            y: 真实价格
            
        Returns:
            评估指标字典
        """
        predictions = self.predict(X)
        
        mse = mean_squared_error(y, predictions)
        rmse = np.sqrt(mse)
        r2 = r2_score(y, predictions)
        
        # 计算平均绝对百分比误差
        mape = np.mean(np.abs((y - predictions) / y)) * 100
        
        return {
            'mse': mse,
            'rmse': rmse,
            'r2_score': r2,
            'mape': mape
        }
    
    def save_model(self, filepath: str):
        """
        保存模型到文件
        
        Args:
            filepath: 模型保存路径
        """
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'model_type': self.model_type,
            'is_trained': self.is_trained
        }
        
        if self.model_type == 'ensemble':
            model_data['models'] = self.models
        
        joblib.dump(model_data, filepath)
        print(f"模型已保存到: {filepath}")
    
    def load_model(self, filepath: str):
        """
        从文件加载模型
        
        Args:
            filepath: 模型文件路径
        """
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.label_encoders = model_data['label_encoders']
        self.model_type = model_data['model_type']
        self.is_trained = model_data['is_trained']
        
        if self.model_type == 'ensemble':
            self.models = model_data['models']
        
        print(f"模型已从 {filepath} 加载")


def load_training_data(filepath: str) -> Tuple[pd.DataFrame, pd.Series]:
    """
    加载训练数据
    
    Args:
        filepath: 数据文件路径
        
    Returns:
        (特征DataFrame, 目标Series)
    """
    df = pd.read_csv(filepath)
    
    # 选择特征列
    feature_columns = [
        'area', 'floor_level', 'building_year', 'rooms', 'bathrooms',
        'property_type', 'orientation', 'decoration_status', 'city', 'district'
    ]
    
    # 选择目标列
    target_column = 'price'
    
    # 检查数据完整性
    missing_features = [col for col in feature_columns if col not in df.columns]
    if missing_features:
        raise ValueError(f"数据缺少以下特征: {missing_features}")
    
    if target_column not in df.columns:
        raise ValueError(f"数据缺少目标列: {target_column}")
    
    X = df[feature_columns]
    y = df[target_column]
    
    print(f"加载数据: {len(df)} 条记录")
    print(f"特征数量: {len(feature_columns)}")
    
    return X, y


def generate_sample_data(n_samples: int = 1000, output_path: str = 'sample_data.csv') -> pd.DataFrame:
    """
    生成模拟训练数据
    
    Args:
        n_samples: 样本数量
        output_path: 输出文件路径
        
    Returns:
        生成的DataFrame
    """
    np.random.seed(42)
    
    # 城市和区域
    cities = ['北京', '上海', '广州', '深圳', '杭州']
    districts = ['朝阳区', '海淀区', '浦东新区', '南山区', '西湖区']
    
    # 房产类型
    property_types = ['residential', 'commercial', 'industrial']
    
    # 朝向
    orientations = ['东', '南', '西', '北', '东南', '西南', '东北', '西北']
    
    # 装修状态
    decoration_statuses = ['毛坯', '简装', '精装', '豪装']
    
    data = []
    
    for i in range(n_samples):
        # 随机生成特征
        area = np.random.randint(30, 300)  # 面积 30-300 平方米
        floor_level = np.random.randint(1, 30)  # 楼层 1-30 层
        building_year = np.random.randint(1990, 2024)  # 建筑年份 1990-2024
        rooms = np.random.randint(1, 5)  # 房间数 1-5 间
        bathrooms = np.random.randint(1, 3)  # 卫生间数 1-3 间
        
        city = np.random.choice(cities)
        district = np.random.choice(districts)
        property_type = np.random.choice(property_types)
        orientation = np.random.choice(orientations)
        decoration_status = np.random.choice(decoration_statuses)
        
        # 计算价格（模拟真实价格分布）
        base_price = 15000  # 基础价格 1.5万/平米
        
        # 面积影响
        area_factor = 1 + (area - 100) / 500
        
        # 楼层影响（高层更贵）
        floor_factor = 1 + (floor_level - 10) / 100
        
        # 房龄影响（新房更贵）
        age = 2024 - building_year
        age_factor = 1 - age / 100
        
        # 城市影响
        city_factor = {
            '北京': 1.2,
            '上海': 1.15,
            '广州': 0.9,
            '深圳': 1.1,
            '杭州': 0.95
        }[city]
        
        # 房产类型影响
        type_factor = {
            'residential': 1.0,
            'commercial': 1.3,
            'industrial': 0.8
        }[property_type]
        
        # 装修影响
        decoration_factor = {
            '毛坯': 0.8,
            '简装': 0.9,
            '精装': 1.1,
            '豪装': 1.3
        }[decoration_status]
        
        # 计算最终价格
        price_per_sqm = base_price * area_factor * floor_factor * age_factor * city_factor * type_factor * decoration_factor
        total_price = price_per_sqm * area
        
        # 添加随机噪声
        total_price *= np.random.uniform(0.9, 1.1)
        
        data.append({
            'area': area,
            'floor_level': floor_level,
            'building_year': building_year,
            'rooms': rooms,
            'bathrooms': bathrooms,
            'property_type': property_type,
            'orientation': orientation,
            'decoration_status': decoration_status,
            'city': city,
            'district': district,
            'price': round(total_price, 2)
        })
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"模拟数据已生成: {output_path}")
    
    return df


def train_valuation_model(
    data_path: str = 'sample_data.csv',
    model_type: str = 'random_forest',
    test_size: float = 0.2,
    output_path: str = 'valuation_model.pkl'
) -> ValuationModel:
    """
    训练估价模型
    
    Args:
        data_path: 训练数据路径
        model_type: 模型类型
        test_size: 测试集比例
        output_path: 模型输出路径
        
    Returns:
        训练好的模型
    """
    # 加载数据
    X, y = load_training_data(data_path)
    
    # 特征工程
    model = ValuationModel(model_type=model_type)
    X_processed = model.prepare_features(X)
    
    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y, test_size=test_size, random_state=42
    )
    
    # 训练模型
    model.train(X_train, y_train)
    
    # 评估模型
    evaluation = model.evaluate(X_test, y_test)
    print("\n模型评估结果:")
    print(f"  均方误差 (MSE): {evaluation['mse']:.2f}")
    print(f"  均方根误差 (RMSE): {evaluation['rmse']:.2f}")
    print(f"  R²分数: {evaluation['r2_score']:.4f}")
    print(f"  平均绝对百分比误差 (MAPE): {evaluation['mape']:.2f}%")
    
    # 保存模型
    model.save_model(output_path)
    
    return model


def predict_price(
    model_path: str = 'valuation_model.pkl',
    property_features: Dict[str, any] = None
) -> Dict[str, float]:
    """
    预测房产价格
    
    Args:
        model_path: 模型文件路径
        property_features: 房产特征字典
        
    Returns:
        预测结果字典
    """
    # 加载模型
    model = ValuationModel()
    model.load_model(model_path)
    
    # 准备特征
    feature_df = pd.DataFrame([property_features])
    X_processed = model.prepare_features(feature_df)
    
    # 预测价格
    predicted_price = model.predict(X_processed)[0]
    
    # 计算置信度（基于特征完整性）
    confidence = calculate_confidence(property_features)
    
    return {
        'predicted_price': round(predicted_price, 2),
        'price_per_sqm': round(predicted_price / property_features.get('area', 1), 2),
        'confidence': confidence,
        'model_type': model.model_type
    }


def calculate_confidence(features: Dict[str, any]) -> float:
    """
    计算预测置信度
    
    Args:
        features: 房产特征字典
        
    Returns:
        置信度 (0.0-1.0)
    """
    confidence = 1.0
    
    # 检查特征完整性
    required_features = ['area', 'city', 'property_type']
    for feature in required_features:
        if feature not in features or features[feature] is None:
            confidence -= 0.1
    
    # 检查特征合理性
    if features.get('area', 0) < 30 or features.get('area', 0) > 500:
        confidence -= 0.05
    
    if features.get('building_year', 2024) < 1990 or features.get('building_year', 2024) > 2024:
        confidence -= 0.05
    
    # 确保置信度在合理范围内
    confidence = max(0.5, min(1.0, confidence))
    
    return round(confidence, 2)


if __name__ == '__main__':
    print("=" * 60)
    print("ValuHub AI估价模型训练")
    print("=" * 60)
    
    # 生成模拟数据
    print("\n1. 生成模拟训练数据...")
    generate_sample_data(n_samples=5000, output_path='sample_data.csv')
    
    # 训练模型
    print("\n2. 训练估价模型...")
    model = train_valuation_model(
        data_path='sample_data.csv',
        model_type='random_forest',
        test_size=0.2,
        output_path='valuation_model.pkl'
    )
    
    # 测试预测
    print("\n3. 测试预测功能...")
    test_property = {
        'area': 100,
        'floor_level': 15,
        'building_year': 2015,
        'rooms': 3,
        'bathrooms': 2,
        'property_type': 'residential',
        'orientation': '南',
        'decoration_status': '精装',
        'city': '北京',
        'district': '朝阳区'
    }
    
    result = predict_price(
        model_path='valuation_model.pkl',
        property_features=test_property
    )
    
    print("\n预测结果:")
    print(f"  预测价格: {result['predicted_price']:.2f} 元")
    print(f"  每平米价格: {result['price_per_sqm']:.2f} 元/平米")
    print(f"  置信度: {result['confidence']:.2f}")
    print(f"  模型类型: {result['model_type']}")
    
    print("\n" + "=" * 60)
    print("模型训练完成！")
    print("=" * 60)
