import pytest
from fastapi.testclient import TestClient


@pytest.mark.data
class TestDataAPI:
    
    def test_get_area_statistics(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/data/area-statistics?city=北京",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "city" in data
        assert "avg_price" in data
        assert "property_count" in data
    
    def test_get_area_statistics_unauthorized(self, client: TestClient):
        response = client.get("/api/v1/data/area-statistics?city=北京")
        assert response.status_code == 401
    
    def test_get_price_trend(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/data/price-trend?city=北京&start_date=2024-01-01&end_date=2024-12-31",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "city" in data
        assert "trend_data" in data
    
    def test_get_property_type_distribution(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/data/property-type-distribution?city=北京",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "distribution" in data
    
    def test_export_properties(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/data/export/properties",
            headers=auth_headers,
            json={
                "format": "excel",
                "filters": {
                    "city": "北京"
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
    
    def test_export_properties_unauthorized(self, client: TestClient):
        response = client.post(
            "/api/v1/data/export/properties",
            json={"format": "excel"}
        )
        assert response.status_code == 401
    
    def test_export_valuations(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/data/export/valuations",
            headers=auth_headers,
            json={
                "format": "excel",
                "filters": {
                    "start_date": "2024-01-01",
                    "end_date": "2024-12-31"
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
    
    def test_export_reports(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/data/export/reports",
            headers=auth_headers,
            json={
                "format": "excel",
                "filters": {}
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "download_url" in data
    
    def test_get_market_overview(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/data/market-overview", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_properties" in data
        assert "total_valuations" in data
        assert "avg_price" in data
    
    def test_export_with_different_formats(self, client: TestClient, auth_headers):
        formats = ["excel", "csv", "json"]
        for format_type in formats:
            response = client.post(
                "/api/v1/data/export/properties",
                headers=auth_headers,
                json={
                    "format": format_type,
                    "filters": {}
                }
            )
            assert response.status_code == 200
            data = response.json()
            assert "download_url" in data
    
    def test_get_area_statistics_with_district(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/data/area-statistics?city=北京&district=朝阳区",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "city" in data
        assert "district" in data
        assert data["district"] == "朝阳区"
