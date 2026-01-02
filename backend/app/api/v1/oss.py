from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.oss import oss_service

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    上传文件到OSS
    
    Args:
        file: 要上传的文件
        
    Returns:
        dict: 包含上传结果、文件URL等信息
    """
    try:
        # 使用OSS服务上传文件
        result = oss_service.upload_file(file.file, file.filename)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_file(filename: str):
    """
    从OSS删除文件
    
    Args:
        filename: 要删除的文件名
        
    Returns:
        dict: 包含删除结果
    """
    try:
        success = oss_service.delete_file(filename)
        if success:
            return {"success": True, "message": "文件删除成功"}
        else:
            raise HTTPException(status_code=500, detail="文件删除失败")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))