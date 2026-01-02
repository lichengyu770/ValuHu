/** @type {import('jest').Config} */
const config = {
  // 告诉Jest测试环境
  testEnvironment: 'node',
  // 支持ES模块
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-react'],
      },
    ],
  },
  // 扩展配置
  extensionsToTreatAsEsm: ['.js', '.jsx'],
  // 模块名映射，用于处理import路径
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // 搜索测试文件的路径和模式
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/index.jsx',
    '!src/App.jsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  // 支持import.meta.url
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};

export default config;
