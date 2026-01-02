-- MySQL数据库表结构设计
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS valuation_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE valuation_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（哈希存储）',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user' COMMENT '用户角色',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
    -- 索引
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_role_status (role, status),
    -- 约束
    CONSTRAINT chk_username_length CHECK (LENGTH(username) >= 6),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    CONSTRAINT chk_phone_format CHECK (phone REGEXP '^[0-9]{10,15}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 房产表
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '关联用户ID',
    title VARCHAR(100) NOT NULL COMMENT '房产标题',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    district VARCHAR(50) NOT NULL COMMENT '区域',
    address VARCHAR(200) NOT NULL COMMENT '详细地址',
    rooms VARCHAR(20) NOT NULL COMMENT '户型',
    area DECIMAL(10,2) NOT NULL COMMENT '面积（平方米）',
    floor INT NOT NULL COMMENT '所在楼层',
    total_floors INT NOT NULL COMMENT '总楼层',
    building_year INT NOT NULL COMMENT '建筑年份',
    property_type ENUM('住宅', '商业', '工业') NOT NULL DEFAULT '住宅' COMMENT '房产类型',
    orientation VARCHAR(20) NOT NULL COMMENT '朝向',
    decoration VARCHAR(20) NOT NULL DEFAULT '简装' COMMENT '装修情况',
    features TEXT COMMENT '特色描述',
    image VARCHAR(255) NOT NULL COMMENT '图片路径',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 外键
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_city_district (city, district),
    INDEX idx_property_type (property_type),
    INDEX idx_area (area),
    INDEX idx_building_year (building_year),
    INDEX idx_status (status),
    -- 空间索引（用于地理位置查询优化）
    INDEX idx_location (city, district, address),
    -- 约束
    CONSTRAINT chk_area_positive CHECK (area > 0),
    CONSTRAINT chk_floor_positive CHECK (floor > 0),
    CONSTRAINT chk_total_floors_positive CHECK (total_floors > 0),
    CONSTRAINT chk_floor_less_than_total CHECK (floor <= total_floors),
    CONSTRAINT chk_building_year_valid CHECK (building_year BETWEEN 1900 AND YEAR(CURRENT_DATE) + 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房产表';

-- 估价记录表
CREATE TABLE IF NOT EXISTS valuation_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL COMMENT '关联房产ID',
    user_id INT NOT NULL COMMENT '关联用户ID',
    valuation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '估价日期',
    estimated_value DECIMAL(15,2) NOT NULL COMMENT '估价金额（元）',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '单价（元/平方米）',
    confidence_level INT NOT NULL COMMENT '置信度（0-100）',
    valuation_method ENUM('市场比较法', '收益法', '成本法') NOT NULL COMMENT '估价方法',
    valuation_algorithm VARCHAR(50) NOT NULL COMMENT '估价算法版本',
    input_params JSON NOT NULL COMMENT '输入参数（JSON格式）',
    output_data JSON NOT NULL COMMENT '输出数据（JSON格式）',
    status ENUM('success', 'failed', 'pending') NOT NULL DEFAULT 'success' COMMENT '状态',
    error_message TEXT COMMENT '错误信息（仅当状态为failed时使用）',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    -- 外键
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    -- 索引
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_valuation_date (valuation_date),
    INDEX idx_status (status),
    INDEX idx_confidence_level (confidence_level),
    INDEX idx_valuation_method (valuation_method),
    -- 联合索引
    INDEX idx_property_user (property_id, user_id),
    -- 约束
    CONSTRAINT chk_estimated_value_positive CHECK (estimated_value > 0),
    CONSTRAINT chk_unit_price_positive CHECK (unit_price > 0),
    CONSTRAINT chk_confidence_level_range CHECK (confidence_level BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='估价记录表';