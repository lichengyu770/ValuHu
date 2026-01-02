#!/usr/bin/env node
// 修复HTML语法错误的脚本
const fs = require('fs');
const path = require('path');

// 获取所有HTML文件
const htmlFiles = fs.readdirSync('.').filter((file) => file.endsWith('.html'));

console.log('发现HTML文件:', htmlFiles.length, '个');
console.log(htmlFiles);

// 修复HTML语法错误
const fixHtmlErrors = (content) => {
  let fixedContent = content;

  // 修复重复的用户中心链接
  fixedContent = fixedContent.replace(
    /<a href="user-center.html" class="nav-link">用户中心<\/a>nav-link">用户中心<\/a>/g,
    '<a href="user-center.html" class="nav-link">用户中心</a>'
  );

  // 修复移动端菜单中的重复active类
  fixedContent = fixedContent.replace(
    /<a href="user-center.html" class="nav-link">用户中心<\/a>active">用户中心<\/a>/g,
    '<a href="user-center.html" class="nav-link active">用户中心</a>'
  );

  // 修复快速入口中的错误链接
  fixedContent = fixedContent.replace(
    /<a href="user-center.html" class="nav-link">用户中心<\/a>action-card"/g,
    '<a href="user-center.html" class="action-card"'
  );

  // 修复导航栏中的重复div标签
  fixedContent = fixedContent.replace(
    /<\/div>\s*<\/div>\s*<div class="menu-toggle"/g,
    '</div><div class="menu-toggle"'
  );

  // 修复缺失的class属性
  fixedContent = fixedContent.replace(
    /<a href="index.html" class="">首页<\/a>/g,
    '<a href="index.html" class="">首页</a>'
  );

  return fixedContent;
};

// 处理每个HTML文件
htmlFiles.forEach((file) => {
  try {
    const filePath = path.join('.', file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixHtmlErrors(content);

    if (fixedContent !== content) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ 已修复: ${file}`);
    } else {
      console.log(`✅ 无需修复: ${file}`);
    }
  } catch (error) {
    console.error(`❌ 修复失败: ${file}`, error.message);
  }
});

console.log('\n✨ HTML语法错误修复完成！', 'utf8');
