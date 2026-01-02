-- ============================================
-- 智汇云 Supabase 数据库初始化脚本
-- ============================================

-- Supabase URL: https://pvwkqpjouweguszvnbvc.supabase.co
-- 数据库: postgres
-- ============================================

-- 1. 创建 testimonials (用户评价) 表
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入示例评价数据
INSERT INTO testimonials (name, title, content) VALUES 
('张三', '企业用户', '智汇云平台的AI估价功能非常准确，大大提高了我们的工作效率。'),
('李四', '政府官员', '通过智汇云平台，我们能够实时监控市场动态，更好地制定政策。'),
('王五', '高校教师', '智汇云平台为我们的教学提供了丰富的案例资源，非常实用。')
ON CONFLICT DO NOTHING;

-- 2. 创建 properties (房产信息) 表
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    type VARCHAR(100),
    area DECIMAL(10, 2),
    longitude DECIMAL(10, 6),
    latitude DECIMAL(10, 6),
    address VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入示例房产数据
INSERT INTO properties (name, price, type, area, longitude, latitude, address, description) VALUES 
('测试房产1', 150.00, '住宅', 120.00, 112.9388, 28.2278, '长沙市岳麓区', '这是一个测试房产'),
('测试房产2', 200.00, '写字楼', 200.00, 112.9488, 28.2378, '长沙市天心区', '这是一个测试房产'),
('测试房产3', 180.00, '住宅', 150.00, 112.9288, 28.2178, '长沙市开福区', '这是一个测试房产')
ON CONFLICT DO NOTHING;

-- 3. 创建 users (用户) 表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建 indexes (索引) 提高查询性能
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 5. 添加 comments (注释)
COMMENT ON TABLE testimonials IS '用户评价表';
COMMENT ON TABLE properties IS '房产信息表';
COMMENT ON TABLE users IS '用户账户表';

-- ============================================
-- 执行方法:
-- 1. 登录 Supabase: https://pvwkqpjouweguszvnbvc.supabase.co
-- 2. 进入 SQL Editor
-- 3. 复制并执行此脚本
-- ============================================

-- 验证查询
SELECT 'testimonials' as table_name, COUNT(*) as count FROM testimonials
UNION ALL
SELECT 'properties' as table_name, COUNT(*) as count FROM properties
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users;
