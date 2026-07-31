// ==================================================
// Part 50.6 — Action Planner
// Version: v5.0.6
// Module: Runtime Autonomous Layer
// File: autonomousActionPlanner.js
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
        console.warn('[ActionPlanner] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Plan Status
    // ==================================================
    const PLAN_STATUS = {
        DRAFT: 'DRAFT',
        PENDING: 'PENDING',
        EXECUTING: 'EXECUTING',
        PAUSED: 'PAUSED',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        ROLLED_BACK: 'ROLLED_BACK',
        CANCELLED: 'CANCELLED'
    };

    // ==================================================
    // Step Status
    // ==================================================
    const STEP_STATUS = {
        PENDING: 'PENDING',
        EXECUTING: 'EXECUTING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED',
        SKIPPED: 'SKIPPED',
        ROLLED_BACK: 'ROLLED_BACK'
    };

    // ==================================================
    // Step Model (Chapter 5)
    // ==================================================
    class ExecutionStep {
        constructor(config) {
            this.stepId = config.stepId || this._generateId();
            this.action = config.action || '';
            this.target = config.target || '';
            this.dependency = config.dependency || null;
            this.status = STEP_STATUS.PENDING;
            this.parameters = config.parameters || {};
            this.result = null;
            this.error = null;
            this.startedAt = null;
            this.completedAt = null;
        }

        _generateId() {
            return `step_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        start() {
            if (this.status !== STEP_STATUS.PENDING) {
                console.warn(`[Step ${this.stepId}] Cannot start in ${this.status} state`);
                return false;
            }
            this.status = STEP_STATUS.EXECUTING;
            this.startedAt = Date.now();
            return true;
        }

        complete(result) {
            if (this.status !== STEP_STATUS.EXECUTING) {
                console.warn(`[Step ${this.stepId}] Cannot complete in ${this.status} state`);
                return false;
            }
            this.status = STEP_STATUS.COMPLETED;
            this.completedAt = Date.now();
            this.result = result;
            return true;
        }

        fail(error) {
            this.status = STEP_STATUS.FAILED;
            this.completedAt = Date.now();
            this.error = error;
            return true;
        }

        skip() {
            this.status = STEP_STATUS.SKIPPED;
            this.completedAt = Date.now();
            return true;
        }

        rollback() {
            this.status = STEP_STATUS.ROLLED_BACK;
            this.completedAt = Date.now();
            return true;
        }

        isComplete() {
            return [STEP_STATUS.COMPLETED, STEP_STATUS.SKIPPED, STEP_STATUS.FAILED, STEP_STATUS.ROLLED_BACK].includes(this.status);
        }

        isBlocked() {
            return this.status === STEP_STATUS.PENDING && this.dependency !== null;
        }

        toJSON() {
            return {
                stepId: this.stepId,
                action: this.action,
                target: this.target,
                dependency: this.dependency,
                status: this.status,
                parameters: this.parameters,
                result: this.result,
                error: this.error,
                startedAt: this.startedAt,
                completedAt: this.completedAt,
                duration: this.startedAt && this.completedAt ? this.completedAt - this.startedAt : null
            };
        }
    }

    // ==================================================
    // Execution Plan (Chapter 4)
    // ==================================================
    class ExecutionPlan {
        constructor(config) {
            this.planId = config.planId || this._generateId();
            this.recommendationId = config.recommendationId || null;
            this.steps = [];
            this.rollback = config.rollback || null;
            this.priority = config.priority || 'NORMAL';
            this.estimatedDuration = config.estimatedDuration || 'unknown';
            this.status = PLAN_STATUS.DRAFT;
            this.createdAt = Date.now();
            this.updatedAt = Date.now();
            this.executedAt = null;
            this.completedAt = null;
            this.metadata = config.metadata || {};
            this.error = null;
        }

        _generateId() {
            return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        }

        addStep(step) {
            this.steps.push(step);
            this.updatedAt = Date.now();
            return this;
        }

        addSteps(steps) {
            steps.forEach(step => this.addStep(step));
            return this;
        }

        getStep(stepId) {
            return this.steps.find(s => s.stepId === stepId) || null;
        }

        getSteps(filter) {
            let steps = this.steps;
            if (filter && filter.status) {
                steps = steps.filter(s => s.status === filter.status);
            }
            return steps.map(s => s.toJSON());
        }

        getPendingSteps() {
            return this.steps.filter(s => s.status === STEP_STATUS.PENDING);
        }

        getCompletedSteps() {
            return this.steps.filter(s => s.isComplete());
        }

        getProgress() {
            const total = this.steps.length;
            if (total === 0) return 0;

            const completed = this.steps.filter(s => s.status === STEP_STATUS.COMPLETED).length;
            const failed = this.steps.filter(s => s.status === STEP_STATUS.FAILED).length;
            const skipped = this.steps.filter(s => s.status === STEP_STATUS.SKIPPED).length;

            const done = completed + skipped;
            return Math.round((done / total) * 100);
        }

        getStatus() {
            const progress = this.getProgress();
            
            if (this.status === PLAN_STATUS.CANCELLED) return PLAN_STATUS.CANCELLED;
            if (this.status === PLAN_STATUS.ROLLED_BACK) return PLAN_STATUS.ROLLED_BACK;
            if (this.status === PLAN_STATUS.FAILED) return PLAN_STATUS.FAILED;
            if (this.status === PLAN_STATUS.PAUSED) return PLAN_STATUS.PAUSED;
            if (this.status === PLAN_STATUS.COMPLETED) return PLAN_STATUS.COMPLETED;
            if (this.status === PLAN_STATUS.EXECUTING) return PLAN_STATUS.EXECUTING;
            if (progress === 100) return PLAN_STATUS.COMPLETED;
            
            return this.status;
        }

        start() {
            if (this.status === PLAN_STATUS.DRAFT || this.status === PLAN_STATUS.PENDING) {
                this.status = PLAN_STATUS.EXECUTING;
                this.executedAt = Date.now();
                this.updatedAt = Date.now();
                return true;
            }
            console.warn(`[Plan ${this.planId}] Cannot start in ${this.status} state`);
            return false;
        }

        pause() {
            if (this.status === PLAN_STATUS.EXECUTING) {
                this.status = PLAN_STATUS.PAUSED;
                this.updatedAt = Date.now();
                return true;
            }
            return false;
        }

        resume() {
            if (this.status === PLAN_STATUS.PAUSED) {
                this.status = PLAN_STATUS.EXECUTING;
                this.updatedAt = Date.now();
                return true;
            }
            return false;
        }

        complete() {
            this.status = PLAN_STATUS.COMPLETED;
            this.completedAt = Date.now();
            this.updatedAt = Date.now();
            return true;
        }

        fail(error) {
            this.status = PLAN_STATUS.FAILED;
            this.completedAt = Date.now();
            this.error = error;
            this.updatedAt = Date.now();
            return true;
        }

        cancel() {
            this.status = PLAN_STATUS.CANCELLED;
            this.completedAt = Date.now();
            this.updatedAt = Date.now();
            return true;
        }

        rollback() {
            this.status = PLAN_STATUS.ROLLED_BACK;
            this.completedAt = Date.now();
            this.updatedAt = Date.now();
            return true;
        }

        isExecutable() {
            return this.status === PLAN_STATUS.DRAFT || 
                   this.status === PLAN_STATUS.PENDING || 
                   this.status === PLAN_STATUS.PAUSED;
        }

        toJSON() {
            return {
                planId: this.planId,
                recommendationId: this.recommendationId,
                steps: this.steps.map(s => s.toJSON()),
                rollback: this.rollback,
                priority: this.priority,
                estimatedDuration: this.estimatedDuration,
                status: this.getStatus(),
                progress: this.getProgress(),
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                executedAt: this.executedAt,
                completedAt: this.completedAt,
                metadata: this.metadata,
                error: this.error
            };
        }
    }

    // ==================================================
    // Action Planner (Chapter 1-3)
    // ==================================================
    class ActionPlanner {
        constructor() {
            this._plans = [];
            this._activePlan = null;
            this._listeners = {};
            this._initialized = false;
            this._config = {
                maxConcurrentPlans: 5,
                autoStartPlans: false,
                requireStepValidation: true,
                defaultTimeout: 300000 // 5 minutes
            };
            this._stepHandlers = this._initStepHandlers();
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ActionPlanner] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ActionPlanner] Initializing...');

            // Connect to Governance (Chapter 8)
            this._connectToGovernance();

            // Connect to Approval Bridge
            this._connectToApprovalBridge();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[ActionPlanner] Initialized ✅');
            return this;
        }

        // ==============================================
        // Core: Create Plan (Chapter 2-3)
        // ==============================================

        createPlan(recommendation, options) {
            console.log(`[ActionPlanner] Creating plan for recommendation: ${recommendation.recommendationId}`);

            // Validate recommendation
            const validation = this._validateRecommendation(recommendation);
            if (!validation.valid) {
                console.warn('[ActionPlanner] Invalid recommendation:', validation.issues);
                return null;
            }

            // Generate steps from recommendation
            const steps = this._generateSteps(recommendation, options);

            // Generate rollback plan (Chapter 7)
            const rollback = this._generateRollbackPlan(recommendation, steps);

            // Create execution plan
            const plan = new ExecutionPlan({
                recommendationId: recommendation.recommendationId,
                priority: recommendation.priority || 'NORMAL',
                estimatedDuration: this._estimateDuration(steps),
                rollback: rollback,
                metadata: {
                    recommendation: recommendation,
                    options: options || {},
                    generatedAt: Date.now()
                }
            });

            // Add steps
            plan.addSteps(steps);

            // Validate plan (Chapter 6)
            const planValidation = this.validatePlan(plan);
            if (!planValidation.valid && this._config.requireStepValidation) {
                console.warn('[ActionPlanner] Plan validation failed:', planValidation.issues);
                // Still create but mark as draft with issues
                plan.metadata.validationIssues = planValidation.issues;
            }

            // Store
            this._plans.push(plan);

            // Auto-start if configured
            if (this._config.autoStartPlans && plan.isExecutable()) {
                this.startPlan(plan.planId);
            }

            this._emit('planCreated', plan.toJSON());
            console.log(`[ActionPlanner] Plan created: ${plan.planId}`);

            return plan;
        }

        // ==============================================
        // Plan Management
        // ==============================================

        getPlan(id) {
            const plan = this._plans.find(p => p.planId === id);
            return plan ? plan.toJSON() : null;
        }

        getPlans(filter) {
            let plans = [...this._plans];

            if (filter) {
                if (filter.status) {
                    plans = plans.filter(p => p.getStatus() === filter.status);
                }
                if (filter.priority) {
                    plans = plans.filter(p => p.priority === filter.priority);
                }
                if (filter.recommendationId) {
                    plans = plans.filter(p => p.recommendationId === filter.recommendationId);
                }
                if (filter.limit) {
                    plans = plans.slice(-filter.limit);
                }
            }

            return plans.map(p => p.toJSON());
        }

        getActivePlan() {
            return this._activePlan ? this._activePlan.toJSON() : null;
        }

        getExecutablePlans() {
            return this._plans
                .filter(p => p.isExecutable())
                .map(p => p.toJSON());
        }

        // ==============================================
        // Plan Execution Control
        // ==============================================

        startPlan(planId) {
            const plan = this._findPlan(planId);
            if (!plan) {
                console.warn(`[ActionPlanner] Plan not found: ${planId}`);
                return false;
            }

            if (!plan.isExecutable()) {
                console.warn(`[ActionPlanner] Plan not executable: ${planId}`);
                return false;
            }

            // Check concurrency limit
            const executing = this._plans.filter(p => p.status === PLAN_STATUS.EXECUTING);
            if (executing.length >= this._config.maxConcurrentPlans) {
                console.warn('[ActionPlanner] Max concurrent plans reached');
                return false;
            }

            plan.start();
            this._activePlan = plan;

            this._emit('planStarted', plan.toJSON());
            console.log(`[ActionPlanner] Plan started: ${planId}`);

            // Process steps
            this._executePlan(plan);

            return true;
        }

        pausePlan(planId) {
            const plan = this._findPlan(planId);
            if (!plan) return false;

            const result = plan.pause();
            if (result) {
                this._emit('planPaused', plan.toJSON());
                console.log(`[ActionPlanner] Plan paused: ${planId}`);
            }
            return result;
        }

        resumePlan(planId) {
            const plan = this._findPlan(planId);
            if (!plan) return false;

            const result = plan.resume();
            if (result) {
                this._emit('planResumed', plan.toJSON());
                console.log(`[ActionPlanner] Plan resumed: ${planId}`);
                this._executePlan(plan);
            }
            return result;
        }

        cancelPlan(planId, reason) {
            const plan = this._findPlan(planId);
            if (!plan) return false;

            const result = plan.cancel();
            if (result) {
                plan.metadata.cancelReason = reason || 'Cancelled by user';
                this._emit('planCancelled', plan.toJSON());
                console.log(`[ActionPlanner] Plan cancelled: ${planId}`);
                
                if (this._activePlan && this._activePlan.planId === planId) {
                    this._activePlan = null;
                }
            }
            return result;
        }

        // ==============================================
        // Rollback (Chapter 7)
        // ==============================================

        rollbackPlan(planId, reason) {
            const plan = this._findPlan(planId);
            if (!plan) return false;

            // Mark all steps as rolled back
            plan.steps.forEach(step => {
                if (!step.isComplete()) {
                    step.rollback();
                }
            });

            plan.rollback();
            plan.metadata.rollbackReason = reason || 'Rollback requested';

            this._emit('planRolledBack', plan.toJSON());
            console.log(`[ActionPlanner] Plan rolled back: ${planId}`);

            if (this._activePlan && this._activePlan.planId === planId) {
                this._activePlan = null;
            }

            return true;
        }

        // ==============================================
        // Step Execution
        // ==============================================

        executeStep(planId, stepId) {
            const plan = this._findPlan(planId);
            if (!plan) return false;

            const step = plan.getStep(stepId);
            if (!step) return false;

            // Check dependency
            if (step.dependency) {
                const depStep = plan.getStep(step.dependency);
                if (depStep && depStep.status !== STEP_STATUS.COMPLETED) {
                    console.warn(`[ActionPlanner] Step ${stepId} blocked by dependency: ${step.dependency}`);
                    return false;
                }
            }

            step.start();
            this._emit('stepStarted', { planId, step: step.toJSON() });

            // Execute step (simulated for now)
            try {
                const result = this._executeStepAction(step);
                step.complete(result);
                this._emit('stepCompleted', { planId, step: step.toJSON() });
                console.log(`[ActionPlanner] Step completed: ${stepId}`);
            } catch (error) {
                step.fail(error.message);
                this._emit('stepFailed', { planId, step: step.toJSON(), error });
                console.error(`[ActionPlanner] Step failed: ${stepId}`, error);
                return false;
            }

            // Check if plan is complete
            this._checkPlanCompletion(plan);

            return true;
        }

        // ==============================================
        // Plan Validation (Chapter 6)
        // ==============================================

        validatePlan(plan) {
            const issues = [];

            // Check steps
            if (!plan.steps || plan.steps.length === 0) {
                issues.push('Plan has no steps');
            }

            // Check each step
            plan.steps.forEach((step, index) => {
                if (!step.action) {
                    issues.push(`Step ${index + 1}: Missing action`);
                }
                if (!step.target) {
                    issues.push(`Step ${index + 1}: Missing target`);
                }
                // Check dependency exists
                if (step.dependency) {
                    const depExists = plan.steps.some(s => s.stepId === step.dependency);
                    if (!depExists) {
                        issues.push(`Step ${index + 1}: Dependency '${step.dependency}' not found`);
                    }
                }
            });

            // Check rollback
            if (!plan.rollback || !plan.rollback.steps || plan.rollback.steps.length === 0) {
                issues.push('Plan missing rollback strategy');
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        // ==============================================
        // Statistics
        // ==============================================

        getPlannerStats() {
            const total = this._plans.length;
            const draft = this._plans.filter(p => p.status === PLAN_STATUS.DRAFT).length;
            const pending = this._plans.filter(p => p.status === PLAN_STATUS.PENDING).length;
            const executing = this._plans.filter(p => p.status === PLAN_STATUS.EXECUTING).length;
            const paused = this._plans.filter(p => p.status === PLAN_STATUS.PAUSED).length;
            const completed = this._plans.filter(p => p.status === PLAN_STATUS.COMPLETED).length;
            const failed = this._plans.filter(p => p.status === PLAN_STATUS.FAILED).length;
            const rolledBack = this._plans.filter(p => p.status === PLAN_STATUS.ROLLED_BACK).length;
            const cancelled = this._plans.filter(p => p.status === PLAN_STATUS.CANCELLED).length;

            const byPriority = {};
            ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].forEach(p => {
                byPriority[p] = this._plans.filter(plan => plan.priority === p).length;
            });

            const avgSteps = total > 0
                ? this._plans.reduce((sum, p) => sum + p.steps.length, 0) / total
                : 0;

            const successRate = completed + failed > 0
                ? Math.round((completed / (completed + failed)) * 100)
                : 0;

            return {
                total,
                draft,
                pending,
                executing,
                paused,
                completed,
                failed,
                rolledBack,
                cancelled,
                byPriority,
                avgSteps: Math.round(avgSteps * 10) / 10,
                successRate,
                active: executing + paused
            };
        }

        // ==============================================
        // Explorer Support (Chapter 9)
        // ==============================================

        getExplorerData() {
            const stats = this.getPlannerStats();
            const active = this.getActivePlan();
            const recent = this.getPlans({ limit: 5 });

            return {
                type: 'action_planner',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                activePlan: active,
                recentPlans: recent,
                config: this._config
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

        _emit(event, data) {
            if (this._listeners[event]) {
                this._listeners[event].forEach(cb => {
                    try {
                        cb(data);
                    } catch (e) {
                        console.error(`[ActionPlanner] Listener error (${event}):`, e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`planner.${event}`, data);
            }
        }

        // ==============================================
        // Private Methods
        // ==============================================

        _findPlan(id) {
            return this._plans.find(p => p.planId === id) || null;
        }

        _validateRecommendation(recommendation) {
            const issues = [];

            if (!recommendation || !recommendation.recommendationId) {
                issues.push('Missing recommendation ID');
            }
            if (!recommendation.actionPlan) {
                issues.push('Missing action plan');
            }
            if (!recommendation.reason) {
                issues.push('Missing reason');
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        _generateSteps(recommendation, options) {
            const steps = [];
            const actionPlan = recommendation.actionPlan || { steps: [] };
            const stepConfigs = actionPlan.steps || [];

            if (stepConfigs.length === 0) {
                // Generate default steps
                steps.push(new ExecutionStep({
                    action: 'analyze_context',
                    target: 'runtime',
                    parameters: { recommendationId: recommendation.recommendationId }
                }));
                steps.push(new ExecutionStep({
                    action: 'apply_changes',
                    target: 'runtime',
                    dependency: steps[0].stepId,
                    parameters: { changes: recommendation.recommendation }
                }));
                steps.push(new ExecutionStep({
                    action: 'verify_outcome',
                    target: 'runtime',
                    dependency: steps[1].stepId,
                    parameters: { expected: 'success' }
                }));
            } else {
                stepConfigs.forEach((cfg, index) => {
                    steps.push(new ExecutionStep({
                        action: cfg.action || 'unknown',
                        target: cfg.target || 'runtime',
                        dependency: cfg.dependency || (index > 0 ? steps[index - 1].stepId : null),
                        parameters: cfg.parameters || {}
                    }));
                });
            }

            return steps;
        }

        _generateRollbackPlan(recommendation, steps) {
            const rollbackSteps = steps.map(step => ({
                stepId: `rollback_${step.stepId}`,
                action: `rollback_${step.action}`,
                target: step.target,
                originalStep: step.stepId
            }));

            return {
                steps: rollbackSteps,
                strategy: 'reverse_order',
                description: 'Rollback all executed steps in reverse order'
            };
        }

        _estimateDuration(steps) {
            const baseTime = steps.length * 30; // 30 seconds per step
            const minutes = Math.ceil(baseTime / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''}`;
        }

        _executePlan(plan) {
            // Find first pending step
            const pendingSteps = plan.getPendingSteps();
            if (pendingSteps.length === 0) {
                plan.complete();
                this._emit('planCompleted', plan.toJSON());
                console.log(`[ActionPlanner] Plan completed: ${plan.planId}`);
                return;
            }

            // Find steps that can be executed (dependencies met)
            const executable = pendingSteps.filter(step => {
                if (!step.dependency) return true;
                const depStep = plan.getStep(step.dependency);
                return depStep && depStep.status === STEP_STATUS.COMPLETED;
            });

            if (executable.length === 0) {
                console.warn(`[ActionPlanner] No executable steps in plan: ${plan.planId}`);
                return;
            }

            // Execute first executable step
            const step = executable[0];
            this.executeStep(plan.planId, step.stepId);
        }

        _executeStepAction(step) {
            // Simulate step execution
            // In real implementation, this would call actual runtime operations
            console.log(`[ActionPlanner] Executing step: ${step.action} on ${step.target}`);
            
            // Simulate async work
            return {
                success: true,
                message: `Executed ${step.action}`,
                timestamp: Date.now()
            };
        }

        _checkPlanCompletion(plan) {
            const pending = plan.getPendingSteps();
            if (pending.length === 0) {
                plan.complete();
                this._emit('planCompleted', plan.toJSON());
                console.log(`[ActionPlanner] Plan completed: ${plan.planId}`);
                this._activePlan = null;
            }
        }

        _initStepHandlers() {
            return {
                'analyze_context': {
                    handler: (step) => {
                        // Analyze runtime context
                        return { success: true, context: 'analyzed' };
                    }
                },
                'apply_changes': {
                    handler: (step) => {
                        // Apply changes to runtime
                        return { success: true, changes: 'applied' };
                    }
                },
                'verify_outcome': {
                    handler: (step) => {
                        // Verify the outcome
                        return { success: true, verified: true };
                    }
                }
            };
        }

        // ==============================================
        // Integrations (Chapter 8)
        // ==============================================

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[ActionPlanner] Connected to Governance');
            }
        }

        _connectToApprovalBridge() {
            if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
                // Listen for approved requests
                window.LawAIApp.ApprovalBridge.on('requestApproved', (request) => {
                    // Create plan from approved recommendation
                    const recommendation = request.metadata?.recommendation;
                    if (recommendation) {
                        this.createPlan(recommendation);
                    }
                });
                console.log('[ActionPlanner] Connected to Approval Bridge');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'action-planner',
                        name: 'Action Planner',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ActionPlanner] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ActionPlanner] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new ActionPlanner();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ActionPlanner = {
        Core: instance,
        PLAN_STATUS: PLAN_STATUS,
        STEP_STATUS: STEP_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        createPlan: (recommendation, options) => instance.createPlan(recommendation, options),

        getPlan: (id) => instance.getPlan(id),
        getPlans: (filter) => instance.getPlans(filter),
        getActivePlan: () => instance.getActivePlan(),
        getExecutablePlans: () => instance.getExecutablePlans(),

        startPlan: (id) => instance.startPlan(id),
        pausePlan: (id) => instance.pausePlan(id),
        resumePlan: (id) => instance.resumePlan(id),
        cancelPlan: (id, reason) => instance.cancelPlan(id, reason),
        rollbackPlan: (id, reason) => instance.rollbackPlan(id, reason),

        executeStep: (planId, stepId) => instance.executeStep(planId, stepId),
        validatePlan: (plan) => instance.validatePlan(plan),

        getPlannerStats: () => instance.getPlannerStats(),
        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[ActionPlanner] Part 50.6 loaded ✅');
    console.log('[ActionPlanner] Plan Statuses:', Object.values(PLAN_STATUS).join(' | '));
    console.log('[ActionPlanner] Step Statuses:', Object.values(STEP_STATUS).join(' | '));

})();
