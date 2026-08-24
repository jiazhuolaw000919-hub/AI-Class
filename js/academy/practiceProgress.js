// ===========================================
// practiceProgress.js
// Practice Progress — S4 集成版 (Part 33)
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PracticeProgress = {
    _key: 'practice_progress',

    /**
     * 获取存储的进度
     */
    _getStore: function() {
        return LawAIApp.StorageEngine?.get(this._key, {}) || {};
    },

    /**
     * 保存进度
     */
    _saveStore: function(store) {
        LawAIApp.StorageEngine?.set(this._key, store);
    },

    /**
     * 获取某个 Lesson 的 Practice 进度
     * @param {string} lessonId - Lesson ID
     * @returns {Object} 进度对象
     */
    getProgress: function(lessonId) {
        var store = this._getStore();
        return store[lessonId] || {
            lessonId: lessonId,
            attempted: 0,
            correct: 0,
            completed: false,
            lastAttempt: null,
            questions: {}
        };
    },

    /**
     * 更新 Practice 进度
     * @param {string} lessonId - Lesson ID
     * @param {Object} update - 更新内容
     */
    updateProgress: function(lessonId, update) {
        var store = this._getStore();
        var current = store[lessonId] || {
            lessonId: lessonId,
            attempted: 0,
            correct: 0,
            completed: false,
            lastAttempt: null,
            questions: {}
        };

        for (var key in update) {
            if (update.hasOwnProperty(key)) {
                current[key] = update[key];
            }
        }
        current.lastAttempt = new Date().toISOString();

        store[lessonId] = current;
        this._saveStore(store);
        return current;
    },

    /**
     * 记录一次 Practice 尝试
     * @param {string} lessonId - Lesson ID
     * @param {string} questionId - 问题 ID
     * @param {boolean} isCorrect - 是否正确
     */
    recordAttempt: function(lessonId, questionId, isCorrect) {
        var store = this._getStore();
        var current = store[lessonId] || {
            lessonId: lessonId,
            attempted: 0,
            correct: 0,
            completed: false,
            lastAttempt: null,
            questions: {}
        };

        current.attempted += 1;
        if (isCorrect) current.correct += 1;
        current.lastAttempt = new Date().toISOString();

        if (!current.questions) current.questions = {};
        current.questions[questionId] = {
            correct: isCorrect,
            attemptedAt: new Date().toISOString()
        };

        store[lessonId] = current;
        this._saveStore(store);
        return current;
    },

    /**
     * 检查某个 Lesson 的 Practice 是否完成
     * @param {string} lessonId - Lesson ID
     * @param {number} totalQuestions - 总问题数（可选）
     * @returns {boolean} 是否完成
     */
    isCompleted: function(lessonId, totalQuestions) {
        var progress = this.getProgress(lessonId);
        if (totalQuestions) {
            return progress.completed || (progress.attempted >= totalQuestions);
        }
        return progress.completed || false;
    },

    /**
     * 获取某个 Lesson 的 Practice 准确率
     * @param {string} lessonId - Lesson ID
     * @returns {number} 准确率 (0-100)
     */
    getAccuracy: function(lessonId) {
        var progress = this.getProgress(lessonId);
        if (progress.attempted === 0) return 0;
        return Math.round((progress.correct / progress.attempted) * 100);
    },

    /**
     * 标记 Lesson 的 Practice 为完成
     * @param {string} lessonId - Lesson ID
     */
    markCompleted: function(lessonId) {
        return this.updateProgress(lessonId, { completed: true });
    },

    /**
     * 获取所有 Practice 进度
     * @returns {Object} 所有进度
     */
    getAllProgress: function() {
        return this._getStore();
    },

    /**
     * 获取 Practice 统计
     * @returns {Object} 统计信息
     */
    getStats: function() {
        var store = this._getStore();
        var totalLessons = 0;
        var totalAttempts = 0;
        var totalCorrect = 0;
        var completedLessons = 0;

        for (var lessonId in store) {
            if (store.hasOwnProperty(lessonId)) {
                var progress = store[lessonId];
                totalLessons++;
                totalAttempts += progress.attempted || 0;
                totalCorrect += progress.correct || 0;
                if (progress.completed) completedLessons++;
            }
        }

        return {
            totalLessons: totalLessons,
            totalAttempts: totalAttempts,
            totalCorrect: totalCorrect,
            completedLessons: completedLessons,
            overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0
        };
    },

    /**
     * 清空所有 Practice 进度
     */
    clearAll: function() {
        LawAIApp.StorageEngine?.remove(this._key);
    }
};

console.log('📊 PracticeProgress (S4) loaded');
