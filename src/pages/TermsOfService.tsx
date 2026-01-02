import React from 'react';
import { Title, Paragraph } from 'antd';

const TermsOfService: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>服务条款</Title>
      <Paragraph>
        欢迎使用房算云平台。请仔细阅读以下服务条款，使用本平台即表示您同意遵守这些条款。
      </Paragraph>
      <Title level={3}>1. 服务内容</Title>
      <Paragraph>
        房算云平台提供房地产AI估价、数据分析、案例社区等服务。
      </Paragraph>
      <Title level={3}>2. 用户责任</Title>
      <Paragraph>
        用户应确保提供的信息真实、准确、完整，并遵守国家法律法规。
      </Paragraph>
      <Title level={3}>3. 知识产权</Title>
      <Paragraph>
        平台上的所有内容，包括但不限于文字、图片、音频、视频等，均受知识产权法律保护。
      </Paragraph>
      <Title level={3}>4. 免责声明</Title>
      <Paragraph>
        平台提供的信息仅供参考，不构成任何投资建议。
      </Paragraph>
      <Title level={3}>5. 条款变更</Title>
      <Paragraph>
        我们有权随时修改本服务条款，修改后的条款将在平台上公布。
      </Paragraph>
    </div>
  );
};

export default TermsOfService;