// ================================================================
// ENGINE: KnowledgeGapEngine
// LAYER: Intelligence Layer
// DOMAIN: Knowledge Gap & Readiness Intelligence
// VERSION: 1.0.0 — Part 42 Knowledge Gap & Readiness
// ================================================================
//
// PURPOSE
// ================================================================
//   Move from "Is the learner ready?" to "Why is the learner not ready?"
//   Identify knowledge gaps, blockers, root causes, and near-ready targets.
//
// GAP TYPES (Part 42)
// ================================================================
//   MASTERY_GAP       → Current mastery below required threshold
//   PREREQUISITE_GAP  → Prerequisite chain has deficiency
//   UNKNOWN_STATE     → Learner state is unavailable
//   MISSING_KNOWLEDGE → Knowledge node cannot be resolved
//   DEPRECATED_KNOWLEDGE → Knowledge exists but is deprecated
//
// GAP STATUS
// ================================================================
//   OPEN       → Gap exists and is actionable
//   SATISFIED  → Current state meets requirement
//   UNKNOWN    → Required state is unavailable
//   UNAVAILABLE → Knowledge cannot be resolved
//   DEPRECATED → Knowledge is deprecated
//
// READINESS ENRICHMENT
// ================================================================
//   READY         → All prerequisites satisfy threshold
//   NEAR_READY    → Gap exists but is within configured window
//   NOT_READY     → Significant gap exists
//   UNKNOWN       → State unavailable
//   UNAVAILABLE   → Content cannot be resolved
//
// BOUNDARIES
// ================================================================
//   Graph owns: structure
//   Learner Model owns: learner state
//   Mastery owns: mastery calculation
//   PrerequisiteEngine owns: readiness
//   GapEngine owns: gap analysis ONLY
//
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.KnowledgeGapEngine) {
        console.log('[KnowledgeGapEngine] Already exists, skipping...');
        return;
    }

    var _initialized = false;
    var _version = '1.0.0';

    // ============================================================
    // CONSTANTS
    // ============================================================
    var GAP_TYPES = {
        MASTERY_GAP: 'MASTERY_GAP',
        PREREQUISITE_GAP: 'PREREQUISITE_GAP',
        UNKNOWN_STATE: 'UNKNOWN_STATE',
        MISSING_KNOWLEDGE: 'MISSING_KNOWLEDGE',
        DEPRECATED_KNOWLEDGE: 'DEPRECATED_KNOWLEDGE'
    };

    var GAP_STATUS = {
        OPEN: 'OPEN',
        SATISFIED: 'SATISFIED',
        UNKNOWN: 'UNKNOWN',
        UNAVAILABLE: 'UNAVAILABLE',
        DEPRECATED: 'DEPRECATED'
    };

    var READINESS = {
        READY: 'READY',
        NEAR_READY: 'NEAR_READY',
        NOT_READY: 'NOT_READY',
        UNKNOWN: 'UNKNOWN',
        UNAVAILABLE: 'UNAVAILABLE'
    };

    // ============================================================
    // POLICY
    // ============================================================
    var POLICY = {
        defaultThreshold: 0.6,
        nearReadyWindow: 0.05,  // 差距小于 5% 视为 NEAR_READY
        maxGapDepth: 10,
        includeSoftRelations: false
    };

    // ============================================================
    // CORE: Get Knowledge Gap
    // ============================================================

    /**
     * 获取单个知识节点的缺口
     * @param {string} knowledgeId - 知识节点 ID
     * @param {Object} learnerContext - 学习者上下文
     * @param {Object} options - 配置选项
     * @returns {Object} 缺口信息
     */
    function getKnowledgeGap(knowledgeId, learnerContext, options) {
        options = options || {};
        var threshold = options.threshold || POLICY.defaultThreshold;

        // 1. 获取 Graph
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) {
            return _createGapResult(knowledgeId, null, GAP_STATUS.UNAVAILABLE, 'Knowledge Graph not available');
        }

        // 2. 检查目标是否存在
        var targetNode = kg.getNode(knowledgeId);
        if (!targetNode) {
            return _createGapResult(knowledgeId, null, GAP_STATUS.UNAVAILABLE, 'Target knowledge not found');
        }

        // 3. 检查是否已弃用
        if (targetNode.status === 'deprecated') {
            return _createGapResult(knowledgeId, targetNode, GAP_STATUS.DEPRECATED, 'Target knowledge is deprecated');
        }

        // 4. 获取 Learner Context
        var context = learnerContext || _getDefaultLearnerContext();
        if (!context || typeof context.getKnowledgeState !== 'function') {
            return _createGapResult(knowledgeId, targetNode, GAP_STATUS.UNKNOWN, 'Learner context not available');
        }

        // 5. 获取当前掌握度
        var knowledgeState = context.getKnowledgeState(knowledgeId);
        var currentMastery = knowledgeState && knowledgeState.mastery ? knowledgeState.mastery.level : null;

        if (currentMastery === null || currentMastery === undefined) {
            return _createGapResult(knowledgeId, targetNode, GAP_STATUS.UNKNOWN, 'Mastery data not available');
        }

        // 6. 计算缺口
        var gap = Math.max(0, threshold - currentMastery);
        var isSatisfied = currentMastery >= threshold;
        var isNearReady = gap > 0 && gap <= POLICY.nearReadyWindow;

        var status = isSatisfied ? GAP_STATUS.SATISFIED : GAP_STATUS.OPEN;

        return {
            knowledgeId: knowledgeId,
            node: targetNode,
            gapType: GAP_TYPES.MASTERY_GAP,
            status: status,
            currentMastery: currentMastery,
            requiredMastery: threshold,
            gap: gap,
            isSatisfied: isSatisfied,
            isNearReady: isNearReady,
            explanation: _buildGapExplanation(knowledgeId, currentMastery, threshold, gap),
            evaluatedAt: Date.now()
        };
    }

    /**
     * 获取知识节点的根缺口（最上游的 actionable 缺口）
     */
    function getRootKnowledgeGaps(knowledgeId, learnerContext, options) {
        options = options || {};
        var result = [];

        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return result;

        var targetNode = kg.getNode(knowledgeId);
        if (!targetNode) return result;

        var context = learnerContext || _getDefaultLearnerContext();
        if (!context) return result;

        // 获取所有前置条件链
        var chain = kg.getPrerequisiteChain(knowledgeId);
        // chain 包含自身，移除自身
        var prereqChain = chain.filter(function(node) {
            return node && node.id !== knowledgeId;
        });

        // 从近到远检查每个前置条件
        var visited = {};

        for (var i = 0; i < prereqChain.length; i++) {
            var prereq = prereqChain[i];
            if (!prereq || visited[prereq.id]) continue;

            var gap = getKnowledgeGap(prereq.id, context, options);

            if (gap && gap.status === GAP_STATUS.OPEN) {
                // 找到根缺口
                result.push({
                    node: prereq,
                    gap: gap,
                    depth: chain.length - 1 - i,
                    path: _getDependencyPath(prereq.id, knowledgeId)
                });
                visited[prereq.id] = true;
            }
        }

        return result;
    }

    /**
     * 获取直接前置条件缺口
     */
    function getDirectGaps(knowledgeId, learnerContext, options) {
        var result = [];

        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return result;

        var prereqs = kg.getPrerequisites(knowledgeId);
        if (!prereqs || prereqs.length === 0) return result;

        var context = learnerContext || _getDefaultLearnerContext();
        if (!context) return result;

        for (var i = 0; i < prereqs.length; i++) {
            var prereq = prereqs[i];
            if (!prereq) continue;

            var gap = getKnowledgeGap(prereq.id, context, options);
            if (gap && gap.status === GAP_STATUS.OPEN) {
                result.push({
                    node: prereq,
                    gap: gap,
                    isDirect: true
                });
            }
        }

        return result;
    }

    // ============================================================
    // CORE: Readiness Enrichment
    // ============================================================

    /**
     * 评估目标就绪状态（含缺口信息）
     */
    function evaluateTargetReadiness(knowledgeId, learnerContext, options) {
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) {
            return { status: READINESS.UNAVAILABLE, reason: 'Knowledge Graph not available' };
        }

        var targetNode = kg.getNode(knowledgeId);
        if (!targetNode) {
            return { status: READINESS.UNAVAILABLE, reason: 'Target not found' };
        }

        if (targetNode.status === 'deprecated') {
            return { status: READINESS.UNAVAILABLE, reason: 'Target deprecated' };
        }

        // 获取缺口
        var gap = getKnowledgeGap(knowledgeId, learnerContext, options);

        if (!gap) {
            return { status: READINESS.UNKNOWN, reason: 'Gap evaluation failed' };
        }

        if (gap.status === GAP_STATUS.UNKNOWN) {
            return { status: READINESS.UNKNOWN, reason: gap.explanation || 'Mastery unknown' };
        }

        if (gap.status === GAP_STATUS.UNAVAILABLE) {
            return { status: READINESS.UNAVAILABLE, reason: gap.explanation || 'Content unavailable' };
        }

        if (gap.status === GAP_STATUS.DEPRECATED) {
            return { status: READINESS.UNAVAILABLE, reason: 'Target deprecated' };
        }

        if (gap.isSatisfied) {
            // 检查所有前置条件
            var prereqs = kg.getPrerequisites(knowledgeId);
            if (prereqs && prereqs.length > 0) {
                var allSatisfied = true;
                var context = learnerContext || _getDefaultLearnerContext();
                for (var i = 0; i < prereqs.length; i++) {
                    var prereqGap = getKnowledgeGap(prereqs[i].id, context, options);
                    if (prereqGap && prereqGap.status !== GAP_STATUS.SATISFIED) {
                        allSatisfied = false;
                        break;
                    }
                }
                if (!allSatisfied) {
                    return { status: READINESS.NOT_READY, reason: 'Prerequisite not satisfied', gap: gap };
                }
            }
            return { status: READINESS.READY, reason: 'All prerequisites satisfied', gap: gap };
        }

        if (gap.isNearReady) {
            return { status: READINESS.NEAR_READY, reason: 'Near ready: ' + gap.explanation, gap: gap };
        }

        return { status: READINESS.NOT_READY, reason: gap.explanation, gap: gap };
    }

    // ============================================================
    // CORE: Target Queries
    // ============================================================

    /**
     * 获取可到达的目标（所有前置条件已满足）
     */
    function getReachableTargets(learnerContext, options) {
        options = options || {};
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var allNodes = kg.getAllNodes();
        var reachable = [];

        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (!node || node.status === 'deprecated') continue;

            var readiness = evaluateTargetReadiness(node.id, learnerContext, options);
            if (readiness.status === READINESS.READY) {
                reachable.push({
                    node: node,
                    readiness: readiness
                });
            }
        }

        return reachable;
    }

    /**
     * 获取被阻断的目标
     */
    function getBlockedTargets(learnerContext, options) {
        options = options || {};
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var allNodes = kg.getAllNodes();
        var blocked = [];

        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (!node || node.status === 'deprecated') continue;

            var readiness = evaluateTargetReadiness(node.id, learnerContext, options);
            if (readiness.status === READINESS.NOT_READY) {
                var rootGaps = getRootKnowledgeGaps(node.id, learnerContext, options);
                blocked.push({
                    node: node,
                    readiness: readiness,
                    rootGaps: rootGaps
                });
            }
        }

        return blocked;
    }

    /**
     * 获取近就绪的目标
     */
    function getNearReadyTargets(learnerContext, options) {
        options = options || {};
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var allNodes = kg.getAllNodes();
        var nearReady = [];

        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (!node || node.status === 'deprecated') continue;

            var readiness = evaluateTargetReadiness(node.id, learnerContext, options);
            if (readiness.status === READINESS.NEAR_READY) {
                nearReady.push({
                    node: node,
                    readiness: readiness
                });
            }
        }

        return nearReady;
    }

    // ============================================================
    // CORE: Gap Priority Signals
    // ============================================================

    /**
     * 获取缺口优先级信号（供 Recommendation 使用）
     */
    function getGapPrioritySignals(knowledgeId, learnerContext, options) {
        var rootGaps = getRootKnowledgeGaps(knowledgeId, learnerContext, options);

        if (!rootGaps || rootGaps.length === 0) {
            return {
                knowledgeId: knowledgeId,
                hasGaps: false,
                priority: 0,
                signals: []
            };
        }

        // 计算优先级
        var priority = 0;
        var signals = [];

        for (var i = 0; i < rootGaps.length; i++) {
            var gap = rootGaps[i];
            var gapSize = gap.gap ? gap.gap.gap : 0;
            var depth = gap.depth || 0;

            // 缺口越大、越浅，优先级越高
            var score = Math.round(gapSize * 100) + (10 - Math.min(depth, 10)) * 5;
            priority = Math.max(priority, score);

            signals.push({
                nodeId: gap.node.id,
                nodeTitle: gap.node.title || gap.node.id,
                gapSize: gapSize,
                depth: depth,
                score: score
            });
        }

        return {
            knowledgeId: knowledgeId,
            hasGaps: true,
            priority: priority,
            signals: signals,
            topGap: rootGaps[0]
        };
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _getDefaultLearnerContext() {
        return window.LawAIApp.LearnerModel || null;
    }

    function _getPrerequisiteEngine() {
        return window.LawAIApp.PrerequisiteEngine || null;
    }

    function _createGapResult(knowledgeId, node, status, explanation) {
        return {
            knowledgeId: knowledgeId,
            node: node || null,
            gapType: GAP_TYPES.UNKNOWN_STATE,
            status: status,
            currentMastery: null,
            requiredMastery: null,
            gap: null,
            isSatisfied: false,
            isNearReady: false,
            explanation: explanation || 'Unknown state',
            evaluatedAt: Date.now()
        };
    }

    function _buildGapExplanation(knowledgeId, current, required, gap) {
        if (current >= required) {
            return 'Mastery sufficient';
        }
        return 'Mastery gap: ' + Math.round(gap * 100) + '% (current: ' + Math.round(current * 100) + '%, required: ' + Math.round(required * 100) + '%)';
    }

    function _getDependencyPath(fromId, toId) {
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) return [];

        var chain = kg.getPrerequisiteChain(toId);
        // 返回从 from 到 to 的路径
        var path = [];
        var found = false;

        for (var i = 0; i < chain.length; i++) {
            if (chain[i].id === fromId) {
                found = true;
            }
            if (found) {
                path.push(chain[i].id);
            }
        }

        return path;
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
            console.log('[KnowledgeGapEngine] Policy updated:', POLICY);
        }
    }

    // ============================================================
    // STATUS
    // ============================================================

    function getStatus() {
        var kg = window.LawAIApp.KnowledgeGraph;
        var lm = window.LawAIApp.LearnerModel;
        var pe = window.LawAIApp.PrerequisiteEngine;

        return {
            version: _version,
            initialized: _initialized,
            graphAvailable: !!kg,
            learnerModelAvailable: !!lm,
            prerequisiteEngineAvailable: !!pe,
            policy: POLICY,
            gapTypes: GAP_TYPES,
            readinessStates: READINESS
        };
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[KnowledgeGapEngine] Already initialized');
            return;
        }

        console.log('[KnowledgeGapEngine] 🚀 Initializing v' + _version + '...');

        try {
            var kg = window.LawAIApp.KnowledgeGraph;
            var lm = window.LawAIApp.LearnerModel;
            var pe = window.LawAIApp.PrerequisiteEngine;

            if (!kg) console.warn('[KnowledgeGapEngine] ⚠️ Knowledge Graph not available');
            if (!lm) console.warn('[KnowledgeGapEngine] ⚠️ Learner Model not available');
            if (!pe) console.warn('[KnowledgeGapEngine] ⚠️ Prerequisite Engine not available');

            _initialized = true;
            console.log('[KnowledgeGapEngine] ✅ Initialized');
        } catch (e) {
            console.error('[KnowledgeGapEngine] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    var KnowledgeGapEngine = {
        _version: _version,

        // Constants
        GAP_TYPES: GAP_TYPES,
        GAP_STATUS: GAP_STATUS,
        READINESS: READINESS,

        // Core Gap
        getKnowledgeGap: getKnowledgeGap,
        getRootKnowledgeGaps: getRootKnowledgeGaps,
        getDirectGaps: getDirectGaps,

        // Readiness
        evaluateTargetReadiness: evaluateTargetReadiness,

        // Target Queries
        getReachableTargets: getReachableTargets,
        getBlockedTargets: getBlockedTargets,
        getNearReadyTargets: getNearReadyTargets,

        // Priority Signals
        getGapPrioritySignals: getGapPrioritySignals,

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

    window.LawAIApp.KnowledgeGapEngine = KnowledgeGapEngine;

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            KnowledgeGapEngine.init();
            console.log('[KnowledgeGapEngine] ✅ Auto-initialized');
        } catch (err) {
            console.warn('[KnowledgeGapEngine] ⚠️ Auto-init failed:', err);
        }
    }, 1000);

    console.log('[KnowledgeGapEngine] ✅ Module loaded (v1.0.0)');

})();
