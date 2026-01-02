import React, { useState, useEffect } from 'react';
import { Card, Table, Tabs, Row, Col, Statistic, Button, Space, Select, Checkbox, DatePicker, Tag, Typography, Divider } from 'antd';
import { LineChartOutlined, PieChartOutlined, HistoryOutlined, CompareOutlined, DownloadOutlined, RefreshOutlined } from '@ant-design/icons';
import { historyDataService, HistoryRecord, HistoryComparisonResult } from '../services/HistoryDataService';
import { Line, Bar, Pie, Area } from '@ant-design/plots';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

/**
 * 历史数据分析器组件
 * 提供历史估价记录的比较、分析和可视化功能
 */
const HistoryAnalyzer: React.FC = () => {
  // 状态管理
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<HistoryComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [filterOptions, setFilterOptions] = useState({
    city: '',
    buildingType: '',
    dateRange: null,
    algorithm: ''
  });

  // 图表配置
  const chartConfig = {
    lineChart: {
      xField: 'date',
      yField: 'price',
      seriesField: 'algorithm',
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 500,
        },
      },
      xAxis: {
        type: 'time',
        tickCount: 5,
      },
      yAxis: {
        label: {
          formatter: (v: any) => `${(v / 10000).toFixed(0)}万`,
        },
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: datum.date,
            value: `${(datum.price / 10000).toFixed(2)}万元`,
          };
        },
      },
    },
    barChart: {
      xField: 'date',
      yField: 'price',
      seriesField: 'algorithm',
      animation: {
        appear: {
          animation: 'path-in',
          duration: 500,
        },
      },
      xAxis: {
        type: 'time',
        tickCount: 5,
      },
      yAxis: {
        label: {
          formatter: (v: any) => `${(v / 10000).toFixed(0)}万`,
        },
      },
      tooltip: {
        formatter: (datum: any) => {
          return {
            name: datum.date,
            value: `${(datum.price / 10000).toFixed(2)}万元`,
          };
        },
      },
    },
    pieChart: {
      angleField: 'count',
      colorField: 'algorithm',
      radius: 0.8,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 500,
        },
      },
      interactions: [
        {
          type: 'element-active',
        },
      ],
      label: {
        type: 'outer',
        content: '{name}: {percentage:.1%}',
      },
    },
  };

  // 加载历史记录
  const loadRecords = () => {
    setLoading(true);
    try {
      const allRecords = historyDataService.getAllRecords();
      setRecords(allRecords);
      setSelectedRecords([]);
      setComparisonResult(null);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载记录
  useEffect(() => {
    loadRecords();
  }, []);

  // 选择记录进行比较
  const handleRecordSelect = (recordId: string) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  // 比较选中的记录
  const handleCompareRecords = () => {
    if (selectedRecords.length < 2) {
      alert('请至少选择2条记录进行比较');
      return;
    }

    const result = historyDataService.compareRecords(selectedRecords);
    setComparisonResult(result);
    setActiveTab('comparison');
  };

  // 生成图表数据
  const generateChartData = () => {
    if (!records.length) return [];

    return records.flatMap(record => 
      record.results.map(result => ({
        id: result.id,
        date: record.createdAt.toISOString().split('T')[0],
        price: result.price,
        unitPrice: result.unitPrice,
        algorithm: result.algorithm,
        confidence: result.confidence,
        property: record.property.city + '-' + record.property.district,
      }))
    );
  };

  // 生成算法分布数据
  const generateAlgorithmDistribution = () => {
    const algorithmCount: Record<string, number> = {};

    records.forEach(record => {
      record.results.forEach(result => {
        algorithmCount[result.algorithm] = (algorithmCount[result.algorithm] || 0) + 1;
      });
    });

    return Object.entries(algorithmCount).map(([algorithm, count]) => ({
      algorithm,
      count,
    }));
  };

  // 生成月度趋势数据
  const generateMonthlyTrend = () => {
    const monthlyData: Record<string, { count: number; totalPrice: number }> = {};

    records.forEach(record => {
      const monthKey = record.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyData[monthKey] || { count: 0, totalPrice: 0 };
      monthlyData[monthKey] = {
        count: current.count + 1,
        totalPrice: current.totalPrice + record.averagePrice,
      };
    });

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        count: data.count,
        averagePrice: Math.round(data.totalPrice / data.count),
      }));
  };

  // 表格列配置
  const columns = [
    {
      title: '选择',
      dataIndex: 'id',
      key: 'select',
      render: (id: string) => (
        <Checkbox
          checked={selectedRecords.includes(id)}
          onChange={() => handleRecordSelect(id)}
        />
      ),
    },
    {
      title: '房产信息',
      dataIndex: 'property',
      key: 'property',
      render: (property: any) => (
        <div>
          <div>{property.city} {property.district}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            {property.community || '未提供'} · {property.area}㎡ · {property.buildingType}
          </div>
        </div>
      ),
    },
    {
      title: '平均估价',
      dataIndex: 'averagePrice',
      key: 'averagePrice',
      render: (price: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ¥{price.toLocaleString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '平均单价',
      dataIndex: 'averageUnitPrice',
      key: 'averageUnitPrice',
      render: (price: number) => (
        <Text style={{ color: '#52c41a' }}>
          ¥{price.toLocaleString('zh-CN')}/㎡
        </Text>
      ),
    },
    {
      title: '估价方法',
      dataIndex: 'results',
      key: 'algorithms',
      render: (results: any[]) => (
        <Space>
          {results.map((result: any) => (
            <Tag key={result.algorithm} color="blue">
              {result.algorithm}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space>
          {tags.map((tag) => (
            <Tag key={tag} color="green">
              {tag}
            </Tag>
          ))}
        </Space>
      ),
    },
  ];

  return (
    <div className="history-analyzer" style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '20px' }}>
        <HistoryOutlined style={{ marginRight: '10px' }} />
        历史数据比较与分析
      </Title>

      {/* 工具栏 */}
      <Card style={{ marginBottom: '20px' }} size="small">
        <Space direction="horizontal" size="middle" wrap>
          <Button 
            type="primary" 
            icon={<RefreshOutlined />} 
            onClick={loadRecords}
            loading={loading}
          >
            刷新数据
          </Button>
          
          <Button 
            type="default" 
            icon={<CompareOutlined />} 
            onClick={handleCompareRecords}
            disabled={selectedRecords.length < 2}
          >
            比较选中记录 ({selectedRecords.length})
          </Button>
          
          <Button 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={() => {
              const csv = historyDataService.exportRecords('csv', records) as string;
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `valuation-history-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            导出数据
          </Button>
        </Space>

        <Divider style={{ margin: '10px 0' }} />

        {/* 筛选条件 */}
        <Space direction="horizontal" size="middle" wrap>
          <Select
            placeholder="选择城市"
            style={{ width: 150 }}
            value={filterOptions.city}
            onChange={(value) => setFilterOptions({ ...filterOptions, city: value })}
          >
            {Array.from(new Set(records.map(r => r.property.city))).map(city => (
              <Select.Option key={city} value={city}>{city}</Select.Option>
            ))}
          </Select>

          <Select
            placeholder="选择建筑类型"
            style={{ width: 150 }}
            value={filterOptions.buildingType}
            onChange={(value) => setFilterOptions({ ...filterOptions, buildingType: value })}
          >
            {Array.from(new Set(records.map(r => r.property.buildingType))).map(type => (
              <Select.Option key={type} value={type}>{type}</Select.Option>
            ))}
          </Select>

          <RangePicker
            placeholder={['开始日期', '结束日期']}
            value={filterOptions.dateRange}
            onChange={(dateRange) => setFilterOptions({ ...filterOptions, dateRange })}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      {/* 主要内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 记录列表 */}
        <TabPane tab={<span><HistoryOutlined /> 历史记录</span>} key="list">
          <Card>
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
          </Card>
        </TabPane>

        {/* 趋势分析 */}
        <TabPane tab={<span><LineChartOutlined /> 趋势分析</span>} key="trends">
          <Row gutter={16}>
            {/* 总价趋势 */}
            <Col span={24}>
              <Card title="总价趋势">
                <Line
                  {...chartConfig.lineChart}
                  data={generateChartData()}
                />
              </Card>
            </Col>

            {/* 单价趋势 */}
            <Col span={24}>
              <Card title="单价趋势">
                <Area
                  {...chartConfig.lineChart}
                  yField="unitPrice"
                  data={generateChartData()}
                />
              </Card>
            </Col>

            {/* 月度趋势 */}
            <Col span={24}>
              <Card title="月度估价数量与平均价格">
                <Bar
                  xField="month"
                  yField="averagePrice"
                  data={generateMonthlyTrend()}
                  animation={{
                    appear: {
                      animation: 'path-in',
                      duration: 500,
                    },
                  }}
                  yAxis={{
                    label: {
                      formatter: (v: any) => `${(v / 10000).toFixed(0)}万`,
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 统计分析 */}
        <TabPane tab={<span><PieChartOutlined /> 统计分析</span>} key="statistics">
          <Row gutter={16}>
            {/* 算法分布 */}
            <Col span={12}>
              <Card title="估价方法分布">
                <Pie
                  {...chartConfig.pieChart}
                  data={generateAlgorithmDistribution()}
                />
              </Card>
            </Col>

            {/* 统计指标 */}
            <Col span={12}>
              <Card title="统计指标">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="总记录数" value={records.length} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="总估价次数" value={records.reduce((sum, r) => sum + r.results.length, 0)} />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="平均估价" 
                      value={Math.round(records.reduce((sum, r) => sum + r.averagePrice, 0) / records.length)} 
                      prefix="¥"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="平均单价" 
                      value={Math.round(records.reduce((sum, r) => sum + r.averageUnitPrice, 0) / records.length)} 
                      prefix="¥"
                      suffix="/㎡"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* 记录比较 */}
        <TabPane tab={<span><CompareOutlined /> 记录比较</span>} key="comparison">
          {comparisonResult ? (
            <>
              {/* 比较结果概览 */}
              <Card title="比较结果概览">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="价格变化" 
                      value={comparisonResult.comparison.priceChange} 
                      prefix="¥"
                      valueStyle={{ color: comparisonResult.comparison.priceChange >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="单价变化" 
                      value={comparisonResult.comparison.unitPriceChange} 
                      prefix="¥"
                      suffix="/㎡"
                      valueStyle={{ color: comparisonResult.comparison.unitPriceChange >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="价格变化率" 
                      value={comparisonResult.comparison.priceChangePercentage} 
                      suffix="%"
                      valueStyle={{ color: comparisonResult.comparison.priceChangePercentage >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="比较周期" 
                      value={comparisonResult.comparison.period.days} 
                      suffix="天"
                    />
                  </Col>
                </Row>
              </Card>

              {/* 价格趋势图 */}
              <Card title="价格趋势对比" style={{ marginTop: '16px' }}>
                <Line
                  {...chartConfig.lineChart}
                  data={comparisonResult.comparison.averagePriceTrend.map(item => ({
                    date: item.date.toISOString().split('T')[0],
                    price: item.price,
                    unitPrice: item.unitPrice,
                    algorithm: '平均价格',
                  }))}
                />
              </Card>

              {/* 详细比较表 */}
              <Card title="详细比较" style={{ marginTop: '16px' }}>
                <Table
                  columns={[
                    {
                      title: '记录ID',
                      dataIndex: 'id',
                      key: 'id',
                    },
                    {
                      title: '房产信息',
                      dataIndex: 'property',
                      key: 'property',
                      render: (property: any) => `${property.city}-${property.district} ${property.area}㎡`,
                    },
                    {
                      title: '平均总价',
                      dataIndex: 'averagePrice',
                      key: 'averagePrice',
                      render: (price: number) => `¥${price.toLocaleString('zh-CN')}`,
                    },
                    {
                      title: '平均单价',
                      dataIndex: 'averageUnitPrice',
                      key: 'averageUnitPrice',
                      render: (price: number) => `¥${price.toLocaleString('zh-CN')}/㎡`,
                    },
                    {
                      title: '创建时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date: Date) => new Date(date).toLocaleString('zh-CN'),
                    },
                  ]}
                  dataSource={comparisonResult.records}
                  rowKey="id"
                  pagination={false}
                />
              </Card>
            </>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">请选择2条或以上记录进行比较</Text>
              </div>
            </Card>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HistoryAnalyzer;