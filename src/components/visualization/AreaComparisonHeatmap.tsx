import React, { useState } from 'react';
import { Card, Typography, Tooltip, Slider, Select } from 'antd';
import { MapOutlined, HomeOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 模拟区域数据
const areaData = [
  { id: 1, name: '朝阳区', averagePrice: 85000, increaseRate: 5.2, coordinates: { x: 20, y: 30 } },
  { id: 2, name: '海淀区', averagePrice: 92000, increaseRate: 6.8, coordinates: { x: 35, y: 45 } },
  { id: 3, name: '东城区', averagePrice: 88000, increaseRate: 4.5, coordinates: { x: 50, y: 30 } },
  { id: 4, name: '西城区', averagePrice: 95000, increaseRate: 7.2, coordinates: { x: 65, y: 45 } },
  { id: 5, name: '丰台区', averagePrice: 68000, increaseRate: 3.8, coordinates: { x: 35, y: 60 } },
  { id: 6, name: '石景山区', averagePrice: 59000, increaseRate: 2.9, coordinates: { x: 65, y: 60 } },
  { id: 7, name: '通州区', averagePrice: 52000, increaseRate: 8.5, coordinates: { x: 50, y: 75 } },
  { id: 8, name: '大兴区', averagePrice: 48000, increaseRate: 7.8, coordinates: { x: 35, y: 90 } },
  { id: 9, name: '房山区', averagePrice: 38000, increaseRate: 4.2, coordinates: { x: 65, y: 90 } },
  { id: 10, name: '顺义区', averagePrice: 45000, increaseRate: 5.8, coordinates: { x: 80, y: 75 } },
];

// 获取价格对应的颜色
const getPriceColor = (price: number) => {
  const minPrice = Math.min(...areaData.map(area => area.averagePrice));
  const maxPrice = Math.max(...areaData.map(area => area.averagePrice));
  const ratio = (price - minPrice) / (maxPrice - minPrice);
  
  // 渐变颜色从蓝色到红色
  const r = Math.round(66 + (255 - 66) * ratio);
  const g = Math.round(126 + (128 - 126) * ratio);
  const b = Math.round(234 + (140 - 234) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};

const AreaComparisonHeatmap: React.FC = () => {
  const [year, setYear] = useState(2026);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <Card className="card card-ai" title="区域对比热力图" bordered={false}>
      <div className="area-comparison-heatmap">
        <div className="heatmap-controls">
          <div className="control-item">
            <label>年份：</label>
            <Select 
              value={year} 
              onChange={setYear}
              style={{ width: 120, marginLeft: 8 }}
            >
              {[2024, 2025, 2026].map(y => (
                <Option key={y} value={y}>{y}</Option>
              ))}
            </Select>
          </div>
          <div className="control-item">
            <label>价格范围：</label>
            <Slider 
              range 
              min={30000} 
              max={100000} 
              value={priceRange}
              onChange={setPriceRange}
              style={{ flex: 1, marginLeft: 8 }}
              formatter={(value) => `¥${value.toLocaleString()}`}
            />
          </div>
        </div>

        <div className="heatmap-container">
          <svg width="100%" height="500" viewBox="0 0 100 100">
            {/* 背景网格 */}
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(24, 144, 255, 0.1)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* 区域标记 */}
            {areaData.map(area => {
              // 过滤价格范围
              if (area.averagePrice < priceRange[0] || area.averagePrice > priceRange[1]) {
                return null;
              }
              
              const color = getPriceColor(area.averagePrice);
              const isSelected = selectedArea === area.name;
              
              return (
                <g key={area.id} onClick={() => setSelectedArea(area.name)} style={{ cursor: 'pointer' }}>
                  {/* 区域圆圈 */}
                  <circle 
                    cx={area.coordinates.x} 
                    cy={area.coordinates.y} 
                    r={5} 
                    fill={color} 
                    stroke={isSelected ? '#1890ff' : 'white'} 
                    strokeWidth={isSelected ? 2 : 1} 
                    opacity={0.8}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  
                  {/* 区域名称 */}
                  <text 
                    x={area.coordinates.x} 
                    y={area.coordinates.y - 8} 
                    textAnchor="middle" 
                    fontSize="2" 
                    fill="#333"
                    fontWeight="bold"
                  >
                    {area.name}
                  </text>
                  
                  {/* 价格标签 */}
                  <text 
                    x={area.coordinates.x} 
                    y={area.coordinates.y + 12} 
                    textAnchor="middle" 
                    fontSize="1.5" 
                    fill="#666"
                  >
                    ¥{area.averagePrice.toLocaleString()}
                  </text>
                  
                  {/* 增长率 */}
                  <g transform={`translate(${area.coordinates.x}, ${area.coordinates.y + 5})`}>
                    <text 
                      x="0" 
                      y="0" 
                      textAnchor="middle" 
                      fontSize="1.2" 
                      fill={area.increaseRate > 0 ? '#52c41a' : '#ff4d4f'}
                    >
                      {area.increaseRate > 0 ? '+' : ''}{area.increaseRate}%
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="heatmap-legend">
          <div className="legend-title">价格图例</div>
          <div className="legend-scale">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getPriceColor(38000) }}></div>
              <span>¥38,000</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getPriceColor(60000) }}></div>
              <span>¥60,000</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getPriceColor(80000) }}></div>
              <span>¥80,000</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getPriceColor(95000) }}></div>
              <span>¥95,000</span>
            </div>
          </div>
        </div>

        {selectedArea && (
          <div className="area-detail">
            <Title level={5} style={{ marginBottom: 12 }}>
              <HomeOutlined /> {selectedArea} 详情
            </Title>
            {areaData.map(area => {
              if (area.name === selectedArea) {
                return (
                  <div key={area.id} className="detail-content">
                    <div className="detail-item">
                      <span className="detail-label">平均价格：</span>
                      <span className="detail-value">¥{area.averagePrice.toLocaleString()}/㎡</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">增长率：</span>
                      <span className={`detail-value ${area.increaseRate > 0 ? 'increase' : 'decrease'}`}>
                        {area.increaseRate > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {area.increaseRate > 0 ? '+' : ''}{area.increaseRate}%
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        )}

        <div className="heatmap-info">
          <Paragraph style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
            <strong>分析说明：</strong>该热力图展示了北京市主要区域的房价分布情况，颜色越深表示价格越高。
            海淀区和西城区价格最高，通州区增长率最高。您可以通过价格范围滑块筛选不同价格区间的区域。
          </Paragraph>
        </div>
      </div>
      
      <style jsx>{`
        .area-comparison-heatmap {
          padding: 16px 0;
        }
        
        .heatmap-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .control-item {
          display: flex;
          align-items: center;
        }
        
        .control-item label {
          font-weight: 500;
          color: #333;
        }
        
        .heatmap-container {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .heatmap-legend {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .legend-title {
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }
        
        .legend-scale {
          display: flex;
          justify-content: center;
          gap: 20px;
          align-items: center;
        }
        
        .legend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        
        .legend-color {
          width: 30px;
          height: 15px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .area-detail {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          margin-bottom: 24px;
          border-left: 4px solid #1890ff;
        }
        
        .detail-content {
          display: flex;
          gap: 32px;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .detail-label {
          color: #666;
          font-weight: 500;
        }
        
        .detail-value {
          color: #333;
          font-weight: bold;
        }
        
        .detail-value.increase {
          color: #52c41a;
        }
        
        .detail-value.decrease {
          color: #ff4d4f;
        }
        
        .heatmap-info {
          margin-top: 20px;
        }
      `}</style>
    </Card>
  );
};

export default AreaComparisonHeatmap;