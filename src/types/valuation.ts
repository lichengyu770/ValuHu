// 房产估价相关类型定义

/**
 * 估价结果类型
 */
export interface ValuationResult {
  id: string;
  totalValue: number;
  unitPrice: number;
  algorithm: string;
  factors: Array<{ name: string; value: number; weight: number }>;
  algorithmWeights: Array<{ name: string; weight: number; resultPrice: number }>;
  timestamp: Date;
}

/**
 * 估价模板参数类型
 */
export interface TemplateParams {
  [key: string]: string | number | boolean | string[];
}

/**
 * 估价模板类型
 */
export interface Template {
  id: string;
  name: string;
  params: TemplateParams;
  createdAt: Date;
  description?: string;
  matchScore?: number;
}

/**
 * 智能建议参数类型
 */
export interface SmartSuggestionParams {
  [key: string]: string | number | boolean;
}

/**
 * 智能建议类型
 */
export interface SmartSuggestion {
  id: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  params: SmartSuggestionParams;
}

/**
 * 估价参数类型
 */
export interface ValuationParams {
  area: number;
  location: string;
  buildingType: string;
  constructionYear: number;
  floor: number;
  totalFloors: number;
  orientation: string;
  decorationLevel: string;
  lotRatio: number;
  greenRatio: number;
  valuationMethod: string;
  nearbyFacilities: string[];
  [key: string]: string | number | string[] | undefined;
}

/**
 * 步骤配置类型
 */
export interface StepConfig {
  title: string;
  description: string;
}

/**
 * 表单提交结果类型
 */
export interface FormSubmissionResult {
  success: boolean;
  message: string;
  data?: {
    standardSample: string;
  };
}
