// 估价控制器
import db from '../db.js';

class EstimateController {
  /**
   * 执行房产估价
   */
  static async performValuation(req, res) {
    try {
      const { params, propertyId, userId } = req.body;

      // 验证参数
      if (!params || !params.area || !params.location || !params.buildingType) {
        return res.status(400).send({ success: false, message: '必填参数缺失' });
      }

      // 模拟估价计算
      const totalValue = Math.round(params.area * 15000 * (Math.random() * 0.2 + 0.9)); // 模拟估价结果，单价在13500-18000之间
      const unitPrice = Math.round(totalValue / params.area);
      const confidence = Math.round(Math.random() * 10 + 85); // 置信度在85-95之间
      const valuationMethod = '综合估价法';
      const factors = JSON.stringify({
        location: Math.random() * 0.3 + 0.25,
        area: Math.random() * 0.2 + 0.15,
        buildingType: Math.random() * 0.2 + 0.15,
        constructionYear: Math.random() * 0.1 + 0.1,
        floor: Math.random() * 0.1 + 0.1,
        orientation: Math.random() * 0.05 + 0.05,
        decorationLevel: Math.random() * 0.05 + 0.05
      });

      const propertyInfo = JSON.stringify({
        area: params.area,
        location: params.location,
        buildingType: params.buildingType,
        constructionYear: params.constructionYear || new Date().getFullYear() - 10,
        floor: params.floor || 5,
        totalFloors: params.totalFloors || 10,
        orientation: params.orientation || '南北通透',
        decorationLevel: params.decorationLevel || '精装修'
      });

      // 保存估价结果到数据库
      const sql = `INSERT INTO valuation_results (property_id, user_id, total_value, unit_price, confidence, valuation_method, factors, property_info) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run(sql, [propertyId, userId, totalValue, unitPrice, confidence, valuationMethod, factors, propertyInfo], function(err) {
        if (err) {
          console.error('保存估价结果失败:', err.message);
          return res.status(500).send({ success: false, message: '保存估价结果失败' });
        }

        // 保存估价参数到数据库
        const valuationId = this.lastID;
        const paramsSql = `INSERT INTO valuation_params (valuation_id, params) VALUES (?, ?)`;

        db.run(paramsSql, [valuationId, JSON.stringify(params)], function(err) {
          if (err) {
            console.error('保存估价参数失败:', err.message);
            return res.status(500).send({ success: false, message: '保存估价参数失败' });
          }

          // 返回估价结果
          res.send({
            success: true,
            data: {
              id: valuationId,
              propertyId,
              userId,
              totalValue,
              unitPrice,
              confidence,
              valuationMethod,
              factors: JSON.parse(factors),
              propertyInfo: JSON.parse(propertyInfo),
              createdAt: new Date().toISOString()
            }
          });
        });
      });
    } catch (error) {
      console.error('处理估价请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取估价结果详情
   */
  static async getValuationResult(req, res) {
    try {
      const { id } = req.params;

      // 查询估价结果
      const sql = `SELECT * FROM valuation_results WHERE id = ?`;
      
      db.get(sql, [id], (err, result) => {
        if (err) {
          console.error('获取估价结果失败:', err.message);
          return res.status(500).send({ success: false, message: '获取估价结果失败' });
        }

        if (!result) {
          return res.status(404).send({ success: false, message: '估价结果不存在' });
        }

        // 查询估价参数
        const paramsSql = `SELECT * FROM valuation_params WHERE valuation_id = ?`;

        db.get(paramsSql, [id], (err, paramsResult) => {
          if (err) {
            console.error('获取估价参数失败:', err.message);
            return res.status(500).send({ success: false, message: '获取估价参数失败' });
          }

          // 解析JSON数据
          result.factors = JSON.parse(result.factors);
          result.propertyInfo = JSON.parse(result.propertyInfo);
          if (paramsResult) {
            result.params = JSON.parse(paramsResult.params);
          }

          res.send({ success: true, data: result });
        });
      });
    } catch (error) {
      console.error('处理获取估价结果请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取估价历史记录
   */
  static async getValuationHistory(req, res) {
    try {
      const { userId, limit = 20, offset = 0 } = req.query;

      let sql = 'SELECT id, property_id, user_id, total_value, unit_price, confidence, valuation_method, factors, property_info, created_at FROM valuation_results';
      let params = [];
      let conditions = [];

      if (userId) {
        conditions.push('user_id = ?');
        params.push(userId);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('获取估价历史记录失败:', err.message);
          return res.status(500).send({ success: false, message: '获取估价历史记录失败' });
        }

        // 解析JSON数据
        const results = rows.map(row => ({
          ...row,
          factors: JSON.parse(row.factors),
          propertyInfo: JSON.parse(row.propertyInfo)
        }));

        res.send({ success: true, data: results });
      });
    } catch (error) {
      console.error('处理获取估价历史记录请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 获取支持的估价方法
   */
  static async getValuationMethods(req, res) {
    try {
      const valuationMethods = [
        { id: 'comprehensive', name: '综合估价法', description: '综合考虑多种因素的估价方法' },
        { id: 'market-comparison', name: '市场比较法', description: '基于市场成交案例的比较估价方法' },
        { id: 'income', name: '收益法', description: '基于收益能力的估价方法' },
        { id: 'cost', name: '成本法', description: '基于成本的估价方法' }
      ];

      res.send({ success: true, data: valuationMethods });
    } catch (error) {
      console.error('处理获取估价方法请求失败:', error);
      res.status(500).send({ success: false, message: '服务器内部错误' });
    }
  }
}

export default EstimateController;