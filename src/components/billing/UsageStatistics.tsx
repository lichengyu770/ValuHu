import React from 'react';
import { Card, Progress, Statistic, Row, Col, Typography } from 'antd';
import { BarChartOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';
import BillingService from '../../services/billing/BillingService';
import { User } from '../../services/auth/AuthService';

const { Title, Paragraph } = Typography;

interface UsageStatisticsProps {
  user: User;
}

const UsageStatistics: React.FC<UsageStatisticsProps> = ({ user }) => {
  const plan = BillingService.getUserCurrentPlan(user);
  if (!plan) return null;
  
  const usageStats = BillingService.calculateUsageStats(user);
  const usageLimitInfo = BillingService.checkUsageLimit(user);
  
  return (
    <div className="usage-statistics-container">
      <div className="usage-statistics-header">
        <Title level={3}>使用量统计</Title>
        <Paragraph>
          显示您当前套餐的使用情况，包括估价次数、存储空间和API调用次数。
        </Paragraph>
      </div>
      
      <div className="usage-statistics-content">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="usage-card">
              <Statistic
                title="估价次数"
                value={usageStats.used}
                suffix={`/ ${usageStats.total === Infinity ? '无限' : usageStats.total}`}
                icon={<BarChartOutlined />}
              />
              <Progress 
                percent={Math.min((usageStats.used / (usageStats.total || 1)) * 100, 100)} 
                status={usageLimitInfo.isNearLimit ? 'warning' : 'normal'}
                strokeColor={usageLimitInfo.isNearLimit ? '#faad14' : '#1890ff'}
                className="usage-progress"
              />
              <div className="usage-remaining">
                剩余：{usageStats.remaining === Infinity ? '无限' : usageStats.remaining} 次
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="usage-card">
              <Statistic
                title="存储空间"
                value={user.usage?.storageUsed || 0}
                suffix=" MB"
                icon={<DatabaseOutlined />}
              />
              <Progress 
                percent={0} 
                status="normal"
                className="usage-progress"
              />
              <div className="usage-remaining">
                剩余：无限
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8}>
            <Card hoverable className="usage-card">
              <Statistic
                title="API调用"
                value={user.usage?.apiCallsUsed || 0}
                suffix=" 次"
                icon={<FileTextOutlined />}
              />
              <Progress 
                percent={0} 
                status="normal"
                className="usage-progress"
              />
              <div className="usage-remaining">
                剩余：无限
              </div>
            </Card>
          </Col>
        </Row>
        
        <div className="usage-plan-info">
          <Card className="plan-info-card">
            <div className="plan-info-content">
              <div className="plan-info-header">
                <h4>当前套餐：{plan.name}</h4>
                <p>有效期至：{user.usage?.periodEnd ? new Date(user.usage.periodEnd).toLocaleDateString() : '无限制'}</p>
              </div>
              
              <div className="plan-info-features">
                <h5>套餐包含：</h5>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <style jsx>{`
        .usage-statistics-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .usage-statistics-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .usage-statistics-content {
          margin-bottom: 24px;
        }
        
        .usage-card {
          text-align: center;
        }
        
        .usage-progress {
          margin: 16px 0 8px 0;
        }
        
        .usage-remaining {
          font-size: 12px;
          color: #8c8c8c;
        }
        
        .usage-plan-info {
          margin-top: 24px;
        }
        
        .plan-info-card {
          margin-top: 24px;
        }
        
        .plan-info-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        
        .plan-info-header {
          flex: 1;
          min-width: 200px;
        }
        
        .plan-info-header h4 {
          margin: 0 0 8px 0;
          color: #1890ff;
        }
        
        .plan-info-header p {
          margin: 0;
          color: #8c8c8c;
          font-size: 14px;
        }
        
        .plan-info-features {
          flex: 2;
          min-width: 300px;
          margin-top: 16px;
        }
        
        .plan-info-features h5 {
          margin: 0 0 12px 0;
          font-size: 16px;
        }
        
        .plan-info-features ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .plan-info-features li {
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .plan-info-content {
            flex-direction: column;
          }
          
          .plan-info-features {
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default UsageStatistics;
