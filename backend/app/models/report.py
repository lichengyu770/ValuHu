"""
ValuHub 报告模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.sql.sqltype import TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Report(Base):
    """
    报告表
    """
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    valuation_id = Column(Integer, ForeignKey("valuations.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    template_id = Column(Integer)
    file_url = Column(String(255))
    file_name = Column(String(255))
    file_size = Column(Integer)
    status = Column(String(20), default="pending", index=True)  # 'pending', 'generating', 'completed', 'failed'
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    completed_at = Column(TIMESTAMP)
    
    # 关系
    valuation = relationship("Valuation")
    user = relationship("User")
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "valuation_id": self.valuation_id,
            "user_id": self.user_id,
            "template_id": self.template_id,
            "file_url": self.file_url,
            "file_name": self.file_name,
            "file_size": self.file_size,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class ReportTemplate(Base):
    """
    报告模板表
    """
    __tablename__ = "report_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    template_type = Column(String(50))  # 'standard', 'detailed', 'government', 'enterprise'
    template_content = Column(JSON)
    is_default = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "template_type": self.template_type,
            "template_content": self.template_content,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
