// 地图辅助控制器
const db = require('../db');

class MapController {
  /**
   * 地理编码（地址转经纬度）
   */
  static async geocode(req, res) {
    try {
      const { address, batch } = req.query;

      if (!address) {
        return res.status(400).send({ success: false, message: '地址参数不能为空' });
      }

      // 检查缓存
      const checkSql = `SELECT * FROM map_geocoding WHERE query = ? AND query_type = 'geocode'`;
      
      db.get(checkSql, [address], (err, cached) => {
        if (err) {
          console.error('检查地理编码缓存失败:', err.message);
        }

        if (cached) {
          // 返回缓存结果
          return res.send({
            success: true,
            message: '获取地理编码成功',
            data: JSON.parse(cached.result),
            fromCache: true
          });
        }

        // 模拟地理编码结果
        const mockResult = {
          address: address,
          location: {
            lat: 39.9042 + (Math.random() - 0.5) * 0.1,
            lng: 116.4074 + (Math.random() - 0.5) * 0.1
          },
          formattedAddress: address,
          city: '北京市',
          district: '朝阳区',
          township: '建国门外街道',
          neighborhood: '建国门外大街'
        };

        // 保存到缓存
        const cacheSql = `INSERT INTO map_geocoding (query, result, query_type) VALUES (?, ?, ?)`;
        db.run(cacheSql, [address, JSON.stringify(mockResult), 'geocode'], (err) => {
          if (err) {
            console.error('保存地理编码缓存失败:', err.message);
          }
        });

        res.send({
          success: true,
          message: '获取地理编码成功',
          data: mockResult,
          fromCache: false
        });
      });
    } catch (error) {
      console.error('处理地理编码请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 逆地理编码（经纬度转地址）
   */
  static async reverseGeocode(req, res) {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).send({ success: false, message: '经纬度参数不能为空' });
      }

      // 检查缓存
      const query = `${lat},${lng}`;
      const checkSql = `SELECT * FROM map_geocoding WHERE query = ? AND query_type = 'reverse-geocode'`;
      
      db.get(checkSql, [query], (err, cached) => {
        if (err) {
          console.error('检查逆地理编码缓存失败:', err.message);
        }

        if (cached) {
          // 返回缓存结果
          return res.send({
            success: true,
            message: '获取逆地理编码成功',
            data: JSON.parse(cached.result),
            fromCache: true
          });
        }

        // 模拟逆地理编码结果
        const mockResult = {
          location: {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
          },
          address: '北京市朝阳区建国门外大街',
          formattedAddress: '北京市朝阳区建国门外大街1号',
          city: '北京市',
          district: '朝阳区',
          township: '建国门外街道',
          neighborhood: '建国门外大街',
          building: '国贸大厦'
        };

        // 保存到缓存
        const cacheSql = `INSERT INTO map_geocoding (query, result, query_type) VALUES (?, ?, ?)`;
        db.run(cacheSql, [query, JSON.stringify(mockResult), 'reverse-geocode'], (err) => {
          if (err) {
            console.error('保存逆地理编码缓存失败:', err.message);
          }
        });

        res.send({
          success: true,
          message: '获取逆地理编码成功',
          data: mockResult,
          fromCache: false
        });
      });
    } catch (error) {
      console.error('处理逆地理编码请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取周边设施
   */
  static async getNearbyFacilities(req, res) {
    try {
      const { lat, lng, type, radius = 1000, page = 1, pageSize = 20 } = req.query;

      if (!lat || !lng) {
        return res.status(400).send({ success: false, message: '经纬度参数不能为空' });
      }

      // 模拟周边设施数据
      const facilityTypes = ['restaurant', 'bank', 'hospital', 'school', 'park', 'shopping', 'transport'];
      const mockFacilities = [];
      
      // 生成随机周边设施
      const total = Math.floor(Math.random() * 50) + 20;
      for (let i = 0; i < total; i++) {
        mockFacilities.push({
          id: i + 1,
          name: `${type || facilityTypes[Math.floor(Math.random() * facilityTypes.length)]}${i + 1}`,
          type: type || facilityTypes[Math.floor(Math.random() * facilityTypes.length)],
          location: {
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.02,
            lng: parseFloat(lng) + (Math.random() - 0.5) * 0.02
          },
          address: `北京市朝阳区建国门外大街${i + 1}号`,
          distance: Math.floor(Math.random() * parseInt(radius)),
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          phone: '010-88888888',
          openTime: '09:00-22:00'
        });
      }

      // 按距离排序
      mockFacilities.sort((a, b) => a.distance - b.distance);

      // 分页
      const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
      const endIndex = startIndex + parseInt(pageSize);
      const paginatedFacilities = mockFacilities.slice(startIndex, endIndex);

      res.send({
        success: true,
        message: '获取周边设施成功',
        data: {
          list: paginatedFacilities,
          total: total,
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      });
    } catch (error) {
      console.error('处理获取周边设施请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = MapController;