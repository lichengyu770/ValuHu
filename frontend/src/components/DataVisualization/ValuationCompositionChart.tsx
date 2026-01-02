import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface ValuationCompositionChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  totalValue?: number;
}

const ValuationCompositionChart: React.FC<ValuationCompositionChartProps> = ({ 
  data, 
  title = '估价成分分解图',
  totalValue 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  let chartInstance: echarts.ECharts | null = null;

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance = echarts.init(chartRef.current);

      // 准备数据
      const pieData = data.map(item => ({
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.color || '#1A5FDF'
        }
      }));

      // 计算总值
      const calculatedTotal = data.reduce((sum, item) => sum + item.value, 0);
      const displayTotal = totalValue || calculatedTotal;

      // 配置项
      const option: echarts.EChartsOption = {
        title: {
          text: title,
          left: 'center',
          textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#2D3436'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#1A5FDF',
          borderWidth: 1,
          textStyle: {
            color: '#2D3436'
          }
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          formatter: function(name: string) {
            const item = data.find(item => item.name === name);
            return `${name} (${item?.value}%)`;
          },
          textStyle: {
            fontSize: 14,
            color: '#2D3436'
          }
        },
        series: [
          {
            name: '估价成分',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 24,
                fontWeight: 'bold',
                formatter: function(params: any) {
                  return `${params.name}\n${params.value}%`;
                },
                color: '#2D3436'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: pieData
          }
        ],
        graphic: {
          type: 'text',
          left: '40%',
          top: '50%',
          style: {
            text: `总价: ${displayTotal.toLocaleString()} 元`,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2D3436',
            textAlign: 'center'
          },
          origin: [0, 0],
          z: 100
        },
        animation: true,
        animationDuration: 1500,
        animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      };

      // 设置配置项
      chartInstance.setOption(option);

      // 响应式调整
      const handleResize = () => {
        chartInstance?.resize();
      };

      window.addEventListener('resize', handleResize);

      // 清理函数
      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance?.dispose();
      };
    }
  }, [data, title, totalValue]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(26, 95, 223, 0.15)',
        backgroundColor: '#fff',
        padding: '20px'
      }}
    />
  );
};

export default ValuationCompositionChart;