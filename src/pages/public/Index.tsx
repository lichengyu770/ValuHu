import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { MapOutlined, DatabaseOutlined, DollarOutlined, HomeOutlined, BarChartOutlined } from '@ant-design/icons';
import MapComponent from '../../components/Map/MapComponent';

const { Title, Paragraph } = Typography;

/**
 * 大众端首页
 * 提供大众用户专属的功能入口和数据展示
 */
const PublicIndex: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>大众端平台</Title>
      <Paragraph>
        欢迎使用房算云大众端平台，为普通用户提供房地产估价、市场查询和投资参考服务
      </Paragraph>

      {/* 功能卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="房产估价查询"
            icon={<DollarOutlined />}
            hoverable
          >
            <p>快速获取房产估价，了解市场价值</p>
            <Button type="primary" style={{ marginTop: '10px' }}>立即估价</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="市场数据查询"
            icon={<BarChartOutlined />}
            hoverable
          >
            <p>查询房地产市场数据、价格走势和区域分析</p>
            <Button type="primary" style={{ marginTop: '10px' }}>市场查询</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="投资参考工具"
            icon={<HomeOutlined />}
            hoverable
          >
            <p>提供房产投资计算器、回报率分析等工具</p>
            <Button type="primary" style={{ marginTop: '10px' }}>投资工具</Button>
          </Card>
        </Col>
      </Row>

      {/* 地图功能区域 */}
      <Card title="周边房产查询">
        <MapComponent
          initialLocation={{ lat: 39.9042, lng: 116.4074 }} // 默认北京坐标
          zoom={13}
          onLocationSelect={(location) => {
            console.log('选择的房产位置:', location);
          }}
        />
      </Card>

      {/* 数据统计区域 */}
      <Card title="房产市场概览" style={{ marginTop: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <HomeOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12,345</div>
              <div style={{ color: '#666' }}>查询次数</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>32</div>
              <div style={{ color: '#666' }}>覆盖城市</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <DollarOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>56,789</div>
              <div style={{ color: '#666' }}>估价报告</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <MapOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1,234</div>
              <div style={{ color: '#666' }}>区域数据</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PublicIndex;