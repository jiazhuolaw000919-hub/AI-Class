// js/experience/experienceRuntime.js
// Part 126: Lesson Experience Runtime

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};

LawAIApp.Experience.Runtime = {
    _activeLessonId: null,
    _activeActivityId: null,
    _state: {
        status: 'IDLE',
        activities: [],
        currentIndex: -1
    },
    _listeners: {},

    // ============================================================
    // 生命周期
    // ============================================================

    /**
     * 打开 Lesson
     * @param {string} lessonId - Lesson ID
     * @param {Object} options - 配置选项
     * @returns {Object} Runtime 结果
     */
    open: function(lessonId, options) {
        console.log('[ExperienceRuntime] 📖 Opening lesson:', lessonId);
        
        this._activeLessonId = lessonId;
        this._state.status = 'LOADING';
        
        // 获取 Lesson
        var lesson = this._loadLesson(lessonId);
        if (!lesson) {
            this._state.status = 'ERROR';
            return this._createResult(false, 'Lesson not found: ' + lessonId);
        }
        
        // 构建 Experience
        var contract = window.LawAIApp?.ExperienceContract;
        if (!contract) {
            this._state.status = 'ERROR';
            return this._createResult(false, 'ExperienceContract not available');
        }
        
        var experience = contract.buildExperience(lesson, options);
        this._state.activities = experience.activities || [];
        this._state.status = experience.status;
        
        // 如果有 Activities，激活第一个
        if (this._state.activities.length > 0) {
            this._state.currentIndex = 0;
            this._activeActivityId = this._state.activities[0].id;
        }
        
        return this._createResult(true, null, this._state);
    },

    /**
     * 获取当前状态
     */
    getState: function() {
        return {
            status: this._state.status,
            lessonId: this._activeLessonId,
            activities: this._state.activities,
            currentIndex: this._state.currentIndex,
            currentActivity: this._getCurrentActivity(),
            total: this._state.activities.length,
            hasActivities: this._state.activities.length > 0
        };
    },

    /**
     * 获取当前 Activity
     */
    getCurrentActivity: function() {
        return this._getCurrentActivity();
    },

    /**
     * 切换到指定 Activity
     * @param {string} activityId - Activity ID
     * @returns {Object} 切换结果
     */
    switchTo: function(activityId) {
        var index = -1;
        for (var i = 0; i < this._state.activities.length; i++) {
            if (this._state.activities[i].id === activityId) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            return this._createResult(false, 'Activity not found: ' + activityId);
        }
        
        this._state.currentIndex = index;
        this._activeActivityId = activityId;
        
        this._emit('ACTIVITY_SWITCHED', {
            activityId: activityId,
            index: index,
            total: this._state.activities.length
        });
        
        return this._createResult(true, null, this.getState());
    },

    /**
     * 下一个 Activity
     */
    next: function() {
        if (this._state.currentIndex < this._state.activities.length - 1) {
            return this.switchTo(this._state.activities[this._state.currentIndex + 1].id);
        }
        return this._createResult(false, 'No next activity');
    },

    /**
     * 上一个 Activity
     */
    previous: function() {
        if (this._state.currentIndex > 0) {
            return this.switchTo(this._state.activities[this._state.currentIndex - 1].id);
        }
        return this._createResult(false, 'No previous activity');
    },

    /**
     * 获取 Activity 渲染器
     * @param {string} activityId - Activity ID
     * @returns {Function|null} 渲染器函数
     */
    getRenderer: function(activityId) {
        var activity = this._findActivity(activityId);
        if (!activity) return null;
        
        var registry = window.LawAIApp?.Experience?.ActivityRegistry;
        if (!registry) return null;
        
        return registry.get(activity.type);
    },

    /**
     * 渲染 Activity
     * @param {string} activityId - Activity ID
     * @param {HTMLElement} container - 渲染容器
     * @returns {Object} 渲染结果
     */
    renderActivity: function(activityId, container) {
        if (!container) {
            return this._createResult(false, 'Container not provided');
        }
        
        var activity = this._findActivity(activityId);
        if (!activity) {
            container.innerHTML = '<div style="color:#64748b;padding:20px;">Activity not found</div>';
            return this._createResult(false, 'Activity not found: ' + activityId);
        }
        
        var renderer = this.getRenderer(activityId);
        if (!renderer) {
            container.innerHTML = this._renderUnavailable(activity);
            return this._createResult(false, 'Renderer not found for type: ' + activity.type);
        }
        
        try {
            renderer(activity, container);
            return this._createResult(true, null, { activity: activity });
        } catch (e) {
            console.error('[ExperienceRuntime] Renderer error:', e);
            container.innerHTML = this._renderError(activity, e);
            return this._createResult(false, 'Renderer error: ' + e.message);
        }
    },

    // ============================================================
    // 私有方法
    // ============================================================

    _loadLesson: function(lessonId) {
        // 尝试从 LessonEngine 获取
        try {
            var engine = window.LawAIApp?.LessonEngine;
            if (engine) {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    var lesson = engine.getLessonByDay(day);
                    if (lesson) return lesson;
                }
            }
        } catch (e) {
            console.warn('[ExperienceRuntime] LessonEngine error:', e);
        }
        
        // 尝试从 Views.LessonView 获取
        try {
            var view = window.LawAIApp?.Views?.LessonView;
            if (view && view._lesson) {
                return view._lesson;
            }
        } catch (e) {
            console.warn('[ExperienceRuntime] LessonView error:', e);
        }
        
        return null;
    },

    _getCurrentActivity: function() {
        if (this._state.currentIndex < 0 || this._state.currentIndex >= this._state.activities.length) {
            return null;
        }
        return this._state.activities[this._state.currentIndex];
    },

    _findActivity: function(activityId) {
        for (var i = 0; i < this._state.activities.length; i++) {
            if (this._state.activities[i].id === activityId) {
                return this._state.activities[i];
            }
        }
        return null;
    },

    _createResult: function(success, error, data) {
        return {
            success: success,
            error: error || null,
            data: data || null,
            state: this.getState()
        };
    },

    _renderUnavailable: function(activity) {
        return `
            <div style="
                color:#64748b;
                padding:20px;
                text-align:center;
                background:rgba(255,255,255,0.02);
                border-radius:8px;
                border:1px solid rgba(255,255,255,0.04);
            ">
                <div style="font-size:32px;margin-bottom:8px;">🚧</div>
                <div style="font-size:13px;">${activity.type} not available yet</div>
                <div style="font-size:11px;color:#475569;">Renderer not registered for this activity type</div>
            </div>
        `;
    },

    _renderError: function(activity, error) {
        return `
            <div style="
                color:#ef4444;
                padding:20px;
                text-align:center;
                background:rgba(239,68,68,0.04);
                border-radius:8px;
                border:1px solid rgba(239,68,68,0.08);
            ">
                <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
                <div style="font-size:13px;">Failed to render ${activity.type}</div>
                <div style="font-size:11px;color:#64748b;">${error.message || 'Unknown error'}</div>
            </div>
        `;
    },

    _emit: function(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            document.dispatchEvent(event);
            window.dispatchEvent(event);
            
            var bus = window.LawAIApp?.EventBus;
            if (bus && typeof bus.emit === 'function') {
                bus.emit(eventName, data);
            }
        } catch (e) {
            // 忽略
        }
    }
};

console.log('⚡ ExperienceRuntime loaded (Part 126)');
