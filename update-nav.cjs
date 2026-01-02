const fs = require('fs');
const path = require('path');

// 优化后的导航菜单HTML
const optimizedNav = `        <div class="nav-menu">
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
        </div>`;

// 获取所有HTML文件
const htmlFiles = fs
  .readdirSync('.')
  .filter((file) => file.endsWith('.html'))
  .filter((file) => !file.includes('node_modules'));

console.log(`找到 ${htmlFiles.length} 个HTML文件`);

// 正则表达式匹配导航菜单
const navRegex =
  /(<div class="nav-menu">)[\s\S]*?(<\/div>\s*<div class="menu-toggle")/g;

// 更新每个HTML文件
htmlFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // 替换导航菜单
    let updatedContent = content;

    // 根据不同页面设置不同的active类
    let pageNav = optimizedNav;

    // 设置当前页面的active类
    if (file === 'index.html') {
      pageNav = pageNav
        .replace('ACTIVE_CLASS', 'active')
        .replace(/NAV_CLASS_.+/g, '');
    } else {
      const navClass = `NAV_CLASS_${file.replace('.html', '').toUpperCase()}`;
      pageNav = pageNav.replace('ACTIVE_CLASS', '').replace(navClass, 'active');
      pageNav = pageNav.replace(/NAV_CLASS_.+/g, '');
    }

    updatedContent = updatedContent.replace(
      navRegex,
      (match, openingDiv, closingDiv) => {
        return pageNav + '\n            ' + closingDiv;
      }
    );

    // 保存更新后的文件
    fs.writeFileSync(file, updatedContent, 'utf8');
    console.log(`✅ 更新成功: ${file}`);
  } catch (error) {
    console.error(`❌ 更新失败: ${file}`, error.message);
  }
});

console.log('\n导航栏优化完成！');
