// ===========================================
// selfImprovementEngine.js
// 自我进化引擎主控
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.SelfImprovementEngine = {
  initialized: false,
  _intervalId: null,
  _isHealing: false,

  init() {
    if (this.initialized) {
      console.log('🔄 SelfImprovementEngine already initialized');
      return;
    }

    console.log('🧬 SelfImprovementEngine initializing...');
    this.initialized = true;

    try {
      // ===========================================
      // 1. 定期运行系统健康检查 (每30分钟)
      // ===========================================
      if (this._intervalId) {
        clearInterval(this._intervalId);
      }

      this._intervalId = setInterval(() => {
        try {
          // 检查 SystemHealthMonitor 是否存在
          if (!LawAIApp.SystemHealthMonitor || typeof LawAIApp.SystemHealthMonitor.updateMetrics !== 'function') {
            console.warn('⚠️ SystemHealthMonitor not ready, skipping health check');
            return;
          }

          const metrics = LawAIApp.SystemHealthMonitor.updateMetrics();
          
          // 如果总体健康低于阈值，触发分析修复
          const overall = metrics?.overall ?? 100;
          if (overall < 65) {
            console.warn(`⚠️ Health score ${overall} below threshold, triggering self-healing...`);
            this.performSelfHealing();
          }
        } catch (err) {
          console.warn('⚠️ Health check cycle failed:', err);
        }
      }, 1800000); // 30分钟

      // ===========================================
      // 2. 监听重大失败事件
      // ===========================================
      this._setupEventListeners();

      console.log('✅ Self-Evolving Learning System Engine activated.');

    } catch (err) {
      console.error('❌ SelfImprovementEngine init failed:', err);
      this.initialized = false;
    }
  },

  /**
   * =========================
   * 设置事件监听器（带防御）
   * =========================
   */

  _setupEventListeners() {
    // 使用 EventBus 或自定义事件
    const eventBus = LawAIApp.EventBus;

    if (eventBus && typeof eventBus.on === 'function') {
      // 使用 EventBus
      try {
        eventBus.on('QuizFailed', () => {
          console.log('📡 QuizFailed event received, analyzing...');
          this._triggerAnalysis();
        });
        eventBus.on('TaskRejected', () => {
          console.log('📡 TaskRejected event received, analyzing...');
          this._triggerAnalysis();
        });
        console.log('📡 Event listeners registered via EventBus');
      } catch (err) {
        console.warn('⚠️ Failed to register EventBus listeners:', err);
        this._setupFallbackListeners();
      }
    } else {
      // 使用自定义事件作为备选
      this._setupFallbackListeners();
    }
  },

  /**
   * =========================
   * 备选事件监听器
   * =========================
   */

  _setupFallbackListeners() {
    try {
      window.addEventListener('QuizFailed', () => {
        console.log('📡 QuizFailed (fallback) event received');
        this._triggerAnalysis();
      });
      window.addEventListener('TaskRejected', () => {
        console.log('📡 TaskRejected (fallback) event received');
        this._triggerAnalysis();
      });
      console.log('📡 Fallback event listeners registered');
    } catch (err) {
      console.warn('⚠️ Failed to register fallback listeners:', err);
    }
  },

  /**
   * =========================
   * 触发分析（带防御）
   * =========================
   */

  _triggerAnalysis() {
    try {
      if (LawAIApp.SystemAnalyzer && typeof LawAIApp.SystemAnalyzer.analyze === 'function') {
        LawAIApp.SystemAnalyzer.analyze();
      } else {
        console.warn('⚠️ SystemAnalyzer not ready, cannot analyze');
      }
    } catch (err) {
      console.warn('⚠️ Analysis trigger failed:', err);
    }
  },

  /**
   * =========================
   * 执行自我修复循环
   * =========================
   */

  async performSelfHealing() {
    // 防止并发修复
    if (this._isHealing) {
      console.log('🔄 Self-healing already in progress, skipping...');
      return;
    }

    this._isHealing = true;
    console.log('🔄 Starting self-healing cycle...');

    try {
      // ===========================================
      // 1. 分析系统
      // ===========================================
      let issues = [];
      try {
        if (LawAIApp.SystemAnalyzer && typeof LawAIApp.SystemAnalyzer.analyze === 'function') {
          issues = LawAIApp.SystemAnalyzer.analyze() || [];
        } else {
          console.warn('⚠️ SystemAnalyzer not ready, cannot analyze');
          issues = [];
        }
      } catch (err) {
        console.warn('⚠️ Analysis failed:', err);
        issues = [];
      }

      if (!issues || issues.length === 0) {
        console.log('✅ No issues found, system is healthy');
        this._isHealing = false;
        return;
      }

      console.log(`🔍 Found ${issues.length} issues:`, issues);

      // ===========================================
      // 2. 尝试自动修复
      // ===========================================
      let fixes = [];
      try {
        if (LawAIApp.AutoRefactorEngine && typeof LawAIApp.AutoRefactorEngine.attemptFix === 'function') {
          fixes = await LawAIApp.AutoRefactorEngine.attemptFix(issues);
        } else {
          console.warn('⚠️ AutoRefactorEngine not ready, skipping fixes');
          fixes = issues.map(issue => ({
            issue: issue.type || 'unknown',
            status: 'skipped',
            reason: 'AutoRefactorEngine not available'
          }));
        }
      } catch (err) {
        console.warn('⚠️ Fix attempt failed:', err);
        fixes = [];
      }

      // ===========================================
      // 3. 记录结果并学习
      // ===========================================
      try {
        if (fixes && fixes.length > 0) {
          if (LawAIApp.MetaLearningEngine && typeof LawAIApp.MetaLearningEngine.recordOutcome === 'function') {
            fixes.forEach(f => {
              LawAIApp.MetaLearningEngine.recordOutcome(
                { type: f.issue || 'unknown' }, 
                f, 
                true
              );
            });
          } else {
            console.log('📊 Fixes recorded (MetaLearningEngine not available):', fixes);
          }
        }
      } catch (err) {
        console.warn('⚠️ Failed to record outcomes:', err);
      }

      // ===========================================
      // 4. 优化架构参数
      // ===========================================
      try {
        if (LawAIApp.ArchitectureOptimizer && typeof LawAIApp.ArchitectureOptimizer.optimize === 'function') {
          LawAIApp.ArchitectureOptimizer.optimize();
        } else {
          console.warn('⚠️ ArchitectureOptimizer not ready, skipping optimization');
        }
      } catch (err) {
        console.warn('⚠️ Optimization failed:', err);
      }

      console.log('✅ Self-healing cycle completed.', { issues, fixes });

    } catch (err) {
      console.error('❌ Self-healing cycle failed:', err);
    } finally {
      this._isHealing = false;
    }
  },

  /**
   * =========================
   * 手动触发完整自检
   * =========================
   */

  async runFullSelfCheck() {
    console.log('🔍 Running full self-check...');
    
    try {
      // 更新健康指标
      if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.updateMetrics === 'function') {
        LawAIApp.SystemHealthMonitor.updateMetrics();
      } else {
        console.warn('⚠️ SystemHealthMonitor not ready');
      }

      // 执行自我修复
      await this.performSelfHealing();

      // 获取健康摘要
      let summary = { overall: 100, status: 'healthy' };
      try {
        if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getHealthSummary === 'function') {
          summary = LawAIApp.SystemHealthMonitor.getHealthSummary();
        }
      } catch (err) {
        console.warn('⚠️ Failed to get health summary:', err);
      }

      console.log('✅ Full self-check completed:', summary);
      return summary;

    } catch (err) {
      console.error('❌ Full self-check failed:', err);
      return { overall: 0, status: 'error', error: err.message };
    }
  },

  /**
   * =========================
   * 获取系统状态
   * =========================
   */

  getStatus() {
    try {
      let summary = { overall: 100, status: 'healthy' };
      if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getHealthSummary === 'function') {
        summary = LawAIApp.SystemHealthMonitor.getHealthSummary();
      }
      
      return {
        initialized: this.initialized,
        isHealing: this._isHealing,
        health: summary,
        intervalActive: this._intervalId !== null
      };
    } catch (err) {
      return {
        initialized: this.initialized,
        isHealing: this._isHealing,
        health: { overall: 100, status: 'unknown' },
        intervalActive: this._intervalId !== null
      };
    }
  },

  /**
   * =========================
   * 销毁（清理资源）
   * =========================
   */

  destroy() {
    console.log('🧬 SelfImprovementEngine destroying...');
    
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    // 移除事件监听（如果有）
    try {
      if (LawAIApp.EventBus && typeof LawAIApp.EventBus.off === 'function') {
        LawAIApp.EventBus.off('QuizFailed');
        LawAIApp.EventBus.off('TaskRejected');
      }
    } catch (err) {
      console.warn('⚠️ Failed to remove event listeners:', err);
    }

    this.initialized = false;
    this._isHealing = false;
    console.log('🧬 SelfImprovementEngine destroyed');
  }
};

// ===========================================
// 自动启动
// ===========================================

// 延迟启动，确保其他模块已加载
setTimeout(() => {
  try {
    if (LawAIApp.SelfImprovementEngine && typeof LawAIApp.SelfImprovementEngine.init === 'function') {
      LawAIApp.SelfImprovementEngine.init();
    } else {
      console.warn('⚠️ SelfImprovementEngine not ready for auto-start');
    }
  } catch (err) {
    console.warn('⚠️ Auto-start failed:', err);
  }
}, 2000);

console.log('🧬 SelfImprovementEngine V1.0 ready');
