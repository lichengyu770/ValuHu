"""
ValuHub 认证数据模型
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """用户角色枚举"""
    INDIVIDUAL = "individual"
    GOVERNMENT = "government"
    ENTERPRISE = "enterprise"
    ACADEMIC = "academic"
    DEVELOPER = "developer"


class UserRegister(BaseModel):
    """
    用户注册请求模型
    """
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, max_length=100, description="密码")
    role: UserRole = Field(default=UserRole.INDIVIDUAL, description="用户角色")
    phone: Optional[str] = Field(None, max_length=20, description="手机号码")
    avatar_url: Optional[str] = Field(None, max_length=255, description="头像URL")


class UserLogin(BaseModel):
    """
    用户登录请求模型
    """
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserResponse(BaseModel):
    """
    用户响应模型
    """
    id: int
    username: str
    email: str
    role: UserRole
    phone: Optional[str]
    avatar_url: Optional[str]
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]


class Token(BaseModel):
    """
    令牌响应模型
    """
    access_token: str
    token_type: str = "bearer"
