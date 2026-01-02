import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

/**
 * 市场分析页面组件
 * 提供全面的市场数据分析和趋势预测
 */
const MarketAnalysis = () => {
  const priceTrendChartRef = useRef(null);
  const transactionDataChartRef = useRef(null);
  const marketComparisonChartRef = useRef(null);
  const priceDistributionChartRef = useRef(null);
  const heatmapChartRef = useRef(null);
  const timeSeriesChartRef = useRef(null);
  const policyImpactChartRef = useRef(null);

  const priceTrendChart = useRef(null);
  const transactionDataChart = useRef(null);
  const marketComparisonChart = useRef(null);
  const priceDistributionChart = useRef(null);
  const heatmapChart = useRef(null);
  const timeSeriesChart = useRef(null);
  const policyImpactChart = useRef(null);
  
  // 政策影响模拟器状态
  const [policyParams, setPolicyParams] = useState({
    interestRateChange: 0,
    downPaymentChange: 0,
    taxChange: 0
  });
  const [impactResult, setImpactResult] = useState(null);

  // 组件挂载时初始化图表
  useEffect(() => {
    // 价格趋势图表数据
    const priceTrendData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      datasets: [
        {
          label: '市场均价',
          data: [12500, 12800, 13000, 12900, 13200, 13500, 13800],
          borderColor: '#ffa046',
          backgroundColor: 'rgba(255, 160, 70, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#ffa046',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    };

    // 成交数据图表数据
    const transactionData = {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '成交量',
          data: [1200, 1900, 1500, 2000, 2500, 1800],
          backgroundColor: [
            '#ffa046',
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#9C27B0',
            '#F44336',
          ],
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };

    // 市场对比图表数据
    const marketComparisonData = {
      labels: ['住宅', '商业', '办公', '工业', '别墅'],
      datasets: [
        {
          label: '同比涨幅',
          data: [2.5, 3.8, 1.2, 0.8, 4.5],
          backgroundColor: '#ffa046',
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };

    // 价格分布图表数据
    const priceDistributionData = {
      labels: [
        '8000以下',
        '8000-10000',
        '10000-12000',
        '12000-15000',
        '15000以上',
      ],
      datasets: [
        {
          label: '房源数量',
          data: [15, 25, 35, 20, 5],
          backgroundColor: [
            '#4CAF50',
            '#8BC34A',
            '#CDDC39',
            '#FFEB3B',
            '#FFC107',
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };

    // 价格趋势图表配置
    const priceTrendConfig = {
      type: 'line',
      data: priceTrendData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 元/㎡`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 元/㎡';
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 成交数据图表配置
    const transactionDataConfig = {
      type: 'bar',
      data: transactionData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 套`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 套';
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 市场对比图表配置
    const marketComparisonConfig = {
      type: 'bar',
      data: marketComparisonData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value + '%';
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 价格分布图表配置
    const priceDistributionConfig = {
      type: 'doughnut',
      data: priceDistributionData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} 套 (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
        cutout: '70%',
      },
    };

    // 热力图数据（模拟）
    const heatmapData = {
      labels: ['区域A', '区域B', '区域C', '区域D', '区域E', '区域F'],
      datasets: [
        {
          label: '价格热力分布',
          data: [12500, 13800, 11200, 14500, 10800, 13200],
          backgroundColor: [
            '#4CAF50',
            '#8BC34A',
            '#CDDC39',
            '#FFEB3B',
            '#FFC107',
            '#FF9800'
          ],
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };

    // 热力图配置
    const heatmapConfig = {
      type: 'bar',
      data: heatmapData,
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                return `价格: ${context.parsed.x.toLocaleString()} 元/㎡`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 元/㎡';
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 时间序列分析数据
    const timeSeriesData = {
      labels: ['2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06', '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12'],
      datasets: [
        {
          label: '市场均价',
          data: [11800, 12100, 12300, 12500, 12800, 13000, 13200, 13500, 13800, 14000, 14200, 14500],
          borderColor: '#ffa046',
          backgroundColor: 'rgba(255, 160, 70, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#ffa046',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: '成交量',
          data: [800, 950, 1100, 1250, 1400, 1600, 1800, 2000, 1900, 1750, 1600, 1500],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#2196F3',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y1',
        },
      ],
    };

    // 时间序列分析配置
    const timeSeriesConfig = {
      type: 'line',
      data: timeSeriesData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                if (context.dataset.yAxisID === 'y1') {
                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 套`;
                }
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 元/㎡`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 11,
              },
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 元/㎡';
              },
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 套';
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 政策影响模拟器数据
    const policyImpactData = {
      labels: ['政策实施前', '实施1个月', '实施3个月', '实施6个月', '实施12个月'],
      datasets: [
        {
          label: '基准情景',
          data: [12500, 12800, 13200, 13800, 14500],
          borderColor: '#9E9E9E',
          backgroundColor: 'rgba(158, 158, 158, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          borderDash: [5, 5],
        },
        {
          label: '政策影响',
          data: [12500, 12600, 13000, 13500, 14200],
          borderColor: '#FF5252',
          backgroundColor: 'rgba(255, 82, 82, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
        },
      ],
    };

    // 政策影响模拟器配置
    const policyImpactConfig = {
      type: 'line',
      data: policyImpactData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#ffffff',
              font: {
                size: 14,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffa046',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} 元/㎡`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#ffffff',
              font: {
                size: 12,
              },
              callback: function (value) {
                return value.toLocaleString() + ' 元/㎡';
              },
            },
          },
        },
        animation: {
          duration: 1500,
          easing: 'easeInOutQuart',
        },
      },
    };

    // 初始化图表
    if (priceTrendChartRef.current) {
      priceTrendChart.current = new Chart(
        priceTrendChartRef.current,
        priceTrendConfig
      );
    }

    if (transactionDataChartRef.current) {
      transactionDataChart.current = new Chart(
        transactionDataChartRef.current,
        transactionDataConfig
      );
    }

    if (marketComparisonChartRef.current) {
      marketComparisonChart.current = new Chart(
        marketComparisonChartRef.current,
        marketComparisonConfig
      );
    }

    if (priceDistributionChartRef.current) {
      priceDistributionChart.current = new Chart(
        priceDistributionChartRef.current,
        priceDistributionConfig
      );
    }

    // 初始化新图表
    if (heatmapChartRef.current) {
      heatmapChart.current = new Chart(
        heatmapChartRef.current,
        heatmapConfig
      );
    }

    if (timeSeriesChartRef.current) {
      timeSeriesChart.current = new Chart(
        timeSeriesChartRef.current,
        timeSeriesConfig
      );
    }

    if (policyImpactChartRef.current) {
      policyImpactChart.current = new Chart(
        policyImpactChartRef.current,
        policyImpactConfig
      );
    }

    // 清理函数，组件卸载时销毁图表
    return () => {
      if (priceTrendChart.current) {
        priceTrendChart.current.destroy();
      }

      if (transactionDataChart.current) {
        transactionDataChart.current.destroy();
      }

      if (marketComparisonChart.current) {
        marketComparisonChart.current.destroy();
      }

      if (priceDistributionChart.current) {
        priceDistributionChart.current.destroy();
      }

      // 销毁新图表
      if (heatmapChart.current) {
        heatmapChart.current.destroy();
      }

      if (timeSeriesChart.current) {
        timeSeriesChart.current.destroy();
      }

      if (policyImpactChart.current) {
        policyImpactChart.current.destroy();
      }
    };
  }, []);

  return (
    <div className='p-6 bg-[#1a0d08] min-h-screen'>
      <h1 className='text-2xl font-bold text-orange-400 mb-6'>市场分析</h1>
      <p className='text-white opacity-70 mb-8'>
        提供全面的市场数据分析和趋势预测
      </p>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* 市场指标卡片 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <div className='text-sm text-white opacity-70 mb-2'>市场均价</div>
          <div className='text-2xl font-bold text-white mb-2'>12,500</div>
          <div className='flex items-center text-green-400'>
            <i className='fas fa-arrow-up mr-1'></i>
            <span>2.5%</span>
          </div>
        </div>
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <div className='text-sm text-white opacity-70 mb-2'>成交量</div>
          <div className='text-2xl font-bold text-white mb-2'>8,920</div>
          <div className='flex items-center text-red-400'>
            <i className='fas fa-arrow-down mr-1'></i>
            <span>1.2%</span>
          </div>
        </div>
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <div className='text-sm text-white opacity-70 mb-2'>市场活跃度</div>
          <div className='text-2xl font-bold text-white mb-2'>75.8%</div>
          <div className='flex items-center text-green-400'>
            <i className='fas fa-arrow-up mr-1'></i>
            <span>3.1%</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* 价格趋势图表 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <h2 className='text-lg font-semibold text-white mb-4'>价格趋势</h2>
          <div className='h-72 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
            <canvas ref={priceTrendChartRef}></canvas>
          </div>
        </div>

        {/* 成交数据图表 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <h2 className='text-lg font-semibold text-white mb-4'>成交数据</h2>
          <div className='h-72 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
            <canvas ref={transactionDataChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* 市场对比图表 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <h2 className='text-lg font-semibold text-white mb-4'>市场对比</h2>
          <div className='h-72 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
            <canvas ref={marketComparisonChartRef}></canvas>
          </div>
        </div>

        {/* 价格分布图表 */}
        <div className='glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
          <h2 className='text-lg font-semibold text-white mb-4'>价格分布</h2>
          <div className='h-72 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
            <canvas ref={priceDistributionChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className='mt-6 glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
        <h2 className='text-lg font-semibold text-white mb-4'>市场分析报告</h2>
        <div className='space-y-4'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-1'>
              <i className='fas fa-file-alt text-orange-400'></i>
            </div>
            <div>
              <h3 className='text-white font-medium mb-1'>
                2025年第三季度市场分析报告
              </h3>
              <p className='text-sm text-white opacity-70'>
                详细分析了2025年第三季度的市场情况，包括价格走势、成交量变化、区域分析等内容。
              </p>
              <div className='mt-2'>
                <a href='#' className='text-orange-400 hover:underline text-sm'>
                  查看报告
                </a>
              </div>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-1'>
              <i className='fas fa-file-alt text-orange-400'></i>
            </div>
            <div>
              <h3 className='text-white font-medium mb-1'>
                2025年第二季度市场分析报告
              </h3>
              <p className='text-sm text-white opacity-70'>
                详细分析了2025年第二季度的市场情况，包括价格走势、成交量变化、区域分析等内容。
              </p>
              <div className='mt-2'>
                <a href='#' className='text-orange-400 hover:underline text-sm'>
                  查看报告
                </a>
              </div>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-1'>
              <i className='fas fa-file-alt text-orange-400'></i>
            </div>
            <div>
              <h3 className='text-white font-medium mb-1'>
                2025年第一季度市场分析报告
              </h3>
              <p className='text-sm text-white opacity-70'>
                详细分析了2025年第一季度的市场情况，包括价格走势、成交量变化、区域分析等内容。
              </p>
              <div className='mt-2'>
                <a href='#' className='text-orange-400 hover:underline text-sm'>
                  查看报告
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 热力图展示 */}
      <div className='mt-8 glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
        <h2 className='text-lg font-semibold text-white mb-4'>区域价格热力图</h2>
        <div className='h-96 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
          <canvas ref={heatmapChartRef}></canvas>
        </div>
      </div>

      {/* 时间序列分析 */}
      <div className='mt-8 glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
        <h2 className='text-lg font-semibold text-white mb-4'>时间序列分析</h2>
        <div className='h-96 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
          <canvas ref={timeSeriesChartRef}></canvas>
        </div>
      </div>

      {/* 政策影响模拟器 */}
      <div className='mt-8 glass-effect p-5 rounded-lg border border-orange-400 border-opacity-20'>
        <h2 className='text-lg font-semibold text-white mb-4'>政策影响模拟器</h2>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='space-y-4'>
            <h3 className='text-md font-medium text-white mb-2'>政策参数配置</h3>
            
            {/* 利率变化 */}
            <div>
              <label className='block text-sm text-white opacity-70 mb-2'>
                利率变化 (%)
              </label>
              <div className='flex items-center'>
                <input
                  type='range'
                  min='-5'
                  max='5'
                  step='0.1'
                  value={policyParams.interestRateChange}
                  onChange={(e) => setPolicyParams(prev => ({
                    ...prev,
                    interestRateChange: parseFloat(e.target.value)
                  }))}
                  className='flex-1 mr-4'
                />
                <span className='text-white min-w-[60px]'>{policyParams.interestRateChange.toFixed(1)}%</span>
              </div>
            </div>

            {/* 首付比例变化 */}
            <div>
              <label className='block text-sm text-white opacity-70 mb-2'>
                首付比例变化 (%)
              </label>
              <div className='flex items-center'>
                <input
                  type='range'
                  min='-10'
                  max='10'
                  step='0.5'
                  value={policyParams.downPaymentChange}
                  onChange={(e) => setPolicyParams(prev => ({
                    ...prev,
                    downPaymentChange: parseFloat(e.target.value)
                  }))}
                  className='flex-1 mr-4'
                />
                <span className='text-white min-w-[60px]'>{policyParams.downPaymentChange.toFixed(1)}%</span>
              </div>
            </div>

            {/* 税率变化 */}
            <div>
              <label className='block text-sm text-white opacity-70 mb-2'>
                税率变化 (%)
              </label>
              <div className='flex items-center'>
                <input
                  type='range'
                  min='-20'
                  max='20'
                  step='1'
                  value={policyParams.taxChange}
                  onChange={(e) => setPolicyParams(prev => ({
                    ...prev,
                    taxChange: parseFloat(e.target.value)
                  }))}
                  className='flex-1 mr-4'
                />
                <span className='text-white min-w-[60px]'>{policyParams.taxChange.toFixed(0)}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                // 模拟政策影响计算
                const impact = {
                  interestRateChange: policyParams.interestRateChange,
                  downPaymentChange: policyParams.downPaymentChange,
                  taxChange: policyParams.taxChange,
                  predictedPriceChange: (policyParams.interestRateChange * -0.5) + 
                                          (policyParams.downPaymentChange * -0.8) + 
                                          (policyParams.taxChange * -0.3)
                };
                setImpactResult(impact);
              }}
              className='w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors'
            >
              模拟政策影响
            </button>

            {impactResult && (
              <div className='mt-4 p-4 bg-[rgba(255,255,255,0.1)] rounded-lg'>
                <h4 className='text-md font-medium text-white mb-2'>模拟结果</h4>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-white opacity-70'>利率变化:</span>
                    <span className='text-white'>{impactResult.interestRateChange.toFixed(1)}%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-white opacity-70'>首付比例变化:</span>
                    <span className='text-white'>{impactResult.downPaymentChange.toFixed(1)}%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-white opacity-70'>税率变化:</span>
                    <span className='text-white'>{impactResult.taxChange.toFixed(0)}%</span>
                  </div>
                  <div className='border-t border-white border-opacity-20 pt-2 mt-2'>
                    <div className='flex justify-between items-center'>
                      <span className='text-white font-medium'>预计价格变化:</span>
                      <span className={`font-medium ${impactResult.predictedPriceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {impactResult.predictedPriceChange > 0 ? '+' : ''}{impactResult.predictedPriceChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className='lg:col-span-2'>
            <h3 className='text-md font-medium text-white mb-2'>政策影响预测</h3>
            <div className='h-96 bg-[rgba(255,255,255,0.05)] rounded-lg p-4'>
              <canvas ref={policyImpactChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
