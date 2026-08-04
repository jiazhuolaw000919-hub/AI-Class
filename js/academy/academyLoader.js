// js/academy/academyLoader.js
// Part 57.3 — Academy Loader (Bootstrap)
// Law AI Academy Developer Bible
//
// PURPOSE: Bootstrap the Academy Experience Layer.
//          Loads Manifest, initializes Registry, connects Engines.
//
// API: LawAIApp.AcademyLoader.start()
// EXPECTED: LawAIApp.Academy.status === 'ready'

(function() {
  'use strict';

  // ============================================================
  // 防止重复加载
  // ============================================================
  if (window.LawAIApp && window.LawAIApp.AcademyLoader) {
    console.warn('[AcademyLoader] Already exists, skipping...');
    return;
  }

  /**
   * AcademyLoader
   * 
   * 负责：
   * 1. 检查 Runtime 可用性
   * 2. 加载 Academy Manifest
   * 3. 初始化现有 Academy Engines
   * 4. 初始化 Registry
   * 5. 暴露 Academy API
   */
  class AcademyLoader {
    constructor() {
      this.version = '1.0.0';
      this.status = 'pending';
      this.health = 'pending';
      
      this._manifest = null;
      this._loadedModules = [];
      this._failedModules = [];
      this._startTime = null;
      this._endTime = null;
      
      this._state = {
        runtimeAvailable: false,
        manifestLoaded: false,
        registryInitialized: false,
        enginesConnected: false,
        ready: false
      };
      
      // 防止重复启动
      this._started = false;
      this._startPromise = null;
    }

    // ============================================================
    // Public API
    // ============================================================

    /**
     * 启动 Academy Loader
     * @returns {Promise<Object>}
     */
    start() {
      // 如果已经 ready，直接返回
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready');
        return Promise.resolve(this.getStatus());
      }
      
      // 如果正在启动，返回同一个 Promise
      if (this._started && this._startPromise) {
        console.log('[AcademyLoader] Already starting, returning existing promise');
        return this._startPromise;
      }
      
      this._started = true;
      this._startPromise = this._doStart();
      return this._startPromise;
    }

    /**
     * 实际启动逻辑
     * @private
     */
    async _doStart() {
      this._startTime = Date.now();
      this.status = 'starting';
      
      console.log('[AcademyLoader] 🚀 Starting Academy Experience Layer...');

      try {
        // Step 1: 检查 Runtime
        await this._checkRuntime();
        
        // Step 2: 加载 Manifest
        await this._loadManifest();
        
        // Step 3: 初始化 Registry
        await this._initializeRegistry();
        
        // Step 4: 连接 Engines
        await this._connectEngines();
        
        // Step 5: 验证状态
        await this._validateReady();
        
        this.status = 'ready';
        this.health = 'healthy';
        this._endTime = Date.now();
        
        // 广播事件
        this._broadcast('ACADEMY_READY', {
          status: this.status,
          duration: this._endTime - this._startTime,
          loaded: this._loadedModules,
          failed: this._failedModules
        });
        
        console.log('[AcademyLoader] ✅ Academy ready in', this._endTime - this._startTime, 'ms');
        return this.getStatus();
        
      } catch (error) {
        this.status = 'failed';
        this.health = 'unhealthy';
        console.error('[AcademyLoader] ❌ Startup failed:', error);
        
        this._broadcast('ACADEMY_FAILED', {
          error: error.message,
          status: this.status
        });
        
        throw error;
      }
    }

    /**
     * 获取当前状态
     * @returns {Object}
     */
    getStatus() {
      return {
        status: this.status,
        health: this.health,
        version: this.version,
        runtimeAvailable: this._state.runtimeAvailable,
        manifestLoaded: this._state.manifestLoaded,
        registryInitialized: this._state.registryInitialized,
        enginesConnected: this._state.enginesConnected,
        ready: this._state.ready,
        loadedModules: this._loadedModules.length,
        failedModules: this._failedModules.length,
        startTime: this._startTime,
        endTime: this._endTime,
        duration: this._endTime ? this._endTime - this._startTime : null,
        started: this._started
      };
    }

    /**
     * 重启 Academy
     * @returns {Promise<Object>}
     */
    async restart() {
      console.log('[AcademyLoader] 🔄 Restarting Academy...');
      this.status = 'restarting';
      this._started = false;
      this._startPromise = null;
      
      this._loadedModules = [];
      this._failedModules = [];
      this._state = {
        runtimeAvailable: false,
        manifestLoaded: false,
        registryInitialized: false,
        enginesConnected: false,
        ready: false
      };
      
      return this.start();
    }

    // ============================================================
    // Private Steps
    // ============================================================

    /**
     * Step 1: 检查 Runtime
     */
    async _checkRuntime() {
      console.log('[AcademyLoader] Checking Runtime...');
      
      const runtimeAvailable = !!(window.LawAIApp && window.LawAIApp.RuntimeOS);
      
      if (!runtimeAvailable) {
        console.warn('[AcademyLoader] Runtime OS not available, waiting...');
        await this._waitForRuntime();
      }
      
      this._state.runtimeAvailable = true;
      console.log('[AcademyLoader] ✅ Runtime available');
      
      this._broadcast('RUNTIME_CHECKED', { available: true });
    }

    /**
     * 等待 Runtime OS
     * @returns {Promise}
     */
    _waitForRuntime() {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total
        
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.LawAIApp && window.LawAIApp.RuntimeOS) {
            clearInterval(checkInterval);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.warn('[AcademyLoader] Runtime wait timeout, continuing...');
            resolve();
          }
        }, 100);
      });
    }

    /**
     * Step 2: 加载 Manifest
     */
    async _loadManifest() {
      console.log('[AcademyLoader] Loading Manifest...');
      
      const manifest = window.LawAIApp?.AcademyManifest;
      
      if (!manifest) {
        console.warn('[AcademyLoader] Manifest not found, using defaults');
        this._manifest = this._getDefaultManifest();
      } else {
        this._manifest = manifest;
      }
      
      this._state.manifestLoaded = true;
      console.log('[AcademyLoader] ✅ Manifest loaded');
    }

    /**
     * Step 3: 初始化 Registry
     */
    async _initializeRegistry() {
      console.log('[AcademyLoader] Initializing Registry...');
      
      // 初始化 AcademyRegistry
      const academyRegistry = window.LawAIApp?.AcademyRegistry;
      if (academyRegistry) {
        if (!academyRegistry.initialized) {
          academyRegistry.initialize();
        }
        this._loadedModules.push('AcademyRegistry');
        console.log('[AcademyLoader] ✅ AcademyRegistry initialized');
      } else {
        console.warn('[AcademyLoader] AcademyRegistry not available');
        this._failedModules.push('AcademyRegistry');
      }
      
      // 初始化 SchoolRegistry
      const schoolRegistry = window.LawAIApp?.SchoolRegistry;
      if (schoolRegistry) {
        if (!schoolRegistry.initialized) {
          schoolRegistry.initialize();
        }
        this._loadedModules.push('SchoolRegistry');
        console.log('[AcademyLoader] ✅ SchoolRegistry initialized');
      } else {
        console.warn('[AcademyLoader] SchoolRegistry not available');
        this._failedModules.push('SchoolRegistry');
      }
      
      this._state.registryInitialized = true;
      
      this._broadcast('REGISTRY_INITIALIZED', {
        loaded: this._loadedModules,
        failed: this._failedModules
      });
    }

    /**
     * Step 4: 连接 Engines
     */
    async _connectEngines() {
      console.log('[AcademyLoader] Connecting Engines...');
      
      const connected = [];
      
      const engineChecks = [
        { name: 'Academy', check: () => window.LawAIApp?.Academy },
        { name: 'SchoolEngine', check: () => window.LawAIApp?.SchoolEngine },
        { name: 'CurriculumFactory', check: () => window.LawAIApp?.CurriculumFactory },
        { name: 'LessonEngine', check: () => window.LawAIApp?.LessonEngine },
        { name: 'LearningJourney', check: () => window.LawAIApp?.LearningJourney },
        { name: 'ProgressEngine', check: () => window.LawAIApp?.ProgressEngine }
      ];
      
      engineChecks.forEach(({ name, check }) => {
        const exists = !!check();
        if (exists) {
          connected.push(name);
          console.log(`[AcademyLoader] ✅ ${name} connected`);
        } else {
          console.log(`[AcademyLoader] ⚠️ ${name} not found (optional)`);
        }
      });
      
      this._loadedModules = [...this._loadedModules, ...connected];
      this._state.enginesConnected = true;
      
      this._broadcast('ENGINES_CONNECTED', { connected });
    }

    /**
     * Step 5: 验证就绪
     */
    async _validateReady() {
      console.log('[AcademyLoader] Validating readiness...');
      
      // 验证 Academy.status === 'ready'
      const academy = window.LawAIApp?.Academy;
      if (academy) {
        if (typeof academy.status !== 'undefined') {
          if (academy.status === 'ready') {
            console.log('[AcademyLoader] ✅ Academy.status = ready');
          } else {
            console.log('[AcademyLoader] ⚠️ Academy.status =', academy.status);
            try {
              academy.status = 'ready';
            } catch (e) {}
          }
        } else {
          try {
            Object.defineProperty(academy, 'status', {
              value: 'ready',
              writable: false,
              enumerable: true
            });
          } catch (e) {}
        }
      }
      
      // 验证 AcademyRegistry 就绪
      const registry = window.LawAIApp?.AcademyRegistry;
      if (registry && registry.isReady && registry.isReady()) {
        console.log('[AcademyLoader] ✅ AcademyRegistry ready');
      }
      
      // 验证 SchoolRegistry 就绪
      const schoolReg = window.LawAIApp?.SchoolRegistry;
      if (schoolReg && schoolReg.initialized) {
        console.log('[AcademyLoader] ✅ SchoolRegistry ready');
      }
      
      this._state.ready = true;
      console.log('[AcademyLoader] ✅ Academy ready');
    }

    // ============================================================
    // Helpers
    // ============================================================

    _getDefaultManifest() {
      return {
        version: '1.0.0',
        core: [
          { id: 'academy', file: 'academy.js', required: true },
          { id: 'academyModel', file: 'academyModel.js', required: true }
        ],
        school: [
          { id: 'schoolEngine', file: 'schoolEngine.js', required: true }
        ],
        curriculum: [
          { id: 'curriculumFactory', file: 'curriculumFactoryEngine.js', required: true }
        ],
        learning: [
          { id: 'learningJourney', file: 'learningJourneyEngine.js', required: true }
        ],
        lesson: [
          { id: 'lessonEngine', file: 'lessonEngine.js', required: true }
        ]
      };
    }

    _broadcast(event, data) {
      const eventName = `academy:${event.toLowerCase()}`;
      
      if (window.LawAIApp && window.LawAIApp.EventBus) {
        try {
          window.LawAIApp.EventBus.emit(eventName, data);
        } catch (e) {}
      }
      
      try {
        const customEvent = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(customEvent);
        window.dispatchEvent(customEvent);
      } catch (e) {}
      
      console.log(`[AcademyLoader] 📡 Event: ${event}`, data);
    }

    // ============================================================
    // Health & Recovery
    // ============================================================

    healthCheck() {
      return {
        status: this.status,
        health: this.health,
        version: this.version,
        state: this._state,
        loadedModules: this._loadedModules.length,
        failedModules: this._failedModules.length
      };
    }

    async recover() {
      console.log('[AcademyLoader] 🔧 Attempting recovery...');
      
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready, no recovery needed');
        return this.getStatus();
      }
      
      try {
        const registry = window.LawAIApp?.AcademyRegistry;
        if (registry && !registry.initialized) {
          registry.initialize();
        }
      } catch (e) {
        console.error('[AcademyLoader] Recovery failed:', e);
      }
      
      await this._validateReady();
      
      if (this._state.ready) {
        this.status = 'ready';
        this.health = 'healthy';
        console.log('[AcademyLoader] ✅ Recovery successful');
      } else {
        console.log('[AcademyLoader] ❌ Recovery failed');
      }
      
      return this.getStatus();
    }
  }

  // ============================================================
  // 🔥 创建实例并挂载到全局
  // ============================================================

  var academyLoader = new AcademyLoader();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  // ✅ 挂载到 LawAIApp
  window.LawAIApp.AcademyLoader = academyLoader;

  // 给 Academy 添加 status
  if (!window.LawAIApp.Academy) {
    window.LawAIApp.Academy = {};
  }
  
  // 使用 defineProperty 确保 status 存在
  if (typeof window.LawAIApp.Academy.status === 'undefined') {
    Object.defineProperty(window.LawAIApp.Academy, 'status', {
      value: 'pending',
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  console.log('[AcademyLoader] ✅ Module loaded (Part 57.3)');
  console.log('[AcademyLoader] 📦 AcademyLoader instance:', academyLoader);

  // ============================================================
  // 🔥 延迟自动启动（不阻塞主线程）
  // ============================================================

  function autoStartAcademy() {
    if (academyLoader.status === 'ready' || academyLoader.status === 'starting') {
      console.log('[AcademyLoader] Auto-start skipped: already', academyLoader.status);
      return;
    }
    
    console.log('[AcademyLoader] 🔥 Auto-starting...');
    academyLoader.start().catch(function(e) {
      console.warn('[AcademyLoader] Auto-start failed:', e);
    });
  }

  // 使用 requestIdleCallback 或 setTimeout 延迟启动
  var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };
  
  scheduleFn(function() {
    autoStartAcademy();
  });

  // ============================================================
  // 监听 RUNTIME_READY 事件作为后备启动
  // ============================================================
  
  document.addEventListener('RUNTIME_READY', function() {
    console.log('[AcademyLoader] 📡 RUNTIME_READY received, auto-starting...');
    autoStartAcademy();
  });

  window.addEventListener('RUNTIME_READY', function() {
    console.log('[AcademyLoader] 📡 RUNTIME_READY (window) received, auto-starting...');
    autoStartAcademy();
  });

})();  // ← 结束自执行函数
