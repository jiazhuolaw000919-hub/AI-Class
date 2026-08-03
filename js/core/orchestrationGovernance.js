// ============================================================
// orchestrationGovernance.js
// Part 55.5 — Orchestration Governance
// Version: v5.5.5
// Module: AI Orchestration Layer
// File: js/core/orchestrationGovernance.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OrchestrationGovernance) {
        console.warn('[OrchestrationGovernance] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Permission Levels (Chapter 7)
    // ============================================================
    const PERMISSION_LEVEL = {
        OBSERVE: { label: 'OBSERVE', score: 10, action: 'view' },
        ANALYZE: { label: 'ANALYZE', score: 30, action: 'analyze' },
        RECOMMEND: { label: 'RECOMMEND', score: 50, action: 'recommend' },
        PREPARE: { label: 'PREPARE', score: 70, action: 'prepare' },
        EXECUTE: { label: 'EXECUTE', score: 90, action: 'execute' }
    };

    // ============================================================
    // Risk Levels
    // ============================================================
    const RISK_LEVEL = {
        LOW: { label: 'LOW', score: 20, color: '#22c55e' },
        MEDIUM: { label: 'MEDIUM', score: 50, color: '#eab308' },
        HIGH: { label: 'HIGH', score: 75, color: '#f97316' },
        CRITICAL: { label: 'CRITICAL', score: 95, color: '#ef4444' }
    };

    // ============================================================
    // Governance Status
    // ============================================================
    const GOVERNANCE_STATUS = {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        REVIEW_REQUIRED: 'review_required',
        EXECUTED: 'executed',
        VIOLATED: 'violated'
    };

    // ============================================================
    // Governance Context Model (Chapter 5)
    // ============================================================
    class GovernanceContext {
        constructor(config) {
            this.governanceId = config.governanceId || this._generateId();
            this.timestamp = Date.now();
            this.workflowId = config.workflowId || null;
            this.participants = config.participants || [];
            this.riskLevel = config.riskLevel || RISK_LEVEL.MEDIUM;
            this.permission = config.permission || PERMISSION_LEVEL.OBSERVE;
            this.decision = config.decision || null;
            this.auditTrail = config.auditTrail || [];
            this.status = GOVERNANCE_STATUS.PENDING;
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `govctx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        addAudit(entry) {
            this.auditTrail.push({
                timestamp: Date.now(),
                ...entry
            });
            return this;
        }

        toJSON() {
            return {
                governanceId: this.governanceId,
                timestamp: this.timestamp,
                workflowId: this.workflowId,
                participants: this.participants,
                riskLevel: this.riskLevel,
                permission: this.permission,
                decision: this.decision,
                auditTrail: this.auditTrail,
                status: this.status,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Orchestration Governance Core (Chapter 1-4)
    // ============================================================
    class OrchestrationGovernance {
        constructor() {
            this._contexts = [];
            this._violations = [];
            this._permissions = {};
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxAuditSize: 500,
                defaultPermission: PERMISSION_LEVEL.OBSERVE,
                requireReviewForHighRisk: true,
                autoApproveLowRisk: true,
                violationDetection: true,
                maxViolationsPerWorkflow: 3
            };
            this._permissionMap = this._initPermissionMap();
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[OrchestrationGovernance] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[OrchestrationGovernance] Initializing...');

            // Connect to modules (Chapter 12)
            this._connectToEvolutionGovernance();
            this._connectToWorkflowManager();
            this._connectToPrioritySystem();
            this._connectToCoordinationEngine();
            this._connectToDecisionIntelligence();
            this._connectToRuntimeRegistry();

            // Register with Explorer (Chapter 13)
            this._registerWithExplorer();

            this._initialized = true;
            console.log('[OrchestrationGovernance] Initialized ✅');
            return this;
        }

        // ============================================================
        // Permission Map (Chapter 6-7)
        // ============================================================

        _initPermissionMap() {
            return {
                // Default permissions for each intelligence type
                'decision': PERMISSION_LEVEL.RECOMMEND,
                'predictive': PERMISSION_LEVEL.ANALYZE,
                'optimization': PERMISSION_LEVEL.RECOMMEND,
                'evolution': PERMISSION_LEVEL.OBSERVE,
                'knowledge': PERMISSION_LEVEL.ANALYZE,
                'governance': PERMISSION_LEVEL.EXECUTE
            };
        }

        setPermission(intelligence, permission) {
            this._permissionMap[intelligence] = permission;
            this._emit('permissionUpdated', {
                intelligence: intelligence,
                permission: permission
            });
            return this;
        }

        getPermission(intelligence) {
            return this._permissionMap[intelligence] || this._config.defaultPermission;
        }

        // ============================================================
        // Core: Validate (Chapter 4)
        // ============================================================

        validate(workflow, options) {
            console.log(`[OrchestrationGovernance] Validating workflow: ${workflow.workflowId || 'unknown'}`);

            // Check permissions
            const permissionCheck = this._checkPermissions(workflow);

            if (!permissionCheck.allowed) {
                return {
                    approved: false,
                    reason: `Permission denied: ${permissionCheck.reason}`,
                    permissionRequired: permissionCheck.required
                };
            }

            // Assess risk (Chapter 8)
            const risk = this._assessRisk(workflow);

            // Determine decision
            const decision = this._makeDecision(workflow, risk);

            // Create governance context
            const context = new GovernanceContext({
                workflowId: workflow.workflowId,
                participants: workflow.agents || [],
                riskLevel: risk,
                permission: permissionCheck.permissionUsed,
                decision: decision,
                status: decision.approved ? GOVERNANCE_STATUS.APPROVED : GOVERNANCE_STATUS.REVIEW_REQUIRED,
                metadata: {
                    validatedAt: Date.now(),
                    options: options || {}
                }
            });

            this._contexts.push(context);
            this._emit('workflowValidated', context.toJSON());

            return {
                approved: decision.approved,
                requireReview: decision.requireReview,
                reason: decision.reason,
                risk: risk,
                context: context.toJSON()
            };
        }

        // ============================================================
        // Permission Check (Chapter 7)
        // ============================================================

        _checkPermissions(workflow) {
            const participants = workflow.agents || [];

            for (const participant of participants) {
                const intelligence = participant.role || participant;
                const requiredLevel = this._getRequiredLevel(workflow, participant);
                const currentLevel = this.getPermission(intelligence);

                if (currentLevel.score < requiredLevel.score) {
                    return {
                        allowed: false,
                        reason: `Insufficient permission for ${intelligence}. Required: ${requiredLevel.label}, Current: ${currentLevel.label}`,
                        required: requiredLevel,
                        current: currentLevel,
                        permissionUsed: currentLevel
                    };
                }
            }

            return {
                allowed: true,
                permissionUsed: PERMISSION_LEVEL.PREPARE
            };
        }

        _getRequiredLevel(workflow, participant) {
            // Determine required permission based on workflow risk
            const risk = this._assessRisk(workflow);

            if (risk.score >= RISK_LEVEL.CRITICAL.score) {
                return PERMISSION_LEVEL.EXECUTE;
            }
            if (risk.score >= RISK_LEVEL.HIGH.score) {
                return PERMISSION_LEVEL.PREPARE;
            }
            if (risk.score >= RISK_LEVEL.MEDIUM.score) {
                return PERMISSION_LEVEL.RECOMMEND;
            }
            return PERMISSION_LEVEL.ANALYZE;
        }

        // ============================================================
        // Risk Assessment (Chapter 8)
        // ============================================================

        _assessRisk(workflow) {
            let score = 0;
            const factors = [];

            // Affected modules factor
            const moduleCount = (workflow.agents || []).length;
            if (moduleCount > 5) {
                score += 25;
                factors.push('multiple_modules');
            } else if (moduleCount > 3) {
                score += 15;
                factors.push('moderate_modules');
            }

            // System impact
            if (workflow.metadata?.impact) {
                if (workflow.metadata.impact === 'critical') {
                    score += 30;
                    factors.push('critical_impact');
                } else if (workflow.metadata.impact === 'high') {
                    score += 20;
                    factors.push('high_impact');
                }
            }

            // Data sensitivity
            if (workflow.objective && workflow.objective.toLowerCase().includes('security')) {
                score += 20;
                factors.push('sensitive_data');
            }

            // Execution risk
            if (workflow.metadata?.risk) {
                score += workflow.metadata.risk * 0.3;
                factors.push('execution_risk');
            }

            // Recovery capability
            if (workflow.metadata?.recovery === 'difficult') {
                score += 15;
                factors.push('difficult_recovery');
            }

            // Determine level
            let level;
            if (score >= 80) level = RISK_LEVEL.CRITICAL;
            else if (score >= 60) level = RISK_LEVEL.HIGH;
            else if (score >= 35) level = RISK_LEVEL.MEDIUM;
            else level = RISK_LEVEL.LOW;

            return {
                ...level,
                score: Math.min(100, Math.round(score)),
                factors: factors
            };
        }

        // ============================================================
        // Governance Decision (Chapter 9)
        // ============================================================

        _makeDecision(workflow, risk) {
            // Auto-approve low risk
            if (risk.score <= RISK_LEVEL.LOW.score && this._config.autoApproveLowRisk) {
                return {
                    approved: true,
                    requireReview: false,
                    reason: 'Auto-approved: Low risk workflow'
                };
            }

            // High risk requires review
            if (risk.score >= RISK_LEVEL.HIGH.score && this._config.requireReviewForHighRisk) {
                return {
                    approved: false,
                    requireReview: true,
                    reason: 'High risk workflow requires review'
                };
            }

            // Medium risk: review recommended
            if (risk.score >= RISK_LEVEL.MEDIUM.score) {
                return {
                    approved: false,
                    requireReview: true,
                    reason: 'Medium risk workflow, review recommended'
                };
            }

            // Default: approve
            return {
                approved: true,
                requireReview: false,
                reason: 'Approved: Meets governance criteria'
            };
        }

        // ============================================================
        // Violation Detection (Chapter 10)
        // ============================================================

        detectViolation(workflow, context) {
            if (!this._config.violationDetection) return null;

            const violations = [];

            // Check for unauthorized execution
            if (context.status === GOVERNANCE_STATUS.EXECUTED && 
                context.decision && !context.decision.approved) {
                violations.push({
                    type: 'unauthorized_execution',
                    severity: 'HIGH',
                    description: 'Workflow executed without approval',
                    workflowId: workflow.workflowId
                });
            }

            // Check for permission escalation
            const permissionUsed = context.permission || PERMISSION_LEVEL.OBSERVE;
            const requiredLevel = this._getRequiredLevel(workflow, { role: 'system' });
            if (permissionUsed.score > requiredLevel.score + 20) {
                violations.push({
                    type: 'permission_escalation',
                    severity: 'MEDIUM',
                    description: 'Permission level exceeded required level',
                    workflowId: workflow.workflowId
                });
            }

            // Check for governance conflict
            if (this._hasGovernanceConflict(workflow)) {
                violations.push({
                    type: 'governance_conflict',
                    severity: 'HIGH',
                    description: 'Workflow conflicts with existing governance rules',
                    workflowId: workflow.workflowId
                });
            }

            // Record violations
            violations.forEach(v => {
                this._violations.push({
                    ...v,
                    timestamp: Date.now(),
                    violationId: `vio_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
                });
                this._emit('violationDetected', v);
            });

            return violations;
        }

        _hasGovernanceConflict(workflow) {
            // Check if workflow conflicts with existing governance contexts
            const existing = this._contexts.filter(c => 
                c.status === GOVERNANCE_STATUS.APPROVED ||
                c.status === GOVERNANCE_STATUS.EXECUTED
            );

            return existing.some(c => 
                c.workflowId !== workflow.workflowId &&
                c.participants.some(p => workflow.agents?.includes(p))
            );
        }

        // ============================================================
        // Audit System (Chapter 11)
        // ============================================================

        audit(workflowId) {
            const context = this._contexts.find(c => c.workflowId === workflowId);
            if (!context) return null;

            return {
                governanceId: context.governanceId,
                workflowId: context.workflowId,
                participants: context.participants,
                decision: context.decision,
                status: context.status,
                riskLevel: context.riskLevel,
                permission: context.permission,
                auditTrail: context.auditTrail,
                violations: this._violations.filter(v => v.workflowId === workflowId),
                timestamp: context.timestamp
            };
        }

        getAuditTrail(filter) {
            let contexts = this._contexts;

            if (filter) {
                if (filter.status) {
                    contexts = contexts.filter(c => c.status === filter.status);
                }
                if (filter.workflowId) {
                    contexts = contexts.filter(c => c.workflowId === filter.workflowId);
                }
                if (filter.limit) {
                    contexts = contexts.slice(-filter.limit);
                }
            }

            return contexts.map(c => ({
                governanceId: c.governanceId,
                workflowId: c.workflowId,
                decision: c.decision,
                status: c.status,
                riskLevel: c.riskLevel,
                timestamp: c.timestamp
            }));
        }

        // ============================================================
        // Approve/Reject Workflow
        // ============================================================

        approve(workflowId, reason) {
            const context = this._contexts.find(c => c.workflowId === workflowId);
            if (!context) return false;

            if (context.status !== GOVERNANCE_STATUS.PENDING && 
                context.status !== GOVERNANCE_STATUS.REVIEW_REQUIRED) {
                return false;
            }

            context.status = GOVERNANCE_STATUS.APPROVED;
            context.decision = {
                approved: true,
                reason: reason || 'Approved by governance',
                timestamp: Date.now()
            };
            context.addAudit({ action: 'approved', reason: reason });

            this._emit('workflowApproved', context.toJSON());
            return true;
        }

        reject(workflowId, reason) {
            const context = this._contexts.find(c => c.workflowId === workflowId);
            if (!context) return false;

            if (context.status !== GOVERNANCE_STATUS.PENDING && 
                context.status !== GOVERNANCE_STATUS.REVIEW_REQUIRED) {
                return false;
            }

            context.status = GOVERNANCE_STATUS.REJECTED;
            context.decision = {
                approved: false,
                reason: reason || 'Rejected by governance',
                timestamp: Date.now()
            };
            context.addAudit({ action: 'rejected', reason: reason });

            this._emit('workflowRejected', context.toJSON());
            return true;
        }

        // ============================================================
        // Query Methods
        // ============================================================

        checkPermission(intelligence, action) {
            const permission = this.getPermission(intelligence);
            const actionMap = {
                'view': PERMISSION_LEVEL.OBSERVE,
                'analyze': PERMISSION_LEVEL.ANALYZE,
                'recommend': PERMISSION_LEVEL.RECOMMEND,
                'prepare': PERMISSION_LEVEL.PREPARE,
                'execute': PERMISSION_LEVEL.EXECUTE
            };

            const required = actionMap[action] || PERMISSION_LEVEL.OBSERVE;
            return permission.score >= required.score;
        }

        getViolations(filter) {
            let violations = this._violations;

            if (filter) {
                if (filter.severity) {
                    violations = violations.filter(v => v.severity === filter.severity);
                }
                if (filter.type) {
                    violations = violations.filter(v => v.type === filter.type);
                }
                if (filter.limit) {
                    violations = violations.slice(-filter.limit);
                }
            }

            return violations;
        }

        getStats() {
            const total = this._contexts.length;
            const approved = this._contexts.filter(c => c.status === GOVERNANCE_STATUS.APPROVED).length;
            const rejected = this._contexts.filter(c => c.status === GOVERNANCE_STATUS.REJECTED).length;
            const pending = this._contexts.filter(c => 
                c.status === GOVERNANCE_STATUS.PENDING || 
                c.status === GOVERNANCE_STATUS.REVIEW_REQUIRED
            ).length;
            const executed = this._contexts.filter(c => c.status === GOVERNANCE_STATUS.EXECUTED).length;

            const byRisk = {};
            Object.values(RISK_LEVEL).forEach(level => {
                byRisk[level.label] = this._contexts.filter(c => 
                    c.riskLevel.label === level.label
                ).length;
            });

            return {
                total,
                approved,
                rejected,
                pending,
                executed,
                byRisk,
                violations: this._violations.length,
                permissions: Object.keys(this._permissionMap).length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 13)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const recent = this.getAuditTrail({ limit: 5 });
            const violations = this.getViolations({ limit: 5 });

            return {
                type: 'orchestration_governance',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                recentAudits: recent,
                recentViolations: violations,
                permissions: this._permissionMap,
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
                        console.error('[OrchestrationGovernance] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`orchestrationgov.${event}`, data);
            }
        }

        // ============================================================
        // Integrations (Chapter 12)
        // ============================================================

        _connectToEvolutionGovernance() {
            if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
                console.log('[OrchestrationGovernance] Connected to Evolution Governance');
            }
        }

        _connectToWorkflowManager() {
            if (window.LawAIApp && window.LawAIApp.MultiAgentWorkflow) {
                console.log('[OrchestrationGovernance] Connected to Workflow Manager');
            }
        }

        _connectToPrioritySystem() {
            if (window.LawAIApp && window.LawAIApp.IntelligencePriority) {
                console.log('[OrchestrationGovernance] Connected to Priority System');
            }
        }

        _connectToCoordinationEngine() {
            if (window.LawAIApp && window.LawAIApp.IntelligenceCoordination) {
                console.log('[OrchestrationGovernance] Connected to Coordination Engine');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[OrchestrationGovernance] Connected to Decision Intelligence');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[OrchestrationGovernance] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'orchestration-governance',
                        name: 'Orchestration Governance',
                        category: 'orchestration',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[OrchestrationGovernance] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[OrchestrationGovernance] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[OrchestrationGovernance] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new OrchestrationGovernance();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.OrchestrationGovernance = {
        Core: instance,
        PERMISSION_LEVEL: PERMISSION_LEVEL,
        RISK_LEVEL: RISK_LEVEL,
        GOVERNANCE_STATUS: GOVERNANCE_STATUS,

        // Public API (Chapter 15)
        initialize: (config) => instance.initialize(config),
        validate: (workflow, options) => instance.validate(workflow, options),
        approve: (workflowId, reason) => instance.approve(workflowId, reason),
        reject: (workflowId, reason) => instance.reject(workflowId, reason),
        setPermission: (intelligence, permission) => instance.setPermission(intelligence, permission),
        checkPermission: (intelligence, action) => instance.checkPermission(intelligence, action),
        audit: (workflowId) => instance.audit(workflowId),
        detectViolation: (workflow, context) => instance.detectViolation(workflow, context),

        getPermission: (intelligence) => instance.getPermission(intelligence),
        getAuditTrail: (filter) => instance.getAuditTrail(filter),
        getViolations: (filter) => instance.getViolations(filter),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[OrchestrationGovernance] Part 55.5 loaded ✅');
    console.log('[OrchestrationGovernance] Permission Levels:', Object.keys(PERMISSION_LEVEL).join(' | '));

})();
