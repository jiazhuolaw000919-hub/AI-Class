// js/academy/curriculumRegistry.js
// Part 57.6 — Curriculum Registry
// Law AI Academy Developer Bible
//
// PURPOSE: Connect School → Program → Course → Module → Lesson
// USES EXISTING: lessonEngine, lessonModel

(function() {
  'use strict';

  if (window.LawAIApp && window.LawAIApp.CurriculumRegistry) {
    console.log('[CurriculumRegistry] Already exists, skipping...');
    return;
  }

  var CurriculumRegistry = {
    version: '1.0.0',
    initialized: false,

    // ============================================================
    // 1. PUBLIC API
    // ============================================================

    init: function() {
      if (this.initialized) {
        console.log('[CurriculumRegistry] Already initialized');
        return this;
      }

      console.log('[CurriculumRegistry] 🔗 Initializing...');

      this._bindEvents();
      this.initialized = true;

      console.log('[CurriculumRegistry] ✅ Ready');
      return this;
    },

    /**
     * 获取完整的 Curriculum 树
     */
    getCurriculumTree: function() {
      var schools = this._getSchools();
      var programs = this._getPrograms();
      var courses = this._getCourses();

      return {
        schools: schools.map(function(school) {
          var schoolPrograms = programs.filter(function(p) {
            return p.schoolId === school.id;
          });

          var enrichedPrograms = schoolPrograms.map(function(program) {
            var programCourses = courses.filter(function(c) {
              return c.programId === program.id;
            });
            return {
              ...program,
              courses: programCourses,
              courseCount: programCourses.length
            };
          });

          return {
            ...school,
            programs: enrichedPrograms,
            programCount: enrichedPrograms.length,
            totalCourses: enrichedPrograms.reduce(function(sum, p) {
              return sum + p.courseCount;
            }, 0)
          };
        })
      };
    },

    /**
     * 获取 Curriculum 摘要
     */
    getSummary: function() {
      var schools = this._getSchools();
      var programs = this._getPrograms();
      var courses = this._getCourses();

      return {
        totalSchools: schools.length,
        totalPrograms: programs.length,
        totalCourses: courses.length,
        schools: schools.map(function(s) {
          var schoolPrograms = programs.filter(function(p) {
            return p.schoolId === s.id;
          });
          var schoolCourses = courses.filter(function(c) {
            return c.schoolId === s.id;
          });
          return {
            id: s.id,
            name: s.name,
            programCount: schoolPrograms.length,
            courseCount: schoolCourses.length
          };
        })
      };
    },

    /**
     * 获取 School 的完整内容
     */
    getSchoolCurriculum: function(schoolId) {
      var tree = this.getCurriculumTree();
      var school = tree.schools.find(function(s) {
        return s.id === schoolId;
      });
      return school || null;
    },

    /**
     * 获取 Program 的完整内容
     */
    getProgramCurriculum: function(programId) {
      var programs = this._getPrograms();
      var program = programs.find(function(p) {
        return p.id === programId;
      });
      if (!program) return null;

      var courses = this._getCourses().filter(function(c) {
        return c.programId === programId;
      });

      return {
        ...program,
        courses: courses
      };
    },

    /**
     * 获取 Course 的完整内容 (含 Modules + Lessons)
     */
    getCourseStructure: function(courseId) {
      var courseRegistry = window.LawAIApp?.CourseRegistry;
      if (courseRegistry && typeof courseRegistry.getCourseStructure === 'function') {
        return courseRegistry.getCourseStructure(courseId);
      }

      var courses = this._getCourses();
      var course = courses.find(function(c) {
        return c.id === courseId;
      });
      return course || null;
    },

    // ============================================================
    // 2. PRIVATE — Data Access
    // ============================================================

    _getSchools: function() {
      var registry = window.LawAIApp?.SchoolRegistry;
      if (registry) {
        if (typeof registry.getAll === 'function') return registry.getAll();
        if (typeof registry.getAllSchools === 'function') return registry.getAllSchools();
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

    // ============================================================
    // 3. PRIVATE — Events
    // ============================================================

    _bindEvents: function() {
      document.addEventListener('SCHOOL_REGISTERED', function() {
        this._emit('CURRICULUM_READY', { type: 'school_registered' });
      }.bind(this));

      document.addEventListener('PROGRAM_REGISTERED', function() {
        this._emit('CURRICULUM_READY', { type: 'program_registered' });
      }.bind(this));

      document.addEventListener('COURSE_REGISTERED', function() {
        this._emit('CURRICULUM_READY', { type: 'course_registered' });
      }.bind(this));

      console.log('[CurriculumRegistry] Events bound');
    },

    // ============================================================
    // 4. PRIVATE — Event Helpers
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

  window.LawAIApp.CurriculumRegistry = CurriculumRegistry;

  console.log('[CurriculumRegistry] Module loaded (Part 57.6)');

  // 自动初始化
  function autoInit() {
    CurriculumRegistry.init();
  }

  if (document.readyState === 'complete') {
    setTimeout(autoInit, 300);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(autoInit, 300);
    });
  }

})();
