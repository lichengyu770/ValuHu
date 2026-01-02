# 批量更新HTML文件品牌标识的简化脚本

# 设置工作目录
Set-Location -Path "C:\Users\Administrator\Desktop\fgfh\test-routes"

# 获取所有HTML文件
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -File

# 遍历每个HTML文件
foreach ($file in $htmlFiles) {
    Write-Host "正在处理文件: $($file.Name)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    
    # 1. 添加缓存控制meta标签
    if (-not $content.Contains("Cache-Control")) {
        $content = $content -replace "<head>", "<head>`n    <meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\">`n    <meta http-equiv=\"Pragma\" content=\"no-cache\">`n    <meta http-equiv=\"Expires\" content=\"0\">"
    }
    
    # 2. 更新页面标题
    $content = $content -replace "智汇云", "ValuHub"
    $content = $content -replace "ZhiHuiYun", "ValuHub"
    $content = $content -replace "- 数智估价核心引擎", "- ValuHub"
    $content = $content -replace "房地产AI估价与数智平台", "房地产AI估价平台"
    
    # 3. 添加logo样式
    if (-not $content.Contains("img[src=\"图片1.png\"]")) {
        $content = $content -replace "</style>", "`n        img[src=\"图片1.png\"] { max-width: 45px !important; max-height: 45px !important; width: 45px !important; height: 45px !important; object-fit: contain !important; display: inline-block !important; }`n    </style>"
    }
    
    # 4. 保存修改
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "文件已更新: $($file.Name)"
}

Write-Host "所有HTML文件已更新完成！"