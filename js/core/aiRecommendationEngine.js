// ================================================================
// aiRecommendationEngine.js — Part 46.5
// AI Recommendation System
// Version: v4.6.5
// Status: Architecture Implementation
// Layer: AI Runtime Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Generate Suggestions, Prioritize Solutions, Explain Benefits,
//   Estimate Impact. Reasoning → Actionable Recommendations.
//
// ARCHITECTURE POSITION
//   Context → Knowledge → Reasoning → Recommendation Engine → Suggestion
//
// RECOMMENDATION MODEL
//   { id, type, problem, suggestion, priority, impact, confidence }
//
// RECOMMENDATION TYPES
//   Performance   — 优化模块加载
//   State         — 解决不一致状态
//   Learning      — 调整学习工作流
//   Runtime       — 改进启动序列
//
// PRIORITY SYSTEM
//   Critical > High > Medium > Low
//   基于: Impact × Confidence × Risk
//
// RULES
//   Rule 1: AI 只提供建议
//   Rule 2: AI 不自动执行修改
//   Rule 3: Recommendation 必须有依据
//   Rule 4: 低 Confidence 不应强制建议
//
// DEPENDENCIES (read-only)
//   AIContextEngine, AIRuntimeKnowledge, AIReasoningEngine
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AIRecommendationEngine = {
    _version: '4.6.5',
    _ready: false,
    _recommendationHistory: [],
    _maxHistory: 50,
    _minConfidenceForRecommendation: 0.35,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Recommendation Engine v' + this._version + ' ready');
        console.log('   💡 Types: Performance, State, Learning, Runtime');
        console.log('   📊 Priority: Critical > High > Medium > Low');
        console.log('   🛡️ Safety: suggestions only, evidence-backed, confidence-gated');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 47: RECOMMENDATION MODEL
    // ============================================================

    /**
     * createRecommendation(type, problem, suggestion, priority, impact, confidence, evidence)
     * Factory for standardized Recommendation.
     */
    createRecommendation: function(type, problem, suggestion, priority, impact, confidence, evidence) {
        confidence = Math.max(0, Math.min(1, confidence || 0.5));

        // Rule 4: Low confidence → demote priority, mark as tentative
        var effectivePriority = priority;
        var tentative = false;
        if (confidence < this._minConfidenceForRecommendation) {
            effectivePriority = 'low';
            tentative = true;
        }

        var rec = {
            id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type: type,
            problem: problem,
            suggestion: suggestion,
            priority: effectivePriority,
            priorityLevel: this._priorityScore(effectivePriority),
            impact: impact,
            confidence: confidence,
            confidenceLevel: this._confidenceLabel(confidence),
            tentative: tentative,
            evidence: evidence || [],
            timestamp: new Date().toISOString()
        };

        // Rule 3: every recommendation must have evidence
        if (!rec.evidence || rec.evidence.length === 0) {
            rec.evidence = ['AI Reasoning Engine analysis'];
        }

        // Store
        this._recommendationHistory.push(rec);
        if (this._recommendationHistory.length > this._maxHistory) {
            this._recommendationHistory.shift();
        }

        return rec;
    },

    // ============================================================
    // CHAPTER 45: GENERATE RECOMMENDATIONS
    // ============================================================

    /**
     * recommend(reasoningResult, context)
     * Generates recommendations from reasoning results.
     * @param {Object} reasoningResult — from AIReasoningEngine.reason()
     * @param {Object} context — from AIContextEngine
     * @returns {Object} { recommendations, summary, priorityBreakdown }
     */
    recommend: function(reasoningResult, context) {
        if (!reasoningResult) {
            reasoningResult = this._getReasoning();
        }
        if (!context) {
            context = this._getContext();
        }

        var allRecommendations = [];

        // ── Process diagnostic findings ──
        if (reasoningResult.diagnostic) {
            var diagRecs = this._recommendFromDiagnostic(reasoningResult.diagnostic);
            allRecommendations = allRecommendations.concat(diagRecs);
        }

        // ── Process performance findings ──
        if (reasoningResult.performance) {
            var perfRecs = this._recommendFromPerformance(reasoningResult.performance);
            allRecommendations = allRecommendations.concat(perfRecs);
        }

        // ── Process state findings ──
        if (reasoningResult.state) {
            var stateRecs = this._recommendFromState(reasoningResult.state);
            allRecommendations = allRecommendations.concat(stateRecs);
        }

        // ── Process predictive findings ──
        if (reasoningResult.predictive) {
            var predRecs = this._recommendFromPredictive(reasoningResult.predictive);
            allRecommendations = allRecommendations.concat(predRecs);
        }

        // ── Sort by priority ──
        allRecommendations.sort(this._prioritySort);

        // ── Build summary ──
        var summary = this._buildRecommendationSummary(allRecommendations);
        var priorityBreakdown = this._buildPriorityBreakdown(allRecommendations);

        return {
            recommendations: allRecommendations,
            summary: summary,
            priorityBreakdown: priorityBreakdown,
            totalRecommendations: allRecommendations.length,
            timestamp: new Date().toISOString()
        };
    },

    /**
     * getActionableRecommendations(minPriority)
     * Returns only recommendations above a priority threshold.
     * @param {string} minPriority — 'critical' | 'high' | 'medium' | 'low'
     * @returns {Array}
     */
    getActionableRecommendations: function(minPriority) {
        var context = this._getContext();
        var reasoning = this._getReasoning();
        var result = this.recommend(reasoning, context);
        var minScore = this._priorityScore(minPriority || 'medium');

        return result.recommendations.filter(function(rec) {
            return rec.priorityLevel >= minScore;
        });
    },

    // ============================================================
    // CHAPTER 48: RECOMMENDATION TYPE GENERATORS
    // ============================================================

    // ── Runtime Recommendations ──

    _recommendFromDiagnostic: function(diagnosticResults) {
        var recs = [];

        for (var i = 0; i < diagnosticResults.length; i++) {
            var d = diagnosticResults[i];

            if (d.problem.indexOf('not booted') !== -1) {
                recs.push(this.createRecommendation(
                    'runtime',
                    d.problem,
                    'Initialize BootManager by calling LawAIApp.BootManager.start(). Ensure index.html auto-start trigger is functioning.',
                    'critical',
                    { scope: 'system', reversibility: 'safe', effort: 'low' },
                    d.confidence,
                    d.evidence
                ));
            } else if (d.problem.indexOf('incomplete') !== -1) {
                recs.push(this.createRecommendation(
                    'runtime',
                    d.problem,
                    'Run BootDiagnostics to identify failed stages. Check BootStageHandlers for missing or broken handler functions.',
                    'high',
                    { scope: 'pipeline', reversibility: 'safe', effort: 'medium' },
                    d.confidence,
                    d.evidence
                ));
            } else if (d.problem.indexOf('stalled') !== -1 || d.problem.indexOf('Stalled') !== -1) {
                recs.push(this.createRecommendation(
                    'runtime',
                    d.problem,
                    'Inspect the current stage handler for infinite loops or async deadlocks. Check browser console for the last completed stage log.',
                    'high',
                    { scope: 'pipeline', reversibility: 'safe', effort: 'medium' },
                    d.confidence,
                    d.evidence
                ));
            } else if (d.problem.indexOf('version') !== -1) {
                recs.push(this.createRecommendation(
                    'runtime',
                    d.problem,
                    'Verify SystemComposer.js is loaded correctly. Check that SystemComposer.version is set during init.',
                    'low',
                    { scope: 'metadata', reversibility: 'safe', effort: 'low' },
                    d.confidence,
                    d.evidence
                ));
            }
        }

        return recs;
    },

    // ── Performance Recommendations ──

    _recommendFromPerformance: function(perfResults) {
        var recs = [];

        for (var i = 0; i < perfResults.length; i++) {
            var p = perfResults[i];

            if (p.problem.indexOf('critically low') !== -1) {
                recs.push(this.createRecommendation(
                    'performance',
                    p.problem,
                    'Open RuntimePerformanceDashboard to identify slowest modules. Consider deferring non-critical module loading or optimizing initialization logic.',
                    'high',
                    { scope: 'performance', reversibility: 'reversible', effort: 'high' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('Boot duration is high') !== -1) {
                recs.push(this.createRecommendation(
                    'performance',
                    p.problem,
                    'Audit loader.js STAGES configuration. Move non-critical modules to later stages (ux, intelligence, background) to reduce initial boot time.',
                    'medium',
                    { scope: 'boot', reversibility: 'safe', effort: 'medium' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('Multiple performance warnings') !== -1) {
                recs.push(this.createRecommendation(
                    'performance',
                    p.problem,
                    'Review Performance report warnings in priority order. Address highest-frequency warnings first for maximum impact.',
                    'medium',
                    { scope: 'optimization', reversibility: 'reversible', effort: 'medium' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('High module count') !== -1) {
                recs.push(this.createRecommendation(
                    'performance',
                    p.problem,
                    'Evaluate module consolidation: merge small related modules, lazy-load infrequently used engines, and consider code-splitting for large modules.',
                    'medium',
                    { scope: 'architecture', reversibility: 'complex', effort: 'high' },
                    p.confidence,
                    p.evidence
                ));
            }
        }

        return recs;
    },

    // ── State Recommendations ──

    _recommendFromState: function(stateResults) {
        var recs = [];

        for (var i = 0; i < stateResults.length; i++) {
            var s = stateResults[i];

            if (s.problem.indexOf('conflict(s) detected') !== -1) {
                recs.push(this.createRecommendation(
                    'state',
                    s.problem,
                    'Run StateConflictResolver to identify conflicting state keys and sources. Resolve by prioritizing the most recent or authoritative source.',
                    'high',
                    { scope: 'data', reversibility: 'requires-review', effort: 'medium' },
                    s.confidence,
                    s.evidence
                ));
            } else if (s.problem.indexOf('state reports not ready') !== -1) {
                recs.push(this.createRecommendation(
                    'state',
                    s.problem,
                    'Verify RuntimeStateIntegration is called after boot completion. Ensure StateSyncEngine.update("runtime.state", ...) fires on SYSTEM_READY.',
                    'medium',
                    { scope: 'integration', reversibility: 'safe', effort: 'low' },
                    s.confidence,
                    s.evidence
                ));
            } else if (s.problem.indexOf('sync is idle') !== -1) {
                recs.push(this.createRecommendation(
                    'state',
                    s.problem,
                    'Audit modules for StateSyncEngine.update() calls. State changes should trigger sync to maintain history and enable trend analysis.',
                    'low',
                    { scope: 'observability', reversibility: 'safe', effort: 'medium' },
                    s.confidence,
                    s.evidence
                ));
            } else if (s.problem.indexOf('No state snapshots') !== -1) {
                recs.push(this.createRecommendation(
                    'state',
                    s.problem,
                    'Configure StatePersistence to auto-snapshot at intervals (e.g., every 30s or on significant state changes).',
                    'medium',
                    { scope: 'recovery', reversibility: 'safe', effort: 'low' },
                    s.confidence,
                    s.evidence
                ));
            }
        }

        return recs;
    },

    // ── Predictive/Learning Recommendations ──

    _recommendFromPredictive: function(predResults) {
        var recs = [];

        for (var i = 0; i < predResults.length; i++) {
            var p = predResults[i];

            if (p.problem.indexOf('continue to degrade') !== -1) {
                recs.push(this.createRecommendation(
                    'learning',
                    p.problem,
                    'Proactively address performance warnings now to prevent cascading degradation. Schedule a performance review cycle.',
                    'medium',
                    { scope: 'maintenance', reversibility: 'reversible', effort: 'medium' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('Event volume') !== -1) {
                recs.push(this.createRecommendation(
                    'learning',
                    p.problem,
                    'Implement event retention policy. Archive or aggregate events older than a threshold to maintain store performance.',
                    'low',
                    { scope: 'storage', reversibility: 'reversible', effort: 'medium' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('conflicts may increase') !== -1) {
                recs.push(this.createRecommendation(
                    'learning',
                    p.problem,
                    'Investigate root cause of state conflicts before they multiply. Add conflict prevention rules to StateConflictResolver.',
                    'medium',
                    { scope: 'prevention', reversibility: 'safe', effort: 'medium' },
                    p.confidence,
                    p.evidence
                ));
            } else if (p.problem.indexOf('Boot time may scale') !== -1) {
                recs.push(this.createRecommendation(
                    'learning',
                    p.problem,
                    'Create a module loading budget. Each new module should justify its boot time cost. Document acceptable boot time thresholds.',
                    'low',
                    { scope: 'planning', reversibility: 'safe', effort: 'low' },
                    p.confidence,
                    p.evidence
                ));
            }
        }

        return recs;
    },

    // ============================================================
    // CHAPTER 49: PRIORITY SYSTEM
    // ============================================================

    /**
     * calculatePriority(impact, confidence, risk)
     * Calculates priority from impact × confidence × risk factors.
     * @returns {string} 'critical' | 'high' | 'medium' | 'low'
     */
    calculatePriority: function(impact, confidence, risk) {
        var impactScore = this._impactScore(impact);
        var riskScore = typeof risk === 'number' ? risk : (risk === 'high' ? 3 : risk === 'medium' ? 2 : 1);
        var weightedScore = impactScore * confidence * riskScore;

        if (weightedScore >= 6) return 'critical';
        if (weightedScore >= 4) return 'high';
        if (weightedScore >= 2) return 'medium';
        return 'low';
    },

    _impactScore: function(impact) {
        if (typeof impact === 'object' && impact.scope) {
            switch (impact.scope) {
                case 'system': return 3;
                case 'pipeline': return 2.5;
                case 'data': return 2;
                case 'performance': return 2;
                case 'boot': return 1.5;
                default: return 1;
            }
        }
        return 1;
    },

    _priorityScore: function(priority) {
        switch (priority) {
            case 'critical': return 4;
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 0;
        }
    },

    _prioritySort: function(a, b) {
        return (b.priorityLevel || 0) - (a.priorityLevel || 0);
    },

    // ============================================================
    // SUMMARY BUILDERS
    // ============================================================

    _buildRecommendationSummary: function(recommendations) {
        if (recommendations.length === 0) {
            return {
                message: 'No recommendations needed. System is operating optimally.',
                topAction: null
            };
        }

        var critical = recommendations.filter(function(r) { return r.priority === 'critical'; });
        var high = recommendations.filter(function(r) { return r.priority === 'high'; });
        var tentative = recommendations.filter(function(r) { return r.tentative; });

        var message = '';
        if (critical.length > 0) {
            message = critical.length + ' critical recommendation(s) require immediate attention.';
        } else if (high.length > 0) {
            message = high.length + ' high-priority recommendation(s) identified.';
        } else {
            message = recommendations.length + ' recommendation(s) available for review.';
        }

        if (tentative.length > 0) {
            message += ' ' + tentative.length + ' are tentative (low confidence).';
        }

        return {
            message: message,
            topAction: recommendations[0] || null,
            criticalCount: critical.length,
            highCount: high.length,
            tentativeCount: tentative.length
        };
    },

    _buildPriorityBreakdown: function(recommendations) {
        var breakdown = { critical: 0, high: 0, medium: 0, low: 0, total: recommendations.length };

        for (var i = 0; i < recommendations.length; i++) {
            var p = recommendations[i].priority;
            if (breakdown[p] !== undefined) breakdown[p]++;
        }

        // Percentages
        breakdown.criticalPct = breakdown.total > 0 ? Math.round((breakdown.critical / breakdown.total) * 100) : 0;
        breakdown.highPct = breakdown.total > 0 ? Math.round((breakdown.high / breakdown.total) * 100) : 0;
        breakdown.mediumPct = breakdown.total > 0 ? Math.round((breakdown.medium / breakdown.total) * 100) : 0;
        breakdown.lowPct = breakdown.total > 0 ? Math.round((breakdown.low / breakdown.total) * 100) : 0;

        return breakdown;
    },

    // ============================================================
    // BATCH OPERATIONS
    // ============================================================

    /**
     * getTopRecommendations(limit, minPriority)
     * Returns top N recommendations filtered by minimum priority.
     */
    getTopRecommendations: function(limit, minPriority) {
        limit = limit || 5;
        var context = this._getContext();
        var reasoning = this._getReasoning();
        var result = this.recommend(reasoning, context);
        var minScore = this._priorityScore(minPriority || 'low');

        return result.recommendations
            .filter(function(rec) { return rec.priorityLevel >= minScore; })
            .slice(0, limit);
    },

    /**
     * getRecommendationsByType(type)
     * Filters recommendations by type.
     */
    getRecommendationsByType: function(type) {
        return this._recommendationHistory.filter(function(rec) {
            return rec.type === type;
        });
    },

    // ============================================================
    // HISTORY
    // ============================================================

    getRecommendationHistory: function(limit) {
        limit = limit || 20;
        return this._recommendationHistory.slice(-limit).reverse();
    },

    getRecommendationHistorySize: function() {
        return this._recommendationHistory.length;
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getContext: function() {
        try {
            if (LawAIApp.AIContextEngine && typeof LawAIApp.AIContextEngine.getFullContext === 'function') {
                return LawAIApp.AIContextEngine.getFullContext();
            }
        } catch (e) { /* ignore */ }
        return {
            runtimeStatus: { status: 'idle', booted: false, booting: false, uptime: 0, version: 'N/A', pipeline: { status: 'idle', stagesCompleted: 0, stagesTotal: 9, totalDuration: null, currentStage: null } },
            performance: { available: false, hasData: false, score: 0, bootDuration: null, totalModules: 0, warnings: [] },
            events: { available: false, hasData: false, totalEvents: 0, sessionCount: 0, recentEvents: [], insights: [], risks: [] },
            states: { available: false, totalStates: 0, states: [], syncStatus: 'unknown', conflictCount: 0, runtimeState: null },
            timestamp: new Date().toISOString()
        };
    },

    _getReasoning: function() {
        try {
            if (LawAIApp.AIReasoningEngine && typeof LawAIApp.AIReasoningEngine.reason === 'function') {
                var context = this._getContext();
                var knowledge = null;
                if (LawAIApp.AIRuntimeKnowledge && typeof LawAIApp.AIRuntimeKnowledge.interpret === 'function') {
                    knowledge = LawAIApp.AIRuntimeKnowledge.interpret(context);
                }
                return LawAIApp.AIReasoningEngine.reason(context, knowledge);
            }
        } catch (e) { /* ignore */ }
        return { diagnostic: [], performance: [], state: [], predictive: [], summary: { severity: 'none' }, totalFindings: 0 };
    },

    _confidenceLabel: function(confidence) {
        if (confidence >= 0.8) return 'high';
        if (confidence >= 0.5) return 'medium';
        if (confidence >= 0.3) return 'low';
        return 'speculative';
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            historySize: this._recommendationHistory.length,
            minConfidence: this._minConfidenceForRecommendation
        };
    }
};

// ── Auto-init ──
LawAIApp.AIRecommendationEngine.init();

console.log('🧠 AI Recommendation Engine — Part 46.5 Complete');
console.log('   ✅ Types: Runtime, Performance, State, Learning');
console.log('   ✅ Priority: Critical > High > Medium > Low (Impact × Confidence × Risk)');
console.log('   ✅ Safety: suggestions-only, evidence-backed, confidence-gated');
console.log('   ✅ Rules: AI只建议, 不自动执行, 有依据, 低置信度降级');
console.log('   ✅ Ready for Part 46.6 — AI Runtime Interaction');
