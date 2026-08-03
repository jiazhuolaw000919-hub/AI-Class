// ============================================================
// predictiveFeedback.js
// Part 53.6 — Predictive Feedback Loop
// Version: v5.3.6
// Module: Predictive Runtime Layer
// File: js/core/predictiveFeedback.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PredictiveFeedback) {
        console.warn('[PredictiveFeedback] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Learning Signals (Chapter 7)
    // ============================================================
    const LEARNING_SIGNAL = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        NEUTRAL: 'neutral'
    };

    // ============================================================
    // Evaluation Status
    // ============================================================
    const EVALUATION_STATUS = {
        PENDING: 'PENDING',
        EVALUATED: 'EVALUATED',
        UPDATED: 'UPDATED'
    };

    // ============================================================
    // Feedback Model (Chapter 5)
    // ============================================================
    class PredictiveFeedback {
        constructor(config) {
            this.feedbackId = config.feedbackId || this._generateId();
            this.timestamp = Date.now();
            this.predictionId = config.predictionId || null;
            this.target = config.target || 'unknown';
            this.forecast = config.forecast || 0;
            this.actualResult = config.actualResult || 0;
            this.difference = config.difference || 0;
            this.accuracy = config.accuracy || 0;
            this.learningSignal = config.learningSignal || LEARNING_SIGNAL.NEUTRAL;
            this.status = EVALUATION_STATUS.PENDING;
            this.source = config.source || 'unknown';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `pfb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getAccuracyPercent() {
            if (this.forecast === 0 && this.actualResult === 0) return 100;
            if (this.forecast === 0) return 0;
            return Math.round(100 - Math.abs((this.actualResult - this.forecast) / this.forecast) * 100);
        }

        toJSON() {
            return {
                feedbackId: this.feedbackId,
                timestamp: this.timestamp,
                predictionId: this.predictionId,
                target: this.target,
                forecast: this.forecast,
                actualResult: this.actualResult,
                difference: this.difference,
                accuracy: this.accuracy || this.getAccuracyPercent(),
                learningSignal: this.learningSignal,
                status: this.status,
                source: this.source,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Accuracy Trend
    // ============================================================
    class AccuracyTrend {
        constructor(config) {
            this.trendId = config.trendId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'all';
            this.history = config.history || [];
            this.currentAccuracy = config.currentAccuracy || 0;
            this.improvement = config.improvement || 0;
            this.totalPredictions = config.totalPredictions || 0;
            this.successfulPredictions = config.successfulPredictions || 0;
            this.failedPredictions = config.failedPredictions || 0;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `atr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                trendId: this.trendId,
                timestamp: this.timestamp,
                target: this.target,
                history: this.history,
                currentAccuracy: this.currentAccuracy,
                improvement: this.improvement,
                totalPredictions: this.totalPredictions,
                successfulPredictions: this.successfulPredictions,
                failedPredictions: this.failedPredictions,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Predictive Feedback Loop Core (Chapter 1-4)
    // ============================================================
    class PredictiveFeedbackLoop {
        constructor() {
            this._feedbacks = [];
            this._trends = {};
            this._predictionHistory = [];
            this._accuracyHistory = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 500,
                accuracyThreshold: 70,
                minSamplesForTrend: 5,
                confidenceAdjustmentRate: 0.05,
                enableAutoLearning: true,
                learningInterval: 60000
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[PredictiveFeedback] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[PredictiveFeedback] Initializing...');

            // Connect to modules (Chapter 9)
            this._connectToHistoricalMemory();
            this._connectToDecisionIntelligence();
            this._connectToAdaptiveLearning();
            this._connectToOptimizationFeedback();
            this._connectToRiskForecast();
            this._connectToFailurePrediction();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-learning
            if (this._config.enableAutoLearning) {
                this._startAutoLearning();
            }

            this._initialized = true;
            console.log('[PredictiveFeedback] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Record and Evaluate (Chapter 4)
        // ============================================================

        record(predictionId, forecast, actualResult, metadata) {
            console.log(`[PredictiveFeedback] Recording feedback for: ${predictionId}`);

            const difference = actualResult - forecast;
            const accuracy = this._calculateAccuracy(forecast, actualResult);

            const feedback = new PredictiveFeedback({
                predictionId: predictionId,
                target: metadata?.target || 'unknown',
                forecast: forecast,
                actualResult: actualResult,
                difference: difference,
                accuracy: accuracy,
                learningSignal: this._determineLearningSignal(accuracy, difference),
                source: metadata?.source || 'runtime',
                metadata: metadata || {}
            });

            this._feedbacks.push(feedback);
            if (this._feedbacks.length > this._config.maxHistorySize) {
                this._feedbacks = this._feedbacks.slice(-this._config.maxHistorySize);
            }

            // Update prediction history
            this._updatePredictionHistory(predictionId, feedback);

            // Update accuracy history
            this._updateAccuracyHistory(feedback);

            // Generate learning signal (Chapter 7)
            this._processLearningSignal(feedback);

            this._emit('feedbackRecorded', feedback.toJSON());

            return feedback;
        }

        // ============================================================
        // Prediction Evaluation (Chapter 6)
        // ============================================================

        evaluate(predictionId, options) {
            const feedbacks = this._feedbacks.filter(f => f.predictionId === predictionId);
            if (feedbacks.length === 0) {
                console.warn(`[PredictiveFeedback] No feedback found for: ${predictionId}`);
                return null;
            }

            const latest = feedbacks[feedbacks.length - 1];
            const avgAccuracy = feedbacks.reduce((sum, f) => sum + f.accuracy, 0) / feedbacks.length;
            const trend = this._calculateTrend(feedbacks);

            const evaluation = {
                predictionId: predictionId,
                totalFeedback: feedbacks.length,
                latestAccuracy: latest.accuracy,
                averageAccuracy: Math.round(avgAccuracy),
                trend: trend,
                learningSignal: latest.learningSignal,
                status: EVALUATION_STATUS.EVALUATED,
                timestamp: Date.now()
            };

            this._emit('evaluated', evaluation);

            return evaluation;
        }

        // ============================================================
        // Compare (Chapter 3)
        // ============================================================

        compare(predictionId, actualResult) {
            const prediction = this._findPrediction(predictionId);
            if (!prediction) {
                console.warn(`[PredictiveFeedback] Prediction not found: ${predictionId}`);
                return null;
            }

            const forecast = prediction.forecast || prediction.predictedValue || 0;
            const difference = actualResult - forecast;
            const accuracy = this._calculateAccuracy(forecast, actualResult);

            return {
                predictionId: predictionId,
                forecast: forecast,
                actualResult: actualResult,
                difference: difference,
                accuracy: accuracy,
                isAccurate: accuracy >= this._config.accuracyThreshold,
                timestamp: Date.now()
            };
        }

        // ============================================================
        // Learning (Chapter 7)
        // ============================================================

        learn(feedback) {
            console.log(`[PredictiveFeedback] Learning from feedback: ${feedback.feedbackId}`);

            // Update confidence for the source prediction system
            const confidenceAdjustment = this._calculateConfidenceAdjustment(feedback);

            // Update accuracy trend
            this._updateAccuracyTrend(feedback);

            // Store learning signal
            const learningResult = {
                feedbackId: feedback.feedbackId,
                predictionId: feedback.predictionId,
                learningSignal: feedback.learningSignal,
                confidenceAdjustment: confidenceAdjustment,
                timestamp: Date.now()
            };

            this._emit('learningComplete', learningResult);

            return learningResult;
        }

        // ============================================================
        // Accuracy Improvement (Chapter 10)
        // ============================================================

        getAccuracyImprovement(target, window) {
            const history = this._accuracyHistory.filter(h => 
                h.target === target || target === 'all'
            );

            if (history.length < this._config.minSamplesForTrend) {
                return { improvement: 0, confidence: 30 };
            }

            const recent = history.slice(-(window || 10));
            const first = recent[0];
            const last = recent[recent.length - 1];

            const improvement = last.accuracy - first.accuracy;
            const confidence = Math.min(80, 40 + recent.length * 2);

            return {
                improvement: Math.round(improvement * 100) / 100,
                confidence: Math.round(confidence),
                samples: recent.length,
                trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
            };
        }

        // ============================================================
        // Feedback History (Chapter 8)
        // ============================================================

        getFeedbackHistory(filter) {
            let feedbacks = this._feedbacks;

            if (filter) {
                if (filter.target) {
                    feedbacks = feedbacks.filter(f => f.target === filter.target);
                }
                if (filter.learningSignal) {
                    feedbacks = feedbacks.filter(f => f.learningSignal === filter.learningSignal);
                }
                if (filter.minAccuracy) {
                    feedbacks = feedbacks.filter(f => f.accuracy >= filter.minAccuracy);
                }
                if (filter.limit) {
                    feedbacks = feedbacks.slice(-filter.limit);
                }
            }

            return feedbacks.map(f => f.toJSON());
        }

        getPredictionHistory(limit) {
            return this._predictionHistory.slice(-(limit || 20)).reverse();
        }

        getAccuracyHistory(target, limit) {
            const history = this._accuracyHistory.filter(h => 
                h.target === target || target === 'all'
            );
            return history.slice(-(limit || 20));
        }

        // ============================================================
        // Accuracy Rate (Chapter 11)
        // ============================================================

        getAccuracyRate(target) {
            const feedbacks = this._feedbacks.filter(f => 
                f.target === target || target === 'all'
            );

            if (feedbacks.length === 0) return 0;

            const accurate = feedbacks.filter(f => f.accuracy >= this._config.accuracyThreshold);
            return Math.round((accurate.length / feedbacks.length) * 100);
        }

        getStats() {
            const total = this._feedbacks.length;
            const positive = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.POSITIVE).length;
            const negative = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEGATIVE).length;
            const neutral = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEUTRAL).length;

            const avgAccuracy = total > 0 ?
                Math.round(this._feedbacks.reduce((sum, f) => sum + f.accuracy, 0) / total) :
                0;

            const accuracyRate = this.getAccuracyRate('all');

            return {
                total,
                positive,
                negative,
                neutral,
                avgAccuracy,
                accuracyRate,
                historySize: this._predictionHistory.length,
                targets: Object.keys(this._trends)
            };
        }

        // ============================================================
        // Private Helpers
        // ============================================================

        _calculateAccuracy(forecast, actual) {
            if (forecast === 0 && actual === 0) return 100;
            if (forecast === 0) return 0;
            const error = Math.abs((actual - forecast) / forecast) * 100;
            return Math.max(0, Math.min(100, 100 - error));
        }

        _determineLearningSignal(accuracy, difference) {
            if (accuracy >= 80) return LEARNING_SIGNAL.POSITIVE;
            if (accuracy < 50) return LEARNING_SIGNAL.NEGATIVE;
            return LEARNING_SIGNAL.NEUTRAL;
        }

        _calculateConfidenceAdjustment(feedback) {
            const baseRate = this._config.confidenceAdjustmentRate;
            if (feedback.learningSignal === LEARNING_SIGNAL.POSITIVE) {
                return baseRate * 0.5;
            }
            if (feedback.learningSignal === LEARNING_SIGNAL.NEGATIVE) {
                return -baseRate;
            }
            return 0;
        }

        _calculateTrend(feedbacks) {
            if (feedbacks.length < 3) return 'stable';
            const recent = feedbacks.slice(-5);
            const first = recent[0];
            const last = recent[recent.length - 1];
            if (last.accuracy > first.accuracy + 5) return 'improving';
            if (last.accuracy < first.accuracy - 5) return 'declining';
            return 'stable';
        }

        _findPrediction(id) {
            // Check various prediction sources
            try {
                if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                    const results = window.LawAIApp.PredictiveIntelligence.getResults ?
                        window.LawAIApp.PredictiveIntelligence.getResults({ limit: 50 }) : null;
                    if (results) {
                        const found = results.find(r => r.resultId === id || r.forecastId === id);
                        if (found) return found;
                    }
                }

                if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
                    const trends = window.LawAIApp.TrendPrediction.getTrends ?
                        window.LawAIApp.TrendPrediction.getTrends({ limit: 50 }) : null;
                    if (trends) {
                        const found = trends.find(t => t.trendId === id);
                        if (found) return found;
                    }
                }
            } catch (e) { /* ignore */ }

            return null;
        }

        // ============================================================
        // History Updates
        // ============================================================

        _updatePredictionHistory(predictionId, feedback) {
            const existing = this._predictionHistory.find(h => h.predictionId === predictionId);
            if (existing) {
                existing.feedbackCount = (existing.feedbackCount || 0) + 1;
                existing.lastFeedback = feedback.timestamp;
                existing.latestAccuracy = feedback.accuracy;
            } else {
                this._predictionHistory.push({
                    predictionId: predictionId,
                    target: feedback.target,
                    firstFeedback: feedback.timestamp,
                    lastFeedback: feedback.timestamp,
                    feedbackCount: 1,
                    latestAccuracy: feedback.accuracy
                });
            }

            if (this._predictionHistory.length > 100) {
                this._predictionHistory = this._predictionHistory.slice(-100);
            }
        }

        _updateAccuracyHistory(feedback) {
            this._accuracyHistory.push({
                target: feedback.target,
                accuracy: feedback.accuracy,
                timestamp: feedback.timestamp,
                learningSignal: feedback.learningSignal
            });

            if (this._accuracyHistory.length > this._config.maxHistorySize) {
                this._accuracyHistory = this._accuracyHistory.slice(-this._config.maxHistorySize);
            }
        }

        _updateAccuracyTrend(feedback) {
            if (!this._trends[feedback.target]) {
                this._trends[feedback.target] = {
                    history: [],
                    currentAccuracy: 0,
                    total: 0
                };
            }

            const trend = this._trends[feedback.target];
            trend.history.push(feedback.accuracy);
            trend.currentAccuracy = feedback.accuracy;
            trend.total++;

            // Keep only recent history
            if (trend.history.length > 100) {
                trend.history = trend.history.slice(-100);
            }
        }

        // ============================================================
        // Learning Signal Processing (Chapter 7)
        // ============================================================

        _processLearningSignal(feedback) {
            // Update confidence for the source system
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                try {
                    // Send learning signal to predictive intelligence
                } catch (e) { /* ignore */ }
            }

            // Store learning signal
            const signal = {
                signalId: `sig_${Date.now()}`,
                feedbackId: feedback.feedbackId,
                type: feedback.learningSignal,
                confidence: feedback.accuracy,
                timestamp: Date.now()
            };

            this._emit('learningSignal', signal);
        }

        // ============================================================
        // Auto-Learning (Chapter 4)
        // ============================================================

        _startAutoLearning() {
            if (this._learningInterval) {
                clearInterval(this._learningInterval);
            }

            this._learningInterval = setInterval(() => {
                // Process pending feedback
                const pending = this._feedbacks.filter(f => f.status === EVALUATION_STATUS.PENDING);
                pending.forEach(feedback => {
                    feedback.status = EVALUATION_STATUS.EVALUATED;
                    this.learn(feedback);
                    feedback.status = EVALUATION_STATUS.UPDATED;
                });

                if (pending.length > 0) {
                    console.log(`[PredictiveFeedback] Auto-learned from ${pending.length} feedbacks`);
                }
            }, this._config.learningInterval);

            console.log(`[PredictiveFeedback] Auto-learning started (${this._config.learningInterval}ms)`);
        }

        _stopAutoLearning() {
            if (this._learningInterval) {
                clearInterval(this._learningInterval);
                this._learningInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 14)
        // ============================================================

        evaluateAll() {
            const results = [];
            const uniquePredictions = [...new Set(this._feedbacks.map(f => f.predictionId))];

            uniquePredictions.forEach(id => {
                const result = this.evaluate(id);
                if (result) results.push(result);
            });

            return results;
        }

        compareAll(actualResults) {
            const results = [];
            const predictions = this._predictionHistory;

            predictions.forEach(pred => {
                const actual = actualResults[pred.predictionId];
                if (actual !== undefined) {
                    const result = this.compare(pred.predictionId, actual);
                    if (result) results.push(result);
                }
            });

            return results;
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getFeedbackHistory({ limit: 5 });
            const accuracyHistory = this.getAccuracyHistory('all', 10);
            const improvement = this.getAccuracyImprovement('all');

            return {
                type: 'predictive_feedback',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentFeedback: recent,
                accuracyHistory: accuracyHistory,
                improvement: improvement,
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
                        console.error('[PredictiveFeedback] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`pfeedback.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('predictiveFeedbackData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.feedbacks) {
                        this._feedbacks = data.feedbacks.map(f => new PredictiveFeedback(f));
                    }
                    if (data.history) {
                        this._predictionHistory = data.history;
                    }
                    if (data.accuracyHistory) {
                        this._accuracyHistory = data.accuracyHistory;
                    }
                    if (data.trends) {
                        this._trends = data.trends;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 9)
        // ============================================================

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[PredictiveFeedback] Connected to Historical Memory');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[PredictiveFeedback] Connected to Decision Intelligence');
            }
        }

        _connectToAdaptiveLearning() {
            if (window.LawAIApp && window.LawAIApp.AdaptiveLoop) {
                console.log('[PredictiveFeedback] Connected to Adaptive Learning');
            }
        }

        _connectToOptimizationFeedback() {
            if (window.LawAIApp && window.LawAIApp.OptimizationFeedback) {
                console.log('[PredictiveFeedback] Connected to Optimization Feedback');
            }
        }

        _connectToRiskForecast() {
            if (window.LawAIApp && window.LawAIApp.RiskForecasting) {
                console.log('[PredictiveFeedback] Connected to Risk Forecast');
            }
        }

        _connectToFailurePrediction() {
            if (window.LawAIApp && window.LawAIApp.FailurePrediction) {
                console.log('[PredictiveFeedback] Connected to Failure Prediction');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'predictive-feedback',
                        name: 'Predictive Feedback',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[PredictiveFeedback] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[PredictiveFeedback] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoLearning();
            this._initialized = false;
            console.log('[PredictiveFeedback] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new PredictiveFeedbackLoop();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.PredictiveFeedback = {
        Core: instance,
        LEARNING_SIGNAL: LEARNING_SIGNAL,
        EVALUATION_STATUS: EVALUATION_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        record: (predictionId, forecast, actualResult, metadata) => 
            instance.record(predictionId, forecast, actualResult, metadata),
        evaluate: (predictionId, options) => instance.evaluate(predictionId, options),
        evaluateAll: () => instance.evaluateAll(),
        compare: (predictionId, actualResult) => instance.compare(predictionId, actualResult),
        compareAll: (actualResults) => instance.compareAll(actualResults),
        learn: (feedback) => instance.learn(feedback),

        getFeedbackHistory: (filter) => instance.getFeedbackHistory(filter),
        getPredictionHistory: (limit) => instance.getPredictionHistory(limit),
        getAccuracyHistory: (target, limit) => instance.getAccuracyHistory(target, limit),
        getAccuracyRate: (target) => instance.getAccuracyRate(target),
        getAccuracyImprovement: (target, window) => instance.getAccuracyImprovement(target, window),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[PredictiveFeedback] Part 53.6 loaded ✅');
    console.log('[PredictiveFeedback] Learning Signals:', Object.values(LEARNING_SIGNAL).join(' | '));

})();
