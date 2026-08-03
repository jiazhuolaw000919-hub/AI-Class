// ============================================================
// multiAgentWorkflow.js
// Part 55.3 — Multi-Agent Workflow Manager
// Version: v5.5.3
// Module: AI Orchestration Layer
// File: js/core/multiAgentWorkflow.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.MultiAgentWorkflow) {
        console.warn('[MultiAgentWorkflow] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Workflow Status (Chapter 10)
    // ============================================================
    const WORKFLOW_STATUS = {
        CREATED: 'created',
        PLANNING: 'planning',
        RUNNING: 'running',
        WAITING: 'waiting',
        COMPLETED: 'completed',
        FAILED: 'failed',
        CANCELLED: 'cancelled'
    };

    // ============================================================
    // Agent Role Types (Chapter 4)
    // ============================================================
    const AGENT_ROLE = {
        DECISION: 'decision',
        PREDICTIVE: 'predictive',
        OPTIMIZATION: 'optimization',
        EVOLUTION: 'evolution',
        KNOWLEDGE: 'knowledge',
        GOVERNANCE: 'governance'
    };

    // ============================================================
    // Workflow Pattern Types (Chapter 8)
    // ============================================================
    const WORKFLOW_PATTERN = {
        SEQUENTIAL: 'sequential',
        PARALLEL: 'parallel',
        REVIEW: 'review',
        CUSTOM: 'custom'
    };

    // ============================================================
    // Agent Model (Chapter 5)
    // ============================================================
    class Agent {
        constructor(config) {
            this.agentId = config.agentId || this._generateId();
            this.timestamp = Date.now();
            this.name = config.name || 'unknown';
            this.capability = config.capability || [];
            this.role = config.role || AGENT_ROLE.DECISION;
            this.priority = config.priority || 50;
            this.status = config.status || 'available';
            this.confidence = config.confidence || 0;
            this.instance = config.instance || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                agentId: this.agentId,
                timestamp: this.timestamp,
                name: this.name,
                capability: this.capability,
                role: this.role,
                priority: this.priority,
                status: this.status,
                confidence: this.confidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Workflow Model (Chapter 6)
    // ============================================================
    class Workflow {
        constructor(config) {
            this.workflowId = config.workflowId || this._generateId();
            this.timestamp = Date.now();
            this.objective = config.objective || '';
            this.agents = config.agents || [];
            this.sequence = config.sequence || [];
            this.dependencies = config.dependencies || {};
            this.state = WORKFLOW_STATUS.CREATED;
            this.result = config.result || null;
            this.pattern = config.pattern || WORKFLOW_PATTERN.SEQUENTIAL;
            this.metadata = config.metadata || {};
            this.startedAt = null;
            this.completedAt = null;
            this.failureReason = null;
            this.executionLog = [];
        }

        _generateId() {
            return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        addLog(entry) {
            this.executionLog.push({
                timestamp: Date.now(),
                ...entry
            });
            return this;
        }

        toJSON() {
            return {
                workflowId: this.workflowId,
                timestamp: this.timestamp,
                objective: this.objective,
                agents: this.agents,
                sequence: this.sequence,
                dependencies: this.dependencies,
                state: this.state,
                result: this.result,
                pattern: this.pattern,
                startedAt: this.startedAt,
                completedAt: this.completedAt,
                failureReason: this.failureReason,
                executionLog: this.executionLog,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Multi-Agent Workflow Manager Core (Chapter 1-3)
    // ============================================================
    class MultiAgentWorkflow {
        constructor() {
            this._workflows = [];
            this._agents = [];
            this._activeWorkflows = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxWorkflowHistory: 100,
                maxConcurrentWorkflows: 5,
                timeout: 60000,
                retryAttempts: 3,
                retryDelay: 1000,
                enableAutoWorkflow: true
            };
            this._agentRegistry = this._initAgentRegistry();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[MultiAgentWorkflow] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[MultiAgentWorkflow] Initializing...');

            // Register default agents (Chapter 4)
            this._registerDefaultAgents();

            // Connect to modules (Chapter 12)
            this._connectToOrchestrationIntelligence();
            this._connectToCoordinationEngine();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToOptimizationLayer();
            this._connectToEvolutionSystem();
            this._connectToGovernanceFramework();

            // Register with Explorer (Chapter 13)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[MultiAgentWorkflow] Initialized ✅');
            return this;
        }

        // ============================================================
        // Agent Registry (Chapter 4-5)
        // ============================================================

        _initAgentRegistry() {
            return {};
        }

        _registerDefaultAgents() {
            // Decision Agent
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                this.registerAgent({
                    name: 'Decision Agent',
                    role: AGENT_ROLE.DECISION,
                    capability: ['analyze', 'decide', 'reason', 'explain'],
                    priority: 10,
                    instance: window.LawAIApp.DecisionIntelligence,
                    confidence: 85
                });
            }

            // Predictive Agent
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                this.registerAgent({
                    name: 'Predictive Agent',
                    role: AGENT_ROLE.PREDICTIVE,
                    capability: ['predict', 'forecast', 'trend', 'risk'],
                    priority: 20,
                    instance: window.LawAIApp.PredictiveIntelligence,
                    confidence: 80
                });
            }

            // Optimization Agent
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                this.registerAgent({
                    name: 'Optimization Agent',
                    role: AGENT_ROLE.OPTIMIZATION,
                    capability: ['optimize', 'analyze', 'recommend'],
                    priority: 30,
                    instance: window.LawAIApp.OptimizationIntelligence,
                    confidence: 75
                });
            }

            // Evolution Agent
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                this.registerAgent({
                    name: 'Evolution Agent',
                    role: AGENT_ROLE.EVOLUTION,
                    capability: ['evolve', 'adapt', 'grow'],
                    priority: 40,
                    instance: window.LawAIApp.EvolutionIntelligence,
                    confidence: 70
                });
            }

            // Knowledge Agent
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                this.registerAgent({
                    name: 'Knowledge Agent',
                    role: AGENT_ROLE.KNOWLEDGE,
                    capability: ['query', 'relate', 'entity'],
                    priority: 50,
                    instance: window.LawAIApp.KnowledgeGraph,
                    confidence: 90
                });
            }

            // Governance Agent
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                this.registerAgent({
                    name: 'Governance Agent',
                    role: AGENT_ROLE.GOVERNANCE,
                    capability: ['review', 'approve', 'audit'],
                    priority: 5,
                    instance: window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance,
                    confidence: 95
                });
            }
        }

        registerAgent(config) {
            const agent = new Agent({
                name: config.name,
                capability: config.capability || [],
                role: config.role || AGENT_ROLE.DECISION,
                priority: config.priority || 50,
                instance: config.instance || null,
                confidence: config.confidence || 60,
                metadata: config.metadata || {}
            });

            this._agents.push(agent);
            this._agentRegistry[agent.agentId] = agent;

            console.log(`[MultiAgentWorkflow] Registered agent: ${agent.name} (${agent.role})`);
            return agent;
        }

        getAgent(role) {
            return this._agents.find(a => a.role === role) || null;
        }

        getAgents(filter) {
            let agents = this._agents;

            if (filter) {
                if (filter.role) {
                    agents = agents.filter(a => a.role === filter.role);
                }
                if (filter.status) {
                    agents = agents.filter(a => a.status === filter.status);
                }
                if (filter.minConfidence) {
                    agents = agents.filter(a => a.confidence >= filter.minConfidence);
                }
            }

            return agents.map(a => a.toJSON());
        }

        // ============================================================
        // Core: Create Workflow (Chapter 7)
        // ============================================================

        createWorkflow(objective, options) {
            console.log(`[MultiAgentWorkflow] Creating workflow for: ${objective}`);

            // Analyze task to determine agent requirements
            const requiredAgents = this._analyzeTask(objective);

            // Generate workflow sequence (Chapter 8)
            const sequence = this._generateSequence(requiredAgents, options);

            // Build dependencies
            const dependencies = this._buildDependencies(sequence);

            // Create workflow
            const workflow = new Workflow({
                objective: objective,
                agents: requiredAgents.map(a => a.agentId),
                sequence: sequence.map(s => s.agentId),
                dependencies: dependencies,
                pattern: options?.pattern || WORKFLOW_PATTERN.SEQUENTIAL,
                metadata: {
                    options: options || {},
                    createdBy: 'workflow_manager',
                    agentCount: requiredAgents.length
                }
            });

            this._workflows.push(workflow);

            this._emit('workflowCreated', workflow.toJSON());

            return workflow;
        }

        // ============================================================
        // Task Analysis (Chapter 3, 7)
        // ============================================================

        _analyzeTask(objective) {
            const requiredAgents = [];
            const objectiveLower = objective.toLowerCase();

            // Determine required agents based on task
            if (objectiveLower.includes('predict') || objectiveLower.includes('forecast') || 
                objectiveLower.includes('trend') || objectiveLower.includes('risk')) {
                const agent = this.getAgent(AGENT_ROLE.PREDICTIVE);
                if (agent) requiredAgents.push(agent);
            }

            if (objectiveLower.includes('optimize') || objectiveLower.includes('resource') || 
                objectiveLower.includes('performance') || objectiveLower.includes('improve')) {
                const agent = this.getAgent(AGENT_ROLE.OPTIMIZATION);
                if (agent) requiredAgents.push(agent);
            }

            if (objectiveLower.includes('decide') || objectiveLower.includes('decision') || 
                objectiveLower.includes('recommend')) {
                const agent = this.getAgent(AGENT_ROLE.DECISION);
                if (agent) requiredAgents.push(agent);
            }

            if (objectiveLower.includes('evolve') || objectiveLower.includes('grow') || 
                objectiveLower.includes('adapt') || objectiveLower.includes('module')) {
                const agent = this.getAgent(AGENT_ROLE.EVOLUTION);
                if (agent) requiredAgents.push(agent);
            }

            if (objectiveLower.includes('knowledge') || objectiveLower.includes('graph') || 
                objectiveLower.includes('entity') || objectiveLower.includes('query')) {
                const agent = this.getAgent(AGENT_ROLE.KNOWLEDGE);
                if (agent) requiredAgents.push(agent);
            }

            // Always include governance for high risk
            if (objectiveLower.includes('critical') || objectiveLower.includes('security') || 
                objectiveLower.includes('core') || objectiveLower.includes('governance')) {
                const agent = this.getAgent(AGENT_ROLE.GOVERNANCE);
                if (agent && !requiredAgents.some(a => a.role === AGENT_ROLE.GOVERNANCE)) {
                    requiredAgents.push(agent);
                }
            }

            // If no agents determined, add default decision agent
            if (requiredAgents.length === 0) {
                const agent = this.getAgent(AGENT_ROLE.DECISION);
                if (agent) requiredAgents.push(agent);
            }

            return requiredAgents;
        }

        // ============================================================
        // Sequence Generation (Chapter 8)
        // ============================================================

        _generateSequence(agents, options) {
            const pattern = options?.pattern || WORKFLOW_PATTERN.SEQUENTIAL;

            // Sort agents by priority
            const sortedAgents = [...agents].sort((a, b) => a.priority - b.priority);

            switch (pattern) {
                case WORKFLOW_PATTERN.SEQUENTIAL:
                    return sortedAgents;
                case WORKFLOW_PATTERN.REVIEW:
                    return this._generateReviewSequence(sortedAgents);
                case WORKFLOW_PATTERN.PARALLEL:
                    return sortedAgents; // Will be executed in parallel
                default:
                    return sortedAgents;
            }
        }

        _generateReviewSequence(agents) {
            // Review pattern: Decision → Governance
            const decision = agents.find(a => a.role === AGENT_ROLE.DECISION);
            const governance = agents.find(a => a.role === AGENT_ROLE.GOVERNANCE);

            if (decision && governance) {
                return [decision, governance];
            }

            if (decision) return [decision];
            return agents;
        }

        _buildDependencies(sequence) {
            const dependencies = {};
            for (let i = 1; i < sequence.length; i++) {
                dependencies[sequence[i]] = [sequence[i - 1]];
            }
            return dependencies;
        }

        // ============================================================
        // Core: Start Workflow (Chapter 9, 10)
        // ============================================================

        startWorkflow(workflowId) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            if (!workflow) {
                console.warn(`[MultiAgentWorkflow] Workflow not found: ${workflowId}`);
                return false;
            }

            if (workflow.state !== WORKFLOW_STATUS.CREATED && workflow.state !== WORKFLOW_STATUS.WAITING) {
                console.warn(`[MultiAgentWorkflow] Cannot start workflow in ${workflow.state} state`);
                return false;
            }

            // Check concurrent limit
            const activeCount = this._workflows.filter(w => 
                w.state === WORKFLOW_STATUS.RUNNING
            ).length;

            if (activeCount >= this._config.maxConcurrentWorkflows) {
                workflow.state = WORKFLOW_STATUS.WAITING;
                console.warn(`[MultiAgentWorkflow] Max concurrent workflows reached, workflow waiting`);
                return false;
            }

            workflow.state = WORKFLOW_STATUS.RUNNING;
            workflow.startedAt = Date.now();
            workflow.addLog({ action: 'started', timestamp: Date.now() });

            this._activeWorkflows.push(workflow);

            this._emit('workflowStarted', workflow.toJSON());

            // Execute workflow
            this._executeWorkflow(workflow);

            return true;
        }

        // ============================================================
        // Workflow Execution (Chapter 3, 9)
        // ============================================================

        _executeWorkflow(workflow) {
            const sequence = workflow.sequence;
            const results = [];

            try {
                for (let i = 0; i < sequence.length; i++) {
                    const agentId = sequence[i];
                    const agent = this._agents.find(a => a.agentId === agentId);

                    if (!agent) {
                        workflow.failureReason = `Agent not found: ${agentId}`;
                        workflow.state = WORKFLOW_STATUS.FAILED;
                        this._handleFailure(workflow);
                        return;
                    }

                    // Check dependencies
                    const deps = workflow.dependencies[agentId] || [];
                    for (const dep of deps) {
                        const depResult = results.find(r => r.agentId === dep);
                        if (!depResult || depResult.error) {
                            workflow.failureReason = `Dependency failed: ${dep}`;
                            workflow.state = WORKFLOW_STATUS.FAILED;
                            this._handleFailure(workflow);
                            return;
                        }
                    }

                    // Execute agent
                    const result = this._executeAgent(agent, workflow, results);

                    if (result.error) {
                        workflow.failureReason = result.error;
                        workflow.state = WORKFLOW_STATUS.FAILED;
                        this._handleFailure(workflow);
                        return;
                    }

                    results.push({
                        agentId: agentId,
                        result: result,
                        timestamp: Date.now()
                    });

                    workflow.addLog({
                        action: 'agent_completed',
                        agent: agent.name,
                        result: result.success ? 'success' : 'failed'
                    });
                }

                // Workflow completed
                workflow.state = WORKFLOW_STATUS.COMPLETED;
                workflow.completedAt = Date.now();
                workflow.result = results;

                this._activeWorkflows = this._activeWorkflows.filter(w => w.workflowId !== workflow.workflowId);

                this._emit('workflowCompleted', workflow.toJSON());

            } catch (error) {
                workflow.failureReason = error.message;
                workflow.state = WORKFLOW_STATUS.FAILED;
                this._handleFailure(workflow);
            }
        }

        // ============================================================
        // Agent Execution (Chapter 9)
        // ============================================================

        _executeAgent(agent, workflow, previousResults) {
            const instance = agent.instance;
            if (!instance) {
                return { error: `Agent instance not available: ${agent.name}` };
            }

            try {
                // Prepare context from previous results
                const context = {
                    workflowId: workflow.workflowId,
                    objective: workflow.objective,
                    previousResults: previousResults,
                    timestamp: Date.now()
                };

                // Map agent role to method
                const methodMap = {
                    [AGENT_ROLE.DECISION]: 'analyze',
                    [AGENT_ROLE.PREDICTIVE]: 'predict',
                    [AGENT_ROLE.OPTIMIZATION]: 'analyze',
                    [AGENT_ROLE.EVOLUTION]: 'analyze',
                    [AGENT_ROLE.KNOWLEDGE]: 'query',
                    [AGENT_ROLE.GOVERNANCE]: 'review'
                };

                const methodName = methodMap[agent.role] || 'analyze';
                if (typeof instance[methodName] !== 'function') {
                    return { error: `Method not found: ${methodName}` };
                }

                const result = instance[methodName](workflow.objective, context);

                return {
                    success: true,
                    result: result,
                    agent: agent.name,
                    role: agent.role,
                    confidence: agent.confidence
                };

            } catch (error) {
                return { error: error.message };
            }
        }

        // ============================================================
        // Failure Handling (Chapter 11)
        // ============================================================

        _handleFailure(workflow) {
            console.warn(`[MultiAgentWorkflow] Workflow failed: ${workflow.workflowId} - ${workflow.failureReason}`);

            // Attempt retry
            const retryCount = workflow.metadata.retryCount || 0;
            if (retryCount < this._config.retryAttempts) {
                workflow.metadata.retryCount = retryCount + 1;
                workflow.failureReason = null;
                workflow.state = WORKFLOW_STATUS.CREATED;

                setTimeout(() => {
                    this.startWorkflow(workflow.workflowId);
                }, this._config.retryDelay * (retryCount + 1));

                this._emit('workflowRetrying', {
                    workflowId: workflow.workflowId,
                    attempt: retryCount + 1
                });

                return;
            }

            // Escalate to governance
            const govAgent = this.getAgent(AGENT_ROLE.GOVERNANCE);
            if (govAgent) {
                this._escalateToGovernance(workflow);
            }

            workflow.completedAt = Date.now();
            this._activeWorkflows = this._activeWorkflows.filter(w => w.workflowId !== workflow.workflowId);

            this._emit('workflowFailed', {
                workflowId: workflow.workflowId,
                reason: workflow.failureReason,
                timestamp: Date.now()
            });
        }

        _escalateToGovernance(workflow) {
            console.log(`[MultiAgentWorkflow] Escalating workflow to governance: ${workflow.workflowId}`);

            const govAgent = this.getAgent(AGENT_ROLE.GOVERNANCE);
            if (govAgent && govAgent.instance && govAgent.instance.review) {
                try {
                    govAgent.instance.review(workflow, {
                        type: 'failure_escalation',
                        workflowId: workflow.workflowId,
                        failureReason: workflow.failureReason
                    });
                } catch (e) { /* ignore */ }
            }

            this._emit('workflowEscalated', {
                workflowId: workflow.workflowId,
                reason: workflow.failureReason
            });
        }

        // ============================================================
        // Workflow Control (Chapter 10)
        // ============================================================

        pauseWorkflow(workflowId) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            if (!workflow || workflow.state !== WORKFLOW_STATUS.RUNNING) return false;

            workflow.state = WORKFLOW_STATUS.WAITING;
            this._emit('workflowPaused', { workflowId: workflowId });
            return true;
        }

        resumeWorkflow(workflowId) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            if (!workflow || workflow.state !== WORKFLOW_STATUS.WAITING) return false;

            return this.startWorkflow(workflowId);
        }

        cancelWorkflow(workflowId, reason) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            if (!workflow) return false;

            workflow.state = WORKFLOW_STATUS.CANCELLED;
            workflow.completedAt = Date.now();
            workflow.failureReason = reason || 'Cancelled by user';

            this._activeWorkflows = this._activeWorkflows.filter(w => w.workflowId !== workflowId);

            this._emit('workflowCancelled', {
                workflowId: workflowId,
                reason: workflow.failureReason
            });

            return true;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getWorkflow(workflowId) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            return workflow ? workflow.toJSON() : null;
        }

        getWorkflows(filter) {
            let workflows = this._workflows;

            if (filter) {
                if (filter.state) {
                    workflows = workflows.filter(w => w.state === filter.state);
                }
                if (filter.pattern) {
                    workflows = workflows.filter(w => w.pattern === filter.pattern);
                }
                if (filter.limit) {
                    workflows = workflows.slice(-filter.limit);
                }
            }

            return workflows.map(w => w.toJSON());
        }

        getActiveWorkflows() {
            return this._activeWorkflows.map(w => w.toJSON());
        }

        getStatus(workflowId) {
            const workflow = this._workflows.find(w => w.workflowId === workflowId);
            return workflow ? {
                state: workflow.state,
                progress: this._calculateProgress(workflow),
                startedAt: workflow.startedAt,
                completedAt: workflow.completedAt
            } : null;
        }

        _calculateProgress(workflow) {
            if (workflow.state === WORKFLOW_STATUS.COMPLETED) return 100;
            if (workflow.state === WORKFLOW_STATUS.FAILED) return 0;

            const totalAgents = workflow.agents.length;
            const completed = workflow.executionLog.filter(l => 
                l.action === 'agent_completed'
            ).length;

            return totalAgents > 0 ? Math.round((completed / totalAgents) * 100) : 0;
        }

        getStats() {
            const total = this._workflows.length;
            const running = this._workflows.filter(w => w.state === WORKFLOW_STATUS.RUNNING).length;
            const completed = this._workflows.filter(w => w.state === WORKFLOW_STATUS.COMPLETED).length;
            const failed = this._workflows.filter(w => w.state === WORKFLOW_STATUS.FAILED).length;
            const cancelled = this._workflows.filter(w => w.state === WORKFLOW_STATUS.CANCELLED).length;
            const waiting = this._workflows.filter(w => w.state === WORKFLOW_STATUS.WAITING).length;

            const byPattern = {};
            this._workflows.forEach(w => {
                byPattern[w.pattern] = (byPattern[w.pattern] || 0) + 1;
            });

            return {
                total,
                running,
                completed,
                failed,
                cancelled,
                waiting,
                byPattern,
                activeAgents: this._agents.filter(a => a.status === 'available').length,
                totalAgents: this._agents.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 13)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const active = this.getActiveWorkflows();
            const recent = this.getWorkflows({ limit: 5 });

            return {
                type: 'multi_agent_workflow',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                activeWorkflows: active,
                recentWorkflows: recent,
                agents: this._agents.map(a => a.toJSON()),
                config: this._config
            };
        }

        // ============================================================
        // Listeners
        // ============================================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        }

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error('[MultiAgentWorkflow] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`workflow.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 12)
        // ============================================================

        _connectToOrchestrationIntelligence() {
            if (window.LawAIApp && window.LawAIApp.OrchestrationIntelligence) {
                console.log('[MultiAgentWorkflow] Connected to Orchestration Intelligence');
            }
        }

        _connectToCoordinationEngine() {
            if (window.LawAIApp && window.LawAIApp.IntelligenceCoordination) {
                console.log('[MultiAgentWorkflow] Connected to Coordination Engine');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[MultiAgentWorkflow] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[MultiAgentWorkflow] Connected to Predictive Runtime');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[MultiAgentWorkflow] Connected to Optimization Layer');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[MultiAgentWorkflow] Connected to Evolution System');
            }
        }

        _connectToGovernanceFramework() {
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                console.log('[MultiAgentWorkflow] Connected to Governance Framework');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'multi-agent-workflow',
                        name: 'Multi-Agent Workflow',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[MultiAgentWorkflow] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[MultiAgentWorkflow] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[MultiAgentWorkflow] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new MultiAgentWorkflow();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.MultiAgentWorkflow = {
        Core: instance,
        WORKFLOW_STATUS: WORKFLOW_STATUS,
        AGENT_ROLE: AGENT_ROLE,
        WORKFLOW_PATTERN: WORKFLOW_PATTERN,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        registerAgent: (config) => instance.registerAgent(config),
        getAgent: (role) => instance.getAgent(role),
        getAgents: (filter) => instance.getAgents(filter),

        createWorkflow: (objective, options) => instance.createWorkflow(objective, options),
        startWorkflow: (workflowId) => instance.startWorkflow(workflowId),
        pauseWorkflow: (workflowId) => instance.pauseWorkflow(workflowId),
        resumeWorkflow: (workflowId) => instance.resumeWorkflow(workflowId),
        cancelWorkflow: (workflowId, reason) => instance.cancelWorkflow(workflowId, reason),

        getWorkflow: (workflowId) => instance.getWorkflow(workflowId),
        getWorkflows: (filter) => instance.getWorkflows(filter),
        getActiveWorkflows: () => instance.getActiveWorkflows(),
        getStatus: (workflowId) => instance.getStatus(workflowId),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[MultiAgentWorkflow] Part 55.3 loaded ✅');
    console.log('[MultiAgentWorkflow] Agent Roles:', Object.values(AGENT_ROLE).join(' | '));
    console.log('[MultiAgentWorkflow] Workflow Patterns:', Object.values(WORKFLOW_PATTERN).join(' | '));

})();
