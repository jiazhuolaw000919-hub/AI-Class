// ===========================================
// curriculumGenerator.js
// 实时自适应课程生成器（Phase 73 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CurriculumGenerator = {
    _initialized: false,

    strategies: ['shortest', 'mastery-first', 'weakness-targeted', 'project-driven'],

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[CurriculumGen] Generator initialized.');
        return this;
    },

    generate: async function(strategy, options) {
        strategy = strategy || 'mastery-first';
        options = options || {};

        if (this.strategies.indexOf(strategy) === -1) {
            console.warn('[CurriculumGen] Unknown strategy:', strategy, 'using mastery-first');
            strategy = 'mastery-first';
        }

        console.log('[CurriculumGen] Generating course with strategy:', strategy);

        try {
            // 1. 收集用户状态
            var userState = {};
            if (LawAIApp.LearningStateManager && typeof LawAIApp.LearningStateManager.getState === 'function') {
                userState = LawAIApp.LearningStateManager.getState() || {};
            }

            // 2. 调用核心生成
            var course = null;
            if (LawAIApp.AdaptiveCourseEngine && typeof LawAIApp.AdaptiveCourseEngine.generateCourse === 'function') {
                course = await LawAIApp.AdaptiveCourseEngine.generateCourse(strategy, {
                    ...options,
                    userState: userState
                });
            }

            if (!course) {
                // 使用备用生成
                course = this._generateFallbackCourse(strategy);
            }

            // 3. 编译为学习流
            var stream = null;
            if (LawAIApp.RealTimeLearningCompiler && typeof LawAIApp.RealTimeLearningCompiler.compileLessonStream === 'function') {
                stream = await LawAIApp.RealTimeLearningCompiler.compileLessonStream(strategy);
            }

            if (!stream) {
                stream = this._generateFallbackStream(course);
            }

            LawAIApp.EventBus?.emit?.('CurriculumGenerated', { course: course, stream: stream });
            return { course: course, stream: stream };

        } catch (err) {
            console.error('[CurriculumGen] Generation failed:', err);
            return this._generateFallbackAll();
        }
    },

    _generateFallbackCourse: function(strategy) {
        return {
            id: 'fallback_course_' + Date.now(),
            title: strategy.charAt(0).toUpperCase() + strategy.slice(1) + ' Course',
            description: 'AI-generated course using ' + strategy + ' strategy.',
            modules: [
                { name: 'Module 1: Core Concepts', lessons: ['Lesson 1', 'Lesson 2', 'Lesson 3'] },
                { name: 'Module 2: Practical Application', lessons: ['Lesson 4', 'Lesson 5'] }
            ],
            created_by_ai: true
        };
    },

    _generateFallbackStream: function(course) {
        return {
            lessons: ['day-1', 'day-2', 'day-3'],
            totalMinutes: 30,
            generatedAt: new Date().toISOString()
        };
    },

    _generateFallbackAll: function() {
        var course = this._generateFallbackCourse('mastery-first');
        var stream = this._generateFallbackStream(course);
        return { course: course, stream: stream };
    },

    generateWeaknessCourse: async function() {
        return this.generate('weakness-targeted');
    },

    generateGoalAlignedCourse: async function() {
        return this.generate('mastery-first');
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            strategies: this.strategies
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CurriculumGenerator && typeof LawAIApp.CurriculumGenerator.init === 'function') {
        LawAIApp.CurriculumGenerator.init();
    }
}, 500);

console.log('[CurriculumGen] CurriculumGenerator V2.0 ready');
