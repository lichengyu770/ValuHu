const fs = require('fs');

// 读取所有HTML文件
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

// 定义要添加的CSS样式
const cssFixes = `
<style>
/* 通用修复样式 - 确保文字横向显示和导航栏增大 */

/* 修复LOGO文字竖向显示问题 */
.navbar-brand,
.logo {
    display: flex !important;
    align-items: center !important;
    gap: var(--spacing-2) !important;
    flex-direction: row !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
    white-space: nowrap !important;
}

.navbar-brand img,
.logo img {
    display: inline-block !important;
    vertical-align: middle !important;
    max-width: 50px !important;
    max-height: 50px !important;
    width: 50px !important;
    height: 50px !important;
    object-fit: contain !important;
}

.navbar-brand span,
.navbar-brand a,
.logo span,
.logo a {
    display: inline-block !important;
    vertical-align: middle !important;
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
}

/* 调整导航栏大小 */
.navbar {
    height: 80px !important;
    padding: 16px 24px !important;
}

.nav-menu {
    gap: var(--spacing-4) !important;
}

.nav-menu a {
    font-size: 16px !important;
    padding: 10px 16px !important;
}

/* 确保所有文字横向显示 */
* {
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
}

/* 确保容器元素横向排列 */
.grid,
.grid-cols-4,
.grid-cols-3,
.d-flex,
.align-items-center,
.justify-content-between,
.justify-content-center,
.hero-buttons {
    flex-direction: row !important;
}
</style>
`;

// 处理每个HTML文件
files.forEach(file => {
    console.log(`Processing ${file}...`);
    
    try {
        // 读取文件内容
        let content = fs.readFileSync(file, 'utf8');
        
        // 检查是否已经添加了修复
        if (content.includes('修复文字竖向显示问题')) {
            console.log(`  ${file} already has fixes, skipping...`);
            return;
        }
        
        // 在</head>标签前插入CSS修复
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex !== -1) {
            const newContent = content.slice(0, headEndIndex) + cssFixes + content.slice(headEndIndex);
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`  Fixed ${file}`);
        } else {
            console.log(`  ${file} has no </head> tag, skipping...`);
        }
    } catch (error) {
        console.error(`  Error processing ${file}:`, error.message);
    }
});

console.log('\nAll files processed!');