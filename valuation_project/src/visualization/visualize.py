#!/usr/bin/env python3
"""
可视化脚本

该脚本负责数据可视化功能，支持多种图表类型，并将图表保存到reports/figures/目录。
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List, Optional


# 设置中文字体，确保中文显示正常
try:
    plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
    plt.rcParams['axes.unicode_minus'] = False
    print("已设置中文字体")
except Exception as e:
    print(f"设置中文字体失败: {e}")


class Visualizer:
    """可视化类，提供各种图表绘制功能"""
    
    def __init__(self, save_dir: str = None):
        """
        初始化可视化器
        
        Args:
            save_dir: 图表保存目录，如果为None则不保存图表
        """
        self.save_dir = save_dir
        
        # 如果指定了保存目录，确保目录存在
        if save_dir is not None:
            os.makedirs(save_dir, exist_ok=True)
            print(f"图表将保存到: {save_dir}")
        
        # 设置默认样式
        plt.style.use('seaborn-v0_8-darkgrid')
        sns.set_palette('Set2')
    
    def save_figure(self, filename: str, dpi: int = 300) -> None:
        """
        保存图表
        
        Args:
            filename: 图表文件名
            dpi: 图表分辨率
        """
        if self.save_dir is None:
            print("未指定保存目录，跳过保存图表")
            return
        
        # 构建完整路径
        filepath = os.path.join(self.save_dir, filename)
        
        # 保存图表
        plt.savefig(filepath, dpi=dpi, bbox_inches='tight')
        print(f"图表已保存至: {filepath}")
    
    def plot_histogram(self, data: np.ndarray or pd.Series, bins: int = 30, title: str = '直方图', 
                      xlabel: str = '值', ylabel: str = '频率', save_filename: Optional[str] = None) -> None:
        """
        绘制直方图
        
        Args:
            data: 要绘制的数据
            bins: 直方图的柱数
            title: 图表标题
            xlabel: x轴标签
            ylabel: y轴标签
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制直方图: {title}")
        
        plt.figure(figsize=(10, 6))
        
        if isinstance(data, pd.Series):
            sns.histplot(data, bins=bins, kde=True)
        else:
            sns.histplot(data.flatten(), bins=bins, kde=True)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_boxplot(self, data: pd.DataFrame, x: Optional[str] = None, y: str = None, 
                   title: str = '箱线图', save_filename: Optional[str] = None) -> None:
        """
        绘制箱线图
        
        Args:
            data: 要绘制的数据DataFrame
            x: x轴列名，如果为None则绘制单箱线图
            y: y轴列名
            title: 图表标题
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制箱线图: {title}")
        
        plt.figure(figsize=(12, 7))
        
        sns.boxplot(x=x, y=y, data=data)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_scatter(self, x: np.ndarray, y: np.ndarray, title: str = '散点图', 
                    xlabel: str = 'X', ylabel: str = 'Y', save_filename: Optional[str] = None) -> None:
        """
        绘制散点图
        
        Args:
            x: x轴数据
            y: y轴数据
            title: 图表标题
            xlabel: x轴标签
            ylabel: y轴标签
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制散点图: {title}")
        
        plt.figure(figsize=(10, 6))
        
        plt.scatter(x, y, alpha=0.7, edgecolors='w', s=50)
        
        # 计算并绘制回归线
        z = np.polyfit(x, y, 1)
        p = np.poly1d(z)
        plt.plot(x, p(x), "r--", lw=2)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_correlation_matrix(self, data: pd.DataFrame, title: str = '相关性矩阵热力图', 
                              save_filename: Optional[str] = None) -> None:
        """
        绘制相关性矩阵热力图
        
        Args:
            data: 要绘制的数据DataFrame
            title: 图表标题
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制相关性矩阵热力图: {title}")
        
        plt.figure(figsize=(12, 10))
        
        # 计算相关性矩阵
        corr_matrix = data.corr()
        
        # 绘制热力图
        mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
        sns.heatmap(corr_matrix, mask=mask, annot=True, fmt=".2f", cmap='coolwarm', 
                   square=True, linewidths=0.5, cbar_kws={"shrink": 0.8})
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_feature_importance(self, feature_names: List[str], importances: np.ndarray, 
                              title: str = '特征重要性', top_n: Optional[int] = None, 
                              save_filename: Optional[str] = None) -> None:
        """
        绘制特征重要性条形图
        
        Args:
            feature_names: 特征名称列表
            importances: 特征重要性数组
            title: 图表标题
            top_n: 只显示前n个重要的特征，如果为None则显示所有特征
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制特征重要性条形图: {title}")
        
        # 创建特征重要性DataFrame
        importance_df = pd.DataFrame({'feature': feature_names, 'importance': importances})
        
        # 按重要性排序
        importance_df = importance_df.sort_values('importance', ascending=False)
        
        # 如果指定了top_n，只保留前n个
        if top_n:
            importance_df = importance_df.head(top_n)
        
        plt.figure(figsize=(12, max(6, len(importance_df) * 0.4)))
        
        sns.barplot(x='importance', y='feature', data=importance_df, palette='Set1')
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel('重要性', fontsize=12)
        plt.ylabel('特征', fontsize=12)
        plt.grid(True, alpha=0.3, axis='x')
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_line(self, x: np.ndarray or List, y: np.ndarray or List, title: str = '折线图', 
                 xlabel: str = 'X', ylabel: str = 'Y', save_filename: Optional[str] = None) -> None:
        """
        绘制折线图
        
        Args:
            x: x轴数据
            y: y轴数据
            title: 图表标题
            xlabel: x轴标签
            ylabel: y轴标签
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制折线图: {title}")
        
        plt.figure(figsize=(10, 6))
        
        plt.plot(x, y, marker='o', linewidth=2, markersize=6)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_multi_line(self, x: np.ndarray or List, y_dict: Dict[str, np.ndarray or List], 
                      title: str = '多折线图', xlabel: str = 'X', ylabel: str = 'Y', 
                      save_filename: Optional[str] = None) -> None:
        """
        绘制多折线图
        
        Args:
            x: x轴数据
            y_dict: 包含多条线数据的字典，键为线的名称，值为y轴数据
            title: 图表标题
            xlabel: x轴标签
            ylabel: y轴标签
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制多折线图: {title}")
        
        plt.figure(figsize=(12, 7))
        
        for name, y in y_dict.items():
            plt.plot(x, y, marker='o', linewidth=2, markersize=6, label=name)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)
        plt.legend(fontsize=12, loc='best')
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_bar(self, categories: List[str], values: np.ndarray or List, title: str = '条形图', 
                xlabel: str = '类别', ylabel: str = '值', save_filename: Optional[str] = None) -> None:
        """
        绘制条形图
        
        Args:
            categories: 类别列表
            values: 对应的值列表
            title: 图表标题
            xlabel: x轴标签
            ylabel: y轴标签
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制条形图: {title}")
        
        plt.figure(figsize=(12, 7))
        
        sns.barplot(x=categories, y=values, palette='Set2')
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3, axis='y')
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_pie(self, labels: List[str], values: List[float], title: str = '饼图', 
                autopct: str = '%.1f%%', save_filename: Optional[str] = None) -> None:
        """
        绘制饼图
        
        Args:
            labels: 饼图的标签
            values: 对应的值
            title: 图表标题
            autopct: 百分比显示格式
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制饼图: {title}")
        
        plt.figure(figsize=(8, 8))
        
        plt.pie(values, labels=labels, autopct=autopct, startangle=90, 
                wedgeprops={'edgecolor': 'white', 'linewidth': 1})
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.axis('equal')  # 确保饼图是圆形
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_residuals(self, y_true: np.ndarray, y_pred: np.ndarray, title: str = '残差图', 
                     save_filename: Optional[str] = None) -> None:
        """
        绘制残差图
        
        Args:
            y_true: 真实值
            y_pred: 预测值
            title: 图表标题
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制残差图: {title}")
        
        # 计算残差
        residuals = y_true - y_pred
        
        plt.figure(figsize=(10, 6))
        
        # 绘制残差与预测值的散点图
        plt.scatter(y_pred, residuals, alpha=0.7, edgecolors='w', s=50)
        
        # 添加参考线
        plt.axhline(y=0, color='r', linestyle='--', linewidth=2)
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel('预测值', fontsize=12)
        plt.ylabel('残差', fontsize=12)
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()
    
    def plot_learning_curve(self, train_scores: List[float], test_scores: List[float], 
                           train_sizes: List[int], title: str = '学习曲线', 
                           save_filename: Optional[str] = None) -> None:
        """
        绘制学习曲线
        
        Args:
            train_scores: 训练集分数列表
            test_scores: 测试集分数列表
            train_sizes: 训练样本数量列表
            title: 图表标题
            save_filename: 保存的文件名，如果为None则不保存
        """
        print(f"开始绘制学习曲线: {title}")
        
        # 计算均值和标准差
        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        test_mean = np.mean(test_scores, axis=1)
        test_std = np.std(test_scores, axis=1)
        
        plt.figure(figsize=(10, 6))
        
        # 绘制训练集分数
        plt.plot(train_sizes, train_mean, 'o-', color='r', label='训练集分数')
        plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, 
                        alpha=0.1, color='r')
        
        # 绘制测试集分数
        plt.plot(train_sizes, test_mean, 'o-', color='g', label='测试集分数')
        plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, 
                        alpha=0.1, color='g')
        
        plt.title(title, fontsize=16, fontweight='bold')
        plt.xlabel('训练样本数量', fontsize=12)
        plt.ylabel('分数', fontsize=12)
        plt.legend(fontsize=12)
        plt.grid(True, alpha=0.3)
        
        if save_filename:
            self.save_figure(save_filename)
        
        plt.show()
        plt.close()


def main():
    """
    主函数，用于测试可视化功能
    """
    # 创建可视化器实例
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    save_dir = os.path.join(project_root, 'reports', 'figures')
    visualizer = Visualizer(save_dir=save_dir)
    
    # 创建示例数据
    np.random.seed(42)
    
    # 1. 绘制直方图
    data = np.random.normal(0, 1, 1000)
    visualizer.plot_histogram(data, title='正态分布直方图', 
                            xlabel='值', ylabel='频率', 
                            save_filename='histogram.png')
    
    # 2. 绘制散点图
    x = np.linspace(0, 10, 100)
    y = 2 * x + np.random.normal(0, 1, 100)
    visualizer.plot_scatter(x, y, title='线性关系散点图', 
                          xlabel='X', ylabel='Y', 
                          save_filename='scatter.png')
    
    # 3. 绘制饼图
    labels = ['类别A', '类别B', '类别C', '类别D']
    values = [30, 25, 20, 25]
    visualizer.plot_pie(labels, values, title='类分布饼图', 
                      save_filename='pie.png')
    
    # 4. 绘制条形图
    categories = ['一月', '二月', '三月', '四月', '五月', '六月']
    values = [120, 190, 150, 200, 250, 180]
    visualizer.plot_bar(categories, values, title='月度销售额', 
                      xlabel='月份', ylabel='销售额（万元）', 
                      save_filename='bar.png')
    
    # 5. 绘制特征重要性
    feature_names = [f'特征{i}' for i in range(1, 11)]
    importances = np.random.rand(10)
    visualizer.plot_feature_importance(feature_names, importances, 
                                     title='特征重要性', top_n=8, 
                                     save_filename='feature_importance.png')
    
    print("可视化功能测试完成！")


if __name__ == "__main__":
    main()
