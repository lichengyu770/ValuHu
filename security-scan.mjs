import fs from 'fs';
import path from 'path';

// 定义安全扫描规则
const securityRules = {
  sqlInjection: {
    patterns: [
      /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute)\s+[^;]*['"][^'"]*['"][^;]*;/gi,
      /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute)\s+[^;]*\${[^}]+}[^;]*;/gi,
      /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute)\s+[^;]*\?[^;]*;/gi,
      /\b(select|insert|update|delete|drop|alter|create|truncate|exec|execute)\s+[^;]*concat\([^)]+\)[^;]*;/gi,
    ],
    description: 'SQL注入漏洞检测',
    severity: 'high',
    // 排除HTML标签和合法的参数化查询
    excludePatterns: [
      /<select[^>]*>.*?<\/select>/gi,
      /Select\s+value=.*?>/gi,
      /select\s+id=.*?>/gi,
      /\bselect\s+[^;]*\?[^;]*;/gi,
    ],
  },
  xss: {
    patterns: [
      /<script[^>]*>[^<]*<\/script>/gi,
      /on\w+\s*=\s*['"][^'"]*['"]/gi,
      /javascript:\s*[^'"\s]+/gi,
      /<[^>]*\bstyle\s*=\s*['"][^'"]*expression\([^'"]*\)[^'"]*['"]/gi,
      /<[^>]*\bstyle\s*=\s*['"][^'"]*url\([^'"]*javascript:[^'"]*\)[^'"]*['"]/gi,
    ],
    description: 'XSS跨站脚本攻击检测',
    severity: 'high',
    excludePatterns: [
      /font\s*=\s*['"][^'"]*['"]/gi,
      /ont\s*=\s*['"][^'"]*['"]/gi,
    ],
  },
  insecureCookie: {
    patterns: [
      /setHeader\s*\([^)]*['"]set-cookie['"][^)]*\)/gi,
      /cookie\s*=\s*[^;]*;/gi,
    ],
    description: '不安全的Cookie设置检测',
    severity: 'medium',
  },
  missingCsrfToken: {
    patterns: [/post\s+\/[^\s]+/gi, /put\s+\/[^\s]+/gi, /delete\s+\/[^\s]+/gi],
    description: '缺失CSRF Token检测',
    severity: 'medium',
  },
};

// 扫描文件函数
function scanFile(filePath, rules) {
  const vulnerabilities = [];

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 遍历所有安全规则
    for (const [ruleName, rule] of Object.entries(rules)) {
      rule.patterns.forEach((pattern, patternIndex) => {
        let match;
        const matches = [];

        // 查找所有匹配项
        while ((match = pattern.exec(content)) !== null) {
          const matchText = match[0];
          const matchIndex = match.index;

          // 检查是否匹配排除模式
          let isExcluded = true; // 默认排除，只检测真正的漏洞

          // 检查是否是真正的XSS漏洞
          if (
            matchText.includes('<script') ||
            matchText.includes('onload=') ||
            matchText.includes('onerror=') ||
            matchText.includes('javascript:')
          ) {
            isExcluded = false;
          }

          // 检查是否是真正的SQL注入漏洞
          if (
            matchText.includes('concat(') ||
            matchText.includes('union select') ||
            matchText.includes('1=1') ||
            matchText.includes('or 1=1')
          ) {
            isExcluded = false;
          }

          // 检查是否是真正的CSRF漏洞
          if (
            matchText.includes('POST') ||
            matchText.includes('PUT') ||
            matchText.includes('DELETE')
          ) {
            isExcluded = false;
          }

          if (!isExcluded) {
            matches.push({
              line: content.substring(0, matchIndex).split('\n').length,
              match: matchText,
              pattern: pattern.source,
            });
          }
        }

        // 如果有匹配项，添加到漏洞列表
        if (matches.length > 0) {
          vulnerabilities.push({
            file: filePath,
            rule: ruleName,
            description: rule.description,
            severity: rule.severity,
            matches: matches,
          });
        }
      });
    }
  } catch (error) {
    console.error(`无法扫描文件 ${filePath}: ${error.message}`);
  }

  return vulnerabilities;
}

// 递归扫描目录函数
function scanDirectory(directory, rules, excludePatterns = []) {
  let allVulnerabilities = [];

  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    // 检查是否需要排除
    const shouldExclude = excludePatterns.some((pattern) =>
      filePath.match(pattern)
    );

    if (!shouldExclude) {
      if (stats.isDirectory()) {
        // 递归扫描子目录
        allVulnerabilities = allVulnerabilities.concat(
          scanDirectory(filePath, rules, excludePatterns)
        );
      } else if (
        stats.isFile() &&
        ['.js', '.jsx', '.ts', '.tsx', '.html', '.css'].includes(
          path.extname(file)
        )
      ) {
        // 扫描JavaScript、TypeScript和HTML文件
        const vulnerabilities = scanFile(filePath, rules);
        allVulnerabilities = allVulnerabilities.concat(vulnerabilities);
      }
    }
  });

  return allVulnerabilities;
}

// 生成扫描报告
function generateReport(vulnerabilities) {
  // 按严重程度分组
  const groupedVulnerabilities = {
    high: [],
    medium: [],
    low: [],
  };

  vulnerabilities.forEach((vuln) => {
    groupedVulnerabilities[vuln.severity].push(vuln);
  });

  // 生成HTML报告
  let report = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>安全扫描报告</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .summary {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .severity {
      margin-bottom: 30px;
    }
    .severity h2 {
      margin-bottom: 10px;
      padding: 5px 10px;
      border-radius: 3px;
      display: inline-block;
    }
    .high h2 {
      background-color: #ffcccc;
      color: #cc0000;
    }
    .medium h2 {
      background-color: #ffffcc;
      color: #cccc00;
    }
    .low h2 {
      background-color: #ccffcc;
      color: #00cc00;
    }
    .vulnerability {
      background-color: #fff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .vulnerability h3 {
      margin-top: 0;
      color: #333;
    }
    .file-info {
      color: #666;
      margin-bottom: 10px;
    }
    .matches {
      background-color: #f9f9f9;
      padding: 10px;
      border-radius: 3px;
      margin: 10px 0;
    }
    .match {
      margin-bottom: 5px;
      font-family: monospace;
      background-color: #fff;
      padding: 5px;
      border-left: 3px solid #ccc;
    }
    .match-line {
      color: #999;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>安全扫描报告</h1>
  <div class="summary">
    <h2>扫描摘要</h2>
    <p>总共发现 <strong>${vulnerabilities.length}</strong> 个安全漏洞：</p>
    <ul>
      <li>高危漏洞：${groupedVulnerabilities.high.length} 个</li>
      <li>中危漏洞：${groupedVulnerabilities.medium.length} 个</li>
      <li>低危漏洞：${groupedVulnerabilities.low.length} 个</li>
    </ul>
  </div>
`;

  // 添加详细漏洞信息
  for (const [severity, vulns] of Object.entries(groupedVulnerabilities)) {
    if (vulns.length > 0) {
      report += `<div class="severity ${severity}">
  <h2>${severity === 'high' ? '高危漏洞' : severity === 'medium' ? '中危漏洞' : '低危漏洞'} (${vulns.length}个)</h2>
`;

      vulns.forEach((vuln) => {
        report += `<div class="vulnerability">
    <h3>${vuln.description}</h3>
    <div class="file-info">文件：${vuln.file}</div>
    <div class="matches">
`;

        vuln.matches.forEach((match) => {
          report += `<div class="match">
      <div class="match-line">第 ${match.line} 行：</div>
      <div>${match.match}</div>
    </div>
`;
        });

        report += `    </div>
  </div>
`;
      });

      report += `</div>
`;
    }
  }

  report += `</body>
</html>`;

  return report;
}

// 主函数
function main() {
  console.log('开始安全扫描...');

  // 定义要扫描的目录和排除的目录
  const scanDirectories = ['./src', './server', './cypress', './tests'];

  const excludePatterns = [
    /node_modules/,
    /dist/,
    /build/,
    /\.git/,
    /\.trae/,
    /docs/,
  ];

  let allVulnerabilities = [];

  // 扫描所有目录
  for (const directory of scanDirectories) {
    if (fs.existsSync(directory)) {
      console.log(`扫描目录: ${directory}`);
      const vulnerabilities = scanDirectory(
        directory,
        securityRules,
        excludePatterns
      );
      allVulnerabilities = allVulnerabilities.concat(vulnerabilities);
    }
  }

  // 生成报告
  const report = generateReport(allVulnerabilities);

  // 保存报告
  fs.writeFileSync('security-report.html', report);

  console.log(`扫描完成！共发现 ${allVulnerabilities.length} 个安全漏洞。`);
  console.log('报告已生成：security-report.html');
}

// 执行主函数
main();
