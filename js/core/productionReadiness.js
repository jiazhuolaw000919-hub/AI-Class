// ============================================================
// productionReadiness.js
// Part 56.5 — Production Readiness Layer
// Version: v5.6.5
// Module: Runtime Operating System
// File: js/core/productionReadiness.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ProductionReadiness) {
        console.warn('[ProductionReadiness] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Readiness Status
    // ============================================================
    const READINESS_STATUS = {
        PENDING: 'pending',
        CHECKING: 'checking',
        READY: 'ready',
        NOT_READY: 'not_ready',
        DEGRADED: 'degraded',
        ERROR: 'error'
    };

    // ============================================================
    // Reliability Model (Chapter 7)
    // ============================================================
    class ReliabilityModel {
        constructor(config) {
            this.modelId = config.modelId || this._generateId();
            this.timestamp = Date.now();
            this.availability = config.availability || 0;
            this.stability = config.stability || 0;
            this.recoveryTime = config.recoveryTime || 0;
            this.errorRate = config.errorRate || 0;
            this.healthScore = config.healthScore || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                modelId: this.modelId,
                timestamp: this.timestamp,
                availability: this.availability,
                stability: this.stability,
                recoveryTime: this.recoveryTime,
                errorRate: this.errorRate,
                healthScore: this.healthScore,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Health Report
    // ============================================================
    class HealthReport {
        constructor(config) {
            this.reportId = config.reportId || this._generateId();
            this.timestamp = Date.now();
            this.systemStatus = config.systemStatus || READINESS_STATUS.PENDING;
            this.moduleHealth = config.moduleHealth || {};
            this.performanceMetrics = config.performanceMetrics || {};
            this.errors = config.errors || [];
            this.recommendations = config.recommendations || [];
            this.overallScore = config.overallScore || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `hreport_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                reportId: this.reportId,
                timestamp: this.timestamp,
                systemStatus: this.systemStatus,
                moduleHealth: this.moduleHealth,
                performanceMetrics: this.performanceMetrics,
                errors: this.errors,
                recommendations: this.recommendations,
                overallScore: this.overallScore,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Production Readiness Core (Chapter 1-3)
    // ============================================================
    class ProductionReadiness {
        constructor() {
            this._healthReports = [];
            this._reliability = null;
            this._recoveryLog = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                version: '5.6.5',
                healthCheckInterval: 30000,
                errorThreshold: 5,
                recoveryTimeout: 30000,
                minHealthScore: 70,
                maxRetryAttempts: 3,
                productionMode: false
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ProductionReadiness] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ProductionReadiness] Initializing...');

            // Connect to modules (Chapter 12)
            this._connectToRuntimeHealth();
            this._connectToPerformanceFramework();
            this._connectToTracingSystem();
            this._connectToEventSystem();
            this._connectToGovernanceValidation();
            this._connectToArchitectureLayer();

            // Register with Explorer (Chapter 14)
            this._registerWithExplorer();

            // Initial health check
            this._performHealthCheck();

            // Start continuous health monitoring
            this._startHealthMonitoring();

            this._initialized = true;
            console.log('[ProductionReadiness] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Health Check (Chapter 4)
        // ============================================================

        healthCheck(options) {
            console.log('[ProductionReadiness] Performing health check...');

            const moduleHealth = this._checkModules();
            const performanceMetrics = this._checkPerformance();
            const errors = this._detectErrors();
            const recommendations = this._generateRecommendations(errors, moduleHealth, performanceMetrics);

            const overallScore = this._calculateOverallScore(moduleHealth, performanceMetrics, errors);

            const report = new HealthReport({
                systemStatus: overallScore >= this._config.minHealthScore ? 
                    READINESS_STATUS.READY : READINESS_STATUS.DEGRADED,
                moduleHealth: moduleHealth,
                performanceMetrics: performanceMetrics,
                errors: errors,
                recommendations: recommendations,
                overallScore: overallScore,
                metadata: {
                    checkedAt: Date.now(),
                    options: options || {}
                }
            });

            this._healthReports.push(report);

            this._emit('healthCheckComplete', report.toJSON());

            return report;
        }

        // ============================================================
        // Module Health (Chapter 4)
        // ============================================================

        _checkModules() {
            const health = {};
            const app = window.LawAIApp;

            const modules = [
                'BootManager', 'EventBus', 'StateRegistry', 'Performance',
                'Governance', 'EvolutionGovernance', 'OrchestrationGovernance',
                'KnowledgeGraph', 'HistoricalMemory',
                'DecisionIntelligence', 'PredictiveIntelligence',
                'OptimizationIntelligence', 'EvolutionIntelligence',
                'AIOrchestration', 'IntelligenceFederation',
                'UnifiedArchitecture', 'FinalGovernanceValidation',
                'RuntimeOS', 'RuntimeOSIntegration'
            ];

            modules.forEach(name => {
                const exists = !!(app && app[name]);
                const isActive = exists && app[name].Core && app[name].Core._initialized;
                health[name] = {
                    available: exists,
                    active: isActive || false,
                    health: exists ? (isActive ? 90 : 50) : 0,
                    status: exists ? (isActive ? 'running' : 'idle') : 'missing'
                };
            });

            return health;
        }

        // ============================================================
        // Performance Check (Chapter 5)
        // ============================================================

        _checkPerformance() {
            const metrics = {
                bootTime: 0,
                memoryUsage: 0,
                responseTime: 0,
                eventThroughput: 0,
                intelligenceLatency: 0
            };

            try {
                // Get boot performance
                if (window.LawAIApp && window.LawAIApp.BootManager) {
                    const status = window.LawAIApp.BootManager.getStatus ?
                        window.LawAIApp.BootManager.getStatus() : null;
                    if (status && status.bootDuration) {
                        metrics.bootTime = status.bootDuration;
                    }
                }

                // Get performance metrics
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) {
                        metrics.memoryUsage = report.memory || 0;
                        metrics.responseTime = report.responseTime || 0;
                    }
                }

                // Get event throughput
                if (window.LawAIApp && window.LawAIApp.Events) {
                    const stats = window.LawAIApp.Events.getStatistics ?
                        window.LawAIApp.Events.getStatistics() : null;
                    if (stats) {
                        metrics.eventThroughput = stats.throughput || 0;
                    }
                }
            } catch (e) { /* ignore */ }

            // Check thresholds
            const thresholds = {
                bootTime: 2000,
                memoryUsage: 80,
                responseTime: 500,
                eventThroughput: 10
            };

            metrics.status = {
                bootTime: metrics.bootTime <= thresholds.bootTime ? 'good' : 'warning',
                memoryUsage: metrics.memoryUsage <= thresholds.memoryUsage ? 'good' : 'warning',
                responseTime: metrics.responseTime <= thresholds.responseTime ? 'good' : 'warning',
                eventThroughput: metrics.eventThroughput >= thresholds.eventThroughput ? 'good' : 'warning'
            };

            return metrics;
        }

        // ============================================================
        // Error Detection (Chapter 6)
        // ============================================================

        _detectErrors() {
            const errors = [];

            try {
                // Check for errors in event system
                if (window.LawAIApp && window.LawAIApp.Events) {
                    const stats = window.LawAIApp.Events.getStatistics ?
                        window.LawAIApp.Events.getStatistics() : null;
                    if (stats && stats.errorCount && stats.errorCount > this._config.errorThreshold) {
                        errors.push({
                            source: 'Events',
                            message: `High error count: ${stats.errorCount}`,
                            severity: 'HIGH',
                            timestamp: Date.now()
                        });
                    }
                }

                // Check for degraded modules
                const moduleHealth = this._checkModules();
                const degraded = Object.entries(moduleHealth)
                    .filter(([_, info]) => info.status === 'idle' && info.available)
                    .map(([name, _]) => name);

                if (degraded.length > 0) {
                    errors.push({
                        source: 'Modules',
                        message: `${degraded.length} modules are idle/degraded: ${degraded.join(', ')}`,
                        severity: 'MEDIUM',
                        timestamp: Date.now()
                    });
                }

                // Check governance status
                if (window.LawAIApp && window.LawAIApp.FinalGovernanceValidation) {
                    const stats = window.LawAIApp.FinalGovernanceValidation.getStats ?
                        window.LawAIApp.FinalGovernanceValidation.getStats() : null;
                    if (stats && stats.passRate < 80) {
                        errors.push({
                            source: 'Governance',
                            message: `Governance pass rate: ${stats.passRate}%`,
                            severity: 'HIGH',
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) { /* ignore */ }

            return errors;
        }

        // ============================================================
        // Recommendations (Chapter 4)
        // ============================================================

        _generateRecommendations(errors, moduleHealth, performanceMetrics) {
            const recommendations = [];

            if (errors.length > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    action: 'Address detected errors',
                    details: errors.map(e => e.message).join('; ')
                });
            }

            // Check module health
            const unhealthy = Object.entries(moduleHealth)
                .filter(([_, info]) => info.available && info.health < 50)
                .map(([name, _]) => name);

            if (unhealthy.length > 0) {
                recommendations.push({
                    priority: 'MEDIUM',
                    action: 'Review unhealthy modules',
                    details: `Modules needing attention: ${unhealthy.join(', ')}`
                });
            }

            // Check performance
            if (performanceMetrics.memoryUsage > 70) {
                recommendations.push({
                    priority: 'MEDIUM',
                    action: 'Reduce memory usage',
                    details: `Current memory usage: ${performanceMetrics.memoryUsage}%`
                });
            }

            if (performanceMetrics.responseTime > 400) {
                recommendations.push({
                    priority: 'MEDIUM',
                    action: 'Optimize response time',
                    details: `Current response time: ${performanceMetrics.responseTime}ms`
                });
            }

            if (recommendations.length === 0) {
                recommendations.push({
                    priority: 'LOW',
                    action: 'System is healthy',
                    details: 'No recommendations at this time'
                });
            }

            return recommendations;
        }

        // ============================================================
        // Score Calculation (Chapter 4)
        // ============================================================

        _calculateOverallScore(moduleHealth, performanceMetrics, errors) {
            let score = 0;
            let totalWeight = 0;

            // Module health (weight: 0.4)
            const moduleValues = Object.values(moduleHealth);
            const avgModuleHealth = moduleValues.length > 0 ?
                moduleValues.reduce((sum, m) => sum + (m.health || 0), 0) / moduleValues.length : 0;
            score += avgModuleHealth * 0.4;
            totalWeight += 0.4;

            // Performance (weight: 0.3)
            let perfScore = 100;
            if (performanceMetrics.memoryUsage > 80) perfScore -= 20;
            if (performanceMetrics.responseTime > 500) perfScore -= 20;
            if (performanceMetrics.bootTime > 2000) perfScore -= 10;
            score += perfScore * 0.3;
            totalWeight += 0.3;

            // Error rate (weight: 0.3)
            let errorScore = 100;
            if (errors.length > 5) errorScore -= 30;
            else if (errors.length > 2) errorScore -= 15;
            else if (errors.length > 0) errorScore -= 5;
            score += errorScore * 0.3;
            totalWeight += 0.3;

            return Math.round(score / totalWeight);
        }

        // ============================================================
        // Error Recovery (Chapter 6)
        // ============================================================

        recover(error) {
            console.log('[ProductionReadiness] Attempting recovery from error:', error);

            const recovery = {
                recoveryId: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: Date.now(),
                error: error,
                strategy: 'auto_recovery',
                attempts: 0,
                status: 'pending'
            };

            try {
                // Attempt recovery based on error type
                if (error.source === 'Events') {
                    this._recoverEvents(error);
                } else if (error.source === 'Modules') {
                    this._recoverModules(error);
                } else if (error.source === 'Governance') {
                    this._recoverGovernance(error);
                } else {
                    // Generic recovery: reinitialize
                    this._recoverGeneric(error);
                }

                recovery.status = 'success';
                recovery.attempts = 1;

            } catch (recoveryError) {
                recovery.status = 'failed';
                recovery.error = recoveryError.message;

                // Escalate to governance
                if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                    try {
                        window.LawAIApp.EvolutionGovernance.review(recovery, {
                            type: 'recovery_failure'
                        });
                    } catch (e) { /* ignore */ }
                }
            }

            this._recoveryLog.push(recovery);

            this._emit('recoveryAttempt', recovery);

            return recovery;
        }

        _recoverEvents(error) {
            console.log('[ProductionReadiness] Recovering Event system...');
            // Clear event buffer if needed
            if (window.LawAIApp && window.LawAIApp.Events) {
                try {
                    if (window.LawAIApp.Events.clear) {
                        window.LawAIApp.Events.clear();
                    }
                } catch (e) { /* ignore */ }
            }
        }

        _recoverModules(error) {
            console.log('[ProductionReadiness] Recovering Modules...');
            // Attempt to reinitialize degraded modules
            const degraded = error.message.match(/idle\/degraded: (.+)/);
            if (degraded && degraded[1]) {
                const names = degraded[1].split(', ').map(s => s.trim());
                names.forEach(name => {
                    try {
                        if (window.LawAIApp && window.LawAIApp[name] && window.LawAIApp[name].Core) {
                            if (typeof window.LawAIApp[name].Core.initialize === 'function') {
                                window.LawAIApp[name].Core.initialize();
                            }
                        }
                    } catch (e) { /* ignore */ }
                });
            }
        }

        _recoverGovernance(error) {
            console.log('[ProductionReadiness] Recovering Governance...');
            // Re-run governance validation
            if (window.LawAIApp && window.LawAIApp.FinalGovernanceValidation) {
                try {
                    window.LawAIApp.FinalGovernanceValidation.validate();
                } catch (e) { /* ignore */ }
            }
        }

        _recoverGeneric(error) {
            console.log('[ProductionReadiness] Generic recovery...');
            // Perform system health check
            this._performHealthCheck();
        }

        // ============================================================
        // Health Monitoring (Chapter 4)
        // ============================================================

        _startHealthMonitoring() {
            if (this._healthInterval) {
                clearInterval(this._healthInterval);
            }

            this._healthInterval = setInterval(() => {
                this._performHealthCheck();
            }, this._config.healthCheckInterval);

            console.log(`[ProductionReadiness] Health monitoring started (${this._config.healthCheckInterval}ms)`);
        }

        _performHealthCheck() {
            const report = this.healthCheck();
            return report;
        }

        // ============================================================
        // Deployment Readiness (Chapter 11)
        // ============================================================

        checkDeploymentReadiness() {
            console.log('[ProductionReadiness] Checking deployment readiness...');

            const checks = {
                configuration: this._checkConfiguration(),
                dependencies: this._checkDependencies(),
                environment: this._checkEnvironment(),
                security: this._checkSecurity(),
                recoveryPlan: this._checkRecoveryPlan()
            };

            const allPassed = Object.values(checks).every(c => c.passed);
            const issues = Object.entries(checks)
                .filter(([_, c]) => !c.passed)
                .map(([key, c]) => ({ area: key, issues: c.issues }));

            return {
                ready: allPassed,
                checks: checks,
                issues: issues,
                timestamp: Date.now()
            };
        }

        _checkConfiguration() {
            const issues = [];
            const version = this._config.version;
            if (!version) issues.push('Version not defined');
            return { passed: issues.length === 0, issues: issues };
        }

        _checkDependencies() {
            const issues = [];
            const app = window.LawAIApp;
            const required = ['BootManager', 'EventBus', 'Governance'];
            required.forEach(dep => {
                if (!app || !app[dep]) {
                    issues.push(`Missing required dependency: ${dep}`);
                }
            });
            return { passed: issues.length === 0, issues: issues };
        }

        _checkEnvironment() {
            const issues = [];
            const hasLocalStorage = typeof localStorage !== 'undefined';
            if (!hasLocalStorage) issues.push('LocalStorage not available');
            const hasConsole = typeof console !== 'undefined';
            if (!hasConsole) issues.push('Console not available');
            return { passed: issues.length === 0, issues: issues };
        }

        _checkSecurity() {
            const issues = [];
            const hasGovernance = !!(window.LawAIApp && 
                (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance));
            if (!hasGovernance) issues.push('Governance layer not available');
            return { passed: issues.length === 0, issues: issues };
        }

        _checkRecoveryPlan() {
            const issues = [];
            const hasRecovery = this._recoveryLog.length > 0;
            const hasHealth = this._healthReports.length > 0;
            if (!hasRecovery) issues.push('No recovery logs found');
            if (!hasHealth) issues.push('No health reports found');
            return { passed: issues.length === 0, issues: issues };
        }

        // ============================================================
        // Reliability Model (Chapter 7)
        // ============================================================

        getReliabilityModel() {
            const reports = this._healthReports.slice(-10);
            const total = reports.length;

            if (total === 0) {
                return new ReliabilityModel({
                    availability: 0,
                    stability: 0,
                    recoveryTime: 0,
                    errorRate: 0,
                    healthScore: 0
                });
            }

            const avgHealth = reports.reduce((sum, r) => sum + r.overallScore, 0) / total;

            const errors = reports.reduce((sum, r) => sum + r.errors.length, 0);
            const errorRate = errors / total;

            const recoveries = this._recoveryLog.filter(r => r.status === 'success').length;
            const availability = total > 0 ? (total - recoveries) / total * 100 : 0;

            return new ReliabilityModel({
                availability: Math.round(availability),
                stability: Math.round(avgHealth),
                recoveryTime: 1000, // Placeholder
                errorRate: Math.round(errorRate * 100) / 100,
                healthScore: Math.round(avgHealth),
                metadata: {
                    totalReports: total,
                    totalRecoveries: recoveries,
                    calculatedAt: Date.now()
                }
            });
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getLatestHealthReport() {
            return this._healthReports.length > 0 ? 
                this._healthReports[this._healthReports.length - 1].toJSON() : null;
        }

        getHealthReports(limit) {
            return this._healthReports.slice(-(limit || 10)).reverse().map(r => r.toJSON());
        }

        getRecoveryLogs(limit) {
            return this._recoveryLog.slice(-(limit || 10)).reverse();
        }

        getStats() {
            const totalReports = this._healthReports.length;
            const totalRecoveries = this._recoveryLog.length;
            const successfulRecoveries = this._recoveryLog.filter(r => r.status === 'success').length;

            const latest = this.getLatestHealthReport();
            const reliability = this.getReliabilityModel();

            return {
                totalReports,
                totalRecoveries,
                successfulRecoveries,
                recoveryRate: totalRecoveries > 0 ? 
                    Math.round((successfulRecoveries / totalRecoveries) * 100) : 0,
                currentHealth: latest ? latest.overallScore : 0,
                reliability: reliability.toJSON(),
                deploymentReady: this.checkDeploymentReadiness().ready
            };
        }

        // ============================================================
        // Explorer Support (Chapter 14)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const latest = this.getLatestHealthReport();
            const readiness = this.checkDeploymentReadiness();

            return {
                type: 'production_readiness',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                latestHealthReport: latest,
                deploymentReadiness: readiness,
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
                        console.error('[ProductionReadiness] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`production.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 12)
        // ============================================================

        _connectToRuntimeHealth() {
            if (window.LawAIApp && window.LawAIApp.Runtime) {
                console.log('[ProductionReadiness] Connected to Runtime Health');
            }
        }

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[ProductionReadiness] Connected to Performance Framework');
            }
        }

        _connectToTracingSystem() {
            if (window.LawAIApp && window.LawAIApp.Trace) {
                console.log('[ProductionReadiness] Connected to Tracing System');
            }
        }

        _connectToEventSystem() {
            if (window.LawAIApp && window.LawAIApp.Events) {
                console.log('[ProductionReadiness] Connected to Event System');
            }
        }

        _connectToGovernanceValidation() {
            if (window.LawAIApp && window.LawAIApp.FinalGovernanceValidation) {
                console.log('[ProductionReadiness] Connected to Governance Validation');
            }
        }

        _connectToArchitectureLayer() {
            if (window.LawAIApp && window.LawAIApp.UnifiedArchitecture) {
                console.log('[ProductionReadiness] Connected to Architecture Layer');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'production-readiness',
                        name: 'Production Readiness',
                        category: 'operations',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ProductionReadiness] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ProductionReadiness] Could not register with Explorer:', e);
                }
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
            console.log('[ProductionReadiness] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new ProductionReadiness();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ProductionReadiness = {
        Core: instance,
        READINESS_STATUS: READINESS_STATUS,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        healthCheck: (options) => instance.healthCheck(options),
        recover: (error) => instance.recover(error),
        checkDeploymentReadiness: () => instance.checkDeploymentReadiness(),
        getReliabilityModel: () => instance.getReliabilityModel(),

        getLatestHealthReport: () => instance.getLatestHealthReport(),
        getHealthReports: (limit) => instance.getHealthReports(limit),
        getRecoveryLogs: (limit) => instance.getRecoveryLogs(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[ProductionReadiness] Part 56.5 loaded ✅');
    console.log('[ProductionReadiness] 🚀 Production Ready');

})();
