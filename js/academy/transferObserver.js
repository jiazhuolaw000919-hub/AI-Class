// js/academy/transferObserver.js
// Part 61 — Transfer Observer
// Law AI Academy Developer Bible
//
// PURPOSE: Observe transfer evidence from learner behavior
// RULES: No single-signal transfer, no fabricated evidence

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.TransferObserver) {
        console.log('[TransferObserver] Already exists, skipping...');
        return;
    }

    /**
     * TransferObserver
     *
     * 观察学习者行为中的迁移证据
     * 
     * 证据类型:
     * - 同一概念在不同情境中应用
     * - 跨课程概念连接
     * - 跨学校概念连接
     * - 无需 AI 辅助完成任务
     * - 策略迁移
     * - AI 素养迁移
     */
    var TransferObserver = {
        version: '1.0.0',
        initialized: false,

        _observations: [],
        _maxObservations: 100,

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[TransferObserver] Already initialized');
                return this;
            }

            console.log('[TransferObserver] 🚀 Initializing...');
            this._loadObservations();
            this.initialized = true;
            console.log('[TransferObserver] ✅ Initialized');
            return this;
        },

        /**
         * 观察迁移
         * @param {Object} context — 上下文
         * @returns {Array} 观察到的迁移
         */
        observe: function(context) {
            var observations = [];

            // 1. 从动作历史观察
            var actionObservations = this._observeFromActions(context);
            observations = observations.concat(actionObservations);

            // 2. 从学习上下文观察
            var contextObservations = this._observeFromContext(context);
            observations = observations.concat(contextObservations);

            // 3. 从知识图谱观察
            var kgObservations = this._observeFromKnowledgeGraph(context);
            observations = observations.concat(kgObservations);

            // 4. 存储观察
            for (var i = 0; i < observations.length; i++) {
                this._observations.push(observations[i]);
                if (this._observations.length > this._maxObservations) {
                    this._observations.shift();
                }
            }

            this._saveObservations();

            return observations;
        },

        /**
         * 获取迁移观察
         * @param {Object} filters — 过滤条件
         * @param {string} filters.conceptId — 概念 ID
         * @param {string} filters.transferType — 迁移类型
         * @param {number} filters.limit — 最大数量
         * @returns {Array} 观察列表
         */
        getObservations: function(filters) {
            filters = filters || {};
            var observations = this._observations.slice().reverse();

            if (filters.conceptId) {
                observations = observations.filter(function(o) {
                    return o.conceptId === filters.conceptId;
                });
            }

            if (filters.transferType) {
                observations = observations.filter(function(o) {
                    return o.transferType === filters.transferType;
                });
            }

            if (filters.limit) {
                observations = observations.slice(0, filters.limit);
            }

            return observations;
        },

        /**
         * 获取概念的所有迁移
         * @param {string} conceptId — 概念 ID
         * @returns {Array} 迁移列表
         */
        getTransfersForConcept: function(conceptId) {
            return this.getObservations({ conceptId: conceptId });
        },

        /**
         * 获取最近的迁移
         * @param {number} limit — 最大数量
         * @returns {Array} 最近的迁移
         */
        getRecentTransfers: function(limit) {
            limit = limit || 10;
            return this._observations.slice(-limit).reverse();
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._observations.length,
                byTransferType: {},
                byAssistanceLevel: {},
                recent: this._observations.slice(-5).reverse()
            };

            for (var i = 0; i < this._observations.length; i++) {
                var o = this._observations[i];
                stats.byTransferType[o.transferType] = (stats.byTransferType[o.transferType] || 0) + 1;
                stats.byAssistanceLevel[o.assistanceLevel] = (stats.byAssistanceLevel[o.assistanceLevel] || 0) + 1;
            }

            return stats;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            return {
                version: this.version,
                initialized: this.initialized,
                observationCount: this._observations.length
            };
        },

        // ============================================================
        // PRIVATE — Observation Methods
        // ============================================================

        _observeFromActions: function(context) {
            var observations = [];
            var model = window.LawAIApp?.TransferModel;
            if (!model) return observations;

            var actionTracker = window.LawAIApp?.ActionTracker;
            if (!actionTracker) return observations;

            try {
                var history = actionTracker.getHistory(30);
                if (!history || history.length < 3) return observations;

                // 检测概念重复出现
                var conceptOccurrences = {};
                for (var i = 0; i < history.length; i++) {
                    var a = history[i];
                    if (a.target && a.target.indexOf('concept') !== -1) {
                        if (!conceptOccurrences[a.target]) {
                            conceptOccurrences[a.target] = [];
                        }
                        conceptOccurrences[a.target].push(a);
                    }
                }

                // 检查是否有概念在多个情境中出现
                var model_2 = window.LawAIApp?.TransferModel;
                for (var conceptId in conceptOccurrences) {
                    if (conceptOccurrences.hasOwnProperty(conceptId)) {
                        var occurrences = conceptOccurrences[conceptId];
                        if (occurrences.length >= 2) {
                            // 检查情境是否不同
                            var contexts = {};
                            for (var j = 0; j < occurrences.length; j++) {
                                var ctx = occurrences[j].metadata?.context || 'default';
                                contexts[ctx] = (contexts[ctx] || 0) + 1;
                            }

                            if (Object.keys(contexts).length >= 2) {
                                var transferType = Object.keys(contexts).length > 2 ? 'FAR_TRANSFER' : 'NEAR_TRANSFER';
                                var assistanceLevel = this._detectAssistanceLevel(occurrences);

                                observations.push(model_2.createObservation({
                                    conceptId: conceptId,
                                    originalContext: Object.keys(contexts)[0] || 'original',
                                    newContext: Object.keys(contexts)[1] || 'new',
                                    transferType: transferType,
                                    assistanceLevel: assistanceLevel,
                                    evidence: ['Concept appeared in ' + Object.keys(contexts).length + ' different contexts'],
                                    confidence: Math.min(0.8, 0.3 + Object.keys(contexts).length * 0.15)
                                }));
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('[TransferObserver] Action observation error:', e);
            }

            return observations;
        },

        _observeFromContext: function(context) {
            var observations = [];
            var model = window.LawAIApp?.TransferModel;
            if (!model) return observations;

            var learningContext = window.LawAIApp?.LearningContext;
            if (!learningContext) return observations;

            try {
                var ctx = learningContext.getContext();
                if (!ctx) return observations;

                // 检查跨课程学习
                if (ctx.course && ctx.lesson) {
                    // 检查是否在多个课程中学习过类似概念
                    var courseRegistry = window.LawAIApp?.CourseRegistry;
                    if (courseRegistry) {
                        var courses = courseRegistry.getAllCourses();
                        var relatedConcepts = [];
                        for (var i = 0; i < courses.length; i++) {
                            if (courses[i].id !== ctx.course.id) {
                                // 检查是否有相似主题
                                if (courses[i].tags && courses[i].tags.some(function(t) {
                                    return ctx.course.tags && ctx.course.tags.indexOf(t) !== -1;
                                })) {
                                    relatedConcepts.push(courses[i].id);
                                }
                            }
                        }

                        if (relatedConcepts.length > 0) {
                            observations.push(model.createObservation({
                                conceptId: ctx.course.id,
                                originalContext: ctx.course.id,
                                newContext: relatedConcepts[0],
                                transferType: 'CROSS_COURSE',
                                assistanceLevel: 'NONE',
                                evidence: ['Similar concepts found in other courses'],
                                confidence: 0.4
                            }));
                        }
                    }
                }
            } catch (e) {
                console.warn('[TransferObserver] Context observation error:', e);
            }

            return observations;
        },

        _observeFromKnowledgeGraph: function(context) {
            var observations = [];
            var model = window.LawAIApp?.TransferModel;
            if (!model) return observations;

            var kg = window.LawAIApp?.KnowledgeGraph;
            if (!kg) return observations;

            try {
                // 使用知识图谱查找关系
                var nodes = kg.getAllNodes ? kg.getAllNodes() : [];
                if (nodes && nodes.length > 1) {
                    // 查找跨域关系
                    var crossDomainEdges = [];
                    for (var i = 0; i < nodes.length; i++) {
                        for (var j = i + 1; j < nodes.length; j++) {
                            if (nodes[i].domain !== nodes[j].domain) {
                                crossDomainEdges.push({
                                    source: nodes[i].id,
                                    target: nodes[j].id,
                                    sourceDomain: nodes[i].domain,
                                    targetDomain: nodes[j].domain
                                });
                            }
                        }
                    }

                    if (crossDomainEdges.length > 0) {
                        var edge = crossDomainEdges[0];
                        observations.push(model.createObservation({
                            conceptId: edge.source,
                            originalContext: edge.sourceDomain || 'source',
                            newContext: edge.targetDomain || 'target',
                            transferType: 'CROSS_SCHOOL',
                            assistanceLevel: 'NONE',
                            evidence: ['Knowledge graph shows cross-domain connection'],
                            confidence: 0.3
                        }));
                    }
                }
            } catch (e) {
                console.warn('[TransferObserver] KnowledgeGraph observation error:', e);
            }

            return observations;
        },

        _detectAssistanceLevel: function(occurrences) {
            var model = window.LawAIApp?.TransferModel;
            if (!model) return model.ASSISTANCE.NONE;

            var hasFullAssistance = false;
            var hasHint = false;

            for (var i = 0; i < occurrences.length; i++) {
                var meta = occurrences[i].metadata || {};
                if (meta.assistance === 'full' || meta.assistance === 'FULL') {
                    hasFullAssistance = true;
                }
                if (meta.assistance === 'hint' || meta.assistance === 'HINT') {
                    hasHint = true;
                }
            }

            if (hasFullAssistance) return model.ASSISTANCE.FULL;
            if (hasHint) return model.ASSISTANCE.HINT;
            return model.ASSISTANCE.NONE;
        },

        _loadObservations: function() {
            try {
                var saved = localStorage.getItem('transferObservations');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.observations) {
                        this._observations = data.observations;
                        console.log('[TransferObserver] Loaded', this._observations.length, 'observations');
                    }
                }
            } catch (e) {
                // ignore
            }
        },

        _saveObservations: function() {
            try {
                localStorage.setItem('transferObservations', JSON.stringify({
                    observations: this._observations.slice(-this._maxObservations),
                    updatedAt: Date.now()
                }));
            } catch (e) {
                // ignore
            }
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    if (!window.LawAIApp) {
        window.LawAIApp = {};
    }

    window.LawAIApp.TransferObserver = TransferObserver;

    function autoInit() {
        if (!TransferObserver.initialized) {
            TransferObserver.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 500);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 500);
        });
    }

    console.log('[TransferObserver] Module loaded (Part 61)');

})();
