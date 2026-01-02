const fs = require('fs');
const path = require('path');

const corePages = [
    'index.html',
    'solutions.html',
    'ecosystem.html',
    'research.html',
    'academy.html'
];

let testResults = {
    pass: 0,
    warning: 0,
    fail: 0,
    total: 0
};

function logTest(title, status, details) {
    const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    const statusText = status === 'pass' ? '通过' : status === 'fail' ? '失败' : '警告';
    
    console.log(`${statusIcon} ${title} - ${statusText}`);
    console.log(`   ${details}\n`);
    
    testResults[status]++;
    testResults.total++;
}

function testPageStructure(page, content) {
    console.log(`\n📄 测试页面: ${page}`);
    console.log('='.repeat(60));
    
    const hasDoctype = content.includes('<!DOCTYPE html>');
    const hasHtmlTag = content.includes('<html');
    const hasHead = content.includes('<head>');
    const hasBody = content.includes('<body>');
    
    if (hasDoctype && hasHtmlTag && hasHead && hasBody) {
        logTest('页面结构', 'pass', '包含完整的 HTML5 文档结构');
    } else {
        logTest('页面结构', 'fail', '缺少必要的 HTML 元素');
    }
}

function testSeo(page, content) {
    const hasTitle = content.includes('<title>');
    const hasDescription = content.includes('name="description"');
    const hasKeywords = content.includes('name="keywords"');
    const hasOgTags = content.includes('og:');
    const hasStructuredData = content.includes('application/ld+json');
    
    if (hasTitle) {
        logTest('页面标题', 'pass', '包含页面标题');
    } else {
        logTest('页面标题', 'fail', '缺少页面标题');
    }
    
    if (hasDescription) {
        logTest('Meta 描述', 'pass', '包含 Meta 描述');
    } else {
        logTest('Meta 描述', 'warning', '缺少 Meta 描述');
    }
    
    if (hasKeywords) {
        logTest('Meta 关键词', 'pass', '包含 Meta 关键词');
    } else {
        logTest('Meta 关键词', 'warning', '缺少 Meta 关键词');
    }
    
    if (hasOgTags) {
        logTest('Open Graph 标签', 'pass', '包含 Open Graph 标签');
    } else {
        logTest('Open Graph 标签', 'warning', '缺少 Open Graph 标签');
    }
    
    if (hasStructuredData) {
        logTest('结构化数据', 'pass', '包含结构化数据');
    } else {
        logTest('结构化数据', 'warning', '缺少结构化数据');
    }
}

function testCacheControl(page, content) {
    const hasCacheControl = content.includes('Cache-Control');
    const hasPragma = content.includes('Pragma');
    const hasExpires = content.includes('Expires');
    
    if (hasCacheControl) {
        logTest('Cache-Control', 'pass', '包含 Cache-Control 元标签');
    } else {
        logTest('Cache-Control', 'fail', '缺少 Cache-Control 元标签');
    }
    
    if (hasPragma) {
        logTest('Pragma', 'pass', '包含 Pragma 元标签');
    } else {
        logTest('Pragma', 'warning', '缺少 Pragma 元标签');
    }
    
    if (hasExpires) {
        logTest('Expires', 'pass', '包含 Expires 元标签');
    } else {
        logTest('Expires', 'warning', '缺少 Expires 元标签');
    }
}

function testResponsive(page, content) {
    const hasViewport = content.includes('viewport');
    const hasMediaQueries = content.includes('@media');
    
    if (hasViewport) {
        logTest('响应式视口', 'pass', '包含响应式视口设置');
    } else {
        logTest('响应式视口', 'fail', '缺少响应式视口设置');
    }
    
    if (hasMediaQueries) {
        logTest('媒体查询', 'pass', '包含媒体查询样式');
    } else {
        logTest('媒体查询', 'warning', '未找到媒体查询样式');
    }
}

function testNavigation(page, content) {
    const hasNavbar = content.includes('navbar') || content.includes('nav');
    const hasLinks = content.includes('href=');
    
    if (hasNavbar) {
        logTest('导航栏', 'pass', '包含导航栏组件');
    } else {
        logTest('导航栏', 'warning', '未找到导航栏组件');
    }
    
    if (hasLinks) {
        logTest('页面链接', 'pass', '包含页面链接');
    } else {
        logTest('页面链接', 'warning', '未找到页面链接');
    }
}

function testInteraction(page, content) {
    const hasButtons = content.includes('button') || content.includes('.btn');
    const hasHoverEffects = content.includes(':hover');
    const hasTransitions = content.includes('transition');
    
    if (hasButtons) {
        logTest('按钮组件', 'pass', '包含按钮组件');
    } else {
        logTest('按钮组件', 'warning', '未找到按钮组件');
    }
    
    if (hasHoverEffects) {
        logTest('悬停效果', 'pass', '包含悬停交互效果');
    } else {
        logTest('悬停效果', 'warning', '缺少悬停交互效果');
    }
    
    if (hasTransitions) {
        logTest('过渡动画', 'pass', '包含过渡动画效果');
    } else {
        logTest('过渡动画', 'warning', '缺少过渡动画效果');
    }
}

function testPerformance(page, content) {
    const hasPreload = content.includes('rel="preload"');
    const hasAsyncScript = content.includes('async') || content.includes('defer');
    
    if (hasPreload) {
        logTest('资源预加载', 'pass', '使用资源预加载优化');
    } else {
        logTest('资源预加载', 'warning', '未使用资源预加载');
    }
    
    if (hasAsyncScript) {
        logTest('异步脚本', 'pass', '使用异步/延迟脚本加载');
    } else {
        logTest('异步脚本', 'warning', '未使用异步/延迟脚本加载');
    }
}

function testDesignTokens() {
    console.log(`\n🎨 测试设计令牌`);
    console.log('='.repeat(60));
    
    const designTokensPath = path.join(__dirname, 'css', 'design-tokens.css');
    
    if (!fs.existsSync(designTokensPath)) {
        logTest('设计令牌文件', 'fail', 'design-tokens.css 文件不存在');
        return;
    }
    
    const content = fs.readFileSync(designTokensPath, 'utf-8');
    
    const hasColorVariables = content.includes('--color-primary');
    const hasSpacingVariables = content.includes('--spacing-');
    const hasTypographyVariables = content.includes('--font-');
    const hasShadowVariables = content.includes('--shadow-');
    const hasGradientVariables = content.includes('--gradient-');
    
    if (hasColorVariables) {
        logTest('颜色系统', 'pass', '包含完整的颜色变量定义');
    } else {
        logTest('颜色系统', 'fail', '缺少颜色变量定义');
    }
    
    if (hasSpacingVariables) {
        logTest('间距系统', 'pass', '包含完整的间距变量定义');
    } else {
        logTest('间距系统', 'fail', '缺少间距变量定义');
    }
    
    if (hasTypographyVariables) {
        logTest('字体系统', 'pass', '包含完整的字体变量定义');
    } else {
        logTest('字体系统', 'fail', '缺少字体变量定义');
    }
    
    if (hasShadowVariables) {
        logTest('阴影系统', 'pass', '包含完整的阴影变量定义');
    } else {
        logTest('阴影系统', 'warning', '缺少阴影变量定义');
    }
    
    if (hasGradientVariables) {
        logTest('渐变系统', 'pass', '包含完整的渐变变量定义');
    } else {
        logTest('渐变系统', 'warning', '缺少渐变变量定义');
    }
}

function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ValuHub 功能测试报告');
    console.log('='.repeat(60));
    console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
    
    testDesignTokens();
    
    for (const page of corePages) {
        const pagePath = path.join(__dirname, page);
        
        if (!fs.existsSync(pagePath)) {
            console.log(`\n❌ 页面不存在: ${page}`);
            testResults.fail++;
            testResults.total++;
            continue;
        }
        
        const content = fs.readFileSync(pagePath, 'utf-8');
        
        testPageStructure(page, content);
        testSeo(page, content);
        testCacheControl(page, content);
        testResponsive(page, content);
        testNavigation(page, content);
        testInteraction(page, content);
        testPerformance(page, content);
    }
    
    printSummary();
}

function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试总结');
    console.log('='.repeat(60));
    console.log(`✅ 通过: ${testResults.pass}`);
    console.log(`⚠️  警告: ${testResults.warning}`);
    console.log(`❌ 失败: ${testResults.fail}`);
    console.log(`📋 总计: ${testResults.total}`);
    console.log('='.repeat(60));
    
    const passRate = ((testResults.pass / testResults.total) * 100).toFixed(2);
    console.log(`通过率: ${passRate}%`);
    
    if (passRate >= 90) {
        console.log('🎉 测试结果优秀！');
    } else if (passRate >= 70) {
        console.log('👍 测试结果良好，建议优化警告项');
    } else {
        console.log('⚠️  测试结果需要改进，请修复失败项');
    }
}

runAllTests();
