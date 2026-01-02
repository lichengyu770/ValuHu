# 使用官方Python镜像作为基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制requirements.txt到工作目录
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制整个应用到工作目录
COPY . .

# 创建数据和存储目录
RUN mkdir -p /app/data /app/storage/reports

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
