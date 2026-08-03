// ============================================================
// runtimeAdaptation.js
// Part 54.2 — Runtime Adaptation Engine
// Version: v5.4.2
// Module: Runtime Evolution System
// File: js/core/runtimeAdaptation.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RuntimeAdaptation) {
        console.warn('[RuntimeAdaptation] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Adaptation Categories (Chapter 6)
    // ============================================================
    const ADAPTATION_CATEGORY = {
        PERFORMANCE: 'performance',
        RESOURCE: 'resource',
        ARCHITECTURE: 'architecture',
        WORKFLOW: 'workflow',
        CAPABILITY: 'capability',
        KNOWLEDGE: 'knowledge'
    };

    // ============================================================
    // Adaptation Status
    // ============================================================
    const ADAPTATION_STATUS = {
        DETECTED: 'DETECTED',
        ANALYZING: 'ANALYZING',
        STRATEGY_READY: 'strategy_ready',
        UNDER_REVIEW: 'under_review',
        APPROVED: 'approved',
        IMPLEMENTED: 'implemented',
        REJECTED: 'rejected',
        DEFERRED: 'deferred'
    };

    // ============================================================
    // Change Types (Chapter 8)
    // ============================================================
    const CHANGE_TYPE = {
        GROWTH: 'growth',
        USAGE_INCREASE: 'usage_increase',
        PERFORMANCE_SHIFT: 'performance_shift',
        CAPABILITY_REQUIREMENT: 'capability_requirement',
        ARCHITECTURE_PRESSURE: 'architecture_pressure',
        BEHAVIOR_CHANGE: 'behavior_change'
    };

    // ============================================================
    // Adaptation Context Model (Chapter 7)
    // ============================================================
    class AdaptationContext {
        constructor(config) {
            this.adaptationId = config.adaptationId || this._generateId();
            this.timestamp = Date.now();
            this.trigger = config.trigger || 'unknown';
            this.currentState = config.currentState || null;
            this.changeDetected = config.changeDetected || null;
            this.impact = config.impact || null;
            this.strategy = config.strategy || null;
            this.confidence = config.confidence || 0;
            this.status = ADAPTATION_STATUS.DETECTED;
            this.category = config.category || ADAPTATION_CATEGORY.PERFORMANCE;
            this.evidence = config.evidence || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `adap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                adaptationId: this.adaptationId,
                timestamp: this.timestamp,
                trigger: this.trigger,
                currentState: this.currentState,
                changeDetected: this.changeDetected,
                impact: this.impact,
                strategy: this.strategy,
                confidence: this.confidence,
                status: this.status,
                category: this.category,
                evidence: this.evidence,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Adaptation Strategy (Chapter 9)
    // ============================================================
    class AdaptationStrategy {
        constructor(config) {
            this.strategyId = config.strategyId || this._generateId();
            this.timestamp = Date.now();
            this.adaptationId = config.adaptationId || null;
            this.objective = config.objective || '';
            this.affectedArea = config.affectedArea || 'unknown';
            this.expectedBenefit = config.expectedBenefit || null;
            this.risk = config.risk || 'MEDIUM';
            this.priority = config.priority || 'MEDIUM';
            this.steps = config.steps || [];
            this.status = ADAPTATION_STATUS.STRATEGY_READY;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `strat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                strategyId: this.strategyId,
                timestamp: this.timestamp,
                adaptationId: this.adaptationId,
                objective: this.objective,
                affectedArea: this.affectedArea,
                expectedBenefit: this.expectedBenefit,
                risk: this.risk,
                priority: this.priority,
                steps: this.steps,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Runtime Adaptation Engine Core (Chapter 1-4)
    // ============================================================
    class RuntimeAdaptation {
        constructor() {
            this._contexts = [];
            this._strategies = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 200,
                minConfidenceThreshold: 40,
                enableAutoDetection: true,
                detectionInterval: 60000,
                criticalThreshold: 80,
                highThreshold: 60,
                mediumThreshold: 40
            };
            this._detectors = this._initDetectors();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RuntimeAdaptation] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RuntimeAdaptation] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToEvolutionIntelligence();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveLayer();
            this._connectToOptimizationLayer();
            this._connectToKnowledgeGraph();
            this._connectToGovernance();
            this._connectToRuntimeRegistry();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            // Start auto-detection
            if (this._config.enableAutoDetection) {
                this._startAutoDetection();
            }

            this._initialized = true;
            console.log('[RuntimeAdaptation] Initialized ✅');
            return this;
        }

        // ============================================================
        // Detectors (Chapter 5, 8)
        // ============================================================

        _initDetectors() {
            return {
                [ADAPTATION_CATEGORY.PERFORMANCE]: {
                    name: 'performance_detector',
                    detect: (options) => this._detectPerformanceChange(options)
                },
                [ADAPTATION_CATEGORY.RESOURCE]: {
                    name: 'resource_detector',
                    detect: (options) => this._detectResourceChange(options)
                },
                [ADAPTATION_CATEGORY.ARCHITECTURE]: {
                    name: 'architecture_detector',
                    detect: (options) => this._detectArchitectureChange(options)
                },
                [ADAPTATION_CATEGORY.WORKFLOW]: {
                    name: 'workflow_detector',
                    detect: (options) => this._detectWorkflowChange(options)
                },
                [ADAPTATION_CATEGORY.CAPABILITY]: {
                    name: 'capability_detector',
                    detect: (options) => this._detectCapabilityChange(options)
                },
                [ADAPTATION_CATEGORY.KNOWLEDGE]: {
                    name: 'knowledge_detector',
                    detect: (options) => this._detectKnowledgeChange(options)
                }
            };
        }

        // ============================================================
        // Core: Detect (Chapter 3-4)
        // ============================================================

        detect(categories, options) {
            console.log('[RuntimeAdaptation] Detecting changes...');

            const targetCategories = categories || Object.values(ADAPTATION_CATEGORY);
            const contexts = [];

            targetCategories.forEach(category => {
                const detector = this._detectors[category];
                if (!detector) {
                    console.warn(`[RuntimeAdaptation] No detector for: ${category}`);
                    return;
                }

                try {
                    const result = detector.detect(options);
                    if (result && result.contexts) {
                        result.contexts.forEach(ctxData => {
                            const context = new AdaptationContext({
                                trigger: ctxData.trigger || 'system_change',
                                currentState: ctxData.currentState || null,
                                changeDetected: ctxData.changeDetected || null,
                                impact: ctxData.impact || null,
                                confidence: ctxData.confidence || 60,
                                category: category,
                                evidence: ctxData.evidence || [],
                                metadata: {
                                    source: detector.name,
                                    detectedAt: Date.now(),
                                    changeType: ctxData.changeType || 'unknown'
                                }
                            });

                            // Generate strategy (Chapter 9)
                            const strategy = this._generateStrategy(context, ctxData);

                            if (strategy) {
                                context.strategy = strategy.toJSON();
                                this._strategies.push(strategy);
                            }

                            contexts.push(context);
                            this._contexts.push(context);
                        });
                    }
                } catch (e) {
                    console.error(`[RuntimeAdaptation] Detector error (${category}):`, e);
                }
            });

            // Enforce history limit
            if (this._contexts.length > this._config.maxHistorySize) {
                this._contexts = this._contexts.slice(-this._config.maxHistorySize);
            }

            this._emit('detectionComplete', {
                contexts: contexts.map(c => c.toJSON()),
                count: contexts.length,
                timestamp: Date.now()
            });

            return {
                contexts: contexts,
                strategies: this._strategies.slice(-contexts.length)
            };
        }

        detectAll(options) {
            return this.detect(null, options);
        }

        // ============================================================
        // Detector: Performance (Chapter 5, 8)
        // ============================================================

        _detectPerformanceChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.Performance) {
                    const report = window.LawAIApp.Performance.report ?
                        window.LawAIApp.Performance.report() : null;

                    if (report) {
                        const cpu = report.cpu || 0;
                        const memory = report.memory || 0;
                        const responseTime = report.responseTime || 0;

                        // Detect performance shift
                        if (cpu > 70) {
                            contexts.push({
                                trigger: 'high_cpu_usage',
                                currentState: { cpu: cpu },
                                changeDetected: {
                                    type: CHANGE_TYPE.PERFORMANCE_SHIFT,
                                    description: `CPU usage increased to ${cpu}%`,
                                    severity: cpu > 85 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Performance degradation if trend continues',
                                confidence: 70,
                                evidence: [`CPU: ${cpu}%`],
                                changeType: CHANGE_TYPE.PERFORMANCE_SHIFT
                            });
                        }

                        if (memory > 75) {
                            contexts.push({
                                trigger: 'high_memory_usage',
                                currentState: { memory: memory },
                                changeDetected: {
                                    type: CHANGE_TYPE.PERFORMANCE_SHIFT,
                                    description: `Memory usage at ${memory}%`,
                                    severity: memory > 90 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Memory pressure affecting performance',
                                confidence: 65,
                                evidence: [`Memory: ${memory}%`],
                                changeType: CHANGE_TYPE.PERFORMANCE_SHIFT
                            });
                        }

                        if (responseTime > 800) {
                            contexts.push({
                                trigger: 'response_time_increase',
                                currentState: { responseTime: responseTime },
                                changeDetected: {
                                    type: CHANGE_TYPE.PERFORMANCE_SHIFT,
                                    description: `Response time at ${responseTime}ms`,
                                    severity: responseTime > 1500 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'User experience affected',
                                confidence: 60,
                                evidence: [`Response time: ${responseTime}ms`],
                                changeType: CHANGE_TYPE.PERFORMANCE_SHIFT
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Detector: Resource (Chapter 5, 8)
        // ============================================================

        _detectResourceChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ResourceOptimization) {
                    const stats = window.LawAIApp.ResourceOptimization.getStats ?
                        window.LawAIApp.ResourceOptimization.getStats() : null;

                    if (stats) {
                        const usage = stats.avgUsage || 0;

                        if (usage > 70) {
                            contexts.push({
                                trigger: 'resource_usage_increase',
                                currentState: { usage: usage },
                                changeDetected: {
                                    type: CHANGE_TYPE.USAGE_INCREASE,
                                    description: `Resource usage at ${usage}%`,
                                    severity: usage > 85 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Resource exhaustion risk',
                                confidence: 65,
                                evidence: [`Resource usage: ${usage}%`],
                                changeType: CHANGE_TYPE.USAGE_INCREASE
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Detector: Architecture (Chapter 5, 8)
        // ============================================================

        _detectArchitectureChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.ArchitectureAdvisor) {
                    const stats = window.LawAIApp.ArchitectureAdvisor.getStats ?
                        window.LawAIApp.ArchitectureAdvisor.getStats() : null;

                    if (stats) {
                        const health = stats.health || 70;
                        const complexity = stats.complexity || 0.4;

                        if (health < 65) {
                            contexts.push({
                                trigger: 'architecture_health_decline',
                                currentState: { health: health },
                                changeDetected: {
                                    type: CHANGE_TYPE.ARCHITECTURE_PRESSURE,
                                    description: `Architecture health at ${health}%`,
                                    severity: health < 50 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Maintainability and scalability affected',
                                confidence: 65,
                                evidence: [`Health: ${health}%`],
                                changeType: CHANGE_TYPE.ARCHITECTURE_PRESSURE
                            });
                        }

                        if (complexity > 0.6) {
                            contexts.push({
                                trigger: 'architecture_complexity_increase',
                                currentState: { complexity: complexity },
                                changeDetected: {
                                    type: CHANGE_TYPE.ARCHITECTURE_PRESSURE,
                                    description: `Complexity: ${(complexity * 100).toFixed(0)}%`,
                                    severity: complexity > 0.75 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Increased technical debt',
                                confidence: 60,
                                evidence: [`Complexity: ${(complexity * 100).toFixed(0)}%`],
                                changeType: CHANGE_TYPE.ARCHITECTURE_PRESSURE
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Detector: Workflow (Chapter 5, 8)
        // ============================================================

        _detectWorkflowChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.BootPipeline) {
                    const info = window.LawAIApp.BootPipeline.getInfo ?
                        window.LawAIApp.BootPipeline.getInfo() : null;

                    if (info) {
                        const duration = info.duration || 0;
                        const stageCount = info.stageCount || 0;

                        if (duration > 2000) {
                            contexts.push({
                                trigger: 'workflow_duration_increase',
                                currentState: { duration: duration },
                                changeDetected: {
                                    type: CHANGE_TYPE.PERFORMANCE_SHIFT,
                                    description: `Pipeline duration at ${duration}ms`,
                                    severity: duration > 3000 ? 'HIGH' : 'MEDIUM'
                                },
                                impact: 'Slower pipeline execution',
                                confidence: 55,
                                evidence: [`Duration: ${duration}ms`],
                                changeType: CHANGE_TYPE.PERFORMANCE_SHIFT
                            });
                        }

                        if (stageCount > 10) {
                            contexts.push({
                                trigger: 'workflow_complexity_increase',
                                currentState: { stageCount: stageCount },
                                changeDetected: {
                                    type: CHANGE_TYPE.GROWTH,
                                    description: `${stageCount} pipeline stages`,
                                    severity: stageCount > 15 ? 'MEDIUM' : 'LOW'
                                },
                                impact: 'Increased pipeline complexity',
                                confidence: 50,
                                evidence: [`Stages: ${stageCount}`],
                                changeType: CHANGE_TYPE.GROWTH
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Detector: Capability (Chapter 5, 8)
        // ============================================================

        _detectCapabilityChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                    const stats = window.LawAIApp.EvolutionIntelligence.getStats ?
                        window.LawAIApp.EvolutionIntelligence.getStats() : null;

                    if (stats) {
                        const avgScore = stats.avgScore || 50;

                        if (avgScore > 70) {
                            contexts.push({
                                trigger: 'capability_growth',
                                currentState: { score: avgScore },
                                changeDetected: {
                                    type: CHANGE_TYPE.GROWTH,
                                    description: `Capability score at ${avgScore}%`,
                                    severity: 'LOW'
                                },
                                impact: 'System capability growing',
                                confidence: 70,
                                evidence: [`Score: ${avgScore}%`],
                                changeType: CHANGE_TYPE.GROWTH
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Detector: Knowledge (Chapter 5, 8)
        // ============================================================

        _detectKnowledgeChange(options) {
            const contexts = [];
            const evidence = [];

            try {
                if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                    const kgData = window.LawAIApp.KnowledgeGraph.getData ?
                        window.LawAIApp.KnowledgeGraph.getData() : null;

                    if (kgData) {
                        const entities = kgData.entities ? Object.keys(kgData.entities).length : 0;
                        const relations = kgData.relations ? Object.keys(kgData.relations).length : 0;

                        if (entities > 30) {
                            contexts.push({
                                trigger: 'knowledge_expansion',
                                currentState: { entities: entities },
                                changeDetected: {
                                    type: CHANGE_TYPE.GROWTH,
                                    description: `Knowledge graph grew to ${entities} entities`,
                                    severity: 'LOW'
                                },
                                impact: 'Better reasoning capabilities',
                                confidence: 75,
                                evidence: [`Entities: ${entities}`],
                                changeType: CHANGE_TYPE.GROWTH
                            });
                        }

                        if (relations > entities * 1.5) {
                            contexts.push({
                                trigger: 'knowledge_connectivity',
                                currentState: { entities: entities, relations: relations },
                                changeDetected: {
                                    type: CHANGE_TYPE.GROWTH,
                                    description: `Knowledge graph connectivity improved`,
                                    severity: 'LOW'
                                },
                                impact: 'Better knowledge relationships',
                                confidence: 70,
                                evidence: [`Relations: ${relations}`],
                                changeType: CHANGE_TYPE.GROWTH
                            });
                        }
                    }
                }
            } catch (e) { /* ignore */ }

            return { contexts, evidence };
        }

        // ============================================================
        // Strategy Generation (Chapter 9)
        // ============================================================

        _generateStrategy(context, ctxData) {
            const priority = this._evaluatePriority(ctxData);
            const steps = this._generateSteps(ctxData);

            return new AdaptationStrategy({
                adaptationId: context.adaptationId,
                objective: this._determineObjective(ctxData),
                affectedArea: ctxData.trigger || 'unknown',
                expectedBenefit: ctxData.impact || 'Improved system state',
                risk: ctxData.risk || 'MEDIUM',
                priority: priority,
                steps: steps,
                metadata: {
                    source: 'adaptation_engine',
                    changeType: ctxData.changeType || 'unknown',
                    confidence: ctxData.confidence || 60
                }
            });
        }

        _evaluatePriority(ctxData) {
            const severity = ctxData.changeDetected?.severity || 'MEDIUM';
            const confidence = ctxData.confidence || 50;

            let score = 0;
            if (severity === 'CRITICAL') score += 40;
            else if (severity === 'HIGH') score += 30;
            else if (severity === 'MEDIUM') score += 20;
            else score += 10;

            if (confidence > 70) score += 20;
            else if (confidence > 50) score += 10;

            if (score >= 80) return 'CRITICAL';
            if (score >= 60) return 'HIGH';
            if (score >= 40) return 'MEDIUM';
            return 'LOW';
        }

        _determineObjective(ctxData) {
            const trigger = ctxData.trigger || '';
            const changeType = ctxData.changeType || '';

            if (trigger.includes('cpu') || trigger.includes('memory') || trigger.includes('performance')) {
                return 'Optimize performance to handle increased load';
            }
            if (trigger.includes('resource')) {
                return 'Adjust resource allocation for changing demands';
            }
            if (trigger.includes('architecture')) {
                return 'Evolve architecture to maintain health and scalability';
            }
            if (trigger.includes('workflow')) {
                return 'Optimize workflow for efficiency';
            }
            if (trigger.includes('capability')) {
                return 'Enhance capability to meet growing needs';
            }
            return 'Adapt to detected change';
        }

        _generateSteps(ctxData) {
            const steps = [];
            const trigger = ctxData.trigger || '';

            steps.push({
                step: 'Analyze change impact',
                description: 'Assess the full impact of detected change'
            });

            if (trigger.includes('cpu') || trigger.includes('performance')) {
                steps.push({
                    step: 'Optimize performance',
                    description: 'Implement performance optimizations'
                });
                steps.push({
                    step: 'Monitor results',
                    description: 'Verify performance improvement'
                });
            } else if (trigger.includes('resource')) {
                steps.push({
                    step: 'Adjust resource allocation',
                    description: 'Reallocate resources based on demand'
                });
                steps.push({
                    step: 'Monitor utilization',
                    description: 'Track resource usage after adjustment'
                });
            } else if (trigger.includes('architecture')) {
                steps.push({
                    step: 'Review architecture',
                    description: 'Analyze architecture health and complexity'
                });
                steps.push({
                    step: 'Plan refactoring',
                    description: 'Develop architecture improvement plan'
                });
            } else {
                steps.push({
                    step: 'Review and adapt',
                    description: 'Review change and determine best response'
                });
                steps.push({
                    step: 'Implement adaptation',
                    description: 'Apply appropriate adaptation strategy'
                });
            }

            steps.push({
                step: 'Validate adaptation',
                description: 'Ensure adaptation achieved desired outcome'
            });

            return steps;
        }

        // ============================================================
        // Auto-Detection
        // ============================================================

        _startAutoDetection() {
            if (this._detectionInterval) {
                clearInterval(this._detectionInterval);
            }

            this._detectionInterval = setInterval(() => {
                this.detectAll();
            }, this._config.detectionInterval);

            console.log(`[RuntimeAdaptation] Auto-detection started (${this._config.detectionInterval}ms)`);
        }

        _stopAutoDetection() {
            if (this._detectionInterval) {
                clearInterval(this._detectionInterval);
                this._detectionInterval = null;
            }
        }

        // ============================================================
        // Public API (Chapter 14)
        // ============================================================

        analyze(adaptationId) {
            const context = this._contexts.find(c => c.adaptationId === adaptationId);
            if (!context) return null;

            return {
                adaptationId: context.adaptationId,
                changeDetected: context.changeDetected,
                impact: context.impact,
                strategy: context.strategy,
                confidence: context.confidence
            };
        }

        generate(adaptationId) {
            const context = this._contexts.find(c => c.adaptationId === adaptationId);
            if (!context) return null;

            const strategy = this._generateStrategy(context, {
                trigger: context.trigger,
                changeDetected: context.changeDetected,
                impact: context.impact,
                confidence: context.confidence
            });

            this._strategies.push(strategy);
            context.strategy = strategy.toJSON();

            return strategy;
        }

        history(limit) {
            return this._history.slice(-(limit || 10)).reverse();
        }

        getStrategy(adaptationId) {
            const strategy = this._strategies.find(s => s.adaptationId === adaptationId);
            return strategy ? strategy.toJSON() : null;
        }

        getStats() {
            const total = this._contexts.length;
            const byCategory = {};
            const byStatus = {};

            this._contexts.forEach(c => {
                byCategory[c.category] = (byCategory[c.category] || 0) + 1;
                byStatus[c.status] = (byStatus[c.status] || 0) + 1;
            });

            const avgConfidence = total > 0 ?
                Math.round(this._contexts.reduce((sum, c) => sum + c.confidence, 0) / total) :
                0;

            return {
                total,
                byCategory,
                byStatus,
                avgConfidence,
                strategies: this._strategies.length,
                historyCount: this._history.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this._contexts.slice(-5).map(c => c.toJSON());

            return {
                type: 'runtime_adaptation',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentContexts: recent,
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
                        console.error('[RuntimeAdaptation] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`adaptation.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('runtimeAdaptationData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.contexts) {
                        this._contexts = data.contexts.map(c => new AdaptationContext(c));
                    }
                    if (data.strategies) {
                        this._strategies = data.strategies.map(s => new AdaptationStrategy(s));
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
                console.log('[RuntimeAdaptation] Connected to Evolution Intelligence');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[RuntimeAdaptation] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveLayer() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[RuntimeAdaptation] Connected to Predictive Layer');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[RuntimeAdaptation] Connected to Optimization Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[RuntimeAdaptation] Connected to Knowledge Graph');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[RuntimeAdaptation] Connected to Governance');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[RuntimeAdaptation] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'runtime-adaptation',
                        name: 'Runtime Adaptation',
                        category: 'evolution',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[RuntimeAdaptation] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[RuntimeAdaptation] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._stopAutoDetection();
            this._initialized = false;
            console.log('[RuntimeAdaptation] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new RuntimeAdaptation();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RuntimeAdaptation = {
        Core: instance,
        ADAPTATION_CATEGORY: ADAPTATION_CATEGORY,
        ADAPTATION_STATUS: ADAPTATION_STATUS,
        CHANGE_TYPE: CHANGE_TYPE,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        detect: (categories, options) => instance.detect(categories, options),
        detectAll: (options) => instance.detectAll(options),

        analyze: (adaptationId) => instance.analyze(adaptationId),
        generate: (adaptationId) => instance.generate(adaptationId),
        getStrategy: (adaptationId) => instance.getStrategy(adaptationId),
        history: (limit) => instance.history(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[RuntimeAdaptation] Part 54.2 loaded ✅');
    console.log('[RuntimeAdaptation] Categories:', Object.values(ADAPTATION_CATEGORY).join(' | '));

})();
