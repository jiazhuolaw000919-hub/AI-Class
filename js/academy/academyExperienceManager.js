// js/academy/academyExperienceManager.js
// Part 57.4-57.6 — Academy Experience Manager (修复版)
// Law AI Academy Developer Bible

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.AcademyExperienceManager) {
    console.log('[AcademyExperienceManager] Already exists, skipping...');
    return;
  }

  var AcademyExperienceManager = {
    version: '6.1.0',
    initialized: false,
    mounted: false,
    status: 'pending',

    _state: {
      currentSchoolId: null,
      currentProgramId: null,
      currentCourseId: null,
      viewMode: 'dashboard'
    },

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    init: function() {
      if (this.initialized) {
        console.log('[AcademyExperienceManager] Already initialized');
        return this;
      }

      console.log('[AcademyExperienceManager] 🚀 Initializing...');

      try {
        this._initLayers();
        this._bindEvents();
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

    mount: function() {
      if (this.mounted) {
        console.log('[AcademyExperienceManager] Already mounted');
        return this;
      }

      console.log('[AcademyExperienceManager] 📍 Mounting...');

      var container = document.getElementById('academy-root');
      if (!container) {
        container = this._createContainer();
      }

      this.render();
      this.mounted = true;

      console.log('[AcademyExperienceManager] ✅ Mounted');
      return this;
    },

    render: function() {
      console.log('[AcademyExperienceManager] 🎨 Rendering...');

      var container = document.getElementById('academy-root');
      if (!container) {
        console.warn('[AcademyExperienceManager] #academy-root not found');
        return this;
      }

      var data = this._getRenderData();

      if (window.LawAIApp?.AcademyView) {
        window.LawAIApp.AcademyView.render(data);
      } else {
        this._renderFallback(container, data);
      }

      return this;
    },

    refresh: function() {
      console.log('[AcademyExperienceManager] 🔄 Refreshing...');
      this.render();
      this._emit('ACADEMY_REFRESH', { timestamp: Date.now() });
      return this;
    },

    navigateToSchool: function(schoolId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to school:', schoolId);
      this._state.currentSchoolId = schoolId;
      this._state.viewMode = 'school';
      this.render();
      return this;
    },

    navigateToProgram: function(programId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to program:', programId);
      this._state.currentProgramId = programId;
      this._state.viewMode = 'program';
      this.render();
      return this;
    },

    navigateToCourse: function(courseId) {
      console.log('[AcademyExperienceManager] 📍 Navigating to course:', courseId);
      this._state.currentCourseId = courseId;
      this._state.viewMode = 'course';
      this.render();
      return this;
    },

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

    getStatus: function() {
      return {
        version: this.version,
        initialized: this.initialized,
        mounted: this.mounted,
        status: this.status,
        state: this._state
      };
    },

    // ============================================================
    // 2. PRIVATE — Layer Initialization
    // ============================================================

    _initLayers: function() {
      console.log('[AcademyExperienceManager] Initializing layers...');

      var schoolRegistry = window.LawAIApp?.SchoolRegistry;
      if (schoolRegistry && !schoolRegistry.initialized) {
        schoolRegistry.initialize();
      }

      var programRegistry = window.LawAIApp?.ProgramRegistry;
      if (programRegistry && !programRegistry._initialized) {
        programRegistry.initialize();
      }

      var courseRegistry = window.LawAIApp?.CourseRegistry;
      if (courseRegistry && !courseRegistry._initialized) {
        courseRegistry.initialize();
      }

      var curriculumRegistry = window.LawAIApp?.CurriculumRegistry;
      if (curriculumRegistry && typeof curriculumRegistry.init === 'function') {
        curriculumRegistry.init();
      }

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
      return {
        schools: this._getSchools(),
        programs: this._getPrograms(),
        courses: this._getCourses(),
        progress: this._getProgress(),
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
    // 4. PRIVATE — Container
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
    // 5. PRIVATE — Fallback Render
    // ============================================================

   _renderFallback: function(container, data) {
      var schools = data.schools || [];
      var progress = data.progress || null;

      var html = `
        <!-- ========================================================== -->
        <!-- 返回栏 (Back Bar)                                          -->
        <!-- ========================================================== -->
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          margin: 12px 16px 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        ">
          <button onclick="window.history.back()" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            background: rgba(74,158,255,0.1);
            color: #4a9eff;
            border: 1px solid rgba(74,158,255,0.15);
            font-family: inherit;
          " onmouseover="this.style.background='rgba(74,158,255,0.2)'" onmouseout="this.style.background='rgba(74,158,255,0.1)'">
            <span style="font-size:16px;">←</span> Back
          </button>
          <span style="color: #475569; font-size: 14px;">|</span>
          <a href="/" style="
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            background: rgba(255,255,255,0.04);
            color: #94a3b8;
            border: 1px solid rgba(255,255,255,0.06);
            text-decoration: none;
            font-family: inherit;
          " onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.color='#94a3b8'">
            <span style="font-size:14px;">🏠</span> Dashboard
          </a>
          <span style="color: #64748b; font-size: 13px; margin-left: auto;">🏛️ Academy</span>
        </div>

        <!-- ========================================================== -->
        <!-- 主要内容                                                  -->
        <!-- ========================================================== -->
        <div style="padding: 0 16px 32px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 1200px; margin: 0 auto;">
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
                      style="padding: 10px 24px; background: #4a9eff; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer; font-family: inherit;">
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
    }

    // ============================================================
    // 6. PRIVATE — Events
    // ============================================================

    _bindEvents: function() {
        console.log('[AcademyExperienceManager] Binding events...');

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

        console.log('[AcademyExperienceManager] ✅ Events bound');
    },

    // ============================================================
    // 7. PRIVATE — Event Helpers
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
  };

  // ============================================================
  // Export
  // ============================================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.AcademyExperienceManager = AcademyExperienceManager;

  console.log('[AcademyExperienceManager] Module loaded (v6.1.0)');

  // 自动初始化
  function autoInit() {
    if (document.getElementById('academy-root')) {
      AcademyExperienceManager.init();
    } else {
      var observer = new MutationObserver(function() {
        if (document.getElementById('academy-root')) {
          observer.disconnect();
          AcademyExperienceManager.init();
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
