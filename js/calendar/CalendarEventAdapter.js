// js/calendar/CalendarEventAdapter.js
// Part 104 + Part 177: Calendar → EventBus 事件适配器
// 只发送事件，不计算智能

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarEventAdapter = {

    _send: function(eventName, payload) {
        try {
            var event = new CustomEvent(eventName, {
                detail: Object.assign({
                    source: 'calendar-surface',
                    actor: 'learner',
                    timestamp: new Date().toISOString(),
                    schemaVersion: '1.0.0'
                }, payload || {})
            });
            document.dispatchEvent(event);
            window.dispatchEvent(event);
            if (window.LawAIApp?.EventBus?.emit) {
                window.LawAIApp.EventBus.emit(eventName, event.detail);
            }
        } catch (e) {}
    },

    // Part 104
    sendCalendarViewed: function(viewMode) {
        this._send('CALENDAR_VIEWED', { viewMode: viewMode });
    },

    sendScheduleCreated: function(data) {
        this._send('CALENDAR_SCHEDULE_CREATED', data || {});
    },

    sendScheduleCancelled: function(scheduleId, reason) {
        this._send('CALENDAR_SCHEDULE_CANCELLED', { scheduleId: scheduleId, reason: reason });
    },

    // Part 177 新增
    sendScheduleEdited: function(scheduleId, updates) {
        this._send('CALENDAR_SCHEDULE_EDITED', {
            scheduleId: scheduleId,
            updates: updates || {}
        });
    },

    sendScheduleRescheduled: function(scheduleId, newStartAt) {
        this._send('CALENDAR_SCHEDULE_RESCHEDULED', {
            scheduleId: scheduleId,
            newStartAt: newStartAt
        });
    },

    sendActivityOpened: function(scheduleId, activityRef) {
        this._send('CALENDAR_ACTIVITY_OPENED', {
            scheduleId: scheduleId,
            activityRef: activityRef
        });
    }
};

console.log('[CalendarEventAdapter] ✅ Loaded (Part 177)');
