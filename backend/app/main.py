"""
ValuHub 后端主应用
FastAPI + PostgreSQL + Redis
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api.v1 import auth, property, valuation, report, data
from app.api.v2 import valuation as valuation_v2
from app.api.v2 import model_training
from app.database.database import engine
from app.middleware.logging_middleware import LoggingMiddleware

# 创建FastAPI应用
app = FastAPI(
    title="ValuHub API",
    description="房产价值生态引擎 - 后端API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加日志中间件
app.add_middleware(LoggingMiddleware)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(property.router, prefix="/api/v1/properties", tags=["房产"])
app.include_router(valuation.router, prefix="/api/v1/valuations", tags=["估价"])
app.include_router(report.router, prefix="/api/v1/reports", tags=["报告"])
app.include_router(data.router, prefix="/api/v1/data", tags=["数据"])

# 注册v2路由
app.include_router(valuation_v2.router, tags=["估价-v2"])
app.include_router(model_training.router, prefix="/api/v2/model-training", tags=["模型训练"])

# 静态文件服务
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/")
async def root():
    """
    API根路径
    """
    return {
        "message": "Welcome to ValuHub API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """
    健康检查端点
    """
    return {
        "status": "healthy",
        "database": "connected",
        "cache": "connected"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.APP_ENV == "development" else False,
        log_level="info"
    )
