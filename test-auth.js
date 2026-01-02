const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 创建测试数据库
const dbPath = path.join(__dirname, 'test_auth.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite测试数据库');
    createUsersTable();
  }
});

// 创建users表
function createUsersTable() {
  const sql = `CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    user_sig TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建users表失败:', err.message);
    } else {
      console.log('users表创建成功');
      runTests();
    }
  });
}

// 测试函数
async function runTests() {
  console.log('=== 开始测试用户认证系统 ===\n');

  // 测试用例1：新用户自动注册
  console.log('测试1：新用户自动注册');
  const test1 = await login('new_user_123', 'sig_456');
  console.log('结果:', test1);

  // 测试用例2：已存在用户登录
  console.log('\n测试2：已存在用户登录');
  const test2 = await login('new_user_123', 'sig_456');
  console.log('结果:', test2);

  // 测试用例3：错误的UserSig
  console.log('\n测试3：错误的UserSig');
  const test3 = await login('new_user_123', 'wrong_sig');
  console.log('结果:', test3);

  // 测试用例4：无效的UserID格式
  console.log('\n测试4：无效的UserID格式');
  const test4 = await login('invalid@user.id', 'sig_123');
  console.log('结果:', test4);

  // 测试用例5：过长的UserID
  console.log('\n测试5：过长的UserID');
  const longUserId = 'a'.repeat(35);
  const test5 = await login(longUserId, 'sig_123');
  console.log('结果:', test5);

  // 测试用例6：缺少参数
  console.log('\n测试6：缺少UserSig');
  const test6 = await login('user_123', '');
  console.log('结果:', test6);

  console.log('\n=== 所有测试完成 ===');

  // 关闭数据库连接
  db.close();
}

// 模拟登录函数
function login(user_id, user_sig) {
  return new Promise((resolve, reject) => {
    // 验证参数
    if (!user_id || !user_sig) {
      return resolve({ success: false, message: 'UserID和UserSig不能为空' });
    }

    // 验证UserID格式
    const userIdRegex = /^[a-zA-Z0-9_-]{1,32}$/;
    if (!userIdRegex.test(user_id)) {
      return resolve({
        success: false,
        message:
          'UserID格式错误，只允许字母、数字、下划线和连字符，长度不超过32个字符',
      });
    }

    // 检查UserID是否存在
    db.get('SELECT * FROM users WHERE user_id = ?', [user_id], (err, user) => {
      if (err) {
        console.error('查询用户失败:', err.message);
        return resolve({ success: false, message: '服务器内部错误' });
      }

      // 如果用户存在，验证UserSig
      if (user) {
        if (user.user_sig === user_sig) {
          // 更新最后登录时间
          db.run(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
            [user_id],
            (err) => {
              if (err) {
                console.error('更新用户时间失败:', err.message);
              }
            }
          );
          return resolve({
            success: true,
            message: '登录成功',
            data: { user_id: user.user_id, is_new: false },
          });
        } else {
          return resolve({ success: false, message: 'UserSig验证失败' });
        }
      }
      // 如果用户不存在，自动注册
      else {
        const sql = 'INSERT INTO users (user_id, user_sig) VALUES (?, ?)';
        db.run(sql, [user_id, user_sig], function (err) {
          if (err) {
            console.error('创建用户失败:', err.message);
            return resolve({ success: false, message: '服务器内部错误' });
          }
          return resolve({
            success: true,
            message: '注册并登录成功',
            data: { user_id: user_id, is_new: true },
          });
        });
      }
    });
  });
}

// 直接运行脚本
if (require.main === module) {
  // 清理之前的测试数据库
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('已清理旧的测试数据库');
  }

  // 重新初始化
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('连接数据库失败:', err.message);
    } else {
      console.log('成功连接到SQLite测试数据库');
      createUsersTable();
    }
  });
}
