from pydantic import BaseModel, Field, constr, confloat, conint
from typing import Optional, List
from datetime import datetime

# 资产基本信息模型
class AssetBase(BaseModel):
    property_id: constr(min_length=1, max_length=50) = Field(..., description="房产ID")
    community: constr(min_length=1, max_length=100) = Field(..., description="小区名称")
    city: constr(min_length=1, max_length=50) = Field(..., description="城市")
    district: constr(min_length=1, max_length=50) = Field(..., description="区域")
    area: confloat(gt=0, le=5000) = Field(..., description="面积")
    room_type: constr(min_length=1, max_length=20) = Field(..., description="户型")
    floor: conint(gt=0, le=100) = Field(..., description="所在楼层")
    total_floors: conint(gt=0, le=100) = Field(..., description="总楼层")
    age: conint(ge=0, le=100) = Field(..., description="房龄")
    orientation: constr(min_length=1, max_length=10) = Field(..., description="朝向")
    decoration: constr(min_length=1, max_length=20) = Field(..., description="装修程度")
    elevator: bool = Field(default=True, description="是否有电梯")
    parking_space: bool = Field(default=False, description="是否有车位")
    school_district: Optional[str] = Field(default=None, description="学区")
    nearby_facilities: Optional[List[str]] = Field(default=[], description="周边配套设施")

# 资产创建模型
class AssetCreate(AssetBase):
    pass

# 资产更新模型
class AssetUpdate(BaseModel):
    community: Optional[constr(min_length=1, max_length=100)] = Field(None, description="小区名称")
    city: Optional[constr(min_length=1, max_length=50)] = Field(None, description="城市")
    district: Optional[constr(min_length=1, max_length=50)] = Field(None, description="区域")
    area: Optional[confloat(gt=0, le=5000)] = Field(None, description="面积")
    room_type: Optional[constr(min_length=1, max_length=20)] = Field(None, description="户型")
    floor: Optional[conint(gt=0, le=100)] = Field(None, description="所在楼层")
    total_floors: Optional[conint(gt=0, le=100)] = Field(None, description="总楼层")
    age: Optional[conint(ge=0, le=100)] = Field(None, description="房龄")
    orientation: Optional[constr(min_length=1, max_length=10)] = Field(None, description="朝向")
    decoration: Optional[constr(min_length=1, max_length=20)] = Field(None, description="装修程度")
    elevator: Optional[bool] = Field(None, description="是否有电梯")
    parking_space: Optional[bool] = Field(None, description="是否有车位")
    school_district: Optional[str] = Field(None, description="学区")
    nearby_facilities: Optional[List[str]] = Field(None, description="周边配套设施")

# 资产响应模型
class AssetResponse(AssetBase):
    id: str = Field(..., description="资产ID")
    user_phone: str = Field(..., description="所属用户")
    estimated_price: Optional[float] = Field(None, description="估价")
    estimated_at: Optional[datetime] = Field(None, description="估价时间")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    
    class Config:
        orm_mode = True

# 资产列表响应模型
class AssetListResponse(BaseModel):
    total: int = Field(..., description="总数量")
    items: List[AssetResponse] = Field(..., description="资产列表")
    page: int = Field(..., description="当前页码")
    size: int = Field(..., description="每页大小")