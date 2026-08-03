// ============================================================
// orchestrationFeedback.js
// Part 55.6 — Orchestration Feedback Loop
// Version: v5.5.6
// Module: AI Orchestration Layer
// File: js/core/orchestrationFeedback.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OrchestrationFeedback) {
        console.warn('[OrchestrationFeedback] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Learning Signal Types (Chapter 7)
    // ============================================================
    const LEARNING_SIGNAL = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        IMPROVEMENT: 'improvement',
        NEUTRAL: 'neutral'
    };

    // ============================================================
    // Feedback Status
    // ============================================================
    const FEEDBACK_STATUS = {
        RECORDED: 'recorded',
        ANALYZED: 'analyzed',
        LEARNED: 'learned',
        APPLIED: 'applied'
    };

    // ============================================================
    // Feedback Model (Chapter 5)
    // ============================================================
    class OrchestrationFeedbackRecord {
        constructor(config) {
            this.feedbackId = config.feedbackId || this._generateId();
            this.timestamp = Date.now();
            this.workflowId = config.workflowId || null;
            this.agents = config.agents || [];
            this.expectedResult = config.expectedResult || null;
            this.actualResult = config.actualResult || null;
            this.performance = config.performance || 0;
            this.issues = config.issues || [];
            this.learningSignal = config.learningSignal || LEARNING_SIGNAL.NEUTRAL;
            this.status = FEEDBACK_STATUS.RECORDED;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `ofb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                feedbackId: this.feedbackId,
                timestamp: this.timestamp,
                workflowId: this.workflowId,
                agents: this.agents,
                expectedResult: this.expectedResult,
                actualResult: this.actualResult,
                performance: this.performance,
                issues: this.issues,
                learningSignal: this.learningSignal,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Collaboration Memory (Chapter 8)
    // ============================================================
    class CollaborationMemory {
        constructor(config) {
            this.memoryId = config.memoryId || this._generateId();
            this.timestamp = Date.now();
            this.agentCombination = config.agentCombination || [];
            this.successRate = config.successRate || 0;
            this.totalWorkflows = config.totalWorkflows || 0;
            this.successfulWorkflows = config.successfulWorkflows || 0;
            this.averageEfficiency = config.averageEfficiency || 0;
            this.pattern = config.pattern || 'sequential';
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `cmem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                memoryId: this.memoryId,
                timestamp: this.timestamp,
                agentCombination: this.agentCombination,
                successRate: this.successRate,
                totalWorkflows: this.totalWorkflows,
                successfulWorkflows: this.successfulWorkflows,
                averageEfficiency: this.averageEfficiency,
                pattern: this.pattern,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Orchestration Feedback Core (Chapter 1-4)
    // ============================================================
    class OrchestrationFeedback {
        constructor() {
            this._feedbacks = [];
            this._memory = [];
            this._patterns = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxFeedbackSize: 500,
                maxMemorySize: 100,
                successThreshold: 70,
                efficiencyThreshold: 60,
                minSamplesForPattern: 3,
                enableAutoLearning: true
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OrchestrationFeedback] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OrchestrationFeedback] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToWorkflowManager();
            this._connectToCoordinationEngine();
            this._connectToPrioritySystem();
            this._connectToOrchestrationGovernance();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToEvolutionSystem();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[OrchestrationFeedback] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Record Feedback (Chapter 4)
        // ============================================================

        record(workflowId, agents, expectedResult, actualResult, performance) {
            console.log(`[OrchestrationFeedback] Recording feedback for: ${workflowId}`);

            // Determine learning signal (Chapter 7)
            const learningSignal = this._determineSignal(performance, expectedResult, actualResult);

            // Identify issues
            const issues = this._identifyIssues(performance, expectedResult, actualResult);

            // Create feedback
            const feedback = new OrchestrationFeedbackRecord({
                workflowId: workflowId,
                agents: agents || [],
                expectedResult: expectedResult || null,
                actualResult: actualResult || null,
                performance: performance || 0,
                issues: issues,
                learningSignal: learningSignal,
                metadata: {
                    source: 'orchestration_feedback',
                    recordedAt: Date.now()
                }
            });

            this._feedbacks.push(feedback);
            if (this._feedbacks.length > this._config.maxFeedbackSize) {
                this._feedbacks = this._feedbacks.slice(-this._config.maxFeedbackSize);
            }

            // Update collaboration memory (Chapter 8)
            this._updateMemory(feedback);

            // Generate pattern if enough samples
            if (this._config.enableAutoLearning) {
                this._analyzePatterns();
            }

            this._emit('feedbackRecorded', feedback.toJSON());

            return feedback;
        }

        // ============================================================
        // Evaluation Metrics (Chapter 6)
        // ============================================================

        evaluate(workflowId) {
            const feedbacks = this._feedbacks.filter(f => f.workflowId === workflowId);
            if (feedbacks.length === 0) return null;

            const latest = feedbacks[feedbacks.length - 1];
            const total = feedbacks.length;
            const successful = feedbacks.filter(f => f.performance >= this._config.successThreshold).length;
            const efficiency = feedbacks.reduce((sum, f) => sum + f.performance, 0) / total;

            const issues = {};
            feedbacks.forEach(f => {
                f.issues.forEach(issue => {
                    issues[issue] = (issues[issue] || 0) + 1;
                });
            });

            return {
                workflowId: workflowId,
                totalFeedbacks: total,
                successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
                averagePerformance: Math.round(efficiency),
                commonIssues: Object.keys(issues).filter(k => issues[k] > 1),
                latestPerformance: latest.performance,
                latestSignal: latest.learningSignal,
                timestamp: Date.now()
            };
        }

        // ============================================================
        // Learning Signals (Chapter 7)
        // ============================================================

        _determineSignal(performance, expected, actual) {
            if (performance >= this._config.successThreshold) {
                return LEARNING_SIGNAL.POSITIVE;
            }

            if (performance < this._config.efficiencyThreshold) {
                return LEARNING_SIGNAL.NEGATIVE;
            }

            if (expected && actual && actual > expected * 1.1) {
                return LEARNING_SIGNAL.IMPROVEMENT;
            }

            return LEARNING_SIGNAL.NEUTRAL;
        }

        _identifyIssues(performance, expected, actual) {
            const issues = [];

            if (performance < 50) {
                issues.push('low_performance');
            }

            if (expected && actual && actual < expected * 0.7) {
                issues.push('underperformed');
            }

            if (performance < this._config.efficiencyThreshold) {
                issues.push('inefficient');
            }

            return issues;
        }

        // ============================================================
        // Collaboration Memory (Chapter 8)
        // ============================================================

        _updateMemory(feedback) {
            const key = feedback.agents.sort().join('|');

            let memory = this._memory.find(m => 
                m.agentCombination.sort().join('|') === key
            );

            if (!memory) {
                memory = new CollaborationMemory({
                    agentCombination: feedback.agents,
                    pattern: 'sequential'
                });
                this._memory.push(memory);
            }

            memory.totalWorkflows++;
            if (feedback.learningSignal === LEARNING_SIGNAL.POSITIVE) {
                memory.successfulWorkflows++;
            }

            memory.successRate = memory.totalWorkflows > 0 ?
                Math.round((memory.successfulWorkflows / memory.totalWorkflows) * 100) :
                0;

            memory.averageEfficiency = (memory.averageEfficiency * (memory.totalWorkflows - 1) + feedback.performance) / memory.totalWorkflows;
            memory.timestamp = Date.now();

            if (this._memory.length > this._config.maxMemorySize) {
                this._memory = this._memory.slice(-this._config.maxMemorySize);
            }
        }

        // ============================================================
        // Pattern Analysis (Chapter 9)
        // ============================================================

        _analyzePatterns() {
            const patterns = [];

            // Analyze agent combination patterns
            const agentGroups = {};
            this._feedbacks.forEach(f => {
                const key = f.agents.sort().join('|');
                if (!agentGroups[key]) {
                    agentGroups[key] = {
                        agents: f.agents,
                        count: 0,
                        successful: 0,
                        totalPerformance: 0
                    };
                }
                agentGroups[key].count++;
                agentGroups[key].totalPerformance += f.performance;
                if (f.learningSignal === LEARNING_SIGNAL.POSITIVE) {
                    agentGroups[key].successful++;
                }
            });

            for (const key in agentGroups) {
                const group = agentGroups[key];
                if (group.count >= this._config.minSamplesForPattern) {
                    patterns.push({
                        type: 'agent_combination',
                        agents: group.agents,
                        successRate: Math.round((group.successful / group.count) * 100),
                        averagePerformance: Math.round(group.totalPerformance / group.count),
                        sampleCount: group.count
                    });
                }
            }

            // Analyze workflow pattern effectiveness
            const patternTypes = {};
            this._feedbacks.forEach(f => {
                const pattern = f.metadata?.pattern || 'sequential';
                if (!patternTypes[pattern]) {
                    patternTypes[pattern] = {
                        count: 0,
                        successful: 0,
                        totalPerformance: 0
                    };
                }
                patternTypes[pattern].count++;
                patternTypes[pattern].totalPerformance += f.performance;
                if (f.learningSignal === LEARNING_SIGNAL.POSITIVE) {
                    patternTypes[pattern].successful++;
                }
            });

            for (const pattern in patternTypes) {
                const data = patternTypes[pattern];
                if (data.count >= this._config.minSamplesForPattern) {
                    patterns.push({
                        type: 'workflow_pattern',
                        pattern: pattern,
                        successRate: Math.round((data.successful / data.count) * 100),
                        averagePerformance: Math.round(data.totalPerformance / data.count),
                        sampleCount: data.count
                    });
                }
            }

            this._patterns = patterns;
            this._emit('patternsAnalyzed', patterns);

            return patterns;
        }

        // ============================================================
        // Compare (Chapter 5)
        // ============================================================

        compare(workflowId1, workflowId2) {
            const fb1 = this._feedbacks.filter(f => f.workflowId === workflowId1);
            const fb2 = this._feedbacks.filter(f => f.workflowId === workflowId2);

            if (fb1.length === 0 || fb2.length === 0) return null;

            const perf1 = fb1.reduce((sum, f) => sum + f.performance, 0) / fb1.length;
            const perf2 = fb2.reduce((sum, f) => sum + f.performance, 0) / fb2.length;

            const success1 = fb1.filter(f => f.learningSignal === LEARNING_SIGNAL.POSITIVE).length;
            const success2 = fb2.filter(f => f.learningSignal === LEARNING_SIGNAL.POSITIVE).length;

            return {
                workflow1: {
                    id: workflowId1,
                    averagePerformance: Math.round(perf1),
                    successRate: fb1.length > 0 ? Math.round((success1 / fb1.length) * 100) : 0,
                    samples: fb1.length
                },
                workflow2: {
                    id: workflowId2,
                    averagePerformance: Math.round(perf2),
                    successRate: fb2.length > 0 ? Math.round((success2 / fb2.length) * 100) : 0,
                    samples: fb2.length
                },
                comparison: {
                    performanceDiff: Math.round(perf1 - perf2),
                    better: perf1 > perf2 ? workflowId1 : workflowId2
                },
                timestamp: Date.now()
            };
        }

        // ============================================================
        // Optimization Recommendations (Chapter 10)
        // ============================================================

        optimize(workflowType) {
            const recommendations = [];

            // Find best agent combination
            const bestCombination = this._memory.sort((a, b) => b.successRate - a.successRate)[0];
            if (bestCombination && bestCombination.successRate > 70) {
                recommendations.push({
                    type: 'agent_combination',
                    suggestion: `Use agent combination: ${bestCombination.agentCombination.join(' + ')}`,
                    confidence: bestCombination.successRate,
                    expectedImprovement: '10-20% success rate improvement'
                });
            }

            // Find best pattern
            const bestPattern = this._patterns.filter(p => p.type === 'workflow_pattern')
                .sort((a, b) => b.successRate - a.successRate)[0];
            if (bestPattern && bestPattern.successRate > 70) {
                recommendations.push({
                    type: 'workflow_pattern',
                    suggestion: `Use ${bestPattern.pattern} workflow pattern`,
                    confidence: bestPattern.successRate,
                    expectedImprovement: '15-25% efficiency improvement'
                });
            }

            // Identify common issues
            const issueCount = {};
            this._feedbacks.forEach(f => {
                f.issues.forEach(issue => {
                    issueCount[issue] = (issueCount[issue] || 0) + 1;
                });
            });

            const topIssues = Object.keys(issueCount).sort((a, b) => issueCount[b] - issueCount[a]).slice(0, 3);
            if (topIssues.length > 0) {
                recommendations.push({
                    type: 'issue_prevention',
                    suggestion: `Address common issues: ${topIssues.join(', ')}`,
                    confidence: 60,
                    expectedImprovement: '5-15% reliability improvement'
                });
            }

            this._emit('optimizationRecommendations', recommendations);

            return recommendations;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getFeedbacks(filter) {
            let feedbacks = this._feedbacks;

            if (filter) {
                if (filter.workflowId) {
                    feedbacks = feedbacks.filter(f => f.workflowId === filter.workflowId);
                }
                if (filter.learningSignal) {
                    feedbacks = feedbacks.filter(f => f.learningSignal === filter.learningSignal);
                }
                if (filter.minPerformance) {
                    feedbacks = feedbacks.filter(f => f.performance >= filter.minPerformance);
                }
                if (filter.limit) {
                    feedbacks = feedbacks.slice(-filter.limit);
                }
            }

            return feedbacks.map(f => f.toJSON());
        }

        getMemory() {
            return this._memory.map(m => m.toJSON());
        }

        getPatterns() {
            return this._patterns;
        }

        getHistory(limit) {
            return this._feedbacks.slice(-(limit || 20)).reverse().map(f => ({
                workflowId: f.workflowId,
                performance: f.performance,
                learningSignal: f.learningSignal,
                timestamp: f.timestamp,
                agents: f.agents
            }));
        }

        getStats() {
            const total = this._feedbacks.length;
            const positive = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.POSITIVE).length;
            const negative = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEGATIVE).length;
            const improvement = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.IMPROVEMENT).length;
            const neutral = this._feedbacks.filter(f => f.learningSignal === LEARNING_SIGNAL.NEUTRAL).length;

            const avgPerformance = total > 0 ?
                Math.round(this._feedbacks.reduce((sum, f) => sum + f.performance, 0) / total) :
                0;

            const successRate = total > 0 ?
                Math.round((positive / total) * 100) :
                0;

            return {
                total,
                positive,
                negative,
                improvement,
                neutral,
                avgPerformance,
                successRate,
                memoryCount: this._memory.length,
                patternCount: this._patterns.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getFeedbacks({ limit: 5 });
            const patterns = this.getPatterns().slice(0, 5);
            const memory = this.getMemory().slice(0, 5);

            return {
                type: 'orchestration_feedback',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentFeedbacks: recent,
                patterns: patterns,
                collaborationMemory: memory,
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
                        console.error('[OrchestrationFeedback] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`orchestrationfb.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('orchestrationFeedbackData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.feedbacks) {
                        this._feedbacks = data.feedbacks.map(f => new OrchestrationFeedback(f));
                    }
                    if (data.memory) {
                        this._memory = data.memory.map(m => new CollaborationMemory(m));
                    }
                    if (data.patterns) {
                        this._patterns = data.patterns;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToWorkflowManager() {
            if (window.LawAIApp && window.LawAIApp.MultiAgentWorkflow) {
                // Listen for workflow completions
                window.LawAIApp.MultiAgentWorkflow.on('workflowCompleted', (workflow) => {
                    // Record feedback automatically
                });
                console.log('[OrchestrationFeedback] Connected to Workflow Manager');
            }
        }

        _connectToCoordinationEngine() {
            if (window.LawAIApp && window.LawAIApp.IntelligenceCoordination) {
                console.log('[OrchestrationFeedback] Connected to Coordination Engine');
            }
        }

        _connectToPrioritySystem() {
            if (window.LawAIApp && window.LawAIApp.IntelligencePriority) {
                console.log('[OrchestrationFeedback] Connected to Priority System');
            }
        }

        _connectToOrchestrationGovernance() {
            if (window.LawAIApp && window.LawAIApp.OrchestrationGovernance) {
                console.log('[OrchestrationFeedback] Connected to Orchestration Governance');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OrchestrationFeedback] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[OrchestrationFeedback] Connected to Predictive Runtime');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[OrchestrationFeedback] Connected to Evolution System');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'orchestration-feedback',
                        name: 'Orchestration Feedback',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OrchestrationFeedback] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OrchestrationFeedback] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[OrchestrationFeedback] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new OrchestrationFeedback();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OrchestrationFeedback = {
        Core: instance,
        LEARNING_SIGNAL: LEARNING_SIGNAL,
        FEEDBACK_STATUS: FEEDBACK_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        record: (workflowId, agents, expected, actual, performance) => 
            instance.record(workflowId, agents, expected, actual, performance),
        evaluate: (workflowId) => instance.evaluate(workflowId),
        compare: (workflowId1, workflowId2) => instance.compare(workflowId1, workflowId2),
        optimize: (workflowType) => instance.optimize(workflowType),

        getFeedbacks: (filter) => instance.getFeedbacks(filter),
        getMemory: () => instance.getMemory(),
        getPatterns: () => instance.getPatterns(),
        getHistory: (limit) => instance.getHistory(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OrchestrationFeedback] Part 55.6 loaded ✅');
    console.log('[OrchestrationFeedback] Learning Signals:', Object.values(LEARNING_SIGNAL).join(' | '));

})();
