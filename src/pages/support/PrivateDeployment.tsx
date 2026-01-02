import React from 'react';
import { Card, Typography, Row, Col, Button } from 'antd';
import { ServerOutlined, ShieldOutlined, CloudOutlined, LockOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const PrivateDeployment: React.FC = () => {
  return (
    <div className="private-deployment-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>私有化部署</Title>
        <Paragraph>将房算云平台部署到您的私有环境，数据完全自主可控</Paragraph>
      </div>
      
      {/* 私有化部署优势 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }}>
                <ShieldOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>数据安全</h3>
              <Paragraph>
                数据存储在您自己的服务器上，完全自主可控，确保数据安全和隐私
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }}>
                <ServerOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>灵活部署</h3>
              <Paragraph>
                支持多种部署方式，可根据您的需求选择私有云、本地服务器或混合部署
              </Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card hoverable>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#faad14' }}>
                <SettingOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>定制化配置</h3>
              <Paragraph>
                可根据您的业务需求进行定制化配置，满足不同行业和场景的需求
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 部署方案 */}
      <Card title="部署方案" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
              <h4>标准部署</h4>
              <ul>
                <li>适合中小型企业和团队</li>
                <li>快速部署，开箱即用</li>
                <li>基本功能完整</li>
                <li>较低的部署成本</li>
              </ul>
              <Button type="primary" style={{ marginTop: 16 }}>了解详情</Button>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
              <h4>定制部署</h4>
              <ul>
                <li>适合大型企业和机构</li>
                <li>根据需求定制功能</li>
                <li>高级安全配置</li>
                <li>专业技术支持</li>
              </ul>
              <Button type="primary" style={{ marginTop: 16 }}>了解详情</Button>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* 部署流程 */}
      <Card title="部署流程">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                1
              </div>
              <h4 style={{ marginBottom: 8 }}>需求分析</h4>
              <Paragraph>
                了解您的业务需求和部署环境
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                2
              </div>
              <h4 style={{ marginBottom: 8 }}>方案设计</h4>
              <Paragraph>
                设计适合您的部署方案
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                3
              </div>
              <h4 style={{ marginBottom: 8 }}>部署实施</h4>
              <Paragraph>
                专业团队进行部署和配置
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={6}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#1890ff', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                4
              </div>
              <h4 style={{ marginBottom: 8 }}>培训支持</h4>
              <Paragraph>
                提供使用培训和技术支持
              </Paragraph>
            </div>
          </Col>
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" size="large">
            咨询私有化部署
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PrivateDeployment;