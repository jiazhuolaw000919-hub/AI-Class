// ================================================================
// ENGINE: PracticeEngine
// LAYER: Core Logic Layer
// DOMAIN: Practice & Skill Development
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.1.0
// ================================================================
//
// DATA CANON COMPLIANCE
// ================================================================
//   - Schema Version: 1.0.0
//   - Migration Support: Yes
//   - Export/Import: Via StorageEngine
//
// ... (其余元数据注释保持不变)
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PracticeEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'PracticeEngine';
    var _engineVersion = '2.1.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Practice & Skill Development';
    var _schemaVersion = '1.0.0';
    var _storageKey = 'practice_history';

    var _initialized = false;
    var _history = [];

    // ===========================================
    // 历史存储（带 Schema 版本）
    // ===========================================
    function _loadHistory() {
        try {
            var stored = LawAIApp.StorageEngine?.get?.(_storageKey);
            if (Array.isArray(stored)) {
                _history = stored;
                return stored;
            }
            // 检查是否有 schema 版本元数据
            if (stored && stored._schemaVersion) {
                console.log('📝 PracticeEngine: Schema version ' + stored._schemaVersion);
                var data = stored.data || [];
                _history = data;
                return data;
            }
            _history = [];
            return [];
        } catch (e) {
            _history = [];
            return [];
        }
    }

    function _saveHistory() {
        try {
            var toSave = {
                _schemaVersion: _schemaVersion,
                data: _history,
                updatedAt: new Date().toISOString()
            };
            LawAIApp.StorageEngine?.set?.(_storageKey, toSave);
        } catch (e) {}
    }

    // ===========================================
    // 完成练习
    // ===========================================
    function completePractice(practice, userAnswer) {
        if (!practice) return null;
        
        var isCorrect = false;
        var feedback = 'Practice recorded.';

        if (practice.type === 'multiple_choice' && practice.correctIndex !== null) {
            isCorrect = (userAnswer === practice.correctIndex || 
                        parseInt(userAnswer) === practice.correctIndex);
            feedback = isCorrect ? '✅ Correct! Great job!' : '❌ Not quite. Review the lesson and try again.';
        } else if (userAnswer && userAnswer.length > 5) {
            isCorrect = true;
            feedback = '✅ Good effort! Your answer has been recorded.';
        } else {
            feedback = '📝 Practice recorded. Try to provide more detail next time.';
        }

        var record = {
            lessonId: practice.lessonId,
            practiceId: practice.practiceId,
            type: practice.type,
            difficulty: practice.difficulty,
            correct: isCorrect,
            userAnswer: userAnswer,
            feedback: feedback,
            completedAt: new Date().toISOString()
        };
        
        _loadHistory();
        _history.push(record);
        _saveHistory();

        // 更新技能掌握度...
        // (其余代码保持不变)

        LawAIApp.EventBus?.emit?.('PracticeCompleted', { practice: practice, feedback: feedback, correct: isCorrect });
        return { correct: isCorrect, feedback: feedback };
    }

    // ... 其余方法保持不变（getRecommendedType, getHistoryByLesson, getRecent, getAllHistory, generateInteractivePractice, checkAnswer, getMastery）...

    // ===========================================
    // ENGINE STATUS
    // ===========================================
    function getStatus() {
        _loadHistory();
        var totalPractices = _history.length;
        var correctPractices = 0;
        _history.forEach(function(r) {
            if (r.correct) correctPractices++;
        });
        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            schemaVersion: _schemaVersion,
            totalPractices: totalPractices,
            correctPractices: correctPractices,
            accuracy: totalPractices > 0 ? Math.round((correctPractices / totalPractices) * 100) : 0,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        _loadHistory();
        console.log('✏️ PracticeEngine v' + _engineVersion + ' initialized');
    }

    setTimeout(init, 300);

    return {
        init: init,
        startPractice: startPractice,
        completePractice: completePractice,
        getRecommendedType: getRecommendedType,
        getMastery: getMastery,
        getRecent: getRecent,
        getHistory: getAllHistory,
        getHistoryByLesson: getHistoryByLesson,
        generateInteractivePractice: generateInteractivePractice,
        checkAnswer: checkAnswer,
        getStatus: getStatus
    };
})();

console.log('✏️ PracticeEngine V2.1 ready');
