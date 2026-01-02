import pytest
from typing import Generator, AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import get_db, Base
from app.models.user import User
from app.models.property import Property
from app.models.valuation import Valuation
from app.models.report import Report
from app.core.config import settings

TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    user = User(
        username="testuser",
        email="test@example.com",
        hashed_password="$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7bJYKjY.2W",
        role="individual",
        phone="13800138000",
        status="active"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_property(db_session: Session, test_user: User) -> Property:
    property = Property(
        user_id=test_user.id,
        address="测试地址123号",
        city="北京",
        district="朝阳区",
        area=100.50,
        floor_level=5,
        total_floors=20,
        building_year=2010,
        property_type="residential",
        orientation="南",
        decoration_status="精装修",
        rooms=3,
        bathrooms=2,
        latitude=39.9042,
        longitude=116.4074
    )
    db_session.add(property)
    db_session.commit()
    db_session.refresh(property)
    return property


@pytest.fixture
def test_valuation(db_session: Session, test_property: Property) -> Valuation:
    valuation = Valuation(
        property_id=test_property.id,
        estimated_price=1507500.00,
        confidence_level=0.85,
        features={
            "area": 100.50,
            "floor_level": 5,
            "building_year": 2010,
            "rooms": 3,
            "bathrooms": 2
        },
        result_details={
            "model_type": "linear",
            "prediction": 1507500.00,
            "feature_importance": {}
        }
    )
    db_session.add(valuation)
    db_session.commit()
    db_session.refresh(valuation)
    return valuation


@pytest.fixture
def auth_headers(client: TestClient, test_user: User) -> dict:
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "testuser", "password": "testpassword"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
