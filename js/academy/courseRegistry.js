// js/academy/courseRegistry.js
// Part 57.6 — Course Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Register and manage courses
// CONNECTS: Programs → Courses

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.CourseRegistry) {
    console.log('[CourseRegistry] Already exists, skipping...');
    return;
  }

  class CourseRegistry {
    constructor() {
      this.version = '1.0.0';
      this._courses = new Map();
      this._initialized = false;
    }

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    /**
     * 初始化 Course Registry
     */
    initialize() {
      if (this._initialized) {
        console.log('[CourseRegistry] Already initialized');
        return this;
      }

      console.log('[CourseRegistry] 📚 Initializing...');
      this._initialized = true;

      this._emit('COURSE_REGISTRY_READY', {
        count: this._courses.size
      });

      console.log('[CourseRegistry] ✅ Initialized');
      return this;
    }

    /**
     * 注册 Course
     * @param {Object} courseData
     * @returns {string} courseId
     */
    registerCourse(courseData) {
      const validation = this.validate(courseData);
      if (!validation.valid) {
        console.warn('[CourseRegistry] Validation failed:', validation.errors);
        return null;
      }

      if (this._courses.has(courseData.id)) {
        console.warn('[CourseRegistry] Course already exists:', courseData.id);
        return courseData.id;
      }

      // 验证 Program 存在
      const programRegistry = window.LawAIApp?.ProgramRegistry;
      if (programRegistry && courseData.programId) {
        const program = programRegistry.getProgram(courseData.programId);
        if (!program) {
          console.warn('[CourseRegistry] Program not found:', courseData.programId);
        } else {
          if (!program.courses) program.courses = [];
          if (!program.courses.includes(courseData.id)) {
            program.courses.push(courseData.id);
          }
        }
      }

      const course = {
        ...courseData,
        createdAt: courseData.createdAt || new Date().toISOString(),
        status: courseData.status || 'active',
        modules: courseData.modules || []
      };

      this._courses.set(courseData.id, course);

      this._emit('COURSE_REGISTERED', {
        courseId: course.id,
        title: course.title,
        programId: course.programId
      });

      console.log('[CourseRegistry] ✅ Registered:', course.title);
      return course.id;
    }

    /**
     * 获取 Course
     * @param {string} courseId
     * @returns {Object|null}
     */
    getCourse(courseId) {
      return this._courses.get(courseId) || null;
    }

    /**
     * 获取 Program 的所有 Courses
     * @param {string} programId
     * @returns {Array}
     */
    getCoursesByProgram(programId) {
      return this.getAllCourses().filter(function(c) {
        return c.programId === programId;
      });
    }

    /**
     * 获取 School 的所有 Courses
     * @param {string} schoolId
     * @returns {Array}
     */
    getCoursesBySchool(schoolId) {
      return this.getAllCourses().filter(function(c) {
        return c.schoolId === schoolId;
      });
    }

    /**
     * 获取所有 Courses
     * @returns {Array}
     */
    getAllCourses() {
      return Array.from(this._courses.values());
    }

    /**
     * 获取活跃 Courses
     * @returns {Array}
     */
    getActiveCourses() {
      return this.getAllCourses().filter(function(c) {
        return c.status === 'active';
      });
    }

    /**
     * 获取 Course 的完整结构 (含 Modules + Lessons)
     * @param {string} courseId
     * @returns {Object|null}
     */
    getCourseStructure(courseId) {
      const course = this.getCourse(courseId);
      if (!course) return null;

      const moduleRegistry = window.LawAIApp?.ModuleRegistry;
      let modules = [];

      if (moduleRegistry && typeof moduleRegistry.getModulesByCourse === 'function') {
        modules = moduleRegistry.getModulesByCourse(courseId);
      }

      // 为每个 Module 获取 Lessons
      const enrichedModules = modules.map(function(module) {
        let lessons = [];
        const lessonEngine = window.LawAIApp?.LessonEngine;
        if (lessonEngine && typeof lessonEngine.getLessonsByModule === 'function') {
          lessons = lessonEngine.getLessonsByModule(module.id);
        }
        return {
          ...module,
          lessons: lessons,
          lessonCount: lessons.length
        };
      });

      return {
        ...course,
        modules: enrichedModules,
        totalModules: enrichedModules.length,
        totalLessons: enrichedModules.reduce(function(sum, m) {
          return sum + (m.lessons?.length || 0);
        }, 0)
      };
    }

    /**
     * 验证 Course 数据
     * @param {Object} data
     * @returns {Object} { valid, errors }
     */
    validate(data) {
      const errors = [];

      if (!data.id) errors.push('id is required');
      if (!data.title) errors.push('title is required');
      if (!data.programId) errors.push('programId is required');
      if (data.status && !['active', 'inactive', 'draft', 'archived'].includes(data.status)) {
        errors.push('status must be: active, inactive, draft, archived');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    }

    /**
     * 更新 Course
     * @param {string} courseId
     * @param {Object} updates
     * @returns {Object|null}
     */
    update(courseId, updates) {
      const course = this._courses.get(courseId);
      if (!course) {
        console.warn('[CourseRegistry] Course not found:', courseId);
        return null;
      }

      const updated = {
        ...course,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this._courses.set(courseId, updated);
      return updated;
    }

    /**
     * 获取统计
     * @returns {Object}
     */
    getStats() {
      const courses = this.getAllCourses();
      return {
        totalCourses: courses.length,
        activeCourses: this.getActiveCourses().length,
        byStatus: {
          active: courses.filter(function(c) { return c.status === 'active'; }).length,
          draft: courses.filter(function(c) { return c.status === 'draft'; }).length,
          archived: courses.filter(function(c) { return c.status === 'archived'; }).length
        }
      };
    }

    /**
     * 获取状态
     * @returns {Object}
     */
    getStatus() {
      return {
        initialized: this._initialized,
        version: this.version,
        courseCount: this._courses.size
      };
    }

    // ============================================================
    // 2. PRIVATE — Event Helpers
    // ============================================================

    _emit(eventName, data) {
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
  }

  // ============================================================
  // Export
  // ============================================================

  const courseRegistry = new CourseRegistry();

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  window.LawAIApp.CourseRegistry = courseRegistry;

  console.log('[CourseRegistry] Module loaded (Part 57.6)');

  // 自动初始化
  function autoInit() {
    if (!courseRegistry._initialized) {
      courseRegistry.initialize();
    }
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 100);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 100);
    });
  }

})();
