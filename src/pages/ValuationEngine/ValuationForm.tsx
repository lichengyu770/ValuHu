import React, { useState, useMemo } from 'react';
import { Form, InputNumber, Select, Button, Row, Col, Divider, Card, Statistic, message, Collapse } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import {
  buildingTypes,
  decorationLevels,
  orientations,
  locations
} from '../../models/valuationModels';
import { ValuationParams } from '../../types/valuation';
import smartSuggestionService from '../../services/SmartSuggestionService';
import MapComponent from '../../components/Map/MapComponent';

interface ValuationFormProps {
  params: ValuationParams;
  onChange: (params: Partial<ValuationParams>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentSection: 'basic' | 'detailed' | 'market';
}

/**
 * 估价参数输入表单组件
 * 负责房产估价参数的分步输入
 */
const ValuationForm: React.FC<ValuationFormProps> = ({
  params,
  onChange,
  onNext,
  onPrevious,
  currentSection
}) => {
  // 状态管理
  const [form] = Form.useForm();
  const [activeMapKey, setActiveMapKey] = useState<string | string[]>([]);

  // 处理表单字段变化
  const handleFieldChange = (field: keyof ValuationParams, value: any) => {
    onChange({ [field]: value });
  };

  // 处理地图位置选择
  const handleLocationSelect = (location: { name: string; lat: number; lng: number }) => {
    onChange({ location: location.name });
    message.success(`已选择位置: ${location.name}`);
  };

  // 渲染基本信息部分
  const renderBasicSection = () => (
    <>
      <h3>基本信息</h3>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="建筑类型"
            name="buildingType"
            initialValue={params.propertyType}
            rules={[
              { required: true, message: '请选择建筑类型' }
            ]}
          >
            <Select
              placeholder="请选择建筑类型"
              onChange={(value) => handleFieldChange('propertyType', value)}
              style={{ width: '100%' }}
            >
              {buildingTypes.map((type) => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="地理位置"
            name="location"
            initialValue={params.location}
            rules={[
              { required: true, message: '请选择地理位置' }
            ]}
          >
            <Select
              placeholder="请选择地理位置"
              onChange={(value) => handleFieldChange('location', value)}
              style={{ width: '100%' }}
            >
              {locations.map((location) => (
                <Select.Option key={location.value} value={location.value}>
                  {location.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="建筑面积(㎡)"
            name="area"
            initialValue={params.area}
            rules={[
              { required: true, message: '请输入建筑面积' },
              { type: 'number', min: 1, message: '建筑面积不能小于1㎡' },
              { type: 'number', max: 10000, message: '建筑面积不能大于10000㎡' }
            ]}
          >
            <InputNumber
              min={1}
              max={10000}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入建筑面积"
              onChange={(value) => handleFieldChange('area', value)}
              formatter={(value) => `${value} ㎡`}
              parser={(value) => value?.replace(/\s?㎡/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="建成年份"
            name="yearBuilt"
            initialValue={params.yearBuilt}
            rules={[
              { required: true, message: '请输入建成年份' },
              { type: 'number', min: 1900, message: '建成年份不能早于1900年' },
              { type: 'number', max: new Date().getFullYear(), message: '建成年份不能晚于今年' }
            ]}
          >
            <InputNumber
              min={1900}
              max={new Date().getFullYear()}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入建成年份"
              onChange={(value) => handleFieldChange('yearBuilt', value)}
            />
          </Form.Item>
        </Col>
      </Row>
      
      {/* 地图选择折叠面板 */}
      <Collapse
        activeKey={activeMapKey}
        onChange={(key) => setActiveMapKey(key)}
        bordered={false}
        ghost
        items={[
          {
            key: 'map',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                <span>通过地图选择位置</span>
              </div>
            ),
            children: (
              <div style={{ marginTop: '16px' }}>
                <MapComponent 
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            ),
          },
        ]}
      />
    </>
  );

  // 渲染详细信息部分
  const renderDetailedSection = () => (
    <>
      <h3>详细信息</h3>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="卧室数量"
            name="bedrooms"
            initialValue={params.bedrooms}
            rules={[
              { type: 'number', min: 0, message: '卧室数量不能小于0' },
              { type: 'number', max: 20, message: '卧室数量不能大于20' }
            ]}
          >
            <InputNumber
              min={0}
              max={20}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入卧室数量"
              onChange={(value) => handleFieldChange('bedrooms', value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="浴室数量"
            name="bathrooms"
            initialValue={params.bathrooms}
            rules={[
              { type: 'number', min: 0, message: '浴室数量不能小于0' },
              { type: 'number', max: 20, message: '浴室数量不能大于20' }
            ]}
          >
            <InputNumber
              min={0}
              max={20}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入浴室数量"
              onChange={(value) => handleFieldChange('bathrooms', value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="所在楼层"
            name="floorLevel"
            initialValue={params.floorLevel}
            rules={[
              { type: 'number', min: 0, message: '所在楼层不能小于0' },
              { type: 'number', max: 100, message: '所在楼层不能大于100' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('totalFloors') || value <= getFieldValue('totalFloors')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('所在楼层不能大于总楼层'));
                },
              }),
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入所在楼层"
              onChange={(value) => handleFieldChange('floorLevel', value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="总楼层"
            name="totalFloors"
            initialValue={params.totalFloors}
            rules={[
              { type: 'number', min: 1, message: '总楼层不能小于1' },
              { type: 'number', max: 100, message: '总楼层不能大于100' }
            ]}
          >
            <InputNumber
              min={1}
              max={100}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入总楼层"
              onChange={(value) => handleFieldChange('totalFloors', value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="装修等级"
            name="decorationLevel"
            initialValue={params.decorationLevel}
          >
            <Select
              placeholder="请选择装修等级"
              onChange={(value) => handleFieldChange('decorationLevel', value)}
              style={{ width: '100%' }}
            >
              {decorationLevels.map((level) => (
                <Select.Option key={level.value} value={level.value}>
                  {level.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="朝向"
            name="orientation"
            initialValue={params.orientation}
          >
            <Select
              placeholder="请选择朝向"
              onChange={(value) => handleFieldChange('orientation', value)}
              style={{ width: '100%' }}
            >
              {orientations.map((orientation) => (
                <Select.Option key={orientation.value} value={orientation.value}>
                  {orientation.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // 获取市场趋势数据
  const marketTrend = useMemo(() => {
    return smartSuggestionService.getMarketTrend(params.location, params.propertyType);
  }, [params.location, params.propertyType]);

  // 自动填充市场数据
  const handleAutoFillMarketData = () => {
    if (!params.location || !params.propertyType) {
      message.warning('请先选择地理位置和建筑类型');
      return;
    }
    
    onChange({
      marketTrends: {
        averagePrice: marketTrend.averagePrice,
        priceChange: marketTrend.priceChange,
        transactionVolume: marketTrend.transactionVolume
      }
    });
    message.success('市场数据已自动填充');
  };

  // 渲染市场信息部分
  const renderMarketSection = () => (
    <>
      <h3>市场信息</h3>
      
      {/* 市场趋势卡片 */}
      <Card 
        title="当前市场趋势" 
        bordered={false}
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={handleAutoFillMarketData}
            type="link"
          >
            自动填充
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Statistic
              title="区域均价"
              value={marketTrend.averagePrice}
              precision={0}
              suffix="元/㎡"
              valueStyle={{ color: '#3f8600', fontSize: '18px' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="价格变动"
              value={marketTrend.priceChange}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: marketTrend.priceChange >= 0 ? '#cf1322' : '#52c41a',
                fontSize: '18px' 
              }}
              prefix={marketTrend.priceChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="交易量"
              value={marketTrend.transactionVolume}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Col>
        </Row>
        <div style={{ 
          fontSize: '12px', 
          color: '#8c8c8c', 
          marginTop: '8px',
          textAlign: 'right'
        }}>
          数据来源: {marketTrend.region} {marketTrend.propertyType}市场 (模拟数据)
        </div>
      </Card>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item
            label="区域均价(元/㎡)"
            name="averagePrice"
            initialValue={params.marketTrends?.averagePrice}
            rules={[
              { type: 'number', min: 0, message: '区域均价不能小于0' }
            ]}
          >
            <InputNumber
              min={0}
              step={100}
              style={{ width: '100%' }}
              placeholder="请输入区域均价"
              onChange={(value) => onChange({
                marketTrends: {
                  ...params.marketTrends,
                  averagePrice: value || 0
                }
              })}
              formatter={(value) => `¥${value?.toLocaleString()}`}
              parser={(value) => value?.replace(/¥|,/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="价格变动(%)"
            name="priceChange"
            initialValue={params.marketTrends?.priceChange}
            rules={[
              { type: 'number', min: -100, message: '价格变动不能小于-100%' },
              { type: 'number', max: 100, message: '价格变动不能大于100%' }
            ]}
          >
            <InputNumber
              min={-100}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="请输入价格变动"
              onChange={(value) => onChange({
                marketTrends: {
                  ...params.marketTrends,
                  priceChange: value || 0
                }
              })}
              formatter={(value) => `${value}%`}
              parser={(value) => value?.replace(/%/g, '')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="交易量"
            name="transactionVolume"
            initialValue={params.marketTrends?.transactionVolume}
            rules={[
              { type: 'number', min: 0, message: '交易量不能小于0' }
            ]}
          >
            <InputNumber
              min={0}
              step={1}
              style={{ width: '100%' }}
              placeholder="请输入交易量"
              onChange={(value) => onChange({
                marketTrends: {
                  ...params.marketTrends,
                  transactionVolume: value || 0
                }
              })}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // 渲染当前部分
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'basic':
        return renderBasicSection();
      case 'detailed':
        return renderDetailedSection();
      case 'market':
        return renderMarketSection();
      default:
        return renderBasicSection();
    }
  };

  return (
    <Form form={form} layout="vertical">
      {renderCurrentSection()}
      
      <Divider />
      
      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>
        {onPrevious && (
          <Button onClick={onPrevious}>
            上一步
          </Button>
        )}
        {onNext && (
          <Button 
            type="primary" 
            onClick={async () => {
              // 表单验证
              try {
                await form.validateFields();
                onNext();
              } catch (error) {
                message.error('表单验证失败，请检查输入');
              }
            }}
          >
            {currentSection === 'market' ? '开始估价' : '下一步'}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default ValuationForm;