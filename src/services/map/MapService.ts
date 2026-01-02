import apiClient from '../utils/apiClient';
import { useMapLoader } from '../../hooks/useMapLoader';

export interface AddressInfo {
  province: string;
  city: string;
  district: string;
  street: string;
  building: string;
  houseNumber: string;
  formattedAddress: string;
}

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  addressInfo: AddressInfo;
  confidence: number;
}

export interface ReverseGeocodeResult {
  addressInfo: AddressInfo;
  formattedAddress: string;
  poi?: Array<{
    name: string;
    type: string;
    coordinates: Coordinates;
    distance: number;
  }>;
}

export interface DistanceResult {
  distance: number;
  duration: number;
  origin: Coordinates;
  destination: Coordinates;
}

export interface DistrictInfo {
  adcode: string;
  name: string;
  center: Coordinates;
  level: string;
  citycode: string;
}

export class MapService {
  private static instance: MapService;

  private constructor() {
    // 私有构造函数，防止外部实例化
  }

  // 获取单例实例
  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }
    return MapService.instance;
  }

  // 地理编码：地址转坐标
  async geocode(address: string): Promise<GeocodeResult> {
    try {
      const response = await apiClient.get<GeocodeResult>('/api/map/geocode', {
        params: { address },
      });
      return response.data;
    } catch (error) {
      console.error('地理编码失败:', error);
      throw error;
    }
  }

  // 逆地理编码：坐标转地址
  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodeResult> {
    try {
      const response = await apiClient.get<ReverseGeocodeResult>('/api/map/reverse-geocode', {
        params: {
          lng: coordinates.lng,
          lat: coordinates.lat,
        },
      });
      return response.data;
    } catch (error) {
      console.error('逆地理编码失败:', error);
      throw error;
    }
  }

  // 批量地理编码
  async batchGeocode(addresses: string[]): Promise<Array<{
    address: string;
    result: GeocodeResult | null;
    error?: string;
  }>> {
    try {
      const response = await apiClient.post<Array<{
        address: string;
        result: GeocodeResult | null;
        error?: string;
      }>>('/api/map/batch-geocode', {
        addresses,
      });
      return response.data;
    } catch (error) {
      console.error('批量地理编码失败:', error);
      throw error;
    }
  }

  // 计算两点之间的距离和驾车时间
  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<DistanceResult> {
    try {
      const response = await apiClient.get<DistanceResult>('/api/map/distance', {
        params: {
          origin: `${origin.lng},${origin.lat}`,
          destination: `${destination.lng},${destination.lat}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('计算距离失败:', error);
      throw error;
    }
  }

  // 获取行政区划信息
  async getDistricts(adcode?: string): Promise<DistrictInfo[]> {
    try {
      const response = await apiClient.get<DistrictInfo[]>('/api/map/districts', {
        params: adcode ? { adcode } : {},
      });
      return response.data;
    } catch (error) {
      console.error('获取行政区划信息失败:', error);
      throw error;
    }
  }

  // 根据IP获取当前位置
  async getLocationByIP(): Promise<{
    coordinates: Coordinates;
    addressInfo: AddressInfo;
    city: string;
  }> {
    try {
      const response = await apiClient.get<{
        coordinates: Coordinates;
        addressInfo: AddressInfo;
        city: string;
      }>('/api/map/ip-location');
      return response.data;
    } catch (error) {
      console.error('根据IP获取位置失败:', error);
      throw error;
    }
  }

  // 搜索周边POI
  async searchPOI(
    keywords: string,
    coordinates: Coordinates,
    radius: number = 1000,
    types?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    pois: Array<{
      id: string;
      name: string;
      type: string;
      address: string;
      coordinates: Coordinates;
      distance: number;
      tel?: string;
      businessArea?: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get<{
        pois: Array<{
          id: string;
          name: string;
          type: string;
          address: string;
          coordinates: Coordinates;
          distance: number;
          tel?: string;
          businessArea?: string;
        }>;
        total: number;
        page: number;
        pageSize: number;
      }>('/api/map/poi-search', {
        params: {
          keywords,
          location: `${coordinates.lng},${coordinates.lat}`,
          radius,
          types,
          page,
          pageSize,
        },
      });
      return response.data;
    } catch (error) {
      console.error('搜索周边POI失败:', error);
      throw error;
    }
  }

  // 地址标准化
  async standardizeAddress(address: string): Promise<{
    standardizedAddress: string;
    addressInfo: AddressInfo;
    confidence: number;
  }> {
    try {
      const response = await apiClient.get<{
        standardizedAddress: string;
        addressInfo: AddressInfo;
        confidence: number;
      }>('/api/map/standardize-address', {
        params: { address },
      });
      return response.data;
    } catch (error) {
      console.error('地址标准化失败:', error);
      throw error;
    }
  }

  // 坐标转换
  async convertCoordinates(
    coordinates: Coordinates,
    from: string = 'gps',
    to: string = 'gcj02'
  ): Promise<Coordinates> {
    try {
      const response = await apiClient.get<Coordinates>('/api/map/convert-coordinates', {
        params: {
          lng: coordinates.lng,
          lat: coordinates.lat,
          from,
          to,
        },
      });
      return response.data;
    } catch (error) {
      console.error('坐标转换失败:', error);
      throw error;
    }
  }

  // 批量坐标转换
  async batchConvertCoordinates(
    coordinates: Coordinates[],
    from: string = 'gps',
    to: string = 'gcj02'
  ): Promise<Coordinates[]> {
    try {
      const response = await apiClient.post<Coordinates[]>('/api/map/batch-convert-coordinates', {
        coordinates,
        from,
        to,
      });
      return response.data;
    } catch (error) {
      console.error('批量坐标转换失败:', error);
      throw error;
    }
  }
}

// 创建并导出单例实例
const mapService = MapService.getInstance();

export default mapService;
export { MapService, useMapLoader };