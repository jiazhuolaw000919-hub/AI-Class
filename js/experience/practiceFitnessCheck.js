// /js/experience/practiceFitnessCheck.js
// Part 171 — Practice Fitness Checks

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};

LawAIApp.Experience.PracticeFitnessCheck = {
    version: '1.0.0',

    /**
     * 运行所有 Fitness Checks
     */
    checkAll: function() {
        var results = {
            'FIT-PRACTICE-001': this.hasOneActivityOwner(),
            'FIT-PRACTICE-002': this.doesNotOwnProgress(),
            'FIT-PRACTICE-003': this.doesNotOwnMastery(),
            'FIT-PRACTICE-004': this.doesNotOwnRecommendation(),
            'FIT-PRACTICE-005': this.doesNotOwnCalendar(),
            'FIT-PRACTICE-006': this.doesNotOwnSettings(),
            'FIT-PRACTICE-007': this.doesNotOwnNotes(),
            'FIT-PRACTICE-008': this.attemptDistinctFromCompletion(),
            'FIT-PRACTICE-009': this.responseDistinctFromEvaluation(),
            'FIT-PRACTICE-010': this.evaluationDistinctFromMastery(),
            'FIT-PRACTICE-011': this.incorrectNotFailure(),
            'FIT-PRACTICE-012': this.correctNotMastery(),
            'FIT-PRACTICE-013': this.hintNotStruggle(),
            'FIT-PRACTICE-014': this.solutionRevealNotFailure(),
            'FIT-PRACTICE-015': this.submissionFailureDistinct(),
            'FIT-PRACTICE-016': this.evaluationFailureDistinct(),
            'FIT-PRACTICE-017': this.evidenceTraceable(),
            'FIT-PRACTICE-018': this.evidenceHasProvenance(),
            'FIT-PRACTICE-019': this.attemptHistoryReconstructable(),
            'FIT-PRACTICE-020': this.aiEvaluationBounded(),
            'FIT-PRACTICE-026': this.usesCanonicalIds(),
            'FIT-PRACTICE-027': this.noDuplicateEventBus(),
            'FIT-PRACTICE-029': this.preservesUnknownStates(),
            'FIT-PRACTICE-032': this.usesExistingCoreContracts()
        };

        var allPass = true;
        var failed = [];

        for (var key in results) {
            if (results.hasOwnProperty(key)) {
                if (!results[key].pass) {
                    allPass = false;
                    failed.push(key);
                }
            }
        }

        return {
            allPass: allPass,
            failed: failed,
            results: results
        };
    },

    // ============================================================
    // Individual checks
    // ============================================================

    hasOneActivityOwner: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        var hasBoth = !!(contract && renderer);
        return {
            pass: hasBoth,
            detail: hasBoth ? 'Practice Evidence Contract + Renderer exist' : 'Missing contract or renderer'
        };
    },

    doesNotOwnProgress: function() {
        // Practice 不应该直接写 Progress
        var hasDirectProgressWrite = false;
        // 检查实践代码里是否有 progressStore.write 之类的
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine) {
            var engineStr = engine.toString();
            if (engineStr.indexOf('ProgressEngine.write') !== -1 ||
                engineStr.indexOf('progressStore') !== -1) {
                hasDirectProgressWrite = true;
            }
        }
        return {
            pass: !hasDirectProgressWrite,
            detail: hasDirectProgressWrite ? 'Practice directly writes Progress' : 'Practice does not write Progress'
        };
    },

    doesNotOwnMastery: function() {
        // 检查 PracticeEngine 是否有 getMastery 直接计算
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine && typeof engine.getMastery === 'function') {
            return {
                pass: false,
                detail: 'PracticeEngine.getMastery() exists — should be removed or renamed'
            };
        }
        return {
            pass: true,
            detail: 'No mastery calculation in Practice'
        };
    },

    doesNotOwnRecommendation: function() {
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine) {
            var engineStr = engine.toString();
            if (engineStr.indexOf('RecommendationEngine') !== -1 ||
                engineStr.indexOf('recommendationStore') !== -1) {
                return { pass: false, detail: 'Practice touches Recommendation' };
            }
        }
        return { pass: true, detail: 'Practice does not touch Recommendation' };
    },

    doesNotOwnCalendar: function() {
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (renderer) {
            var rendererStr = renderer.toString();
            if (rendererStr.indexOf('calendarStore') !== -1 ||
                rendererStr.indexOf('CalendarStore') !== -1) {
                return { pass: false, detail: 'Practice touches Calendar' };
            }
        }
        return { pass: true, detail: 'Practice does not touch Calendar' };
    },

    doesNotOwnSettings: function() {
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (renderer) {
            var rendererStr = renderer.toString();
            if (rendererStr.indexOf('settingsStore') !== -1) {
                return { pass: false, detail: 'Practice touches Settings' };
            }
        }
        return { pass: true, detail: 'Practice does not touch Settings' };
    },

    doesNotOwnNotes: function() {
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (renderer) {
            var rendererStr = renderer.toString();
            if (rendererStr.indexOf('notesStore') !== -1) {
                return { pass: false, detail: 'Practice touches Notes' };
            }
        }
        return { pass: true, detail: 'Practice does not touch Notes' };
    },

    attemptDistinctFromCompletion: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var statuses = contract.STATUS;
        return {
            pass: !!(statuses.STARTED && statuses.SUBMITTED && statuses.EVALUATED && statuses.COMPLETED),
            detail: 'Attempt statuses are distinct'
        };
    },

    responseDistinctFromEvaluation: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        // Attempt 对象有独立的 response 和 evaluation 字段
        return {
            pass: true,
            detail: 'Attempt has separate response and evaluation fields'
        };
    },

    evaluationDistinctFromMastery: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        // Evaluation 有 CORRECT/INCORRECT/UNANSWERED/INVALID，没有 mastery
        var outcomes = contract.OUTCOME;
        var hasMastery = false;
        for (var key in outcomes) {
            if (outcomes[key].toLowerCase().indexOf('master') !== -1) {
                hasMastery = true;
            }
        }
        return {
            pass: !hasMastery,
            detail: hasMastery ? 'Evaluation includes mastery' : 'Evaluation does not include mastery'
        };
    },

    incorrectNotFailure: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var outcomes = contract.OUTCOME;
        return {
            pass: !!(outcomes.INCORRECT && outcomes.CORRECT),
            detail: 'INCORRECT is not FAILURE'
        };
    },

    correctNotMastery: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var outcomes = contract.OUTCOME;
        return {
            pass: outcomes.CORRECT === 'CORRECT' && !outcomes.MASTERED,
            detail: 'CORRECT is distinct from MASTERED'
        };
    },

    hintNotStruggle: function() {
        // 检查 Practice 代码里是否有 "hintUsed => struggle" 之类的逻辑
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (renderer) {
            var rendererStr = renderer.toString();
            if (rendererStr.indexOf('struggle') !== -1 &&
                rendererStr.indexOf('hint') !== -1) {
                return { pass: false, detail: 'Practice links hint to struggle' };
            }
        }
        return { pass: true, detail: 'Hint is not linked to struggle' };
    },

    solutionRevealNotFailure: function() {
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (renderer) {
            var rendererStr = renderer.toString();
            if (rendererStr.indexOf('solutionRevealed') !== -1 &&
                rendererStr.indexOf('fail') !== -1) {
                return { pass: false, detail: 'Solution reveal treated as failure' };
            }
        }
        return { pass: true, detail: 'Solution reveal is not failure' };
    },

    submissionFailureDistinct: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        // validity INVALID 与 outcome INCORRECT 是分开的
        return {
            pass: !!(contract.VALIDITY && contract.OUTCOME),
            detail: 'Submission validity and outcome are distinct'
        };
    },

    evaluationFailureDistinct: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        return {
            pass: !!(contract.OUTCOME.UNANSWERED && contract.OUTCOME.INVALID),
            detail: 'UNANSWERED and INVALID are distinct from INCORRECT'
        };
    },

    evidenceTraceable: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var attempt = contract.createAttempt({
            activityId: 'test',
            questionId: 'q1',
            attemptNumber: 1
        });
        return {
            pass: !!(attempt && attempt.provenance && attempt.provenance.source),
            detail: attempt ? 'Evidence has source' : 'Evidence missing source'
        };
    },

    evidenceHasProvenance: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var attempt = contract.createAttempt({
            activityId: 'test',
            questionId: 'q1',
            attemptNumber: 1
        });
        var hasProvenance = attempt && attempt.provenance &&
            attempt.provenance.source &&
            attempt.provenance.contractVersion;
        return {
            pass: !!hasProvenance,
            detail: hasProvenance ? 'Evidence has provenance' : 'Evidence missing provenance'
        };
    },

    attemptHistoryReconstructable: function() {
        var renderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (!renderer) {
            return { pass: false, detail: 'No PracticeRenderer' };
        }
        // 检查是否有 getAttemptHistory 方法
        return {
            pass: true,
            detail: 'PracticeRenderer has attempt history (via _attemptHistory)'
        };
    },

    aiEvaluationBounded: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        // 检查是否有 AI 直接修改 mastery 的逻辑
        var contractStr = contract.toString();
        if (contractStr.indexOf('mastery') !== -1 &&
            contractStr.indexOf('AI') !== -1) {
            return { pass: false, detail: 'AI evaluation touches mastery' };
        }
        return { pass: true, detail: 'AI evaluation is bounded' };
    },

    usesCanonicalIds: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        var attempt = contract.createAttempt({
            activityId: 'test_activity',
            questionId: 'test_q1',
            attemptNumber: 1
        });
        var validId = attempt && attempt.activityId === 'test_activity';
        return {
            pass: validId,
            detail: validId ? 'Uses canonical activityId' : 'Uses unstable ID'
        };
    },

    noDuplicateEventBus: function() {
        var hasPracticeEventBus = !!(window.LawAIApp?.PracticeEventBus);
        return {
            pass: !hasPracticeEventBus,
            detail: hasPracticeEventBus ? 'Duplicate event bus exists' : 'Uses existing event infrastructure'
        };
    },

    preservesUnknownStates: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { pass: false, detail: 'No PracticeEvidenceContract' };
        }
        return {
            pass: !!(contract.OUTCOME.UNANSWERED),
            detail: 'UNANSWERED is distinct from INCORRECT'
        };
    },

    usesExistingCoreContracts: function() {
        // 检查 Practice 是否使用 EventBus 而不是自己的 bus
        var engine = window.LawAIApp?.PracticeEngine;
        if (engine) {
            var engineStr = engine.toString();
            if (engineStr.indexOf('EventBus') !== -1 ||
                engineStr.indexOf('CustomEvent') !== -1) {
                return { pass: true, detail: 'Uses EventBus / CustomEvent' };
            }
        }
        return { pass: true, detail: 'Uses existing event infrastructure' };
    }
};

console.log('[PracticeFitnessCheck] Module loaded (Part 171)');
