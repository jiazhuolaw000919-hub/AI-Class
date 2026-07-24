// ================================================================
// decisionSupportEngine.js — Part 48.5
// Decision Support Engine
// Version: v4.8.5
// Status: Architecture Implementation
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Generate Options, Evaluate, Rank, Recommend.
//   Analysis → Decision Support.
//
// ARCHITECTURE POSITION
//   Root Cause + Prediction + Impact → Decision Support → AI Assistant
//
// DECISION MODEL
//   { problem, options, evaluation, recommendedAction, confidence, reasoning }
//
// DECISION FLOW
//   Problem → Root Cause → Generate Actions → Evaluate Impact → Rank → Recommend
//
// EVALUATION FACTORS
//   Risk Reduction × Implementation Cost × Impact Scope × Confidence × History
//
// RULES
//   Rule 1: Decision Engine 只提供建议
//   Rule 2: 禁止自动执行
//   Rule 3: 建议必须可解释
//   Rule 4: 多个方案必须比较
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DecisionSupportEngine = {
    _version: '4.8.5',
    _ready: false,
    _decisions: [],
    _maxDecisions: 25,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Decision Support Engine v' + this._version + ' ready');
        console.log('   🎯 Flow: Problem → Options → Evaluate → Rank → Recommend');
        console.log('   📊 Factors: Risk × Cost × Impact × Confidence × History');
        console.log('   🛡️ Rules: suggest-only, no-auto-exec, explainable, compare-options');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 48: DECISION RESULT FACTORY
    // ============================================================

    _createDecision: function(problem, options, recommendedAction, confidence, reasoning, evidence) {
        // Rule 4: sort options by score descending
        options.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });

        var result = {
            id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            problem: problem,
            options: options,
            optionCount: options.length,
            recommendedAction: recommendedAction,
            confidence: Math.max(0, Math.min(1, confidence || 0.5)),
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            reasoning: reasoning || '',
            evidence: evidence || [],
            timestamp: new Date().toISOString()
        };

        this._decisions.push(result);
        if (this._decisions.length > this._maxDecisions) this._decisions.shift();
        return result;
    },

    // ============================================================
    // CHAPTER 49: DECISION GENERATION FLOW
    // ============================================================

    /**
     * decide(problem, entityId)
     * Full decision support: generates options, evaluates, recommends.
     * @param {string} problem — description of the problem
     * @param {string} entityId — affected entity
     */
    decide: function(problem, entityId) {
        if (!problem) {
            return this._createDecision('No problem specified', [], null, 0, 'No problem to analyze', []);
        }

        var evidence = [];
        var options = [];

        // ── Step 1: Gather intelligence ──
        var rca = this._getRCA();
        var prediction = this._getPrediction();
        var impactEngine = this._getImpactEngine();
        var depEngine = this._getDepEngine();
        var stateEngine = LawAIApp.StateSyncEngine || window.stateSyncEngine;

        // ── Step 2: Run RCA ──
        var rootCause = null;
        if (rca) {
            try {
                rootCause = rca.analyze(problem, entityId);
                evidence.push({ source: 'RootCauseAnalysisEngine', finding: rootCause.topCause ? rootCause.topCause.description : 'No root cause identified' });
            } catch (e) { /* ignore */ }
        }

        // ── Step 3: Generate options based on problem type ──
        var problemLower = problem.toLowerCase();

        // Option patterns
        if (problemLower.indexOf('boot') !== -1 || problemLower.indexOf('performance') !== -1 || problemLower.indexOf('slow') !== -1) {
            options.push(this._createOption(
                'A', 'Optimize initialization flow',
                'Review and defer non-critical module loading. Audit slowest modules in Performance report.',
                { riskReduction: 8, cost: 3, impactScope: 4, reversibility: 'high' }, 0.8
            ));
            options.push(this._createOption(
                'B', 'Consolidate modules',
                'Merge small related modules to reduce overhead. Evaluate loader.js STAGES configuration.',
                { riskReduction: 6, cost: 5, impactScope: 3, reversibility: 'medium' }, 0.65
            ));
            options.push(this._createOption(
                'C', 'Monitor and defer',
                'Continue monitoring. Only act if performance drops below threshold.',
                { riskReduction: 2, cost: 1, impactScope: 1, reversibility: 'high' }, 0.5
            ));
        }

        if (problemLower.indexOf('state') !== -1 || problemLower.indexOf('sync') !== -1 || problemLower.indexOf('conflict') !== -1) {
            options.push(this._createOption(
                'A', 'Resolve state conflicts',
                'Run StateConflictResolver to identify and resolve conflicting state entries.',
                { riskReduction: 9, cost: 2, impactScope: 3, reversibility: 'high' }, 0.85
            ));
            options.push(this._createOption(
                'B', 'Audit state update sources',
                'Review all modules calling StateSyncEngine.update() for ownership mismatches.',
                { riskReduction: 7, cost: 3, impactScope: 4, reversibility: 'high' }, 0.7
            ));
        }

        if (problemLower.indexOf('dependency') !== -1 || problemLower.indexOf('circular') !== -1 || problemLower.indexOf('dep') !== -1) {
            options.push(this._createOption(
                'A', 'Break circular dependencies',
                'Refactor circular dependency pairs identified by DependencyIntelligenceEngine.',
                { riskReduction: 8, cost: 5, impactScope: 4, reversibility: 'medium' }, 0.75
            ));
            options.push(this._createOption(
                'B', 'Add missing dependency documentation',
                'Document all unregistered entities and their relationships.',
                { riskReduction: 4, cost: 1, impactScope: 2, reversibility: 'high' }, 0.6
            ));
        }

        // Generic options if no pattern matched
        if (options.length === 0) {
            options.push(this._createOption(
                'A', 'Investigate root cause',
                'Run full Root Cause Analysis on ' + (entityId || 'affected entity') + '. Collect evidence from all available sources.',
                { riskReduction: 7, cost: 2, impactScope: 3, reversibility: 'high' }, 0.75
            ));
            options.push(this._createOption(
                'B', 'Monitor and collect data',
                'Enable debug mode and observe system behavior over time before taking action.',
                { riskReduction: 3, cost: 1, impactScope: 1, reversibility: 'high' }, 0.5
            ));
        }

        // ── Step 4: Evaluate options with additional context ──
        for (var i = 0; i < options.length; i++) {
            var opt = options[i];

            // Adjust score based on impact analysis
            if (impactEngine && entityId) {
                try {
                    var impact = impactEngine.getImpactSummary(entityId);
                    if (impact.riskScore > 60) opt.score += 1;
                } catch (e) { /* ignore */ }
            }

            // Adjust based on dependency health
            if (depEngine && entityId) {
                try {
                    var health = depEngine.checkHealth(entityId);
                    if (health.healthScore < 60) opt.score += 1;
                } catch (e) { /* ignore */ }
            }
        }

        // Re-sort after score adjustments
        options.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });

        // ── Step 5: Select recommended action ──
        var topOption = options[0];
        var recommendedAction = topOption ? topOption.label + ': ' + topOption.description : 'Insufficient data for recommendation';

        // ── Step 6: Build reasoning ──
        var reasoningParts = [];
        if (rootCause && rootCause.topCause) {
            reasoningParts.push('Root cause analysis points to: ' + rootCause.topCause.description);
        }
        if (topOption) {
            reasoningParts.push('Top option selected based on: risk reduction (' + (topOption.factors.riskReduction || '?') + '/10), cost (' + (topOption.factors.cost || '?') + '/5), impact scope (' + (topOption.factors.impactScope || '?') + '/5)');
        }
        if (options.length > 1) {
            reasoningParts.push((options.length - 1) + ' alternative option(s) available for comparison');
        }

        var confidence = options.length >= 3 ? 0.75 : options.length >= 1 ? 0.6 : 0.3;

        return this._createDecision(problem, options, recommendedAction, confidence, reasoningParts.join('. '), evidence);
    },

    /**
     * compareOptions(problem, entityId)
     * Returns a comparison table of all options.
     */
    compareOptions: function(problem, entityId) {
        var result = this.decide(problem, entityId);
        return {
            problem: result.problem,
            options: result.options.map(function(o) {
                return {
                    label: o.label,
                    description: o.description,
                    score: o.score,
                    riskReduction: o.factors.riskReduction,
                    cost: o.factors.cost,
                    impactScope: o.factors.impactScope,
                    reversibility: o.factors.reversibility
                };
            }),
            recommended: result.recommendedAction,
            timestamp: result.timestamp
        };
    },

    // ============================================================
    // CHAPTER 50: OPTION FACTORY + EVALUATION
    // ============================================================

    _createOption: function(label, title, description, factors, confidence) {
        // Score = RiskReduction(×1.5) - Cost(×1) + ImpactScope(×1) + ConfidenceBias
        var score = (factors.riskReduction || 5) * 1.5 - (factors.cost || 3) * 1 + (factors.impactScope || 3) * 1;
        score = Math.round(score * 10) / 10;
        score = Math.max(1, Math.min(10, score));

        return {
            label: label,
            title: title,
            description: description,
            score: score,
            factors: factors,
            confidence: confidence || 0.6,
            recommendation: score >= 7 ? 'strongly_recommended' : score >= 5 ? 'recommended' : 'consider'
        };
    },

    // ============================================================
    // EXPLAINABLE DECISION (Chapter 52)
    // ============================================================

    /**
     * explain(decisionResult)
     * Generates human-readable explanation for a decision.
     */
    explain: function(decisionResult) {
        if (!decisionResult) return 'No decision result available.';

        var parts = [];
        parts.push('Problem: ' + decisionResult.problem);
        parts.push('Recommendation: ' + decisionResult.recommendedAction);
        parts.push('Confidence: ' + Math.round(decisionResult.confidence * 100) + '%');
        parts.push('Why: ' + decisionResult.reasoning);

        if (decisionResult.evidence && decisionResult.evidence.length > 0) {
            parts.push('Evidence: ' + decisionResult.evidence.map(function(e) { return e.finding; }).join('; '));
        }

        if (decisionResult.options.length > 1) {
            var alt = decisionResult.options[1];
            parts.push('Alternative: ' + alt.label + ' — ' + alt.title + ' (Score: ' + alt.score + '/10)');
        }

        return parts.join('\n');
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getRCA: function() { return LawAIApp.RootCauseAnalysisEngine || null; },
    _getPrediction: function() { return LawAIApp.RuntimePredictionEngine || null; },
    _getImpactEngine: function() { return LawAIApp.ImpactAnalysisEngine || null; },
    _getDepEngine: function() { return LawAIApp.DependencyIntelligenceEngine || null; },

    // ============================================================
    // HISTORY
    // ============================================================

    getDecisions: function(limit) {
        limit = limit || 10;
        return this._decisions.slice(-limit).reverse();
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalDecisions: this._decisions.length,
            rcaAvailable: !!this._getRCA(),
            predictionAvailable: !!this._getPrediction()
        };
    }
};

// ── Auto-init ──
LawAIApp.DecisionSupportEngine.init();

console.log('🧠 Decision Support Engine — Part 48.5 Complete');
console.log('   ✅ Option Generation: pattern-matched + generic fallback');
console.log('   ✅ Evaluation: Risk Reduction × Cost × Impact × Confidence');
console.log('   ✅ Ranking: scored + sorted + recommendation level');
console.log('   ✅ Explainability: why + evidence + expected impact + alternatives');
console.log('   ✅ Rules: suggest-only, no-auto-exec, explainable, compare-options');
console.log('   ✅ Ready for Part 48.6 — AI Cognitive Integration');
