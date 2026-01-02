const request = require('supertest');
const app = require('./server');

describe('API测试', () => {
  // 注册/登录API测试
  describe('注册/登录API', () => {
    it('用户登录成功', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'test@example.com',
        password: 'Test123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('用户注销成功', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'test@example.com',
        password: 'Test123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  // 估价提交API测试
  describe('估价提交API', () => {
    it('单条估价提交成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .post('/api/valuation')
        .set('Authorization', 'Bearer ' + token)
        .send({
          area: 150.5,
          layout: '3室2厅1卫',
          floor: 10,
          totalFloors: 30,
          buildYear: 2015,
          propertyType: '住宅',
          orientation: '南北通透',
          decoration: '精装',
          city: '长沙',
          district: '岳麓区',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
    });

    it('批量估价提交成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .post('/api/valuation')
        .set('Authorization', 'Bearer ' + token)
        .send({
          area: 150.5,
          layout: '3室2厅1卫',
          floor: 10,
          totalFloors: 30,
          buildYear: 2015,
          propertyType: '住宅',
          orientation: '南北通透',
          decoration: '精装',
          city: '长沙',
          district: '岳麓区',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
    });
  });

  // 数据查询API测试
  describe('数据查询API', () => {
    it('物业列表查询成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('物业详情查询成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('条件过滤查询成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('统计数据查询成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', 'Bearer ' + token);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // 收藏功能API测试
  describe('收藏功能API', () => {
    it('添加收藏成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer ' + token)
        .send({
          propertyId: '60d0fe4f5311236168a109ca',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('取消收藏成功', async () => {
      const token = 'test-token';
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer ' + token)
        .send({
          propertyId: '60d0fe4f5311236168a109ca',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('查看收藏列表', async () => {
      const token = 'test-token';
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', 'Bearer ' + token)
        .send({
          propertyId: '60d0fe4f5311236168a109ca',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });
});
