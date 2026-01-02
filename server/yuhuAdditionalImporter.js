const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    importAdditionalYuhuProperties();
  }
});

// 雨湖区新增房源数据（2025年12月最新数据）
const additionalYuhuProperties = [
  // 第一批数据 - 70个小区
  { name: '十八总·湘江图', price: 30000, district: '雨湖区' },
  { name: '时代建发和著', price: 20000, district: '雨湖区' },
  { name: '雅士林欣城(别墅)', price: 12954, district: '雨湖区' },
  { name: '锦绣世家', price: 12000, district: '雨湖区' },
  { name: '白石古莲城', price: 6300, district: '雨湖区' },
  { name: '长房·万楼公馆', price: 6300, district: '雨湖区' },
  { name: '中国铁建·和平央著', price: 6100, district: '雨湖区' },
  { name: '绿地湘江城际空间站', price: 6100, district: '雨湖区' },
  { name: '天元广场·玺园', price: 5988, district: '雨湖区' },
  { name: '天元广场', price: 5800, district: '雨湖区' },
  { name: '城发·潭州壹号院', price: 5800, district: '雨湖区' },
  { name: '万楼湘玺', price: 5577, district: '雨湖区' },
  { name: '愿景朗悦府', price: 5500, district: '雨湖区' },
  { name: '中铁·和著莲城', price: 5200, district: '雨湖区' },
  { name: '中冶·大学里', price: 5000, district: '雨湖区' },
  { name: '城发·滨湖西郡3期', price: 5000, district: '雨湖区' },
  { name: '富鑫源小区', price: 4900, district: '雨湖区' },
  { name: '锦绣世家西苑', price: 4800, district: '雨湖区' },
  { name: '旺城天誉', price: 4500, district: '雨湖区' },
  { name: '阳光山庄紫竹园', price: 4238, district: '雨湖区' },
  { name: '大同世界花苑', price: 2917, district: '雨湖区' },
  { name: '韶山东路47号小区', price: 2976, district: '雨湖区' },
  { name: '公路局宿舍', price: 3506, district: '雨湖区' },
  { name: '新景西城上筑', price: 3539, district: '雨湖区' },
  { name: '吉利帝豪国际', price: 3202, district: '雨湖区' },
  { name: '润华苑', price: 3202, district: '雨湖区' },
  { name: '车站路小区', price: 3301, district: '雨湖区' },
  { name: '建城路小区', price: 2793, district: '雨湖区' },
  { name: '通济门社区', price: 1334, district: '雨湖区' },
  { name: '白石公馆', price: 3650, district: '雨湖区' },
  { name: '广园花苑', price: 3072, district: '雨湖区' },
  { name: '宜家美景小区', price: 3407, district: '雨湖区' },
  { name: '雨湖大厦', price: 3700, district: '雨湖区' },
  { name: '人民银行宿舍湘潭支行宿舍楼', price: 2700, district: '雨湖区' },
  { name: '雨湖区税务局宿舍', price: 3057, district: '雨湖区' },
  { name: '供销宿舍', price: 2900, district: '雨湖区' },
  { name: '杨家湾社区', price: 3100, district: '雨湖区' },
  { name: '红城公寓', price: 3250, district: '雨湖区' },
  { name: '丽江花苑', price: 3100, district: '雨湖区' },
  { name: '骄杨公寓', price: 2800, district: '雨湖区' },
  { name: '怡美园', price: 3300, district: '雨湖区' },
  { name: '电业局云塘小区', price: 3250, district: '雨湖区' },
  { name: '嘉盛金桂园', price: 2800, district: '雨湖区' },
  { name: '莲花街小区', price: 3000, district: '雨湖区' },
  { name: '汇丰大厦', price: 3450, district: '雨湖区' },
  { name: '龙湾名苑', price: 3950, district: '雨湖区' },
  { name: '林业小区', price: 3000, district: '雨湖区' },
  { name: '罗源时代广场', price: 3750, district: '雨湖区' },
  { name: '黄芝山廉租公寓', price: 1350, district: '雨湖区' },
  { name: '永丰家园', price: 1421, district: '雨湖区' },
  { name: '繁城村兴无组', price: 1600, district: '雨湖区' },
  { name: '岚天阳光', price: 1626, district: '雨湖区' },
  { name: '大新村自建房', price: 1700, district: '雨湖区' },
  { name: '城郊馨香园', price: 2952, district: '雨湖区' },
  { name: '湖园小区', price: 3776, district: '雨湖区' },
  { name: '湘佳上城', price: 2762, district: '雨湖区' },
  { name: '泗洲绿园', price: 3028, district: '雨湖区' },
  // 跳过暂无均价的小区：外贸宿舍区, 石油库宿舍, 华银国际宿舍, 湘潭县印刷厂宿舍, 王世峰电业局宿舍, 雨湖学校宿舍, 九汇小区, 信托宿舍, 盐业宿舍, 化工局宿舍, 冰城公寓, 南北特宿舍, 市政府4号栋宿舍

  // 第二批数据 - 2025年12月新增
  // 新房
  { name: '天元观湘云顶', price: 8800, district: '雨湖区' },
  { name: '潭房中央公园', price: 6600, district: '雨湖区' },
  { name: '兰亭苑', price: 6938, district: '雨湖区' },
  { name: '汇景熙春华庭', price: 3545, district: '雨湖区' },
  // 二手房
  { name: '新景御江山', price: 4193, district: '雨湖区' },
  { name: '天元广场（4室2厅户型）', price: 4698, district: '雨湖区' },
  { name: '天元广场玺园（精装三房）', price: 4148, district: '雨湖区' },
  { name: '愿景朗悦府（4室2厅户型）', price: 4087, district: '雨湖区' },

  // 第三批数据 - 2025年12月新增更多房源
  { name: '沙子岭电力安装小区', price: 2833, district: '雨湖区' },
  { name: '怡园花苑', price: 4040, district: '雨湖区' },
  { name: '和生源', price: 2155, district: '雨湖区' },
  { name: '锦绣世家麒麟阁', price: 3750, district: '雨湖区' },
  { name: '新景·未来城', price: 3287, district: '雨湖区' },
  { name: '玺宇悦城国际', price: 3301, district: '雨湖区' },
  { name: '南岭南路15号小区', price: 1837, district: '雨湖区' },
  { name: '人民路综合楼', price: 2369, district: '雨湖区' },
  { name: '滨湖西郡', price: 3773, district: '雨湖区' },
  { name: '九华·金水湾', price: 4242, district: '雨湖区' }, // 取3381-5104的中间值
  { name: '祥霖九华新城商住楼', price: 3580, district: '雨湖区' },
  { name: '百合御都', price: 5205, district: '雨湖区' }, // 144㎡总价75万
  { name: '华融山水苑', price: 2837, district: '雨湖区' }, // 141㎡总价40万
  { name: '美的莲城首府', price: 4459, district: '雨湖区' }, // 148㎡总价66万
  { name: '恒大翡翠华庭', price: 5792, district: '雨湖区' }, // 124.3㎡总价72万
  { name: '城郊香樟园', price: 3870, district: '雨湖区' }, // 100.78㎡总价39万
  { name: '天元广场（3室1厅户型）', price: 5238, district: '雨湖区' },
  { name: '天元广场·玺园（4室2厅户型）', price: 5061, district: '雨湖区' }, // 取4875-5935的中间值
  { name: '祥霖九华新城（3室2厅精装）', price: 3790, district: '雨湖区' },
  { name: '祥霖九华新城（复式毛坯）', price: 3147, district: '雨湖区' },

  // 第四批数据 - 2025年12月新增多种类型房源
  { name: '心澄公寓', price: 4030, district: '雨湖区' }, // 91.82㎡总价37万
  { name: '易家湖公寓', price: 3150, district: '雨湖区' },
  { name: '湘隆公寓', price: 3300, district: '雨湖区' },
  { name: '文西公寓', price: 2800, district: '雨湖区' },
  { name: '天骄公寓', price: 3550, district: '雨湖区' },
  { name: '龙凤佳园', price: 2650, district: '雨湖区' },
  { name: '老布市场', price: 2850, district: '雨湖区' },
  { name: '湘潭大学教师公寓', price: 2950, district: '雨湖区' },
  { name: '雨湖花苑', price: 2650, district: '雨湖区' },
  { name: '旺馨小区', price: 2950, district: '雨湖区' },
  { name: '百姓家园同馨园', price: 3100, district: '雨湖区' },
  { name: '阳光大厦', price: 2800, district: '雨湖区' },
  { name: '碧湖雅筑', price: 3450, district: '雨湖区' },
  { name: '教师公寓三村', price: 2800, district: '雨湖区' },
  { name: '滨湖小区', price: 3050, district: '雨湖区' },
  { name: '瞻岳门社区', price: 2750, district: '雨湖区' },
  { name: '长兴楼', price: 4800, district: '雨湖区' },
  { name: '泽丰华庭', price: 3300, district: '雨湖区' },
  { name: '金铃公寓', price: 2750, district: '雨湖区' },
  { name: '泽丰御都', price: 3450, district: '雨湖区' },
  { name: '广场街道福利社区', price: 3350, district: '雨湖区' },
  { name: '海诚医药大厦', price: 1950, district: '雨湖区' },
  { name: '金鹰商贸大厦', price: 3200, district: '雨湖区' },
  { name: '何家大屋', price: 2550, district: '雨湖区' },
  { name: '朝阳廉租公寓', price: 2100, district: '雨湖区' },

  // 第五批数据 - 2025年12月新增更多不同类型房源
  { name: '兰亭苑', price: 6938, district: '雨湖区' },
  { name: '汇景熙春华庭', price: 3545, district: '雨湖区' },
  { name: '天元观湘云顶', price: 8800, district: '雨湖区' },
  { name: '潭房中央公园', price: 4720, district: '雨湖区' }, // 取4044-5396的中间值
  { name: '步步高·湘江湾', price: 5500, district: '雨湖区' },
  { name: '沁园峰尚二期', price: 5300, district: '雨湖区' },
  { name: '新景御江山', price: 4193, district: '雨湖区' },
  { name: '工人新村', price: 2563, district: '雨湖区' },
  { name: '建设北路3号小区', price: 2800, district: '雨湖区' },
  { name: '低压电器厂小区', price: 2600, district: '雨湖区' },
  { name: '彩印厂宿舍', price: 2700, district: '雨湖区' },
  { name: '亭子塘中心医院宿舍', price: 2900, district: '雨湖区' },
  { name: '南步街小区', price: 2850, district: '雨湖区' },
  { name: '建城路三角巷12号小区', price: 2650, district: '雨湖区' },
  { name: '振兴大厦', price: 3000, district: '雨湖区' },
];

// 导入雨湖区房源数据
function importAdditionalYuhuProperties() {
  const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // 插入新数据
  let count = 0;
  const total = additionalYuhuProperties.length;

  additionalYuhuProperties.forEach((property) => {
    // 跳过暂无均价的小区
    if (!property.price) return;

    // 生成默认值
    const defaultAddress = `${property.district}${property.name}`;
    const defaultRooms = '3室2厅1卫'; // 默认房型
    const defaultArea = '100㎡'; // 默认面积
    const defaultImage =
      'https://picsum.photos/seed/' +
      property.name.replace(/[\s\(\)（）·]/g, '') +
      '/400/300'; // 生成唯一的随机图片
    const defaultFeatures = JSON.stringify(['parking', 'elevator', 'school']); // 默认特色
    const defaultYear = '2020年建'; // 默认年份
    const defaultFloor = '中楼层'; // 默认楼层

    db.run(
      sql,
      [
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
        defaultFloor,
      ],
      function (err) {
        if (err) {
          console.error('插入数据失败:', err.message);
        } else {
          count++;
          console.log(`已插入 ${count}/${total} 条数据：${property.name}`);

          // 所有数据插入完成
          if (count === total) {
            console.log('所有雨湖区新增数据插入完成，共插入', count, '条数据');
            db.close();
          }
        }
      }
    );
  });
}
