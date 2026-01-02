#!/usr/bin/env python3
"""
ValuHub Python SDK
用于访问ValuHub API的Python客户端库
"""

import requests
import json

class ValuHubClient:
    """ValuHub API客户端"""
    
    def __init__(self, api_key, base_url='https://api.valu-hub.com/api', timeout=30):
        """
        初始化ValuHub客户端
        
        Args:
            api_key (str): API密钥
            base_url (str): API基础URL，默认为生产环境
            timeout (int): 请求超时时间，默认30秒
        """
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = timeout
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method, endpoint, data=None, params=None):
        """
        发送HTTP请求
        
        Args:
            method (str): 请求方法，如GET、POST、PUT、DELETE
            endpoint (str): API端点路径
            data (dict, optional): 请求体数据
            params (dict, optional): URL参数
            
        Returns:
            dict: API响应数据
            
        Raises:
            requests.exceptions.RequestException: 请求失败时抛出异常
        """
        url = f'{self.base_url}{endpoint}'
        
        response = requests.request(
            method=method,
            url=url,
            headers=self.headers,
            json=data,
            params=params,
            timeout=self.timeout
        )
        
        response.raise_for_status()
        return response.json()
    
    def get_properties(self, limit=20, offset=0):
        """
        获取房产列表
        
        Args:
            limit (int): 每页数量，默认20
            offset (int): 偏移量，默认0
            
        Returns:
            dict: 房产列表数据
        """
        params = {'limit': limit, 'offset': offset}
        return self._make_request('GET', '/v1/properties', params=params)
    
    def get_property(self, property_id):
        """
        获取单个房产详情
        
        Args:
            property_id (str): 房产ID
            
        Returns:
            dict: 房产详情数据
        """
        return self._make_request('GET', f'/v1/properties/{property_id}')
    
    def valuate_property(self, property_data):
        """
        房产估价（API v2）
        
        Args:
            property_data (dict): 房产数据，包含以下字段：
                - address: 房产地址
                - city: 城市
                - district: 区县
                - area: 建筑面积（平方米）
                - rooms: 房间数量
                - bathrooms: 卫生间数量
                - floor_level: 所在楼层
                - total_floors: 总楼层
                - building_year: 建筑年份
                - property_type: 房产类型
                - orientation: 朝向
                - decoration_status: 装修状况
                - latitude: 纬度（可选）
                - longitude: 经度（可选）
                - additional_features: 额外特征（可选）
                - model_type: 估价模型类型（可选，默认ensemble）
                
        Returns:
            dict: 估价结果
        """
        return self._make_request('POST', '/v2/valuate', data=property_data)
    
    def batch_valuate(self, properties):
        """
        批量房产估价
        
        Args:
            properties (list): 房产数据列表，每个元素为房产数据字典
            
        Returns:
            dict: 批量估价结果
        """
        return self._make_request('POST', '/v1/valuations/batch', data={'properties': properties})
    
    def get_enterprise(self, enterprise_id):
        """
        获取企业详情
        
        Args:
            enterprise_id (str): 企业ID
            
        Returns:
            dict: 企业详情数据
        """
        return self._make_request('GET', f'/enterprises/{enterprise_id}')
    
    def get_teams(self):
        """
        获取团队列表
        
        Returns:
            dict: 团队列表数据
        """
        return self._make_request('GET', '/teams')
    
    def get_api_keys(self):
        """
        获取API Key列表
        
        Returns:
            dict: API Key列表数据
        """
        return self._make_request('GET', '/api-keys')
    
    def create_api_key(self, name, permissions=None, expires_at=None, description=None):
        """
        创建API Key
        
        Args:
            name (str): API Key名称
            permissions (list, optional): 权限列表
            expires_at (str, optional): 过期时间，ISO格式
            description (str, optional): 描述
            
        Returns:
            dict: 创建的API Key数据
        """
        data = {'name': name}
        if permissions:
            data['permissions'] = permissions
        if expires_at:
            data['expiresAt'] = expires_at
        if description:
            data['description'] = description
        
        return self._make_request('POST', '/api-keys', data=data)


# 使用示例
if __name__ == '__main__':
    # 初始化客户端
    client = ValuHubClient(
        api_key='your_api_key_here',
        base_url='http://localhost:3000/api'  # 开发环境
    )
    
    # 房产估价示例
    property_data = {
        'address': '北京市朝阳区建国路88号',
        'city': '北京市',
        'district': '朝阳区',
        'area': 120.0,
        'rooms': 3,
        'bathrooms': 2,
        'floor_level': 15,
        'total_floors': 30,
        'building_year': 2015,
        'property_type': 'apartment',
        'orientation': 'south',
        'decoration_status': 'fine'
    }
    
    try:
        # 调用估价API
        result = client.valuate_property(property_data)
        print('估价结果:')
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f'调用API失败: {e}')
