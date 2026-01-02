import oss2
import uuid
import os
from datetime import datetime
from app.core.config import settings

class OssService:
    def __init__(self):
        # 初始化OSS客户端
        self.available = False
        if settings.OSS_ACCESS_KEY_ID and settings.OSS_ACCESS_KEY_SECRET:
            try:
                self.auth = oss2.Auth(
                    settings.OSS_ACCESS_KEY_ID.strip(),
                    settings.OSS_ACCESS_KEY_SECRET.strip()
                )
                self.bucket = oss2.Bucket(
                    self.auth,
                    settings.OSS_ENDPOINT,
                    settings.OSS_BUCKET_NAME
                )
                self.available = True
            except Exception as e:
                print(f"OSS初始化失败: {str(e)}")
                self.available = False
        else:
            print("OSS配置不完整，服务不可用")
            self.available = False
    
    def generate_unique_filename(self, original_filename):
        """生成唯一的文件名，防止文件覆盖"""
        # 获取文件扩展名
        ext = os.path.splitext(original_filename)[1]
        # 生成唯一标识符
        unique_id = uuid.uuid4().hex
        # 生成时间前缀
        time_prefix = datetime.now().strftime("%Y%m%d/%H%M%S")
        # 组合成唯一文件名
        return f"uploads/{time_prefix}_{unique_id}{ext}"
    
    def upload_file(self, file_obj, original_filename):
        """上传文件到OSS"""
        # 生成唯一文件名
        filename = self.generate_unique_filename(original_filename)
        
        try:
            # 重置文件指针到开头
            file_obj.seek(0)
            # 上传文件
            result = self.bucket.put_object(filename, file_obj)
            
            if result.status == 200:
                # 构造文件URL
                file_url = f"{settings.OSS_BASE_URL}/{filename}" if settings.OSS_BASE_URL else f"https://{settings.OSS_BUCKET_NAME}.{settings.OSS_ENDPOINT}/{filename}"
                return {
                    "success": True,
                    "url": file_url,
                    "filename": filename,
                    "original_filename": original_filename
                }
            else:
                return {
                    "success": False,
                    "error": f"上传失败，状态码: {result.status}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def delete_file(self, filename):
        """从OSS删除文件"""
        try:
            result = self.bucket.delete_object(filename)
            return result.status == 204
        except Exception as e:
            return False

# 创建OSS服务实例
oss_service = OssService()