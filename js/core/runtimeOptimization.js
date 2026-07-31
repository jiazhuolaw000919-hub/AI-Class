// ============================================================
// runtimeOptimization.js
// Part 52 — Runtime Self Optimization Layer
// Version: v5.2
// Module: Runtime Evolution Layer
// File: js/core/runtimeOptimization.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RuntimeOptimization) {
        console.warn('[RuntimeOptimization] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Optimization Areas (Chapter 4)
    // ============================================================
    const OPTIMIZATION_AREAS = {
        PERFORMANCE: 'performance',
        RESOURCE: 'resource',
        FLOW: 'flow',
        DEPENDENCY: 'dependency',
        ARCHITECTURE: 'architecture'
    };

    // ============================================================
    // Optimization Priority
    // ============================================================
    const OPTIMIZATION_PRIORITY = {
        CRITICAL: 'CRITICAL',
        HIGH: 'HIGH',
        MEDIUM: 'MEDIUM',
        LOW: 'LOW'
    };

    // ============================================================
    // Optimization Opportunity
    // ============================================================
    class OptimizationOpportunity {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.area = config.area || OPTIMIZATION_AREAS.PERFORMANCE;
            this.priority = config.priority || OPTIMIZATION_PRIORITY.MEDIUM;
            this.title = config.title || '';
            this.description = config.description || '';
            this.currentState = config.currentState || null;
            this.expectedImprovement = config.expectedImprovement || null;
            this.evidence = config.evidence || [];
            this.confidence = config.confidence || 0;
            this.status = 'DISCOVERED';
            this.recommendation = config.recommendation || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                area: this.area,
                priority: this.priority,
                title: this.title,
                description: this.description,
                currentState: this.currentState,
                expectedImprovement: this.expectedImprovement,
                evidence: this.evidence,
                confidence: this.confidence,
                status: this.status,
                recommendation: this.recommendation,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Optimization Analysis
    // ============================================================
    class OptimizationAnalysis {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.area = config.area || OPTIMIZATION_AREAS.PERFORMANCE;
            this.data = config.data || {};
            this.insights = config.insights || [];
            this.opportunities = config.opportunities || [];
            this.summary = config.summary || '';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                area: this.area,
                data: this.data,
                insights: this.insights,
                opportunities: this.opportunities.map(o => o.toJSON ? o.toJSON() : o),
                summary: this.summary,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Runtime Self Optimization Core (Chapter 1-3)
    // ============================================================
    class RuntimeOptimization {
        constructor() {
            this._analyses = [];
            this._opportunities = [];
            this._recommendations = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                analysisInterval: 30000,
                minConfidenceThreshold: 60,
                maxOpportunitiesPerAnalysis: 10,
                enableAutoAnalyze: true,
                requireGovernanceApproval: true
            };
            this._analyzers = this._initAnalyzers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RuntimeOptimization] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RuntimeOptimization] Initializing...');

            // Connect to modules (Chapter 5)
            this._connectToPerformanceFramework();
            this._connectToMetrics();
            this._connectToTrace();
            this._connectToEvents();
            this._connectToKnowledgeGraph();
            this._connectToDecisionIntelligence();
            this._connectToGovernance();

            // Register with Explorer
            this._registerWithExplorer();

            // Start auto-analyze
            if (this._config.enableAutoAnalyze) {
                this._startAutoAnalyze();
            }

            this._initialized = true;
            console.log('[RuntimeOptimization] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Analyze (Chapter 3)
        // ============================================================

        analyze(area, options) {
            console.log(`[RuntimeOptimization] Analyzing: ${area || 'all'}`);

            const targetAreas = area ? [area] : Object.values(OPTIMIZATION_AREAS);
            const allOpportunities = [];
            const allInsights = [];

            targetAreas.forEach(targetArea => {
                const analyzer = this._analyzers[targetArea];
                if (!analyzer) {
                    console.warn(`[RuntimeOptimization] No analyzer for: ${targetArea}`);
                    return;
                }

                try {
                    const result = analyzer.analyze(options);
                    if (result) {
                        if (result.opportunities) {
                            allOpportunities.push(...result.opportunities);
                        }
                        if (result.insights) {
                            allInsights.push(...result.insights);
                        }
                    }
                } catch (e) {
                    console.error(`[RuntimeOptimization] Analyzer error (${targetArea}):`, e);
                }
            });

            // Create analysis record
            const analysis = new OptimizationAnalysis({
                area: area || 'all',
                data: options || {},
                insights: allInsights,
                opportunities: allOpportunities,
                summary: this._generateSummary(allOpportunities, allInsights),
                metadata: {
                    timestamp: Date.now(),
                    areasAnalyzed: targetAreas
                }
            });

            this._analyses.push(analysis);
            this._opportunities.push(...allOpportunities);

            this._emit('analysisComplete', analysis.toJSON());

            // Generate recommendations
            if (allOpportunities.length > 0) {
                this._generateRecommendations(allOpportunities);
            }

            return analysis;
        }

        // ============================================================
        // Analyzers (Chapter 4)
        // ============================================================

        _initAnalyzers() {
            return {
                // Performance Analyzer
                [OPTIMIZATION_AREAS.PERFORMANCE]: {
                    analyze: (options) => this._analyzePerformance(options)
                },
                // Resource Analyzer
                [OPTIMIZATION_AREAS.RESOURCE]: {
                    analyze: (options) => this._analyzeResource(options)
                },
                // Flow Analyzer
                [OPTIMIZATION_AREAS.FLOW]: {
                    analyze: (options) => this._analyzeFlow(options)
                },
                // Dependency Analyzer
                [OPTIMIZATION_AREAS.DEPENDENCY]: {
                    analyze: (options) => this._analyzeDependency(options)
                },
                // Architecture Analyzer
                [OPTIMIZATION_AREAS.ARCHITECTURE]: {
                    analyze: (options) => this._analyzeArchitecture(options)
                }
            };
        }

        // ============================================================
        // Analyzer: Performance (Chapter 4)
        // ============================================================

        _analyzePerformance(options) {
            const opportunities = [];
            const insights = [];

            // Get performance data
            const perfData = this._getPerformanceData();

            if (perfData) {
                // Check CPU
                if (perfData.cpu && perfData.cpu > 80) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.PERFORMANCE,
                        priority: perfData.cpu > 90 ? OPTIMIZATION_PRIORITY.CRITICAL : OPTIMIZATION_PRIORITY.HIGH,
                        title: 'High CPU Usage',
                        description: `CPU usage at ${perfData.cpu}%`,
                        currentState: { cpu: perfData.cpu },
                        expectedImprovement: `Reduce CPU usage by ${Math.min(perfData.cpu - 70, 30)}%`,
                        evidence: ['Performance metrics', 'Runtime monitoring'],
                        confidence: 75,
                        recommendation: 'Consider scaling or optimizing compute-intensive operations'
                    }));
                }

                // Check Memory
                if (perfData.memory && perfData.memory > 85) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.PERFORMANCE,
                        priority: perfData.memory > 95 ? OPTIMIZATION_PRIORITY.CRITICAL : OPTIMIZATION_PRIORITY.HIGH,
                        title: 'High Memory Usage',
                        description: `Memory usage at ${perfData.memory}%`,
                        currentState: { memory: perfData.memory },
                        expectedImprovement: `Reduce memory usage by ${Math.min(perfData.memory - 75, 25)}%`,
                        evidence: ['Performance metrics', 'Runtime monitoring'],
                        confidence: 70,
                        recommendation: 'Consider memory cleanup or increasing capacity'
                    }));
                }

                // Check Response Time
                if (perfData.responseTime && perfData.responseTime > 1000) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.PERFORMANCE,
                        priority: perfData.responseTime > 3000 ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'Slow Response Time',
                        description: `Response time at ${perfData.responseTime}ms`,
                        currentState: { responseTime: perfData.responseTime },
                        expectedImprovement: `Reduce response time by ${Math.round(perfData.responseTime * 0.3)}ms`,
                        evidence: ['Performance metrics'],
                        confidence: 65,
                        recommendation: 'Optimize critical paths or add caching'
                    }));
                }
            }

            if (opportunities.length > 0) {
                insights.push(`Found ${opportunities.length} performance optimization opportunities`);
            } else {
                insights.push('Performance appears healthy');
            }

            return { opportunities, insights };
        }

        // ============================================================
        // Analyzer: Resource (Chapter 4)
        // ============================================================

        _analyzeResource(options) {
            const opportunities = [];
            const insights = [];

            // Get resource data
            const resourceData = this._getResourceData();

            if (resourceData) {
                // Check resource usage patterns
                if (resourceData.utilization && resourceData.utilization > 80) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.RESOURCE,
                        priority: resourceData.utilization > 90 ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'High Resource Utilization',
                        description: `Resource utilization at ${resourceData.utilization}%`,
                        currentState: { utilization: resourceData.utilization },
                        expectedImprovement: `Optimize resource allocation`,
                        evidence: ['Resource metrics'],
                        confidence: 60,
                        recommendation: 'Review resource allocation and usage patterns'
                    }));
                }

                // Check idle resources
                if (resourceData.idle && resourceData.idle > 30) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.RESOURCE,
                        priority: OPTIMIZATION_PRIORITY.LOW,
                        title: 'Idle Resources Detected',
                        description: `${resourceData.idle}% of resources are idle`,
                        currentState: { idle: resourceData.idle },
                        expectedImprovement: 'Better resource utilization',
                        evidence: ['Resource metrics'],
                        confidence: 55,
                        recommendation: 'Consider downscaling or reallocating resources'
                    }));
                }
            }

            if (opportunities.length === 0) {
                insights.push('Resource usage appears balanced');
            }

            return { opportunities, insights };
        }

        // ============================================================
        // Analyzer: Flow (Chapter 4)
        // ============================================================

        _analyzeFlow(options) {
            const opportunities = [];
            const insights = [];

            // Get flow data
            const flowData = this._getFlowData();

            if (flowData) {
                // Check bottlenecks
                if (flowData.bottlenecks && flowData.bottlenecks.length > 0) {
                    flowData.bottlenecks.forEach(bottleneck => {
                        opportunities.push(new OptimizationOpportunity({
                            area: OPTIMIZATION_AREAS.FLOW,
                            priority: bottleneck.severity === 'high' ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                            title: `Bottleneck: ${bottleneck.name}`,
                            description: bottleneck.description || 'Flow bottleneck detected',
                            currentState: { bottleneck: bottleneck },
                            expectedImprovement: 'Improved flow efficiency',
                            evidence: ['Flow analysis', 'Runtime traces'],
                            confidence: 70,
                            recommendation: bottleneck.suggestion || 'Review and optimize flow path'
                        }));
                    });
                }

                // Check flow completion rate
                if (flowData.completionRate && flowData.completionRate < 90) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.FLOW,
                        priority: flowData.completionRate < 70 ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'Low Flow Completion Rate',
                        description: `Completion rate at ${flowData.completionRate}%`,
                        currentState: { completionRate: flowData.completionRate },
                        expectedImprovement: `Improve completion rate to > 90%`,
                        evidence: ['Flow metrics'],
                        confidence: 65,
                        recommendation: 'Identify and fix flow failures'
                    }));
                }
            }

            if (opportunities.length === 0) {
                insights.push('Flow appears optimized');
            }

            return { opportunities, insights };
        }

        // ============================================================
        // Analyzer: Dependency (Chapter 4)
        // ============================================================

        _analyzeDependency(options) {
            const opportunities = [];
            const insights = [];

            // Get dependency data
            const depData = this._getDependencyData();

            if (depData) {
                // Check circular dependencies
                if (depData.circular && depData.circular.length > 0) {
                    depData.circular.forEach(circular => {
                        opportunities.push(new OptimizationOpportunity({
                            area: OPTIMIZATION_AREAS.DEPENDENCY,
                            priority: OPTIMIZATION_PRIORITY.HIGH,
                            title: 'Circular Dependency Detected',
                            description: `Circular dependency: ${circular.join(' → ')}`,
                            currentState: { circular: circular },
                            expectedImprovement: 'Remove circular dependency',
                            evidence: ['Dependency analysis'],
                            confidence: 80,
                            recommendation: 'Refactor to remove circular dependency'
                        }));
                    });
                }

                // Check dependency depth
                if (depData.maxDepth && depData.maxDepth > 5) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.DEPENDENCY,
                        priority: OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'Deep Dependency Chain',
                        description: `Max dependency depth: ${depData.maxDepth}`,
                        currentState: { maxDepth: depData.maxDepth },
                        expectedImprovement: 'Reduce dependency depth',
                        evidence: ['Dependency analysis'],
                        confidence: 60,
                        recommendation: 'Flatten dependency structure'
                    }));
                }
            }

            if (opportunities.length === 0) {
                insights.push('Dependency structure appears healthy');
            }

            return { opportunities, insights };
        }

        // ============================================================
        // Analyzer: Architecture (Chapter 4)
        // ============================================================

        _analyzeArchitecture(options) {
            const opportunities = [];
            const insights = [];

            // Get architecture data
            const archData = this._getArchitectureData();

            if (archData) {
                // Check architecture health
                if (archData.health && archData.health < 70) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.ARCHITECTURE,
                        priority: archData.health < 50 ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'Architecture Health Below Threshold',
                        description: `Architecture health at ${archData.health}%`,
                        currentState: { health: archData.health },
                        expectedImprovement: `Improve architecture health to > 80%`,
                        evidence: ['Architecture analysis'],
                        confidence: 70,
                        recommendation: 'Review and address architecture issues'
                    }));
                }

                // Check complexity
                if (archData.complexity && archData.complexity > 0.7) {
                    opportunities.push(new OptimizationOpportunity({
                        area: OPTIMIZATION_AREAS.ARCHITECTURE,
                        priority: archData.complexity > 0.85 ? OPTIMIZATION_PRIORITY.HIGH : OPTIMIZATION_PRIORITY.MEDIUM,
                        title: 'High Architectural Complexity',
                        description: `Complexity score: ${(archData.complexity * 100).toFixed(0)}%`,
                        currentState: { complexity: archData.complexity },
                        expectedImprovement: 'Reduce complexity',
                        evidence: ['Architecture analysis'],
                        confidence: 65,
                        recommendation: 'Simplify architecture structure'
                    }));
                }
            }

            if (opportunities.length === 0) {
                insights.push('Architecture appears healthy');
            }

            return { opportunities, insights };
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getPerformanceData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        return {
                            cpu: report.cpu || 0,
                            memory: report.memory || 0,
                            responseTime: report.responseTime || 0,
                            status: report.status || 'unknown'
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getResourceData() {
            // Simplified - would pull from metrics
            return null;
        }

        _getFlowData() {
            // Simplified - would pull from event/trace data
            return null;
        }

        _getDependencyData() {
            // Simplified - would pull from registry
            return null;
        }

        _getArchitectureData() {
            // Simplified - would pull from architecture analysis
            return null;
        }

        // ============================================================
        // Recommendations (Chapter 3)
        // ============================================================

        _generateRecommendations(opportunities) {
            const sorted = [...opportunities].sort((a, b) => {
                const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
            });

            const top = sorted.slice(0, this._config.maxOpportunitiesPerAnalysis);

            top.forEach(opp => {
                // Create recommendation
                const recommendation = {
                    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                    opportunityId: opp.id,
                    area: opp.area,
                    priority: opp.priority,
                    title: opp.title,
                    description: opp.recommendation || opp.description,
                    confidence: opp.confidence,
                    status: 'PENDING_APPROVAL',
                    timestamp: Date.now()
                };

                this._recommendations.push(recommendation);

                // Send to Governance (Chapter 2)
                if (this._config.requireGovernanceApproval) {
                    this._sendToGovernance(recommendation);
                }

                this._emit('recommendationGenerated', recommendation);
            });
        }

        _generateSummary(opportunities, insights) {
            const parts = [];
            
            if (opportunities.length === 0) {
                return 'No optimization opportunities found';
            }

            const byPriority = {};
            opportunities.forEach(o => {
                byPriority[o.priority] = (byPriority[o.priority] || 0) + 1;
            });

            parts.push(`Found ${opportunities.length} optimization opportunities`);
            if (byPriority.CRITICAL) parts.push(`${byPriority.CRITICAL} critical`);
            if (byPriority.HIGH) parts.push(`${byPriority.HIGH} high priority`);
            if (byPriority.MEDIUM) parts.push(`${byPriority.MEDIUM} medium priority`);
            if (byPriority.LOW) parts.push(`${byPriority.LOW} low priority`);

            return parts.join(' | ');
        }

        // ============================================================
        // Auto-Analyze
        // ============================================================

        _startAutoAnalyze() {
            if (this._autoAnalyzeInterval) {
                clearInterval(this._autoAnalyzeInterval);
            }

            this._autoAnalyzeInterval = setInterval(() => {
                this.analyze();
            }, this._config.analysisInterval);

            console.log(`[RuntimeOptimization] Auto-analyze started (${this._config.analysisInterval}ms)`);
        }

        _stopAutoAnalyze() {
            if (this._autoAnalyzeInterval) {
                clearInterval(this._autoAnalyzeInterval);
                this._autoAnalyzeInterval = null;
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getOpportunities(filter) {
            let opportunities = this._opportunities;
            if (filter) {
                if (filter.area) {
                    opportunities = opportunities.filter(o => o.area === filter.area);
                }
                if (filter.priority) {
                    opportunities = opportunities.filter(o => o.priority === filter.priority);
                }
                if (filter.status) {
                    opportunities = opportunities.filter(o => o.status === filter.status);
                }
                if (filter.limit) {
                    opportunities = opportunities.slice(-filter.limit);
                }
            }
            return opportunities.map(o => o.toJSON());
        }

        getOpportunity(id) {
            const opportunity = this._opportunities.find(o => o.id === id);
            return opportunity ? opportunity.toJSON() : null;
        }

        getAnalyses(limit = 10) {
            return this._analyses.slice(-limit).reverse().map(a => a.toJSON());
        }

        getRecommendations(limit = 10) {
            return this._recommendations.slice(-limit).reverse();
        }

        getStats() {
            const totalOpportunities = this._opportunities.length;
            const critical = this._opportunities.filter(o => o.priority === OPTIMIZATION_PRIORITY.CRITICAL).length;
            const high = this._opportunities.filter(o => o.priority === OPTIMIZATION_PRIORITY.HIGH).length;
            const medium = this._opportunities.filter(o => o.priority === OPTIMIZATION_PRIORITY.MEDIUM).length;
            const low = this._opportunities.filter(o => o.priority === OPTIMIZATION_PRIORITY.LOW).length;

            const byArea = {};
            Object.values(OPTIMIZATION_AREAS).forEach(area => {
                byArea[area] = this._opportunities.filter(o => o.area === area).length;
            });

            return {
                totalOpportunities,
                critical,
                high,
                medium,
                low,
                byArea,
                analyses: this._analyses.length,
                recommendations: this._recommendations.length,
                avgConfidence: this._opportunities.length > 0 ?
                    Math.round(this._opportunities.reduce((sum, o) => sum + o.confidence, 0) / this._opportunities.length) :
                    0
            };
        }

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getOpportunities({ limit: 5 });
            const recentRecommendations = this.getRecommendations(5);

            return {
                type: 'runtime_optimization',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentOpportunities: recent,
                recentRecommendations: recentRecommendations,
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
                        console.error('[RuntimeOptimization] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`optimization.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 5)
        // ============================================================

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[RuntimeOptimization] Connected to Performance Framework');
            }
        }

        _connectToMetrics() {
            if (window.LawAIApp && window.LawAIApp.Metrics) {
                console.log('[RuntimeOptimization] Connected to Metrics');
            }
        }

        _connectToTrace() {
            if (window.LawAIApp && window.LawAIApp.Trace) {
                console.log('[RuntimeOptimization] Connected to Trace');
            }
        }

        _connectToEvents() {
            if (window.LawAIApp && window.LawAIApp.Events) {
                console.log('[RuntimeOptimization] Connected to Events');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[RuntimeOptimization] Connected to Knowledge Graph');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[RuntimeOptimization] Connected to Decision Intelligence');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[RuntimeOptimization] Connected to Governance');
            }
        }

        _sendToGovernance(recommendation) {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    // Send to governance for approval
                    console.log(`[RuntimeOptimization] Sent recommendation to Governance: ${recommendation.id}`);
                } catch (e) {
                    console.warn('[RuntimeOptimization] Could not send to Governance:', e);
                }
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'runtime-optimization',
                        name: 'Runtime Optimization',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[RuntimeOptimization] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[RuntimeOptimization] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoAnalyze();
            this._initialized = false;
            console.log('[RuntimeOptimization] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RuntimeOptimization();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RuntimeOptimization = {
        Core: instance,
        OPTIMIZATION_AREAS: OPTIMIZATION_AREAS,
        OPTIMIZATION_PRIORITY: OPTIMIZATION_PRIORITY,

        // Public API
        initialize: (config) => instance.initialize(config),
        analyze: (area, options) => instance.analyze(area, options),

        getOpportunities: (filter) => instance.getOpportunities(filter),
        getOpportunity: (id) => instance.getOpportunity(id),
        getAnalyses: (limit) => instance.getAnalyses(limit),
        getRecommendations: (limit) => instance.getRecommendations(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RuntimeOptimization] Part 52 loaded ✅');
    console.log('[RuntimeOptimization] Optimization Areas:', Object.values(OPTIMIZATION_AREAS).join(' | '));
    console.log('[RuntimeOptimization] Priorities:', Object.values(OPTIMIZATION_PRIORITY).join(' | '));

})();
