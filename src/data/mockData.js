// 模拟数据服务

// 楼盘数据
export const buildingData = {
  jinmao: {
    name: '金茂府',
    address: '长沙市岳麓区梅溪湖路',
    price: '18,500元/㎡',
    type: '住宅',
    total: '1200户',
    completion: '2023年',
    images: {
      '3d': 'https://picsum.photos/id/1067/800/500',
      layout: 'https://picsum.photos/id/164/800/500',
      environment: 'https://picsum.photos/id/1048/800/500',
    },
  },
  vanke: {
    name: '万科城',
    address: '长沙市芙蓉区万家丽路',
    price: '16,800元/㎡',
    type: '商住两用',
    total: '1800户',
    completion: '2022年',
    images: {
      '3d': 'https://picsum.photos/id/1076/800/500',
      layout: 'https://picsum.photos/id/163/800/500',
      environment: 'https://picsum.photos/id/1040/800/500',
    },
  },
  poly: {
    name: '保利花园',
    address: '长沙市天心区书院路',
    price: '17,200元/㎡',
    type: '住宅',
    total: '1500户',
    completion: '2024年',
    images: {
      '3d': 'https://picsum.photos/id/1080/800/500',
      layout: 'https://picsum.photos/id/165/800/500',
      environment: 'https://picsum.photos/id/1050/800/500',
    },
  },
};

// GIS评估数据
export const gisEvaluationData = {
  areas: {
    xjang: {
      name: '湘江新区',
      center: [112.9214, 28.194],
      price: 12500,
      trend: 'up',
    },
    furong: {
      name: '芙蓉区',
      center: [112.9837, 28.1988],
      price: 15800,
      trend: 'up',
    },
    yuelu: {
      name: '岳麓区',
      center: [112.9283, 28.2515],
      price: 11200,
      trend: 'flat',
    },
    tianxin: {
      name: '天心区',
      center: [112.9833, 28.1512],
      price: 13600,
      trend: 'up',
    },
    kaifu: {
      name: '开福区',
      center: [112.9923, 28.2234],
      price: 14200,
      trend: 'down',
    },
  },
  scenarioFactors: [
    { name: '交通', value: 90, max: 100 },
    { name: '教育', value: 85, max: 100 },
    { name: '商业', value: 80, max: 100 },
    { name: '环境', value: 95, max: 100 },
    { name: '医疗', value: 88, max: 100 },
  ],
};

// 收益评估数据
export const revenueEvaluationData = [
  {
    key: '1',
    propertyId: 'PROP2025001',
    propertyName: '金茂府A座101室',
    location: '岳麓区',
    area: 120.5,
    currentPrice: 18500,
    estimatedAnnualIncome: 86400,
    roi: 3.8,
    evaluationDate: '2025-10-20',
  },
  {
    key: '2',
    propertyId: 'PROP2025002',
    propertyName: '万科城B座202室',
    location: '芙蓉区',
    area: 89.0,
    currentPrice: 16800,
    estimatedAnnualIncome: 57600,
    roi: 4.0,
    evaluationDate: '2025-10-19',
  },
  {
    key: '3',
    propertyId: 'PROP2025003',
    propertyName: '保利花园C座303室',
    location: '天心区',
    area: 143.2,
    currentPrice: 17200,
    estimatedAnnualIncome: 100800,
    roi: 3.9,
    evaluationDate: '2025-10-18',
  },
  {
    key: '4',
    propertyId: 'PROP2025004',
    propertyName: '绿地中央广场D座404室',
    location: '开福区',
    area: 95.8,
    currentPrice: 19000,
    estimatedAnnualIncome: 64800,
    roi: 3.6,
    evaluationDate: '2025-10-17',
  },
];

// 电子凭证数据
export const electronicCertData = [
  {
    key: '1',
    certId: 'EC202510230001',
    type: '不动产权证',
    propertyId: 'PROP2025001',
    owner: '张三',
    issueDate: '2025-06-15',
    status: '有效',
    verification: '已核验',
    details: {
      registerNumber: '湘（2025）长沙市不动产权第0012345号',
      propertyType: '住宅',
      purpose: '居住',
      area: 120.5,
      location: '岳麓区梅溪湖路88号金茂府A座101室',
      issueAuthority: '长沙市自然资源和规划局',
      imageUrl: 'https://picsum.photos/id/180/800/600',
    },
  },
  {
    key: '2',
    certId: 'EC202510230002',
    type: '预售许可证',
    propertyId: 'PROP2025002',
    owner: '长沙市房地产开发公司',
    issueDate: '2025-05-20',
    status: '有效',
    verification: '已核验',
    details: {
      permitNumber: '长房售许字（2025）第0123号',
      projectName: '万科城一期',
      buildingName: 'B座',
      totalArea: 89000,
      units: 280,
      issueAuthority: '长沙市住房和城乡建设局',
      imageUrl: 'https://picsum.photos/id/181/800/600',
    },
  },
  {
    key: '3',
    certId: 'EC202510230003',
    type: '不动产权证',
    propertyId: 'PROP2025003',
    owner: '李四',
    issueDate: '2025-04-10',
    status: '有效',
    verification: '已核验',
    details: {
      registerNumber: '湘（2025）长沙市不动产权第0012346号',
      propertyType: '住宅',
      purpose: '居住',
      area: 143.2,
      location: '天心区书院路123号保利花园C座303室',
      issueAuthority: '长沙市自然资源和规划局',
      imageUrl: 'https://picsum.photos/id/182/800/600',
    },
  },
  {
    key: '4',
    certId: 'EC202510230004',
    type: '建设工程规划许可证',
    propertyId: 'PROP2025004',
    owner: '湖南省建筑工程公司',
    issueDate: '2025-03-25',
    status: '有效',
    verification: '已核验',
    details: {
      permitNumber: '长规建（2025）0078号',
      projectName: '绿地中央广场',
      buildingName: 'D座',
      totalArea: 120000,
      height: 150,
      floors: 45,
      issueAuthority: '长沙市自然资源和规划局',
      imageUrl: 'https://picsum.photos/id/183/800/600',
    },
  },
];

// 仪表盘统计数据
export const dashboardStats = {
  totalBuildings: 128,
  electronicCerts: 3564,
  registeredUsers: 2145,
  totalEvaluationValue: 128.5,
  totalProperties: 256,
  avgROI: 3.8,
  yearOnYearGrowth: 8.5,
};

// 系统功能列表
export const systemFeatures = [
  {
    id: 'gis',
    title: 'GIS图数一体化评估系统',
    icon: 'MapOutlined',
    description: '基于地理信息的房产价值评估',
    color: '#165DFF',
  },
  {
    id: 'building',
    title: '楼盘可视化系统',
    icon: 'BuildingOutlined',
    description: '三维楼盘展示与信息查询',
    color: '#36CFC9',
  },
  {
    id: 'cert',
    title: '电子凭证管理系统',
    icon: 'FileTextOutlined',
    description: '房产凭证数字化存储与管理',
    color: '#722ED1',
  },
  {
    id: 'encryption',
    title: '数据加密管理系统',
    icon: 'ShieldOutlined',
    description: '敏感数据加密与安全管理',
    color: '#F7BA1E',
  },
  {
    id: 'revenue',
    title: '收益价值评估系统',
    icon: 'LineChartOutlined',
    description: '房产投资收益分析与价值评估',
    color: '#F5222D',
  },
];

// 操作日志数据
export const operationLogs = [
  {
    key: '1',
    user: '管理员',
    action: '添加新楼盘「金茂府」',
    time: '2023-05-15 14:30',
    status: 'success',
  },
  {
    key: '2',
    user: '系统',
    action: '自动加密用户数据',
    time: '2023-05-15 13:00',
    status: 'success',
  },
  {
    key: '3',
    user: '张三',
    action: '查询房产「万科城B座202室」评估报告',
    time: '2023-05-15 10:15',
    status: 'success',
  },
  {
    key: '4',
    user: '李四',
    action: '上传电子凭证',
    time: '2023-05-15 09:45',
    status: 'success',
  },
  {
    key: '5',
    user: '王五',
    action: '更新楼盘「保利花园」信息',
    time: '2023-05-14 16:20',
    status: 'success',
  },
];

// 模拟API请求延迟
export const delay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 模拟API调用
export const api = {
  // 获取收益评估数据
  getRevenueEvaluation: async () => {
    await delay();
    return revenueEvaluationData;
  },

  // 获取电子凭证数据
  getElectronicCertificates: async () => {
    await delay();
    return electronicCertData;
  },

  // 获取仪表盘统计数据
  getDashboardStats: async () => {
    await delay();
    return dashboardStats;
  },

  // 获取楼盘数据
  getBuildingData: async (buildingId) => {
    await delay();
    return buildingData[buildingId] || null;
  },
};
