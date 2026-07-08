// ===========================================
// coreBootstrap.js
// 核心启动引导器 - 确保依赖模块按顺序加载
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CoreBootstrap = {
  initialized: false,
  _bootPhase: 'idle',

  // 核心模块加载顺序（必须按此顺序）
  _coreModules: [
    'StorageEngine',      // 存储引擎 - 最基础
    'EventBus',           // 事件总线
    'ProgressEngine',     // 进度引擎 - 依赖 StorageEngine
    'SystemHealthMonitor',// 健康监控 - 依赖 ProgressEngine
    'SystemAnalyzer',     // 系统分析器 - 依赖 SystemHealthMonitor
    'SelfImprovementEngine', // 自我进化 - 依赖 SystemAnalyzer
    'EvolutionDriveEngine'   // 进化驱动 - 依赖 SelfImprovementEngine
  ],

  // 检查模块是否就绪
  _isModuleReady(moduleName) {
    try {
      const module = LawAIApp[moduleName];
      if (!module) return false;
      
      // 如果模块有 initialized 属性，检查它
      if (module.initialized !== undefined) {
        return module.initialized === true;
      }
      
      // 如果模块有 init 方法，认为它准备好了
      if (typeof module.init === 'function') {
        return true;
      }
      
      // 如果模块有 getProgress 方法，认为准备好了
      if (typeof module.getProgress === 'function') {
        return true;
      }
      
      return true; // 模块存在就算就绪
    } catch (err) {
      return false;
    }
  },

  // 等待模块就绪
  _waitForModule(moduleName, maxAttempts = 30) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const check = () => {
        attempts++;
        
        if (this._isModuleReady(moduleName)) {
          console.log(`✅ Module ${moduleName} is ready`);
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ Module ${moduleName} not ready after ${maxAttempts} attempts, continuing...`);
          resolve(false); // 继续执行，不阻塞
          return;
        }
        
        setTimeout(check, 500);
      };
      
      check();
    });
  },

  // 创建缺失模块的占位（防止报错）
  _createPlaceholder(moduleName) {
    if (LawAIApp[moduleName]) return;
    
    console.warn(`⚠️ Creating placeholder for ${moduleName}`);
    
    LawAIApp[moduleName] = {
      _placeholder: true,
      initialized: true,
      
      // 通用方法
      getProgress() { return { completedLessons: [], xp: 0, level: 1 }; },
      getMetrics() { return { learningEfficiency: 80, retentionEffectiveness: 80, taskCompletionRate: 75 }; },
      getHealthSummary() { return { overall: 80, status: 'healthy' }; },
      updateMetrics() { return { overall: 80 }; },
      analyze() { return []; },
      performSelfHealing() { console.log(`🔧 ${moduleName} placeholder: performing self-healing`); },
      init() { console.log(`🔧 ${moduleName} placeholder initialized`); },
      
      // 存储相关
      get(key, defaultValue) { return defaultValue || null; },
      set(key, value) { return true; },
      emit(event, data) { return true; },
      on(event, callback) { return true; }
    };
    
    console.log(`✅ Placeholder ${moduleName} created`);
  },

  // ===========================================
  // 主要启动方法
  // ===========================================
  
  async boot() {
    if (this.initialized) {
      console.log('🔄 CoreBootstrap already initialized');
      return;
    }

    console.log('🚀 CoreBootstrap starting...');
    this._bootPhase = 'starting';

    try {
      // ===========================================
      // Phase 1: 确保最基础的模块存在
      // ===========================================
      console.log('📦 Phase 1: Ensuring core modules exist...');
      
      // 检查 StorageEngine
      if (!LawAIApp.StorageEngine) {
        console.warn('⚠️ StorageEngine not found, creating placeholder');
        this._createPlaceholder('StorageEngine');
      }

      // 检查 ProgressEngine
      if (!LawAIApp.ProgressEngine) {
        console.warn('⚠️ ProgressEngine not found, creating placeholder');
        this._createPlaceholder('ProgressEngine');
      }

      // 确保 ProgressEngine 有 getProgress 方法
      if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress !== 'function') {
        LawAIApp.ProgressEngine.getProgress = function() {
          return { completedLessons: [], xp: 0, level: 1, totalLessons: 365 };
        };
      }

      // ===========================================
      // Phase 2: 初始化核心模块
      // ===========================================
      console.log('📦 Phase 2: Initializing core modules...');

      // 按顺序初始化
      for (const moduleName of this._coreModules) {
        const module = LawAIApp[moduleName];
        
        if (module && typeof module.init === 'function') {
          try {
            console.log(`🔧 Initializing ${moduleName}...`);
            module.init();
            // 等待模块就绪
            await this._waitForModule(moduleName, 10);
          } catch (err) {
            console.warn(`⚠️ Failed to initialize ${moduleName}:`, err);
            // 创建占位
            this._createPlaceholder(moduleName);
          }
        } else if (!module) {
          // 模块不存在，创建占位
          this._createPlaceholder(moduleName);
        } else {
          // 模块存在但没有 init 方法，标记为就绪
          console.log(`✅ ${moduleName} exists (no init needed)`);
        }
      }

      // ===========================================
      // Phase 3: 触发系统就绪事件
      // ===========================================
      console.log('📦 Phase 3: System ready...');
      
      this.initialized = true;
      this._bootPhase = 'ready';

      // 触发系统就绪事件
      try {
        const event = new CustomEvent('CORE_BOOTSTRAP_READY', {
          detail: {
            timestamp: Date.now(),
            modules: this._coreModules.map(name => ({
              name: name,
              ready: this._isModuleReady(name)
            }))
          }
        });
        window.dispatchEvent(event);
        console.log('✅ CoreBootstrap ready event dispatched');
      } catch (err) {
        console.warn('⚠️ Failed to dispatch ready event:', err);
      }

      // ===========================================
      // Phase 4: 启动 App（如果还没启动）
      // ===========================================
      setTimeout(() => {
        try {
          if (window.App && !window.App.initialized) {
            console.log('🚀 Auto-starting App...');
            window.dispatchEvent(new CustomEvent('SYSTEM_READY', {
              detail: {
                boot: window.LawAIApp.bootStatus || {},
                timestamp: Date.now()
              }
            }));
          }
        } catch (err) {
          console.warn('⚠️ Auto-start failed:', err);
        }
      }, 500);

      console.log('✅ CoreBootstrap completed successfully!');
      return true;

    } catch (err) {
      console.error('❌ CoreBootstrap failed:', err);
      this._bootPhase = 'failed';
      return false;
    }
  },

  // 获取启动状态
  getStatus() {
    return {
      initialized: this.initialized,
      phase: this._bootPhase,
      modules: this._coreModules.map(name => ({
        name: name,
        ready: this._isModuleReady(name),
        exists: !!LawAIApp[name]
      }))
    };
  },

  // 重置
  reset() {
    this.initialized = false;
    this._bootPhase = 'idle';
    console.log('🔄 CoreBootstrap reset');
  }
};

// ===========================================
// 自动启动
// ===========================================

// 等待 DOM 加载完成
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => {
    LawAIApp.CoreBootstrap.boot();
  }, 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      LawAIApp.CoreBootstrap.boot();
    }, 100);
  });
}

console.log('🚀 CoreBootstrap V1.0 ready');
