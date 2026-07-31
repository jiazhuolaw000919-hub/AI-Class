// ============================================================
// decisionIntelligence.js
// Part 51.1 — Decision Intelligence Layer
// Version: v5.1
// Module: Runtime Cognitive Layer
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
        console.warn('[DecisionIntelligence] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Intelligence Context (Chapter 2)
    // ============================================================
    class IntelligenceContext {
        constructor(config) {
            this.contextId = config.contextId || this._generateId();
            this.timestamp = Date.now();
            this.source = config.source || 'runtime';
            this.signal = config.signal || null;
            this.runtimeState = config.runtimeState || null;
            this.history = config.history || [];
            this.knowledge = config.knowledge || null;
            this.performance = config.performance || null;
            this.governance = config.governance || null;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                contextId: this.contextId,
                timestamp: this.timestamp,
                source: this.source,
                signal: this.signal,
                runtimeState: this.runtimeState,
                history: this.history,
                knowledge: this.knowledge,
                performance: this.performance,
                governance: this.governance,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Decision Intelligence (Chapter 1-3)
    // ============================================================
    class DecisionIntelligence {
        constructor() {
            this._contexts = [];
            this._decisions = [];
            this._insights = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxContextHistory: 100,
                minConfidenceThreshold: 60,
                enablePatternRecognition: true,
                enableExplanationGeneration: true,
                maxRecommendations: 5
            };
            this._patterns = [];
            this._reasoningCache = {};
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[DecisionIntelligence] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[DecisionIntelligence] Initializing...');

            // Connect to modules (Chapter 4)
            this._connectToAutonomousLayer();
            this._connectToKnowledgeGraph();
            this._connectToCognitiveEngine();
            this._connectToPerformanceFramework();
            this._connectToRuntimeHistory();
            this._connectToGovernance();

            // Register with Explorer
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[DecisionIntelligence] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Analyze & Decide (Chapter 3)
        // ============================================================

        analyze(signal, contextData) {
            console.log(`[DecisionIntelligence] Analyzing signal: ${signal}`);

            // Build intelligence context
            const context = this._buildContext(signal, contextData);

            // Store context
            this._contexts.push(context);
            if (this._contexts.length > this._config.maxContextHistory) {
                this._contexts.shift();
            }

            // Pattern Recognition
            const patterns = this._recognizePatterns(context);

            // Reasoning
            const reasoning = this._reason(context, patterns);

            // Confidence Evaluation
            const confidence = this._evaluateConfidence(context, reasoning);

            // Generate Explanation (Chapter 3)
            const explanation = this._generateExplanation(context, reasoning, confidence);

            // Build intelligence decision
            const decision = {
                id: `di_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                timestamp: Date.now(),
                signal: signal,
                context: context.toJSON(),
                patterns: patterns,
                reasoning: reasoning,
                confidence: confidence,
                explanation: explanation,
                recommendations: this._generateRecommendations(context, reasoning),
                status: 'ANALYZED'
            };

            this._decisions.push(decision);

            // Extract insights
            const insights = this._extractInsights(decision);
            this._insights.push(...insights);

            // Emit events
            this._emit('decisionAnalyzed', decision);

            console.log(`[DecisionIntelligence] Analysis complete: ${decision.id}`);
            return decision;
        },

        // ============================================================
        // Pattern Recognition (Chapter 3)
        // ============================================================

        _recognizePatterns(context) {
            const patterns = [];
            const signal = context.signal || {};
            const state = context.runtimeState || {};

            // Pattern 1: Performance Degradation
            if (state.cpu && state.cpu > 80) {
                patterns.push({
                    type: 'performance_degradation',
                    confidence: Math.min(100, (state.cpu - 80) * 5),
                    details: `CPU usage at ${state.cpu}%`,
                    severity: state.cpu > 90 ? 'HIGH' : 'MEDIUM'
                });
            }

            // Pattern 2: Memory Pressure
            if (state.memory && state.memory > 85) {
                patterns.push({
                    type: 'memory_pressure',
                    confidence: Math.min(100, (state.memory - 85) * 6.67),
                    details: `Memory usage at ${state.memory}%`,
                    severity: state.memory > 90 ? 'HIGH' : 'MEDIUM'
                });
            }

            // Pattern 3: Error Spike
            if (state.errorCount && state.errorCount > 10) {
                patterns.push({
                    type: 'error_spike',
                    confidence: Math.min(100, state.errorCount * 2),
                    details: `${state.errorCount} errors detected`,
                    severity: state.errorCount > 50 ? 'HIGH' : 'MEDIUM'
                });
            }

            // Pattern 4: Historical Recurrence
            const history = context.history || [];
            if (history.length > 0) {
                const similar = history.filter(h => 
                    h.signal === context.signal?.type
                );
                if (similar.length > 2) {
                    patterns.push({
                        type: 'recurring_issue',
                        confidence: Math.min(100, similar.length * 20),
                        details: `Occurred ${similar.length} times previously`,
                        severity: similar.length > 5 ? 'HIGH' : 'MEDIUM'
                    });
                }
            }

            return patterns;
        },

        // ============================================================
        // Reasoning Engine (Chapter 2-3)
        // ============================================================

        _reason(context, patterns) {
            const reasoning = {
                analysis: [],
                conclusions: [],
                confidenceFactors: []
            };

            // Analyze patterns
            patterns.forEach(pattern => {
                reasoning.analysis.push({
                    pattern: pattern.type,
                    observation: pattern.details,
                    severity: pattern.severity
                });

                // Add confidence factor
                reasoning.confidenceFactors.push({
                    factor: pattern.type,
                    impact: pattern.confidence / 100,
                    weight: 0.3
                });
            });

            // Knowledge integration
            if (context.knowledge) {
                const relevant = this._findRelevantKnowledge(context);
                if (relevant.length > 0) {
                    reasoning.analysis.push({
                        pattern: 'knowledge_match',
                        observation: `Found ${relevant.length} relevant knowledge entries`,
                        severity: 'LOW'
                    });
                    reasoning.confidenceFactors.push({
                        factor: 'knowledge_support',
                        impact: Math.min(1, relevant.length * 0.1),
                        weight: 0.25
                    });
                }
            }

            // Performance context
            if (context.performance) {
                const perfIssues = this._analyzePerformance(context.performance);
                if (perfIssues.length > 0) {
                    reasoning.analysis.push({
                        pattern: 'performance_insight',
                        observation: perfIssues.join('; '),
                        severity: 'MEDIUM'
                    });
                }
            }

            // Draw conclusions
            const highSeverity = patterns.filter(p => p.severity === 'HIGH');
            const mediumSeverity = patterns.filter(p => p.severity === 'MEDIUM');

            if (highSeverity.length > 0) {
                reasoning.conclusions.push('Critical issues detected requiring immediate attention');
            } else if (mediumSeverity.length > 0) {
                reasoning.conclusions.push('Medium severity issues detected, monitoring recommended');
            } else if (patterns.length === 0) {
                reasoning.conclusions.push('No significant patterns detected, system appears stable');
            } else {
                reasoning.conclusions.push('Minor issues detected, routine maintenance recommended');
            }

            // Recommendation direction
            if (highSeverity.length > 0) {
                reasoning.recommendationDirection = 'INTERVENTION';
            } else if (mediumSeverity.length > 1) {
                reasoning.recommendationDirection = 'ACTION';
            } else if (patterns.length > 0) {
                reasoning.recommendationDirection = 'MONITOR';
            } else {
                reasoning.recommendationDirection = 'NO_ACTION';
            }

            // Overall confidence
            const totalConfidence = reasoning.confidenceFactors.reduce((sum, f) => {
                return sum + (f.impact * f.weight);
            }, 0);

            reasoning.overallConfidence = Math.round(totalConfidence * 100);

            return reasoning;
        },

        // ============================================================
        // Confidence Evaluation (Chapter 3)
        // ============================================================

        _evaluateConfidence(context, reasoning) {
            const factors = [];
            let totalScore = 0;

            // Factor 1: Data Completeness
            const completeness = this._evaluateCompleteness(context);
            factors.push({ factor: 'data_completeness', score: completeness, weight: 0.25 });
            totalScore += completeness * 0.25;

            // Factor 2: Signal Consistency
            const consistency = this._evaluateConsistency(context);
            factors.push({ factor: 'signal_consistency', score: consistency, weight: 0.2 });
            totalScore += consistency * 0.2;

            // Factor 3: Pattern Confidence
            const patternConfidence = reasoning.confidenceFactors.reduce((sum, f) => {
                return sum + (f.impact * f.weight * 100);
            }, 0);
            const patternScore = Math.min(100, patternConfidence / reasoning.confidenceFactors.length || 0);
            factors.push({ factor: 'pattern_confidence', score: patternScore, weight: 0.3 });
            totalScore += patternScore * 0.3;

            // Factor 4: Historical Accuracy
            const historicalScore = this._evaluateHistoricalAccuracy(context);
            factors.push({ factor: 'historical_accuracy', score: historicalScore, weight: 0.25 });
            totalScore += historicalScore * 0.25;

            const finalScore = Math.round(totalScore);

            return {
                score: finalScore,
                level: finalScore >= 80 ? 'HIGH' : finalScore >= 60 ? 'MEDIUM' : 'LOW',
                factors: factors,
                interpretation: finalScore >= 80 ? 'High confidence - proceed with action' :
                              finalScore >= 60 ? 'Medium confidence - review recommended' :
                              'Low confidence - manual review required'
            };
        },

        _evaluateCompleteness(context) {
            let score = 0;
            if (context.signal) score += 25;
            if (context.runtimeState) score += 25;
            if (context.knowledge) score += 20;
            if (context.performance) score += 15;
            if (context.history && context.history.length > 0) score += 15;
            return Math.min(score, 100);
        },

        _evaluateConsistency(context) {
            // Check consistency between signal and state
            let score = 70;
            const signal = context.signal || {};
            const state = context.runtimeState || {};

            if (signal.type === 'performance' && state.cpu > 80) {
                score += 10;
            }
            if (signal.type === 'error' && state.errorCount > 0) {
                score += 10;
            }
            if (signal.severity && state.status === 'critical') {
                score += 10;
            }

            return Math.min(score, 100);
        },

        _evaluateHistoricalAccuracy(context) {
            const history = context.history || [];
            if (history.length === 0) return 50;

            const correct = history.filter(h => h.outcome === 'success').length;
            return Math.round((correct / history.length) * 100);
        },

        // ============================================================
        // Explanation Generation (Chapter 3)
        // ============================================================

        _generateExplanation(context, reasoning, confidence) {
            const parts = [];

            // What happened
            parts.push(`Signal: ${context.signal?.type || 'unknown'}`);

            // Why it happened
            if (reasoning.analysis.length > 0) {
                const topPatterns = reasoning.analysis.slice(0, 2);
                parts.push(`Patterns detected: ${topPatterns.map(p => p.observation).join('; ')}`);
            }

            // What it means
            parts.push(`Conclusion: ${reasoning.conclusions[0] || 'No conclusion'}`);

            // How confident
            parts.push(`Confidence: ${confidence.level} (${confidence.score}%)`);

            // Recommended action
            const direction = reasoning.recommendationDirection || 'NO_ACTION';
            const actions = {
                'INTERVENTION': '⚠️ Immediate intervention required',
                'ACTION': '⚡ Action recommended',
                'MONITOR': '👁️ Monitoring recommended',
                'NO_ACTION': '✅ No action required'
            };
            parts.push(`Recommendation: ${actions[direction] || 'Review required'}`);

            return {
                summary: parts.join(' → '),
                details: parts,
                confidenceLevel: confidence.level,
                recommendationDirection: direction
            };
        },

        // ============================================================
        // Recommendations (Chapter 3)
        // ============================================================

        _generateRecommendations(context, reasoning) {
            const recommendations = [];
            const direction = reasoning.recommendationDirection;

            if (direction === 'INTERVENTION') {
                recommendations.push({
                    priority: 'CRITICAL',
                    action: 'Immediate intervention required',
                    details: 'System critical issues detected, escalate to admin',
                    confidence: reasoning.overallConfidence || 80
                });
            }

            if (direction === 'ACTION' || direction === 'INTERVENTION') {
                // Check specific issues
                const patterns = context.signal?.patterns || [];
                if (patterns.includes('performance')) {
                    recommendations.push({
                        priority: 'HIGH',
                        action: 'Optimize performance',
                        details: 'Performance degradation detected, consider scaling',
                        confidence: 75
                    });
                }
                if (patterns.includes('memory')) {
                    recommendations.push({
                        priority: 'HIGH',
                        action: 'Reduce memory usage',
                        details: 'Memory pressure detected, consider cleanup',
                        confidence: 70
                    });
                }
            }

            if (direction === 'MONITOR') {
                recommendations.push({
                    priority: 'LOW',
                    action: 'Continue monitoring',
                    details: 'No immediate action required, continue observation',
                    confidence: 85
                });
            }

            // Limit recommendations
            return recommendations.slice(0, this._config.maxRecommendations);
        },

        // ============================================================
        // Insights Extraction
        // ============================================================

        _extractInsights(decision) {
            const insights = [];

            // Insight 1: Pattern severity
            const highPatterns = decision.patterns.filter(p => p.severity === 'HIGH');
            if (highPatterns.length > 0) {
                insights.push({
                    type: 'critical_pattern',
                    description: `Detected ${highPatterns.length} high severity patterns`,
                    severity: 'HIGH',
                    confidence: 90,
                    timestamp: Date.now()
                });
            }

            // Insight 2: Recommendation
            if (decision.recommendations && decision.recommendations.length > 0) {
                insights.push({
                    type: 'recommendation',
                    description: `${decision.recommendations.length} recommendations generated`,
                    severity: 'MEDIUM',
                    confidence: 80,
                    timestamp: Date.now()
                });
            }

            // Insight 3: Confidence
            if (decision.confidence.score < 50) {
                insights.push({
                    type: 'low_confidence',
                    description: 'Low confidence decision, manual review recommended',
                    severity: 'MEDIUM',
                    confidence: 70,
                    timestamp: Date.now()
                });
            }

            return insights;
        },

        // ============================================================
        // Knowledge Integration (Chapter 2)
        // ============================================================

        _findRelevantKnowledge(context) {
            const relevant = [];
            const knowledge = context.knowledge || {};

            // Check entities
            if (knowledge.entities) {
                const entries = Object.values(knowledge.entities);
                entries.forEach(entity => {
                    if (entity.type === 'pattern' || entity.type === 'issue') {
                        relevant.push(entity);
                    }
                });
            }

            return relevant;
        },

        _analyzePerformance(performance) {
            const issues = [];
            if (performance.cpu && performance.cpu > 80) {
                issues.push(`High CPU: ${performance.cpu}%`);
            }
            if (performance.memory && performance.memory > 85) {
                issues.push(`High memory: ${performance.memory}%`);
            }
            if (performance.responseTime && performance.responseTime > 1000) {
                issues.push(`Slow response: ${performance.responseTime}ms`);
            }
            return issues;
        },

        // ============================================================
        // Context Building (Chapter 2)
        // ============================================================

        _buildContext(signal, data) {
            return new IntelligenceContext({
                source: 'runtime',
                signal: {
                    type: signal,
                    timestamp: Date.now(),
                    data: data
                },
                runtimeState: this._getRuntimeState(),
                history: this._getHistory(),
                knowledge: this._getKnowledge(),
                performance: this._getPerformance(),
                governance: this._getGovernance(),
                metadata: {
                    version: '5.1',
                    source: 'DecisionIntelligence'
                }
            });
        },

        // ============================================================
        // Data Accessors
        // ============================================================

        _getRuntimeState() {
            try {
                if (window.LawAIApp && window.LawAIApp.Runtime) {
                    return window.LawAIApp.Runtime.getState ? window.LawAIApp.Runtime.getState() : null;
                }
            } catch (e) {
                // ignore
            }
            return null;
        },

        _getHistory() {
            // Return recent decisions as history
            return this._decisions.slice(-10).map(d => ({
                signal: d.signal,
                outcome: d.status === 'ANALYZED' ? 'success' : 'unknown',
                timestamp: d.timestamp
            }));
        },

        _getKnowledge() {
            try {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    return window.LawAIApp.KnowledgeGraph.getData ? window.LawAIApp.KnowledgeGraph.getData() : null;
                }
            } catch (e) {
                // ignore
            }
            return null;
        },

        _getPerformance() {
            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    return window.LawAIApp.Performance.report ? window.LawAIApp.Performance.report() : null;
                }
            } catch (e) {
                // ignore
            }
            return null;
        },

        _getGovernance() {
            try {
                if (window.LawAIApp && window.LawAIApp.Governance) {
                    return window.LawAIApp.Governance.getStatus ? window.LawAIApp.Governance.getStatus() : null;
                }
            } catch (e) {
                // ignore
            }
            return null;
        },

        // ============================================================
        // Query Methods
        // ============================================================

        getContexts(limit = 10) {
            return this._contexts.slice(-limit).map(c => c.toJSON());
        },

        getDecisions(limit = 10) {
            return this._decisions.slice(-limit);
        },

        getInsights(limit = 10) {
            return this._insights.slice(-limit);
        },

        getDecision(id) {
            return this._decisions.find(d => d.id === id) || null;
        },

        getStats() {
            const total = this._decisions.length;
            const highConfidence = this._decisions.filter(d => d.confidence.score >= 80).length;
            const mediumConfidence = this._decisions.filter(d => d.confidence.score >= 60 && d.confidence.score < 80).length;
            const lowConfidence = this._decisions.filter(d => d.confidence.score < 60).length;

            const patternTypes = {};
            this._decisions.forEach(d => {
                d.patterns.forEach(p => {
                    patternTypes[p.type] = (patternTypes[p.type] || 0) + 1;
                });
            });

            return {
                total,
                highConfidence,
                mediumConfidence,
                lowConfidence,
                patternTypes,
                insights: this._insights.length,
                contexts: this._contexts.length
            };
        },

        // ============================================================
        // Explorer Support
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getDecisions(5);

            return {
                type: 'decision_intelligence',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentDecisions: recent,
                insights: this._insights.slice(-5),
                config: this._config
            };
        },

        // ============================================================
        // Listeners
        // ============================================================

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
            return this;
        },

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error('[DecisionIntelligence] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`decisionintelligence.${event}`, data);
            }
        },

        // ============================================================
        // Integrations (Chapter 4)
        // ============================================================

        _connectToAutonomousLayer() {
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                console.log('[DecisionIntelligence] Connected to Autonomous Layer');
            }
        },

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[DecisionIntelligence] Connected to Knowledge Graph');
            }
        },

        _connectToCognitiveEngine() {
            if (window.LawAIApp && window.LawAIApp.CognitiveEngine) {
                console.log('[DecisionIntelligence] Connected to Cognitive Engine');
            }
        },

        _connectToPerformanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[DecisionIntelligence] Connected to Performance Framework');
            }
        },

        _connectToRuntimeHistory() {
            if (window.LawAIApp && window.LawAIApp.Runtime) {
                console.log('[DecisionIntelligence] Connected to Runtime History');
            }
        },

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[DecisionIntelligence] Connected to Governance');
            }
        },

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'decision-intelligence',
                        name: 'Decision Intelligence',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[DecisionIntelligence] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[DecisionIntelligence] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new DecisionIntelligence();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionIntelligence = {
        Core: instance,

        initialize: (config) => instance.initialize(config),
        analyze: (signal, data) => instance.analyze(signal, data),

        getContexts: (limit) => instance.getContexts(limit),
        getDecisions: (limit) => instance.getDecisions(limit),
        getInsights: (limit) => instance.getInsights(limit),
        getDecision: (id) => instance.getDecision(id),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[DecisionIntelligence] Part 51.1 loaded ✅');
    console.log('[DecisionIntelligence] Ready for Context Based Intelligence Decisions');

})();
