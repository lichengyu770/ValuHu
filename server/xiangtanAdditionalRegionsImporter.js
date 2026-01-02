const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    importAdditionalRegionsProperties();
  }
});

// 湘潭其他区域房源数据（湘潭县、湘乡市、韶山市各50条）
const additionalRegionsProperties = [
    // 湘潭县50条房源
    { name: '湘潭碧桂园(别墅)', price: 8768, district: '湘潭县' },
    { name: '碧桂园天玺', price: 6117, district: '湘潭县' },
    { name: '万通逸城', price: 5687, district: '湘潭县' },
    { name: '天易江湾广场', price: 5183, district: '湘潭县' },
    { name: '天元湘江国际', price: 5116, district: '湘潭县' },
    { name: '涓江天易新城', price: 4816, district: '湘潭县' },
    { name: '金霞尚御尊城', price: 4686, district: '湘潭县' },
    { name: '湘潭碧桂园(公寓住宅)', price: 4498, district: '湘潭县' },
    { name: '旺和山水宜城', price: 4200, district: '湘潭县' },
    { name: '中特香堤雅郡', price: 4155, district: '湘潭县' },
    { name: '十里风荷', price: 4100, district: '湘潭县' },
    { name: '海棠湾', price: 3700, district: '湘潭县' },
    { name: '恒郡一期', price: 3700, district: '湘潭县' },
    { name: '子敬龙城', price: 3500, district: '湘潭县' },
    { name: '米罗云山(一期)', price: 3683, district: '湘潭县' },
    { name: '和园小区', price: 3350, district: '湘潭县' },
    { name: '凤凰城', price: 3300, district: '湘潭县' },
    { name: '金鹏小区一院', price: 3050, district: '湘潭县' },
    { name: '长通名城', price: 2943, district: '湘潭县' },
    { name: '上水西郡', price: 2892, district: '湘潭县' },
    { name: '商会大厦', price: 2800, district: '湘潭县' },
    { name: '金莲小区', price: 2800, district: '湘潭县' },
    { name: '江南名府', price: 2930, district: '湘潭县' },
    { name: '酱园小区', price: 2719, district: '湘潭县' },
    { name: '城南春天', price: 2653, district: '湘潭县' },
    { name: '宏通名居', price: 2680, district: '湘潭县' },
    { name: '百花小区', price: 2611, district: '湘潭县' },
    { name: '梧桐小区', price: 2510, district: '湘潭县' },
    { name: '瑞鸿花园', price: 2516, district: '湘潭县' },
    { name: '银杏家园', price: 2301, district: '湘潭县' },
    { name: '海棠花苑', price: 2197, district: '湘潭县' },
    { name: '上水西郡', price: 2254, district: '湘潭县' },
    { name: '金铃东苑南苑', price: 2498, district: '湘潭县' },
    { name: '谭煤宿舍', price: 1564, district: '湘潭县' },
    { name: '通发住宅楼', price: 3650, district: '湘潭县' },
    { name: '银港国际', price: 6000, district: '湘潭县' },
    { name: '江湾', price: 5000, district: '湘潭县' },
    { name: '富鑫花园', price: 3800, district: '湘潭县' },
    { name: '南苑小区', price: 3200, district: '湘潭县' },
    { name: '东城名苑', price: 3900, district: '湘潭县' },
    { name: '鑫海花园', price: 3500, district: '湘潭县' },
    { name: '阳光小区', price: 3100, district: '湘潭县' },
    { name: '幸福家园', price: 2900, district: '湘潭县' },
    { name: '兴盛小区', price: 2700, district: '湘潭县' },
    { name: '民乐小区', price: 2500, district: '湘潭县' },
    { name: '团结小区', price: 2400, district: '湘潭县' },
    { name: '石潭镇富石小区', price: 2300, district: '湘潭县' },
    { name: '青山桥镇青山小区', price: 2100, district: '湘潭县' },
    { name: '花石镇花石小区', price: 2000, district: '湘潭县' },
    { name: '中路铺镇中路小区', price: 1900, district: '湘潭县' },
    
    // 湘乡市50条房源
    { name: '康康国际(新房)', price: 22000, district: '湘乡市' },
    { name: '克拉小镇（商铺）', price: 15000, district: '湘乡市' },
    { name: '滨江熙苑', price: 8229, district: '湘乡市' },
    { name: '燕兴华城五期', price: 8040, district: '湘乡市' },
    { name: '滨江壹号', price: 7494, district: '湘乡市' },
    { name: '盛悦天骄', price: 7644, district: '湘乡市' },
    { name: '湘建中央绿城', price: 7296, district: '湘乡市' },
    { name: '缇香尊邸', price: 7117, district: '湘乡市' },
    { name: '湘房世纪城起凤苑', price: 7214, district: '湘乡市' },
    { name: '凯旋华府', price: 6297, district: '湘乡市' },
    { name: '凯旋名都', price: 6014, district: '湘乡市' },
    { name: '鑫龙丽都', price: 6566, district: '湘乡市' },
    { name: '滨江豪庭', price: 6442, district: '湘乡市' },
    { name: '南岸水乡三期', price: 5735, district: '湘乡市' },
    { name: '湘建中央绿城', price: 4260, district: '湘乡市' },
    { name: '东山电梯房', price: 3634, district: '湘乡市' },
    { name: '盛悦府', price: 4968, district: '湘乡市' },
    { name: '城南公馆', price: 4159, district: '湘乡市' },
    { name: '风华水岸', price: 3903, district: '湘乡市' },
    { name: '电力局老家属院', price: 3909, district: '湘乡市' },
    { name: '湖铁社区', price: 4017, district: '湘乡市' },
    { name: '涟滨小区', price: 3348, district: '湘乡市' },
    { name: '直四牌楼', price: 3370, district: '湘乡市' },
    { name: '华龙嘉园五期', price: 2636, district: '湘乡市' },
    { name: '燕兴佳园', price: 2694, district: '湘乡市' },
    { name: '桑星安置小区', price: 1883, district: '湘乡市' },
    { name: '夏梓桥小区', price: 2023, district: '湘乡市' },
    { name: '林业局集资房', price: 1242, district: '湘乡市' },
    { name: '壶天镇鑫桥花园01栋304', price: 958, district: '湘乡市' },
    { name: '壶天镇鑫桥花园01栋504', price: 949, district: '湘乡市' },
    { name: '壶天镇鑫桥花园01栋404', price: 949, district: '湘乡市' },
    { name: '韶峰社区韶峰新村', price: 1570, district: '湘乡市' },
    { name: '韶灌水利小镇', price: 1750, district: '湘乡市' },
    { name: '锦煌公寓', price: 1900, district: '湘乡市' },
    { name: '夏梓桥67号小区', price: 1950, district: '湘乡市' },
    { name: '竹山湾小区', price: 2000, district: '湘乡市' },
    { name: '龙城花园', price: 3800, district: '湘乡市' },
    { name: '湘乡公馆', price: 4500, district: '湘乡市' },
    { name: '润泽家园', price: 3200, district: '湘乡市' },
    { name: '东方名苑', price: 4800, district: '湘乡市' },
    { name: '育塅乡育塅小区', price: 2100, district: '湘乡市' },
    { name: '梅桥镇梅桥小区', price: 2000, district: '湘乡市' },
    { name: '泉塘镇泉塘小区', price: 1900, district: '湘乡市' },
    { name: '虞塘镇虞塘小区', price: 1800, district: '湘乡市' },
    { name: '棋梓桥镇棋梓小区', price: 2200, district: '湘乡市' },
    { name: '月山镇月山小区', price: 1700, district: '湘乡市' },
    { name: '翻江镇翻江小区', price: 1600, district: '湘乡市' },
    { name: '金薮乡金薮小区', price: 1500, district: '湘乡市' },
    { name: '白田镇白田小区', price: 1650, district: '湘乡市' },
    { name: '金石镇金石小区', price: 1550, district: '湘乡市' },
    
    // 韶山市50条房源
    { name: '富逸·韶山领墅', price: 8500, district: '韶山市' },
    { name: '东方帝景', price: 6800, district: '韶山市' },
    { name: '丰菊嘉苑', price: 6500, district: '韶山市' },
    { name: '韶山碧桂园', price: 6200, district: '韶山市' },
    { name: '润泽东方', price: 5800, district: '韶山市' },
    { name: '天鹅小区', price: 5500, district: '韶山市' },
    { name: '韶山一号', price: 5300, district: '韶山市' },
    { name: '锦绣家园', price: 5100, district: '韶山市' },
    { name: '新城佳园', price: 4900, district: '韶山市' },
    { name: '和谐小区', price: 4800, district: '韶山市' },
    { name: '阳光花园', price: 4600, district: '韶山市' },
    { name: '幸福小区', price: 4500, district: '韶山市' },
    { name: '东风小区', price: 4300, district: '韶山市' },
    { name: '红星小区', price: 4200, district: '韶山市' },
    { name: '红旗小区', price: 4100, district: '韶山市' },
    { name: '韶南安置区', price: 4000, district: '韶山市' },
    { name: '锦宏铭苑', price: 3900, district: '韶山市' },
    { name: '枣园路小区', price: 3800, district: '韶山市' },
    { name: '日月新村', price: 3700, district: '韶山市' },
    { name: '韶山冲小区', price: 3600, district: '韶山市' },
    { name: '清溪小区', price: 3500, district: '韶山市' },
    { name: '银田小区', price: 3400, district: '韶山市' },
    { name: '永义小区', price: 3300, district: '韶山市' },
    { name: '杨林小区', price: 3200, district: '韶山市' },
    { name: '如意小区', price: 3100, district: '韶山市' },
    { name: '杨林乡杨林家园', price: 3000, district: '韶山市' },
    { name: '如意镇如意家园', price: 2900, district: '韶山市' },
    { name: '银田镇银田家园', price: 2800, district: '韶山市' },
    { name: '韶山高新区公寓', price: 3900, district: '韶山市' },
    { name: '火车站小区', price: 3000, district: '韶山市' },
    { name: '汽车站小区', price: 2950, district: '韶山市' },
    { name: '解放街小区', price: 2850, district: '韶山市' },
    { name: '民主街小区', price: 2800, district: '韶山市' },
    { name: '建设街小区', price: 2750, district: '韶山市' },
    { name: '健康小区', price: 2700, district: '韶山市' },
    { name: '环山小区', price: 2650, district: '韶山市' },
    { name: '石屏村自建房', price: 2600, district: '韶山市' },
    { name: '竹鸡村自建房', price: 2500, district: '韶山市' },
    { name: '新联村自建房', price: 2400, district: '韶山市' },
    { name: '杨林村自建房', price: 2300, district: '韶山市' },
    { name: '云源村自建房', price: 2200, district: '韶山市' },
    { name: '韶阳村自建房', price: 2100, district: '韶山市' },
    { name: '梅花村自建房', price: 2000, district: '韶山市' },
    { name: '花园村自建房', price: 1900, district: '韶山市' },
    { name: '东山村自建房', price: 1800, district: '韶山市' },
    { name: '谷阳村自建房', price: 1700, district: '韶山市' },
    { name: '南桥村自建房', price: 1600, district: '韶山市' },
    { name: '联湖村自建房', price: 1500, district: '韶山市' },
    { name: '新光村自建房', price: 1400, district: '韶山市' },
    { name: '狮山村自建房', price: 1300, district: '韶山市' }
];

// 导入湘潭其他区域房源数据
function importAdditionalRegionsProperties() {
    const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // 插入新数据
    let count = 0;
    const total = additionalRegionsProperties.length;
    
    additionalRegionsProperties.forEach(property => {
        // 跳过暂无均价的小区（如果有）
        if (!property.price) return;
        
        // 生成默认值
        const defaultAddress = `${property.district}${property.name}`;
        const defaultRooms = '3室2厅1卫'; // 默认房型
        const defaultArea = '100㎡'; // 默认面积
        const defaultImage = 'https://picsum.photos/seed/' + property.name.replace(/[\s\(\)（）·]/g, '') + '/400/300'; // 生成唯一的随机图片
        const defaultFeatures = JSON.stringify(['parking', 'elevator', 'school']); // 默认特色
        const defaultYear = '2020年建'; // 默认年份
        const defaultFloor = '中楼层'; // 默认楼层
        
        db.run(sql, [
            property.name,
            'xiangtan',
            property.district,
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
                console.log(`已插入 ${count}/${total} 条数据：${property.name}（${property.district}）`);
                
                // 所有数据插入完成
                if (count === total) {
                    console.log('所有湘潭其他区域房源数据插入完成，共插入', count, '条数据');
                    console.log('覆盖区域：湘潭县（50条）、湘乡市（50条）、韶山市（50条）');
                    db.close();
                }
            }
        });
    });
}