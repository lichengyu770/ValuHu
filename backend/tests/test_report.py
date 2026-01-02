import pytest
from fastapi.testclient import TestClient


@pytest.mark.report
class TestReportAPI:
    
    def test_generate_report(self, client: TestClient, auth_headers, test_valuation):
        response = client.post(
            "/api/v1/reports",
            headers=auth_headers,
            json={
                "valuation_id": test_valuation.id,
                "template_id": 1,
                "format": "pdf"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert "status" in data
        assert data["valuation_id"] == test_valuation.id
    
    def test_generate_report_unauthorized(self, client: TestClient, test_valuation):
        response = client.post(
            "/api/v1/reports",
            json={
                "valuation_id": test_valuation.id,
                "template_id": 1,
                "format": "pdf"
            }
        )
        assert response.status_code == 401
    
    def test_generate_report_valuation_not_found(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/reports",
            headers=auth_headers,
            json={
                "valuation_id": 99999,
                "template_id": 1,
                "format": "pdf"
            }
        )
        assert response.status_code == 404
    
    def test_get_report_list(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/reports", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
    
    def test_get_report_detail(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/reports/1", headers=auth_headers)
        assert response.status_code in [200, 404]
    
    def test_get_report_not_found(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/reports/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_download_report(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/reports/1/download", headers=auth_headers)
        assert response.status_code in [200, 404]
    
    def test_get_report_templates(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/reports/templates", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert len(data["items"]) >= 0
    
    def test_generate_report_with_different_formats(self, client: TestClient, auth_headers, test_valuation):
        formats = ["pdf", "excel", "word"]
        for format_type in formats:
            response = client.post(
                "/api/v1/reports",
                headers=auth_headers,
                json={
                    "valuation_id": test_valuation.id,
                    "template_id": 1,
                    "format": format_type
                }
            )
            assert response.status_code == 201
            data = response.json()
            assert data["format"] == format_type
    
    def test_delete_report(self, client: TestClient, auth_headers):
        response = client.delete("/api/v1/reports/1", headers=auth_headers)
        assert response.status_code in [200, 404]
