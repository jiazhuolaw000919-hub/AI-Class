// ============================================================
// intelligenceFederation.js
// Part 56.3 — Runtime Intelligence Federation
// Version: v5.6.3
// Module: Runtime Operating System
// File: js/core/intelligenceFederation.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.IntelligenceFederation) {
        console.warn('[IntelligenceFederation] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Intelligence Types (Chapter 3)
    // ============================================================
    const INTELLIGENCE_TYPE = {
        DECISION: 'decision',
        PREDICTIVE: 'predictive',
        OPTIMIZATION: 'optimization',
        EVOLUTION: 'evolution',
        KNOWLEDGE: 'knowledge',
        ORCHESTRATION: 'orchestration'
    };

    // ============================================================
    // Node Status
    // ============================================================
    const NODE_STATUS = {
        REGISTERED: 'registered',
        VALIDATED: 'validated',
        CONNECTED: 'connected',
        ACTIVE: 'active',
        DEGRADED: 'degraded',
        OFFLINE: 'offline'
    };

    // ============================================================
    // Intelligence Node Model (Chapter 5)
    // ============================================================
    class IntelligenceNode {
        constructor(config) {
            this.nodeId = config.nodeId || this._generateId();
            this.timestamp = Date.now();
            this.intelligenceType = config.intelligenceType || INTELLIGENCE_TYPE.DECISION;
            this.capability = config.capability || [];
            this.status = NODE_STATUS.REGISTERED;
            this.confidence = config.confidence || 0;
            this.health = config.health || 0;
            this.connections = config.connections || [];
            this.instance = config.instance || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `node_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        connect(nodeId) {
            if (!this.connections.includes(nodeId)) {
                this.connections.push(nodeId);
            }
            return this;
        }

        disconnect(nodeId) {
            this.connections = this.connections.filter(id => id !== nodeId);
            return this;
        }

        toJSON() {
            return {
                nodeId: this.nodeId,
                timestamp: this.timestamp,
                intelligenceType: this.intelligenceType,
                capability: this.capability,
                status: this.status,
                confidence: this.confidence,
                health: this.health,
                connections: this.connections,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Shared Intelligence Context (Chapter 7)
    // ============================================================
    class FederationContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.runtimeState = config.runtimeState || {};
            this.historicalKnowledge = config.historicalKnowledge || null;
            this.predictionResult = config.predictionResult || null;
            this.decisionHistory = config.decisionHistory || [];
            this.optimizationResult = config.optimizationResult || null;
            this.evolutionMemory = config.evolutionMemory || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `fctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                runtimeState: this.runtimeState,
                historicalKnowledge: this.historicalKnowledge,
                predictionResult: this.predictionResult,
                decisionHistory: this.decisionHistory,
                optimizationResult: this.optimizationResult,
                evolutionMemory: this.evolutionMemory,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Collective Intelligence Result
    // ============================================================
    class CollectiveResult {
        constructor(config) {
            this.resultId = config.resultId || this._generateId();
            this.timestamp = Date.now();
            this.input = config.input || null;
            this.process = config.process || [];
            this.output = config.output || null;
            this.confidence = config.confidence || 0;
            this.contributors = config.contributors || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `cres_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                resultId: this.resultId,
                timestamp: this.timestamp,
                input: this.input,
                process: this.process,
                output: this.output,
                confidence: this.confidence,
                contributors: this.contributors,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Intelligence Federation Core (Chapter 1-4)
    // ============================================================
    class IntelligenceFederation {
        constructor() {
            this._nodes = {};
            this._context = null;
            this._results = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                version: '5.6.3',
                enableAutoDiscovery: true,
                enableHealthMonitoring: true,
                healthCheckInterval: 30000,
                minConfidenceThreshold: 50,
                maxResultHistory: 100
            };
            this._intelligenceGraph = this._initGraph();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[IntelligenceFederation] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[IntelligenceFederation] Initializing...');

            // Create federation context
            this._context = new FederationContext({
                runtimeState: { status: 'initializing' }
            });

            // Register all intelligences
            this._registerAllIntelligences();

            // Connect nodes
            this._connectAllNodes();

            // Start health monitoring
            if (this._config.enableHealthMonitoring) {
                this._startHealthMonitoring();
            }

            this._initialized = true;
            console.log('[IntelligenceFederation] Initialized ✅');
            console.log(`   Nodes: ${Object.keys(this._nodes).length}`);
            console.log(`   Connections: ${this._countConnections()}`);

            return this;
        }

        // ============================================================
        // Node Registration (Chapter 4-5)
        // ============================================================

        registerNode(config) {
            const node = new IntelligenceNode({
                intelligenceType: config.intelligenceType,
                capability: config.capability || [],
                confidence: config.confidence || 70,
                health: config.health || 100,
                instance: config.instance || null,
                metadata: config.metadata || {}
            });

            this._nodes[node.nodeId] = node;
            this._emit('nodeRegistered', node.toJSON());

            return node;
        }

        _registerAllIntelligences() {
            const app = window.LawAIApp;
            const mapping = {
                [INTELLIGENCE_TYPE.DECISION]: {
                    instance: app?.DecisionIntelligence,
                    capabilities: ['analyze', 'decide', 'reason', 'explain'],
                    confidence: 85
                },
                [INTELLIGENCE_TYPE.PREDICTIVE]: {
                    instance: app?.PredictiveIntelligence,
                    capabilities: ['predict', 'forecast', 'trend', 'risk'],
                    confidence: 80
                },
                [INTELLIGENCE_TYPE.OPTIMIZATION]: {
                    instance: app?.OptimizationIntelligence,
                    capabilities: ['optimize', 'analyze', 'recommend', 'resource'],
                    confidence: 75
                },
                [INTELLIGENCE_TYPE.EVOLUTION]: {
                    instance: app?.EvolutionIntelligence,
                    capabilities: ['evolve', 'adapt', 'grow', 'module'],
                    confidence: 70
                },
                [INTELLIGENCE_TYPE.KNOWLEDGE]: {
                    instance: app?.KnowledgeGraph,
                    capabilities: ['query', 'relate', 'entity', 'graph'],
                    confidence: 90
                },
                [INTELLIGENCE_TYPE.ORCHESTRATION]: {
                    instance: app?.AIOrchestration,
                    capabilities: ['orchestrate', 'coordinate', 'workflow'],
                    confidence: 85
                }
            };

            for (const type in mapping) {
                const config = mapping[type];
                if (config.instance) {
                    this.registerNode({
                        intelligenceType: type,
                        capability: config.capabilities,
                        confidence: config.confidence,
                        instance: config.instance,
                        metadata: { source: 'auto_discovery' }
                    });
                } else {
                    console.log(`   ⬜ ${type} intelligence not available`);
                }
            }
        }

        // ============================================================
        // Intelligence Graph (Chapter 6)
        // ============================================================

        _initGraph() {
            return {
                nodes: [],
                edges: []
            };
        }

        _connectAllNodes() {
            const nodeIds = Object.keys(this._nodes);

            // Connect in sequence: Knowledge → Predictive → Decision → Optimization → Evolution → Orchestration
            const order = [
                INTELLIGENCE_TYPE.KNOWLEDGE,
                INTELLIGENCE_TYPE.PREDICTIVE,
                INTELLIGENCE_TYPE.DECISION,
                INTELLIGENCE_TYPE.OPTIMIZATION,
                INTELLIGENCE_TYPE.EVOLUTION,
                INTELLIGENCE_TYPE.ORCHESTRATION
            ];

            for (let i = 0; i < order.length - 1; i++) {
                const from = this._findNodeByType(order[i]);
                const to = this._findNodeByType(order[i + 1]);
                if (from && to) {
                    from.connect(to.nodeId);
                    to.connect(from.nodeId);
                    this._intelligenceGraph.edges.push({
                        from: from.nodeId,
                        to: to.nodeId,
                        type: 'supports'
                    });
                    console.log(`   🔗 ${order[i]} ↔ ${order[i + 1]}`);
                }
            }

            // Update node status
            for (const id in this._nodes) {
                this._nodes[id].status = NODE_STATUS.ACTIVE;
            }
        }

        _findNodeByType(type) {
            for (const id in this._nodes) {
                if (this._nodes[id].intelligenceType === type) {
                    return this._nodes[id];
                }
            }
            return null;
        }

        _countConnections() {
            let count = 0;
            for (const id in this._nodes) {
                count += this._nodes[id].connections.length;
            }
            return count / 2; // Each connection counted twice
        }

        // ============================================================
        // Shared Context (Chapter 7)
        // ============================================================

        updateContext(data) {
            if (!this._context) {
                this._context = new FederationContext(data);
            } else {
                Object.assign(this._context, data);
            }

            this._emit('contextUpdated', this._context.toJSON());
            return this._context;
        }

        getContext() {
            // Refresh context from runtime
            this._refreshContext();
            return this._context ? this._context.toJSON() : null;
        }

        _refreshContext() {
            if (!this._context) return;

            // Get runtime state
            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const status = window.LawAIApp.Runtime.getStatus ? 
                        window.LawAIApp.Runtime.getStatus() : null;
                    if (status) this._context.runtimeState = status;
                }
            } catch (e) { /* ignore */ }

            // Get prediction result
            try {
                if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                    const stats = window.LawAIApp.PredictiveIntelligence.getStats ? 
                        window.LawAIApp.PredictiveIntelligence.getStats() : null;
                    if (stats) this._context.predictionResult = stats;
                }
            } catch (e) { /* ignore */ }

            // Get optimization result
            try {
                if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                    const stats = window.LawAIApp.OptimizationIntelligence.getStats ?
                        window.LawAIApp.OptimizationIntelligence.getStats() : null;
                    if (stats) this._context.optimizationResult = stats;
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Collective Intelligence Process (Chapter 8)
        // ============================================================

        process(input) {
            console.log('[IntelligenceFederation] Processing collective intelligence...');

            const processSteps = [];
            let currentContext = { input: input };

            // Step 1: Knowledge Analysis
            const knowledgeNode = this._findNodeByType(INTELLIGENCE_TYPE.KNOWLEDGE);
            if (knowledgeNode) {
                const result = this._executeNode(knowledgeNode, 'query', input);
                processSteps.push({
                    node: 'knowledge',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.knowledge = result;
            }

            // Step 2: Prediction
            const predictiveNode = this._findNodeByType(INTELLIGENCE_TYPE.PREDICTIVE);
            if (predictiveNode) {
                const result = this._executeNode(predictiveNode, 'predict', currentContext);
                processSteps.push({
                    node: 'predictive',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.prediction = result;
            }

            // Step 3: Decision
            const decisionNode = this._findNodeByType(INTELLIGENCE_TYPE.DECISION);
            if (decisionNode) {
                const result = this._executeNode(decisionNode, 'analyze', currentContext);
                processSteps.push({
                    node: 'decision',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.decision = result;
            }

            // Step 4: Optimization
            const optimizationNode = this._findNodeByType(INTELLIGENCE_TYPE.OPTIMIZATION);
            if (optimizationNode) {
                const result = this._executeNode(optimizationNode, 'optimize', currentContext);
                processSteps.push({
                    node: 'optimization',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.optimization = result;
            }

            // Step 5: Evolution
            const evolutionNode = this._findNodeByType(INTELLIGENCE_TYPE.EVOLUTION);
            if (evolutionNode) {
                const result = this._executeNode(evolutionNode, 'evolve', currentContext);
                processSteps.push({
                    node: 'evolution',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.evolution = result;
            }

            // Step 6: Orchestration (coordination)
            const orchestrationNode = this._findNodeByType(INTELLIGENCE_TYPE.ORCHESTRATION);
            if (orchestrationNode) {
                const result = this._executeNode(orchestrationNode, 'coordinate', currentContext);
                processSteps.push({
                    node: 'orchestration',
                    result: result,
                    timestamp: Date.now()
                });
                currentContext.orchestration = result;
            }

            // Calculate overall confidence
            const confidence = this._calculateCollectiveConfidence(processSteps);

            // Create result
            const result = new CollectiveResult({
                input: input,
                process: processSteps,
                output: currentContext,
                confidence: confidence,
                contributors: processSteps.map(s => s.node),
                metadata: {
                    processedAt: Date.now(),
                    steps: processSteps.length
                }
            });

            this._results.push(result);
            if (this._results.length > this._config.maxResultHistory) {
                this._results = this._results.slice(-this._config.maxResultHistory);
            }

            this._emit('processComplete', result.toJSON());

            return result;
        }

        _executeNode(node, action, context) {
            const instance = node.instance;
            if (!instance) return { success: false, error: 'No instance' };

            try {
                const methodMap = {
                    'decision': 'analyze',
                    'predictive': 'predict',
                    'optimization': 'analyze',
                    'evolution': 'analyze',
                    'knowledge': 'query',
                    'orchestration': 'execute'
                };

                const methodName = methodMap[node.intelligenceType] || 'analyze';
                if (typeof instance[methodName] !== 'function') {
                    return { success: false, error: `Method not found: ${methodName}` };
                }

                const result = instance[methodName](context);
                return { success: true, result: result };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        _calculateCollectiveConfidence(steps) {
            if (steps.length === 0) return 0;

            let totalConfidence = 0;
            steps.forEach(step => {
                const node = this._findNodeByType(step.node);
                if (node && step.result && step.result.success) {
                    totalConfidence += node.confidence || 50;
                } else {
                    totalConfidence += 30;
                }
            });

            return Math.round(totalConfidence / steps.length);
        }

        // ============================================================
        // Health Monitoring (Chapter 9)
        // ============================================================

        _startHealthMonitoring() {
            if (this._healthInterval) {
                clearInterval(this._healthInterval);
            }

            this._healthInterval = setInterval(() => {
                this._checkHealth();
            }, this._config.healthCheckInterval);

            console.log(`[IntelligenceFederation] Health monitoring started (${this._config.healthCheckInterval}ms)`);
        }

        _checkHealth() {
            let allHealthy = true;

            for (const id in this._nodes) {
                const node = this._nodes[id];
                const health = this._checkNodeHealth(node);
                node.health = health;

                if (health < 50) {
                    node.status = NODE_STATUS.DEGRADED;
                    allHealthy = false;
                } else if (health >= 80) {
                    node.status = NODE_STATUS.ACTIVE;
                }

                this._emit('nodeHealthUpdated', {
                    nodeId: node.nodeId,
                    health: health,
                    status: node.status
                });
            }

            if (!allHealthy) {
                console.warn('[IntelligenceFederation] Some nodes are degraded');
            }
        }

        _checkNodeHealth(node) {
            let score = 80;

            // Check if instance exists
            if (!node.instance) {
                score -= 30;
            }

            // Check connections
            if (node.connections.length === 0) {
                score -= 20;
            }

            // Check confidence
            if (node.confidence < 50) {
                score -= 20;
            } else if (node.confidence < 70) {
                score -= 10;
            }

            // Check status
            if (node.status === NODE_STATUS.DEGRADED) {
                score -= 15;
            }

            return Math.max(0, Math.min(100, score));
        }

        getNodeHealth(nodeId) {
            const node = this._nodes[nodeId];
            return node ? node.health : null;
        }

        // ============================================================
        // Conflict Resolution (Chapter 11)
        // ============================================================

        resolveConflicts(conflicts) {
            console.log('[IntelligenceFederation] Resolving intelligence conflicts...');

            const resolved = [];

            conflicts.forEach(conflict => {
                // Find highest confidence source
                const source = this._findNodeByType(conflict.source);
                if (source && source.confidence > 80) {
                    resolved.push({
                        conflict: conflict,
                        resolution: 'accepted',
                        source: conflict.source,
                        confidence: source.confidence
                    });
                } else {
                    // Check governance
                    if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                        try {
                            const result = window.LawAIApp.EvolutionGovernance.review(conflict, {
                                type: 'conflict_resolution'
                            });
                            resolved.push({
                                conflict: conflict,
                                resolution: result.approved ? 'accepted' : 'rejected',
                                source: 'governance',
                                confidence: 90
                            });
                        } catch (e) {
                            resolved.push({
                                conflict: conflict,
                                resolution: 'deferred',
                                source: 'system',
                                confidence: 50
                            });
                        }
                    } else {
                        resolved.push({
                            conflict: conflict,
                            resolution: 'deferred',
                            source: 'system',
                            confidence: 40
                        });
                    }
                }
            });

            this._emit('conflictsResolved', resolved);
            return resolved;
        }

        // ============================================================
        // Federation Adaptation (Chapter 10)
        // ============================================================

        addIntelligence(config) {
            console.log('[IntelligenceFederation] Adding new intelligence:', config.type);

            // Validate
            const validation = this._validateNewIntelligence(config);
            if (!validation.valid) {
                console.warn('[IntelligenceFederation] Validation failed:', validation.issues);
                return null;
            }

            // Register node
            const node = this.registerNode({
                intelligenceType: config.type,
                capability: config.capabilities || [],
                confidence: config.confidence || 70,
                instance: config.instance || null,
                metadata: config.metadata || {}
            });

            // Connect to appropriate nodes
            this._connectNode(node);

            // Governance review
            if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                try {
                    window.LawAIApp.EvolutionGovernance.review(node, {
                        type: 'intelligence_addition'
                    });
                } catch (e) { /* ignore */ }
            }

            this._emit('intelligenceAdded', node.toJSON());

            return node;
        }

        _validateNewIntelligence(config) {
            const issues = [];

            if (!config.type) issues.push('Missing intelligence type');
            if (!config.capabilities || config.capabilities.length === 0) {
                issues.push('Missing capabilities');
            }

            // Check for duplicate type
            const existing = this._findNodeByType(config.type);
            if (existing) {
                issues.push(`Intelligence type already exists: ${config.type}`);
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        _connectNode(node) {
            // Connect to related nodes
            const order = [
                INTELLIGENCE_TYPE.KNOWLEDGE,
                INTELLIGENCE_TYPE.PREDICTIVE,
                INTELLIGENCE_TYPE.DECISION,
                INTELLIGENCE_TYPE.OPTIMIZATION,
                INTELLIGENCE_TYPE.EVOLUTION,
                INTELLIGENCE_TYPE.ORCHESTRATION
            ];

            const nodeIndex = order.indexOf(node.intelligenceType);
            if (nodeIndex === -1) return;

            // Connect to previous
            if (nodeIndex > 0) {
                const prev = this._findNodeByType(order[nodeIndex - 1]);
                if (prev) {
                    node.connect(prev.nodeId);
                    prev.connect(node.nodeId);
                }
            }

            // Connect to next
            if (nodeIndex < order.length - 1) {
                const next = this._findNodeByType(order[nodeIndex + 1]);
                if (next) {
                    node.connect(next.nodeId);
                    next.connect(node.nodeId);
                }
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getNodes(filter) {
            let nodes = Object.values(this._nodes);

            if (filter) {
                if (filter.type) {
                    nodes = nodes.filter(n => n.intelligenceType === filter.type);
                }
                if (filter.status) {
                    nodes = nodes.filter(n => n.status === filter.status);
                }
                if (filter.minConfidence) {
                    nodes = nodes.filter(n => n.confidence >= filter.minConfidence);
                }
            }

            return nodes.map(n => n.toJSON());
        }

        getNode(nodeId) {
            const node = this._nodes[nodeId];
            return node ? node.toJSON() : null;
        }

        getNetwork() {
            return {
                nodes: Object.values(this._nodes).map(n => n.toJSON()),
                edges: this._intelligenceGraph.edges,
                totalNodes: Object.keys(this._nodes).length,
                totalEdges: this._intelligenceGraph.edges.length
            };
        }

        getResults(limit) {
            return this._results.slice(-(limit || 10)).reverse().map(r => r.toJSON());
        }

        getStats() {
            const totalNodes = Object.keys(this._nodes).length;
            const activeNodes = Object.values(this._nodes).filter(n => n.status === NODE_STATUS.ACTIVE).length;
            const degradedNodes = Object.values(this._nodes).filter(n => n.status === NODE_STATUS.DEGRADED).length;

            const avgConfidence = totalNodes > 0 ?
                Math.round(Object.values(this._nodes).reduce((sum, n) => sum + n.confidence, 0) / totalNodes) :
                0;

            const avgHealth = totalNodes > 0 ?
                Math.round(Object.values(this._nodes).reduce((sum, n) => sum + n.health, 0) / totalNodes) :
                0;

            const results = this._results.length;

            return {
                totalNodes,
                activeNodes,
                degradedNodes,
                avgConfidence,
                avgHealth,
                results,
                connections: this._countConnections()
            };
        }

        // ============================================================
        // Explorer Support (Chapter 14)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const network = this.getNetwork();
            const context = this._context ? this._context.toJSON() : null;
            const recent = this.getResults(3);

            return {
                type: 'intelligence_federation',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                network: network,
                context: context,
                recentResults: recent,
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
                        console.error('[IntelligenceFederation] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`federation.${event}`, data);
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            if (this._healthInterval) {
                clearInterval(this._healthInterval);
                this._healthInterval = null;
            }
            this._initialized = false;
            console.log('[IntelligenceFederation] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new IntelligenceFederation();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.IntelligenceFederation = {
        Core: instance,
        INTELLIGENCE_TYPE: INTELLIGENCE_TYPE,
        NODE_STATUS: NODE_STATUS,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        registerNode: (config) => instance.registerNode(config),
        addIntelligence: (config) => instance.addIntelligence(config),
        process: (input) => instance.process(input),
        resolveConflicts: (conflicts) => instance.resolveConflicts(conflicts),
        updateContext: (data) => instance.updateContext(data),

        getContext: () => instance.getContext(),
        getNodes: (filter) => instance.getNodes(filter),
        getNode: (nodeId) => instance.getNode(nodeId),
        getNetwork: () => instance.getNetwork(),
        getNodeHealth: (nodeId) => instance.getNodeHealth(nodeId),
        getResults: (limit) => instance.getResults(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[IntelligenceFederation] Part 56.3 loaded ✅');
    console.log('[IntelligenceFederation] 🧠 Intelligence Network Federated');

})();
