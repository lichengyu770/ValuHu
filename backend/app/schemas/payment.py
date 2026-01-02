from pydantic import BaseModel, Field
from typing import Optional

# 订单创建请求模型
class OrderCreateRequest(BaseModel):
    project_id: str = Field(..., description="项目ID")
    report_id: str = Field(..., description="报告ID")
    amount: float = Field(..., description="订单金额")
    pay_type: str = Field(default="wxpay", description="支付类型")

# 订单响应模型
class OrderResponse(BaseModel):
    order_id: str = Field(..., description="订单ID")
    project_id: str = Field(..., description="项目ID")
    report_id: str = Field(..., description="报告ID")
    amount: float = Field(..., description="订单金额")
    status: str = Field(..., description="订单状态")
    created_at: str = Field(..., description="创建时间")
    pay_url: Optional[str] = Field(None, description="支付链接")
    wx_pay_params: Optional[dict] = Field(None, description="微信支付参数")

# 支付回调请求模型
class PaymentCallbackRequest(BaseModel):
    order_id: str = Field(..., description="订单ID")
    transaction_id: str = Field(..., description="交易ID")
    status: str = Field(..., description="支付状态")
    pay_time: str = Field(..., description="支付时间")
    pay_type: str = Field(..., description="支付类型")
