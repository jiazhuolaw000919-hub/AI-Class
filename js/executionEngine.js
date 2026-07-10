// ===========================================
// executionEngine.js
// 执行引擎：分阶段启动 Civilization 系统 (Phase 0.2)
// 延迟到 Stage 3/4 执行，不阻塞 UI
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExecutionEngine = {
  initialized: false,
  _started: false,

  async start() {
    if (this.initialized) {
      console.log('🔄 ExecutionEngine already started');
      return;
    }

    console.log('🚀 ExecutionEngine starting (deferred)...');

    // ============================================
    // 分阶段执行：所有任务都延迟，不阻塞 UI
    // ============================================
    var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 200); };

    scheduleFn(async function() {
      try {
        // 任务 1：SystemBootstrapper（延迟 300ms）
        setTimeout(async function() {
          try {
            if (LawAIApp.SystemBootstrapper && typeof LawAIApp.SystemBootstrapper.bootstrap === 'function') {
              console.log('📡 SystemBootstrapper starting...');
              await LawAIApp.SystemBootstrapper.bootstrap();
              console.log('✅ SystemBootstrapper complete');
            } else {
              console.log('📌 SystemBootstrapper not available (skipped)');
            }
          } catch (err) {
            console.warn('⚠️ SystemBootstrapper error:', err);
          }
        }, 300);

        // 任务 2：CivilizationRuntime（延迟 500ms）
        setTimeout(async function() {
          try {
            if (LawAIApp.CivilizationRuntime && typeof LawAIApp.CivilizationRuntime.start === 'function') {
              console.log('🌍 CivilizationRuntime starting...');
              await LawAIApp.CivilizationRuntime.start();
              console.log('✅ CivilizationRuntime complete');
            } else {
              console.log('📌 CivilizationRuntime not available (skipped)');
            }
          } catch (err) {
            console.warn('⚠️ CivilizationRuntime error:', err);
          }
        }, 500);

        this.initialized = true;
        console.log('✅ ExecutionEngine tasks scheduled');

        // 触发执行引擎就绪事件
        window.dispatchEvent(new CustomEvent('EXECUTION_ENGINE_READY', {
          detail: { timestamp: Date.now() }
        }));

      } catch (err) {
        console.error('❌ ExecutionEngine scheduling failed:', err);
        this.initialized = true;
      }
    }.bind(this));
  },

  getStatus: function() {
    return {
      name: 'ExecutionEngine',
      version: '2.0.0',
      initialized: this.initialized,
      started: this._started
    };
  }
};

// ============================================
// 页面加载完成后自动启动执行引擎（延迟到 800ms）
// ============================================
window.addEventListener('load', function() {
  setTimeout(function() {
    LawAIApp.ExecutionEngine.start();
  }, 800);
});

console.log('⚡ ExecutionEngine V2.0 loaded (deferred execution)');
