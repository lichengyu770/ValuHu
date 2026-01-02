// 页面加载动画
function initPageLoadAnimation() {
    // 为所有需要渐入的元素添加类
    const elements = document.querySelectorAll('.stat-card, .nav-module, .feature-card, .building, .puzzle-card');
    
    elements.forEach((element, index) => {
        // 初始状态：透明且向下偏移
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        
        // 监听元素进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 元素进入视口时显示
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(element);
    });
}

// 侧边栏子菜单折叠/展开功能
function initSidebarMenu() {
    // 查找所有带有子菜单的菜单项
    const parentMenuItems = document.querySelectorAll('.nav-item, .sub-nav-item');
    
    parentMenuItems.forEach(item => {
        // 检查是否有子菜单
        const subMenu = item.querySelector('.sub-menu');
        if (subMenu) {
            // 添加点击事件
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // 切换子菜单显示/隐藏
                subMenu.classList.toggle('hidden');
                
                // 添加箭头旋转效果
                const arrow = item.querySelector('.arrow');
                if (arrow) {
                    arrow.classList.toggle('rotate-180');
                }
            });
        }
    });
}

// 关键指标卡片轮播效果
function initCardCarousel() {
    // 查找所有统计卡片容器
    const cardContainers = document.querySelectorAll('.stats-grid, .stats-section');
    
    cardContainers.forEach(container => {
        const cards = container.querySelectorAll('.stat-card');
        if (cards.length <= 4) return; // 如果卡片数量不超过4个，不需要轮播
        
        // 添加左右箭头
        const leftArrow = document.createElement('button');
        leftArrow.innerHTML = '‹';
        leftArrow.className = 'carousel-arrow carousel-arrow-left';
        leftArrow.style.cssText = `
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;
        
        const rightArrow = document.createElement('button');
        rightArrow.innerHTML = '›';
        rightArrow.className = 'carousel-arrow carousel-arrow-right';
        rightArrow.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.9);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        `;
        
        // 设置容器为相对定位
        container.style.position = 'relative';
        
        // 添加箭头到容器
        container.appendChild(leftArrow);
        container.appendChild(rightArrow);
        
        // 轮播逻辑
        let currentIndex = 0;
        const cardsPerView = 4;
        const totalCards = cards.length;
        
        // 初始隐藏超出显示数量的卡片
        function updateCardsVisibility() {
            cards.forEach((card, index) => {
                if (index >= currentIndex && index < currentIndex + cardsPerView) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // 初始化卡片可见性
        updateCardsVisibility();
        
        // 左右箭头点击事件
        rightArrow.addEventListener('click', () => {
            if (currentIndex < totalCards - cardsPerView) {
                currentIndex++;
                updateCardsVisibility();
            }
        });
        
        leftArrow.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCardsVisibility();
            }
        });
    });
}

// 进度条加载动画
function initProgressBars() {
    // 查找所有进度条
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
        // 获取目标百分比
        const targetPercent = parseInt(bar.getAttribute('data-percent') || bar.style.width) || 0;
        
        // 初始状态
        bar.style.width = '0%';
        
        // 监听元素进入视口
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 开始动画
                    bar.style.transition = 'width 1.5s ease-out';
                    bar.style.width = targetPercent + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(bar);
    });
}

// 添加全局交互样式
function initGlobalInteractionStyles() {
    // 为所有可点击元素添加悬停和点击效果
    const clickableElements = document.querySelectorAll('button, a, .nav-module, .stat-card, .feature-card, .building, .puzzle-card, .campus-building');
    
    clickableElements.forEach(element => {
        // 添加过渡效果
        element.style.transition = 'all 0.3s ease';
        
        // 悬停效果
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-2px)';
            element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
            element.style.boxShadow = '';
        });
        
        // 点击效果
        element.addEventListener('mousedown', () => {
            element.style.transform = 'translateY(0)';
        });
    });
}

// 初始化所有交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 页面加载动画
    initPageLoadAnimation();
    
    // 侧边栏菜单
    initSidebarMenu();
    
    // 卡片轮播
    initCardCarousel();
    
    // 进度条动画
    initProgressBars();
    
    // 全局交互样式
    initGlobalInteractionStyles();
    
    // 其他特定页面的初始化逻辑
    
    // 数字校园建筑交互增强
    const buildings = document.querySelectorAll('.campus-building, .building');
    buildings.forEach(building => {
        building.addEventListener('click', () => {
            // 添加点击反馈
            building.style.transform = 'scale(0.95)';
            setTimeout(() => {
                building.style.transform = '';
            }, 150);
        });
    });
    
    // 拼图卡片交互增强
    const puzzleCards = document.querySelectorAll('.puzzle-card');
    puzzleCards.forEach(card => {
        card.addEventListener('click', () => {
            // 添加点击反馈
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            
            // 解锁效果
            const unlockedBadge = card.querySelector('.unlocked-badge');
            if (unlockedBadge) {
                unlockedBadge.style.opacity = '1';
            }
        });
    });
});
