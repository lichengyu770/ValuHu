import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestAPIIntegration:
    
    def test_complete_valuation_workflow(self, client: TestClient, auth_headers):
        step1 = client.post(
            "/api/v1/auth/register",
            json={
                "username": "workflow_user",
                "email": "workflow@example.com",
                "password": "password123",
                "role": "individual",
                "phone": "13800138999"
            }
        )
        assert step1.status_code == 201
        user_data = step1.json()
        
        step2 = client.post(
            "/api/v1/properties",
            headers=auth_headers,
            json={
                "address": "工作流测试房产",
                "city": "深圳",
                "district": "南山区",
                "area": 90.00,
                "floor_level": 8,
                "total_floors": 25,
                "building_year": 2018,
                "property_type": "residential",
                "orientation": "南",
                "decoration_status": "精装修",
                "rooms": 2,
                "bathrooms": 1
            }
        )
        assert step2.status_code == 201
        property_data = step2.json()
        
        step3 = client.post(
            "/api/v1/valuations",
            headers=auth_headers,
            json={
                "property_id": property_data["id"],
                "model_type": "ensemble"
            }
        )
        assert step3.status_code == 201
        valuation_data = step3.json()
        
        step4 = client.post(
            "/api/v1/reports",
            headers=auth_headers,
            json={
                "valuation_id": valuation_data["id"],
                "template_id": 1,
                "format": "pdf"
            }
        )
        assert step4.status_code == 201
        report_data = step4.json()
        
        assert "id" in user_data
        assert "id" in property_data
        assert "id" in valuation_data
        assert "id" in report_data
    
    def test_batch_operations_workflow(self, client: TestClient, auth_headers):
        properties_data = [
            {
                "address": f"批量测试房产{i}",
                "city": "广州",
                "district": "天河区",
                "area": 100.0 + i * 10,
                "floor_level": i + 1,
                "total_floors": 20,
                "building_year": 2012,
                "property_type": "residential"
            }
            for i in range(5)
        ]
        
        step1 = client.post(
            "/api/v1/properties/batch-import",
            headers=auth_headers,
            json={"properties": properties_data}
        )
        assert step1.status_code == 201
        import_data = step1.json()
        
        property_ids = [p["id"] for p in import_data["imported_properties"]]
        
        step2 = client.post(
            "/api/v1/valuations/batch",
            headers=auth_headers,
            json={
                "property_ids": property_ids,
                "model_type": "random_forest"
            }
        )
        assert step2.status_code == 201
        batch_valuation_data = step2.json()
        
        assert import_data["imported_count"] == 5
        assert len(batch_valuation_data["valuations"]) == 5
    
    def test_search_and_export_workflow(self, client: TestClient, auth_headers):
        step1 = client.get(
            "/api/v1/properties/search?city=北京&min_area=80&max_area=120",
            headers=auth_headers
        )
        assert step1.status_code == 200
        search_data = step1.json()
        
        step2 = client.post(
            "/api/v1/data/export/properties",
            headers=auth_headers,
            json={
                "format": "excel",
                "filters": {
                    "city": "北京",
                    "min_area": 80,
                    "max_area": 120
                }
            }
        )
        assert step2.status_code == 200
        export_data = step2.json()
        
        assert "items" in search_data
        assert "download_url" in export_data
    
    def test_error_handling_workflow(self, client: TestClient):
        invalid_login = client.post(
            "/api/v1/auth/login",
            json={"username": "invalid", "password": "invalid"}
        )
        assert invalid_login.status_code == 401
        
        unauthorized_access = client.get("/api/v1/properties")
        assert unauthorized_access.status_code == 401
        
        not_found = client.get("/api/v1/properties/99999")
        assert not_found.status_code == 401
    
    def test_rate_limiting(self, client: TestClient, auth_headers):
        for i in range(10):
            response = client.get("/api/v1/data/market-overview", headers=auth_headers)
            assert response.status_code in [200, 429]
