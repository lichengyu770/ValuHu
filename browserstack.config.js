/**
 * BrowserStack 浏览器测试配置
 * 支持3000+浏览器/OS组合的测试配置
 */

module.exports = {
  // BrowserStack API 凭证
  username: process.env.BROWSERSTACK_USERNAME,
  accessKey: process.env.BROWSERSTACK_ACCESS_KEY,

  // 项目基本配置
  projectName: '我的应用跨浏览器测试',
  buildName: `构建-${new Date().toISOString()}`,

  // 测试超时设置
  timeout: 300000,

  // 并行测试配置
  parallels: 5, // 并行测试数量

  // 测试报告配置
  debug: true,
  networkLogs: true,
  consoleLogs: 'errors',
  video: true,

  // 主流桌面浏览器配置
  desktopBrowsers: [
    // Chrome 全版本测试
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
    },
    {
      browserName: 'Chrome',
      browserVersion: 'latest-1',
      os: 'Windows',
      osVersion: '11',
    },
    {
      browserName: 'Chrome',
      browserVersion: 'latest-2',
      os: 'Windows',
      osVersion: '11',
    },
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Sonoma',
    },
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Ventura',
    },

    // Firefox 全版本测试
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
    },
    {
      browserName: 'Firefox',
      browserVersion: 'latest-1',
      os: 'Windows',
      osVersion: '10',
    },
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Sonoma',
    },

    // Safari 全版本测试
    {
      browserName: 'Safari',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Sonoma',
    },
    {
      browserName: 'Safari',
      browserVersion: 'latest-1',
      os: 'OS X',
      osVersion: 'Ventura',
    },
    {
      browserName: 'Safari',
      browserVersion: 'latest-2',
      os: 'OS X',
      osVersion: 'Monterey',
    },

    // Edge 全版本测试
    {
      browserName: 'Edge',
      browserVersion: 'latest',
      os: 'Windows',
      osVersion: '11',
    },
    {
      browserName: 'Edge',
      browserVersion: 'latest-1',
      os: 'Windows',
      osVersion: '10',
    },

    // IE 兼容测试（如需要）
    // { browserName: 'IE', browserVersion: '11', os: 'Windows', osVersion: '10' },
  ],

  // 移动设备浏览器配置
  mobileDevices: [
    // iOS 设备
    { deviceName: 'iPhone 15 Pro', osVersion: '17', browserName: 'Safari' },
    { deviceName: 'iPhone 15', osVersion: '17', browserName: 'Safari' },
    { deviceName: 'iPhone 14 Pro', osVersion: '16', browserName: 'Safari' },
    { deviceName: 'iPhone 14', osVersion: '16', browserName: 'Safari' },
    { deviceName: 'iPhone 13', osVersion: '15', browserName: 'Safari' },
    { deviceName: 'iPhone 12', osVersion: '14', browserName: 'Safari' },
    { deviceName: 'iPhone 11', osVersion: '13', browserName: 'Safari' },

    // iPad 设备
    {
      deviceName: 'iPad Pro 12.9 2022',
      osVersion: '16',
      browserName: 'Safari',
    },
    { deviceName: 'iPad Air 5', osVersion: '16', browserName: 'Safari' },

    // Android 设备 - Chrome
    {
      deviceName: 'Samsung Galaxy S24',
      osVersion: '14.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Samsung Galaxy S23 Ultra',
      osVersion: '13.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Samsung Galaxy S23',
      osVersion: '13.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Samsung Galaxy S22',
      osVersion: '13.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Google Pixel 8 Pro',
      osVersion: '14.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Google Pixel 7 Pro',
      osVersion: '13.0',
      browserName: 'Chrome',
    },
    { deviceName: 'Google Pixel 6', osVersion: '13.0', browserName: 'Chrome' },

    // Android 设备 - Firefox
    {
      deviceName: 'Samsung Galaxy S23',
      osVersion: '13.0',
      browserName: 'Firefox',
    },
    { deviceName: 'Google Pixel 7', osVersion: '13.0', browserName: 'Firefox' },

    // 旧版Android设备（兼容性测试）
    {
      deviceName: 'Samsung Galaxy S10',
      osVersion: '12.0',
      browserName: 'Chrome',
    },
    {
      deviceName: 'Samsung Galaxy S9',
      osVersion: '10.0',
      browserName: 'Chrome',
    },
  ],

  // 特殊浏览器组合（覆盖小众但重要的浏览器）
  specialBrowsers: [
    // macOS 上的 Firefox
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      os: 'OS X',
      osVersion: 'Sonoma',
    },
    // Linux 系统
    {
      browserName: 'Chrome',
      browserVersion: 'latest',
      os: 'Linux',
      osVersion: 'Ubuntu',
    },
    {
      browserName: 'Firefox',
      browserVersion: 'latest',
      os: 'Linux',
      osVersion: 'Ubuntu',
    },
  ],

  // 企业级浏览器配置（如需要）
  enterpriseBrowsers: [
    {
      browserName: 'Chrome',
      browserVersion: '100',
      os: 'Windows',
      osVersion: '11',
    }, // 企业常用版本
    {
      browserName: 'Edge',
      browserVersion: '100',
      os: 'Windows',
      osVersion: '11',
    }, // 企业常用版本
  ],

  // 获取所有浏览器配置
  getAllBrowsers: function () {
    return [
      ...this.desktopBrowsers,
      ...this.mobileDevices,
      ...this.specialBrowsers,
      ...this.enterpriseBrowsers,
    ];
  },

  // 获取精简版浏览器配置（快速测试）
  getQuickTestBrowsers: function () {
    return [
      {
        browserName: 'Chrome',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '11',
      },
      {
        browserName: 'Safari',
        browserVersion: 'latest',
        os: 'OS X',
        osVersion: 'Sonoma',
      },
      {
        browserName: 'Edge',
        browserVersion: 'latest',
        os: 'Windows',
        osVersion: '11',
      },
      { deviceName: 'iPhone 15', osVersion: '17', browserName: 'Safari' },
      {
        deviceName: 'Samsung Galaxy S23',
        osVersion: '13.0',
        browserName: 'Chrome',
      },
    ];
  },
};

// 使用说明：
// 1. 在命令行中设置环境变量：
//    set BROWSERSTACK_USERNAME=your_username
//    set BROWSERSTACK_ACCESS_KEY=your_access_key
// 2. 引入此配置文件到测试脚本中：
//    const browserstackConfig = require('./browserstack.config');
// 3. 根据需要选择完整测试或快速测试配置
