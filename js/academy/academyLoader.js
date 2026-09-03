// js/academy/academyLoader.js
// Part 57.4-57.6 REBUILD — AcademyLoader Architecture Reset
// Law AI Academy Developer Bible
// v2.1.0 — 添加 Calendar/Settings 懒加载支持

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyLoader) {
    console.warn('[AcademyLoader] Already exists, skipping...');
    return;
  }

  class AcademyLoader {
    constructor() {
      this.version = '2.1.0';
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

      this._lazyLoaded = {
        calendar: false,
        settings: false
      };
      this._lazyLoading = {
        calendar: false,
        settings: false
      };

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
    // 🔥 懒加载 API
    // ============================================================

    loadCalendarLazy(onReady, onFail) {
      var moduleName = 'calendar';
      if (this._lazyLoaded[moduleName]) {
        console.log('[AcademyLoader] ⏭️ Calendar already lazy-loaded');
        if (onReady) onReady(window.LawAIApp?.Calendar);
        return;
      }
      if (this._lazyLoading[moduleName]) {
        console.log('[AcademyLoader] ⏳ Calendar already loading...');
        return;
      }
      this._lazyLoading[moduleName] = true;
      console.log('[AcademyLoader] 🔄 Lazy loading Calendar...');

      var files = [
        '/js/calendarEngine.js',
        '/js/calendarPlanner.js',
        '/js/calendarTimeline.js',
        '/js/calendarEngineAdapter.js',
        '/js/calendar/CalendarSurfaceAdapter.js',
        '/js/calendar/CalendarViewModel.js',
        '/js/calendar/CalendarEventAdapter.js',
        '/js/calendar/CalendarRenderer.js',
        '/js/calendar.js'
      ];

      this._loadScriptsSequentially(files, function(success) {
        this._lazyLoading[moduleName] = false;
        if (success && window.LawAIApp?.Calendar) {
          this._lazyLoaded[moduleName] = true;
          console.log('[AcademyLoader] ✅ Calendar lazy-loaded');
          if (onReady) onReady(window.LawAIApp.Calendar);
        } else {
          console.warn('[AcademyLoader] ⚠️ Calendar lazy-load incomplete');
          if (onFail) onFail('Calendar load incomplete');
        }
      }.bind(this));
    }

    loadSettingsLazy(onReady, onFail) {
      var moduleName = 'settings';
      if (this._lazyLoaded[moduleName]) {
        console.log('[AcademyLoader] ⏭️ Settings already lazy-loaded');
        if (onReady) onReady(window.LawAIApp?.Settings);
        return;
      }
      if (this._lazyLoading[moduleName]) {
        console.log('[AcademyLoader] ⏳ Settings already loading...');
        return;
      }
      this._lazyLoading[moduleName] = true;
      console.log('[AcademyLoader] 🔄 Lazy loading Settings...');

      var files = ['/js/settings.js'];

      this._loadScriptsSequentially(files, function(success) {
        this._lazyLoading[moduleName] = false;
        if (success && window.LawAIApp?.Settings) {
          this._lazyLoaded[moduleName] = true;
          console.log('[AcademyLoader] ✅ Settings lazy-loaded');
          if (onReady) onReady(window.LawAIApp.Settings);
        } else {
          console.warn('[AcademyLoader] ⚠️ Settings lazy-load incomplete');
          if (onFail) onFail('Settings load incomplete');
        }
      }.bind(this));
    }

    isLazyLoaded(moduleName) {
      return !!this._lazyLoaded[moduleName];
    }

    // ============================================================
    // 🔥 内部：顺序加载脚本
    // ============================================================

    _loadScriptsSequentially(files, callback) {
      var loaded = 0;
      var failed = [];
      files.forEach(function(file) {
        var script = document.createElement('script');
        script.src = file + '?v=' + Date.now();
        script.async = true;
        script.onload = function() {
          loaded++;
          console.log('[AcademyLoader] ✅ Loaded:', file);
          checkComplete();
        };
        script.onerror = function() {
          loaded++;
          failed.push(file);
          console.warn('[AcademyLoader] ❌ Failed:', file);
          checkComplete();
        };
        document.head.appendChild(script);
      });
      function checkComplete() {
        if (loaded < files.length) return;
        var success = failed.length === 0;
        if (success) {
          console.log('[AcademyLoader] ✅ All files loaded');
        } else {
          console.warn('[AcademyLoader] ⚠️ Some files failed:', failed);
        }
        callback(success);
      }
    }

    // ============================================================
    // PRIVATE — 启动逻辑
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
        this._broadcast('ACADEMY_READY', { status: this.status, version: this.version, loaded: this.loadedModules, failed: this.failedModules, duration: this.endTime - this.startTime });
        console.log('[AcademyLoader] ✅ Academy ready in', this.endTime - this.startTime, 'ms');
        console.log('[AcademyLoader] 📦 Loaded:', this.loadedModules.length, 'modules');
        return this.getStatus();
      } catch (error) {
        this.status = 'failed';
        this.health = 'unhealthy';
        console.error('[AcademyLoader] ❌ Startup failed:', error);
        this._broadcast('ACADEMY_FAILED', { error: error.message, loaded: this.loadedModules, failed: this.failedModules });
        throw error;
      }
    }

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

    async _loadModules() {
      const modules = this._manifest?.modules || [];
      if (modules.length === 0) {
        console.warn('[AcademyLoader] No modules to load');
        return;
      }
      console.log('[AcademyLoader] 📦 Loading', modules.length, 'modules...');
      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        if (!module || !module.id) {
          console.warn('[AcademyLoader] ⚠️ Invalid module definition at index', i);
          continue;
        }
        const result = await this._loadSingleModule(module);
        if (result.success) {
          this.loadedModules.push(module.id);
          console.log('[AcademyLoader] ✅ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' loaded');
        } else {
          this.failedModules.push(module.id);
          console.warn('[AcademyLoader] ⚠️ [' + (i + 1) + '/' + modules.length + '] ' + module.id + ' failed: ' + result.error);
        }
      }
      this._broadcast('ACADEMY_MODULES_READY', { loaded: this.loadedModules, failed: this.failedModules, total: modules.length });
      console.log('[AcademyLoader] 📦 Module loading complete:', this.loadedModules.length + ' loaded, ' + this.failedModules.length + ' failed');
    }

    async _loadSingleModule(module) {
      if (!module || !module.id) return { success: false, error: 'Invalid module: missing id' };
      const exists = this._checkModuleExists(module.id);
      if (exists) {
        console.log('[AcademyLoader] ⏭️ Module already exists:', module.id);
        return { success: true };
      }
      if (!module.path) return { success: false, error: 'No path specified' };
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = module.path;
        script.async = false;
        let resolved = false;
        const timeout = setTimeout(() => { if (resolved) return; resolved = true; resolve({ success: false, error: 'Timeout' }); }, 10000);
        script.onload = function() {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          const existsAfter = this._checkModuleExists(module.id);
          if (existsAfter) resolve({ success: true });
          else resolve({ success: false, error: 'Not registered after load' });
        }.bind(this);
        script.onerror = function() { if (resolved) return; resolved = true; clearTimeout(timeout); resolve({ success: false, error: 'Load error' }); }.bind(this);
        document.head.appendChild(script);
      });
    }

    _checkModuleExists(moduleId) {
      if (!moduleId || typeof moduleId !== 'string') return false;
      if (this.loadedModules.includes(moduleId)) return true;
      const check = this._moduleChecks[moduleId];
      if (check && typeof check === 'function') return check();
      const propName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
      if (window.LawAIApp && window.LawAIApp[propName]) return true;
      return false;
    }

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
          { id: 'decisionOptionModel', path: '/js/academy/decisionOptionModel.js' },
          { id: 'decisionAuthority', path: '/js/academy/decisionAuthority.js' },
          { id: 'decisionPrimacy', path: '/js/academy/decisionPrimacy.js' },
          { id: 'optionNormalizer', path: '/js/academy/optionNormalizer.js' },
          { id: 'decisionExperience', path: '/js/academy/decisionExperience.js' },
          { id: 'decisionPanel', path: '/js/debug/panels/decisionPanel.js' },
          { id: 'actionTracker', path: '/js/academy/actionTracker.js' },
          { id: 'outcomeNormalizer', path: '/js/academy/outcomeNormalizer.js' },
          { id: 'outcomeLinker', path: '/js/academy/outcomeLinker.js' },
          { id: 'adaptationSignal', path: '/js/academy/adaptationSignal.js' },
          { id: 'outcomePanel', path: '/js/debug/panels/outcomePanel.js' },
          { id: 'adaptationRecord', path: '/js/academy/adaptationRecord.js' },
          { id: 'adaptationExplainer', path: '/js/academy/adaptationExplainer.js' },
          { id: 'adaptationGovernance', path: '/js/academy/adaptationGovernance.js' },
          { id: 'adaptationPanel', path: '/js/debug/panels/adaptationPanel.js' },
          { id: 'learningLoopValidator', path: '/js/academy/learningLoopValidator.js' },
          { id: 'learnerControl', path: '/js/academy/learnerControl.js' },
          { id: 'metacognitiveExperience', path: '/js/academy/metacognitiveExperience.js' },
          { id: 'metacognitivePanel', path: '/js/debug/panels/metacognitivePanel.js' },
          { id: 'learningPatternModel', path: '/js/academy/learningPatternModel.js' },
          { id: 'patternDetector', path: '/js/academy/patternDetector.js' },
          { id: 'patternExplainer', path: '/js/academy/patternExplainer.js' },
          { id: 'patternPanel', path: '/js/debug/panels/patternPanel.js' },
          { id: 'epistemicStatus', path: '/js/academy/epistemicStatus.js' },
          { id: 'sourceDistinguisher', path: '/js/academy/sourceDistinguisher.js' },
          { id: 'aiLiteracyHelper', path: '/js/academy/aiLiteracyHelper.js' },
          { id: 'epistemicPanel', path: '/js/debug/panels/epistemicPanel.js' },
          { id: 'transferModel', path: '/js/academy/transferModel.js' },
          { id: 'transferObserver', path: '/js/academy/transferObserver.js' },
          { id: 'transferRecommender', path: '/js/academy/transferRecommender.js' },
          { id: 'transferPanel', path: '/js/debug/panels/transferPanel.js' },
          { id: 'calibrationModel', path: '/js/academy/calibrationModel.js' },
          { id: 'calibrationObserver', path: '/js/academy/calibrationObserver.js' },
          { id: 'calibrationRecommender', path: '/js/academy/calibrationRecommender.js' },
          { id: 'calibrationPanel', path: '/js/debug/panels/calibrationPanel.js' },
          { id: 'journeyOrchestrator', path: '/js/academy/journeyOrchestrator.js' },
          { id: 'journeyPanel', path: '/js/debug/panels/journeyPanel.js' },
          { id: 'agencySupport', path: '/js/academy/agencySupport.js' },
          { id: 'agencyPanel', path: '/js/debug/panels/agencyPanel.js' },
          { id: 'experienceContract', path: '/js/academy/experienceContract.js' },
          { id: 'surfaceIntegration', path: '/js/academy/surfaceIntegration.js' }
        ]
      };
    }

    _broadcast(event, data) {
      const eventName = 'academy:' + event.toLowerCase();
      try { const e = new CustomEvent(eventName, { detail: data || {} }); document.dispatchEvent(e); window.dispatchEvent(e); } catch (err) {}
      try { if (window.LawAIApp?.EventBus?.emit) window.LawAIApp.EventBus.emit(eventName, data); } catch (err) {}
      console.log('[AcademyLoader] 📡 Event:', event);
    }

    healthCheck() {
      return {
        status: this.status,
        health: this.health,
        version: this.version,
        loadedModules: this.loadedModules,
        failedModules: this.failedModules,
        lazyLoaded: this._lazyLoaded,
        lazyLoading: this._lazyLoading
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
  if (!window.LawAIApp) window.LawAIApp = {};
  const academyLoader = new AcademyLoader();
  window.LawAIApp.AcademyLoader = academyLoader;
  if (!window.LawAIApp.Academy) window.LawAIApp.Academy = {};
  if (typeof window.LawAIApp.Academy.status === 'undefined') {
    Object.defineProperty(window.LawAIApp.Academy, 'status', { value: 'pending', writable: true, enumerable: true, configurable: true });
  }
  console.log('[AcademyLoader] ✅ Module loaded (v' + academyLoader.version + ')');

  // ============================================================
  // Auto-start
  // ============================================================
  function autoStartAcademy() {
    if (academyLoader.status === 'ready' || academyLoader.status === 'loading') return;
    console.log('[AcademyLoader] 🔥 Auto-starting...');
    academyLoader.start().catch(function(e) { console.warn('[AcademyLoader] Auto-start failed:', e); });
  }
  var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };
  scheduleFn(function() { autoStartAcademy(); });
  document.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });
  window.addEventListener('RUNTIME_READY', function() { autoStartAcademy(); });

})();
