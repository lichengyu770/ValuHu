/**
 * LambdaTest 自动化截图测试配置
 * 用于跨浏览器兼容性和视觉回归测试
 */

module.exports = {
  // LambdaTest API 凭证
  username: process.env.LAMBDATEST_USERNAME,
  accessKey: process.env.LAMBDATEST_ACCESS_KEY,

  // 基本配置
  projectName: '我的应用视觉测试',
  buildName: `视觉测试-${new Date().toISOString()}`,

  // 自动化截图测试配置
  screenshotConfig: {
    // 要测试的URL列表
    urls: [
      'http://localhost:5173/',
      'http://localhost:5173/login',
      'http://localhost:5173/dashboard',
      // 添加更多需要截图测试的页面
    ],

    // 截图尺寸（用于响应式测试）
    resolutions: [
      { width: 1920, height: 1080 }, // 桌面
      { width: 1366, height: 768 }, // 笔记本
      { width: 1024, height: 768 }, // 平板横向
      { width: 768, height: 1024 }, // 平板纵向
      { width: 414, height: 896 }, // iPhone XR/11
      { width: 375, height: 812 }, // iPhone X/XS/11 Pro
      { width: 360, height: 740 }, // 安卓手机
    ],

    // 等待时间（毫秒）
    waitTime: 5000,

    // 是否比较与基准图像
    compareWithBaseline: true,

    // 差异阈值（0-1）
    diffThreshold: 0.05,
  },

  // 浏览器组合配置 - 覆盖LambdaTest支持的主流浏览器
  browserConfigs: [
    // Windows 平台
    {
      platformName: 'Windows 11',
      browsers: [
        { browserName: 'Chrome', browserVersion: 'latest' },
        { browserName: 'Chrome', browserVersion: 'latest-1' },
        { browserName: 'Firefox', browserVersion: 'latest' },
        { browserName: 'Firefox', browserVersion: 'latest-1' },
        { browserName: 'Edge', browserVersion: 'latest' },
        { browserName: 'Edge', browserVersion: 'latest-1' },
      ],
    },
    {
      platformName: 'Windows 10',
      browsers: [
        { browserName: 'Chrome', browserVersion: 'latest' },
        { browserName: 'Firefox', browserVersion: 'latest' },
        { browserName: 'Edge', browserVersion: 'latest' },
      ],
    },

    // macOS 平台
    {
      platformName: 'macOS Sonoma',
      browsers: [
        { browserName: 'Safari', browserVersion: 'latest' },
        { browserName: 'Chrome', browserVersion: 'latest' },
        { browserName: 'Firefox', browserVersion: 'latest' },
      ],
    },
    {
      platformName: 'macOS Ventura',
      browsers: [
        { browserName: 'Safari', browserVersion: 'latest' },
        { browserName: 'Chrome', browserVersion: 'latest' },
      ],
    },

    // iOS 设备
    {
      deviceName: 'iPhone 15',
      platformVersion: '17',
      browsers: [{ browserName: 'Safari' }],
    },
    {
      deviceName: 'iPhone 14',
      platformVersion: '16',
      browsers: [{ browserName: 'Safari' }],
    },
    {
      deviceName: 'iPhone 13',
      platformVersion: '15',
      browsers: [{ browserName: 'Safari' }],
    },
    {
      deviceName: 'iPad Pro 12.9 2022',
      platformVersion: '16',
      browsers: [{ browserName: 'Safari' }],
    },

    // Android 设备
    {
      deviceName: 'Samsung Galaxy S24',
      platformVersion: '14',
      browsers: [{ browserName: 'Chrome' }],
    },
    {
      deviceName: 'Samsung Galaxy S23',
      platformVersion: '13',
      browsers: [{ browserName: 'Chrome' }, { browserName: 'Firefox' }],
    },
    {
      deviceName: 'Google Pixel 8',
      platformVersion: '14',
      browsers: [{ browserName: 'Chrome' }],
    },
    {
      deviceName: 'Google Pixel 7',
      platformVersion: '13',
      browsers: [{ browserName: 'Chrome' }],
    },
    {
      deviceName: 'OnePlus 11',
      platformVersion: '13',
      browsers: [{ browserName: 'Chrome' }],
    },
  ],

  // 高级配置
  advanced: {
    // 隧道配置（用于本地开发环境测试）
    tunnel: true,
    tunnelName: 'my-app-tunnel',

    // 网络节流配置（模拟不同网络环境）
    networkThrottling: [
      'online', // 正常网络
      '3g', // 3G网络
      'offline', // 离线状态
    ],

    // 缓存控制
    clearCache: true,
    clearCookies: true,

    // 视觉回归配置
    visualRegression: {
      enabled: true,
      generateDiff: true,
      saveNewScreenshots: true,
    },
  },

  // 获取所有浏览器组合
  getAllBrowserCombinations: function () {
    const combinations = [];

    this.browserConfigs.forEach((config) => {
      config.browsers.forEach((browser) => {
        combinations.push({
          ...config,
          ...browser,
          // 移除嵌套的browsers数组
          browsers: undefined,
        });
      });
    });

    return combinations;
  },

  // 获取精简版浏览器组合（快速测试）
  getQuickTestCombinations: function () {
    return [
      {
        platformName: 'Windows 11',
        browserName: 'Chrome',
        browserVersion: 'latest',
      },
      {
        platformName: 'macOS Sonoma',
        browserName: 'Safari',
        browserVersion: 'latest',
      },
      {
        platformName: 'Windows 11',
        browserName: 'Edge',
        browserVersion: 'latest',
      },
      { deviceName: 'iPhone 15', platformVersion: '17', browserName: 'Safari' },
      {
        deviceName: 'Samsung Galaxy S23',
        platformVersion: '13',
        browserName: 'Chrome',
      },
    ];
  },

  // 生成截图测试命令
  generateScreenshotCommand: function (quickTest = false) {
    const combinations = quickTest
      ? this.getQuickTestCombinations()
      : this.getAllBrowserCombinations();

    return {
      command: 'lambdatest-screenshot',
      options: {
        username: this.username,
        accessKey: this.accessKey,
        urls: this.screenshotConfig.urls,
        configurations: combinations,
        waitTime: this.screenshotConfig.waitTime,
        compareWithBaseline: this.screenshotConfig.compareWithBaseline,
        diffThreshold: this.screenshotConfig.diffThreshold,
        tunnel: this.advanced.tunnel,
      },
    };
  },
};

// 使用说明：
// 1. 在命令行中设置环境变量：
//    set LAMBDATEST_USERNAME=your_username
//    set LAMBDATEST_ACCESS_KEY=your_access_key
// 2. 引入此配置文件：
//    const lambdatestConfig = require('./lambdatest.config');
// 3. 运行快速测试：
//    const quickTestCommand = lambdatestConfig.generateScreenshotCommand(true);
// 4. 运行完整测试：
//    const fullTestCommand = lambdatestConfig.generateScreenshotCommand(false);
