// ================================================================
// ENGINE: PrerequisiteEngine
// LAYER: Intelligence Layer
// DOMAIN: Prerequisite Intelligence & Readiness
// VERSION: 1.0.0 — Part 41 Prerequisite Intelligence
// ================================================================
//
// PURPOSE
// ================================================================
//   Determine if a learner is ready for a knowledge target.
//   Combines Knowledge Graph (structure) + Learner Model (state).
//
// READINESS STATES (Part 41)
// ================================================================
//   READY         → All hard prerequisites satisfy threshold
//   NOT_READY     → One or more prerequisites are insufficient
//   UNKNOWN       → Required state is unavailable
//   UNAVAILABLE   → Target or prerequisite content cannot be resolved
//
// BOUNDARIES
// ================================================================
//   Graph owns: structure
//   Learner Model owns: learner state
//   Mastery owns: mastery calculation
//   PrerequisiteEngine owns: readiness reasoning ONLY
//
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.PrerequisiteEngine) {
        console.log('[PrerequisiteEngine] Already exists, skipping...');
        return;
    }

    var _initialized = false;
    var _version = '1.0.0';

    // ============================================================
    // READINESS STATE CONSTANTS
    // ============================================================
    var STATES = {
        READY: 'READY',
        NOT_READY: 'NOT_READY',
        UNKNOWN: 'UNKNOWN',
        UNAVAILABLE: 'UNAVAILABLE'
    };

    var STATE_LABELS = {
        READY: 'Ready',
        NOT_READY: 'Not ready',
        UNKNOWN: 'Unknown',
        UNAVAILABLE: 'Unavailable'
    };

    // ============================================================
    // DEFAULT POLICY
    // ============================================================
    var POLICY = {
        // 默认掌握度阈值 (0-1)
        defaultThreshold: 0.6,
        // 是否检查软关系 (RELATED, SUPPORTS) — 默认不检查
        checkSoftRelations: false,
        // 是否检查记忆状态
        checkMemory: false,
        // 是否在未知时返回 UNKNOWN (而不是 NOT_READY)
        unknownAsNotReady: false
    };

    // ============================================================
    // CORE: Readiness Evaluation
    // ============================================================

    /**
     * 评估知识节点的就绪状态
     * @param {string} knowledgeId - 目标知识节点 ID
     * @param {Object} learnerContext - 学习者上下文 (可选，默认使用 LearnerModel)
     * @param {Object} options - 配置选项
     * @returns {Object} 就绪评估结果
     */
    function evaluateReadiness(knowledgeId, learnerContext, options) {
        options = options || {};

        // 合并策略
        var policy = { ...POLICY, ...options };
        var result = {
            targetId: knowledgeId,
            status: STATES.UNKNOWN,
            prerequisites: [],
            satisfied: [],
            unsatisfied: [],
            unknown: [],
            blockers: [],
            evaluatedAt: Date.now(),
            explanation: ''
        };

        // 1. 获取 Graph
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) {
            result.status = STATES.UNAVAILABLE;
            result.explanation = 'Knowledge Graph not available';
            return result;
        }

        // 2. 检查目标是否存在
        var targetNode = kg.getNode(knowledgeId);
        if (!targetNode) {
            result.status = STATES.UNAVAILABLE;
            result.explanation = 'Target knowledge node not found: ' + knowledgeId;
            return result;
        }

        // 3. 检查目标是否已弃用
        if (targetNode.status === 'deprecated') {
            result.status = STATES.UNAVAILABLE;
            result.explanation = 'Target knowledge is deprecated: ' + knowledgeId;
            return result;
        }

        // 4. 获取 Learner Context
        var context = learnerContext || _getDefaultLearnerContext();
        if (!context || !context.getKnowledgeState) {
            result.status = STATES.UNKNOWN;
            result.explanation = 'Learner context not available';
            return result;
        }

        // 5. 获取前置条件
        var prereqNodes = kg.getPrerequisites(knowledgeId);

        // 过滤：只保留硬关系 (PREREQUISITE)
        var hardPrereqs = [];
        var softPrereqs = [];

        for (var i = 0; i < prereqNodes.length; i++) {
            var node = prereqNodes[i];
            if (!node) continue;

            // 检查是否是硬关系
            var relations = kg.getRelations(node.id);
            var isHard = false;
            for (var j = 0; j < relations.length; j++) {
                var rel = relations[j];
                if (rel.to === knowledgeId && rel.type === 'PREREQUISITE') {
                    isHard = true;
                    break;
                }
            }

            if (isHard) {
                hardPrereqs.push(node);
            } else if (policy.checkSoftRelations) {
                softPrereqs.push(node);
            }
        }

        result.prerequisites = hardPrereqs;

        // 如果没有前置条件，直接 READY
        if (hardPrereqs.length === 0) {
            result.status = STATES.READY;
            result.explanation = 'No prerequisites required.';
            return result;
        }

        // 6. 评估每个前置条件
        var threshold = options.threshold || policy.defaultThreshold;

        for (var i = 0; i < hardPrereqs.length; i++) {
            var prereq = hardPrereqs[i];
            var prereqId = prereq.id;

            var knowledgeState = context.getKnowledgeState(prereqId);

            // 如果前置条件已弃用，标记为 unavailable
            if (prereq.status === 'deprecated') {
                result.unknown.push({
                    node: prereq,
                    reason: 'Deprecated'
                });
                continue;
            }

            // 如果没有 mastery 数据
            if (!knowledgeState || !knowledgeState.mastery) {
                result.unknown.push({
                    node: prereq,
                    reason: 'Mastery data not available'
                });
                continue;
            }

            var masteryLevel = knowledgeState.mastery.level || 0;
            var isSatisfied = masteryLevel >= threshold;

            var item = {
                node: prereq,
                currentMastery: masteryLevel,
                threshold: threshold,
                satisfied: isSatisfied
            };

            if (isSatisfied) {
                result.satisfied.push(item);
            } else {
                result.unsatisfied.push(item);
                result.blockers.push(item);
            }
        }

        // 7. 确定最终状态
        if (result.unsatisfied.length > 0) {
            result.status = STATES.NOT_READY;
            result.explanation = _buildNotReadyExplanation(result);
        } else if (result.unknown.length > 0) {
            if (policy.unknownAsNotReady) {
                result.status = STATES.NOT_READY;
                result.explanation = 'Some prerequisites have unknown status.';
            } else {
                result.status = STATES.UNKNOWN;
                result.explanation = 'Some prerequisites have unknown mastery status.';
            }
        } else if (result.satisfied.length === hardPrereqs.length) {
            result.status = STATES.READY;
            result.explanation = 'All ' + hardPrereqs.length + ' prerequisites satisfy threshold.';
        } else {
            // 防御：不应该到这里
            result.status = STATES.UNKNOWN;
            result.explanation = 'Unexpected state during evaluation.';
        }

        return result;
    }

    /**
     * 获取直接前置条件
     */
    function getDirectPrerequisites(knowledgeId) {
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var prereqs = kg.getPrerequisites(knowledgeId);
        // 过滤只保留直接关系（通过检查关系类型）
        return prereqs.filter(function(node) {
            if (!node) return false;
            var relations = kg.getRelations(node.id);
            for (var i = 0; i < relations.length; i++) {
                if (relations[i].to === knowledgeId && relations[i].type === 'PREREQUISITE') {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * 获取所有前置条件（传递闭包）
     */
    function getAllPrerequisites(knowledgeId) {
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var chain = kg.getPrerequisiteChain(knowledgeId);
        // chain 包含自身，移除自身
        return chain.filter(function(node) {
            return node && node.id !== knowledgeId;
        });
    }

    /**
     * 获取前置条件链（有序）
     */
    function getPrerequisiteChain(knowledgeId) {
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];
        return kg.getPrerequisiteChain(knowledgeId);
    }

    /**
     * 获取前置条件阻断器
     */
    function getPrerequisiteBlockers(knowledgeId, learnerContext) {
        var result = evaluateReadiness(knowledgeId, learnerContext);
        return result.blockers || [];
    }

    /**
     * 获取可到达的知识（所有前置条件已满足）
     */
    function getReachableKnowledge(learnerContext, options) {
        options = options || {};
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var allNodes = kg.getAllNodes();
        var reachable = [];

        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (!node || node.status === 'deprecated') continue;

            var result = evaluateReadiness(node.id, learnerContext, options);
            if (result.status === STATES.READY) {
                reachable.push({
                    node: node,
                    evaluation: result
                });
            }
        }

        return reachable;
    }

    /**
     * 获取被阻断的知识
     */
    function getBlockedKnowledge(learnerContext, options) {
        options = options || {};
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var allNodes = kg.getAllNodes();
        var blocked = [];

        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (!node || node.status === 'deprecated') continue;

            var result = evaluateReadiness(node.id, learnerContext, options);
            if (result.status === STATES.NOT_READY) {
                blocked.push({
                    node: node,
                    blockers: result.blockers,
                    evaluation: result
                });
            }
        }

        return blocked;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _getDefaultLearnerContext() {
        return window.LawAIApp.LearnerModel || null;
    }

    function _buildNotReadyExplanation(result) {
        var blockerNames = result.blockers.map(function(b) {
            var name = b.node.title || b.node.id;
            var gap = ((b.threshold || 0.6) - (b.currentMastery || 0));
            return name + ' (gap: ' + Math.round(gap * 100) + '%)';
        });

        return 'Not ready: ' + blockerNames.join(', ');
    }

    // ============================================================
    // POLICY MANAGEMENT
    // ============================================================

    function getPolicy() {
        return { ...POLICY };
    }

    function setPolicy(newPolicy) {
        if (newPolicy && typeof newPolicy === 'object') {
            for (var key in newPolicy) {
                if (newPolicy.hasOwnProperty(key) && POLICY.hasOwnProperty(key)) {
                    POLICY[key] = newPolicy[key];
                }
            }
            console.log('[PrerequisiteEngine] Policy updated:', POLICY);
        }
    }

    // ============================================================
    // STATUS
    // ============================================================

    function getStatus() {
        var kg = window.LawAIApp.KnowledgeGraph;
        var lm = window.LawAIApp.LearnerModel;

        return {
            version: _version,
            initialized: _initialized,
            graphAvailable: !!kg,
            learnerModelAvailable: !!lm,
            policy: POLICY,
            states: STATES
        };
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[PrerequisiteEngine] Already initialized');
            return;
        }

        console.log('[PrerequisiteEngine] 🚀 Initializing v' + _version + '...');

        try {
            // 检查依赖
            var kg = window.LawAIApp.KnowledgeGraph;
            var lm = window.LawAIApp.LearnerModel;

            if (!kg) {
                console.warn('[PrerequisiteEngine] ⚠️ Knowledge Graph not available');
            }
            if (!lm) {
                console.warn('[PrerequisiteEngine] ⚠️ Learner Model not available');
            }

            _initialized = true;
            console.log('[PrerequisiteEngine] ✅ Initialized');
            console.log('   📊 Graph: ' + (kg ? 'available' : 'unavailable'));
            console.log('   🧠 Learner Model: ' + (lm ? 'available' : 'unavailable'));
        } catch (e) {
            console.error('[PrerequisiteEngine] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    var PrerequisiteEngine = {
        _version: _version,

        // Constants
        STATES: STATES,

        // Core
        evaluateReadiness: evaluateReadiness,
        getDirectPrerequisites: getDirectPrerequisites,
        getAllPrerequisites: getAllPrerequisites,
        getPrerequisiteChain: getPrerequisiteChain,
        getPrerequisiteBlockers: getPrerequisiteBlockers,
        getReachableKnowledge: getReachableKnowledge,
        getBlockedKnowledge: getBlockedKnowledge,

        // Policy
        getPolicy: getPolicy,
        setPolicy: setPolicy,

        // Status
        getStatus: getStatus,
        init: init
    };

    // ============================================================
    // EXPORT
    // ============================================================

    window.LawAIApp.PrerequisiteEngine = PrerequisiteEngine;

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            PrerequisiteEngine.init();
            console.log('[PrerequisiteEngine] ✅ Auto-initialized');
        } catch (err) {
            console.warn('[PrerequisiteEngine] ⚠️ Auto-init failed:', err);
        }
    }, 900);

    console.log('[PrerequisiteEngine] ✅ Module loaded (v1.0.0)');

})();
