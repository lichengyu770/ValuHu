#!/usr/bin/env python3
"""
数据处理模块单元测试
"""

import os
import sys
import pytest
import pandas as pd
import numpy as np

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.data.make_dataset import (
    load_data,
    clean_data,
    transform_data,
    split_data,
    save_data
)


class TestMakeDataset:
    """测试数据处理模块"""
    
    def setup_class(self):
        """在所有测试前设置测试数据"""
        # 创建有真正重复行的测试数据
        self.test_data = pd.DataFrame({
            'numeric1': [1.0, 2.0, 3.0, 2.0, 5.0, None],
            'numeric2': [10.0, 20.0, 30.0, 20.0, 50.0, 60.0],
            'categorical': ['A', 'B', 'A', 'B', 'C', 'A'],
            'date': ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-02', '2020-01-05', '2020-01-06'],
            'duplicate': [1, 2, 3, 2, 2, 3],
            'target': [100, 200, 300, 200, 200, 600]
        })
        
        self.test_csv_path = 'test_data.csv'
        self.test_data.to_csv(self.test_csv_path, index=False)
    
    def teardown_class(self):
        """在所有测试后清理测试数据"""
        if os.path.exists(self.test_csv_path):
            os.remove(self.test_csv_path)
        
        # 清理测试生成的文件
        for file in ['X_train.npy', 'X_test.npy', 'y_train.npy', 'y_test.npy',
                    'X_val.npy', 'y_val.npy', 'X_train.csv', 'X_test.csv',
                    'y_train.csv', 'y_test.csv', 'X_val.csv', 'y_val.csv']:
            if os.path.exists(file):
                os.remove(file)
        
        # 清理测试目录
        if os.path.exists('test_output'):
            import shutil
            shutil.rmtree('test_output')
    
    def test_load_data_csv(self):
        """测试加载CSV数据"""
        data = load_data(self.test_csv_path, file_format='csv')
        assert isinstance(data, pd.DataFrame)
        assert data.shape == (6, 6)
    
    def test_clean_data(self):
        """测试数据清洗功能"""
        cleaned_data = clean_data(
            self.test_data.copy(),
            drop_duplicates=True,
            handle_missing='fill',
            outlier_method=None
        )
        
        # 检查重复值是否被删除
        assert cleaned_data.shape[0] < self.test_data.shape[0]
        
        # 检查缺失值是否被填充
        assert cleaned_data['numeric1'].isnull().sum() == 0
    
    def test_transform_data(self):
        """测试数据转换功能"""
        transformed_data = transform_data(
            self.test_data.copy(),
            date_columns=['date'],
            lowercase_columns=True,
            strip_columns=True
        )
        
        # 检查列名是否转为小写
        assert all(col.islower() for col in transformed_data.columns)
        
        # 检查日期列是否被转换
        assert pd.api.types.is_datetime64_any_dtype(transformed_data['date'])
    
    def test_split_data(self):
        """测试数据划分功能"""
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(
            self.test_data.copy(),
            target_column='target',
            test_size=0.33,
            val_size=0.25
        )
        
        # 检查数据划分比例是否正确
        total_size = len(self.test_data)
        assert len(X_train) + len(X_val) + len(X_test) == total_size
        
        # 检查验证集是否正确返回
        assert X_val is not None and y_val is not None
    
    def test_split_data_no_validation(self):
        """测试不生成验证集的数据划分"""
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(
            self.test_data.copy(),
            target_column='target',
            test_size=0.33,
            val_size=0.0
        )
        
        # 检查验证集是否为None
        assert X_val is None and y_val is None
    
    def test_save_data_npy(self):
        """测试保存为npy格式"""
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(
            self.test_data.copy(),
            target_column='target',
            test_size=0.33,
            val_size=0.0
        )
        
        save_data(X_train, X_test, y_train, y_test, 'test_output', format='npy')
        
        # 检查文件是否生成
        assert os.path.exists('test_output/X_train.npy')
        assert os.path.exists('test_output/X_test.npy')
        assert os.path.exists('test_output/y_train.npy')
        assert os.path.exists('test_output/y_test.npy')
    
    def test_save_data_csv(self):
        """测试保存为csv格式"""
        X_train, X_val, X_test, y_train, y_val, y_test = split_data(
            self.test_data.copy(),
            target_column='target',
            test_size=0.33,
            val_size=0.25
        )
        
        save_data(X_train, X_test, y_train, y_test, 'test_output', X_val, y_val, format='csv')
        
        # 检查文件是否生成
        assert os.path.exists('test_output/X_train.csv')
        assert os.path.exists('test_output/X_test.csv')
        assert os.path.exists('test_output/y_train.csv')
        assert os.path.exists('test_output/y_test.csv')
        assert os.path.exists('test_output/X_val.csv')
        assert os.path.exists('test_output/y_val.csv')
    
    def test_clean_data_outliers(self):
        """测试异常值处理"""
        # 添加异常值
        data_with_outliers = self.test_data.copy()
        data_with_outliers.loc[0, 'numeric1'] = 1000  # 极大值
        data_with_outliers.loc[1, 'numeric1'] = -1000  # 极小值
        
        cleaned_data = clean_data(
            data_with_outliers,
            outlier_method='iqr',
            handle_missing='mean'
        )
        
        # 检查异常值是否被删除
        assert len(cleaned_data) < len(data_with_outliers)
