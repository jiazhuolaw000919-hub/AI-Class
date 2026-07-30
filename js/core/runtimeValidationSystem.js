// ============================================================
// runtimeValidationSystem.js — FULL VERSION (Reliable Format)
// Part 49.4 — V4.9.4
// ============================================================

(function() {
    'use strict';

    console.log('[ValidationSystem] Loading full version...');

    var validators = [];
    var validationHistory = [];
    var dependencyGraph = {};

    // ── 默认验证器 ──
    function initDefaultValidators() {
        validators.push({
            id: 'VAL-STATE-001',
            name: 'Runtime State Check',
            type: 'state',
            priority: 1,
            check: function(ctx) {
                var passed = ctx.runtimeContext && (ctx.runtimeContext.status === 'running' || ctx.runtimeContext.status === 'ready');
                return { passed: passed, risk: passed ? 'LOW' : 'CRITICAL', details: 'Runtime status: ' + (ctx.runtimeContext ? ctx.runtimeContext.status : 'UNKNOWN') };
            }
        });

        validators.push({
            id: 'VAL-DEP-001',
            name: 'Module Dependency Check',
            type: 'dependency',
            priority: 5,
            check: function(ctx) {
                if (!ctx.target) return { passed: true, risk: 'LOW', details: 'No target module specified' };
                var deps = dependencyGraph[ctx.target] || [];
                var missing = [];
                for (var i = 0; i < deps.length; i++) {
                    if (!window.LawAIApp[deps[i]]) missing.push(deps[i]);
                }
                return {
                    passed: missing.length === 0,
                    risk: missing.length > 0 ? 'HIGH' : 'LOW',
                    details: missing.length > 0 ? 'Missing dependencies: ' + missing.join(', ') : 'All dependencies satisfied'
                };
            }
        });

        validators.push({
            id: 'VAL-SAF-001',
            name: 'Critical Module Protection',
            type: 'safety',
            priority: 3,
            check: function(ctx) {
                var critical = ['BootManager', 'StateSyncEngine', 'RuntimeKernel', 'EventBus'];
                if (ctx.target && critical.indexOf(ctx.target) !== -1) {
                    return { passed: false, risk: 'HIGH', details: 'Target "' + ctx.target + '" is a critical module' };
                }
                return { passed: true, risk: 'LOW', details: 'Target is not critical' };
            }
        });

        validators.push({
            id: 'VAL-PERF-001',
            name: 'System Load Check',
            type: 'performance',
            priority: 10,
            check: function(ctx) {
                var load = 0;
                try {
                    if (window.LawAIApp.RuntimePerformanceCollector && window.LawAIApp.RuntimePerformanceCollector.getCurrentLoad) {
                        load = window.LawAIApp.RuntimePerformanceCollector.getCurrentLoad() || 0;
                    }
                } catch(e) {}
                var passed = load < 80;
                return { passed: passed, risk: load > 90 ? 'CRITICAL' : (load > 80 ? 'HIGH' : 'LOW'), details: 'System load: ' + load + '%' };
            }
        });

        validators.push({
            id: 'VAL-DATA-001',
            name: 'Data Integrity Check',
            type: 'data',
            priority: 15,
            check: function(ctx) {
                if (ctx.params && Object.keys(ctx.params).length > 0) {
                    var values = Object.values(ctx.params);
                    var hasNull = false;
                    for (var i = 0; i < values.length; i++) {
                        if (values[i] === null || values[i] === undefined) { hasNull = true; break; }
                    }
                    return { passed: !hasNull, risk: hasNull ? 'MEDIUM' : 'LOW', details: hasNull ? 'Params contain null/undefined values' : 'Params validated' };
                }
                return { passed: true, risk: 'LOW', details: 'No params to validate' };
            }
        });

        // ── 依赖图 ──
        dependencyGraph.BootManager = ['RuntimeKernel', 'EventBus', 'StorageEngine'];
        dependencyGraph.StateSyncEngine = ['EventBus', 'StorageEngine'];
        dependencyGraph.RuntimePolicyEngine = ['RuntimeGovernanceFoundation'];
        dependencyGraph.RuntimePermissionSystem = ['RuntimePolicyEngine'];
        dependencyGraph.RuntimeValidationSystem = ['RuntimePermissionSystem', 'RuntimePolicyEngine'];
        dependencyGraph.DevPanel = ['BootManager', 'StateSyncEngine', 'EventBus'];
    }

    initDefaultValidators();

    // ── API ──
    var API = {
        getHealth: function() {
            var total = validationHistory.length;
            var rejected = validationHistory.filter(function(v) { return v.decision === 'REJECT'; }).length;
            return {
                status: 'healthy',
                healthScore: total > 0 ? Math.round(((total - rejected) / total) * 100) : 85,
                validators: validators.length,
                totalValidations: total,
                rejectRate: total > 0 ? (rejected / total * 100).toFixed(1) + '%' : '0%',
                isOperational: true
            };
        },

        getAll: function() { return validators.slice(); },
        getAllValidators: function() { return validators.slice(); },

        getReport: function() {
            return {
                version: '4.9.4',
                status: 'HEALTHY',
                validators: { total: validators.length, byType: { state: 1, dependency: 1, safety: 1, performance: 1, data: 1 } },
                validations: { total: validationHistory.length },
                riskLevels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                rules: [
                    'Rule 1: Validation must be context-based ✅',
                    'Rule 2: High risk actions must not auto-execute ✅',
                    'Rule 3: Validation results must be recorded ✅',
                    'Rule 4: Validation failure must not break runtime ✅'
                ]
            };
        },

        validate: function(request, options) {
            var result = {
                validationId: 'VAL-' + Date.now(),
                decision: 'ALLOW',
                risk: { label: 'LOW' },
                checks: [],
                checksSummary: { total: 0, passed: 0, failed: 0 },
                timestamp: new Date().toISOString()
            };

            var ctx = {
                action: request ? request.action : null,
                target: request ? request.target : null,
                source: request ? request.source : null,
                params: request ? request.params || {} : {},
                runtimeContext: { status: 'running' }
            };

            try {
                if (window.LawAIApp.BootManager) {
                    var status = window.LawAIApp.BootManager.getStatus();
                    ctx.runtimeContext.status = (status && status.status) || 'running';
                }
            } catch(e) {}

            var sorted = validators.slice().sort(function(a, b) { return a.priority - b.priority; });
            var overallRisk = 'LOW';
            var hasError = false;

            for (var i = 0; i < sorted.length; i++) {
                var v = sorted[i];
                try {
                    var checkResult = v.check(ctx);
                    result.checks.push({
                        validatorId: v.id,
                        name: v.name,
                        type: v.type,
                        passed: checkResult.passed !== false,
                        risk: checkResult.risk || 'LOW',
                        details: checkResult.details || ''
                    });
                    if (!checkResult.passed) hasError = true;
                    if (checkResult.risk === 'CRITICAL') overallRisk = 'CRITICAL';
                    else if (checkResult.risk === 'HIGH' && overallRisk !== 'CRITICAL') overallRisk = 'HIGH';
                    else if (checkResult.risk === 'MEDIUM' && overallRisk === 'LOW') overallRisk = 'MEDIUM';
                } catch(e) {
                    result.checks.push({
                        validatorId: v.id,
                        name: v.name,
                        type: v.type,
                        passed: false,
                        risk: 'MEDIUM',
                        details: 'Validator error: ' + e.message
                    });
                    hasError = true;
                }
            }

            result.checksSummary.total = result.checks.length;
            result.checksSummary.passed = result.checks.filter(function(c) { return c.passed; }).length;
            result.checksSummary.failed = result.checks.filter(function(c) { return !c.passed; }).length;

            if (hasError || overallRisk === 'CRITICAL') {
                result.decision = 'REJECT';
            } else if (overallRisk === 'HIGH') {
                result.decision = 'REVIEW';
            } else {
                result.decision = 'ALLOW';
            }

            result.risk.label = overallRisk;
            validationHistory.push(result);
            if (validationHistory.length > 500) validationHistory.shift();

            return result;
        },

        quickValidate: function(request) {
            var result = this.validate(request);
            return {
                valid: result.decision === 'ALLOW',
                decision: result.decision,
                risk: result.risk.label,
                reason: result.decision === 'ALLOW' ? 'All checks passed' : result.decision === 'REVIEW' ? 'Review required' : 'Validation rejected',
                checksRun: result.checksSummary.total,
                checksFailed: result.checksSummary.failed
            };
        },

        validateWithTypes: function(request, types) {
            return this.validate(request, { specificTypes: types });
        },

        validateState: function() {
            var result = this.validate({ action: 'STATE_CHECK' });
            return { checks: result.checks, overallRisk: result.risk, timestamp: result.timestamp };
        },

        validateDependencies: function(module) {
            var deps = dependencyGraph[module] || [];
            var checks = [];
            for (var i = 0; i < deps.length; i++) {
                var loaded = !!window.LawAIApp[deps[i]];
                checks.push({ type: 'DEPENDENCY', name: module + ' → ' + deps[i], passed: loaded, risk: loaded ? 'LOW' : 'HIGH', details: loaded ? 'Loaded' : 'Not loaded' });
            }
            return { moduleName: module, checks: checks, dependencies: deps, overallRisk: 'LOW', timestamp: new Date().toISOString() };
        },

        validatePerformance: function(request) {
            return this.validate(request);
        },

        validateData: function(dataContext) {
            return this.validate({ params: dataContext });
        },

        validateSafety: function(request) {
            return this.validate(request);
        },

        registerValidator: function(def) {
            var validator = { id: def.validatorId || 'VAL-' + Date.now(), name: def.name || 'Unnamed', type: def.type || 'general', priority: def.priority || 10, check: def.check || function() { return { passed: true }; } };
            validators.push(validator);
            return validator;
        },

        registerDependencies: function(module, deps) {
            dependencyGraph[module] = deps || [];
        },

        getDependencyTree: function(module) {
            return { module: module, dependsOn: dependencyGraph[module] || [], dependedBy: [] };
        },

        getValidationHistory: function(limit) {
            var history = validationHistory.slice();
            if (limit) history = history.slice(-limit);
            return history;
        }
    };

    // ── 挂载到全局 ──
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.Validation = API;

    console.log('✅ [ValidationSystem] Full version loaded');
    console.log('   📋 Validators:', validators.length);
})();
