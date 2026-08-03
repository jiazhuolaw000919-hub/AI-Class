// ============================================================
// runtimeOS.js
// Part 56 — Runtime OS Final Integration Layer
// Version: v5.6
// Module: Runtime Operating System
// File: js/core/runtimeOS.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RuntimeOS) {
        console.warn('[RuntimeOS] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Integration Status
    // ============================================================
    const INTEGRATION_STATUS = {
        PENDING: 'pending',
        CONNECTING: 'connecting',
        CONNECTED: 'connected',
        VERIFIED: 'verified',
        ACTIVE: 'active',
        DEGRADED: 'degraded',
        ERROR: 'error'
    };

    // ============================================================
    // Module Registry
    // ============================================================
    const MODULE_LAYERS = {
        RUNTIME: 'runtime',
        GOVERNANCE: 'governance',
        KNOWLEDGE: 'knowledge',
        INTELLIGENCE: 'intelligence',
        AUTONOMOUS: 'autonomous',
        DECISION: 'decision',
        OPTIMIZATION: 'optimization',
        PREDICTIVE: 'predictive',
        EVOLUTION: 'evolution',
        ORCHESTRATION: 'orchestration'
    };

    // ============================================================
    // Integration Context (Chapter 6)
    // ============================================================
    class IntegrationContext {
        constructor(config) {
            this.integrationId = config.integrationId || this._generateId();
            this.timestamp = Date.now();
            this.runtimeVersion = config.runtimeVersion || '5.6';
            this.modules = config.modules || {};
            this.intelligenceLayers = config.intelligenceLayers || [];
            this.governanceStatus = config.governanceStatus || null;
            this.health = config.health || 0;
            this.readiness = config.readiness || 0;
            this.status = INTEGRATION_STATUS.PENDING;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `os_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                integrationId: this.integrationId,
                timestamp: this.timestamp,
                runtimeVersion: this.runtimeVersion,
                modules: this.modules,
                intelligenceLayers: this.intelligenceLayers,
                governanceStatus: this.governanceStatus,
                health: this.health,
                readiness: this.readiness,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Runtime OS Core (Chapter 1-5)
    // ============================================================
    class RuntimeOS {
        constructor() {
            this._context = null;
            this._moduleStatus = {};
            this._dependencies = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                version: '5.6',
                requireAllModules: false,
                healthCheckInterval: 30000,
                autoVerify: true,
                productionMode: false
            };
            this._moduleMap = this._initModuleMap();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RuntimeOS] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('🏛️ Runtime OS — Final Integration Layer');
            console.log('   Version: v5.6');
            console.log('   Status: Initializing...');

            // Register all modules
            this._registerAllModules();

            // Validate dependencies (Chapter 7)
            const validation = this._validateDependencies();

            if (!validation.valid) {
                console.warn('[RuntimeOS] Dependency validation issues:', validation.issues);
            }

            // Create integration context (Chapter 6)
            this._context = new IntegrationContext({
                runtimeVersion: this._config.version,
                modules: this._moduleStatus,
                intelligenceLayers: this._getIntelligenceLayers(),
                governanceStatus: this._getGovernanceStatus(),
                health: this._calculateHealth(),
                readiness: this._calculateReadiness(),
                metadata: {
                    initializedAt: Date.now(),
                    config: this._config
                }
            });

            // Connect all layers (Chapter 5)
            this._connectAllLayers();

            // Verify integration
            if (this._config.autoVerify) {
                this._verifyIntegration();
            }

            this._initialized = true;
            this._context.status = INTEGRATION_STATUS.ACTIVE;

            this._emit('osInitialized', this._context.toJSON());

            console.log('✅ Runtime OS — Integration Complete!');
            console.log(`   Health: ${this._context.health}%`);
            console.log(`   Readiness: ${this._context.readiness}%`);
            console.log(`   Modules: ${Object.keys(this._moduleStatus).length}`);

            return this;
        }

        // ============================================================
        // Module Map (Chapter 4)
        // ============================================================

        _initModuleMap() {
            return {
                [MODULE_LAYERS.RUNTIME]: {
                    name: 'Runtime Layer',
                    required: true,
                    modules: ['BootManager', 'EventBus', 'StateRegistry', 'Performance']
                },
                [MODULE_LAYERS.GOVERNANCE]: {
                    name: 'Governance Layer',
                    required: true,
                    modules: ['Governance', 'EvolutionGovernance', 'OrchestrationGovernance']
                },
                [MODULE_LAYERS.KNOWLEDGE]: {
                    name: 'Knowledge Layer',
                    required: true,
                    modules: ['KnowledgeGraph', 'HistoricalMemory']
                },
                [MODULE_LAYERS.INTELLIGENCE]: {
                    name: 'Intelligence Layer',
                    required: true,
                    modules: ['DecisionIntelligence', 'ReasoningEngine', 'CognitiveEngine']
                },
                [MODULE_LAYERS.AUTONOMOUS]: {
                    name: 'Autonomous Layer',
                    required: false,
                    modules: ['Autonomous', 'LifecycleManager', 'ActionPlanner']
                },
                [MODULE_LAYERS.DECISION]: {
                    name: 'Decision Layer',
                    required: true,
                    modules: ['DecisionIntelligence', 'DecisionConfidence', 'DecisionExplanation']
                },
                [MODULE_LAYERS.OPTIMIZATION]: {
                    name: 'Optimization Layer',
                    required: false,
                    modules: ['OptimizationIntelligence', 'ResourceOptimization', 'PerformanceAnalyzer']
                },
                [MODULE_LAYERS.PREDICTIVE]: {
                    name: 'Predictive Layer',
                    required: false,
                    modules: ['PredictiveIntelligence', 'TrendPrediction', 'RiskForecasting']
                },
                [MODULE_LAYERS.EVOLUTION]: {
                    name: 'Evolution Layer',
                    required: false,
                    modules: ['EvolutionIntelligence', 'RuntimeAdaptation', 'CapabilityGrowth']
                },
                [MODULE_LAYERS.ORCHESTRATION]: {
                    name: 'Orchestration Layer',
                    required: false,
                    modules: ['AIOrchestration', 'MultiAgentWorkflow', 'IntelligenceCoordination']
                }
            };
        }

        // ============================================================
        // Module Registration (Chapter 5)
        // ============================================================

        _registerAllModules() {
            const app = window.LawAIApp;

            for (const layerKey in this._moduleMap) {
                const layer = this._moduleMap[layerKey];
                const modules = layer.modules || [];

                modules.forEach(moduleName => {
                    const exists = app && app[moduleName];
                    this._moduleStatus[moduleName] = {
                        layer: layerKey,
                        available: !!exists,
                        status: exists ? INTEGRATION_STATUS.CONNECTED : INTEGRATION_STATUS.PENDING,
                        checkedAt: Date.now()
                    };

                    if (exists) {
                        console.log(`   ✅ ${moduleName} — ${layer.name}`);
                    } else {
                        if (layer.required) {
                            console.warn(`   ⚠️ ${moduleName} — ${layer.name} (REQUIRED — NOT FOUND)`);
                        } else {
                            console.log(`   ⬜ ${moduleName} — ${layer.name} (optional)`);
                        }
                    }
                });
            }
        }

        // ============================================================
        // Dependency Validation (Chapter 7)
        // ============================================================

        _validateDependencies() {
            const issues = [];
            const app = window.LawAIApp;

            // Check required modules
            for (const layerKey in this._moduleMap) {
                const layer = this._moduleMap[layerKey];
                if (!layer.required) continue;

                const modules = layer.modules || [];
                modules.forEach(moduleName => {
                    if (!app || !app[moduleName]) {
                        issues.push(`Required module missing: ${moduleName} (${layer.name})`);
                    }
                });
            }

            // Check critical dependencies
            const criticalPairs = [
                ['BootManager', 'StateRegistry'],
                ['Events', 'EventBus'],
                ['Governance', 'PermissionSystem']
            ];

            criticalPairs.forEach(([dep1, dep2]) => {
                if (app && app[dep1] && !app[dep2]) {
                    issues.push(`Dependency issue: ${dep1} requires ${dep2}`);
                }
            });

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        // ============================================================
        // Layer Connections (Chapter 5)
        // ============================================================

        _connectAllLayers() {
            console.log('[RuntimeOS] Connecting all layers...');

            // Connect Runtime → Governance
            if (window.LawAIApp && window.LawAIApp.Governance) {
                this._connect('Runtime', 'Governance');
            }

            // Connect Governance → Intelligence
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                this._connect('Governance', 'DecisionIntelligence');
            }

            // Connect Intelligence → Knowledge
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                this._connect('DecisionIntelligence', 'KnowledgeGraph');
            }

            // Connect Autonomous → Decision
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                this._connect('Autonomous', 'DecisionIntelligence');
            }

            // Connect Predictive → Evolution
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                this._connect('PredictiveIntelligence', 'EvolutionIntelligence');
            }

            // Connect Evolution → Orchestration
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                this._connect('EvolutionIntelligence', 'AIOrchestration');
            }

            // Connect Orchestration → All
            if (window.LawAIApp && window.LawAIApp.AIOrchestration) {
                this._connect('AIOrchestration', 'DecisionIntelligence');
                this._connect('AIOrchestration', 'PredictiveIntelligence');
                this._connect('AIOrchestration', 'OptimizationIntelligence');
            }

            console.log('[RuntimeOS] All layers connected ✅');
        }

        _connect(from, to) {
            try {
                const fromExists = window.LawAIApp && window.LawAIApp[from];
                const toExists = window.LawAIApp && window.LawAIApp[to];

                if (fromExists && toExists) {
                    console.log(`   🔗 ${from} ↔ ${to}`);
                } else {
                    console.log(`   ⬜ ${from} ↔ ${to} (one missing)`);
                }
            } catch (e) {
                // ignore
            }
        }

        // ============================================================
        // Verification (Chapter 7)
        // ============================================================

        _verifyIntegration() {
            console.log('[RuntimeOS] Verifying integration...');

            const checks = {
                architecture: this._verifyArchitecture(),
                dependencies: this._verifyDependencies(),
                dataFlow: this._verifyDataFlow(),
                performance: this._verifyPerformance(),
                governance: this._verifyGovernance(),
                security: this._verifySecurity(),
                maintainability: this._verifyMaintainability()
            };

            const passed = Object.values(checks).filter(c => c.passed).length;
            const total = Object.keys(checks).length;

            console.log(`[RuntimeOS] Verification: ${passed}/${total} checks passed`);

            if (passed === total) {
                console.log('✅ All verification checks passed!');
            } else {
                console.warn(`⚠️ ${total - passed} verification checks failed`);
            }

            return checks;
        }

        _verifyArchitecture() {
            const layers = Object.keys(this._moduleMap).length;
            const modules = Object.keys(this._moduleStatus).length;
            return {
                passed: layers >= 5 && modules >= 10,
                details: `Layers: ${layers}, Modules: ${modules}`
            };
        }

        _verifyDependencies() {
            const validation = this._validateDependencies();
            return {
                passed: validation.valid,
                details: validation.issues.length > 0 ? validation.issues.join('; ') : 'All dependencies valid'
            };
        }

        _verifyDataFlow() {
            // Check event bus and state sync
            const hasEventBus = !!(window.LawAIApp && window.LawAIApp.Events);
            const hasStateSync = !!(window.LawAIApp && window.LawAIApp.StateSyncEngine);
            return {
                passed: hasEventBus && hasStateSync,
                details: `EventBus: ${hasEventBus}, StateSync: ${hasStateSync}`
            };
        }

        _verifyPerformance() {
            const hasPerformance = !!(window.LawAIApp && window.LawAIApp.Performance);
            return {
                passed: hasPerformance,
                details: hasPerformance ? 'Performance monitoring available' : 'Performance monitoring missing'
            };
        }

        _verifyGovernance() {
            const hasGovernance = !!(window.LawAIApp && 
                (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance));
            return {
                passed: hasGovernance,
                details: hasGovernance ? 'Governance layer available' : 'Governance layer missing'
            };
        }

        _verifySecurity() {
            // Check permission system
            const hasPermissions = !!(window.LawAIApp && 
                (window.LawAIApp.PermissionSystem || window.LawAIApp.EvolutionGovernance));
            return {
                passed: hasPermissions,
                details: hasPermissions ? 'Security/permission system available' : 'Security system missing'
            };
        }

        _verifyMaintainability() {
            // Check module registry and explorer
            const hasRegistry = !!(window.LawAIApp && window.LawAIApp.Registry);
            const hasExplorer = !!(window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer);
            return {
                passed: hasRegistry && hasExplorer,
                details: `Registry: ${hasRegistry}, Explorer: ${hasExplorer}`
            };
        }

        // ============================================================
        // Health & Readiness (Chapter 6)
        // ============================================================

        _calculateHealth() {
            const total = Object.keys(this._moduleStatus).length;
            if (total === 0) return 0;

            const available = Object.values(this._moduleStatus).filter(m => m.available).length;
            return Math.round((available / total) * 100);
        }

        _calculateReadiness() {
            const required = Object.values(this._moduleMap).filter(l => l.required);
            const requiredModules = required.flatMap(l => l.modules || []);
            const totalRequired = requiredModules.length;
            if (totalRequired === 0) return 0;

            const availableRequired = requiredModules.filter(m => 
                this._moduleStatus[m] && this._moduleStatus[m].available
            ).length;

            return Math.round((availableRequired / totalRequired) * 100);
        }

        _getIntelligenceLayers() {
            const layers = [];
            const app = window.LawAIApp;

            if (app && app.DecisionIntelligence) layers.push('Decision');
            if (app && app.PredictiveIntelligence) layers.push('Predictive');
            if (app && app.OptimizationIntelligence) layers.push('Optimization');
            if (app && app.EvolutionIntelligence) layers.push('Evolution');
            if (app && app.AIOrchestration) layers.push('Orchestration');

            return layers;
        }

        _getGovernanceStatus() {
            const app = window.LawAIApp;
            return {
                hasGovernance: !!(app && app.Governance),
                hasEvolutionGovernance: !!(app && app.EvolutionGovernance),
                hasOrchestrationGovernance: !!(app && app.OrchestrationGovernance)
            };
        }

        // ============================================================
        // Runtime OS Vision (Chapter 8)
        // ============================================================

        getVision() {
            return {
                title: 'Runtime OS Vision',
                description: 'Runtime not only monitors the system. It understands, analyzes, predicts, optimizes, collaborates, and evolves.',
                capabilities: [
                    'Understand System — Cognitive understanding of runtime state',
                    'Analyze System — Deep analysis of patterns and behaviors',
                    'Predict System — Forecast trends, risks, and failures',
                    'Optimize System — Self-optimization based on intelligence',
                    'Collaborate — Multi-agent coordination and orchestration',
                    'Evolve — Continuous growth and adaptation'
                ],
                version: '5.6',
                status: this._initialized ? 'ACTIVE' : 'PENDING'
            };
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getStatus() {
            if (!this._context) {
                return {
                    initialized: false,
                    status: 'NOT_INITIALIZED',
                    health: 0,
                    readiness: 0
                };
            }

            return {
                initialized: this._initialized,
                status: this._context.status,
                health: this._context.health,
                readiness: this._context.readiness,
                version: this._context.runtimeVersion,
                modules: this._moduleStatus,
                layers: Object.keys(this._moduleMap)
            };
        }

        getModuleStatus(moduleName) {
            return this._moduleStatus[moduleName] || null;
        }

        getIntegrationContext() {
            return this._context ? this._context.toJSON() : null;
        }

        getStats() {
            const total = Object.keys(this._moduleStatus).length;
            const available = Object.values(this._moduleStatus).filter(m => m.available).length;
            const required = Object.values(this._moduleMap).filter(l => l.required);
            const requiredModules = required.flatMap(l => l.modules || []);
            const requiredAvailable = requiredModules.filter(m => 
                this._moduleStatus[m] && this._moduleStatus[m].available
            ).length;

            return {
                totalModules: total,
                availableModules: available,
                coverage: total > 0 ? Math.round((available / total) * 100) : 0,
                requiredModules: requiredModules.length,
                requiredAvailable: requiredAvailable,
                requiredCoverage: requiredModules.length > 0 ? 
                    Math.round((requiredAvailable / requiredModules.length) * 100) : 0,
                layers: Object.keys(this._moduleMap).length,
                intelligenceLayers: this._getIntelligenceLayers().length,
                health: this._context ? this._context.health : 0,
                readiness: this._context ? this._context.readiness : 0
            };
        }

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const vision = this.getVision();

            return {
                type: 'runtime_os',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                vision: vision,
                modules: this._moduleStatus,
                context: this._context ? this._context.toJSON() : null,
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
                        console.error('[RuntimeOS] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`os.${event}`, data);
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[RuntimeOS] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RuntimeOS();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RuntimeOS = {
        Core: instance,
        INTEGRATION_STATUS: INTEGRATION_STATUS,
        MODULE_LAYERS: MODULE_LAYERS,

        // Public API
        initialize: (config) => instance.initialize(config),
        getStatus: () => instance.getStatus(),
        getModuleStatus: (moduleName) => instance.getModuleStatus(moduleName),
        getIntegrationContext: () => instance.getIntegrationContext(),
        getStats: () => instance.getStats(),
        getVision: () => instance.getVision(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RuntimeOS] Part 56 loaded ✅');
    console.log('[RuntimeOS] 🏛️ Runtime OS — Final Integration Layer');

})();
