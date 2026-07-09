// ===========================================
// aiEthicsController.js
// AI 伦理控制器：确保系统公平、透明、无偏见（Phase 76 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIEthicsController = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('⚖️ AIEthicsController initialized');
    },

    reviewCurriculumContent: function(contentText) {
        var forbiddenWords = ['biased', 'discriminatory', 'unfair', 'racist', 'sexist'];
        var found = [];
        for (var i = 0; i < forbiddenWords.length; i++) {
            if (contentText.toLowerCase().indexOf(forbiddenWords[i]) !== -1) {
                found.push(forbiddenWords[i]);
            }
        }
        if (found.length > 0) {
            LawAIApp.EventBus?.emit?.('EthicsViolation', { type: 'curriculum_bias', details: found });
            return { approved: false, reason: 'Biased content detected: ' + found.join(', ') };
        }
        return { approved: true };
    },

    enforceAgentFairness: function() {
        var voters = [];
        try {
            if (LawAIApp.AgentConsensusEngine && LawAIApp.AgentConsensusEngine._voters) {
                voters = LawAIApp.AgentConsensusEngine._voters;
            }
        } catch (e) {}

        var maxWeight = 5;
        try {
            if (LawAIApp.GlobalStandardEngine && LawAIApp.GlobalStandardEngine.standards &&
                LawAIApp.GlobalStandardEngine.standards.agent) {
                maxWeight = LawAIApp.GlobalStandardEngine.standards.agent.maxVoteWeight || 5;
            }
        } catch (e) {}

        for (var i = 0; i < voters.length; i++) {
            var v = voters[i];
            if (v && v.weight > maxWeight) {
                v.weight = maxWeight;
                LawAIApp.EventBus?.emit?.('EthicsViolation', { type: 'agent_weight_capped', agent: v.name });
            }
        }
    },

    logEvaluation: function(agentName, decision, reasoning) {
        var log = [];
        try {
            log = LawAIApp.StorageEngine?.get?.('ethics_log') || [];
        } catch (e) {}
        log.push({
            agent: agentName,
            decision: decision,
            reasoning: reasoning,
            timestamp: new Date().toISOString()
        });
        if (log.length > 100) {
            log.splice(0, log.length - 100);
        }
        try {
            LawAIApp.StorageEngine?.set?.('ethics_log', log);
        } catch (e) {}
    },

    auditFairness: function() {
        var issues = [];
        try {
            var metrics = {};
            if (LawAIApp.SystemHealthMonitor && typeof LawAIApp.SystemHealthMonitor.getMetrics === 'function') {
                metrics = LawAIApp.SystemHealthMonitor.getMetrics() || {};
            }
            if (metrics.taskCompletionRate < 20) {
                issues.push('Low task completion may indicate difficulty bias');
            }
        } catch (e) {}
        return issues;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            fairness: this.enforceAgentFairness()
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AIEthicsController && typeof LawAIApp.AIEthicsController.init === 'function') {
        LawAIApp.AIEthicsController.init();
    }
}, 500);

console.log('⚖️ AIEthicsController V2.0 ready');
