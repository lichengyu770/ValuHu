import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Tabs, Empty } from 'antd';
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  DollarOutlined, 
  LoadingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ApiOutlined,
  EyeOutlined,
  TrendingUpOutlined
} from '@ant-design/icons';
import monitoringService from '../../services/monitoring/MonitoringService';
import { AppPerformanceData, BusinessMetricData, CostMetricData } from '../../services/monitoring/MonitoringService';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const MonitoringDashboard: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<AppPerformanceData | null>(null);
  const [businessData, setBusinessData] = useState<BusinessMetricData | null>(null);
  const [costData, setCostData] = useState<CostMetricData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 初始化监控服务
    monitoringService.initialize();
    
    // 获取监控数据
    fetchMonitoringData();
    
    // 定期更新监控数据
    const intervalId = setInterval(() => {
      fetchMonitoringData();
    }, 30000); // 每30秒更新一次
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const fetchMonitoringData = () => {
    setLoading(true);
    
    // 模拟异步获取数据
    setTimeout(() => {
      const perfData = monitoringService.generatePerformanceReport();
      const bizData = monitoringService.generateBusinessReport();
      const costD = monitoringService.generateCostReport();
      
      setPerformanceData(perfData);
      setBusinessData(bizData);
      setCostData(costD);
      setLoading(false);
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="monitoring-loading">
        <LoadingOutlined spin size="large" />
        <p>加载监控数据中...</p>
      </div>
    );
  }
  
  return (
    <div className="monitoring-dashboard-container">
      <div className="monitoring-dashboard-header">
        <Title level={3}>全方位监控系统</Title>
        <Paragraph>
          实时监控应用性能、业务指标和成本数据，帮助您了解系统运行状况和优化方向。
        </Paragraph>
      </div>
      
      <div className="monitoring-dashboard-content">
        <Tabs defaultActiveKey="performance">
          {/* 应用性能监控 */}
          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                应用性能监控
              </span>
            } 
            key="performance"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="首次内容绘制 (FCP)"
                    value={performanceData?.fcp}
                    suffix="ms"
                    icon={<ClockCircleOutlined />}
                    valueStyle={performanceData?.fcp < 1000 ? { color: '#52c41a' } : performanceData?.fcp < 2000 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.fcp || 0) / 3000 * 100, 100)} 
                    status={performanceData?.fcp < 1000 ? 'success' : performanceData?.fcp < 2000 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="最大内容绘制 (LCP)"
                    value={performanceData?.lcp}
                    suffix="ms"
                    icon={<ClockCircleOutlined />}
                    valueStyle={performanceData?.lcp < 2500 ? { color: '#52c41a' } : performanceData?.lcp < 4000 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.lcp || 0) / 5000 * 100, 100)} 
                    status={performanceData?.lcp < 2500 ? 'success' : performanceData?.lcp < 4000 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="累积布局偏移 (CLS)"
                    value={performanceData?.cls}
                    precision={3}
                    icon={<TrendingUpOutlined />}
                    valueStyle={performanceData?.cls < 0.1 ? { color: '#52c41a' } : performanceData?.cls < 0.25 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.cls || 0) / 0.5 * 100, 100)} 
                    status={performanceData?.cls < 0.1 ? 'success' : performanceData?.cls < 0.25 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="首次输入延迟 (FID)"
                    value={performanceData?.fid}
                    suffix="ms"
                    icon={<ClockCircleOutlined />}
                    valueStyle={performanceData?.fid < 100 ? { color: '#52c41a' } : performanceData?.fid < 300 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.fid || 0) / 500 * 100, 100)} 
                    status={performanceData?.fid < 100 ? 'success' : performanceData?.fid < 300 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="首字节时间 (TTFB)"
                    value={performanceData?.ttfb}
                    suffix="ms"
                    icon={<ClockCircleOutlined />}
                    valueStyle={performanceData?.ttfb < 600 ? { color: '#52c41a' } : performanceData?.ttfb < 1000 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.ttfb || 0) / 1500 * 100, 100)} 
                    status={performanceData?.ttfb < 600 ? 'success' : performanceData?.ttfb < 1000 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="可交互时间 (TTI)"
                    value={performanceData?.tti}
                    suffix="ms"
                    icon={<ClockCircleOutlined />}
                    valueStyle={performanceData?.tti < 3800 ? { color: '#52c41a' } : performanceData?.tti < 7300 ? { color: '#faad14' } : { color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((performanceData?.tti || 0) / 10000 * 100, 100)} 
                    status={performanceData?.tti < 3800 ? 'success' : performanceData?.tti < 7300 ? 'warning' : 'exception'}
                    className="performance-progress"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* 业务指标监控 */}
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                业务指标监控
              </span>
            } 
            key="business"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="估价次数"
                    value={businessData?.valuationCount}
                    icon={<TrendingUpOutlined />}
                    prefix={<EyeOutlined />}
                  />
                  <Progress 
                    percent={85} 
                    status="normal"
                    className="business-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="用户数量"
                    value={businessData?.userCount}
                    icon={<UserOutlined />}
                  />
                  <Progress 
                    percent={78} 
                    status="normal"
                    className="business-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="API调用次数"
                    value={businessData?.apiCallCount}
                    icon={<ApiOutlined />}
                  />
                  <Progress 
                    percent={92} 
                    status="normal"
                    className="business-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="页面浏览次数"
                    value={businessData?.pageViewCount}
                    icon={<EyeOutlined />}
                  />
                  <Progress 
                    percent={65} 
                    status="normal"
                    className="business-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="转化率"
                    value={businessData?.conversionRate}
                    suffix="%"
                    precision={2}
                    icon={<TrendingUpOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Progress 
                    percent={businessData?.conversionRate || 0} 
                    status="normal"
                    className="business-progress"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          {/* 成本监控 */}
          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                成本监控
              </span>
            } 
            key="cost"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="API成本"
                    value={costData?.apiCost}
                    prefix="¥"
                    precision={2}
                    icon={<DollarOutlined />}
                  />
                  <Progress 
                    percent={Math.min((costData?.apiCost || 0) / 200 * 100, 100)} 
                    status="normal"
                    className="cost-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="存储成本"
                    value={costData?.storageCost}
                    prefix="¥"
                    precision={2}
                    icon={<DollarOutlined />}
                  />
                  <Progress 
                    percent={Math.min((costData?.storageCost || 0) / 150 * 100, 100)} 
                    status="normal"
                    className="cost-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Card hoverable className="monitoring-card">
                  <Statistic
                    title="带宽成本"
                    value={costData?.bandwidthCost}
                    prefix="¥"
                    precision={2}
                    icon={<DollarOutlined />}
                  />
                  <Progress 
                    percent={Math.min((costData?.bandwidthCost || 0) / 100 * 100, 100)} 
                    status="normal"
                    className="cost-progress"
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={24} md={24}>
                <Card hoverable className="monitoring-card total-cost-card">
                  <Statistic
                    title="总成本"
                    value={costData?.totalCost}
                    prefix="¥"
                    precision={2}
                    icon={<DollarOutlined />}
                    valueStyle={{ color: '#f5222d' }}
                  />
                  <Progress 
                    percent={Math.min((costData?.totalCost || 0) / 500 * 100, 100)} 
                    status="normal"
                    className="cost-progress"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        .monitoring-dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .monitoring-dashboard-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .monitoring-dashboard-content {
          margin-bottom: 24px;
        }
        
        .monitoring-card {
          text-align: center;
        }
        
        .performance-progress,
        .business-progress,
        .cost-progress {
          margin: 16px 0 0 0;
        }
        
        .total-cost-card {
          margin-top: 16px;
        }
        
        .monitoring-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
        }
        
        .monitoring-loading p {
          margin-top: 16px;
          color: #8c8c8c;
        }
      `}</style>
    </div>
  );
};

export default MonitoringDashboard;
