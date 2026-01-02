import pytest
from fastapi.testclient import TestClient


@pytest.mark.valuation
class TestValuationAPI:
    
    def test_create_valuation(self, client: TestClient, auth_headers, test_property):
        response = client.post(
            "/api/v1/valuations",
            headers=auth_headers,
            json={
                "property_id": test_property.id,
                "model_type": "linear"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "estimated_price" in data
        assert "confidence_level" in data
        assert data["property_id"] == test_property.id
    
    def test_create_valuation_unauthorized(self, client: TestClient, test_property):
        response = client.post(
            "/api/v1/valuations",
            json={
                "property_id": test_property.id,
                "model_type": "linear"
            }
        )
        assert response.status_code == 401
    
    def test_create_valuation_property_not_found(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/valuations",
            headers=auth_headers,
            json={
                "property_id": 99999,
                "model_type": "linear"
            }
        )
        assert response.status_code == 404
    
    def test_get_valuation_list(self, client: TestClient, auth_headers, test_valuation):
        response = client.get("/api/v1/valuations", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1
    
    def test_get_valuation_detail(self, client: TestClient, auth_headers, test_valuation):
        response = client.get(
            f"/api/v1/valuations/{test_valuation.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_valuation.id
        assert data["estimated_price"] == test_valuation.estimated_price
    
    def test_get_valuation_not_found(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/valuations/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_batch_create_valuations(self, client: TestClient, auth_headers, test_property):
        response = client.post(
            "/api/v1/valuations/batch",
            headers=auth_headers,
            json={
                "property_ids": [test_property.id],
                "model_type": "random_forest"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "valuations" in data
        assert len(data["valuations"]) == 1
    
    def test_get_valuation_by_property(self, client: TestClient, auth_headers, test_valuation):
        response = client.get(
            f"/api/v1/valuations/property/{test_valuation.property_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 1
    
    def test_valuation_with_different_models(self, client: TestClient, auth_headers, test_property):
        models = ["linear", "random_forest", "ensemble"]
        for model in models:
            response = client.post(
                "/api/v1/valuations",
                headers=auth_headers,
                json={
                    "property_id": test_property.id,
                    "model_type": model
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert "estimated_price" in data
            assert "confidence_level" in data
    
    def test_valuation_features_validation(self, client: TestClient, auth_headers, test_property):
        response = client.post(
            "/api/v1/valuations",
            headers=auth_headers,
            json={
                "property_id": test_property.id,
                "model_type": "linear"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "features" in data
        assert isinstance(data["features"], dict)
        assert "area" in data["features"]
    
    def test_valuation_result_details(self, client: TestClient, auth_headers, test_property):
        response = client.post(
            "/api/v1/valuations",
            headers=auth_headers,
            json={
                "property_id": test_property.id,
                "model_type": "ensemble"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "result_details" in data
        assert isinstance(data["result_details"], dict)
