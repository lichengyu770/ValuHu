const fs = require('fs');
const path = require('path');

// 获取当前目录下所有HTML文件
const htmlFiles = fs
  .readdirSync('.')
  .filter((file) => path.extname(file) === '.html');

// 修复规则
const fixPatterns = [
  // 修复产品服务下拉菜单
  {
    regex:
      /<div class="dropdown-menu">\s*<a href="valuation-engine.html" class="\s*<a href="advanced-search.html" class="\s*<a href="product-services.html" class="\s*<\/div>/g,
    replacement:
      '<div class="dropdown-menu">\n                    <a href="valuation-engine.html" class="dropdown-item">估值引擎</a>\n                    <a href="advanced-search.html" class="dropdown-item">高级搜索</a>\n                    <a href="product-services.html" class="dropdown-item">产品服务</a>\n                </div>',
  },
  // 修复用户中心链接
  {
    regex: /<a href="user-center.html" class="/g,
    replacement: '<a href="user-center.html" class="nav-link">用户中心</a>',
  },
  // 修复数据分析下拉菜单
  {
    regex:
      /<div class="dropdown-menu">\s*<a href="market-analysis.html" class="\s*<a href="comparison-tool.html" class="\s*<a href="data-visualization.html" class="\s*<a href="case-study.html" class="\s*<\/div>/g,
    replacement:
      '<div class="dropdown-menu">\n                    <a href="market-analysis.html" class="dropdown-item">市场分析</a>\n                    <a href="comparison-tool.html" class="dropdown-item">对比工具</a>\n                    <a href="data-visualization.html" class="dropdown-item">数据可视化</a>\n                    <a href="case-study.html" class="dropdown-item">案例分析</a>\n                </div>',
  },
  // 修复评估预览下拉菜单
  {
    regex:
      /<div class="dropdown-menu">\s*<a href="gis-evaluation-preview.html" class="\s*<a href="revenue-evaluation-preview.html" class="\s*<\/div>/g,
    replacement:
      '<div class="dropdown-menu">\n                    <a href="gis-evaluation-preview.html" class="dropdown-item">GIS评估预览</a>\n                    <a href="revenue-evaluation-preview.html" class="dropdown-item">收益评估预览</a>\n                </div>',
  },
  // 修复关于我们下拉菜单
  {
    regex:
      /<div class="dropdown-menu">\s*<a href="tech-frame.html" class="\s*<a href="api-docs.html" class="\s*<a href="team-intro.html" class="\s*<a href="about-us.html" class="\s*<\/div>/g,
    replacement:
      '<div class="dropdown-menu">\n                    <a href="tech-frame.html" class="dropdown-item">技术框架</a>\n                    <a href="api-docs.html" class="dropdown-item">API文档</a>\n                    <a href="team-intro.html" class="dropdown-item">团队介绍</a>\n                    <a href="about-us.html" class="dropdown-item">关于我们</a>\n                </div>',
  },
];

// 修复单个HTML文件
function fixHtmlFile(filePath) {
  console.log(`正在修复文件: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 应用所有修复规则
  fixPatterns.forEach((pattern) => {
    const originalContent = content;
    content = content.replace(pattern.regex, pattern.replacement);
    if (content !== originalContent) {
      changes++;
    }
  });

  // 如果有变化，保存文件
  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`修复完成，共修复了 ${changes} 处问题`);
  } else {
    console.log('文件无需修复');
  }
}

// 修复所有HTML文件
htmlFiles.forEach(fixHtmlFile);

console.log('所有HTML文件修复完成！');
