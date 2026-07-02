// recallEngine.js
LawAIApp.RecallEngine = {
  // 生成主动回忆提示（模拟，未来可由 AI 生成）
  generateRecallPrompt(lessonId) {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return null;
    const prompts = [
      `What is the main concept of "${lesson.title}"? Explain in your own words.`,
      `Can you list three key points from the lesson on ${lesson.category}?`,
      `How would you teach "${lesson.title}" to a beginner?`,
      `What real-world example can you connect to ${lesson.category}?`
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  // 记录一次主动回忆（更新记忆强度）
  recordRecall(lessonId, quality = 'good') {
    let boost = 0;
    if (quality === 'good') boost = 8;
    else if (quality === 'partial') boost = 4;
    else boost = 1;

    const currentStr = LawAIApp.ForgettingCurve.calculateCurrentStrength(lessonId);
    const newStrength = currentStr + boost;
    let newState = 'learning';
    if (newStrength >= 90) newState = 'mastered';
    else if (newStrength >= 70) newState = 'strong';
    else if (newStrength >= 50) newState = 'stable';
    else if (newStrength >= 30) newState = 'weak';
    else newState = 'forgotten';

    LawAIApp.MemoryTracker.updateStrength(lessonId, newStrength, newState);
    LawAIApp.MemoryTracker.recordReview(lessonId);
    LawAIApp.EventBus.emit('RecallCompleted', { lessonId, newStrength });
    return newStrength;
  }
};
