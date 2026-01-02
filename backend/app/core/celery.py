from celery import Celery
from app.core.config import settings
import os

# 设置环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

# 创建Celery实例
celery_app = Celery(
    'zhihuiyun',
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=['app.services.data_collector']
)

# 配置Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
    beat_schedule={
        # 每天凌晨2点执行数据采集任务
        'collect-real-estate-data-daily': {
            'task': 'app.services.data_collector.collect_real_estate_data',
            'schedule': 86400,  # 86400秒 = 1天
            'args': (),
        },
    },
)

# 自动发现任务
celery_app.autodiscover_tasks()

if __name__ == '__main__':
    celery_app.start()