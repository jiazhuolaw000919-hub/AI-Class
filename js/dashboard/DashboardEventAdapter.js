// js/dashboard/DashboardEventAdapter.js
// Part 102: Dashboard → Core Events

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DashboardEventAdapter = {
    
    /**
     * 发送推荐接受事件
     */
    sendRecommendationAccepted: function(recommendationId, context) {
        this._emitEvent('RECOMMENDATION_ACCEPTED', {
            recommendationId: recommendationId,
            context: context || {}
        });
    },

    /**
     * 发送推荐拒绝事件
     */
    sendRecommendationRejected: function(recommendationId, reason, context) {
        this._emitEvent('RECOMMENDATION_REJECTED', {
            recommendationId: recommendationId,
            reason: reason || null,
            context: context || {}
        });
    },

    /**
     * 发送推荐推迟事件
     */
    sendRecommendationDeferred: function(recommendationId, context) {
        this._emitEvent('RECOMMENDATION_DEFERRED', {
            recommendationId: recommendationId,
            context: context || {}
        });
    },

    /**
     * 发送替代选择事件
     */
    sendAlternativeSelected: function(alternativeId, recommendationId, context) {
        this._emitEvent('RECOMMENDATION_ALTERNATIVE_SELECTED', {
            alternativeId: alternativeId,
            recommendationId: recommendationId,
            context: context || {}
        });
    },

    /**
     * 发送学习者判断提交事件
     */
    sendJudgementSubmitted: function(targetId, judgement, confidence, context) {
        this._emitEvent('LEARNER_JUDGEMENT_SUBMITTED', {
            targetId: targetId,
            judgement: judgement,
            confidence: confidence,
            context: context || {}
        });
    },

    /**
     * 发送反思提交事件
     */
    sendReflectionSubmitted: function(reflection, context) {
        this._emitEvent('REFLECTION_SUBMITTED', {
            reflection: reflection,
            context: context || {}
        });
    },

    /**
     * 发送主操作选择事件
     */
    sendPrimaryActionSelected: function(actionId, targetId, context) {
        this._emitEvent('PRIMARY_ACTION_SELECTED', {
            actionId: actionId,
            targetId: targetId,
            context: context || {}
        });
    },

    /**
     * 内部：发送事件
     */
    _emitEvent: function(eventType, payload) {
        var event = new CustomEvent(eventType, {
            detail: {
                eventId: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                source: 'dashboard',
                actor: 'learner',
                timestamp: new Date().toISOString(),
                eventType: eventType,
                payload: payload,
                schemaVersion: '1.0.0'
            }
        });
        document.dispatchEvent(event);
        window.dispatchEvent(event);

        // 如果 EventBus 存在，也发送
        if (window.LawAIApp?.EventBus?.emit) {
            window.LawAIApp.EventBus.emit(eventType, event.detail);
        }

        console.log('[DashboardEventAdapter] Event emitted:', eventType);
    }
};
