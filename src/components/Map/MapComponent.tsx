import React, { useEffect, useRef, useState } from 'react';
import { Card, message, Input, Button, Space } from 'antd';
import AMapLoader from '@amap/amap-jsapi-loader';
import { getApiKey, getGisSecurityKey } from '../../config/apiKeys';

interface MapComponentProps {
  onLocationSelect?: (location: { name: string; lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  zoom?: number;
}

/**
 * 地图组件
 * 使用高德地图API实现地图显示和位置选择功能
 * 包含：位置标记、地址搜索、坐标定位、区域选择等功能
 */
const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  initialLocation = { lat: 39.9042, lng: 116.4074 }, // 默认北京坐标
  zoom = 13
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 初始化地图
  useEffect(() => {
    let currentMapInstance: any = null;
    let currentSelectedMarker: any = null;
    let geocoder: any = null;
    let placeSearch: any = null;

    const initMap = async () => {
      try {
        // 加载高德地图API
        const AMap = await AMapLoader.load({
          key: getApiKey('gis'), // 高德地图API密钥
          version: '2.0',
          plugins: [
            'AMap.Geocoder', 
            'AMap.ToolBar', 
            'AMap.Scale', 
            'AMap.MapType',
            'AMap.PlaceSearch',
            'AMap.AutoComplete',
            'AMap.MouseTool'
          ],
          securityJsCode: getGisSecurityKey(), // 安全密钥
        });

        if (!mapContainerRef.current) return;

        // 创建地图实例
        const map = new AMap.Map(mapContainerRef.current, {
          center: [initialLocation.lng, initialLocation.lat],
          zoom: zoom,
          viewMode: '3D',
          resizeEnable: true,
        });

        // 添加控件
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.MapType());

        // 初始化地理编码
        geocoder = new AMap.Geocoder();

        // 初始化地点搜索
        placeSearch = new AMap.PlaceSearch({
          map: map,
          panel: 'panel',
          pageSize: 10,
          pageIndex: 1,
          autoFitView: true
        });

        // 添加点击事件，用于选择位置
        map.on('click', async (e: any) => {
          const lngLat = e.lnglat;
          
          // 逆地理编码，获取位置名称
          geocoder.getAddress(lngLat, (status: string, result: any) => {
            if (status === 'complete' && result.regeocode) {
              handleLocationSelect(result.regeocode.formattedAddress, lngLat, map);
            }
          });
        });

        // 添加标记到初始位置
        if (initialLocation) {
          geocoder.getAddress([initialLocation.lng, initialLocation.lat], (status: string, result: any) => {
            if (status === 'complete' && result.regeocode) {
              const initialMarker = new AMap.Marker({
                position: [initialLocation.lng, initialLocation.lat],
                map: map,
                title: result.regeocode.formattedAddress,
              });
              currentSelectedMarker = initialMarker;
              setSelectedMarker(initialMarker);
            }
          });
        }

        currentMapInstance = map;
        setMapInstance(map);
        setIsLoading(false);
      } catch (error) {
        console.error('地图初始化失败:', error);
        message.error('地图初始化失败，请稍后重试');
        setIsLoading(false);
      }
    };

    const handleLocationSelect = (locationName: string, lngLat: any, map: any) => {
      // 清除之前的标记
      if (currentSelectedMarker) {
        currentSelectedMarker.setMap(null);
      }
      
      // 添加新标记
      const marker = new AMap.Marker({
        position: lngLat,
        map: map,
        title: locationName,
      });
      
      currentSelectedMarker = marker;
      setSelectedMarker(marker);
      
      // 触发位置选择事件
      if (onLocationSelect) {
        onLocationSelect({
          name: locationName,
          lat: lngLat.getLat(),
          lng: lngLat.getLng(),
        });
      }
      
      message.success(`已选择位置: ${locationName}`);
    };

    initMap();

    // 清理函数
    return () => {
      if (currentMapInstance) {
        currentMapInstance.destroy();
      }
    };
  }, [initialLocation, zoom, onLocationSelect]);

  // 地址搜索
  const handleSearch = () => {
    if (!searchText || !mapInstance) return;

    const AMap = (window as any).AMap;
    const geocoder = new AMap.Geocoder();

    // 地理编码，根据地址获取坐标
    geocoder.getLocation(searchText, (status: string, result: any) => {
      if (status === 'complete' && result.geocodes.length > 0) {
        const location = result.geocodes[0];
        const lngLat = location.location;
        
        // 移动地图到搜索结果位置
        mapInstance.setCenter([lngLat.lng, lngLat.lat]);
        mapInstance.setZoom(15);
        
        // 选择位置
        if (onLocationSelect) {
          onLocationSelect({
            name: location.formattedAddress,
            lat: lngLat.lat,
            lng: lngLat.lng,
          });
        }
        
        // 添加标记
        if (selectedMarker) {
          selectedMarker.setMap(null);
        }
        
        const marker = new (window as any).AMap.Marker({
          position: lngLat,
          map: mapInstance,
          title: location.formattedAddress,
        });
        
        setSelectedMarker(marker);
        message.success(`已定位到: ${location.formattedAddress}`);
      } else {
        message.error('未找到该地址，请尝试其他搜索词');
      }
    });
  };

  return (
    <Card 
      title="地图功能"
      bordered={false}
      loading={isLoading}
      extra={
        <Space>
          <Input 
            placeholder="输入地址搜索"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      }
    >
      <div 
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: 500, 
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid #e8e8e8'
        }}
      />
      <div id="panel" style={{ marginTop: '10px', maxHeight: '200px', overflow: 'auto' }}></div>
    </Card>
  );
};

export default MapComponent;
