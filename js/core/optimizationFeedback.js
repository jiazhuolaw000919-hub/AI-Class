// ============================================================
// optimizationFeedback.js
// Part 52.6 — Optimization Feedback Loop
// Version: v5.2.6
// Module: Runtime Self Optimization Layer
// File: js/core/optimizationFeedback.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OptimizationFeedback) {
        console.warn('[OptimizationFeedback] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Outcome Types (Chapter 5)
    // ============================================================
    const OUTCOME = {
        SUCCESS: 'SUCCESS',
        PARTIAL: 'PARTIAL',
        FAILED: 'FAILED',
        UNKNOWN: 'UNKNOWN'
    };

    // ============================================================
    // Learning Signal Types (Chapter 7)
    // ============================================================
    const LEARNING_SIGNAL = {
        POSITIVE: 'POSITIVE',
        NEGATIVE: 'NEGATIVE',
        NEUTRAL: 'NEUTRAL'
    };

    // ============================================================
    // Feedback Model (Chapter 4)
    // ============================================================
    class FeedbackRecord {
        constructor(config) {
            this.feedbackId = config.feedbackId || this._generateId();
            this.timestamp = Date.now();
            this.recommendationId = config.recommendationId || null;
            this.expectedImpact = config.expectedImpact || null;
            this.actualImpact = config.actualImpact || null;
            this.result = config.result || OUTCOME.UNKNOWN;
            this.difference = config.difference || 0;
            this.learningSignal = config.learningSignal || LEARNING_SIGNAL.NEUTRAL;
            this.measurements = config.measurements || {};
            this.notes = config.notes || '';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getDelta() {
            if (this.expectedImpact === null || this.actualImpact === null) return 0;
            return this.actualImpact - this.expectedImpact;
        }

        isPositive() {
            return this.result === OUTCOME.SUCCESS || this.getDelta() > 0;
        }

        toJSON() {
            return {
                feedbackId: this.feedbackId,
                timestamp: this.timestamp,
                recommendationId: this.recommendationId,
                expectedImpact: this.expectedImpact,
                actualImpact: this.actualImpact,
                result: this.result,
                difference: this.difference,
                delta: this.getDelta(),
                learningSignal: this.learningSignal,
                measurements: this.measurements,
                notes: this.notes,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Optimization Feedback Loop Core (Chapter 1-3)
    // ============================================================
    class OptimizationFeedback {
        constructor() {
            this._feedbacks = [];
            this._learningPatterns = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minMeasurementCount: 3,
                successThreshold: 10,
                partialThreshold: 0,
                enableAutoLearning: true,
                minConfidenceForLearning: 50
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OptimizationFeedback] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OptimizationFeedback] Initializing...');

            // Connect to modules (Chapter 7, 9)
            this._connectToOptimizationRecommendation();
            this._connectToHistoricalMemory();
            this._connectToDecisionIntelligence();
            this._connectToOptimizationIntelligence();
            this._connectToGovernance();

            // Register with Explorer (Chapter 10)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[OptimizationFeedback] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Record Feedback (Chapter 3-4)
        // ============================================================

        recordFeedback(recommendationId, actualImpact, measurements, notes) {
            console.log(`[OptimizationFeedback] Recording feedback for: ${recommendationId}`);

            // Find the recommendation
            const recommendation = this._findRecommendation(recommendationId);
            if (!recommendation) {
                console.warn(`[OptimizationFeedback] Recommendation not found: ${recommendationId}`);
                return null;
            }

            // Determine result (Chapter 5)
            const expectedImpact = recommendation.impact || 0;
            const result = this._determineOutcome(expectedImpact, actualImpact);

            // Calculate difference
            const difference = actualImpact - expectedImpact;

            // Determine learning signal (Chapter 7)
            const learningSignal = this._determineLearningSignal(result, difference);

            // Create feedback
            const feedback = new FeedbackRecord({
                recommendationId: recommendationId,
                expectedImpact: expectedImpact,
                actualImpact: actualImpact,
                result: result,
                difference: difference,
                learningSignal: learningSignal,
                measurements: measurements || {},
                notes: notes || '',
                metadata: {
                    source: 'optimization_feedback',
                    timestamp: Date.now()
                }
            });

            this._feedbacks.push(feedback);
            if (this._feedbacks.length > this._config.maxHistorySize) {
                this._feedbacks = this._feedbacks.slice(-this._config.maxHistorySize);
            }

            // Generate learning pattern (Chapter 8)
            if (this._config.enableAutoLearning) {
                const pattern = this._generateLearningPattern(feedback);
                if (pattern) {
                    this._learningPatterns.push(pattern);
                    this._updateLearningPatterns();
                }
            }

            // Update memory (Chapter 7)
            this._updateMemory(feedback);

            this._emit('feedbackRecorded', feedback.toJSON());

            return feedback;
        }

        // ============================================================
        // Outcome Determination (Chapter 5)
        // ============================================================

        _determineOutcome(expected, actual) {
            if (expected === null || actual === null) return OUTCOME.UNKNOWN;

            const delta = actual - expected;
            const threshold = this._config.successThreshold;

            if (delta >= threshold) return OUTCOME.SUCCESS;
            if (delta >= this._config.partialThreshold) return OUTCOME.PARTIAL;
            return OUTCOME.FAILED;
        }

        _determineLearningSignal(result, difference) {
            if (result === OUTCOME.SUCCESS || difference > 0) {
                return LEARNING_SIGNAL.POSITIVE;
            }
            if (result === OUTCOME.FAILED || difference < -10) {
                return LEARNING_SIGNAL.NEGATIVE;
            }
            return LEARNING_SIGNAL.NEUTRAL;
        }

        // ============================================================
        // Impact Measurement (Chapter 6)
        // ============================================================

        measureImpact(beforeData, afterData, metric) {
            if (!beforeData || !afterData) return null;

            const before = beforeData[metric] || 0;
            const after = afterData[metric] || 0;

            return {
                metric: metric,
                before: before,
                after: after,
                delta: after - before,
                percentChange: before > 0 ? ((after - before) / before) * 100 : 0,
                improved: after < before // Assuming lower is better for most metrics
            };
        }

        measureMultiple(beforeData, afterData, metrics) {
            const results = {};
            metrics.forEach(metric => {
                results[metric] = this.measureImpact(beforeData, afterData, metric);
            });
            return results;
        }

        // ============================================================
        // Learning Pattern Generation (Chapter 8)
        // ============================================================

        _generateLearningPattern(feedback) {
            const pattern = {
                id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: Date.now(),
                type: feedback.learningSignal === LEARNING_SIGNAL.POSITIVE ? 'success' : 'failure',
                recommendationId: feedback.recommendationId,
                learningSignal: feedback.learningSignal,
                delta: feedback.getDelta(),
                confidence: 0,
                metadata: {
                    expectedImpact: feedback.expectedImpact,
                    actualImpact: feedback.actualImpact,
                    result: feedback.result
                }
            };

            // Calculate confidence based on historical patterns
            const similarPatterns = this._learningPatterns.filter(p =>
                p.type === pattern.type &&
                Math.abs(p.delta - pattern.delta) < 5
            );

            pattern.confidence = Math.min(80 + similarPatterns.length * 2, 95);

            return pattern;
        }

        _updateLearningPatterns() {
            // Keep only recent patterns
            if (this._learningPatterns.length > 100) {
                this._learningPatterns = this._learningPatterns.slice(-100);
            }

            // Deduplicate similar patterns
            const unique = [];
            const seen = new Set();
            this._learningPatterns.forEach(p => {
                const key = `${p.type}_${Math.round(p.delta / 5) * 5}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(p);
                }
            });
            this._learningPatterns = unique;
        }

        // ============================================================
        // Memory Integration (Chapter 7)
        // ============================================================

        _updateMemory(feedback) {
            // Update Historical Memory
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                try {
                    window.LawAIApp.HistoricalMemory.remember({
                        type: 'optimization_feedback',
                        source: 'feedback_loop',
                        data: {
                            recommendationId: feedback.recommendationId,
                            result: feedback.result,
                            delta: feedback.getDelta(),
                            learningSignal: feedback.learningSignal
                        },
                        outcome: feedback.result === OUTCOME.SUCCESS ? 'success' : 
                                 feedback.result === OUTCOME.FAILED ? 'failure' : 'neutral',
                        confidence: feedback.result === OUTCOME.SUCCESS ? 80 : 60,
                        tags: ['optimization', 'feedback']
                    });
                } catch (e) { /* ignore */ }
            }

            // Update Optimization Intelligence
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                try {
                    // Optimization intelligence will learn from this
                } catch (e) { /* ignore */ }
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getFeedback(filter) {
            let feedbacks = this._feedbacks;

            if (filter) {
                if (filter.result) {
                    feedbacks = feedbacks.filter(f => f.result === filter.result);
                }
                if (filter.learningSignal) {
                    feedbacks = feedbacks.filter(f => f.learningSignal === filter.learningSignal);
                }
                if (filter.recommendationId) {
                    feedbacks = feedbacks.filter(f => f.recommendationId === filter.recommendationId);
                }
                if (filter.limit) {
                    feedbacks = feedbacks.slice(-filter.limit);
                }
            }

            return feedbacks.map(f => f.toJSON());
        }

        getFeedbackByRecommendation(recommendationId) {
            return this._feedbacks
                .filter(f => f.recommendationId === recommendationId)
                .map(f => f.toJSON());
        }

        getLearningPatterns(type) {
            let patterns = this._learningPatterns;
            if (type) {
                patterns = patterns.filter(p => p.type === type);
            }
            return patterns.slice(-20);
        }

        getStats() {
            const total = this._feedbacks.length;
            const success = this._feedbacks.filter(f => f.result === OUTCOME.SUCCESS).length;
            const partial = this._feedbacks.filter(f => f.result === OUTCOME.PARTIAL).length;
            const failed = this._feedbacks.filter(f => f.result === OUTCOME.FAILED).length;
            const unknown = this._feedbacks.filter(f => f.result === OUTCOME.UNKNOWN).length;

            const positive = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.POSITIVE).length;
            const negative = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEGATIVE).length;
            const neutral = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEUTRAL).length;

            const avgDelta = total > 0 ?
                this._feedbacks.reduce((sum, f) => sum + f.getDelta(), 0) / total :
                0;

            const successRate = total > 0 ?
                Math.round((success / (success + failed)) * 100) :
                0;

            return {
                total,
                success,
                partial,
                failed,
                unknown,
                positive,
                negative,
                neutral,
                avgDelta: Math.round(avgDelta * 10) / 10,
                successRate,
                patterns: this._learningPatterns.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 10)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getFeedback({ limit: 5 });
            const patterns = this.getLearningPatterns();

            return {
                type: 'optimization_feedback',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentFeedback: recent,
                learningPatterns: patterns.slice(-5),
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
                        console.error('[OptimizationFeedback] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`optfeedback.${event}`, data);
            }
        }

        // ============================================================
        // Helpers
        // ============================================================

        _findRecommendation(id) {
            // Try to find in various places
            if (window.LawAIApp && window.LawAIApp.OptimizationRecommendation) {
                try {
                    const rec = window.LawAIApp.OptimizationRecommendation.getRecommendation(id);
                    if (rec) return rec;
                } catch (e) { /* ignore */ }
            }

            // Check if stored locally
            try {
                const saved = localStorage.getItem('optimizationRecommendationData');
                if (saved) {
                    const data = JSON.parse(saved);
                    const rec = data.recommendations?.find(r => r.recommendationId === id);
                    if (rec) return rec;
                }
            } catch (e) { /* ignore */ }

            return null;
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('optimizationFeedbackData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.feedbacks) {
                        this._feedbacks = data.feedbacks.map(f => new OptimizationFeedback(f));
                    }
                    if (data.patterns) {
                        this._learningPatterns = data.patterns;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 7, 9)
        // ============================================================

        _connectToOptimizationRecommendation() {
            if (window.LawAIApp && window.LawAIApp.OptimizationRecommendation) {
                // Listen for implemented recommendations
                window.LawAIApp.OptimizationRecommendation.on('recommendationImplemented', (rec) => {
                    console.log(`[OptimizationFeedback] Tracking implemented recommendation: ${rec.recommendationId}`);
                });
                console.log('[OptimizationFeedback] Connected to Optimization Recommendation');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[OptimizationFeedback] Connected to Historical Memory');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OptimizationFeedback] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationIntelligence() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[OptimizationFeedback] Connected to Optimization Intelligence');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[OptimizationFeedback] Connected to Governance');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'optimization-feedback',
                        name: 'Optimization Feedback',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OptimizationFeedback] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OptimizationFeedback] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[OptimizationFeedback] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new OptimizationFeedback();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OptimizationFeedback = {
        Core: instance,
        OUTCOME: OUTCOME,
        LEARNING_SIGNAL: LEARNING_SIGNAL,

        // Public API
        initialize: (config) => instance.initialize(config),
        recordFeedback: (recommendationId, actualImpact, measurements, notes) => 
            instance.recordFeedback(recommendationId, actualImpact, measurements, notes),
        measureImpact: (before, after, metric) => instance.measureImpact(before, after, metric),
        measureMultiple: (before, after, metrics) => instance.measureMultiple(before, after, metrics),

        getFeedback: (filter) => instance.getFeedback(filter),
        getFeedbackByRecommendation: (id) => instance.getFeedbackByRecommendation(id),
        getLearningPatterns: (type) => instance.getLearningPatterns(type),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OptimizationFeedback] Part 52.6 loaded ✅');
    console.log('[OptimizationFeedback] Outcomes:', Object.values(OUTCOME).join(' | '));
    console.log('[OptimizationFeedback] Learning Signals:', Object.values(LEARNING_SIGNAL).join(' | '));

})();
