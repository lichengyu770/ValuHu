import os
import time
from datetime import datetime
from jinja2 import Template
from app.core.config import settings

# 生成估价报告
def generate_valuation_report(request_data):
    # 定义HTML模板，包含logo和专业排版
    html_template = Template('''
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>智汇云房地产估价报告</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Microsoft YaHei', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 20px;
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #667eea;
                padding-bottom: 20px;
            }
            
            .logo {
                margin-bottom: 15px;
            }
            
            .logo svg {
                width: 100px;
                height: 100px;
            }
            
            h1 {
                color: #667eea;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            h2 {
                color: #333;
                font-size: 18px;
                margin: 25px 0 15px 0;
                border-left: 4px solid #667eea;
                padding-left: 10px;
            }
            
            .report-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .report-info-item {
                margin-bottom: 5px;
            }
            
            .section {
                margin-bottom: 20px;
            }
            
            .result-card {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .result-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            
            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .result-label {
                font-weight: 500;
                color: #666;
            }
            
            .result-value {
                font-weight: bold;
                color: #667eea;
                font-size: 16px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            
            th {
                background-color: #667eea;
                color: white;
                font-weight: bold;
            }
            
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            .recommendation {
                background-color: #e7f3ff;
                border-left: 4px solid #1890ff;
                padding: 15px;
                margin: 20px 0;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
            }
            
            .factors-list {
                list-style-type: none;
                padding: 0;
            }
            
            .factor-item {
                background-color: #f0f4f8;
                padding: 10px 15px;
                margin-bottom: 8px;
                border-radius: 4px;
                border-left: 3px solid #4299e1;
            }
            
            .property-info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .property-info-item {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            
            .market-analysis {
                background-color: #f7fafc;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
            }
            
            .price-trend {
                font-weight: bold;
                color: #38a169;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- 水波纹 -->
                    <circle cx="50" cy="80" r="35" stroke="#667eea" stroke-width="2" fill="none" opacity="0.3"/>
                    <circle cx="50" cy="80" r="28" stroke="#667eea" stroke-width="2" fill="none" opacity="0.5"/>
                    <circle cx="50" cy="80" r="21" stroke="#667eea" stroke-width="2" fill="none" opacity="0.7"/>
                    <circle cx="50" cy="80" r="14" stroke="#667eea" stroke-width="2" fill="none" opacity="0.9"/>
                    <!-- 莲花花瓣 -->
                    <path d="M50 10 Q65 35 85 50 Q65 65 50 80 Q35 65 15 50 Q35 35 50 10" fill="#ff8fab"/>
                    <path d="M50 15 Q70 35 80 55 Q60 65 50 75 Q40 65 20 55 Q30 35 50 15" fill="#ffb3c1"/>
                    <path d="M50 20 Q75 35 75 60 Q60 65 50 70 Q40 65 25 60 Q25 35 50 20" fill="#ffccd5"/>
                    <!-- 箭头 -->
                    <path d="M45 40 L55 40 L55 65 L65 65 L50 80 L35 65 L45 65 Z" fill="#e53e3e"/>
                </svg>
            </div>
            <h1>ValuHub房地产估价报告</h1>
            <p style="color: #666;">Professional Real Estate Valuation Report</p>
        </div>
        
        <div class="report-info">
            <div>
                <div class="report-info-item"><strong>报告编号:</strong> {{ project_id }}</div>
                <div class="report-info-item"><strong>生成时间:</strong> {{ generate_time }}</div>
            </div>
            <div>
                <div class="report-info-item"><strong>估价对象:</strong> {{ community }}</div>
                <div class="report-info-item"><strong>所在城市:</strong> {{ city }} {{ district }}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>房产基本信息</h2>
            <div class="property-info-grid">
                <div class="property-info-item">
                    <span>小区名称</span>
                    <span>{{ community }}</span>
                </div>
                <div class="property-info-item">
                    <span>所在城市</span>
                    <span>{{ city }} {{ district }}</span>
                </div>
                <div class="property-info-item">
                    <span>建筑面积</span>
                    <span>{{ area }} ㎡</span>
                </div>
                <div class="property-info-item">
                    <span>户型</span>
                    <span>{{ room_type }}</span>
                </div>
                <div class="property-info-item">
                    <span>所在楼层</span>
                    <span>{{ floor }}/{{ total_floors }}</span>
                </div>
                <div class="property-info-item">
                    <span>房龄</span>
                    <span>{{ age }} 年</span>
                </div>
                <div class="property-info-item">
                    <span>朝向</span>
                    <span>{{ orientation }}</span>
                </div>
                <div class="property-info-item">
                    <span>装修程度</span>
                    <span>{{ decoration }}</span>
                </div>
                <div class="property-info-item">
                    <span>电梯</span>
                    <span>{{ '有' if elevator else '无' }}</span>
                </div>
                <div class="property-info-item">
                    <span>车位</span>
                    <span>{{ '有' if parking_space else '无' }}</span>
                </div>
                {% if school_district %}
                <div class="property-info-item">
                    <span>学区</span>
                    <span>{{ school_district }}</span>
                </div>
                {% endif %}
            </div>
        </div>
        
        <div class="section">
            <h2>核心估价结果</h2>
            <div class="result-card">
                <div class="result-grid">
                    <div class="result-item">
                        <span class="result-label">建筑面积</span>
                        <span class="result-value">{{ area }} ㎡</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">单价</span>
                        <span class="result-value">{{ price_per_sqm }} 元/㎡</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">总价</span>
                        <span class="result-value">{{ total_price }} 元</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">市场信心度</span>
                        <span class="result-value">{{ confidence * 100 }}%</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>影响因素分析</h2>
            <ul class="factors-list">
                {% for factor in factors %}
                <li class="factor-item">{{ factor }}</li>
                {% endfor %}
            </ul>
        </div>
        
        <div class="section">
            <h2>市场分析</h2>
            <div class="market-analysis">
                <div class="price-trend">价格走势: {{ price_trend }}</div>
                <p>{{ market_analysis }}</p>
            </div>
        </div>
        
        <div class="section">
            <h2>类似案例分析</h2>
            <table>
                <thead>
                    <tr>
                        <th>小区名称</th>
                        <th>建筑面积 (㎡)</th>
                        <th>楼层</th>
                        <th>单价 (元/㎡)</th>
                        <th>总价 (元)</th>
                        <th>距离</th>
                    </tr>
                </thead>
                <tbody>
                    {% for case in similar_cases %}
                    <tr>
                        <td>{{ case.community }}</td>
                        <td>{{ case.area }}</td>
                        <td>{{ case.floor }}/{{ total_floors }}</td>
                        <td>{{ case.price_per_sqm }}</td>
                        <td>{{ case.total_price }}</td>
                        <td>{{ case.distance }}</td>
                    </tr>
                    {% endfor %}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>分析建议</h2>
            <div class="recommendation">
                <p>{{ recommendation }}</p>
            </div>
        </div>
        
        <div class="section">
            <h2>估价说明</h2>
            <p>本报告基于市场比较法，结合城市基准价格、楼层系数、房龄衰减系数、朝向系数、装修系数等多维度因素计算得出。</p>
            <p>报告仅供参考，不构成任何投资建议。如需更详细的估价服务，请联系我们的专业顾问。</p>
        </div>
        
        <div class="footer">
            <p>© 2025 ValuHub房地产估价系统. 保留所有权利.</p>
            <p>联系方式：support@valuhub.com | 服务热线：400-888-8888</p>
        </div>
    </body>
    </html>
    ''')
    
    # 渲染HTML
    html_content = html_template.render(
        project_id=request_data.project_id,
        generate_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        community=request_data.community,
        city=request_data.city,
        district=request_data.district,
        area=request_data.area,
        room_type=request_data.room_type,
        floor=request_data.floor,
        total_floors=request_data.total_floors,
        age=request_data.age,
        orientation=request_data.orientation,
        decoration=request_data.decoration,
        elevator=request_data.elevator,
        parking_space=request_data.parking_space,
        school_district=request_data.school_district,
        price_per_sqm=request_data.price_per_sqm,
        total_price=request_data.total_price,
        confidence=request_data.confidence,
        similar_cases=request_data.similar_cases,
        factors=request_data.factors,
        price_trend=request_data.price_trend,
        market_analysis=request_data.market_analysis,
        recommendation=request_data.recommendation
    )
    
    # 确保报告存储目录存在
    os.makedirs(settings.REPORT_STORAGE_DIR, exist_ok=True)
    
    # 生成报告ID
    report_id = f"report_{int(time.time())}"
    
    # 保存HTML报告
    html_report_path = os.path.join(settings.REPORT_STORAGE_DIR, f"{report_id}.html")
    with open(html_report_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    try:
        # 尝试生成PDF
        pdf_report_path = os.path.join(settings.REPORT_STORAGE_DIR, f"{report_id}.pdf")
        from weasyprint import HTML
        HTML(string=html_content).write_pdf(pdf_report_path)
        return pdf_report_path
    except Exception as e:
        # 如果PDF生成失败，返回HTML报告路径
        print(f"PDF生成失败，将返回HTML报告: {str(e)}")
        return html_report_path
