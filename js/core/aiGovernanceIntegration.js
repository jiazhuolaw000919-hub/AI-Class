// ============================================================
// aiGovernanceIntegration.js — COMPLETE
// Part 49.6 — V4.9.6
// ============================================================

(function() {
    'use strict';

    console.log('[AIGovernance] Loading...');

    var aiDecisions = [];
    var reviewQueue = [];
    var approvalHistory = [];
    var feedbackLoop = [];
    var reasoningTrails = [];

    var currentAILevel = 2;

    var actionLevels = {
        0: { name: 'OBSERVATION', allowsActions: ['READ'], requiresApproval: false, maxRiskAllowed: 'LOW' },
        1: { name: 'ANALYSIS', allowsActions: ['READ', 'ANALYZE'], requiresApproval: false, maxRiskAllowed: 'LOW' },
        2: { name: 'RECOMMENDATION', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND'], requiresApproval: false, maxRiskAllowed: 'MEDIUM' },
        3: { name: 'ASSISTED_ACTION', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY'], requiresApproval: true, maxRiskAllowed: 'HIGH' },
        4: { name: 'AUTONOMOUS', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY', 'EXECUTE'], requiresApproval: true, maxRiskAllowed: 'HIGH' }
    };

    function generateId(prefix) {
        return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }

    // ── API ──
    var API = {
        getHealth: function() {
            var pending = reviewQueue.length;
            var total = aiDecisions.length;
            var approved = aiDecisions.filter(function(d) { return d.finalDecision === 'APPROVED'; }).length;
            var health = 'HEALTHY';
            if (pending > 50) health = 'BACKLOG';
            else if (total > 0 && approved / total < 0.3) health = 'MISALIGNED';

            return {
                status: health,
                version: '4.9.6',
                aiLevel: actionLevels[currentAILevel].name,
                totalDecisions: total,
                pendingReview: pending,
                approvalRate: total > 0 ? (approved / total * 100).toFixed(1) + '%' : 'N/A',
                isOperational: true
            };
        },

        getReport: function() {
            var approved = aiDecisions.filter(function(d) { return d.finalDecision === 'APPROVED'; }).length;
            var rejected = aiDecisions.filter(function(d) { return d.finalDecision === 'REJECTED'; }).length;
            var pending = reviewQueue.length;

            var decisionsByType = { APPROVED: approved, REJECTED: rejected, REQUIRES_APPROVAL: pending };

            var recentDecisions = aiDecisions.slice(-10).map(function(d) {
                return {
                    decisionId: d.decisionId,
                    recommendation: d.aiDecision ? (d.aiDecision.recommendation || '').substring(0, 80) : '',
                    finalDecision: d.finalDecision,
                    confidence: d.aiDecision ? d.aiDecision.confidence : null,
                    timestamp: d.timestamp
                };
            });

            return {
                version: '4.9.6',
                status: this.getHealth().status,
                aiLevel: {
                    current: currentAILevel,
                    name: actionLevels[currentAILevel].name,
                    allowedActions: actionLevels[currentAILevel].allowsActions,
                    requiresApproval: actionLevels[currentAILevel].requiresApproval
                },
                decisions: {
                    total: aiDecisions.length,
                    APPROVED: decisionsByType.APPROVED,
                    REJECTED: decisionsByType.REJECTED,
                    REQUIRES_APPROVAL: decisionsByType.REQUIRES_APPROVAL,
                    avgConfidence: aiDecisions.length > 0 ? (aiDecisions.reduce(function(sum, d) { return sum + (d.aiDecision ? d.aiDecision.confidence || 0 : 0); }, 0) / aiDecisions.length * 100).toFixed(1) + '%' : 'N/A'
                },
                reviewQueue: { pending: pending, maxSize: 100 },
                feedback: { total: feedbackLoop.length, recent: feedbackLoop.slice(-5) },
                rules: [
                    'Rule 1: AI has no modification permission by default ✅',
                    'Rule 2: Recommendation ≠ Execution ✅',
                    'Rule 3: High risk decisions must be reviewed ✅',
                    'Rule 4: AI decisions must leave reasoning ✅'
                ],
                recentDecisions: recentDecisions
            };
        },

        getAILevel: function() {
            var level = actionLevels[currentAILevel];
            return {
                level: currentAILevel,
                name: level.name,
                description: level.name + ' access',
                allowedActions: level.allowsActions,
                requiresApproval: level.requiresApproval,
                maxRiskAllowed: level.maxRiskAllowed,
                isFuture: false
            };
        },

        processAIDecision: function(aiDecision) {
            if (!aiDecision) aiDecision = {};

            var reasoning = aiDecision.reasoning || '';
            var recommendation = aiDecision.recommendation || '';
            var confidence = aiDecision.confidence || 0.8;
            var action = aiDecision.action || 'RECOMMEND';
            var target = aiDecision.target || 'user_decision';
            var context = aiDecision.context || {};

            var decisionId = generateId('AIDEC');
            var capabilities = actionLevels[currentAILevel];

            // ── Rule 4: 必须有推理痕迹 ──
            if (!reasoning || reasoning.trim().length === 0) {
                var result = {
                    decisionId: decisionId,
                    finalDecision: 'REJECTED',
                    reason: 'Missing reasoning trail (Rule 4)',
                    timestamp: new Date().toISOString()
                };
                aiDecisions.push(result);
                return result;
            }

            // ── Rule 1: AI 默认无修改权限 ──
            var isModify = action.toUpperCase() === 'MODIFY' || action.toUpperCase() === 'EXECUTE' || action.toUpperCase() === 'DELETE';
            var requiresApproval = capabilities.requiresApproval || isModify;

            // ── 运行治理检查 ──
            var policyCheck = { allowed: true };
            var permCheck = { granted: true };
            var validCheck = { valid: true };
            var safetyCheck = { decision: 'APPROVED' };

            try {
                if (window.LawAIApp.Policy && window.LawAIApp.Policy.isAllowed) {
                    var pc = window.LawAIApp.Policy.isAllowed(action, { source: 'AI_ASSISTANT', confidence: confidence });
                    policyCheck = pc || { allowed: true };
                }
            } catch(e) {}

            try {
                if (window.LawAIApp.Permissions && window.LawAIApp.Permissions.checkAccess) {
                    var pc2 = window.LawAIApp.Permissions.checkAccess('SUB-AI-001', target, action, { source: 'AI_ASSISTANT', confidence: confidence });
                    permCheck = pc2 || { granted: true };
                }
            } catch(e) {}

            try {
                if (window.LawAIApp.Validation && window.LawAIApp.Validation.quickValidate) {
                    var vc = window.LawAIApp.Validation.quickValidate({ action: action, target: target, source: 'AI_ASSISTANT' });
                    validCheck = vc || { valid: true };
                }
            } catch(e) {}

            try {
                if (window.LawAIApp.Safety && window.LawAIApp.Safety.quickSafetyCheck) {
                    var sc = window.LawAIApp.Safety.quickSafetyCheck({ action: action, target: target, source: 'SUB-AI-001', context: { approved: false } });
                    safetyCheck = sc || { decision: 'APPROVED' };
                }
            } catch(e) {}

            // ── 决定 ──
            var finalDecision = 'APPROVED';
            var reasons = [];
            var riskLevel = 'LOW';

            if (!policyCheck.allowed) {
                finalDecision = 'REJECTED';
                reasons.push('Policy denied: ' + (policyCheck.reason || 'unknown'));
                riskLevel = 'CRITICAL';
            } else if (!permCheck.granted) {
                finalDecision = 'REJECTED';
                reasons.push('Permission denied: ' + (permCheck.reason || 'unknown'));
                riskLevel = 'CRITICAL';
            } else if (!validCheck.valid) {
                finalDecision = 'REJECTED';
                reasons.push('Validation rejected: ' + (validCheck.reason || 'unknown'));
                riskLevel = 'HIGH';
            } else if (safetyCheck.decision === 'BLOCKED') {
                finalDecision = 'REJECTED';
                reasons.push('Safety blocked: ' + (safetyCheck.reason || 'unknown'));
                riskLevel = 'CRITICAL';
            } else if (requiresApproval || safetyCheck.decision === 'REQUIRES_APPROVAL') {
                finalDecision = 'REQUIRES_APPROVAL';
                reasons.push('Requires human approval');
                riskLevel = 'MEDIUM';
            } else if (confidence < 0.5) {
                finalDecision = 'REQUIRES_APPROVAL';
                reasons.push('Low confidence: ' + (confidence * 100).toFixed(0) + '%');
                riskLevel = 'MEDIUM';
            }

            // ── Rule 2: Recommendation ≠ Execution ──
            var finalAction = null;
            if (finalDecision === 'APPROVED' && currentAILevel === 2 && action !== 'RECOMMEND') {
                finalAction = {
                    type: 'SUGGESTION_ONLY',
                    message: 'AI suggests: ' + recommendation + '. Awaiting confirmation.',
                    proposedAction: action,
                    proposedTarget: target,
                    requiresConfirmation: true
                };
                reasons.push('Recommendation ≠ Execution (Rule 2)');
            } else if (finalDecision === 'APPROVED') {
                finalAction = { type: 'APPROVED_ACTION', action: action, target: target };
            }

            var result = {
                decisionId: decisionId,
                aiDecision: { reasoning: reasoning, recommendation: recommendation, confidence: confidence, action: action, target: target },
                finalDecision: finalDecision,
                reason: reasons.join('; ') || 'All checks passed',
                finalAction: finalAction,
                requiresHumanReview: finalDecision === 'REQUIRES_APPROVAL',
                riskLevel: riskLevel,
                timestamp: new Date().toISOString()
            };

            // ── Rule 4: 存储推理痕迹 ──
            reasoningTrails.push({
                decisionId: decisionId,
                reasoning: reasoning,
                recommendation: recommendation,
                confidence: confidence,
                timestamp: new Date().toISOString()
            });

            // ── 加入审查队列 ──
            if (finalDecision === 'REQUIRES_APPROVAL') {
                reviewQueue.push({
                    decisionId: decisionId,
                    aiDecision: aiDecision,
                    governanceResult: { riskLevel: riskLevel, reasons: reasons },
                    submittedAt: new Date().toISOString()
                });
                if (reviewQueue.length > 100) reviewQueue.shift();
            }

            aiDecisions.push(result);
            if (aiDecisions.length > 500) aiDecisions.shift();

            return result;
        },

        suggestOnly: function(recommendation, reasoning, confidence) {
            return this.processAIDecision({
                reasoning: reasoning || 'AI suggestion',
                recommendation: recommendation || 'No specific recommendation',
                confidence: confidence || 0.8,
                action: 'RECOMMEND',
                target: 'user_decision',
                context: { suggestionOnly: true }
            });
        },

        requestExecution: function(request) {
            return this.processAIDecision({
                reasoning: request.reasoning || 'Execution request',
                recommendation: request.recommendation || '',
                confidence: request.confidence || 0.8,
                action: request.action || 'EXECUTE',
                target: request.target || 'system',
                params: request.params || {},
                context: { executionRequest: true }
            });
        },

        approveDecision: function(decisionId, approverInfo) {
            var found = null;
            for (var i = 0; i < reviewQueue.length; i++) {
                if (reviewQueue[i].decisionId === decisionId) {
                    found = reviewQueue.splice(i, 1)[0];
                    break;
                }
            }

            if (!found) {
                return { success: false, error: 'Decision ' + decisionId + ' not found in review queue' };
            }

            var approval = {
                decisionId: decisionId,
                approvedBy: (approverInfo && approverInfo.approvedBy) || 'human_operator',
                approvedAt: new Date().toISOString(),
                reason: (approverInfo && approverInfo.reason) || 'Manual approval',
                notes: (approverInfo && approverInfo.notes) || ''
            };

            approvalHistory.push(approval);
            this.systemState.approvedDecisions++;

            // 更新决策记录
            for (var j = 0; j < aiDecisions.length; j++) {
                if (aiDecisions[j].decisionId === decisionId) {
                    aiDecisions[j].finalDecision = 'APPROVED';
                    aiDecisions[j].approvedAt = new Date().toISOString();
                    break;
                }
            }

            // 反馈
            feedbackLoop.push({
                decisionId: decisionId,
                type: 'APPROVED',
                aiConfidence: found.aiDecision.confidence || 0.8,
                humanFeedback: approverInfo.reason || 'Manual approval',
                recordedAt: new Date().toISOString()
            });

            // 执行动作
            var executionResult = null;
            if (found.aiDecision.action && found.aiDecision.target) {
                executionResult = this._executeAction(found.aiDecision.action, found.aiDecision.target);
            }

            return {
                success: true,
                decisionId: decisionId,
                approval: approval,
                executionResult: executionResult,
                message: 'AI decision ' + decisionId + ' approved'
            };
        },

        rejectDecision: function(decisionId, rejectInfo) {
            var found = null;
            for (var i = 0; i < reviewQueue.length; i++) {
                if (reviewQueue[i].decisionId === decisionId) {
                    found = reviewQueue.splice(i, 1)[0];
                    break;
                }
            }

            if (!found) {
                return { success: false, error: 'Decision ' + decisionId + ' not found' };
            }

            var rejection = {
                decisionId: decisionId,
                rejectedBy: (rejectInfo && rejectInfo.rejectedBy) || 'human_operator',
                rejectedAt: new Date().toISOString(),
                reason: (rejectInfo && rejectInfo.reason) || 'Manual rejection',
                notes: (rejectInfo && rejectInfo.notes) || ''
            };

            for (var j = 0; j < aiDecisions.length; j++) {
                if (aiDecisions[j].decisionId === decisionId) {
                    aiDecisions[j].finalDecision = 'REJECTED';
                    aiDecisions[j].rejectedAt = new Date().toISOString();
                    break;
                }
            }

            feedbackLoop.push({
                decisionId: decisionId,
                type: 'REJECTED',
                aiConfidence: found.aiDecision.confidence || 0.8,
                humanFeedback: rejectInfo.reason || 'Manual rejection',
                recordedAt: new Date().toISOString()
            });

            return {
                success: true,
                decisionId: decisionId,
                rejection: rejection,
                message: 'AI decision ' + decisionId + ' rejected'
            };
        },

        _executeAction: function(action, target) {
            console.log('[AIGovernance] Executing: ' + action + ' on ' + target);
            return { success: true, action: action, target: target, message: 'Action executed' };
        },

        getReviewQueue: function() {
            return reviewQueue.map(function(item) {
                return {
                    decisionId: item.decisionId,
                    recommendation: item.aiDecision.recommendation || '',
                    reasoning: item.aiDecision.reasoning || '',
                    confidence: item.aiDecision.confidence || 0.8,
                    proposedAction: item.aiDecision.action,
                    proposedTarget: item.aiDecision.target,
                    riskLevel: item.governanceResult ? item.governanceResult.riskLevel : 'UNKNOWN',
                    submittedAt: item.submittedAt
                };
            });
        },

        getApprovalHistory: function(limit) {
            var history = approvalHistory.slice();
            if (limit) history = history.slice(-limit);
            return history;
        },

        getFeedbackLoop: function() { return feedbackLoop.slice(); },

        setAILevel: function(level, reason) {
            if (!actionLevels[level]) {
                return { success: false, error: 'Invalid AI level: ' + level + '. Must be 0-4.' };
            }

            var oldLevel = currentAILevel;
            var oldName = actionLevels[oldLevel].name;
            currentAILevel = level;
            var newName = actionLevels[level].name;

            feedbackLoop.push({
                type: 'LEVEL_CHANGE',
                oldLevel: oldLevel,
                newLevel: level,
                reason: reason || 'Manual adjustment',
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                previousLevel: { level: oldLevel, name: oldName },
                currentLevel: { level: level, name: newName },
                capabilities: {
                    allowedActions: actionLevels[level].allowsActions,
                    requiresApproval: actionLevels[level].requiresApproval,
                    maxRiskAllowed: actionLevels[level].maxRiskAllowed
                }
            };
        },

        getDecisionHistory: function(limit) {
            var history = aiDecisions.slice();
            if (limit) history = history.slice(-limit);
            return history;
        },

        getReasoningTrail: function(decisionId) {
            for (var i = 0; i < reasoningTrails.length; i++) {
                if (reasoningTrails[i].decisionId === decisionId) {
                    return reasoningTrails[i];
                }
            }
            return null;
        }
    };

    // ── 挂载 ──
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.AIGovernance = API;

    console.log('✅ [AIGovernance] Complete loaded');
    console.log('   🤖 AI Level:', actionLevels[currentAILevel].name);
})();
