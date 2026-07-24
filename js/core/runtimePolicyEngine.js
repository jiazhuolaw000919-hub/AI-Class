/**
 * Runtime Policy Engine
 * Part 49.2 — V4.9.2
 */

class RuntimePolicyEngine {
    constructor() {
        this.version = '4.9.2';
        this.status = 'ACTIVE';
        
        this.policies = new Map();
        this.policyHistory = [];
        this.conflictLog = [];
        this.decisions = [];
        
        this.categories = {
            RUNTIME: 'runtime',
            AI: 'ai',
            SECURITY: 'security',
            PERFORMANCE: 'performance',
            DATA: 'data'
        };
        
        this.decisionTypes = {
            ALLOW: 'ALLOW',
            DENY: 'DENY',
            REVIEW: 'REVIEW'
        };
        
        this.priorities = {
            CRITICAL: 1,
            HIGH: 2,
            MEDIUM: 3,
            LOW: 4
        };
        
        this.statuses = {
            ACTIVE: 'active',
            INACTIVE: 'inactive',
            DEPRECATED: 'deprecated',
            TESTING: 'testing'
        };
        
        this.engineState = {
            initialized: false,
            totalPolicies: 0,
            activePolicies: 0,
            totalDecisions: 0,
            decisionsByType: { ALLOW: 0, DENY: 0, REVIEW: 0 },
            lastEvaluation: null,
            engineHealth: 'HEALTHY'
        };
        
        this.init();
    }
    
    init() {
        console.log('[PolicyEngine] Initializing...');
        this._loadDefaultPolicies();
        this.engineState.initialized = true;
        this.engineState.totalPolicies = this.policies.size;
        this.engineState.activePolicies = this._countActivePolicies();
        console.log('[PolicyEngine] Ready — ' + this.engineState.activePolicies + '/' + this.engineState.totalPolicies + ' policies active');
        this._emitEvent('policyEngine.initialized', { version: this.version, policies: this.engineState.totalPolicies });
    }
    
    registerPolicy(def) {
        var policyId = def.policyId;
        var name = def.name;
        var category = def.category;
        var description = def.description;
        var condition = def.condition;
        var action = def.action;
        var priority = def.priority || 'MEDIUM';
        var status = def.status || 'ACTIVE';
        var metadata = def.metadata || {};
        
        var validCategories = Object.values(this.categories);
        if (validCategories.indexOf(category) === -1) {
            throw new Error('Invalid category: ' + category);
        }
        if (!this.priorities[priority]) {
            throw new Error('Invalid priority: ' + priority);
        }
        if (typeof condition !== 'function') {
            throw new Error('Policy condition must be a function');
        }
        
        var policy = {
            policyId: policyId || 'POL-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: name,
            category: category,
            description: description,
            condition: condition,
            action: action,
            priority: this.priorities[priority],
            priorityName: priority,
            status: this.statuses[status] || this.statuses.ACTIVE,
            metadata: Object.assign({
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                author: 'system',
                scope: ['*'],
                explanation: metadata.explanation || 'Policy: ' + name + ' — ' + description
            }, metadata),
            stats: {
                evaluations: 0,
                matches: 0,
                allows: 0,
                denies: 0,
                reviews: 0,
                lastEvaluated: null,
                lastMatched: null
            }
        };
        
        this.policies.set(policy.policyId, policy);
        this.engineState.totalPolicies = this.policies.size;
        this.engineState.activePolicies = this._countActivePolicies();
        this._logToHistory('POLICY_REGISTERED', { policyId: policy.policyId, name: policy.name });
        return policy;
    }
    
    evaluatePolicy(policyId, request) {
        if (!request) request = {};
        
        var policy = this.policies.get(policyId);
        if (!policy) {
            return this._createDecision(request, null, 'ALLOW', 'Policy ' + policyId + ' not found — defaulting to ALLOW');
        }
        if (policy.status !== this.statuses.ACTIVE) {
            return this._createDecision(request, policy, 'ALLOW', 'Policy ' + policyId + ' is ' + policy.status + ' — skipped');
        }
        
        policy.stats.evaluations++;
        policy.stats.lastEvaluated = new Date().toISOString();
        
        try {
            var conditionMet = policy.condition(request);
            var decision, reason;
            
            if (conditionMet === true) {
                decision = policy.metadata.defaultDecision || 'REVIEW';
                reason = 'Policy "' + policy.name + '" condition met — ' + policy.metadata.explanation;
                policy.stats.matches++;
                policy.stats.lastMatched = new Date().toISOString();
                
                if (decision === 'ALLOW') policy.stats.allows++;
                else if (decision === 'DENY') policy.stats.denies++;
                else if (decision === 'REVIEW') policy.stats.reviews++;
                
                if (policy.action && typeof policy.action === 'function') {
                    try { policy.action(request, { decision: decision, reason: reason }); } catch (e) {}
                }
            } else {
                decision = 'ALLOW';
                reason = 'Policy "' + policy.name + '" condition not met — policy does not apply';
            }
            
            var decisionObj = this._createDecision(request, policy, decision, reason);
            this._recordDecision(decisionObj);
            return decisionObj;
            
        } catch (evalError) {
            console.error('[PolicyEngine] Evaluation error for ' + policyId + ':', evalError);
            var fallbackDecision = this._createDecision(request, policy, 'ALLOW', 'Policy evaluation error: ' + evalError.message + ' — defaulting to ALLOW (Rule 4)');
            this._recordDecision(fallbackDecision);
            return fallbackDecision;
        }
    }
    
    evaluateRequest(request) {
        if (!request) request = {};
        
        var startTime = performance.now();
        this.engineState.lastEvaluation = new Date().toISOString();
        
        var applicablePolicies = this._findApplicablePolicies(request);
        
        if (applicablePolicies.length === 0) {
            var decision = this._createDecision(request, null, 'ALLOW', 'No applicable policies found — defaulting to ALLOW');
            this._recordDecision(decision);
            return decision;
        }
        
        applicablePolicies.sort(function(a, b) { return a.priority - b.priority; });
        
        var evaluations = [];
        var conflicts = [];
        var finalDecision = 'ALLOW';
        var finalReason = '';
        var blockingPolicy = null;
        
        for (var i = 0; i < applicablePolicies.length; i++) {
            var policy = applicablePolicies[i];
            var result = this.evaluatePolicy(policy.policyId, request);
            evaluations.push(result);
            
            if (result.decision === 'DENY') {
                finalDecision = 'DENY';
                blockingPolicy = policy;
                finalReason = 'Blocked by policy "' + policy.name + '" (Priority: ' + policy.priorityName + ')';
                
                var previousAllows = [];
                for (var j = 0; j < evaluations.length; j++) {
                    if (evaluations[j].decision === 'ALLOW' && evaluations[j].policyId !== policy.policyId) {
                        previousAllows.push(evaluations[j]);
                    }
                }
                if (previousAllows.length > 0) {
                    var conflict = {
                        type: 'ALLOW_DENY_CONFLICT',
                        denyPolicy: policy.policyId,
                        allowPolicies: previousAllows.map(function(e) { return e.policyId; }),
                        resolution: 'DENY policy (' + policy.policyId + ') overrides — Rule 2: Higher priority takes precedence',
                        timestamp: new Date().toISOString()
                    };
                    conflicts.push(conflict);
                    this.conflictLog.push(conflict);
                }
                break;
            } else if (result.decision === 'REVIEW') {
                if (finalDecision !== 'DENY') {
                    finalDecision = 'REVIEW';
                    if (!blockingPolicy || policy.priority < blockingPolicy.priority) {
                        blockingPolicy = policy;
                    }
                    finalReason = 'Review required by policy "' + policy.name + '" (Priority: ' + policy.priorityName + ')';
                }
            }
        }
        
        if (conflicts.length > 0) {
            this._emitEvent('policyEngine.conflict', { request: request.action || 'unknown', conflicts: conflicts, resolution: 'Higher priority policy takes precedence (Rule 2)' });
        }
        
        if (finalDecision === 'ALLOW' && !blockingPolicy) {
            finalReason = 'All policies passed — action allowed';
        }
        
        var finalDecisionObj = {
            request: request,
            evaluations: evaluations,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
            finalDecision: finalDecision,
            finalReason: finalReason,
            blockingPolicy: blockingPolicy ? { policyId: blockingPolicy.policyId, name: blockingPolicy.name, priority: blockingPolicy.priorityName } : null,
            evaluationTime: (performance.now() - startTime).toFixed(2) + 'ms',
            timestamp: new Date().toISOString(),
            engineVersion: this.version
        };
        
        this._recordDecision(finalDecisionObj);
        return finalDecisionObj;
    }
    
    isAllowed(action, context) {
        if (!context) context = {};
        var result = this.evaluateRequest(Object.assign({ action: action }, context, { timestamp: new Date().toISOString() }));
        return {
            allowed: result.finalDecision === 'ALLOW',
            decision: result.finalDecision,
            reason: result.finalReason,
            blockingPolicy: result.blockingPolicy,
            requiresReview: result.finalDecision === 'REVIEW'
        };
    }
    
    getPolicy(policyId) { return this.policies.get(policyId) || null; }
    
    getPoliciesByCategory(category) {
        var result = [];
        var all = Array.from(this.policies.values());
        for (var i = 0; i < all.length; i++) {
            if (all[i].category === category) result.push(all[i]);
        }
        return result;
    }
    
    updatePolicyStatus(policyId, newStatus) {
        var policy = this.policies.get(policyId);
        if (!policy) throw new Error('Policy ' + policyId + ' not found');
        var oldStatus = policy.status;
        policy.status = this.statuses[newStatus] || newStatus;
        this.engineState.activePolicies = this._countActivePolicies();
        this._logToHistory('POLICY_STATUS_CHANGED', { policyId: policyId, oldStatus: oldStatus, newStatus: policy.status });
        return policy;
    }
    
    getReport() {
        var policiesByCategory = {};
        var cats = Object.values(this.categories);
        for (var i = 0; i < cats.length; i++) {
            policiesByCategory[cats[i]] = this.getPoliciesByCategory(cats[i]).length;
        }
        
        return {
            version: this.version,
            status: this.engineState.engineHealth,
            policies: { total: this.engineState.totalPolicies, active: this.engineState.activePolicies, byCategory: policiesByCategory },
            decisions: { total: this.engineState.totalDecisions, byType: this.engineState.decisionsByType },
            conflicts: { total: this.conflictLog.length, recent: this.conflictLog.slice(-5) },
            recentDecisions: this.decisions.slice(-10),
            rules: ['Rule 1: Policies must be explainable ✅', 'Rule 2: Higher priority overrides lower priority ✅', 'Rule 3: Policy conflicts must be recorded ✅', 'Rule 4: Policy failure must not affect runtime ✅']
        };
    }
    
    getHealth() {
        var denyRate = this.engineState.decisionsByType.DENY / Math.max(this.engineState.totalDecisions, 1);
        var health = 'HEALTHY';
        if (denyRate > 0.3) health = 'RESTRICTIVE';
        if (this.engineState.activePolicies === 0) health = 'NO_POLICIES';
        this.engineState.engineHealth = health;
        
        return {
            status: health,
            version: this.version,
            activePolicies: this.engineState.activePolicies,
            totalDecisions: this.engineState.totalDecisions,
            denyRate: (denyRate * 100).toFixed(1) + '%',
            lastEvaluation: this.engineState.lastEvaluation,
            isOperational: true
        };
    }
    
    getDecisionHistory(limit) {
        if (!limit) limit = 50;
        return this.decisions.slice(-limit);
    }
    
    getConflicts() { return this.conflictLog.slice(); }
    
    // ========== PRIVATE ==========
    
    _loadDefaultPolicies() {
        var self = this;
        
        this.registerPolicy({
            policyId: 'POL-RT-001', name: 'Critical Module Protection', category: 'runtime',
            description: 'Prevent unloading of critical runtime modules',
            condition: function(request) {
                var criticalModules = ['BootManager', 'GovernanceFoundation', 'PolicyEngine', 'StateSyncEngine'];
                return request.action === 'unloadModule' && criticalModules.indexOf(request.moduleName) !== -1;
            },
            priority: 'CRITICAL',
            metadata: { defaultDecision: 'DENY', explanation: 'Critical modules cannot be unloaded during runtime', scope: ['module_management'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-RT-002', name: 'State Change Authorization', category: 'runtime',
            description: 'Runtime state changes must come from authorized sources',
            condition: function(request) {
                var authorizedSources = ['BootManager', 'StateSyncEngine', 'SystemAPI'];
                return request.action === 'changeState' && authorizedSources.indexOf(request.source) === -1;
            },
            priority: 'HIGH',
            metadata: { defaultDecision: 'REVIEW', explanation: 'Unauthorized state changes require review', scope: ['state_management'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-AI-001', name: 'AI Confidence Requirement', category: 'ai',
            description: 'AI decisions with low confidence require review',
            condition: function(request) {
                return request.action && request.action.indexOf('ai_') === 0 && request.confidence !== undefined && request.confidence < 0.7;
            },
            priority: 'HIGH',
            metadata: { defaultDecision: 'REVIEW', explanation: 'AI decisions below 70% confidence require human review', threshold: 0.7, scope: ['ai_decisions'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-AI-002', name: 'AI Self-Modification Prevention', category: 'ai',
            description: 'Prevent AI from modifying its own safety constraints',
            condition: function(request) {
                var protectedParams = ['confidenceThreshold', 'safetyLevel', 'maxTokens'];
                return request.action === 'ai_modifyConfig' && protectedParams.indexOf(request.parameter) !== -1 && request.source === 'ai';
            },
            priority: 'CRITICAL',
            metadata: { defaultDecision: 'DENY', explanation: 'AI cannot modify its own safety parameters', scope: ['ai_safety'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-SEC-001', name: 'Data Access Logging', category: 'security',
            description: 'All sensitive data access must be logged',
            condition: function(request) {
                var sensitiveActions = ['readUserData', 'readSystemConfig', 'accessStorage'];
                return sensitiveActions.indexOf(request.action) !== -1 && !request.auditLogged;
            },
            priority: 'HIGH',
            metadata: { defaultDecision: 'DENY', explanation: 'Sensitive data access requires audit logging enabled', scope: ['data_access'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-PERF-001', name: 'Resource Usage Control', category: 'performance',
            description: 'Operations consuming significant resources require review',
            condition: function(request) { return request.estimatedCost && request.estimatedCost > 100; },
            priority: 'MEDIUM',
            metadata: { defaultDecision: 'REVIEW', explanation: 'Operations estimated to consume >100 units require review', threshold: 100, scope: ['performance'] }
        });
        
        this.registerPolicy({
            policyId: 'POL-DATA-001', name: 'Personal Data Protection', category: 'data',
            description: 'Access to personal data requires explicit authorization',
            condition: function(request) {
                var personalDataTypes = ['userProfile', 'learningHistory', 'assessmentResults'];
                return personalDataTypes.indexOf(request.dataType) !== -1 && !request.hasConsent;
            },
            priority: 'HIGH',
            metadata: { defaultDecision: 'DENY', explanation: 'Personal data access requires user consent', scope: ['personal_data'] }
        });
    }
    
    _findApplicablePolicies(request) {
        var result = [];
        var all = Array.from(this.policies.values());
        for (var i = 0; i < all.length; i++) {
            var policy = all[i];
            if (policy.status !== this.statuses.ACTIVE) continue;
            var scope = policy.metadata.scope || ['*'];
            var requestAction = request.action || '';
            if (scope.indexOf('*') !== -1 || scope.some(function(s) { return requestAction.indexOf(s) !== -1; })) {
                result.push(policy);
            }
        }
        return result;
    }
    
    _createDecision(request, policy, decision, reason) {
        return {
            request: request.action || 'unknown',
            policyId: policy ? policy.policyId : null,
            policyName: policy ? policy.name : null,
            policyCategory: policy ? policy.category : null,
            decision: decision,
            reason: reason,
            timestamp: new Date().toISOString(),
            engineVersion: this.version
        };
    }
    
    _recordDecision(decisionObj) {
        this.decisions.push(decisionObj);
        this.engineState.totalDecisions++;
        if (this.engineState.decisionsByType[decisionObj.decision] !== undefined) {
            this.engineState.decisionsByType[decisionObj.decision]++;
        }
        if (this.decisions.length > 1000) this.decisions = this.decisions.slice(-500);
        this._logToHistory('DECISION_MADE', decisionObj);
        this._emitEvent('policyEngine.decision', decisionObj);
    }
    
    _logToHistory(action, data) {
        this.policyHistory.push({ action: action, data: data, timestamp: new Date().toISOString() });
        if (this.policyHistory.length > 500) this.policyHistory = this.policyHistory.slice(-250);
    }
    
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            if (typeof emitFn === 'function') {
                emitFn.call(collector, { type: type, source: 'RuntimePolicyEngine', data: data, timestamp: new Date().toISOString() });
            }
        } catch (e) {}
    }
    
    _countActivePolicies() {
        var count = 0;
        var all = Array.from(this.policies.values());
        for (var i = 0; i < all.length; i++) {
            if (all[i].status === this.statuses.ACTIVE) count++;
        }
        return count;
    }
    
    getRequestTypeStats() {
        var stats = {};
        for (var i = 0; i < this.decisions.length; i++) {
            var d = this.decisions[i];
            var requestType = d.request || 'unknown';
            if (!stats[requestType]) stats[requestType] = { ALLOW: 0, DENY: 0, REVIEW: 0, total: 0 };
            stats[requestType][d.decision]++;
            stats[requestType].total++;
        }
        return stats;
    }
}

// Export to global
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.RuntimePolicyEngine = new RuntimePolicyEngine();
    
    window.LawAIApp.Policy = {
        register: function(def) { return window.LawAIApp.RuntimePolicyEngine.registerPolicy(def); },
        get: function(id) { return window.LawAIApp.RuntimePolicyEngine.getPolicy(id); },
        getByCategory: function(cat) { return window.LawAIApp.RuntimePolicyEngine.getPoliciesByCategory(cat); },
        updateStatus: function(id, status) { return window.LawAIApp.RuntimePolicyEngine.updatePolicyStatus(id, status); },
        evaluate: function(policyId, request) { return window.LawAIApp.RuntimePolicyEngine.evaluatePolicy(policyId, request); },
        evaluateRequest: function(request) { return window.LawAIApp.RuntimePolicyEngine.evaluateRequest(request); },
        isAllowed: function(action, context) { return window.LawAIApp.RuntimePolicyEngine.isAllowed(action, context); },
        getReport: function() { return window.LawAIApp.RuntimePolicyEngine.getReport(); },
        getHealth: function() { return window.LawAIApp.RuntimePolicyEngine.getHealth(); },
        getDecisions: function(limit) { return window.LawAIApp.RuntimePolicyEngine.getDecisionHistory(limit); },
        getConflicts: function() { return window.LawAIApp.RuntimePolicyEngine.getConflicts(); },
        getRequestTypeStats: function() { return window.LawAIApp.RuntimePolicyEngine.getRequestTypeStats(); }
    };
}
