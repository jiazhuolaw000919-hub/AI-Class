// ===========================================
// skillWorkMatchingEngine.js
// AI 技能到工作匹配引擎（Phase 67 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.SkillWorkMatchingEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🔗 Skill-Work Matching Engine initializing...');

        // 监听证书生成
        LawAIApp.EventBus?.on?.('SkillCertified', function() {
            try {
                if (LawAIApp.SkillTaskMatcher && typeof LawAIApp.SkillTaskMatcher.generateMatches === 'function') {
                    LawAIApp.SkillTaskMatcher.generateMatches();
                }
            } catch (e) {}
        });

        // 监听任务完成
        LawAIApp.EventBus?.on?.('WorkTaskCompleted', function(task) {
            try {
                if (LawAIApp.WorkforceSimulationEngine && typeof LawAIApp.WorkforceSimulationEngine.updateAfterTask === 'function') {
                    LawAIApp.WorkforceSimulationEngine.updateAfterTask(task);
                }

                // 检查是否需要生成新任务
                var availableTasks = LawAIApp.TaskGenerationEngine?.getAvailableTasks?.() || [];
                if (availableTasks.length < 3) {
                    var matches = LawAIApp.SkillTaskMatcher?.generateMatches?.() || [];
                    if (matches.length > 0 && LawAIApp.TaskGenerationEngine && typeof LawAIApp.TaskGenerationEngine.generateTask === 'function') {
                        LawAIApp.TaskGenerationEngine.generateTask(matches[0]);
                    }
                }
            } catch (e) {}
        });

        // 定期刷新匹配
        setInterval(function() {
            try {
                var certs = LawAIApp.SkillValidationEngine?.getCertificates?.() || [];
                if (certs.length > 0) {
                    if (LawAIApp.SkillTaskMatcher && typeof LawAIApp.SkillTaskMatcher.generateMatches === 'function') {
                        LawAIApp.SkillTaskMatcher.generateMatches();
                    }
                }
            } catch (e) {}
        }, 600000); // 10分钟

        console.log('✅ Skill-to-Work Matching Engine activated.');
    },

    getJobBoard: function() {
        try {
            if (LawAIApp.TaskGenerationEngine && typeof LawAIApp.TaskGenerationEngine.getAvailableTasks === 'function') {
                return LawAIApp.TaskGenerationEngine.getAvailableTasks();
            }
        } catch (e) {}
        return LawAIApp.WorkAssignmentEngine?.getAvailableTasks?.() || [];
    },

    acceptJob: function(taskId) {
        if (LawAIApp.WorkAssignmentEngine && typeof LawAIApp.WorkAssignmentEngine.acceptAndStartTask === 'function') {
            return LawAIApp.WorkAssignmentEngine.acceptAndStartTask(taskId);
        }
        return null;
    },

    submitWork: function(taskId, performance) {
        if (LawAIApp.WorkAssignmentEngine && typeof LawAIApp.WorkAssignmentEngine.completeTask === 'function') {
            return LawAIApp.WorkAssignmentEngine.completeTask(taskId, performance);
        }
        return null;
    },

    getWorkStats: function() {
        try {
            if (LawAIApp.WorkforceSimulationEngine && typeof LawAIApp.WorkforceSimulationEngine.getProductivityReport === 'function') {
                return LawAIApp.WorkforceSimulationEngine.getProductivityReport();
            }
        } catch (e) {}
        return {
            totalTasks: 0,
            completed: 0,
            productivity: 0
        };
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            jobBoard: this.getJobBoard().length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.SkillWorkMatchingEngine && typeof LawAIApp.SkillWorkMatchingEngine.init === 'function') {
        LawAIApp.SkillWorkMatchingEngine.init();
    }
}, 1000);

console.log('🔗 SkillWorkMatchingEngine V2.0 ready');
