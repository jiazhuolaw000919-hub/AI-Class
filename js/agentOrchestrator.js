// ===========================================
// agentOrchestrator.js
// 多智能体学习生态 - 代理编排器（Phase 61 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AgentOrchestrator = {
    agents: [],
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🤖 AgentOrchestrator initializing...');

        // 延迟启动，确保依赖加载
        setTimeout(function() {
            LawAIApp.AgentOrchestrator.start();
        }, 600);
    },

    start: function() {
        console.log('🤖 Multi-Agent Learning Ecosystem activating...');

        // 清除旧代理
        this.agents = [];

        // 安全创建代理
        var agentClasses = {
            'MentorAgent': 'Teaching & guidance',
            'PlannerAgent': 'Task optimization',
            'ReviewerAgent': 'Error detection',
            'StrategyAgent': 'Long-term planning',
            'MemoryAgent': 'Knowledge retention'
        };

        for (var name in agentClasses) {
            try {
                if (LawAIApp[name] && typeof LawAIApp[name] === 'function') {
                    var agent = new LawAIApp[name]();
                    this.agents.push(agent);
                    console.log('✅ Agent loaded:', name);
                } else {
                    console.warn('⚠️ Agent class not found:', name);
                    // 创建占位代理
                    this.agents.push({
                        name: name,
                        role: agentClasses[name] || 'General',
                        active: true,
                        log: function(msg) { console.log('[' + this.name + '] ' + msg); },
                        emit: function(e, d) { LawAIApp.EventBus?.emit?.(e, d); },
                        on: function(e, cb) { LawAIApp.EventBus?.on?.(e, cb); }
                    });
                }
            } catch (err) {
                console.warn('⚠️ Failed to create agent:', name, err);
            }
        }

        console.log('✅ ' + this.agents.length + ' agents activated');
        LawAIApp.EventBus?.emit?.('AgentsReady', { agents: this.agents });
    },

    getAgent: function(name) {
        for (var i = 0; i < this.agents.length; i++) {
            if (this.agents[i].name === name || this.agents[i].name === name + 'Agent') {
                return this.agents[i];
            }
        }
        return null;
    },

    getAgentsByRole: function(role) {
        return this.agents.filter(function(a) { return a.role === role; });
    },

    getActiveAgents: function() {
        return this.agents.filter(function(a) { return a.active !== false; });
    },

    getStatus: function() {
        return {
            total: this.agents.length,
            active: this.getActiveAgents().length,
            agents: this.agents.map(function(a) {
                return { name: a.name, role: a.role, active: a.active !== false };
            })
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.AgentOrchestrator && typeof LawAIApp.AgentOrchestrator.init === 'function') {
        LawAIApp.AgentOrchestrator.init();
    }
}, 300);

console.log('🤖 AgentOrchestrator V2.0 ready');
