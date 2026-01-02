import requests
import json

# 测试报告生成API
def test_generate_report():
    # 先注册用户
    register_url = "http://localhost:8000/api/v1/register"
    register_data = {
        "phone": "13800138001",
        "username": "testuser1",
        "password": "password123"
    }
    
    register_response = requests.post(register_url, json=register_data)
    print(f"注册请求状态码: {register_response.status_code}")
    print(f"注册响应: {register_response.text}")
    
    # 登录获取token
    login_url = "http://localhost:8000/api/v1/login"
    login_data = {
        "phone": "13800138001",
        "password": "password123"
    }
    
    login_response = requests.post(login_url, json=login_data)
    if login_response.status_code != 200:
        print("登录失败:", login_response.text)
        return
    
    token = login_response.json().get("access_token")
    print("登录成功，获取到token")
    
    # 生成报告
    report_url = "http://localhost:8000/api/v1/report/generate"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    report_data = {
        "project_id": "test_project_123",
        "city": "长沙市",
        "district": "岳麓区",
        "community": "万科城市花园",
        "area": 120.5,
        "floor": 15,
        "total_floors": 30,
        "price_per_sqm": 12850.0,
        "total_price": 1548425.0,
        "confidence": 95.5,
        "recommendation": "该小区地理位置优越，周边配套完善，价格合理，建议考虑购买。"
    }
    
    report_response = requests.post(report_url, json=report_data, headers=headers)
    print(f"报告生成请求状态码: {report_response.status_code}")
    print(f"报告生成响应: {report_response.text}")
    
    if report_response.status_code == 200:
        report_result = report_response.json()
        print(f"报告ID: {report_result.get('report_id')}")
        print(f"下载链接: {report_result.get('download_url')}")
    
if __name__ == "__main__":
    test_generate_report()
