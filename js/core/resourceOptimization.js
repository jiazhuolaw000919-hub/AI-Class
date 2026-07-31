// ============================================================
// resourceOptimization.js
// Part 52.3 — Resource Optimization Engine
// Version: v5.2.3
// Module: Runtime Self Optimization Layer
// File: js/core/resourceOptimization.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
        console.warn('[ResourceOptimization] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Resource Areas (Chapter 4)
    // ============================================================
    const RESOURCE_TYPES = {
        MEMORY: 'memory',
        STORAGE: 'storage',
        PROCESSING: 'processing',
        MODULE: 'module',
        EVENT: 'event'
    };

    // ============================================================
    // Resource Trend Types
    // ============================================================
    const TREND = {
        INCREASING: 'increasing',
        DECREASING: 'decreasing',
        STABLE: 'stable',
        FLUCTUATING: 'fluctuating'
    };

    // ============================================================
    // Resource Context Model (Chapter 5)
    // ============================================================
    class ResourceContext {
        constructor(config) {
            this.resourceId = config.resourceId || this._generateId();
            this.timestamp = Date.now();
            this.type = config.type || RESOURCE_TYPES.MEMORY;
            this.currentUsage = config.currentUsage || 0;
            this.baseline = config.baseline || 0;
            this.trend = config.trend || TREND.STABLE;
            this.impact = config.impact || 'unknown';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `resctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getUsageDeviation() {
            if (this.baseline === 0) return 0;
            return Math.round(((this.currentUsage - this.baseline) / this.baseline) * 100);
        }

        toJSON() {
            return {
                resourceId: this.resourceId,
                timestamp: this.timestamp,
                type: this.type,
                currentUsage: this.currentUsage,
                baseline: this.baseline,
                deviation: this.getUsageDeviation(),
                trend: this.trend,
                impact: this.impact,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Resource Optimization Opportunity (Chapter 7)
    // ============================================================
    class ResourceOpportunity {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.issue = config.issue || '';
            this.impact = config.impact || '';
            this.suggestion = config.suggestion || '';
            this.confidence = config.confidence || 0;
            this.contextId = config.contextId || null;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `resopp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                target: this.target,
                issue: this.issue,
                impact: this.impact,
                suggestion: this.suggestion,
                confidence: this.confidence,
                contextId: this.contextId,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Resource Optimization Engine Core (Chapter 1-3)
    // ============================================================
    class ResourceOptimization {
        constructor() {
            this._contexts = [];
            this._opportunities = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 100,
                memoryThreshold: 80,
                storageThreshold: 85,
                processingThreshold: 70,
                moduleThreshold: 60,
                enableAutoAnalysis: true,
                analysisInterval: 45000
            };
            this._analyzers = this._initAnalyzers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ResourceOptimization] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ResourceOptimization] Initializing...');

            // Connect to modules (Chapter 9)
            this._connectToPerformanceAnalyzer();
            this._connectToMetricsFramework();
            this._connectToHistoricalMemory();
            this._connectToKnowledgeGraph();
            this._connectToOptimizationIntelligence();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-analysis
            if (this._config.enableAutoAnalysis) {
                this._startAutoAnalysis();
            }

            this._initialized = true;
            console.log('[ResourceOptimization] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Analyze Resources (Chapter 3)
        // ============================================================

        analyze(types, options) {
            console.log('[ResourceOptimization] Analyzing resources...');

            const targetTypes = types || Object.values(RESOURCE_TYPES);
            const allContexts = [];
            const allOpportunities = [];

            targetTypes.forEach(type => {
                const analyzer = this._analyzers[type];
                if (!analyzer) {
                    console.warn(`[ResourceOptimization] No analyzer for: ${type}`);
                    return;
                }

                try {
                    const result = analyzer.analyze(options);
                    if (result) {
                        // Create resource contexts
                        if (result.contexts) {
                            const contexts = result.contexts.map(c => new ResourceContext(c));
                            allContexts.push(...contexts);
                            this._contexts.push(...contexts);
                        }

                        // Create opportunities
                        if (result.opportunities) {
                            const opportunities = result.opportunities.map(o => 
                                new ResourceOpportunity(Object.assign(o, { evidence: result.evidence || [] }))
                            );
                            allOpportunities.push(...opportunities);
                            this._opportunities.push(...opportunities);
                        }
                    }
                } catch (e) {
                    console.error(`[ResourceOptimization] Analyzer error (${type}):`, e);
                }
            });

            // Enforce history limits
            if (this._contexts.length > this._config.maxHistorySize) {
                this._contexts = this._contexts.slice(-this._config.maxHistorySize);
            }
            if (this._opportunities.length > this._config.maxHistorySize) {
                this._opportunities = this._opportunities.slice(-this._config.maxHistorySize);
            }

            // Update history
            this._updateHistory(allContexts);

            this._emit('analysisComplete', {
                contexts: allContexts.map(c => c.toJSON()),
                opportunities: allOpportunities.map(o => o.toJSON()),
                timestamp: Date.now()
            });

            return {
                contexts: allContexts,
                opportunities: allOpportunities
            };
        }

        // ============================================================
        // Analyzers (Chapter 4, 6)
        // ============================================================

        _initAnalyzers() {
            return {
                [RESOURCE_TYPES.MEMORY]: {
                    name: 'memory_analyzer',
                    analyze: (options) => this._analyzeMemory(options)
                },
                [RESOURCE_TYPES.STORAGE]: {
                    name: 'storage_analyzer',
                    analyze: (options) => this._analyzeStorage(options)
                },
                [RESOURCE_TYPES.PROCESSING]: {
                    name: 'processing_analyzer',
                    analyze: (options) => this._analyzeProcessing(options)
                },
                [RESOURCE_TYPES.MODULE]: {
                    name: 'module_analyzer',
                    analyze: (options) => this._analyzeModuleUsage(options)
                },
                [RESOURCE_TYPES.EVENT]: {
                    name: 'event_analyzer',
                    analyze: (options) => this._analyzeEventActivity(options)
                }
            };
        }

        // ============================================================
        // Analyzer: Memory (Chapter 4, 6)
        // ============================================================

        _analyzeMemory(options) {
            const contexts = [];
            const opportunities = [];
            const evidence = [];

            // Get memory data
            const memData = this._getMemoryData();

            if (memData) {
                evidence.push(`Current memory: ${memData.current || 0}%`);
                evidence.push(`Memory baseline: ${memData.baseline || 60}%`);
                evidence.push(`Memory trend: ${memData.trend || 'stable'}`);

                // Create context
                const context = {
                    type: RESOURCE_TYPES.MEMORY,
                    currentUsage: memData.current || 0,
                    baseline: memData.baseline || 60,
                    trend: memData.trend || TREND.STABLE,
                    impact: memData.current > 80 ? 'Performance degradation risk' : 'Normal usage',
                    metadata: { source: 'memory_analyzer' }
                };
                contexts.push(context);

                // Check high usage (Chapter 6)
                if (memData.current > this._config.memoryThreshold) {
                    const deviation = memData.current - (memData.baseline || 60);
                    opportunities.push({
                        target: 'Memory',
                        issue: `Memory usage at ${memData.current}% (${deviation > 0 ? '+' : ''}${Math.round(deviation)}% deviation)`,
                        impact: 'Risk of OOM and performance degradation',
                        suggestion: 'Implement memory cleanup, review allocation patterns, or increase capacity',
                        confidence: 75,
                        evidence: ['Memory metrics show high usage']
                    });
                }

                // Check increasing trend
                if (memData.trend === TREND.INCREASING) {
                    opportunities.push({
                        target: 'Memory',
                        issue: 'Memory usage trending upward over time',
                        impact: 'Potential memory leak if trend continues',
                        suggestion: 'Investigate memory accumulation patterns and fix leaks',
                        confidence: 70,
                        evidence: ['Memory trend analysis shows consistent increase']
                    });
                }

                // Check idle memory waste (Chapter 6)
                if (memData.idle && memData.idle > 30) {
                    opportunities.push({
                        target: 'Memory',
                        issue: `${Math.round(memData.idle)}% of memory is idle or wasted`,
                        impact: 'Inefficient memory utilization',
                        suggestion: 'Review memory allocation and deallocate unused resources',
                        confidence: 60,
                        evidence: ['Idle memory detection']
                    });
                }

                // Check repeated loading (Chapter 6)
                if (memData.repeatedLoad && memData.repeatedLoad > 10) {
                    opportunities.push({
                        target: 'Memory',
                        issue: `${memData.repeatedLoad} repeated memory loading patterns detected`,
                        impact: 'Unnecessary memory churn and allocation overhead',
                        suggestion: 'Implement caching or reuse patterns to reduce repeated loading',
                        confidence: 65,
                        evidence: ['Repeated load pattern analysis']
                    });
                }
            }

            return { contexts, opportunities, evidence };
        }

        // ============================================================
        // Analyzer: Storage (Chapter 4, 6)
        // ============================================================

        _analyzeStorage(options) {
            const contexts = [];
            const opportunities = [];
            const evidence = [];

            const storageData = this._getStorageData();

            if (storageData) {
                evidence.push(`Storage usage: ${storageData.current || 0}%`);
                evidence.push(`Storage type: ${storageData.type || 'unknown'}`);

                const context = {
                    type: RESOURCE_TYPES.STORAGE,
                    currentUsage: storageData.current || 0,
                    baseline: storageData.baseline || 50,
                    trend: storageData.trend || TREND.STABLE,
                    impact: storageData.current > 80 ? 'Storage capacity risk' : 'Normal usage',
                    metadata: { source: 'storage_analyzer' }
                };
                contexts.push(context);

                if (storageData.current > this._config.storageThreshold) {
                    opportunities.push({
                        target: 'Storage',
                        issue: `Storage usage at ${storageData.current}%`,
                        impact: 'Risk of storage exhaustion',
                        suggestion: 'Clean up unused data, archive old data, or increase capacity',
                        confidence: 75,
                        evidence: ['Storage metrics show high usage']
                    });
                }

                if (storageData.unused && storageData.unused > 20) {
                    opportunities.push({
                        target: 'Storage',
                        issue: `${Math.round(storageData.unused)}% of storage contains unused data`,
                        impact: 'Wasted storage capacity',
                        suggestion: 'Review and remove unused files or implement data lifecycle policy',
                        confidence: 60,
                        evidence: ['Unused storage analysis']
                    });
                }
            }

            return { contexts, opportunities, evidence };
        }

        // ============================================================
        // Analyzer: Processing (Chapter 4, 6)
        // ============================================================

        _analyzeProcessing(options) {
            const contexts = [];
            const opportunities = [];
            const evidence = [];

            const procData = this._getProcessingData();

            if (procData) {
                evidence.push(`Processing load: ${procData.current || 0}%`);
                evidence.push(`Active processes: ${procData.active || 0}`);

                const context = {
                    type: RESOURCE_TYPES.PROCESSING,
                    currentUsage: procData.current || 0,
                    baseline: procData.baseline || 40,
                    trend: procData.trend || TREND.STABLE,
                    impact: procData.current > 70 ? 'Processing capacity strain' : 'Normal usage',
                    metadata: { source: 'processing_analyzer' }
                };
                contexts.push(context);

                if (procData.current > this._config.processingThreshold) {
                    opportunities.push({
                        target: 'Processing',
                        issue: `Processing load at ${procData.current}%`,
                        impact: 'System responsiveness may be affected',
                        suggestion: 'Optimize processing, distribute load, or scale up',
                        confidence: 70,
                        evidence: ['Processing load metrics']
                    });
                }

                if (procData.duplicates && procData.duplicates > 0) {
                    opportunities.push({
                        target: 'Processing',
                        issue: `${procData.duplicates} duplicate processes detected`,
                        impact: 'Unnecessary resource consumption and potential conflicts',
                        suggestion: 'Review and eliminate duplicate processes',
                        confidence: 65,
                        evidence: ['Duplicate process detection']
                    });
                }

                if (procData.idleCapacity && procData.idleCapacity > 40) {
                    opportunities.push({
                        target: 'Processing',
                        issue: `${Math.round(procData.idleCapacity)}% of processing capacity unused`,
                        impact: 'Underutilized compute resources',
                        suggestion: 'Consider optimizing workload distribution or scaling down',
                        confidence: 55,
                        evidence: ['Capacity utilization analysis']
                    });
                }
            }

            return { contexts, opportunities, evidence };
        }

        // ============================================================
        // Analyzer: Module (Chapter 4, 6)
        // ============================================================

        _analyzeModuleUsage(options) {
            const contexts = [];
            const opportunities = [];
            const evidence = [];

            const moduleData = this._getModuleData();

            if (moduleData && moduleData.modules) {
                evidence.push(`Total modules: ${moduleData.modules.length}`);
                evidence.push(`Active modules: ${moduleData.active || 0}`);

                const activeModules = moduleData.modules.filter(m => m.active);
                const inactiveModules = moduleData.modules.filter(m => !m.active);

                const context = {
                    type: RESOURCE_TYPES.MODULE,
                    currentUsage: activeModules.length,
                    baseline: moduleData.baseline || 0,
                    trend: moduleData.trend || TREND.STABLE,
                    impact: `${activeModules.length} of ${moduleData.modules.length} modules active`,
                    metadata: { source: 'module_analyzer' }
                };
                contexts.push(context);

                // Check module count
                if (activeModules.length > this._config.moduleThreshold) {
                    opportunities.push({
                        target: 'Module',
                        issue: `${activeModules.length} modules currently active`,
                        impact: 'High module count may affect startup and performance',
                        suggestion: 'Review module usage and consider lazy loading',
                        confidence: 60,
                        evidence: ['Module usage analysis']
                    });
                }

                // Check inactive modules (Chapter 6 - Unused Capacity)
                if (inactiveModules.length > 5) {
                    opportunities.push({
                        target: 'Module',
                        issue: `${inactiveModules.length} modules are inactive/unused`,
                        impact: 'Unnecessary resource overhead and complexity',
                        suggestion: 'Review and consider removing unused modules',
                        confidence: 55,
                        evidence: ['Inactive module detection']
                    });
                }

                // Check repeated loading (Chapter 6)
                const repeatedLoad = moduleData.modules.filter(m => m.loadCount > 5);
                if (repeatedLoad.length > 0) {
                    opportunities.push({
                        target: 'Module',
                        issue: `${repeatedLoad.length} module(s) loaded more than 5 times`,
                        impact: 'Inefficient module reloading and resource waste',
                        suggestion: 'Implement module caching or singleton pattern',
                        confidence: 60,
                        evidence: ['Module loading pattern analysis']
                    });
                }
            }

            return { contexts, opportunities, evidence };
        }

        // ============================================================
        // Analyzer: Event Activity (Chapter 4, 6)
        // ============================================================

        _analyzeEventActivity(options) {
            const contexts = [];
            const opportunities = [];
            const evidence = [];

            const eventData = this._getEventData();

            if (eventData) {
                evidence.push(`Event rate: ${eventData.rate || 0}/s`);
                evidence.push(`Total events: ${eventData.total || 0}`);

                const context = {
                    type: RESOURCE_TYPES.EVENT,
                    currentUsage: eventData.rate || 0,
                    baseline: eventData.baseline || 10,
                    trend: eventData.trend || TREND.STABLE,
                    impact: eventData.rate > 50 ? 'High event throughput' : 'Normal event activity',
                    metadata: { source: 'event_analyzer' }
                };
                contexts.push(context);

                // Check high event rate
                if (eventData.rate && eventData.rate > 50) {
                    opportunities.push({
                        target: 'Event',
                        issue: `Event rate at ${eventData.rate}/s`,
                        impact: 'High event throughput may affect system performance',
                        suggestion: 'Optimize event handlers or implement batching',
                        confidence: 65,
                        evidence: ['Event rate metrics']
                    });
                }

                // Check duplicate events (Chapter 6 - Duplicate Process)
                if (eventData.duplicates && eventData.duplicates > 10) {
                    opportunities.push({
                        target: 'Event',
                        issue: `${eventData.duplicates} duplicate events detected`,
                        impact: 'Unnecessary event processing overhead',
                        suggestion: 'Implement deduplication or idempotent event handling',
                        confidence: 60,
                        evidence: ['Duplicate event analysis']
                    });
                }

                // Check event backlog
                if (eventData.backlog && eventData.backlog > 100) {
                    opportunities.push({
                        target: 'Event',
                        issue: `${eventData.backlog} events in backlog`,
                        impact: 'Processing delay and potential resource strain',
                        suggestion: 'Scale event processing or optimize handler performance',
                        confidence: 70,
                        evidence: ['Event backlog detection']
                    });
                }
            }

            return { contexts, opportunities, evidence };
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getMemoryData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        return {
                            current: report.memory || 0,
                            baseline: report.memoryBaseline || 60,
                            trend: report.memoryTrend || TREND.STABLE,
                            idle: report.idleMemory || 0,
                            repeatedLoad: report.repeatedLoads || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getStorageData() {
            try {
                // Simplified - would pull from storage metrics
                return {
                    current: 65,
                    baseline: 50,
                    trend: TREND.STABLE,
                    type: 'runtime',
                    unused: 15
                };
            } catch (e) { /* ignore */ }
            return null;
        }

        _getProcessingData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        return {
                            current: report.cpu || 0,
                            baseline: 40,
                            trend: report.cpuTrend || TREND.STABLE,
                            active: report.activeProcesses || 0,
                            duplicates: report.duplicateProcesses || 0,
                            idleCapacity: 100 - (report.cpu || 0)
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getModuleData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const modules = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (modules) {
                        const moduleList = Object.values(modules).map(m => ({
                            name: m.name || m.id || 'unknown',
                            active: m.active !== false,
                            loadCount: m.loadCount || 0
                        }));
                        const active = moduleList.filter(m => m.active).length;
                        return {
                            modules: moduleList,
                            active: active,
                            baseline: 10,
                            trend: TREND.STABLE
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getEventData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Events) {
                    const stats = window.LawAIApp.Events.getStatistics ?
                        window.LawAIApp.Events.getStatistics() : null;
                    if (stats) {
                        return {
                            rate: stats.rate || 0,
                            total: stats.total || 0,
                            baseline: 10,
                            trend: stats.trend || TREND.STABLE,
                            duplicates: stats.duplicates || 0,
                            backlog: stats.backlog || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        // ============================================================
        // History & Comparison (Chapter 8)
        // ============================================================

        _updateHistory(contexts) {
            contexts.forEach(c => {
                this._history.push({
                    resourceId: c.resourceId,
                    type: c.type,
                    usage: c.currentUsage,
                    timestamp: Date.now()
                });
            });

            if (this._history.length > this._config.maxHistorySize * 2) {
                this._history = this._history.slice(-this._config.maxHistorySize);
            }
        }

        getResourceHistory(type, limit) {
            const history = this._history.filter(h => h.type === type);
            return history.slice(-(limit || 20));
        }

        getTrend(type) {
            const history = this.getResourceHistory(type, 10);
            if (history.length < 3) return TREND.STABLE;

            const values = history.map(h => h.usage);
            const first = values[0];
            const last = values[values.length - 1];

            if (last > first * 1.1) return TREND.INCREASING;
            if (last < first * 0.9) return TREND.DECREASING;
            
            const variance = this._calculateVariance(values);
            return variance > 15 ? TREND.FLUCTUATING : TREND.STABLE;
        }

        _calculateVariance(values) {
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
            return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
        }

        // ============================================================
        // Auto-Analysis
        // ============================================================

        _startAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
            }

            this._analysisInterval = setInterval(() => {
                this.analyze();
            }, this._config.analysisInterval);

            console.log(`[ResourceOptimization] Auto-analysis started (${this._config.analysisInterval}ms)`);
        }

        _stopAutoAnalysis() {
            if (this._analysisInterval) {
                clearInterval(this._analysisInterval);
                this._analysisInterval = null;
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getOpportunities(filter) {
            let opportunities = this._opportunities;
            if (filter) {
                if (filter.target) {
                    opportunities = opportunities.filter(o => o.target === filter.target);
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
            const opportunity = this._opportunities.find(o => o.id === id);
            return opportunity ? opportunity.toJSON() : null;
        }

        getContexts(limit = 10) {
            return this._contexts.slice(-limit).reverse().map(c => c.toJSON());
        }

        getStats() {
            const totalOpportunities = this._opportunities.length;
            const byTarget = {};

            this._opportunities.forEach(o => {
                byTarget[o.target] = (byTarget[o.target] || 0) + 1;
            });

            const avgConfidence = totalOpportunities > 0 ?
                Math.round(this._opportunities.reduce((sum, o) => sum + o.confidence, 0) / totalOpportunities) :
                0;

            return {
                totalOpportunities,
                byTarget,
                avgConfidence,
                contexts: this._contexts.length,
                historySize: this._history.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getOpportunities({ limit: 5 });
            const recentContexts = this.getContexts(3);

            return {
                type: 'resource_optimization',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentOpportunities: recent,
                recentContexts: recentContexts,
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
                        console.error('[ResourceOptimization] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`resourceopt.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('resourceOptimizationData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.history) {
                        this._history = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 9)
        // ============================================================

        _connectToPerformanceAnalyzer() {
            if (window.LawAIApp && window.LawAIApp.PerformanceAnalyzer) {
                console.log('[ResourceOptimization] Connected to Performance Analyzer');
            }
        }

        _connectToMetricsFramework() {
            if (window.LawAIApp && window.LawAIApp.Metrics) {
                console.log('[ResourceOptimization] Connected to Metrics Framework');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[ResourceOptimization] Connected to Historical Memory');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[ResourceOptimization] Connected to Knowledge Graph');
            }
        }

        _connectToOptimizationIntelligence() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[ResourceOptimization] Connected to Optimization Intelligence');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'resource-optimization',
                        name: 'Resource Optimization',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ResourceOptimization] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ResourceOptimization] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoAnalysis();
            this._initialized = false;
            console.log('[ResourceOptimization] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new ResourceOptimization();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ResourceOptimization = {
        Core: instance,
        RESOURCE_TYPES: RESOURCE_TYPES,
        TREND: TREND,

        // Public API
        initialize: (config) => instance.initialize(config),
        analyze: (types, options) => instance.analyze(types, options),

        getOpportunities: (filter) => instance.getOpportunities(filter),
        getOpportunity: (id) => instance.getOpportunity(id),
        getContexts: (limit) => instance.getContexts(limit),
        getResourceHistory: (type, limit) => instance.getResourceHistory(type, limit),
        getTrend: (type) => instance.getTrend(type),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[ResourceOptimization] Part 52.3 loaded ✅');
    console.log('[ResourceOptimization] Resource Types:', Object.values(RESOURCE_TYPES).join(' | '));

})();
