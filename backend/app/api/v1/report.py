"""
ValuHub 报告路由
报告生成、PDF导出、模板管理
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.database import get_db
from app.models.report import Report, ReportTemplate
from app.models.valuation import Valuation
from app.models.user import User
from app.schemas.report import (
    ReportGenerateRequest,
    ReportResponse,
    ReportTemplateCreate,
    ReportTemplateResponse
)

router = APIRouter()


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    report_data: ReportGenerateRequest,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    生成报告
    """
    # 验证估价是否存在
    valuation = db.query(Valuation).filter(Valuation.id == report_data.valuation_id).first()
    if not valuation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="估价记录不存在"
        )
    
    # 验证估价是否属于当前用户
    if valuation.user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限生成此报告"
        )
    
    # TODO: 调用PDF生成服务
    # 这里先返回模拟数据
    file_url = f"/media/reports/report_{valuation.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_name = f"估价报告_{valuation.id}.pdf"
    file_size = 102400  # 模拟文件大小 100KB
    
    # 创建报告记录
    new_report = Report(
        valuation_id=report_data.valuation_id,
        user_id=report_data.user_id,
        template_id=report_data.template_id,
        file_url=file_url,
        file_name=file_name,
        file_size=file_size,
        status="completed",
        completed_at=datetime.utcnow()
    )
    
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    
    return ReportResponse(
        id=new_report.id,
        valuation_id=new_report.valuation_id,
        user_id=new_report.user_id,
        template_id=new_report.template_id,
        file_url=new_report.file_url,
        file_name=new_report.file_name,
        file_size=new_report.file_size,
        status=new_report.status,
        created_at=new_report.created_at.isoformat(),
        completed_at=new_report.completed_at.isoformat() if new_report.completed_at else None
    )


@router.get("", response_model=List[ReportResponse])
async def get_reports(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(20, ge=1, le=100, description="返回数量"),
    user_id: Optional[int] = Query(None, description="用户ID过滤"),
    status: Optional[str] = Query(None, description="状态过滤"),
    db: Session = Depends(get_db)
):
    """
    获取报告列表
    """
    query = db.query(Report)
    
    # 应用过滤条件
    if user_id:
        query = query.filter(Report.user_id == user_id)
    if status:
        query = query.filter(Report.status == status)
    
    # 按创建时间倒序
    query = query.order_by(Report.created_at.desc())
    
    reports = query.offset(skip).limit(limit).all()
    
    return [
        ReportResponse(
            id=r.id,
            valuation_id=r.valuation_id,
            user_id=r.user_id,
            template_id=r.template_id,
            file_url=r.file_url,
            file_name=r.file_name,
            file_size=r.file_size,
            status=r.status,
            created_at=r.created_at.isoformat(),
            completed_at=r.completed_at.isoformat() if r.completed_at else None
        ) for r in reports
    ]


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int, db: Session = Depends(get_db)):
    """
    获取报告详情
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    return ReportResponse(
        id=report.id,
        valuation_id=report.valuation_id,
        user_id=report.user_id,
        template_id=report.template_id,
        file_url=report.file_url,
        file_name=report.file_name,
        file_size=report.file_size,
        status=report.status,
        created_at=report.created_at.isoformat(),
        completed_at=report.completed_at.isoformat() if report.completed_at else None
    )


@router.get("/download/{report_id}")
async def download_report(report_id: int, db: Session = Depends(get_db)):
    """
    下载报告
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="报告不存在"
        )
    
    # TODO: 实现文件下载逻辑
    # 这里返回下载链接
    return {
        "message": "报告下载链接",
        "download_url": report.file_url,
        "file_name": report.file_name
    }


@router.get("/templates", response_model=List[ReportTemplateResponse])
async def get_report_templates(db: Session = Depends(get_db)):
    """
    获取报告模板列表
    """
    templates = db.query(ReportTemplate).order_by(ReportTemplate.is_default.desc()).all()
    
    return [
        ReportTemplateResponse(
            id=t.id,
            name=t.name,
            description=t.description,
            template_type=t.template_type,
            template_content=t.template_content,
            is_default=t.is_default,
            created_at=t.created_at.isoformat(),
            updated_at=t.updated_at.isoformat()
        ) for t in templates
    ]


@router.post("/templates", response_model=ReportTemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_report_template(
    template_data: ReportTemplateCreate,
    current_user_id: int = Query(..., description="当前用户ID"),
    db: Session = Depends(get_db)
):
    """
    创建报告模板
    """
    # TODO: 验证用户权限（仅管理员可创建）
    
    new_template = ReportTemplate(
        name=template_data.name,
        description=template_data.description,
        template_type=template_data.template_type,
        template_content=template_data.template_content,
        is_default=False
    )
    
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    
    return ReportTemplateResponse(
        id=new_template.id,
        name=new_template.name,
        description=new_template.description,
        template_type=new_template.template_type,
        template_content=new_template.template_content,
        is_default=new_template.is_default,
        created_at=new_template.created_at.isoformat(),
        updated_at=new_template.updated_at.isoformat()
    )
