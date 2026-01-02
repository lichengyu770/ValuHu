"""
ValuHub 数据清洗脚本
处理原始房产数据，清洗和转换
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import re


class DataCleaner:
    """
    数据清洗类
    """
    
    def __init__(self, df: pd.DataFrame):
        """
        初始化数据清洗器
        
        Args:
            df: 原始数据DataFrame
        """
        self.df = df.copy()
        self.cleaning_log = []
    
    def remove_duplicates(self) -> pd.DataFrame:
        """
        移除重复记录
        
        Returns:
            清洗后的DataFrame
        """
        initial_count = len(self.df)
        self.df = self.df.drop_duplicates()
        final_count = len(self.df)
        
        removed = initial_count - final_count
        if removed > 0:
            self.cleaning_log.append(f"移除重复记录: {removed} 条")
        
        return self.df
    
    def handle_missing_values(self, strategy: str = 'median') -> pd.DataFrame:
        """
        处理缺失值
        
        Args:
            strategy: 处理策略 ('median', 'mean', 'mode', 'drop')
            
        Returns:
            清洗后的DataFrame
        """
        missing_before = self.df.isnull().sum().sum()
        
        numeric_columns = self.df.select_dtypes(include=[np.number]).columns
        categorical_columns = self.df.select_dtypes(include=['object']).columns
        
        if strategy == 'drop':
            # 删除包含缺失值的行
            self.df = self.df.dropna()
        elif strategy == 'median':
            # 数值列使用中位数填充
            for col in numeric_columns:
                if self.df[col].isnull().any():
                    median_value = self.df[col].median()
                    self.df[col].fillna(median_value, inplace=True)
                    self.cleaning_log.append(f"{col}: 使用中位数填充缺失值")
        elif strategy == 'mean':
            # 数值列使用平均值填充
            for col in numeric_columns:
                if self.df[col].isnull().any():
                    mean_value = self.df[col].mean()
                    self.df[col].fillna(mean_value, inplace=True)
                    self.cleaning_log.append(f"{col}: 使用平均值填充缺失值")
        elif strategy == 'mode':
            # 分类列使用众数填充
            for col in categorical_columns:
                if self.df[col].isnull().any():
                    mode_value = self.df[col].mode()[0]
                    self.df[col].fillna(mode_value, inplace=True)
                    self.cleaning_log.append(f"{col}: 使用众数填充缺失值")
        
        missing_after = self.df.isnull().sum().sum()
        self.cleaning_log.append(f"缺失值处理: {missing_before} -> {missing_after}")
        
        return self.df
    
    def remove_outliers(self, column: str, method: str = 'iqr') -> pd.DataFrame:
        """
        移除异常值
        
        Args:
            column: 要处理的列名
            method: 处理方法 ('iqr', 'zscore', 'percentile')
            
        Returns:
            清洗后的DataFrame
        """
        if column not in self.df.columns:
            return self.df
        
        initial_count = len(self.df)
        
        if method == 'iqr':
            # 使用IQR方法
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = (self.df[column] < lower_bound) | (self.df[column] > upper_bound)
            self.df = self.df[~outliers]
            
        elif method == 'zscore':
            # 使用Z-score方法
            mean = self.df[column].mean()
            std = self.df[column].std()
            z_scores = np.abs((self.df[column] - mean) / std)
            
            outliers = z_scores > 3
            self.df = self.df[~outliers]
            
        elif method == 'percentile':
            # 使用百分位数方法
            lower_percentile = self.df[column].quantile(0.05)
            upper_percentile = self.df[column].quantile(0.95)
            
            outliers = (self.df[column] < lower_percentile) | (self.df[column] > upper_percentile)
            self.df = self.df[~outliers]
        
        final_count = len(self.df)
        removed = initial_count - final_count
        if removed > 0:
            self.cleaning_log.append(f"{column}: 移除异常值: {removed} 条 (方法: {method})")
        
        return self.df
    
    def standardize_text(self, column: str) -> pd.DataFrame:
        """
        标准化文本数据
        
        Args:
            column: 要处理的列名
            
        Returns:
            清洗后的DataFrame
        """
        if column not in self.df.columns:
            return self.df
        
        # 移除前后空格
        self.df[column] = self.df[column].str.strip()
        
        # 统一大小写
        self.df[column] = self.df[column].str.upper()
        
        # 移除特殊字符
        self.df[column] = self.df[column].str.replace(r'[^\w\s]', '', regex=True)
        
        self.cleaning_log.append(f"{column}: 文本标准化完成")
        
        return self.df
    
    def validate_ranges(self, rules: Dict[str, Tuple[float, float]]) -> pd.DataFrame:
        """
        验证数据范围
        
        Args:
            rules: 验证规则字典 {列名: (最小值, 最大值)}
            
        Returns:
            清洗后的DataFrame
        """
        for column, (min_val, max_val) in rules.items():
            if column in self.df.columns:
                invalid_mask = (self.df[column] < min_val) | (self.df[column] > max_val)
                invalid_count = invalid_mask.sum()
                
                if invalid_count > 0:
                    self.cleaning_log.append(f"{column}: 移除超出范围的值: {invalid_count} 条")
                    self.df = self.df[~invalid_mask]
        
        return self.df
    
    def get_cleaning_report(self) -> Dict[str, any]:
        """
        获取清洗报告
        
        Returns:
            清洗报告字典
        """
        return {
            'initial_records': len(self.df),
            'final_records': len(self.df),
            'cleaning_log': self.cleaning_log,
            'data_shape': self.df.shape,
            'columns': list(self.df.columns),
            'missing_values': self.df.isnull().sum().to_dict(),
            'data_types': self.df.dtypes.to_dict()
        }


def clean_property_data(
    input_path: str = 'raw_data.csv',
    output_path: str = 'cleaned_data.csv'
) -> pd.DataFrame:
    """
    清洗房产数据
    
    Args:
        input_path: 输入文件路径
        output_path: 输出文件路径
        
    Returns:
        清洗后的DataFrame
    """
    print("=" * 60)
    print("ValuHub 数据清洗")
    print("=" * 60)
    
    # 加载原始数据
    print(f"\n1. 加载数据: {input_path}")
    df = pd.read_csv(input_path)
    print(f"   原始记录数: {len(df)}")
    print(f"   列数: {len(df.columns)}")
    
    # 创建数据清洗器
    cleaner = DataCleaner(df)
    
    # 2. 移除重复记录
    print("\n2. 移除重复记录...")
    cleaner.remove_duplicates()
    
    # 3. 处理缺失值
    print("\n3. 处理缺失值...")
    cleaner.handle_missing_values(strategy='median')
    
    # 4. 移除异常值
    print("\n4. 移除异常值...")
    cleaner.remove_outliers('area', method='iqr')
    cleaner.remove_outliers('price', method='iqr')
    cleaner.remove_outliers('floor_level', method='iqr')
    
    # 5. 验证数据范围
    print("\n5. 验证数据范围...")
    validation_rules = {
        'area': (30, 500),  # 面积 30-500 平方米
        'floor_level': (1, 50),  # 楼层 1-50 层
        'building_year': (1990, 2024),  # 建筑年份 1990-2024
        'rooms': (1, 10),  # 房间数 1-10 间
        'bathrooms': (1, 5),  # 卫生间数 1-5 间
        'price': (100000, 10000000)  # 价格 10万-1000万
    }
    cleaner.validate_ranges(validation_rules)
    
    # 6. 标准化文本数据
    print("\n6. 标准化文本数据...")
    text_columns = ['city', 'district', 'property_type', 'orientation', 'decoration_status']
    for col in text_columns:
        if col in cleaner.df.columns:
            cleaner.standardize_text(col)
    
    # 7. 保存清洗后的数据
    print("\n7. 保存清洗后的数据...")
    cleaner.df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"   输出文件: {output_path}")
    
    # 8. 生成清洗报告
    print("\n8. 生成清洗报告...")
    report = cleaner.get_cleaning_report()
    
    print("\n清洗报告:")
    print(f"  初始记录数: {report['initial_records']}")
    print(f"  最终记录数: {report['final_records']}")
    print(f"  清洗后记录数: {report['final_records']}")
    print(f"  数据形状: {report['data_shape']}")
    print(f"  列名: {report['columns']}")
    print("\n清洗日志:")
    for log in report['cleaning_log']:
        print(f"  - {log}")
    
    print("\n缺失值统计:")
    for col, count in report['missing_values'].items():
        if count > 0:
            print(f"  {col}: {count}")
    
    print("\n数据类型:")
    for col, dtype in report['data_types'].items():
        print(f"  {col}: {dtype}")
    
    print("\n" + "=" * 60)
    print("数据清洗完成！")
    print("=" * 60)
    
    return cleaner.df


if __name__ == '__main__':
    # 先生成模拟数据
    print("生成模拟原始数据...")
    from algorithms.valuation_model import generate_sample_data
    generate_sample_data(n_samples=1000, output_path='raw_data.csv')
    
    # 清洗数据
    clean_property_data(
        input_path='raw_data.csv',
        output_path='cleaned_data.csv'
    )
