import React, { useState } from 'react';
import { PageContainer, Button, message, Tabs, Empty } from 'antd';
import { CreditCardOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import PlanSelector from '../components/billing/PlanSelector';
import UsageStatistics from '../components/billing/UsageStatistics';
import BillingService from '../services/billing/BillingService';
import AuthService from '../services/auth/AuthService';

const { TabPane } = Tabs;

const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('usage');
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    return (
      <PageContainer title="计费管理">
        <Empty description="请先登录" />
      </PageContainer>
    );
  }
  
  const handleSelectPlan = (planId: string) => {
    try {
      const updatedUser = BillingService.upgradePlan(user, planId);
      AuthService.updateUserInfo(updatedUser);
      message.success('套餐更新成功！');
    } catch (error: any) {
      message.error(`套餐更新失败：${error.message}`);
    }
  };
  
  return (
    <PageContainer title="计费管理">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        items={[
          {
            key: 'usage',
            label: (
              <span>
                <BarChartOutlined />
                使用量统计
              </span>
            ),
            children: <UsageStatistics user={user} />
          },
          {
            key: 'plans',
            label: (
              <span>
                <CreditCardOutlined />
                套餐管理
              </span>
            ),
            children: (
              <div className="billing-plans-content">
                <PlanSelector 
                  onSelectPlan={handleSelectPlan} 
                  currentPlanId={user.currentPlanId}
                />
              </div>
            )
          },
          {
            key: 'invoices',
            label: (
              <span>
                <FileTextOutlined />
                发票管理
              </span>
            ),
            children: (
              <div className="billing-invoices-content">
                <Empty description="发票管理功能即将上线" />
              </div>
            )
          }
        ]}
      />
      
      <style jsx>{`
        .billing-plans-content {
          margin-top: 24px;
        }
        
        .billing-invoices-content {
          margin-top: 24px;
          text-align: center;
          padding: 40px 0;
        }
      `}</style>
    </PageContainer>
  );
};

export default Billing;
