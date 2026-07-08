// ===========================================
// executionEngine.js
// 执行引擎：将 CivOS 带入全面运行状态
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExecutionEngine = {
  initialized: false,

  async start() {
    if (this.initialized) {
      console.log('🔄 ExecutionEngine already started');
      return;
    }

    console.log('🚀 ExecutionEngine starting...');

    try {
      // 检查 SystemBootstrapper 是否存在
      if (LawAIApp.SystemBootstrapper && typeof LawAIApp.SystemBootstrapper.bootstrap === 'function') {
        console.log('📡 Triggering SystemBootstrapper...');
        await LawAIApp.SystemBootstrapper.bootstrap();
      } else {
        console.warn('⚠️ SystemBootstrapper not found, skipping bootstrap');
      }

      // 检查 CivilizationRuntime 是否存在
      if (LawAIApp.CivilizationRuntime && typeof LawAIApp.CivilizationRuntime.start === 'function') {
        console.log('🌍 Activating CivilizationRuntime...');
        await LawAIApp.CivilizationRuntime.start();
      } else {
        console.warn('⚠️ CivilizationRuntime not found, skipping');
      }

      this.initialized = true;
      console.log('✅ ExecutionEngine started successfully');

      // 触发执行引擎就绪事件
      window.dispatchEvent(new CustomEvent('EXECUTION_ENGINE_READY', {
        detail: { timestamp: Date.now() }
      }));

    } catch (err) {
      console.error('❌ ExecutionEngine failed:', err);
      // 即使失败，也标记为已尝试，避免无限重试
      this.initialized = true;
    }
  }
};

// 页面加载完成后自动启动执行引擎
window.addEventListener('load', () => {
  setTimeout(() => {
    LawAIApp.ExecutionEngine.start();
  }, 1000);
});
