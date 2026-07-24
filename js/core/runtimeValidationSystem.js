/**
 * Runtime Validation System
 * Part 49.4 — V4.9.4
 * 
 * Pre-execution Validation Layer:
 * - Action Validation
 * - Risk Detection
 * - State Checking
 * - Dependency Checking
 * - Consistency Checking
 * 
 * Validation Rules:
 * 1. Validation must be context-based
 * 2. High risk actions must not auto-execute
 * 3. Validation results must be recorded
 * 4. Validation failure must not break runtime
 */

class RuntimeValidationSystem {
    constructor() {
        this.version = '4.9.4';
        this.status = 'ACTIVE';
        
        this.validationHistory = [];
        this.validators = new Map();
        this.riskProfiles = new Map();
        this.dependencyGraph = new Map();
        
        this.validationTypes = {
            STATE: 'state',
            DEPENDENCY: 'dependency',
            PERFORMANCE: 'performance',
            DATA: 'data',
            SAFETY: 'safety'
        };
        
        this.riskLevels = {
            LOW: { level: 1, label: 'LOW', description: 'Safe to proceed', autoAllow: true },
            MEDIUM: { level: 2, label: 'MEDIUM', description: 'Requires confirmation', autoAllow: false },
            HIGH: { level: 3, label: 'HIGH', description: 'Requires human review', autoAllow: false },
            CRITICAL: { level: 4, label: 'CRITICAL', description: 'Execution blocked', autoAllow: false }
        };
        
        this.decisions = {
            ALLOW: 'ALLOW',
            REVIEW: 'REVIEW',
            REJECT: 'REJECT'
        };
        
        this.criticalModules = [
            'BootManager',
            'StateSyncEngine',
            'RuntimeKernel',
            'StorageEngine',
            'EventBus'
        ];
        
        this.systemState = {
            initialized: false,
            totalValidations: 0,
            validationsByDecision: { ALLOW: 0, REVIEW: 0, REJECT: 0 },
            validationsByRisk: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            lastValidation: null,
            systemHealth: 'HEALTHY'
        };
        
        this.init();
    }
    
    init() {
        console.log('[ValidationSystem] Initializing...');
        
        this._registerDefaultValidators();
        this._buildDependencyGraph();
        this._defineRiskProfiles();
        
        this.systemState.initialized = true;
        
        console.log('[ValidationSystem] Ready — ' + this.validators.size + ' validators registered');
        
        this._emitEvent('validationSystem.initialized', {
            version: this.version,
            validators: this.validators.size,
            riskProfiles: this.riskProfiles.size
        });
    }
    
    // ========== VALIDATOR REGISTRATION ==========
    
    registerValidator(def) {
        var validatorId = def.validatorId;
        var name = def.name;
        var type = def.type;
        var check = def.check;
        var priority = def.priority || 10;
        var metadata = def.metadata || {};
        
        var validTypes = Object.values(this.validationTypes);
        if (validTypes.indexOf(type) === -1) {
            throw new Error('Invalid validator type: ' + type + '. Must be one of: ' + validTypes.join(', '));
        }
        
        if (typeof check !== 'function') {
            throw new Error('Validator check must be a function');
        }
        
        var validator = {
            validatorId: validatorId || 'VAL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: name,
            type: type,
            check: check,
            priority: priority,
            metadata: Object.assign({ registeredAt: new Date().toISOString() }, metadata),
            stats: { executions: 0, passed: 0, failed: 0, lastRun: null }
        };
        
        this.validators.set(validator.validatorId, validator);
        this._audit('VALIDATOR_REGISTERED', { validatorId: validator.validatorId, name: name, type: type });
        
        return validator;
    }
    
    // ========== CORE VALIDATION ==========
    
    validate(request, options) {
        if (!request) request = {};
        if (!options) options = {};
        
        var startTime = performance.now();
        var validationId = 'VALREQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        var action = request.action;
        var target = request.target;
        var source = request.source;
        var params = request.params || {};
        var context = request.context || {};
        
        this.systemState.totalValidations++;
        this.systemState.lastValidation = new Date().toISOString();
        
        // Step 1: Collect runtime context
        var runtimeContext = this._collectRuntimeContext();
        
        // Step 2: Determine which validators to run
        var relevantValidators = this._getRelevantValidators(action, target, options);
        
        // Step 3: Run all validation checks
        var checks = [];
        var overallRisk = this.riskLevels.LOW;
        var warnings = [];
        var errors = [];
        
        for (var i = 0; i < relevantValidators.length; i++) {
            var validator = relevantValidators[i];
            var checkResult = this._runValidator(validator, {
                action: action,
                target: target,
                source: source,
                params: params,
                context: context,
                runtimeContext: runtimeContext
            });
            
            checks.push(checkResult);
            
            validator.stats.executions++;
            validator.stats.lastRun = new Date().toISOString();
            
            if (checkResult.passed) {
                validator.stats.passed++;
            } else {
                validator.stats.failed++;
            }
            
            if (checkResult.warnings && checkResult.warnings.length > 0) {
                warnings = warnings.concat(checkResult.warnings);
            }
            
            if (checkResult.errors && checkResult.errors.length > 0) {
                errors = errors.concat(checkResult.errors);
            }
            
            if (checkResult.risk && checkResult.risk.level > overallRisk.level) {
                overallRisk = checkResult.risk;
            }
        }
        
        // Step 4: Determine decision based on risk
        var decision = this._determineDecision(overallRisk, errors.length > 0);
        
        // Step 5: Build validation result
        var checksSummary = {
            total: checks.length,
            passed: 0,
            failed: 0,
            warnings: warnings.length,
            errors: errors.length
        };
        for (var j = 0; j < checks.length; j++) {
            if (checks[j].passed) checksSummary.passed++;
            else checksSummary.failed++;
        }
        
        var result = {
            validationId: validationId,
            request: { action: action, target: target, source: source, params: params },
            checks: checks,
            checksSummary: checksSummary,
            risk: overallRisk,
            decision: decision,
            warnings: warnings.length > 0 ? warnings : undefined,
            errors: errors.length > 0 ? errors : undefined,
            recommendation: this._generateRecommendation(overallRisk, decision, checks),
            context: runtimeContext,
            evaluationTime: (performance.now() - startTime).toFixed(2) + 'ms',
            timestamp: new Date().toISOString(),
            systemVersion: this.version
        };
        
        // Step 6: Record and emit
        this._recordValidation(result);
        this._emitValidationResult(result);
        
        return result;
    }
    
    quickValidate(request) {
        if (!request) request = {};
        var result = this.validate(request);
        
        return {
            valid: result.decision === 'ALLOW',
            decision: result.decision,
            risk: result.risk.label,
            reason: result.recommendation,
            checksRun: result.checksSummary.total,
            checksFailed: result.checksSummary.failed
        };
    }
    
    validateWithTypes(request, checkTypes) {
        if (!request) request = {};
        if (!checkTypes) checkTypes = [];
        return this.validate(request, { specificTypes: checkTypes });
    }
    
    // ========== SPECIFIC VALIDATION METHODS ==========
    
    validateState() {
        var runtimeContext = this._collectRuntimeContext();
        var checks = [];
        
        var coreModules = ['BootManager', 'RuntimeKernel', 'EventBus'];
        var loadedModules = (runtimeContext.modules && runtimeContext.modules.loaded) || [];
        var missingCore = [];
        for (var i = 0; i < coreModules.length; i++) {
            if (loadedModules.indexOf(coreModules[i]) === -1) missingCore.push(coreModules[i]);
        }
        
        checks.push({
            type: 'STATE',
            name: 'Core Module Check',
            passed: missingCore.length === 0,
            risk: missingCore.length > 0 ? this.riskLevels.CRITICAL : this.riskLevels.LOW,
            details: missingCore.length > 0 ? 'Missing core modules: ' + missingCore.join(', ') : 'All core modules loaded'
        });
        
        var healthStatus = (runtimeContext.health && runtimeContext.health.status) || 'UNKNOWN';
        checks.push({
            type: 'STATE',
            name: 'System Health Check',
            passed: healthStatus === 'HEALTHY' || healthStatus === 'running',
            risk: healthStatus === 'CRITICAL' ? this.riskLevels.CRITICAL : (healthStatus === 'WARNING' ? this.riskLevels.MEDIUM : this.riskLevels.LOW),
            details: 'System health: ' + healthStatus
        });
        
        return {
            checks: checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    validateDependencies(moduleName) {
        var dependencies = this.dependencyGraph.get(moduleName) || [];
        var checks = [];
        
        for (var i = 0; i < dependencies.length; i++) {
            var dep = dependencies[i];
            var depLoaded = this._isModuleLoaded(dep);
            checks.push({
                type: 'DEPENDENCY',
                name: 'Dependency: ' + moduleName + ' → ' + dep,
                passed: depLoaded,
                risk: depLoaded ? this.riskLevels.LOW : (this.criticalModules.indexOf(dep) !== -1 ? this.riskLevels.CRITICAL : this.riskLevels.HIGH),
                details: depLoaded ? dep + ' is loaded' : dep + ' is NOT loaded'
            });
        }
        
        var circularDeps = this._detectCircularDependencies(moduleName);
        if (circularDeps.length > 0) {
            checks.push({
                type: 'DEPENDENCY',
                name: 'Circular Dependency Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: 'Circular dependencies detected: ' + circularDeps.join(' → '),
                warnings: ['Circular dependencies may cause initialization issues']
            });
        }
        
        var affectedModules = this._getAffectedModules(moduleName);
        if (affectedModules.length > 0) {
            checks.push({
                type: 'DEPENDENCY',
                name: 'Affected Modules Check',
                passed: true,
                risk: affectedModules.length > 10 ? this.riskLevels.HIGH : (affectedModules.length > 5 ? this.riskLevels.MEDIUM : this.riskLevels.LOW),
                details: affectedModules.length + ' modules depend on ' + moduleName + ': ' + affectedModules.join(', ')
            });
        }
        
        return {
            moduleName: moduleName,
            checks: checks,
            dependencies: dependencies,
            affectedModules: affectedModules,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    validatePerformance(request) {
        if (!request) request = {};
        var checks = [];
        
        if (request.estimatedCost) {
            var cost = request.estimatedCost;
            checks.push({
                type: 'PERFORMANCE',
                name: 'Resource Cost Check',
                passed: cost < 200,
                risk: cost > 500 ? this.riskLevels.CRITICAL : (cost > 200 ? this.riskLevels.HIGH : (cost > 100 ? this.riskLevels.MEDIUM : this.riskLevels.LOW)),
                details: 'Estimated resource cost: ' + cost + ' units'
            });
        }
        
        var runtimeContext = this._collectRuntimeContext();
        var currentLoad = (runtimeContext.performance && runtimeContext.performance.currentLoad) || 0;
        
        if (currentLoad > 80) {
            checks.push({
                type: 'PERFORMANCE',
                name: 'System Load Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: 'System under high load (' + currentLoad + '%) — action may degrade performance',
                warnings: ['Current system load is ' + currentLoad + '%']
            });
        }
        
        return {
            checks: checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    validateData(dataContext) {
        if (!dataContext) dataContext = {};
        var checks = [];
        
        if (dataContext.schema && dataContext.data) {
            var schemaValid = this._validateSchema(dataContext.data, dataContext.schema);
            checks.push({
                type: 'DATA',
                name: 'Data Schema Check',
                passed: schemaValid,
                risk: schemaValid ? this.riskLevels.LOW : this.riskLevels.HIGH,
                details: schemaValid ? 'Data matches schema' : 'Data schema validation failed'
            });
        }
        
        if (dataContext.size) {
            var sizeLimit = dataContext.sizeLimit || 1048576;
            checks.push({
                type: 'DATA',
                name: 'Data Size Check',
                passed: dataContext.size <= sizeLimit,
                risk: dataContext.size > sizeLimit * 2 ? this.riskLevels.HIGH : (dataContext.size > sizeLimit ? this.riskLevels.MEDIUM : this.riskLevels.LOW),
                details: 'Data size: ' + (dataContext.size / 1024).toFixed(1) + 'KB (limit: ' + (sizeLimit / 1024).toFixed(1) + 'KB)'
            });
        }
        
        return {
            checks: checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    validateSafety(request) {
        if (!request) request = {};
        var checks = [];
        var runtimeContext = this._collectRuntimeContext();
        
        if (request.target && this.criticalModules.indexOf(request.target) !== -1) {
            checks.push({
                type: 'SAFETY',
                name: 'Critical Module Protection',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: 'Target "' + request.target + '" is a critical system module',
                warnings: ['Modifying critical modules may destabilize the system']
            });
        }
        
        var destructiveActions = ['DELETE', 'SHUTDOWN', 'UNLOAD', 'RESET', 'DESTROY'];
        var isDestructive = false;
        if (request.action) {
            for (var i = 0; i < destructiveActions.length; i++) {
                if (request.action.toUpperCase().indexOf(destructiveActions[i]) !== -1) {
                    isDestructive = true;
                    break;
                }
            }
        }
        if (isDestructive) {
            checks.push({
                type: 'SAFETY',
                name: 'Destructive Action Check',
                passed: false,
                risk: this.riskLevels.CRITICAL,
                details: 'Action "' + request.action + '" is potentially destructive',
                warnings: ['Destructive actions require explicit approval']
            });
        }
        
        if (runtimeContext.governance && runtimeContext.governance.freezeActive) {
            checks.push({
                type: 'SAFETY',
                name: 'Runtime Freeze Check',
                passed: false,
                risk: this.riskLevels.CRITICAL,
                details: 'Runtime is currently frozen — modifications are blocked',
                warnings: ['Runtime freeze is active. Unfreeze before making changes.']
            });
        }
        
        var affectedModules = request.target ? this._getAffectedModules(request.target) : [];
        if (affectedModules.length > 15) {
            checks.push({
                type: 'SAFETY',
                name: 'Wide Impact Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: 'Action affects ' + affectedModules.length + ' modules — wide impact',
                warnings: [affectedModules.length + ' modules will be affected by this action']
            });
        }
        
        return {
            checks: checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    // ========== DEPENDENCY MANAGEMENT ==========
    
    registerDependencies(module, dependencies) {
        if (!dependencies) dependencies = [];
        this.dependencyGraph.set(module, dependencies.slice());
        this._audit('DEPENDENCIES_REGISTERED', { module: module, dependencies: dependencies });
    }
    
    getDependencyTree(moduleName) {
        var direct = this.dependencyGraph.get(moduleName) || [];
        var reverse = this._getAffectedModules(moduleName);
        
        return {
            module: moduleName,
            dependsOn: direct,
            dependedBy: reverse,
            isCritical: this.criticalModules.indexOf(moduleName) !== -1,
            totalConnections: direct.length + reverse.length
        };
    }
    
    // ========== REPORTING ==========
    
    getReport() {
        var validatorsByType = {};
        var types = Object.values(this.validationTypes);
        for (var i = 0; i < types.length; i++) {
            var type = types[i];
            var count = 0;
            var all = Array.from(this.validators.values());
            for (var j = 0; j < all.length; j++) {
                if (all[j].type === type) count++;
            }
            validatorsByType[type] = count;
        }
        
        return {
            version: this.version,
            status: this.systemState.systemHealth,
            validators: { total: this.validators.size, byType: validatorsByType },
            validations: {
                total: this.systemState.totalValidations,
                byDecision: this.systemState.validationsByDecision,
                byRisk: this.systemState.validationsByRisk
            },
            dependencyGraph: { modules: this.dependencyGraph.size, criticalModules: this.criticalModules },
            riskLevels: Object.values(this.riskLevels).map(function(r) {
                return { level: r.level, label: r.label, description: r.description, autoAllow: r.autoAllow };
            }),
            rules: [
                'Rule 1: Validation must be context-based ✅',
                'Rule 2: High risk actions must not auto-execute ✅',
                'Rule 3: Validation results must be recorded ✅',
                'Rule 4: Validation failure must not break runtime ✅'
            ],
            recentValidations: this.validationHistory.slice(-10)
        };
    }
    
    getHealth() {
        var rejectRate = this.systemState.totalValidations > 0
            ? this.systemState.validationsByDecision.REJECT / this.systemState.totalValidations
            : 0;
        
        var health = 'HEALTHY';
        if (rejectRate > 0.3) health = 'RESTRICTIVE';
        if (!this.systemState.initialized) health = 'NOT_INITIALIZED';
        
        this.systemState.systemHealth = health;
        
        return {
            status: health,
            version: this.version,
            validators: this.validators.size,
            totalValidations: this.systemState.totalValidations,
            rejectRate: (rejectRate * 100).toFixed(1) + '%',
            lastValidation: this.systemState.lastValidation,
            isOperational: true
        };
    }
    
    getValidationHistory(limit) {
        if (!limit) limit = 50;
        return this.validationHistory.slice(-limit);
    }
    
    // ========== PRIVATE METHODS ==========
    
    _registerDefaultValidators() {
        var self = this;
        
        this.registerValidator({
            validatorId: 'VAL-STATE-001',
            name: 'Runtime State Check',
            type: 'state',
            priority: 1,
            check: function(ctx) {
                var runtimeCtx = ctx.runtimeContext;
                var passed = runtimeCtx && (runtimeCtx.status === 'running' || runtimeCtx.status === 'ready');
                return {
                    passed: passed,
                    risk: passed ? self.riskLevels.LOW : self.riskLevels.CRITICAL,
                    details: 'Runtime status: ' + ((runtimeCtx && runtimeCtx.status) || 'UNKNOWN')
                };
            }
        });
        
        this.registerValidator({
            validatorId: 'VAL-DEP-001',
            name: 'Module Dependency Check',
            type: 'dependency',
            priority: 5,
            check: function(ctx) {
                if (!ctx.target) {
                    return { passed: true, risk: self.riskLevels.LOW, details: 'No target module specified' };
                }
                
                var deps = self.dependencyGraph.get(ctx.target) || [];
                var missing = [];
                for (var i = 0; i < deps.length; i++) {
                    if (!self._isModuleLoaded(deps[i])) missing.push(deps[i]);
                }
                
                var isCriticalMissing = false;
                for (var j = 0; j < missing.length; j++) {
                    if (self.criticalModules.indexOf(missing[j]) !== -1) {
                        isCriticalMissing = true;
                        break;
                    }
                }
                
                return {
                    passed: missing.length === 0,
                    risk: missing.length > 0 ? (isCriticalMissing ? self.riskLevels.CRITICAL : self.riskLevels.HIGH) : self.riskLevels.LOW,
                    details: missing.length > 0 ? 'Missing dependencies: ' + missing.join(', ') : 'All dependencies satisfied',
                    warnings: missing.length > 0 ? ['Missing ' + missing.length + ' dependencies'] : []
                };
            }
        });
        
        this.registerValidator({
            validatorId: 'VAL-SAF-001',
            name: 'Critical Module Protection',
            type: 'safety',
            priority: 3,
            check: function(ctx) {
                if (ctx.target && self.criticalModules.indexOf(ctx.target) !== -1) {
                    return {
                        passed: ctx.source === 'SUB-DEV-001' || ctx.source === 'SUB-SYS-001',
                        risk: self.riskLevels.HIGH,
                        details: 'Target "' + ctx.target + '" is a critical module — requires elevated permissions',
                        warnings: ['Critical module "' + ctx.target + '" — proceed with caution']
                    };
                }
                return { passed: true, risk: self.riskLevels.LOW, details: 'Target is not critical' };
            }
        });
        
        this.registerValidator({
            validatorId: 'VAL-PERF-001',
            name: 'System Load Check',
            type: 'performance',
            priority: 10,
            check: function(ctx) {
                var load = (ctx.runtimeContext && ctx.runtimeContext.performance && ctx.runtimeContext.performance.currentLoad) || 0;
                var passed = load < 80;
                return {
                    passed: passed,
                    risk: load > 90 ? self.riskLevels.CRITICAL : (load > 80 ? self.riskLevels.HIGH : (load > 60 ? self.riskLevels.MEDIUM : self.riskLevels.LOW)),
                    details: 'System load: ' + load + '%',
                    warnings: load > 80 ? ['High system load (' + load + '%) — performance may degrade'] : []
                };
            }
        });
        
        this.registerValidator({
            validatorId: 'VAL-DATA-001',
            name: 'Data Integrity Check',
            type: 'data',
            priority: 15,
            check: function(ctx) {
                if (ctx.params && Object.keys(ctx.params).length > 0) {
                    var values = Object.values(ctx.params);
                    var hasNull = false;
                    for (var i = 0; i < values.length; i++) {
                        if (values[i] === null || values[i] === undefined) {
                            hasNull = true;
                            break;
                        }
                    }
                    return {
                        passed: !hasNull,
                        risk: hasNull ? self.riskLevels.MEDIUM : self.riskLevels.LOW,
                        details: hasNull ? 'Params contain null/undefined values' : 'Params validated'
                    };
                }
                return { passed: true, risk: self.riskLevels.LOW, details: 'No params to validate' };
            }
        });
    }
    
    _buildDependencyGraph() {
        this.registerDependencies('BootManager', ['RuntimeKernel', 'EventBus', 'StorageEngine']);
        this.registerDependencies('StateSyncEngine', ['EventBus', 'StorageEngine']);
        this.registerDependencies('RuntimePolicyEngine', ['RuntimeGovernanceFoundation']);
        this.registerDependencies('RuntimePermissionSystem', ['RuntimePolicyEngine']);
        this.registerDependencies('RuntimeValidationSystem', ['RuntimePermissionSystem', 'RuntimePolicyEngine']);
        this.registerDependencies('AIEngine', ['KnowledgeGraph', 'EventBus']);
        this.registerDependencies('KnowledgeGraph', ['StorageEngine', 'EventBus']);
        this.registerDependencies('CognitiveEngine', ['AIEngine', 'KnowledgeGraph', 'StateSyncEngine']);
        this.registerDependencies('PerformanceDashboard', ['RuntimeMetricsCollector', 'EventBus']);
        this.registerDependencies('DevPanel', ['BootManager', 'StateSyncEngine', 'EventBus']);
    }
    
    _defineRiskProfiles() {
        this.riskProfiles.set('READ', { baseRisk: this.riskLevels.LOW, description: 'Read operations' });
        this.riskProfiles.set('ANALYZE', { baseRisk: this.riskLevels.LOW, description: 'Analysis operations' });
        this.riskProfiles.set('RECOMMEND', { baseRisk: this.riskLevels.LOW, description: 'Recommendation operations' });
        this.riskProfiles.set('MODIFY', { baseRisk: this.riskLevels.MEDIUM, description: 'Modification operations' });
        this.riskProfiles.set('EXECUTE', { baseRisk: this.riskLevels.HIGH, description: 'Execution operations' });
        this.riskProfiles.set('DELETE', { baseRisk: this.riskLevels.CRITICAL, description: 'Deletion operations' });
        this.riskProfiles.set('CONFIG_CHANGE', { baseRisk: this.riskLevels.HIGH, description: 'Configuration changes' });
        this.riskProfiles.set('SHUTDOWN', { baseRisk: this.riskLevels.CRITICAL, description: 'System shutdown' });
    }
    
    _getRelevantValidators(action, target, options) {
        var validators = Array.from(this.validators.values());
        
        if (options.specificTypes && options.specificTypes.length > 0) {
            validators = validators.filter(function(v) {
                return options.specificTypes.indexOf(v.type) !== -1;
            });
        }
        
        validators.sort(function(a, b) { return a.priority - b.priority; });
        
        return validators;
    }
    
    _runValidator(validator, context) {
        try {
            var result = validator.check(context);
            
            return {
                validatorId: validator.validatorId,
                name: validator.name,
                type: validator.type,
                passed: result.passed !== false,
                risk: result.risk || this.riskLevels.LOW,
                details: result.details || 'No details provided',
                warnings: result.warnings || [],
                errors: result.errors || [],
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('[ValidationSystem] Validator ' + validator.validatorId + ' failed:', error);
            
            return {
                validatorId: validator.validatorId,
                name: validator.name,
                type: validator.type,
                passed: false,
                risk: this.riskLevels.MEDIUM,
                details: 'Validator error: ' + error.message,
                errors: ['Validator ' + validator.name + ' threw an error'],
                timestamp: new Date().toISOString()
            };
        }
    }
    
    _collectRuntimeContext() {
        var context = {
            status: 'running',
            timestamp: new Date().toISOString(),
            modules: { loaded: [], count: 0 },
            health: { status: 'HEALTHY' },
            performance: { currentLoad: 0 },
            governance: { freezeActive: false }
        };
        
        try {
            if (window.LawAIApp && window.LawAIApp.BootManager) {
                var status = window.LawAIApp.BootManager.getStatus();
                context.status = (status && status.status) || 'unknown';
            }
            
            if (window.LawAIApp && window.LawAIApp.StateSyncEngine) {
                var state = window.LawAIApp.StateSyncEngine.getAll() || {};
                var loaded = [];
                var keys = Object.keys(state);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].indexOf('module.') === 0) loaded.push(keys[i]);
                }
                context.modules.loaded = loaded;
                context.modules.count = loaded.length;
            }
            
            if (window.LawAIApp && window.LawAIApp.RuntimePerformanceCollector && window.LawAIApp.RuntimePerformanceCollector.getCurrentLoad) {
                context.performance.currentLoad = window.LawAIApp.RuntimePerformanceCollector.getCurrentLoad() || 0;
            }
            
            if (window.LawAIApp && window.LawAIApp.Governance && window.LawAIApp.Governance.getReport) {
                var freezeCheck = window.LawAIApp.Governance.getReport();
                if (freezeCheck && freezeCheck.freezeActive) {
                    context.governance.freezeActive = true;
                }
            }
        } catch (e) {}
        
        return context;
    }
    
    _determineDecision(risk, hasErrors) {
        if (hasErrors) return this.decisions.REJECT;
        if (risk.level >= this.riskLevels.CRITICAL.level) return this.decisions.REJECT;
        if (risk.level >= this.riskLevels.HIGH.level) return this.decisions.REVIEW;
        if (risk.level >= this.riskLevels.MEDIUM.level) return this.decisions.REVIEW;
        return this.decisions.ALLOW;
    }
    
    _calculateOverallRisk(checks) {
        if (checks.length === 0) return this.riskLevels.LOW;
        
        var maxRisk = this.riskLevels.LOW;
        for (var i = 0; i < checks.length; i++) {
            if (checks[i].risk && checks[i].risk.level > maxRisk.level) {
                maxRisk = checks[i].risk;
            }
        }
        return maxRisk;
    }
    
    _generateRecommendation(risk, decision, checks) {
        var failedChecks = [];
        for (var i = 0; i < checks.length; i++) {
            if (!checks[i].passed) failedChecks.push(checks[i]);
        }
        
        if (decision === 'ALLOW') {
            return 'All validation checks passed. Action can proceed safely.';
        } else if (decision === 'REVIEW') {
            var reasons = [];
            for (var j = 0; j < failedChecks.length; j++) {
                reasons.push(failedChecks[j].details);
            }
            return 'Review required — Risk: ' + risk.label + '. Issues: ' + reasons.join('; ');
        } else {
            var reasons2 = [];
            for (var k = 0; k < failedChecks.length; k++) {
                reasons2.push(failedChecks[k].details);
            }
            return 'Action blocked — Risk: ' + risk.label + '. Issues: ' + reasons2.join('; ');
        }
    }
    
    _isModuleLoaded(moduleName) {
        try {
            if (window.LawAIApp && window.LawAIApp.StateSyncEngine) {
                var state = window.LawAIApp.StateSyncEngine.getAll() || {};
                var moduleState = state['module.' + moduleName];
                return moduleState && moduleState.loaded === true;
            }
        } catch (e) {}
        return false;
    }
    
    _getAffectedModules(moduleName) {
        var affected = [];
        var entries = Array.from(this.dependencyGraph.entries());
        
        for (var i = 0; i < entries.length; i++) {
            var mod = entries[i][0];
            var deps = entries[i][1];
            if (deps.indexOf(moduleName) !== -1) {
                affected.push(mod);
                var indirect = this._getAffectedModules(mod);
                for (var j = 0; j < indirect.length; j++) {
                    if (affected.indexOf(indirect[j]) === -1) affected.push(indirect[j]);
                }
            }
        }
        
        return affected;
    }
    
    _detectCircularDependencies(startModule, visited, path) {
        if (!visited) visited = new Set();
        if (!path) path = [];
        
        if (visited.has(startModule)) {
            var cycleStart = path.indexOf(startModule);
            return cycleStart >= 0 ? path.slice(cycleStart) : [];
        }
        
        visited.add(startModule);
        path.push(startModule);
        
        var deps = this.dependencyGraph.get(startModule) || [];
        
        for (var i = 0; i < deps.length; i++) {
            var cycle = this._detectCircularDependencies(deps[i], new Set(visited), path.slice());
            if (cycle.length > 0) return cycle;
        }
        
        return [];
    }
    
    _validateSchema(data, schema) {
        try {
            var keys = Object.keys(schema);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var expectedType = schema[key];
                if (data[key] === undefined) return false;
                if (typeof data[key] !== expectedType) return false;
            }
            return true;
        } catch (e) {
            return false;
        }
    }
    
    _recordValidation(result) {
        this.validationHistory.push(result);
        
        this.systemState.validationsByDecision[result.decision] = (this.systemState.validationsByDecision[result.decision] || 0) + 1;
        this.systemState.validationsByRisk[result.risk.label] = (this.systemState.validationsByRisk[result.risk.label] || 0) + 1;
        
        if (this.validationHistory.length > 500) {
            this.validationHistory = this.validationHistory.slice(-250);
        }
        
        this._audit('VALIDATION_COMPLETED', {
            validationId: result.validationId,
            decision: result.decision,
            risk: result.risk.label
        });
    }
    
    _emitValidationResult(result) {
        this._emitEvent('validationSystem.result', {
            validationId: result.validationId,
            action: result.request.action,
            decision: result.decision,
            risk: result.risk.label,
            checksPassed: result.checksSummary.passed,
            checksFailed: result.checksSummary.failed
        });
    }
    
    _audit(action, data) {
        if (!data) data = {};
        var auditEntry = { action: action, data: data, timestamp: new Date().toISOString(), version: this.version };
        this._emitEvent('validationSystem.audit', auditEntry);
    }
    
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            if (typeof emitFn === 'function') {
                emitFn.call(collector, {
                    type: type,
                    source: 'RuntimeValidationSystem',
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {}
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.RuntimeValidationSystem = new RuntimeValidationSystem();
    
    window.LawAIApp.Validation = {
        validate: function(request, options) { return window.LawAIApp.RuntimeValidationSystem.validate(request, options); },
        quickValidate: function(request) { return window.LawAIApp.RuntimeValidationSystem.quickValidate(request); },
        validateWithTypes: function(request, types) { return window.LawAIApp.RuntimeValidationSystem.validateWithTypes(request, types); },
        validateState: function() { return window.LawAIApp.RuntimeValidationSystem.validateState(); },
        validateDependencies: function(module) { return window.LawAIApp.RuntimeValidationSystem.validateDependencies(module); },
        validatePerformance: function(request) { return window.LawAIApp.RuntimeValidationSystem.validatePerformance(request); },
        validateData: function(dataContext) { return window.LawAIApp.RuntimeValidationSystem.validateData(dataContext); },
        validateSafety: function(request) { return window.LawAIApp.RuntimeValidationSystem.validateSafety(request); },
        registerValidator: function(def) { return window.LawAIApp.RuntimeValidationSystem.registerValidator(def); },
        registerDependencies: function(module, deps) { return window.LawAIApp.RuntimeValidationSystem.registerDependencies(module, deps); },
        getDependencyTree: function(module) { return window.LawAIApp.RuntimeValidationSystem.getDependencyTree(module); },
        getReport: function() { return window.LawAIApp.RuntimeValidationSystem.getReport(); },
        getHealth: function() { return window.LawAIApp.RuntimeValidationSystem.getHealth(); },
        getValidationHistory: function(limit) { return window.LawAIApp.RuntimeValidationSystem.getValidationHistory(limit); }
    };
}
