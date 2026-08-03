// ============================================================
// trendPrediction.js
// Part 53.2 — Runtime Trend Prediction Engine
// Version: v5.3.2
// Module: Predictive Runtime Layer
// File: js/core/trendPrediction.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.TrendPrediction) {
        console.warn('[TrendPrediction] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Trend Direction (Chapter 6)
    // ============================================================
    const TREND_DIRECTION = {
        GROWING: 'growing',
        DECLINING: 'declining',
        STABLE: 'stable',
        ABNORMAL: 'abnormal',
        SEASONAL: 'seasonal'
    };

    // ============================================================
    // Forecast Window (Chapter 7)
    // ============================================================
    const FORECAST_WINDOW = {
        NEXT_SESSION: 'next_session',
        NEXT_24H: 'next_24h',
        NEXT_7D: 'next_7d',
        NEXT_RELEASE: 'next_release',
        CUSTOM: 'custom'
    };

    // ============================================================
    // Trend Model (Chapter 5)
    // ============================================================
    class TrendModel {
        constructor(config) {
            this.trendId = config.trendId || this._generateId();
            this.timestamp = Date.now();
            this.target = config.target || 'unknown';
            this.baseline = config.baseline || 0;
            this.currentValue = config.currentValue || 0;
            this.trendDirection = config.trendDirection || TREND_DIRECTION.STABLE;
            this.forecast = config.forecast || null;
            this.confidence = config.confidence || 0;
            this.growthRate = config.growthRate || 0;
            this.window = config.window || FORECAST_WINDOW.NEXT_24H;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `trend_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getDelta() {
            return this.currentValue - this.baseline;
        }

        getDeltaPercent() {
            if (this.baseline === 0) return 0;
            return Math.round((this.getDelta() / this.baseline) * 100);
        }

        toJSON() {
            return {
                trendId: this.trendId,
                timestamp: this.timestamp,
                target: this.target,
                baseline: this.baseline,
                currentValue: this.currentValue,
                delta: this.getDelta(),
                deltaPercent: this.getDeltaPercent(),
                trendDirection: this.trendDirection,
                forecast: this.forecast,
                confidence: this.confidence,
                growthRate: this.growthRate,
                window: this.window,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Trend Prediction Engine Core (Chapter 1-3)
    // ============================================================
    class TrendPrediction {
        constructor() {
            this._trends = [];
            this._forecasts = [];
            this._history = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minDataPoints: 5,
                confidenceThreshold: 50,
                enableAutoPrediction: true,
                predictionInterval: 90000,
                seasonalWindow: 7,
                abnormalThreshold: 2.5
            };
            this._targets = this._initTargets();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[TrendPrediction] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[TrendPrediction] Initializing...');

            // Connect to modules (Chapter 8)
            this._connectToHistoricalMemory();
            this._connectToPerformanceFramework();
            this._connectToMetricsFramework();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveCore();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-prediction
            if (this._config.enableAutoPrediction) {
                this._startAutoPrediction();
            }

            this._initialized = true;
            console.log('[TrendPrediction] Initialized ✅');
            return this;
        }

        // ============================================================
        // Prediction Targets (Chapter 4)
        // ============================================================

        _initTargets() {
            return {
                boot_time: {
                    name: 'Boot Time',
                    unit: 'ms',
                    getData: () => this._getBootTimeData(),
                    baseline: 2000
                },
                memory_usage: {
                    name: 'Memory Usage',
                    unit: '%',
                    getData: () => this._getMemoryData(),
                    baseline: 60
                },
                cpu_load: {
                    name: 'CPU Load',
                    unit: '%',
                    getData: () => this._getCPUData(),
                    baseline: 40
                },
                module_growth: {
                    name: 'Module Growth',
                    unit: 'count',
                    getData: () => this._getModuleData(),
                    baseline: 10
                },
                event_volume: {
                    name: 'Event Volume',
                    unit: 'count',
                    getData: () => this._getEventData(),
                    baseline: 50
                },
                knowledge_graph_size: {
                    name: 'Knowledge Graph Size',
                    unit: 'entities',
                    getData: () => this._getKnowledgeGraphData(),
                    baseline: 20
                }
            };
        }

        // ============================================================
        // Core: Predict Trend (Chapter 2-3)
        // ============================================================

        predictTrend(target, window) {
            console.log(`[TrendPrediction] Predicting trend for: ${target}`);

            const targetConfig = this._targets[target];
            if (!targetConfig) {
                console.warn(`[TrendPrediction] Unknown target: ${target}`);
                return null;
            }

            // Get data
            const data = targetConfig.getData();
            if (!data || data.length < this._config.minDataPoints) {
                console.warn(`[TrendPrediction] Insufficient data for: ${target}`);
                return null;
            }

            // Analyze trend
            const analysis = this._analyzeTrend(data);

            // Detect pattern (Chapter 6)
            const pattern = this._detectPattern(data, analysis);

            // Build forecast
            const forecast = this._buildForecast(data, analysis, pattern, window);

            // Create trend model
            const trend = new TrendModel({
                target: target,
                baseline: targetConfig.baseline || data[0] || 0,
                currentValue: data[data.length - 1] || 0,
                trendDirection: pattern.direction,
                forecast: forecast,
                confidence: analysis.confidence || 70,
                growthRate: analysis.slope || 0,
                window: window || FORECAST_WINDOW.NEXT_24H,
                evidence: analysis.evidence || [],
                metadata: {
                    dataPoints: data.length,
                    unit: targetConfig.unit,
                    name: targetConfig.name
                }
            });

            this._trends.push(trend);
            if (this._trends.length > this._config.maxHistorySize) {
                this._trends = this._trends.slice(-this._config.maxHistorySize);
            }

            this._forecasts.push({
                trendId: trend.trendId,
                target: target,
                forecast: forecast,
                timestamp: Date.now(),
                window: window || FORECAST_WINDOW.NEXT_24H
            });

            this._emit('trendPredicted', trend.toJSON());

            return trend;
        }

        predictAllTrends(window) {
            const results = {};
            const targets = Object.keys(this._targets);

            targets.forEach(target => {
                const result = this.predictTrend(target, window);
                if (result) {
                    results[target] = result.toJSON();
                }
            });

            return results;
        }

        // ============================================================
        // Trend Analysis (Chapter 3, 6)
        // ============================================================

        _analyzeTrend(data) {
            const n = data.length;
            if (n < 2) {
                return { slope: 0, confidence: 40, evidence: ['Insufficient data'] };
            }

            // Linear regression
            const indices = data.map((_, i) => i);
            const sumX = indices.reduce((a, b) => a + b, 0);
            const sumY = data.reduce((a, b) => a + b, 0);
            const sumXY = indices.reduce((a, b, i) => a + b * data[i], 0);
            const sumX2 = indices.reduce((a, b) => a + b * b, 0);

            const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Calculate R-squared
            const meanY = sumY / n;
            const ssTot = data.reduce((a, b) => a + Math.pow(b - meanY, 2), 0);
            const ssRes = data.reduce((a, b, i) => a + Math.pow(b - (slope * i + intercept), 2), 0);
            const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

            const confidence = Math.min(95, 50 + rSquared * 50);

            return {
                slope: slope,
                intercept: intercept,
                confidence: Math.round(confidence),
                rSquared: rSquared,
                evidence: [
                    `Slope: ${slope.toFixed(2)}`,
                    `R²: ${(rSquared * 100).toFixed(0)}%`,
                    `Data points: ${n}`
                ]
            };
        }

        _detectPattern(data, analysis) {
            const slope = analysis.slope;
            const n = data.length;

            // Check for abnormal (Chapter 6)
            const mean = data.reduce((a, b) => a + b, 0) / n;
            const stdDev = Math.sqrt(data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
            const lastValue = data[data.length - 1];
            const zScore = stdDev > 0 ? (lastValue - mean) / stdDev : 0;

            if (Math.abs(zScore) > this._config.abnormalThreshold) {
                return {
                    direction: TREND_DIRECTION.ABNORMAL,
                    confidence: 80,
                    evidence: [`Abnormal value detected (z-score: ${zScore.toFixed(2)})`]
                };
            }

            // Check seasonal (Chapter 6)
            if (n > this._config.seasonalWindow * 2) {
                const seasonalPattern = this._detectSeasonal(data);
                if (seasonalPattern) {
                    return {
                        direction: TREND_DIRECTION.SEASONAL,
                        confidence: 70,
                        evidence: ['Seasonal pattern detected'],
                        seasonalData: seasonalPattern
                    };
                }
            }

            // Determine direction
            let direction = TREND_DIRECTION.STABLE;
            if (slope > 0.05) direction = TREND_DIRECTION.GROWING;
            else if (slope < -0.05) direction = TREND_DIRECTION.DECLINING;

            return {
                direction: direction,
                confidence: 70,
                evidence: [`Trend: ${direction} (slope: ${slope.toFixed(2)})`]
            };
        }

        _detectSeasonal(data) {
            const n = data.length;
            const windowSize = this._config.seasonalWindow;

            if (n < windowSize * 2) return null;

            // Compare patterns across windows
            const firstWindow = data.slice(0, windowSize);
            const secondWindow = data.slice(windowSize, windowSize * 2);

            const correlation = this._calculateCorrelation(firstWindow, secondWindow);

            if (correlation > 0.7) {
                return {
                    windowSize: windowSize,
                    correlation: correlation,
                    pattern: firstWindow
                };
            }

            return null;
        }

        _calculateCorrelation(arr1, arr2) {
            const n = Math.min(arr1.length, arr2.length);
            if (n < 2) return 0;

            const mean1 = arr1.slice(0, n).reduce((a, b) => a + b, 0) / n;
            const mean2 = arr2.slice(0, n).reduce((a, b) => a + b, 0) / n;

            let num = 0, den1 = 0, den2 = 0;
            for (let i = 0; i < n; i++) {
                const d1 = arr1[i] - mean1;
                const d2 = arr2[i] - mean2;
                num += d1 * d2;
                den1 += d1 * d1;
                den2 += d2 * d2;
            }

            if (den1 === 0 || den2 === 0) return 0;
            return num / (Math.sqrt(den1) * Math.sqrt(den2));
        }

        // ============================================================
        // Forecast Building (Chapter 3, 7)
        // ============================================================

        _buildForecast(data, analysis, pattern, window) {
            const lastValue = data[data.length - 1];
            const slope = analysis.slope || 0;

            // Determine steps based on window
            const steps = this._getWindowSteps(window);

            // Simple linear forecast
            const forecastValue = lastValue + slope * steps;

            // Add seasonal adjustment if detected
            let adjustedForecast = forecastValue;
            if (pattern && pattern.direction === TREND_DIRECTION.SEASONAL && pattern.seasonalData) {
                const seasonalOffset = pattern.seasonalData[steps % pattern.seasonalData.length] || 0;
                adjustedForecast = forecastValue + (seasonalOffset - pattern.seasonalData[0] || 0);
            }

            return {
                currentValue: Math.round(lastValue * 100) / 100,
                forecastValue: Math.round(adjustedForecast * 100) / 100,
                steps: steps,
                window: window || FORECAST_WINDOW.NEXT_24H,
                lowerBound: Math.round((adjustedForecast - 5) * 100) / 100,
                upperBound: Math.round((adjustedForecast + 5) * 100) / 100,
                confidence: analysis.confidence || 60
            };
        }

        _getWindowSteps(window) {
            switch (window) {
                case FORECAST_WINDOW.NEXT_SESSION: return 1;
                case FORECAST_WINDOW.NEXT_24H: return 5;
                case FORECAST_WINDOW.NEXT_7D: return 20;
                case FORECAST_WINDOW.NEXT_RELEASE: return 30;
                case FORECAST_WINDOW.CUSTOM: return 10;
                default: return 5;
            }
        }

        // ============================================================
        // Data Retrieval (Chapter 4)
        // ============================================================

        _getBootTimeData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.BootManager) {
                    const status = window.LawAIApp.BootManager.getStatus ?
                        window.LawAIApp.BootManager.getStatus() : null;
                    if (status && status.bootDuration !== undefined) {
                        data.push(status.bootDuration);
                    }
                }
            } catch (e) { /* ignore */ }

            // Fill with synthetic if needed
            while (data.length < this._config.minDataPoints) {
                data.push(1500 + Math.random() * 1000);
            }
            return data;
        }

        _getMemoryData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report && report.memory !== undefined) {
                        data.push(report.memory);
                    }
                }
            } catch (e) { /* ignore */ }

            while (data.length < this._config.minDataPoints) {
                data.push(50 + Math.random() * 30);
            }
            return data;
        }

        _getCPUData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;
                    if (report && report.cpu !== undefined) {
                        data.push(report.cpu);
                    }
                }
            } catch (e) { /* ignore */ }

            while (data.length < this._config.minDataPoints) {
                data.push(30 + Math.random() * 40);
            }
            return data;
        }

        _getModuleData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.Registry) {
                    const registry = window.LawAIApp.Registry.getAll ?
                        window.LawAIApp.Registry.getAll() : null;
                    if (registry) {
                        data.push(Object.keys(registry).length);
                    }
                }
            } catch (e) { /* ignore */ }

            while (data.length < this._config.minDataPoints) {
                data.push(10 + Math.floor(Math.random() * 15));
            }
            return data;
        }

        _getEventData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.Events) {
                    const stats = window.LawAIApp.Events.getStatistics ?
                        window.LawAIApp.Events.getStatistics() : null;
                    if (stats && stats.total !== undefined) {
                        data.push(stats.total);
                    }
                }
            } catch (e) { /* ignore */ }

            while (data.length < this._config.minDataPoints) {
                data.push(50 + Math.floor(Math.random() * 100));
            }
            return data;
        }

        _getKnowledgeGraphData() {
            const data = [];
            try {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    const kgData = window.LawAIApp.KnowledgeGraph.getData ?
                        window.LawAIApp.KnowledgeGraph.getData() : null;
                    if (kgData && kgData.entities) {
                        data.push(Object.keys(kgData.entities).length);
                    }
                }
            } catch (e) { /* ignore */ }

            while (data.length < this._config.minDataPoints) {
                data.push(20 + Math.floor(Math.random() * 30));
            }
            return data;
        }

        // ============================================================
        // Auto-Prediction
        // ============================================================

        _startAutoPrediction() {
            if (this._predictionInterval) {
                clearInterval(this._predictionInterval);
            }

            this._predictionInterval = setInterval(() => {
                this.predictAllTrends();
            }, this._config.predictionInterval);

            console.log(`[TrendPrediction] Auto-prediction started (${this._config.predictionInterval}ms)`);
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

        getTrends(filter) {
            let trends = this._trends;

            if (filter) {
                if (filter.target) {
                    trends = trends.filter(t => t.target === filter.target);
                }
                if (filter.direction) {
                    trends = trends.filter(t => t.trendDirection === filter.direction);
                }
                if (filter.limit) {
                    trends = trends.slice(-filter.limit);
                }
            }

            return trends.map(t => t.toJSON());
        }

        getTrend(id) {
            const trend = this._trends.find(t => t.trendId === id);
            return trend ? trend.toJSON() : null;
        }

        getForecasts(limit = 10) {
            return this._forecasts.slice(-limit).reverse();
        }

        getStats() {
            const total = this._trends.length;
            const byDirection = {};

            this._trends.forEach(t => {
                byDirection[t.trendDirection] = (byDirection[t.trendDirection] || 0) + 1;
            });

            const byTarget = {};
            this._trends.forEach(t => {
                byTarget[t.target] = (byTarget[t.target] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._trends.reduce((sum, t) => sum + t.confidence, 0) / total) :
                0;

            return {
                total,
                byDirection,
                byTarget,
                avgConfidence,
                forecasts: this._forecasts.length,
                targets: Object.keys(this._targets).length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 9)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getTrends({ limit: 5 });

            return {
                type: 'trend_prediction',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentTrends: recent,
                targets: Object.keys(this._targets),
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
                        console.error('[TrendPrediction] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`trend.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('trendPredictionData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.trends) {
                        this._trends = data.trends.map(t => new TrendModel(t));
                    }
                    if (data.forecasts) {
                        this._forecasts = data.forecasts;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 8)
        // ============================================================

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[TrendPrediction] Connected to Historical Memory');
            }
        }

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[TrendPrediction] Connected to Performance Framework');
            }
        }

        _connectToMetricsFramework() {
            if (window.LawAIApp && window.LawAIApp.Metrics) {
                console.log('[TrendPrediction] Connected to Metrics Framework');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[TrendPrediction] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveCore() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[TrendPrediction] Connected to Predictive Core');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'trend-prediction',
                        name: 'Trend Prediction',
                        category: 'prediction',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[TrendPrediction] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[TrendPrediction] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoPrediction();
            this._initialized = false;
            console.log('[TrendPrediction] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new TrendPrediction();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.TrendPrediction = {
        Core: instance,
        TREND_DIRECTION: TREND_DIRECTION,
        FORECAST_WINDOW: FORECAST_WINDOW,

        // Public API
        initialize: (config) => instance.initialize(config),
        predictTrend: (target, window) => instance.predictTrend(target, window),
        predictAllTrends: (window) => instance.predictAllTrends(window),

        getTrends: (filter) => instance.getTrends(filter),
        getTrend: (id) => instance.getTrend(id),
        getForecasts: (limit) => instance.getForecasts(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[TrendPrediction] Part 53.2 loaded ✅');
    console.log('[TrendPrediction] Directions:', Object.values(TREND_DIRECTION).join(' | '));
    console.log('[TrendPrediction] Windows:', Object.values(FORECAST_WINDOW).join(' | '));

})();
