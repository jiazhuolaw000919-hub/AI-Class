/**
 * Runtime Governance Foundation
 * Part 49.1 — V4.9.1
 */

class RuntimeGovernanceFoundation {
    constructor() {
        this.version = '4.9.1';
        this.status = 'ACTIVE';
        
        this.rules = new Map();
        this.policies = new Map();
        this.decisions = [];
        this.violations = [];
        
        this.governanceState = {
            initialized: false,
            totalRules: 0,
            activeRules: 0,
            totalPolicies: 0,
            activePolicies: 0,
            lastAuditTimestamp: null,
            governanceHealth: 'HEALTHY'
        };
        
        this.ruleTypes = [
            'AI_DECISION',
            'RUNTIME_CHANGE',
            'MODULE_OPERATION',
            'DATA_ACCESS',
            'AUTOMATION_ACTION'
        ];
        
        this.priorities = {
            CRITICAL: 1,
            HIGH: 2,
            MEDIUM: 3,
            LOW: 4
        };
        
        this.ruleStatuses = {
            ACTIVE: 'active',
            DISABLED: 'disabled',
            DEPRECATED: 'deprecated',
            PENDING: 'pending'
        };
        
        this.init();
    }
    
    init() {
        console.log('[Governance] Foundation initializing...');
        
        this._loadDefaultRules();
        
        this.governanceState.initialized = true;
        this.governanceState.totalRules = this.rules.size;
        this.governanceState.activeRules = this._countActiveRules();
        
        console.log('[Governance] Foundation ready — ' + this.governanceState.activeRules + '/' + this.governanceState.totalRules + ' rules active');
        
        this._emitEvent('governance.initialized', {
            version: this.version,
            rules: this.governanceState.totalRules
        });
    }
    
    createRule({ id, type, name, description, condition, action, priority, metadata }) {
        if (!priority) priority = 'MEDIUM';
        if (!metadata) metadata = {};
        
        if (!this.ruleTypes.includes(type)) {
            throw new Error('Invalid rule type: ' + type + '. Must be one of: ' + this.ruleTypes.join(', '));
        }
        
        const rule = {
            id: id || 'GOV-RULE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            type: type,
            name: name,
            description: description,
            condition: condition,
            action: action,
            priority: this.priorities[priority] || this.priorities.MEDIUM,
            status: this.ruleStatuses.ACTIVE,
            metadata: Object.assign({
                createdAt: new Date().toISOString(),
                createdBy: 'system',
                category: metadata.category || 'general',
                scope: metadata.scope || ['*'],
                version: '1.0.0'
            }, metadata),
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
        
        this._auditAction('RULE_CREATED', { ruleId: rule.id, type: rule.type });
        
        return rule;
    }
    
    evaluateRule(ruleId, context) {
        if (!context) context = {};
        
        const rule = this.rules.get(ruleId);
        
        if (!rule) {
            return { 
                passed: false, 
                error: 'Rule ' + ruleId + ' not found',
                timestamp: new Date().toISOString()
            };
        }
        
        if (rule.status !== this.ruleStatuses.ACTIVE) {
            return { 
                passed: true, 
                skipped: true, 
                reason: 'Rule ' + ruleId + ' is ' + rule.status,
                timestamp: new Date().toISOString()
            };
        }
        
        rule.stats.evaluations++;
        rule.stats.lastEvaluated = new Date().toISOString();
        
        try {
            const passed = rule.condition(context);
            
            const result = {
                passed: passed,
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
                
                if (rule.action) {
                    try {
                        rule.action(context, result);
                    } catch (actionError) {
                        console.error('[Governance] Rule ' + ruleId + ' action failed:', actionError);
                        result.actionError = actionError.message;
                    }
                }
                
                this._recordViolation(rule, context, result);
            }
            
            return result;
            
        } catch (evalError) {
            console.error('[Governance] Rule ' + ruleId + ' evaluation failed:', evalError);
            
            return {
                passed: false,
                error: evalError.message,
                ruleId: rule.id,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    evaluateAll(context) {
        if (!context) context = {};
        
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
            passed: passed,
            failed: failed,
            skipped: skipped,
            results: results,
            timestamp: new Date().toISOString(),
            governanceVersion: this.version
        };
    }
    
    isActionAllowed(actionType, context) {
        if (!context) context = {};
        
        const relevantRules = Array.from(this.rules.values())
            .filter(function(rule) { 
                return rule.type === actionType && rule.status === this.ruleStatuses.ACTIVE; 
            }.bind(this))
            .sort(function(a, b) { return a.priority - b.priority; });
        
        const violations = [];
        
        for (var i = 0; i < relevantRules.length; i++) {
            var rule = relevantRules[i];
            var result = this.evaluateRule(rule.id, Object.assign({ actionType: actionType }, context));
            
            if (!result.passed && !result.skipped) {
                violations.push(result);
                
                if (rule.priority === this.priorities.CRITICAL) {
                    this._auditAction('ACTION_BLOCKED', {
                        actionType: actionType,
                        ruleId: rule.id,
                        reason: 'CRITICAL rule violation'
                    });
                    
                    return {
                        allowed: false,
                        blockedBy: rule.id,
                        violations: violations,
                        timestamp: new Date().toISOString()
                    };
                }
            }
        }
        
        return {
            allowed: violations.length === 0,
            violations: violations,
            timestamp: new Date().toISOString()
        };
    }
    
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
    
    getHealth() {
        var violationRate = this.violations.length / Math.max(this.governanceState.totalRules, 1);
        
        var healthStatus = 'HEALTHY';
        if (violationRate > 0.5) healthStatus = 'CRITICAL';
        else if (violationRate > 0.3) healthStatus = 'WARNING';
        
        this.governanceState.governanceHealth = healthStatus;
        
        return {
            status: healthStatus,
            version: this.version,
            activeRules: this.governanceState.activeRules,
            totalViolations: this.violations.length,
            violationRate: (violationRate * 100).toFixed(2) + '%',
            isOperational: true
        };
    }

    // ========== PRIVATE METHODS ==========
    
    _loadDefaultRules() {
        var self = this;
        
        this.createRule({
            id: 'GOV-001',
            type: 'AI_DECISION',
            name: 'AI Confidence Threshold',
            description: 'AI decisions must exceed minimum confidence level',
            condition: function(context) {
                return !context.confidence || context.confidence >= 0.7;
            },
            action: function(context, result) {
                console.warn('[Governance] AI decision blocked: Low confidence', context);
            },
            priority: 'HIGH',
            metadata: {
                category: 'ai-safety',
                threshold: 0.7,
                recommendation: 'Increase confidence above 0.7'
            }
        });
        
        this.createRule({
            id: 'GOV-002',
            type: 'RUNTIME_CHANGE',
            name: 'Runtime Change Logging',
            description: 'All runtime state changes must be logged and traceable',
            condition: function(context) {
                return context.changeLogged === true || context.source !== undefined;
            },
            priority: 'CRITICAL',
            metadata: {
                category: 'audit',
                recommendation: 'Log the change before execution'
            }
        });
        
        this.createRule({
            id: 'GOV-003',
            type: 'MODULE_OPERATION',
            name: 'Module Source Validation',
            description: 'Module operations must originate from valid source',
            condition: function(context) {
                var validSources = ['BootManager', 'GovernanceLayer', 'SystemAPI', 'AuthorizedModule'];
                return validSources.indexOf(context.source) !== -1;
            },
            priority: 'MEDIUM',
            metadata: {
                category: 'security',
                validSources: ['BootManager', 'GovernanceLayer', 'SystemAPI', 'AuthorizedModule'],
                recommendation: 'Use authorized module operation channels'
            }
        });
        
        this.createRule({
            id: 'GOV-004',
            type: 'DATA_ACCESS',
            name: 'Data Access Authorization',
            description: 'Data access must have proper authorization token',
            condition: function(context) {
                return context.authorized === true || context.isPublicData === true;
            },
            priority: 'HIGH',
            metadata: {
                category: 'security',
                recommendation: 'Request proper authorization before data access'
            }
        });
        
        this.createRule({
            id: 'GOV-005',
            type: 'AUTOMATION_ACTION',
            name: 'Automation Action Approval',
            description: 'Automated actions must have approval or be whitelisted',
            condition: function(context) {
                var whitelistedActions = ['healthCheck', 'metricCollection', 'stateSync'];
                return context.approved === true || whitelistedActions.indexOf(context.actionName) !== -1;
            },
            priority: 'MEDIUM',
            metadata: {
                category: 'automation',
                whitelistedActions: ['healthCheck', 'metricCollection', 'stateSync'],
                recommendation: 'Add action to whitelist or get approval'
            }
        });
    }
    
    _recordViolation(rule, context, result) {
        var violation = {
            id: 'VIOL-' + Date.now(),
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            priority: rule.priority,
            context: context,
            result: result,
            timestamp: new Date().toISOString()
        };
        
        this.violations.push(violation);
        
        this._emitEvent('governance.violation', violation);
    }
    
    _auditAction(action, data) {
        if (!data) data = {};
        
        var auditEntry = {
            action: action,
            data: data,
            timestamp: new Date().toISOString(),
            governanceVersion: this.version
        };
        
        this.governanceState.lastAuditTimestamp = auditEntry.timestamp;
        this.decisions.push(auditEntry);
        
        this._emitEvent('governance.audit', auditEntry);
    }
    
    // 🔥 统一的安全事件发送方法
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            
            // 尝试多种可能的 API
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            
            if (typeof emitFn === 'function') {
                emitFn.call(collector, {
                    type: type,
                    source: 'RuntimeGovernanceFoundation',
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {
            // 静默失败
        }
    }
    
    _countActiveRules() {
        var count = 0;
        var rulesArr = Array.from(this.rules.values());
        for (var i = 0; i < rulesArr.length; i++) {
            if (rulesArr[i].status === this.ruleStatuses.ACTIVE) count++;
        }
        return count;
    }
    
    _getRulesByType() {
        var byType = {};
        var rulesArr = Array.from(this.rules.values());
        for (var i = 0; i < rulesArr.length; i++) {
            var rule = rulesArr[i];
            if (!byType[rule.type]) byType[rule.type] = 0;
            byType[rule.type]++;
        }
        return byType;
    }
    
    _getRulesByPriority() {
        var byPriority = {};
        var priorityNames = {};
        var keys = Object.keys(this.priorities);
        for (var i = 0; i < keys.length; i++) {
            priorityNames[this.priorities[keys[i]]] = keys[i];
        }
        
        var rulesArr = Array.from(this.rules.values());
        for (var j = 0; j < rulesArr.length; j++) {
            var rule = rulesArr[j];
            var pName = priorityNames[rule.priority] || 'UNKNOWN';
            if (!byPriority[pName]) byPriority[pName] = 0;
            byPriority[pName]++;
        }
        return byPriority;
    }
    
    getScope() {
        return {
            version: this.version,
            managedDomains: this.ruleTypes,
            principles: [
                { id: 1, principle: 'Runtime behavior must be explainable', implemented: true, mechanism: 'Rule evaluation logging and audit trail' },
                { id: 2, principle: 'Critical operations must be validated', implemented: true, mechanism: 'Pre-execution rule evaluation' },
                { id: 3, principle: 'Rules must be traceable', implemented: true, mechanism: 'Rule metadata, stats, and violation tracking' },
                { id: 4, principle: 'Governance failure must not affect runtime basics', implemented: true, mechanism: 'Fail-safe evaluation, always returns result even on error' }
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
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.RuntimeGovernanceFoundation = new RuntimeGovernanceFoundation();
    
    window.LawAIApp.Governance = {
        createRule: function(def) { return window.LawAIApp.RuntimeGovernanceFoundation.createRule(def); },
        evaluateRule: function(id, ctx) { return window.LawAIApp.RuntimeGovernanceFoundation.evaluateRule(id, ctx); },
        evaluateAll: function(ctx) { return window.LawAIApp.RuntimeGovernanceFoundation.evaluateAll(ctx); },
        isActionAllowed: function(type, ctx) { return window.LawAIApp.RuntimeGovernanceFoundation.isActionAllowed(type, ctx); },
        getReport: function() { return window.LawAIApp.RuntimeGovernanceFoundation.getReport(); },
        getHealth: function() { return window.LawAIApp.RuntimeGovernanceFoundation.getHealth(); },
        getScope: function() { return window.LawAIApp.RuntimeGovernanceFoundation.getScope(); }
    };
}

// 🔥 ES Module 导出（兼容 import() 和传统 script 标签）
if (typeof exportDefault === 'undefined') {
    // 传统加载 — 不做任何事，已经挂到 window 上了
} else {
    // 这个变量不存在所以永远走不到这里，只是为了让 import() 不报错
}
