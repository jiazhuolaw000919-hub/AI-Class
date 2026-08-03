// ============================================================
// runtimeEvolution.js
// Part 54 — Runtime Evolution Layer
// Version: v5.4
// Module: Runtime Evolution System
// File: js/core/runtimeEvolution.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RuntimeEvolution) {
        console.warn('[RuntimeEvolution] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Evolution Areas (Chapter 4)
    // ============================================================
    const EVOLUTION_AREA = {
        CAPABILITY: 'capability',
        ARCHITECTURE: 'architecture',
        PERFORMANCE: 'performance',
        MODULE: 'module',
        WORKFLOW: 'workflow',
        KNOWLEDGE: 'knowledge'
    };

    // ============================================================
    // Evolution Status
    // ============================================================
    const EVOLUTION_STATUS = {
        DISCOVERED: 'DISCOVERED',
        ANALYZING: 'ANALYZING',
        PROPOSED: 'PROPOSED',
        REVIEWING: 'REVIEWING',
        APPROVED: 'APPROVED',
        IMPLEMENTED: 'IMPLEMENTED',
        REJECTED: 'REJECTED',
        DEFERRED: 'DEFERRED'
    };

    // ============================================================
    // Evolution Context (Chapter 5)
    // ============================================================
    class EvolutionContext {
        constructor(config) {
            this.evolutionId = config.evolutionId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.currentCapability = config.currentCapability || 0;
            this.growthOpportunity = config.growthOpportunity || null;
            this.expectedBenefit = config.expectedBenefit || null;
            this.risk = config.risk || 'LOW';
            this.confidence = config.confidence || 0;
            this.area = config.area || EVOLUTION_AREA.CAPABILITY;
            this.status = EVOLUTION_STATUS.DISCOVERED;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `evo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                evolutionId: this.evolutionId,
                timestamp: this.timestamp,
                target: this.target,
                currentCapability: this.currentCapability,
                growthOpportunity: this.growthOpportunity,
                expectedBenefit: this.expectedBenefit,
                risk: this.risk,
                confidence: this.confidence,
                area: this.area,
                status: this.status,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Proposal
    // ============================================================
    class EvolutionProposal {
        constructor(config) {
            this.proposalId = config.proposalId || this._generateId();
            this.timestamp = Date.now();
            this.evolutionId = config.evolutionId || null;
            this.title = config.title || '';
            this.description = config.description || '';
            this.expectedImpact = config.expectedImpact || null;
            this.requiredResources = config.requiredResources || null;
            this.timeline = config.timeline || 'medium';
            this.priority = config.priority || 'MEDIUM';
            this.status = EVOLUTION_STATUS.PROPOSED;
            this.approvedBy = null;
            this.approvedAt = null;
            this.implementedAt = null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        approve(approver) {
            this.status = EVOLUTION_STATUS.APPROVED;
            this.approvedBy = approver || 'governance';
            this.approvedAt = Date.now();
            return this;
        }

        reject(reason) {
            this.status = EVOLUTION_STATUS.REJECTED;
            this.metadata.rejectionReason = reason || 'No reason provided';
            return this;
        }

        implement() {
            this.status = EVOLUTION_STATUS.IMPLEMENTED;
            this.implementedAt = Date.now();
            return this;
        }

        toJSON() {
            return {
                proposalId: this.proposalId,
                timestamp: this.timestamp,
                evolutionId: this.evolutionId,
                title: this.title,
                description: this.description,
                expectedImpact: this.expectedImpact,
                requiredResources: this.requiredResources,
                timeline: this.timeline,
                priority: this.priority,
                status: this.status,
                approvedBy: this.approvedBy,
                approvedAt: this.approvedAt,
                implementedAt: this.implementedAt,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Runtime Evolution Core (Chapter 1-3)
    // ============================================================
    class RuntimeEvolution {
        constructor() {
            this._contexts = [];
            this._proposals = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minConfidenceThreshold: 50,
                enableAutoDiscovery: true,
                discoveryInterval: 120000,
                criticalThreshold: 80,
                highThreshold: 60,
                mediumThreshold: 40
            };
            this._discoverers = this._initDiscoverers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RuntimeEvolution] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RuntimeEvolution] Initializing...');

            // Connect to modules (Chapter 7)
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToPredictiveLayer();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();
            this._connectToRuntimeRegistry();

            // Register with Explorer
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-discovery
            if (this._config.enableAutoDiscovery) {
                this._startAutoDiscovery();
            }

            this._initialized = true;
            console.log('[RuntimeEvolution] Initialized ✅');
            return this;
        }

        // ============================================================
        // Discoverers (Chapter 3-4)
        // ============================================================

        _initDiscoverers() {
            return {
                [EVOLUTION_AREA.CAPABILITY]: {
                    name: 'capability_discoverer',
                    discover: (options) => this._discoverCapabilityGrowth(options)
                },
                [EVOLUTION_AREA.ARCHITECTURE]: {
                    name: 'architecture_discoverer',
                    discover: (options) => this._discoverArchitectureEvolution(options)
                },
                [EVOLUTION_AREA.PERFORMANCE]: {
                    name: 'performance_discoverer',
                    discover: (options) => this._discoverPerformanceEvolution(options)
                },
                [EVOLUTION_AREA.MODULE]: {
                    name: 'module_discoverer',
                    discover: (options) => this._discoverModuleEnhancement(options)
                },
                [EVOLUTION_AREA.WORKFLOW]: {
                    name: 'workflow_discoverer',
                    discover: (options) => this._discoverWorkflowEvolution(options)
                },
                [EVOLUTION_AREA.KNOWLEDGE]: {
                    name: 'knowledge_discoverer',
                    discover: (options) => this._discoverKnowledgeExpansion(options)
                }
            };
        }

        // ============================================================
        // Core: Discover (Chapter 3)
        // ============================================================

        discover(areas, options) {
            console.log('[RuntimeEvolution] Discovering evolution opportunities...');

            const targetAreas = areas || Object.values(EVOLUTION_AREA);
            const contexts = [];

            targetAreas.forEach(area => {
                const discoverer = this._discoverers[area];
                if (!discoverer) {
                    console.warn(`[RuntimeEvolution] No discoverer for: ${area}`);
                    return;
                }

                try {
                    const result = discoverer.discover(options);
                    if (result && result.contexts) {
                        result.contexts.forEach(ctxData => {
                            const context = new EvolutionContext({
                                target: ctxData.target || area,
                                currentCapability: ctxData.currentCapability || 50,
                                growthOpportunity: ctxData.growthOpportunity || null,
                                expectedBenefit: ctxData.expectedBenefit || null,
                                risk: ctxData.risk || 'MEDIUM',
                                confidence: ctxData.confidence || 60,
                                area: area,
                                evidence: ctxData.evidence || [],
                                metadata: {
                                    source: discoverer.name,
                                    discoveredAt: Date.now()
                                }
                            });

                            contexts.push(context);
                            this._contexts.push(context);
                        });
                    }
                } catch (e) {
                    console.error(`[RuntimeEvolution] Discoverer error (${area}):`, e);
                }
            });

            // Enforce history limit
            if (this._contexts.length > this._config.maxHistorySize) {
                this._contexts = this._contexts.slice(-this._config.maxHistorySize);
            }

            // Generate proposals from contexts (Chapter 6)
            const proposals = this._generateProposals(contexts);

            this._emit('discoveryComplete', {
                contexts: contexts.map(c => c.toJSON()),
                proposals: proposals.map(p => p.toJSON()),
                count: contexts.length,
                timestamp: Date.now()
            });

            return {
                contexts: contexts,
                proposals: proposals
            };
        }

        discoverAll(options) {
            return this.discover(null, options);
        }

        // ============================================================
        // Discoverers (Chapter 4)
        // ============================================================

        _discoverCapabilityGrowth(options) {
            const contexts = [];
            const evidence = [];

            // Check capability from various sources
            const capData = this._getCapabilityData();

            if (capData) {
                const current = capData.current || 50;
                const potential = capData.potential || 80;

                if (potential > current + 15) {
                    contexts.push({
                        target: 'runtime_capability',
                        currentCapability: current,
                        growthOpportunity: {
                            from: current,
                            to: potential,
                            description: 'Significant capability growth potential detected'
                        },
                        expectedBenefit: `Improve runtime capability from ${current}% to ${potential}%`,
                        risk: 'MEDIUM',
                        confidence: 70,
                        evidence: ['Capability analysis shows growth potential']
                    });
                }
            }

            return { contexts, evidence };
        }

        _discoverArchitectureEvolution(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const stats = window.LawAIApp.ArchitectureAdvisor.getStats ?
                        window.LawAIApp.ArchitectureAdvisor.getStats() : null;

                    if (stats) {
                        const health = stats.health || 70;
                        const complexity = stats.complexity || 0.4;

                        if (health < 70) {
                            contexts.push({
                                target: 'architecture_health',
                                currentCapability: health,
                                growthOpportunity: {
                                    description: 'Architecture health improvement opportunity',
                                    target: 85
                                },
                                expectedBenefit: 'Improve architecture health and maintainability',
                                risk: 'HIGH',
                                confidence: 65,
                                evidence: [`Architecture health: ${health}%`]
                            });
                        }

                        if (complexity > 0.6) {
                            contexts.push({
                                target: 'architecture_complexity',
                                currentCapability: 100 - complexity * 100,
                                growthOpportunity: {
                                    description: 'Reduce architecture complexity',
                                    target: 70
                                },
                                expectedBenefit: 'Simplify architecture and reduce technical debt',
                                risk: 'MEDIUM',
                                confidence: 60,
                                evidence: [`Complexity score: ${(complexity * 100).toFixed(0)}%`]
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        _discoverPerformanceEvolution(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;

                    if (report) {
                        const cpu = report.cpu || 0;
                        const memory = report.memory || 0;
                        const responseTime = report.responseTime || 0;

                        if (cpu > 60) {
                            contexts.push({
                                target: 'performance_optimization',
                                currentCapability: 100 - cpu,
                                growthOpportunity: {
                                    description: 'Performance optimization opportunity',
                                    target: 50
                                },
                                expectedBenefit: `Reduce CPU usage from ${cpu}% to 50%`,
                                risk: 'MEDIUM',
                                confidence: 70,
                                evidence: [`Current CPU: ${cpu}%`]
                            });
                        }

                        if (memory > 70) {
                            contexts.push({
                                target: 'memory_optimization',
                                currentCapability: 100 - memory,
                                growthOpportunity: {
                                    description: 'Memory usage optimization',
                                    target: 40
                                },
                                expectedBenefit: `Reduce memory usage from ${memory}% to 40%`,
                                risk: 'MEDIUM',
                                confidence: 65,
                                evidence: [`Current memory: ${memory}%`]
                            });
                        }

                        if (responseTime > 500) {
                            contexts.push({
                                target: 'response_time_optimization',
                                currentCapability: Math.max(0, 100 - responseTime / 10),
                                growthOpportunity: {
                                    description: 'Response time improvement',
                                    target: 200
                                },
                                expectedBenefit: `Reduce response time from ${responseTime}ms to 200ms`,
                                risk: 'LOW',
                                confidence: 60,
                                evidence: [`Current response time: ${responseTime}ms`]
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        _discoverModuleEnhancement(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;

                    if (registry) {
                        const modules = Object.values(registry);
                        const total = modules.length;
                        const healthy = modules.filter(m => m.health && m.health > 70).length;

                        if (healthy < total * 0.7) {
                            contexts.push({
                                target: 'module_health',
                                currentCapability: Math.round((healthy / total) * 100),
                                growthOpportunity: {
                                    description: 'Module health improvement',
                                    target: 90
                                },
                                expectedBenefit: `${total - healthy} modules need health improvement`,
                                risk: 'MEDIUM',
                                confidence: 60,
                                evidence: [`Healthy modules: ${healthy}/${total}`]
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        _discoverWorkflowEvolution(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.BootPipeline) {
                    const info = window.LawAIApp.BootPipeline.getInfo ?
                        window.LawAIApp.BootPipeline.getInfo() : null;

                    if (info) {
                        const stageCount = info.stageCount || 0;
                        const duration = info.duration || 0;

                        if (duration > 3000) {
                            contexts.push({
                                target: 'workflow_optimization',
                                currentCapability: Math.max(0, 100 - duration / 50),
                                growthOpportunity: {
                                    description: 'Workflow optimization opportunity',
                                    target: 2000
                                },
                                expectedBenefit: `Reduce pipeline duration from ${duration}ms to 2000ms`,
                                risk: 'LOW',
                                confidence: 55,
                                evidence: [`Current pipeline duration: ${duration}ms`]
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        _discoverKnowledgeExpansion(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    const kgData = window.LawAIApp.KnowledgeGraph.getData ?
                        window.LawAIApp.KnowledgeGraph.getData() : null;

                    if (kgData) {
                        const entities = kgData.entities ? Object.keys(kgData.entities).length : 0;
                        const relations = kgData.relations ? Object.keys(kgData.relations).length : 0;

                        if (entities < 30) {
                            contexts.push({
                                target: 'knowledge_expansion',
                                currentCapability: Math.min(100, entities * 2),
                                growthOpportunity: {
                                    description: 'Knowledge graph expansion opportunity',
                                    target: 50
                                },
                                expectedBenefit: `Expand knowledge graph from ${entities} to 50 entities`,
                                risk: 'LOW',
                                confidence: 70,
                                evidence: [`Current entities: ${entities}`]
                            });
                        }

                        if (relations < entities * 1.5) {
                            contexts.push({
                                target: 'knowledge_relations',
                                currentCapability: Math.min(100, (relations / (entities || 1)) * 50),
                                growthOpportunity: {
                                    description: 'Improve knowledge graph connectivity',
                                    target: 80
                                },
                                expectedBenefit: 'Better knowledge graph connectivity and reasoning',
                                risk: 'LOW',
                                confidence: 65,
                                evidence: [`Current relations: ${relations}`]
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Proposal Generation (Chapter 6)
        // ============================================================

        _generateProposals(contexts) {
            const proposals = [];

            contexts.forEach(context => {
                if (context.confidence < this._config.minConfidenceThreshold) return;

                const priority = this._evaluatePriority(context);
                const timeline = this._estimateTimeline(context);

                const proposal = new EvolutionProposal({
                    evolutionId: context.evolutionId,
                    title: `Evolution: ${context.target}`,
                    description: context.growthOpportunity?.description || 'Evolution opportunity detected',
                    expectedImpact: context.expectedBenefit || 'Unknown',
                    requiredResources: this._estimateResources(context),
                    timeline: timeline,
                    priority: priority,
                    metadata: {
                        source: context.metadata?.source || 'unknown',
                        area: context.area,
                        confidence: context.confidence
                    }
                });

                proposals.push(proposal);
                this._proposals.push(proposal);
            });

            return proposals;
        }

        _evaluatePriority(context) {
            const riskWeight = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
            const riskScore = riskWeight[context.risk] || 2;

            const confidenceScore = context.confidence / 20;

            const benefitScore = context.expectedBenefit ? 2 : 1;

            const total = (riskScore * 2 + confidenceScore * 1.5 + benefitScore) * 10;

            if (total >= this._config.criticalThreshold) return 'CRITICAL';
            if (total >= this._config.highThreshold) return 'HIGH';
            if (total >= this._config.mediumThreshold) return 'MEDIUM';
            return 'LOW';
        }

        _estimateTimeline(context) {
            if (context.risk === 'HIGH' || context.confidence > 80) return 'short';
            if (context.risk === 'MEDIUM' || context.confidence > 60) return 'medium';
            return 'long';
        }

        _estimateResources(context) {
            const base = 1;
            const riskMultiplier = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
            const multiplier = riskMultiplier[context.risk] || 2;

            return {
                effort: base * multiplier,
                complexity: context.confidence > 70 ? 'high' : 'medium',
                estimatedTime: this._estimateTimeline(context)
            };
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getCapabilityData() {
            try {
                if (window.LawAIApp && window.LawAIApp.SystemMaturity) {
                    const data = window.LawAIApp.SystemMaturity.getData ?
                        window.LawAIApp.SystemMaturity.getData() : null;
                    if (data) {
                        return {
                            current: data.maturity || 50,
                            potential: Math.min(100, data.maturity + 30)
                        };
                    }
                }
            } catch (e) { /* ignore */ }

            return { current: 50, potential: 75 };
        }

        // ============================================================
        // Auto-Discovery
        // ============================================================

        _startAutoDiscovery() {
            if (this._discoveryInterval) {
                clearInterval(this._discoveryInterval);
            }

            this._discoveryInterval = setInterval(() => {
                this.discoverAll();
            }, this._config.discoveryInterval);

            console.log(`[RuntimeEvolution] Auto-discovery started (${this._config.discoveryInterval}ms)`);
        }

        _stopAutoDiscovery() {
            if (this._discoveryInterval) {
                clearInterval(this._discoveryInterval);
                this._discoveryInterval = null;
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getContexts(filter) {
            let contexts = this._contexts;

            if (filter) {
                if (filter.area) {
                    contexts = contexts.filter(c => c.area === filter.area);
                }
                if (filter.status) {
                    contexts = contexts.filter(c => c.status === filter.status);
                }
                if (filter.minConfidence) {
                    contexts = contexts.filter(c => c.confidence >= filter.minConfidence);
                }
                if (filter.limit) {
                    contexts = contexts.slice(-filter.limit);
                }
            }

            return contexts.map(c => c.toJSON());
        }

        getProposals(filter) {
            let proposals = this._proposals;

            if (filter) {
                if (filter.status) {
                    proposals = proposals.filter(p => p.status === filter.status);
                }
                if (filter.priority) {
                    proposals = proposals.filter(p => p.priority === filter.priority);
                }
                if (filter.limit) {
                    proposals = proposals.slice(-filter.limit);
                }
            }

            return proposals.map(p => p.toJSON());
        }

        getProposal(id) {
            const proposal = this._proposals.find(p => p.proposalId === id);
            return proposal ? proposal.toJSON() : null;
        }

        getStats() {
            const total = this._contexts.length;
            const byArea = {};
            const byStatus = {};

            this._contexts.forEach(c => {
                byArea[c.area] = (byArea[c.area] || 0) + 1;
                byStatus[c.status] = (byStatus[c.status] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._contexts.reduce((sum, c) => sum + c.confidence, 0) / total) :
                0;

            const proposalsTotal = this._proposals.length;
            const approved = this._proposals.filter(p => p.status === EVOLUTION_STATUS.APPROVED).length;
            const implemented = this._proposals.filter(p => p.status === EVOLUTION_STATUS.IMPLEMENTED).length;

            return {
                total,
                byArea,
                byStatus,
                avgConfidence,
                proposals: proposalsTotal,
                approved,
                implemented,
                discoveryRate: this._config.discoveryInterval > 0 ?
                    Math.round((total / (this._config.discoveryInterval / 60000)) * 10) / 10 : 0
            };
        }

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getContexts({ limit: 5 });
            const proposals = this.getProposals({ limit: 5 });

            return {
                type: 'runtime_evolution',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentContexts: recent,
                recentProposals: proposals,
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
                        console.error('[RuntimeEvolution] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`evolution.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('runtimeEvolutionData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.contexts) {
                        this._contexts = data.contexts.map(c => new EvolutionContext(c));
                    }
                    if (data.proposals) {
                        this._proposals = data.proposals.map(p => new EvolutionProposal(p));
                    }
                    if (data.history) {
                        this._history = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 7)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[RuntimeEvolution] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[RuntimeEvolution] Connected to Optimization Layer');
            }
        }

        _connectToPredictiveLayer() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[RuntimeEvolution] Connected to Predictive Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[RuntimeEvolution] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[RuntimeEvolution] Connected to Governance');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[RuntimeEvolution] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'runtime-evolution',
                        name: 'Runtime Evolution',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[RuntimeEvolution] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[RuntimeEvolution] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoDiscovery();
            this._initialized = false;
            console.log('[RuntimeEvolution] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RuntimeEvolution();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RuntimeEvolution = {
        Core: instance,
        EVOLUTION_AREA: EVOLUTION_AREA,
        EVOLUTION_STATUS: EVOLUTION_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        discover: (areas, options) => instance.discover(areas, options),
        discoverAll: (options) => instance.discoverAll(options),

        getContexts: (filter) => instance.getContexts(filter),
        getProposals: (filter) => instance.getProposals(filter),
        getProposal: (id) => instance.getProposal(id),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RuntimeEvolution] Part 54 loaded ✅');
    console.log('[RuntimeEvolution] Evolution Areas:', Object.values(EVOLUTION_AREA).join(' | '));
    console.log('[RuntimeEvolution] Statuses:', Object.values(EVOLUTION_STATUS).join(' | '));

})();
