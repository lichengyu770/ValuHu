// 传统估价引擎主逻辑
// 处理表单提交、算法调用和结果展示

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  // 初始化表单事件监听
  initForm();

  // 初始化标签页功能
  initTabs();

  // 初始化其他UI组件
  initUI();
});

/**
 * 初始化表单
 */
function initForm() {
  const form = document.getElementById('valuationForm');
  const submitBtn = document.getElementById('submitBtn');

  if (!form || !submitBtn) {
    console.error('表单元素未找到');
    return;
  }

  // 表单提交事件
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    handleFormSubmit(e);
  });

  // 表单重置事件
  form.addEventListener('reset', function () {
    resetResultDisplay();
  });
}

/**
 * 处理表单提交
 */
async function handleFormSubmit(e) {
  const form = e.target;

  // 显示加载状态
  showLoading();

  try {
    // 收集表单数据
    const params = collectFormData(form);

    // 验证参数
    const validationResult = validateParams(params);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join('\n'));
    }

    // 执行估价计算
    const valuationResult = await performValuation(params);

    // 显示结果
    displayValuationResult(valuationResult);
  } catch (error) {
    console.error('估价计算失败:', error);
    showError(error.message);
  } finally {
    hideLoading();
  }
}

/**
 * 收集表单数据
 */
function collectFormData(form) {
  const formData = new FormData(form);
  const params = {
    // 基本信息
    area: parseFloat(formData.get('area')),
    location: formData.get('location'),
    buildingType: formData.get('buildingType'),
    valuationMethod: formData.get('valuationMethod'),

    // 建筑信息
    constructionYear: parseInt(formData.get('constructionYear')),
    floor: parseInt(formData.get('floor')),
    totalFloors: parseInt(formData.get('totalFloors')),
    decorationLevel: formData.get('decorationLevel'),
    orientation: formData.get('orientation'),

    // 小区信息
    lotRatio: parseFloat(formData.get('lotRatio')),
    greenRatio: parseFloat(formData.get('greenRatio')),

    // 周边配套设施（多选）
    nearbyFacilities: formData.getAll('nearbyFacilities'),
  };

  return params;
}

/**
 * 参数验证
 */
function validateParams(params) {
  // 使用暴露的验证函数
  if (
    window.valuationEngine &&
    window.valuationEngine.validateValuationParams
  ) {
    return window.valuationEngine.validateValuationParams(params);
  }

  // 备用验证逻辑
  const errors = [];

  if (!params.area || params.area <= 0) {
    errors.push('建筑面积必须是正数');
  }

  if (
    !params.constructionYear ||
    params.constructionYear > new Date().getFullYear()
  ) {
    errors.push('建成年份不能大于当前年份');
  }

  if (
    params.floor &&
    params.totalFloors &&
    (params.floor > params.totalFloors || params.floor <= 0)
  ) {
    errors.push('楼层必须在1到总楼层之间');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 执行估价计算
 */
function performValuation(params) {
  return new Promise((resolve, reject) => {
    try {
      // 模拟异步计算（实际项目中可能是API调用）
      setTimeout(() => {
        if (window.valuationEngine && window.valuationEngine.performValuation) {
          const result = window.valuationEngine.performValuation(params);
          resolve(result);
        } else {
          reject(new Error('估价引擎未初始化'));
        }
      }, 500); // 模拟500ms延迟
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 显示加载状态
 */
function showLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const resultContainer = document.getElementById('valuationResult');

  if (loadingIndicator) {
    loadingIndicator.style.display = 'block';
  }

  if (resultContainer) {
    resultContainer.style.display = 'none';
  }
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  const loadingIndicator = document.getElementById('loadingIndicator');

  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}

/**
 * 显示错误信息
 */
function showError(message) {
  alert(message);
}

/**
 * 重置结果显示
 */
function resetResultDisplay() {
  const resultContainer = document.getElementById('valuationResult');
  if (resultContainer) {
    resultContainer.style.display = 'none';
  }
}

/**
 * 显示估价结果
 */
function displayValuationResult(result) {
  // 显示结果容器
  const resultContainer = document.getElementById('valuationResult');
  if (resultContainer) {
    resultContainer.style.display = 'block';
  }

  // 显示基本结果
  displayBasicResult(result);

  // 显示可比案例
  displayComparableProperties(result.comparableProperties);

  // 显示趋势分析
  displayTrendAnalysis(result.trendAnalysis);

  // 显示影响因素
  displayFactorsAnalysis(
    result.evaluationDetails.factorsAnalysis,
    result.valuationMethod,
    result.factors
  );

  // 激活第一个标签页
  activateTab('result');
}

/**
 * 显示基本结果
 */
function displayBasicResult(result) {
  // 总估价
  const totalValueEl = document.getElementById('totalValue');
  if (totalValueEl) {
    totalValueEl.textContent = formatNumber(result.totalValue);
  }

  // 单价
  const unitPriceEl = document.getElementById('unitPrice');
  if (unitPriceEl) {
    unitPriceEl.textContent = formatNumber(result.unitPrice);
  }

  // 置信度
  const confidenceEl = document.getElementById('confidence');
  const confidenceProgressEl = document.getElementById('confidenceProgress');
  if (confidenceEl) {
    confidenceEl.textContent = result.confidence;
  }
  if (confidenceProgressEl) {
    confidenceProgressEl.style.width = `${result.confidence}%`;

    // 根据置信度设置不同颜色
    let color;
    if (result.confidence >= 90) {
      color = '#4caf50';
    } else if (result.confidence >= 75) {
      color = '#2196f3';
    } else if (result.confidence >= 60) {
      color = '#ff9800';
    } else {
      color = '#f44336';
    }
    confidenceProgressEl.style.background = `linear-gradient(90deg, ${color}, ${color})`;
  }

  // 估价方法
  const valuationMethodEl = document.getElementById('valuationMethodResult');
  if (valuationMethodEl) {
    valuationMethodEl.textContent = result.valuationMethod;
  }
}

/**
 * 显示可比案例
 */
function displayComparableProperties(properties) {
  const tableBody = document.getElementById('comparableTableBody');
  if (!tableBody) {
    return;
  }

  // 清空现有内容
  tableBody.innerHTML = '';

  // 添加新内容
  properties.forEach((property) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${property.caseId}</td>
      <td>${property.area}㎡</td>
      <td>${formatNumber(property.unitPrice)}元/㎡</td>
      <td>${formatNumber(property.totalPrice)}元</td>
      <td>${property.transactionDate}</td>
      <td>
        <div class="similarity-bar">
          <div class="similarity-progress" style="width: ${property.similarity}%;"></div>
        </div>
        <span>${property.similarity}%</span>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * 显示趋势分析
 */
function displayTrendAnalysis(trend) {
  // 年度涨幅
  const yearOnYearEl = document.getElementById('yearOnYearGrowth');
  if (yearOnYearEl) {
    yearOnYearEl.textContent = `${trend.yearOnYearGrowth}%`;

    // 根据涨幅设置颜色
    yearOnYearEl.style.color =
      trend.yearOnYearGrowth > 0 ? '#4caf50' : '#f44336';
  }

  // 趋势预测
  const predictionEl = document.getElementById('trendPrediction');
  if (predictionEl) {
    predictionEl.textContent = trend.prediction;
  }

  // 月度趋势图表
  drawMonthlyTrendChart(trend.monthlyTrend);
}

/**
 * 绘制月度趋势图表
 */
function drawMonthlyTrendChart(monthlyTrend) {
  const canvas = document.getElementById('monthlyTrendChart');
  if (!canvas) {
    return;
  }

  // 检查Canvas支持
  if (!canvas.getContext) {
    console.error('Canvas不支持');
    return;
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 准备数据
  const prices = monthlyTrend.map((item) => item.price);
  const labels = monthlyTrend.map((item) => item.month);

  // 计算图表参数
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice;

  // 绘制坐标轴
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 绘制数据点和连线
  ctx.beginPath();
  ctx.strokeStyle = '#007AFF';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#007AFF';

  monthlyTrend.forEach((item, index) => {
    const x = padding + (chartWidth / (monthlyTrend.length - 1)) * index;
    const y =
      padding +
      chartHeight -
      ((item.price - minPrice) / priceRange) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    // 绘制数据点
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    if (index > 0) {
      ctx.moveTo(
        padding + (chartWidth / (monthlyTrend.length - 1)) * (index - 1),
        padding +
          chartHeight -
          ((monthlyTrend[index - 1].price - minPrice) / priceRange) *
            chartHeight
      );
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });

  // 绘制月份标签
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  monthlyTrend.forEach((item, index) => {
    const x = padding + (chartWidth / (monthlyTrend.length - 1)) * index;
    ctx.fillText(item.month, x, height - padding + 15);
  });

  // 绘制价格标签（最大值和最小值）
  ctx.textAlign = 'right';
  ctx.fillText(maxPrice, padding - 5, padding + 15);
  ctx.fillText(minPrice, padding - 5, height - padding - 5);
}

/**
 * 显示影响因素分析
 */
function displayFactorsAnalysis(factors, valuationMethod, detailedFactors) {
  const factorsContent = document.getElementById('factorsContent');
  if (!factorsContent) {
    return;
  }

  // 清空现有内容
  factorsContent.innerHTML = '';

  // 如果是综合估价法，显示特殊内容
  if (valuationMethod === '综合估价法') {
    displayCombinedFactors(factors, detailedFactors, factorsContent);
  } else {
    // 显示普通影响因素
    const factorsList = document.createElement('div');
    factorsList.className = 'factors-list';

    factors.forEach((factor) => {
      const factorItem = document.createElement('div');
      factorItem.className = 'factor-item';

      factorItem.innerHTML = `
        <div class="factor-header">
          <div class="factor-name">${factor.name}</div>
          <div class="factor-value">${factor.value}%</div>
        </div>
        <div class="factor-progress">
          <div class="factor-progress-bar" style="width: ${factor.value}%"></div>
        </div>
        <div class="factor-weight">权重: ${(factor.weight * 100).toFixed(0)}%</div>
      `;

      factorsList.appendChild(factorItem);
    });

    factorsContent.appendChild(factorsList);
  }
}

/**
 * 显示综合估价法的影响因素
 */
function displayCombinedFactors(factors, detailedFactors, container) {
  // 显示各方法权重
  const weightsContainer = document.createElement('div');
  weightsContainer.className = 'weights-section';
  weightsContainer.innerHTML = `
    <h3>综合估价方法权重</h3>
    <div class="method-weights">
      <div class="method-weight-item">
        <div class="method-name">市场比较法</div>
        <div class="method-weight-bar">
          <div class="method-weight-progress" style="width: ${detailedFactors.weights.market * 100}%"></div>
        </div>
        <div class="method-weight-value">${detailedFactors.weights.market * 100}%</div>
      </div>
      <div class="method-weight-item">
        <div class="method-name">收益法</div>
        <div class="method-weight-bar">
          <div class="method-weight-progress" style="width: ${detailedFactors.weights.income * 100}%"></div>
        </div>
        <div class="method-weight-value">${detailedFactors.weights.income * 100}%</div>
      </div>
      <div class="method-weight-item">
        <div class="method-name">成本法</div>
        <div class="method-weight-bar">
          <div class="method-weight-progress" style="width: ${detailedFactors.weights.cost * 100}%"></div>
        </div>
        <div class="method-weight-value">${detailedFactors.weights.cost * 100}%</div>
      </div>
    </div>
  `;
  container.appendChild(weightsContainer);

  // 显示各方法结果对比
  const comparisonContainer = document.createElement('div');
  comparisonContainer.className = 'methods-comparison';
  comparisonContainer.innerHTML = `
    <h3>各方法结果对比</h3>
    <div class="methods-results">
      <div class="method-result">
        <div class="method-name">市场比较法</div>
        <div class="method-unit-price">单价: ${formatNumber(detailedFactors.marketResult.unitPrice)}元/㎡</div>
        <div class="method-total-value">总价: ${formatNumber(detailedFactors.marketResult.totalValue)}元</div>
        <div class="method-confidence">置信度: ${detailedFactors.marketResult.confidence}%</div>
      </div>
      <div class="method-result">
        <div class="method-name">收益法</div>
        <div class="method-unit-price">单价: ${formatNumber(detailedFactors.incomeResult.unitPrice)}元/㎡</div>
        <div class="method-total-value">总价: ${formatNumber(detailedFactors.incomeResult.totalValue)}元</div>
        <div class="method-confidence">置信度: ${detailedFactors.incomeResult.confidence}%</div>
      </div>
      <div class="method-result">
        <div class="method-name">成本法</div>
        <div class="method-unit-price">单价: ${formatNumber(detailedFactors.costResult.unitPrice)}元/㎡</div>
        <div class="method-total-value">总价: ${formatNumber(detailedFactors.costResult.totalValue)}元</div>
        <div class="method-confidence">置信度: ${detailedFactors.costResult.confidence}%</div>
      </div>
    </div>
  `;
  container.appendChild(comparisonContainer);

  // 显示普通影响因素
  const factorsContainer = document.createElement('div');
  factorsContainer.className = 'factors-section';
  factorsContainer.innerHTML = '<h3>影响因素分析</h3>';

  const factorsList = document.createElement('div');
  factorsList.className = 'factors-list';

  factors.forEach((factor) => {
    const factorItem = document.createElement('div');
    factorItem.className = 'factor-item';

    factorItem.innerHTML = `
      <div class="factor-header">
        <div class="factor-name">${factor.name}</div>
        <div class="factor-value">${factor.value}%</div>
      </div>
      <div class="factor-progress">
        <div class="factor-progress-bar" style="width: ${factor.value}%"></div>
      </div>
      <div class="factor-weight">权重: ${(factor.weight * 100).toFixed(0)}%</div>
    `;

    factorsList.appendChild(factorItem);
  });

  factorsContainer.appendChild(factorsList);
  container.appendChild(factorsContainer);
}

/**
 * 初始化标签页功能
 */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      const tabName = this.getAttribute('data-tab');
      activateTab(tabName);
    });
  });
}

/**
 * 激活指定标签页
 */
function activateTab(tabName) {
  // 移除所有激活状态
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.remove('active');
  });

  // 添加当前激活状态
  const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
  const activePane = document.getElementById(`${tabName}Tab`);

  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  if (activePane) {
    activePane.classList.add('active');
  }
}

/**
 * 初始化其他UI组件
 */
function initUI() {
  // 添加方法权重的CSS样式
  addMethodWeightStyles();
}

/**
 * 添加方法权重的CSS样式
 */
function addMethodWeightStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .weights-section, .methods-comparison, .factors-section {
      margin-bottom: 25px;
    }
    
    .weights-section h3, .methods-comparison h3, .factors-section h3 {
      font-size: 16px;
      margin-bottom: 15px;
      color: #333;
      font-weight: 600;
    }
    
    .method-weights {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .method-weight-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }
    
    .method-name {
      width: 120px;
      font-weight: 600;
      color: #333;
    }
    
    .method-weight-bar {
      flex: 1;
      height: 10px;
      background: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .method-weight-progress {
      height: 100%;
      background: linear-gradient(90deg, #007AFF, #0056b3);
      border-radius: 5px;
      transition: width 0.5s ease;
    }
    
    .method-weight-value {
      width: 50px;
      font-weight: 600;
      color: #007AFF;
      text-align: right;
    }
    
    .methods-results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .method-result {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      text-align: center;
    }
    
    .method-result .method-name {
      width: auto;
      margin-bottom: 10px;
    }
    
    .method-unit-price, .method-total-value, .method-confidence {
      margin: 8px 0;
      color: #333;
    }
    
    .method-result .method-unit-price {
      font-size: 20px;
      font-weight: 700;
      color: #007AFF;
    }
    
    .similarity-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    }
    
    .similarity-progress {
      height: 100%;
      background: linear-gradient(90deg, #4caf50, #2196f3);
      border-radius: 4px;
    }
    
    .factor-weight {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      text-align: right;
    }
  `;

  document.head.appendChild(style);
}

/**
 * 格式化数字，添加千分位分隔符
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
