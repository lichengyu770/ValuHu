const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    importYuhu100Properties();
  }
});

// 雨湖区100个小区房源数据
const yuhu100Properties = [
    { name: '十八总·湘江图', price: 30000 },
    { name: '时代建发和著', price: 20000 },
    { name: '雅士林欣城(别墅)', price: 12954 },
    { name: '奥园冠军城(别墅)', price: 8349 },
    { name: '天元观湘云顶', price: 8800 },
    { name: '新城璟隽(别墅)', price: 7355 },
    { name: '滨江花园(雨湖别墅)', price: 7147 },
    { name: '兰亭苑', price: 6938 },
    { name: '锦绣世家', price: 12000 },
    { name: '白石古莲城', price: 6300 },
    { name: '长房·万楼公馆', price: 6300 },
    { name: '中国铁建·和平央著', price: 6100 },
    { name: '绿地湘江城际空间站', price: 6100 },
    { name: '城郊香樟园南院', price: 6000 },
    { name: '天元广场·玺园', price: 5988 },
    { name: '天元广场', price: 5800 },
    { name: '城发·潭州壹号院', price: 5800 },
    { name: '万楼湘玺', price: 5577 },
    { name: '愿景朗悦府', price: 5500 },
    { name: '中铁·和著莲城', price: 5200 },
    { name: '中冶·大学里', price: 5000 },
    { name: '城发·滨湖西郡3期', price: 5000 },
    { name: '富鑫源小区', price: 4900 },
    { name: '锦绣世家西苑', price: 4800 },
    { name: '旺城天誉', price: 4500 },
    { name: '滨湖西郡', price: 4300 },
    { name: '阳光山庄紫竹园', price: 4238 },
    { name: '龙湾名苑', price: 3950 },
    { name: '雨湖大厦', price: 3700 },
    { name: '罗源时代广场', price: 3750 },
    { name: '白石公馆', price: 3650 },
    { name: '湖园小区', price: 3776 },
    { name: '新景西城上筑', price: 3539 },
    { name: '宜家美景小区', price: 3407 },
    { name: '汇丰大厦', price: 3450 },
    { name: '公路局宿舍', price: 3506 },
    { name: '吉利帝豪国际', price: 3202 },
    { name: '润华苑', price: 3202 },
    { name: '红城公寓', price: 3250 },
    { name: '电业局云塘小区', price: 3250 },
    { name: '车站路小区', price: 3301 },
    { name: '怡美园', price: 3300 },
    { name: '杨家湾社区', price: 3100 },
    { name: '丽江花苑', price: 3100 },
    { name: '广园花苑', price: 3072 },
    { name: '雨湖区税务局宿舍', price: 3057 },
    { name: '泗洲绿园', price: 3028 },
    { name: '莲花街小区', price: 3000 },
    { name: '林业小区', price: 3000 },
    { name: '大同世界花苑', price: 2917 },
    { name: '韶山东路47号小区', price: 2976 },
    { name: '供销宿舍', price: 2900 },
    { name: '城郊馨香园', price: 2952 },
    { name: '骄杨公寓', price: 2800 },
    { name: '嘉盛金桂园', price: 2800 },
    { name: '建城路小区', price: 2793 },
    { name: '湘佳上城', price: 2762 },
    { name: '人民银行宿舍湘潭支行宿舍楼', price: 2700 },
    { name: '建城路城管宿舍', price: 2720 },
    { name: '建城路银行宿舍', price: 2730 },
    { name: '建城路31号宿舍', price: 2740 },
    { name: '通济门社区', price: 1334 },
    { name: '黄芝山廉租公寓', price: 1350 },
    { name: '永丰家园', price: 1421 },
    { name: '繁城村兴无组', price: 1600 },
    { name: '大新村自建房', price: 1700 },
    { name: '岚天阳光', price: 1626 },
    { name: '如意楼', price: 1835 },
    { name: '鹤岭镇红旗社区', price: 2048 },
    { name: '鹤岭镇花园市场北楼', price: 2132 },
    { name: '朝阳廉租公寓', price: 2100 },
    { name: '心澄公寓', price: 4030 },
    { name: '易家湖公寓', price: 3150 },
    { name: '湘隆公寓', price: 3300 },
    { name: '文西公寓', price: 2800 },
    { name: '天骄公寓', price: 3550 },
    { name: '龙凤佳园', price: 2650 },
    { name: '老布市场', price: 2850 },
    { name: '湘潭大学教师公寓', price: 2950 },
    { name: '雨湖花苑', price: 2650 },
    { name: '旺馨小区', price: 2950 },
    { name: '百姓家园同馨园', price: 3100 },
    { name: '阳光大厦', price: 2800 },
    { name: '碧湖雅筑', price: 3450 },
    { name: '教师公寓三村', price: 2800 },
    { name: '滨湖小区', price: 3050 },
    { name: '瞻岳门社区', price: 2750 },
    { name: '长兴楼', price: 4800 },
    { name: '泽丰华庭', price: 3300 },
    { name: '金铃公寓', price: 2750 },
    { name: '泽丰御都', price: 3450 },
    { name: '广场街道福利社区', price: 3350 },
    { name: '海诚医药大厦', price: 1950 },
    { name: '金鹰商贸大厦', price: 3200 },
    { name: '何家大屋', price: 2550 },
    { name: '工人新村', price: 2563 },
    { name: '低压电器厂小区', price: 2600 },
    { name: '彩印厂宿舍', price: 2700 },
    { name: '亭子塘中心医院宿舍', price: 2900 },
    { name: '南步街小区', price: 2850 }
];

// 导入雨湖区100个房源数据
function importYuhu100Properties() {
    const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // 插入新数据
    let count = 0;
    const total = yuhu100Properties.length;
    
    yuhu100Properties.forEach(property => {
        // 跳过暂无均价的小区（如果有）
        if (!property.price) return;
        
        // 生成默认值
        const defaultAddress = `雨湖区${property.name}`;
        const defaultRooms = '3室2厅1卫'; // 默认房型
        const defaultArea = '100㎡'; // 默认面积
        const defaultImage = 'https://picsum.photos/seed/' + property.name.replace(/[\s\(\)（）·]/g, '') + '/400/300'; // 生成唯一的随机图片
        const defaultFeatures = JSON.stringify(['parking', 'elevator', 'school']); // 默认特色
        const defaultYear = '2020年建'; // 默认年份
        const defaultFloor = '中楼层'; // 默认楼层
        
        db.run(sql, [
            property.name,
            'xiangtan',
            '雨湖区',
            defaultAddress,
            defaultRooms,
            defaultArea,
            property.price,
            defaultImage,
            defaultFeatures,
            defaultYear,
            defaultFloor
        ], function(err) {
            if (err) {
                console.error('插入数据失败:', err.message);
            } else {
                count++;
                console.log(`已插入 ${count}/${total} 条数据：${property.name}`);
                
                // 所有数据插入完成
                if (count === total) {
                    console.log('所有雨湖区100个房源数据插入完成，共插入', count, '条数据');
                    db.close();
                }
            }
        });
    });
}