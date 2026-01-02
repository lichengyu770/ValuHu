const fs = require('fs');
const path = require('path');

// 读取通用修复样式
const commonCss = fs.readFileSync('./common-fixes.css', 'utf8');

// 获取当前目录下所有HTML文件
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// 遍历所有HTML文件，应用通用样式
htmlFiles.forEach(file => {
    console.log(`Processing file: ${file}`);
    
    // 读取文件内容
    let content = fs.readFileSync(file, 'utf8');
    
    // 检查是否已经包含修复样式
    if (content.includes('修复文字竖向显示问题')) {
        console.log(`  Skipping ${file} - already contains fixes`);
        return;
    }
    
    // 在<head>标签结束前添加通用样式
    const headEndIndex = content.indexOf('</head>');
    if (headEndIndex !== -1) {
        // 创建内联样式块
        const styleBlock = `<style>${commonCss}</style>`;
        
        // 插入样式块
        content = content.slice(0, headEndIndex) + styleBlock + content.slice(headEndIndex);
        
        // 保存修改后的文件
        fs.writeFileSync(file, content, 'utf8');
        console.log(`  Fixed ${file}`);
    } else {
        console.log(`  Skipping ${file} - no </head> tag found`);
    }
});

console.log('\nAll files processed!');