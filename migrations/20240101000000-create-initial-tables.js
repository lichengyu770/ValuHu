'use strict';

/**
 * 初始数据库结构迁移脚本
 * 创建核心业务表结构
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * 1. 创建用户表
     */
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        real_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true,
          unique: true,
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true,
        },
        user_type: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 2,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        last_login_time: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        last_login_ip: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        login_count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        department_id: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        avatar: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        remark: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );

    // 创建用户表索引
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_username',
    });
    await queryInterface.addIndex('users', ['phone'], { name: 'idx_phone' });
    await queryInterface.addIndex('users', ['email'], { name: 'idx_email' });
    await queryInterface.addIndex('users', ['user_type'], {
      name: 'idx_user_type',
    });
    await queryInterface.addIndex('users', ['status'], { name: 'idx_status' });
    await queryInterface.addIndex('users', ['department_id'], {
      name: 'idx_department_id',
    });

    /**
     * 2. 创建角色表
     */
    await queryInterface.createTable(
      'roles',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        type: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 2,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        sort: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );

    // 创建角色表索引
    await queryInterface.addIndex('roles', ['name'], { name: 'idx_name' });
    await queryInterface.addIndex('roles', ['code'], { name: 'idx_code' });
    await queryInterface.addIndex('roles', ['type'], { name: 'idx_type' });
    await queryInterface.addIndex('roles', ['status'], { name: 'idx_status' });
    await queryInterface.addIndex('roles', ['sort'], { name: 'idx_sort' });

    /**
     * 3. 创建权限表
     */
    await queryInterface.createTable(
      'permissions',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        type: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 2,
        },
        module: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        method: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        path: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        icon: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        sort: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        show_in_menu: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_public: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );

    // 创建权限表索引
    await queryInterface.addIndex('permissions', ['code'], {
      name: 'idx_code',
    });
    await queryInterface.addIndex('permissions', ['type'], {
      name: 'idx_type',
    });
    await queryInterface.addIndex('permissions', ['module'], {
      name: 'idx_module',
    });
    await queryInterface.addIndex('permissions', ['status'], {
      name: 'idx_status',
    });
    await queryInterface.addIndex('permissions', ['sort'], {
      name: 'idx_sort',
    });
    await queryInterface.addIndex('permissions', ['show_in_menu'], {
      name: 'idx_show_in_menu',
    });
    await queryInterface.addIndex('permissions', ['is_public'], {
      name: 'idx_is_public',
    });

    /**
     * 4. 创建用户角色关联表
     */
    await queryInterface.createTable(
      'user_roles',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        role_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
      }
    );

    // 创建用户角色关联表索引
    await queryInterface.addIndex('user_roles', ['user_id'], {
      name: 'idx_user_id',
    });
    await queryInterface.addIndex('user_roles', ['role_id'], {
      name: 'idx_role_id',
    });
    await queryInterface.addIndex('user_roles', ['user_id', 'role_id'], {
      name: 'idx_user_role',
      unique: true,
    });

    /**
     * 5. 创建角色权限关联表
     */
    await queryInterface.createTable(
      'role_permissions',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        role_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        permission_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'permissions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
      }
    );

    // 创建角色权限关联表索引
    await queryInterface.addIndex('role_permissions', ['role_id'], {
      name: 'idx_role_id_permission',
    });
    await queryInterface.addIndex('role_permissions', ['permission_id'], {
      name: 'idx_permission_id',
    });
    await queryInterface.addIndex(
      'role_permissions',
      ['role_id', 'permission_id'],
      { name: 'idx_role_permission', unique: true }
    );

    /**
     * 6. 创建房产数据表
     */
    await queryInterface.createTable(
      'properties',
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        area: {
          type: Sequelize.DECIMAL(8, 2),
          allowNull: false,
        },
        bedrooms: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        bathrooms: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        property_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        address: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        district: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 1,
        },
        created_by: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
          ),
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        paranoid: true,
        underscored: true,
      }
    );

    // 创建房产表索引
    await queryInterface.addIndex('properties', ['title'], {
      name: 'idx_title',
    });
    await queryInterface.addIndex('properties', ['price'], {
      name: 'idx_price',
    });
    await queryInterface.addIndex('properties', ['area'], { name: 'idx_area' });
    await queryInterface.addIndex('properties', ['city'], { name: 'idx_city' });
    await queryInterface.addIndex('properties', ['district'], {
      name: 'idx_district',
    });
    await queryInterface.addIndex('properties', ['status'], {
      name: 'idx_property_status',
    });
    await queryInterface.addIndex('properties', ['created_by'], {
      name: 'idx_created_by',
    });
  },

  async down(queryInterface, Sequelize) {
    // 按照创建的逆序删除表
    await queryInterface.dropTable('properties');
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('users');
  },
};
