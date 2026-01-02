import React from 'react';
import { PageContainer, Typography, Tabs, Card, Row, Col, Button, List } from 'antd';
import { 
  CodeOutlined, 
  BookOutlined, 
  DatabaseOutlined, 
  PlayCircleOutlined,
  DownloadOutlined,
  GithubOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const DataAnalysisLab: React.FC = () => {
  const exampleNotebooks = [
    {
      id: '1',
      title: '房产估价基础分析',
      description: '使用基本的统计分析方法，对房产数据进行初步分析',
      language: 'Python',
      tags: ['基础分析', '统计分析', '房产估价'],
      downloads: 125
    },
    {
      id: '2',
      title: '机器学习模型构建',
      description: '使用机器学习算法构建房产估价模型',
      language: 'Python',
      tags: ['机器学习', '模型构建', '房产估价'],
      downloads: 98
    },
    {
      id: '3',
      title: '深度学习房价预测',
      description: '使用深度学习技术预测房价走势',
      language: 'Python',
      tags: ['深度学习', '房价预测', 'TensorFlow'],
      downloads: 156
    },
    {
      id: '4',
      title: '地理信息系统分析',
      description: '结合GIS数据进行房产价值分析',
      language: 'Python',
      tags: ['GIS', '地理分析', '房产价值'],
      downloads: 75
    }
  ];
  
  return (
    <PageContainer title="在线数据分析实验室">
      <div className="data-analysis-lab-container">
        <div className="data-analysis-lab-header">
          <Title level={3}>ValuHub在线数据分析实验室</Title>
          <Paragraph>
            集成Jupyter Notebook环境，预装估价分析库，为您提供强大的数据处理和分析能力。
          </Paragraph>
        </div>
        
        <div className="data-analysis-lab-features">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <CodeOutlined />
                </div>
                <div className="feature-content">
                  <h4>Jupyter Notebook</h4>
                  <p>集成Jupyter Notebook环境，支持交互式数据分析</p>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <DatabaseOutlined />
                </div>
                <div className="feature-content">
                  <h4>预装分析库</h4>
                  <p>预装了常用的估价分析库，包括Pandas、NumPy、Scikit-learn等</p>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Card hoverable className="feature-card">
                <div className="feature-icon">
                  <PlayCircleOutlined />
                </div>
                <div className="feature-content">
                  <h4>示例 notebook</h4>
                  <p>提供丰富的示例notebook，快速上手数据分析</p>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        
        <Tabs defaultActiveKey="notebooks" className="data-analysis-lab-tabs">
          {/* 示例 Notebooks */}
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                示例 Notebooks
              </span>
            } 
            key="notebooks"
          >
            <div className="notebooks-content">
              <div className="notebooks-header">
                <h4>精选示例 Notebooks</h4>
                <Button type="primary" icon={<DownloadOutlined />}>
                  下载全部
                </Button>
              </div>
              
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={exampleNotebooks}
                renderItem={(notebook) => (
                  <List.Item>
                    <Card 
                      hoverable 
                      className="notebook-card"
                      title={notebook.title}
                      extra={
                        <Button type="primary" icon={<DownloadOutlined />}>
                          下载
                        </Button>
                      }
                    >
                      <div className="notebook-content">
                        <p>{notebook.description}</p>
                        <div className="notebook-meta">
                          <span className="language-tag">{notebook.language}</span>
                          <span className="downloads">{notebook.downloads} 下载</span>
                        </div>
                        <div className="notebook-tags">
                          {notebook.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
          
          {/* Jupyter 环境 */}
          <TabPane 
            tab={
              <span>
                <CodeOutlined />
                Jupyter 环境
              </span>
            } 
            key="jupyter"
          >
            <div className="jupyter-content">
              <Card className="jupyter-card">
                <div className="jupyter-placeholder">
                  <CodeOutlined className="placeholder-icon" />
                  <h3>Jupyter Notebook环境正在构建中</h3>
                  <p>我们正在集成Jupyter Notebook环境，敬请期待！</p>
                  <Button type="primary" icon={<GithubOutlined />} size="large">
                    查看GitHub文档
                  </Button>
                </div>
              </Card>
            </div>
          </TabPane>
          
          {/* 预装库 */}
          <TabPane 
            tab={
              <span>
                <DatabaseOutlined />
                预装分析库
              </span>
            } 
            key="libraries"
          >
            <div className="libraries-content">
              <Card className="libraries-card">
                <div className="libraries-placeholder">
                  <DatabaseOutlined className="placeholder-icon" />
                  <h3>预装分析库列表</h3>
                  <p>我们的数据分析实验室预装了以下常用分析库：</p>
                  <ul className="libraries-list">
                    <li>Pandas - 数据分析和处理</li>
                    <li>NumPy - 数值计算</li>
                    <li>Scikit-learn - 机器学习</li>
                    <li>TensorFlow - 深度学习</li>
                    <li>PyTorch - 深度学习</li>
                    <li>Matplotlib - 数据可视化</li>
                    <li>Seaborn - 统计数据可视化</li>
                    <li>Plotly - 交互式数据可视化</li>
                    <li>Geopandas - 地理数据处理</li>
                    <li>Statsmodels - 统计建模</li>
                    <li>XGBoost - 梯度提升树</li>
                    <li>LightGBM - 高效梯度提升树</li>
                    <li>CatBoost - 类别特征处理</li>
                    <li>Scipy - 科学计算</li>
                    <li>NLTK - 自然语言处理</li>
                  </ul>
                </div>
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      <style jsx>{`
        .data-analysis-lab-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        
        .data-analysis-lab-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .data-analysis-lab-features {
          margin-bottom: 32px;
        }
        
        .feature-card {
          text-align: center;
          padding: 24px;
        }
        
        .feature-icon {
          font-size: 48px;
          color: #1890ff;
          margin-bottom: 16px;
        }
        
        .feature-content h4 {
          margin: 0 0 8px 0;
          color: #1890ff;
        }
        
        .feature-content p {
          margin: 0;
          color: #8c8c8c;
        }
        
        .data-analysis-lab-tabs {
          margin-top: 24px;
        }
        
        .notebooks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .notebooks-header h4 {
          margin: 0;
          color: #333;
        }
        
        .notebook-card {
          margin-bottom: 16px;
        }
        
        .notebook-content p {
          margin: 0 0 12px 0;
          color: #666;
        }
        
        .notebook-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          color: #8c8c8c;
        }
        
        .language-tag {
          background-color: #f0f2f5;
          padding: 2px 8px;
          border-radius: 10px;
          color: #1890ff;
        }
        
        .downloads {
          display: flex;
          align-items: center;
        }
        
        .notebook-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .notebook-tags .tag {
          background-color: #f0f2f5;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          color: #666;
        }
        
        .jupyter-card,
        .libraries-card {
          padding: 48px 24px;
        }
        
        .jupyter-placeholder,
        .libraries-placeholder {
          text-align: center;
        }
        
        .placeholder-icon {
          font-size: 64px;
          color: #d9d9d9;
          margin-bottom: 16px;
        }
        
        .placeholder-icon + h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .placeholder-icon + h3 + p {
          margin: 0 0 24px 0;
          color: #8c8c8c;
        }
        
        .libraries-list {
          list-style-type: disc;
          padding-left: 20px;
          text-align: left;
          margin-top: 24px;
        }
        
        .libraries-list li {
          margin-bottom: 8px;
          color: #666;
        }
      `}</style>
    </PageContainer>
  );
};

export default DataAnalysisLab;
