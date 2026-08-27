// ================================================================
// ENGINE: MemoryReview
// LAYER: Core Logic Layer
// DOMAIN: Review Execution & Management
// VERSION: 2.0.0 — Part 37 Review Foundation
// ================================================================
//
// PURPOSE
// ================================================================
//   Execute review sessions for knowledge items.
//   Manage review state and history.
//   Integrate with Memory and Mastery engines.
//
// REVIEW STATES (Part 37)
// ================================================================
//   NOT_READY   → No review scheduled yet
//   SCHEDULED   → Future review exists
//   DUE         → Review time has arrived
//   IN_REVIEW   → Currently reviewing
//   COMPLETED   → Review completed successfully
//   OVERDUE     → Review passed due without completion
//   SUSPENDED   → Review temporarily disabled
//
// ================================================================

(function() {
    'use strict';

    window.LawAIApp = window.LawAIApp || {};

    if (window.LawAIApp.MemoryReview && window.LawAIApp.MemoryReview._upgraded) {
        console.log('[MemoryReview] Already upgraded, skipping...');
        return;
    }

    // ============================================================
    // REVIEW STATE CONSTANTS
    // ============================================================
    var STATES = {
        NOT_READY: 'NOT_READY',
        SCHEDULED: 'SCHEDULED',
        DUE: 'DUE',
        IN_REVIEW: 'IN_REVIEW',
        COMPLETED: 'COMPLETED',
        OVERDUE: 'OVERDUE',
        SUSPENDED: 'SUSPENDED'
    };

    var STATE_LABELS = {
        NOT_READY: 'Not ready',
        SCHEDULED: 'Scheduled',
        DUE: 'Due',
        IN_REVIEW: 'In review',
        COMPLETED: 'Completed',
        OVERDUE: 'Overdue',
        SUSPENDED: 'Suspended'
    };

    // ============================================================
    // REVIEW POLICY (中央配置)
    // ============================================================
    var POLICY = {
        // 初始间隔（天）
        initialInterval: 1,
        // 成功后的间隔倍数
        successMultiplier: 2,
        // 失败后的间隔倍数
        failureMultiplier: 0.5,
        // 最大间隔（天）
        maxInterval: 60,
        // 最小间隔（天）
        minInterval: 0.5,
        // 逾期阈值（天）
        overdueThreshold: 2,
        // 是否需要评估（不通过 MemoryEngine 直接运行）
        requireMemoryCheck: true,
        // 基于 mastery 的间隔调整
        masteryBoost: {
            EMERGING: 0.5,
            DEVELOPING: 0.8,
            PROFICIENT: 1.2,
            MASTERED: 1.5
        }
    };

    // ============================================================
    // STORAGE
    // ============================================================
    var _storageKey = 'review_records';
    var _schemaVersion = '2.0.0';
    var _reviews = {};

    function _getStore() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('[MemoryReview] Schema version mismatch, migrating...');
                stored = _migrate(stored);
            }
            _reviews = { ..._reviews, ...stored };
            if (_reviews._schemaVersion) {
                delete _reviews._schemaVersion;
            }
            return _reviews;
        } catch (e) {
            return _reviews;
        }
    }

    function _saveStore(store) {
        _reviews = store;
        try {
            var toSave = { ...store };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    function _migrate(stored) {
        console.log('[MemoryReview] 🔄 Migrating review data...');
        var migrated = {};
        for (var key in stored) {
            if (key === '_schemaVersion') continue;
            var entry = stored[key];
            // 如果旧数据没有 knowledgeId，使用 key
            if (!entry.knowledgeId) {
                entry.knowledgeId = key;
            }
            // 如果旧数据没有 reviewState，推断
            if (!entry.reviewState) {
                if (entry.dueAt && entry.dueAt > Date.now()) {
                    entry.reviewState = STATES.SCHEDULED;
                } else if (entry.dueAt && entry.dueAt <= Date.now()) {
                    entry.reviewState = STATES.DUE;
                } else {
                    entry.reviewState = STATES.NOT_READY;
                }
            }
            migrated[key] = entry;
        }
        migrated._schemaVersion = _schemaVersion;
        LawAIApp.StorageEngine?.set?.(_storageKey, migrated);
        console.log('[MemoryReview] ✅ Migration complete, entries:', Object.keys(migrated).length - 1);
        return migrated;
    }

    // ============================================================
    // CORE: Get/Create Review Record
    // ============================================================

    /**
     * 获取或创建 Review 记录
     * @param {string} knowledgeId
     * @returns {Object} Review 记录
     */
    function getReview(knowledgeId) {
        if (!knowledgeId) return null;
        var store = _getStore();

        if (!store[knowledgeId]) {
            store[knowledgeId] = _createDefaultReview(knowledgeId);
            _saveStore(store);
        }

        // 更新状态（检查是否逾期）
        var record = store[knowledgeId];
        record = _updateState(record);
        store[knowledgeId] = record;
        _saveStore(store);

        return record;
    }

    function _createDefaultReview(knowledgeId) {
        return {
            knowledgeId: knowledgeId,
            reviewState: STATES.NOT_READY,
            dueAt: null,
            lastReviewedAt: null,
            reviewCount: 0,
            successfulReviewCount: 0,
            failedReviewCount: 0,
            lastResult: null,
            priority: 0,
            source: 'memory',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            _schemaVersion: _schemaVersion
        };
    }

    function _updateState(record) {
        var now = Date.now();

        // 如果暂停，保持 SUSPENDED
        if (record.reviewState === STATES.SUSPENDED) {
            return record;
        }

        // 如果正在 review，保持 IN_REVIEW
        if (record.reviewState === STATES.IN_REVIEW) {
            return record;
        }

        // 如果已完成，保持 COMPLETED（但检查是否需要下一个 review）
        if (record.reviewState === STATES.COMPLETED) {
            // 如果 dueAt 在将来，转为 SCHEDULED
            if (record.dueAt && record.dueAt > now) {
                record.reviewState = STATES.SCHEDULED;
                record.updatedAt = now;
                return record;
            }
            // 如果 dueAt 已过，转为 DUE
            if (record.dueAt && record.dueAt <= now) {
                record.reviewState = STATES.DUE;
                record.updatedAt = now;
                return record;
            }
            return record;
        }

        // 检查是否逾期
        if (record.dueAt) {
            var overdueBy = (now - record.dueAt) / (24 * 60 * 60 * 1000);
            if (overdueBy > POLICY.overdueThreshold) {
                record.reviewState = STATES.OVERDUE;
                record.updatedAt = now;
                return record;
            }
            if (now >= record.dueAt) {
                record.reviewState = STATES.DUE;
                record.updatedAt = now;
                return record;
            }
        }

        // 如果有 dueAt 且在未来，保持 SCHEDULED
        if (record.dueAt && record.dueAt > now) {
            record.reviewState = STATES.SCHEDULED;
            return record;
        }

        return record;
    }

    // ============================================================
    // CORE: Schedule Review
    // ============================================================

    /**
     * 安排 Review
     * @param {string} knowledgeId
     * @param {Object} options
     * @param {number} options.interval - 自定义间隔（天）
     * @param {string} options.source - 来源
     * @returns {Object} 更新后的 Review 记录
     */
    function scheduleReview(knowledgeId, options) {
        options = options || {};
        if (!knowledgeId) return null;

        var store = _getStore();
        var record = store[knowledgeId];

        if (!record) {
            record = _createDefaultReview(knowledgeId);
        }

        // 计算间隔
        var interval = options.interval || _calculateInterval(record);

        // 应用 mastery 调整
        var masteryEngine = LawAIApp.MasteryEngine;
        if (masteryEngine && typeof masteryEngine.getMasteryLevel === 'function') {
            var masteryLevel = masteryEngine.getMasteryLevel(knowledgeId);
            var state = masteryEngine.getMasteryState ? masteryEngine.getMasteryState(knowledgeId) : null;
            if (state && POLICY.masteryBoost[state]) {
                interval = interval * POLICY.masteryBoost[state];
            }
        }

        // 限制间隔范围
        interval = Math.max(POLICY.minInterval, Math.min(POLICY.maxInterval, interval));

        // 设置 dueAt
        record.dueAt = Date.now() + (interval * 24 * 60 * 60 * 1000);
        record.reviewState = STATES.SCHEDULED;
        record.source = options.source || 'memory';
        record.updatedAt = Date.now();

        store[knowledgeId] = record;
        _saveStore(store);

        _emit('REVIEW_SCHEDULED', {
            knowledgeId: knowledgeId,
            dueAt: record.dueAt,
            interval: interval
        });

        return record;
    }

    /**
     * 计算下一次复习间隔
     */
    function _calculateInterval(record) {
        var count = record.reviewCount || 0;

        // 如果是第一次，使用初始间隔
        if (count === 0) {
            return POLICY.initialInterval;
        }

        // 根据成功/失败历史调整
        var successRatio = record.successfulReviewCount / Math.max(1, count);
        var baseInterval = POLICY.initialInterval * Math.pow(POLICY.successMultiplier, Math.min(count, 5));

        // 如果成功率低于 50%，缩短间隔
        if (successRatio < 0.5) {
            baseInterval = baseInterval * POLICY.failureMultiplier;
        }

        // 如果成功率高于 80%，延长间隔
        if (successRatio > 0.8) {
            baseInterval = baseInterval * 1.5;
        }

        return baseInterval;
    }

    // ============================================================
    // CORE: Execute Review
    // ============================================================

    /**
     * 开始 Review
     * @param {string} knowledgeId
     * @returns {Object} Review 会话信息
     */
    function startReview(knowledgeId) {
        if (!knowledgeId) return null;

        var record = getReview(knowledgeId);
        if (!record) return null;

        // 检查是否可以 review
        if (record.reviewState === STATES.NOT_READY) {
            console.warn('[MemoryReview] Knowledge not ready for review:', knowledgeId);
            return null;
        }

        // 如果已经暂停，不允许
        if (record.reviewState === STATES.SUSPENDED) {
            console.warn('[MemoryReview] Review suspended:', knowledgeId);
            return null;
        }

        var store = _getStore();
        record.reviewState = STATES.IN_REVIEW;
        record.updatedAt = Date.now();
        store[knowledgeId] = record;
        _saveStore(store);

        _emit('REVIEW_STARTED', {
            knowledgeId: knowledgeId,
            reviewCount: record.reviewCount
        });

        // 生成复习提示
        var prompt = _generatePrompt(knowledgeId);

        return {
            knowledgeId: knowledgeId,
            reviewCount: record.reviewCount,
            prompt: prompt
        };
    }

    /**
     * 完成 Review
     * @param {string} knowledgeId
     * @param {Object} result
     * @param {string} result.result - 'success' 或 'failure'
     * @param {number} result.performance - 0-1
     * @param {Object} result.metadata - 额外数据
     * @returns {Object} 更新后的 Review 记录
     */
    function completeReview(knowledgeId, result) {
        if (!knowledgeId) return null;
        result = result || {};
        var performance = result.performance !== undefined ? result.performance : 0.7;
        var isSuccess = result.result === 'success' || performance >= 0.6;

        var store = _getStore();
        var record = store[knowledgeId];

        if (!record) {
            console.warn('[MemoryReview] No review record found:', knowledgeId);
            return null;
        }

        // 如果不是 IN_REVIEW，但允许强制完成
        if (record.reviewState !== STATES.IN_REVIEW) {
            console.warn('[MemoryReview] Review not in progress, forcing completion:', knowledgeId);
        }

        // 更新记录
        record.reviewCount = (record.reviewCount || 0) + 1;
        record.lastReviewedAt = Date.now();
        record.lastResult = isSuccess ? 'success' : 'failure';
        record.updatedAt = Date.now();

        if (isSuccess) {
            record.successfulReviewCount = (record.successfulReviewCount || 0) + 1;
            record.reviewState = STATES.COMPLETED;
        } else {
            record.failedReviewCount = (record.failedReviewCount || 0) + 1;
            // 失败后进入 SCHEDULED（即将重新安排）
            record.reviewState = STATES.SCHEDULED;
        }

        store[knowledgeId] = record;
        _saveStore(store);

        // ============================================================
        // 🔥 发送证据到 Memory 和 Mastery
        // ============================================================

        var eventBus = LawAIApp.EventBus || window.EventBus;

        // 1. 发送到 MemoryEngine (Part 35)
        if (eventBus && typeof eventBus.emit === 'function') {
            eventBus.emit('ReviewCompleted', {
                knowledgeId: knowledgeId,
                performance: performance,
                result: isSuccess ? 'success' : 'failure'
            });
        } else {
            // Fallback: 直接调用 MemoryEngine
            var memoryEngine = LawAIApp.MemoryEngine;
            if (memoryEngine && typeof memoryEngine.recordReview === 'function') {
                memoryEngine.recordReview(knowledgeId, performance);
            }
        }

        // 2. 发送到 MasteryEngine (Part 36)
        var masteryEngine = LawAIApp.MasteryEngine;
        if (masteryEngine && typeof masteryEngine.recordEvidence === 'function') {
            masteryEngine.recordEvidence({
                knowledgeId: knowledgeId,
                evidenceType: isSuccess ? 'REVIEW_SUCCESS' : 'REVIEW_FAILURE',
                result: performance,
                metadata: { source: 'MemoryReview', reviewCount: record.reviewCount }
            });
        }

        // 3. 安排下一次 Review
        var interval = _calculateInterval(record);
        if (isSuccess) {
            // 成功后增加间隔
            interval = interval * POLICY.successMultiplier;
        } else {
            // 失败后缩短间隔
            interval = interval * POLICY.failureMultiplier;
        }

        record.dueAt = Date.now() + (interval * 24 * 60 * 60 * 1000);
        record.reviewState = STATES.SCHEDULED;
        store[knowledgeId] = record;
        _saveStore(store);

        _emit('REVIEW_COMPLETED', {
            knowledgeId: knowledgeId,
            result: isSuccess ? 'success' : 'failure',
            performance: performance,
            nextReviewAt: record.dueAt
        });

        return record;
    }

    /**
     * 生成复习提示
     */
    function _generatePrompt(knowledgeId) {
        // 尝试使用 RecallEngine
        var recallEngine = LawAIApp.RecallEngine;
        if (recallEngine && typeof recallEngine.generateRecallPrompt === 'function') {
            return recallEngine.generateRecallPrompt(knowledgeId);
        }

        // Fallback: 简单提示
        return 'Review: ' + knowledgeId;
    }

    // ============================================================
    // PUBLIC: Query Methods
    // ============================================================

    /**
     * 获取今日应复习的知识点
     * @returns {Array} 今日复习列表
     */
    function getTodayReviews() {
        var now = Date.now();
        var store = _getStore();
        var due = [];

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var record = store[key];
            if (!record.dueAt) continue;

            var daysUntilDue = (record.dueAt - now) / (24 * 60 * 60 * 1000);

            // DUE: 已到复习时间
            if (daysUntilDue <= 0) {
                due.push({
                    knowledgeId: record.knowledgeId || key,
                    dueAt: record.dueAt,
                    reviewState: record.reviewState,
                    reviewCount: record.reviewCount,
                    successfulCount: record.successfulReviewCount,
                    failedCount: record.failedReviewCount,
                    priority: _calculatePriority(record)
                });
            }
        }

        // 按优先级排序
        due.sort(function(a, b) {
            return (b.priority || 0) - (a.priority || 0);
        });

        return due;
    }

    /**
     * 获取未来 N 天的复习计划
     */
    function getUpcomingReviews(daysAhead) {
        daysAhead = daysAhead || 7;
        var now = Date.now();
        var limit = now + (daysAhead * 24 * 60 * 60 * 1000);
        var store = _getStore();
        var upcoming = [];

        for (var key in store) {
            if (key === '_schemaVersion') continue;
            var record = store[key];
            if (!record.dueAt) continue;
            if (record.dueAt > now && record.dueAt <= limit) {
                upcoming.push({
                    knowledgeId: record.knowledgeId || key,
                    dueAt: record.dueAt,
                    reviewState: record.reviewState,
                    reviewCount: record.reviewCount,
                    priority: _calculatePriority(record)
                });
            }
        }

        upcoming.sort(function(a, b) {
            return a.dueAt - b.dueAt;
        });

        return upcoming;
    }

    /**
     * 计算优先级 (0-100)
     */
    function _calculatePriority(record) {
        var priority = 50;

        // 逾期增加优先级
        if (record.dueAt) {
            var overdue = (Date.now() - record.dueAt) / (24 * 60 * 60 * 1000);
            if (overdue > 0) {
                priority = priority + Math.min(40, overdue * 10);
            }
        }

        // 失败历史增加优先级
        var failureRatio = record.failedReviewCount / Math.max(1, record.reviewCount);
        if (failureRatio > 0.3) {
            priority = priority + 20;
        }

        return Math.min(100, priority);
    }

    // ============================================================
    // PUBLIC: Suspension
    // ============================================================

    function suspendReview(knowledgeId) {
        if (!knowledgeId) return false;
        var store = _getStore();
        var record = store[knowledgeId];
        if (!record) return false;

        record.reviewState = STATES.SUSPENDED;
        record.updatedAt = Date.now();
        store[knowledgeId] = record;
        _saveStore(store);

        _emit('REVIEW_SUSPENDED', { knowledgeId: knowledgeId });
        return true;
    }

    function unsuspendReview(knowledgeId) {
        if (!knowledgeId) return false;
        var store = _getStore();
        var record = store[knowledgeId];
        if (!record) return false;

        // 恢复时重新安排
        record.reviewState = STATES.SCHEDULED;
        record.updatedAt = Date.now();
        store[knowledgeId] = record;
        _saveStore(store);

        _emit('REVIEW_UNSUSPENDED', { knowledgeId: knowledgeId });
        return true;
    }

    // ============================================================
    // PUBLIC: Legacy API (向后兼容)
    // ============================================================

    /**
     * 执行复习 (Legacy API)
     * @param {string} lessonId - 课程 ID
     * @param {string} method - 复习方法
     * @returns {Object} 复习结果
     */
    function performReview(lessonId, method) {
        method = method || 'flashcard';

        // 检查 Lesson 是否存在
        var lesson = null;
        var lessonEngine = LawAIApp.LessonEngine;
        if (lessonEngine && typeof lessonEngine.getLessonByDay === 'function') {
            var dayNum = parseInt(lessonId.replace('day-', ''));
            if (!isNaN(dayNum)) {
                lesson = lessonEngine.getLessonByDay(dayNum);
            }
        }

        if (!lesson) {
            return { success: false, message: 'Lesson not found' };
        }

        // 模拟复习质量 (实际应由 UI 提供)
        var quality = Math.random() > 0.3 ? 'good' : 'partial';

        // 调用完整 review 流程
        var review = startReview(lessonId);
        if (!review) {
            return { success: false, message: 'Cannot start review' };
        }

        var isSuccess = quality === 'good' || quality === 'excellent';
        var completed = completeReview(lessonId, {
            result: isSuccess ? 'success' : 'failure',
            performance: isSuccess ? 0.8 : 0.4
        });

        if (!completed) {
            return { success: false, message: 'Review completion failed' };
        }

        return {
            success: true,
            method: method,
            lessonTitle: lesson.title,
            quality: quality,
            reviewCount: completed.reviewCount,
            nextReviewDate: completed.dueAt
        };
    }

    /**
     * 批量复习 (Legacy API)
     */
    function performBatchReview(lessonIds, method) {
        method = method || 'mini_quiz';
        var results = [];
        for (var i = 0; i < lessonIds.length; i++) {
            var result = performReview(lessonIds[i], method);
            results.push(result);
        }
        return results;
    }

    /**
     * 生成复习提示 (Legacy API)
     */
    function generateRecallPrompt(lessonId) {
        return _generatePrompt(lessonId);
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

        var todayReviews = getTodayReviews();

        return {
            version: '2.0.0',
            initialized: true,
            schemaVersion: _schemaVersion,
            totalRecords: records.length,
            todayReviews: todayReviews.length,
            states: {
                not_ready: records.filter(function(r) { return r.reviewState === STATES.NOT_READY; }).length,
                scheduled: records.filter(function(r) { return r.reviewState === STATES.SCHEDULED; }).length,
                due: records.filter(function(r) { return r.reviewState === STATES.DUE; }).length,
                overdue: records.filter(function(r) { return r.reviewState === STATES.OVERDUE; }).length,
                completed: records.filter(function(r) { return r.reviewState === STATES.COMPLETED; }).length
            },
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
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

    var MemoryReview = {
        // Constants
        STATES: STATES,
        POLICY: POLICY,

        // Core
        getReview: getReview,
        scheduleReview: scheduleReview,
        startReview: startReview,
        completeReview: completeReview,

        // Query
        getTodayReviews: getTodayReviews,
        getUpcomingReviews: getUpcomingReviews,

        // Suspension
        suspendReview: suspendReview,
        unsuspendReview: unsuspendReview,

        // Legacy API (向后兼容)
        performReview: performReview,
        performBatchReview: performBatchReview,
        generateRecallPrompt: generateRecallPrompt,

        // Status
        getStatus: getStatus,

        // Internal
        _upgraded: true,
        _version: '2.0.0'
    };

    window.LawAIApp.MemoryReview = MemoryReview;
    console.log('[MemoryReview] ✅ Upgraded to v2.0.0 (Part 37)');

})();
