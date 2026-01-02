const { Pool } = require('pg');
require('dotenv').config();

let poolConfig = {
  user: process.env.PG_USER || 'postgres',
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'zhihuiyun',
  password: process.env.PG_PASSWORD || 'password',
  port: process.env.PG_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
  } catch (error) {
    console.error('解析DATABASE_URL失败:', error.message);
  }
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

module.exports = {
  query,
  pool,
};