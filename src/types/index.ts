// 湘潭区房产数据类型
export interface XiangtanDistrictData {
  id: number;
  projectName: string;
  buildingArea: number;
  houseType: string;
  district: string;
  decoration: string;
  averagePrice: number;
  createdAt: string;
}

// 导入结果类型
export interface ImportResult {
  total: number;
  imported: number;
  failed: number;
}

// 数据服务请求参数类型
export interface DataListParams {
  page: number;
  pageSize: number;
  search?: string;
  district?: string;
}

export interface AnalysisParams {
  district?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ExportParams {
  format: string;
  type: string;
  district?: string;
  startDate?: Date;
  endDate?: Date;
}

// 数据分析结果类型
export interface AnalysisData {
  charts: {
    districtDistribution: Array<{ type: string; value: number }>;
    priceTrend: Array<{ date: string; price: number }>;
    houseTypeDistribution: Array<{ type: string; value: number }>;
    areaDistribution: Array<{ areaRange: string; count: number }>;
    decorationDistribution: Array<{ type: string; value: number }>;
  };
  summary: {
    totalProjects: number;
    averagePrice: number;
    totalArea: number;
    totalRecords: number;
  };
}

// 数据列表返回结果类型
export interface DataListResult {
  data: XiangtanDistrictData[];
  total: number;
  page: number;
  pageSize: number;
}
