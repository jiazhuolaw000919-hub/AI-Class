/**
 * AI Governance Integration
 * Part 49.6 — V4.9.6
 * 
 * AI Decision Process → Governance Integration:
 * - AI Decision Review
 * - Policy Checking
 * - Permission Verification
 * - Risk Assessment
 * - Response Control
 * - Human Oversight
 * 
 * AI Safety Rules:
 * 1. AI has no modification permission by default
 * 2. Recommendation ≠ Execution
 * 3. High risk decisions must be reviewed
 * 4. AI decisions must leave reasoning trail
 */

class AIGovernanceIntegration {
    constructor() {
        this.version = '4.9.6';
        this.status = 'ACTIVE';
        
        // Decision stores
        this.aiDecisions = [];
        this.reviewQueue = [];
        this.approvalHistory = [];
        this.feedbackLoop = [];
        
        // AI Action Levels (Chapter 63)
        this.actionLevels = {
            0: {
                level: 0,
                name: 'OBSERVATION',
                description: 'Read-only access',
                allowsActions: ['READ'],
                requiresApproval: false,
                maxRiskAllowed: 'LOW'
            },
            1: {
                level: 1,
                name: 'ANALYSIS',
                description: 'Can analyze data',
                allowsActions: ['READ', 'ANALYZE'],
                requiresApproval: false,
                maxRiskAllowed: 'LOW'
            },
            2: {
                level: 2,
                name: 'RECOMMENDATION',
                description: 'Can provide suggestions',
                allowsActions: ['READ', 'ANALYZE', 'RECOMMEND'],
                requiresApproval: false,
                maxRiskAllowed: 'MEDIUM'
            },
            3: {
                level: 3,
                name: 'ASSISTED_ACTION',
                description: 'Can act with confirmation',
                allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY'],
                requiresApproval: true,
                maxRiskAllowed: 'HIGH'
            },
            4: {
                level: 4,
                name: 'AUTONOMOUS',
                description: 'Autonomous action (future)',
                allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY', 'EXECUTE'],
                requiresApproval: true,
                maxRiskAllowed: 'HIGH',
                isFuture: true
            }
        };
        
        // AI's current action level (default: RECOMMENDATION — Rule 1)
        this.currentAILevel = 2;
        
        // Review queue configuration
        this.reviewConfig = {
            maxQueueSize: 100,
            autoExpireMinutes: 60,
            requireExplicitApproval: true
        };
        
        // System state
        this.systemState = {
            initialized: false,
            totalDecisions: 0,
            approvedDecisions: 0,
            rejectedDecisions: 0,
            pendingReview: 0,
            aiConfidenceAvg: 0,
            lastDecision: null,
            integrationHealth: 'HEALTHY'
        };
        
        // Reasoning trail storage
        this.reasoningTrails = new Map();
        
        this.init();
    }
    
    /**
     * Initialize AI Governance Integration
     */
    init() {
        console.log('[AIGovernance] Initializing...');
        
        // Register default AI subject in Permission System
        this._ensureAISubject();
        
        // Initialize review queue
        this._initReviewQueue();
        
        this.systemState.initialized = true;
        
        console.log(`[AIGovernance] Ready — AI Level: ${this.actionLevels[this.currentAILevel].name} — Recommendation ≠ Execution`);
        
        this._emitEvent('aiGovernance.initialized', {
            version: this.version,
            aiLevel: this.currentAILevel,
            aiLevelName: this.actionLevels[this.currentAILevel].name
        });
    }
    
    // ========== CORE: AI DECISION GOVERNANCE ==========
    
    /**
     * Process an AI decision through governance
     * This is the main entry point for AI decision governance.
     * 
     * @param {Object} aiDecision - AI's proposed decision/recommendation
     * @returns {Object} Governed AI decision
     */
    processAIDecision(aiDecision = {}) {
        const startTime = performance.now();
        const decisionId = `AIDEC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        this.systemState.totalDecisions++;
        
        const {
            reasoning,          // AI's reasoning process (Rule 4)
            recommendation,     // What AI suggests
            confidence,         // AI confidence score (0-1)
            action,             // Proposed action
            target,             // Target of action
            context = {},       // Additional context
            cognitiveResult = {} // Result from Cognitive Engine
        } = aiDecision;
        
        // Step 0: Validate AI has reasoning (Rule 4)
        if (!reasoning || reasoning.trim().length === 0) {
            const result = this._createAIDecisionResult(
                decisionId, aiDecision, 'REJECTED',
                'AI decision rejected: Missing reasoning trail (Rule 4)',
                null, null
            );
            this._recordAIDecision(result);
            return result;
        }
        
        // Step 1: Determine AI's current capabilities
        const aiCapabilities = this.actionLevels[this.currentAILevel];
        
        // Step 2: Check if proposed action is within AI's allowed actions
        if (action) {
            const actionUpper = action.toUpperCase();
            const allowedActions = aiCapabilities.allowsActions;
            
            // Check if action is allowed at current level
            const isAllowed = allowedActions.some(allowed => 
                actionUpper === allowed || actionUpper.startsWith(allowed)
            );
            
            if (!isAllowed) {
                const result = this._createAIDecisionResult(
                    decisionId, aiDecision, 'REJECTED',
                    `AI level "${aiCapabilities.name}" cannot perform "${action}". ` +
                    `Allowed actions: ${allowedActions.join(', ')}. Recommendation ≠ Execution (Rule 2)`,
                    null, null
                );
                this._recordAIDecision(result);
                return result;
            }
        }
        
        // Step 3: Run through Governance Layer
        const governanceResult = this._runGovernanceChecks(aiDecision, aiCapabilities);
        
        // Step 4: Determine final decision
        let finalDecision;
        let finalAction = null;
        let requiresHumanReview = false;
        
        if (governanceResult.blocked) {
            finalDecision = 'REJECTED';
        } else if (governanceResult.requiresApproval || aiCapabilities.requiresApproval) {
            finalDecision = 'REQUIRES_APPROVAL';
            requiresHumanReview = true;
            
            // Add to review queue
            this._addToReviewQueue(decisionId, aiDecision, governanceResult);
        } else if (governanceResult.riskLevel === 'HIGH' || governanceResult.riskLevel === 'CRITICAL') {
            // Rule 3: High risk decisions must be reviewed
            finalDecision = 'REQUIRES_APPROVAL';
            requiresHumanReview = true;
            this._addToReviewQueue(decisionId, aiDecision, governanceResult);
        } else {
            finalDecision = 'APPROVED';
            
            // For RECOMMENDATION level, only generate suggestion, don't execute
            if (this.currentAILevel === 2 && action) {
                finalAction = {
                    type: 'SUGGESTION_ONLY',
                    message: `AI suggests: ${recommendation}. Awaiting your confirmation to execute.`,
                    proposedAction: action,
                    proposedTarget: target,
                    requiresConfirmation: true
                };
            } else {
                finalAction = {
                    type: 'APPROVED_ACTION',
                    action: action,
                    target: target
                };
            }
        }
        
        // Step 5: Build AI decision result
        const result = this._createAIDecisionResult(
            decisionId,
            aiDecision,
            finalDecision,
            governanceResult.reason || `AI decision processed at level ${aiCapabilities.name}`,
            governanceResult,
            finalAction
        );
        
        result.requiresHumanReview = requiresHumanReview;
        result.aiLevel = this.currentAILevel;
        result.aiLevelName = aiCapabilities.name;
        result.evaluationTime = `${(performance.now() - startTime).toFixed(2)}ms`;
        
        // Step 6: Store reasoning trail (Rule 4)
        this._storeReasoningTrail(decisionId, aiDecision, result);
        
        // Step 7: Record and emit
        this._recordAIDecision(result);
        this._emitAIDecisionEvent(result);
        
        return result;
    }
    
    /**
     * Quick AI suggestion — always returns suggestion only, never executes
     * @param {string} recommendation - What AI suggests
     * @param {string} reasoning - Why AI suggests it
     * @param {number} confidence - AI confidence (0-1)
     * @returns {Object}
     */
    suggestOnly(recommendation, reasoning, confidence = 0.8) {
        return this.processAIDecision({
            reasoning,
            recommendation,
            confidence,
            action: 'RECOMMEND',
            target: 'user_decision',
            context: { suggestionOnly: true }
        });
    }
    
    /**
     * AI requests permission to execute an action
     * @param {Object} request
     * @returns {Object}
     */
    requestExecution({ action, target, reasoning, recommendation, confidence, params = {} }) {
        return this.processAIDecision({
            reasoning,
            recommendation,
            confidence,
            action,
            target,
            params,
            context: { executionRequest: true }
        });
    }
    
    // ========== HUMAN OVERSIGHT ==========
    
    /**
     * Approve a pending AI decision
     * @param {string} decisionId
     * @param {Object} approverInfo - Who approved and why
     * @returns {Object}
     */
    approveDecision(decisionId, approverInfo = {}) {
        const pendingItem = this.reviewQueue.find(item => item.decisionId === decisionId);
        
        if (!pendingItem) {
            return {
                success: false,
                error: `Decision ${decisionId} not found in review queue`,
                timestamp: new Date().toISOString()
            };
        }
        
        // Remove from queue
        this.reviewQueue = this.reviewQueue.filter(item => item.decisionId !== decisionId);
        this.systemState.pendingReview = this.reviewQueue.length;
        
        // Record approval
        const approval = {
            decisionId,
            approvedBy: approverInfo.approvedBy || 'human_operator',
            approvedAt: new Date().toISOString(),
            reason: approverInfo.reason || 'Manual approval',
            notes: approverInfo.notes || '',
            originalDecision: pendingItem
        };
        
        this.approvalHistory.push(approval);
        this.systemState.approvedDecisions++;
        
        // Execute the approved action if applicable
        let executionResult = null;
        if (pendingItem.aiDecision.action && pendingItem.aiDecision.target) {
            executionResult = this._executeApprovedAction(pendingItem.aiDecision);
        }
        
        this._audit('AI_DECISION_APPROVED', { decisionId, approval, executionResult });
        this._emitEvent('aiGovernance.decisionApproved', { decisionId, approval });
        
        // Add to feedback loop
        this._addFeedback({
            decisionId,
            type: 'APPROVED',
            aiConfidence: pendingItem.aiDecision.confidence,
            humanFeedback: approverInfo.reason
        });
        
        return {
            success: true,
            decisionId,
            approval,
            executionResult,
            message: `AI decision ${decisionId} approved and executed`
        };
    }
    
    /**
     * Reject a pending AI decision
     * @param {string} decisionId
     * @param {Object} rejectInfo - Who rejected and why
     * @returns {Object}
     */
    rejectDecision(decisionId, rejectInfo = {}) {
        const pendingItem = this.reviewQueue.find(item => item.decisionId === decisionId);
        
        if (!pendingItem) {
            return {
                success: false,
                error: `Decision ${decisionId} not found in review queue`,
                timestamp: new Date().toISOString()
            };
        }
        
        // Remove from queue
        this.reviewQueue = this.reviewQueue.filter(item => item.decisionId !== decisionId);
        this.systemState.pendingReview = this.reviewQueue.length;
        this.systemState.rejectedDecisions++;
        
        const rejection = {
            decisionId,
            rejectedBy: rejectInfo.rejectedBy || 'human_operator',
            rejectedAt: new Date().toISOString(),
            reason: rejectInfo.reason || 'Manual rejection',
            notes: rejectInfo.notes || ''
        };
        
        this._audit('AI_DECISION_REJECTED', { decisionId, rejection });
        this._emitEvent('aiGovernance.decisionRejected', { decisionId, rejection });
        
        // Add to feedback loop
        this._addFeedback({
            decisionId,
            type: 'REJECTED',
            aiConfidence: pendingItem.aiDecision.confidence,
            humanFeedback: rejectInfo.reason
        });
        
        return {
            success: true,
            decisionId,
            rejection,
            message: `AI decision ${decisionId} rejected`
        };
    }
    
    /**
     * Get pending review queue
     * @returns {Array}
     */
    getReviewQueue() {
        // Clean expired items
        this._cleanExpiredReviews();
        
        return this.reviewQueue.map(item => ({
            decisionId: item.decisionId,
            recommendation: item.aiDecision.recommendation,
            reasoning: item.aiDecision.reasoning,
            confidence: item.aiDecision.confidence,
            proposedAction: item.aiDecision.action,
            proposedTarget: item.aiDecision.target,
            riskLevel: item.governanceResult?.riskLevel || 'UNKNOWN',
            submittedAt: item.submittedAt,
            expiresAt: item.expiresAt
        }));
    }
    
    /**
     * Get approval history
     * @param {number} limit
     * @returns {Array}
     */
    getApprovalHistory(limit = 50) {
        return this.approvalHistory.slice(-limit);
    }
    
    /**
     * Get feedback loop data
     * @returns {Array}
     */
    getFeedbackLoop() {
        return [...this.feedbackLoop];
    }
    
    // ========== AI LEVEL MANAGEMENT ==========
    
    /**
     * Set AI action level
     * @param {number} level - 0-4
     * @param {string} reason - Why the level is being changed
     * @returns {Object}
     */
    setAILevel(level, reason = 'Manual adjustment') {
        if (!this.actionLevels[level]) {
            return {
                success: false,
                error: `Invalid AI level: ${level}. Must be 0-4.`
            };
        }
        
        const oldLevel = this.currentAILevel;
        const oldLevelName = this.actionLevels[oldLevel].name;
        
        this.currentAILevel = level;
        const newLevel = this.actionLevels[level];
        
        this._audit('AI_LEVEL_CHANGED', {
            oldLevel,
            oldLevelName,
            newLevel: level,
            newLevelName: newLevel.name,
            reason
        });
        
        this._emitEvent('aiGovernance.levelChanged', {
            oldLevel,
            oldLevelName,
            newLevel: level,
            newLevelName: newLevel.name
        });
        
        console.log(`[AIGovernance] AI Level: ${oldLevelName} → ${newLevel.name} — ${reason}`);
        
        return {
            success: true,
            previousLevel: { level: oldLevel, name: oldLevelName },
            currentLevel: { level, name: newLevel.name },
            capabilities: {
                allowedActions: newLevel.allowsActions,
                requiresApproval: newLevel.requiresApproval,
                maxRiskAllowed: newLevel.maxRiskAllowed
            }
        };
    }
    
    /**
     * Get current AI level info
     * @returns {Object}
     */
    getAILevel() {
        const level = this.actionLevels[this.currentAILevel];
        return {
            level: this.currentAILevel,
            name: level.name,
            description: level.description,
            allowedActions: level.allowsActions,
            requiresApproval: level.requiresApproval,
            maxRiskAllowed: level.maxRiskAllowed,
            isFuture: level.isFuture || false
        };
    }
    
    // ========== REPORTING ==========
    
    /**
     * Get AI Governance report
     * @returns {Object}
     */
    getReport() {
        const decisionsByType = {
            APPROVED: this.systemState.approvedDecisions,
            REJECTED: this.systemState.rejectedDecisions,
            REQUIRES_APPROVAL: this.systemState.pendingReview
        };
        
        // Calculate confidence trends
        const recentDecisions = this.aiDecisions.slice(-20);
        const avgConfidence = recentDecisions.length > 0
            ? recentDecisions.reduce((sum, d) => sum + (d.aiDecision?.confidence || 0), 0) / recentDecisions.length
            : 0;
        
        return {
            version: this.version,
            status: this.systemState.integrationHealth,
            aiLevel: {
                current: this.currentAILevel,
                name: this.actionLevels[this.currentAILevel].name,
                allowedActions: this.actionLevels[this.currentAILevel].allowsActions,
                requiresApproval: this.actionLevels[this.currentAILevel].requiresApproval
            },
            decisions: {
                total: this.systemState.totalDecisions,
                ...decisionsByType,
                avgConfidence: `${(avgConfidence * 100).toFixed(1)}%`
            },
            reviewQueue: {
                pending: this.reviewQueue.length,
                maxSize: this.reviewConfig.maxQueueSize
            },
            feedback: {
                total: this.feedbackLoop.length,
                recent: this.feedbackLoop.slice(-5)
            },
            rules: [
                'Rule 1: AI has no modification permission by default ✅',
                'Rule 2: Recommendation ≠ Execution ✅',
                'Rule 3: High risk decisions must be reviewed ✅',
                'Rule 4: AI decisions must leave reasoning ✅'
            ],
            recentDecisions: this.aiDecisions.slice(-10).map(d => ({
                decisionId: d.decisionId,
                recommendation: d.aiDecision?.recommendation?.substring(0, 80),
                finalDecision: d.finalDecision,
                confidence: d.aiDecision?.confidence,
                timestamp: d.timestamp
            }))
        };
    }
    
    /**
     * Get AI Governance health
     * @returns {Object}
     */
    getHealth() {
        const pendingRatio = this.systemState.totalDecisions > 0
            ? this.systemState.pendingReview / this.systemState.totalDecisions
            : 0;
        
        let health = 'HEALTHY';
        if (pendingRatio > 0.5) health = 'BACKLOG';
        if (this.systemState.rejectedDecisions > this.systemState.approvedDecisions * 2) health = 'MISALIGNED';
        if (!this.systemState.initialized) health = 'NOT_INITIALIZED';
        
        this.systemState.integrationHealth = health;
        
        return {
            status: health,
            version: this.version,
            aiLevel: this.actionLevels[this.currentAILevel].name,
            totalDecisions: this.systemState.totalDecisions,
            pendingReview: this.systemState.pendingReview,
            approvalRate: this.systemState.totalDecisions > 0
                ? `${((this.systemState.approvedDecisions / this.systemState.totalDecisions) * 100).toFixed(1)}%`
                : 'N/A',
            lastDecision: this.systemState.lastDecision,
            isOperational: true
        };
    }
    
    /**
     * Get AI decision history
     * @param {number} limit
     * @returns {Array}
     */
    getDecisionHistory(limit = 50) {
        return this.aiDecisions.slice(-limit);
    }
    
    /**
     * Get reasoning trail for a decision
     * @param {string} decisionId
     * @returns {Object|null}
     */
    getReasoningTrail(decisionId) {
        return this.reasoningTrails.get(decisionId) || null;
    }
    
    // ========== PRIVATE: GOVERNANCE CHECKS ==========
    
    /**
     * Run AI decision through all governance layers
     */
    _runGovernanceChecks(aiDecision, aiCapabilities) {
        const checks = [];
        let blocked = false;
        let requiresApproval = false;
        let riskLevel = 'LOW';
        const reasons = [];
        
        // Check 1: Policy Engine
        try {
            if (window.LawAIApp?.Policy?.isAllowed) {
                const policyCheck = window.LawAIApp.Policy.isAllowed(
                    aiDecision.action || 'RECOMMEND',
                    { 
                        source: 'AI_ASSISTANT',
                        confidence: aiDecision.confidence,
                        context: aiDecision.context
                    }
                );
                
                checks.push({ layer: 'POLICY', result: policyCheck });
                
                if (!policyCheck.allowed) {
                    if (policyCheck.decision === 'DENY') {
                        blocked = true;
                        reasons.push(`Policy Engine denied: ${policyCheck.reason}`);
                    } else if (policyCheck.requiresReview) {
                        requiresApproval = true;
                        reasons.push(`Policy Engine requires review: ${policyCheck.reason}`);
                    }
                }
                
                // Track risk
                if (policyCheck.decision === 'DENY') riskLevel = 'CRITICAL';
                else if (policyCheck.requiresReview && riskLevel === 'LOW') riskLevel = 'MEDIUM';
            }
        } catch (e) {
            checks.push({ layer: 'POLICY', error: e.message });
        }
        
        // Check 2: Permission System
        try {
            if (window.LawAIApp?.Permissions?.checkAccess) {
                const permCheck = window.LawAIApp.Permissions.checkAccess(
                    'SUB-AI-001',
                    aiDecision.target || '*',
                    aiDecision.action || 'RECOMMEND',
                    { source: 'AI_ASSISTANT', confidence: aiDecision.confidence }
                );
                
                checks.push({ layer: 'PERMISSION', result: permCheck });
                
                if (!permCheck.granted) {
                    blocked = true;
                    reasons.push(`Permission denied: ${permCheck.reason}`);
                    riskLevel = 'CRITICAL';
                }
            }
        } catch (e) {
            checks.push({ layer: 'PERMISSION', error: e.message });
        }
        
        // Check 3: Validation System
        try {
            if (window.LawAIApp?.Validation?.quickValidate) {
                const validCheck = window.LawAIApp.Validation.quickValidate({
                    action: aiDecision.action || 'RECOMMEND',
                    target: aiDecision.target,
                    source: 'AI_ASSISTANT',
                    params: aiDecision.params || {}
                });
                
                checks.push({ layer: 'VALIDATION', result: validCheck });
                
                if (!validCheck.valid) {
                    if (validCheck.decision === 'REJECT') {
                        blocked = true;
                        reasons.push(`Validation rejected: ${validCheck.reason}`);
                        riskLevel = 'CRITICAL';
                    } else if (validCheck.decision === 'REVIEW') {
                        requiresApproval = true;
                        reasons.push(`Validation requires review: Risk ${validCheck.risk}`);
                        if (validCheck.risk === 'HIGH') riskLevel = 'HIGH';
                        else if (validCheck.risk === 'MEDIUM' && riskLevel === 'LOW') riskLevel = 'MEDIUM';
                    }
                }
            }
        } catch (e) {
            checks.push({ layer: 'VALIDATION', error: e.message });
        }
        
        // Check 4: Safety & Compliance
        try {
            if (window.LawAIApp?.Safety?.quickCheck) {
                const safetyCheck = window.LawAIApp.Safety.quickCheck({
                    action: aiDecision.action || 'RECOMMEND',
                    target: aiDecision.target,
                    source: 'SUB-AI-001',
                    context: { 
                        aiDecision: true,
                        confidence: aiDecision.confidence,
                        approved: false
                    }
                });
                
                checks.push({ layer: 'SAFETY', result: safetyCheck });
                
                if (safetyCheck.decision === 'BLOCKED') {
                    blocked = true;
                    reasons.push(`Safety blocked: ${safetyCheck.reason}`);
                    riskLevel = 'CRITICAL';
                } else if (safetyCheck.decision === 'REQUIRES_APPROVAL') {
                    requiresApproval = true;
                    reasons.push(`Safety requires approval: ${safetyCheck.reason}`);
                    if (safetyCheck.classification?.level >= 4) riskLevel = 'HIGH';
                }
            }
        } catch (e) {
            checks.push({ layer: 'SAFETY', error: e.message });
        }
        
        // Check 5: AI confidence check
        if (aiDecision.confidence !== undefined && aiDecision.confidence < 0.5) {
            requiresApproval = true;
            reasons.push(`Low AI confidence: ${(aiDecision.confidence * 100).toFixed(0)}%`);
            if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
        }
        
        // Check 6: AI capability boundary
        const maxRisk = aiCapabilities.maxRiskAllowed;
        const riskOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const maxRiskIndex = riskOrder.indexOf(maxRisk);
        const currentRiskIndex = riskOrder.indexOf(riskLevel);
        
        if (currentRiskIndex > maxRiskIndex) {
            requiresApproval = true;
            reasons.push(`Risk level "${riskLevel}" exceeds AI's max allowed risk "${maxRisk}"`);
        }
        
        return {
            blocked,
            requiresApproval,
            riskLevel,
            reason: reasons.join('; ') || 'All governance checks passed',
            checks,
            timestamp: new Date().toISOString()
        };
    }
    
    // ========== PRIVATE: HELPERS ==========
    
    /**
     * Ensure AI subject exists in Permission System
     */
    _ensureAISubject() {
        try {
            if (window.LawAIApp?.Permissions?.registerSubject) {
                const existing = window.LawAIApp.Permissions.getSubject('SUB-AI-001');
                if (!existing) {
                    window.LawAIApp.Permissions.registerSubject({
                        subjectId: 'SUB-AI-001',
                        type: 'ai_assistant',
                        name: 'AI Runtime Assistant',
                        metadata: {
                            description: 'AI assistant governed by AIGovernanceIntegration',
                            defaultLevel: 'RECOMMENDATION',
                            maxLevel: 'ASSISTED_ACTION'
                        }
                    });
                }
            }
        } catch (e) {
            console.debug('[AIGovernance] AI subject registration deferred (Permission System not ready)');
        }
    }
    
    /**
     * Initialize review queue
     */
    _initReviewQueue() {
        // Set up periodic cleanup of expired reviews
        setInterval(() => {
            this._cleanExpiredReviews();
        }, 60000); // Every minute
    }
    
    /**
     * Add decision to review queue
     */
    _addToReviewQueue(decisionId, aiDecision, governanceResult) {
        const queueItem = {
            decisionId,
            aiDecision,
            governanceResult,
            submittedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.reviewConfig.autoExpireMinutes * 60 * 1000).toISOString()
        };
        
        this.reviewQueue.push(queueItem);
        this.systemState.pendingReview = this.reviewQueue.length;
        
        // Trim queue if over max size
        if (this.reviewQueue.length > this.reviewConfig.maxQueueSize) {
            const removed = this.reviewQueue.shift();
            this._audit('REVIEW_EXPIRED_QUEUE_FULL', { decisionId: removed.decisionId });
        }
        
        this._emitEvent('aiGovernance.reviewQueued', {
            decisionId,
            recommendation: aiDecision.recommendation?.substring(0, 100),
            expiresAt: queueItem.expiresAt
        });
    }
    
    /**
     * Clean expired review items
     */
    _cleanExpiredReviews() {
        const now = new Date();
        const expired = this.reviewQueue.filter(item => new Date(item.expiresAt) < now);
        
        if (expired.length > 0) {
            for (const item of expired) {
                this._audit('REVIEW_EXPIRED', {
                    decisionId: item.decisionId,
                    recommendation: item.aiDecision.recommendation
                });
            }
            
            this.reviewQueue = this.reviewQueue.filter(item => new Date(item.expiresAt) >= now);
            this.systemState.pendingReview = this.reviewQueue.length;
        }
    }
    
    /**
     * Execute an approved action
     */
    _executeApprovedAction(aiDecision) {
        try {
            // Delegate to appropriate system based on action
            const { action, target, params } = aiDecision;
            
            // For now, log the execution
            console.log(`[AIGovernance] Executing approved action: ${action} on ${target}`);
            
            // Emit execution event
            this._emitEvent('aiGovernance.actionExecuted', {
                action,
                target,
                params,
                approvedAt: new Date().toISOString()
            });
            
            return {
                success: true,
                action,
                target,
                message: `Action "${action}" executed on "${target}"`
            };
        } catch (e) {
            return {
                success: false,
                error: e.message
            };
        }
    }
    
    /**
     * Store reasoning trail (Rule 4)
     */
    _storeReasoningTrail(decisionId, aiDecision, result) {
        const trail = {
            decisionId,
            reasoning: aiDecision.reasoning,
            recommendation: aiDecision.recommendation,
            confidence: aiDecision.confidence,
            cognitiveContext: aiDecision.cognitiveResult,
            governanceResult: {
                decision: result.finalDecision,
                reason: result.reason,
                riskLevel: result.governanceResult?.riskLevel,
                checks: result.governanceResult?.checks
            },
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.reasoningTrails.set(decisionId, trail);
        
        // Keep trails manageable
        if (this.reasoningTrails.size > 500) {
            const firstKey = this.reasoningTrails.keys().next().value;
            this.reasoningTrails.delete(firstKey);
        }
    }
    
    /**
     * Create AI decision result object
     */
    _createAIDecisionResult(decisionId, aiDecision, finalDecision, reason, governanceResult, finalAction) {
        return {
            decisionId,
            aiDecision: {
                reasoning: aiDecision.reasoning,
                recommendation: aiDecision.recommendation,
                confidence: aiDecision.confidence,
                proposedAction: aiDecision.action,
                proposedTarget: aiDecision.target
            },
            finalDecision,      // APPROVED | REJECTED | REQUIRES_APPROVAL
            reason,
            governanceResult,
            finalAction,
            timestamp: new Date().toISOString(),
            version: this.version
        };
    }
    
    /**
     * Record AI decision
     */
    _recordAIDecision(result) {
        this.aiDecisions.push(result);
        this.systemState.lastDecision = new Date().toISOString();
        
        if (result.finalDecision === 'APPROVED') {
            this.systemState.approvedDecisions++;
        } else if (result.finalDecision === 'REJECTED') {
            this.systemState.rejectedDecisions++;
        }
        
        // Keep decisions manageable
        if (this.aiDecisions.length > 500) {
            this.aiDecisions = this.aiDecisions.slice(-250);
        }
        
        this._audit('AI_DECISION_RECORDED', {
            decisionId: result.decisionId,
            finalDecision: result.finalDecision,
            confidence: result.aiDecision?.confidence
        });
    }
    
    /**
     * Add feedback to loop
     */
    _addFeedback(feedback) {
        this.feedbackLoop.push({
            ...feedback,
            recordedAt: new Date().toISOString()
        });
        
        // Keep feedback manageable
        if (this.feedbackLoop.length > 200) {
            this.feedbackLoop = this.feedbackLoop.slice(-100);
        }
    }
    
    /**
     * Emit AI decision event
     */
    _emitAIDecisionEvent(result) {
        const eventType = result.finalDecision === 'APPROVED' 
            ? 'aiGovernance.decisionApproved'
            : result.finalDecision === 'REJECTED'
                ? 'aiGovernance.decisionRejected'
                : 'aiGovernance.decisionRequiresApproval';
        
        this._emitEvent(eventType, {
            decisionId: result.decisionId,
            recommendation: result.aiDecision?.recommendation?.substring(0, 100),
            finalDecision: result.finalDecision,
            confidence: result.aiDecision?.confidence
        });
    }
    
    /**
     * Audit an action
     */
    _audit(action, data = {}) {
        const auditEntry = {
            action,
            data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this._emitEvent('aiGovernance.audit', auditEntry);
    }
    
    /**
     * Emit runtime event
     */
    _emitEvent(type, data) {
        if (window.LawAIApp?.RuntimeEventCollector) {
            try {
                window.LawAIApp.RuntimeEventCollector.emit({
                    type,
                    source: 'AIGovernanceIntegration',
                    data
                });
            } catch (e) {
                // Non-blocking
            }
        }
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }
    window.LawAIApp.AIGovernanceIntegration = new AIGovernanceIntegration();
    
    // API shortcuts
    window.LawAIApp.AIGovernance = {
        // Core AI decision processing
        processDecision: (decision) => 
            window.LawAIApp.AIGovernanceIntegration.processAIDecision(decision),
        suggestOnly: (recommendation, reasoning, confidence) => 
            window.LawAIApp.AIGovernanceIntegration.suggestOnly(recommendation, reasoning, confidence),
        requestExecution: (request) => 
            window.LawAIApp.AIGovernanceIntegration.requestExecution(request),
        
        // Human oversight
        approve: (decisionId, approverInfo) => 
            window.LawAIApp.AIGovernanceIntegration.approveDecision(decisionId, approverInfo),
        reject: (decisionId, rejectInfo) => 
            window.LawAIApp.AIGovernanceIntegration.rejectDecision(decisionId, rejectInfo),
        getReviewQueue: () => 
            window.LawAIApp.AIGovernanceIntegration.getReviewQueue(),
        getApprovalHistory: (limit) => 
            window.LawAIApp.AIGovernanceIntegration.getApprovalHistory(limit),
        getFeedbackLoop: () => 
            window.LawAIApp.AIGovernanceIntegration.getFeedbackLoop(),
        
        // AI level management
        setAILevel: (level, reason) => 
            window.LawAIApp.AIGovernanceIntegration.setAILevel(level, reason),
        getAILevel: () => 
            window.LawAIApp.AIGovernanceIntegration.getAILevel(),
        
        // Reporting
        getReport: () => window.LawAIApp.AIGovernanceIntegration.getReport(),
        getHealth: () => window.LawAIApp.AIGovernanceIntegration.getHealth(),
        getDecisionHistory: (limit) => 
            window.LawAIApp.AIGovernanceIntegration.getDecisionHistory(limit),
        getReasoningTrail: (decisionId) => 
            window.LawAIApp.AIGovernanceIntegration.getReasoningTrail(decisionId)
    };
}

export default AIGovernanceIntegration;
