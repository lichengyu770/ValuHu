// 数据库操作工具函数
const db = require('../db');

/**
 * 执行数据库查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<any>} 查询结果
 */
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('数据库查询失败:', err.message, 'SQL:', sql, 'Params:', params);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * 执行单个数据库查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<any>} 查询结果
 */
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('数据库单个查询失败:', err.message, 'SQL:', sql, 'Params:', params);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * 执行数据库插入操作
 * @param {string} sql - SQL插入语句
 * @param {Array} params - 插入参数
 * @returns {Promise<number>} 插入的ID
 */
const insert = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('数据库插入失败:', err.message, 'SQL:', sql, 'Params:', params);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * 执行数据库更新操作
 * @param {string} sql - SQL更新语句
 * @param {Array} params - 更新参数
 * @returns {Promise<number>} 影响的行数
 */
const update = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('数据库更新失败:', err.message, 'SQL:', sql, 'Params:', params);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

/**
 * 执行数据库删除操作
 * @param {string} sql - SQL删除语句
 * @param {Array} params - 删除参数
 * @returns {Promise<number>} 影响的行数
 */
const remove = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('数据库删除失败:', err.message, 'SQL:', sql, 'Params:', params);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

module.exports = {
  query,
  get,
  insert,
  update,
  remove
};
