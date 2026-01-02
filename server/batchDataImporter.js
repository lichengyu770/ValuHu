/* eslint-disable @typescript-eslint/no-var-requires */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    importBatchData();
  }
});

// 批量导入数据
function importBatchData() {
  // 用户提供的房产数据
  const batchData = [
    // 雨湖区和岳塘区的小区数据
    // 第一部分数据
    { name: '鸿达金域世家', price: 4500, district: '雨湖区' },
    { name: '纳帕溪谷', price: 4746, district: '雨湖区' },
    { name: '禾花村小区', price: 3103, district: '雨湖区' },
    { name: '建鑫城国际社区二期', price: 5820, district: '雨湖区' },
    { name: '霞光山庄北苑', price: 2999, district: '雨湖区' },
    { name: '湘钢工人村住宅小区', price: 4759, district: '雨湖区' },
    { name: '建鑫国际社区', price: 4750, district: '雨湖区' },
    { name: '银苑山庄', price: 3166, district: '雨湖区' },
    { name: '锦绣华庭', price: 6634, district: '雨湖区' },
    { name: '湘钢新三村住宅二小区', price: 2938, district: '雨湖区' },
    { name: '湘钢新五村住宅小区', price: 2236, district: '雨湖区' },
    { name: '湘潭万达广场(万达华府)', price: 5300, district: '雨湖区' },
    { name: '长房·上层国际星空墅', price: 6200, district: '雨湖区' },
    { name: '东方名苑二期', price: 9920, district: '雨湖区' },
    { name: '碧桂园·潭州府', price: 5600, district: '雨湖区' },
    { name: '中央一品', price: 5100, district: '雨湖区' },
    { name: '莱茵城', price: 4800, district: '雨湖区' },
    { name: '紫霞名苑', price: 4300, district: '雨湖区' },
    { name: '城郊龙泊湾', price: 5200, district: '雨湖区' },
    { name: '三湘名苑', price: 4600, district: '雨湖区' },
    { name: '云盘华夏家园', price: 4100, district: '雨湖区' },
    { name: '双旺五岳新城（别墅）', price: 7321, district: '雨湖区' },
    { name: '双旺五岳新城（公寓）', price: 2989, district: '雨湖区' },
    { name: '鑫电公寓', price: 4272, district: '雨湖区' },
    { name: '寸木塘住宅小区', price: 1339, district: '雨湖区' },
    { name: '金侨书香庭苑', price: 4127, district: '雨湖区' },
    { name: '万福社区', price: 3800, district: '雨湖区' },
    { name: '联合安置小区', price: 3600, district: '雨湖区' },
    { name: '和平公寓', price: 3900, district: '雨湖区' },
    { name: '宜华·湘江名城', price: 5061, district: '雨湖区' },
    { name: '湘钢新三村二小区', price: 3000, district: '雨湖区' },
    { name: '岚园新城', price: 4000, district: '雨湖区' },
    { name: '威龙花园小区', price: 4200, district: '雨湖区' },
    { name: '三星公寓', price: 3700, district: '雨湖区' },
    { name: '东富公寓', price: 3500, district: '雨湖区' },
    { name: '大桥社区', price: 3300, district: '雨湖区' },
    { name: '湘钢园南村住宅小区西区', price: 2800, district: '雨湖区' },
    { name: '幸福郡音乐花园', price: 5000, district: '雨湖区' },
    { name: '天元华雅花园', price: 5461, district: '雨湖区' },
    { name: '吉安公馆', price: 4900, district: '雨湖区' },
    { name: '晶都公馆', price: 4700, district: '雨湖区' },
    { name: '高科花漾年华', price: 4400, district: '雨湖区' },
    { name: '厚和城·融城公馆', price: 4500, district: '雨湖区' },
    { name: '裕丰·新城国际', price: 4300, district: '雨湖区' },
    { name: '中地凯旋城', price: 4900, district: '雨湖区' },
    { name: '春满江南', price: 4200, district: '雨湖区' },
    { name: '火炬学府', price: 4000, district: '雨湖区' },
    { name: '众一国际', price: 4800, district: '雨湖区' },
    { name: '盘龙名府', price: 4100, district: '雨湖区' },
    { name: '九州·怡景苑', price: 4400, district: '雨湖区' },
    { name: '栢丽大厦', price: 4000, district: '雨湖区' },
    { name: '湘钢新一村小区', price: 2600, district: '雨湖区' },
    { name: '城郊铭扬世家', price: 4700, district: '雨湖区' },
    { name: '华厦佳园', price: 3588, district: '雨湖区' },
    { name: '华宇银座', price: 5100, district: '雨湖区' },
    { name: '港湘铂玥', price: 6800, district: '雨湖区' },
    { name: '星合世家（新房）', price: 7639, district: '雨湖区' },
    { name: '雍玺台（新房）', price: 6967, district: '雨湖区' },
    { name: '大汉湘江悦', price: 4366, district: '雨湖区' },
    { name: '大汉龙云台', price: 4142, district: '雨湖区' },
    { name: '山水府邸', price: 7176, district: '雨湖区' },
    { name: '创业公寓', price: 6304, district: '雨湖区' },
    { name: '湖湘桃花源', price: 13412, district: '雨湖区' },
    { name: '中建昭山印象（别墅）', price: 9319, district: '雨湖区' },
    { name: '中建昭山印象（住宅）', price: 5311, district: '雨湖区' },
    { name: '十里晴岚', price: 5459, district: '雨湖区' },

    // 第二部分数据 - 主要是岳塘区
    { name: '风动小区', price: 3200, district: '岳塘区' },
    { name: '建设村小区', price: 2550, district: '岳塘区' },
    { name: '湘钢新四村住宅小区', price: 2800, district: '岳塘区' },
    { name: '松涛里小区', price: 2550, district: '岳塘区' },
    { name: '解放村小区', price: 3000, district: '岳塘区' },
    { name: '栗塘小区', price: 3100, district: '岳塘区' },
    { name: '天鹤村小区', price: 3300, district: '岳塘区' },
    { name: '精细化小区', price: 3000, district: '岳塘区' },
    { name: '岳塘区卫健局宿舍', price: 3800, district: '岳塘区' },
    { name: '长信局住宅', price: 3900, district: '岳塘区' },
    { name: '福星综合楼', price: 4500, district: '岳塘区' },
    { name: '晴岚家园二期', price: 5000, district: '岳塘区' },
    { name: '葩金花苑', price: 3568, district: '岳塘区' },
    { name: '湘钢葩塘小区', price: 3000, district: '岳塘区' },
    { name: '盘龙御和园', price: 5500, district: '岳塘区' },
    { name: '东方名苑·首府', price: 4500000, district: '岳塘区' }, // 注意：这里是总价/套，需要特殊处理
    { name: '美的国宾府', price: 6000, district: '岳塘区' },
    { name: '中骏世界城', price: 6500, district: '岳塘区' },
    { name: '恒润国际', price: 4500, district: '岳塘区' },
    { name: '潭房·锦绣时代', price: 5200, district: '岳塘区' },
    { name: '长房潭房·时代公馆', price: 6800, district: '岳塘区' },
    { name: '湘潭环球港', price: 5300, district: '岳塘区' },

    // 第三部分数据 - 补充的岳塘区小区
    { name: '交警小区', price: 3423, district: '岳塘区' },
    { name: '彩霞花园', price: 3862, district: '岳塘区' },
    { name: '第六人民医院宿舍', price: 5411, district: '岳塘区' },
    { name: '纺城铭苑', price: 5197, district: '岳塘区' },
    { name: '钢晓村小区', price: 2345, district: '岳塘区' },
    { name: '银海花园', price: 4291, district: '岳塘区' },
    { name: '红梅里', price: 4426, district: '岳塘区' },
    { name: '湘钢芙蓉小区', price: 2937, district: '岳塘区' },
    { name: '长虹里', price: 2361, district: '岳塘区' },
    { name: '馨钢花园', price: 3110, district: '岳塘区' },
    { name: '湘钢晓塘住宅小区', price: 2054, district: '岳塘区' },
  ];

  // 插入数据到数据库
  let count = 0;
  const total = batchData.length;

  batchData.forEach((property) => {
    // 跳过暂无均价的小区
    if (!property.price) return;

    // 准备插入数据
    const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    // 生成默认值
    const defaultAddress = `${property.district}${property.name}`;
    const defaultRooms = '3室2厅1卫'; // 默认房型
    const defaultArea = '100㎡'; // 默认面积
    const defaultImage =
      'https://picsum.photos/seed/' +
      property.name.replace(/[\s()（）··]/g, '') +
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
            console.log('所有数据插入完成，共插入', count, '条数据');
            db.close();
          }
        }
      }
    );
  });
}
