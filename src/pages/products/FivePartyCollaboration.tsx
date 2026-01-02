import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const FivePartyCollaboration: React.FC = () => {
  return (
    <div className="five-party-collaboration-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>五方协同</Title>
        <Paragraph>连接政府、企业、学校、协会和大众，构建房地产数智生态</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={6}>
          <Card title="政府端" hoverable>
            <Paragraph>为政府提供房地产市场监管、数据分析和决策支持服务。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="企业端" hoverable>
            <Paragraph>为企业提供房地产估价、投资分析和风险管理服务。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="学校端" hoverable>
            <Paragraph>为学校提供房地产教学资源、实践平台和证书认证服务。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card title="协会端" hoverable>
            <Paragraph>为协会提供行业标准制定、数据统计和会员服务。</Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={24}>
          <Card title="大众端" hoverable>
            <Paragraph>为大众提供房地产估价、市场查询和投资建议服务，帮助普通用户了解房地产市场。</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FivePartyCollaboration;