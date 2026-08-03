// ============================================================
// riskForecasting.js
// Part 53.3 — Risk Forecasting System
// Version: v5.3.3
// Module: Predictive Runtime Layer
// File: js/core/riskForecasting.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
        console.warn('[RiskForecasting] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Risk Categories (Chapter 5)
    // ============================================================
    const RISK_CATEGORY = {
        PERFORMANCE: 'performance',
        ARCHITECTURE: 'architecture',
        RESOURCE: 'resource',
        DEPENDENCY: 'dependency',
        GOVERNANCE: 'governance',
        RUNTIME_STABILITY: 'runtime_stability',
        MODULE_HEALTH: 'module_health',
        DATA_INTEGRITY: 'data_integrity'
    };

    // ============================================================
    // Severity Levels (Chapter 8)
    // ============================================================
    const SEVERITY = {
        CRITICAL: { label: 'CRITICAL', min: 90, max: 100, color: '#ef4444', action: 'immediate' },
        HIGH: { label: 'HIGH', min: 70, max: 89, color: '#f97316', action: 'priority' },
        MEDIUM: { label: 'MEDIUM', min: 40, max: 69, color: '#eab308', action: 'review' },
        LOW: { label: 'LOW', min: 0, max: 39, color: '#22c55e', action: 'observe' }
    };

    // ============================================================
    // Prediction Window (Chapter 9)
    // ============================================================
    const PREDICTION_WINDOW = {
        CURRENT_SESSION: 'current_session',
        NEXT_SESSION: 'next_session',
        NEXT_DAY: 'next_day',
        NEXT_WEEK: 'next_week',
        NEXT_RELEASE: 'next_release',
        CUSTOM: 'custom'
    };

    // ============================================================
    // Risk Status
    // ============================================================
    const RISK_STATUS = {
        PENDING: 'PENDING',
        ANALYZING: 'ANALYZING',
        FORECASTED: 'FORECASTED',
        MITIGATED: 'MITIGATED',
        OCCURRED: 'OCCURRED',
        DISMISSED: 'DISMISSED'
    };

    // ============================================================
    // Risk Model (Chapter 6)
    // ============================================================
    class Risk {
        constructor(config) {
            this.riskId = config.riskId || this._generateId();
            this.timestamp = Date.now();
            this.category = config.category || RISK_CATEGORY.PERFORMANCE;
            this.target = config.target || 'unknown';
            this.probability = config.probability || 0;
            this.impact = config.impact || 0;
            this.severity = config.severity || SEVERITY.LOW;
            this.confidence = config.confidence || 0;
            this.predictionWindow = config.predictionWindow || PREDICTION_WINDOW.NEXT_SESSION;
            this.status = RISK_STATUS.PENDING;
            this.evidence = config.evidence || [];
            this.recommendation = config.recommendation || null;
            this.possibleCause = config.possibleCause || null;
            this.affectedModules = config.affectedModules || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `risk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getSeverityLevel() {
            const score = (this.probability * 0.5 + this.impact * 0.5);
            if (score >= 90) return SEVERITY.CRITICAL;
            if (score >= 70) return SEVERITY.HIGH;
            if (score >= 40) return SEVERITY.MEDIUM;
            return SEVERITY.LOW;
        }

        getSeverityScore() {
            return Math.round((this.probability * 0.5 + this.impact * 0.5));
        }

        toJSON() {
            const severityLevel = this.getSeverityLevel();
            return {
                riskId: this.riskId,
                timestamp: this.timestamp,
                category: this.category,
                target: this.target,
                probability: this.probability,
                impact: this.impact,
                severity: severityLevel.label,
                severityScore: this.getSeverityScore(),
                severityColor: severityLevel.color,
                severityAction: severityLevel.action,
                confidence: this.confidence,
                predictionWindow: this.predictionWindow,
                status: this.status,
                evidence: this.evidence,
                recommendation: this.recommendation,
                possibleCause: this.possibleCause,
                affectedModules: this.affectedModules,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Forecast Report (Chapter 10)
    // ============================================================
    class ForecastReport {
        constructor(config) {
            this.reportId = config.reportId || this._generateId();
            this.timestamp = Date.now();
            this.summary = config.summary || '';
            this.risks = config.risks || [];
            this.topRisk = config.topRisk || null;
            this.riskTrend = config.riskTrend || 'stable';
            this.totalRisks = config.totalRisks || 0;
            this.criticalCount = config.criticalCount || 0;
            this.highCount = config.highCount || 0;
            this.mediumCount = config.mediumCount || 0;
            this.lowCount = config.lowCount || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `report_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                reportId: this.reportId,
                timestamp: this.timestamp,
                summary: this.summary,
                risks: this.risks.map(r => r.toJSON ? r.toJSON() : r),
                topRisk: this.topRisk ? (this.topRisk.toJSON ? this.topRisk.toJSON() : this.topRisk) : null,
                riskTrend: this.riskTrend,
                totalRisks: this.totalRisks,
                criticalCount: this.criticalCount,
                highCount: this.highCount,
                mediumCount: this.mediumCount,
                lowCount: this.lowCount,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Risk Forecasting Engine Core (Chapter 1-4)
    // ============================================================
    class RiskForecasting {
        constructor() {
            this._risks = [];
            this._reports = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minDataPoints: 5,
                confidenceThreshold: 50,
                enableAutoForecast: true,
                forecastInterval: 120000,
                criticalThreshold: 90,
                highThreshold: 70,
                mediumThreshold: 40
            };
            this._detectors = this._initDetectors();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RiskForecasting] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RiskForecasting] Initializing...');

            // Connect to modules (Chapter 11-13)
            this._connectToHistoricalMemory();
            this._connectToTrendPrediction();
            this._connectToKnowledgeGraph();
            this._connectToDecisionIntelligence();
            this._connectToGovernance();
            this._connectToRuntimeExplorer();

            // Register with Explorer (Chapter 14)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-forecast
            if (this._config.enableAutoForecast) {
                this._startAutoForecast();
            }

            this._initialized = true;
            console.log('[RiskForecasting] Initialized ✅');
            return this;
        }

        // ============================================================
        // Detectors (Chapter 5)
        // ============================================================

        _initDetectors() {
            return {
                [RISK_CATEGORY.PERFORMANCE]: {
                    name: 'performance_risk_detector',
                    detect: (options) => this._detectPerformanceRisk(options)
                },
                [RISK_CATEGORY.ARCHITECTURE]: {
                    name: 'architecture_risk_detector',
                    detect: (options) => this._detectArchitectureRisk(options)
                },
                [RISK_CATEGORY.RESOURCE]: {
                    name: 'resource_risk_detector',
                    detect: (options) => this._detectResourceRisk(options)
                },
                [RISK_CATEGORY.DEPENDENCY]: {
                    name: 'dependency_risk_detector',
                    detect: (options) => this._detectDependencyRisk(options)
                },
                [RISK_CATEGORY.GOVERNANCE]: {
                    name: 'governance_risk_detector',
                    detect: (options) => this._detectGovernanceRisk(options)
                },
                [RISK_CATEGORY.RUNTIME_STABILITY]: {
                    name: 'stability_risk_detector',
                    detect: (options) => this._detectStabilityRisk(options)
                },
                [RISK_CATEGORY.MODULE_HEALTH]: {
                    name: 'module_health_risk_detector',
                    detect: (options) => this._detectModuleHealthRisk(options)
                },
                [RISK_CATEGORY.DATA_INTEGRITY]: {
                    name: 'data_integrity_risk_detector',
                    detect: (options) => this._detectDataIntegrityRisk(options)
                }
            };
        }

        // ============================================================
        // Core: Forecast (Chapter 3-4)
        // ============================================================

        forecast(categories, options) {
            console.log('[RiskForecasting] Starting risk forecast...');

            const targetCategories = categories || Object.values(RISK_CATEGORY);
            const risks = [];

            targetCategories.forEach(category => {
                const detector = this._detectors[category];
                if (!detector) {
                    console.warn(`[RiskForecasting] No detector for: ${category}`);
                    return;
                }

                try {
                    const result = detector.detect(options);
                    if (result && result.risks) {
                        result.risks.forEach(riskData => {
                            // Calculate severity (Chapter 7)
                            const severity = this._calculateSeverity(riskData);
                            const risk = new Risk({
                                category: category,
                                target: riskData.target || category,
                                probability: riskData.probability || 0,
                                impact: riskData.impact || 0,
                                severity: severity,
                                confidence: riskData.confidence || 60,
                                predictionWindow: options?.window || PREDICTION_WINDOW.NEXT_SESSION,
                                evidence: riskData.evidence || [],
                                recommendation: riskData.recommendation || null,
                                possibleCause: riskData.possibleCause || null,
                                affectedModules: riskData.affectedModules || [],
                                metadata: {
                                    detector: detector.name,
                                    source: riskData.source || 'runtime'
                                }
                            });

                            risks.push(risk);
                            this._risks.push(risk);
                        });
                    }
                } catch (e) {
                    console.error(`[RiskForecasting] Detector error (${category}):`, e);
                }
            });

            // Enforce history limit
            if (this._risks.length > this._config.maxHistorySize) {
                this._risks = this._risks.slice(-this._config.maxHistorySize);
            }

            // Generate report (Chapter 10)
            const report = this._generateReport(risks);

            this._emit('forecastComplete', report.toJSON());

            return report;
        }

        // ============================================================
        // Risk Detectors (Chapter 5)
        // ============================================================

        _detectPerformanceRisk(options) {
            const risks = [];
            const evidence = [];

            // Get performance data
            const perfData = this._getPerformanceData();

            if (perfData) {
                // CPU risk
                if (perfData.cpu && perfData.cpu > 70) {
                    const probability = Math.min(95, 50 + (perfData.cpu - 70) * 1.5);
                    risks.push({
                        target: 'cpu_usage',
                        probability: Math.round(probability),
                        impact: Math.round(60 + (perfData.cpu - 70) * 0.5),
                        evidence: [`CPU usage: ${perfData.cpu}%`],
                        possibleCause: 'Increasing computational load',
                        recommendation: 'Monitor CPU usage, consider scaling if trend continues',
                        source: 'performance_metrics'
                    });
                }

                // Memory risk
                if (perfData.memory && perfData.memory > 75) {
                    const probability = Math.min(90, 40 + (perfData.memory - 75) * 2);
                    risks.push({
                        target: 'memory_usage',
                        probability: Math.round(probability),
                        impact: Math.round(70 + (perfData.memory - 75) * 0.3),
                        evidence: [`Memory usage: ${perfData.memory}%`],
                        possibleCause: 'Memory leak or increased allocation',
                        recommendation: 'Review memory usage patterns, consider cleanup',
                        source: 'performance_metrics'
                    });
                }

                // Response time risk
                if (perfData.responseTime && perfData.responseTime > 800) {
                    const probability = Math.min(85, 30 + (perfData.responseTime - 800) * 0.1);
                    risks.push({
                        target: 'response_time',
                        probability: Math.round(probability),
                        impact: Math.round(50 + (perfData.responseTime - 800) * 0.05),
                        evidence: [`Response time: ${perfData.responseTime}ms`],
                        possibleCause: 'Slow processing or bottleneck',
                        recommendation: 'Optimize critical paths, review bottlenecks',
                        source: 'performance_metrics'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectArchitectureRisk(options) {
            const risks = [];
            const evidence = [];

            const archData = this._getArchitectureData();

            if (archData) {
                // Complexity risk
                if (archData.complexity && archData.complexity > 0.6) {
                    const probability = Math.min(80, 30 + archData.complexity * 80);
                    risks.push({
                        target: 'architecture_complexity',
                        probability: Math.round(probability),
                        impact: 70,
                        evidence: [`Complexity score: ${(archData.complexity * 100).toFixed(0)}%`],
                        possibleCause: 'Growing module count and dependencies',
                        recommendation: 'Review architecture, plan refactoring',
                        source: 'architecture_analysis'
                    });
                }

                // Circular dependency risk
                if (archData.circularCount && archData.circularCount > 0) {
                    risks.push({
                        target: 'circular_dependency',
                        probability: Math.min(90, 50 + archData.circularCount * 10),
                        impact: 80,
                        evidence: [`${archData.circularCount} circular dependencies found`],
                        possibleCause: 'Poor module design',
                        recommendation: 'Refactor to remove circular dependencies',
                        source: 'architecture_analysis'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectResourceRisk(options) {
            const risks = [];
            const evidence = [];

            const resourceData = this._getResourceData();

            if (resourceData) {
                if (resourceData.utilization && resourceData.utilization > 80) {
                    const probability = Math.min(85, 40 + (resourceData.utilization - 80) * 2);
                    risks.push({
                        target: 'resource_exhaustion',
                        probability: Math.round(probability),
                        impact: 80,
                        evidence: [`Resource utilization: ${resourceData.utilization}%`],
                        possibleCause: 'Increasing demand, insufficient capacity',
                        recommendation: 'Plan capacity increase or optimize usage',
                        source: 'resource_metrics'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectDependencyRisk(options) {
            const risks = [];
            const evidence = [];

            const depData = this._getDependencyData();

            if (depData) {
                if (depData.deepDependencies && depData.deepDependencies > 5) {
                    const probability = Math.min(75, 30 + depData.deepDependencies * 5);
                    risks.push({
                        target: 'dependency_depth',
                        probability: Math.round(probability),
                        impact: 65,
                        evidence: [`Dependency depth: ${depData.deepDependencies}`],
                        possibleCause: 'Growing dependency chain',
                        recommendation: 'Flatten dependency structure',
                        source: 'dependency_analysis'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectGovernanceRisk(options) {
            const risks = [];
            const evidence = [];

            const govData = this._getGovernanceData();

            if (govData) {
                if (govData.policyViolations && govData.policyViolations > 0) {
                    risks.push({
                        target: 'policy_violation',
                        probability: Math.min(80, 40 + govData.policyViolations * 10),
                        impact: 75,
                        evidence: [`${govData.policyViolations} policy violations found`],
                        possibleCause: 'Non-compliant changes or configurations',
                        recommendation: 'Review and fix policy violations',
                        source: 'governance_analysis'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectStabilityRisk(options) {
            const risks = [];
            const evidence = [];

            const stabilityData = this._getStabilityData();

            if (stabilityData) {
                if (stabilityData.errorRate && stabilityData.errorRate > 5) {
                    const probability = Math.min(85, 30 + stabilityData.errorRate * 5);
                    risks.push({
                        target: 'error_rate',
                        probability: Math.round(probability),
                        impact: 70,
                        evidence: [`Error rate: ${stabilityData.errorRate}%`],
                        possibleCause: 'Increasing failures or exceptions',
                        recommendation: 'Investigate error patterns, fix root causes',
                        source: 'stability_metrics'
                    });
                }

                if (stabilityData.uptime && stabilityData.uptime < 95) {
                    const probability = Math.min(90, 50 + (95 - stabilityData.uptime) * 4);
                    risks.push({
                        target: 'uptime',
                        probability: Math.round(probability),
                        impact: 85,
                        evidence: [`Uptime: ${stabilityData.uptime}%`],
                        possibleCause: 'System instability or failures',
                        recommendation: 'Improve reliability, add redundancy',
                        source: 'stability_metrics'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectModuleHealthRisk(options) {
            const risks = [];
            const evidence = [];

            const moduleData = this._getModuleHealthData();

            if (moduleData) {
                if (moduleData.degradedModules && moduleData.degradedModules > 0) {
                    const probability = Math.min(80, 30 + moduleData.degradedModules * 10);
                    risks.push({
                        target: 'module_degradation',
                        probability: Math.round(probability),
                        impact: 65,
                        evidence: [`${moduleData.degradedModules} degraded modules`],
                        possibleCause: 'Module health declining',
                        recommendation: 'Review and fix degraded modules',
                        source: 'module_health_analysis'
                    });
                }
            }

            return { risks, evidence };
        }

        _detectDataIntegrityRisk(options) {
            const risks = [];
            const evidence = [];

            const integrityData = this._getDataIntegrityData();

            if (integrityData) {
                if (integrityData.validationErrors && integrityData.validationErrors > 0) {
                    risks.push({
                        target: 'data_integrity',
                        probability: Math.min(70, 20 + integrityData.validationErrors * 5),
                        impact: 80,
                        evidence: [`${integrityData.validationErrors} validation errors found`],
                        possibleCause: 'Data corruption or invalid updates',
                        recommendation: 'Review data validation, fix errors',
                        source: 'integrity_analysis'
                    });
                }
            }

            return { risks, evidence };
        }

        // ============================================================
        // Risk Scoring (Chapter 7)
        // ============================================================

        _calculateSeverity(riskData) {
            const probability = riskData.probability || 0;
            const impact = riskData.impact || 0;
            const score = (probability * 0.5 + impact * 0.5);

            if (score >= this._config.criticalThreshold) return SEVERITY.CRITICAL;
            if (score >= this._config.highThreshold) return SEVERITY.HIGH;
            if (score >= this._config.mediumThreshold) return SEVERITY.MEDIUM;
            return SEVERITY.LOW;
        }

        // ============================================================
        // Report Generation (Chapter 10)
        // ============================================================

        _generateReport(risks) {
            const sorted = [...risks].sort((a, b) => {
                const scoreA = a.getSeverityScore();
                const scoreB = b.getSeverityScore();
                return scoreB - scoreA;
            });

            const topRisk = sorted.length > 0 ? sorted[0] : null;

            const criticalCount = risks.filter(r => r.getSeverityLevel() === SEVERITY.CRITICAL).length;
            const highCount = risks.filter(r => r.getSeverityLevel() === SEVERITY.HIGH).length;
            const mediumCount = risks.filter(r => r.getSeverityLevel() === SEVERITY.MEDIUM).length;
            const lowCount = risks.filter(r => r.getSeverityLevel() === SEVERITY.LOW).length;

            const summary = this._buildSummary(risks, criticalCount, highCount);

            const report = new ForecastReport({
                summary: summary,
                risks: risks,
                topRisk: topRisk,
                riskTrend: this._calculateRiskTrend(),
                totalRisks: risks.length,
                criticalCount: criticalCount,
                highCount: highCount,
                mediumCount: mediumCount,
                lowCount: lowCount,
                metadata: {
                    timestamp: Date.now(),
                    window: 'current'
                }
            });

            this._reports.push(report);

            return report;
        }

        _buildSummary(risks, critical, high) {
            if (risks.length === 0) {
                return 'No risks detected. System appears healthy.';
            }

            const parts = [];
            if (critical > 0) {
                parts.push(`${critical} critical risk${critical > 1 ? 's' : ''} detected`);
            }
            if (high > 0) {
                parts.push(`${high} high risk${high > 1 ? 's' : ''} detected`);
            }
            if (risks.length - critical - high > 0) {
                parts.push(`${risks.length - critical - high} other risk${risks.length - critical - high > 1 ? 's' : ''} detected`);
            }

            return parts.join(' | ');
        }

        _calculateRiskTrend() {
            // Simplified - would analyze trend over time
            return 'stable';
        }

        // ============================================================
        // Data Retrieval (Chapter 3)
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
                            responseTime: report.responseTime || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getArchitectureData() {
            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const stats = window.LawAIApp.ArchitectureAdvisor.getStats ?
                        window.LawAIApp.ArchitectureAdvisor.getStats() : null;
                    if (stats) {
                        return {
                            complexity: stats.complexity || 0,
                            circularCount: stats.circularCount || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getResourceData() {
            try {
                if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
                    const stats = window.LawAIApp.ResourceOptimization.getStats ?
                        window.LawAIApp.ResourceOptimization.getStats() : null;
                    if (stats) {
                        return {
                            utilization: stats.utilization || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getDependencyData() {
            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const insights = window.LawAIApp.ArchitectureAdvisor.getInsights ?
                        window.LawAIApp.ArchitectureAdvisor.getInsights({ limit: 10 }) : null;
                    if (insights) {
                        const deepDeps = insights.filter(i => i.area === 'dependency').length;
                        return { deepDependencies: deepDeps };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getGovernanceData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Governance) {
                    const status = window.LawAIApp.Governance.getStatus ?
                        window.LawAIApp.Governance.getStatus() : null;
                    if (status) {
                        return {
                            policyViolations: status.violations || 0
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getStabilityData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const status = window.LawAIApp.Runtime.getStatus ?
                        window.LawAIApp.Runtime.getStatus() : null;
                    if (status) {
                        return {
                            errorRate: status.errorRate || 0,
                            uptime: status.uptime || 100
                        };
                    }
                }
            } catch (e) { /* ignore */ }
            return { errorRate: 2, uptime: 98 };
        }

        _getModuleHealthData() {
            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        const modules = Object.values(registry);
                        const degraded = modules.filter(m => m.health && m.health < 70).length;
                        return { degradedModules: degraded };
                    }
                }
            } catch (e) { /* ignore */ }
            return null;
        }

        _getDataIntegrityData() {
            // Simplified
            return { validationErrors: 0 };
        }

        // ============================================================
        // Auto-Forecast
        // ============================================================

        _startAutoForecast() {
            if (this._forecastInterval) {
                clearInterval(this._forecastInterval);
            }

            this._forecastInterval = setInterval(() => {
                this.forecast();
            }, this._config.forecastInterval);

            console.log(`[RiskForecasting] Auto-forecast started (${this._config.forecastInterval}ms)`);
        }

        _stopAutoForecast() {
            if (this._forecastInterval) {
                clearInterval(this._forecastInterval);
                this._forecastInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 16)
        // ============================================================

        forecastAll(options) {
            return this.forecast(null, options);
        }

        getRisk(id) {
            const risk = this._risks.find(r => r.riskId === id);
            return risk ? risk.toJSON() : null;
        }

        getTopRisks(limit) {
            const sorted = [...this._risks].sort((a, b) => {
                return b.getSeverityScore() - a.getSeverityScore();
            });
            return sorted.slice(0, limit || 5).map(r => r.toJSON());
        }

        getTimeline(limit) {
            return this._reports.slice(-(limit || 10)).reverse().map(r => r.toJSON());
        }

        getSeverityDistribution() {
            const distribution = {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            };

            this._risks.forEach(r => {
                const level = r.getSeverityLevel();
                if (level === SEVERITY.CRITICAL) distribution.critical++;
                else if (level === SEVERITY.HIGH) distribution.high++;
                else if (level === SEVERITY.MEDIUM) distribution.medium++;
                else distribution.low++;
            });

            return distribution;
        }

        getPredictionHistory(limit) {
            return this._reports.slice(-(limit || 10)).map(r => ({
                timestamp: r.timestamp,
                totalRisks: r.totalRisks,
                criticalCount: r.criticalCount,
                highCount: r.highCount,
                summary: r.summary
            }));
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._risks.length;
            const distribution = this.getSeverityDistribution();

            const byCategory = {};
            this._risks.forEach(r => {
                byCategory[r.category] = (byCategory[r.category] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._risks.reduce((sum, r) => sum + r.confidence, 0) / total) :
                0;

            return {
                total,
                distribution,
                byCategory,
                avgConfidence,
                reports: this._reports.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 14)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const topRisks = this.getTopRisks(5);
            const timeline = this.getTimeline(5);

            return {
                type: 'risk_forecasting',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                topRisks: topRisks,
                timeline: timeline,
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
                        console.error('[RiskForecasting] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`risk.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('riskForecastingData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.risks) {
                        this._risks = data.risks.map(r => new Risk(r));
                    }
                    if (data.reports) {
                        this._reports = data.reports.map(r => new ForecastReport(r));
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11-13)
        // ============================================================

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[RiskForecasting] Connected to Historical Memory');
            }
        }

        _connectToTrendPrediction() {
            if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
                console.log('[RiskForecasting] Connected to Trend Prediction');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[RiskForecasting] Connected to Knowledge Graph');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[RiskForecasting] Connected to Decision Intelligence');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[RiskForecasting] Connected to Governance');
            }
        }

        _connectToRuntimeExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                console.log('[RiskForecasting] Connected to Runtime Explorer');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'risk-forecasting',
                        name: 'Risk Forecasting',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[RiskForecasting] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[RiskForecasting] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoForecast();
            this._initialized = false;
            console.log('[RiskForecasting] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RiskForecasting();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RiskForecasting = {
        Core: instance,
        RISK_CATEGORY: RISK_CATEGORY,
        SEVERITY: SEVERITY,
        PREDICTION_WINDOW: PREDICTION_WINDOW,
        RISK_STATUS: RISK_STATUS,

        // Public API (Chapter 16)
        initialize: (config) => instance.initialize(config),
        forecast: (categories, options) => instance.forecast(categories, options),
        forecastAll: (options) => instance.forecastAll(options),

        getRisk: (id) => instance.getRisk(id),
        getTopRisks: (limit) => instance.getTopRisks(limit),
        getTimeline: (limit) => instance.getTimeline(limit),
        getSeverityDistribution: () => instance.getSeverityDistribution(),
        getPredictionHistory: (limit) => instance.getPredictionHistory(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RiskForecasting] Part 53.3 loaded ✅');
    console.log('[RiskForecasting] Categories:', Object.values(RISK_CATEGORY).join(' | '));
    console.log('[RiskForecasting] Severity Levels:', Object.keys(SEVERITY).join(' | '));

})();
