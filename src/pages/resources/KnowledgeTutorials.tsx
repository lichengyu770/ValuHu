import React from 'react';
import { Card, Typography, Row, Col, Avatar, Tag, Progress } from 'antd';

const { Title, Paragraph } = Typography;

// 模拟教程数据
const tutorials = [
  {
    id: 1,
    title: '房地产估价基础教程',
    description: '系统介绍房地产估价的基本原理、方法和流程',
    author: '王教授',
    avatar: 'https://picsum.photos/id/1005/80/80',
    tags: ['估价', '基础', '教程'],
    progress: 100,
    lessons: 12
  },
  {
    id: 2,
    title: 'AI估价技术进阶',
    description: '深入学习AI在房地产估价中的应用和实践',
    author: '李工程师',
    avatar: 'https://picsum.photos/id/1012/80/80',
    tags: ['AI估价', '进阶', '技术'],
    progress: 80,
    lessons: 10
  },
  {
    id: 3,
    title: '房地产投资分析实战',
    description: '通过实际案例学习房地产投资分析的方法和技巧',
    author: '张分析师',
    avatar: 'https://picsum.photos/id/1027/80/80',
    tags: ['投资分析', '实战', '案例'],
    progress: 60,
    lessons: 8
  },
  {
    id: 4,
    title: '大数据在房地产中的应用',
    description: '探索大数据技术在房地产市场分析中的应用',
    author: '刘数据师',
    avatar: 'https://picsum.photos/id/1025/80/80',
    tags: ['大数据', '应用', '技术'],
    progress: 90,
    lessons: 15
  }
];

const KnowledgeTutorials: React.FC = () => {
  return (
    <div className="knowledge-tutorials-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>知识教程</Title>
        <Paragraph>学习房地产估价、投资分析等专业知识</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        {tutorials.map((item) => (
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
                      <Tag key={index} color="green">{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: '#666' }}>课程进度</span>
                  <span style={{ fontSize: 14, color: '#1890ff' }}>{item.progress}%</span>
                </div>
                <Progress percent={item.progress} status="active" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar src={item.avatar} alt={item.author} />
                  <span style={{ fontSize: 14, color: '#666' }}>{item.author}</span>
                </div>
                <div style={{ fontSize: 14, color: '#999' }}>
                  {item.lessons} 节课程
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KnowledgeTutorials;