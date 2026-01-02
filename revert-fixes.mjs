import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 定义要添加的简单修复样式
const simpleFixes = `
<style>
/* 简单修复样式 - 只确保文字横向显示和导航栏增大 */

/* 确保所有文字横向显示 */
* {
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
}

/* 修复LOGO文字竖向显示问题 */
.navbar-brand,
.logo {
    display: flex !important;
    align-items: center !important;
    gap: var(--spacing-2) !important;
    flex-direction: row !important;
}

/* 调整导航栏大小 */
.navbar {
    height: 80px !important;
    padding: 16px 24px !important;
}

.nav-menu > a,
.nav-menu > .dropdown > a {
    height: 80px !important;
    line-height: 80px !important;
}

/* 调整顶部导航栏大小 */
.top-nav {
    height: 80px !important;
    min-height: 80px !important;
}
</style>
`;

// 处理每个HTML文件
const files = readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    console.log(`Processing ${file}...`);
    
    try {
        const filePath = join(__dirname, file);
        let content = readFileSync(filePath, 'utf8');
        
        // 移除旧的修复样式
        content = content.replace(/<style>\s*\/\* 通用修复样式 - 确保文字横向显示和导航栏增大 \*\/[\s\S]*?<\/style>/g, '');
        
        // 移除旧的简单修复样式
        content = content.replace(/<style>\s*\/\* 修复LOGO文字竖向显示问题 \*\/[\s\S]*?<\/style>/g, '');
        
        // 在</head>标签前添加新的简单修复样式
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex !== -1) {
            const newContent = content.slice(0, headEndIndex) + simpleFixes + content.slice(headEndIndex);
            writeFileSync(filePath, newContent, 'utf8');
            console.log(`  Reverted ${file} to simple fixes`);
        } else {
            console.log(`  Skipping ${file} - no </head> tag found`);
        }
    } catch (error) {
        console.error(`  Error processing ${file}:`, error.message);
    }
});

console.log('\nAll files reverted to simple fixes!');