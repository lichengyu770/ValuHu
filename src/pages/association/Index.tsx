import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { MapOutlined, DatabaseOutlined, UserOutlined, BarChartOutlined, FileTextOutlined } from '@ant-design/icons';
import MapComponent from '../../components/Map/MapComponent';

const { Title, Paragraph } = Typography;

/**
 * 协会端首页
 * 提供协会专属的功能入口和数据展示
 */
const AssociationIndex: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>协会端平台</Title>
      <Paragraph>
        欢迎使用房算云协会端平台，为房地产行业协会提供行业管理、数据统计和服务支持
      </Paragraph>

      {/* 功能卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="行业会员管理"
            icon={<UserOutlined />}
            hoverable
          >
            <p>管理协会会员信息、资质认证、活动参与等</p>
            <Button type="primary" style={{ marginTop: '10px' }}>会员管理</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="行业数据统计"
            icon={<BarChartOutlined />}
            hoverable
          >
            <p>统计分析房地产行业数据，生成行业报告和趋势分析</p>
            <Button type="primary" style={{ marginTop: '10px' }}>数据统计</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="行业标准制定"
            icon={<FileTextOutlined />}
            hoverable
          >
            <p>制定和管理房地产估价行业标准、规范和指南</p>
            <Button type="primary" style={{ marginTop: '10px' }}>标准管理</Button>
          </Card>
        </Col>
      </Row>

      {/* 地图功能区域 */}
      <Card title="会员企业分布">
        <MapComponent
          initialLocation={{ lat: 39.9042, lng: 116.4074 }} // 默认北京坐标
          zoom={9}
          onLocationSelect={(location) => {
            console.log('选择的区域:', location);
          }}
        />
      </Card>

      {/* 数据统计区域 */}
      <Card title="协会数据统计" style={{ marginTop: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <UserOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>2,589</div>
              <div style={{ color: '#666' }}>会员企业</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12</div>
              <div style={{ color: '#666' }}>行业标准</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <BarChartOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>45</div>
              <div style={{ color: '#666' }}>行业报告</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <MapOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>56</div>
              <div style={{ color: '#666' }}>覆盖城市</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AssociationIndex;