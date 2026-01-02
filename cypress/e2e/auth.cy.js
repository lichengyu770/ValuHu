/// <reference types="cypress" />

describe('注册/登录流程测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('用户登录成功', () => {
    cy.contains('登录').click();
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.contains('登录').click();
    cy.url().should('include', '/index');
  });

  it('用户注销成功', () => {
    cy.contains('注销').click();
    cy.url().should('include', '/login');
  });
});

/// <reference types="cypress" />

describe('估价提交功能测试', () => {
  beforeEach(() => {
    cy.visit('/');
    // 登录
    cy.contains('登录').click();
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.contains('登录').click();
    cy.url().should('include', '/index');
  });

  it('单条估价提交成功', () => {
    cy.contains('估价').click();
    cy.get('input[name="area"]').type('150.5');
    cy.get('select[name="layout"]').select('3室2厅1卫');
    cy.get('input[name="floor"]').type('10');
    cy.get('input[name="totalFloors"]').type('30');
    cy.get('input[name="buildYear"]').type('2015');
    cy.get('select[name="propertyType"]').select('住宅');
    cy.get('select[name="orientation"]').select('南北通透');
    cy.get('select[name="decoration"]').select('精装');
    cy.get('select[name="city"]').select('长沙');
    cy.get('select[name="district"]').select('岳麓区');
    cy.contains('提交估价').click();
    cy.contains('估价结果').should('be.visible');
  });

  it('批量估价提交成功', () => {
    cy.contains('估价结果').should('be.visible');
  });
});

/// <reference types="cypress" />

describe('数据查询操作测试', () => {
  beforeEach(() => {
    cy.visit('/');
    // 登录
    cy.contains('登录').click();
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.contains('登录').click();
    cy.url().should('include', '/index');
  });

  it('物业列表查询成功', () => {
    cy.contains('物业管理').click();
    cy.contains('查询').click();
    cy.get('.property-list').should('be.visible');
  });

  it('物业详情查询成功', () => {
    cy.get('.property-item').first().click();
    cy.get('.property-list').should('be.visible');
    cy.contains('物业详情').should('be.visible');
  });

  it('条件过滤查询成功', () => {
    cy.contains('物业管理').click();
    cy.get('select[name="city"]').select('长沙');
    cy.get('.property-list').should('be.visible');
  });

  it('统计数据查询成功', () => {
    cy.get('.property-list').should('be.visible');
  });
});

/// <reference types="cypress" />

describe('收藏功能测试', () => {
  beforeEach(() => {
    cy.visit('/');
    // 登录
    cy.contains('登录').click();
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('Test123!');
    cy.contains('登录').click();
    cy.url().should('include', '/index');
  });

  it('添加收藏成功', () => {
    cy.contains('估价').click();
    cy.get('.favorite-btn').first().click();
    cy.contains('已收藏').should('be.visible');
  });

  it('取消收藏成功', () => {
    cy.contains('我的收藏').click();
    cy.get('.unfavorite-btn').first().click();
    cy.contains('已收藏').should('be.visible');
  });

  it('查看收藏列表', () => {
    cy.get('.favorite-item').should('be.visible');
  });
});
