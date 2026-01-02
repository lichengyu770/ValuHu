"""
ValuHub 报告数据模型
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class ReportStatus(str, Enum):
    """报告状态枚举"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ReportTemplateType(str, Enum):
    """报告模板类型枚举"""
    STANDARD = "standard"
    DETAILED = "detailed"
    GOVERNMENT = "government"
    ENTERPRISE = "enterprise"


class ReportGenerateRequest(BaseModel):
    """
    生成报告请求模型
    """
    valuation_id: int = Field(..., description="估价ID")
    user_id: int = Field(..., description="用户ID")
    template_id: Optional[int] = Field(None, description="报告模板ID")


class ReportResponse(BaseModel):
    """
    报告响应模型
    """
    id: int
    valuation_id: int
    user_id: int
    template_id: Optional[int]
    file_url: str
    file_name: str
    file_size: int
    status: ReportStatus
    created_at: Optional[str]
    completed_at: Optional[str]


class ReportTemplateCreate(BaseModel):
    """
    创建报告模板请求模型
    """
    name: str = Field(..., max_length=100, description="模板名称")
    description: Optional[str] = Field(None, description="模板描述")
    template_type: ReportTemplateType = Field(default=ReportTemplateType.STANDARD, description="模板类型")
    template_content: Optional[dict] = Field(None, description="模板内容")
    is_default: bool = Field(False, description="是否为默认模板")


class ReportTemplateResponse(BaseModel):
    """
    报告模板响应模型
    """
    id: int
    name: str
    description: Optional[str]
    template_type: ReportTemplateType
    template_content: Optional[dict]
    is_default: bool
    created_at: Optional[str]
    updated_at: Optional[str]
