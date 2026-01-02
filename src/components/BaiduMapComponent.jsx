import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  message,
  Spin,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  MapOutlined,
  HomeOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import BaiduMapService from '../services/BaiduMapService';
import { buildingData } from '../data/mockData';

const { Option } = Select;
const { Search } = Input;

/**
 * 百度地图展示组件
 * 提供地图显示、标记、搜索和地理编码等功能
 */
const BaiduMapComponent = ({
  height = 600,
  defaultZoom = 13,
  defaultCenter = [116.404, 39.915],
  showSearchBar = true,
  showPropertyMarkers = true,
  showControls = true,
}) => {
  const mapContainerRef = useRef(null);
  const mapId = `baidu-map-${Date.now()}`;
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [nearbyProperties, setNearbyProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'nearby'

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
        await BaiduMapService.initMap(mapId, {
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
          addPropertyMarkers(buildingData);
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
      if (mapId) {
        BaiduMapService.destroyMap(mapId);
      }
    };
  }, [mapId, defaultZoom, defaultCenter, showPropertyMarkers]);

  // 添加房产标记
  const addPropertyMarkers = (properties) => {
    if (!mapReady || !Array.isArray(properties)) return;

    properties.forEach((property) => {
      if (property.coordinates && Array.isArray(property.coordinates)) {
        BaiduMapService.addMarker(mapId, property.coordinates, {
          title: property.name || '房产',
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #1890ff;">${property.name || '未知房产'}</h3>
              <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${property.address || '暂无地址'}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>类型:</strong> ${property.type || '未知类型'}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>面积:</strong> ${property.area || '--'}㎡</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>价格:</strong> ${property.price ? `${property.price}元/㎡` : '暂无价格'}</p>
            </div>
          `,
          width: 300,
          height: 180,
        });
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
      const coordinates = await BaiduMapService.geocodeAddress(searchAddress);

      if (coordinates) {
        // 移动地图到搜索位置
        const map = BaiduMapService.getMapInstance(mapId);
        if (map && BaiduMapService.BMap) {
          const point = new BaiduMapService.BMap.Point(
            coordinates[0],
            coordinates[1]
          );
          map.centerAndZoom(point, 15);

          // 添加搜索标记
          BaiduMapService.addMarker(mapId, coordinates, {
            title: '搜索结果',
            content: `<div style="padding: 8px;"><p><strong>地址:</strong> ${searchAddress}</p></div>`,
          });

          // 获取地址信息
          const addressInfo = await BaiduMapService.reverseGeocode(coordinates);
          message.success(`定位成功: ${addressInfo.address}`);

          // 如果在附近搜索模式，搜索附近房产
          if (activeTab === 'nearby') {
            searchNearbyProperties(coordinates);
          }
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
  const searchNearbyProperties = async (center = defaultCenter) => {
    try {
      setLoading(true);

      // 搜索半径10公里
      const radius = 10000;
      const properties = await BaiduMapService.searchNearbyProperties(
        center,
        radius,
        buildingData
      );

      setNearbyProperties(properties);

      // 清除现有标记，重新添加带距离信息的标记
      BaiduMapService.clearOverlays(mapId);

      properties.forEach((property) => {
        if (property.coordinates) {
          BaiduMapService.addMarker(mapId, property.coordinates, {
            title: property.name,
            content: `
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #1890ff;">${property.name}</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>距离:</strong> ${property.distanceKm}公里</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>地址:</strong> ${property.address}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>价格:</strong> ${property.price}元/㎡</p>
              </div>
            `,
          });
        }
      });

      // 添加中心点标记
      BaiduMapService.addMarker(mapId, center, {
        title: '搜索中心点',
        content:
          '<div style="padding: 8px;"><p><strong>搜索中心点</strong></p></div>',
      });

      message.success(`找到 ${properties.length} 个附近房产`);
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
    BaiduMapService.clearOverlays(mapId);

    // 重新添加房产标记
    if (showPropertyMarkers && buildingData && Array.isArray(buildingData)) {
      addPropertyMarkers(buildingData);
    }
  };

  // 选择房产
  const handleSelectProperty = (propertyId) => {
    const property = buildingData.find((b) => b.id === propertyId);
    if (property && property.coordinates) {
      setSelectedProperty(property);
      const map = BaiduMapService.getMapInstance(mapId);
      if (map && BaiduMapService.BMap) {
        const point = new BaiduMapService.BMap.Point(
          property.coordinates[0],
          property.coordinates[1]
        );
        map.centerAndZoom(point, 15);
      }
    }
  };

  // 刷新地图
  const refreshMap = () => {
    setLoading(true);
    setTimeout(() => {
      BaiduMapService.destroyMap(mapId);
      BaiduMapService.initMap(mapId, {
        zoom: defaultZoom,
        center: defaultCenter,
      })
        .then(() => {
          setMapReady(true);
          addPropertyMarkers(buildingData);
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
            <Col xs={24} sm={24} md={16} lg={18} xl={19}>
              <Search
                placeholder='请输入地址'
                enterButton='搜索'
                size='large'
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onSearch={handleAddressSearch}
                className='w-full'
              />
            </Col>
            <Col xs={24} sm={24} md={2} lg={2} xl={2}>
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
          </Row>
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
          }}
        />
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
