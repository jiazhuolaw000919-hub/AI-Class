// ================================================================
// ENGINE: ProgressEngine
// LAYER: Core Logic Layer
// DOMAIN: Learning Progress Tracking & Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.1.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Owns all user learning progress data.
//   Tracks completed lessons, XP, levels, streaks, and stages.
//   Single source of truth for learner progress.
//
// DATA CANON COMPLIANCE
// ================================================================
//   - Schema Version: 2.0.0
//   - Migration Support: Yes
//   - Export/Import: Via StorageEngine
//
// PUBLIC API
// ================================================================
//   init()                                      -> this
//   getProgress()                               -> Progress object
//   saveProgress(progress)                      -> boolean
//   getState()                                  -> State object
//   getXP()                                     -> number
//   getLevel()                                  -> number
//   getDay()                                    -> number
//   getStreak()                                 -> number
//   getCompletionPercent()                      -> number
//   getCurrentStage()                           -> string
//   getCompletedLessons()                       -> array
//   getRemainingLessons()                       -> number
//   isLessonCompleted(lessonId)                 -> boolean
//   setXP(totalXP)                              -> boolean
//   completeLesson(lessonId)                    -> Progress object
//   resetProgress()                             -> Progress object
//   migrateProgress()                           -> boolean
//   getStatus()                                 -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required)
//   - EventBus (optional)
//
// STORAGE
// ================================================================
//   - Key: 'lawai_progress'
//   - Schema Version: 2.0.0
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'LessonCompleted' : { lessonId, xpGain }
//   - 'ProgressUpdated' : { lessonId, progress }
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ProgressEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'ProgressEngine',
    _engineVersion: '2.1.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Learning Progress Tracking & Management',
    _schemaVersion: '2.0.0',
    _storageKey: 'progress',

    initialized: false,

    // ============================================================
    // PUBLIC API
    // ============================================================

    init: function() {
        if (this.initialized) return;
        this.initialized = true;

        // 检查是否需要迁移
        this._checkAndMigrate();

        console.log('📊 ProgressEngine v' + this._engineVersion + ' initialized');
        return this;
    },

    // ============================================================
    // 默认数据结构
    // ============================================================
    defaultProgress: function() {
        return {
            completedLessons: [],
            currentLesson: 1,
            completionPercent: 0,
            currentStage: 'Foundation',
            xp: 0,
            totalLessons: 365,
            day: 1,
            level: 1,
            streak: 0,
            lastActive: null,
            createdAt: new Date().toISOString(),
            _schemaVersion: this._schemaVersion
        };
    },

    // ============================================================
    // 安全存储访问
    // ============================================================
    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (err) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                return LawAIApp.StorageEngine.set(key, value);
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (err) {
            return false;
        }
    },

    _safeEmit: function(eventName, data) {
        try {
            if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
                LawAIApp.EventBus.emit(eventName, data);
                return true;
            }
            window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
            return true;
        } catch (err) {
            return false;
        }
    },

    // ============================================================
    // 迁移
    // ============================================================
    _checkAndMigrate: function() {
        var stored = this._safeGet(this._storageKey, null);
        if (!stored) return;

        // 检查是否有 _schemaVersion 字段
        if (!stored._schemaVersion) {
            console.log('🔄 ProgressEngine: Migrating progress data to schema v2.0.0');
            stored._schemaVersion = '2.0.0';
            // 确保所有必需字段存在
            var defaults = this.defaultProgress();
            for (var key in defaults) {
                if (!(key in stored)) {
                    stored[key] = defaults[key];
                }
            }
            this._safeSet(this._storageKey, stored);
            console.log('✅ ProgressEngine: Migration complete');
        }
    },

    // ============================================================
    // 核心方法
    // ============================================================
    getProgress: function() {
        try {
            var stored = this._safeGet(this._storageKey, null);
            var defaults = this.defaultProgress();
            if (stored && typeof stored === 'object') {
                // 合并，保留存储的值，用默认值补充缺失字段
                var merged = { ...defaults, ...stored };
                return merged;
            }
            return defaults;
        } catch (err) {
            return this.defaultProgress();
        }
    },

    saveProgress: function(progress) {
        if (!progress || typeof progress !== 'object') return false;
        // 确保有 schema 版本
        if (!progress._schemaVersion) {
            progress._schemaVersion = this._schemaVersion;
        }
        return this._safeSet(this._storageKey, progress);
    },

    // ============================================================
    // 便捷获取方法
    // ============================================================
    getState: function() {
        var prog = this.getProgress();
        return {
            level: prog.level || 1,
            xp: prog.xp || 0,
            streak: prog.streak || 0,
            day: prog.day || 1,
            completionPercent: prog.completionPercent || 0,
            currentStage: prog.currentStage || 'Foundation',
            completedLessons: prog.completedLessons || [],
            totalLessons: prog.totalLessons || 365,
            remainingLessons: (prog.totalLessons || 365) - (prog.completedLessons || []).length
        };
    },

    getXP: function() {
        var prog = this.getProgress();
        return prog.xp || 0;
    },

    getLevel: function() {
        var prog = this.getProgress();
        return prog.level || 1;
    },

    getDay: function() {
        var prog = this.getProgress();
        return prog.day || 1;
    },

    getStreak: function() {
        var prog = this.getProgress();
        return prog.streak || 0;
    },

    getCompletionPercent: function() {
        var prog = this.getProgress();
        return prog.completionPercent || 0;
    },

    getCurrentStage: function() {
        var prog = this.getProgress();
        return prog.currentStage || 'Foundation';
    },

    getCompletedLessons: function() {
        var prog = this.getProgress();
        return prog.completedLessons || [];
    },

    getRemainingLessons: function() {
        var prog = this.getProgress();
        var total = prog.totalLessons || 365;
        var completed = (prog.completedLessons || []).length;
        return Math.max(0, total - completed);
    },

    isLessonCompleted: function(lessonId) {
        var prog = this.getProgress();
        return (prog.completedLessons || []).indexOf(lessonId) !== -1;
    },

    // ============================================================
    // 更新方法
    // ============================================================
    setXP: function(totalXP) {
        var prog = this.getProgress();
        prog.xp = typeof totalXP === 'number' ? totalXP : 0;
        return this.saveProgress(prog);
    },

    completeLesson: function(lessonId) {
        console.log('📚 ProgressEngine completing lesson:', lessonId);

        try {
            var prog = this.getProgress();
            if (!prog.completedLessons) prog.completedLessons = [];
            if (prog.completedLessons.indexOf(lessonId) !== -1) {
                console.log('📚 Lesson already completed:', lessonId);
                return prog;
            }

            // 1. 更新完成列表
            prog.completedLessons.push(lessonId);
            var total = prog.totalLessons || 365;
            prog.completionPercent = Math.min(100, Math.round((prog.completedLessons.length / total) * 100));

            // 2. 更新 Day
            prog.day = Math.min(total, prog.completedLessons.length + 1);

            // 3. 更新等级（每 10 节课升一级）
            prog.level = Math.max(1, Math.floor(prog.completedLessons.length / 10) + 1);

            // 4. 更新连续签到
            var today = new Date().toDateString();
            if (prog.lastActive !== today) {
                if (prog.lastActive) {
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (prog.lastActive === yesterday.toDateString()) {
                        prog.streak = (prog.streak || 0) + 1;
                    } else {
                        prog.streak = 1;
                    }
                } else {
                    prog.streak = 1;
                }
                prog.lastActive = today;
            }

            // 5. 更新 XP
            var bonus = (prog.streak || 0) >= 7 ? 5 : 0;
            var xpGain = 20 + bonus;
            prog.xp = (prog.xp || 0) + xpGain;

            // 6. 更新阶段
            if (prog.day <= 30) prog.currentStage = 'Foundation';
            else if (prog.day <= 70) prog.currentStage = 'Prompt Engineering';
            else if (prog.day <= 120) prog.currentStage = 'AI Tools';
            else if (prog.day <= 220) prog.currentStage = 'AI Development';
            else if (prog.day <= 300) prog.currentStage = 'Projects';
            else prog.currentStage = 'AI Business';

            // 7. 保存
            this.saveProgress(prog);

            // 8. 触发事件
            this._safeEmit('LessonCompleted', { lessonId: lessonId, xpGain: xpGain });
            this._safeEmit('ProgressUpdated', { lessonId: lessonId, progress: prog });

            console.log('✅ Lesson completed! XP gained:', xpGain, 'Total XP:', prog.xp);
            return prog;

        } catch (err) {
            console.error('❌ ProgressEngine.completeLesson failed:', err);
            return null;
        }
    },

    resetProgress: function() {
        this._safeSet(this._storageKey, null);
        console.log('🔄 Progress reset');
        return this.defaultProgress();
    },

    // ============================================================
    // 迁移 API
    // ============================================================
    migrateProgress: function() {
        return this._checkAndMigrate();
    },

    // ============================================================
    // STATUS
    // ============================================================
    getStatus: function() {
        var prog = this.getProgress();
        var version = prog._schemaVersion || 'unknown';
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            initialized: this.initialized,
            schemaVersion: version,
            totalLessons: prog.totalLessons || 365,
            completedLessons: (prog.completedLessons || []).length,
            xp: prog.xp || 0,
            level: prog.level || 1,
            streak: prog.streak || 0,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }
};

// ===========================================
// 自动初始化
// ===========================================
setTimeout(function() {
    try {
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.init === 'function') {
            LawAIApp.ProgressEngine.init();
            console.log('✅ ProgressEngine auto-initialized');
        }
    } catch (err) {
        console.warn('⚠️ ProgressEngine auto-init failed:', err);
    }
}, 100);

console.log('📊 ProgressEngine V2.1 ready');
