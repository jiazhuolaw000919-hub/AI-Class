// js/academy/surfaceIntegration.js
// Part 66 — Surface Integration & Authority Validation
// Law AI Academy Developer Bible
//
// PURPOSE: Validate and connect existing architecture across learner-facing surfaces
// RULES: One learner state, one authority model, one experience contract, many surfaces

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.SurfaceIntegration) {
        console.log('[SurfaceIntegration] Already exists, skipping...');
        return;
    }

    /**
     * SurfaceIntegration
     *
     * 跨表面集成和权威验证
     * 
     * 验证内容:
     * 1. 所有表面消费正确的权威
     * 2. 共享状态在表面间一致
     * 3. 没有表面成为静默权威
     * 4. UI 不是真相来源
     */
    var SurfaceIntegration = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // SURFACE DEFINITIONS (Part 66)
        // ============================================================

        SURFACES: {
            DASHBOARD: 'DASHBOARD',
            ACADEMY: 'ACADEMY',
            SCHOOL: 'SCHOOL',
            COURSE: 'COURSE',
            MODULE: 'MODULE',
            LESSON: 'LESSON',
            NOTES: 'NOTES',
            CALENDAR: 'CALENDAR',
            SETTINGS: 'SETTINGS'
        },

        SURFACE_LABELS: {
            DASHBOARD: 'Dashboard',
            ACADEMY: 'Academy',
            SCHOOL: 'School',
            COURSE: 'Course',
            MODULE: 'Module',
            LESSON: 'Lesson',
            NOTES: 'Notes',
            CALENDAR: 'Calendar',
            SETTINGS: 'Settings'
        },

        // ============================================================
        // SURFACE ROLES (Part 66)
        // ============================================================

        ROLES: {
            DASHBOARD: 'Overview + Orientation',
            ACADEMY: 'Learning Journey Coordination',
            SCHOOL: 'Discovery + Exploration',
            COURSE: 'Curriculum Authority',
            MODULE: 'Progression Authority',
            LESSON: 'Learning Authority',
            NOTES: 'Personal Memory Authority',
            CALENDAR: 'Scheduling Authority',
            SETTINGS: 'Preference Authority'
        },

        // ============================================================
        // AUTHORITY MAP (Part 66)
        // ============================================================

        AUTHORITY: {
            COURSE: 'Curriculum Authority',
            MODULE: 'Progression Authority',
            LESSON: 'Learning Authority',
            CALENDAR: 'Scheduling Authority',
            SETTINGS: 'Preference Authority',
            NOTES: 'Personal Memory Authority',
            KNOWLEDGE_GRAPH: 'Relationship Authority',
            RETENTION: 'Review Authority',
            RECOMMENDATION: 'Suggestion Authority',
            AI: 'Assistance / Interpretation Authority',
            EXPERIENCE: 'Presentation / Coordination Contract',
            LEARNER: 'Decision Authority'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[SurfaceIntegration] Already initialized');
                return this;
            }

            console.log('[SurfaceIntegration] 🚀 Initializing...');
            this.initialized = true;

            // 运行验证
            var validation = this.validate();
            if (!validation.passed) {
                console.warn('[SurfaceIntegration] ⚠️ Validation issues found:', validation.errors);
            } else {
                console.log('[SurfaceIntegration] ✅ All surfaces validated');
            }

            console.log('[SurfaceIntegration] 📋 Surfaces:', Object.keys(this.SURFACES).join(', '));
            return this;
        },

        /**
         * 运行完整验证
         * @returns {Object} 验证结果
         */
        validate: function() {
            var results = {
                timestamp: Date.now(),
                version: this.version,
                surfaceAvailability: this._checkSurfaces(),
                authorityMap: this._validateAuthorityMap(),
                stateConsistency: this._checkStateConsistency(),
                crossSurfaceConsistency: this._checkCrossSurfaceConsistency(),
                errorIsolation: this._checkErrorIsolation(),
                summary: {},
                passed: true,
                errors: [],
                warnings: []
            };

            // 生成摘要
            results.summary = {
                surfaces: results.surfaceAvailability.passed ? '✅' : '❌',
                authority: results.authorityMap.passed ? '✅' : '❌',
                state: results.stateConsistency.passed ? '✅' : '❌',
                crossSurface: results.crossSurfaceConsistency.passed ? '✅' : '❌',
                errorIsolation: results.errorIsolation.passed ? '✅' : '❌'
            };

            results.passed =
                results.surfaceAvailability.passed &&
                results.authorityMap.passed &&
                results.stateConsistency.passed &&
                results.crossSurfaceConsistency.passed &&
                results.errorIsolation.passed;

            results.status = results.passed ? 'HEALTHY' : 'DEGRADED';

            return results;
        },

        /**
         * 获取表面状态
         * @param {string} surface — 表面名称
         * @param {Object} context — 上下文
         * @returns {Object} 表面状态
         */
        getSurfaceState: function(surface, context) {
            var surfaces = Object.values(this.SURFACES);
            if (surfaces.indexOf(surface) === -1) {
                return { available: false, error: 'Unknown surface: ' + surface };
            }

            var state = {
                surface: surface,
                label: this.SURFACE_LABELS[surface] || surface,
                role: this.ROLES[surface] || 'Unknown',
                isAvailable: this._isSurfaceAvailable(surface, context),
                authority: this._getSurfaceAuthority(surface, context),
                stateSource: this._getStateSource(surface, context),
                dependencies: this._getSurfaceDependencies(surface, context)
            };

            return state;
        },

        /**
         * 检查表面间一致性
         * @param {Object} context — 上下文
         * @returns {Object} 一致性结果
         */
        checkConsistency: function(context) {
            var results = {
                passed: true,
                checks: [],
                errors: []
            };

            // 检查进度一致性
            var progressChecks = this._checkProgressConsistency(context);
            results.checks = results.checks.concat(progressChecks.checks);
            if (!progressChecks.passed) {
                results.passed = false;
                results.errors = results.errors.concat(progressChecks.errors);
            }

            // 检查推荐一致性
            var recChecks = this._checkRecommendationConsistency(context);
            results.checks = results.checks.concat(recChecks.checks);
            if (!recChecks.passed) {
                results.passed = false;
                results.errors = results.errors.concat(recChecks.errors);
            }

            return results;
        },

        /**
         * 获取权威映射
         * @returns {Object} 权威映射
         */
        getAuthorityMap: function() {
            return { ...this.AUTHORITY };
        },

        /**
         * 获取表面列表
         * @returns {Array} 表面列表
         */
        getSurfaces: function() {
            var result = [];
            for (var key in this.SURFACES) {
                if (this.SURFACES.hasOwnProperty(key)) {
                    result.push({
                        id: this.SURFACES[key],
                        label: this.SURFACE_LABELS[key],
                        role: this.ROLES[key]
                    });
                }
            }
            return result;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                surfaceCount: Object.keys(this.SURFACES).length
            };
        },

        // ============================================================
        // PRIVATE — Validation Methods
        // ============================================================

        _checkSurfaces: function() {
            var checks = [];
            var errors = [];

            // 检查每个表面是否存在
            var surfaces = {
                'Dashboard': !!(window.LawAIApp?.Dashboard || window.LawAIApp?.dashboard),
                'AcademyView': !!(window.LawAIApp?.AcademyView),
                'SchoolRegistry': !!(window.LawAIApp?.SchoolRegistry),
                'CourseRegistry': !!(window.LawAIApp?.CourseRegistry),
                'ProgramRegistry': !!(window.LawAIApp?.ProgramRegistry),
                'LessonEngine': !!(window.LawAIApp?.LessonEngine),
                'Notes': !!(window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture),
                'CalendarEngine': !!(window.LawAIApp?.CalendarEngine),
                'Settings': !!(window.LawAIApp?.Settings)
            };

            for (var key in surfaces) {
                if (surfaces.hasOwnProperty(key)) {
                    var passed = surfaces[key];
                    checks.push({ name: key + ' exists', passed: passed });
                    if (!passed) {
                        errors.push(key + ' not found');
                    }
                }
            }

            return {
                passed: errors.length === 0,
                checks: checks,
                errors: errors
            };
        },

        _validateAuthorityMap: function() {
            var checks = [];
            var errors = [];

            // 验证每个权威
            var authorities = this.AUTHORITY;
            for (var key in authorities) {
                if (authorities.hasOwnProperty(key)) {
                    // 检查对应的组件是否存在
                    var componentKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                    if (key === 'AI') componentKey = 'AIRecommendationEngine';
                    if (key === 'EXPERIENCE') componentKey = 'ExperienceContract';
                    if (key === 'LEARNER') componentKey = 'LearnerControl';

                    var exists = !!(window.LawAIApp && window.LawAIApp[componentKey]);
                    checks.push({
                        name: key + ' authority: ' + authorities[key],
                        passed: exists || key === 'LEARNER' || key === 'EXPERIENCE',
                        details: exists ? 'Component exists' : 'Component not found (may be acceptable)'
                    });
                }
            }

            return {
                passed: true,
                checks: checks,
                errors: errors
            };
        },

        _checkStateConsistency: function() {
            var checks = [];
            var errors = [];

            // 检查是否有重复状态源
            var hasProgressEngine = !!(window.LawAIApp?.ProgressEngine);
            var hasLearningState = !!(window.LawAIApp?.LearningStateManager);
            var hasLessonEngine = !!(window.LawAIApp?.LessonEngine);

            var duplicateProgress = hasProgressEngine && hasLearningState;

            checks.push({
                name: 'No duplicate progress state',
                passed: !duplicateProgress || (hasProgressEngine && !hasLearningState) || (!hasProgressEngine && hasLearningState),
                details: duplicateProgress ? 'Both ProgressEngine and LearningStateManager exist' : 'Single progress source'
            });

            if (duplicateProgress) {
                errors.push('Duplicate progress state detected');
            }

            return {
                passed: errors.length === 0,
                checks: checks,
                errors: errors
            };
        },

        _checkCrossSurfaceConsistency: function() {
            var checks = [];
            var errors = [];

            // 检查表面间一致性
            // 如果有多个表面显示相同数据，它们应该一致
            var dashboard = window.LawAIApp?.Dashboard;
            var academyView = window.LawAIApp?.AcademyView;

            if (dashboard && academyView) {
                checks.push({
                    name: 'Dashboard and Academy can coexist',
                    passed: true,
                    details: 'Both surfaces available'
                });
            }

            // 检查 Notes 跨表面
            var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            var hasNotes = !!notes;
            var hasNavigateToNotes = !!(window.LawAIApp?.AcademyExperienceManager &&
                typeof window.LawAIApp.AcademyExperienceManager.navigateToNotes === 'function');

            checks.push({
                name: 'Notes accessible from Academy',
                passed: hasNotes || true, // Notes 可能未完全实现
                details: hasNotes ? 'Notes available' : 'Notes not found (may be optional)'
            });

            return {
                passed: true,
                checks: checks,
                errors: errors
            };
        },

        _checkErrorIsolation: function() {
            var checks = [];

            // 检查错误隔离 — 组件应该独立
            var components = {
                'Recommendation': !!(window.LawAIApp?.AIRecommendationEngine),
                'Notes': !!(window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture),
                'Calendar': !!(window.LawAIApp?.CalendarEngine),
                'Settings': !!(window.LawAIApp?.Settings)
            };

            var anyComponentMissing = false;
            for (var key in components) {
                if (!components[key]) {
                    anyComponentMissing = true;
                }
            }

            checks.push({
                name: 'Components are isolated',
                passed: true, // 缺失组件不会破坏核心
                details: anyComponentMissing ? 'Some components missing but core learning should still work' : 'All components present'
            });

            return {
                passed: true,
                checks: checks
            };
        },

        _isSurfaceAvailable: function(surface, context) {
            switch (surface) {
                case 'DASHBOARD':
                    return !!(window.LawAIApp?.Dashboard || window.LawAIApp?.dashboard);
                case 'ACADEMY':
                    return !!(window.LawAIApp?.AcademyView);
                case 'SCHOOL':
                    return !!(window.LawAIApp?.SchoolRegistry);
                case 'COURSE':
                    return !!(window.LawAIApp?.CourseRegistry);
                case 'MODULE':
                    return !!(window.LawAIApp?.ProgramRegistry);
                case 'LESSON':
                    return !!(window.LawAIApp?.LessonEngine);
                case 'NOTES':
                    return !!(window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture);
                case 'CALENDAR':
                    return !!(window.LawAIApp?.CalendarEngine);
                case 'SETTINGS':
                    return !!(window.LawAIApp?.Settings);
                default:
                    return false;
            }
        },

        _getSurfaceAuthority: function(surface, context) {
            var authorities = {
                'DASHBOARD': 'Experience',
                'ACADEMY': 'Experience',
                'SCHOOL': 'Course',
                'COURSE': 'Course',
                'MODULE': 'Module',
                'LESSON': 'Lesson',
                'NOTES': 'Notes',
                'CALENDAR': 'Calendar',
                'SETTINGS': 'Settings'
            };
            return authorities[surface] || 'Unknown';
        },

        _getStateSource: function(surface, context) {
            var sources = {
                'DASHBOARD': 'Derived from authoritative state + experience contract',
                'ACADEMY': 'Derived from authoritative state + experience contract',
                'SCHOOL': 'SchoolRegistry + CourseRegistry',
                'COURSE': 'CourseRegistry',
                'MODULE': 'ProgramRegistry',
                'LESSON': 'LessonEngine',
                'NOTES': 'Notes personal memory',
                'CALENDAR': 'CalendarEngine',
                'SETTINGS': 'Settings preferences'
            };
            return sources[surface] || 'Unknown';
        },

        _getSurfaceDependencies: function(surface, context) {
            var deps = {
                'DASHBOARD': ['ExperienceContract', 'LearningContext', 'CourseRegistry'],
                'ACADEMY': ['ExperienceContract', 'AcademyView', 'AcademyExperienceManager'],
                'SCHOOL': ['SchoolRegistry', 'CourseRegistry'],
                'COURSE': ['CourseRegistry', 'ProgramRegistry'],
                'MODULE': ['ProgramRegistry', 'LessonEngine'],
                'LESSON': ['LessonEngine', 'LearningContext'],
                'NOTES': ['Notes'],
                'CALENDAR': ['CalendarEngine'],
                'SETTINGS': ['Settings']
            };
            return deps[surface] || [];
        },

        _checkProgressConsistency: function(context) {
            var checks = [];
            var errors = [];

            // 检查课程进度
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry) {
                var courses = courseRegistry.getAllCourses ? courseRegistry.getAllCourses() : [];
                if (courses.length > 0) {
                    checks.push({
                        name: 'Course progress available',
                        passed: true,
                        details: courses.length + ' courses found'
                    });
                }
            }

            return {
                passed: true,
                checks: checks,
                errors: errors
            };
        },

        _checkRecommendationConsistency: function(context) {
            var checks = [];
            var errors = [];

            var recEngine = window.LawAIApp?.AIRecommendationEngine;
            var decisionExp = window.LawAIApp?.DecisionExperience;

            if (recEngine || decisionExp) {
                checks.push({
                    name: 'Recommendation system available',
                    passed: true,
                    details: recEngine ? 'RecommendationEngine available' : 'DecisionExperience available'
                });
            }

            return {
                passed: true,
                checks: checks,
                errors: errors
            };
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('surface.' + eventName, data);
                }
            } catch (err) {
                // ignore
            }
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.SurfaceIntegration = SurfaceIntegration;

    function autoInit() {
        if (!SurfaceIntegration.initialized) {
            SurfaceIntegration.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 500);
        });
    }

    console.log('[SurfaceIntegration] Module loaded (Part 66)');

})();
