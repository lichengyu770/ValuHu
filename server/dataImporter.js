const db = require('./db');

// 湘潭本地房源数据
const xiangtanProperties = [
  // 雨湖区
  {
    title: '湘潭雨湖区江景三居室',
    city: 'xiangtan',
    district: '雨湖区',
    address: '湘潭市雨湖区沿江路50号',
    rooms: '3室2厅2卫',
    area: '138㎡',
    price: 680,
    image: 'https://picsum.photos/seed/xiangtan1/400/300',
    features: JSON.stringify(['elevator', 'parking', 'school', '南北通透']),
    year: '2018年建',
    floor: '中楼层',
  },
  {
    title: '湘潭雨湖区市中心两居室',
    city: 'xiangtan',
    district: '雨湖区',
    address: '湘潭市雨湖区建设北路100号',
    rooms: '2室1厅1卫',
    area: '89㎡',
    price: 420,
    image: 'https://picsum.photos/seed/xiangtan2/400/300',
    features: JSON.stringify(['subway', 'renovation', 'elevator']),
    year: '2020年建',
    floor: '高楼层',
  },
  {
    title: '湘潭雨湖区花园洋房',
    city: 'xiangtan',
    district: '雨湖区',
    address: '湘潭市雨湖区迎宾西路200号',
    rooms: '4室2厅3卫',
    area: '168㎡',
    price: 880,
    image: 'https://picsum.photos/seed/xiangtan3/400/300',
    features: JSON.stringify(['parking', 'school', '南北通透', 'renovation']),
    year: '2017年建',
    floor: '低楼层',
  },

  // 岳塘区
  {
    title: '湘潭岳塘区现代三居室',
    city: 'xiangtan',
    district: '岳塘区',
    address: '湘潭市岳塘区建设南路300号',
    rooms: '3室2厅2卫',
    area: '128㎡',
    price: 620,
    image: 'https://picsum.photos/seed/xiangtan4/400/300',
    features: JSON.stringify(['school', 'subway', 'elevator']),
    year: '2019年建',
    floor: '中楼层',
  },
  {
    title: '湘潭岳塘区地铁口两居室',
    city: 'xiangtan',
    district: '岳塘区',
    address: '湘潭市岳塘区双拥中路150号',
    rooms: '2室1厅1卫',
    area: '85㎡',
    price: 400,
    image: 'https://picsum.photos/seed/xiangtan5/400/300',
    features: JSON.stringify(['parking', 'elevator', 'renovation']),
    year: '2021年建',
    floor: '中楼层',
  },
  {
    title: '湘潭岳塘区湖景四居室',
    city: 'xiangtan',
    district: '岳塘区',
    address: '湘潭市岳塘区湖湘南路200号',
    rooms: '4室2厅2卫',
    area: '158㎡',
    price: 780,
    image: 'https://picsum.photos/seed/xiangtan6/400/300',
    features: JSON.stringify(['subway', 'parking', '南北通透']),
    year: '2018年建',
    floor: '高楼层',
  },

  // 湘潭县
  {
    title: '湘潭县宜居三居室',
    city: 'xiangtan',
    district: '湘潭县',
    address: '湘潭市湘潭县易俗河镇凤凰路100号',
    rooms: '3室2厅2卫',
    area: '125㎡',
    price: 580,
    image: 'https://picsum.photos/seed/xiangtan7/400/300',
    features: JSON.stringify(['elevator', 'school', 'parking']),
    year: '2019年建',
    floor: '高楼层',
  },
  {
    title: '湘潭县中心两居室',
    city: 'xiangtan',
    district: '湘潭县',
    address: '湘潭市湘潭县易俗河镇玉兰路50号',
    rooms: '2室1厅1卫',
    area: '82㎡',
    price: 380,
    image: 'https://picsum.photos/seed/xiangtan8/400/300',
    features: JSON.stringify(['subway', 'elevator', 'renovation']),
    year: '2020年建',
    floor: '中楼层',
  },

  // 湘乡市
  {
    title: '湘乡市花园洋房',
    city: 'xiangtan',
    district: '湘乡市',
    address: '湘潭市湘乡市东山办事处起凤路100号',
    rooms: '4室2厅3卫',
    area: '178㎡',
    price: 720,
    image: 'https://picsum.photos/seed/xiangtan9/400/300',
    features: JSON.stringify(['parking', 'school', 'elevator']),
    year: '2017年建',
    floor: '低楼层',
  },
  {
    title: '湘乡市市中心三居室',
    city: 'xiangtan',
    district: '湘乡市',
    address: '湘潭市湘乡市望春门办事处桑梅路50号',
    rooms: '3室2厅2卫',
    area: '132㎡',
    price: 580,
    image: 'https://picsum.photos/seed/xiangtan10/400/300',
    features: JSON.stringify(['南北通透', 'renovation', 'subway']),
    year: '2018年建',
    floor: '中楼层',
  },

  // 韶山市
  {
    title: '韶山市风景三居室',
    city: 'xiangtan',
    district: '韶山市',
    address: '湘潭市韶山市清溪镇韶山中路100号',
    rooms: '3室2厅2卫',
    area: '128㎡',
    price: 620,
    image: 'https://picsum.photos/seed/xiangtan11/400/300',
    features: JSON.stringify(['school', 'parking', '南北通透']),
    year: '2019年建',
    floor: '高楼层',
  },
  {
    title: '韶山市景区附近两居室',
    city: 'xiangtan',
    district: '韶山市',
    address: '湘潭市韶山市韶山乡韶山冲路50号',
    rooms: '2室1厅1卫',
    area: '86㎡',
    price: 420,
    image: 'https://picsum.photos/seed/xiangtan12/400/300',
    features: JSON.stringify(['elevator', 'school', 'parking']),
    year: '2020年建',
    floor: '中楼层',
  },
];

// 导入数据到数据库
function importProperties() {
  const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  // 清空表中现有数据
  db.run('DELETE FROM properties', (err) => {
    if (err) {
      console.error('清空表数据失败:', err.message);
      return;
    }

    console.log('已清空表中现有数据');

    // 插入新数据
    let count = 0;
    xiangtanProperties.forEach((property) => {
      db.run(
        sql,
        [
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
          property.floor,
        ],
        function (err) {
          if (err) {
            console.error('插入数据失败:', err.message);
          } else {
            count++;
            console.log(`已插入 ${count} 条数据，ID: ${this.lastID}`);

            // 所有数据插入完成
            if (count === xiangtanProperties.length) {
              console.log('所有数据插入完成，共插入', count, '条数据');
              db.close();
            }
          }
        }
      );
    });
  });
}

// 执行数据导入
importProperties();
