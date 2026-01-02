import React, { useState } from 'react';
import { Input, Button, Select, Form, Card, message } from 'antd';
import { request } from '../utils/request';

const { Option } = Select;
const { TextArea } = Input;

interface PropertyInfo {
  address: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  propertyType: string;
  features: string;
}

interface ValuationResult {
  estimatedValue: number;
  confidence: number;
  comparableProperties: Array<{
    address: string;
    price: number;
    area: number;
    distance: number;
  }>;
}

const PropertyValuation: React.FC = () => {
  const [form] = Form.useForm<PropertyInfo>();
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: PropertyInfo) => {
    try {
      setLoading(true);
      const res = await request.post<ValuationResult>('/api/valuation', values);
      setResult(res.data);
      message.success('估价成功');
    } catch (error) {
      message.error('估价失败，请重试');
      console.error('Valuation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-valuation-container">
      <h2 className="page-title">房产估价</h2>
      <div className="valuation-content">
        <Card title="房产基本信息" className="valuation-form-card">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              propertyType: 'residential',
              bedrooms: 2,
              bathrooms: 1,
              yearBuilt: 2000,
            }}
          >
            <Form.Item
              name="address"
              label="房产地址"
              rules={[{ required: true, message: '请输入房产地址' }]}
            >
              <Input placeholder="例如：北京市朝阳区建国路88号" />
            </Form.Item>

            <div className="form-row">
              <Form.Item
                name="area"
                label="建筑面积 (㎡)"
                rules={[{ required: true, message: '请输入建筑面积' }, { type: 'number', min: 1 }]}
              >
                <Input type="number" placeholder="请输入建筑面积" />
              </Form.Item>

              <Form.Item
                name="propertyType"
                label="房产类型"
                rules={[{ required: true, message: '请选择房产类型' }]}
              >
                <Select placeholder="请选择房产类型">
                  <Option value="residential">住宅</Option>
                  <Option value="commercial">商业</Option>
                  <Option value="industrial">工业</Option>
                  <Option value="land">土地</Option>
                </Select>
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                name="bedrooms"
                label="卧室数量"
                rules={[{ required: true, message: '请输入卧室数量' }, { type: 'number', min: 0 }]}
              >
                <Input type="number" placeholder="请输入卧室数量" />
              </Form.Item>

              <Form.Item
                name="bathrooms"
                label="卫生间数量"
                rules={[{ required: true, message: '请输入卫生间数量' }, { type: 'number', min: 0 }]}
              >
                <Input type="number" placeholder="请输入卫生间数量" />
              </Form.Item>

              <Form.Item
                name="yearBuilt"
                label="建成年份"
                rules={[{ required: true, message: '请输入建成年份' }, { type: 'number', min: 1900, max: new Date().getFullYear() }]}
              >
                <Input type="number" placeholder="请输入建成年份" />
              </Form.Item>
            </div>

            <Form.Item
              name="features"
              label="房产特色"
            >
              <TextArea rows={4} placeholder="请描述房产的特色，如装修情况、配套设施、交通便利度等" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} size="large" block>
                开始估价
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {result && (
          <Card title="估价结果" className="valuation-result-card">
            <div className="result-summary">
              <div className="estimated-value">
                <span className="label">预估价值：</span>
                <span className="value">¥{result.estimatedValue.toLocaleString()}</span>
              </div>
              <div className="confidence">
                <span className="label">置信度：</span>
                <span className="value">{result.confidence}%</span>
              </div>
            </div>

            <div className="comparable-properties">
              <h3>可比房源</h3>
              <div className="properties-list">
                {result.comparableProperties.map((prop, index) => (
                  <Card key={index} size="small" className="comparable-property-card">
                    <div className="property-info">
                      <div className="property-address">{prop.address}</div>
                      <div className="property-details">
                        <span>价格：¥{prop.price.toLocaleString()}</span>
                        <span>面积：{prop.area}㎡</span>
                        <span>距离：{prop.distance}m</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyValuation;
