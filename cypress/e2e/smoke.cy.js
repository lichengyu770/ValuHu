/**
 * 冒烟测试脚本 - 跨浏览器兼容性测试
 * 适用于BrowserStack和LambdaTest
 */

describe('跨浏览器兼容性冒烟测试', () => {
  // 测试基础页面加载
  it('应该能成功加载主页', () => {
    cy.visit('/');
    cy.contains('我的应用'); // 替换为你的应用标题
  });

  // 测试响应式布局
  it('应该正确响应不同视口尺寸', () => {
    // 桌面端视口
    cy.viewport('macbook-16');
    cy.get('.header').should('be.visible');

    // 平板视口
    cy.viewport('ipad-2');
    cy.get('.header').should('be.visible');

    // 移动端视口
    cy.viewport('iphone-13');
    cy.get('.mobile-menu-button').should('be.visible'); // 替换为你的移动端菜单按钮选择器
  });

  // 测试特性检测
  it('应该正确检测浏览器特性', () => {
    cy.visit('/');
    // 检查BrowserUtils是否正常工作
    cy.window().then((win) => {
      // 验证基本的浏览器检测功能
      expect(win.BrowserUtils).to.be.an('object');
      expect(win.BrowserUtils.supportsServiceWorker()).to.be.a('boolean');
    });
  });

  // 测试表单输入（如果有）
  it('应该支持基本表单交互', () => {
    cy.visit('/');

    // 假设页面上有一个搜索框
    cy.get('input[type="text"]').first().as('searchInput');
    cy.get('@searchInput').type('测试');
    cy.get('@searchInput').should('have.value', '测试');
  });

  // 测试CSS兼容性
  it('应该正确加载和应用CSS样式', () => {
    cy.visit('/');

    // 检查关键CSS类是否存在且应用了正确的样式
    cy.get('.btn-primary').should('have.css', 'background-color');
    cy.get('.card').should('have.css', 'border-radius');
  });

  // 测试JavaScript交互
  it('应该支持基本的JavaScript交互', () => {
    cy.visit('/');

    // 测试点击事件
    cy.get('button').first().click();

    // 测试响应式菜单（如果有）
    cy.viewport('iphone-13');
    cy.get('.mobile-menu-button').click();
    cy.get('.mobile-menu').should('be.visible');
  });
});
