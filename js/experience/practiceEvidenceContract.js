// js/experience/practiceEvidenceContract.js
// Part 130: Practice Evidence Contract
// 
// PURPOSE:
//   Defines the canonical structure for Practice attempts, results,
//   and evidence. This contract ensures that Practice output is
//   structured, stable, traceable, and consumable by Core Intelligence.
//
// OWNERSHIP:
//   Practice owns execution, evaluation, feedback, attempt history,
//   and Activity Result.
//
//   Core Intelligence owns interpretation, mastery, progress,
//   recommendation, and retention.
//
// KEY DISTINCTIONS:
//   - Correct Answer ≠ Mastery
//   - Incorrect Answer ≠ Lack of Mastery
//   - One Attempt ≠ Learning State
//   - UNANSWERED ≠ INCORRECT
//   - INVALID ≠ INCORRECT

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};

LawAIApp.Experience.PracticeEvidenceContract = {
    // ============================================================
    // VERSION
    // ============================================================
    VERSION: '1.0.0',

    // ============================================================
    // STATUS ENUMS
    // ============================================================
    STATUS: {
        STARTED: 'started',
        SUBMITTED: 'submitted',
        EVALUATED: 'evaluated',
        COMPLETED: 'completed',
        EXITED: 'exited'
    },

    VALIDITY: {
        VALID: 'VALID',
        INVALID: 'INVALID'
    },

    OUTCOME: {
        CORRECT: 'CORRECT',
        INCORRECT: 'INCORRECT',
        UNANSWERED: 'UNANSWERED',
        INVALID: 'INVALID'
    },

    // ============================================================
    // CONTRACT: Attempt
    // ============================================================

    /**
     * 创建一个 Attempt 对象
     * @param {Object} params - 参数
     * @param {string} params.activityId - Activity ID
     * @param {string} params.questionId - Question ID
     * @param {number} params.attemptNumber - Attempt 序号 (从1开始)
     * @param {string} params.lessonId - Lesson ID (可选)
     * @returns {Object} Attempt 对象
     */
    createAttempt: function(params) {
        var now = new Date().toISOString();
        var attemptId = 'att_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);

        return {
            // Identity
            attemptId: attemptId,
            activityId: params.activityId || null,
            questionId: params.questionId || null,
            attemptNumber: params.attemptNumber || 1,

            // Timestamps
            startedAt: now,
            submittedAt: null,
            completedAt: null,

            // Response (what the learner did)
            response: null,

            // Evaluation (what the system determined)
            evaluation: null,  // { status: 'CORRECT'|'INCORRECT'|'UNANSWERED'|'INVALID', isCorrect: boolean|null }

            // Feedback (immediate response)
            feedback: null,

            // Lifecycle
            status: this.STATUS.STARTED,

            // Validity (whether this attempt is valid evidence)
            validity: null,  // 'VALID' | 'INVALID'

            // Structured evidence (observable facts, not inferences)
            evidence: null,  // { type: 'PRACTICE_PERFORMANCE', outcome: 'CORRECT'|'INCORRECT', ... }

            // Provenance (where this evidence came from)
            provenance: {
                source: 'practice-activity',
                activityId: params.activityId || null,
                lessonId: params.lessonId || null,
                attemptId: attemptId,
                contractVersion: this.VERSION
            }
        };
    },

    /**
     * 更新 Attempt 状态
     * @param {Object} attempt - Attempt 对象
     * @param {Object} updates - 更新字段
     * @returns {Object} 更新后的 Attempt
     */
    updateAttempt: function(attempt, updates) {
        if (!attempt) return null;

        // 不可变字段: attemptId, attemptNumber, activityId, questionId
        var immutable = ['attemptId', 'attemptNumber', 'activityId', 'questionId'];
        for (var i = 0; i < immutable.length; i++) {
            if (updates[immutable[i]] !== undefined) {
                delete updates[immutable[i]];
            }
        }

        // 合并更新
        for (var key in updates) {
            if (updates.hasOwnProperty(key)) {
                attempt[key] = updates[key];
            }
        }

        return attempt;
    },

    /**
     * 标记 Attempt 为已提交
     * @param {Object} attempt - Attempt 对象
     * @param {*} response - 用户响应
     * @returns {Object} 更新后的 Attempt
     */
    markSubmitted: function(attempt, response) {
        if (!attempt) return null;
        attempt.submittedAt = new Date().toISOString();
        attempt.response = response;
        attempt.status = this.STATUS.SUBMITTED;
        return attempt;
    },

    /**
     * 标记 Attempt 为已评价
     * @param {Object} attempt - Attempt 对象
     * @param {Object} evaluation - 评价结果
     * @param {string} feedback - 反馈
     * @param {string} validity - 'VALID' | 'INVALID'
     * @returns {Object} 更新后的 Attempt
     */
    markEvaluated: function(attempt, evaluation, feedback, validity) {
        if (!attempt) return null;
        attempt.completedAt = new Date().toISOString();
        attempt.evaluation = evaluation || { status: 'UNANSWERED', isCorrect: null };
        attempt.feedback = feedback || null;
        attempt.validity = validity || this.VALIDITY.VALID;
        attempt.status = this.STATUS.EVALUATED;

        // 生成 evidence
        attempt.evidence = this.createEvidence(attempt, evaluation);

        return attempt;
    },

    /**
     * 标记 Attempt 为已完成 (Activity 层面)
     * @param {Object} attempt - Attempt 对象
     * @returns {Object} 更新后的 Attempt
     */
    markCompleted: function(attempt) {
        if (!attempt) return null;
        attempt.status = this.STATUS.COMPLETED;
        return attempt;
    },

    /**
     * 创建 Evidence 对象
     * @param {Object} attempt - Attempt 对象
     * @param {Object} evaluation - 评价结果
     * @returns {Object} Evidence 对象
     */
    createEvidence: function(attempt, evaluation) {
        if (!attempt) return null;
        var outcome = evaluation ? evaluation.status : 'UNKNOWN';

        return {
            type: 'PRACTICE_PERFORMANCE',
            outcome: outcome,
            isCorrect: evaluation ? evaluation.isCorrect : null,
            attemptNumber: attempt.attemptNumber,
            activityId: attempt.activityId,
            questionId: attempt.questionId,
            attemptId: attempt.attemptId,
            source: 'practice-activity',
            timestamp: attempt.completedAt || new Date().toISOString()
        };
    },

    /**
     * 创建 Activity Result 对象
     * @param {Object} params - 参数
     * @param {string} params.activityId - Activity ID
     * @param {string} params.activityType - Activity 类型 (应为 'PRACTICE')
     * @param {Array} params.attempts - Attempt 列表
     * @param {string} params.finalAttemptId - 最终 Attempt ID
     * @param {string} params.outcome - 最终结果
     * @param {Array} params.evidence - 证据列表
     * @returns {Object} Activity Result 对象
     */
    createActivityResult: function(params) {
        var attempts = params.attempts || [];
        var finalAttempt = null;
        if (params.finalAttemptId) {
            for (var i = 0; i < attempts.length; i++) {
                if (attempts[i].attemptId === params.finalAttemptId) {
                    finalAttempt = attempts[i];
                    break;
                }
            }
        }

        return {
            activityId: params.activityId || null,
            activityType: params.activityType || 'PRACTICE',
            status: params.status || 'COMPLETED',
            attempts: attempts,
            finalAttemptId: params.finalAttemptId || null,
            finalAttempt: finalAttempt,
            outcome: params.outcome || 'UNKNOWN',
            evidence: params.evidence || [],
            completedAt: new Date().toISOString(),
            contractVersion: this.VERSION,
            // 元数据
            metadata: {
                totalAttempts: attempts.length,
                outcome: params.outcome || 'UNKNOWN',
                hasValidEvidence: params.evidence ? params.evidence.length > 0 : false
            }
        };
    },

    /**
     * 验证 Attempt 是否有效
     * @param {Object} attempt - Attempt 对象
     * @returns {Object} 验证结果 { valid: boolean, errors: Array }
     */
    validateAttempt: function(attempt) {
        var errors = [];
        if (!attempt) {
            errors.push('Attempt is null or undefined');
            return { valid: false, errors: errors };
        }

        // 必需字段
        var required = ['attemptId', 'activityId', 'questionId', 'attemptNumber', 'startedAt', 'status'];
        for (var i = 0; i < required.length; i++) {
            if (!attempt[required[i]]) {
                errors.push('Missing required field: ' + required[i]);
            }
        }

        // 状态必须有效
        var validStatuses = ['started', 'submitted', 'evaluated', 'completed', 'exited'];
        if (attempt.status && validStatuses.indexOf(attempt.status) === -1) {
            errors.push('Invalid status: ' + attempt.status);
        }

        // 如果已评价，必须有 evaluation
        if (attempt.status === 'evaluated' || attempt.status === 'completed') {
            if (!attempt.evaluation) {
                errors.push('Evaluated attempt missing evaluation');
            }
            if (!attempt.evidence) {
                errors.push('Evaluated attempt missing evidence');
            }
        }

        // 如果已提交，必须有 submittedAt
        if (attempt.status === 'submitted' || attempt.status === 'evaluated' || attempt.status === 'completed') {
            if (!attempt.submittedAt) {
                errors.push('Submitted attempt missing submittedAt');
            }
        }

        return { valid: errors.length === 0, errors: errors };
    },

    /**
     * 判断 Attempt 是否有效证据
     * @param {Object} attempt - Attempt 对象
     * @returns {boolean} 是否有效证据
     */
    isValidEvidence: function(attempt) {
        if (!attempt) return false;
        if (attempt.validity !== this.VALIDITY.VALID) return false;
        if (attempt.status !== 'evaluated' && attempt.status !== 'completed') return false;
        if (!attempt.evaluation) return false;
        if (!attempt.evidence) return false;
        return true;
    },

    /**
     * 获取 Attempt 的简短摘要 (用于调试)
     * @param {Object} attempt - Attempt 对象
     * @returns {Object} 摘要
     */
    getAttemptSummary: function(attempt) {
        if (!attempt) return null;
        return {
            attemptId: attempt.attemptId,
            attemptNumber: attempt.attemptNumber,
            status: attempt.status,
            validity: attempt.validity,
            outcome: attempt.evaluation ? attempt.evaluation.status : null,
            isCorrect: attempt.evaluation ? attempt.evaluation.isCorrect : null,
            submittedAt: attempt.submittedAt
        };
    },

    /**
     * 获取 Attempt 历史的摘要
     * @param {Array} attempts - Attempt 列表
     * @returns {Object} 摘要
     */
    getHistorySummary: function(attempts) {
        if (!attempts || attempts.length === 0) {
            return { total: 0, attempts: [], lastOutcome: null };
        }

        var summaries = [];
        var lastOutcome = null;
        var hasCorrect = false;
        var hasIncorrect = false;

        for (var i = 0; i < attempts.length; i++) {
            var s = this.getAttemptSummary(attempts[i]);
            if (s) {
                summaries.push(s);
                if (s.outcome === 'CORRECT') hasCorrect = true;
                if (s.outcome === 'INCORRECT') hasIncorrect = true;
                lastOutcome = s.outcome;
            }
        }

        return {
            total: attempts.length,
            attempts: summaries,
            lastOutcome: lastOutcome,
            hasCorrect: hasCorrect,
            hasIncorrect: hasIncorrect,
            firstAttemptOutcome: summaries.length > 0 ? summaries[0].outcome : null,
            finalAttemptOutcome: summaries.length > 0 ? summaries[summaries.length - 1].outcome : null
        };
    }
};

console.log('📋 PracticeEvidenceContract loaded (Part 130)');
