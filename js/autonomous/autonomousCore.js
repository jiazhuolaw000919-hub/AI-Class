// ==================================================
// Part 50.1.1 — Autonomous Core Foundation
// Version: v5.0.1
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.Autonomous) {
        console.warn('[Autonomous] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // State Machine
    // ==================================================
    const STATES = {
        IDLE: 'IDLE',
        OBSERVING: 'OBSERVING',
        ANALYZING: 'ANALYZING',
        RECOMMENDING: 'RECOMMENDING',
        WAITING_APPROVAL: 'WAITING_APPROVAL',
        EXECUTING: 'EXECUTING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    };

    // ==================================================
    // Autonomous Context
    // ==================================================
    class AutonomousContext {
        constructor(config) {
            this.taskId = config.taskId || this._generateTaskId();
            this.trigger = config.trigger || null;
            this.timestamp = Date.now();
            this.source = config.source || 'unknown';
            this.runtimeState = null;
            this.analysis = null;
            this.recommendation = null;
            this.approval = null;
            this.metadata = config.metadata || {};
        }

        _generateTaskId() {
            return `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        update(data) {
            Object.assign(this, data);
            this.timestamp = Date.now();
            return this;
        }

        toJSON() {
            return {
                taskId: this.taskId,
                trigger: this.trigger,
                timestamp: this.timestamp,
                source: this.source,
                runtimeState: this.runtimeState,
                analysis: this.analysis,
                recommendation: this.recommendation,
                approval: this.approval,
                metadata: this.metadata
            };
        }
    }

    // ==================================================
    // Autonomous Core
    // ==================================================
    class AutonomousCore {
        constructor() {
            this.state = STATES.IDLE;
            this.currentTask = null;
            this.history = [];
            this._listeners = [];
            this._initialized = false;
            this._taskCounter = 0;
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize() {
            if (this._initialized) {
                console.warn('[Autonomous] Already initialized');
                return this;
            }

            console.log('[Autonomous] Core initializing...');

            // Connect to Runtime Events
            this._connectToRuntime();

            // Connect to Governance
            this._connectToGovernance();

            // Connect to Performance
            this._connectToPerformance();

            // Connect to Explorer
            this._registerWithExplorer();

            this._initialized = true;
            this.setState(STATES.IDLE);
            
            console.log('[Autonomous] Core initialized ✅');
            return this;
        }

        // ==============================================
        // Task Management
        // ==============================================

        startTask(trigger, source, metadata) {
            if (this.state === STATES.EXECUTING || this.state === STATES.WAITING_APPROVAL) {
                console.warn('[Autonomous] Cannot start new task while current task is active');
                return null;
            }

            const context = new AutonomousContext({
                taskId: this._generateTaskId(),
                trigger: trigger,
                source: source || 'runtime',
                metadata: metadata || {}
            });

            this.currentTask = context;
            this.setState(STATES.OBSERVING);
            this._emit('taskStarted', context);

            console.log(`[Autonomous] Task started: ${context.taskId} (trigger: ${trigger})`);
            return context;
        }

        updateState(newState) {
            const validTransition = this._validateTransition(this.state, newState);
            if (!validTransition) {
                console.error(`[Autonomous] Invalid state transition: ${this.state} → ${newState}`);
                return false;
            }

            this.setState(newState);
            this._emit('stateChanged', { from: this.state, to: newState });
            return true;
        }

        getStatus() {
            return {
                state: this.state,
                currentTask: this.currentTask ? this.currentTask.toJSON() : null,
                historyCount: this.history.length,
                initialized: this._initialized
            };
        }

        completeTask(result) {
            if (!this.currentTask) {
                console.warn('[Autonomous] No task to complete');
                return false;
            }

            this.currentTask.update({
                result: result,
                completedAt: Date.now()
            });

            this.history.push(this.currentTask);
            this.setState(STATES.COMPLETED);
            this._emit('taskCompleted', this.currentTask);

            const taskId = this.currentTask.taskId;
            this.currentTask = null;
            this.setState(STATES.IDLE);

            console.log(`[Autonomous] Task completed: ${taskId}`);
            return true;
        }

        failTask(error) {
            if (!this.currentTask) {
                console.warn('[Autonomous] No task to fail');
                return false;
            }

            this.currentTask.update({
                error: error,
                failedAt: Date.now()
            });

            this.history.push(this.currentTask);
            this.setState(STATES.FAILED);
            this._emit('taskFailed', { task: this.currentTask, error });

            const taskId = this.currentTask.taskId;
            this.currentTask = null;
            this.setState(STATES.IDLE);

            console.error(`[Autonomous] Task failed: ${taskId}`, error);
            return true;
        }

        // ==============================================
        // Context Building
        // ==============================================

        buildContext(taskId, runtimeData) {
            // Called by Context Builder
            const task = this._findTask(taskId);
            if (!task) {
                console.warn(`[Autonomous] Task not found: ${taskId}`);
                return null;
            }

            task.update({
                runtimeState: runtimeData,
                analyzedAt: Date.now()
            });

            this.setState(STATES.ANALYZING);
            this._emit('contextBuilt', task);

            return task;
        }

        setRecommendation(taskId, recommendation) {
            const task = this._findTask(taskId);
            if (!task) {
                console.warn(`[Autonomous] Task not found: ${taskId}`);
                return false;
            }

            task.update({
                recommendation: recommendation,
                recommendedAt: Date.now()
            });

            this.setState(STATES.RECOMMENDING);
            this._emit('recommendationReady', task);

            return true;
        }

        setApproval(taskId, approval) {
            const task = this._findTask(taskId);
            if (!task) {
                console.warn(`[Autonomous] Task not found: ${taskId}`);
                return false;
            }

            task.update({
                approval: approval,
                approvedAt: Date.now()
            });

            this.setState(STATES.WAITING_APPROVAL);
            this._emit('approvalReceived', task);

            return true;
        }

        // ==============================================
        // Explorer Support
        // ==============================================

        getExplorerData() {
            return {
                type: 'autonomous',
                status: this.state,
                currentTask: this.currentTask ? this.currentTask.toJSON() : null,
                history: this.history.slice(-10).map(t => t.toJSON()), // Last 10
                historyCount: this.history.length,
                stateTransitions: this._getStateTransitions()
            };
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

        // ==============================================
        // Private Methods
        // ==============================================

        setState(newState) {
            const oldState = this.state;
            this.state = newState;
            this._emit('stateChanged', { from: oldState, to: newState, timestamp: Date.now() });
        }

        _validateTransition(from, to) {
            const validTransitions = {
                IDLE: ['OBSERVING', 'FAILED'],
                OBSERVING: ['ANALYZING', 'FAILED'],
                ANALYZING: ['RECOMMENDING', 'FAILED'],
                RECOMMENDING: ['WAITING_APPROVAL', 'FAILED'],
                WAITING_APPROVAL: ['EXECUTING', 'COMPLETED', 'FAILED'],
                EXECUTING: ['COMPLETED', 'FAILED'],
                COMPLETED: ['IDLE'],
                FAILED: ['IDLE']
            };

            return validTransitions[from] && validTransitions[from].includes(to);
        }

        _generateTaskId() {
            this._taskCounter++;
            return `task_${Date.now()}_${this._taskCounter}`;
        }

        _findTask(taskId) {
            if (this.currentTask && this.currentTask.taskId === taskId) {
                return this.currentTask;
            }
            return this.history.find(t => t.taskId === taskId) || null;
        }

        _getStateTransitions() {
            // Simplified: return recent transitions from history
            return this.history.slice(-5).map(t => ({
                taskId: t.taskId,
                from: t.metadata?.previousState || 'unknown',
                to: t.metadata?.state || 'unknown',
                timestamp: t.timestamp
            }));
        }

        _emit(event, data) {
            if (this._listeners && this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error(`[Autonomous] Listener error (${event}):`, e);
                    }
                });
            }

            // Also emit to global event bus if available
            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`autonomous.${event}`, data);
            }
        }

        // ==============================================
        // Integrations
        // ==============================================

        _connectToRuntime() {
            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.on('runtime.*', (data) => {
                    // Listen for runtime events that could trigger autonomous actions
                    this._handleRuntimeEvent(data);
                });
                console.log('[Autonomous] Connected to Runtime Events');
            }
        }

        _handleRuntimeEvent(event) {
            // Can trigger autonomous flows based on runtime events
            // e.g., performance warning, health warning, etc.
            if (event.type === 'performance.warning' || event.type === 'health.warning') {
                this.startTask(event.type, 'runtime', { event });
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[Autonomous] Connected to Governance');
            }
        }

        _connectToPerformance() {
            if (window.LawAIApp && window.LawAIApp.Performance) {
                console.log('[Autonomous] Connected to Performance');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'autonomous-core',
                        name: 'Autonomous Core',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[Autonomous] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[Autonomous] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new AutonomousCore();

    // Create namespace
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.Autonomous = {
        Core: instance,
        STATES: STATES,

        // Public API
        initialize: () => instance.initialize(),
        startTask: (trigger, source, metadata) => instance.startTask(trigger, source, metadata),
        getStatus: () => instance.getStatus(),
        completeTask: (result) => instance.completeTask(result),
        failTask: (error) => instance.failTask(error),
        on: (event, callback) => instance.on(event, callback),

        // Context API
        buildContext: (taskId, runtimeData) => instance.buildContext(taskId, runtimeData),
        setRecommendation: (taskId, recommendation) => instance.setRecommendation(taskId, recommendation),
        setApproval: (taskId, approval) => instance.setApproval(taskId, approval),

        // Explorer
        getExplorerData: () => instance.getExplorerData()
    };

    console.log('[Autonomous] Part 50.1 loaded ✅');
    console.log('[Autonomous] Available states:', Object.values(STATES).join(' → '));

})();
