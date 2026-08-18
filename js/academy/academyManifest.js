// js/academy/academyManifest.js
// Part 57.4-57.6 — Academy Manifest (Structure Recovery)
// Law AI Academy Developer Bible
//
// PURPOSE: Define Academy module loading order for Season 3
// LOADING ORDER: Registry → Curriculum → Experience → Learning Journey

(function() {
    'use strict';

    // ============================================================
    // ACADEMY MANIFEST — Complete Structure
    // ============================================================

    var ACADEMY_MANIFEST = {
        version: '2.0.0',
        name: 'Academy Experience Layer',
        description: 'Law AI Academy — Season 3 Architecture',

        // ============================================================
        // 1. MODULES — Actual Loading Order
        // ============================================================
        // These are loaded by AcademyLoader in the order shown.
        // Each entry MUST have a valid 'path' property.
        //
        // Season 3 Architecture:
        //   Registry Layer → Curriculum Layer → Experience Layer → Learning Journey
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
                path: '/js/academy/academyView.js',
                description: 'Academy View (Renderer)',
                required: true
            },
            {
                id: 'academyExperienceManager',
                path: '/js/academy/academyExperienceManager.js',
                description: 'Academy Experience Manager (Controller)',
                required: true
            },

            // ==========================================================
            // 4. Learning Journey Layer
            // ==========================================================
            {
                id: 'learningJourneyAdapter',
                path: '/js/academy/learningJourneyAdapter.js',
                description: 'Learning Journey Adapter',
                required: true
            },

            // ==========================================================
            // 5. Learning Context Layer
            // ==========================================================
            {
                id: 'learningContext',
                path: '/js/academy/learningContext.js',
                description: 'Learning Context (Aggregation Layer)',
                required: true
            },

            // ==========================================================
        // 6. Experience Intelligence Layer
        // ==========================================================
        {
            id: 'experienceIntelligence',
            path: '/js/academy/experienceIntelligence.js',
            description: 'Experience Intelligence (Interpretation Layer)',
            required: false  // 可选，不阻塞 Academy
        }
        ],

        // ============================================================
        // 2. DEPENDENCIES — Loading Order Constraints
        // ============================================================
        // Dependencies define which modules must be loaded before others.
        // AcademyLoader uses these to validate loading order.
        // ============================================================

        dependencies: {
            // Registry Layer — independent
            schoolRegistry: [],

            programRegistry: ['schoolRegistry'],

            courseRegistry: ['programRegistry'],

            // Curriculum Layer
            curriculumRegistry: ['schoolRegistry', 'programRegistry', 'courseRegistry'],

            curriculumSeed: ['curriculumRegistry'],

            // Experience Layer
            academyView: ['schoolRegistry', 'programRegistry', 'courseRegistry'],

            academyExperienceManager: ['academyView', 'curriculumRegistry', 'curriculumSeed'],

            // Learning Journey Layer
            learningJourneyAdapter: ['curriculumRegistry', 'academyView', 'academyExperienceManager']
        },

        // ============================================================
        // 3. LEGACY — Core Dependencies (Preserved)
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
        // 4. LEGACY — School Layer (Preserved)
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
        // 5. LEGACY — Curriculum Layer (Preserved)
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
        // 6. LEGACY — Learning Layer (Preserved)
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
        // 7. LEGACY — Lesson Layer (Preserved)
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
        // 8. LEGACY — Course (Preserved — DO NOT DELETE)
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
        // 9. LEGACY — Progress & Certification (Preserved)
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
        // 10. ENGINE MAPPING — Legacy Reference (Preserved)
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
        // 11. COURSE → PROGRAM MIGRATION (Preserved)
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
        // 12. RUNTIME INTEGRATION (Preserved)
        // ============================================================

        runtimeIntegration: {
            stateSync: true,
            eventSystem: true,
            governance: true,
            knowledgeGraph: true
        },

        // ============================================================
        // 13. REQUIRED EVENTS (Preserved)
        // ============================================================

        events: [
            'ACADEMY_INITIALIZED',
            'SCHOOL_REGISTERED',
            'PROGRAM_LOADED',
            'LEARNING_STATE_UPDATED',
            'ACADEMY_READY',
            // Season 3 events
            'LEARNING_SESSION_STARTED',
            'LEARNING_SESSION_ENDED',
            'LEARNING_PROGRESS_UPDATED',
            'MOTIVATION_UPDATED'
        ],

        // ============================================================
        // 14. HEALTH CHECKS — Includes Season 3 Layer
        // ============================================================

        healthChecks: [
            'LawAIApp.SchoolRegistry',
            'LawAIApp.ProgramRegistry',
            'LawAIApp.CourseRegistry',
            'LawAIApp.CurriculumRegistry',
            'LawAIApp.CurriculumSeed',
            'LawAIApp.AcademyView',
            'LawAIApp.AcademyExperienceManager',
            'LawAIApp.LearningJourneyAdapter'
        ]
    };

    // ============================================================
    // 15. EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    // If manifest already exists, merge updates without destroying other properties
    if (window.LawAIApp.AcademyManifest) {
        var existing = window.LawAIApp.AcademyManifest;

        // Update only the properties we own
        existing.version = ACADEMY_MANIFEST.version;
        existing.modules = ACADEMY_MANIFEST.modules;
        existing.dependencies = ACADEMY_MANIFEST.dependencies;
        existing.healthChecks = ACADEMY_MANIFEST.healthChecks;
        existing.events = ACADEMY_MANIFEST.events;

        console.log('[AcademyManifest] ✅ Merged (v' + existing.version + ')');
    } else {
        // Fresh install
        Object.defineProperty(window.LawAIApp, 'AcademyManifest', {
            value: ACADEMY_MANIFEST,
            writable: false,
            configurable: false,
            enumerable: true
        });
        console.log('[AcademyManifest] ✅ Created (v' + ACADEMY_MANIFEST.version + ')');
    }

    console.log('[AcademyManifest] Modules to load:', ACADEMY_MANIFEST.modules.length);
    console.log('[AcademyManifest] Health checks:', ACADEMY_MANIFEST.healthChecks.length);

})();
