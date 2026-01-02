import React from 'react';
import { Card, Typography, Row, Col, Tag } from 'antd';

const { Title, Paragraph } = Typography;

// 模拟专题数据
const topics = [
  {
    id: 1,
    title: '2025年中国房地产市场展望',
    description: '全面分析2025年中国房地产市场的发展趋势和预测',
    tags: ['市场展望', '2025', '趋势分析'],
    articles: 25,
    views: 12500
  },
  {
    id: 2,
    title: 'AI估价技术发展与应用',
    description: '探讨AI估价技术的最新发展和在房地产行业的应用案例',
    tags: ['AI估价', '技术发展', '应用案例'],
    articles: 18,
    views: 9800
  },
  {
    id: 3,
    title: '房地产投资策略专题',
    description: '分享不同市场环境下的房地产投资策略和技巧',
    tags: ['投资策略', '市场环境', '技巧分享'],
    articles: 32,
    views: 15600
  },
  {
    id: 4,
    title: '城市更新与老旧小区改造',
    description: '关注城市更新和老旧小区改造的政策、案例和实践',
    tags: ['城市更新', '老旧小区', '政策解读'],
    articles: 20,
    views: 8900
  }
];

const SpecialTopics: React.FC = () => {
  return (
    <div className="special-topics-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>专题频道</Title>
        <Paragraph>深入探讨房地产行业的热点话题和专题内容</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        {topics.map((item) => (
          <Col xs={24} lg={12} key={item.id}>
            <Card hoverable>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, marginBottom: 8 }}>{item.title}</h3>
                <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                  {item.description}
                </Paragraph>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {item.tags.map((tag, index) => (
                    <Tag key={index} color="purple">{tag}</Tag>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, color: '#999' }}>
                <span>{item.articles} 篇文章</span>
                <span>{item.views} 次浏览</span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SpecialTopics;