import React from 'react';
import { Card, Row, Col, Button, Carousel, Typography, Image } from 'antd';
import { DatabaseOutlined, BarChartOutlined, UploadOutlined, HomeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../styles/page.css';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  return (
    <div className="home-page">
      {/* 头部 */}
      <div className="header">
        <header className="org_header">
          <div className="n_page_con_center" style={{ maxWidth: 1400 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginRight: 40 }}>房算云<span style={{ fontSize: 14, fontWeight: 'normal', color: '#999', marginLeft: 5 }}>FangSuanYun</span></div>
            </Link>
            <nav className="tabs" style={{ gap: 30 }}>
              <div className="free-member tab tab-sub-content">
                <Link to="/valuation-engine" style={{ color: '#ff6b6b', textDecoration: 'none' }}>AI估价</Link>
                <span style={{ backgroundColor: '#ff6b6b', color: 'white', fontSize: 10, padding: '2px 4px', borderRadius: 10, marginLeft: 5 }}>Hot</span>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>房算云平台</Link>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>行业报告</Link>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>企业合作</Link>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>案例库</Link>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>服务价格</Link>
              </div>
              <div className="tab">
                <Link to="#" className="tab-sub-content" style={{ color: '#333', textDecoration: 'none' }}>使用教程</Link>
              </div>
              <div className="tab" style={{ marginLeft: 20 }}>
                <Link to="#" className="tab-sub-content" style={{ backgroundColor: '#1890ff', color: 'white', padding: '8px 16px', borderRadius: 20, textDecoration: 'none' }}>登录/注册</Link>
              </div>
            </nav>
          </div>
        </header>
      </div>

      {/* 页面导航 */}
      <div className="nav-section">
        <div className="nav-container">
          <ul className="nav-list">
            <li><Link to="/" className="active">首页</Link></li>
            <li><Link to="#">模板社区</Link></li>
            <li><Link to="#">我的文件</Link></li>
            <li><Link to="#">API服务</Link></li>
            <li><Link to="#">解决方案</Link></li>
            <li><Link to="#">企业服务</Link></li>
            <li><Link to="#">价格</Link></li>
            <li><Link to="#">下载</Link></li>
            <li><Link to="#">院校端</Link></li>
            <li><Link to="#">企业端</Link></li>
            <li><Link to="#">协会端</Link></li>
            <li><Link to="#">政府端</Link></li>
            <li><Link to="#">大众端</Link></li>
          </ul>
        </div>
      </div>

      {/* 房算云Banner */}
      <section className="n_page_con mind_map">
        <div className="n_page_con_center">
          <h1 className="title">房算云，释放房地产数据价值</h1>
          <div className="intro">免费房地产AI估价与产教融合平台</div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 40 }}>
            <div className="button"><Link to="/valuation-engine" style={{ color: '#333', textDecoration: 'none' }}>AI快速估价</Link></div>
            <div className="button" style={{ backgroundColor: '#1890ff', color: 'white' }}><Link to="/data-management" style={{ color: 'white', textDecoration: 'none' }}>进入工作台</Link></div>
          </div>
        </div>
      </section>
      
      {/* 海量案例展示 */}
      <section className="n_page_con" style={{ backgroundColor: 'white', padding: '60px 0' }}>
        <div className="n_page_con_center">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 20 }}>海量案例 一键复用</h2>
            <p style={{ fontSize: 18, color: '#666' }}>百万真实房地产案例，激发灵感，提升效率。发布案例还能将知识变现，传递价值。</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
            {[...Array(8)].map((_, index) => (
              <div key={index} style={{ height: 150, backgroundColor: '#e0e0e0', borderRadius: 8 }}></div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div className="button"><a href="#template" style={{ color: '#333', textDecoration: 'none' }}>进入案例库</a></div>
          </div>
        </div>
      </section>
      
      {/* 知识社区 */}
      <section className="n_page_con study" style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
        <div className="n_page_con_center">
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <h2 className="title">知识社区 <span>作图教程</span></h2>
              <div className="intro">专业的图形百科和详细的作图步骤，让你快速掌握思维导图和流程图制作技巧。</div>
              <div className="button"><a href="#template" style={{ color: '#333', textDecoration: 'none' }}>进入案例库</a></div>
            </div>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ height: 200, backgroundColor: '#e0e0e0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#666' }}>
                知识社区示例图
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 多场景跨终端应用 */}
      <section className="n_page_con" style={{ backgroundColor: '#667eea', color: 'white', padding: '60px 0' }}>
        <div className="n_page_con_center">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>多场景跨终端应用</h2>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ height: 250, width: '80%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              多终端同步示例图
            </div>
          </div>
        </div>
      </section>
      
      {/* 安全保障 */}
      <section className="n_page_con safe">
        <div className="n_page_con_center">
          <h2 className="title">安全保障</h2>
          <div className="n_page_con_content">
            <div className="n_page_con_c_item">
              <div className="image_top">
                <img className="image-main" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231890ff'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3E文档安全%3C/text%3E%3C/svg%3E" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              </div>
              <div className="title">文档安全</div>
              <div className="text-detail">文档自动同步至云端存储，并提供历史版本记录，文档权限控制，全方位保证文档信息安全</div>
            </div>
            <div className="n_page_con_c_item">
              <div className="image_top">
                <img className="image-main" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2352c41a'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3E数据安全%3C/text%3E%3C/svg%3E" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              </div>
              <div className="title">数据安全</div>
              <div className="text-detail">文档采用数据加密+分布式存储，提供容灾备份机制，保障数据安全</div>
            </div>
            <div className="n_page_con_c_item">
              <div className="image_top">
                <img className="image-main" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23faad14'/%3E%3Ctext x='50' y='60' font-family='Arial' font-size='18' fill='white' text-anchor='middle'%3E账户安全%3C/text%3E%3C/svg%3E" style={{ width: 80, height: 80, borderRadius: '50%' }} />
              </div>
              <div className="title">账户安全</div>
              <div className="text-detail">支持多种账号验证方式，保障用户账号安全性，对开发人员操作权限进行管控，防止未经账号本人授权的访问</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 用户评价轮播图 */}
      <section className="n_page_con" style={{ backgroundColor: 'white', padding: '60px 0' }}>
        <div className="n_page_con_center">
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#333' }}>合作伙伴评价</h2>
            
            {/* 轮播图容器 */}
            <Carousel autoplay dots={true} style={{ marginBottom: 30 }}>
              {/* 轮播项1 */}
              <div className="carousel-item">
                <div style={{ marginBottom: 30 }}>
                  <span style={{ fontSize: 48, color: '#e0e0e0' }}>"</span>
                </div>
                <p style={{ fontSize: 18, color: '#666', lineHeight: 1.8, marginBottom: 30 }}>
                  房算云平台的数据精准性和产教融合模式给我们留下了深刻印象，为我们的房地产研究提供了强大支持。
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src="https://picsum.photos/id/1005/80/80"
                    alt="用户头像"
                    style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 15 }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>万科集团</div>
                    <div style={{ fontSize: 14, color: '#666' }}>【房地产开发企业】</div>
                  </div>
                </div>
              </div>
              
              {/* 轮播项2 */}
              <div className="carousel-item">
                <div style={{ marginBottom: 30 }}>
                  <span style={{ fontSize: 48, color: '#e0e0e0' }}>"</span>
                </div>
                <p style={{ fontSize: 18, color: '#666', lineHeight: 1.8, marginBottom: 30 }}>
                  通过与房算云的合作，我们实现了房地产数据的精准分析和应用，提升了企业决策效率。
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src="https://picsum.photos/id/1012/80/80"
                    alt="用户头像"
                    style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 15 }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>碧桂园</div>
                    <div style={{ fontSize: 14, color: '#666' }}>【房地产开发企业】</div>
                  </div>
                </div>
              </div>
              
              {/* 轮播项3 */}
              <div className="carousel-item">
                <div style={{ marginBottom: 30 }}>
                  <span style={{ fontSize: 48, color: '#e0e0e0' }}>"</span>
                </div>
                <p style={{ fontSize: 18, color: '#666', lineHeight: 1.8, marginBottom: 30 }}>
                  房算云平台为我们的房地产专业教学提供了丰富的案例资源和实践平台，极大提升了教学效果。
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src="https://picsum.photos/id/1027/80/80"
                    alt="用户头像"
                    style={{ width: 60, height: 60, borderRadius: '50%', marginRight: 15 }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>湖南城建职业技术学院</div>
                    <div style={{ fontSize: 14, color: '#666' }}>【房地产教育院校】</div>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>
        </div>
      </section>
      
      {/* 价格方案 */}
      <section className="n_page_con pricing" style={{ backgroundColor: '#f8f9fa', padding: '60px 0' }}>
        <div className="n_page_con_center">
          <h2 style={{ fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#667eea', marginBottom: 20 }}>自由选择更快、更高效率的协作方案</h2>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 500 }}>
              全平台多端·VIP权益互通 解锁流程图+思维导图+Markdown全部会员特权
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: 30, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* 免费版 */}
            <div className="pricing-card" style={{ flex: '0 0 250px', backgroundColor: 'white', borderRadius: 10, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: 30, textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>免费版</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#333' }}>¥0</div>
                <div style={{ fontSize: 16, color: '#666', marginLeft: 10 }}>/永久免费</div>
              </div>
              <div style={{ color: '#666', marginBottom: 30 }}>满足基础作图需求，支持协作</div>
              <Button type="default" block>立即使用</Button>
            </div>
            
            {/* 个人版 */}
            <div className="pricing-card" style={{ flex: '0 0 250px', backgroundColor: 'white', borderRadius: 10, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: 30, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ff6b6b', color: 'white', fontSize: 12, padding: '5px 10px', borderRadius: 15 }}>年末特惠 低至5折</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>个人版</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#ff6b6b' }}>¥159</div>
                <div style={{ fontSize: 16, color: '#666', marginLeft: 10 }}>/年</div>
              </div>
              <div style={{ color: '#666', marginBottom: 30 }}>能力不限，新功能优先体验特权</div>
              <Button type="primary" block>立即购买</Button>
              <div style={{ marginTop: 15, fontSize: 12, color: '#999' }}>兑换码兑换</div>
            </div>
            
            {/* 团队版 */}
            <div className="pricing-card" style={{ flex: '0 0 250px', backgroundColor: 'white', borderRadius: 10, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: 30, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ff6b6b', color: 'white', fontSize: 12, padding: '5px 10px', borderRadius: 15 }}>年末特惠 低至5折</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>团队版</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#4ecdc4' }}>¥259</div>
                <div style={{ fontSize: 16, color: '#666', marginLeft: 10 }}>/人/年</div>
              </div>
              <div style={{ color: '#666', marginBottom: 30 }}>适用于资产管理、安全管控较为严格的「成长型」企业</div>
              <Button type="primary" block style={{ marginBottom: 10 }}>立即购买</Button>
              <Button block>创建团队</Button>
              <div style={{ marginTop: 15, fontSize: 12, color: '#999' }}>团队版购买咨询：010-86393609</div>
            </div>
            
            {/* 私有部署版 */}
            <div className="pricing-card" style={{ flex: '0 0 250px', backgroundColor: 'white', borderRadius: 10, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', padding: 30, textAlign: 'center', position: 'relative' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>私有部署版</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#9b59b6' }}>预约咨询</div>
              </div>
              <div style={{ color: '#666', marginBottom: 30 }}>适用于50人以上有私有云部署需求的「中大型」企业或集团</div>
              <Button type="primary" block style={{ backgroundColor: '#9b59b6', borderColor: '#9b59b6' }}>立即咨询</Button>
              <div style={{ marginTop: 15, fontSize: 12, color: '#999' }}><a href="#enterprise" style={{ color: '#9b59b6', textDecoration: 'none' }}>了解详情</a></div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer>
        <div className="n_page_con_center">
          <div className="footer-main-content">
            <div className="correlation_item">
              <div className="title">产品</div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>AI估价</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>房算云平台</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>行业报告</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>案例库</a></div>
            </div>
            <div className="correlation_item">
              <div className="title">服务</div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>企业合作</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>服务价格</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>使用教程</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>API服务</a></div>
            </div>
            <div className="correlation_item">
              <div className="title">解决方案</div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>院校端</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>企业端</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>协会端</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>政府端</a></div>
            </div>
            <div className="correlation_item">
              <div className="title">关于我们</div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>公司介绍</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>联系方式</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>加入我们</a></div>
              <div className="text"><a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>隐私政策</a></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;