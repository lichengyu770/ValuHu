from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import json
import os
import time
from datetime import datetime
from app.core.config import settings
from app.schemas.payment import OrderCreateRequest, OrderResponse, PaymentCallbackRequest
from app.api.v1.auth import get_current_user

# 创建路由实例
router = APIRouter()

# 确保数据目录存在
os.makedirs(settings.DATA_DIR, exist_ok=True)

# 初始化订单数据文件
orders_file = os.path.join(settings.DATA_DIR, "orders.json")
if not os.path.exists(orders_file):
    with open(orders_file, "w") as f:
        json.dump([], f, ensure_ascii=False, indent=2)

# 获取所有订单
def get_orders():
    with open(orders_file, "r") as f:
        return json.load(f)

# 保存订单
def save_orders(orders):
    with open(orders_file, "w") as f:
        json.dump(orders, f, ensure_ascii=False, indent=2)

# 创建报告支付订单（固定金额9.9元）
@router.post("/create-report-order", response_model=OrderResponse)
def create_report_order(
    request_data: OrderCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # 固定报告费用为9.9元
        report_amount = 9.9
        
        # 生成订单ID
        order_id = f"order_{int(time.time())}_{len(get_orders()) + 1}"
        
        # 创建订单数据
        order = {
            "order_id": order_id,
            "user_phone": current_user["phone"],
            "project_id": request_data.project_id,
            "report_id": request_data.report_id,
            "amount": report_amount,
            "status": "pending",
            "pay_type": request_data.pay_type,
            "created_at": datetime.now().isoformat(),
            "pay_time": None,
            "transaction_id": None
        }
        
        # 保存订单
        orders = get_orders()
        orders.append(order)
        save_orders(orders)
        
        # 生成微信沙箱支付参数
        import random
        nonce_str = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=16))
        timestamp = str(int(time.time()))
        prepay_id = f"wx20{timestamp[2:]}"
        
        # 模拟微信支付参数（沙箱环境）
        wx_pay_params = {
            "appId": settings.WX_PAY_APPID or "wx8888888888888888",
            "timeStamp": timestamp,
            "nonceStr": nonce_str,
            "package": f"prepay_id={prepay_id}",
            "signType": "MD5",
            "paySign": "57A94F9A083B83C543128A3E0B0B9D7D"
        }
        
        return {
            "order_id": order_id,
            "project_id": request_data.project_id,
            "report_id": request_data.report_id,
            "amount": report_amount,
            "status": "pending",
            "created_at": order["created_at"],
            "pay_url": f"/api/v1/payment/pay/{order_id}",
            "wx_pay_params": wx_pay_params
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建报告订单失败: {str(e)}"
        )

# 创建通用订单
@router.post("/create-order", response_model=OrderResponse)
def create_order(
    request_data: OrderCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        # 生成订单ID
        order_id = f"order_{int(time.time())}_{len(get_orders()) + 1}"
        
        # 创建订单数据
        order = {
            "order_id": order_id,
            "user_phone": current_user["phone"],
            "project_id": request_data.project_id,
            "report_id": request_data.report_id,
            "amount": request_data.amount,
            "status": "pending",
            "pay_type": request_data.pay_type,
            "created_at": datetime.now().isoformat(),
            "pay_time": None,
            "transaction_id": None
        }
        
        # 保存订单
        orders = get_orders()
        orders.append(order)
        save_orders(orders)
        
        # 模拟生成微信支付参数（实际项目中应该调用微信支付API）
        wx_pay_params = {
            "appId": settings.WX_PAY_APPID or "wx1234567890123456",
            "timeStamp": str(int(time.time())),
            "nonceStr": f"nonce_{int(time.time())}",
            "package": f"prepay_id=wx{int(time.time())}",
            "signType": "MD5",
            "paySign": "test_pay_sign"
        }
        
        return {
            "order_id": order_id,
            "project_id": request_data.project_id,
            "report_id": request_data.report_id,
            "amount": request_data.amount,
            "status": "pending",
            "created_at": order["created_at"],
            "pay_url": f"/api/v1/payment/pay/{order_id}",
            "wx_pay_params": wx_pay_params
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建订单失败: {str(e)}"
        )

# 获取订单详情
@router.get("/order/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    orders = get_orders()
    
    # 查找订单
    for order in orders:
        if order["order_id"] == order_id:
            # 验证订单归属
            if order["user_phone"] != current_user["phone"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="无权访问该订单"
                )
            return OrderResponse(**order)
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="订单不存在"
    )

# 获取用户订单列表
@router.get("/orders", response_model=List[OrderResponse])
def get_user_orders(
    limit: int = 10,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    orders = get_orders()
    
    # 筛选当前用户的订单
    user_orders = [
        order for order in orders 
        if order["user_phone"] == current_user["phone"]
    ]
    
    # 按创建时间倒序排序
    user_orders.sort(key=lambda x: x["created_at"], reverse=True)
    
    # 分页
    paginated_orders = user_orders[offset:offset + limit]
    
    return [OrderResponse(**order) for order in paginated_orders]

# 支付回调
@router.post("/callback")
def payment_callback(request_data: PaymentCallbackRequest):
    try:
        orders = get_orders()
        
        # 查找订单
        for order in orders:
            if order["order_id"] == request_data.order_id:
                # 更新订单状态
                order["status"] = "paid" if request_data.status == "success" else "failed"
                order["transaction_id"] = request_data.transaction_id
                order["pay_time"] = request_data.pay_time
                
                # 如果支付成功，更新报告状态为已付费
                if request_data.status == "success":
                    reports_file = os.path.join(settings.DATA_DIR, "reports.json")
                    if os.path.exists(reports_file):
                        with open(reports_file, "r") as f:
                            reports = json.load(f)
                        
                        for report in reports:
                            if report["id"] == order["report_id"]:
                                report["is_paid"] = True
                                break
                        
                        with open(reports_file, "w") as f:
                            json.dump(reports, f, ensure_ascii=False, indent=2)
                
                save_orders(orders)
                return {"status": "success", "message": "订单已更新"}
        
        return {"status": "error", "message": "订单不存在"}
        
    except Exception as e:
        return {"status": "error", "message": f"处理回调失败: {str(e)}"}

# 模拟支付成功
@router.get("/mock-pay/{order_id}")
def mock_pay(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        orders = get_orders()
        
        # 查找订单
        for order in orders:
            if order["order_id"] == order_id:
                # 验证订单归属
                if order["user_phone"] != current_user["phone"]:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="无权访问该订单"
                    )
                
                # 更新订单状态为已支付
                order["status"] = "paid"
                order["pay_time"] = datetime.now().isoformat()
                order["transaction_id"] = f"trans_{int(time.time())}"
                
                # 更新报告状态为已付费
                reports_file = os.path.join(settings.DATA_DIR, "reports.json")
                if os.path.exists(reports_file):
                    with open(reports_file, "r") as f:
                        reports = json.load(f)
                    
                    for report in reports:
                        if report["id"] == order["report_id"]:
                            report["is_paid"] = True
                            break
                    
                    with open(reports_file, "w") as f:
                        json.dump(reports, f, ensure_ascii=False, indent=2)
                
                save_orders(orders)
                return {"status": "success", "message": "支付成功"}
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"支付失败: {str(e)}"
        )
