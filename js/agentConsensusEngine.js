// ===========================================
// agentConsensusEngine.js
// 跨智能体学习社会 - 共识引擎（Phase 63 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AgentConsensusEngine = {
    proposals: [],
    _voters: [],
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🤝 AgentConsensusEngine initialized');
    },

    registerVoter: function(agentName, weight) {
        weight = weight || 1;
        if (!this._voters.find(function(v) { return v.name === agentName; })) {
            this._voters.push({ name: agentName, weight: weight });
            console.log('📌 Voter registered:', agentName, '(weight:', weight + ')');
        }
    },

    propose: function(proposal) {
        var prop = {
            id: 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            title: proposal.title || 'Proposal',
            description: proposal.description || '',
            options: proposal.options || ['Accept', 'Reject'],
            votes: {},
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: proposal.expiresAt || null
        };
        this.proposals.push(prop);
        LawAIApp.EventBus?.emit?.('ProposalCreated', prop);
        console.log('📋 Proposal created:', prop.id);
        return prop;
    },

    vote: function(agentName, proposalId, approve, weight) {
        weight = weight || 1;
        var prop = this.proposals.find(function(p) { return p.id === proposalId; });
        if (!prop) {
            console.warn('⚠️ Proposal not found:', proposalId);
            return;
        }
        if (prop.status !== 'pending') {
            console.warn('⚠️ Proposal already closed:', prop.status);
            return;
        }
        prop.votes[agentName] = { approve: approve, weight: weight, timestamp: new Date().toISOString() };
        this._checkConsensus(prop);
    },

    _checkConsensus: function(prop) {
        var totalWeight = 0;
        for (var i = 0; i < this._voters.length; i++) {
            totalWeight += this._voters[i].weight;
        }
        if (totalWeight === 0) totalWeight = 1;

        var approvedWeight = 0;
        for (var agent in prop.votes) {
            if (prop.votes[agent].approve) {
                approvedWeight += prop.votes[agent].weight;
            }
        }

        var threshold = totalWeight * 0.51;
        var totalVotes = Object.keys(prop.votes).length;

        if (approvedWeight >= threshold) {
            prop.status = 'accepted';
            prop.result = 'accepted';
            LawAIApp.EventBus?.emit?.('ProposalAccepted', prop);
            console.log('✅ Proposal accepted:', prop.id);
        } else if (totalVotes >= this._voters.length && approvedWeight < threshold) {
            prop.status = 'rejected';
            prop.result = 'rejected';
            LawAIApp.EventBus?.emit?.('ProposalRejected', prop);
            console.log('❌ Proposal rejected:', prop.id);
        }
    },

    runConsensusRound: function(context) {
        context = context || {};
        console.log('🔄 Running consensus round...');

        var proposals = [];
        var agents = LawAIApp.AgentOrchestrator?.agents || [];

        for (var i = 0; i < agents.length; i++) {
            var agent = agents[i];
            if (agent.role === 'Teaching & guidance') {
                proposals.push({ type: 'remediation', action: 'review_weak_concepts', priority: 'high' });
            } else if (agent.role === 'Task optimization') {
                proposals.push({ type: 'plan', action: 'adjust_schedule', priority: 'medium' });
            } else if (agent.role === 'Long-term planning') {
                proposals.push({ type: 'strategy', action: 'accelerate_roadmap', priority: 'low' });
            } else if (agent.role === 'Error detection') {
                proposals.push({ type: 'quality', action: 'review_recent_work', priority: 'high' });
            } else if (agent.role === 'Knowledge retention') {
                proposals.push({ type: 'memory', action: 'schedule_reviews', priority: 'medium' });
            }
        }

        if (proposals.length === 0) {
            proposals.push({ type: 'default', action: 'continue_learning', priority: 'medium' });
        }

        var sorted = proposals.sort(function(a, b) {
            var priorityMap = { high: 3, medium: 2, low: 1 };
            return (priorityMap[b.priority] || 1) - (priorityMap[a.priority] || 1);
        });

        var finalDecision = sorted[0] || { type: 'default', action: 'continue_learning', priority: 'medium' };
        LawAIApp.EventBus?.emit?.('ConsensusReached', finalDecision);
        console.log('🤝 Consensus reached:', finalDecision);
        return finalDecision;
    },

    getProposals: function(status) {
        if (status) {
            return this.proposals.filter(function(p) { return p.status === status; });
        }
        return this.proposals;
    },

    getPendingProposals: function() {
        return this.getProposals('pending');
    },

    getVoters: function() {
        return this._voters;
    },

    clearProposals: function() {
        this.proposals = [];
        console.log('🧹 Proposals cleared');
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AgentConsensusEngine && typeof LawAIApp.AgentConsensusEngine.init === 'function') {
        LawAIApp.AgentConsensusEngine.init();
    }
}, 400);

console.log('🤝 AgentConsensusEngine V2.0 ready');
