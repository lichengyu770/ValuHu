// 引入jsPDF库
const jspdfScript = document.createElement('script');
jspdfScript.src =
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
document.head.appendChild(jspdfScript);

// 引入ECharts库
const echartsScript = document.createElement('script');
echartsScript.src =
  'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
document.head.appendChild(echartsScript);

document.addEventListener('DOMContentLoaded', async () => {
  // 等待jsPDF加载完成
  jspdfScript.onload = () => {
    addPdfExportFunction();
  };

  // 等待ECharts加载完成
  echartsScript.onload = () => {
    addPriceChart();
  };

  // 动态加载团队成员数据
  await loadTeamMembers();

  // 替换登录逻辑
  replaceLoginLogic();
});

// 1. 添加PDF导出功能
function addPdfExportFunction() {
  try {
    // 找到评估报告生成卡片
    const reportCards = document.querySelectorAll('.function-card h4');
    let reportCard = null;

    reportCards.forEach((h4) => {
      if (h4.textContent.includes('评估报告生成')) {
        reportCard = h4.parentElement;
      }
    });

    if (reportCard) {
      // 创建导出按钮
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-outline';
      exportBtn.textContent = '导出PDF';
      exportBtn.style.marginTop = '20px';
      exportBtn.onclick = exportReportToPdf;
      reportCard.appendChild(exportBtn);
    }
  } catch (error) {
    console.error('添加PDF导出功能失败:', error);
  }
}

// 导出PDF函数
function exportReportToPdf() {
  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // 模拟报告内容
    const reportContent =
      `房产评估报告\n\n` +
      `评估日期: ${new Date().toLocaleDateString()}\n` +
      `评估对象: 示例房产\n` +
      `评估价值: ¥1,350,000\n` +
      `评估方法: 市场比较法\n` +
      `\n基于AI算法和GIS技术生成的专业评估报告`;

    // 写入PDF
    pdf.text(reportContent, 10, 10);

    // 下载PDF
    pdf.save('房产评估报告.pdf');
  } catch (error) {
    console.error('导出PDF失败:', error);
    alert('导出PDF失败，请稍后重试');
  }
}

// 2. 添加房价对比图表
function addPriceChart() {
  try {
    // 找到市场趋势分析卡片
    const trendCards = document.querySelectorAll('.function-card h4');
    let trendCard = null;

    trendCards.forEach((h4) => {
      if (h4.textContent.includes('市场趋势分析')) {
        trendCard = h4.parentElement;
      }
    });

    if (trendCard) {
      // 创建图表容器
      const chartContainer = document.createElement('div');
      chartContainer.id = 'priceChart';
      chartContainer.style.width = '100%';
      chartContainer.style.height = '200px';
      chartContainer.style.marginTop = '20px';
      trendCard.appendChild(chartContainer);

      // 初始化图表
      const myChart = echarts.init(document.getElementById('priceChart'));

      // 模拟区域房价数据
      const option = {
        title: {
          text: '近6个月区域房价',
          textStyle: {
            fontSize: 14,
          },
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          data: ['1月', '2月', '3月', '4月', '5月', '6月'],
        },
        yAxis: {
          name: '均价（元/㎡）',
          axisLabel: {
            formatter: '{value}',
          },
        },
        series: [
          {
            name: '均价（元/㎡）',
            type: 'line',
            data: [12000, 12500, 13000, 12800, 13200, 13500],
            smooth: true,
          },
        ],
      };

      myChart.setOption(option);

      // 响应式调整
      window.addEventListener('resize', () => {
        myChart.resize();
      });
    }
  } catch (error) {
    console.error('添加房价图表失败:', error);
  }
}

// 3. 动态加载团队成员数据
async function loadTeamMembers() {
  try {
    // 尝试读取team.json
    let teamMembers;
    try {
      const res = await fetch('./data/team.json');
      teamMembers = await res.json();
    } catch (e) {
      // 如果没有找到数据文件，使用默认数据
      teamMembers = [
        { name: '李成誉', role: '16680508457', email: '1558691995@qq.com' },
        { name: '代欣华', role: '19386925910', email: '2220776356@qq.com' },
        { name: '沈添华', role: '18573782878', email: '2938482846@qq.com' },
      ];
    }

    // 找到团队成员容器
    const membersContainer = document.querySelector('.team-members');

    if (membersContainer) {
      // 清空原内容，重新渲染
      membersContainer.innerHTML = '';

      teamMembers.forEach((member) => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        memberDiv.innerHTML = `
          <div class="member-avatar"><i class="fas fa-user"></i></div>
          <div class="member-name">${member.name}</div>
          <div class="member-role">${member.role}</div>
          <div class="member-role">${member.email}</div>
        `;
        membersContainer.appendChild(memberDiv);
      });
    }
  } catch (error) {
    console.error('加载团队成员失败:', error);
  }
}

// 4. 替换登录逻辑，调用后端API
function replaceLoginLogic() {
  try {
    // 确保登录模态框存在
    const loginBtn = document.getElementById('loginBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');

    // 处理登录按钮点击
    const openLoginModal = () => {
      // 创建登录模态框（如果不存在）
      let loginModal = document.getElementById('loginModal');
      if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.id = 'loginModal';
        loginModal.className = 'modal';
        loginModal.innerHTML = `
          <div class="modal-content">
            <span class="close-modal" id="closeLoginModal">&times;</span>
            <h3 class="modal-title">用户登录</h3>
            <form id="loginForm">
              <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" id="username" required>
              </div>
              <div class="form-group">
                <label for="password">密码</label>
                <input type="password" id="password" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;">登录</button>
              <div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">
                测试账号: test / 123456
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(loginModal);

        // 添加关闭事件
        document.getElementById('closeLoginModal').onclick = () => {
          loginModal.style.display = 'none';
        };

        // 点击外部关闭
        window.onclick = (event) => {
          if (event.target === loginModal) {
            loginModal.style.display = 'none';
          }
        };

        // 添加表单提交事件
        document
          .getElementById('loginForm')
          .addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
              // 调用后端登录接口
              const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
              });

              const data = await res.json();

              if (data.success) {
                alert('登录成功');
                loginModal.style.display = 'none';
              } else {
                alert(data.message || '登录失败');
              }
            } catch (error) {
              console.error('登录请求失败:', error);
              alert('无法连接到服务器，请确保后端服务已启动');
            }
          });
      }

      // 显示模态框
      loginModal.style.display = 'flex';
    };

    // 绑定登录按钮事件
    if (loginBtn) {
      loginBtn.onclick = openLoginModal;
    }

    if (mobileLoginBtn) {
      mobileLoginBtn.onclick = () => {
        document.getElementById('mobileMenu').style.display = 'none';
        openLoginModal();
      };
    }
  } catch (error) {
    console.error('替换登录逻辑失败:', error);
  }
}
