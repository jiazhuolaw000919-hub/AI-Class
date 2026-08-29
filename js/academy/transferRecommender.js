// js/academy/transferRecommender.js
// Part 61 — Transfer Recommender
// Law AI Academy Developer Bible
//
// PURPOSE: Recommend transfer opportunities based on observed learning
// RULES: Optional, explainable, no forced progression

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.TransferRecommender) {
        console.log('[TransferRecommender] Already exists, skipping...');
        return;
    }

    /**
     * TransferRecommender
     *
     * 基于观察到的学习推荐迁移机会
     * 
     * 规则:
     * - 完全可选
     * - 可解释
     * - 不创建强制进度
     * - 不创建课程前提条件
     */
    var TransferRecommender = {
        version: '1.0.0',
        initialized: false,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[TransferRecommender] Already initialized');
                return this;
            }

            console.log('[TransferRecommender] 🚀 Initializing...');
            this.initialized = true;
            console.log('[TransferRecommender] ✅ Initialized');
            return this;
        },

        /**
         * 获取迁移推荐
         * @param {Object} context — 上下文
         * @param {Object} options — 选项
         * @returns {Array} 推荐列表
         */
        getRecommendations: function(context, options) {
            options = options || { limit: 3 };
            var recommendations = [];

            // 1. 从观察中生成推荐
            var observer = window.LawAIApp?.TransferObserver;
            if (observer) {
                var observations = observer.getRecentTransfers(10);
                for (var i = 0; i < observations.length; i++) {
                    var rec = this._createFromObservation(observations[i], context);
                    if (rec) recommendations.push(rec);
                }
            }

            // 2. 从知识图谱生成推荐
            var kgRecs = this._fromKnowledgeGraph(context);
            recommendations = recommendations.concat(kgRecs);

            // 3. 从课程结构生成推荐
            var courseRecs = this._fromCourses(context);
            recommendations = recommendations.concat(courseRecs);

            // 去重
            recommendations = this._deduplicate(recommendations);

            // 排序 (按置信度)
            recommendations.sort(function(a, b) {
                return (b.confidence || 0) - (a.confidence || 0);
            });

            // 限制数量
            if (options.limit) {
                recommendations = recommendations.slice(0, options.limit);
            }

            return recommendations;
        },

        /**
         * 获取迁移推荐解释
         * @param {Object} recommendation — 推荐对象
         * @param {Object} context — 上下文
         * @returns {string} 解释
         */
        getExplanation: function(recommendation, context) {
            if (!recommendation) return 'No recommendation.';

            var parts = [];

            if (recommendation.conceptId) {
                parts.push('You have been learning about this concept.');
            }

            if (recommendation.newContext) {
                parts.push('You could apply it to: ' + recommendation.newContext);
            }

            if (recommendation.evidence && recommendation.evidence.length > 0) {
                parts.push('Based on: ' + recommendation.evidence[0]);
            }

            return parts.join(' ') || 'Optional transfer opportunity.';
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized
            };
        },

        // ============================================================
        // PRIVATE — Recommendation Generators
        // ============================================================

        _createFromObservation: function(observation, context) {
            if (!observation) return null;

            var model = window.LawAIApp?.TransferModel;
            if (!model) return null;

            var transferTypeLabel = model.getTransferTypeLabel(observation.transferType);

            return {
                id: 'tr_rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: 'TRANSFER',
                conceptId: observation.conceptId,
                originalContext: observation.originalContext,
                newContext: observation.newContext,
                transferType: observation.transferType,
                transferTypeLabel: transferTypeLabel,
                evidence: observation.evidence || [],
                confidence: observation.confidence || 0.3,
                isOptional: true,
                timestamp: Date.now(),
                source: 'TransferObserver'
            };
        },

        _fromKnowledgeGraph: function(context) {
            var recommendations = [];
            var kg = window.LawAIApp?.KnowledgeGraph;
            if (!kg) return recommendations;

            try {
                var nodes = kg.getAllNodes ? kg.getAllNodes() : [];
                if (nodes && nodes.length > 1) {
                    // 查找跨域推荐
                    var crossDomain = [];
                    for (var i = 0; i < nodes.length; i++) {
                        for (var j = i + 1; j < nodes.length; j++) {
                            if (nodes[i].domain !== nodes[j].domain) {
                                crossDomain.push({
                                    source: nodes[i],
                                    target: nodes[j]
                                });
                            }
                        }
                    }

                    if (crossDomain.length > 0) {
                        var cd = crossDomain[0];
                        recommendations.push({
                            id: 'tr_rec_kg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                            type: 'TRANSFER',
                            conceptId: cd.source.id,
                            originalContext: cd.source.domain || 'current',
                            newContext: cd.target.domain || 'other',
                            transferType: 'CROSS_SCHOOL',
                            transferTypeLabel: 'Cross-School Transfer',
                            evidence: ['Knowledge graph connection: ' + cd.source.label + ' ↔ ' + cd.target.label],
                            confidence: 0.25,
                            isOptional: true,
                            timestamp: Date.now(),
                            source: 'KnowledgeGraph'
                        });
                    }
                }
            } catch (e) {
                console.warn('[TransferRecommender] KnowledgeGraph error:', e);
            }

            return recommendations;
        },

        _fromCourses: function(context) {
            var recommendations = [];
            var courseRegistry = window.LawAIApp?.CourseRegistry;
            if (!courseRegistry) return recommendations;

            var learningContext = window.LawAIApp?.LearningContext;
            if (!learningContext) return recommendations;

            try {
                var ctx = learningContext.getContext();
                if (!ctx || !ctx.course) return recommendations;

                var currentCourse = ctx.course;
                var allCourses = courseRegistry.getAllCourses();

                // 查找相关课程 (相同学校或其他学校)
                for (var i = 0; i < allCourses.length; i++) {
                    var course = allCourses[i];
                    if (course.id === currentCourse.id) continue;

                    // 检查是否有相似标签
                    var hasSimilarTag = false;
                    if (course.tags && currentCourse.tags) {
                        for (var j = 0; j < course.tags.length; j++) {
                            if (currentCourse.tags.indexOf(course.tags[j]) !== -1) {
                                hasSimilarTag = true;
                                break;
                            }
                        }
                    }

                    if (hasSimilarTag) {
                        recommendations.push({
                            id: 'tr_rec_course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                            type: 'TRANSFER',
                            conceptId: currentCourse.id,
                            originalContext: currentCourse.title || currentCourse.id,
                            newContext: course.title || course.id,
                            transferType: 'CROSS_COURSE',
                            transferTypeLabel: 'Cross-Course Transfer',
                            evidence: ['Similar concepts in: ' + (course.title || course.id)],
                            confidence: 0.35,
                            isOptional: true,
                            timestamp: Date.now(),
                            source: 'CourseRegistry'
                        });
                    }
                }
            } catch (e) {
                console.warn('[TransferRecommender] Course error:', e);
            }

            return recommendations;
        },

        _deduplicate: function(recommendations) {
            var unique = {};
            var result = [];

            for (var i = 0; i < recommendations.length; i++) {
                var key = recommendations[i].conceptId + '_' + recommendations[i].newContext;
                if (!unique[key]) {
                    unique[key] = true;
                    result.push(recommendations[i]);
                }
            }

            return result;
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.TransferRecommender = TransferRecommender;

    function autoInit() {
        if (!TransferRecommender.initialized) {
            TransferRecommender.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[TransferRecommender] Module loaded (Part 61)');

})();
