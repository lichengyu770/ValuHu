# 批量更新所有HTML文件的品牌标识脚本

# 设置工作目录
Set-Location -Path "C:\Users\Administrator\Desktop\fgfh\test-routes"

# 获取所有HTML文件
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -File -Recurse

# 定义要添加的缓存控制meta标签
$cacheMetaTags = @"
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
"@

# 定义logo样式
$logoStyle = @"
        /* Logo 样式 */
        img[src="图片1.png"] {
            max-width: 45px !important;
            max-height: 45px !important;
            width: 45px !important;
            height: 45px !important;
            object-fit: contain !important;
            display: inline-block !important;
        }
"@

# 遍历每个HTML文件
foreach ($file in $htmlFiles) {
    Write-Host "正在处理文件: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw
    
    # 1. 添加缓存控制meta标签（如果不存在）
    if ($content -notmatch "Cache-Control") {
        $content = $content -replace "<head>", "<head>`n$cacheMetaTags"
    }
    
    # 2. 更新页面标题中的"智汇云"为"ValuHub"
    $content = $content -replace "- 智汇云", "- ValuHub"
    $content = $content -replace "智汇云 -", "ValuHub -"
    $content = $content -replace "智汇云", "ValuHub" -Replace "{{页面标题}}", "ValuHub"
    
    # 3. 添加logo样式（如果不存在）
    if ($content -notmatch "img\[src=\"图片1.png\"\]") {
        $content = $content -replace "</style>", "$logoStyle`n    </style>" -Replace "</head>", "<style>`n$logoStyle`n</style>`n</head>"
    }
    
    # 4. 替换logo部分
    # 替换各种可能的logo格式
    $content = $content -replace "<a href=\"index.html\" class=\"logo\">.*?</a>", "<a href=\"index.html\" class=\"logo\"><img src=\"图片1.png\" alt=\"ValuHub Logo\">ValuHub</a>" -Replace "(?s)<a href=\"index.html\" class=\"logo\">.*?</a>", "<a href=\"index.html\" class=\"logo\"><img src=\"图片1.png\" alt=\"ValuHub Logo\">ValuHub</a>"
    
    # 替换没有class的logo
    $content = $content -replace "<a href=\"index.html\">.*?</a>", "<a href=\"index.html\" class=\"logo\"><img src=\"图片1.png\" alt=\"ValuHub Logo\">ValuHub</a>" -Replace "(?s)<a href=\"index.html\">.*?</a>", "<a href=\"index.html\" class=\"logo\"><img src=\"图片1.png\" alt=\"ValuHub Logo\">ValuHub</a>"
    
    # 5. 确保logo样式存在于所有文件中
    if ($content -notmatch "max-width: 45px !important") {
        if ($content -match "<style>") {
            $content = $content -replace "<style>", "<style>`n$logoStyle"
        } else {
            $content = $content -replace "</head>", "<style>`n$logoStyle`n</style>`n</head>"
        }
    }
    
    # 保存修改后的内容
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "文件已更新: $($file.FullName)"
}

Write-Host "所有HTML文件已更新完成！"