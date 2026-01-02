import React, { useState } from 'react';
import { Card, Typography, Form, InputNumber, Button, Row, Col, Result, Select } from 'antd';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const LoanCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState<any>(null);

  const handleCalculate = (values: any) => {
    const { loanAmount, loanTerm, interestRate, loanType } = values;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTerm * 12;
    let monthlyPayment = 0;
    let totalInterest = 0;

    if (loanType === 'equal-principal-interest') {
      // 等额本息还款
      monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      totalInterest = monthlyPayment * totalMonths - loanAmount;
    } else {
      // 等额本金还款
      const principalPerMonth = loanAmount / totalMonths;
      const remainingPrincipal = loanAmount;
      const firstMonthPayment = principalPerMonth + remainingPrincipal * monthlyRate;
      const lastMonthPayment = principalPerMonth + principalPerMonth * monthlyRate;
      totalInterest = loanAmount * monthlyRate * (totalMonths + 1) / 2;
      monthlyPayment = (firstMonthPayment + lastMonthPayment) / 2; // 平均月供
    }

    setResult({
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(loanAmount + totalInterest),
      firstMonthPayment: loanType === 'equal-principal' ? Math.round(loanAmount / totalMonths + loanAmount * monthlyRate) : Math.round(monthlyPayment),
      loanType
    });
  };

  return (
    <div className="loan-calculator-page">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={1}>贷款计算器</Title>
        <Paragraph>精确计算房贷月供和总利息</Paragraph>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="输入参数">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              initialValues={{
                loanAmount: 1000000,
                loanTerm: 30,
                interestRate: 4.9,
                loanType: 'equal-principal-interest',
              }}
            >
              <Form.Item
                name="loanAmount"
                label="贷款金额（元）"
                rules={[{ required: true, message: '请输入贷款金额' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={10000}
                  step={10000}
                  placeholder="请输入贷款金额"
                />
              </Form.Item>
              
              <Form.Item
                name="loanTerm"
                label="贷款期限（年）"
                rules={[{ required: true, message: '请输入贷款期限' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  max={30}
                  step={1}
                  placeholder="请输入贷款期限"
                />
              </Form.Item>
              
              <Form.Item
                name="interestRate"
                label="年利率（%）"
                rules={[{ required: true, message: '请输入年利率' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.1}
                  max={20}
                  step={0.01}
                  placeholder="请输入年利率"
                />
              </Form.Item>
              
              <Form.Item
                name="loanType"
                label="还款方式"
                rules={[{ required: true, message: '请选择还款方式' }]}
              >
                <Select placeholder="请选择还款方式">
                  <Option value="equal-principal-interest">等额本息</Option>
                  <Option value="equal-principal">等额本金</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  计算月供
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
                  <div key="monthly-payment" style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                    ¥{result.monthlyPayment.toLocaleString()}
                    <span style={{ fontSize: 16, fontWeight: 'normal', color: '#999', marginLeft: 10 }}>
                      {result.loanType === 'equal-principal-interest' ? '(等额本息)' : '(等额本金，平均月供)'}
                    </span>
                  </div>,
                  <Row gutter={[16, 16]} style={{ marginTop: 24, width: '100%' }}>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f0f5ff', padding: 16, borderRadius: 8 }}>
                        <h4>总还款额</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{(form.getFieldValue('loanAmount') + result.totalInterest).toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 8 }}>
                        <h4>总利息</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{result.totalInterest.toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#fffbe6', padding: 16, borderRadius: 8 }}>
                        <h4>首月月供</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>¥{result.firstMonthPayment.toLocaleString()}</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div style={{ backgroundColor: '#fff2f0', padding: 16, borderRadius: 8 }}>
                        <h4>利息占比</h4>
                        <p style={{ fontSize: 20, fontWeight: 'bold' }}>{Math.round((result.totalInterest / (form.getFieldValue('loanAmount') + result.totalInterest)) * 100)}%</p>
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

export default LoanCalculator;