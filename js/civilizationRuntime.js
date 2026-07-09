// ===========================================
// civilizationRuntime.js
// 文明运行时：持续驱动文明活动（Phase 71 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CivilizationRuntime = {
    _initialized: false,
    _pulseInterval: null,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('[CivRuntime] Civilization runtime initializing...');

        // 监听 CivOS 启动完成
        LawAIApp.EventBus?.on?.('CivilizationBootComplete', function() {
            console.log('[CivRuntime] Reacting to boot completion.');
            this.pulse();
        }.bind(this));

        // 监听全局路径生成
        LawAIApp.EventBus?.on?.('GlobalPathGenerated', function(path) {
            var assetId = 'global_consensus_path';
            if (LawAIApp.LearningAssetManager && typeof LawAIApp.LearningAssetManager.addAsset === 'function') {
                LawAIApp.LearningAssetManager.addAsset({
                    id: assetId,
                    type: 'learning_path',
                    title: 'Global Consensus Path',
                    description: 'Optimal path determined by the AI civilization.',
                    creator: 'CivOS',
                    lessons: path.path || [],
                    effectivenessScore: 90,
                    rating: 5
                });
            }
        });

        // 启动心跳
        this._startPulse();

        console.log('[CivRuntime] Civilization runtime active.');
        return this;
    },

    _startPulse: function() {
        if (this._pulseInterval) {
            clearInterval(this._pulseInterval);
        }
        // 每5分钟执行一次
        this._pulseInterval = setInterval(function() {
            this.pulse();
        }.bind(this), 300000);

        // 立即执行一次
        setTimeout(function() {
            this.pulse();
        }.bind(this), 500);
    },

    pulse: function() {
        try {
            // 更新系统健康
            if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.updateMetrics === 'function') {
                LawAIApp.SystemHealthMonitor.updateMetrics();
            }

            var health = { overall: 80 };
            try {
                if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getHealthSummary === 'function') {
                    health = LawAIApp.SystemHealthMonitor.getHealthSummary() || health;
                }
            } catch (e) {}

            // 如果健康低于阈值，触发自我修复
            if (health.overall < 65) {
                console.log('[CivRuntime] Health below threshold, triggering self-healing.');
                if (LawAIApp.SelfImprovementEngine && typeof LawAIApp.SelfImprovementEngine.performSelfHealing === 'function') {
                    LawAIApp.SelfImprovementEngine.performSelfHealing();
                }
            }

            // 生成经济快照
            var economy = { totalKnowledgePoints: 0 };
            try {
                if (LawAIApp.KnowledgeEconomyEngine && typeof LawAIApp.KnowledgeEconomyEngine.getSummary === 'function') {
                    economy = LawAIApp.KnowledgeEconomyEngine.getSummary() || economy;
                }
            } catch (e) {}

            console.log('[CivOS Pulse] Health:', health.overall, 'Knowledge Points:', economy.totalKnowledgePoints);

        } catch (err) {
            console.warn('[CivRuntime] Pulse error:', err);
        }
    },

    stop: function() {
        if (this._pulseInterval) {
            clearInterval(this._pulseInterval);
            this._pulseInterval = null;
        }
        console.log('[CivRuntime] Stopped.');
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            pulseActive: this._pulseInterval !== null
        };
    }
};

// 等待引导完成后启动
setTimeout(function() {
    if (LawAIApp.CivilizationRuntime && typeof LawAIApp.CivilizationRuntime.init === 'function') {
        LawAIApp.CivilizationRuntime.init();
    }
}, 2000);

console.log('[CivRuntime] CivilizationRuntime V2.0 ready');
