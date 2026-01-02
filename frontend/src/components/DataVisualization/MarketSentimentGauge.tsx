import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface MarketSentimentGaugeProps {
  value: number; // 0-100
  title?: string;
  subtitle?: string;
}

const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({ 
  value, 
  title = '市场情绪仪表',
  subtitle = '当前市场热度' 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  let chartInstance: echarts.ECharts | null = null;

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance = echarts.init(chartRef.current);

      // 确定情绪等级和颜色
      let sentimentLevel = '';
      let sentimentColor = '#1A5FDF';
      let gradientColors = [];

      if (value < 25) {
        sentimentLevel = '冷淡';
        sentimentColor = '#1A5FDF';
        gradientColors = ['#1A5FDF', '#4080FF'];
      } else if (value < 50) {
        sentimentLevel = '观望';
        sentimentColor = '#00B894';
        gradientColors = ['#00B894', '#33C6A3'];
      } else if (value < 75) {
        sentimentLevel = '活跃';
        sentimentColor = '#FAAD14';
        gradientColors = ['#FAAD14', '#FFC53D'];
      } else {
        sentimentLevel = '过热';
        sentimentColor = '#F5222D';
        gradientColors = ['#F5222D', '#FF4D4F'];
      }

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
        subtitle: {
          text: subtitle,
          left: 'center',
          top: '15%',
          textStyle: {
            fontSize: 14,
            color: '#70757A'
          }
        },
        tooltip: {
          formatter: '{b}: {c}°C',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: sentimentColor,
          borderWidth: 1,
          textStyle: {
            color: '#2D3436'
          }
        },
        series: [
          {
            name: '市场情绪',
            type: 'gauge',
            radius: '80%',
            startAngle: 200,
            endAngle: -20,
            min: 0,
            max: 100,
            splitNumber: 5,
            axisLine: {
              lineStyle: {
                width: 15,
                color: [
                  [0.25, '#1A5FDF'],
                  [0.5, '#00B894'],
                  [0.75, '#FAAD14'],
                  [1, '#F5222D']
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '12%',
              width: 10,
              offsetCenter: [0, '-60%'],
              itemStyle: {
                color: sentimentColor
              }
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 2
              }
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: 'auto',
                width: 5
              }
            },
            axisLabel: {
              color: '#70757A',
              fontSize: 14,
              distance: -30,
              formatter: function (value: number) {
                if (value === 0) {
                  return '0°';
                } else if (value === 25) {
                  return '25°';
                } else if (value === 50) {
                  return '50°';
                } else if (value === 75) {
                  return '75°';
                } else if (value === 100) {
                  return '100°';
                }
                return '';
              }
            },
            title: {
              offsetCenter: [0, '-30%'],
              fontSize: 14,
              color: '#70757A'
            },
            detail: {
              fontSize: 32,
              fontWeight: 'bold',
              color: sentimentColor,
              offsetCenter: [0, '0%'],
              formatter: function (value: number) {
                return `${value}°C`;
              }
            },
            data: [
              {
                value: value,
                name: '热度'
              }
            ]
          },
          {
            name: '情绪等级',
            type: 'text',
            left: 'center',
            top: '85%',
            silent: true,
            style: {
              text: sentimentLevel,
              fontSize: 20,
              fontWeight: 'bold',
              color: sentimentColor
            }
          }
        ],
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
  }, [value, title, subtitle]);

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

export default MarketSentimentGauge;