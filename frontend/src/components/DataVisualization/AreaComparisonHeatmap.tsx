import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface AreaComparisonHeatmapProps {
  data: {
    name: string;
    averagePrice: number;
    growthRate: number;
  }[];
  title?: string;
}

const AreaComparisonHeatmap: React.FC<AreaComparisonHeatmapProps> = ({ data, title = '区域对比热力图' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  let chartInstance: echarts.ECharts | null = null;

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance = echarts.init(chartRef.current);

      // 准备数据
      const areas = data.map(item => item.name);
      const metrics = ['均价（元）', '涨幅（%）'];
      const heatmapData = data.flatMap((area, areaIndex) =>
        metrics.map((metric, metricIndex) => {
          const value = metricIndex === 0 ? area.averagePrice : area.growthRate;
          return [areaIndex, metricIndex, value];
        })
      );

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
          position: 'top',
          formatter: function(params: any) {
            const metric = metrics[params.data[1]];
            const area = areas[params.data[0]];
            const value = params.data[2];
            let formattedValue = value;
            if (metric.includes('均价')) {
              formattedValue = value.toLocaleString() + ' 元';
            } else if (metric.includes('涨幅')) {
              formattedValue = value.toFixed(2) + ' %';
            }
            return `${area}<br/>${metric}: ${formattedValue}`;
          }
        },
        grid: {
          height: '60%',
          top: '15%'
        },
        xAxis: {
          type: 'category',
          data: areas,
          splitArea: {
            show: true
          },
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'category',
          data: metrics,
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: Math.max(...data.map(item => item.averagePrice)),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          inRange: {
            color: ['#E4F2FF', '#B3D9FF', '#66B3FF', '#1A8CFF', '#0059B3']
          },
          textStyle: {
            color: '#2D3436'
          }
        },
        series: [
          {
            name: '区域数据',
            type: 'heatmap',
            data: heatmapData,
            label: {
              show: true,
              formatter: function(params: any) {
                const value = params.data[2];
                if (params.data[1] === 0) {
                  // 均价，保留整数
                  return value.toLocaleString();
                } else {
                  // 涨幅，保留1位小数
                  return value.toFixed(1) + '%';
                }
              }
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
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
  }, [data, title]);

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

export default AreaComparisonHeatmap;