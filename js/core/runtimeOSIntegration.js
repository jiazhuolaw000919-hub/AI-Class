// ============================================================
// runtimeOSIntegration.js
// Part 56.1 — Runtime OS Integration Foundation
// Version: v5.6.1
// Module: Runtime Operating System
// File: js/core/runtimeOSIntegration.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RuntimeOSIntegration) {
        console.warn('[RuntimeOSIntegration] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Integration Status
    // ============================================================
    const INTEGRATION_STATUS = {
        REGISTERED: 'registered',
        VALIDATED: 'validated',
        CONNECTED: 'connected',
        ACTIVE: 'active',
        DEGRADED: 'degraded',
        ERROR: 'error'
    };

    // ============================================================
    // Contract Status
    // ============================================================
    const CONTRACT_STATUS = {
        PENDING: 'pending',
        VALID: 'valid',
        INVALID: 'invalid',
        CONFLICT: 'conflict'
    };

    // ============================================================
    // Module Contract (Chapter 5)
    // ============================================================
    class ModuleContract {
        constructor(config) {
            this.moduleId = config.moduleId || this._generateId();
            this.version = config.version || '1.0.0';
            this.capabilities = config.capabilities || [];
            this.dependencies = config.dependencies || [];
            this.lifecycle = config.lifecycle || {
                start: 'idle',
                state: 'initialized'
            };
            this.health = config.health || 0;
            this.interface = config.interface || {
                events: [],
                methods: [],
                state: {}
            };
            this.status = CONTRACT_STATUS.PENDING;
            this.registeredAt = Date.now();
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        validate() {
            const issues = [];

            if (!this.moduleId) issues.push('Missing moduleId');
            if (!this.version) issues.push('Missing version');
            if (!this.capabilities || this.capabilities.length === 0) {
                issues.push('No capabilities defined');
            }
            if (this.health < 0 || this.health > 100) issues.push('Health must be 0-100');

            this.status = issues.length === 0 ? CONTRACT_STATUS.VALID : CONTRACT_STATUS.INVALID;
            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        toJSON() {
            return {
                moduleId: this.moduleId,
                version: this.version,
                capabilities: this.capabilities,
                dependencies: this.dependencies,
                lifecycle: this.lifecycle,
                health: this.health,
                interface: this.interface,
                status: this.status,
                registeredAt: this.registeredAt,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Unified Runtime Context (Chapter 6)
    // ============================================================
    class RuntimeContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.currentState = config.currentState || {};
            this.activeModules = config.activeModules || [];
            this.systemHealth = config.systemHealth || 0;
            this.activeWorkflow = config.activeWorkflow || null;
            this.governanceStatus = config.governanceStatus || null;
            this.intelligenceContext = config.intelligenceContext || {};
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `rctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                currentState: this.currentState,
                activeModules: this.activeModules,
                systemHealth: this.systemHealth,
                activeWorkflow: this.activeWorkflow,
                governanceStatus: this.governanceStatus,
                intelligenceContext: this.intelligenceContext,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Runtime OS Integration Core (Chapter 1-4)
    // ============================================================
    class RuntimeOSIntegration {
        constructor() {
            this._contracts = {};
            this._registry = {};
            this._context = null;
            this._connections = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                version: '5.6.1',
                validateOnRegister: true,
                autoConnect: true,
                healthCheckInterval: 30000,
                strictMode: false
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RuntimeOSIntegration] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RuntimeOSIntegration] Initializing...');

            // Create runtime context
            this._context = new RuntimeContext({
                currentState: { status: 'initializing' },
                activeModules: [],
                systemHealth: 0,
                governanceStatus: { status: 'pending' }
            });

            // Register all available modules
            this._registerAvailableModules();

            // Validate all contracts
            this._validateAllContracts();

            // Connect modules
            if (this._config.autoConnect) {
                this._connectAllModules();
            }

            this._initialized = true;
            this._context.currentState.status = 'ready';

            console.log('[RuntimeOSIntegration] Initialized ✅');
            console.log(`   Registered: ${Object.keys(this._contracts).length} modules`);
            console.log(`   Connected: ${Object.keys(this._connections).length} connections`);

            return this;
        }

        // ============================================================
        // Module Registration (Chapter 8)
        // ============================================================

        registerModule(config) {
            const contract = new ModuleContract({
                moduleId: config.moduleId,
                version: config.version || '1.0.0',
                capabilities: config.capabilities || [],
                dependencies: config.dependencies || [],
                lifecycle: config.lifecycle || { start: 'idle', state: 'initialized' },
                health: config.health || 100,
                interface: config.interface || { events: [], methods: [], state: {} },
                metadata: config.metadata || {}
            });

            // Validate contract
            if (this._config.validateOnRegister) {
                const validation = contract.validate();
                if (!validation.valid) {
                    console.warn(`[RuntimeOSIntegration] Contract validation failed for ${config.moduleId}:`, validation.issues);
                    if (this._config.strictMode) {
                        return null;
                    }
                }
            }

            this._contracts[contract.moduleId] = contract;
            this._registry[contract.moduleId] = {
                contract: contract,
                status: INTEGRATION_STATUS.REGISTERED,
                connectedAt: null
            };

            this._emit('moduleRegistered', contract.toJSON());

            return contract;
        }

        _registerAvailableModules() {
            const app = window.LawAIApp;
            const modules = [
                'BootManager', 'EventBus', 'StateRegistry', 'Performance',
                'Governance', 'EvolutionGovernance', 'OrchestrationGovernance',
                'KnowledgeGraph', 'HistoricalMemory',
                'DecisionIntelligence', 'ReasoningEngine', 'CognitiveEngine',
                'Autonomous', 'LifecycleManager', 'ActionPlanner',
                'OptimizationIntelligence', 'ResourceOptimization', 'PerformanceAnalyzer',
                'PredictiveIntelligence', 'TrendPrediction', 'RiskForecasting',
                'EvolutionIntelligence', 'RuntimeAdaptation', 'CapabilityGrowth',
                'AIOrchestration', 'MultiAgentWorkflow', 'IntelligenceCoordination'
            ];

            modules.forEach(moduleName => {
                if (app && app[moduleName]) {
                    this.registerModule({
                        moduleId: moduleName,
                        capabilities: this._detectCapabilities(moduleName),
                        dependencies: this._detectDependencies(moduleName),
                        health: 100,
                        metadata: { source: 'auto_discovery' }
                    });
                }
            });
        }

        _detectCapabilities(moduleName) {
            const capabilities = {
                'BootManager': ['boot', 'lifecycle', 'startup'],
                'EventBus': ['event', 'publish', 'subscribe'],
                'StateRegistry': ['state', 'sync', 'persist'],
                'Performance': ['performance', 'metrics', 'monitor'],
                'Governance': ['governance', 'policy', 'audit'],
                'DecisionIntelligence': ['decision', 'analyze', 'reason'],
                'PredictiveIntelligence': ['predict', 'forecast', 'trend'],
                'OptimizationIntelligence': ['optimize', 'analyze', 'recommend'],
                'EvolutionIntelligence': ['evolve', 'adapt', 'grow'],
                'AIOrchestration': ['orchestrate', 'coordinate', 'workflow'],
                'KnowledgeGraph': ['knowledge', 'query', 'relate'],
                'HistoricalMemory': ['memory', 'history', 'pattern']
            };

            return capabilities[moduleName] || ['unknown'];
        }

        _detectDependencies(moduleName) {
            const dependencies = {
                'Governance': ['BootManager', 'EventBus'],
                'EvolutionGovernance': ['Governance', 'EventBus'],
                'DecisionIntelligence': ['StateRegistry', 'KnowledgeGraph'],
                'PredictiveIntelligence': ['HistoricalMemory', 'Performance'],
                'OptimizationIntelligence': ['DecisionIntelligence', 'Performance'],
                'EvolutionIntelligence': ['OptimizationIntelligence', 'PredictiveIntelligence'],
                'AIOrchestration': ['DecisionIntelligence', 'PredictiveIntelligence', 'OptimizationIntelligence']
            };

            return dependencies[moduleName] || [];
        }

        // ============================================================
        // Contract Validation (Chapter 9)
        // ============================================================

        _validateAllContracts() {
            const results = [];
            const conflicts = [];

            for (const moduleId in this._contracts) {
                const contract = this._contracts[moduleId];
                const validation = contract.validate();

                // Check for version conflicts
                for (const otherId in this._contracts) {
                    if (otherId === moduleId) continue;
                    const other = this._contracts[otherId];
                    if (other.capabilities.some(c => contract.capabilities.includes(c))) {
                        conflicts.push({
                            module1: moduleId,
                            module2: otherId,
                            capability: contract.capabilities.find(c => other.capabilities.includes(c))
                        });
                    }
                }

                results.push({
                    moduleId: moduleId,
                    valid: validation.valid,
                    issues: validation.issues
                });
            }

            if (conflicts.length > 0) {
                console.warn('[RuntimeOSIntegration] Capability conflicts detected:', conflicts);
            }

            if (this._config.strictMode && results.some(r => !r.valid)) {
                console.error('[RuntimeOSIntegration] Strict mode: Invalid contracts found');
            }

            return results;
        }

        validateContract(moduleId) {
            const contract = this._contracts[moduleId];
            if (!contract) return null;
            return contract.validate();
        }

        // ============================================================
        // Module Connection (Chapter 7)
        // ============================================================

        _connectAllModules() {
            for (const moduleId in this._contracts) {
                this.connectModule(moduleId);
            }
        }

        connectModule(moduleId) {
            const contract = this._contracts[moduleId];
            if (!contract) {
                console.warn(`[RuntimeOSIntegration] Module not found: ${moduleId}`);
                return false;
            }

            // Check dependencies
            const missingDeps = contract.dependencies.filter(dep => !this._contracts[dep]);
            if (missingDeps.length > 0) {
                console.warn(`[RuntimeOSIntegration] Missing dependencies for ${moduleId}:`, missingDeps);
                if (this._config.strictMode) return false;
            }

            // Check if already connected
            if (this._connections[moduleId]) {
                console.log(`[RuntimeOSIntegration] ${moduleId} already connected`);
                return true;
            }

            this._connections[moduleId] = {
                contract: contract,
                connectedAt: Date.now(),
                status: INTEGRATION_STATUS.CONNECTED,
                dependencies: contract.dependencies.filter(dep => this._contracts[dep])
            };

            // Update registry
            if (this._registry[moduleId]) {
                this._registry[moduleId].status = INTEGRATION_STATUS.CONNECTED;
                this._registry[moduleId].connectedAt = Date.now();
            }

            // Update active modules
            if (this._context) {
                this._context.activeModules.push(moduleId);
            }

            this._emit('moduleConnected', {
                moduleId: moduleId,
                connectedAt: Date.now()
            });

            return true;
        }

        disconnectModule(moduleId) {
            if (!this._connections[moduleId]) return false;

            delete this._connections[moduleId];
            if (this._registry[moduleId]) {
                this._registry[moduleId].status = INTEGRATION_STATUS.REGISTERED;
            }
            if (this._context) {
                this._context.activeModules = this._context.activeModules.filter(m => m !== moduleId);
            }

            this._emit('moduleDisconnected', { moduleId: moduleId });
            return true;
        }

        // ============================================================
        // Communication Standard (Chapter 7)
        // ============================================================

        sendMessage(moduleId, message) {
            const connection = this._connections[moduleId];
            if (!connection) {
                console.warn(`[RuntimeOSIntegration] Module not connected: ${moduleId}`);
                return null;
            }

            const formattedMessage = this._formatMessage(message);
            this._emit('messageSent', {
                from: 'system',
                to: moduleId,
                message: formattedMessage
            });

            return formattedMessage;
        }

        _formatMessage(message) {
            return {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: Date.now(),
                type: message.type || 'request',
                payload: message.payload || {},
                metadata: message.metadata || {}
            };
        }

        // ============================================================
        // Runtime Context Access (Chapter 6)
        // ============================================================

        getRuntimeContext() {
            if (!this._context) {
                this._context = new RuntimeContext({
                    currentState: { status: 'pending' },
                    activeModules: [],
                    systemHealth: 0
                });
            }

            // Update context with current state
            this._context.systemHealth = this._calculateSystemHealth();
            this._context.activeModules = Object.keys(this._connections);
            this._context.governanceStatus = this._getGovernanceStatus();
            this._context.intelligenceContext = this._getIntelligenceContext();

            return this._context;
        }

        _calculateSystemHealth() {
            const total = Object.keys(this._contracts).length;
            if (total === 0) return 0;

            const connected = Object.keys(this._connections).length;
            const healthSum = Object.values(this._contracts).reduce((sum, c) => sum + c.health, 0);

            return Math.round((connected / total) * 50 + (healthSum / total) * 0.5);
        }

        _getGovernanceStatus() {
            const hasGov = !!window.LawAIApp && !!window.LawAIApp.Governance;
            const hasEvoGov = !!window.LawAIApp && !!window.LawAIApp.EvolutionGovernance;
            return {
                hasGovernance: hasGov,
                hasEvolutionGovernance: hasEvoGov,
                status: (hasGov || hasEvoGov) ? 'active' : 'pending'
            };
        }

        _getIntelligenceContext() {
            const app = window.LawAIApp;
            return {
                hasDecision: !!(app && app.DecisionIntelligence),
                hasPredictive: !!(app && app.PredictiveIntelligence),
                hasOptimization: !!(app && app.OptimizationIntelligence),
                hasEvolution: !!(app && app.EvolutionIntelligence),
                hasOrchestration: !!(app && app.AIOrchestration)
            };
        }

        // ============================================================
        // Boot Flow (Chapter 10)
        // ============================================================

        boot() {
            console.log('[RuntimeOSIntegration] Starting boot flow...');

            const steps = [
                { name: 'Load Registry', action: () => this._loadRegistry() },
                { name: 'Validate Contracts', action: () => this._validateAllContracts() },
                { name: 'Initialize Core', action: () => this._initializeCore() },
                { name: 'Connect Modules', action: () => this._connectAllModules() },
                { name: 'Activate Intelligence', action: () => this._activateIntelligence() },
                { name: 'Enable Governance', action: () => this._enableGovernance() }
            ];

            let failed = false;
            for (const step of steps) {
                try {
                    console.log(`   ${step.name}...`);
                    step.action();
                } catch (error) {
                    console.error(`   ❌ ${step.name} failed:`, error);
                    failed = true;
                    break;
                }
            }

            if (failed) {
                console.log('[RuntimeOSIntegration] Boot flow failed ❌');
                return false;
            }

            console.log('[RuntimeOSIntegration] Boot flow complete ✅');
            console.log('   🏛️ Runtime OS Ready');

            // Update context
            if (this._context) {
                this._context.currentState.status = 'running';
            }

            this._emit('bootComplete', this.getRuntimeContext().toJSON());

            return true;
        }

        _loadRegistry() {
            // Registry loaded during initialization
            return true;
        }

        _initializeCore() {
            // Core initialized during initialization
            return true;
        }

        _activateIntelligence() {
            const app = window.LawAIApp;
            const intelligences = ['DecisionIntelligence', 'PredictiveIntelligence', 'OptimizationIntelligence', 'EvolutionIntelligence', 'AIOrchestration'];

            intelligences.forEach(name => {
                if (app && app[name] && app[name].initialize) {
                    try {
                        app[name].initialize();
                        console.log(`   ✅ ${name} activated`);
                    } catch (e) {
                        console.warn(`   ⚠️ ${name} activation failed:`, e.message);
                    }
                }
            });

            return true;
        }

        _enableGovernance() {
            const app = window.LawAIApp;
            if (app && app.EvolutionGovernance && app.EvolutionGovernance.initialize) {
                try {
                    app.EvolutionGovernance.initialize();
                    console.log('   ✅ Governance enabled');
                } catch (e) {
                    console.warn('   ⚠️ Governance enablement failed:', e.message);
                }
            }
            return true;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getContracts() {
            const result = {};
            for (const id in this._contracts) {
                result[id] = this._contracts[id].toJSON();
            }
            return result;
        }

        getContract(moduleId) {
            const contract = this._contracts[moduleId];
            return contract ? contract.toJSON() : null;
        }

        getRegistry() {
            return this._registry;
        }

        getConnections() {
            const result = {};
            for (const id in this._connections) {
                result[id] = {
                    connectedAt: this._connections[id].connectedAt,
                    status: this._connections[id].status,
                    dependencies: this._connections[id].dependencies
                };
            }
            return result;
        }

        getStats() {
            return {
                totalModules: Object.keys(this._contracts).length,
                registeredModules: Object.keys(this._registry).length,
                connectedModules: Object.keys(this._connections).length,
                health: this._context ? this._context.systemHealth : 0,
                contextId: this._context ? this._context.contextId : null
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const context = this._context ? this._context.toJSON() : null;

            return {
                type: 'runtime_os_integration',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                context: context,
                contracts: this.getContracts(),
                connections: this.getConnections(),
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
                        console.error('[RuntimeOSIntegration] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`osintegration.${event}`, data);
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            this._connections = {};
            this._context = null;
            console.log('[RuntimeOSIntegration] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RuntimeOSIntegration();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RuntimeOSIntegration = {
        Core: instance,
        INTEGRATION_STATUS: INTEGRATION_STATUS,
        CONTRACT_STATUS: CONTRACT_STATUS,

        // Public API (Chapter 13)
        initialize: (config) => instance.initialize(config),
        registerModule: (config) => instance.registerModule(config),
        validateContract: (moduleId) => instance.validateContract(moduleId),
        connectModule: (moduleId) => instance.connectModule(moduleId),
        disconnectModule: (moduleId) => instance.disconnectModule(moduleId),
        sendMessage: (moduleId, message) => instance.sendMessage(moduleId, message),
        boot: () => instance.boot(),

        getRuntimeContext: () => instance.getRuntimeContext(),
        getContracts: () => instance.getContracts(),
        getContract: (moduleId) => instance.getContract(moduleId),
        getRegistry: () => instance.getRegistry(),
        getConnections: () => instance.getConnections(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RuntimeOSIntegration] Part 56.1 loaded ✅');
    console.log('[RuntimeOSIntegration] 🏛️ Runtime OS Integration Foundation');

})();
