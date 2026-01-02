import React from 'react';
import { Card, Typography, Row, Col, Collapse, Steps } from 'antd';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

const UserManual: React.FC = () => {
  return (
    <div className="user-manual-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>使用手册</Title>
        <Paragraph>详细了解房算云平台的功能和使用方法</Paragraph>
      </div>
      
      {/* 快速入门步骤 */}
      <Card title="快速入门" style={{ marginBottom: 24 }}>
        <Steps direction="vertical" size="small">
          <Step title="注册账号" description="填写基本信息，完成账号注册" />
          <Step title="登录平台" description="使用注册的账号登录房算云平台" />
          <Step title="选择功能" description="根据需求选择合适的功能模块" />
          <Step title="输入参数" description="按照提示输入相关参数" />
          <Step title="查看结果" description="获取生成的报告和结果" />
        </Steps>
      </Card>
      
      {/* 功能模块详细说明 */}
      <Card title="功能模块说明">
        <Collapse defaultActiveKey={['1']}>
          <Panel header="AI估价报告" key="1">
            <Paragraph>
              AI估价报告功能可以帮助您快速生成精准的房产估价报告。
              您只需要输入房产的基本信息，如地址、面积、户型等，系统会基于AI算法和市场数据为您生成专业的估价报告。
            </Paragraph>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
                  <h4>输入参数</h4>
                  <ul>
                    <li>房产地址</li>
                    <li>建筑面积</li>
                    <li>户型结构</li>
                    <li>建筑年代</li>
                    <li>楼层信息</li>
                  </ul>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
                  <h4>输出结果</h4>
                  <ul>
                    <li>预估价值</li>
                    <li>可信度评分</li>
                    <li>价值构成分析</li>
                    <li>相似房源对比</li>
                    <li>市场趋势分析</li>
                  </ul>
                </div>
              </Col>
            </Row>
          </Panel>
          
          <Panel header="AI房价预测" key="2">
            <Paragraph>
              AI房价预测功能可以帮助您预测未来一段时间内的房价走势。
              您可以选择城市或区域，系统会基于历史数据和AI算法为您生成房价预测报告。
            </Paragraph>
          </Panel>
          
          <Panel header="AI投资分析" key="3">
            <Paragraph>
              AI投资分析功能可以帮助您评估房地产投资的收益率和回报情况。
              您可以输入购买价格、租金收入、持有年限等参数，系统会为您计算投资回报率等指标。
            </Paragraph>
          </Panel>
          
          <Panel header="AI政策解读" key="4">
            <Paragraph>
              AI政策解读功能可以帮助您理解房地产相关政策的影响和意义。
              系统会对政策进行深入分析，并提供对市场和投资的影响评估。
            </Paragraph>
          </Panel>
          
          <Panel header="数据看板" key="5">
            <Paragraph>
              数据看板功能可以帮助您实时掌握房地产市场动态。
              系统会展示平均房价、交易量、同比增长等关键指标，并通过图表直观展示市场趋势。
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
};

export default UserManual;