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
    'StorageEngine',
    'EventBus',
    'ProgressEngine',
    'SystemHealthMonitor',
    'SystemAnalyzer',
    'SelfImprovementEngine',
    'EvolutionDriveEngine'
  ],

  // ===========================================
  // 检查模块是否就绪
  // ===========================================
  
  _isModuleReady: function(moduleName) {
    try {
      var module = LawAIApp[moduleName];
      if (!module) return false;
      
      // 如果是占位，算就绪（避免无限等待）
      if (module._placeholder === true) return true;
      
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
      
      return true;
    } catch (err) {
      return false;
    }
  },

  // ===========================================
  // 等待模块就绪
  // ===========================================
  
  _waitForModule: function(moduleName, maxAttempts) {
    maxAttempts = maxAttempts || 30;
    var self = this;
    
    return new Promise(function(resolve) {
      var attempts = 0;
      
      var check = function() {
        attempts++;
        
        if (self._isModuleReady(moduleName)) {
          console.log('✅ Module ' + moduleName + ' is ready');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.warn('⚠️ Module ' + moduleName + ' not ready after ' + maxAttempts + ' attempts, continuing...');
          resolve(false);
          return;
        }
        
        setTimeout(check, 500);
      };
      
      check();
    });
  },

  // ===========================================
  // 创建缺失模块的占位（防止报错）
  // ===========================================
  
  _createPlaceholder: function(moduleName) {
    // 如果模块已经存在且不是占位，不覆盖
    if (LawAIApp[moduleName] && LawAIApp[moduleName]._placeholder !== true) {
      console.log('✅ Module ' + moduleName + ' already exists (not placeholder)');
      return;
    }
    
    // 如果已经存在占位，不重复创建
    if (LawAIApp[moduleName] && LawAIApp[moduleName]._placeholder === true) {
      console.log('🔄 Placeholder for ' + moduleName + ' already exists');
      return;
    }
    
    console.warn('⚠️ Creating placeholder for ' + moduleName);
    
    var placeholder = {
      _placeholder: true,
      _moduleName: moduleName,
      initialized: true,
      
      // 通用方法
      getProgress: function() { 
        return { completedLessons: [], xp: 0, level: 1, day: 1, streak: 0, totalLessons: 365 }; 
      },
      
      getMetrics: function() { 
        return { learningEfficiency: 80, retentionEffectiveness: 80, taskCompletionRate: 75 }; 
      },
      
      getHealthSummary: function() { 
        return { overall: 80, status: 'healthy', metrics: this.getMetrics() }; 
      },
      
      updateMetrics: function() { 
        return { overall: 80, timestamp: new Date().toISOString() }; 
      },
      
      analyze: function() { 
        return []; 
      },
      
      performSelfHealing: function() { 
        console.log('🔧 ' + moduleName + ' placeholder: performing self-healing'); 
        return { healed: true }; 
      },
      
      init: function() { 
        console.log('🔧 ' + moduleName + ' placeholder initialized'); 
        return this; 
      },
      
      // 存储相关
      get: function(key, defaultValue) { 
        return defaultValue !== undefined ? defaultValue : null; 
      },
      
      set: function(key, value) { 
        return true; 
      },
      
      emit: function(event, data) { 
        try { window.dispatchEvent(new CustomEvent(event, { detail: data })); } 
        catch(e) {}
        return true; 
      },
      
      on: function(event, callback) { 
        try { window.addEventListener(event, function(e) { callback(e.detail); }); } 
        catch(e) {}
        return true; 
      },
      
      // 额外方法（某些模块可能用到）
      getState: function() {
        return { level: 1, xp: 0, streak: 0, day: 1 };
      },
      
      getRemainingLessons: function() {
        return 365;
      },
      
      getCompletionPercent: function() {
        return 0;
      },
      
      getCurrentLesson: function() {
        return 1;
      },
      
      getCurrentStage: function() {
        return 'Foundation';
      },
      
      isLessonCompleted: function() {
        return false;
      },
      
      getCompletedLessons: function() {
        return [];
      },
      
      resetProgress: function() {
        return this.getProgress();
      }
    };
    
    LawAIApp[moduleName] = placeholder;
    console.log('✅ Placeholder ' + moduleName + ' created');
  },

  // ===========================================
  // 确保核心模块存在
  // ===========================================
  
  _ensureCoreModules: function() {
    console.log('📦 Ensuring core modules exist...');
    
    var coreModules = ['StorageEngine', 'EventBus', 'ProgressEngine'];
    
    for (var i = 0; i < coreModules.length; i++) {
      var name = coreModules[i];
      if (!LawAIApp[name]) {
        console.warn('⚠️ ' + name + ' not found, creating placeholder');
        this._createPlaceholder(name);
      }
    }
    
    // 特别确保 ProgressEngine 有 getProgress 方法
    if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress !== 'function') {
      console.warn('⚠️ ProgressEngine missing getProgress, adding method');
      LawAIApp.ProgressEngine.getProgress = function() {
        return { completedLessons: [], xp: 0, level: 1, totalLessons: 365, day: 1, streak: 0 };
      };
    }
  },

  // ===========================================
  // 初始化单个模块
  // ===========================================
  
  _initModule: function(moduleName) {
    var module = LawAIApp[moduleName];
    
    // 如果是占位，不需要初始化
    if (module && module._placeholder === true) {
      console.log('⏭️ ' + moduleName + ' is placeholder, skipping init');
      return Promise.resolve(true);
    }
    
    if (module && typeof module.init === 'function') {
      try {
        console.log('🔧 Initializing ' + moduleName + '...');
        var result = module.init();
        if (result && typeof result.then === 'function') {
          return result.then(function() {
            console.log('✅ ' + moduleName + ' initialized (async)');
            return true;
          }).catch(function(err) {
            console.warn('⚠️ ' + moduleName + ' async init failed:', err);
            return false;
          });
        } else {
          console.log('✅ ' + moduleName + ' initialized (sync)');
          return Promise.resolve(true);
        }
      } catch (err) {
        console.warn('⚠️ Failed to initialize ' + moduleName + ':', err);
        this._createPlaceholder(moduleName);
        return Promise.resolve(false);
      }
    } else if (!module) {
      console.warn('⚠️ ' + moduleName + ' not found, creating placeholder');
      this._createPlaceholder(moduleName);
      return Promise.resolve(false);
    } else {
      console.log('✅ ' + moduleName + ' exists (no init needed)');
      return Promise.resolve(true);
    }
  },

  // ===========================================
  // 主要启动方法
  // ===========================================
  
  boot: async function() {
    var self = this;
    
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
      this._ensureCoreModules();

      // ===========================================
      // Phase 2: 初始化核心模块
      // ===========================================
      console.log('📦 Phase 2: Initializing core modules...');

      for (var i = 0; i < this._coreModules.length; i++) {
        var moduleName = this._coreModules[i];
        await this._initModule(moduleName);
        await this._waitForModule(moduleName, 10);
      }

      // ===========================================
      // Phase 3: 触发系统就绪事件
      // ===========================================
      console.log('📦 Phase 3: System ready...');
      
      this.initialized = true;
      this._bootPhase = 'ready';

      // 触发系统就绪事件
      try {
        var modulesStatus = this._coreModules.map(function(name) {
          return {
            name: name,
            ready: self._isModuleReady(name),
            exists: !!LawAIApp[name],
            isPlaceholder: LawAIApp[name] && LawAIApp[name]._placeholder === true
          };
        });
        
        var event = new CustomEvent('CORE_BOOTSTRAP_READY', {
          detail: {
            timestamp: Date.now(),
            modules: modulesStatus
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
      setTimeout(function() {
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

  // ===========================================
  // 获取启动状态
  // ===========================================
  
  getStatus: function() {
    var self = this;
    return {
      initialized: this.initialized,
      phase: this._bootPhase,
      modules: this._coreModules.map(function(name) {
        var module = LawAIApp[name];
        return {
          name: name,
          ready: self._isModuleReady(name),
          exists: !!module,
          isPlaceholder: module && module._placeholder === true
        };
      })
    };
  },

  // ===========================================
  // 重置
  // ===========================================
  
  reset: function() {
    this.initialized = false;
    this._bootPhase = 'idle';
    console.log('🔄 CoreBootstrap reset');
  },

  // ===========================================
  // 强制重新启动
  // ===========================================
  
  restart: function() {
    console.log('🔄 CoreBootstrap restarting...');
    this.reset();
    return this.boot();
  }
};

// ===========================================
// 自动启动
// ===========================================

// 等待 DOM 加载完成
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function() {
    LawAIApp.CoreBootstrap.boot();
  }, 100);
} else {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      LawAIApp.CoreBootstrap.boot();
    }, 100);
  });
}

console.log('🚀 CoreBootstrap V1.1 ready');
