import { PropertyInfo, ValuationResult } from '../utils/valuationAlgorithms';
import { ValuationModel } from './ValuationModelService';

// 历史记录类型定义
export interface HistoryRecord {
  id: string;
  property: PropertyInfo;
  results: ValuationResult[];
  models: ValuationModel[];
  averagePrice: number;
  averageUnitPrice: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  notes: string;
}

export interface HistoryQueryParams {
  city?: string;
  district?: string;
  startDate?: Date;
  endDate?: Date;
  minPrice?: number;
  maxPrice?: number;
  buildingType?: string;
  tags?: string[];
  algorithm?: string;
  page?: number;
  pageSize?: number;
}

export interface HistoryComparisonResult {
  records: HistoryRecord[];
  comparison: {
    priceChange: number;
    unitPriceChange: number;
    priceChangePercentage: number;
    unitPriceChangePercentage: number;
    period: {
      start: Date;
      end: Date;
      days: number;
    };
    averagePriceTrend: {
      date: Date;
      price: number;
      unitPrice: number;
    }[];
  };
}

export interface HistoryStatistics {
  totalRecords: number;
  cities: string[];
  districts: string[];
  buildingTypes: string[];
  algorithms: string[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  monthlyTrend: {
    month: string;
    count: number;
    averagePrice: number;
  }[];
  algorithmDistribution: {
    algorithm: string;
    count: number;
    percentage: number;
  }[];
}

export class HistoryDataService {
  private storageKey = 'valuation-history-records';

  // 获取所有历史记录
  getAllRecords(): HistoryRecord[] {
    const recordsJson = localStorage.getItem(this.storageKey);
    if (!recordsJson) {
      return [];
    }

    try {
      const records = JSON.parse(recordsJson);
      // 将字符串日期转换为Date对象
      return records.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        results: record.results.map((result: any) => ({
          ...result,
          timestamp: new Date(result.timestamp),
        })),
        models: record.models.map((model: any) => ({
          ...model,
          createdAt: new Date(model.createdAt),
          updatedAt: new Date(model.updatedAt),
        })),
      }));
    } catch (error) {
      console.error('Failed to parse history records:', error);
      return [];
    }
  }

  // 保存历史记录
  saveRecord(
    record: Omit<HistoryRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): HistoryRecord {
    const records = this.getAllRecords();

    const newRecord: HistoryRecord = {
      ...record,
      id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    records.push(newRecord);
    localStorage.setItem(this.storageKey, JSON.stringify(records));

    return newRecord;
  }

  // 根据ID获取记录
  getRecordById(id: string): HistoryRecord | null {
    const records = this.getAllRecords();
    return records.find((record) => record.id === id) || null;
  }

  // 更新记录
  updateRecord(
    id: string,
    updates: Partial<HistoryRecord>
  ): HistoryRecord | null {
    const records = this.getAllRecords();
    const index = records.findIndex((record) => record.id === id);

    if (index === -1) {
      return null;
    }

    const updatedRecord: HistoryRecord = {
      ...records[index],
      ...updates,
      updatedAt: new Date(),
    };

    records[index] = updatedRecord;
    localStorage.setItem(this.storageKey, JSON.stringify(records));

    return updatedRecord;
  }

  // 删除记录
  deleteRecord(id: string): boolean {
    const records = this.getAllRecords();
    const filteredRecords = records.filter((record) => record.id !== id);

    if (filteredRecords.length === records.length) {
      return false;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(filteredRecords));
    return true;
  }

  // 批量删除记录
  deleteRecords(ids: string[]): boolean {
    const records = this.getAllRecords();
    const filteredRecords = records.filter(
      (record) => !ids.includes(record.id)
    );

    if (filteredRecords.length === records.length) {
      return false;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(filteredRecords));
    return true;
  }

  // 清空所有记录
  clearAllRecords(): boolean {
    localStorage.removeItem(this.storageKey);
    return true;
  }

  // 查询历史记录
  queryRecords(params: HistoryQueryParams): {
    records: HistoryRecord[];
    total: number;
    page: number;
    pageSize: number;
  } {
    let records = this.getAllRecords();

    // 应用过滤条件
    if (params.city) {
      records = records.filter(
        (record) => record.property.city === params.city
      );
    }

    if (params.district) {
      records = records.filter(
        (record) => record.property.district === params.district
      );
    }

    if (params.startDate) {
      records = records.filter(
        (record) => record.createdAt >= params.startDate!
      );
    }

    if (params.endDate) {
      records = records.filter((record) => record.createdAt <= params.endDate!);
    }

    if (params.minPrice !== undefined) {
      records = records.filter(
        (record) => record.averagePrice >= params.minPrice!
      );
    }

    if (params.maxPrice !== undefined) {
      records = records.filter(
        (record) => record.averagePrice <= params.maxPrice!
      );
    }

    if (params.buildingType) {
      records = records.filter(
        (record) => record.property.buildingType === params.buildingType
      );
    }

    if (params.tags && params.tags.length > 0) {
      records = records.filter((record) =>
        params.tags!.some((tag) => record.tags.includes(tag))
      );
    }

    if (params.algorithm) {
      records = records.filter((record) =>
        record.results.some((result) => result.algorithm === params.algorithm)
      );
    }

    // 排序（默认按创建时间倒序）
    records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 分页
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRecords = records.slice(startIndex, endIndex);

    return {
      records: paginatedRecords,
      total: records.length,
      page,
      pageSize,
    };
  }

  // 对比历史记录
  compareRecords(recordIds: string[]): HistoryComparisonResult | null {
    const records = recordIds
      .map((id) => this.getRecordById(id))
      .filter((record): record is HistoryRecord => record !== null);

    if (records.length < 2) {
      return null;
    }

    // 按时间排序
    const sortedRecords = [...records].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );

    const firstRecord = sortedRecords[0];
    const lastRecord = sortedRecords[sortedRecords.length - 1];

    // 计算价格变化
    const priceChange = lastRecord.averagePrice - firstRecord.averagePrice;
    const unitPriceChange =
      lastRecord.averageUnitPrice - firstRecord.averageUnitPrice;
    const priceChangePercentage = Math.round(
      (priceChange / firstRecord.averagePrice) * 100
    );
    const unitPriceChangePercentage = Math.round(
      (unitPriceChange / firstRecord.averageUnitPrice) * 100
    );

    // 计算时间周期
    const startDate = firstRecord.createdAt;
    const endDate = lastRecord.createdAt;
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 生成价格趋势
    const averagePriceTrend = sortedRecords.map((record) => ({
      date: record.createdAt,
      price: record.averagePrice,
      unitPrice: record.averageUnitPrice,
    }));

    return {
      records: sortedRecords,
      comparison: {
        priceChange,
        unitPriceChange,
        priceChangePercentage,
        unitPriceChangePercentage,
        period: {
          start: startDate,
          end: endDate,
          days,
        },
        averagePriceTrend,
      },
    };
  }

  // 获取统计信息
  getStatistics(): HistoryStatistics {
    const records = this.getAllRecords();

    if (records.length === 0) {
      return {
        totalRecords: 0,
        cities: [],
        districts: [],
        buildingTypes: [],
        algorithms: [],
        priceRange: {
          min: 0,
          max: 0,
          average: 0,
        },
        monthlyTrend: [],
        algorithmDistribution: [],
      };
    }

    // 提取唯一值
    const cities = Array.from(
      new Set(records.map((record) => record.property.city))
    );
    const districts = Array.from(
      new Set(records.map((record) => record.property.district))
    );
    const buildingTypes = Array.from(
      new Set(records.map((record) => record.property.buildingType))
    );
    const algorithms = Array.from(
      new Set(
        records.flatMap((record) => record.results.map((r) => r.algorithm))
      )
    );

    // 价格范围
    const prices = records.map((record) => record.averagePrice);

    // 月度趋势
    const monthlyMap = new Map<string, { count: number; totalPrice: number }>();
    records.forEach((record) => {
      const monthKey = record.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const current = monthlyMap.get(monthKey) || { count: 0, totalPrice: 0 };
      monthlyMap.set(monthKey, {
        count: current.count + 1,
        totalPrice: current.totalPrice + record.averagePrice,
      });
    });

    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        count: data.count,
        averagePrice: Math.round(data.totalPrice / data.count),
      }));

    // 算法分布
    const algorithmCountMap = new Map<string, number>();
    records.forEach((record) => {
      record.results.forEach((result) => {
        const currentCount = algorithmCountMap.get(result.algorithm) || 0;
        algorithmCountMap.set(result.algorithm, currentCount + 1);
      });
    });

    const totalAlgorithmUses = Array.from(algorithmCountMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const algorithmDistribution = Array.from(algorithmCountMap.entries())
      .map(([algorithm, count]) => ({
        algorithm,
        count,
        percentage: Math.round((count / totalAlgorithmUses) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalRecords: records.length,
      cities,
      districts,
      buildingTypes,
      algorithms,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: Math.round(
          prices.reduce((sum, price) => sum + price, 0) / prices.length
        ),
      },
      monthlyTrend,
      algorithmDistribution,
    };
  }

  // 导出历史记录
  exportRecords(
    format: 'json' | 'csv' | 'excel',
    records?: HistoryRecord[]
  ): string | Blob {
    const data = records || this.getAllRecords();

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      // 生成CSV格式
      const headers = [
        'ID',
        '城市',
        '区域',
        '面积',
        '均价',
        '总价',
        '日期',
        '算法',
      ];
      const rows = data.map((record) => [
        record.id,
        record.property.city,
        record.property.district,
        record.property.area,
        record.averageUnitPrice,
        record.averagePrice,
        record.createdAt.toISOString(),
        record.results.map((r) => r.algorithm).join(';'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      return csvContent;
    } else {
      // Excel格式（简单实现，实际项目中使用专门的库）
      const csvContent = this.exportRecords('csv', records) as string;
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      return blob;
    }
  }

  // 导入历史记录
  importRecords(data: string | Blob): HistoryRecord[] {
    let records: HistoryRecord[] = [];

    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        records = Array.isArray(parsedData) ? parsedData : [parsedData];
      } catch (error) {
        console.error('Failed to parse import data:', error);
        return [];
      }
    } else {
      // Blob处理（实际项目中实现）
      console.error('Blob import not implemented yet');
      return [];
    }

    // 验证和转换数据
    const validRecords = records.map((record) => {
      // 确保日期是Date对象
      const validatedRecord: HistoryRecord = {
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        results: record.results.map((result) => ({
          ...result,
          timestamp: new Date(result.timestamp),
        })),
        models: record.models.map((model) => ({
          ...model,
          createdAt: new Date(model.createdAt),
          updatedAt: new Date(model.updatedAt),
        })),
      };

      // 保存到本地存储
      this.saveRecord(validatedRecord);

      return validatedRecord;
    });

    return validRecords;
  }

  // 添加标签
  addTag(recordId: string, tag: string): HistoryRecord | null {
    const record = this.getRecordById(recordId);
    if (!record) {
      return null;
    }

    if (!record.tags.includes(tag)) {
      return this.updateRecord(recordId, {
        tags: [...record.tags, tag],
      });
    }

    return record;
  }

  // 移除标签
  removeTag(recordId: string, tag: string): HistoryRecord | null {
    const record = this.getRecordById(recordId);
    if (!record) {
      return null;
    }

    if (record.tags.includes(tag)) {
      return this.updateRecord(recordId, {
        tags: record.tags.filter((t) => t !== tag),
      });
    }

    return record;
  }

  // 获取所有标签
  getAllTags(): string[] {
    const records = this.getAllRecords();
    const tags = Array.from(new Set(records.flatMap((record) => record.tags)));
    return tags.sort();
  }
}

// 创建单例实例
export const historyDataService = new HistoryDataService();
