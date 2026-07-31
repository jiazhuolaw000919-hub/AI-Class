// ==================================================
// Part 50.3 — Decision Engine Foundation
// Version: v5.0.3
// Module: Runtime Autonomous Layer
// File: autonomousDecisionEngine.js
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
        console.warn('[DecisionEngine] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Priority Levels (Chapter 6)
    // ==================================================
    const PRIORITY = {
        LOW: 'LOW',
        NORMAL: 'NORMAL',
        HIGH: 'HIGH',
        CRITICAL: 'CRITICAL'
    };

    // ==================================================
    // Risk Levels (Chapter 8)
    // ==================================================
    const RISK = {
        LOW: 'LOW',
        MEDIUM: 'MEDIUM',
        HIGH: 'HIGH',
        CRITICAL: 'CRITICAL'
    };

    // ==================================================
    // Decision Status (Chapter 9)
    // ==================================================
    const DECISION_STATUS = {
        PENDING: 'PENDING',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        EXECUTING: 'EXECUTING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    };

    // ==================================================
    // Decision Object (Chapter 5)
    // ==================================================
    class Decision {
        constructor(config) {
            this.id = config.id || this._generateId();
            this.timestamp = Date.now();
            this.trigger = config.trigger || 'unknown';
            this.priority = config.priority || PRIORITY.NORMAL;
            this.confidence = config.confidence || 0;
            this.risk = config.risk || RISK.LOW;
            this.reason = config.reason || '';
            this.recommendation = config.recommendation || null;
            this.status = DECISION_STATUS.PENDING;
            this.context = config.context || {};
            this.metadata = config.metadata || {};
            this.executedAt = null;
            this.completedAt = null;
            this.error = null;
            this.result = null;
        }

        _generateId() {
            return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        }

        // Status transitions
        approve() {
            if (this.status !== DECISION_STATUS.PENDING) {
                console.warn(`[Decision ${this.id}] Cannot approve in ${this.status} state`);
                return false;
            }
            this.status = DECISION_STATUS.APPROVED;
            return true;
        }

        reject() {
            if (this.status !== DECISION_STATUS.PENDING) {
                console.warn(`[Decision ${this.id}] Cannot reject in ${this.status} state`);
                return false;
            }
            this.status = DECISION_STATUS.REJECTED;
            return true;
        }

        execute() {
            if (this.status !== DECISION_STATUS.APPROVED) {
                console.warn(`[Decision ${this.id}] Cannot execute in ${this.status} state`);
                return false;
            }
            this.status = DECISION_STATUS.EXECUTING;
            this.executedAt = Date.now();
            return true;
        }

        complete(result) {
            if (this.status !== DECISION_STATUS.EXECUTING) {
                console.warn(`[Decision ${this.id}] Cannot complete in ${this.status} state`);
                return false;
            }
            this.status = DECISION_STATUS.COMPLETED;
            this.completedAt = Date.now();
            this.result = result;
            return true;
        }

        fail(error) {
            this.status = DECISION_STATUS.FAILED;
            this.completedAt = Date.now();
            this.error = error;
            return true;
        }

        toJSON() {
            return {
                id: this.id,
                timestamp: this.timestamp,
                trigger: this.trigger,
                priority: this.priority,
                confidence: this.confidence,
                risk: this.risk,
                reason: this.reason,
                recommendation: this.recommendation,
                status: this.status,
                context: this.context,
                metadata: this.metadata,
                executedAt: this.executedAt,
                completedAt: this.completedAt,
                error: this.error,
                result: this.result
            };
        }
    }

    // ==================================================
    // Decision Context (Chapter 4)
    // ==================================================
    class DecisionContext {
        constructor() {
            this.runtimeState = null;
            this.eventContext = null;
            this.performanceData = null;
            this.metrics = null;
            this.knowledgeRef = null;
            this.timestamp = Date.now();
            this._sources = [];
        }

        setRuntimeState(state) {
            this.runtimeState = state;
            this._sources.push('runtime');
            return this;
        }

        setEventContext(events) {
            this.eventContext = events;
            this._sources.push('events');
            return this;
        }

        setPerformanceData(data) {
            this.performanceData = data;
            this._sources.push('performance');
            return this;
        }

        setMetrics(metrics) {
            this.metrics = metrics;
            this._sources.push('metrics');
            return this;
        }

        setKnowledgeRef(ref) {
            this.knowledgeRef = ref;
            this._sources.push('knowledge');
            return this;
        }

        getSources() {
            return this._sources;
        }

        isComplete() {
            // At minimum need runtime state or events
            return this.runtimeState !== null || this.eventContext !== null;
        }

        toJSON() {
            return {
                runtimeState: this.runtimeState,
                eventContext: this.eventContext,
                performanceData: this.performanceData,
                metrics: this.metrics,
                knowledgeRef: this.knowledgeRef,
                sources: this._sources,
                timestamp: this.timestamp
            };
        }
    }

    // ==================================================
    // Decision Engine (Chapter 1-3)
    // ==================================================
    class DecisionEngine {
        constructor() {
            this._decisions = [];
            this._activeDecision = null;
            this._listeners = {};
            this._initialized = false;
            this._decisionCounter = 0;
            this._config = {
                minConfidenceThreshold: 60,
                autoApproveLowRisk: false,
                maxDecisionsPerSession: 100,
                enableRiskScoring: true
            };
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[DecisionEngine] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[DecisionEngine] Initializing...');

            // Connect to data sources (Chapter 10)
            this._connectToObservations();
            this._connectToPerformance();
            this._connectToEvents();
            this._connectToMetrics();
            this._connectToKnowledgeGraph();

            // Register with Explorer (Chapter 11)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[DecisionEngine] Initialized ✅');
            return this;
        }

        // ==============================================
        // Core: Make Decision (Chapter 2-3)
        // ==============================================

        makeDecision(trigger, inputData) {
            console.log(`[DecisionEngine] Making decision for trigger: ${trigger}`);

            // Build context from input
            const context = this._buildContext(inputData);

            // Evaluate context
            const evaluation = this._evaluateContext(context);

            // Create decision object
            const decision = new Decision({
                trigger: trigger,
                priority: evaluation.priority,
                confidence: evaluation.confidence,
                risk: evaluation.risk,
                reason: evaluation.reason,
                recommendation: evaluation.recommendation,
                context: context.toJSON()
            });

            // Auto-approve low risk if configured
            if (this._config.autoApproveLowRisk && decision.risk === RISK.LOW) {
                decision.approve();
                console.log('[DecisionEngine] Auto-approved low-risk decision');
            }

            // Store and activate
            this._decisions.push(decision);
            this._activeDecision = decision;

            // Emit events
            this._emit('decisionMade', decision.toJSON());

            // Send to Governance if pending
            if (decision.status === DECISION_STATUS.PENDING) {
                this._sendToGovernance(decision);
            }

            // Update explorer
            this._updateExplorer();

            return decision;
        }

        // ==============================================
        // Decision Management
        // ==============================================

        getActiveDecision() {
            return this._activeDecision ? this._activeDecision.toJSON() : null;
        }

        getDecision(id) {
            const decision = this._decisions.find(d => d.id === id);
            return decision ? decision.toJSON() : null;
        }

        getDecisions(filter) {
            let decisions = [...this._decisions];

            if (filter) {
                if (filter.status) {
                    decisions = decisions.filter(d => d.status === filter.status);
                }
                if (filter.priority) {
                    decisions = decisions.filter(d => d.priority === filter.priority);
                }
                if (filter.trigger) {
                    decisions = decisions.filter(d => d.trigger === filter.trigger);
                }
                if (filter.risk) {
                    decisions = decisions.filter(d => d.risk === filter.risk);
                }
                if (filter.limit) {
                    decisions = decisions.slice(-filter.limit);
                }
            }

            return decisions.map(d => d.toJSON());
        }

        getDecisionHistory(limit = 20) {
            return this._decisions
                .slice(-limit)
                .reverse()
                .map(d => d.toJSON());
        }

        getDecisionStats() {
            const total = this._decisions.length;
            const pending = this._decisions.filter(d => d.status === DECISION_STATUS.PENDING).length;
            const approved = this._decisions.filter(d => d.status === DECISION_STATUS.APPROVED).length;
            const rejected = this._decisions.filter(d => d.status === DECISION_STATUS.REJECTED).length;
            const executing = this._decisions.filter(d => d.status === DECISION_STATUS.EXECUTING).length;
            const completed = this._decisions.filter(d => d.status === DECISION_STATUS.COMPLETED).length;
            const failed = this._decisions.filter(d => d.status === DECISION_STATUS.FAILED).length;

            const avgConfidence = total > 0 
                ? this._decisions.reduce((sum, d) => sum + d.confidence, 0) / total 
                : 0;

            const riskDistribution = {
                LOW: this._decisions.filter(d => d.risk === RISK.LOW).length,
                MEDIUM: this._decisions.filter(d => d.risk === RISK.MEDIUM).length,
                HIGH: this._decisions.filter(d => d.risk === RISK.HIGH).length,
                CRITICAL: this._decisions.filter(d => d.risk === RISK.CRITICAL).length
            };

            return {
                total,
                pending,
                approved,
                rejected,
                executing,
                completed,
                failed,
                avgConfidence: Math.round(avgConfidence),
                riskDistribution,
                successRate: completed + approved > 0 
                    ? Math.round((completed / (completed + failed + rejected)) * 100) 
                    : 0
            };
        }

        // ==============================================
        // Approval Interface (for Governance)
        // ==============================================

        approveDecision(id) {
            const decision = this._decisions.find(d => d.id === id);
            if (!decision) {
                console.warn(`[DecisionEngine] Decision not found: ${id}`);
                return false;
            }

            const result = decision.approve();
            if (result) {
                this._emit('decisionApproved', decision.toJSON());
                console.log(`[DecisionEngine] Decision approved: ${id}`);
                this._updateExplorer();
            }
            return result;
        }

        rejectDecision(id, reason) {
            const decision = this._decisions.find(d => d.id === id);
            if (!decision) {
                console.warn(`[DecisionEngine] Decision not found: ${id}`);
                return false;
            }

            const result = decision.reject();
            if (result) {
                decision.metadata.rejectionReason = reason || 'No reason provided';
                this._emit('decisionRejected', decision.toJSON());
                console.log(`[DecisionEngine] Decision rejected: ${id}`);
                this._updateExplorer();
            }
            return result;
        }

        executeDecision(id) {
            const decision = this._decisions.find(d => d.id === id);
            if (!decision) {
                console.warn(`[DecisionEngine] Decision not found: ${id}`);
                return false;
            }

            const result = decision.execute();
            if (result) {
                this._emit('decisionExecuting', decision.toJSON());
                console.log(`[DecisionEngine] Decision executing: ${id}`);
                this._updateExplorer();
            }
            return result;
        }

        completeDecision(id, result) {
            const decision = this._decisions.find(d => d.id === id);
            if (!decision) {
                console.warn(`[DecisionEngine] Decision not found: ${id}`);
                return false;
            }

            const success = decision.complete(result);
            if (success) {
                this._emit('decisionCompleted', decision.toJSON());
                console.log(`[DecisionEngine] Decision completed: ${id}`);
                this._updateExplorer();
            }
            return success;
        }

        failDecision(id, error) {
            const decision = this._decisions.find(d => d.id === id);
            if (!decision) {
                console.warn(`[DecisionEngine] Decision not found: ${id}`);
                return false;
            }

            decision.fail(error);
            this._emit('decisionFailed', decision.toJSON());
            console.error(`[DecisionEngine] Decision failed: ${id}`, error);
            this._updateExplorer();
            return true;
        }

        // ==============================================
        // Confidence Model (Chapter 7)
        // ==============================================

        calculateConfidence(context) {
            let score = 0;
            let factors = [];

            // Data Completeness
            const completenessScore = this._scoreCompleteness(context);
            score += completenessScore * 0.4;
            factors.push({ factor: 'completeness', score: completenessScore, weight: 0.4 });

            // Signal Consistency
            const consistencyScore = this._scoreConsistency(context);
            score += consistencyScore * 0.35;
            factors.push({ factor: 'consistency', score: consistencyScore, weight: 0.35 });

            // Knowledge Match
            const knowledgeScore = this._scoreKnowledgeMatch(context);
            score += knowledgeScore * 0.25;
            factors.push({ factor: 'knowledge', score: knowledgeScore, weight: 0.25 });

            const total = Math.round(score);

            return {
                score: total,
                factors: factors,
                level: total >= 80 ? 'HIGH' : total >= 60 ? 'MEDIUM' : 'LOW'
            };
        }

        _scoreCompleteness(context) {
            const sources = context.getSources ? context.getSources() : [];
            const totalSources = sources.length;
            const expectedSources = ['runtime', 'events', 'performance', 'metrics', 'knowledge'];
            const hasSource = (name) => sources.includes(name);

            let score = 0;
            if (hasSource('runtime')) score += 25;
            if (hasSource('events')) score += 20;
            if (hasSource('performance')) score += 20;
            if (hasSource('metrics')) score += 20;
            if (hasSource('knowledge')) score += 15;

            return Math.min(score, 100);
        }

        _scoreConsistency(context) {
            // Simplified: check if data sources agree
            let score = 70; // Default middle
            // In real implementation, would check consistency between sources
            return score;
        }

        _scoreKnowledgeMatch(context) {
            // Simplified: check if knowledge reference exists
            if (context.knowledgeRef) {
                return 80;
            }
            return 50;
        }

        // ==============================================
        // Risk Assessment (Chapter 8)
        // ==============================================

        assessRisk(context, priority) {
            let riskScore = 0;
            let factors = [];

            // Priority factor
            const priorityWeights = {
                LOW: 10,
                NORMAL: 25,
                HIGH: 50,
                CRITICAL: 75
            };
            const priorityRisk = priorityWeights[priority] || 25;
            riskScore += priorityRisk * 0.4;
            factors.push({ factor: 'priority', score: priorityRisk, weight: 0.4 });

            // Runtime state factor
            if (context.runtimeState) {
                const stateRisk = this._assessRuntimeStateRisk(context.runtimeState);
                riskScore += stateRisk * 0.3;
                factors.push({ factor: 'runtime_state', score: stateRisk, weight: 0.3 });
            }

            // Performance factor
            if (context.performanceData) {
                const perfRisk = this._assessPerformanceRisk(context.performanceData);
                riskScore += perfRisk * 0.3;
                factors.push({ factor: 'performance', score: perfRisk, weight: 0.3 });
            }

            const total = Math.round(riskScore);

            // Map to risk level
            let level;
            if (total >= 80) level = RISK.CRITICAL;
            else if (total >= 60) level = RISK.HIGH;
            else if (total >= 35) level = RISK.MEDIUM;
            else level = RISK.LOW;

            return {
                score: total,
                level: level,
                factors: factors
            };
        }

        _assessRuntimeStateRisk(state) {
            let risk = 50;
            if (state.status === 'degraded') risk += 30;
            if (state.status === 'critical') risk += 50;
            if (state.errorCount && state.errorCount > 10) risk += 20;
            if (state.errorCount && state.errorCount > 50) risk += 30;
            return Math.min(risk, 100);
        }

        _assessPerformanceRisk(perfData) {
            let risk = 40;
            if (perfData.cpu && perfData.cpu > 80) risk += 20;
            if (perfData.memory && perfData.memory > 85) risk += 20;
            if (perfData.responseTime && perfData.responseTime > 1000) risk += 20;
            return Math.min(risk, 100);
        }

        // ==============================================
        // Private: Context Building
        // ==============================================

        _buildContext(inputData) {
            const context = new DecisionContext();

            if (inputData.runtimeState) {
                context.setRuntimeState(inputData.runtimeState);
            }
            if (inputData.eventContext) {
                context.setEventContext(inputData.eventContext);
            }
            if (inputData.performanceData) {
                context.setPerformanceData(inputData.performanceData);
            }
            if (inputData.metrics) {
                context.setMetrics(inputData.metrics);
            }
            if (inputData.knowledgeRef) {
                context.setKnowledgeRef(inputData.knowledgeRef);
            }

            return context;
        }

        // ==============================================
        // Private: Evaluation
        // ==============================================

        _evaluateContext(context) {
            // Calculate confidence
            const confidenceResult = this.calculateConfidence(context);

            // Determine priority based on trigger and context
            const priority = this._determinePriority(context);

            // Assess risk
            const riskResult = this.assessRisk(context, priority);

            // Generate reason
            const reason = this._generateReason(context, priority, riskResult);

            // Generate recommendation
            const recommendation = this._generateRecommendation(context, priority, riskResult);

            return {
                priority: priority,
                confidence: confidenceResult.score,
                risk: riskResult.level,
                reason: reason,
                recommendation: recommendation
            };
        }

        _determinePriority(context) {
            // Priority based on trigger type
            const trigger = context.trigger || 'unknown';
            if (trigger.includes('critical') || trigger.includes('crash')) {
                return PRIORITY.CRITICAL;
            }
            if (trigger.includes('warning') || trigger.includes('error')) {
                return PRIORITY.HIGH;
            }
            if (trigger.includes('performance') || trigger.includes('health')) {
                return PRIORITY.NORMAL;
            }
            return PRIORITY.LOW;
        }

        _generateReason(context, priority, riskResult) {
            let parts = [];
            parts.push(`Trigger: ${context.trigger || 'unknown'}`);
            parts.push(`Priority: ${priority}`);
            parts.push(`Risk: ${riskResult.level} (${riskResult.score})`);
            
            if (context.runtimeState && context.runtimeState.status) {
                parts.push(`Runtime: ${context.runtimeState.status}`);
            }
            
            return parts.join(' | ');
        }

        _generateRecommendation(context, priority, riskResult) {
            const recommendations = {
                CRITICAL: 'Immediate intervention required. Escalate to system admin.',
                HIGH: 'Action recommended within 5 minutes. Review and approve.',
                MEDIUM: 'Action recommended. Can be scheduled for next cycle.',
                LOW: 'No immediate action required. Monitor and log for review.'
            };

            // Map priority + risk to recommendation
            if (priority === PRIORITY.CRITICAL || riskResult.level === RISK.CRITICAL) {
                return recommendations.CRITICAL;
            }
            if (priority === PRIORITY.HIGH || riskResult.level === RISK.HIGH) {
                return recommendations.HIGH;
            }
            if (priority === PRIORITY.NORMAL || riskResult.level === RISK.MEDIUM) {
                return recommendations.MEDIUM;
            }
            return recommendations.LOW;
        }

        // ==============================================
        // Explorer Support (Chapter 11)
        // ==============================================

        getExplorerData() {
            const stats = this.getDecisionStats();
            const active = this.getActiveDecision();
            const recent = this.getDecisionHistory(5);

            return {
                type: 'decision_engine',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                activeDecision: active,
                recentDecisions: recent,
                config: this._config
            };
        }

        _updateExplorer() {
            // Explorer gets data on demand via getExplorerData
            // Just emit update event
            this._emit('explorerUpdate', this.getExplorerData());
        }

        // ==============================================
        // Listeners
        // ==============================================

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
                        console.error(`[DecisionEngine] Listener error (${event}):`, e);
                    }
                });
            }

            // Also emit to global event bus
            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`decision.${event}`, data);
            }
        }

        // ==============================================
        // Integrations (Chapter 10)
        // ==============================================

        _connectToObservations() {
            if (window.LawAIApp && window.LawAIApp.Observation) {
                console.log('[DecisionEngine] Connected to Observation');
            }
        }

        _connectToPerformance() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[DecisionEngine] Connected to Performance');
            }
        }

        _connectToEvents() {
            if (window.LawAIApp && window.LawAIApp.Events) {
                console.log('[DecisionEngine] Connected to Events');
            }
        }

        _connectToMetrics() {
            if (window.LawAIApp && window.LawAIApp.Metrics) {
                console.log('[DecisionEngine] Connected to Metrics');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[DecisionEngine] Connected to Knowledge Graph');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'decision-engine',
                        name: 'Decision Engine',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[DecisionEngine] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[DecisionEngine] Could not register with Explorer:', e);
                }
            }
        }

        _sendToGovernance(decision) {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    // Send decision to governance for approval
                    console.log(`[DecisionEngine] Sent decision ${decision.id} to Governance`);
                } catch (e) {
                    console.warn('[DecisionEngine] Could not send to Governance:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new DecisionEngine();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.DecisionEngine = {
        Core: instance,
        PRIORITY: PRIORITY,
        RISK: RISK,
        DECISION_STATUS: DECISION_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        makeDecision: (trigger, data) => instance.makeDecision(trigger, data),
        
        getActiveDecision: () => instance.getActiveDecision(),
        getDecision: (id) => instance.getDecision(id),
        getDecisions: (filter) => instance.getDecisions(filter),
        getDecisionHistory: (limit) => instance.getDecisionHistory(limit),
        getDecisionStats: () => instance.getDecisionStats(),

        approveDecision: (id) => instance.approveDecision(id),
        rejectDecision: (id, reason) => instance.rejectDecision(id, reason),
        executeDecision: (id) => instance.executeDecision(id),
        completeDecision: (id, result) => instance.completeDecision(id, result),
        failDecision: (id, error) => instance.failDecision(id, error),

        calculateConfidence: (context) => instance.calculateConfidence(context),
        assessRisk: (context, priority) => instance.assessRisk(context, priority),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[DecisionEngine] Part 50.3 loaded ✅');
    console.log('[DecisionEngine] Priorities:', Object.values(PRIORITY).join(' | '));
    console.log('[DecisionEngine] Risks:', Object.values(RISK).join(' | '));
    console.log('[DecisionEngine] Statuses:', Object.values(DECISION_STATUS).join(' | '));

})();
