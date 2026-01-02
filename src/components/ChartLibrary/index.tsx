// 导出基于Recharts的图表组件
import createChart, {
  CustomLineChart,
  CustomBarChart,
  CustomPieChart,
  CustomRadarChart,
  CustomScatterChart,
  CustomAreaChart,
} from './RechartsComponents';

// 图表配置默认值
const DEFAULT_CHART_OPTIONS = {
  title: '',
  width: 800,
  height: 400,
  colors: [
    '#007AFF',
    '#4CAF50',
    '#FF9800',
    '#9C27B0',
    '#F44336',
    '#FF5722',
    '#795548',
    '#607D8B',
  ],
  grid: true,
  responsive: true,
  animation: true,
  animationDuration: 800,
  tooltip: true,
  legend: true,
};

/**
 * 导出图表库
 */
export {
  createChart,
  CustomLineChart,
  CustomBarChart,
  CustomPieChart,
  CustomRadarChart,
  CustomScatterChart,
  CustomAreaChart,
  DEFAULT_CHART_OPTIONS,
};

export default createChart;
