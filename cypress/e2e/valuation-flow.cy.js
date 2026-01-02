/**
 * 房产估价流程端到端测试
 * 测试从访问估价页面到查看估价结果的完整流程
 */

describe('房产估价流程测试', () => {
  beforeEach(() => {
    // 访问估价页面
    cy.visit('/valuation-engine.html');
  });

  it('应该能成功加载估价页面', () => {
    cy.contains('房产估价引擎').should('be.visible');
    cy.contains('开始估价').should('be.visible');
  });

  it('应该能输入房产基本信息', () => {
    // 输入面积
    cy.get('input[name="area"]').type('120');
    cy.get('input[name="area"]').should('have.value', '120');

    // 选择建筑类型
    cy.get('select[name="buildingType"]').select('apartment');
    cy.get('select[name="buildingType"]').should('have.value', 'apartment');

    // 输入楼层信息
    cy.get('input[name="floor"]').type('5');
    cy.get('input[name="totalFloors"]').type('10');
    
    // 选择装修等级
    cy.get('select[name="decorationLevel"]').select('medium');
  });

  it('应该能选择估价方法', () => {
    // 选择基础估价法
    cy.get('#basicValuationMethod').click();
    cy.get('#basicValuationMethod').should('be.checked');

    // 选择市场比较法
    cy.get('#marketComparisonMethod').click();
    cy.get('#marketComparisonMethod').should('be.checked');
    cy.get('#basicValuationMethod').should('not.be.checked');

    // 选择收益还原法
    cy.get('#incomeValuationMethod').click();
    cy.get('#incomeValuationMethod').should('be.checked');

    // 选择成本法
    cy.get('#costValuationMethod').click();
    cy.get('#costValuationMethod').should('be.checked');
  });

  it('应该能执行基础估价并查看结果', () => {
    // 输入必要的估价参数
    cy.get('input[name="area"]').type('120');
    cy.get('input[name="unitPrice"]').type('10000');
    cy.get('select[name="buildingType"]').select('apartment');
    
    // 选择基础估价法
    cy.get('#basicValuationMethod').click();
    
    // 点击开始估价按钮
    cy.contains('开始估价').click();
    
    // 等待估价结果
    cy.wait(1000);
    
    // 验证估价结果显示
    cy.get('.valuation-result').should('be.visible');
    cy.get('.estimated-value').should('contain', '元');
  });

  it('应该能查看估价历史记录', () => {
    // 执行一次估价
    cy.get('input[name="area"]').type('120');
    cy.get('input[name="unitPrice"]').type('10000');
    cy.get('#basicValuationMethod').click();
    cy.contains('开始估价').click();
    cy.wait(1000);
    
    // 点击历史记录按钮
    cy.contains('查看历史记录').click();
    
    // 验证历史记录显示
    cy.get('.valuation-history').should('be.visible');
    cy.get('.history-item').should('have.length.greaterThan', 0);
  });

  it('应该能处理无效的输入数据', () => {
    // 输入无效的面积（负数）
    cy.get('input[name="area"]').type('-100');
    
    // 点击开始估价
    cy.contains('开始估价').click();
    
    // 验证错误提示
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain', '面积');
  });

  it('应该支持响应式设计', () => {
    // 桌面端
    cy.viewport('macbook-16');
    cy.get('.desktop-menu').should('be.visible');
    
    // 平板端
    cy.viewport('ipad-2');
    cy.get('.tablet-menu').should('be.visible');
    
    // 移动端
    cy.viewport('iphone-13');
    cy.get('.mobile-menu-button').should('be.visible');
    
    // 点击移动端菜单按钮
    cy.get('.mobile-menu-button').click();
    cy.get('.mobile-menu').should('be.visible');
  });

  it('应该能生成估价报告', () => {
    // 执行估价
    cy.get('input[name="area"]').type('120');
    cy.get('input[name="unitPrice"]').type('10000');
    cy.get('#basicValuationMethod').click();
    cy.contains('开始估价').click();
    cy.wait(1000);
    
    // 点击生成报告按钮
    cy.contains('生成报告').click();
    
    // 验证报告生成
    cy.get('.report-preview').should('be.visible');
    cy.contains('估价报告').should('be.visible');
  });

  it('应该能保存估价结果', () => {
    // 执行估价
    cy.get('input[name="area"]').type('120');
    cy.get('input[name="unitPrice"]').type('10000');
    cy.get('#basicValuationMethod').click();
    cy.contains('开始估价').click();
    cy.wait(1000);
    
    // 点击保存按钮
    cy.contains('保存估价结果').click();
    
    // 验证保存成功提示
    cy.get('.success-message').should('be.visible');
    cy.get('.success-message').should('contain', '保存成功');
  });
});