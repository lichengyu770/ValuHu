import redis
import json
from app.core.config import settings
from typing import Optional, Any

class RedisCache:
    """Redis缓存服务类"""
    
    def __init__(self):
        """初始化Redis连接"""
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存数据"""
        try:
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None
    
    def set(self, key: str, value: Any, expire: int = None) -> bool:
        """设置缓存数据"""
        try:
            expire_time = expire or settings.CACHE_EXPIRE_TIME
            return self.redis_client.setex(
                key, 
                expire_time, 
                json.dumps(value, ensure_ascii=False)
            )
        except Exception as e:
            print(f"Redis set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """删除缓存数据"""
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """检查缓存是否存在"""
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            print(f"Redis exists error: {e}")
            return False
    
    def flush_db(self) -> bool:
        """清空当前数据库"""
        try:
            return bool(self.redis_client.flushdb())
        except Exception as e:
            print(f"Redis flushdb error: {e}")
            return False

# 创建缓存实例
cache = RedisCache()