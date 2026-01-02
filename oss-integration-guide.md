# OSS 集成指南

## 一、现有代码问题分析

### 1. 认证配置错误
多处代码中认证配置存在语法错误：
```python
# 错误示例
auth = oss2.Auth('accessKeyId LTAI5tRrPr3F51YicSR5qXcc\n', 'accessKeySecret 4xpQ23ZlyVIf4ufBpdKspRKj86LAil')

# 正确格式
auth = oss2.Auth('LTAI5tRrPr3F51YicSR5qXcc', '4xpQ23ZlyVIf4ufBpdKspRKj86LAil')
```

### 2. 缺少必要导入
部分代码缺少必要的导入，如 `os` 模块：
```python
# 需要添加
import os
```

### 3. 语法错误
```python
# 错误示例（缺少引号和括号）
auth = oss2.Auth('accessKeyId LTAI5tRrPr3F51YicSR5qXcc\n, accessKeySecret: 4xpQ23ZlyVIf4ufBpdKspRKj86LAil)bucket = oss2.Bucket(auth, 'http://oss-cn-shanghai.aliyuncs.com', 'fangsuanyun')

# 正确格式
auth = oss2.Auth('LTAI5tRrPr3F51YicSR5qXcc', '4xpQ23ZlyVIf4ufBpdKspRKj86LAil')
bucket = oss2.Bucket(auth, 'http://oss-cn-shanghai.aliyuncs.com', 'fangsuanyun')
```

## 二、Web 应用 OSS 集成方案

由于当前 AI 估价系统是纯前端应用，而 OSS 操作需要后端支持（避免泄露密钥），建议采用以下架构：

### 1. 前后端分离架构
- **前端**：负责用户界面和交互
- **后端**：提供 OSS 上传/下载 API，使用 Flask 或 Node.js 实现

### 2. 前端实现

#### HTML 结构（添加到 ai-valuation.html）
```html
<!-- OSS 上传区域 -->
<div class="oss-upload-section">
    <h3>📤 OSS 文件管理</h3>
    <input type="file" id="oss-file-input" multiple>
    <button id="upload-to-oss-btn" class="btn btn-primary">上传到 OSS</button>
    <div id="oss-upload-result"></div>
</div>
```

#### JavaScript 实现
```javascript
// OSS 上传功能
function initOSSUpload() {
    const fileInput = document.getElementById('oss-file-input');
    const uploadBtn = document.getElementById('upload-to-oss-btn');
    const resultDiv = document.getElementById('oss-upload-result');
    
    uploadBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            showToast('请选择文件', 'warning');
            return;
        }
        
        const files = Array.from(fileInput.files);
        
        for (const file of files) {
            try {
                // 使用 FormData 构建上传数据
                const formData = new FormData();
                formData.append('file', file);
                
                // 调用后端 API 上传到 OSS
                const response = await fetch('http://your-backend-api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.text();
                    resultDiv.innerHTML += `<p>✅ ${file.name}: ${result}</p>`;
                    showToast(`${file.name} 上传成功`, 'success');
                } else {
                    throw new Error('上传失败');
                }
            } catch (error) {
                resultDiv.innerHTML += `<p>❌ ${file.name}: 上传失败</p>`;
                showToast(`${file.name} 上传失败`, 'error');
            }
        }
    });
}

// 初始化 OSS 上传功能
initOSSUpload();
```

### 3. 后端实现（Flask）

创建 `oss_backend.py` 文件：
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import oss2
import uuid
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# OSS 配置（替换为实际值）
ACCESS_KEY_ID = 'LTAI5tRrPr3F51YicSR5qXcc'
ACCESS_KEY_SECRET = '4xpQ23ZlyVIf4ufBpdKspRKj86LAil'
ENDPOINT = 'http://oss-cn-shanghai.aliyuncs.com'
BUCKET_NAME = 'fangsuanyun'

# 初始化 OSS 客户端
auth = oss2.Auth(ACCESS_KEY_ID, ACCESS_KEY_SECRET)
bucket = oss2.Bucket(auth, ENDPOINT, BUCKET_NAME)

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        file = request.files.get('file')
        if not file:
            return jsonify({'error': '未选择文件'}), 400
        
        # 生成唯一文件名
        file_suffix = os.path.splitext(file.filename)[1]
        oss_file_path = f'valuation/{uuid.uuid4()}{file_suffix}'
        
        # 上传文件到 OSS
        bucket.put_object(oss_file_path, file.stream)
        
        return jsonify({
            'success': True,
            'file_path': oss_file_path,
            'file_url': f'https://{BUCKET_NAME}.{ENDPOINT.replace("http://", "")}/{oss_file_path}'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload-excel', methods=['POST'])
def upload_excel():
    try:
        file = request.files.get('excel_file')
        if not file or not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'error': '请上传 Excel 文件'}), 400
        
        oss_file_path = f'valuation/excel/{uuid.uuid4()}{os.path.splitext(file.filename)[1]}'
        bucket.put_object(oss_file_path, file.stream)
        
        return jsonify({
            'success': True,
            'file_path': oss_file_path,
            'file_url': f'https://{BUCKET_NAME}.{ENDPOINT.replace("http://", "")}/{oss_file_path}'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

## 三、使用说明

### 1. 安装依赖
```bash
pip install flask flask-cors oss2 pandas openpyxl
```

### 2. 启动后端服务
```bash
python oss_backend.py
```

### 3. 前端配置
在 `ai-valuation.html` 中添加 OSS 上传功能，并确保前端代码中的 API 地址指向后端服务。

## 四、安全建议

1. **不要在前端代码中暴露 OSS 密钥**
2. **使用临时凭证**：对于生产环境，建议使用 STS 临时凭证
3. **限制上传文件类型和大小**
4. **添加访问控制**：使用 OSS 访问策略限制访问权限
5. **日志记录**：记录所有 OSS 操作日志以便审计

## 五、扩展功能

1. **文件下载**：添加从 OSS 下载文件到本地的功能
2. **文件列表**：显示 OSS 中存储的文件列表
3. **文件预览**：支持在浏览器中预览图片、PDF 等文件
4. **批量操作**：支持批量上传、下载、删除文件
5. **进度显示**：添加上传/下载进度条

## 六、集成到现有系统

将 OSS 功能集成到现有 AI 估价系统中，可以：
1. 存储用户上传的资产图片
2. 保存生成的估价报告
3. 存储 Excel 导入/导出文件
4. 保存估价方案和历史记录
5. 存储数据可视化图表

通过 OSS 集成，可以实现数据的安全存储和高效管理，提升系统的可靠性和扩展性。