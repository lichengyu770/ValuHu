#!/usr/bin/env node

/**
 * 环境切换脚本
 * 用于在开发、测试、生产环境配置之间快速切换
 * 使用方法：
 * - 切换到开发环境: node scripts/switch-env.js dev
 * - 切换到测试环境: node scripts/switch-env.js test
 * - 切换到生产环境: node scripts/switch-env.js prod
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取项目根目录
const ROOT_DIR = path.resolve(__dirname, '..');

// 环境配置映射
const ENV_CONFIG = {
  dev: {
    envName: 'development',
    envFile: '.env.development',
    description: '开发环境',
  },
  test: {
    envName: 'test',
    envFile: '.env.test',
    description: '测试环境',
  },
  prod: {
    envName: 'production',
    envFile: '.env.production',
    description: '生产环境',
  },
};

// 颜色定义
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

/**
 * 打印带颜色的日志
 * @param {string} message 日志消息
 * @param {string} color 颜色
 */
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

/**
 * 检查文件是否存在
 * @param {string} filePath 文件路径
 * @returns {boolean} 是否存在
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    log(`检查文件 ${filePath} 时出错: ${err.message}`, COLORS.red);
    return false;
  }
}

/**
 * 复制文件
 * @param {string} source 源文件路径
 * @param {string} destination 目标文件路径
 * @returns {boolean} 是否成功
 */
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (err) {
    log(`复制文件失败: ${err.message}`, COLORS.red);
    return false;
  }
}

/**
 * 备份当前 .env 文件
 * @returns {string|null} 备份文件路径，失败返回 null
 */
function backupCurrentEnv() {
  const envPath = path.join(ROOT_DIR, '.env');

  if (!fileExists(envPath)) {
    log('当前没有 .env 文件，跳过备份', COLORS.yellow);
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(ROOT_DIR, `.env.backup.${timestamp}`);

  if (copyFile(envPath, backupPath)) {
    log(`已备份当前 .env 文件到 ${backupPath}`, COLORS.green);
    return backupPath;
  }

  return null;
}

/**
 * 切换环境
 * @param {string} targetEnv 目标环境
 */
function switchEnvironment(targetEnv) {
  if (!ENV_CONFIG[targetEnv]) {
    log(`不支持的环境: ${targetEnv}`, COLORS.red);
    log('可用的环境: dev, test, prod', COLORS.yellow);
    process.exit(1);
  }

  const config = ENV_CONFIG[targetEnv];
  const sourceEnvPath = path.join(ROOT_DIR, config.envFile);
  const targetEnvPath = path.join(ROOT_DIR, '.env');

  log(`开始切换到 ${config.description}...`, COLORS.blue);

  // 检查源文件是否存在
  if (!fileExists(sourceEnvPath)) {
    log(`错误: 配置文件 ${sourceEnvPath} 不存在`, COLORS.red);

    // 如果不存在示例文件，提供创建提示
    const examplePath = path.join(ROOT_DIR, '.env.example');
    if (fileExists(examplePath)) {
      log(
        `您可以基于 ${examplePath} 创建 ${config.envFile} 文件`,
        COLORS.yellow
      );

      const createFromExample = confirm(
        `是否从 ${examplePath} 创建 ${config.envFile}？`
      );

      if (createFromExample) {
        if (copyFile(examplePath, sourceEnvPath)) {
          log(`已创建 ${config.envFile}，请根据需要修改配置`, COLORS.green);
        } else {
          log('创建配置文件失败', COLORS.red);
          process.exit(1);
        }
      } else {
        process.exit(1);
      }
    } else {
      log('错误: .env.example 文件也不存在', COLORS.red);
      process.exit(1);
    }
  }

  // 备份当前 .env 文件
  backupCurrentEnv();

  // 复制目标环境配置到 .env
  if (copyFile(sourceEnvPath, targetEnvPath)) {
    log(`成功切换到 ${config.description}`, COLORS.bright + COLORS.green);

    // 设置 NODE_ENV 环境变量（可选）
    try {
      // 根据操作系统执行不同的命令设置环境变量
      if (process.platform === 'win32') {
        log(
          '在 Windows 系统中，NODE_ENV 需要手动设置或在启动命令中指定',
          COLORS.yellow
        );
      } else {
        log(
          `建议使用: export NODE_ENV=${config.envName} 来设置环境变量`,
          COLORS.blue
        );
      }
    } catch (err) {
      log(`设置环境变量提示失败: ${err.message}`, COLORS.yellow);
    }

    // 提示用户重启服务
    log('请重启应用服务以应用新的环境配置', COLORS.yellow);
  } else {
    log('切换环境失败', COLORS.red);
    process.exit(1);
  }
}

/**
 * 列出当前环境配置文件
 */
function listEnvFiles() {
  log('可用的环境配置文件:', COLORS.blue);

  Object.entries(ENV_CONFIG).forEach(([key, config]) => {
    const envPath = path.join(ROOT_DIR, config.envFile);
    const exists = fileExists(envPath) ? '✓' : '✗';
    const statusColor = fileExists(envPath) ? COLORS.green : COLORS.red;
    log(
      `- ${key}: ${config.envFile} ${statusColor}${exists}${COLORS.reset}`,
      COLORS.blue
    );
  });

  // 检查当前使用的 .env 文件
  const currentEnvPath = path.join(ROOT_DIR, '.env');
  if (fileExists(currentEnvPath)) {
    log('\n当前使用的 .env 文件:', COLORS.yellow);
    try {
      const stats = fs.statSync(currentEnvPath);
      const modifiedTime = stats.mtime.toLocaleString();
      log(`- 最后修改时间: ${modifiedTime}`, COLORS.yellow);
    } catch (err) {
      log('- 无法读取文件信息', COLORS.yellow);
    }
  } else {
    log('\n当前没有使用 .env 文件', COLORS.red);
  }
}

/**
 * 显示使用帮助
 */
function showHelp() {
  log('环境切换脚本使用帮助:', COLORS.bright + COLORS.blue);
  log('  node scripts/switch-env.js [命令]', COLORS.blue);
  log('\n命令:', COLORS.blue);
  log('  dev         切换到开发环境', COLORS.blue);
  log('  test        切换到测试环境', COLORS.blue);
  log('  prod        切换到生产环境', COLORS.blue);
  log('  list        列出所有环境配置文件', COLORS.blue);
  log('  help        显示此帮助信息', COLORS.blue);
  log('\n示例:', COLORS.blue);
  log('  node scripts/switch-env.js dev   # 切换到开发环境', COLORS.blue);
  log('  node scripts/switch-env.js list  # 查看可用的环境配置', COLORS.blue);
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (
    !command ||
    command === 'help' ||
    command === '--help' ||
    command === '-h'
  ) {
    showHelp();
    return;
  }

  if (command === 'list') {
    listEnvFiles();
    return;
  }

  if (ENV_CONFIG[command]) {
    switchEnvironment(command);
    return;
  }

  log(`未知命令: ${command}`, COLORS.red);
  showHelp();
  process.exit(1);
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  switchEnvironment,
  listEnvFiles,
};
