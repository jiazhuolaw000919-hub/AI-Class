// practiceEvaluator.js
// ============================================================
// ⚠️ DEPRECATED — Season 5 Part 4
// ============================================================
// 此文件使用 Math.random() 判断对错，绝不可用于生产环境。
// 唯一权威：js/experience/renderers/practiceRenderer.js 的 _evaluate()
// 保留仅为兼容，若 2 周内无调用，可安全删除。
// ============================================================
LawAIApp.PracticeEvaluator = {
  // 模拟评估用户答案（未来可扩展真实评分）
  evaluate(practice, userAnswer) {
    // 如果实践带有正确答案，则对比；否则总是给予部分正确
    const isCorrect = practice.answer ? (userAnswer.trim().toLowerCase() === practice.answer.trim().toLowerCase()) : Math.random() > 0.3;
    const feedback = {
      correct: isCorrect,
      explanation: isCorrect ? 'Great job! You demonstrated understanding.' : 'Not quite. Review the lesson summary and try again.',
      hints: isCorrect ? [] : ['Re-read the key points', 'Check the official resource'],
      improvement: isCorrect ? 'None' : 'Focus on the core concept',
      relatedLessons: practice.relatedLessons || []
    };
    return feedback;
  }
  if (window.LawAIApp?.Debug?.warnDeprecated !== false) {
    console.warn('[DEPRECATED] PracticeEvaluator 已被 PracticeRenderer._evaluate 取代。请勿调用。');
  }
};
