// /js/calendar/CalendarAuthority.js
// Part 163 — 唯一的日程权威 (后台加载版)
// 支持懒加载、状态检查、优雅降级

(function() {
    'use strict';

    // ============================================================
    // 状态管理
    // ============================================================
    var _schedules = [];
    var _initialized = false;
    var _loading = false;
    var _readyCallbacks = [];
    var _version = '1.0.0';
    var _storageKey = 'calendarAuthority_schedules_v2';

    // ============================================================
    // 核心 API
    // ============================================================
    var CalendarAuthority = {

        // ---- 状态检查 ----
        get initialized() { return _initialized; },
        get loading() { return _loading; },
        get version() { return _version; },
        get isReady() { return _initialized && !_loading; },

        // ---- 初始化（后台加载） ----
        init: function() {
            if (_initialized) {
                console.log('[CalendarAuthority] Already initialized');
                return this;
            }

            if (_loading) {
                console.log('[CalendarAuthority] Already loading...');
                return this;
            }

            console.log('[CalendarAuthority] 🚀 Starting background load...');
            _loading = true;

            // 异步加载数据
            this._loadFromStorageAsync();

            return this;
        },

        // ---- 就绪回调 ----
        onReady: function(callback) {
            if (_initialized) {
                callback(this);
                return;
            }
            _readyCallbacks.push(callback);
        },

        // ---- 命令：创建日程 ----
        create: function(command) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            if (!command.activityRef && !command.title) {
                return { success: false, error: 'activityRef or title required', code: 'INVALID_INPUT' };
            }
            if (!command.startAt) {
                return { success: false, error: 'startAt required', code: 'INVALID_INPUT' };
            }

            var conflict = this._detectConflict(command.startAt, command.duration);
            if (conflict) {
                return { success: false, error: 'Schedule conflict', conflict: conflict, code: 'CONFLICT' };
            }

            var schedule = {
                scheduleId: 'sch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                activityRef: command.activityRef || null,
                title: command.title || 'Learning Session',
                startAt: command.startAt,
                duration: command.duration || 30,
                endAt: this._calculateEndAt(command.startAt, command.duration || 30),
                timezone: command.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                status: 'SCHEDULED',
                source: command.source || 'learner',
                recommendationRef: command.recommendationRef || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                _history: []
            };

            _schedules.push(schedule);
            this._saveToStorage();

            this._emit('CALENDAR_SCHEDULE_CREATED', {
                scheduleId: schedule.scheduleId,
                title: schedule.title,
                startAt: schedule.startAt,
                status: schedule.status
            });

            return { success: true, schedule: schedule };
        },

        // ---- 命令：重新安排 ----
        reschedule: function(scheduleId, newStartAt, newDuration) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            var schedule = this._findSchedule(scheduleId);
            if (!schedule) {
                return { success: false, error: 'Schedule not found', code: 'NOT_FOUND' };
            }

            var previous = {
                startAt: schedule.startAt,
                duration: schedule.duration,
                endAt: schedule.endAt
            };

            var conflict = this._detectConflict(newStartAt, newDuration || schedule.duration, scheduleId);
            if (conflict) {
                return { success: false, error: 'Schedule conflict', conflict: conflict, code: 'CONFLICT' };
            }

            schedule.startAt = newStartAt;
            schedule.duration = newDuration || schedule.duration;
            schedule.endAt = this._calculateEndAt(newStartAt, schedule.duration);
            schedule.status = 'RESCHEDULED';
            schedule.updatedAt = new Date().toISOString();
            schedule.version = (schedule.version || 1) + 1;
            schedule._history.push({
                previous: previous,
                changedAt: new Date().toISOString()
            });

            this._saveToStorage();
            this._emit('CALENDAR_ACTIVITY_RESCHEDULED', {
                scheduleId: scheduleId,
                previousStartAt: previous.startAt,
                newStartAt: newStartAt
            });

            return { success: true, schedule: schedule };
        },

        // ---- 命令：取消 ----
        cancel: function(scheduleId, reason) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            var schedule = this._findSchedule(scheduleId);
            if (!schedule) {
                return { success: false, error: 'Schedule not found', code: 'NOT_FOUND' };
            }

            schedule.status = 'CANCELLED';
            schedule.updatedAt = new Date().toISOString();
            schedule.cancelReason = reason || null;
            schedule.version = (schedule.version || 1) + 1;

            this._saveToStorage();
            this._emit('CALENDAR_SCHEDULE_CANCELLED', {
                scheduleId: scheduleId,
                reason: reason
            });

            return { success: true, schedule: schedule };
        },

        // ---- 命令：取消安排（不同于拒绝推荐） ----
        unschedule: function(scheduleId) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            var schedule = this._findSchedule(scheduleId);
            if (!schedule) {
                return { success: false, error: 'Schedule not found', code: 'NOT_FOUND' };
            }

            schedule.status = 'UNSCHEDULED';
            schedule.updatedAt = new Date().toISOString();
            schedule.version = (schedule.version || 1) + 1;

            this._saveToStorage();
            this._emit('CALENDAR_ACTIVITY_UNSCHEDULED', {
                scheduleId: scheduleId
            });

            return { success: true, schedule: schedule };
        },

        // ---- 命令：标记时间已到（不是学习完成！） ----
        markTimeElapsed: function(scheduleId) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            var schedule = this._findSchedule(scheduleId);
            if (!schedule) {
                return { success: false, error: 'Schedule not found', code: 'NOT_FOUND' };
            }

            schedule.status = 'TIME_ELAPSED';
            schedule.updatedAt = new Date().toISOString();
            schedule.version = (schedule.version || 1) + 1;

            this._saveToStorage();
            this._emit('CALENDAR_SCHEDULE_TIME_ELAPSED', {
                scheduleId: scheduleId,
                scheduledEndAt: schedule.endAt
            });

            return { success: true, schedule: schedule };
        },

        // ---- 命令：标记错过 ----
        markMissed: function(scheduleId) {
            if (!_initialized) {
                return { success: false, error: 'CalendarAuthority not ready', code: 'NOT_READY' };
            }

            var schedule = this._findSchedule(scheduleId);
            if (!schedule) {
                return { success: false, error: 'Schedule not found', code: 'NOT_FOUND' };
            }

            schedule.status = 'MISSED';
            schedule.updatedAt = new Date().toISOString();
            schedule.version = (schedule.version || 1) + 1;

            this._saveToStorage();
            this._emit('CALENDAR_SCHEDULE_MISSED', {
                scheduleId: scheduleId,
                scheduledAt: schedule.startAt
            });

            return { success: true, schedule: schedule };
        },

        // ---- 读方法 ----
        getSchedule: function(scheduleId) {
            if (!_initialized) return null;
            return this._findSchedule(scheduleId);
        },

        getAllSchedules: function() {
            if (!_initialized) return [];
            return _schedules.slice();
        },

        getSchedulesForDate: function(date) {
            if (!_initialized) return [];

            var target = new Date(date);
            target.setHours(0, 0, 0, 0);
            var next = new Date(target);
            next.setDate(next.getDate() + 1);

            return _schedules.filter(function(s) {
                if (s.status === 'CANCELLED' || s.status === 'UNSCHEDULED') return false;
                var sDate = new Date(s.startAt);
                return sDate >= target && sDate < next;
            });
        },

        getUpcomingSchedules: function(limit) {
            if (!_initialized) return [];

            var now = new Date();
            var sorted = _schedules
                .filter(function(s) {
                    return s.status !== 'CANCELLED' && s.status !== 'UNSCHEDULED';
                })
                .sort(function(a, b) {
                    return new Date(a.startAt) - new Date(b.startAt);
                });
            return sorted.slice(0, limit || 20);
        },

        getStatusSummary: function() {
            if (!_initialized) {
                return { initialized: false, total: 0, statuses: {} };
            }

            var statuses = {};
            _schedules.forEach(function(s) {
                statuses[s.status] = (statuses[s.status] || 0) + 1;
            });

            return {
                initialized: true,
                total: _schedules.length,
                statuses: statuses,
                version: _version,
                lastUpdated: new Date().toISOString()
            };
        },

        // ---- 迁移：从旧存储导入 ----
        migrateFromLegacy: function() {
            try {
                var legacyKey = 'lawai_calendar_schedule_default';
                var legacyData = localStorage.getItem(legacyKey);
                if (!legacyData) {
                    return { success: true, migrated: 0, message: 'No legacy data found' };
                }

                var legacySchedules = JSON.parse(legacyData);
                if (!legacySchedules || legacySchedules.length === 0) {
                    return { success: true, migrated: 0, message: 'Legacy data empty' };
                }

                var migrated = 0;
                for (var i = 0; i < legacySchedules.length; i++) {
                    var old = legacySchedules[i];
                    // 检查是否已存在
                    var exists = _schedules.some(function(s) {
                        return s.scheduleId === old.id || s.title === old.title && s.startAt === (old.date + 'T' + old.startTime + ':00');
                    });
                    if (!exists) {
                        _schedules.push({
                            scheduleId: old.id || 'sch_migrated_' + Date.now() + '_' + i,
                            activityRef: old.activityRef || null,
                            title: old.title || 'Migrated Session',
                            startAt: old.date + 'T' + (old.startTime || '09:00') + ':00',
                            duration: this._calculateDuration(old.startTime || '09:00', old.endTime || '10:00'),
                            endAt: old.date + 'T' + (old.endTime || '10:00') + ':00',
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            status: old.status || 'SCHEDULED',
                            source: old.source || 'legacy',
                            recommendationRef: old.recommendationRef || null,
                            createdAt: old.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            version: 1,
                            _history: [],
                            _migrated: true
                        });
                        migrated++;
                    }
                }

                this._saveToStorage();
                console.log('[CalendarAuthority] ✅ Migrated', migrated, 'schedules from legacy');

                return { success: true, migrated: migrated };
            } catch (e) {
                console.warn('[CalendarAuthority] Migration error:', e);
                return { success: false, error: e.message };
            }
        },

        // ---- 重置 ----
        reset: function() {
            _schedules = [];
            this._saveToStorage();
            console.log('[CalendarAuthority] 🔄 Reset');
            return { success: true };
        },

        // ============================================================
        // 私有方法
        // ============================================================

        _findSchedule: function(scheduleId) {
            for (var i = 0; i < _schedules.length; i++) {
                if (_schedules[i].scheduleId === scheduleId) {
                    return _schedules[i];
                }
            }
            return null;
        },

        _calculateEndAt: function(startAt, duration) {
            var date = new Date(startAt);
            date.setMinutes(date.getMinutes() + (duration || 30));
            return date.toISOString();
        },

        _calculateDuration: function(startTime, endTime) {
            if (!startTime || !endTime) return 60;
            var start = startTime.split(':').map(Number);
            var end = endTime.split(':').map(Number);
            return (end[0] - start[0]) * 60 + (end[1] - start[1]);
        },

        _detectConflict: function(startAt, duration, excludeId) {
            var start = new Date(startAt);
            var end = new Date(start);
            end.setMinutes(end.getMinutes() + (duration || 30));

            for (var i = 0; i < _schedules.length; i++) {
                var s = _schedules[i];
                if (excludeId && s.scheduleId === excludeId) continue;
                if (s.status === 'CANCELLED' || s.status === 'UNSCHEDULED') continue;

                var sStart = new Date(s.startAt);
                var sEnd = new Date(s.endAt || this._calculateEndAt(s.startAt, s.duration || 30));

                if (start < sEnd && end > sStart) {
                    return {
                        conflictWith: s.scheduleId,
                        title: s.title,
                        start: s.startAt,
                        end: s.endAt
                    };
                }
            }
            return null;
        },

        _loadFromStorageAsync: function() {
            var self = this;

            // 使用 setTimeout 让加载在下一个 tick 执行，不阻塞 UI
            setTimeout(function() {
                try {
                    var stored = localStorage.getItem(_storageKey);
                    if (stored) {
                        var parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            _schedules = parsed;
                            console.log('[CalendarAuthority] ✅ Loaded', _schedules.length, 'schedules');
                        }
                    } else {
                        // 尝试从旧存储迁移
                        self.migrateFromLegacy();
                    }
                } catch (e) {
                    console.warn('[CalendarAuthority] Load error:', e);
                    _schedules = [];
                }

                _loading = false;
                _initialized = true;

                // 触发就绪回调
                while (_readyCallbacks.length > 0) {
                    var cb = _readyCallbacks.shift();
                    try {
                        cb(self);
                    } catch (e) {
                        console.warn('[CalendarAuthority] Callback error:', e);
                    }
                }

                // 发送就绪事件
                self._emit('CALENDAR_AUTHORITY_READY', {
                    scheduleCount: _schedules.length,
                    version: _version
                });

                console.log('[CalendarAuthority] ✅ Ready (' + _schedules.length + ' schedules)');
            }, 0);
        },

        _saveToStorage: function() {
            try {
                localStorage.setItem(_storageKey, JSON.stringify(_schedules));
            } catch (e) {
                console.warn('[CalendarAuthority] Save error:', e);
            }
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, {
                    detail: {
                        source: 'calendar-authority',
                        version: _version,
                        timestamp: new Date().toISOString(),
                        data: data || {}
                    }
                });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                // 如果有 EventBus
                if (window.LawAIApp?.EventBus?.emit) {
                    window.LawAIApp.EventBus.emit(eventName, event.detail);
                }
            } catch (e) {
                // 静默失败
            }
        },

        // ---- 调试 ----
        _debug: function() {
            return {
                initialized: _initialized,
                loading: _loading,
                scheduleCount: _schedules.length,
                storageKey: _storageKey,
                version: _version,
                readyCallbacks: _readyCallbacks.length
            };
        }
    };

    // ============================================================
    // 注册到全局
    // ============================================================

    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.CalendarAuthority = CalendarAuthority;

    // ============================================================
    // 后台自动初始化（与 AcademyLoader 模式一致）
    // ============================================================

    // 如果页面已加载，立即开始后台加载
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(function() {
            if (!CalendarAuthority.initialized && !CalendarAuthority.loading) {
                CalendarAuthority.init();
            }
        }, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                if (!CalendarAuthority.initialized && !CalendarAuthority.loading) {
                    CalendarAuthority.init();
                }
            }, 100);
        });
    }

    console.log('[CalendarAuthority] Module loaded (background-load ready)');

})();
