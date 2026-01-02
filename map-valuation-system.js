// Map Valuation System - Comprehensive Implementation
// API Keys: cc6cc650f37f17fa1c76e2607935a1a9 (Key), 8fa11b2815f42423c371b6796d2e7f5a (Security Key)

// ---------------------------
// 1. Data Processing Module
// ---------------------------
class DataProcessor {
    constructor() {
        this.rawData = [];
        this.processedData = [];
        this.districts = new Set();
        this.communityData = {};
        this.csvFiles = [
            '九华经开区.csv',
            '岳塘区.csv',
            '昭山示范区.csv',
            '湘潭县.csv',
            '雨湖区.csv'
        ];
    }

    // Process all CSV files
    async processAllCSVFiles() {
        console.log('开始处理所有CSV文件...');
        
        // Clear existing data
        this.rawData = [];
        this.processedData = [];
        this.districts.clear();
        this.communityData = {};
        
        // Process each CSV file
        for (const fileName of this.csvFiles) {
            await this.processCSVFile(fileName);
        }
        
        this.aggregateCommunityData();
        this.calculateStatistics();
        
        console.log('Data processing completed. Total communities:', Object.keys(this.communityData).length);
        console.log('Total districts:', this.districts.size);
        console.log('Total properties:', this.processedData.length);
        
        return this.processedData;
    }

    // Process a single CSV file
    async processCSVFile(fileName) {
        console.log(`正在处理文件: ${fileName}`);
        
        try {
            // Read CSV file content
            const csvContent = await this.readCSVFile(fileName);
            
            // Parse CSV content to JSON
            const records = this.parseCSV(csvContent);
            
            // Extract district name from fileName
            const district = fileName.replace('.csv', '');
            
            // Process each record
            records.forEach(record => {
                this.rawData.push(record);
                
                // Extract district and subdistrict
                let mainDistrict = district;
                let subDistrict = district;
                
                if (record['所在区域']) {
                    const areaParts = record['所在区域'].split('-');
                    mainDistrict = areaParts[0] || district;
                    subDistrict = areaParts[1] || mainDistrict;
                }
                
                this.districts.add(mainDistrict);
                
                // Create structured record
                const structuredRecord = this.createStructuredRecord(record, mainDistrict, subDistrict);
                
                if (structuredRecord) {
                    this.processedData.push(structuredRecord);
                }
            });
            
            console.log(`文件 ${fileName} 处理完成，共 ${records.length} 条记录`);
        } catch (error) {
            console.error(`处理文件 ${fileName} 时出错:`, error);
        }
    }

    // Read CSV file
    async readCSVFile(fileName) {
        // In a browser environment, we would use fetch API
        // For local development, we can use a simple file read function
        // Note: This function will need to be adapted based on the actual deployment environment
        
        // For now, we'll use a mock implementation that reads from sample data
        // In production, this should be replaced with actual file reading logic
        return this.getSampleCSVContent(fileName);
    }

    // Parse CSV content to JSON
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) return [];
        
        // Extract headers
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Parse records
        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const record = {};
                headers.forEach((header, index) => {
                    record[header] = values[index].trim();
                });
                records.push(record);
            }
        }
        
        return records;
    }

    // Parse a single CSV line, handling commas within quotes
    parseCSVLine(line) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        values.push(currentValue);
        return values;
    }

    // Create structured record from raw CSV data
    createStructuredRecord(record, mainDistrict, subDistrict) {
        // Skip records with missing required fields
        if (!record['小区名称'] || !record['建筑面积(㎡)'] || !record['成交单价(元/㎡)']) {
            return null;
        }
        
        // Extract and clean data
        const area = parseFloat(record['建筑面积(㎡)'].replace(/[^\d.]/g, ''));
        const unitPrice = parseFloat(record['成交单价(元/㎡)'].replace(/[^\d.]/g, ''));
        
        // Skip records with invalid numeric values
        if (isNaN(area) || isNaN(unitPrice)) {
            return null;
        }
        
        return {
            id: `${mainDistrict}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            community: record['小区名称'].trim(),
            area: area,
            layout: record['户型'] ? record['户型'].trim() : '未知',
            district: mainDistrict,
            subDistrict: subDistrict,
            decoration: record['装修情况'] ? record['装修情况'].trim() : '未知',
            unitPrice: unitPrice,
            totalPrice: area * unitPrice,
            coordinates: this.generateCoordinates(mainDistrict, subDistrict),
            timestamp: new Date().toISOString()
        };
    }

    // Generate coordinates for properties (based on district and subdistrict)
    generateCoordinates(district, subDistrict) {
        // Base coordinates for Xiangtan city
        const baseLat = 27.82;
        const baseLng = 112.93;
        
        // Generate random offsets based on district
        const districtOffset = {
            '雨湖区': { lat: 0.02, lng: -0.03 },
            '岳塘区': { lat: -0.01, lng: 0.02 },
            '湘潭县': { lat: 0.05, lng: -0.05 },
            '九华经开区': { lat: -0.03, lng: -0.02 },
            '昭山示范区': { lat: -0.02, lng: 0.05 }
        };
        
        const offset = districtOffset[district] || { lat: 0, lng: 0 };
        
        // Add random variation for different subdistricts
        const subDistrictVariation = {
            '中心区': { lat: 0.01, lng: 0.01 },
            '郊区': { lat: -0.01, lng: -0.01 },
            '新城区': { lat: 0.005, lng: 0.005 },
            '老城区': { lat: -0.005, lng: 0.005 }
        };
        
        const variation = subDistrictVariation[subDistrict] || {
            lat: (Math.random() - 0.5) * 0.02,
            lng: (Math.random() - 0.5) * 0.02
        };
        
        // Calculate final coordinates with random noise
        const lat = baseLat + offset.lat + variation.lat + (Math.random() - 0.5) * 0.01;
        const lng = baseLng + offset.lng + variation.lng + (Math.random() - 0.5) * 0.01;
        
        return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
    }

    // Get sample CSV content (for development/testing)
    getSampleCSVContent(fileName) {
        // Sample CSV content based on the observed file format
        const sampleContent = `小区名称,建筑面积(㎡),户型,所在区域,装修情况,成交单价(元/㎡)
${fileName.replace('.csv', '')}示范小区1,86.8,3室1厅,${fileName.replace('.csv', '')}-中心区,简装,6500
${fileName.replace('.csv', '')}示范小区1,120.4,4室2厅,${fileName.replace('.csv', '')}-中心区,精装,7300
${fileName.replace('.csv', '')}示范小区2,79.5,2室1厅,${fileName.replace('.csv', '')}-郊区,毛坯,5700
${fileName.replace('.csv', '')}示范小区2,98.2,3室2厅,${fileName.replace('.csv', '')}-郊区,简装,6300
${fileName.replace('.csv', '')}示范小区3,105.6,3室2厅,${fileName.replace('.csv', '')}-新城区,精装,7100
${fileName.replace('.csv', '')}花园小区,92.3,3室1厅,${fileName.replace('.csv', '')}-老城区,简装,6800
${fileName.replace('.csv', '')}幸福家园,115.8,4室2厅,${fileName.replace('.csv', '')}-新城区,精装,7500
${fileName.replace('.csv', '')}阳光小区,75.2,2室1厅,${fileName.replace('.csv', '')}-郊区,毛坯,5500
${fileName.replace('.csv', '')}明月小区,132.5,5室2厅,${fileName.replace('.csv', '')}-中心区,豪华装修,8200
${fileName.replace('.csv', '')}和平小区,88.9,3室1厅,${fileName.replace('.csv', '')}-老城区,简装,6600`;
        
        return sampleContent;
    }

    // Aggregate data by community
    aggregateCommunityData() {
        this.processedData.forEach(property => {
            if (!this.communityData[property.community]) {
                this.communityData[property.community] = {
                    name: property.community,
                    district: property.district,
                    subDistrict: property.subDistrict,
                    properties: [],
                    avgPrice: 0,
                    totalProperties: 0,
                    minPrice: Infinity,
                    maxPrice: -Infinity,
                    coordinates: property.coordinates
                };
            }
            
            this.communityData[property.community].properties.push(property);
        });
    }

    // Calculate statistics
    calculateStatistics() {
        Object.values(this.communityData).forEach(community => {
            const prices = community.properties.map(p => p.unitPrice);
            community.avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            community.totalProperties = community.properties.length;
            community.minPrice = Math.min(...prices);
            community.maxPrice = Math.max(...prices);
        });
    }

    // Get data by district
    getDataByDistrict(district) {
        return this.processedData.filter(item => item.district === district);
    }

    // Get data by community
    getDataByCommunity(communityName) {
        return this.communityData[communityName] || null;
    }

    // Get all community names
    getAllCommunityNames() {
        return Object.keys(this.communityData);
    }

    // Search properties by keywords
    searchProperties(keywords) {
        return this.processedData.filter(item => 
            item.community.includes(keywords) ||
            item.district.includes(keywords) ||
            item.subDistrict.includes(keywords)
        );
    }
}

// ---------------------------
// 2. Map Core Module
// ---------------------------
class MapCore {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polygons = [];
        this.currentLayer = 'default';
        this.apiKey = 'cc6cc650f37f17fa1c76e2607935a1a9';
        this.securityKey = '8fa11b2815f42423c371b6796d2e7f5a';
        this.userType = 'public'; // Default user type
        
        // Map configuration
        this.config = {
            center: { lat: 27.82, lng: 112.93 }, // Xiangtan city center
            zoom: 12,
            minZoom: 10,
            maxZoom: 18,
            mapStyle: 'standard'
        };
    }

    // Initialize map
    async initMap(containerId, userType = 'public') {
        this.userType = userType;
        
        try {
            // Set security key for AMap
            window._AMapSecurityConfig = {
                securityJsCode: this.securityKey
            };
            
            // Load map script with API key
            await this.loadMapScript();
            
            // Initialize map instance
            this.map = new AMap.Map(containerId, {
                center: [this.config.center.lng, this.config.center.lat],
                zoom: this.config.zoom,
                minZoom: this.config.minZoom,
                maxZoom: this.config.maxZoom,
                mapStyle: 'amap://styles/normal',
                resizeEnable: true,
                zoomEnable: true,
                dragEnable: true
            });
            
            // Enable map controls based on user type
            this.enableMapControls();
            
            // Set map style
            this.setMapStyle(this.config.mapStyle);
            
            // Add event listeners
            this.addMapEventListeners();
            
            console.log(`Map initialized successfully for ${this.getUserTypeName()} user.`);
            
            return this.map;
        } catch (error) {
            console.error('Map initialization failed:', error);
            throw error;
        }
    }

    // Load map script
    async loadMapScript() {
        return new Promise((resolve, reject) => {
            // Check if map script is already loaded
            if (window.AMap) {
                resolve();
                return;
            }
            
            // Create script element
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${this.apiKey}&callback=initMap`;
            script.onerror = reject;
            
            // Set global callback
            window.initMap = () => {
                resolve();
                delete window.initMap;
            };
            
            document.head.appendChild(script);
        });
    }

    // Enable map controls based on user type
    enableMapControls() {
        // Base controls for all users are enabled by default in AMap
        
        // Add scale control
        this.map.addControl(new AMap.Scale());
        
        // Add zoom control
        this.map.addControl(new AMap.ToolBar());
        
        // Add map type control
        this.map.addControl(new AMap.MapType({ 
            defaultType: 0, // 0: standard map, 1: satellite, 2: satellite with labels
            showRoad: true 
        }));
        
        // User-specific controls
        switch (this.userType) {
            case 'institution': // 院校端
                this.addInstitutionControls();
                break;
            case 'government': // 政府端
                this.addGovernmentControls();
                break;
            case 'public': // 大众端
                this.addPublicControls();
                break;
            case 'enterprise': // 企业端
                this.addEnterpriseControls();
                break;
            case 'association': // 协会端
                this.addAssociationControls();
                break;
        }
    }

    // Add institution-specific controls
    addInstitutionControls() {
        // Add drawing control for academic research
        // AMap DrawingManager needs to be loaded separately
        this.loadAMapPlugin('AMap.MouseTool', () => {
            const mouseTool = new AMap.MouseTool(this.map);
            // Drawing control will be added in the UI layer
        });
        
        // Add heatmap control for data visualization
        this.addHeatmapControl();
    }

    // Add government-specific controls
    addGovernmentControls() {
        // Add administrative division control
        this.loadAMapPlugin('AMap.DistrictSearch', () => {
            const districtSearch = new AMap.DistrictSearch({
                level: 'district',
                showbiz: false
            });
            // District search functionality will be integrated in the UI
        });
        
        // Add statistical overlay control
        this.addStatisticalOverlay();
        
        // Add policy layer control
        this.addPolicyLayerControl();
    }

    // Add public-specific controls
    addPublicControls() {
        // Add POI search control
        this.loadAMapPlugin(['AMap.PlaceSearch', 'AMap.Autocomplete'], () => {
            // Search functionality will be implemented in the UI layer
        });
        
        // Add traffic control
        this.loadAMapPlugin('AMap.Traffic', () => {
            this.map.addControl(new AMap.Traffic());
        });
    }

    // Add enterprise-specific controls
    addEnterpriseControls() {
        // Add custom overlay for business analysis
        this.addBusinessAnalysisOverlay();
        
        // Add data export control
        this.addDataExportControl();
        
        // Add market analysis tools
        this.addMarketAnalysisTools();
    }

    // Add association-specific controls
    addAssociationControls() {
        // Add member location overlay
        this.addMemberLocationOverlay();
        
        // Add industry statistics control
        this.addIndustryStatsControl();
    }
    
    // Load AMap plugin
    loadAMapPlugin(plugins, callback) {
        AMap.plugin(plugins, callback);
    }

    // ---------------------------
    // 地图核心功能扩展
    // ---------------------------
    
    // POI搜索功能
    searchPOI(keyword, city = '湘潭', callback) {
        this.loadAMapPlugin('AMap.PlaceSearch', () => {
            const placeSearch = new AMap.PlaceSearch({
                city: city,
                pageSize: 10,
                pageIndex: 1,
                extensions: 'base' // base: basic info, all: detailed info
            });
            
            placeSearch.search(keyword, (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    callback(null, result.poiList.pois);
                } else {
                    callback(new Error(`POI搜索失败: ${result.info}`), null);
                }
            });
        });
    }
    
    // 定位功能
    getCurrentLocation(callback) {
        this.loadAMapPlugin('AMap.Geolocation', () => {
            const geolocation = new AMap.Geolocation({
                enableHighAccuracy: true, // 是否使用高精度定位
                timeout: 10000, // 超时时间
                buttonOffset: new AMap.Pixel(10, 20), // 定位按钮偏移量
                zoomToAccuracy: true // 定位成功后是否自动调整地图视野
            });
            
            geolocation.getCurrentPosition((status, result) => {
                if (status === 'complete' && result.info === 'SUCCESS') {
                    callback(null, result.position);
                } else {
                    callback(new Error(`定位失败: ${result.info}`), null);
                }
            });
        });
    }
    
    // 路径规划功能
    planRoute(start, end, mode = 'car', callback) {
        // mode: car, bus, walk, ride
        const pluginMap = {
            'car': 'AMap.Driving',
            'bus': 'AMap.Transfer',
            'walk': 'AMap.Walking',
            'ride': 'AMap.Riding'
        };
        
        const plugin = pluginMap[mode];
        if (!plugin) {
            callback(new Error('不支持的出行方式'), null);
            return;
        }
        
        this.loadAMapPlugin(plugin, () => {
            let routePlan;
            
            switch (mode) {
                case 'car':
                    routePlan = new AMap.Driving({
                        policy: AMap.DrivingPolicy.LEAST_TIME,
                        map: this.map,
                        panel: 'route-panel', // 可以指定一个DOM元素来显示路径详情
                        hideMarkers: false
                    });
                    break;
                case 'bus':
                    routePlan = new AMap.Transfer({
                        city: '湘潭',
                        policy: AMap.TransferPolicy.LEAST_TIME,
                        map: this.map,
                        panel: 'route-panel'
                    });
                    break;
                case 'walk':
                    routePlan = new AMap.Walking({
                        map: this.map,
                        panel: 'route-panel'
                    });
                    break;
                case 'ride':
                    routePlan = new AMap.Riding({
                        map: this.map,
                        panel: 'route-panel'
                    });
                    break;
            }
            
            routePlan.search(start, end, (status, result) => {
                if (status === 'complete' && result.info === 'OK') {
                    // 可视化展示路径
                    this.visualizeRoute(result.routes[0], mode);
                    // 分析路径详细信息
                    const routeInfo = this.analyzeRoute(result.routes[0], mode);
                    callback(null, routeInfo);
                } else {
                    callback(new Error(`路径规划失败: ${result.info}`), null);
                }
            });
        });
    }
    
    // 路径可视化展示
    visualizeRoute(route, mode) {
        // 清除之前的路径
        if (this.currentRoute) {
            this.map.remove(this.currentRoute);
        }
        
        // 不同交通方式的颜色配置
        const colorMap = {
            'car': '#1890ff',
            'bus': '#52c41a',
            'walk': '#faad14',
            'ride': '#722ed1'
        };
        
        const color = colorMap[mode] || '#1890ff';
        
        // 创建路径线
        if (route.steps) {
            // 处理驾车、步行、骑行路径
            const path = [];
            route.steps.forEach(step => {
                if (step.path) {
                    // 驾车路径
                    step.path.forEach(point => {
                        path.push(point);
                    });
                } else if (step.polyline) {
                    // 公交路径
                    const polyline = step.polyline.split(';').map(p => p.split(',').map(Number));
                    polyline.forEach(point => {
                        path.push(point);
                    });
                }
            });
            
            // 创建路径图层
            this.currentRoute = new AMap.Polyline({
                path: path,
                strokeColor: color,
                strokeWeight: 6,
                strokeOpacity: 0.8,
                lineJoin: 'round'
            });
            
            this.map.add(this.currentRoute);
            
            // 调整地图视野以显示整个路径
            this.map.setFitView([this.currentRoute]);
        }
    }
    
    // 分析路径详细信息
    analyzeRoute(route, mode) {
        // 基本信息
        const basicInfo = {
            distance: route.distance || 0, // 总距离（米）
            duration: route.duration || 0, // 总时间（秒）
            steps: route.steps || [], // 路径步骤
            mode: mode
        };
        
        // 计算费用（仅驾车）
        let cost = 0;
        if (mode === 'car') {
            // 简单的费用计算：油耗 + 过路费
            const fuelCost = (basicInfo.distance / 1000) * 8 * 7; // 假设油耗8升/100公里，油价7元/升
            const tollCost = (basicInfo.distance / 1000) * 0.5; // 假设过路费0.5元/公里
            cost = fuelCost + tollCost;
        }
        
        // 详细分析
        const detailedInfo = {
            totalDistance: this.formatDistance(basicInfo.distance),
            totalTime: this.formatTime(basicInfo.duration),
            estimatedCost: cost > 0 ? `¥${cost.toFixed(2)}` : '免费',
            stepCount: basicInfo.steps.length,
            averageSpeed: basicInfo.duration > 0 ? `${(basicInfo.distance / basicInfo.duration * 3.6).toFixed(1)} km/h` : '0 km/h',
            mode: this.getModeName(mode)
        };
        
        return {
            basic: basicInfo,
            detailed: detailedInfo,
            original: route
        };
    }
    
    // 多种路径对比分析
    compareRoutes(routes, mode) {
        if (!routes || routes.length < 2) {
            console.error('至少需要两条路径进行对比');
            return;
        }
        
        const comparisonData = routes.map((route, index) => {
            const analysis = this.analyzeRoute(route, mode);
            return {
                id: index + 1,
                analysis: analysis
            };
        });
        
        // 显示对比结果
        this.showRouteComparison(comparisonData);
        
        return comparisonData;
    }
    
    // 显示路径对比结果
    showRouteComparison(comparisonData) {
        let content = `
            <div style="width: 400px; padding: 15px;">
                <h3 style="margin: 0 0 15px 0; color: #333;">路径对比分析</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f0f2f5;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #e8e8e8;">指标</th>
        `;
        
        // 添加路径列
        comparisonData.forEach(item => {
            content += `<th style="padding: 10px; text-align: left; border: 1px solid #e8e8e8;">路径${item.id}</th>`;
        });
        
        content += `
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">交通方式</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.mode}</td>`;
        });
        
        content += `
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">总距离</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.totalDistance}</td>`;
        });
        
        content += `
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">总时间</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.totalTime}</td>`;
        });
        
        content += `
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">预计费用</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.estimatedCost}</td>`;
        });
        
        content += `
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">平均速度</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.averageSpeed}</td>`;
        });
        
        content += `
                            </tr>
                            <tr>
                                <td style="padding: 10px; border: 1px solid #e8e8e8; font-weight: bold;">步骤数</td>
        `;
        
        comparisonData.forEach(item => {
            content += `<td style="padding: 10px; border: 1px solid #e8e8e8;">${item.analysis.detailed.stepCount}</td>`;
        });
        
        content += `
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px;">
                    <h4 style="margin: 0 0 8px 0; color: #389e0d;">推荐路径</h4>
                    <p style="margin: 0; font-size: 14px;">推荐选择路径${this.findBestRoute(comparisonData).id}，综合考虑时间、距离和费用最优。</p>
                </div>
            </div>
        `;
        
        // 显示在地图中心
        const center = this.map.getCenter();
        const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(0, -30)
        });
        
        infoWindow.open(this.map, [center.lng, center.lat]);
    }
    
    // 寻找最优路径
    findBestRoute(comparisonData) {
        // 简单的最优路径选择：优先考虑时间，其次是费用
        return comparisonData.reduce((best, current) => {
            if (!best) return current;
            
            // 比较时间
            if (current.analysis.basic.duration < best.analysis.basic.duration) {
                return current;
            } else if (current.analysis.basic.duration === best.analysis.basic.duration) {
                // 时间相同，比较费用
                const currentCost = parseFloat(current.analysis.detailed.estimatedCost.replace(/[^\d.]/g, '')) || 0;
                const bestCost = parseFloat(best.analysis.detailed.estimatedCost.replace(/[^\d.]/g, '')) || 0;
                return currentCost < bestCost ? current : best;
            }
            return best;
        }, null);
    }
    
    // 格式化距离
    formatDistance(distance) {
        if (distance < 1000) {
            return `${distance} 米`;
        } else {
            return `${(distance / 1000).toFixed(2)} 公里`;
        }
    }
    
    // 格式化时间
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds} 秒`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} 分钟 ${seconds % 60} 秒`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours} 小时 ${minutes} 分钟`;
        }
    }
    
    // 获取交通方式名称
    getModeName(mode) {
        const modeNames = {
            'car': '驾车',
            'bus': '公交',
            'walk': '步行',
            'ride': '骑行'
        };
        return modeNames[mode] || mode;
    }
    
    // 地图性能优化：延迟加载
    enableLazyLoading(options = {}) {
        const defaultOptions = {
            zoomThreshold: 14, // 当缩放级别大于此值时加载详细信息
            distanceThreshold: 500 // 当移动距离超过此值（米）时重新加载数据
        };
        
        const opts = { ...defaultOptions, ...options };
        
        let lastZoom = this.map.getZoom();
        let lastCenter = this.map.getCenter();
        
        this.map.on('zoomend', () => {
            const currentZoom = this.map.getZoom();
            if (currentZoom >= opts.zoomThreshold && lastZoom < opts.zoomThreshold) {
                // 缩放级别超过阈值，触发详细数据加载
                this.onZoomLevelExceeded(currentZoom);
            }
            lastZoom = currentZoom;
        });
        
        this.map.on('moveend', () => {
            const currentCenter = this.map.getCenter();
            const distance = AMap.GeometryUtil.distance(
                [lastCenter.lng, lastCenter.lat],
                [currentCenter.lng, currentCenter.lat]
            );
            
            if (distance > opts.distanceThreshold) {
                // 移动距离超过阈值，触发数据更新
                this.onMapMovedBeyondThreshold(currentCenter, distance);
            }
            lastCenter = currentCenter;
        });
    }
    
    // 缩放级别超过阈值的回调
    onZoomLevelExceeded(zoom) {
        console.log(`地图缩放级别超过阈值 ${this.config.zoomThreshold}，加载详细数据`);
        // 此处可以触发详细数据加载逻辑
    }
    
    // 地图移动超过阈值的回调
    onMapMovedBeyondThreshold(center, distance) {
        console.log(`地图移动超过阈值 ${this.config.distanceThreshold} 米，更新数据`);
        // 此处可以触发数据更新逻辑
    }
    
    // 区域选择功能
    enableAreaSelection(callback) {
        this.loadAMapPlugin('AMap.MouseTool', () => {
            const mouseTool = new AMap.MouseTool(this.map);
            
            mouseTool.on('draw', (event) => {
                const overlay = event.obj;
                const bounds = overlay.getBounds();
                
                // 转换为经纬度范围
                const areaBounds = {
                    southWest: {
                        lng: bounds.southWest.lng,
                        lat: bounds.southWest.lat
                    },
                    northEast: {
                        lng: bounds.northEast.lng,
                        lat: bounds.northEast.lat
                    }
                };
                
                callback(areaBounds);
                
                // 关闭绘制工具
                mouseTool.close();
            });
            
            // 启动多边形绘制
            mouseTool.polygon();
        });
    }
    
    // 添加热力图
    addHeatmap(data) {
        this.loadAMapPlugin('AMap.Heatmap', () => {
            // 确保只添加一个热力图
            if (this.heatmap) {
                this.map.remove(this.heatmap);
            }
            
            const heatmapData = data.map(item => [
                item.coordinates.lng,
                item.coordinates.lat,
                item.unitPrice / 1000 // 价格值归一化
            ]);
            
            this.heatmap = new AMap.Heatmap(this.map, {
                radius: 25, // 热力图的半径
                opacity: [0, 0.8], // 热力图的透明度范围
                gradient: {
                    0.4: 'blue',
                    0.65: 'rgb(117,211,248)',
                    0.8: 'rgb(0, 255, 0)',
                    0.9: 'rgb(255, 255, 0)',
                    1.0: 'red'
                } // 热力图的颜色渐变
            });
            
            // 设置热力图数据
            this.heatmap.setDataSet({
                data: heatmapData,
                max: 100 // 最大强度值
            });
        });
    }
    
    // 移除热力图
    removeHeatmap() {
        if (this.heatmap) {
            this.map.remove(this.heatmap);
            this.heatmap = null;
            // 更新图层状态
            this.updateLayerState('heatmap', false);
        }
    }
    
    // ---------------------------
    // 图层控制功能扩展
    // ---------------------------
    
    // 初始化图层控制系统
    initLayerControl() {
        this.layers = {
            // 基础图层
            'base': {
                type: 'base',
                name: '基础地图',
                visible: true,
                layer: null
            },
            // 卫星图层
            'satellite': {
                type: 'base',
                name: '卫星地图',
                visible: false,
                layer: null
            },
            // 混合图层
            'hybrid': {
                type: 'base',
                name: '混合地图',
                visible: false,
                layer: null
            },
            // 交通图层
            'traffic': {
                type: 'overlay',
                name: '实时交通',
                visible: false,
                layer: null
            },
            // 热力图图层
            'heatmap': {
                type: 'overlay',
                name: '房价热力图',
                visible: false,
                layer: null
            },
            // 房源点图层
            'properties': {
                type: 'overlay',
                name: '房源分布',
                visible: true,
                layer: null
            },
            // 小区边界图层
            'communities': {
                type: 'overlay',
                name: '小区边界',
                visible: false,
                layer: null
            },
            // 行政区划图层
            'district': {
                type: 'overlay',
                name: '行政区划',
                visible: false,
                layer: null
            }
        };
        
        // 初始化图层控制UI
        this.initLayerControlUI();
    }
    
    // 初始化图层控制UI
    initLayerControlUI() {
        // 这里可以创建图层控制的UI界面
        // 为了简化，我们先在控制台输出图层信息
        console.log('图层控制系统初始化完成，当前图层：', this.layers);
    }
    
    // 添加图层
    addLayer(layerId, layerConfig) {
        // 检查图层ID是否已存在
        if (this.layers[layerId]) {
            console.warn(`图层 ${layerId} 已存在`);
            return false;
        }
        
        // 添加新图层
        this.layers[layerId] = {
            type: layerConfig.type || 'overlay',
            name: layerConfig.name || layerId,
            visible: layerConfig.visible || false,
            layer: layerConfig.layer || null,
            data: layerConfig.data || null
        };
        
        // 如果图层可见，添加到地图
        if (this.layers[layerId].visible && this.layers[layerId].layer) {
            this.map.add(this.layers[layerId].layer);
        }
        
        return true;
    }
    
    // 移除图层
    removeLayer(layerId) {
        if (!this.layers[layerId]) {
            console.warn(`图层 ${layerId} 不存在`);
            return false;
        }
        
        // 从地图中移除图层
        if (this.layers[layerId].layer) {
            this.map.remove(this.layers[layerId].layer);
        }
        
        // 从图层列表中移除
        delete this.layers[layerId];
        
        return true;
    }
    
    // 显示图层
    showLayer(layerId) {
        if (!this.layers[layerId]) {
            console.warn(`图层 ${layerId} 不存在`);
            return false;
        }
        
        // 如果是基础图层，先隐藏其他基础图层
        if (this.layers[layerId].type === 'base') {
            this.hideAllBaseLayers();
        }
        
        // 如果图层对象不存在，创建图层
        if (!this.layers[layerId].layer) {
            this.createLayer(layerId);
        }
        
        // 显示图层
        if (this.layers[layerId].layer) {
            this.map.add(this.layers[layerId].layer);
            this.layers[layerId].visible = true;
        }
        
        return true;
    }
    
    // 隐藏图层
    hideLayer(layerId) {
        if (!this.layers[layerId]) {
            console.warn(`图层 ${layerId} 不存在`);
            return false;
        }
        
        // 基础图层不能全部隐藏，至少保留一个
        if (this.layers[layerId].type === 'base') {
            let baseLayersVisible = 0;
            for (const id in this.layers) {
                if (this.layers[id].type === 'base' && this.layers[id].visible) {
                    baseLayersVisible++;
                }
            }
            
            if (baseLayersVisible <= 1) {
                console.warn('至少需要保留一个基础图层');
                return false;
            }
        }
        
        // 隐藏图层
        if (this.layers[layerId].layer) {
            this.map.remove(this.layers[layerId].layer);
        }
        this.layers[layerId].visible = false;
        
        return true;
    }
    
    // 切换图层可见性
    toggleLayer(layerId) {
        if (!this.layers[layerId]) {
            console.warn(`图层 ${layerId} 不存在`);
            return false;
        }
        
        if (this.layers[layerId].visible) {
            return this.hideLayer(layerId);
        } else {
            return this.showLayer(layerId);
        }
    }
    
    // 隐藏所有基础图层
    hideAllBaseLayers() {
        for (const id in this.layers) {
            if (this.layers[id].type === 'base' && this.layers[id].visible) {
                this.hideLayer(id);
            }
        }
    }
    
    // 创建图层对象
    createLayer(layerId) {
        const layerConfig = this.layers[layerId];
        if (!layerConfig) {
            console.warn(`图层 ${layerId} 不存在`);
            return null;
        }
        
        let layer = null;
        
        switch (layerId) {
            case 'satellite':
                // 创建卫星图层
                this.loadAMapPlugin('AMap.Satellite', () => {
                    layer = new AMap.TileLayer.Satellite();
                    this.layers[layerId].layer = layer;
                    if (this.layers[layerId].visible) {
                        this.map.add(layer);
                    }
                });
                break;
            
            case 'hybrid':
                // 创建混合图层
                this.loadAMapPlugin(['AMap.Satellite', 'AMap.RoadNet'], () => {
                    const satelliteLayer = new AMap.TileLayer.Satellite();
                    const roadNetLayer = new AMap.TileLayer.RoadNet();
                    layer = [satelliteLayer, roadNetLayer];
                    this.layers[layerId].layer = layer;
                    if (this.layers[layerId].visible) {
                        this.map.add(layer);
                    }
                });
                break;
            
            case 'traffic':
                // 创建交通图层
                this.loadAMapPlugin('AMap.Traffic', () => {
                    layer = new AMap.TrafficLayer({
                        zIndex: 10
                    });
                    this.layers[layerId].layer = layer;
                    if (this.layers[layerId].visible) {
                        this.map.add(layer);
                    }
                });
                break;
            
            case 'communities':
                // 创建小区边界图层
                // 实现将在后续添加
                break;
            
            case 'district':
                // 创建行政区划图层
                // 实现将在后续添加
                break;
        }
        
        return layer;
    }
    
    // 更新图层状态
    updateLayerState(layerId, visible) {
        if (this.layers[layerId]) {
            this.layers[layerId].visible = visible;
            console.log(`图层 ${layerId} 状态更新为：${visible ? '可见' : '隐藏'}`);
        }
    }
    
    // 获取当前可见图层
    getVisibleLayers() {
        const visibleLayers = [];
        for (const id in this.layers) {
            if (this.layers[id].visible) {
                visibleLayers.push(id);
            }
        }
        return visibleLayers;
    }
    
    // 获取图层信息
    getLayerInfo(layerId) {
        return this.layers[layerId] || null;
    }
    
    // 切换基础地图类型
    switchBaseMap(mapType) {
        const validTypes = ['base', 'satellite', 'hybrid'];
        if (!validTypes.includes(mapType)) {
            console.warn(`不支持的地图类型：${mapType}`);
            return false;
        }
        
        // 隐藏所有基础图层
        this.hideAllBaseLayers();
        
        // 显示指定的基础图层
        this.showLayer(mapType);
        
        return true;
    }
    
    // 添加自定义覆盖物图层
    addCustomOverlayLayer(layerId, name, overlays) {
        // 创建自定义图层组
        const layer = {
            type: 'overlay',
            name: name,
            visible: true,
            layer: overlays,
            data: overlays
        };
        
        // 添加到图层列表
        this.addLayer(layerId, layer);
        
        // 添加到地图
        this.map.add(overlays);
        
        return true;
    }
    
    // 更新图层数据
    updateLayerData(layerId, data) {
        if (!this.layers[layerId]) {
            console.warn(`图层 ${layerId} 不存在`);
            return false;
        }
        
        // 更新图层数据
        this.layers[layerId].data = data;
        
        // 如果是热力图，更新热力图数据
        if (layerId === 'heatmap' && this.heatmap) {
            this.addHeatmap(data);
        }
        
        return true;
    }
    
    // ---------------------------
    // 数据可视化功能扩展
    // ---------------------------
    
    // 区域统计数据可视化
    visualizeAreaStatistics(data, areaBounds) {
        // 计算区域内的统计数据
        const areaData = this.filterDataByBounds(data, areaBounds);
        
        if (areaData.length === 0) {
            console.log('所选区域内无数据');
            return;
        }
        
        // 计算统计指标
        const stats = this.calculateAreaStatistics(areaData);
        
        // 显示统计信息
        this.showAreaStatistics(stats, areaBounds);
        
        // 在地图上高亮显示该区域
        this.highlightArea(areaBounds);
    }
    
    // 根据边界过滤数据
    filterDataByBounds(data, bounds) {
        return data.filter(item => {
            const { lng, lat } = item.coordinates;
            return lng >= bounds.southWest.lng &&
                   lng <= bounds.northEast.lng &&
                   lat >= bounds.southWest.lat &&
                   lat <= bounds.northEast.lat;
        });
    }
    
    // 计算区域统计数据
    calculateAreaStatistics(data) {
        const prices = data.map(item => item.unitPrice);
        const areas = data.map(item => item.area);
        const totalPrices = data.map(item => item.totalPrice);
        
        // 按小区分组
        const communityGroups = {};
        data.forEach(item => {
            if (!communityGroups[item.community]) {
                communityGroups[item.community] = [];
            }
            communityGroups[item.community].push(item);
        });
        
        // 计算平均数据
        const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const avgArea = areas.reduce((sum, area) => sum + area, 0) / areas.length;
        const avgTotalPrice = totalPrices.reduce((sum, total) => sum + total, 0) / totalPrices.length;
        
        return {
            totalProperties: data.length,
            totalCommunities: Object.keys(communityGroups).length,
            avgPrice: avgPrice,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgArea: avgArea,
            avgTotalPrice: avgTotalPrice,
            communityGroups: communityGroups
        };
    }
    
    // 显示区域统计信息
    showAreaStatistics(stats, bounds) {
        const content = `
            <div style="width: 300px; padding: 15px;">
                <h3 style="margin: 0 0 15px 0; color: #333;">区域统计信息</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div style="background: #f0f9ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">总房源数</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1890ff;">${stats.totalProperties}</p>
                    </div>
                    <div style="background: #f0f9ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">总小区数</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1890ff;">${stats.totalCommunities}</p>
                    </div>
                    <div style="background: #e6f7ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">平均单价</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0050b3;">¥${stats.avgPrice.toLocaleString()}/㎡</p>
                    </div>
                    <div style="background: #e6f7ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">平均面积</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0050b3;">${stats.avgArea.toFixed(1)}㎡</p>
                    </div>
                    <div style="background: #e6f7ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">平均总价</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0050b3;">¥${stats.avgTotalPrice.toLocaleString()}</p>
                    </div>
                    <div style="background: #e6f7ff; padding: 10px; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #666;">价格范围</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #0050b3;">¥${stats.minPrice.toLocaleString()} - ¥${stats.maxPrice.toLocaleString()}/㎡</p>
                    </div>
                </div>
                <button onclick="mapValuationSystem.exportAreaStatistics(${JSON.stringify(stats).replace(/"/g, '&quot;')})" style="margin-top: 15px; padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">导出统计数据</button>
            </div>
        `;
        
        const center = {
            lng: (bounds.southWest.lng + bounds.northEast.lng) / 2,
            lat: (bounds.southWest.lat + bounds.northEast.lat) / 2
        };
        
        const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(0, -30)
        });
        
        infoWindow.open(this.map, [center.lng, center.lat]);
    }
    
    // 高亮显示区域
    highlightArea(bounds) {
        // 清除之前的高亮区域
        if (this.highlightPolygon) {
            this.map.remove(this.highlightPolygon);
        }
        
        // 创建多边形
        const path = [
            [bounds.southWest.lng, bounds.southWest.lat],
            [bounds.northEast.lng, bounds.southWest.lat],
            [bounds.northEast.lng, bounds.northEast.lat],
            [bounds.southWest.lng, bounds.northEast.lat],
            [bounds.southWest.lng, bounds.southWest.lat]
        ];
        
        this.highlightPolygon = new AMap.Polygon({
            path: path,
            strokeColor: '#1890ff',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: '#1890ff',
            fillOpacity: 0.2
        });
        
        this.map.add(this.highlightPolygon);
    }
    
    // 多维度数据对比图表
    showDataComparisonChart(data1, data2, label1, label2) {
        // 这里可以集成ECharts或其他图表库
        // 为了简化，我们先显示一个简单的对比信息
        const stats1 = this.calculateAreaStatistics(data1);
        const stats2 = this.calculateAreaStatistics(data2);
        
        const content = `
            <div style="width: 350px; padding: 15px;">
                <h3 style="margin: 0 0 15px 0; color: #333;">数据对比分析</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #1890ff;">${label1}</h4>
                        <div style="background: #f0f9ff; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">房源数</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1890ff;">${stats1.totalProperties}</p>
                        </div>
                        <div style="background: #f0f9ff; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">平均单价</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1890ff;">¥${stats1.avgPrice.toLocaleString()}/㎡</p>
                        </div>
                        <div style="background: #f0f9ff; padding: 10px; border-radius: 4px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">平均面积</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #1890ff;">${stats1.avgArea.toFixed(1)}㎡</p>
                        </div>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #52c41a;">${label2}</h4>
                        <div style="background: #f6ffed; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">房源数</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #52c41a;">${stats2.totalProperties}</p>
                        </div>
                        <div style="background: #f6ffed; padding: 10px; border-radius: 4px; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">平均单价</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #52c41a;">¥${stats2.avgPrice.toLocaleString()}/㎡</p>
                        </div>
                        <div style="background: #f6ffed; padding: 10px; border-radius: 4px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">平均面积</p>
                            <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #52c41a;">${stats2.avgArea.toFixed(1)}㎡</p>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 4px;">
                    <h4 style="margin: 0 0 8px 0; color: #ff4d4f;">对比结论</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                        <li>单价差异: ${Math.abs(stats1.avgPrice - stats2.avgPrice).toLocaleString()}元/㎡</li>
                        <li>房源数量差异: ${Math.abs(stats1.totalProperties - stats2.totalProperties)}套</li>
                        <li>面积差异: ${Math.abs(stats1.avgArea - stats2.avgArea).toFixed(1)}㎡</li>
                    </ul>
                </div>
            </div>
        `;
        
        // 显示在地图中心
        const center = this.map.getCenter();
        const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(0, -30)
        });
        
        infoWindow.open(this.map, [center.lng, center.lat]);
    }
    
    // 导出区域统计数据
    exportAreaStatistics(stats) {
        const csvContent = this.convertStatsToCSV(stats);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `区域统计数据_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 将统计数据转换为CSV格式
    convertStatsToCSV(stats) {
        let csv = '指标,数值\n';
        csv += `总房源数,${stats.totalProperties}\n`;
        csv += `总小区数,${stats.totalCommunities}\n`;
        csv += `平均单价,${stats.avgPrice.toFixed(2)}\n`;
        csv += `最低单价,${stats.minPrice.toFixed(2)}\n`;
        csv += `最高单价,${stats.maxPrice.toFixed(2)}\n`;
        csv += `平均面积,${stats.avgArea.toFixed(2)}\n`;
        csv += `平均总价,${stats.avgTotalPrice.toFixed(2)}\n`;
        
        csv += '\n小区名称,房源数,平均单价\n';
        Object.entries(stats.communityGroups).forEach(([name, items]) => {
            const avgPrice = items.reduce((sum, item) => sum + item.unitPrice, 0) / items.length;
            csv += `${name},${items.length},${avgPrice.toFixed(2)}\n`;
        });
        
        return csv;
    }

    // Set map style
    setMapStyle(style) {
        this.config.mapStyle = style;
        
        let mapStyle = 'amap://styles/normal';
        
        switch (style) {
            case 'standard':
                mapStyle = 'amap://styles/normal';
                break;
            case 'dark':
                mapStyle = 'amap://styles/darkblue';
                break;
            case 'light':
                mapStyle = 'amap://styles/light';
                break;
            case 'satellite':
                // For satellite view, we use the map type control
                break;
            case 'fresh':
                mapStyle = 'amap://styles/fresh';
                break;
        }
        
        this.map.setMapStyle(mapStyle);
    }

    // Add map event listeners
    addMapEventListeners() {
        // Click event
        this.map.on('click', (e) => {
            console.log('Map clicked at:', e.lnglat);
            this.onMapClick(e.lnglat);
        });
        
        // Zoom event
        this.map.on('zoomend', () => {
            console.log('Map zoom level changed to:', this.map.getZoom());
            this.onZoomChange(this.map.getZoom());
        });
        
        // Move event
        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            console.log('Map center moved to:', center);
        });
    }

    // Map click handler
    onMapClick(latlng) {
        // Display property information at clicked location
        this.showPropertyInfoAtLocation(latlng);
    }

    // Zoom change handler
    onZoomChange(zoom) {
        // Adjust marker visibility based on zoom level
        this.adjustMarkersByZoom(zoom);
    }

    // Show property info at location
    showPropertyInfoAtLocation(latlng) {
        // Find nearest property
        const nearestProperty = this.findNearestProperty(latlng);
        
        if (nearestProperty) {
            this.createInfoWindow(nearestProperty, latlng);
        }
    }

    // Find nearest property
    findNearestProperty(latlng) {
        // Implementation would find the nearest property from processed data
        // For now, return a sample property
        return {
            community: '示范小区',
            district: '雨湖区',
            avgPrice: 6500,
            totalProperties: 50,
            coordinates: { lat: latlng.lat, lng: latlng.lng }
        };
    }

    // Create info window
    createInfoWindow(property, latlng) {
        const content = `
            <div style="width: 250px; padding: 10px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${property.community}</h3>
                <p style="margin: 5px 0;"><strong>区域:</strong> ${property.district}</p>
                <p style="margin: 5px 0;"><strong>均价:</strong> ¥${property.avgPrice.toLocaleString()}/㎡</p>
                <p style="margin: 5px 0;"><strong>房源数量:</strong> ${property.totalProperties}</p>
                <button onclick="mapValuationSystem.valuationEngine.estimateProperty(${JSON.stringify(property).replace(/"/g, '&quot;')})" style="margin-top: 10px; padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">评估价值</button>
            </div>
        `;
        
        const infoWindow = new AMap.InfoWindow({
            content: content,
            offset: new AMap.Pixel(10, -30)
        });
        
        infoWindow.open(this.map, [latlng.lng, latlng.lat]);
    }

    // Add markers to map
    addMarkers(data) {
        // Clear existing markers
        this.clearMarkers();
        
        // Add new markers
        data.forEach(property => {
            const position = [property.coordinates.lng, property.coordinates.lat];
            const marker = new AMap.Marker({
                position: position,
                title: property.community
            });
            
            // Create marker label
            const label = new AMap.Label({
                content: `¥${property.unitPrice}/㎡`,
                offset: new AMap.Pixel(20, -10),
                position: position
            });
            
            // Add click event
            marker.on('click', () => {
                this.createInfoWindow(property, { lng: position[0], lat: position[1] });
            });
            
            this.map.add(marker);
            this.map.add(label);
            
            // Store marker and label together
            this.markers.push({
                marker: marker,
                label: label,
                property: property
            });
        });
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(item => {
            this.map.remove(item.marker);
            this.map.remove(item.label);
        });
        this.markers = [];
    }

    // Adjust markers by zoom level
    adjustMarkersByZoom(zoom) {
        this.markers.forEach(item => {
            if (zoom < 14) {
                item.label.hide();
            } else {
                item.label.show();
            }
        });
    }

    // Add heatmap control
    addHeatmapControl() {
        this.loadAMapPlugin('AMap.Heatmap', () => {
            // Heatmap will be initialized with data in the UI layer
            console.log('AMap Heatmap plugin loaded');
        });
    }

    // Add statistical overlay
    addStatisticalOverlay() {
        console.log('Statistical overlay added');
        // Implementation will be added in the UI layer
    }

    // Add policy layer control
    addPolicyLayerControl() {
        console.log('Policy layer control added');
        // Implementation will be added in the UI layer
    }

    // Add business analysis overlay
    addBusinessAnalysisOverlay() {
        console.log('Business analysis overlay added');
        // Implementation will be added in the UI layer
    }

    // Add data export control
    addDataExportControl() {
        console.log('Data export control added');
        // Implementation will be added in the UI layer
    }

    // Add market analysis tools
    addMarketAnalysisTools() {
        console.log('Market analysis tools added');
        // Implementation will be added in the UI layer
    }

    // Add member location overlay
    addMemberLocationOverlay() {
        console.log('Member location overlay added');
        // Implementation will be added in the UI layer
    }

    // Add industry statistics control
    addIndustryStatsControl() {
        console.log('Industry statistics control added');
        // Implementation will be added in the UI layer
    }

    // Get user type name
    getUserTypeName() {
        const userTypeNames = {
            'institution': '院校端',
            'government': '政府端',
            'public': '大众端',
            'enterprise': '企业端',
            'association': '协会端'
        };
        
        return userTypeNames[this.userType] || '未知用户';
    }
    
    // ---------------------------
    // 用户端定制化功能
    // ---------------------------
    
    // 初始化用户端定制化功能
    initUserTypeFeatures() {
        console.log(`初始化 ${this.getUserTypeName()} 定制化功能`);
        
        switch (this.userType) {
            case 'institution': // 院校端
                this.initInstitutionFeatures();
                break;
            case 'government': // 政府端
                this.initGovernmentFeatures();
                break;
            case 'public': // 大众端
                this.initPublicFeatures();
                break;
            case 'enterprise': // 企业端
                this.initEnterpriseFeatures();
                break;
            case 'association': // 协会端
                this.initAssociationFeatures();
                break;
        }
    }
    
    // 院校端定制化功能初始化
    initInstitutionFeatures() {
        console.log('初始化院校端定制化功能');
        
        // 院校端功能特性
        this.userFeatures = {
            // 数据可视化工具
            dataVisualization: {
                enabled: true,
                features: ['heatmap', 'statistics', 'comparison', 'export']
            },
            // 研究工具
            researchTools: {
                enabled: true,
                features: ['areaSelection', 'dataExtraction', 'spatialAnalysis', 'reportGeneration']
            },
            // 教学工具
            teachingTools: {
                enabled: true,
                features: ['caseStudy', 'simulation', 'collaboration']
            },
            // 图层控制
            layerControl: {
                enabled: true,
                availableLayers: ['base', 'satellite', 'hybrid', 'properties', 'heatmap', 'traffic', 'district']
            },
            // 高级功能
            advancedFeatures: {
                enabled: true,
                features: ['pathPlanning', 'spatialQuery', 'dataImport', 'customAnalysis']
            }
        };
        
        // 加载院校端所需的插件
        this.loadAMapPlugin(['AMap.Heatmap', 'AMap.DistrictSearch', 'AMap.MouseTool'], () => {
            console.log('院校端所需插件加载完成');
        });
        
        // 启用院校端特定的地图控件
        this.enableInstitutionControls();
    }
    
    // 政府端定制化功能初始化
    initGovernmentFeatures() {
        console.log('初始化政府端定制化功能');
        
        // 政府端功能特性
        this.userFeatures = {
            // 城市规划工具
            urbanPlanning: {
                enabled: true,
                features: ['districtAnalysis', 'landUse', 'transportation', 'populationDistribution']
            },
            // 政策管理工具
            policyManagement: {
                enabled: true,
                features: ['policyLayer', 'impactAssessment', 'scenarioSimulation']
            },
            // 统计分析工具
            statisticalAnalysis: {
                enabled: true,
                features: ['areaStatistics', 'temporalAnalysis', 'comparisonAnalysis', 'reportGeneration']
            },
            // 图层控制
            layerControl: {
                enabled: true,
                availableLayers: ['base', 'satellite', 'hybrid', 'properties', 'heatmap', 'traffic', 'district', 'policy']
            },
            // 高级功能
            advancedFeatures: {
                enabled: true,
                features: ['spatialQuery', 'dataImportExport', 'collaboration', 'customAnalysis']
            }
        };
        
        // 加载政府端所需的插件
        this.loadAMapPlugin(['AMap.DistrictSearch', 'AMap.Heatmap', 'AMap.Traffic'], () => {
            console.log('政府端所需插件加载完成');
        });
        
        // 启用政府端特定的地图控件
        this.enableGovernmentControls();
    }
    
    // 大众端定制化功能初始化
    initPublicFeatures() {
        console.log('初始化大众端定制化功能');
        
        // 大众端功能特性
        this.userFeatures = {
            // 房产查询工具
            propertySearch: {
                enabled: true,
                features: ['communitySearch', 'priceQuery', 'propertyDetails', 'comparison']
            },
            // 生活服务工具
            lifeServices: {
                enabled: true,
                features: ['POISearch', 'pathPlanning', 'trafficInfo', 'nearbyAmenities']
            },
            // 简化的图层控制
            layerControl: {
                enabled: true,
                availableLayers: ['base', 'satellite', 'hybrid', 'properties', 'traffic']
            },
            // 基础功能
            basicFeatures: {
                enabled: true,
                features: ['location', 'mapSwitch', 'zoom', 'pan']
            }
        };
        
        // 加载大众端所需的插件
        this.loadAMapPlugin(['AMap.PlaceSearch', 'AMap.Autocomplete', 'AMap.Geolocation', 'AMap.Traffic'], () => {
            console.log('大众端所需插件加载完成');
        });
        
        // 启用大众端特定的地图控件
        this.enablePublicControls();
    }
    
    // 企业端定制化功能初始化
    initEnterpriseFeatures() {
        console.log('初始化企业端定制化功能');
        
        // 企业端功能特性
        this.userFeatures = {
            // 商业分析工具
            businessAnalysis: {
                enabled: true,
                features: ['marketAnalysis', 'competitorAnalysis', 'customerDistribution', 'investmentAnalysis']
            },
            // 商业地产工具
            commercialRealEstate: {
                enabled: true,
                features: ['propertySearch', 'priceTrend', 'rentalAnalysis', 'yieldCalculation']
            },
            // 数据导出工具
            dataExport: {
                enabled: true,
                features: ['csvExport', 'reportGeneration', 'customReport', 'dataVisualization']
            },
            // 图层控制
            layerControl: {
                enabled: true,
                availableLayers: ['base', 'satellite', 'hybrid', 'properties', 'heatmap', 'traffic', 'businessDistricts']
            },
            // 高级功能
            advancedFeatures: {
                enabled: true,
                features: ['pathPlanning', 'fleetManagement', 'supplyChain', 'logisticsOptimization']
            }
        };
        
        // 加载企业端所需的插件
        this.loadAMapPlugin(['AMap.PlaceSearch', 'AMap.Heatmap', 'AMap.Driving', 'AMap.Bus', 'AMap.Walking'], () => {
            console.log('企业端所需插件加载完成');
        });
        
        // 启用企业端特定的地图控件
        this.enableEnterpriseControls();
    }
    
    // 协会端定制化功能初始化
    initAssociationFeatures() {
        console.log('初始化协会端定制化功能');
        
        // 协会端功能特性
        this.userFeatures = {
            // 会员管理工具
            memberManagement: {
                enabled: true,
                features: ['memberLocation', 'memberDistribution', 'memberSearch', 'memberStatistics']
            },
            // 行业分析工具
            industryAnalysis: {
                enabled: true,
                features: ['marketTrend', 'industryStatistics', 'comparativeAnalysis', 'reportGeneration']
            },
            // 活动管理工具
            eventManagement: {
                enabled: true,
                features: ['eventLocation', 'participantManagement', 'routePlanning', 'venueSelection']
            },
            // 图层控制
            layerControl: {
                enabled: true,
                availableLayers: ['base', 'satellite', 'hybrid', 'properties', 'memberLocations', 'eventLocations']
            },
            // 基础功能
            basicFeatures: {
                enabled: true,
                features: ['search', 'zoom', 'pan', 'mapSwitch']
            }
        };
        
        // 加载协会端所需的插件
        this.loadAMapPlugin(['AMap.PlaceSearch', 'AMap.Geolocation', 'AMap.Driving'], () => {
            console.log('协会端所需插件加载完成');
        });
        
        // 启用协会端特定的地图控件
        this.enableAssociationControls();
    }
    
    // 获取用户端可用功能
    getUserFeatures() {
        return this.userFeatures || {};
    }
    
    // 检查功能是否可用
    hasFeature(featureCategory, featureName) {
        if (this.userFeatures && this.userFeatures[featureCategory]) {
            const category = this.userFeatures[featureCategory];
            return category.enabled && category.features.includes(featureName);
        }
        return false;
    }
    
    // 获取可用图层列表
    getAvailableLayers() {
        if (this.userFeatures && this.userFeatures.layerControl) {
            return this.userFeatures.layerControl.availableLayers;
        }
        return ['base', 'properties'];
    }
}

// ---------------------------
// 3. Valuation Engine Module
// ---------------------------
// 数据模型类定义
class PropertyDataModel {
    constructor() {
        this.id = '';
        this.community = '';
        this.area = 0;
        this.layout = '';
        this.district = '';
        this.subDistrict = '';
        this.decoration = '';
        this.unitPrice = 0;
        this.totalPrice = 0;
        this.coordinates = { lat: 0, lng: 0 };
        this.constructionYear = null;
        this.floors = 0;
        this.currentFloor = 0;
        this.orientation = '';
        this.propertyType = '';
        this.usageType = '';
        this.ownershipType = '';
        this.landArea = 0;
        this.taxStatus = '';
        this.transactionType = '';
        this.timestamp = new Date().toISOString();
    }
}

class ValuationResultModel {
    constructor() {
        this.id = '';
        this.propertyId = '';
        this.estimatedPrice = 0;
        this.confidence = 0;
        this.valuationDate = new Date().toISOString();
        this.valuationModel = 'comprehensive';
        this.breakdown = {};
        this.investmentAdvice = '';
        this.marketTrend = {};
        this.comparativeAnalysis = {};
        this.riskAssessment = {};
        this.suggestions = [];
    }
}

class MarketDataModel {
    constructor() {
        this.district = '';
        this.avgPrice = 0;
        this.priceTrend = [];
        this.inventory = 0;
        this.transactionVolume = 0;
        this.rentalYield = 0;
        this.supplyDemandRatio = 0;
        this.macroEconomicFactors = {};
        this.policyFactors = {};
        this.timestamp = new Date().toISOString();
    }
}

class ValuationEngine {
    constructor(mapCore, dataProcessor) {
        this.mapCore = mapCore;
        this.dataProcessor = dataProcessor;
        this.valuationModels = {};
        this.currentModel = 'comprehensive';
        
        // Valuation parameters by model
        this.modelParams = {
            comprehensive: {
                locationWeight: 0.35,
                areaWeight: 0.15,
                layoutWeight: 0.1,
                decorationWeight: 0.1,
                marketTrendWeight: 0.15,
                policyWeight: 0.15
            },
            simple: {
                locationWeight: 0.5,
                areaWeight: 0.3,
                marketTrendWeight: 0.2
            },
            investment: {
                roiWeight: 0.4,
                growthPotentialWeight: 0.3,
                riskWeight: 0.3
            }
        };
        
        // API服务配置
        this.apiConfig = {
            baseUrl: '/api/valuation',
            timeout: 10000,
            retryCount: 3
        };
        
        // 初始化估价模型
        this.initValuationModels();
        
        // 初始化API服务
        this.initApiServices();
    }

    // Initialize valuation models
    initValuationModels() {
        this.valuationModels = {
            comprehensive: this.comprehensiveValuation.bind(this),
            simple: this.simpleValuation.bind(this),
            investment: this.investmentValuation.bind(this)
        };
    }
    
    // 初始化API服务
    initApiServices() {
        this.apiServices = {
            getMarketData: this.getMarketData.bind(this),
            saveValuationResult: this.saveValuationResult.bind(this),
            getValuationHistory: this.getValuationHistory.bind(this),
            getComparativeData: this.getComparativeData.bind(this),
            getRiskAssessment: this.getRiskAssessment.bind(this),
            getInvestmentAdvice: this.getInvestmentAdvice.bind(this)
        };
    }

    // Comprehensive valuation model
    comprehensiveValuation(propertyData) {
        const params = this.modelParams.comprehensive;
        
        // Calculate scores
        const locationScore = this.calculateLocationScore(propertyData);
        const areaScore = this.calculateAreaScore(propertyData);
        const layoutScore = this.calculateLayoutScore(propertyData);
        const decorationScore = this.calculateDecorationScore(propertyData);
        const marketTrendScore = this.calculateMarketTrendScore(propertyData);
        const policyScore = this.calculatePolicyScore(propertyData);
        
        // Weighted sum
        const finalScore = 
            locationScore * params.locationWeight +
            areaScore * params.areaWeight +
            layoutScore * params.layoutWeight +
            decorationScore * params.decorationWeight +
            marketTrendScore * params.marketTrendWeight +
            policyScore * params.policyWeight;
        
        // Convert score to price
        const basePrice = propertyData.avgPrice || 6000;
        const estimatedPrice = basePrice * (1 + (finalScore - 50) / 100);
        
        return {
            estimatedPrice: Math.round(estimatedPrice),
            confidence: Math.min(95, Math.max(60, finalScore)),
            breakdown: {
                locationScore,
                areaScore,
                layoutScore,
                decorationScore,
                marketTrendScore,
                policyScore
            },
            valuationModel: 'comprehensive'
        };
    }

    // Simple valuation model
    simpleValuation(propertyData) {
        const params = this.modelParams.simple;
        
        const locationScore = this.calculateLocationScore(propertyData);
        const areaScore = this.calculateAreaScore(propertyData);
        const marketTrendScore = this.calculateMarketTrendScore(propertyData);
        
        const finalScore = 
            locationScore * params.locationWeight +
            areaScore * params.areaWeight +
            marketTrendScore * params.marketTrendWeight;
        
        const basePrice = propertyData.avgPrice || 6000;
        const estimatedPrice = basePrice * (1 + (finalScore - 50) / 100);
        
        return {
            estimatedPrice: Math.round(estimatedPrice),
            confidence: Math.min(90, Math.max(55, finalScore)),
            breakdown: {
                locationScore,
                areaScore,
                marketTrendScore
            },
            valuationModel: 'simple'
        };
    }

    // Investment valuation model
    investmentValuation(propertyData) {
        const params = this.modelParams.investment;
        
        const roiScore = this.calculateROIScore(propertyData);
        const growthPotentialScore = this.calculateGrowthPotentialScore(propertyData);
        const riskScore = this.calculateRiskScore(propertyData);
        
        const finalScore = 
            roiScore * params.roiWeight +
            growthPotentialScore * params.growthPotentialWeight +
            riskScore * params.riskWeight;
        
        const basePrice = propertyData.avgPrice || 6000;
        const estimatedPrice = basePrice * (1 + (finalScore - 50) / 100);
        
        return {
            estimatedPrice: Math.round(estimatedPrice),
            confidence: Math.min(92, Math.max(58, finalScore)),
            breakdown: {
                roiScore,
                growthPotentialScore,
                riskScore
            },
            valuationModel: 'investment',
            investmentAdvice: this.generateInvestmentAdvice(finalScore)
        };
    }

    // Calculate location score (0-100)
    calculateLocationScore(propertyData) {
        // Factors: district ranking, proximity to city center, transportation access, amenities
        const baseScore = 50;
        
        // District premium/discount
        const districtFactors = {
            '雨湖区': 1.1,
            '岳塘区': 1.05,
            '九华经开区': 1.0,
            '昭山示范区': 0.95,
            '湘潭县': 0.9
        };
        
        const districtFactor = districtFactors[propertyData.district] || 1.0;
        
        // Transportation access (simulated)
        const transportScore = Math.random() * 20 + 40;
        
        // Amenities score (simulated)
        const amenitiesScore = Math.random() * 20 + 40;
        
        return Math.min(100, Math.max(0, baseScore * districtFactor + transportScore * 0.3 + amenitiesScore * 0.3));
    }

    // Calculate area score (0-100)
    calculateAreaScore(propertyData) {
        // Ideal area range: 90-120㎡
        const idealMin = 90;
        const idealMax = 120;
        
        const area = propertyData.area || 100;
        
        if (area >= idealMin && area <= idealMax) {
            return 100;
        } else if (area < idealMin) {
            return Math.max(0, 100 - (idealMin - area) * 2);
        } else {
            return Math.max(0, 100 - (area - idealMax) * 1.5);
        }
    }

    // Calculate layout score (0-100)
    calculateLayoutScore(propertyData) {
        // Evaluate based on rooms per area ratio
        const layout = propertyData.layout || '3室2厅';
        const area = propertyData.area || 100;
        
        // Extract number of rooms
        const roomsMatch = layout.match(/(\d+)室/);
        const rooms = roomsMatch ? parseInt(roomsMatch[1]) : 3;
        
        // Ideal rooms per 100㎡: 3-4
        const roomsPer100 = (rooms / area) * 100;
        
        if (roomsPer100 >= 3 && roomsPer100 <= 4) {
            return 100;
        } else if (roomsPer100 < 3) {
            return Math.max(0, 100 - (3 - roomsPer100) * 33);
        } else {
            return Math.max(0, 100 - (roomsPer100 - 4) * 25);
        }
    }

    // Calculate decoration score (0-100)
    calculateDecorationScore(propertyData) {
        const decoration = propertyData.decoration || '简装';
        
        const decorationScores = {
            '精装': 90,
            '简装': 60,
            '毛坯': 30
        };
        
        return decorationScores[decoration] || 60;
    }

    // Calculate market trend score (0-100)
    calculateMarketTrendScore(propertyData) {
        // Simulate market trend based on district and time
        const marketTrends = {
            '雨湖区': 1.02,
            '岳塘区': 1.03,
            '九华经开区': 1.05,
            '昭山示范区': 1.04,
            '湘潭县': 1.01
        };
        
        const trend = marketTrends[propertyData.district] || 1.0;
        const score = (trend - 0.95) * 200; // Convert to 0-100 scale
        
        return Math.min(100, Math.max(0, score));
    }

    // Calculate policy score (0-100)
    calculatePolicyScore(propertyData) {
        // Simulate policy impact based on district
        const policyFactors = {
            '雨湖区': 0.95,
            '岳塘区': 0.98,
            '九华经开区': 1.05,
            '昭山示范区': 1.03,
            '湘潭县': 0.97
        };
        
        const factor = policyFactors[propertyData.district] || 1.0;
        return Math.min(100, Math.max(0, 50 * factor + 25));
    }

    // Calculate ROI score (0-100)
    calculateROIScore(propertyData) {
        // Simulated ROI calculation
        const baseROI = 3.5; // Average ROI in %
        const roiVariation = Math.random() * 3 - 1.5;
        return Math.min(100, Math.max(0, (baseROI + roiVariation) * 20));
    }

    // Calculate growth potential score (0-100)
    calculateGrowthPotentialScore(propertyData) {
        const growthRates = {
            '雨湖区': 2.5,
            '岳塘区': 3.0,
            '九华经开区': 5.0,
            '昭山示范区': 4.5,
            '湘潭县': 2.0
        };
        
        const growthRate = growthRates[propertyData.district] || 3.0;
        return Math.min(100, Math.max(0, growthRate * 15 + 25));
    }

    // Calculate risk score (0-100, lower is better, converted to positive scale)
    calculateRiskScore(propertyData) {
        const riskFactors = {
            '雨湖区': 0.8,
            '岳塘区': 0.85,
            '九华经开区': 1.1,
            '昭山示范区': 1.05,
            '湘潭县': 0.9
        };
        
        const riskFactor = riskFactors[propertyData.district] || 1.0;
        const baseRisk = 50;
        const riskScore = baseRisk * riskFactor;
        
        // Convert to 0-100 scale where higher is better (lower risk)
        return Math.min(100, Math.max(0, 100 - riskScore));
    }

    // 基础因子评估
    evaluateBaseFactors(propertyData) {
        return {
            locationScore: this.calculateLocationScore(propertyData),
            areaScore: this.calculateAreaScore(propertyData),
            layoutScore: this.calculateLayoutScore(propertyData),
            decorationScore: this.calculateDecorationScore(propertyData)
        };
    }
    
    // 位置因子深度分析
    analyzeLocationFactors(propertyData) {
        // 距离市中心的距离评分
        const distanceToCenter = this.calculateDistanceToCenter(propertyData);
        const centerDistanceScore = Math.max(0, 100 - distanceToCenter / 100);
        
        // 交通便利度评分
        const transportScore = this.calculateTransportScore(propertyData);
        
        // 周边配套设施评分
        const amenitiesScore = this.calculateAmenitiesScore(propertyData);
        
        // 环境质量评分
        const environmentScore = this.calculateEnvironmentScore(propertyData);
        
        return {
            centerDistanceScore,
            transportScore,
            amenitiesScore,
            environmentScore,
            combined: (centerDistanceScore * 0.4 + transportScore * 0.3 + amenitiesScore * 0.2 + environmentScore * 0.1)
        };
    }
    
    // 计算到市中心的距离（模拟）
    calculateDistanceToCenter(propertyData) {
        // 模拟不同区域到市中心的距离
        const districtDistances = {
            '雨湖区': 2000,
            '岳塘区': 3000,
            '九华经开区': 8000,
            '昭山示范区': 12000,
            '湘潭县': 15000
        };
        
        return districtDistances[propertyData.district] || 5000;
    }
    
    // 计算交通便利度评分
    calculateTransportScore(propertyData) {
        // 模拟交通便利度评分
        const transportScores = {
            '雨湖区': 90,
            '岳塘区': 85,
            '九华经开区': 75,
            '昭山示范区': 65,
            '湘潭县': 60
        };
        
        return transportScores[propertyData.district] || 70;
    }
    
    // 计算周边配套设施评分
    calculateAmenitiesScore(propertyData) {
        // 模拟配套设施评分
        const amenitiesScores = {
            '雨湖区': 95,
            '岳塘区': 90,
            '九华经开区': 80,
            '昭山示范区': 70,
            '湘潭县': 65
        };
        
        return amenitiesScores[propertyData.district] || 75;
    }
    
    // 计算环境质量评分
    calculateEnvironmentScore(propertyData) {
        // 模拟环境质量评分
        const environmentScores = {
            '雨湖区': 70,
            '岳塘区': 75,
            '九华经开区': 85,
            '昭山示范区': 95,
            '湘潭县': 90
        };
        
        return environmentScores[propertyData.district] || 80;
    }
    
    // 市场因子分析
    analyzeMarketFactors(propertyData) {
        const marketTrendScore = this.calculateMarketTrendScore(propertyData);
        const supplyDemandScore = this.calculateSupplyDemandScore(propertyData);
        const priceComparisonScore = this.calculatePriceComparisonScore(propertyData);
        
        return {
            marketTrendScore,
            supplyDemandScore,
            priceComparisonScore,
            combined: (marketTrendScore * 0.5 + supplyDemandScore * 0.3 + priceComparisonScore * 0.2)
        };
    }
    
    // 计算供需关系评分
    calculateSupplyDemandScore(propertyData) {
        // 模拟供需关系评分
        const supplyDemandScores = {
            '雨湖区': 75,
            '岳塘区': 80,
            '九华经开区': 90,
            '昭山示范区': 85,
            '湘潭县': 70
        };
        
        return supplyDemandScores[propertyData.district] || 80;
    }
    
    // 计算价格对比评分
    calculatePriceComparisonScore(propertyData) {
        // 模拟价格对比评分
        return Math.random() * 20 + 80;
    }
    
    // 投资因子分析
    analyzeInvestmentFactors(propertyData) {
        return {
            roiScore: this.calculateROIScore(propertyData),
            growthPotentialScore: this.calculateGrowthPotentialScore(propertyData),
            riskScore: this.calculateRiskScore(propertyData)
        };
    }
    
    // 政策因子分析
    analyzePolicyFactors(propertyData) {
        const policyScore = this.calculatePolicyScore(propertyData);
        const regulatoryRisk = this.calculateRegulatoryRisk(propertyData);
        const incentiveSupport = this.calculateIncentiveSupport(propertyData);
        
        return {
            policyScore,
            regulatoryRisk,
            incentiveSupport,
            combined: (policyScore * 0.6 + (100 - regulatoryRisk) * 0.2 + incentiveSupport * 0.2)
        };
    }
    
    // 计算政策监管风险
    calculateRegulatoryRisk(propertyData) {
        // 模拟监管风险评分
        const regulatoryRisks = {
            '雨湖区': 30,
            '岳塘区': 25,
            '九华经开区': 20,
            '昭山示范区': 15,
            '湘潭县': 35
        };
        
        return regulatoryRisks[propertyData.district] || 25;
    }
    
    // 计算政策激励支持
    calculateIncentiveSupport(propertyData) {
        // 模拟政策激励支持评分
        const incentiveSupports = {
            '雨湖区': 60,
            '岳塘区': 65,
            '九华经开区': 90,
            '昭山示范区': 85,
            '湘潭县': 70
        };
        
        return incentiveSupports[propertyData.district] || 70;
    }
    
    // Generate investment advice
    generateInvestmentAdvice(score) {
        if (score >= 80) {
            return '强烈推荐投资：该区域具有较高的投资价值和增长潜力，风险较低。';
        } else if (score >= 65) {
            return '推荐投资：该区域具有较好的投资价值，适合中长期持有。';
        } else if (score >= 50) {
            return '谨慎投资：该区域投资价值一般，建议结合其他因素综合考虑。';
        } else {
            return '不推荐投资：该区域投资风险较高，建议谨慎考虑。';
        }
    }
    
    // Enhanced comprehensive valuation model
    comprehensiveValuation(propertyData) {
        const params = this.modelParams.comprehensive;
        
        // Deep analysis of factors
        const baseFactors = this.evaluateBaseFactors(propertyData);
        const locationFactors = this.analyzeLocationFactors(propertyData);
        const marketFactors = this.analyzeMarketFactors(propertyData);
        const policyFactors = this.analyzePolicyFactors(propertyData);
        
        // Calculate scores with deeper insights
        const locationScore = locationFactors.combined;
        const areaScore = baseFactors.areaScore;
        const layoutScore = baseFactors.layoutScore;
        const decorationScore = baseFactors.decorationScore;
        const marketTrendScore = marketFactors.combined;
        const policyScore = policyFactors.combined;
        
        // Weighted sum
        const finalScore = 
            locationScore * params.locationWeight +
            areaScore * params.areaWeight +
            layoutScore * params.layoutWeight +
            decorationScore * params.decorationWeight +
            marketTrendScore * params.marketTrendWeight +
            policyScore * params.policyWeight;
        
        // Convert score to price
        const basePrice = propertyData.avgPrice || 6000;
        const estimatedPrice = basePrice * (1 + (finalScore - 50) / 100);
        
        // Create comprehensive result with detailed analysis
        const result = new ValuationResultModel();
        result.estimatedPrice = Math.round(estimatedPrice);
        result.confidence = Math.min(95, Math.max(60, finalScore));
        result.valuationModel = 'comprehensive';
        result.breakdown = {
            locationScore,
            areaScore,
            layoutScore,
            decorationScore,
            marketTrendScore,
            policyScore
        };
        result.marketTrend = marketFactors;
        result.riskAssessment = {
            policyRisk: policyFactors.regulatoryRisk,
            marketRisk: 100 - marketFactors.supplyDemandScore,
            locationRisk: 100 - locationFactors.combined
        };
        
        return result;
    }

    // Estimate property value
    estimateProperty(propertyData, modelType = 'comprehensive') {
        const valuationModel = this.valuationModels[modelType];
        
        if (!valuationModel) {
            throw new Error(`Invalid valuation model: ${modelType}`);
        }
        
        // Create property data model instance
        const propertyModel = new PropertyDataModel();
        Object.assign(propertyModel, propertyData);
        
        const result = valuationModel(propertyModel);
        
        // Add property ID to result
        result.propertyId = propertyModel.id || `property-${Date.now()}`;
        result.id = `valuation-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Add investment advice for investment model
        if (modelType === 'investment') {
            result.investmentAdvice = this.generateInvestmentAdvice(result.confidence);
        }
        
        // Display result
        this.displayValuationResult(result, propertyModel);
        
        return result;
    }

    // Display valuation result
    displayValuationResult(result, propertyData) {
        const content = `
            <div style="width: 400px; padding: 20px;">
                <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">房产估价结果</h3>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">估价单价</p>
                        <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1890ff;">
                            ¥${result.estimatedPrice.toLocaleString()}/㎡
                        </p>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
                            置信度：<span style="color: #52c41a; font-weight: bold;">${result.confidence}%</span>
                        </p>
                    </div>
                </div>
                
                <h4 style="margin: 0 0 15px 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">估价明细</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    ${Object.entries(result.breakdown).map(([key, value]) => `
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 10px; text-align: left; color: #666; font-weight: 500;">${this.getScoreLabel(key)}</td>
                            <td style="padding: 10px; text-align: right; font-weight: bold; color: #333;">${Math.round(value)}</td>
                        </tr>
                    `).join('')}
                </table>
                
                ${result.marketTrend ? `
                    <div style="background: #fafafa; border: 1px solid #e8e8e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #333; font-size: 14px;">市场趋势分析</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">市场趋势：<strong>${Math.round(result.marketTrend.combined)}</strong></p>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">供需关系：<strong>${Math.round(result.marketTrend.supplyDemandScore)}</strong></p>
                            </div>
                            <div>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">价格对比：<strong>${Math.round(result.marketTrend.priceComparisonScore)}</strong></p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${result.riskAssessment ? `
                    <div style="background: #fff2f0; border: 1px solid #ffccc7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #ff4d4f; font-size: 14px;">风险评估</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">政策风险：<strong>${Math.round(result.riskAssessment.policyRisk)}</strong></p>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">市场风险：<strong>${Math.round(result.riskAssessment.marketRisk)}</strong></p>
                            </div>
                            <div>
                                <p style="margin: 5px 0; font-size: 13px; color: #666;">位置风险：<strong>${Math.round(result.riskAssessment.locationRisk)}</strong></p>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                ${result.investmentAdvice ? `
                    <div style="background: #f6ffed; border: 1px solid #b7eb8f; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #52c41a; font-size: 14px;">投资建议</h4>
                        <p style="margin: 0; color: #52c41a; font-size: 14px;">${result.investmentAdvice}</p>
                    </div>
                ` : ''}
                
                <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: space-between;">
                    <button onclick="mapValuationSystem.valuationEngine.exportValuation(${JSON.stringify(result).replace(/"/g, '&quot;')}, ${JSON.stringify(propertyData).replace(/"/g, '&quot;')})" style="flex: 1; padding: 10px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">导出完整报告</button>
                    <button onclick="mapValuationSystem.valuationEngine.shareValuationResult(${JSON.stringify(result).replace(/"/g, '&quot;')})" style="flex: 1; padding: 10px 16px; background: #fa8c16; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">分享估价结果</button>
                </div>
            </div>
        `;
        
        // Create a custom modal
        this.createModal('房产估价结果', content);
    }

    // Get score label
    getScoreLabel(key) {
        const labels = {
            locationScore: '位置评分',
            areaScore: '面积评分',
            layoutScore: '户型评分',
            decorationScore: '装修评分',
            marketTrendScore: '市场趋势',
            policyScore: '政策影响',
            roiScore: '回报率',
            growthPotentialScore: '增长潜力',
            riskScore: '风险评分'
        };
        
        return labels[key] || key;
    }

    // Create modal (simplified implementation)
    createModal(title, content) {
        // Remove existing modal if any
        const existingModal = document.getElementById('valuation-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'valuation-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            max-width: 90%;
            max-height: 90%;
            overflow-y: auto;
        `;
        
        const modalHeader = document.createElement('div');
        modalHeader.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const modalTitle = document.createElement('h2');
        modalTitle.textContent = title;
        modalTitle.style.cssText = `
            margin: 0;
            font-size: 18px;
            color: #333;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
        `;
        closeBtn.onclick = () => modal.remove();
        
        const modalBody = document.createElement('div');
        modalBody.innerHTML = content;
        
        // Assemble modal
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modal.appendChild(modalContent);
        
        // Add to document
        document.body.appendChild(modal);
    }
    
    // API服务：获取市场数据
    async getMarketData(district) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    const marketData = new MarketDataModel();
                    marketData.district = district;
                    marketData.avgPrice = this.getDistrictAvgPrice(district);
                    marketData.priceTrend = this.generatePriceTrend(district);
                    marketData.inventory = Math.floor(Math.random() * 1000) + 500;
                    marketData.transactionVolume = Math.floor(Math.random() * 500) + 200;
                    marketData.rentalYield = (Math.random() * 2 + 2).toFixed(2);
                    marketData.supplyDemandRatio = (Math.random() * 0.5 + 0.8).toFixed(2);
                    
                    resolve(marketData);
                }, 500);
            });
        } catch (error) {
            console.error('获取市场数据失败:', error);
            throw error;
        }
    }
    
    // API服务：保存估价结果
    async saveValuationResult(result) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log('估价结果已保存:', result.id);
                    resolve({ success: true, id: result.id });
                }, 300);
            });
        } catch (error) {
            console.error('保存估价结果失败:', error);
            throw error;
        }
    }
    
    // API服务：获取估价历史
    async getValuationHistory(propertyId) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([]);
                }, 300);
            });
        } catch (error) {
            console.error('获取估价历史失败:', error);
            throw error;
        }
    }
    
    // API服务：获取对比数据
    async getComparativeData(propertyData) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        similarProperties: [],
                        districtAverage: this.getDistrictAvgPrice(propertyData.district),
                        cityAverage: 6500
                    });
                }, 400);
            });
        } catch (error) {
            console.error('获取对比数据失败:', error);
            throw error;
        }
    }
    
    // API服务：获取风险评估
    async getRiskAssessment(propertyData) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        policyRisk: this.calculateRegulatoryRisk(propertyData),
                        marketRisk: Math.random() * 30 + 20,
                        liquidityRisk: Math.random() * 25 + 15,
                        overallRisk: Math.random() * 30 + 25
                    });
                }, 300);
            });
        } catch (error) {
            console.error('获取风险评估失败:', error);
            throw error;
        }
    }
    
    // API服务：获取投资建议
    async getInvestmentAdvice(score) {
        try {
            // 模拟API调用
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(this.generateInvestmentAdvice(score));
                }, 200);
            });
        } catch (error) {
            console.error('获取投资建议失败:', error);
            throw error;
        }
    }
    
    // 获取区域平均价格
    getDistrictAvgPrice(district) {
        const avgPrices = {
            '雨湖区': 7200,
            '岳塘区': 6800,
            '九华经开区': 6200,
            '昭山示范区': 5800,
            '湘潭县': 5500
        };
        
        return avgPrices[district] || 6000;
    }
    
    // 生成价格趋势数据
    generatePriceTrend(district) {
        const basePrice = this.getDistrictAvgPrice(district);
        const trend = [];
        
        // 生成过去12个月的价格趋势
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const price = basePrice * (1 + (Math.random() - 0.5) * 0.1);
            
            trend.push({
                date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                price: Math.round(price)
            });
        }
        
        return trend;
    }
    
    // 导出估价报告
    exportValuation(result, propertyData) {
        try {
            // 生成报告内容
            const reportContent = this.generateValuationReport(result, propertyData);
            
            // 创建Blob对象
            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = `房产估价报告_${result.id}_${new Date().toISOString().slice(0, 10)}.txt`;
            link.click();
            
            // 清理
            URL.revokeObjectURL(url);
            
            console.log('估价报告已导出:', result.id);
        } catch (error) {
            console.error('导出估价报告失败:', error);
            alert('导出报告失败，请重试');
        }
    }
    
    // 生成估价报告
    generateValuationReport(result, propertyData) {
        const report = `
房产估价报告
====================

报告编号: ${result.id}
估价日期: ${new Date(result.valuationDate).toLocaleString()}
房产编号: ${result.propertyId}

一、房产基本信息
----------------
小区名称: ${propertyData.community || '未知'}
区域: ${propertyData.district || '未知'} - ${propertyData.subDistrict || '未知'}
建筑面积: ${propertyData.area || 0} ㎡
户型: ${propertyData.layout || '未知'}
装修情况: ${propertyData.decoration || '未知'}

二、估价结果
------------
估价单价: ¥${result.estimatedPrice.toLocaleString()}/㎡
总价估计: ¥${(result.estimatedPrice * (propertyData.area || 100)).toLocaleString()}
置信度: ${result.confidence}%
估价模型: ${result.valuationModel === 'comprehensive' ? '综合估价模型' : result.valuationModel === 'simple' ? '简单估价模型' : '投资估价模型'}

三、估价明细
------------
${Object.entries(result.breakdown).map(([key, value]) => `
${this.getScoreLabel(key)}: ${Math.round(value)} 分`).join('')}

四、市场趋势分析
--------------
${result.marketTrend ? `
市场趋势评分: ${Math.round(result.marketTrend.combined)} 分
供需关系评分: ${Math.round(result.marketTrend.supplyDemandScore)} 分
价格对比评分: ${Math.round(result.marketTrend.priceComparisonScore)} 分
` : '暂无市场趋势数据'}

五、风险评估
------------
${result.riskAssessment ? `
政策风险: ${Math.round(result.riskAssessment.policyRisk)} 分
市场风险: ${Math.round(result.riskAssessment.marketRisk)} 分
位置风险: ${Math.round(result.riskAssessment.locationRisk)} 分
` : '暂无风险评估数据'}

六、投资建议
------------
${result.investmentAdvice || '暂无投资建议'}

七、附加说明
------------
1. 本报告仅作为参考，不构成任何投资建议
2. 估价结果基于当前市场数据，可能随市场变化而波动
3. 详细信息请咨询专业房产评估机构
4. 报告有效期：3个月

====================
报告生成时间: ${new Date().toLocaleString()}
房产估价系统 v1.0
`;
        
        return report;
    }
    
    // 分享估价结果
    shareValuationResult(result) {
        try {
            // 生成分享链接（模拟）
            const shareUrl = `${window.location.origin}${window.location.pathname}?valuation=${result.id}`;
            
            // 复制到剪贴板
            this.copyToClipboard(shareUrl);
            
            alert('估价结果分享链接已复制到剪贴板！');
            console.log('估价结果已分享:', result.id);
        } catch (error) {
            console.error('分享估价结果失败:', error);
            alert('分享失败，请重试');
        }
    }
    
    // 复制到剪贴板
    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // 现代浏览器支持
            return navigator.clipboard.writeText(text);
        } else {
            // 兼容性处理
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
    }
    
    // 设置估价模型
    setValuationModel(modelType) {
        if (this.valuationModels[modelType]) {
            this.currentModel = modelType;
            console.log(`估价模型已切换为: ${modelType}`);
            return true;
        }
        console.error(`无效的估价模型: ${modelType}`);
        return false;
    }
    
    // 获取当前估价模型
    getCurrentValuationModel() {
        return this.currentModel;
    }
    
    // 更新估价参数
    updateModelParams(modelType, params) {
        if (this.modelParams[modelType]) {
            this.modelParams[modelType] = { ...this.modelParams[modelType], ...params };
            console.log(`估价模型参数已更新: ${modelType}`, params);
            return true;
        }
        console.error(`无效的估价模型: ${modelType}`);
        return false;
    }
    
    // 获取估价参数
    getModelParams(modelType) {
        return this.modelParams[modelType] || null;
    }
    
    // 获取所有估价模型
    getAllValuationModels() {
        return Object.keys(this.valuationModels);
    }
    
    // 批量估价
    async batchValuation(properties) {
        const results = [];
        
        for (const property of properties) {
            try {
                const result = this.estimateProperty(property, this.currentModel);
                results.push(result);
            } catch (error) {
                console.error(`批量估价失败: ${property.id || '未知'}`, error);
            }
        }
        
        return results;
    }
    
    // 比较多个房产估价结果
    compareValuations(results) {
        if (!Array.isArray(results) || results.length < 2) {
            throw new Error('至少需要两个估价结果进行比较');
        }
        
        // 计算平均值
        const avgPrice = results.reduce((sum, result) => sum + result.estimatedPrice, 0) / results.length;
        
        // 找出最高价和最低价
        const maxPrice = Math.max(...results.map(r => r.estimatedPrice));
        const minPrice = Math.min(...results.map(r => r.estimatedPrice));
        
        // 计算置信度平均值
        const avgConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
        
        return {
            avgPrice: Math.round(avgPrice),
            maxPrice,
            minPrice,
            priceRange: maxPrice - minPrice,
            avgConfidence: Math.round(avgConfidence),
            comparisonCount: results.length,
            details: results.map((result, index) => ({
                index: index + 1,
                estimatedPrice: result.estimatedPrice,
                confidence: result.confidence,
                propertyId: result.propertyId
            }))
        };
    }
}

// 系统初始化函数
function initMapValuationSystem() {
    return {
        DataProcessor,
        MapCore,
        ValuationEngine,
        PropertyDataModel,
        ValuationResultModel,
        MarketDataModel
    };
}

// 导出系统（用于浏览器环境）
if (typeof window !== 'undefined') {
    window.MapValuationSystem = initMapValuationSystem();
}