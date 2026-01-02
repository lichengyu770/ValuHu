"""
ValuHub 房产路由
房产CRUD、搜索、筛选
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.database import get_db
from app.models.property import Property
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertySearch,
    PropertyBatchImport
)

router = APIRouter()


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    创建房产
    """
    new_property = Property(
        user_id=current_user_id,
        address=property_data.address,
        city=property_data.city,
        district=property_data.district,
        area=property_data.area,
        floor_level=property_data.floor_level,
        building_year=property_data.building_year,
        property_type=property_data.property_type,
        rooms=property_data.rooms,
        bathrooms=property_data.bathrooms,
        orientation=property_data.orientation,
        decoration_status=property_data.decoration_status,
        latitude=property_data.latitude,
        longitude=property_data.longitude,
        status="active"
    )
    
    db.add(new_property)
    db.commit()
    db.refresh(new_property)
    
    return PropertyResponse(
        id=new_property.id,
        user_id=new_property.user_id,
        address=new_property.address,
        city=new_property.city,
        district=new_property.district,
        area=float(new_property.area),
        floor_level=new_property.floor_level,
        building_year=new_property.building_year,
        property_type=new_property.property_type,
        rooms=new_property.rooms,
        bathrooms=new_property.bathrooms,
        orientation=new_property.orientation,
        decoration_status=new_property.decoration_status,
        latitude=float(new_property.latitude) if new_property.latitude else None,
        longitude=float(new_property.longitude) if new_property.longitude else None,
        status=new_property.status,
        created_at=new_property.created_at.isoformat(),
        updated_at=new_property.updated_at.isoformat()
    )


@router.get("", response_model=List[PropertyResponse])
async def get_properties(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(20, ge=1, le=100, description="返回数量"),
    user_id: Optional[int] = Query(None, description="用户ID过滤"),
    city: Optional[str] = Query(None, description="城市过滤"),
    district: Optional[str] = Query(None, description="区域过滤"),
    property_type: Optional[str] = Query(None, description="房产类型过滤"),
    status: Optional[str] = Query(None, description="状态过滤"),
    db: Session = Depends(get_db)
):
    """
    获取房产列表
    """
    query = db.query(Property)
    
    # 应用过滤条件
    if user_id:
        query = query.filter(Property.user_id == user_id)
    if city:
        query = query.filter(Property.city == city)
    if district:
        query = query.filter(Property.district == district)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if status:
        query = query.filter(Property.status == status)
    
    properties = query.offset(skip).limit(limit).all()
    
    return [PropertyResponse(
        id=p.id,
        user_id=p.user_id,
        address=p.address,
        city=p.city,
        district=p.district,
        area=float(p.area),
        floor_level=p.floor_level,
        building_year=p.building_year,
        property_type=p.property_type,
        rooms=p.rooms,
        bathrooms=p.bathrooms,
        orientation=p.orientation,
        decoration_status=p.decoration_status,
        latitude=float(p.latitude) if p.latitude else None,
        longitude=float(p.longitude) if p.longitude else None,
        status=p.status,
        created_at=p.created_at.isoformat(),
        updated_at=p.updated_at.isoformat()
    ) for p in properties]


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: int, db: Session = Depends(get_db)):
    """
    获取房产详情
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="房产不存在"
        )
    
    return PropertyResponse(
        id=property.id,
        user_id=property.user_id,
        address=property.address,
        city=property.city,
        district=property.district,
        area=float(property.area),
        floor_level=property.floor_level,
        building_year=property.building_year,
        property_type=property.property_type,
        rooms=property.rooms,
        bathrooms=property.bathrooms,
        orientation=property.orientation,
        decoration_status=property.decoration_status,
        latitude=float(property.latitude) if property.latitude else None,
        longitude=float(property.longitude) if property.longitude else None,
        status=property.status,
        created_at=property.created_at.isoformat(),
        updated_at=property.updated_at.isoformat()
    )


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    更新房产信息
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="房产不存在"
        )
    
    # 检查权限
    if property.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限修改此房产"
        )
    
    # 更新字段
    update_data = property_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(property, field, value)
    
    property.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(property)
    
    return PropertyResponse(
        id=property.id,
        user_id=property.user_id,
        address=property.address,
        city=property.city,
        district=property.district,
        area=float(property.area),
        floor_level=property.floor_level,
        building_year=property.building_year,
        property_type=property.property_type,
        rooms=property.rooms,
        bathrooms=property.bathrooms,
        orientation=property.orientation,
        decoration_status=property.decoration_status,
        latitude=float(property.latitude) if property.latitude else None,
        longitude=float(property.longitude) if property.longitude else None,
        status=property.status,
        created_at=property.created_at.isoformat(),
        updated_at=property.updated_at.isoformat()
    )


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    删除房产
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="房产不存在"
        )
    
    # 检查权限
    if property.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限删除此房产"
        )
    
    db.delete(property)
    db.commit()
    
    return None


@router.get("/search", response_model=List[PropertyResponse])
async def search_properties(search_params: PropertySearch, db: Session = Depends(get_db)):
    """
    搜索房产
    """
    query = db.query(Property)
    
    # 应用搜索条件
    if search_params.city:
        query = query.filter(Property.city == search_params.city)
    if search_params.district:
        query = query.filter(Property.district == search_params.district)
    if search_params.property_type:
        query = query.filter(Property.property_type == search_params.property_type)
    if search_params.min_area:
        query = query.filter(Property.area >= search_params.min_area)
    if search_params.max_area:
        query = query.filter(Property.area <= search_params.max_area)
    if search_params.min_rooms:
        query = query.filter(Property.rooms >= search_params.min_rooms)
    if search_params.max_rooms:
        query = query.filter(Property.rooms <= search_params.max_rooms)
    if search_params.min_price:
        query = query.filter(Property.estimated_price >= search_params.min_price)
    if search_params.max_price:
        query = query.filter(Property.estimated_price <= search_params.max_price)
    
    # 分页
    skip = (search_params.page - 1) * search_params.page_size
    properties = query.offset(skip).limit(search_params.page_size).all()
    
    return [PropertyResponse(
        id=p.id,
        user_id=p.user_id,
        address=p.address,
        city=p.city,
        district=p.district,
        area=float(p.area),
        floor_level=p.floor_level,
        building_year=p.building_year,
        property_type=p.property_type,
        rooms=p.rooms,
        bathrooms=p.bathrooms,
        orientation=p.orientation,
        decoration_status=p.decoration_status,
        latitude=float(p.latitude) if p.latitude else None,
        longitude=float(p.longitude) if p.longitude else None,
        status=p.status,
        created_at=p.created_at.isoformat(),
        updated_at=p.updated_at.isoformat()
    ) for p in properties]


@router.post("/batch", status_code=status.HTTP_201_CREATED)
async def batch_import_properties(
    batch_data: PropertyBatchImport,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    批量导入房产
    """
    created_properties = []
    for prop_data in batch_data.properties:
        new_property = Property(
            user_id=current_user_id,
            address=prop_data.address,
            city=prop_data.city,
            district=prop_data.district,
            area=prop_data.area,
            floor_level=prop_data.floor_level,
            building_year=prop_data.building_year,
            property_type=prop_data.property_type,
            rooms=prop_data.rooms,
            bathrooms=prop_data.bathrooms,
            orientation=prop_data.orientation,
            decoration_status=prop_data.decoration_status,
            status="active"
        )
        db.add(new_property)
        db.flush()
        created_properties.append(new_property)
    
    db.commit()
    
    return {
        "message": f"成功导入{len(created_properties)}个房产",
        "count": len(created_properties),
        "properties": [p.id for p in created_properties]
    }
