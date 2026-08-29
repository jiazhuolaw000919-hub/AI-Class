// js/academy/optionNormalizer.js
// Part 54 — Option Normalizer
// Law AI Academy Developer Bible
//
// PURPOSE: Convert various sources to unified Option model
// OWNERSHIP: NORMALIZATION layer — transforms data, no state

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.OptionNormalizer) {
        console.log('[OptionNormalizer] Already exists, skipping...');
        return;
    }

    /**
     * OptionNormalizer
     *
     * 将各种来源转换为统一的 Option 模型
     */
    var OptionNormalizer = {

        _model: null,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化 Normalizer
         */
        init: function() {
            this._model = window.LawAIApp?.DecisionOptionModel;
            if (!this._model) {
                console.warn('[OptionNormalizer] DecisionOptionModel not available');
            }
            console.log('[OptionNormalizer] ✅ Initialized');
            return this;
        },

        /**
         * 从当前上下文生成 Continue 选项
         * @param {Object} context — LearningContext 数据
         * @param {Object} continueData — ContinueLearning 数据
         * @returns {Object|null} Option 对象
         */
        fromContinue: function(context, continueData) {
            if (!this._model) return null;

            if (!continueData || !continueData.courseId) {
                return null;
            }

            var title = continueData.title || 'Continue Learning';
            var progress = continueData.progress || 0;

            var evidence = [];
            if (continueData.lessonId) {
                evidence.push('You were on lesson: ' + continueData.lessonId);
            }
            if (continueData.lastActivity) {
                evidence.push('Last activity: ' + new Date(continueData.lastActivity).toLocaleDateString());
            }

            return this._model.create({
                type: this._model.TYPES.CONTINUE,
                id: 'continue_' + continueData.courseId,
                title: title,
                summary: 'Resume where you left off',
                reason: 'You have an active learning session',
                evidence: evidence,
                action: { type: 'resume', target: continueData.courseId },
                source: this._model.SOURCES.CURRENT_CONTEXT,
                priority: 1,
                metadata: {
                    courseId: continueData.courseId,
                    moduleId: continueData.moduleId,
                    lessonId: continueData.lessonId,
                    progress: progress,
                    isCompleted: continueData.isCompleted || false
                }
            });
        },

        /**
         * 从 AIRecommendationEngine 生成推荐选项
         * @param {Object} recommendation — AI 推荐
         * @returns {Object|null} Option 对象
         */
        fromRecommendation: function(recommendation) {
            if (!this._model) return null;
            if (!recommendation) return null;

            var confidenceLabel = recommendation.confidenceLevel || 'medium';
            var isTentative = recommendation.tentative || false;

            return this._model.create({
                type: this._model.TYPES.RECOMMENDED,
                id: 'rec_' + recommendation.id,
                title: recommendation.suggestion || 'Recommended Action',
                summary: recommendation.problem || '',
                reason: this._buildReason(recommendation),
                evidence: recommendation.evidence || [],
                action: { type: 'recommend', target: recommendation.id },
                source: this._model.SOURCES.RECOMMENDATION,
                priority: this._priorityFromConfidence(confidenceLabel, isTentative),
                metadata: {
                    recommendationId: recommendation.id,
                    confidence: recommendation.confidence,
                    confidenceLevel: confidenceLabel,
                    tentative: isTentative,
                    type: recommendation.type,
                    priority: recommendation.priority
                }
            });
        },

        /**
         * 从多个 AI 推荐生成选项列表
         * @param {Array} recommendations — AI 推荐列表
         * @param {number} limit — 最大数量
         * @returns {Array} Option 列表
         */
        fromRecommendations: function(recommendations, limit) {
            if (!recommendations || recommendations.length === 0) return [];

            limit = limit || 5;
            var options = [];
            var count = 0;

            for (var i = 0; i < recommendations.length; i++) {
                if (count >= limit) break;

                var rec = recommendations[i];
                // 跳过过时或低置信度的推荐
                if (rec.tentative && rec.confidence < 0.4) continue;
                if (rec.priority === 'low' && rec.confidence < 0.5) continue;

                var option = this.fromRecommendation(rec);
                if (option) {
                    options.push(option);
                    count++;
                }
            }

            return options;
        },

        /**
         * 从 Calendar 生成日程选项
         * @param {Object} scheduledItem — 日程项
         * @returns {Object|null} Option 对象
         */
        fromCalendar: function(scheduledItem) {
            if (!this._model) return null;
            if (!scheduledItem) return null;

            return this._model.create({
                type: this._model.TYPES.SCHEDULED,
                id: 'sched_' + (scheduledItem.id || Date.now()),
                title: scheduledItem.title || 'Scheduled Learning',
                summary: scheduledItem.description || '',
                reason: 'Planned for ' + (scheduledItem.date || 'today'),
                evidence: ['This is scheduled on your calendar'],
                action: { type: 'schedule', target: scheduledItem.id },
                source: this._model.SOURCES.CALENDAR,
                priority: 3,
                metadata: {
                    date: scheduledItem.date,
                    duration: scheduledItem.duration,
                    type: scheduledItem.type
                }
            });
        },

        /**
         * 从 Learner Goal 生成目标选项
         * @param {Object} goal — 目标
         * @returns {Object|null} Option 对象
         */
        fromGoal: function(goal) {
            if (!this._model) return null;
            if (!goal) return null;

            return this._model.create({
                type: this._model.TYPES.GOAL_RELATED,
                id: 'goal_' + (goal.id || Date.now()),
                title: goal.title || 'Goal Related',
                summary: goal.description || '',
                reason: 'Aligned with your learning goal',
                evidence: ['Your goal: ' + (goal.title || '')],
                action: { type: 'goal', target: goal.id },
                source: this._model.SOURCES.LEARNER_GOAL,
                priority: 2,
                metadata: {
                    goalId: goal.id,
                    priority: goal.priority
                }
            });
        },

        /**
         * 从 Retention 生成复习选项
         * @param {Object} reviewItem — 复习项
         * @returns {Object|null} Option 对象
         */
        fromRetention: function(reviewItem) {
            if (!this._model) return null;
            if (!reviewItem) return null;

            var urgency = 'medium';
            if (reviewItem.dueIn && reviewItem.dueIn < 24) {
                urgency = 'high';
            } else if (reviewItem.dueIn && reviewItem.dueIn < 72) {
                urgency = 'medium';
            } else {
                urgency = 'low';
            }

            return this._model.create({
                type: this._model.TYPES.REVIEW,
                id: 'review_' + (reviewItem.id || Date.now()),
                title: reviewItem.title || 'Review Needed',
                summary: reviewItem.description || 'Concept needs review',
                reason: this._buildReviewReason(reviewItem),
                evidence: ['Review due: ' + (reviewItem.dueDate || 'soon')],
                action: { type: 'review', target: reviewItem.id },
                source: this._model.SOURCES.RETENTION,
                priority: urgency === 'high' ? 3 : (urgency === 'medium' ? 4 : 5),
                metadata: {
                    conceptId: reviewItem.id,
                    dueIn: reviewItem.dueIn,
                    urgency: urgency,
                    strength: reviewItem.strength
                }
            });
        },

        /**
         * 从 Notes 生成笔记选项
         * @param {Object} note — 笔记
         * @returns {Object|null} Option 对象
         */
        fromNote: function(note) {
            if (!this._model) return null;
            if (!note) return null;

            return this._model.create({
                type: this._model.TYPES.EXPLORE,
                id: 'note_' + (note.id || Date.now()),
                title: 'Review Note: ' + (note.title || 'Untitled'),
                summary: note.content ? note.content.substring(0, 80) + '...' : '',
                reason: 'You have notes connected to this concept',
                evidence: ['Note created: ' + (note.createdAt || 'recently')],
                action: { type: 'note', target: note.id },
                source: this._model.SOURCES.NOTES,
                priority: 5,
                metadata: {
                    noteId: note.id,
                    lessonId: note.lessonId
                }
            });
        },

        /**
         * 从 Knowledge Graph 生成探索选项
         * @param {Object} concept — 概念
         * @param {string} connectionType — 连接类型
         * @returns {Object|null} Option 对象
         */
        fromKnowledgeGraph: function(concept, connectionType) {
            if (!this._model) return null;
            if (!concept) return null;

            return this._model.create({
                type: this._model.TYPES.EXPLORE,
                id: 'kg_' + (concept.id || Date.now()),
                title: 'Explore: ' + (concept.label || concept.name
