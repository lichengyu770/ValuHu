// 记录按钮点击日志
document
  .querySelectorAll('button, .function-card, .nav-menu a')
  .forEach((el) => {
    el.addEventListener('click', function () {
      const action = this.textContent.trim() || this.className;
      const log = {
        action: action,
        time: new Date().toISOString(),
        page: window.location.pathname,
      };
      // 存储到localStorage
      const logs = JSON.parse(localStorage.getItem('userLogs') || '[]');
      logs.push(log);
      localStorage.setItem('userLogs', JSON.stringify(logs));
    });
  });
