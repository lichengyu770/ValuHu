import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Statistic, message } from 'antd';
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, ApartmentOutlined, DollarCircleOutlined, AreaChartOutlined } from '@ant-design/icons';
import { useDataService } from '../services/data/DataService';
import { Area, Bar, Line, Pie } from '@ant-design/plots';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DataAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>({
    districtDistribution: [],
    priceTrend: [],
    houseTypeDistribution: [],
    areaDistribution: [],
    decorationDistribution: []
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [summaryData, setSummaryData] = useState({
    totalProjects: 0,
    averagePrice: 0,
    totalArea: 0,
    totalRecords: 0
  });

  // 使用数据服务
  const dataService = useDataService();

  // 获取分析数据
  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const result = await dataService.getAnalysisData({
        district: selectedDistrict === 'all' ? '' : selectedDistrict,
        startDate: dateRange ? dateRange[0] : undefined,
        endDate: dateRange ? dateRange[1] : undefined
      });
      
      setAnalysisData(result.charts);
      setSummaryData(result.summary);
      message.success('数据分析完成');
    } catch (error) {
      message.error('获取分析数据失败');
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchAnalysisData();
  }, [selectedDistrict, dateRange]);

  // 配置图表
  const pieConfig = {
    data: [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      content: '{name}\n{percentage}',
      style: {
        fontSize: 12,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const barConfig = {
    data: [],
    xField: 'type',
    yField: 'value',
    colorField: 'type',
    label: {
      position: 'top',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const lineConfig = {
    data: [],
    xField: 'date',
    yField: 'price',
    point: {
      size: 5,
      shape: 'diamond',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const areaConfig = {
    data: [],
    xField: 'areaRange',
    yField: 'count',
    smooth: true,
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return (
    <div className="content-card">
      <h2 className="section-title">数据分析</h2>
      
      {/* 筛选条件 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Select
          placeholder="选择区域"
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          style={{ width: 200 }}
        >
          <Option value="all">全部区域</Option>
          <Option value="九华-管委会">九华-管委会</Option>
          <Option value="岳塘区">岳塘区</Option>
          <Option value="昭山示范区">昭山示范区</Option>
          <Option value="湘潭县">湘潭县</Option>
          <Option value="雨湖区">雨湖区</Option>
        </Select>
        
        <RangePicker
          placeholder={['开始日期', '结束日期']}
          onChange={(dates) => setDateRange(dates as [Date, Date] | null)}
        />
      </div>

      {/* 数据概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card className="content-card" loading={loading}>
            <Statistic
              title="总项目数"
              value={summaryData.totalProjects}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#ffa046' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="content-card" loading={loading}>
            <Statistic
              title="平均单价"
              value={summaryData.averagePrice}
              prefix={<DollarCircleOutlined />}
              suffix="元/㎡"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="content-card" loading={loading}>
            <Statistic
              title="总面积"
              value={summaryData.totalArea}
              suffix="㎡"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="content-card" loading={loading}>
            <Statistic
              title="总记录数"
              value={summaryData.totalRecords}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        {/* 区域分布 - 饼图 */}
        <Col xs={24} lg={12}>
          <Card 
            title="区域分布" 
            className="content-card"
            loading={loading}
            icon={<PieChartOutlined />}
          >
            <Pie {...pieConfig} data={analysisData.districtDistribution} />
          </Card>
        </Col>
        
        {/* 户型分布 - 柱状图 */}
        <Col xs={24} lg={12}>
          <Card 
            title="户型分布" 
            className="content-card"
            loading={loading}
            icon={<BarChartOutlined />}
          >
            <Bar {...barConfig} data={analysisData.houseTypeDistribution} />
          </Card>
        </Col>
        
        {/* 价格趋势 - 折线图 */}
        <Col xs={24}>
          <Card 
            title="价格趋势" 
            className="content-card"
            loading={loading}
            icon={<LineChartOutlined />}
          >
            <Line {...lineConfig} data={analysisData.priceTrend} />
          </Card>
        </Col>
        
        {/* 面积分布 - 面积图 */}
        <Col xs={24} lg={12}>
          <Card 
            title="面积分布" 
            className="content-card"
            loading={loading}
            icon={<AreaChartOutlined />}
          >
            <Area {...areaConfig} data={analysisData.areaDistribution} />
          </Card>
        </Col>
        
        {/* 装修情况分布 - 饼图 */}
        <Col xs={24} lg={12}>
          <Card 
            title="装修情况分布" 
            className="content-card"
            loading={loading}
            icon={<PieChartOutlined />}
          >
            <Pie {...pieConfig} data={analysisData.decorationDistribution} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataAnalysis;
