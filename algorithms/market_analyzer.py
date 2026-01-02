"""
ValuHub 市场分析图表生成
生成市场趋势、区域对比、价格分布等可视化图表
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # 使用非交互式后端
import matplotlib.font_manager as fm
from typing import Dict, List, Optional
import os
from datetime import datetime


# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'Microsoft YaHei']
plt.rcParams['axes.unicode_minus'] = False


class MarketAnalyzer:
    """
    市场分析器
    生成各种市场分析图表
    """
    
    def __init__(self, df: pd.DataFrame):
        """
        初始化市场分析器
        
        Args:
            df: 市场数据DataFrame
        """
        self.df = df.copy()
        self.output_dir = 'charts'
        os.makedirs(self.output_dir, exist_ok=True)
    
    def price_trend_chart(self, city: str, district: Optional[str] = None) -> str:
        """
        生成价格趋势图
        
        Args:
            city: 城市名称
            district: 区域名称（可选）
            
        Returns:
            图表文件路径
        """
        # 筛选数据
        if district:
            data = self.df[(self.df['city'] == city) & (self.df['district'] == district)]
        else:
            data = self.df[self.df['city'] == city]
        
        # 按月份聚合
        data['date'] = pd.to_datetime(data['date'])
        data['month'] = data['date'].dt.to_period('M')
        
        monthly_data = data.groupby('month').agg({
            'price': 'mean',
            'count': 'count'
        }).reset_index()
        
        # 创建图表
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10))
        
        # 价格趋势
        ax1.plot(
            monthly_data['month'].astype(str),
            monthly_data['price'],
            marker='o',
            linewidth=2,
            markersize=8,
            color='#667eea'
        )
        ax1.set_xlabel('月份', fontsize=12)
        ax1.set_ylabel('平均价格（万元）', fontsize=12)
        ax1.set_title(f'{city} {district or ""} 房产价格趋势', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.tick_params(axis='x', rotation=45)
        
        # 成交量趋势
        ax2.bar(
            monthly_data['month'].astype(str),
            monthly_data['count'],
            alpha=0.6,
            color='#764ba2'
        )
        ax2.set_xlabel('月份', fontsize=12)
        ax2.set_ylabel('成交量（套）', fontsize=12)
        ax2.grid(True, alpha=0.3)
        ax2.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        
        # 保存图表
        filename = f"{self.output_dir}/price_trend_{city}_{district or 'all'}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"价格趋势图已生成: {filename}")
        return filename
    
    def area_comparison_chart(self, cities: List[str]) -> str:
        """
        生成区域对比图
        
        Args:
            cities: 城市列表
            
        Returns:
            图表文件路径
        """
        # 筛选数据
        data = self.df[self.df['city'].isin(cities)]
        
        # 按城市聚合
        city_data = data.groupby('city').agg({
            'price': 'mean',
            'price_per_sqm': 'mean',
            'count': 'count'
        }).reset_index()
        
        # 创建图表
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # 平均价格对比
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
        bars1 = ax1.bar(
            city_data['city'],
            city_data['price'] / 10000,  # 转换为万元
            color=colors[:len(cities)],
            alpha=0.8
        )
        ax1.set_xlabel('城市', fontsize=12)
        ax1.set_ylabel('平均价格（万元）', fontsize=12)
        ax1.set_title('各城市房产平均价格对比', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3, axis='y')
        
        # 添加数值标签
        for bar in bars1:
            height = bar.get_height()
            ax1.text(
                bar.get_x() + bar.get_width() / 2.,
                height,
                f'{height:.1f}',
                ha='center',
                va='bottom',
                fontsize=10
            )
        
        # 每平米价格对比
        bars2 = ax2.bar(
            city_data['city'],
            city_data['price_per_sqm'] / 10000,
            color=colors[:len(cities)],
            alpha=0.8
        )
        ax2.set_xlabel('城市', fontsize=12)
        ax2.set_ylabel('每平米价格（万元）', fontsize=12)
        ax2.set_title('各城市每平米价格对比', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3, axis='y')
        
        # 添加数值标签
        for bar in bars2:
            height = bar.get_height()
            ax2.text(
                bar.get_x() + bar.get_width() / 2.,
                height,
                f'{height:.2f}',
                ha='center',
                va='bottom',
                fontsize=10
            )
        
        plt.tight_layout()
        
        # 保存图表
        filename = f"{self.output_dir}/area_comparison.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"区域对比图已生成: {filename}")
        return filename
    
    def price_distribution_chart(self, city: str) -> str:
        """
        生成价格分布图
        
        Args:
            city: 城市名称
            
        Returns:
            图表文件路径
        """
        # 筛选数据
        data = self.df[self.df['city'] == city]
        
        # 创建图表
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # 价格直方图
        ax1.hist(
            data['price'] / 10000,  # 转换为万元
            bins=30,
            color='#667eea',
            alpha=0.7,
            edgecolor='black'
        )
        ax1.set_xlabel('价格（万元）', fontsize=12)
        ax1.set_ylabel('频数', fontsize=12)
        ax1.set_title(f'{city} 房产价格分布', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        
        # 添加统计信息
        mean_price = data['price'].mean() / 10000
        median_price = data['price'].median() / 10000
        ax1.axvline(mean_price, color='red', linestyle='--', linewidth=2, label=f'平均值: {mean_price:.1f}')
        ax1.axvline(median_price, color='green', linestyle='--', linewidth=2, label=f'中位数: {median_price:.1f}')
        ax1.legend()
        
        # 价格箱线图
        property_types = data['property_type'].unique()
        price_by_type = [data[data['property_type'] == pt]['price'] / 10000 for pt in property_types]
        
        bp = ax2.boxplot(price_by_type, labels=property_types, patch_artist=True)
        for patch in bp['boxes']:
            patch.set_facecolor('#764ba2')
            patch.set_alpha(0.7)
        
        ax2.set_xlabel('房产类型', fontsize=12)
        ax2.set_ylabel('价格（万元）', fontsize=12)
        ax2.set_title(f'{city} 各类型房产价格分布', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # 保存图表
        filename = f"{self.output_dir}/price_distribution_{city}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"价格分布图已生成: {filename}")
        return filename
    
    def property_type_pie_chart(self, city: str) -> str:
        """
        生成房产类型饼图
        
        Args:
            city: 城市名称
            
        Returns:
            图表文件路径
        """
        # 筛选数据
        data = self.df[self.df['city'] == city]
        
        # 按类型统计
        type_counts = data['property_type'].value_counts()
        
        # 创建图表
        fig, ax = plt.subplots(figsize=(10, 10))
        
        colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
        explode = [0.1 if i == 0 else 0 for i in range(len(type_counts))]
        
        wedges, texts, autotexts = ax.pie(
            type_counts.values,
            explode=explode,
            labels=type_counts.index,
            colors=colors[:len(type_counts)],
            autopct='%1.1f%%',
            startangle=90,
            shadow=True
        )
        
        ax.set_title(f'{city} 房产类型分布', fontsize=14, fontweight='bold')
        
        # 添加图例
        ax.legend(wedges, type_counts.index, title="房产类型", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
        
        plt.tight_layout()
        
        # 保存图表
        filename = f"{self.output_dir}/property_type_pie_{city}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"房产类型饼图已生成: {filename}")
        return filename


def generate_market_analysis_report(
    data_path: str = 'cleaned_data.csv',
    output_dir: str = 'charts'
) -> Dict[str, str]:
    """
    生成市场分析报告
    
    Args:
        data_path: 数据文件路径
        output_dir: 输出目录
        
    Returns:
        生成的图表文件路径字典
    """
    print("=" * 60)
    print("ValuHub 市场分析图表生成")
    print("=" * 60)
    
    # 加载数据
    print(f"\n1. 加载数据: {data_path}")
    df = pd.read_csv(data_path)
    print(f"   记录数: {len(df)}")
    
    # 创建分析器
    analyzer = MarketAnalyzer(df)
    
    # 生成各种图表
    charts = {}
    
    # 2. 价格趋势图
    print("\n2. 生成价格趋势图...")
    cities = df['city'].unique()
    for city in cities:
        chart_path = analyzer.price_trend_chart(city)
        charts[f'trend_{city}'] = chart_path
    
    # 3. 区域对比图
    print("\n3. 生成区域对比图...")
    chart_path = analyzer.area_comparison_chart(list(cities)[:5])  # 最多5个城市
    charts['area_comparison'] = chart_path
    
    # 4. 价格分布图
    print("\n4. 生成价格分布图...")
    for city in cities[:3]:  # 最多3个城市
        chart_path = analyzer.price_distribution_chart(city)
        charts[f'distribution_{city}'] = chart_path
    
    # 5. 房产类型饼图
    print("\n5. 生成房产类型饼图...")
    for city in cities[:3]:  # 最多3个城市
        chart_path = analyzer.property_type_pie_chart(city)
        charts[f'pie_{city}'] = chart_path
    
    # 生成报告
    print("\n6. 生成分析报告...")
    report = {
        'generated_at': datetime.now().isoformat(),
        'data_path': data_path,
        'output_dir': output_dir,
        'total_records': len(df),
        'cities_analyzed': list(cities),
        'charts_generated': list(charts.keys()),
        'chart_paths': charts
    }
    
    report_path = os.path.join(output_dir, 'analysis_report.json')
    import json
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"   报告文件: {report_path}")
    
    print("\n" + "=" * 60)
    print("市场分析图表生成完成！")
    print("=" * 60)
    
    return charts


if __name__ == '__main__':
    # 生成市场分析图表
    charts = generate_market_analysis_report(
        data_path='cleaned_data.csv',
        output_dir='charts'
    )
    
    print("\n生成的图表:")
    for name, path in charts.items():
        print(f"  {name}: {path}")
