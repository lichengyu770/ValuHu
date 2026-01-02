'use strict';

const bcrypt = require('bcrypt');

/**
 * 初始化基础数据
 * 添加默认管理员、角色和权限
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 生成管理员密码的哈希值
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    /**
     * 1. 添加系统角色
     */
    const roleIds = await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: '超级管理员',
          code: 'SUPER_ADMIN',
          description: '系统超级管理员，拥有所有权限',
          type: 1, // 系统预设角色
          status: 1,
          sort: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: '系统管理员',
          code: 'ADMIN',
          description: '系统管理员，拥有大部分管理权限',
          type: 1,
          status: 1,
          sort: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: '普通用户',
          code: 'USER',
          description: '普通用户，拥有基础操作权限',
          type: 1,
          status: 1,
          sort: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // 获取角色ID
    const superAdminRoleId = roleIds[0].id;
    const adminRoleId = roleIds[1].id;
    const userRoleId = roleIds[2].id;

    /**
     * 2. 添加系统权限
     */
    // 系统管理模块权限
    const systemPermissions = [
      // 用户管理
      {
        name: '用户列表',
        code: 'USER_LIST',
        type: 1,
        module: 'system',
        show_in_menu: true,
        icon: 'user',
        sort: 1,
        status: 1,
      },
      {
        name: '用户创建',
        code: 'USER_CREATE',
        type: 2,
        module: 'system',
        sort: 1,
        status: 1,
      },
      {
        name: '用户编辑',
        code: 'USER_EDIT',
        type: 2,
        module: 'system',
        sort: 2,
        status: 1,
      },
      {
        name: '用户删除',
        code: 'USER_DELETE',
        type: 2,
        module: 'system',
        sort: 3,
        status: 1,
      },
      {
        name: '用户详情',
        code: 'USER_VIEW',
        type: 2,
        module: 'system',
        sort: 4,
        status: 1,
      },

      // 角色管理
      {
        name: '角色列表',
        code: 'ROLE_LIST',
        type: 1,
        module: 'system',
        show_in_menu: true,
        icon: 'role',
        sort: 2,
        status: 1,
      },
      {
        name: '角色创建',
        code: 'ROLE_CREATE',
        type: 2,
        module: 'system',
        sort: 1,
        status: 1,
      },
      {
        name: '角色编辑',
        code: 'ROLE_EDIT',
        type: 2,
        module: 'system',
        sort: 2,
        status: 1,
      },
      {
        name: '角色删除',
        code: 'ROLE_DELETE',
        type: 2,
        module: 'system',
        sort: 3,
        status: 1,
      },
      {
        name: '角色详情',
        code: 'ROLE_VIEW',
        type: 2,
        module: 'system',
        sort: 4,
        status: 1,
      },
      {
        name: '角色分配权限',
        code: 'ROLE_ASSIGN_PERMISSION',
        type: 2,
        module: 'system',
        sort: 5,
        status: 1,
      },

      // 权限管理
      {
        name: '权限列表',
        code: 'PERMISSION_LIST',
        type: 1,
        module: 'system',
        show_in_menu: true,
        icon: 'permission',
        sort: 3,
        status: 1,
      },
      {
        name: '权限创建',
        code: 'PERMISSION_CREATE',
        type: 2,
        module: 'system',
        sort: 1,
        status: 1,
      },
      {
        name: '权限编辑',
        code: 'PERMISSION_EDIT',
        type: 2,
        module: 'system',
        sort: 2,
        status: 1,
      },
      {
        name: '权限删除',
        code: 'PERMISSION_DELETE',
        type: 2,
        module: 'system',
        sort: 3,
        status: 1,
      },
    ];

    // 房产管理模块权限
    const propertyPermissions = [
      {
        name: '房产列表',
        code: 'PROPERTY_LIST',
        type: 1,
        module: 'property',
        show_in_menu: true,
        icon: 'property',
        sort: 1,
        status: 1,
      },
      {
        name: '房产创建',
        code: 'PROPERTY_CREATE',
        type: 2,
        module: 'property',
        sort: 1,
        status: 1,
      },
      {
        name: '房产编辑',
        code: 'PROPERTY_EDIT',
        type: 2,
        module: 'property',
        sort: 2,
        status: 1,
      },
      {
        name: '房产删除',
        code: 'PROPERTY_DELETE',
        type: 2,
        module: 'property',
        sort: 3,
        status: 1,
      },
      {
        name: '房产详情',
        code: 'PROPERTY_VIEW',
        type: 2,
        module: 'property',
        sort: 4,
        status: 1,
      },
      {
        name: '房产导入',
        code: 'PROPERTY_IMPORT',
        type: 2,
        module: 'property',
        sort: 5,
        status: 1,
      },
      {
        name: '房产导出',
        code: 'PROPERTY_EXPORT',
        type: 2,
        module: 'property',
        sort: 6,
        status: 1,
      },
    ];

    // 系统公共权限
    const commonPermissions = [
      {
        name: '登录',
        code: 'LOGIN',
        type: 2,
        module: 'common',
        is_public: true,
        sort: 1,
        status: 1,
      },
      {
        name: '获取用户信息',
        code: 'GET_USER_INFO',
        type: 2,
        module: 'common',
        sort: 2,
        status: 1,
      },
      {
        name: '退出登录',
        code: 'LOGOUT',
        type: 2,
        module: 'common',
        sort: 3,
        status: 1,
      },
      {
        name: '修改密码',
        code: 'CHANGE_PASSWORD',
        type: 2,
        module: 'common',
        sort: 4,
        status: 1,
      },
    ];

    // 合并所有权限
    const allPermissions = [
      ...systemPermissions,
      ...propertyPermissions,
      ...commonPermissions,
    ];

    // 添加时间戳
    const permissionsWithTimestamps = allPermissions.map((permission) => ({
      ...permission,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    // 执行权限插入
    const permissionIds = await queryInterface.bulkInsert(
      'permissions',
      permissionsWithTimestamps,
      { returning: true }
    );

    /**
     * 3. 添加默认管理员用户
     */
    const userIds = await queryInterface.bulkInsert(
      'users',
      [
        {
          username: 'admin',
          password: adminPasswordHash,
          real_name: '超级管理员',
          phone: '13800138000',
          email: 'admin@example.com',
          user_type: 1, // 管理员类型
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          username: 'user',
          password: await bcrypt.hash('user123', 10),
          real_name: '测试用户',
          phone: '13900139000',
          email: 'user@example.com',
          user_type: 2, // 普通用户类型
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { returning: true }
    );

    // 获取用户ID
    const adminUserId = userIds[0].id;
    const testUserId = userIds[1].id;

    /**
     * 4. 关联用户和角色
     */
    await queryInterface.bulkInsert('user_roles', [
      {
        user_id: adminUserId,
        role_id: superAdminRoleId,
        created_at: new Date(),
      },
      { user_id: testUserId, role_id: userRoleId, created_at: new Date() },
    ]);

    /**
     * 5. 关联角色和权限
     */
    // 超级管理员拥有所有权限
    const superAdminPermissions = permissionIds.map((permission) => ({
      role_id: superAdminRoleId,
      permission_id: permission.id,
      created_at: new Date(),
    }));

    // 普通用户只拥有基础权限
    const userPermissions = permissionIds
      .filter(
        (permission) =>
          permission.code === 'LOGIN' ||
          permission.code === 'GET_USER_INFO' ||
          permission.code === 'LOGOUT' ||
          permission.code === 'CHANGE_PASSWORD' ||
          permission.code === 'PROPERTY_LIST' ||
          permission.code === 'PROPERTY_VIEW'
      )
      .map((permission) => ({
        role_id: userRoleId,
        permission_id: permission.id,
        created_at: new Date(),
      }));

    // 执行权限分配
    await queryInterface.bulkInsert('role_permissions', [
      ...superAdminPermissions,
      ...userPermissions,
    ]);

    /**
     * 6. 添加示例房产数据
     */
    await queryInterface.bulkInsert('properties', [
      {
        title: '豪华海景别墅',
        description:
          '位于海边的豪华别墅，拥有私人泳池和花园，视野开阔，环境优美。',
        price: 8999000.0,
        area: 350.5,
        bedrooms: 5,
        bathrooms: 4,
        property_type: '别墅',
        address: '海滨大道88号',
        city: '三亚',
        district: '海棠湾',
        status: 1,
        created_by: adminUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '市中心精装公寓',
        description: '位于城市中心的高档公寓，交通便利，周边配套设施齐全。',
        price: 1980000.0,
        area: 95.2,
        bedrooms: 2,
        bathrooms: 1,
        property_type: '公寓',
        address: '中央商务区55号',
        city: '北京',
        district: '朝阳区',
        status: 1,
        created_by: adminUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: '花园洋房',
        description: '低密度社区花园洋房，一楼带花园，环境幽静，适合居住。',
        price: 3580000.0,
        area: 142.8,
        bedrooms: 3,
        bathrooms: 2,
        property_type: '洋房',
        address: '花园小区12栋',
        city: '上海',
        district: '浦东新区',
        status: 1,
        created_by: adminUserId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // 按照创建的逆序删除数据
    await queryInterface.bulkDelete('properties', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
