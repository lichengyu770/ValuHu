import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const IndustrialEmpowerment: React.FC = () => {
  return (
    <div className="industrial-empowerment-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>产业赋能</Title>
        <Paragraph>助力房地产行业数字化转型，释放数据价值</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="智能估价" hoverable>
            <Paragraph>基于AI算法的精准房产估价服务，为您提供专业的市场价值评估。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="数据分析" hoverable>
            <Paragraph>深入分析房地产市场数据，帮助您把握市场趋势和投资机会。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="决策支持" hoverable>
            <Paragraph>提供数据驱动的决策建议，助力企业和个人做出明智的房地产投资决策。</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IndustrialEmpowerment;