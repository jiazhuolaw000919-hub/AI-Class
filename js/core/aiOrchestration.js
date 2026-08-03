// ============================================================
// aiOrchestration.js
// Part 55 — AI Orchestration Layer
// Version: v5.5
// Module: Runtime Intelligence System
// File: js/core/aiOrchestration.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AIOrchestration) {
        console.warn('[AIOrchestration] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Intelligence Types (Chapter 2-3)
    // ============================================================
    const INTELLIGENCE_TYPE = {
        DECISION: 'decision',
        PREDICTIVE: 'predictive',
        OPTIMIZATION: 'optimization',
        EVOLUTION: 'evolution',
        KNOWLEDGE: 'knowledge',
        GOVERNANCE: 'governance'
    };

    // ============================================================
    // Workflow Status
    // ============================================================
    const WORKFLOW_STATUS = {
        PENDING: 'PENDING',
        ANALYZING: 'ANALYZING',
        ROUTING: 'ROUTING',
        EXECUTING: 'EXECUTING',
        AGGREGATING: 'AGGREGATING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        CANCELLED: 'CANCELLED'
    };

    // ============================================================
    // Orchestration Context (Chapter 5)
    // ============================================================
    class OrchestrationContext {
        constructor(config) {
            this.orchestrationId = config.orchestrationId || this._generateId();
            this.timestamp = Date.now();
            this.task = config.task || 'unknown';
            this.requiredIntelligence = config.requiredIntelligence || [];
            this.workflow = config.workflow || [];
            this.priority = config.priority || 'MEDIUM';
            this.result = config.result || null;
            this.confidence = config.confidence || 0;
            this.status = WORKFLOW_STATUS.PENDING;
            this.metadata = config.metadata || {};
            this.executionLog = [];
        }

        _generateId() {
            return `orch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
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
                orchestrationId: this.orchestrationId,
                timestamp: this.timestamp,
                task: this.task,
                requiredIntelligence: this.requiredIntelligence,
                workflow: this.workflow,
                priority: this.priority,
                result: this.result,
                confidence: this.confidence,
                status: this.status,
                executionLog: this.executionLog,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Intelligence Registry
    // ============================================================
    class IntelligenceRegistry {
        constructor() {
            this._intelligences = {};
            this._discovered = false;
        }

        register(type, instance, capabilities) {
            this._intelligences[type] = {
                instance: instance,
                capabilities: capabilities || [],
                registeredAt: Date.now(),
                status: 'active'
            };
            console.log(`[AIOrchestration] Registered intelligence: ${type}`);
            return this;
        }

        get(type) {
            return this._intelligences[type] || null;
        }

        getAll() {
            return this._intelligences;
        }

        getAvailable() {
            const available = [];
            for (const type in this._intelligences) {
                if (this._intelligences[type].status === 'active') {
                    available.push(type);
                }
            }
            return available;
        }

        discover() {
            this._discovered = true;
            return this._intelligences;
        }

        isDiscovered() {
            return this._discovered;
        }
    }

    // ============================================================
    // AI Orchestration Core (Chapter 1-4)
    // ============================================================
    class AIOrchestration {
        constructor() {
            this._registry = new IntelligenceRegistry();
            this._contexts = [];
            this._activeContext = null;
            this._workflowTemplates = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxContextHistory: 100,
                defaultPriority: 'MEDIUM',
                enableAutoDiscovery: true,
                timeout: 30000,
                maxConcurrentWorkflows: 5
            };
            this._intelligenceStatus = {};
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[AIOrchestration] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[AIOrchestration] Initializing...');

            // Discover and register intelligences (Chapter 4)
            this._discoverIntelligences();

            // Register workflow templates
            this._registerWorkflowTemplates();

            // Connect to modules (Chapter 8)
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToOptimizationLayer();
            this._connectToEvolutionSystem();
            this._connectToKnowledgeGraph();
            this._connectToGovernanceFramework();
            this._connectToRuntimeRegistry();

            // Register with Explorer
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[AIOrchestration] Initialized ✅');
            console.log('[AIOrchestration] Registered intelligences:', this._registry.getAvailable().join(', '));
            return this;
        }

        // ============================================================
        // Intelligence Discovery (Chapter 4)
        // ============================================================

        _discoverIntelligences() {
            const app = window.LawAIApp;

            // Decision Intelligence
            if (app.DecisionIntelligence) {
                this._registry.register(
                    INTELLIGENCE_TYPE.DECISION,
                    app.DecisionIntelligence,
                    ['analyze', 'decide', 'explain', 'reason']
                );
            }

            // Predictive Intelligence
            if (app.PredictiveIntelligence) {
                this._registry.register(
                    INTELLIGENCE_TYPE.PREDICTIVE,
                    app.PredictiveIntelligence,
                    ['predict', 'forecast', 'trend', 'risk']
                );
            }

            // Optimization Intelligence
            if (app.OptimizationIntelligence) {
                this._registry.register(
                    INTELLIGENCE_TYPE.OPTIMIZATION,
                    app.OptimizationIntelligence,
                    ['optimize', 'analyze', 'recommend', 'resource']
                );
            }

            // Evolution Intelligence
            if (app.EvolutionIntelligence) {
                this._registry.register(
                    INTELLIGENCE_TYPE.EVOLUTION,
                    app.EvolutionIntelligence,
                    ['evolve', 'adapt', 'grow', 'module']
                );
            }

            // Knowledge Intelligence
            if (app.KnowledgeGraph) {
                this._registry.register(
                    INTELLIGENCE_TYPE.KNOWLEDGE,
                    app.KnowledgeGraph,
                    ['query', 'relate', 'entity', 'graph']
                );
            }

            // Governance Intelligence
            if (app.Governance || app.EvolutionGovernance) {
                this._registry.register(
                    INTELLIGENCE_TYPE.GOVERNANCE,
                    app.Governance || app.EvolutionGovernance,
                    ['review', 'approve', 'audit', 'policy']
                );
            }

            this._registry.discover();
        }

        // ============================================================
        // Workflow Templates
        // ============================================================

        _registerWorkflowTemplates() {
            // Template: Decision Workflow
            this._workflowTemplates['decision'] = {
                steps: [
                    { intelligence: INTELLIGENCE_TYPE.DECISION, action: 'analyze' },
                    { intelligence: INTELLIGENCE_TYPE.KNOWLEDGE, action: 'query' },
                    { intelligence: INTELLIGENCE_TYPE.GOVERNANCE, action: 'review' }
                ],
                description: 'Standard decision workflow'
            };

            // Template: Prediction Workflow
            this._workflowTemplates['prediction'] = {
                steps: [
                    { intelligence: INTELLIGENCE_TYPE.PREDICTIVE, action: 'predict' },
                    { intelligence: INTELLIGENCE_TYPE.KNOWLEDGE, action: 'query' },
                    { intelligence: INTELLIGENCE_TYPE.DECISION, action: 'analyze' }
                ],
                description: 'Prediction with knowledge and decision'
            };

            // Template: Optimization Workflow
            this._workflowTemplates['optimization'] = {
                steps: [
                    { intelligence: INTELLIGENCE_TYPE.OPTIMIZATION, action: 'analyze' },
                    { intelligence: INTELLIGENCE_TYPE.DECISION, action: 'decide' },
                    { intelligence: INTELLIGENCE_TYPE.GOVERNANCE, action: 'review' }
                ],
                description: 'Optimization with decision and governance'
            };

            // Template: Evolution Workflow
            this._workflowTemplates['evolution'] = {
                steps: [
                    { intelligence: INTELLIGENCE_TYPE.EVOLUTION, action: 'evolve' },
                    { intelligence: INTELLIGENCE_TYPE.OPTIMIZATION, action: 'analyze' },
                    { intelligence: INTELLIGENCE_TYPE.GOVERNANCE, action: 'approve' }
                ],
                description: 'Evolution with optimization and governance'
            };

            // Template: Full Intelligence Workflow
            this._workflowTemplates['full'] = {
                steps: [
                    { intelligence: INTELLIGENCE_TYPE.PREDICTIVE, action: 'predict' },
                    { intelligence: INTELLIGENCE_TYPE.DECISION, action: 'analyze' },
                    { intelligence: INTELLIGENCE_TYPE.OPTIMIZATION, action: 'optimize' },
                    { intelligence: INTELLIGENCE_TYPE.EVOLUTION, action: 'evolve' },
                    { intelligence: INTELLIGENCE_TYPE.KNOWLEDGE, action: 'query' },
                    { intelligence: INTELLIGENCE_TYPE.GOVERNANCE, action: 'review' }
                ],
                description: 'Full intelligence workflow'
            };

            console.log('[AIOrchestration] Registered workflow templates:', Object.keys(this._workflowTemplates).join(', '));
        }

        // ============================================================
        // Core: Execute Workflow (Chapter 7)
        // ============================================================

        execute(task, options) {
            console.log(`[AIOrchestration] Executing workflow for: ${task}`);

            // Determine workflow type
            const workflowType = this._determineWorkflowType(task, options);

            // Get workflow template
            const template = this._workflowTemplates[workflowType];
            if (!template) {
                console.warn(`[AIOrchestration] No workflow template for: ${workflowType}`);
                return null;
            }

            // Create orchestration context
            const context = new OrchestrationContext({
                task: task,
                requiredIntelligence: template.steps.map(s => s.intelligence),
                workflow: template.steps,
                priority: options?.priority || this._config.defaultPriority,
                metadata: {
                    workflowType: workflowType,
                    options: options || {},
                    startedAt: Date.now()
                }
            });

            context.status = WORKFLOW_STATUS.ANALYZING;
            this._contexts.push(context);
            this._activeContext = context;

            this._emit('workflowStarted', context.toJSON());

            try {
                // Execute each step (Chapter 6-7)
                const results = this._executeSteps(context, template.steps, options);

                // Aggregate results
                const aggregated = this._aggregateResults(results);

                // Update context
                context.result = aggregated;
                context.confidence = this._calculateConfidence(results);
                context.status = WORKFLOW_STATUS.COMPLETED;
                context.addLog({ action: 'completed', result: 'success' });

                this._emit('workflowCompleted', context.toJSON());

                return context;

            } catch (error) {
                context.status = WORKFLOW_STATUS.FAILED;
                context.addLog({ action: 'failed', error: error.message });
                this._emit('workflowFailed', {
                    context: context.toJSON(),
                    error: error.message
                });
                console.error('[AIOrchestration] Workflow failed:', error);
                return null;
            }
        }

        // ============================================================
        // Step Execution (Chapter 6-7)
        // ============================================================

        _executeSteps(context, steps, options) {
            const results = [];

            for (const step of steps) {
                context.status = WORKFLOW_STATUS.EXECUTING;
                context.addLog({ action: 'executing_step', intelligence: step.intelligence });

                const intelligence = this._registry.get(step.intelligence);
                if (!intelligence) {
                    throw new Error(`Intelligence not available: ${step.intelligence}`);
                }

                // Execute the intelligence action
                const result = this._executeIntelligence(intelligence, step.action, context, options);
                results.push({
                    intelligence: step.intelligence,
                    action: step.action,
                    result: result,
                    timestamp: Date.now()
                });

                context.addLog({
                    action: 'step_completed',
                    intelligence: step.intelligence,
                    result: result ? 'success' : 'failed'
                });

                // Check for stop condition
                if (result && result.stop) break;
            }

            return results;
        }

        _executeIntelligence(intelligence, action, context, options) {
            const instance = intelligence.instance;
            if (!instance) {
                console.warn(`[AIOrchestration] No instance for: ${intelligence}`);
                return null;
            }

            // Map action to method
            const methodMap = {
                'analyze': 'analyze' in instance ? 'analyze' : 'analyzeAll',
                'predict': 'predict' in instance ? 'predict' : 'predictAll',
                'decide': 'decide' in instance ? 'decide' : 'analyze',
                'optimize': 'optimize' in instance ? 'optimize' : 'analyze',
                'review': 'review' in instance ? 'review' : 'reviewProposal',
                'approve': 'approve' in instance ? 'approve' : 'approveProposal',
                'evolve': 'evolve' in instance ? 'evolve' : 'discover',
                'query': 'query' in instance ? 'query' : 'getData',
                'forecast': 'forecast' in instance ? 'forecast' : 'predict',
                'trend': 'trend' in instance ? 'trend' : 'predictTrend',
                'risk': 'risk' in instance ? 'risk' : 'forecast',
                'reason': 'reason' in instance ? 'reason' : 'analyze',
                'audit': 'audit' in instance ? 'audit' : 'getAuditTrail',
                'policy': 'policy' in instance ? 'policy' : 'getStats'
            };

            const methodName = methodMap[action] || 'analyze';
            if (typeof instance[methodName] !== 'function') {
                console.warn(`[AIOrchestration] Method not found: ${methodName} on ${intelligence}`);
                return null;
            }

            try {
                // Prepare arguments based on context
                const args = this._prepareArguments(context, action);
                const result = instance[methodName](...args);
                return result;
            } catch (error) {
                console.error(`[AIOrchestration] Intelligence execution error (${intelligence}):`, error);
                return null;
            }
        }

        _prepareArguments(context, action) {
            // Prepare arguments based on the action
            const task = context.task;
            const options = context.metadata.options || {};

            switch (action) {
                case 'predict':
                case 'forecast':
                case 'trend':
                case 'risk':
                    return [task, options];
                case 'analyze':
                case 'decide':
                case 'optimize':
                case 'evolve':
                    return [options];
                case 'review':
                case 'approve':
                    return [task, options];
                case 'query':
                    return [task];
                default:
                    return [options];
            }
        }

        // ============================================================
        // Result Aggregation (Chapter 4, 7)
        // ============================================================

        _aggregateResults(results) {
            const aggregated = {
                total: results.length,
                successful: results.filter(r => r.result !== null).length,
                failed: results.filter(r => r.result === null).length,
                details: results.map(r => ({
                    intelligence: r.intelligence,
                    action: r.action,
                    success: r.result !== null,
                    timestamp: r.timestamp
                })),
                outputs: results.filter(r => r.result !== null).map(r => r.result),
                timestamp: Date.now()
            };

            return aggregated;
        }

        _calculateConfidence(results) {
            const successful = results.filter(r => r.result !== null);
            if (successful.length === 0) return 0;
            return Math.round((successful.length / results.length) * 100);
        }

        // ============================================================
        // Workflow Type Determination
        // ============================================================

        _determineWorkflowType(task, options) {
            const taskLower = task.toLowerCase();
            const requested = options?.workflowType;

            if (requested && this._workflowTemplates[requested]) {
                return requested;
            }

            if (taskLower.includes('predict') || taskLower.includes('forecast') || taskLower.includes('trend')) {
                return 'prediction';
            }
            if (taskLower.includes('optimize') || taskLower.includes('resource') || taskLower.includes('performance')) {
                return 'optimization';
            }
            if (taskLower.includes('evolve') || taskLower.includes('grow') || taskLower.includes('adapt')) {
                return 'evolution';
            }
            if (taskLower.includes('decide') || taskLower.includes('decision') || taskLower.includes('recommend')) {
                return 'decision';
            }

            return 'full';
        }

        // ============================================================
        // Conflict Resolution (Chapter 4)
        // ============================================================

        resolveConflict(conflicts) {
            console.log('[AIOrchestration] Resolving conflicts...');

            const resolved = {
                conflicts: conflicts,
                resolution: 'priority_based',
                selected: [],
                timestamp: Date.now()
            };

            // Priority-based resolution
            const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

            conflicts.sort((a, b) => {
                const aP = priorityOrder[a.priority] || 4;
                const bP = priorityOrder[b.priority] || 4;
                return aP - bP;
            });

            // Select highest priority
            if (conflicts.length > 0) {
                resolved.selected = [conflicts[0]];
            }

            this._emit('conflictResolved', resolved);
            return resolved;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getWorkflowHistory(limit) {
            return this._contexts.slice(-(limit || 10)).reverse().map(c => c.toJSON());
        }

        getActiveWorkflow() {
            return this._activeContext ? this._activeContext.toJSON() : null;
        }

        getIntelligenceStatus() {
            return {
                available: this._registry.getAvailable(),
                all: this._registry.getAll(),
                discovered: this._registry.isDiscovered()
            };
        }

        getStats() {
            const total = this._contexts.length;
            const completed = this._contexts.filter(c => c.status === WORKFLOW_STATUS.COMPLETED).length;
            const failed = this._contexts.filter(c => c.status === WORKFLOW_STATUS.FAILED).length;
            const pending = this._contexts.filter(c => c.status === WORKFLOW_STATUS.PENDING).length;

            const avgConfidence = total > 0 ?
                Math.round(this._contexts.reduce((sum, c) => sum + c.confidence, 0) / total) :
                0;

            const byType = {};
            this._contexts.forEach(c => {
                const type = c.metadata?.workflowType || 'unknown';
                byType[type] = (byType[type] || 0) + 1;
            });

            return {
                total,
                completed,
                failed,
                pending,
                avgConfidence,
                byType,
                availableIntelligences: this._registry.getAvailable().length,
                workflowTemplates: Object.keys(this._workflowTemplates).length
            };
        }

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const active = this.getActiveWorkflow();
            const recent = this.getWorkflowHistory(5);

            return {
                type: 'ai_orchestration',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                activeWorkflow: active,
                recentWorkflows: recent,
                intelligences: this.getIntelligenceStatus(),
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
                        console.error('[AIOrchestration] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`orchestration.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 8)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[AIOrchestration] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[AIOrchestration] Connected to Predictive Runtime');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[AIOrchestration] Connected to Optimization Layer');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[AIOrchestration] Connected to Evolution System');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[AIOrchestration] Connected to Knowledge Graph');
            }
        }

        _connectToGovernanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance) {
                console.log('[AIOrchestration] Connected to Governance Framework');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[AIOrchestration] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'ai-orchestration',
                        name: 'AI Orchestration',
                        category: 'intelligence',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[AIOrchestration] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[AIOrchestration] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[AIOrchestration] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new AIOrchestration();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AIOrchestration = {
        Core: instance,
        INTELLIGENCE_TYPE: INTELLIGENCE_TYPE,
        WORKFLOW_STATUS: WORKFLOW_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        execute: (task, options) => instance.execute(task, options),
        resolveConflict: (conflicts) => instance.resolveConflict(conflicts),

        getWorkflowHistory: (limit) => instance.getWorkflowHistory(limit),
        getActiveWorkflow: () => instance.getActiveWorkflow(),
        getIntelligenceStatus: () => instance.getIntelligenceStatus(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[AIOrchestration] Part 55 loaded ✅');
    console.log('[AIOrchestration] Intelligence Types:', Object.values(INTELLIGENCE_TYPE).join(' | '));

})();
