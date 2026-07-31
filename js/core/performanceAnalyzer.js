// ============================================================
// performanceAnalyzer.js
// Part 52.2 — Performance Optimization Analyzer
// Version: v5.2.2
// Module: Runtime Self Optimization Layer
// File: js/core/performanceAnalyzer.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PerformanceAnalyzer) {
        console.warn('[PerformanceAnalyzer] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Analysis Areas (Chapter 4)
    // ============================================================
    const ANALYSIS_AREAS = {
        BOOT: 'boot',
        PIPELINE: 'pipeline',
        MODULE: 'module',
        EVENT: 'event',
        MEMORY: 'memory',
        RESPONSE: 'response'
    };

    // ============================================================
    // Bottleneck Model (Chapter 5)
    // ============================================================
    class Bottleneck {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.metric = config.metric || 'unknown';
            this.baseline = config.baseline || 0;
            this.currentValue = config.currentValue || 0;
            this.deviation = config.deviation || 0;
            this.impact = config.impact || 'unknown';
            this.severity = config.severity || 'MEDIUM';
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `bn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getDeviationPercent() {
            if (this.baseline === 0) return 0;
            return Math.round(((this.currentValue - this.baseline) / this.baseline) * 100);
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                target: this.target,
                metric: this.metric,
                baseline: this.baseline,
                currentValue: this.currentValue,
                deviation: this.deviation,
                deviationPercent: this.getDeviationPercent(),
                impact: this.impact,
                severity: this.severity,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Optimization Insight (Chapter 8)
    // ============================================================
    class OptimizationInsight {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.issue = config.issue || '';
            this.cause = config.cause || '';
            this.impact = config.impact || '';
            this.possibleImprovement = config.possibleImprovement || '';
            this.confidence = config.confidence || 0;
            this.bottlenecks = config.bottlenecks || [];
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                issue: this.issue,
                cause: this.cause,
                impact: this.impact,
                possibleImprovement: this.possibleImprovement,
                confidence: this.confidence,
                bottlenecks: this.bottlenecks.map(b => b.toJSON ? b.toJSON() : b),
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Performance Analyzer Core (Chapter 1-3)
    // ============================================================
    class PerformanceAnalyzer {
        constructor() {
            this._bottlenecks = [];
            this._insights = [];
            this._performanceHistory = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                baselineWindow: 10,
                degradationThreshold: 20,
                minBottleneckConfidence: 50,
                maxHistorySize: 100,
                enableAutoAnalysis: true
            };
            this._analyzers = this._initAnalyzers();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[PerformanceAnalyzer] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[PerformanceAnalyzer] Initializing...');

            // Connect to modules (Chapter 9)
            this._connectToPerformanceFramework();
            this._connectToTraceFramework();
            this._connectToMetricsFramework();
            this._connectToHistoricalMemory();
            this._connectToOptimizationIntelligence();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[PerformanceAnalyzer] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Analyze (Chapter 2-3)
        // ============================================================

        analyze(areas, options) {
            console.log('[PerformanceAnalyzer] Analyzing performance...');

            const targetAreas = areas || Object.values(ANALYSIS_AREAS);
            const allBottlenecks = [];
            const allInsights = [];

            targetAreas.forEach(area => {
                const analyzer = this._analyzers[area];
                if (!analyzer) {
                    console.warn(`[PerformanceAnalyzer] No analyzer for: ${area}`);
                    return;
                }

                try {
                    const result = analyzer.analyze(options);
                    if (result) {
                        if (result.bottlenecks) {
                            const bottlenecks = result.bottlenecks.map(b => 
                                new Bottleneck(Object.assign(b, { evidence: result.evidence || [] }))
                            );
                            allBottlenecks.push(...bottlenecks);
                        }
                        if (result.insights) {
                            allInsights.push(...result.insights);
                        }
                    }
                } catch (e) {
                    console.error(`[PerformanceAnalyzer] Analyzer error (${area}):`, e);
                }
            });

            // Store bottlenecks
            this._bottlenecks.push(...allBottlenecks);
            if (this._bottlenecks.length > this._config.maxHistorySize) {
                this._bottlenecks = this._bottlenecks.slice(-this._config.maxHistorySize);
            }

            // Generate insights from bottlenecks
            const insights = this._generateInsights(allBottlenecks, allInsights);
            this._insights.push(...insights);
            if (this._insights.length > this._config.maxHistorySize) {
                this._insights = this._insights.slice(-this._config.maxHistorySize);
            }

            // Update performance history
            this._updateHistory(allBottlenecks);

            this._emit('analysisComplete', {
                bottlenecks: allBottlenecks.map(b => b.toJSON()),
                insights: insights.map(i => i.toJSON()),
                timestamp: Date.now()
            });

            return {
                bottlenecks: allBottlenecks,
                insights: insights
            };
        }

        // ============================================================
        // Analyzers (Chapter 4)
        // ============================================================

        _initAnalyzers() {
            return {
                [ANALYSIS_AREAS.BOOT]: {
                    name: 'boot_analyzer',
                    analyze: (options) => this._analyzeBootPerformance(options)
                },
                [ANALYSIS_AREAS.PIPELINE]: {
                    name: 'pipeline_analyzer',
                    analyze: (options) => this._analyzePipelinePerformance(options)
                },
                [ANALYSIS_AREAS.MODULE]: {
                    name: 'module_analyzer',
                    analyze: (options) => this._analyzeModulePerformance(options)
                },
                [ANALYSIS_AREAS.EVENT]: {
                    name: 'event_analyzer',
                    analyze: (options) => this._analyzeEventPerformance(options)
                },
                [ANALYSIS_AREAS.MEMORY]: {
                    name: 'memory_analyzer',
                    analyze: (options) => this._analyzeMemoryPerformance(options)
                },
                [ANALYSIS_AREAS.RESPONSE]: {
                    name: 'response_analyzer',
                    analyze: (options) => this._analyzeResponsePerformance(options)
                }
            };
        }

        // ============================================================
        // Analyzer: Boot Performance (Chapter 4)
        // ============================================================

        _analyzeBootPerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            // Get boot data
            const bootData = this._getBootData();

            if (bootData) {
                evidence.push(`Boot duration: ${bootData.duration}ms`);
                evidence.push(`Boot status: ${bootData.status}`);

                // Check boot duration
                const baseline = this._getBaseline('boot_duration', 2000);
                if (bootData.duration > baseline * 1.2) {
                    const deviation = bootData.duration - baseline;
                    bottlenecks.push({
                        target: 'Boot',
                        metric: 'boot_duration',
                        baseline: baseline,
                        currentValue: bootData.duration,
                        deviation: deviation,
                        impact: `Boot time ${Math.round((deviation/baseline)*100)}% above baseline`,
                        severity: bootData.duration > baseline * 1.5 ? 'HIGH' : 'MEDIUM'
                    });

                    insights.push({
                        issue: 'Slow boot performance detected',
                        cause: 'Possible module loading delays or initialization bottlenecks',
                        impact: 'Increased startup time affects availability',
                        possibleImprovement: 'Optimize module loading, lazy initialization, or parallel loading',
                        confidence: 70
                    });
                }

                // Check boot stages
                if (bootData.stages) {
                    const slowStages = bootData.stages.filter(s => s.duration > 500);
                    slowStages.forEach(stage => {
                        bottlenecks.push({
                            target: `Boot Stage: ${stage.name}`,
                            metric: 'stage_duration',
                            baseline: 300,
                            currentValue: stage.duration,
                            deviation: stage.duration - 300,
                            impact: `Stage ${stage.name} took ${stage.duration}ms`,
                            severity: stage.duration > 1000 ? 'HIGH' : 'MEDIUM'
                        });
                    });

                    if (slowStages.length > 0) {
                        insights.push({
                            issue: `Slow boot stage(s): ${slowStages.map(s => s.name).join(', ')}`,
                            cause: 'Possible sequential loading or heavy initialization',
                            impact: 'Extended boot time',
                            possibleImprovement: 'Parallelize or defer non-critical stages',
                            confidence: 75
                        });
                    }
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Analyzer: Pipeline Performance (Chapter 4)
        // ============================================================

        _analyzePipelinePerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            // Get pipeline data
            const pipelineData = this._getPipelineData();

            if (pipelineData) {
                evidence.push(`Pipeline duration: ${pipelineData.duration}ms`);
                evidence.push(`Pipeline stages: ${pipelineData.stageCount || 0}`);

                // Check total pipeline duration
                const baseline = this._getBaseline('pipeline_duration', 5000);
                if (pipelineData.duration > baseline * 1.2) {
                    bottlenecks.push({
                        target: 'Pipeline',
                        metric: 'pipeline_duration',
                        baseline: baseline,
                        currentValue: pipelineData.duration,
                        deviation: pipelineData.duration - baseline,
                        impact: `Pipeline execution ${Math.round(((pipelineData.duration-baseline)/baseline)*100)}% above baseline`,
                        severity: pipelineData.duration > baseline * 1.5 ? 'HIGH' : 'MEDIUM'
                    });
                }

                // Check individual stages
                if (pipelineData.stages) {
                    const slowStages = pipelineData.stages.filter(s => s.duration > 1000);
                    slowStages.forEach(stage => {
                        bottlenecks.push({
                            target: `Pipeline Stage: ${stage.name}`,
                            metric: 'stage_duration',
                            baseline: 500,
                            currentValue: stage.duration,
                            deviation: stage.duration - 500,
                            impact: `Stage ${stage.name} took ${stage.duration}ms`,
                            severity: stage.duration > 2000 ? 'HIGH' : 'MEDIUM'
                        });
                    });
                }

                if (pipelineData.duration > baseline * 1.2) {
                    insights.push({
                        issue: 'Pipeline performance degradation',
                        cause: 'Slow stages or bottlenecks in pipeline flow',
                        impact: 'Increased processing time for operations',
                        possibleImprovement: 'Optimize slow stages, parallelize where possible',
                        confidence: 68
                    });
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Analyzer: Module Performance (Chapter 4)
        // ============================================================

        _analyzeModulePerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            const moduleData = this._getModuleData();

            if (moduleData && moduleData.modules) {
                moduleData.modules.forEach(mod => {
                    if (mod.loadTime && mod.loadTime > 500) {
                        bottlenecks.push({
                            target: `Module: ${mod.name}`,
                            metric: 'module_load_time',
                            baseline: 300,
                            currentValue: mod.loadTime,
                            deviation: mod.loadTime - 300,
                            impact: `Module ${mod.name} loading slowly`,
                            severity: mod.loadTime > 1000 ? 'HIGH' : 'MEDIUM'
                        });
                    }
                });

                if (bottlenecks.length > 0) {
                    insights.push({
                        issue: `${bottlenecks.length} module(s) loading slowly`,
                        cause: 'Large module size or heavy initialization',
                        impact: 'Extended startup and slower operation',
                        possibleImprovement: 'Code splitting, lazy loading, or optimization',
                        confidence: 65
                    });
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Analyzer: Event Performance (Chapter 4)
        // ============================================================

        _analyzeEventPerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            const eventData = this._getEventData();

            if (eventData) {
                evidence.push(`Event count: ${eventData.count || 0}`);
                evidence.push(`Event latency: ${eventData.latency || 0}ms`);

                if (eventData.latency && eventData.latency > 100) {
                    bottlenecks.push({
                        target: 'Event Processing',
                        metric: 'event_latency',
                        baseline: 50,
                        currentValue: eventData.latency,
                        deviation: eventData.latency - 50,
                        impact: `Event processing latency increased to ${eventData.latency}ms`,
                        severity: eventData.latency > 200 ? 'HIGH' : 'MEDIUM'
                    });

                    insights.push({
                        issue: 'Event processing latency detected',
                        cause: 'Possible event queue backlog or heavy handlers',
                        impact: 'Delayed event processing affects responsiveness',
                        possibleImprovement: 'Optimize event handlers or increase concurrency',
                        confidence: 70
                    });
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Analyzer: Memory Performance (Chapter 4)
        // ============================================================

        _analyzeMemoryPerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            const memoryData = this._getMemoryData();

            if (memoryData) {
                evidence.push(`Memory usage: ${memoryData.usage}%`);
                evidence.push(`Memory trend: ${memoryData.trend || 'stable'}`);

                if (memoryData.usage && memoryData.usage > 80) {
                    bottlenecks.push({
                        target: 'Memory',
                        metric: 'memory_usage',
                        baseline: 60,
                        currentValue: memoryData.usage,
                        deviation: memoryData.usage - 60,
                        impact: `Memory usage at ${memoryData.usage}%`,
                        severity: memoryData.usage > 90 ? 'HIGH' : 'MEDIUM'
                    });

                    insights.push({
                        issue: 'High memory usage detected',
                        cause: 'Possible memory leak or inefficient allocation',
                        impact: 'Risk of OOM and performance degradation',
                        possibleImprovement: 'Implement memory cleanup, review allocation patterns',
                        confidence: 75
                    });
                }

                if (memoryData.trend === 'increasing') {
                    insights.push({
                        issue: 'Memory usage trending upward',
                        cause: 'Possible memory accumulation over time',
                        impact: 'Eventual OOM if trend continues',
                        possibleImprovement: 'Investigate and fix memory leaks',
                        confidence: 70
                    });
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Analyzer: Response Performance (Chapter 4)
        // ============================================================

        _analyzeResponsePerformance(options) {
            const bottlenecks = [];
            const insights = [];
            const evidence = [];

            const responseData = this._getResponseData();

            if (responseData) {
                evidence.push(`Response time: ${responseData.time}ms`);
                evidence.push(`Response rate: ${responseData.rate || 'unknown'}`);

                const baseline = this._getBaseline('response_time', 500);
                if (responseData.time && responseData.time > baseline * 1.2) {
                    bottlenecks.push({
                        target: 'Runtime Response',
                        metric: 'response_time',
                        baseline: baseline,
                        currentValue: responseData.time,
                        deviation: responseData.time - baseline,
                        impact: `Response time increased to ${responseData.time}ms`,
                        severity: responseData.time > baseline * 1.5 ? 'HIGH' : 'MEDIUM'
                    });

                    insights.push({
                        issue: 'Slow runtime response detected',
                        cause: 'Possible bottleneck in request handling',
                        impact: 'User experience and system responsiveness affected',
                        possibleImprovement: 'Optimize request handling, add caching',
                        confidence: 68
                    });
                }
            }

            return { bottlenecks, insights, evidence };
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getBootData() {
            try {
                if (window.LawAIApp && window.LawAIApp.BootManager) {
                    const status = window.LawAIApp.BootManager.getStatus ?
                        window.LawAIApp.BootManager.getStatus() : null;
                    if (status) {
                        return {
                            duration: status.bootDuration || 0,
                            status: status.status || 'unknown',
                            stages: status.stages || []
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getPipelineData() {
            try {
                if (window.LawAIApp && window.LawAIApp.BootPipeline) {
                    const info = window.LawAIApp.BootPipeline.getInfo ?
                        window.LawAIApp.BootPipeline.getInfo() : null;
                    if (info) {
                        return {
                            duration: info.duration || 0,
                            stageCount: info.stageCount || 0,
                            stages: info.stages || []
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
                            loadTime: m.loadTime || 0
                        }));
                        return { modules: moduleList };
                    }
                }
            } catch (e) { /* ignore */ }
            return { modules: [] };
        }

        _getEventData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Events) {
                    const stats = window.LawAIApp.Events.getStatistics ?
                        window.LawAIApp.Events.getStatistics() : null;
                    if (stats) {
                        return {
                            count: stats.total || 0,
                            latency: stats.averageLatency || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getMemoryData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        return {
                            usage: report.memory || 0,
                            trend: report.memoryTrend || 'stable'
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getResponseData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        return {
                            time: report.responseTime || 0,
                            rate: report.throughput || 'unknown'
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        // ============================================================
        // Performance Comparison (Chapter 6)
        // ============================================================

        _getBaseline(metric, defaultValue) {
            const history = this._performanceHistory.filter(h => h.metric === metric);
            if (history.length === 0) return defaultValue;

            const values = history.slice(-this._config.baselineWindow).map(h => h.value);
            if (values.length === 0) return defaultValue;

            return values.reduce((a, b) => a + b, 0) / values.length;
        }

        _updateHistory(bottlenecks) {
            bottlenecks.forEach(b => {
                this._performanceHistory.push({
                    metric: b.metric,
                    value: b.currentValue,
                    timestamp: Date.now()
                });
            });

            if (this._performanceHistory.length > this._config.maxHistorySize * 2) {
                this._performanceHistory = this._performanceHistory.slice(-this._config.maxHistorySize);
            }
        }

        // ============================================================
        // Insight Generation
        // ============================================================

        _generateInsights(bottlenecks, existingInsights) {
            const insights = [];

            // Group bottlenecks by severity
            const highSeverity = bottlenecks.filter(b => b.severity === 'HIGH');
            const mediumSeverity = bottlenecks.filter(b => b.severity === 'MEDIUM');

            if (highSeverity.length > 0) {
                insights.push(new OptimizationInsight({
                    issue: `${highSeverity.length} high severity performance bottlenecks detected`,
                    cause: 'Critical performance issues require immediate attention',
                    impact: 'Significant performance degradation affecting system operations',
                    possibleImprovement: 'Address critical bottlenecks identified in analysis',
                    confidence: 85,
                    bottlenecks: highSeverity
                }));
            }

            if (mediumSeverity.length > 0) {
                insights.push(new OptimizationInsight({
                    issue: `${mediumSeverity.length} medium severity bottlenecks found`,
                    cause: 'Performance degradation detected in key areas',
                    impact: 'Moderate performance impact on system operations',
                    possibleImprovement: 'Review and optimize identified bottlenecks',
                    confidence: 70,
                    bottlenecks: mediumSeverity
                }));
            }

            // Add any analyzer-specific insights
            existingInsights.forEach(ei => {
                insights.push(new OptimizationInsight(ei));
            });

            return insights;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getBottlenecks(filter) {
            let bottlenecks = this._bottlenecks;
            if (filter) {
                if (filter.severity) {
                    bottlenecks = bottlenecks.filter(b => b.severity === filter.severity);
                }
                if (filter.target) {
                    bottlenecks = bottlenecks.filter(b => b.target === filter.target);
                }
                if (filter.limit) {
                    bottlenecks = bottlenecks.slice(-filter.limit);
                }
            }
            return bottlenecks.map(b => b.toJSON());
        }

        getInsights(limit = 10) {
            return this._insights.slice(-limit).reverse().map(i => i.toJSON());
        }

        getPerformanceHistory(metric, limit = 20) {
            const history = this._performanceHistory.filter(h => h.metric === metric);
            return history.slice(-limit);
        }

        getStats() {
            const totalBottlenecks = this._bottlenecks.length;
            const high = this._bottlenecks.filter(b => b.severity === 'HIGH').length;
            const medium = this._bottlenecks.filter(b => b.severity === 'MEDIUM').length;

            const byArea = {};
            Object.values(ANALYSIS_AREAS).forEach(area => {
                byArea[area] = this._bottlenecks.filter(b => b.target.toLowerCase().includes(area)).length;
            });

            return {
                totalBottlenecks,
                high,
                medium,
                byArea,
                insights: this._insights.length,
                historySize: this._performanceHistory.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recentBottlenecks = this.getBottlenecks({ limit: 5 });
            const recentInsights = this.getInsights(3);

            return {
                type: 'performance_analyzer',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentBottlenecks: recentBottlenecks,
                recentInsights: recentInsights,
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
                        console.error('[PerformanceAnalyzer] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`perfanalyzer.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('performanceAnalyzerData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.history) {
                        this._performanceHistory = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 9)
        // ============================================================

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[PerformanceAnalyzer] Connected to Performance Framework');
            }
        }

        _connectToTraceFramework() {
            if (window.LawAIApp && window.LawAIApp.Trace) {
                console.log('[PerformanceAnalyzer] Connected to Trace Framework');
            }
        }

        _connectToMetricsFramework() {
            if (window.LawAIApp && window.LawAIApp.Metrics) {
                console.log('[PerformanceAnalyzer] Connected to Metrics Framework');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[PerformanceAnalyzer] Connected to Historical Memory');
            }
        }

        _connectToOptimizationIntelligence() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[PerformanceAnalyzer] Connected to Optimization Intelligence');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'performance-analyzer',
                        name: 'Performance Analyzer',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[PerformanceAnalyzer] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[PerformanceAnalyzer] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[PerformanceAnalyzer] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new PerformanceAnalyzer();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.PerformanceAnalyzer = {
        Core: instance,
        ANALYSIS_AREAS: ANALYSIS_AREAS,

        // Public API
        initialize: (config) => instance.initialize(config),
        analyze: (areas, options) => instance.analyze(areas, options),

        getBottlenecks: (filter) => instance.getBottlenecks(filter),
        getInsights: (limit) => instance.getInsights(limit),
        getPerformanceHistory: (metric, limit) => instance.getPerformanceHistory(metric, limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[PerformanceAnalyzer] Part 52.2 loaded ✅');
    console.log('[PerformanceAnalyzer] Analysis Areas:', Object.values(ANALYSIS_AREAS).join(' | '));

})();
