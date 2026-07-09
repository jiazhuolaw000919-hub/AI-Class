// ===========================================
// taskGenerationEngine.js
// 任务生成引擎（Season 4 Chapter 5 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.TaskGenerationEngine = {
    _initialized: false,
    _taskStoreKey: 'generated_tasks',

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('📋 TaskGenerationEngine initialized');
        return this;
    },

    generateTask: function(match) {
        match = match || {};

        var task = {
            taskId: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: match.taskTemplate?.type || 'reinforcement',
            title: this._getTaskTitle(match),
            description: this._getTaskDescription(match),
            skillId: match.skillId || 'general',
            skillName: match.skillName || 'General',
            difficulty: match.difficulty || 1,
            estimatedMinutes: match.estimatedTime || 10,
            xpReward: match.xpReward || 20,
            successProbability: match.successProbability || 0.8,
            status: 'available',
            createdAt: new Date().toISOString(),
            assignedAt: null,
            completedAt: null,
            requirements: {
                minimumMastery: Math.max(0, (match.masteryScore || 50) - 20),
                timeLimit: (match.estimatedTime || 10) * 1.5
            }
        };

        var tasks = this._getTasks();
        tasks.push(task);
        this._saveTasks(tasks);

        LawAIApp.EventBus?.emit?.('TaskGenerated', task);
        return task;
    },

    _getTaskTitle: function(match) {
        var skillName = match.skillName || 'skill';
        var titles = {
            reinforcement: 'Strengthen ' + skillName,
            simulation: 'Simulate: ' + skillName + ' in practice',
            project: 'Build: ' + skillName + ' Project',
            problem_solving: 'Solve: ' + skillName + ' Challenge',
            collaborative: 'Collaborate on ' + skillName
        };
        return titles[match.taskTemplate?.type] || 'Task: ' + skillName;
    },

    _getTaskDescription: function(match) {
        var skillName = match.skillName || 'skill';
        var type = match.taskTemplate?.type || 'reinforcement';
        return 'Apply your ' + skillName + ' skills to complete this ' + type + ' task. ' +
               'Estimated difficulty: ' + (match.difficulty || 1) + '/3.';
    },

    _getTasks: function() {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(this._taskStoreKey, []);
            }
            var val = localStorage.getItem('lawai_' + this._taskStoreKey);
            return val ? JSON.parse(val) : [];
        } catch (e) {
            return [];
        }
    },

    _saveTasks: function(tasks) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(this._taskStoreKey, tasks);
                return;
            }
            localStorage.setItem('lawai_' + this._taskStoreKey, JSON.stringify(tasks));
        } catch (e) {}
    },

    getAvailableTasks: function() {
        var tasks = this._getTasks();
        return tasks.filter(function(t) { return t.status === 'available'; });
    },

    getTasksByStatus: function(status) {
        var tasks = this._getTasks();
        return tasks.filter(function(t) { return t.status === status; });
    },

    getTask: function(taskId) {
        var tasks = this._getTasks();
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].taskId === taskId) {
                return tasks[i];
            }
        }
        return null;
    },

    assignTask: function(taskId, userId) {
        var task = this.getTask(taskId);
        if (!task || task.status !== 'available') {
            return { success: false, error: 'Task not available' };
        }

        task.status = 'assigned';
        task.assignedAt = new Date().toISOString();
        task.assignedTo = userId;

        this._saveTasks(this._getTasks());
        LawAIApp.EventBus?.emit?.('TaskAssigned', { taskId: taskId, userId: userId });
        return { success: true, task: task };
    },

    completeTask: function(taskId, result) {
        var task = this.getTask(taskId);
        if (!task || task.status !== 'assigned') {
            return { success: false, error: 'Task not in progress' };
        }

        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.result = result || { success: true };

        this._saveTasks(this._getTasks());
        LawAIApp.EventBus?.emit?.('TaskCompleted', { taskId: taskId, result: task.result });
        return { success: true, task: task };
    },

    clearTasks: function() {
        this._saveTasks([]);
        console.log('🧹 All tasks cleared');
    },

    getStatus: function() {
        var tasks = this._getTasks();
        return {
            initialized: this._initialized,
            total: tasks.length,
            available: tasks.filter(function(t) { return t.status === 'available'; }).length,
            assigned: tasks.filter(function(t) { return t.status === 'assigned'; }).length,
            completed: tasks.filter(function(t) { return t.status === 'completed'; }).length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.TaskGenerationEngine && typeof LawAIApp.TaskGenerationEngine.init === 'function') {
        LawAIApp.TaskGenerationEngine.init();
    }
}, 400);

console.log('📋 TaskGenerationEngine V2.0 ready');
