// 导航栏配置文件
// 定义所有导航栏栏目及其子页面的配置

import {
  CalendarOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  DollarOutlined,
  HomeOutlined,
  CloudOutlined,
  CodeOutlined,
  CustomerServiceOutlined,
  InfoCircleOutlined,
  UnorderedListOutlined,
  ProfileOutlined,
  FormOutlined,
  BarChartOutlined,
  GiftOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  MessageOutlined,
  LineChartOutlined,
  PieChartOutlined,
  StarOutlined,
} from '@ant-design/icons';
import React from 'react';

// 定义导航项接口
export interface NavItem {
  key: string;
  icon: React.ReactNode;
  name: string;
  isSubMenu: boolean;
  children?: NavItem[];
}

// 定义导航配置接口
export interface NavConfigItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  items: NavItem[];
}

// 定义面包屑映射接口
export interface BreadcrumbItem {
  name: string;
  path: string;
}

export type BreadcrumbMap = Record<string, BreadcrumbItem>;

// 导航配置
export const navConfig: NavConfigItem[] = [
  {
    id: 'featured',
    name: '精选内容',
    icon: <StarOutlined />,
    items: [
      {
        key: '/featured',
        icon: <StarOutlined />,
        name: '精选首页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'latest-activities',
    name: '最新活动',
    icon: <CalendarOutlined />,
    items: [
      {
        key: '/activities/list',
        icon: <UnorderedListOutlined />,
        name: '活动列表页',
        isSubMenu: false,
      },
      {
        key: '/activities/detail',
        icon: <ProfileOutlined />,
        name: '活动详情页',
        isSubMenu: false,
      },
      {
        key: '/activities/registration',
        icon: <FormOutlined />,
        name: '活动报名页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'products',
    name: '产品',
    icon: <AppstoreOutlined />,
    items: [
      {
        key: '/products/core-engine',
        icon: <SettingOutlined />,
        name: '核心引擎页',
        isSubMenu: false,
      },
      {
        key: '/products/api',
        icon: <CodeOutlined />,
        name: 'API接口页',
        isSubMenu: false,
      },
      {
        key: '/products/custom-solutions',
        icon: <SolutionOutlined />,
        name: '定制方案页',
        isSubMenu: false,
      },
      {
        key: '/products/case-study',
        icon: <BookOutlined />,
        name: '案例展示页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'solutions',
    name: '解决方案',
    icon: <SolutionOutlined />,
    items: [
      {
        key: '/solutions/second-hand',
        icon: <HomeOutlined />,
        name: '二手房估价方案页',
        isSubMenu: false,
      },
      {
        key: '/solutions/financial',
        icon: <DollarOutlined />,
        name: '金融机构评估方案页',
        isSubMenu: false,
      },
      {
        key: '/solutions/government',
        icon: <HomeOutlined />,
        name: '政府土地估值方案页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'pricing',
    name: '定价',
    icon: <DollarOutlined />,
    items: [
      {
        key: '/pricing/plans',
        icon: <UnorderedListOutlined />,
        name: '套餐价格页',
        isSubMenu: false,
      },
      {
        key: '/pricing/pay-as-you-go',
        icon: <DollarOutlined />,
        name: '按需计费页',
        isSubMenu: false,
      },
      {
        key: '/pricing/promotions',
        icon: <GiftOutlined />,
        name: '优惠套餐页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'enterprise-center',
    name: '企业中心',
    icon: <HomeOutlined />,
    items: [
      {
        key: '/enterprise/console',
        icon: <PieChartOutlined />,
        name: '企业控制台',
        isSubMenu: false,
      },
      {
        key: '/enterprise/permissions',
        icon: <SettingOutlined />,
        name: '权限管理页',
        isSubMenu: false,
      },
      {
        key: '/enterprise/data-stats',
        icon: <BarChartOutlined />,
        name: '数据统计页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'cloud-market',
    name: '云市场',
    icon: <CloudOutlined />,
    items: [
      {
        key: '/market/plugins',
        icon: <AppstoreOutlined />,
        name: '插件市场页',
        isSubMenu: false,
      },
      {
        key: '/market/services',
        icon: <CustomerServiceOutlined />,
        name: '服务市场页',
        isSubMenu: false,
      },
      {
        key: '/market/resources',
        icon: <DownloadOutlined />,
        name: '资源下载页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'developers',
    name: '开发者',
    icon: <CodeOutlined />,
    items: [
      {
        key: '/developers/docs',
        icon: <FileTextOutlined />,
        name: '开发文档页',
        isSubMenu: false,
      },
      {
        key: '/developers/sdk',
        icon: <DownloadOutlined />,
        name: 'SDK下载页',
        isSubMenu: false,
      },
      {
        key: '/developers/tools',
        icon: <SettingOutlined />,
        name: '调试工具页',
        isSubMenu: false,
      },
      {
        key: '/developers/community',
        icon: <MessageOutlined />,
        name: '开发者社区',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'customer-support',
    name: '客户支持',
    icon: <CustomerServiceOutlined />,
    items: [
      {
        key: '/support/help-center',
        icon: <QuestionCircleOutlined />,
        name: '帮助中心',
        isSubMenu: false,
      },
      {
        key: '/support/tickets',
        icon: <MessageOutlined />,
        name: '工单系统页',
        isSubMenu: false,
      },
      {
        key: '/support/contact',
        icon: <UserOutlined />,
        name: '联系我们页',
        isSubMenu: false,
      },
    ],
  },
  {
    id: 'about-us',
    name: '了解数智估价',
    icon: <InfoCircleOutlined />,
    items: [
      {
        key: '/about/introduction',
        icon: <BookOutlined />,
        name: '产品介绍页',
        isSubMenu: false,
      },
      {
        key: '/about/whitepaper',
        icon: <FileTextOutlined />,
        name: '技术白皮书页',
        isSubMenu: false,
      },
      {
        key: '/about/reports',
        icon: <LineChartOutlined />,
        name: '行业报告页',
        isSubMenu: false,
      },
      {
        key: '/about/partners',
        icon: <UserOutlined />,
        name: '合作伙伴页',
        isSubMenu: false,
      },
    ],
  },
];

// 面包屑映射
export const breadcrumbMap: BreadcrumbMap = {
  '/': { name: '系统总览', path: '/' },
  '/featured': { name: '精选内容', path: '/featured' },
  '/valuation-engine': { name: '估价引擎', path: '/valuation-engine' },
  '/valuation-engine/result': { name: '估价结果', path: '/valuation-engine/result' },
  '/valuation-engine/report': { name: '估价报告', path: '/valuation-engine/report' },
  '/valuation-engine/compare': { name: '结果比较', path: '/valuation-engine/compare' },
  '/valuation-engine/history': { name: '历史记录', path: '/valuation-engine/history' },
  '/advanced-search': { name: '高级搜索', path: '/advanced-search' },
  '/user-center': { name: '用户中心', path: '/user-center' },
  '/market-analysis': { name: '市场分析', path: '/market-analysis' },
  '/comparison-tool': { name: '比较工具', path: '/comparison-tool' },
  '/data-visualization': { name: '数据可视化', path: '/data-visualization' },
  '/case-study': { name: '客户案例展示', path: '/case-study' },
  '/product-services': { name: '产品服务展示', path: '/product-services' },
  '/gis-evaluation-preview': {
    name: 'GIS评估预览',
    path: '/gis-evaluation-preview',
  },
  '/revenue-evaluation-preview': {
    name: '收益评估预览',
    path: '/revenue-evaluation-preview',
  },
  '/gis': { name: 'GIS图数一体化评估系统', path: '/gis' },
  '/building': { name: '楼盘可视化系统', path: '/building' },
  '/encryption': { name: '数据加密系统', path: '/encryption' },
  '/cert': { name: '电子凭证系统', path: '/cert' },
  '/revenue': { name: '收益价值评估系统', path: '/revenue' },
  '/profile': { name: '个人信息', path: '/profile' },
  '/settings': { name: '系统设置', path: '/settings' },
  '/system/users': { name: '用户管理', path: '/system/users' },
  '/system/logs': { name: '操作日志', path: '/system/logs' },
  '/system/monitor': { name: '系统监控', path: '/system/monitor' },
  '/system/data': { name: '数据管理', path: '/system/data' },
  // 新增页面面包屑
  '/activities/list': { name: '活动列表页', path: '/activities/list' },
  '/activities/detail': { name: '活动详情页', path: '/activities/detail' },
  '/activities/registration': {
    name: '活动报名页',
    path: '/activities/registration',
  },
  '/products/core-engine': {
    name: '核心引擎页',
    path: '/products/core-engine',
  },
  '/products/api': { name: 'API接口页', path: '/products/api' },
  '/products/custom-solutions': {
    name: '定制方案页',
    path: '/products/custom-solutions',
  },
  '/products/case-study': { name: '案例展示页', path: '/products/case-study' },
  '/solutions/second-hand': {
    name: '二手房估价方案页',
    path: '/solutions/second-hand',
  },
  '/solutions/financial': {
    name: '金融机构评估方案页',
    path: '/solutions/financial',
  },
  '/solutions/government': {
    name: '政府土地估值方案页',
    path: '/solutions/government',
  },
  '/pricing/plans': { name: '套餐价格页', path: '/pricing/plans' },
  '/pricing/pay-as-you-go': {
    name: '按需计费页',
    path: '/pricing/pay-as-you-go',
  },
  '/pricing/promotions': { name: '优惠套餐页', path: '/pricing/promotions' },
  '/enterprise/console': { name: '企业控制台', path: '/enterprise/console' },
  '/enterprise/permissions': {
    name: '权限管理页',
    path: '/enterprise/permissions',
  },
  '/enterprise/data-stats': {
    name: '数据统计页',
    path: '/enterprise/data-stats',
  },
  '/market/plugins': { name: '插件市场页', path: '/market/plugins' },
  '/market/services': { name: '服务市场页', path: '/market/services' },
  '/market/resources': { name: '资源下载页', path: '/market/resources' },
  '/developers/docs': { name: '开发文档页', path: '/developers/docs' },
  '/developers/sdk': { name: 'SDK下载页', path: '/developers/sdk' },
  '/developers/tools': { name: '调试工具页', path: '/developers/tools' },
  '/developers/community': {
    name: '开发者社区',
    path: '/developers/community',
  },
  '/support/help-center': { name: '帮助中心', path: '/support/help-center' },
  '/support/tickets': { name: '工单系统页', path: '/support/tickets' },
  '/support/contact': { name: '联系我们页', path: '/support/contact' },
  '/about/introduction': { name: '产品介绍页', path: '/about/introduction' },
  '/about/whitepaper': { name: '技术白皮书页', path: '/about/whitepaper' },
  '/about/reports': { name: '行业报告页', path: '/about/reports' },
  '/about/partners': { name: '合作伙伴页', path: '/about/partners' },
};
