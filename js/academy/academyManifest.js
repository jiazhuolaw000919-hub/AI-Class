// js/academy/academyManifest.js
// Part 57.4-57.6 — Academy Manifest (Structure Recovery)
// S4 Extended — Added Content Registry & Loader support
// Law AI Academy Developer Bible

(function() {
    'use strict';

    // ============================================================
    // ACADEMY MANIFEST — Complete Structure
    // ============================================================

    var ACADEMY_MANIFEST = {
        version: '2.0.0',
        name: 'Academy Experience Layer',
        description: 'Law AI Academy — Season 3 Architecture + S4 Content Layer',

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
            // 1.5. Subject Registry Layer (S4)
            // ==========================================================
            {
                id: 'subjectRegistry',
                path: '/js/academy/subjectRegistry.js',
                description: 'Subject Registry (S4)',
                required: true
            },

            {
                id: 'contentValidator',
                path: '/js/academy/contentValidator.js',
                description: 'S4 Content Validator (Lesson Contract)',
                required: false
            },

            // ==========================================================
            // ═══ Part 33: Practice 模块 ═══
            // ==========================================================
            {
                id: 'practiceEngine',
                path: '/js/academy/practiceEngine.js',
                description: 'Practice Engine (S4)',
                required: false
            },
            {
                id: 'practiceModule',
                path: '/js/academy/practice.js',
                description: 'Practice Module (S4)',
                required: false
            },
            {
                id: 'practiceProgress',
                path: '/js/academy/practiceProgress.js',
                description: 'Practice Progress (S4)',
                required: false
            },
            {
                id: 'knowledgeCapture',
                path: '/js/academy/knowledgeCapture.js',
                description: 'Knowledge Capture (S4)',
                required: false
            },
            {
                id: 'knowledgeEditor',
                path: '/js/academy/knowledgeEditor.js',
                description: 'Knowledge Editor (S4)',
                required: false
            },
            {
                id: 'knowledgeLinker',
                path: '/js/academy/knowledgeLinker.js',
                description: 'Knowledge Linker (S4)',
                required: false
            },
            {
                id: 'knowledgeCard',
                path: '/js/academy/knowledgeCard.js',
                description: 'Knowledge Card (S4)',
                required: false
            },
            {
                id: 'secondBrain',
                path: '/js/academy/secondBrain.js',
                description: 'Second Brain (S4)',
                required: false
            },
            {
                id: 'notes',
                path: '/js/academy/notes.js',
                description: 'Notes Tab (S4)',
                required: false
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

            {
                id: 'motivationRenderer',
                path: '/js/academy/renderers/motivationRenderer.js',
                description: 'Motivation Renderer (Pure UI)',
                required: true
            },

            {
                id: 'continueLearningRenderer',
                path: '/js/academy/renderers/continueLearningRenderer.js',
                description: 'Continue Learning Renderer (Pure UI)',
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
            },

            // ==========================================================
            // ═══ S4 新增: Content Layer (Part 3) ═══
            // ==========================================================
            {
                id: 'contentLoader',
                path: '/js/academy/contentLoader.js',
                description: 'S4 Content Loader (Lazy Loading)',
                required: false
            },
            {
                id: 'contentRegistry',
                path: '/js/academy/contentRegistry.js',
                description: 'S4 Content Registry (Discovery)',
                required: false
            },
            {
                id: 'contentAdapter',
                path: '/js/academy/contentAdapter.js',
                description: 'S4 Content Adapter (Bridge Legacy/S4)',
                required: false
            },
            {
                name: 'DecisionOptionModel',
                path: 'js/academy/decisionOptionModel.js',
                required: true
            },
            {
                name: 'DecisionAuthority',
                path: 'js/academy/decisionAuthority.js',
                required: true
            },
            {
                name: 'DecisionPrimacy',
                path: 'js/academy/decisionPrimacy.js',
                required: true
            },
            {
                name: 'OptionNormalizer',
                path: 'js/academy/optionNormalizer.js',
                required: true
            },
            {
                name: 'DecisionExperience',
                path: 'js/academy/decisionExperience.js',
                required: true
            },
            // ── Part 55: Action → Outcome → Adaptation ──
            {
                id: 'actionTracker',
                path: '/js/academy/actionTracker.js',
                description: 'Action Tracker (ACTION ≠ OUTCOME)',
                required: false
            },
            {
                id: 'outcomeNormalizer',
                path: '/js/academy/outcomeNormalizer.js',
                description: 'Outcome Normalizer (Normalize outcomes)',
                required: false
            },
            {
                id: 'outcomeLinker',
                path: '/js/academy/outcomeLinker.js',
                description: 'Outcome Linker (Recommendation → Action → Outcome)',
                required: false
            },
            {
                id: 'adaptationSignal',
                path: '/js/academy/adaptationSignal.js',
                description: 'Adaptation Signal (Level 1-4)',
                required: false
            },
            {
                id: 'outcomePanel',
                path: '/js/debug/panels/outcomePanel.js',
                description: 'Outcome Panel (DevPanel Integration)',
                required: false
            },
            // ── Part 56: Adaptation Transparency ──
            {
                id: 'adaptationRecord',
                path: '/js/academy/adaptationRecord.js',
                description: 'Adaptation Record (Traceable)',
                required: false
            },
            {
                id: 'adaptationExplainer',
                path: '/js/academy/adaptationExplainer.js',
                description: 'Adaptation Explainer (Why?)',
                required: false
            },
            {
                id: 'adaptationGovernance',
                path: '/js/academy/adaptationGovernance.js',
                description: 'Adaptation Governance (Authority Check)',
                required: false
            },
            {
                id: 'adaptationPanel',
                path: '/js/debug/panels/adaptationPanel.js',
                description: 'Adaptation Panel (DevPanel)',
                required: false
            },
            // ── Part 57: Learning Loop Validator ──
            {
                id: 'learningLoopValidator',
                path: '/js/academy/learningLoopValidator.js',
                description: 'Learning Loop Validator (System Integrity)',
                required: false
            },
            // ── Part 58: Learner Control & Metacognitive Experience ──
            {
                id: 'learnerControl',
                path: '/js/academy/learnerControl.js',
                description: 'Learner Control (Reject/Override/Alternative)',
                required: false
            },
            {
                id: 'metacognitiveExperience',
                path: '/js/academy/metacognitiveExperience.js',
                description: 'Metacognitive Experience (Reflection/Self-Assessment)',
                required: false
            },
            {
                id: 'metacognitivePanel',
                path: '/js/debug/panels/metacognitivePanel.js',
                description: 'Metacognitive Panel (DevPanel)',
                required: false
            },
            // ── Part 59: Learning Patterns & Self-Awareness ──
            {
                id: 'learningPatternModel',
                path: '/js/academy/learningPatternModel.js',
                description: 'Learning Pattern Model (Data Contract)',
                required: false
            },
            {
                id: 'patternDetector',
                path: '/js/academy/patternDetector.js',
                description: 'Pattern Detector (Evidence-based)',
                required: false
            },
            {
                id: 'patternExplainer',
                path: '/js/academy/patternExplainer.js',
                description: 'Pattern Explainer (Human-readable)',
                required: false
            },
            {
                id: 'patternPanel',
                path: '/js/debug/panels/patternPanel.js',
                description: 'Pattern Panel (DevPanel)',
                required: false
            },
            // ── Part 60: Epistemic Judgment & AI Literacy ──
            {
                id: 'epistemicStatus',
                path: '/js/academy/epistemicStatus.js',
                description: 'Epistemic Status Model (AI/Inference/Unknown)',
                required: false
            },
            {
                id: 'sourceDistinguisher',
                path: '/js/academy/sourceDistinguisher.js',
                description: 'Source Distinguisher (AI vs Course)',
                required: false
            },
            {
                id: 'aiLiteracyHelper',
                path: '/js/academy/aiLiteracyHelper.js',
                description: 'AI Literacy Helper (Prompts/Tips)',
                required: false
            },
            {
                id: 'epistemicPanel',
                path: '/js/debug/panels/epistemicPanel.js',
                description: 'Epistemic Panel (DevPanel)',
                required: false
            },
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

            subjectRegistry: ['courseRegistry'],

            // Curriculum Layer
            curriculumRegistry: ['schoolRegistry', 'programRegistry', 'courseRegistry'],

            curriculumSeed: ['curriculumRegistry'],

            // Experience Layer
            academyView: ['schoolRegistry', 'programRegistry', 'courseRegistry'],

            academyExperienceManager: ['academyView', 'curriculumRegistry', 'curriculumSeed'],

            // Learning Journey Layer
            learningJourneyAdapter: ['curriculumRegistry', 'academyView', 'academyExperienceManager'],

            // ==========================================================
            // ═══ S4 新增依赖 ═══
            // ==========================================================
            contentLoader: ['courseRegistry'],
            contentRegistry: ['contentLoader'],
            contentAdapter: ['contentRegistry'],

            // Decision Experience (Part 54)
            decisionOptionModel: [],
            decisionAuthority: ['decisionOptionModel'],
            decisionPrimacy: ['decisionOptionModel'],
            optionNormalizer: ['decisionOptionModel', 'learningContext'],
            decisionExperience: ['decisionOptionModel', 'decisionAuthority', 'decisionPrimacy', 'optionNormalizer', 'learningContext', 'experienceIntelligence'],
            decisionPanel: ['decisionExperience'],

        // ── Part 55: Action → Outcome → Adaptation ──
            actionTracker: ['decisionExperience'],
            outcomeNormalizer: ['actionTracker'],
            outcomeLinker: ['actionTracker', 'outcomeNormalizer'],
            adaptationSignal: ['outcomeNormalizer', 'outcomeLinker'],
            outcomePanel: ['adaptationSignal'],

        // ── Part 56: Adaptation Transparency ──
            adaptationRecord: ['adaptationSignal', 'outcomeNormalizer'],
            adaptationExplainer: ['adaptationRecord'],
            adaptationGovernance: ['adaptationRecord'],
            adaptationPanel: ['adaptationRecord', 'adaptationExplainer', 'adaptationGovernance'],

        // ── Part 58: Learner Control & Metacognitive Experience ──
            learnerControl: ['decisionExperience', 'adaptationExplainer'],
            metacognitiveExperience: ['learnerControl', 'notes'],
            metacognitivePanel: ['metacognitiveExperience', 'learnerControl'],
        // ── Part 57: Learning Loop Validator ──
            learningLoopValidator: [
                'learningContext',
                'experienceIntelligence',
                'decisionExperience',
                'actionTracker',
                'outcomeNormalizer',
                'outcomeLinker',
                'adaptationSignal',
                'adaptationRecord',
                'adaptationExplainer',
                'adaptationGovernance'
            ],
        // ── Part 59: Learning Patterns & Self-Awareness ──
            learningPatternModel: [],
            patternDetector: ['learningPatternModel', 'actionTracker', 'outcomeNormalizer', 'learningContext'],
            patternExplainer: ['learningPatternModel', 'patternDetector'],
            patternPanel: ['patternDetector', 'patternExplainer']
        },

        // ── Part 60: Epistemic Judgment & AI Literacy ──
            epistemicStatus: [],
            sourceDistinguisher: ['epistemicStatus', 'courseRegistry'],
            aiLiteracyHelper: ['epistemicStatus', 'sourceDistinguisher'],
            epistemicPanel: ['epistemicStatus', 'sourceDistinguisher', 'aiLiteracyHelper'],

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
            'MOTIVATION_UPDATED',
            // ==========================================================
            // ═══ S4 新增事件 ═══
            // ==========================================================
            'S4_CONTENT_LOADED',
            'S4_CONTENT_REGISTERED',
            'S4_COURSE_LOADED'
        ],

        // ============================================================
        // 14. HEALTH CHECKS — Includes Season 3 Layer
        // ============================================================

        healthChecks: [
            'LawAIApp.SchoolRegistry',
            'LawAIApp.ProgramRegistry',
            'LawAIApp.CourseRegistry',
            'LawAIApp.SubjectRegistry',
            'LawAIApp.ContentValidator',
            'LawAIApp.CurriculumRegistry',
            'LawAIApp.CurriculumSeed',
            'LawAIApp.AcademyView',
            'LawAIApp.AcademyExperienceManager',
            'LawAIApp.LearningJourneyAdapter',
            // ==========================================================
            // ═══ S4 新增健康检查 ═══
            // ==========================================================
            'LawAIApp.ContentLoader',
            'LawAIApp.ContentRegistry',
            'LawAIApp.ContentAdapter'
        ],

        // ============================================================
        // ═══ S4 新增: S4 配置 ═══
        // ============================================================
        s4: {
            enabled: true,
            version: '1.0.0',
            contentBase: '/content/',
            lazyLoading: true,
            fallbackToLegacy: true,
            autoSync: true
        }
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
        existing.description = ACADEMY_MANIFEST.description;
        existing.modules = ACADEMY_MANIFEST.modules;
        existing.dependencies = ACADEMY_MANIFEST.dependencies;
        existing.healthChecks = ACADEMY_MANIFEST.healthChecks;
        existing.events = ACADEMY_MANIFEST.events;
        existing.s4 = ACADEMY_MANIFEST.s4;

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
    console.log('[AcademyManifest] S4 enabled:', ACADEMY_MANIFEST.s4.enabled);

})();
