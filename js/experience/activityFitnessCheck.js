// /js/experience/activityFitnessCheck.js
// Part 173 — Learning Activity Fitness Checks
// 
// PURPOSE:
//   Verify that learning activities (Video, Practice, Reading)
//   respect architectural boundaries and remain good learning experiences.
//
// PRINCIPLES:
//   - Activities do not own external authority
//   - Activities produce evidence, not interpretation
//   - Video completion ≠ mastery
//   - Practice correctness ≠ mastery
//   - Learner agency is preserved
//   - No duplicate event bus or state manager

window.LawAIApp = window.LawAIApp || {};
window.LawAIApp.Experience = window.LawAIApp.Experience || {};

LawAIApp.Experience.ActivityFitnessCheck = {
    version: '1.0.0',

    // ============================================================
    // MAIN ENTRY
    // ============================================================

    /**
     * 运行所有 Activity Fitness Checks
     * @returns {Object} { allPass, failed, results }
     */
    checkAll: function() {
        var results = {
            'FIT-ACT-001': this.doesNotOwnExternalAuthority(),
            'FIT-ACT-002': this.evidenceHasCanonicalOwnership(),
            'FIT-ACT-003': this.videoCompletionNotMastery(),
            'FIT-ACT-004': this.practiceCorrectnessNotMastery(),
            'FIT-ACT-005': this.recommendationIsAdvisory(),
            'FIT-ACT-006': this.calendarIsSchedulingOnly(),
            'FIT-ACT-007': this.notesRemainLearnerOwned(),
            'FIT-ACT-008': this.stateReconstructsAfterRefresh(),
            'FIT-ACT-009': this.unknownStatesRemainUnknown(),
            'FIT-ACT-010': this.learnerCanDeclineLeaveRetry(),
            'FIT-ACT-011': this.noDuplicateActivityAuthority(),
            'FIT-ACT-012': this.noNewGlobalIntelligenceEngine()
        };

        var allPass = true;
        var failed = [];
        var passed = [];

        for (var key in results) {
            if (results.hasOwnProperty(key)) {
                if (!results[key].pass) {
                    allPass = false;
                    failed.push(key);
                } else {
                    passed.push(key);
                }
            }
        }

        return {
            allPass: allPass,
            passed: passed,
            failed: failed,
            total: passed.length + failed.length,
            passedCount: passed.length,
            failedCount: failed.length,
            results: results
        };
    },

    /**
     * 打印简短的检查报告
     */
    printReport: function() {
        var report = this.checkAll();
        console.log('');
        console.log('════════════════════════════════════════════════');
        console.log('📊 ACTIVITY FITNESS CHECK REPORT (Part 173)');
        console.log('════════════════════════════════════════════════');
        
        for (var key in report.results) {
            if (report.results.hasOwnProperty(key)) {
                var r = report.results[key];
                var icon = r.pass ? '✅' : '❌';
                console.log(icon + ' ' + key + ': ' + r.detail);
            }
        }
        
        console.log('────────────────────────────────────────────────');
        console.log('Total:  ' + report.total);
        console.log('Passed: ' + report.passedCount);
        console.log('Failed: ' + report.failedCount);
        console.log('Status: ' + (report.allPass ? '🟢 GREEN' : '🔴 RED'));
        console.log('════════════════════════════════════════════════');
        console.log('');
        
        return report;
    },

    // ============================================================
    // Individual Checks
    // ============================================================

    /**
     * FIT-ACT-001
     * Activities 不应拥有外部权威
     */
    doesNotOwnExternalAuthority: function() {
        var violations = [];

        // 检查 Video Renderer
        var videoRenderer = window.LawAIApp?.VideoRenderer;
        if (videoRenderer) {
            var str = videoRenderer.toString();
            // 直接写其他域的迹象
            if (str.indexOf('ProgressEngine.write') !== -1) {
                violations.push('VideoRenderer writes Progress directly');
            }
            if (str.indexOf('MasteryEngine.write') !== -1) {
                violations.push('VideoRenderer writes Mastery directly');
            }
            if (str.indexOf('RecommendationEngine.write') !== -1) {
                violations.push('VideoRenderer writes Recommendation directly');
            }
        }

        // 检查 Practice Renderer
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (practiceRenderer) {
            var str = practiceRenderer.toString();
            if (str.indexOf('ProgressEngine.write') !== -1) {
                violations.push('PracticeRenderer writes Progress directly');
            }
            if (str.indexOf('MasteryEngine.write') !== -1) {
                violations.push('PracticeRenderer writes Mastery directly');
            }
            if (str.indexOf('RecommendationEngine.write') !== -1) {
                violations.push('PracticeRenderer writes Recommendation directly');
            }
        }

        // 检查 Reading Renderer
        var readingRenderer = window.LawAIApp?.Experience?.Renderers?.ReadingRenderer;
        if (readingRenderer) {
            var str = readingRenderer.toString();
            if (str.indexOf('ProgressEngine.write') !== -1) {
                violations.push('ReadingRenderer writes Progress directly');
            }
            if (str.indexOf('MasteryEngine.write') !== -1) {
                violations.push('ReadingRenderer writes Mastery directly');
            }
        }

        return {
            pass: violations.length === 0,
            detail: violations.length === 0 
                ? 'Activities do not own external authority'
                : violations.join('; ')
        };
    },

    /**
     * FIT-ACT-002
     * Activity Evidence 有规范化所有权
     */
    evidenceHasCanonicalOwnership: function() {
        var videoEvidence = window.LawAIApp?.VideoEvidenceContract;
        var practiceEvidence = window.LawAIApp?.Experience?.PracticeEvidenceContract;

        var hasVideo = !!videoEvidence;
        var hasPractice = !!practiceEvidence;

        var details = [];
        if (hasVideo) details.push('Video evidence contract exists');
        else details.push('Video evidence contract MISSING');

        if (hasPractice) details.push('Practice evidence contract exists');
        else details.push('Practice evidence contract MISSING');

        return {
            pass: hasVideo && hasPractice,
            detail: details.join('; ')
        };
    },

    /**
     * FIT-ACT-003
     * Video Completion ≠ Mastery
     */
    videoCompletionNotMastery: function() {
        var contract = window.LawAIApp?.VideoEvidenceContract;
        if (!contract) {
            return { 
                pass: false, 
                detail: 'No VideoEvidenceContract — cannot verify' 
            };
        }

        // 检查是否有 mastery 相关的字段或方法
        var str = contract.toString();
        var hasMastery = str.toLowerCase().indexOf('mastery') !== -1;

        return {
            pass: !hasMastery,
            detail: hasMastery 
                ? '⚠️ Video contract references mastery — potential violation'
                : 'Video completion does not imply mastery'
        };
    },

    /**
     * FIT-ACT-004
     * Practice Correctness ≠ Mastery
     */
    practiceCorrectnessNotMastery: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { 
                pass: false, 
                detail: 'No PracticeEvidenceContract' 
            };
        }

        // 检查 OUTCOME 是否有 mastery
        var outcomes = contract.OUTCOME || {};
        var hasMastery = false;
        for (var key in outcomes) {
            if (outcomes.hasOwnProperty(key)) {
                if (String(outcomes[key]).toLowerCase().indexOf('master') !== -1) {
                    hasMastery = true;
                    break;
                }
            }
        }

        return {
            pass: !hasMastery,
            detail: hasMastery 
                ? '⚠️ Practice OUTCOME includes mastery'
                : 'Practice correctness does not directly imply mastery'
        };
    },

    /**
     * FIT-ACT-005
     * Recommendation 保持建议性质
     */
    recommendationIsAdvisory: function() {
        var violations = [];

        // 检查 Practice Renderer
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (practiceRenderer) {
            var str = practiceRenderer.toString();
            if (str.indexOf('forceRecommendation') !== -1 ||
                str.indexOf('requireRecommendation') !== -1) {
                violations.push('Practice forces recommendation');
            }
        }

        // 检查 Video Renderer
        var videoRenderer = window.LawAIApp?.VideoRenderer;
        if (videoRenderer) {
            var str = videoRenderer.toString();
            if (str.indexOf('forceRecommendation') !== -1 ||
                str.indexOf('requireRecommendation') !== -1) {
                violations.push('Video forces recommendation');
            }
        }

        return {
            pass: violations.length === 0,
            detail: violations.length === 0 
                ? 'Recommendations remain advisory'
                : violations.join('; ')
        };
    },

    /**
     * FIT-ACT-006
     * Calendar 保持 scheduling-only
     */
    calendarIsSchedulingOnly: function() {
        var violations = [];

        // 检查 Video Renderer
        var videoRenderer = window.LawAIApp?.VideoRenderer;
        if (videoRenderer) {
            var str = videoRenderer.toString();
            if (str.indexOf('calendarStore') !== -1 ||
                str.indexOf('calendarEvents.push') !== -1) {
                violations.push('Video touches calendar directly');
            }
        }

        // 检查 Practice Renderer
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (practiceRenderer) {
            var str = practiceRenderer.toString();
            if (str.indexOf('calendarStore') !== -1 ||
                str.indexOf('calendarEvents.push') !== -1) {
                violations.push('Practice touches calendar directly');
            }
        }

        return {
            pass: violations.length === 0,
            detail: violations.length === 0 
                ? 'Calendar remains scheduling-only'
                : violations.join('; ')
        };
    },

    /**
     * FIT-ACT-007
     * Notes 保持 learner-owned
     */
    notesRemainLearnerOwned: function() {
        var violations = [];

        // 检查 Video Renderer
        var videoRenderer = window.LawAIApp?.VideoRenderer;
        if (videoRenderer) {
            var str = videoRenderer.toString();
            // 直接访问 notes store 但没有通过 NotesAuthority
            if (str.indexOf('notesStore') !== -1 &&
                str.indexOf('NotesAuthority') === -1) {
                violations.push('Video touches notesStore directly');
            }
        }

        // 检查 Practice Renderer
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (practiceRenderer) {
            var str = practiceRenderer.toString();
            if (str.indexOf('notesStore') !== -1 &&
                str.indexOf('NotesAuthority') === -1) {
                violations.push('Practice touches notesStore directly');
            }
        }

        return {
            pass: violations.length === 0,
            detail: violations.length === 0 
                ? 'Notes remain learner-owned'
                : violations.join('; ')
        };
    },

    /**
     * FIT-ACT-008
     * Activity State 刷新后可重建
     */
    stateReconstructsAfterRefresh: function() {
        var registry = window.LawAIApp?.Experience?.ActivityRegistry;
        var runtime = window.LawAIApp?.Experience?.Runtime;

        var hasRegistry = !!registry;
        var hasRuntime = !!runtime;

        return {
            pass: hasRegistry && hasRuntime,
            detail: hasRegistry && hasRuntime 
                ? 'ActivityRegistry + Runtime exist (state reconstructable)'
                : 'Missing ActivityRegistry or Runtime'
        };
    },

    /**
     * FIT-ACT-009
     * Unknown States 保持 unknown
     */
    unknownStatesRemainUnknown: function() {
        var contract = window.LawAIApp?.Experience?.PracticeEvidenceContract;
        if (!contract) {
            return { 
                pass: false, 
                detail: 'No PracticeEvidenceContract' 
            };
        }

        var outcomes = contract.OUTCOME || {};
        var hasUnanswered = outcomes.UNANSWERED === 'UNANSWERED';
        var hasInvalid = outcomes.INVALID === 'INVALID';

        return {
            pass: hasUnanswered && hasInvalid,
            detail: (hasUnanswered && hasInvalid)
                ? 'UNANSWERED and INVALID are preserved'
                : 'UNANSWERED or INVALID missing'
        };
    },

    /**
     * FIT-ACT-010
     * Learner 可以 retry / leave / decline
     */
    learnerCanDeclineLeaveRetry: function() {
        var violations = [];

        // 检查 Practice Renderer 是否有 retry
        var practiceRenderer = window.LawAIApp?.Experience?.Renderers?.PracticeRenderer;
        if (practiceRenderer) {
            var str = practiceRenderer.toString();
            var hasRetry = str.indexOf('retry') !== -1 || 
                          str.indexOf('Try again') !== -1 ||
                          str.indexOf('practice-retry-btn') !== -1;
            
            if (!hasRetry) {
                violations.push('Practice has no retry option');
            }
        }

        // 检查 Video Renderer 是否有 Active Learning 可选
        var videoRenderer = window.LawAIApp?.VideoRenderer;
        if (videoRenderer) {
            var str = videoRenderer.toString();
            var hasOptional = str.indexOf('Optional') !== -1 ||
                             str.indexOf('skip if you prefer') !== -1;
            
            if (!hasOptional) {
                violations.push('Video has no optional learning');
            }
        }

        return {
            pass: violations.length === 0,
            detail: violations.length === 0 
                ? 'Learner can retry, leave, and decline'
                : violations.join('; ')
        };
    },

    /**
     * FIT-ACT-011
     * 没有重复 Activity Authority
     */
    noDuplicateActivityAuthority: function() {
        var duplicates = [];

        if (window.LawAIApp?.VideoEventBus) {
            duplicates.push('VideoEventBus exists');
        }
        if (window.LawAIApp?.PracticeEventBus) {
            duplicates.push('PracticeEventBus exists');
        }
        if (window.LawAIApp?.UniversalActivityEngine) {
            duplicates.push('UniversalActivityEngine exists');
        }
        if (window.LawAIApp?.LearningExperienceEngine) {
            duplicates.push('LearningExperienceEngine exists');
        }

        return {
            pass: duplicates.length === 0,
            detail: duplicates.length === 0 
                ? 'No duplicate activity authority'
                : duplicates.join('; ')
        };
    },

    /**
     * FIT-ACT-012
     * 没有引入新的全局智能引擎
     */
    noNewGlobalIntelligenceEngine: function() {
        var forbidden = [
            'UniversalActivityEngine',
            'LearningExperienceEngine',
            'LearningFlowEngine',
            'GlobalLearningStateV2',
            'ActivityOrchestratorV2',
            'LearningIntelligenceV2',
            'CrossSurfaceAI',
            'UniversalEvidenceEngine'
        ];

        var found = [];
        for (var i = 0; i < forbidden.length; i++) {
            if (window.LawAIApp && window.LawAIApp[forbidden[i]]) {
                found.push(forbidden[i]);
            }
        }

        return {
            pass: found.length === 0,
            detail: found.length === 0 
                ? 'No new global intelligence engine introduced'
                : 'Forbidden engines found: ' + found.join(', ')
        };
    },

    // ============================================================
    // Helper: Quick Access
    // ============================================================

    /**
     * 获取简化状态
     */
    getStatus: function() {
        var report = this.checkAll();
        return {
            allPass: report.allPass,
            passed: report.passedCount,
            failed: report.failedCount,
            total: report.total,
            failedChecks: report.failed
        };
    },

    /**
     * 检查是否被允许
     */
    isHealthy: function() {
        return this.checkAll().allPass;
    }
};

console.log('[ActivityFitnessCheck] Module loaded (Part 173)');
