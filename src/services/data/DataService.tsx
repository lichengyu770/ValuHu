import { createContext, useContext, ReactNode } from 'react';
import {
  XiangtanDistrictData,
  DataListResult,
  DataListParams,
  AnalysisParams,
  AnalysisData,
  ExportParams,
  ImportResult
} from '../../types';

// 模拟数据
const mockData: XiangtanDistrictData[] = [
  {
    id: 1,
    projectName: '步步高九华新天地',
    buildingArea: 92.3,
    houseType: '3室2厅',
    district: '九华-管委会',
    decoration: '简装',
    averagePrice: 6300,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 2,
    projectName: '步步高九华新天地',
    buildingArea: 118.7,
    houseType: '4室2厅',
    district: '九华-管委会',
    decoration: '精装',
    averagePrice: 7000,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 3,
    projectName: '步步高九华新天地',
    buildingArea: 81.5,
    houseType: '2室2厅',
    district: '九华-管委会',
    decoration: '毛坯',
    averagePrice: 5500,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 4,
    projectName: '步步高新天地',
    buildingArea: 98.6,
    houseType: '3室2厅',
    district: '岳塘区',
    decoration: '简装',
    averagePrice: 6100,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 5,
    projectName: '昭山新城',
    buildingArea: 125.8,
    houseType: '4室3厅',
    district: '昭山示范区',
    decoration: '精装',
    averagePrice: 7500,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 6,
    projectName: '湘潭碧桂园',
    buildingArea: 105.2,
    houseType: '3室2厅',
    district: '湘潭县',
    decoration: '简装',
    averagePrice: 5800,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 7,
    projectName: '雨湖花园',
    buildingArea: 88.9,
    houseType: '2室1厅',
    district: '雨湖区',
    decoration: '毛坯',
    averagePrice: 5200,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 8,
    projectName: '雨湖花园',
    buildingArea: 112.4,
    houseType: '3室2厅',
    district: '雨湖区',
    decoration: '精装',
    averagePrice: 6800,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 9,
    projectName: '昭山湖畔',
    buildingArea: 138.5,
    houseType: '4室2厅',
    district: '昭山示范区',
    decoration: '豪装',
    averagePrice: 8200,
    createdAt: '2025-12-26T10:00:00Z'
  },
  {
    id: 10,
    projectName: '湘潭县中心广场',
    buildingArea: 95.3,
    houseType: '3室2厅',
    district: '湘潭县',
    decoration: '简装',
    averagePrice: 5600,
    createdAt: '2025-12-26T10:00:00Z'
  }
];

// DataService 接口
interface DataService {
  getDataList(params: DataListParams): Promise<DataListResult>;
  getDataByID(id: number): Promise<XiangtanDistrictData>;
  createData(data: Partial<XiangtanDistrictData>): Promise<XiangtanDistrictData>;
  updateData(id: number, data: Partial<XiangtanDistrictData>): Promise<XiangtanDistrictData>;
  deleteData(id: number): Promise<boolean>;
  getAnalysisData(params: AnalysisParams): Promise<AnalysisData>;
  exportData(params: ExportParams): Promise<Blob>;
  importCSV(file: File): Promise<ImportResult>;
}

// DataService 实现
class MockDataService implements DataService {
  // 获取数据列表
  async getDataList(params: DataListParams): Promise<DataListResult> {
    let filteredData = [...mockData];
    
    // 应用搜索过滤
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredData = filteredData.filter(item => 
        item.projectName.toLowerCase().includes(searchLower) ||
        item.district.toLowerCase().includes(searchLower)
      );
    }
    
    // 应用区域过滤
    if (params.district) {
      filteredData = filteredData.filter(item => item.district === params.district);
    }
    
    // 应用分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize
    };
  }
  
  // 根据ID获取数据
  async getDataByID(id: number): Promise<XiangtanDistrictData> {
    const item = mockData.find(item => item.id === id);
    if (!item) {
      throw new Error('数据不存在');
    }
    return item;
  }
  
  // 创建数据
  async createData(data: Partial<XiangtanDistrictData>): Promise<XiangtanDistrictData> {
    const newItem: XiangtanDistrictData = {
      id: mockData.length + 1,
      projectName: data.projectName || '',
      buildingArea: data.buildingArea || 0,
      houseType: data.houseType || '',
      district: data.district || '',
      decoration: data.decoration || '',
      averagePrice: data.averagePrice || 0,
      createdAt: new Date().toISOString()
    };
    mockData.push(newItem);
    return newItem;
  }
  
  // 更新数据
  async updateData(id: number, data: Partial<XiangtanDistrictData>): Promise<XiangtanDistrictData> {
    const index = mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('数据不存在');
    }
    
    const updatedItem = {
      ...mockData[index],
      ...data
    };
    mockData[index] = updatedItem;
    return updatedItem;
  }
  
  // 删除数据
  async deleteData(id: number): Promise<boolean> {
    const index = mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('数据不存在');
    }
    
    mockData.splice(index, 1);
    return true;
  }
  
  // 获取分析数据
  async getAnalysisData(params: AnalysisParams): Promise<AnalysisData> {
    let filteredData = [...mockData];
    
    // 应用区域过滤
    if (params.district) {
      filteredData = filteredData.filter(item => item.district === params.district);
    }
    
    // 计算区域分布
    const districtDistribution = this.calculateDistrictDistribution(filteredData);
    
    // 计算户型分布
    const houseTypeDistribution = this.calculateHouseTypeDistribution(filteredData);
    
    // 计算装修情况分布
    const decorationDistribution = this.calculateDecorationDistribution(filteredData);
    
    // 计算面积分布
    const areaDistribution = this.calculateAreaDistribution(filteredData);
    
    // 模拟价格趋势数据
    const priceTrend = this.generatePriceTrend();
    
    // 计算汇总数据
    const summary = this.calculateSummary(filteredData);
    
    return {
      charts: {
        districtDistribution,
        priceTrend,
        houseTypeDistribution,
        areaDistribution,
        decorationDistribution
      },
      summary
    };
  }
  
  // 导出数据
  async exportData(params: ExportParams): Promise<Blob> {
    // 模拟导出过程
    return new Blob(['模拟导出的数据'], { type: 'text/csv' });
  }
  
  // 导入CSV数据
  async importCSV(file: File): Promise<ImportResult> {
    // 模拟导入过程
    return {
      total: 10,
      imported: 8,
      failed: 2
    };
  }
  
  // 计算区域分布
  private calculateDistrictDistribution(data: XiangtanDistrictData[]): Array<{ type: string; value: number }> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      distribution[item.district] = (distribution[item.district] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([type, value]) => ({ type, value }));
  }
  
  // 计算户型分布
  private calculateHouseTypeDistribution(data: XiangtanDistrictData[]): Array<{ type: string; value: number }> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      distribution[item.houseType] = (distribution[item.houseType] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([type, value]) => ({ type, value }));
  }
  
  // 计算装修情况分布
  private calculateDecorationDistribution(data: XiangtanDistrictData[]): Array<{ type: string; value: number }> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      distribution[item.decoration] = (distribution[item.decoration] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([type, value]) => ({ type, value }));
  }
  
  // 计算面积分布
  private calculateAreaDistribution(data: XiangtanDistrictData[]): Array<{ areaRange: string; count: number }> {
    const distribution: Record<string, number> = {
      '0-90': 0,
      '90-120': 0,
      '120-150': 0,
      '150+': 0
    };
    
    data.forEach(item => {
      if (item.buildingArea < 90) {
        distribution['0-90']++;
      } else if (item.buildingArea < 120) {
        distribution['90-120']++;
      } else if (item.buildingArea < 150) {
        distribution['120-150']++;
      } else {
        distribution['150+']++;
      }
    });
    
    return Object.entries(distribution).map(([areaRange, count]) => ({ areaRange, count }));
  }
  
  // 生成价格趋势数据
  private generatePriceTrend(): Array<{ date: string; price: number }> {
    return [
      { date: '2025-01', price: 6500 },
      { date: '2025-02', price: 6550 },
      { date: '2025-03', price: 6600 },
      { date: '2025-04', price: 6700 },
      { date: '2025-05', price: 6750 },
      { date: '2025-06', price: 6800 },
      { date: '2025-07', price: 6850 },
      { date: '2025-08', price: 6900 },
      { date: '2025-09', price: 6950 },
      { date: '2025-10', price: 7000 },
      { date: '2025-11', price: 7050 },
      { date: '2025-12', price: 7100 }
    ];
  }
  
  // 计算汇总数据
  private calculateSummary(data: XiangtanDistrictData[]): AnalysisData['summary'] {
    const totalProjects = new Set(data.map(item => item.projectName)).size;
    const totalRecords = data.length;
    const totalArea = data.reduce((sum, item) => sum + item.buildingArea, 0);
    const averagePrice = totalRecords > 0 ? 
      Math.round(data.reduce((sum, item) => sum + item.averagePrice, 0) / totalRecords) : 0;
    
    return {
      totalProjects,
      averagePrice,
      totalArea: parseFloat(totalArea.toFixed(2)),
      totalRecords
    };
  }
}

// 创建上下文
const DataServiceContext = createContext<DataService | undefined>(undefined);

// 上下文提供者组件
interface DataServiceProviderProps {
  children: ReactNode;
}

export const DataServiceProvider = ({ children }: DataServiceProviderProps) => {
  const dataService = new MockDataService();
  
  return (
    <DataServiceContext.Provider value={dataService}>
      {children}
    </DataServiceContext.Provider>
  );
};

// 自定义Hook
export const useDataService = (): DataService => {
  const context = useContext(DataServiceContext);
  if (context === undefined) {
    throw new Error('useDataService must be used within a DataServiceProvider');
  }
  return context;
};
