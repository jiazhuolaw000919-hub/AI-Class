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
        currentIndex: -1,
        activityStatuses: {},      // activityId → 'pending'|'in_progress'|'completed'|'skipped'|'failed'
        sessionId: null,
        mountedComponents: []      // 跟踪已挂载的组件，用于 cleanup
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
        this._state.activityStatuses = {};
        this._state.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

        // 初始化每个 activity 的状态
        for (var i = 0; i < this._state.activities.length; i++) {
            var act = this._state.activities[i];
            this._state.activityStatuses[act.id] = 'pending';
        }

        // 🔥 发射生命周期事件
        this._emitLifecycle('resolve', null);
        this._emitLifecycle('validate', null);
        
        // 如果有 Activities，激活第一个
        if (this._state.activities.length > 0) {
            this._state.currentIndex = 0;
            this._activeActivityId = this._state.activities[0].id;
        }
        
        this._emitLifecycle('initialize', this._activeActivityId);
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
    
        // 🔥 如果当前有 active activity，先 unmount
        if (this._activeActivityId && this._activeActivityId !== activityId) {
            this._unmountActivity(this._activeActivityId);
        }
    
        this._state.currentIndex = index;
        this._activeActivityId = activityId;
    
        // 🔥 更新状态为 in_progress
        if (this._state.activityStatuses[activityId] === 'pending') {
            this._state.activityStatuses[activityId] = 'in_progress';
            this._emitLifecycle('start', activityId);
        }
    
        this._emitLifecycle('mount', activityId);
    
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
            // 🔥 标记为 failed
            this._state.activityStatuses[activityId] = 'failed';
            this._emitLifecycle('fail', activityId);
            return this._createResult(false, 'Renderer not found for type: ' + activity.type);
        }
    
        try {
            // 🔥 调用 renderer 并跟踪
            var result = renderer(activity, container);
            
            // 🔥 如果 renderer 返回了 mount 函数，保存以便 cleanup
            if (result && typeof result === 'object' && typeof result.unmount === 'function') {
                if (!this._state.mountedComponents) {
                    this._state.mountedComponents = [];
                }
                this._state.mountedComponents.push({
                    activityId: activityId,
                    unmount: result.unmount,
                    container: container
                });
            }
        
            // 🔥 发射 interaction 事件
            this._emitLifecycle('interaction', activityId);
        
            return this._createResult(true, null, { activity: activity });
        } catch (e) {
            console.error('[ExperienceRuntime] Renderer error:', e);
            container.innerHTML = this._renderError(activity, e);
            this._state.activityStatuses[activityId] = 'failed';
            this._emitLifecycle('fail', activityId);
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

        // ============================================================
    // 🔥 PART 127: 新增方法
    // ============================================================

    /**
     * 完成 Activity
     * @param {string} activityId - Activity ID
     * @param {Object} result - 完成结果 (可选)
     * @returns {Object} 完成结果
     */
    complete: function(activityId, result) {
        var activity = this._findActivity(activityId);
        if (!activity) {
            return this._createResult(false, 'Activity not found: ' + activityId);
        }

        var currentStatus = this._state.activityStatuses[activityId];
        if (currentStatus === 'completed') {
            return this._createResult(false, 'Activity already completed');
        }

        if (currentStatus === 'failed') {
            return this._createResult(false, 'Cannot complete a failed activity');
        }

        this._state.activityStatuses[activityId] = 'completed';
        this._emitLifecycle('complete', activityId);

        // 🔥 发射带 provenance 的完成信号
        this._emit('ACTIVITY_COMPLETED', {
            activityId: activityId,
            activityType: activity.type,
            lessonId: this._activeLessonId,
            result: result || null,
            source: 'learning-experience-runtime',
            timestamp: new Date().toISOString()
        });

        // 🔥 检查是否所有 activities 都完成了
        var allCompleted = true;
        for (var id in this._state.activityStatuses) {
            if (this._state.activityStatuses[id] !== 'completed' && 
                this._state.activityStatuses[id] !== 'skipped') {
                allCompleted = false;
                break;
            }
        }

        if (allCompleted) {
            this._state.status = 'COMPLETED';
            this._emit('LESSON_COMPLETED', {
                lessonId: this._activeLessonId,
                activities: this._state.activities.length,
                source: 'learning-experience-runtime',
                timestamp: new Date().toISOString()
            });
        }

        return this._createResult(true, null, {
            activityId: activityId,
            status: 'completed',
            lessonStatus: this._state.status
        });
    },

    /**
     * 跳过 Activity
     * @param {string} activityId - Activity ID
     * @returns {Object} 跳过结果
     */
    skip: function(activityId) {
        var activity = this._findActivity(activityId);
        if (!activity) {
            return this._createResult(false, 'Activity not found: ' + activityId);
        }

        var currentStatus = this._state.activityStatuses[activityId];
        if (currentStatus === 'completed') {
            return this._createResult(false, 'Cannot skip a completed activity');
        }

        this._state.activityStatuses[activityId] = 'skipped';
        this._emitLifecycle('skip', activityId);

        this._emit('ACTIVITY_SKIPPED', {
            activityId: activityId,
            activityType: activity.type,
            lessonId: this._activeLessonId,
            source: 'learning-experience-runtime',
            timestamp: new Date().toISOString()
        });

        return this._createResult(true, null, {
            activityId: activityId,
            status: 'skipped'
        });
    },

    /**
     * 获取 Activity 状态
     * @param {string} activityId - Activity ID
     * @returns {string} 状态
     */
    getActivityStatus: function(activityId) {
        return this._state.activityStatuses[activityId] || 'unknown';
    },

    /**
     * 卸载 Activity (清理)
     * @param {string} activityId - Activity ID
     * @returns {Object} 卸载结果
     */
    unmount: function(activityId) {
        return this._unmountActivity(activityId);
    },

    /**
     * 完全清理 Runtime
     * @returns {Object} 清理结果
     */
    cleanup: function() {
        console.log('[ExperienceRuntime] 🧹 Cleaning up...');

        // 1. 卸载所有已挂载的组件
        if (this._state.mountedComponents) {
            for (var i = 0; i < this._state.mountedComponents.length; i++) {
                var comp = this._state.mountedComponents[i];
                try {
                    if (typeof comp.unmount === 'function') {
                        comp.unmount();
                    }
                } catch (e) {
                    console.warn('[ExperienceRuntime] Unmount error:', e);
                }
            }
            this._state.mountedComponents = [];
        }

        // 2. 清理 DOM 引用
        // (由调用者负责清理容器)

        // 3. 发射清理事件
        this._emit('RUNTIME_CLEANUP', {
            lessonId: this._activeLessonId,
            sessionId: this._state.sessionId,
            source: 'learning-experience-runtime',
            timestamp: new Date().toISOString()
        });

        this._state.sessionId = null;

        return this._createResult(true, 'Cleanup completed');
    },

    /**
     * 获取活动摘要 (用于 Partial 状态)
     * @returns {Object} 摘要
     */
    getSummary: function() {
        var total = this._state.activities.length;
        var completed = 0;
        var skipped = 0;
        var failed = 0;
        var inProgress = 0;
        var pending = 0;

        for (var id in this._state.activityStatuses) {
            var status = this._state.activityStatuses[id];
            switch (status) {
                case 'completed': completed++; break;
                case 'skipped': skipped++; break;
                case 'failed': failed++; break;
                case 'in_progress': inProgress++; break;
                case 'pending': pending++; break;
            }
        }

        var hasFailed = failed > 0;
        var allCompleted = completed + skipped === total;
        var isPartial = hasFailed || (pending > 0 && completed > 0);

        return {
            total: total,
            completed: completed,
            skipped: skipped,
            failed: failed,
            inProgress: inProgress,
            pending: pending,
            hasFailed: hasFailed,
            allCompleted: allCompleted,
            isPartial: isPartial,
            status: allCompleted ? 'COMPLETED' : (isPartial ? 'PARTIAL' : 'IN_PROGRESS')
        };
    },

    // ============================================================
    // 🔥 PART 127: 私有辅助方法
    // ============================================================

    /**
     * 卸载单个 Activity
     * @private
     */
    _unmountActivity: function(activityId) {
        if (!this._state.mountedComponents) return;

        var toRemove = [];
        for (var i = 0; i < this._state.mountedComponents.length; i++) {
            var comp = this._state.mountedComponents[i];
            if (comp.activityId === activityId) {
                try {
                    if (typeof comp.unmount === 'function') {
                        comp.unmount();
                    }
                } catch (e) {
                    console.warn('[ExperienceRuntime] Unmount error:', e);
                }
                toRemove.push(i);
            }
        }

        // 从后往前删除
        for (var j = toRemove.length - 1; j >= 0; j--) {
            this._state.mountedComponents.splice(toRemove[j], 1);
        }

        this._emitLifecycle('unmount', activityId);
        return this._createResult(true, 'Unmounted: ' + activityId);
    },

    /**
     * 发射生命周期事件 (带 provenance)
     * @private
     */
    _emitLifecycle: function(phase, activityId) {
        var events = {
            'resolve': 'ACTIVITY_RESOLVED',
            'validate': 'ACTIVITY_VALIDATED',
            'initialize': 'ACTIVITY_INITIALIZED',
            'mount': 'ACTIVITY_OPENED',
            'start': 'ACTIVITY_STARTED',
            'progress': 'ACTIVITY_PROGRESS',
            'interaction': 'ACTIVITY_INTERACTION',
            'complete': 'ACTIVITY_COMPLETED',
            'skip': 'ACTIVITY_SKIPPED',
            'fail': 'ACTIVITY_FAILED',
            'unmount': 'ACTIVITY_UNMOUNTED'
        };

        var eventName = events[phase];
        if (!eventName) return;

        var data = {
            phase: phase,
            activityId: activityId || this._activeActivityId,
            lessonId: this._activeLessonId,
            sessionId: this._state.sessionId,
            source: 'learning-experience-runtime',
            timestamp: new Date().toISOString(),
            provenance: {
                runtime: 'ExperienceRuntime',
                version: '1.0.0',
                sessionId: this._state.sessionId
            }
        };

        // 如果是完成相关事件，包含 summary
        if (phase === 'complete' || phase === 'skip' || phase === 'fail') {
            data.summary = this.getSummary();
        }

        this._emit(eventName, data);
    },

    _emit: function(eventName, data) {
        try {
            // 🔥 确保所有事件都有 provenance
            var enrichedData = data || {};
            if (!enrichedData.source) {
                enrichedData.source = 'learning-experience-runtime';
            }
            if (!enrichedData.timestamp) {
                enrichedData.timestamp = new Date().toISOString();
            }
            if (!enrichedData.provenance) {
                enrichedData.provenance = {
                    runtime: 'ExperienceRuntime',
                    version: '1.0.0',
                    sessionId: this._state.sessionId || null
                };
            }
            if (!enrichedData.activityId && this._activeActivityId) {
                enrichedData.activityId = this._activeActivityId;
            }
            if (!enrichedData.lessonId && this._activeLessonId) {
                enrichedData.lessonId = this._activeLessonId;
            }

            var event = new CustomEvent(eventName, { detail: enrichedData });
            document.dispatchEvent(event);
            window.dispatchEvent(event);
        
            var bus = window.LawAIApp?.EventBus;
            if (bus && typeof bus.emit === 'function') {
                bus.emit(eventName, enrichedData);
            }
        } catch (e) {
            // 忽略
        }
    }
};

console.log('⚡ ExperienceRuntime loaded (Part 126)');
