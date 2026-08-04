// js/academy/academyManifest.js
// Part 57.3 — Academy Manifest
// Law AI Academy Developer Bible
// 
// PURPOSE: Define Academy dependencies and module mapping.
//          This file is a DECLARATION, not execution.
//          DO NOT execute logic here.

(function() {
  'use strict';

  /**
   * AcademyManifest
   * 
   * 定义 Academy Experience Layer 的：
   * - 核心依赖
   * - 现有 Engine 映射
   * - 模块版本
   * - 加载顺序
   * 
   * 原则：不执行逻辑，仅声明
   */
  const ACADEMY_MANIFEST = {
    version: '1.0.0',
    name: 'Academy Experience Layer',
    description: 'Law AI Academy — Academic Structure & Learning System',

    // ============================================
    // Core Dependencies
    // ============================================
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

    // ============================================
    // School Layer
    // ============================================
    school: [
      {
        id: 'schoolEngine',
        file: 'schoolEngine.js',
        description: 'School Management Engine',
        required: true
      }
    ],

    // ============================================
    // Curriculum Layer
    // ============================================
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

    // ============================================
    // Learning Layer
    // ============================================
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

    // ============================================
    // Lesson Layer
    // ============================================
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

    // ============================================
    // Course (Legacy) — DO NOT DELETE
    // ============================================
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

    // ============================================
    // Progress & Certification
    // ============================================
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

    // ============================================
    // Engine Mapping (Existing → New)
    // ============================================
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

    // ============================================
    // Course → Program Migration Strategy
    // ============================================
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

    // ============================================
    // Runtime Integration
    // ============================================
    runtimeIntegration: {
      stateSync: true,
      eventSystem: true,
      governance: true,
      knowledgeGraph: true
    },

    // ============================================
    // Required Events
    // ============================================
    events: [
      'ACADEMY_INITIALIZED',
      'SCHOOL_REGISTERED',
      'PROGRAM_LOADED',
      'LEARNING_STATE_UPDATED',
      'ACADEMY_READY'
    ],

    // ============================================
    // Health Checks
    // ============================================
    healthChecks: [
      'checkRuntimeAvailability',
      'checkCoreEngines',
      'checkSchoolEngine',
      'checkCurriculumEngine',
      'checkLearningEngine'
    ]
  };

  // ============================================
  // Export
  // ============================================

  if (!window.LawAIApp) {
    window.LawAIApp = {};
  }

  // 挂载 Manifest（只读声明）
  Object.defineProperty(window.LawAIApp, 'AcademyManifest', {
    value: ACADEMY_MANIFEST,
    writable: false,
    configurable: false,
    enumerable: true
  });

  console.log('[AcademyManifest] Loaded (Part 57.3)');
  console.log('[AcademyManifest] Version:', ACADEMY_MANIFEST.version);
  console.log('[AcademyManifest] Engines:', Object.keys(ACADEMY_MANIFEST.engineMapping).length);

})();
