import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { MapOutlined, DatabaseOutlined, BarChartOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons';
import MapComponent from '../../components/Map/MapComponent';

const { Title, Paragraph } = Typography;

/**
 * 政府端首页
 * 提供政府专属的功能入口和数据展示
 */
const GovernmentIndex: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>政府端平台</Title>
      <Paragraph>
        欢迎使用房算云政府端平台，为房地产监管部门提供市场监管、数据统计和政策制定支持
      </Paragraph>

      {/* 功能卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="房地产市场监管"
            icon={<HomeOutlined />}
            hoverable
          >
            <p>监管房地产市场交易、价格走势和市场秩序</p>
            <Button type="primary" style={{ marginTop: '10px' }}>市场监管</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="数据分析决策"
            icon={<BarChartOutlined />}
            hoverable
          >
            <p>提供房地产市场数据分析，支持政策制定和决策</p>
            <Button type="primary" style={{ marginTop: '10px' }}>数据分析</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="政策文件管理"
            icon={<FileTextOutlined />}
            hoverable
          >
            <p>管理房地产相关政策文件、通知和公告</p>
            <Button type="primary" style={{ marginTop: '10px' }}>政策管理</Button>
          </Card>
        </Col>
      </Row>

      {/* 地图功能区域 */}
      <Card title="房地产市场分布">
        <MapComponent
          initialLocation={{ lat: 39.9042, lng: 116.4074 }} // 默认北京坐标
          zoom={9}
          onLocationSelect={(location) => {
            console.log('选择的监管区域:', location);
          }}
        />
      </Card>

      {/* 数据统计区域 */}
      <Card title="市场数据统计" style={{ marginTop: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <HomeOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>123,456</div>
              <div style={{ color: '#666' }}>监管项目</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>56</div>
              <div style={{ color: '#666' }}>监管城市</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <BarChartOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>89</div>
              <div style={{ color: '#666' }}>数据分析报告</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <MapOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>32</div>
              <div style={{ color: '#666' }}>政策文件</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default GovernmentIndex;