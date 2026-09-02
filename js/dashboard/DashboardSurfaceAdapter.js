// js/dashboard/DashboardSurfaceAdapter.js
// Part 102: Core → Dashboard Surface Adapter

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DashboardSurfaceAdapter = {
    
    /**
     * 将 Core Intelligence 结果转换为 Dashboard 安全数据
     * @param {Object} coreResult - Core Intelligence 输出
     * @returns {Object} Dashboard Surface 安全数据
     */
    adapt: function(coreResult) {
        if (!coreResult) {
            return this._getEmptyState();
        }

        return {
            learner: this._adaptLearner(coreResult),
            journey: this._adaptJourney(coreResult),
            progress: this._adaptProgress(coreResult),
            primaryAction: this._adaptPrimaryAction(coreResult),
            recommendation: this._adaptRecommendation(coreResult),
            insight: this._adaptInsight(coreResult),
            priority: this._adaptPriority(coreResult),
            judgement: this._adaptJudgement(coreResult),
            reflection: this._adaptReflection(coreResult),
            system: this._adaptSystem(coreResult)
        };
    },

    _adaptLearner: function(coreResult) {
        var state = coreResult.state || {};
        var goals = coreResult.goals || [];
        return {
            identity: 'Learner',
            goals: goals.map(function(g) {
                return { id: g.id, title: g.title || g.name };
            })
        };
    },

    _adaptJourney: function(coreResult) {
        var position = coreResult.position || {};
        var path = coreResult.path || {};
        return {
            current: {
                course: position.courseTitle || 'Current Course',
                module: position.moduleId || null,
                lesson: position.lessonId || null
            },
            next: path.nextItem || null,
            available: path.items || []
        };
    },

    _adaptProgress: function(coreResult) {
        var progress = coreResult.progress || {};
        return {
            overall: progress.overall || 0,
            currentLearning: progress.currentLearning || null,
            recent: progress.recent || null
        };
    },

    _adaptPrimaryAction: function(coreResult) {
        var action = coreResult.primaryAction || {};
        return {
            available: !!action.label,
            label: action.label || null,
            destination: action.destination || null,
            reason: action.reason || null
        };
    },

    _adaptRecommendation: function(coreResult) {
        var rec = coreResult.recommendation || {};
        return {
            available: rec.hasRecommendation || false,
            item: rec.recommendation || null,
            reason: rec.explanation ? rec.explanation.text : null,
            confidence: this._normalizeConfidence(rec.confidence),
            alternatives: rec.alternatives || []
        };
    },

    _adaptInsight: function(coreResult) {
        var insight = coreResult.insight || {};
        return {
            available: !!insight.message,
            message: insight.message || null,
            evidenceSummary: insight.evidenceSummary || null
        };
    },

    _adaptPriority: function(coreResult) {
        var priority = coreResult.priority || {};
        return {
            available: !!priority.level,
            level: priority.level || null,
            reason: priority.reason || null
        };
    },

    _adaptJudgement: function(coreResult) {
        var judgement = coreResult.judgement || {};
        return {
            available: !!judgement.prompt,
            prompt: judgement.prompt || null,
            context: judgement.context || null
        };
    },

    _adaptReflection: function(coreResult) {
        var reflection = coreResult.reflection || {};
        return {
            available: !!reflection.prompt,
            prompt: reflection.prompt || null
        };
    },

    _adaptSystem: function(coreResult) {
        var metadata = coreResult.metadata || {};
        return {
            freshness: metadata.freshness || 'unknown',
            confidence: metadata.confidence || 'low',
            degraded: metadata.degraded || false,
            partial: metadata.partial || false
        };
    },

    _normalizeConfidence: function(confidence) {
        var map = {
            'high': 'High',
            'medium': 'Moderate',
            'low': 'Low',
            'unknown': 'Unknown'
        };
        return map[confidence] || 'Unknown';
    },

    _getEmptyState: function() {
        return {
            learner: { identity: 'Learner', goals: [] },
            journey: { current: { course: null, module: null, lesson: null }, next: null, available: [] },
            progress: { overall: 0, currentLearning: null, recent: null },
            primaryAction: { available: false, label: null, destination: null, reason: null },
            recommendation: { available: false, item: null, reason: null, confidence: null, alternatives: [] },
            insight: { available: false, message: null, evidenceSummary: null },
            priority: { available: false, level: null, reason: null },
            judgement: { available: false, prompt: null, context: null },
            reflection: { available: false, prompt: null },
            system: { freshness: 'unknown', confidence: 'low', degraded: false, partial: false }
        };
    }
};
