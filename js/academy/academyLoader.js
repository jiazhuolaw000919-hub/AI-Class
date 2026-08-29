// js/academy/academyLoader.js
// Part 57.4-57.6 REBUILD — AcademyLoader Architecture Reset
// Law AI Academy Developer Bible
//
// PURPOSE: Academy Runtime Loading Layer
// RESPONSIBILITY: Load modules, initialize runtime, broadcast events
// BOUNDARY: NO UI, NO course management, NO school creation

(function() {
  'use strict';

  // ============================================================
  // 防止重复加载
  // ============================================================
  if (window.LawAIApp && window.LawAIApp.AcademyLoader) {
    console.warn('[AcademyLoader] Already exists, skipping...');
    return;
  }

  // ============================================================
  // ES6 Class — AcademyLoader
  // ============================================================
  class AcademyLoader {
    constructor() {
      this.version = '2.0.0';
      this.status = 'idle';
      this.health = 'pending';

      this.modules = [];
      this.failedModules = [];
      this.loadedModules = [];

      this.started = false;
      this.startTime = null;
      this.endTime = null;
      this.startPromise = null;

      this._manifest = null;

      this._moduleChecks = {
        academyExperienceManager: function() {
          return !!(window.LawAIApp && window.LawAIApp.AcademyExperienceManager);
        },
        academyView: function() {
          return !!(window.LawAIApp && window.LawAIApp.AcademyView);
        },
        schoolRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.SchoolRegistry);
        },
        programRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.ProgramRegistry);
        },
        courseRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.CourseRegistry);
        },
        curriculumRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.CurriculumRegistry);
        },
        curriculumSeed: function() {
          return !!(window.LawAIApp && window.LawAIApp.CurriculumSeed);
        },
        // ═══ S4 新增模块检查 ═══
        contentLoader: function() {
          return !!(window.LawAIApp && window.LawAIApp.ContentLoader);
        },
        contentRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.ContentRegistry);
        },
        contentAdapter: function() {
          return !!(window.LawAIApp && window.LawAIApp.ContentAdapter);
        },
        subjectRegistry: function() {
          return !!(window.LawAIApp && window.LawAIApp.SubjectRegistry);
        },
        contentValidator: function() {
          return !!(window.LawAIApp && window.LawAIApp.ContentValidator);
        },
        
        practiceEngine: function() {
            return !!(window.LawAIApp && window.LawAIApp.PracticeEngine);
        },
        practiceModule: function() {
            return !!(window.LawAIApp && window.LawAIApp.PracticeModule);
        },
        practiceProgress: function() {
            return !!(window.LawAIApp && window.LawAIApp.PracticeProgress);
        },
        knowledgeCapture: function() {
            return !!(window.LawAIApp && window.LawAIApp.KnowledgeCapture);
        },
        knowledgeEditor: function() {
            return !!(window.LawAIApp && window.LawAIApp.KnowledgeEditor);
        },
        knowledgeLinker: function() {
            return !!(window.LawAIApp && window.LawAIApp.KnowledgeLinker);
        },
        knowledgeCard: function() {
            return !!(window.LawAIApp && window.LawAIApp.KnowledgeCard);
        },
        secondBrain: function() {
            return !!(window.LawAIApp && window.LawAIApp.SecondBrain);
        },
        notes: function() {
            return !!(window.LawAIApp && window.LawAIApp.Notes);
        }
      };
    }

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    async start() {
      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready');
        return this.getStatus();
      }

      if (this.started && this.startPromise) {
        console.log('[AcademyLoader] Already starting, returning existing promise');
        return this.startPromise;
      }

      this.started = true;
      this.startPromise = this._doStart();
      return this.startPromise;
    }

    getStatus() {
      return {
        version: this.version,
        status: this.status,
        health: this.health,
        loadedModules: this.loadedModules,
        failedModules: this.failedModules,
        started: this.started,
        startTime: this.startTime,
        endTime: this.endTime,
        duration: this.endTime ? this.endTime - this.startTime : null
      };
    }

    async restart() {
      console.log('[AcademyLoader] 🔄 Restarting...');

      this.status = 'idle';
      this.health = 'pending';
      this.started = false;
      this.startPromise = null;
      this.modules = [];
      this.failedModules = [];
      this.loadedModules = [];
      this.startTime = null;
      this.endTime = null;
      this._manifest = null;

      return this.start();
    }

    // ============================================================
    // 2. PRIVATE — 启动逻辑
    // ============================================================

    async _doStart() {
      this.startTime = Date.now();
      this.status = 'loading';
      this.health = 'pending';

      console.log('[AcademyLoader] 🚀 Starting Academy Loader v' + this.version);

      try {
        await this._loadManifest();
        await this._loadModules();

        this.status = 'ready';
        this.health = 'healthy';
        this.endTime = Date.now();

        this._broadcast('ACADEMY_READY', {
          status: this.status,
          version: this.version,
          loaded: this.loadedModules,
          failed: this.failedModules,
          duration: this.endTime - this.startTime
        });

        console.log('[AcademyLoader] ✅ Academy ready in', this.endTime - this.startTime, 'ms');
        console.log('[AcademyLoader] 📦 Loaded:', this.loadedModules.length, 'modules');

        return this.getStatus();

      } catch (error) {
        this.status = 'failed';
        this.health = 'unhealthy';

        console.error('[AcademyLoader] ❌ Startup failed:', error);

        this._broadcast('ACADEMY_FAILED', {
          error: error.message,
          loaded: this.loadedModules,
          failed: this.failedModules
        });

        throw error;
      }
    }

    // ============================================================
    // 3. PRIVATE — Manifest
    // ============================================================

    async _loadManifest() {
      console.log('[AcademyLoader] 📋 Loading Manifest...');

      const manifest = window.LawAIApp?.AcademyManifest;

      if (!manifest) {
        console.warn('[AcademyLoader] Manifest not found, using default modules');
        this._manifest = this._getDefaultManifest();
        return;
      }

      this._manifest = manifest;
      console.log('[AcademyLoader] ✅ Manifest loaded (v' + manifest.version + ')');
      console.log('[AcademyLoader] 📦 Modules defined:', manifest.modules?.length || 0);
    }

    // ============================================================
    // 4. PRIVATE — Module Loading
    // ============================================================

    async _loadModules() {
      const modules = this._manifest?.modules || [];

      if (modules.length === 0) {
        console.warn('[AcademyLoader] No modules to load');
        return;
      }

      console.log('[AcademyLoader] 📦 Loading', modules.length, 'modules...');

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const result = await this._loadSingleModule(module);

        if (result.success) {
          this.loadedModules.push(module.id);
          console.log('[AcademyLoader] ✅ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' loaded');
        } else {
          this.failedModules.push(module.id);
          console.warn('[AcademyLoader] ⚠️ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' failed: ' + result.error);
        }
      }

      this._broadcast('ACADEMY_MODULES_READY', {
        loaded: this.loadedModules,
        failed: this.failedModules,
        total: modules.length
      });

      console.log('[AcademyLoader] 📦 Module loading complete:', this.loadedModules.length + ' loaded, ' + this.failedModules.length + ' failed');

      // ═══ S4: 检查 S4 模块是否加载成功 ═══
      var s4Modules = ['contentLoader', 'contentRegistry', 'contentAdapter', 'subjectRegistry', 'contentValidator'];
      var loadedS4 = s4Modules.filter(function(id) { return this.loadedModules.indexOf(id) !== -1; }.bind(this));
      if (loadedS4.length > 0) {
        console.log('[AcademyLoader] 🧩 S4 modules loaded:', loadedS4.join(', '));
      }
    }

    // ============================================================
    // 5. PRIVATE — Single Module Loader
    // ============================================================

    async _loadSingleModule(module) {
      const exists = this._checkModuleExists(module.id);
      if (exists) {
        console.log('[AcademyLoader] ⏭️ Module already exists:', module.id);
        return { success: true };
      }

      if (!module.path) {
        return { success: false, error: 'No path specified' };
      }

      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;

        let resolved = false;

        const timeout = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.warn('[AcademyLoader] ⏰ Timeout loading:', module.path);
          resolve({ success: false, error: 'Timeout' });
        }, 10000);

        script.onload = function() {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);

          const existsAfter = this._checkModuleExists(module.id);
          if (existsAfter) {
            // ═══ S4: 记录加载的模块 ═══
            if (module.id === 'contentLoader' || module.id === 'contentRegistry' || 
                module.id === 'subjectRegistry' || module.id === 'contentValidator') {
              console.log('[AcademyLoader] ✅ S4 module loaded:', module.id);
            }
            resolve({ success: true });
          } else {
            console.warn('[AcademyLoader] ⚠️ Module loaded but not registered:', module.id);
            resolve({ success: false, error: 'Not registered after load' });
          }
        }.bind(this);

        script.onerror = function() {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          console.warn('[AcademyLoader] ❌ Failed to load:', module.path);
          resolve({ success: false, error: 'Load error' });
        }.bind(this);

        document.head.appendChild(script);
      });
    }

    // ============================================================
    // 6. PRIVATE — Module Existence Check
    // ============================================================

    _checkModuleExists(moduleId) {
      if (this.loadedModules.includes(moduleId)) {
        return true;
      }

      const check = this._moduleChecks[moduleId];
      if (check && typeof check === 'function') {
        return check();
      }

      const propName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
      if (window.LawAIApp && window.LawAIApp[propName]) {
        return true;
      }

      return false;
    }

    // ============================================================
    // 🔥 新增 — 默认 Manifest
    // ============================================================

    _getDefaultManifest() {
      return {
        version: '1.0.0',
        modules: [
          { id: 'schoolRegistry', path: '/js/academy/schoolRegistry.js' },
          { id: 'programRegistry', path: '/js/academy/programRegistry.js' },
          { id: 'courseRegistry', path: '/js/academy/courseRegistry.js' },
          { id: 'curriculumRegistry', path: '/js/academy/curriculumRegistry.js' },
          { id: 'curriculumSeed', path: '/js/academy/curriculumSeed.js' },
          { id: 'academyView', path: '/js/academy/academyView.js' },
          { id: 'academyExperienceManager', path: '/js/academy/academyExperienceManager.js' },
          // ═══ S4 新增模块 ═══
          { id: 'contentLoader', path: '/js/academy/contentLoader.js' },
          { id: 'contentRegistry', path: '/js/academy/contentRegistry.js' },
          { id: 'contentAdapter', path: '/js/academy/contentAdapter.js' },
          { id: 'subjectRegistry', path: '/js/academy/subjectRegistry.js' },
          { id: 'contentValidator', path: '/js/academy/contentValidator.js' },
          { id: 'practiceEngine', path: '/js/academy/practiceEngine.js' },
          { id: 'practiceModule', path: '/js/academy/practice.js' },
          { id: 'practiceProgress', path: '/js/academy/practiceProgress.js' },
          { id: 'knowledgeCapture', path: '/js/academy/knowledgeCapture.js' },
          { id: 'knowledgeEditor', path: '/js/academy/knowledgeEditor.js' },
          { id: 'knowledgeLinker', path: '/js/academy/knowledgeLinker.js' },
          { id: 'knowledgeCard', path: '/js/academy/knowledgeCard.js' },
          { id: 'secondBrain', path: '/js/academy/secondBrain.js' },
          { id: 'notes', path: '/js/academy/notes.js' },
          { id: 'memoryEngine', path: '/js/memoryEngine.js' },
          { id: 'masteryEngine', path: '/js/masteryEngine.js' },
          { id: 'memoryReview', path: '/js/memoryReview.js' },
          { id: 'memoryScheduler', path: '/js/memoryScheduler.js' },
          { id: 'recommendationEngine', path: '/js/recommendationEngine.js' },
          { id: 'learnerModel', path: '/js/learnerModel.js' },
          { id: 'knowledgeGraph', path: '/js/knowledgeGraph.js' },
          { id: 'prerequisiteEngine', path: '/js/prerequisiteEngine.js' },
        { id: 'decisionOptionModel', path: '/js/academy/decisionOptionModel.js' },
        { id: 'decisionAuthority', path: '/js/academy/decisionAuthority.js' },
        { id: 'decisionPrimacy', path: '/js/academy/decisionPrimacy.js' },
        { id: 'optionNormalizer', path: '/js/academy/optionNormalizer.js' },
        { id: 'decisionExperience', path: '/js/academy/decisionExperience.js' },
        { id: 'decisionPanel', path: '/js/debug/panels/decisionPanel.js' }
        ]
      };
    }

    // ============================================================
    // 7. PRIVATE — Event Helpers
    // ============================================================

    _broadcast(event, data) {
      const eventName = 'academy:' + event.toLowerCase();

      try {
        const customEvent = new CustomEvent(eventName, { detail: data || {} });
        document.dispatchEvent(customEvent);
        window.dispatchEvent(customEvent);
      } catch (e) {}

      try {
        if (window.LawAIApp && window.LawAIApp.EventBus) {
          if (typeof window.LawAIApp.EventBus.emit === 'function') {
            window.LawAIApp.EventBus.emit(eventName, data);
          }
        }
      } catch (e) {}

      console.log('[AcademyLoader] 📡 Event:', event, data);
    }

    // ============================================================
    // 8. PRIVATE — Health Check
    // ============================================================

    healthCheck() {
      return {
        status: this.status,
        health: this.health,
        version: this.version,
        loadedModules: this.loadedModules,
        failedModules: this.failedModules
      };
    }

    async recover() {
      console.log('[AcademyLoader] 🔧 Attempting recovery...');

      if (this.status === 'ready') {
        console.log('[AcademyLoader] Already ready, no recovery needed');
        return this.getStatus();
      }

      this.status = 'idle';
      this.health = 'pending';
      this.started = false;
      this.startPromise = null;

      return this.start();
    }
  }

  // ============================================================
  // Export
  // ============================================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  const academyLoader = new AcademyLoader();
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
