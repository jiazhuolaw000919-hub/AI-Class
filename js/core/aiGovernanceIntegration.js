// ============================================================
// aiGovernanceIntegration.js — FULL VERSION (Reliable Format)
// Part 49.6 — V4.9.6
// ============================================================

(function() {
    'use strict';

    console.log('[AIGovernance] Loading full version...');

    var aiDecisions = [];
    var reviewQueue = [];
    var approvalHistory = [];
    var feedbackLoop = [];

    var currentAILevel = 2;

    var actionLevels = {
        0: { name: 'OBSERVATION', allowsActions: ['READ'], requiresApproval: false },
        1: { name: 'ANALYSIS', allowsActions: ['READ', 'ANALYZE'], requiresApproval: false },
        2: { name: 'RECOMMENDATION', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND'], requiresApproval: false },
        3: { name: 'ASSISTED_ACTION', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY'], requiresApproval: true },
        4: { name: 'AUTONOMOUS', allowsActions: ['READ', 'ANALYZE', 'RECOMMEND', 'MODIFY', 'EXECUTE'], requiresApproval: true }
    };

    // ── 辅助函数 ──
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
                    APPROVED: approved,
                    REJECTED: rejected,
                    REQUIRES_APPROVAL: pending
                },
                reviewQueue: { pending: pending },
                rules: [
                    'Rule 1: AI has no modification permission by default ✅',
                    'Rule 2: Recommendation ≠ Execution ✅',
                    'Rule 3: High risk decisions must be reviewed ✅',
                    'Rule 4: AI decisions must leave reasoning ✅'
                ]
            };
        },

        getAILevel: function() {
            var level = actionLevels[currentAILevel];
            return {
                level: currentAILevel,
                name: level.name,
                allowedActions: level.allowsActions,
                requiresApproval: level.requiresApproval,
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

            try {
                if (window.LawAIApp.Policy && window.LawAIApp.Policy.isAllowed) {
                    var pc = window.LawAIApp.Policy.isAllowed(action, { source: 'AI_ASSISTANT', confidence: confidence });
                    policyCheck = pc || { allowed: true };
                }
            } catch(e) {}

            try {
                if (window.LawAIApp.Permissions && window.LawAIApp.Permissions.checkAccess) {
                    var pc2 = window.LawAIApp.Permissions.checkAccess('SUB-AI-001', target, action);
                    permCheck = pc2 || { granted: true };
                }
            } catch(e) {}

            try {
                if (window.LawAIApp.Validation && window.LawAIApp.Validation.quickValidate) {
                    var vc = window.LawAIApp.Validation.quickValidate({ action: action, target: target });
                    validCheck = vc || { valid: true };
                }
            } catch(e) {}

            // ── 决定 ──
            var finalDecision = 'APPROVED';
            var reasons = [];

            if (!policyCheck.allowed) {
                finalDecision = 'REJECTED';
                reasons.push('Policy denied');
            } else if (!permCheck.granted) {
                finalDecision = 'REJECTED';
                reasons.push('Permission denied');
            } else if (!validCheck.valid) {
                finalDecision = 'REJECTED';
                reasons.push('Validation rejected');
            } else if (requiresApproval) {
                finalDecision = 'REQUIRES_APPROVAL';
                reasons.push('Requires human approval');
            } else if (confidence < 0.5) {
                finalDecision = 'REQUIRES_APPROVAL';
                reasons.push('Low confidence: ' + (confidence * 100).toFixed(0) + '%');
            }

            // ── Rule 2: Recommendation ≠ Execution ──
            var finalAction = null;
            if (finalDecision === 'APPROVED' && currentAILevel === 2 && action !== 'RECOMMEND') {
                finalAction = {
                    type: 'SUGGESTION_ONLY',
                    message: 'AI suggests: ' + recommendation + '. Awaiting confirmation.',
                    requiresConfirmation: true
                };
            }

            var result = {
                decisionId: decisionId,
                aiDecision: { reasoning: reasoning, recommendation: recommendation, confidence: confidence, action: action, target: target },
                finalDecision: finalDecision,
                reason: reasons.join('; ') || 'All checks passed',
                finalAction: finalAction,
                requiresHumanReview: finalDecision === 'REQUIRES_APPROVAL',
                timestamp: new Date().toISOString()
            };

            // ── 加入审查队列 ──
            if (finalDecision === 'REQUIRES_APPROVAL') {
                reviewQueue.push({
                    decisionId: decisionId,
                    aiDecision: aiDecision,
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
                target: 'user_decision'
            });
        },

        requestExecution: function(request) {
            return this.processAIDecision({
                reasoning: request.reasoning || 'Execution request',
                recommendation: request.recommendation || '',
                confidence: request.confidence || 0.8,
                action: request.action || 'EXECUTE',
                target: request.target || 'system'
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
                reason: (approverInfo && approverInfo.reason) || 'Manual approval'
            };

            approvalHistory.push(approval);

            // 更新决策记录
            for (var j = 0; j < aiDecisions.length; j++) {
                if (aiDecisions[j].decisionId === decisionId) {
                    aiDecisions[j].finalDecision = 'APPROVED';
                    aiDecisions[j].approvedAt = new Date().toISOString();
                    break;
                }
            }

            return { success: true, decisionId: decisionId, approval: approval, message: 'AI decision approved' };
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
                reason: (rejectInfo && rejectInfo.reason) || 'Manual rejection'
            };

            for (var j = 0; j < aiDecisions.length; j++) {
                if (aiDecisions[j].decisionId === decisionId) {
                    aiDecisions[j].finalDecision = 'REJECTED';
                    aiDecisions[j].rejectedAt = new Date().toISOString();
                    break;
                }
            }

            return { success: true, decisionId: decisionId, rejection: rejection, message: 'AI decision rejected' };
        },

        getReviewQueue: function() {
            return reviewQueue.map(function(item) {
                return {
                    decisionId: item.decisionId,
                    recommendation: item.aiDecision.recommendation || '',
                    reasoning: item.aiDecision.reasoning || '',
                    confidence: item.aiDecision.confidence || 0.8,
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
                return { success: false, error: 'Invalid AI level: ' + level };
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
                    requiresApproval: actionLevels[level].requiresApproval
                }
            };
        },

        getDecisionHistory: function(limit) {
            var history = aiDecisions.slice();
            if (limit) history = history.slice(-limit);
            return history;
        },

        getReasoningTrail: function(decisionId) {
            for (var i = 0; i < aiDecisions.length; i++) {
                if (aiDecisions[i].decisionId === decisionId) {
                    return aiDecisions[i].aiDecision || null;
                }
            }
            return null;
        }
    };

    // ── 挂载到全局 ──
    if (!window.LawAIApp) window.LawAIApp = {};
    window.LawAIApp.AIGovernance = API;

    console.log('✅ [AIGovernance] Full version loaded');
    console.log('   🤖 AI Level:', actionLevels[currentAILevel].name);
})();
