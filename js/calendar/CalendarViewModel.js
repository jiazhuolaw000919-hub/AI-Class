// js/calendar/CalendarViewModel.js
// Part 104: Calendar View Model
// 只做格式化/呈现，不计算智能

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CalendarViewModel = {

    /**
     * 将 Surface 数据转换为渲染就绪格式
     * @param {Object} surfaceData - CalendarSurfaceAdapter 输出
     * @returns {Object} 渲染就绪数据
     */
    toRenderModel: function(surfaceData) {
        if (!surfaceData) {
            return this._getEmptyRenderModel();
        }

        var now = new Date();
        var viewMode = surfaceData.viewMode || 'week';

        return {
            // 视图模式
            viewMode: viewMode,

            // 当前日期范围
            dateRange: this._buildDateRange(viewMode, now),

            // 学习者信息
            learner: this._buildLearner(surfaceData),

            // 学习选项（来自 Core，不计算）
            learningOptions: this._buildLearningOptions(surfaceData),

            // 当前旅程（来自 Core）
            currentJourney: this._buildCurrentJourney(surfaceData),

            // 日程事件（来自 Calendar 自身）
            events: this._buildEvents(surfaceData),

            // 可用时间窗口
            availableWindows: this._buildAvailableWindows(surfaceData),

            // 冲突
            conflicts: this._buildConflicts(surfaceData),

            // 建议日程
            suggestedSchedule: this._buildSuggestedSchedule(surfaceData),

            // 偏好
            preferences: surfaceData.preferences || {},

            // 系统状态
            system: surfaceData.system || { freshness: 'unknown', confidence: 'low' },

            // 空状态
            isEmpty: !surfaceData.schedule?.hasSchedule && (!surfaceData.learningOptions || surfaceData.learningOptions.length === 0)
        };
    },

    _buildDateRange: function(viewMode, now) {
        var start = new Date(now);
        var end = new Date(now);

        switch (viewMode) {
            case 'day':
                // 今天
                break;
            case 'week':
                start.setDate(now.getDate() - now.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'month':
                start.setDate(1);
                end.setMonth(start.getMonth() + 1);
                end.setDate(0);
                break;
            default:
                start.setDate(now.getDate() - now.getDay());
                end.setDate(start.getDate() + 6);
        }

        return {
            start: start.toISOString(),
            end: end.toISOString(),
            label: this._formatDateRange(start, end, viewMode)
        };
    },

    _formatDateRange: function(start, end, viewMode) {
        var options = { month: 'short', day: 'numeric' };
        switch (viewMode) {
            case 'day':
                return start.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            case 'week':
                return start.toLocaleDateString('en-US', options) + ' - ' + end.toLocaleDateString('en-US', options);
            case 'month':
                return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            default:
                return start.toLocaleDateString('en-US', options) + ' - ' + end.toLocaleDateString('en-US', options);
        }
    },

    _buildLearner: function(data) {
        var goals = data.learner?.goals || [];
        return {
            goals: goals,
            hasGoals: goals.length > 0
        };
    },

    /**
     * 学习选项直接来自 Core，Calendar 不重新排序/重新计算
     * 只做格式化
     */
    _buildLearningOptions: function(data) {
        var options = data.learningOptions || [];
        return options.map(function(opt) {
            return {
                id: opt.itemId,
                title: opt.title,
                type: opt.type,
                duration: opt.estimatedDuration || 30,
                priority: opt.priority || 'medium',
                confidence: opt.confidence || 'Moderate',
                reason: opt.reason || null,
                status: opt.recommendationStatus || 'suggested',
                formattedDuration: this._formatDuration(opt.estimatedDuration || 30)
            };
        }.bind(this));
    },

    _formatDuration: function(minutes) {
        if (minutes < 60) return minutes + ' min';
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        return hours + 'h' + (mins > 0 ? ' ' + mins + 'm' : '');
    },

    _buildCurrentJourney: function(data) {
        var journey = data.currentJourney || {};
        return {
            id: journey.itemId,
            title: journey.title || 'No active journey',
            available: journey.available || false,
            progress: journey.progress || 0
        };
    },

    /**
     * 日程事件来自 Calendar 自身，不是 Core
     * 只做格式化
     */
    _buildEvents: function(data) {
        var events = data.schedule?.events || [];
        return events.map(function(event) {
            return {
                id: event.id || 'evt_' + Date.now(),
                title: event.title || 'Learning Session',
                type: event.type || 'learning',
                start: event.start || null,
                end: event.end || null,
                duration: event.duration || 30,
                status: event.status || 'scheduled', // scheduled | completed | cancelled | missed
                itemId: event.itemId || null,
                formattedTime: this._formatTime(event.start, event.end),
                formattedDuration: this._formatDuration(event.duration || 30),
                isPast: event.end ? new Date(event.end) < new Date() : false,
                isToday: event.start ? this._isToday(new Date(event.start)) : false
            };
        }.bind(this));
    },

    _formatTime: function(start, end) {
        if (!start) return 'Time TBD';
        var startDate = new Date(start);
        var endDate = end ? new Date(end) : new Date(startDate.getTime() + 30 * 60000);
        var options = { hour: 'numeric', minute: '2-digit' };
        return startDate.toLocaleTimeString('en-US', options) + ' - ' + endDate.toLocaleTimeString('en-US', options);
    },

    _isToday: function(date) {
        var today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    },

    _buildAvailableWindows: function(data) {
        var windows = data.schedule?.availableWindows || [];
        return windows.map(function(w) {
            return {
                start: w.start || null,
                end: w.end || null,
                duration: w.duration || 0,
                formatted: w.start ? this._formatTime(w.start, w.end) : 'All day'
            };
        }.bind(this));
    },

    _buildConflicts: function(data) {
        var conflicts = data.schedule?.conflicts || [];
        return conflicts.map(function(c) {
            return {
                eventId: c.eventId || null,
                conflictWith: c.conflictWith || null,
                description: c.description || 'Schedule conflict detected',
                start: c.start || null,
                end: c.end || null
            };
        });
    },

    /**
     * 建议日程：Core 推荐 + Calendar 时间匹配
     * Calendar 不决定推荐，只建议时间
     */
    _buildSuggestedSchedule: function(data) {
        var options = data.learningOptions || [];
        var availableWindows = data.schedule?.availableWindows || [];

        if (options.length === 0 || availableWindows.length === 0) {
            return null;
        }

        var primaryOption = options.find(function(o) {
            return o.recommendationStatus === 'primary';
        }) || options[0];

        // 找到第一个可用的时间窗口
        var firstWindow = availableWindows[0] || null;

        if (!firstWindow) {
            return null;
        }

        return {
            itemId: primaryOption.itemId,
            title: primaryOption.title,
            duration: primaryOption.estimatedDuration || 30,
            suggestedStart: firstWindow.start || null,
            suggestedEnd: firstWindow.end || null,
            reason: primaryOption.reason || 'Based on your availability',
            formattedTime: this._formatTime(firstWindow.start, firstWindow.end)
        };
    },

    _getEmptyRenderModel: function() {
        return {
            viewMode: 'week',
            dateRange: { start: null, end: null, label: 'No date range' },
            learner: { goals: [], hasGoals: false },
            learningOptions: [],
            currentJourney: { id: null, title: null, available: false, progress: 0 },
            events: [],
            availableWindows: [],
            conflicts: [],
            suggestedSchedule: null,
            preferences: {},
            system: { freshness: 'unknown', confidence: 'low' },
            isEmpty: true
        };
    }
};
