import React from 'react';
import { Card, Row, Col, Progress, Typography, Table, Tag } from 'antd';
import {
  evaluationConfig,
  ratingConfig,
} from '../models/matrixEvaluationModels.js';

const { Title, Text, Paragraph } = Typography;

/**
 * 矩阵评估结果展示组件
 */
const ValuationMatrix = ({ evaluationResult }) => {
  // 如果没有评估结果，显示提示信息
  if (!evaluationResult) {
    return (
      <Card title='矩阵评估' bordered={false}>
        <Text type='secondary'>暂无评估数据，请先执行评估</Text>
      </Card>
    );
  }

  const { totalScore, rating, confidence, dimensionScores, factorScores } =
    evaluationResult;

  // 获取评估等级对应的颜色
  const getRatingColor = (ratingName) => {
    const ratingItem = ratingConfig.find((item) => item.rating === ratingName);
    return ratingItem ? ratingItem.color : '#1890ff';
  };

  // 构建维度数据表格
  const dimensionColumns = [
    {
      title: '评估维度',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => `${(weight * 100).toFixed(0)}%`,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => <Text type='success'>{score}</Text>,
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'progress',
      render: (score) => (
        <Progress
          percent={score * 20}
          size='small'
          strokeColor={getRatingColor(rating)}
        />
      ),
    },
  ];

  // 准备维度数据
  const dimensionData = Object.keys(evaluationConfig).map((key) => ({
    key,
    name: evaluationConfig[key].name,
    weight: evaluationConfig[key].weight,
    score: dimensionScores[key],
  }));

  // 构建因子数据表格
  const factorColumns = [
    {
      title: '评估因子',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: '所属维度',
      dataIndex: 'dimensionName',
      key: 'dimensionName',
      render: (text) => <Tag color='blue'>{text}</Tag>,
    },
    {
      title: '权重',
      dataIndex: 'weight',
      key: 'weight',
      render: (weight) => `${weight}%`,
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score) => (
        <Text
          style={{
            color: score >= 4 ? '#52c41a' : score >= 3 ? '#1890ff' : '#faad14',
          }}
        >
          {score}
        </Text>
      ),
    },
  ];

  // 准备因子数据
  const factorData = [];
  Object.keys(evaluationConfig).forEach((dimensionKey) => {
    const dimension = evaluationConfig[dimensionKey];
    dimension.factors.forEach((factor) => {
      factorData.push({
        key: `${dimensionKey}-${factor.id}`,
        name: factor.name,
        dimensionName: dimension.name,
        weight: (factor.weight * 100).toFixed(0),
        score: factorScores[dimensionKey][factor.id],
      });
    });
  });

  return (
    <div className='valuation-matrix'>
      <Title level={4}>矩阵评估结果</Title>

      {/* 综合评分概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <Text type='secondary'>综合得分</Text>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '8px 0',
                  color: getRatingColor(rating),
                }}
              >
                {totalScore}
              </div>
              <Tag
                color={getRatingColor(rating)}
                style={{ fontSize: '16px', padding: '4px 12px' }}
              >
                {rating}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <Text type='secondary'>评估置信度</Text>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '8px 0',
                  color: '#52c41a',
                }}
              >
                {confidence}%
              </div>
              <Progress
                percent={confidence}
                size='small'
                strokeColor='#52c41a'
              />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <Text type='secondary'>评估维度</Text>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  margin: '8px 0',
                  color: '#1890ff',
                }}
              >
                {Object.keys(dimensionScores).length}
              </div>
              <Text type='secondary'>个评估维度</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 维度评分 */}
      <Card title='维度评分' bordered={false} style={{ marginBottom: 24 }}>
        <Table
          columns={dimensionColumns}
          dataSource={dimensionData}
          pagination={false}
          rowKey='key'
          size='middle'
        />
      </Card>

      {/* 因子评分 */}
      <Card title='因子评分' bordered={false}>
        <Table
          columns={factorColumns}
          dataSource={factorData}
          pagination={{ pageSize: 10 }}
          rowKey='key'
          size='middle'
        />
      </Card>
    </div>
  );
};

export default ValuationMatrix;
