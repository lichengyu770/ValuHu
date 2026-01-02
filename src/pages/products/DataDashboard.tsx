import React from 'react';
import { Card, Typography, Row, Col, Statistic, Progress } from 'antd';
import { BarChartOutlined, LineChartOutlined, PieChartOutlined, TrendingUpOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const { Title, Paragraph } = Typography;

// 模拟数据
const barData = [
  { name: '北京', 房价: 65000, 交易量: 1200 },
  { name: '上海', 房价: 72000, 交易量: 1500 },
  { name: '广州', 房价: 38000, 交易量: 900 },
  { name: '深圳', 房价: 75000, 交易量: 1800 },
  { name: '杭州', 房价: 32000, 交易量: 800 },
];

const lineData = [
  { 月份: '1月', 均价: 35000 },
  { 月份: '2月', 均价: 35500 },
  { 月份: '3月', 均价: 36000 },
  { 月份: '4月', 均价: 36500 },
  { 月份: '5月', 均价: 37000 },
  { 月份: '6月', 均价: 37500 },
];

const pieData = [
  { name: '住宅', value: 65 },
  { name: '商业', value: 20 },
  { name: '写字楼', value: 15 },
];

const COLORS = ['#1890ff', '#52c41a', '#faad14'];

const DataDashboard: React.FC = () => {
  return (
    <div className="data-dashboard-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>数据看板</Title>
        <Paragraph>实时掌握房地产市场动态，数据驱动决策</Paragraph>
      </div>
      
      {/* 统计指标 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="平均房价"
              value={36500}
              prefix="¥"
              suffix="元/㎡"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={12} status="active" strokeColor="#1890ff" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="月度交易量"
              value={12500}
              suffix="套"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={8} status="active" strokeColor="#52c41a" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="同比增长"
              value={5.2}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
              prefix={<TrendingUpOutlined />}
            />
            <Progress percent={5.2} status="active" strokeColor="#faad14" style={{ marginTop: 16 }} />
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card>
            <Statistic
              title="市场活跃度"
              value={78}
              suffix="%"
              valueStyle={{ color: '#ff4d4f' }}
            />
            <Progress percent={78} status="active" strokeColor="#ff4d4f" style={{ marginTop: 16 }} />
          </Card>
        </Col>
      </Row>
      
      {/* 图表区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={<><BarChartOutlined /> 城市房价对比</>}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="房价" fill="#1890ff" name="房价(元/㎡)" />
                  <Bar yAxisId="right" dataKey="交易量" fill="#52c41a" name="交易量(套)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<><LineChartOutlined /> 房价走势</>}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="月份" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="均价" stroke="#1890ff" strokeWidth={2} name="均价(元/㎡)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <Card title={<><PieChartOutlined /> 物业类型分布</>}>
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, '占比']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="市场洞察">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
                  <h4>热门城市</h4>
                  <p>北京、上海、深圳、杭州、广州</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
                  <h4>投资热点</h4>
                  <p>长三角、珠三角、京津冀</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 8 }}>
                  <h4>政策动态</h4>
                  <p>首套房贷款利率下调0.25个百分点</p>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ backgroundColor: '#fff2f0', padding: 16, borderRadius: 8 }}>
                  <h4>风险提示</h4>
                  <p>部分城市房价上涨过快，需警惕泡沫风险</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataDashboard;