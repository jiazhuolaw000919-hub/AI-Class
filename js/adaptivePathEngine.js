// ============================================================
// ENGINE: AdaptivePathEngine
// LAYER: Intelligence Layer
// DOMAIN: Adaptive Path Generation
// VERSION: 2.0.0 — Part 44 Adaptive Path Engine Foundation
// ============================================================
//
// PURPOSE
// ============================================================
//   Generate valid, explainable, deterministic learning paths
//   toward a target knowledge node.
//
// PATH STATUS
// ============================================================
//   DRAFT       → Generated but not committed
//   VALID       → Satisfies all structural constraints
//   ACTIVE      → Learner is following this path
//   COMPLETED   → All objectives complete
//   PAUSED      → Temporarily stopped
//   STALE       → Underlying state changed
//   INVALID     → Violates structural constraints
//   FAILED      → Generation failed safely
//
// ============================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.AdaptivePathEngine && window.LawAIApp.AdaptivePathEngine._upgraded) {
        console.log('[AdaptivePathEngine] Already upgraded, skipping...');
        return;
    }

    var _initialized = false;
    var _version = '2.0.0';

    // ============================================================
    // PATH STATUS CONSTANTS
    // ============================================================
    var PATH_STATUS = {
        DRAFT: 'DRAFT',
        VALID: 'VALID',
        ACTIVE: 'ACTIVE',
        COMPLETED: 'COMPLETED',
        PAUSED: 'PAUSED',
        STALE: 'STALE',
        INVALID: 'INVALID',
        FAILED: 'FAILED'
    };

    var NODE_STATES = {
        START: 'START',
        ELIGIBLE: 'ELIGIBLE',
        IN_PROGRESS: 'IN_PROGRESS',
        COMPLETED: 'COMPLETED',
        MASTERED: 'MASTERED',
        BLOCKED: 'BLOCKED',
        SKIPPED: 'SKIPPED',
        UNAVAILABLE: 'UNAVAILABLE',
        UNKNOWN: 'UNKNOWN'
    };

    // ============================================================
    // CORE: Generate Adaptive Path
    // ============================================================

    /**
     * 生成自适应学习路径
     * @param {string} targetId - 目标知识节点 ID
     * @param {Object} context - 自适应上下文 (来自 Part 43)
     * @param {Object} options - 配置选项
     * @returns {Object} 路径对象
     */
    function generateAdaptivePath(targetId, context, options) {
        options = options || {};
        context = context || _getDefaultContext();

        var result = {
            pathId: 'path_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            learnerId: context.learnerId || 'default-learner',
            targetId: targetId,
            nodes: [],
            transitions: [],
            status: 'DRAFT',
            generatedAt: Date.now(),
            contextVersion: context.contextVersion || '1.0.0',
            graphVersion: '1.0.0',
            policyVersion: '1.0.0',
            explanation: [],
            constraints: options.constraints || {},
            diagnostics: {},
            errors: []
        };

        // 1. 验证目标
        var kg = window.LawAIApp.KnowledgeGraph;
        if (!kg) {
            result.status = 'FAILED';
            result.errors.push({ code: 'GRAPH_UNAVAILABLE', message: 'Knowledge Graph not available' });
            return result;
        }

        var targetNode = kg.getNode(targetId);
        if (!targetNode) {
            result.status = 'FAILED';
            result.errors.push({ code: 'TARGET_NOT_FOUND', message: 'Target not found: ' + targetId });
            return result;
        }

        if (targetNode.status === 'deprecated') {
            result.status = 'FAILED';
            result.errors.push({ code: 'TARGET_DEPRECATED', message: 'Target is deprecated' });
            return result;
        }

        // 2. 检查是否已掌握
        var lm = window.LawAIApp.LearnerModel;
        var isMastered = false;
        if (lm && typeof lm.getKnowledgeState === 'function') {
            var state = lm.getKnowledgeState(targetId);
            if (state && state.mastery && state.mastery.level >= 0.85) {
                isMastered = true;
            }
        }

        if (isMastered) {
            result.status = 'COMPLETED';
            result.explanation.push({
                nodeId: targetId,
                reason: 'ALREADY_SATISFIED',
                message: 'Target already mastered'
            });
            return result;
        }

        // 3. 获取前置条件链
        var chain = kg.getPrerequisiteChain ? kg.getPrerequisiteChain(targetId) : [];
        var allPrereqs = chain.filter(function(node) {
            return node && node.id !== targetId;
        });

        // 4. 检查每个前置条件的掌握度
        var neededNodes = [];
        var satisfiedNodes = [];
        var unknownNodes = [];
        var unavailableNodes = [];

        for (var i = 0; i < allPrereqs.length; i++) {
            var prereq = allPrereqs[i];
            if (!prereq) continue;

            if (prereq.status === 'deprecated') {
                unavailableNodes.push(prereq.id);
                continue;
            }

            var mastery = 0;
            var isSatisfied = false;
            if (lm && typeof lm.getKnowledgeState === 'function') {
                var state = lm.getKnowledgeState(prereq.id);
                if (state && state.mastery) {
                    mastery = state.mastery.level || 0;
                    isSatisfied = mastery >= 0.6;
                } else {
                    unknownNodes.push(prereq.id);
                    continue;
                }
            } else {
                unknownNodes.push(prereq.id);
                continue;
            }

            if (isSatisfied) {
                satisfiedNodes.push(prereq.id);
            } else {
                neededNodes.push(prereq.id);
            }
        }

        // 5. 如果有未知节点
        if (unknownNodes.length > 0) {
            result.status = 'UNKNOWN';
            result.diagnostics.unknownNodes = unknownNodes;
            result.errors.push({
                code: 'UNKNOWN_LEARNER_STATE',
                message: 'Unknown mastery for prerequisites: ' + unknownNodes.join(', ')
            });
            return result;
        }

        // 6. 如果有不可用节点
        if (unavailableNodes.length > 0) {
            result.status = 'FAILED';
            result.diagnostics.unavailableNodes = unavailableNodes;
            result.errors.push({
                code: 'UNAVAILABLE_PREREQUISITE',
                message: 'Prerequisites unavailable: ' + unavailableNodes.join(', ')
            });
            return result;
        }

        // 7. 如果所有前置条件都已满足
        if (neededNodes.length === 0) {
            result.nodes.push({
                knowledgeId: targetId,
                position: 0,
                state: 'ELIGIBLE',
                readiness: 'READY',
                reasons: ['TARGET', 'PREREQUISITES_SATISFIED'],
                prerequisites: satisfiedNodes,
                estimatedEffort: null,
                mode: 'LEARN'
            });
            result.status = 'VALID';
            result.explanation.push({
                nodeId: targetId,
                reason: 'TARGET',
                message: 'All prerequisites satisfied'
            });
            result.diagnostics.satisfiedPrerequisites = satisfiedNodes;
            return result;
        }

        // 8. 构建路径节点
        var candidates = window.LawAIApp.AdaptiveLearning?.getAdaptiveCandidates?.(context) || {};
        var eligibleIds = {};
        if (candidates && candidates.eligible) {
            for (var i = 0; i < candidates.eligible.length; i++) {
                var c = candidates.eligible[i];
                if (c && c.targetId) {
                    eligibleIds[c.targetId] = c;
                }
            }
        }

        var orderedNodes = _topologicalSort(neededNodes, targetId, kg);

        var position = 0;
        var visited = {};

        for (var i = 0; i < orderedNodes.length; i++) {
            var nodeId = orderedNodes[i];
            if (visited[nodeId]) continue;
            visited[nodeId] = true;

            var node = kg.getNode(nodeId);
            if (!node) continue;

            var reasonCodes = ['PREREQUISITE'];
            var readiness = 'NOT_READY';
            var state = 'BLOCKED';

            if (eligibleIds[nodeId]) {
                state = 'ELIGIBLE';
                readiness = 'READY';
                reasonCodes.push('PREREQUISITES_SATISFIED');
            }

            var pe = window.LawAIApp.PrerequisiteEngine;
            var readinessResult = pe && typeof pe.evaluateReadiness === 'function' ?
                pe.evaluateReadiness(nodeId, lm) : null;

            if (readinessResult && readinessResult.status === 'READY') {
                state = 'ELIGIBLE';
                readiness = 'READY';
                reasonCodes.push('READY_TARGET');
            } else if (readinessResult && readinessResult.status === 'NEAR_READY') {
                state = 'ELIGIBLE';
                readiness = 'NEAR_READY';
                reasonCodes.push('NEAR_READY');
            }

            result.nodes.push({
                knowledgeId: nodeId,
                position: position,
                state: state,
                readiness: readiness,
                reasons: reasonCodes,
                prerequisites: [],
                estimatedEffort: null,
                mode: 'LEARN'
            });

            position++;
        }

        // 9. 添加目标节点
        result.nodes.push({
            knowledgeId: targetId,
            position: position,
            state: 'ELIGIBLE',
            readiness: 'READY',
            reasons: ['TARGET'],
            prerequisites: neededNodes,
            estimatedEffort: null,
            mode: 'LEARN'
        });

        // 10. 构建路径转换
        for (var i = 0; i < result.nodes.length - 1; i++) {
            result.transitions.push({
                from: result.nodes[i].knowledgeId,
                to: result.nodes[i + 1].knowledgeId,
                relation: 'PREREQUISITE',
                valid: true,
                explanation: 'Prerequisite ordering'
            });
        }

        result.status = 'VALID';
        result.diagnostics.satisfiedPrerequisites = satisfiedNodes;
        result.diagnostics.neededPrerequisites = neededNodes;
        result.diagnostics.pathLength = result.nodes.length;

        result.explanation.push({
            nodeId: targetId,
            reason: 'TARGET',
            message: 'Target requires ' + neededNodes.length + ' prerequisite(s)'
        });
        for (var i = 0; i < neededNodes.length; i++) {
            var node = kg.getNode(neededNodes[i]);
            if (node) {
                result.explanation.push({
                    nodeId: neededNodes[i],
                    reason: 'PREREQUISITE',
                    message: 'Required for: ' + targetId
                });
            }
        }
        if (satisfiedNodes.length > 0) {
            result.explanation.push({
                nodeId: null,
                reason: 'SATISFIED_PREREQUISITE',
                message: satisfiedNodes.length + ' prerequisite(s) already mastered and omitted'
            });
        }

        return result;
    }

    // ============================================================
    // CORE: Validate Path
    // ============================================================

    function validateAdaptivePath(path) {
        if (!path) {
            return { valid: false, errors: ['Path is null or undefined'] };
        }

        var errors = [];
        var warnings = [];

        if (!path.nodes || path.nodes.length === 0) {
            errors.push('Path has no nodes');
            return { valid: false, errors: errors };
        }

        var hasTarget = false;
        for (var i = 0; i < path.nodes.length; i++) {
            if (path.nodes[i].knowledgeId === path.targetId) {
                hasTarget = true;
                break;
            }
        }
        if (!hasTarget) {
            errors.push('Target not found in path nodes');
        }

        var seen = {};
        for (var i = 0; i < path.nodes.length; i++) {
            var id = path.nodes[i].knowledgeId;
            if (seen[id]) {
                warnings.push('Duplicate node: ' + id);
            }
            seen[id] = true;
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            nodeCount: path.nodes.length,
            targetIncluded: hasTarget
        };
    }

    // ============================================================
    // CORE: Replan Path
    // ============================================================

    function replanAdaptivePath(existingPath, context, options) {
        if (!existingPath || !existingPath.targetId) {
            return { success: false, message: 'No valid existing path' };
        }

        var newPath = generateAdaptivePath(existingPath.targetId, context, options);
        newPath.pathId = 'replan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        newPath.previousPathId = existingPath.pathId;
        newPath.status = 'DRAFT';

        return {
            success: true,
            path: newPath,
            previousPathId: existingPath.pathId
        };
    }

    // ============================================================
    // CORE: Path Status
    // ============================================================

    function getPathStatus(path) {
        if (!path) return 'UNAVAILABLE';
        return path.status || 'UNKNOWN';
    }

    function isPathStale(path, context) {
        if (!path || !context) return true;

        if (path.contextVersion !== context.contextVersion) {
            return true;
        }

        var age = Date.now() - (path.generatedAt || 0);
        if (age > 24 * 60 * 60 * 1000) {
            return true;
        }

        return false;
    }

    // ============================================================
    // HELPERS
    // ============================================================

    function _getDefaultContext() {
        var context = {};
        try {
            var al = window.LawAIApp.AdaptiveLearning;
            if (al && typeof al.buildAdaptiveContext === 'function') {
                context = al.buildAdaptiveContext() || {};
            }
        } catch (e) {
            // 使用默认值
        }
        if (!context.learnerId) {
            context.learnerId = 'default-learner';
        }
        if (!context.contextVersion) {
            context.contextVersion = '1.0.0';
        }
        return context;
    }

    function _topologicalSort(nodeIds, targetId, kg) {
        var visited = {};
        var order = [];
        var temp = {};

        function visit(id) {
            if (temp[id]) {
                console.warn('[AdaptivePathEngine] Cycle detected in prerequisites');
                return;
            }
            if (visited[id]) return;

            temp[id] = true;

            var node = kg.getNode(id);
            if (node) {
                var prereqs = kg.getPrerequisites ? kg.getPrerequisites(id) : [];
                for (var i = 0; i < prereqs.length; i++) {
                    var prereq = prereqs[i];
                    if (prereq && prereq.id && nodeIds.indexOf(prereq.id) !== -1) {
                        visit(prereq.id);
                    }
                }
            }

            visited[id] = true;
            delete temp[id];
            order.push(id);
        }

        for (var i = 0; i < nodeIds.length; i++) {
            if (!visited[nodeIds[i]]) {
                visit(nodeIds[i]);
            }
        }

        return order;
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[AdaptivePathEngine] Already initialized');
            return;
        }

        console.log('[AdaptivePathEngine] 🚀 Initializing v' + _version + '...');

        try {
            var kg = window.LawAIApp.KnowledgeGraph;
            var lm = window.LawAIApp.LearnerModel;
            var al = window.LawAIApp.AdaptiveLearning;

            if (!kg) console.warn('[AdaptivePathEngine] ⚠️ Knowledge Graph not available');
            if (!lm) console.warn('[AdaptivePathEngine] ⚠️ Learner Model not available');
            if (!al) console.warn('[AdaptivePathEngine] ⚠️ Adaptive Learning not available');

            _initialized = true;
            console.log('[AdaptivePathEngine] ✅ Initialized');
        } catch (e) {
            console.error('[AdaptivePathEngine] ❌ Init failed:', e);
            _initialized = false;
        }
    }

    // ============================================================
    // STATUS
    // ============================================================

    function getStatus() {
        var kg = window.LawAIApp.KnowledgeGraph;
        var lm = window.LawAIApp.LearnerModel;
        var al = window.LawAIApp.AdaptiveLearning;

        return {
            version: _version,
            initialized: _initialized,
            graphAvailable: !!kg,
            learnerModelAvailable: !!lm,
            adaptiveLearningAvailable: !!al,
            pathStatus: PATH_STATUS,
            nodeStates: NODE_STATES
        };
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    var AdaptivePathEngine = {
        _upgraded: true,
        _version: _version,

        // Constants
        PATH_STATUS: PATH_STATUS,
        NODE_STATES: NODE_STATES,

        // Lifecycle
        init: init,
        getStatus: getStatus,

        // Core
        generateAdaptivePath: generateAdaptivePath,
        validateAdaptivePath: validateAdaptivePath,
        replanAdaptivePath: replanAdaptivePath,
        getPathStatus: getPathStatus,
        isPathStale: isPathStale,

        // Legacy API (向后兼容)
        getNextLesson: function(userId) {
            console.warn('[AdaptivePathEngine] getNextLesson is deprecated. Use generateAdaptivePath instead.');
            return null;
        },
        suggestDifficulty: function(userId) {
            console.warn('[AdaptivePathEngine] suggestDifficulty is deprecated. Use Learner Model instead.');
            return 'beginner';
        }
    };

    // ============================================================
    // EXPORT
    // ============================================================

    window.LawAIApp.AdaptivePathEngine = AdaptivePathEngine;

    // ============================================================
    // AUTO-INIT
    // ============================================================

    setTimeout(function() {
        try {
            AdaptivePathEngine.init();
            console.log('[AdaptivePathEngine] ✅ Auto-initialized');
        } catch (err) {
            console.warn('[AdaptivePathEngine] ⚠️ Auto-init failed:', err);
        }
    }, 1100);

    console.log('[AdaptivePathEngine] ✅ Module loaded (v2.0.0)');

})();
