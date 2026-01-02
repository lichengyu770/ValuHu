import fs from 'fs/promises';
import path from 'path';

// 读取测试用例文件
const testCasesPath = path.join(process.cwd(), 'test-cases.md');
const testCasesContent = await fs.readFile(testCasesPath, 'utf8');

// 解析测试用例表格
function parseTestCaseTable(content) {
  const lines = content.split('\n');
  const testCases = [];
  let headers = [];
  let inTable = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('|')) {
      const cells = trimmedLine
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);

      if (!inTable) {
        inTable = true;
        headers = cells;
      } else if (cells.some((cell) => cell.includes('---'))) {
        // 跳过分隔线
        continue;
      } else {
        const testCase = {};
        for (let i = 0; i < headers.length; i++) {
          testCase[headers[i]] = cells[i] || '';
        }
        testCases.push(testCase);
      }
    } else if (inTable && trimmedLine !== '') {
      // 表格结束
      break;
    }
  }

  return testCases;
}

// 解析测试用例
function parseTestCases(content) {
  const testCases = {
    auth: [],
    valuation: [],
    query: [],
    favorite: [],
  };

  // 解析注册/登录流程测试用例
  const authSection =
    content
      .split('## 1. 注册/登录流程测试用例')[1]
      ?.split('## 2. 估价提交功能测试用例')[0] || '';
  if (authSection) {
    testCases.auth = parseTestCaseTable(
      '## 1. 注册/登录流程测试用例' + authSection
    );
  }

  // 解析估价提交功能测试用例
  const valuationSection =
    content
      .split('## 2. 估价提交功能测试用例')[1]
      ?.split('## 3. 数据查询操作测试用例')[0] || '';
  if (valuationSection) {
    testCases.valuation = parseTestCaseTable(
      '## 2. 估价提交功能测试用例' + valuationSection
    );
  }

  // 解析数据查询操作测试用例
  const querySection =
    content
      .split('## 3. 数据查询操作测试用例')[1]
      ?.split('## 4. 收藏功能测试用例')[0] || '';
  if (querySection) {
    testCases.query = parseTestCaseTable(
      '## 3. 数据查询操作测试用例' + querySection
    );
  }

  // 解析收藏功能测试用例
  const favoriteSection =
    content
      .split('## 4. 收藏功能测试用例')[1]
      ?.split('## 5. 测试用例管理')[0] || '';
  if (favoriteSection) {
    testCases.favorite = parseTestCaseTable(
      '## 4. 收藏功能测试用例' + favoriteSection
    );
  }

  return testCases;
}

// 生成Cypress测试脚本
function generateCypressTests(testCases) {
  const tests = [];

  // 生成注册/登录测试
  tests.push(generateAuthTests(testCases.auth));
  // 生成估价提交测试
  tests.push(generateValuationTests(testCases.valuation));
  // 生成数据查询测试
  tests.push(generateQueryTests(testCases.query));
  // 生成收藏功能测试
  tests.push(generateFavoriteTests(testCases.favorite));

  return tests.join('\n\n');
}

// 生成注册/登录测试
function generateAuthTests(testCases) {
  let testContent =
    '/// <reference types="cypress" />\n\ndescribe(\"注册/登录流程测试\", () => {\n  beforeEach(() => {\n    cy.visit(\"/\");\n  });\n';

  testCases.forEach((testCase) => {
    if (testCase['测试编号'] && testCase['测试名称']) {
      const testName = testCase['测试名称'];
      const testSteps = (testCase['测试步骤'] || '')
        .split('<br>')
        .map((step) => step.trim());
      const expectedResults = (testCase['预期结果'] || '')
        .split('<br>')
        .map((result) => result.trim());
      const testData = testCase['测试数据'] || '';

      testContent += '\n  it(\"' + testName + '\", () => {\n';

      // 处理测试步骤
      testSteps.forEach((step) => {
        if (step.includes('打开登录页面')) {
          testContent += '    cy.contains(\"登录\").click();\n';
        } else if (step.includes('输入正确用户名和密码')) {
          const username =
            testData.match(/用户名：(.*?)\n/)?.[1] || 'test@example.com';
          const password =
            testData.match(/密码：(.*?)\n|密码：(.*?)$/)?.[1] ||
            testData.match(/密码：(.*?)$/)?.[1] ||
            'Test123!';
          testContent +=
            '    cy.get(\"input[name=\\\"username\\\"]\").type(\"' +
            username +
            '\");\n';
          testContent +=
            '    cy.get(\"input[name=\\\"password\\\"]\").type(\"' +
            password +
            '\");\n';
        } else if (step.includes('点击登录按钮')) {
          testContent += '    cy.contains(\"登录\").click();\n';
        } else if (step.includes('点击注销按钮')) {
          testContent += '    cy.contains(\"注销\").click();\n';
        }
      });

      // 处理预期结果
      expectedResults.forEach((result) => {
        if (result.includes('登录成功')) {
          testContent += '    cy.url().should(\"include\", \"/index\");\n';
        } else if (result.includes('注销成功')) {
          testContent += '    cy.url().should(\"include\", \"/login\");\n';
        } else if (result.includes('登录失败')) {
          testContent +=
            '    cy.contains(\"用户名或密码错误\").should(\"be.visible\");\n';
        }
      });

      testContent += '  });\n';
    }
  });

  testContent += '});\n';

  return testContent;
}

// 生成估价提交测试
function generateValuationTests(testCases) {
  let testContent =
    '/// <reference types="cypress" />\n\ndescribe(\"估价提交功能测试\", () => {\n  beforeEach(() => {\n    cy.visit(\"/\");\n    // 登录\n    cy.contains(\"登录\").click();\n    cy.get(\"input[name=\\\"username\\\"]\").type(\"test@example.com\");\n    cy.get(\"input[name=\\\"password\\\"]\").type(\"Test123!\");\n    cy.contains(\"登录\").click();\n    cy.url().should(\"include\", \"/index\");\n  });\n';

  testCases.forEach((testCase) => {
    if (testCase['测试编号'] && testCase['测试名称']) {
      const testName = testCase['测试名称'];
      const testSteps = (testCase['测试步骤'] || '')
        .split('<br>')
        .map((step) => step.trim());
      const expectedResults = (testCase['预期结果'] || '')
        .split('<br>')
        .map((result) => result.trim());
      const testData = testCase['测试数据'] || '';

      testContent += '\n  it(\"' + testName + '\", () => {\n';

      // 处理测试步骤
      testSteps.forEach((step) => {
        if (step.includes('进入估价页面')) {
          testContent += '    cy.contains(\"估价\").click();\n';
        } else if (step.includes('填写完整房产参数')) {
          // 解析测试数据
          const area = testData.match(/面积：(.*?)\n/)?.[1] || '150.5';
          const layout = testData.match(/户型：(.*?)\n/)?.[1] || '3室2厅1卫';
          const floor = testData.match(/楼层：(.*?)\n/)?.[1] || '10';
          const totalFloors = testData.match(/总楼层：(.*?)\n/)?.[1] || '30';
          const buildYear = testData.match(/建筑年份：(.*?)\n/)?.[1] || '2015';
          const propertyType =
            testData.match(/房产类型：(.*?)\n/)?.[1] || '住宅';
          const orientation =
            testData.match(/朝向：(.*?)\n/)?.[1] || '南北通透';
          const decoration = testData.match(/装修情况：(.*?)\n/)?.[1] || '精装';
          const city = testData.match(/城市：(.*?)\n/)?.[1] || '长沙';
          const district =
            testData.match(/区域：(.*?)\n|区域：(.*?)$/)?.[1] ||
            testData.match(/区域：(.*?)$/)?.[1] ||
            '岳麓区';

          testContent +=
            '    cy.get(\"input[name=\\\"area\\\"]\").type(\"' +
            area +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"layout\\\"]\").select(\"' +
            layout +
            '\");\n';
          testContent +=
            '    cy.get(\"input[name=\\\"floor\\\"]\").type(\"' +
            floor +
            '\");\n';
          testContent +=
            '    cy.get(\"input[name=\\\"totalFloors\\\"]\").type(\"' +
            totalFloors +
            '\");\n';
          testContent +=
            '    cy.get(\"input[name=\\\"buildYear\\\"]\").type(\"' +
            buildYear +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"propertyType\\\"]\").select(\"' +
            propertyType +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"orientation\\\"]\").select(\"' +
            orientation +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"decoration\\\"]\").select(\"' +
            decoration +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"city\\\"]\").select(\"' +
            city +
            '\");\n';
          testContent +=
            '    cy.get(\"select[name=\\\"district\\\"]\").select(\"' +
            district +
            '\");\n';
        } else if (step.includes('提交估价请求')) {
          testContent += '    cy.contains(\"提交估价\").click();\n';
        }
      });

      // 处理预期结果
      expectedResults.forEach((result) => {
        if (result.includes('估价成功')) {
          testContent +=
            '    cy.contains(\"估价结果\").should(\"be.visible\");\n';
        } else if (result.includes('提交失败')) {
          testContent += '    cy.contains(\"错误\").should(\"be.visible\");\n';
        }
      });

      testContent += '  });\n';
    }
  });

  testContent += '});\n';

  return testContent;
}

// 生成数据查询测试
function generateQueryTests(testCases) {
  let testContent =
    '/// <reference types="cypress" />\n\ndescribe(\"数据查询操作测试\", () => {\n  beforeEach(() => {\n    cy.visit(\"/\");\n    // 登录\n    cy.contains(\"登录\").click();\n    cy.get(\"input[name=\\\"username\\\"]\").type(\"test@example.com\");\n    cy.get(\"input[name=\\\"password\\\"]\").type(\"Test123!\");\n    cy.contains(\"登录\").click();\n    cy.url().should(\"include\", \"/index\");\n  });\n';

  testCases.forEach((testCase) => {
    if (testCase['测试编号'] && testCase['测试名称']) {
      const testName = testCase['测试名称'];
      const testSteps = (testCase['测试步骤'] || '')
        .split('<br>')
        .map((step) => step.trim());
      const expectedResults = (testCase['预期结果'] || '')
        .split('<br>')
        .map((result) => result.trim());

      testContent += '\n  it(\"' + testName + '\", () => {\n';

      // 处理测试步骤
      testSteps.forEach((step) => {
        if (step.includes('进入物业管理页面')) {
          testContent += '    cy.contains(\"物业管理\").click();\n';
        } else if (step.includes('点击查询按钮')) {
          testContent += '    cy.contains(\"查询\").click();\n';
        } else if (step.includes('选择城市：长沙')) {
          testContent +=
            '    cy.get(\"select[name=\\\"city\\\"]\").select(\"长沙\");\n';
        } else if (step.includes('点击任意物业查看详情')) {
          testContent += '    cy.get(\".property-item\").first().click();\n';
        }
      });

      // 处理预期结果
      expectedResults.forEach((result) => {
        if (result.includes('查询成功')) {
          testContent +=
            '    cy.get(\".property-list\").should(\"be.visible\");\n';
        } else if (result.includes('显示完整物业信息')) {
          testContent +=
            '    cy.contains(\"物业详情\").should(\"be.visible\");\n';
        }
      });

      testContent += '  });\n';
    }
  });

  testContent += '});\n';

  return testContent;
}

// 生成收藏功能测试
function generateFavoriteTests(testCases) {
  let testContent =
    '/// <reference types="cypress" />\n\ndescribe(\"收藏功能测试\", () => {\n  beforeEach(() => {\n    cy.visit(\"/\");\n    // 登录\n    cy.contains(\"登录\").click();\n    cy.get(\"input[name=\\\"username\\\"]\").type(\"test@example.com\");\n    cy.get(\"input[name=\\\"password\\\"]\").type(\"Test123!\");\n    cy.contains(\"登录\").click();\n    cy.url().should(\"include\", \"/index\");\n  });\n';

  testCases.forEach((testCase) => {
    if (testCase['测试编号'] && testCase['测试名称']) {
      const testName = testCase['测试名称'];
      const testSteps = (testCase['测试步骤'] || '')
        .split('<br>')
        .map((step) => step.trim());
      const expectedResults = (testCase['预期结果'] || '')
        .split('<br>')
        .map((result) => result.trim());

      testContent += '\n  it(\"' + testName + '\", () => {\n';

      // 处理测试步骤
      testSteps.forEach((step) => {
        if (step.includes('进入估价页面')) {
          testContent += '    cy.contains(\"估价\").click();\n';
        } else if (step.includes('点击收藏按钮')) {
          testContent += '    cy.get(\".favorite-btn\").first().click();\n';
        } else if (step.includes('进入已收藏页面')) {
          testContent += '    cy.contains(\"我的收藏\").click();\n';
        } else if (step.includes('点击取消收藏按钮')) {
          testContent += '    cy.get(\".unfavorite-btn\").first().click();\n';
        }
      });

      // 处理预期结果
      expectedResults.forEach((result) => {
        if (result.includes('收藏成功')) {
          testContent +=
            '    cy.contains(\"已收藏\").should(\"be.visible\");\n';
        } else if (result.includes('取消收藏成功')) {
          testContent +=
            '    cy.get(\".favorite-item\").should(\"have.length\", 0);\n';
        } else if (result.includes('显示所有收藏项')) {
          testContent +=
            '    cy.get(\".favorite-item\").should(\"be.visible\");\n';
        }
      });

      testContent += '  });\n';
    }
  });

  testContent += '});\n';

  return testContent;
}

// 生成Jest单元测试脚本
function generateJestTests(testCases) {
  let testContent =
    'const request = require(\"supertest\");\nconst app = require(\"./server\");\n\ndescribe(\"API测试\", () => {\n  // 注册/登录API测试\n  describe(\"注册/登录API\", () => {\n';

  testCases.auth.forEach((testCase) => {
    if (testCase['测试编号']?.startsWith('AUTH')) {
      const testName = testCase['测试名称'] || '测试';
      testContent +=
        '\n    it(\"' +
        testName +
        '\", async () => {\n      const response = await request(app)\n        .post(\"/api/auth/login\")\n        .send({\n          username: \"test@example.com\",\n          password: \"Test123!\"\n        });\n      \n      expect(response.status).toBe(200);\n      expect(response.body).toHaveProperty(\"token\");\n    });\n';
    }
  });

  testContent +=
    '  });\n\n  // 估价提交API测试\n  describe(\"估价提交API\", () => {\n';

  testCases.valuation.forEach((testCase) => {
    if (testCase['测试编号']?.startsWith('VAL')) {
      const testName = testCase['测试名称'] || '测试';
      testContent +=
        '\n    it(\"' +
        testName +
        '\", async () => {\n      const token = \"test-token\";\n      const response = await request(app)\n        .post(\"/api/valuation\")\n        .set(\"Authorization\", \"Bearer \" + token)\n        .send({\n          area: 150.5,\n          layout: \"3室2厅1卫\",\n          floor: 10,\n          totalFloors: 30,\n          buildYear: 2015,\n          propertyType: \"住宅\",\n          orientation: \"南北通透\",\n          decoration: \"精装\",\n          city: \"长沙\",\n          district: \"岳麓区\"\n        });\n      \n      expect(response.status).toBe(200);\n      expect(response.body).toHaveProperty(\"result\");\n    });\n';
    }
  });

  testContent +=
    '  });\n\n  // 数据查询API测试\n  describe(\"数据查询API\", () => {\n';

  testCases.query.forEach((testCase) => {
    if (testCase['测试编号']?.startsWith('QRY')) {
      const testName = testCase['测试名称'] || '测试';
      testContent +=
        '\n    it(\"' +
        testName +
        '\", async () => {\n      const token = \"test-token\";\n      const response = await request(app)\n        .get(\"/api/properties\")\n        .set(\"Authorization\", \"Bearer \" + token);\n      \n      expect(response.status).toBe(200);\n      expect(Array.isArray(response.body)).toBe(true);\n    });\n';
    }
  });

  testContent +=
    '  });\n\n  // 收藏功能API测试\n  describe(\"收藏功能API\", () => {\n';

  testCases.favorite.forEach((testCase) => {
    if (testCase['测试编号']?.startsWith('FAV')) {
      const testName = testCase['测试名称'] || '测试';
      testContent +=
        '\n    it(\"' +
        testName +
        '\", async () => {\n      const token = \"test-token\";\n      const response = await request(app)\n        .post(\"/api/favorites\")\n        .set(\"Authorization\", \"Bearer \" + token)\n        .send({\n          propertyId: \"60d0fe4f5311236168a109ca\"\n        });\n      \n      expect(response.status).toBe(200);\n      expect(response.body).toHaveProperty(\"success\", true);\n    });\n';
    }
  });

  testContent += '  });\n});\n';

  return testContent;
}

// 主函数
async function main() {
  console.log('开始生成自动化测试脚本...');

  // 解析测试用例
  const testCases = parseTestCases(testCasesContent);

  // 生成Cypress测试脚本
  const cypressTests = generateCypressTests(testCases);
  const cypressFilePath = path.join(
    process.cwd(),
    'cypress',
    'e2e',
    'auth.cy.js'
  );
  await fs.writeFile(cypressFilePath, cypressTests);
  console.log('Cypress测试脚本已生成：cypress/e2e/auth.cy.js');

  // 生成Jest单元测试脚本
  const jestTests = generateJestTests(testCases);
  const jestFilePath = path.join(process.cwd(), 'tests', 'api.test.js');
  await fs.writeFile(jestFilePath, jestTests);
  console.log('Jest单元测试脚本已生成：tests/api.test.js');

  console.log('自动化测试脚本生成完成！');
}

// 确保tests目录存在
const testsDir = path.join(process.cwd(), 'tests');
try {
  await fs.access(testsDir);
} catch {
  await fs.mkdir(testsDir, { recursive: true });
}

// 执行主函数
main();
