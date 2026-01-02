"""
ValuHub 用户模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql.sqltype import TIMESTAMP
from datetime import datetime

from app.database.database import Base


class User(Base):
    """
    用户表
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True)  # 'individual', 'government', 'enterprise', 'academic', 'developer'
    phone = Column(String(20))
    avatar_url = Column(String(255))
    status = Column(String(20), default="active", index=True)  # 'active', 'inactive', 'suspended'
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(TIMESTAMP)
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "avatar_url": self.avatar_url,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None
        }
