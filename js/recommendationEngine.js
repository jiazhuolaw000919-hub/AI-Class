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
        SKIPPED: 'SKIPPED'
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
                unknown: 0
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
            helpfulRate: 0
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
    
        return metrics;
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
    // PUBLIC: Reset / Export / Import
    // ============================================================

    function reset() {
        _recommendations = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('[RecommendationEngine] Reset complete');
        } catch (e) {}
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
