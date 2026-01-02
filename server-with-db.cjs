const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3003;
const PUBLIC_DIR = __dirname;

// 导入现有的数据库连接池
const pool = require('./mysql-utils/db-pool');

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 处理API请求
async function handleApiRequest(req, res) {
  const urlParts = req.url.split('/');
  const apiPath = urlParts[2];

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    let result;

    // 示例API端点
    switch (apiPath) {
      case 'test':
        // 测试数据库连接的简单查询
        result = await pool.execute('SELECT 1 + 1 AS result');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: result[0] }));
        break;

      case 'users':
        if (req.method === 'GET') {
          // 获取用户列表（示例）
          result = await pool.execute('SELECT * FROM users LIMIT 10');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: result[0] }));
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ success: false, message: 'Method not allowed' })
          );
        }
        break;

      case 'valuation':
        if (req.method === 'GET') {
          // 获取估价数据（示例）
          result = await pool.execute(
            'SELECT * FROM valuation_records LIMIT 10'
          );
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: result[0] }));
        } else {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ success: false, message: 'Method not allowed' })
          );
        }
        break;

      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ success: false, message: 'API endpoint not found' })
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ success: false, message: 'Internal server error' })
    );
  }
}

// 处理静态文件请求
async function handleStaticRequest(req, res) {
  // 处理根路径
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(PUBLIC_DIR, filePath);

  // 获取文件扩展名
  const extname = String(path.extname(filePath)).toLowerCase();
  // 设置默认MIME类型
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  try {
    // 读取文件
    const content = await fs.readFile(filePath);
    // 文件存在，返回文件内容
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 文件不存在
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>', 'utf-8');
    } else {
      // 服务器错误
      res.writeHead(500);
      res.end(`Server Error: ${error.code}`, 'utf-8');
    }
  }
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // 处理API请求
  if (req.url.startsWith('/api/')) {
    await handleApiRequest(req, res);
  } else {
    // 处理静态文件请求
    await handleStaticRequest(req, res);
  }
});

// 启动服务器
async function startServer() {
  console.log('Starting server...');

  // 启动HTTP服务器
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${PUBLIC_DIR}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api/`);
  });
}

startServer();
