// js/academy/academyExperienceManager.js
// Part 57.4-57.6 — Academy Experience Manager (升级)
// Law AI Academy Developer Bible
//
// PURPOSE: Bridge new Academy architecture with existing systems
// INTEGRATES: AcademyAIView, SchoolRegistry, ProgramRegistry, CourseRegistry

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
    console.log('[AcademyExperienceManager] Already exists, skipping...');
    return;
  }

  class AcademyExperienceManager {
    constructor() {
      this.version = '6.1.0';
      this.initialized = false;
      this.mounted = false;
      this.status = 'pending';

      this._state = {
        currentSchoolId: null,
        currentProgramId: null,
        currentCourseId: null,
        viewMode: 'dashboard'
      };

      this._components = {
        view: null,
        schoolExplorer: null,
        programExplorer: null,
        courseExplorer: null,
        continueLearning: null,
        progressView: null
      };
    }

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    /**
     * 初始化 Academy Experience
     */
    init: function() {
      if (this.initialized) {
        console.log('[AcademyExperienceManager] Already initialized');
        return this;
      }

      console.log('[AcademyExperienceManager] 🚀 Initializing...');

      try {
        // 1. 检查 Academy 是否就绪
        if (!this._isAcademyReady()) {
          console.warn('[AcademyExperienceManager] Academy not ready, waiting...');
          this._waitForAcademy();
          return this;
        }

        // 2. 初始化所有层
        this._initLayers();

        // 3. 绑定事件
        this._bindEvents();

        // 4. 挂载 UI
        this.mount();

        this.initialized = true;
        this.status = 'ready';

        this._emit('ACADEMY_EXPERIENCE_READY', {
          version: this.version,
          timestamp: Date.now()
        });

        console.log('[AcademyExperienceManager] ✅ Initialized');

      } catch (error) {
        console.error('[AcademyExperienceManager] Init failed:', error);
        this.status = 'failed';
      }

      return this;
    },

    /**
     * 挂载 Academy UI
     */
    mount: function() {
      if (this.mounted) {
        console.log('[AcademyExperienceManager] Already mounted');
        return this;
      }

      console.log('[AcademyExperienceManager] 📍 Mounting...');

      // 确保容器存在
      var container = document.getElementById('academy-root');
      if (!container) {
        container = this._createContainer();
      }

      // 渲染
      this.render();

      this.mounted = true;
      console.log('[AcademyExperienceManager] ✅ Mounted');

      return this;
    },

    /**
     * 渲染 Academy
     */
    render: function() {
      console.log('[AcademyExperienceManager] 🎨 Rendering...');

      var container = document.getElementById('academy-root');
      if (!container) {
        console.warn('[AcademyExperienceManager] #academy-root not found');
        return this;
      }

      // 获取数据
      var data = this._getRenderData();

      // 使用 AcademyView 渲染
      if (window.LawAIApp?.AcademyView) {
        window.LawAIApp.AcademyView.render(data);
      } else {
        this._renderFallback(container, data);
      }

      return this;
    },

    /**
     * 刷新 Academy
     */
    refresh: function() {
      console.log('[AcademyExperienceManager] 🔄 Refreshing...');
      this.render();
      this._emit('ACADEMY_REFRESH', { timestamp: Date.now() });
      return this;
    },

    /**
     * 导航到 School
     */
    navigateToSchool: function(schoolId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to school:', schoolId);
      this._state.currentSchoolId = schoolId;
      this._state.viewMode = 'school';
      this.render();
      return this;
    },

    /**
     * 导航到 Program
     */
    navigateToProgram: function(programId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);
      this._state.currentProgramId = programId;
      this._state.viewMode = 'program';
      this.render();
      return this;
    },

    /**
     * 导航到 Course
     */
    navigateToCourse: function(courseId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to course:', courseId);
      this._state.currentCourseId = courseId;
      this._state.viewMode = 'course';
      this.render();
      return this;
    },

    /**
     * 继续学习
     */
    continueLearning: function() {
      console.log('[AcademyExperienceManager] 📖 Continuing learning...');

      var progress = this._getProgress();
      if (progress && progress.currentLessonId) {
        this._emit('ACADEMY_CONTINUE', {
          lessonId: progress.currentLessonId,
          moduleId: progress.currentModuleId,
          courseId: progress.currentCourseId
        });
      } else {
        var schools = this._getSchools();
        if (schools && schools.length > 0) {
          this.navigateToSchool(schools[0].id);
        }
      }

      return this;
    },

    /**
     * 获取状态
     */
    getStatus: function() {
      return {
        version: this.version,
        initialized: this.initialized,
        mounted: this.mounted,
        status: this.status,
        state: this._state,
        components: Object.keys(this._components).filter(function(k) {
          return this._components[k] !== null;
        }.bind(this))
      };
    },

    // ============================================================
    // 2. PRIVATE — Layer Initialization
    // ============================================================

    _initLayers: function() {
      console.log('[AcademyExperienceManager] Initializing layers...');

      // School Layer
      var schoolRegistry = window.LawAIApp?.SchoolRegistry;
      if (schoolRegistry && !schoolRegistry.initialized) {
        schoolRegistry.initialize();
      }

      // Program Layer
      var programRegistry = window.LawAIApp?.ProgramRegistry;
      if (programRegistry && !programRegistry._initialized) {
        programRegistry.initialize();
      }

      // Course Layer
      var courseRegistry = window.LawAIApp?.CourseRegistry;
      if (courseRegistry && !courseRegistry._initialized) {
        courseRegistry.initialize();
      }

      // Curriculum Registry
      var curriculumRegistry = window.LawAIApp?.CurriculumRegistry;
      if (curriculumRegistry && typeof curriculumRegistry.init === 'function') {
        curriculumRegistry.init();
      }

      // Academy View
      var academyView = window.LawAIApp?.AcademyView;
      if (academyView && typeof academyView.init === 'function') {
        academyView.init();
      }

      console.log('[AcademyExperienceManager] ✅ Layers initialized');
    },

    // ============================================================
    // 3. PRIVATE — Data Access
    // ============================================================

    _getRenderData: function() {
      var schools = this._getSchools();
      var programs = this._getPrograms();
      var courses = this._getCourses();
      var progress = this._getProgress();

      return {
        schools: schools,
        programs: programs,
        courses: courses,
        progress: progress,
        currentSchoolId: this._state.currentSchoolId,
        currentProgramId: this._state.currentProgramId,
        currentCourseId: this._state.currentCourseId,
        viewMode: this._state.viewMode
      };
    },

    _getSchools: function() {
      var registry = window.LawAIApp?.SchoolRegistry;
      if (registry) {
        if (typeof registry.getAll === 'function') return registry.getAll();
        if (typeof registry.getAllSchools === 'function') return registry.getAllSchools();
        if (typeof registry.getSchools === 'function') return registry.getSchools();
      }
      return [];
    },

    _getPrograms: function() {
      var registry = window.LawAIApp?.ProgramRegistry;
      if (registry) {
        if (typeof registry.getAllPrograms === 'function') return registry.getAllPrograms();
      }
      return [];
    },

    _getCourses: function() {
      var registry = window.LawAIApp?.CourseRegistry;
      if (registry) {
        if (typeof registry.getAllCourses === 'function') return registry.getAllCourses();
      }
      return [];
    },

    _getProgress: function() {
      var stateManager = window.LawAIApp?.LearningStateManager;
      if (stateManager && typeof stateManager.getState === 'function') {
        return stateManager.getState();
      }

      var progressEngine = window.LawAIApp?.ProgressEngine;
      if (progressEngine && typeof progressEngine.getProgress === 'function') {
        return progressEngine.getProgress();
      }

      return null;
    },

    // ============================================================
    // 4. PRIVATE — Academy Readiness
    // ============================================================

    _isAcademyReady: function() {
      var loader = window.LawAIApp?.AcademyLoader;
      if (!loader) return false;

      var status = loader.getStatus ? loader.getStatus() : {};
      return status.status === 'ready' || status.ready === true;
    },

    _waitForAcademy: function() {
      console.log('[AcademyExperienceManager] ⏳ Waiting for Academy...');

      var self = this;
      var attempts = 0;
      var maxAttempts = 30;

      var checkInterval = setInterval(function() {
        attempts++;
        if (self._isAcademyReady()) {
          clearInterval(checkInterval);
          console.log('[AcademyExperienceManager] ✅ Academy ready, initializing...');
          self.init();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('[AcademyExperienceManager] ⚠️ Academy timeout, initializing anyway...');
          self.init();
        }
      }, 200);
    },

    // ============================================================
    // 5. PRIVATE — Container
    // ============================================================

    _createContainer: function() {
      var container = document.createElement('div');
      container.id = 'academy-root';
      container.style.cssText = 'min-height: 100vh; background: #0b1220;';
      document.body.appendChild(container);
      console.log('[AcademyExperienceManager] ✅ Created #academy-root');
      return container;
    },

    // ============================================================
    // 6. PRIVATE — Fallback Render
    // ============================================================

    _renderFallback: function(container, data) {
      var schools = data.schools || [];
      var progress = data.progress || null;

      var html = `
        <div style="padding: 32px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 4px;">🏛️ Law AI Academy</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 24px;">Your AI learning journey starts here</p>
      `;

      if (progress) {
        html += `
          <div style="background: rgba(74,158,255,0.06); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid rgba(74,158,255,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <span style="color: #94a3b8; font-size: 13px;">📖 Continue Learning</span>
                <div style="font-size: 15px; font-weight: 500;">${progress.currentLessonTitle || 'Your Journey'}</div>
                <div style="color: #64748b; font-size: 13px;">${progress.overallProgress || 0}% complete</div>
              </div>
              <button onclick="LawAIApp.AcademyExperienceManager?.continueLearning?.()" 
                      style="padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                Continue →
              </button>
            </div>
          </div>
        `;
      }

      if (schools && schools.length > 0) {
        html += `<h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">🎓 Schools</h2>`;
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">`;

        schools.forEach(function(school) {
          html += `
            <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
                 onclick="LawAIApp.AcademyExperienceManager?.navigateToSchool?.('${school.id}')"
                 onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
                 onmouseout="this.style.background='rgba(255,255,255,0.04)'">
              <div style="font-size: 32px; margin-bottom: 6px;">${school.icon || '🏛️'}</div>
              <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px;">${school.name}</h3>
              <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">${school.description || ''}</p>
              <span style="color: #4a9eff; font-size: 13px;">${school.programs?.length || 0} programs</span>
            </div>
          `;
        });

        html += `</div>`;
      } else {
        html += `
          <div style="text-align: center; padding: 60px 20px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.08);">
            <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
            <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">Welcome to Law AI Academy</h2>
            <p style="color: #94a3b8; font-size: 15px; margin: 0;">Your learning journey starts here</p>
          </div>
        `;
      }

      html += `</div>`;
      container.innerHTML = html;
    },

    // ============================================================
    // 7. PRIVATE — Events
    // ============================================================

    _bindEvents: function() {
      document.addEventListener('ACADEMY_READY', function() {
        console.log('[AcademyExperienceManager] 📡 ACADEMY_READY received');
        if (!this.initialized) {
          this.init();
        } else {
          this.refresh();
        }
      }.bind(this));

      document.addEventListener('SCHOOL_REGISTERED', function() {
        this.refresh();
      }.bind(this));

      document.addEventListener('PROGRAM_REGISTERED', function() {
        this.refresh();
      }.bind(this));

      document.addEventListener('COURSE_REGISTERED', function() {
        this.refresh();
      }.bind(this));

      document.addEventListener('LEARNING_STATE_UPDATED', function() {
        this.refresh();
      }.bind(this));

      console.log('[AcademyExperienceManager] Events bound');
    },

    // ============================================================
    // 8. PRIVATE — Event Helpers
    // ============================================================

    _emit: function(eventName, data) {
      try {
        var event = new CustomEvent(eventName, { detail: data || {} });
        document.dispatchEvent(event);
        window.dispatchEvent(event);

        if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
          window.LawAIApp.EventBus.emit(eventName, data);
        }
      } catch (err) {
        // 忽略
      }
    }
  }

  // ============================================================
  // Export
  // ============================================================

  var manager = new AcademyExperienceManager();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.AcademyExperienceManager = manager;

  console.log('[AcademyExperienceManager] Module loaded (v6.1.0)');

  // 自动初始化
  function autoInit() {
    if (document.getElementById('academy-root')) {
      manager.init();
    } else {
      var observer = new MutationObserver(function() {
        if (document.getElementById('academy-root')) {
          observer.disconnect();
          manager.init();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 200);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 200);
    });
  }

})();
