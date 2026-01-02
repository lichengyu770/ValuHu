import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export interface ValueEvolutionTimelineProps {
  data: {
    year: string;
    value: number;
    event?: string;
  }[];
  title?: string;
}

const ValueEvolutionTimeline: React.FC<ValueEvolutionTimelineProps> = ({ data, title = '房产价值演变时间轴' }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  let chartInstance: echarts.ECharts | null = null;

  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance = echarts.init(chartRef.current);

      // 准备数据
      const years = data.map(item => item.year);
      const values = data.map(item => item.value);
      const events = data
        .filter(item => item.event)
        .map(item => ({
          value: [item.year, item.value],
          name: item.event
        }));

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
          trigger: 'axis',
          formatter: function(params: any) {
            const valueInfo = params[0];
            const eventInfo = events.find(event => event.value[0] === valueInfo.name);
            let result = `${valueInfo.name}: ${valueInfo.value.toLocaleString()} 元`;
            if (eventInfo) {
              result += `<br/>事件: ${eventInfo.name}`;
            }
            return result;
          }
        },
        xAxis: {
          type: 'category',
          data: years,
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: '房价（元）',
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: '房价',
            type: 'line',
            data: values,
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#1A5FDF'
            },
            itemStyle: {
              color: '#1A5FDF',
              borderColor: '#fff',
              borderWidth: 2
            },
            emphasis: {
              itemStyle: {
                color: '#4080FF',
                borderWidth: 3
              }
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(26, 95, 223, 0.3)'
                },
                {
                  offset: 1,
                  color: 'rgba(26, 95, 223, 0.05)'
                }
              ])
            }
          },
          {
            name: '关键事件',
            type: 'scatter',
            data: events.map(event => event.value),
            symbolSize: 12,
            itemStyle: {
              color: '#F5222D',
              borderColor: '#fff',
              borderWidth: 2
            },
            tooltip: {
              formatter: function(params: any) {
                const event = events.find(e => e.value[0] === params.name);
                return event ? `${params.name}: ${event.name}` : '';
              }
            }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
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

export default ValueEvolutionTimeline;