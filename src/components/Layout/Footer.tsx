import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="n_page_con_center">
        <div className="footer-stats">
          <h2>每天有<span className="footer-highlight">100,000+</span>房产估价报告在房算云生成</h2>
        </div>
        
        {/* 社交图标区域 */}
        <div className="footer-social">
          <a href="#" className="footer-social-icon">💬</a>
          <a href="#" className="footer-social-icon">💬</a>
          <a href="#" className="footer-social-icon">📚</a>
          <a href="#" className="footer-social-icon">🎵</a>
          <a href="#" className="footer-social-icon">📕</a>
          <a href="#" className="footer-social-icon">🐦</a>
        </div>
        
        {/* 产品、资源、支持等链接 */}
        <div className="footer-links">
          {/* 产品 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">产品</h3>
            <div className="footer-link-item"><Link to="/products/industrial-empowerment" className="footer-link">产业赋能</Link></div>
            <div className="footer-link-item"><Link to="/products/education-innovation" className="footer-link">教育革新</Link></div>
            <div className="footer-link-item"><Link to="/products/five-party-collaboration" className="footer-link">五方协同</Link></div>
            <div className="footer-link-item"><Link to="/valuation-engine" className="footer-link">AI估价</Link></div>
            <div className="footer-link-item"><Link to="/products/data-dashboard" className="footer-link">数据看板</Link></div>
          </div>
          
          {/* 实用工具 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">实用工具</h3>
            <div className="footer-link-item"><Link to="/utils/house-price-calculator" className="footer-link">房价计算器</Link></div>
            <div className="footer-link-item"><Link to="/utils/loan-calculator" className="footer-link">贷款计算器</Link></div>
            <div className="footer-link-item"><Link to="/utils/roi-calculator" className="footer-link">投资回报率计算器</Link></div>
          </div>
          
          {/* 资源 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">资源</h3>
            <div className="footer-link-item"><Link to="/resources/case-community" className="footer-link">案例社区</Link></div>
            <div className="footer-link-item"><Link to="/resources/knowledge-tutorials" className="footer-link">知识教程</Link></div>
            <div className="footer-link-item"><Link to="/resources/special-topics" className="footer-link">专题频道</Link></div>
            <div className="footer-link-item"><Link to="/resources/help-center" className="footer-link">帮助中心</Link></div>
            <div className="footer-link-item"><Link to="/resources/user-manual" className="footer-link">使用手册</Link></div>
          </div>
          
          {/* 支持 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">支持</h3>
            <div className="footer-link-item"><Link to="/support/invite-rewards" className="footer-link">邀请有礼</Link></div>
            <div className="footer-link-item"><Link to="/support/private-deployment" className="footer-link">私有化部署</Link></div>
            <div className="footer-link-item"><Link to="/support/education-certification" className="footer-link">教育认证</Link></div>
            <div className="footer-link-item"><Link to="/support/industry-standards" className="footer-link">对标行业标准</Link></div>
          </div>
          
          {/* 关于 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">关于</h3>
            <div className="footer-link-item"><Link to="/about" className="footer-link">关于我们</Link></div>
            <div className="footer-link-item"><Link to="/join-us" className="footer-link">加入我们</Link></div>
            <div className="footer-link-item"><Link to="/terms-of-service" className="footer-link">服务条款</Link></div>
            <div className="footer-link-item"><Link to="/privacy-policy" className="footer-link">隐私政策</Link></div>
          </div>
          
          {/* 联系 */}
          <div className="footer-links-column">
            <h3 className="footer-links-title">联系</h3>
            <div className="footer-contact-item">邮箱：support@fangsuanyun.com</div>
            <div className="footer-contact-item">电话: 010-82796300（个人版）</div>
            <div className="footer-contact-item">电话: 010-86393609（团队版）</div>
            <div className="footer-contact-item">工作日 9:30-18:30</div>
          </div>
        </div>
        
        {/* 友情链接 */}
        <div className="footer-friend-links">
          <span>友情链接：</span>,
          <a href="#" className="footer-friend-link">在线设计</a>
          <a href="#" className="footer-friend-link">第一PPT</a>
          <a href="#" className="footer-friend-link">简历模板</a>
          <a href="#" className="footer-friend-link">欧模网</a>
        </div>
        
        {/* 备案信息 */}
        <div className="footer-copyright">
          <span>©{new Date().getFullYear()} 房算云信息技术有限公司</span>
          <br />
          <span>主办单位：湘潭市房算云互联网科技有限公司  备案号：湘ICP备2025151710号</span>
        </div>
        
        {/* 认证标志 */}
        <div className="footer-certifications">
          <div className="footer-certification-item">
            <img src="https://picsum.photos/id/1/100/40" alt="实名认证" className="footer-certification-img" />
          </div>
          <div className="footer-certification-item">
            <img src="https://picsum.photos/id/2/100/40" alt="iTrust认证" className="footer-certification-img" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
