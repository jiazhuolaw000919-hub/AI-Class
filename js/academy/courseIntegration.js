// js/academy/courseIntegration.js
// Part 57.6 — Course Integration (Academy UI)
// Law AI Academy Developer Bible
//
// PURPOSE: Connect CourseRegistry → Academy UI
// UPDATES: ProgramExplorer to display courses

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.CourseIntegration) {
    console.log('[CourseIntegration] Already exists, skipping...');
    return;
  }

  const CourseIntegration = {
    version: '1.0.0',
    initialized: false,

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    init: function() {
      if (this.initialized) {
        console.log('[CourseIntegration] Already initialized');
        return this;
      }

      console.log('[CourseIntegration] 🔗 Initializing...');

      this._bindEvents();
      this.initialized = true;

      console.log('[CourseIntegration] ✅ Ready');
      return this;
    },

    /**
     * 获取 Program 的 Courses (供 UI 使用)
     * @param {string} programId
     * @returns {Array}
     */
    getProgramCourses: function(programId) {
      const courseRegistry = window.LawAIApp?.CourseRegistry;
      if (!courseRegistry) {
        console.warn('[CourseIntegration] CourseRegistry not available');
        return [];
      }

      return courseRegistry.getCoursesByProgram(programId);
    },

    /**
     * 获取 Course 的完整结构 (供 UI 使用)
     * @param {string} courseId
     * @returns {Object|null}
     */
    getCourseStructure: function(courseId) {
      const pipeline = window.LawAIApp?.ContentPipeline;
      if (pipeline && typeof pipeline.loadCourse === 'function') {
        return pipeline.loadCourse(courseId);
      }

      const courseRegistry = window.LawAIApp?.CourseRegistry;
      if (courseRegistry && typeof courseRegistry.getCourseStructure === 'function') {
        return courseRegistry.getCourseStructure(courseId);
      }

      return null;
    },

    /**
     * 渲染 Course 列表
     * @param {string} programId
     * @param {string} containerId
     */
    renderCourses: function(programId, containerId) {
      const container = document.getElementById(containerId || 'academy-root');
      if (!container) {
        console.warn('[CourseIntegration] Container not found');
        return;
      }

      const courses = this.getProgramCourses(programId);

      if (!courses || courses.length === 0) {
        container.innerHTML += this._renderEmptyState();
        return;
      }

      container.innerHTML += this._renderCourseList(courses);
    },

    // ============================================================
    // 2. PRIVATE — Rendering
    // ============================================================

    _renderCourseList: function(courses) {
      let html = `
        <div style="margin-top: 20px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #e2e8f0;">📚 Courses</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
      `;

      courses.forEach(function(course) {
        const statusColor = course.status === 'active' ? '#10b981' : course.status === 'draft' ? '#f59e0b' : '#64748b';
        const statusLabel = course.status === 'active' ? '✅ Active' : course.status === 'draft' ? '📝 Draft' : '📦 Archived';

        html += `
          <div style="background: rgba(255,255,255,0.04); border-radius: 10px; padding: 14px 18px; border: 1px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s;"
               onclick="LawAIApp.CourseIntegration?.navigateToCourse?.('${course.id}')"
               onmouseover="this.style.background='rgba(255,255,255,0.08)'" 
               onmouseout="this.style.background='rgba(255,255,255,0.04)'">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <div>
                <div style="font-weight: 500; font-size: 15px;">${course.title}</div>
                <div style="color: #94a3b8; font-size: 13px;">${course.description || ''}</div>
              </div>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span style="color: #64748b; font-size: 12px;">${course.modules?.length || 0} modules</span>
                <span style="color: ${statusColor}; font-size: 12px; background: rgba(255,255,255,0.06); padding: 2px 10px; border-radius: 12px;">${statusLabel}</span>
                <span style="font-size: 14px;">→</span>
              </div>
            </div>
          </div>
        `;
      });

      html += `</div></div>`;
      return html;
    },

    _renderEmptyState: function() {
      return `
        <div style="margin-top: 16px; padding: 20px; text-align: center; color: #64748b; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px dashed rgba(255,255,255,0.06);">
          <p>📚 No courses available yet</p>
          <p style="font-size: 13px;">Courses will appear here soon</p>
        </div>
      `;
    },

    // ============================================================
    // 3. PRIVATE — Navigation
    // ============================================================

    navigateToCourse: function(courseId) {
      console.log('[CourseIntegration] 📍 Navigating to course:', courseId);

      const course = this.getCourseStructure(courseId);
      if (!course) {
        console.warn('[CourseIntegration] Course not found:', courseId);
        return;
      }

      // 如果课程未就绪，显示 Empty State
      if (course.status === 'draft' || !course.modules || course.modules.length === 0) {
        this._showCourseEmptyState(courseId);
        return;
      }

      // 触发 Course 加载事件
      this._emit('COURSE_LOADED', {
        courseId: courseId,
        title: course.title,
        modules: course.modules
      });

      // 通知 ExperienceManager 切换视图
      if (window.LawAIApp?.AcademyExperienceManager) {
        window.LawAIApp.AcademyExperienceManager.navigateToCourse(courseId);
      }
    },

    _showCourseEmptyState: function(courseId) {
      const container = document.getElementById('academy-root');
      if (!container) return;

      const course = window.LawAIApp?.CourseRegistry?.getCourse(courseId);

      container.innerHTML = `
        <div style="padding: 40px 24px; color: #e2e8f0; font-family: 'Inter', -apple-system, sans-serif; max-width: 800px; margin: 0 auto; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
          <h2 style="font-size: 22px; font-weight: 600; margin: 0 0 8px;">${course?.title || 'Course'}</h2>
          <p style="color: #94a3b8; font-size: 15px; margin: 0 0 20px;">${course?.description || 'This course is being prepared'}</p>
          <div style="background: rgba(255,255,255,0.04); border-radius: 12px; padding: 30px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 14px;">🚧 Course content is being prepared</p>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Check back soon for lessons</p>
          </div>
          <button onclick="LawAIApp.AcademyExperienceManager?.render()" 
                  style="margin-top: 20px; padding: 8px 20px; background: #4a9eff; border: none; border-radius: 8px; color: white; cursor: pointer;">
            ← Back
          </button>
        </div>
      `;
    },

    // ============================================================
    // 4. PRIVATE — Events
    // ============================================================

    _bindEvents: function() {
      document.addEventListener('COURSE_REGISTERED', function() {
        console.log('[CourseIntegration] Course registered, refreshing...');
        this._emit('CURRICULUM_UPDATED', { type: 'course_registered' });
      }.bind(this));

      document.addEventListener('ACADEMY_REFRESH', function() {
        console.log('[CourseIntegration] Academy refresh, updating...');
      }.bind(this));

      console.log('[CourseIntegration] Events bound');
    },

    // ============================================================
    // 5. PRIVATE — Event Helpers
    // ============================================================

    _emit: function(eventName, data) {
      try {
        const event = new CustomEvent(eventName, { detail: data || {} });
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

  window.LawAIApp.CourseIntegration = CourseIntegration;

  console.log('[CourseIntegration] Module loaded (Part 57.6)');

  // 自动初始化
  function autoInit() {
    CourseIntegration.init();
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 100);
    });
  }

})();
