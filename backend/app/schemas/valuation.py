"""
ValuHub 估价数据模型
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from datetime import datetime


class ValuationCreate(BaseModel):
    """
    创建估价请求模型
    """
    property_id: int = Field(..., description="房产ID")
    model_type: Optional[str] = Field(None, description="估价模型类型", regex="^(linear|random_forest|ensemble)$")


class ValuationResponse(BaseModel):
    """
    估价响应模型
    """
    id: int
    property_id: int
    user_id: int
    estimated_price: float
    price_per_sqm: float
    confidence_level: float  # 0.00-1.00
    model_version: str
    features: Optional[Dict[str, Any]]
    result_details: Optional[Dict[str, Any]]
    created_at: str


class ValuationBatchCreate(BaseModel):
    """
    批量估价请求模型
    """
    property_ids: list[int] = Field(..., description="房产ID列表")
    model_type: Optional[str] = Field(None, description="估价模型类型", regex="^(linear|random_forest|ensemble)$")


class MarketTrendRequest(BaseModel):
    """
    市场趋势分析请求模型
    """
    city: str = Field(..., description="城市")
    district: Optional[str] = Field(None, description="区域")
    property_type: Optional[str] = Field(None, description="房产类型")
    start_date: Optional[str] = Field(None, description="开始日期")
    end_date: Optional[str] = Field(None, description="结束日期")


class MarketTrendResponse(BaseModel):
    """
    市场趋势响应模型
    """
    city: str
    district: Optional[str]
    property_type: Optional[str]
    trend_data: list[dict]
    summary: dict
