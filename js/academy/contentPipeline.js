// js/academy/contentPipeline.js
// Part 57.6 — Content Pipeline
// Law AI Academy Developer Bible
//
// PURPOSE: Content loading pipeline
// FLOW: CourseRegistry → ModuleRegistry → LessonEngine → Learning Experience

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.ContentPipeline) {
    console.log('[ContentPipeline] Already exists, skipping...');
    return;
  }

  const ContentPipeline = {
    version: '1.0.0',
    initialized: false,

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    /**
     * 初始化 Content Pipeline
     */
    init: function() {
      if (this.initialized) {
        console.log('[ContentPipeline] Already initialized');
        return this;
      }

      console.log('[ContentPipeline] 🔄 Initializing...');

      this._bindEvents();
      this.initialized = true;

      console.log('[ContentPipeline] ✅ Ready');
      return this;
    },

    /**
     * 加载 Course 内容
     * @param {string} courseId
     * @returns {Object|null}
     */
    loadCourse: function(courseId) {
      const courseRegistry = window.LawAIApp?.CourseRegistry;
      if (!courseRegistry) {
        console.warn('[ContentPipeline] CourseRegistry not available');
        return null;
      }

      const course = courseRegistry.getCourseStructure(courseId);
      if (!course) {
        console.warn('[ContentPipeline] Course not found:', courseId);
        return null;
      }

      console.log('[ContentPipeline] 📖 Loaded course:', course.title);
      this._emit('COURSE_LOADED', {
        courseId: courseId,
        title: course.title,
        modules: course.modules?.length || 0,
        lessons: course.totalLessons || 0
      });

      return course;
    },

    /**
     * 加载 Program 的所有 Courses
     * @param {string} programId
     * @returns {Array}
     */
    loadProgramCourses: function(programId) {
      const courseRegistry = window.LawAIApp?.CourseRegistry;
      if (!courseRegistry) {
        console.warn('[ContentPipeline] CourseRegistry not available');
        return [];
      }

      const courses = courseRegistry.getCoursesByProgram(programId);
      const enrichedCourses = courses.map(function(course) {
        return courseRegistry.getCourseStructure(course.id);
      });

      console.log('[ContentPipeline] 📚 Loaded', enrichedCourses.length, 'courses for program:', programId);
      return enrichedCourses;
    },

    /**
     * 检查 Course 是否就绪
     * @param {string} courseId
     * @returns {boolean}
     */
    isCourseReady: function(courseId) {
      const course = this.loadCourse(courseId);
      if (!course) return false;

      return course.status === 'active' && course.modules && course.modules.length > 0;
    },

    /**
     * 获取课程的 Empty State
     * @param {string} courseId
     * @returns {Object}
     */
    getCourseState: function(courseId) {
      const course = this.loadCourse(courseId);

      if (!course) {
        return {
          status: 'not_found',
          message: 'Course not found'
        };
      }

      if (course.status === 'draft') {
        return {
          status: 'draft',
          message: 'This course is being prepared',
          title: course.title
        };
      }

      if (!course.modules || course.modules.length === 0) {
        return {
          status: 'empty',
          message: 'No modules available yet',
          title: course.title,
          description: course.description
        };
      }

      return {
        status: 'ready',
        message: 'Course ready',
        title: course.title,
        modules: course.modules,
        totalLessons: course.totalLessons
      };
    },

    // ============================================================
    // 2. PRIVATE — Events
    // ============================================================

    _bindEvents: function() {
      document.addEventListener('COURSE_REGISTERED', function() {
        console.log('[ContentPipeline] Course registered, refreshing...');
      });

      document.addEventListener('PROGRAM_LOADED', function() {
        console.log('[ContentPipeline] Program loaded, refreshing...');
      });

      console.log('[ContentPipeline] Events bound');
    },

    // ============================================================
    // 3. PRIVATE — Event Helpers
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

  window.LawAIApp.ContentPipeline = ContentPipeline;

  console.log('[ContentPipeline] Module loaded (Part 57.6)');

  // 自动初始化
  function autoInit() {
    ContentPipeline.init();
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 100);
    });
  }

})();
