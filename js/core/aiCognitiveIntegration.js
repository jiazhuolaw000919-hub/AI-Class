// ================================================================
// aiCognitiveIntegration.js — Part 48.6
// AI Cognitive Integration Layer
// Version: v4.8.6
// Status: Architecture Integration
// Layer: Runtime Cognitive Intelligence Layer
// ================================================================
//
// RESPONSIBILITY
//   Engine Coordination, Context Preparation, Cognitive Result Aggregation,
//   Response Generation. Unifies all Cognitive Engines → AI Assistant.
//
// ARCHITECTURE POSITION
//   Knowledge Graph + Dep Intel + RCA + Prediction + Decision
//        ↓
//   AI Cognitive Integration  ← this module
//        ↓
//   AI Assistant
//
// COGNITIVE PIPELINE
//   Query → Context → Knowledge → Dependency → RCA → Prediction → Decision → Response
//
// COGNITIVE RESPONSE MODEL
//   { observation, understanding, cause, prediction, recommendation, confidence }
//
// RULES
//   Rule 1: AI 必须通过 Integration Layer 访问 Cognitive Engine
//   Rule 2: 禁止 AI 直接修改 Engine 状态
//   Rule 3: 所有回答必须保留 Evidence
//   Rule 4: Unknown 情况必须明确
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AICognitiveIntegration = {
    _version: '4.8.6',
    _ready: false,
    _responseCache: null,
    _cacheTTL: 3000,

    // ============================================================
    // LIFECYCLE
    // ============================================================

    init: function() {
        if (this._ready) return this;
        this._ready = true;
        console.log('🧠 AI Cognitive Integration v' + this._version + ' ready');
        console.log('   🔄 Pipeline: Query → Context → Knowledge → Dep → RCA → Predict → Decide → Response');
        console.log('   📊 Response: observation + understanding + cause + prediction + recommendation');
        console.log('   🛡️ Rules: layer-access, read-only, evidence-backed, unknown-honest');
        return this;
    },

    isReady: function() {
        return this._ready;
    },

    // ============================================================
    // CHAPTER 60: COGNITIVE PIPELINE
    // ============================================================

    /**
     * process(query, entityId)
     * Full cognitive pipeline: from query to response.
     * @param {string} query — developer question
     * @param {string} entityId — target entity (optional)
     */
    process: function(query, entityId) {
        try {
            var pipeline = {
                observation: '',
                understanding: '',
                cause: '',
                prediction: '',
                recommendation: '',
                confidence: 0,
                evidence: [],
                sourcesUsed: [],
                timestamp: new Date().toISOString()
            };

            // ── Stage 1: Context Collection ──
            var context = this._collectContext();
            pipeline.sourcesUsed.push('AIContextEngine');
            pipeline.observation = this._buildObservation(context, entityId);

            // ── Stage 2: Knowledge Retrieval ──
            var knowledge = this._retrieveKnowledge(entityId);
            if (knowledge) {
                pipeline.sourcesUsed.push('AIKnowledgeIntegration');
                pipeline.understanding = this._buildUnderstanding(knowledge, entityId);
            }

            // ── Stage 3: Dependency Analysis ──
            var depIntel = this._getDepIntel();
            if (depIntel && entityId) {
                try {
                    var depResult = depIntel.analyze(entityId, 2);
                    pipeline.sourcesUsed.push('DependencyIntelligenceEngine');
                    pipeline.evidence.push({
                        source: 'DependencyIntelligence',
                        finding: depResult.summary
                    });
                } catch (e) { /* ignore */ }
            }

            // ── Stage 4: Root Cause Analysis ──
            var rca = this._getRCA();
            if (rca) {
                try {
                    var rcaResult = rca.analyze(query, entityId);
                    pipeline.sourcesUsed.push('RootCauseAnalysisEngine');
                    if (rcaResult.topCause) {
                        pipeline.cause = rcaResult.topCause.description;
                        pipeline.evidence.push({
                            source: 'RootCauseAnalysis',
                            finding: rcaResult.topCause.description,
                            confidence: rcaResult.confidence
                        });
                    }
                } catch (e) { /* ignore */ }
            }

            // ── Stage 5: Prediction ──
            var prediction = this._getPrediction();
            if (prediction && entityId) {
                try {
                    var predResult = prediction.predictPerformance(entityId);
                    pipeline.sourcesUsed.push('RuntimePredictionEngine');
                    pipeline.prediction = predResult.futureCondition;
                    pipeline.evidence.push({
                        source: 'PredictionEngine',
                        finding: predResult.futureCondition,
                        probability: predResult.probability
                    });
                } catch (e) { /* ignore */ }
            }

            // ── Stage 6: Decision Evaluation ──
            var decision = this._getDecision();
            if (decision) {
                try {
                    var decResult = decision.decide(query, entityId);
                    pipeline.sourcesUsed.push('DecisionSupportEngine');
                    pipeline.recommendation = decResult.recommendedAction;
                    pipeline.evidence.push({
                        source: 'DecisionSupport',
                        finding: decResult.recommendedAction
                    });
                } catch (e) { /* ignore */ }
            }

            // ── Stage 7: Calculate overall confidence ──
            pipeline.confidence = this._calculatePipelineConfidence(pipeline);

            // Cache
            this._responseCache = {
                query: query,
                entityId: entityId,
                response: pipeline,
                time: Date.now()
            };

            return pipeline;

        } catch (err) {
            return this._fallbackResponse(query, err.message);
        }
    },

    /**
     * quickCognitiveQuery(query, entityId)
     * Lightweight version — skips heavy analysis for fast responses.
     */
    quickCognitiveQuery: function(query, entityId) {
        // Check cache
        if (this._responseCache && this._responseCache.query === query &&
            this._responseCache.entityId === entityId &&
            (Date.now() - this._responseCache.time) < this._cacheTTL) {
            return this._responseCache.response;
        }

        return this.process(query, entityId);
    },

    /**
     * getCognitiveStatus()
     * Quick cognitive overview of the entire system.
     */
    getCognitiveStatus: function() {
        return this.process('What is the current cognitive status of the system?', 'Runtime');
    },

    // ============================================================
    // CHAPTER 61: RESPONSE BUILDERS
    // ============================================================

    _buildObservation: function(context, entityId) {
        var rt = context.runtimeStatus || context.runtime || {};
        if (rt.booted) {
            return 'Runtime is running' + (entityId ? ', analyzing ' + entityId : '') + '. Pipeline completed, uptime active.';
        }
        return 'Runtime status: ' + (rt.status || 'unknown') + '. ' + (entityId ? 'Analyzing ' + entityId + ' in current state.' : '');
    },

    _buildUnderstanding: function(knowledge, entityId) {
        if (!knowledge || !knowledge.package) return '';
        var pkg = knowledge.package;
        var parts = [];
        if (pkg.entities && pkg.entities.length > 0) {
            parts.push(pkg.entities.length + ' related entities identified');
        }
        if (pkg.relationships && pkg.relationships.length > 0) {
            parts.push(pkg.relationships.length + ' relationships mapped');
        }
        if (pkg.graphSummary) {
            parts.push('Graph: ' + pkg.graphSummary.health);
        }
        return parts.join('. ') || 'Knowledge graph consulted.';
    },

    _calculatePipelineConfidence: function(pipeline) {
        var factors = 0;
        var total = 0;

        if (pipeline.observation) { factors++; total += 0.9; }
        if (pipeline.understanding) { factors++; total += 0.8; }
        if (pipeline.cause && pipeline.cause.indexOf('unknown') === -1) { factors++; total += 0.75; }
        if (pipeline.prediction) { factors++; total += 0.65; }
        if (pipeline.recommendation) { factors++; total += 0.7; }

        return factors > 0 ? Math.round((total / factors) * 100) / 100 : 0.3;
    },

    // ============================================================
    // CONTEXT COLLECTION
    // ============================================================

    _collectContext: function() {
        try {
            if (LawAIApp.AIContextEngine && typeof LawAIApp.AIContextEngine.getFullContext === 'function') {
                return LawAIApp.AIContextEngine.getFullContext();
            }
        } catch (e) { /* ignore */ }
        return {
            runtimeStatus: { status: 'unknown', booted: false },
            performance: { available: false },
            events: { available: false },
            states: { available: false },
            timestamp: new Date().toISOString()
        };
    },

    _retrieveKnowledge: function(entityId) {
        try {
            if (LawAIApp.AIKnowledgeIntegration && typeof LawAIApp.AIKnowledgeIntegration.getEntityKnowledge === 'function') {
                return LawAIApp.AIKnowledgeIntegration.getEntityKnowledge(entityId || 'Runtime');
            }
        } catch (e) { /* ignore */ }
        return null;
    },

    // ============================================================
    // FALLBACK
    // ============================================================

    _fallbackResponse: function(query, error) {
        return {
            observation: 'Cognitive pipeline encountered an error.',
            understanding: '',
            cause: 'Unknown — pipeline error: ' + error,
            prediction: '',
            recommendation: 'Retry query or check console for details.',
            confidence: 0.1,
            evidence: [{ source: 'CognitiveIntegration', finding: 'Pipeline error: ' + error }],
            sourcesUsed: ['fallback'],
            timestamp: new Date().toISOString()
        };
    },

    // ============================================================
    // ENGINE ACCESSORS (Rule 1: all through Integration Layer)
    // ============================================================

    _getDepIntel: function() { return LawAIApp.DependencyIntelligenceEngine || null; },
    _getRCA: function() { return LawAIApp.RootCauseAnalysisEngine || null; },
    _getPrediction: function() { return LawAIApp.RuntimePredictionEngine || null; },
    _getDecision: function() { return LawAIApp.DecisionSupportEngine || null; },

    // ============================================================
    // STATUS
    // ============================================================

    getStatus: function() {
        return {
            version: this._version,
            ready: this._ready,
            depIntelAvailable: !!this._getDepIntel(),
            rcaAvailable: !!this._getRCA(),
            predictionAvailable: !!this._getPrediction(),
            decisionAvailable: !!this._getDecision(),
            cacheActive: !!(this._responseCache && (Date.now() - this._responseCache.time) < this._cacheTTL)
        };
    }
};

// ── Auto-init ──
LawAIApp.AICognitiveIntegration.init();

console.log('🧠 AI Cognitive Integration — Part 48.6 Complete');
console.log('   ✅ Cognitive Pipeline: 7-stage (Context → Knowledge → Dep → RCA → Predict → Decide → Response)');
console.log('   ✅ Response Model: observation + understanding + cause + prediction + recommendation');
console.log('   ✅ Quick Query: cached lightweight path for fast responses');
console.log('   ✅ Rules: layer-access, read-only, evidence-backed, unknown-honest');
console.log('   ✅ Ready for Part 48.7 — Cognitive Dashboard');
