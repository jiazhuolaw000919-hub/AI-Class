// ===========================================
// executionEngine.js
// 执行引擎：将 CivOS 带入全面运行状态
// ===========================================
LawAIApp.ExecutionEngine = {
  async start() {
    // 触发引导程序
    await LawAIApp.SystemBootstrapper.bootstrap();

    // 激活文明运行时
    // (引导完成事件会自动启动 CivilizationRuntime)
  }
};

// 页面加载完成后自动启动执行引擎
window.addEventListener('load', () => {
  setTimeout(() => {
    LawAIApp.ExecutionEngine.start();
  }, 1000);
});
