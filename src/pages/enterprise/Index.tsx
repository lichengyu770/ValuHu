import React, { useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Typography, Progress, Tag, Divider } from 'antd';
import { 
  MapOutlined, DatabaseOutlined, BarChartOutlined, 
  DollarOutlined, BuildingOutlined, FileTextOutlined,
  UploadOutlined, EyeOutlined, DownloadOutlined
} from '@ant-design/icons';
import MapComponent from '../../components/Map/MapComponent';
import '../../styles/enterprise.css';

const { Title, Paragraph, Text } = Typography;

/**
 * 企业端首页
 * 提供企业专属的功能入口和数据展示
 */
const EnterpriseIndex: React.FC = () => {
  const particleContainerRef = useRef<HTMLDivElement>(null);
  
  // 生成粒子动画
  useEffect(() => {
    if (!particleContainerRef.current) return;
    
    const container = particleContainerRef.current;
    const particles: HTMLDivElement[] = [];
    
    // 生成20个粒子
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      particle.style.animationDuration = `${2 + Math.random() * 2}s`;
      container.appendChild(particle);
      particles.push(particle);
    }
    
    return () => {
      particles.forEach(particle => particle.remove());
    };
  }, []);

  return (
    <div className="enterprise-theme">
      <div className="enterprise-container">
        <Title level={2} className="enterprise-title">
          资产管理指挥中心
        </Title>
        <Paragraph className="enterprise-subtitle">
          欢迎使用房算云企业端平台，为房地产企业提供估价、数据分析和决策支持
        </Paragraph>

        {/* 功能卡片 - 交易卡片风格 */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card
              title="项目估价管理"
              icon={<DollarOutlined />}
              hoverable
              className="enterprise-card asset-card"
            >
              <Text className="enterprise-text">
                管理企业房地产项目估价，生成专业估价报告
              </Text>
              <Button type="primary" className="enterprise-btn" style={{ marginTop: '16px' }}>
                项目管理
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              title="数据分析中心"
              icon={<BarChartOutlined />}
              hoverable
              className="enterprise-card asset-card"
            >
              <Text className="enterprise-text">
                提供房地产市场数据分析、趋势预测等决策支持
              </Text>
              <Button type="primary" className="enterprise-btn" style={{ marginTop: '16px' }}>
                数据分析
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card
              title="企业资源管理"
              icon={<BuildingOutlined />}
              hoverable
              className="enterprise-card asset-card"
            >
              <Text className="enterprise-text">
                管理企业房地产资源、客户信息和业务流程
              </Text>
              <Button type="primary" className="enterprise-btn" style={{ marginTop: '16px' }}>
                资源管理
              </Button>
            </Card>
          </Col>
        </Row>

        {/* 数据统计区域 - 金融级专业风格 */}
        <Card title="企业数据概览" className="enterprise-card" style={{ marginBottom: '32px' }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className="stat-card">
                <BuildingOutlined className="stat-icon" />
                <div className="stat-value">234</div>
                <div className="stat-label">项目数量</div>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={75} 
                    strokeColor={"#00B894"} 
                    strokeWidth={4} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className="stat-card">
                <DollarOutlined className="stat-icon" />
                <div className="stat-value">¥12.5亿</div>
                <div className="stat-label">总估价额</div>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={85} 
                    strokeColor={"#6c5ce7"} 
                    strokeWidth={4} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className="stat-card">
                <BarChartOutlined className="stat-icon" />
                <div className="stat-value">156</div>
                <div className="stat-label">数据分析报告</div>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={65} 
                    strokeColor={"#fdcb6e"} 
                    strokeWidth={4} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card bordered={false} className="stat-card">
                <MapOutlined className="stat-icon" />
                <div className="stat-value">8</div>
                <div className="stat-label">覆盖城市</div>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={90} 
                    strokeColor={"#a29bfe"} 
                    strokeWidth={4} 
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 批量操作进度可视化 */}
        <Card title="批量估价处理" className="enterprise-card batch-progress-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <Text strong className="enterprise-text">当前任务：批量上传500个房产估价</Text>
              <div style={{ marginTop: '8px' }}>
                <Progress 
                  percent={68} 
                  className="enterprise-progress"
                  format={(percent) => `${percent}% (340/500)`}
                />
              </div>
            </div>
            <Tag className="enterprise-tag">处理中</Tag>
          </div>
          
          {/* 粒子动画容器 */}
          <div ref={particleContainerRef} className="particle-container"></div>
          
          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <div className="stat-value">340</div>
              <div className="stat-label">已处理</div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="stat-value">160</div>
              <div className="stat-label">待处理</div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div className="stat-value">0</div>
              <div className="stat-label">处理失败</div>
            </Col>
          </Row>
        </Card>

        {/* 地图功能区域 */}
        <Card title="企业项目分布" className="enterprise-card" style={{ margin: '32px 0' }}>
          <MapComponent
            initialLocation={{ lat: 31.2304, lng: 121.4737 }} // 默认上海坐标
            zoom={10}
            onLocationSelect={(location) => {
              console.log('选择的项目位置:', location);
            }}
          />
        </Card>

        <Divider className="enterprise-divider" />

        {/* 报告预览 - 3D翻页效果 */}
        <Title level={3} className="enterprise-title" style={{ marginBottom: '24px' }}>
          最新报告
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <div className="report-card">
              <div className="report-preview">
                <div className="report-front">
                  <div>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>上海外滩项目估价报告</div>
                  </div>
                </div>
                <div className="report-back">
                  <div>
                    <EyeOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>点击查看详情</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '14px' }}>2026-01-02</div>
                  <Button type="text" icon={<DownloadOutlined />} style={{ color: '#00B894' }}>
                    下载
                  </Button>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="report-card">
              <div className="report-preview">
                <div className="report-front">
                  <div>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>北京中关村区域分析报告</div>
                  </div>
                </div>
                <div className="report-back">
                  <div>
                    <EyeOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>点击查看详情</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '14px' }}>2026-01-01</div>
                  <Button type="text" icon={<DownloadOutlined />} style={{ color: '#00B894' }}>
                    下载
                  </Button>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className="report-card">
              <div className="report-preview">
                <div className="report-front">
                  <div>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>深圳南山房价趋势分析</div>
                  </div>
                </div>
                <div className="report-back">
                  <div>
                    <EyeOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '16px', marginTop: '8px' }}>点击查看详情</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '14px' }}>2025-12-30</div>
                  <Button type="text" icon={<DownloadOutlined />} style={{ color: '#00B894' }}>
                    下载
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EnterpriseIndex;