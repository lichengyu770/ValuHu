// 修复页面加载时内容区域不显示的问题
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，尝试激活内容区域...');
    
    // 获取当前URL的hash值
    const hash = window.location.hash;
    
    // 获取所有内容区域
    const contentSections = document.querySelectorAll('.content-section');
    
    // 获取首页内容区域
    const homeSection = document.getElementById('home');
    
    if (hash) {
        // 如果有hash值，激活对应的内容区域
        const targetSection = document.querySelector(hash);
        if (targetSection) {
            // 移除所有内容区域的active类
            contentSections.forEach(section => section.classList.remove('active'));
            // 激活对应的内容区域
            targetSection.classList.add('active');
            console.log('已激活内容区域:', hash);
        } else {
            console.log('未找到目标区域:', hash, '，默认激活首页');
            // 未找到目标区域，默认激活首页
            if (homeSection) {
                homeSection.classList.add('active');
            }
        }
    } else {
        // 如果没有hash值，默认激活首页内容区域
        if (homeSection) {
            homeSection.classList.add('active');
            console.log('已激活首页内容区域');
        }
    }
});