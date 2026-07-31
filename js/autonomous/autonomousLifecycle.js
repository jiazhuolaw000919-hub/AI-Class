// ==================================================
// Part 50.2 — Autonomous Lifecycle Manager
// Version: v5.0.2
// Module: Runtime Autonomous Layer
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.LifecycleManager) {
        console.warn('[LifecycleManager] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Lifecycle States
    // ==================================================
    const LIFECYCLE_STATES = {
        CREATED: 'CREATED',
        OBSERVING: 'OBSERVING',
        ANALYZING: 'ANALYZING',
        DECIDING: 'DECIDING',
        WAITING_APPROVAL: 'WAITING_APPROVAL',
        EXECUTING: 'EXECUTING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        CANCELLED: 'CANCELLED'
    };

    // ==================================================
    // Valid State Transitions
    // ==================================================
    const VALID_TRANSITIONS = {
        CREATED: ['OBSERVING', 'CANCELLED'],
        OBSERVING: ['ANALYZING', 'FAILED', 'CANCELLED'],
        ANALYZING: ['DECIDING', 'FAILED', 'CANCELLED'],
        DECIDING: ['WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED'],
        WAITING_APPROVAL: ['EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED'],
        EXECUTING: ['COMPLETED', 'FAILED', 'CANCELLED'],
        COMPLETED: [],
        FAILED: [],
        CANCELLED: []
    };

    // ==================================================
    // Task Model
    // ==================================================
    class AutonomousTask {
        constructor(config) {
            this.taskId = config.taskId || this._generateTaskId();
            this.sessionId = config.sessionId || null;
            this.trigger = config.trigger || 'manual';
            this.state = LIFECYCLE_STATES.CREATED;
            this.priority = config.priority || 'NORMAL';
            this.createdAt = Date.now();
            this.updatedAt = Date.now();
            this.owner = config.owner || 'system';
            this.context = config.context || {};
            this.history = [];
            this.result = null;
            this.error = null;
            this.metadata = config.metadata || {};
        }

        _generateTaskId() {
            return `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        transition(newState, reason) {
            // Validate transition
            const valid = VALID_TRANSITIONS[this.state] || [];
            if (!valid.includes(newState)) {
                console.error(
                    `[Task ${this.taskId}] Invalid transition: ${this.state} → ${newState}`
                );
                return false;
            }

            // Record history
            this.history.push({
                from: this.state,
                to: newState,
                timestamp: Date.now(),
                reason: reason || 'state_change'
            });

            // Update state
            this.state = newState;
            this.updatedAt = Date.now();

            console.log(`[Task ${this.taskId}] ${this.state} → ${newState}${reason ? ` (${reason})` : ''}`);
            return true;
        }

        complete(result) {
            if (this.transition(LIFECYCLE_STATES.COMPLETED, 'task_completed')) {
                this.result = result;
                return true;
            }
            return false;
        }

        fail(error) {
            if (this.transition(LIFECYCLE_STATES.FAILED, 'task_failed')) {
                this.error = error;
                return true;
            }
            return false;
        }

        cancel(reason) {
            if (this.transition(LIFECYCLE_STATES.CANCELLED, reason || 'task_cancelled')) {
                return true;
            }
            return false;
        }

        toJSON() {
            return {
                taskId: this.taskId,
                sessionId: this.sessionId,
                trigger: this.trigger,
                state: this.state,
                priority: this.priority,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                owner: this.owner,
                context: this.context,
                history: this.history,
                result: this.result,
                error: this.error,
                metadata: this.metadata
            };
        }

        getDuration() {
            if (this.state === LIFECYCLE_STATES.COMPLETED || 
                this.state === LIFECYCLE_STATES.FAILED || 
                this.state === LIFECYCLE_STATES.CANCELLED) {
                return this.updatedAt - this.createdAt;
            }
            return Date.now() - this.createdAt;
        }

        getStateHistory() {
            return this.history;
        }
    }

    // ==================================================
    // Session Model
    // ==================================================
    class AutonomousSession {
        constructor(config) {
            this.sessionId = config.sessionId || this._generateSessionId();
            this.createdAt = Date.now();
            this.updatedAt = Date.now();
            this.tasks = [];
            this.context = config.context || {};
            this.metadata = config.metadata || {};
            this.status = 'active';
        }

        _generateSessionId() {
            return `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        addTask(task) {
            task.sessionId = this.sessionId;
            this.tasks.push(task);
            this.updatedAt = Date.now();
            return task;
        }

        getTask(taskId) {
            return this.tasks.find(t => t.taskId === taskId) || null;
        }

        getTasks(filter) {
            let tasks = this.tasks;
            if (filter && filter.state) {
                tasks = tasks.filter(t => t.state === filter.state);
            }
            if (filter && filter.trigger) {
                tasks = tasks.filter(t => t.trigger === filter.trigger);
            }
            return tasks.map(t => t.toJSON());
        }

        getActiveTasks() {
            const activeStates = [
                LIFECYCLE_STATES.CREATED,
                LIFECYCLE_STATES.OBSERVING,
                LIFECYCLE_STATES.ANALYZING,
                LIFECYCLE_STATES.DECIDING,
                LIFECYCLE_STATES.WAITING_APPROVAL,
                LIFECYCLE_STATES.EXECUTING
            ];
            return this.tasks
                .filter(t => activeStates.includes(t.state))
                .map(t => t.toJSON());
        }

        getCompletedTasks() {
            const completedStates = [
                LIFECYCLE_STATES.COMPLETED,
                LIFECYCLE_STATES.FAILED,
                LIFECYCLE_STATES.CANCELLED
            ];
            return this.tasks
                .filter(t => completedStates.includes(t.state))
                .map(t => t.toJSON());
        }

        getStats() {
            const total = this.tasks.length;
            const completed = this.tasks.filter(t => t.state === LIFECYCLE_STATES.COMPLETED).length;
            const failed = this.tasks.filter(t => t.state === LIFECYCLE_STATES.FAILED).length;
            const cancelled = this.tasks.filter(t => t.state === LIFECYCLE_STATES.CANCELLED).length;
            const active = total - completed - failed - cancelled;

            return {
                total,
                active,
                completed,
                failed,
                cancelled,
                successRate: total > 0 ? (completed / total * 100).toFixed(1) : 0
            };
        }

        close() {
            // Cancel all active tasks
            const activeTasks = this.tasks.filter(t => {
                const activeStates = [
                    LIFECYCLE_STATES.CREATED,
                    LIFECYCLE_STATES.OBSERVING,
                    LIFECYCLE_STATES.ANALYZING,
                    LIFECYCLE_STATES.DECIDING,
                    LIFECYCLE_STATES.WAITING_APPROVAL,
                    LIFECYCLE_STATES.EXECUTING
                ];
                return activeStates.includes(t.state);
            });

            activeTasks.forEach(t => t.cancel('session_closed'));
            this.status = 'closed';
            this.updatedAt = Date.now();

            console.log(`[Session ${this.sessionId}] Closed with ${activeTasks.length} tasks cancelled`);
            return this;
        }

        toJSON() {
            return {
                sessionId: this.sessionId,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                status: this.status,
                taskCount: this.tasks.length,
                stats: this.getStats(),
                context: this.context,
                metadata: this.metadata
            };
        }
    }

    // ==================================================
    // Lifecycle Manager
    // ==================================================
    class LifecycleManager {
        constructor() {
            this._sessions = [];
            this._activeSession = null;
            this._listeners = [];
            this._initialized = false;
            this._config = {
                maxConcurrentTasks: 10,
                autoCleanupCompleted: true,
                cleanupAfterMs: 3600000 // 1 hour
            };
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[LifecycleManager] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[LifecycleManager] Initializing...');

            // Connect to Autonomous Core
            this._connectToAutonomousCore();

            // Connect to Decision Engine
            this._connectToDecisionEngine();

            // Connect to Governance
            this._connectToGovernance();

            // Register with Explorer
            this._registerWithExplorer();

            // Start cleanup interval
            if (this._config.autoCleanupCompleted) {
                setInterval(() => this._cleanupSessions(), this._config.cleanupAfterMs);
            }

            this._initialized = true;
            console.log('[LifecycleManager] Initialized ✅');
            return this;
        }

        // ==============================================
        // Session Management
        // ==============================================

        createSession(context, metadata) {
            const session = new AutonomousSession({
                context: context || {},
                metadata: metadata || {}
            });

            this._sessions.push(session);
            this._activeSession = session;

            this._emit('sessionCreated', session.toJSON());
            console.log(`[LifecycleManager] Session created: ${session.sessionId}`);

            return session;
        }

        getActiveSession() {
            return this._activeSession ? this._activeSession.toJSON() : null;
        }

        getSession(sessionId) {
            const session = this._sessions.find(s => s.sessionId === sessionId);
            return session ? session.toJSON() : null;
        }

        getSessions(limit = 10) {
            return this._sessions
                .slice(-limit)
                .reverse()
                .map(s => s.toJSON());
        }

        closeSession(sessionId) {
            const session = this._sessions.find(s => s.sessionId === sessionId);
            if (!session) {
                console.warn(`[LifecycleManager] Session not found: ${sessionId}`);
                return false;
            }

            session.close();
            this._emit('sessionClosed', session.toJSON());

            if (this._activeSession && this._activeSession.sessionId === sessionId) {
                this._activeSession = null;
            }

            return true;
        }

        // ==============================================
        // Task Management
        // ==============================================

        createTask(trigger, priority, context, metadata) {
            // Check if we have an active session
            if (!this._activeSession) {
                // Auto-create a session
                console.log('[LifecycleManager] No active session, creating one...');
                this.createSession({ autoCreated: true });
            }

            // Check concurrency limit
            const activeTasks = this._activeSession.getActiveTasks().length;
            if (activeTasks >= this._config.maxConcurrentTasks) {
                console.warn(`[LifecycleManager] Max concurrent tasks reached (${this._config.maxConcurrentTasks})`);
                return null;
            }

            const task = new AutonomousTask({
                trigger: trigger,
                priority: priority || 'NORMAL',
                context: context || {},
                metadata: metadata || {},
                sessionId: this._activeSession.sessionId
            });

            this._activeSession.addTask(task);

            this._emit('taskCreated', task.toJSON());
            console.log(`[LifecycleManager] Task created: ${task.taskId} (${trigger})`);

            return task;
        }

        getTask(taskId) {
            if (!this._activeSession) {
                return null;
            }
            const task = this._activeSession.getTask(taskId);
            return task ? task.toJSON() : null;
        }

        getTasks(filter) {
            if (!this._activeSession) {
                return [];
            }
            return this._activeSession.getTasks(filter);
        }

        getActiveTasks() {
            if (!this._activeSession) {
                return [];
            }
            return this._activeSession.getActiveTasks();
        }

        // ==============================================
        // Task State Transitions
        // ==============================================

        transitionTask(taskId, newState, reason) {
            if (!this._activeSession) {
                console.warn('[LifecycleManager] No active session');
                return false;
            }

            const task = this._activeSession.getTask(taskId);
            if (!task) {
                console.warn(`[LifecycleManager] Task not found: ${taskId}`);
                return false;
            }

            const result = task.transition(newState, reason);
            if (result) {
                this._emit('taskStateChanged', {
                    taskId: taskId,
                    from: task.history[task.history.length - 1]?.from || 'unknown',
                    to: newState,
                    reason: reason
                });
            }

            return result;
        }

        completeTask(taskId, result) {
            if (!this._activeSession) {
                console.warn('[LifecycleManager] No active session');
                return false;
            }

            const task = this._activeSession.getTask(taskId);
            if (!task) {
                console.warn(`[LifecycleManager] Task not found: ${taskId}`);
                return false;
            }

            const success = task.complete(result);
            if (success) {
                this._emit('taskCompleted', task.toJSON());
                console.log(`[LifecycleManager] Task completed: ${taskId}`);
            }
            return success;
        }

        failTask(taskId, error) {
            if (!this._activeSession) {
                console.warn('[LifecycleManager] No active session');
                return false;
            }

            const task = this._activeSession.getTask(taskId);
            if (!task) {
                console.warn(`[LifecycleManager] Task not found: ${taskId}`);
                return false;
            }

            const success = task.fail(error);
            if (success) {
                this._emit('taskFailed', task.toJSON());
                console.error(`[LifecycleManager] Task failed: ${taskId}`, error);
            }
            return success;
        }

        cancelTask(taskId, reason) {
            if (!this._activeSession) {
                console.warn('[LifecycleManager] No active session');
                return false;
            }

            const task = this._activeSession.getTask(taskId);
            if (!task) {
                console.warn(`[LifecycleManager] Task not found: ${taskId}`);
                return false;
            }

            const success = task.cancel(reason);
            if (success) {
                this._emit('taskCancelled', task.toJSON());
                console.log(`[LifecycleManager] Task cancelled: ${taskId}`);
            }
            return success;
        }

        // ==============================================
        // Status & Stats
        // ==============================================

        getStatus() {
            const sessionStats = this._activeSession ? this._activeSession.getStats() : null;

            return {
                initialized: this._initialized,
                activeSession: this._activeSession ? this._activeSession.sessionId : null,
                totalSessions: this._sessions.length,
                activeTasks: this._activeSession ? this._activeSession.getActiveTasks().length : 0,
                sessionStats: sessionStats,
                config: this._config
            };
        }

        getSessionStats(sessionId) {
            const session = this._sessions.find(s => s.sessionId === sessionId);
            if (!session) {
                return null;
            }
            return session.getStats();
        }

        // ==============================================
        // Explorer Support
        // ==============================================

        getExplorerData() {
            return {
                type: 'lifecycle',
                status: this.getStatus(),
                activeSession: this._activeSession ? {
                    sessionId: this._activeSession.sessionId,
                    tasks: this._activeSession.getTasks(),
                    activeTasks: this._activeSession.getActiveTasks(),
                    stats: this._activeSession.getStats()
                } : null,
                recentSessions: this._sessions.slice(-5).map(s => ({
                    sessionId: s.sessionId,
                    taskCount: s.tasks.length,
                    stats: s.getStats(),
                    status: s.status
                }))
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

        _emit(event, data) {
            if (this._listeners && this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error(`[LifecycleManager] Listener error (${event}):`, e);
                    }
                });
            }

            // Also emit to global event bus
            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`lifecycle.${event}`, data);
            }
        }

        _cleanupSessions() {
            // Clean up old completed sessions
            const now = Date.now();
            const cutoff = now - this._config.cleanupAfterMs;

            this._sessions = this._sessions.filter(session => {
                // Keep active sessions
                if (session.status === 'active') return true;
                
                // Keep sessions with recent activity
                if (session.updatedAt > cutoff) return true;

                // Close and remove old sessions
                console.log(`[LifecycleManager] Cleaning up old session: ${session.sessionId}`);
                return false;
            });
        }

        // ==============================================
        // Integrations
        // ==============================================

        _connectToAutonomousCore() {
            if (window.LawAIApp && window.LawAIApp.Autonomous) {
                console.log('[LifecycleManager] Connected to Autonomous Core');
            }
        }

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                console.log('[LifecycleManager] Connected to Decision Engine');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[LifecycleManager] Connected to Governance');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'lifecycle-manager',
                        name: 'Lifecycle Manager',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[LifecycleManager] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[LifecycleManager] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new LifecycleManager();

    // Create namespace
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.LifecycleManager = {
        Core: instance,
        STATES: LIFECYCLE_STATES,

        // Public API
        initialize: (config) => instance.initialize(config),
        createSession: (context, metadata) => instance.createSession(context, metadata),
        getActiveSession: () => instance.getActiveSession(),
        getSession: (id) => instance.getSession(id),
        getSessions: (limit) => instance.getSessions(limit),
        closeSession: (id) => instance.closeSession(id),

        createTask: (trigger, priority, context, metadata) => 
            instance.createTask(trigger, priority, context, metadata),
        getTask: (id) => instance.getTask(id),
        getTasks: (filter) => instance.getTasks(filter),
        getActiveTasks: () => instance.getActiveTasks(),

        transitionTask: (id, state, reason) => 
            instance.transitionTask(id, state, reason),
        completeTask: (id, result) => instance.completeTask(id, result),
        failTask: (id, error) => instance.failTask(id, error),
        cancelTask: (id, reason) => instance.cancelTask(id, reason),

        getStatus: () => instance.getStatus(),
        getSessionStats: (id) => instance.getSessionStats(id),

        on: (event, callback) => instance.on(event, callback),
        getExplorerData: () => instance.getExplorerData()
    };

    console.log('[LifecycleManager] Part 50.2 loaded ✅');
    console.log('[LifecycleManager] States:', Object.values(LIFECYCLE_STATES).join(' → '));

})();
