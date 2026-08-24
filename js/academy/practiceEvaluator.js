// practiceEvaluator.js
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
};
