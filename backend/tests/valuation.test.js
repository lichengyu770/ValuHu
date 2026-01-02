const request = require('supertest');
const app = require('../index');
const { query, pool } = require('../config/db');

// 模拟JWT认证中间件
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'test_user_id' };
    next();
  }
}));

describe('估价API测试', () => {
  let server;
  let testPropertyId;

  beforeAll(async () => {
    server = app.listen(3001);
    
    // 创建测试房产
    const propertySql = `
      INSERT INTO properties (id, user_id, address, city, area, rooms, bathrooms, floor_level, building_year, property_type, orientation, decoration_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;
    const propertyResult = await query(propertySql, [
      'test_property_id',
      'test_user_id',
      '测试地址',
      '测试城市',
      100,
      3,
      2,
      10,
      2015,
      'apartment',
      'south',
      'fine'
    ]);
    testPropertyId = propertyResult.rows[0].id;
  });

  afterAll(async () => {
    // 清理测试数据
    await query('DELETE FROM valuations WHERE property_id = $1', [testPropertyId]);
    await query('DELETE FROM properties WHERE id = $1', [testPropertyId]);
    await pool.end();
    server.close();
  });

  describe('GET /api/valuations', () => {
    it('应该获取估价列表', async () => {
      const response = await request(server).get('/api/valuations');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/valuations', () => {
    it('应该创建新估价', async () => {
      const response = await request(server)
        .post('/api/valuations')
        .send({
          property_id: testPropertyId,
          model_type: 'ensemble'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('estimated_price');
      expect(response.body.data).toHaveProperty('confidence_level');
      expect(response.body.data.property_id).toBe(testPropertyId);
    });
  });

  describe('POST /api/valuations/batch', () => {
    it('应该批量创建估价', async () => {
      const response = await request(server)
        .post('/api/valuations/batch')
        .send({
          property_ids: [testPropertyId],
          model_type: 'random_forest'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/valuations/market/trend', () => {
    it('应该获取市场趋势分析', async () => {
      const response = await request(server).get('/api/valuations/market/trend');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('city');
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('GET /api/valuations/comparison', () => {
    it('应该获取估价对比', async () => {
      const response = await request(server)
        .get('/api/valuations/comparison')
        .query({ property_id: testPropertyId });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('property_id');
      expect(response.body.data).toHaveProperty('valuations');
    });
  });

  describe('GET /api/valuations/history', () => {
    it('应该获取用户估价历史', async () => {
      const response = await request(server).get('/api/valuations/history');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('GET /api/valuations/property/:property_id', () => {
    it('应该获取房产估价历史', async () => {
      const response = await request(server).get(`/api/valuations/property/${testPropertyId}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});
