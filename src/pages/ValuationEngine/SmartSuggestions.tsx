import React, { useState } from 'react';
import { Card, Button, Collapse, Tag, Statistic, Row, Col, Tooltip } from 'antd';
import { InfoCircleOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { SmartSuggestion } from '../../types/valuation';

interface SmartSuggestionsProps {
  suggestions: SmartSuggestion[];
  onApply: (suggestion: SmartSuggestion) => void;
}

/**
 * 智能建议组件
 * 负责展示智能建议和市场趋势数据
 */
const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ 
  suggestions, 
  onApply 
}) => {
  // 状态管理
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  if (suggestions.length === 0) {
    return (
      <Card 
        title="智能建议" 
        bordered={false}
        className="smart-suggestions-card"
      >
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px', 
          color: '#8c8c8c',
          backgroundColor: '#fafafa',
          borderRadius: '8px'
        }}>
          <InfoCircleOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#d9d9d9' }} />
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无智能建议</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>请填写更多房产信息，获取个性化智能建议</div>
        </div>
      </Card>
    );
  }

  // 处理折叠面板的展开/折叠
  const handleCollapseChange = (key: string | string[]) => {
    setActiveKey(key);
  };

  // 渲染市场趋势数据
  const renderMarketTrend = (suggestion: SmartSuggestion) => {
    if (!suggestion.marketTrend) return null;

    const { marketTrend } = suggestion;
    
    return (
      <div style={{ 
        backgroundColor: '#f0f2f5', 
        padding: '16px', 
        borderRadius: '6px',
        marginTop: '12px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#262626' }}>
          市场趋势数据
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8}>
            <Statistic
              title="平均价格"
              value={marketTrend.averagePrice}
              precision={0}
              suffix="元/㎡"
              size="small"
              valueStyle={{ color: '#3f8600', fontSize: '16px' }}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="价格变化"
              value={marketTrend.priceChange}
              precision={1}
              suffix="%"
              size="small"
              valueStyle={{ 
                color: marketTrend.priceChange >= 0 ? '#cf1322' : '#52c41a',
                fontSize: '16px' 
              }}
              prefix={marketTrend.priceChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="交易量"
              value={marketTrend.transactionVolume}
              size="small"
              valueStyle={{ color: '#1890ff', fontSize: '16px' }}
            />
          </Col>
        </Row>
        <div style={{ 
          fontSize: '12px', 
          color: '#8c8c8c', 
          marginTop: '8px',
          textAlign: 'right'
        }}>
          数据来源: {marketTrend.region} {marketTrend.propertyType}市场
        </div>
      </div>
    );
  };

  // 渲染建议卡片
  const renderSuggestionCard = (suggestion: SmartSuggestion) => {
    // 根据建议类型生成标签
    const getSuggestionTag = (title: string) => {
      if (title.includes('面积')) return '面积建议';
      if (title.includes('房龄')) return '房龄建议';
      if (title.includes('位置')) return '位置建议';
      if (title.includes('楼层')) return '楼层建议';
      if (title.includes('市场')) return '市场趋势';
      return '综合建议';
    };

    const tag = getSuggestionTag(suggestion.title);
    const tagColor = {
      '面积建议': 'orange',
      '房龄建议': 'blue',
      '位置建议': 'green',
      '楼层建议': 'purple',
      '市场趋势': 'red',
      '综合建议': 'default'
    }[tag] as any;

    return (
      <Collapse.Panel
        key={suggestion.id}
        header={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag color={tagColor} size="small">{tag}</Tag>
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#262626' }}>{suggestion.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#8c8c8c',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                置信度: {Math.round(suggestion.confidence * 100)}%
              </div>
            </div>
          </div>
        }
        className="suggestion-panel"
      >
        <div style={{ padding: '0 8px' }}>
          <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#595959', marginBottom: '16px' }}>
            {suggestion.content}
          </div>
          
          {/* 渲染市场趋势数据 */}
          {renderMarketTrend(suggestion)}
          
          {/* 渲染建议的参数 */}
          {Object.keys(suggestion.suggestedParams).length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#262626' }}>
                建议调整参数
              </div>
              <div style={{ 
                backgroundColor: '#fafafa', 
                padding: '12px', 
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {Object.entries(suggestion.suggestedParams).map(([key, value]) => {
                    // 格式化参数名称
                    const formatParamName = (paramKey: string) => {
                      const paramMap: Record<string, string> = {
                        propertyFeatures: '房产特色',
                        marketTrends: '市场趋势'
                      };
                      return paramMap[paramKey] || paramKey;
                    };

                    return (
                      <li key={key} style={{ marginBottom: '4px', color: '#595959' }}>
                        <strong>{formatParamName(key)}:</strong> 
                        {Array.isArray(value) ? value.join(', ') : 
                          typeof value === 'object' ? JSON.stringify(value) : value}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Button 
              type="primary"
              size="small"
              onClick={() => onApply(suggestion)}
              style={{ backgroundColor: '#ffa046', borderColor: '#ffa046' }}
            >
              应用建议
            </Button>
          </div>
        </div>
      </Collapse.Panel>
    );
  };

  return (
    <Card 
      title="智能建议" 
      bordered={false}
      className="smart-suggestions-card"
      extra={
        <Tooltip title="智能建议基于市场数据和AI算法生成，帮助您优化房产估价参数">
          <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
        </Tooltip>
      }
    >
      <Collapse
        activeKey={activeKey}
        onChange={handleCollapseChange}
        bordered={false}
        ghost
      >
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            style={{ 
              marginBottom: '12px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}
          >
            {renderSuggestionCard(suggestion)}
          </div>
        ))}
      </Collapse>
      
      <div style={{ 
        marginTop: '16px', 
        fontSize: '12px', 
        color: '#8c8c8c', 
        textAlign: 'center'
      }}>
        智能建议由AI算法基于市场数据生成，仅供参考
      </div>
    </Card>
  );
};

export default SmartSuggestions;