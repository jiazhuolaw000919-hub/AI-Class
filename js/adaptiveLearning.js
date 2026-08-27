// ===========================================
// adaptiveLearning.js
// 自适应学习编排器 - 最佳下一步行动（Phase 34 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AdaptiveLearning = (function() {
    var _initialized = false;
    var _dailyPlan = null;

    // ===========================================
    // 每日计划
    // ===========================================
    function generateDailyPlan() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var nextDay = Math.min(completed.length + 1, total);
        
        var recommendations = LawAIApp.RecommendationEngine?.getActiveRecommendations?.() || [];
        
        _dailyPlan = {
            date: new Date().toISOString().split('T')[0],
            recommendedLesson: 'day-' + nextDay,
            recommendedActivities: [],
            recommendations: recommendations.slice(0, 2),
            priority: 'learning',
            estimatedMinutes: 30,
            completed: false
        };
        
        // 添加复习建议
        var memoryReviews = LawAIApp.MemoryEngine?.getTodayReviews?.() || [];
        if (memoryReviews.length > 0) {
            _dailyPlan.recommendedActivities.push({
                type: 'review',
                lessonId: memoryReviews[0],
                description: 'Review ' + memoryReviews[0]
            });
        }
        
        // 添加练习建议
        var practiceHistory = LawAIApp.PracticeEngine?.getHistory?.() || [];
        if (practiceHistory.length > 0) {
            var lastLesson = practiceHistory[practiceHistory.length - 1]?.lessonId;
            if (lastLesson) {
                _dailyPlan.recommendedActivities.push({
                    type: 'practice',
                    lessonId: lastLesson,
                    description: 'Practice ' + lastLesson
                });
            }
        }
        
        try {
            LawAIApp.StorageEngine?.set?.('daily_plan', _dailyPlan);
        } catch (e) {}
        
        LawAIApp.EventBus?.emit?.('DailyPlanGenerated', { plan: _dailyPlan });
        return _dailyPlan;
    }

    function getTodaysPlan() {
        if (!_dailyPlan) {
            try {
                var stored = LawAIApp.StorageEngine?.get?.('daily_plan');
                var today = new Date().toISOString().split('T')[0];
                if (stored && stored.date === today) {
                    _dailyPlan = stored;
                    return _dailyPlan;
                }
            } catch (e) {}
            return generateDailyPlan();
        }
        return _dailyPlan;
    }

    // ===========================================
    // 推荐 (委托给 RecommendationEngine)
    // ===========================================
    function generateRecommendations(limit) {
        limit = limit || 5;
    
        // 🔥 优先使用 RecommendationEngine
        var engine = LawAIApp.RecommendationEngine;
        if (engine && typeof engine.getActiveRecommendations === 'function') {
            var recs = engine.getActiveRecommendations();
            if (recs && recs.length > 0) {
                return recs.slice(0, limit).map(function(r) {
                    return {
                        id: r.id || 'rec_' + (r.targetId || 'unknown'),
                        type: r.targetType || 'knowledge',
                        title: r.reason || 'Recommended',
                        description: r.reason || 'Based on your learning progress.',
                        priority: r.priorityScore >= 70 ? 'high' : 
                                  r.priorityScore >= 40 ? 'medium' : 'low'
                    };
                });
            }
        }
    
        // Fallback: 原有逻辑 (仅当 RecommendationEngine 不可用时)
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var nextDay = Math.min(completed.length + 1, total);
        var recommendations = [];
    
        recommendations.push({
            id: 'rec_next_lesson',
            type: 'lesson',
            title: 'Day ' + nextDay,
            description: 'Continue your learning journey',
            priority: 'high'
        });
    
        return recommendations.slice(0, limit);
    }
    
    // ===========================================
    // 缺口检测
    // ===========================================
    function getGapReport(lessonId) {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var lesson = null;
        
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                }
            }
        } catch (e) {}
        
        if (!lesson) return { gaps: ['Lesson not found'] };
        
        var gaps = [];
        var prerequisites = lesson.prerequisites || [];
        prerequisites.forEach(function(req) {
            if (!completed.includes(req)) {
                gaps.push({
                    lessonId: req,
                    reason: 'Prerequisite not completed'
                });
            }
        });
        
        return {
            lessonId: lessonId,
            gaps: gaps,
            ready: gaps.length === 0
        };
    }

    // ===========================================
    // 学习平衡
    // ===========================================
    function calculateBalance() {
        var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
        var completed = progress.completedLessons || [];
        var skills = LawAIApp.SkillEngine?.getAll?.() || [];
        var practices = LawAIApp.PracticeEngine?.getHistory?.() || [];
        var projects = LawAIApp.ProjectEngine?.getCompletedProjects?.() || [];
        
        var categories = ['learning', 'practice', 'review', 'project'];
        var scores = {
            learning: Math.min(100, completed.length * 2),
            practice: Math.min(100, practices.length * 5),
            review: 50,
            project: Math.min(100, projects.length * 20)
        };
        
        // 检查平衡性
        var avg = (scores.learning + scores.practice + scores.review + scores.project) / 4;
        var balance = {
            scores: scores,
            average: Math.round(avg),
            imbalance: Object.keys(scores).filter(function(k) {
                return Math.abs(scores[k] - avg) > 30;
            })
        };
        
        return balance;
    }

    function suggestActivity() {
        var balance = calculateBalance();
        var lowest = Object.keys(balance.scores).reduce(function(a, b) {
            return balance.scores[a] < balance.scores[b] ? a : b;
        });
        
        var suggestions = {
            learning: { type: 'lesson', message: 'Complete your next lesson to balance your learning' },
            practice: { type: 'practice', message: 'Practice a recent lesson to improve retention' },
            review: { type: 'review', message: 'Review a previous lesson to reinforce knowledge' },
            project: { type: 'project', message: 'Start a project to apply your skills' }
        };
        
        return suggestions[lowest] || suggestions.learning;
    }

    // ============================================================
    // 🔥 Part 43: Adaptive Learning Foundation (新增)
    // ============================================================

    /**
     * 构建自适应上下文
     */
    function buildAdaptiveContext(options) {
        options = options || {};
        
        var context = {
            learnerId: _getLearnerId(),
            generatedAt: Date.now(),
            contextVersion: '1.0.0',
            quality: 'UNKNOWN',
            components: {}
        };
        
        // 1. Learner Model
        try {
            var lm = LawAIApp.LearnerModel;
            if (lm) {
                context.components.learnerModel = {
                    available: true,
                    data: lm.getLearnerModel ? lm.getLearnerModel() : null
                };
            } else {
                context.components.learnerModel = { available: false };
            }
        } catch (e) {
            context.components.learnerModel = { available: false, error: e.message };
        }
        
        // 2. Knowledge Graph
        try {
            var kg = LawAIApp.KnowledgeGraph;
            if (kg) {
                context.components.knowledgeGraph = {
                    available: true,
                    nodeCount: kg.getAllNodes ? kg.getAllNodes().length : 0
                };
            } else {
                context.components.knowledgeGraph = { available: false };
            }
        } catch (e) {
            context.components.knowledgeGraph = { available: false, error: e.message };
        }
        
        // 3. Prerequisite Engine
        try {
            var pe = LawAIApp.PrerequisiteEngine;
            if (pe) {
                context.components.prerequisiteEngine = {
                    available: true,
                    status: pe.getStatus ? pe.getStatus() : null
                };
            } else {
                context.components.prerequisiteEngine = { available: false };
            }
        } catch (e) {
            context.components.prerequisiteEngine = { available: false, error: e.message };
        }
        
        // 4. Knowledge Gap Engine
        try {
            var ge = LawAIApp.KnowledgeGapEngine;
            if (ge) {
                context.components.knowledgeGapEngine = {
                    available: true,
                    status: ge.getStatus ? ge.getStatus() : null
                };
            } else {
                context.components.knowledgeGapEngine = { available: false };
            }
        } catch (e) {
            context.components.knowledgeGapEngine = { available: false, error: e.message };
        }
        
        // 5. Mastery
        try {
            var mastery = LawAIApp.MasteryEngine;
            if (mastery) {
                context.components.mastery = {
                    available: true,
                    status: mastery.getStatus ? mastery.getStatus() : null
                };
            } else {
                context.components.mastery = { available: false };
            }
        } catch (e) {
            context.components.mastery = { available: false, error: e.message };
        }
        
        // 6. Memory
        try {
            var memory = LawAIApp.MemoryEngine;
            if (memory) {
                context.components.memory = {
                    available: true,
                    status: memory.getStatus ? memory.getStatus() : null
                };
            } else {
                context.components.memory = { available: false };
            }
        } catch (e) {
            context.components.memory = { available: false, error: e.message };
        }
        
        // 7. Review
        try {
            var review = LawAIApp.MemoryReview;
            if (review) {
                context.components.review = {
                    available: true,
                    status: review.getStatus ? review.getStatus() : null
                };
            } else {
                context.components.review = { available: false };
            }
        } catch (e) {
            context.components.review = { available: false, error: e.message };
        }
        
        // 8. Goals
        try {
            var goals = LawAIApp.GoalEngine;
            if (goals) {
                var activeGoals = goals.getActiveGoals ? goals.getActiveGoals() : [];
                context.components.goals = {
                    available: true,
                    activeCount: activeGoals.length,
                    goals: activeGoals
                };
            } else {
                context.components.goals = { available: false };
            }
        } catch (e) {
            context.components.goals = { available: false, error: e.message };
        }
        
        // 9. Progress
        try {
            var progress = LawAIApp.ProgressEngine;
            if (progress) {
                context.components.progress = {
                    available: true,
                    data: progress.getProgress ? progress.getProgress() : null
                };
            } else {
                context.components.progress = { available: false };
            }
        } catch (e) {
            context.components.progress = { available: false, error: e.message };
        }
        
        // 计算上下文质量
        var availableCount = 0;
        var totalCount = 0;
        for (var key in context.components) {
            totalCount++;
            if (context.components[key].available) {
                availableCount++;
            }
        }
        
        var ratio = totalCount > 0 ? availableCount / totalCount : 0;
        if (ratio >= 0.8) context.quality = 'FULL';
        else if (ratio >= 0.5) context.quality = 'PARTIAL';
        else if (ratio >= 0.3) context.quality = 'LIMITED';
        else context.quality = 'UNKNOWN';
        
        return context;
    }

    /**
     * 获取自适应候选
     */
    function getAdaptiveCandidates(context, options) {
        context = context || buildAdaptiveContext();
        options = options || {};
        var limit = options.limit || 20;
        
        var result = {
            candidates: [],
            eligible: [],
            blocked: [],
            mastered: [],
            unknown: [],
            unavailable: [],
            deferred: [],
            summary: {
                total: 0,
                eligible: 0,
                blocked: 0,
                mastered: 0,
                unknown: 0,
                unavailable: 0,
                deferred: 0
            }
        };
        
        var kg = LawAIApp.KnowledgeGraph;
        if (!kg) return result;
        
        var allNodes = kg.getAllNodes ? kg.getAllNodes() : [];
        var pe = LawAIApp.PrerequisiteEngine;
        var ge = LawAIApp.KnowledgeGapEngine;
        var lm = LawAIApp.LearnerModel;
        
        var activeNodes = allNodes.filter(function(n) {
            return n && n.status !== 'deprecated';
        });
        
        var targetNodes = activeNodes.slice(0, limit * 2);
        
        for (var i = 0; i < targetNodes.length; i++) {
            var node = targetNodes[i];
            if (!node) continue;
            
            var candidate = _evaluateCandidate(node, context, pe, ge, lm, options);
            result.candidates.push(candidate);
            
            switch (candidate.state) {
                case 'ELIGIBLE': result.eligible.push(candidate); break;
                case 'BLOCKED': result.blocked.push(candidate); break;
                case 'MASTERED': result.mastered.push(candidate); break;
                case 'UNKNOWN': result.unknown.push(candidate); break;
                case 'UNAVAILABLE': result.unavailable.push(candidate); break;
                case 'DEFERRED': result.deferred.push(candidate); break;
            }
        }
        
        result.summary.total = result.candidates.length;
        result.summary.eligible = result.eligible.length;
        result.summary.blocked = result.blocked.length;
        result.summary.mastered = result.mastered.length;
        result.summary.unknown = result.unknown.length;
        result.summary.unavailable = result.unavailable.length;
        result.summary.deferred = result.deferred.length;
        
        return result;
    }

    /**
     * 评估单个候选 (私有)
     */
    function _evaluateCandidate(node, context, pe, ge, lm, options) {
        var candidate = {
            targetId: node.id,
            targetTitle: node.title || node.id,
            state: 'UNKNOWN',
            reasons: [],
            signals: {
                readiness: null,
                mastery: null,
                masteryGap: null,
                review: null,
                memory: null,
                goalRelevance: null,
                contextRelevance: null
            }
        };
        
        if (node.status === 'deprecated' || node.status === 'archived') {
            candidate.state = 'UNAVAILABLE';
            candidate.reasons.push('UNAVAILABLE');
            return candidate;
        }
        
        if (pe && typeof pe.evaluateReadiness === 'function') {
            var readinessResult = pe.evaluateReadiness(node.id, lm);
            candidate.signals.readiness = readinessResult;
            
            if (readinessResult && readinessResult.status === 'READY') {
                candidate.reasons.push('PREREQUISITES_SATISFIED');
            } else if (readinessResult && readinessResult.status === 'NEAR_READY') {
                candidate.reasons.push('NEAR_READY');
            } else if (readinessResult && readinessResult.status === 'NOT_READY') {
                candidate.reasons.push('BLOCKED');
            } else if (readinessResult && readinessResult.status === 'UNKNOWN') {
                candidate.reasons.push('UNKNOWN_STATE');
            } else {
                candidate.reasons.push('UNAVAILABLE');
            }
        }
        
        if (lm && typeof lm.getKnowledgeState === 'function') {
            var state = lm.getKnowledgeState(node.id);
            if (state && state.mastery) {
                candidate.signals.mastery = state.mastery.level || 0;
                candidate.signals.masteryGap = Math.max(0, 0.6 - (state.mastery.level || 0));
                
                if (state.mastery.level >= 0.85) {
                    candidate.reasons.push('MASTERED');
                }
            }
        }
        
        var review = LawAIApp.MemoryReview;
        if (review && typeof review.getReview === 'function') {
            var reviewRecord = review.getReview(node.id);
            if (reviewRecord && (reviewRecord.reviewState === 'DUE' || reviewRecord.reviewState === 'OVERDUE')) {
                candidate.signals.review = reviewRecord.reviewState;
                candidate.reasons.push('REVIEW_DUE');
            }
        }
        
        var memory = LawAIApp.MemoryEngine;
        if (memory && typeof memory.getMemory === 'function') {
            var memRecord = memory.getMemory(node.id);
            if (memRecord) {
                candidate.signals.memory = memRecord.strength || 0;
            }
        }
        
        if (ge && typeof ge.getKnowledgeGap === 'function') {
            var gap = ge.getKnowledgeGap(node.id, lm);
            if (gap && gap.status === 'OPEN') {
                candidate.signals.masteryGap = gap.gap || 0;
                candidate.reasons.push('KNOWLEDGE_GAP');
            }
            if (gap && gap.isNearReady) {
                candidate.reasons.push('NEAR_READY');
            }
        }
        
        if (context && context.components && context.components.goals) {
            var goals = context.components.goals.goals || [];
            for (var i = 0; i < goals.length; i++) {
                var goal = goals[i];
                if (goal && (goal.targetId === node.id || (goal.title && node.title && goal.title.includes(node.title)))) {
                    candidate.signals.goalRelevance = 'HIGH';
                    candidate.reasons.push('GOAL_ALIGNED');
                    break;
                }
            }
        }
        
        var hasBlocked = candidate.reasons.indexOf('BLOCKED') !== -1;
        var hasMastered = candidate.reasons.indexOf('MASTERED') !== -1;
        var hasUnknown = candidate.reasons.indexOf('UNKNOWN_STATE') !== -1;
        var hasUnavailable = candidate.reasons.indexOf('UNAVAILABLE') !== -1;
        var hasEligible = candidate.reasons.indexOf('PREREQUISITES_SATISFIED') !== -1;
        var hasGoal = candidate.reasons.indexOf('GOAL_ALIGNED') !== -1;
        
        if (hasUnavailable) {
            candidate.state = 'UNAVAILABLE';
        } else if (hasMastered) {
            candidate.state = 'MASTERED';
        } else if (hasBlocked) {
            candidate.state = 'BLOCKED';
        } else if (hasUnknown) {
            candidate.state = 'UNKNOWN';
        } else if (hasEligible || hasGoal || candidate.reasons.length > 0) {
            candidate.state = 'ELIGIBLE';
        } else {
            candidate.state = 'UNKNOWN';
        }
        
        var uniqueReasons = {};
        var deduped = [];
        for (var j = 0; j < candidate.reasons.length; j++) {
            var reason = candidate.reasons[j];
            if (!uniqueReasons[reason]) {
                uniqueReasons[reason] = true;
                deduped.push(reason);
            }
        }
        candidate.reasons = deduped;
        
        return candidate;
    }

    /**
     * 获取可到达的目标
     */
    function getEligibleTargets(context, options) {
        var result = getAdaptiveCandidates(context, options);
        return result.eligible;
    }

    /**
     * 获取被阻断的目标
     */
    function getBlockedTargets(context, options) {
        var result = getAdaptiveCandidates(context, options);
        return result.blocked;
    }

    /**
     * 获取复习候选
     */
    function getReviewCandidates(context, options) {
        var result = getAdaptiveCandidates(context, options);
        return result.candidates.filter(function(c) {
            return c.reasons.indexOf('REVIEW_DUE') !== -1;
        });
    }

    /**
     * 获取目标对齐候选
     */
    function getGoalAlignedCandidates(context, options) {
        var result = getAdaptiveCandidates(context, options);
        return result.candidates.filter(function(c) {
            return c.reasons.indexOf('GOAL_ALIGNED') !== -1;
        });
    }

    /**
     * 获取近就绪候选
     */
    function getNearReadyCandidates(context, options) {
        var result = getAdaptiveCandidates(context, options);
        return result.candidates.filter(function(c) {
            return c.reasons.indexOf('NEAR_READY') !== -1;
        });
    }

    /**
     * 获取绕行候选
     */
    function getDetourCandidates(targetId, context, options) {
        options = options || {};
        var kg = LawAIApp.KnowledgeGraph;
        if (!kg) return [];
        
        var result = [];
        var blockers = [];
        
        var ge = LawAIApp.KnowledgeGapEngine;
        if (ge && typeof ge.getRootKnowledgeGaps === 'function') {
            var roots = ge.getRootKnowledgeGaps(targetId, LawAIApp.LearnerModel);
            if (roots && roots.length > 0) {
                for (var i = 0; i < roots.length; i++) {
                    if (roots[i].node) {
                        blockers.push(roots[i].node.id);
                    }
                }
            }
        }
        
        for (var j = 0; j < blockers.length; j++) {
            var blockerId = blockers[j];
            var prereqs = kg.getPrerequisites ? kg.getPrerequisites(blockerId) : [];
            for (var k = 0; k < prereqs.length; k++) {
                var prereq = prereqs[k];
                if (prereq && prereq.id !== targetId) {
                    var pe = LawAIApp.PrerequisiteEngine;
                    var readiness = pe && typeof pe.evaluateReadiness === 'function' ? 
                        pe.evaluateReadiness(prereq.id, LawAIApp.LearnerModel) : null;
                    
                    if (readiness && readiness.status === 'READY') {
                        result.push({
                            targetId: prereq.id,
                            targetTitle: prereq.title || prereq.id,
                            reason: 'Detour from blocker: ' + blockerId,
                            blockerId: blockerId
                        });
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * 获取学习者 ID (私有)
     */
    function _getLearnerId() {
        try {
            var profile = LawAIApp.ProfileEngine;
            if (profile && typeof profile.get === 'function') {
                var p = profile.get();
                if (p && p.userId) return p.userId;
            }
        } catch (e) {}
        return 'default-learner';
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        
        generateDailyPlan();
        
        // 监听事件更新计划
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            generateDailyPlan();
            calculateBalance();
        });
        
        LawAIApp.EventBus?.on?.('PracticeCompleted', function() {
            calculateBalance();
        });
        
        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            generateDailyPlan();
            calculateBalance();
        });
        
        console.log('🎯 AdaptiveLearning initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        getTodaysPlan: getTodaysPlan,
        generateDailyPlan: generateDailyPlan,
        getRecommendations: generateRecommendations,
        getGapReport: getGapReport,
        getBalance: calculateBalance,
        suggestActivity: suggestActivity,

        // ============================================================
        // 🔥 Part 43: Adaptive Learning Foundation (新增)
        // ============================================================
        buildAdaptiveContext: buildAdaptiveContext,
        getAdaptiveCandidates: getAdaptiveCandidates,
        getEligibleTargets: getEligibleTargets,
        getBlockedTargets: getBlockedTargets,
        getReviewCandidates: getReviewCandidates,
        getGoalAlignedCandidates: getGoalAlignedCandidates,
        getNearReadyCandidates: getNearReadyCandidates,
        getDetourCandidates: getDetourCandidates
    };
})();

console.log('🎯 AdaptiveLearning V2.0 ready');
