// ===========================================
// practiceEngine.js
// 练习引擎 - 知识转化为技能（Phase 23 完善版）
// ===========================================
// ================================================================
// ENGINE: PracticeEngine
// LAYER: Core Logic Layer
// DOMAIN: Practice & Skill Development
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 2.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Transforms knowledge into skill through practice exercises,
//   challenges, and real-world tasks. Tracks mastery and provides
//   adaptive difficulty. Implements the "Practice" phase of the
//   Learning Loop.
//
// PUBLIC API
// ================================================================
//   init()                                      -> void
//   startPractice(lessonId, type)               -> Practice object
//   completePractice(practice, userAnswer)      -> Result object
//   getRecommendedType(lessonId)                -> string
//   getHistoryByLesson(lessonId)                -> array
//   getRecent(limit)                            -> array
//   getAllHistory()                             -> array
//   getMastery()                                -> object
//   generateInteractivePractice(lessonTitle, type) -> Practice object
//   checkAnswer(practice, selectedIndex)        -> Result object
//   getStatus()                                 -> Status object
//   getPracticeDiagnostics()                    -> Diagnostics object
//   loadPracticeFromLesson(lessonId)            -> Promise<Array>
//   startS4Practice(lessonId, type)             -> Promise<Practice>
//   submitS4Answer(practice, userAnswer, index) -> Result object
//   getS4PracticeStatus(practice)               -> Status object
//
// PRACTICE TYPES
// ================================================================
//   - mini_exercise     : Short practice exercise
//   - scenario_challenge : Scenario-based challenge
//   - real_world_task   : Real-world application task
//   - case_study        : Case study analysis
//   - multiple_choice   : Multiple choice question
//   - fill_blank        : Fill in the blank
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For emitting events
//   - LessonEngine (optional) : For lesson data
//
// STORAGE
// ================================================================
//   - Key: 'lawai_practice_history'
//   - Format: JSON array of practice records
//   - Schema: { lessonId, practiceId, type, difficulty, correct, userAnswer, feedback, completedAt }
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'PracticeStarted'    : When a practice session starts
//     Payload: { practice }
//   - 'PracticeCompleted'  : When a practice session completes
//     Payload: { practice, feedback, correct }
//
// FUTURE COMPATIBILITY
// ================================================================
//   - New practice types can be added
//   - Difficulty can be made adaptive
//   - Mastery tracking can be per-skill
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PracticeEngine = (function() {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    var _engineName = 'PracticeEngine';
    var _engineVersion = '2.0.0';
    var _recoveryStatus = '🟢 Canon Locked';
    var _layer = 'Core Logic Layer';
    var _domain = 'Practice & Skill Development';

    var _initialized = false;
    var _history = [];

    // ===========================================
    // 生成练习（内部函数）
    // ===========================================
    function generatePractice(lessonId, type) {
        type = type || 'mini_exercise';
        var lesson = null;
        
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                }
            }
        } catch (e) {}

        var title = (lesson && lesson.title) || lessonId || 'Lesson';
        var category = (lesson && lesson.category) || 'General';

        var practiceTypes = {
            'mini_exercise': 'Practice: Summarize the key point of "' + title + '" in one sentence.',
            'scenario_challenge': 'Challenge: How would you apply ' + category + ' in a real project?',
            'real_world_task': 'Task: Use ' + category + ' to solve a problem you encounter daily.',
            'case_study': 'Case Study: Analyze a business problem using ' + category + '.',
            'multiple_choice': 'What is the main concept of "' + title + '"?',
            'fill_blank': 'Complete the sentence: ' + category + ' is important because _______.'
        };

        var description = practiceTypes[type] || practiceTypes['mini_exercise'];
        var isMultipleChoice = (type === 'multiple_choice');

        return {
            practiceId: 'practice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            lessonId: lessonId,
            type: type,
            difficulty: 'medium',
            description: description,
            options: isMultipleChoice ? [
                'Option A: Correct explanation of ' + category,
                'Option B: Incorrect explanation',
                'Option C: Partially correct explanation',
                'Option D: Completely unrelated explanation'
            ] : null,
            correctIndex: isMultipleChoice ? 0 : null,
            answer: null,
            relatedLessons: [lessonId],
            createdAt: new Date().toISOString()
        };
    }

    // ===========================================
    // 开始练习
    // ===========================================
    function startPractice(lessonId, type) {
        var practice = generatePractice(lessonId, type);
        if (practice) {
            var eventBus = window.LawAIApp && window.LawAIApp.EventBus;
            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('PracticeStarted', { practice: practice });
            }
        }
        return practice;
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

        // 保存历史
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
        _history.push(record);
        
        try {
            var stored = window.LawAIApp && LawAIApp.StorageEngine && LawAIApp.StorageEngine.get('practice_history') || [];
            stored.push(record);
            if (window.LawAIApp && LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set('practice_history', stored);
            }
        } catch (e) {}

        // 更新技能掌握度
        try {
            var skillName = 'General';
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(practice.lessonId.replace('day-', ''));
                if (!isNaN(day)) {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                    if (lesson && lesson.category) skillName = lesson.category;
                }
            }
            if (LawAIApp.MasteryEngine && typeof LawAIApp.MasteryEngine.updateSkill === 'function') {
                var progressGain = isCorrect ? 10 : 3;
                var confidenceGain = isCorrect ? 15 : 5;
                LawAIApp.MasteryEngine.updateSkill(skillName, progressGain, confidenceGain);
            }
        } catch (e) {}

        var eventBus = window.LawAIApp && window.LawAIApp.EventBus;
        if (eventBus && typeof eventBus.emit === 'function') {
            eventBus.emit('PracticeCompleted', { practice: practice, feedback: feedback, correct: isCorrect });
        }
        return { correct: isCorrect, feedback: feedback };
    }

    // ===========================================
    // 获取推荐
    // ===========================================
    function getRecommendedType(lessonId) {
        try {
            var history = getHistoryByLesson(lessonId);
            if (history.length === 0) return 'mini_exercise';
            var lastCorrect = history[history.length - 1].correct;
            return lastCorrect ? 'scenario_challenge' : 'mini_exercise';
        } catch (e) {
            return 'mini_exercise';
        }
    }

    function getHistoryByLesson(lessonId) {
        try {
            var stored = window.LawAIApp && LawAIApp.StorageEngine && LawAIApp.StorageEngine.get('practice_history') || [];
            return stored.filter(function(r) { return r.lessonId === lessonId; });
        } catch (e) {
            return [];
        }
    }

    function getRecent(limit) {
        limit = limit || 10;
        try {
            var stored = window.LawAIApp && LawAIApp.StorageEngine && LawAIApp.StorageEngine.get('practice_history') || [];
            return stored.slice(-limit).reverse();
        } catch (e) {
            return _history.slice(-limit).reverse();
        }
    }

    function getAllHistory() {
        try {
            return window.LawAIApp && LawAIApp.StorageEngine && LawAIApp.StorageEngine.get('practice_history') || _history;
        } catch (e) {
            return _history;
        }
    }

    // ===========================================
    // 交互式练习
    // ===========================================
    function generateInteractivePractice(lessonTitle, type) {
        type = type || 'multiple_choice';
        return {
            type: type,
            question: 'What is the main concept of "' + lessonTitle + '"?',
            options: type === 'multiple_choice' ? [
                'Option A: Correct answer',
                'Option B: Incorrect answer',
                'Option C: Incorrect answer',
                'Option D: Incorrect answer'
            ] : null,
            correctIndex: 0,
            explanation: 'This is the correct answer because it aligns with the core concept.'
        };
    }

    function checkAnswer(practice, selectedIndex) {
        if (!practice) return { isCorrect: false, explanation: 'Invalid practice' };
        var isCorrect = selectedIndex === practice.correctIndex;
        return {
            isCorrect: isCorrect,
            explanation: practice.explanation || (isCorrect ? 'Great job!' : 'Not quite. Review the lesson and try again.'),
            feedback: isCorrect ? '✅ Correct!' : '❌ Not quite right.'
        };
    }

    // ===========================================
    // 掌握度
    // ===========================================
    function getMastery() {
        var history = getAllHistory();
        var mastery = {};
        history.forEach(function(r) {
            var key = r.lessonId || 'general';
            if (!mastery[key]) mastery[key] = { correct: 0, total: 0 };
            mastery[key].total++;
            if (r.correct) mastery[key].correct++;
        });
        return mastery;
    }

    // ===========================================
    // 诊断
    // ===========================================
    function getPracticeDiagnostics() {
        var history = getAllHistory();
        var total = history.length;
        var correct = 0;
        var byType = {};

        for (var i = 0; i < history.length; i++) {
            var record = history[i];
            if (record.correct) correct++;
            var type = record.type || 'unknown';
            if (!byType[type]) byType[type] = { total: 0, correct: 0 };
            byType[type].total++;
            if (record.correct) byType[type].correct++;
        }

        return {
            totalPractices: total,
            correctPractices: correct,
            accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
            byType: byType,
            recent: history.slice(-5).reverse()
        };
    }

    // ===========================================
    // ENGINE STATUS
    // ===========================================
    function getStatus() {
        var history = getAllHistory();
        var totalPractices = history.length;
        var correctPractices = 0;
        history.forEach(function(r) {
            if (r.correct) correctPractices++;
        });
        return {
            name: _engineName,
            version: _engineVersion,
            recoveryStatus: _recoveryStatus,
            layer: _layer,
            domain: _domain,
            initialized: _initialized,
            totalPractices: totalPractices,
            correctPractices: correctPractices,
            accuracy: totalPractices > 0 ? Math.round((correctPractices / totalPractices) * 100) : 0,
            storageAvailable: !!(window.LawAIApp && LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function'),
            eventBusAvailable: !!(window.LawAIApp && LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function')
        };
    }

    // ===========================================
    // ═══ S4 集成方法 (Part 33) ═══
    // ===========================================

    /**
     * 从 S4 Lesson 加载 Practice 问题
     * @param {string} lessonId - S4 Lesson ID
     * @returns {Promise<Array>} Practice 问题列表
     */
    function loadPracticeFromLesson(lessonId) {
        return new Promise(function(resolve) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            if (!loader) {
                console.warn('[PracticeEngine] ContentLoader not available');
                resolve([]);
                return;
            }
            try {
                var result = loader.getPracticeQuestions(lessonId);
                if (result && typeof result.then === 'function') {
                    result.then(function(practiceData) {
                        if (practiceData && practiceData.enabled) {
                            resolve(practiceData.questions || []);
                        } else {
                            resolve([]);
                        }
                    }).catch(function(e) {
                        console.warn('[PracticeEngine] Failed to load practice from lesson:', lessonId, e);
                        resolve([]);
                    });
                } else {
                    resolve([]);
                }
            } catch (e) {
                console.warn('[PracticeEngine] Error loading practice from lesson:', lessonId, e);
                resolve([]);
            }
        });
    }

    /**
     * 开始 S4 Lesson 的 Practice 会话
     * @param {string} lessonId - S4 Lesson ID
     * @param {string} type - Practice 类型
     * @returns {Promise<Object>} Practice 会话对象
     */
    function startS4Practice(lessonId, type) {
        type = type || 'mixed';
        return loadPracticeFromLesson(lessonId).then(function(questions) {
            if (!questions || questions.length === 0) {
                return startPractice(lessonId, type);
            }

            var practice = {
                practiceId: 'practice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                lessonId: lessonId,
                type: type,
                difficulty: 'mixed',
                questions: questions,
                currentQuestionIndex: 0,
                answers: [],
                startedAt: new Date().toISOString(),
                completed: false,
                score: 0,
                totalQuestions: questions.length
            };

            var eventBus = window.LawAIApp && window.LawAIApp.EventBus;
            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('PracticeStarted', { practice: practice });
            }
            return practice;
        });
    }

    /**
     * 提交 S4 Practice 答案
     * @param {Object} practice - Practice 会话对象
     * @param {number|string} userAnswer - 用户答案
     * @param {number} questionIndex - 问题索引
     * @returns {Object} 反馈结果
     */
    function submitS4Answer(practice, userAnswer, questionIndex) {
        if (!practice || !practice.questions) {
            return { correct: false, feedback: 'Practice session invalid.' };
        }

        var index = questionIndex !== undefined ? questionIndex : practice.currentQuestionIndex;
        var question = practice.questions[index];
        if (!question) {
            return { correct: false, feedback: 'Question not found.' };
        }

        var isCorrect = false;
        var explanation = '';

        if (question.type === 'multiple-choice' || question.type === 'multipleChoice') {
            var selected = parseInt(userAnswer);
            isCorrect = (selected === question.answer);
            explanation = question.explanation || (isCorrect ? 'Correct!' : 'Not quite. Review the explanation.');
        } else if (question.type === 'short-answer' || question.type === 'shortAnswer') {
            var userText = String(userAnswer).trim().toLowerCase();
            var accepted = question.acceptedAnswers || [];
            var exactMatch = (userText === String(question.answer || '').trim().toLowerCase());
            var acceptedMatch = accepted.some(function(a) {
                return userText === String(a).trim().toLowerCase();
            });
            isCorrect = exactMatch || acceptedMatch || userText.length > 10;
            explanation = question.explanation || (isCorrect ? 'Good answer!' : 'Review the concept and try again.');
        } else {
            isCorrect = true;
            explanation = 'Practice recorded.';
        }

        if (!practice.answers) practice.answers = [];
        practice.answers[index] = {
            questionId: question.id,
            userAnswer: userAnswer,
            correct: isCorrect,
            timestamp: new Date().toISOString()
        };

        var correctCount = 0;
        for (var i = 0; i < practice.answers.length; i++) {
            if (practice.answers[i] && practice.answers[i].correct) correctCount++;
        }
        practice.score = correctCount;
        practice.currentQuestionIndex = index + 1;

        if (practice.currentQuestionIndex >= practice.totalQuestions) {
            practice.completed = true;
            practice.completedAt = new Date().toISOString();
            var eventBus = window.LawAIApp && window.LawAIApp.EventBus;
            if (eventBus && typeof eventBus.emit === 'function') {
                eventBus.emit('PracticeCompleted', {
                    practice: practice,
                    score: practice.score,
                    total: practice.totalQuestions
                });
            }
        }

        return {
            correct: isCorrect,
            explanation: explanation,
            isComplete: practice.completed,
            score: practice.score,
            total: practice.totalQuestions,
            nextIndex: practice.currentQuestionIndex
        };
    }

    /**
     * 获取 S4 Practice 状态
     * @param {Object} practice - Practice 会话对象
     * @returns {Object} 状态信息
     */
    function getS4PracticeStatus(practice) {
        if (!practice) {
            return { exists: false, progress: 0, completed: false };
        }
        return {
            exists: true,
            progress: practice.totalQuestions > 0 ? 
                Math.round((practice.currentQuestionIndex / practice.totalQuestions) * 100) : 0,
            completed: practice.completed || false,
            score: practice.score || 0,
            total: practice.totalQuestions || 0,
            currentIndex: practice.currentQuestionIndex || 0
        };
    }

    // ===========================================
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        console.log('✏️ PracticeEngine initialized');
    }

    // 延迟初始化
    setTimeout(init, 300);

    // ===========================================
    // PUBLIC API
    // ===========================================
    return {
        init: init,
        startPractice: startPractice,
        completePractice: completePractice,
        getRecommendedType: getRecommendedType,
        getHistoryByLesson: getHistoryByLesson,
        getRecent: getRecent,
        getHistory: getAllHistory,
        getAllHistory: getAllHistory,
        getMastery: getMastery,
        generateInteractivePractice: generateInteractivePractice,
        checkAnswer: checkAnswer,
        getStatus: getStatus,
        getPracticeDiagnostics: getPracticeDiagnostics,
        // S4 方法
        loadPracticeFromLesson: loadPracticeFromLesson,
        startS4Practice: startS4Practice,
        submitS4Answer: submitS4Answer,
        getS4PracticeStatus: getS4PracticeStatus
    };
})();

console.log('✏️ PracticeEngine V2.0 ready');
