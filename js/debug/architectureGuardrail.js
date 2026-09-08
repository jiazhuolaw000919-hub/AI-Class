// js/debug/architectureGuardrail.js
// Part 160: Architecture Guardrails & Drift Prevention

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Architecture = window.LawAIApp.Architecture || {};

LawAIApp.Architecture.Guardrails = {
    _results: {},
    _initialized: false,

    /**
     * 运行所有架构守护检查
     */
    runAll: function() {
        this._initialized = true;
        var results = {};
        
        results['FIT-001'] = this._checkNoCrossDomainWrites();
        results['FIT-002'] = this._checkNoCircularDependencies();
        results['FIT-003'] = this._checkSingleAuthorityPerDomain();
        results['FIT-004'] = this._checkRecommendationBypassesArbitration();
        results['FIT-005'] = this._checkLLMDoesNotMutateAuthority();
        results['FIT-006'] = this._checkHistoricalDecisionImmutability();
        
        this._results = results;
        return results;
    },

    /**
     * FIT-001: 禁止跨域写入
     */
    _checkNoCrossDomainWrites: function() {
        var violations = [];
        
        // 检查 RecommendationEngine 是否直接写 Progress
        try {
            var rec = window.LawAIApp?.RecommendationEngine;
            if (rec) {
                // 检查是否有直接调用 ProgressEngine 写入方法
                var progressWrites = ['completeLesson', 'setXP', 'saveProgress'];
                for (var i = 0; i < progressWrites.length; i++) {
                    var method = progressWrites[i];
                    if (typeof rec[method] === 'function') {
                        violations.push({
                            type: 'Recommendation writes Progress',
                            method: method,
                            severity: 'critical'
                        });
                    }
                }
            }
        } catch (e) {}
        
        // 检查 RecommendationEngine 是否直接写 Mastery
        try {
            var rec = window.LawAIApp?.RecommendationEngine;
            if (rec) {
                var masteryWrites = ['recordEvidence', 'updateSkill'];
                for (var i = 0; i < masteryWrites.length; i++) {
                    var method = masteryWrites[i];
                    if (typeof rec[method] === 'function') {
                        violations.push({
                            type: 'Recommendation writes Mastery',
                            method: method,
                            severity: 'critical'
                        });
                    }
                }
            }
        } catch (e) {}
        
        return {
            rule: 'FIT-001',
            name: 'No Cross-Domain Writes',
            status: violations.length === 0 ? 'PASS' : 'FAIL',
            violations: violations,
            severity: violations.length > 0 ? 'critical' : 'info',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * FIT-002: 无循环核心依赖
     */
    _checkNoCircularDependencies: function() {
        var modules = ['ProgressEngine', 'MasteryEngine', 'Calendar', 'Settings', 'RecommendationEngine'];
        var cycles = [];
        
        // 检查依赖关系是否存在循环
        // 使用简单启发式：如果每个模块都依赖其他模块，可能有问题
        var dependencies = {};
        for (var i = 0; i < modules.length; i++) {
            var name = modules[i];
            var module = window.LawAIApp?.[name];
            dependencies[name] = [];
            if (module) {
                // 检查模块内部是否引用其他模块
                var moduleStr = module.toString ? module.toString() : '';
                for (var j = 0; j < modules.length; j++) {
                    if (i !== j && moduleStr.indexOf(modules[j]) !== -1) {
                        dependencies[name].push(modules[j]);
                    }
                }
            }
        }
        
        // 检测循环
        for (var key in dependencies) {
            var deps = dependencies[key];
            for (var k = 0; k < deps.length; k++) {
                var dep = deps[k];
                if (dependencies[dep] && dependencies[dep].indexOf(key) !== -1) {
                    cycles.push({
                        type: 'circular_dependency',
                        modules: [key, dep],
                        severity: 'high'
                    });
                }
            }
        }
        
        return {
            rule: 'FIT-002',
            name: 'No Circular Core Dependencies',
            status: cycles.length === 0 ? 'PASS' : 'FAIL',
            cycles: cycles,
            severity: cycles.length > 0 ? 'high' : 'info',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * FIT-003: 每个核心域一个权威
     */
    _checkSingleAuthorityPerDomain: function() {
        var violations = [];
        
        var domains = {
            'Progress': 'ProgressEngine',
            'Mastery': 'MasteryEngine',
            'Calendar': 'Calendar',
            'Settings': 'Settings',
            'Recommendation': 'RecommendationEngine'
        };
        
        for (var domain in domains) {
            var expected = domains[domain];
            var actual = window.LawAIApp?.[expected];
            
            if (!actual) {
                violations.push({
                    type: 'missing_authority',
                    domain: domain,
                    expected: expected,
                    severity: 'high'
                });
            }
        }
        
        // 检查是否有重复权威
        var authorNames = Object.values(domains);
        var unique = {};
        for (var i = 0; i < authorNames.length; i++) {
            var name = authorNames[i];
            var module = window.LawAIApp?.[name];
            if (module) {
                // 检查是否有另一个模块做同样的事
                for (var j = i + 1; j < authorNames.length; j++) {
                    var otherName = authorNames[j];
                    var other = window.LawAIApp?.[otherName];
                    if (other && module.constructor === other.constructor) {
                        violations.push({
                            type: 'duplicate_authority',
                            module1: name,
                            module2: otherName,
                            severity: 'critical'
                        });
                    }
                }
            }
        }
        
        return {
            rule: 'FIT-003',
            name: 'Single Authority Per Core Domain',
            status: violations.length === 0 ? 'PASS' : 'FAIL',
            violations: violations,
            severity: violations.some(function(v) { return v.severity === 'critical'; }) ? 'critical' : 'high',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * FIT-004: 推荐不能绕过仲裁
     */
    _checkRecommendationBypassesArbitration: function() {
        var violations = [];
        
        try {
            var rec = window.LawAIApp?.RecommendationEngine;
            if (rec) {
                // 检查是否有方法直接生成推荐而不经过仲裁
                var bypassMethods = ['generateRecommendation', 'getTopCandidates', 'getActiveRecommendations'];
                for (var i = 0; i < bypassMethods.length; i++) {
                    var method = bypassMethods[i];
                    if (typeof rec[method] === 'function') {
                        // 检查方法内部是否调用了 arbitrateCandidates
                        var fnStr = rec[method].toString ? rec[method].toString() : '';
                        if (fnStr.indexOf('arbitrateCandidates') === -1 && 
                            fnStr.indexOf('_rankCandidates') === -1) {
                            violations.push({
                                type: 'recommendation_bypasses_arbitration',
                                method: method,
                                severity: 'high'
                            });
                        }
                    }
                }
            }
        } catch (e) {}
        
        return {
            rule: 'FIT-004',
            name: 'Recommendation Bypasses Arbitration',
            status: violations.length === 0 ? 'PASS' : 'FAIL',
            violations: violations,
            severity: violations.length > 0 ? 'high' : 'info',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * FIT-005: LLM 不能直接修改权威状态
     */
    _checkLLMDoesNotMutateAuthority: function() {
        var violations = [];
        
        try {
            var llm = window.LawAIApp?.AIMentorEngine || window.LawAIApp?.AILayer;
            if (llm) {
                // 检查 LLM 是否有写入核心状态的方法
                var writeMethods = ['updateProgress', 'updateMastery', 'recordEvidence', 'completeLesson'];
                for (var i = 0; i < writeMethods.length; i++) {
                    var method = writeMethods[i];
                    if (typeof llm[method] === 'function') {
                        violations.push({
                            type: 'LLM_writes_authority',
                            method: method,
                            severity: 'critical'
                        });
                    }
                }
            }
        } catch (e) {}
        
        return {
            rule: 'FIT-005',
            name: 'LLM Does Not Mutate Authority',
            status: violations.length === 0 ? 'PASS' : 'FAIL',
            violations: violations,
            severity: violations.length > 0 ? 'critical' : 'info',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * FIT-006: 历史推荐决策不可变/可重建
     */
    _checkHistoricalDecisionImmutability: function() {
        var violations = [];
        
        try {
            var rec = window.LawAIApp?.RecommendationEngine;
            if (rec) {
                // 检查是否有 getDecisionRecord 方法
                if (typeof rec.getDecisionRecord !== 'function') {
                    violations.push({
                        type: 'missing_decision_record_access',
                        severity: 'medium'
                    });
                }
                
                // 检查是否有方法会修改历史决策
                var mutatingMethods = ['updateDecision', 'modifyDecision', 'overwriteDecision'];
                for (var i = 0; i < mutatingMethods.length; i++) {
                    var method = mutatingMethods[i];
                    if (typeof rec[method] === 'function') {
                        violations.push({
                            type: 'decision_mutation_method_exists',
                            method: method,
                            severity: 'high'
                        });
                    }
                }
            }
        } catch (e) {}
        
        return {
            rule: 'FIT-006',
            name: 'Historical Decision Immutability',
            status: violations.length === 0 ? 'PASS' : 'FAIL',
            violations: violations,
            severity: violations.some(function(v) { return v.severity === 'high'; }) ? 'high' : 'medium',
            checkedAt: new Date().toISOString()
        };
    },

    /**
     * 获取所有检查结果
     */
    getResults: function() {
        if (!this._initialized) {
            this.runAll();
        }
        return this._results;
    },

    /**
     * 获取摘要
     */
    getSummary: function() {
        var results = this.getResults();
        var summary = {
            total: 0,
            passed: 0,
            failed: 0,
            unknown: 0,
            criticalViolations: 0,
            highViolations: 0,
            details: []
        };
        
        for (var key in results) {
            var result = results[key];
            summary.total++;
            if (result.status === 'PASS') summary.passed++;
            else if (result.status === 'FAIL') summary.failed++;
            else summary.unknown++;
            
            if (result.severity === 'critical') summary.criticalViolations++;
            else if (result.severity === 'high') summary.highViolations++;
            
            summary.details.push({
                rule: result.rule,
                status: result.status,
                severity: result.severity,
                violations: result.violations || []
            });
        }
        
        return summary;
    },

    /**
     * 获取状态消息
     */
    getStatusMessage: function() {
        var summary = this.getSummary();
        if (summary.criticalViolations > 0) {
            return '🔴 CRITICAL: ' + summary.criticalViolations + ' critical violation(s) found';
        } else if (summary.highViolations > 0) {
            return '🟡 HIGH: ' + summary.highViolations + ' high severity violation(s) found';
        } else if (summary.failed > 0) {
            return '🟡 WARNING: ' + summary.failed + ' guardrail(s) failed';
        } else {
            return '🟢 ALL PASS: All architecture guardrails passed';
        }
    }
};

// 自动运行
setTimeout(function() {
    try {
        LawAIApp.Architecture.Guardrails.runAll();
        console.log('🏛️ Architecture Guardrails: ' + LawAIApp.Architecture.Guardrails.getStatusMessage());
    } catch (e) {
        console.warn('🏛️ Guardrails error:', e);
    }
}, 1000);

console.log('🏛️ Architecture Guardrails loaded (Part 160)');
