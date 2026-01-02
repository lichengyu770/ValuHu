import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件路径和目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取所有HTML文件
const files = readdirSync(__dirname).filter(f => f.endsWith('.html'));

// 定义要添加的CSS样式
const cssFixes = `
<style>
/* 通用修复样式 - 确保文字横向显示和导航栏增大 */

/* 最高优先级 - 确保所有元素文字横向显示 */
*,
*::before,
*::after {
    writing-mode: horizontal-tb !important;
    text-orientation: mixed !important;
    direction: ltr !important;
    /* 只确保文字横向，不强制flex布局，让文本正常换行 */
}

/* 确保文本元素正常显示空格和换行 */
p,
span,
div,
th,
td,
li,
strong,
em,
ai,
button,
input,
textarea,
select,
label,
h1,
h2,
h3,
h4,
h5,
h6 {
    display: block !important;
    white-space: normal !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
}

/* 修复LOGO文字竖向显示问题 */
.navbar-brand,
.logo {
    display: flex !important;
    align-items: center !important;
    gap: var(--spacing-2) !important;
    flex-direction: row !important;
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
}

/* 确保导航栏和菜单正确显示 */
.navbar {
    height: 80px !important;
    padding: 16px 24px !important;
    min-height: 80px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
}

/* 导航菜单样式 */
.nav-menu {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: var(--spacing-4) !important;
}

.nav-menu a {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 80px !important;
    padding: 0 16px !important;
    font-size: 16px !important;
    line-height: 1 !important;
    text-decoration: none !important;
    color: inherit !important;
    white-space: nowrap !important;
}

/* 导航按钮样式 */
.nav-menu .btn {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: auto !important;
    min-height: 40px !important;
    padding: 8px 16px !important;
    font-size: 14px !important;
    line-height: 1 !important;
}

/* 确保容器元素横向显示 */
.d-flex,
.align-items-center,
.justify-content-between,
.justify-content-center,
.hero-buttons,
.filter-group,
.filter-search-section,
.action-buttons,
.nav-actions,
.nav-left,
.nav-right,
.user-info,
.stat-header,
.score-item-header {
    display: flex !important;
    flex-direction: row !important;
}

/* 移动端菜单按钮样式 */
.btn-text.d-lg-none {
    display: none !important;
}

/* 确保网格布局正常显示 */
.grid,
.grid-cols-4,
.grid-cols-3,
.grid-cols-2 {
    display: grid !important;
    flex-direction: initial !important;
}

/* 确保表格布局正常显示 */
table,
tr,
thead,
tbody,
th,
td {
    display: table !important;
    display: table-row !important;
    display: table-header-group !important;
    display: table-row-group !important;
    display: table-cell !important;
    flex-direction: initial !important;
}

/* 确保列表布局正常显示 */
ul,
ol,
li {
    display: list-item !important;
    flex-direction: initial !important;
}

/* 确保表单元素正常显示 */
input,
textarea,
select,
button {
    display: inline-block !important;
    flex-direction: initial !important;
}

/* 确保文本内容正常显示换行和空格 */
.text-content,
.card-content,
.main-content,
.scoring-content,
.page-header,
.analysis-title,
.analysis-subtitle,
.chart-container,
.card,
.card-header,
.status-tag,
.score-display,
.pagination,
.pagination-info,
.score-detail-body,
.detail-section,
.detail-title,
.detail-item,
.detail-label,
.detail-value,
.score-item-name,
.score-item-weight,
.score-item-score,
.score-item-description,
.form-group,
.form-label {
    display: block !important;
    flex-direction: initial !important;
    white-space: normal !important;
    word-wrap: break-word !important;
    word-break: normal !important;
}
</style>
`;

// 处理每个HTML文件
files.forEach(file => {
    console.log(`Processing ${file}...`);
    
    try {
        // 读取文件内容
        const filePath = join(__dirname, file);
        let content = readFileSync(filePath, 'utf8');
        
        // 总是重新应用修复，确保使用最新样式
        console.log(`  Updating fixes for ${file}`);
        
        // 移除旧的修复样式
        const oldFixesRegex = /<style>\s*\/\* 通用修复样式 - 确保文字横向显示和导航栏增大 \*\/[\s\S]*?<\/style>/g;
        content = content.replace(oldFixesRegex, '');
        
        // 在</head>标签前插入CSS修复
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex !== -1) {
            const newContent = content.slice(0, headEndIndex) + cssFixes + content.slice(headEndIndex);
            writeFileSync(filePath, newContent, 'utf8');
            console.log(`  Fixed ${file}`);
        } else {
            console.log(`  ${file} has no </head> tag, skipping...`);
        }
    } catch (error) {
        console.error(`  Error processing ${file}:`, error.message);
    }
});

console.log('\nAll files processed!');