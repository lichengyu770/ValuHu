import React, { useState, useCallback, useMemo } from 'react';
import { Card, Row, Col, Button, Space, Divider, message, Tabs, Input, Table, Tag } from 'antd';
import { SaveOutlined, ShareAltOutlined, DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';
import ShareModal from './modals/ShareModal';
import { ValuationParams, ValuationResult, SmartSuggestion } from '../../types/valuation';
import smartSuggestionService from '../../services/SmartSuggestionService';

const ValuationEngine: React.FC = () => {
  // 状态管理
  const [valuationParams, setValuationParams] = useState<ValuationParams>({
    propertyType: '',
    location: '',
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    yearBuilt: new Date().getFullYear(),
    floorLevel: 0,
    totalFloors: 0,
    propertyFeatures: [],
    marketTrends: {
      averagePrice: 0,
      priceChange: 0,
      transactionVolume: 0
    }
  });
  const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [activeAI功能, setActiveAI功能] = useState('valuation'); // valuation, price-prediction, investment-analysis, policy-interpretation
  const [aiResults, setAIResults] = useState({
    valuation: null as ValuationResult | null,
    pricePrediction: null as any,
    investmentAnalysis: null as any,
    policyInterpretation: null as any
  });
  
  // 历史记录数据
  const [historyRecords, setHistoryRecords] = useState([
    { id: 1, name: '北京市朝阳区建国路88号估价报告', time: '2025-12-26 14:30', type: 'valuation' },
    { id: 2, name: '上海浦东新区陆家嘴投资分析', time: '2025-12-26 13:15', type: 'investment-analysis' },
    { id: 3, name: '深圳南山区房价预测报告', time: '2025-12-26 12:00', type: 'price-prediction' }
  ]);
  
  // 基于当前估价参数生成智能建议
  const suggestions = useMemo(() => {
    return smartSuggestionService.generateSmartSuggestions(valuationParams);
  }, [valuationParams]);

  // 模拟AI功能计算
  const handleCalculateValuation = useCallback(async () => {
    setIsCalculating(true);
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 生成模拟结果
      const basePrice = 10000; // 每平米基础价格
      const area = valuationParams.area || 100;
      const locationFactor = 1.2; // 位置系数
      const yearFactor = 0.98; // 房龄系数
      const floorFactor = 1.02; // 楼层系数
      
      const estimatedValue = Math.round(
        basePrice * area * locationFactor * 
        Math.pow(yearFactor, new Date().getFullYear() - valuationParams.yearBuilt!) *
        Math.pow(floorFactor, valuationParams.floorLevel!)
      );
      
      const valuationResult: ValuationResult = {
        id: `val-${Date.now()}`,
        estimatedValue,
        confidenceScore: 0.85,
        valuationDate: new Date().toISOString(),
        comparableProperties: [
          { id: 'comp-1', price: estimatedValue * 0.95, area: area - 10, location: valuationParams.location || '未知区域' },
          { id: 'comp-2', price: estimatedValue * 1.05, area: area + 15, location: valuationParams.location || '未知区域' },
          { id: 'comp-3', price: estimatedValue * 0.98, area: area - 5, location: valuationParams.location || '未知区域' }
        ],
        marketTrends: {
          averagePrice: basePrice * locationFactor,
          priceChange: 5.2,
          transactionVolume: 120
        },
        valuationBreakdown: {
          landValue: Math.round(estimatedValue * 0.4),
          buildingValue: Math.round(estimatedValue * 0.5),
          improvementValue: Math.round(estimatedValue * 0.1)
        }
      };
      
      // 根据当前AI功能生成不同结果
      if (activeAI功能 === 'valuation') {
        setValuationResult(valuationResult);
        setAIResults(prev => ({ ...prev, valuation: valuationResult }));
        message.success('估价计算完成');
      } else if (activeAI功能 === 'price-prediction') {
        // 生成房价预测结果
        const pricePredictionResult = {
          id: `pred-${Date.now()}`,
          location: valuationParams.location || '未知区域',
          currentPrice: basePrice * locationFactor,
          predictions: [
            { year: 2025, price: basePrice * locationFactor * 1.05 },
            { year: 2026, price: basePrice * locationFactor * 1.12 },
            { year: 2027, price: basePrice * locationFactor * 1.18 },
            { year: 2028, price: basePrice * locationFactor * 1.25 },
            { year: 2029, price: basePrice * locationFactor * 1.32 }
          ],
          confidenceScore: 0.82,
          predictionDate: new Date().toISOString()
        };
        setAIResults(prev => ({ ...prev, pricePrediction: pricePredictionResult }));
        message.success('房价预测完成');
      } else if (activeAI功能 === 'investment-analysis') {
        // 生成投资分析结果
        const investmentAnalysisResult = {
          id: `inv-${Date.now()}`,
          location: valuationParams.location || '未知区域',
          estimatedReturn: 8.5,
          riskLevel: '中等',
          investmentAdvice: '建议长期持有，预计5年内回报率可达40%',
          marketOutlook: '该区域市场前景良好，基础设施完善，人口流入稳定',
          comparableInvestments: [
            { type: '住宅', returnRate: 7.2, riskLevel: '低' },
            { type: '商业', returnRate: 10.5, riskLevel: '高' },
            { type: '写字楼', returnRate: 6.8, riskLevel: '低' }
          ],
          analysisDate: new Date().toISOString()
        };
        setAIResults(prev => ({ ...prev, investmentAnalysis: investmentAnalysisResult }));
        message.success('投资分析完成');
      } else if (activeAI功能 === 'policy-interpretation') {
        // 生成政策解读结果
        const policyInterpretationResult = {
          id: `pol-${Date.now()}`,
          policyName: '最新房地产调控政策',
          policyDate: '2025-12-01',
          impactLevel: '中等',
          keyPoints: [
            '首套房贷款利率下调0.25个百分点',
            '二套房首付比例降至30%',
            '限购政策适度放松',
            '鼓励刚需购房，提供税费减免'
          ],
          impactAnalysis: '政策对刚需购房者利好，预计将刺激市场交易量上升5-8%',
          recommendations: '建议刚需购房者抓住时机入市，投资者可适度关注优质区域',
          interpretationDate: new Date().toISOString()
        };
        setAIResults(prev => ({ ...prev, policyInterpretation: policyInterpretationResult }));
        message.success('政策解读完成');
      }
    } catch (error) {
      message.error('AI计算失败，请稍后重试');
      console.error('AI error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [valuationParams, activeAI功能]);

  // 处理分享
  const handleShare = useCallback(() => {
    setIsShareModalVisible(true);
  }, []);

  // 处理参数更新
  const handleParamsUpdate = useCallback((params: Partial<ValuationParams>) => {
    setValuationParams(prev => ({ ...prev, ...params }));
  }, []);

  // 生成报告
  const handleGenerateReport = useCallback(() => {
    handleCalculateValuation();
  }, [handleCalculateValuation]);

  // 处理历史记录查看
  const handleViewHistory = useCallback((record: any) => {
    message.success(`查看历史记录: ${record.name}`);
    // 这里可以添加查看历史记录的逻辑
  }, []);

  // 处理历史记录删除
  const handleDeleteHistory = useCallback((record: any) => {
    setHistoryRecords(prev => prev.filter(item => item.id !== record.id));
    message.success(`已删除历史记录: ${record.name}`);
  }, []);

  // 历史记录表格列定义
  const historyColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '生成时间',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => handleViewHistory(record)}>查看报告</Button>
          <Button size="small" onClick={() => handleDeleteHistory(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="valuation-engine-container">
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 150px)', backgroundColor: '#f5f5f5' }}>
        {/* 左侧导航菜单 */}
        <aside style={{ width: 200, backgroundColor: 'white', borderRight: '1px solid #e0e0e0', padding: 20, boxShadow: '2px 0 5px rgba(0,0,0,0.1)', height: '100%' }}>
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#ff6b6b', marginRight: 8 }}>💡</span> 生成估价
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 10 }}>
                <a 
                  href="#" 
                  className={activeAI功能 === 'valuation' ? 'ai-feature-tab active' : 'ai-feature-tab'} 
                  onClick={() => setActiveAI功能('valuation')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 15px', 
                    backgroundColor: activeAI功能 === 'valuation' ? '#e3f2fd' : '#f0f0f0', 
                    color: activeAI功能 === 'valuation' ? '#1890ff' : '#666', 
                    borderRadius: 4, 
                    textDecoration: 'none', 
                    fontWeight: 500 
                  }}
                >
                  <span style={{ marginRight: 8 }}>📊</span> AI估价报告
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a 
                  href="#" 
                  className={activeAI功能 === 'price-prediction' ? 'ai-feature-tab active' : 'ai-feature-tab'} 
                  onClick={() => setActiveAI功能('price-prediction')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 15px', 
                    backgroundColor: activeAI功能 === 'price-prediction' ? '#e3f2fd' : '#f0f0f0', 
                    color: activeAI功能 === 'price-prediction' ? '#1890ff' : '#666', 
                    borderRadius: 4, 
                    textDecoration: 'none', 
                    fontWeight: 500 
                  }}
                >
                  <span style={{ marginRight: 8 }}>🏙️</span> AI房价预测
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a 
                  href="#" 
                  className={activeAI功能 === 'investment-analysis' ? 'ai-feature-tab active' : 'ai-feature-tab'} 
                  onClick={() => setActiveAI功能('investment-analysis')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 15px', 
                    backgroundColor: activeAI功能 === 'investment-analysis' ? '#e3f2fd' : '#f0f0f0', 
                    color: activeAI功能 === 'investment-analysis' ? '#1890ff' : '#666', 
                    borderRadius: 4, 
                    textDecoration: 'none', 
                    fontWeight: 500 
                  }}
                >
                  <span style={{ marginRight: 8 }}>📈</span> AI投资分析
                </a>
              </li>
              <li style={{ marginBottom: 10 }}>
                <a 
                  href="#" 
                  className={activeAI功能 === 'policy-interpretation' ? 'ai-feature-tab active' : 'ai-feature-tab'} 
                  onClick={() => setActiveAI功能('policy-interpretation')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 15px', 
                    backgroundColor: activeAI功能 === 'policy-interpretation' ? '#e3f2fd' : '#f0f0f0', 
                    color: activeAI功能 === 'policy-interpretation' ? '#1890ff' : '#666', 
                    borderRadius: 4, 
                    textDecoration: 'none', 
                    fontWeight: 500 
                  }}
                >
                  <span style={{ marginRight: 8 }}>📋</span> AI政策解读
                </a>
              </li>
            </ul>
          </div>
          
          <div style={{ marginBottom: 30 }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>历史对话</div>
            <div style={{ backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, maxHeight: 200, overflowY: 'auto' }}>
              {historyRecords.map((record) => (
                <div key={record.id} style={{ padding: 8, backgroundColor: 'white', borderRadius: 4, marginBottom: 8, cursor: 'pointer', fontSize: 14 }}>
                  {record.name}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>我的文件</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: 10 }}>
                <Link to="/data-management" className="tab-sub-content" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', backgroundColor: '#f0f0f0', color: '#666', borderRadius: 4, textDecoration: 'none' }}>
                  <span style={{ marginRight: 8 }}>📁</span> 进入工作台
                </Link>
              </li>
            </ul>
          </div>
        </aside>
        
        {/* 右侧内容区域 */}
        <main style={{ flex: 1, padding: 30 }}>
          {/* AI估价报告内容 */}
          {activeAI功能 === 'valuation' && (
            <div id="valuation" className="ai-feature-content active">
              <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                <div style={{ marginBottom: 30 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>AI估价报告</h2>
                  <p style={{ color: '#666' }}>智能生成精准房产估价报告，快速掌握市场价值</p>
                </div>
              
                {/* AI功能卡片 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 30 }}>
                  {/* AI估价报告 */}
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>AI估价报告</h3>
                    <p style={{ color: '#666', marginBottom: 15, fontSize: 14 }}>智能生成精准房产估价报告，快速掌握市场价值</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 北京市朝阳区住宅估价
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 上海浦东新区商业地产估价
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 广州天河区土地价值评估
                      </div>
                    </div>
                  </div>
                  
                  {/* AI房价预测 */}
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>AI房价预测</h3>
                    <p style={{ color: '#666', marginBottom: 15, fontSize: 14 }}>基于AI算法的精准房价走势预测，助力房地产决策</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 北京朝阳区未来3年房价预测
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 上海黄浦区房价波动分析
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 广州天河区房价趋势预测
                      </div>
                    </div>
                  </div>
                  
                  {/* AI投资分析 */}
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>AI投资分析</h3>
                    <p style={{ color: '#666', marginBottom: 15, fontSize: 14 }}>智能房地产投资分析，优化投资组合，降低风险</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 深圳福田区投资回报率分析
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 杭州滨江区投资风险评估
                      </div>
                      <div style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 5 }}>•</span> 成都高新区投资策略建议
                      </div>
                    </div>
                  </div>
                </div>
              
                {/* 输入区域 */}
                <div style={{ marginTop: 30 }}>
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <div style={{ marginBottom: 15 }}>
                      <p style={{ color: '#666', marginBottom: 10, fontSize: 14 }}>输入房产地址或关键词，AI将为您生成专业房地产报告</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                      <Input 
                        placeholder="例如：北京市朝阳区建国路88号、上海浦东新区陆家嘴..." 
                        style={{ flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 16 }}
                        onChange={(e) => handleParamsUpdate({ location: e.target.value })}
                      />
                      <Button 
                        type="primary" 
                        style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                        onClick={handleGenerateReport}
                      >
                        生成报告
                      </Button>
                    </div>
                    
                    {/* 功能按钮 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>深度分析</Button>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>推荐场景</Button>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>文档PDF分析</Button>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>图片提取</Button>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>网页分析</Button>
                      <Button style={{ backgroundColor: 'white', color: '#666', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 20, fontSize: 14, cursor: 'pointer' }}>总结长文本</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 估价历史 */}
              <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' }}>最近生成</h3>
                <Table 
                  columns={historyColumns} 
                  dataSource={historyRecords} 
                  rowKey="id" 
                  pagination={false}
                  bordered
                  style={{ border: '1px solid #e0e0e0', borderRadius: 4, overflow: 'hidden' }}
                />
              </div>
            </div>
          )}
          
          {/* AI房价预测内容 */}
          {activeAI功能 === 'price-prediction' && (
            <div id="price-prediction" className="ai-feature-content">
              <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                <div style={{ marginBottom: 30 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>AI房价预测</h2>
                  <p style={{ color: '#666' }}>基于AI算法的精准房价走势预测，助力房地产决策</p>
                </div>
                
                {/* 输入区域 */}
                <div style={{ marginTop: 30 }}>
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <div style={{ marginBottom: 15 }}>
                      <p style={{ color: '#666', marginBottom: 10, fontSize: 14 }}>输入房产地址或区域，AI将为您预测房价走势</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                      <Input 
                        placeholder="例如：北京市朝阳区、上海浦东新区陆家嘴..." 
                        style={{ flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 16 }}
                        onChange={(e) => handleParamsUpdate({ location: e.target.value })}
                      />
                      <Button 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                      >
                        预测房价
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI投资分析内容 */}
          {activeAI功能 === 'investment-analysis' && (
            <div id="investment-analysis" className="ai-feature-content">
              <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                <div style={{ marginBottom: 30 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>AI投资分析</h2>
                  <p style={{ color: '#666' }}>智能房地产投资分析，优化投资组合，降低风险</p>
                </div>
                
                {/* 输入区域 */}
                <div style={{ marginTop: 30 }}>
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <div style={{ marginBottom: 15 }}>
                      <p style={{ color: '#666', marginBottom: 10, fontSize: 14 }}>输入投资区域或项目，AI将为您提供专业投资分析</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                      <Input 
                        placeholder="例如：深圳福田区、杭州滨江区..." 
                        style={{ flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 16 }}
                        onChange={(e) => handleParamsUpdate({ location: e.target.value })}
                      />
                      <Button 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                      >
                        分析投资
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* AI政策解读内容 */}
          {activeAI功能 === 'policy-interpretation' && (
            <div id="policy-interpretation" className="ai-feature-content">
              <div style={{ backgroundColor: 'white', borderRadius: 8, padding: 30, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: 20 }}>
                <div style={{ marginBottom: 30 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' }}>AI政策解读</h2>
                  <p style={{ color: '#666' }}>智能解读房地产政策，分析政策影响和投资机会</p>
                </div>
                
                {/* 输入区域 */}
                <div style={{ marginTop: 30 }}>
                  <div style={{ backgroundColor: '#f8f9fa', borderRadius: 8, padding: 20, border: '1px solid #e0e0e0' }}>
                    <div style={{ marginBottom: 15 }}>
                      <p style={{ color: '#666', marginBottom: 10, fontSize: 14 }}>输入政策名称或关键词，AI将为您解读政策影响</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                      <Input 
                        placeholder="例如：最新房地产调控政策、首套房贷款利率..." 
                        style={{ flex: 1, padding: '12px 16px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 16 }}
                      />
                      <Button 
                        type="primary" 
                        onClick={handleGenerateReport}
                        style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: 'pointer' }}
                      >
                        解读政策
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* 分享模态框 */}
      <ShareModal 
        visible={isShareModalVisible}
        onCancel={() => setIsShareModalVisible(false)}
        valuationResult={valuationResult}
      />
    </div>
  );
};

export default ValuationEngine;