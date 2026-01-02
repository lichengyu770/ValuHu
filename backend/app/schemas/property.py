"""
ValuHub 房产数据模型
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


class PropertyType(str, Enum):
    """房产类型枚举"""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"


class PropertyStatus(str, Enum):
    """房产状态枚举"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SOLD = "sold"
    PENDING = "pending"


class PropertyCreate(BaseModel):
    """
    创建房产请求模型
    """
    address: str = Field(..., max_length=255, description="房产地址")
    city: str = Field(..., max_length=50, description="城市")
    district: Optional[str] = Field(None, max_length=50, description="区域")
    area: float = Field(..., gt=0, description="建筑面积（平方米）")
    floor_level: Optional[int] = Field(None, ge=1, le=100, description="楼层")
    building_year: Optional[int] = Field(None, ge=1900, le=2025, description="建筑年份")
    property_type: PropertyType = Field(default=PropertyType.RESIDENTIAL, description="房产类型")
    rooms: Optional[int] = Field(None, ge=1, le=20, description="房间数")
    bathrooms: Optional[int] = Field(None, ge=1, le=10, description="卫生间数")
    orientation: Optional[str] = Field(None, max_length=20, description="朝向")
    decoration_status: Optional[str] = Field(None, max_length=20, description="装修状态")
    latitude: Optional[float] = Field(None, ge=-90, le=90, description="纬度")
    longitude: Optional[float] = Field(None, ge=-180, le=180, description="经度")


class PropertyUpdate(BaseModel):
    """
    更新房产请求模型
    """
    address: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=50)
    area: Optional[float] = Field(None, gt=0)
    floor_level: Optional[int] = Field(None, ge=1, le=100)
    building_year: Optional[int] = Field(None, ge=1900, le=2025)
    property_type: Optional[PropertyType]
    rooms: Optional[int] = Field(None, ge=1, le=20)
    bathrooms: Optional[int] = Field(None, ge=1, le=10)
    orientation: Optional[str] = Field(None, max_length=20)
    decoration_status: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: Optional[PropertyStatus]


class PropertyResponse(BaseModel):
    """
    房产响应模型
    """
    id: int
    user_id: int
    address: str
    city: str
    district: Optional[str]
    area: float
    floor_level: Optional[int]
    building_year: Optional[int]
    property_type: PropertyType
    rooms: Optional[int]
    bathrooms: Optional[int]
    orientation: Optional[str]
    decoration_status: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: PropertyStatus
    created_at: Optional[str]
    updated_at: Optional[str]


class PropertySearch(BaseModel):
    """
    房产搜索请求模型
    """
    city: Optional[str] = Field(None, max_length=50)
    district: Optional[str] = Field(None, max_length=50)
    property_type: Optional[PropertyType]
    min_area: Optional[float] = Field(None, gt=0)
    max_area: Optional[float] = Field(None, gt=0)
    min_rooms: Optional[int] = Field(None, ge=1)
    max_rooms: Optional[int] = Field(None, ge=1)
    min_price: Optional[float] = Field(None, gt=0)
    max_price: Optional[float] = Field(None, gt=0)
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")


class PropertyBatchImport(BaseModel):
    """
    批量导入房产请求模型
    """
    properties: List[PropertyCreate]
