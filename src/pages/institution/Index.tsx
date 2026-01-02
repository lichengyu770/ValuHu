import React from 'react';
import { Card, Row, Col, Button, Typography } from 'antd';
import { MapOutlined, DatabaseOutlined, BookOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import MapComponent from '../../components/Map/MapComponent';

const { Title, Paragraph } = Typography;

/**
 * 院校端首页
 * 提供院校专属的功能入口和数据展示
 */
const InstitutionIndex: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>院校端平台</Title>
      <Paragraph>
        欢迎使用房算云院校端平台，为房地产相关专业提供教学、科研和实践支持
      </Paragraph>

      {/* 功能卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="教学资源库"
            icon={<BookOutlined />}
            hoverable
          >
            <p>提供房地产估价案例、教学课件、视频教程等丰富资源</p>
            <Button type="primary" style={{ marginTop: '10px' }}>进入资源库</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="学生管理"
            icon={<UserOutlined />}
            hoverable
          >
            <p>管理学生信息、作业提交、成绩统计等教学管理功能</p>
            <Button type="primary" style={{ marginTop: '10px' }}>学生管理</Button>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="实践实训平台"
            icon={<MapOutlined />}
            hoverable
          >
            <p>提供真实房地产数据和估价工具，支持学生实践操作</p>
            <Button type="primary" style={{ marginTop: '10px' }}>进入实训</Button>
          </Card>
        </Col>
      </Row>

      {/* 地图功能区域 */}
      <Card title="区域数据可视化">
        <MapComponent
          initialLocation={{ lat: 27.8211, lng: 112.9388 }} // 默认长沙坐标
          zoom={11}
          onLocationSelect={(location) => {
            console.log('选择的位置:', location);
          }}
        />
      </Card>

      {/* 数据统计区域 */}
      <Card title="教学数据统计" style={{ marginTop: '20px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <BarChartOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>1,234</div>
              <div style={{ color: '#666' }}>学生人数</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>567</div>
              <div style={{ color: '#666' }}>案例数量</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <BookOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>89</div>
              <div style={{ color: '#666' }}>课程数量</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <MapOutlined style={{ fontSize: '24px', color: '#f5222d', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>32</div>
              <div style={{ color: '#666' }}>城市数据</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InstitutionIndex;