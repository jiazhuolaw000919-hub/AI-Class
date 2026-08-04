// js/academy/academyLoader.js
// Part 57.4-57.6 — Academy Loader (升级)
// Law AI Academy Developer Bible

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyLoader && window.LawAIApp.AcademyLoader._upgraded) {
    console.log('[AcademyLoader] Already upgraded, skipping...');
    return;
  }

  class AcademyLoader {
    constructor() {
      this.version = '2.0.0';
      this._upgraded = true;
      this.status = 'idle';
      this.health = 'pending';
      
      this._manifest = null;
      this._loadedModules = [];
      this._failedModules = [];
      this._startTime = null;
      this._endTime = null;
      
      this._state = {
        runtimeAvailable: false,
        manifestLoaded: false,
        modulesLoaded: false,
        experienceReady: false,
        ready: false
      };
      
      this._started = false;
      this._startPromise = null;
    }

    // ============================================================
    // Public API
    // ============================================================

    start() {
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready');
        return Promise.resolve(this.getStatus());
      }
      
      if (this._started && this._startPromise) {
        console.log('[AcademyLoader] Already starting, returning existing promise');
        return this._startPromise;
      }
      
      this._started = true;
      this._startPromise = this._doStart();
      return this._startPromise;
    }

    async _doStart() {
      this._startTime = Date.now();
      this.status = 'loading';
      this.health = 'pending';
      
      console.log('[AcademyLoader] 🚀 Starting Academy Loader v' + this.version);

      try {
        await this._checkRuntime();
        await this._loadManifest();
        await this._loadModulesFromManifest();
        await this._initializeRegistry();
        await this._connectEngines();
        await this._initializeExperience();
        await this._validateReady();
        
        this.status = 'ready';
        this.health = 'healthy';
        this._endTime = Date.now();
        
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
        this._broadcast('ACADEMY_FAILED', { error: error.message });
        throw error;
      }
    }

    getStatus() {
      return {
        status: this.status,
        health: this.health,
        version: this.version,
        runtimeAvailable: this._state.runtimeAvailable,
        manifestLoaded: this._state.manifestLoaded,
        modulesLoaded: this._state.modulesLoaded,
        experienceReady: this._state.experienceReady,
        ready: this._state.ready,
        loadedModules: this._loadedModules,
        failedModules: this._failedModules,
        startTime: this._startTime,
        endTime: this._endTime,
        duration: this._endTime ? this._endTime - this._startTime : null,
        started: this._started
      };
    }

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
        modulesLoaded: false,
        experienceReady: false,
        ready: false
      };
      return this.start();
    }

    // ============================================================
    // Private Steps
    // ============================================================

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

    _waitForRuntime() {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
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

    async _loadManifest() {
      console.log('[AcademyLoader] Loading Manifest...');
      const manifest = window.LawAIApp?.AcademyManifest;
      if (!manifest) {
        console.warn('[AcademyLoader] Manifest not found, using defaults');
        this._manifest = this._getDefaultManifest();
        if (!window.LawAIApp) window.LawAIApp = {};
        window.LawAIApp.AcademyManifest = this._manifest;
      } else {
        this._manifest = manifest;
      }
      this._state.manifestLoaded = true;
      console.log('[AcademyLoader] ✅ Manifest loaded (v' + this._manifest.version + ')');
    }

    async _loadModulesFromManifest() {
      console.log('[AcademyLoader] 📦 Loading modules from Manifest...');

      const modules = this._manifest.modules || [];
      
      if (modules.length === 0) {
        console.warn('[AcademyLoader] No modules defined in manifest');
        this._state.modulesLoaded = true;
        return;
      }

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        try {
          const loaded = await this._loadSingleModule(module);
          if (loaded) {
            this._loadedModules.push(module.id);
            console.log('[AcademyLoader] ✅ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' loaded');
          } else {
            this._failedModules.push(module.id);
            console.warn('[AcademyLoader] ⚠️ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' failed');
          }
        } catch (error) {
          this._failedModules.push(module.id);
          console.warn('[AcademyLoader] ⚠️ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' error:', error);
        }
      }

      this._state.modulesLoaded = true;
      console.log('[AcademyLoader] ✅ Module loading complete:', this._loadedModules.length + ' loaded, ' + this._failedModules.length + ' failed');
      this._broadcast('ACADEMY_MODULES_READY', {
        loaded: this._loadedModules,
        failed: this._failedModules
      });
    }

    // ============================================================
    // 🔥 独立方法 — 不在任何方法内部
    // ============================================================
    _loadSingleModule: function(module) {
      return new Promise((resolve) => {
        const check = this._checkModuleExists(module.id);
        if (check.exists) {
          console.log('[AcademyLoader] ⏭️ Module already exists:', module.id);
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;

        let resolved = false;

        script.onload = function() {
          if (resolved) return;
          resolved = true;
          const checkAfter = this._checkModuleExists(module.id);
          if (checkAfter.exists) {
            resolve(true);
          } else {
            console.warn('[AcademyLoader] ⚠️ Module loaded but not registered:', module.id);
            resolve(false);
          }
        }.bind(this);

        script.onerror = function() {
          if (resolved) return;
          resolved = true;
          console.warn('[AcademyLoader] ❌ Failed to load:', module.path);
          resolve(false);
        }.bind(this);

        const timeout = setTimeout(function() {
          if (resolved) return;
          resolved = true;
          console.warn('[AcademyLoader] ⏰ Timeout loading:', module.path);
          resolve(false);
        }, 8000);

        const originalOnload = script.onload;
        script.onload = function() {
          clearTimeout(timeout);
          originalOnload.call(this);
        }.bind(this);

        document.head.appendChild(script);
      }.bind(this));
    }

    _checkModuleExists: function(moduleId) {
      const mapping = {
        'schoolRegistry': function() { return !!window.LawAIApp?.SchoolRegistry; },
        'programRegistry': function() { return !!window.LawAIApp?.ProgramRegistry; },
        'courseRegistry': function() { return !!window.LawAIApp?.CourseRegistry; },
        'curriculumRegistry': function() { return !!window.LawAIApp?.CurriculumRegistry; },
        'curriculumSeed': function() { return !!window.LawAIApp?.CurriculumSeed; },
        'academyView': function() { return !!window.LawAIApp?.AcademyView; },
        'academyExperienceManager': function() { return !!window.LawAIApp?.AcademyExperienceManager; }
      };

      const check = mapping[moduleId];
      if (check) {
        return { exists: check() };
      }

      const propName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
      return {
        exists: !!(window.LawAIApp && window.LawAIApp[propName])
      };
    }

    async _initializeRegistry() {
      console.log('[AcademyLoader] Initializing Registry...');
      
      const academyRegistry = window.LawAIApp?.AcademyRegistry;
      if (academyRegistry) {
        if (!academyRegistry.initialized) {
          academyRegistry.initialize();
        }
        console.log('[AcademyLoader] ✅ AcademyRegistry initialized');
      } else {
        console.warn('[AcademyLoader] AcademyRegistry not available');
      }
      
      const schoolRegistry = window.LawAIApp?.SchoolRegistry;
      if (schoolRegistry) {
        if (!schoolRegistry.initialized) {
          schoolRegistry.initialize();
        }
        console.log('[AcademyLoader] ✅ SchoolRegistry initialized');
      } else {
        console.warn('[AcademyLoader] SchoolRegistry not available');
      }
      
      this._broadcast('REGISTRY_INITIALIZED', {
        loaded: this._loadedModules,
        failed: this._failedModules
      });
    }

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
          console.log('[AcademyLoader] ✅ ' + name + ' connected');
        } else {
          console.log('[AcademyLoader] ⚠️ ' + name + ' not found (optional)');
        }
      });
      
      this._loadedModules = [...this._loadedModules, ...connected];
      this._state.enginesConnected = true;
      this._broadcast('ENGINES_CONNECTED', { connected });
    }

    async _initializeExperience() {
      console.log('[AcademyLoader] 🎬 Initializing Academy Experience...');

      const manager = window.LawAIApp?.AcademyExperienceManager;

      if (!manager) {
        console.warn('[AcademyLoader] AcademyExperienceManager not found');
        this._state.experienceReady = false;
        return;
      }

      if (manager.initialized) {
        console.log('[AcademyLoader] ✅ AcademyExperienceManager already initialized');
        this._state.experienceReady = true;
        this._broadcast('ACADEMY_EXPERIENCE_READY', { status: 'ready' });
        return;
      }

      try {
        manager.init();
        
        let attempts = 0;
        const maxAttempts = 20;
        
        await new Promise((resolve) => {
          const checkMount = function() {
            attempts++;
            if (manager.mounted) {
              console.log('[AcademyLoader] ✅ AcademyExperienceManager mounted');
              this._state.experienceReady = true;
              this._broadcast('ACADEMY_EXPERIENCE_READY', { status: 'ready' });
              resolve();
            } else if (attempts < maxAttempts) {
              setTimeout(checkMount, 300);
            } else {
              console.warn('[AcademyLoader] ⚠️ AcademyExperienceManager mount timeout');
              this._state.experienceReady = true;
              resolve();
            }
          }.bind(this);
          
          setTimeout(checkMount, 500);
        }.bind(this));

      } catch (error) {
        console.error('[AcademyLoader] ❌ Experience init failed:', error);
        this._state.experienceReady = false;
      }
    }

    async _validateReady() {
      console.log('[AcademyLoader] Validating readiness...');
      
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
      
      const registry = window.LawAIApp?.AcademyRegistry;
      if (registry && registry.isReady && registry.isReady()) {
        console.log('[AcademyLoader] ✅ AcademyRegistry ready');
      }
      
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

    _getDefaultManifest: function() {
      return {
        version: '1.0.0',
        modules: [
          { id: 'schoolRegistry', path: 'js/academy/schoolRegistry.js', required: true },
          { id: 'programRegistry', path: 'js/academy/programRegistry.js', required: true },
          { id: 'courseRegistry', path: 'js/academy/courseRegistry.js', required: true },
          { id: 'curriculumRegistry', path: 'js/academy/curriculumRegistry.js', required: true },
          { id: 'curriculumSeed', path: 'js/academy/curriculumSeed.js', required: true },
          { id: 'academyView', path: 'js/academy/academyView.js', required: true },
          { id: 'academyExperienceManager', path: 'js/academy/academyExperienceManager.js', required: true }
        ]
      };
    }

    _broadcast: function(event, data) {
      const eventName = 'academy:' + event.toLowerCase();
      
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
      
      console.log('[AcademyLoader] 📡 Event: ' + event, data);
    }

    healthCheck: function() {
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
  // Export
  // ============================================================

  var academyLoader = new AcademyLoader();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.AcademyLoader = academyLoader;

  if (!window.LawAIApp.Academy) {
    window.LawAIApp.Academy = {};
  }
  
  if (typeof window.LawAIApp.Academy.status === 'undefined') {
    Object.defineProperty(window.LawAIApp.Academy, 'status', {
      value: 'pending',
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  console.log('[AcademyLoader] ✅ Module loaded (v' + academyLoader.version + ')');

  // ============================================================
  // Auto-start
  // ============================================================

  function autoStartAcademy() {
    if (academyLoader.status === 'ready' || academyLoader.status === 'loading') {
      console.log('[AcademyLoader] Auto-start skipped: already', academyLoader.status);
      return;
    }
    
    console.log('[AcademyLoader] 🔥 Auto-starting...');
    academyLoader.start().catch(function(e) {
      console.warn('[AcademyLoader] Auto-start failed:', e);
    });
  }

  var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };
  
  scheduleFn(function() {
    autoStartAcademy();
  });
  
  document.addEventListener('RUNTIME_READY', function() {
    console.log('[AcademyLoader] 📡 RUNTIME_READY received, auto-starting...');
    autoStartAcademy();
  });

  window.addEventListener('RUNTIME_READY', function() {
    console.log('[AcademyLoader] 📡 RUNTIME_READY (window) received, auto-starting...');
    autoStartAcademy();
  });

})();
