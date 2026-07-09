// ===========================================
// workAssignmentEngine.js
// 工作任务分配引擎（Phase 67 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.WorkAssignmentEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📋 WorkAssignmentEngine initialized');
    },

    acceptAndStartTask: function(taskId) {
        console.log('📋 Accepting task:', taskId);

        try {
            var tasks = LawAIApp.StorageEngine?.get?.('generated_tasks') || [];
            var task = null;
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].taskId === taskId) {
                    task = tasks[i];
                    break;
                }
            }

            if (!task) {
                console.warn('⚠️ Task not found:', taskId);
                return null;
            }
            if (task.status !== 'available') {
                console.warn('⚠️ Task not available:', task.status);
                return null;
            }

            // 分配任务
            var assigned = false;
            try {
                if (LawAIApp.AgentTaskCoordinator && typeof LawAIApp.AgentTaskCoordinator.assignTask === 'function') {
                    assigned = LawAIApp.AgentTaskCoordinator.assignTask(task);
                }
            } catch (e) {}

            if (assigned === false) {
                // 直接分配
                assigned = true;
            }

            if (!assigned) {
                console.warn('⚠️ Failed to assign task:', taskId);
                return null;
            }

            task.status = 'in_progress';
            task.startedAt = new Date().toISOString();

            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('generated_tasks', tasks);
            }

            LawAIApp.EventBus?.emit?.('WorkTaskStarted', task);
            console.log('✅ Task started:', taskId);
            return task;

        } catch (err) {
            console.warn('⚠️ acceptAndStartTask failed:', err);
            return null;
        }
    },

    completeTask: function(taskId, performanceScore) {
        performanceScore = performanceScore || 1.0;
        console.log('📋 Completing task:', taskId);

        try {
            var tasks = LawAIApp.StorageEngine?.get?.('generated_tasks') || [];
            var task = null;
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].taskId === taskId) {
                    task = tasks[i];
                    break;
                }
            }

            if (!task) {
                console.warn('⚠️ Task not found:', taskId);
                return null;
            }
            if (task.status !== 'in_progress') {
                console.warn('⚠️ Task not in progress:', task.status);
                return null;
            }

            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            task.performanceScore = performanceScore;

            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('generated_tasks', tasks);
            }

            // 反馈给技能部署引擎
            try {
                if (LawAIApp.SkillDeploymentEngine && typeof LawAIApp.SkillDeploymentEngine.handleTaskCompletion === 'function') {
                    LawAIApp.SkillDeploymentEngine.handleTaskCompletion(task);
                }
            } catch (e) {}

            LawAIApp.EventBus?.emit?.('WorkTaskCompleted', task);
            console.log('✅ Task completed:', taskId);
            return task;

        } catch (err) {
            console.warn('⚠️ completeTask failed:', err);
            return null;
        }
    },

    getAvailableTasks: function() {
        try {
            var tasks = LawAIApp.StorageEngine?.get?.('generated_tasks') || [];
            return tasks.filter(function(t) { return t.status === 'available'; });
        } catch (e) {
            return [];
        }
    },

    getInProgressTasks: function() {
        try {
            var tasks = LawAIApp.StorageEngine?.get?.('generated_tasks') || [];
            return tasks.filter(function(t) { return t.status === 'in_progress'; });
        } catch (e) {
            return [];
        }
    },

    getCompletedTasks: function() {
        try {
            var tasks = LawAIApp.StorageEngine?.get?.('generated_tasks') || [];
            return tasks.filter(function(t) { return t.status === 'completed'; });
        } catch (e) {
            return [];
        }
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            available: this.getAvailableTasks().length,
            inProgress: this.getInProgressTasks().length,
            completed: this.getCompletedTasks().length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.WorkAssignmentEngine && typeof LawAIApp.WorkAssignmentEngine.init === 'function') {
        LawAIApp.WorkAssignmentEngine.init();
    }
}, 500);

console.log('📋 WorkAssignmentEngine V2.0 ready');
