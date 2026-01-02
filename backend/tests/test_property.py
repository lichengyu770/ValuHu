import pytest
from fastapi.testclient import TestClient


@pytest.mark.property
class TestPropertyAPI:
    
    def test_create_property(self, client: TestClient, auth_headers):
        response = client.post(
            "/api/v1/properties",
            headers=auth_headers,
            json={
                "address": "新建房产地址",
                "city": "上海",
                "district": "浦东新区",
                "area": 120.00,
                "floor_level": 10,
                "total_floors": 30,
                "building_year": 2015,
                "property_type": "residential",
                "orientation": "东南",
                "decoration_status": "毛坯",
                "rooms": 3,
                "bathrooms": 2,
                "latitude": 31.2304,
                "longitude": 121.4737
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["address"] == "新建房产地址"
        assert data["area"] == 120.00
        assert data["city"] == "上海"
        assert "id" in data
    
    def test_create_property_unauthorized(self, client: TestClient):
        response = client.post(
            "/api/v1/properties",
            json={
                "address": "测试地址",
                "city": "北京",
                "district": "朝阳区",
                "area": 100.00
            }
        )
        assert response.status_code == 401
    
    def test_get_properties_list(self, client: TestClient, auth_headers, test_property):
        response = client.get("/api/v1/properties", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) >= 1
    
    def test_get_properties_with_pagination(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/properties?page=1&page_size=10",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
    
    def test_get_property_detail(self, client: TestClient, auth_headers, test_property):
        response = client.get(
            f"/api/v1/properties/{test_property.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_property.id
        assert data["address"] == test_property.address
    
    def test_get_property_not_found(self, client: TestClient, auth_headers):
        response = client.get("/api/v1/properties/99999", headers=auth_headers)
        assert response.status_code == 404
    
    def test_update_property(self, client: TestClient, auth_headers, test_property):
        response = client.put(
            f"/api/v1/properties/{test_property.id}",
            headers=auth_headers,
            json={
                "address": "更新后的地址",
                "area": 150.00
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["address"] == "更新后的地址"
        assert data["area"] == 150.00
    
    def test_update_property_unauthorized(self, client: TestClient, test_property):
        response = client.put(
            f"/api/v1/properties/{test_property.id}",
            json={"address": "未授权更新"}
        )
        assert response.status_code == 401
    
    def test_delete_property(self, client: TestClient, auth_headers, test_property):
        response = client.delete(
            f"/api/v1/properties/{test_property.id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["message"] == "房产信息已删除"
    
    def test_search_properties_by_city(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/properties/search?city=北京",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    def test_search_properties_by_district(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/properties/search?district=朝阳区",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    def test_search_properties_by_price_range(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/properties/search?min_price=1000000&max_price=2000000",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    def test_search_properties_by_area_range(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/properties/search?min_area=50&max_area=150",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
    
    def test_batch_import_properties(self, client: TestClient, auth_headers):
        properties_data = [
            {
                "address": f"批量导入房产{i}",
                "city": "北京",
                "district": "海淀区",
                "area": 80.0 + i * 10,
                "floor_level": i + 1,
                "total_floors": 20,
                "building_year": 2010,
                "property_type": "residential"
            }
            for i in range(3)
        ]
        response = client.post(
            "/api/v1/properties/batch-import",
            headers=auth_headers,
            json={"properties": properties_data}
        )
        assert response.status_code == 201
        data = response.json()
        assert "imported_count" in data
        assert data["imported_count"] == 3
