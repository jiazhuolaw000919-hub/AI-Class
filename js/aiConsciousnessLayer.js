// ===========================================
// aiConsciousnessLayer.js
// AI 意识层：整合身份、记忆与感知（Phase 78 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIConsciousnessLayer = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('🧠 AIConsciousnessLayer initializing...');

        LawAIApp.EventBus?.on?.('CivilizationIdentityUpdated', function() {
            if (LawAIApp.CollectiveMemorySystem && typeof LawAIApp.CollectiveMemorySystem.takeSnapshot === 'function') {
                LawAIApp.CollectiveMemorySystem.takeSnapshot();
            }
        });

        LawAIApp.EventBus?.on?.('SkillCertified', function(data) {
            if (LawAIApp.CollectiveMemorySystem && typeof LawAIApp.CollectiveMemorySystem.recordSkillEvolution === 'function') {
                LawAIApp.CollectiveMemorySystem.recordSkillEvolution(data.skillId, data.masteryScore);
            }
        });

        LawAIApp.EventBus?.on?.('WorkTaskCompleted', function(data) {
            if (LawAIApp.CollectiveMemorySystem && typeof LawAIApp.CollectiveMemorySystem.recordEvent === 'function') {
                LawAIApp.CollectiveMemorySystem.recordEvent({
                    type: 'task_completed',
                    taskId: data.taskId,
                    performance: data.performanceScore
                });
            }
        });

        if (LawAIApp.CivilizationAwarenessMonitor && typeof LawAIApp.CivilizationAwarenessMonitor.start === 'function') {
            LawAIApp.CivilizationAwarenessMonitor.start();
        }

        if (LawAIApp.CivilizationIdentityCore && typeof LawAIApp.CivilizationIdentityCore.refreshSelfState === 'function') {
            LawAIApp.CivilizationIdentityCore.refreshSelfState();
        }

        console.log('🧠 AI Consciousness Layer is now active. The civilization is self-aware.');
    },

    getConsciousnessReport: function() {
        var report = {
            identity: null,
            memory: null,
            awareness: null,
            alignment: null
        };

        try {
            if (LawAIApp.CivilizationIdentityCore && typeof LawAIApp.CivilizationIdentityCore.getIdentity === 'function') {
                report.identity = LawAIApp.CivilizationIdentityCore.getIdentity();
            }
        } catch (e) {}

        try {
            if (LawAIApp.CollectiveMemorySystem && typeof LawAIApp.CollectiveMemorySystem.getMemorySummary === 'function') {
                report.memory = LawAIApp.CollectiveMemorySystem.getMemorySummary();
            }
        } catch (e) {}

        try {
            if (LawAIApp.CivilizationAwarenessMonitor && typeof LawAIApp.CivilizationAwarenessMonitor.getAwarenessReport === 'function') {
                report.awareness = LawAIApp.CivilizationAwarenessMonitor.getAwarenessReport();
            }
        } catch (e) {}

        try {
            if (LawAIApp.IdentityAlignmentEngine && typeof LawAIApp.IdentityAlignmentEngine.performFullAudit === 'function') {
                report.alignment = LawAIApp.IdentityAlignmentEngine.performFullAudit();
            }
        } catch (e) {}

        return report;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            report: this.getConsciousnessReport()
        };
    }
};

// 等待其他组件就绪后启动
setTimeout(function() {
    if (LawAIApp.AIConsciousnessLayer && typeof LawAIApp.AIConsciousnessLayer.init === 'function') {
        LawAIApp.AIConsciousnessLayer.init();
    }
}, 1500);

console.log('🧠 AIConsciousnessLayer V2.0 ready');
