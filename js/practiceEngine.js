// ===========================================
// practiceEngine.js
// 练习引擎 - 知识转化为技能（Phase 23 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.PracticeEngine = (function() {
    var _initialized = false;
    var _history = [];

    // ===========================================
    // 生成练习
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

        var title = lesson?.title || lessonId || 'Lesson';
        var category = lesson?.category || 'General';

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
            LawAIApp.EventBus?.emit?.('PracticeStarted', { practice: practice });
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
            // 对于开放式问题，长度>5视为合理尝试
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
        
        // 保存到存储
        try {
            var stored = LawAIApp.StorageEngine?.get?.('practice_history') || [];
            stored.push(record);
            LawAIApp.StorageEngine?.set?.('practice_history', stored);
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
            // 更新 MasteryEngine（如果存在）
            if (LawAIApp.MasteryEngine && typeof LawAIApp.MasteryEngine.updateSkill === 'function') {
                var progressGain = isCorrect ? 10 : 3;
                var confidenceGain = isCorrect ? 15 : 5;
                LawAIApp.MasteryEngine.updateSkill(skillName, progressGain, confidenceGain);
            }
        } catch (e) {}

        LawAIApp.EventBus?.emit?.('PracticeCompleted', { practice: practice, feedback: feedback, correct: isCorrect });
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
            var stored = LawAIApp.StorageEngine?.get?.('practice_history') || [];
            return stored.filter(function(r) { return r.lessonId === lessonId; });
        } catch (e) {
            return [];
        }
    }

    function getRecent(limit) {
        limit = limit || 10;
        try {
            var stored = LawAIApp.StorageEngine?.get?.('practice_history') || [];
            return stored.slice(-limit).reverse();
        } catch (e) {
            return _history.slice(-limit).reverse();
        }
    }

    function getAllHistory() {
        try {
            return LawAIApp.StorageEngine?.get?.('practice_history') || _history;
        } catch (e) {
            return _history;
        }
    }

    // ===========================================
    // 交互式练习（Season 4）
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
    // 初始化
    // ===========================================
    function init() {
        if (_initialized) return;
        _initialized = true;
        console.log('✏️ PracticeEngine initialized');
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
        generateInteractivePractice: generateInteractivePractice,
        checkAnswer: checkAnswer
    };
})();

console.log('✏️ PracticeEngine V2.0 ready');
