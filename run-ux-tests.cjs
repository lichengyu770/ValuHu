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

function testNavigationFlow(page, content) {
    console.log(`\n🔗 测试页面导航: ${page}`);
    console.log('='.repeat(60));
    
    const hasIndexLink = content.includes('href="index.html"') || content.includes('href="/"');
    const hasSolutionsLink = content.includes('href="solutions.html"');
    const hasEcosystemLink = content.includes('href="ecosystem.html"');
    const hasResearchLink = content.includes('href="research.html"');
    const hasAcademyLink = content.includes('href="academy.html"');
    
    if (hasIndexLink) {
        logTest('首页链接', 'pass', '包含首页导航链接');
    } else {
        logTest('首页链接', 'warning', '缺少首页导航链接');
    }
    
    if (hasSolutionsLink) {
        logTest('解决方案链接', 'pass', '包含解决方案页导航链接');
    } else {
        logTest('解决方案链接', 'warning', '缺少解决方案页导航链接');
    }
    
    if (hasEcosystemLink) {
        logTest('生态合作链接', 'pass', '包含生态合作页导航链接');
    } else {
        logTest('生态合作链接', 'warning', '缺少生态合作页导航链接');
    }
    
    if (hasResearchLink) {
        logTest('数据研究链接', 'pass', '包含数据研究页导航链接');
    } else {
        logTest('数据研究链接', 'warning', '缺少数据研究页导航链接');
    }
    
    if (hasAcademyLink) {
        logTest('学院中心链接', 'pass', '包含学院中心页导航链接');
    } else {
        logTest('学院中心链接', 'warning', '缺少学院中心页导航链接');
    }
}

function testUserEntry(page, content) {
    console.log(`\n🎯 测试用户入口: ${page}`);
    console.log('='.repeat(60));
    
    const hasPersonalEntry = content.includes('个人用户') || content.includes('我是个人用户');
    const hasGovernmentEntry = content.includes('政府人员') || content.includes('我是政府人员');
    const hasEnterpriseEntry = content.includes('企业客户') || content.includes('我是企业客户');
    const hasAcademyEntry = content.includes('院校师生') || content.includes('我是院校师生');
    
    if (hasPersonalEntry) {
        logTest('个人用户入口', 'pass', '包含个人用户入口');
    } else {
        logTest('个人用户入口', 'warning', '缺少个人用户入口');
    }
    
    if (hasGovernmentEntry) {
        logTest('政府人员入口', 'pass', '包含政府人员入口');
    } else {
        logTest('政府人员入口', 'warning', '缺少政府人员入口');
    }
    
    if (hasEnterpriseEntry) {
        logTest('企业客户入口', 'pass', '包含企业客户入口');
    } else {
        logTest('企业客户入口', 'warning', '缺少企业客户入口');
    }
    
    if (hasAcademyEntry) {
        logTest('院校师生入口', 'pass', '包含院校师生入口');
    } else {
        logTest('院校师生入口', 'warning', '缺少院校师生入口');
    }
}

function testCallToAction(page, content) {
    console.log(`\n📢 测试行动号召: ${page}`);
    console.log('='.repeat(60));
    
    const hasPrimaryButton = content.includes('btn-primary') || content.includes('开始评估') || content.includes('立即体验');
    const hasSecondaryButton = content.includes('btn-secondary') || content.includes('了解更多') || content.includes('查看详情');
    const hasContactLink = content.includes('contact.html') || content.includes('联系我们');
    
    if (hasPrimaryButton) {
        logTest('主要行动按钮', 'pass', '包含主要行动按钮');
    } else {
        logTest('主要行动按钮', 'warning', '缺少主要行动按钮');
    }
    
    if (hasSecondaryButton) {
        logTest('次要行动按钮', 'pass', '包含次要行动按钮');
    } else {
        logTest('次要行动按钮', 'warning', '缺少次要行动按钮');
    }
    
    if (hasContactLink) {
        logTest('联系链接', 'pass', '包含联系链接');
    } else {
        logTest('联系链接', 'warning', '缺少联系链接');
    }
}

function testContentHierarchy(page, content) {
    console.log(`\n📝 测试内容层次: ${page}`);
    console.log('='.repeat(60));
    
    const hasH1 = content.includes('<h1');
    const hasH2 = content.includes('<h2');
    const hasH3 = content.includes('<h3');
    const hasProperHeadingOrder = content.indexOf('<h1') < content.indexOf('<h2');
    
    if (hasH1) {
        logTest('H1 标题', 'pass', '包含 H1 标题');
    } else {
        logTest('H1 标题', 'fail', '缺少 H1 标题');
    }
    
    if (hasH2) {
        logTest('H2 标题', 'pass', '包含 H2 标题');
    } else {
        logTest('H2 标题', 'warning', '缺少 H2 标题');
    }
    
    if (hasH3) {
        logTest('H3 标题', 'pass', '包含 H3 标题');
    } else {
        logTest('H3 标题', 'warning', '缺少 H3 标题');
    }
    
    if (hasProperHeadingOrder) {
        logTest('标题层次', 'pass', '标题层次结构正确');
    } else {
        logTest('标题层次', 'warning', '标题层次结构可能不正确');
    }
}

function testAccessibility(page, content) {
    console.log(`\n♿ 测试可访问性: ${page}`);
    console.log('='.repeat(60));
    
    const hasAltText = content.includes('alt=');
    const hasAriaLabels = content.includes('aria-');
    const hasLangAttribute = content.includes('lang=');
    const hasSemanticHtml = content.includes('<nav') || content.includes('<main') || content.includes('<footer');
    
    if (hasAltText) {
        logTest('图片替代文本', 'pass', '包含图片替代文本');
    } else {
        logTest('图片替代文本', 'warning', '可能缺少图片替代文本');
    }
    
    if (hasAriaLabels) {
        logTest('ARIA 标签', 'pass', '包含 ARIA 标签');
    } else {
        logTest('ARIA 标签', 'warning', '缺少 ARIA 标签');
    }
    
    if (hasLangAttribute) {
        logTest('语言属性', 'pass', '包含语言属性');
    } else {
        logTest('语言属性', 'fail', '缺少语言属性');
    }
    
    if (hasSemanticHtml) {
        logTest('语义化 HTML', 'pass', '使用语义化 HTML 标签');
    } else {
        logTest('语义化 HTML', 'warning', '建议使用语义化 HTML 标签');
    }
}

function testMobileExperience(page, content) {
    console.log(`\n📱 测试移动端体验: ${page}`);
    console.log('='.repeat(60));
    
    const hasViewport = content.includes('viewport');
    const hasTouchOptimized = content.includes('touch-action') || content.includes('-webkit-tap-highlight');
    const hasResponsiveImages = content.includes('srcset') || content.includes('picture');
    const hasMobileMenu = content.includes('mobile') || content.includes('hamburger') || content.includes('menu-toggle');
    
    if (hasViewport) {
        logTest('移动端视口', 'pass', '包含移动端视口设置');
    } else {
        logTest('移动端视口', 'fail', '缺少移动端视口设置');
    }
    
    if (hasTouchOptimized) {
        logTest('触摸优化', 'pass', '包含触摸优化设置');
    } else {
        logTest('触摸优化', 'warning', '缺少触摸优化设置');
    }
    
    if (hasResponsiveImages) {
        logTest('响应式图片', 'pass', '使用响应式图片');
    } else {
        logTest('响应式图片', 'warning', '建议使用响应式图片');
    }
    
    if (hasMobileMenu) {
        logTest('移动端菜单', 'pass', '包含移动端菜单');
    } else {
        logTest('移动端菜单', 'warning', '可能缺少移动端菜单');
    }
}

function testLoadingExperience(page, content) {
    console.log(`\n⚡ 测试加载体验: ${page}`);
    console.log('='.repeat(60));
    
    const hasLoadingIndicator = content.includes('loading') || content.includes('spinner') || content.includes('skeleton');
    const hasLazyLoading = content.includes('loading="lazy"') || content.includes('lazyload');
    const hasCriticalCSS = content.includes('critical') || content.includes('inline');
    const hasProgressiveEnhancement = content.includes('noscript');
    
    if (hasLoadingIndicator) {
        logTest('加载指示器', 'pass', '包含加载指示器');
    } else {
        logTest('加载指示器', 'warning', '建议添加加载指示器');
    }
    
    if (hasLazyLoading) {
        logTest('懒加载', 'pass', '使用懒加载优化');
    } else {
        logTest('懒加载', 'warning', '建议使用懒加载');
    }
    
    if (hasCriticalCSS) {
        logTest('关键 CSS', 'pass', '使用关键 CSS 优化');
    } else {
        logTest('关键 CSS', 'warning', '建议使用关键 CSS 优化');
    }
    
    if (hasProgressiveEnhancement) {
        logTest('渐进增强', 'pass', '使用渐进增强');
    } else {
        logTest('渐进增强', 'warning', '建议使用渐进增强');
    }
}

function testErrorHandling(page, content) {
    console.log(`\n🛡️ 测试错误处理: ${page}`);
    console.log('='.repeat(60));
    
    const hasErrorPage = content.includes('404') || content.includes('error');
    const hasFormValidation = content.includes('required') || content.includes('pattern') || content.includes('minlength');
    const hasFeedbackMessages = content.includes('error') || content.includes('success') || content.includes('warning');
    
    if (hasErrorPage) {
        logTest('错误页面链接', 'pass', '包含错误页面链接');
    } else {
        logTest('错误页面链接', 'warning', '建议添加错误页面链接');
    }
    
    if (hasFormValidation) {
        logTest('表单验证', 'pass', '包含表单验证');
    } else {
        logTest('表单验证', 'warning', '建议添加表单验证');
    }
    
    if (hasFeedbackMessages) {
        logTest('反馈消息', 'pass', '包含反馈消息');
    } else {
        logTest('反馈消息', 'warning', '建议添加反馈消息');
    }
}

function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ValuHub 用户体验测试报告');
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
        
        testNavigationFlow(page, content);
        testUserEntry(page, content);
        testCallToAction(page, content);
        testContentHierarchy(page, content);
        testAccessibility(page, content);
        testMobileExperience(page, content);
        testLoadingExperience(page, content);
        testErrorHandling(page, content);
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
        console.log('🎉 用户体验优秀！');
    } else if (passRate >= 70) {
        console.log('👍 用户体验良好，建议优化警告项');
    } else {
        console.log('⚠️  用户体验需要改进，请修复失败项');
    }
}

runAllTests();
