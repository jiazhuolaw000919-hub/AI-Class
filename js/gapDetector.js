// gapDetector.js
// Part 42: 薄包装层 — 委托给 KnowledgeGapEngine

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.GapDetector && window.LawAIApp.GapDetector._upgraded) {
        console.log('[GapDetector] Already upgraded, skipping...');
        return;
    }

    var GapDetector = {
        _upgraded: true,
        _version: '2.0.0',

        /**
         * 检测缺失的前置知识
         * 委托给 KnowledgeGapEngine
         */
        getMissingPrerequisites: function(lessonId) {
            var engine = window.LawAIApp.KnowledgeGapEngine;
            if (engine && typeof engine.getRootKnowledgeGaps === 'function') {
                var roots = engine.getRootKnowledgeGaps(lessonId);
                if (roots && roots.length > 0) {
                    return roots.map(function(r) {
                        return r.node ? r.node.id : null;
                    }).filter(function(id) { return id; });
                }
            }

            // Fallback: 使用 KnowledgeGraph
            var kg = window.LawAIApp.KnowledgeGraph;
            if (kg && typeof kg.getPrerequisites === 'function') {
                var prereqs = kg.getPrerequisites(lessonId);
                return prereqs.map(function(p) { return p.id; });
            }
            return [];
        },

        /**
         * 检测薄弱技能（掌握度 < 40）
         * 委托给 MasteryEngine
         */
        getWeakSkills: function() {
            var mastery = window.LawAIApp.MasteryEngine;
            if (mastery && typeof mastery.getAllSkills === 'function') {
                var skills = mastery.getAllSkills();
                return skills.filter(function(s) {
                    return (s.progress || 0) < 40;
                });
            }

            // Fallback: 从 KnowledgeGapEngine 获取
            var engine = window.LawAIApp.KnowledgeGapEngine;
            if (engine && typeof engine.getBlockedTargets === 'function') {
                var blocked = engine.getBlockedTargets();
                return blocked.map(function(b) {
                    return {
                        id: b.node ? b.node.id : null,
                        title: b.node ? (b.node.title || b.node.id) : 'Unknown',
                        mastery: b.readiness && b.readiness.gap ? b.readiness.gap.currentMastery : 0
                    };
                }).filter(function(s) { return s.id; });
            }
            return [];
        },

        /**
         * 检测低保留率知识点（记忆强度 < 40）
         * 委托给 MemoryEngine
         */
        getLowRetentionLessons: function() {
            var memory = window.LawAIApp.MemoryEngine;
            if (memory && typeof memory.getAll === 'function') {
                var all = memory.getAll();
                var keys = Object.keys(all);
                var result = [];
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (key === '_schemaVersion') continue;
                    var entry = all[key];
                    if ((entry.strength || 0) < 40) {
                        result.push(key);
                    }
                }
                return result;
            }
            return [];
        },

        /**
         * 生成完整的知识缺口报告
         * 委托给 KnowledgeGapEngine
         */
        getReport: function(lessonId) {
            lessonId = lessonId || null;

            var engine = window.LawAIApp.KnowledgeGapEngine;
            var report = {
                missingPrerequisites: [],
                weakSkills: [],
                lowRetention: [],
                rootGaps: [],
                blockedTargets: [],
                nearReadyTargets: []
            };

            if (engine) {
                // 获取缺口
                if (lessonId) {
                    var roots = engine.getRootKnowledgeGaps(lessonId);
                    if (roots && roots.length > 0) {
                        report.rootGaps = roots;
                        report.missingPrerequisites = roots.map(function(r) {
                            return r.node ? r.node.id : null;
                        }).filter(function(id) { return id; });
                    }
                }

                // 获取薄弱技能（通过 blocked targets）
                var blocked = engine.getBlockedTargets();
                if (blocked && blocked.length > 0) {
                    report.blockedTargets = blocked;
                    report.weakSkills = blocked.map(function(b) {
                        var node = b.node;
                        var title = node ? (node.title || node.id) : 'Unknown';
                        var mastery = b.readiness && b.readiness.gap ? b.readiness.gap.currentMastery : 0;
                        return {
                            id: node ? node.id : null,
                            title: title,
                            mastery: mastery
                        };
                    }).filter(function(s) { return s.id; });
                }

                // 获取近就绪目标
                var near = engine.getNearReadyTargets();
                if (near && near.length > 0) {
                    report.nearReadyTargets = near;
                }
            }

            // Fallback: 低保留率
            report.lowRetention = this.getLowRetentionLessons();

            // 触发事件
            try {
                if (window.LawAIApp?.EventBus && typeof window.LawAIApp.EventBus.emit === 'function') {
                    window.LawAIApp.EventBus.emit('GapDetected', report);
                }
            } catch (e) {}

            return report;
        },

        /**
         * 获取状态
         */
        getStatus: function() {
            var engine = window.LawAIApp.KnowledgeGapEngine;
            if (engine && typeof engine.getStatus === 'function') {
                return engine.getStatus();
            }
            return {
                version: this._version,
                upgraded: true,
                available: false
            };
        }
    };

    window.LawAIApp.GapDetector = GapDetector;
    console.log('[GapDetector] ✅ Upgraded to v2.0.0 (thin wrapper)');

})();
