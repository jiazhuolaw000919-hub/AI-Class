// js/calendar/CalendarSurfaceAdapter.js
// Part 104: Core → Calendar Surface Adapter
// Calendar = Scheduling Authority, NOT Learning Intelligence

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarSurfaceAdapter = {

    /**
     * 将 Core Intelligence 结果转换为 Calendar 安全数据
     * @param {Object} coreResult - Core Intelligence 输出
     * @param {Object} scheduleState - 现有的日程状态
     * @returns {Object} Calendar Surface 安全数据
     */
    adapt: function(coreResult, scheduleState) {
        if (!coreResult) {
            return this._getEmptyState();
        }

        return {
            learner: this._adaptLearner(coreResult),
            learningOptions: this._adaptLearningOptions(coreResult),
            currentJourney: this._adaptCurrentJourney(coreResult),
            schedule: this._adaptSchedule(scheduleState),
            preferences: this._adaptPreferences(coreResult),
            system: this._adaptSystem(coreResult)
        };
    },

    _adaptLearner: function(coreResult) {
        var goals = coreResult.goals || [];
        return {
            goals: goals.map(function(g) {
                return { id: g.id, title: g.title || g.name };
            })
        };
    },

    /**
     * 从 Core 提取学习选项（不计算推荐）
     * Core 提供推荐，Calendar 只做日程呈现
     */
    _adaptLearningOptions: function(coreResult) {
        var recommendation = coreResult.recommendation || {};
        var recommendations = coreResult.recommendations || [];
        var items = [];

        // 如果有主要推荐
        if (recommendation.hasRecommendation && recommendation.recommendation) {
            var rec = recommendation.recommendation;
            items.push({
                itemId: rec.id || 'rec_' + Date.now(),
                title: rec.title || 'Recommended',
                type: rec.type || 'learning',
                estimatedDuration: rec.estimatedDuration || 30,
                recommendationStatus: 'primary',
                priority: rec.priority || 'medium',
                reason: recommendation.explanation ? recommendation.explanation.text : null,
                confidence: this._normalizeConfidence(recommendation.confidence),
                source: 'core'
            });
        }

        // 添加替代选项
        if (recommendation.alternatives && recommendation.alternatives.length > 0) {
            for (var i = 0; i < Math.min(recommendation.alternatives.length, 3); i++) {
                var alt = recommendation.alternatives[i];
                items.push({
                    itemId: alt.id || 'alt_' + Date.now() + '_' + i,
                    title: alt.title || 'Alternative',
                    type: alt.type || 'learning',
                    estimatedDuration: alt.estimatedDuration || 30,
                    recommendationStatus: 'alternative',
                    priority: alt.priority || 'low',
                    reason: alt.reason || null,
                    confidence: 'Moderate',
                    source: 'core'
                });
            }
        }

        // 如果没有任何推荐，从路径中提取
        if (items.length === 0) {
            var path = coreResult.path || {};
            var pathItems = path.items || [];
            if (pathItems.length > 0) {
                var nextItem = pathItems[path.currentIndex] || pathItems[0];
                if (nextItem) {
                    items.push({
                        itemId: nextItem.id || 'path_' + Date.now(),
                        title: nextItem.title || 'Continue Learning',
                        type: 'path',
                        estimatedDuration: 30,
                        recommendationStatus: 'suggested',
                        priority: 'medium',
                        reason: 'Based on your learning path',
                        confidence: 'Moderate',
                        source: 'core'
                    });
                }
            }
        }

        return items;
    },

    _adaptCurrentJourney: function(coreResult) {
        var position = coreResult.position || {};
        var path = coreResult.path || {};
        return {
            itemId: position.lessonId || position.moduleId || null,
            title: position.courseTitle || 'Current Journey',
            available: !!(position.courseId || position.moduleId || position.lessonId),
            progress: path.progress || 0
        };
    },

    /**
     * 日程状态来自 Calendar 自身，不是 Core
     * 这里做合并，不覆盖
     */
    _adaptSchedule: function(scheduleState) {
        scheduleState = scheduleState || {};
        return {
            events: scheduleState.events || [],
            availableWindows: scheduleState.availableWindows || [],
            conflicts: scheduleState.conflicts || [],
            hasSchedule: (scheduleState.events && scheduleState.events.length > 0) || false,
            lastUpdated: scheduleState.lastUpdated || null
        };
    },

    _adaptPreferences: function(coreResult) {
        var settings = coreResult.settings || {};
        return {
            preferredTimes: settings.preferredStudyTimes || [],
            preferredDuration: settings.preferredSessionDuration || 30,
            preferredDays: settings.preferredStudyDays || [],
            breakDuration: settings.breakDuration || 5
        };
    },

    _adaptSystem: function(coreResult) {
        var metadata = coreResult.metadata || {};
        return {
            freshness: metadata.freshness || 'unknown',
            confidence: metadata.confidence || 'low',
            degraded: metadata.degraded || false,
            partial: metadata.partial || false,
            version: metadata.version || '1.0.0'
        };
    },

    _normalizeConfidence: function(confidence) {
        var map = {
            'high': 'High',
            'medium': 'Moderate',
            'low': 'Low',
            'unknown': 'Unknown'
        };
        return map[confidence] || 'Moderate';
    },

    _getEmptyState: function() {
        return {
            learner: { goals: [] },
            learningOptions: [],
            currentJourney: { itemId: null, title: null, available: false, progress: 0 },
            schedule: { events: [], availableWindows: [], conflicts: [], hasSchedule: false, lastUpdated: null },
            preferences: { preferredTimes: [], preferredDuration: 30, preferredDays: [], breakDuration: 5 },
            system: { freshness: 'unknown', confidence: 'low', degraded: false, partial: false, version: '1.0.0' }
        };
    }
};
