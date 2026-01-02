"""
ValuHub 数据分析数据模型
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AreaStatisticsResponse(BaseModel):
    """
    区域统计响应模型
    """
    city: str
    district: Optional[str]
    total_properties: int
    total_valuations: int
    avg_price: float
    avg_price_per_sqm: float
    price_range: dict
    property_type_distribution: dict


class DataExportRequest(BaseModel):
    """
    数据导出请求模型
    """
    data_type: str = Field(..., description="数据类型：properties, valuations, reports")
    start_date: Optional[str] = Field(None, description="开始日期")
    end_date: Optional[str] = Field(None, description="结束日期")
    format: str = Field(default="csv", description="导出格式：csv, excel, json")


class DataExportResponse(BaseModel):
    """
    数据导出响应模型
    """
    file_url: str
    file_name: str
    file_size: int
    download_url: str
