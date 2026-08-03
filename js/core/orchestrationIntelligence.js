// ============================================================
// orchestrationIntelligence.js
// Part 55.1 — Orchestration Intelligence Foundation
// Version: v5.5.1
// Module: AI Orchestration Layer
// File: js/core/orchestrationIntelligence.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OrchestrationIntelligence) {
        console.warn('[OrchestrationIntelligence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Intelligence Categories (Chapter 4)
    // ============================================================
    const INTELLIGENCE_CATEGORY = {
        DECISION: 'decision',
        PREDICTIVE: 'predictive',
        OPTIMIZATION: 'optimization',
        EVOLUTION: 'evolution',
        KNOWLEDGE: 'knowledge',
        GOVERNANCE: 'governance'
    };

    // ============================================================
    // Module Status
    // ============================================================
    const MODULE_STATUS = {
        DISCOVERED: 'discovered',
        REGISTERED: 'registered',
        ACTIVE: 'active',
        DEGRADED: 'degraded',
        UNAVAILABLE: 'unavailable'
    };

    // ============================================================
    // Intelligence Registry Model (Chapter 6)
    // ============================================================
    class IntelligenceModule {
        constructor(config) {
            this.intelligenceId = config.intelligenceId || this._generateId();
            this.timestamp = Date.now();
            this.name = config.name || 'unknown';
            this.category = config.category || INTELLIGENCE_CATEGORY.DECISION;
            this.capability = config.capability || [];
            this.status = config.status || MODULE_STATUS.DISCOVERED;
            this.priority = config.priority || 50;
            this.availability = config.availability || 0;
            this.confidence = config.confidence || 0;
            this.instance = config.instance || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `im_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                intelligenceId: this.intelligenceId,
                timestamp: this.timestamp,
                name: this.name,
                category: this.category,
                capability: this.capability,
                status: this.status,
                priority: this.priority,
                availability: this.availability,
                confidence: this.confidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Orchestration Context (Chapter 7)
    // ============================================================
    class OrchestrationContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.request = config.request || '';
            this.requiredModules = config.requiredModules || [];
            this.workflow = config.workflow || [];
            this.constraints = config.constraints || {};
            this.governanceRules = config.governanceRules || [];
            this.result = config.result || null;
            this.status = 'pending';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `octx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                request: this.request,
                requiredModules: this.requiredModules,
                workflow: this.workflow,
                constraints: this.constraints,
                governanceRules: this.governanceRules,
                result: this.result,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Orchestration Intelligence Core (Chapter 1-3, 5)
    // ============================================================
    class OrchestrationIntelligence {
        constructor() {
            this._registry = {};
            this._contexts = [];
            this._discoveredModules = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxContextHistory: 100,
                discoveryInterval: 60000,
                autoDiscovery: true,
                minConfidenceThreshold: 30,
                maxWorkflowSteps: 10
            };
            this._workflowTemplates = this._initWorkflowTemplates();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OrchestrationIntelligence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OrchestrationIntelligence] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToOptimizationLayer();
            this._connectToEvolutionSystem();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();
            this._connectToRuntimeRegistry();

            // Initial discovery
            this.discover();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Start auto-discovery
            if (this._config.autoDiscovery) {
                this._startAutoDiscovery();
            }

            this._initialized = true;
            console.log('[OrchestrationIntelligence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Intelligence Discovery (Chapter 8)
        // ============================================================

        discover(options) {
            console.log('[OrchestrationIntelligence] Discovering intelligence modules...');

            const discovered = [];

            // Check Decision Intelligence
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.DECISION,
                    'Decision Intelligence',
                    ['analyze', 'decide', 'reason', 'explain'],
                    window.LawAIApp.DecisionIntelligence,
                    90
                );
                discovered.push(module);
            }

            // Check Predictive Intelligence
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.PREDICTIVE,
                    'Predictive Intelligence',
                    ['predict', 'forecast', 'trend', 'risk'],
                    window.LawAIApp.PredictiveIntelligence,
                    85
                );
                discovered.push(module);
            }

            // Check Optimization Intelligence
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.OPTIMIZATION,
                    'Optimization Intelligence',
                    ['optimize', 'analyze', 'recommend', 'resource'],
                    window.LawAIApp.OptimizationIntelligence,
                    80
                );
                discovered.push(module);
            }

            // Check Evolution Intelligence
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.EVOLUTION,
                    'Evolution Intelligence',
                    ['evolve', 'adapt', 'grow', 'module'],
                    window.LawAIApp.EvolutionIntelligence,
                    75
                );
                discovered.push(module);
            }

            // Check Knowledge Intelligence
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.KNOWLEDGE,
                    'Knowledge Intelligence',
                    ['query', 'relate', 'entity', 'graph'],
                    window.LawAIApp.KnowledgeGraph,
                    70
                );
                discovered.push(module);
            }

            // Check Governance Intelligence
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                const module = this._registerModule(
                    INTELLIGENCE_CATEGORY.GOVERNANCE,
                    'Governance Intelligence',
                    ['review', 'approve', 'audit', 'policy'],
                    window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance,
                    95
                );
                discovered.push(module);
            }

            this._discoveredModules = discovered;

            this._emit('discoveryComplete', {
                modules: discovered.map(m => m.toJSON()),
                count: discovered.length,
                timestamp: Date.now()
            });

            return discovered;
        }

        // ============================================================
        // Module Registration (Chapter 6)
        // ============================================================

        _registerModule(category, name, capabilities, instance, priority) {
            const id = `im_${category}`;

            const module = new IntelligenceModule({
                intelligenceId: id,
                name: name,
                category: category,
                capability: capabilities,
                status: MODULE_STATUS.ACTIVE,
                priority: priority || 50,
                availability: 100,
                confidence: 70 + Math.random() * 20,
                instance: instance,
                metadata: {
                    discoveredAt: Date.now(),
                    source: 'auto_discovery'
                }
            });

            this._registry[id] = module;
            console.log(`[OrchestrationIntelligence] Registered: ${name} (${category})`);
            return module;
        }

        registerModule(config) {
            const module = new IntelligenceModule({
                name: config.name,
                category: config.category,
                capability: config.capability || [],
                status: MODULE_STATUS.REGISTERED,
                priority: config.priority || 50,
                availability: config.availability || 80,
                confidence: config.confidence || 60,
                instance: config.instance || null,
                metadata: config.metadata || {}
            });

            this._registry[module.intelligenceId] = module;
            this._emit('moduleRegistered', module.toJSON());

            return module;
        }

        // ============================================================
        // Task Understanding (Chapter 9)
        // ============================================================

        understand(task) {
            console.log(`[OrchestrationIntelligence] Understanding task: ${task}`);

            const analysis = {
                taskType: 'unknown',
                requiredCapability: [],
                complexity: 'medium',
                riskLevel: 'medium',
                priority: 'MEDIUM',
                suggestedModules: []
            };

            const taskLower = task.toLowerCase();

            // Determine task type
            if (taskLower.includes('predict') || taskLower.includes('forecast') || taskLower.includes('trend') || taskLower.includes('risk')) {
                analysis.taskType = 'prediction';
                analysis.requiredCapability = ['predict', 'forecast', 'trend', 'risk'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.PREDICTIVE, INTELLIGENCE_CATEGORY.KNOWLEDGE];
            }

            if (taskLower.includes('optimize') || taskLower.includes('resource') || taskLower.includes('performance') || taskLower.includes('improve')) {
                analysis.taskType = 'optimization';
                analysis.requiredCapability = ['optimize', 'analyze', 'recommend'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.OPTIMIZATION, INTELLIGENCE_CATEGORY.DECISION];
            }

            if (taskLower.includes('evolve') || taskLower.includes('grow') || taskLower.includes('adapt') || taskLower.includes('expand')) {
                analysis.taskType = 'evolution';
                analysis.requiredCapability = ['evolve', 'adapt', 'grow'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.EVOLUTION, INTELLIGENCE_CATEGORY.GOVERNANCE];
            }

            if (taskLower.includes('decide') || taskLower.includes('decision') || taskLower.includes('recommend') || taskLower.includes('choose')) {
                analysis.taskType = 'decision';
                analysis.requiredCapability = ['decide', 'analyze', 'reason'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.DECISION, INTELLIGENCE_CATEGORY.KNOWLEDGE];
            }

            if (taskLower.includes('knowledge') || taskLower.includes('graph') || taskLower.includes('entity') || taskLower.includes('relation')) {
                analysis.taskType = 'knowledge';
                analysis.requiredCapability = ['query', 'relate', 'entity'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.KNOWLEDGE];
            }

            if (taskLower.includes('review') || taskLower.includes('approve') || taskLower.includes('audit') || taskLower.includes('governance')) {
                analysis.taskType = 'governance';
                analysis.requiredCapability = ['review', 'approve', 'audit'];
                analysis.suggestedModules = [INTELLIGENCE_CATEGORY.GOVERNANCE];
            }

            // Determine complexity
            if (taskLower.includes('simple') || taskLower.includes('basic')) {
                analysis.complexity = 'simple';
            } else if (taskLower.includes('complex') || taskLower.includes('advanced') || taskLower.includes('multi')) {
                analysis.complexity = 'complex';
            }

            // Determine risk
            if (taskLower.includes('critical') || taskLower.includes('security') || taskLower.includes('core')) {
                analysis.riskLevel = 'high';
                analysis.priority = 'CRITICAL';
            } else if (taskLower.includes('important') || taskLower.includes('major')) {
                analysis.riskLevel = 'medium';
                analysis.priority = 'HIGH';
            }

            // Filter suggested modules to only available ones
            const available = this.getAvailableModules();
            analysis.suggestedModules = analysis.suggestedModules.filter(
                category => available.some(m => m.category === category)
            );

            this._emit('taskUnderstood', analysis);

            return analysis;
        }

        // ============================================================
        // Workflow Generation (Chapter 10)
        // ============================================================

        createWorkflow(task, options) {
            console.log(`[OrchestrationIntelligence] Creating workflow for: ${task}`);

            // Understand the task
            const analysis = this.understand(task);

            // Build workflow steps
            const steps = [];
            const modules = analysis.suggestedModules;

            modules.forEach((category, index) => {
                const module = this.getModule(category);
                if (module) {
                    steps.push({
                        step: index + 1,
                        module: category,
                        action: this._getActionForCategory(category),
                        status: 'pending',
                        input: index === 0 ? task : 'previous_result'
                    });
                }
            });

            // Add governance if not already included and risk is high
            if (analysis.riskLevel === 'high' && !steps.some(s => s.module === INTELLIGENCE_CATEGORY.GOVERNANCE)) {
                steps.push({
                    step: steps.length + 1,
                    module: INTELLIGENCE_CATEGORY.GOVERNANCE,
                    action: 'review',
                    status: 'pending',
                    input: 'result'
                });
            }

            // Create context
            const context = new OrchestrationContext({
                request: task,
                requiredModules: steps.map(s => s.module),
                workflow: steps,
                constraints: {
                    maxSteps: this._config.maxWorkflowSteps,
                    timeout: options?.timeout || 30000
                },
                governanceRules: analysis.riskLevel === 'high' ? ['requires_governance'] : [],
                metadata: {
                    analysis: analysis,
                    options: options || {},
                    generatedAt: Date.now()
                }
            });

            this._contexts.push(context);

            this._emit('workflowCreated', context.toJSON());

            return context;
        }

        _getActionForCategory(category) {
            const actionMap = {
                [INTELLIGENCE_CATEGORY.DECISION]: 'decide',
                [INTELLIGENCE_CATEGORY.PREDICTIVE]: 'predict',
                [INTELLIGENCE_CATEGORY.OPTIMIZATION]: 'optimize',
                [INTELLIGENCE_CATEGORY.EVOLUTION]: 'evolve',
                [INTELLIGENCE_CATEGORY.KNOWLEDGE]: 'query',
                [INTELLIGENCE_CATEGORY.GOVERNANCE]: 'review'
            };
            return actionMap[category] || 'process';
        }

        // ============================================================
        // Workflow Templates
        // ============================================================

        _initWorkflowTemplates() {
            return {
                'simple_decision': {
                    steps: [
                        { module: INTELLIGENCE_CATEGORY.DECISION, action: 'decide' }
                    ],
                    description: 'Simple decision workflow'
                },
                'full_decision': {
                    steps: [
                        { module: INTELLIGENCE_CATEGORY.KNOWLEDGE, action: 'query' },
                        { module: INTELLIGENCE_CATEGORY.DECISION, action: 'decide' },
                        { module: INTELLIGENCE_CATEGORY.GOVERNANCE, action: 'review' }
                    ],
                    description: 'Full decision with knowledge and governance'
                },
                'prediction': {
                    steps: [
                        { module: INTELLIGENCE_CATEGORY.PREDICTIVE, action: 'predict' },
                        { module: INTELLIGENCE_CATEGORY.KNOWLEDGE, action: 'query' },
                        { module: INTELLIGENCE_CATEGORY.GOVERNANCE, action: 'review' }
                    ],
                    description: 'Prediction workflow'
                },
                'optimization': {
                    steps: [
                        { module: INTELLIGENCE_CATEGORY.OPTIMIZATION, action: 'optimize' },
                        { module: INTELLIGENCE_CATEGORY.DECISION, action: 'decide' },
                        { module: INTELLIGENCE_CATEGORY.GOVERNANCE, action: 'review' }
                    ],
                    description: 'Optimization workflow'
                },
                'evolution': {
                    steps: [
                        { module: INTELLIGENCE_CATEGORY.EVOLUTION, action: 'evolve' },
                        { module: INTELLIGENCE_CATEGORY.OPTIMIZATION, action: 'optimize' },
                        { module: INTELLIGENCE_CATEGORY.GOVERNANCE, action: 'review' }
                    ],
                    description: 'Evolution workflow'
                }
            };
        }

        getWorkflowTemplate(name) {
            return this._workflowTemplates[name] || null;
        }

        registerWorkflowTemplate(name, template) {
            this._workflowTemplates[name] = template;
            console.log(`[OrchestrationIntelligence] Registered workflow template: ${name}`);
            return this;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getModule(category) {
            return this._registry[`im_${category}`] || null;
        }

        getAvailableModules() {
            const available = [];
            for (const id in this._registry) {
                const module = this._registry[id];
                if (module.status === MODULE_STATUS.ACTIVE || module.status === MODULE_STATUS.REGISTERED) {
                    available.push(module);
                }
            }
            return available;
        }

        getRegistry() {
            const registry = {};
            for (const id in this._registry) {
                registry[id] = this._registry[id].toJSON();
            }
            return registry;
        }

        getContexts(limit) {
            return this._contexts.slice(-(limit || 10)).reverse().map(c => c.toJSON());
        }

        getStats() {
            const totalModules = Object.keys(this._registry).length;
            const activeModules = this.getAvailableModules().length;
            const totalContexts = this._contexts.length;

            const byCategory = {};
            for (const id in this._registry) {
                const module = this._registry[id];
                byCategory[module.category] = (byCategory[module.category] || 0) + 1;
            }

            return {
                totalModules,
                activeModules,
                totalContexts,
                byCategory,
                workflowTemplates: Object.keys(this._workflowTemplates).length
            };
        }

        // ============================================================
        // Auto-Discovery
        // ============================================================

        _startAutoDiscovery() {
            if (this._discoveryInterval) {
                clearInterval(this._discoveryInterval);
            }

            this._discoveryInterval = setInterval(() => {
                this.discover();
            }, this._config.discoveryInterval);

            console.log(`[OrchestrationIntelligence] Auto-discovery started (${this._config.discoveryInterval}ms)`);
        }

        _stopAutoDiscovery() {
            if (this._discoveryInterval) {
                clearInterval(this._discoveryInterval);
                this._discoveryInterval = null;
            }
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const available = this.getAvailableModules().map(m => m.toJSON());
            const recent = this.getContexts(5);

            return {
                type: 'orchestration_intelligence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                availableModules: available,
                recentContexts: recent,
                workflowTemplates: Object.keys(this._workflowTemplates),
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
                        console.error('[OrchestrationIntelligence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`orchestration.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OrchestrationIntelligence] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[OrchestrationIntelligence] Connected to Predictive Runtime');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[OrchestrationIntelligence] Connected to Optimization Layer');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[OrchestrationIntelligence] Connected to Evolution System');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[OrchestrationIntelligence] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                console.log('[OrchestrationIntelligence] Connected to Governance');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[OrchestrationIntelligence] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'orchestration-intelligence',
                        name: 'Orchestration Intelligence',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OrchestrationIntelligence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OrchestrationIntelligence] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoDiscovery();
            this._initialized = false;
            console.log('[OrchestrationIntelligence] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new OrchestrationIntelligence();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OrchestrationIntelligence = {
        Core: instance,
        INTELLIGENCE_CATEGORY: INTELLIGENCE_CATEGORY,
        MODULE_STATUS: MODULE_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        discover: (options) => instance.discover(options),
        registerModule: (config) => instance.registerModule(config),
        understand: (task) => instance.understand(task),
        createWorkflow: (task, options) => instance.createWorkflow(task, options),
        registerWorkflowTemplate: (name, template) => instance.registerWorkflowTemplate(name, template),

        getModule: (category) => instance.getModule(category),
        getAvailableModules: () => instance.getAvailableModules(),
        getRegistry: () => instance.getRegistry(),
        getContexts: (limit) => instance.getContexts(limit),
        getWorkflowTemplate: (name) => instance.getWorkflowTemplate(name),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OrchestrationIntelligence] Part 55.1 loaded ✅');
    console.log('[OrchestrationIntelligence] Categories:', Object.values(INTELLIGENCE_CATEGORY).join(' | '));

})();
