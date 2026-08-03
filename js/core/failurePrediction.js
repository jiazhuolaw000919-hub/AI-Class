// ============================================================
// failurePrediction.js
// Part 53.4 — Failure Prediction Model
// Version: v5.3.4
// Module: Predictive Runtime Layer
// File: js/core/failurePrediction.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.FailurePrediction) {
        console.warn('[FailurePrediction] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Failure Categories (Chapter 5)
    // ============================================================
    const FAILURE_CATEGORY = {
        BOOT: 'boot',
        PIPELINE: 'pipeline',
        PERFORMANCE_COLLAPSE: 'performance_collapse',
        RESOURCE_EXHAUSTION: 'resource_exhaustion',
        MODULE: 'module',
        DEPENDENCY: 'dependency',
        DATA_CORRUPTION: 'data_corruption',
        GOVERNANCE: 'governance',
        RUNTIME_INSTABILITY: 'runtime_instability',
        PREDICTION: 'prediction'
    };

    // ============================================================
    // Recovery Levels (Chapter 8)
    // ============================================================
    const RECOVERY_LEVEL = {
        EASY: { label: 'EASY', score: 25, color: '#22c55e', time: 'minutes' },
        MODERATE: { label: 'MODERATE', score: 50, color: '#eab308', time: 'hours' },
        DIFFICULT: { label: 'DIFFICULT', score: 75, color: '#f97316', time: 'days' },
        CRITICAL: { label: 'CRITICAL', score: 95, color: '#ef4444', time: 'weeks' }
    };

    // ============================================================
    // Failure Status
    // ============================================================
    const FAILURE_STATUS = {
        PREDICTED: 'PREDICTED',
        IMMINENT: 'IMMINENT',
        OCCURRED: 'OCCURRED',
        MITIGATED: 'MITIGATED',
        DISMISSED: 'DISMISSED'
    };

    // ============================================================
    // Failure Timeline (Chapter 10)
    // ============================================================
    const FAILURE_TIMELINE = {
        IMMEDIATE: 'immediate',
        CURRENT_SESSION: 'current_session',
        NEXT_SESSION: 'next_session',
        WITHIN_24H: 'within_24h',
        NEXT_RELEASE: 'next_release',
        LONG_TERM: 'long_term'
    };

    // ============================================================
    // Failure Model (Chapter 6)
    // ============================================================
    class Failure {
        constructor(config) {
            this.failureId = config.failureId || this._generateId();
            this.timestamp = Date.now();
            this.category = config.category || FAILURE_CATEGORY.RUNTIME_INSTABILITY;
            this.target = config.target || 'unknown';
            this.probability = config.probability || 0;
            this.expectedTime = config.expectedTime || FAILURE_TIMELINE.CURRENT_SESSION;
            this.severity = config.severity || 50;
            this.impact = config.impact || 50;
            this.recoverability = config.recoverability || RECOVERY_LEVEL.MODERATE;
            this.confidence = config.confidence || 0;
            this.status = FAILURE_STATUS.PREDICTED;
            this.propagation = config.propagation || null;
            this.evidence = config.evidence || [];
            this.preventionStrategy = config.preventionStrategy || null;
            this.metadata = config.metadata || {};
            this.affectedModules = config.affectedModules || [];
        }

        _generateId() {
            return `fail_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getSeverityLevel() {
            const score = (this.probability * 0.4 + this.severity * 0.4 + this.impact * 0.2);
            if (score >= 80) return 'CRITICAL';
            if (score >= 60) return 'HIGH';
            if (score >= 40) return 'MEDIUM';
            return 'LOW';
        }

        getRecoveryLabel() {
            return this.recoverability.label || 'MODERATE';
        }

        toJSON() {
            return {
                failureId: this.failureId,
                timestamp: this.timestamp,
                category: this.category,
                target: this.target,
                probability: this.probability,
                expectedTime: this.expectedTime,
                severity: this.severity,
                impact: this.impact,
                severityLevel: this.getSeverityLevel(),
                recoverability: this.recoverability,
                recoveryLabel: this.getRecoveryLabel(),
                confidence: this.confidence,
                status: this.status,
                propagation: this.propagation,
                evidence: this.evidence,
                preventionStrategy: this.preventionStrategy,
                affectedModules: this.affectedModules,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Failure Propagation Chain (Chapter 9)
    // ============================================================
    class PropagationChain {
        constructor(config) {
            this.chainId = config.chainId || this._generateId();
            this.timestamp = Date.now();
            this.rootFailure = config.rootFailure || null;
            this.affectedModules = config.affectedModules || [];
            this.dependentModules = config.dependentModules || [];
            this.systemImpact = config.systemImpact || 'unknown';
            this.globalHealth = config.globalHealth || 100;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                chainId: this.chainId,
                timestamp: this.timestamp,
                rootFailure: this.rootFailure,
                affectedModules: this.affectedModules,
                dependentModules: this.dependentModules,
                systemImpact: this.systemImpact,
                globalHealth: this.globalHealth,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Failure Prediction Engine Core (Chapter 1-4)
    // ============================================================
    class FailurePrediction {
        constructor() {
            this._failures = [];
            this._propagations = [];
            this._patternLibrary = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minPatternMatches: 2,
                confidenceThreshold: 50,
                probabilityThreshold: 30,
                enableAutoPrediction: true,
                predictionInterval: 180000,
                failureRetentionDays: 30
            };
            this._detectors = this._initDetectors();
            this._patternMatcher = this._initPatternMatcher();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[FailurePrediction] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[FailurePrediction] Initializing...');

            // Connect to modules (Chapter 12)
            this._connectToRiskForecast();
            this._connectToTrendPrediction();
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToGovernance();
            this._connectToKnowledgeGraph();
            this._connectToRuntimeRegistry();

            // Register with Explorer (Chapter 13)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-prediction
            if (this._config.enableAutoPrediction) {
                this._startAutoPrediction();
            }

            this._initialized = true;
            console.log('[FailurePrediction] Initialized ✅');
            return this;
        }

        // ============================================================
        // Detectors (Chapter 5)
        // ============================================================

        _initDetectors() {
            return {
                [FAILURE_CATEGORY.BOOT]: {
                    name: 'boot_failure_detector',
                    detect: (options) => this._detectBootFailure(options)
                },
                [FAILURE_CATEGORY.PIPELINE]: {
                    name: 'pipeline_failure_detector',
                    detect: (options) => this._detectPipelineFailure(options)
                },
                [FAILURE_CATEGORY.PERFORMANCE_COLLAPSE]: {
                    name: 'performance_collapse_detector',
                    detect: (options) => this._detectPerformanceCollapse(options)
                },
                [FAILURE_CATEGORY.RESOURCE_EXHAUSTION]: {
                    name: 'resource_exhaustion_detector',
                    detect: (options) => this._detectResourceExhaustion(options)
                },
                [FAILURE_CATEGORY.MODULE]: {
                    name: 'module_failure_detector',
                    detect: (options) => this._detectModuleFailure(options)
                },
                [FAILURE_CATEGORY.DEPENDENCY]: {
                    name: 'dependency_failure_detector',
                    detect: (options) => this._detectDependencyFailure(options)
                },
                [FAILURE_CATEGORY.DATA_CORRUPTION]: {
                    name: 'data_corruption_detector',
                    detect: (options) => this._detectDataCorruption(options)
                },
                [FAILURE_CATEGORY.GOVERNANCE]: {
                    name: 'governance_failure_detector',
                    detect: (options) => this._detectGovernanceFailure(options)
                },
                [FAILURE_CATEGORY.RUNTIME_INSTABILITY]: {
                    name: 'runtime_instability_detector',
                    detect: (options) => this._detectRuntimeInstability(options)
                },
                [FAILURE_CATEGORY.PREDICTION]: {
                    name: 'prediction_failure_detector',
                    detect: (options) => this._detectPredictionFailure(options)
                }
            };
        }

        // ============================================================
        // Pattern Library (Chapter 4)
        // ============================================================

        _initPatternMatcher() {
            return {
                match: (failure, patterns) => {
                    let bestMatch = null;
                    let bestScore = 0;

                    patterns.forEach(pattern => {
                        const score = this._calculatePatternSimilarity(failure, pattern);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = pattern;
                        }
                    });

                    return {
                        match: bestMatch,
                        score: bestScore,
                        matched: bestScore > 0.6
                    };
                }
            };
        }

        _calculatePatternSimilarity(failure, pattern) {
            let score = 0;
            let factors = 0;

            // Category match
            if (failure.category === pattern.category) {
                score += 30;
                factors += 1;
            }

            // Target similarity
            if (failure.target && pattern.target && failure.target.includes(pattern.target)) {
                score += 20;
                factors += 1;
            }

            // Evidence overlap
            if (failure.evidence && pattern.evidence) {
                const overlap = failure.evidence.filter(e => 
                    pattern.evidence.some(pe => pe.includes(e) || e.includes(pe))
                ).length;
                if (overlap > 0) {
                    score += Math.min(overlap * 10, 30);
                    factors += 1;
                }
            }

            // Severity similarity
            if (Math.abs(failure.severity - pattern.severity) < 20) {
                score += 20;
                factors += 1;
            }

            return factors > 0 ? score / (factors * 10) : 0;
        }

        // ============================================================
        // Core: Predict (Chapter 3-4)
        // ============================================================

        predict(categories, options) {
            console.log('[FailurePrediction] Starting failure prediction...');

            const targetCategories = categories || Object.values(FAILURE_CATEGORY);
            const failures = [];

            targetCategories.forEach(category => {
                const detector = this._detectors[category];
                if (!detector) {
                    console.warn(`[FailurePrediction] No detector for: ${category}`);
                    return;
                }

                try {
                    const result = detector.detect(options);
                    if (result && result.failures) {
                        result.failures.forEach(failureData => {
                            // Check pattern library (Chapter 4)
                            const patternMatch = this._patternMatcher.match(
                                failureData,
                                this._patternLibrary
                            );

                            // Calculate probability (Chapter 7)
                            const probability = this._calculateProbability(
                                failureData,
                                patternMatch
                            );

                            if (probability >= this._config.probabilityThreshold) {
                                // Assess recoverability (Chapter 8)
                                const recoverability = this._assessRecoverability(
                                    failureData,
                                    patternMatch
                                );

                                // Calculate confidence
                                const confidence = this._calculateConfidence(
                                    failureData,
                                    patternMatch,
                                    probability
                                );

                                // Build propagation chain (Chapter 9)
                                const propagation = this._buildPropagation(
                                    failureData,
                                    options
                                );

                                const failure = new Failure({
                                    category: category,
                                    target: failureData.target || category,
                                    probability: Math.round(probability),
                                    expectedTime: failureData.expectedTime || FAILURE_TIMELINE.CURRENT_SESSION,
                                    severity: failureData.severity || 50,
                                    impact: failureData.impact || 50,
                                    recoverability: recoverability,
                                    confidence: Math.round(confidence),
                                    propagation: propagation ? propagation.toJSON() : null,
                                    evidence: failureData.evidence || [],
                                    preventionStrategy: failureData.preventionStrategy || null,
                                    affectedModules: failureData.affectedModules || [],
                                    metadata: {
                                        detector: detector.name,
                                        patternMatch: patternMatch.matched ? patternMatch.score : null,
                                        source: failureData.source || 'runtime'
                                    }
                                });

                                failures.push(failure);
                                this._failures.push(failure);

                                // Update pattern library
                                if (failure.confidence > 70) {
                                    this._updatePatternLibrary(failure);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error(`[FailurePrediction] Detector error (${category}):`, e);
                }
            });

            // Enforce history limit
            if (this._failures.length > this._config.maxHistorySize) {
                this._failures = this._failures.slice(-this._config.maxHistorySize);
            }

            this._emit('predictionComplete', {
                failures: failures.map(f => f.toJSON()),
                count: failures.length,
                timestamp: Date.now()
            });

            return failures;
        }

        // ============================================================
        // Failure Detectors (Chapter 5)
        // ============================================================

        _detectBootFailure(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.BootManager) {
                    const status = window.LawAIApp.BootManager.getStatus ?
                        window.LawAIApp.BootManager.getStatus() : null;
                    if (status) {
                        evidence.push(`Boot status: ${status.status}`);
                        evidence.push(`Boot duration: ${status.bootDuration || 0}ms`);

                        if (status.bootDuration && status.bootDuration > 3000) {
                            failures.push({
                                target: 'boot_timeout',
                                probability: 60 + (status.bootDuration - 3000) / 50,
                                severity: 70,
                                impact: 80,
                                expectedTime: FAILURE_TIMELINE.NEXT_SESSION,
                                evidence: [`Boot duration: ${status.bootDuration}ms`],
                                preventionStrategy: 'Optimize boot process, lazy load modules',
                                source: 'boot_metrics'
                            });
                        }

                        if (status.status === 'degraded' || status.status === 'failed') {
                            failures.push({
                                target: 'boot_failure',
                                probability: 80,
                                severity: 90,
                                impact: 95,
                                expectedTime: FAILURE_TIMELINE.IMMEDIATE,
                                evidence: ['Boot status: degraded/failed'],
                                preventionStrategy: 'Investigate boot failure immediately',
                                source: 'boot_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectPipelineFailure(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.BootPipeline) {
                    const info = window.LawAIApp.BootPipeline.getInfo ?
                        window.LawAIApp.BootPipeline.getInfo() : null;
                    if (info) {
                        evidence.push(`Pipeline stages: ${info.stageCount || 0}`);
                        evidence.push(`Pipeline duration: ${info.duration || 0}ms`);

                        const failedStages = info.stages?.filter(s => s.status === 'failed') || [];
                        if (failedStages.length > 0) {
                            failures.push({
                                target: 'pipeline_stage_failure',
                                probability: 75,
                                severity: 80,
                                impact: 85,
                                expectedTime: FAILURE_TIMELINE.CURRENT_SESSION,
                                evidence: [`${failedStages.length} pipeline stages failed`],
                                preventionStrategy: 'Review failed stages, implement retry logic',
                                affectedModules: failedStages.map(s => s.name),
                                source: 'pipeline_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectPerformanceCollapse(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        evidence.push(`CPU: ${report.cpu || 0}%`);
                        evidence.push(`Memory: ${report.memory || 0}%`);
                        evidence.push(`Response time: ${report.responseTime || 0}ms`);

                        if (report.cpu && report.cpu > 90) {
                            failures.push({
                                target: 'cpu_collapse',
                                probability: 70 + (report.cpu - 90) * 2,
                                severity: 85,
                                impact: 80,
                                expectedTime: FAILURE_TIMELINE.WITHIN_24H,
                                evidence: [`CPU at ${report.cpu}%`],
                                preventionStrategy: 'Scale compute resources, optimize code',
                                source: 'performance_metrics'
                            });
                        }

                        if (report.memory && report.memory > 90) {
                            failures.push({
                                target: 'memory_collapse',
                                probability: 65 + (report.memory - 90) * 1.5,
                                severity: 85,
                                impact: 85,
                                expectedTime: FAILURE_TIMELINE.CURRENT_SESSION,
                                evidence: [`Memory at ${report.memory}%`],
                                preventionStrategy: 'Memory cleanup, increase capacity',
                                source: 'performance_metrics'
                            });
                        }

                        if (report.responseTime && report.responseTime > 2000) {
                            failures.push({
                                target: 'response_timeout',
                                probability: 60 + (report.responseTime - 2000) / 50,
                                severity: 70,
                                impact: 75,
                                expectedTime: FAILURE_TIMELINE.CURRENT_SESSION,
                                evidence: [`Response time: ${report.responseTime}ms`],
                                preventionStrategy: 'Optimize critical paths, add caching',
                                source: 'performance_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectResourceExhaustion(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
                    const stats = window.LawAIApp.ResourceOptimization.getStats ?
                        window.LawAIApp.ResourceOptimization.getStats() : null;
                    if (stats) {
                        const usage = stats.avgUsage || 0;
                        evidence.push(`Resource usage: ${usage}%`);

                        if (usage > 85) {
                            failures.push({
                                target: 'resource_exhaustion',
                                probability: 55 + (usage - 85) * 2,
                                severity: 80,
                                impact: 90,
                                expectedTime: FAILURE_TIMELINE.WITHIN_24H,
                                evidence: [`Resource usage at ${usage}%`],
                                preventionStrategy: 'Increase capacity, optimize usage',
                                source: 'resource_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectModuleFailure(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        const modules = Object.values(registry);
                        const unhealthy = modules.filter(m => m.health && m.health < 50);

                        if (unhealthy.length > 0) {
                            failures.push({
                                target: 'module_health_failure',
                                probability: 50 + unhealthy.length * 10,
                                severity: 70,
                                impact: 65,
                                expectedTime: FAILURE_TIMELINE.NEXT_SESSION,
                                evidence: [`${unhealthy.length} unhealthy modules`],
                                preventionStrategy: 'Review and fix module health issues',
                                affectedModules: unhealthy.map(m => m.name || m.id),
                                source: 'module_health'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectDependencyFailure(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const insights = window.LawAIApp.ArchitectureAdvisor.getInsights ?
                        window.LawAIApp.ArchitectureAdvisor.getInsights({ limit: 10 }) : null;
                    if (insights) {
                        const circular = insights.filter(i => i.area === 'circular');
                        if (circular.length > 0) {
                            failures.push({
                                target: 'dependency_failure',
                                probability: 60 + circular.length * 10,
                                severity: 75,
                                impact: 70,
                                expectedTime: FAILURE_TIMELINE.NEXT_RELEASE,
                                evidence: [`${circular.length} circular dependencies`],
                                preventionStrategy: 'Refactor to remove circular dependencies',
                                affectedModules: circular.flatMap(i => i.affectedModules || []),
                                source: 'dependency_analysis'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectDataCorruption(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.StateRegistry) {
                    const states = window.LawAIApp.StateRegistry.getAll ?
                        window.LawAIApp.StateRegistry.getAll() : null;
                    if (states) {
                        const corrupted = Object.values(states).filter(s => s.corrupted);
                        if (corrupted.length > 0) {
                            failures.push({
                                target: 'data_corruption',
                                probability: 40 + corrupted.length * 15,
                                severity: 85,
                                impact: 90,
                                expectedTime: FAILURE_TIMELINE.CURRENT_SESSION,
                                evidence: [`${corrupted.length} corrupted states`],
                                preventionStrategy: 'Restore from backup, fix corruption',
                                source: 'data_integrity'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectGovernanceFailure(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Governance) {
                    const status = window.LawAIApp.Governance.getStatus ?
                        window.LawAIApp.Governance.getStatus() : null;
                    if (status) {
                        const violations = status.violations || 0;
                        if (violations > 3) {
                            failures.push({
                                target: 'governance_failure',
                                probability: 40 + violations * 10,
                                severity: 70,
                                impact: 75,
                                expectedTime: FAILURE_TIMELINE.NEXT_SESSION,
                                evidence: [`${violations} governance violations`],
                                preventionStrategy: 'Review and fix governance violations',
                                source: 'governance_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectRuntimeInstability(options) {
            const failures = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const status = window.LawAIApp.Runtime.getStatus ?
                        window.LawAIApp.Runtime.getStatus() : null;
                    if (status) {
                        const errorRate = status.errorRate || 0;
                        const uptime = status.uptime || 100;

                        evidence.push(`Error rate: ${errorRate}%`);
                        evidence.push(`Uptime: ${uptime}%`);

                        if (errorRate > 10) {
                            failures.push({
                                target: 'runtime_instability',
                                probability: 50 + errorRate * 2,
                                severity: 80,
                                impact: 85,
                                expectedTime: FAILURE_TIMELINE.IMMEDIATE,
                                evidence: [`Error rate: ${errorRate}%`],
                                preventionStrategy: 'Investigate and fix error patterns',
                                source: 'runtime_metrics'
                            });
                        }

                        if (uptime < 95) {
                            failures.push({
                                target: 'runtime_uptime_failure',
                                probability: 60 + (95 - uptime) * 2,
                                severity: 85,
                                impact: 90,
                                expectedTime: FAILURE_TIMELINE.CURRENT_SESSION,
                                evidence: [`Uptime: ${uptime}%`],
                                preventionStrategy: 'Improve reliability, add redundancy',
                                source: 'runtime_metrics'
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { failures, evidence };
        }

        _detectPredictionFailure(options) {
            const failures = [];
            const evidence = [];

            // Monitor prediction accuracy
            const recentFailures = this._failures.slice(-20);
            const inaccurate = recentFailures.filter(f => 
                f.status === FAILURE_STATUS.OCCURRED && f.confidence < 50
            );

            if (inaccurate.length > 3) {
                failures.push({
                    target: 'prediction_accuracy',
                    probability: 30 + inaccurate.length * 10,
                    severity: 60,
                    impact: 50,
                    expectedTime: FAILURE_TIMELINE.NEXT_RELEASE,
                    evidence: [`${inaccurate.length} inaccurate predictions`],
                    preventionStrategy: 'Improve prediction models, gather more data',
                    source: 'prediction_metrics'
                });
            }

            return { failures, evidence };
        }

        // ============================================================
        // Probability Calculation (Chapter 7)
        // ============================================================

        _calculateProbability(failureData, patternMatch) {
            let probability = failureData.probability || 30;

            // Adjust based on pattern match
            if (patternMatch.matched) {
                probability += patternMatch.score * 20;
            }

            // Adjust based on evidence
            if (failureData.evidence && failureData.evidence.length > 2) {
                probability += Math.min(failureData.evidence.length * 5, 20);
            }

            // Adjust based on historical frequency
            const historical = this._failures.filter(f => 
                f.category === failureData.category
            );
            if (historical.length > 5) {
                probability += Math.min(historical.length * 2, 15);
            }

            return Math.min(Math.max(probability, 10), 95);
        }

        // ============================================================
        // Recoverability Assessment (Chapter 8)
        // ============================================================

        _assessRecoverability(failureData, patternMatch) {
            let score = 50;

            // Severity factor
            if (failureData.severity > 80) score += 20;
            else if (failureData.severity > 60) score += 10;

            // Impact factor
            if (failureData.impact > 80) score += 20;
            else if (failureData.impact > 60) score += 10;

            // Affected modules factor
            if (failureData.affectedModules && failureData.affectedModules.length > 3) {
                score += 15;
            }

            // Pattern match factor
            if (patternMatch.matched && patternMatch.score > 0.7) {
                score -= 15; // Known patterns are easier to recover
            }

            // Determine level
            if (score >= 80) return RECOVERY_LEVEL.CRITICAL;
            if (score >= 60) return RECOVERY_LEVEL.DIFFICULT;
            if (score >= 35) return RECOVERY_LEVEL.MODERATE;
            return RECOVERY_LEVEL.EASY;
        }

        // ============================================================
        // Confidence Calculation (Chapter 6)
        // ============================================================

        _calculateConfidence(failureData, patternMatch, probability) {
            let confidence = 50;

            // Evidence confidence
            if (failureData.evidence && failureData.evidence.length > 2) {
                confidence += Math.min(failureData.evidence.length * 5, 20);
            }

            // Pattern match confidence
            if (patternMatch.matched) {
                confidence += patternMatch.score * 15;
            }

            // Source reliability
            if (failureData.source === 'performance_metrics') confidence += 10;
            else if (failureData.source === 'runtime_metrics') confidence += 10;
            else if (failureData.source === 'architecture_analysis') confidence += 5;

            // Probability alignment
            if (probability > 70) confidence += 10;
            else if (probability > 50) confidence += 5;

            return Math.min(Math.max(confidence, 30), 95);
        }

        // ============================================================
        // Propagation Analysis (Chapter 9)
        // ============================================================

        _buildPropagation(failureData, options) {
            const affected = failureData.affectedModules || [];
            const dependent = [];

            // Find dependent modules
            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        affected.forEach(moduleName => {
                            const mod = registry[moduleName];
                            if (mod && mod.dependents) {
                                dependent.push(...mod.dependents);
                            }
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            const uniqueDependents = [...new Set(dependent)];

            const systemImpact = this._calculateSystemImpact(affected.length, uniqueDependents.length);

            return new PropagationChain({
                rootFailure: failureData.target || 'unknown',
                affectedModules: affected,
                dependentModules: uniqueDependents,
                systemImpact: systemImpact,
                globalHealth: Math.max(0, 100 - affected.length * 5 - uniqueDependents.length * 2),
                metadata: {
                    timestamp: Date.now(),
                    source: 'failure_prediction'
                }
            });
        }

        _calculateSystemImpact(affectedCount, dependentCount) {
            const total = affectedCount + dependentCount;
            if (total === 0) return 'minimal';
            if (total <= 3) return 'moderate';
            if (total <= 7) return 'significant';
            return 'severe';
        }

        // ============================================================
        // Pattern Library Update (Chapter 4)
        // ============================================================

        _updatePatternLibrary(failure) {
            // Check if pattern already exists
            const existing = this._patternLibrary.find(p => 
                p.category === failure.category &&
                p.target === failure.target
            );

            if (existing) {
                // Update existing pattern
                existing.frequency = (existing.frequency || 0) + 1;
                existing.lastSeen = Date.now();
                existing.confidence = Math.min(
                    (existing.confidence || 50) + 5,
                    95
                );
            } else {
                // Add new pattern
                this._patternLibrary.push({
                    id: `pattern_${Date.now()}`,
                    category: failure.category,
                    target: failure.target,
                    severity: failure.severity,
                    evidence: failure.evidence,
                    frequency: 1,
                    confidence: 60,
                    createdAt: Date.now(),
                    lastSeen: Date.now()
                });
            }

            // Limit pattern library size
            if (this._patternLibrary.length > 50) {
                this._patternLibrary = this._patternLibrary.slice(-50);
            }
        }

        // ============================================================
        // Auto-Prediction
        // ============================================================

        _startAutoPrediction() {
            if (this._predictionInterval) {
                clearInterval(this._predictionInterval);
            }

            this._predictionInterval = setInterval(() => {
                this.predict();
            }, this._config.predictionInterval);

            console.log(`[FailurePrediction] Auto-prediction started (${this._config.predictionInterval}ms)`);
        }

        _stopAutoPrediction() {
            if (this._predictionInterval) {
                clearInterval(this._predictionInterval);
                this._predictionInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 15)
        // ============================================================

        forecastAll(options) {
            return this.predict(null, options);
        }

        getFailures(filter) {
            let failures = this._failures;

            if (filter) {
                if (filter.category) {
                    failures = failures.filter(f => f.category === filter.category);
                }
                if (filter.status) {
                    failures = failures.filter(f => f.status === filter.status);
                }
                if (filter.minProbability) {
                    failures = failures.filter(f => f.probability >= filter.minProbability);
                }
                if (filter.limit) {
                    failures = failures.slice(-filter.limit);
                }
            }

            return failures.map(f => f.toJSON());
        }

        getFailure(id) {
            const failure = this._failures.find(f => f.failureId === id);
            return failure ? failure.toJSON() : null;
        }

        getTimeline(limit) {
            return this._failures.slice(-(limit || 10)).reverse().map(f => ({
                failureId: f.failureId,
                target: f.target,
                category: f.category,
                expectedTime: f.expectedTime,
                probability: f.probability,
                severity: f.severity
            }));
        }

        getPropagation(failureId) {
            const failure = this._failures.find(f => f.failureId === failureId);
            return failure ? failure.propagation : null;
        }

        getRecoverability(failureId) {
            const failure = this._failures.find(f => f.failureId === failureId);
            return failure ? failure.recoverability : null;
        }

        getMostLikelyFailure() {
            const sorted = [...this._failures].sort((a, b) => b.probability - a.probability);
            return sorted.length > 0 ? sorted[0].toJSON() : null;
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._failures.length;
            const byCategory = {};
            const byStatus = {};
            const byTimeline = {};

            this._failures.forEach(f => {
                byCategory[f.category] = (byCategory[f.category] || 0) + 1;
                byStatus[f.status] = (byStatus[f.status] || 0) + 1;
                byTimeline[f.expectedTime] = (byTimeline[f.expectedTime] || 0) + 1;
            });

            const avgProbability = total > 0 ?
                Math.round(this._failures.reduce((sum, f) => sum + f.probability, 0) / total) :
                0;

            const avgConfidence = total > 0 ?
                Math.round(this._failures.reduce((sum, f) => sum + f.confidence, 0) / total) :
                0;

            return {
                total,
                byCategory,
                byStatus,
                byTimeline,
                avgProbability,
                avgConfidence,
                patterns: this._patternLibrary.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 13)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const mostLikely = this.getMostLikelyFailure();
            const recent = this.getFailures({ limit: 5 });

            return {
                type: 'failure_prediction',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                mostLikelyFailure: mostLikely,
                recentFailures: recent,
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
                        console.error('[FailurePrediction] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`failure.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('failurePredictionData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.failures) {
                        this._failures = data.failures.map(f => new Failure(f));
                    }
                    if (data.patterns) {
                        this._patternLibrary = data.patterns;
                    }
                    if (data.propagations) {
                        this._propagations = data.propagations.map(p => new PropagationChain(p));
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 12)
        // ============================================================

        _connectToRiskForecast() {
            if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
                console.log('[FailurePrediction] Connected to Risk Forecast');
            }
        }

        _connectToTrendPrediction() {
            if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
                console.log('[FailurePrediction] Connected to Trend Prediction');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[FailurePrediction] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[FailurePrediction] Connected to Optimization Layer');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[FailurePrediction] Connected to Governance');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[FailurePrediction] Connected to Knowledge Graph');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[FailurePrediction] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'failure-prediction',
                        name: 'Failure Prediction',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[FailurePrediction] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[FailurePrediction] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoPrediction();
            this._initialized = false;
            console.log('[FailurePrediction] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new FailurePrediction();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.FailurePrediction = {
        Core: instance,
        FAILURE_CATEGORY: FAILURE_CATEGORY,
        RECOVERY_LEVEL: RECOVERY_LEVEL,
        FAILURE_STATUS: FAILURE_STATUS,
        FAILURE_TIMELINE: FAILURE_TIMELINE,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        predict: (categories, options) => instance.predict(categories, options),
        forecastAll: (options) => instance.forecastAll(options),

        getFailures: (filter) => instance.getFailures(filter),
        getFailure: (id) => instance.getFailure(id),
        getTimeline: (limit) => instance.getTimeline(limit),
        getPropagation: (id) => instance.getPropagation(id),
        getRecoverability: (id) => instance.getRecoverability(id),
        getMostLikelyFailure: () => instance.getMostLikelyFailure(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[FailurePrediction] Part 53.4 loaded ✅');
    console.log('[FailurePrediction] Categories:', Object.values(FAILURE_CATEGORY).join(' | '));
    console.log('[FailurePrediction] Recovery Levels:', Object.keys(RECOVERY_LEVEL).join(' | '));

})();
