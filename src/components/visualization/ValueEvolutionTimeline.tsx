import React from 'react';
import { Card, Typography, Tooltip } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine, Annotation } from 'recharts';
import { CalendarOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 模拟数据 - 5年房产价值变化
const valueData = [
  { year: '2022', value: 12000, event: null },
  { year: '2022.3', value: 12500, event: { type: '装修', description: '房屋重新装修' } },
  { year: '2022.6', value: 13000, event: null },
  { year: '2022.9', value: 13200, event: null },
  { year: '2023', value: 13500, event: { type: '政策', description: '区域政策利好' } },
  { year: '2023.3', value: 14000, event: null },
  { year: '2023.6', value: 14200, event: null },
  { year: '2023.9', value: 14500, event: null },
  { year: '2024', value: 15000, event: null },
  { year: '2024.3', value: 15200, event: null },
  { year: '2024.6', value: 15500, event: { type: '交通', description: '地铁开通' } },
  { year: '2024.9', value: 16000, event: null },
  { year: '2025', value: 16500, event: null },
  { year: '2025.3', value: 16800, event: null },
  { year: '2025.6', value: 17000, event: null },
  { year: '2025.9', value: 17200, event: null },
  { year: '2026', value: 17500, event: null },
];

interface EventMarkProps {
  x: number;
  y: number;
  event: { type: string; description: string };
}

const EventMark: React.FC<EventMarkProps> = ({ x, y, event }) => {
  let icon = <HomeOutlined style={{ color: '#1890ff' }} />;
  if (event.type === '政策') {
    icon = <CalendarOutlined style={{ color: '#52c41a' }} />;
  } else if (event.type === '交通') {
    icon = <DollarOutlined style={{ color: '#faad14' }} />;
  }

  return (
    <Tooltip title={event.description} placement="top">
      <g transform={`translate(${x},${y})`}>
        <circle r={6} fill="white" stroke="#1890ff" strokeWidth={2} />
        <circle r={4} fill="#1890ff" />
        <g transform="translate(0,-20)">
          {icon}
        </g>
      </g>
    </Tooltip>
  );
};

const ValueEvolutionTimeline: React.FC = () => {
  return (
    <Card className="card card-ai" title="价值演变时间轴" bordered={false}>
      <div className="value-evolution-timeline">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={valueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(24, 144, 255, 0.1)" />
            <XAxis 
              dataKey="year" 
              stroke="#666"
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#999' }}
              tickLine={{ stroke: '#999' }}
            />
            <YAxis 
              stroke="#666"
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#999' }}
              tickLine={{ stroke: '#999' }}
              tickFormatter={(value) => `¥${value.toLocaleString()}`}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e8e8e8'
              }}
              formatter={(value) => [`¥${Number(value).toLocaleString()}`, '房产价值']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <ReferenceLine y={12000} stroke="#faad14" strokeDasharray="3 3" label="基准价值" />
            
            <Line 
              type="monotone" 
              dataKey="value" 
              name="房产价值" 
              stroke="url(#colorValue)" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#1890ff', strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6, fill: '#1890ff', strokeWidth: 2, stroke: 'white' }}
              animationDuration={2000}
            />
            
            {/* 事件标记 */}
            {valueData.map((entry, index) => {
              if (entry.event) {
                return (
                  <Annotation
                    key={`event-${index}`}
                    type="custom"
                    content={<EventMark event={entry.event} x={0} y={0} />}
                    dataKey="year"
                    value={entry.year}
                  />
                );
              }
              return null;
            })}
            
            {/* 渐变定义 */}
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
        
        <div className="timeline-info">
          <Paragraph style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
            <strong>分析说明：</strong>该时间轴展示了过去5年房产价值的变化趋势，标记点显示了关键事件对房产价值的影响。
            总体呈上升趋势，其中2023年区域政策利好和2024年地铁开通对价值提升贡献显著。
          </Paragraph>
        </div>
      </div>
      
      <style jsx>{`
        .value-evolution-timeline {
          padding: 16px 0;
        }
        
        .timeline-info {
          margin-top: 20px;
        }
      `}</style>
    </Card>
  );
};

export default ValueEvolutionTimeline;