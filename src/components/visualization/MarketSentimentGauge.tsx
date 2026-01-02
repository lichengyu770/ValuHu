import React from 'react';
import { Card, Typography, Progress, Statistic } from 'antd';
import { ThermometerOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

// 市场情绪数据
const sentimentData = {
  current: 75,
  previous: 68,
  trend: 'up',
  description: '当前市场情绪较为活跃，买家需求旺盛，卖家信心充足。',
  levels: [
    { name: '冷淡', range: [0, 25], color: '#4facfe', description: '市场交易清淡，需求不足' },
    { name: '平稳', range: [25, 50], color: '#00f2fe', description: '市场稳定，供需平衡' },
    { name: '活跃', range: [50, 75], color: '#f093fb', description: '市场活跃，交易频繁' },
    { name: '火爆', range: [75, 100], color: '#764ba2', description: '市场火爆，竞争激烈' },
  ]
};

// 获取当前情绪等级
const getCurrentLevel = (value: number) => {
  return sentimentData.levels.find(level => value >= level.range[0] && value < level.range[1]) || sentimentData.levels[3];
};

const currentLevel = getCurrentLevel(sentimentData.current);

const MarketSentimentGauge: React.FC = () => {
  return (
    <Card className="card card-ai" title="市场情绪仪表" bordered={false}>
      <div className="market-sentiment-gauge">
        <div className="gauge-content">
          <div className="thermometer-section">
            <div className="thermometer-container">
              <div className="thermometer">
                {/* 温度计刻度 */}
                <div className="thermometer-scale">
                  {[0, 25, 50, 75, 100].map((tick, index) => (
                    <div key={index} className="scale-tick">
                      <div className="tick-line"></div>
                      <div className="tick-label">{tick}°</div>
                    </div>
                  ))}
                </div>
                
                {/* 温度计主体 */}
                <div className="thermometer-body">
                  {/* 背景渐变 */}
                  <div className="thermometer-bg">
                    {sentimentData.levels.map((level, index) => (
                      <div 
                        key={index} 
                        className="level-section" 
                        style={{
                          height: '25%',
                          backgroundColor: level.color,
                          opacity: 0.2
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {/* 填充液体 */}
                  <div 
                    className="thermometer-fill"
                    style={{
                      height: `${sentimentData.current}%`,
                      background: `linear-gradient(to top, ${currentLevel.color}, ${currentLevel.color}80)`,
                      transition: 'height 1s ease-in-out'
                    }}
                  ></div>
                  
                  {/* 温度计头部 */}
                  <div className="thermometer-head">
                    <div 
                      className="head-bulb"
                      style={{ backgroundColor: currentLevel.color }}
                    ></div>
                  </div>
                </div>
                
                {/* 当前数值指示器 */}
                <div 
                  className="current-indicator"
                  style={{
                    top: `${100 - sentimentData.current}%`,
                    transform: 'translateY(50%)'
                  }}
                >
                  <div className="indicator-arrow"></div>
                  <div 
                    className="indicator-value"
                    style={{ backgroundColor: currentLevel.color }}
                  >
                    {sentimentData.current}°
                  </div>
                </div>
              </div>
            </div>
            
            {/* 情绪等级说明 */}
            <div className="level-info">
              <div className="current-level">
                <div className="level-badge" style={{ backgroundColor: currentLevel.color }}>
                  {currentLevel.name}
                </div>
                <div className="level-description">
                  {currentLevel.description}
                </div>
              </div>
            </div>
          </div>
          
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-item">
                <Statistic
                  title="当前情绪指数"
                  value={sentimentData.current}
                  precision={0}
                  valueStyle={{ 
                    color: currentLevel.color,
                    fontSize: '36px',
                    fontWeight: 'bold'
                  }}
                  suffix="°"
                />
              </div>
              
              <div className="stat-item">
                <Statistic
                  title="环比变化"
                  value={sentimentData.current - sentimentData.previous}
                  precision={1}
                  valueStyle={{ 
                    color: sentimentData.trend === 'up' ? '#52c41a' : '#ff4d4f',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                  prefix={sentimentData.trend === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix="°"
                />
              </div>
            </div>
            
            <div className="progress-section">
              <div className="progress-label">市场情绪变化趋势</div>
              <Progress 
                percent={sentimentData.current} 
                strokeColor={{
                  '0%': sentimentData.levels[0].color,
                  '25%': sentimentData.levels[1].color,
                  '50%': sentimentData.levels[2].color,
                  '100%': sentimentData.levels[3].color,
                }} 
                strokeWidth={12}
                format={() => ''}
              />
            </div>
            
            <div className="sentiment-description">
              <Title level={5} style={{ marginBottom: 12 }}>情绪分析</Title>
              <Paragraph style={{ color: '#666', fontSize: '14px' }}>
                {sentimentData.description}
              </Paragraph>
              
              <div className="sentiment-advice">
                <div className="advice-title">投资建议：</div>
                <Paragraph style={{ color: '#333', fontSize: '14px', marginBottom: 0 }}>
                  {sentimentData.current > 75 
                    ? '市场火爆，建议谨慎入市，关注优质房源，避免盲目跟风。'
                    : sentimentData.current > 50
                    ? '市场活跃，是入市的较好时机，建议积极寻找合适房源。'
                    : '市场较为平稳，可耐心等待，挑选性价比高的房源。'}
                </Paragraph>
              </div>
            </div>
            
            <div className="trend-indicator">
              <div className="trend-item">
                <div className="trend-icon">
                  <ThermometerOutlined style={{ color: currentLevel.color }} />
                </div>
                <div className="trend-info">
                  <div className="trend-label">当前市场温度</div>
                  <div className="trend-value" style={{ color: currentLevel.color }}>
                    {currentLevel.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="gauge-info">
          <Paragraph style={{ color: '#666', fontSize: '14px', marginTop: '20px' }}>
            <strong>分析说明：</strong>市场情绪仪表通过分析成交量、带看量、价格走势等数据综合计算得出，
            数值范围为0-100°，数值越高表示市场越活跃。当前市场情绪处于{currentLevel.name}状态，
            建议根据自身情况制定合理的投资策略。
          </Paragraph>
        </div>
      </div>
      
      <style jsx>{`
        .market-sentiment-gauge {
          padding: 16px 0;
        }
        
        .gauge-content {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        
        .thermometer-section {
          flex: 0 0 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .thermometer-container {
          position: relative;
          width: 100%;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .thermometer {
          position: relative;
          width: 60px;
          height: 350px;
        }
        
        .thermometer-scale {
          position: absolute;
          right: -40px;
          top: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 25px 0;
        }
        
        .scale-tick {
          display: flex;
          align-items: center;
        }
        
        .tick-line {
          width: 8px;
          height: 1px;
          background: #999;
          margin-right: 8px;
        }
        
        .tick-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }
        
        .thermometer-body {
          position: relative;
          width: 40px;
          height: 100%;
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 20px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .thermometer-bg {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column-reverse;
        }
        
        .level-section {
          flex: 1;
          transition: all 0.3s ease;
        }
        
        .thermometer-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          border-radius: 20px;
          transition: height 1.5s ease-in-out;
        }
        
        .thermometer-head {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 60px;
          background: white;
          border: 2px solid #e8e8e8;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .head-bulb {
          width: 40px;
          height: 40px;
          background: #764ba2;
          border-radius: 50%;
          transition: background 0.3s ease;
        }
        
        .current-indicator {
          position: absolute;
          left: -80px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: top 1.5s ease-in-out;
        }
        
        .indicator-arrow {
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 8px solid currentColor;
        }
        
        .indicator-value {
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .level-info {
          margin-top: 24px;
          text-align: center;
        }
        
        .current-level {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .level-badge {
          color: white;
          padding: 6px 16px;
          border-radius: 16px;
          font-weight: bold;
          font-size: 16px;
        }
        
        .level-description {
          color: #666;
          font-size: 14px;
        }
        
        .stats-section {
          flex: 1;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .stat-item {
          text-align: center;
        }
        
        .progress-section {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .progress-label {
          font-weight: 500;
          color: #333;
          margin-bottom: 16px;
          font-size: 14px;
        }
        
        .sentiment-description {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .sentiment-advice {
          margin-top: 16px;
          padding: 16px;
          background: #f5f7fa;
          border-radius: 8px;
          border-left: 4px solid #1890ff;
        }
        
        .advice-title {
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        
        .trend-indicator {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .trend-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .trend-icon {
          font-size: 32px;
        }
        
        .trend-info {
          display: flex;
          flex-direction: column;
        }
        
        .trend-label {
          font-size: 14px;
          color: #666;
        }
        
        .trend-value {
          font-size: 20px;
          font-weight: bold;
        }
        
        .gauge-info {
          margin-top: 20px;
        }
      `}</style>
    </Card>
  );
};

export default MarketSentimentGauge;