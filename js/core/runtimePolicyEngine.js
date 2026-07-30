// ============================================================
// runtimePolicyEngine.js
// Part 49.2 — Runtime Policy Engine (with 7 Default Policies)
// Version: v4.9.2
// ============================================================

(function() {
    'use strict';

    function RuntimePolicyEngine() {
        this._policies = {};
        this._decisionHistory = [];
        this._conflicts = [];
        this._maxHistory = 100;
        this._initialized = false;

        // ── 7 个默认策略 (包含你原来的 6 个 + default_allow) ──
        this._defaultPolicies = [
            // 1. Critical Module Protection
            {
                id: 'POL-RT-001',
                name: 'Critical Module Protection',
                description: 'Prevent unloading of critical runtime modules',
                enabled: true,
                category: 'runtime',
                action: 'deny',
                priority: 1,
                condition: function(request) {
                    var criticalModules = ['BootManager', 'GovernanceFoundation', 'PolicyEngine', 'StateSyncEngine'];
                    return request.action === 'unloadModule' && criticalModules.indexOf(request.moduleName) !== -1;
                },
                metadata: {
                    defaultDecision: 'DENY',
                    explanation: 'Critical modules cannot be unloaded during runtime',
                    scope: ['module_management'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 2. State Change Authorization
            {
                id: 'POL-RT-002',
                name: 'State Change Authorization',
                description: 'Runtime state changes must come from authorized sources',
                enabled: true,
                category: 'runtime',
                action: 'review',
                priority: 2,
                condition: function(request) {
                    var authorizedSources = ['BootManager', 'StateSyncEngine', 'SystemAPI'];
                    return request.action === 'changeState' && authorizedSources.indexOf(request.source) === -1;
                },
                metadata: {
                    defaultDecision: 'REVIEW',
                    explanation: 'Unauthorized state changes require review',
                    scope: ['state_management'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 3. AI Confidence Requirement
            {
                id: 'POL-AI-001',
                name: 'AI Confidence Requirement',
                description: 'AI decisions with low confidence require review',
                enabled: true,
                category: 'ai',
                action: 'review',
                priority: 2,
                condition: function(request) {
                    return request.action && request.action.indexOf('ai_') === 0 && 
                           request.confidence !== undefined && request.confidence < 0.7;
                },
                metadata: {
                    defaultDecision: 'REVIEW',
                    explanation: 'AI decisions below 70% confidence require human review',
                    threshold: 0.7,
                    scope: ['ai_decisions'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 4. AI Self-Modification Prevention
            {
                id: 'POL-AI-002',
                name: 'AI Self-Modification Prevention',
                description: 'Prevent AI from modifying its own safety constraints',
                enabled: true,
                category: 'ai',
                action: 'deny',
                priority: 1,
                condition: function(request) {
                    var protectedParams = ['confidenceThreshold', 'safetyLevel', 'maxTokens'];
                    return request.action === 'ai_modifyConfig' && 
                           protectedParams.indexOf(request.parameter) !== -1 && 
                           request.source === 'ai';
                },
                metadata: {
                    defaultDecision: 'DENY',
                    explanation: 'AI cannot modify its own safety parameters',
                    scope: ['ai_safety'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 5. Data Access Logging
            {
                id: 'POL-SEC-001',
                name: 'Data Access Logging',
                description: 'All sensitive data access must be logged',
                enabled: true,
                category: 'security',
                action: 'deny',
                priority: 2,
                condition: function(request) {
                    var sensitiveActions = ['readUserData', 'readSystemConfig', 'accessStorage'];
                    return sensitiveActions.indexOf(request.action) !== -1 && !request.auditLogged;
                },
                metadata: {
                    defaultDecision: 'DENY',
                    explanation: 'Sensitive data access requires audit logging enabled',
                    scope: ['data_access'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 6. Resource Usage Control
            {
                id: 'POL-PERF-001',
                name: 'Resource Usage Control',
                description: 'Operations consuming significant resources require review',
                enabled: true,
                category: 'performance',
                action: 'review',
                priority: 3,
                condition: function(request) {
                    return request.estimatedCost && request.estimatedCost > 100;
                },
                metadata: {
                    defaultDecision: 'REVIEW',
                    explanation: 'Operations estimated to consume >100 units require review',
                    threshold: 100,
                    scope: ['performance'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 7. Personal Data Protection
            {
                id: 'POL-DATA-001',
                name: 'Personal Data Protection',
                description: 'Access to personal data requires explicit authorization',
                enabled: true,
                category: 'data',
                action: 'deny',
                priority: 2,
                condition: function(request) {
                    var personalDataTypes = ['userProfile', 'learningHistory', 'assessmentResults'];
                    return personalDataTypes.indexOf(request.dataType) !== -1 && !request.hasConsent;
                },
                metadata: {
                    defaultDecision: 'DENY',
                    explanation: 'Personal data access requires user consent',
                    scope: ['personal_data'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            },
            // 8. Default Allow (fallback)
            {
                id: 'default_allow',
                name: 'Default Allow',
                description: 'Allow all actions by default (fallback)',
                enabled: true,
                category: 'default',
                action: 'allow',
                priority: 99,
                condition: null,
                metadata: {
                    defaultDecision: 'ALLOW',
                    explanation: 'Fallback policy: allow when no other policy applies',
                    scope: ['*'],
                    createdBy: 'system',
                    createdAt: Date.now()
                }
            }
        ];
    }

    // ── 初始化 ──
    RuntimePolicyEngine.prototype.init = function() {
        if (this._initialized) return;
        for (var i = 0; i < this._defaultPolicies.length; i++) {
            this.registerPolicy(this._defaultPolicies[i]);
        }
        this._initialized = true;
        console.log('[RuntimePolicyEngine] Initialized with ' + Object.keys(this._policies).length + ' policies');
        return this;
    };

    // ── 注册策略 ──
    RuntimePolicyEngine.prototype.registerPolicy = function(def) {
        if (!def || !def.id) {
            console.warn('[RuntimePolicyEngine] Invalid policy definition');
            return false;
        }
        if (this._policies[def.id]) {
            console.warn('[RuntimePolicyEngine] Policy already exists:', def.id);
            return false;
        }
        var policy = {
            id: def.id,
            name: def.name || def.id,
            description: def.description || '',
            enabled: def.enabled !== undefined ? def.enabled : true,
            category: def.category || 'general',
            action: def.action || 'allow',
            condition: def.condition || null,
            priority: def.priority || 0,
            metadata: def.metadata || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this._policies[def.id] = policy;
        this._logDecision({ action: 'register', policyId: def.id, decision: 'registered' });
        return true;
    };

    // ── 获取策略 ──
    RuntimePolicyEngine.prototype.getPolicy = function(id) {
        return this._policies[id] || null;
    };

    // ── 获取所有策略 ──
    RuntimePolicyEngine.prototype.getAllPolicies = function() {
        var result = [];
        for (var id in this._policies) {
            if (this._policies.hasOwnProperty(id)) {
                result.push(this._policies[id]);
            }
        }
        return result;
    };

    // ── 按分类获取 ──
    RuntimePolicyEngine.prototype.getPoliciesByCategory = function(category) {
        var result = [];
        for (var id in this._policies) {
            if (this._policies.hasOwnProperty(id)) {
                if (this._policies[id].category === category) {
                    result.push(this._policies[id]);
                }
            }
        }
        return result;
    };

    // ── 更新状态 ──
    RuntimePolicyEngine.prototype.updatePolicyStatus = function(id, status) {
        var policy = this._policies[id];
        if (!policy) return false;
        policy.enabled = status === 'enabled' || status === true;
        policy.updatedAt = Date.now();
        return true;
    };

    // ── 评估单个策略 ──
    RuntimePolicyEngine.prototype.evaluatePolicy = function(policyId, request) {
        var policy = this._policies[policyId];
        if (!policy) return { allowed: false, reason: 'Policy not found' };
        if (!policy.enabled) return { allowed: false, reason: 'Policy disabled' };
        if (policy.condition) {
            try {
                var result = this._evaluateCondition(policy.condition, request);
                if (!result) return { allowed: false, reason: 'Condition not met' };
            } catch(e) {
                return { allowed: false, reason: 'Condition error: ' + e.message };
            }
        }
        return { allowed: policy.action === 'allow', reason: 'Policy matched' };
    };

    // ── 评估请求 ──
    RuntimePolicyEngine.prototype.evaluateRequest = function(request) {
        if (!request) return { allowed: false, reason: 'No request', decision: 'deny' };
        var policies = this.getAllPolicies();
        policies.sort(function(a, b) { return (b.priority || 0) - (a.priority || 0); });
        for (var i = 0; i < policies.length; i++) {
            var policy = policies[i];
            if (!policy.enabled) continue;
            var result = this.evaluatePolicy(policy.id, request);
            if (result.allowed !== undefined) {
                this._logDecision({
                    action: request.action || 'unknown',
                    policyId: policy.id,
                    decision: result.allowed ? 'allow' : 'deny',
                    request: request,
                    reason: result.reason
                });
                return {
                    allowed: result.allowed,
                    policyId: policy.id,
                    reason: result.reason,
                    decision: result.allowed ? 'allow' : 'deny'
                };
            }
        }
        this._logDecision({
            action: request.action || 'unknown',
            decision: 'deny',
            reason: 'No matching policy',
            request: request
        });
        return { allowed: false, reason: 'No matching policy', decision: 'deny' };
    };

    // ── 快速检查 ──
    RuntimePolicyEngine.prototype.isAllowed = function(action, context) {
        var request = { action: action, context: context || {} };
        return this.evaluateRequest(request).allowed;
    };

    // ── 获取报告 ──
    RuntimePolicyEngine.prototype.getReport = function() {
        var policies = this.getAllPolicies();
        var enabledCount = 0;
        var byCategory = {};
        for (var i = 0; i < policies.length; i++) {
            var p = policies[i];
            if (p.enabled) enabledCount++;
            if (!byCategory[p.category]) byCategory[p.category] = 0;
            byCategory[p.category]++;
        }
        return {
            total: policies.length,
            enabled: enabledCount,
            disabled: policies.length - enabledCount,
            byCategory: byCategory,
            policies: policies,
            status: this.getHealth()
        };
    };

    // ── 健康状态 ──
    RuntimePolicyEngine.prototype.getHealth = function() {
        var policies = this.getAllPolicies();
        var enabledCount = 0;
        for (var i = 0; i < policies.length; i++) {
            if (policies[i].enabled) enabledCount++;
        }
        var score = policies.length === 0 ? 0 : Math.round((enabledCount / policies.length) * 100);
        return {
            status: score >= 80 ? 'healthy' : (score >= 50 ? 'warning' : 'critical'),
            healthScore: score,
            activePolicies: enabledCount,
            totalPolicies: policies.length,
            violations: 0
        };
    };

    // ── 决策历史 ──
    RuntimePolicyEngine.prototype.getDecisionHistory = function(limit) {
        limit = limit || this._maxHistory;
        return this._decisionHistory.slice(-limit);
    };

    // ── 冲突 ──
    RuntimePolicyEngine.prototype.getConflicts = function() {
        return this._conflicts;
    };

    // ── 请求类型统计 ──
    RuntimePolicyEngine.prototype.getRequestTypeStats = function() {
        var stats = {};
        for (var i = 0; i < this._decisionHistory.length; i++) {
            var d = this._decisionHistory[i];
            var action = d.action || 'unknown';
            if (!stats[action]) stats[action] = 0;
            stats[action]++;
        }
        return stats;
    };

    // ── 记录决策 ──
    RuntimePolicyEngine.prototype._logDecision = function(entry) {
        entry.timestamp = Date.now();
        this._decisionHistory.push(entry);
        if (this._decisionHistory.length > this._maxHistory) {
            this._decisionHistory.shift();
        }
    };

    // ── 评估条件 ──
    RuntimePolicyEngine.prototype._evaluateCondition = function(condition, request) {
        if (typeof condition === 'function') return condition(request);
        if (typeof condition === 'string') {
            try {
                return new Function('request', 'return ' + condition)(request);
            } catch(e) {
                return false;
            }
        }
        return true;
    };

    // ── 重置 ──
    RuntimePolicyEngine.prototype.reset = function() {
        this._policies = {};
        this._decisionHistory = [];
        this._conflicts = [];
        this._initialized = false;
        this.init();
        return this;
    };

    // ── 获取策略详情 (新增) ──
    RuntimePolicyEngine.prototype.getPolicyDetails = function(id) {
        var policy = this._policies[id];
        if (!policy) return null;
        return {
            id: policy.id,
            name: policy.name,
            description: policy.description,
            enabled: policy.enabled,
            category: policy.category,
            action: policy.action,
            priority: policy.priority,
            metadata: policy.metadata,
            createdAt: policy.createdAt,
            updatedAt: policy.updatedAt
        };
    };

    // ── 按状态获取 ──
    RuntimePolicyEngine.prototype.getPoliciesByStatus = function(enabled) {
        var result = [];
        for (var id in this._policies) {
            if (this._policies.hasOwnProperty(id)) {
                if (this._policies[id].enabled === enabled) {
                    result.push(this._policies[id]);
                }
            }
        }
        return result;
    };

    // ============================================================
    // 导出到全局
    // ============================================================

    if (typeof window !== 'undefined') {
        if (!window.LawAIApp) window.LawAIApp = {};
        var engine = new RuntimePolicyEngine();
        engine.init();
        window.LawAIApp.RuntimePolicyEngine = engine;

        window.LawAIApp.Policy = {
            register: function(def) { return engine.registerPolicy(def); },
            get: function(id) { return engine.getPolicy(id); },
            getAll: function() { return engine.getAllPolicies(); },
            getByCategory: function(cat) { return engine.getPoliciesByCategory(cat); },
            getByStatus: function(enabled) { return engine.getPoliciesByStatus(enabled); },
            updateStatus: function(id, status) { return engine.updatePolicyStatus(id, status); },
            evaluate: function(policyId, request) { return engine.evaluatePolicy(policyId, request); },
            evaluateRequest: function(request) { return engine.evaluateRequest(request); },
            isAllowed: function(action, context) { return engine.isAllowed(action, context); },
            getReport: function() { return engine.getReport(); },
            getHealth: function() { return engine.getHealth(); },
            getDecisions: function(limit) { return engine.getDecisionHistory(limit); },
            getConflicts: function() { return engine.getConflicts(); },
            getRequestTypeStats: function() { return engine.getRequestTypeStats(); },
            getPolicyDetails: function(id) { return engine.getPolicyDetails(id); }
        };

        console.log('✅ [RuntimePolicyEngine] Policy API registered');
        console.log('   📋 Policies loaded:', Object.keys(engine._policies).length);
    }

})();
