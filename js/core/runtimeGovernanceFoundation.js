/**
 * Runtime Governance Foundation
 * Part 49.1 — V4.9.1
 * 
 * Governance Layer for Cognitive Runtime:
 * - Rule Management
 * - Policy Management
 * - Validation
 * - Decision Control
 * - Audit Support
 * 
 * Principles:
 * 1. Runtime behavior must be explainable
 * 2. Critical operations must be validated
 * 3. Rules must be traceable
 * 4. Governance failure must not affect runtime basics
 */

class RuntimeGovernanceFoundation {
    constructor() {
        this.version = '4.9.1';
        this.status = 'ACTIVE';
        
        // Governance data stores
        this.rules = new Map();
        this.policies = new Map();
        this.decisions = [];
        this.violations = [];
        
        // Governance state
        this.governanceState = {
            initialized: false,
            totalRules: 0,
            activeRules: 0,
            totalPolicies: 0,
            activePolicies: 0,
            lastAuditTimestamp: null,
            governanceHealth: 'HEALTHY'
        };
        
        // Rule types defined in scope
        this.ruleTypes = [
            'AI_DECISION',
            'RUNTIME_CHANGE',
            'MODULE_OPERATION',
            'DATA_ACCESS',
            'AUTOMATION_ACTION'
        ];
        
        // Rule priorities
        this.priorities = {
            CRITICAL: 1,
            HIGH: 2,
            MEDIUM: 3,
            LOW: 4
        };
        
        // Rule statuses
        this.ruleStatuses = {
            ACTIVE: 'active',
            DISABLED: 'disabled',
            DEPRECATED: 'deprecated',
            PENDING: 'pending'
        };
        
        this.init();
    }
    
    /**
     * Initialize Governance Foundation
     */
    init() {
        console.log('[Governance] Foundation initializing...');
        
        // Load built-in governance rules
        this._loadDefaultRules();
        
        this.governanceState.initialized = true;
        this.governanceState.totalRules = this.rules.size;
        this.governanceState.activeRules = this._countActiveRules();
        
        console.log(`[Governance] Foundation ready — ${this.governanceState.activeRules}/${this.governanceState.totalRules} rules active`);
        
        // Emit governance ready event
        if (window.LawAIApp?.RuntimeEventCollector) {
            window.LawAIApp.RuntimeEventCollector.emit({
                type: 'governance.initialized',
                source: 'RuntimeGovernanceFoundation',
                data: {
                    version: this.version,
                    rules: this.governanceState.totalRules
                }
            });
        }
    }
    
    /**
     * Create a governance rule
     * @param {Object} ruleDefinition
     * @returns {Object} Created rule
     */
    createRule({ id, type, name, description, condition, action, priority = 'MEDIUM', metadata = {} }) {
        // Validate type
        if (!this.ruleTypes.includes(type)) {
            throw new Error(`Invalid rule type: ${type}. Must be one of: ${this.ruleTypes.join(', ')}`);
        }
        
        const rule = {
            id: id || `GOV-RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            name,
            description,
            condition,       // Function that returns boolean
            action,          // Function to execute if condition fails
            priority: this.priorities[priority] || this.priorities.MEDIUM,
            status: this.ruleStatuses.ACTIVE,
            metadata: {
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                category: metadata.category || 'general',
                scope: metadata.scope || ['*'],
                version: '1.0.0',
                ...metadata
            },
            stats: {
                evaluations: 0,
                violations: 0,
                lastEvaluated: null,
                lastViolation: null
            }
        };
        
        this.rules.set(rule.id, rule);
        this.governanceState.totalRules = this.rules.size;
        this.governanceState.activeRules = this._countActiveRules();
        
        // Audit the rule creation
        this._auditAction('RULE_CREATED', { ruleId: rule.id, type: rule.type });
        
        return rule;
    }
    
    /**
     * Evaluate a rule against a context
     * @param {string} ruleId - Rule ID to evaluate
     * @param {Object} context - Context to evaluate against
     * @returns {Object} Evaluation result
     */
    evaluateRule(ruleId, context = {}) {
        const rule = this.rules.get(ruleId);
        
        if (!rule) {
            return { 
                passed: false, 
                error: `Rule ${ruleId} not found`,
                timestamp: new Date().toISOString()
            };
        }
        
        if (rule.status !== this.ruleStatuses.ACTIVE) {
            return { 
                passed: true, 
                skipped: true, 
                reason: `Rule ${ruleId} is ${rule.status}`,
                timestamp: new Date().toISOString()
            };
        }
        
        rule.stats.evaluations++;
        rule.stats.lastEvaluated = new Date().toISOString();
        
        try {
            const passed = rule.condition(context);
            
            const result = {
                passed,
                ruleId: rule.id,
                ruleName: rule.name,
                ruleType: rule.type,
                priority: rule.priority,
                timestamp: new Date().toISOString(),
                context: context,
                recommendation: passed ? null : (rule.metadata.recommendation || 'Review the violation'),
                metadata: rule.metadata
            };
            
            if (!passed) {
                rule.stats.violations++;
                rule.stats.lastViolation = new Date().toISOString();
                
                // Execute action if rule failed
                if (rule.action) {
                    try {
                        rule.action(context, result);
                    } catch (actionError) {
                        console.error(`[Governance] Rule ${ruleId} action failed:`, actionError);
                        result.actionError = actionError.message;
                    }
                }
                
                // Record violation
                this._recordViolation(rule, context, result);
            }
            
            return result;
            
        } catch (evalError) {
            console.error(`[Governance] Rule ${ruleId} evaluation failed:`, evalError);
            
            return {
                passed: false,
                error: evalError.message,
                ruleId: rule.id,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Evaluate all active rules
     * @param {Object} context
     * @returns {Object} Evaluation results summary
     */
    evaluateAll(context = {}) {
        const results = [];
        let passed = 0;
        let failed = 0;
        let skipped = 0;
        
        for (const [ruleId, rule] of this.rules) {
            if (rule.status === this.ruleStatuses.ACTIVE) {
                const result = this.evaluateRule(ruleId, context);
                results.push(result);
                
                if (result.skipped) {
                    skipped++;
                } else if (result.passed) {
                    passed++;
                } else {
                    failed++;
                }
            }
        }
        
        return {
            total: results.length,
            passed,
            failed,
            skipped,
            results,
            timestamp: new Date().toISOString(),
            governanceVersion: this.version
        };
    }
    
    /**
     * Check if an action is allowed by governance
     * @param {string} actionType - Type of action (from ruleTypes)
     * @param {Object} context - Action context
     * @returns {boolean} Whether action is allowed
     */
    isActionAllowed(actionType, context = {}) {
        const relevantRules = Array.from(this.rules.values())
            .filter(rule => 
                rule.type === actionType && 
                rule.status === this.ruleStatuses.ACTIVE
            )
            .sort((a, b) => a.priority - b.priority); // Higher priority first
        
        const violations = [];
        
        for (const rule of relevantRules) {
            const result = this.evaluateRule(rule.id, { actionType, ...context });
            
            if (!result.passed && !result.skipped) {
                violations.push(result);
                
                // CRITICAL violations immediately block
                if (rule.priority === this.priorities.CRITICAL) {
                    this._auditAction('ACTION_BLOCKED', {
                        actionType,
                        ruleId: rule.id,
                        reason: 'CRITICAL rule violation'
                    });
                    
                    return {
                        allowed: false,
                        blockedBy: rule.id,
                        violations,
                        timestamp: new Date().toISOString()
                    };
                }
            }
        }
        
        return {
            allowed: violations.length === 0,
            violations,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Get governance report
     * @returns {Object} Governance state report
     */
    getReport() {
        return {
            version: this.version,
            status: this.governanceState.governanceHealth,
            rules: {
                total: this.governanceState.totalRules,
                active: this.governanceState.activeRules,
                byType: this._getRulesByType(),
                byPriority: this._getRulesByPriority()
            },
            violations: {
                total: this.violations.length,
                recent: this.violations.slice(-10)
            },
            lastAudit: this.governanceState.lastAuditTimestamp,
            principles: [
                'Runtime behavior must be explainable',
                'Critical operations must be validated',
                'Rules must be traceable',
                'Governance failure must not affect runtime basics'
            ]
        };
    }
    
    /**
     * Get governance health
     * @returns {Object} Health status
     */
    getHealth() {
        const violationRate = this.violations.length / Math.max(this.governanceState.totalRules, 1);
        
        let healthStatus = 'HEALTHY';
        if (violationRate > 0.5) healthStatus = 'CRITICAL';
        else if (violationRate > 0.3) healthStatus = 'WARNING';
        
        this.governanceState.governanceHealth = healthStatus;
        
        return {
            status: healthStatus,
            version: this.version,
            activeRules: this.governanceState.activeRules,
            totalViolations: this.violations.length,
            violationRate: `${(violationRate * 100).toFixed(2)}%`,
            isOperational: true // Principle 4: Governance failure doesn't affect runtime
        };
    }
    
    // ========== PRIVATE METHODS ==========
    
    /**
     * Load default governance rules
     */
    _loadDefaultRules() {
        // Rule: AI decisions must have confidence threshold
        this.createRule({
            id: 'GOV-001',
            type: 'AI_DECISION',
            name: 'AI Confidence Threshold',
            description: 'AI decisions must exceed minimum confidence level',
            condition: (context) => {
                return !context.confidence || context.confidence >= 0.7;
            },
            action: (context, result) => {
                console.warn('[Governance] AI decision blocked: Low confidence', context);
            },
            priority: 'HIGH',
            metadata: {
                category: 'ai-safety',
                threshold: 0.7,
                recommendation: 'Increase confidence above 0.7'
            }
        });
        
        // Rule: Runtime changes must be logged
        this.createRule({
            id: 'GOV-002',
            type: 'RUNTIME_CHANGE',
            name: 'Runtime Change Logging',
            description: 'All runtime state changes must be logged and traceable',
            condition: (context) => {
                return context.changeLogged === true || context.source !== undefined;
            },
            priority: 'CRITICAL',
            metadata: {
                category: 'audit',
                recommendation: 'Log the change before execution'
            }
        });
        
        // Rule: Module operations must have valid source
        this.createRule({
            id: 'GOV-003',
            type: 'MODULE_OPERATION',
            name: 'Module Source Validation',
            description: 'Module operations must originate from valid source',
            condition: (context) => {
                const validSources = ['BootManager', 'GovernanceLayer', 'SystemAPI', 'AuthorizedModule'];
                return validSources.includes(context.source);
            },
            priority: 'MEDIUM',
            metadata: {
                category: 'security',
                validSources: ['BootManager', 'GovernanceLayer', 'SystemAPI', 'AuthorizedModule'],
                recommendation: 'Use authorized module operation channels'
            }
        });
        
        // Rule: Data access requires authorization
        this.createRule({
            id: 'GOV-004',
            type: 'DATA_ACCESS',
            name: 'Data Access Authorization',
            description: 'Data access must have proper authorization token',
            condition: (context) => {
                return context.authorized === true || context.isPublicData === true;
            },
            priority: 'HIGH',
            metadata: {
                category: 'security',
                recommendation: 'Request proper authorization before data access'
            }
        });
        
        // Rule: Automation actions need approval
        this.createRule({
            id: 'GOV-005',
            type: 'AUTOMATION_ACTION',
            name: 'Automation Action Approval',
            description: 'Automated actions must have approval or be whitelisted',
            condition: (context) => {
                const whitelistedActions = ['healthCheck', 'metricCollection', 'stateSync'];
                return context.approved === true || whitelistedActions.includes(context.actionName);
            },
            priority: 'MEDIUM',
            metadata: {
                category: 'automation',
                whitelistedActions: ['healthCheck', 'metricCollection', 'stateSync'],
                recommendation: 'Add action to whitelist or get approval'
            }
        });
    }
    
    /**
     * Record a violation
     */
    _recordViolation(rule, context, result) {
        const violation = {
            id: `VIOL-${Date.now()}`,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            priority: rule.priority,
            context,
            result,
            timestamp: new Date().toISOString()
        };
        
        this.violations.push(violation);
        
        // Emit violation event
        if (window.LawAIApp?.RuntimeEventCollector) {
            window.LawAIApp.RuntimeEventCollector.emit({
                type: 'governance.violation',
                source: 'RuntimeGovernanceFoundation',
                data: violation
            });
        }
    }
    
    /**
     * Audit an action
     */
    _auditAction(action, data = {}) {
        const auditEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            governanceVersion: this.version
        };
        
        this.governanceState.lastAuditTimestamp = auditEntry.timestamp;
        
        // Store in decisions log
        this.decisions.push(auditEntry);
        
        // Emit audit event
        if (window.LawAIApp?.RuntimeEventCollector) {
            window.LawAIApp.RuntimeEventCollector.emit({
                type: 'governance.audit',
                source: 'RuntimeGovernanceFoundation',
                data: auditEntry
            });
        }
    }
    
    /**
     * Count active rules
     */
    _countActiveRules() {
        return Array.from(this.rules.values())
            .filter(rule => rule.status === this.ruleStatuses.ACTIVE)
            .length;
    }
    
    /**
     * Get rules grouped by type
     */
    _getRulesByType() {
        const byType = {};
        
        for (const rule of this.rules.values()) {
            if (!byType[rule.type]) {
                byType[rule.type] = 0;
            }
            byType[rule.type]++;
        }
        
        return byType;
    }
    
    /**
     * Get rules grouped by priority
     */
    _getRulesByPriority() {
        const byPriority = {};
        const priorityNames = Object.fromEntries(
            Object.entries(this.priorities).map(([k, v]) => [v, k])
        );
        
        for (const rule of this.rules.values()) {
            const priorityName = priorityNames[rule.priority] || 'UNKNOWN';
            if (!byPriority[priorityName]) {
                byPriority[priorityName] = 0;
            }
            byPriority[priorityName]++;
        }
        
        return byPriority;
    }
    
    /**
     * Get governance scope definition
     */
    getScope() {
        return {
            version: this.version,
            managedDomains: this.ruleTypes,
            principles: [
                {
                    id: 1,
                    principle: 'Runtime behavior must be explainable',
                    implemented: true,
                    mechanism: 'Rule evaluation logging and audit trail'
                },
                {
                    id: 2,
                    principle: 'Critical operations must be validated',
                    implemented: true,
                    mechanism: 'Pre-execution rule evaluation'
                },
                {
                    id: 3,
                    principle: 'Rules must be traceable',
                    implemented: true,
                    mechanism: 'Rule metadata, stats, and violation tracking'
                },
                {
                    id: 4,
                    principle: 'Governance failure must not affect runtime basics',
                    implemented: true,
                    mechanism: 'Fail-safe evaluation, always returns result even on error'
                }
            ],
            futureExpansion: [
                'Policy Engine',
                'Compliance Framework',
                'AI Safety Layer',
                'Autonomous Governance'
            ]
        };
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.RuntimeGovernanceFoundation = new RuntimeGovernanceFoundation();
    
    // API shortcuts
    window.LawAIApp.Governance = {
        createRule: (def) => window.LawAIApp.RuntimeGovernanceFoundation.createRule(def),
        evaluateRule: (id, ctx) => window.LawAIApp.RuntimeGovernanceFoundation.evaluateRule(id, ctx),
        evaluateAll: (ctx) => window.LawAIApp.RuntimeGovernanceFoundation.evaluateAll(ctx),
        isActionAllowed: (type, ctx) => window.LawAIApp.RuntimeGovernanceFoundation.isActionAllowed(type, ctx),
        getReport: () => window.LawAIApp.RuntimeGovernanceFoundation.getReport(),
        getHealth: () => window.LawAIApp.RuntimeGovernanceFoundation.getHealth(),
        getScope: () => window.LawAIApp.RuntimeGovernanceFoundation.getScope()
    };
}

export default RuntimeGovernanceFoundation;
