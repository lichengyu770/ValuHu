import React from 'react';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Paragraph } = Typography;

const EducationInnovation: React.FC = () => {
  return (
    <div className="education-innovation-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>教育革新</Title>
        <Paragraph>产教融合，培养房地产行业高素质人才</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="实践教学" hoverable>
            <Paragraph>提供真实的房地产数据和案例，支持实践教学和实习实训。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="在线课程" hoverable>
            <Paragraph>丰富的在线课程资源，涵盖房地产估价、数据分析等专业知识。</Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="证书认证" hoverable>
            <Paragraph>行业认可的证书认证体系，提升学生就业竞争力和职业发展空间。</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EducationInnovation;