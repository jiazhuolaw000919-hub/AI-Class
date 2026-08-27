// ================================================================
// ENGINE: MemoryEngine
// LAYER: Core Logic Layer
// DOMAIN: Memory & Review Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 3.0.0 — Part 35 Learning Memory Foundation
// ================================================================
//
// DATA CANON COMPLIANCE
// ================================================================
//   - Schema Version: 2.0.0
//   - Migration Support: Yes
//   - Export/Import: Via StorageEngine
//   - knowledgeId support: Yes (backward compatible with lessonId)
//
// MEMORY STATES (Part 35)
// ================================================================
//   UNSEEN      → 从未学习过
//   LEARNED     → 已学习（lesson opened/completed）
//   PRACTICED   → 已练习
//   RECALLED    → 成功回忆过
//   STABLE      → 多次成功回忆，稳定
//   REVIEW_DUE  → 需要复习
//   FORGOTTEN   → 遗忘，需要重新学习
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.MemoryEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'MemoryEngine';
    var _engineVersion = '3.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Memory & Review Management';
    var _schemaVersion = '2.0.0';
    var _storageKey = 'memory_entries';

    var _initialized = false;
    var _memories = {};

    // ============================================================
    // MEMORY STATE CONSTANTS
    // ============================================================
    var STATES = {
        UNSEEN: 'UNSEEN',
        LEARNED: 'LEARNED',
        PRACTICED: 'PRACTICED',
        RECALLED: 'RECALLED',
        STABLE: 'STABLE',
        REVIEW_DUE: 'REVIEW_DUE',
        FORGOTTEN: 'FORGOTTEN'
    };

    var STATE_ORDER = {
        UNSEEN: 0,
        LEARNED: 1,
        PRACTICED: 2,
        RECALLED: 3,
        STABLE: 4,
        REVIEW_DUE: 5,
        FORGOTTEN: 6
    };

    // ============================================================
    // STORAGE
    // ============================================================
    function getAll() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey) || {};
            if (stored._schemaVersion && stored._schemaVersion !== _schemaVersion) {
                console.warn('⚠️ MemoryEngine: Schema version mismatch. Expected ' + _schemaVersion + ', got ' + stored._schemaVersion);
                // 尝试迁移
                stored = _migrate(stored);
            }
            _memories = { ..._memories, ...stored };
            if (_memories._schemaVersion) {
                delete _memories._schemaVersion;
            }
            return _memories;
        } catch (e) {
            return _memories;
        }
    }

    function saveAll(memories) {
        _memories = memories;
        try {
            var toSave = { ...memories };
            toSave._schemaVersion = _schemaVersion;
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    function _migrate(stored) {
        console.log('🔄 MemoryEngine: Migrating data...');
        var migrated = {};
        for (var key in stored) {
            if (key === '_schemaVersion') continue;
            var entry = stored[key];
            // 如果旧数据没有 state 字段，根据 strength 推断
            if (!entry.state) {
                if (entry.strength >= 80) entry.state = STATES.STABLE;
                else if (entry.strength >= 60) entry.state = STATES.RECALLED;
                else if (entry.strength >= 40) entry.state = STATES.PRACTICED;
                else if (entry.strength >= 20) entry.state = STATES.LEARNED;
                else entry.state = STATES.UNSEEN;
            }
            // 确保 knowledgeId 存在
            if (!entry.knowledgeId) {
                entry.knowledgeId = key; // 使用 lessonId 作为 knowledgeId
            }
            migrated[key] = entry;
        }
        migrated._schemaVersion = _schemaVersion;
        LawAIApp.StorageEngine?.set?.(_storageKey, migrated);
        console.log('✅ MemoryEngine: Migration complete');
        return migrated;
    }

    // ============================================================
    // CORE: Get/Update Memory
    // ============================================================

    /**
     * 获取记忆条目（支持 knowledgeId 或 lessonId）
     * @param {string} id - knowledgeId 或 lessonId
     * @param {string} type - 'knowledgeId' 或 'lessonId'
     * @returns {Object} 记忆条目
     */
    function getMemory(id, type) {
        type = type || 'lessonId';
        var memories = getAll();
        var key = id;

        // 如果使用 knowledgeId 查找，可能需要遍历
        if (type === 'knowledgeId') {
            for (var k in memories) {
                if (memories[k].knowledgeId === id) {
                    key = k;
                    break;
                }
            }
        }

        if (!memories[key]) {
            memories[key] = _createDefaultMemory(key, id, type);
            saveAll(memories);
        }
        return memories[key];
    }

    /**
     * 创建默认记忆条目
     */
    function _createDefaultMemory(key, id, type) {
        var knowledgeId = type === 'knowledgeId' ? id : key;
        return {
            lessonId: key,
            knowledgeId: knowledgeId,
            strength: 0,
            state: STATES.UNSEEN,
            lastReviewed: null,
            lastPracticed: null,
            lastRecalled: null,
            reviewCount: 0,
            practiceCount: 0,
            recallCount: 0,
            nextReview: null,
            exposureCount: 0,
            confidence: 0,
            retentionEstimate: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
    }

    /**
     * 获取记忆强度
     * @param {string} lessonId - 课程 ID
     * @returns {number} 记忆强度 (0-100)
     */
    function getMemoryStrength(lessonId) {
        var memory = getMemory(lessonId);
        return memory ? memory.strength || 0 : 0;
    }

    /**
     * 获取记忆状态
     * @param {string} lessonId - 课程 ID
     * @returns {string} 记忆状态
     */
    function getMemoryState(lessonId) {
        var memory = getMemory(lessonId);
        return memory ? memory.state || STATES.UNSEEN : STATES.UNSEEN;
    }

    /**
     * 获取记忆状态描述
     * @param {string} lessonId - 课程 ID
     * @returns {string} 状态描述
     */
    function getMemoryStateLabel(lessonId) {
        var state = getMemoryState(lessonId);
        var labels = {
            'UNSEEN': 'Not started',
            'LEARNED': 'Learned',
            'PRACTICED': 'Practiced',
            'RECALLED': 'Recalled',
            'STABLE': 'Stable',
            'REVIEW_DUE': 'Review due',
            'FORGOTTEN': 'Forgotten'
        };
        return labels[state] || state;
    }

    /**
     * 更新记忆（核心方法）
     * @param {string} lessonId - 课程 ID
     * @param {Object} options - 更新选项
     * @param {number} options.score - 分数 (0-100)
     * @param {string} options.action - 'learn' | 'practice' | 'recall' | 'review'
     * @param {number} options.performance - 表现 (0-1)
     * @returns {Object} 更新后的记忆条目
     */
    function updateMemory(lessonId, options) {
        var memories = getAll();
        var memory = memories[lessonId];

        if (!memory) {
            memory = _createDefaultMemory(lessonId, lessonId, 'lessonId');
            memories[lessonId] = memory;
        }

        var score = options.score !== undefined ? options.score : 50;
        var action = options.action || 'learn';
        var performance = options.performance !== undefined ? options.performance : 0.5;

        // 更新基础字段
        memory.updatedAt = Date.now();
        memory.exposureCount = (memory.exposureCount || 0) + 1;

        // 根据 action 更新不同字段
        switch (action) {
            case 'learn':
                memory.strength = Math.max(20, Math.min(100, memory.strength || 0 + 20));
                memory.state = _transitionState(memory.state, 'learn', score);
                break;

            case 'practice':
                memory.lastPracticed = Date.now();
                memory.practiceCount = (memory.practiceCount || 0) + 1;
                memory.strength = Math.round((memory.strength || 0) * 0.5 + score * 0.5);
                memory.state = _transitionState(memory.state, 'practice', score);
                break;

            case 'recall':
                memory.lastRecalled = Date.now();
                memory.recallCount = (memory.recallCount || 0) + 1;
                memory.strength = Math.round((memory.strength || 0) * 0.3 + score * 0.7);
                memory.confidence = Math.round((memory.confidence || 0) * 0.3 + score * 0.7);
                memory.state = _transitionState(memory.state, 'recall', score);
                break;

            case 'review':
                memory.lastReviewed = Date.now();
                memory.reviewCount = (memory.reviewCount || 0) + 1;
                // 根据表现调整 strength
                var adjustment = performance >= 0.7 ? 10 : (performance >= 0.4 ? 0 : -15);
                memory.strength = Math.max(0, Math.min(100, (memory.strength || 0) + adjustment));
                memory.state = _transitionState(memory.state, 'review', performance * 100);
                break;

            default:
                memory.strength = Math.round((memory.strength || 0) * 0.6 + score * 0.4);
                memory.state = _transitionState(memory.state, 'learn', score);
        }

        // 计算 retentionEstimate
        memory.retentionEstimate = _calculateRetention(memory);

        // 计算 nextReview
        memory.nextReview = _calculateNextReview(memory);

        saveAll(memories);
        return memory;
    }

    /**
     * 状态转换逻辑
     */
    function _transitionState(currentState, action, score) {
        var stateMap = {
            'UNSEEN': { learn: 'LEARNED', practice: 'LEARNED', recall: 'LEARNED', review: 'UNSEEN' },
            'LEARNED': { learn: 'LEARNED', practice: 'PRACTICED', recall: 'RECALLED', review: 'LEARNED' },
            'PRACTICED': { learn: 'PRACTICED', practice: 'PRACTICED', recall: 'RECALLED', review: 'PRACTICED' },
            'RECALLED': { learn: 'RECALLED', practice: 'RECALLED', recall: 'RECALLED', review: 'RECALLED' },
            'STABLE': { learn: 'STABLE', practice: 'STABLE', recall: 'STABLE', review: 'STABLE' },
            'REVIEW_DUE': { learn: 'LEARNED', practice: 'PRACTICED', recall: 'RECALLED', review: 'STABLE' },
            'FORGOTTEN': { learn: 'LEARNED', practice: 'PRACTICED', recall: 'RECALLED', review: 'LEARNED' }
        };

        // 如果分数很高，可以跳级
        if (score >= 80 && currentState === 'PRACTICED') return 'RECALLED';
        if (score >= 80 && currentState === 'RECALLED') return 'STABLE';
        if (score >= 90 && currentState === 'LEARNED') return 'PRACTICED';

        var next = stateMap[currentState];
        if (next && next[action]) {
            return next[action];
        }
        return currentState || 'UNSEEN';
    }

    /**
     * 计算 retention estimate
     */
    function _calculateRetention(memory) {
        var strength = memory.strength || 0;
        var reviewCount = memory.reviewCount || 0;
        var recallCount = memory.recallCount || 0;
        var practiceCount = memory.practiceCount || 0;

        // 综合计算：strength 占 60%，review 占 20%，recall 占 20%
        var base = strength * 0.6;
        var reviewBonus = Math.min(20, reviewCount * 2);
        var recallBonus = Math.min(20, recallCount * 2);
        var practiceBonus = Math.min(10, practiceCount * 1);

        return Math.min(100, Math.round(base + reviewBonus + recallBonus + practiceBonus));
    }

    /**
     * 计算下次复习时间
     */
    function _calculateNextReview(memory) {
        var strength = memory.strength || 0;
        var state = memory.state || 'UNSEEN';
        var now = Date.now();

        // 根据状态决定基础间隔
        var baseInterval = 1; // days
        switch (state) {
            case 'UNSEEN': baseInterval = 0.5; break;
            case 'LEARNED': baseInterval = 1; break;
            case 'PRACTICED': baseInterval = 2; break;
            case 'RECALLED': baseInterval = 4; break;
            case 'STABLE': baseInterval = 7; break;
            case 'REVIEW_DUE': baseInterval = 0; break;
            case 'FORGOTTEN': baseInterval = 0.5; break;
            default: baseInterval = 1;
        }

        // 根据 strength 调整间隔
        var strengthMultiplier = 0.5 + (strength / 100) * 1.5;
        var days = baseInterval * strengthMultiplier;

        // 如果 state 是 REVIEW_DUE，立即安排
        if (state === 'REVIEW_DUE') {
            days = 0;
        }

        return now + (days * 24 * 60 * 60 * 1000);
    }

    // ============================================================
    // PUBLIC: Convenience Methods
    // ============================================================

    /**
     * 记录学习（Lesson Completed）
     */
    function recordLearning(lessonId, score) {
        score = score || 50;
        return updateMemory(lessonId, { score: score, action: 'learn' });
    }

    /**
     * 记录练习（Practice Completed）
     */
    function recordPractice(lessonId, score) {
        score = score || 60;
        return updateMemory(lessonId, { score: score, action: 'practice' });
    }

    /**
     * 记录回忆（Recall Completed）
     */
    function recordRecall(lessonId, score) {
        score = score || 70;
        return updateMemory(lessonId, { score: score, action: 'recall' });
    }

    /**
     * 记录复习（Review Completed）
     * @param {string} lessonId
     * @param {number} performance - 0-1
     */
    function recordReview(lessonId, performance) {
        performance = performance || 0.7;
        return updateMemory(lessonId, { 
            score: Math.round(performance * 100), 
            action: 'review',
            performance: performance 
        });
    }

    // ============================================================
    // PUBLIC: Review Scheduling
    // ============================================================

    /**
     * 获取今日复习列表
     * @returns {Array} 需要复习的条目
     */
    function getTodayReviews() {
        return scheduleReviews(1);
    }

    /**
     * 获取复习计划
     * @param {number} days - 天数范围
     * @returns {Array} 复习列表
     */
    function scheduleReviews(days) {
        days = days || 7;
        var now = Date.now();
        var memories = getAll();
        var due = [];
        var limit = now + (days * 24 * 60 * 60 * 1000);

        for (var key in memories) {
            var memory = memories[key];
            if (memory.state === STATES.REVIEW_DUE) {
                due.push({
                    lessonId: key,
                    knowledgeId: memory.knowledgeId || key,
                    strength: memory.strength || 0,
                    state: memory.state,
                    nextReview: memory.nextReview,
                    daysOverdue: Math.round((now - (memory.nextReview || now)) / (24 * 60 * 60 * 1000))
                });
            } else if (memory.nextReview && memory.nextReview <= limit) {
                due.push({
                    lessonId: key,
                    knowledgeId: memory.knowledgeId || key,
                    strength: memory.strength || 0,
                    state: memory.state,
                    nextReview: memory.nextReview,
                    daysOverdue: Math.round((now - memory.nextReview) / (24 * 60 * 60 * 1000))
                });
            }
        }

        // 按紧急程度排序：强度越低越靠前
        due.sort(function(a, b) {
            return a.strength - b.strength;
        });

        return due;
    }

    /**
     * 获取记忆健康分数
     * @returns {number} 健康分数 (0-100)
     */
    function getMemoryHealth() {
        var memories = getAll();
        var entries = Object.values(memories);
        if (entries.length === 0) return 100;

        var totalStrength = 0;
        var reviewDueCount = 0;
        var forgottenCount = 0;

        for (var i = 0; i < entries.length; i++) {
            var m = entries[i];
            totalStrength += m.strength || 0;
            if (m.state === STATES.REVIEW_DUE) reviewDueCount++;
            if (m.state === STATES.FORGOTTEN) forgottenCount++;
        }

        var avgStrength = totalStrength / entries.length;
        var penalty = (reviewDueCount * 3) + (forgottenCount * 5);
        return Math.max(0, Math.round(avgStrength - penalty));
    }

    /**
     * 获取风险项（strength < 40 或 state = FORGOTTEN）
     * @returns {Array} 风险项列表
     */
    function getAtRiskTopics() {
        var memories = getAll();
        var atRisk = [];

        for (var key in memories) {
            var m = memories[key];
            if (m.strength < 40 || m.state === STATES.FORGOTTEN) {
                atRisk.push({
                    lessonId: key,
                    knowledgeId: m.knowledgeId || key,
                    strength: m.strength || 0,
                    state: m.state
                });
            }
        }

        atRisk.sort(function(a, b) {
            return a.strength - b.strength;
        });

        return atRisk;
    }

    // ============================================================
    // PUBLIC: Analytics
    // ============================================================

    /**
     * 获取整体统计
     */
    function getStats() {
        var memories = getAll();
        var entries = Object.values(memories);
        var stats = {
            total: entries.length,
            byState: {},
            totalStrength: 0,
            totalReviews: 0,
            totalPractices: 0,
            totalRecalls: 0
        };

        for (var i = 0; i < entries.length; i++) {
            var m = entries[i];
            var state = m.state || 'UNSEEN';
            stats.byState[state] = (stats.byState[state] || 0) + 1;
            stats.totalStrength += m.strength || 0;
            stats.totalReviews += m.reviewCount || 0;
            stats.totalPractices += m.practiceCount || 0;
            stats.totalRecalls += m.recallCount || 0;
        }

        stats.averageStrength = entries.length > 0 ? Math.round(stats.totalStrength / entries.length) : 0;
        stats.health = getMemoryHealth();
        stats.todayReviews = getTodayReviews().length;

        return stats;
    }

    /**
     * 获取热图数据
     * @param {number} days - 天数范围
     * @returns {Array} 热图数据
     */
    function getHeatmap(days) {
        days = days || 90;
        var memories = getAll();
        var heatmap = [];
        var now = Date.now();
        var dayMs = 24 * 60 * 60 * 1000;

        for (var i = days - 1; i >= 0; i--) {
            var date = new Date(now - (i * dayMs));
            var dateStr = date.toISOString().split('T')[0];
            var count = 0;

            for (var key in memories) {
                var memory = memories[key];
                if (memory.lastReviewed) {
                    var reviewDate = new Date(memory.lastReviewed).toISOString().split('T')[0];
                    if (reviewDate === dateStr) {
                        count++;
                    }
                }
                if (memory.lastPracticed) {
                    var practiceDate = new Date(memory.lastPracticed).toISOString().split('T')[0];
                    if (practiceDate === dateStr) {
                        count++;
                    }
                }
            }

            heatmap.push({
                date: dateStr,
                count: count
            });
        }

        return heatmap;
    }

    // ============================================================
    // PUBLIC: Reset / Export / Import
    // ============================================================

    function reset() {
        _memories = {};
        try {
            LawAIApp.StorageEngine?.set?.(_storageKey, { _schemaVersion: _schemaVersion });
            console.log('🧠 MemoryEngine: Reset complete');
        } catch (e) {}
    }

    function exportData() {
        return getAll();
    }

    function importData(data) {
        if (data && typeof data === 'object') {
            saveAll(data);
            console.log('🧠 MemoryEngine: Import complete');
            return true;
        }
        return false;
    }

    // ============================================================
    // PUBLIC: Status
    // ============================================================

    function getStatus() {
        var stats = getStats();
        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            schemaVersion: _schemaVersion,
            totalMemories: stats.total,
            byState: stats.byState,
            averageStrength: stats.averageStrength,
            health: stats.health,
            todayReviews: stats.todayReviews,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    function init() {
        if (_initialized) {
            console.log('[MemoryEngine] Already initialized');
            return;
        }

        console.log('[MemoryEngine] 🚀 Initializing v' + _engineVersion + '...');

        try {
            // 加载并迁移数据
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            if (stored) {
                getAll(); // 触发迁移
            }

            // ============================================================
            // 🔥 Part 35: 事件集成
            // ============================================================

            var eventBus = LawAIApp.EventBus || window.EventBus;

            // 1. LessonCompleted → recordLearning
            if (eventBus && typeof eventBus.on === 'function') {
                eventBus.on('LessonCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    if (lessonId) {
                        var score = data && data.xpGain ? Math.min(100, data.xpGain * 2) : 50;
                        recordLearning(lessonId, score);
                        console.log('[MemoryEngine] 📝 Lesson recorded:', lessonId, 'strength:', getMemoryStrength(lessonId));
                    }
                });
                console.log('[MemoryEngine] ✅ Listening to LessonCompleted');

                // 2. PracticeCompleted → recordPractice
                eventBus.on('PracticeCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    if (lessonId) {
                        var score = data && data.score ? data.score : (data && data.accuracy ? data.accuracy : 60);
                        recordPractice(lessonId, score);
                        console.log('[MemoryEngine] ✍️ Practice recorded:', lessonId, 'strength:', getMemoryStrength(lessonId));
                    }
                });
                console.log('[MemoryEngine] ✅ Listening to PracticeCompleted');

                // 3. RecallCompleted → recordRecall
                eventBus.on('RecallCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    if (lessonId) {
                        var score = data && data.newStrength ? data.newStrength : 70;
                        recordRecall(lessonId, score);
                        console.log('[MemoryEngine] 🧠 Recall recorded:', lessonId, 'strength:', getMemoryStrength(lessonId));
                    }
                });
                console.log('[MemoryEngine] ✅ Listening to RecallCompleted');

                // 4. ReviewCompleted → recordReview
                eventBus.on('ReviewCompleted', function(data) {
                    var lessonId = data && data.lessonId;
                    if (lessonId) {
                        var performance = data && data.performance ? data.performance : 0.7;
                        recordReview(lessonId, performance);
                        console.log('[MemoryEngine] 🔄 Review recorded:', lessonId, 'strength:', getMemoryStrength(lessonId));
                    }
                });
                console.log('[MemoryEngine] ✅ Listening to ReviewCompleted');

                // 5. ModuleCompleted → 也可以触发记忆更新
                eventBus.on('ModuleCompleted', function(data) {
                    var moduleId = data && data.moduleId;
                    // Module 可以包含多个 lessons，这里只记录模块完成
                    console.log('[MemoryEngine] 📦 Module completed:', moduleId);
                });
                console.log('[MemoryEngine] ✅ Listening to ModuleCompleted');

            } else {
                console.warn('[MemoryEngine] ⚠️ EventBus not available, using fallback events');

                // Fallback: 使用 DOM 事件
                document.addEventListener('LessonCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    if (lessonId) {
                        recordLearning(lessonId, 50);
                    }
                });
                document.addEventListener('PracticeCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    if (lessonId) {
                        recordPractice(lessonId, data.score || 60);
                    }
                });
                document.addEventListener('RecallCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    if (lessonId) {
                        recordRecall(lessonId, data.newStrength || 70);
                    }
                });
                document.addEventListener('ReviewCompleted', function(e) {
                    var data = e.detail || {};
                    var lessonId = data.lessonId;
                    if (lessonId) {
                        recordReview(lessonId, data.performance || 0.7);
                    }
                });
            }

            // ============================================================
            // 🔥 Part 35: 启动自动检查（每5分钟检查一次复习到期）
            // ============================================================
            setInterval(function() {
                var due = getTodayReviews();
                if (due.length > 0) {
                    console.log('[MemoryEngine] 🔔 ' + due.length + ' items due for review today');
                    // 触发事件让 UI 知道
                    if (eventBus && typeof eventBus.emit === 'function') {
                        eventBus.emit('MEMORY_REVIEW_DUE', { count: due.length, items: due });
                    }
                }
            }, 300000); // 5 分钟

            _initialized = true;
            console.log('[MemoryEngine] ✅ Initialized successfully, entries:', Object.keys(getAll()).length);

        } catch (error) {
            console.error('[MemoryEngine] ❌ Init failed:', error);
            _initialized = false;
        }
    }

    // ============================================================
    // PUBLIC API
    // ============================================================

    return {
        // Initialization
        init: init,

        // Core
        getAll: getAll,
        getAllMemories: getAll,
        getMemory: getMemory,
        getMemoryStrength: getMemoryStrength,
        getMemoryState: getMemoryState,
        getMemoryStateLabel: getMemoryStateLabel,
        updateMemory: updateMemory,

        // Actions
        recordLearning: recordLearning,
        recordPractice: recordPractice,
        recordRecall: recordRecall,
        recordReview: recordReview,

        // Review Scheduling
        getTodayReviews: getTodayReviews,
        scheduleReviews: scheduleReviews,
        getMemoryHealth: getMemoryHealth,
        getAtRiskTopics: getAtRiskTopics,

        // Analytics
        getStats: getStats,
        getHeatmap: getHeatmap,

        // Reset / Export / Import
        reset: reset,
        exportData: exportData,
        importData: importData,

        // Status
        getStatus: getStatus,

        // Constants
        STATES: STATES
    };
})();

console.log('🧠 MemoryEngine V3.0 ready (Part 35)');
