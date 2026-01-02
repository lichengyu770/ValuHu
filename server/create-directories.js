const fs = require('fs');
const path = require('path');

// 要创建的目录列表
const directories = [
  'routes',
  'controllers',
  'middlewares',
  'utils'
];

// 创建目录
for (const dir of directories) {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`创建目录: ${dirPath}`);
  } else {
    console.log(`目录已存在: ${dirPath}`);
  }
}

console.log('所有目录创建完成！');