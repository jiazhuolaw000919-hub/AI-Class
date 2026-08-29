// js/academy/metacognitiveExperience.js
// Part 58 — Metacognitive Experience
// Law AI Academy Developer Bible
//
// PURPOSE: Support learner reflection and self-assessment
// RULES: No forced reflection, no psychological profiling

(function() {
    'use strict';

    if (window.LawAIApp && window.LawAIApp.MetacognitiveExperience) {
        console.log('[MetacognitiveExperience] Already exists, skipping...');
        return;
    }

    /**
     * MetacognitiveExperience
     *
     * 职责：支持学习者反思和自我评估
     * 
     * 支持:
     * 1. 轻量级反思 (Micro-reflection)
     * 2. 深度反思 (Deep reflection)
     * 3. 自我评估 (Self-assessment)
     * 4. 反思 → Notes 保存
     * 
     * 规则:
     * - 不强制反思
     * - 不创建心理学标签
     * - 反思不取代权威掌握
     */
    var MetacognitiveExperience = {
        version: '1.0.0',
        initialized: false,

        _reflectionHistory: [],
        _maxHistory: 100,

        // ============================================================
        // REFLECTION TYPES
        // ============================================================

        TYPES: {
            MICRO: 'MICRO',
            DEEP: 'DEEP',
            SELF_ASSESSMENT: 'SELF_ASSESSMENT',
            GOAL_REFLECTION: 'GOAL_REFLECTION',
            OUTCOME_REFLECTION: 'OUTCOME_REFLECTION'
        },

        // ============================================================
        // PUBLIC API
        // ============================================================

        /**
         * 初始化
         */
        init: function() {
            if (this.initialized) {
                console.log('[MetacognitiveExperience] Already initialized');
                return this;
            }

            console.log('[MetacognitiveExperience] 🚀 Initializing...');
            this._loadReflections();
            this.initialized = true;
            console.log('[MetacognitiveExperience] ✅ Initialized');
            return this;
        },

        /**
         * 记录微反思 (轻量级)
         * @param {Object} data
         * @param {string} data.action — 动作
         * @param {string} data.response — 响应 (helpful/too_easy/too_hard/not_relevant)
         * @param {string} data.optionId — 选项 ID
         * @returns {Object} 反思记录
         */
        recordMicroReflection: function(data) {
            if (!data || !data.response) {
                console.warn('[MetacognitiveExperience] Invalid micro-reflection');
                return null;
            }

            var reflection = {
                id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: this.TYPES.MICRO,
                action: data.action || 'unknown',
                response: data.response,
                optionId: data.optionId || null,
                timestamp: Date.now(),
                metadata: data.metadata || {}
            };

            this._reflectionHistory.push(reflection);
            if (this._reflectionHistory.length > this._maxHistory) {
                this._reflectionHistory.shift();
            }

            this._saveReflections();
            this._emit('MICRO_REFLECTION_RECORDED', reflection);

            // 如果响应是 "not_relevant"，可能触发适应
            if (data.response === 'not_relevant') {
                this._handleNotRelevant(reflection);
            }

            return reflection;
        },

        /**
         * 记录深度反思
         * @param {Object} data
         * @param {string} data.question — 反思问题
         * @param {string} data.answer — 学习者的回答
         * @param {string} data.context — 上下文
         * @returns {Object} 反思记录
         */
        recordDeepReflection: function(data) {
            if (!data || !data.question) {
                console.warn('[MetacognitiveExperience] Invalid deep reflection');
                return null;
            }

            var reflection = {
                id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: this.TYPES.DEEP,
                question: data.question,
                answer: data.answer || '',
                context: data.context || 'general',
                timestamp: Date.now(),
                metadata: data.metadata || {}
            };

            this._reflectionHistory.push(reflection);
            if (this._reflectionHistory.length > this._maxHistory) {
                this._reflectionHistory.shift();
            }

            this._saveReflections();
            this._emit('DEEP_REFLECTION_RECORDED', reflection);

            return reflection;
        },

        /**
         * 记录自我评估
         * @param {Object} data
         * @param {string} data.topic — 主题
         * @param {number} data.confidence — 置信度 (1-5)
         * @param {string} data.notes — 备注
         * @param {string} data.lessonId — 课时 ID
         * @returns {Object} 自我评估记录
         */
        recordSelfAssessment: function(data) {
            if (!data || !data.topic) {
                console.warn('[MetacognitiveExperience] Invalid self-assessment');
                return null;
            }

            var confidence = Math.min(5, Math.max(1, data.confidence || 3));

            var assessment = {
                id: 'sa_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: this.TYPES.SELF_ASSESSMENT,
                topic: data.topic,
                confidence: confidence,
                confidenceLabel: this._getConfidenceLabel(confidence),
                notes: data.notes || '',
                lessonId: data.lessonId || null,
                timestamp: Date.now(),
                metadata: data.metadata || {}
            };

            this._reflectionHistory.push(assessment);
            if (this._reflectionHistory.length > this._maxHistory) {
                this._reflectionHistory.shift();
            }

            this._saveReflections();
            this._emit('SELF_ASSESSMENT_RECORDED', assessment);

            return assessment;
        },

        /**
         * 记录目标反思
         * @param {Object} data
         * @param {string} data.goalId — 目标 ID
         * @param {string} data.response — 响应 (still_relevant/need_update/changed)
         * @param {string} data.comment — 评论
         * @returns {Object} 目标反思记录
         */
        recordGoalReflection: function(data) {
            if (!data || !data.goalId) {
                console.warn('[MetacognitiveExperience] Invalid goal reflection');
                return null;
            }

            var reflection = {
                id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: this.TYPES.GOAL_REFLECTION,
                goalId: data.goalId,
                response: data.response || 'still_relevant',
                comment: data.comment || '',
                timestamp: Date.now(),
                metadata: data.metadata || {}
            };

            this._reflectionHistory.push(reflection);
            if (this._reflectionHistory.length > this._maxHistory) {
                this._reflectionHistory.shift();
            }

            this._saveReflections();
            this._emit('GOAL_REFLECTION_RECORDED', reflection);

            return reflection;
        },

        /**
         * 记录结果反思
         * @param {Object} data
         * @param {string} data.outcomeId — 结果 ID
         * @param {string} data.response — 响应
         * @param {string} data.comment — 评论
         * @returns {Object} 结果反思记录
         */
        recordOutcomeReflection: function(data) {
            if (!data || !data.outcomeId) {
                console.warn('[MetacognitiveExperience] Invalid outcome reflection');
                return null;
            }

            var reflection = {
                id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                type: this.TYPES.OUTCOME_REFLECTION,
                outcomeId: data.outcomeId,
                response: data.response || 'neutral',
                comment: data.comment || '',
                timestamp: Date.now(),
                metadata: data.metadata || {}
            };

            this._reflectionHistory.push(reflection);
            if (this._reflectionHistory.length > this._maxHistory) {
                this._reflectionHistory.shift();
            }

            this._saveReflections();
            this._emit('OUTCOME_REFLECTION_RECORDED', reflection);

            return reflection;
        },

        /**
         * 保存反思到 Notes
         * @param {string} reflectionId — 反思 ID
         * @param {Object} noteData — 笔记数据
         * @returns {Object} 结果
         */
        saveToNotes: function(reflectionId, noteData) {
            var reflection = this.getReflection(reflectionId);
            if (!reflection) {
                return { success: false, error: 'Reflection not found' };
            }

            var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
            if (!notes) {
                return { success: false, error: 'Notes system not available' };
            }

            try {
                var content = this._formatForNotes(reflection, noteData);
                var result = null;

                if (typeof notes.addNote === 'function') {
                    result = notes.addNote(content);
                } else if (typeof notes.save === 'function') {
                    result = notes.save(content);
                } else if (typeof notes.create === 'function') {
                    result = notes.create(content);
                } else {
                    return { success: false, error: 'Notes API not compatible' };
                }

                if (result) {
                    this._emit('REFLECTION_SAVED_TO_NOTES', { reflectionId: reflectionId, noteId: result.id });
                    return { success: true, noteId: result.id };
                }

                return { success: false, error: 'Save failed' };
            } catch (e) {
                console.warn('[MetacognitiveExperience] Save to notes failed:', e);
                return { success: false, error: e.message };
            }
        },

        /**
         * 获取反思
         * @param {string} reflectionId — 反思 ID
         * @returns {Object|null} 反思记录
         */
        getReflection: function(reflectionId) {
            for (var i = 0; i < this._reflectionHistory.length; i++) {
                if (this._reflectionHistory[i].id === reflectionId) {
                    return this._reflectionHistory[i];
                }
            }
            return null;
        },

        /**
         * 获取反思历史
         * @param {number} limit — 最大数量
         * @param {string} type — 可选，按类型筛选
         * @returns {Array} 反思列表
         */
        getHistory: function(limit, type) {
            limit = limit || 20;
            var history = this._reflectionHistory.slice(-limit).reverse();

            if (type) {
                history = history.filter(function(r) { return r.type === type; });
            }

            return history;
        },

        /**
         * 获取自我评估历史
         * @param {string} topic — 可选，按主题筛选
         * @returns {Array} 自我评估列表
         */
        getSelfAssessments: function(topic) {
            var assessments = this._reflectionHistory.filter(function(r) {
                return r.type === 'SELF_ASSESSMENT';
            });

            if (topic) {
                assessments = assessments.filter(function(a) { return a.topic === topic; });
            }

            return assessments.slice(-20).reverse();
        },

        /**
         * 获取统计
         * @returns {Object} 统计信息
         */
        getStats: function() {
            var stats = {
                total: this._reflectionHistory.length,
                byType: {},
                recentMicro: 0,
                recentDeep: 0,
                recentAssessments: 0
            };

            var now = Date.now();
            var dayAgo = now - 24 * 60 * 60 * 1000;

            for (var i = 0; i < this._reflectionHistory.length; i++) {
                var r = this._reflectionHistory[i];
                stats.byType[r.type] = (stats.byType[r.type] || 0) + 1;

                if (r.timestamp > dayAgo) {
                    if (r.type === 'MICRO') stats.recentMicro++;
                    if (r.type === 'DEEP') stats.recentDeep++;
                    if (r.type === 'SELF_ASSESSMENT') stats.recentAssessments++;
                }
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
                reflectionCount: this._reflectionHistory.length
            };
        },

        // ============================================================
        // PRIVATE
        // ============================================================

        _getConfidenceLabel: function(confidence) {
            var labels = {
                1: 'Very Low',
                2: 'Low',
                3: 'Moderate',
                4: 'High',
                5: 'Very High'
            };
            return labels[confidence] || 'Unknown';
        },

        _handleNotRelevant: function(reflection) {
            // 通知适应系统
            try {
                var record = window.LawAIApp?.AdaptationRecord;
                if (record && typeof record.create === 'function') {
                    record.create({
                        trigger: 'FEEDBACK',
                        evidence: ['Learner marked recommendation as not relevant'],
                        scope: 'support',
                        reason: 'Learner indicated recommendation was not relevant',
                        level: 1,
                        reversible: true,
                        metadata: {
                            reflectionId: reflection.id,
                            optionId: reflection.optionId
                        }
                    });
                }
            } catch (e) {
                // ignore
            }
        },

        _formatForNotes: function(reflection, noteData) {
            var content = {
                title: noteData.title || 'Reflection: ' + (reflection.type || 'Learning Reflection'),
                content: noteData.content || this._getDefaultContent(reflection),
                timestamp: Date.now(),
                type: 'reflection',
                reflectionId: reflection.id,
                source: 'metacognitive-experience'
            };

            if (reflection.lessonId) {
                content.lessonId = reflection.lessonId;
            }
            if (reflection.topic) {
                content.topic = reflection.topic;
            }

            return content;
        },

        _getDefaultContent: function(reflection) {
            switch (reflection.type) {
                case 'MICRO':
                    return 'Micro-reflection: ' + (reflection.response || '') + ' for action: ' + (reflection.action || '');
                case 'DEEP':
                    return 'Q: ' + (reflection.question || '') + '\nA: ' + (reflection.answer || '');
                case 'SELF_ASSESSMENT':
                    return 'Self-assessment on ' + (reflection.topic || '') + ': ' + reflection.confidenceLabel + ' (' + reflection.confidence + '/5)';
                case 'GOAL_REFLECTION':
                    return 'Goal reflection: ' + (reflection.response || '') + ' - ' + (reflection.comment || '');
                case 'OUTCOME_REFLECTION':
                    return 'Outcome reflection: ' + (reflection.response || '') + ' - ' + (reflection.comment || '');
                default:
                    return 'Reflection recorded';
            }
        },

        _loadReflections: function() {
            try {
                var saved = localStorage.getItem('metacognitiveReflections');
                if (saved) {
                    var data = JSON.parse(saved);
                    if (data.reflections) {
                        this._reflectionHistory = data.reflections;
                        console.log('[MetacognitiveExperience] Loaded', this._reflectionHistory.length, 'reflections');
                    }
                }
            } catch (e) {
                // ignore
            }
        },

        _saveReflections: function() {
            try {
                localStorage.setItem('metacognitiveReflections', JSON.stringify({
                    reflections: this._reflectionHistory.slice(-100),
                    updatedAt: Date.now()
                }));
            } catch (e) {
                // ignore
            }
        },

        _emit: function(eventName, data) {
            try {
                var event = new CustomEvent(eventName, { detail: data || {} });
                document.dispatchEvent(event);
                window.dispatchEvent(event);

                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('metacognitive.' + eventName, data);
                }
            } catch (err) {
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

    window.LawAIApp.MetacognitiveExperience = MetacognitiveExperience;

    function autoInit() {
        if (!MetacognitiveExperience.initialized) {
            MetacognitiveExperience.init();
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(autoInit, 400);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoInit, 400);
        });
    }

    console.log('[MetacognitiveExperience] Module loaded (Part 58)');

})();
