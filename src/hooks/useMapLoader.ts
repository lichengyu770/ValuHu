import { useState, useEffect, useRef, useCallback } from 'react';
import { AMAP_KEY } from '../config/apiKeys';

export interface MapLoaderOptions {
  apiKey?: string;
  version?: string;
  plugins?: string[];
}

export interface MarkerOptions {
  position: [number, number];
  title?: string;
  content?: string;
  icon?: string;
  draggable?: boolean;
}

export interface MapEventHandlers {
  [eventName: string]: (event: any) => void;
}

export function useMapLoader(options: MapLoaderOptions = {}) {
  const {
    apiKey = AMAP_KEY,
    version = '2.0',
    plugins = [],
  } = options;

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const loadAttemptedRef = useRef(false);
  const markersRef = useRef<any[]>([]);
  const eventHandlersRef = useRef<MapEventHandlers>({});
  const controlsRef = useRef<any[]>([]);

  // 加载地图脚本
  const loadMapScript = useCallback(() => {
    if (loadAttemptedRef.current) return;
    loadAttemptedRef.current = true;

    // 检查是否已经加载
    if (window.AMap) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;

    // 构建插件参数
    const pluginParam = plugins.length > 0 ? `&plugin=${plugins.join(',')}` : '';
    script.src = `https://webapi.amap.com/maps?v=${version}&key=${apiKey}${pluginParam}&callback=onAMapLoaded`;

    // 全局回调函数
    (window as any).onAMapLoaded = () => {
      setLoaded(true);
      scriptRef.current = null;
    };

    script.onerror = () => {
      setError(new Error('地图脚本加载失败'));
      setLoaded(false);
      scriptRef.current = null;
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    // 清理函数
    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      delete (window as any).onAMapLoaded;
    };
  }, [apiKey, version, plugins]);

  // 初始化地图
  const initMap = useCallback((container: HTMLElement, mapOptions: any = {}) => {
    if (!loaded || !window.AMap) {
      throw new Error('地图未加载完成');
    }

    const map = new window.AMap.Map(container, {
      zoom: 13,
      center: [116.397428, 39.90923],
      ...mapOptions,
    });

    setMapInstance(map);
    return map;
  }, [loaded]);

  // 销毁地图
  const destroyMap = useCallback(() => {
    if (mapInstance) {
      // 移除所有标记
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // 移除所有控件
      controlsRef.current.forEach(control => mapInstance.removeControl(control));
      controlsRef.current = [];

      // 移除所有事件监听
      Object.keys(eventHandlersRef.current).forEach(eventName => {
        mapInstance.off(eventName, eventHandlersRef.current[eventName]);
      });
      eventHandlersRef.current = {};

      // 销毁地图实例
      mapInstance.destroy();
      setMapInstance(null);
    }
  }, [mapInstance]);

  // 地理编码
  const geocode = useCallback(async (address: string) => {
    if (!loaded || !window.AMap) {
      throw new Error('地图未加载完成');
    }

    return new Promise<{
      lng: number;
      lat: number;
      formattedAddress: string;
      addressComponent?: any;
    }>((resolve, reject) => {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getLocation(address, (status: string, result: any) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const { location, formattedAddress, addressComponent } = result.geocodes[0];
          resolve({
            lng: location.lng,
            lat: location.lat,
            formattedAddress,
            addressComponent,
          });
        } else {
          reject(new Error('地理编码失败'));
        }
      });
    });
  }, [loaded]);

  // 逆地理编码
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    if (!loaded || !window.AMap) {
      throw new Error('地图未加载完成');
    }

    return new Promise<{
      address: string;
      formattedAddress: string;
      district: string;
      addressComponent?: any;
    }>((resolve, reject) => {
      const geocoder = new window.AMap.Geocoder();
      geocoder.getAddress([lng, lat], (status: string, result: any) => {
        if (status === 'complete' && result.regeocode) {
          const { formattedAddress, addressComponent } = result.regeocode;
          resolve({
            address: formattedAddress,
            formattedAddress,
            district: addressComponent.district,
            addressComponent,
          });
        } else {
          reject(new Error('逆地理编码失败'));
        }
      });
    });
  }, [loaded]);

  // 添加标记
  const addMarker = useCallback((options: MarkerOptions) => {
    if (!mapInstance || !window.AMap) {
      throw new Error('地图未初始化');
    }

    const marker = new window.AMap.Marker({
      position: options.position,
      title: options.title,
      content: options.content,
      icon: options.icon,
      draggable: options.draggable || false,
      map: mapInstance,
    });

    markersRef.current.push(marker);
    return marker;
  }, [mapInstance]);

  // 移除标记
  const removeMarker = useCallback((marker: any) => {
    if (marker) {
      marker.setMap(null);
      markersRef.current = markersRef.current.filter(m => m !== marker);
    }
  }, []);

  // 移除所有标记
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // 添加事件监听
  const on = useCallback((eventName: string, handler: (event: any) => void) => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    mapInstance.on(eventName, handler);
    eventHandlersRef.current[eventName] = handler;
  }, [mapInstance]);

  // 移除事件监听
  const off = useCallback((eventName: string) => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    const handler = eventHandlersRef.current[eventName];
    if (handler) {
      mapInstance.off(eventName, handler);
      delete eventHandlersRef.current[eventName];
    }
  }, [mapInstance]);

  // 添加控件
  const addControl = useCallback((control: any) => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    mapInstance.addControl(control);
    controlsRef.current.push(control);
    return control;
  }, [mapInstance]);

  // 移除控件
  const removeControl = useCallback((control: any) => {
    if (mapInstance && control) {
      mapInstance.removeControl(control);
      controlsRef.current = controlsRef.current.filter(c => c !== control);
    }
  }, [mapInstance]);

  // 移除所有控件
  const clearControls = useCallback(() => {
    if (mapInstance) {
      controlsRef.current.forEach(control => mapInstance.removeControl(control));
      controlsRef.current = [];
    }
  }, [mapInstance]);

  // 设置地图中心点
  const setCenter = useCallback((position: [number, number]) => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    mapInstance.setCenter(position);
  }, [mapInstance]);

  // 设置地图缩放级别
  const setZoom = useCallback((zoom: number) => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    mapInstance.setZoom(zoom);
  }, [mapInstance]);

  // 获取当前地图中心点
  const getCenter = useCallback(() => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    return mapInstance.getCenter();
  }, [mapInstance]);

  // 获取当前地图缩放级别
  const getZoom = useCallback(() => {
    if (!mapInstance) {
      throw new Error('地图未初始化');
    }

    return mapInstance.getZoom();
  }, [mapInstance]);

  // 地图定位到当前位置
  const locate = useCallback(() => {
    if (!mapInstance || !window.AMap) {
      throw new Error('地图未初始化');
    }

    return new Promise<[number, number]>((resolve, reject) => {
      mapInstance.plugin('AMap.Geolocation', () => {
        const geolocation = new window.AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        geolocation.getCurrentPosition((status: string, result: any) => {
          if (status === 'complete') {
            const { position } = result;
            const lngLat = [position.lng, position.lat] as [number, number];
            mapInstance.setCenter(lngLat);
            mapInstance.setZoom(15);
            resolve(lngLat);
          } else {
            reject(new Error('定位失败'));
          }
        });
      });
    });
  }, [mapInstance]);

  // 组件挂载时加载地图
  useEffect(() => {
    const cleanup = loadMapScript();
    return () => {
      cleanup?.();
      destroyMap();
    };
  }, [loadMapScript, destroyMap]);

  return {
    loaded,
    error,
    mapInstance,
    initMap,
    destroyMap,
    geocode,
    reverseGeocode,
    addMarker,
    removeMarker,
    clearMarkers,
    on,
    off,
    addControl,
    removeControl,
    clearControls,
    setCenter,
    setZoom,
    getCenter,
    getZoom,
    locate,
  };
}