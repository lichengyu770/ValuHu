import React from 'react';
import { Card, Typography, Progress, Tooltip } from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { HomeOutlined, DollarOutlined, LineChartOutlined, BuildingOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 模拟估价成分数据
const compositionData = [
  { name: '位置价值', value: 40, color: '#667eea', icon: <EnvironmentOutlined /> },
  { name: '建筑品质', value: 30, color: '#764ba2', icon: <BuildingOutlined /> },
  { name: '市场行情', value: 15, color: '#f093fb', icon: <LineChartOutlined /> },
  { name: '配套设施', value: 10, color: '#4facfe', icon: <HomeOutlined /> },
  { name: '其他因素', value: 5, color: '#00f2fe', icon: <DollarOutlined /> },
];

// 营养标签样式的数据项
const nutritionLabelData = compositionData.map(item => ({
  ...item,
  percentage: `${item.value}%`,
}));

const ValuationComposition: React.FC = () => {
  return (
    <Card className="card card-ai" title="估价成分分解图" bordered={false}>
      <div className="valuation-composition">
        <div className="composition-content">
          <div className="chart-section">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`${value}%`, '占比']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e8e8e8'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-legend">
              {compositionData.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <div className="legend-info">
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-value">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="nutrition-section">
            <Title level={5} style={{ marginBottom: 24 }}>估价营养标签</Title>
            
            <div className="nutrition-label">
              <div className="nutrition-header">
                <span className="label-title">房产估价成分</span>
                <span className="label-subtitle">100% 完整估价</span>
              </div>
              
              <div className="nutrition-items">
                {nutritionLabelData.map((item, index) => (
                  <div key={index} className="nutrition-item">
                    <div className="item-left">
                      <div className="item-icon">{item.icon}</div>
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-percentage">{item.percentage}</span>
                      </div>
                    </div>
                    <div className="item-right">
                      <Progress 
                        percent={item.value} 
                        strokeColor={item.color} 
                        strokeWidth={8} 
                        showInfo={false} 
                        size="small"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="nutrition-footer">
                <span className="footer-text">基于AI估价模型 V3.0 生成</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="composition-info">
          <Paragraph style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
            <strong>分析说明：</strong>该分解图展示了房产估价的各个组成部分，其中位置价值占比最高(40%)，其次是建筑品质(30%)。
            通过这个分析，您可以清楚地了解影响房产价值的主要因素，为投资决策提供参考。
          </Paragraph>
        </div>
      </div>
      
      <style jsx>{`
        .valuation-composition {
          padding: 16px 0;
        }
        
        .composition-content {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        
        .chart-section {
          flex: 1;
          min-width: 300px;
        }
        
        .chart-container {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
        }
        
        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .legend-info {
          display: flex;
          justify-content: space-between;
          flex: 1;
        }
        
        .legend-name {
          font-weight: 500;
          color: #333;
        }
        
        .legend-value {
          font-weight: 600;
          color: #666;
        }
        
        .nutrition-section {
          flex: 1;
          min-width: 300px;
        }
        
        .nutrition-label {
          background: linear-gradient(135deg, #f5f7fa 0%, #e6e9f0 100%);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        
        .nutrition-header {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid rgba(24, 144, 255, 0.2);
        }
        
        .label-title {
          display: block;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 4px;
        }
        
        .label-subtitle {
          display: block;
          font-size: 14px;
          color: #666;
        }
        
        .nutrition-items {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .nutrition-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }
        
        .item-icon {
          font-size: 20px;
          color: #1890ff;
        }
        
        .item-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .item-name {
          font-weight: 500;
          color: #333;
        }
        
        .item-percentage {
          font-size: 12px;
          color: #666;
        }
        
        .item-right {
          width: 120px;
        }
        
        .nutrition-footer {
          text-align: center;
          padding-top: 16px;
          border-top: 1px solid rgba(24, 144, 255, 0.2);
        }
        
        .footer-text {
          font-size: 12px;
          color: #999;
        }
        
        .composition-info {
          margin-top: 20px;
        }
      `}</style>
    </Card>
  );
};

export default ValuationComposition;