import { createBrowserRouter, RouteObject } from 'react-router-dom';
import React from 'react';
import Layout from './components/Layout';
import { withLazyLoading } from './components/LazyComponents';

// 使用高级懒加载包装器
const ValuationEngine = withLazyLoading(() => import('./pages/ValuationEngine'), {
  componentName: '估价引擎',
  retry: true,
  fullScreen: false
});

const Home = withLazyLoading(() => import('./pages/Home'), {
  componentName: '首页',
  retry: true,
  fullScreen: false
});

const About = withLazyLoading(() => import('./pages/About'), {
  componentName: '关于我们',
  retry: true,
  fullScreen: false
});

const JoinUs = withLazyLoading(() => import('./pages/JoinUs'), {
  componentName: '加入我们',
  retry: true,
  fullScreen: false
});

const TermsOfService = withLazyLoading(() => import('./pages/TermsOfService'), {
  componentName: '服务条款',
  retry: true,
  fullScreen: false
});

const PrivacyPolicy = withLazyLoading(() => import('./pages/PrivacyPolicy'), {
  componentName: '隐私政策',
  retry: true,
  fullScreen: false
});

const Contact = withLazyLoading(() => import('./pages/Contact'), {
  componentName: '联系我们',
  retry: true,
  fullScreen: false
});

// 底部导航栏相关页面
const DataManagement = withLazyLoading(() => import('./pages/DataManagement'), {
  componentName: '数据管理',
  retry: true,
  fullScreen: false
});

const DataAnalysis = withLazyLoading(() => import('./pages/DataAnalysis'), {
  componentName: '数据分析',
  retry: true,
  fullScreen: false
});

const ImportExport = withLazyLoading(() => import('./pages/ImportExport'), {
  componentName: '导入导出',
  retry: true,
  fullScreen: false
});

// 产品相关页面
const IndustrialEmpowerment = withLazyLoading(() => import('./pages/products/IndustrialEmpowerment'), {
  componentName: '产业赋能',
  retry: true,
  fullScreen: false
});

const EducationInnovation = withLazyLoading(() => import('./pages/products/EducationInnovation'), {
  componentName: '教育革新',
  retry: true,
  fullScreen: false
});

const FivePartyCollaboration = withLazyLoading(() => import('./pages/products/FivePartyCollaboration'), {
  componentName: '五方协同',
  retry: true,
  fullScreen: false
});

const DataDashboard = withLazyLoading(() => import('./pages/products/DataDashboard'), {
  componentName: '数据看板',
  retry: true,
  fullScreen: false
});

// 实用工具相关页面
const HousePriceCalculator = withLazyLoading(() => import('./pages/utils/HousePriceCalculator'), {
  componentName: '房价计算器',
  retry: true,
  fullScreen: false
});

const LoanCalculator = withLazyLoading(() => import('./pages/utils/LoanCalculator'), {
  componentName: '贷款计算器',
  retry: true,
  fullScreen: false
});

const ROICalculator = withLazyLoading(() => import('./pages/utils/ROICalculator'), {
  componentName: '投资回报率计算器',
  retry: true,
  fullScreen: false
});

// 资源相关页面
const CaseCommunity = withLazyLoading(() => import('./pages/resources/CaseCommunity'), {
  componentName: '案例社区',
  retry: true,
  fullScreen: false
});

const KnowledgeTutorials = withLazyLoading(() => import('./pages/resources/KnowledgeTutorials'), {
  componentName: '知识教程',
  retry: true,
  fullScreen: false
});

const SpecialTopics = withLazyLoading(() => import('./pages/resources/SpecialTopics'), {
  componentName: '专题频道',
  retry: true,
  fullScreen: false
});

const UserManual = withLazyLoading(() => import('./pages/resources/UserManual'), {
  componentName: '使用手册',
  retry: true,
  fullScreen: false
});

const HelpCenter = withLazyLoading(() => import('./pages/resources/HelpCenter'), {
  componentName: '帮助中心',
  retry: true,
  fullScreen: false
});

// 支持相关页面
const InviteRewards = withLazyLoading(() => import('./pages/support/InviteRewards'), {
  componentName: '邀请有礼',
  retry: true,
  fullScreen: false
});

const PrivateDeployment = withLazyLoading(() => import('./pages/support/PrivateDeployment'), {
  componentName: '私有化部署',
  retry: true,
  fullScreen: false
});

const EducationCertification = withLazyLoading(() => import('./pages/support/EducationCertification'), {
  componentName: '教育认证',
  retry: true,
  fullScreen: false
});

const IndustryStandards = withLazyLoading(() => import('./pages/support/IndustryStandards'), {
  componentName: '对标行业标准',
  retry: true,
  fullScreen: false
});

// 五个用户端页面
const InstitutionIndex = withLazyLoading(() => import('./pages/institution/Index'), {
  componentName: '院校端首页',
  retry: true,
  fullScreen: false
});

const EnterpriseIndex = withLazyLoading(() => import('./pages/enterprise/Index'), {
  componentName: '企业端首页',
  retry: true,
  fullScreen: false
});

const AssociationIndex = withLazyLoading(() => import('./pages/association/Index'), {
  componentName: '协会端首页',
  retry: true,
  fullScreen: false
});

const GovernmentIndex = withLazyLoading(() => import('./pages/government/Index'), {
  componentName: '政府端首页',
  retry: true,
  fullScreen: false
});

const PublicIndex = withLazyLoading(() => import('./pages/public/Index'), {
  componentName: '大众端首页',
  retry: true,
  fullScreen: false
});

// 计费页面
const Billing = withLazyLoading(() => import('./pages/Billing'), {
  componentName: '计费管理',
  retry: true,
  fullScreen: false
});

// 监控仪表板页面
const MonitoringDashboard = withLazyLoading(() => import('./pages/MonitoringDashboard'), {
  componentName: '监控仪表板',
  retry: true,
  fullScreen: false
});

// 安全仪表板页面
const SecurityDashboard = withLazyLoading(() => import('./pages/SecurityDashboard'), {
  componentName: '安全仪表板',
  retry: true,
  fullScreen: false
});

// 开发者平台页面
const DeveloperPortal = withLazyLoading(() => import('./pages/DeveloperPortal'), {
  componentName: '开发者平台',
  retry: true,
  fullScreen: false
});

// 数据分析实验室页面
const DataAnalysisLab = withLazyLoading(() => import('./pages/DataAnalysisLab'), {
  componentName: '在线数据分析实验室',
  retry: true,
  fullScreen: false
});

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout />
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'join-us',
        element: <JoinUs />,
      },
      {
        path: 'terms-of-service',
        element: <TermsOfService />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'valuation-engine',
        element: <ValuationEngine />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      // 底部导航栏路由
      {
        path: 'data-management',
        element: <DataManagement />,
      },
      {
        path: 'data-analysis',
        element: <DataAnalysis />,
      },
      {
        path: 'import-export',
        element: <ImportExport />,
      },
      // 产品相关路由
      {
        path: 'products/industrial-empowerment',
        element: <IndustrialEmpowerment />,
      },
      {
        path: 'products/education-innovation',
        element: <EducationInnovation />,
      },
      {
        path: 'products/five-party-collaboration',
        element: <FivePartyCollaboration />,
      },
      {
        path: 'products/data-dashboard',
        element: <DataDashboard />,
      },
      // 实用工具相关路由
      {
        path: 'utils/house-price-calculator',
        element: <HousePriceCalculator />,
      },
      {
        path: 'utils/loan-calculator',
        element: <LoanCalculator />,
      },
      {
        path: 'utils/roi-calculator',
        element: <ROICalculator />,
      },
      // 资源相关路由
      {
        path: 'resources/case-community',
        element: <CaseCommunity />,
      },
      {
        path: 'resources/knowledge-tutorials',
        element: <KnowledgeTutorials />,
      },
      {
        path: 'resources/special-topics',
        element: <SpecialTopics />,
      },
      {
        path: 'resources/user-manual',
        element: <UserManual />,
      },
      {
        path: 'resources/help-center',
        element: <HelpCenter />,
      },
      // 支持相关路由
      {
        path: 'support/invite-rewards',
        element: <InviteRewards />,
      },
      {
        path: 'support/private-deployment',
        element: <PrivateDeployment />,
      },
      {
        path: 'support/education-certification',
        element: <EducationCertification />,
      },
      {
        path: 'support/industry-standards',
        element: <IndustryStandards />,
      },
      // 五个用户端路由
      {
        path: 'institution',
        element: <InstitutionIndex />,
      },
      {
        path: 'enterprise',
        element: <EnterpriseIndex />,
      },
      {
        path: 'association',
        element: <AssociationIndex />,
      },
      {
        path: 'government',
        element: <GovernmentIndex />,
      },
      {
        path: 'public',
        element: <PublicIndex />,
      },
      // 计费管理路由
      {
        path: 'billing',
        element: <Billing />,
      },
      // 监控仪表板路由
      {
        path: 'monitoring',
        element: <MonitoringDashboard />,
      },
      // 安全仪表板路由
      {
        path: 'security',
        element: <SecurityDashboard />,
      },
      // 开发者平台路由
      {
        path: 'developer',
        element: <DeveloperPortal />,
      },
      // 数据分析实验室路由
      {
        path: 'data-analysis-lab',
        element: <DataAnalysisLab />,
      },
    ],
  },
] as RouteObject[]);

export default router;