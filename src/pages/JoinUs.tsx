import React from 'react';
import { Title, Paragraph } from 'antd';

const JoinUs: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>加入我们</Title>
      <Paragraph>
        房算云正在寻找优秀的人才加入我们的团队，共同打造房地产数智生态平台。
      </Paragraph>
      <Paragraph>
        我们提供具有竞争力的薪酬福利、良好的工作环境和广阔的发展空间。
      </Paragraph>
      <Paragraph>
        如果你对房地产科技行业充满热情，欢迎投递简历至：hr@fangsuanyun.com
      </Paragraph>
    </div>
  );
};

export default JoinUs;