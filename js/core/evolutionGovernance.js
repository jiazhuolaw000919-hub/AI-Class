// ============================================================
// evolutionGovernance.js
// Part 54.5 — Evolution Governance
// Version: v5.4.5
// Module: Runtime Evolution System
// File: js/core/evolutionGovernance.js
// ============================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.EvolutionGovernance) {
        console.warn('[EvolutionGovernance] Already initialized, skipping...');
        return;
    }

    // ============================================================
    // Risk Classification (Chapter 6)
    // ============================================================
    const RISK_LEVEL = {
        LOW: { label: 'LOW', score: 1, color: '#22c55e', action: 'auto_approve' },
        MEDIUM: { label: 'MEDIUM', score: 2, color: '#eab308', action: 'review_required' },
        HIGH: { label: 'HIGH', score: 3, color: '#f97316', action: 'manual_review' },
        CRITICAL: { label: 'CRITICAL', score: 4, color: '#ef4444', action: 'executive_review' }
    };

    // ============================================================
    // Decision Types (Chapter 8)
    // ============================================================
    const DECISION_TYPE = {
        APPROVED: 'approved',
        REJECTED: 'rejected',
        DEFERRED: 'deferred',
        REVIEW_REQUIRED: 'review_required'
    };

    // ============================================================
    // Permission Levels (Chapter 9)
    // ============================================================
    const PERMISSION_LEVEL = {
        OBSERVE: 'observe',
        RECOMMEND: 'recommend',
        PREPARE: 'prepare',
        EXECUTE: 'execute',
        SYSTEM_EVOLUTION: 'system_evolution'
    };

    // ============================================================
    // Governance Decision Model (Chapter 8)
    // ============================================================
    class GovernanceDecision {
        constructor(config) {
            this.decisionId = config.decisionId || this._generateId();
            this.timestamp = Date.now();
            this.proposalId = config.proposalId || null;
            this.riskLevel = config.riskLevel || RISK_LEVEL.MEDIUM;
            this.decision = config.decision || DECISION_TYPE.REVIEW_REQUIRED;
            this.reviewer = config.reviewer || 'system';
            this.reason = config.reason || '';
            this.conditions = config.conditions || [];
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `govdec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                decisionId: this.decisionId,
                timestamp: this.timestamp,
                proposalId: this.proposalId,
                riskLevel: this.riskLevel,
                decision: this.decision,
                reviewer: this.reviewer,
                reason: this.reason,
                conditions: this.conditions,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Audit Record (Chapter 10)
    // ============================================================
    class AuditRecord {
        constructor(config) {
            this.auditId = config.auditId || this._generateId();
            this.timestamp = Date.now();
            this.proposalId = config.proposalId || null;
            this.action = config.action || 'review';
            this.decision = config.decision || null;
            this.reason = config.reason || '';
            this.reviewer = config.reviewer || 'system';
            this.details = config.details || {};
            this.metadata = config.metadata || {};
        }

        _generateId() {
            return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }

        toJSON() {
            return {
                auditId: this.auditId,
                timestamp: this.timestamp,
                proposalId: this.proposalId,
                action: this.action,
                decision: this.decision,
                reason: this.reason,
                reviewer: this.reviewer,
                details: this.details,
                metadata: this.metadata
            };
        }
    }

    // ============================================================
    // Evolution Governance Core (Chapter 1-4)
    // ============================================================
    class EvolutionGovernance {
        constructor() {
            this._decisions = [];
            this._auditTrail = [];
            this._pendingReviews = [];
            this._initialized = false;
            this._listeners = {};
            this._config = {
                maxHistorySize: 500,
                defaultPermission: PERMISSION_LEVEL.RECOMMEND,
                autoApproveLowRisk: true,
                requireReviewForHighRisk: true,
                auditRetentionDays: 90,
                maxPendingReviews: 50
            };
        }

        // ============================================================
        // Lifecycle
        // ============================================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[EvolutionGovernance] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[EvolutionGovernance] Initializing...');

            // Connect to modules (Chapter 11)
            this._connectToGovernanceFramework();
            this._connectToDecisionIntelligence();
            this._connectToOptimizationLayer();
            this._connectToPredictiveLayer();
            this._connectToKnowledgeGraph();
            this._connectToRuntimeRegistry();

            // Register with Explorer (Chapter 12)
            this._registerWithExplorer();

            // Load historical data
            this._loadHistoricalData();

            this._initialized = true;
            console.log('[EvolutionGovernance] Initialized ✅');
            return this;
        }

        // ============================================================
        // Core: Review (Chapter 5, 7)
        // ============================================================

        review(proposal, options) {
            console.log(`[EvolutionGovernance] Reviewing proposal: ${proposal.proposalId || 'unknown'}`);

            // Validate proposal
            const validation = this._validateProposal(proposal);
            if (!validation.valid) {
                this._recordAudit(proposal.proposalId, 'review_failed', null, validation.issues.join('; '));
                return {
                    approved: false,
                    decision: DECISION_TYPE.REJECTED,
                    reason: `Validation failed: ${validation.issues.join(', ')}`,
                    risk: RISK_LEVEL.MEDIUM
                };
            }

            // Classify risk (Chapter 6)
            const risk = this._classifyRisk(proposal);

            // Check permission (Chapter 9)
            const permission = this._checkPermission(proposal, options?.permissionLevel);

            // Make decision (Chapter 7)
            const decision = this._makeDecision(proposal, risk, permission, options);

            // Record decision
            const decisionRecord = new GovernanceDecision({
                proposalId: proposal.proposalId,
                riskLevel: risk,
                decision: decision.type,
                reviewer: options?.reviewer || 'system',
                reason: decision.reason,
                conditions: decision.conditions || [],
                metadata: {
                    riskScore: risk.score,
                    permissionLevel: permission,
                    reviewedAt: Date.now()
                }
            });

            this._decisions.push(decisionRecord);

            // Record audit (Chapter 10)
            this._recordAudit(
                proposal.proposalId,
                'review_complete',
                decision.type,
                decision.reason,
                options?.reviewer || 'system'
            );

            // Remove from pending if exists
            this._pendingReviews = this._pendingReviews.filter(
                p => p.proposalId !== proposal.proposalId
            );

            this._emit('reviewComplete', {
                proposalId: proposal.proposalId,
                decision: decisionRecord.toJSON(),
                risk: risk,
                timestamp: Date.now()
            });

            return {
                approved: decision.type === DECISION_TYPE.APPROVED,
                decision: decision.type,
                reason: decision.reason,
                risk: risk,
                conditions: decision.conditions || []
            };
        }

        // ============================================================
        // Risk Classification (Chapter 6)
        // ============================================================

        _classifyRisk(proposal) {
            let score = 0;
            let factors = [];

            // Area-based risk
            const areaRisk = {
                'configuration': 1,
                'performance': 2,
                'optimization': 2,
                'capability': 3,
                'architecture': 3,
                'dependency': 3,
                'governance': 4,
                'security': 4,
                'runtime_core': 4
            };

            const proposalArea = proposal.area || 'configuration';
            score += areaRisk[proposalArea] || 2;
            factors.push(`area: ${proposalArea}`);

            // Impact-based risk
            if (proposal.impact) {
                if (proposal.impact.includes('critical') || proposal.impact.includes('system_wide')) {
                    score += 2;
                    factors.push('high_impact');
                } else if (proposal.impact.includes('moderate') || proposal.impact.includes('multiple')) {
                    score += 1;
                    factors.push('moderate_impact');
                }
            }

            // Scope-based risk
            if (proposal.scope) {
                if (proposal.scope === 'global') {
                    score += 2;
                    factors.push('global_scope');
                } else if (proposal.scope === 'module') {
                    score += 1;
                    factors.push('module_scope');
                }
            }

            // Confidence-based adjustment
            if (proposal.confidence && proposal.confidence > 80) {
                score = Math.max(1, score - 1);
                factors.push('high_confidence');
            }

            // Map score to risk level
            let riskLevel;
            if (score >= 4) riskLevel = RISK_LEVEL.CRITICAL;
            else if (score >= 3) riskLevel = RISK_LEVEL.HIGH;
            else if (score >= 2) riskLevel = RISK_LEVEL.MEDIUM;
            else riskLevel = RISK_LEVEL.LOW;

            return {
                ...riskLevel,
                score: score,
                factors: factors
            };
        }

        // ============================================================
        // Permission Check (Chapter 9)
        // ============================================================

        _checkPermission(proposal, requestedLevel) {
            const defaultLevel = this._config.defaultPermission;

            // System evolution requires highest permission
            if (proposal.area === 'governance' || proposal.area === 'security') {
                return PERMISSION_LEVEL.SYSTEM_EVOLUTION;
            }

            // Core runtime changes require execute permission
            if (proposal.area === 'runtime_core') {
                return PERMISSION_LEVEL.EXECUTE;
            }

            // Architecture changes require prepare permission
            if (proposal.area === 'architecture') {
                return PERMISSION_LEVEL.PREPARE;
            }

            // Default: return requested or default
            return requestedLevel || defaultLevel;
        }

        // ============================================================
        // Decision Making (Chapter 7)
        // ============================================================

        _makeDecision(proposal, risk, permission, options) {
            // Auto-approve low risk (Chapter 6)
            if (risk.label === 'LOW' && this._config.autoApproveLowRisk) {
                return {
                    type: DECISION_TYPE.APPROVED,
                    reason: 'Auto-approved: Low risk evolution',
                    conditions: []
                };
            }

            // Check if manual review required
            if (risk.label === 'HIGH' && this._config.requireReviewForHighRisk) {
                return {
                    type: DECISION_TYPE.REVIEW_REQUIRED,
                    reason: 'High risk evolution requires manual review',
                    conditions: ['Senior review required']
                };
            }

            if (risk.label === 'CRITICAL') {
                return {
                    type: DECISION_TYPE.REVIEW_REQUIRED,
                    reason: 'Critical risk evolution requires executive review',
                    conditions: ['Executive approval required', 'Security review required']
                };
            }

            // Check permission level
            if (permission === PERMISSION_LEVEL.OBSERVE || permission === PERMISSION_LEVEL.RECOMMEND) {
                return {
                    type: DECISION_TYPE.REVIEW_REQUIRED,
                    reason: `Insufficient permission (${permission}) for this evolution`,
                    conditions: ['Higher permission required']
                };
            }

            // Medium risk: review if not auto-approved
            if (risk.label === 'MEDIUM') {
                return {
                    type: DECISION_TYPE.REVIEW_REQUIRED,
                    reason: 'Medium risk evolution requires review',
                    conditions: ['Standard review required']
                };
            }

            // Default: approve
            return {
                type: DECISION_TYPE.APPROVED,
                reason: 'Approved: Meets governance criteria',
                conditions: []
            };
        }

        // ============================================================
        // Proposal Validation (Chapter 5)
        // ============================================================

        _validateProposal(proposal) {
            const issues = [];

            if (!proposal.proposalId) {
                issues.push('Missing proposal ID');
            }

            if (!proposal.target) {
                issues.push('Missing target module/area');
            }

            if (!proposal.proposedChange) {
                issues.push('Missing proposed change description');
            }

            if (!proposal.expectedBenefit) {
                issues.push('Missing expected benefit');
            }

            if (proposal.confidence === undefined || proposal.confidence === null) {
                issues.push('Missing confidence score');
            }

            if (proposal.confidence < 30) {
                issues.push('Confidence too low (< 30%)');
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        // ============================================================
        // Audit Trail (Chapter 10)
        // ============================================================

        _recordAudit(proposalId, action, decision, reason, reviewer) {
            const record = new AuditRecord({
                proposalId: proposalId,
                action: action,
                decision: decision,
                reason: reason || '',
                reviewer: reviewer || 'system',
                details: {
                    timestamp: Date.now(),
                    action: action
                }
            });

            this._auditTrail.push(record);
            if (this._auditTrail.length > this._config.maxHistorySize) {
                this._auditTrail = this._auditTrail.slice(-this._config.maxHistorySize);
            }

            this._emit('auditRecorded', record.toJSON());
            return record;
        }

        getAuditTrail(filter) {
            let records = this._auditTrail;

            if (filter) {
                if (filter.proposalId) {
                    records = records.filter(r => r.proposalId === filter.proposalId);
                }
                if (filter.action) {
                    records = records.filter(r => r.action === filter.action);
                }
                if (filter.decision) {
                    records = records.filter(r => r.decision === filter.decision);
                }
                if (filter.limit) {
                    records = records.slice(-filter.limit);
                }
            }

            return records.map(r => r.toJSON());
        }

        // ============================================================
        // Approval Management
        // ============================================================

        submitForReview(proposal) {
            console.log(`[EvolutionGovernance] Submitting proposal for review: ${proposal.proposalId}`);

            // Check pending queue
            if (this._pendingReviews.length >= this._config.maxPendingReviews) {
                return {
                    submitted: false,
                    reason: 'Review queue is full'
                };
            }

            this._pendingReviews.push(proposal);
            this._recordAudit(proposal.proposalId, 'submitted', null, 'Submitted for governance review');

            this._emit('submittedForReview', {
                proposalId: proposal.proposalId,
                pendingCount: this._pendingReviews.length,
                timestamp: Date.now()
            });

            return {
                submitted: true,
                pendingCount: this._pendingReviews.length
            };
        }

        getPendingReviews() {
            return this._pendingReviews.map(p => ({
                proposalId: p.proposalId,
                target: p.target,
                area: p.area,
                confidence: p.confidence,
                submittedAt: p.submittedAt || Date.now()
            }));
        }

        // ============================================================
        // Public API (Chapter 14)
        // ============================================================

        reviewProposal(proposal, options) {
            return this.review(proposal, options);
        }

        approve(proposalId, reviewer, conditions) {
            console.log(`[EvolutionGovernance] Approving proposal: ${proposalId}`);

            const pending = this._pendingReviews.find(p => p.proposalId === proposalId);
            if (!pending) {
                return {
                    approved: false,
                    reason: 'Proposal not found in review queue'
                };
            }

            // Create approval decision
            const decision = new GovernanceDecision({
                proposalId: proposalId,
                riskLevel: RISK_LEVEL.MEDIUM,
                decision: DECISION_TYPE.APPROVED,
                reviewer: reviewer || 'governance',
                reason: 'Approved by governance',
                conditions: conditions || []
            });

            this._decisions.push(decision);
            this._pendingReviews = this._pendingReviews.filter(p => p.proposalId !== proposalId);
            this._recordAudit(proposalId, 'approved', DECISION_TYPE.APPROVED, 'Approved by governance', reviewer);

            this._emit('proposalApproved', {
                proposalId: proposalId,
                decision: decision.toJSON(),
                timestamp: Date.now()
            });

            return {
                approved: true,
                decision: decision.toJSON()
            };
        }

        reject(proposalId, reason, reviewer) {
            console.log(`[EvolutionGovernance] Rejecting proposal: ${proposalId}`);

            const pending = this._pendingReviews.find(p => p.proposalId === proposalId);
            if (!pending) {
                return {
                    rejected: false,
                    reason: 'Proposal not found in review queue'
                };
            }

            const decision = new GovernanceDecision({
                proposalId: proposalId,
                riskLevel: RISK_LEVEL.MEDIUM,
                decision: DECISION_TYPE.REJECTED,
                reviewer: reviewer || 'governance',
                reason: reason || 'Rejected by governance'
            });

            this._decisions.push(decision);
            this._pendingReviews = this._pendingReviews.filter(p => p.proposalId !== proposalId);
            this._recordAudit(proposalId, 'rejected', DECISION_TYPE.REJECTED, reason || 'Rejected', reviewer);

            this._emit('proposalRejected', {
                proposalId: proposalId,
                decision: decision.toJSON(),
                timestamp: Date.now()
            });

            return {
                rejected: true,
                decision: decision.toJSON()
            };
        }

        defer(proposalId, reason, reviewer) {
            console.log(`[EvolutionGovernance] Deferring proposal: ${proposalId}`);

            const pending = this._pendingReviews.find(p => p.proposalId === proposalId);
            if (!pending) {
                return {
                    deferred: false,
                    reason: 'Proposal not found in review queue'
                };
            }

            const decision = new GovernanceDecision({
                proposalId: proposalId,
                riskLevel: RISK_LEVEL.MEDIUM,
                decision: DECISION_TYPE.DEFERRED,
                reviewer: reviewer || 'governance',
                reason: reason || 'Deferred for future consideration'
            });

            this._decisions.push(decision);
            this._pendingReviews = this._pendingReviews.filter(p => p.proposalId !== proposalId);
            this._recordAudit(proposalId, 'deferred', DECISION_TYPE.DEFERRED, reason || 'Deferred', reviewer);

            this._emit('proposalDeferred', {
                proposalId: proposalId,
                decision: decision.toJSON(),
                timestamp: Date.now()
            });

            return {
                deferred: true,
                decision: decision.toJSON()
            };
        }

        // ============================================================
        // Stats
        // ============================================================

        getStats() {
            const total = this._decisions.length;
            const approved = this._decisions.filter(d => d.decision === DECISION_TYPE.APPROVED).length;
            const rejected = this._decisions.filter(d => d.decision === DECISION_TYPE.REJECTED).length;
            const deferred = this._decisions.filter(d => d.decision === DECISION_TYPE.DEFERRED).length;
            const reviewRequired = this._decisions.filter(d => d.decision === DECISION_TYPE.REVIEW_REQUIRED).length;

            const byRisk = {};
            Object.values(RISK_LEVEL).forEach(risk => {
                byRisk[risk.label] = this._decisions.filter(d => 
                    d.riskLevel.label === risk.label
                ).length;
            });

            return {
                total,
                approved,
                rejected,
                deferred,
                reviewRequired,
                byRisk,
                pendingReviews: this._pendingReviews.length,
                auditCount: this._auditTrail.length
            };
        }

        // ============================================================
        // Explorer Support (Chapter 12)
        // ============================================================

        getExplorerData() {
            const stats = this.getStats();
            const pending = this.getPendingReviews().slice(0, 5);
            const recent = this._decisions.slice(-5).map(d => d.toJSON());

            return {
                type: 'evolution_governance',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                pendingReviews: pending,
                recentDecisions: recent,
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
                        console.error('[EvolutionGovernance] Listener error:', e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`evogov.${event}`, data);
            }
        }

        // ============================================================
        // Data Loading
        // ============================================================

        _loadHistoricalData() {
            try {
                const saved = localStorage.getItem('evolutionGovernanceData');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data.decisions) {
                        this._decisions = data.decisions.map(d => new GovernanceDecision(d));
                    }
                    if (data.auditTrail) {
                        this._auditTrail = data.auditTrail.map(a => new AuditRecord(a));
                    }
                    if (data.pending) {
                        this._pendingReviews = data.pending;
                    }
                }
            } catch (e) { /* ignore */ }
        }

        // ============================================================
        // Integrations (Chapter 11)
        // ============================================================

        _connectToGovernanceFramework() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[EvolutionGovernance] Connected to Governance Framework');
            }
        }

        _connectToDecisionIntelligence() {
            if (window.LawAIApp && window.LawAIApp.DecisionIntelligence) {
                console.log('[EvolutionGovernance] Connected to Decision Intelligence');
            }
        }

        _connectToOptimizationLayer() {
            if (window.LawAIApp && window.LawAIApp.OptimizationIntelligence) {
                console.log('[EvolutionGovernance] Connected to Optimization Layer');
            }
        }

        _connectToPredictiveLayer() {
            if (window.LawAIApp && window.LawAIApp.PredictiveIntelligence) {
                console.log('[EvolutionGovernance] Connected to Predictive Layer');
            }
        }

        _connectToKnowledgeGraph() {
            if (window.LawAIApp && window.LawAIApp.KnowledgeGraph) {
                console.log('[EvolutionGovernance] Connected to Knowledge Graph');
            }
        }

        _connectToRuntimeRegistry() {
            if (window.LawAIApp && window.LawAIApp.Registry) {
                console.log('[EvolutionGovernance] Connected to Runtime Registry');
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'evolution-governance',
                        name: 'Evolution Governance',
                        category: 'governance',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[EvolutionGovernance] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[EvolutionGovernance] Could not register with Explorer:', e);
                }
            }
        }

        // ============================================================
        // Destroy
        // ============================================================

        destroy() {
            this._initialized = false;
            console.log('[EvolutionGovernance] Destroyed');
        }
    }

    // ============================================================
    // Singleton & Global Exposure
    // ============================================================

    const instance = new EvolutionGovernance();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.EvolutionGovernance = {
        Core: instance,
        RISK_LEVEL: RISK_LEVEL,
        DECISION_TYPE: DECISION_TYPE,
        PERMISSION_LEVEL: PERMISSION_LEVEL,

        // Public API (Chapter 14)
        initialize: (config) => instance.initialize(config),
        review: (proposal, options) => instance.review(proposal, options),
        submitForReview: (proposal) => instance.submitForReview(proposal),
        approve: (proposalId, reviewer, conditions) => instance.approve(proposalId, reviewer, conditions),
        reject: (proposalId, reason, reviewer) => instance.reject(proposalId, reason, reviewer),
        defer: (proposalId, reason, reviewer) => instance.defer(proposalId, reason, reviewer),

        getPendingReviews: () => instance.getPendingReviews(),
        getAuditTrail: (filter) => instance.getAuditTrail(filter),
        getStats: () => instance.getStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback),
        destroy: () => instance.destroy()
    };

    console.log('[EvolutionGovernance] Part 54.5 loaded ✅');
    console.log('[EvolutionGovernance] Risk Levels:', Object.keys(RISK_LEVEL).join(' | '));
    console.log('[EvolutionGovernance] Decision Types:', Object.values(DECISION_TYPE).join(' | '));

})();
