import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Select, message, Spin, Row, Col } from 'antd';
import { MapOutlined, SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { apiKeys } from '../config/apiKeys';
import { buildingData } from '../data/mockData';

const { Option } = Select;
const { Search } = Input;

/**
 * 百度地图组件属性接口
 * @interface BaiduMapComponentProps
 */
export interface BaiduMapComponentProps {
  /** 地图高度，默认600px */
  height?: number;
  /** 地图默认缩放级别，默认13 */
  defaultZoom?: number;
  /** 地图默认中心点坐标，默认[116.404, 39.915] */
  defaultCenter?: [number, number];
  /** 是否显示搜索栏，默认true */
  showSearchBar?: boolean;
  /** 是否显示房产标记点，默认true */
  showPropertyMarkers?: boolean;
  /** 是否显示地图控件，默认true */
  showControls?: boolean;
  /** 是否显示热力图，默认false */
  showHeatmap?: boolean;
  /** 房产选择回调函数 */
  onPropertySelect?: (property: Property) => void;
}

/**
 * 房产信息接口
 * @interface Property
 */
export interface Property {
  /** 房产ID */
  id: string;
  /** 房产名称 */
  name: string;
  /** 房产地址 */
  address: string;
  /** 房产类型 */
  type: string;
  /** 房产面积 */
  area: number;
  /** 房产价格 */
  price: number;
  /** 房产坐标 */
  coordinates: [number, number];
  /** 距离，单位公里 */
  distanceKm?: number;
}

/**
 * 标记点选项接口
 * @interface MarkerOptions
 */
export interface MarkerOptions {
  /** 标记点标题 */
  title: string;
  /** 标记点内容 */
  content: string;
  /** 信息窗口宽度 */
  width?: number;
  /** 信息窗口高度 */
  height?: number;
}

// 定义百度地图相关类型
declare global {
  interface Window {
    BMapGL?: any;
    BMap?: any;
    BMapLib?: any;
  }
}

// 动态加载百度地图API脚本
const loadBaiduMapScript = (apiKey: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.BMapGL || window.BMap) {
      resolve(true);
      return;
    }

    // 创建脚本标签
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://api.map.baidu.com/api?v=1.0&&type=webgl&ak=${apiKey}`;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      reject(new Error('百度地图API加载失败'));
    };
    document.head.appendChild(script);
  });
};

/**
 * 百度地图服务类
 * 提供地图初始化、标记点管理、热力图管理等功能
 * @class BaiduMapService
 */
class BaiduMapService {
  /** 地图实例 */
  private mapInstance: any = null;
  /** API密钥 */
  private apiKey: string;
  /** 地图是否加载完成 */
  private mapLoaded: boolean = false;
  /** 热力图层实例 */
  private heatmapLayer: any = null;

  /**
   * 构造函数
   * @param {string} apiKey - 百度地图API密钥
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 初始化地图
  async initMap(mapId: string, options: { zoom: number; center: [number, number] }): Promise<unknown> {
    try {
      // 加载地图脚本
      await loadBaiduMapScript(this.apiKey);
      this.mapLoaded = true;

      // 创建地图实例
      const BMap = window.BMapGL || window.BMap;
      if (!BMap) {
        throw new Error('百度地图API未加载成功');
      }

      const map = new BMap.Map(mapId, {
        enableHighResolution: true,
        enableMapClick: true
      });

      // 设置地图中心点和缩放级别
      const point = new BMap.Point(options.center[0], options.center[1]);
      map.centerAndZoom(point, options.zoom);

      // 启用地图控件
      map.enableScrollWheelZoom(true);
      map.enableKeyboard();
      map.enableDragging();
      map.enableDoubleClickZoom();

      // 添加地图控件
      map.addControl(new BMap.NavigationControl({
        anchor: BMap.ANCHOR_TOP_LEFT,
        type: BMap.NAVIGATION_CONTROL_LARGE
      }));

      map.addControl(new BMap.ScaleControl({
        anchor: BMap.ANCHOR_BOTTOM_LEFT
      }));

      map.addControl(new BMap.OverviewMapControl({
        anchor: BMap.ANCHOR_BOTTOM_RIGHT,
        isOpen: true
      }));

      this.mapInstance = map;
      return map;
    } catch (error) {
      console.error('初始化地图失败:', error);
      throw error;
    }
  }

  // 获取地图实例
  getMapInstance(): unknown {
    return this.mapInstance;
  }

  // 销毁地图
  destroyMap(): void {
    if (this.mapInstance) {
      try {
        this.mapInstance.dispose();
        this.mapInstance = null;
      } catch (error) {
        console.error('销毁地图失败:', error);
      }
    }
  }

  // 添加标记
  addMarker(coordinates: [number, number], options: MarkerOptions, propertyType?: string): void {
    if (!this.mapInstance || !this.mapLoaded) return;

    const BMap = window.BMapGL || window.BMap;
    const point = new BMap.Point(coordinates[0], coordinates[1]);
    
    // 根据房产类型设置不同的标记样式
    let markerIcon = null;
    if (BMap && BMap.Icon) {
      // 定义不同类型房产的图标颜色
      const typeColors = {
        '住宅': '#FF6B6B',
        '商业': '#4ECDC4',
        '办公': '#45B7D1',
        '工业': '#96CEB4',
        '其他': '#FFEAA7'
      };
      
      const color = typeColors[propertyType as keyof typeof typeColors] || '#FFEAA7';
      
      // 创建自定义图标
      markerIcon = new BMap.Icon(
        `https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${color.slice(1)}`,
        new BMap.Size(21, 34),
        {
          anchor: new BMap.Size(10, 30),
          infoWindowAnchor: new BMap.Size(10, 0)
        }
      );
    }
    
    const marker = new BMap.Marker(point, markerIcon ? { icon: markerIcon } : {});
    
    // 添加标记动画效果
    marker.setAnimation(BMap.Animation.DROP);

    // 创建信息窗口
    const infoWindow = new BMap.InfoWindow(options.content, {
      width: options.width || 350,
      height: options.height || 200,
      title: options.title,
      enableAutoPan: true
    });

    // 添加标记点击事件
    marker.addEventListener('click', () => {
      this.mapInstance.openInfoWindow(infoWindow, point);
    });

    // 添加鼠标悬停效果
    marker.addEventListener('mouseover', () => {
      this.mapInstance.setDefaultCursor('pointer');
    });
    
    marker.addEventListener('mouseout', () => {
      this.mapInstance.setDefaultCursor('default');
    });

    // 添加标记到地图
    this.mapInstance.addOverlay(marker);
  }

  // 清除所有覆盖物
  clearOverlays(): void {
    if (this.mapInstance) {
      this.mapInstance.clearOverlays();
      // 移除热力图层
      if (this.heatmapLayer) {
        this.mapInstance.removeOverlay(this.heatmapLayer);
        this.heatmapLayer = null;
      }
    }
  }

  // 添加热力图
  addHeatmap(data: Array<{ lng: number; lat: number; count: number }>): void {
    if (!this.mapInstance || !this.mapLoaded) return;

    const BMapLib = window.BMapLib;
    
    // 检查是否支持热力图
    if (!BMapLib || !BMapLib.HeatmapOverlay) {
      console.error('热力图库未加载');
      return;
    }

    // 创建热力图图层
    if (!this.heatmapLayer) {
      this.heatmapLayer = new BMapLib.HeatmapOverlay({
        radius: 20,
        opacity: 0.6,
        gradient: {
          0.4: 'blue',
          0.65: 'rgb(117,211,248)',
          0.8: 'yellow',
          0.9: 'orange',
          1.0: 'red'
        }
      });
      this.mapInstance.addOverlay(this.heatmapLayer);
    }

    // 设置热力图数据
    this.heatmapLayer.setDataSet({
      data: data,
      max: Math.max(...data.map(item => item.count))
    });
  }

  // 切换热力图可见性
  toggleHeatmap(visible: boolean): void {
    if (this.heatmapLayer) {
      if (visible) {
        this.heatmapLayer.show();
      } else {
        this.heatmapLayer.hide();
      }
    }
  }

  // 移动地图到指定位置
  centerAndZoom(coordinates: [number, number], zoom: number): void {
    if (!this.mapInstance || !this.mapLoaded) return;

    const BMap = window.BMapGL || window.BMap;
    const point = new BMap.Point(coordinates[0], coordinates[1]);
    this.mapInstance.centerAndZoom(point, zoom);
  }

  // 切换地图类型
  setMapType(mapType: string): void {
    if (!this.mapInstance || !this.mapLoaded) return;

    const BMap = window.BMapGL || window.BMap;
    if (BMap) {
      switch (mapType) {
        case 'roadmap':
          if (BMap.MapTypeControl && this.mapInstance.setMapType) {
            this.mapInstance.setMapType(BMap.MAP_TYPE_NORMAL);
          }
          break;
        case 'satellite':
          if (BMap.MapTypeControl && this.mapInstance.setMapType) {
            this.mapInstance.setMapType(BMap.MAP_TYPE_SATELLITE);
          }
          break;
        case 'hybrid':
          if (BMap.MapTypeControl && this.mapInstance.setMapType) {
            this.mapInstance.setMapType(BMap.MAP_TYPE_HYBRID);
          }
          break;
        case 'terrain':
          if (BMap.MapTypeControl && this.mapInstance.setMapType && BMap.MAP_TYPE_TERRAIN) {
            this.mapInstance.setMapType(BMap.MAP_TYPE_TERRAIN);
          }
          break;
        default:
          if (BMap.MapTypeControl && this.mapInstance.setMapType) {
            this.mapInstance.setMapType(BMap.MAP_TYPE_NORMAL);
          }
      }
    }
  }

  // 启用/禁用3D视角
  enable3DView(enabled: boolean): void {
    if (!this.mapInstance || !this.mapLoaded) return;

    // 检查是否支持3D视角
    if (this.mapInstance.setHeading && this.mapInstance.setTilt) {
      if (enabled) {
        // 设置3D视角
        this.mapInstance.setHeading(0);
        this.mapInstance.setTilt(45);
      } else {
        // 恢复2D视角
        this.mapInstance.setTilt(0);
      }
    }
  }

  // 地理编码
  geocodeAddress(address: string): Promise<[number, number]> {
    return new Promise((resolve, reject) => {
      if (!this.mapLoaded) {
        reject(new Error('地图未加载'));
        return;
      }

      const BMap = window.BMapGL || window.BMap;
      const geocoder = new BMap.Geocoder();

      geocoder.getPoint(address, (point: any) => {
        if (point) {
          resolve([point.lng, point.lat]);
        } else {
          reject(new Error('地址解析失败'));
        }
      });
    });
  }

  // 逆地理编码
  reverseGeocode(coordinates: [number, number]): Promise<{ address: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mapLoaded) {
        reject(new Error('地图未加载'));
        return;
      }

      const BMap = window.BMapGL || window.BMap;
      const geocoder = new BMap.Geocoder();
      const point = new BMap.Point(coordinates[0], coordinates[1]);

      geocoder.getLocation(point, (result: any) => {
        if (result) {
          resolve({ address: result.address });
        } else {
          reject(new Error('逆地理编码失败'));
        }
      });
    });
  }
}

/**
 * 百度地图展示组件
 * 提供地图显示、标记、搜索和地理编码等功能
 */
const BaiduMapComponent: React.FC<BaiduMapComponentProps> = ({
  height = 600,
  defaultZoom = 13,
  defaultCenter = [116.404, 39.915],
  showSearchBar = true,
  showPropertyMarkers = true,
  showControls = true,
  showHeatmap = false,
  onPropertySelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapId = `baidu-map-${Date.now()}`;
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [nearbyProperties, setNearbyProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'nearby'>('search');
  const [showHeatmapLayer, setShowHeatmapLayer] = useState(showHeatmap);
  // 搜索筛选选项
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([0, 500]);
  // 搜索历史记录
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  // 地图配置
  const [mapType, setMapType] = useState<string>('roadmap');
  const [is3DView, setIs3DView] = useState<boolean>(false);
  // 创建地图服务实例，使用配置文件中的API密钥
  const mapServiceRef = useRef<BaiduMapService>(new BaiduMapService(apiKeys.gis.apiKey));

  // 生成热力图数据
  const generateHeatmapData = (): Array<{ lng: number; lat: number; count: number }> => {
    const heatmapData: Array<{ lng: number; lat: number; count: number }> = [];
    
    // 使用建筑数据生成热力图数据
    buildingData.forEach(property => {
      if (property.coordinates) {
        // 基于价格生成热力值
        const count = Math.round(property.price / 1000); // 每1000元对应一个热力值
        heatmapData.push({
          lng: property.coordinates[0],
          lat: property.coordinates[1],
          count
        });
      }
    });
    
    return heatmapData;
  };

  // 更新热力图显示
  const updateHeatmap = () => {
    if (!mapReady) return;
    
    if (showHeatmapLayer) {
      const heatmapData = generateHeatmapData();
      mapServiceRef.current.addHeatmap(heatmapData);
    } else {
      mapServiceRef.current.clearOverlays();
      // 重新添加房产标记
      if (showPropertyMarkers && buildingData && Array.isArray(buildingData)) {
        addPropertyMarkers(buildingData as Property[]);
      }
    }
  };

  // 监听热力图开关变化
  useEffect(() => {
    updateHeatmap();
  }, [showHeatmapLayer, mapReady, showPropertyMarkers, buildingData, addPropertyMarkers, generateHeatmapData]);

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true);

        // 确保容器有ID
        if (mapContainerRef.current) {
          mapContainerRef.current.id = mapId;
        }

        // 初始化百度地图
        await mapServiceRef.current.initMap(mapId, {
          zoom: defaultZoom,
          center: defaultCenter,
        });

        setMapReady(true);

        // 如果启用了房产标记，添加房产点
        if (
          showPropertyMarkers &&
          buildingData &&
          Array.isArray(buildingData)
        ) {
          addPropertyMarkers(buildingData as Property[]);
        }

        // 如果启用了热力图，添加热力图
        if (showHeatmapLayer) {
          updateHeatmap();
        }

        message.success('地图加载成功');
      } catch (error) {
        console.error('地图初始化失败:', error);
        message.error('地图加载失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    initMap();

    // 清理函数
    return () => {
      const mapService = mapServiceRef.current;
      if (mapService) {
        mapService.destroyMap();
      }
    };
  }, [mapId, defaultZoom, defaultCenter, showPropertyMarkers, showHeatmapLayer, buildingData, addPropertyMarkers, updateHeatmap]);

  // 添加房产标记
  const addPropertyMarkers = (properties: Property[]) => {
    if (!mapReady || !Array.isArray(properties)) return;

    properties.forEach((property) => {
      if (property.coordinates && Array.isArray(property.coordinates)) {
        mapServiceRef.current.addMarker(property.coordinates, {
          title: property.name || '房产',
          content: `
            <div style="padding: 12px;">
              <h3 style="margin: 0 0 12px 0; color: #1890ff; font-size: 16px;">${property.name || '未知房产'}</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${property.address || '暂无地址'}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>类型:</strong> <span style="color: #4ECDC4; font-weight: bold;">${property.type || '未知类型'}</span></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>面积:</strong> ${property.area || '--'}㎡</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>价格:</strong> <span style="color: #FF6B6B; font-weight: bold;">${property.price ? `${property.price}元/㎡` : '暂无价格'}</span></p>
                ${property.distanceKm ? `<p style="margin: 4px 0; font-size: 14px;"><strong>距离:</strong> ${property.distanceKm}km</p>` : ''}
              </div>
              <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                <button style="padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="window.parent.postMessage({type: 'selectProperty', propertyId: '${property.id}'}, '*')">
                  选择此房产
                </button>
                <button style="padding: 6px 12px; background: #f0f0f0; color: #666; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;" onclick="window.open('https://maps.baidu.com/?q=${encodeURIComponent(property.address)}', '_blank')">
                  查看详情
                </button>
              </div>
            </div>
          `,
          width: 350,
          height: 220,
        }, property.type);
      }
    });
  };

  // 搜索地址
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      message.warning('请输入地址');
      return;
    }

    try {
      setLoading(true);
      const coordinates = await mapServiceRef.current.geocodeAddress(searchAddress);

      if (coordinates) {
        // 保存搜索历史
        setSearchHistory(prev => {
          const newHistory = [searchAddress, ...prev.filter(item => item !== searchAddress)];
          // 最多保存10条搜索历史
          return newHistory.slice(0, 10);
        });
        
        // 移动地图到搜索位置
        mapServiceRef.current.centerAndZoom(coordinates, 15);

        // 添加搜索标记
        mapServiceRef.current.addMarker(coordinates, {
          title: '搜索结果',
          content: `<div style="padding: 8px;"><p><strong>地址:</strong> ${searchAddress}</p></div>`,
        });

        // 获取地址信息
        const addressInfo = await mapServiceRef.current.reverseGeocode(coordinates);
        message.success(`定位成功: ${addressInfo.address}`);

        // 如果在附近搜索模式，搜索附近房产
        if (activeTab === 'nearby') {
          searchNearbyProperties(coordinates);
        }
      }
    } catch (error) {
      console.error('地址搜索失败:', error);
      message.error('地址搜索失败，请检查地址是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 搜索附近房产
  const searchNearbyProperties = async (center: [number, number] = defaultCenter) => {
    try {
      setLoading(true);


      // 模拟搜索附近房产，实际项目中应该调用真实的API
      let properties = buildingData.map(property => ({
        ...property,
        distanceKm: parseFloat((Math.random() * 10).toFixed(2))
      })) as Property[];
      
      // 应用筛选条件
      properties = properties.filter(property => {
        // 房产类型筛选
        if (propertyTypeFilter && property.type !== propertyTypeFilter) {
          return false;
        }
        // 价格范围筛选
        if (property.price < priceRange[0] || property.price > priceRange[1]) {
          return false;
        }
        // 面积范围筛选
        if (property.area < areaRange[0] || property.area > areaRange[1]) {
          return false;
        }
        return true;
      });
      
      // 排序：按距离从近到远
      properties.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      
      // 只显示前10个结果
      const filteredProperties = properties.slice(0, 10);

      setNearbyProperties(filteredProperties);

      // 清除现有标记，重新添加带距离信息的标记
      mapServiceRef.current.clearOverlays();

      filteredProperties.forEach((property) => {
        if (property.coordinates) {
          mapServiceRef.current.addMarker(property.coordinates, {
            title: property.name,
            content: `
              <div style="padding: 12px;">
                <h3 style="margin: 0 0 12px 0; color: #1890ff; font-size: 16px;">${property.name}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <p style="margin: 4px 0; font-size: 14px;"><strong>距离:</strong> <span style="color: #96CEB4; font-weight: bold;">${property.distanceKm}公里</span></p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${property.address}</p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>价格:</strong> <span style="color: #FF6B6B; font-weight: bold;">${property.price}元/㎡</span></p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>类型:</strong> <span style="color: #4ECDC4; font-weight: bold;">${property.type || '未知类型'}</span></p>
                  <p style="margin: 4px 0; font-size: 14px;"><strong>面积:</strong> ${property.area}㎡</p>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: flex-end;">
                  <button style="padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">选择此房产</button>
                  <button style="padding: 6px 12px; background: #f0f0f0; color: #666; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">查看详情</button>
                </div>
              </div>
            `,
          }, property.type);
        }
      });

      // 添加中心点标记
      mapServiceRef.current.addMarker(center, {
        title: '搜索中心点',
        content: '<div style="padding: 8px;"><p><strong>搜索中心点</strong></p></div>',
      });

      message.success(`找到 ${filteredProperties.length} 个附近房产`);
    } catch (error) {
      console.error('附近房产搜索失败:', error);
      message.error('附近房产搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 清除搜索结果
  const clearSearch = () => {
    setSearchAddress('');
    setNearbyProperties([]);
    mapServiceRef.current.clearOverlays();

    // 重新添加房产标记
    if (showPropertyMarkers && buildingData && Array.isArray(buildingData)) {
      addPropertyMarkers(buildingData as Property[]);
    }
  };

  // 选择房产
  const handleSelectProperty = (propertyId: string) => {
    const property = buildingData.find((b: any) => b.id === propertyId) as Property;
    if (property && property.coordinates) {
      setSelectedProperty(property);
      mapServiceRef.current.centerAndZoom(property.coordinates, 15);
      // 调用回调函数
      if (onPropertySelect) {
        onPropertySelect(property);
      }
    }
  };

  // 刷新地图
  const refreshMap = () => {
    setLoading(true);
    setTimeout(() => {
      mapServiceRef.current.destroyMap();
      mapServiceRef.current.initMap(mapId, {
        zoom: defaultZoom,
        center: defaultCenter,
      })
        .then(() => {
          setMapReady(true);
          addPropertyMarkers(buildingData as Property[]);
          message.success('地图已刷新');
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 500);
  };

  return (
    <Card
      title='百度地图GIS展示'
      bordered={false}
      extra={
        showControls ? (
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshMap}
            loading={loading}
          >
            刷新地图
          </Button>
        ) : null
      }
      className='mb-6'
    >
      {showSearchBar && (
        <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
          <Row gutter={16} align='middle'>
            <Col xs={24} sm={24} md={6} lg={4} xl={3}>
              <Select
                value={activeTab}
                onChange={setActiveTab}
                className='w-full'
              >
                <Option value='search'>地址搜索</Option>
                <Option value='nearby'>附近房产</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={16} lg={18} xl={17}>
              <Search
                placeholder='请输入地址'
                enterButton='搜索'
                size='large'
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onSearch={handleAddressSearch}
                className='w-full'
                suffix={
                  searchHistory.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #d9d9d9', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 100 }}>
                      {searchHistory.map((history, index) => (
                        <div key={index} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: index < searchHistory.length - 1 ? '1px solid #f0f0f0' : 'none' }} onClick={() => {
                          setSearchAddress(history);
                          handleAddressSearch();
                        }}>
                          {history}
                        </div>
                      ))}
                    </div>
                  )
                }
              />
            </Col>
            <Col xs={12} sm={12} md={2} lg={2} xl={1}>
              <Button
                danger
                onClick={clearSearch}
                icon={<SettingOutlined />}
                size='large'
                className='w-full'
              >
                清除
              </Button>
            </Col>
            <Col xs={12} sm={12} md={2} lg={2} xl={2}>
              <Button
                type={showHeatmapLayer ? 'primary' : 'default'}
                onClick={() => setShowHeatmapLayer(!showHeatmapLayer)}
                icon={<MapOutlined />}
                size='large'
                className='w-full'
              >
                {showHeatmapLayer ? '关闭热力图' : '开启热力图'}
              </Button>
            </Col>
          </Row>
          
          {/* 搜索筛选选项 */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e8e8e8' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Select
                  placeholder='房产类型'
                  value={propertyTypeFilter}
                  onChange={setPropertyTypeFilter}
                  className='w-full'
                >
                  <Option value=''>全部类型</Option>
                  <Option value='住宅'>住宅</Option>
                  <Option value='商业'>商业</Option>
                  <Option value='办公'>办公</Option>
                  <Option value='工业'>工业</Option>
                  <Option value='其他'>其他</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={16} lg={18} xl={20}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', marginRight: '16px' }}>价格范围：{priceRange[0]}-{priceRange[1]}元/㎡</span>
                  <InputNumber.Group compact>
                    <InputNumber min={0} max={50000} value={priceRange[0]} onChange={(value) => setPriceRange([value as number, priceRange[1]])} style={{ width: 100 }} />
                    <InputNumber min={0} max={50000} value={priceRange[1]} onChange={(value) => setPriceRange([priceRange[0], value as number])} style={{ width: 100, marginLeft: 8 }} />
                  </InputNumber.Group>
                </div>
                <div>
                  <span style={{ fontSize: '14px', marginRight: '16px' }}>面积范围：{areaRange[0]}-{areaRange[1]}㎡</span>
                  <InputNumber.Group compact>
                    <InputNumber min={0} max={2000} value={areaRange[0]} onChange={(value) => setAreaRange([value as number, areaRange[1]])} style={{ width: 100 }} />
                    <InputNumber min={0} max={2000} value={areaRange[1]} onChange={(value) => setAreaRange([areaRange[0], value as number])} style={{ width: 100, marginLeft: 8 }} />
                  </InputNumber.Group>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}

      <div style={{ height: `${height}px`, position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
            >
              <Spin size='large' tip='地图加载中...' />
            </div>
          )}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              backgroundColor: '#f0f2f5',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          ></div>
        </div>

      {/* 附近房产列表 */}
      {nearbyProperties.length > 0 && (
        <div className='mt-4'>
          <Card
            title={`附近房产 (${nearbyProperties.length})`}
            size='small'
            className='overflow-x-auto'
          >
            <table className='w-full text-sm text-left'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-4 py-2'>名称</th>
                  <th className='px-4 py-2'>距离</th>
                  <th className='px-4 py-2'>类型</th>
                  <th className='px-4 py-2'>价格</th>
                  <th className='px-4 py-2'>面积</th>
                </tr>
              </thead>
              <tbody>
                {nearbyProperties.map((property) => (
                  <tr
                    key={property.id}
                    className='hover:bg-gray-50 cursor-pointer'
                    onClick={() => handleSelectProperty(property.id)}
                  >
                    <td className='px-4 py-2 font-medium'>{property.name}</td>
                    <td className='px-4 py-2'>{property.distanceKm}km</td>
                    <td className='px-4 py-2'>{property.type}</td>
                    <td className='px-4 py-2 text-red-600'>
                      {property.price}元/㎡
                    </td>
                    <td className='px-4 py-2'>{property.area}㎡</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* 地图配置控制面板 */}
      <div className='mt-4'>
        <Card title='地图配置' size='small' className='overflow-x-auto'>
          <Row gutter={[16, 16]} align='middle'>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <div>
                <span style={{ marginRight: '12px', fontSize: '14px' }}>地图类型:</span>
                <Select
                  value={mapType}
                  onChange={(value) => {
                    setMapType(value);
                    mapServiceRef.current.setMapType(value);
                  }}
                  style={{ width: 150 }}
                >
                  <Option value='roadmap'>矢量地图</Option>
                  <Option value='satellite'>卫星地图</Option>
                  <Option value='hybrid'>混合地图</Option>
                  <Option value='terrain'>地形地图</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px', fontSize: '14px' }}>3D视角:</span>
                <Button
                  type={is3DView ? 'primary' : 'default'}
                  onClick={() => {
                    setIs3DView(!is3DView);
                    mapServiceRef.current.enable3DView(!is3DView);
                  }}
                >
                  {is3DView ? '关闭3D' : '开启3D'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      {/* 选中的房产信息 */}
      {selectedProperty && (
        <div className='mt-4'>
          <Card title='房产详情' size='small'>
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <strong>名称:</strong> {selectedProperty.name}
                </p>
                <p>
                  <strong>地址:</strong> {selectedProperty.address}
                </p>
                <p>
                  <strong>类型:</strong> {selectedProperty.type}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>价格:</strong> {selectedProperty.price}元/㎡
                </p>
                <p>
                  <strong>面积:</strong> {selectedProperty.area}㎡
                </p>
                <p>
                  <strong>坐标:</strong>{' '}
                  {selectedProperty.coordinates?.join(', ')}
                </p>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </Card>
  );
};

export default BaiduMapComponent;