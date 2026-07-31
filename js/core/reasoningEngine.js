// ============================================================
// reasoningEngine.js
// Part 51.3 — Reasoning Engine
// Version: v5.1.3
// Module: Decision Intelligence Layer
// File: js/core/reasoningEngine.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ReasoningEngine) {
        console.warn('[ReasoningEngine] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Reasoning Chain (Chapter 5)
    // ============================================================
    const REASONING_STEPS = {
        OBSERVATION: 'observation',
        EVIDENCE: 'evidence',
        ANALYSIS: 'analysis',
        CONCLUSION: 'conclusion',
        RECOMMENDATION: 'recommendation'
    };

    // ============================================================
    // Reasoning Model (Chapter 6)
    // ============================================================
    class Reasoning {
        constructor(config) {
            this.reasoningId = config.reasoningId || this._generateId();
            this.timestamp = Date.now();
            this.input = config.input || {};
            this.evidence = config.evidence || [];
            this.steps = config.steps || [];
            this.conclusion = config.conclusion || null;
            this.confidence = config.confidence || 0;
            this.recommendations = config.recommendations || [];
            this.metadata = config.metadata || {};
            this.explanation = null;
        }

        _generateId() {
            return `rsn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        addStep(step) {
            this.steps.push({
                stepId: `step_${this.steps.length + 1}`,
                type: step.type || REASONING_STEPS.OBSERVATION,
                description: step.description || '',
                data: step.data || {},
                timestamp: Date.now()
            });
            return this;
        }

        addEvidence(evidence) {
            this.evidence.push({
                id: `ev_${this.evidence.length + 1}`,
                source: evidence.source || 'unknown',
                description: evidence.description || '',
                weight: evidence.weight || 1,
                reliability: evidence.reliability || 0.5,
                timestamp: Date.now()
            });
            return this;
        }

        setConclusion(conclusion) {
            this.conclusion = conclusion;
            return this;
        }

        setConfidence(confidence) {
            this.confidence = Math.min(Math.max(confidence, 0), 100);
            return this;
        }

        addRecommendation(recommendation) {
            this.recommendations.push(recommendation);
            return this;
        }

        generateExplanation() {
            const parts = [];

            parts.push(`🧠 Reasoning: ${this.reasoningId}`);
            parts.push(`📋 Input: ${this.input.summary || 'N/A'}`);

            if (this.evidence.length > 0) {
                parts.push(`📊 Evidence (${this.evidence.length} items):`);
                this.evidence.forEach(e => {
                    parts.push(`  • ${e.description} (weight: ${e.weight}, reliability: ${(e.reliability * 100).toFixed(0)}%)`);
                });
            }

            if (this.steps.length > 0) {
                parts.push(`🔗 Reasoning Chain:`);
                this.steps.forEach(s => {
                    parts.push(`  ${s.type}: ${s.description}`);
                });
            }

            if (this.conclusion) {
                parts.push(`🎯 Conclusion: ${this.conclusion}`);
            }

            parts.push(`📊 Confidence: ${this.confidence}%`);

            if (this.recommendations.length > 0) {
                parts.push(`💡 Recommendations:`);
                this.recommendations.forEach(r => {
                    parts.push(`  • ${r}`);
                });
            }

            this.explanation = parts.join('\n');
            return this.explanation;
        }

        toJSON() {
            return {
                reasoningId: this.reasoningId,
                timestamp: this.timestamp,
                input: this.input,
                evidence: this.evidence,
                steps: this.steps,
                conclusion: this.conclusion,
                confidence: this.confidence,
                recommendations: this.recommendations,
                explanation: this.explanation || this.generateExplanation(),
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evidence System (Chapter 7)
    // ============================================================
    class EvidenceCollector {
        constructor() {
            this._sources = {};
        }

        registerSource(name, handler) {
            this._sources[name] = handler;
            console.log(`[EvidenceCollector] Registered source: ${name}`);
        }

        collect(sources, context) {
            const evidence = [];

            sources.forEach(sourceName => {
                const handler = this._sources[sourceName];
                if (handler) {
                    try {
                        const result = handler(context);
                        if (result) {
                            evidence.push({
                                source: sourceName,
                                description: result.description || `Evidence from ${sourceName}`,
                                weight: result.weight || 1,
                                reliability: result.reliability || 0.5,
                                data: result.data || {}
                            });
                        }
                    } catch (e) {
                        console.warn(`[EvidenceCollector] Error collecting from ${sourceName}:`, e);
                    }
                }
            });

            return evidence;
        }
    }

    // ============================================================
    // Reasoning Engine Core (Chapter 1-3)
    // ============================================================
    class ReasoningEngine {
        constructor() {
            this._reasonings = [];
            this._activeReasoning = null;
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxReasoningHistory: 100,
                minEvidenceRequired: 2,
                minConfidenceThreshold: 50,
                enableExplainability: true,
                maxRecommendations: 3
            };
            this._evidenceCollector = new EvidenceCollector();
            this._reasoningStrategies = this._initStrategies();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ReasoningEngine] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ReasoningEngine] Initializing...');

            // Register evidence sources (Chapter 7)
            this._registerEvidenceSources();

            // Connect to modules (Chapter 9)
            this._connectToContextIntelligence();
            this._connectToHistoricalMemory();
            this._connectToKnowledgeGraph();
            this._connectToDecisionEngine();
            this._connectToRecommendationEngine();

            // Register with Explorer (Chapter 11)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[ReasoningEngine] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Reason (Chapter 3-5)
        // ============================================================

        reason(input, options) {
            console.log(`[ReasoningEngine] Starting reasoning for: ${input.summary || 'unknown'}`);

            // Create reasoning instance
            const reasoning = new Reasoning({
                input: input,
                metadata: {
                    options: options || {},
                    timestamp: Date.now()
                }
            });

            // Step 1: Observation (Chapter 5)
            reasoning.addStep({
                type: REASONING_STEPS.OBSERVATION,
                description: `Observed: ${input.summary || 'Runtime signal'}`,
                data: { input: input }
            });

            // Step 2: Collect Evidence (Chapter 7)
            const evidence = this._collectEvidence(input, options);
            evidence.forEach(e => reasoning.addEvidence(e));
            
            if (evidence.length < this._config.minEvidenceRequired) {
                console.warn('[ReasoningEngine] Insufficient evidence');
                reasoning.setConfidence(30);
                reasoning.setConclusion('Insufficient evidence for reliable reasoning');
                this._finalizeReasoning(reasoning);
                return reasoning;
            }

            reasoning.addStep({
                type: REASONING_STEPS.EVIDENCE,
                description: `Collected ${evidence.length} pieces of evidence`,
                data: { evidenceCount: evidence.length }
            });

            // Step 3: Analysis (Chapter 5)
            const analysis = this._analyze(input, evidence);
            reasoning.addStep({
                type: REASONING_STEPS.ANALYSIS,
                description: analysis.summary,
                data: analysis.details
            });

            // Step 4: Conclusion (Chapter 5)
            const conclusion = this._drawConclusion(input, evidence, analysis);
            reasoning.setConclusion(conclusion.text);

            // Step 5: Confidence Evaluation (Chapter 8)
            const confidence = this._evaluateConfidence(input, evidence, analysis);
            reasoning.setConfidence(confidence.score);

            // Step 6: Recommendations (Chapter 5)
            const recommendations = this._generateRecommendations(input, evidence, analysis, conclusion);
            recommendations.forEach(r => reasoning.addRecommendation(r));

            // Step 7: Generate Explanation (Chapter 10)
            if (this._config.enableExplainability) {
                reasoning.generateExplanation();
            }

            // Store reasoning
            this._reasonings.push(reasoning);
            if (this._reasonings.length > this._config.maxReasoningHistory) {
                this._reasonings.shift();
            }

            this._activeReasoning = reasoning;
            this._finalizeReasoning(reasoning);

            console.log(`[ReasoningEngine] Reasoning complete: ${reasoning.reasoningId}`);
            return reasoning;
        }

        // ============================================================
        // Analysis (Chapter 3)
        // ============================================================

        _analyze(input, evidence) {
            const details = {};
            let summary = '';

            // Analyze evidence patterns
            const highWeight = evidence.filter(e => e.weight > 0.7);
            const highReliability = evidence.filter(e => e.reliability > 0.7);

            if (highWeight.length > 0) {
                details.highWeightEvidence = highWeight.map(e => e.description);
            }

            if (highReliability.length > 0) {
                details.highReliabilityEvidence = highReliability.map(e => e.description);
            }

            // Identify patterns
            const patterns = this._identifyPatterns(input, evidence);
            if (patterns.length > 0) {
                details.patterns = patterns;
            }

            // Build summary
            const parts = [];
            if (patterns.length > 0) {
                parts.push(`Detected ${patterns.length} patterns`);
            }
            if (highWeight.length > 0) {
                parts.push(`${highWeight.length} high-weight evidence items`);
            }
            if (highReliability.length > 0) {
                parts.push(`${highReliability.length} high-reliability evidence items`);
            }

            summary = parts.join(', ') || 'Analysis complete';

            return {
                summary: summary,
                details: details
            };
        }

        _identifyPatterns(input, evidence) {
            const patterns = [];

            // Pattern: Performance degradation
            if (input.cpu && input.cpu > 80) {
                patterns.push({
                    type: 'performance_degradation',
                    description: `High CPU: ${input.cpu}%`,
                    confidence: 70
                });
            }

            // Pattern: Memory pressure
            if (input.memory && input.memory > 85) {
                patterns.push({
                    type: 'memory_pressure',
                    description: `High memory: ${input.memory}%`,
                    confidence: 70
                });
            }

            // Pattern: Error spike
            if (input.errors && input.errors > 10) {
                patterns.push({
                    type: 'error_spike',
                    description: `${input.errors} errors detected`,
                    confidence: 75
                });
            }

            // Pattern: Historical recurrence
            const historical = evidence.find(e => e.source === 'historical');
            if (historical && historical.data && historical.data.recurrence) {
                patterns.push({
                    type: 'recurring_issue',
                    description: `Recurring issue: ${historical.data.recurrence} previous occurrences`,
                    confidence: 80
                });
            }

            return patterns;
        }

        // ============================================================
        // Conclusion (Chapter 5-6)
        // ============================================================

        _drawConclusion(input, evidence, analysis) {
            let text = '';
            let severity = 'LOW';

            const highWeight = evidence.filter(e => e.weight > 0.7);
            const patterns = analysis.details.patterns || [];

            // Critical issues
            const criticalPatterns = patterns.filter(p => 
                p.type === 'error_spike' || p.type === 'performance_degradation'
            );

            if (criticalPatterns.length > 0) {
                text = 'Critical issues detected requiring immediate attention';
                severity = 'CRITICAL';
            } else if (highWeight.length > 2) {
                text = 'Multiple high-confidence evidence points indicate significant issue';
                severity = 'HIGH';
            } else if (patterns.length > 0) {
                text = 'Patterns detected, monitoring recommended';
                severity = 'MEDIUM';
            } else if (evidence.length >= this._config.minEvidenceRequired) {
                text = 'System appears stable, no major issues detected';
                severity = 'LOW';
            } else {
                text = 'Insufficient evidence for conclusive reasoning';
                severity = 'UNKNOWN';
            }

            return {
                text: text,
                severity: severity,
                confidence: this._calculateConclusionConfidence(patterns, evidence)
            };
        }

        _calculateConclusionConfidence(patterns, evidence) {
            let score = 50;

            // Patterns increase confidence
            if (patterns.length > 0) {
                score += Math.min(patterns.length * 10, 30);
            }

            // Evidence quality
            const reliable = evidence.filter(e => e.reliability > 0.7);
            score += Math.min(reliable.length * 5, 20);

            return Math.min(score, 100);
        }

        // ============================================================
        // Confidence Evaluation (Chapter 8)
        // ============================================================

        _evaluateConfidence(input, evidence, analysis) {
            const factors = [];

            // Factor 1: Data Quality
            let dataQuality = 50;
            if (input.cpu) dataQuality += 10;
            if (input.memory) dataQuality += 10;
            if (input.errors !== undefined) dataQuality += 10;
            if (input.status) dataQuality += 10;
            dataQuality = Math.min(dataQuality, 100);
            factors.push({ factor: 'data_quality', score: dataQuality, weight: 0.2 });

            // Factor 2: Historical Match
            const historical = evidence.find(e => e.source === 'historical');
            const historicalScore = historical ? Math.min(historical.reliability * 100, 90) : 50;
            factors.push({ factor: 'historical_match', score: historicalScore, weight: 0.2 });

            // Factor 3: Knowledge Relation
            const knowledge = evidence.find(e => e.source === 'knowledge');
            const knowledgeScore = knowledge ? Math.min(knowledge.reliability * 100, 90) : 50;
            factors.push({ factor: 'knowledge_relation', score: knowledgeScore, weight: 0.2 });

            // Factor 4: Reasoning Consistency
            const consistency = this._evaluateConsistency(analysis);
            factors.push({ factor: 'reasoning_consistency', score: consistency, weight: 0.2 });

            // Factor 5: Evidence Strength
            const avgWeight = evidence.length > 0 ? 
                evidence.reduce((sum, e) => sum + e.weight, 0) / evidence.length : 0;
            const strengthScore = Math.min(avgWeight * 100, 90);
            factors.push({ factor: 'evidence_strength', score: strengthScore, weight: 0.2 });

            // Calculate total
            const total = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);

            return {
                score: Math.round(total),
                level: total >= 80 ? 'HIGH' : total >= 60 ? 'MEDIUM' : 'LOW',
                factors: factors,
                interpretation: total >= 80 ? 'High confidence reasoning' :
                              total >= 60 ? 'Medium confidence, review recommended' :
                              'Low confidence, manual verification required'
            };
        }

        _evaluateConsistency(analysis) {
            const details = analysis.details || {};
            let score = 70;

            if (details.patterns && details.patterns.length > 0) {
                score += 10;
            }
            if (details.highWeightEvidence && details.highWeightEvidence.length > 0) {
                score += 10;
            }
            if (details.highReliabilityEvidence && details.highReliabilityEvidence.length > 0) {
                score += 10;
            }

            return Math.min(score, 100);
        }

        // ============================================================
        // Recommendations (Chapter 5)
        // ============================================================

        _generateRecommendations(input, evidence, analysis, conclusion) {
            const recommendations = [];
            const patterns = analysis.details.patterns || [];

            if (patterns.length === 0) {
                recommendations.push('Continue monitoring, no action required');
                return recommendations;
            }

            patterns.forEach(pattern => {
                switch (pattern.type) {
                    case 'performance_degradation':
                        recommendations.push('Consider scaling resources or optimizing performance');
                        break;
                    case 'memory_pressure':
                        recommendations.push('Consider memory cleanup or increasing capacity');
                        break;
                    case 'error_spike':
                        recommendations.push('Investigate error logs and apply fixes');
                        break;
                    case 'recurring_issue':
                        recommendations.push('Review historical solutions and apply permanent fix');
                        break;
                    default:
                        recommendations.push('Review pattern and determine appropriate action');
                }
            });

            // Limit recommendations
            return recommendations.slice(0, this._config.maxRecommendations);
        }

        // ============================================================
        // Evidence Collection (Chapter 7)
        // ============================================================

        _collectEvidence(input, options) {
            const sources = options?.sources || ['runtime', 'historical', 'knowledge', 'performance'];
            return this._evidenceCollector.collect(sources, {
                input: input,
                options: options
            });
        }

        _registerEvidenceSources() {
            // Runtime evidence
            this._evidenceCollector.registerSource('runtime', (context) => {
                const input = context.input || {};
                return {
                    description: `Runtime state: ${input.status || 'unknown'}`,
                    weight: 0.8,
                    reliability: 0.9,
                    data: { state: input }
                };
            });

            // Historical evidence
            this._evidenceCollector.registerSource('historical', (context) => {
                if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                    try {
                        const memContext = window.LawAIApp.HistoricalMemory.getHistoricalContext(
                            context.input.summary || 'issue'
                        );
                        if (memContext) {
                            return {
                                description: `Historical: ${memContext.similarCases?.length || 0} similar cases, ${memContext.successRate || 0}% success rate`,
                                weight: 0.7,
                                reliability: 0.7,
                                data: { context: memContext.toJSON ? memContext.toJSON() : memContext }
                            };
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                return null;
            });

            // Knowledge evidence
            this._evidenceCollector.registerSource('knowledge', (context) => {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    try {
                        const data = window.LawAIApp.KnowledgeGraph.getData ?
                            window.LawAIApp.KnowledgeGraph.getData() : null;
                        if (data && data.entities) {
                            return {
                                description: `Knowledge: ${Object.keys(data.entities).length} entities available`,
                                weight: 0.6,
                                reliability: 0.7,
                                data: { entities: Object.keys(data.entities).length }
                            };
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                return null;
            });

            // Performance evidence
            this._evidenceCollector.registerSource('performance', (context) => {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    try {
                        const report = window.LawAIApp.Performance.report ?
                            window.LawAIApp.Performance.report() : null;
                        if (report) {
                            return {
                                description: `Performance: ${report.status || 'unknown'}`,
                                weight: 0.75,
                                reliability: 0.8,
                                data: { report: report }
                            };
                        }
                    } catch (e) {
                        // ignore
                    }
                }
                return null;
            });
        }

        // ============================================================
        // Helper
        // ============================================================

        _finalizeReasoning(reasoning) {
            this._emit('reasoningComplete', reasoning.toJSON());
            return reasoning;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getReasoning(id) {
            const reasoning = this._reasonings.find(r => r.reasoningId === id);
            return reasoning ? reasoning.toJSON() : null;
        }

        getReasonings(limit = 10) {
            return this._reasonings.slice(-limit).reverse().map(r => r.toJSON());
        }

        getActiveReasoning() {
            return this._activeReasoning ? this._activeReasoning.toJSON() : null;
        }

        getStats() {
            const total = this._reasonings.length;
            const highConfidence = this._reasonings.filter(r => r.confidence >= 80).length;
            const mediumConfidence = this._reasonings.filter(r => r.confidence >= 60 && r.confidence < 80).length;
            const lowConfidence = this._reasonings.filter(r => r.confidence < 60).length;

            const avgConfidence = total > 0 ?
                this._reasonings.reduce((sum, r) => sum + r.confidence, 0) / total : 0;

            return {
                total,
                highConfidence,
                mediumConfidence,
                lowConfidence,
                avgConfidence: Math.round(avgConfidence),
                evidenceSources: Object.keys(this._evidenceCollector._sources).length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 11)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getReasonings(5);
            const active = this.getActiveReasoning();

            return {
                type: 'reasoning_engine',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentReasonings: recent,
                activeReasoning: active,
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
                        console.error('[ReasoningEngine] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`reasoning.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 9)
        // ============================================================

        _connectToContextIntelligence() {
            if (window.LawAIApp && window.LawAIApp.ContextIntelligence) {
                console.log('[ReasoningEngine] Connected to Context Intelligence');
            }
        }

        _connectToHistoricalMemory() {
            if (window.LawAIApp && window.LawAIApp.HistoricalMemory) {
                console.log('[ReasoningEngine] Connected to Historical Memory');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[ReasoningEngine] Connected to Knowledge Graph');
            }
        }

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                console.log('[ReasoningEngine] Connected to Decision Engine');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                console.log('[ReasoningEngine] Connected to Recommendation Engine');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'reasoning-engine',
                        name: 'Reasoning Engine',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ReasoningEngine] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ReasoningEngine] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Strategies
        // ============================================================

        _initStrategies() {
            return {
                'performance_issue': {
                    description: 'Analyze performance-related issues',
                    evidenceSources: ['runtime', 'performance', 'historical'],
                    minConfidence: 60
                },
                'error_issue': {
                    description: 'Analyze error-related issues',
                    evidenceSources: ['runtime', 'historical', 'knowledge'],
                    minConfidence: 60
                },
                'general': {
                    description: 'General reasoning strategy',
                    evidenceSources: ['runtime', 'historical', 'knowledge', 'performance'],
                    minConfidence: 50
                }
            };
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new ReasoningEngine();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ReasoningEngine = {
        Core: instance,
        REASONING_STEPS: REASONING_STEPS,

        // Public API
        initialize: (config) => instance.initialize(config),
        reason: (input, options) => instance.reason(input, options),

        getReasoning: (id) => instance.getReasoning(id),
        getReasonings: (limit) => instance.getReasonings(limit),
        getActiveReasoning: () => instance.getActiveReasoning(),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[ReasoningEngine] Part 51.3 loaded ✅');
    console.log('[ReasoningEngine] Reasoning Steps:', Object.values(REASONING_STEPS).join(' → '));

})();
