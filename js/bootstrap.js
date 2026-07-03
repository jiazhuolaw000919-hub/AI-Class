// bootstrap.js
(function() {
  // 确保在 DOM 准备好之后启动，但所有脚本已加载
  function boot() {
    if (!LawAIApp.BootManager) {
      console.error('BootManager missing, cannot start.');
      return;
    }
    LawAIApp.BootManager.start().catch(err => console.error('Bootstrap failed:', err));
  }

  // 如果 document 已经完成则立即执行，否则等待
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 1);
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();
