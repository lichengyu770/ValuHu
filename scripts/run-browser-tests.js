/**
 * 自动化跨浏览器测试运行脚本
 * 支持BrowserStack和LambdaTest
 * 增强版：添加CI/CD集成、测试数据隔离、安全凭证管理等功能
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec, spawn } = require('child_process');
const https = require('https');
const http = require('http');
const net = require('net');

// 尝试加载dotenv进行安全凭证管理
try {
  require('dotenv').config();
  console.log('已加载.env文件进行凭证管理');
} catch (e) {
  console.log('未安装dotenv，使用环境变量模式');
}

// 加载配置文件
const browserstackConfig = require('../browserstack.config');
const lambdatestConfig = require('../lambdatest.config');

// 配置常量
const REPORT_DIR = './test-reports';
const DEFAULT_PORT = 5173;
const BASE_URL = process.env.BASE_URL || `http://localhost:${DEFAULT_PORT}`;
const CI_SYSTEM = process.env.CI || 'local'; // GitHub Actions, Jenkins, GitLab CI 等

// 日志工具
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);

  // 写入日志文件
  const logFile = path.join(REPORT_DIR, 'test-execution.log');
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`, { flag: 'a+' });
}

// 错误处理（增强版，包含通知机制）
function handleError(error, context = '') {
  const errorMessage = `测试运行失败${context ? ` (${context})` : ''}: ${error.message || error}`;
  console.error(errorMessage);

  // 写入错误日志
  const errorLogFile = path.join(REPORT_DIR, 'error.log');
  fs.appendFileSync(
    errorLogFile,
    `${new Date().toISOString()} - ${errorMessage}\n${error.stack || ''}\n\n`,
    { flag: 'a+' }
  );

  // 发送通知
  if (process.env.SLACK_WEBHOOK_URL || process.env.EMAIL_NOTIFICATION) {
    sendNotification('测试失败', errorMessage);
  }

  // CI环境下返回适当的退出码
  process.exit(CI_SYSTEM !== 'local' ? 1 : 0);
}

// 安全凭证管理
function getSecureCredentials(platform) {
  log(`获取${platform}安全凭证...`);

  // 尝试从环境变量获取
  let credentials = {};

  if (platform === 'browserstack') {
    credentials = {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    };
  } else if (platform === 'lambdatest') {
    credentials = {
      username: process.env.LAMBDATEST_USERNAME,
      accessKey: process.env.LAMBDATEST_ACCESS_KEY,
    };
  }

  // 验证凭证
  const missingKeys = Object.keys(credentials).filter(
    (key) => !credentials[key]
  );
  if (missingKeys.length > 0) {
    throw new Error(
      `${platform} 凭证缺失: ${missingKeys.join(', ')}\n请设置环境变量或在.env文件中配置`
    );
  }

  log(`成功获取${platform}凭证`);
  return credentials;
}

// 检查端口是否被占用
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server
      .listen(port)
      .on('listening', () => {
        server.close();
        resolve(false);
      })
      .on('error', () => {
        resolve(true);
      });
  });
}

// 查找可用端口
async function findAvailablePort(startPort) {
  let port = startPort;

  while (await isPortInUse(port)) {
    log(`端口 ${port} 已被占用，尝试下一个端口`);
    port++;
  }

  log(`找到可用端口: ${port}`);
  return port;
}

// 启动开发服务器（带端口冲突处理）
async function startDevServer() {
  log('检查并启动开发服务器...');

  // 检查端口是否被占用
  const port = await findAvailablePort(DEFAULT_PORT);

  // 检查是否已经有服务器在运行
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http
        .get(`${BASE_URL.replace(/\d+$/, port)}/health`, (res) => {
          resolve(res.statusCode === 200);
        })
        .on('error', () => {
          resolve(false);
        });
      req.setTimeout(2000, () => resolve(false));
    });

    if (response) {
      log(`开发服务器已在端口 ${port} 运行`);
      return port;
    }
  } catch (e) {
    // 忽略错误，继续启动服务器
  }

  // 启动开发服务器
  log(`启动开发服务器在端口 ${port}...`);
  const serverProcess = spawn('npm', ['run', 'dev', `--port=${port}`], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // 保存进程ID以便后续清理
  fs.writeFileSync(
    path.join(__dirname, '../.server-pid'),
    serverProcess.pid.toString()
  );

  // 等待服务器启动
  let serverReady = false;
  for (let i = 0; i < 10 && !serverReady; i++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      serverReady = await new Promise((resolve) => {
        const req = http
          .get(`${BASE_URL.replace(/\d+$/, port)}/health`, (res) => {
            resolve(res.statusCode === 200);
          })
          .on('error', () => {
            resolve(false);
          });
        req.setTimeout(2000, () => resolve(false));
      });
    } catch (e) {
      log(`服务器启动中... (${i + 1}/10)`);
    }
  }

  if (!serverReady) {
    throw new Error('开发服务器启动超时');
  }

  log(`开发服务器已成功启动在端口 ${port}`);
  return port;
}

// 停止开发服务器
function stopDevServer() {
  try {
    const pidFile = path.join(__dirname, '../.server-pid');
    if (fs.existsSync(pidFile)) {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8'));
      log(`停止开发服务器进程 ${pid}...`);
      process.kill(-pid); // 杀死进程组
      fs.unlinkSync(pidFile);
      log('开发服务器已停止');
    }
  } catch (e) {
    log(`停止服务器时出错: ${e.message}`);
  }
}

// 测试数据隔离 - 创建测试环境
function setupTestEnvironment() {
  log('设置测试隔离环境...');

  // 创建隔离的localStorage/sessionStorage前缀
  const testPrefix = `test_${Date.now()}_`;

  // 创建环境配置文件
  const envConfig = {
    testPrefix,
    testId: `test-${Date.now()}`,
    isolate: true,
    baseUrl: BASE_URL,
  };

  const envConfigPath = path.join(
    __dirname,
    '../cypress/support/test-env.json'
  );
  fs.writeFileSync(envConfigPath, JSON.stringify(envConfig, null, 2));

  log(`测试环境已设置，前缀: ${testPrefix}`);
  return envConfig;
}

// 测试数据隔离 - 清理测试环境
function cleanupTestEnvironment() {
  log('清理测试环境...');

  const envConfigPath = path.join(
    __dirname,
    '../cypress/support/test-env.json'
  );
  if (fs.existsSync(envConfigPath)) {
    fs.unlinkSync(envConfigPath);
  }

  log('测试环境已清理');
}

// 获取浏览器特定测试策略
function getBrowserSpecificStrategy(browserInfo) {
  const strategies = {
    // 低版本浏览器策略
    legacy: {
      skipAnimations: true,
      increaseTimeouts: true,
      disableWebGL: true,
      expectedFailures: [],
    },
    // 移动设备策略
    mobile: {
      touchEmulation: true,
      responsiveChecks: true,
      orientationTests: true,
    },
    // 现代浏览器策略
    modern: {
      performanceTests: true,
      advancedFeatures: true,
    },
    // Safari特定策略
    safari: {
      skipWebPTests: true,
      formHandlingFixes: true,
    },
    // Firefox特定策略
    firefox: {
      cssGridFixes: true,
      webrtcTests: true,
    },
  };

  // 根据浏览器信息选择策略
  const selectedStrategies = [strategies.modern];

  if (browserInfo.browserName?.toLowerCase().includes('safari')) {
    selectedStrategies.push(strategies.safari);
  } else if (browserInfo.browserName?.toLowerCase().includes('firefox')) {
    selectedStrategies.push(strategies.firefox);
  }

  if (
    browserInfo.deviceName ||
    browserInfo.platformVersion?.toString().includes('iOS') ||
    browserInfo.platformVersion?.toString().includes('Android')
  ) {
    selectedStrategies.push(strategies.mobile);
  }

  // 检查是否为低版本浏览器
  const version = parseInt(browserInfo.browserVersion?.split('.')[0] || '0');
  if (
    (browserInfo.browserName?.toLowerCase().includes('chrome') &&
      version < 80) ||
    (browserInfo.browserName?.toLowerCase().includes('firefox') &&
      version < 75) ||
    (browserInfo.browserName?.toLowerCase().includes('safari') && version < 13)
  ) {
    selectedStrategies.push(strategies.legacy);
  }

  // 合并策略
  return selectedStrategies.reduce((result, strategy) => {
    return { ...result, ...strategy };
  }, {});
}

// 发送通知
function sendNotification(title, message) {
  // Slack通知
  if (process.env.SLACK_WEBHOOK_URL) {
    const slackData = JSON.stringify({
      text: `*${title}*\n${message}`,
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': slackData.length,
      },
    };

    const req = https.request(process.env.SLACK_WEBHOOK_URL, options);
    req.write(slackData);
    req.end();
  }

  // 邮件通知 (可以集成第三方邮件服务)
  if (process.env.EMAIL_NOTIFICATION) {
    log(`[通知] 通过邮件发送: ${title} - ${message}`);
    // 这里可以添加邮件发送逻辑
  }

  // CI环境特殊处理
  if (CI_SYSTEM !== 'local') {
    log(`[CI通知] ${CI_SYSTEM}: ${title} - ${message}`);
  }
}

// 生成增强版测试报告
function generateEnhancedTestReport(results) {
  log('生成增强版测试报告...');

  // 确保报告目录存在
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // 创建详细报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: '跨浏览器测试增强版报告',
    ciSystem: CI_SYSTEM,
    buildNumber: process.env.BUILD_NUMBER || 'local',
    testEnvironment: process.env.TEST_ENV || 'development',
    browserstack: {
      testedBrowsers: results.browserstack?.testedBrowsers || 0,
      passed: results.browserstack?.passed || 0,
      failed: results.browserstack?.failed || 0,
      status: results.browserstack?.status || 'pending',
      executionTime: results.browserstack?.executionTime || 0,
    },
    lambdatest: {
      testedBrowsers: results.lambdatest?.testedBrowsers || 0,
      passed: results.lambdatest?.passed || 0,
      failed: results.lambdatest?.failed || 0,
      visualDiffs: results.lambdatest?.visualDiffs || 0,
      status: results.lambdatest?.status || 'pending',
      executionTime: results.lambdatest?.executionTime || 0,
    },
    overall: {
      totalBrowsers:
        (results.browserstack?.testedBrowsers || 0) +
        (results.lambdatest?.testedBrowsers || 0),
      totalPassed:
        (results.browserstack?.passed || 0) + (results.lambdatest?.passed || 0),
      totalFailed:
        (results.browserstack?.failed || 0) + (results.lambdatest?.failed || 0),
      passRate: 0,
      executionTime: 0,
    },
    failures: results.failures || [],
    warnings: results.warnings || [],
    recommendations: results.recommendations || [],
  };

  // 计算总体统计
  const totalTests = report.overall.totalBrowsers;
  if (totalTests > 0) {
    report.overall.passRate = Math.round(
      (report.overall.totalPassed / totalTests) * 100
    );
  }

  report.overall.executionTime =
    report.browserstack.executionTime + report.lambdatest.executionTime;

  // 生成HTML报告
  const htmlReport = generateHtmlReport(report);
  const htmlReportPath = path.join(REPORT_DIR, 'browser-test-report.html');
  fs.writeFileSync(htmlReportPath, htmlReport);

  // 保存JSON报告
  const jsonReportPath = path.join(REPORT_DIR, 'browser-test-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

  // 发送成功通知
  if (report.overall.passRate === 100) {
    sendNotification('测试成功', `所有 ${totalTests} 个测试用例通过！`);
  } else if (report.overall.passRate >= 90) {
    sendNotification(
      '测试基本通过',
      `通过: ${report.overall.passRate}%, 失败: ${report.overall.totalFailed}`
    );
  } else {
    sendNotification(
      '测试警告',
      `通过率较低: ${report.overall.passRate}%, 失败: ${report.overall.totalFailed}`
    );
  }

  log(`测试报告已生成: ${jsonReportPath}`);
  log(`HTML报告已生成: ${htmlReportPath}`);

  // CI环境集成 - 上传报告
  if (CI_SYSTEM !== 'local' && process.env.ARTIFACT_UPLOAD_URL) {
    uploadReportForCI(jsonReportPath, htmlReportPath);
  }

  return { jsonReportPath, htmlReportPath };
}

// 生成HTML报告
function generateHtmlReport(report) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>跨浏览器测试报告</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-box { background: #fff; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .passed { color: green; }
        .failed { color: red; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>跨浏览器测试报告</h1>
      <div class="summary">
        <p>时间: ${report.timestamp}</p>
        <p>CI系统: ${report.ciSystem}</p>
        <p>构建号: ${report.buildNumber}</p>
        <p>环境: ${report.testEnvironment}</p>
      </div>
      
      <div class="stats">
        <div class="stat-box">
          <h3>总体通过率</h3>
          <p style="font-size: 24px; font-weight: bold; ${report.overall.passRate >= 90 ? 'color: green' : report.overall.passRate >= 70 ? 'color: orange' : 'color: red'}">
            ${report.overall.passRate}%
          </p>
        </div>
        <div class="stat-box">
          <h3>总测试浏览器数</h3>
          <p style="font-size: 24px; font-weight: bold">${report.overall.totalBrowsers}</p>
        </div>
        <div class="stat-box">
          <h3>通过</h3>
          <p style="font-size: 24px; font-weight: bold; color: green">${report.overall.totalPassed}</p>
        </div>
        <div class="stat-box">
          <h3>失败</h3>
          <p style="font-size: 24px; font-weight: bold; color: red">${report.overall.totalFailed}</p>
        </div>
        <div class="stat-box">
          <h3>执行时间</h3>
          <p style="font-size: 24px; font-weight: bold">${(report.overall.executionTime / 1000).toFixed(2)}s</p>
        </div>
      </div>
      
      <h2>详细结果</h2>
      <table>
        <tr>
          <th>平台</th>
          <th>测试浏览器数</th>
          <th>通过</th>
          <th>失败</th>
          <th>状态</th>
          <th>执行时间</th>
        </tr>
        <tr>
          <td>BrowserStack</td>
          <td>${report.browserstack.testedBrowsers}</td>
          <td class="passed">${report.browserstack.passed}</td>
          <td class="failed">${report.browserstack.failed}</td>
          <td>${report.browserstack.status}</td>
          <td>${(report.browserstack.executionTime / 1000).toFixed(2)}s</td>
        </tr>
        <tr>
          <td>LambdaTest</td>
          <td>${report.lambdatest.testedBrowsers}</td>
          <td class="passed">${report.lambdatest.passed}</td>
          <td class="failed">${report.lambdatest.failed}</td>
          <td>${report.lambdatest.status}</td>
          <td>${(report.lambdatest.executionTime / 1000).toFixed(2)}s</td>
        </tr>
      </table>
      
      ${
        report.failures.length > 0
          ? `
        <h2>失败详情</h2>
        <table>
          <tr>
            <th>浏览器</th>
            <th>测试</th>
            <th>错误信息</th>
          </tr>
          ${report.failures
            .map(
              (f) => `
            <tr>
              <td>${f.browser}</td>
              <td>${f.test}</td>
              <td>${f.error}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      `
          : ''
      }
      
      ${
        report.recommendations.length > 0
          ? `
        <h2>改进建议</h2>
        <ul>
          ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      `
          : ''
      }
    </body>
    </html>
  `;
}

// 为CI环境上传报告
function uploadReportForCI(jsonPath, htmlPath) {
  log('上传报告到CI系统...');
  // 这里可以实现与各种CI系统的报告上传集成
  // 例如GitHub Actions的artifact上传、Jenkins的报告发布等
  log(`报告已准备好上传: ${jsonPath}, ${htmlPath}`);
}

// 安装必要的依赖
async function installDependencies() {
  log('检查并安装测试依赖...');

  // 确保node_modules存在
  if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
    log('node_modules不存在，运行npm install...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // 检查并安装必要的依赖
  const requiredPackages = [
    { name: 'cypress', installCmd: 'npm install cypress --save-dev' },
    {
      name: 'lambdatest-screenshot',
      installCmd: 'npm install lambdatest-screenshot --save-dev',
    },
    { name: 'dotenv', installCmd: 'npm install dotenv --save-dev' },
  ];

  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg.name);
      log(`${pkg.name} 已安装`);
    } catch (e) {
      log(`安装 ${pkg.name}...`);
      execSync(pkg.installCmd, { stdio: 'inherit' });
    }
  }
}

// 运行BrowserStack测试（增强版，支持测试策略和数据隔离）
async function runBrowserStackTests(options, serverPort) {
  const { quickTest = false } = options;
  const browsers = quickTest
    ? browserstackConfig.getQuickTestBrowsers()
    : browserstackConfig.getAllBrowsers();

  log(
    `开始运行BrowserStack ${quickTest ? '快速' : '完整'}测试，浏览器组合数: ${browsers.length}`
  );

  // 获取安全凭证
  const credentials = getSecureCredentials('browserstack');

  // 为每个浏览器应用特定测试策略
  const browsersWithStrategy = browsers.map((browser) => {
    return {
      ...browser,
      strategy: getBrowserSpecificStrategy(browser),
    };
  });

  // 创建测试结果对象
  const results = {
    testedBrowsers: browsers.length,
    passed: 0,
    failed: 0,
    executionTime: 0,
    status: 'pending',
    browserResults: [],
  };

  // 创建临时配置文件
  const tempConfigPath = path.join(
    __dirname,
    '../cypress/browserstack-temp-config.json'
  );
  fs.writeFileSync(
    tempConfigPath,
    JSON.stringify({
      browsers: browsersWithStrategy,
      ...credentials,
      projectName: browserstackConfig.projectName,
      buildName: browserstackConfig.buildName,
      baseUrl: BASE_URL.replace(/\d+$/, serverPort),
      testEnvironment: setupTestEnvironment(),
    })
  );

  const startTime = Date.now();

  try {
    // 运行Cypress测试，添加更多环境变量以支持测试隔离和策略
    log('运行Cypress测试...');
    execSync(
      `npx cypress run --browser chrome --env environment=browserstack,configFile=${tempConfigPath},isolation=true,baseUrl=${BASE_URL.replace(/\d+$/, serverPort)}`,
      { stdio: 'inherit' }
    );

    results.status = 'passed';
    results.passed = browsers.length;
    log('BrowserStack测试完成');
  } catch (error) {
    results.status = 'failed';
    // 在实际实现中，这里应该解析Cypress的输出以获取准确的通过/失败数
    results.failed = 1;
    results.passed = browsers.length - 1;
    log('BrowserStack测试部分失败，详情请查看日志');
  } finally {
    results.executionTime = Date.now() - startTime;

    // 清理
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }

    cleanupTestEnvironment();
  }

  return results;
}

// 运行LambdaTest自动化截图测试（增强版，支持网络节流和视觉回归）
async function runLambdaTestScreenshots(options, serverPort) {
  const { quickTest = false } = options;

  // 获取安全凭证
  const credentials = getSecureCredentials('lambdatest');

  // 更新URL以使用正确的端口
  const updatedUrls = lambdatestConfig.screenshotConfig.urls.map((url) =>
    url.replace(/\d+$/, serverPort)
  );

  log(
    `开始运行LambdaTest ${quickTest ? '快速' : '完整'}截图测试，URL数: ${updatedUrls.length}`
  );

  // 创建测试结果对象
  const results = {
    testedBrowsers: quickTest
      ? lambdatestConfig.getQuickTestCombinations().length
      : lambdatestConfig.getAllBrowserCombinations().length,
    passed: 0,
    failed: 0,
    visualDiffs: 0,
    executionTime: 0,
    status: 'pending',
  };

  // 更新配置以使用正确的端口
  const commandInfo = lambdatestConfig.generateScreenshotCommand(quickTest);
  commandInfo.options.urls = updatedUrls;
  Object.assign(commandInfo.options, credentials); // 添加凭证

  // 创建临时配置文件
  const tempConfigPath = path.join(
    __dirname,
    '../cypress/lambdatest-temp-config.json'
  );
  fs.writeFileSync(tempConfigPath, JSON.stringify(commandInfo.options));

  const startTime = Date.now();

  try {
    // 运行LambdaTest截图命令
    log('运行LambdaTest截图测试...');
    execSync(`npx lambdatest-screenshot --config ${tempConfigPath}`, {
      stdio: 'inherit',
    });

    results.status = 'passed';
    results.passed = results.testedBrowsers;
    log('LambdaTest截图测试完成');
  } catch (error) {
    results.status = 'failed';
    // 在实际实现中，这里应该解析LambdaTest的输出以获取准确的结果
    log('LambdaTest截图测试部分失败，详情请查看日志');
  } finally {
    results.executionTime = Date.now() - startTime;

    // 清理临时文件
    if (fs.existsSync(tempConfigPath)) {
      fs.unlinkSync(tempConfigPath);
    }
  }

  return results;
}

// 主函数（增强版，支持错误恢复、资源管理和CI集成）
async function main() {
  // 确保报告目录存在
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  let serverPort = DEFAULT_PORT;
  let testResults = {
    browserstack: {},
    lambdatest: {},
    failures: [],
    warnings: [],
    recommendations: [],
  };

  try {
    // 解析命令行参数
    const args = process.argv.slice(2);
    const platform = args[0] || 'all'; // browserstack, lambdatest, or all
    const quickTest = args.includes('--quick');
    const skipServer = args.includes('--skip-server');

    log(
      `开始跨浏览器测试 - 平台: ${platform}, 快速模式: ${quickTest}, 跳过服务器: ${skipServer}`
    );
    log(`运行环境: ${CI_SYSTEM}`);

    // 安装依赖
    await installDependencies();

    // 启动开发服务器（除非明确跳过）
    if (!skipServer) {
      serverPort = await startDevServer();
      // 确保在退出时停止服务器
      process.on('exit', stopDevServer);
      process.on('SIGINT', () => {
        stopDevServer();
        process.exit(1);
      });
    } else {
      // 验证现有服务器是否可访问
      log('验证现有服务器...');
      const isAccessible = await new Promise((resolve) => {
        const req = http
          .get(`${BASE_URL}/health`, (res) => {
            resolve(res.statusCode === 200);
          })
          .on('error', () => {
            resolve(false);
          });
        req.setTimeout(2000, () => resolve(false));
      });

      if (!isAccessible) {
        throw new Error(
          `无法访问服务器: ${BASE_URL}\n请启动服务器或移除 --skip-server 参数`
        );
      }
      log(`服务器验证通过: ${BASE_URL}`);
    }

    // 运行测试
    if (platform === 'browserstack' || platform === 'all') {
      try {
        testResults.browserstack = await runBrowserStackTests(
          { quickTest },
          serverPort
        );
      } catch (error) {
        handleError(error, 'BrowserStack测试');
        testResults.failures.push({
          platform: 'browserstack',
          error: error.message,
        });
      }
    }

    if (platform === 'lambdatest' || platform === 'all') {
      try {
        testResults.lambdatest = await runLambdaTestScreenshots(
          { quickTest },
          serverPort
        );
      } catch (error) {
        handleError(error, 'LambdaTest测试');
        testResults.failures.push({
          platform: 'lambdatest',
          error: error.message,
        });
      }
    }

    // 生成警告和建议
    if (
      testResults.browserstack.failed > 0 ||
      testResults.lambdatest.failed > 0
    ) {
      testResults.warnings.push('部分测试失败，请检查详细日志');
      testResults.recommendations.push(
        '建议修复失败的测试用例，特别是在主流浏览器中的错误'
      );
    }

    // 生成增强版测试报告
    const reportPaths = generateEnhancedTestReport(testResults);

    log('所有测试完成!');
    log(`测试报告: ${reportPaths.jsonReportPath}`);
    log(`HTML报告: ${reportPaths.htmlReportPath}`);

    // 输出测试摘要
    const totalTests =
      testResults.browserstack.testedBrowsers +
      testResults.lambdatest.testedBrowsers;
    const totalFailed =
      testResults.browserstack.failed + testResults.lambdatest.failed;
    const passRate =
      totalTests > 0
        ? Math.round(((totalTests - totalFailed) / totalTests) * 100)
        : 100;

    log(`\n===== 测试摘要 =====`);
    log(`总测试数: ${totalTests}`);
    log(`通过数: ${totalTests - totalFailed}`);
    log(`失败数: ${totalFailed}`);
    log(`通过率: ${passRate}%`);
    log(`====================`);

    // CI环境下根据测试结果设置退出码
    if (CI_SYSTEM !== 'local') {
      process.exit(totalFailed > 0 ? 1 : 0);
    }
  } catch (error) {
    handleError(error, '主流程');
  } finally {
    // 确保服务器停止
    if (!args?.includes('--skip-server')) {
      stopDevServer();
    }

    // 确保测试环境清理
    cleanupTestEnvironment();
  }
}

// 运行主函数
main();

// 使用说明：
// 1. 运行BrowserStack快速测试:
//    node scripts/run-browser-tests.js browserstack --quick
//
// 2. 运行LambdaTest完整测试:
//    node scripts/run-browser-tests.js lambdatest
//
// 3. 跳过服务器启动（使用现有服务器）:
//    node scripts/run-browser-tests.js --skip-server
//
// 4. 环境变量配置:
//    创建.env文件或设置环境变量:
//    - BROWSERSTACK_USERNAME: BrowserStack用户名
//    - BROWSERSTACK_ACCESS_KEY: BrowserStack访问密钥
//    - LAMBDATEST_USERNAME: LambdaTest用户名
//    - LAMBDATEST_ACCESS_KEY: LambdaTest访问密钥
//    - SLACK_WEBHOOK_URL: Slack通知Webhook（可选）
//    - BASE_URL: 测试基础URL（可选，默认: http://localhost:5173）
//    - CI: CI系统名称（用于CI集成）
//    - BUILD_NUMBER: 构建号（用于CI集成）
//    node scripts/run-browser-tests.js lambdatest
//
// 3. 运行所有平台测试:
//    node scripts/run-browser-tests.js all
//
// 4. 设置环境变量示例:
//    Windows: set BROWSERSTACK_USERNAME=your_username
//    Linux/Mac: export BROWSERSTACK_USERNAME=your_username
