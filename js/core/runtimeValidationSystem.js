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
        
        // Validation stores
        this.validationHistory = [];
        this.validators = new Map();      // Registered validation checks
        this.riskProfiles = new Map();    // Risk profiles for different action types
        this.dependencyGraph = new Map(); // Module dependency tracking
        
        // Validation types
        this.validationTypes = {
            STATE: 'state',
            DEPENDENCY: 'dependency',
            PERFORMANCE: 'performance',
            DATA: 'data',
            SAFETY: 'safety'
        };
        
        // Risk levels
        this.riskLevels = {
            LOW: { level: 1, label: 'LOW', description: 'Safe to proceed', autoAllow: true },
            MEDIUM: { level: 2, label: 'MEDIUM', description: 'Requires confirmation', autoAllow: false },
            HIGH: { level: 3, label: 'HIGH', description: 'Requires human review', autoAllow: false },
            CRITICAL: { level: 4, label: 'CRITICAL', description: 'Execution blocked', autoAllow: false }
        };
        
        // Decision types
        this.decisions = {
            ALLOW: 'ALLOW',
            REVIEW: 'REVIEW',
            REJECT: 'REJECT'
        };
        
        // Sensitive modules that trigger higher risk
        this.criticalModules = [
            'BootManager',
            'StateSyncEngine',
            'RuntimeKernel',
            'StorageEngine',
            'EventBus'
        ];
        
        // System state
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
    
    /**
     * Initialize Validation System
     */
    init() {
        console.log('[ValidationSystem] Initializing...');
        
        // Register default validators
        this._registerDefaultValidators();
        
        // Build initial dependency graph
        this._buildDependencyGraph();
        
        // Define risk profiles
        this._defineRiskProfiles();
        
        this.systemState.initialized = true;
        
        console.log(`[ValidationSystem] Ready — ${this.validators.size} validators registered`);
        
        this._emitEvent('validationSystem.initialized', {
            version: this.version,
            validators: this.validators.size,
            riskProfiles: this.riskProfiles.size
        });
    }
    
    // ========== VALIDATOR REGISTRATION ==========
    
    /**
     * Register a custom validator
     * @param {Object} validatorDefinition
     * @returns {Object} Registered validator
     */
    registerValidator({ validatorId, name, type, check, priority = 10, metadata = {} }) {
        // Validate type
        const validTypes = Object.values(this.validationTypes);
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid validator type: ${type}. Must be one of: ${validTypes.join(', ')}`);
        }
        
        // Validate check is a function
        if (typeof check !== 'function') {
            throw new Error('Validator check must be a function');
        }
        
        const validator = {
            validatorId: validatorId || `VAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            type,
            check,          // (context, runtimeState) => { passed, risk, details }
            priority,
            metadata: {
                registeredAt: new Date().toISOString(),
                ...metadata
            },
            stats: {
                executions: 0,
                passed: 0,
                failed: 0,
                lastRun: null
            }
        };
        
        this.validators.set(validator.validatorId, validator);
        
        this._audit('VALIDATOR_REGISTERED', { validatorId: validator.validatorId, name, type });
        
        return validator;
    }
    
    // ========== CORE VALIDATION ==========
    
    /**
     * Validate an action request before execution
     * This is the main entry point for validation.
     * 
     * @param {Object} request - Action request to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    validate(request = {}, options = {}) {
        const startTime = performance.now();
        const validationId = `VALREQ-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        const {
            action,
            target,
            source,
            params = {},
            context = {}
        } = request;
        
        this.systemState.totalValidations++;
        this.systemState.lastValidation = new Date().toISOString();
        
        // Step 1: Collect runtime context
        const runtimeContext = this._collectRuntimeContext();
        
        // Step 2: Determine which validators to run
        const relevantValidators = this._getRelevantValidators(action, target, options);
        
        // Step 3: Run all validation checks
        const checks = [];
        let overallRisk = this.riskLevels.LOW;
        const warnings = [];
        const errors = [];
        
        for (const validator of relevantValidators) {
            const checkResult = this._runValidator(validator, {
                action,
                target,
                source,
                params,
                context,
                runtimeContext
            });
            
            checks.push(checkResult);
            
            validator.stats.executions++;
            validator.stats.lastRun = new Date().toISOString();
            
            if (checkResult.passed) {
                validator.stats.passed++;
            } else {
                validator.stats.failed++;
            }
            
            // Collect warnings
            if (checkResult.warnings?.length > 0) {
                warnings.push(...checkResult.warnings);
            }
            
            // Collect errors
            if (checkResult.errors?.length > 0) {
                errors.push(...checkResult.errors);
            }
            
            // Track highest risk level
            if (checkResult.risk && checkResult.risk.level > overallRisk.level) {
                overallRisk = checkResult.risk;
            }
        }
        
        // Step 4: Determine decision based on risk
        const decision = this._determineDecision(overallRisk, errors.length > 0);
        
        // Step 5: Build validation result
        const result = {
            validationId,
            request: { action, target, source, params },
            checks,
            checksSummary: {
                total: checks.length,
                passed: checks.filter(c => c.passed).length,
                failed: checks.filter(c => !c.passed).length,
                warnings: warnings.length,
                errors: errors.length
            },
            risk: overallRisk,
            decision,
            warnings: warnings.length > 0 ? warnings : undefined,
            errors: errors.length > 0 ? errors : undefined,
            recommendation: this._generateRecommendation(overallRisk, decision, checks),
            context: runtimeContext,
            evaluationTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            timestamp: new Date().toISOString(),
            systemVersion: this.version
        };
        
        // Step 6: Record and emit
        this._recordValidation(result);
        this._emitValidationResult(result);
        
        return result;
    }
    
    /**
     * Quick validation — returns simple pass/fail
     * @param {Object} request
     * @returns {Object} { valid, decision, risk, reason }
     */
    quickValidate(request = {}) {
        const result = this.validate(request);
        
        return {
            valid: result.decision === 'ALLOW',
            decision: result.decision,
            risk: result.risk.label,
            reason: result.recommendation,
            checksRun: result.checksSummary.total,
            checksFailed: result.checksSummary.failed
        };
    }
    
    /**
     * Validate with specific check types only
     * @param {Object} request
     * @param {Array} checkTypes - e.g., ['state', 'safety']
     * @returns {Object}
     */
    validateWithTypes(request = {}, checkTypes = []) {
        return this.validate(request, { specificTypes: checkTypes });
    }
    
    // ========== SPECIFIC VALIDATION METHODS ==========
    
    /**
     * Validate state consistency
     * @returns {Object}
     */
    validateState() {
        const runtimeContext = this._collectRuntimeContext();
        const checks = [];
        
        // Check 1: Core modules loaded
        const coreModules = ['BootManager', 'RuntimeKernel', 'EventBus'];
        const loadedModules = runtimeContext.modules?.loaded || [];
        const missingCore = coreModules.filter(m => !loadedModules.includes(m));
        
        checks.push({
            type: 'STATE',
            name: 'Core Module Check',
            passed: missingCore.length === 0,
            risk: missingCore.length > 0 ? this.riskLevels.CRITICAL : this.riskLevels.LOW,
            details: missingCore.length > 0 
                ? `Missing core modules: ${missingCore.join(', ')}`
                : 'All core modules loaded'
        });
        
        // Check 2: System health
        const healthStatus = runtimeContext.health?.status || 'UNKNOWN';
        checks.push({
            type: 'STATE',
            name: 'System Health Check',
            passed: healthStatus === 'HEALTHY' || healthStatus === 'running',
            risk: healthStatus === 'CRITICAL' ? this.riskLevels.CRITICAL : 
                  healthStatus === 'WARNING' ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
            details: `System health: ${healthStatus}`
        });
        
        return {
            checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate dependencies for a module
     * @param {string} moduleName
     * @returns {Object}
     */
    validateDependencies(moduleName) {
        const dependencies = this.dependencyGraph.get(moduleName) || [];
        const checks = [];
        
        // Check direct dependencies
        for (const dep of dependencies) {
            const depLoaded = this._isModuleLoaded(dep);
            checks.push({
                type: 'DEPENDENCY',
                name: `Dependency: ${moduleName} → ${dep}`,
                passed: depLoaded,
                risk: depLoaded ? this.riskLevels.LOW : 
                      this.criticalModules.includes(dep) ? this.riskLevels.CRITICAL : this.riskLevels.HIGH,
                details: depLoaded ? `${dep} is loaded` : `${dep} is NOT loaded`
            });
        }
        
        // Check circular dependencies
        const circularDeps = this._detectCircularDependencies(moduleName);
        if (circularDeps.length > 0) {
            checks.push({
                type: 'DEPENDENCY',
                name: 'Circular Dependency Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: `Circular dependencies detected: ${circularDeps.join(' → ')}`,
                warnings: ['Circular dependencies may cause initialization issues']
            });
        }
        
        // Check affected modules (reverse dependencies)
        const affectedModules = this._getAffectedModules(moduleName);
        if (affectedModules.length > 0) {
            checks.push({
                type: 'DEPENDENCY',
                name: 'Affected Modules Check',
                passed: true, // Informational
                risk: affectedModules.length > 10 ? this.riskLevels.HIGH :
                      affectedModules.length > 5 ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
                details: `${affectedModules.length} modules depend on ${moduleName}: ${affectedModules.join(', ')}`
            });
        }
        
        return {
            moduleName,
            checks,
            dependencies,
            affectedModules,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate performance impact of an action
     * @param {Object} request
     * @returns {Object}
     */
    validatePerformance(request = {}) {
        const checks = [];
        
        // Check estimated resource usage
        if (request.estimatedCost) {
            const cost = request.estimatedCost;
            checks.push({
                type: 'PERFORMANCE',
                name: 'Resource Cost Check',
                passed: cost < 200,
                risk: cost > 500 ? this.riskLevels.CRITICAL :
                      cost > 200 ? this.riskLevels.HIGH :
                      cost > 100 ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
                details: `Estimated resource cost: ${cost} units`
            });
        }
        
        // Check if system is under load
        const runtimeContext = this._collectRuntimeContext();
        const currentLoad = runtimeContext.performance?.currentLoad || 0;
        
        if (currentLoad > 80) {
            checks.push({
                type: 'PERFORMANCE',
                name: 'System Load Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: `System under high load (${currentLoad}%) — action may degrade performance`,
                warnings: [`Current system load is ${currentLoad}%`]
            });
        }
        
        return {
            checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate data integrity
     * @param {Object} dataContext
     * @returns {Object}
     */
    validateData(dataContext = {}) {
        const checks = [];
        
        // Check data structure
        if (dataContext.schema && dataContext.data) {
            const schemaValid = this._validateSchema(dataContext.data, dataContext.schema);
            checks.push({
                type: 'DATA',
                name: 'Data Schema Check',
                passed: schemaValid,
                risk: schemaValid ? this.riskLevels.LOW : this.riskLevels.HIGH,
                details: schemaValid ? 'Data matches schema' : 'Data schema validation failed'
            });
        }
        
        // Check data size
        if (dataContext.size) {
            const sizeLimit = dataContext.sizeLimit || 1024 * 1024; // Default 1MB
            checks.push({
                type: 'DATA',
                name: 'Data Size Check',
                passed: dataContext.size <= sizeLimit,
                risk: dataContext.size > sizeLimit * 2 ? this.riskLevels.HIGH :
                      dataContext.size > sizeLimit ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
                details: `Data size: ${(dataContext.size / 1024).toFixed(1)}KB (limit: ${(sizeLimit / 1024).toFixed(1)}KB)`
            });
        }
        
        return {
            checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Validate safety boundaries
     * @param {Object} request
     * @returns {Object}
     */
    validateSafety(request = {}) {
        const checks = [];
        const runtimeContext = this._collectRuntimeContext();
        
        // Check if action targets critical module
        if (request.target && this.criticalModules.includes(request.target)) {
            checks.push({
                type: 'SAFETY',
                name: 'Critical Module Protection',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: `Target "${request.target}" is a critical system module`,
                warnings: ['Modifying critical modules may destabilize the system']
            });
        }
        
        // Check if action is destructive
        const destructiveActions = ['DELETE', 'SHUTDOWN', 'UNLOAD', 'RESET', 'DESTROY'];
        if (request.action && destructiveActions.some(a => request.action.toUpperCase().includes(a))) {
            checks.push({
                type: 'SAFETY',
                name: 'Destructive Action Check',
                passed: false,
                risk: this.riskLevels.CRITICAL,
                details: `Action "${request.action}" is potentially destructive`,
                warnings: ['Destructive actions require explicit approval']
            });
        }
        
        // Check runtime freeze status
        if (runtimeContext.governance?.freezeActive) {
            checks.push({
                type: 'SAFETY',
                name: 'Runtime Freeze Check',
                passed: false,
                risk: this.riskLevels.CRITICAL,
                details: 'Runtime is currently frozen — modifications are blocked',
                warnings: ['Runtime freeze is active. Unfreeze before making changes.']
            });
        }
        
        // Check if action affects multiple modules
        const affectedModules = request.target ? this._getAffectedModules(request.target) : [];
        if (affectedModules.length > 15) {
            checks.push({
                type: 'SAFETY',
                name: 'Wide Impact Check',
                passed: false,
                risk: this.riskLevels.HIGH,
                details: `Action affects ${affectedModules.length} modules — wide impact`,
                warnings: [`${affectedModules.length} modules will be affected by this action`]
            });
        }
        
        return {
            checks,
            overallRisk: this._calculateOverallRisk(checks),
            timestamp: new Date().toISOString()
        };
    }
    
    // ========== DEPENDENCY MANAGEMENT ==========
    
    /**
     * Register a dependency relationship
     * @param {string} module - Module name
     * @param {Array} dependencies - Array of dependency module names
     */
    registerDependencies(module, dependencies = []) {
        this.dependencyGraph.set(module, [...dependencies]);
        
        this._audit('DEPENDENCIES_REGISTERED', { module, dependencies });
    }
    
    /**
     * Get module dependency tree
     * @param {string} moduleName
     * @returns {Object}
     */
    getDependencyTree(moduleName) {
        const direct = this.dependencyGraph.get(moduleName) || [];
        const reverse = this._getAffectedModules(moduleName);
        
        return {
            module: moduleName,
            dependsOn: direct,
            dependedBy: reverse,
            isCritical: this.criticalModules.includes(moduleName),
            totalConnections: direct.length + reverse.length
        };
    }
    
    // ========== REPORTING ==========
    
    /**
     * Get validation system report
     * @returns {Object}
     */
    getReport() {
        const validatorsByType = {};
        for (const type of Object.values(this.validationTypes)) {
            validatorsByType[type] = Array.from(this.validators.values())
                .filter(v => v.type === type).length;
        }
        
        return {
            version: this.version,
            status: this.systemState.systemHealth,
            validators: {
                total: this.validators.size,
                byType: validatorsByType
            },
            validations: {
                total: this.systemState.totalValidations,
                byDecision: this.systemState.validationsByDecision,
                byRisk: this.systemState.validationsByRisk
            },
            dependencyGraph: {
                modules: this.dependencyGraph.size,
                criticalModules: this.criticalModules
            },
            riskLevels: Object.values(this.riskLevels).map(r => ({
                level: r.level,
                label: r.label,
                description: r.description,
                autoAllow: r.autoAllow
            })),
            rules: [
                'Rule 1: Validation must be context-based ✅',
                'Rule 2: High risk actions must not auto-execute ✅',
                'Rule 3: Validation results must be recorded ✅',
                'Rule 4: Validation failure must not break runtime ✅'
            ],
            recentValidations: this.validationHistory.slice(-10)
        };
    }
    
    /**
     * Get validation system health
     * @returns {Object}
     */
    getHealth() {
        const rejectRate = this.systemState.totalValidations > 0
            ? this.systemState.validationsByDecision.REJECT / this.systemState.totalValidations
            : 0;
        
        let health = 'HEALTHY';
        if (rejectRate > 0.3) health = 'RESTRICTIVE';
        if (!this.systemState.initialized) health = 'NOT_INITIALIZED';
        
        this.systemState.systemHealth = health;
        
        return {
            status: health,
            version: this.version,
            validators: this.validators.size,
            totalValidations: this.systemState.totalValidations,
            rejectRate: `${(rejectRate * 100).toFixed(1)}%`,
            lastValidation: this.systemState.lastValidation,
            isOperational: true // Rule 4
        };
    }
    
    /**
     * Get validation history
     * @param {number} limit
     * @returns {Array}
     */
    getValidationHistory(limit = 50) {
        return this.validationHistory.slice(-limit);
    }
    
    // ========== PRIVATE METHODS ==========
    
    /**
     * Register default validators
     */
    _registerDefaultValidators() {
        // State validator
        this.registerValidator({
            validatorId: 'VAL-STATE-001',
            name: 'Runtime State Check',
            type: 'state',
            priority: 1, // Run first
            check: (ctx) => {
                const runtimeCtx = ctx.runtimeContext;
                const passed = runtimeCtx?.status === 'running' || runtimeCtx?.status === 'ready';
                return {
                    passed,
                    risk: passed ? this.riskLevels.LOW : this.riskLevels.CRITICAL,
                    details: `Runtime status: ${runtimeCtx?.status || 'UNKNOWN'}`
                };
            }
        });
        
        // Dependency validator
        this.registerValidator({
            validatorId: 'VAL-DEP-001',
            name: 'Module Dependency Check',
            type: 'dependency',
            priority: 5,
            check: (ctx) => {
                if (!ctx.target) {
                    return { passed: true, risk: this.riskLevels.LOW, details: 'No target module specified' };
                }
                
                const deps = this.dependencyGraph.get(ctx.target) || [];
                const missing = deps.filter(d => !this._isModuleLoaded(d));
                
                return {
                    passed: missing.length === 0,
                    risk: missing.length > 0 ? 
                        (this.criticalModules.some(m => missing.includes(m)) ? 
                            this.riskLevels.CRITICAL : this.riskLevels.HIGH) 
                        : this.riskLevels.LOW,
                    details: missing.length > 0 
                        ? `Missing dependencies: ${missing.join(', ')}` 
                        : 'All dependencies satisfied',
                    warnings: missing.length > 0 ? [`Missing ${missing.length} dependencies`] : []
                };
            }
        });
        
        // Safety validator
        this.registerValidator({
            validatorId: 'VAL-SAF-001',
            name: 'Critical Module Protection',
            type: 'safety',
            priority: 3,
            check: (ctx) => {
                if (ctx.target && this.criticalModules.includes(ctx.target)) {
                    return {
                        passed: ctx.source === 'SUB-DEV-001' || ctx.source === 'SUB-SYS-001',
                        risk: this.riskLevels.HIGH,
                        details: `Target "${ctx.target}" is a critical module — requires elevated permissions`,
                        warnings: [`Critical module "${ctx.target}" — proceed with caution`]
                    };
                }
                return { passed: true, risk: this.riskLevels.LOW, details: 'Target is not critical' };
            }
        });
        
        // Performance validator
        this.registerValidator({
            validatorId: 'VAL-PERF-001',
            name: 'System Load Check',
            type: 'performance',
            priority: 10,
            check: (ctx) => {
                const load = ctx.runtimeContext?.performance?.currentLoad || 0;
                const passed = load < 80;
                return {
                    passed,
                    risk: load > 90 ? this.riskLevels.CRITICAL :
                          load > 80 ? this.riskLevels.HIGH :
                          load > 60 ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
                    details: `System load: ${load}%`,
                    warnings: load > 80 ? [`High system load (${load}%) — performance may degrade`] : []
                };
            }
        });
        
        // Data validator
        this.registerValidator({
            validatorId: 'VAL-DATA-001',
            name: 'Data Integrity Check',
            type: 'data',
            priority: 15,
            check: (ctx) => {
                // Check if params contain valid data
                if (ctx.params && Object.keys(ctx.params).length > 0) {
                    const hasNullValues = Object.values(ctx.params).some(v => v === null || v === undefined);
                    return {
                        passed: !hasNullValues,
                        risk: hasNullValues ? this.riskLevels.MEDIUM : this.riskLevels.LOW,
                        details: hasNullValues ? 'Params contain null/undefined values' : 'Params validated'
                    };
                }
                return { passed: true, risk: this.riskLevels.LOW, details: 'No params to validate' };
            }
        });
    }
    
    /**
     * Build initial dependency graph
     */
    _buildDependencyGraph() {
        // Core module dependencies
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
    
    /**
     * Define risk profiles for different action types
     */
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
    
    /**
     * Get validators relevant to a specific action
     */
    _getRelevantValidators(action, target, options = {}) {
        let validators = Array.from(this.validators.values());
        
        // Filter by specific types if requested
        if (options.specificTypes && options.specificTypes.length > 0) {
            validators = validators.filter(v => options.specificTypes.includes(v.type));
        }
        
        // Sort by priority
        validators.sort((a, b) => a.priority - b.priority);
        
        return validators;
    }
    
    /**
     * Run a single validator
     */
    _runValidator(validator, context) {
        try {
            const result = validator.check(context);
            
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
            // Rule 4: Validator failure doesn't break runtime
            console.error(`[ValidationSystem] Validator ${validator.validatorId} failed:`, error);
            
            return {
                validatorId: validator.validatorId,
                name: validator.name,
                type: validator.type,
                passed: false,
                risk: this.riskLevels.MEDIUM,
                details: `Validator error: ${error.message}`,
                errors: [`Validator ${validator.name} threw an error`],
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Collect current runtime context
     */
    _collectRuntimeContext() {
        const context = {
            status: 'running',
            timestamp: new Date().toISOString(),
            modules: {
                loaded: [],
                count: 0
            },
            health: {
                status: 'HEALTHY'
            },
            performance: {
                currentLoad: 0
            },
            governance: {
                freezeActive: false
            }
        };
        
        // Try to get real data from runtime
        try {
            if (window.LawAIApp?.BootManager) {
                context.status = window.LawAIApp.BootManager.getStatus()?.status || 'unknown';
            }
            
            if (window.LawAIApp?.StateSyncEngine) {
                const state = window.LawAIApp.StateSyncEngine.getAll() || {};
                context.modules.loaded = Object.keys(state).filter(k => k.startsWith('module.'));
                context.modules.count = context.modules.length;
            }
            
            if (window.LawAIApp?.RuntimePerformanceCollector) {
                context.performance.currentLoad = 
                    window.LawAIApp.RuntimePerformanceCollector.getCurrentLoad?.() || 0;
            }
            
            // Check freeze status
            const freezeCheck = window.LawAIApp?.Governance?.getReport?.();
            if (freezeCheck?.freezeActive) {
                context.governance.freezeActive = true;
            }
        } catch (e) {
            // Use defaults if real data unavailable
        }
        
        return context;
    }
    
    /**
     * Determine decision based on risk level and errors
     */
    _determineDecision(risk, hasErrors) {
        if (hasErrors) return this.decisions.REJECT;
        if (risk.level >= this.riskLevels.CRITICAL.level) return this.decisions.REJECT;
        if (risk.level >= this.riskLevels.HIGH.level) return this.decisions.REVIEW;
        if (risk.level >= this.riskLevels.MEDIUM.level) return this.decisions.REVIEW;
        return this.decisions.ALLOW;
    }
    
    /**
     * Calculate overall risk from multiple checks
     */
    _calculateOverallRisk(checks) {
        if (checks.length === 0) return this.riskLevels.LOW;
        
        let maxRisk = this.riskLevels.LOW;
        
        for (const check of checks) {
            if (check.risk && check.risk.level > maxRisk.level) {
                maxRisk = check.risk;
            }
        }
        
        return maxRisk;
    }
    
    /**
     * Generate human-readable recommendation
     */
    _generateRecommendation(risk, decision, checks) {
        const failedChecks = checks.filter(c => !c.passed);
        
        if (decision === 'ALLOW') {
            return 'All validation checks passed. Action can proceed safely.';
        } else if (decision === 'REVIEW') {
            const reasons = failedChecks.map(c => c.details).join('; ');
            return `Review required — Risk: ${risk.label}. Issues: ${reasons}`;
        } else {
            const reasons = failedChecks.map(c => c.details).join('; ');
            return `Action blocked — Risk: ${risk.label}. Issues: ${reasons}`;
        }
    }
    
    /**
     * Check if a module is loaded
     */
    _isModuleLoaded(moduleName) {
        try {
            const state = window.LawAIApp?.StateSyncEngine?.getAll() || {};
            const moduleState = state[`module.${moduleName}`];
            return moduleState?.loaded === true;
        } catch {
            return false;
        }
    }
    
    /**
     * Get modules that depend on a given module
     */
    _getAffectedModules(moduleName) {
        const affected = [];
        
        for (const [mod, deps] of this.dependencyGraph) {
            if (deps.includes(moduleName)) {
                affected.push(mod);
                // Recursively find indirect dependents
                const indirect = this._getAffectedModules(mod);
                affected.push(...indirect.filter(m => !affected.includes(m)));
            }
        }
        
        return [...new Set(affected)];
    }
    
    /**
     * Detect circular dependencies
     */
    _detectCircularDependencies(startModule, visited = new Set(), path = []) {
        if (visited.has(startModule)) {
            const cycleStart = path.indexOf(startModule);
            return cycleStart >= 0 ? path.slice(cycleStart) : [];
        }
        
        visited.add(startModule);
        path.push(startModule);
        
        const deps = this.dependencyGraph.get(startModule) || [];
        
        for (const dep of deps) {
            const cycle = this._detectCircularDependencies(dep, new Set(visited), [...path]);
            if (cycle.length > 0) return cycle;
        }
        
        return [];
    }
    
    /**
     * Simple schema validation
     */
    _validateSchema(data, schema) {
        try {
            for (const [key, expectedType] of Object.entries(schema)) {
                if (data[key] === undefined) return false;
                if (typeof data[key] !== expectedType) return false;
            }
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Record validation result
     */
    _recordValidation(result) {
        this.validationHistory.push(result);
        
        // Update counters
        this.systemState.validationsByDecision[result.decision] = 
            (this.systemState.validationsByDecision[result.decision] || 0) + 1;
        this.systemState.validationsByRisk[result.risk.label] = 
            (this.systemState.validationsByRisk[result.risk.label] || 0) + 1;
        
        // Keep history manageable
        if (this.validationHistory.length > 500) {
            this.validationHistory = this.validationHistory.slice(-250);
        }
        
        this._audit('VALIDATION_COMPLETED', {
            validationId: result.validationId,
            decision: result.decision,
            risk: result.risk.label
        });
    }
    
    /**
     * Emit validation result
     */
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
    
    /**
     * Audit an action
     */
    _audit(action, data = {}) {
        const auditEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this._emitEvent('validationSystem.audit', auditEntry);
    }
    
    /**
     * Emit runtime event
     */
    _emitEvent(type, data) {
        if (window.LawAIApp?.RuntimeEventCollector) {
            try {
                window.LawAIApp.RuntimeEventCollector.emit({
                    type,
                    source: 'RuntimeValidationSystem',
                    data
                });
            } catch (e) {
                // Rule 4: Event emission failure doesn't affect runtime
            }
        }
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.RuntimeValidationSystem = new RuntimeValidationSystem();
    
    // API shortcuts
    window.LawAIApp.Validation = {
        // Main validation
        validate: (request, options) => window.LawAIApp.RuntimeValidationSystem.validate(request, options),
        quickValidate: (request) => window.LawAIApp.RuntimeValidationSystem.quickValidate(request),
        validateWithTypes: (request, types) => window.LawAIApp.RuntimeValidationSystem.validateWithTypes(request, types),
        
        // Specific validations
        validateState: () => window.LawAIApp.RuntimeValidationSystem.validateState(),
        validateDependencies: (module) => window.LawAIApp.RuntimeValidationSystem.validateDependencies(module),
        validatePerformance: (request) => window.LawAIApp.RuntimeValidationSystem.validatePerformance(request),
        validateData: (dataContext) => window.LawAIApp.RuntimeValidationSystem.validateData(dataContext),
        validateSafety: (request) => window.LawAIApp.RuntimeValidationSystem.validateSafety(request),
        
        // Validator management
        registerValidator: (def) => window.LawAIApp.RuntimeValidationSystem.registerValidator(def),
        
        // Dependency management
        registerDependencies: (module, deps) => window.LawAIApp.RuntimeValidationSystem.registerDependencies(module, deps),
        getDependencyTree: (module) => window.LawAIApp.RuntimeValidationSystem.getDependencyTree(module),
        
        // Reporting
        getReport: () => window.LawAIApp.RuntimeValidationSystem.getReport(),
        getHealth: () => window.LawAIApp.RuntimeValidationSystem.getHealth(),
        getValidationHistory: (limit) => window.LawAIApp.RuntimeValidationSystem.getValidationHistory(limit)
    };
}

export default RuntimeValidationSystem;
