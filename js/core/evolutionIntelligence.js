// ============================================================
// evolutionIntelligence.js
// Part 54.1 — Evolution Intelligence Foundation
// Version: v5.4.1
// Module: Runtime Evolution System
// File: js/core/evolutionIntelligence.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
        console.warn('[EvolutionIntelligence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Evolution Dimensions (Chapter 6)
    // ============================================================
    const EVOLUTION_DIMENSION = {
        CAPABILITY: 'capability',
        ARCHITECTURE: 'architecture',
        PERFORMANCE: 'performance',
        KNOWLEDGE: 'knowledge',
        WORKFLOW: 'workflow',
        INTELLIGENCE: 'intelligence'
    };

    // ============================================================
    // Evolution Status
    // ============================================================
    const EVOLUTION_STATUS = {
        ANALYZING: 'ANALYZING',
        OPPORTUNITY_FOUND: 'opportunity_found',
        PROPOSAL_READY: 'proposal_ready',
        UNDER_REVIEW: 'under_review',
        APPROVED: 'approved',
        IMPLEMENTED: 'implemented',
        DEFERRED: 'deferred'
    };

    // ============================================================
    // Evolution Context Model (Chapter 5)
    // ============================================================
    class EvolutionContext {
        constructor(config) {
            this.evolutionId = config.evolutionId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.currentState = config.currentState || null;
            this.capabilityLevel = config.capabilityLevel || 0;
            this.growthOpportunity = config.growthOpportunity || null;
            this.expectedImpact = config.expectedImpact || null;
            this.risk = config.risk || 'MEDIUM';
            this.confidence = config.confidence || 0;
            this.status = EVOLUTION_STATUS.ANALYZING;
            this.dimension = config.dimension || EVOLUTION_DIMENSION.CAPABILITY;
            this.evidence = config.evidence || [];
            this.evolutionScore = config.evolutionScore || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `evctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                evolutionId: this.evolutionId,
                timestamp: this.timestamp,
                target: this.target,
                currentState: this.currentState,
                capabilityLevel: this.capabilityLevel,
                growthOpportunity: this.growthOpportunity,
                expectedImpact: this.expectedImpact,
                risk: this.risk,
                confidence: this.confidence,
                status: this.status,
                dimension: this.dimension,
                evidence: this.evidence,
                evolutionScore: this.evolutionScore,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Growth Opportunity Model
    // ============================================================
    class GrowthOpportunity {
        constructor(config) {
            this.opportunityId = config.opportunityId || this._generateId();
            this.timestamp = Date.now();
            this.dimension = config.dimension || EVOLUTION_DIMENSION.CAPABILITY;
            this.description = config.description || '';
            this.currentValue = config.currentValue || 0;
            this.targetValue = config.targetValue || 0;
            this.potentialGain = config.potentialGain || 0;
            this.evidence = config.evidence || [];
            this.suggestedAction = config.suggestedAction || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `gropp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                opportunityId: this.opportunityId,
                timestamp: this.timestamp,
                dimension: this.dimension,
                description: this.description,
                currentValue: this.currentValue,
                targetValue: this.targetValue,
                potentialGain: this.potentialGain,
                evidence: this.evidence,
                suggestedAction: this.suggestedAction,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Intelligence Core (Chapter 1-4)
    // ============================================================
    class EvolutionIntelligence {
        constructor() {
            this._contexts = [];
            this._opportunities = [];
            this._analysisHistory = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minConfidenceThreshold: 40,
                evolutionScoreThreshold: 50,
                enableAutoAnalysis: true,
                analysisInterval: 180000,
                highScoreThreshold: 80,
                mediumScoreThreshold: 50
            };
            this._analyzers = this._initAnalyzers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[EvolutionIntelligence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[EvolutionIntelligence] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToPredictiveLayer();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();
            this._connectToRuntimeRegistry();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-analysis
            if (this._config.enableAutoAnalysis) {
                this._startAutoAnalysis();
            }

            this._initialized = true;
            console.log('[EvolutionIntelligence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Analyzers (Chapter 6-7)
        // ============================================================

        _initAnalyzers() {
            return {
                [EVOLUTION_DIMENSION.CAPABILITY]: {
                    name: 'capability_analyzer',
                    analyze: (options) => this._analyzeCapability(options)
                },
                [EVOLUTION_DIMENSION.ARCHITECTURE]: {
                    name: 'architecture_analyzer',
                    analyze: (options) => this._analyzeArchitecture(options)
                },
                [EVOLUTION_DIMENSION.PERFORMANCE]: {
                    name: 'performance_analyzer',
                    analyze: (options) => this._analyzePerformance(options)
                },
                [EVOLUTION_DIMENSION.KNOWLEDGE]: {
                    name: 'knowledge_analyzer',
                    analyze: (options) => this._analyzeKnowledge(options)
                },
                [EVOLUTION_DIMENSION.WORKFLOW]: {
                    name: 'workflow_analyzer',
                    analyze: (options) => this._analyzeWorkflow(options)
                },
                [EVOLUTION_DIMENSION.INTELLIGENCE]: {
                    name: 'intelligence_analyzer',
                    analyze: (options) => this._analyzeIntelligence(options)
                }
            };
        }

        // ============================================================
        // Core: Analyze (Chapter 3-4)
        // ============================================================

        analyze(dimensions, options) {
            console.log('[EvolutionIntelligence] Starting evolution analysis...');

            const targetDimensions = dimensions || Object.values(EVOLUTION_DIMENSION);
            const contexts = [];
            const opportunities = [];

            targetDimensions.forEach(dimension => {
                const analyzer = this._analyzers[dimension];
                if (!analyzer) {
                    console.warn(`[EvolutionIntelligence] No analyzer for: ${dimension}`);
                    return;
                }

                try {
                    const result = analyzer.analyze(options);
                    if (result) {
                        // Create growth opportunities
                        if (result.opportunities) {
                            result.opportunities.forEach(oppData => {
                                const opportunity = new GrowthOpportunity({
                                    dimension: dimension,
                                    description: oppData.description || `${dimension} growth opportunity`,
                                    currentValue: oppData.currentValue || 0,
                                    targetValue: oppData.targetValue || 0,
                                    potentialGain: oppData.potentialGain || 0,
                                    evidence: oppData.evidence || [],
                                    suggestedAction: oppData.suggestedAction || null,
                                    metadata: {
                                        source: analyzer.name,
                                        confidence: oppData.confidence || 50
                                    }
                                });

                                opportunities.push(opportunity);
                                this._opportunities.push(opportunity);
                            });
                        }

                        // Create evolution context
                        if (result.context) {
                            // Calculate evolution score (Chapter 10)
                            const score = this._calculateEvolutionScore(
                                result.context,
                                opportunities
                            );

                            const context = new EvolutionContext({
                                target: result.context.target || dimension,
                                currentState: result.context.currentState || null,
                                capabilityLevel: result.context.capabilityLevel || 50,
                                growthOpportunity: result.context.growthOpportunity || null,
                                expectedImpact: result.context.expectedImpact || null,
                                risk: result.context.risk || 'MEDIUM',
                                confidence: result.context.confidence || 60,
                                dimension: dimension,
                                evidence: result.context.evidence || [],
                                evolutionScore: score,
                                metadata: {
                                    source: analyzer.name,
                                    analyzedAt: Date.now(),
                                    opportunitiesCount: opportunities.length
                                }
                            });

                            contexts.push(context);
                            this._contexts.push(context);
                        }
                    }
                } catch (e) {
                    console.error(`[EvolutionIntelligence] Analyzer error (${dimension}):`, e);
                }
            });

            // Enforce history limits
            if (this._contexts.length > this._config.maxHistorySize) {
                this._contexts = this._contexts.slice(-this._config.maxHistorySize);
            }
            if (this._opportunities.length > this._config.maxHistorySize) {
                this._opportunities = this._opportunities.slice(-this._config.maxHistorySize);
            }

            // Record analysis
            this._analysisHistory.push({
                timestamp: Date.now(),
                contextsCount: contexts.length,
                opportunitiesCount: opportunities.length,
                dimensions: targetDimensions
            });

            this._emit('analysisComplete', {
                contexts: contexts.map(c => c.toJSON()),
                opportunities: opportunities.map(o => o.toJSON()),
                count: contexts.length,
                timestamp: Date.now()
            });

            return {
                contexts: contexts,
                opportunities: opportunities
            };
        }

        analyzeAll(options) {
            return this.analyze(null, options);
        }

        // ============================================================
        // Analyzer: Capability (Chapter 6-7)
        // ============================================================

        _analyzeCapability(options) {
            const opportunities = [];
            const context = {};

            try {
                // Get capability data
                const capData = this._getCapabilityData();

                if (capData) {
                    const current = capData.current || 50;
                    const potential = capData.potential || 80;

                    context.target = 'runtime_capability';
                    context.currentState = { level: current };
                    context.capabilityLevel = current;
                    context.risk = 'MEDIUM';
                    context.confidence = 65;

                    if (potential > current + 15) {
                        opportunities.push({
                            description: 'Runtime capability growth potential',
                            currentValue: current,
                            targetValue: potential,
                            potentialGain: potential - current,
                            evidence: ['Capability analysis shows growth potential'],
                            suggestedAction: 'Enhance runtime capabilities through targeted improvements',
                            confidence: 70
                        });
                    }

                    context.growthOpportunity = {
                        from: current,
                        to: potential,
                        description: 'Significant capability growth detected'
                    };
                    context.expectedImpact = `Improve capability from ${current}% to ${potential}%`;
                    context.evidence = ['Capability assessment completed'];
                }
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Analyzer: Architecture (Chapter 6)
        // ============================================================

        _analyzeArchitecture(options) {
            const opportunities = [];
            const context = {};

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const stats = window.LawAIApp.ArchitectureAdvisor.getStats ?
                        window.LawAIApp.ArchitectureAdvisor.getStats() : null;

                    if (stats) {
                        const health = stats.health || 70;
                        const complexity = stats.complexity || 0.4;

                        context.target = 'architecture_health';
                        context.currentState = { health: health, complexity: complexity };
                        context.capabilityLevel = health;
                        context.risk = 'HIGH';
                        context.confidence = 60;

                        if (health < 75) {
                            opportunities.push({
                                description: 'Architecture health improvement',
                                currentValue: health,
                                targetValue: 85,
                                potentialGain: 85 - health,
                                evidence: [`Current health: ${health}%`],
                                suggestedAction: 'Refactor and improve architecture health',
                                confidence: 65
                            });
                        }

                        if (complexity > 0.5) {
                            opportunities.push({
                                description: 'Reduce architecture complexity',
                                currentValue: complexity * 100,
                                targetValue: 40,
                                potentialGain: complexity * 100 - 40,
                                evidence: [`Complexity: ${(complexity * 100).toFixed(0)}%`],
                                suggestedAction: 'Simplify architecture structure',
                                confidence: 60
                            });
                        }

                        context.growthOpportunity = {
                            description: 'Architecture evolution opportunity'
                        };
                        context.expectedImpact = 'Improved maintainability and scalability';
                        context.evidence = ['Architecture analysis completed'];
                    }
                }
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Analyzer: Performance (Chapter 6)
        // ============================================================

        _analyzePerformance(options) {
            const opportunities = [];
            const context = {};

            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;

                    if (report) {
                        const cpu = report.cpu || 0;
                        const memory = report.memory || 0;
                        const responseTime = report.responseTime || 0;

                        context.target = 'performance';
                        context.currentState = { cpu, memory, responseTime };
                        context.capabilityLevel = Math.max(0, 100 - cpu);
                        context.risk = 'MEDIUM';
                        context.confidence = 65;

                        if (cpu > 60) {
                            opportunities.push({
                                description: 'CPU optimization opportunity',
                                currentValue: cpu,
                                targetValue: 40,
                                potentialGain: cpu - 40,
                                evidence: [`Current CPU: ${cpu}%`],
                                suggestedAction: 'Optimize CPU usage',
                                confidence: 70
                            });
                        }

                        if (memory > 70) {
                            opportunities.push({
                                description: 'Memory optimization opportunity',
                                currentValue: memory,
                                targetValue: 50,
                                potentialGain: memory - 50,
                                evidence: [`Current memory: ${memory}%`],
                                suggestedAction: 'Optimize memory usage',
                                confidence: 65
                            });
                        }

                        if (responseTime > 500) {
                            opportunities.push({
                                description: 'Response time improvement',
                                currentValue: responseTime,
                                targetValue: 200,
                                potentialGain: responseTime - 200,
                                evidence: [`Current response time: ${responseTime}ms`],
                                suggestedAction: 'Optimize critical paths',
                                confidence: 60
                            });
                        }

                        context.growthOpportunity = {
                            description: 'Performance evolution opportunity'
                        };
                        context.expectedImpact = 'Better system performance';
                        context.evidence = ['Performance analysis completed'];
                    }
                }
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Analyzer: Knowledge (Chapter 6)
        // ============================================================

        _analyzeKnowledge(options) {
            const opportunities = [];
            const context = {};

            try {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    const kgData = window.LawAIApp.KnowledgeGraph.getData ?
                        window.LawAIApp.KnowledgeGraph.getData() : null;

                    if (kgData) {
                        const entities = kgData.entities ? Object.keys(kgData.entities).length : 0;
                        const relations = kgData.relations ? Object.keys(kgData.relations).length : 0;

                        context.target = 'knowledge_graph';
                        context.currentState = { entities, relations };
                        context.capabilityLevel = Math.min(100, entities * 2);
                        context.risk = 'LOW';
                        context.confidence = 70;

                        if (entities < 30) {
                            opportunities.push({
                                description: 'Knowledge graph expansion',
                                currentValue: entities,
                                targetValue: 50,
                                potentialGain: 50 - entities,
                                evidence: [`Current entities: ${entities}`],
                                suggestedAction: 'Add more knowledge entities',
                                confidence: 75
                            });
                        }

                        if (relations < entities * 1.5) {
                            opportunities.push({
                                description: 'Improve knowledge connectivity',
                                currentValue: relations,
                                targetValue: entities * 1.5,
                                potentialGain: entities * 1.5 - relations,
                                evidence: [`Current relations: ${relations}`],
                                suggestedAction: 'Add relations between entities',
                                confidence: 70
                            });
                        }

                        context.growthOpportunity = {
                            description: 'Knowledge expansion opportunity'
                        };
                        context.expectedImpact = 'Better reasoning and decision making';
                        context.evidence = ['Knowledge graph analysis completed'];
                    }
                }
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Analyzer: Workflow (Chapter 6)
        // ============================================================

        _analyzeWorkflow(options) {
            const opportunities = [];
            const context = {};

            try {
                if (window.LawAIApp && window.LawAIApp.BootPipeline) {
                    const info = window.LawAIApp.BootPipeline.getInfo ?
                        window.LawAIApp.BootPipeline.getInfo() : null;

                    if (info) {
                        const duration = info.duration || 0;
                        const stageCount = info.stageCount || 0;

                        context.target = 'workflow';
                        context.currentState = { duration, stageCount };
                        context.capabilityLevel = Math.max(0, 100 - duration / 50);
                        context.risk = 'LOW';
                        context.confidence = 55;

                        if (duration > 2000) {
                            opportunities.push({
                                description: 'Workflow optimization',
                                currentValue: duration,
                                targetValue: 1000,
                                potentialGain: duration - 1000,
                                evidence: [`Current duration: ${duration}ms`],
                                suggestedAction: 'Optimize pipeline stages',
                                confidence: 60
                            });
                        }

                        context.growthOpportunity = {
                            description: 'Workflow evolution opportunity'
                        };
                        context.expectedImpact = 'Faster pipeline execution';
                        context.evidence = ['Workflow analysis completed'];
                    }
                }
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Analyzer: Intelligence (Chapter 6)
        // ============================================================

        _analyzeIntelligence(options) {
            const opportunities = [];
            const context = {};

            try {
                let intelligenceScore = 0;
                let total = 0;

                // Check various intelligence components
                if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                    const stats = window.LawAIApp.DecisionIntelligence.getStats ?
                        window.LawAIApp.DecisionIntelligence.getStats() : null;
                    if (stats) {
                        intelligenceScore += stats.avgConfidence || 50;
                        total++;
                    }
                }

                if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                    const stats = window.LawAIApp.PredictiveIntelligence.getStats ?
                        window.LawAIApp.PredictiveIntelligence.getStats() : null;
                    if (stats) {
                        intelligenceScore += stats.avgConfidence || 50;
                        total++;
                    }
                }

                if (window.LawAIApp && window.LawAIApp.ReasoningEngine) {
                    const stats = window.LawAIApp.ReasoningEngine.getStats ?
                        window.LawAIApp.ReasoningEngine.getStats() : null;
                    if (stats) {
                        intelligenceScore += stats.avgConfidence || 50;
                        total++;
                    }
                }

                const avgScore = total > 0 ? Math.round(intelligenceScore / total) : 50;

                context.target = 'intelligence_capability';
                context.currentState = { score: avgScore, components: total };
                context.capabilityLevel = avgScore;
                context.risk = 'MEDIUM';
                context.confidence = 65;

                if (avgScore < 65) {
                    opportunities.push({
                        description: 'Intelligence capability enhancement',
                        currentValue: avgScore,
                        targetValue: 80,
                        potentialGain: 80 - avgScore,
                        evidence: [`Current intelligence score: ${avgScore}%`],
                        suggestedAction: 'Enhance intelligence components',
                        confidence: 70
                    });
                }

                context.growthOpportunity = {
                    description: 'Intelligence evolution opportunity'
                };
                context.expectedImpact = 'Better decision making and predictions';
                context.evidence = ['Intelligence analysis completed'];
            } catch (e) { /* ignore */ }

            return { opportunities, context };
        }

        // ============================================================
        // Evolution Score (Chapter 10)
        // ============================================================

        _calculateEvolutionScore(context, opportunities) {
            let score = 0;

            // Growth potential (0-30)
            const growth = context.growthOpportunity ? 
                Math.min(30, (context.growthOpportunity.to - context.growthOpportunity.from) / 2) : 15;
            score += growth;

            // Impact (0-25)
            const impact = context.expectedImpact ? 20 : 10;
            score += impact;

            // Confidence (0-20)
            const confidenceScore = (context.confidence || 50) / 5;
            score += Math.min(20, confidenceScore);

            // Urgency (0-15)
            const urgency = context.risk === 'CRITICAL' ? 15 :
                           context.risk === 'HIGH' ? 12 :
                           context.risk === 'MEDIUM' ? 8 : 5;
            score += urgency;

            // Risk (0-10, subtracted)
            const risk = context.risk === 'CRITICAL' ? 10 :
                        context.risk === 'HIGH' ? 7 :
                        context.risk === 'MEDIUM' ? 4 : 2;
            score -= risk;

            // Opportunities bonus (0-10)
            const oppBonus = Math.min(10, opportunities.length * 2);
            score += oppBonus;

            return Math.max(0, Math.round(score));
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
        // Auto-Analysis
        // ============================================================

        _startAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
            }

            this._analysisInterval = setInterval(() => {
                this.analyzeAll();
            }, this._config.analysisInterval);

            console.log(`[EvolutionIntelligence] Auto-analysis started (${this._config.analysisInterval}ms)`);
        }

        _stopAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
                this._analysisInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 14)
        // ============================================================

        getCapabilities() {
            const capabilities = {};

            this._contexts.forEach(c => {
                capabilities[c.target] = {
                    level: c.capabilityLevel,
                    status: c.status,
                    dimension: c.dimension,
                    lastUpdated: c.timestamp
                };
            });

            return capabilities;
        }

        getOpportunities(filter) {
            let opportunities = this._opportunities;

            if (filter) {
                if (filter.dimension) {
                    opportunities = opportunities.filter(o => o.dimension === filter.dimension);
                }
                if (filter.minGain) {
                    opportunities = opportunities.filter(o => o.potentialGain >= filter.minGain);
                }
                if (filter.limit) {
                    opportunities = opportunities.slice(-filter.limit);
                }
            }

            return opportunities.map(o => o.toJSON());
        }

        getGrowthScore(target) {
            const context = this._contexts.find(c => c.target === target);
            return context ? context.evolutionScore : 0;
        }

        getHistory(limit) {
            return this._analysisHistory.slice(-(limit || 10)).reverse();
        }

        getStats() {
            const total = this._contexts.length;
            const byDimension = {};
            const byStatus = {};

            this._contexts.forEach(c => {
                byDimension[c.dimension] = (byDimension[c.dimension] || 0) + 1;
                byStatus[c.status] = (byStatus[c.status] || 0) + 1;
            });

            const avgScore = total > 0 ?
                Math.round(this._contexts.reduce((sum, c) => sum + c.evolutionScore, 0) / total) :
                0;

            const avgConfidence = total > 0 ?
                Math.round(this._contexts.reduce((sum, c) => sum + c.confidence, 0) / total) :
                0;

            return {
                total,
                byDimension,
                byStatus,
                avgScore,
                avgConfidence,
                opportunities: this._opportunities.length,
                historyCount: this._analysisHistory.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getOpportunities({ limit: 5 });
            const capabilities = this.getCapabilities();

            return {
                type: 'evolution_intelligence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentOpportunities: recent,
                capabilities: capabilities,
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
                        console.error('[EvolutionIntelligence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`evointel.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('evolutionIntelligenceData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.contexts) {
                        this._contexts = data.contexts.map(c => new EvolutionContext(c));
                    }
                    if (data.opportunities) {
                        this._opportunities = data.opportunities.map(o => new GrowthOpportunity(o));
                    }
                    if (data.history) {
                        this._analysisHistory = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[EvolutionIntelligence] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[EvolutionIntelligence] Connected to Optimization Layer');
            }
        }

        _connectToPredictiveLayer() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[EvolutionIntelligence] Connected to Predictive Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[EvolutionIntelligence] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[EvolutionIntelligence] Connected to Governance');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[EvolutionIntelligence] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'evolution-intelligence',
                        name: 'Evolution Intelligence',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[EvolutionIntelligence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[EvolutionIntelligence] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoAnalysis();
            this._initialized = false;
            console.log('[EvolutionIntelligence] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new EvolutionIntelligence();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.EvolutionIntelligence = {
        Core: instance,
        EVOLUTION_DIMENSION: EVOLUTION_DIMENSION,
        EVOLUTION_STATUS: EVOLUTION_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        analyze: (dimensions, options) => instance.analyze(dimensions, options),
        analyzeAll: (options) => instance.analyzeAll(options),

        getCapabilities: () => instance.getCapabilities(),
        getOpportunities: (filter) => instance.getOpportunities(filter),
        getGrowthScore: (target) => instance.getGrowthScore(target),
        getHistory: (limit) => instance.getHistory(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[EvolutionIntelligence] Part 54.1 loaded ✅');
    console.log('[EvolutionIntelligence] Dimensions:', Object.values(EVOLUTION_DIMENSION).join(' | '));

})();
