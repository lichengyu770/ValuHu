import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

const HelpCenter: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>帮助中心</Title>
      <Paragraph>解决您在使用房算云平台过程中遇到的问题</Paragraph>
      
      <Card title="常见问题" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>1. 如何注册房算云账号？</Title>
          <Paragraph>您可以通过房算云官网首页的"注册"按钮进入注册页面，填写相关信息后即可完成注册。注册成功后，您可以使用注册的邮箱和密码登录房算云平台。</Paragraph>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>2. 如何使用AI估价功能？</Title>
          <Paragraph>登录房算云平台后，点击左侧导航栏中的"AI估价"选项，进入AI估价页面。在输入框中输入房产地址或关键词，点击"生成报告"按钮，系统将自动生成AI估价报告。</Paragraph>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>3. 如何查看我的估价报告？</Title>
          <Paragraph>您可以通过左侧导航栏中的"我的文件"选项进入文件管理页面，在该页面中您可以查看所有生成的估价报告和数据分析文件。</Paragraph>
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <Title level={4}>4. 如何联系客服？</Title>
          <Paragraph>您可以通过以下方式联系我们的客服团队：
            <br />• 客服热线：400-123-4567
            <br />• 邮箱：support@fangsuanyun.com
            <br />• 在线客服：登录平台后，点击右下角的"在线客服"按钮</Paragraph>
        </div>
        
        <div>
          <Title level={4}>5. 如何升级为专业版会员？</Title>
          <Paragraph>您可以通过左侧导航栏中的"价格"选项进入价格页面，选择适合您的会员方案，点击"立即购买"按钮，按照提示完成支付后即可升级为专业版会员。</Paragraph>
        </div>
      </Card>
      
      <Card title="联系我们">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30 }}>
          <div>
            <Title level={4}>客服热线</Title>
            <Text>400-123-4567</Text>
            <Paragraph style={{ color: '#999', fontSize: 14 }}>工作日 9:00-18:00</Paragraph>
          </div>
          <div>
            <Title level={4}>客服邮箱</Title>
            <Text>support@fangsuanyun.com</Text>
            <Paragraph style={{ color: '#999', fontSize: 14 }}>24小时内回复</Paragraph>
          </div>
          <div>
            <Title level={4}>在线客服</Title>
            <Text>登录平台后，点击右下角"在线客服"</Text>
            <Paragraph style={{ color: '#999', fontSize: 14 }}>工作日 9:00-18:00</Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HelpCenter;