// js/calendar/CalendarEventAdapter.js
// Part 104: Calendar → Core Events
// Calendar 发送日程事件，不解释学习含义

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarEventAdapter = {

    /**
     * 发送日程创建事件
     */
    sendScheduleCreated: function(eventData) {
        this._emitEvent('SCHEDULE_CREATED', {
            itemId: eventData.itemId || null,
            title: eventData.title || 'Learning Session',
            start: eventData.start || null,
            end: eventData.end || null,
            duration: eventData.duration || 30,
            source: eventData.source || 'calendar',
            context: eventData.context || {}
        });
    },

    /**
     * 发送日程更新事件
     */
    sendScheduleUpdated: function(eventId, updates) {
        this._emitEvent('SCHEDULE_UPDATED', {
            eventId: eventId,
            updates: updates || {},
            context: {}
        });
    },

    /**
     * 发送日程移动事件
     */
    sendScheduleMoved: function(eventId, previousStart, previousEnd, newStart, newEnd) {
        this._emitEvent('SCHEDULE_MOVED', {
            eventId: eventId,
            previousStart: previousStart || null,
            previousEnd: previousEnd || null,
            newStart: newStart || null,
            newEnd: newEnd || null,
            context: {}
        });
    },

    /**
     * 发送日程重新安排事件
     */
    sendScheduleRescheduled: function(eventId, previousStart, previousEnd, newStart, newEnd, reason) {
        this._emitEvent('SCHEDULE_RESCHEDULED', {
            eventId: eventId,
            previousStart: previousStart || null,
            previousEnd: previousEnd || null,
            newStart: newStart || null,
            newEnd: newEnd || null,
            reason: reason || null,
            context: {}
        });
    },

    /**
     * 发送日程取消事件
     */
    sendScheduleCancelled: function(eventId, reason) {
        this._emitEvent('SCHEDULE_CANCELLED', {
            eventId: eventId,
            reason: reason || null,
            context: {}
        });
    },

    /**
     * 发送日程完成事件
     * 注意：这只是日程完成，不是学习完成
     */
    sendScheduleCompleted: function(eventId) {
        this._emitEvent('SCHEDULE_COMPLETED', {
            eventId: eventId,
            context: {}
        });
    },

    /**
     * 发送日程跳过事件
     */
    sendScheduleSkipped: function(eventId, reason) {
        this._emitEvent('SCHEDULE_SKIPPED', {
            eventId: eventId,
            reason: reason || null,
            context: {}
        });
    },

    /**
     * 发送日程推迟事件
     */
    sendScheduleDeferred: function(eventId, newTime) {
        this._emitEvent('SCHEDULE_DEFERRED', {
            eventId: eventId,
            newTime: newTime || null,
            context: {}
        });
    },

    /**
     * 发送日历查看事件（仅在有意查看时）
     */
    sendCalendarViewed: function(viewMode, dateRange) {
        this._emitEvent('CALENDAR_VIEWED', {
            viewMode: viewMode || 'week',
            dateRange: dateRange || null,
            context: {}
        });
    },

    /**
     * 内部：发送事件
     */
    _emitEvent: function(eventType, payload) {
        var event = new CustomEvent(eventType, {
            detail: {
                eventId: 'cal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                source: 'calendar',
                actor: 'learner',
                timestamp: new Date().toISOString(),
                eventType: eventType,
                payload: payload || {},
                schemaVersion: '1.0.0'
            }
        });

        document.dispatchEvent(event);
        window.dispatchEvent(event);

        if (window.LawAIApp?.EventBus?.emit) {
            window.LawAIApp.EventBus.emit(eventType, event.detail);
        }

        console.log('[CalendarEventAdapter] Event emitted:', eventType);
    },

    /**
     * 验证事件
     */
    validateEvent: function(eventType, payload) {
        var required = ['eventId', 'source', 'actor', 'timestamp', 'eventType', 'schemaVersion'];
        var detail = payload._detail || payload;

        for (var i = 0; i < required.length; i++) {
            if (!detail[required[i]]) {
                console.warn('[CalendarEventAdapter] Validation failed: missing ' + required[i]);
                return false;
            }
        }

        if (detail.source !== 'calendar') {
            console.warn('[CalendarEventAdapter] Validation failed: source must be calendar');
            return false;
        }

        return true;
    }
};
