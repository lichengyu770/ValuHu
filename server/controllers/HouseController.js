// 房源控制器
import db from '../db.js';

class HouseController {
  /**
   * 获取所有房源
   */
  static async getAllProperties(req, res) {
    try {
      const {
        city,
        district,
        subdistrict,
        community,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        sortBy,
        page = 1,
        pageSize = 20
      } = req.query;

      let sql = 'SELECT id, title, city, district, address, rooms, area, price, image, created_at FROM properties';
      let countSql = 'SELECT COUNT(*) as total FROM properties';
      let params = [];
      let countParams = [];
      let conditions = [];

      // 添加筛选条件
      if (city) {
        conditions.push('city = ?');
        params.push(city);
        countParams.push(city);
      }

      if (district) {
        conditions.push('district = ?');
        params.push(district);
        countParams.push(district);
      }

      if (subdistrict) {
        conditions.push('address LIKE ?');
        params.push(`%${subdistrict}%`);
        countParams.push(`%${subdistrict}%`);
      }

      if (community) {
        conditions.push('address LIKE ?');
        params.push(`%${community}%`);
        countParams.push(`%${community}%`);
      }

      if (minPrice) {
        conditions.push('price >= ?');
        params.push(parseInt(minPrice));
        countParams.push(parseInt(minPrice));
      }

      if (maxPrice) {
        conditions.push('price <= ?');
        params.push(parseInt(maxPrice));
        countParams.push(parseInt(maxPrice));
      }

      // 优化：避免在WHERE子句中使用函数，提高查询性能
      // 实际项目中应该在存储时将面积转换为数值类型，这里为了兼容现有数据，暂时保留原逻辑
      if (minArea) {
        conditions.push('CAST(REPLACE(area, "㎡", "") AS INTEGER) >= ?');
        params.push(parseInt(minArea));
        countParams.push(parseInt(minArea));
      }

      if (maxArea) {
        conditions.push('CAST(REPLACE(area, "㎡", "") AS INTEGER) <= ?');
        params.push(parseInt(maxArea));
        countParams.push(parseInt(maxArea));
      }

      // 拼接WHERE子句
      if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        sql += whereClause;
        countSql += whereClause;
      }

      // 添加排序
      let orderByClause = ' ORDER BY created_at DESC';
      if (sortBy) {
        switch (sortBy) {
          case 'price_asc':
            orderByClause = ' ORDER BY price ASC';
            break;
          case 'price_desc':
            orderByClause = ' ORDER BY price DESC';
            break;
          case 'area_asc':
            orderByClause = ' ORDER BY CAST(REPLACE(area, "㎡", "") AS INTEGER) ASC';
            break;
          case 'area_desc':
            orderByClause = ' ORDER BY CAST(REPLACE(area, "㎡", "") AS INTEGER) DESC';
            break;
          case 'newest':
            orderByClause = ' ORDER BY created_at DESC';
            break;
          default:
            // 湘潭数据优先，使用CASE表达式
            orderByClause = ' ORDER BY CASE WHEN city = "xiangtan" THEN 0 ELSE 1 END, created_at DESC';
        }
      }
      sql += orderByClause;

      // 添加分页
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      // 执行查询
      db.get(countSql, countParams, (err, countResult) => {
        if (err) {
          console.error('获取房源总数失败:', err.message);
          res.status(500).send({ success: false, message: '获取房源总数失败' });
          return;
        }

        db.all(sql, params, (err, rows) => {
          if (err) {
            console.error('获取房源数据失败:', err.message);
            res.status(500).send({ success: false, message: '获取房源数据失败' });
          } else {
            // 解析features字段
            const properties = rows.map((row) => ({
              ...row,
              features: [] // 优化：不返回features字段，减少数据传输
            }));
            res.send({
              success: true,
              data: {
                list: properties,
                pagination: {
                  page: parseInt(page),
                  pageSize: parseInt(pageSize),
                  total: countResult.total || 0,
                  totalPages: Math.ceil((countResult.total || 0) / parseInt(pageSize))
                }
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('处理获取房源请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取单个房源
   */
  static async getPropertyById(req, res) {
    try {
      const { id } = req.params;

      db.get('SELECT id, title, city, district, address, rooms, area, price, image, features, year, floor, created_at FROM properties WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('获取单个房源数据失败:', err.message);
          res
            .status(500)
            .send({ success: false, message: '获取单个房源数据失败' });
        } else if (!row) {
          res.status(404).send({ success: false, message: '房源不存在' });
        } else {
          // 解析features字段
          row.features = row.features ? JSON.parse(row.features) : [];
          res.send({ success: true, data: row });
        }
      });
    } catch (error) {
      console.error('处理获取单个房源请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 添加房源
   */
  static async addProperty(req, res) {
    try {
      const {
        title,
        city,
        district,
        address,
        rooms,
        area,
        price,
        image,
        features,
        year,
        floor,
      } = req.body;

      // 验证参数
      if (
        !title ||
        !city ||
        !district ||
        !address ||
        !rooms ||
        !area ||
        !price ||
        !image
      ) {
        return res
          .status(400)
          .send({ success: false, message: '必填字段不能为空' });
      }

      const sql = `INSERT INTO properties (title, city, district, address, rooms, area, price, image, features, year, floor) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(
        sql,
        [
          title,
          city,
          district,
          address,
          rooms,
          area,
          price,
          image,
          JSON.stringify(features || []),
          year,
          floor,
        ],
        function (err) {
          if (err) {
            console.error('添加房源失败:', err.message);
            res.status(500).send({ success: false, message: '添加房源失败' });
          } else {
            res.send({
              success: true,
              message: '添加房源成功',
              data: { id: this.lastID },
            });
          }
        }
      );
    } catch (error) {
      console.error('处理添加房源请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 更新房源
   */
  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        city,
        district,
        address,
        rooms,
        area,
        price,
        image,
        features,
        year,
        floor,
      } = req.body;

      const sql = `UPDATE properties SET 
                  title = ?, city = ?, district = ?, address = ?, rooms = ?, area = ?, price = ?, image = ?, 
                  features = ?, year = ?, floor = ?, updated_at = CURRENT_TIMESTAMP 
                  WHERE id = ?`;

      db.run(
        sql,
        [
          title,
          city,
          district,
          address,
          rooms,
          area,
          price,
          image,
          JSON.stringify(features || []),
          year,
          floor,
          id,
        ],
        function (err) {
          if (err) {
            console.error('更新房源失败:', err.message);
            res.status(500).send({ success: false, message: '更新房源失败' });
          } else if (this.changes === 0) {
            res.status(404).send({ success: false, message: '房源不存在' });
          } else {
            res.send({ success: true, message: '更新房源成功' });
          }
        }
      );
    } catch (error) {
      console.error('处理更新房源请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 删除房源
   */
  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;

      db.run('DELETE FROM properties WHERE id = ?', [id], function (err) {
        if (err) {
          console.error('删除房源失败:', err.message);
          res.status(500).send({ success: false, message: '删除房源失败' });
        } else if (this.changes === 0) {
          res.status(404).send({ success: false, message: '房源不存在' });
        } else {
          res.send({ success: true, message: '删除房源成功' });
        }
      });
    } catch (error) {
      console.error('处理删除房源请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 高级房源搜索
   */
  static async advancedSearch(req, res) {
    try {
      const {
        keywords,
        city,
        district,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        minRooms,
        maxRooms,
        yearRange,
        features,
        sortBy,
        page = 1,
        pageSize = 20
      } = req.body;

      let sql = 'SELECT id, title, city, district, address, rooms, area, price, image, created_at FROM properties';
      let params = [];
      let conditions = [];

      // 添加关键词搜索
      if (keywords) {
        conditions.push('(title LIKE ? OR address LIKE ?)');
        params.push(`%${keywords}%`, `%${keywords}%`);
      }

      // 添加基本筛选条件
      if (city) {
        conditions.push('city = ?');
        params.push(city);
      }

      if (district) {
        conditions.push('district = ?');
        params.push(district);
      }

      if (minPrice) {
        conditions.push('price >= ?');
        params.push(parseInt(minPrice));
      }

      if (maxPrice) {
        conditions.push('price <= ?');
        params.push(parseInt(maxPrice));
      }

      if (minArea) {
        conditions.push('CAST(REPLACE(area, "㎡", "") AS INTEGER) >= ?');
        params.push(parseInt(minArea));
      }

      if (maxArea) {
        conditions.push('CAST(REPLACE(area, "㎡", "") AS INTEGER) <= ?');
        params.push(parseInt(maxArea));
      }

      if (minRooms) {
        conditions.push('CAST(rooms AS INTEGER) >= ?');
        params.push(parseInt(minRooms));
      }

      if (maxRooms) {
        conditions.push('CAST(rooms AS INTEGER) <= ?');
        params.push(parseInt(maxRooms));
      }

      // 添加年份范围筛选
      if (yearRange && yearRange.length === 2) {
        conditions.push('CAST(year AS INTEGER) BETWEEN ? AND ?');
        params.push(parseInt(yearRange[0]), parseInt(yearRange[1]));
      }

      // 添加特征筛选
      if (features && features.length > 0) {
        features.forEach(feature => {
          conditions.push('features LIKE ?');
          params.push(`%${feature}%`);
        });
      }

      // 拼接WHERE子句
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // 添加排序
      if (sortBy) {
        switch (sortBy) {
          case 'price_asc':
            sql += ' ORDER BY price ASC';
            break;
          case 'price_desc':
            sql += ' ORDER BY price DESC';
            break;
          case 'area_asc':
            sql += ' ORDER BY CAST(REPLACE(area, "㎡", "") AS INTEGER) ASC';
            break;
          case 'area_desc':
            sql += ' ORDER BY CAST(REPLACE(area, "㎡", "") AS INTEGER) DESC';
            break;
          case 'newest':
            sql += ' ORDER BY created_at DESC';
            break;
          case 'oldest':
            sql += ' ORDER BY created_at ASC';
            break;
          default:
            // 默认排序：湘潭数据优先
            sql +=
              ' ORDER BY CASE WHEN city = "xiangtan" THEN 0 ELSE 1 END, created_at DESC';
        }
      } else {
        // 默认排序：湘潭数据优先
        sql +=
          ' ORDER BY CASE WHEN city = "xiangtan" THEN 0 ELSE 1 END, created_at DESC';
      }

      // 添加分页
      const offset = (page - 1) * pageSize;
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(pageSize), offset);

      // 执行查询
      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('高级搜索房源失败:', err.message);
          res.status(500).send({ success: false, message: '高级搜索房源失败' });
        } else {
          // 解析features字段
          const properties = rows.map((row) => ({
            ...row,
            features: row.features ? JSON.parse(row.features) : [],
          }));
          
          // 获取总数用于分页
          const countSql = `SELECT COUNT(*) as total FROM properties${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`;
          const countParams = params.slice(0, -2); // 移除分页参数
          
          db.get(countSql, countParams, (err, countResult) => {
            if (err) {
              console.error('获取房源总数失败:', err.message);
              return res.status(500).send({ success: false, message: '获取房源总数失败' });
            }
            
            res.send({
              success: true,
              data: {
                list: properties,
                pagination: {
                  page: parseInt(page),
                  pageSize: parseInt(pageSize),
                  total: countResult.total || 0,
                  totalPages: Math.ceil((countResult.total || 0) / parseInt(pageSize))
                }
              }
            });
          });
        }
      });
    } catch (error) {
      console.error('处理高级搜索请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取房源估价记录
   */
  static async getPropertyValuations(req, res) {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      // 查询指定房源的估价记录
      const sql = `SELECT * FROM valuation_results 
                  WHERE property_id = ? 
                  ORDER BY created_at DESC 
                  LIMIT ? OFFSET ?`;
      
      db.all(sql, [id, parseInt(limit), parseInt(offset)], (err, rows) => {
        if (err) {
          console.error('获取房源估价记录失败:', err.message);
          return res.status(500).send({ success: false, message: '获取房源估价记录失败' });
        }

        // 解析JSON数据
        const valuationRecords = rows.map(row => ({
          ...row,
          factors: JSON.parse(row.factors),
          propertyInfo: JSON.parse(row.propertyInfo)
        }));

        // 获取总数
        const countSql = `SELECT COUNT(*) as total FROM valuation_results WHERE property_id = ?`;
        db.get(countSql, [id], (err, countResult) => {
          if (err) {
            console.error('获取估价记录总数失败:', err.message);
            return res.status(500).send({ success: false, message: '获取估价记录总数失败' });
          }

          res.send({
            success: true,
            data: {
              list: valuationRecords,
              total: countResult.total || 0
            }
          });
        });
      });
    } catch (error) {
      console.error('处理获取房源估价记录请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取小区列表
   */
  static async getDistricts(req, res) {
    try {
      const { city, keyword } = req.query;

      let sql = 'SELECT DISTINCT district FROM properties';
      let params = [];
      let conditions = [];

      if (city) {
        conditions.push('city = ?');
        params.push(city);
      }

      if (keyword) {
        conditions.push('district LIKE ?');
        params.push(`%${keyword}%`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('获取小区列表失败:', err.message);
          res.status(500).send({ success: false, message: '获取小区列表失败' });
        } else {
          res.send({ success: true, data: rows.map((row) => row.district) });
        }
      });
    } catch (error) {
      console.error('处理获取小区列表请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取市场分析数据
   */
  static async getMarketAnalysis(req, res) {
    try {
      const { city } = req.query;

      // 构建基础查询条件
      let baseCondition = '';
      let params = [];

      if (city) {
        baseCondition = 'WHERE city = ?';
        params.push(city);
      }

      // 获取统计概览数据
      db.get(
        `SELECT 
          COUNT(*) as totalProperties,
          AVG(price) as avgPrice,
          AVG(CAST(REPLACE(area, '㎡', '') AS INTEGER)) as avgArea
         FROM properties ${baseCondition}`,
        params,
        (err, stats) => {
          if (err) {
            console.error('获取市场统计数据失败:', err.message);
            res
              .status(500)
              .send({ success: false, message: '获取市场统计数据失败' });
            return;
          }

          // 获取价格趋势数据（按年份）
          db.all(
            `SELECT 
              CASE 
                WHEN year IS NOT NULL AND year != '' THEN year
                ELSE '未知年份' 
              END as year,
              AVG(price) as avgPrice,
              COUNT(*) as count
             FROM properties ${baseCondition}
             GROUP BY year
             ORDER BY year`,
            params,
            (err, priceTrendData) => {
              if (err) {
                console.error('获取价格趋势数据失败:', err.message);
                res
                  .status(500)
                  .send({ success: false, message: '获取价格趋势数据失败' });
                return;
              }

              // 获取区域价格对比数据
              db.all(
                `SELECT 
                  district,
                  AVG(price) as avgPrice,
                  COUNT(*) as propertyCount
                 FROM properties ${baseCondition}
                 GROUP BY district
                 ORDER BY avgPrice DESC`,
                params,
                (err, districtPriceData) => {
                  if (err) {
                    console.error('获取区域价格数据失败:', err.message);
                    res
                      .status(500)
                      .send({ success: false, message: '获取区域价格数据失败' });
                    return;
                  }

                  // 获取房型分布数据
                  db.all(
                    `SELECT 
                      rooms,
                      COUNT(*) as count
                     FROM properties ${baseCondition}
                     GROUP BY rooms
                     ORDER BY rooms`,
                    params,
                    (err, roomDistributionData) => {
                      if (err) {
                        console.error('获取房型分布数据失败:', err.message);
                        res.status(500).send({
                          success: false,
                          message: '获取房型分布数据失败',
                        });
                        return;
                      }

                      // 获取面积分布数据
                      db.all(
                        `SELECT 
                          CASE 
                            WHEN CAST(REPLACE(area, '㎡', '') AS INTEGER) < 50 THEN '50㎡以下'
                            WHEN CAST(REPLACE(area, '㎡', '') AS INTEGER) BETWEEN 50 AND 70 THEN '50-70㎡'
                            WHEN CAST(REPLACE(area, '㎡', '') AS INTEGER) BETWEEN 70 AND 90 THEN '70-90㎡'
                            WHEN CAST(REPLACE(area, '㎡', '') AS INTEGER) BETWEEN 90 AND 120 THEN '90-120㎡'
                            WHEN CAST(REPLACE(area, '㎡', '') AS INTEGER) BETWEEN 120 AND 150 THEN '120-150㎡'
                            ELSE '150㎡以上' 
                          END as areaRange,
                          COUNT(*) as count
                         FROM properties ${baseCondition}
                         GROUP BY areaRange
                         ORDER BY 
                           CASE areaRange
                             WHEN '50㎡以下' THEN 1
                             WHEN '50-70㎡' THEN 2
                             WHEN '70-90㎡' THEN 3
                             WHEN '90-120㎡' THEN 4
                             WHEN '120-150㎡' THEN 5
                             WHEN '150㎡以上' THEN 6
                           END`,
                        params,
                        (err, areaDistributionData) => {
                          if (err) {
                            console.error('获取面积分布数据失败:', err.message);
                            res.status(500).send({
                              success: false,
                              message: '获取面积分布数据失败',
                            });
                            return;
                          }

                          // 构建响应数据
                          const response = {
                            success: true,
                            data: {
                              // 统计概览
                              overview: {
                                totalProperties: stats.totalProperties || 0,
                                avgPrice: Math.round(stats.avgPrice || 0),
                                avgArea: Math.round(stats.avgArea || 0),
                                avgCycle: Math.round(Math.random() * 30 + 30), // 模拟平均成交周期（30-60天）
                                avgTotalPrice: Math.round(
                                  (stats.avgPrice || 0) * (stats.avgArea || 0)
                                ), // 估算平均总价
                              },
                              // 价格趋势
                              priceTrend: priceTrendData.map((item) => ({
                                year: item.year,
                                avgPrice: Math.round(item.avgPrice || 0),
                                count: item.count,
                              })),
                              // 区域价格对比
                              districtPrices: districtPriceData.map((item) => ({
                                district: item.district,
                                avgPrice: Math.round(item.avgPrice || 0),
                                propertyCount: item.propertyCount,
                              })),
                              // 房型分布
                              roomDistribution: roomDistributionData.map(
                                (item) => ({
                                  rooms: item.rooms,
                                  count: item.count,
                                })
                              ),
                              // 面积分布
                              areaDistribution: areaDistributionData.map(
                                (item) => ({
                                  areaRange: item.areaRange,
                                  count: item.count,
                                })
                              ),
                            },
                          };

                          res.send(response);
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error('处理市场分析请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }
}

export default HouseController;