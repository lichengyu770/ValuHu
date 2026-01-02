"""
ValuHub 估价模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, JSON, Text
from sqlalchemy.sql.sqltype import TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Valuation(Base):
    """
    估价记录表
    """
    __tablename__ = "valuations"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    tenant_id = Column(Integer, index=True, nullable=False)  # 租户ID，实现多租户隔离
    estimated_price = Column(Numeric(15, 2), nullable=False)  # 估价金额
    price_per_sqm = Column(Numeric(10, 2))  # 每平米价格
    confidence_level = Column(Numeric(5, 2))  # 置信度 0.00-1.00
    model_version = Column(String(50))  # 模型版本
    features = Column(JSON)  # 估价特征
    result_details = Column(JSON)  # 详细结果
    created_at = Column(TIMESTAMP, default=datetime.utcnow, index=True)
    
    # 关系
    property = relationship("Property", back_populates="valuations")
    user = relationship("User")
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "property_id": self.property_id,
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "estimated_price": float(self.estimated_price) if self.estimated_price else None,
            "price_per_sqm": float(self.price_per_sqm) if self.price_per_sqm else None,
            "confidence_level": float(self.confidence_level) if self.confidence_level else None,
            "model_version": self.model_version,
            "features": self.features,
            "result_details": self.result_details,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
