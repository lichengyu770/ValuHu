"""
ValuHub 数据分析路由
市场数据、区域统计、趋势分析
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database.database import get_db
from app.models.property import Property
from app.models.valuation import Valuation
from app.schemas.data import AreaStatisticsResponse, DataExportRequest, DataExportResponse

router = APIRouter()


@router.get("/area-statistics", response_model=AreaStatisticsResponse)
async def get_area_statistics(
    city: str = Query(..., description="城市"),
    district: Optional[str] = Query(None, description="区域"),
    property_type: Optional[str] = Query(None, description="房产类型"),
    db: Session = Depends(get_db)
):
    """
    区域统计
    """
    query = db.query(Property)
    
    # 应用过滤条件
    if city:
        query = query.filter(Property.city == city)
    if district:
        query = query.filter(Property.district == district)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    
    # 计算统计数据
    total_properties = query.count()
    total_valuations = db.query(Valuation).join(Property).filter(
        Property.city == city
    ).count()
    
    # 计算平均价格
    avg_price_result = db.query(func.avg(Valuation.estimated_price)).join(Property).filter(
        Property.city == city
    ).first()
    avg_price = float(avg_price_result[0]) if avg_price_result and avg_price_result[0] else 0
    
    # 计算每平米价格
    avg_area_result = db.query(func.avg(Property.area)).filter(Property.city == city).first()
    avg_area = float(avg_area_result[0]) if avg_area_result and avg_area_result[0] else 0
    avg_price_per_sqm = avg_price / avg_area if avg_area > 0 else 0
    
    # 价格范围
    price_result = db.query(Valuation.estimated_price).join(Property).filter(
        Property.city == city
    ).all()
    prices = [v.estimated_price for v in price_result if v.estimated_price]
    
    if prices:
        min_price = min(prices)
        max_price = max(prices)
    else:
        min_price = 0
        max_price = 0
    
    price_range = {
        "min": float(min_price),
        "max": float(max_price),
        "range": f"{min_price:.0f} - {max_price:.0f}"
    }
    
    # 房产类型分布
    property_type_distribution = {}
    for prop in query.all():
        ptype = prop.property_type
        if ptype not in property_type_distribution:
            property_type_distribution[ptype] = 0
        property_type_distribution[ptype] += 1
    
    return AreaStatisticsResponse(
        city=city,
        district=district,
        property_type=property_type,
        total_properties=total_properties,
        total_valuations=total_valuations,
        avg_price=avg_price,
        avg_price_per_sqm=avg_price_per_sqm,
        price_range=price_range,
        property_type_distribution=property_type_distribution
    )


@router.post("/export", response_model=DataExportResponse)
async def export_data(
    export_params: DataExportRequest,
    db: Session = Depends(get_db)
):
    """
    数据导出
    """
    # TODO: 实现真实的数据导出功能
    # 这里先返回模拟数据
    
    file_url = f"/media/exports/export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_params.format}"
    file_name = f"valuhub_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_params.format}"
    file_size = 204800  # 模拟文件大小 200KB
    
    return DataExportResponse(
        file_url=file_url,
        file_name=file_name,
        file_size=file_size,
        download_url=file_url
    )
