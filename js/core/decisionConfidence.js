// ============================================================
// decisionConfidence.js
// Part 51.4 — Decision Confidence Enhancement
// Version: v5.1.4
// Module: Decision Intelligence Layer
// File: js/core/decisionConfidence.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionConfidence) {
        console.warn('[DecisionConfidence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Reliability Levels (Chapter 6)
    // ============================================================
    const RELIABILITY = {
        HIGH: { label: 'HIGH', min: 90, max: 100, color: '#4ade80', action: 'auto_approve' },
        MEDIUM: { label: 'MEDIUM', min: 60, max: 89, color: '#facc15', action: 'review_recommended' },
        LOW: { label: 'LOW', min: 0, max: 59, color: '#f87171', action: 'manual_review_required' }
    };

    // ============================================================
    // Confidence Model (Chapter 4)
    // ============================================================
    class ConfidenceModel {
        constructor(config) {
            this.score = config.score || 0;
            this.reliability = config.reliability || RELIABILITY.LOW;
            this.evidenceQuality = config.evidenceQuality || 0;
            this.uncertainty = config.uncertainty || 0;
            this.factors = config.factors || [];
            this.timestamp = Date.now();
            this.metadata = config.metadata || {};
        }

        getReliabilityLevel() {
            if (this.score >= 90) return RELIABILITY.HIGH;
            if (this.score >= 60) return RELIABILITY.MEDIUM;
            return RELIABILITY.LOW;
        }

        getAction() {
            return this.getReliabilityLevel().action;
        }

        canAutoApprove() {
            return this.score >= 90;
        }

        needsManualReview() {
            return this.score < 60;
        }

        toJSON() {
            return {
                score: this.score,
                reliability: this.getReliabilityLevel().label,
                evidenceQuality: this.evidenceQuality,
                uncertainty: this.uncertainty,
                factors: this.factors,
                timestamp: this.timestamp,
                metadata: this.metadata,
                action: this.getAction(),
                canAutoApprove: this.canAutoApprove(),
                needsManualReview: this.needsManualReview()
            };
        }
    }

    // ============================================================
    // Confidence Evaluator (Chapter 3)
    // ============================================================
    class ConfidenceEvaluator {
        constructor() {
            this._evaluations = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                minEvidenceQuality: 0.3,
                highConfidenceThreshold: 90,
                mediumConfidenceThreshold: 60,
                enableUncertaintyDetection: true,
                maxHistorySize: 100
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[DecisionConfidence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[DecisionConfidence] Initializing...');

            // Connect to modules (Chapter 8-9)
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();
            this._connectToGovernance();
            this._connectToReasoningEngine();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[DecisionConfidence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Evaluate Confidence (Chapter 3-5)
        // ============================================================

        evaluate(input, evidence, reasoning) {
            console.log('[DecisionConfidence] Evaluating confidence...');

            // Calculate factors (Chapter 5)
            const factors = this._calculateFactors(input, evidence, reasoning);

            // Calculate overall score
            const score = this._calculateScore(factors);

            // Detect uncertainty (Chapter 7)
            const uncertainty = this._detectUncertainty(input, evidence, factors);

            // Calculate evidence quality
            const evidenceQuality = this._calculateEvidenceQuality(evidence);

            // Build confidence model
            const confidence = new ConfidenceModel({
                score: score,
                evidenceQuality: evidenceQuality,
                uncertainty: uncertainty,
                factors: factors,
                metadata: {
                    input: input,
                    evidenceCount: evidence?.length || 0,
                    hasReasoning: !!reasoning
                }
            });

            // Store evaluation
            this._evaluations.push(confidence.toJSON());
            if (this._evaluations.length > this._config.maxHistorySize) {
                this._evaluations.shift();
            }

            // Handle low confidence (Chapter 7)
            if (confidence.needsManualReview()) {
                console.warn('[DecisionConfidence] Low confidence, manual review required');
                this._handleLowConfidence(confidence);
            }

            this._emit('confidenceEvaluated', confidence.toJSON());

            return confidence;
        }

        // ============================================================
        // Confidence Factors (Chapter 5)
        // ============================================================

        _calculateFactors(input, evidence, reasoning) {
            const factors = [];

            // Factor 1: Data Completeness
            const completeness = this._evaluateDataCompleteness(input);
            factors.push({
                name: 'data_completeness',
                score: completeness,
                weight: 0.2,
                description: completeness >= 80 ? 'Complete data available' :
                              completeness >= 50 ? 'Partial data available' :
                              'Insufficient data'
            });

            // Factor 2: Evidence Strength
            const evidenceStrength = this._evaluateEvidenceStrength(evidence);
            factors.push({
                name: 'evidence_strength',
                score: evidenceStrength,
                weight: 0.25,
                description: evidenceStrength >= 70 ? 'Strong evidence' :
                              evidenceStrength >= 50 ? 'Moderate evidence' :
                              'Weak evidence'
            });

            // Factor 3: Historical Similarity
            const historicalSimilarity = this._evaluateHistoricalSimilarity(evidence);
            factors.push({
                name: 'historical_similarity',
                score: historicalSimilarity,
                weight: 0.15,
                description: historicalSimilarity >= 70 ? 'Strong historical match' :
                              historicalSimilarity >= 50 ? 'Moderate historical match' :
                              'No historical match'
            });

            // Factor 4: Knowledge Relation
            const knowledgeRelation = this._evaluateKnowledgeRelation(evidence);
            factors.push({
                name: 'knowledge_relation',
                score: knowledgeRelation,
                weight: 0.15,
                description: knowledgeRelation >= 70 ? 'Strong knowledge support' :
                              knowledgeRelation >= 50 ? 'Moderate knowledge support' :
                              'No knowledge support'
            });

            // Factor 5: Reasoning Consistency
            const reasoningConsistency = this._evaluateReasoningConsistency(reasoning);
            factors.push({
                name: 'reasoning_consistency',
                score: reasoningConsistency,
                weight: 0.25,
                description: reasoningConsistency >= 70 ? 'Consistent reasoning' :
                              reasoningConsistency >= 50 ? 'Moderately consistent' :
                              'Inconsistent reasoning'
            });

            return factors;
        }

        // ============================================================
        // Factor Evaluations
        // ============================================================

        _evaluateDataCompleteness(input) {
            if (!input) return 0;
            let score = 0;
            let total = 0;

            const checks = [
                { key: 'cpu', weight: 15 },
                { key: 'memory', weight: 15 },
                { key: 'status', weight: 15 },
                { key: 'errors', weight: 15 },
                { key: 'timestamp', weight: 10 },
                { key: 'source', weight: 10 },
                { key: 'summary', weight: 10 },
                { key: 'severity', weight: 10 }
            ];

            checks.forEach(check => {
                total += check.weight;
                if (input[check.key] !== undefined && input[check.key] !== null) {
                    score += check.weight;
                }
            });

            return Math.round((score / total) * 100);
        }

        _evaluateEvidenceStrength(evidence) {
            if (!evidence || evidence.length === 0) return 0;

            let totalWeight = 0;
            let totalReliability = 0;

            evidence.forEach(e => {
                totalWeight += e.weight || 0.5;
                totalReliability += e.reliability || 0.5;
            });

            const avgWeight = totalWeight / evidence.length;
            const avgReliability = totalReliability / evidence.length;

            return Math.round(((avgWeight * 0.6) + (avgReliability * 0.4)) * 100);
        }

        _evaluateHistoricalSimilarity(evidence) {
            const historical = evidence.find(e => e.source === 'historical' || e.source === 'historical_memory');
            if (!historical) return 0;

            const similarity = historical.data?.similarity || historical.weight || 0;
            return Math.round(similarity * 100);
        }

        _evaluateKnowledgeRelation(evidence) {
            const knowledge = evidence.find(e => e.source === 'knowledge' || e.source === 'knowledge_graph');
            if (!knowledge) return 0;

            return Math.round((knowledge.reliability || 0.5) * 100);
        }

        _evaluateReasoningConsistency(reasoning) {
            if (!reasoning) return 50;

            let score = 60;

            // Check if reasoning has steps
            if (reasoning.steps && reasoning.steps.length > 0) {
                score += 10;
            }

            // Check if reasoning has conclusion
            if (reasoning.conclusion) {
                score += 10;
            }

            // Check if reasoning has evidence
            if (reasoning.evidence && reasoning.evidence.length > 0) {
                score += 10;
            }

            // Check confidence
            if (reasoning.confidence) {
                score += Math.min(reasoning.confidence * 0.1, 10);
            }

            return Math.min(score, 100);
        }

        // ============================================================
        // Score Calculation
        // ============================================================

        _calculateScore(factors) {
            if (!factors || factors.length === 0) return 0;

            let totalWeightedScore = 0;
            let totalWeight = 0;

            factors.forEach(factor => {
                totalWeightedScore += factor.score * factor.weight;
                totalWeight += factor.weight;
            });

            return Math.round((totalWeightedScore / totalWeight) * 100);
        }

        // ============================================================
        // Uncertainty Detection (Chapter 7)
        // ============================================================

        _detectUncertainty(input, evidence, factors) {
            if (!this._config.enableUncertaintyDetection) return 0;

            let uncertaintyScore = 0;
            let uncertaintyFactors = [];

            // Check data gaps
            const completeness = factors.find(f => f.name === 'data_completeness');
            if (completeness && completeness.score < 50) {
                uncertaintyScore += 20;
                uncertaintyFactors.push('Incomplete data');
            }

            // Check conflicting evidence
            const evidenceStrength = factors.find(f => f.name === 'evidence_strength');
            if (evidenceStrength && evidenceStrength.score < 40) {
                uncertaintyScore += 15;
                uncertaintyFactors.push('Weak evidence');
            }

            // Check conflicting signals
            if (input && input.conflicts) {
                uncertaintyScore += 20;
                uncertaintyFactors.push('Conflicting signals detected');
            }

            // Check historical mismatch
            const historical = factors.find(f => f.name === 'historical_similarity');
            if (historical && historical.score < 30) {
                uncertaintyScore += 15;
                uncertaintyFactors.push('No historical precedent');
            }

            // Normalize
            const finalScore = Math.min(uncertaintyScore, 100);

            return {
                score: finalScore,
                factors: uncertaintyFactors,
                level: finalScore >= 60 ? 'HIGH' : finalScore >= 30 ? 'MEDIUM' : 'LOW',
                description: finalScore >= 60 ? 'High uncertainty, manual review required' :
                             finalScore >= 30 ? 'Moderate uncertainty, review recommended' :
                             'Low uncertainty, proceed with confidence'
            };
        }

        // ============================================================
        // Evidence Quality
        // ============================================================

        _calculateEvidenceQuality(evidence) {
            if (!evidence || evidence.length === 0) return 0;

            let score = 0;
            evidence.forEach(e => {
                const reliability = e.reliability || 0.5;
                const weight = e.weight || 0.5;
                score += (reliability * 0.6 + weight * 0.4);
            });

            return Math.round((score / evidence.length) * 100);
        }

        // ============================================================
        // Low Confidence Handling (Chapter 7)
        // ============================================================

        _handleLowConfidence(confidence) {
            const action = {
                type: 'MANUAL_REVIEW_REQUIRED',
                reason: 'Confidence score below threshold',
                confidence: confidence.score,
                threshold: this._config.mediumConfidenceThreshold,
                timestamp: Date.now()
            };

            this._emit('lowConfidenceDetected', {
                confidence: confidence.toJSON(),
                action: action
            });

            // Send to governance
            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    window.LawAIApp.Governance.requireManualReview(action);
                } catch (e) {
                    // ignore
                }
            }
        }

        // ============================================================
        // Batch Evaluation
        // ============================================================

        evaluateBatch(items) {
            const results = [];
            items.forEach(item => {
                const result = this.evaluate(item.input, item.evidence, item.reasoning);
                results.push(result.toJSON());
            });
            return results;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getEvaluations(limit = 10) {
            return this._evaluations.slice(-limit).reverse();
        }

        getStats() {
            const total = this._evaluations.length;
            const high = this._evaluations.filter(e => e.score >= 90).length;
            const medium = this._evaluations.filter(e => e.score >= 60 && e.score < 90).length;
            const low = this._evaluations.filter(e => e.score < 60).length;

            const avgScore = total > 0 ?
                this._evaluations.reduce((sum, e) => sum + e.score, 0) / total : 0;

            return {
                total,
                high,
                medium,
                low,
                avgScore: Math.round(avgScore),
                needsReview: low,
                autoApprovable: high
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getEvaluations(5);

            return {
                type: 'decision_confidence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentEvaluations: recent,
                config: this._config
            };
        }

        // ============================================================
        // Listeners
        // ============================================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        }

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error('[DecisionConfidence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`confidence.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 8-9)
        // ============================================================

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                // Listen for decisions and enhance with confidence
                window.LawAIApp.DecisionEngine.on('decisionMade', (decision) => {
                    const confidence = this.evaluate(
                        decision,
                        decision.context?.evidence || [],
                        decision.context?.reasoning || null
                    );
                    // Attach confidence to decision
                    decision.confidence = confidence.toJSON();
                });
                console.log('[DecisionConfidence] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                console.log('[DecisionConfidence] Connected to Recommendation Engine');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[DecisionConfidence] Connected to Governance');
            }
        }

        _connectToReasoningEngine() {
            if (window.LawAIApp && window.LawAIApp.ReasoningEngine) {
                console.log('[DecisionConfidence] Connected to Reasoning Engine');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'decision-confidence',
                        name: 'Decision Confidence',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[DecisionConfidence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[DecisionConfidence] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new ConfidenceEvaluator();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionConfidence = {
        Core: instance,
        RELIABILITY: RELIABILITY,

        // Public API
        initialize: (config) => instance.initialize(config),
        evaluate: (input, evidence, reasoning) => instance.evaluate(input, evidence, reasoning),
        evaluateBatch: (items) => instance.evaluateBatch(items),

        getEvaluations: (limit) => instance.getEvaluations(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[DecisionConfidence] Part 51.4 loaded ✅');
    console.log('[DecisionConfidence] Reliability Levels:', Object.keys(RELIABILITY).join(' | '));

})();
