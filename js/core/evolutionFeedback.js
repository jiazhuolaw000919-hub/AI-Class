// ============================================================
// evolutionFeedback.js
// Part 54.6 — Evolution Feedback Loop
// Version: v5.4.6
// Module: Runtime Evolution System
// File: js/core/evolutionFeedback.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.EvolutionFeedback) {
        console.warn('[EvolutionFeedback] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Outcome Classification (Chapter 6)
    // ============================================================
    const OUTCOME = {
        SUCCESS: 'success',
        PARTIAL_SUCCESS: 'partial_success',
        NO_IMPACT: 'no_impact',
        NEGATIVE_IMPACT: 'negative_impact',
        FAILED: 'failed'
    };

    // ============================================================
    // Learning Signal Types
    // ============================================================
    const LEARNING_SIGNAL = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        NEUTRAL: 'neutral'
    };

    // ============================================================
    // Evolution Outcome Model (Chapter 5)
    // ============================================================
    class EvolutionOutcome {
        constructor(config) {
            this.outcomeId = config.outcomeId || this._generateId();
            this.timestamp = Date.now();
            this.evolutionId = config.evolutionId || null;
            this.proposalId = config.proposalId || null;
            this.expectedImpact = config.expectedImpact || 0;
            this.actualImpact = config.actualImpact || 0;
            this.result = config.result || OUTCOME.UNKNOWN;
            this.difference = config.difference || 0;
            this.learningSignal = config.learningSignal || LEARNING_SIGNAL.NEUTRAL;
            this.metrics = config.metrics || {};
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `evoout_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        getDelta() {
            return this.actualImpact - this.expectedImpact;
        }

        isPositive() {
            return this.result === OUTCOME.SUCCESS || this.getDelta() > 0;
        }

        toJSON() {
            return {
                outcomeId: this.outcomeId,
                timestamp: this.timestamp,
                evolutionId: this.evolutionId,
                proposalId: this.proposalId,
                expectedImpact: this.expectedImpact,
                actualImpact: this.actualImpact,
                result: this.result,
                difference: this.difference,
                delta: this.getDelta(),
                learningSignal: this.learningSignal,
                metrics: this.metrics,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Learning Pattern (Chapter 8)
    // ============================================================
    class EvolutionLearningPattern {
        constructor(config) {
            this.patternId = config.patternId || this._generateId();
            this.timestamp = Date.now();
            this.type = config.type || 'success';
            this.category = config.category || 'performance';
            this.description = config.description || '';
            this.confidence = config.confidence || 0;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `evopat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                patternId: this.patternId,
                timestamp: this.timestamp,
                type: this.type,
                category: this.category,
                description: this.description,
                confidence: this.confidence,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Feedback Loop Core (Chapter 1-4)
    // ============================================================
    class EvolutionFeedback {
        constructor() {
            this._outcomes = [];
            this._patterns = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 500,
                minSamplesForPattern: 3,
                successThreshold: 10,
                partialThreshold: 0,
                negativeThreshold: -10,
                enableAutoLearning: true,
                confidenceAdjustmentRate: 0.05
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[EvolutionFeedback] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[EvolutionFeedback] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToEvolutionIntelligence();
            this._connectToEvolutionGovernance();
            this._connectToCapabilityGrowth();
            this._connectToModuleEvolution();
            this._connectToPredictiveRuntime();
            this._connectToDecisionIntelligence();
            this._connectToHistoricalMemory();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[EvolutionFeedback] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Record and Evaluate (Chapter 3-4)
        // ============================================================

        record(evolutionId, proposalId, expectedImpact, actualImpact, metrics) {
            console.log(`[EvolutionFeedback] Recording outcome for: ${evolutionId}`);

            // Determine outcome (Chapter 6)
            const result = this._determineOutcome(expectedImpact, actualImpact);

            // Calculate difference
            const difference = actualImpact - expectedImpact;

            // Determine learning signal
            const learningSignal = this._determineLearningSignal(result, difference);

            // Create outcome
            const outcome = new EvolutionOutcome({
                evolutionId: evolutionId,
                proposalId: proposalId,
                expectedImpact: expectedImpact,
                actualImpact: actualImpact,
                result: result,
                difference: difference,
                learningSignal: learningSignal,
                metrics: metrics || {},
                metadata: {
                    source: 'evolution_feedback',
                    recordedAt: Date.now()
                }
            });

            this._outcomes.push(outcome);
            if (this._outcomes.length > this._config.maxHistorySize) {
                this._outcomes = this._outcomes.slice(-this._config.maxHistorySize);
            }

            // Generate learning pattern (Chapter 8)
            if (this._config.enableAutoLearning) {
                const pattern = this._generatePattern(outcome);
                if (pattern) {
                    this._patterns.push(pattern);
                    if (this._patterns.length > this._config.maxHistorySize) {
                        this._patterns = this._patterns.slice(-this._config.maxHistorySize);
                    }
                }
            }

            // Update memory (Chapter 9)
            this._updateMemory(outcome);

            this._emit('outcomeRecorded', outcome.toJSON());

            return outcome;
        }

        // ============================================================
        // Outcome Classification (Chapter 6)
        // ============================================================

        _determineOutcome(expected, actual) {
            if (expected === null || actual === null) return OUTCOME.UNKNOWN;

            const delta = actual - expected;

            if (delta >= this._config.successThreshold) return OUTCOME.SUCCESS;
            if (delta >= this._config.partialThreshold) return OUTCOME.PARTIAL_SUCCESS;
            if (delta >= this._config.negativeThreshold) return OUTCOME.NO_IMPACT;
            return OUTCOME.NEGATIVE_IMPACT;
        }

        _determineLearningSignal(result, difference) {
            if (result === OUTCOME.SUCCESS || difference > 10) {
                return LEARNING_SIGNAL.POSITIVE;
            }
            if (result === OUTCOME.FAILED || result === OUTCOME.NEGATIVE_IMPACT || difference < -10) {
                return LEARNING_SIGNAL.NEGATIVE;
            }
            return LEARNING_SIGNAL.NEUTRAL;
        }

        // ============================================================
        // Impact Evaluation (Chapter 7)
        // ============================================================

        evaluateImpact(beforeData, afterData, metrics) {
            const results = {};

            metrics.forEach(metric => {
                const before = beforeData[metric] || 0;
                const after = afterData[metric] || 0;
                const delta = after - before;
                const percentChange = before > 0 ? (delta / before) * 100 : 0;

                results[metric] = {
                    before: before,
                    after: after,
                    delta: delta,
                    percentChange: Math.round(percentChange * 10) / 10,
                    improved: delta > 0
                };
            });

            return results;
        }

        // ============================================================
        // Pattern Generation (Chapter 8)
        // ============================================================

        _generatePattern(outcome) {
            const type = outcome.isPositive() ? 'success' : 'failure';

            // Find similar patterns
            const similar = this._patterns.filter(p => 
                p.type === type &&
                Math.abs(p.confidence - outcome.confidence) < 20
            );

            const confidence = Math.min(80 + similar.length * 3, 95);

            return new EvolutionLearningPattern({
                type: type,
                category: this._determineCategory(outcome),
                description: outcome.isPositive() ? 
                    `Successful evolution: ${outcome.evolutionId}` :
                    `Failed evolution: ${outcome.evolutionId}`,
                confidence: confidence,
                evidence: [
                    `Expected: ${outcome.expectedImpact}`,
                    `Actual: ${outcome.actualImpact}`,
                    `Delta: ${outcome.getDelta()}`
                ],
                metadata: {
                    outcomeId: outcome.outcomeId,
                    evolutionId: outcome.evolutionId,
                    proposalId: outcome.proposalId
                }
            });
        }

        _determineCategory(outcome) {
            const metrics = outcome.metrics || {};
            if (metrics.performance) return 'performance';
            if (metrics.capability) return 'capability';
            if (metrics.stability) return 'stability';
            if (metrics.resource) return 'resource';
            return 'general';
        }

        // ============================================================
        // Confidence Improvement (Chapter 10)
        // ============================================================

        getConfidenceImprovement(target, window) {
            const outcomes = this._outcomes.filter(o => 
                o.proposalId === target || target === 'all'
            );

            if (outcomes.length < 2) {
                return { improvement: 0, confidence: 30 };
            }

            const recent = outcomes.slice(-(window || 5));
            const first = recent[0];
            const last = recent[recent.length - 1];

            const improvement = (last.expectedImpact - first.expectedImpact) || 0;
            const confidence = Math.min(80, 40 + recent.length * 4);

            return {
                improvement: Math.round(improvement * 10) / 10,
                confidence: Math.round(confidence),
                samples: recent.length,
                trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
            };
        }

        // ============================================================
        // Memory Management (Chapter 9)
        // ============================================================

        _updateMemory(outcome) {
            // Update Historical Memory
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                try {
                    window.LawAIApp.HistoricalMemory.remember({
                        type: 'evolution_outcome',
                        source: 'evolution_feedback',
                        data: {
                            evolutionId: outcome.evolutionId,
                            proposalId: outcome.proposalId,
                            result: outcome.result,
                            delta: outcome.getDelta()
                        },
                        outcome: outcome.isPositive() ? 'success' : 'failure',
                        confidence: outcome.isPositive() ? 80 : 60,
                        tags: ['evolution', 'feedback']
                    });
                } catch (e) { /* ignore */ }
            }

            // Update Evolution Intelligence
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                try {
                    // Intelligence will learn from this
                } catch (e) { /* ignore */ }
            }
        }

        // ============================================================
        // Compare (Chapter 4)
        // ============================================================

        compare(evolutionId, expectedImpact, actualImpact) {
            const outcome = this._outcomes.find(o => o.evolutionId === evolutionId);
            if (!outcome) {
                console.warn(`[EvolutionFeedback] Outcome not found: ${evolutionId}`);
                return null;
            }

            return {
                evolutionId: evolutionId,
                expectedImpact: expectedImpact || outcome.expectedImpact,
                actualImpact: actualImpact || outcome.actualImpact,
                delta: (actualImpact || outcome.actualImpact) - (expectedImpact || outcome.expectedImpact),
                result: this._determineOutcome(
                    expectedImpact || outcome.expectedImpact,
                    actualImpact || outcome.actualImpact
                ),
                timestamp: Date.now()
            };
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getHistory(filter) {
            let outcomes = this._outcomes;

            if (filter) {
                if (filter.result) {
                    outcomes = outcomes.filter(o => o.result === filter.result);
                }
                if (filter.learningSignal) {
                    outcomes = outcomes.filter(o => o.learningSignal === filter.learningSignal);
                }
                if (filter.evolutionId) {
                    outcomes = outcomes.filter(o => o.evolutionId === filter.evolutionId);
                }
                if (filter.limit) {
                    outcomes = outcomes.slice(-filter.limit);
                }
            }

            return outcomes.map(o => o.toJSON());
        }

        getPatterns(filter) {
            let patterns = this._patterns;

            if (filter) {
                if (filter.type) {
                    patterns = patterns.filter(p => p.type === filter.type);
                }
                if (filter.category) {
                    patterns = patterns.filter(p => p.category === filter.category);
                }
                if (filter.minConfidence) {
                    patterns = patterns.filter(p => p.confidence >= filter.minConfidence);
                }
                if (filter.limit) {
                    patterns = patterns.slice(-filter.limit);
                }
            }

            return patterns.map(p => p.toJSON());
        }

        getAccuracy() {
            const total = this._outcomes.length;
            if (total === 0) return 0;

            const successful = this._outcomes.filter(o => 
                o.result === OUTCOME.SUCCESS || o.result === OUTCOME.PARTIAL_SUCCESS
            ).length;

            return Math.round((successful / total) * 100);
        }

        getStats() {
            const total = this._outcomes.length;
            const success = this._outcomes.filter(o => o.result === OUTCOME.SUCCESS).length;
            const partial = this._outcomes.filter(o => o.result === OUTCOME.PARTIAL_SUCCESS).length;
            const noImpact = this._outcomes.filter(o => o.result === OUTCOME.NO_IMPACT).length;
            const negative = this._outcomes.filter(o => o.result === OUTCOME.NEGATIVE_IMPACT).length;
            const failed = this._outcomes.filter(o => o.result === OUTCOME.FAILED).length;

            const positive = this._outcomes.filter(o => o.learningSignal === LEARNING_SIGNAL.POSITIVE).length;
            const negativeSignal = this._outcomes.filter(o => o.learningSignal === LEARNING_SIGNAL.NEGATIVE).length;
            const neutral = this._outcomes.filter(o => o.learningSignal === LEARNING_SIGNAL.NEUTRAL).length;

            const avgDelta = total > 0 ?
                Math.round(this._outcomes.reduce((sum, o) => sum + o.getDelta(), 0) / total * 10) / 10 :
                0;

            const accuracy = this.getAccuracy();

            return {
                total,
                success,
                partial,
                noImpact,
                negative,
                failed,
                positive,
                negativeSignal,
                neutral,
                avgDelta,
                accuracy,
                patterns: this._patterns.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getHistory({ limit: 5 });
            const patterns = this.getPatterns({ limit: 5 });

            return {
                type: 'evolution_feedback',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentOutcomes: recent,
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
                        console.error('[EvolutionFeedback] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`evofb.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('evolutionFeedbackData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.outcomes) {
                        this._outcomes = data.outcomes.map(o => new EvolutionOutcome(o));
                    }
                    if (data.patterns) {
                        this._patterns = data.patterns.map(p => new EvolutionLearningPattern(p));
                    }
                    if (data.history) {
                        this._history = data.history;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToEvolutionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[EvolutionFeedback] Connected to Evolution Intelligence');
            }
        }

        _connectToEvolutionGovernance() {
            if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                console.log('[EvolutionFeedback] Connected to Evolution Governance');
            }
        }

        _connectToCapabilityGrowth() {
            if (window.LawAIApp && window.LawAIApp.CapabilityGrowth) {
                console.log('[EvolutionFeedback] Connected to Capability Growth');
            }
        }

        _connectToModuleEvolution() {
            if (window.LawAIApp && window.LawAIApp.ModuleEvolution) {
                console.log('[EvolutionFeedback] Connected to Module Evolution');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveRuntime) {
                console.log('[EvolutionFeedback] Connected to Predictive Runtime');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[EvolutionFeedback] Connected to Decision Intelligence');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[EvolutionFeedback] Connected to Historical Memory');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'evolution-feedback',
                        name: 'Evolution Feedback',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[EvolutionFeedback] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[EvolutionFeedback] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[EvolutionFeedback] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new EvolutionFeedback();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.EvolutionFeedback = {
        Core: instance,
        OUTCOME: OUTCOME,
        LEARNING_SIGNAL: LEARNING_SIGNAL,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        record: (evolutionId, proposalId, expectedImpact, actualImpact, metrics) => 
            instance.record(evolutionId, proposalId, expectedImpact, actualImpact, metrics),
        evaluateImpact: (before, after, metrics) => instance.evaluateImpact(before, after, metrics),
        compare: (evolutionId, expectedImpact, actualImpact) => 
            instance.compare(evolutionId, expectedImpact, actualImpact),

        getHistory: (filter) => instance.getHistory(filter),
        getPatterns: (filter) => instance.getPatterns(filter),
        getAccuracy: () => instance.getAccuracy(),
        getConfidenceImprovement: (target, window) => instance.getConfidenceImprovement(target, window),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[EvolutionFeedback] Part 54.6 loaded ✅');
    console.log('[EvolutionFeedback] Outcomes:', Object.values(OUTCOME).join(' | '));

})();
