import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

// 基础图表属性
interface BaseChartProps {
  title?: string;
  width?: number;
  height?: number;
  data: any[];
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
}

// 折线图属性
interface LineChartProps extends BaseChartProps {
  xKey: string;
  yKey: string | string[];
  yName?: string | string[];
  lineColors?: string[];
  animationDuration?: number;
  connectNulls?: boolean;
  strokeWidth?: number;
  dot?: boolean;
  activeDot?: boolean | number;
}

// 柱状图属性
interface BarChartProps extends BaseChartProps {
  xKey: string;
  yKey: string | string[];
  yName?: string | string[];
  barColors?: string[];
  animationDuration?: number;
  barSize?: number;
  barCategoryGap?: number | string;
  barGap?: number | string;
}

// 饼图属性
interface PieChartProps extends BaseChartProps {
  nameKey: string;
  valueKey: string;
  pieColors?: string[];
  animationDuration?: number;
  cx?: number | string;
  cy?: number | string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  paddingAngle?: number;
  dataKey?: string;
}

// 雷达图属性
interface RadarChartProps extends BaseChartProps {
  dataKey: string;
  radarColors?: string[];
  animationDuration?: number;
  cx?: number | string;
  cy?: number | string;
  outerRadius?: number | string;
  startAngle?: number;
  endAngle?: number;
}

// 散点图属性
interface ScatterChartProps extends BaseChartProps {
  xKey: string;
  yKey: string;
  scatterColors?: string[];
  animationDuration?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// 面积图属性
interface AreaChartProps extends BaseChartProps {
  xKey: string;
  yKey: string | string[];
  yName?: string | string[];
  areaColors?: string[];
  animationDuration?: number;
  connectNulls?: boolean;
  strokeWidth?: number;
  dot?: boolean;
  activeDot?: boolean | number;
}

// 默认颜色配置
const DEFAULT_COLORS = [
  '#007AFF',
  '#4CAF50',
  '#FF9800',
  '#9C27B0',
  '#F44336',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#00BCD4',
  '#3F51B5',
];

/**
 * 折线图组件
 */
export const CustomLineChart: React.FC<LineChartProps> = ({
  title,
  width = 800,
  height = 400,
  data,
  className = '',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  legendPosition = 'top',
  xKey,
  yKey,
  yName,
  lineColors = DEFAULT_COLORS,
  animationDuration = 800,
  connectNulls = false,
  strokeWidth = 3,
  dot = true,
  activeDot = false,
}) => {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const yNames = Array.isArray(yName) ? yName : yKey;

  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray='3 3' />}
          <XAxis dataKey={xKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && (
            <Legend layout='horizontal' verticalAlign={legendPosition} />
          )}
          {yKeys.map((key, index) => (
            <Line
              key={key}
              type='monotone'
              dataKey={key}
              name={Array.isArray(yNames) ? yNames[index] : yNames}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={strokeWidth}
              dot={dot}
              activeDot={activeDot}
              connectNulls={connectNulls}
              animationDuration={animationDuration}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 柱状图组件
 */
export const CustomBarChart: React.FC<BarChartProps> = ({
  title,
  width = 800,
  height = 400,
  data,
  className = '',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  legendPosition = 'top',
  xKey,
  yKey,
  yName,
  barColors = DEFAULT_COLORS,
  animationDuration = 800,
  barSize = 20,
  barCategoryGap = '20%',
  barGap = '0%',
}) => {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const yNames = Array.isArray(yName) ? yName : yKey;

  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={barSize}
          barCategoryGap={barCategoryGap}
          barGap={barGap}
        >
          {showGrid && <CartesianGrid strokeDasharray='3 3' vertical={false} />}
          <XAxis dataKey={xKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && (
            <Legend layout='horizontal' verticalAlign={legendPosition} />
          )}
          {yKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              name={Array.isArray(yNames) ? yNames[index] : yNames}
              animationDuration={animationDuration}
            >
              {data.map((entry, entryIndex) => (
                <Cell
                  key={`cell-${entryIndex}`}
                  fill={barColors[index % barColors.length]}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 饼图组件
 */
export const CustomPieChart: React.FC<PieChartProps> = ({
  title,
  width = 600,
  height = 400,
  data,
  className = '',
  showTooltip = true,
  showLegend = true,
  nameKey,
  valueKey,
  pieColors = DEFAULT_COLORS,
  animationDuration = 800,
  cx = '50%',
  cy = '50%',
  innerRadius = 0,
  outerRadius = 150,
  paddingAngle = 0,
}) => {
  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <PieChart>
          {showTooltip && (
            <Tooltip formatter={(value) => [`${value}`, '数值']} />
          )}
          {showLegend && <Legend layout='horizontal' verticalAlign='bottom' />}
          <Pie
            data={data}
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey={valueKey}
            nameKey={nameKey}
            animationDuration={animationDuration}
            label={(entry) => `${entry[nameKey]}: ${entry[valueKey]}`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={pieColors[index % pieColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 雷达图组件
 */
export const CustomRadarChart: React.FC<RadarChartProps> = ({
  title,
  width = 600,
  height = 400,
  data,
  className = '',
  showTooltip = true,
  showLegend = true,
  legendPosition = 'top',
  dataKey,
  radarColors = DEFAULT_COLORS,
  animationDuration = 800,
  cx = '50%',
  cy = '50%',
  outerRadius = 150,
  startAngle = 150,
  endAngle = 150,
}) => {
  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <RadarChart
          cx={cx}
          cy={cy}
          outerRadius={outerRadius}
          data={data}
          startAngle={startAngle}
          endAngle={endAngle}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey='subject' />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
          {showTooltip && <Tooltip />}
          {showLegend && (
            <Legend layout='horizontal' verticalAlign={legendPosition} />
          )}
          <Radar
            name='数据值'
            dataKey={dataKey}
            stroke={radarColors[0]}
            fill={radarColors[0]}
            fillOpacity={0.6}
            animationDuration={animationDuration}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 散点图组件
 */
export const CustomScatterChart: React.FC<ScatterChartProps> = ({
  title,
  width = 800,
  height = 400,
  data,
  className = '',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  legendPosition = 'top',
  xKey,
  yKey,
  scatterColors = DEFAULT_COLORS,
  animationDuration = 800,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
}) => {
  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <ScatterChart margin={margin}>
          {showGrid && <CartesianGrid strokeDasharray='3 3' />}
          <XAxis type='number' dataKey={xKey} name='X轴' />
          <YAxis type='number' dataKey={yKey} name='Y轴' />
          {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
          {showLegend && (
            <Legend layout='horizontal' verticalAlign={legendPosition} />
          )}
          <Scatter
            name='数据点'
            data={data}
            animationDuration={animationDuration}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={scatterColors[index % scatterColors.length]}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 面积图组件
 */
export const CustomAreaChart: React.FC<AreaChartProps> = ({
  title,
  width = 800,
  height = 400,
  data,
  className = '',
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  legendPosition = 'top',
  xKey,
  yKey,
  yName,
  areaColors = DEFAULT_COLORS,
  animationDuration = 800,
  connectNulls = false,
  strokeWidth = 3,
  dot = true,
  activeDot = false,
}) => {
  const yKeys = Array.isArray(yKey) ? yKey : [yKey];
  const yNames = Array.isArray(yName) ? yName : yKey;

  return (
    <div className={`chart-container ${className}`}>
      {title && <h3 className='chart-title'>{title}</h3>}
      <ResponsiveContainer width={width} height={height}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray='3 3' />}
          <XAxis dataKey={xKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && (
            <Legend layout='horizontal' verticalAlign={legendPosition} />
          )}
          {yKeys.map((key, index) => (
            <Area
              key={key}
              type='monotone'
              dataKey={key}
              name={Array.isArray(yNames) ? yNames[index] : yNames}
              stroke={areaColors[index % areaColors.length]}
              fill={areaColors[index % areaColors.length]}
              strokeWidth={strokeWidth}
              dot={dot}
              activeDot={activeDot}
              connectNulls={connectNulls}
              animationDuration={animationDuration}
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 图表组件工厂函数
 */
export const createChart = (chartType: string, props: any) => {
  switch (chartType) {
    case 'line':
      return <CustomLineChart {...props} />;
    case 'bar':
      return <CustomBarChart {...props} />;
    case 'pie':
      return <CustomPieChart {...props} />;
    case 'radar':
      return <CustomRadarChart {...props} />;
    case 'scatter':
      return <CustomScatterChart {...props} />;
    case 'area':
      return <CustomAreaChart {...props} />;
    default:
      throw new Error(`不支持的图表类型: ${chartType}`);
  }
};

export default createChart;
