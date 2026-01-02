"""
ValuHub 房产模型
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Numeric, ForeignKey
from sqlalchemy.sql.sqltype import TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Property(Base):
    """
    房产表
    """
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    tenant_id = Column(Integer, index=True, nullable=False)  # 租户ID，实现多租户隔离
    address = Column(String(255), nullable=False, index=True)
    city = Column(String(50), nullable=False, index=True)
    district = Column(String(50), index=True)
    area = Column(Numeric(10, 2), nullable=False)  # 建筑面积
    floor_level = Column(Integer)
    building_year = Column(Integer)
    property_type = Column(String(50))  # 'residential', 'commercial', 'industrial'
    rooms = Column(Integer)
    bathrooms = Column(Integer)
    orientation = Column(String(20))
    decoration_status = Column(String(20))
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    status = Column(String(20), default="active", index=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = relationship("User", back_populates="properties")
    valuations = relationship("Valuation", back_populates="property")
    
    def to_dict(self):
        """转换为字典"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "address": self.address,
            "city": self.city,
            "district": self.district,
            "area": float(self.area) if self.area else None,
            "floor_level": self.floor_level,
            "building_year": self.building_year,
            "property_type": self.property_type,
            "rooms": self.rooms,
            "bathrooms": self.bathrooms,
            "orientation": self.orientation,
            "decoration_status": self.decoration_status,
            "latitude": float(self.latitude) if self.latitude else None,
            "longitude": float(self.longitude) if self.longitude else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
