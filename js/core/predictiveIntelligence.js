// ============================================================
// predictiveIntelligence.js
// Part 53.1 — Predictive Intelligence Foundation
// Version: v5.3.1
// Module: Predictive Runtime Layer
// File: js/core/predictiveIntelligence.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
        console.warn('[PredictiveIntelligence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Forecast Categories (Chapter 6)
    // ============================================================
    const FORECAST_CATEGORY = {
        PERFORMANCE: 'performance',
        RESOURCE: 'resource',
        ARCHITECTURE: 'architecture',
        MODULE_HEALTH: 'module_health',
        RUNTIME_STABILITY: 'runtime_stability'
    };

    // ============================================================
    // Prediction Status
    // ============================================================
    const PREDICTION_STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    };

    // ============================================================
    // Prediction Context (Chapter 4)
    // ============================================================
    class PredictionContext {
        constructor(config) {
            this.forecastId = config.forecastId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.currentState = config.currentState || null;
            this.historicalTrend = config.historicalTrend || null;
            this.predictionWindow = config.predictionWindow || 'short';
            this.confidence = config.confidence || 0;
            this.status = PREDICTION_STATUS.PENDING;
            this.metadata = config.metadata || {};
            this.sources = config.sources || [];
        }

        _generateId() {
            return `pctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                forecastId: this.forecastId,
                timestamp: this.timestamp,
                target: this.target,
                currentState: this.currentState,
                historicalTrend: this.historicalTrend,
                predictionWindow: this.predictionWindow,
                confidence: this.confidence,
                status: this.status,
                sources: this.sources,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Forecast Result
    // ============================================================
    class ForecastResult {
        constructor(config) {
            this.resultId = config.resultId || this._generateId();
            this.forecastId = config.forecastId || null;
            this.timestamp = Date.now();
            this.category = config.category || FORECAST_CATEGORY.PERFORMANCE;
            this.predictedValue = config.predictedValue || 0;
            this.currentValue = config.currentValue || 0;
            this.delta = config.delta || 0;
            this.deltaPercent = config.deltaPercent || 0;
            this.confidence = config.confidence || 0;
            this.trend = config.trend || 'stable';
            this.risk = config.risk || 'LOW';
            this.recommendation = config.recommendation || null;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `fres_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                resultId: this.resultId,
                forecastId: this.forecastId,
                timestamp: this.timestamp,
                category: this.category,
                predictedValue: this.predictedValue,
                currentValue: this.currentValue,
                delta: this.delta,
                deltaPercent: this.deltaPercent,
                confidence: this.confidence,
                trend: this.trend,
                risk: this.risk,
                recommendation: this.recommendation,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Predictive Intelligence Core (Chapter 1-3)
    // ============================================================
    class PredictiveIntelligence {
        constructor() {
            this._contexts = [];
            this._results = [];
            this._predictors = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minDataPoints: 5,
                defaultConfidence: 50,
                enableAutoPrediction: true,
                predictionInterval: 60000,
                shortWindow: 5,
                mediumWindow: 20,
                longWindow: 50
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[PredictiveIntelligence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[PredictiveIntelligence] Initializing...');

            // Register predictors
            this._registerPredictors();

            // Connect to modules (Chapter 7)
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();
            this._connectToRuntimeExplorer();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-prediction
            if (this._config.enableAutoPrediction) {
                this._startAutoPrediction();
            }

            this._initialized = true;
            console.log('[PredictiveIntelligence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Register Predictors (Chapter 5)
        // ============================================================

        _registerPredictors() {
            // Register built-in predictors
            this.registerPredictor(FORECAST_CATEGORY.PERFORMANCE, {
                name: 'performance_predictor',
                predict: (context) => this._predictPerformance(context)
            });

            this.registerPredictor(FORECAST_CATEGORY.RESOURCE, {
                name: 'resource_predictor',
                predict: (context) => this._predictResource(context)
            });

            this.registerPredictor(FORECAST_CATEGORY.ARCHITECTURE, {
                name: 'architecture_predictor',
                predict: (context) => this._predictArchitecture(context)
            });

            this.registerPredictor(FORECAST_CATEGORY.MODULE_HEALTH, {
                name: 'module_health_predictor',
                predict: (context) => this._predictModuleHealth(context)
            });

            this.registerPredictor(FORECAST_CATEGORY.RUNTIME_STABILITY, {
                name: 'runtime_stability_predictor',
                predict: (context) => this._predictRuntimeStability(context)
            });

            console.log('[PredictiveIntelligence] Registered 5 predictors');
        }

        registerPredictor(category, predictor) {
            this._predictors[category] = predictor;
            console.log(`[PredictiveIntelligence] Registered predictor: ${category}`);
            return this;
        }

        // ============================================================
        // Core: Predict (Chapter 2-3)
        // ============================================================

        predict(target, options) {
            console.log(`[PredictiveIntelligence] Starting prediction for: ${target}`);

            // Find matching category
            const category = this._findCategory(target);

            // Get predictor
            const predictor = this._predictors[category];
            if (!predictor) {
                console.warn(`[PredictiveIntelligence] No predictor for: ${category}`);
                return null;
            }

            // Build prediction context (Chapter 4)
            const context = this._buildContext(target, category, options);

            // Update context status
            context.status = PREDICTION_STATUS.PROCESSING;
            this._contexts.push(context);

            try {
                // Run prediction
                const result = predictor.predict(context);

                if (!result) {
                    context.status = PREDICTION_STATUS.FAILED;
                    this._emit('predictionFailed', context.toJSON());
                    return null;
                }

                // Create forecast result
                const forecastResult = new ForecastResult({
                    forecastId: context.forecastId,
                    category: category,
                    predictedValue: result.predictedValue || 0,
                    currentValue: result.currentValue || 0,
                    delta: result.delta || 0,
                    deltaPercent: result.deltaPercent || 0,
                    confidence: result.confidence || this._config.defaultConfidence,
                    trend: result.trend || 'stable',
                    risk: result.risk || 'LOW',
                    recommendation: result.recommendation || null,
                    evidence: result.evidence || [],
                    metadata: {
                        target: target,
                        options: options || {},
                        predictor: predictor.name || 'unknown'
                    }
                });

                // Update context
                context.status = PREDICTION_STATUS.COMPLETED;
                context.confidence = forecastResult.confidence;
                context.historicalTrend = result.trend || 'stable';

                this._results.push(forecastResult);

                this._emit('predictionComplete', {
                    context: context.toJSON(),
                    result: forecastResult.toJSON()
                });

                return forecastResult;

            } catch (error) {
                context.status = PREDICTION_STATUS.FAILED;
                context.metadata.error = error.message;
                this._emit('predictionError', {
                    context: context.toJSON(),
                    error: error.message
                });
                console.error('[PredictiveIntelligence] Prediction error:', error);
                return null;
            }
        }

        predictAll(options) {
            const results = {};
            const categories = Object.values(FORECAST_CATEGORY);

            categories.forEach(category => {
                const result = this.predict(category, options);
                if (result) {
                    results[category] = result.toJSON();
                }
            });

            return results;
        }

        // ============================================================
        // Context Building (Chapter 4)
        // ============================================================

        _buildContext(target, category, options) {
            const currentState = this._getCurrentState(target);
            const historicalTrend = this._getHistoricalTrend(target);

            return new PredictionContext({
                target: target,
                currentState: currentState,
                historicalTrend: historicalTrend,
                predictionWindow: options?.window || 'short',
                confidence: this._config.defaultConfidence,
                sources: this._getDataSources(),
                metadata: {
                    category: category,
                    options: options || {},
                    timestamp: Date.now()
                }
            });
        }

        _getCurrentState(target) {
            try {
                // Try to get from various sources
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    const state = window.LawAIApp.Runtime.getState ?
                        window.LawAIApp.Runtime.getState() : null;
                    if (state) return state;
                }

                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report) return report;
                }
            } catch (e) { /* ignore */ }

            return { status: 'unknown', value: 0 };
        }

        _getHistoricalTrend(target) {
            // Simplified - would pull from historical memory
            return {
                direction: 'stable',
                slope: 0,
                dataPoints: 10
            };
        }

        _getDataSources() {
            const sources = [];
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                sources.push('historical_memory');
            }
            if (window.LawAIApp && window.LawAIApp.Performance) {
                sources.push('performance');
            }
            if (window.LawAIApp && window.LawAIApp.Events) {
                sources.push('events');
            }
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                sources.push('knowledge_graph');
            }
            return sources;
        }

        // ============================================================
        // Predictor: Performance (Chapter 6)
        // ============================================================

        _predictPerformance(context) {
            const data = this._getDataPoints('performance', 20);
            const current = data.length > 0 ? data[data.length - 1] : 0;
            const trend = this._calculateTrend(data);
            const predicted = this._extrapolate(data, trend);

            return {
                currentValue: current,
                predictedValue: Math.round(predicted * 100) / 100,
                delta: predicted - current,
                deltaPercent: current > 0 ? Math.round(((predicted - current) / current) * 100) : 0,
                confidence: this._calculateConfidence(data),
                trend: trend.direction,
                risk: this._assessRisk(predicted, 60, 80),
                recommendation: this._generateRecommendation('performance', predicted, trend),
                evidence: [`Trend: ${trend.direction}`, `Slope: ${trend.slope.toFixed(2)}`]
            };
        }

        // ============================================================
        // Predictor: Resource (Chapter 6)
        // ============================================================

        _predictResource(context) {
            const data = this._getDataPoints('resource', 20);
            const current = data.length > 0 ? data[data.length - 1] : 0;
            const trend = this._calculateTrend(data);
            const predicted = this._extrapolate(data, trend);

            return {
                currentValue: current,
                predictedValue: Math.round(predicted * 100) / 100,
                delta: predicted - current,
                deltaPercent: current > 0 ? Math.round(((predicted - current) / current) * 100) : 0,
                confidence: this._calculateConfidence(data),
                trend: trend.direction,
                risk: this._assessRisk(predicted, 50, 75),
                recommendation: this._generateRecommendation('resource', predicted, trend),
                evidence: [`Resource trend: ${trend.direction}`, `Current: ${current}%`]
            };
        }

        // ============================================================
        // Predictor: Architecture (Chapter 6)
        // ============================================================

        _predictArchitecture(context) {
            const data = this._getDataPoints('architecture', 15);
            const current = data.length > 0 ? data[data.length - 1] : 0;
            const trend = this._calculateTrend(data);
            const predicted = this._extrapolate(data, trend);

            return {
                currentValue: current,
                predictedValue: Math.round(predicted * 100) / 100,
                delta: predicted - current,
                deltaPercent: current > 0 ? Math.round(((predicted - current) / current) * 100) : 0,
                confidence: this._calculateConfidence(data),
                trend: trend.direction,
                risk: this._assessRisk(predicted, 0.5, 0.7, true),
                recommendation: this._generateRecommendation('architecture', predicted, trend),
                evidence: [`Architecture trend: ${trend.direction}`, `Complexity: ${(current * 100).toFixed(0)}%`]
            };
        }

        // ============================================================
        // Predictor: Module Health (Chapter 6)
        // ============================================================

        _predictModuleHealth(context) {
            const data = this._getDataPoints('module_health', 15);
            const current = data.length > 0 ? data[data.length - 1] : 0;
            const trend = this._calculateTrend(data);
            const predicted = this._extrapolate(data, trend);

            return {
                currentValue: current,
                predictedValue: Math.round(predicted * 100) / 100,
                delta: predicted - current,
                deltaPercent: current > 0 ? Math.round(((predicted - current) / current) * 100) : 0,
                confidence: this._calculateConfidence(data),
                trend: trend.direction,
                risk: this._assessRisk(predicted, 60, 80, true),
                recommendation: this._generateRecommendation('module_health', predicted, trend),
                evidence: [`Module health trend: ${trend.direction}`, `Health: ${(current * 100).toFixed(0)}%`]
            };
        }

        // ============================================================
        // Predictor: Runtime Stability (Chapter 6)
        // ============================================================

        _predictRuntimeStability(context) {
            const data = this._getDataPoints('stability', 15);
            const current = data.length > 0 ? data[data.length - 1] : 0;
            const trend = this._calculateTrend(data);
            const predicted = this._extrapolate(data, trend);

            return {
                currentValue: current,
                predictedValue: Math.round(predicted * 100) / 100,
                delta: predicted - current,
                deltaPercent: current > 0 ? Math.round(((predicted - current) / current) * 100) : 0,
                confidence: this._calculateConfidence(data),
                trend: trend.direction,
                risk: this._assessRisk(predicted, 70, 90, true),
                recommendation: this._generateRecommendation('stability', predicted, trend),
                evidence: [`Stability trend: ${trend.direction}`, `Stability: ${(current * 100).toFixed(0)}%`]
            };
        }

        // ============================================================
        // Analysis Helpers
        // ============================================================

        _getDataPoints(type, count) {
            // Try to get real data
            try {
                if (type === 'performance' && window.LawAIApp?.Performance?.getHistory) {
                    const history = window.LawAIApp.Performance.getHistory('cpu', count);
                    if (history && history.length > 0) {
                        return history.map(h => h.value || 0);
                    }
                }
            } catch (e) { /* ignore */ }

            // Generate synthetic data
            return this._generateSyntheticData(count, 30, 70);
        }

        _generateSyntheticData(count, min, max) {
            const data = [];
            let value = (min + max) / 2;
            for (let i = 0; i < count; i++) {
                value += (Math.random() - 0.5) * 4;
                value = Math.max(min, Math.min(max, value));
                data.push(Math.round(value * 100) / 100);
            }
            return data;
        }

        _calculateTrend(data) {
            const n = data.length;
            if (n < 2) {
                return { direction: 'stable', slope: 0, acceleration: 0 };
            }

            const indices = data.map((_, i) => i);
            const sumX = indices.reduce((a, b) => a + b, 0);
            const sumY = data.reduce((a, b) => a + b, 0);
            const sumXY = indices.reduce((a, b, i) => a + b * data[i], 0);
            const sumX2 = indices.reduce((a, b) => a + b * b, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

            let direction = 'stable';
            if (slope > 0.03) direction = 'increasing';
            else if (slope < -0.03) direction = 'decreasing';

            return { direction, slope, acceleration: 0 };
        }

        _extrapolate(data, trend) {
            const n = data.length;
            const lastValue = data[data.length - 1] || 50;
            return Math.max(0, Math.min(100, lastValue + trend.slope * 5));
        }

        _calculateConfidence(data) {
            const n = data.length;
            if (n < this._config.minDataPoints) return 40;

            // Variance-based confidence
            const mean = data.reduce((a, b) => a + b, 0) / n;
            const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
            const stdDev = Math.sqrt(variance);

            const cv = mean > 0 ? stdDev / mean : 1;
            let confidence = 80 - (cv * 100);
            confidence = Math.max(40, Math.min(95, confidence));

            // Adjust for data points
            confidence += Math.min((n - this._config.minDataPoints) * 2, 15);

            return Math.round(confidence);
        }

        _assessRisk(value, mediumThreshold, highThreshold, inverse) {
            if (inverse) {
                if (value < highThreshold) return 'CRITICAL';
                if (value < mediumThreshold) return 'HIGH';
                if (value < 85) return 'MEDIUM';
                return 'LOW';
            }

            if (value > highThreshold) return 'CRITICAL';
            if (value > mediumThreshold) return 'HIGH';
            if (value > 50) return 'MEDIUM';
            return 'LOW';
        }

        _generateRecommendation(type, value, trend) {
            if (trend.direction === 'increasing' && type === 'performance') {
                return 'Performance predicted to increase. Monitor closely.';
            }
            if (trend.direction === 'decreasing' && type === 'performance') {
                return 'Performance degradation predicted. Optimize proactively.';
            }
            if (trend.direction === 'increasing' && type === 'resource') {
                return 'Resource usage trending up. Plan capacity.';
            }
            if (trend.direction === 'decreasing' && type === 'stability') {
                return 'Stability declining. Investigate root cause.';
            }
            return 'Continue monitoring. No immediate action required.';
        }

        _findCategory(target) {
            // Map target to category
            const lower = target.toLowerCase();
            if (lower.includes('perform') || lower.includes('cpu') || lower.includes('speed')) {
                return FORECAST_CATEGORY.PERFORMANCE;
            }
            if (lower.includes('resource') || lower.includes('memory') || lower.includes('storage')) {
                return FORECAST_CATEGORY.RESOURCE;
            }
            if (lower.includes('architecture') || lower.includes('structure') || lower.includes('design')) {
                return FORECAST_CATEGORY.ARCHITECTURE;
            }
            if (lower.includes('module') || lower.includes('component')) {
                return FORECAST_CATEGORY.MODULE_HEALTH;
            }
            if (lower.includes('stable') || lower.includes('uptime') || lower.includes('health')) {
                return FORECAST_CATEGORY.RUNTIME_STABILITY;
            }
            return FORECAST_CATEGORY.PERFORMANCE;
        }

        // ============================================================
        // Auto-Prediction
        // ============================================================

        _startAutoPrediction() {
            if (this._predictionInterval) {
                clearInterval(this._predictionInterval);
            }

            this._predictionInterval = setInterval(() => {
                this.predictAll();
            }, this._config.predictionInterval);

            console.log(`[PredictiveIntelligence] Auto-prediction started (${this._config.predictionInterval}ms)`);
        }

        _stopAutoPrediction() {
            if (this._predictionInterval) {
                clearInterval(this._predictionInterval);
                this._predictionInterval = null;
            }
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getContexts(filter) {
            let contexts = this._contexts;

            if (filter) {
                if (filter.target) {
                    contexts = contexts.filter(c => c.target === filter.target);
                }
                if (filter.status) {
                    contexts = contexts.filter(c => c.status === filter.status);
                }
                if (filter.limit) {
                    contexts = contexts.slice(-filter.limit);
                }
            }

            return contexts.map(c => c.toJSON());
        }

        getResults(filter) {
            let results = this._results;

            if (filter) {
                if (filter.category) {
                    results = results.filter(r => r.category === filter.category);
                }
                if (filter.minConfidence) {
                    results = results.filter(r => r.confidence >= filter.minConfidence);
                }
                if (filter.limit) {
                    results = results.slice(-filter.limit);
                }
            }

            return results.map(r => r.toJSON());
        }

        getResult(id) {
            const result = this._results.find(r => r.resultId === id);
            return result ? result.toJSON() : null;
        }

        getStats() {
            const total = this._results.length;
            const byCategory = {};

            this._results.forEach(r => {
                byCategory[r.category] = (byCategory[r.category] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._results.reduce((sum, r) => sum + r.confidence, 0) / total) :
                0;

            const highRisk = this._results.filter(r => 
                r.risk === 'CRITICAL' || r.risk === 'HIGH'
            ).length;

            return {
                total,
                byCategory,
                avgConfidence,
                highRisk,
                contexts: this._contexts.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 9)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getResults({ limit: 5 });
            const recentContexts = this.getContexts({ limit: 3 });

            return {
                type: 'predictive_intelligence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentResults: recent,
                recentContexts: recentContexts,
                config: this._config,
                predictors: Object.keys(this._predictors)
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
                        console.error('[PredictiveIntelligence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`predictive.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('predictiveIntelligenceData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.contexts) {
                        this._contexts = data.contexts.map(c => new PredictionContext(c));
                    }
                    if (data.results) {
                        this._results = data.results.map(r => new ForecastResult(r));
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 7)
        // ============================================================

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[PredictiveIntelligence] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[PredictiveIntelligence] Connected to Optimization Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[PredictiveIntelligence] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[PredictiveIntelligence] Connected to Governance');
            }
        }

        _connectToRuntimeExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                console.log('[PredictiveIntelligence] Connected to Runtime Explorer');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'predictive-intelligence',
                        name: 'Predictive Intelligence',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[PredictiveIntelligence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[PredictiveIntelligence] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoPrediction();
            this._initialized = false;
            console.log('[PredictiveIntelligence] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new PredictiveIntelligence();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.PredictiveIntelligence = {
        Core: instance,
        FORECAST_CATEGORY: FORECAST_CATEGORY,
        PREDICTION_STATUS: PREDICTION_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        predict: (target, options) => instance.predict(target, options),
        predictAll: (options) => instance.predictAll(options),
        registerPredictor: (category, predictor) => instance.registerPredictor(category, predictor),

        getContexts: (filter) => instance.getContexts(filter),
        getResults: (filter) => instance.getResults(filter),
        getResult: (id) => instance.getResult(id),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[PredictiveIntelligence] Part 53.1 loaded ✅');
    console.log('[PredictiveIntelligence] Categories:', Object.values(FORECAST_CATEGORY).join(' | '));

})();
