import React, { useState } from 'react';
import { Card, Typography, Form, InputNumber, Button, Row, Col, Result } from 'antd';

const { Title, Paragraph } = Typography;

const HousePriceCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = (values: any) => {
    const { area, unitPrice } = values;
    const totalPrice = area * unitPrice;
    setResult(totalPrice);
  };

  return (
    <div className="house-price-calculator-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>房价计算器</Title>
        <Paragraph>快速计算房产总价和相关费用</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="输入参数">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              initialValues={{
                area: 100,
                unitPrice: 30000,
              }}
            >
              <Form.Item
                name="area"
                label="建筑面积（㎡）"
                rules={[{ required: true, message: '请输入建筑面积' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={0.1}
                  placeholder="请输入建筑面积"
                />
              </Form.Item>
              
              <Form.Item
                name="unitPrice"
                label="单价（元/㎡）"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  step={100}
                  placeholder="请输入单价"
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  计算总价
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="计算结果">
            {result !== null ? (
              <Result
                status="success"
                title="计算完成"
                subTitle="房产总价"
                extra={[
                  <div key="total-price" style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{result.toLocaleString()}
                  </div>,
                  <Row gutter={[16, 16]} style={{ marginTop: 24, width: '100%' }}>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
                        <h4>契税（1.5%）</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{(result * 0.015).toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
                        <h4>维修基金（100元/㎡）</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{(form.getFieldValue('area') * 100).toLocaleString()}</p>
                      </div>
                    </Col>
                  </Row>
                ]}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                请输入参数并点击计算按钮
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HousePriceCalculator;