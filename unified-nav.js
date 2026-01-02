import fs from 'fs';
import path from 'path';

// 统一的导航栏模板 - 包含完整的导航结构、logo和基础CSS
const unifiedNavbar = `    <!-- 统一导航栏CSS -->
    <style>
        /* 导航栏基础样式 */
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            z-index: 1000;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
        }
        
        .navbar .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            height: 65px;
        }
        
        /* Logo样式 */
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .logo:hover {
            transform: translateY(-1px);
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3);
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .logo-icon:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
        }
        
        .logo-icon img {
            width: 32px;
            height: 32px;
            object-fit: contain;
        }
        
        .logo-text {
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(135deg, #1a73e8, #f9a825);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* 导航菜单 */
        .nav-menu {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .nav-menu > a {
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 8px 12px;
            border-radius: 6px;
        }
        
        .nav-menu > a:hover,
        .nav-menu > a.active {
            color: #1a73e8;
            background: rgba(26, 115, 232, 0.1);
        }
        
        /* 下拉菜单 */
        .dropdown {
            position: relative;
        }
        
        .dropdown-toggle {
            display: flex;
            align-items: center;
            gap: 5px;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 8px 12px;
            border-radius: 6px;
        }
        
        .dropdown-toggle:hover {
            color: #1a73e8;
            background: rgba(26, 115, 232, 0.1);
        }
        
        .dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 8px;
            padding: 8px 0;
            min-width: 180px;
            z-index: 1001;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        }
        
        .dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-item {
            display: block;
            padding: 10px 16px;
            text-decoration: none;
            color: #333;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .dropdown-item:hover {
            background: rgba(26, 115, 232, 0.1);
            color: #1a73e8;
        }
        
        /* 登录按钮 */
        .btn {
            padding: 8px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #1a73e8, #0d47a1);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(26, 115, 232, 0.4);
        }
        
        /* 移动端菜单按钮 */
        .menu-toggle {
            display: none;
            background: none;
            border: none;
            font-size: 20px;
            color: #333;
            cursor: pointer;
            padding: 8px;
        }
        
        /* 移动端菜单 */
        .mobile-menu {
            display: none;
            position: fixed;
            top: 65px;
            left: 0;
            right: 0;
            background: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 999;
            max-height: calc(100vh - 65px);
            overflow-y: auto;
        }
        
        .mobile-menu ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .mobile-menu li {
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .mobile-menu a {
            display: block;
            padding: 15px 20px;
            text-decoration: none;
            color: #333;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .mobile-menu a:hover,
        .mobile-menu a.active {
            background: rgba(26, 115, 232, 0.1);
            color: #1a73e8;
        }
        
        /* 响应式设计 */
        @media (max-width: 992px) {
            .nav-menu {
                display: none;
            }
            
            .menu-toggle {
                display: block;
            }
            
            .mobile-menu {
                display: block;
            }
        }
        
        /* 页面内容间距 */
        body {
            margin-top: 65px;
        }
    </style>
    
    <!-- 1. 导航栏（统一模板） -->
    <nav class="navbar">
        <div class="container">
            <a href="index.html" class="logo">
                <div class="logo-icon">
                    <img src="src/assets/images/logo.svg" alt="系统Logo" width="32" height="32" style="object-fit: contain;">
                </div>
                <span class="logo-text">数智估价核心引擎</span>
            </a>
            <div class="nav-menu">
                <a href="index.html" class="ACTIVE_CLASS">首页</a>
                <!-- 产品服务下拉菜单 -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">产品服务 <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="valuation-engine.html" class="NAV_CLASS_VALUATION">估价引擎</a>
                        <a href="advanced-search.html" class="NAV_CLASS_ADVANCED_SEARCH">高级搜索</a>
                        <a href="product-services.html" class="NAV_CLASS_PRODUCT">产品服务</a>
                    </div>
                </div>
                <!-- 用户中心 -->
                <a href="user-center.html" class="NAV_CLASS_USER_CENTER">用户中心</a>
                <!-- 数据分析下拉菜单 -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">数据分析 <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="market-analysis.html" class="NAV_CLASS_MARKET">市场分析</a>
                        <a href="comparison-tool.html" class="NAV_CLASS_COMPARISON">比较工具</a>
                        <a href="data-visualization.html" class="NAV_CLASS_VISUALIZATION">数据可视化</a>
                        <a href="case-study.html" class="NAV_CLASS_CASE">客户案例</a>
                    </div>
                </div>
                <!-- 评估预览下拉菜单 -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">评估预览 <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="gis-evaluation-preview.html" class="NAV_CLASS_GIS">GIS评估预览</a>
                        <a href="revenue-evaluation-preview.html" class="NAV_CLASS_REVENUE">收益评估预览</a>
                    </div>
                </div>
                <!-- 关于我们下拉菜单 -->
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">关于我们 <i class="fas fa-chevron-down"></i></a>
                    <div class="dropdown-menu">
                        <a href="tech-frame.html" class="NAV_CLASS_TECH">技术框架</a>
                        <a href="api-docs.html" class="NAV_CLASS_API">API文档</a>
                        <a href="team-intro.html" class="NAV_CLASS_TEAM">团队介绍</a>
                        <a href="about-us.html" class="NAV_CLASS_ABOUT">关于我们</a>
                    </div>
                </div>
                <!-- 登录按钮 -->
                <button class="btn btn-primary" id="loginBtn">登录</button>
            </div>
            <div class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></div>
        </div>
    </nav>
    
    <!-- 移动端菜单 -->
    <div class="mobile-menu" id="mobileMenu">
        <ul>
            <li><a href="index.html" class="ACTIVE_CLASS">首页</a></li>
            <li><a href="valuation-engine.html">估价引擎</a></li>
            <li><a href="advanced-search.html">高级搜索</a></li>
            <li><a href="user-center.html">用户中心</a></li>
            <li><a href="market-analysis.html">市场分析</a></li>
            <li><a href="comparison-tool.html">比较工具</a></li>
            <li><a href="data-visualization.html">数据可视化</a></li>
            <li><a href="case-study.html">客户案例</a></li>
            <li><a href="product-services.html">产品服务</a></li>
            <li><a href="gis-evaluation-preview.html">GIS评估预览</a></li>
            <li><a href="revenue-evaluation-preview.html">收益评估预览</a></li>
            <li><a href="tech-frame.html">技术框架</a></li>
            <li><a href="api-docs.html">API文档</a></li>
            <li><a href="team-intro.html">团队介绍</a></li>
            <li><a href="about-us.html">关于我们</a></li>
            <li><a href="contact.html">联系方式</a></li>
            <li><a href="help-center.html">帮助中心</a></li>
        </ul>
    </div>
    
    <!-- 导航栏JavaScript -->
    <script>
        // 移动端菜单切换
        document.getElementById('menuToggle').addEventListener('click', function() {
            const mobileMenu = document.getElementById('mobileMenu');
            mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
        });
        
        // 点击外部关闭移动端菜单
        document.addEventListener('click', function(e) {
            const mobileMenu = document.getElementById('mobileMenu');
            const menuToggle = document.getElementById('menuToggle');
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.style.display = 'none';
            }
        });
    </script>`;

// 获取所有HTML文件
const htmlFiles = fs
  .readdirSync('.')
  .filter((file) => file.endsWith('.html'))
  .filter((file) => !file.includes('node_modules'));

console.log(`找到 ${htmlFiles.length} 个HTML文件`);

// 正则表达式匹配现有的导航栏部分
const navbarRegex =
  /<!--\s*1\.\s*导航栏[\s\S]*?-->\s*<nav[\s\S]*?<\/nav>\s*<!--\s*移动端菜单[\s\S]*?<\/div>/g;

// 更新每个HTML文件
htmlFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // 替换导航栏
    let updatedContent = content;

    // 根据不同页面设置不同的active类
    let pageNavbar = unifiedNavbar;

    // 设置当前页面的active类
    if (file === 'index.html') {
      pageNavbar = pageNavbar
        .replace(/ACTIVE_CLASS/g, 'active')
        .replace(/NAV_CLASS_\w+/g, '');
    } else {
      const navClass = `NAV_CLASS_${file.replace('.html', '').toUpperCase()}`;
      pageNavbar = pageNavbar
        .replace(/ACTIVE_CLASS/g, '')
        .replace(new RegExp(navClass, 'g'), 'active');
      pageNavbar = pageNavbar.replace(/NAV_CLASS_\w+/g, '');
    }

    // 替换整个导航栏部分
    updatedContent = updatedContent.replace(navbarRegex, pageNavbar);

    // 保存更新后的文件
    fs.writeFileSync(file, updatedContent, 'utf8');
    console.log(`✅ 更新成功: ${file}`);
  } catch (error) {
    console.error(`❌ 更新失败: ${file}`, error.message);
  }
});

console.log('\n✅ 所有HTML文件的导航栏已统一更新！');
