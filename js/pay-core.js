// 等待原页面加载完成后执行
window.onload = function () {
  // 绑定所有"立即使用"按钮
  document.querySelectorAll('.service-card .btn-primary').forEach((btn) => {
    btn.addEventListener('click', async function (e) {
      e.preventDefault();
      const card = this.closest('.service-card');
      const price = card
        .querySelector('.price-tag')
        .textContent.replace('¥', '');
      const serviceName = card.querySelector('.service-title').textContent;

      // 显示自定义加载动画（样式在css/extend.css中）
      showLoading('正在生成支付链接...');

      try {
        // 调用后端创建订单接口（后端接口部署在server/文件夹）
        const res = await fetch('/server/create-order.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            price: price,
            service: serviceName,
            payType: document.querySelector('input[name="payment"]:checked')
              .value,
          }),
        });
        const data = await res.json();

        if (data.code === 200) {
          // 跳转支付页面（支付宝/微信官方链接）
          window.location.href = data.payUrl;
        } else {
          showToast(data.msg, 'error');
        }
      } catch (err) {
        showToast('网络异常，请重试', 'error');
      } finally {
        hideLoading();
      }
    });
  });
};

// 工具函数：加载动画
function showLoading(text) {
  const loading = document.createElement('div');
  loading.className = 'ext-loading';
  loading.innerHTML = `<div class="ext-spinner"></div><p>${text}</p>`;
  document.body.appendChild(loading);
}

function hideLoading() {
  const loading = document.querySelector('.ext-loading');
  if (loading) {
    loading.remove();
  }
}

// 工具函数：提示弹窗
function showToast(msg, type) {
  const toast = document.createElement('div');
  toast.className = `ext-toast ext-toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
