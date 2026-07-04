// ===========================================
// practiceEngine.js (Season 4 Chapter 5 升级版)
// 保留原有所有功能，新增：多种交互式练习类型、答案验证、XP奖励集成
// ===========================================
LawAIApp.PracticeEngine = (function() {
  // ========== 原有功能完整保留 ==========
  function generatePractice(lessonId, type = 'mini_exercise') {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return null;

    const difficulty = LawAIApp.DifficultyManager.getCurrentLevel();
    let taskDescription = '';
    let practiceType = type;

    switch (type) {
      case 'mini_exercise':
        taskDescription = `Practice: Summarize the key point of "${lesson.title}" in one sentence.`;
        break;
      case 'scenario_challenge':
        taskDescription = `Challenge: How would you apply ${lesson.category} in a real project?`;
        break;
      case 'real_world_task':
        taskDescription = `Task: Use ${lesson.category} to solve a problem you encounter daily.`;
        break;
      case 'case_study':
        taskDescription = `Case Study: Analyze a business problem using ${lesson.category}.`;
        break;
      case 'multiple_choice':
        practiceType = 'multiple_choice';
        taskDescription = `What is the main concept of "${lesson.title}"?`;
        break;
      case 'fill_blank':
        practiceType = 'fill_blank';
        taskDescription = `Complete the sentence: ${lesson.category} is important because _______.`;
        break;
      default:
        taskDescription = `Practice: Reflect on ${lesson.title}.`;
    }

    // 如果是选择题类型，生成选项
    let options = null;
    let correctIndex = null;
    if (practiceType === 'multiple_choice') {
      options = [
        `Option A: Correct explanation of ${lesson.category}`,
        `Option B: Incorrect explanation`,
        `Option C: Partially correct explanation`,
        `Option D: Completely unrelated explanation`
      ];
      correctIndex = 0;
    }

    return {
      practiceId: 'practice_' + Date.now(),
      lessonId: lesson.lessonId,
      type: practiceType,
      difficulty,
      description: taskDescription,
      options,        // 新增：选择题选项
      correctIndex,   // 新增：正确答案索引
      answer: null,
      relatedLessons: [lesson.lessonId],
      createdAt: new Date().toISOString()
    };
  }

  function startPractice(lessonId, type) {
    const practice = generatePractice(lessonId, type);
    if (practice) {
      LawAIApp.EventBus.emit('PracticeStarted', { practice });
    }
    return practice;
  }

  function completePractice(practice, userAnswer) {
    const feedback = LawAIApp.PracticeEvaluator.evaluate(practice, userAnswer);
    LawAIApp.PracticeHistory.add({
      lessonId: practice.lessonId,
      type: practice.type,
      difficulty: practice.difficulty,
      correct: feedback.correct,
      userAnswer: userAnswer,
      feedback: feedback
    });

    const skillName = LawAIApp.LessonEngine.getLessonByDay(parseInt(practice.lessonId.split('-')[1]))?.category || 'General';
    const progressGain = feedback.correct ? 10 : 3;
    const confidenceGain = feedback.correct ? 15 : 5;
    LawAIApp.MasteryEngine.updateSkill(skillName, progressGain, confidenceGain);

    const newDifficulty = LawAIApp.DifficultyManager.adjustDifficulty(practice.difficulty, practice.lessonId);
    LawAIApp.DifficultyManager.setCurrentLevel(newDifficulty);

    // ========== 新增：Season 4 功能 — 发放 XP 奖励 ==========
    if (feedback.correct && LawAIApp.XPRewardEngine) {
      const user = LawAIApp.AuthService?.getCurrentUser();
      if (user) {
        LawAIApp.XPRewardEngine.awardChallengeXP(user.id, 10); // 练习完成奖励10 XP
      }
    }

    LawAIApp.EventBus.emit('PracticeCompleted', { practice, feedback });
    return feedback;
  }

  function getRecommendedType(lessonId) {
    const history = LawAIApp.PracticeHistory.getByLesson(lessonId);
    if (history.length === 0) return 'mini_exercise';
    const lastCorrect = history[history.length - 1].correct;
    return lastCorrect ? 'scenario_challenge' : 'mini_exercise';
  }

  // ========== 新增：Season 4 交互式练习方法 ==========
  function generateInteractivePractice(lessonTitle, type = 'multiple_choice') {
    return {
      type,
      question: `What is the main concept of "${lessonTitle}"?`,
      options: type === 'multiple_choice' ? [
        'Option A: Correct answer',
        'Option B: Incorrect answer',
        'Option C: Incorrect answer',
        'Option D: Incorrect answer'
      ] : null,
      correctIndex: 0,
      explanation: 'This is the correct answer because...'
    };
  }

  function checkAnswer(practice, selectedIndex) {
    const isCorrect = selectedIndex === practice.correctIndex;
    return {
      isCorrect,
      explanation: practice.explanation || '',
      feedback: isCorrect ? 'Great job!' : 'Not quite. Review the lesson and try again.'
    };
  }

  return {
    // 原有方法
    startPractice,
    completePractice,
    getRecommendedType,
    getMastery: () => LawAIApp.MasteryEngine.getAllSkills(),
    getRecent: () => LawAIApp.PracticeHistory.getRecent(),
    // Season 4 新增方法
    generateInteractivePractice,
    checkAnswer
  };
})();
