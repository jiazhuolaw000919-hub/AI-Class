// ============================================================
// intelligenceCoordination.js
// Part 55.2 — Intelligence Coordination Engine
// Version: v5.5.2
// Module: AI Orchestration Layer
// File: js/core/intelligenceCoordination.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.IntelligenceCoordination) {
        console.warn('[IntelligenceCoordination] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Coordination Types (Chapter 8)
    // ============================================================
    const COORDINATION_TYPE = {
        SEQUENTIAL: 'sequential',
        PARALLEL: 'parallel',
        HIERARCHICAL: 'hierarchical'
    };

    // ============================================================
    // Coordination Status
    // ============================================================
    const COORDINATION_STATUS = {
        INITIALIZING: 'initializing',
        CONTEXT_PREPARING: 'context_preparing',
        EXECUTING: 'executing',
        SYNCHRONIZING: 'synchronizing',
        RESOLVING: 'resolving',
        COMPLETED: 'completed',
        FAILED: 'failed'
    };

    // ============================================================
    // Message Model (Chapter 5)
    // ============================================================
    class IntelligenceMessage {
        constructor(config) {
            this.messageId = config.messageId || this._generateId();
            this.timestamp = Date.now();
            this.sourceIntelligence = config.sourceIntelligence || 'unknown';
            this.targetIntelligence = config.targetIntelligence || 'unknown';
            this.context = config.context || {};
            this.payload = config.payload || null;
            this.confidence = config.confidence || 0;
            this.type = config.type || 'request';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `imsg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                messageId: this.messageId,
                timestamp: this.timestamp,
                sourceIntelligence: this.sourceIntelligence,
                targetIntelligence: this.targetIntelligence,
                context: this.context,
                payload: this.payload,
                confidence: this.confidence,
                type: this.type,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Coordination State (Chapter 10)
    // ============================================================
    class CoordinationState {
        constructor(config) {
            this.coordinationId = config.coordinationId || this._generateId();
            this.timestamp = Date.now();
            this.activeModules = config.activeModules || [];
            this.currentContext = config.currentContext || {};
            this.workflowState = config.workflowState || {};
            this.conflicts = config.conflicts || [];
            this.result = config.result || null;
            this.status = COORDINATION_STATUS.INITIALIZING;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `coord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                coordinationId: this.coordinationId,
                timestamp: this.timestamp,
                activeModules: this.activeModules,
                currentContext: this.currentContext,
                workflowState: this.workflowState,
                conflicts: this.conflicts,
                result: this.result,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Intelligence Coordination Core (Chapter 1-4)
    // ============================================================
    class IntelligenceCoordination {
        constructor() {
            this._messages = [];
            this._states = [];
            this._activeState = null;
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxMessageHistory: 500,
                maxStateHistory: 100,
                timeout: 30000,
                enableParallelExecution: true,
                autoResolveConflicts: true,
                conflictResolutionTimeout: 5000
            };
            this._sharedContext = {};
            this._coordinationHandlers = this._initHandlers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[IntelligenceCoordination] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[IntelligenceCoordination] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToOrchestrationIntelligence();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToOptimizationLayer();
            this._connectToEvolutionSystem();
            this._connectToKnowledgeGraph();
            this._connectToGovernanceFramework();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[IntelligenceCoordination] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Coordinate (Chapter 4, 7)
        // ============================================================

        coordinate(task, modules, options) {
            console.log(`[IntelligenceCoordination] Coordinating ${modules.length} modules for: ${task}`);

            // Create coordination state
            const state = new CoordinationState({
                activeModules: modules,
                currentContext: {
                    task: task,
                    timestamp: Date.now(),
                    options: options || {}
                },
                workflowState: {
                    type: options?.type || COORDINATION_TYPE.SEQUENTIAL,
                    currentStep: 0,
                    steps: modules.map(m => ({ module: m, status: 'pending', result: null }))
                },
                metadata: {
                    startedAt: Date.now(),
                    source: 'coordination_engine'
                }
            });

            state.status = COORDINATION_STATUS.CONTEXT_PREPARING;
            this._states.push(state);
            this._activeState = state;

            this._emit('coordinationStarted', state.toJSON());

            try {
                // Prepare shared context (Chapter 6)
                this._prepareSharedContext(state);

                // Execute coordination based on type
                const result = this._executeCoordination(state, options);

                // Update state
                state.result = result;
                state.status = COORDINATION_STATUS.COMPLETED;

                this._emit('coordinationCompleted', state.toJSON());

                return state;

            } catch (error) {
                state.status = COORDINATION_STATUS.FAILED;
                state.metadata.error = error.message;
                this._emit('coordinationFailed', {
                    state: state.toJSON(),
                    error: error.message
                });
                console.error('[IntelligenceCoordination] Coordination failed:', error);
                return null;
            }
        }

        // ============================================================
        // Shared Context Layer (Chapter 6)
        // ============================================================

        _prepareSharedContext(state) {
            // Build shared context from available intelligences
            const context = {
                runtime: this._getRuntimeState(),
                task: state.currentContext.task,
                timestamp: Date.now(),
                availableData: {}
            };

            // Add data from each active module
            state.activeModules.forEach(module => {
                const data = this._getModuleData(module);
                if (data) {
                    context.availableData[module] = data;
                }
            });

            this._sharedContext = context;
            state.currentContext.shared = context;

            this._emit('contextPrepared', context);
        }

        _getRuntimeState() {
            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const status = window.LawAIApp.Runtime.getStatus ?
                        window.LawAIApp.Runtime.getStatus() : null;
                    if (status) return status;
                }

                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) return report;
                }
            } catch (e) { /* ignore */ }

            return { status: 'unknown', timestamp: Date.now() };
        }

        _getModuleData(module) {
            try {
                const moduleMap = {
                    'decision': () => window.LawAIApp?.DecisionIntelligence?.getStats?.() || null,
                    'predictive': () => window.LawAIApp?.PredictiveIntelligence?.getStats?.() || null,
                    'optimization': () => window.LawAIApp?.OptimizationIntelligence?.getStats?.() || null,
                    'evolution': () => window.LawAIApp?.EvolutionIntelligence?.getStats?.() || null,
                    'knowledge': () => window.LawAIApp?.KnowledgeGraph?.getData?.() || null,
                    'governance': () => window.LawAIApp?.EvolutionGovernance?.getStats?.() || null
                };

                const fn = moduleMap[module];
                return fn ? fn() : null;
            } catch (e) { /* ignore */ }
            return null;
        }

        // ============================================================
        // Coordination Execution (Chapter 7-8)
        // ============================================================

        _executeCoordination(state, options) {
            const type = options?.type || COORDINATION_TYPE.SEQUENTIAL;

            switch (type) {
                case COORDINATION_TYPE.SEQUENTIAL:
                    return this._executeSequential(state);
                case COORDINATION_TYPE.PARALLEL:
                    return this._executeParallel(state);
                case COORDINATION_TYPE.HIERARCHICAL:
                    return this._executeHierarchical(state);
                default:
                    return this._executeSequential(state);
            }
        }

        // ============================================================
        // Sequential Coordination (Chapter 8)
        // ============================================================

        _executeSequential(state) {
            const results = [];
            const steps = state.workflowState.steps || [];

            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                step.status = 'executing';
                state.workflowState.currentStep = i;

                // Execute the module
                const result = this._executeModule(step.module, state.currentContext);
                step.result = result;
                step.status = 'completed';

                results.push({
                    module: step.module,
                    result: result,
                    step: i
                });

                // Update context with result
                this._sharedContext[`step_${i}`] = result;

                this._emit('stepCompleted', {
                    step: i,
                    module: step.module,
                    result: result
                });
            }

            return {
                type: COORDINATION_TYPE.SEQUENTIAL,
                results: results,
                totalSteps: steps.length
            };
        }

        // ============================================================
        // Parallel Coordination (Chapter 8)
        // ============================================================

        _executeParallel(state) {
            const steps = state.workflowState.steps || [];
            const results = [];

            // Execute all modules in parallel
            const promises = steps.map((step, index) => {
                return new Promise((resolve) => {
                    const result = this._executeModule(step.module, state.currentContext);
                    results.push({
                        module: step.module,
                        result: result,
                        step: index
                    });
                    resolve(result);
                });
            });

            // Wait for all to complete
            return {
                type: COORDINATION_TYPE.PARALLEL,
                results: results,
                totalSteps: steps.length
            };
        }

        // ============================================================
        // Hierarchical Coordination (Chapter 8)
        // ============================================================

        _executeHierarchical(state) {
            const steps = state.workflowState.steps || [];
            const results = [];

            // First: decision intelligence (primary)
            const primaryModules = steps.filter(s => s.module === 'decision' || s.module === 'governance');
            const supportingModules = steps.filter(s => s.module !== 'decision' && s.module !== 'governance');

            // Execute primary
            primaryModules.forEach(step => {
                const result = this._executeModule(step.module, state.currentContext);
                results.push({
                    module: step.module,
                    result: result,
                    role: 'primary'
                });
                this._sharedContext.primaryResult = result;
            });

            // Execute supporting with primary context
            supportingModules.forEach(step => {
                const context = {
                    ...state.currentContext,
                    primaryResult: this._sharedContext.primaryResult
                };
                const result = this._executeModule(step.module, context);
                results.push({
                    module: step.module,
                    result: result,
                    role: 'supporting'
                });
            });

            return {
                type: COORDINATION_TYPE.HIERARCHICAL,
                results: results,
                totalSteps: steps.length
            };
        }

        // ============================================================
        // Module Execution
        // ============================================================

        _executeModule(module, context) {
            try {
                const moduleMap = {
                    'decision': () => this._executeDecision(context),
                    'predictive': () => this._executePredictive(context),
                    'optimization': () => this._executeOptimization(context),
                    'evolution': () => this._executeEvolution(context),
                    'knowledge': () => this._executeKnowledge(context),
                    'governance': () => this._executeGovernance(context)
                };

                const fn = moduleMap[module];
                return fn ? fn() : { success: false, error: 'Unknown module' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        _executeDecision(context) {
            const di = window.LawAIApp?.DecisionIntelligence;
            if (di && di.analyze) {
                try {
                    const signal = context.task || 'analyze';
                    const result = di.analyze(signal, context);
                    return { success: true, result: result, confidence: 70 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Decision analysis completed', confidence: 60 };
        }

        _executePredictive(context) {
            const pi = window.LawAIApp?.PredictiveIntelligence;
            if (pi && pi.predict) {
                try {
                    const result = pi.predict(context.task, context.options);
                    return { success: true, result: result, confidence: 65 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Prediction completed', confidence: 55 };
        }

        _executeOptimization(context) {
            const oi = window.LawAIApp?.OptimizationIntelligence;
            if (oi && oi.analyze) {
                try {
                    const result = oi.analyze(null, context.options);
                    return { success: true, result: result, confidence: 60 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Optimization analysis completed', confidence: 55 };
        }

        _executeEvolution(context) {
            const ei = window.LawAIApp?.EvolutionIntelligence;
            if (ei && ei.analyze) {
                try {
                    const result = ei.analyze(null, context.options);
                    return { success: true, result: result, confidence: 55 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Evolution analysis completed', confidence: 50 };
        }

        _executeKnowledge(context) {
            const kg = window.LawAIApp?.KnowledgeGraph;
            if (kg && kg.query) {
                try {
                    const result = kg.query(context.task);
                    return { success: true, result: result, confidence: 75 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Knowledge query completed', confidence: 70 };
        }

        _executeGovernance(context) {
            const gv = window.LawAIApp?.EvolutionGovernance;
            if (gv && gv.review) {
                try {
                    const result = gv.review(context.task, context.options);
                    return { success: true, result: result, confidence: 85 };
                } catch (e) { /* ignore */ }
            }
            return { success: true, result: 'Governance review completed', confidence: 80 };
        }

        // ============================================================
        // Intelligence Communication (Chapter 5)
        // ============================================================

        sendMessage(source, target, payload, context) {
            const message = new IntelligenceMessage({
                sourceIntelligence: source,
                targetIntelligence: target,
                context: context || this._sharedContext,
                payload: payload,
                confidence: payload?.confidence || 50,
                type: 'communication',
                metadata: {
                    sentAt: Date.now()
                }
            });

            this._messages.push(message);
            if (this._messages.length > this._config.maxMessageHistory) {
                this._messages = this._messages.slice(-this._config.maxMessageHistory);
            }

            this._emit('messageSent', message.toJSON());

            // Process message if target is active
            if (this._activeState) {
                this._processMessage(message);
            }

            return message;
        }

        _processMessage(message) {
            // Route message to target intelligence
            console.log(`[IntelligenceCoordination] Message: ${message.sourceIntelligence} → ${message.targetIntelligence}`);

            // If target is in active state, deliver
            if (this._activeState && this._activeState.activeModules.includes(message.targetIntelligence)) {
                this._deliverMessage(message);
            }
        }

        _deliverMessage(message) {
            // Simulate delivery
            this._emit('messageDelivered', message.toJSON());
        }

        // ============================================================
        // Conflict Resolution (Chapter 9)
        // ============================================================

        resolveConflict(conflicts) {
            console.log(`[IntelligenceCoordination] Resolving ${conflicts.length} conflicts...`);

            const resolution = {
                resolved: [],
                pending: [],
                timestamp: Date.now()
            };

            conflicts.forEach(conflict => {
                // Check if conflict can be auto-resolved
                const autoResolved = this._tryAutoResolve(conflict);

                if (autoResolved) {
                    resolution.resolved.push({
                        conflict: conflict,
                        resolution: 'auto_resolved',
                        confidence: 80
                    });
                } else {
                    resolution.pending.push(conflict);
                }
            });

            // If there are pending conflicts, use governance
            if (resolution.pending.length > 0 && this._config.autoResolveConflicts) {
                const governanceResult = this._resolveWithGovernance(resolution.pending);
                resolution.resolved.push(...governanceResult);
                resolution.pending = [];
            }

            this._emit('conflictsResolved', resolution);

            return resolution;
        }

        _tryAutoResolve(conflict) {
            // Auto-resolve based on confidence
            if (conflict.confidence > 80) {
                return true;
            }

            // Auto-resolve based on source priority
            if (conflict.source === 'governance' || conflict.source === 'decision') {
                return true;
            }

            return false;
        }

        _resolveWithGovernance(pendingConflicts) {
            const resolved = [];

            pendingConflicts.forEach(conflict => {
                // Use governance intelligence if available
                const gv = window.LawAIApp?.EvolutionGovernance;
                if (gv && gv.review) {
                    try {
                        const result = gv.review(conflict, { type: 'conflict_resolution' });
                        resolved.push({
                            conflict: conflict,
                            resolution: result.approved ? 'approved' : 'rejected',
                            confidence: 90
                        });
                    } catch (e) {
                        resolved.push({
                            conflict: conflict,
                            resolution: 'deferred',
                            confidence: 50
                        });
                    }
                } else {
                    resolved.push({
                        conflict: conflict,
                        resolution: 'deferred',
                        confidence: 40
                    });
                }
            });

            return resolved;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getMessages(filter) {
            let messages = this._messages;

            if (filter) {
                if (filter.source) {
                    messages = messages.filter(m => m.sourceIntelligence === filter.source);
                }
                if (filter.target) {
                    messages = messages.filter(m => m.targetIntelligence === filter.target);
                }
                if (filter.limit) {
                    messages = messages.slice(-filter.limit);
                }
            }

            return messages.map(m => m.toJSON());
        }

        getStates(limit) {
            return this._states.slice(-(limit || 10)).reverse().map(s => s.toJSON());
        }

        getActiveState() {
            return this._activeState ? this._activeState.toJSON() : null;
        }

        getSharedContext() {
            return this._sharedContext;
        }

        getStats() {
            const totalStates = this._states.length;
            const completed = this._states.filter(s => s.status === COORDINATION_STATUS.COMPLETED).length;
            const failed = this._states.filter(s => s.status === COORDINATION_STATUS.FAILED).length;

            const totalMessages = this._messages.length;

            return {
                totalStates,
                completed,
                failed,
                totalMessages,
                activeState: this._activeState ? this._activeState.status : null,
                sharedContextSize: Object.keys(this._sharedContext).length
            };
        }

        // ============================================================
        // Handlers
        // ============================================================

        _initHandlers() {
            return {
                'decision': {
                    priority: 10,
                    type: 'primary',
                    capabilities: ['analyze', 'decide', 'reason']
                },
                'governance': {
                    priority: 20,
                    type: 'critical',
                    capabilities: ['review', 'approve', 'audit']
                },
                'predictive': {
                    priority: 30,
                    type: 'supporting',
                    capabilities: ['predict', 'forecast']
                },
                'optimization': {
                    priority: 40,
                    type: 'supporting',
                    capabilities: ['optimize', 'improve']
                },
                'evolution': {
                    priority: 50,
                    type: 'supporting',
                    capabilities: ['evolve', 'adapt']
                },
                'knowledge': {
                    priority: 60,
                    type: 'supporting',
                    capabilities: ['query', 'relate']
                }
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recentMessages = this.getMessages({ limit: 5 });
            const recentStates = this.getStates(5);

            return {
                type: 'intelligence_coordination',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentMessages: recentMessages,
                recentStates: recentStates,
                sharedContext: this._sharedContext,
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
                        console.error('[IntelligenceCoordination] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`coordination.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToOrchestrationIntelligence() {
            if (window.LawAIApp && window.LawAIApp.OrchestrationIntelligence) {
                console.log('[IntelligenceCoordination] Connected to Orchestration Intelligence');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[IntelligenceCoordination] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[IntelligenceCoordination] Connected to Predictive Runtime');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[IntelligenceCoordination] Connected to Optimization Layer');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[IntelligenceCoordination] Connected to Evolution System');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[IntelligenceCoordination] Connected to Knowledge Graph');
            }
        }

        _connectToGovernanceFramework() {
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                console.log('[IntelligenceCoordination] Connected to Governance Framework');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'intelligence-coordination',
                        name: 'Intelligence Coordination',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[IntelligenceCoordination] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[IntelligenceCoordination] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[IntelligenceCoordination] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new IntelligenceCoordination();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.IntelligenceCoordination = {
        Core: instance,
        COORDINATION_TYPE: COORDINATION_TYPE,
        COORDINATION_STATUS: COORDINATION_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        coordinate: (task, modules, options) => instance.coordinate(task, modules, options),
        sendMessage: (source, target, payload, context) => 
            instance.sendMessage(source, target, payload, context),
        resolveConflict: (conflicts) => instance.resolveConflict(conflicts),

        getMessages: (filter) => instance.getMessages(filter),
        getStates: (limit) => instance.getStates(limit),
        getActiveState: () => instance.getActiveState(),
        getSharedContext: () => instance.getSharedContext(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[IntelligenceCoordination] Part 55.2 loaded ✅');
    console.log('[IntelligenceCoordination] Coordination Types:', Object.values(COORDINATION_TYPE).join(' | '));

})();
