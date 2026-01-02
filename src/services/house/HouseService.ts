import apiClient from '../utils/apiClient';
import { Coordinates } from '../map/MapService';

export interface HouseProperty {
  id: string;
  title: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  area: number;
  buildingType: string;
  constructionYear: number;
  floor: number;
  totalFloors: number;
  orientation: string;
  decorationLevel: string;
  lotRatio: number;
  greenRatio: number;
  nearbyFacilities: string[];
  price: number;
  unitPrice: number;
  status: string;
  createTime: string;
  updateTime: string;
  tags: string[];
  images: string[];
  videoUrl?: string;
  floorPlanUrl?: string;
  propertyType: string;
  ownership: string;
  heating: string;
  elevator: boolean;
  parkingSpace: number;
  propertyRightYears: number;
}

export interface HouseSearchParams {
  keyword?: string;
  city?: string;
  district?: string;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  buildingType?: string;
  decorationLevel?: string;
  orientation?: string;
  minConstructionYear?: number;
  maxConstructionYear?: number;
  hasElevator?: boolean;
  heating?: string;
  sortBy?: 'price' | 'area' | 'constructionYear' | 'createTime';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  propertyType?: string;
  nearbyFacilities?: string[];
  ownership?: string;
}

export interface HouseSearchResult {
  properties: HouseProperty[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HouseStatistics {
  totalProperties: number;
  avgPrice: number;
  avgArea: number;
  priceRange: {
    min: number;
    max: number;
    avg: number;
  };
  areaRange: {
    min: number;
    max: number;
    avg: number;
  };
  buildingTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  decorationLevelDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

export class HouseService {
  private static instance: HouseService;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  // 获取单例实例
  public static getInstance(): HouseService {
    if (!HouseService.instance) {
      HouseService.instance = new HouseService();
    }
    return HouseService.instance;
  }

  // 获取房源详情
  async getPropertyDetail(id: string): Promise<HouseProperty> {
    try {
      const response = await apiClient.get<HouseProperty>(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取房源详情失败:', error);
      throw error;
    }
  }

  // 搜索房源
  async searchProperties(params: HouseSearchParams): Promise<HouseSearchResult> {
    try {
      const response = await apiClient.get<HouseSearchResult>('/api/properties/search', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('搜索房源失败:', error);
      throw error;
    }
  }

  // 创建房源
  async createProperty(property: Omit<HouseProperty, 'id' | 'createTime' | 'updateTime'>): Promise<HouseProperty> {
    try {
      const response = await apiClient.post<HouseProperty>('/api/properties', property);
      return response.data;
    } catch (error) {
      console.error('创建房源失败:', error);
      throw error;
    }
  }

  // 更新房源
  async updateProperty(id: string, property: Partial<HouseProperty>): Promise<HouseProperty> {
    try {
      const response = await apiClient.put<HouseProperty>(`/api/properties/${id}`, property);
      return response.data;
    } catch (error) {
      console.error('更新房源失败:', error);
      throw error;
    }
  }

  // 删除房源
  async deleteProperty(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/api/properties/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('删除房源失败:', error);
      throw error;
    }
  }

  // 批量删除房源
  async batchDeleteProperties(ids: string[]): Promise<{
    success: boolean;
    deletedCount: number;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        deletedCount: number;
      }>('/api/properties/batch-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('批量删除房源失败:', error);
      throw error;
    }
  }

  // 获取相似房源
  async getSimilarProperties(id: string, limit: number = 10): Promise<HouseProperty[]> {
    try {
      const response = await apiClient.get<HouseProperty[]>(`/api/properties/${id}/similar`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('获取相似房源失败:', error);
      throw error;
    }
  }

  // 获取房源统计信息
  async getPropertyStatistics(params?: {
    city?: string;
    district?: string;
    buildingType?: string;
  }): Promise<HouseStatistics> {
    try {
      const response = await apiClient.get<HouseStatistics>('/api/properties/statistics', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('获取房源统计信息失败:', error);
      throw error;
    }
  }

  // 收藏房源
  async favoriteProperty(id: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`/api/properties/${id}/favorite`);
      return response.data.success;
    } catch (error) {
      console.error('收藏房源失败:', error);
      throw error;
    }
  }

  // 取消收藏房源
  async unfavoriteProperty(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/api/properties/${id}/favorite`);
      return response.data.success;
    } catch (error) {
      console.error('取消收藏房源失败:', error);
      throw error;
    }
  }

  // 获取收藏的房源
  async getFavoriteProperties(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<HouseSearchResult> {
    try {
      const response = await apiClient.get<HouseSearchResult>('/api/properties/favorites', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('获取收藏的房源失败:', error);
      throw error;
    }
  }

  // 检查房源是否已收藏
  async isFavoriteProperty(id: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ isFavorite: boolean }>(`/api/properties/${id}/is-favorite`);
      return response.data.isFavorite;
    } catch (error) {
      console.error('检查房源是否已收藏失败:', error);
      throw error;
    }
  }

  // 上传房源图片
  async uploadPropertyImages(propertyId: string, images: File[]): Promise<{
    success: boolean;
    imageUrls: string[];
  }> {
    try {
      const formData = new FormData();
      images.forEach(image => formData.append('images', image));
      
      const response = await apiClient.post<{
        success: boolean;
        imageUrls: string[];
      }>(`/api/properties/${propertyId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('上传房源图片失败:', error);
      throw error;
    }
  }

  // 删除房源图片
  async deletePropertyImage(propertyId: string, imageUrl: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/api/properties/${propertyId}/images`, {
        data: { imageUrl },
      });
      return response.data.success;
    } catch (error) {
      console.error('删除房源图片失败:', error);
      throw error;
    }
  }

  // 获取热门房源
  async getHotProperties(limit: number = 10, city?: string): Promise<HouseProperty[]> {
    try {
      const response = await apiClient.get<HouseProperty[]>('/api/properties/hot', {
        params: { limit, city },
      });
      return response.data;
    } catch (error) {
      console.error('获取热门房源失败:', error);
      throw error;
    }
  }

  // 获取最新房源
  async getLatestProperties(limit: number = 10, city?: string): Promise<HouseProperty[]> {
    try {
      const response = await apiClient.get<HouseProperty[]>('/api/properties/latest', {
        params: { limit, city },
      });
      return response.data;
    } catch (error) {
      console.error('获取最新房源失败:', error);
      throw error;
    }
  }

  // 获取房源类型列表
  async getPropertyTypes(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/properties/types');
      return response.data;
    } catch (error) {
      console.error('获取房源类型列表失败:', error);
      throw error;
    }
  }

  // 获取建筑类型列表
  async getBuildingTypes(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/properties/building-types');
      return response.data;
    } catch (error) {
      console.error('获取建筑类型列表失败:', error);
      throw error;
    }
  }

  // 获取装修等级列表
  async getDecorationLevels(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/properties/decoration-levels');
      return response.data;
    } catch (error) {
      console.error('获取装修等级列表失败:', error);
      throw error;
    }
  }

  // 获取朝向列表
  async getOrientations(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/properties/orientations');
      return response.data;
    } catch (error) {
      console.error('获取朝向列表失败:', error);
      throw error;
    }
  }

  // 获取供暖方式列表
  async getHeatingTypes(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/properties/heating-types');
      return response.data;
    } catch (error) {
      console.error('获取供暖方式列表失败:', error);
      throw error;
    }
  }
}

// 创建并导出单例实例
const houseService = HouseService.getInstance();

export default houseService;
export { HouseService };