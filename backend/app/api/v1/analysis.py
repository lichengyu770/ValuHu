from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Dict, Optional
import json
import os
import time
from datetime import datetime
from app.core.config import settings
from app.api.v1.auth import get_current_user
from app.services.cache import cache

# 创建路由实例
router = APIRouter()

# 资产数据文件路径
ASSETS_FILE = os.path.join(settings.DATA_DIR, "assets.json")
# 估价历史文件路径
VALUATION_HISTORY_FILE = os.path.join(settings.DATA_DIR, "valuation_history.json")

# 确保数据文件存在
os.makedirs(settings.DATA_DIR, exist_ok=True)
for file_path in [ASSETS_FILE, VALUATION_HISTORY_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, "w") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

# 获取资产数据
def get_assets():
    with open(ASSETS_FILE, "r") as f:
        return json.load(f)

# 获取估价历史数据
def get_valuation_history():
    with open(VALUATION_HISTORY_FILE, "r") as f:
        return json.load(f)

# 根据用户手机号获取估价历史
def get_valuation_history_by_user(phone: str):
    history = get_valuation_history()
    return [item for item in history if item["user_phone"] == phone]

# 获取资产价值分布
@router.get("/asset-value-distribution", tags=["数据分析"])
async def get_asset_value_distribution(
    city: Optional[str] = Query(None, description="城市过滤"),
    district: Optional[str] = Query(None, description="区域过滤"),
    current_user: dict = Depends(get_current_user)
):
    """
    获取资产价值分布
    
    - **参数**: 可选的城市和区域过滤条件
    - **返回**: 不同资产类型的价值分布
    - **权限**: 需要登录
    """
    assets = get_assets()
    
    # 过滤用户资产
    user_assets = [asset for asset in assets if asset["user_phone"] == current_user["phone"]]
    
    # 应用城市和区域过滤
    if city:
        user_assets = [asset for asset in user_assets if asset["city"] == city]
    if district:
        user_assets = [asset for asset in user_assets if asset["district"] == district]
    
    # 统计资产类型分布
    value_distribution = {
        "电子设备": 0,
        "家具": 0,
        "机械设备": 0,
        "车辆": 0,
        "其他": 0
    }
    
    # 这里需要根据实际资产类型字段进行调整
    # 目前假设资产类型字段为 asset_type
    for asset in user_assets:
        asset_type = asset.get("asset_type", "其他")
        estimated_price = asset.get("estimated_price", 0)
        if asset_type in value_distribution:
            value_distribution[asset_type] += estimated_price
        else:
            value_distribution["其他"] += estimated_price
    
    return {
        "distribution": value_distribution,
        "total_assets": len(user_assets)
    }

# 获取资产价值趋势
@router.get("/asset-value-trend", tags=["数据分析"])
async def get_asset_value_trend(
    period: str = Query("month", description="时间周期: day, week, month, year"),
    current_user: dict = Depends(get_current_user)
):
    """
    获取资产价值趋势
    
    - **参数**: 时间周期
    - **返回**: 资产价值随时间的变化趋势
    - **权限**: 需要登录
    """
    history = get_valuation_history_by_user(current_user["phone"])
    
    # 按时间分组统计
    trend_data = {}
    
    for item in history:
        # 解析估价时间
        valuation_time = datetime.fromisoformat(item["valuation_time"])
        
        # 根据周期格式化时间
        if period == "day":
            time_key = valuation_time.strftime("%Y-%m-%d")
        elif period == "week":
            time_key = f"{valuation_time.year}-W{valuation_time.isocalendar()[1]:02d}"
        elif period == "month":
            time_key = valuation_time.strftime("%Y-%m")
        elif period == "year":
            time_key = str(valuation_time.year)
        else:
            time_key = valuation_time.strftime("%Y-%m")
        
        # 累计价值
        if time_key not in trend_data:
            trend_data[time_key] = 0
        trend_data[time_key] += item["result"].get("total_price", 0)
    
    # 排序并返回
    sorted_trend = dict(sorted(trend_data.items()))
    
    return {
        "period": period,
        "trend": sorted_trend
    }

# 获取资产平均价值
@router.get("/average-asset-value", tags=["数据分析"])
async def get_average_asset_value(
    city: Optional[str] = Query(None, description="城市过滤"),
    current_user: dict = Depends(get_current_user)
):
    """
    获取资产平均价值
    
    - **参数**: 可选的城市过滤条件
    - **返回**: 不同城市的资产平均价值
    - **权限**: 需要登录
    """
    assets = get_assets()
    
    # 过滤用户资产
    user_assets = [asset for asset in assets if asset["user_phone"] == current_user["phone"]]
    
    # 应用城市过滤
    if city:
        user_assets = [asset for asset in user_assets if asset["city"] == city]
    
    # 按城市分组计算平均价值
    city_stats = {}
    
    for asset in user_assets:
        asset_city = asset["city"]
        estimated_price = asset.get("estimated_price", 0)
        
        if asset_city not in city_stats:
            city_stats[asset_city] = {
                "total_value": 0,
                "asset_count": 0
            }
        
        city_stats[asset_city]["total_value"] += estimated_price
        city_stats[asset_city]["asset_count"] += 1
    
    # 计算平均值
    average_values = {}
    for city, stats in city_stats.items():
        if stats["asset_count"] > 0:
            average_values[city] = {
                "average_value": round(stats["total_value"] / stats["asset_count"], 2),
                "asset_count": stats["asset_count"]
            }
    
    return average_values

# 获取资产类型统计
@router.get("/asset-type-statistics", tags=["数据分析"])
async def get_asset_type_statistics(
    current_user: dict = Depends(get_current_user)
):
    """
    获取资产类型统计
    
    - **返回**: 不同资产类型的数量和总价值统计
    - **权限**: 需要登录
    """
    assets = get_assets()
    
    # 过滤用户资产
    user_assets = [asset for asset in assets if asset["user_phone"] == current_user["phone"]]
    
    # 统计资产类型
    type_stats = {}
    
    for asset in user_assets:
        asset_type = asset.get("asset_type", "其他")
        estimated_price = asset.get("estimated_price", 0)
        
        if asset_type not in type_stats:
            type_stats[asset_type] = {
                "count": 0,
                "total_value": 0
            }
        
        type_stats[asset_type]["count"] += 1
        type_stats[asset_type]["total_value"] += estimated_price
    
    return type_stats

# 获取快速统计数据
@router.get("/quick-stats", tags=["数据分析"])
async def get_quick_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    获取快速统计数据
    
    - **返回**: 总资产数量、总价值、已估价资产数量等快速统计信息
    - **权限**: 需要登录
    """
    assets = get_assets()
    
    # 过滤用户资产
    user_assets = [asset for asset in assets if asset["user_phone"] == current_user["phone"]]
    
    total_assets = len(user_assets)
    valued_assets = sum(1 for asset in user_assets if asset.get("estimated_price") is not None)
    total_value = sum(asset.get("estimated_price", 0) for asset in user_assets)
    
    return {
        "total_assets": total_assets,
        "valued_assets": valued_assets,
        "total_value": round(total_value, 2),
        "unvalued_assets": total_assets - valued_assets,
        "valuation_rate": round(valued_assets / total_assets * 100, 2) if total_assets > 0 else 0
    }

# 获取最新估价结果
@router.get("/latest-valuation-results", tags=["数据分析"])
async def get_latest_valuation_results(
    limit: int = Query(10, ge=1, le=100, description="返回数量限制"),
    current_user: dict = Depends(get_current_user)
):
    """
    获取最新估价结果
    
    - **参数**: 返回数量限制
    - **返回**: 最新的估价结果列表
    - **权限**: 需要登录
    """
    history = get_valuation_history_by_user(current_user["phone"])
    
    # 按时间倒序排序
    sorted_history = sorted(history, key=lambda x: x["valuation_time"], reverse=True)
    
    # 返回最新的结果
    return {
        "results": sorted_history[:limit],
        "total": len(history)
    }
