from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import datetime
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.property import Property
from backend.app.models.valuation import Valuation
from backend.app.schemas.valuation import ValuationRequest, ValuationResponse, ValuationDetailedResponse
from backend.algorithms.valuation_model import estimate_price
from backend.algorithms.data_cleaner import clean_data

router = APIRouter(prefix="/v2/valuate", tags=["valuation-v2"])

# v2估价请求模型
class ValuationRequestV2(BaseModel):
    address: str = Field(..., description="房产地址")
    city: str = Field(..., description="城市")
    district: str = Field(..., description="区县")
    area: float = Field(..., ge=10, description="建筑面积（平方米）")
    rooms: int = Field(..., ge=1, le=10, description="房间数量")
    bathrooms: int = Field(..., ge=1, le=5, description="卫生间数量")
    floor_level: int = Field(..., ge=1, description="所在楼层")
    total_floors: int = Field(..., ge=1, description="总楼层")
    building_year: int = Field(..., ge=1900, le=datetime.datetime.now().year + 5, description="建筑年份")
    property_type: str = Field(..., description="房产类型：apartment/villa/townhouse/commercial")
    orientation: str = Field(..., description="朝向：north/east/south/west/northeast/northwest/southeast/southwest")
    decoration_status: str = Field(..., description="装修状况：rough/simple/fine/luxury")
    latitude: Optional[float] = Field(None, description="纬度")
    longitude: Optional[float] = Field(None, description="经度")
    additional_features: Optional[Dict[str, Any]] = Field(None, description="额外特征")
    model_type: str = Field("ensemble", description="估价模型类型：linear_regression/random_forest/market_comparison/cost/income/ensemble")

# v2估价响应模型
class ValuationResponseV2(BaseModel):
    estimated_price: float = Field(..., description="估价总价（元）")
    price_per_sqm: float = Field(..., description="每平方米价格（元）")
    confidence_level: float = Field(..., ge=0, le=1, description="置信度")
    model_version: str = Field(..., description="模型版本")
    model_type: str = Field(..., description="使用的模型类型")
    valuation_time: str = Field(..., description="估价时间")
    valuation_id: str = Field(..., description="估价ID")

# v2详细估价报告模型
class ValuationDetailedReportV2(BaseModel):
    basic_info: Dict[str, Any] = Field(..., description="基础信息")
    estimated_price: float = Field(..., description="估价总价")
    price_per_sqm: float = Field(..., description="每平方米价格")
    confidence_level: float = Field(..., description="置信度")
    valuation_factors: List[Dict[str, Any]] = Field(..., description="估价因素分析")
    feature_importance: Dict[str, float] = Field(..., description="特征重要性")
    market_comparison: Dict[str, Any] = Field(..., description="市场对比")
    model_details: Dict[str, Any] = Field(..., description="模型详情")
    valuation_time: str = Field(..., description="估价时间")

@router.post("/", response_model=ValuationDetailedResponse)
async def valuate_property(request: ValuationRequestV2, db: Session = Depends(get_db)):
    """POST /api/v2/valuate - 房产估价API V2"""
    try:
        # 1. 数据清洗和预处理
        valuation_data = {
            "address": request.address,
            "city": request.city,
            "district": request.district,
            "area": request.area,
            "rooms": request.rooms,
            "bathrooms": request.bathrooms,
            "floor_level": request.floor_level,
            "total_floors": request.total_floors,
            "building_year": request.building_year,
            "property_type": request.property_type,
            "orientation": request.orientation,
            "decoration_status": request.decoration_status,
            "latitude": request.latitude,
            "longitude": request.longitude,
            **(request.additional_features or {})
        }
        
        cleaned_data = clean_data(valuation_data)
        
        # 2. 调用估价模型
        valuation_result = estimate_price(cleaned_data, request.model_type)
        
        # 3. 生成详细的估价报告
        detailed_report = generate_detailed_report(valuation_data, valuation_result)
        
        # 4. 保存估价结果到数据库
        # 这里需要根据实际的数据库模型进行调整
        
        return detailed_report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"估价失败：{str(e)}")

def generate_detailed_report(input_data: Dict[str, Any], valuation_result: Dict[str, Any]) -> ValuationDetailedReportV2:
    """生成详细的估价报告"""
    # 1. 计算各因素对价格的影响
    valuation_factors = []
    
    # 面积因素
    valuation_factors.append({
        "name": "面积",
        "value": f"{input_data['area']}平方米",
        "impact": "positive" if input_data['area'] > 90 else "neutral",
        "description": "面积是影响房价的主要因素，一般来说面积越大总价越高"
    })
    
    # 楼层因素
    floor_impact = "positive"
    if input_data['floor_level'] <= 3:
        floor_impact = "neutral"
    elif input_data['floor_level'] > input_data['total_floors'] * 0.8:
        floor_impact = "neutral"
    valuation_factors.append({
        "name": "楼层",
        "value": f"{input_data['floor_level']}/{input_data['total_floors']}",
        "impact": floor_impact,
        "description": "中间楼层通常价格较高，底层和顶层价格相对较低"
    })
    
    # 房龄因素
    current_year = datetime.datetime.now().year
    age = current_year - input_data['building_year']
    age_impact = "positive" if age < 5 else "neutral" if age < 15 else "negative"
    valuation_factors.append({
        "name": "房龄",
        "value": f"{age}年",
        "impact": age_impact,
        "description": "房龄越新，房屋状况越好，价格相对较高"
    })
    
    # 朝向因素
    orientation_impact = "positive" if input_data['orientation'] in ['south', 'southeast', 'southwest'] else "neutral"
    valuation_factors.append({
        "name": "朝向",
        "value": input_data['orientation'],
        "impact": orientation_impact,
        "description": "南向房屋采光好，价格相对较高"
    })
    
    # 装修状况因素
    decoration_impact = {
        "luxury": "positive",
        "fine": "positive",
        "simple": "neutral",
        "rough": "negative"
    }.get(input_data['decoration_status'], "neutral")
    valuation_factors.append({
        "name": "装修状况",
        "value": input_data['decoration_status'],
        "impact": decoration_impact,
        "description": "装修档次越高，房屋价值越高"
    })
    
    # 2. 生成市场对比数据（模拟）
    market_comparison = {
        "average_price_per_sqm": 15000,  # 模拟数据
        "district_average": 16500,       # 模拟数据
        "property_type_average": 15500,  # 模拟数据
        "price_rank": "middle",          # 模拟数据
        "comparison_count": 50           # 模拟数据
    }
    
    # 3. 生成详细报告
    model_details = {
        "model_type": valuation_result["model_type"],
        "model_version": valuation_result["model_version"],
        "valuation_method": "AI模型估价"
    }
    
    # 如果是集成模型，添加各模型的详细信息
    if valuation_result["model_type"] == "ensemble" and "model_details" in valuation_result:
        model_details["ensemble_info"] = valuation_result["model_details"]
        model_details["outlier_detection"] = valuation_result.get("outlier_detection", {})
    
    return ValuationDetailedReportV2(
        basic_info={
            "address": input_data["address"],
            "city": input_data["city"],
            "district": input_data["district"],
            "property_type": input_data["property_type"],
            "area": input_data["area"],
            "rooms": input_data["rooms"],
            "bathrooms": input_data["bathrooms"],
            "floor": f"{input_data['floor_level']}/{input_data['total_floors']}",
            "building_year": input_data["building_year"],
            "orientation": input_data["orientation"],
            "decoration_status": input_data["decoration_status"]
        },
        estimated_price=valuation_result["estimated_price"],
        price_per_sqm=valuation_result["price_per_sqm"],
        confidence_level=valuation_result["confidence_level"],
        valuation_factors=valuation_factors,
        feature_importance=valuation_result["result_details"]["feature_importance"],
        market_comparison=market_comparison,
        model_details=model_details,
        valuation_time=datetime.datetime.now().isoformat()
    )
