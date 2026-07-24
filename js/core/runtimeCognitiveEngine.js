// ================================================================
// runtimeCognitiveEngine.js — Part 48.1
// Cognitive Engine Foundation
// Version: v4.8.1
// Status: Architecture Foundation
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Understanding, Reasoning, Prediction, Decision Support.
//   Upgrades Runtime from Information → Cognitive Understanding.
//
// ARCHITECTURE POSITION
//   Runtime Data → Knowledge Graph → Cognitive Engine → AI Assistant → Recommendation
//
// COGNITIVE COMPONENTS
//   Dependency Understanding, Impact Understanding,
//   Root Cause Analysis, Prediction Engine, Decision Support
//
// COGNITIVE MODEL
//   { observation, analysis, cause, impact, prediction, confidence }
//
// RULES
//   Rule 1: Cognitive Engine 只能基于 Runtime Knowledge
//   Rule 2: 预测必须包含 Confidence
//   Rule 3: Cognitive Result 不得直接修改 Runtime
//   Rule 4: Unknown 必须明确标记
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RuntimeCognitiveEngine = {
    _version: '4.8.1',
    _ready: false,
    _results: [],
    _maxResults: 30,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 Runtime Cognitive Engine v' + this._version + ' ready');
        console.log('   🧩 Components: Dependency, Impact, Root Cause, Prediction, Decision');
        console.log('   📊 Model: observation → analysis → cause → impact → prediction');
        console.log('   🛡️ Rules: knowledge-based, confidence-rated, read-only, unknown-flagged');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 6: COGNITIVE RESULT FACTORY
    // ============================================================

    _createResult: function(observation, analysis, cause, impact, prediction, confidence, sources) {
        confidence = Math.max(0, Math.min(1, confidence || 0.5));

        var result = {
            id: 'cog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            observation: observation || 'No observation recorded',
            analysis: analysis || 'Analysis not available',
            cause: cause || 'Cause unknown — insufficient data',  // Rule 4
            impact: impact || 'Impact unknown',
            prediction: prediction || 'No prediction available',
            confidence: confidence,
            confidenceLevel: confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low',
            sources: sources || ['CognitiveEngine'],
            timestamp: new Date().toISOString()
        };

        this._results.push(result);
        if (this._results.length > this._maxResults) {
            this._results.shift();
        }

        return result;
    },

    // ============================================================
    // CHAPTER 5: COGNITIVE COMPONENTS
    // ============================================================

    /**
     * understand(entityId)
     * Full cognitive understanding of an entity.
     * Aggregates all available knowledge sources.
     */
    understand: function(entityId) {
        var kg = this._getKG();
        var registry = this._getRegistry();
        var relEngine = this._getRelEngine();
        var analyzer = this._getAnalyzer();
        var impactEngine = this._getImpactEngine();
        var integration = this._getIntegration();

        var observation = '';
        var analysisParts = [];
        var cause = '';
        var impact = '';
        var prediction = '';
        var confidence = 0.5;
        var sources = [];

        // ── Observation ──
        var entity = null;
        if (registry) entity = registry.get(entityId);
        if (!entity && kg) entity = kg.getNode(entityId);
        if (!entity) {
            return this._createResult('Entity not found: ' + entityId, '', 'Entity not registered', '', '', 0.1, []);
        }

        observation = 'Entity "' + entityId + '" is a ' + (entity.type || 'unknown') + ' type.';
        sources.push('EntityRegistry');

        // ── Analysis: dependencies + relationships ──
        if (analyzer) {
            try {
                var depAnalysis = analyzer.analyzeDependencies(entityId);
                analysisParts.push(depAnalysis.summary);
                if (depAnalysis.details && depAnalysis.details.circularDependencies && depAnalysis.details.circularDependencies.length > 0) {
                    analysisParts.push('Circular dependencies detected: ' + depAnalysis.details.circularDependencies.join(', '));
                }
                confidence = Math.max(confidence, depAnalysis.confidence);
                sources.push('KnowledgeGraphAnalyzer');
            } catch (e) { /* ignore */ }
        }

        // ── Cause: root cause indicators ──
        if (relEngine) {
            var deps = relEngine.getBySource(entityId).filter(function(r) { return r.type === 'depends_on'; });
            if (deps.length > 0) {
                var depNames = deps.map(function(r) { return r.targetEntity; }).join(', ');
                cause = entityId + ' depends on: ' + depNames + '. Issues in dependencies may cascade.';
            } else {
                cause = 'No direct dependencies identified. Isolation may indicate missing relationships.';
            }
            sources.push('RelationshipEngine');
        }

        // ── Impact ──
        if (impactEngine) {
            try {
                var impactSummary = impactEngine.getImpactSummary(entityId);
                impact = 'Impact level: ' + (impactSummary.impactLevel || 'none').toUpperCase() +
                         ', Risk: ' + (impactSummary.riskScore || 0) + '%, ' +
                         'Affects ' + (impactSummary.totalAffected || 0) + ' entities.';
                sources.push('ImpactAnalysisEngine');
            } catch (e) { /* ignore */ }
        } else if (relEngine) {
            var affected = relEngine.getBySource(entityId).length;
            impact = 'Directly related to ' + affected + ' entities through outgoing relationships.';
        }

        // ── Prediction ── (Rule 2: confidence required)
        if (analyzer && impactEngine) {
            try {
                var connectivity = analyzer.analyzeConnectivity(entityId);
                var riskScore = impactEngine.getImpactSummary(entityId).riskScore || 0;

                if (riskScore > 70) {
                    prediction = 'High risk of cascading failures. Recommend immediate dependency review.';
                    confidence = 0.7;
                } else if (riskScore > 40) {
                    prediction = 'Moderate risk. Changes to ' + entityId + ' may have noticeable downstream effects.';
                    confidence = 0.6;
                } else if (riskScore > 0) {
                    prediction = 'Low risk. Impact is contained to a small number of entities.';
                    confidence = 0.5;
                } else {
                    prediction = 'No predictable impact. Entity appears stable.';
                    confidence = 0.4;
                }
            } catch (e) { /* ignore */ }
        } else {
            prediction = 'Insufficient data for prediction — graph analysis tools not fully available.';
            confidence = 0.2;
        }

        // ── Assemble ──
        var fullAnalysis = analysisParts.join(' ');
        if (!fullAnalysis) fullAnalysis = 'Entity registered with no extended analysis.';

        return this._createResult(observation, fullAnalysis, cause, impact, prediction, confidence, sources);
    },

    /**
     * predict(entityId)
     * Focused prediction for an entity.
     */
    predict: function(entityId) {
        var result = this.understand(entityId);
        return {
            entityId: entityId,
            prediction: result.prediction,
            confidence: result.confidence,
            basedOn: result.sources,
            timestamp: result.timestamp
        };
    },

    /**
     * assess()
     * Full cognitive assessment of the entire Runtime.
     */
    assess: function() {
        var kg = this._getKG();
        var analyzer = this._getAnalyzer();
        var impactEngine = this._getImpactEngine();
        var health = analyzer ? analyzer.analyzeHealth() : null;

        var observations = [];
        var risks = [];
        var recommendations = [];

        // Health-based observations
        if (health && health.details) {
            var hd = health.details;
            observations.push('Graph Health: ' + (hd.healthScore || '?') + '%');
            if (hd.orphanCount > 0) observations.push(hd.orphanCount + ' orphan node(s) detected');
            if (hd.totalNodes) observations.push(hd.totalNodes + ' nodes, ' + (hd.totalEdges || 0) + ' edges');
        }

        // Risk assessment
        if (health && health.details && health.details.issues) {
            var issues = health.details.issues;
            for (var i = 0; i < issues.length; i++) {
                if (issues[i].severity === 'high') {
                    risks.push('High severity: ' + issues[i].type + ' (' + issues[i].count + ')');
                }
            }
        }

        // Key entities to watch
        var keyEntities = ['BootManager', 'AIContextEngine', 'StateSyncEngine', 'Performance'];
        for (var i = 0; i < keyEntities.length; i++) {
            try {
                var pred = this.predict(keyEntities[i]);
                if (pred.confidence < 0.5) {
                    recommendations.push(keyEntities[i] + ': Low prediction confidence — more data needed');
                }
            } catch (e) { /* ignore */ }
        }

        return this._createResult(
            'Full Runtime Cognitive Assessment',
            observations.join('; ') || 'Assessment complete',
            risks.length > 0 ? risks.join('; ') : 'No critical risks identified',
            'System-wide assessment across ' + (health && health.details ? health.details.totalNodes || '?' : '?') + ' entities',
            recommendations.length > 0 ? recommendations.join('; ') : 'System appears stable',
            health ? (health.confidence || 0.7) : 0.4,
            ['KnowledgeGraphAnalyzer', 'ImpactAnalysisEngine', 'CognitiveEngine']
        );
    },

    // ============================================================
    // DECISION SUPPORT
    // ============================================================

    /**
     * evaluateDecision(entityId, proposedChange)
     * Evaluates potential impact of a proposed change.
     * @param {string} entityId — entity being changed
     * @param {string} proposedChange — description of proposed change
     */
    evaluateDecision: function(entityId, proposedChange) {
        var impact = this.understand(entityId);
        var impactEngine = this._getImpactEngine();
        var riskScore = 0;

        if (impactEngine) {
            try {
                var summary = impactEngine.getImpactSummary(entityId);
                riskScore = summary.riskScore || 0;
            } catch (e) { /* ignore */ }
        }

        var decision = {
            entityId: entityId,
            proposedChange: proposedChange || 'Unspecified change',
            riskScore: riskScore,
            riskLevel: riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low',
            impactSummary: impact.impact,
            recommendation: riskScore >= 70
                ? '⚠️ High risk — review full impact chain before proceeding'
                : riskScore >= 40
                    ? '⚡ Moderate risk — proceed with monitoring'
                    : '✅ Low risk — safe to proceed',
            confidence: impact.confidence,
            timestamp: new Date().toISOString()
        };

        return decision;
    },

    // ============================================================
    // HELPERS
    // ============================================================

    _getKG: function() { return LawAIApp.RuntimeKnowledgeGraph || null; },
    _getRegistry: function() { return LawAIApp.RuntimeEntityRegistry || null; },
    _getRelEngine: function() { return LawAIApp.RuntimeRelationshipEngine || null; },
    _getAnalyzer: function() { return LawAIApp.KnowledgeGraphAnalyzer || null; },
    _getImpactEngine: function() { return LawAIApp.ImpactAnalysisEngine || null; },
    _getIntegration: function() { return LawAIApp.AIKnowledgeIntegration || null; },

    // ============================================================
    // HISTORY
    // ============================================================

    getResults: function(limit) {
        limit = limit || 10;
        return this._results.slice(-limit).reverse();
    },

    getResultCount: function() {
        return this._results.length;
    },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            totalResults: this._results.length,
            kgAvailable: !!this._getKG(),
            analyzerAvailable: !!this._getAnalyzer(),
            impactAvailable: !!this._getImpactEngine()
        };
    }
};

// ── Auto-init ──
LawAIApp.RuntimeCognitiveEngine.init();

console.log('🧠 Runtime Cognitive Engine — Part 48.1 Complete');
console.log('   ✅ Cognitive Model: observation → analysis → cause → impact → prediction');
console.log('   ✅ Components: understand(), predict(), assess(), evaluateDecision()');
console.log('   ✅ Rules: knowledge-based, confidence-rated, read-only, unknown-flagged');
console.log('   ✅ Ready for Part 48.2 — Dependency Intelligence Engine');
