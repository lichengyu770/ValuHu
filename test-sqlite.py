#!/usr/bin/env python3
"""
智汇云 SQLite 数据库测试
本地开发数据库
"""

import sqlite3
from datetime import datetime

DB_FILE = 'zhihuiyun.db'

def test_connection():
    """测试数据库连接"""
    print("🗄️  测试 SQLite 数据库连接...")
    print(f"   数据库文件: {DB_FILE}")
    
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 测试查询
        cursor.execute("SELECT datetime('now')")
        result = cursor.fetchone()
        print(f"   ✅ 连接成功! 当前时间: {result[0]}")
        
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
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 创建 testimonials 表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                content TEXT,
                avatar TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("   ✅ testimonials 表创建成功")
        
        # 创建 properties 表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS properties (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2),
                type VARCHAR(100),
                area DECIMAL(10, 2),
                longitude DECIMAL(10, 6),
                latitude DECIMAL(10, 6),
                address VARCHAR(500),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("   ✅ properties 表创建成功")
        
        # 创建 users 表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        # 插入评价数据
        cursor.execute("""
            INSERT INTO testimonials (name, title, content) VALUES 
            ('张三', '企业用户', '智汇云平台的AI估价功能非常准确，大大提高了我们的工作效率。'),
            ('李四', '政府官员', '通过智汇云平台，我们能够实时监控市场动态，更好地制定政策。'),
            ('王五', '高校教师', '智汇云平台为我们的教学提供了丰富的案例资源，非常实用。')
        """)
        print("   ✅ 评价数据插入成功")
        
        # 插入房产数据
        cursor.execute("""
            INSERT INTO properties (name, price, type, area, longitude, latitude, address, description) VALUES 
            ('测试房产1', 150.00, '住宅', 120.00, 112.9388, 28.2278, '长沙市岳麓区', '这是一个测试房产'),
            ('测试房产2', 200.00, '写字楼', 200.00, 112.9488, 28.2378, '长沙市天心区', '这是一个测试房产'),
            ('测试房产3', 180.00, '住宅', 150.00, 112.9288, 28.2178, '长沙市开福区', '这是一个测试房产')
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
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM testimonials ORDER BY created_at DESC")
        results = cursor.fetchall()
        
        print(f"   ✅ 查询到 {len(results)} 条评价:")
        for i, row in enumerate(results, 1):
            print(f"   - [{i}] {row[1]} ({row[2]}): {row[3][:40]}...")
        
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
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM properties ORDER BY created_at DESC")
        results = cursor.fetchall()
        
        print(f"   ✅ 查询到 {len(results)} 条房产:")
        for i, row in enumerate(results, 1):
            print(f"   - [{i}] {row[1]} - {row[3]} - {row[2]}万元")
        
        cursor.close()
        conn.close()
        return results
    except Exception as e:
        print(f"   ❌ 查询失败: {e}")
        return []

def main():
    """主函数"""
    print("=" * 60)
    print("🧪 智汇云 SQLite 数据库测试")
    print("=" * 60)
    
    # 测试连接
    if not test_connection():
        print("\n❌ 无法连接到数据库")
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
    
    return {
        'testimonials': testimonials,
        'properties': properties
    }

if __name__ == '__main__':
    main()
