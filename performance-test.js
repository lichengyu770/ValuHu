import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// 测试配置
const baseUrl = 'http://localhost:3000';
const testDurations = {
  short: '30s',
  medium: '1m',
  long: '3m',
};

// 测试场景配置
const testScenarios = [
  { name: '50并发', users: 50, duration: testDurations.short },
  { name: '100并发', users: 100, duration: testDurations.short },
  { name: '200并发', users: 200, duration: testDurations.medium },
  { name: '500并发', users: 500, duration: testDurations.medium },
];

// 生成测试场景对象
const scenarios = {};
testScenarios.forEach((scenario) => {
  scenarios[scenario.name] = {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: scenario.users },
      { duration: scenario.duration, target: scenario.users },
      { duration: '30s', target: 0 },
    ],
    gracefulRampDown: '30s',
  };
});

export let options = {
  scenarios: scenarios,
  thresholds: {
    http_req_duration: ['p95<500'], // 95%的请求响应时间小于500ms
    http_req_failed: ['rate<0.01'], // 失败率小于1%
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p90', 'p95', 'p99'],
};

// 测试函数
function testLogin() {
  const response = http.post(
    `${baseUrl}/api/auth/login`,
    {
      username: 'test@example.com',
      password: 'Test123!',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(response, {
    登录成功: (r) => r.status === 200,
    返回token: (r) => r.json().token !== undefined,
  });

  return response.json().token;
}

function testValuation(token) {
  const response = http.post(
    `${baseUrl}/api/valuation`,
    {
      area: 150.5,
      layout: '3室2厅1卫',
      floor: 10,
      totalFloors: 30,
      buildYear: 2015,
      propertyType: '住宅',
      orientation: '南北通透',
      decoration: '精装',
      city: '长沙',
      district: '岳麓区',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(response, {
    估价成功: (r) => r.status === 200,
    返回结果: (r) => r.json().result !== undefined,
  });
}

function testPropertiesList(token) {
  const response = http.get(`${baseUrl}/api/properties`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(response, {
    查询成功: (r) => r.status === 200,
    返回数组: (r) => Array.isArray(r.json()),
  });
}

function testFavorite(token) {
  const response = http.post(
    `${baseUrl}/api/favorites`,
    {
      propertyId: '60d0fe4f5311236168a109ca',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(response, {
    收藏成功: (r) => r.status === 200,
    返回成功标志: (r) => r.json().success === true,
  });
}

// 主测试流程
export default function () {
  // 登录获取token
  const token = testLogin();

  // 测试估价功能
  testValuation(token);

  // 测试物业列表查询
  testPropertiesList(token);

  // 测试收藏功能
  testFavorite(token);

  // 间隔1秒
  sleep(1);
}

// 生成HTML报告
export function handleSummary(data) {
  return {
    'performance-report.html': htmlReport(data),
    stdout: JSON.stringify(data, null, 2),
  };
}
