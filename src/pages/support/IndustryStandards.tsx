import React from 'react';
import { Card, Typography, Row, Col, Progress } from 'antd';
import { CheckCircleOutlined, BarChartOutlined, BookOutlined, TrophyOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const IndustryStandards: React.FC = () => {
  return (
    <div className="industry-standards-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>对标行业标准</Title>
        <Paragraph>确保房算云平台的服务和质量符合行业标准要求</Paragraph>
      </div>
      
      {/* 标准对标情况 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="标准符合度">
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>数据准确性标准</span>
                <span>95%</span>
              </div>
              <Progress percent={95} status="success" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>服务响应时间标准</span>
                <span>98%</span>
              </div>
              <Progress percent={98} status="success" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>数据安全标准</span>
                <span>100%</span>
              </div>
              <Progress percent={100} status="success" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>用户满意度标准</span>
                <span>92%</span>
              </div>
              <Progress percent={92} status="success" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="采用的行业标准">
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ marginRight: 12, color: '#52c41a' }}>
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>房地产估价规范（GB/T 50291-2015）</h4>
                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#666' }}>
                    国家标准，规范房地产估价行为
                  </Paragraph>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ marginRight: 12, color: '#52c41a' }}>
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>房地产数据采集规范</h4>
                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#666' }}>
                    行业标准，规范房地产数据采集流程
                  </Paragraph>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ marginRight: 12, color: '#52c41a' }}>
                  <CheckCircleOutlined />
                </div>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>AI伦理规范</h4>
                  <Paragraph style={{ margin: 0, fontSize: 14, color: '#666' }}>
                    确保AI估价算法的公平性和透明度
                  </Paragraph>
                </div>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
      
      {/* 标准优势 */}
      <Card title="标准优势">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }}>
                <TrophyOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>提升服务质量</h3>
              <Paragraph>
                严格遵循行业标准，确保服务质量和数据准确性
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }}>
                <StarOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>增强用户信任</h3>
              <Paragraph>
                符合行业标准，提升用户对平台的信任度
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} lg={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#faad14' }}>
                <BookOutlined />
              </div>
              <h3 style={{ marginBottom: 8 }}>促进行业发展</h3>
              <Paragraph>
                推动行业标准化发展，提升整体水平
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default IndustryStandards;