// API接口文档自动生成工具
// 将Markdown格式的API接口规范转换为HTML格式

import fs from 'fs';
import path from 'path';

/**
 * 简单的Markdown到HTML转换函数
 * @param {string} mdContent - Markdown内容
 * @returns {string} - HTML内容
 */
function simpleMarkdownToHtml(mdContent) {
  let html = mdContent;

  // 标题转换
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');

  // 代码块转换
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="hljs"><code>$1</code></pre>'
  );

  // 行内代码转换
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 表格转换（简单实现）
  html = html.replace(
    /\|(.*)\|\n\|(.*)\|\n((?:\|.*\|\n)*)/g,
    function (match, headers, separators, rows) {
      const headerCells = headers
        .split('|')
        .map((cell) => cell.trim())
        .filter(Boolean);
      const rowLines = rows.split('\n').filter((line) => line.trim());

      let tableHtml = '<table>';

      // 表头
      tableHtml += '<thead><tr>';
      headerCells.forEach((cell) => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += '</tr></thead>';

      // 表体
      tableHtml += '<tbody>';
      rowLines.forEach((line) => {
        const cells = line
          .split('|')
          .map((cell) => cell.trim())
          .filter(Boolean);
        tableHtml += '<tr>';
        cells.forEach((cell) => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody>';

      tableHtml += '</table>';
      return tableHtml;
    }
  );

  // 段落转换
  html = html.replace(/^(?!<h|<pre|<table|<tr|<td|<th)(.*$)/gm, '<p>$1</p>');

  // 空行处理
  html = html.replace(/\n\n+/g, '</p><p>');
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

/**
 * 生成API文档HTML文件
 * @param {string} mdFilePath - Markdown文件路径
 * @param {string} outputFilePath - 输出HTML文件路径
 */
function generateApiDocs(mdFilePath, outputFilePath) {
  try {
    // 读取Markdown文件内容
    const mdContent = fs.readFileSync(mdFilePath, 'utf8');

    // 转换为HTML
    const htmlContent = simpleMarkdownToHtml(mdContent);

    // 生成完整的HTML文档
    const fullHtml = generateFullHtml(htmlContent);

    // 写入HTML文件
    fs.writeFileSync(outputFilePath, fullHtml, 'utf8');

    console.log(`API文档已生成：${outputFilePath}`);
    return true;
  } catch (error) {
    console.error('生成API文档失败:', error.message);
    return false;
  }
}

/**
 * 生成完整的HTML文档
 * @param {string} htmlContent - 转换后的HTML内容
 * @returns {string} - 完整的HTML文档
 */
function generateFullHtml(htmlContent) {
  const timestamp = new Date().toISOString();
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API接口文档</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>
        // 页面加载完成后执行
        document.addEventListener('DOMContentLoaded', function() {
            // 初始化代码高亮
            hljs.highlightAll();
            
            // 添加复制按钮功能
            addCopyButtons();
            
            // 平滑滚动
            addSmoothScroll();
        });
        
        // 添加复制按钮
        function addCopyButtons() {
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(function(codeBlock) {
                const preElement = codeBlock.parentElement;
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-btn';
                copyButton.textContent = '复制';
                
                // 添加点击事件
                copyButton.addEventListener('click', function() {
                    const text = codeBlock.textContent;
                    navigator.clipboard.writeText(text).then(function() {
                        copyButton.textContent = '已复制';
                        setTimeout(function() {
                            copyButton.textContent = '复制';
                        }, 1500);
                    }).catch(function(err) {
                        console.error('复制失败:', err);
                    });
                });
                
                preElement.style.position = 'relative';
                preElement.appendChild(copyButton);
            });
        }
        
        // 添加平滑滚动
        function addSmoothScroll() {
            const links = document.querySelectorAll('a[href^="#"]');
            links.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    </script>
    <style>
        /* 全局样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
        }
        
        /* 容器样式 */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        
        /* 标题样式 */
        h1 {
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
        }
        
        h2 {
            font-size: 1.8rem;
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        h3 {
            font-size: 1.4rem;
            color: #555;
            margin-top: 25px;
            margin-bottom: 10px;
        }
        
        h4 {
            font-size: 1.2rem;
            color: #666;
            margin-top: 20px;
            margin-bottom: 8px;
        }
        
        /* 段落样式 */
        p {
            margin-bottom: 15px;
            color: #666;
        }
        
        /* 列表样式 */
        ul, ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 8px;
            color: #666;
        }
        
        /* 代码块样式 */
        pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            overflow-x: auto;
            margin-bottom: 20px;
        }
        
        code {
            font-family: 'Courier New', Courier, monospace;
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9rem;
        }
        
        pre code {
            padding: 0;
            background-color: transparent;
            border-radius: 0;
        }
        
        /* 表格样式 */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            overflow-x: auto;
            display: block;
        }
        
        th, td {
            border: 1px solid #e0e0e0;
            padding: 12px 15px;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        
        tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        /* 代码高亮样式 */
        .hljs {
            background: #f8f9fa;
        }
        
        /* 示例请求/响应样式 */
        .example {
            background-color: #f0f4f8;
            border: 1px solid #d9e2ec;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .example-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        
        /* 页脚样式 */
        footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #999;
            font-size: 0.9rem;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .container {
                padding: 10px;
                margin: 10px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            h3 {
                font-size: 1.3rem;
            }
            
            table {
                font-size: 0.9rem;
            }
            
            th, td {
                padding: 8px 10px;
            }
        }
        
        /* 按钮样式 */
        .btn {
            display: inline-block;
            padding: 8px 16px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
        
        /* 复制按钮样式 */
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            font-size: 0.8rem;
            cursor: pointer;
        }
        
        .copy-btn:hover {
            background-color: #2980b9;
        }
        
        /* 代码块容器样式 */
        .code-container {
            position: relative;
            margin-bottom: 20px;
        }
        
        /* 导航样式 */
        .nav {
            background-color: #3498db;
            color: white;
            padding: 10px 0;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .nav ul {
            list-style: none;
            padding: 0;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .nav li {
            margin: 0 15px;
        }
        
        .nav a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            transition: opacity 0.3s;
        }
        
        .nav a:hover {
            opacity: 0.8;
        }
        
        /* 版本信息样式 */
        .version-info {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
        }
        
        /* 注意事项样式 */
        .note {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px 15px;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>数智估价核心引擎 API接口文档</h1>
            <div class="version-info">
                <strong>版本：</strong>v1.0.0 | <strong>生成时间：</strong>${timestamp} | <strong>最后更新：</strong>${year}-01-01
            </div>
        </header>
        
        <nav class="nav">
            <ul>
                <li><a href="#1-接口概述">接口概述</a></li>
                <li><a href="#2-请求参数">请求参数</a></li>
                <li><a href="#3-响应参数">响应参数</a></li>
                <li><a href="#4-特殊场景响应">特殊场景</a></li>
                <li><a href="#5-接口版本">接口版本</a></li>
                <li><a href="#6-使用说明">使用说明</a></li>
                <li><a href="#7-测试用例">测试用例</a></li>
                <li><a href="#8-注意事项">注意事项</a></li>
            </ul>
        </nav>
        
        <main>
            ${htmlContent}
        </main>
        
        <footer>
            <p>&copy; ${year} 数智估价核心引擎 版权所有</p>
            <p>API接口文档 - 自动生成</p>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * 主函数
 */
function main() {
  // Markdown文件路径
  const mdFilePath = path.join(__dirname, '../docs/API接口规范.md');
  // 输出HTML文件路径
  const outputFilePath = path.join(__dirname, '../docs/api-docs.html');

  console.log('正在生成API接口文档...');
  console.log(`读取文件: ${mdFilePath}`);

  // 生成文档
  const success = generateApiDocs(mdFilePath, outputFilePath);

  if (success) {
    console.log(`文档生成成功: ${outputFilePath}`);
    console.log('API接口文档生成完成！');
  } else {
    console.error('文档生成失败');
    process.exit(1);
  }
}

// 执行主函数
// 检测是否是直接运行该脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// 导出函数，便于其他模块调用
export { generateApiDocs, generateFullHtml };
