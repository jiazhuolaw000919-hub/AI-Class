// practiceEngine.js
LawAIApp.PracticeEngine = (function() {
  // 生成模拟实践任务（从课程数据中获取或构造）
  function generatePractice(lessonId, type = 'mini_exercise') {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return null;

    const difficulty = LawAIApp.DifficultyManager.getCurrentLevel();
    let taskDescription = '';

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
      default:
        taskDescription = `Practice: Reflect on ${lesson.title}.`;
    }

    return {
      practiceId: 'practice_' + Date.now(),
      lessonId: lesson.lessonId,
      type,
      difficulty,
      description: taskDescription,
      answer: null, // 不预设答案
      relatedLessons: [lesson.lessonId],
      createdAt: new Date().toISOString()
    };
  }

  // 开始一个实践任务
  function startPractice(lessonId, type) {
    const practice = generatePractice(lessonId, type);
    if (practice) {
      LawAIApp.EventBus.emit('PracticeStarted', { practice });
    }
    return practice;
  }

  // 完成实践并评估
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

    // 更新掌握度：根据正确性增加进度
    const skillName = LawAIApp.LessonEngine.getLessonByDay(parseInt(practice.lessonId.split('-')[1]))?.category || 'General';
    const progressGain = feedback.correct ? 10 : 3;
    const confidenceGain = feedback.correct ? 15 : 5;
    LawAIApp.MasteryEngine.updateSkill(skillName, progressGain, confidenceGain);

    // 调整下次难度
    const newDifficulty = LawAIApp.DifficultyManager.adjustDifficulty(practice.difficulty, practice.lessonId);
    LawAIApp.DifficultyManager.setCurrentLevel(newDifficulty);

    LawAIApp.EventBus.emit('PracticeCompleted', { practice, feedback });
    return feedback;
  }

  // 获取某个课程的建议练习类型
  function getRecommendedType(lessonId) {
    const history = LawAIApp.PracticeHistory.getByLesson(lessonId);
    if (history.length === 0) return 'mini_exercise';
    const lastCorrect = history[history.length - 1].correct;
    return lastCorrect ? 'scenario_challenge' : 'mini_exercise';
  }

  return {
    startPractice,
    completePractice,
    getRecommendedType,
    getMastery: () => LawAIApp.MasteryEngine.getAllSkills(),
    getRecent: () => LawAIApp.PracticeHistory.getRecent()
  };
})();
