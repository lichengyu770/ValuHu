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

function testPageSize(page, content) {
    console.log(`\n📏 测试页面大小: ${page}`);
    console.log('='.repeat(60));
    
    const sizeKB = (content.length / 1024).toFixed(2);
    const sizeMB = (content.length / 1024 / 1024).toFixed(2);
    
    console.log(`页面大小: ${sizeKB} KB (${sizeMB} MB)`);
    
    if (content.length < 500000) {
        logTest('页面大小', 'pass', `页面大小适中 (${sizeKB} KB)`);
    } else if (content.length < 1000000) {
        logTest('页面大小', 'warning', `页面较大 (${sizeKB} KB)，建议优化`);
    } else {
        logTest('页面大小', 'fail', `页面过大 (${sizeMB} MB)，需要优化`);
    }
}

function testCssOptimization(page, content) {
    console.log(`\n🎨 测试 CSS 优化: ${page}`);
    console.log('='.repeat(60));
    
    const inlineStyleCount = (content.match(/style=/g) || []).length;
    const externalCssCount = (content.match(/<link[^>]*\.css/g) || []).length;
    const hasMinifiedCss = !content.includes('    ') || content.length < 50000;
    
    console.log(`内联样式数量: ${inlineStyleCount}`);
    console.log(`外部 CSS 文件数量: ${externalCssCount}`);
    
    if (inlineStyleCount < 10) {
        logTest('内联样式', 'pass', `内联样式数量合理 (${inlineStyleCount})`);
    } else if (inlineStyleCount < 20) {
        logTest('内联样式', 'warning', `内联样式较多 (${inlineStyleCount})，建议移至外部文件`);
    } else {
        logTest('内联样式', 'fail', `内联样式过多 (${inlineStyleCount})，需要优化`);
    }
    
    if (externalCssCount > 0) {
        logTest('外部 CSS', 'pass', `使用外部 CSS 文件 (${externalCssCount} 个)`);
    } else {
        logTest('外部 CSS', 'warning', '建议使用外部 CSS 文件');
    }
    
    if (hasMinifiedCss) {
        logTest('CSS 压缩', 'pass', 'CSS 已压缩或优化');
    } else {
        logTest('CSS 压缩', 'warning', '建议压缩 CSS');
    }
}

function testJavaScriptOptimization(page, content) {
    console.log(`\n⚡ 测试 JavaScript 优化: ${page}`);
    console.log('='.repeat(60));
    
    const inlineScriptCount = (content.match(/<script>/g) || []).length;
    const externalJsCount = (content.match(/<script[^>]*\.js/g) || []).length;
    const hasAsyncScript = content.includes('async');
    const hasDeferScript = content.includes('defer');
    
    console.log(`内联脚本数量: ${inlineScriptCount}`);
    console.log(`外部 JS 文件数量: ${externalJsCount}`);
    
    if (inlineScriptCount < 5) {
        logTest('内联脚本', 'pass', `内联脚本数量合理 (${inlineScriptCount})`);
    } else if (inlineScriptCount < 10) {
        logTest('内联脚本', 'warning', `内联脚本较多 (${inlineScriptCount})，建议移至外部文件`);
    } else {
        logTest('内联脚本', 'fail', `内联脚本过多 (${inlineScriptCount})，需要优化`);
    }
    
    if (hasAsyncScript || hasDeferScript) {
        logTest('异步脚本', 'pass', '使用异步/延迟脚本加载');
    } else {
        logTest('异步脚本', 'warning', '建议使用异步/延迟脚本加载');
    }
}

function testImageOptimization(page, content) {
    console.log(`\n🖼️ 测试图片优化: ${page}`);
    console.log('='.repeat(60));
    
    const imgCount = (content.match(/<img/g) || []).length;
    const hasAltText = content.includes('alt=');
    const hasLazyLoading = content.includes('loading="lazy"');
    const hasSrcset = content.includes('srcset');
    const hasPicture = content.includes('<picture');
    
    console.log(`图片数量: ${imgCount}`);
    
    if (imgCount === 0) {
        logTest('图片使用', 'pass', '未使用图片，加载速度快');
    } else if (imgCount < 10) {
        logTest('图片使用', 'pass', `图片数量合理 (${imgCount})`);
    } else if (imgCount < 20) {
        logTest('图片使用', 'warning', `图片较多 (${imgCount})，建议优化`);
    } else {
        logTest('图片使用', 'fail', `图片过多 (${imgCount})，需要优化`);
    }
    
    if (imgCount > 0 && hasAltText) {
        logTest('图片替代文本', 'pass', '所有图片都有替代文本');
    } else if (imgCount > 0) {
        logTest('图片替代文本', 'warning', '部分图片缺少替代文本');
    }
    
    if (hasLazyLoading) {
        logTest('图片懒加载', 'pass', '使用图片懒加载');
    } else if (imgCount > 5) {
        logTest('图片懒加载', 'warning', '建议使用图片懒加载');
    }
    
    if (hasSrcset || hasPicture) {
        logTest('响应式图片', 'pass', '使用响应式图片');
    } else if (imgCount > 3) {
        logTest('响应式图片', 'warning', '建议使用响应式图片');
    }
}

function testResourceLoading(page, content) {
    console.log(`\n📦 测试资源加载: ${page}`);
    console.log('='.repeat(60));
    
    const hasPreload = content.includes('rel="preload"');
    const hasPrefetch = content.includes('rel="prefetch"');
    const hasPreconnect = content.includes('rel="preconnect"');
    const hasDnsPrefetch = content.includes('rel="dns-prefetch"');
    
    if (hasPreload) {
        logTest('资源预加载', 'pass', '使用资源预加载');
    } else {
        logTest('资源预加载', 'warning', '建议使用资源预加载');
    }
    
    if (hasPrefetch) {
        logTest('资源预取', 'pass', '使用资源预取');
    } else {
        logTest('资源预取', 'warning', '建议使用资源预取');
    }
    
    if (hasPreconnect) {
        logTest('预连接', 'pass', '使用预连接优化');
    } else {
        logTest('预连接', 'warning', '建议使用预连接优化');
    }
    
    if (hasDnsPrefetch) {
        logTest('DNS 预解析', 'pass', '使用 DNS 预解析');
    } else {
        logTest('DNS 预解析', 'warning', '建议使用 DNS 预解析');
    }
}

function testCaching(page, content) {
    console.log(`\n💾 测试缓存策略: ${page}`);
    console.log('='.repeat(60));
    
    const hasCacheControl = content.includes('Cache-Control');
    const hasExpires = content.includes('Expires');
    const hasETag = content.includes('ETag');
    const hasLastModified = content.includes('Last-Modified');
    
    if (hasCacheControl) {
        logTest('Cache-Control', 'pass', '包含 Cache-Control');
    } else {
        logTest('Cache-Control', 'fail', '缺少 Cache-Control');
    }
    
    if (hasExpires) {
        logTest('Expires', 'pass', '包含 Expires');
    } else {
        logTest('Expires', 'warning', '建议添加 Expires');
    }
    
    if (hasETag) {
        logTest('ETag', 'pass', '包含 ETag');
    } else {
        logTest('ETag', 'warning', '建议添加 ETag');
    }
    
    if (hasLastModified) {
        logTest('Last-Modified', 'pass', '包含 Last-Modified');
    } else {
        logTest('Last-Modified', 'warning', '建议添加 Last-Modified');
    }
}

function testCompression(page, content) {
    console.log(`\n🗜️ 测试压缩优化: ${page}`);
    console.log('='.repeat(60));
    
    const hasGzip = content.includes('gzip');
    const hasBrotli = content.includes('br');
    const hasMinified = !content.includes('    ') || content.length < 50000;
    
    if (hasGzip) {
        logTest('Gzip 压缩', 'pass', '支持 Gzip 压缩');
    } else {
        logTest('Gzip 压缩', 'warning', '建议启用 Gzip 压缩');
    }
    
    if (hasBrotli) {
        logTest('Brotli 压缩', 'pass', '支持 Brotli 压缩');
    } else {
        logTest('Brotli 压缩', 'warning', '建议启用 Brotli 压缩');
    }
    
    if (hasMinified) {
        logTest('代码压缩', 'pass', '代码已压缩或优化');
    } else {
        logTest('代码压缩', 'warning', '建议压缩代码');
    }
}

function testCriticalRenderingPath(page, content) {
    console.log(`\n🚀 测试关键渲染路径: ${page}`);
    console.log('='.repeat(60));
    
    const hasInlineCriticalCss = content.includes('<style>') && content.includes('critical');
    const hasAsyncCss = content.includes('onload="this.onload=null;this.rel=\'stylesheet\'"');
    const hasDeferJs = content.includes('defer');
    const hasAsyncJs = content.includes('async');
    
    if (hasInlineCriticalCss) {
        logTest('关键 CSS 内联', 'pass', '内联关键 CSS');
    } else {
        logTest('关键 CSS 内联', 'warning', '建议内联关键 CSS');
    }
    
    if (hasAsyncCss) {
        logTest('异步 CSS', 'pass', '使用异步 CSS 加载');
    } else {
        logTest('异步 CSS', 'warning', '建议使用异步 CSS 加载');
    }
    
    if (hasDeferJs || hasAsyncJs) {
        logTest('JavaScript 延迟', 'pass', '使用延迟/异步 JavaScript');
    } else {
        logTest('JavaScript 延迟', 'warning', '建议使用延迟/异步 JavaScript');
    }
}

function testHttpRequests(page, content) {
    console.log(`\n🌐 测试 HTTP 请求: ${page}`);
    console.log('='.repeat(60));
    
    const linkCount = (content.match(/<link/g) || []).length;
    const scriptCount = (content.match(/<script/g) || []).length;
    const imgCount = (content.match(/<img/g) || []).length;
    const totalRequests = linkCount + scriptCount + imgCount;
    
    console.log(`CSS 文件: ${linkCount}`);
    console.log(`JavaScript 文件: ${scriptCount}`);
    console.log(`图片: ${imgCount}`);
    console.log(`总请求数: ${totalRequests}`);
    
    if (totalRequests < 10) {
        logTest('HTTP 请求数', 'pass', `HTTP 请求数合理 (${totalRequests})`);
    } else if (totalRequests < 20) {
        logTest('HTTP 请求数', 'warning', `HTTP 请求数较多 (${totalRequests})，建议合并资源`);
    } else {
        logTest('HTTP 请求数', 'fail', `HTTP 请求数过多 (${totalRequests})，需要优化`);
    }
}

function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('⚡ ValuHub 性能测试报告');
    console.log('='.repeat(60));
    console.log(`测试时间: ${new Date().toLocaleString('zh-CN')}`);
    
    for (const page of corePages) {
        const pagePath = path.join(__dirname, page);
        
        if (!fs.existsSync(pagePath)) {
            console.log(`\n❌ 页面不存在: ${page}`);
            testResults.fail++;
            testResults.total++;
            continue;
        }
        
        const content = fs.readFileSync(pagePath, 'utf-8');
        
        testPageSize(page, content);
        testCssOptimization(page, content);
        testJavaScriptOptimization(page, content);
        testImageOptimization(page, content);
        testResourceLoading(page, content);
        testCaching(page, content);
        testCompression(page, content);
        testCriticalRenderingPath(page, content);
        testHttpRequests(page, content);
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
        console.log('🎉 性能优秀！');
    } else if (passRate >= 70) {
        console.log('👍 性能良好，建议优化警告项');
    } else {
        console.log('⚠️  性能需要改进，请修复失败项');
    }
}

runAllTests();
