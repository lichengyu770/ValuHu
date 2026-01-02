import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomCard } from '../components/SystemCard';
import { FeaturedContentType } from '../models/featuredModels';
import featuredContentService from '../models/featuredModels';
import {
  CustomLineChart,
  CustomBarChart,
  CustomPieChart,
} from '../components/ChartLibrary';

// 精选页面组件
const FeaturedPage = () => {
  const [featuredContent, setFeaturedContent] = useState({
    recommended: [],
    valuationModels: [],
    reportTemplates: [],
    valuationCases: [],
    marketTrends: [],
    valuationTips: [],
  });

  const [activeTab, setActiveTab] = useState('recommended');

  // 组件挂载时加载精选内容
  useEffect(() => {
    loadFeaturedContent();
  }, []);

  // 加载精选内容
  const loadFeaturedContent = () => {
    const recommended = featuredContentService.getRecommendedContent();
    const valuationModels = featuredContentService.getFeaturedContentByType(
      FeaturedContentType.VALUATION_MODEL
    );
    const reportTemplates = featuredContentService.getFeaturedContentByType(
      FeaturedContentType.REPORT_TEMPLATE
    );
    const valuationCases = featuredContentService.getFeaturedContentByType(
      FeaturedContentType.VALUATION_CASE
    );
    const marketTrends = featuredContentService.getFeaturedContentByType(
      FeaturedContentType.MARKET_TREND
    );
    const valuationTips = featuredContentService.getFeaturedContentByType(
      FeaturedContentType.VALUATION_TIP
    );

    setFeaturedContent({
      recommended,
      valuationModels,
      reportTemplates,
      valuationCases,
      marketTrends,
      valuationTips,
    });
  };

  // 处理内容点击
  const handleContentClick = (content) => {
    // 增加使用次数
    featuredContentService.incrementUsageCount(content.id);
    // 重新加载内容
    loadFeaturedContent();
  };

  // 渲染内容卡片
  const renderContentCard = (content) => {
    return (
      <CustomCard
        key={content.id}
        title={content.title}
        description={content.description}
        imageUrl={content.thumbnail}
        className='featured-content-card'
        onClick={() => handleContentClick(content)}
      >
        <div className='card-footer'>
          <div className='rating'>
            <span className='star'>★</span>
            <span>{content.rating}</span>
          </div>
          <div className='usage-count'>
            <span>使用次数: {content.usageCount}</span>
          </div>
          <Link to={content.url} className='view-details'>
            查看详情 →
          </Link>
        </div>
      </CustomCard>
    );
  };

  // 渲染市场趋势图表
  const renderMarketTrendChart = () => {
    // 模拟市场趋势数据
    const chartData = [
      { name: '1月', price: 12000, volume: 1500 },
      { name: '2月', price: 12500, volume: 1800 },
      { name: '3月', price: 13000, volume: 2000 },
      { name: '4月', price: 12800, volume: 1700 },
      { name: '5月', price: 13500, volume: 2200 },
      { name: '6月', price: 14000, volume: 2500 },
    ];

    return (
      <div className='market-trend-charts'>
        <div className='chart-container'>
          <h4>2025年上半年房价走势</h4>
          <CustomLineChart
            data={chartData}
            xKey='name'
            yKey='price'
            title='房价走势'
            width={400}
            height={200}
          />
        </div>
        <div className='chart-container'>
          <h4>2025年上半年成交量</h4>
          <CustomBarChart
            data={chartData}
            xKey='name'
            yKey='volume'
            title='成交量'
            width={400}
            height={200}
          />
        </div>
      </div>
    );
  };

  // 渲染估价方法分布饼图
  const renderValuationMethodChart = () => {
    // 模拟估价方法使用分布数据
    const methodData = [
      { name: '市场比较法', value: 65 },
      { name: '收益法', value: 20 },
      { name: '成本法', value: 10 },
      { name: '综合估价法', value: 5 },
    ];

    return (
      <div className='method-distribution-chart'>
        <h4>估价方法使用分布</h4>
        <CustomPieChart
          data={methodData}
          nameKey='name'
          valueKey='value'
          title='估价方法分布'
          width={400}
          height={300}
        />
      </div>
    );
  };

  return (
    <div className='featured-page'>
      <div className='page-header'>
        <h1>精选内容</h1>
        <p>发现房产估价系统的核心功能和优质资源</p>
      </div>

      <div className='featured-tabs'>
        <button
          className={`tab-button ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommended')}
        >
          推荐内容
        </button>
        <button
          className={`tab-button ${activeTab === 'valuationModels' ? 'active' : ''}`}
          onClick={() => setActiveTab('valuationModels')}
        >
          估价模型
        </button>
        <button
          className={`tab-button ${activeTab === 'reportTemplates' ? 'active' : ''}`}
          onClick={() => setActiveTab('reportTemplates')}
        >
          报告模板
        </button>
        <button
          className={`tab-button ${activeTab === 'valuationCases' ? 'active' : ''}`}
          onClick={() => setActiveTab('valuationCases')}
        >
          估价案例
        </button>
        <button
          className={`tab-button ${activeTab === 'marketTrends' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketTrends')}
        >
          市场趋势
        </button>
        <button
          className={`tab-button ${activeTab === 'valuationTips' ? 'active' : ''}`}
          onClick={() => setActiveTab('valuationTips')}
        >
          估价技巧
        </button>
      </div>

      <div className='featured-content'>
        {activeTab === 'recommended' && (
          <>
            <div className='content-section'>
              <h2>推荐内容</h2>
              <div className='content-grid'>
                {featuredContent.recommended.map(renderContentCard)}
              </div>
            </div>

            {renderMarketTrendChart()}
            {renderValuationMethodChart()}
          </>
        )}

        {activeTab === 'valuationModels' && (
          <div className='content-section'>
            <h2>精选估价模型</h2>
            <div className='content-grid'>
              {featuredContent.valuationModels.map(renderContentCard)}
            </div>
          </div>
        )}

        {activeTab === 'reportTemplates' && (
          <div className='content-section'>
            <h2>精选报告模板</h2>
            <div className='content-grid'>
              {featuredContent.reportTemplates.map(renderContentCard)}
            </div>
          </div>
        )}

        {activeTab === 'valuationCases' && (
          <div className='content-section'>
            <h2>热门估价案例</h2>
            <div className='content-grid'>
              {featuredContent.valuationCases.map(renderContentCard)}
            </div>
          </div>
        )}

        {activeTab === 'marketTrends' && (
          <div className='content-section'>
            <h2>市场趋势精选</h2>
            <div className='content-grid'>
              {featuredContent.marketTrends.map(renderContentCard)}
            </div>
            {renderMarketTrendChart()}
          </div>
        )}

        {activeTab === 'valuationTips' && (
          <div className='content-section'>
            <h2>估价技巧精选</h2>
            <div className='content-grid'>
              {featuredContent.valuationTips.map(renderContentCard)}
            </div>
          </div>
        )}
      </div>

      <div className='featured-stats'>
        <div className='stat-card'>
          <div className='stat-value'>{featuredContent.recommended.length}</div>
          <div className='stat-label'>推荐内容</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>
            {featuredContent.valuationModels.length}
          </div>
          <div className='stat-label'>估价模型</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>
            {featuredContent.reportTemplates.length}
          </div>
          <div className='stat-label'>报告模板</div>
        </div>
        <div className='stat-card'>
          <div className='stat-value'>
            {featuredContent.valuationCases.length +
              featuredContent.marketTrends.length +
              featuredContent.valuationTips.length}
          </div>
          <div className='stat-label'>其他资源</div>
        </div>
      </div>

      <style jsx>{`
        .featured-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 36px;
          color: #007aff;
          margin-bottom: 10px;
        }

        .page-header p {
          font-size: 16px;
          color: #666;
        }

        .featured-tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tab-button {
          padding: 10px 20px;
          background-color: #f0f0f0;
          border: none;
          border-radius: 20px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          background-color: #e0e0e0;
        }

        .tab-button.active {
          background-color: #007aff;
          color: white;
        }

        .featured-content {
          margin-bottom: 40px;
        }

        .content-section {
          margin-bottom: 40px;
        }

        .content-section h2 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #333;
          border-bottom: 2px solid #007aff;
          padding-bottom: 10px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .featured-content-card {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .featured-content-card .card-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .rating {
          display: flex;
          align-items: center;
          color: #ffd700;
          font-weight: bold;
        }

        .star {
          margin-right: 5px;
        }

        .usage-count {
          color: #666;
        }

        .view-details {
          color: #007aff;
          text-decoration: none;
          font-weight: bold;
        }

        .view-details:hover {
          text-decoration: underline;
        }

        .market-trend-charts {
          display: flex;
          justify-content: space-around;
          margin: 40px 0;
          flex-wrap: wrap;
          gap: 20px;
        }

        .chart-container {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-container h4 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
        }

        .method-distribution-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 40px 0;
        }

        .method-distribution-chart h4 {
          margin-bottom: 20px;
          color: #333;
        }

        .featured-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .stat-card {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
          font-size: 36px;
          font-weight: bold;
          color: #007aff;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 16px;
          color: #666;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .market-trend-charts {
            flex-direction: column;
            align-items: center;
          }

          .chart-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedPage;
