import pytest
from fastapi.testclient import TestClient


@pytest.mark.auth
class TestAuthentication:
    
    def test_register_user(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "password123",
                "role": "individual",
                "phone": "13900139000"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["role"] == "individual"
        assert "id" in data
        assert "access_token" in data
    
    def test_register_duplicate_username(self, client: TestClient, test_user):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser",
                "email": "another@example.com",
                "password": "password123",
                "role": "individual",
                "phone": "13900139001"
            }
        )
        assert response.status_code == 400
    
    def test_register_invalid_email(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser2",
                "email": "invalid-email",
                "password": "password123",
                "role": "individual",
                "phone": "13900139002"
            }
        )
        assert response.status_code == 422
    
    def test_register_weak_password(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/register",
            json={
                "username": "testuser3",
                "email": "test3@example.com",
                "password": "123",
                "role": "individual",
                "phone": "13900139003"
            }
        )
        assert response.status_code == 422
    
    def test_login_success(self, client: TestClient, test_user):
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "testuser", "password": "testpassword"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "user" in data
        assert data["user"]["username"] == "testuser"
    
    def test_login_invalid_username(self, client: TestClient):
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "nonexistent", "password": "testpassword"}
        )
        assert response.status_code == 401
    
    def test_login_invalid_password(self, client: TestClient, test_user):
        response = client.post(
            "/api/v1/auth/login",
            json={"username": "testuser", "password": "wrongpassword"}
        )
        assert response.status_code == 401
    
    def test_get_profile(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/auth/profile", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "email" in data
        assert "role" in data
    
    def test_get_profile_unauthorized(self, client: TestClient):
        response = client.get("/api/v1/auth/profile")
        assert response.status_code == 401
    
    def test_logout(self, client: TestClient, auth_headers):
        response = client.post("/api/v1/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "成功退出登录"
