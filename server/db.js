const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建数据库连接
const dbPath = path.join(__dirname, 'valuation.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err.message);
  } else {
    console.log('成功连接到SQLite数据库');

    // 创建properties表
    createPropertiesTable();
    // 创建users表
    createUsersTable();
    // 创建valuation_results表
    createValuationResultsTable();
    // 创建valuation_params表
    createValuationParamsTable();
    // 创建valuation_reports表
    createValuationReportsTable();
    // 创建uploaded_files表
    createUploadedFilesTable();
    // 创建map_geocoding表
    createMapGeocodingTable();
  }
});

// 创建properties表
function createPropertiesTable() {
  const sql = `CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    rooms TEXT NOT NULL,
    area TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    features TEXT,
    year TEXT,
    floor TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建properties表失败:', err.message);
    } else {
      console.log('properties表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);
        CREATE INDEX IF NOT EXISTS idx_properties_district ON properties (district);
        CREATE INDEX IF NOT EXISTS idx_properties_city_district ON properties (city, district);
        CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
        CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties (created_at DESC);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建properties表索引失败:', err.message);
        } else {
          console.log('properties表索引创建成功');
        }
      });
    }
  });
}

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
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建users表索引失败:', err.message);
        } else {
          console.log('users表索引创建成功');
        }
      });
    }
  });
}

// 创建valuation_results表
function createValuationResultsTable() {
  const sql = `CREATE TABLE IF NOT EXISTS valuation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    user_id TEXT,
    total_value INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    confidence INTEGER NOT NULL,
    valuation_method TEXT NOT NULL,
    factors TEXT NOT NULL,
    property_info TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建valuation_results表失败:', err.message);
    } else {
      console.log('valuation_results表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_valuation_results_property_id ON valuation_results (property_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_results_user_id ON valuation_results (user_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_results_created_at ON valuation_results (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_valuation_results_total_value ON valuation_results (total_value);
        CREATE INDEX IF NOT EXISTS idx_valuation_results_property_user ON valuation_results (property_id, user_id);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建valuation_results表索引失败:', err.message);
        } else {
          console.log('valuation_results表索引创建成功');
        }
      });
    }
  });
}

// 创建valuation_params表
function createValuationParamsTable() {
  const sql = `CREATE TABLE IF NOT EXISTS valuation_params (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valuation_id INTEGER NOT NULL,
    params TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (valuation_id) REFERENCES valuation_results(id) ON DELETE CASCADE
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建valuation_params表失败:', err.message);
    } else {
      console.log('valuation_params表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_valuation_params_valuation_id ON valuation_params (valuation_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_params_created_at ON valuation_params (created_at DESC);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建valuation_params表索引失败:', err.message);
        } else {
          console.log('valuation_params表索引创建成功');
        }
      });
    }
  });
}

// 创建valuation_reports表
function createValuationReportsTable() {
  const sql = `CREATE TABLE IF NOT EXISTS valuation_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valuation_id INTEGER NOT NULL,
    user_id TEXT,
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_data TEXT NOT NULL,
    is_generated INTEGER DEFAULT 0,
    download_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (valuation_id) REFERENCES valuation_results(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建valuation_reports表失败:', err.message);
    } else {
      console.log('valuation_reports表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_valuation_reports_valuation_id ON valuation_reports (valuation_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_reports_user_id ON valuation_reports (user_id);
        CREATE INDEX IF NOT EXISTS idx_valuation_reports_created_at ON valuation_reports (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_valuation_reports_is_generated ON valuation_reports (is_generated);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建valuation_reports表索引失败:', err.message);
        } else {
          console.log('valuation_reports表索引创建成功');
        }
      });
    }
  });
}

// 创建uploaded_files表
function createUploadedFilesTable() {
  const sql = `CREATE TABLE IF NOT EXISTS uploaded_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建uploaded_files表失败:', err.message);
    } else {
      console.log('uploaded_files表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files (user_id);
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_upload_time ON uploaded_files (upload_time DESC);
        CREATE INDEX IF NOT EXISTS idx_uploaded_files_is_deleted ON uploaded_files (is_deleted);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建uploaded_files表索引失败:', err.message);
        } else {
          console.log('uploaded_files表索引创建成功');
        }
      });
    }
  });
}

// 创建map_geocoding表
function createMapGeocodingTable() {
  const sql = `CREATE TABLE IF NOT EXISTS map_geocoding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    result TEXT NOT NULL,
    query_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error('创建map_geocoding表失败:', err.message);
    } else {
      console.log('map_geocoding表创建成功');
      
      // 添加索引
      const indexSql = `
        CREATE INDEX IF NOT EXISTS idx_map_geocoding_query ON map_geocoding (query);
        CREATE INDEX IF NOT EXISTS idx_map_geocoding_query_type ON map_geocoding (query_type);
        CREATE INDEX IF NOT EXISTS idx_map_geocoding_created_at ON map_geocoding (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_map_geocoding_query_query_type ON map_geocoding (query, query_type);
      `;
      
      db.exec(indexSql, (err) => {
        if (err) {
          console.error('创建map_geocoding表索引失败:', err.message);
        } else {
          console.log('map_geocoding表索引创建成功');
        }
      });
    }
  });
}

// 导出数据库连接
export default db;
