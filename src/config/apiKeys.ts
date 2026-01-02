// API密钥配置文件
// 管理所有API密钥，包括GIS相关密钥和WPS API密钥

// 定义API密钥接口
export interface ApiKeys {
  // GIS相关密钥
  gis: {
    // 主要密钥
    apiKey: string;
    // 安全密钥
    securityKey: string;
    // 绑定服务
    service: string;
  };
  // WPS API密钥
  wps: {
    // 应用AK
    appKey: string;
    // 应用SK
    secretKey: string;
    // 绑定服务
    service: string;
  };
  // 其他API密钥可以在这里扩展
  // 例如：
  // baiduMap: string;
  //高德地图: string;
  //其他外部API密钥
}

// 从环境变量加载API密钥
const loadApiKeysFromEnv = (): ApiKeys => {
  return {
    gis: {
      // 使用用户提供的GIS API密钥
      apiKey: import.meta.env.VITE_GIS_API_KEY || 'cc6cc650f37f17fa1c76e2607935a1a9',
      // 使用用户提供的安全密钥
      securityKey: import.meta.env.VITE_GIS_SECURITY_KEY || '8fa11b2815f42423c371b6796d2e7f5a',
      // 绑定服务类型
      service: import.meta.env.VITE_GIS_SERVICE || 'Web端',
    },
    wps: {
      // 使用用户提供的WPS应用AK
      appKey: import.meta.env.VITE_WPS_APP_KEY || 'AKAK20251224RSLSFB',
      // 使用用户提供的WPS应用SK
      secretKey: import.meta.env.VITE_WPS_SECRET_KEY || 'a8feeba4bc11b9787c9475e37d125a91',
      // 绑定服务类型
      service: import.meta.env.VITE_WPS_SERVICE || 'Web端',
    },
  };
};

// 创建API密钥实例
export const apiKeys: ApiKeys = loadApiKeysFromEnv();

// 导出密钥获取函数，方便在组件和服务中使用
export const getApiKey = (type: keyof ApiKeys): string => {
  if (type === 'gis') {
    return apiKeys.gis.apiKey;
  }
  if (type === 'wps') {
    return apiKeys.wps.appKey;
  }
  // 可以扩展其他类型的密钥获取逻辑
  throw new Error(`不支持的API密钥类型: ${type}`);
};

export const getGisSecurityKey = (): string => {
  return apiKeys.gis.securityKey;
};

export const getGisService = (): string => {
  return apiKeys.gis.service;
};

// WPS API密钥获取函数
export const getWpsAppKey = (): string => {
  return apiKeys.wps.appKey;
};

export const getWpsSecretKey = (): string => {
  return apiKeys.wps.secretKey;
};

export const getWpsService = (): string => {
  return apiKeys.wps.service;
};

// 默认导出
export default apiKeys;