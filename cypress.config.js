/**
 * 跨浏览器测试配置文件
 * 集成BrowserStack和LambdaTest支持
 */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  // 基础测试配置
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // 环境变量配置
      const environment = config.env.environment || 'development';

      // 根据环境选择不同的配置
      if (environment === 'browserstack') {
        return configureBrowserStack(on, config);
      } else if (environment === 'lambdatest') {
        return configureLambdaTest(on, config);
      }

      return config;
    },
    // 测试文件位置
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // 支持的浏览器
    browsers: ['chrome', 'firefox', 'edge'],
  },
  // 组件测试配置
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});

/**
 * 配置BrowserStack集成
 */
function configureBrowserStack(on, config) {
  const browserstackConfig = {
    username: process.env.BROWSERSTACK_USERNAME,
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    capabilities: {
      'bstack:options': {
        projectName: '我的应用',
        buildName: '构建-' + new Date().toISOString(),
        sessionName: '端到端测试',
        debug: true,
        networkLogs: true,
      },
    },
    // BrowserStack支持的浏览器配置
    browsers: [
      // Chrome
      { browserName: 'Chrome', browserVersion: 'latest' },
      { browserName: 'Chrome', browserVersion: 'latest-1' },
      // Firefox
      { browserName: 'Firefox', browserVersion: 'latest' },
      { browserName: 'Firefox', browserVersion: 'latest-1' },
      // Safari
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
      // Edge
      { browserName: 'Edge', browserVersion: 'latest' },
      // iOS
      { deviceName: 'iPhone 15 Pro', osVersion: '17', browserName: 'Safari' },
      { deviceName: 'iPhone 14', osVersion: '16', browserName: 'Safari' },
      // Android
      {
        deviceName: 'Samsung Galaxy S23',
        osVersion: '13.0',
        browserName: 'Chrome',
      },
      {
        deviceName: 'Google Pixel 7',
        osVersion: '13.0',
        browserName: 'Chrome',
      },
    ],
  };

  console.log('配置BrowserStack测试环境');
  return { ...config, ...browserstackConfig };
}

/**
 * 配置LambdaTest集成
 */
function configureLambdaTest(on, config) {
  const lambdatestConfig = {
    username: process.env.LAMBDATEST_USERNAME,
    accessKey: process.env.LAMBDATEST_ACCESS_KEY,
    capabilities: {
      'LT:Options': {
        build: '我的应用构建-' + new Date().toISOString(),
        name: '端到端测试',
        platformName: 'Windows 10',
        tunnel: true,
      },
    },
    // LambdaTest支持的浏览器配置
    browsers: [
      // Windows平台
      {
        browserName: 'Chrome',
        browserVersion: 'latest',
        platformName: 'Windows 11',
      },
      {
        browserName: 'Chrome',
        browserVersion: 'latest-1',
        platformName: 'Windows 10',
      },
      {
        browserName: 'Firefox',
        browserVersion: 'latest',
        platformName: 'Windows 10',
      },
      {
        browserName: 'Edge',
        browserVersion: 'latest',
        platformName: 'Windows 11',
      },
      // macOS平台
      {
        browserName: 'Safari',
        browserVersion: 'latest',
        platformName: 'macOS Sonoma',
      },
      {
        browserName: 'Chrome',
        browserVersion: 'latest',
        platformName: 'macOS Ventura',
      },
      // iOS设备
      { deviceName: 'iPhone 15', platformVersion: '17', browserName: 'Safari' },
      { deviceName: 'iPhone 14', platformVersion: '16', browserName: 'Safari' },
      // Android设备
      {
        deviceName: 'Samsung Galaxy S23',
        platformVersion: '13',
        browserName: 'Chrome',
      },
      {
        deviceName: 'Google Pixel 7',
        platformVersion: '13',
        browserName: 'Chrome',
      },
    ],
  };

  console.log('配置LambdaTest测试环境');
  return { ...config, ...lambdatestConfig };
}
