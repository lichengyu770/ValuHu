from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Dict, Optional
import json
import os
import time
from datetime import datetime
from app.core.config import settings
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetListResponse
from app.api.v1.auth import get_current_user
from app.services.cache import cache

# 创建路由实例
router = APIRouter()

# 资产数据文件路径
ASSETS_FILE = os.path.join(settings.DATA_DIR, "assets.json")

# 确保数据目录和文件存在
os.makedirs(settings.DATA_DIR, exist_ok=True)
if not os.path.exists(ASSETS_FILE):
    with open(ASSETS_FILE, "w") as f:
        json.dump([], f, ensure_ascii=False, indent=2)

# 获取所有资产
def get_assets():
    with open(ASSETS_FILE, "r") as f:
        return json.load(f)

# 保存资产
def save_assets(assets):
    with open(ASSETS_FILE, "w") as f:
        json.dump(assets, f, ensure_ascii=False, indent=2)

# 根据ID获取资产
def get_asset_by_id(asset_id: str):
    assets = get_assets()
    for asset in assets:
        if asset["id"] == asset_id:
            return asset
    return None

# 根据用户手机号获取资产
def get_assets_by_user(phone: str):
    assets = get_assets()
    return [asset for asset in assets if asset["user_phone"] == phone]

# 创建资产
@router.post("/assets", response_model=AssetResponse, status_code=status.HTTP_201_CREATED, tags=["资产管理"])
def create_asset(
    asset_data: AssetCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    创建新的资产
    
    - **参数**: 资产相关信息
    - **返回**: 创建的资产详情
    - **权限**: 需要登录
    """
    assets = get_assets()
    
    # 检查房产ID是否已存在
    for asset in assets:
        if asset["property_id"] == asset_data.property_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该房产ID已存在"
            )
    
    # 创建资产记录
    asset = {
        "id": f"asset_{int(time.time())}_{len(assets) + 1}",
        "user_phone": current_user["phone"],
        "property_id": asset_data.property_id,
        "community": asset_data.community,
        "city": asset_data.city,
        "district": asset_data.district,
        "area": asset_data.area,
        "room_type": asset_data.room_type,
        "floor": asset_data.floor,
        "total_floors": asset_data.total_floors,
        "age": asset_data.age,
        "orientation": asset_data.orientation,
        "decoration": asset_data.decoration,
        "elevator": asset_data.elevator,
        "parking_space": asset_data.parking_space,
        "school_district": asset_data.school_district,
        "nearby_facilities": asset_data.nearby_facilities,
        "estimated_price": None,
        "estimated_at": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # 保存资产
    assets.append(asset)
    save_assets(assets)
    
    return AssetResponse(**asset)

# 获取资产列表
@router.get("/assets", response_model=AssetListResponse, tags=["资产管理"])
def get_assets_list(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页大小"),
    community: Optional[str] = Query(None, description="小区名称搜索"),
    city: Optional[str] = Query(None, description="城市搜索"),
    current_user: dict = Depends(get_current_user)
):
    """
    获取资产列表
    
    - **参数**: 分页参数和搜索条件
    - **返回**: 资产列表和分页信息
    - **权限**: 需要登录
    """
    assets = get_assets_by_user(current_user["phone"])
    
    # 应用搜索条件
    if community:
        assets = [asset for asset in assets if community in asset["community"]]
    if city:
        assets = [asset for asset in assets if city in asset["city"]]
    
    # 计算分页
    total = len(assets)
    start = (page - 1) * size
    end = start + size
    paginated_assets = assets[start:end]
    
    # 转换为响应模型
    asset_responses = [AssetResponse(**asset) for asset in paginated_assets]
    
    return AssetListResponse(
        total=total,
        items=asset_responses,
        page=page,
        size=size
    )

# 获取单个资产
@router.get("/assets/{asset_id}", response_model=AssetResponse, tags=["资产管理"])
def get_asset(
    asset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    获取单个资产详情
    
    - **参数**: 资产ID
    - **返回**: 资产详情
    - **权限**: 需要登录且只能访问自己的资产
    """
    asset = get_asset_by_id(asset_id)
    
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="资产不存在"
        )
    
    # 验证资产归属
    if asset["user_phone"] != current_user["phone"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问该资产"
        )
    
    return AssetResponse(**asset)

# 更新资产
@router.put("/assets/{asset_id}", response_model=AssetResponse, tags=["资产管理"])
def update_asset(
    asset_id: str,
    asset_data: AssetUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    更新资产信息
    
    - **参数**: 资产ID和更新数据
    - **返回**: 更新后的资产详情
    - **权限**: 需要登录且只能更新自己的资产
    """
    assets = get_assets()
    asset_index = None
    
    # 查找资产并验证归属
    for i, asset in enumerate(assets):
        if asset["id"] == asset_id:
            if asset["user_phone"] != current_user["phone"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="无权更新该资产"
                )
            asset_index = i
            break
    
    if asset_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="资产不存在"
        )
    
    # 更新资产信息
    updated_asset = assets[asset_index].copy()
    update_data = asset_data.model_dump(exclude_unset=True)
    updated_asset.update(update_data)
    updated_asset["updated_at"] = datetime.now().isoformat()
    
    # 保存更新后的资产
    assets[asset_index] = updated_asset
    save_assets(assets)
    
    return AssetResponse(**updated_asset)

# 删除资产
@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["资产管理"])
def delete_asset(
    asset_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    删除资产
    
    - **参数**: 资产ID
    - **返回**: 无内容
    - **权限**: 需要登录且只能删除自己的资产
    """
    assets = get_assets()
    asset_index = None
    
    # 查找资产并验证归属
    for i, asset in enumerate(assets):
        if asset["id"] == asset_id:
            if asset["user_phone"] != current_user["phone"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="无权删除该资产"
                )
            asset_index = i
            break
    
    if asset_index is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="资产不存在"
        )
    
    # 删除资产
    del assets[asset_index]
    save_assets(assets)
    
    return None

# 批量导入资产
@router.post("/assets/import", response_model=Dict[str, int], tags=["资产管理"])
def import_assets(
    assets_data: List[AssetCreate],
    current_user: dict = Depends(get_current_user)
):
    """
    批量导入资产
    
    - **参数**: 资产列表
    - **返回**: 导入结果统计
    - **权限**: 需要登录
    """
    assets = get_assets()
    success_count = 0
    failed_count = 0
    
    for asset_data in assets_data:
        try:
            # 检查房产ID是否已存在
            asset_exists = any(asset["property_id"] == asset_data.property_id for asset in assets)
            if asset_exists:
                failed_count += 1
                continue
            
            # 创建资产记录
            asset = {
                "id": f"asset_{int(time.time())}_{len(assets) + 1}_{success_count}",
                "user_phone": current_user["phone"],
                "property_id": asset_data.property_id,
                "community": asset_data.community,
                "city": asset_data.city,
                "district": asset_data.district,
                "area": asset_data.area,
                "room_type": asset_data.room_type,
                "floor": asset_data.floor,
                "total_floors": asset_data.total_floors,
                "age": asset_data.age,
                "orientation": asset_data.orientation,
                "decoration": asset_data.decoration,
                "elevator": asset_data.elevator,
                "parking_space": asset_data.parking_space,
                "school_district": asset_data.school_district,
                "nearby_facilities": asset_data.nearby_facilities,
                "estimated_price": None,
                "estimated_at": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # 添加到资产列表
            assets.append(asset)
            success_count += 1
        except Exception as e:
            print(f"导入资产失败: {e}")
            failed_count += 1
    
    # 保存导入的资产
    save_assets(assets)
    
    return {
        "total": len(assets_data),
        "success": success_count,
        "failed": failed_count
    }
