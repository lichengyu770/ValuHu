"""
ValuHub 估价路由
AI估价、历史记录、批量处理
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database.database import get_db
from app.models.valuation import Valuation
from app.models.property import Property
from app.models.user import User
from app.schemas.valuation import (
    ValuationCreate,
    ValuationResponse,
    ValuationBatchCreate,
    MarketTrendRequest,
    MarketTrendResponse
)
from app.api.v1.auth import get_current_user

router = APIRouter()


@router.post("", response_model=ValuationResponse, status_code=status.HTTP_201_CREATED)
async def create_valuation(
    valuation_data: ValuationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建估价
    """
    # 验证房产是否存在
    property = db.query(Property).filter(Property.id == valuation_data.property_id).first()
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="房产不存在"
        )
    
    # 验证房产是否属于当前用户
    if property.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限估价此房产"
        )
    
    # 调用不同的估价模型
    model_type = valuation_data.model_type or "ensemble"
    
    # TODO: 实际调用AI估价模型，这里先使用模拟数据
    # 根据不同模型类型调整估价结果
    base_price = property.area * 15000
    
    if model_type == "linear":
        estimated_price = base_price * 0.95
        confidence_level = 0.82
        model_version = "v1.0-linear"
    elif model_type == "random_forest":
        estimated_price = base_price * 1.05
        confidence_level = 0.88
        model_version = "v1.0-random-forest"
    else:  # ensemble
        estimated_price = base_price
        confidence_level = 0.92
        model_version = "v1.0-ensemble"
    
    price_per_sqm = estimated_price / property.area if property.area > 0 else 0
    
    features = {
        "area": property.area,
        "floor_level": property.floor_level,
        "building_year": property.building_year,
        "property_type": property.property_type,
        "rooms": property.rooms,
        "bathrooms": property.bathrooms,
        "orientation": property.orientation,
        "decoration_status": property.decoration_status
    }
    
    result_details = {
        "method": f"{model_type} 估价模型",
        "factors": ["面积", "楼层", "房龄", "区域", "房产类型"],
        "market_comparison": {
            "avg_price": 14000,
            "price_range": [12000, 16000]
        }
    }
    
    # 创建估价记录
    new_valuation = Valuation(
        property_id=valuation_data.property_id,
        user_id=current_user.id,
        estimated_price=estimated_price,
        price_per_sqm=price_per_sqm,
        confidence_level=confidence_level,
        model_version=model_version,
        features=features,
        result_details=result_details
    )
    
    db.add(new_valuation)
    db.commit()
    db.refresh(new_valuation)
    
    return ValuationResponse(
        id=new_valuation.id,
        property_id=new_valuation.property_id,
        user_id=new_valuation.user_id,
        estimated_price=float(new_valuation.estimated_price),
        price_per_sqm=float(new_valuation.price_per_sqm),
        confidence_level=float(new_valuation.confidence_level),
        model_version=new_valuation.model_version,
        features=new_valuation.features,
        result_details=new_valuation.result_details,
        created_at=new_valuation.created_at.isoformat()
    )


@router.get("", response_model=List[ValuationResponse])
async def get_valuations(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(20, ge=1, le=100, description="返回数量"),
    user_id: Optional[int] = Query(None, description="用户ID过滤"),
    property_id: Optional[int] = Query(None, description="房产ID过滤"),
    db: Session = Depends(get_db)
):
    """
    获取估价列表
    """
    query = db.query(Valuation)
    
    # 应用过滤条件
    if user_id:
        query = query.filter(Valuation.user_id == user_id)
    if property_id:
        query = query.filter(Valuation.property_id == property_id)
    
    # 按创建时间倒序
    query = query.order_by(Valuation.created_at.desc())
    
    valuations = query.offset(skip).limit(limit).all()
    
    return [
        ValuationResponse(
            id=v.id,
            property_id=v.property_id,
            user_id=v.user_id,
            estimated_price=float(v.estimated_price),
            price_per_sqm=float(v.price_per_sqm),
            confidence_level=float(v.confidence_level),
            model_version=v.model_version,
            features=v.features,
            result_details=v.result_details,
            created_at=v.created_at.isoformat()
        ) for v in valuations
    ]


@router.get("/{valuation_id}", response_model=ValuationResponse)
async def get_valuation(valuation_id: int, db: Session = Depends(get_db)):
    """
    获取估价详情
    """
    valuation = db.query(Valuation).filter(Valuation.id == valuation_id).first()
    if not valuation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="估价记录不存在"
        )
    
    return ValuationResponse(
        id=valuation.id,
        property_id=valuation.property_id,
        user_id=valuation.user_id,
        estimated_price=float(valuation.estimated_price),
        price_per_sqm=float(valuation.price_per_sqm),
        confidence_level=float(valuation.confidence_level),
        model_version=valuation.model_version,
        features=valuation.features,
        result_details=valuation.result_details,
        created_at=valuation.created_at.isoformat()
    )


@router.get("/property/{property_id}", response_model=List[ValuationResponse])
async def get_property_valuations(
    property_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50, description="返回数量"),
    db: Session = Depends(get_db)
):
    """
    获取房产的估价历史
    """
    valuations = db.query(Valuation).filter(
        Valuation.property_id == property_id
    ).order_by(Valuation.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        ValuationResponse(
            id=v.id,
            property_id=v.property_id,
            user_id=v.user_id,
            estimated_price=float(v.estimated_price),
            price_per_sqm=float(v.price_per_sqm),
            confidence_level=float(v.confidence_level),
            model_version=v.model_version,
            features=v.features,
            result_details=v.result_details,
            created_at=v.created_at.isoformat()
        ) for v in valuations
    ]


@router.post("/batch", status_code=status.HTTP_201_CREATED)
async def batch_valuation(
    batch_data: ValuationBatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    批量估价
    """
    created_valuations = []
    
    # 使用不同的估价模型
    model_type = batch_data.model_type or "ensemble"
    
    for property_id in batch_data.property_ids:
        # 验证房产是否存在
        property = db.query(Property).filter(Property.id == property_id).first()
        if not property:
            continue
        
        # 验证房产是否属于当前用户
        if property.user_id != current_user.id:
            continue
        
        # TODO: 实际调用AI估价模型，这里先使用模拟数据
        # 根据不同模型类型调整估价结果
        base_price = property.area * 15000
        
        if model_type == "linear":
            estimated_price = base_price * 0.95
            confidence_level = 0.82
            model_version = "v1.0-linear"
        elif model_type == "random_forest":
            estimated_price = base_price * 1.05
            confidence_level = 0.88
            model_version = "v1.0-random-forest"
        else:  # ensemble
            estimated_price = base_price
            confidence_level = 0.92
            model_version = "v1.0-ensemble"
        
        price_per_sqm = estimated_price / property.area if property.area > 0 else 0
        
        features = {
            "area": property.area,
            "floor_level": property.floor_level,
            "building_year": property.building_year,
            "property_type": property.property_type,
            "rooms": property.rooms,
            "bathrooms": property.bathrooms
        }
        
        result_details = {
            "method": f"{model_type} 估价模型",
            "factors": ["面积", "楼层", "房龄", "区域"]
        }
        
        new_valuation = Valuation(
            property_id=property_id,
            user_id=current_user.id,
            estimated_price=estimated_price,
            price_per_sqm=price_per_sqm,
            confidence_level=confidence_level,
            model_version=model_version,
            features=features,
            result_details=result_details
        )
        
        db.add(new_valuation)
        created_valuations.append(new_valuation)
    
    db.commit()
    
    return {
        "message": f"成功创建{len(created_valuations)}个估价",
        "count": len(created_valuations),
        "valuations": [v.id for v in created_valuations]
    }


@router.get("/market-trend", response_model=MarketTrendResponse)
async def get_market_trend(trend_params: MarketTrendRequest, db: Session = Depends(get_db)):
    """
    市场趋势分析
    """
    # TODO: 实现真实的市场趋势分析
    # 这里先返回模拟数据
    
    trend_data = [
        {"date": "2025-01", "avg_price": 14000, "count": 120},
        {"date": "2025-02", "avg_price": 14200, "count": 135},
        {"date": "2025-03", "avg_price": 14500, "count": 150},
        {"date": "2025-04", "avg_price": 14300, "count": 148},
        {"date": "2025-05", "avg_price": 14800, "count": 155},
        {"date": "2025-06", "avg_price": 15000, "count": 160}
    ]
    
    summary = {
        "avg_price": 14466.67,
        "trend": "上升",
        "growth_rate": "7.14%"
    }
    
    return MarketTrendResponse(
        city=trend_params.city,
        district=trend_params.district,
        property_type=trend_params.property_type,
        trend_data=trend_data,
        summary=summary
    )
