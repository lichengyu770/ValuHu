import pytest
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.property import Property
from app.models.valuation import Valuation
from app.models.report import Report


@pytest.mark.unit
class TestModels:
    
    def test_user_model_creation(self, db_session: Session):
        user = User(
            username="model_test_user",
            email="model@example.com",
            hashed_password="hashed_password",
            role="individual",
            phone="13800138000",
            status="active"
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        assert user.id is not None
        assert user.username == "model_test_user"
        assert user.email == "model@example.com"
        assert user.role == "individual"
        assert user.status == "active"
    
    def test_property_model_creation(self, db_session: Session, test_user):
        property = Property(
            user_id=test_user.id,
            address="模型测试地址",
            city="杭州",
            district="西湖区",
            area=85.50,
            floor_level=3,
            total_floors=15,
            building_year=2016,
            property_type="residential",
            orientation="东",
            decoration_status="简装",
            rooms=2,
            bathrooms=1,
            latitude=30.2741,
            longitude=120.1551
        )
        db_session.add(property)
        db_session.commit()
        db_session.refresh(property)
        
        assert property.id is not None
        assert property.address == "模型测试地址"
        assert property.area == 85.50
        assert property.city == "杭州"
    
    def test_valuation_model_creation(self, db_session: Session, test_property):
        valuation = Valuation(
            property_id=test_property.id,
            estimated_price=1282500.00,
            confidence_level=0.90,
            features={
                "area": 85.50,
                "floor_level": 3,
                "building_year": 2016
            },
            result_details={
                "model_type": "random_forest",
                "prediction": 1282500.00
            }
        )
        db_session.add(valuation)
        db_session.commit()
        db_session.refresh(valuation)
        
        assert valuation.id is not None
        assert valuation.estimated_price == 1282500.00
        assert valuation.confidence_level == 0.90
    
    def test_report_model_creation(self, db_session: Session, test_valuation):
        report = Report(
            valuation_id=test_valuation.id,
            template_id=1,
            format="pdf",
            status="pending",
            file_url="/media/reports/test.pdf"
        )
        db_session.add(report)
        db_session.commit()
        db_session.refresh(report)
        
        assert report.id is not None
        assert report.format == "pdf"
        assert report.status == "pending"
    
    def test_user_relationships(self, db_session: Session, test_user):
        property = Property(
            user_id=test_user.id,
            address="关系测试房产",
            city="成都",
            district="武侯区",
            area=95.00
        )
        db_session.add(property)
        db_session.commit()
        
        assert test_user.properties is not None
        assert len(test_user.properties) >= 1
    
    def test_property_relationships(self, db_session: Session, test_property):
        valuation = Valuation(
            property_id=test_property.id,
            estimated_price=1425000.00,
            confidence_level=0.88
        )
        db_session.add(valuation)
        db_session.commit()
        
        assert test_property.valuations is not None
        assert len(test_property.valuations) >= 1
    
    def test_valuation_relationships(self, db_session: Session, test_valuation):
        report = Report(
            valuation_id=test_valuation.id,
            template_id=1,
            format="pdf",
            status="completed"
        )
        db_session.add(report)
        db_session.commit()
        
        assert test_valuation.reports is not None
        assert len(test_valuation.reports) >= 1
