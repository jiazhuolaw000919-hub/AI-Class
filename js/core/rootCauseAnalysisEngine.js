// ================================================================
// rootCauseAnalysisEngine.js — Part 48.3
// Root Cause Analysis Engine
// Version: v4.8.3
// Status: Architecture Implementation
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Issue Detection, Cause Discovery, Ranking, Evidence Collection,
//   Explanation Generation. Surface problem ≠ true cause.
//
// ARCHITECTURE POSITION
//   Runtime Event → Knowledge Graph → Dependency Intelligence → Root Cause → AI Assistant
//
// ROOT CAUSE MODEL
//   { issue, possibleCauses, ranking, evidence, confidence, timestamp }
//
// ANALYSIS PROCESS
//   Issue → Collect Entities → Analyze Deps → Check History → Evaluate → Root Cause
//
// RULES
//   Rule 1: Root Cause 必须有 Evidence
//   Rule 2: 多个可能原因必须排序
//   Rule 3: 低 Confidence 不得作为确定答案
//   Rule 4: 分析结果不得自动修改系统
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RootCauseAnalysisEngine = {
    _version: '4.8.3',
    _ready: false,
    _analyses: [],
    _maxAnalyses: 30,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Root Cause Analysis Engine v' + this._version + ' ready');
        console.log('   🔍 Process: Issue → Entities → Deps → History → Evaluate → Root Cause');
        console.log('   📊 Ranking: Dependency × Events × Performance × State × Impact');
        console.log('   🛡️ Rules: evidence-backed, ranked, confidence-gated, read-only');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 25: ROOT CAUSE RESULT FACTORY
    // ============================================================

    _createResult: function(issue, causes, evidence, confidence) {
        // Rule 2: sort by score descending
        causes.sort(function(a, b) { return (b.score || 0) - (a.score || 0); });

        // Rule 3: if top cause has low confidence, mark uncertain
        var topCause = causes[0];
        var isUncertain = !topCause || topCause.score < 4;

        var result = {
            id: 'rca_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            issue: issue,
            possibleCauses: causes,
            topCause: topCause || null,
            topCauseScore: topCause ? topCause.score : 0,
            isUncertain: isUncertain,
            evidence: evidence || [],
            evidenceCount: (evidence || []).length,
            confidence: Math.max(0, Math.min(1, confidence || 0.5)),
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            timestamp: new Date().toISOString()
        };

        this._analyses.push(result);
        if (this._analyses.length > this._maxAnalyses) this._analyses.shift();
        return result;
    },

    // ============================================================
    // CHAPTER 26: ANALYSIS PROCESS
    // ============================================================

    /**
     * analyze(issue, affectedEntityId)
     * Full root cause analysis for a given issue.
     * @param {string} issue — description of the problem
     * @param {string} affectedEntityId — primary entity experiencing the issue
     */
    analyze: function(issue, affectedEntityId) {
        if (!issue) {
            return this._createResult('No issue specified', [], [], 0);
        }

        var evidence = [];
        var causes = [];

        // ── Step 1: Collect related entities ──
        var relEngine = this._getRelEngine();
        var kg = this._getKG();
        var registry = this._getRegistry();
        var depEngine = this._getDepEngine();
        var impactEngine = this._getImpactEngine();

        var relatedEntities = [];
        if (affectedEntityId) {
            relatedEntities.push(affectedEntityId);
            if (relEngine) {
                var deps = relEngine.getBySource(affectedEntityId);
                for (var i = 0; i < deps.length; i++) {
                    if (relatedEntities.indexOf(deps[i].targetEntity) === -1) {
                        relatedEntities.push(deps[i].targetEntity);
                    }
                }
                var incoming = relEngine.getByTarget(affectedEntityId);
                for (var i = 0; i < incoming.length; i++) {
                    if (relatedEntities.indexOf(incoming[i].sourceEntity) === -1) {
                        relatedEntities.push(incoming[i].sourceEntity);
                    }
                }
            }
            evidence.push({
                source: 'RelationshipEngine',
                type: 'entity_graph',
                data: relatedEntities.length + ' related entities identified',
                relevance: 0.8
            });
        }

        // ── Step 2: Analyze dependencies for each related entity ──
        if (depEngine) {
            for (var i = 0; i < Math.min(relatedEntities.length, 5); i++) {
                try {
                    var depResult = depEngine.checkHealth(relatedEntities[i]);
                    if (depResult.healthScore < 80) {
                        causes.push({
                            entity: relatedEntities[i],
                            type: 'dependency_health',
                            description: relatedEntities[i] + ' has dependency health issues (' + depResult.healthScore + '%)',
                            score: Math.round((100 - depResult.healthScore) / 10),
                            details: depResult.issues
                        });
                        evidence.push({
                            source: 'DependencyIntelligenceEngine',
                            type: 'health_check',
                            data: relatedEntities[i] + ' health: ' + depResult.healthScore + '%',
                            relevance: 0.7
                        });
                    }
                } catch (e) { /* ignore */ }
            }
        }

        // ── Step 3: Check state changes ──
        var stateEngine = LawAIApp.StateSyncEngine || window.stateSyncEngine;
        if (stateEngine) {
            try {
                var runtimeState = stateEngine.get('runtime.state');
                if (runtimeState && !runtimeState.ready) {
                    causes.push({
                        entity: 'runtime.state',
                        type: 'state',
                        description: 'Runtime state reports not ready — boot may have failed or is incomplete',
                        score: 8
                    });
                    evidence.push({
                        source: 'StateSyncEngine',
                        type: 'state_check',
                        data: 'runtime.state.ready=false',
                        relevance: 0.9
                    });
                }
            } catch (e) { /* ignore */ }
        }

        // ── Step 4: Check performance data ──
        var perf = LawAIApp.Performance;
        if (perf && perf._bootDuration !== undefined) {
            if (perf._bootDuration > 5000) {
                causes.push({
                    entity: 'Performance',
                    type: 'performance',
                    description: 'Boot duration is high (' + perf._bootDuration + 'ms) — slow initialization may cause issues',
                    score: 5
                });
                evidence.push({
                    source: 'Performance',
                    type: 'boot_duration',
                    data: perf._bootDuration + 'ms boot time',
                    relevance: 0.6
                });
            }
        }

        // ── Step 5: Check Knowledge Graph health ──
        var analyzer = this._getAnalyzer();
        if (analyzer) {
            try {
                var health = analyzer.analyzeHealth();
                if (health.details && health.details.healthScore < 70) {
                    causes.push({
                        entity: 'KnowledgeGraph',
                        type: 'graph_health',
                        description: 'Knowledge Graph health is low (' + health.details.healthScore + '%) — analysis may be incomplete',
                        score: 3
                    });
                    evidence.push({
                        source: 'KnowledgeGraphAnalyzer',
                        type: 'graph_health',
                        data: 'Health: ' + health.details.healthScore + '%',
                        relevance: 0.5
                    });
                }
            } catch (e) { /* ignore */ }
        }

        // ── Step 6: Check event history ──
        var events = LawAIApp.Events;
        if (events && typeof events.getRisks === 'function') {
            try {
                var risks = events.getRisks();
                if (risks && risks.length > 0) {
                    for (var i = 0; i < Math.min(risks.length, 3); i++) {
                        causes.push({
                            entity: 'EventSystem',
                            type: 'event_risk',
                            description: 'Event risk detected: ' + (risks[i].message || risks[i].type || 'unknown'),
                            score: 4
                        });
                    }
                    evidence.push({
                        source: 'RuntimeEvents',
                        type: 'risk_check',
                        data: risks.length + ' event risks found',
                        relevance: 0.7
                    });
                }
            } catch (e) { /* ignore */ }
        }

        // ── Step 7: Impact level ──
        if (impactEngine && affectedEntityId) {
            try {
                var impact = impactEngine.getImpactSummary(affectedEntityId);
                if (impact.impactLevel === 'high' || impact.impactLevel === 'critical') {
                    causes.push({
                        entity: affectedEntityId,
                        type: 'impact',
                        description: affectedEntityId + ' has ' + impact.impactLevel + ' impact level — issues here propagate widely',
                        score: 6
                    });
                    evidence.push({
                        source: 'ImpactAnalysisEngine',
                        type: 'impact_check',
                        data: 'Impact: ' + impact.impactLevel + ', Risk: ' + impact.riskScore + '%',
                        relevance: 0.8
                    });
                }
            } catch (e) { /* ignore */ }
        }

        // ── Confidence ──
        var confidence = causes.length > 0 ? Math.min(0.9, 0.4 + causes.length * 0.1) : 0.2;
        if (evidence.length === 0) confidence = 0.15;

        return this._createResult(issue, causes, evidence, confidence);
    },

    /**
     * quickAnalysis(entityId)
     * Quick root cause check for a specific entity.
     */
    quickAnalysis: function(entityId) {
        return this.analyze('Issue related to ' + entityId, entityId);
    },

    /**
     * getExplanation(analysisResult)
     * Generates human-readable explanation from analysis.
     */
    getExplanation: function(analysisResult) {
        if (!analysisResult) return 'No analysis available.';

        if (analysisResult.isUncertain) {
            return 'Unable to determine root cause with confidence. ' +
                   (analysisResult.possibleCauses.length > 0
                       ? 'Possible factors: ' + analysisResult.possibleCauses.slice(0, 3).map(function(c) { return c.description; }).join('; ')
                       : 'Insufficient data for analysis.');
        }

        var top = analysisResult.topCause;
        var parts = [];
        parts.push('Most likely root cause: ' + top.description);
        parts.push('Confidence: ' + Math.round(analysisResult.confidence * 100) + '%');
        parts.push('Based on ' + analysisResult.evidenceCount + ' evidence sources');

        if (analysisResult.possibleCauses.length > 1) {
            parts.push(analysisResult.possibleCauses.length - 1 + ' other possible causes ranked below');
        }

        return parts.join('. ');
    },

    // ============================================================
    // CHAPTER 27: CAUSE SCORING
    // ============================================================

    _scoreCause: function(cause) {
        var score = 0;
        switch (cause.type) {
            case 'state': score += 8; break;
            case 'dependency_health': score += 6; break;
            case 'impact': score += 6; break;
            case 'event_risk': score += 4; break;
            case 'performance': score += 5; break;
            case 'graph_health': score += 3; break;
            default: score += 2;
        }
        return score;
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getRelEngine: function() { return LawAIApp.RuntimeRelationshipEngine || null; },
    _getKG: function() { return LawAIApp.RuntimeKnowledgeGraph || null; },
    _getRegistry: function() { return LawAIApp.RuntimeEntityRegistry || null; },
    _getDepEngine: function() { return LawAIApp.DependencyIntelligenceEngine || null; },
    _getImpactEngine: function() { return LawAIApp.ImpactAnalysisEngine || null; },
    _getAnalyzer: function() { return LawAIApp.KnowledgeGraphAnalyzer || null; },

    // ============================================================
    // HISTORY
    // ============================================================

    getAnalyses: function(limit) {
        limit = limit || 10;
        return this._analyses.slice(-limit).reverse();
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalAnalyses: this._analyses.length,
            depEngineAvailable: !!this._getDepEngine(),
            impactAvailable: !!this._getImpactEngine()
        };
    }
};

// ── Auto-init ──
LawAIApp.RootCauseAnalysisEngine.init();

console.log('🧠 Root Cause Analysis Engine — Part 48.3 Complete');
console.log('   ✅ Analysis Process: Issue → Entities → Deps → History → Evaluate → Root Cause');
console.log('   ✅ Cause Sources: Dependency Health, State, Performance, Events, Impact, Graph');
console.log('   ✅ Evidence Model: source + type + data + relevance');
console.log('   ✅ Ranking: scored + sorted, uncertain flagged');
console.log('   ✅ Rules: evidence-backed, ranked, confidence-gated, read-only');
console.log('   ✅ Ready for Part 48.4 — Prediction Engine');
