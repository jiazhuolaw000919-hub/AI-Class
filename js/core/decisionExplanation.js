// ============================================================
// decisionExplanation.js
// Part 51.5 — Decision Explanation Layer
// Version: v5.1.5
// Module: Decision Intelligence Layer
// File: js/core/decisionExplanation.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionExplanation) {
        console.warn('[DecisionExplanation] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Explanation Model (Chapter 4)
    // ============================================================
    class Explanation {
        constructor(config) {
            this.explanationId = config.explanationId || this._generateId();
            this.decisionId = config.decisionId || null;
            this.timestamp = Date.now();
            this.summary = config.summary || '';
            this.reasoning = config.reasoning || [];
            this.evidence = config.evidence || [];
            this.confidence = config.confidence || null;
            this.risk = config.risk || null;
            this.impact = config.impact || null;
            this.recommendations = config.recommendations || [];
            this.metadata = config.metadata || {};
            this.structure = this._buildStructure(config);
        }

        _generateId() {
            return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        _buildStructure(config) {
            return {
                what: config.what || 'Decision made',
                why: config.why || 'Based on runtime signals',
                evidence: config.evidenceSummary || 'Multiple evidence sources',
                conclusion: config.conclusion || 'Action recommended',
                impact: config.impactSummary || 'System improvement expected'
            };
        }

        toJSON() {
            return {
                explanationId: this.explanationId,
                decisionId: this.decisionId,
                timestamp: this.timestamp,
                summary: this.summary,
                reasoning: this.reasoning,
                evidence: this.evidence,
                confidence: this.confidence,
                risk: this.risk,
                impact: this.impact,
                recommendations: this.recommendations,
                structure: this.structure,
                metadata: this.metadata
            };
        }

        // ============================================================
        // Human Readable Output (Chapter 7)
        // ============================================================

        toHumanReadable() {
            const lines = [];
            
            lines.push('┌─────────────────────────────────────────────────┐');
            lines.push('│  🧠 DECISION EXPLANATION                      │');
            lines.push('├─────────────────────────────────────────────────┤');
            lines.push(`│  ID: ${this.explanationId}`);
            lines.push(`│  Decision: ${this.decisionId || 'N/A'}`);
            lines.push(`│  Time: ${new Date(this.timestamp).toLocaleString()}`);
            lines.push('├─────────────────────────────────────────────────┤');
            lines.push(`│  📋 WHAT: ${this.structure.what}`);
            lines.push(`│  🔍 WHY: ${this.structure.why}`);
            lines.push(`│  📊 EVIDENCE: ${this.structure.evidence}`);
            lines.push(`│  🎯 CONCLUSION: ${this.structure.conclusion}`);
            lines.push(`│  💥 IMPACT: ${this.structure.impact}`);
            lines.push('├─────────────────────────────────────────────────┤');
            
            if (this.confidence) {
                lines.push(`│  📈 Confidence: ${this.confidence.score || 0}% (${this.confidence.reliability || 'UNKNOWN'})`);
            }
            
            if (this.risk) {
                lines.push(`│  ⚠️ Risk: ${this.risk.level || 'UNKNOWN'} (${this.risk.score || 0}%)`);
            }
            
            if (this.reasoning && this.reasoning.length > 0) {
                lines.push('├─────────────────────────────────────────────────┤');
                lines.push('│  🔗 REASONING CHAIN:                         │');
                this.reasoning.forEach((step, i) => {
                    const prefix = i === this.reasoning.length - 1 ? '└─' : '├─';
                    lines.push(`│  ${prefix} ${step}`);
                });
            }
            
            if (this.evidence && this.evidence.length > 0) {
                lines.push('├─────────────────────────────────────────────────┤');
                lines.push('│  📊 EVIDENCE:                                │');
                this.evidence.slice(0, 5).forEach((e, i) => {
                    const prefix = i === Math.min(this.evidence.length, 5) - 1 ? '└─' : '├─';
                    const desc = typeof e === 'string' ? e : (e.description || e.source || 'evidence');
                    lines.push(`│  ${prefix} ${desc}`);
                });
                if (this.evidence.length > 5) {
                    lines.push(`│  └─ (+${this.evidence.length - 5} more)`);
                }
            }
            
            if (this.recommendations && this.recommendations.length > 0) {
                lines.push('├─────────────────────────────────────────────────┤');
                lines.push('│  💡 RECOMMENDATIONS:                         │');
                this.recommendations.forEach((r, i) => {
                    const prefix = i === this.recommendations.length - 1 ? '└─' : '├─';
                    lines.push(`│  ${prefix} ${r}`);
                });
            }
            
            lines.push('└─────────────────────────────────────────────────┘');
            
            return lines.join('\n');
        }

        // ============================================================
        // Markdown Output
        // ============================================================

        toMarkdown() {
            let md = '';
            
            md += `# 🧠 Decision Explanation\n\n`;
            md += `**ID:** \`${this.explanationId}\`\n`;
            md += `**Decision:** \`${this.decisionId || 'N/A'}\`\n`;
            md += `**Time:** ${new Date(this.timestamp).toLocaleString()}\n\n`;
            
            md += `## 📋 What Happened\n\n${this.structure.what}\n\n`;
            md += `## 🔍 Why Detected\n\n${this.structure.why}\n\n`;
            md += `## 📊 Evidence\n\n${this.structure.evidence}\n\n`;
            md += `## 🎯 Conclusion\n\n${this.structure.conclusion}\n\n`;
            md += `## 💥 Impact\n\n${this.structure.impact}\n\n`;
            
            if (this.confidence) {
                md += `## 📈 Confidence\n\n`;
                md += `- **Score:** ${this.confidence.score || 0}%\n`;
                md += `- **Level:** ${this.confidence.reliability || 'UNKNOWN'}\n`;
                if (this.confidence.factors) {
                    md += `- **Factors:**\n`;
                    this.confidence.factors.forEach(f => {
                        md += `  - ${f.name}: ${f.score}% (weight: ${f.weight})\n`;
                    });
                }
                md += '\n';
            }
            
            if (this.risk) {
                md += `## ⚠️ Risk Assessment\n\n`;
                md += `- **Level:** ${this.risk.level || 'UNKNOWN'}\n`;
                md += `- **Score:** ${this.risk.score || 0}%\n\n`;
            }
            
            if (this.reasoning && this.reasoning.length > 0) {
                md += `## 🔗 Reasoning Chain\n\n`;
                this.reasoning.forEach((step, i) => {
                    md += `${i + 1}. ${step}\n`;
                });
                md += '\n';
            }
            
            if (this.evidence && this.evidence.length > 0) {
                md += `## 📊 Evidence Details\n\n`;
                this.evidence.forEach(e => {
                    const desc = typeof e === 'string' ? e : (e.description || e.source || 'evidence');
                    const weight = typeof e === 'object' && e.weight ? ` (weight: ${e.weight})` : '';
                    md += `- ${desc}${weight}\n`;
                });
                md += '\n';
            }
            
            if (this.recommendations && this.recommendations.length > 0) {
                md += `## 💡 Recommendations\n\n`;
                this.recommendations.forEach(r => {
                    md += `- ${r}\n`;
                });
                md += '\n';
            }
            
            return md;
        }

        // ============================================================
        // JSON Output
        // ============================================================

        toJSON() {
            return {
                explanationId: this.explanationId,
                decisionId: this.decisionId,
                timestamp: this.timestamp,
                summary: this.summary,
                reasoning: this.reasoning,
                evidence: this.evidence,
                confidence: this.confidence,
                risk: this.risk,
                impact: this.impact,
                recommendations: this.recommendations,
                structure: this.structure,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Explanation Builder (Chapter 5)
    // ============================================================
    class ExplanationBuilder {
        constructor() {
            this._config = {
                maxEvidenceDisplay: 10,
                maxReasoningSteps: 8,
                includeConfidenceFactors: true,
                includeRiskAssessment: true
            };
        }

        setConfig(config) {
            Object.assign(this._config, config);
            return this;
        }

        build(decision, reasoning, confidence, evidence, risk) {
            // What happened?
            const what = this._buildWhat(decision);
            
            // Why detected?
            const why = this._buildWhy(decision, reasoning);
            
            // Evidence summary
            const evidenceSummary = this._buildEvidenceSummary(evidence);
            
            // Conclusion
            const conclusion = this._buildConclusion(decision, reasoning);
            
            // Impact
            const impactSummary = this._buildImpact(decision, risk);

            // Build explanation
            const explanation = new Explanation({
                decisionId: decision?.id || null,
                summary: this._buildSummary(decision, confidence),
                reasoning: this._buildReasoningChain(reasoning),
                evidence: this._buildEvidenceList(evidence),
                confidence: confidence ? {
                    score: confidence.score,
                    reliability: confidence.reliability,
                    factors: this._config.includeConfidenceFactors ? confidence.factors : undefined
                } : null,
                risk: risk ? {
                    level: risk.level,
                    score: risk.score
                } : null,
                impact: impactSummary,
                recommendations: this._buildRecommendations(decision),
                what: what,
                why: why,
                evidenceSummary: evidenceSummary,
                conclusion: conclusion,
                impactSummary: impactSummary,
                metadata: {
                    source: 'DecisionExplanation',
                    version: '5.1.5'
                }
            });

            return explanation;
        }

        // ============================================================
        // Builder Helpers
        // ============================================================

        _buildWhat(decision) {
            if (!decision) return 'Decision made by runtime';
            return `Decision triggered by ${decision.trigger || 'runtime signal'} with ${decision.priority || 'NORMAL'} priority`;
        }

        _buildWhy(decision, reasoning) {
            if (reasoning && reasoning.conclusion) {
                return reasoning.conclusion;
            }
            return decision?.reason || 'Based on runtime analysis';
        }

        _buildEvidenceSummary(evidence) {
            if (!evidence || evidence.length === 0) {
                return 'No evidence available';
            }
            
            const sources = new Set();
            evidence.forEach(e => {
                if (e.source) sources.add(e.source);
            });
            
            return `${evidence.length} evidence items from ${sources.size} sources`;
        }

        _buildConclusion(decision, reasoning) {
            if (reasoning && reasoning.conclusion) {
                return reasoning.conclusion;
            }
            return decision?.recommendation || 'Action recommended based on analysis';
        }

        _buildImpact(decision, risk) {
            if (risk && risk.impact) {
                return risk.impact;
            }
            return 'System improvement expected';
        }

        _buildSummary(decision, confidence) {
            const parts = [];
            parts.push(`Decision: ${decision?.trigger || 'runtime'}`);
            if (confidence) {
                parts.push(`Confidence: ${confidence.score}% (${confidence.reliability})`);
            }
            return parts.join(' | ');
        }

        _buildReasoningChain(reasoning) {
            if (!reasoning) return ['No reasoning available'];
            
            const steps = [];
            
            if (reasoning.steps) {
                reasoning.steps.forEach(s => {
                    if (typeof s === 'string') {
                        steps.push(s);
                    } else if (s.description) {
                        steps.push(s.description);
                    }
                });
            }
            
            if (reasoning.conclusion) {
                steps.push(`Conclusion: ${reasoning.conclusion}`);
            }
            
            return steps.slice(0, this._config.maxReasoningSteps);
        }

        _buildEvidenceList(evidence) {
            if (!evidence || evidence.length === 0) {
                return [{ description: 'No evidence available', source: 'unknown' }];
            }
            
            return evidence.slice(0, this._config.maxEvidenceDisplay).map(e => ({
                description: e.description || e.source || 'evidence',
                source: e.source || 'unknown',
                weight: e.weight,
                reliability: e.reliability
            }));
        }

        _buildRecommendations(decision) {
            if (decision && decision.recommendations) {
                return decision.recommendations;
            }
            if (decision && decision.recommendation) {
                return [decision.recommendation];
            }
            return ['Monitor and review'];
        }
    }

    // ============================================================
    // Decision Explanation Layer (Chapter 1-3)
    // ============================================================
    class DecisionExplanation {
        constructor() {
            this._explanations = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 100,
                enableHumanReadable: true,
                enableMarkdown: true,
                autoGenerate: true
            };
            this._builder = new ExplanationBuilder();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[DecisionExplanation] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
                this._builder.setConfig(config);
            }

            console.log('[DecisionExplanation] Initializing...');

            // Connect to modules (Chapter 8)
            this._connectToReasoningEngine();
            this._connectToConfidenceSystem();
            this._connectToRecommendationEngine();
            this._connectToAutonomousDashboard();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[DecisionExplanation] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Generate Explanation (Chapter 3-5)
        // ============================================================

        generate(decision, options) {
            console.log(`[DecisionExplanation] Generating explanation for decision: ${decision?.id || 'unknown'}`);

            // Gather data
            const reasoning = options?.reasoning || this._getReasoning(decision);
            const confidence = options?.confidence || this._getConfidence(decision);
            const evidence = options?.evidence || this._getEvidence(decision);
            const risk = options?.risk || this._getRisk(decision);

            // Build explanation
            const explanation = this._builder.build(
                decision,
                reasoning,
                confidence,
                evidence,
                risk
            );

            // Store
            this._explanations.push(explanation);
            if (this._explanations.length > this._config.maxHistorySize) {
                this._explanations.shift();
            }

            this._emit('explanationGenerated', explanation.toJSON());

            return explanation;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getExplanation(id) {
            const explanation = this._explanations.find(e => e.explanationId === id);
            return explanation ? explanation.toJSON() : null;
        }

        getExplanations(limit = 10) {
            return this._explanations.slice(-limit).reverse().map(e => e.toJSON());
        }

        getExplanationsByDecision(decisionId) {
            return this._explanations
                .filter(e => e.decisionId === decisionId)
                .map(e => e.toJSON());
        }

        getLatestExplanation() {
            return this._explanations.length > 0 ? 
                this._explanations[this._explanations.length - 1].toJSON() : null;
        }

        // ============================================================
        // Human Readable Output (Chapter 7)
        // ============================================================

        getHumanReadable(id) {
            const explanation = this._explanations.find(e => e.explanationId === id);
            if (!explanation) return 'Explanation not found';
            return explanation.toHumanReadable();
        }

        getLatestHumanReadable() {
            const explanation = this._explanations[this._explanations.length - 1];
            if (!explanation) return 'No explanation available';
            return explanation.toHumanReadable();
        }

        // ============================================================
        // Markdown Output
        // ============================================================

        getMarkdown(id) {
            const explanation = this._explanations.find(e => e.explanationId === id);
            if (!explanation) return '# Explanation not found';
            return explanation.toMarkdown();
        }

        getLatestMarkdown() {
            const explanation = this._explanations[this._explanations.length - 1];
            if (!explanation) return '# No explanation available';
            return explanation.toMarkdown();
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._explanations.length;
            
            return {
                total,
                latest: total > 0 ? this._explanations[total - 1].toJSON() : null,
                config: this._config
            };
        }

        // ============================================================
        // Explorer Support (Chapter 9)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getExplanations(5);

            return {
                type: 'decision_explanation',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentExplanations: recent,
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
                        console.error('[DecisionExplanation] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`explanation.${event}`, data);
            }
        }

        // ============================================================
        // Data Retrieval
        // ============================================================

        _getReasoning(decision) {
            if (decision && decision.reasoning) return decision.reasoning;
            if (window.LawAIApp && window.LawAIApp.ReasoningEngine) {
                try {
                    const active = window.LawAIApp.ReasoningEngine.getActiveReasoning();
                    if (active) return active;
                } catch (e) { /* ignore */ }
            }
            return null;
        }

        _getConfidence(decision) {
            if (decision && decision.confidence) return decision.confidence;
            if (window.LawAIApp && window.LawAIApp.DecisionConfidence) {
                try {
                    const stats = window.LawAIApp.DecisionConfidence.getStats();
                    if (stats && stats.avgScore) {
                        return {
                            score: stats.avgScore,
                            reliability: stats.avgScore >= 90 ? 'HIGH' : 
                                       stats.avgScore >= 60 ? 'MEDIUM' : 'LOW'
                        };
                    }
                } catch (e) { /* ignore */ }
            }
            return null;
        }

        _getEvidence(decision) {
            if (decision && decision.evidence) return decision.evidence;
            if (decision && decision.context && decision.context.evidence) {
                return decision.context.evidence;
            }
            return [];
        }

        _getRisk(decision) {
            if (decision && decision.risk) return decision.risk;
            if (decision && decision.priority) {
                const riskMap = {
                    'CRITICAL': { level: 'HIGH', score: 90 },
                    'HIGH': { level: 'HIGH', score: 75 },
                    'NORMAL': { level: 'MEDIUM', score: 50 },
                    'LOW': { level: 'LOW', score: 25 }
                };
                return riskMap[decision.priority] || { level: 'UNKNOWN', score: 0 };
            }
            return null;
        }

        // ============================================================
        // Integrations (Chapter 8)
        // ============================================================

        _connectToReasoningEngine() {
            if (window.LawAIApp && window.LawAIApp.ReasoningEngine) {
                window.LawAIApp.ReasoningEngine.on('reasoningComplete', (reasoning) => {
                    if (this._config.autoGenerate) {
                        // Auto-generate explanation when reasoning completes
                        // (if we have a decision associated)
                    }
                });
                console.log('[DecisionExplanation] Connected to Reasoning Engine');
            }
        }

        _connectToConfidenceSystem() {
            if (window.LawAIApp && window.LawAIApp.DecisionConfidence) {
                console.log('[DecisionExplanation] Connected to Confidence System');
            }
        }

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                console.log('[DecisionExplanation] Connected to Recommendation Engine');
            }
        }

        _connectToAutonomousDashboard() {
            if (window.LawAIApp && window.LawAIApp.AutonomousDashboard) {
                console.log('[DecisionExplanation] Connected to Autonomous Dashboard');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'decision-explanation',
                        name: 'Decision Explanation',
                        category: 'cognitive',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[DecisionExplanation] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[DecisionExplanation] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new DecisionExplanation();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionExplanation = {
        Core: instance,

        // Public API
        initialize: (config) => instance.initialize(config),
        generate: (decision, options) => instance.generate(decision, options),

        getExplanation: (id) => instance.getExplanation(id),
        getExplanations: (limit) => instance.getExplanations(limit),
        getExplanationsByDecision: (decisionId) => instance.getExplanationsByDecision(decisionId),
        getLatestExplanation: () => instance.getLatestExplanation(),

        getHumanReadable: (id) => instance.getHumanReadable(id),
        getLatestHumanReadable: () => instance.getLatestHumanReadable(),

        getMarkdown: (id) => instance.getMarkdown(id),
        getLatestMarkdown: () => instance.getLatestMarkdown(),

        getStats: () => instance.getStats(),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[DecisionExplanation] Part 51.5 loaded ✅');
    console.log('[DecisionExplanation] Human-readable explanations available');

})();
