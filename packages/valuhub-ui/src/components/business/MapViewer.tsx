import React, { useEffect, useRef, useState } from 'react';

interface MapViewerProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    content?: string;
    icon?: string;
  }>;
  onMarkerClick?: (marker: any) => void;
  onMapClick?: (position: { lat: number; lng: number }) => void;
  mapType?: 'roadmap' | 'satellite' | 'hybrid';
  height?: string;
  className?: string;
}

const MapViewer: React.FC<MapViewerProps> = ({
  center,
  zoom = 15,
  markers = [],
  onMarkerClick,
  onMapClick,
  mapType = 'roadmap',
  height = '400px',
  className = '',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return;

    // 模拟地图加载（实际项目中应使用真实地图库如Leaflet或MapLibre）
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // 清理函数
    return () => clearTimeout(timer);
  }, []);

  // 更新地图中心和缩放级别
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // 实际项目中应使用地图库的API更新地图中心和缩放级别
  }, [center, zoom]);

  // 更新标记
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    // 实际项目中应使用地图库的API更新标记
    // 清除旧标记
    markersRef.current.forEach(marker => {
      // 实际项目中应调用marker.remove()或类似方法
    });
    markersRef.current.clear();

    // 添加新标记
    markers.forEach(marker => {
      // 实际项目中应创建新标记并添加到地图上
      markersRef.current.set(marker.id, marker);
    });
  }, [markers]);

  // 处理地图点击
  const handleMapClick = () => {
    if (onMapClick) {
      onMapClick(center); // 实际项目中应获取点击位置的坐标
    }
  };

  // 处理标记点击
  const handleMarkerClick = (marker: any) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  return (
    <div 
      className={`relative rounded-lg overflow-hidden transition-all duration-300 border border-gray-200 ${className}`}
      style={{ height }}
    >
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-600">地图加载中...</p>
          </div>
        </div>
      )}

      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full bg-gray-200 cursor-pointer"
        onClick={handleMapClick}
      >
        {/* 模拟地图显示 */}
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p>地图组件（实际项目中应集成Leaflet或MapLibre）</p>
            <p className="text-sm mt-1">中心坐标：{center.lat}, {center.lng}</p>
            <p className="text-sm">缩放级别：{zoom}</p>
            {markers.length > 0 && (
              <p className="text-sm mt-1">标记数量：{markers.length}</p>
            )}
          </div>
        </div>

        {/* 模拟标记 */}
        {!isLoading && markers.length > 0 && (
          markers.map(marker => (
            <div
              key={marker.id}
              className="absolute w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125"
              style={{
                left: '50%', // 实际项目中应根据坐标计算位置
                top: '50%',
              }}
              onClick={() => handleMarkerClick(marker)}
              title={marker.title}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold">
                {markers.indexOf(marker) + 1}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 地图控件 */}
      <div className="absolute top-2 right-2 bg-white rounded-md shadow-md p-2 flex flex-col gap-2">
        <button
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => { /* 实际项目中应实现缩放功能 */ }}
        >
          ➕ 放大
        </button>
        <button
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => { /* 实际项目中应实现缩放功能 */ }}
        >
          ➖ 缩小
        </button>
        <button
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          onClick={() => { /* 实际项目中应切换地图类型 */ }}
        >
          🗺️ 切换地图类型
        </button>
      </div>
    </div>
  );
};

export default MapViewer;