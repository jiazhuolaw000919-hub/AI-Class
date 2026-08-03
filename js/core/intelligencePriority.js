// ============================================================
// intelligencePriority.js
// Part 55.4 — Intelligence Priority System
// Version: v5.5.4
// Module: AI Orchestration Layer
// File: js/core/intelligencePriority.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.IntelligencePriority) {
        console.warn('[IntelligencePriority] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Priority Levels (Chapter 7)
    // ============================================================
    const PRIORITY_LEVEL = {
        CRITICAL: { label: 'CRITICAL', score: 100, color: '#ef4444', action: 'immediate' },
        HIGH: { label: 'HIGH', score: 75, color: '#f97316', action: 'urgent' },
        MEDIUM: { label: 'MEDIUM', score: 50, color: '#eab308', action: 'normal' },
        LOW: { label: 'LOW', score: 25, color: '#22c55e', action: 'background' }
    };

    // ============================================================
    // Task Status
    // ============================================================
    const TASK_STATUS = {
        PENDING: 'pending',
        QUEUED: 'queued',
        EXECUTING: 'executing',
        COMPLETED: 'completed',
        FAILED: 'failed',
        DEFERRED: 'deferred',
        ESCALATED: 'escalated'
    };

    // ============================================================
    // Priority Context Model (Chapter 5)
    // ============================================================
    class PriorityTask {
        constructor(config) {
            this.taskId = config.taskId || this._generateId();
            this.timestamp = Date.now();
            this.source = config.source || 'unknown';
            this.intelligence = config.intelligence || 'unknown';
            this.urgency = config.urgency || 0;
            this.impact = config.impact || 0;
            this.risk = config.risk || 0;
            this.confidence = config.confidence || 0;
            this.priorityScore = config.priorityScore || 0;
            this.level = config.level || PRIORITY_LEVEL.MEDIUM;
            this.status = TASK_STATUS.PENDING;
            this.resourceCost = config.resourceCost || 0.5;
            this.governanceLevel = config.governanceLevel || 0;
            this.metadata = config.metadata || {};
            this.escalatedAt = null;
            this.completedAt = null;
        }

        _generateId() {
            return `ptask_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                taskId: this.taskId,
                timestamp: this.timestamp,
                source: this.source,
                intelligence: this.intelligence,
                urgency: this.urgency,
                impact: this.impact,
                risk: this.risk,
                confidence: this.confidence,
                priorityScore: this.priorityScore,
                level: this.level,
                status: this.status,
                resourceCost: this.resourceCost,
                governanceLevel: this.governanceLevel,
                metadata: this.metadata,
                escalatedAt: this.escalatedAt,
                completedAt: this.completedAt
            };
        }
    }

    // ============================================================
    // Intelligence Priority Core (Chapter 1-4)
    // ============================================================
    class IntelligencePriority {
        constructor() {
            this._tasks = [];
            this._queue = [];
            this._history = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxQueueSize: 50,
                maxHistorySize: 200,
                priorityThresholds: {
                    critical: 80,
                    high: 60,
                    medium: 40,
                    low: 20
                },
                enableDynamicAdjustment: true,
                autoEscalateTimeout: 30000,
                conflictResolutionStrategy: 'governance'
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[IntelligencePriority] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[IntelligencePriority] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToOrchestrationCore();
            this._connectToWorkflowManager();
            this._connectToCoordinationEngine();
            this._connectToDecisionIntelligence();
            this._connectToPredictiveRuntime();
            this._connectToOptimizationLayer();
            this._connectToEvolutionSystem();
            this._connectToGovernanceFramework();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Start queue processor
            this._startQueueProcessor();

            this._initialized = true;
            console.log('[IntelligencePriority] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Evaluate Priority (Chapter 3, 5-6)
        // ============================================================

        evaluate(task) {
            console.log(`[IntelligencePriority] Evaluating priority for: ${task.taskId || 'unknown'}`);

            // Calculate priority factors (Chapter 6)
            const urgency = task.urgency || this._evaluateUrgency(task);
            const impact = task.impact || this._evaluateImpact(task);
            const risk = task.risk || this._evaluateRisk(task);
            const confidence = task.confidence || this._evaluateConfidence(task);
            const resourceCost = task.resourceCost || this._evaluateResourceCost(task);
            const governanceLevel = task.governanceLevel || this._evaluateGovernanceLevel(task);

            // Calculate priority score
            const priorityScore = this._calculatePriorityScore({
                urgency,
                impact,
                risk,
                confidence,
                resourceCost,
                governanceLevel
            });

            // Determine priority level
            const level = this._determineLevel(priorityScore);

            // Create priority task
            const priorityTask = new PriorityTask({
                taskId: task.taskId || this._generateTaskId(),
                source: task.source || 'runtime',
                intelligence: task.intelligence || 'unknown',
                urgency: urgency,
                impact: impact,
                risk: risk,
                confidence: confidence,
                priorityScore: priorityScore,
                level: level,
                resourceCost: resourceCost,
                governanceLevel: governanceLevel,
                metadata: {
                    originalTask: task,
                    factors: {
                        urgency,
                        impact,
                        risk,
                        confidence,
                        resourceCost,
                        governanceLevel
                    }
                }
            });

            this._tasks.push(priorityTask);

            this._emit('priorityEvaluated', priorityTask.toJSON());

            return priorityTask;
        }

        // ============================================================
        // Priority Factors (Chapter 6)
        // ============================================================

        _evaluateUrgency(task) {
            // Check if task is time-sensitive
            const urgencyFactors = {
                'critical': 100,
                'security': 90,
                'failure': 85,
                'performance': 70,
                'optimization': 50,
                'evolution': 30,
                'planning': 20
            };

            const taskLower = (task.description || task.task || '').toLowerCase();
            for (const key in urgencyFactors) {
                if (taskLower.includes(key)) {
                    return urgencyFactors[key];
                }
            }
            return 40;
        }

        _evaluateImpact(task) {
            // Evaluate system impact
            if (task.impact) return task.impact;

            const impactKeywords = {
                'system_wide': 90,
                'critical_module': 80,
                'multiple_modules': 65,
                'single_module': 45,
                'minor': 25
            };

            const taskLower = (task.description || task.task || '').toLowerCase();
            for (const key in impactKeywords) {
                if (taskLower.includes(key)) {
                    return impactKeywords[key];
                }
            }
            return 40;
        }

        _evaluateRisk(task) {
            // Evaluate risk level
            if (task.risk) return task.risk;

            const riskKeywords = {
                'security': 95,
                'critical': 85,
                'data_loss': 90,
                'failure': 80,
                'degradation': 60,
                'normal': 40
            };

            const taskLower = (task.description || task.task || '').toLowerCase();
            for (const key in riskKeywords) {
                if (taskLower.includes(key)) {
                    return riskKeywords[key];
                }
            }
            return 35;
        }

        _evaluateConfidence(task) {
            return task.confidence || 60;
        }

        _evaluateResourceCost(task) {
            if (task.resourceCost) return task.resourceCost;

            // Estimate resource cost based on complexity
            const complexity = task.complexity || 'medium';
            const costMap = {
                'simple': 0.2,
                'medium': 0.5,
                'complex': 0.8,
                'critical': 1.0
            };
            return costMap[complexity] || 0.5;
        }

        _evaluateGovernanceLevel(task) {
            if (task.governanceLevel) return task.governanceLevel;

            const taskLower = (task.description || task.task || '').toLowerCase();
            if (taskLower.includes('security') || taskLower.includes('critical') || taskLower.includes('governance')) {
                return 90;
            }
            if (taskLower.includes('architecture') || taskLower.includes('evolution')) {
                return 70;
            }
            if (taskLower.includes('optimization') || taskLower.includes('performance')) {
                return 50;
            }
            return 30;
        }

        // ============================================================
        // Priority Score Calculation (Chapter 6)
        // ============================================================

        _calculatePriorityScore(factors) {
            const weights = {
                urgency: 0.25,
                impact: 0.25,
                risk: 0.20,
                confidence: 0.15,
                resourceCost: 0.05,
                governanceLevel: 0.10
            };

            // Resource cost: lower cost = higher priority
            const costScore = 100 - (factors.resourceCost * 100);

            const score =
                factors.urgency * weights.urgency +
                factors.impact * weights.impact +
                factors.risk * weights.risk +
                factors.confidence * weights.confidence +
                costScore * weights.resourceCost +
                factors.governanceLevel * weights.governanceLevel;

            return Math.min(Math.round(score), 100);
        }

        _determineLevel(score) {
            const thresholds = this._config.priorityThresholds;
            if (score >= thresholds.critical) return PRIORITY_LEVEL.CRITICAL;
            if (score >= thresholds.high) return PRIORITY_LEVEL.HIGH;
            if (score >= thresholds.medium) return PRIORITY_LEVEL.MEDIUM;
            return PRIORITY_LEVEL.LOW;
        }

        // ============================================================
        // Queue Management (Chapter 8)
        // ============================================================

        queue(task) {
            const priorityTask = this.evaluate(task);

            // Add to queue
            this._queue.push(priorityTask);
            this._sortQueue();

            if (this._queue.length > this._config.maxQueueSize) {
                this._deferLowest();
            }

            priorityTask.status = TASK_STATUS.QUEUED;

            this._emit('taskQueued', priorityTask.toJSON());

            return priorityTask;
        }

        _sortQueue() {
            this._queue.sort((a, b) => {
                // Sort by priority score (descending)
                return b.priorityScore - a.priorityScore;
            });
        }

        _deferLowest() {
            const lowest = this._queue[this._queue.length - 1];
            if (lowest) {
                lowest.status = TASK_STATUS.DEFERRED;
                this._queue.pop();
                this._history.push({
                    taskId: lowest.taskId,
                    action: 'deferred',
                    reason: 'Queue full',
                    timestamp: Date.now()
                });
            }
        }

        getQueue(limit) {
            return this._queue.slice(0, limit || 10).map(t => t.toJSON());
        }

        getNextTask() {
            if (this._queue.length === 0) return null;
            const task = this._queue.shift();
            task.status = TASK_STATUS.EXECUTING;
            this._emit('taskStarted', task.toJSON());
            return task;
        }

        // ============================================================
        // Dynamic Priority Adjustment (Chapter 10)
        // ============================================================

        adjustPriority(taskId, adjustment) {
            const task = this._tasks.find(t => t.taskId === taskId);
            if (!task) return false;

            const oldScore = task.priorityScore;
            task.priorityScore = Math.min(100, Math.max(0, task.priorityScore + adjustment));
            task.level = this._determineLevel(task.priorityScore);

            // Update queue position
            if (task.status === TASK_STATUS.QUEUED || task.status === TASK_STATUS.PENDING) {
                this._sortQueue();
            }

            this._emit('priorityAdjusted', {
                taskId: taskId,
                oldScore: oldScore,
                newScore: task.priorityScore,
                adjustment: adjustment
            });

            return true;
        }

        updatePriority(taskId, factors) {
            const task = this._tasks.find(t => t.taskId === taskId);
            if (!task) return false;

            if (factors.urgency !== undefined) task.urgency = factors.urgency;
            if (factors.impact !== undefined) task.impact = factors.impact;
            if (factors.risk !== undefined) task.risk = factors.risk;
            if (factors.confidence !== undefined) task.confidence = factors.confidence;

            // Recalculate score
            const score = this._calculatePriorityScore({
                urgency: task.urgency,
                impact: task.impact,
                risk: task.risk,
                confidence: task.confidence,
                resourceCost: task.resourceCost,
                governanceLevel: task.governanceLevel
            });

            task.priorityScore = score;
            task.level = this._determineLevel(score);

            if (task.status === TASK_STATUS.QUEUED) {
                this._sortQueue();
            }

            this._emit('priorityUpdated', task.toJSON());

            return true;
        }

        // ============================================================
        // Conflict Handling (Chapter 9)
        // ============================================================

        resolveConflict(tasks) {
            console.log(`[IntelligencePriority] Resolving conflict between ${tasks.length} tasks`);

            // Sort by priority
            const sorted = [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);

            // If governance level is high, apply governance rules
            const governanceTasks = sorted.filter(t => t.governanceLevel > 70);
            if (governanceTasks.length > 0) {
                const governanceTask = governanceTasks[0];
                // Escalate to governance
                this._escalateTask(governanceTask);
                return {
                    selected: governanceTask,
                    reason: 'Governance priority override'
                };
            }

            // If critical tasks exist, pick highest impact
            const criticalTasks = sorted.filter(t => t.level === PRIORITY_LEVEL.CRITICAL);
            if (criticalTasks.length > 0) {
                return {
                    selected: criticalTasks[0],
                    reason: 'Critical priority'
                };
            }

            // Default: pick highest priority
            return {
                selected: sorted[0],
                reason: 'Priority score based selection'
            };
        }

        _escalateTask(task) {
            task.status = TASK_STATUS.ESCALATED;
            task.escalatedAt = Date.now();

            this._emit('taskEscalated', task.toJSON());

            // Notify governance
            if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                try {
                    window.LawAIApp.EvolutionGovernance.review(task, {
                        type: 'priority_conflict',
                        priority: task.level
                    });
                } catch (e) { /* ignore */ }
            }

            return task;
        }

        // ============================================================
        // Queue Processor
        // ============================================================

        _startQueueProcessor() {
            if (this._processorInterval) {
                clearInterval(this._processorInterval);
            }

            this._processorInterval = setInterval(() => {
                this._processQueue();
            }, 2000);

            console.log('[IntelligencePriority] Queue processor started');
        }

        _processQueue() {
            if (this._queue.length === 0) return;

            // Check for tasks that need escalation
            const pendingTasks = this._queue.filter(t => 
                t.level === PRIORITY_LEVEL.CRITICAL &&
                t.status === TASK_STATUS.QUEUED
            );

            pendingTasks.forEach(task => {
                const waitTime = Date.now() - task.timestamp;
                if (waitTime > this._config.autoEscalateTimeout) {
                    this._escalateTask(task);
                }
            });

            this._sortQueue();
        }

        // ============================================================
        // Query Methods
        // ============================================================

        getTask(taskId) {
            const task = this._tasks.find(t => t.taskId === taskId);
            return task ? task.toJSON() : null;
        }

        getHistory(limit) {
            return this._history.slice(-(limit || 20)).reverse();
        }

        getStats() {
            const total = this._tasks.length;
            const byLevel = {};
            const byStatus = {};

            this._tasks.forEach(t => {
                byLevel[t.level.label] = (byLevel[t.level.label] || 0) + 1;
                byStatus[t.status] = (byStatus[t.status] || 0) + 1;
            });

            const avgScore = total > 0 ?
                Math.round(this._tasks.reduce((sum, t) => sum + t.priorityScore, 0) / total) :
                0;

            return {
                total,
                byLevel,
                byStatus,
                avgScore,
                queueSize: this._queue.length,
                historySize: this._history.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const queue = this.getQueue(5);
            const history = this.getHistory(5);

            return {
                type: 'intelligence_priority',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                currentQueue: queue,
                recentHistory: history,
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
                        console.error('[IntelligencePriority] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`priority.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToOrchestrationCore() {
            if (window.LawAIApp && window.LawAIApp.AIOrchestration) {
                console.log('[IntelligencePriority] Connected to Orchestration Core');
            }
        }

        _connectToWorkflowManager() {
            if (window.LawAIApp && window.LawAIApp.MultiAgentWorkflow) {
                console.log('[IntelligencePriority] Connected to Workflow Manager');
            }
        }

        _connectToCoordinationEngine() {
            if (window.LawAIApp && window.LawAIApp.IntelligenceCoordination) {
                console.log('[IntelligencePriority] Connected to Coordination Engine');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[IntelligencePriority] Connected to Decision Intelligence');
            }
        }

        _connectToPredictiveRuntime() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[IntelligencePriority] Connected to Predictive Runtime');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[IntelligencePriority] Connected to Optimization Layer');
            }
        }

        _connectToEvolutionSystem() {
            if (window.LawAIApp && window.LawAIApp.EvolutionIntelligence) {
                console.log('[IntelligencePriority] Connected to Evolution System');
            }
        }

        _connectToGovernanceFramework() {
            if (window.LawAIApp && (window.LawAIApp.Governance || window.LawAIApp.EvolutionGovernance)) {
                console.log('[IntelligencePriority] Connected to Governance Framework');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'intelligence-priority',
                        name: 'Intelligence Priority',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[IntelligencePriority] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[IntelligencePriority] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            if (this._processorInterval) {
                clearInterval(this._processorInterval);
                this._processorInterval = null;
            }
            this._initialized = false;
            console.log('[IntelligencePriority] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new IntelligencePriority();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.IntelligencePriority = {
        Core: instance,
        PRIORITY_LEVEL: PRIORITY_LEVEL,
        TASK_STATUS: TASK_STATUS,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        evaluate: (task) => instance.evaluate(task),
        queue: (task) => instance.queue(task),
        getNextTask: () => instance.getNextTask(),
        adjustPriority: (taskId, adjustment) => instance.adjustPriority(taskId, adjustment),
        updatePriority: (taskId, factors) => instance.updatePriority(taskId, factors),
        resolveConflict: (tasks) => instance.resolveConflict(tasks),

        getTask: (taskId) => instance.getTask(taskId),
        getQueue: (limit) => instance.getQueue(limit),
        getHistory: (limit) => instance.getHistory(limit),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[IntelligencePriority] Part 55.4 loaded ✅');
    console.log('[IntelligencePriority] Priority Levels:', Object.keys(PRIORITY_LEVEL).join(' | '));

})();
