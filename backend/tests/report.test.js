const request = require('supertest');
const app = require('../index');
const { query } = require('../config/db');

// 模拟JWT认证中间件
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test_user_id' };
    next();
  }
}));

describe('报告API测试', () => {
  let server;
  let testPropertyId;
  let testValuationId;

  beforeAll(async () => {
    server = app.listen(3002);
    
    // 创建测试房产
    const propertySql = `
      INSERT INTO properties (id, user_id, address, city, area, rooms, bathrooms, floor_level, building_year, property_type, orientation, decoration_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    const propertyResult = await query(propertySql, [
      'test_property_id_2',
      'test_user_id',
      '测试地址2',
      '测试城市2',
      120,
      4,
      3,
      8,
      2018,
      'apartment',
      'southeast',
      'luxury'
    ]);
    testPropertyId = propertyResult.rows[0].id;
    
    // 创建测试估价
    const valuationSql = `
      INSERT INTO valuations (id, property_id, user_id, estimated_price, price_per_sqm, confidence_level, model_version, model_type, features, result_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    const valuationResult = await query(valuationSql, [
      'test_valuation_id',
      testPropertyId,
      'test_user_id',
      2400000,
      20000,
      0.85,
      'v1.0.0',
      'ensemble',
      JSON.stringify({
        area: 120,
        rooms: 4,
        bathrooms: 3,
        floor_level: 8,
        building_year: 2018,
        property_type: 'apartment',
        orientation: 'southeast',
        decoration_status: 'luxury'
      }),
      JSON.stringify({
        feature_importance: {
          area: 0.35,
          property_type: 0.20,
          building_year: 0.15,
          floor_level: 0.10,
          rooms: 0.08,
          bathrooms: 0.06,
          orientation: 0.03,
          decoration_status: 0.03
        },
        valuation_time: new Date().toISOString(),
        model_used: 'ensemble'
      })
    ]);
    testValuationId = valuationResult.rows[0].id;
  });

  afterAll(async () => {
    // 清理测试数据
    await query('DELETE FROM valuations WHERE id = $1', [testValuationId]);
    await query('DELETE FROM properties WHERE id = $1', [testPropertyId]);
    server.close();
  });

  describe('GET /api/reports', () => {
    it('应该获取报告列表', async () => {
      const response = await request(server).get('/api/reports');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/reports/generate', () => {
    it('应该基于估价结果生成报告', async () => {
      const response = await request(server)
        .post('/api/reports/generate')
        .send({
          valuation_id: testValuationId,
          format: 'pdf'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '报告生成成功');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('content');
    });
  });
});
