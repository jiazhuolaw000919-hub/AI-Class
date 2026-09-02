// js/dashboard/DashboardViewModel.js
// Part 102: Dashboard View Model

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DashboardViewModel = {
    
    /**
     * 将 Surface 数据转换为渲染就绪格式
     * @param {Object} surfaceData - DashboardSurfaceAdapter 输出
     * @returns {Object} 渲染就绪数据
     */
    toRenderModel: function(surfaceData) {
        if (!surfaceData) {
            return this._getEmptyRenderModel();
        }

        return {
            // 问候
            greeting: this._getGreeting(),
            
            // Hero
            hero: this._buildHero(surfaceData),
            
            // 继续学习
            continueLearning: this._buildContinueLearning(surfaceData),
            
            // 进度
            progress: this._buildProgress(surfaceData),
            
            // 推荐（自适应）
            recommendation: this._buildRecommendation(surfaceData),
            
            // 洞察
            insight: this._buildInsight(surfaceData),
            
            // 优先级指示器
            priority: this._buildPriority(surfaceData),
            
            // 判断提示
            judgement: this._buildJudgement(surfaceData),
            
            // 反思
            reflection: this._buildReflection(surfaceData),
            
            // 系统状态
            system: surfaceData.system || {}
        };
    },

    _getGreeting: function() {
        var hour = new Date().getHours();
        if (hour < 12) return '🌅 Good morning';
        if (hour < 17) return '☀️ Good afternoon';
        if (hour < 21) return '🌇 Good evening';
        return '🌙 Good night';
    },

    _buildHero: function(data) {
        var learnerName = data.learner?.identity || 'Learner';
        var progress = data.progress?.overall || 0;
        var hasStarted = progress > 0;

        return {
            name: learnerName,
            message: hasStarted ? 'Continue building your knowledge.' : 'Ready to start your AI journey?',
            cta: hasStarted ? 'Continue Learning' : 'Explore Academy',
            ctaLink: hasStarted ? '/pages/lesson.html' : '/pages/academy.html',
            level: 1,
            xp: 0,
            streak: 0
        };
    },

    _buildContinueLearning: function(data) {
        var action = data.primaryAction || {};
        if (!action.available) {
            return null;
        }
        return {
            title: action.label || 'Continue',
            destination: action.destination || '/pages/academy.html',
            reason: action.reason || null
        };
    },

    _buildProgress: function(data) {
        var progress = data.progress || {};
        return {
            overall: progress.overall || 0,
            hasProgress: progress.overall > 0
        };
    },

    _buildRecommendation: function(data) {
        var rec = data.recommendation || {};
        if (!rec.available) {
            return null;
        }
        return {
            title: rec.item?.title || 'Recommended',
            description: rec.item?.description || '',
            reason: rec.reason || null,
            confidence: rec.confidence || 'Moderate',
            alternatives: rec.alternatives || []
        };
    },

    _buildInsight: function(data) {
        var insight = data.insight || {};
        if (!insight.available) {
            return null;
        }
        return {
            message: insight.message || null,
            evidence: insight.evidenceSummary || null
        };
    },

    _buildPriority: function(data) {
        var priority = data.priority || {};
        if (!priority.available) {
            return null;
        }
        return {
            level: priority.level || 'background',
            reason: priority.reason || null
        };
    },

    _buildJudgement: function(data) {
        var judgement = data.judgement || {};
        if (!judgement.available) {
            return null;
        }
        return {
            prompt: judgement.prompt || null,
            context: judgement.context || null
        };
    },

    _buildReflection: function(data) {
        var reflection = data.reflection || {};
        if (!reflection.available) {
            return null;
        }
        return {
            prompt: reflection.prompt || null
        };
    },

    _getEmptyRenderModel: function() {
        return {
            greeting: '👋 Welcome',
            hero: { name: 'Learner', message: 'Start your learning journey.', cta: 'Explore Academy', ctaLink: '/pages/academy.html', level: 1, xp: 0, streak: 0 },
            continueLearning: null,
            progress: { overall: 0, hasProgress: false },
            recommendation: null,
            insight: null,
            priority: null,
            judgement: null,
            reflection: null,
            system: { freshness: 'unknown', confidence: 'low', degraded: false, partial: false }
        };
    }
};
