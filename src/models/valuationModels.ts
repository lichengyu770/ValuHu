// 估价相关数据模型定义

/**
 * 估价参数模型
 */
export interface ValuationParams {
  area: number; // 建筑面积（平方米）
  location: string; // 地理位置（区域代码）
  buildingType: string; // 建筑类型（住宅、商业、工业等）
  constructionYear: number; // 建成年份
  floor: number; // 所在楼层
  totalFloors: number; // 总楼层
  orientation: string; // 朝向
  decorationLevel: string; // 装修等级
  lotRatio: number; // 容积率
  greenRatio: number; // 绿化率
  nearbyFacilities: Array<string>; // 周边配套设施
  valuationMethod: string; // 估价方法
}

/**
 * 可比案例模型
 */
export interface ComparableProperty {
  propertyId: string;
  area: number;
  location: string;
  buildingType: string;
  constructionYear: number;
  transactionPrice: number;
  transactionDate: Date;
  adjustmentFactor: number;
  adjustedPrice: number;
}

/**
 * 趋势分析模型
 */
export interface TrendAnalysis {
  monthlyTrend: Array<{ month: string; price: number }>;
  annualTrend: Array<{ year: number; price: number }>;
  forecast: Array<{ period: string; price: number }>;
}

/**
 * 估价结果模型
 */
export interface ValuationResult {
  propertyId: string; // 房产ID
  valuationDate: Date; // 估价日期
  totalValue: number; // 总估价（元）
  unitPrice: number; // 单价（元/㎡）
  valuationMethod: string; // 估价方法
  confidence: number; // 置信度（%）
  factors: Record<string, number>; // 影响因素分析
  comparableProperties: ComparableProperty[]; // 可比案例
  trendAnalysis: TrendAnalysis; // 趋势分析
  evaluationDetails: Record<string, any>; // 详细评估报告
}

/**
 * 房产基本信息模型
 */
export interface PropertyInfo {
  propertyId: string;
  propertyName?: string;
  address?: string;
  owner?: string;
  propertyType?: string;
  certificateNumber?: string;
}

/**
 * 估价历史记录模型
 */
export interface ValuationHistory {
  historyId: string; // 历史记录ID
  propertyInfo: PropertyInfo; // 房产基本信息
  valuationParams: ValuationParams; // 估价参数
  valuationResult: ValuationResult; // 估价结果
  createdAt: Date; // 创建时间
  updatedAt: Date; // 更新时间
}

/**
 * 下拉选项模型
 */
export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// 估价参数默认值
export const defaultValuationParams: ValuationParams = {
  area: 100,
  location: 'yuelu',
  buildingType: '住宅',
  constructionYear: new Date().getFullYear() - 10,
  floor: 5,
  totalFloors: 18,
  orientation: '南北',
  decorationLevel: '中等',
  lotRatio: 2.5,
  greenRatio: 35,
  nearbyFacilities: ['地铁', '学校', '医院', '商场'],
  valuationMethod: '市场比较法',
};

// 区域修正系数
export const areaCorrectionFactors: Record<string, number> = {
  // 核心区域
  xjang: 1.0, // 湘江新区
  furong: 1.26, // 芙蓉区
  yuelu: 0.896, // 岳麓区
  tianxin: 1.088, // 天心区
  kaifu: 1.136, // 开福区

  // 扩展区域
  yuhua: 1.12, // 雨花区
  wangcheng: 0.85, // 望城区
  changsha_county: 0.92, // 长沙县
  ningxiang: 0.78, // 宁乡市
  liuyang: 0.75, // 浏阳市

  // 新增区域（示例）
  chengdu: 0.95, // 成都市
  beijing: 2.1, // 北京市
  shanghai: 2.3, // 上海市
  guangzhou: 1.8, // 广州市
  shenzhen: 2.5, // 深圳市
};

// 建筑类型修正系数
export const buildingTypeCorrectionFactors: Record<string, number> = {
  住宅: 1.0,
  商业: 1.8,
  办公: 1.5,
  工业: 0.8,
  别墅: 2.0,
  公寓: 0.95,
  写字楼: 1.45,
  商铺: 2.2,
  仓库: 0.7,
  厂房: 0.75,
  酒店: 1.6,
  文旅地产: 1.3,
  养老地产: 1.2,
  物流地产: 0.85,
  教育地产: 1.15,
  医疗地产: 1.35,
  综合体: 2.1,
};

// 装修等级修正系数
export const decorationLevelCorrectionFactors: Record<string, number> = {
  毛坯: 0.8,
  简装: 0.9,
  中等: 1.0,
  精装: 1.1,
  豪华: 1.2,
};

// 朝向修正系数
export const orientationCorrectionFactors: Record<string, number> = {
  南北: 1.0,
  南: 0.95,
  北: 0.85,
  东西: 0.9,
  东: 0.92,
  西: 0.88,
  东南: 0.98,
  西南: 0.93,
  东北: 0.9,
  西北: 0.86,
};

// 估价方法列表
export const valuationMethods: SelectOption[] = [
  {
    value: '市场比较法',
    label: '市场比较法',
    description: '基于相似房产的市场成交价格进行比较',
  },
  {
    value: '收益法',
    label: '收益法',
    description: '基于房产未来预期收益进行折现',
  },
  { value: '成本法', label: '成本法', description: '基于房产重置成本进行评估' },
  {
    value: '综合估价法',
    label: '综合估价法',
    description: '结合三种方法的加权平均结果，提高估价准确性',
  },
];

// 建筑类型列表
export const buildingTypes: SelectOption[] = [
  { value: '住宅', label: '住宅' },
  { value: '商业', label: '商业' },
  { value: '办公', label: '办公' },
  { value: '工业', label: '工业' },
  { value: '别墅', label: '别墅' },
  { value: '公寓', label: '公寓' },
  { value: '写字楼', label: '写字楼' },
  { value: '商铺', label: '商铺' },
  { value: '仓库', label: '仓库' },
  { value: '厂房', label: '厂房' },
  { value: '酒店', label: '酒店' },
  { value: '文旅地产', label: '文旅地产' },
  { value: '养老地产', label: '养老地产' },
  { value: '物流地产', label: '物流地产' },
  { value: '教育地产', label: '教育地产' },
  { value: '医疗地产', label: '医疗地产' },
  { value: '综合体', label: '综合体' },
];

// 装修等级列表
export const decorationLevels: SelectOption[] = [
  { value: '毛坯', label: '毛坯' },
  { value: '简装', label: '简装' },
  { value: '中等', label: '中等' },
  { value: '精装', label: '精装' },
  { value: '豪华', label: '豪华' },
];

// 朝向列表
export const orientations: SelectOption[] = [
  { value: '南北', label: '南北' },
  { value: '南', label: '南' },
  { value: '北', label: '北' },
  { value: '东西', label: '东西' },
  { value: '东', label: '东' },
  { value: '西', label: '西' },
  { value: '东南', label: '东南' },
  { value: '西南', label: '西南' },
  { value: '东北', label: '东北' },
  { value: '西北', label: '西北' },
];

// 周边配套设施列表
export const nearbyFacilitiesList: SelectOption[] = [
  { value: '地铁', label: '地铁' },
  { value: '学校', label: '学校' },
  { value: '医院', label: '医院' },
  { value: '商场', label: '商场' },
  { value: '公园', label: '公园' },
  { value: '银行', label: '银行' },
  { value: '餐饮', label: '餐饮' },
  { value: '娱乐', label: '娱乐' },
  { value: '公交', label: '公交' },
  { value: '高速', label: '高速' },
  { value: '机场', label: '机场' },
  { value: '火车站', label: '火车站' },
  { value: '体育馆', label: '体育馆' },
  { value: '图书馆', label: '图书馆' },
  { value: '购物中心', label: '购物中心' },
  { value: '超市', label: '超市' },
];

// 区域列表
export const locations: SelectOption[] = [
  // 核心区域
  { value: 'xjang', label: '湘江新区' },
  { value: 'furong', label: '芙蓉区' },
  { value: 'yuelu', label: '岳麓区' },
  { value: 'tianxin', label: '天心区' },
  { value: 'kaifu', label: '开福区' },

  // 扩展区域
  { value: 'yuhua', label: '雨花区' },
  { value: 'wangcheng', label: '望城区' },
  { value: 'changsha_county', label: '长沙县' },
  { value: 'ningxiang', label: '宁乡市' },
  { value: 'liuyang', label: '浏阳市' },

  // 新增区域（示例）
  { value: 'chengdu', label: '成都市' },
  { value: 'beijing', label: '北京市' },
  { value: 'shanghai', label: '上海市' },
  { value: 'guangzhou', label: '广州市' },
  { value: 'shenzhen', label: '深圳市' },
];

// 楼层修正系数
export const floorCorrectionFactors: Record<string, number> = {
  low: 0.95, // 低楼层（1-3层）
  middle: 1.0, // 中楼层（4-15层）
  high: 0.98, // 高楼层（16层以上）
  top: 0.96, // 顶层
  basement: 0.8, // 地下室
};

// 房龄修正系数
export const ageCorrectionFactors: Record<string, number> = {
  new: 1.1, // 5年以内
  middle: 1.0, // 6-15年
  old: 0.9, // 16-25年
  very_old: 0.8, // 26年以上
};
