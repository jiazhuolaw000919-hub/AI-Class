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
      
      // 加载状态
      this._state = {
        runtimeAvailable: false,
        manifestLoaded: false,
        registryInitialized: false,
        enginesConnected: false,
        ready: false
      };
    }

    // ============================================
    // Public API
    // ============================================

    /**
     * 启动 Academy Loader
     * @returns {Promise<Object>}
     */
    async start() {
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
        
        this._broadcast('ACADEMY_ERROR', {
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
        duration: this._endTime ? this._endTime - this._startTime : null
      };
    }

    /**
     * 重启 Academy
     * @returns {Promise<Object>}
     */
    async restart() {
      console.log('[AcademyLoader] 🔄 Restarting Academy...');
      this.status = 'restarting';
      
      // 清理状态
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

    // ============================================
    // Private Steps
    // ============================================

    /**
     * Step 1: 检查 Runtime
     */
    async _checkRuntime() {
      console.log('[AcademyLoader] Checking Runtime...');
      
      const runtimeAvailable = !!(window.LawAIApp && window.LawAIApp.RuntimeOS);
      
      if (!runtimeAvailable) {
        console.warn('[AcademyLoader] Runtime OS not available, waiting...');
        // 等待 Runtime OS
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
        const checkInterval = setInterval(() => {
          if (window.LawAIApp && window.LawAIApp.RuntimeOS) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        
        // 超时 5 秒
        setTimeout(() => {
          clearInterval(checkInterval);
          console.warn('[AcademyLoader] Runtime wait timeout, continuing...');
          resolve();
        }, 5000);
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
      console.log('[AcademyLoader]   Core:', this._manifest.core?.length || 0);
      console.log('[AcademyLoader]   School:', this._manifest.school?.length || 0);
      console.log('[AcademyLoader]   Curriculum:', this._manifest.curriculum?.length || 0);
      console.log('[AcademyLoader]   Learning:', this._manifest.learning?.length || 0);
      console.log('[AcademyLoader]   Lesson:', this._manifest.lesson?.length || 0);
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
      
      // 检查各个 Engine
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
        // 如果 Academy 有 status 属性，检查它
        if (typeof academy.status !== 'undefined') {
          if (academy.status === 'ready') {
            console.log('[AcademyLoader] ✅ Academy.status = ready');
          } else {
            console.log('[AcademyLoader] ⚠️ Academy.status =', academy.status);
            // 尝试设置
            try {
              academy.status = 'ready';
            } catch (e) {
              // 只读属性
            }
          }
        } else {
          // 添加 status 属性
          try {
            Object.defineProperty(academy, 'status', {
              value: 'ready',
              writable: false,
              enumerable: true
            });
          } catch (e) {
            // 忽略
          }
        }
      }
      
      // 验证 AcademyRegistry 就绪
      const registry = window.LawAIApp?.AcademyRegistry;
      if (registry && registry.isReady()) {
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

    // ============================================
    // Helpers
    // ============================================

    /**
     * 获取默认 Manifest
     */
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

    /**
     * 广播事件
     */
    _broadcast(event, data) {
      const eventName = `academy:${event.toLowerCase()}`;
      
      // 通过 EventBus
      if (window.LawAIApp && window.LawAIApp.EventBus) {
        try {
          window.LawAIApp.EventBus.emit(eventName, data);
        } catch (e) {
          // 忽略
        }
      }
      
      // 通过 CustomEvent
      try {
        const customEvent = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(customEvent);
      } catch (e) {
        // 忽略
      }
      
      console.log(`[AcademyLoader] 📡 Event: ${event}`, data);
    }

    // ============================================
    // Health & Recovery
    // ============================================

    /**
     * 健康检查
     */
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

    /**
     * 恢复 Academy
     */
    async recover() {
      console.log('[AcademyLoader] 🔧 Attempting recovery...');
      
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready, no recovery needed');
        return this.getStatus();
      }
      
      // 尝试重新初始化 Registry
      try {
        const registry = window.LawAIApp?.AcademyRegistry;
        if (registry && !registry.initialized) {
          registry.initialize();
        }
      } catch (e) {
        console.error('[AcademyLoader] Recovery failed:', e);
      }
      
      // 重新验证
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

  // ============================================
  // Export
  // ============================================

  const academyLoader = new AcademyLoader();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.AcademyLoader = academyLoader;

  // 给 Academy 添加 status
  if (!window.LawAIApp.Academy) {
    window.LawAIApp.Academy = {};
  }
  Object.defineProperty(window.LawAIApp.Academy, 'status', {
    value: 'pending',
    writable: true,
    enumerable: true
  });

  console.log('[AcademyLoader] Module loaded (Part 57.3)');

  // ============================================
  // Auto-Start after Load
  // ============================================

  // 等待 DOM 加载完成后自动启动
  if (document.readyState === 'complete') {
    setTimeout(() => {
      academyLoader.start().catch(e => {
        console.warn('[AcademyLoader] Auto-start failed:', e);
      });
    }, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => {
        academyLoader.start().catch(e => {
          console.warn('[AcademyLoader] Auto-start failed:', e);
        });
      }, 100);
    });
  }

})();
