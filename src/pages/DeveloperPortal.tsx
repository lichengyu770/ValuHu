import React from 'react';
import { PageContainer, Typography, Tabs, Card, Row, Col, Button } from 'antd';
import { 
  CodeOutlined, 
  FileTextOutlined, 
  BookOutlined, 
  MessageOutlined,
  DownloadOutlined,
  GithubOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const DeveloperPortal: React.FC = () => {
  return (
    <PageContainer title="开发者平台">
      <div className="developer-portal-container">
        <div className="developer-portal-header">
          <Title level={3}>欢迎来到ValuHub开发者平台</Title>
          <Paragraph>
            在这里，您可以访问我们的API文档、生成SDK、参与社区讨论，以及获取最新的开发资源。
          </Paragraph>
        </div>
        
        <div className="developer-portal-features">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <FileTextOutlined />
                </div>
                <div className="feature-content">
                  <h4>API文档</h4>
                  <p>查看完整的API文档，了解如何使用我们的API服务</p>
                  <Button type="primary" icon={<BookOutlined />} className="feature-button">
                    查看文档
                  </Button>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <CodeOutlined />
                </div>
                <div className="feature-content">
                  <h4>SDK生成器</h4>
                  <p>自动生成多种语言的SDK，简化开发流程</p>
                  <Button type="primary" icon={<DownloadOutlined />} className="feature-button">
                    生成SDK
                  </Button>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <MessageOutlined />
                </div>
                <div className="feature-content">
                  <h4>开发者社区</h4>
                  <p>参与开发者社区讨论，获取支持和分享经验</p>
                  <Button type="primary" icon={<GithubOutlined />} className="feature-button">
                    加入社区
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <Tabs defaultActiveKey="api" className="developer-portal-tabs">
          {/* API文档 */}
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                API文档
              </span>
            } 
            key="api"
          >
            <div className="api-docs-content">
              <Card className="api-docs-card">
                <div className="api-docs-placeholder">
                  <FileTextOutlined className="placeholder-icon" />
                  <h3>API文档正在建设中</h3>
                  <p>我们正在准备完整的API文档，敬请期待！</p>
                  <Button type="primary" icon={<DownloadOutlined />} size="large">
                    下载API规范
                  </Button>
                </div>
              </Card>
            </div>
          </TabPane>
          
          {/* SDK生成器 */}
          <TabPane 
            tab={
              <span>
                <CodeOutlined />
                SDK生成器
              </span>
            } 
            key="sdk"
          >
            <div className="sdk-generator-content">
              <Card className="sdk-generator-card">
                <div className="sdk-generator-placeholder">
                  <CodeOutlined className="placeholder-icon" />
                  <h3>SDK生成器正在建设中</h3>
                  <p>我们正在开发SDK生成器，敬请期待！</p>
                  <Button type="primary" icon={<GithubOutlined />} size="large">
                    查看GitHub示例
                  </Button>
                </div>
              </Card>
            </div>
          </TabPane>
          
          {/* 开发者社区 */}
          <TabPane 
            tab={
              <span>
                <MessageOutlined />
                开发者社区
              </span>
            } 
            key="community"
          >
            <div className="developer-community-content">
              <Card className="community-card">
                <div className="community-placeholder">
                  <MessageOutlined className="placeholder-icon" />
                  <h3>开发者社区正在建设中</h3>
                  <p>我们正在构建开发者社区，敬请期待！</p>
                  <Button type="primary" icon={<GithubOutlined />} size="large">
                    关注GitHub
                  </Button>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        .developer-portal-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .developer-portal-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .developer-portal-features {
          margin-bottom: 32px;
        }
        
        .feature-card {
          text-align: center;
          padding: 24px;
        }
        
        .feature-icon {
          font-size: 48px;
          color: #1890ff;
          margin-bottom: 16px;
        }
        
        .feature-content h4 {
          margin: 0 0 8px 0;
          color: #1890ff;
        }
        
        .feature-content p {
          margin: 0 0 16px 0;
          color: #8c8c8c;
        }
        
        .feature-button {
          width: 100%;
        }
        
        .developer-portal-tabs {
          margin-top: 24px;
        }
        
        .api-docs-card,
        .sdk-generator-card,
        .community-card {
          padding: 48px 24px;
        }
        
        .api-docs-placeholder,
        .sdk-generator-placeholder,
        .community-placeholder {
          text-align: center;
        }
        
        .placeholder-icon {
          font-size: 64px;
          color: #d9d9d9;
          margin-bottom: 16px;
        }
        
        .placeholder-icon + h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .placeholder-icon + h3 + p {
          margin: 0 0 24px 0;
          color: #8c8c8c;
        }
      `}</style>
    </PageContainer>
  );
};

export default DeveloperPortal;
