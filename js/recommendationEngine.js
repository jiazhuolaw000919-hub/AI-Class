// ================================================================
// ENGINE: RecommendationEngine
// LAYER: Core Logic Layer
// DOMAIN: Recommendation & Decision Support
// VERSION: 2.0.0 — Part 38 Recommendation Foundation
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.RecommendationEngine && window.LawAIApp.RecommendationEngine._upgraded) {
        console.log('[RecommendationEngine] Already upgraded, skipping...');
        return;
    }

    // ============================================================
    // RECOMMENDATION STATE CONSTANTS
    // ============================================================
    var STATES = {
        PENDING: 'PENDING',
        ACCEPTED: 'ACCEPTED',
        COMPLETED: 'COMPLETED',
        DISMISSED: 'DISMISSED',
        EXPIRED: 'EXPIRED',
        SKIPPED: 'SKIPPED',
        DEFERRED: 'DEFERRED', 
        MODIFIED: 'MODIFIED',
        OVERRIDDEN: 'OVERRIDDEN',
        CHALLENGED: 'CHALLENGED'
    };

    var STATE_LABELS = {
        PENDING: 'Pending',
        ACCEPTED: 'Accepted',
        COMPLETED: 'Completed',
        DISMISSED: 'Dismissed',
        EXPIRED: 'Expired',
        SKIPPED: 'Skipped'
    };

    // ============================================================
    // RECOMMENDATION TARGET TYPES
    // ============================================================
    var TARGET_TYPES = {
        KNOWLEDGE: 'KNOWLEDGE',
        LESSON: 'LESSON',
        PRACTICE: 'PRACTICE',
        REVIEW: 'REVIEW',
        COURSE: 'COURSE',
        RESOURCE: 'RESOURCE'
    };

    // ============================================================
    // RECOMMENDATION POLICY (中央配置)
    // ============================================================
    var POLICY = {
        maxRecommendations: 5,
        expirationDays: 7,
        signalWeights: {
            PREREQUISITE_BLOCKED: 100,
            OVERDUE_CRITICAL: 90,
            LOW_MASTERY: 80,
            GOAL_ALIGNED: 70,
            CURRENT_COURSE: 60,
            NEXT_LESSON: 50,
            REVIEW_DUE: 40,
            ENRICHMENT: 20
        },
        thresholds: {
            masteryLow: 0.4,
            reviewOverdue: 2,
            confidenceRequired: 0.3
        }
    };

    // ============================================================
    // STORAGE
    // ============================================================
    var _storageKey = 'recommendations';
    var _schemaVersion = '2.0.0';
    var _recommendations = {};

    function _getStore() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('[RecommendationEngine] Schema version mismatch, migrating...');
                stored = _migrate(stored);
            }
            _recommendations = { ..._recommendations, ...stored };
            if (_recommendations._schemaVersion) {
                delete _recommendations._schemaVersion;
            }
            return _recommendations;
        } catch (e) {
            return _recommendations;
        }
    }

    function _saveStore(store) {
        _recommendations = store;
        try {
            var toSave = { ...store };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    function _migrate(stored) {
        console.log('[RecommendationEngine] 🔄 Migrating recommendation data...');
        var migrated = {};
        for (var key in stored) {
            if (key === '_schemaVersion') continue;
            var entry = stored[key];
            if (!entry.targetId) {
                entry.targetId = key;
            }
            if (!entry.targetType) {
                entry.targetType = TARGET_TYPES.KNOWLEDGE;
            }
            if (!entry.status) {
                entry.status = STATES.PENDING;
            }
            if (!entry.reason) {
                entry.reason = 'Recommended based on your learning progress.';
            }
            migrated[key] = entry;
        }
        migrated._schemaVersion = _schemaVersion;
        LawAIApp.StorageEngine?.set?.(_storageKey, migrated);
        console.log('[RecommendationEngine] ✅ Migration complete, entries:', Object.keys(migrated).length - 1);
        return migrated;
    }

    // ============================================================
    // CORE: Get/Create Recommendation
    // ============================================================

    function getRecommendation(id) {
        if (!id) return null;
        var store = _getStore();
        var rec = store[id];
        if (!rec) return null;

        if (rec.status === STATES.PENDING && rec.expiresAt && Date.now() > rec.expiresAt) {
            rec.status = STATES.EXPIRED;
            rec.updatedAt = Date.now();
            store[id] = rec;
            _saveStore(store);
        }

        return rec;
    }

    function getRecommendations(filter) {
        filter = filter || {};
        var store = _getStore();
        var result = [];

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];

            if (filter.status && rec.status !== filter.status) continue;
            if (filter.targetType && rec.targetType !== filter.targetType) continue;
            if (filter.targetId && rec.targetId !== filter.targetId) continue;

            result.push(rec);
        }

        if (filter.sortBy !== 'createdAt') {
            result.sort(function(a, b) {
                return (b.priorityScore || 0) - (a.priorityScore || 0);
            });
        } else {
            result.sort(function(a, b) {
                return (b.createdAt || 0) - (a.createdAt || 0);
            });
        }

        return result;
    }

    function getPendingRecommendations() {
        return getRecommendations({ status: STATES.PENDING });
    }

    function getActiveRecommendations() {
        return getRecommendations({
            status: STATES.PENDING,
            sortBy: 'priority'
        });
    }

    // ============================================================
    // CORE: Generate Recommendations
    // ============================================================

    function generateRecommendations(context) {
        context = context || {};
        console.log('[RecommendationEngine] 🎯 Generating recommendations...');

        var candidates = [];
        var seenIds = new Set();

        // 1. From Review system
        var review = window.LawAIApp.MemoryReview;
        if (review && typeof review.getTodayReviews === 'function') {
            var dueReviews = review.getTodayReviews();
            for (var i = 0; i < dueReviews.length; i++) {
                var item = dueReviews[i];
                if (!seenIds.has(item.knowledgeId)) {
                    seenIds.add(item.knowledgeId);
                    candidates.push({
                        targetId: item.knowledgeId,
                        targetType: TARGET_TYPES.REVIEW,
                        priority: 60 + (item.priority || 0) * 0.4,
                        signals: ['REVIEW_DUE'],
                        source: 'review'
                    });
                }
            }
        }

        // 2. From Mastery system
        var mastery = window.LawAIApp.MasteryEngine;
        if (mastery && typeof mastery.getAllMastery === 'function') {
            var allMastery = mastery.getAllMastery();
            for (var j = 0; j < allMastery.length; j++) {
                var record = allMastery[j];
                if (!record || !record.knowledgeId) continue;
                if (seenIds.has(record.knowledgeId)) continue;

                var level = record.masteryLevel || 0;
                if (level < POLICY.thresholds.masteryLow) {
                    seenIds.add(record.knowledgeId);
                    var priority = 50 + (1 - level) * 50;
                    candidates.push({
                        targetId: record.knowledgeId,
                        targetType: TARGET_TYPES.KNOWLEDGE,
                        priority: priority,
                        signals: ['LOW_MASTERY'],
                        source: 'mastery',
                        masteryLevel: level
                    });
                }
            }
        }

        // 3. From current course
        var currentCourseId = context.currentCourseId || _getCurrentCourseId();
        if (currentCourseId) {
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (courseRegistry && typeof courseRegistry.getCourse === 'function') {
                var course = courseRegistry.getCourse(currentCourseId);
                if (course) {
                    var nextLesson = _findNextLesson(currentCourseId);
                    if (nextLesson && !seenIds.has(nextLesson)) {
                        seenIds.add(nextLesson);
                        candidates.push({
                            targetId: nextLesson,
                            targetType: TARGET_TYPES.LESSON,
                            priority: 70,
                            signals: ['CURRENT_COURSE'],
                            source: 'course'
                        });
                    }
                }
            }
        }

        // 4. From goals
        var goals = _getActiveGoals();
        if (goals && goals.length > 0) {
            var goalTopics = _extractGoalTopics(goals);
            for (var k = 0; k < goalTopics.length; k++) {
                var topic = goalTopics[k];
                if (!seenIds.has(topic)) {
                    seenIds.add(topic);
                    candidates.push({
                        targetId: topic,
                        targetType: TARGET_TYPES.KNOWLEDGE,
                        priority: 65,
                        signals: ['GOAL_ALIGNED'],
                        source: 'goal'
                    });
                }
            }
        }

        // 5. Fallback
        if (candidates.length === 0) {
            var fallback = _getFallbackRecommendation();
            if (fallback && !seenIds.has(fallback.targetId)) {
                candidates.push({
                    targetId: fallback.targetId,
                    targetType: fallback.targetType || TARGET_TYPES.COURSE,
                    priority: 30,
                    signals: ['FALLBACK'],
                    source: 'fallback'
                });
            }
        }

        // 6. Sort and trim
        candidates.sort(function(a, b) {
            return (b.priority || 0) - (a.priority || 0);
        });

        var topCandidates = candidates.slice(0, POLICY.maxRecommendations);

        // 7. Convert to Recommendation records
        var created = [];
        for (var l = 0; l < topCandidates.length; l++) {
            var cand = topCandidates[l];
            var rec = _createRecommendation(cand, context);
            if (rec) {
                created.push(rec);
            }
        }

        _emit('RECOMMENDATIONS_GENERATED', {
            count: created.length,
            recommendations: created
        });

        console.log('[RecommendationEngine] ✅ Generated ' + created.length + ' recommendations');
        return created;
    }

    function _createRecommendation(candidate, context) {
        var store = _getStore();
        var id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        var existing = _findExisting(candidate.targetId, candidate.targetType);
        if (existing) {
            if (existing.status === STATES.PENDING || existing.status === STATES.ACCEPTED) {
                return null;
            }
        }

        var reason = _generateReason(candidate, context);
        var expiresAt = Date.now() + (POLICY.expirationDays * 24 * 60 * 60 * 1000);

        var rec = {
            id: id,
            targetId: candidate.targetId,
            targetType: candidate.targetType || TARGET_TYPES.KNOWLEDGE,
            reason: reason,
            // 🔥 Part 142: 新增字段
            primaryReason: candidate.signals && candidate.signals.length > 0 ? candidate.signals[0] : 'UNKNOWN',
            supportingReasons: candidate.signals && candidate.signals.length > 1 ? candidate.signals.slice(1) : [],
            negativeEvidence: candidate.negativeEvidence || [],
            priorityScore: Math.min(100, Math.max(0, candidate.priority || 50)),
            confidence: 0.7,
            sourceSignals: candidate.signals || ['UNKNOWN'],
            source: candidate.source || 'unknown',
            metadata: {
                masteryLevel: candidate.masteryLevel || null,
                context: context
            },
            status: STATES.PENDING,
            expiresAt: expiresAt,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            _schemaVersion: _schemaVersion
        };

        store[id] = rec;
        _saveStore(store);

        _emit('RECOMMENDATION_CREATED', {
            id: id,
            targetId: rec.targetId,
            priority: rec.priorityScore
        });

        return rec;
    }

    function _findExisting(targetId, targetType) {
        var store = _getStore();
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];
            if (rec.targetId === targetId && rec.targetType === targetType) {
                return rec;
            }
        }
        return null;
    }

    // ============================================================
    // 🔥 Part 48: Adaptive Recommendation Engine
    // ============================================================

    function getAdaptiveRecommendations(context, options) {
        options = options || {};
        context = context || _getAdaptiveContext();
    
        var result = {
            recommendations: [],
            alternatives: [],
            contextVersion: context.contextVersion || Date.now(),
            pathVersion: context.pathVersion || null,
            generatedAt: Date.now(),
            summary: {
                total: 0,
                primary: null,
                alternatives: 0
            }
        };
    
        var candidates = _discoverCandidates(context, options);
        var filtered = _filterCandidates(candidates, context, options);
        var ranked = _rankCandidates(filtered, context, options);
    
        if (ranked.length > 0) {
            var primary = _buildRecommendation(ranked[0], context, options);
            result.recommendations.push(primary);
            result.summary.primary = primary;
        
            for (var i = 1; i < Math.min(ranked.length, 4); i++) {
                var alt = _buildRecommendation(ranked[i], context, { ...options, isAlternative: true });
                result.alternatives.push(alt);
            }
            result.summary.alternatives = result.alternatives.length;
        }
    
        result.summary.total = result.recommendations.length + result.alternatives.length;
    
        return result;
    }

    function _discoverCandidates(context, options) {
        var candidates = [];
        var seen = {};
    
        var ape = window.LawAIApp.AdaptivePathEngine;
        if (ape) {
            var path = _getActivePath();
            if (path && path.nodes) {
                for (var i = 0; i < path.nodes.length; i++) {
                    var node = path.nodes[i];
                    if (!node || node.state === 'COMPLETED' || node.state === 'MASTERED') continue;
                    if (seen[node.knowledgeId]) continue;
                    seen[node.knowledgeId] = true;
                    candidates.push({
                        targetId: node.knowledgeId,
                        targetType: 'KNOWLEDGE',
                        source: 'CURRENT_PATH',
                        priority: 80 - i * 5,
                        signals: ['PATH_CONTINUITY'],
                        position: i
                    });
                }
            }
        }
    
        var review = window.LawAIApp.MemoryReview;
        if (review) {
            var dueReviews = review.getTodayReviews ? review.getTodayReviews() : [];
            for (var i = 0; i < dueReviews.length; i++) {
                var item = dueReviews[i];
                if (!item || !item.knowledgeId) continue;
                if (seen[item.knowledgeId]) continue;
                seen[item.knowledgeId] = true;
                candidates.push({
                    targetId: item.knowledgeId,
                    targetType: 'REVIEW',
                    source: 'REVIEW',
                    priority: 70 - i * 3,
                    signals: ['REVIEW_DUE'],
                    reviewData: item
                });
            }
        }
    
        var mastery = window.LawAIApp.MasteryEngine;
        if (mastery) {
            var allMastery = mastery.getAllMastery ? mastery.getAllMastery() : [];
            for (var i = 0; i < allMastery.length; i++) {
                var record = allMastery[i];
                if (!record || !record.knowledgeId) continue;
                if (seen[record.knowledgeId]) continue;
                if (record.masteryLevel >= 0.6) continue;
                seen[record.knowledgeId] = true;
                candidates.push({
                    targetId: record.knowledgeId,
                    targetType: 'KNOWLEDGE',
                    source: 'MASTERY_GAP',
                    priority: 60 - record.masteryLevel * 50,
                    signals: ['KNOWLEDGE_GAP'],
                    masteryLevel: record.masteryLevel
                });
            }
        }
    
        var goal = context.goal || _getCurrentGoal();
        if (goal && goal.targetId) {
            if (!seen[goal.targetId]) {
                seen[goal.targetId] = true;
                candidates.push({
                    targetId: goal.targetId,
                    targetType: 'GOAL',
                    source: 'GOAL_ALIGNMENT',
                    priority: 90,
                    signals: ['GOAL_ALIGNED']
                });
            }
        }
    
        return candidates;
    }

    function _filterCandidates(candidates, context, options) {
        var filtered = [];
    
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];
            
            var kg = window.LawAIApp.KnowledgeGraph;
            if (kg) {
                var node = kg.getNode(candidate.targetId);
                if (!node) continue;
                if (node.status === 'deprecated') continue;
            }
        
            var lm = window.LawAIApp.LearnerModel;
            if (lm && candidate.source !== 'GOAL_ALIGNMENT') {
                var state = lm.getKnowledgeState ? lm.getKnowledgeState(candidate.targetId) : null;
                if (state && state.mastery && state.mastery.level >= 0.85) {
                    continue;
                }
            }
        
            filtered.push(candidate);
        }
    
        return filtered;
    }

    function _rankCandidates(candidates, context, options) {
        var ranked = candidates.slice();
        ranked.sort(function(a, b) {
            var diff = (b.priority || 0) - (a.priority || 0);
            if (diff !== 0) return diff;
            return (a.targetId || '').localeCompare(b.targetId || '');
        });
        return ranked;
    }

    function _buildRecommendation(candidate, context, options) {
        var isAlternative = options.isAlternative || false;
        var action = _determineAction(candidate);
    
        var recommendation = {
            recommendationId: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            targetId: candidate.targetId,
            targetType: candidate.targetType || 'KNOWLEDGE',
            action: action,
            reasonCodes: candidate.signals || ['UNKNOWN'],
            supportingSignals: candidate,
            priority: candidate.priority >= 70 ? 'HIGH' : 
                      candidate.priority >= 50 ? 'MEDIUM' : 'LOW',
            confidence: 0.7,
            isAlternative: isAlternative,
            explanation: _generateExplanation(candidate, context),
            contextVersion: context.contextVersion || Date.now(),
            pathVersion: context.pathVersion || null,
            generatedAt: Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        };
    
        if (candidate.reviewData) {
            recommendation.reviewData = candidate.reviewData;
        }    
        if (candidate.masteryLevel !== undefined) {
            recommendation.masteryLevel = candidate.masteryLevel;
        }
    
        return recommendation;
    }

    function _determineAction(candidate) {
        switch (candidate.source) {
            case 'CURRENT_PATH':
                return 'CONTINUE';
            case 'REVIEW':
                return 'REVIEW';
            case 'MASTERY_GAP':
                return 'PRACTICE';
            case 'GOAL_ALIGNMENT':
                return 'ADVANCE';
            default:
                return 'CONTINUE';
        }
    }

    function _generateExplanation(candidate, context) {
        switch (candidate.source) {
            case 'CURRENT_PATH':
                return 'Continue your current learning path.';
            case 'REVIEW':
                return 'Review this concept to reinforce your understanding.';
            case 'MASTERY_GAP':
                var level = candidate.masteryLevel || 0;
                if (level < 0.3) {
                    return 'This concept needs foundational practice.';
                }
                return 'Practice this concept to strengthen your understanding.';
            case 'GOAL_ALIGNMENT':
                return 'This is aligned with your current learning goal.';
            default:
                return 'Recommended based on your learning progress.';
        }
    }

    function _getAdaptiveContext() {
        try {
            var lm = window.LawAIApp.LearnerModel;
            if (lm && typeof lm.buildAdaptiveContext === 'function') {
                return lm.buildAdaptiveContext();
            }
        } catch (e) {}
        return { contextVersion: Date.now(), quality: 'UNKNOWN' };
    }

    function _getActivePath() {
        try {
            var ape = window.LawAIApp.AdaptivePathEngine;
            if (ape && ape.getActivePath) {
                return ape.getActivePath();
            }
            var loop = window.LawAIApp.AdaptiveLoop;
            if (loop && loop.getLoopStatus) {
                var status = loop.getLoopStatus();
                if (status && status.lastDecision) {
                    return {
                        targetId: status.lastDecision.targetId,
                        nodes: [{ knowledgeId: status.lastDecision.targetId, state: 'ELIGIBLE' }]
                    };
                }
            }
        } catch (e) {}
        return null;
    }

    function _getCurrentGoal() {
        try {
            var goals = window.LawAIApp.GoalEngine;
            if (goals && goals.getActiveGoals) {
                var active = goals.getActiveGoals();
                if (active && active.length > 0) {
                    return active[0];
                }
            }
        } catch (e) {}
        return null;
    }

    function acceptAdaptiveRecommendation(recommendationId) {
        console.log('[RecommendationEngine] Accepted:', recommendationId);
        _emit('RECOMMENDATION_ACCEPTED', {
            recommendationId: recommendationId,
            timestamp: Date.now()
        });
        return true;
    }

    function dismissAdaptiveRecommendation(recommendationId, reason) {
        console.log('[RecommendationEngine] Dismissed:', recommendationId, reason || '');
        _emit('RECOMMENDATION_DISMISSED', {
            recommendationId: recommendationId,
            reason: reason || 'LEARNER_CHOICE',
            timestamp: Date.now()
        });
        return true;
    }

    function skipAdaptiveRecommendation(recommendationId) {
        console.log('[RecommendationEngine] Skipped:', recommendationId);
        _emit('RECOMMENDATION_SKIPPED', {
            recommendationId: recommendationId,
            timestamp: Date.now()
        });
        return true;
    }

    function selectAdaptiveAlternative(recommendationId, alternativeId) {
        console.log('[RecommendationEngine] Alternative selected:', recommendationId, '->', alternativeId);
        _emit('RECOMMENDATION_ALTERNATIVE_SELECTED', {
            recommendationId: recommendationId,
            alternativeId: alternativeId,
            timestamp: Date.now()
        });
        return true;
    }

    function isRecommendationStale(recommendation, currentContext) {
        if (!recommendation) return true;
        if (!currentContext) return true;
    
        if (recommendation.contextVersion !== currentContext.contextVersion) {
            return true;
        }
    
        if (recommendation.expiresAt && Date.now() > recommendation.expiresAt) {
            return true;
        }
    
        return false;
    }

    // ============================================================
    // 🔥 Part 49: Recommendation Explainability & Decision Transparency
    // ============================================================

    function explainRecommendation(recommendation, level, context) {
        level = level || 'summary';
        context = context || _getAdaptiveContext();

        if (typeof recommendation === 'string') {
            recommendation = getRecommendation(recommendation);
            if (!recommendation) {
                return {
                    error: 'Recommendation not found',
                    recommendationId: recommendation
                };
            }
        }

        if (!recommendation) {
            return { error: 'Invalid recommendation' };
        }

        var explanation = {
            recommendationId: recommendation.id || recommendation.recommendationId,
            level: level,
            summary: '',
            // 🔥 Part 142: 新增字段
            primaryReason: recommendation.primaryReason || null,
            supportingReasons: recommendation.supportingReasons || [],
            negativeEvidence: recommendation.negativeEvidence || [],
            reasons: [],
            supportingSignals: [],
            evidence: [],
            alternatives: [],
            tradeoffs: [],
            uncertainty: 'UNKNOWN',
            constraints: [],
            learnerControls: ['ACCEPT', 'SKIP', 'DISMISS', 'EXPLORE', 'CHOOSE_ALTERNATIVE'],
            sourceVersions: {
                contextVersion: context.contextVersion || null,
                pathVersion: context.pathVersion || null,
                policyVersion: '1.0.0'
            },
            generatedAt: Date.now(),
            stale: false
        };

        var reasonCodes = recommendation.reasonCodes || recommendation.reasons || [];
        for (var i = 0; i < reasonCodes.length; i++) {
            var code = reasonCodes[i];
            var reason = _mapReason(code, recommendation, context);
            if (reason) {
                explanation.reasons.push(reason);
            }
        }

        if (explanation.reasons.length === 0) {
            explanation.reasons.push({
                code: 'UNKNOWN',
                primary: true,
                description: 'Recommended based on available learning signals.'
            });
        }

        if (explanation.reasons.length > 0) {
            explanation.reasons[0].primary = true;
        }    

        var signals = recommendation.supportingSignals || {};
        for (var key in signals) {
            if (signals.hasOwnProperty(key)) {
                explanation.supportingSignals.push({
                    signalId: key,
                    type: typeof signals[key],
                    source: 'recommendation_engine',
                    value: signals[key],
                    timestamp: Date.now(),
                    relevance: 'supporting'
                });
            }
        }

        if (signals.masteryLevel !== undefined) {
            explanation.evidence.push({
                evidenceId: 'ev_mastery_' + Date.now(),
                source: 'MasteryEngine',
                type: 'MASTERY_LEVEL',
                timestamp: Date.now(),
                targetId: recommendation.targetId,
                summary: 'Mastery level: ' + Math.round(signals.masteryLevel * 100) + '%'
            });
        }
        if (signals.reviewData) {
            explanation.evidence.push({
                evidenceId: 'ev_review_' + Date.now(),
                source: 'MemoryReview',
                type: 'REVIEW_DUE',
                timestamp: Date.now(),
                targetId: recommendation.targetId,
                summary: 'Review due'
            });
        }

        if (recommendation.alternatives && recommendation.alternatives.length > 0) {
            explanation.alternatives = recommendation.alternatives.map(function(alt) {
                return {
                    targetId: alt.targetId || alt,
                    targetType: alt.targetType || 'UNKNOWN',
                    action: alt.action || 'CONTINUE',
                    reason: alt.reason || 'Alternative option'
                };
            });
        }

        var tradeoff = _deriveTradeoff(recommendation, context);
        if (tradeoff) {
            explanation.tradeoffs.push(tradeoff);
        }

        if (recommendation.confidence !== undefined) {
            explanation.uncertainty = recommendation.confidence >= 0.8 ? 'LOW' :
                                       recommendation.confidence >= 0.5 ? 'MEDIUM' : 'HIGH';
        } else {
            explanation.uncertainty = 'UNKNOWN';
        }

        explanation.summary = _buildExplanationSummary(explanation, level);

        var constraint = _deriveConstraint(recommendation, context);
        if (constraint) {
            explanation.constraints.push(constraint);
        }

        explanation.stale = isRecommendationStale ? isRecommendationStale(recommendation, context) : false;

        return explanation;
    }

    function _mapReason(code, recommendation, context) {
        var descriptions = {
            'GOAL_ALIGNED': 'Aligned with your current learning goal',
            'GOAL_ALIGNMENT': 'Aligned with your current learning goal',
            'PATH_CONTINUITY': 'Continues your current learning path',
            'MASTERY_GAP': 'Addresses a knowledge gap',
            'KNOWLEDGE_GAP': 'Addresses a knowledge gap',
            'LOW_MASTERY': 'This area needs more practice',
            'REVIEW_DUE': 'Due for review',
            'CURRENT_COURSE': 'Part of your current course',
            'PREREQUISITE_BLOCKED': 'Required before continuing',
            'PREREQUISITE_SIGNAL': 'Builds on prerequisite knowledge',
            'ASSESSMENT_UNCERTAINTY': 'Assessment showed uncertainty',
            'RECENT_DIFFICULTY': 'Recent practice was difficult',
            'RECENT_SUCCESS': 'Recent practice was successful',
            'LEARNER_REQUEST': 'You requested this',
            'LEARNER_EXPLORATION': 'You are exploring this topic',
            'PATH_STALE': 'Path has changed',
            'FALLBACK': 'Starting point for learning',
            'UNKNOWN': 'Based on available learning signals'
        };

        var description = descriptions[code] || descriptions['UNKNOWN'];
        return { code: code, primary: false, description: description };
    }

    function _deriveTradeoff(recommendation, context) {
        if (!recommendation || !context) return null;
    
        var tradeoff = {
            benefit: 'Progress toward learning goal',
            risk: 'May require additional time',
            description: 'Standard learning path'
        };

        if (recommendation.action === 'REVIEW') {
            tradeoff.benefit = 'Strengthens retention and understanding';
            tradeoff.risk = 'Slows progress on new content';
            tradeoff.description = 'Reviewing strengthens long-term retention';
        } else if (recommendation.action === 'PRACTICE') {
            tradeoff.benefit = 'Builds confidence and mastery';
            tradeoff.risk = 'Requires focused effort';
            tradeoff.description = 'Practice helps solidify skills';
        } else if (recommendation.action === 'ADVANCE') {
            tradeoff.benefit = 'Progresses toward your goals';
            tradeoff.risk = 'May encounter unfamiliar concepts';
            tradeoff.description = 'Advancing keeps momentum';
        }

        return tradeoff;
    }

    function _deriveConstraint(recommendation, context) {
        if (!recommendation) return null;

        if (recommendation.targetType === 'REQUIRED' || recommendation.priority === 'CRITICAL') {
            return {
                type: 'REQUIRED',
                description: 'This recommendation follows an authoritative rule',
                source: 'system_policy'
            };
        }

        return null;
    }

    function _buildExplanationSummary(explanation, level) {
        var summary = '';

        var primaryReason = null;
        for (var i = 0; i < explanation.reasons.length; i++) {
            if (explanation.reasons[i].primary) {
                primaryReason = explanation.reasons[i];
                break;
            }
        }

        if (primaryReason) {
            summary = primaryReason.description;
        } else if (explanation.reasons.length > 0) {
            summary = explanation.reasons[0].description;
        } else {
            summary = 'Recommended based on your learning progress.';
        }

        if (level === 'detail' || level === 'audit') {
            if (explanation.evidence.length > 0) {
                summary += ' Based on ' + explanation.evidence.length + ' evidence item(s).';
            }
            if (explanation.alternatives.length > 0) {
                summary += ' ' + explanation.alternatives.length + ' alternative(s) available.';
            }
            if (explanation.uncertainty !== 'UNKNOWN') {
                summary += ' Uncertainty: ' + explanation.uncertainty.toLowerCase() + '.';
            }
        }

        if (level === 'audit') {
            summary += ' [Context: ' + (explanation.sourceVersions.contextVersion || 'N/A') + ']';
            summary += ' [Path: ' + (explanation.sourceVersions.pathVersion || 'N/A') + ']';
        }

        return summary;
    }

    function getExplanationLevels() {
        return ['summary', 'detail', 'audit'];
    }

    function compareRecommendations(rec1, rec2, context) {
        context = context || _getAdaptiveContext();

        var comparison = {
            recommendations: [],
            differences: [],
            recommendation: null
        };

        var exp1 = explainRecommendation(rec1, 'detail', context);
        var exp2 = explainRecommendation(rec2, 'detail', context);

        comparison.recommendations = [exp1, exp2];

        if (exp1.reasons.length > 0 && exp2.reasons.length > 0) {
            var r1 = exp1.reasons[0].code || 'UNKNOWN';
            var r2 = exp2.reasons[0].code || 'UNKNOWN';
            if (r1 !== r2) {
                comparison.differences.push({
                    aspect: 'primaryReason',
                    value1: r1,
                    value2: r2
                });
            }
        }

        if (exp1.uncertainty !== exp2.uncertainty) {
            comparison.differences.push({
                aspect: 'uncertainty',
                value1: exp1.uncertainty,
                value2: exp2.uncertainty
            });
        }

        if (exp1.alternatives.length !== exp2.alternatives.length) {
            comparison.differences.push({
                aspect: 'alternativeCount',
                value1: exp1.alternatives.length,
                value2: exp2.alternatives.length
            });
        }

        return comparison;
    }

    function getDecisionTrace(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { error: 'Recommendation not found', recommendationId: recommendationId };
        }

        var trace = {
            recommendationId: recommendationId,
            targetId: rec.targetId,
            targetType: rec.targetType,
            status: rec.status,
            priorityScore: rec.priorityScore,
            confidence: rec.confidence,
            source: rec.source,
            sourceSignals: rec.sourceSignals,
            createdAt: rec.createdAt,
            updatedAt: rec.updatedAt,
            expiresAt: rec.expiresAt,
            contextVersion: rec.metadata?.context?.contextVersion || null,
            path: rec.metadata?.context?.path || null,
            events: []
        };

        try {
            var eventBus = window.LawAIApp?.EventBus || window.EventBus;
            if (eventBus && typeof eventBus.getEvents === 'function') {
                var events = eventBus.getEvents({
                    filter: function(e) {
                        return e.detail && e.detail.recommendationId === recommendationId;
                    }
                });
                trace.events = events || [];
            }
        } catch (e) {
            // ignore
        }    

        return trace;
    }

    function getRecommendationFeedback(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { error: 'Recommendation not found' };
        }

        var feedback = {
            recommendationId: recommendationId,
            status: rec.status,
            accepted: rec.status === STATES.ACCEPTED,
            completed: rec.status === STATES.COMPLETED,
            dismissed: rec.status === STATES.DISMISSED,
            skipped: rec.status === STATES.SKIPPED,
            expired: rec.status === STATES.EXPIRED,
            pending: rec.status === STATES.PENDING,
            timestamp: rec.updatedAt || rec.createdAt
        };

        return feedback;
    }

    function recordRecommendationFeedback(recommendationId, feedbackType, comment) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { success: false, message: 'Recommendation not found' };
        }

        var feedbackEvent = {
            recommendationId: recommendationId,
            feedbackType: feedbackType,
            comment: comment || null,
            timestamp: Date.now()
        };

        _emit('RECOMMENDATION_FEEDBACK_RECORDED', feedbackEvent);

        return {
            success: true,
            feedback: feedbackEvent
        };
    }

    // ============================================================
    // 🔥 Part 142: Recommendation Override
    // ============================================================

    function recordRecommendationOverride(recommendationId, selectedAlternative, reason) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { success: false, message: 'Recommendation not found' };
        }
    
        if (rec.status !== STATES.PENDING && rec.status !== STATES.ACCEPTED) {
            return { success: false, message: 'Recommendation cannot be overridden in current state' };
        }
    
        rec.status = STATES.OVERRIDDEN;
        rec.updatedAt = Date.now();
        rec.metadata = rec.metadata || {};
        rec.metadata.override = {
            selectedAlternative: selectedAlternative || null,
            reason: reason || null,
            timestamp: Date.now()
        };
    
        var store = _getStore();
        store[recommendationId] = rec;
        _saveStore(store);
    
        _emit('RECOMMENDATION_OVERRIDDEN', {
            recommendationId: recommendationId,
            selectedAlternative: selectedAlternative,
            reason: reason,
            timestamp: Date.now()
        });
    
        return {
            success: true,
            recommendation: rec
        };
    }

    // ============================================================
    // 🔥 Part 142: Recommendation Challenge
    // ============================================================

    function recordRecommendationChallenge(recommendationId, challengeReason, metadata) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { success: false, message: 'Recommendation not found' };
        }
    
        // 如果已经是 CHALLENGED，追加
        if (rec.status === STATES.CHALLENGED) {
            rec.metadata = rec.metadata || {};
            rec.metadata.challenges = rec.metadata.challenges || [];
            rec.metadata.challenges.push({
                challengeReason: challengeReason || 'unknown',
                metadata: metadata || {},
                timestamp: Date.now()
            });
            rec.updatedAt = Date.now();
        } else {
            rec.status = STATES.CHALLENGED;
            rec.updatedAt = Date.now();
            rec.metadata = rec.metadata || {};
            rec.metadata.challenges = rec.metadata.challenges || [];
            rec.metadata.challenges.push({
                challengeReason: challengeReason || 'unknown',
                metadata: metadata || {},
                timestamp: Date.now()
            });
        }
    
        var store = _getStore();
        store[recommendationId] = rec;
        _saveStore(store);
    
        _emit('RECOMMENDATION_CHALLENGED', {
            recommendationId: recommendationId,
            challengeReason: challengeReason,
            timestamp: Date.now()
        });
    
        return {
            success: true,
            recommendation: rec
        };
    }

    // ============================================================
    // 🔥 Part 50: Adaptive Feedback & Recommendation Outcome Loop
    // ============================================================

    function recordRecommendationOutcome(recommendationId, status, metadata) {
        metadata = metadata || {};
    
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { success: false, message: 'Recommendation not found' };
        }
    
        var outcome = {
            outcomeId: 'out_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: recommendationId,
            targetId: rec.targetId,
            targetType: rec.targetType,
            action: rec.action || 'UNKNOWN',
            status: status || 'UNKNOWN',
            evidenceRefs: metadata.evidenceRefs || [],
            learnerFeedbackRefs: metadata.feedbackRefs || [],
            contextVersion: metadata.contextVersion || null,
            timestamp: Date.now(),
            metadata: metadata
        };
    
        var store = _getStore();
        if (!store._outcomes) {
            store._outcomes = [];
        }
        store._outcomes.push(outcome);
        _saveStore(store);
    
        if (status === 'ACCEPTED') {
            acceptRecommendation(recommendationId);
        } else if (status === 'COMPLETED') {
            completeRecommendation(recommendationId);
        } else if (status === 'DISMISSED') {
            dismissRecommendation(recommendationId);
        } else if (status === 'SKIPPED') {
            skipRecommendation(recommendationId);
        } else if (status === 'EXPIRED') {
            expireRecommendation(recommendationId);
        }
    
        _emit('RECOMMENDATION_OUTCOME_RECORDED', {
            outcomeId: outcome.outcomeId,
            recommendationId: recommendationId,
            status: status,
            timestamp: outcome.timestamp
        });
    
        if (status === 'COMPLETED' || status === 'ACCEPTED' || status === 'STARTED') {
            _triggerContextRefresh(recommendationId);
        }
    
        return {
            success: true,
            outcome: outcome
        };
    }

    function getRecommendationOutcome(recommendationId) {
        var store = _getStore();
        if (!store._outcomes) return null;
    
        var outcomes = store._outcomes.filter(function(o) {
            return o.recommendationId === recommendationId;
        });
    
        if (outcomes.length === 0) return null;
    
        outcomes.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });
    
        return outcomes[0];
    }

    function processOutcomeFeedback(recommendationId, feedbackType, comment) {
        var outcome = getRecommendationOutcome(recommendationId);
        if (!outcome) {
            return { success: false, message: 'Outcome not found' };
        }
    
        var feedbackResult = recordRecommendationFeedback(recommendationId, feedbackType, comment);
        if (!feedbackResult.success) {
            return feedbackResult;
        }
    
        var store = _getStore();
        if (!store._outcomes) {
            return { success: false, message: 'Outcomes not found' };
        }
    
        for (var i = 0; i < store._outcomes.length; i++) {
            if (store._outcomes[i].outcomeId === outcome.outcomeId) {
                if (!store._outcomes[i].learnerFeedbackRefs) {
                    store._outcomes[i].learnerFeedbackRefs = [];
                }
                store._outcomes[i].learnerFeedbackRefs.push({
                    feedbackId: feedbackResult.feedback.feedbackId || feedbackResult.feedback,
                    type: feedbackType,
                    comment: comment || null,
                    timestamp: Date.now()
                });
                break;
            }
        }
        _saveStore(store);
    
        _processFeedbackSignals(recommendationId, feedbackType);
    
        return {
            success: true,
            message: 'Feedback processed',
            feedbackType: feedbackType
        };
    }

    function _processFeedbackSignals(recommendationId, feedbackType) {
        var signal = null;
    
        if (feedbackType === 'TOO_HARD') {
            signal = 'DIFFICULTY_SIGNAL';
        } else if (feedbackType === 'NOT_HELPFUL' || feedbackType === 'NOT_RELEVANT') {
            signal = 'RELEVANCE_SIGNAL';
        } else if (feedbackType === 'HELPFUL') {
            signal = 'HELPFUL_SIGNAL';
        }
    
        if (signal) {
            var store = _getStore();
            if (!store._feedbackSignals) {
                store._feedbackSignals = {};
            }
            if (!store._feedbackSignals[recommendationId]) {
                store._feedbackSignals[recommendationId] = [];
            }
            store._feedbackSignals[recommendationId].push({
                type: signal,
                feedbackType: feedbackType,
                timestamp: Date.now()
            });
            _saveStore(store);
        }
    }

    function _triggerContextRefresh(recommendationId) {
        try {
            var lm = window.LawAIApp.LearnerModel;
            if (lm && typeof lm.invalidateContext === 'function') {
                lm.invalidateContext('Recommendation outcome: ' + recommendationId);
            }
        
            var loop = window.LawAIApp.AdaptiveLoop;
            if (loop && typeof loop.getLoopStatus === 'function') {
                _emit('CONTEXT_REFRESH_REQUESTED', {
                    recommendationId: recommendationId,
                    timestamp: Date.now()
                });
            }
        
            var ape = window.LawAIApp.AdaptivePathEngine;
            if (ape && typeof ape.replanAdaptivePath === 'function') {
                var path = ape.getActivePath ? ape.getActivePath() : null;
                if (path && path.targetId) {
                    setTimeout(function() {
                        var context = lm && typeof lm.buildAdaptiveContext === 'function' ? 
                            lm.buildAdaptiveContext() : null;
                        if (context && ape.isPathStale && ape.isPathStale(path, context)) {
                            var result = ape.replanAdaptivePath(path, context);
                            if (result && result.success) {
                                _emit('PATH_REPLANNED', {
                                    recommendationId: recommendationId,
                                    newPathId: result.path.pathId
                                });
                            }
                        }
                    }, 500);
                }
            }
        } catch (e) {
            // ignore
        }
    }

    function getOutcomeHistory(filter) {
        filter = filter || {};
        var store = _getStore();
        if (!store._outcomes) return [];
    
        var outcomes = store._outcomes;
    
        if (filter.recommendationId) {
            outcomes = outcomes.filter(function(o) {
                return o.recommendationId === filter.recommendationId;
            });
        }
        if (filter.targetId) {
            outcomes = outcomes.filter(function(o) {
                return o.targetId === filter.targetId;
            });
        }
        if (filter.status) {
            outcomes = outcomes.filter(function(o) {
                return o.status === filter.status;
            });
        }
        if (filter.fromDate) {
            outcomes = outcomes.filter(function(o) {
                return o.timestamp >= filter.fromDate;
            });
        }
        if (filter.toDate) {
            outcomes = outcomes.filter(function(o) {
                return o.timestamp <= filter.toDate;
            });
        }
    
        outcomes.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });
    
        if (filter.limit) {
            outcomes = outcomes.slice(0, filter.limit);
        }
    
        return outcomes;
    }

        function getRecommendationQualityMetrics(options) {
        options = options || {};
        var store = _getStore();
        var outcomes = store._outcomes || [];
        var feedbackSignals = store._feedbackSignals || {};
    
        var metrics = {
            total: outcomes.length,
            byStatus: {
                shown: 0,
                accepted: 0,
                skipped: 0,
                dismissed: 0,
                alternativeSelected: 0,
                started: 0,
                completed: 0,
                abandoned: 0,
                expired: 0,
                failed: 0,
                deferred: 0,
                unknown: 0,
                overridden: 0,
                challenged: 0
            },
            feedback: {
                helpful: 0,
                notHelpful: 0,
                unclear: 0,
                wrong: 0,
                notRelevant: 0,
                tooEasy: 0,
                tooHard: 0,
                goodTiming: 0,
                badTiming: 0
            },    
            signals: {},
            acceptanceRate: 0,
            completionRate: 0,
            helpfulRate: 0,
            governance: {
                overrideRate: 0,
                challengeRate: 0,
                totalOverrides: 0,
                totalChallenges: 0
            }        
        };
    
        for (var i = 0; i < outcomes.length; i++) {
            var o = outcomes[i];
            var status = o.status || 'UNKNOWN';
            switch (status) {
                case 'SHOWN': metrics.byStatus.shown++; break;
                case 'ACCEPTED': metrics.byStatus.accepted++; break;
                case 'SKIPPED': metrics.byStatus.skipped++; break;
                case 'DISMISSED': metrics.byStatus.dismissed++; break;
                case 'ALTERNATIVE_SELECTED': metrics.byStatus.alternativeSelected++; break;
                case 'STARTED': metrics.byStatus.started++; break;
                case 'COMPLETED': metrics.byStatus.completed++; break;
                case 'ABANDONED': metrics.byStatus.abandoned++; break;
                case 'EXPIRED': metrics.byStatus.expired++; break;
                case 'FAILED': metrics.byStatus.failed++; break;
                case 'DEFERRED': metrics.byStatus.deferred++; break;
                case 'OVERRIDDEN': metrics.byStatus.overridden++; break;
                case 'CHALLENGED': metrics.byStatus.challenged++; break;
                default: metrics.byStatus.unknown++;
            }
        }
    
        for (var recId in feedbackSignals) {
            var signals = feedbackSignals[recId];
            for (var j = 0; j < signals.length; j++) {
                var fbType = signals[j].feedbackType || 'UNKNOWN';
                switch (fbType) {
                    case 'HELPFUL': metrics.feedback.helpful++; break;
                    case 'NOT_HELPFUL': metrics.feedback.notHelpful++; break;
                    case 'UNCLEAR': metrics.feedback.unclear++; break;
                    case 'WRONG': metrics.feedback.wrong++; break;
                    case 'NOT_RELEVANT': metrics.feedback.notRelevant++; break;
                    case 'TOO_EASY': metrics.feedback.tooEasy++; break;
                    case 'TOO_HARD': metrics.feedback.tooHard++; break;
                    case 'GOOD_TIMING': metrics.feedback.goodTiming++; break;
                    case 'BAD_TIMING': metrics.feedback.badTiming++; break;
                    default: break;
                }
            }
        }
    
        var total = metrics.total || 1;
        metrics.acceptanceRate = Math.round((metrics.byStatus.accepted / total) * 100);
        metrics.completionRate = Math.round((metrics.byStatus.completed / total) * 100);
        var helpfulTotal = metrics.feedback.helpful + metrics.feedback.notHelpful || 1;
        metrics.helpfulRate = Math.round((metrics.feedback.helpful / helpfulTotal) * 100);
    
        // 🔥 计算 governance 指标
        metrics.governance.totalOverrides = metrics.byStatus.overridden;
        metrics.governance.totalChallenges = metrics.byStatus.challenged;
        metrics.governance.overrideRate = Math.round((metrics.governance.totalOverrides / total) * 100);
        metrics.governance.challengeRate = Math.round((metrics.governance.totalChallenges / total) * 100);
    
        return metrics;
    }

    // ============================================================
    // 🔥 Part 142: Recommendation Governance
    // ============================================================

    function getRecommendationGovernance(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return { error: 'Recommendation not found', recommendationId: recommendationId };
        }
    
        var adapter = window.LawAIApp?.LearningJourneyAdapter;
        if (!adapter || typeof adapter.generateGovernanceReport !== 'function') {
            return {
                recommendationId: recommendationId,
                governance: {
                    allowed: true,
                    reason: 'default_allowed',
                    explanation: 'No governance engine available, default allowed'
                },
                summary: '⚠️ Governance engine unavailable'
            };    
        }
    
        var decision = {
            type: 'recommendation',
            actionType: rec.targetType || 'recommendation',
            authority: 'adaptive',
            constraints: rec.metadata?.constraints || []
        };
    
        var context = {
            evidence: rec.metadata?.evidence || {},
            candidates: [rec],
            constraints: rec.metadata?.constraints || []
        };
    
        return adapter.generateGovernanceReport(decision, context);
    }

    // ============================================================
    // 🔥 Part 144: Learning Impact Interpretation
    // ============================================================

    /**
     * 解释 Recommendation 的学习影响
     * @param {string} recommendationId - 推荐 ID
     * @param {Object} context - 上下文
     * @returns {Object} 学习影响解释
     */
    function interpretLearningImpact(recommendationId, context) {
        context = context || _getAdaptiveContext();
    
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return {
                success: false,
                error: 'Recommendation not found',
                impact: null
            };
        }
    
        // 1. 获取 outcome
        var outcome = getRecommendationOutcome(recommendationId);
        if (!outcome) {
            return {
                success: false,
                error: 'No outcome found for recommendation',
                impact: null
            };
        }
    
        // 2. 获取相关学习状态变化
        var targetId = rec.targetId;
        var beforeState = rec.metadata?.stateBefore || null;
        var afterState = _getCurrentState(targetId, context);
    
        // 3. 判断影响
        var impact = _determineImpact(beforeState, afterState, outcome, context);
    
        return {
            success: true,
            impact: impact,
            recommendationId: recommendationId,
            targetId: targetId,
            interpretationVersion: '1.0.0',
            interpretedAt: Date.now()
        };
    }

    /**
     * 确定学习影响
     * @private
     */
    function _determineImpact(beforeState, afterState, outcome, context) {
        var impact = {
            category: 'unknown',  // positive | negative | no_change | insufficient_evidence | conflicting
            confidence: 'low',
            evidence: [],
            reason: 'insufficient_evidence',
            temporalContext: null
        };
    
        // 1. 检查 outcome 状态
        var outcomeStatus = outcome.status || 'UNKNOWN';
    
        // 如果推荐没有被接受或完成，无法评估学习影响
        if (outcomeStatus !== 'COMPLETED' && outcomeStatus !== 'ACCEPTED' && outcomeStatus !== 'STARTED') {
            impact.category = 'insufficient_evidence';
            impact.reason = 'recommendation_not_completed';
            impact.confidence = 'low';
            impact.evidence.push({ type: 'outcome_status', value: outcomeStatus });
            return impact;
        }
    
        // 2. 检查是否有前后状态
        if (!beforeState || !afterState) {
            impact.category = 'insufficient_evidence';
            impact.reason = 'missing_state_comparison';
            impact.confidence = 'low';
            impact.evidence.push({ type: 'has_before', value: !!beforeState });
            impact.evidence.push({ type: 'has_after', value: !!afterState });
            return impact;
        }
    
        // 3. 比较前后状态 (使用 mastery level)
        var beforeLevel = beforeState.masteryLevel || 0;
        var afterLevel = afterState.masteryLevel || 0;
        var diff = afterLevel - beforeLevel;
        
        // 4. 结合 outcome 中的证据
        var hasEvidenceRefs = outcome.evidenceRefs && outcome.evidenceRefs.length > 0;
        var hasFeedback = outcome.learnerFeedbackRefs && outcome.learnerFeedbackRefs.length > 0;
        
        // 5. 判断影响类别
        if (diff > 0.15) {
            impact.category = 'positive';
            impact.confidence = hasEvidenceRefs ? 'medium' : 'low';
            impact.reason = 'observable_mastery_improvement';
            impact.evidence.push({ type: 'mastery_change', before: beforeLevel, after: afterLevel, diff: diff });
        } else if (diff < -0.15) {
            impact.category = 'negative';
            impact.confidence = hasEvidenceRefs ? 'medium' : 'low';
            impact.reason = 'observable_mastery_decline';
            impact.evidence.push({ type: 'mastery_change', before: beforeLevel, after: afterLevel, diff: diff });
        } else if (Math.abs(diff) <= 0.15 && beforeLevel > 0) {
            impact.category = 'no_change';
            impact.confidence = 'medium';
            impact.reason = 'mastery_stable_no_significant_change';
            impact.evidence.push({ type: 'mastery_change', before: beforeLevel, after: afterLevel, diff: diff });
        } else {
            impact.category = 'insufficient_evidence';
            impact.confidence = 'low';
            impact.reason = 'insufficient_mastery_evidence';
            impact.evidence.push({ type: 'mastery_change', before: beforeLevel, after: afterLevel, diff: diff });
        }
    
        // 6. 检查是否有冲突证据 (结合 outcome metadata)
        if (outcome.metadata && outcome.metadata.conflictingEvidence) {
            impact.category = 'conflicting';
            impact.reason = 'conflicting_evidence_detected';
            impact.evidence.push({ type: 'conflicting', details: outcome.metadata.conflictingEvidence });
        }
    
        // 7. 时间上下文
        if (outcome.timestamp) {
            impact.temporalContext = {
                outcomeAt: outcome.timestamp,
                recommendationAt: rec.createdAt,
                timeSinceRecommendation: (outcome.timestamp - rec.createdAt) / (24 * 60 * 60 * 1000) + ' days'
            };
        }
    
        return impact;
    }    

    /**
     * 获取当前状态 (用于比较)
     * @private
     */
    function _getCurrentState(targetId, context) {
        try {
            var mastery = window.LawAIApp.MasteryEngine;
            if (mastery) {
                var record = mastery.getMastery(targetId);
                if (record) {
                    return {
                        masteryLevel: record.masteryLevel || 0,
                        state: record.state || 'UNASSESSED',
                        confidence: record.confidence || 0,
                        evidenceCount: record.evidenceCount || 0
                    };
                }
            }
        } catch (e) {}
    
        return null;
    }

    /**
     * 获取 Impact 摘要 (用于 Dashboard)
     */
    function getImpactSummary(recommendationId) {
        var result = interpretLearningImpact(recommendationId);
        if (!result.success) {
            return {
                recommendationId: recommendationId,
                hasImpact: false,
                message: result.error || 'No impact data available'
            };
        }
    
        var impact = result.impact;
        return {
            recommendationId: recommendationId,
            hasImpact: true,
            category: impact.category,
            confidence: impact.confidence,
            reason: impact.reason,
            evidence: impact.evidence.slice(0, 5),
            temporalContext: impact.temporalContext,
            interpretedAt: result.interpretedAt
        };
    }

    function isRecommendationCooldown(targetId, cooldownMs) {
        cooldownMs = cooldownMs || 3600000;
    
        var outcomes = getOutcomeHistory({ targetId: targetId });
        if (outcomes.length === 0) return false;
    
        var recent = outcomes.filter(function(o) {
            return o.status === 'DISMISSED' || o.status === 'SKIPPED' || o.status === 'NOT_RELEVANT';
        });
    
        if (recent.length === 0) return false;
    
        var latest = recent[0];
        var timeSince = Date.now() - latest.timestamp;
    
        return timeSince < cooldownMs;
    }

    // ============================================================
    // 🔥 Part 143: Conflict Detection
    // ============================================================

    function detectCandidateConflicts(candidates, context) {
        if (!candidates || candidates.length < 2) {
            return { hasConflicts: false, conflicts: [] };
        }
        
        var conflicts = [];
    
        // 1. 检测目标冲突 (同一个 target 的不同推荐)
        var targetMap = {};
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            if (!targetMap[c.targetId]) targetMap[c.targetId] = [];
            targetMap[c.targetId].push(c);
        }
        for (var targetId in targetMap) {
            if (targetMap[targetId].length > 1) {
                conflicts.push({
                    type: 'DUPLICATE_TARGET',
                    targetId: targetId,
                    candidates: targetMap[targetId],
                    description: 'Multiple recommendations for the same target'
                });
            }
        }
    
        // 2. 检测信号冲突
        var signalTypes = {};
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            var signals = c.signals || [];
            for (var j = 0; j < signals.length; j++) {
                if (!signalTypes[signals[j]]) signalTypes[signals[j]] = [];
                signalTypes[signals[j]].push(c);
            }
        }
    
        // 如果同一个信号支持多个不同的候选，可能存在冲突
        for (var signal in signalTypes) {
            if (signalTypes[signal].length > 1) {
                var uniqueTargets = {};
                for (var i = 0; i < signalTypes[signal].length; i++) {
                    uniqueTargets[signalTypes[signal][i].targetId] = true;
                }
                if (Object.keys(uniqueTargets).length > 1) {
                    conflicts.push({
                        type: 'SIGNAL_CONFLICT',
                        signal: signal,
                        candidates: signalTypes[signal],
                        description: 'Same signal supports multiple different targets'
                    });
                }
            }
        }
    
        // 3. 检测类型冲突 (复习 vs 新内容)
        var hasReview = false;
        var hasNew = false;
        var reviewCandidates = [];
        var newCandidates = [];
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            if (c.targetType === 'REVIEW' || c.signals.indexOf('REVIEW_DUE') !== -1) {
                hasReview = true;
                reviewCandidates.push(c);
            } else if (c.targetType === 'LESSON' || c.source === 'CURRENT_PATH') {
                hasNew = true;
                newCandidates.push(c);
            }
        }
        if (hasReview && hasNew) {
            conflicts.push({
                type: 'REVIEW_VS_NEW',
                reviewCandidates: reviewCandidates,
                newCandidates: newCandidates,
                description: 'Review recommendation conflicts with new content progression'
            });
        }
    
        return {
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        };
    }

    // ============================================================
    // 🔥 Part 143: Candidate Arbitration
    // ============================================================

    function arbitrateCandidates(candidates, context) {
        context = context || _getAdaptiveContext();
    
        if (!candidates || candidates.length === 0) {
            return {
                primary: null,
                alternatives: [],
                selectionRationale: 'No candidates available',
                comparisonContext: context,
                constraints: [],
                conflicts: { hasConflicts: false, conflicts: [] },
                tradeoffs: [],
                confidence: 'low',
                uncertainty: 'high',
                arbitrationVersion: '1.0.0',
                generatedAt: Date.now()
            };
        }
    
        // 1. 检测冲突
        var conflictResult = detectCandidateConflicts(candidates, context);
    
        // 2. 排序候选
        var ranked = _rankCandidates(candidates, context, {});
    
        // 3. 选择主候选
        var primary = ranked.length > 0 ? ranked[0] : null;
        var alternatives = ranked.length > 1 ? ranked.slice(1) : [];
    
        // 4. 生成选择理由
        var selectionRationale = _generateSelectionRationale(primary, alternatives, conflictResult, context);
    
        // 5. 生成权衡
        var tradeoffs = _generateTradeoffs(primary, alternatives, context);
    
        // 6. 计算置信度
        var confidence = _calculateArbitrationConfidence(primary, alternatives, conflictResult, context);
        var uncertainty = _calculateArbitrationUncertainty(primary, alternatives, conflictResult, context);
    
        return {
            primary: primary,
            alternatives: alternatives,
            selectionRationale: selectionRationale,
            comparisonContext: context,
            constraints: _getConstraints(primary, context),
            conflicts: conflictResult,
            tradeoffs: tradeoffs,
            confidence: confidence,
            uncertainty: uncertainty,
            arbitrationVersion: '1.0.0',
            generatedAt: Date.now()
        };
    }

    function _generateSelectionRationale(primary, alternatives, conflictResult, context) {
        if (!primary) {
            return 'No candidate could be selected as primary.';
        }
    
        var rationale = {
            primaryReason: primary.signals && primary.signals.length > 0 ? primary.signals[0] : 'UNKNOWN',
            supportingReasons: primary.signals && primary.signals.length > 1 ? primary.signals.slice(1) : [],
            whyPrimary: '',
            whyNotAlternatives: [],
            evidenceSummary: []
        };
    
        // 解释为什么选 primary
        var reasonMap = {
            'LOW_MASTERY': 'Addresses a knowledge gap that needs reinforcement',
            'REVIEW_DUE': 'Due for review to maintain retention',
            'GOAL_ALIGNED': 'Aligned with your current learning goal',
            'CURRENT_COURSE': 'Part of your current learning path',
            'PATH_CONTINUITY': 'Continues your learning progression',
            'KNOWLEDGE_GAP': 'Addresses a specific knowledge gap',
            'PREREQUISITE_BLOCKED': 'Required before proceeding'
        };
        var primarySignal = primary.signals && primary.signals.length > 0 ? primary.signals[0] : 'UNKNOWN';
        rationale.whyPrimary = reasonMap[primarySignal] || 'Selected as the strongest current option.';
    
        // 解释为什么 alternatives 不是 primary
        for (var i = 0; i < Math.min(alternatives.length, 2); i++) {
            var alt = alternatives[i];
            var altSignal = alt.signals && alt.signals.length > 0 ? alt.signals[0] : 'UNKNOWN';
            rationale.whyNotAlternatives.push({
                candidateId: alt.targetId,
                reason: reasonMap[altSignal] || 'Other option considered',
                whyNot: alt.priority < primary.priority ? 'Lower priority score' : 'Less direct relevance'
            });
        }
    
        // 证据摘要
        if (primary.masteryLevel !== undefined) {
            rationale.evidenceSummary.push({
                type: 'MASTERY',
                value: primary.masteryLevel,
                description: 'Mastery level: ' + Math.round(primary.masteryLevel * 100) + '%'
            });
        }
    
        return rationale;
    }

    function _generateTradeoffs(primary, alternatives, context) {
        var tradeoffs = [];
    
        if (!primary) return tradeoffs;
    
        // 如果选择 primary，放弃了什么？
        if (alternatives.length > 0) {
            var alt = alternatives[0];
            tradeoffs.push({
                selected: primary.targetId,
                alternative: alt.targetId,
                gained: primary.priority > alt.priority ? 'Higher priority based on current evidence' : 'Better fit for current context',
                lost: primary.priority < alt.priority ? 'May not address all learning signals' : 'Alternative may offer different perspective'
            });    
        }
    
        // 如果 primary 是复习，权衡进度
        if (primary.signals && primary.signals.indexOf('REVIEW_DUE') !== -1) {
            tradeoffs.push({
                type: 'REVIEW_PROGRESS_TRADE',
                description: 'Reviewing now reinforces retention but slows progress on new content.',
                benefit: 'Strengthens long-term retention',
                cost: 'Takes time from new content'
            });
        }
    
        return tradeoffs;
    }

    function _calculateArbitrationConfidence(primary, alternatives, conflictResult, context) {
        if (!primary) return 'low';
    
        var score = 0;
        var maxScore = 0;
    
        // 1. 优先级 (0-40)
        maxScore += 40;
        score += Math.min(40, (primary.priority || 0) * 0.4);
    
        // 2. 冲突情况 (-20)
        if (conflictResult.hasConflicts) {
            maxScore += 20;
            // 如果有冲突，降低置信度
            var conflictPenalty = Math.min(20, conflictResult.conflicts.length * 5);
            score = Math.max(0, score - conflictPenalty);
        }
    
        // 3. 替代选项数量 (0-20)
        maxScore += 20;
        if (alternatives.length > 0) {
            // 如果有多个好的替代，置信度降低 (因为选择不是唯一的)
            var altPenalty = Math.min(15, alternatives.length * 3);
            score = Math.max(0, score - altPenalty);
        } else {
            score += 10;
        }
    
        // 4. 证据强度 (0-20)
        maxScore += 20;
        if (primary.masteryLevel !== undefined) {
            var evidenceStrength = Math.abs(primary.masteryLevel - 0.5) * 2;
            score += Math.min(20, evidenceStrength * 20);
        }
    
        var ratio = maxScore > 0 ? score / maxScore : 0;
    
        if (ratio >= 0.7) return 'high';
        if (ratio >= 0.4) return 'medium';
        return 'low';
    }    

    function _calculateArbitrationUncertainty(primary, alternatives, conflictResult, context) {
        if (!primary) return 'high';
    
        var uncertaintyScore = 0;
    
        // 1. 冲突增加不确定性
        if (conflictResult.hasConflicts) {
            uncertaintyScore += conflictResult.conflicts.length * 0.2;
        }
    
        // 2. 多个替代增加不确定性
        if (alternatives.length > 2) {
            uncertaintyScore += 0.2;
        } else if (alternatives.length > 0) {
            uncertaintyScore += 0.1;
        }
    
        // 3. 低置信度增加不确定性
        var confidence = _calculateArbitrationConfidence(primary, alternatives, conflictResult, context);
        if (confidence === 'low') uncertaintyScore += 0.3;
        if (confidence === 'medium') uncertaintyScore += 0.1;
        
        if (uncertaintyScore >= 0.6) return 'high';
        if (uncertaintyScore >= 0.3) return 'medium';
        return 'low';
    }    

    function _getConstraints(primary, context) {
        var constraints = [];
        
        // 检查硬约束
        if (primary && primary.targetType === 'PREREQUISITE') {
            constraints.push({
                type: 'hard',
                source: 'curriculum',
                description: 'This is a prerequisite requirement'
            });
        }
    
        return constraints;
    }

    // ============================================================
    // REASON GENERATION
    // ============================================================

    function _generateReason(candidate, context) {
        var signals = candidate.signals || [];
        var targetId = candidate.targetId;

        if (signals.indexOf('REVIEW_DUE') !== -1) {
            return 'Review this concept because it is due for reinforcement.';
        }
        if (signals.indexOf('LOW_MASTERY') !== -1) {
            var level = candidate.masteryLevel || 0;
            if (level < 0.2) {
                return 'This skill needs attention. Practice the fundamentals to build a stronger foundation.';
            }
            return 'Practice this skill because recent performance shows developing understanding.';
        }
        if (signals.indexOf('PREREQUISITE_BLOCKED') !== -1) {
            return 'Learn this first — it is required before you can continue.';
        }
        if (signals.indexOf('GOAL_ALIGNED') !== -1) {
            return 'This content is aligned with your current learning goals.';
        }
        if (signals.indexOf('CURRENT_COURSE') !== -1) {
            return 'Continue your current course. This is the next logical step.';
        }
        if (signals.indexOf('FALLBACK') !== -1) {
            return 'Explore this course to begin your learning journey.';
        }

        return 'Recommended based on your learning progress.';
    }

    // ============================================================
    // RECOMMENDATION ACTIONS
    // ============================================================

    function acceptRecommendation(id) {
        return _updateStatus(id, STATES.ACCEPTED);
    }

    function completeRecommendation(id) {
        return _updateStatus(id, STATES.COMPLETED);
    }

    function dismissRecommendation(id) {
        return _updateStatus(id, STATES.DISMISSED);
    }

    function skipRecommendation(id) {
        return _updateStatus(id, STATES.SKIPPED);
    }

    function expireRecommendation(id) {
        return _updateStatus(id, STATES.EXPIRED);
    }

    function _updateStatus(id, status) {
        if (!id) return null;
        var store = _getStore();
        var rec = store[id];
        if (!rec) return null;

        rec.status = status;
        rec.updatedAt = Date.now();
        store[id] = rec;
        _saveStore(store);

        _emit('RECOMMENDATION_' + status, {
            id: id,
            targetId: rec.targetId,
            status: status
        });

        return rec;
    }

    // ============================================================
    // REFRESH
    // ============================================================

    function refreshRecommendations(context) {
        _cleanupExpired();
        return generateRecommendations(context);
    }

    function _cleanupExpired() {
        var store = _getStore();
        var now = Date.now();
        var count = 0;

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var rec = store[key];
            if (rec.status === STATES.PENDING && rec.expiresAt && rec.expiresAt < now) {
                rec.status = STATES.EXPIRED;
                rec.updatedAt = now;
                store[key] = rec;
                count++;
            }
        }

        if (count > 0) {
            _saveStore(store);
            console.log('[RecommendationEngine] 🧹 Expired ' + count + ' recommendations');
        }
    }

    // ============================================================
    // HELPERS: Context
    // ============================================================

    function _getCurrentCourseId() {
        var adapter = window.LawAIApp?.LearningJourneyAdapter;
        if (adapter && typeof adapter.getState === 'function') {
            var state = adapter.getState();
            return state.currentCourseId || null;
        }
        return null;
    }

    function _findNextLesson(courseId) {
        var adapter = window.LawAIApp?.LearningJourneyAdapter;
        if (adapter && typeof adapter.getContinueLearning === 'function') {
            var continueData = adapter.getContinueLearning();
            if (continueData && continueData.lessonId) {
                return continueData.lessonId;
            }
        }
        return null;
    }

    function _getActiveGoals() {
        var goalEngine = window.LawAIApp?.GoalEngine;
        if (goalEngine && typeof goalEngine.getActiveGoals === 'function') {
            return goalEngine.getActiveGoals();
        }
        return [];
    }

    function _extractGoalTopics(goals) {
        var topics = [];
        for (var i = 0; i < goals.length; i++) {
            var goal = goals[i];
            if (goal.topics) {
                topics = topics.concat(goal.topics);
            }
            if (goal.title) {
                topics.push(goal.title);
            }
            if (goal.targetId) {
                topics.push(goal.targetId);
            }
        }
        return topics.slice(0, 10);
    }

    function _getFallbackRecommendation() {
        var schoolRegistry = window.LawAIApp?.SchoolRegistry;
        if (schoolRegistry && typeof schoolRegistry.getAll === 'function') {
            var schools = schoolRegistry.getAll();
            if (schools && schools.length > 0) {
                return {
                    targetId: schools[0].id,
                    targetType: TARGET_TYPES.COURSE
                };
            }
        }
        return {
            targetId: 'school-science',
            targetType: TARGET_TYPES.COURSE
        };
    }

    // ============================================================
    // PUBLIC: Status
    // ============================================================

    function getStatus() {
        var store = _getStore();
        var records = [];
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            records.push(store[key]);
        }

        var pending = records.filter(function(r) { return r.status === STATES.PENDING; });
        var active = records.filter(function(r) {
            return r.status === STATES.PENDING || r.status === STATES.ACCEPTED;
        });

        return {
            version: '2.0.0',
            initialized: true,
            schemaVersion: _schemaVersion,
            totalRecords: records.length,
            pendingCount: pending.length,
            activeCount: active.length,
            states: {
                pending: pending.length,
                accepted: records.filter(function(r) { return r.status === STATES.ACCEPTED; }).length,
                completed: records.filter(function(r) { return r.status === STATES.COMPLETED; }).length,
                dismissed: records.filter(function(r) { return r.status === STATES.DISMISSED; }).length,
                expired: records.filter(function(r) { return r.status === STATES.EXPIRED; }).length,
                skipped: records.filter(function(r) { return r.status === STATES.SKIPPED; }).length
            },
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ============================================================
    // 🔥 Part 143: Public Arbitration API
    // ============================================================

    function arbitrateRecommendations(context, options) {
        options = options || {};
        context = context || _getAdaptiveContext();
    
        // 1. 生成候选
        var candidates = _discoverCandidates(context, options);
        if (!candidates || candidates.length === 0) {
            return {
                success: false,
                message: 'No candidates available',
                arbitration: null
            };    
        }
    
        // 2. 过滤候选
        var filtered = _filterCandidates(candidates, context, options);
        if (!filtered || filtered.length === 0) {
            return {
                success: false,
                message: 'No candidates passed validation',
                arbitration: null
            };
        }
    
        // 3. 仲裁
        var arbitration = arbitrateCandidates(filtered, context);
    
        // 4. 触发事件
        _emit('RECOMMENDATION_ARBITRATED', {
            primary: arbitration.primary ? arbitration.primary.targetId : null,
            alternativeCount: arbitration.alternatives ? arbitration.alternatives.length : 0,
            confidence: arbitration.confidence,
            arbitrationVersion: arbitration.arbitrationVersion,
            generatedAt: arbitration.generatedAt
        });
    
        return {
            success: true,
            arbitration: arbitration
        };
    }

    // ============================================================
    // 🔥 Part 145: Longitudinal Pattern Interpretation
    // ============================================================

    /**
     * Pattern 数据结构
     */
    function createPattern(params) {
        return {
            id: 'pattern_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: params.type || 'unknown',
            description: params.description || '',
            scope: params.scope || {},          // { scopeType, scopeId }
        
            // 证据
            supportingEvidence: params.supportingEvidence || [],
            conflictingEvidence: params.conflictingEvidence || [],
            evidenceRefs: params.evidenceRefs || [],
            
            // 时间
            firstObserved: params.firstObserved || Date.now(),
            lastObserved: params.lastObserved || Date.now(),
            observationCount: params.observationCount || 0,
            temporalWindow: params.temporalWindow || null,
            freshness: params.freshness || 1.0,
        
            // 解释
            interpretation: params.interpretation || null,
            confidence: params.confidence || 'low',
            status: params.status || 'emerging',  // emerging | observed | established | weakening | stale | contradicted | inactive
            
            // 自适应信号
            adaptiveSignal: params.adaptiveSignal || null,
            
            // 版本控制
            version: params.version || '1.0.0',
            createdAt: params.createdAt || Date.now(),
            updatedAt: params.updatedAt || Date.now(),
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 检测和更新 Patterns
     * @param {Object} context - 上下文
     * @returns {Array} 更新后的 patterns
     */
    function detectPatterns(context) {
        context = context || _getAdaptiveContext();
    
        // 1. 获取历史 outcome
        var outcomes = getOutcomeHistory({ limit: 100 });
        if (!outcomes || outcomes.length === 0) {
            return [];
        }
    
        var patterns = [];
        var store = _getStore();
        var existingPatterns = store._patterns || [];
    
        // 2. 检测重复延迟模式
        var deferralPattern = _detectRepeatedDeferral(outcomes, context);
        if (deferralPattern) {
            patterns.push(deferralPattern);
        }
    
        // 3. 检测重复接受模式
        var acceptancePattern = _detectRepeatedAcceptance(outcomes, context);
        if (acceptancePattern) {
            patterns.push(acceptancePattern);
        }
    
        // 4. 检测重复拒绝模式
        var rejectionPattern = _detectRepeatedRejection(outcomes, context);
        if (rejectionPattern) {
            patterns.push(rejectionPattern);
        }
    
        // 5. 检测重复替代选择模式
        var alternativePattern = _detectRepeatedAlternative(outcomes, context);
        if (alternativePattern) {
            patterns.push(alternativePattern);
        }
    
        // 6. 检测重复成功模式
        var successPattern = _detectRepeatedSuccess(outcomes, context);
        if (successPattern) {
            patterns.push(successPattern);
        }
    
        // 7. 检测重复无影响模式
        var noImpactPattern = _detectRepeatedNoImpact(outcomes, context);
        if (noImpactPattern) {
            patterns.push(noImpactPattern);
        }
    
        // 8. 检测重复放弃模式
        var abandonmentPattern = _detectRepeatedAbandonment(outcomes, context);
        if (abandonmentPattern) {
            patterns.push(abandonmentPattern);
        }
    
        // 9. 更新现有 patterns (合并)
        var updatedPatterns = _mergePatterns(existingPatterns, patterns);
        
        // 10. 应用新鲜度衰减
        updatedPatterns = _applyPatternDecay(updatedPatterns);
    
        // 11. 保存
        store._patterns = updatedPatterns;
        _saveStore(store);
    
        return updatedPatterns;
    }

    /**
     * 检测重复延迟模式
     * @private
     */
    function _detectRepeatedDeferral(outcomes, context) {
        var deferrals = outcomes.filter(function(o) {
            return o.status === 'DEFERRED' || o.status === 'SKIPPED';
        });
    
        if (deferrals.length < 2) return null;
    
        var recentDeferrals = deferrals.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentDeferrals.length < 2) return null;
    
        return createPattern({
            type: 'REPEATED_DEFERRAL',
            description: 'Learner has repeatedly deferred recommendations.',
            observationCount: recentDeferrals.length,
            firstObserved: recentDeferrals[recentDeferrals.length - 1].timestamp,
            lastObserved: recentDeferrals[0].timestamp,
            supportingEvidence: recentDeferrals.map(function(o) { return o.outcomeId; }),
            confidence: recentDeferrals.length >= 4 ? 'medium' : 'low',
            status: recentDeferrals.length >= 4 ? 'established' : 'emerging',
            interpretation: 'May benefit from lower-friction entry points.',
            adaptiveSignal: {
                type: 'CONSIDER_LOWER_FRICTION',
                scope: 'recommendation',
                confidence: recentDeferrals.length >= 4 ? 'medium' : 'low',
                description: 'Consider alternative formats when equivalent learning objectives can be preserved.'
            }
        });
    }

    /**
     * 检测重复接受模式
     * @private
     */
    function _detectRepeatedAcceptance(outcomes, context) {
        var acceptances = outcomes.filter(function(o) {
            return o.status === 'ACCEPTED' || o.status === 'COMPLETED';
        });
    
        if (acceptances.length < 3) return null;
        
        var recentAcceptances = acceptances.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentAcceptances.length < 2) return null;
    
        // 按 targetType 分组
        var byType = {};
        for (var i = 0; i < recentAcceptances.length; i++) {
             var o = recentAcceptances[i];
             var type = o.targetType || 'UNKNOWN';
             if (!byType[type]) byType[type] = [];
             byType[type].push(o);
        }
    
        var maxType = null;
        var maxCount = 0;
        for (var type in byType) {
            if (byType[type].length > maxCount) {
                maxCount = byType[type].length;
                maxType = type;
            }
        }
    
        if (maxCount < 2) return null;
    
        return createPattern({
            type: 'REPEATED_ACCEPTANCE',
            description: 'Learner has repeatedly accepted ' + maxType + ' recommendations.',
            observationCount: maxCount,
            firstObserved: byType[maxType][byType[maxType].length - 1].timestamp,
            lastObserved: byType[maxType][0].timestamp,
            supportingEvidence: byType[maxType].map(function(o) { return o.outcomeId; }),
            confidence: maxCount >= 3 ? 'medium' : 'low',
            status: maxCount >= 4 ? 'established' : 'observed',
            interpretation: maxType + ' recommendations have been consistently accepted.',
            adaptiveSignal: {
                type: 'CONSIDER_' + maxType,
                scope: maxType,
                confidence: maxCount >= 3 ? 'medium' : 'low',
                description: 'Consider ' + maxType + ' as a candidate type when appropriate.'
            }
        });    
    }

    /**
     * 检测重复拒绝模式
     * @private
     */
    function _detectRepeatedRejection(outcomes, context) {
        var rejections = outcomes.filter(function(o) {
            return o.status === 'DISMISSED';
        });
    
        if (rejections.length < 2) return null;
    
        var recentRejections = rejections.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentRejections.length < 2) return null;
        
        // 按 targetType 分组
        var byType = {};
        for (var i = 0; i < recentRejections.length; i++) {
             var o = recentRejections[i];
             var type = o.targetType || 'UNKNOWN';
             if (!byType[type]) byType[type] = [];
             byType[type].push(o);
        }
    
        var maxType = null;
        var maxCount = 0;
        for (var type in byType) {
             if (byType[type].length > maxCount) {
                 maxCount = byType[type].length;
                 maxType = type;
            }
        }
    
        if (maxCount < 2) return null;
    
        return createPattern({
            type: 'REPEATED_REJECTION',
            description: 'Learner has repeatedly rejected ' + maxType + ' recommendations.',
            observationCount: maxCount,
            firstObserved: byType[maxType][byType[maxType].length - 1].timestamp,
            lastObserved: byType[maxType][0].timestamp,
            supportingEvidence: byType[maxType].map(function(o) { return o.outcomeId; }),
            confidence: maxCount >= 3 ? 'medium' : 'low',
            status: maxCount >= 4 ? 'established' : 'observed',
            interpretation: maxType + ' recommendations may not be a good fit currently.',
            adaptiveSignal: {
                type: 'CONSIDER_ALTERNATIVE_TO_' + maxType,
                scope: maxType,
                confidence: maxCount >= 3 ? 'medium' : 'low',
                description: 'Consider alternative types to ' + maxType + ' when appropriate.'
            }
        });
    }

    /**
     * 检测重复替代选择模式
     * @private
     */
    function _detectRepeatedAlternative(outcomes, context) {
        var alternatives = outcomes.filter(function(o) {
            return o.status === 'ALTERNATIVE_SELECTED';
        });
    
        if (alternatives.length < 2) return null;
        
        var recentAlternatives = alternatives.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentAlternatives.length < 2) return null;
    
        return createPattern({
            type: 'REPEATED_ALTERNATIVE',
            description: 'Learner has repeatedly selected alternatives to recommendations.',
            observationCount: recentAlternatives.length,
            firstObserved: recentAlternatives[recentAlternatives.length - 1].timestamp,
            lastObserved: recentAlternatives[0].timestamp,
            supportingEvidence: recentAlternatives.map(function(o) { return o.outcomeId; }),
            confidence: recentAlternatives.length >= 3 ? 'medium' : 'low',
            status: recentAlternatives.length >= 4 ? 'established' : 'observed',
            interpretation: 'May prefer to choose their own learning path.',
            adaptiveSignal: {
                type: 'PRESERVE_ALTERNATIVES',
                scope: 'recommendation',
                confidence: recentAlternatives.length >= 3 ? 'medium' : 'low',
                description: 'Continue to present meaningful alternatives with primary recommendations.'
            }
        });
    }

    /**
     * 检测重复成功模式
     * @private
     */
    function _detectRepeatedSuccess(outcomes, context) {
        // 需要结合 Learning Impact
        var successes = outcomes.filter(function(o) {
            return o.status === 'COMPLETED' && o.metadata && o.metadata.positiveImpact === true;
        });    
    
        if (successes.length < 2) return null;
    
        var recentSuccesses = successes.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentSuccesses.length < 2) return null;
    
        // 按 targetType 分组
        var byType = {};
        for (var i = 0; i < recentSuccesses.length; i++) {
            var o = recentSuccesses[i];
            var type = o.targetType || 'UNKNOWN';
            if (!byType[type]) byType[type] = [];
            byType[type].push(o);
        }
    
        var maxType = null;
        var maxCount = 0;
        for (var type in byType) {
            if (byType[type].length > maxCount) {
                maxCount = byType[type].length;
                maxType = type;
            }
        }
    
        if (maxCount < 2) return null;
    
        return createPattern({
            type: 'REPEATED_SUCCESS',
            description: 'Learner has repeatedly succeeded with ' + maxType + ' recommendations.',
            observationCount: maxCount,
            firstObserved: byType[maxType][byType[maxType].length - 1].timestamp,
            lastObserved: byType[maxType][0].timestamp,
            supportingEvidence: byType[maxType].map(function(o) { return o.outcomeId; }),
            confidence: maxCount >= 3 ? 'medium' : 'low',
            status: maxCount >= 4 ? 'established' : 'observed',
            interpretation: maxType + ' recommendations have shown positive outcomes.',
            adaptiveSignal: {
                type: 'FAVOR_' + maxType,
                scope: maxType,
                confidence: maxCount >= 3 ? 'medium' : 'low',
                description: 'Consider ' + maxType + ' as a preferred candidate type when appropriate.'
            }
        });
    }

    /**
     * 检测重复无影响模式
     * @private
     */
    function _detectRepeatedNoImpact(outcomes, context) {
        var noImpacts = outcomes.filter(function(o) {
            return o.status === 'COMPLETED' && o.metadata && o.metadata.positiveImpact !== true;
        });
    
        if (noImpacts.length < 3) return null;
    
        var recentNoImpacts = noImpacts.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentNoImpacts.length < 2) return null;
    
        // 按 targetType 分组
        var byType = {};
        for (var i = 0; i < recentNoImpacts.length; i++) {
            var o = recentNoImpacts[i];
            var type = o.targetType || 'UNKNOWN';
            if (!byType[type]) byType[type] = [];
            byType[type].push(o);
        }
    
        var maxType = null;
        var maxCount = 0;
        for (var type in byType) {
            if (byType[type].length > maxCount) {
                maxCount = byType[type].length;
                maxType = type;
            }
        }
    
        if (maxCount < 2) return null;
    
        return createPattern({
            type: 'REPEATED_NO_IMPACT',
            description: 'Learner has repeatedly shown no measurable impact from ' + maxType + ' recommendations.',
            observationCount: maxCount,
            firstObserved: byType[maxType][byType[maxType].length - 1].timestamp,
            lastObserved: byType[maxType][0].timestamp,
            supportingEvidence: byType[maxType].map(function(o) { return o.outcomeId; }),
            confidence: maxCount >= 3 ? 'medium' : 'low',
            status: maxCount >= 4 ? 'established' : 'observed',
            interpretation: maxType + ' recommendations may not be effectively driving learning.',
            adaptiveSignal: {
                type: 'REVIEW_' + maxType,
                scope: maxType,
                confidence: maxCount >= 3 ? 'medium' : 'low',
                description: 'Review the effectiveness of ' + maxType + ' recommendations.'
            }
        });
    }

    /**
     * 检测重复放弃模式
     * @private
     */
    function _detectRepeatedAbandonment(outcomes, context) {
        var abandonments = outcomes.filter(function(o) {
            return o.status === 'ABANDONED' || o.status === 'STARTED' && o.metadata && o.metadata.abandoned === true;
        });    
    
        if (abandonments.length < 2) return null;
    
        var recentAbandonments = abandonments.filter(function(o) {
            return (Date.now() - o.timestamp) < 30 * 24 * 60 * 60 * 1000;
        });
    
        if (recentAbandonments.length < 2) return null;
    
        // 按 targetType 分组
        var byType = {};
        for (var i = 0; i < recentAbandonments.length; i++) {
            var o = recentAbandonments[i];
            var type = o.targetType || 'UNKNOWN';
            if (!byType[type]) byType[type] = [];
            byType[type].push(o);
        }
    
        var maxType = null;
        var maxCount = 0;
        for (var type in byType) {
            if (byType[type].length > maxCount) {
                maxCount = byType[type].length;
                maxType = type;
            }
        }
    
        if (maxCount < 2) return null;
        
        return createPattern({
            type: 'REPEATED_ABANDONMENT',
            description: 'Learner has repeatedly abandoned ' + maxType + ' activities.',
            observationCount: maxCount,
            firstObserved: byType[maxType][byType[maxType].length - 1].timestamp,
            lastObserved: byType[maxType][0].timestamp,
            supportingEvidence: byType[maxType].map(function(o) { return o.outcomeId; }),
            confidence: maxCount >= 3 ? 'medium' : 'low',
            status: maxCount >= 4 ? 'established' : 'observed',
            interpretation: maxType + ' activities may have high friction.',
            adaptiveSignal: {
                type: 'REDUCE_FRICTION_FOR_' + maxType,
                scope: maxType,
                confidence: maxCount >= 3 ? 'medium' : 'low',
                description: 'Consider lower-friction entry points for ' + maxType + ' activities.'
            }
        });
    }

    /**
     * 合并现有和新的 patterns
     * @private
     */
    function _mergePatterns(existing, newPatterns) {
        var result = existing || [];
        var existingMap = {};
        
        for (var i = 0; i < result.length; i++) {
            existingMap[result[i].type + '_' + (result[i].scope?.scopeType || '')] = i;
        }
    
        for (var j = 0; j < newPatterns.length; j++) {
            var p = newPatterns[j];
            var key = p.type + '_' + (p.scope?.scopeType || '');
            var isNew = true;
            
            if (existingMap[key] !== undefined) {
                // 更新现有 pattern
                var existingIdx = existingMap[key];
                var existingP = result[existingIdx];
            
                // 合并证据
                if (p.supportingEvidence) {
                    existingP.supportingEvidence = existingP.supportingEvidence || [];
                    for (var k = 0; k < p.supportingEvidence.length; k++) {
                        if (existingP.supportingEvidence.indexOf(p.supportingEvidence[k]) === -1) {
                            existingP.supportingEvidence.push(p.supportingEvidence[k]);
                        }
                    }
                }
            
                existingP.observationCount = (existingP.observationCount || 0) + (p.observationCount || 0);
                existingP.lastObserved = p.lastObserved || existingP.lastObserved;
                existingP.updatedAt = Date.now();
            
                // 更新 status
                if (existingP.observationCount >= 4) {
                    existingP.status = 'established';
                } else if (existingP.observationCount >= 2) {
                    existingP.status = 'observed';
                }
                
                // 更新 confidence
                if (existingP.observationCount >= 4) {
                    existingP.confidence = 'medium';
                } else if (existingP.observationCount >= 2) {
                    existingP.confidence = 'low';
                }    
            
                isNew = false;
            }
        
            if (isNew) {
                result.push(p);
                existingMap[key] = result.length - 1;
            }
        }
    
        return result;
    }

    /**
     * 应用新鲜度衰减
     * @private
     */
    function _applyPatternDecay(patterns) {
        if (!patterns || patterns.length === 0) return patterns;
    
        var now = Date.now();
        
        for (var i = 0; i < patterns.length; i++) {
            var p = patterns[i];
            var daysSinceLast = (now - p.lastObserved) / (24 * 60 * 60 * 1000);
        
            // 如果超过 30 天没有新证据，开始衰减
            if (daysSinceLast > 30) {
                p.freshness = Math.max(0.1, 1 - (daysSinceLast - 30) * 0.02);
            }    
            
            // 如果超过 60 天没有新证据，标记为 stale
            if (daysSinceLast > 60) {
                p.status = 'stale';
            }    
        
            // 如果超过 90 天没有新证据，标记为 inactive
            if (daysSinceLast > 90) {
                p.status = 'inactive';
            }    
        
            p.updatedAt = now;
        }
    
        return patterns;
    }

    /**
     * 获取活跃的 Patterns
     * @param {Object} filter - 过滤条件
     * @returns {Array} 活跃的 patterns
     */
    function getActivePatterns(filter) {
        filter = filter || {};
        var store = _getStore();
        var patterns = store._patterns || [];
    
        // 过滤掉 inactive 和 stale (除非明确请求)
        var active = patterns.filter(function(p) {
            if (filter.includeInactive) return true;
            return p.status !== 'inactive' && p.status !== 'stale';
        });
    
        // 按 confidence 排序
        var order = { 'high': 0, 'medium': 1, 'low': 2 };
        active.sort(function(a, b) {
            return (order[a.confidence] || 3) - (order[b.confidence] || 3);
        });
    
        return active;
    }

    /**
     * 获取自适应信号
     * @param {Object} context - 上下文
     * @returns {Array} 自适应信号列表
     */
    function getAdaptiveSignals(context) {
        context = context || _getAdaptiveContext();
        var patterns = getActivePatterns();
        var signals = [];
    
        for (var i = 0; i < patterns.length; i++) {
            var p = patterns[i];
            if (p.adaptiveSignal) {
                signals.push({
                    sourcePatternId: p.id,
                    type: p.adaptiveSignal.type,
                    scope: p.adaptiveSignal.scope,
                    confidence: p.adaptiveSignal.confidence || p.confidence,
                    description: p.adaptiveSignal.description,
                    freshness: p.freshness || 1.0,
                    generatedAt: Date.now()
                });
            }
        }
    
        return signals;
    }

    // ============================================================
    // 🔥 Part 146: Contextual Pattern Resolution
    // ============================================================

    /**
     * 获取当前上下文
     * @returns {Object} 当前上下文
     */
    function getCurrentContext() {
        var lm = window.LawAIApp?.LearnerModel;
        var context = {
            subject: null,
            course: null,
            activityType: null,
            goal: null,
            difficulty: null,
            sessionContext: null,
            recentState: null,
            timestamp: Date.now()
        };
    
        // 从 LearnerModel 获取 context
        if (lm) {
            var learningContext = lm.getCurrentLearningContext ? lm.getCurrentLearningContext() : null;
            if (learningContext) {
                context.course = learningContext.currentCourseId || null;
                context.subject = learningContext.currentSubjectId || null;
            }
        
            // 获取最近活动状态
            var recent = lm.getRecentActivity ? lm.getRecentActivity(3) : null;
            if (recent) {
                context.recentState = {
                    hasRecentActivity: recent.hasRecentActivity || false,
                    daysSince: recent.daysSinceLastActivity || null
                };
            }
        
            // 获取目标
            var goals = lm.getActiveGoals ? lm.getActiveGoals() : null;
            if (goals && goals.length > 0) {
                context.goal = goals[0].id || goals[0].title || null;
            }    
        }
    
        return context;
    }
    
    /**
     * 计算 Context 匹配度
     * @param {Object} patternContext - Pattern 的 context
     * @param {Object} currentContext - 当前 context
     * @returns {Object} 匹配结果
     */
    function calculateContextMatch(patternContext, currentContext) {
        if (!patternContext || !currentContext) {
            return { matchLevel: 'unknown', score: 0, matchedFields: [], unmatchedFields: [] };
        }
    
        var matchedFields = [];
        var unmatchedFields = [];
        var score = 0;
        var maxScore = 0;
    
        // 定义字段权重
        var fieldWeights = {
            subject: 25,
            course: 20,
            activityType: 20,
            goal: 15,
            difficulty: 10,
            sessionContext: 10
        };
    
        // 比较每个字段
        for (var field in fieldWeights) {
            if (!fieldWeights.hasOwnProperty(field)) continue;
            maxScore += fieldWeights[field];
        
            var patternVal = patternContext[field];
            var currentVal = currentContext[field];
        
            if (patternVal === undefined || patternVal === null || currentVal === undefined || currentVal === null) {
                // 字段缺失，不计入
                continue;
            }
        
            if (patternVal === currentVal) {
                score += fieldWeights[field];
                matchedFields.push(field);
            } else {
                // 部分匹配: 如果 patternVal 是字符串且 currentVal 包含它
                if (typeof patternVal === 'string' && typeof currentVal === 'string' && 
                    currentVal.indexOf(patternVal) !== -1) {
                    score += fieldWeights[field] * 0.5;
                    matchedFields.push(field + '(partial)');
                } else {
                    unmatchedFields.push(field);
                }
            }
        }
    
        var matchRatio = maxScore > 0 ? score / maxScore : 0;
        var matchLevel = 'unknown';
    
        if (matchRatio >= 0.8) {
            matchLevel = 'high';
        } else if (matchRatio >= 0.5) {
            matchLevel = 'medium';
        } else if (matchRatio >= 0.2) {
            matchLevel = 'low';
        } else {
            matchLevel = 'none';
        }
    
        return {
            matchLevel: matchLevel,
            score: matchRatio,
            matchedFields: matchedFields,
            unmatchedFields: unmatchedFields,
            scorePercent: Math.round(matchRatio * 100)
        };
    }

    /**
     * 解析 Contextual Patterns
     * @param {Array} patterns - 所有 patterns
     * @param {Object} currentContext - 当前 context
     * @returns {Array} 解析后的 patterns
     */
    function resolveContextualPatterns(patterns, currentContext) {
        if (!patterns || patterns.length === 0) {
            return [];
        }
    
        currentContext = currentContext || getCurrentContext();
    
        var resolved = [];
    
        for (var i = 0; i < patterns.length; i++) {
            var p = patterns[i];
            var patternContext = p.context || {};
            var match = calculateContextMatch(patternContext, currentContext);
        
            // 计算新鲜度
            var daysSinceLast = (Date.now() - p.lastObserved) / (24 * 60 * 60 * 1000);
            var freshness = Math.max(0.1, 1 - (daysSinceLast / 90));
        
            // 综合适用性
            var applicability = 'unknown';
            if (match.matchLevel === 'high' && freshness > 0.5) {
                applicability = 'strong';
            } else if (match.matchLevel === 'medium' && freshness > 0.3) {
                applicability = 'moderate';
            } else if (match.matchLevel === 'low' || freshness <= 0.3) {
                applicability = 'weak';
            } else if (match.matchLevel === 'none') {
                applicability = 'none';
            }
        
            resolved.push({
                pattern: p,
                match: match,
                freshness: freshness,
                daysSinceLast: Math.round(daysSinceLast),
                applicability: applicability,
                applicable: applicability === 'strong' || applicability === 'moderate',
                priority: match.score * freshness,
                reason: _generateContextualReason(p, match, freshness)
            });
        }
    
        // 按优先级排序
        resolved.sort(function(a, b) {
            return (b.priority || 0) - (a.priority || 0);
        });
    
        return resolved;
    }

    /**
     * 生成 Contextual 解释
     * @private
     */
    function _generateContextualReason(pattern, match, freshness) {
        var parts = [];
        
        if (match.matchLevel === 'high') {
            parts.push('strong contextual match');
        } else if (match.matchLevel === 'medium') {
            parts.push('moderate contextual match');
        } else if (match.matchLevel === 'low') {
            parts.push('weak contextual match');
        } else {
            parts.push('limited context match');
        }
    
        if (match.matchedFields && match.matchedFields.length > 0) {
            parts.push('matched on: ' + match.matchedFields.join(', '));
        }
    
        if (freshness > 0.7) {
            parts.push('recent evidence');
        } else if (freshness > 0.3) {
            parts.push('somewhat recent evidence');
        } else {
            parts.push('older evidence');
        }
    
        return parts.join('; ');
    }

    /**
     * 获取 Contextual Adaptive Signals
     * @param {Object} context - 当前 context
     * @returns {Array} 信号列表
     */
    function getContextualSignals(context) {
        context = context || getCurrentContext();
    
        // 获取活跃 patterns
        var patterns = getActivePatterns({ includeInactive: false });
        if (!patterns || patterns.length === 0) {
            return [];
        }
    
        // 解析 context
        var resolved = resolveContextualPatterns(patterns, context);
        
        // 生成信号
        var signals = [];
        for (var i = 0; i < resolved.length; i++) {
            var r = resolved[i];
            if (!r.applicable) continue;
        
            var p = r.pattern;
            if (p.adaptiveSignal) {
                signals.push({
                    sourcePatternId: p.id,
                    sourcePatternType: p.type,
                    type: p.adaptiveSignal.type,
                    scope: p.adaptiveSignal.scope,
                    confidence: r.match.matchLevel === 'high' ? 'medium' : 'low',
                    applicability: r.applicability,
                    description: p.adaptiveSignal.description,
                    contextualReason: r.reason,
                    freshness: r.freshness,
                    generatedAt: Date.now()
                });
            }
        }
    
        return signals;
    }

    /**
     * 记录 Context 到 Pattern
     * @param {string} patternId - Pattern ID
     * @param {Object} context - Context
     */
    function recordPatternContext(patternId, context) {
        var store = _getStore();
        var patterns = store._patterns || [];
    
        for (var i = 0; i < patterns.length; i++) {
            if (patterns[i].id === patternId) {
                patterns[i].context = patterns[i].context || {};
                // 合并 context (保留已有，添加新的)
                for (var key in context) {
                    if (context.hasOwnProperty(key)) {
                        patterns[i].context[key] = context[key];
                    }
                }    
                patterns[i].updatedAt = Date.now();
                break;
            }
        }
    
        store._patterns = patterns;
        _saveStore(store);
    }

    /**
     * 检测 Context Drift
     * @param {Array} historicalPatterns - 历史 patterns
     * @param {Object} currentContext - 当前 context
     * @returns {Object} Drift 检测结果
     */
    function detectContextDrift(historicalPatterns, currentContext) {
        currentContext = currentContext || getCurrentContext();
        
        var result = {
            hasDrift: false,
            driftLevel: 'none',  // none | low | medium | high
            observations: [],
            recommendations: []
        };
    
        if (!historicalPatterns || historicalPatterns.length === 0) {
            return result;
        }    
    
        // 检查最新 patterns 的 context
        var recentPatterns = historicalPatterns.filter(function(p) {
            return (Date.now() - p.lastObserved) < 60 * 24 * 60 * 60 * 1000;
        });
    
        if (recentPatterns.length === 0) {
            result.hasDrift = true;
            result.driftLevel = 'high';
            result.observations.push('No recent patterns observed in current context');
            result.recommendations.push('Consider gathering more recent evidence');
            return result;
        }
    
        // 检查 context 一致性
        var contexts = recentPatterns.map(function(p) { return p.context || {}; });
        var subjectConsistency = _checkFieldConsistency(contexts, 'subject');
        var activityConsistency = _checkFieldConsistency(contexts, 'activityType');
        
        if (!subjectConsistency && contexts.length > 3) {
            result.hasDrift = true;
            result.driftLevel = 'medium';
            result.observations.push('Subject context has varied across recent patterns');
            result.recommendations.push('Consider more context-specific recommendations');
        }
    
        if (!activityConsistency && contexts.length > 3) {
            result.hasDrift = true;
            result.driftLevel = result.driftLevel === 'high' ? 'high' : 'medium';
            result.observations.push('Activity types have varied across recent patterns');
            result.recommendations.push('Maintain diverse alternatives');
        }    
    
        return result;
    }    

    /**
     * 检查字段一致性
     * @private
     */
    function _checkFieldConsistency(contexts, field) {
        if (!contexts || contexts.length === 0) return true;
    
        var values = {};
        for (var i = 0; i < contexts.length; i++) {
            var val = contexts[i][field];
            if (val !== undefined && val !== null) {
                values[val] = (values[val] || 0) + 1;
            }
        }
    
        var keys = Object.keys(values);
        if (keys.length === 0) return true;
        if (keys.length === 1) return true;
    
        // 如果有超过 1 个值，且最大的占比 < 60%
        var maxCount = 0;
        var total = 0;
        for (var key in values) {
            total += values[key];
            if (values[key] > maxCount) maxCount = values[key];
        }    
    
        return (maxCount / total) >= 0.6;
    }

    // ============================================================
    // 🔥 Part 147: Adaptive Signal Calibration
    // ============================================================

    /**
     * 证据维度结构
     */
    function createEvidenceDimensions(params) {
        return {
            volume: params.volume || 0,              // 观察数量
            consistency: params.consistency || 'unknown',  // high | medium | low | mixed | unknown
            recency: params.recency || 'unknown',    // fresh | recent | stale | unknown
            contextApplicability: params.contextApplicability || 'unknown',  // exact | partial | weak | unknown | none
            outcomeStrength: params.outcomeStrength || 'unknown',  // strong | moderate | weak | unknown
            contradictoryEvidence: params.contradictoryEvidence || 0,  // 冲突数量
            learnerOverrides: params.learnerOverrides || 0,  // learner 覆盖次数
            lastObserved: params.lastObserved || Date.now(),
            firstObserved: params.firstObserved || Date.now()
        };    
    }

    /**
     * 校准 Adaptive Signal
     * @param {Object} pattern - 原始 Pattern
     * @param {Object} contextMatch - Context 匹配结果
     * @param {Object} options - 选项
     * @returns {Object} 校准后的 Signal
     */
    function calibrateAdaptiveSignal(pattern, contextMatch, options) {
        options = options || {};
    
        if (!pattern) {
            return {
                signal: null,
                status: 'inactive',
                reason: 'No pattern provided'
            };
        }
    
        // 1. 构建证据维度
        var evidence = createEvidenceDimensions({
            volume: pattern.observationCount || 0,
            consistency: _calculateConsistency(pattern),
            recency: _calculateRecency(pattern.lastObserved),
            contextApplicability: contextMatch ? contextMatch.matchLevel : 'unknown',
            outcomeStrength: _calculateOutcomeStrength(pattern),
            contradictoryEvidence: (pattern.conflictingEvidence || []).length,
            learnerOverrides: pattern.learnerOverrides || 0,
            lastObserved: pattern.lastObserved,
            firstObserved: pattern.firstObserved
        });    
    
        // 2. 计算 Strength
        var strength = _calculateSignalStrength(evidence);
    
        // 3. 计算 Confidence
        var confidence = _calculateSignalConfidence(evidence);
    
        // 4. 确定状态
        var status = _determineSignalStatus(pattern, evidence);
    
        // 5. 生成解释
        var explanation = _generateSignalExplanation(pattern, evidence, strength, confidence);
    
        // 6. 构建 Signal
        var signal = {
            signalId: 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            sourcePatternId: pattern.id,
            sourcePatternType: pattern.type,
            evidence: evidence,
            strength: strength,
            confidence: confidence,
            status: status,
            scope: pattern.scope || { scopeType: 'global', scopeId: null },
            context: pattern.context || {},
            contextMatch: contextMatch,
            adaptiveSignal: pattern.adaptiveSignal,
            explanation: explanation,
            version: '1.0.0',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };    
    
        return {
            signal: signal,
            status: status,
            strength: strength,
            confidence: confidence,
            reason: explanation
        };
    }

    /**
     * 计算一致性
     * @private
     */
    function _calculateConsistency(pattern) {
        if (!pattern || !pattern.supportingEvidence) return 'unknown';
    
        var total = pattern.observationCount || 0;
        var conflicting = (pattern.conflictingEvidence || []).length;
    
        if (total === 0) return 'unknown';
    
        var ratio = conflicting / total;
        if (ratio < 0.1) return 'high';
        if (ratio < 0.25) return 'medium';
        if (ratio < 0.5) return 'mixed';
        return 'low';
    }

    /**
     * 计算新鲜度
     * @private
     */
    function _calculateRecency(lastObserved) {
        if (!lastObserved) return 'unknown';
    
        var daysSince = (Date.now() - lastObserved) / (24 * 60 * 60 * 1000);
        if (daysSince < 3) return 'fresh';
        if (daysSince < 14) return 'recent';
        if (daysSince < 30) return 'stale';
        return 'unknown';
    }

    /**
     * 计算 Outcome Strength
     * @private
     */
    function _calculateOutcomeStrength(pattern) {
        // 简版：基于 observationCount 和是否有 positive impact
        if (!pattern) return 'unknown';
    
        var count = pattern.observationCount || 0;
        if (count < 2) return 'unknown';
        if (count < 5) return 'weak';
        if (count < 10) return 'moderate';
        return 'strong';
    }

    /**
     * 计算 Signal Strength
     * @private
     */
    function _calculateSignalStrength(evidence) {
        var score = 0;
        var maxScore = 0;
    
        // Volume (0-30)
        maxScore += 30;
        if (evidence.volume >= 10) score += 30;
        else if (evidence.volume >= 5) score += 20;
        else if (evidence.volume >= 2) score += 10;
        else score += 5;
    
        // Consistency (0-25)
        maxScore += 25;
        if (evidence.consistency === 'high') score += 25;
        else if (evidence.consistency === 'medium') score += 15;
        else if (evidence.consistency === 'mixed') score += 8;
        else score += 0;
    
        // Recency (0-20)
        maxScore += 20;
        if (evidence.recency === 'fresh') score += 20;
        else if (evidence.recency === 'recent') score += 12;
        else if (evidence.recency === 'stale') score += 5;
        else score += 0;
    
        // Context Applicability (0-15)
        maxScore += 15;
        if (evidence.contextApplicability === 'high') score += 15;
        else if (evidence.contextApplicability === 'medium') score += 10;
        else if (evidence.contextApplicability === 'low') score += 5;
        else score += 0;
    
        // Outcome Strength (0-10)
        maxScore += 10;
        if (evidence.outcomeStrength === 'strong') score += 10;
        else if (evidence.outcomeStrength === 'moderate') score += 6;
        else if (evidence.outcomeStrength === 'weak') score += 3;
        else score += 0;
    
        var ratio = maxScore > 0 ? score / maxScore : 0;
    
        if (ratio >= 0.8) return 'very_strong';
        if (ratio >= 0.6) return 'strong';
        if (ratio >= 0.4) return 'moderate';
        if (ratio >= 0.2) return 'weak';
        return 'very_weak';
    }

    /**
     * 计算 Signal Confidence
     * @private
     */
    function _calculateSignalConfidence(evidence) {
        var score = 0;
        var maxScore = 0;
    
        // Consistency (0-40)
        maxScore += 40;
        if (evidence.consistency === 'high') score += 40;
        else if (evidence.consistency === 'medium') score += 25;
        else if (evidence.consistency === 'mixed') score += 10;
        else score += 0;
    
        // Contradictory Evidence (0-30, 反向)
        maxScore += 30;
        var conflictPenalty = Math.min(30, (evidence.contradictoryEvidence || 0) * 5);
        score += (30 - conflictPenalty);
    
        // Volume (0-30)
        maxScore += 30;
        if (evidence.volume >= 8) score += 30;
        else if (evidence.volume >= 4) score += 20;
        else if (evidence.volume >= 2) score += 10;
        else score += 5;
    
        var ratio = maxScore > 0 ? score / maxScore : 0;
    
        if (ratio >= 0.7) return 'high';
        if (ratio >= 0.4) return 'medium';
        return 'low';
    }

    /**
     * 确定 Signal 状态
     * @private
     */
    function _determineSignalStatus(pattern, evidence) {
        // 检查是否 stale
        var daysSince = (Date.now() - (pattern.lastObserved || 0)) / (24 * 60 * 60 * 1000);
        if (daysSince > 90) return 'inactive';
        if (daysSince > 60) return 'stale';
    
        // 检查是否 contradicted
        var conflicting = (pattern.conflictingEvidence || []).length;
        var supporting = (pattern.supportingEvidence || []).length;
        if (conflicting > 0 && supporting > 0) {
            var ratio = conflicting / (supporting + conflicting);
            if (ratio > 0.5) return 'contradicted';
            if (ratio > 0.3) return 'uncertain';
        }
    
        // 检查是否 emerging
        var volume = pattern.observationCount || 0;
        if (volume < 2) return 'emerging';
    
        // 检查是否 weakening
        var recency = _calculateRecency(pattern.lastObserved);
        if (recency === 'stale') return 'weakening';
        if (recency === 'unknown') return 'weakening';
    
        return 'active';
    }

    /**
     * 生成 Signal 解释
     * @private
     */
    function _generateSignalExplanation(pattern, evidence, strength, confidence) {
        var parts = [];
    
        parts.push('Signal strength: ' + strength);
        parts.push('Confidence: ' + confidence);
        parts.push('Based on ' + evidence.volume + ' observations');
    
        if (evidence.consistency === 'high') {
            parts.push('Consistent pattern');
        } else if (evidence.consistency === 'mixed') {
            parts.push('Mixed evidence');
        }
    
        if (evidence.contextApplicability === 'high') {
            parts.push('Strong contextual match');
        } else if (evidence.contextApplicability === 'medium') {
            parts.push('Moderate contextual match');
        } else if (evidence.contextApplicability === 'low') {
            parts.push('Weak contextual match');
        }
    
        if (evidence.contradictoryEvidence > 0) {
            parts.push(evidence.contradictoryEvidence + ' contradictory observations');
        }
    
        if (evidence.recency === 'fresh') {
            parts.push('Recent evidence');
        } else if (evidence.recency === 'stale') {
            parts.push('Evidence is getting stale');
        }    
    
        return parts.join('; ');
    }

    /**
     * 获取所有校准后的 Signals
     * @param {Object} context - 当前 context
     * @returns {Array} 校准后的 signals
     */
    function getCalibratedSignals(context) {
        context = context || getCurrentContext();
    
        // 1. 获取活跃 patterns
        var patterns = getActivePatterns({ includeInactive: false });
        if (!patterns || patterns.length === 0) {
            return [];
        }
    
        // 2. 解析 context
        var resolved = resolveContextualPatterns(patterns, context);
    
        // 3. 校准每个 pattern
        var signals = [];
        for (var i = 0; i < resolved.length; i++) {
            var r = resolved[i];
            if (!r.applicable) continue;
        
            var result = calibrateAdaptiveSignal(r.pattern, r.match);
            if (result.signal && (result.status === 'active' || result.status === 'emerging')) {
                signals.push(result.signal);
            }
        }
    
        // 4. 按 strength 排序
        var order = { 'very_strong': 0, 'strong': 1, 'moderate': 2, 'weak': 3, 'very_weak': 4 };
        signals.sort(function(a, b) {
            return (order[a.strength] || 5) - (order[b.strength] || 5);
        });
    
        return signals;
    }

    /**
     * 获取 Signal 摘要
     * @param {Object} context - 当前 context
     * @returns {Object} Signal 摘要
     */
    function getSignalSummary(context) {
        var signals = getCalibratedSignals(context);
    
        var summary = {
            total: signals.length,
            byStrength: {
                very_strong: 0,
                strong: 0,
                moderate: 0,
                weak: 0,
                very_weak: 0
            },
            byConfidence: {
                high: 0,
                medium: 0,
                low: 0
            },
            byStatus: {
                active: 0,
                emerging: 0,
                weakening: 0,
                uncertain: 0,
                contradicted: 0
            },
            signals: signals.slice(0, 10)
        };
    
        for (var i = 0; i < signals.length; i++) {
            var s = signals[i];
            if (summary.byStrength[s.strength] !== undefined) {
                summary.byStrength[s.strength]++;
            }
            if (summary.byConfidence[s.confidence] !== undefined) {
                summary.byConfidence[s.confidence]++;
            }
            if (summary.byStatus[s.status] !== undefined) {
                summary.byStatus[s.status]++;
            }
        }
    
        return summary;
    }

    /**
     * 获取 Top N 自适应信号 (用于 Candidate Generation)
     * @param {number} limit - 数量限制
     * @param {Object} context - 当前 context
     * @returns {Array} Top N 信号
     */
    function getTopSignals(limit, context) {
        limit = limit || 5;
        var signals = getCalibratedSignals(context);
        return signals.slice(0, limit);
    }

    // ============================================================
    // 🔥 Part 148: Signal-to-Candidate Translation
    // ============================================================

    /**
     * 候选来源类型
     */
    var CANDIDATE_SOURCES = {
        SIGNAL: 'signal',
        GOAL: 'goal',
        CURRICULUM: 'curriculum',
        LEARNING_STATE: 'learning_state',
        PREREQUISITE: 'prerequisite',
        LEARNER_CHOICE: 'learner_choice',
        SYSTEM: 'system'
    };

    /**
     * 候选状态
     */
    var CANDIDATE_STATUS = {
        ELIGIBLE: 'eligible',
        INELIGIBLE: 'ineligible',
        BLOCKED: 'blocked',
        DUPLICATE: 'duplicate',
        REDUNDANT: 'redundant',
        OPTIONAL: 'optional',
        REQUIRED: 'required',
        EXPIRED: 'expired',
        COMPLETED: 'completed'
    };

    /**
     * 创建 Candidate 对象
     * @param {Object} params - 参数
     * @returns {Object} Candidate 对象
     */
    function createCandidate(params) {
        var now = Date.now();
        return {
            candidateId: 'cand_' + now + '_' + Math.random().toString(36).substr(2, 4),
            action: params.action || null,           // 'continue' | 'review' | 'practice' | 'explore' | etc.
            targetId: params.targetId || null,
            targetType: params.targetType || 'unknown',
            source: params.source || CANDIDATE_SOURCES.SYSTEM,
            sourceType: params.sourceType || 'advisory',  // 'authoritative' | 'advisory'
        
            // 支持的信号
            supportingSignals: params.supportingSignals || [],
            conflictingSignals: params.conflictingSignals || [],
        
            // 其他支持
            goalAlignment: params.goalAlignment || null,
            curriculumContext: params.curriculumContext || null,
        
            // 状态
            status: params.status || CANDIDATE_STATUS.OPTIONAL,
            isRequired: params.isRequired || false,   // 只有权威来源才能设为 true
        
            // 解释
            rationale: params.rationale || null,
            explanation: params.explanation || null,
        
            // 时间
            generatedAt: now,
            expiresAt: params.expiresAt || (now + 7 * 24 * 60 * 60 * 1000),
            contextAtGeneration: params.contextAtGeneration || null,
        
            // 版本
            version: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 从 Signal 生成 Candidate
     * @param {Object} signal - 校准后的 Signal
     * @param {Object} context - 当前 context
     * @param {Object} options - 选项
     * @returns {Object|null} Candidate 或 null
     */
    function signalToCandidate(signal, context, options) {
        options = options || {};
    
        if (!signal) return null;
    
        // 1. 检查 Signal 强度
        var strength = signal.strength || 'weak';
        if (strength === 'very_weak' || strength === 'weak') {
            // 弱信号不产生候选 (除非明确要求)
            if (!options.includeWeak) return null;
        }
    
        // 2. 检查 Signal 状态
        var status = signal.status || 'unknown';
        if (status === 'inactive' || status === 'contradicted') {
            return null;
        }
    
        // 3. 检查是否有 actionable 内容
        var adaptiveSignal = signal.adaptiveSignal || {};
        var signalType = adaptiveSignal.type || signal.sourcePatternType || 'unknown';
    
        // 某些信号类型不产生候选
        var nonActionableTypes = ['OBSERVATION', 'PATTERN_ONLY', 'CONTEXT_AWARE'];
        if (nonActionableTypes.indexOf(signalType) !== -1) {
            return null;
        }
    
        // 4. 确定 action
        var action = _signalTypeToAction(signalType);
        if (!action) return null;
    
        // 5. 确定 target
        var targetId = signal.sourcePatternId || signal.context?.targetId || null;
        if (!targetId) return null;
    
        // 6. 构建 rationale
        var rationale = _buildCandidateRationale(signal, context);
    
        // 7. 创建 Candidate
        return createCandidate({
            action: action,
            targetId: targetId,
            targetType: signal.scope?.scopeType || 'knowledge',
            source: CANDIDATE_SOURCES.SIGNAL,
            sourceType: 'advisory',
            supportingSignals: [signal.signalId || signal.sourcePatternId],
            conflictingSignals: signal.conflictingEvidence ? [signal.conflictingEvidence] : [],
            status: CANDIDATE_STATUS.OPTIONAL,
            isRequired: false,
            rationale: rationale,
            explanation: rationale,
            contextAtGeneration: context,
            expiresAt: Date.now() + (signal.freshness || 1) * 7 * 24 * 60 * 60 * 1000
        });
    }

    /**
     * Signal 类型 → Action 映射
     * @private
     */
    function _signalTypeToAction(signalType) {
        var mapping = {
            'REPEATED_ACCEPTANCE': 'continue',
            'REPEATED_SUCCESS': 'continue',
            'REPEATED_DEFERRAL': 'review',
            'REPEATED_REJECTION': 'explore',
            'REPEATED_ALTERNATIVE': 'explore',
            'REPEATED_NO_IMPACT': 'review',
            'REPEATED_ABANDONMENT': 'review',
            'CONSIDER_LOWER_FRICTION': 'practice',
            'CONSIDER_REVIEW': 'review',
            'CONSIDER_PRACTICE': 'practice',
            'FAVOR_PRACTICE': 'practice',
            'FAVOR_REVIEW': 'review',
            'FAVOR_CONTINUE': 'continue',
            'PRESERVE_ALTERNATIVES': 'explore'
        };
        return mapping[signalType] || null;
    }

    /**
     * 构建 Candidate 解释
     * @private
     */
    function _buildCandidateRationale(signal, context) {
        var parts = [];
    
        // Signal 来源
        parts.push('Based on pattern: ' + (signal.sourcePatternType || 'unknown'));
    
        // Strength
        parts.push('Signal strength: ' + (signal.strength || 'unknown'));
    
        // Context
        if (signal.contextMatch) {
            parts.push('Context match: ' + (signal.contextMatch.matchLevel || 'unknown'));
        }
    
        // Evidence
        if (signal.evidence) {
            parts.push('Based on ' + (signal.evidence.volume || 0) + ' observations');
        }
    
        return parts.join('; ');
    }

    /**
     * 从多个 Signals 生成 Candidates
     * @param {Array} signals - 校准后的 Signals
     * @param {Object} context - 当前 context
     * @param {Object} options - 选项
     * @returns {Array} Candidates
     */
    function signalsToCandidates(signals, context, options) {
        options = options || {};
    
        if (!signals || signals.length === 0) {
            return [];
        }
    
        var candidates = [];
        var seenTargets = {};
    
        for (var i = 0; i < signals.length; i++) {
            var signal = signals[i];
            var candidate = signalToCandidate(signal, context, options);
            if (!candidate) continue;
        
            // 去重：相同 target + action 合并
            var key = candidate.targetId + ':' + candidate.action;
            if (seenTargets[key] !== undefined) {
                // 合并到已有候选
                var existingIdx = seenTargets[key];
                var existing = candidates[existingIdx];
            
                // 合并信号
                if (candidate.supportingSignals) {
                    for (var j = 0; j < candidate.supportingSignals.length; j++) {
                        if (existing.supportingSignals.indexOf(candidate.supportingSignals[j]) === -1) {
                            existing.supportingSignals.push(candidate.supportingSignals[j]);
                        }
                    }
                }
                // 更新解释
                existing.rationale = existing.rationale + '; ' + (candidate.rationale || '');
                existing.explanation = existing.rationale;
            
            } else {
                seenTargets[key] = candidates.length;
                candidates.push(candidate);
            }
        }
    
        // 按支持信号数量排序（多的优先）
        candidates.sort(function(a, b) {
            return (b.supportingSignals ? b.supportingSignals.length : 0) - 
                   (a.supportingSignals ? a.supportingSignals.length : 0);
        });
    
        return candidates;
    }

    /**
     * 生成完整的 Candidate Set
     * @param {Object} context - 当前 context
     * @param {Object} options - 选项
     * @returns {Object} CandidateSet
     */
    function generateCandidateSet(context, options) {
        options = options || {};
        context = context || getCurrentContext();
    
        var candidateSet = {
            candidates: [],
            context: context,
            sourceSignals: [],
            constraints: [],
            generatedAt: Date.now(),
            version: '1.0.0'
        };
    
        // 1. 获取校准后的 Signals
        var signals = getCalibratedSignals(context);
        if (signals && signals.length > 0) {
            var signalCandidates = signalsToCandidates(signals, context, options);
            candidateSet.candidates = candidateSet.candidates.concat(signalCandidates);
            candidateSet.sourceSignals = signals.map(function(s) { return s.signalId; });
        }
    
        // 2. 从 Goals 生成 Candidate (如果有)
        var goalCandidates = _generateGoalCandidates(context, options);
        if (goalCandidates && goalCandidates.length > 0) {
            candidateSet.candidates = candidateSet.candidates.concat(goalCandidates);
        }
    
        // 3. 从 Curriculum 生成 Candidate (如果有)
        var curriculumCandidates = _generateCurriculumCandidates(context, options);
        if (curriculumCandidates && curriculumCandidates.length > 0) {
            candidateSet.candidates = candidateSet.candidates.concat(curriculumCandidates);
        }
    
        // 4. 从 Learning State 生成 Candidate (如果有)
        var stateCandidates = _generateStateCandidates(context, options);
        if (stateCandidates && stateCandidates.length > 0) {
            candidateSet.candidates = candidateSet.candidates.concat(stateCandidates);
        }
    
        // 5. 去重和过滤
        candidateSet.candidates = _deduplicateCandidates(candidateSet.candidates);
        candidateSet.candidates = _filterValidCandidates(candidateSet.candidates, context);
    
        // 6. 标记 required
        for (var i = 0; i < candidateSet.candidates.length; i++) {
            if (candidateSet.candidates[i].sourceType === 'authoritative') {
                candidateSet.candidates[i].isRequired = true;
                candidateSet.candidates[i].status = CANDIDATE_STATUS.REQUIRED;
            }
        }
    
        return candidateSet;
    }

    /**
     * 从 Goals 生成 Candidates
     * @private
     */
    function _generateGoalCandidates(context, options) {
        var candidates = [];
        try {
            var lm = window.LawAIApp?.LearnerModel;
            if (lm) {
                var goals = lm.getActiveGoals ? lm.getActiveGoals() : [];
                for (var i = 0; i < Math.min(goals.length, 2); i++) {
                    var goal = goals[i];
                    if (goal.targetId) {
                        candidates.push(createCandidate({
                            action: 'continue',
                            targetId: goal.targetId,
                            targetType: 'goal',
                            source: CANDIDATE_SOURCES.GOAL,
                            sourceType: 'advisory',
                            status: CANDIDATE_STATUS.OPTIONAL,
                            isRequired: false,
                            rationale: 'Aligned with your goal: ' + (goal.title || '')
                        }));
                    }
                }
            }
        } catch (e) {}
        return candidates;
    }

    /**
     * 从 Curriculum 生成 Candidates
     * @private
     */
    function _generateCurriculumCandidates(context, options) {
        var candidates = [];
        try {
            var adapter = window.LawAIApp?.LearningJourneyAdapter;
            if (adapter) {
                var state = adapter.getState ? adapter.getState() : null;
                if (state && state.currentCourseId) {
                    // 找下一个未完成的模块/课程
                    var continueData = adapter.getContinueLearning ? adapter.getContinueLearning() : null;
                    if (continueData && continueData.courseId) {
                        candidates.push(createCandidate({
                            action: 'continue',
                            targetId: continueData.courseId,
                            targetType: 'course',
                            source: CANDIDATE_SOURCES.CURRICULUM,
                            sourceType: 'advisory',
                            status: CANDIDATE_STATUS.OPTIONAL,
                            isRequired: false,
                            rationale: 'Continue your current course'
                        }));
                    }
                }    
            }
        } catch (e) {}
        return candidates;
    }

    /**
     * 从 Learning State 生成 Candidates
     * @private
     */
    function _generateStateCandidates(context, options) {
        var candidates = [];
        try {
            var lm = window.LawAIApp?.LearnerModel;
            if (lm) {
                var reviewLoad = lm.getReviewLoad ? lm.getReviewLoad() : null;
                if (reviewLoad && reviewLoad.dueCount > 0) {
                    candidates.push(createCandidate({
                        action: 'review',
                        targetId: 'review_' + Date.now(),
                        targetType: 'review',
                        source: CANDIDATE_SOURCES.LEARNING_STATE,
                        sourceType: 'advisory',
                        status: CANDIDATE_STATUS.OPTIONAL,
                        isRequired: false,
                        rationale: reviewLoad.dueCount + ' items due for review'
                    }));
                }
            }
        } catch (e) {}
        return candidates;
    }

    /**
     * 去重 Candidates
     * @private
     */
    function _deduplicateCandidates(candidates) {
        var seen = {};
        var result = [];
    
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            var key = c.targetId + ':' + c.action;
            if (seen[key]) {
                // 合并 signal 引用
                var existing = seen[key];
                if (c.supportingSignals) {
                    for (var j = 0; j < c.supportingSignals.length; j++) {
                        if (existing.supportingSignals.indexOf(c.supportingSignals[j]) === -1) {
                            existing.supportingSignals.push(c.supportingSignals[j]);
                        }
                    }
                }
            } else {
                seen[key] = c;
                result.push(c);
            }
        }
    
        return result;
    }

    /**
     * 过滤有效 Candidates
     * @private
     */
    function _filterValidCandidates(candidates, context) {
        var result = [];
    
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
        
            // 检查是否过期
            if (c.expiresAt && Date.now() > c.expiresAt) {
                c.status = CANDIDATE_STATUS.EXPIRED;
                continue;
            }
        
            // 检查是否已完成 (简单检查)
            try {
                var progress = window.LawAIApp?.ProgressEngine;
                if (progress && c.targetId) {
                    var isCompleted = progress.isLessonCompleted ? progress.isLessonCompleted(c.targetId) : false;
                    if (isCompleted) {
                        c.status = CANDIDATE_STATUS.COMPLETED;
                        continue;
                    }
                }
            } catch (e) {}
        
            result.push(c);
        }
    
        return result;
    }

    /**
     * 获取 Top Candidates (用于展示)
     * @param {number} limit - 数量限制
     * @param {Object} context - 当前 context
     * @returns {Array} Top Candidates
     */
    function getTopCandidates(limit, context) {
        limit = limit || 5;
        var candidateSet = generateCandidateSet(context);
        var candidates = candidateSet.candidates || [];
    
        // 按优先级排序 (required 优先，然后按支持信号数量)
        candidates.sort(function(a, b) {
            if (a.isRequired && !b.isRequired) return -1;
            if (!a.isRequired && b.isRequired) return 1;
            return (b.supportingSignals ? b.supportingSignals.length : 0) - 
                   (a.supportingSignals ? a.supportingSignals.length : 0);
        });
    
        return candidates.slice(0, limit);
    }

    // ============================================================
    // 🔥 Part 149: Candidate Arbitration & Decision Transparency
    // ============================================================

    /**
     * 权威级别
     */
    var AUTHORITY_LEVELS = {
        REQUIRED: 'required',        // 硬性先决条件
        INTENT: 'intent',            // 学习者明确意图
        CURRICULUM: 'curriculum',    // 课程关系
        LEARNING_STATE: 'learning_state',  // 当前学习状态
        RECENT_OUTCOME: 'recent_outcome',  // 近期结果
        ADAPTIVE: 'adaptive',        // 自适应信号
        CONTEXTUAL: 'contextual',    // 上下文机会
        GENERAL: 'general'           // 一般优先级
    };

    var AUTHORITY_ORDER = {
        'required': 0,
        'intent': 1,
        'curriculum': 2,
        'learning_state': 3,
        'recent_outcome': 4,
        'adaptive': 5,
        'contextual': 6,
        'general': 7
    };

    /**
     * 候选状态
     */
    var CANDIDATE_STATUS = {
        ELIGIBLE: 'eligible',
        INELIGIBLE: 'ineligible',
        BLOCKED: 'blocked',
        DUPLICATE: 'duplicate',
        REDUNDANT: 'redundant',
        OPTIONAL: 'optional',
        REQUIRED: 'required',
        EXPIRED: 'expired',
        COMPLETED: 'completed',
        SUPPRESSED: 'suppressed'
    };

    /**
     * 仲裁决策追踪
     */
    function createArbitrationTrace(input) {
        return {
            decisionId: 'arb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            timestamp: Date.now(),
            inputCandidateIds: input.candidateIds || [],
            eligibleCandidateIds: [],
            excludedCandidateIds: [],
            rankedCandidateIds: [],
            selectedCandidateIds: [],
            rulesApplied: [],
            authorityDecisions: [],
            conflictsDetected: [],
            duplicatesResolved: [],
            freshnessEvaluations: [],
            suppressionReasons: [],
            rankingReasons: [],
            tieBreaks: [],
            finalDecision: null,
            version: '1.0.0'
        };    
    }

    /**
     * 仲裁 Candidates
     * @param {Array} candidates - Candidate 列表
     * @param {Object} context - 当前 context
     * @param {Object} options - 选项
     * @returns {Object} 仲裁结果
     */
    function arbitrateCandidates(candidates, context, options) {
        options = options || {};
        context = context || getCurrentContext();
    
        var trace = createArbitrationTrace({
            candidateIds: candidates.map(function(c) { return c.candidateId; })
        });
    
        // 如果没有候选，返回空结果
        if (!candidates || candidates.length === 0) {
            trace.finalDecision = 'EMPTY_CANDIDATE_SET';
            return {
                success: true,
                selected: [],
                ranked: [],
                eligible: [],
                excluded: [],
                trace: trace,
                status: 'EMPTY'
            };
        }
    
        // ─── Stage 1: 资格检查 ───
        var eligibilityResults = [];
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            var eligible = _checkEligibility(c, context);
            eligibilityResults.push({
                candidate: c,
                eligible: eligible.pass,
                reason: eligible.reason,
                details: eligible.details
            });
            if (eligible.pass) {
                trace.eligibleCandidateIds.push(c.candidateId);
            } else {
                trace.excludedCandidateIds.push(c.candidateId);
            }
        }
    
        var eligibleCandidates = eligibilityResults.filter(function(r) { return r.eligible; }).map(function(r) { return r.candidate; });
    
        // 如果没有合格候选，返回
        if (eligibleCandidates.length === 0) {
            trace.finalDecision = 'NO_ELIGIBLE_CANDIDATES';
            return {
                success: true,
                selected: [],
                ranked: [],
                eligible: [],
                excluded: candidates,
                trace: trace,
                status: 'NO_ELIGIBLE'
            };
        }
    
        // ─── Stage 2: 权威分类 ───
        var classified = [];
        for (var i = 0; i < eligibleCandidates.length; i++) {
            var c = eligibleCandidates[i];
            var authority = _classifyAuthority(c, context);
            classified.push({
                candidate: c,
                authority: authority,
                authorityOrder: AUTHORITY_ORDER[authority] || 99
            });
            trace.authorityDecisions.push({
                candidateId: c.candidateId,
                authority: authority
            });
        }
    
        // ─── Stage 3: 去重 ───
        var deduped = _deduplicateWithTrace(classified, trace);
    
        // ─── Stage 4: 冲突检测 ───
        var conflictResult = _detectArbitrationConflicts(deduped, context);
        if (conflictResult.hasConflicts) {
            trace.conflictsDetected = conflictResult.conflicts;
        }    
    
        // ─── Stage 5: 新鲜度评估 ───
        var withFreshness = _evaluateFreshness(deduped, context);
        for (var i = 0; i < withFreshness.length; i++) {
            trace.freshnessEvaluations.push({
                candidateId: withFreshness[i].candidate.candidateId,
                freshness: withFreshness[i].freshness,
                status: withFreshness[i].status
            });
        }
    
        // ─── Stage 6: 多阶段排序 ───
        var ranked = _multiStageRank(withFreshness, context);
        trace.rankedCandidateIds = ranked.map(function(r) { return r.candidate.candidateId; });
    
        // ─── Stage 7: 选择 ───
        var limit = options.limit || 5;
        var selected = ranked.slice(0, limit);
        trace.selectedCandidateIds = selected.map(function(r) { return r.candidate.candidateId; });
    
        // ─── Stage 8: 生成解释 ───
        var rankingReasons = _generateRankingReasons(ranked, selected, context);
        trace.rankingReasons = rankingReasons;
    
        trace.finalDecision = 'ARBITRATION_COMPLETE';
        trace.rulesApplied = [
            'ELIGIBILITY_GATE',
            'AUTHORITY_CLASSIFICATION',
            'DEDUPLICATION',
            'CONFLICT_DETECTION',
            'FRESHNESS_EVALUATION',
            'MULTI_STAGE_RANKING',
            'TOP_N_SELECTION'
        ];    
    
        return {
            success: true,
            selected: selected.map(function(r) { return r.candidate; }),
            ranked: ranked.map(function(r) { return r.candidate; }),
            eligible: eligibleCandidates,
            excluded: candidates.filter(function(c) {
                return trace.excludedCandidateIds.indexOf(c.candidateId) !== -1;
            }),
            trace: trace,
            status: 'COMPLETE',
            meta: {
                total: candidates.length,
                eligible: eligibleCandidates.length,
                excluded: candidates.length - eligibleCandidates.length,
                selected: selected.length,
                hasRequired: selected.some(function(r) { return r.authority === 'required'; })
            }
        };
    }

    /**
     * 检查候选资格
     * @private
     */
    function _checkEligibility(candidate, context) {
        // 1. 检查是否过期
        if (candidate.expiresAt && Date.now() > candidate.expiresAt) {
            return { pass: false, reason: 'EXPIRED', details: { expiresAt: candidate.expiresAt } };
        }
    
        // 2. 检查是否已完成
        if (candidate.status === CANDIDATE_STATUS.COMPLETED) {
            return { pass: false, reason: 'COMPLETED', details: { status: candidate.status } };
        }
    
        // 3. 检查是否被抑制
        if (candidate.status === CANDIDATE_STATUS.SUPPRESSED) {
            return { pass: false, reason: 'SUPPRESSED', details: { status: candidate.status } };
        }
    
        // 4. 检查目标是否存在 (如果有 targetId)
        if (candidate.targetId) {
            // 简单检查: 尝试获取目标
            try {
                var registry = window.LawAIApp?.CourseRegistry || window.LawAIApp?.AcademyRegistry;
                if (registry && typeof registry.get === 'function') {
                    var target = registry.get(candidate.targetId);
                    if (!target) {
                        return { pass: false, reason: 'TARGET_NOT_FOUND', details: { targetId: candidate.targetId } };
                    }
                }
            } catch (e) {
                // 如果检查失败，默认通过 (不阻断)
            }
        }
    
        // 5. 检查硬性先决条件
        if (candidate.source === 'prerequisite') {
            // 验证先决条件是否有效
            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getState === 'function') {
                    var state = adapter.getState();
                    // 简单检查: 如果先决条件已满足，则不应该是 required
                    if (candidate.isRequired) {
                        // 检查是否已完成
                        var progress = window.LawAIApp?.ProgressEngine;
                        if (progress && typeof progress.isLessonCompleted === 'function') {
                            var completed = progress.isLessonCompleted(candidate.targetId);
                            if (completed) {
                                return { pass: false, reason: 'PREREQUISITE_ALREADY_COMPLETED', details: { targetId: candidate.targetId } };
                            }
                        }
                    }
                }
            } catch (e) {}
        }
    
        return { pass: true, reason: 'ELIGIBLE', details: {} };
    }

    /**
     * 分类权威级别
     * @private
     */
    function _classifyAuthority(candidate, context) {
        // 1. 硬性先决条件
        if (candidate.source === 'prerequisite' && candidate.isRequired === true) {
            return AUTHORITY_LEVELS.REQUIRED;
        }
    
        // 2. 学习者明确意图
        if (candidate.source === 'learner_choice' || candidate.source === 'goal') {
            return AUTHORITY_LEVELS.INTENT;
        }
    
        // 3. 课程关系
        if (candidate.source === 'curriculum') {
            return AUTHORITY_LEVELS.CURRICULUM;
        }
    
        // 4. 学习状态
        if (candidate.source === 'learning_state') {
            return AUTHORITY_LEVELS.LEARNING_STATE;
        }
    
        // 5. 近期结果
        if (candidate.source === 'recent_outcome') {
            return AUTHORITY_LEVELS.RECENT_OUTCOME;
        }
    
        // 6. 自适应信号
        if (candidate.source === 'signal') {
            return AUTHORITY_LEVELS.ADAPTIVE;
        }
    
        // 7. 上下文
        if (candidate.source === 'contextual') {
            return AUTHORITY_LEVELS.CONTEXTUAL;
        }
    
        return AUTHORITY_LEVELS.GENERAL;
    }

    /**
     * 去重并追踪来源
     * @private
     */
    function _deduplicateWithTrace(classified, trace) {
        var seen = {};
        var result = [];
    
        for (var i = 0; i < classified.length; i++) {
            var item = classified[i];
            var c = item.candidate;
            var key = c.targetId + ':' + c.action;
        
            if (seen[key] !== undefined) {
                // 合并
                var existing = result[seen[key]];
                if (c.supportingSignals) {
                    for (var j = 0; j < c.supportingSignals.length; j++) {
                        if (existing.candidate.supportingSignals.indexOf(c.supportingSignals[j]) === -1) {
                            existing.candidate.supportingSignals.push(c.supportingSignals[j]);
                        }
                    }
                }
                // 保留最高权威
                if (AUTHORITY_ORDER[item.authority] < AUTHORITY_ORDER[existing.authority]) {
                    existing.authority = item.authority;
                    existing.candidate.source = c.source || existing.candidate.source;
                }
                trace.duplicatesResolved.push({
                    primary: existing.candidate.candidateId,
                    duplicate: c.candidateId,
                    key: key
                });
            } else {
                seen[key] = result.length;
                result.push({
                    candidate: c,
                    authority: item.authority,
                    authorityOrder: item.authorityOrder
                });
            }
        }
    
        return result;
    }

    /**
     * 检测仲裁冲突
     * @private
     */
    function _detectArbitrationConflicts(classified, context) {
        var conflicts = [];
    
        for (var i = 0; i < classified.length; i++) {
            for (var j = i + 1; j < classified.length; j++) {
                var a = classified[i];
                var b = classified[j];
            
                // 检查目标冲突
                if (a.candidate.targetId === b.candidate.targetId) continue;
                
                // 检查权威冲突 (required vs optional)
                if (a.authority === AUTHORITY_LEVELS.REQUIRED && b.authority !== AUTHORITY_LEVELS.REQUIRED) {
                    // required 应该优先，不算冲突，而是权威覆盖
                    continue;
                }
                if (b.authority === AUTHORITY_LEVELS.REQUIRED && a.authority !== AUTHORITY_LEVELS.REQUIRED) {
                    continue;
                }
            
                // 检查行动冲突 (continue vs review)
                if (a.candidate.action === 'continue' && b.candidate.action === 'review') {
                    // 这两个可以共存，不是冲突
                    continue;
                }
            
                // 如果都来自自适应信号且强度都高，产生冲突
                if (a.authority === AUTHORITY_LEVELS.ADAPTIVE && b.authority === AUTHORITY_LEVELS.ADAPTIVE) {
                    // 检查信号来源
                    if (a.candidate.supportingSignals && b.candidate.supportingSignals) {
                        // 如果同一个信号支持两个不同候选，才是真冲突
                        var overlap = false;
                        for (var k = 0; k < a.candidate.supportingSignals.length; k++) {
                            if (b.candidate.supportingSignals.indexOf(a.candidate.supportingSignals[k]) !== -1) {
                                overlap = true;
                                break;
                            }
                        }
                        if (overlap) {
                            conflicts.push({
                                type: 'SIGNAL_CONFLICT',
                                candidateA: a.candidate.candidateId,
                                candidateB: b.candidate.candidateId,
                                severity: 'medium',
                                description: 'Same signal supports different candidates'
                            });
                        }
                    }
                }
            }
        }
    
        return {
            hasConflicts: conflicts.length > 0,
            conflicts: conflicts
        };
    }

    /**
     * 评估新鲜度
     * @private
     */
    function _evaluateFreshness(classified, context) {
        var now = Date.now();
        var result = [];
    
        for (var i = 0; i < classified.length; i++) {
            var item = classified[i];
            var c = item.candidate;
            var generatedAt = c.generatedAt || c.createdAt || now;
            var daysSince = (now - generatedAt) / (24 * 60 * 60 * 1000);
        
            var freshness = 'fresh';
            var freshnessScore = 1.0;
            if (daysSince > 90) {
                freshness = 'expired';
                freshnessScore = 0.0;
                c.status = CANDIDATE_STATUS.EXPIRED;
            } else if (daysSince > 60) {
                freshness = 'stale';
                freshnessScore = 0.2;
                c.status = CANDIDATE_STATUS.EXPIRED;
            } else if (daysSince > 30) {
                freshness = 'aging';
                freshnessScore = 0.5;
            } else if (daysSince > 14) {
                freshness = 'recent';
                freshnessScore = 0.8;
            } else {
                freshness = 'fresh';
                freshnessScore = 1.0;
            }
        
            result.push({
                candidate: c,
                authority: item.authority,
                authorityOrder: item.authorityOrder,
                freshness: freshness,
                freshnessScore: freshnessScore,
                status: freshness === 'expired' ? 'EXPIRED' : 'ACTIVE'
            });
        }
    
        return result;
    }

    /**
     * 多阶段排序
     * @private
     */
    function _multiStageRank(withFreshness, context) {
        // Stage 1: 按权威排序 (required > intent > curriculum > ...)
        var byAuthority = withFreshness.slice();
        byAuthority.sort(function(a, b) {
            return (a.authorityOrder || 99) - (b.authorityOrder || 99);
        });
    
        // Stage 2: 在相同权威内，按新鲜度排序
        var grouped = {};
        for (var i = 0; i < byAuthority.length; i++) {
            var key = byAuthority[i].authority;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(byAuthority[i]);
        }    
    
        var result = [];
        var authorityOrder = ['required', 'intent', 'curriculum', 'learning_state', 'recent_outcome', 'adaptive', 'contextual', 'general'];
        for (var j = 0; j < authorityOrder.length; j++) {
            var key = authorityOrder[j];
            if (grouped[key]) {
                // 在相同权威内，按新鲜度排序
                grouped[key].sort(function(a, b) {
                    return (b.freshnessScore || 0) - (a.freshnessScore || 0);
                });
                // 在相同新鲜度内，按支持信号数量排序
                grouped[key].sort(function(a, b) {
                    if (a.freshnessScore === b.freshnessScore) {
                        return (b.candidate.supportingSignals ? b.candidate.supportingSignals.length : 0) -
                               (a.candidate.supportingSignals ? a.candidate.supportingSignals.length : 0);
                    }
                    return 0;
                });
                result = result.concat(grouped[key]);
            }
        }
    
        return result;
    }

    /**
     * 生成排序解释
     * @private
     */
    function _generateRankingReasons(ranked, selected, context) {
        var reasons = [];
    
        for (var i = 0; i < Math.min(ranked.length, 10); i++) {
            var r = ranked[i];
            var c = r.candidate;
            var reason = {
                candidateId: c.candidateId,
                rank: i + 1,
                selected: i < selected.length,
                reason: 'Ranked #' + (i + 1) + ' based on authority: ' + r.authority,
                details: {
                    authority: r.authority,
                    freshness: r.freshness,
                    supportingSignals: c.supportingSignals ? c.supportingSignals.length : 0,
                    action: c.action
                }
            };
            reasons.push(reason);
        }
    
        return reasons;
    }

    /**
     * 获取仲裁摘要 (用于 DevPanel / Debug)
     */
    function getArbitrationSummary(arbitrationResult) {
        if (!arbitrationResult || !arbitrationResult.success) {
            return {
                status: 'FAILED',
                message: 'Arbitration failed or not available',
                counts: { total: 0, eligible: 0, selected: 0, excluded: 0 }
            };
        }
    
        return {
            status: arbitrationResult.status || 'COMPLETE',
            decisionId: arbitrationResult.trace ? arbitrationResult.trace.decisionId : null,
            counts: {
                total: arbitrationResult.meta ? arbitrationResult.meta.total : 0,
                eligible: arbitrationResult.meta ? arbitrationResult.meta.eligible : 0,
                selected: arbitrationResult.meta ? arbitrationResult.meta.selected : 0,
                excluded: arbitrationResult.meta ? arbitrationResult.meta.excluded : 0
            },
            hasRequired: arbitrationResult.meta ? arbitrationResult.meta.hasRequired : false,
            selectedCandidates: (arbitrationResult.selected || []).map(function(c) {
                return {
                    id: c.candidateId,
                    action: c.action,
                    targetId: c.targetId,
                    authority: c.source || 'unknown'
                };
            }),
            timestamp: arbitrationResult.trace ? arbitrationResult.trace.timestamp : null
        };
    }

    // ============================================================
    // 🔥 Part 150: Recommendation Contract & Assembly
    // ============================================================

    /**
     * 推荐状态
     */
    var RECOMMENDATION_STATUS = {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        REJECTED: 'rejected',
        DEFERRED: 'deferred',
        COMPLETED: 'completed',
        EXPIRED: 'expired',
        INVALID: 'invalid'
    };

    /**
     * 创建 Recommendation Contract
     * @param {Object} params - 参数
     * @returns {Object} Recommendation Contract
     */
    function createRecommendationContract(params) {
        var now = Date.now();
    
        return {
            // Identity
            recommendationId: 'rec_' + now + '_' + Math.random().toString(36).substr(2, 4),
            candidateId: params.candidateId || null,
            decisionTraceId: params.decisionTraceId || null,
            
            // Target
            target: {
                type: params.targetType || 'unknown',
                id: params.targetId || null
            },
        
            // Type
            recommendationType: params.recommendationType || 'general',
        
            // Status
            status: params.status || RECOMMENDATION_STATUS.PENDING,
        
            // Authority
            authority: {
                level: params.authorityLevel || 'advisory',
                source: params.authoritySource || 'unknown',
                isRequired: params.isRequired || false
            },
        
            // Priority
            priority: {
                class: params.priorityClass || 'normal',
                rank: params.rank || 0
            },
        
            // Rationale
            rationale: {
                summary: params.rationaleSummary || null,
                reasons: params.rationaleReasons || [],
                evidenceRefs: params.evidenceRefs || []
            },
        
            // Source snapshot
            sourceSnapshot: params.sourceSnapshot || null,
        
            // Context
            context: params.context || null,
            
            // Learner Agency
            learnerAgency: {
                mode: params.learnerAgencyMode || 'optional',
                canAccept: params.canAccept !== false,
                canReject: params.canReject !== false,
                canDefer: params.canDefer !== false,
                canChooseAlternative: params.canChooseAlternative || false
            },
        
            // Alternatives
            alternatives: params.alternatives || [],
        
            // Validity
            validity: {
                createdAt: now,
                expiresAt: params.expiresAt || (now + 7 * 24 * 60 * 60 * 1000),
                invalidationConditions: params.invalidationConditions || []
            },
        
            // Presentation hints
            presentationHints: params.presentationHints || {},
        
            // Version
            version: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 从仲裁结果组装 Recommendations
     * @param {Object} arbitrationResult - Part 149 的仲裁结果
     * @param {Object} context - 当前 context
     * @param {Object} options - 选项
     * @returns {Object} 组装结果
     */
    function assembleRecommendations(arbitrationResult, context, options) {
        options = options || {};
        context = context || getCurrentContext();
        
        var result = {
            recommendations: [],
            excluded: [],
            status: 'empty',
            reason: null,
            trace: null,
            meta: {
                total: 0,
                valid: 0,
                excluded: 0
            }
        };
    
        // 1. 验证输入
        if (!arbitrationResult || !arbitrationResult.success) {
            result.status = 'failed';
            result.reason = 'Invalid arbitration result';
            return result;
        }
    
        var selected = arbitrationResult.selected || [];
        var trace = arbitrationResult.trace || null;
    
        if (selected.length === 0) {
            result.status = 'empty';
            result.reason = 'No selected candidates from arbitration';
            result.trace = trace;
            return result;
        }    
    
        // 2. 组装每个推荐
        var assembled = [];
        var excluded = [];
        
        for (var i = 0; i < selected.length; i++) {
            var candidate = selected[i];
            var contract = _assembleSingleRecommendation(candidate, i, arbitrationResult, context, options);
        
            if (contract) {
                assembled.push(contract);
            } else {
                excluded.push({
                    candidateId: candidate.candidateId,
                    reason: 'Assembly failed'
                });
            }
        }
    
        // 3. 结果
        result.recommendations = assembled;
        result.excluded = excluded;
        result.trace = trace;
        result.meta.total = selected.length;
        result.meta.valid = assembled.length;
        result.meta.excluded = excluded.length;
        result.status = assembled.length > 0 ? 'complete' : 'empty';
        result.reason = assembled.length > 0 ? 'Recommendations assembled successfully' : 'No recommendations could be assembled';
    
        return result;
    }    

    /**
     * 组装单个 Recommendation
     * @private
     */
    function _assembleSingleRecommendation(candidate, index, arbitrationResult, context, options) {
        if (!candidate) return null;
        
        // 1. 验证候选
        if (!candidate.candidateId || !candidate.targetId) {
            return null;
        }
    
        // 2. 确定权威级别
        var authorityLevel = 'advisory';
        var isRequired = false;
        var authoritySource = candidate.source || 'unknown';
    
        if (candidate.isRequired === true || candidate.status === 'required') {
            authorityLevel = 'required';
            isRequired = true;
        } else if (candidate.sourceType === 'authoritative') {
            authorityLevel = 'authoritative';
            isRequired = false;
        }
    
        // 3. 确定优先级
        var priorityClass = 'normal';
        if (isRequired) priorityClass = 'critical';
        else if (index === 0) priorityClass = 'high';
        else if (index < 3) priorityClass = 'medium';
    
        // 4. 构建 Rationale
        var rationaleSummary = candidate.rationale || candidate.explanation || null;
        var rationaleReasons = [];
        var evidenceRefs = [];
    
        if (candidate.supportingSignals && candidate.supportingSignals.length > 0) {
            for (var i = 0; i < candidate.supportingSignals.length; i++) {
                rationaleReasons.push({
                    type: 'adaptive_signal',
                    sourceId: candidate.supportingSignals[i],
                    statement: 'Supported by adaptive learning signal'
                });
            }
            evidenceRefs = candidate.supportingSignals.slice();
        }
    
        if (candidate.conflictingSignals && candidate.conflictingSignals.length > 0) {
            rationaleReasons.push({
                type: 'conflicting_evidence',
                sourceId: candidate.conflictingSignals[0],
                statement: 'Some evidence points in other directions'
            });
        }    
    
        // 5. 构建 Alternatives
        var alternatives = [];
        if (arbitrationResult.ranked) {
            for (var i = 0; i < arbitrationResult.ranked.length; i++) {
                var alt = arbitrationResult.ranked[i];
                if (alt.candidateId === candidate.candidateId) continue;
                alternatives.push({
                    candidateId: alt.candidateId,
                    targetId: alt.targetId || null,
                    action: alt.action || null,
                    source: alt.source || 'unknown'
                });
                if (alternatives.length >= 3) break;
            }
        }
    
        // 6. 创建 Contract
        return createRecommendationContract({
            candidateId: candidate.candidateId,
            decisionTraceId: arbitrationResult.trace ? arbitrationResult.trace.decisionId : null,
            targetType: candidate.targetType || 'knowledge',
            targetId: candidate.targetId,
            recommendationType: candidate.action || 'general',
            status: RECOMMENDATION_STATUS.PENDING,
            authorityLevel: authorityLevel,
            authoritySource: authoritySource,
            isRequired: isRequired,
            priorityClass: priorityClass,
            rank: index + 1,
            rationaleSummary: rationaleSummary,
            rationaleReasons: rationaleReasons,
            evidenceRefs: evidenceRefs,
            sourceSnapshot: {
                candidate: candidate,
                arbitrationContext: arbitrationResult.meta || {}
            },
            context: context,
            learnerAgencyMode: isRequired ? 'required' : 'optional',
            canAccept: true,
            canReject: !isRequired,
            canDefer: !isRequired,
            canChooseAlternative: true,
            alternatives: alternatives,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
            invalidationConditions: [
                { type: 'target_completed', targetId: candidate.targetId },
                { type: 'context_change', description: 'Significant context change' },
                { type: 'expiration', description: 'Recommendation expired' }
            ],
            presentationHints: {
                displayPriority: index < 3 ? 'high' : 'normal',
                category: isRequired ? 'required' : 'recommended'
            }
        });
    }
    
    /**
     * 更新推荐状态
     * @param {string} recommendationId - 推荐 ID
     * @param {string} status - 新状态
     * @param {Object} metadata - 元数据
     * @returns {Object} 更新结果
     */
    function updateRecommendationStatus(recommendationId, status, metadata) {
        metadata = metadata || {};
    
        // 查找推荐 (需要存储)
        var store = _getStore();
        var recommendations = store._recommendations || [];
        
        var found = false;
        for (var i = 0; i < recommendations.length; i++) {
            if (recommendations[i].recommendationId === recommendationId) {
                recommendations[i].status = status;
                recommendations[i].updatedAt = Date.now();
                if (metadata.reason) {
                    recommendations[i].statusReason = metadata.reason;
                }
                found = true;
                break;
            }
        }
    
        if (!found) {
            return { success: false, message: 'Recommendation not found' };
        }    
    
        store._recommendations = recommendations;
        _saveStore(store);
    
        _emit('RECOMMENDATION_STATUS_UPDATED', {
            recommendationId: recommendationId,
            status: status,
            metadata: metadata,
            timestamp: Date.now()
        });    
    
        return { success: true, status: status };
    }

    /**
     * 获取推荐状态
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 推荐状态
     */
    function getRecommendationStatus(recommendationId) {
        var store = _getStore();
        var recommendations = store._recommendations || [];
        
        for (var i = 0; i < recommendations.length; i++) {
            if (recommendations[i].recommendationId === recommendationId) {
                return {
                    found: true,
                    status: recommendations[i].status,
                    updatedAt: recommendations[i].updatedAt,
                    recommendation: recommendations[i]
                };
            }
        }
    
        return { found: false };
    }

    /**
     * 获取活跃推荐
     * @param {Object} filter - 过滤条件
     * @returns {Array} 活跃推荐列表
     */
    function getActiveRecommendationsContract(filter) {
        filter = filter || {};
        var store = _getStore();
        var recommendations = store._recommendations || [];
        
        var active = recommendations.filter(function(r) {
            if (r.status === RECOMMENDATION_STATUS.COMPLETED) return false;
            if (r.status === RECOMMENDATION_STATUS.REJECTED) return false;
            if (r.status === RECOMMENDATION_STATUS.EXPIRED) return false;
            if (r.status === RECOMMENDATION_STATUS.INVALID) return false;
            return true;
        });
    
        // 按优先级排序
        var order = { 'critical': 0, 'high': 1, 'medium': 2, 'normal': 3, 'low': 4 };
        active.sort(function(a, b) {
            return (order[a.priority?.class] || 5) - (order[b.priority?.class] || 5);
        });
    
        if (filter.limit) {
            active = active.slice(0, filter.limit);
        }    
    
        return active;
    }

    /**
     * 获取推荐摘要 (用于 Dashboard)
     * @param {Object} context - 当前 context
     * @returns {Object} 推荐摘要
     */
    function getRecommendationSummary(context) {
        context = context || getCurrentContext();
    
        // 获取活跃推荐
        var active = getActiveRecommendationsContract({});
    
        var summary = {
            total: active.length,
            byStatus: {
                pending: 0,
                accepted: 0,
                deferred: 0,
                completed: 0
            },
            byAuthority: {
                required: 0,
                advisory: 0
            },
            byPriority: {
                critical: 0,
                high: 0,
                medium: 0,
                normal: 0,
                low: 0
            },    
            active: active.slice(0, 10)
        };
    
        for (var i = 0; i < active.length; i++) {
            var r = active[i];
            if (summary.byStatus[r.status] !== undefined) {
                summary.byStatus[r.status]++;
            }    
            if (r.authority?.isRequired) {
                summary.byAuthority.required++;
            } else {
                summary.byAuthority.advisory++;
            }
            if (r.priority?.class && summary.byPriority[r.priority.class] !== undefined) {
                summary.byPriority[r.priority.class]++;
            }
        }
    
        return summary;
    }

    // ============================================================
    // 🔥 Part 151: Recommendation Explainability & Decision Transparency
    // ============================================================

    /**
     * 解释原因类型
     */
    var REASON_TYPES = {
        AUTHORITY: 'authority',
        PREREQUISITE: 'prerequisite',
        LEARNING_GAP: 'learning_gap',
        RECENT_OUTCOME: 'recent_outcome',
        MASTERY_STATE: 'mastery_state',
        CURRENT_CONTEXT: 'current_context',
        LEARNER_GOAL: 'learner_goal',
        SCHEDULE_CONTEXT: 'schedule_context',
        PREFERENCE: 'preference',
        CURRICULUM_RELATIONSHIP: 'curriculum_relationship',
        FRESHNESS: 'freshness',
        ADAPTIVE_SIGNAL: 'adaptive_signal',
        INSUFFICIENT_EVIDENCE: 'insufficient_evidence',
        UNKNOWN: 'unknown'
    };

    /**
     * 解释层级
     */
    var EXPLANATION_LEVELS = {
        SIMPLE: 'simple',
        DETAILED: 'detailed',
        TRACE: 'trace'
    };    

    /**
     * 创建 Explanation Contract
     * @param {Object} recommendation - Recommendation 对象
     * @param {Object} options - 选项
     * @returns {Object} Explanation Contract
     */
    function createExplanationContract(recommendation, options) {
        options = options || {};
        var now = Date.now();
    
        // 从 recommendation 提取信息
        var target = recommendation.target || {};
        var authority = recommendation.authority || {};
        var rationale = recommendation.rationale || {};
        var agency = recommendation.learnerAgency || {};
        var priority = recommendation.priority || {};
        var validity = recommendation.validity || {};
        var alternatives = recommendation.alternatives || [];
    
        // 构建理由列表
        var reasons = _buildReasons(recommendation, options);
    
        // 构建证据引用
        var evidenceRefs = rationale.evidenceRefs || [];
    
        // 构建 why-now
        var whyNow = _buildWhyNow(recommendation, options);
    
        // 构建限制说明
        var limitations = _buildLimitations(recommendation, options);
    
        return {
            explanationId: 'exp_' + now + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: recommendation.recommendationId || null,
            candidateId: recommendation.candidateId || null,
            decisionTraceId: recommendation.decisionTraceId || null,
            
            // 三层解释
            simple: {
                summary: _buildSimpleSummary(recommendation, reasons, options),
                isRequired: authority.isRequired || false,
                action: recommendation.recommendationType || 'general'
            },
            detailed: {
                summary: _buildDetailedSummary(recommendation, reasons, options),
                reasons: reasons,
                evidenceRefs: evidenceRefs,
                authorityExplanation: _buildAuthorityExplanation(authority, options),
                contextExplanation: _buildContextExplanation(recommendation, options),
                whyNow: whyNow,
                alternatives: alternatives.map(function(a) {
                    return {
                        targetId: a.targetId,
                        action: a.action,
                        source: a.source
                    };
                }),
                tradeoffs: _buildTradeoffs(recommendation, alternatives, options)
            },
            trace: {
                decisionPath: _buildDecisionPath(recommendation, options),
                sourceSnapshot: recommendation.sourceSnapshot || null,
                generatedAt: recommendation.validity?.createdAt || now,
                arbitrationVersion: options.arbitrationVersion || '1.0.0',
                contractVersion: '1.0.0'
            },
        
            // 元数据
            confidence: _getExplanationConfidence(recommendation, options),
            status: 'complete',
            generatedAt: now,
            version: '1.0.0'
        };
    }

    /**
     * 构建理由列表
     * @private
     */
    function _buildReasons(recommendation, options) {
        var reasons = [];
    
        // 1. 从 rationale 提取
        var rationale = recommendation.rationale || {};
        var rationaleReasons = rationale.reasons || [];
        for (var i = 0; i < rationaleReasons.length; i++) {
            var r = rationaleReasons[i];
            reasons.push({
                type: r.type || REASON_TYPES.UNKNOWN,
                statement: r.statement || null,
                sourceId: r.sourceId || null,
                evidenceRef: r.evidenceRef || null
            });    
        }
    
        // 2. 如果没有理由，添加默认
        if (reasons.length === 0) {
            if (recommendation.authority?.isRequired) {
                reasons.push({
                    type: REASON_TYPES.AUTHORITY,
                    statement: 'This is required due to an authoritative prerequisite.',
                    sourceId: recommendation.authority?.source || null,
                    evidenceRef: null
                });
            } else {
                reasons.push({
                    type: REASON_TYPES.INSUFFICIENT_EVIDENCE,
                    statement: 'Limited evidence available for this recommendation.',
                    sourceId: null,
                    evidenceRef: null
                });
            }
        }
    
        return reasons;
    }

    /**
     * 构建 why-now
     * @private
     */
    function _buildWhyNow(recommendation, options) {
        var context = recommendation.context || {};
        var parts = [];
        
        // 当前课程/主题
        if (context.currentCourseId) {
            parts.push('current course: ' + context.currentCourseId);
        }
        if (context.currentSubjectId) {
            parts.push('current subject: ' + context.currentSubjectId);
        }
    
        // 学习者目标
        if (context.goal) {
            parts.push('aligned with your goal: ' + context.goal);
        }
    
        // 新鲜度
        var validity = recommendation.validity || {};
        if (validity.createdAt) {
            var days = Math.round((Date.now() - validity.createdAt) / (24 * 60 * 60 * 1000));
            if (days < 1) {
                parts.push('recently generated');
            } else if (days < 7) {
                parts.push('generated ' + days + ' days ago');
            }
        }
    
        if (parts.length === 0) {
            return {
                hasContext: false,
                description: null,
                parts: []
            };
        }
    
        return {
            hasContext: true,
            description: parts.join('; '),
            parts: parts
        };
    }

    /**
     * 构建限制说明
     * @private
     */
    function _buildLimitations(recommendation, options) {
        var limitations = [];
        
        // 证据不足
        var evidenceRefs = recommendation.rationale?.evidenceRefs || [];
        if (evidenceRefs.length === 0) {
            limitations.push({
                type: 'limited_evidence',
                description: 'Limited evidence supports this recommendation.'
            });    
        }
    
        // 冲突证据
        if (recommendation.conflictingSignals && recommendation.conflictingSignals.length > 0) {
            limitations.push({
                type: 'conflicting_evidence',
                description: 'Some evidence points in other directions.'
            });    
        }
    
        // 新鲜度
        var validity = recommendation.validity || {};
        if (validity.createdAt) {
            var days = Math.round((Date.now() - validity.createdAt) / (24 * 60 * 60 * 1000));
            if (days > 30) {
                limitations.push({
                    type: 'stale',
                    description: 'This recommendation was generated more than 30 days ago.'
                });
            }
        }
    
        return limitations;
    }

    /**
     * 构建简单摘要
     * @private
     */
    function _buildSimpleSummary(recommendation, reasons, options) {
        var target = recommendation.target || {};
        var action = recommendation.recommendationType || 'general';
        var isRequired = recommendation.authority?.isRequired || false;
    
        var parts = [];
        if (isRequired) {
            parts.push('Required');
        } else {
            parts.push('Recommended');
        }
    
        if (target.id) {
            parts.push('to ' + action + ' ' + (target.type || '') + ': ' + target.id);
        } else {
            parts.push('to ' + action);
        }
    
        // 添加主要理由
        if (reasons.length > 0 && reasons[0].statement) {
            parts.push('- ' + reasons[0].statement);
        }
    
        return parts.join(' ');
    }

    /**
     * 构建详细摘要
     * @private
     */
    function _buildDetailedSummary(recommendation, reasons, options) {
        var parts = [];
        var isRequired = recommendation.authority?.isRequired || false;
    
        if (isRequired) {
            parts.push('This is a required recommendation.');
        } else {
            parts.push('This is a recommended option.');
        }
    
        if (reasons.length > 0) {
            parts.push('Reasons:');
            for (var i = 0; i < Math.min(reasons.length, 3); i++) {
                if (reasons[i].statement) {
                    parts.push('  • ' + reasons[i].statement);
                }    
            }
        }
    
        return parts.join('\n');
    }    

    /**
     * 构建权威解释
     * @private
     */
    function _buildAuthorityExplanation(authority, options) {
        if (!authority) return null;
    
        var parts = [];
        parts.push('Authority level: ' + (authority.level || 'advisory'));
    
        if (authority.isRequired) {
            parts.push('This recommendation is REQUIRED.');
            if (authority.source) {
                parts.push('Source: ' + authority.source);
            }
        } else {
            parts.push('This recommendation is OPTIONAL.');
            parts.push('You are free to accept, reject, or defer it.');
        }
    
        return {
            level: authority.level || 'advisory',
            isRequired: authority.isRequired || false,
            source: authority.source || null,
            description: parts.join(' ')
        };
    }    

    /**
     * 构建上下文解释
     * @private
     */
    function _buildContextExplanation(recommendation, options) {
        var context = recommendation.context || {};
        var parts = [];
    
        if (context.currentCourseId) {
            parts.push('Current course: ' + context.currentCourseId);
        }
        if (context.currentSubjectId) {
            parts.push('Current subject: ' + context.currentSubjectId);
        }
        if (context.goal) {
            parts.push('Goal: ' + context.goal);
        }
    
        if (parts.length === 0) {
            return null;
        }
    
        return {
            hasContext: true,
            description: parts.join('; '),
            parts: parts
        };
    }

    /**
     * 构建权衡
     * @private
     */
    function _buildTradeoffs(recommendation, alternatives, options) {
        var tradeoffs = [];
    
        if (!alternatives || alternatives.length === 0) {
            return tradeoffs;
        }
    
        // 比较主推荐和替代方案
        var primaryAction = recommendation.recommendationType || 'general';
        var alternativeActions = alternatives.map(function(a) { return a.action || 'alternative'; });
    
        tradeoffs.push({
            primary: primaryAction,
            alternatives: alternativeActions,
            description: 'This recommendation is presented as the primary option. Alternatives may offer different learning approaches.'
        });
    
        return tradeoffs;
    }

    /**
     * 构建决策路径
     * @private
     */
    function _buildDecisionPath(recommendation, options) {
        var path = [];
    
        path.push({
            stage: 'recommendation',
            id: recommendation.recommendationId || null,
            description: 'Recommendation generated'
        });
    
        if (recommendation.candidateId) {
            path.push({
                stage: 'candidate',
                id: recommendation.candidateId,
                description: 'Candidate selected from arbitration'
            });
        }
    
        if (recommendation.decisionTraceId) {
            path.push({
                stage: 'arbitration',
                id: recommendation.decisionTraceId,
                description: 'Arbitration decision'
            });
        }
    
        // 信号来源
        var evidenceRefs = recommendation.rationale?.evidenceRefs || [];
        if (evidenceRefs.length > 0) {
            for (var i = 0; i < Math.min(evidenceRefs.length, 3); i++) {
                path.push({
                    stage: 'evidence',
                    id: evidenceRefs[i],
                    description: 'Supporting evidence'
                });
            }
        }
    
        return path;
    }

    /**
     * 获取解释置信度
     * @private
     */
    function _getExplanationConfidence(recommendation, options) {
        var evidenceRefs = recommendation.rationale?.evidenceRefs || [];
        var hasConflicts = recommendation.conflictingSignals && recommendation.conflictingSignals.length > 0;
        var hasRationale = recommendation.rationale?.summary !== null;
        
        if (evidenceRefs.length >= 3 && !hasConflicts && hasRationale) {
            return 'high';
        } else if (evidenceRefs.length >= 1 && hasRationale) {
            return 'medium';
        } else if (evidenceRefs.length > 0) {
            return 'low';
        }
        return 'unknown';
    }

    /**
     * 生成解释 (外部接口)
     * @param {string|Object} recommendation - 推荐 ID 或推荐对象
     * @param {string} level - 解释层级 ('simple' | 'detailed' | 'trace')
     * @param {Object} context - 上下文
     * @returns {Object} 解释
     */
    function explainRecommendationV2(recommendation, level, context) {
        level = level || 'detailed';
        context = context || getCurrentContext();
    
        // 获取推荐对象
        var rec = recommendation;
        if (typeof recommendation === 'string') {
            rec = getRecommendation(recommendation);
            if (!rec) {
                return {
                    success: false,
                    error: 'Recommendation not found',
                    recommendationId: recommendation
                };
            }
        }
    
        if (!rec) {
            return {
                success: false,
                error: 'Invalid recommendation'
            };    
        }
    
        // 创建解释
        var explanation = createExplanationContract(rec, {
            level: level,
            context: context,
            arbitrationVersion: '1.0.0'
        });
    
        // 根据层级裁剪
        var result = {
            success: true,
            recommendationId: rec.recommendationId || rec.id,
            level: level,
            explanation: explanation,
            generatedAt: Date.now()
        };
    
        if (level === 'simple') {
            result.data = explanation.simple;
        } else if (level === 'detailed') {
            result.data = explanation.detailed;
        } else if (level === 'trace') {
            result.data = explanation.trace;
        } else {
            result.data = explanation;
        }
    
        return result;
    }

    /**
     * 获取解释摘要 (用于 DevPanel)
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 解释摘要
     */
    function getExplanationSummary(recommendationId) {
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return {
                success: false,
                error: 'Recommendation not found'
            };
        }
    
        var explanation = createExplanationContract(rec);
    
        return {
            success: true,
            recommendationId: recommendationId,
            summary: explanation.simple.summary,
            isRequired: explanation.simple.isRequired,
            reasons: explanation.detailed.reasons.map(function(r) { return r.statement; }),
            evidenceCount: explanation.detailed.evidenceRefs.length,
            hasAlternatives: (explanation.detailed.alternatives || []).length > 0,
            limitations: explanation.detailed.tradeoffs || [],
            confidence: explanation.confidence,
            generatedAt: explanation.generatedAt
        };
    }

    // ============================================================
    // 🔥 Part 152: Learner Decision & Learner Choice Contract
    // ============================================================

    /**
     * 决策动作类型
     */
    var DECISION_ACTIONS = {
        ACCEPT: 'accept',
        REJECT: 'reject',
        DEFER: 'defer',
        CHOOSE_ALTERNATIVE: 'choose_alternative'
    };

    /**
     * 决策验证结果
     */
    var DECISION_VALIDATION = {
        VALID: 'valid',
        INVALID_RECOMMENDATION: 'invalid_recommendation',
        INVALID_ACTION: 'invalid_action',
        INVALID_ALTERNATIVE: 'invalid_alternative',
        HARD_PREREQUISITE_VIOLATION: 'hard_prerequisite_violation',
        DUPLICATE: 'duplicate',
        EXPIRED: 'expired'
    };

    /**
     * 创建 Learner Decision Contract
     * @param {Object} params - 参数
     * @returns {Object} Learner Decision
     */
    function createLearnerDecision(params) {
        var now = Date.now();
    
        return {
            decisionId: 'dec_' + now + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: params.recommendationId || null,
            learnerId: params.learnerId || 'default-learner',
            action: params.action || null,
            selectedAlternativeId: params.selectedAlternativeId || null,
            decisionContext: params.decisionContext || null,
            rationale: params.rationale || null,
            source: params.source || 'unknown',
            timestamp: now,
            contractVersion: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 验证 Learner Decision
     * @param {Object} decision - 决策对象
     * @param {Object} recommendation - 推荐对象
     * @param {Object} context - 上下文
     * @returns {Object} 验证结果
     */
    function validateLearnerDecision(decision, recommendation, context) {
        context = context || getCurrentContext();
    
        var result = {
            valid: false,
            reason: null,
            details: null
        };
    
        // 1. 验证推荐是否存在
        if (!recommendation) {
            result.reason = DECISION_VALIDATION.INVALID_RECOMMENDATION;
            result.details = 'Recommendation not found';
            return result;
        }
    
        // 2. 验证动作是否有效
        var validActions = Object.values(DECISION_ACTIONS);
        if (!decision.action || validActions.indexOf(decision.action) === -1) {
            result.reason = DECISION_VALIDATION.INVALID_ACTION;
            result.details = 'Invalid action: ' + decision.action;
            return result;
        }
    
        // 3. 验证替代选项
        if (decision.action === DECISION_ACTIONS.CHOOSE_ALTERNATIVE) {
            var alternatives = recommendation.alternatives || [];
            var found = false;
            for (var i = 0; i < alternatives.length; i++) {
                if (alternatives[i].candidateId === decision.selectedAlternativeId ||
                    alternatives[i].targetId === decision.selectedAlternativeId) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                result.reason = DECISION_VALIDATION.INVALID_ALTERNATIVE;
                result.details = 'Selected alternative not found: ' + decision.selectedAlternativeId;
                return result;
            }
        }
    
        // 4. 验证硬性先决条件
        if (recommendation.authority && recommendation.authority.isRequired) {
            // 如果是 required，不能 REJECT 或 DEFER (除非有特殊设计)
            if (decision.action === DECISION_ACTIONS.REJECT || decision.action === DECISION_ACTIONS.DEFER) {
                // 注意：即使是 required，我们仍允许 learner 表达意图，但记录为 blocked
                result.reason = DECISION_VALIDATION.HARD_PREREQUISITE_VIOLATION;
                result.details = 'This recommendation is required by an authoritative prerequisite';
                // 但仍然允许记录，只是标记为 blocked
                result.valid = true;
                result.isBlocked = true;
                return result;
            }
        }
    
        // 5. 验证是否过期
        var validity = recommendation.validity || {};
        if (validity.expiresAt && Date.now() > validity.expiresAt) {
            result.reason = DECISION_VALIDATION.EXPIRED;
            result.details = 'Recommendation has expired';
            result.valid = true;
            result.isExpired = true;
            return result;
        }
    
        result.valid = true;
        result.isBlocked = false;
        result.isExpired = false;
        return result;
    }

    /**
     * 记录 Learner Decision
     * @param {Object} decisionData - 决策数据
     * @param {Object} context - 上下文
     * @returns {Object} 记录结果
     */
    function recordLearnerDecision(decisionData, context) {
        context = context || getCurrentContext();
    
        // 1. 获取推荐
        var recommendationId = decisionData.recommendationId;
        var rec = getRecommendation(recommendationId);
        if (!rec) {
            return {
                success: false,
                error: 'Recommendation not found',
                recommendationId: recommendationId
            };
        }
    
        // 2. 创建决策对象
        var decision = createLearnerDecision({
            recommendationId: recommendationId,
            learnerId: decisionData.learnerId || 'default-learner',
            action: decisionData.action,
            selectedAlternativeId: decisionData.selectedAlternativeId || null,
            decisionContext: {
                recommendationVersion: rec.version || '1.0.0',
                explanationVersion: decisionData.explanationVersion || '1.0.0',
                availableAlternatives: (rec.alternatives || []).map(function(a) {
                    return { candidateId: a.candidateId, targetId: a.targetId };
                }),
                contextSnapshot: context
            },
            rationale: decisionData.rationale || null,
            source: decisionData.source || 'unknown'
        });
    
        // 3. 验证
        var validation = validateLearnerDecision(decision, rec, context);
        if (!validation.valid) {
            return {
                success: false,
                error: 'Decision validation failed',
                reason: validation.reason,
                details: validation.details,
                decision: decision
            };
        }
    
        // 4. 存储决策
        var store = _getStore();
        if (!store._decisions) {
            store._decisions = [];
        }
    
        // 检查重复 (简单去重)
        var isDuplicate = false;
        for (var i = 0; i < store._decisions.length; i++) {
            var existing = store._decisions[i];
            if (existing.recommendationId === recommendationId &&
                existing.action === decision.action &&
                existing.timestamp === decision.timestamp) {
                isDuplicate = true;
                break;
            }
        }
    
        if (isDuplicate) {
            return {
                success: false,
                error: 'Duplicate decision detected',
                reason: DECISION_VALIDATION.DUPLICATE,
                decision: decision
            };
        }
    
        // 添加决策
        decision.validationResult = {
            valid: validation.valid,
            isBlocked: validation.isBlocked || false,
            isExpired: validation.isExpired || false
        };
    
        store._decisions.push(decision);
        _saveStore(store);
        
        // 5. 更新推荐状态 (作为派生信息)
        // 不修改推荐本身，但可以在推荐上标记"最近决策"
        var recUpdate = _getStore();
        if (recUpdate[recommendationId]) {
            recUpdate[recommendationId].lastDecision = {
                action: decision.action,
                timestamp: decision.timestamp,
                decisionId: decision.decisionId
            };
            _saveStore(recUpdate);
        }
    
        // 6. 触发事件
        _emit('LEARNER_DECISION_RECORDED', {
            decisionId: decision.decisionId,
            recommendationId: recommendationId,
            action: decision.action,
            selectedAlternativeId: decision.selectedAlternativeId,
            timestamp: decision.timestamp,
            isBlocked: validation.isBlocked || false,
            isExpired: validation.isExpired || false
        });
    
        return {
            success: true,
            decision: decision,
            validation: validation
        };
    }

    /**
     * 获取决策历史
     * @param {string} recommendationId - 推荐 ID
     * @param {Object} filter - 过滤条件
     * @returns {Array} 决策历史
     */
    function getDecisionHistory(recommendationId, filter) {
        filter = filter || {};
        var store = _getStore();
        var decisions = store._decisions || [];
    
        var result = decisions;
    
        if (recommendationId) {
            result = result.filter(function(d) {
                return d.recommendationId === recommendationId;
            });
        }
    
        if (filter.action) {
            result = result.filter(function(d) {
                return d.action === filter.action;
            });
        }
    
        if (filter.fromDate) {
            result = result.filter(function(d) {
                return d.timestamp >= filter.fromDate;
            });    
        }
    
        if (filter.toDate) {
            result = result.filter(function(d) {
                return d.timestamp <= filter.toDate;
            });
        }
    
        // 按时间倒序
        result.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });    
    
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
    
        return result;
    }

    /**
     * 获取决策追踪
     * @param {string} decisionId - 决策 ID
     * @returns {Object} 决策追踪
     */
    function getDecisionTrace(decisionId) {
        var store = _getStore();
        var decisions = store._decisions || [];
    
        var decision = null;
        for (var i = 0; i < decisions.length; i++) {
            if (decisions[i].decisionId === decisionId) {
                decision = decisions[i];
                break;
            }
        }
    
        if (!decision) {
            return {
                success: false,
                error: 'Decision not found',
                decisionId: decisionId
            };
        }
    
        // 获取相关推荐
        var rec = getRecommendation(decision.recommendationId);
        
        // 构建追踪
        var trace = {
            decisionId: decision.decisionId,
            recommendationId: decision.recommendationId,
            action: decision.action,
            selectedAlternativeId: decision.selectedAlternativeId,
            timestamp: decision.timestamp,
            source: decision.source,
            rationale: decision.rationale,
            decisionContext: decision.decisionContext,
            recommendationSnapshot: rec ? {
                target: rec.target,
                recommendationType: rec.recommendationType,
                authority: rec.authority,
                status: rec.status
            } : null,
            validationResult: decision.validationResult
        };
    
        return {
            success: true,
            trace: trace
        };
    }

    /**
     * 获取决策摘要 (用于 DevPanel)
     * @param {Object} filter - 过滤条件
     * @returns {Object} 决策摘要
     */
    function getDecisionSummary(filter) {
        filter = filter || {};
        var store = _getStore();
        var decisions = store._decisions || [];
    
        var summary = {
            total: decisions.length,
            byAction: {
                accept: 0,
                reject: 0,
                defer: 0,
                choose_alternative: 0
            },
            bySource: {},
            recent: decisions.slice(-10).reverse(),
            blockedCount: 0,
            expiredCount: 0
        };
    
        for (var i = 0; i < decisions.length; i++) {
            var d = decisions[i];
            if (summary.byAction[d.action] !== undefined) {
                summary.byAction[d.action]++;
            }
            if (d.validationResult) {
                if (d.validationResult.isBlocked) summary.blockedCount++;
                if (d.validationResult.isExpired) summary.expiredCount++;
            }
            if (d.source) {
                summary.bySource[d.source] = (summary.bySource[d.source] || 0) + 1;
            }
        }
    
        return summary;
    }

    // ============================================================
    // 🔥 Part 153: Learning Outcome Contract & Outcome Observation
    // ============================================================

    /**
     * 结果状态
     */
    var OUTCOME_STATUS = {
        OBSERVED: 'observed',
        PARTIAL: 'partial',
        INCOMPLETE: 'incomplete',
        UNKNOWN: 'unknown'
    };    

    /**
     * 结果类型
     */
    var OUTCOME_TYPES = {
        STARTED: 'started',
        PROGRESSED: 'progressed',
        COMPLETED: 'completed',
        ASSESSED: 'assessed',
        IMPROVED: 'improved',
        NO_PROGRESS: 'no_progress',
        REGRESSED: 'regressed',
        ABANDONED: 'abandoned'
    };

    /**
     * 活动状态
     */
    var ACTIVITY_STATUS = {
        STARTED: 'started',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        ABANDONED: 'abandoned'
    };    

    /**
     * 创建 Outcome Contract
     * @param {Object} params - 参数
     * @returns {Object} Outcome
     */
    function createOutcome(params) {
        var now = Date.now();
        
        return {
            outcomeId: 'out_' + now + '_' + Math.random().toString(36).substr(2, 4),
            learnerId: params.learnerId || 'default-learner',
            recommendationId: params.recommendationId || null,
            decisionId: params.decisionId || null,
            activityId: params.activityId || null,
        
            // 结果分类
            outcomeType: params.outcomeType || OUTCOME_TYPES.UNKNOWN,
            outcomeStatus: params.outcomeStatus || OUTCOME_STATUS.UNKNOWN,
            
            // 活动状态 (单独跟踪)
            activityStatus: params.activityStatus || null,
        
            // 证据
            evidenceRefs: params.evidenceRefs || [],
        
            // 指标
            metrics: params.metrics || {},
        
            // 时间
            observedAt: params.observedAt || now,
            startedAt: params.startedAt || null,
            completedAt: params.completedAt || null,
        
            // 来源
            source: params.source || 'system',
            sourceRef: params.sourceRef || null,
        
            // 版本
            contractVersion: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 记录 Outcome
     * @param {Object} outcomeData - 结果数据
     * @param {Object} context - 上下文
     * @returns {Object} 记录结果
     */
    function recordOutcome(outcomeData, context) {
        context = context || getCurrentContext();
    
        // 1. 验证输入
        var validation = _validateOutcome(outcomeData, context);
        if (!validation.valid) {
            return {
                success: false,
                error: 'Outcome validation failed',
                reason: validation.reason,
                details: validation.details
            };
        }
    
        // 2. 获取相关数据
        var recommendationId = outcomeData.recommendationId || null;
        var decisionId = outcomeData.decisionId || null;
        var activityId = outcomeData.activityId || null;
    
        // 3. 构建指标 (从现有系统获取)
        var metrics = _gatherOutcomeMetrics(outcomeData, context);
        
        // 4. 构建证据引用
        var evidenceRefs = _gatherOutcomeEvidence(outcomeData, context);
    
        // 5. 创建 Outcome
        var outcome = createOutcome({
            learnerId: outcomeData.learnerId || 'default-learner',
            recommendationId: recommendationId,
            decisionId: decisionId,
            activityId: activityId,
            outcomeType: outcomeData.outcomeType || OUTCOME_TYPES.UNKNOWN,
            outcomeStatus: outcomeData.outcomeStatus || OUTCOME_STATUS.OBSERVED,
            activityStatus: outcomeData.activityStatus || null,
            evidenceRefs: evidenceRefs,
            metrics: metrics,
            observedAt: outcomeData.observedAt || Date.now(),
            startedAt: outcomeData.startedAt || null,
            completedAt: outcomeData.completedAt || null,
            source: outcomeData.source || 'system',
            sourceRef: outcomeData.sourceRef || null
        });
    
        // 6. 存储
        var store = _getStore();
        if (!store._outcomes) {
            store._outcomes = [];
        }    
    
        // 检查重复
        var isDuplicate = _checkOutcomeDuplicate(store._outcomes, outcome);
        if (isDuplicate) {
            return {
                success: false,
                error: 'Duplicate outcome detected',
                reason: 'duplicate',
                outcome: outcome
            };
        }
    
        store._outcomes.push(outcome);
        _saveStore(store);
        
        // 7. 触发事件
        _emit('LEARNING_OUTCOME_RECORDED', {
            outcomeId: outcome.outcomeId,
            recommendationId: outcome.recommendationId,
            decisionId: outcome.decisionId,
            activityId: outcome.activityId,
            outcomeType: outcome.outcomeType,
            metrics: outcome.metrics,
            timestamp: outcome.observedAt
        });
    
        return {
            success: true,
            outcome: outcome
        };    
    }

    /**
     * 验证 Outcome
     * @private
     */
    function _validateOutcome(outcomeData, context) {
        // 至少需要 activityId 或 outcomeType
        if (!outcomeData.activityId && !outcomeData.outcomeType) {
            return { valid: false, reason: 'missing_activity_or_outcome', details: 'Either activityId or outcomeType required' };
        }
    
        // 验证 outcomeType
        var validTypes = Object.values(OUTCOME_TYPES);
        if (outcomeData.outcomeType && validTypes.indexOf(outcomeData.outcomeType) === -1) {
            return { valid: false, reason: 'invalid_outcome_type', details: outcomeData.outcomeType };
        }
    
        // 验证 activityStatus
        var validActivityStatus = Object.values(ACTIVITY_STATUS);
        if (outcomeData.activityStatus && validActivityStatus.indexOf(outcomeData.activityStatus) === -1) {
            return { valid: false, reason: 'invalid_activity_status', details: outcomeData.activityStatus };
        }
    
        // 如果有 recommendationId，验证是否存在
        if (outcomeData.recommendationId) {
            var rec = getRecommendation(outcomeData.recommendationId);
            if (!rec) {
                return { valid: false, reason: 'recommendation_not_found', details: outcomeData.recommendationId };
            }
        }
    
        return { valid: true };
    }

    /**
     * 检查重复 Outcome
     * @private
     */
    function _checkOutcomeDuplicate(existingOutcomes, newOutcome) {
        for (var i = 0; i < existingOutcomes.length; i++) {
            var o = existingOutcomes[i];
            // 相同的 recommendationId + activityId + outcomeType + 相近时间
            if (o.recommendationId === newOutcome.recommendationId &&
                o.activityId === newOutcome.activityId &&
                o.outcomeType === newOutcome.outcomeType &&
                Math.abs(o.observedAt - newOutcome.observedAt) < 5000) {
                return true;
            }
        }
        return false;
    }

    /**
     * 收集 Outcome 指标
     * @private
     */
    function _gatherOutcomeMetrics(outcomeData, context) {
        var metrics = outcomeData.metrics || {};
    
        // 从 MasteryEngine 获取 mastery 变化
        if (outcomeData.targetId) {
            try {
                var mastery = window.LawAIApp?.MasteryEngine;
                if (mastery) {
                    var record = mastery.getMastery(outcomeData.targetId);
                    if (record) {
                        metrics.masteryLevel = record.masteryLevel || 0;
                        metrics.masteryState = record.state || 'UNASSESSED';
                        metrics.masteryConfidence = record.confidence || 0;
                        metrics.evidenceCount = record.evidenceCount || 0;
                    }
                }
            } catch (e) {}
        }
    
        // 从 ProgressEngine 获取进度
        try {
            var progress = window.LawAIApp?.ProgressEngine;
            if (progress) {
                var prog = progress.getProgress();
                metrics.completionPercent = prog.completionPercent || 0;
                metrics.xp = prog.xp || 0;
                metrics.level = prog.level || 1;
                metrics.streak = prog.streak || 0;
            }
        } catch (e) {}
    
        return metrics;
    }

    /**
     * 收集 Outcome 证据
     * @private
     */
    function _gatherOutcomeEvidence(outcomeData, context) {
        var evidenceRefs = outcomeData.evidenceRefs || [];
    
        // 如果有 activityId，添加 activity 证据
        if (outcomeData.activityId) {
            evidenceRefs.push({
                type: 'activity',
                id: outcomeData.activityId,
                timestamp: Date.now()
            });    
        }
    
        // 如果有 recommendationId，添加推荐证据
        if (outcomeData.recommendationId) {
            evidenceRefs.push({
                type: 'recommendation',
                id: outcomeData.recommendationId,
                timestamp: Date.now()
            });
        }
    
        return evidenceRefs;
    }

    /**
     * 获取 Outcome 历史
     * @param {string} recommendationId - 推荐 ID
     * @param {Object} filter - 过滤条件
     * @returns {Array} 结果历史
     */
    function getOutcomeHistory(recommendationId, filter) {
        filter = filter || {};
        var store = _getStore();
        var outcomes = store._outcomes || [];
    
        var result = outcomes;
    
        if (recommendationId) {
            result = result.filter(function(o) {
                return o.recommendationId === recommendationId;
            });
        }
    
        if (filter.decisionId) {
            result = result.filter(function(o) {
                return o.decisionId === filter.decisionId;
            });
        }
    
        if (filter.activityId) {
            result = result.filter(function(o) {
                return o.activityId === filter.activityId;
            });
        }
    
        if (filter.outcomeType) {
            result = result.filter(function(o) {
                return o.outcomeType === filter.outcomeType;
            });
        }
    
        if (filter.fromDate) {
            result = result.filter(function(o) {
                return o.observedAt >= filter.fromDate;
            });
        }
    
        if (filter.toDate) {
            result = result.filter(function(o) {
                return o.observedAt <= filter.toDate;
            });
        }
    
        // 按时间倒序
        result.sort(function(a, b) {
            return b.observedAt - a.observedAt;
        });
    
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
    
        return result;
    }

    /**
     * 获取 Outcome 摘要
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 结果摘要
     */
    function getOutcomeSummary(recommendationId) {
        var outcomes = getOutcomeHistory(recommendationId);
    
        var summary = {
            total: outcomes.length,
            byType: {},
            byStatus: {},
            recent: outcomes.slice(0, 5),
            hasPositive: false,
            hasNegative: false,
            hasUnknown: false,
            latest: outcomes.length > 0 ? outcomes[0] : null
        };
    
        for (var i = 0; i < outcomes.length; i++) {
            var o = outcomes[i];
            if (summary.byType[o.outcomeType] !== undefined) {
                summary.byType[o.outcomeType]++;
            } else {
                summary.byType[o.outcomeType] = 1;
            }
            if (summary.byStatus[o.outcomeStatus] !== undefined) {
                summary.byStatus[o.outcomeStatus]++;
            } else {
                summary.byStatus[o.outcomeStatus] = 1;
            }
        
            if (o.outcomeType === 'improved' || o.outcomeType === 'completed') {
                summary.hasPositive = true;
            }
            if (o.outcomeType === 'regressed' || o.outcomeType === 'abandoned') {
                summary.hasNegative = true;
            }
            if (o.outcomeType === 'unknown') {
                summary.hasUnknown = true;
            }
        }
    
        return summary;
    }

    // ============================================================
    // 🔥 Part 154: Feedback Contract & Recommendation Outcome Loop
    // ============================================================

    /**
     * 反馈来源类型
     */
    var FEEDBACK_SOURCE_TYPES = {
        LEARNER: 'learner',
        SYSTEM: 'system',
        ASSESSMENT: 'assessment',
        ACTIVITY: 'activity',
        BEHAVIORAL: 'behavioral_observation',
        RECOMMENDATION: 'recommendation'
    };    

    /**
     * 反馈类型
     */
    var FEEDBACK_TYPES = {
        USEFULNESS: 'usefulness',
        RELEVANCE: 'relevance',
        DIFFICULTY_FIT: 'difficulty_fit',
        FORMAT_FIT: 'format_fit',
        TIMING_FIT: 'timing_fit',
        ENGAGEMENT: 'engagement',
        CONFIDENCE: 'confidence',
        CLARITY: 'clarity',
        FRUSTRATION: 'frustration',
        SATISFACTION: 'satisfaction',
        OUTCOME_ALIGNMENT: 'outcome_alignment'
    };

    /**
     * 反馈值类型
     */
    var FEEDBACK_VALUES = {
        POSITIVE: 'positive',
        NEGATIVE: 'negative',
        NEUTRAL: 'neutral',
        MIXED: 'mixed',
        TOO_EASY: 'too_easy',
        TOO_HARD: 'too_hard',
        JUST_RIGHT: 'just_right',
        CLEAR: 'clear',
        UNCLEAR: 'unclear',
        RELEVANT: 'relevant',
        NOT_RELEVANT: 'not_relevant',
        HELPFUL: 'helpful',
        NOT_HELPFUL: 'not_helpful',
        ENGAGED: 'engaged',
        NOT_ENGAGED: 'not_engaged',
        UNKNOWN: 'unknown'
    };    

    /**
     * 推荐结果状态
     */
    var RECOMMENDATION_OUTCOME_STATUS = {
        POSITIVE: 'positive',
        NEUTRAL: 'neutral',
        NEGATIVE: 'negative',
        MIXED: 'mixed',
        UNKNOWN: 'unknown',
        INSUFFICIENT_EVIDENCE: 'insufficient_evidence'
    };

    /**
     * 创建 Feedback Contract
     * @param {Object} params - 参数
     * @returns {Object} Feedback 对象
     */
    function createFeedback(params) {
        var now = Date.now();
        
        return {
            feedbackId: 'fb_' + now + '_' + Math.random().toString(36).substr(2, 4),
            learnerId: params.learnerId || 'default-learner',
        
            // 来源
            sourceType: params.sourceType || FEEDBACK_SOURCE_TYPES.SYSTEM,
            sourceId: params.sourceId || null,
        
            // 目标
            targetType: params.targetType || 'recommendation',
            targetId: params.targetId || null,
        
            // 反馈内容
            feedbackType: params.feedbackType || FEEDBACK_TYPES.USEFULNESS,
            feedbackValue: params.feedbackValue || FEEDBACK_VALUES.UNKNOWN,
        
            // 信号 (规范化的反馈)
            signal: params.signal || null,
        
            // 置信度
            confidence: params.confidence || 0.5,
        
            // 证据
            evidence: params.evidence || [],
        
            // 上下文
            context: params.context || null,
        
            // 关联 ID
            relatedOutcomeId: params.relatedOutcomeId || null,
            relatedRecommendationId: params.relatedRecommendationId || null,
            relatedDecisionId: params.relatedDecisionId || null,
            relatedActivityId: params.relatedActivityId || null,
        
            // 状态
            status: params.status || 'recorded',
        
            // 元数据
            isExplicit: params.isExplicit || false,
            isInferred: params.isInferred || false,
            metadata: params.metadata || {},
            
            // 时间
            timestamp: now,
            version: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }

    /**
     * 记录反馈
     * @param {Object} feedbackData - 反馈数据
     * @param {Object} context - 上下文
     * @returns {Object} 记录结果
     */
    function recordFeedback(feedbackData, context) {
        context = context || getCurrentContext();
    
        // 1. 验证
        var validation = _validateFeedback(feedbackData, context);
        if (!validation.valid) {
            return {
                success: false,
                error: 'Feedback validation failed',
                reason: validation.reason,
                details: validation.details
            };
        }
    
        // 2. 判断 explicit vs inferred
        var isExplicit = feedbackData.isExplicit !== undefined ? feedbackData.isExplicit : 
                         (feedbackData.sourceType === FEEDBACK_SOURCE_TYPES.LEARNER);
        var isInferred = !isExplicit;
    
        // 3. 创建 Feedback
        var feedback = createFeedback({
            learnerId: feedbackData.learnerId || 'default-learner',
            sourceType: feedbackData.sourceType || FEEDBACK_SOURCE_TYPES.SYSTEM,
            sourceId: feedbackData.sourceId || null,
            targetType: feedbackData.targetType || 'recommendation',
            targetId: feedbackData.targetId || null,
            feedbackType: feedbackData.feedbackType || FEEDBACK_TYPES.USEFULNESS,
            feedbackValue: feedbackData.feedbackValue || FEEDBACK_VALUES.UNKNOWN,
            signal: feedbackData.signal || null,
            confidence: feedbackData.confidence || 0.5,
            evidence: feedbackData.evidence || [],
            context: feedbackData.context || context,
            relatedOutcomeId: feedbackData.relatedOutcomeId || null,
            relatedRecommendationId: feedbackData.relatedRecommendationId || null,
            relatedDecisionId: feedbackData.relatedDecisionId || null,
            relatedActivityId: feedbackData.relatedActivityId || null,
            status: 'recorded',
            isExplicit: isExplicit,
            isInferred: isInferred,
            metadata: feedbackData.metadata || {}
        });    
    
        // 4. 存储
        var store = _getStore();
        if (!store._feedback) {
            store._feedback = [];
        }
    
        // 检查重复
        var isDuplicate = _checkFeedbackDuplicate(store._feedback, feedback);
        if (isDuplicate) {
            return {
                success: false,
                error: 'Duplicate feedback detected',
                reason: 'duplicate',
                feedback: feedback
            };
        }
    
        store._feedback.push(feedback);
        _saveStore(store);
    
        // 5. 生成 Recommendation Outcome Signal
        var outcomeSignal = _generateRecommendationOutcomeSignal(feedback, context);
        if (outcomeSignal) {
            if (!store._recommendationOutcomes) {
                store._recommendationOutcomes = [];
            }
            store._recommendationOutcomes.push(outcomeSignal);
            _saveStore(store);
        }
    
        // 6. 触发事件
        _emit('LEARNING_FEEDBACK_RECORDED', {
            feedbackId: feedback.feedbackId,
            feedbackType: feedback.feedbackType,
            feedbackValue: feedback.feedbackValue,
            isExplicit: feedback.isExplicit,
            isInferred: feedback.isInferred,
            relatedRecommendationId: feedback.relatedRecommendationId,
            timestamp: feedback.timestamp
        });
    
        if (outcomeSignal) {
            _emit('RECOMMENDATION_OUTCOME_OBSERVED', {
                recommendationId: outcomeSignal.recommendationId,
                outcomeStatus: outcomeSignal.outcomeStatus,
                signal: outcomeSignal.signal,
                timestamp: outcomeSignal.observedAt
            });
        }
    
        return {
            success: true,
            feedback: feedback,
            outcomeSignal: outcomeSignal
        };
    }

    /**
     * 验证反馈
     * @private
     */
    function _validateFeedback(feedbackData, context) {
        // 必须有 targetId 或 targetType
        if (!feedbackData.targetId && !feedbackData.targetType) {
            return { valid: false, reason: 'missing_target', details: 'Either targetId or targetType required' };
        }    
    
        // 验证反馈类型
        var validTypes = Object.values(FEEDBACK_TYPES);
        if (feedbackData.feedbackType && validTypes.indexOf(feedbackData.feedbackType) === -1) {
            return { valid: false, reason: 'invalid_feedback_type', details: feedbackData.feedbackType };
        }
    
        // 验证反馈值
        var validValues = Object.values(FEEDBACK_VALUES);
        if (feedbackData.feedbackValue && validValues.indexOf(feedbackData.feedbackValue) === -1) {
            return { valid: false, reason: 'invalid_feedback_value', details: feedbackData.feedbackValue };
        }
    
        return { valid: true };
    }

    /**
     * 检查反馈重复
     * @private
     */
    function _checkFeedbackDuplicate(existingFeedback, newFeedback) {
        for (var i = 0; i < existingFeedback.length; i++) {
            var f = existingFeedback[i];
            if (f.targetId === newFeedback.targetId &&
                f.feedbackType === newFeedback.feedbackType &&
                f.feedbackValue === newFeedback.feedbackValue &&
                Math.abs(f.timestamp - newFeedback.timestamp) < 5000) {
                return true;
            }
        }
        return false;
    }

    /**
     * 生成 Recommendation Outcome Signal
     * @private
     */
    function _generateRecommendationOutcomeSignal(feedback, context) {
        // 如果没有关联推荐，不生成
        if (!feedback.relatedRecommendationId) {
            return null;
        }
    
        var now = Date.now();
        var outcomeStatus = RECOMMENDATION_OUTCOME_STATUS.UNKNOWN;
        var signal = null;
    
        // 根据反馈值判断
        var value = feedback.feedbackValue;
        var type = feedback.feedbackType;
    
        if (value === FEEDBACK_VALUES.POSITIVE || 
            value === FEEDBACK_VALUES.HELPFUL ||
            value === FEEDBACK_VALUES.RELEVANT ||
            value === FEEDBACK_VALUES.JUST_RIGHT) {
            outcomeStatus = RECOMMENDATION_OUTCOME_STATUS.POSITIVE;
            signal = 'positive_outcome';
        } else if (value === FEEDBACK_VALUES.NEGATIVE ||
                   value === FEEDBACK_VALUES.NOT_HELPFUL ||
                   value === FEEDBACK_VALUES.NOT_RELEVANT ||
                   value === FEEDBACK_VALUES.TOO_HARD ||
                   value === FEEDBACK_VALUES.UNCLEAR) {
            outcomeStatus = RECOMMENDATION_OUTCOME_STATUS.NEGATIVE;
            signal = 'negative_outcome';
        } else if (value === FEEDBACK_VALUES.MIXED) {
            outcomeStatus = RECOMMENDATION_OUTCOME_STATUS.MIXED;
            signal = 'mixed_outcome';
        } else if (value === FEEDBACK_VALUES.NEUTRAL) {
            outcomeStatus = RECOMMENDATION_OUTCOME_STATUS.NEUTRAL;
            signal = 'neutral_outcome';
        }
    
        // 如果是 inferred feedback，降低置信度
        var confidence = feedback.isExplicit ? 0.8 : 0.5;
    
        return {
            signalId: 'ros_' + now + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: feedback.relatedRecommendationId,
            feedbackId: feedback.feedbackId,
            decisionId: feedback.relatedDecisionId,
            activityId: feedback.relatedActivityId,
            outcomeId: feedback.relatedOutcomeId,
            outcomeStatus: outcomeStatus,
            signal: signal,
            confidence: confidence,
            evidence: feedback.evidence,
            context: feedback.context,
            isExplicit: feedback.isExplicit,
            isInferred: feedback.isInferred,
            observedAt: now,
            evaluationWindow: 'immediate',
            version: '1.0.0'
        };
    }

    /**
     * 获取推荐结果信号
     * @param {string} recommendationId - 推荐 ID
     * @returns {Array} 结果信号列表
     */
    function getRecommendationOutcomeSignals(recommendationId) {
        var store = _getStore();
        var signals = store._recommendationOutcomes || [];
        
        if (recommendationId) {
            signals = signals.filter(function(s) {
                return s.recommendationId === recommendationId;
            });
        }
    
        return signals;
    }

    /**
     * 获取反馈历史
     * @param {string} targetId - 目标 ID
     * @param {Object} filter - 过滤条件
     * @returns {Array} 反馈历史
     */
    function getFeedbackHistory(targetId, filter) {
        filter = filter || {};
        var store = _getStore();
        var feedback = store._feedback || [];
        
        var result = feedback;
    
        if (targetId) {
            result = result.filter(function(f) {
                return f.targetId === targetId;
            });
        }
    
        if (filter.feedbackType) {
            result = result.filter(function(f) {
                return f.feedbackType === filter.feedbackType;
            });
        }
    
        if (filter.sourceType) {
            result = result.filter(function(f) {
                return f.sourceType === filter.sourceType;
            });
        }
    
        if (filter.fromDate) {
            result = result.filter(function(f) {
                return f.timestamp >= filter.fromDate;
            });
        }
    
        if (filter.toDate) {
            result = result.filter(function(f) {
                return f.timestamp <= filter.toDate;
            });
        }
    
        result.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });
    
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
    
        return result;
    }

    /**
     * 获取反馈摘要
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 反馈摘要
     */
    function getFeedbackSummary(recommendationId) {
        var signals = getRecommendationOutcomeSignals(recommendationId);
        var feedback = getFeedbackHistory(null, {});
    
        var summary = {
            totalSignals: signals.length,
            byStatus: {},
            byType: {},
            explicitCount: 0,
            inferredCount: 0,
            recentSignals: signals.slice(0, 5)
        };    
    
        for (var i = 0; i < signals.length; i++) {
            var s = signals[i];
            if (summary.byStatus[s.outcomeStatus] !== undefined) {
                summary.byStatus[s.outcomeStatus]++;
            } else {
                summary.byStatus[s.outcomeStatus] = 1;
            }
            if (s.isExplicit) summary.explicitCount++;
            if (s.isInferred) summary.inferredCount++;
        }
    
        return summary;
    }

    // ============================================================
    // 🔥 Part 155: Adaptive Calibration Boundary
    // ============================================================

    /**
     * 校准动作类型
     */
    var CALIBRATION_ACTIONS = {
        NO_CHANGE: 'no_change',
        DEFER: 'defer',
        INCREASE_WEIGHT: 'increase_weight',
        DECREASE_WEIGHT: 'decrease_weight',
        EXPAND_CONFIDENCE: 'expand_confidence',
        REDUCE_CONFIDENCE: 'reduce_confidence',
        NARROW_SCOPE: 'narrow_scope',
        EXPAND_SCOPE: 'expand_scope'
    };    

    /**
     * 校准状态
     */
    var CALIBRATION_STATUS = {
        UNKNOWN: 'unknown',
        EARLY_SIGNAL: 'early_signal',
        EMERGING_PATTERN: 'emerging_pattern',
        STABLE_PATTERN: 'stable_pattern'
    };

    /**
     * 校准维度
     */
    var CALIBRATION_DIMENSIONS = {
        DIFFICULTY_FIT: 'difficulty_fit',
        CONTENT_RELEVANCE: 'content_relevance',
        FORMAT_FIT: 'format_fit',
        TIMING_FIT: 'timing_fit',
        TOPIC_INTEREST: 'topic_interest',
        ACTIVITY_TYPE_FIT: 'activity_type_fit',
        RECOMMENDATION_ACCEPTANCE: 'recommendation_acceptance',
        RECOMMENDATION_EFFECTIVENESS: 'recommendation_effectiveness'
    };

    /**
     * 创建 Calibration Evidence
     * @param {Object} params - 参数
     * @returns {Object} Calibration Evidence
     */
    function createCalibrationEvidence(params) {
        var now = Date.now();
    
        return {
            evidenceId: 'ce_' + now + '_' + Math.random().toString(36).substr(2, 4),
            learnerId: params.learnerId || 'default-learner',
            sourceType: params.sourceType || 'recommendation_outcome',
            sourceId: params.sourceId || null,
            recommendationId: params.recommendationId || null,
            signalId: params.signalId || null,
            dimension: params.dimension || CALIBRATION_DIMENSIONS.RECOMMENDATION_EFFECTIVENESS,
            value: params.value || 'neutral',
            confidence: params.confidence || 0.5,
            scope: params.scope || { type: 'global', id: null },
            context: params.context || null,
            recency: params.recency || 'recent',
            repetition: params.repetition || 1,
            provenance: params.provenance || [],
            observedAt: now,
            version: '1.0.0'
        };
    }

    /**
     * 创建 Calibration Decision
     * @param {Object} params - 参数
     * @returns {Object} Calibration Decision
     */
    function createCalibrationDecision(params) {
        var now = Date.now();
    
        return {
            decisionId: 'cd_' + now + '_' + Math.random().toString(36).substr(2, 4),
            action: params.action || CALIBRATION_ACTIONS.NO_CHANGE,
            dimension: params.dimension || CALIBRATION_DIMENSIONS.RECOMMENDATION_EFFECTIVENESS,
            scope: params.scope || { type: 'global', id: null },
            evidenceRefs: params.evidenceRefs || [],
            confidence: params.confidence || 0.5,
            reason: params.reason || 'insufficient_evidence',
            previousState: params.previousState || null,
            proposedState: params.proposedState || null,
            status: params.status || 'recorded',
            timestamp: now,
            version: '1.0.0'
        };
    }

    /**
     * 处理校准
     * @param {Object} signal - Recommendation Outcome Signal
     * @param {Object} context - 上下文
     * @returns {Object} 校准结果
     */
    function processCalibration(signal, context) {
        context = context || getCurrentContext();
    
        if (!signal) {
            return {
                success: false,
                error: 'No signal provided',
                decision: null
            };
        }
    
        // 1. 收集证据
        var evidence = _collectCalibrationEvidence(signal, context);
        if (!evidence || evidence.length === 0) {
            return {
                success: false,
                error: 'No evidence collected',
                decision: null
            };
        }
    
        // 2. 评估证据
        var evaluation = _evaluateCalibrationEvidence(evidence, context);
        
        // 3. 做出决策
        var decision = _makeCalibrationDecision(evaluation, context);
    
        // 4. 存储决策
        var store = _getStore();
        if (!store._calibrationDecisions) {
            store._calibrationDecisions = [];
        }
        store._calibrationDecisions.push(decision);
        _saveStore(store);
    
        // 5. 更新自适应状态
        var adaptiveState = _updateAdaptiveState(decision, context);
        store._adaptiveState = adaptiveState;
        _saveStore(store);
    
        // 6. 触发事件
        _emit('CALIBRATION_DECISION_MADE', {
            decisionId: decision.decisionId,
            action: decision.action,
            dimension: decision.dimension,
            confidence: decision.confidence,
            reason: decision.reason,
            timestamp: decision.timestamp
        });
    
        return {
            success: true,
            evidence: evidence,
            evaluation: evaluation,
            decision: decision,
            adaptiveState: adaptiveState
        };
    }

    /**
     * 收集校准证据
     * @private
     */
    function _collectCalibrationEvidence(signal, context) {
        var evidence = [];
    
        if (!signal) return evidence;
        
        // 从 signal 创建证据
        var dims = [
            CALIBRATION_DIMENSIONS.RECOMMENDATION_EFFECTIVENESS,
            CALIBRATION_DIMENSIONS.FORMAT_FIT,
            CALIBRATION_DIMENSIONS.DIFFICULTY_FIT
        ];
    
        for (var i = 0; i < dims.length; i++) {
            var dim = dims[i];
            var value = 'neutral';
            var confidence = signal.confidence || 0.5;
            
            if (signal.outcomeStatus === 'positive') {
                value = 'positive';
                confidence = Math.min(1, confidence + 0.2);
            } else if (signal.outcomeStatus === 'negative') {
                value = 'negative';
                confidence = Math.min(1, confidence + 0.1);
            }
        
            evidence.push(createCalibrationEvidence({
                sourceType: 'recommendation_outcome',
                sourceId: signal.signalId,
                recommendationId: signal.recommendationId,
                signalId: signal.signalId,
                dimension: dim,
                value: value,
                confidence: confidence,
                scope: { type: 'global', id: null },
                context: signal.context,
                recency: 'recent',
                repetition: 1,
                provenance: [{
                    type: 'signal',
                    id: signal.signalId,
                    timestamp: signal.observedAt
                }]    
            }));
        }
    
        return evidence;
    }

    /**
     * 评估校准证据
     * @private
     */
    function _evaluateCalibrationEvidence(evidence, context) {
        var evaluation = {
            hasPositiveEvidence: false,
            hasNegativeEvidence: false,
            hasMixedEvidence: false,
            confidence: 'low',
            count: evidence.length,
            positiveCount: 0,
            negativeCount: 0,
            neutralCount: 0,
            byDimension: {}
        };
    
        for (var i = 0; i < evidence.length; i++) {
            var e = evidence[i];
            var dim = e.dimension;
            if (!evaluation.byDimension[dim]) {
                evaluation.byDimension[dim] = { positive: 0, negative: 0, neutral: 0 };
            }
        
            if (e.value === 'positive') {
                evaluation.positiveCount++;
                evaluation.byDimension[dim].positive++;
                evaluation.hasPositiveEvidence = true;
            } else if (e.value === 'negative') {
                evaluation.negativeCount++;
                evaluation.byDimension[dim].negative++;
                evaluation.hasNegativeEvidence = true;
            } else {
                evaluation.neutralCount++;
                evaluation.byDimension[dim].neutral++;
            }
        }
    
        if (evaluation.positiveCount > 0 && evaluation.negativeCount > 0) {
            evaluation.hasMixedEvidence = true;
            evaluation.confidence = 'medium';
        } else if (evaluation.positiveCount > 0) {
            evaluation.confidence = evaluation.positiveCount >= 3 ? 'high' : 'medium';
        } else if (evaluation.negativeCount > 0) {
            evaluation.confidence = evaluation.negativeCount >= 3 ? 'medium' : 'low';
        } else {
            evaluation.confidence = 'low';
        }
    
        return evaluation;
    }

    /**
     * 做出校准决策
     * @private
     */
    function _makeCalibrationDecision(evaluation, context) {
        var action = CALIBRATION_ACTIONS.NO_CHANGE;
        var confidence = 0.5;
        var reason = 'insufficient_evidence';
        var dimension = CALIBRATION_DIMENSIONS.RECOMMENDATION_EFFECTIVENESS;
        var proposedState = null;
    
        // 如果证据不足
        if (evaluation.count < 2) {
            action = CALIBRATION_ACTIONS.DEFER;
            reason = 'insufficient_evidence';
            confidence = 0.3;
            return createCalibrationDecision({
                action: action,
                dimension: dimension,
                confidence: confidence,
                reason: reason,
                previousState: null,
                proposedState: null
            });
        }
    
        // 如果有混合证据
        if (evaluation.hasMixedEvidence) {
            action = CALIBRATION_ACTIONS.NO_CHANGE;
            reason = 'conflicting_evidence';
            confidence = 0.4;
            return createCalibrationDecision({
                action: action,
                dimension: dimension,
                confidence: confidence,
                reason: reason,
                previousState: null,
                proposedState: null
            });
        }
    
        // 如果有正证据
        if (evaluation.hasPositiveEvidence && !evaluation.hasNegativeEvidence) {
            if (evaluation.positiveCount >= 3) {
                action = CALIBRATION_ACTIONS.INCREASE_WEIGHT;
                confidence = 0.7;
                reason = 'consistent_positive_evidence';
                proposedState = { weightChange: '+', confidence: 'increased' };
            } else {
                action = CALIBRATION_ACTIONS.EXPAND_CONFIDENCE;
                confidence = 0.5;
                reason = 'emerging_positive_pattern';
                proposedState = { confidence: 'expanding' };
            }
        }
    
        // 如果有负证据
        if (evaluation.hasNegativeEvidence && !evaluation.hasPositiveEvidence) {
            if (evaluation.negativeCount >= 3) {
                action = CALIBRATION_ACTIONS.DECREASE_WEIGHT;
                confidence = 0.6;
                reason = 'consistent_negative_evidence';
                proposedState = { weightChange: '-', confidence: 'reduced' };
            } else {
                action = CALIBRATION_ACTIONS.REDUCE_CONFIDENCE;
                confidence = 0.4;
                reason = 'emerging_negative_pattern';
                proposedState = { confidence: 'reducing' };
            }    
        }
    
        return createCalibrationDecision({
            action: action,
            dimension: dimension,
            confidence: confidence,
            reason: reason,
            previousState: null,
            proposedState: proposedState,
            evidenceRefs: evaluation
        });
    }

    /**
     * 更新自适应状态
     * @private
     */
    function _updateAdaptiveState(decision, context) {
        var store = _getStore();
        var currentState = store._adaptiveState || {
            dimensions: {},
            evidenceCount: 0,
            confidence: 'low',
            updatedAt: null,
            version: '1.0.0'
        };
    
        var dim = decision.dimension;
        if (!currentState.dimensions[dim]) {
            currentState.dimensions[dim] = {
                weight: 0,
                confidence: 'low',
                lastUpdated: null,
                evidenceCount: 0
            };
        }    
    
        // 应用决策
        var dimState = currentState.dimensions[dim];
        var action = decision.action;
    
        if (action === CALIBRATION_ACTIONS.INCREASE_WEIGHT) {
            dimState.weight = Math.min(1, (dimState.weight || 0) + 0.1);
            dimState.confidence = 'medium';
        } else if (action === CALIBRATION_ACTIONS.DECREASE_WEIGHT) {
            dimState.weight = Math.max(0, (dimState.weight || 0) - 0.1);
            dimState.confidence = 'medium';
        } else if (action === CALIBRATION_ACTIONS.EXPAND_CONFIDENCE) {
            dimState.confidence = 'medium';
        } else if (action === CALIBRATION_ACTIONS.REDUCE_CONFIDENCE) {
            dimState.confidence = 'low';
        }
    
        dimState.lastUpdated = Date.now();
        dimState.evidenceCount = (dimState.evidenceCount || 0) + 1;
    
        currentState.evidenceCount++;
        currentState.updatedAt = Date.now();
    
        // 计算整体置信度
        var confidences = [];
        for (var key in currentState.dimensions) {
            var d = currentState.dimensions[key];
            if (d.confidence === 'high') confidences.push(1);
            else if (d.confidence === 'medium') confidences.push(0.5);
            else if (d.confidence === 'low') confidences.push(0.2);
        }
        var avgConf = confidences.length > 0 ? confidences.reduce(function(a,b) { return a+b; }, 0) / confidences.length : 0;
        if (avgConf >= 0.7) currentState.confidence = 'high';
        else if (avgConf >= 0.4) currentState.confidence = 'medium';
        else currentState.confidence = 'low';
    
        return currentState;
    }

    /**
     * 获取自适应状态
     * @returns {Object} 自适应状态
     */
    function getAdaptiveState() {
        var store = _getStore();
        return store._adaptiveState || {
            dimensions: {},
            evidenceCount: 0,
            confidence: 'low',
            updatedAt: null,
            version: '1.0.0'
        };
    }

    /**
     * 获取校准历史
     * @param {Object} filter - 过滤条件
     * @returns {Array} 校准历史
     */
    function getCalibrationHistory(filter) {
        filter = filter || {};
        var store = _getStore();
        var decisions = store._calibrationDecisions || [];
        
        var result = decisions;
    
        if (filter.action) {
            result = result.filter(function(d) {
                return d.action === filter.action;
            });
        }
    
        if (filter.dimension) {
            result = result.filter(function(d) {
                return d.dimension === filter.dimension;
            });
        }
    
        if (filter.fromDate) {
            result = result.filter(function(d) {
                return d.timestamp >= filter.fromDate;
            });
        }
    
        if (filter.toDate) {
            result = result.filter(function(d) {
                return d.timestamp <= filter.toDate;
            });
        }
    
        result.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });
    
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
    
        return result;
    }

    // ============================================================
    // 🔥 Part 156: Adaptive Candidate Evaluation & Arbitration Contract
    // ============================================================
    
    /**
     * 候选状态
     */
    var CANDIDATE_STATES = {
        ELIGIBLE: 'eligible',
        PREFERRED: 'preferred',
        DEFERRED: 'deferred',
        EXCLUDED: 'excluded',
        UNKNOWN: 'unknown'
    };
    
    /**
     * 约束类型
     */
    var CONSTRAINT_TYPES = {
        HARD: 'hard',      // 权威性先决条件
        SOFT: 'soft'       // 自适应信号
    };
    
    /**
     * 评估维度
     */
    var EVALUATION_DIMENSIONS = {
        PREREQUISITE_VALIDITY: 'prerequisite_validity',
        CONTEXTUAL_RELEVANCE: 'contextual_relevance',
        DIFFICULTY_FIT: 'difficulty_fit',
        GOAL_ALIGNMENT: 'goal_alignment',
        TOPIC_RELEVANCE: 'topic_relevance',
        FORMAT_FIT: 'format_fit',
        HISTORICAL_EFFECTIVENESS: 'historical_effectiveness',
        RECENT_EVIDENCE: 'recent_evidence',
        CALIBRATION_ALIGNMENT: 'calibration_alignment',
        CONFIDENCE: 'confidence',
        FRESHNESS: 'freshness'
    };
    
    /**
     * 创建 Candidate Evaluation Result
     * @param {Object} candidate - 候选对象
     * @param {Object} context - 上下文
     * @param {Object} options - 选项
     * @returns {Object} 评估结果
     */
    function evaluateCandidate(candidate, context, options) {
        options = options || {};
        context = context || getCurrentContext();
        
        if (!candidate) {
            return {
                candidateId: null,
                state: CANDIDATE_STATES.UNKNOWN,
                score: 0,
                dimensions: {},
                constraints: [],
                reason: 'no_candidate',
                confidence: 'low'
            };
        }
        
        var dimensions = {};
        var constraints = [];
        var reason = '';
        var confidence = 'low';
        var score = 0;
        
        // ─── 1. 检查硬约束 ───
        var hardConstraintResult = _checkHardConstraints(candidate, context);
        if (!hardConstraintResult.passed) {
            return {
                candidateId: candidate.candidateId || candidate.id,
                state: CANDIDATE_STATES.EXCLUDED,
                score: 0,
                dimensions: {},
                constraints: hardConstraintResult.constraints,
                reason: hardConstraintResult.reason || 'hard_constraint_failed',
                confidence: 'high'
            };
        }
        constraints = hardConstraintResult.constraints;
        
        // ─── 2. 评估各维度 ───
        var dimensionResults = _evaluateDimensions(candidate, context, options);
        dimensions = dimensionResults.dimensions;
        
        // ─── 3. 计算综合得分 ───
        var scoreResult = _calculateEvaluationScore(dimensions, context);
        score = scoreResult.score;
        confidence = scoreResult.confidence;
        
        // ─── 4. 确定状态 ───
        var state = _determineCandidateState(score, dimensions, constraints, context);
        
        // ─── 5. 生成原因 ───
        reason = _generateEvaluationReason(candidate, state, dimensions, constraints, context);
        
        return {
            candidateId: candidate.candidateId || candidate.id,
            state: state,
            score: score,
            dimensions: dimensions,
            constraints: constraints,
            reason: reason,
            confidence: confidence,
            timestamp: Date.now()
        };
    }
    
    /**
     * 检查硬约束
     * @private
     */
    function _checkHardConstraints(candidate, context) {
        var constraints = [];
        var passed = true;
        var reason = null;
        
        // 1. 检查先决条件
        if (candidate.source === 'prerequisite' || candidate.isRequired) {
            try {
                var adapter = window.LawAIApp?.LearningJourneyAdapter;
                if (adapter && typeof adapter.getState === 'function') {
                    var state = adapter.getState();
                    // 检查是否已完成
                    var progress = window.LawAIApp?.ProgressEngine;
                    if (progress && typeof progress.isLessonCompleted === 'function') {
                        var completed = progress.isLessonCompleted(candidate.targetId);
                        if (completed) {
                            constraints.push({
                                type: CONSTRAINT_TYPES.HARD,
                                source: 'curriculum',
                                description: 'Prerequisite already completed',
                                satisfied: true
                            });
                        } else {
                            constraints.push({
                                type: CONSTRAINT_TYPES.HARD,
                                source: 'curriculum',
                                description: 'Prerequisite required before proceeding',
                                satisfied: false
                            });
                            passed = false;
                            reason = 'prerequisite_not_completed';
                        }
                    }
                }
            } catch (e) {}
        }
        
        // 2. 检查目标是否存在
        if (candidate.targetId) {
            try {
                var registry = window.LawAIApp?.CourseRegistry || window.LawAIApp?.AcademyRegistry;
                if (registry && typeof registry.get === 'function') {
                    var target = registry.get(candidate.targetId);
                    if (!target) {
                        constraints.push({
                            type: CONSTRAINT_TYPES.HARD,
                            source: 'system',
                            description: 'Target not found',
                            satisfied: false
                        });
                        passed = false;
                        reason = 'target_not_found';
                    }
                }
            } catch (e) {}
        }
        
        // 3. 检查是否过期
        if (candidate.expiresAt && Date.now() > candidate.expiresAt) {
            constraints.push({
                type: CONSTRAINT_TYPES.HARD,
                source: 'system',
                description: 'Candidate expired',
                satisfied: false
            });
            passed = false;
            reason = 'candidate_expired';
        }
        
        return {
            passed: passed,
            constraints: constraints,
            reason: reason
        };
    }
    
    /**
     * 评估各维度
     * @private
     */
    function _evaluateDimensions(candidate, context, options) {
        var dimensions = {};
        
        // 1. 上下文相关性
        dimensions[EVALUATION_DIMENSIONS.CONTEXTUAL_RELEVANCE] = {
            score: _evaluateContextualRelevance(candidate, context),
            confidence: 'medium',
            source: 'context',
            reason: 'Based on current learning context'
        };
        
        // 2. 目标对齐
        dimensions[EVALUATION_DIMENSIONS.GOAL_ALIGNMENT] = {
            score: _evaluateGoalAlignment(candidate, context),
            confidence: 'medium',
            source: 'goal',
            reason: 'Based on learner goals'
        };
        
        // 3. 格式适配
        dimensions[EVALUATION_DIMENSIONS.FORMAT_FIT] = {
            score: _evaluateFormatFit(candidate, context),
            confidence: 'low',
            source: 'calibration',
            reason: 'Based on format history'
        };
        
        // 4. 历史有效性
        dimensions[EVALUATION_DIMENSIONS.HISTORICAL_EFFECTIVENESS] = {
            score: _evaluateHistoricalEffectiveness(candidate, context),
            confidence: 'low',
            source: 'outcome',
            reason: 'Based on historical outcomes'
        };
        
        // 5. 校准对齐
        dimensions[EVALUATION_DIMENSIONS.CALIBRATION_ALIGNMENT] = {
            score: _evaluateCalibrationAlignment(candidate, context),
            confidence: 'medium',
            source: 'calibration',
            reason: 'Based on adaptive calibration'
        };
        
        // 6. 新鲜度
        dimensions[EVALUATION_DIMENSIONS.FRESHNESS] = {
            score: _evaluateFreshness(candidate, context),
            confidence: 'high',
            source: 'system',
            reason: 'Based on candidate generation time'
        };
        
        return { dimensions: dimensions };
    }
    
    /**
     * 评估上下文相关性
     * @private
     */
    function _evaluateContextualRelevance(candidate, context) {
        var score = 0.5;
        // 如果候选的 scope 与当前 context 匹配
        if (candidate.scope && context) {
            if (candidate.scope.scopeId === context.currentCourseId) {
                score += 0.3;
            }
            if (candidate.scope.scopeType === context.currentSubjectId) {
                score += 0.2;
            }
        }
        return Math.min(1, score);
    }
    
    /**
     * 评估目标对齐
     * @private
     */
    function _evaluateGoalAlignment(candidate, context) {
        try {
            var lm = window.LawAIApp?.LearnerModel;
            if (lm) {
                var goals = lm.getActiveGoals ? lm.getActiveGoals() : [];
                if (goals.length > 0 && candidate.targetId) {
                    // 简化：检查候选是否与目标相关
                    var goal = goals[0];
                    if (goal.targetId === candidate.targetId) {
                        return 0.9;
                    }
                    if (goal.title && candidate.targetId && 
                        candidate.targetId.indexOf(goal.title) !== -1) {
                        return 0.7;
                    }
                }
            }
        } catch (e) {}
        return 0.4;
    }
    
    /**
     * 评估格式适配
     * @private
     */
    function _evaluateFormatFit(candidate, context) {
        var adaptiveState = getAdaptiveState();
        var dimState = adaptiveState.dimensions[EVALUATION_DIMENSIONS.FORMAT_FIT];
        if (dimState) {
            return 0.4 + (dimState.weight || 0) * 0.4;
        }
        return 0.4;
    }
    
    /**
     * 评估历史有效性
     * @private
     */
    function _evaluateHistoricalEffectiveness(candidate, context) {
        try {
            var outcomes = getOutcomeHistory(candidate.targetId, { limit: 10 });
            if (outcomes.length > 0) {
                var positive = 0;
                for (var i = 0; i < outcomes.length; i++) {
                    if (outcomes[i].outcomeType === 'improved' || 
                        outcomes[i].outcomeType === 'completed') {
                        positive++;
                    }
                }
                return 0.3 + (positive / outcomes.length) * 0.5;
            }
        } catch (e) {}
        return 0.3;
    }
    
    /**
     * 评估校准对齐
     * @private
     */
    function _evaluateCalibrationAlignment(candidate, context) {
        var adaptiveState = getAdaptiveState();
        var dims = adaptiveState.dimensions || {};
        var score = 0.5;
        
        for (var key in dims) {
            var dim = dims[key];
            if (dim.weight !== undefined) {
                score += (dim.weight - 0.5) * 0.2;
            }
        }
        
        return Math.max(0, Math.min(1, score));
    }
    
    /**
     * 评估新鲜度
     * @private
     */
    function _evaluateFreshness(candidate, context) {
        if (!candidate.generatedAt) return 0.5;
        var days = (Date.now() - candidate.generatedAt) / (24 * 60 * 60 * 1000);
        if (days < 1) return 1.0;
        if (days < 7) return 0.8;
        if (days < 30) return 0.5;
        return 0.2;
    }
    
    /**
     * 计算评估得分
     * @private
     */
    function _calculateEvaluationScore(dimensions, context) {
        var totalScore = 0;
        var totalWeight = 0;
        var weights = {
            [EVALUATION_DIMENSIONS.CONTEXTUAL_RELEVANCE]: 0.25,
            [EVALUATION_DIMENSIONS.GOAL_ALIGNMENT]: 0.20,
            [EVALUATION_DIMENSIONS.FORMAT_FIT]: 0.15,
            [EVALUATION_DIMENSIONS.HISTORICAL_EFFECTIVENESS]: 0.15,
            [EVALUATION_DIMENSIONS.CALIBRATION_ALIGNMENT]: 0.15,
            [EVALUATION_DIMENSIONS.FRESHNESS]: 0.10
        };
        
        for (var key in dimensions) {
            var dim = dimensions[key];
            var weight = weights[key] || 0.1;
            totalScore += (dim.score || 0.5) * weight;
            totalWeight += weight;
        }
        
        var finalScore = totalWeight > 0 ? totalScore / totalWeight : 0.5;
        var confidence = 'low';
        if (finalScore >= 0.7) confidence = 'high';
        else if (finalScore >= 0.5) confidence = 'medium';
        
        return {
            score: Math.round(finalScore * 100) / 100,
            confidence: confidence
        };
    }
    
    /**
     * 确定候选状态
     * @private
     */
    function _determineCandidateState(score, dimensions, constraints, context) {
        // 如果有未满足的硬约束，排除
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].type === CONSTRAINT_TYPES.HARD && !constraints[i].satisfied) {
                return CANDIDATE_STATES.EXCLUDED;
            }
        }
        
        if (score >= 0.7) {
            return CANDIDATE_STATES.PREFERRED;
        } else if (score >= 0.4) {
            return CANDIDATE_STATES.ELIGIBLE;
        } else if (score >= 0.2) {
            return CANDIDATE_STATES.DEFERRED;
        }
        return CANDIDATE_STATES.UNKNOWN;
    }
    
    /**
     * 生成评估原因
     * @private
     */
    function _generateEvaluationReason(candidate, state, dimensions, constraints, context) {
        var parts = [];
        
        parts.push('State: ' + state);
        
        if (state === CANDIDATE_STATES.EXCLUDED) {
            var hardConstraints = constraints.filter(function(c) { 
                return c.type === CONSTRAINT_TYPES.HARD && !c.satisfied; 
            });
            if (hardConstraints.length > 0) {
                parts.push('Blocked by: ' + hardConstraints.map(function(c) { 
                    return c.description; 
                }).join(', '));
            }
        }
        
        // 添加 top 维度
        var sortedDims = [];
        for (var key in dimensions) {
            sortedDims.push({ key: key, score: dimensions[key].score });
        }
        sortedDims.sort(function(a, b) { return b.score - a.score; });
        
        if (sortedDims.length > 0) {
            var top = sortedDims[0];
            parts.push('Strongest factor: ' + top.key + ' (' + Math.round(top.score * 100) + '%)');
        }
        
        return parts.join('; ');
    }
    
    /**
     * 评估候选集
     * @param {Array} candidates - 候选列表
     * @param {Object} context - 上下文
     * @param {Object} options - 选项
     * @returns {Array} 评估结果列表
     */
    function evaluateCandidates(candidates, context, options) {
        options = options || {};
        context = context || getCurrentContext();
        
        if (!candidates || candidates.length === 0) {
            return [];
        }
        
        var results = [];
        for (var i = 0; i < candidates.length; i++) {
            var result = evaluateCandidate(candidates[i], context, options);
            results.push(result);
        }
        
        // 按状态分组排序
        var order = {
            'preferred': 0,
            'eligible': 1,
            'deferred': 2,
            'unknown': 3,
            'excluded': 4
        };
        results.sort(function(a, b) {
            var diff = (order[a.state] || 5) - (order[b.state] || 5);
            if (diff !== 0) return diff;
            return (b.score || 0) - (a.score || 0);
        });
        
        return results;
    }

    // ============================================================
    // 🔥 Part 157: Recommendation Decision Record & Explanation Integrity
    // ============================================================
    
    /**
     * 决策来源类型
     */
    var DECISION_SOURCE_TYPES = {
        ARBITRATION: 'arbitration',
        EVALUATION: 'evaluation',
        CALIBRATION: 'calibration',
        SYSTEM: 'system',
        LEARNER: 'learner'
    };
    
    /**
     * 创建 Recommendation Decision Record
     * @param {Object} params - 参数
     * @returns {Object} Decision Record
     */
    function createRecommendationDecisionRecord(params) {
        var now = Date.now();
        
        return {
            recordId: 'rdr_' + now + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: params.recommendationId || null,
            learnerId: params.learnerId || 'default-learner',
            candidateId: params.candidateId || null,
            
            // 决策本身
            decision: params.decision || null,
            decisionSource: params.decisionSource || DECISION_SOURCE_TYPES.ARBITRATION,
            
            // 决策上下文
            decisionContext: params.decisionContext || {
                timestamp: now,
                version: '1.0.0'
            },
            
            // 证据引用
            evidenceRefs: params.evidenceRefs || [],
            constraintRefs: params.constraintRefs || [],
            calibrationRefs: params.calibrationRefs || [],
            
            // 快照
            evaluationSnapshot: params.evaluationSnapshot || null,
            arbitrationSnapshot: params.arbitrationSnapshot || null,
            explanationRefs: params.explanationRefs || [],
            
            // 置信度
            confidence: params.confidence || 'medium',
            confidenceReason: params.confidenceReason || null,
            
            // 替代方案
            alternatives: params.alternatives || [],
            
            // 版本控制
            evaluatorVersion: params.evaluatorVersion || '1.0.0',
            arbitrationVersion: params.arbitrationVersion || '1.0.0',
            calibrationVersion: params.calibrationVersion || '1.0.0',
            
            // 状态
            status: params.status || 'recorded',
            isHistorical: false,
            invalidatedAt: null,
            invalidatedReason: null,
            
            // 时间
            createdAt: now,
            updatedAt: now,
            version: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }
    
    /**
     * 记录推荐决策
     * @param {Object} decisionData - 决策数据
     * @param {Object} context - 上下文
     * @returns {Object} 记录结果
     */
    function recordRecommendationDecision(decisionData, context) {
        context = context || getCurrentContext();
        
        // 1. 验证输入
        var validation = _validateDecisionRecord(decisionData, context);
        if (!validation.valid) {
            return {
                success: false,
                error: 'Decision record validation failed',
                reason: validation.reason,
                details: validation.details
            };
        }
        
        // 2. 构建决策记录
        var record = createRecommendationDecisionRecord({
            recommendationId: decisionData.recommendationId || null,
            learnerId: decisionData.learnerId || 'default-learner',
            candidateId: decisionData.candidateId || null,
            decision: decisionData.decision || null,
            decisionSource: decisionData.decisionSource || DECISION_SOURCE_TYPES.ARBITRATION,
            decisionContext: decisionData.decisionContext || {
                timestamp: Date.now(),
                context: context,
                version: '1.0.0'
            },
            evidenceRefs: decisionData.evidenceRefs || [],
            constraintRefs: decisionData.constraintRefs || [],
            calibrationRefs: decisionData.calibrationRefs || [],
            evaluationSnapshot: decisionData.evaluationSnapshot || null,
            arbitrationSnapshot: decisionData.arbitrationSnapshot || null,
            explanationRefs: decisionData.explanationRefs || [],
            confidence: decisionData.confidence || 'medium',
            confidenceReason: decisionData.confidenceReason || null,
            alternatives: decisionData.alternatives || [],
            evaluatorVersion: decisionData.evaluatorVersion || '1.0.0',
            arbitrationVersion: decisionData.arbitrationVersion || '1.0.0',
            calibrationVersion: decisionData.calibrationVersion || '1.0.0',
            status: 'recorded'
        });
        
        // 3. 存储
        var store = _getStore();
        if (!store._decisionRecords) {
            store._decisionRecords = [];
        }
        
        // 检查重复
        if (decisionData.recommendationId) {
            var existing = store._decisionRecords.find(function(r) {
                return r.recommendationId === decisionData.recommendationId;
            });
            if (existing) {
                // 如果已存在，更新而不是创建新记录
                return {
                    success: false,
                    error: 'Decision record already exists for this recommendation',
                    reason: 'duplicate',
                    record: existing
                };
            }
        }
        
        store._decisionRecords.push(record);
        _saveStore(store);
        
        // 4. 触发事件
        _emit('RECOMMENDATION_DECISION_RECORDED', {
            recordId: record.recordId,
            recommendationId: record.recommendationId,
            decision: record.decision,
            confidence: record.confidence,
            timestamp: record.createdAt
        });
        
        return {
            success: true,
            record: record
        };
    }
    
    /**
     * 验证决策记录
     * @private
     */
    function _validateDecisionRecord(decisionData, context) {
        if (!decisionData.recommendationId && !decisionData.candidateId) {
            return { valid: false, reason: 'missing_reference', details: 'Either recommendationId or candidateId required' };
        }
        
        if (!decisionData.decision) {
            return { valid: false, reason: 'missing_decision', details: 'Decision field required' };
        }
        
        return { valid: true };
    }
    
    /**
     * 获取决策记录
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object|null} 决策记录
     */
    function getDecisionRecord(recommendationId) {
        if (!recommendationId) return null;
        
        var store = _getStore();
        var records = store._decisionRecords || [];
        
        for (var i = 0; i < records.length; i++) {
            if (records[i].recommendationId === recommendationId) {
                return records[i];
            }
        }
        
        return null;
    }
    
    /**
     * 获取决策记录历史
     * @param {Object} filter - 过滤条件
     * @returns {Array} 决策记录列表
     */
    function getDecisionRecordHistory(filter) {
        filter = filter || {};
        var store = _getStore();
        var records = store._decisionRecords || [];
        
        var result = records;
        
        if (filter.learnerId) {
            result = result.filter(function(r) {
                return r.learnerId === filter.learnerId;
            });
        }
        
        if (filter.decisionSource) {
            result = result.filter(function(r) {
                return r.decisionSource === filter.decisionSource;
            });
        }
        
        if (filter.fromDate) {
            result = result.filter(function(r) {
                return r.createdAt >= filter.fromDate;
            });
        }
        
        if (filter.toDate) {
            result = result.filter(function(r) {
                return r.createdAt <= filter.toDate;
            });
        }
        
        result.sort(function(a, b) {
            return b.createdAt - a.createdAt;
        });
        
        if (filter.limit) {
            result = result.slice(0, filter.limit);
        }
        
        return result;
    }
    
    /**
     * 生成解释捆绑
     * @param {Object} recommendation - 推荐对象
     * @param {Object} decisionRecord - 决策记录
     * @param {Object} context - 上下文
     * @returns {Object} 解释捆绑
     */
    function generateExplanationBundle(recommendation, decisionRecord, context) {
        context = context || getCurrentContext();
        
        var bundle = {
            recommendationId: recommendation ? recommendation.recommendationId : null,
            recordId: decisionRecord ? decisionRecord.recordId : null,
            timestamp: Date.now(),
            version: '1.0.0',
            
            // 核心解释
            summary: null,
            reasons: [],
            evidence: [],
            constraints: [],
            alternatives: [],
            
            // 置信度
            confidence: 'medium',
            confidenceReason: null,
            
            // 完整性
            isComplete: false,
            missingItems: [],
            
            // 溯源
            provenance: {
                recommendation: recommendation ? recommendation.version : null,
                decisionRecord: decisionRecord ? decisionRecord.version : null,
                evaluatorVersion: decisionRecord ? decisionRecord.evaluatorVersion : null,
                arbitrationVersion: decisionRecord ? decisionRecord.arbitrationVersion : null,
                calibrationVersion: decisionRecord ? decisionRecord.calibrationVersion : null
            }
        };
        
        // 1. 从推荐中提取摘要
        if (recommendation) {
            var target = recommendation.target || {};
            var action = recommendation.recommendationType || 'general';
            var isRequired = recommendation.authority?.isRequired || false;
            
            bundle.summary = (isRequired ? 'Required: ' : 'Recommended: ') + 
                             (action + ' ' + (target.type || '') + ': ' + (target.id || ''));
            
            // 提取原因
            var rationale = recommendation.rationale || {};
            if (rationale.reasons && rationale.reasons.length > 0) {
                bundle.reasons = rationale.reasons;
            }
            if (rationale.evidenceRefs && rationale.evidenceRefs.length > 0) {
                bundle.evidence = rationale.evidenceRefs;
            }
            if (recommendation.alternatives && recommendation.alternatives.length > 0) {
                bundle.alternatives = recommendation.alternatives;
            }
            if (recommendation.authority?.isRequired) {
                bundle.constraints.push({
                    type: 'hard',
                    source: 'curriculum',
                    description: 'Authoritative prerequisite'
                });
            }
            bundle.confidence = recommendation.confidence || 'medium';
        }
        
        // 2. 从决策记录中补充
        if (decisionRecord) {
            if (decisionRecord.constraintRefs && decisionRecord.constraintRefs.length > 0) {
                bundle.constraints = bundle.constraints.concat(decisionRecord.constraintRefs);
            }
            if (decisionRecord.evidenceRefs && decisionRecord.evidenceRefs.length > 0) {
                bundle.evidence = bundle.evidence.concat(decisionRecord.evidenceRefs);
            }
            if (decisionRecord.alternatives && decisionRecord.alternatives.length > 0) {
                bundle.alternatives = bundle.alternatives.concat(decisionRecord.alternatives);
            }
            if (decisionRecord.confidence) {
                bundle.confidence = decisionRecord.confidence;
            }
            bundle.confidenceReason = decisionRecord.confidenceReason || null;
        }
        
        // 3. 检查完整性
        bundle.isComplete = bundle.summary !== null && bundle.reasons.length > 0;
        if (!bundle.summary) bundle.missingItems.push('summary');
        if (bundle.reasons.length === 0) bundle.missingItems.push('reasons');
        if (bundle.evidence.length === 0) bundle.missingItems.push('evidence');
        
        return bundle;
    }
    
    /**
     * 验证解释完整性
     * @param {Object} explanation - 解释对象
     * @param {Object} decisionRecord - 决策记录
     * @returns {Object} 完整性验证结果
     */
    function validateExplanationIntegrity(explanation, decisionRecord) {
        var result = {
            valid: false,
            checks: [],
            issues: []
        };
        
        if (!explanation) {
            result.issues.push('Explanation is null');
            return result;
        }
        
        // 检查推荐引用
        if (!explanation.recommendationId) {
            result.issues.push('Missing recommendationId');
        } else {
            result.checks.push('has_recommendation_id');
        }
        
        // 检查决策记录引用
        if (!decisionRecord) {
            result.issues.push('Missing decision record');
        } else {
            result.checks.push('has_decision_record');
        }
        
        // 检查理由
        if (!explanation.reasons || explanation.reasons.length === 0) {
            result.issues.push('Missing reasons');
        } else {
            result.checks.push('has_reasons');
        }
        
        // 检查证据引用
        if (!explanation.evidence || explanation.evidence.length === 0) {
            result.issues.push('Missing evidence references');
        } else {
            result.checks.push('has_evidence');
        }
        
        // 检查置信度
        if (!explanation.confidence) {
            result.issues.push('Missing confidence');
        } else {
            result.checks.push('has_confidence');
        }
        
        // 检查是否完整
        result.valid = result.issues.length === 0;
        
        return result;
    }
    
    /**
     * 使推荐无效
     * @param {string} recommendationId - 推荐 ID
     * @param {string} reason - 无效原因
     * @returns {Object} 结果
     */
    function invalidateRecommendationDecision(recommendationId, reason) {
        var store = _getStore();
        var records = store._decisionRecords || [];
        
        for (var i = 0; i < records.length; i++) {
            if (records[i].recommendationId === recommendationId) {
                records[i].status = 'invalidated';
                records[i].isHistorical = true;
                records[i].invalidatedAt = Date.now();
                records[i].invalidatedReason = reason || 'manual_invalidation';
                records[i].updatedAt = Date.now();
                
                _saveStore(store);
                
                _emit('RECOMMENDATION_DECISION_INVALIDATED', {
                    recommendationId: recommendationId,
                    reason: reason,
                    timestamp: Date.now()
                });
                
                return {
                    success: true,
                    record: records[i]
                };
            }
        }
        
        return {
            success: false,
            error: 'Decision record not found'
        };
    }

    // ============================================================
    // 🔥 Part 158: Recommendation Outcome Verification & Closed-Loop Integrity
    // ============================================================
    
    /**
     * 执行状态
     */
    var EXECUTION_STATUS = {
        NOT_STARTED: 'not_started',
        STARTED: 'started',
        PARTIALLY_COMPLETED: 'partially_completed',
        COMPLETED: 'completed',
        ABANDONED: 'abandoned',
        UNKNOWN: 'unknown'
    };
    
    /**
     * 验证状态
     */
    var VERIFICATION_STATUS = {
        UNVERIFIED: 'unverified',
        PARTIALLY_VERIFIED: 'partially_verified',
        VERIFIED: 'verified',
        CONFLICTED: 'conflicted',
        INSUFFICIENT_EVIDENCE: 'insufficient_evidence'
    };
    
    /**
     * 结果分类
     */
    var OUTCOME_CLASSIFICATION = {
        POSITIVE_SIGNAL: 'positive_signal',
        NEUTRAL_SIGNAL: 'neutral_signal',
        NEGATIVE_SIGNAL: 'negative_signal',
        MIXED_SIGNAL: 'mixed_signal',
        INSUFFICIENT_EVIDENCE: 'insufficient_evidence',
        CONFLICTED_EVIDENCE: 'conflicted_evidence'
    };
    
    /**
     * 创建 Outcome Verification Record
     * @param {Object} params - 参数
     * @returns {Object} Verification Record
     */
    function createOutcomeVerification(params) {
        var now = Date.now();
        
        return {
            verificationId: 'ov_' + now + '_' + Math.random().toString(36).substr(2, 4),
            recommendationId: params.recommendationId || null,
            decisionId: params.decisionId || null,
            activityId: params.activityId || null,
            learnerId: params.learnerId || 'default-learner',
            
            // 执行状态
            executionStatus: params.executionStatus || EXECUTION_STATUS.UNKNOWN,
            completionStatus: params.completionStatus || null,
            
            // 验证状态
            verificationStatus: params.verificationStatus || VERIFICATION_STATUS.UNVERIFIED,
            outcomeClassification: params.outcomeClassification || OUTCOME_CLASSIFICATION.INSUFFICIENT_EVIDENCE,
            
            // 证据
            evidenceRefs: params.evidenceRefs || [],
            feedbackRefs: params.feedbackRefs || [],
            outcomeRefs: params.outcomeRefs || [],
            
            // 置信度
            confidence: params.confidence || 'low',
            confidenceReason: params.confidenceReason || null,
            
            // 时间
            observedAt: params.observedAt || now,
            verifiedAt: null,
            createdAt: now,
            updatedAt: now,
            
            version: '1.0.0',
            _schemaVersion: '1.0.0'
        };
    }
    
    /**
     * 验证 Outcome
     * @param {Object} outcomeData - 结果数据
     * @param {Object} context - 上下文
     * @returns {Object} 验证结果
     */
    function verifyOutcome(outcomeData, context) {
        context = context || getCurrentContext();
        
        // 1. 收集证据
        var evidence = _collectOutcomeEvidence(outcomeData, context);
        
        // 2. 检查执行状态
        var executionStatus = _determineExecutionStatus(outcomeData, evidence);
        
        // 3. 检查验证状态
        var verificationStatus = _determineVerificationStatus(evidence, executionStatus);
        
        // 4. 分类结果
        var classification = _classifyOutcome(evidence, executionStatus, verificationStatus);
        
        // 5. 计算置信度
        var confidence = _calculateOutcomeConfidence(evidence, verificationStatus);
        
        // 6. 创建验证记录
        var verification = createOutcomeVerification({
            recommendationId: outcomeData.recommendationId || null,
            decisionId: outcomeData.decisionId || null,
            activityId: outcomeData.activityId || null,
            learnerId: outcomeData.learnerId || 'default-learner',
            executionStatus: executionStatus,
            completionStatus: _getCompletionStatus(executionStatus, outcomeData),
            verificationStatus: verificationStatus,
            outcomeClassification: classification,
            evidenceRefs: evidence.map(function(e) { return e.id; }),
            feedbackRefs: outcomeData.feedbackRefs || [],
            outcomeRefs: outcomeData.outcomeRefs || [],
            confidence: confidence,
            confidenceReason: _getConfidenceReason(confidence, verificationStatus),
            observedAt: outcomeData.observedAt || Date.now(),
            verifiedAt: Date.now()
        });
        
        // 7. 存储
        var store = _getStore();
        if (!store._outcomeVerifications) {
            store._outcomeVerifications = [];
        }
        store._outcomeVerifications.push(verification);
        _saveStore(store);
        
        // 8. 触发事件
        _emit('OUTCOME_VERIFIED', {
            verificationId: verification.verificationId,
            recommendationId: verification.recommendationId,
            executionStatus: verification.executionStatus,
            verificationStatus: verification.verificationStatus,
            classification: verification.outcomeClassification,
            timestamp: verification.verifiedAt
        });
        
        return {
            success: true,
            verification: verification,
            evidence: evidence
        };
    }
    
    /**
     * 收集结果证据
     * @private
     */
    function _collectOutcomeEvidence(outcomeData, context) {
        var evidence = [];
        
        // 1. 从 outcomeData 收集
        if (outcomeData.evidenceRefs) {
            for (var i = 0; i < outcomeData.evidenceRefs.length; i++) {
                evidence.push({
                    id: outcomeData.evidenceRefs[i],
                    type: 'reference',
                    source: 'outcome_data',
                    timestamp: Date.now()
                });
            }
        }
        
        // 2. 从活动状态收集
        if (outcomeData.activityStatus) {
            evidence.push({
                id: 'activity_status_' + Date.now(),
                type: 'activity',
                value: outcomeData.activityStatus,
                source: 'activity',
                timestamp: Date.now()
            });
        }
        
        // 3. 从 Mastery 收集
        if (outcomeData.targetId) {
            try {
                var mastery = window.LawAIApp?.MasteryEngine;
                if (mastery) {
                    var record = mastery.getMastery(outcomeData.targetId);
                    if (record) {
                        evidence.push({
                            id: 'mastery_' + Date.now(),
                            type: 'mastery',
                            value: record.masteryLevel || 0,
                            state: record.state || 'UNASSESSED',
                            source: 'mastery_engine',
                            timestamp: Date.now()
                        });
                    }
                }
            } catch (e) {}
        }
        
        // 4. 从 Progress 收集
        try {
            var progress = window.LawAIApp?.ProgressEngine;
            if (progress) {
                var prog = progress.getProgress();
                evidence.push({
                    id: 'progress_' + Date.now(),
                    type: 'progress',
                    value: prog.completionPercent || 0,
                    source: 'progress_engine',
                    timestamp: Date.now()
                });
            }
        } catch (e) {}
        
        return evidence;
    }
    
    /**
     * 确定执行状态
     * @private
     */
    function _determineExecutionStatus(outcomeData, evidence) {
        // 如果有明确的 activityStatus
        if (outcomeData.activityStatus) {
            var statusMap = {
                'started': EXECUTION_STATUS.STARTED,
                'in_progress': EXECUTION_STATUS.STARTED,
                'completed': EXECUTION_STATUS.COMPLETED,
                'abandoned': EXECUTION_STATUS.ABANDONED,
                'partial': EXECUTION_STATUS.PARTIALLY_COMPLETED
            };
            if (statusMap[outcomeData.activityStatus]) {
                return statusMap[outcomeData.activityStatus];
            }
        }
        
        // 检查证据中是否有完成标记
        for (var i = 0; i < evidence.length; i++) {
            if (evidence[i].type === 'activity' && evidence[i].value === 'completed') {
                return EXECUTION_STATUS.COMPLETED;
            }
            if (evidence[i].type === 'mastery' && evidence[i].value > 0) {
                return EXECUTION_STATUS.COMPLETED;
            }
        }
        
        return EXECUTION_STATUS.UNKNOWN;
    }
    
    /**
     * 确定验证状态
     * @private
     */
    function _determineVerificationStatus(evidence, executionStatus) {
        if (evidence.length === 0) {
            return VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE;
        }
        
        // 检查是否有冲突证据
        var hasPositive = false;
        var hasNegative = false;
        for (var i = 0; i < evidence.length; i++) {
            if (evidence[i].type === 'mastery' && evidence[i].value > 0.6) {
                hasPositive = true;
            }
            if (evidence[i].type === 'activity' && evidence[i].value === 'abandoned') {
                hasNegative = true;
            }
        }
        
        if (hasPositive && hasNegative) {
            return VERIFICATION_STATUS.CONFLICTED;
        }
        
        if (hasPositive) {
            return VERIFICATION_STATUS.VERIFIED;
        }
        
        if (executionStatus === EXECUTION_STATUS.COMPLETED) {
            return VERIFICATION_STATUS.PARTIALLY_VERIFIED;
        }
        
        return VERIFICATION_STATUS.UNVERIFIED;
    }
    
    /**
     * 分类结果
     * @private
     */
    function _classifyOutcome(evidence, executionStatus, verificationStatus) {
        if (verificationStatus === VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE) {
            return OUTCOME_CLASSIFICATION.INSUFFICIENT_EVIDENCE;
        }
        
        if (verificationStatus === VERIFICATION_STATUS.CONFLICTED) {
            return OUTCOME_CLASSIFICATION.CONFLICTED_EVIDENCE;
        }
        
        if (verificationStatus === VERIFICATION_STATUS.VERIFIED) {
            // 检查是正还是负
            for (var i = 0; i < evidence.length; i++) {
                if (evidence[i].type === 'mastery' && evidence[i].value > 0.6) {
                    return OUTCOME_CLASSIFICATION.POSITIVE_SIGNAL;
                }
                if (evidence[i].type === 'mastery' && evidence[i].value < 0.3) {
                    return OUTCOME_CLASSIFICATION.NEGATIVE_SIGNAL;
                }
            }
            return OUTCOME_CLASSIFICATION.NEUTRAL_SIGNAL;
        }
        
        if (executionStatus === EXECUTION_STATUS.COMPLETED) {
            // 完成但未验证，可能是中性
            return OUTCOME_CLASSIFICATION.NEUTRAL_SIGNAL;
        }
        
        if (executionStatus === EXECUTION_STATUS.ABANDONED) {
            // 放弃，但不要标记为负面（证据不足）
            return OUTCOME_CLASSIFICATION.INSUFFICIENT_EVIDENCE;
        }
        
        return OUTCOME_CLASSIFICATION.INSUFFICIENT_EVIDENCE;
    }
    
    /**
     * 计算结果置信度
     * @private
     */
    function _calculateOutcomeConfidence(evidence, verificationStatus) {
        if (evidence.length === 0) return 'low';
        
        if (verificationStatus === VERIFICATION_STATUS.VERIFIED && evidence.length >= 3) {
            return 'high';
        }
        if (verificationStatus === VERIFICATION_STATUS.PARTIALLY_VERIFIED && evidence.length >= 2) {
            return 'medium';
        }
        if (verificationStatus === VERIFICATION_STATUS.CONFLICTED) {
            return 'medium';
        }
        return 'low';
    }
    
    /**
     * 获取完成状态
     * @private
     */
    function _getCompletionStatus(executionStatus, outcomeData) {
        if (executionStatus === EXECUTION_STATUS.COMPLETED) {
            return 'completed';
        }
        if (executionStatus === EXECUTION_STATUS.PARTIALLY_COMPLETED) {
            return 'partial';
        }
        if (executionStatus === EXECUTION_STATUS.ABANDONED) {
            return 'abandoned';
        }
        if (executionStatus === EXECUTION_STATUS.STARTED) {
            return 'started';
        }
        return 'unknown';
    }
    
    /**
     * 获取置信度原因
     * @private
     */
    function _getConfidenceReason(confidence, verificationStatus) {
        if (confidence === 'high') {
            return 'Multiple evidence sources support the outcome';
        }
        if (confidence === 'medium') {
            if (verificationStatus === VERIFICATION_STATUS.CONFLICTED) {
                return 'Conflicting evidence requires caution';
            }
            return 'Limited but consistent evidence';
        }
        if (verificationStatus === VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE) {
            return 'Insufficient evidence for confident verification';
        }
        return 'Limited evidence available';
    }
    
    /**
     * 获取验证记录
     * @param {string} recommendationId - 推荐 ID
     * @returns {Array} 验证记录列表
     */
    function getOutcomeVerifications(recommendationId) {
        var store = _getStore();
        var verifications = store._outcomeVerifications || [];
        
        if (recommendationId) {
            verifications = verifications.filter(function(v) {
                return v.recommendationId === recommendationId;
            });
        }
        
        return verifications;
    }
    
    /**
     * 获取验证摘要
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 验证摘要
     */
    function getOutcomeVerificationSummary(recommendationId) {
        var verifications = getOutcomeVerifications(recommendationId);
        
        if (verifications.length === 0) {
            return {
                hasVerification: false,
                message: 'No outcome verification available'
            };
        }
        
        var latest = verifications[verifications.length - 1];
        
        return {
            hasVerification: true,
            verificationId: latest.verificationId,
            executionStatus: latest.executionStatus,
            verificationStatus: latest.verificationStatus,
            classification: latest.outcomeClassification,
            confidence: latest.confidence,
            verifiedAt: latest.verifiedAt,
            evidenceCount: latest.evidenceRefs ? latest.evidenceRefs.length : 0,
            message: _getVerificationMessage(latest)
        };
    }
    
    /**
     * 获取验证消息
     * @private
     */
    function _getVerificationMessage(verification) {
        if (verification.outcomeClassification === OUTCOME_CLASSIFICATION.POSITIVE_SIGNAL) {
            return 'Positive learning signal detected';
        }
        if (verification.outcomeClassification === OUTCOME_CLASSIFICATION.NEGATIVE_SIGNAL) {
            return 'Negative learning signal detected';
        }
        if (verification.outcomeClassification === OUTCOME_CLASSIFICATION.MIXED_SIGNAL) {
            return 'Mixed learning signals';
        }
        if (verification.outcomeClassification === OUTCOME_CLASSIFICATION.CONFLICTED_EVIDENCE) {
            return 'Conflicting evidence requires further observation';
        }
        if (verification.verificationStatus === VERIFICATION_STATUS.INSUFFICIENT_EVIDENCE) {
            return 'Insufficient evidence to verify outcome';
        }
        if (verification.executionStatus === EXECUTION_STATUS.ABANDONED) {
            return 'Activity was abandoned';
        }
        if (verification.executionStatus === EXECUTION_STATUS.COMPLETED) {
            return 'Activity completed but outcome verification pending';
        }
        return 'Outcome observation recorded';
    }
    
    /**
     * 检查闭环完整性
     * @param {string} recommendationId - 推荐 ID
     * @returns {Object} 完整性检查结果
     */
    function checkClosedLoopIntegrity(recommendationId) {
        var result = {
            recommendationId: recommendationId,
            hasRecommendation: false,
            hasDecision: false,
            hasActivity: false,
            hasOutcome: false,
            hasVerification: false,
            hasFeedback: false,
            hasCalibration: false,
            isComplete: false,
            missing: []
        };
        
        // 检查推荐
        var rec = getRecommendation(recommendationId);
        if (rec) {
            result.hasRecommendation = true;
        } else {
            result.missing.push('recommendation');
        }
        
        // 检查决策
        var decisionRecord = getDecisionRecord(recommendationId);
        if (decisionRecord) {
            result.hasDecision = true;
        } else {
            result.missing.push('decision');
        }
        
        // 检查活动
        // 从决策记录中查找 activityId
        if (decisionRecord && decisionRecord.decisionContext) {
            var activityId = decisionRecord.decisionContext.activityId || null;
            if (activityId) {
                result.hasActivity = true;
            }
        }
        
        // 检查结果
        var outcomes = getOutcomeHistory(recommendationId);
        if (outcomes && outcomes.length > 0) {
            result.hasOutcome = true;
        } else {
            result.missing.push('outcome');
        }
        
        // 检查验证
        var verifications = getOutcomeVerifications(recommendationId);
        if (verifications && verifications.length > 0) {
            result.hasVerification = true;
        } else {
            result.missing.push('verification');
        }
        
        // 检查反馈
        var feedback = getFeedbackHistory(null, {});
        for (var i = 0; i < feedback.length; i++) {
            if (feedback[i].relatedRecommendationId === recommendationId) {
                result.hasFeedback = true;
                break;
            }
        }
        if (!result.hasFeedback) {
            result.missing.push('feedback');
        }
        
        // 检查校准
        var signals = getRecommendationOutcomeSignals(recommendationId);
        if (signals && signals.length > 0) {
            result.hasCalibration = true;
        } else {
            result.missing.push('calibration');
        }
        
        result.isComplete = result.missing.length === 0;
        
        return result;
    }

    // ============================================================
    // PUBLIC: Reset / Export / Import
    // ============================================================

    function reset() {
        _recommendations = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('[RecommendationEngine] Reset complete');
        } catch (e) {}
    }

    function refresh() {
        _cleanupExpired();
        return generateRecommendations({});
    }

    function exportData() {
        return _getStore();
    }

    function importData(data) {
        if (data && typeof data === 'object') {
            _saveStore(data);
            console.log('[RecommendationEngine] Import complete');
            return true;
        }
        return false;
    }

    // ============================================================
    // PRIVATE: Event Helpers
    // ============================================================

    function _emit(eventName, data) {
        try {
            var event = new CustomEvent(eventName, { detail: data || {} });
            document.dispatchEvent(event);
            window.dispatchEvent(event);

            if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                window.LawAIApp.EventBus.emit(eventName, data);
            }
        } catch (err) {}
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (window.LawAIApp.RecommendationEngine && window.LawAIApp.RecommendationEngine._initialized) {
            console.log('[RecommendationEngine] Already initialized');
            return;
        }

        console.log('[RecommendationEngine] 🚀 Initializing v2.0.0...');

        try {
            _getStore();
            _cleanupExpired();

            var eventBus = window.LawAIApp.EventBus || window.EventBus;
            if (eventBus && typeof eventBus.on === 'function') {
                eventBus.on('LEARNING_STATE_UPDATED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                eventBus.on('MASTERY_UPDATED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                eventBus.on('REVIEW_COMPLETED', function() {
                    setTimeout(function() {
                        refreshRecommendations();
                    }, 500);
                });

                console.log('[RecommendationEngine] ✅ Listening to learning events');
            }

            window.LawAIApp.RecommendationEngine = {
                _initialized: true,
                _upgraded: true,
                _version: '2.0.0',

                getRecommendation: getRecommendation,
                getRecommendations: getRecommendations,
                getPendingRecommendations: getPendingRecommendations,
                getActiveRecommendations: getActiveRecommendations,

                generateRecommendations: generateRecommendations,
                refreshRecommendations: refreshRecommendations,

                acceptRecommendation: acceptRecommendation,
                completeRecommendation: completeRecommendation,
                dismissRecommendation: dismissRecommendation,
                skipRecommendation: skipRecommendation,
                expireRecommendation: expireRecommendation,

                refresh: refresh,

                getAdaptiveRecommendations: getAdaptiveRecommendations,
                acceptAdaptiveRecommendation: acceptAdaptiveRecommendation,
                dismissAdaptiveRecommendation: dismissAdaptiveRecommendation,
                skipAdaptiveRecommendation: skipAdaptiveRecommendation,
                selectAdaptiveAlternative: selectAdaptiveAlternative,
                isRecommendationStale: isRecommendationStale,

                explainRecommendation: explainRecommendation,
                getExplanationLevels: getExplanationLevels,
                compareRecommendations: compareRecommendations,
                getDecisionTrace: getDecisionTrace,
                getRecommendationFeedback: getRecommendationFeedback,
                recordRecommendationFeedback: recordRecommendationFeedback,

                recordRecommendationOutcome: recordRecommendationOutcome,
                getRecommendationOutcome: getRecommendationOutcome,
                processOutcomeFeedback: processOutcomeFeedback,
                getOutcomeHistory: getOutcomeHistory,
                getRecommendationQualityMetrics: getRecommendationQualityMetrics,
                isRecommendationCooldown: isRecommendationCooldown,
                recordRecommendationOverride: recordRecommendationOverride,
                recordRecommendationChallenge: recordRecommendationChallenge,
                getRecommendationGovernance: getRecommendationGovernance,
                arbitrateRecommendations: arbitrateRecommendations,
                detectCandidateConflicts: detectCandidateConflicts,
                arbitrateCandidates: arbitrateCandidates,
                interpretLearningImpact: interpretLearningImpact,
                getImpactSummary: getImpactSummary,
                detectPatterns: detectPatterns,
                getActivePatterns: getActivePatterns,
                getAdaptiveSignals: getAdaptiveSignals,
                getCurrentContext: getCurrentContext,
                calculateContextMatch: calculateContextMatch,
                resolveContextualPatterns: resolveContextualPatterns,
                getContextualSignals: getContextualSignals,
                recordPatternContext: recordPatternContext,
                detectContextDrift: detectContextDrift,
                createEvidenceDimensions: createEvidenceDimensions,
                calibrateAdaptiveSignal: calibrateAdaptiveSignal,
                getCalibratedSignals: getCalibratedSignals,
                getSignalSummary: getSignalSummary,
                getTopSignals: getTopSignals,
                CANDIDATE_SOURCES: CANDIDATE_SOURCES,
                CANDIDATE_STATUS: CANDIDATE_STATUS,
                createCandidate: createCandidate,
                signalToCandidate: signalToCandidate,
                signalsToCandidates: signalsToCandidates,
                generateCandidateSet: generateCandidateSet,
                getTopCandidates: getTopCandidates,
                AUTHORITY_LEVELS: AUTHORITY_LEVELS,
                CANDIDATE_STATUS: CANDIDATE_STATUS,
                createArbitrationTrace: createArbitrationTrace,
                arbitrateCandidates: arbitrateCandidates,
                getArbitrationSummary: getArbitrationSummary,
                RECOMMENDATION_STATUS: RECOMMENDATION_STATUS,
                createRecommendationContract: createRecommendationContract,
                assembleRecommendations: assembleRecommendations,
                updateRecommendationStatus: updateRecommendationStatus,
                getRecommendationStatus: getRecommendationStatus,
                getActiveRecommendationsContract: getActiveRecommendationsContract,
                getRecommendationSummary: getRecommendationSummary,
                REASON_TYPES: REASON_TYPES,
                EXPLANATION_LEVELS: EXPLANATION_LEVELS,
                createExplanationContract: createExplanationContract,
                explainRecommendationV2: explainRecommendationV2,
                getExplanationSummary: getExplanationSummary,
                DECISION_ACTIONS: DECISION_ACTIONS,
                DECISION_VALIDATION: DECISION_VALIDATION,
                createLearnerDecision: createLearnerDecision,
                validateLearnerDecision: validateLearnerDecision,
                recordLearnerDecision: recordLearnerDecision,
                getDecisionHistory: getDecisionHistory,
                getDecisionTrace: getDecisionTrace,
                getDecisionSummary: getDecisionSummary,
                OUTCOME_STATUS: OUTCOME_STATUS,
                OUTCOME_TYPES: OUTCOME_TYPES,
                ACTIVITY_STATUS: ACTIVITY_STATUS,
                createOutcome: createOutcome,
                recordOutcome: recordOutcome,
                getOutcomeHistory: getOutcomeHistory,
                getOutcomeSummary: getOutcomeSummary,
                FEEDBACK_SOURCE_TYPES: FEEDBACK_SOURCE_TYPES,
                FEEDBACK_TYPES: FEEDBACK_TYPES,
                FEEDBACK_VALUES: FEEDBACK_VALUES,
                RECOMMENDATION_OUTCOME_STATUS: RECOMMENDATION_OUTCOME_STATUS,
                createFeedback: createFeedback,
                recordFeedback: recordFeedback,
                getFeedbackHistory: getFeedbackHistory,
                getFeedbackSummary: getFeedbackSummary,
                getRecommendationOutcomeSignals: getRecommendationOutcomeSignals,
                CALIBRATION_ACTIONS: CALIBRATION_ACTIONS,
                CALIBRATION_STATUS: CALIBRATION_STATUS,
                CALIBRATION_DIMENSIONS: CALIBRATION_DIMENSIONS,
                createCalibrationEvidence: createCalibrationEvidence,
                createCalibrationDecision: createCalibrationDecision,
                processCalibration: processCalibration,
                getAdaptiveState: getAdaptiveState,
                getCalibrationHistory: getCalibrationHistory,
                CANDIDATE_STATES: CANDIDATE_STATES,
                CONSTRAINT_TYPES: CONSTRAINT_TYPES,
                EVALUATION_DIMENSIONS: EVALUATION_DIMENSIONS,
                evaluateCandidate: evaluateCandidate,
                evaluateCandidates: evaluateCandidates,
                DECISION_SOURCE_TYPES: DECISION_SOURCE_TYPES,
                createRecommendationDecisionRecord: createRecommendationDecisionRecord,
                recordRecommendationDecision: recordRecommendationDecision,
                getDecisionRecord: getDecisionRecord,
                getDecisionRecordHistory: getDecisionRecordHistory,
                generateExplanationBundle: generateExplanationBundle,
                validateExplanationIntegrity: validateExplanationIntegrity,
                invalidateRecommendationDecision: invalidateRecommendationDecision,
                EXECUTION_STATUS: EXECUTION_STATUS,
                VERIFICATION_STATUS: VERIFICATION_STATUS,
                OUTCOME_CLASSIFICATION: OUTCOME_CLASSIFICATION,
                createOutcomeVerification: createOutcomeVerification,
                verifyOutcome: verifyOutcome,
                getOutcomeVerifications: getOutcomeVerifications,
                getOutcomeVerificationSummary: getOutcomeVerificationSummary,
                checkClosedLoopIntegrity: checkClosedLoopIntegrity,

                getStatus: getStatus,

                reset: reset,
                exportData: exportData,
                importData: importData,

                STATES: STATES,
                TARGET_TYPES: TARGET_TYPES,
                POLICY: POLICY
            };

            console.log('[RecommendationEngine] ✅ Initialized successfully');

        } catch (error) {
            console.error('[RecommendationEngine] ❌ Init failed:', error);
            window.LawAIApp.RecommendationEngine = {
                _initialized: false,
                _upgraded: true,
                _version: '2.0.0',
                getRecommendations: function() { return []; },
                getActiveRecommendations: function() { return []; },
                generateRecommendations: function() { return []; },
                getStatus: function() {
                    return { version: '2.0.0', initialized: false, error: 'Initialization failed' };
                }
            };
        }
    }

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            init();
        } catch (err) {
            console.warn('[RecommendationEngine] ⚠️ Auto-init failed:', err);
        }
    }, 600);

})();
