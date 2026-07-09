// ===========================================
// globalEducationRuntime.js
// 全球教育运行时：持续监控文明状态并触发自适应调整（Phase 75 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.GlobalEducationRuntime = {
    _started: false,
    _healthInterval: null,

    start: function() {
        if (this._started) {
            console.log('[GlobalRuntime] Already started.');
            return;
        }

        this._started = true;
        console.log('[GlobalRuntime] Starting global education runtime...');

        // 每15分钟执行一次全局健康检查
        this._healthInterval = setInterval(function() {
            this.runGlobalHealthCheck();
        }.bind(this), 900000);

        // 立即执行一次
        setTimeout(function() {
            this.runGlobalHealthCheck();
        }.bind(this), 1000);

        console.log('[GlobalRuntime] Global education runtime started.');
    },

    runGlobalHealthCheck: async function() {
        console.log('[GlobalRuntime] Running global health check...');

        try {
            var health = { overall: 80 };
            if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getHealthSummary === 'function') {
                health = LawAIApp.SystemHealthMonitor.getHealthSummary() || health;
            }

            // 如果整体健康低于阈值，触发自动修复
            if (health.overall < 60) {
                console.log('[GlobalRuntime] Health below threshold, initiating auto-repair.');
                if (LawAIApp.SelfImprovementEngine && typeof LawAIApp.SelfImprovementEngine.performSelfHealing === 'function') {
                    await LawAIApp.SelfImprovementEngine.performSelfHealing();
                }
            }

            // 检查动机水平
            var motivation = 70;
            if (LawAIApp.CivilizationMotivationCore && typeof LawAIApp.CivilizationMotivationCore.checkMotivation === 'function') {
                motivation = LawAIApp.CivilizationMotivationCore.checkMotivation() || 70;
            }
            if (motivation < 50 && LawAIApp.CivilizationMotivationCore && typeof LawAIApp.CivilizationMotivationCore.reinforceMotivation === 'function') {
                LawAIApp.CivilizationMotivationCore.reinforceMotivation(20);
            }

            // 同步代理动机
            if (LawAIApp.AgentMotivationSync && typeof LawAIApp.AgentMotivationSync.syncAgentsToMotivation === 'function') {
                LawAIApp.AgentMotivationSync.syncAgentsToMotivation();
            }

            // 检查目的完整性
            if (LawAIApp.PurposeLockSystem && typeof LawAIApp.PurposeLockSystem.verifyPurposeIntegrity === 'function') {
                LawAIApp.PurposeLockSystem.verifyPurposeIntegrity();
            }

            // 更新文明身份
            if (LawAIApp.CivilizationIdentityCore && typeof LawAIApp.CivilizationIdentityCore.refreshSelfState === 'function') {
                LawAIApp.CivilizationIdentityCore.refreshSelfState();
            }

            // 发布全局运行时心跳
            LawAIApp.EventBus?.emit?.('GlobalRuntimePulse', {
                health: health.overall,
                motivation: motivation,
                timestamp: new Date().toISOString()
            });

        } catch (err) {
            console.warn('[GlobalRuntime] Health check error:', err);
        }
    },

    stop: function() {
        if (this._healthInterval) {
            clearInterval(this._healthInterval);
            this._healthInterval = null;
        }
        this._started = false;
        console.log('[GlobalRuntime] Stopped.');
    },

    getStatus: function() {
        return {
            started: this._started,
            intervalActive: this._healthInterval !== null
        };
    }
};

// 自动启动
setTimeout(function() {
    if (LawAIApp.GlobalEducationRuntime && typeof LawAIApp.GlobalEducationRuntime.start === 'function') {
        LawAIApp.GlobalEducationRuntime.start();
    }
}, 800);

console.log('[GlobalRuntime] GlobalEducationRuntime V2.0 ready');
