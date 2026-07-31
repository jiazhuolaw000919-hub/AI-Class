// ==================================================
// Part 50.4 — Recommendation Engine
// Version: v5.0.4
// Module: Runtime Autonomous Layer
// File: autonomousRecommendationEngine.js
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
        console.warn('[RecommendationEngine] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Recommendation Types (Chapter 5)
    // ==================================================
    const REC_TYPE = {
        OPTIMIZATION: 'OPTIMIZATION',
        MAINTENANCE: 'MAINTENANCE',
        WARNING: 'WARNING',
        RECOVERY: 'RECOVERY',
        CONFIGURATION: 'CONFIGURATION'
    };

    // ==================================================
    // Recommendation Status (Chapter 6)
    // ==================================================
    const REC_STATUS = {
        PENDING: 'PENDING',
        REVIEWED: 'REVIEWED',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        EXPIRED: 'EXPIRED'
    };

    // ==================================================
    // Recommendation Model (Chapter 4)
    // ==================================================
    class Recommendation {
        constructor(config) {
            this.recommendationId = config.recommendationId || this._generateId();
            this.decisionId = config.decisionId || null;
            this.title = config.title || '';
            this.description = config.description || '';
            this.reason = config.reason || '';
            this.benefit = config.benefit || '';
            this.risk = config.risk || 'LOW';
            this.priority = config.priority || 'NORMAL';
            this.confidence = config.confidence || 0;
            this.type = config.type || REC_TYPE.OPTIMIZATION;
            this.status = REC_STATUS.PENDING;
            this.timestamp = Date.now();
            this.reviewedAt = null;
            this.approvedAt = null;
            this.rejectedAt = null;
            this.expiredAt = null;
            this.metadata = config.metadata || {};
            this.actionPlan = config.actionPlan || null;
            this.reviewer = null;
            this.rejectionReason = null;
        }

        _generateId() {
            return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        }

        // Status transitions
        review(reviewer) {
            if (this.status === REC_STATUS.EXPIRED) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot review expired recommendation`);
                return false;
            }
            this.status = REC_STATUS.REVIEWED;
            this.reviewedAt = Date.now();
            this.reviewer = reviewer || 'system';
            return true;
        }

        approve() {
            if (this.status === REC_STATUS.EXPIRED) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot approve expired recommendation`);
                return false;
            }
            this.status = REC_STATUS.APPROVED;
            this.approvedAt = Date.now();
            return true;
        }

        reject(reason) {
            if (this.status === REC_STATUS.EXPIRED) {
                console.warn(`[Recommendation ${this.recommendationId}] Cannot reject expired recommendation`);
                return false;
            }
            this.status = REC_STATUS.REJECTED;
            this.rejectedAt = Date.now();
            this.rejectionReason = reason || 'No reason provided';
            return true;
        }

        expire() {
            this.status = REC_STATUS.EXPIRED;
            this.expiredAt = Date.now();
            return true;
        }

        isActive() {
            return [REC_STATUS.PENDING, REC_STATUS.REVIEWED, REC_STATUS.APPROVED].includes(this.status);
        }

        toJSON() {
            return {
                recommendationId: this.recommendationId,
                decisionId: this.decisionId,
                title: this.title,
                description: this.description,
                reason: this.reason,
                benefit: this.benefit,
                risk: this.risk,
                priority: this.priority,
                confidence: this.confidence,
                type: this.type,
                status: this.status,
                timestamp: this.timestamp,
                reviewedAt: this.reviewedAt,
                approvedAt: this.approvedAt,
                rejectedAt: this.rejectedAt,
                expiredAt: this.expiredAt,
                reviewer: this.reviewer,
                rejectionReason: this.rejectionReason,
                actionPlan: this.actionPlan,
                metadata: this.metadata
            };
        }
    }

    // ==================================================
    // Recommendation Engine (Chapter 1-3)
    // ==================================================
    class RecommendationEngine {
        constructor() {
            this._recommendations = [];
            this._activeRecommendations = [];
            this._listeners = {};
            this._initialized = false;
            this._recommendationCounter = 0;
            this._config = {
                maxActiveRecommendations: 20,
                autoExpireAfterMs: 86400000, // 24 hours
                enableBenefitScoring: true,
                minConfidenceForAutoReview: 70
            };
            this._typeHandlers = this._initTypeHandlers();
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[RecommendationEngine] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[RecommendationEngine] Initializing...');

            // Connect to Decision Engine (Chapter 8)
            this._connectToDecisionEngine();

            // Connect to Governance
            this._connectToGovernance();

            // Connect to Action Planner
            this._connectToActionPlanner();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Start auto-expiry check
            setInterval(() => this._expireOldRecommendations(), 60000); // Check every minute

            this._initialized = true;
            console.log('[RecommendationEngine] Initialized ✅');
            return this;
        }

        // ==============================================
        // Core: Create Recommendation (Chapter 2-3)
        // ==============================================

        createRecommendation(decision, options) {
            console.log(`[RecommendationEngine] Creating recommendation from decision: ${decision.id}`);

            // Build recommendation from decision
            const rec = new Recommendation({
                decisionId: decision.id,
                title: this._generateTitle(decision),
                description: this._generateDescription(decision),
                reason: decision.reason || 'Decision requires action',
                benefit: this._calculateBenefit(decision),
                risk: decision.risk || 'LOW',
                priority: decision.priority || 'NORMAL',
                confidence: decision.confidence || 0,
                type: this._determineType(decision),
                actionPlan: this._generateActionPlan(decision),
                metadata: {
                    decisionContext: decision.context,
                    trigger: decision.trigger,
                    timestamp: decision.timestamp
                }
            });

            // Auto-review if confidence is high enough
            if (rec.confidence >= this._config.minConfidenceForAutoReview) {
                rec.review('auto');
                console.log(`[RecommendationEngine] Auto-reviewed: ${rec.recommendationId}`);
            }

            // Store
            this._recommendations.push(rec);
            
            if (rec.isActive()) {
                this._activeRecommendations.push(rec);
            }

            // Emit event
            this._emit('recommendationCreated', rec.toJSON());

            // Send to Governance if reviewed
            if (rec.status === REC_STATUS.REVIEWED) {
                this._sendToGovernance(rec);
            }

            console.log(`[RecommendationEngine] Recommendation created: ${rec.recommendationId}`);
            return rec;
        }

        // ==============================================
        // Recommendation Management
        // ==============================================

        getRecommendation(id) {
            const rec = this._recommendations.find(r => r.recommendationId === id);
            return rec ? rec.toJSON() : null;
        }

        getRecommendations(filter) {
            let recs = [...this._recommendations];

            if (filter) {
                if (filter.status) {
                    recs = recs.filter(r => r.status === filter.status);
                }
                if (filter.type) {
                    recs = recs.filter(r => r.type === filter.type);
                }
                if (filter.priority) {
                    recs = recs.filter(r => r.priority === filter.priority);
                }
                if (filter.risk) {
                    recs = recs.filter(r => r.risk === filter.risk);
                }
                if (filter.decisionId) {
                    recs = recs.filter(r => r.decisionId === filter.decisionId);
                }
                if (filter.limit) {
                    recs = recs.slice(-filter.limit);
                }
            }

            return recs.map(r => r.toJSON());
        }

        getActiveRecommendations() {
            return this._activeRecommendations.map(r => r.toJSON());
        }

        getPendingRecommendations() {
            return this._recommendations
                .filter(r => r.status === REC_STATUS.PENDING)
                .map(r => r.toJSON());
        }

        getRecommendationsByType(type) {
            return this._recommendations
                .filter(r => r.type === type)
                .map(r => r.toJSON());
        }

        // ==============================================
        // Status Management (Chapter 6)
        // ==============================================

        reviewRecommendation(id, reviewer) {
            const rec = this._findRecommendation(id);
            if (!rec) return false;

            const result = rec.review(reviewer);
            if (result) {
                this._emit('recommendationReviewed', rec.toJSON());
                console.log(`[RecommendationEngine] Recommendation reviewed: ${id}`);
                
                // Send to Governance after review
                if (rec.status === REC_STATUS.REVIEWED) {
                    this._sendToGovernance(rec);
                }
            }
            return result;
        }

        approveRecommendation(id) {
            const rec = this._findRecommendation(id);
            if (!rec) return false;

            const result = rec.approve();
            if (result) {
                this._emit('recommendationApproved', rec.toJSON());
                console.log(`[RecommendationEngine] Recommendation approved: ${id}`);
                
                // Remove from active if approved
                this._activeRecommendations = this._activeRecommendations
                    .filter(r => r.recommendationId !== id);
            }
            return result;
        }

        rejectRecommendation(id, reason) {
            const rec = this._findRecommendation(id);
            if (!rec) return false;

            const result = rec.reject(reason);
            if (result) {
                this._emit('recommendationRejected', rec.toJSON());
                console.log(`[RecommendationEngine] Recommendation rejected: ${id}`);
                
                // Remove from active
                this._activeRecommendations = this._activeRecommendations
                    .filter(r => r.recommendationId !== id);
            }
            return result;
        }

        expireRecommendation(id) {
            const rec = this._findRecommendation(id);
            if (!rec) return false;

            const result = rec.expire();
            if (result) {
                this._emit('recommendationExpired', rec.toJSON());
                console.log(`[RecommendationEngine] Recommendation expired: ${id}`);
                
                this._activeRecommendations = this._activeRecommendations
                    .filter(r => r.recommendationId !== id);
            }
            return result;
        }

        // ==============================================
        // Recommendation Rules (Chapter 7)
        // ==============================================

        validateRecommendation(rec) {
            const checks = {
                hasTitle: !!rec.title && rec.title.length > 0,
                hasReason: !!rec.reason && rec.reason.length > 0,
                hasImpact: !!rec.benefit && rec.benefit.length > 0,
                hasRisk: !!rec.risk,
                hasConfidence: rec.confidence >= 0 && rec.confidence <= 100
            };

            const allPassed = Object.values(checks).every(v => v === true);

            return {
                valid: allPassed,
                checks: checks,
                missing: Object.keys(checks).filter(k => !checks[k])
            };
        }

        // ==============================================
        // Statistics
        // ==============================================

        getRecommendationStats() {
            const total = this._recommendations.length;
            const pending = this._recommendations.filter(r => r.status === REC_STATUS.PENDING).length;
            const reviewed = this._recommendations.filter(r => r.status === REC_STATUS.REVIEWED).length;
            const approved = this._recommendations.filter(r => r.status === REC_STATUS.APPROVED).length;
            const rejected = this._recommendations.filter(r => r.status === REC_STATUS.REJECTED).length;
            const expired = this._recommendations.filter(r => r.status === REC_STATUS.EXPIRED).length;

            const byType = {};
            Object.values(REC_TYPE).forEach(type => {
                byType[type] = this._recommendations.filter(r => r.type === type).length;
            });

            const avgConfidence = total > 0
                ? this._recommendations.reduce((sum, r) => sum + r.confidence, 0) / total
                : 0;

            const approvalRate = reviewed + approved > 0
                ? Math.round((approved / (reviewed + approved + rejected)) * 100)
                : 0;

            return {
                total,
                pending,
                reviewed,
                approved,
                rejected,
                expired,
                byType,
                avgConfidence: Math.round(avgConfidence),
                approvalRate,
                active: this._activeRecommendations.length
            };
        }

        // ==============================================
        // Explorer Support (Chapter 9)
        // ==============================================

        getExplorerData() {
            return {
                type: 'recommendation_engine',
                status: this._initialized ? 'active' : 'inactive',
                stats: this.getRecommendationStats(),
                activeRecommendations: this._activeRecommendations.slice(0, 10).map(r => r.toJSON()),
                recentRecommendations: this._recommendations.slice(-5).reverse().map(r => r.toJSON()),
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
                        console.error(`[RecommendationEngine] Listener error (${event}):`, e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`recommendation.${event}`, data);
            }
        }

        // ==============================================
        // Private Methods
        // ==============================================

        _findRecommendation(id) {
            return this._recommendations.find(r => r.recommendationId === id) || null;
        }

        _generateTitle(decision) {
            const trigger = decision.trigger || 'unknown';
            const priority = decision.priority || 'NORMAL';
            return `[${priority}] Action required for ${trigger}`;
        }

        _generateDescription(decision) {
            const context = decision.context || {};
            let parts = [];
            
            if (context.runtimeState) {
                parts.push(`Runtime state: ${JSON.stringify(context.runtimeState)}`);
            }
            if (context.performanceData) {
                parts.push(`Performance: CPU ${context.performanceData.cpu || '?'}%, Memory ${context.performanceData.memory || '?'}%`);
            }
            
            return parts.join(' | ') || 'No additional details available';
        }

        _calculateBenefit(decision) {
            // Simplified benefit calculation
            const benefits = {
                CRITICAL: 'Prevents system failure or data loss',
                HIGH: 'Improves system stability and performance',
                NORMAL: 'Optimizes system operations',
                LOW: 'Minor improvement or maintenance'
            };
            return benefits[decision.priority] || benefits.NORMAL;
        }

        _determineType(decision) {
            const trigger = decision.trigger || '';
            
            if (trigger.includes('recovery') || trigger.includes('crash')) {
                return REC_TYPE.RECOVERY;
            }
            if (trigger.includes('warning') || trigger.includes('error')) {
                return REC_TYPE.WARNING;
            }
            if (trigger.includes('config') || trigger.includes('setting')) {
                return REC_TYPE.CONFIGURATION;
            }
            if (trigger.includes('performance') || trigger.includes('optimize')) {
                return REC_TYPE.OPTIMIZATION;
            }
            return REC_TYPE.MAINTENANCE;
        }

        _generateActionPlan(decision) {
            // Simplified action plan generation
            const plan = {
                steps: [],
                estimatedTime: 'unknown',
                rollbackPlan: 'Rollback to previous state if issues arise'
            };

            const trigger = decision.trigger || '';
            
            if (trigger.includes('performance')) {
                plan.steps.push('Analyze performance bottleneck');
                plan.steps.push('Apply optimization strategy');
                plan.steps.push('Verify improvement metrics');
                plan.estimatedTime = '5-10 minutes';
            } else if (trigger.includes('warning')) {
                plan.steps.push('Investigate warning source');
                plan.steps.push('Apply corrective action');
                plan.steps.push('Monitor for recurrence');
                plan.estimatedTime = '2-5 minutes';
            } else {
                plan.steps.push('Review decision context');
                plan.steps.push('Execute recommended action');
                plan.steps.push('Validate outcome');
                plan.estimatedTime = '3-7 minutes';
            }

            return plan;
        }

        _expireOldRecommendations() {
            const now = Date.now();
            const cutoff = now - this._config.autoExpireAfterMs;

            this._recommendations.forEach(rec => {
                if (rec.isActive() && rec.timestamp < cutoff) {
                    rec.expire();
                    this._activeRecommendations = this._activeRecommendations
                        .filter(r => r.recommendationId !== rec.recommendationId);
                    console.log(`[RecommendationEngine] Auto-expired: ${rec.recommendationId}`);
                }
            });
        }

        _initTypeHandlers() {
            return {
                [REC_TYPE.OPTIMIZATION]: {
                    priority: 'NORMAL',
                    confidenceBonus: 10
                },
                [REC_TYPE.MAINTENANCE]: {
                    priority: 'LOW',
                    confidenceBonus: 5
                },
                [REC_TYPE.WARNING]: {
                    priority: 'HIGH',
                    confidenceBonus: 15
                },
                [REC_TYPE.RECOVERY]: {
                    priority: 'CRITICAL',
                    confidenceBonus: 20
                },
                [REC_TYPE.CONFIGURATION]: {
                    priority: 'NORMAL',
                    confidenceBonus: 10
                }
            };
        }

        // ==============================================
        // Integrations (Chapter 8)
        // ==============================================

        _connectToDecisionEngine() {
            if (window.LawAIApp && window.LawAIApp.DecisionEngine) {
                // Listen for new decisions
                window.LawAIApp.DecisionEngine.on('decisionMade', (decision) => {
                    if (decision.status === 'APPROVED') {
                        this.createRecommendation(decision);
                    }
                });
                console.log('[RecommendationEngine] Connected to Decision Engine');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                console.log('[RecommendationEngine] Connected to Governance');
            }
        }

        _connectToActionPlanner() {
            // Future: connect to Action Planner
            console.log('[RecommendationEngine] Action Planner integration ready');
        }

        _sendToGovernance(rec) {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                try {
                    // Send recommendation to governance for approval
                    console.log(`[RecommendationEngine] Sent recommendation ${rec.recommendationId} to Governance`);
                } catch (e) {
                    console.warn('[RecommendationEngine] Could not send to Governance:', e);
                }
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'recommendation-engine',
                        name: 'Recommendation Engine',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[RecommendationEngine] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[RecommendationEngine] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new RecommendationEngine();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.RecommendationEngine = {
        Core: instance,
        REC_TYPE: REC_TYPE,
        REC_STATUS: REC_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        createRecommendation: (decision, options) => instance.createRecommendation(decision, options),

        getRecommendation: (id) => instance.getRecommendation(id),
        getRecommendations: (filter) => instance.getRecommendations(filter),
        getActiveRecommendations: () => instance.getActiveRecommendations(),
        getPendingRecommendations: () => instance.getPendingRecommendations(),
        getRecommendationsByType: (type) => instance.getRecommendationsByType(type),

        reviewRecommendation: (id, reviewer) => instance.reviewRecommendation(id, reviewer),
        approveRecommendation: (id) => instance.approveRecommendation(id),
        rejectRecommendation: (id, reason) => instance.rejectRecommendation(id, reason),
        expireRecommendation: (id) => instance.expireRecommendation(id),

        validateRecommendation: (rec) => instance.validateRecommendation(rec),
        getRecommendationStats: () => instance.getRecommendationStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[RecommendationEngine] Part 50.4 loaded ✅');
    console.log('[RecommendationEngine] Types:', Object.values(REC_TYPE).join(' | '));
    console.log('[RecommendationEngine] Statuses:', Object.values(REC_STATUS).join(' | '));

})();
