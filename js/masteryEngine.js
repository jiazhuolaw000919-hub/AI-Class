// ================================================================
// ENGINE: MasteryEngine
// LAYER: Core Logic Layer
// DOMAIN: Mastery & Competence Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 3.0.0 — Part 36 Mastery Foundation
// ================================================================
//
// DATA CANON COMPLIANCE
// ================================================================
//   - Schema Version: 3.0.0
//   - Migration Support: Yes
//   - Export/Import: Via StorageEngine
//   - Primary Key: knowledgeId
//
// MASTERY STATES (Part 36)
// ================================================================
//   UNASSESSED   → No meaningful evidence exists
//   EMERGING     → Limited successful evidence
//   DEVELOPING   → Meaningful evidence but not consistent
//   PROFICIENT   → Reliable performance across interactions
//   MASTERED     → Strong and repeated successful evidence
//   UNSTABLE     → Previously strong mastery has become unreliable
//
// MASTERY VS MEMORY
// ================================================================
//   MEMORY:   "How is this knowledge currently retained?"
//   MASTERY:  "How confidently can the learner perform this?"
//
// They are related but distinct.
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MasteryEngine = (function() {
    'use strict';

    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'MasteryEngine';
    var _engineVersion = '3.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Mastery & Competence Management';
    var _schemaVersion = '3.0.0';
    var _storageKey = 'mastery_data';
    var _initialized = false;
    var _masteryStore = {};

    // ============================================================
    // MASTERY STATE CONSTANTS
    // ============================================================
    var STATES = {
        UNASSESSED: 'UNASSESSED',
        EMERGING: 'EMERGING',
        DEVELOPING: 'DEVELOPING',
        PROFICIENT: 'PROFICIENT',
        MASTERED: 'MASTERED',
        UNSTABLE: 'UNSTABLE'
    };

    var STATE_ORDER = {
        UNASSESSED: 0,
        EMERGING: 1,
        DEVELOPING: 2,
        PROFICIENT: 3,
        MASTERED: 4,
        UNSTABLE: 5
    };

    var STATE_LABELS = {
        UNASSESSED: 'Not assessed',
        EMERGING: 'Emerging',
        DEVELOPING: 'Developing',
        PROFICIENT: 'Proficient',
        MASTERED: 'Mastered',
        UNSTABLE: 'Unstable'
    };

    // ============================================================
    // EVIDENCE TYPES
    // ============================================================
    var EVIDENCE_TYPES = {
        LESSON_COMPLETION: 'LESSON_COMPLETION',
        PRACTICE_SUCCESS: 'PRACTICE_SUCCESS',
        PRACTICE_FAILURE: 'PRACTICE_FAILURE',
        RECALL_SUCCESS: 'RECALL_SUCCESS',
        RECALL_FAILURE: 'RECALL_FAILURE',
        REVIEW_SUCCESS: 'REVIEW_SUCCESS',
        REVIEW_FAILURE: 'REVIEW_FAILURE'
    };

    // ============================================================
    // MASTERY POLICY (中央配置)
    // ============================================================
    var POLICY = {
        // 各证据类型的权重 (0-1)
        evidenceWeight: {
            LESSON_COMPLETION: 0.2,
            PRACTICE_SUCCESS: 0.4,
            PRACTICE_FAILURE: -0.3,
            RECALL_SUCCESS: 0.5,
            RECALL_FAILURE: -0.4,
            REVIEW_SUCCESS: 0.3,
            REVIEW_FAILURE: -0.2
        },
        // 状态转换阈值
        thresholds: {
            EMERGING: 0.2,
            DEVELOPING: 0.4,
            PROFICIENT: 0.65,
            MASTERED: 0.85
        },
        // 证据数量要求
        evidenceRequired: {
            EMERGING: 1,
            DEVELOPING: 2,
            PROFICIENT: 4,
            MASTERED: 6
        },
        // 衰减参数
        decayRate: 0.02, // 每天衰减
        unstableThreshold: 0.4 // 低于此值变为 UNSTABLE
    };

    // ============================================================
    // STORAGE
    // ============================================================
    function _getStore() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('[MasteryEngine] Schema version mismatch, migrating...');
                stored = _migrate(stored);
            }
            _masteryStore = { ..._masteryStore, ...stored };
            if (_masteryStore._schemaVersion) {
                delete _masteryStore._schemaVersion;
            }
            return _masteryStore;
        } catch (e) {
            return _masteryStore;
        }
    }

    function _saveStore(store) {
        _masteryStore = store;
        try {
            var toSave = { ...store };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    // ============================================================
    // MIGRATION
    // ============================================================
    function _migrate(stored) {
        console.log('[MasteryEngine] 🔄 Migrating from v' + (stored._schemaVersion || 'unknown') + ' to v' + _schemaVersion);
        var migrated = {};

        // 检查是否有旧格式 (Phase 23: skillName → { progress, confidence })
        for (var key in stored) {
            if (key === '_schemaVersion') continue;
            var entry = stored[key];

            // 旧格式: 以 skillName 为键，值有 progress/confidence
            if (typeof entry === 'object' && entry !== null && 'progress' in entry) {
                // 转换为新格式
                var knowledgeId = key;
                var progress = entry.progress || 0;
                var confidence = entry.confidence || 0;

                // 推断 masteryLevel
                var masteryLevel = progress / 100;
                var state = _inferStateFromLevel(masteryLevel, 0);

                migrated[key] = {
                    knowledgeId: knowledgeId,
                    masteryLevel: masteryLevel,
                    state: state,
                    confidence: confidence / 100,
                    evidenceCount: 0,
                    successfulEvidence: 0,
                    unsuccessfulEvidence: 0,
                    practiceAccuracy: 0,
                    recallAccuracy: 0,
                    lastEvidenceAt: entry.lastPracticed || null,
                    updatedAt: Date.now(),
                    createdAt: Date.now(),
                    evidenceHistory: [],
                    _migratedFrom: 'v2'
                };
            } else if (typeof entry === 'object' && entry !== null && 'knowledgeId' in entry) {
                // 已经是新格式，保留
                migrated[key] = entry;
            }
        }

        // 如果没有数据，至少保留空结构
        if (Object.keys(migrated).length === 0) {
            return { _schemaVersion: _schemaVersion };
        }

        migrated._schemaVersion = _schemaVersion;
        LawAIApp.StorageEngine?.set?.(_storageKey, migrated);
        console.log('[MasteryEngine] ✅ Migration complete, entries:', Object.keys(migrated).length - 1);
        return migrated;
    }

    function _inferStateFromLevel(level, evidenceCount) {
        if (level >= POLICY.thresholds.MASTERED && evidenceCount >= POLICY.evidenceRequired.MASTERED) {
            return STATES.MASTERED;
        }
        if (level >= POLICY.thresholds.PROFICIENT && evidenceCount >= POLICY.evidenceRequired.PROFICIENT) {
            return STATES.PROFICIENT;
        }
        if (level >= POLICY.thresholds.DEVELOPING && evidenceCount >= POLICY.evidenceRequired.DEVELOPING) {
            return STATES.DEVELOPING;
        }
        if (level >= POLICY.thresholds.EMERGING && evidenceCount >= POLICY.evidenceRequired.EMERGING) {
            return STATES.EMERGING;
        }
        return STATES.UNASSESSED;
    }

    // ============================================================
    // CORE: Get/Update Mastery
    // ============================================================

    /**
     * 获取 Mastery 记录
     * @param {string} knowledgeId
     * @returns {Object} Mastery 记录
     */
    function getMastery(knowledgeId) {
        if (!knowledgeId) return null;
        var store = _getStore();

        if (!store[knowledgeId]) {
            store[knowledgeId] = _createDefaultMastery(knowledgeId);
            _saveStore(store);
        }

        // 应用衰减
        var record = store[knowledgeId];
        record = _applyDecay(record);
        store[knowledgeId] = record;
        _saveStore(store);

        return record;
    }

    /**
     * 创建默认 Mastery 记录
     */
    function _createDefaultMastery(knowledgeId) {
        return {
            knowledgeId: knowledgeId,
            masteryLevel: 0,
            state: STATES.UNASSESSED,
            confidence: 0,
            evidenceCount: 0,
            successfulEvidence: 0,
            unsuccessfulEvidence: 0,
            practiceAccuracy: 0,
            recallAccuracy: 0,
            lastEvidenceAt: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            evidenceHistory: [],
            _schemaVersion: _schemaVersion
        };
    }

    /**
     * 应用时间衰减
     */
    function _applyDecay(record) {
        if (!record || !record.lastEvidenceAt) return record;

        var now = Date.now();
        var daysSinceLastEvidence = (now - record.lastEvidenceAt) / (24 * 60 * 60 * 1000);

        // 30天以上开始衰减
        if (daysSinceLastEvidence > 30) {
            var decayFactor = 1 - (daysSinceLastEvidence - 30) * POLICY.decayRate;
            decayFactor = Math.max(0.3, decayFactor);

            var oldLevel = record.masteryLevel || 0;
            var newLevel = oldLevel * decayFactor;

            // 如果衰减后低于阈值，可能变为 UNSTABLE
            if (newLevel < POLICY.unstableThreshold && record.state === STATES.MASTERED) {
                record.state = STATES.UNSTABLE;
            } else if (newLevel < POLICY.thresholds.PROFICIENT && record.state === STATES.PROFICIENT) {
                record.state = STATES.DEVELOPING;
            }

            record.masteryLevel = Math.max(0, Math.min(1, newLevel));
            record.updatedAt = now;
        }

        return record;
    }

    // ============================================================
    // CORE: Record Evidence
    // ============================================================

    /**
     * 记录证据（核心方法）
     * @param {Object} params
     * @param {string} params.knowledgeId
     * @param {string} params.evidenceType - EVIDENCE_TYPES 中的值
     * @param {*} params.result - true/false 或 score (0-1)
     * @param {Object} params.metadata - 额外元数据
     * @returns {Object} 更新后的 Mastery 记录
     */
    function recordEvidence(params) {
        var knowledgeId = params.knowledgeId;
        var evidenceType = params.evidenceType;
        var result = params.result;
        var metadata = params.metadata || {};

        if (!knowledgeId) {
            console.warn('[MasteryEngine] recordEvidence: knowledgeId is required');
            return null;
        }

        var store = _getStore();
        var record = store[knowledgeId];

        if (!record) {
            record = _createDefaultMastery(knowledgeId);
            store[knowledgeId] = record;
        }

        // 解析结果
        var isSuccess = false;
        var score = 0;

        if (typeof result === 'boolean') {
            isSuccess = result;
            score = isSuccess ? 1 : 0;
        } else if (typeof result === 'number') {
            score = Math.max(0, Math.min(1, result));
            isSuccess = score >= 0.6;
        } else if (typeof result === 'string') {
            isSuccess = result === 'success' || result === 'good' || result === 'excellent';
            score = isSuccess ? 1 : 0;
        }

        // 更新记录
        record.evidenceCount = (record.evidenceCount || 0) + 1;
        if (isSuccess) {
            record.successfulEvidence = (record.successfulEvidence || 0) + 1;
        } else {
            record.unsuccessfulEvidence = (record.unsuccessfulEvidence || 0) + 1;
        }
        record.lastEvidenceAt = Date.now();
        record.updatedAt = Date.now();

        // 更新准确率
        var total = record.successfulEvidence + record.unsuccessfulEvidence;
        var accuracy = total > 0 ? record.successfulEvidence / total : 0;

        if (evidenceType === EVIDENCE_TYPES.PRACTICE_SUCCESS || evidenceType === EVIDENCE_TYPES.PRACTICE_FAILURE) {
            record.practiceAccuracy = accuracy;
        }
        if (evidenceType === EVIDENCE_TYPES.RECALL_SUCCESS || evidenceType === EVIDENCE_TYPES.RECALL_FAILURE) {
            record.recallAccuracy = accuracy;
        }

        // 计算权重
        var weight = POLICY.evidenceWeight[evidenceType] || 0;
        if (!isSuccess && weight > 0) {
            weight = -weight * 0.5; // 失败惩罚减半
        }

        // 更新 masteryLevel
        var currentLevel = record.masteryLevel || 0;
        var targetLevel = isSuccess ? 1 : 0;
        var delta = (targetLevel - currentLevel) * weight * 0.5;
        record.masteryLevel = Math.max(0, Math.min(1, currentLevel + delta));

        // 更新 confidence (证据越多 confidence 越高)
        var confidenceBase = Math.min(1, record.evidenceCount / 20);
        var accuracyBonus = accuracy * 0.3;
        record.confidence = Math.min(1, confidenceBase + accuracyBonus);

        // 更新 state
        record.state = _determineState(record);

        // 保存证据历史 (保留最近 50 条)
        if (!record.evidenceHistory) {
            record.evidenceHistory = [];
        }
        record.evidenceHistory.push({
            type: evidenceType,
            success: isSuccess,
            score: score,
            timestamp: Date.now(),
            metadata: metadata
        });
        if (record.evidenceHistory.length > 50) {
            record.evidenceHistory = record.evidenceHistory.slice(-50);
        }

        store[knowledgeId] = record;
        _saveStore(store);

        // 触发事件
        _emit('MASTERY_UPDATED', {
            knowledgeId: knowledgeId,
            state: record.state,
            masteryLevel: record.masteryLevel,
            confidence: record.confidence,
            evidenceType: evidenceType
        });

        return record;
    }

    /**
     * 确定 Mastery State
     */
    function _determineState(record) {
        var level = record.masteryLevel || 0;
        var evidenceCount = record.evidenceCount || 0;
        var accuracy = record.successfulEvidence / Math.max(1, evidenceCount);

        // 如果证据不足，返回 UNASSESSED
        if (evidenceCount === 0) {
            return STATES.UNASSESSED;
        }

        // 如果之前是 MASTERED 但 level 下降了
        if (record.state === STATES.MASTERED && level < POLICY.thresholds.PROFICIENT) {
            return STATES.UNSTABLE;
        }

        // 如果之前是 PROFICIENT 但 level 下降了
        if (record.state === STATES.PROFICIENT && level < POLICY.thresholds.DEVELOPING) {
            return STATES.DEVELOPING;
        }

        // 正常状态转换
        if (level >= POLICY.thresholds.MASTERED && evidenceCount >= POLICY.evidenceRequired.MASTERED && accuracy >= 0.8) {
            return STATES.MASTERED;
        }
        if (level >= POLICY.thresholds.PROFICIENT && evidenceCount >= POLICY.evidenceRequired.PROFICIENT && accuracy >= 0.7) {
            return STATES.PROFICIENT;
        }
        if (level >= POLICY.thresholds.DEVELOPING && evidenceCount >= POLICY.evidenceRequired.DEVELOPING && accuracy >= 0.6) {
            return STATES.DEVELOPING;
        }
        if (level >= POLICY.thresholds.EMERGING && evidenceCount >= POLICY.evidenceRequired.EMERGING) {
            return STATES.EMERGING;
        }

        return STATES.UNASSESSED;
    }

    // ============================================================
    // PUBLIC: Convenience Methods
    // ============================================================

    /**
     * 获取 Mastery State
     */
    function getMasteryState(knowledgeId) {
        var record = getMastery(knowledgeId);
        return record ? record.state : STATES.UNASSESSED;
    }

    /**
     * 获取 Mastery Level (0-1)
     */
    function getMasteryLevel(knowledgeId) {
        var record = getMastery(knowledgeId);
        return record ? record.masteryLevel || 0 : 0;
    }

    /**
     * 获取 Confidence (0-1)
     */
    function getConfidence(knowledgeId) {
        var record = getMastery(knowledgeId);
        return record ? record.confidence || 0 : 0;
    }

    /**
     * 获取所有 Mastery 记录
     */
    function getAllMastery() {
        var store = _getStore();
        var result = [];
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            result.push(store[key]);
        }
        return result;
    }

    /**
     * 获取所有知识点的状态分布
     */
    function getMasteryDistribution() {
        var records = getAllMastery();
        var distribution = {};
        for (var state in STATES) {
            distribution[state] = 0;
        }
        for (var i = 0; i < records.length; i++) {
            var state = records[i].state || STATES.UNASSESSED;
            distribution[state] = (distribution[state] || 0) + 1;
        }
        return distribution;
    }

    /**
     * 获取需要复习的知识点
     * @param {number} minLevel - 最低 mastery 阈值
     * @returns {Array} 需要复习的知识点列表
     */
    function getReviewNeeded(minLevel) {
        minLevel = minLevel || 0.5;
        var records = getAllMastery();
        var needed = [];

        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (!record || !record.knowledgeId) continue;

            // 需要复习的条件：
            // 1. 状态是 UNSTABLE
            // 2. 或者 masteryLevel 低于阈值
            // 3. 或者很久没有证据 (超过 14 天)
            if (record.state === STATES.UNSTABLE) {
                needed.push(record);
            } else if (record.masteryLevel < minLevel && record.evidenceCount > 0) {
                needed.push(record);
            } else if (record.lastEvidenceAt) {
                var daysSince = (Date.now() - record.lastEvidenceAt) / (24 * 60 * 60 * 1000);
                if (daysSince > 14 && record.masteryLevel < 0.7) {
                    needed.push(record);
                }
            }
        }

        // 按 masteryLevel 升序排序 (最弱的优先)
        needed.sort(function(a, b) {
            return (a.masteryLevel || 0) - (b.masteryLevel || 0);
        });

        return needed;
    }

    // ============================================================
    // PUBLIC: Aggregation
    // ============================================================

    /**
     * 计算 Lesson 的聚合 Mastery (基于该 Lesson 下的所有 Knowledge)
     */
    function getLessonMastery(lessonId, knowledgeIds) {
        if (!lessonId || !knowledgeIds || knowledgeIds.length === 0) {
            return { lessonId: lessonId, masteryLevel: 0, state: STATES.UNASSESSED, confidence: 0 };
        }

        var totalLevel = 0;
        var totalConfidence = 0;
        var totalWeight = 0;
        var states = [];

        for (var i = 0; i < knowledgeIds.length; i++) {
            var record = getMastery(knowledgeIds[i]);
            if (record) {
                var weight = record.confidence || 0.5;
                totalLevel += (record.masteryLevel || 0) * weight;
                totalConfidence += record.confidence || 0;
                totalWeight += weight;
                states.push(record.state);
            }
        }

        if (totalWeight === 0) {
            return { lessonId: lessonId, masteryLevel: 0, state: STATES.UNASSESSED, confidence: 0 };
        }

        var avgLevel = totalLevel / totalWeight;
        var avgConfidence = totalConfidence / knowledgeIds.length;

        // 取最差的状态作为 lesson 状态
        var worstState = STATES.MASTERED;
        for (var j = 0; j < states.length; j++) {
            if (STATE_ORDER[states[j]] < STATE_ORDER[worstState]) {
                worstState = states[j];
            }
        }

        return {
            lessonId: lessonId,
            masteryLevel: Math.min(1, avgLevel),
            state: worstState,
            confidence: Math.min(1, avgConfidence)
        };
    }

    /**
     * 计算 Subject 的聚合 Mastery
     */
    function getSubjectMastery(subjectId, lessonMasteries) {
        if (!subjectId || !lessonMasteries || lessonMasteries.length === 0) {
            return { subjectId: subjectId, masteryLevel: 0, state: STATES.UNASSESSED };
        }

        var total = 0;
        for (var i = 0; i < lessonMasteries.length; i++) {
            total += lessonMasteries[i].masteryLevel || 0;
        }
        var avg = total / lessonMasteries.length;

        var states = lessonMasteries.map(function(l) { return l.state; });
        var worstState = STATES.MASTERED;
        for (var j = 0; j < states.length; j++) {
            if (STATE_ORDER[states[j]] < STATE_ORDER[worstState]) {
                worstState = states[j];
            }
        }

        return {
            subjectId: subjectId,
            masteryLevel: Math.min(1, avg),
            state: worstState
        };
    }

    /**
     * 计算 Course 的聚合 Mastery
     */
    function getCourseMastery(courseId, subjectMasteries) {
        if (!courseId || !subjectMasteries || subjectMasteries.length === 0) {
            return { courseId: courseId, masteryLevel: 0, state: STATES.UNASSESSED };
        }

        var total = 0;
        for (var i = 0; i < subjectMasteries.length; i++) {
            total += subjectMasteries[i].masteryLevel || 0;
        }
        var avg = total / subjectMasteries.length;

        var states = subjectMasteries.map(function(s) { return s.state; });
        var worstState = STATES.MASTERED;
        for (var j = 0; j < states.length; j++) {
            if (STATE_ORDER[states[j]] < STATE_ORDER[worstState]) {
                worstState = states[j];
            }
        }

        return {
            courseId: courseId,
            masteryLevel: Math.min(1, avg),
            state: worstState
        };
    }

    // ============================================================
    // PUBLIC: Legacy API (保持向后兼容)
    // ============================================================

    /**
     * 更新技能掌握度 (Legacy API)
     */
    function updateSkill(skillName, progressDelta, confidenceDelta) {
        progressDelta = progressDelta || 0;
        confidenceDelta = confidenceDelta || 0;

        var store = _getStore();
        if (!store[skillName]) {
            store[skillName] = _createDefaultMastery(skillName);
        }

        var skill = store[skillName];
        var progress = skill.masteryLevel || 0;
        var newProgress = Math.min(1, Math.max(0, progress + progressDelta / 100));

        var confidence = skill.confidence || 0;
        var newConfidence = Math.min(1, Math.max(0, confidence + confidenceDelta / 100));

        skill.masteryLevel = newProgress;
        skill.confidence = newConfidence;
        skill.lastEvidenceAt = Date.now();
        skill.updatedAt = Date.now();
        skill.state = _determineState(skill);

        store[skillName] = skill;
        _saveStore(store);

        _emit('MasteryUpdated', { skill: skillName, progress: newProgress * 100 });

        return true;
    }

    /**
     * 获取技能 (Legacy API)
     */
    function getSkill(skillName) {
        var record = getMastery(skillName);
        if (!record) return { progress: 0, confidence: 0 };

        return {
            progress: (record.masteryLevel || 0) * 100,
            confidence: (record.confidence || 0) * 100,
            state: record.state,
            lastPracticed: record.lastEvidenceAt
        };
    }

    /**
     * 获取所有技能 (Legacy API)
     */
    function getAllSkills() {
        var store = _getStore();
        var result = [];
        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var record = store[key];
            result.push({
                name: key,
                progress: (record.masteryLevel || 0) * 100,
                confidence: (record.confidence || 0) * 100,
                state: record.state,
                lastPracticed: record.lastEvidenceAt
            });
        }
        return result;
    }

    /**
     * 获取掌握度级别名称 (Legacy API)
     */
    function getLevelName(mastery) {
        if (mastery >= 95) return 'Master';
        if (mastery >= 80) return 'Expert';
        if (mastery >= 60) return 'Advanced';
        if (mastery >= 40) return 'Practitioner';
        if (mastery >= 20) return 'Learner';
        return 'Beginner';
    }

    /**
     * 计算整体掌握度 (Legacy API)
     */
    function calculateOverallMastery() {
        var skills = getAllSkills();
        if (skills.length === 0) return { overall: 0, level: 'Beginner' };

        var avg = skills.reduce(function(sum, s) {
            return sum + (s.progress || 0);
        }, 0) / skills.length;

        return { overall: Math.round(avg), level: getLevelName(avg) };
    }

    /**
     * 获取最弱的技能 (Legacy API)
     */
    function getWeakestSkills(limit) {
        limit = limit || 3;
        return getAllSkills()
            .sort(function(a, b) { return (a.progress || 0) - (b.progress || 0); })
            .slice(0, limit);
    }

    // ============================================================
    // PUBLIC: Reset / Export / Import
    // ============================================================

    function reset() {
        _masteryStore = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('[MasteryEngine] Reset complete');
        } catch (e) {}
    }

    function exportData() {
        return _getStore();
    }

    function importData(data) {
        if (data && typeof data === 'object') {
            _saveStore(data);
            console.log('[MasteryEngine] Import complete');
            return true;
        }
        return false;
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

        var distribution = getMasteryDistribution();

        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            schemaVersion: _schemaVersion,
            totalRecords: records.length,
            distribution: distribution,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[MasteryEngine] Already initialized');
            return;
        }

        console.log('[MasteryEngine] 🚀 Initializing v' + _engineVersion + '...');

        try {
            // 加载并迁移数据
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            _getStore(); // 触发迁移

            // ============================================================
            // Part 36: 事件集成
            // ============================================================

            var eventBus = LawAIApp.EventBus || window.EventBus;

            // 1. LessonCompleted → 低权重证据
            if (eventBus && typeof eventBus.on === 'function') {
                eventBus.on('LessonCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    if (lessonId) {
                        // Lesson 完成 → EMERGING 证据
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: EVIDENCE_TYPES.LESSON_COMPLETION,
                            result: true,
                            metadata: { source: 'LessonCompleted', xpGain: data.xpGain }
                        });
                        console.log('[MasteryEngine] 📝 Lesson evidence recorded:', lessonId);
                    }
                });
                console.log('[MasteryEngine] ✅ Listening to LessonCompleted');

                // 2. PracticeCompleted → 高权重证据
                eventBus.on('PracticeCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    var score = data && data.score ? data.score : (data && data.accuracy ? data.accuracy : 0.7);
                    if (lessonId) {
                        var isSuccess = score >= 0.6;
                        var evidenceType = isSuccess ? EVIDENCE_TYPES.PRACTICE_SUCCESS : EVIDENCE_TYPES.PRACTICE_FAILURE;
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: evidenceType,
                            result: score,
                            metadata: { source: 'PracticeCompleted', score: score }
                        });
                        console.log('[MasteryEngine] ✍️ Practice evidence recorded:', lessonId, score);
                    }
                });
                console.log('[MasteryEngine] ✅ Listening to PracticeCompleted');

                // 3. RecallCompleted → 强权重证据
                eventBus.on('RecallCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    var score = data && data.newStrength ? data.newStrength / 100 : 0.7;
                    if (lessonId) {
                        var isSuccess = score >= 0.6;
                        var evidenceType = isSuccess ? EVIDENCE_TYPES.RECALL_SUCCESS : EVIDENCE_TYPES.RECALL_FAILURE;
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: evidenceType,
                            result: score,
                            metadata: { source: 'RecallCompleted', newStrength: data.newStrength }
                        });
                        console.log('[MasteryEngine] 🧠 Recall evidence recorded:', lessonId, score);
                    }
                });
                console.log('[MasteryEngine] ✅ Listening to RecallCompleted');

                // 4. ReviewCompleted → 中等权重证据
                eventBus.on('ReviewCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    var performance = data && data.performance ? data.performance : 0.7;
                    if (lessonId) {
                        var isSuccess = performance >= 0.6;
                        var evidenceType = isSuccess ? EVIDENCE_TYPES.REVIEW_SUCCESS : EVIDENCE_TYPES.REVIEW_FAILURE;
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: evidenceType,
                            result: performance,
                            metadata: { source: 'ReviewCompleted', performance: performance }
                        });
                        console.log('[MasteryEngine] 🔄 Review evidence recorded:', lessonId, performance);
                    }
                });
                console.log('[MasteryEngine] ✅ Listening to ReviewCompleted');

            } else {
                console.warn('[MasteryEngine] EventBus not available, using fallback events');

                // Fallback: 使用 DOM 事件
                document.addEventListener('LessonCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    if (lessonId) {
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: EVIDENCE_TYPES.LESSON_COMPLETION,
                            result: true,
                            metadata: { source: 'LessonCompleted' }
                        });
                    }
                });
                document.addEventListener('PracticeCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    var score = data.score || data.accuracy || 0.7;
                    if (lessonId) {
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: score >= 0.6 ? EVIDENCE_TYPES.PRACTICE_SUCCESS : EVIDENCE_TYPES.PRACTICE_FAILURE,
                            result: score,
                            metadata: { source: 'PracticeCompleted' }
                        });
                    }
                });
                document.addEventListener('RecallCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    var score = data.newStrength ? data.newStrength / 100 : 0.7;
                    if (lessonId) {
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: score >= 0.6 ? EVIDENCE_TYPES.RECALL_SUCCESS : EVIDENCE_TYPES.RECALL_FAILURE,
                            result: score,
                            metadata: { source: 'RecallCompleted' }
                        });
                    }
                });
                document.addEventListener('ReviewCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    var performance = data.performance || 0.7;
                    if (lessonId) {
                        recordEvidence({
                            knowledgeId: lessonId,
                            evidenceType: performance >= 0.6 ? EVIDENCE_TYPES.REVIEW_SUCCESS : EVIDENCE_TYPES.REVIEW_FAILURE,
                            result: performance,
                            metadata: { source: 'ReviewCompleted' }
                        });
                    }
                });
            }

            _initialized = true;
            console.log('[MasteryEngine] ✅ Initialized successfully, records:', Object.keys(_getStore()).length);

        } catch (error) {
            console.error('[MasteryEngine] ❌ Init failed:', error);
            _initialized = false;
        }
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
    // PUBLIC API
    // ============================================================

    return {
        // Initialization
        init: init,

        // Core
        getMastery: getMastery,
        getMasteryState: getMasteryState,
        getMasteryLevel: getMasteryLevel,
        getConfidence: getConfidence,
        getAllMastery: getAllMastery,
        getMasteryDistribution: getMasteryDistribution,
        getReviewNeeded: getReviewNeeded,

        // Evidence
        recordEvidence: recordEvidence,

        // Aggregation
        getLessonMastery: getLessonMastery,
        getSubjectMastery: getSubjectMastery,
        getCourseMastery: getCourseMastery,

        // Legacy API (向后兼容)
        updateSkill: updateSkill,
        getSkill: getSkill,
        getAllSkills: getAllSkills,
        getLevelName: getLevelName,
        calculateOverallMastery: calculateOverallMastery,
        getWeakestSkills: getWeakestSkills,

        // Reset / Export / Import
        reset: reset,
        exportData: exportData,
        importData: importData,

        // Status
        getStatus: getStatus,

        // Constants
        STATES: STATES,
        EVIDENCE_TYPES: EVIDENCE_TYPES,
        POLICY: POLICY
    };

})();

console.log('[MasteryEngine] ✅ Module loaded (v3.0.0)');

// 自动初始化
setTimeout(function() {
    try {
        if (LawAIApp.MasteryEngine && typeof LawAIApp.MasteryEngine.init === 'function') {
            LawAIApp.MasteryEngine.init();
            console.log('[MasteryEngine] ✅ Auto-initialized');
        }
    } catch (err) {
        console.warn('[MasteryEngine] ⚠️ Auto-init failed:', err);
    }
}, 500);
