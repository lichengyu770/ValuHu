// 数据清洗服务
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

// 配置文件路径
const DATA_DIR = path.join(__dirname, '../data');

/**
 * 数据清洗器类
 */
class DataCleaner {
    constructor() {
        this.cleanedData = [];
    }

    /**
     * 清洗房产数据
     * @param {Array} rawData 原始数据
     * @returns {Array} 清洗后的数据
     */
    cleanPropertyData(rawData) {
        return rawData.map(item => {
            // 基础清洗
            const cleaned = {
                id: item.id || `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                address: this.cleanAddress(item.address || ''),
                city: item.city || '',
                district: item.district || '',
                area: this.cleanNumber(item.area, 0),
                rooms: this.cleanNumber(item.rooms, 1),
                bathrooms: this.cleanNumber(item.bathrooms, 1),
                floor_level: this.cleanFloor(item.floor || ''),
                total_floors: this.cleanNumber(item.total_floors, 1),
                building_year: this.cleanYear(item.year || item.building_year || ''),
                property_type: this.cleanPropertyType(item.property_type || ''),
                orientation: this.cleanOrientation(item.orientation || ''),
                decoration_status: this.cleanDecorationStatus(item.decoration_status || ''),
                price: this.cleanNumber(item.price, 0),
                price_per_sqm: this.cleanNumber(item.price_per_sqm || (item.price && item.area ? item.price / item.area : 0), 0),
                latitude: this.cleanNumber(item.latitude, 0),
                longitude: this.cleanNumber(item.longitude, 0),
                source: item.source || 'unknown',
                collected_at: item.timestamp || new Date().toISOString(),
                cleaned_at: new Date().toISOString()
            };

            // 额外的衍生特征
            cleaned.age = this.calculateAge(cleaned.building_year);
            cleaned.size_category = this.getSizeCategory(cleaned.area);
            cleaned.floor_category = this.getFloorCategory(cleaned.floor_level, cleaned.total_floors);

            return cleaned;
        }).filter(item => {
            // 过滤无效数据
            return item.area > 0 && item.price > 0;
        });
    }

    /**
     * 清洗地址
     * @param {string} address 原始地址
     * @returns {string} 清洗后的地址
     */
    cleanAddress(address) {
        return address
            .trim()
            .replace(/[\s]+/g, ' ')
            .replace(/[\t\r\n]+/g, ' ');
    }

    /**
     * 清洗数字
     * @param {any} value 原始值
     * @param {number} defaultValue 默认值
     * @returns {number} 清洗后的数字
     */
    cleanNumber(value, defaultValue) {
        const num = parseFloat(value);
        return isNaN(num) ? defaultValue : num;
    }

    /**
     * 清洗楼层
     * @param {string|number} floor 原始楼层
     * @returns {number} 清洗后的楼层
     */
    cleanFloor(floor) {
        if (typeof floor === 'number') {
            return floor;
        }
        const floorStr = floor.toString().trim();
        // 从字符串中提取数字，如"15/30" -> 15
        const match = floorStr.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * 清洗年份
     * @param {string|number} year 原始年份
     * @returns {number} 清洗后的年份
     */
    cleanYear(year) {
        const currentYear = new Date().getFullYear();
        let cleanedYear;
        
        if (typeof year === 'number') {
            cleanedYear = year;
        } else {
            const yearStr = year.toString().trim();
            const match = yearStr.match(/(\d{4})/);
            cleanedYear = match ? parseInt(match[1]) : currentYear;
        }
        
        // 确保年份在合理范围内
        if (cleanedYear < 1900 || cleanedYear > currentYear + 5) {
            cleanedYear = currentYear;
        }
        
        return cleanedYear;
    }

    /**
     * 清洗房产类型
     * @param {string} type 原始类型
     * @returns {string} 清洗后的类型
     */
    cleanPropertyType(type) {
        const types = {
            '住宅': 'apartment',
            '公寓': 'apartment',
            '别墅': 'villa',
            '商铺': 'commercial',
            '写字楼': 'office',
            '工业': 'industrial',
            'townhouse': 'townhouse',
            'office': 'office',
            'commercial': 'commercial',
            'industrial': 'industrial'
        };
        
        const lowerType = type.toLowerCase().trim();
        return types[lowerType] || types[type] || 'other';
    }

    /**
     * 清洗朝向
     * @param {string} orientation 原始朝向
     * @returns {string} 清洗后的朝向
     */
    cleanOrientation(orientation) {
        const orientations = {
            '南': 'south',
            '北': 'north',
            '东': 'east',
            '西': 'west',
            '东南': 'southeast',
            '东北': 'northeast',
            '西南': 'southwest',
            '西北': 'northwest',
            'south': 'south',
            'north': 'north',
            'east': 'east',
            'west': 'west',
            'southeast': 'southeast',
            'northeast': 'northeast',
            'southwest': 'southwest',
            'northwest': 'northwest'
        };
        
        const lowerOrientation = orientation.toLowerCase().trim();
        return orientations[lowerOrientation] || orientations[orientation] || 'unknown';
    }

    /**
     * 清洗装修状况
     * @param {string} status 原始状况
     * @returns {string} 清洗后的状况
     */
    cleanDecorationStatus(status) {
        const statuses = {
            '毛坯': 'rough',
            '简装': 'simple',
            '精装': 'fine',
            '豪华装修': 'luxury',
            'rough': 'rough',
            'simple': 'simple',
            'fine': 'fine',
            'luxury': 'luxury'
        };
        
        const lowerStatus = status.toLowerCase().trim();
        return statuses[lowerStatus] || statuses[status] || 'unknown';
    }

    /**
     * 计算房龄
     * @param {number} buildingYear 建筑年份
     * @returns {number} 房龄
     */
    calculateAge(buildingYear) {
        const currentYear = new Date().getFullYear();
        return Math.max(0, currentYear - buildingYear);
    }

    /**
     * 获取面积类别
     * @param {number} area 面积
     * @returns {string} 面积类别
     */
    getSizeCategory(area) {
        if (area < 60) return 'small';
        if (area < 90) return 'medium';
        if (area < 144) return 'large';
        return 'extra_large';
    }

    /**
     * 获取楼层类别
     * @param {number} floorLevel 当前楼层
     * @param {number} totalFloors 总楼层
     * @returns {string} 楼层类别
     */
    getFloorCategory(floorLevel, totalFloors) {
        if (floorLevel === 0 || totalFloors === 0) return 'unknown';
        if (floorLevel <= 3) return 'low';
        if (floorLevel <= totalFloors * 0.7) return 'middle';
        return 'high';
    }

    /**
     * 清洗原始数据文件
     * @param {string} filePath 原始数据文件路径
     * @returns {Array} 清洗后的数据
     */
    cleanDataFile(filePath) {
        try {
            const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let dataToClean;
            
            // 处理不同格式的原始数据
            if (Array.isArray(rawData)) {
                dataToClean = rawData;
            } else if (rawData.data && Array.isArray(rawData.data)) {
                dataToClean = rawData.data;
            } else {
                dataToClean = [rawData];
            }
            
            const cleaned = this.cleanPropertyData(dataToClean);
            this.cleanedData = this.cleanedData.concat(cleaned);
            
            // 保存清洗后的数据
            const cleanedFilename = path.basename(filePath).replace('raw_', 'cleaned_');
            this.saveCleanedData(cleaned, cleanedFilename);
            
            console.log(`成功清洗文件 ${filePath}，共处理 ${dataToClean.length} 条记录，清洗后 ${cleaned.length} 条有效记录`);
            return cleaned;
        } catch (error) {
            console.error(`清洗文件 ${filePath} 失败:`, error.message);
            return [];
        }
    }

    /**
     * 批量清洗目录中的原始数据文件
     * @param {string} rawDataDir 原始数据目录
     * @returns {Array} 所有清洗后的数据
     */
    batchClean(rawDataDir) {
        try {
            const files = fs.readdirSync(rawDataDir);
            const rawFiles = files.filter(file => file.startsWith('raw_') && file.endsWith('.json'));
            
            for (const file of rawFiles) {
                const filePath = path.join(rawDataDir, file);
                this.cleanDataFile(filePath);
            }
            
            // 保存所有清洗后的数据到一个文件
            const allCleanedFilename = `all_cleaned_${new Date().toISOString().slice(0, 10)}.json`;
            this.saveCleanedData(this.cleanedData, allCleanedFilename);
            
            console.log(`批量清洗完成，共处理 ${rawFiles.length} 个文件，总记录数 ${this.cleanedData.length}`);
            return this.cleanedData;
        } catch (error) {
            console.error('批量清洗失败:', error.message);
            return [];
        }
    }

    /**
     * 保存清洗后的数据
     * @param {Array} data 清洗后的数据
     * @param {string} filename 文件名
     */
    saveCleanedData(data, filename) {
        const cleanedDataDir = path.join(DATA_DIR, 'cleaned_data');
        
        // 确保目录存在
        if (!fs.existsSync(cleanedDataDir)) {
            fs.mkdirSync(cleanedDataDir, { recursive: true });
        }
        
        const filepath = path.join(cleanedDataDir, filename);
        
        try {
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`清洗后的数据已保存到 ${filepath}`);
        } catch (error) {
            console.error('保存清洗后的数据失败:', error.message);
        }
    }

    /**
     * 获取清洗后的所有数据
     * @returns {Array} 清洗后的所有数据
     */
    getCleanedData() {
        return this.cleanedData;
    }

    /**
     * 将清洗后的数据保存到数据库
     * @param {Array} data 清洗后的数据
     * @returns {Promise<number>} 成功保存的记录数
     */
    async saveToDatabase(data) {
        if (!data || data.length === 0) {
            console.log('没有数据需要保存到数据库');
            return 0;
        }

        let savedCount = 0;

        for (const property of data) {
            try {
                const sql = `
                    INSERT INTO property_details (
                        property_id, address, city, district, area, rooms, bathrooms,
                        floor_level, total_floors, building_year, property_type, orientation,
                        decoration_status, price, price_per_sqm, latitude, longitude,
                        source, collected_at, cleaned_at, age, size_category, floor_category
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                    ON CONFLICT (property_id) DO UPDATE SET
                        address = EXCLUDED.address,
                        city = EXCLUDED.city,
                        district = EXCLUDED.district,
                        area = EXCLUDED.area,
                        rooms = EXCLUDED.rooms,
                        bathrooms = EXCLUDED.bathrooms,
                        floor_level = EXCLUDED.floor_level,
                        total_floors = EXCLUDED.total_floors,
                        building_year = EXCLUDED.building_year,
                        property_type = EXCLUDED.property_type,
                        orientation = EXCLUDED.orientation,
                        decoration_status = EXCLUDED.decoration_status,
                        price = EXCLUDED.price,
                        price_per_sqm = EXCLUDED.price_per_sqm,
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        source = EXCLUDED.source,
                        collected_at = EXCLUDED.collected_at,
                        cleaned_at = EXCLUDED.cleaned_at,
                        age = EXCLUDED.age,
                        size_category = EXCLUDED.size_category,
                        floor_category = EXCLUDED.floor_category,
                        updated_at = NOW()
                `;

                const values = [
                    property.id,
                    property.address,
                    property.city,
                    property.district,
                    property.area,
                    property.rooms,
                    property.bathrooms,
                    property.floor_level,
                    property.total_floors,
                    property.building_year,
                    property.property_type,
                    property.orientation,
                    property.decoration_status,
                    property.price,
                    property.price_per_sqm,
                    property.latitude,
                    property.longitude,
                    property.source,
                    property.collected_at,
                    property.cleaned_at,
                    property.age,
                    property.size_category,
                    property.floor_category
                ];

                await query(sql, values);
                savedCount++;
            } catch (error) {
                console.error(`保存房产数据到数据库失败 (${property.id}):`, error.message);
            }
        }

        console.log(`成功将 ${savedCount} 条记录保存到数据库`);
        return savedCount;
    }
}

// 导出数据清洗器实例
const dataCleaner = new DataCleaner();

// 测试数据清洗
async function testDataCleaning() {
    console.log('测试数据清洗服务...');
    
    const testData = [
        {
            address: '北京市朝阳区建国路88号',
            city: '北京市',
            district: '朝阳区',
            area: 120,
            rooms: 3,
            bathrooms: 2,
            floor: '15/30',
            year: '2015',
            property_type: '住宅',
            orientation: '南北',
            decoration_status: '精装',
            price: 6000000,
            latitude: 39.9042,
            longitude: 116.4074,
            source: 'test_source'
        },
        {
            address: '上海市浦东新区陆家嘴金融中心',
            city: '上海市',
            district: '浦东新区',
            area: 85,
            rooms: 2,
            bathrooms: 1,
            floor: '8/25',
            building_year: 2018,
            property_type: '公寓',
            orientation: '东南',
            decoration_status: '简装',
            price: 4250000,
            latitude: 31.2304,
            longitude: 121.4737,
            source: 'test_source'
        }
    ];
    
    const cleaned = dataCleaner.cleanPropertyData(testData);
    console.log('测试清洗结果:', cleaned);
    
    // 测试保存到数据库
    try {
        console.log('测试保存到数据库...');
        const savedCount = await dataCleaner.saveToDatabase(cleaned);
        console.log(`成功保存 ${savedCount} 条记录到数据库`);
    } catch (error) {
        console.error('保存到数据库测试失败:', error.message);
    }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
    testDataCleaning();
}

module.exports = {
    DataCleaner,
    dataCleaner
};
