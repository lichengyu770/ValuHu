import React from 'react';
import { Card, Typography, Row, Col, Button, Statistic } from 'antd';
import { GiftOutlined, UserPlusOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const InviteRewards: React.FC = () => {
  return (
    <div className="invite-rewards-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>邀请有礼</Title>
        <Paragraph>邀请好友使用房算云，双方均可获得丰厚奖励</Paragraph>
      </div>
      
      {/* 邀请奖励统计 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="已邀请好友"
              value={0}
              prefix={<UserPlusOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="获得奖励"
              value={0}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="剩余天数"
              value={30}
              prefix={<CalendarOutlined />}
              suffix="天"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="可获最高奖励"
              value={500}
              prefix={<GiftOutlined />}
              suffix="元/人"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 邀请规则 */}
      <Card title="邀请规则" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
              <h4>奖励规则</h4>
              <ul>
                <li>邀请好友注册并完成首次估价，您可获得50元奖励</li>
                <li>好友完成首次付费，您可获得100元奖励</li>
                <li>好友购买年度会员，您可获得300元奖励</li>
                <li>邀请人数越多，奖励越多，上不封顶</li>
              </ul>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
              <h4>领取条件</h4>
              <ul>
                <li>邀请的好友必须是首次注册</li>
                <li>好友必须完成相应的任务</li>
                <li>奖励将在好友完成任务后自动发放</li>
                <li>奖励可用于平台消费或提现</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
      
      {/* 邀请方式 */}
      <Card title="邀请方式">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }}>📱</div>
                <h3 style={{ marginBottom: 8 }}>分享邀请链接</h3>
                <Paragraph style={{ marginBottom: 16 }}>
                  生成专属邀请链接，分享给好友
                </Paragraph>
                <Button type="primary" block>生成邀请链接</Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card hoverable>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }}>📧</div>
                <h3 style={{ marginBottom: 8 }}>发送邀请邮件</h3>
                <Paragraph style={{ marginBottom: 16 }}>
                  通过邮件邀请好友加入房算云
                </Paragraph>
                <Button type="primary" block>发送邀请邮件</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InviteRewards;