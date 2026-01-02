const { Pool } = require('pg');
require('dotenv').config();

let poolConfig = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
  ssl: { rejectUnauthorized: false }
};

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    poolConfig = {
      user: url.username || 'postgres',
      password: url.password || 'password',
      host: url.hostname || 'localhost',
      port: parseInt(url.port) || 5432,
      database: url.pathname.split('/')[1] || 'postgres',
      ssl: { rejectUnauthorized: false },
    };
    console.log('使用DATABASE_URL连接字符串配置数据库');
    console.log('主机:', poolConfig.host);
    console.log('数据库:', poolConfig.database);
    console.log('用户:', poolConfig.user);
  } catch (error) {
    console.error('解析DATABASE_URL失败:', error.message);
  }
}

const pool = new Pool(poolConfig);

async function testConnection() {
  try {
    console.log('尝试连接到 PostgreSQL...');
    const result = await pool.query('SELECT NOW()');
    console.log('连接成功！当前时间:', result.rows[0].now);
    
    // 测试创建表
    console.log('创建 testimonials 表...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        content TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('testimonials 表创建成功');
    
    // 插入示例数据
    console.log('插入示例数据...');
    await pool.query(`
      INSERT INTO testimonials (name, title, content) VALUES 
      ('张三', '企业用户', '智汇云平台的AI估价功能非常准确，大大提高了我们的工作效率。'),
      ('李四', '政府官员', '通过智汇云平台，我们能够实时监控市场动态，更好地制定政策。'),
      ('王五', '高校教师', '智汇云平台为我们的教学提供了丰富的案例资源，非常实用。')
      ON CONFLICT DO NOTHING
    `);
    console.log('示例数据插入成功');
    
    // 查询数据
    console.log('查询数据...');
    const testimonials = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
    console.log('查询到', testimonials.rows.length, '条评价');
    console.log(JSON.stringify(testimonials.rows, null, 2));
    
  } catch (error) {
    console.error('错误:', error.message);
    console.error('错误代码:', error.code);
    if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到数据库，请检查连接参数是否正确');
    }
  } finally {
    await pool.end();
  }
}

testConnection();