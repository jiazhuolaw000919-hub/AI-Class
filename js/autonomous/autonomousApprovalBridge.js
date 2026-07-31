// ==================================================
// Part 50.5 — Governance Approval Bridge
// Version: v5.0.5
// Module: Runtime Autonomous Layer
// File: autonomousApprovalBridge.js
// ==================================================

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.ApprovalBridge) {
        console.warn('[ApprovalBridge] Already initialized, skipping...');
        return;
    }

    // ==================================================
    // Approval Result (Chapter 5)
    // ==================================================
    const APPROVAL_RESULT = {
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED',
        REVIEW_REQUIRED: 'REVIEW_REQUIRED',
        EXPIRED: 'EXPIRED'
    };

    // ==================================================
    // Approval Status
    // ==================================================
    const APPROVAL_STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        FAILED: 'FAILED'
    };

    // ==================================================
    // Approval Request (Chapter 4)
    // ==================================================
    class ApprovalRequest {
        constructor(config) {
            this.requestId = config.requestId || this._generateId();
            this.recommendationId = config.recommendationId || null;
            this.priority = config.priority || 'NORMAL';
            this.risk = config.risk || 'LOW';
            this.confidence = config.confidence || 0;
            this.timestamp = Date.now();
            this.status = APPROVAL_STATUS.PENDING;
            this.result = null;
            this.reason = null;
            this.reviewer = null;
            this.reviewedAt = null;
            this.metadata = config.metadata || {};
            this.retryCount = 0;
            this.maxRetries = config.maxRetries || 3;
        }

        _generateId() {
            return `apr_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        }

        approve(reviewer) {
            this.status = APPROVAL_STATUS.COMPLETED;
            this.result = APPROVAL_RESULT.APPROVED;
            this.reviewer = reviewer || 'governance';
            this.reviewedAt = Date.now();
            return this;
        }

        reject(reason, reviewer) {
            this.status = APPROVAL_STATUS.COMPLETED;
            this.result = APPROVAL_RESULT.REJECTED;
            this.reason = reason || 'No reason provided';
            this.reviewer = reviewer || 'governance';
            this.reviewedAt = Date.now();
            return this;
        }

        requireReview(reason, reviewer) {
            this.status = APPROVAL_STATUS.COMPLETED;
            this.result = APPROVAL_RESULT.REVIEW_REQUIRED;
            this.reason = reason || 'Additional review required';
            this.reviewer = reviewer || 'governance';
            this.reviewedAt = Date.now();
            return this;
        }

        expire() {
            this.status = APPROVAL_STATUS.COMPLETED;
            this.result = APPROVAL_RESULT.EXPIRED;
            this.reason = 'Request expired';
            this.reviewedAt = Date.now();
            return this;
        }

        isPending() {
            return this.status === APPROVAL_STATUS.PENDING || 
                   this.status === APPROVAL_STATUS.PROCESSING;
        }

        isFinalized() {
            return this.status === APPROVAL_STATUS.COMPLETED;
        }

        toJSON() {
            return {
                requestId: this.requestId,
                recommendationId: this.recommendationId,
                priority: this.priority,
                risk: this.risk,
                confidence: this.confidence,
                timestamp: this.timestamp,
                status: this.status,
                result: this.result,
                reason: this.reason,
                reviewer: this.reviewer,
                reviewedAt: this.reviewedAt,
                retryCount: this.retryCount,
                metadata: this.metadata
            };
        }
    }

    // ==================================================
    // Governance Approval Bridge (Chapter 1-3)
    // ==================================================
    class ApprovalBridge {
        constructor() {
            this._requests = [];
            this._activeRequests = [];
            this._listeners = {};
            this._initialized = false;
            this._config = {
                maxPendingRequests: 50,
                requestTimeout: 300000, // 5 minutes
                autoExpireAfterMs: 3600000, // 1 hour
                requireManualReviewForHighRisk: true,
                defaultReviewer: 'governance'
            };
            this._pendingQueue = [];
        }

        // ==============================================
        // Lifecycle
        // ==============================================

        initialize(config) {
            if (this._initialized) {
                console.warn('[ApprovalBridge] Already initialized');
                return this;
            }

            if (config) {
                Object.assign(this._config, config);
            }

            console.log('[ApprovalBridge] Initializing...');

            // Connect to Recommendation Engine (Chapter 8)
            this._connectToRecommendationEngine();

            // Connect to Governance
            this._connectToGovernance();

            // Connect to Action Planner
            this._connectToActionPlanner();

            // Register with Explorer (Chapter 9)
            this._registerWithExplorer();

            // Start background processors
            this._startRequestProcessor();
            this._startExpiryChecker();

            this._initialized = true;
            console.log('[ApprovalBridge] Initialized ✅');
            return this;
        }

        // ==============================================
        // Core: Submit for Approval (Chapter 3)
        // ==============================================

        submitRequest(recommendation, options) {
            console.log(`[ApprovalBridge] Submitting request for recommendation: ${recommendation.recommendationId}`);

            // Validate recommendation
            const validation = this._validateRecommendation(recommendation);
            if (!validation.valid) {
                console.warn('[ApprovalBridge] Invalid recommendation:', validation.issues);
                return null;
            }

            // Check pending queue limit
            if (this._activeRequests.length >= this._config.maxPendingRequests) {
                console.warn('[ApprovalBridge] Max pending requests reached');
                return null;
            }

            // Create approval request
            const request = new ApprovalRequest({
                recommendationId: recommendation.recommendationId,
                priority: recommendation.priority || 'NORMAL',
                risk: recommendation.risk || 'LOW',
                confidence: recommendation.confidence || 0,
                maxRetries: options?.maxRetries || 3,
                metadata: {
                    recommendation: recommendation,
                    options: options || {}
                }
            });

            // Store
            this._requests.push(request);
            this._activeRequests.push(request);
            this._pendingQueue.push(request);

            this._emit('requestSubmitted', request.toJSON());
            console.log(`[ApprovalBridge] Request submitted: ${request.requestId}`);

            // Process immediately if possible
            this._processRequest(request);

            return request;
        }

        // ==============================================
        // Request Management
        // ==============================================

        getRequest(id) {
            const request = this._requests.find(r => r.requestId === id);
            return request ? request.toJSON() : null;
        }

        getRequests(filter) {
            let requests = [...this._requests];

            if (filter) {
                if (filter.status) {
                    requests = requests.filter(r => r.status === filter.status);
                }
                if (filter.result) {
                    requests = requests.filter(r => r.result === filter.result);
                }
                if (filter.recommendationId) {
                    requests = requests.filter(r => r.recommendationId === filter.recommendationId);
                }
                if (filter.priority) {
                    requests = requests.filter(r => r.priority === filter.priority);
                }
                if (filter.limit) {
                    requests = requests.slice(-filter.limit);
                }
            }

            return requests.map(r => r.toJSON());
        }

        getPendingRequests() {
            return this._activeRequests
                .filter(r => r.isPending())
                .map(r => r.toJSON());
        }

        getCompletedRequests(limit = 20) {
            return this._requests
                .filter(r => r.isFinalized())
                .slice(-limit)
                .reverse()
                .map(r => r.toJSON());
        }

        // ==============================================
        // Approval Interface (Manual)
        // ==============================================

        approveRequest(requestId, reviewer) {
            const request = this._findRequest(requestId);
            if (!request) {
                console.warn(`[ApprovalBridge] Request not found: ${requestId}`);
                return false;
            }

            if (!request.isPending()) {
                console.warn(`[ApprovalBridge] Request not pending: ${requestId}`);
                return false;
            }

            // Validate against governance (Chapter 6)
            const validation = this._validateAgainstGovernance(request);
            if (!validation.passed) {
                console.warn('[ApprovalBridge] Governance validation failed:', validation.issues);
                return false;
            }

            request.approve(reviewer || this._config.defaultReviewer);
            this._activeRequests = this._activeRequests.filter(r => r.requestId !== requestId);
            this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== requestId);

            this._emit('requestApproved', request.toJSON());
            console.log(`[ApprovalBridge] Request approved: ${requestId}`);

            // Send to Action Planner
            this._sendToActionPlanner(request);

            return true;
        }

        rejectRequest(requestId, reason, reviewer) {
            const request = this._findRequest(requestId);
            if (!request) {
                console.warn(`[ApprovalBridge] Request not found: ${requestId}`);
                return false;
            }

            if (!request.isPending()) {
                console.warn(`[ApprovalBridge] Request not pending: ${requestId}`);
                return false;
            }

            request.reject(reason || 'Rejected by governance', reviewer || this._config.defaultReviewer);
            this._activeRequests = this._activeRequests.filter(r => r.requestId !== requestId);
            this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== requestId);

            this._emit('requestRejected', request.toJSON());
            console.log(`[ApprovalBridge] Request rejected: ${requestId}`);

            return true;
        }

        requireReview(requestId, reason, reviewer) {
            const request = this._findRequest(requestId);
            if (!request) {
                console.warn(`[ApprovalBridge] Request not found: ${requestId}`);
                return false;
            }

            if (!request.isPending()) {
                console.warn(`[ApprovalBridge] Request not pending: ${requestId}`);
                return false;
            }

            request.requireReview(reason || 'Manual review required', reviewer || this._config.defaultReviewer);
            this._activeRequests = this._activeRequests.filter(r => r.requestId !== requestId);
            this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== requestId);

            this._emit('requestReviewRequired', request.toJSON());
            console.log(`[ApprovalBridge] Review required: ${requestId}`);

            return true;
        }

        // ==============================================
        // Retry Logic (Chapter 7)
        // ==============================================

        retryRequest(requestId) {
            const request = this._findRequest(requestId);
            if (!request) {
                console.warn(`[ApprovalBridge] Request not found: ${requestId}`);
                return false;
            }

            if (request.retryCount >= request.maxRetries) {
                console.warn(`[ApprovalBridge] Max retries reached: ${requestId}`);
                return false;
            }

            request.retryCount++;
            request.status = APPROVAL_STATUS.PENDING;
            request.result = null;
            request.reason = null;
            request.reviewedAt = null;

            this._activeRequests.push(request);
            this._pendingQueue.push(request);

            this._emit('requestRetried', request.toJSON());
            console.log(`[ApprovalBridge] Request retried (${request.retryCount}/${request.maxRetries}): ${requestId}`);

            this._processRequest(request);
            return true;
        }

        // ==============================================
        // Validation Rules (Chapter 6)
        // ==============================================

        validateRequest(request) {
            const checks = {
                hasRecommendationId: !!request.recommendationId,
                validPriority: ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].includes(request.priority),
                validRisk: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(request.risk),
                validConfidence: request.confidence >= 0 && request.confidence <= 100,
                notExpired: !request.metadata?.expired
            };

            const allPassed = Object.values(checks).every(v => v === true);

            return {
                valid: allPassed,
                checks: checks,
                issues: Object.keys(checks).filter(k => !checks[k])
            };
        }

        _validateAgainstGovernance(request) {
            const issues = [];

            // Check risk level
            if (request.risk === 'CRITICAL' && this._config.requireManualReviewForHighRisk) {
                issues.push('Critical risk requires manual review');
            }

            // Check confidence
            if (request.confidence < 50) {
                issues.push('Low confidence requires review');
            }

            // Check against governance policies
            if (window.LawAIApp && window.LawAIApp.Governance) {
                // Additional governance checks would go here
            }

            return {
                passed: issues.length === 0,
                issues: issues
            };
        }

        _validateRecommendation(recommendation) {
            const issues = [];

            if (!recommendation || !recommendation.recommendationId) {
                issues.push('Missing recommendation ID');
            }
            if (!recommendation.reason || recommendation.reason.length === 0) {
                issues.push('Missing reason');
            }
            if (!recommendation.risk) {
                issues.push('Missing risk level');
            }
            if (!recommendation.priority) {
                issues.push('Missing priority');
            }

            return {
                valid: issues.length === 0,
                issues: issues
            };
        }

        // ==============================================
        // Statistics
        // ==============================================

        getApprovalStats() {
            const total = this._requests.length;
            const pending = this._requests.filter(r => r.isPending()).length;
            const approved = this._requests.filter(r => r.result === APPROVAL_RESULT.APPROVED).length;
            const rejected = this._requests.filter(r => r.result === APPROVAL_RESULT.REJECTED).length;
            const reviewRequired = this._requests.filter(r => r.result === APPROVAL_RESULT.REVIEW_REQUIRED).length;
            const expired = this._requests.filter(r => r.result === APPROVAL_RESULT.EXPIRED).length;

            const byPriority = {};
            ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].forEach(p => {
                byPriority[p] = this._requests.filter(r => r.priority === p).length;
            });

            const byRisk = {};
            ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].forEach(r => {
                byRisk[r] = this._requests.filter(req => req.risk === r).length;
            });

            const approvalRate = approved + rejected > 0
                ? Math.round((approved / (approved + rejected)) * 100)
                : 0;

            const avgResponseTime = this._calculateAvgResponseTime();

            return {
                total,
                pending,
                approved,
                rejected,
                reviewRequired,
                expired,
                byPriority,
                byRisk,
                approvalRate,
                avgResponseTime,
                activeQueue: this._pendingQueue.length
            };
        }

        _calculateAvgResponseTime() {
            const completed = this._requests.filter(r => r.isFinalized() && r.reviewedAt);
            if (completed.length === 0) return 0;

            const totalTime = completed.reduce((sum, r) => {
                return sum + (r.reviewedAt - r.timestamp);
            }, 0);

            return Math.round(totalTime / completed.length);
        }

        // ==============================================
        // Explorer Support (Chapter 9)
        // ==============================================

        getExplorerData() {
            const stats = this.getApprovalStats();
            const pending = this.getPendingRequests().slice(0, 10);
            const recent = this.getCompletedRequests(5);

            return {
                type: 'approval_bridge',
                status: this._initialized ? 'active' : 'inactive',
                stats: stats,
                pendingQueue: pending,
                recentRequests: recent,
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
                        console.error(`[ApprovalBridge] Listener error (${event}):`, e);
                    }
                });
            }

            if (window.LawAIApp && window.LawAIApp.Events) {
                window.LawAIApp.Events.emit(`approval.${event}`, data);
            }
        }

        // ==============================================
        // Private Methods
        // ==============================================

        _findRequest(id) {
            return this._requests.find(r => r.requestId === id) || null;
        }

        _processRequest(request) {
            // If high risk and manual review required, don't auto-approve
            if (request.risk === 'CRITICAL' && this._config.requireManualReviewForHighRisk) {
                request.requireReview('High risk requires manual review', 'system');
                this._activeRequests = this._activeRequests.filter(r => r.requestId !== request.requestId);
                this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== request.requestId);
                this._emit('requestReviewRequired', request.toJSON());
                return;
            }

            // Auto-approve low risk
            if (request.risk === 'LOW' && request.confidence >= 70) {
                this.approveRequest(request.requestId, 'system');
                return;
            }

            // Otherwise, mark as pending for manual review
            // (will be picked up by admin or governance)
            this._emit('requestPending', request.toJSON());
        }

        _startRequestProcessor() {
            setInterval(() => {
                if (this._pendingQueue.length === 0) return;

                // Process one request at a time
                const request = this._pendingQueue[0];
                this._processRequest(request);
                this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== request.requestId);
            }, 5000); // Process every 5 seconds
        }

        _startExpiryChecker() {
            setInterval(() => {
                const now = Date.now();
                const cutoff = now - this._config.autoExpireAfterMs;

                this._activeRequests.forEach(request => {
                    if (request.timestamp < cutoff && request.isPending()) {
                        request.expire();
                        this._activeRequests = this._activeRequests.filter(r => r.requestId !== request.requestId);
                        this._pendingQueue = this._pendingQueue.filter(r => r.requestId !== request.requestId);
                        this._emit('requestExpired', request.toJSON());
                        console.log(`[ApprovalBridge] Request expired: ${request.requestId}`);
                    }
                });
            }, 60000); // Check every minute
        }

        // ==============================================
        // Integrations (Chapter 8)
        // ==============================================

        _connectToRecommendationEngine() {
            if (window.LawAIApp && window.LawAIApp.RecommendationEngine) {
                // Listen for reviewed recommendations
                window.LawAIApp.RecommendationEngine.on('recommendationReviewed', (rec) => {
                    this.submitRequest(rec);
                });
                console.log('[ApprovalBridge] Connected to Recommendation Engine');
            }
        }

        _connectToGovernance() {
            if (window.LawAIApp && window.LawAIApp.Governance) {
                // Register with governance for policy checks
                console.log('[ApprovalBridge] Connected to Governance');
            }
        }

        _connectToActionPlanner() {
            // Future: connect to Action Planner
            console.log('[ApprovalBridge] Action Planner integration ready');
        }

        _sendToActionPlanner(request) {
            if (window.LawAIApp && window.LawAIApp.ActionPlanner) {
                try {
                    console.log(`[ApprovalBridge] Sent approved request ${request.requestId} to Action Planner`);
                } catch (e) {
                    console.warn('[ApprovalBridge] Could not send to Action Planner:', e);
                }
            }
        }

        _registerWithExplorer() {
            if (window.LawAIApp && window.LawAIApp.Runtime && window.LawAIApp.Runtime.Explorer) {
                try {
                    window.LawAIApp.Runtime.Explorer.register({
                        id: 'approval-bridge',
                        name: 'Approval Bridge',
                        category: 'autonomous',
                        type: 'core',
                        getData: () => this.getExplorerData()
                    });
                    console.log('[ApprovalBridge] Registered with Runtime Explorer');
                } catch (e) {
                    console.warn('[ApprovalBridge] Could not register with Explorer:', e);
                }
            }
        }
    }

    // ==================================================
    // Singleton & Global Exposure
    // ==================================================

    const instance = new ApprovalBridge();

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.ApprovalBridge = {
        Core: instance,
        APPROVAL_RESULT: APPROVAL_RESULT,
        APPROVAL_STATUS: APPROVAL_STATUS,

        // Public API
        initialize: (config) => instance.initialize(config),
        submitRequest: (recommendation, options) => instance.submitRequest(recommendation, options),

        getRequest: (id) => instance.getRequest(id),
        getRequests: (filter) => instance.getRequests(filter),
        getPendingRequests: () => instance.getPendingRequests(),
        getCompletedRequests: (limit) => instance.getCompletedRequests(limit),

        approveRequest: (id, reviewer) => instance.approveRequest(id, reviewer),
        rejectRequest: (id, reason, reviewer) => instance.rejectRequest(id, reason, reviewer),
        requireReview: (id, reason, reviewer) => instance.requireReview(id, reason, reviewer),
        retryRequest: (id) => instance.retryRequest(id),

        validateRequest: (request) => instance.validateRequest(request),
        getApprovalStats: () => instance.getApprovalStats(),

        getExplorerData: () => instance.getExplorerData(),
        on: (event, callback) => instance.on(event, callback)
    };

    console.log('[ApprovalBridge] Part 50.5 loaded ✅');
    console.log('[ApprovalBridge] Results:', Object.values(APPROVAL_RESULT).join(' | '));
    console.log('[ApprovalBridge] Statuses:', Object.values(APPROVAL_STATUS).join(' | '));

})();
