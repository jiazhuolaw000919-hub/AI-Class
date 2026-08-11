// js/academy/academyManifest.js
// Part 57.4-57.6 — Academy Manifest (升级)
// Law AI Academy Developer Bible
//
// PURPOSE: Define Academy module loading order for Season 3
// LOADING ORDER: Registry → Curriculum → Experience

(function() {
  'use strict';

  /**
   * AcademyManifest
   * 
   * 定义 Academy 模块加载顺序
   * 
   * 加载顺序 MUST BE:
   * 1. Registry Layer (schoolRegistry, programRegistry, courseRegistry)
   * 2. Curriculum Layer (curriculumRegistry, curriculumSeed)
   * 3. Experience Layer (academyView, academyExperienceManager)
   */
  const ACADEMY_MANIFEST = {
    version: '2.0.0',
    name: 'Academy Experience Layer',
    description: 'Law AI Academy — Season 3 Architecture',

    // ============================================================
    // 模块加载顺序 (按顺序加载)
    // ============================================================
    modules: [
      // ==========================================================
      // 1. Registry Layer
      // ==========================================================
      {
        id: 'schoolRegistry',
        path: '/js/academy/schoolRegistry.js',
        description: 'School Registry',
        required: true
      },
      {
        id: 'programRegistry',
        path: '/js/academy/programRegistry.js',
        description: 'Program Registry',
        required: true
      },
      {
        id: 'courseRegistry',
        path: '/js/academy/courseRegistry.js',
        description: 'Course Registry',
        required: true
      },

      // ==========================================================
      // 2. Curriculum Layer
      // ==========================================================
      {
        id: 'curriculumRegistry',
        path: '/js/academy/curriculumRegistry.js',
        description: 'Curriculum Registry (Connector)',
        required: true
      },
      {
        id: 'curriculumSeed',
        path: '/js/academy/curriculumSeed.js',
        description: 'Curriculum Seed Data',
        required: true
      },

      // ==========================================================
      // 3. Experience Layer
      // ==========================================================
      {
        id: 'academyView',
        path: 'js/academy/academyView.js',
        description: 'Academy View (Renderer)',
        required: true
      },
      {
        id: 'academyExperienceManager',
        path: 'js/academy/academyExperienceManager.js',
        description: 'Academy Experience Manager (Controller)',
        required: true
      }

    // ==========================================================
    // 🔥 4. Learning Journey Layer (新增)
    // ==========================================================
    {
        id: 'learningJourneyAdapter',
        path: '/js/academy/learningJourneyAdapter.js',
        description: 'Learning Journey Adapter',
        required: true
    }

    // ============================================================
    // 依赖关系
    // ============================================================
    dependencies: {
      schoolRegistry: [],
      programRegistry: ['schoolRegistry'],
      courseRegistry: ['programRegistry'],
      curriculumRegistry: ['schoolRegistry', 'programRegistry', 'courseRegistry'],
      curriculumSeed: ['curriculumRegistry'],
      academyView: ['schoolRegistry', 'programRegistry', 'courseRegistry'],
      academyExperienceManager: ['academyView', 'curriculumRegistry', 'curriculumSeed']
      learningJourneyAdapter: ['curriculumRegistry', 'academyView', 'academyExperienceManager']
    },

    // ============================================================
    // Core Dependencies (保留原有)
    // ============================================================
    core: [
      {
        id: 'academy',
        file: 'academy.js',
        description: 'Academy Core Engine',
        required: true
      },
      {
        id: 'academyModel',
        file: 'academyModel.js',
        description: 'Academy Data Models',
        required: true
      },
      {
        id: 'academyData',
        file: 'academyData.js',
        description: 'Academy Initial Data',
        required: true
      }
    ],

    // ============================================================
    // School Layer (保留)
    // ============================================================
    school: [
      {
        id: 'schoolEngine',
        file: 'schoolEngine.js',
        description: 'School Management Engine',
        required: true
      }
    ],

    // ============================================================
    // Curriculum Layer (保留)
    // ============================================================
    curriculum: [
      {
        id: 'curriculumFactory',
        file: 'curriculumFactoryEngine.js',
        description: 'Curriculum Factory Engine',
        required: true
      },
      {
        id: 'moduleModel',
        file: 'moduleModel.js',
        description: 'Module Data Model',
        required: true
      },
      {
        id: 'moduleData',
        file: 'moduleData.js',
        description: 'Module Initial Data',
        required: true
      }
    ],

    // ============================================================
    // Learning Layer (保留)
    // ============================================================
    learning: [
      {
        id: 'learningJourney',
        file: 'learningJourneyEngine.js',
        description: 'Learning Journey Engine',
        required: true
      },
      {
        id: 'learningStateManager',
        file: 'learningStateManager.js',
        description: 'Learning State Manager',
        required: true
      }
    ],

    // ============================================================
    // Lesson Layer (保留)
    // ============================================================
    lesson: [
      {
        id: 'lessonEngine',
        file: 'lessonEngine.js',
        description: 'Lesson Engine',
        required: true
      },
      {
        id: 'lessonModel',
        file: 'lessonModel.js',
        description: 'Lesson Data Model',
        required: true
      }
    ],

    // ============================================================
    // Course (Legacy) — DO NOT DELETE
    // ============================================================
    course_legacy: [
      {
        id: 'course',
        file: 'course.js',
        description: 'Legacy Course Engine',
        required: false,
        deprecated: true,
        migration: 'Program Adapter'
      },
      {
        id: 'courseModel',
        file: 'courseModel.js',
        description: 'Legacy Course Model',
        required: false,
        deprecated: true,
        migration: 'Program Adapter'
      },
      {
        id: 'courseData',
        file: 'courseData.js',
        description: 'Legacy Course Data',
        required: false,
        deprecated: true,
        migration: 'Program Adapter'
      }
    ],

    // ============================================================
    // Progress & Certification (保留)
    // ============================================================
    progress: [
      {
        id: 'progressEngine',
        file: 'progressEngine.js',
        description: 'Progress Tracking Engine',
        required: true
      },
      {
        id: 'certificateEngine',
        file: 'certificateEngine.js',
        description: 'Certification Engine',
        required: false
      }
    ],

    // ============================================================
    // Engine Mapping (保留)
    // ============================================================
    engineMapping: {
      'academy.js': 'Academy Core',
      'schoolEngine.js': 'School Layer',
      'curriculumFactoryEngine.js': 'Curriculum Layer',
      'moduleEngine.js': 'Module Layer',
      'lessonEngine.js': 'Lesson Layer',
      'learningJourneyEngine.js': 'Learning Journey',
      'progressEngine.js': 'Progress System',
      'certificateEngine.js': 'Certification System'
    },

    // ============================================================
    // Course → Program Migration Strategy (保留)
    // ============================================================
    courseMigration: {
      enabled: true,
      adapter: 'ProgramAdapter',
      backwardCompatible: true,
      mapping: {
        'course.id': 'program.id',
        'course.name': 'program.name',
        'course.description': 'program.description',
        'course.schoolId': 'program.schoolId',
        'course.difficulty': 'program.difficulty',
        'course.duration': 'program.duration'
      }
    },

    // ============================================================
    // Runtime Integration (保留)
    // ============================================================
    runtimeIntegration: {
      stateSync: true,
      eventSystem: true,
      governance: true,
      knowledgeGraph: true
    },

    // ============================================================
    // Required Events (保留)
    // ============================================================
    events: [
      'ACADEMY_INITIALIZED',
      'SCHOOL_REGISTERED',
      'PROGRAM_LOADED',
      'LEARNING_STATE_UPDATED',
      'ACADEMY_READY'
    ],

    // ============================================================
    // 健康检查 (升级)
    // ============================================================
    healthChecks: [
      'LawAIApp.SchoolRegistry',
      'LawAIApp.ProgramRegistry',
      'LawAIApp.CourseRegistry',
      'LawAIApp.CurriculumRegistry',
      'LawAIApp.CurriculumSeed',
      'LawAIApp.AcademyView',
      'LawAIApp.AcademyExperienceManager'
    ]
  };

  // ============================================================
  // Export
  // ============================================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  // 如果已存在，合并升级
  if (window.LawAIApp.AcademyManifest) {
    console.log('[AcademyManifest] Merging with existing...');
    const existing = window.LawAIApp.AcademyManifest;
    // 更新版本
    existing.version = ACADEMY_MANIFEST.version;
    // 添加 modules 列表
    existing.modules = ACADEMY_MANIFEST.modules;
    existing.dependencies = ACADEMY_MANIFEST.dependencies;
    existing.healthChecks = ACADEMY_MANIFEST.healthChecks;
    console.log('[AcademyManifest] ✅ Merged (v' + existing.version + ')');
  } else {
    // 挂载 Manifest（只读声明）
    Object.defineProperty(window.LawAIApp, 'AcademyManifest', {
      value: ACADEMY_MANIFEST,
      writable: false,
      configurable: false,
      enumerable: true
    });
    console.log('[AcademyManifest] ✅ Created (v' + ACADEMY_MANIFEST.version + ')');
  }

  console.log('[AcademyManifest] Modules to load:', ACADEMY_MANIFEST.modules.length);

})();
