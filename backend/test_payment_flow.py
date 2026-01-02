import requests
import json

# 测试报告生成和支付流程
def test_report_payment_flow():
    # 先注册用户
    register_url = "http://localhost:8000/api/v1/register"
    register_data = {
        "phone": "13800138002",
        "username": "testuser2",
        "password": "password123"
    }
    
    register_response = requests.post(register_url, json=register_data)
    print(f"注册请求状态码: {register_response.status_code}")
    print(f"注册响应: {register_response.text}")
    
    # 登录获取token
    login_url = "http://localhost:8000/api/v1/login"
    login_data = {
        "phone": "13800138002",
        "password": "password123"
    }
    
    login_response = requests.post(login_url, json=login_data)
    if login_response.status_code != 200:
        print("登录失败:", login_response.text)
        return
    
    token = login_response.json().get("access_token")
    print("登录成功，获取到token")
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    # 1. 生成报告
    report_url = "http://localhost:8000/api/v1/report/generate"
    report_data = {
        "project_id": "test_project_456",
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
    
    if report_response.status_code != 200:
        print("报告生成失败")
        return
    
    report_result = report_response.json()
    report_id = report_result.get("report_id")
    download_url = report_result.get("download_url")
    print(f"报告ID: {report_id}")
    print(f"下载链接: {download_url}")
    
    # 2. 尝试下载报告（应该失败，提示未付费）
    print("\n=== 尝试下载未付费报告 ===")
    download_response = requests.get(f"http://localhost:8000{download_url}", headers=headers)
    print(f"下载请求状态码: {download_response.status_code}")
    print(f"下载响应: {download_response.text}")
    
    if download_response.status_code == 402:
        print("✓ 成功验证：未付费报告无法下载")
    else:
        print("✗ 验证失败：未付费报告应该无法下载")
        return
    
    # 3. 创建报告支付订单（固定9.9元）
    print("\n=== 创建报告支付订单 ===")
    create_order_url = "http://localhost:8000/api/v1/payment/create-report-order"
    order_data = {
        "project_id": "test_project_456",
        "report_id": report_id,
        "amount": 9.9,  # 这个金额会被忽略，固定为9.9元
        "pay_type": "wxpay"
    }
    
    order_response = requests.post(create_order_url, json=order_data, headers=headers)
    print(f"创建订单请求状态码: {order_response.status_code}")
    print(f"创建订单响应: {order_response.text}")
    
    if order_response.status_code != 200:
        print("创建订单失败")
        return
    
    order_result = order_response.json()
    order_id = order_result.get("order_id")
    amount = order_result.get("amount")
    print(f"订单ID: {order_id}")
    print(f"订单金额: {amount}")
    
    if amount == 9.9:
        print("✓ 成功验证：报告订单金额固定为9.9元")
    else:
        print(f"✗ 验证失败：报告订单金额应该为9.9元，实际为{amount}元")
        return
    
    # 4. 模拟支付成功
    print("\n=== 模拟微信支付成功 ===")
    mock_pay_url = f"http://localhost:8000/api/v1/payment/mock-pay/{order_id}"
    mock_pay_response = requests.get(mock_pay_url, headers=headers)
    print(f"模拟支付请求状态码: {mock_pay_response.status_code}")
    print(f"模拟支付响应: {mock_pay_response.text}")
    
    if mock_pay_response.status_code != 200:
        print("模拟支付失败")
        return
    
    # 5. 再次尝试下载报告（应该成功）
    print("\n=== 尝试下载已付费报告 ===")
    download_response = requests.get(f"http://localhost:8000{download_url}", headers=headers)
    print(f"下载请求状态码: {download_response.status_code}")
    
    if download_response.status_code == 200:
        print("✓ 成功验证：已付费报告可以正常下载")
        # 保存报告到本地
        file_ext = ".pdf" if "application/pdf" in download_response.headers.get("content-type", "") else ".html"
        with open(f"test_report_{report_id}{file_ext}", "wb") as f:
            f.write(download_response.content)
        print(f"报告已保存到本地：test_report_{report_id}{file_ext}")
    else:
        print(f"✗ 验证失败：已付费报告应该可以下载，实际状态码：{download_response.status_code}")
        print(f"下载响应：{download_response.text}")
    
    print("\n=== 测试流程完成 ===")

if __name__ == "__main__":
    test_report_payment_flow()
