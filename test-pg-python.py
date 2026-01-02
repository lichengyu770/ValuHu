#!/usr/bin/env python3
"""
智汇云 PostgreSQL 数据库连接测试
连接 Supabase PostgreSQL 数据库

配置信息:
- 主机: db.pvwkqpjouweguszvnbvc.supabase.co
- 端口: 5432
- 数据库: postgres
- 用户名: postgres
"""

import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime

# Supabase PostgreSQL 连接配置
DB_CONFIG = {
    'host': 'db.pvwkqpjouweguszvnbvc.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': '147258@Zxcvbnm',
    'sslmode': 'require'
}

# Supabase 项目配置
SUPABASE_URL = 'https://pvwkqpjouweguszvnbvc.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_qrB7zoIuc2ebDgyzbSbs8A_BfRLaUsQ'

def test_connection():
    """测试数据库连接"""
    print("🗄️  测试 PostgreSQL 数据库连接...")
    print(f"   主机: {DB_CONFIG['host']}")
    print(f"   数据库: {DB_CONFIG['database']}")
    print(f"   用户: {DB_CONFIG['user']}")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 测试查询
        cursor.execute("SELECT NOW()")
        result = cursor.fetchone()
        print(f"   ✅ 连接成功! 服务器时间: {result[0]}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"   ❌ 连接失败: {e}")
        return False

def create_tables():
    """创建数据库表"""
    print("\n📋 创建数据库表...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 创建 testimonials 表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS testimonials (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                content TEXT,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        print("   ✅ testimonials 表创建成功")
        
        # 创建 properties 表
        cursor.execute("""
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
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        print("   ✅ properties 表创建成功")
        
        # 创建 users 表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)
        print("   ✅ users 表创建成功")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"   ❌ 创建表失败: {e}")
        return False

def insert_test_data():
    """插入测试数据"""
    print("\n📝 插入测试数据...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # 插入评价数据
        cursor.execute("""
            INSERT INTO testimonials (name, title, content) VALUES 
            ('张三', '企业用户', '智汇云平台的AI估价功能非常准确，大大提高了我们的工作效率。'),
            ('李四', '政府官员', '通过智汇云平台，我们能够实时监控市场动态，更好地制定政策。'),
            ('王五', '高校教师', '智汇云平台为我们的教学提供了丰富的案例资源，非常实用。')
            ON CONFLICT DO NOTHING
        """)
        print("   ✅ 评价数据插入成功")
        
        # 插入房产数据
        cursor.execute("""
            INSERT INTO properties (name, price, type, area, longitude, latitude, address, description) VALUES 
            ('测试房产1', 150.00, '住宅', 120.00, 112.9388, 28.2278, '长沙市岳麓区', '这是一个测试房产'),
            ('测试房产2', 200.00, '写字楼', 200.00, 112.9488, 28.2378, '长沙市天心区', '这是一个测试房产'),
            ('测试房产3', 180.00, '住宅', 150.00, 112.9288, 28.2178, '长沙市开福区', '这是一个测试房产')
            ON CONFLICT DO NOTHING
        """)
        print("   ✅ 房产数据插入成功")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"   ❌ 插入数据失败: {e}")
        return False

def query_testimonials():
    """查询评价数据"""
    print("\n📊 查询评价数据...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM testimonials ORDER BY created_at DESC")
        results = cursor.fetchall()
        
        print(f"   ✅ 查询到 {len(results)} 条评价:")
        for i, row in enumerate(results, 1):
            print(f"   - [{i}] {row['name']} ({row['title']}): {row['content'][:40]}...")
        
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return []

def query_properties():
    """查询房产数据"""
    print("\n🏠 查询房产数据...")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM properties ORDER BY created_at DESC")
        results = cursor.fetchall()
        
        print(f"   ✅ 查询到 {len(results)} 条房产:")
        for i, row in enumerate(results, 1):
            print(f"   - [{i}] {row['name']} - {row['type']} - {row['price']}万元")
        
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return []

def main():
    """主函数"""
    print("=" * 60)
    print("🧪 智汇云 PostgreSQL 数据库测试")
    print("=" * 60)
    
    # 测试连接
    if not test_connection():
        print("\n❌ 无法连接到数据库，请检查网络配置")
        return
    
    # 创建表
    create_tables()
    
    # 插入测试数据
    insert_test_data()
    
    # 查询数据
    testimonials = query_testimonials()
    properties = query_properties()
    
    print("\n" + "=" * 60)
    print("📈 测试完成!")
    print("=" * 60)
    
    # 返回数据供其他程序使用
    return {
        'testimonials': testimonials,
        'properties': properties
    }

if __name__ == '__main__':
    main()
