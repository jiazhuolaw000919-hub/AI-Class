// ============================================================
// adaptiveDecisionLoop.js
// Part 51.6 — Adaptive Decision Loop
// Version: v5.1.6
// Module: Decision Intelligence Layer
// File: js/core/adaptiveDecisionLoop.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.AdaptiveLoop) {
        console.warn('[AdaptiveLoop] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Outcome Types (Chapter 5)
    // ============================================================
    const OUTCOME = {
        SUCCESS: 'SUCCESS',
        PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
        FAILED: 'FAILED',
        UNKNOWN: 'UNKNOWN'
    };

    // ============================================================
    // Learning Signals (Chapter 6)
    // ============================================================
    const SIGNAL = {
        POSITIVE: 'POSITIVE',
        NEGATIVE: 'NEGATIVE',
        ADJUSTMENT: 'ADJUSTMENT'
    };

    // ============================================================
    // Feedback Model (Chapter 4)
    // ============================================================
    class Feedback {
        constructor(config) {
            this.feedbackId = config.feedbackId || this._generateId();
            this.decisionId = config.decisionId || null;
            this.timestamp = Date.now();
            this.result = config.result || null;
            this.impact = config.impact || null;
            this.outcome = config.outcome || OUTCOME.UNKNOWN;
            this.failureReason = config.failureReason || null;
            this.learningSignal = config.learningSignal || null;
            this.confidenceDelta = config.confidenceDelta || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                feedbackId: this.feedbackId,
                decisionId: this.decisionId,
                timestamp: this.timestamp,
                result: this.result,
                impact: this.impact,
                outcome: this.outcome,
                failureReason: this.failureReason,
                learningSignal: this.learningSignal,
                confidenceDelta: this.confidenceDelta,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Decision Record
    // ============================================================
    class DecisionRecord {
        constructor(config) {
            this.decisionId = config.decisionId || null;
            this.trigger = config.trigger || 'unknown';
            this.recommendation = config.recommendation || null;
            this.confidence = config.confidence || 0;
            this.timestamp = config.timestamp || Date.now();
            this.outcome = config.outcome || OUTCOME.UNKNOWN;
            this.executedAt = config.executedAt || null;
            this.completedAt = config.completedAt || null;
            this.feedback = [];
            this.metadata = config.metadata || {};
        }

        addFeedback(feedback) {
            this.feedback.push(feedback);
            this.completedAt = Date.now();
            return this;
        }

        getSuccessRate() {
            if (this.feedback.length === 0) return 0;
            const successful = this.feedback.filter(f => f.outcome === OUTCOME.SUCCESS);
            return Math.round((successful.length / this.feedback.length) * 100);
        }

        toJSON() {
            return {
                decisionId: this.decisionId,
                trigger: this.trigger,
                recommendation: this.recommendation,
                confidence: this.confidence,
                timestamp: this.timestamp,
                outcome: this.outcome,
                executedAt: this.executedAt,
                completedAt: this.completedAt,
                feedback: this.feedback.map(f => f.toJSON()),
                successRate: this.getSuccessRate(),
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Adaptive Decision Loop Core (Chapter 1-3)
    // ============================================================
    class AdaptiveLoop {
        constructor() {
            this._decisions = [];
            this._feedback = [];
            this._learningPatterns = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minFeedbackForLearning: 3,
                confidenceAdjustmentRate: 0.1,
                enableAutoLearning: true,
                trackSuccessRate: true
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[AdaptiveLoop] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[AdaptiveLoop] Initializing...');

            // Connect to modules (Chapter 7)
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();
            this._connectToHistoricalMemory();
            this._connectToConfidenceSystem();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[AdaptiveLoop] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Record Outcome (Chapter 3-4)
        // ============================================================

        recordOutcome(decisionId, result, impact) {
            console.log(`[AdaptiveLoop] Recording outcome for decision: ${decisionId}`);

            // Determine outcome
            const outcome = this._determineOutcome(result, impact);

            // Create feedback
            const feedback = new Feedback({
                decisionId: decisionId,
                result: result,
                impact: impact,
                outcome: outcome,
                failureReason: outcome === OUTCOME.FAILED ? result?.error || 'Unknown failure' : null,
                learningSignal: this._determineSignal(outcome, result),
                confidenceDelta: this._calculateConfidenceDelta(outcome, result),
                metadata: {
                    source: 'AdaptiveLoop',
                    timestamp: Date.now()
                }
            });

            this._feedback.push(feedback);

            // Update decision record
            const decisionRecord = this._decisions.find(d => d.decisionId === decisionId);
            if (decisionRecord) {
                decisionRecord.addFeedback(feedback);
                decisionRecord.outcome = outcome;
            }

            // Generate learning signal (Chapter 6)
            const learningSignal = this._generateLearningSignal(feedback);

            // Update memory (Chapter 7)
            this._updateMemory(feedback, learningSignal);

            // Improve confidence (Chapter 8)
            this._improveConfidence(feedback);

            this._emit('outcomeRecorded', {
                feedback: feedback.toJSON(),
                learningSignal: learningSignal,
                decision: decisionRecord ? decisionRecord.toJSON() : null
            });

            return feedback;
        }

        // ============================================================
        // Outcome Tracking (Chapter 5)
        // ============================================================

        _determineOutcome(result, impact) {
            if (!result) return OUTCOME.UNKNOWN;

            // Check success
            if (result.success === true || result.status === 'success') {
                return impact && impact > 0.8 ? OUTCOME.SUCCESS : OUTCOME.PARTIAL_SUCCESS;
            }

            // Check failure
            if (result.success === false || result.status === 'failure' || result.error) {
                return OUTCOME.FAILED;
            }

            // Check impact
            if (impact !== undefined && impact !== null) {
                if (impact > 0.7) return OUTCOME.SUCCESS;
                if (impact > 0.3) return OUTCOME.PARTIAL_SUCCESS;
                return OUTCOME.FAILED;
            }

            return OUTCOME.UNKNOWN;
        }

        _determineSignal(outcome, result) {
            if (outcome === OUTCOME.SUCCESS) return SIGNAL.POSITIVE;
            if (outcome === OUTCOME.FAILED) return SIGNAL.NEGATIVE;
            if (outcome === OUTCOME.PARTIAL_SUCCESS) return SIGNAL.ADJUSTMENT;
            return SIGNAL.ADJUSTMENT;
        }

        _calculateConfidenceDelta(outcome, result) {
            const baseDelta = this._config.confidenceAdjustmentRate;
            
            switch (outcome) {
                case OUTCOME.SUCCESS:
                    return baseDelta * 0.5;
                case OUTCOME.PARTIAL_SUCCESS:
                    return baseDelta * 0.1;
                case OUTCOME.FAILED:
                    return -baseDelta;
                default:
                    return 0;
            }
        }

        // ============================================================
        // Learning Signal Generation (Chapter 6)
        // ============================================================

        _generateLearningSignal(feedback) {
            const signal = {
                type: feedback.learningSignal,
                description: '',
                confidence: 0,
                timestamp: Date.now()
            };

            switch (feedback.learningSignal) {
                case SIGNAL.POSITIVE:
                    signal.description = `Decision ${feedback.decisionId} was successful`;
                    signal.confidence = 80;
                    break;
                case SIGNAL.NEGATIVE:
                    signal.description = `Decision ${feedback.decisionId} failed: ${feedback.failureReason || 'unknown cause'}`;
                    signal.confidence = 70;
                    break;
                case SIGNAL.ADJUSTMENT:
                    signal.description = `Decision ${feedback.decisionId} needs adjustment`;
                    signal.confidence = 60;
                    break;
                default:
                    signal.description = `Decision ${feedback.decisionId} outcome recorded`;
                    signal.confidence = 50;
            }

            this._learningPatterns.push(signal);
            return signal;
        }

        // ============================================================
        // Memory Integration (Chapter 7)
        // ============================================================

        _updateMemory(feedback, learningSignal) {
            // Update Historical Memory
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                try {
                    window.LawAIApp.HistoricalMemory.remember({
                        type: 'decision_outcome',
                        source: 'adaptive_loop',
                        data: {
                            decisionId: feedback.decisionId,
                            outcome: feedback.outcome,
                            learningSignal: learningSignal.type,
                            failureReason: feedback.failureReason
                        },
                        outcome: feedback.outcome === OUTCOME.SUCCESS ? 'success' : 'failure',
                        confidence: feedback.learningSignal === SIGNAL.POSITIVE ? 80 : 60,
                        tags: ['adaptive_loop', 'feedback']
                    });
                } catch (e) {
                    // ignore
                }
            }

            // Update Decision Confidence (Chapter 8)
            if (window.LawAIApp && window.LawAIApp.DecisionConfidence) {
                try {
                    // Confidence will be improved via _improveConfidence
                } catch (e) {
                    // ignore
                }
            }
        }

        // ============================================================
        // Confidence Improvement (Chapter 8)
        // ============================================================

        _improveConfidence(feedback) {
            // Calculate improvement factor
            const successRate = this._calculateSuccessRate(feedback.decisionId);
            const similarCases = this._findSimilarDecisions(feedback.decisionId);
            const similarSuccessRate = this._calculateSimilarSuccessRate(similarCases);

            // Combined improvement
            const improvement = {
                decisionId: feedback.decisionId,
                successRate: successRate,
                similarSuccessRate: similarSuccessRate,
                confidenceDelta: feedback.confidenceDelta,
                timestamp: Date.now()
            };

            this._emit('confidenceImproved', improvement);

            return improvement;
        }

        _calculateSuccessRate(decisionId) {
            const decision = this._decisions.find(d => d.decisionId === decisionId);
            if (!decision) return 0;
            return decision.getSuccessRate();
        }

        _findSimilarDecisions(decisionId) {
            const decision = this._decisions.find(d => d.decisionId === decisionId);
            if (!decision) return [];

            // Find decisions with similar trigger
            return this._decisions.filter(d => 
                d.decisionId !== decisionId && 
                d.trigger === decision.trigger
            );
        }

        _calculateSimilarSuccessRate(similarCases) {
            if (similarCases.length === 0) return 0;
            const total = similarCases.reduce((sum, d) => sum + d.getSuccessRate(), 0);
            return Math.round(total / similarCases.length);
        }

        // ============================================================
        // Decision Improvement (Chapter 3)
        // ============================================================

        getImprovedDecision(trigger, context) {
            console.log(`[AdaptiveLoop] Generating improved decision for: ${trigger}`);

            // Find similar past decisions
            const similar = this._decisions.filter(d => d.trigger === trigger);
            
            if (similar.length === 0) {
                return {
                    improved: false,
                    confidence: 50,
                    recommendation: null,
                    reason: 'No historical data available'
                };
            }

            // Calculate success rate
            const successRate = similar.reduce((sum, d) => sum + d.getSuccessRate(), 0) / similar.length;

            // Find best recommendation
            const successful = similar.filter(d => d.outcome === OUTCOME.SUCCESS);
            const bestRecommendation = successful.length > 0 ? 
                successful[successful.length - 1].recommendation : null;

            // Calculate improved confidence
            const baseConfidence = 50;
            const confidenceBoost = Math.min(successRate * 0.5, 30);
            const improvedConfidence = Math.min(baseConfidence + confidenceBoost, 95);

            return {
                improved: true,
                confidence: Math.round(improvedConfidence),
                recommendation: bestRecommendation,
                reason: `Based on ${similar.length} similar decisions with ${Math.round(successRate)}% success rate`
            };
        }

        // ============================================================
        // Decision Tracking
        // ============================================================

        trackDecision(decision) {
            const record = new DecisionRecord({
                decisionId: decision.id,
                trigger: decision.trigger,
                recommendation: decision.recommendation,
                confidence: decision.confidence?.score || 0,
                timestamp: decision.timestamp || Date.now(),
                metadata: {
                    source: 'AdaptiveLoop',
                    priority: decision.priority,
                    risk: decision.risk
                }
            });

            this._decisions.push(record);
            
            if (this._decisions.length > this._config.maxHistorySize) {
                this._decisions.shift();
            }

            this._emit('decisionTracked', record.toJSON());
            return record;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getFeedback(limit = 10) {
            return this._feedback.slice(-limit).reverse().map(f => f.toJSON());
        }

        getDecisions(limit = 10) {
            return this._decisions.slice(-limit).reverse().map(d => d.toJSON());
        }

        getDecision(decisionId) {
            const decision = this._decisions.find(d => d.decisionId === decisionId);
            return decision ? decision.toJSON() : null;
        }

        getLearningPatterns(limit = 10) {
            return this._learningPatterns.slice(-limit).reverse();
        }

        getStats() {
            const total = this._decisions.length;
            const successful = this._decisions.filter(d => d.outcome === OUTCOME.SUCCESS).length;
            const partial = this._decisions.filter(d => d.outcome === OUTCOME.PARTIAL_SUCCESS).length;
            const failed = this._decisions.filter(d => d.outcome === OUTCOME.FAILED).length;
            const unknown = this._decisions.filter(d => d.outcome === OUTCOME.UNKNOWN).length;

            const avgSuccessRate = total > 0 ?
                this._decisions.reduce((sum, d) => sum + d.getSuccessRate(), 0) / total : 0;

            const patternTypes = {};
            this._learningPatterns.forEach(p => {
                patternTypes[p.type] = (patternTypes[p.type] || 0) + 1;
            });

            return {
                total,
                successful,
                partial,
                failed,
                unknown,
                avgSuccessRate: Math.round(avgSuccessRate),
                feedbackCount: this._feedback.length,
                patternTypes: patternTypes,
                learningPatterns: this._learningPatterns.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getDecisions(5);
            const recentFeedback = this.getFeedback(5);
            const patterns = this.getLearningPatterns(5);

            return {
                type: 'adaptive_loop',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentDecisions: recent,
                recentFeedback: recentFeedback,
                learningPatterns: patterns,
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
                        console.error('[AdaptiveLoop] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`adaptive.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('adaptiveLoopData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.decisions) {
                        data.decisions.forEach(d => {
                            this._decisions.push(new DecisionRecord(d));
                        });
                    }
                    if (data.feedback) {
                        data.feedback.forEach(f => {
                            this._feedback.push(new Feedback(f));
                        });
                    }
                    if (data.patterns) {
                        this._learningPatterns.push(...data.patterns);
                    }
                    console.log(`[AdaptiveLoop] Loaded ${this._decisions.length} decisions from storage`);
                }
            } catch (e) {
                // ignore
            }
        }

        // ============================================================
        // Auto-Save
        // ============================================================

        _saveData() {
            try {
                const data = {
                    decisions: this._decisions.map(d => d.toJSON()),
                    feedback: this._feedback.map(f => f.toJSON()),
                    patterns: this._learningPatterns
                };
                localStorage.setItem('adaptiveLoopData', JSON.stringify(data));
            } catch (e) {
                // ignore
            }
        }

        // ============================================================
        // Integrations (Chapter 7)
        // ============================================================

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                // Track decisions when they're made
                window.LawAIApp.DecisionEngine.on('decisionMade', (decision) => {
                    this.trackDecision(decision);
                });
                console.log('[AdaptiveLoop] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                console.log('[AdaptiveLoop] Connected to Recommendation Engine');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[AdaptiveLoop] Connected to Historical Memory');
            }
        }

        _connectToConfidenceSystem() {
            if (window.LawAIApp && window.LawAIApp.DecisionConfidence) {
                console.log('[AdaptiveLoop] Connected to Confidence System');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'adaptive-loop',
                        name: 'Adaptive Decision Loop',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[AdaptiveLoop] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[AdaptiveLoop] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new AdaptiveLoop();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.AdaptiveLoop = {
        Core: instance,
        OUTCOME: OUTCOME,
        SIGNAL: SIGNAL,

        // Public API
        initialize: (config) => instance.initialize(config),
        recordOutcome: (decisionId, result, impact) => instance.recordOutcome(decisionId, result, impact),
        trackDecision: (decision) => instance.trackDecision(decision),
        getImprovedDecision: (trigger, context) => instance.getImprovedDecision(trigger, context),

        getFeedback: (limit) => instance.getFeedback(limit),
        getDecisions: (limit) => instance.getDecisions(limit),
        getDecision: (decisionId) => instance.getDecision(decisionId),
        getLearningPatterns: (limit) => instance.getLearningPatterns(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[AdaptiveLoop] Part 51.6 loaded ✅');
    console.log('[AdaptiveLoop] Outcomes:', Object.values(OUTCOME).join(' | '));
    console.log('[AdaptiveLoop] Signals:', Object.values(SIGNAL).join(' | '));

})();
