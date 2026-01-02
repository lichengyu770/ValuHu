import React from 'react';
import { Card, Button, Radio, Divider, Tag, Typography } from 'antd';
import { CheckCircleOutlined, StarOutlined, DollarOutlined } from '@ant-design/icons';
import BillingService from '../../services/billing/BillingService';
import { Plan } from '../../services/auth/AuthService';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

interface PlanSelectorProps {
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ onSelectPlan, currentPlanId = 'free' }) => {
  const plans = BillingService.getAllPlans();
  
  return (
    <div className="plan-selector-container">
      <div className="plan-selector-header">
        <Title level={3}>选择适合您的套餐</Title>
        <Paragraph>
          根据您的需求和使用情况，选择最适合您的套餐。所有套餐均包含基础功能，高级套餐提供更多的估价次数和专属功能。
        </Paragraph>
      </div>
      
      <div className="plan-selector-content">
        <Radio.Group 
          value={currentPlanId} 
          onChange={(e) => onSelectPlan(e.target.value)} 
          className="plan-radio-group"
        >
          <div className="plan-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-item">
                <Card
                  hoverable
                  className={`plan-card ${currentPlanId === plan.id ? 'current-plan' : ''}`}
                  bordered={false}
                >
                  <Radio value={plan.id} className="plan-radio" />
                  
                  <Meta
                    title={
                      <div className="plan-title">
                        <span>{plan.name}</span>
                        {plan.id === 'enterprise' && (
                          <Tag color="gold" icon={<StarOutlined />} className="plan-tag">
                            推荐
                          </Tag>
                        )}
                      </div>
                    }
                    description={plan.description}
                  />
                  
                  <div className="plan-price">
                    <DollarOutlined />
                    <span className="price-amount">{plan.price}</span>
                    <span className="price-period">/{plan.period === 'monthly' ? '月' : '年'}</span>
                  </div>
                  
                  <Divider />
                  
                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircleOutlined className="feature-icon" />
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    type={currentPlanId === plan.id ? 'default' : 'primary'} 
                    size="large" 
                    className="select-button"
                    onClick={() => onSelectPlan(plan.id)}
                  >
                    {currentPlanId === plan.id ? '当前套餐' : '选择套餐'}
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </Radio.Group>
      </div>
      
      <style jsx>{`
        .plan-selector-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .plan-selector-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .plan-selector-content {
          margin-bottom: 24px;
        }
        
        .plan-radio-group {
          width: 100%;
        }
        
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }
        
        .plan-item {
          position: relative;
        }
        
        .plan-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        
        .plan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .current-plan {
          border: 2px solid #1890ff;
          box-shadow: 0 4px 16px rgba(24, 144, 255, 0.2);
        }
        
        .plan-radio {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 1;
        }
        
        .plan-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .plan-tag {
          margin-left: 8px;
        }
        
        .plan-price {
          margin: 16px 0;
          font-size: 28px;
          font-weight: bold;
          color: #1890ff;
          display: flex;
          align-items: center;
        }
        
        .price-amount {
          margin: 0 4px;
        }
        
        .price-period {
          font-size: 14px;
          color: #8c8c8c;
          font-weight: normal;
        }
        
        .plan-features {
          margin: 16px 0;
          flex-grow: 1;
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .feature-icon {
          color: #52c41a;
          margin-right: 8px;
          font-size: 16px;
        }
        
        .feature-text {
          font-size: 14px;
        }
        
        .select-button {
          margin-top: 16px;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PlanSelector;
