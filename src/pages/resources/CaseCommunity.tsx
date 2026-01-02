import React from 'react';
import { Card, Typography, Row, Col, Avatar, Tag } from 'antd';

const { Title, Paragraph } = Typography;

// 模拟案例数据
const cases = [
  {
    id: 1,
    title: '北京朝阳区住宅估价案例',
    description: '详细分析了北京朝阳区一套120㎡三居室的估价过程和结果',
    author: '张专家',
    avatar: 'https://picsum.photos/id/1005/80/80',
    tags: ['住宅', '北京', '估价报告'],
    views: 1250,
    likes: 89
  },
  {
    id: 2,
    title: '上海浦东新区商业地产投资分析',
    description: '对上海浦东新区一处商业地产的投资回报率进行了深入分析',
    author: '李分析师',
    avatar: 'https://picsum.photos/id/1012/80/80',
    tags: ['商业', '上海', '投资分析'],
    views: 980,
    likes: 67
  },
  {
    id: 3,
    title: '广州天河区房价走势预测',
    description: '基于历史数据和市场趋势，预测了广州天河区未来3年的房价走势',
    author: '王预测师',
    avatar: 'https://picsum.photos/id/1027/80/80',
    tags: ['住宅', '广州', '房价预测'],
    views: 1560,
    likes: 123
  },
  {
    id: 4,
    title: '深圳南山区写字楼租赁市场分析',
    description: '分析了深圳南山区写字楼租赁市场的现状和趋势',
    author: '赵顾问',
    avatar: 'https://picsum.photos/id/1025/80/80',
    tags: ['写字楼', '深圳', '租赁市场'],
    views: 890,
    likes: 56
  }
];

const CaseCommunity: React.FC = () => {
  return (
    <div className="case-community-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>案例社区</Title>
        <Paragraph>分享和交流房地产估价、投资分析等案例</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        {cases.map((item) => (
          <Col xs={24} lg={12} key={item.id}>
            <Card hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: 8 }}>{item.title}</h3>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 12 }}>
                    {item.description}
                  </Paragraph>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {item.tags.map((tag, index) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar src={item.avatar} alt={item.author} />
                  <span style={{ fontSize: 14, color: '#666' }}>{item.author}</span>
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#999' }}>
                  <span>{item.views} 浏览</span>
                  <span>{item.likes} 点赞</span>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CaseCommunity;