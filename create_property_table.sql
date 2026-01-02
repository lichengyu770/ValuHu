-- 创建更详细的房产信息表，包含清洗后的数据字段
CREATE TABLE IF NOT EXISTS property_details (
    id SERIAL PRIMARY KEY,
    property_id VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    area DECIMAL(10, 2) NOT NULL,
    rooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    floor_level INTEGER,
    total_floors INTEGER,
    building_year INTEGER,
    property_type VARCHAR(50),
    orientation VARCHAR(50),
    decoration_status VARCHAR(50),
    price DECIMAL(15, 2) NOT NULL,
    price_per_sqm DECIMAL(10, 2),
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    source VARCHAR(100) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE,
    cleaned_at TIMESTAMP WITH TIME ZONE,
    -- 衍生特征
    age INTEGER,
    size_category VARCHAR(50),
    floor_category VARCHAR(50),
    -- 周边配套距离
    subway_distance DECIMAL(10, 2),
    school_distance DECIMAL(10, 2),
    hospital_distance DECIMAL(10, 2),
    park_distance DECIMAL(10, 2),
    -- 创建和更新时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_property_details_address ON property_details(address);
CREATE INDEX IF NOT EXISTS idx_property_details_district ON property_details(district);
CREATE INDEX IF NOT EXISTS idx_property_details_source ON property_details(source);
CREATE INDEX IF NOT EXISTS idx_property_details_price_per_sqm ON property_details(price_per_sqm);
CREATE INDEX IF NOT EXISTS idx_property_details_updated_at ON property_details(updated_at DESC);

-- 添加表注释
COMMENT ON TABLE property_details IS '详细房产信息表，包含清洗后的数据和衍生特征';
