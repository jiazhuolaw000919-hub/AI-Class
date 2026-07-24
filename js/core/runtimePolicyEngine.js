/**
 * Runtime Policy Engine
 * Part 49.2 — V4.9.2
 * 
 * Policy Engine for Runtime Governance:
 * - Policy Registration
 * - Policy Evaluation
 * - Policy Matching
 * - Policy Enforcement
 * 
 * Decision Types: ALLOW / DENY / REVIEW
 * 
 * Rules:
 * 1. Policies must be explainable
 * 2. Higher priority overrides lower priority
 * 3. Policy conflicts must be recorded
 * 4. Policy failure must not affect runtime
 */

class RuntimePolicyEngine {
    constructor() {
        this.version = '4.9.2';
        this.status = 'ACTIVE';
        
        // Policy stores
        this.policies = new Map();
        this.policyHistory = [];
        this.conflictLog = [];
        
        // Decision cache (for audit)
        this.decisions = [];
        
        // Policy categories
        this.categories = {
            RUNTIME: 'runtime',
            AI: 'ai',
            SECURITY: 'security',
            PERFORMANCE: 'performance',
            DATA: 'data'
        };
        
        // Decision types
        this.decisionTypes = {
            ALLOW: 'ALLOW',
            DENY: 'DENY',
            REVIEW: 'REVIEW'
        };
        
        // Policy priorities (1 = highest)
        this.priorities = {
            CRITICAL: 1,   // System safety, cannot override
            HIGH: 2,       // Important policies
            MEDIUM: 3,     // Standard policies
            LOW: 4         // Advisory policies
        };
        
        // Policy statuses
        this.statuses = {
            ACTIVE: 'active',
            INACTIVE: 'inactive',
            DEPRECATED: 'deprecated',
            TESTING: 'testing'
        };
        
        // Engine state
        this.engineState = {
            initialized: false,
            totalPolicies: 0,
            activePolicies: 0,
            totalDecisions: 0,
            decisionsByType: {
                ALLOW: 0,
                DENY: 0,
                REVIEW: 0
            },
            lastEvaluation: null,
            engineHealth: 'HEALTHY'
        };
        
        this.init();
    }
    
    /**
     * Initialize Policy Engine
     */
    init() {
        console.log('[PolicyEngine] Initializing...');
        
        // Load default policies
        this._loadDefaultPolicies();
        
        this.engineState.initialized = true;
        this.engineState.totalPolicies = this.policies.size;
        this.engineState.activePolicies = this._countActivePolicies();
        
        console.log(`[PolicyEngine] Ready — ${this.engineState.activePolicies}/${this.engineState.totalPolicies} policies active`);
        
        // Emit event
        this._emitEvent('policyEngine.initialized', {
            version: this.version,
            policies: this.engineState.totalPolicies
        });
    }
    
    /**
     * Register a new policy
     * @param {Object} policyDefinition
     * @returns {Object} Registered policy
     */
    registerPolicy({
        policyId,
        name,
        category,
        description,
        condition,
        action,
        priority = 'MEDIUM',
        status = 'ACTIVE',
        metadata = {}
    }) {
        // Validate category
        const validCategories = Object.values(this.categories);
        if (!validCategories.includes(category)) {
            throw new Error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
        }
        
        // Validate priority
        if (!this.priorities[priority]) {
            throw new Error(`Invalid priority: ${priority}. Must be one of: ${Object.keys(this.priorities).join(', ')}`);
        }
        
        // Validate condition is a function
        if (typeof condition !== 'function') {
            throw new Error('Policy condition must be a function');
        }
        
        const policy = {
            policyId: policyId || `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            category,
            description,
            condition,     // (context) => boolean
            action,        // (context, decision) => void — optional enforcement action
            priority: this.priorities[priority],
            priorityName: priority,
            status: this.statuses[status] || this.statuses.ACTIVE,
            metadata: {
                createdAt: new Date().toISOString(),
                version: '1.0.0',
                author: 'system',
                scope: ['*'],
                explanation: metadata.explanation || `Policy: ${name} — ${description}`,
                ...metadata
            },
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
        
        // Audit
        this._logToHistory('POLICY_REGISTERED', { policyId: policy.policyId, name: policy.name });
        
        return policy;
    }
    
    /**
     * Evaluate a single policy against a request context
     * @param {string} policyId - Policy to evaluate
     * @param {Object} request - Request context
     * @returns {Object} Evaluation result
     */
    evaluatePolicy(policyId, request = {}) {
        const policy = this.policies.get(policyId);
        
        if (!policy) {
            return this._createDecision(request, null, 'ALLOW', `Policy ${policyId} not found — defaulting to ALLOW`);
        }
        
        if (policy.status !== this.statuses.ACTIVE) {
            return this._createDecision(request, policy, 'ALLOW', `Policy ${policyId} is ${policy.status} — skipped`);
        }
        
        policy.stats.evaluations++;
        policy.stats.lastEvaluated = new Date().toISOString();
        
        try {
            const conditionMet = policy.condition(request);
            
            let decision;
            let reason;
            
            if (conditionMet === true) {
                // Condition met = policy applies, follow the action
                decision = policy.metadata.defaultDecision || 'REVIEW';
                reason = `Policy "${policy.name}" condition met — ${policy.metadata.explanation}`;
                policy.stats.matches++;
                policy.stats.lastMatched = new Date().toISOString();
                
                // Update stats based on decision
                if (decision === 'ALLOW') policy.stats.allows++;
                else if (decision === 'DENY') policy.stats.denies++;
                else if (decision === 'REVIEW') policy.stats.reviews++;
                
                // Execute enforcement action if defined
                if (policy.action && typeof policy.action === 'function') {
                    try {
                        policy.action(request, { decision, reason });
                    } catch (actionError) {
                        console.error(`[PolicyEngine] Action execution failed for ${policyId}:`, actionError);
                        // Rule 4: Policy failure doesn't affect runtime
                    }
                }
                
            } else {
                // Condition not met = policy doesn't apply
                decision = 'ALLOW';
                reason = `Policy "${policy.name}" condition not met — policy does not apply`;
            }
            
            const decisionObj = this._createDecision(request, policy, decision, reason);
            this._recordDecision(decisionObj);
            
            return decisionObj;
            
        } catch (evalError) {
            console.error(`[PolicyEngine] Evaluation error for ${policyId}:`, evalError);
            
            // Rule 4: Policy failure must not affect runtime — default to ALLOW
            const fallbackDecision = this._createDecision(
                request, 
                policy, 
                'ALLOW', 
                `Policy evaluation error: ${evalError.message} — defaulting to ALLOW (Rule 4)`
            );
            
            this._recordDecision(fallbackDecision);
            return fallbackDecision;
        }
    }
    
    /**
     * Evaluate all applicable policies for a request
     * @param {Object} request - Action request to evaluate
     * @returns {Object} Final decision after evaluating all policies
     */
    evaluateRequest(request = {}) {
        const startTime = performance.now();
        this.engineState.lastEvaluation = new Date().toISOString();
        
        // Find all active policies that could apply
        const applicablePolicies = this._findApplicablePolicies(request);
        
        if (applicablePolicies.length === 0) {
            const decision = this._createDecision(request, null, 'ALLOW', 'No applicable policies found — defaulting to ALLOW');
            this._recordDecision(decision);
            return decision;
        }
        
        // Sort by priority (highest first)
        applicablePolicies.sort((a, b) => a.priority - b.priority);
        
        // Evaluate each policy
        const evaluations = [];
        const conflicts = [];
        let finalDecision = 'ALLOW';
        let finalReason = '';
        let blockingPolicy = null;
        
        for (const policy of applicablePolicies) {
            const result = this.evaluatePolicy(policy.policyId, request);
            evaluations.push(result);
            
            if (result.decision === 'DENY') {
                // DENY from any policy immediately blocks
                finalDecision = 'DENY';
                blockingPolicy = policy;
                finalReason = `Blocked by policy "${policy.name}" (Priority: ${policy.priorityName})`;
                
                // Check for conflicts with previous ALLOW decisions
                const previousAllows = evaluations.filter(e => e.decision === 'ALLOW' && e.policyId !== policy.policyId);
                if (previousAllows.length > 0) {
                    const conflict = {
                        type: 'ALLOW_DENY_CONFLICT',
                        denyPolicy: policy.policyId,
                        allowPolicies: previousAllows.map(e => e.policyId),
                        resolution: `DENY policy (${policy.policyId}) overrides — Rule 2: Higher priority takes precedence`,
                        timestamp: new Date().toISOString()
                    };
                    conflicts.push(conflict);
                    this.conflictLog.push(conflict);
                }
                
                break; // DENY is final, no need to evaluate lower priority policies
                
            } else if (result.decision === 'REVIEW') {
                // REVIEW is tentative DENY — record but continue checking
                if (finalDecision !== 'DENY') {
                    finalDecision = 'REVIEW';
                    if (!blockingPolicy || policy.priority < blockingPolicy.priority) {
                        blockingPolicy = policy;
                    }
                    finalReason = `Review required by policy "${policy.name}" (Priority: ${policy.priorityName})`;
                }
            }
            // ALLOW continues the evaluation
        }
        
        // Resolve conflicts if any
        if (conflicts.length > 0) {
            this._emitEvent('policyEngine.conflict', {
                request: request.action || 'unknown',
                conflicts,
                resolution: 'Higher priority policy takes precedence (Rule 2)'
            });
        }
        
        // If final decision is still ALLOW and no blocking policy
        if (finalDecision === 'ALLOW' && !blockingPolicy) {
            finalReason = 'All policies passed — action allowed';
        }
        
        const finalDecisionObj = {
            request,
            evaluations,
            conflicts: conflicts.length > 0 ? conflicts : undefined,
            finalDecision,
            finalReason,
            blockingPolicy: blockingPolicy ? {
                policyId: blockingPolicy.policyId,
                name: blockingPolicy.name,
                priority: blockingPolicy.priorityName
            } : null,
            evaluationTime: `${(performance.now() - startTime).toFixed(2)}ms`,
            timestamp: new Date().toISOString(),
            engineVersion: this.version
        };
        
        this._recordDecision(finalDecisionObj);
        return finalDecisionObj;
    }
    
    /**
     * Quick check: Is this action allowed?
     * @param {string} action - Action name/type
     * @param {Object} context - Action context
     * @returns {Object} Simple allow/deny/review result
     */
    isAllowed(action, context = {}) {
        const result = this.evaluateRequest({
            action,
            ...context,
            timestamp: new Date().toISOString()
        });
        
        return {
            allowed: result.finalDecision === 'ALLOW',
            decision: result.finalDecision,
            reason: result.finalReason,
            blockingPolicy: result.blockingPolicy,
            requiresReview: result.finalDecision === 'REVIEW'
        };
    }
    
    /**
     * Get policy by ID
     * @param {string} policyId
     * @returns {Object|null}
     */
    getPolicy(policyId) {
        return this.policies.get(policyId) || null;
    }
    
    /**
     * Get all policies in a category
     * @param {string} category
     * @returns {Array}
     */
    getPoliciesByCategory(category) {
        return Array.from(this.policies.values())
            .filter(p => p.category === category);
    }
    
    /**
     * Update policy status
     * @param {string} policyId
     * @param {string} newStatus
     * @returns {Object} Updated policy
     */
    updatePolicyStatus(policyId, newStatus) {
        const policy = this.policies.get(policyId);
        if (!policy) throw new Error(`Policy ${policyId} not found`);
        
        const oldStatus = policy.status;
        policy.status = this.statuses[newStatus] || newStatus;
        
        this.engineState.activePolicies = this._countActivePolicies();
        
        this._logToHistory('POLICY_STATUS_CHANGED', {
            policyId,
            oldStatus,
            newStatus: policy.status
        });
        
        return policy;
    }
    
    /**
     * Get policy engine report
     * @returns {Object}
     */
    getReport() {
        const policiesByCategory = {};
        for (const category of Object.values(this.categories)) {
            policiesByCategory[category] = this.getPoliciesByCategory(category).length;
        }
        
        return {
            version: this.version,
            status: this.engineState.engineHealth,
            policies: {
                total: this.engineState.totalPolicies,
                active: this.engineState.activePolicies,
                byCategory: policiesByCategory
            },
            decisions: {
                total: this.engineState.totalDecisions,
                byType: this.engineState.decisionsByType
            },
            conflicts: {
                total: this.conflictLog.length,
                recent: this.conflictLog.slice(-5)
            },
            recentDecisions: this.decisions.slice(-10),
            rules: [
                'Rule 1: Policies must be explainable ✅',
                'Rule 2: Higher priority overrides lower priority ✅',
                'Rule 3: Policy conflicts must be recorded ✅',
                'Rule 4: Policy failure must not affect runtime ✅'
            ]
        };
    }
    
    /**
     * Get policy engine health
     * @returns {Object}
     */
    getHealth() {
        const denyRate = this.engineState.decisionsByType.DENY / 
            Math.max(this.engineState.totalDecisions, 1);
        
        let health = 'HEALTHY';
        if (denyRate > 0.3) health = 'RESTRICTIVE';
        if (this.engineState.activePolicies === 0) health = 'NO_POLICIES';
        
        this.engineState.engineHealth = health;
        
        return {
            status: health,
            version: this.version,
            activePolicies: this.engineState.activePolicies,
            totalDecisions: this.engineState.totalDecisions,
            denyRate: `${(denyRate * 100).toFixed(1)}%`,
            lastEvaluation: this.engineState.lastEvaluation,
            isOperational: true // Rule 4
        };
    }
    
    /**
     * Get decision history
     * @param {number} limit
     * @returns {Array}
     */
    getDecisionHistory(limit = 50) {
        return this.decisions.slice(-limit);
    }
    
    /**
     * Get conflict log
     * @returns {Array}
     */
    getConflicts() {
        return [...this.conflictLog];
    }
    
    // ========== PRIVATE METHODS ==========
    
    /**
     * Load default system policies
     */
    _loadDefaultPolicies() {
        // RUNTIME Policy: Prevent critical module unloading
        this.registerPolicy({
            policyId: 'POL-RT-001',
            name: 'Critical Module Protection',
            category: 'runtime',
            description: 'Prevent unloading of critical runtime modules',
            condition: (request) => {
                const criticalModules = ['BootManager', 'GovernanceFoundation', 'PolicyEngine', 'StateSyncEngine'];
                return request.action === 'unloadModule' && 
                       criticalModules.includes(request.moduleName);
            },
            action: (request, decision) => {
                console.warn(`[PolicyEngine] BLOCKED: Attempt to unload critical module ${request.moduleName}`);
            },
            priority: 'CRITICAL',
            metadata: {
                defaultDecision: 'DENY',
                explanation: 'Critical modules cannot be unloaded during runtime',
                scope: ['module_management']
            }
        });
        
        // RUNTIME Policy: State changes require source validation
        this.registerPolicy({
            policyId: 'POL-RT-002',
            name: 'State Change Authorization',
            category: 'runtime',
            description: 'Runtime state changes must come from authorized sources',
            condition: (request) => {
                const authorizedSources = ['BootManager', 'StateSyncEngine', 'SystemAPI'];
                return request.action === 'changeState' && 
                       !authorizedSources.includes(request.source);
            },
            priority: 'HIGH',
            metadata: {
                defaultDecision: 'REVIEW',
                explanation: 'Unauthorized state changes require review',
                scope: ['state_management']
            }
        });
        
        // AI Policy: AI recommendations need confidence threshold
        this.registerPolicy({
            policyId: 'POL-AI-001',
            name: 'AI Confidence Requirement',
            category: 'ai',
            description: 'AI decisions with low confidence require review',
            condition: (request) => {
                return request.action?.startsWith('ai_') && 
                       request.confidence !== undefined && 
                       request.confidence < 0.7;
            },
            priority: 'HIGH',
            metadata: {
                defaultDecision: 'REVIEW',
                explanation: 'AI decisions below 70% confidence require human review',
                threshold: 0.7,
                scope: ['ai_decisions']
            }
        });
        
        // AI Policy: AI cannot modify its own safety parameters
        this.registerPolicy({
            policyId: 'POL-AI-002',
            name: 'AI Self-Modification Prevention',
            category: 'ai',
            description: 'Prevent AI from modifying its own safety constraints',
            condition: (request) => {
                const protectedParams = ['confidenceThreshold', 'safetyLevel', 'maxTokens'];
                return request.action === 'ai_modifyConfig' && 
                       protectedParams.includes(request.parameter) &&
                       request.source === 'ai';
            },
            priority: 'CRITICAL',
            metadata: {
                defaultDecision: 'DENY',
                explanation: 'AI cannot modify its own safety parameters — requires human authorization',
                scope: ['ai_safety']
            }
        });
        
        // SECURITY Policy: Data access logging requirement
        this.registerPolicy({
            policyId: 'POL-SEC-001',
            name: 'Data Access Logging',
            category: 'security',
            description: 'All sensitive data access must be logged',
            condition: (request) => {
                const sensitiveActions = ['readUserData', 'readSystemConfig', 'accessStorage'];
                return sensitiveActions.includes(request.action) && 
                       !request.auditLogged;
            },
            priority: 'HIGH',
            metadata: {
                defaultDecision: 'DENY',
                explanation: 'Sensitive data access requires audit logging enabled',
                scope: ['data_access']
            }
        });
        
        // PERFORMANCE Policy: Resource-intensive operations need approval
        this.registerPolicy({
            policyId: 'POL-PERF-001',
            name: 'Resource Usage Control',
            category: 'performance',
            description: 'Operations consuming significant resources require review',
            condition: (request) => {
                return request.estimatedCost && request.estimatedCost > 100; // ms or MB
            },
            priority: 'MEDIUM',
            metadata: {
                defaultDecision: 'REVIEW',
                explanation: 'Operations estimated to consume >100 units require review',
                threshold: 100,
                scope: ['performance']
            }
        });
        
        // DATA Policy: Personal data access restriction
        this.registerPolicy({
            policyId: 'POL-DATA-001',
            name: 'Personal Data Protection',
            category: 'data',
            description: 'Access to personal data requires explicit authorization',
            condition: (request) => {
                const personalDataTypes = ['userProfile', 'learningHistory', 'assessmentResults'];
                return personalDataTypes.includes(request.dataType) && 
                       !request.hasConsent;
            },
            priority: 'HIGH',
            metadata: {
                defaultDecision: 'DENY',
                explanation: 'Personal data access requires user consent',
                scope: ['personal_data']
            }
        });
    }
    
    /**
     * Find policies applicable to a request
     */
    _findApplicablePolicies(request) {
        return Array.from(this.policies.values())
            .filter(policy => {
                if (policy.status !== this.statuses.ACTIVE) return false;
                
                // Check if policy scope matches request
                const scope = policy.metadata.scope || ['*'];
                const requestAction = request.action || '';
                
                // Wildcard scope applies to everything
                if (scope.includes('*')) return true;
                
                // Check if request action matches any scope
                return scope.some(s => requestAction.includes(s));
            });
    }
    
    /**
     * Create a decision object
     */
    _createDecision(request, policy, decision, reason) {
        return {
            request: request.action || 'unknown',
            requestContext: request,
            policyId: policy?.policyId || null,
            policyName: policy?.name || null,
            policyCategory: policy?.category || null,
            decision,    // ALLOW | DENY | REVIEW
            reason,      // Explainable — Rule 1
            timestamp: new Date().toISOString(),
            engineVersion: this.version
        };
    }
    
    /**
     * Record a decision for audit
     */
    _recordDecision(decisionObj) {
        this.decisions.push(decisionObj);
        this.engineState.totalDecisions++;
        
        // Update decision type counter
        if (this.engineState.decisionsByType[decisionObj.decision] !== undefined) {
            this.engineState.decisionsByType[decisionObj.decision]++;
        }
        
        // Keep only last 1000 decisions in memory
        if (this.decisions.length > 1000) {
            this.decisions = this.decisions.slice(-500);
        }
        
        // Log to history
        this._logToHistory('DECISION_MADE', decisionObj);
        
        // Emit event
        this._emitEvent('policyEngine.decision', decisionObj);
    }
    
    /**
     * Log to policy history
     */
    _logToHistory(action, data) {
        this.policyHistory.push({
            action,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Keep history manageable
        if (this.policyHistory.length > 500) {
            this.policyHistory = this.policyHistory.slice(-250);
        }
    }
    
    /**
     * Emit runtime event
     */
    _emitEvent(type, data) {
        if (window.LawAIApp?.RuntimeEventCollector) {
            try {
                window.LawAIApp.RuntimeEventCollector.emit({
                    type,
                    source: 'RuntimePolicyEngine',
                    data
                });
            } catch (e) {
                // Rule 4: Event emission failure doesn't affect runtime
                console.debug('[PolicyEngine] Event emission skipped (non-critical)');
            }
        }
    }
    
    /**
     * Count active policies
     */
    _countActivePolicies() {
        return Array.from(this.policies.values())
            .filter(p => p.status === this.statuses.ACTIVE)
            .length;
    }
    
    /**
     * Get evaluation summary for a specific request type
     */
    getRequestTypeStats() {
        const stats = {};
        
        for (const decision of this.decisions) {
            const requestType = decision.request || 'unknown';
            if (!stats[requestType]) {
                stats[requestType] = { ALLOW: 0, DENY: 0, REVIEW: 0, total: 0 };
            }
            stats[requestType][decision.decision]++;
            stats[requestType].total++;
        }
        
        return stats;
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.RuntimePolicyEngine = new RuntimePolicyEngine();
    
    // API shortcuts
    window.LawAIApp.Policy = {
        // Registration
        register: (def) => window.LawAIApp.RuntimePolicyEngine.registerPolicy(def),
        get: (id) => window.LawAIApp.RuntimePolicyEngine.getPolicy(id),
        getByCategory: (cat) => window.LawAIApp.RuntimePolicyEngine.getPoliciesByCategory(cat),
        updateStatus: (id, status) => window.LawAIApp.RuntimePolicyEngine.updatePolicyStatus(id, status),
        
        // Evaluation
        evaluate: (policyId, request) => window.LawAIApp.RuntimePolicyEngine.evaluatePolicy(policyId, request),
        evaluateRequest: (request) => window.LawAIApp.RuntimePolicyEngine.evaluateRequest(request),
        isAllowed: (action, context) => window.LawAIApp.RuntimePolicyEngine.isAllowed(action, context),
        
        // Reporting
        getReport: () => window.LawAIApp.RuntimePolicyEngine.getReport(),
        getHealth: () => window.LawAIApp.RuntimePolicyEngine.getHealth(),
        getDecisions: (limit) => window.LawAIApp.RuntimePolicyEngine.getDecisionHistory(limit),
        getConflicts: () => window.LawAIApp.RuntimePolicyEngine.getConflicts(),
        getRequestTypeStats: () => window.LawAIApp.RuntimePolicyEngine.getRequestTypeStats()
    };
}
