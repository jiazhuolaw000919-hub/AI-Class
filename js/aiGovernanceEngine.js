// ===========================================
// aiGovernanceEngine.js
// AI 治理引擎：协调代理冲突，平衡全局参数（Phase 77 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIGovernanceEngine = {
    _initialized: false,

    _rules: {
        maxDifficulty: 3,
        minEngagementThreshold: 40,
        agentVoteWeightCap: 5,
        graphHealthMin: 50
    },

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('⚙️ AIGovernanceEngine initializing...');

        LawAIApp.EventBus?.on?.('SystemHealthUpdated', function(metrics) {
            this.enforceGovernance(metrics);
        }.bind(this));

        LawAIApp.EventBus?.on?.('ProposalRejected', function(prop) {
            this.resolveConflict(prop);
        }.bind(this));

        console.log('⚙️ AIGovernanceEngine ready');
    },

    enforceGovernance: function(metrics) {
        metrics = metrics || {};

        if (metrics.taskCompletionRate !== undefined &&
            metrics.taskCompletionRate < this._rules.minEngagementThreshold) {
            try {
                LawAIApp.StorageEngine?.set?.('preferred_task_difficulty', 'low');
            } catch (e) {}
            LawAIApp.EventBus?.emit?.('GovernanceAction', {
                action: 'cap_difficulty',
                reason: 'Low engagement',
                value: 'low'
            });
        }

        if (metrics.graphOptimizationScore !== undefined &&
            metrics.graphOptimizationScore < this._rules.graphHealthMin) {
            if (LawAIApp.GraphSignalProcessor && typeof LawAIApp.GraphSignalProcessor.reinforceRecent === 'function') {
                LawAIApp.GraphSignalProcessor.reinforceRecent();
            }
            LawAIApp.EventBus?.emit?.('GovernanceAction', {
                action: 'global_reinforcement',
                reason: 'Graph health decline'
            });
        }

        try {
            var voters = LawAIApp.AgentConsensusEngine?._voters || [];
            for (var i = 0; i < voters.length; i++) {
                var v = voters[i];
                if (v && v.weight > this._rules.agentVoteWeightCap) {
                    v.weight = this._rules.agentVoteWeightCap;
                }
            }
        } catch (e) {}
    },

    resolveConflict: function(proposal) {
        var alternative = {
            id: 'alt_' + Date.now(),
            title: proposal.title || 'Alternative Proposal',
            action: proposal.action === 'adjust_schedule' ? 'review_weak_concepts' : 'adjust_schedule',
            priority: 'medium',
            options: proposal.options || ['Accept', 'Reject']
        };

        if (LawAIApp.AgentConsensusEngine && typeof LawAIApp.AgentConsensusEngine.propose === 'function') {
            LawAIApp.AgentConsensusEngine.propose(alternative);
        }

        LawAIApp.EventBus?.emit?.('ConflictResolved', { original: proposal, alternative: alternative });
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            rules: this._rules
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AIGovernanceEngine && typeof LawAIApp.AIGovernanceEngine.init === 'function') {
        LawAIApp.AIGovernanceEngine.init();
    }
}, 600);

console.log('⚙️ AIGovernanceEngine V2.0 ready');
