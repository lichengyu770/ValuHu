package main

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

var db *sql.DB

// 初始化数据库连接
func InitDB() error {
	var err error
	// 连接到MySQL数据库
	// 注意：这里使用root用户和空密码，实际生产环境中应使用安全的凭证
	db, err = sql.Open("mysql", "root:@tcp(localhost:3306)/fangsuanyun?charset=utf8mb4&parseTime=True&loc=Local")
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// 测试数据库连接
	if err = db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// 创建表格
	if err = createTables(); err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	fmt.Println("Database initialized successfully")
	return nil
}

// 创建数据库表格
func createTables() error {
	// 创建数据库（如果不存在）
	_, err := db.Exec("CREATE DATABASE IF NOT EXISTS fangsuanyun")
	if err != nil {
		return fmt.Errorf("failed to create database: %w", err)
	}

	// 切换到fangsuanyun数据库
	_, err = db.Exec("USE fangsuanyun")
	if err != nil {
		return fmt.Errorf("failed to use database: %w", err)
	}

	// 创建湘潭区数据表格 - 适应实际的房产数据结构
	createDistrictDataTable := `
	CREATE TABLE IF NOT EXISTS xiangtan_district_data (
		id INT AUTO_INCREMENT PRIMARY KEY,
		project_name VARCHAR(255) NOT NULL,
		building_area DECIMAL(10,2),
		house_type VARCHAR(50),
		district VARCHAR(100),
		decoration VARCHAR(50),
		average_price DECIMAL(10,2),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`

	// 执行创建表格语句
	_, err = db.Exec(createDistrictDataTable)
	if err != nil {
		return fmt.Errorf("failed to create xiangtan_district_data table: %w", err)
	}

	return nil
}

// 关闭数据库连接
func CloseDB() error {
	if db != nil {
		return db.Close()
	}
	return nil
}
