import React, { useState } from 'react';
import { Card, Typography, Form, InputNumber, Button, Row, Col, Result, Select } from 'antd';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const ROICalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (values: any) => {
    const { purchasePrice, annualRent, holdingPeriod, expectedAppreciation, maintenanceCost, propertyTax, insuranceCost } = values;
    const totalInvestment = purchasePrice;
    const annualIncome = annualRent;
    const annualExpenses = maintenanceCost + propertyTax + insuranceCost;
    const annualNetIncome = annualIncome - annualExpenses;
    const expectedSalePrice = purchasePrice * (1 + expectedAppreciation / 100) ** holdingPeriod;
    const totalAppreciation = expectedSalePrice - purchasePrice;
    const totalNetIncome = annualNetIncome * holdingPeriod;
    const totalReturn = totalNetIncome + totalAppreciation;
    const roi = (totalReturn / totalInvestment) * 100;
    const annualRoi = roi / holdingPeriod;

    setResult({
      roi: parseFloat(roi.toFixed(2)),
      annualRoi: parseFloat(annualRoi.toFixed(2)),
      totalReturn: Math.round(totalReturn),
      expectedSalePrice: Math.round(expectedSalePrice),
      annualNetIncome: Math.round(annualNetIncome)
    });
  };

  return (
    <div className="roi-calculator-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>投资回报率计算器</Title>
        <Paragraph>评估房地产投资的收益率和回报情况</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="输入参数">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              initialValues={{
                purchasePrice: 1000000,
                annualRent: 50000,
                holdingPeriod: 5,
                expectedAppreciation: 5,
                maintenanceCost: 10000,
                propertyTax: 15000,
                insuranceCost: 5000,
              }}
            >
              <Form.Item
                name="purchasePrice"
                label="购买价格（元）"
                rules={[{ required: true, message: '请输入购买价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={10000}
                  step={10000}
                  placeholder="请输入购买价格"
                />
              </Form.Item>
              
              <Form.Item
                name="annualRent"
                label="年租金收入（元）"
                rules={[{ required: true, message: '请输入年租金收入' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1000}
                  step={1000}
                  placeholder="请输入年租金收入"
                />
              </Form.Item>
              
              <Form.Item
                name="holdingPeriod"
                label="持有年限（年）"
                rules={[{ required: true, message: '请输入持有年限' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={30}
                  step={1}
                  placeholder="请输入持有年限"
                />
              </Form.Item>
              
              <Form.Item
                name="expectedAppreciation"
                label="预期年增值率（%）"
                rules={[{ required: true, message: '请输入预期年增值率' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={20}
                  step={0.1}
                  placeholder="请输入预期年增值率"
                />
              </Form.Item>
              
              <Form.Item
                name="maintenanceCost"
                label="年维护成本（元）"
                rules={[{ required: true, message: '请输入年维护成本' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={1000}
                  placeholder="请输入年维护成本"
                />
              </Form.Item>
              
              <Form.Item
                name="propertyTax"
                label="年房产税（元）"
                rules={[{ required: true, message: '请输入年房产税' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={1000}
                  placeholder="请输入年房产税"
                />
              </Form.Item>
              
              <Form.Item
                name="insuranceCost"
                label="年保险费用（元）"
                rules={[{ required: true, message: '请输入年保险费用' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={500}
                  placeholder="请输入年保险费用"
                />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  计算回报率
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
                extra={[
                  <div key="roi" style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                    {result.roi}%
                    <span style={{ fontSize: 16, fontWeight: 'normal', color: '#999', marginLeft: 10 }}>
                      总投资回报率
                    </span>
                  </div>,
                  <Row gutter={[16, 16]} style={{ marginTop: 24, width: '100%' }}>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
                        <h4>年均投资回报率</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>{result.annualRoi}%</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
                        <h4>总回报金额</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{result.totalReturn.toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 8 }}>
                        <h4>预期出售价格</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{result.expectedSalePrice.toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#fff2f0', padding: 16, borderRadius: 8 }}>
                        <h4>年净收入</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{result.annualNetIncome.toLocaleString()}</p>
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

export default ROICalculator;