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
        
        this.aiDecisions = [];
        this.reviewQueue = [];
        this.approvalHistory = [];
        this.feedbackLoop = [];
        
        this.actionLevels = {
            0: { level: 0, name: 'OBSERVATION', description: 'Read-only access', allowsActions: ['READ'], requiresApproval: false, maxRiskAllowed: 'LOW' },
            1: { level: 1, name: 'ANALYSIS', description: 'Can analyze data', allowsActions: ['READ', 'ANALYZE'], requiresApproval: false, maxRiskAllowed: 'LOW' },
            2: { level: 2, name: 'RECOMMENDATION', description: 'Can provide suggestions', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND'], requiresApproval: false, maxRiskAllowed: 'MEDIUM' },
            3: { level: 3, name: 'ASSISTED_ACTION', description: 'Can act with confirmation', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY'], requiresApproval: true, maxRiskAllowed: 'HIGH' },
            4: { level: 4, name: 'AUTONOMOUS', description: 'Autonomous action (future)', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY', 'EXECUTE'], requiresApproval: true, maxRiskAllowed: 'HIGH', isFuture: true }
        };
        
        this.currentAILevel = 2;
        
        this.reviewConfig = {
            maxQueueSize: 100,
            autoExpireMinutes: 60,
            requireExplicitApproval: true
        };
        
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
        
        this.reasoningTrails = new Map();
        
        this.init();
    }
    
    init() {
        console.log('[AIGovernance] Initializing...');
        
        this._ensureAISubject();
        this._initReviewQueue();
        
        this.systemState.initialized = true;
        
        console.log('[AIGovernance] Ready — AI Level: ' + this.actionLevels[this.currentAILevel].name + ' — Recommendation ≠ Execution');
        
        this._emitEvent('aiGovernance.initialized', {
            version: this.version,
            aiLevel: this.currentAILevel,
            aiLevelName: this.actionLevels[this.currentAILevel].name
        });
    }
    
    // ========== CORE: AI DECISION GOVERNANCE ==========
    
    processAIDecision(aiDecision) {
        if (!aiDecision) aiDecision = {};
        
        var startTime = performance.now();
        var decisionId = 'AIDEC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
        
        this.systemState.totalDecisions++;
        
        var reasoning = aiDecision.reasoning;
        var recommendation = aiDecision.recommendation;
        var confidence = aiDecision.confidence;
        var action = aiDecision.action;
        var target = aiDecision.target;
        var context = aiDecision.context || {};
        var cognitiveResult = aiDecision.cognitiveResult || {};
        
        // Step 0: Validate AI has reasoning (Rule 4)
        if (!reasoning || reasoning.trim().length === 0) {
            var result = this._createAIDecisionResult(
                decisionId, aiDecision, 'REJECTED',
                'AI decision rejected: Missing reasoning trail (Rule 4)',
                null, null
            );
            this._recordAIDecision(result);
            return result;
        }
        
        // Step 1: Determine AI's current capabilities
        var aiCapabilities = this.actionLevels[this.currentAILevel];
        
        // Step 2: Check if proposed action is within AI's allowed actions
        if (action) {
            var actionUpper = action.toUpperCase();
            var allowedActions = aiCapabilities.allowsActions;
            
            var isAllowed = false;
            for (var i = 0; i < allowedActions.length; i++) {
                if (actionUpper === allowedActions[i] || actionUpper.indexOf(allowedActions[i]) === 0) {
                    isAllowed = true;
                    break;
                }
            }
            
            if (!isAllowed) {
                var result2 = this._createAIDecisionResult(
                    decisionId, aiDecision, 'REJECTED',
                    'AI level "' + aiCapabilities.name + '" cannot perform "' + action + '". ' +
                    'Allowed actions: ' + allowedActions.join(', ') + '. Recommendation ≠ Execution (Rule 2)',
                    null, null
                );
                this._recordAIDecision(result2);
                return result2;
            }
        }
        
        // Step 3: Run through Governance Layer
        var governanceResult = this._runGovernanceChecks(aiDecision, aiCapabilities);
        
        // Step 4: Determine final decision
        var finalDecision;
        var finalAction = null;
        var requiresHumanReview = false;
        
        if (governanceResult.blocked) {
            finalDecision = 'REJECTED';
        } else if (governanceResult.requiresApproval || aiCapabilities.requiresApproval) {
            finalDecision = 'REQUIRES_APPROVAL';
            requiresHumanReview = true;
            this._addToReviewQueue(decisionId, aiDecision, governanceResult);
        } else if (governanceResult.riskLevel === 'HIGH' || governanceResult.riskLevel === 'CRITICAL') {
            finalDecision = 'REQUIRES_APPROVAL';
            requiresHumanReview = true;
            this._addToReviewQueue(decisionId, aiDecision, governanceResult);
        } else {
            finalDecision = 'APPROVED';
            
            if (this.currentAILevel === 2 && action) {
                finalAction = {
                    type: 'SUGGESTION_ONLY',
                    message: 'AI suggests: ' + recommendation + '. Awaiting your confirmation to execute.',
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
        var result3 = this._createAIDecisionResult(
            decisionId, aiDecision, finalDecision,
            governanceResult.reason || 'AI decision processed at level ' + aiCapabilities.name,
            governanceResult, finalAction
        );
        
        result3.requiresHumanReview = requiresHumanReview;
        result3.aiLevel = this.currentAILevel;
        result3.aiLevelName = aiCapabilities.name;
        result3.evaluationTime = (performance.now() - startTime).toFixed(2) + 'ms';
        
        // Step 6: Store reasoning trail (Rule 4)
        this._storeReasoningTrail(decisionId, aiDecision, result3);
        
        // Step 7: Record and emit
        this._recordAIDecision(result3);
        this._emitAIDecisionEvent(result3);
        
        return result3;
    }
    
    suggestOnly(recommendation, reasoning, confidence) {
        if (!confidence) confidence = 0.8;
        return this.processAIDecision({
            reasoning: reasoning,
            recommendation: recommendation,
            confidence: confidence,
            action: 'RECOMMEND',
            target: 'user_decision',
            context: { suggestionOnly: true }
        });
    }
    
    requestExecution(request) {
        if (!request) request = {};
        return this.processAIDecision({
            reasoning: request.reasoning,
            recommendation: request.recommendation,
            confidence: request.confidence,
            action: request.action,
            target: request.target,
            params: request.params || {},
            context: { executionRequest: true }
        });
    }
    
    // ========== HUMAN OVERSIGHT ==========
    
    approveDecision(decisionId, approverInfo) {
        if (!approverInfo) approverInfo = {};
        
        var pendingItem = null;
        for (var i = 0; i < this.reviewQueue.length; i++) {
            if (this.reviewQueue[i].decisionId === decisionId) {
                pendingItem = this.reviewQueue[i];
                break;
            }
        }
        
        if (!pendingItem) {
            return {
                success: false,
                error: 'Decision ' + decisionId + ' not found in review queue',
                timestamp: new Date().toISOString()
            };
        }
        
        this.reviewQueue = this.reviewQueue.filter(function(item) { return item.decisionId !== decisionId; });
        this.systemState.pendingReview = this.reviewQueue.length;
        
        var approval = {
            decisionId: decisionId,
            approvedBy: approverInfo.approvedBy || 'human_operator',
            approvedAt: new Date().toISOString(),
            reason: approverInfo.reason || 'Manual approval',
            notes: approverInfo.notes || '',
            originalDecision: pendingItem
        };
        
        this.approvalHistory.push(approval);
        this.systemState.approvedDecisions++;
        
        var executionResult = null;
        if (pendingItem.aiDecision.action && pendingItem.aiDecision.target) {
            executionResult = this._executeApprovedAction(pendingItem.aiDecision);
        }
        
        this._audit('AI_DECISION_APPROVED', { decisionId: decisionId, approval: approval, executionResult: executionResult });
        this._emitEvent('aiGovernance.decisionApproved', { decisionId: decisionId, approval: approval });
        
        this._addFeedback({
            decisionId: decisionId,
            type: 'APPROVED',
            aiConfidence: pendingItem.aiDecision.confidence,
            humanFeedback: approverInfo.reason
        });
        
        return {
            success: true,
            decisionId: decisionId,
            approval: approval,
            executionResult: executionResult,
            message: 'AI decision ' + decisionId + ' approved and executed'
        };
    }
    
    rejectDecision(decisionId, rejectInfo) {
        if (!rejectInfo) rejectInfo = {};
        
        var pendingItem = null;
        for (var i = 0; i < this.reviewQueue.length; i++) {
            if (this.reviewQueue[i].decisionId === decisionId) {
                pendingItem = this.reviewQueue[i];
                break;
            }
        }
        
        if (!pendingItem) {
            return {
                success: false,
                error: 'Decision ' + decisionId + ' not found in review queue',
                timestamp: new Date().toISOString()
            };
        }
        
        this.reviewQueue = this.reviewQueue.filter(function(item) { return item.decisionId !== decisionId; });
        this.systemState.pendingReview = this.reviewQueue.length;
        this.systemState.rejectedDecisions++;
        
        var rejection = {
            decisionId: decisionId,
            rejectedBy: rejectInfo.rejectedBy || 'human_operator',
            rejectedAt: new Date().toISOString(),
            reason: rejectInfo.reason || 'Manual rejection',
            notes: rejectInfo.notes || ''
        };
        
        this._audit('AI_DECISION_REJECTED', { decisionId: decisionId, rejection: rejection });
        this._emitEvent('aiGovernance.decisionRejected', { decisionId: decisionId, rejection: rejection });
        
        this._addFeedback({
            decisionId: decisionId,
            type: 'REJECTED',
            aiConfidence: pendingItem.aiDecision.confidence,
            humanFeedback: rejectInfo.reason
        });
        
        return {
            success: true,
            decisionId: decisionId,
            rejection: rejection,
            message: 'AI decision ' + decisionId + ' rejected'
        };
    }
    
    getReviewQueue() {
        this._cleanExpiredReviews();
        
        return this.reviewQueue.map(function(item) {
            return {
                decisionId: item.decisionId,
                recommendation: item.aiDecision.recommendation,
                reasoning: item.aiDecision.reasoning,
                confidence: item.aiDecision.confidence,
                proposedAction: item.aiDecision.action,
                proposedTarget: item.aiDecision.target,
                riskLevel: item.governanceResult ? item.governanceResult.riskLevel : 'UNKNOWN',
                submittedAt: item.submittedAt,
                expiresAt: item.expiresAt
            };
        });
    }
    
    getApprovalHistory(limit) {
        if (!limit) limit = 50;
        return this.approvalHistory.slice(-limit);
    }
    
    getFeedbackLoop() {
        return this.feedbackLoop.slice();
    }
    
    // ========== AI LEVEL MANAGEMENT ==========
    
    setAILevel(level, reason) {
        if (!reason) reason = 'Manual adjustment';
        
        if (!this.actionLevels[level]) {
            return { success: false, error: 'Invalid AI level: ' + level + '. Must be 0-4.' };
        }
        
        var oldLevel = this.currentAILevel;
        var oldLevelName = this.actionLevels[oldLevel].name;
        
        this.currentAILevel = level;
        var newLevel = this.actionLevels[level];
        
        this._audit('AI_LEVEL_CHANGED', {
            oldLevel: oldLevel,
            oldLevelName: oldLevelName,
            newLevel: level,
            newLevelName: newLevel.name,
            reason: reason
        });
        
        this._emitEvent('aiGovernance.levelChanged', {
            oldLevel: oldLevel,
            oldLevelName: oldLevelName,
            newLevel: level,
            newLevelName: newLevel.name
        });
        
        console.log('[AIGovernance] AI Level: ' + oldLevelName + ' → ' + newLevel.name + ' — ' + reason);
        
        return {
            success: true,
            previousLevel: { level: oldLevel, name: oldLevelName },
            currentLevel: { level: level, name: newLevel.name },
            capabilities: {
                allowedActions: newLevel.allowsActions,
                requiresApproval: newLevel.requiresApproval,
                maxRiskAllowed: newLevel.maxRiskAllowed
            }
        };
    }
    
    getAILevel() {
        var level = this.actionLevels[this.currentAILevel];
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
    
    getReport() {
        var decisionsByType = {
            APPROVED: this.systemState.approvedDecisions,
            REJECTED: this.systemState.rejectedDecisions,
            REQUIRES_APPROVAL: this.systemState.pendingReview
        };
        
        var recentDecisions = this.aiDecisions.slice(-20);
        var sumConfidence = 0;
        for (var i = 0; i < recentDecisions.length; i++) {
            sumConfidence += (recentDecisions[i].aiDecision && recentDecisions[i].aiDecision.confidence) || 0;
        }
        var avgConfidence = recentDecisions.length > 0 ? sumConfidence / recentDecisions.length : 0;
        
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
                APPROVED: decisionsByType.APPROVED,
                REJECTED: decisionsByType.REJECTED,
                REQUIRES_APPROVAL: decisionsByType.REQUIRES_APPROVAL,
                avgConfidence: (avgConfidence * 100).toFixed(1) + '%'
            },
            reviewQueue: { pending: this.reviewQueue.length, maxSize: this.reviewConfig.maxQueueSize },
            feedback: { total: this.feedbackLoop.length, recent: this.feedbackLoop.slice(-5) },
            rules: [
                'Rule 1: AI has no modification permission by default ✅',
                'Rule 2: Recommendation ≠ Execution ✅',
                'Rule 3: High risk decisions must be reviewed ✅',
                'Rule 4: AI decisions must leave reasoning ✅'
            ],
            recentDecisions: this.aiDecisions.slice(-10).map(function(d) {
                return {
                    decisionId: d.decisionId,
                    recommendation: d.aiDecision ? (d.aiDecision.recommendation || '').substring(0, 80) : '',
                    finalDecision: d.finalDecision,
                    confidence: d.aiDecision ? d.aiDecision.confidence : null,
                    timestamp: d.timestamp
                };
            })
        };
    }
    
    getHealth() {
        var pendingRatio = this.systemState.totalDecisions > 0
            ? this.systemState.pendingReview / this.systemState.totalDecisions
            : 0;
        
        var health = 'HEALTHY';
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
                ? ((this.systemState.approvedDecisions / this.systemState.totalDecisions) * 100).toFixed(1) + '%'
                : 'N/A',
            lastDecision: this.systemState.lastDecision,
            isOperational: true
        };
    }
    
    getDecisionHistory(limit) {
        if (!limit) limit = 50;
        return this.aiDecisions.slice(-limit);
    }
    
    getReasoningTrail(decisionId) {
        return this.reasoningTrails.get(decisionId) || null;
    }
    
    // ========== PRIVATE: GOVERNANCE CHECKS ==========
    
    _runGovernanceChecks(aiDecision, aiCapabilities) {
        var checks = [];
        var blocked = false;
        var requiresApproval = false;
        var riskLevel = 'LOW';
        var reasons = [];
        
        // Check 1: Policy Engine
        try {
            if (window.LawAIApp && window.LawAIApp.Policy && window.LawAIApp.Policy.isAllowed) {
                var policyCheck = window.LawAIApp.Policy.isAllowed(
                    aiDecision.action || 'RECOMMEND',
                    { source: 'AI_ASSISTANT', confidence: aiDecision.confidence, context: aiDecision.context }
                );
                
                checks.push({ layer: 'POLICY', result: policyCheck });
                
                if (!policyCheck.allowed) {
                    if (policyCheck.decision === 'DENY') {
                        blocked = true;
                        reasons.push('Policy Engine denied: ' + policyCheck.reason);
                    } else if (policyCheck.requiresReview) {
                        requiresApproval = true;
                        reasons.push('Policy Engine requires review: ' + policyCheck.reason);
                    }
                }
                
                if (policyCheck.decision === 'DENY') riskLevel = 'CRITICAL';
                else if (policyCheck.requiresReview && riskLevel === 'LOW') riskLevel = 'MEDIUM';
            }
        } catch (e) {
            checks.push({ layer: 'POLICY', error: e.message });
        }
        
        // Check 2: Permission System
        try {
            if (window.LawAIApp && window.LawAIApp.Permissions && window.LawAIApp.Permissions.checkAccess) {
                var permCheck = window.LawAIApp.Permissions.checkAccess(
                    'SUB-AI-001',
                    aiDecision.target || '*',
                    aiDecision.action || 'RECOMMEND',
                    { source: 'AI_ASSISTANT', confidence: aiDecision.confidence }
                );
                
                checks.push({ layer: 'PERMISSION', result: permCheck });
                
                if (!permCheck.granted) {
                    blocked = true;
                    reasons.push('Permission denied: ' + permCheck.reason);
                    riskLevel = 'CRITICAL';
                }
            }
        } catch (e) {
            checks.push({ layer: 'PERMISSION', error: e.message });
        }
        
        // Check 3: Validation System
        try {
            if (window.LawAIApp && window.LawAIApp.Validation && window.LawAIApp.Validation.quickValidate) {
                var validCheck = window.LawAIApp.Validation.quickValidate({
                    action: aiDecision.action || 'RECOMMEND',
                    target: aiDecision.target,
                    source: 'AI_ASSISTANT',
                    params: aiDecision.params || {}
                });
                
                checks.push({ layer: 'VALIDATION', result: validCheck });
                
                if (!validCheck.valid) {
                    if (validCheck.decision === 'REJECT') {
                        blocked = true;
                        reasons.push('Validation rejected: ' + validCheck.reason);
                        riskLevel = 'CRITICAL';
                    } else if (validCheck.decision === 'REVIEW') {
                        requiresApproval = true;
                        reasons.push('Validation requires review: Risk ' + validCheck.risk);
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
            if (window.LawAIApp && window.LawAIApp.Safety && window.LawAIApp.Safety.quickCheck) {
                var safetyCheck = window.LawAIApp.Safety.quickCheck({
                    action: aiDecision.action || 'RECOMMEND',
                    target: aiDecision.target,
                    source: 'SUB-AI-001',
                    context: { aiDecision: true, confidence: aiDecision.confidence, approved: false }
                });
                
                checks.push({ layer: 'SAFETY', result: safetyCheck });
                
                if (safetyCheck.decision === 'BLOCKED') {
                    blocked = true;
                    reasons.push('Safety blocked: ' + safetyCheck.reason);
                    riskLevel = 'CRITICAL';
                } else if (safetyCheck.decision === 'REQUIRES_APPROVAL') {
                    requiresApproval = true;
                    reasons.push('Safety requires approval: ' + safetyCheck.reason);
                    if (safetyCheck.classification && safetyCheck.classification.level >= 4) riskLevel = 'HIGH';
                }
            }
        } catch (e) {
            checks.push({ layer: 'SAFETY', error: e.message });
        }
        
        // Check 5: AI confidence check
        if (aiDecision.confidence !== undefined && aiDecision.confidence < 0.5) {
            requiresApproval = true;
            reasons.push('Low AI confidence: ' + (aiDecision.confidence * 100).toFixed(0) + '%');
            if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
        }
        
        // Check 6: AI capability boundary
        var maxRisk = aiCapabilities.maxRiskAllowed;
        var riskOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        var maxRiskIndex = riskOrder.indexOf(maxRisk);
        var currentRiskIndex = riskOrder.indexOf(riskLevel);
        
        if (currentRiskIndex > maxRiskIndex) {
            requiresApproval = true;
            reasons.push('Risk level "' + riskLevel + '" exceeds AI\'s max allowed risk "' + maxRisk + '"');
        }
        
        return {
            blocked: blocked,
            requiresApproval: requiresApproval,
            riskLevel: riskLevel,
            reason: reasons.join('; ') || 'All governance checks passed',
            checks: checks,
            timestamp: new Date().toISOString()
        };
    }
    
    // ========== PRIVATE: HELPERS ==========
    
    _ensureAISubject() {
        try {
            if (window.LawAIApp && window.LawAIApp.Permissions && window.LawAIApp.Permissions.registerSubject) {
                var existing = window.LawAIApp.Permissions.getSubject('SUB-AI-001');
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
    
    _initReviewQueue() {
        var self = this;
        setInterval(function() { self._cleanExpiredReviews(); }, 60000);
    }
    
    _addToReviewQueue(decisionId, aiDecision, governanceResult) {
        var queueItem = {
            decisionId: decisionId,
            aiDecision: aiDecision,
            governanceResult: governanceResult,
            submittedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.reviewConfig.autoExpireMinutes * 60 * 1000).toISOString()
        };
        
        this.reviewQueue.push(queueItem);
        this.systemState.pendingReview = this.reviewQueue.length;
        
        if (this.reviewQueue.length > this.reviewConfig.maxQueueSize) {
            var removed = this.reviewQueue.shift();
            this._audit('REVIEW_EXPIRED_QUEUE_FULL', { decisionId: removed.decisionId });
        }
        
        this._emitEvent('aiGovernance.reviewQueued', {
            decisionId: decisionId,
            recommendation: (aiDecision.recommendation || '').substring(0, 100),
            expiresAt: queueItem.expiresAt
        });
    }
    
    _cleanExpiredReviews() {
        var now = new Date();
        var expired = this.reviewQueue.filter(function(item) { return new Date(item.expiresAt) < now; });
        
        for (var i = 0; i < expired.length; i++) {
            this._audit('REVIEW_EXPIRED', {
                decisionId: expired[i].decisionId,
                recommendation: expired[i].aiDecision.recommendation
            });
        }
        
        this.reviewQueue = this.reviewQueue.filter(function(item) { return new Date(item.expiresAt) >= now; });
        this.systemState.pendingReview = this.reviewQueue.length;
    }
    
    _executeApprovedAction(aiDecision) {
        try {
            var action = aiDecision.action;
            var target = aiDecision.target;
            var params = aiDecision.params;
            
            console.log('[AIGovernance] Executing approved action: ' + action + ' on ' + target);
            
            this._emitEvent('aiGovernance.actionExecuted', {
                action: action,
                target: target,
                params: params,
                approvedAt: new Date().toISOString()
            });
            
            return { success: true, action: action, target: target, message: 'Action "' + action + '" executed on "' + target + '"' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
    
    _storeReasoningTrail(decisionId, aiDecision, result) {
        var trail = {
            decisionId: decisionId,
            reasoning: aiDecision.reasoning,
            recommendation: aiDecision.recommendation,
            confidence: aiDecision.confidence,
            cognitiveContext: aiDecision.cognitiveResult,
            governanceResult: {
                decision: result.finalDecision,
                reason: result.reason,
                riskLevel: result.governanceResult ? result.governanceResult.riskLevel : null,
                checks: result.governanceResult ? result.governanceResult.checks : null
            },
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        this.reasoningTrails.set(decisionId, trail);
        
        if (this.reasoningTrails.size > 500) {
            var firstKey = this.reasoningTrails.keys().next().value;
            this.reasoningTrails.delete(firstKey);
        }
    }
    
    _createAIDecisionResult(decisionId, aiDecision, finalDecision, reason, governanceResult, finalAction) {
        return {
            decisionId: decisionId,
            aiDecision: {
                reasoning: aiDecision.reasoning,
                recommendation: aiDecision.recommendation,
                confidence: aiDecision.confidence,
                proposedAction: aiDecision.action,
                proposedTarget: aiDecision.target
            },
            finalDecision: finalDecision,
            reason: reason,
            governanceResult: governanceResult,
            finalAction: finalAction,
            timestamp: new Date().toISOString(),
            version: this.version
        };
    }
    
    _recordAIDecision(result) {
        this.aiDecisions.push(result);
        this.systemState.lastDecision = new Date().toISOString();
        
        if (result.finalDecision === 'APPROVED') this.systemState.approvedDecisions++;
        else if (result.finalDecision === 'REJECTED') this.systemState.rejectedDecisions++;
        
        if (this.aiDecisions.length > 500) this.aiDecisions = this.aiDecisions.slice(-250);
        
        this._audit('AI_DECISION_RECORDED', {
            decisionId: result.decisionId,
            finalDecision: result.finalDecision,
            confidence: result.aiDecision ? result.aiDecision.confidence : null
        });
    }
    
    _addFeedback(feedback) {
        this.feedbackLoop.push(Object.assign({}, feedback, { recordedAt: new Date().toISOString() }));
        if (this.feedbackLoop.length > 200) this.feedbackLoop = this.feedbackLoop.slice(-100);
    }
    
    _emitAIDecisionEvent(result) {
        var eventType = result.finalDecision === 'APPROVED'
            ? 'aiGovernance.decisionApproved'
            : result.finalDecision === 'REJECTED'
                ? 'aiGovernance.decisionRejected'
                : 'aiGovernance.decisionRequiresApproval';
        
        this._emitEvent(eventType, {
            decisionId: result.decisionId,
            recommendation: result.aiDecision ? (result.aiDecision.recommendation || '').substring(0, 100) : '',
            finalDecision: result.finalDecision,
            confidence: result.aiDecision ? result.aiDecision.confidence : null
        });
    }
    
    _audit(action, data) {
        if (!data) data = {};
        var auditEntry = { action: action, data: data, timestamp: new Date().toISOString(), version: this.version };
        this._emitEvent('aiGovernance.audit', auditEntry);
    }
    
    _emitEvent(type, data) {
        try {
            var collector = window.LawAIApp && window.LawAIApp.RuntimeEventCollector;
            if (!collector) return;
            var emitFn = collector.emit || collector.emitEvent || collector.log || collector.track;
            if (typeof emitFn === 'function') {
                emitFn.call(collector, {
                    type: type,
                    source: 'AIGovernanceIntegration',
                    data: data,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (e) {}
    }
}

// Export to global namespace
if (typeof window !== 'undefined') {
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.AIGovernanceIntegration = new AIGovernanceIntegration();
    
    window.LawAIApp.AIGovernance = {
        processDecision: function(decision) { return window.LawAIApp.AIGovernanceIntegration.processAIDecision(decision); },
        suggestOnly: function(recommendation, reasoning, confidence) { return window.LawAIApp.AIGovernanceIntegration.suggestOnly(recommendation, reasoning, confidence); },
        requestExecution: function(request) { return window.LawAIApp.AIGovernanceIntegration.requestExecution(request); },
        approve: function(decisionId, approverInfo) { return window.LawAIApp.AIGovernanceIntegration.approveDecision(decisionId, approverInfo); },
        reject: function(decisionId, rejectInfo) { return window.LawAIApp.AIGovernanceIntegration.rejectDecision(decisionId, rejectInfo); },
        getReviewQueue: function() { return window.LawAIApp.AIGovernanceIntegration.getReviewQueue(); },
        getApprovalHistory: function(limit) { return window.LawAIApp.AIGovernanceIntegration.getApprovalHistory(limit); },
        getFeedbackLoop: function() { return window.LawAIApp.AIGovernanceIntegration.getFeedbackLoop(); },
        setAILevel: function(level, reason) { return window.LawAIApp.AIGovernanceIntegration.setAILevel(level, reason); },
        getAILevel: function() { return window.LawAIApp.AIGovernanceIntegration.getAILevel(); },
        getReport: function() { return window.LawAIApp.AIGovernanceIntegration.getReport(); },
        getHealth: function() { return window.LawAIApp.AIGovernanceIntegration.getHealth(); },
        getDecisionHistory: function(limit) { return window.LawAIApp.AIGovernanceIntegration.getDecisionHistory(limit); },
        getReasoningTrail: function(decisionId) { return window.LawAIApp.AIGovernanceIntegration.getReasoningTrail(decisionId); }
    };
}
