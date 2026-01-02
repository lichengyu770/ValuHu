

        // 高级搜索页面功能增强
        document.addEventListener('DOMContentLoaded', function() {
            // 用户操作日志记录函数
            function logUserAction(actionType, actionDetails) {
                console.log(`用户操作: [${actionType}] ${actionDetails}`);
                // 实际项目中这里可以发送请求到后端记录操作日志
            }
            
            // 筛选面板切�?            const filterToggle = document.getElementById('filterToggle');
            const filterPanel = document.getElementById('filterPanel');
            
            if (filterToggle && filterPanel) {
                filterToggle.addEventListener('click', function() {
                    filterPanel.classList.toggle('show');
                    logUserAction('筛选面�?, '筛选面�? + (filterPanel.classList.contains('show') ? '展开' : '收起'));
                });
            }
            
            // 价格范围滑块
            const priceRange = document.getElementById('priceRange');
            const priceValue = document.getElementById('priceValue');
            
            if (priceRange && priceValue) {
                priceRange.addEventListener('input', function() {
                    const value = this.value;
                    priceValue.textContent = `¥${value}万`;
                });
            }
            
            // 面积范围滑块
            const areaRange = document.getElementById('areaRange');
            const areaValue = document.getElementById('areaValue');
            
            if (areaRange && areaValue) {
                areaRange.addEventListener('input', function() {
                    const value = this.value;
                    areaValue.textContent = `${value}㎡`;
                });
            }
            
            // 初始化城市选择�?            const citySelector = initCitySelector('citySelect', 'districtSelect', 'subdistrictSelect', 'communitySelect');
            
            // 应用筛选按钮事�?            const applyFiltersBtn = document.getElementById('applyFilters');
            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', function() {
                    logUserAction('应用筛�?, '用户点击了应用筛选按�?);
                    // 这里可以添加筛选逻辑
                });
            }
            
            // 重置筛选按钮事�?            const resetFiltersBtn = document.getElementById('resetFilters');
            if (resetFiltersBtn) {
                resetFiltersBtn.addEventListener('click', function() {
                    logUserAction('重置筛�?, '用户点击了重置筛选按�?);
                    // 重置所有筛选条�?                    // 清空城市选择�?                    document.getElementById('citySelect').value = '';
                    document.getElementById('districtSelect').value = '';
                    document.getElementById('subdistrictSelect').value = '';
                    document.getElementById('communitySelect').value = '';
                });
            }
            
            // 加载初始房源数据
            function loadInitialProperties() {
                logUserAction('加载房源', '页面初始加载房源数据');
                // 这里可以调用后端API获取房源数据
                // 目前使用模拟数据
                console.log('加载初始房源数据...');
            }
            
            // 初始化连接点功能
            if (window.connectionPoint) {
                window.connectionPoint.init();
            }
            
            // 页面加载时初始化渲染所有房�?            loadInitialProperties();
        });
    

        // 初始化返回顶部按�?        document.addEventListener('DOMContentLoaded', function() {
            const backToTopBtn = document.getElementById('backToTop');
            
            if (backToTopBtn) {
                // 滚动事件处理
                window.addEventListener('scroll', function() {
                    if (window.scrollY > 300) {
                        backToTopBtn.classList.add('show');
                    } else {
                        backToTopBtn.classList.remove('show');
                    }
                });
                
                // 点击事件处理
                backToTopBtn.addEventListener('click', function() {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        });
    

