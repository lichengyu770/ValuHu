import React from 'react';
import { PageContainer } from 'antd';
import MonitoringDashboardComponent from '../components/monitoring/MonitoringDashboard';

const MonitoringDashboard: React.FC = () => {
  return (
    <PageContainer title="监控仪表板">
      <MonitoringDashboardComponent />
    </PageContainer>
  );
};

export default MonitoringDashboard;
