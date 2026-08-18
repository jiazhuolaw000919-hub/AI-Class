// js/academy/experienceIntelligence.js
// Part 61.1 — Experience Intelligence Boundary
// Law AI Academy Developer Bible
//
// PURPOSE: Interpret existing Academy/Learning facts into experience signals
// OWNERSHIP: INTERPRETATION layer — does NOT own state, does NOT replace engines
// INPUT: Read-only snapshot of learning/motivation state
// OUTPUT: Experience signals (learningState, momentum, recommendation)

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ExperienceIntelligence) {
        console.log('[ExperienceIntelligence] Already exists, skipping...');
        return;
    }

    /**
     * ExperienceIntelligence
     *
     * 职责：解释现有的 Academy 学习事实，生成体验信号
     * 
     * 不拥有状态，不替换任何现有引擎
     * 纯解释层 (Pure Interpretation Layer)
     */
    var ExperienceIntelligence = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // 1. PUBLIC API
        // ============================================================

        /**
         * 初始化 Experience Intelligence
         */
        init: function() {
            if (this.initialized) {
                console.log('[ExperienceIntelligence] Already initialized');
                return this;
            }

            console.log('[ExperienceIntelligence] 🚀 Initializing...');

            // 验证依赖 (不阻塞，仅记录)
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (!adapter) {
                console.warn('[ExperienceIntelligence] LearningJourneyAdapter not available');
            } else {
                console.log('[ExperienceIntelligence] ✅ LearningJourneyAdapter available');
            }

            this.initialized = true;
            console.log('[ExperienceIntelligence] ✅ Initialized');
            return this;
        },

        /**
         * 分析学习快照，生成体验信号
         * @param {Object} snapshot - { learning: {}, motivation: {} }
         * @returns {Object} 体验信号
         */
        analyze: function(snapshot) {
            console.log('[ExperienceIntelligence] 🔍 Analyzing snapshot...');

            // 安全处理空快照
            if (!snapshot) {
                return this._getDefaultSignals();
            }

            var learning = snapshot.learning || {};
            var motivation = snapshot.motivation || {};

            // 提取关键数据
            var courseId = learning.courseId || null;
            var moduleId = learning.moduleId || null;
            var lessonId = learning.lessonId || null;
            var progress = learning.progress || 0;
            var completedLessons = learning.completedLessons || [];
            var completedModules = learning.completedModules || [];
            var sessionStatus = learning.sessionStatus || null;
            var lastActivity = learning.lastActivity || null;

            var xp = motivation.xp || 0;
            var level = motivation.level || 1;
            var streak = motivation.streak || 0;
            var achievements = motivation.achievements || [];

            // 计算学习状态
            var learningState = this._determineLearningState({
                courseId: courseId,
                moduleId: moduleId,
                lessonId: lessonId,
                progress: progress,
                completedLessons: completedLessons,
                completedModules: completedModules,
                sessionStatus: sessionStatus
            });

            // 计算学习动量
            var momentum = this._determineMomentum({
                progress: progress,
                lastActivity: lastActivity,
                streak: streak,
                sessionStatus: sessionStatus
            });

            // 生成推荐动作
            var recommendation = this._determineRecommendation({
                learningState: learningState,
                momentum: momentum,
                courseId: courseId,
                moduleId: moduleId,
                lessonId: lessonId,
                progress: progress,
                sessionStatus: sessionStatus
            });

            // 构建信号
            var signals = {
                learningState: learningState,
                momentum: momentum,
                recommendation: recommendation,
                summary: this._buildSummary({
                    learningState: learningState,
                    momentum: momentum,
                    recommendation: recommendation,
                    xp: xp,
                    level: level,
                    streak: streak,
                    achievementCount: achievements.length
                }),
                timestamp: Date.now()
            };

            console.log('[ExperienceIntelligence] ✅ Signals generated:', signals);
            return signals;
        },

        /**
         * 获取当前体验信号 (便捷方法)
         * @returns {Object} 体验信号
         */
        getSignals: function() {
            var snapshot = this._buildSnapshot();
            return this.analyze(snapshot);
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                hasAdapter: !!window.LawAIApp?.LearningJourneyAdapter
            };
        },

        // ============================================================
        // 2. PRIVATE — Snapshot Builder
        // ============================================================

        /**
         * 从现有系统构建快照
         */
        _buildSnapshot: function() {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            var snapshot = {
                learning: {},
                motivation: {}
            };

            if (!adapter) {
                console.warn('[ExperienceIntelligence] Cannot build snapshot: adapter unavailable');
                return snapshot;
            }

            // 获取学习状态
            try {
                var state = adapter.getState ? adapter.getState() : null;
                if (state) {
                    snapshot.learning = {
                        courseId: state.currentCourseId || null,
                        moduleId: state.currentModuleId || null,
                        lessonId: state.currentLessonId || null,
                        progress: state.progress || 0,
                        completedLessons: state.completedLessons || [],
                        completedModules: state.completedModules || [],
                        lastActivity: state.lastActivity || null,
                        sessionStatus: state.sessionStatus || null
                    };
                }
            } catch (error) {
                console.warn('[ExperienceIntelligence] Failed to get learning state:', error);
            }

            // 获取动机数据
            try {
                var motivation = adapter.getLearningMotivation ? adapter.getLearningMotivation() : null;
                if (motivation) {
                    snapshot.motivation = {
                        xp: motivation.xp || 0,
                        level: motivation.level || 1,
                        streak: motivation.streak || 0,
                        achievements: motivation.achievements || []
                    };
                }
            } catch (error) {
                console.warn('[ExperienceIntelligence] Failed to get motivation:', error);
            }

            return snapshot;
        },

        // ============================================================
        // 3. PRIVATE — Signal Calculations
        // ============================================================

        /**
         * 确定学习状态
         */
        _determineLearningState: function(data) {
            var courseId = data.courseId;
            var moduleId = data.moduleId;
            var lessonId = data.lessonId;
            var progress = data.progress || 0;
            var completedLessons = data.completedLessons || [];
            var completedModules = data.completedModules || [];
            var sessionStatus = data.sessionStatus;

            // 有活跃 Session
            if (sessionStatus === 'active') {
                return 'active';
            }

            // 有当前 Lesson
            if (lessonId) {
                return 'active';
            }

            // 有当前 Module
            if (moduleId) {
                return 'idle';
            }

            // 有当前 Course
            if (courseId) {
                // 如果进度接近完成 (>= 80%)
                if (progress >= 80) {
                    return 'near_completion';
                }
                return 'idle';
            }

            // 有已完成内容
            if (completedLessons.length > 0 || completedModules.length > 0) {
                return 'idle';
            }

            return 'unknown';
        },

        /**
         * 确定学习动量
         */
        _determineMomentum: function(data) {
            var progress = data.progress || 0;
            var lastActivity = data.lastActivity;
            var streak = data.streak || 0;
            var sessionStatus = data.sessionStatus;

            // 活跃 Session
            if (sessionStatus === 'active') {
                return 'strong';
            }

            // 持续学习 (streak >= 3)
            if (streak >= 3) {
                return 'strong';
            }

            // 有学习活动 (streak >= 1)
            if (streak >= 1) {
                return 'steady';
            }

            // 有进度但无 streak
            if (progress > 0) {
                return 'slowing';
            }

            return 'unknown';
        },

        /**
         * 确定推荐动作
         */
        _determineRecommendation: function(data) {
            var learningState = data.learningState;
            var momentum = data.momentum;
            var courseId = data.courseId;
            var moduleId = data.moduleId;
            var lessonId = data.lessonId;
            var progress = data.progress || 0;
            var sessionStatus = data.sessionStatus;

            // 活跃 Session → 继续
            if (sessionStatus === 'active' && lessonId) {
                return 'continue_current_lesson';
            }

            // 有当前 Lesson → 继续
            if (lessonId) {
                return 'continue_current_lesson';
            }

            // 有当前 Module → 继续 Module
            if (moduleId) {
                return 'resume_module';
            }

            // 有当前 Course 且进度接近完成
            if (courseId && progress >= 80) {
                return 'finish_module';
            }

            // 有当前 Course
            if (courseId) {
                return 'resume_course';
            }

            // 有已完成的课程 → 探索下一个
            if (progress >= 100) {
                return 'explore_next_course';
            }

            // 默认
            return null;
        },

        /**
         * 构建摘要
         */
        _buildSummary: function(data) {
            var parts = [];

            // 学习状态描述
            var stateLabels = {
                'unknown': 'No active learning',
                'idle': 'Ready to continue',
                'active': 'Learning in progress',
                'progressing': 'Making progress',
                'near_completion': 'Almost there!',
                'completed': 'Completed'
            };
            parts.push(stateLabels[data.learningState] || 'Ready');

            // 动量描述
            var momentumLabels = {
                'unknown': '',
                'strong': '🔥 Strong momentum',
                'steady': '📊 Steady pace',
                'slowing': '⏳ Getting started',
                'inactive': '⚡ Take the next step'
            };
            var momentumText = momentumLabels[data.momentum] || '';
            if (momentumText) {
                parts.push(momentumText);
            }

            // 推荐动作
            var recommendationLabels = {
                'continue_current_lesson': 'Continue your lesson',
                'resume_module': 'Resume module',
                'resume_course': 'Resume course',
                'finish_module': 'Finish this module',
                'explore_next_course': 'Explore your next course'
            };
            var recText = recommendationLabels[data.recommendation] || '';
            if (recText) {
                parts.push(recText);
            }

            return parts.join(' · ');
        },

        /**
         * 获取默认信号 (安全回退)
         */
        _getDefaultSignals: function() {
            return {
                learningState: 'unknown',
                momentum: 'unknown',
                recommendation: null,
                summary: 'Ready to learn',
                timestamp: Date.now()
            };
        }

    };  // ← ExperienceIntelligence 对象结束

    // ============================================================
    // 4. EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ExperienceIntelligence = ExperienceIntelligence;

    console.log('[ExperienceIntelligence] Module loaded (Part 61.1)');

    // ============================================================
    // 5. AUTO INIT
    // ============================================================

    function autoInit() {
        if (!ExperienceIntelligence.initialized) {
            ExperienceIntelligence.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 500);
        });
    }

})();
