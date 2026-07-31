// ============================================================
// optimizationIntelligence.js
// Part 52.1 — Optimization Intelligence Foundation
// Version: v5.2.1
// Module: Runtime Self Optimization Layer
// File: js/core/optimizationIntelligence.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
        console.warn('[OptimizationIntelligence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Optimization Targets (Chapter 5)
    // ============================================================
    const OPTIMIZATION_TARGET = {
        PERFORMANCE: 'performance',
        EFFICIENCY: 'efficiency',
        STABILITY: 'stability',
        RESOURCE: 'resource',
        ARCHITECTURE: 'architecture'
    };

    // ============================================================
    // Opportunity Status
    // ============================================================
    const OPPORTUNITY_STATUS = {
        DISCOVERED: 'DISCOVERED',
        ANALYZING: 'ANALYZING',
        RECOMMENDED: 'RECOMMENDED',
        APPROVED: 'APPROVED',
        EXECUTED: 'EXECUTED',
        DISMISSED: 'DISMISSED'
    };

    // ============================================================
    // Optimization Context (Chapter 4)
    // ============================================================
    class OptimizationContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || OPTIMIZATION_TARGET.PERFORMANCE;
            this.currentState = config.currentState || null;
            this.issue = config.issue || null;
            this.impact = config.impact || null;
            this.dataSource = config.dataSource || 'runtime';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `optctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                target: this.target,
                currentState: this.currentState,
                issue: this.issue,
                impact: this.impact,
                dataSource: this.dataSource,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Optimization Opportunity (Chapter 6)
    // ============================================================
    class OptimizationOpportunity {
        constructor(config) {
            this.opportunityId = config.opportunityId || this._generateId();
            this.timestamp = Date.now();
            this.category = config.category || OPTIMIZATION_TARGET.PERFORMANCE;
            this.description = config.description || '';
            this.impact = config.impact || null;
            this.confidence = config.confidence || 0;
            this.status = OPPORTUNITY_STATUS.DISCOVERED;
            this.contextId = config.contextId || null;
            this.evidence = config.evidence || [];
            this.suggestion = config.suggestion || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `opp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                opportunityId: this.opportunityId,
                timestamp: this.timestamp,
                category: this.category,
                description: this.description,
                impact: this.impact,
                confidence: this.confidence,
                status: this.status,
                contextId: this.contextId,
                evidence: this.evidence,
                suggestion: this.suggestion,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Optimization Intelligence Core (Chapter 1-3)
    // ============================================================
    class OptimizationIntelligence {
        constructor() {
            this._contexts = [];
            this._opportunities = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                minConfidenceThreshold: 50,
                maxOpportunitiesPerScan: 10,
                enableAutoScan: true,
                scanInterval: 60000,
                requireEvidence: true
            };
            this._detectors = this._initDetectors();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OptimizationIntelligence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OptimizationIntelligence] Initializing...');

            // Connect to modules (Chapter 8)
            this._connectToDecisionIntelligence();
            this._connectToPerformanceFramework();
            this._connectToGovernance();
            this._connectToHistoricalMemory();
            this._connectToKnowledgeGraph();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            // Start auto-scan
            if (this._config.enableAutoScan) {
                this._startAutoScan();
            }

            this._initialized = true;
            console.log('[OptimizationIntelligence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Scan (Chapter 3)
        // ============================================================

        scan(targets, options) {
            console.log('[OptimizationIntelligence] Scanning for optimization opportunities...');

            const scanTargets = targets || Object.values(OPTIMIZATION_TARGET);
            const opportunities = [];
            const contexts = [];

            scanTargets.forEach(target => {
                const detector = this._detectors[target];
                if (!detector) {
                    console.warn(`[OptimizationIntelligence] No detector for: ${target}`);
                    return;
                }

                try {
                    const result = detector.detect(options);
                    if (result) {
                        // Create context
                        const context = new OptimizationContext({
                            target: target,
                            currentState: result.currentState || null,
                            issue: result.issue || null,
                            impact: result.impact || null,
                            dataSource: result.dataSource || 'runtime',
                            metadata: { scanTime: Date.now() }
                        });
                        contexts.push(context);
                        this._contexts.push(context);

                        // Create opportunities
                        if (result.opportunities && result.opportunities.length > 0) {
                            result.opportunities.forEach(oppData => {
                                const opportunity = new OptimizationOpportunity({
                                    category: target,
                                    description: oppData.description || `${target} optimization opportunity`,
                                    impact: oppData.impact || result.impact || 'unknown',
                                    confidence: oppData.confidence || 70,
                                    contextId: context.contextId,
                                    evidence: oppData.evidence || result.evidence || [],
                                    suggestion: oppData.suggestion || null,
                                    metadata: {
                                        source: detector.name || target,
                                        scanTime: Date.now()
                                    }
                                });

                                // Filter by confidence
                                if (opportunity.confidence >= this._config.minConfidenceThreshold) {
                                    opportunities.push(opportunity);
                                    this._opportunities.push(opportunity);
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.error(`[OptimizationIntelligence] Detector error (${target}):`, e);
                }
            });

            // Sort by confidence
            opportunities.sort((a, b) => b.confidence - a.confidence);

            // Limit
            const limited = opportunities.slice(0, this._config.maxOpportunitiesPerScan);

            this._emit('scanComplete', {
                contexts: contexts.map(c => c.toJSON()),
                opportunities: limited.map(o => o.toJSON()),
                totalFound: opportunities.length,
                timestamp: Date.now()
            });

            return {
                contexts: contexts,
                opportunities: limited,
                totalFound: opportunities.length
            };
        }

        // ============================================================
        // Detectors (Chapter 7)
        // ============================================================

        _initDetectors() {
            return {
                [OPTIMIZATION_TARGET.PERFORMANCE]: {
                    name: 'performance_detector',
                    detect: (options) => this._detectPerformanceIssues(options)
                },
                [OPTIMIZATION_TARGET.EFFICIENCY]: {
                    name: 'efficiency_detector',
                    detect: (options) => this._detectEfficiencyIssues(options)
                },
                [OPTIMIZATION_TARGET.STABILITY]: {
                    name: 'stability_detector',
                    detect: (options) => this._detectStabilityIssues(options)
                },
                [OPTIMIZATION_TARGET.RESOURCE]: {
                    name: 'resource_detector',
                    detect: (options) => this._detectResourceIssues(options)
                },
                [OPTIMIZATION_TARGET.ARCHITECTURE]: {
                    name: 'architecture_detector',
                    detect: (options) => this._detectArchitectureIssues(options)
                }
            };
        }

        // ============================================================
        // Detector: Performance (Chapter 5)
        // ============================================================

        _detectPerformanceIssues(options) {
            const opportunities = [];
            const evidence = [];
            let currentState = null;
            let issue = null;
            let impact = null;

            // Get performance data
            const perfData = this._getPerformanceData();

            if (perfData) {
                currentState = {
                    cpu: perfData.cpu,
                    memory: perfData.memory,
                    responseTime: perfData.responseTime,
                    status: perfData.status
                };

                // CPU issue
                if (perfData.cpu && perfData.cpu > 80) {
                    issue = 'High CPU usage detected';
                    impact = `CPU at ${perfData.cpu}% - affects response time and throughput`;
                    evidence.push(`CPU usage: ${perfData.cpu}% (threshold: 80%)`);

                    opportunities.push({
                        description: 'Reduce CPU usage by optimizing compute-intensive operations',
                        impact: 'Improve response time and system throughput',
                        confidence: Math.min(100, 70 + (perfData.cpu - 80) * 0.5),
                        evidence: ['CPU metrics', 'Performance monitoring'],
                        suggestion: 'Consider scaling, code optimization, or caching'
                    });
                }

                // Memory issue
                if (perfData.memory && perfData.memory > 85) {
                    if (!issue) issue = 'High memory usage detected';
                    impact = `Memory at ${perfData.memory}% - risk of OOM`;
                    evidence.push(`Memory usage: ${perfData.memory}% (threshold: 85%)`);

                    opportunities.push({
                        description: 'Reduce memory usage through cleanup or optimization',
                        impact: 'Prevent memory exhaustion and improve stability',
                        confidence: Math.min(100, 65 + (perfData.memory - 85) * 0.3),
                        evidence: ['Memory metrics', 'Runtime monitoring'],
                        suggestion: 'Review memory leaks, implement cleanup, or increase capacity'
                    });
                }

                // Response time issue
                if (perfData.responseTime && perfData.responseTime > 1000) {
                    if (!issue) issue = 'High response time detected';
                    impact = `Response time: ${perfData.responseTime}ms - user experience impacted`;
                    evidence.push(`Response time: ${perfData.responseTime}ms (threshold: 1000ms)`);

                    opportunities.push({
                        description: 'Optimize critical paths to reduce response time',
                        impact: 'Improve user experience and system responsiveness',
                        confidence: Math.min(100, 60 + (perfData.responseTime - 1000) * 0.01),
                        evidence: ['Response time metrics'],
                        suggestion: 'Add caching, optimize queries, or parallelize operations'
                    });
                }
            }

            // If no issues found, return healthy status
            if (opportunities.length === 0) {
                return {
                    currentState: currentState || { status: 'healthy' },
                    issue: null,
                    impact: null,
                    opportunities: [],
                    evidence: ['Performance metrics show healthy status'],
                    dataSource: 'performance'
                };
            }

            return {
                currentState: currentState,
                issue: issue || 'Performance issues detected',
                impact: impact || 'Performance degradation affects system',
                opportunities: opportunities,
                evidence: evidence,
                dataSource: 'performance'
            };
        }

        // ============================================================
        // Detector: Efficiency (Chapter 5)
        // ============================================================

        _detectEfficiencyIssues(options) {
            const opportunities = [];
            const evidence = [];
            let currentState = null;
            let issue = null;
            let impact = null;

            // Get efficiency data
            const effData = this._getEfficiencyData();

            if (effData) {
                currentState = {
                    utilization: effData.utilization,
                    waste: effData.waste,
                    efficiency: effData.efficiency
                };

                // Low efficiency
                if (effData.efficiency && effData.efficiency < 60) {
                    issue = 'Low system efficiency detected';
                    impact = `Efficiency at ${effData.efficiency}% - resources underutilized`;
                    evidence.push(`Efficiency: ${effData.efficiency}%`);

                    opportunities.push({
                        description: 'Improve system efficiency through better resource utilization',
                        impact: 'Better resource usage and cost efficiency',
                        confidence: 65,
                        evidence: ['Efficiency metrics'],
                        suggestion: 'Review resource allocation and usage patterns'
                    });
                }

                // Resource waste
                if (effData.waste && effData.waste > 30) {
                    if (!issue) issue = 'Resource waste detected';
                    impact = `${effData.waste}% of resources wasted`;
                    evidence.push(`Resource waste: ${effData.waste}%`);

                    opportunities.push({
                        description: 'Reduce resource waste through optimization',
                        impact: 'Cost savings and better efficiency',
                        confidence: 60,
                        evidence: ['Resource utilization data'],
                        suggestion: 'Implement resource pooling or auto-scaling'
                    });
                }
            }

            if (opportunities.length === 0) {
                return {
                    currentState: currentState || { efficiency: 'optimal' },
                    issue: null,
                    impact: null,
                    opportunities: [],
                    evidence: ['Efficiency metrics show optimal status'],
                    dataSource: 'efficiency'
                };
            }

            return {
                currentState: currentState,
                issue: issue || 'Efficiency issues detected',
                impact: impact || 'Efficiency impacts system performance',
                opportunities: opportunities,
                evidence: evidence,
                dataSource: 'efficiency'
            };
        }

        // ============================================================
        // Detector: Stability (Chapter 5)
        // ============================================================

        _detectStabilityIssues(options) {
            const opportunities = [];
            const evidence = [];
            let currentState = null;
            let issue = null;
            let impact = null;

            // Get stability data
            const stabData = this._getStabilityData();

            if (stabData) {
                currentState = {
                    errorRate: stabData.errorRate,
                    uptime: stabData.uptime,
                    status: stabData.status
                };

                // High error rate
                if (stabData.errorRate && stabData.errorRate > 5) {
                    issue = 'High error rate detected';
                    impact = `${stabData.errorRate}% error rate - stability at risk`;
                    evidence.push(`Error rate: ${stabData.errorRate}%`);

                    opportunities.push({
                        description: 'Reduce error rate through improved error handling',
                        impact: 'Better system stability and user experience',
                        confidence: 70,
                        evidence: ['Error metrics', 'Runtime logs'],
                        suggestion: 'Review error logs and implement fixes'
                    });
                }

                // Low uptime
                if (stabData.uptime && stabData.uptime < 95) {
                    if (!issue) issue = 'Low uptime detected';
                    impact = `Uptime: ${stabData.uptime}% - below target`;
                    evidence.push(`Uptime: ${stabData.uptime}%`);

                    opportunities.push({
                        description: 'Improve system uptime through reliability enhancements',
                        impact: 'Better availability and user trust',
                        confidence: 75,
                        evidence: ['Uptime metrics'],
                        suggestion: 'Review failure patterns and implement redundancy'
                    });
                }
            }

            if (opportunities.length === 0) {
                return {
                    currentState: currentState || { status: 'stable' },
                    issue: null,
                    impact: null,
                    opportunities: [],
                    evidence: ['Stability metrics show healthy status'],
                    dataSource: 'stability'
                };
            }

            return {
                currentState: currentState,
                issue: issue || 'Stability issues detected',
                impact: impact || 'Stability affects system reliability',
                opportunities: opportunities,
                evidence: evidence,
                dataSource: 'stability'
            };
        }

        // ============================================================
        // Detector: Resource (Chapter 5)
        // ============================================================

        _detectResourceIssues(options) {
            const opportunities = [];
            const evidence = [];
            let currentState = null;
            let issue = null;
            let impact = null;

            const resData = this._getResourceData();

            if (resData) {
                currentState = {
                    cpu: resData.cpu,
                    memory: resData.memory,
                    disk: resData.disk,
                    network: resData.network
                };

                if (resData.cpu && resData.cpu > 85) {
                    issue = 'Resource contention detected';
                    impact = 'CPU contention affects performance';
                    evidence.push(`CPU usage: ${resData.cpu}%`);

                    opportunities.push({
                        description: 'Reduce resource contention through allocation optimization',
                        impact: 'Better resource utilization and performance',
                        confidence: 65,
                        evidence: ['Resource metrics'],
                        suggestion: 'Review resource allocation and scheduling'
                    });
                }
            }

            if (opportunities.length === 0) {
                return {
                    currentState: currentState || { status: 'balanced' },
                    issue: null,
                    impact: null,
                    opportunities: [],
                    evidence: ['Resource metrics show balanced usage'],
                    dataSource: 'resource'
                };
            }

            return {
                currentState: currentState,
                issue: issue || 'Resource issues detected',
                impact: impact || 'Resource issues affect system performance',
                opportunities: opportunities,
                evidence: evidence,
                dataSource: 'resource'
            };
        }

        // ============================================================
        // Detector: Architecture (Chapter 5)
        // ============================================================

        _detectArchitectureIssues(options) {
            const opportunities = [];
            const evidence = [];
            let currentState = null;
            let issue = null;
            let impact = null;

            const archData = this._getArchitectureData();

            if (archData) {
                currentState = {
                    complexity: archData.complexity,
                    health: archData.health,
                    modules: archData.modules
                };

                if (archData.complexity && archData.complexity > 0.7) {
                    issue = 'High architectural complexity detected';
                    impact = `Complexity score: ${(archData.complexity * 100).toFixed(0)}% - maintainability at risk`;
                    evidence.push(`Complexity score: ${(archData.complexity * 100).toFixed(0)}%`);

                    opportunities.push({
                        description: 'Reduce architectural complexity through refactoring',
                        impact: 'Better maintainability and developer productivity',
                        confidence: 70,
                        evidence: ['Architecture analysis'],
                        suggestion: 'Review module boundaries and dependencies'
                    });
                }

                if (archData.health && archData.health < 70) {
                    if (!issue) issue = 'Architecture health below threshold';
                    impact = `Health score: ${archData.health}% - technical debt accumulating`;
                    evidence.push(`Health score: ${archData.health}%`);

                    opportunities.push({
                        description: 'Improve architecture health through targeted refactoring',
                        impact: 'Reduced technical debt and better long-term maintainability',
                        confidence: 75,
                        evidence: ['Architecture health metrics'],
                        suggestion: 'Address critical health issues identified in analysis'
                    });
                }
            }

            if (opportunities.length === 0) {
                return {
                    currentState: currentState || { health: 'good' },
                    issue: null,
                    impact: null,
                    opportunities: [],
                    evidence: ['Architecture analysis shows healthy structure'],
                    dataSource: 'architecture'
                };
            }

            return {
                currentState: currentState,
                issue: issue || 'Architecture issues detected',
                impact: impact || 'Architecture issues affect system evolution',
                opportunities: opportunities,
                evidence: evidence,
                dataSource: 'architecture'
            };
        }

        // ============================================================
        // Data Retrieval (Chapter 7)
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

        _getEfficiencyData() {
            // Simplified - would pull from metrics
            return {
                utilization: 65,
                waste: 20,
                efficiency: 70
            };
        }

        _getStabilityData() {
            // Simplified - would pull from events/traces
            return {
                errorRate: 2,
                uptime: 98,
                status: 'stable'
            };
        }

        _getResourceData() {
            // Simplified - would pull from resource monitoring
            return {
                cpu: 60,
                memory: 70,
                disk: 50,
                network: 30
            };
        }

        _getArchitectureData() {
            // Simplified - would pull from architecture analysis
            return {
                complexity: 0.5,
                health: 80,
                modules: 15
            };
        }

        // ============================================================
        // Auto-Scan (Chapter 3)
        // ============================================================

        _startAutoScan() {
            if (this._scanInterval) {
                clearInterval(this._scanInterval);
            }

            this._scanInterval = setInterval(() => {
                this.scan();
            }, this._config.scanInterval);

            console.log(`[OptimizationIntelligence] Auto-scan started (${this._config.scanInterval}ms)`);
        }

        _stopAutoScan() {
            if (this._scanInterval) {
                clearInterval(this._scanInterval);
                this._scanInterval = null;
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getOpportunities(filter) {
            let opportunities = this._opportunities;
            if (filter) {
                if (filter.category) {
                    opportunities = opportunities.filter(o => o.category === filter.category);
                }
                if (filter.status) {
                    opportunities = opportunities.filter(o => o.status === filter.status);
                }
                if (filter.minConfidence) {
                    opportunities = opportunities.filter(o => o.confidence >= filter.minConfidence);
                }
                if (filter.limit) {
                    opportunities = opportunities.slice(-filter.limit);
                }
            }
            return opportunities.map(o => o.toJSON());
        }

        getOpportunity(id) {
            const opportunity = this._opportunities.find(o => o.opportunityId === id);
            return opportunity ? opportunity.toJSON() : null;
        }

        getContexts(limit = 10) {
            return this._contexts.slice(-limit).reverse().map(c => c.toJSON());
        }

        getStats() {
            const total = this._opportunities.length;
            const byCategory = {};
            const byStatus = {};

            Object.values(OPTIMIZATION_TARGET).forEach(cat => {
                byCategory[cat] = this._opportunities.filter(o => o.category === cat).length;
            });

            Object.values(OPPORTUNITY_STATUS).forEach(status => {
                byStatus[status] = this._opportunities.filter(o => o.status === status).length;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._opportunities.reduce((sum, o) => sum + o.confidence, 0) / total) :
                0;

            return {
                total,
                byCategory,
                byStatus,
                avgConfidence,
                contexts: this._contexts.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getOpportunities({ limit: 5 });

            return {
                type: 'optimization_intelligence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentOpportunities: recent,
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
                        console.error('[OptimizationIntelligence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`optintel.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 8)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OptimizationIntelligence] Connected to Decision Intelligence');
            }
        }

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[OptimizationIntelligence] Connected to Performance Framework');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[OptimizationIntelligence] Connected to Governance');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[OptimizationIntelligence] Connected to Historical Memory');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[OptimizationIntelligence] Connected to Knowledge Graph');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'optimization-intelligence',
                        name: 'Optimization Intelligence',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OptimizationIntelligence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OptimizationIntelligence] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoScan();
            this._initialized = false;
            console.log('[OptimizationIntelligence] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new OptimizationIntelligence();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OptimizationIntelligence = {
        Core: instance,
        OPTIMIZATION_TARGET: OPTIMIZATION_TARGET,
        OPPORTUNITY_STATUS: OPPORTUNITY_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        scan: (targets, options) => instance.scan(targets, options),

        getOpportunities: (filter) => instance.getOpportunities(filter),
        getOpportunity: (id) => instance.getOpportunity(id),
        getContexts: (limit) => instance.getContexts(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OptimizationIntelligence] Part 52.1 loaded ✅');
    console.log('[OptimizationIntelligence] Targets:', Object.values(OPTIMIZATION_TARGET).join(' | '));
    console.log('[OptimizationIntelligence] Statuses:', Object.values(OPPORTUNITY_STATUS).join(' | '));

})();
