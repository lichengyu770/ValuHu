const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');
    insertTestData();
  }
});

// 插入测试数据
function insertTestData() {
  // 房源测试数据
  const properties = [
    // 长沙房源
    { title: '长沙融创城', city: 'changsha', district: '望城区', address: '长沙融创城', rooms: '3室2厅', area: '120㎡', price: 11000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '中层' },
    { title: '长沙恒大御景天下', city: 'changsha', district: '岳麓区', address: '长沙恒大御景天下', rooms: '4室2厅', area: '140㎡', price: 13500, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2021', floor: '高层' },
    { title: '长沙万科魅力之城', city: 'changsha', district: '雨花区', address: '长沙万科魅力之城', rooms: '3室1厅', area: '95㎡', price: 12800, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2020', floor: '中层' },
    { title: '长沙保利天禧', city: 'changsha', district: '岳麓区', address: '长沙保利天禧', rooms: '2室1厅', area: '85㎡', price: 14200, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2023', floor: '高层' },
    { title: '长沙中海国际社区', city: 'changsha', district: '岳麓区', address: '长沙中海国际社区', rooms: '3室2厅', area: '110㎡', price: 13200, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2019', floor: '中层' },
    { title: '长沙绿城桂语江南', city: 'changsha', district: '天心区', address: '长沙绿城桂语江南', rooms: '4室2厅', area: '150㎡', price: 15800, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '高层' },
    { title: '长沙阳光城尚东湾', city: 'changsha', district: '雨花区', address: '长沙阳光城尚东湾', rooms: '3室2厅', area: '105㎡', price: 11500, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2021', floor: '中层' },
    { title: '长沙华润置地广场', city: 'changsha', district: '开福区', address: '长沙华润置地广场', rooms: '2室1厅', area: '75㎡', price: 12600, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2020', floor: '高层' },
    { title: '长沙中建芙蓉嘉苑', city: 'changsha', district: '天心区', address: '长沙中建芙蓉嘉苑', rooms: '3室2厅', area: '115㎡', price: 12900, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2018', floor: '中层' },
    { title: '长沙金地格林公馆', city: 'changsha', district: '雨花区', address: '长沙金地格林公馆', rooms: '4室2厅', area: '135㎡', price: 13800, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '高层' },
    
    // 株洲房源
    { title: '株洲恒大林溪郡', city: 'zhuzhou', district: '天元区', address: '株洲恒大林溪郡', rooms: '3室2厅', area: '110㎡', price: 7800, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '中层' },
    { title: '株洲碧桂园剑桥郡', city: 'zhuzhou', district: '荷塘区', address: '株洲碧桂园剑桥郡', rooms: '4室2厅', area: '130㎡', price: 8500, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2021', floor: '高层' },
    { title: '株洲美的城', city: 'zhuzhou', district: '天元区', address: '株洲美的城', rooms: '3室1厅', area: '95㎡', price: 8200, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2020', floor: '中层' },
    { title: '株洲奥园广场', city: 'zhuzhou', district: '芦淞区', address: '株洲奥园广场', rooms: '2室1厅', area: '75㎡', price: 7600, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2019', floor: '高层' },
    { title: '株洲绿地城际空间站', city: 'zhuzhou', district: '石峰区', address: '株洲绿地城际空间站', rooms: '3室2厅', area: '105㎡', price: 7900, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '中层' },
    
    // 湘潭房源
    { title: '湘潭恒大御景半岛', city: 'xiangtan', district: '雨湖区', address: '湘潭恒大御景半岛', rooms: '3室2厅', area: '115㎡', price: 6800, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '中层' },
    { title: '湘潭碧桂园', city: 'xiangtan', district: '岳塘区', address: '湘潭碧桂园', rooms: '4室2厅', area: '135㎡', price: 7200, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2021', floor: '高层' },
    { title: '湘潭保利时代', city: 'xiangtan', district: '雨湖区', address: '湘潭保利时代', rooms: '3室1厅', area: '98㎡', price: 6900, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2020', floor: '中层' },
    { title: '湘潭步步高置业新天地', city: 'xiangtan', district: '岳塘区', address: '湘潭步步高置业新天地', rooms: '2室1厅', area: '78㎡', price: 6600, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2019', floor: '高层' },
    { title: '湘潭五矿万境水岸', city: 'xiangtan', district: '岳塘区', address: '湘潭五矿万境水岸', rooms: '3室2厅', area: '108㎡', price: 7000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2022', floor: '中层' },
    
    // 北京房源
    { title: '北京朝阳区阳光上东', city: 'beijing', district: '朝阳区', address: '北京朝阳区阳光上东', rooms: '3室2厅', area: '150㎡', price: 95000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2018', floor: '中层' },
    { title: '北京海淀区中关村公馆', city: 'beijing', district: '海淀区', address: '北京海淀区中关村公馆', rooms: '2室1厅', area: '90㎡', price: 105000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2015', floor: '高层' },
    { title: '北京东城区交道口大街', city: 'beijing', district: '东城区', address: '北京东城区交道口大街', rooms: '3室1厅', area: '120㎡', price: 120000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2005', floor: '低层' },
    { title: '北京西城区金融街', city: 'beijing', district: '西城区', address: '北京西城区金融街', rooms: '4室2厅', area: '180㎡', price: 150000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2012', floor: '中层' },
    { title: '北京丰台区丽泽商务区', city: 'beijing', district: '丰台区', address: '北京丰台区丽泽商务区', rooms: '3室2厅', area: '130㎡', price: 78000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2020', floor: '高层' },
    
    // 上海房源
    { title: '上海黄浦区外滩金融中心', city: 'shanghai', district: '黄浦区', address: '上海黄浦区外滩金融中心', rooms: '3室2厅', area: '160㎡', price: 145000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2018', floor: '高层' },
    { title: '上海徐汇区徐家汇', city: 'shanghai', district: '徐汇区', address: '上海徐汇区徐家汇', rooms: '2室1厅', area: '95㎡', price: 120000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2015', floor: '中层' },
    { title: '上海长宁区古北', city: 'shanghai', district: '长宁区', address: '上海长宁区古北', rooms: '3室2厅', area: '140㎡', price: 115000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2012', floor: '高层' },
    
    // 广州房源
    { title: '广州天河区珠江新城', city: 'guangzhou', district: '天河区', address: '广州天河区珠江新城', rooms: '3室2厅', area: '150㎡', price: 98000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2016', floor: '高层' },
    { title: '广州越秀区北京路', city: 'guangzhou', district: '越秀区', address: '广州越秀区北京路', rooms: '2室1厅', area: '85㎡', price: 78000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2010', floor: '中层' },
    
    // 深圳房源
    { title: '深圳福田区福田中心区', city: 'shenzhen', district: '福田区', address: '深圳福田区福田中心区', rooms: '3室2厅', area: '140㎡', price: 135000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2018', floor: '高层' },
    { title: '深圳南山区科技园', city: 'shenzhen', district: '南山区', address: '深圳南山区科技园', rooms: '2室1厅', area: '90㎡', price: 125000, image: 'https://via.placeholder.com/300x200', features: '[]', year: '2015', floor: '中层' }
  ];

  // 插入数据的SQL语句
  const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // 开始事务
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // 批量插入数据
    properties.forEach((property, index) => {
      db.run(sql, [
        property.title,
        property.city,
        property.district,
        property.address,
        property.rooms,
        property.area,
        property.price,
        property.image,
        property.features,
        property.year,
        property.floor
      ], function(err) {
        if (err) {
          console.error(`插入第 ${index + 1} 条数据失败:`, err.message);
        } else {
          console.log(`插入第 ${index + 1} 条数据成功，ID: ${this.lastID}`);
        }
      });
    });
    
    // 提交事务
    db.run('COMMIT', (err) => {
      if (err) {
        console.error('提交事务失败:', err.message);
      } else {
        console.log('所有测试数据插入成功');
      }
      // 关闭数据库连接
      db.close();
    });
  });
}