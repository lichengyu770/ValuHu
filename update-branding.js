// 批量更新HTML文件品牌标识的Node.js脚本

const fs = require('fs');
const path = require('path');

// 设置工作目录
const workingDir = 'C:\\Users\\Administrator\\Desktop\\fgfh\\test-routes';

// 获取所有HTML文件
const getAllHtmlFiles = (dir) => {
    let files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            // 跳过子目录，只处理当前目录下的HTML文件
            continue;
        } else if (item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
};

// 更新单个HTML文件
const updateHtmlFile = (filePath) => {
    console.log(`正在处理文件: ${path.basename(filePath)}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // 1. 添加缓存控制meta标签
    if (!content.includes('Cache-Control')) {
        content = content.replace('<head>', '<head>\n    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n    <meta http-equiv="Pragma" content="no-cache">\n    <meta http-equiv="Expires" content="0">');
        updated = true;
    }
    
    // 2. 更新页面标题
    if (content.includes('智汇云') || content.includes('ZhiHuiYun')) {
        content = content.replace(/智汇云/g, 'ValuHub');
        content = content.replace(/ZhiHuiYun/g, 'ValuHub');
        content = content.replace(/- 数智估价核心引擎/g, '- ValuHub');
        updated = true;
    }
    
    // 3. 添加logo样式
    if (!content.includes('img[src="图片1.png"]')) {
        // 在样式表末尾添加logo样式
        if (content.includes('</style>')) {
            content = content.replace('</style>', '\n        img[src="图片1.png"] { max-width: 45px !important; max-height: 45px !important; width: 45px !important; height: 45px !important; object-fit: contain !important; display: inline-block !important; }\n    </style>');
            updated = true;
        } else {
            // 如果没有样式表，在head末尾添加
            if (content.includes('</head>')) {
                content = content.replace('</head>', '\n    <style>\n        img[src="图片1.png"] { max-width: 45px !important; max-height: 45px !important; width: 45px !important; height: 45px !important; object-fit: contain !important; display: inline-block !important; }\n    </style>\n</head>');
                updated = true;
            }
        }
    }
    
    // 4. 保存修改
    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`文件已更新: ${path.basename(filePath)}`);
    } else {
        console.log(`文件无需更新: ${path.basename(filePath)}`);
    }
};

// 主函数
const main = () => {
    console.log('开始批量更新HTML文件品牌标识...');
    
    const htmlFiles = getAllHtmlFiles(workingDir);
    console.log(`共找到 ${htmlFiles.length} 个HTML文件`);
    
    htmlFiles.forEach(filePath => {
        try {
            updateHtmlFile(filePath);
        } catch (error) {
            console.error(`处理文件 ${path.basename(filePath)} 时出错:`, error.message);
        }
    });
    
    console.log('所有HTML文件处理完成！');
};

// 执行主函数
main();