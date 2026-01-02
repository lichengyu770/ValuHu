// 模拟房产位置数据
export const mockPropertiesWithLocation = [
  {
    id: 1,
    name: '幸福小区',
    address: '北京市朝阳区建国路88号',
    latitude: 39.908722,
    longitude: 116.465149,
    price: 52000,
    type: '住宅',
    area: 120,
    bedrooms: 3,
    available: true,
  },
  {
    id: 2,
    name: '阳光花园',
    address: '北京市朝阳区望京SOHO',
    latitude: 39.997405,
    longitude: 116.478461,
    price: 65000,
    type: '住宅',
    area: 98,
    bedrooms: 2,
    available: true,
  },
  {
    id: 3,
    name: '商务中心大厦',
    address: '北京市朝阳区CBD商务中心',
    latitude: 39.906812,
    longitude: 116.466644,
    price: 85000,
    type: '商业',
    area: 200,
    bedrooms: 0,
    available: false,
  },
  {
    id: 4,
    name: '湖畔别墅',
    address: '北京市昌平区温榆河附近',
    latitude: 40.099206,
    longitude: 116.479146,
    price: 120000,
    type: '别墅',
    area: 350,
    bedrooms: 5,
    available: true,
  },
  {
    id: 5,
    name: '城市公寓',
    address: '北京市海淀区中关村大街',
    latitude: 39.983455,
    longitude: 116.305399,
    price: 78000,
    type: '住宅',
    area: 85,
    bedrooms: 2,
    available: true,
  },
];

// 模拟用户位置数据
export const mockUserLocation = {
  latitude: 39.915,
  longitude: 116.404,
};

// 导出默认数据
export default mockPropertiesWithLocation;
