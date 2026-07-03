// quizAnalytics.js
LawAIApp.QuizAnalytics = {
  generateFakeResult(moduleId) {
    return {
      moduleName: "Introduction to AI",
      courseName: "AI Fundamentals",
      score: 85,
      totalQuestions: 10,
      correct: 8,
      incorrect: 2,
      xpEarned: 120,
      timeTaken: "4m 32s",
      recentScores: [70, 80, 85, 90, 75, 85],
      topicAccuracy: [
        { topic: "AI Definition", accuracy: 90 },
        { topic: "AI vs Automation", accuracy: 75 },
        { topic: "AI History", accuracy: 60 }
      ],
      confidence: {
        correctConfident: 5,
        correctGuessing: 3,
        incorrect: 2,
        highConfidenceWrong: 0
      },
      questionTypes: [
        { type: "Multiple Choice", count: 6 },
        { type: "True/False", count: 2 },
        { type: "Scenario", count: 2 }
      ],
      heatmap: [
        { question: "Q1", status: "correct" },
        { question: "Q2", status: "correct" },
        { question: "Q3", status: "guessed" },
        { question: "Q4", status: "correct" },
        { question: "Q5", status: "incorrect" },
        { question: "Q6", status: "correct" },
        { question: "Q7", status: "guessed" },
        { question: "Q8", status: "correct" },
        { question: "Q9", status: "incorrect" },
        { question: "Q10", status: "correct" }
      ],
      strengths: ["AI Definition", "Real-world examples"],
      weaknesses: ["AI History", "Automation differences"],
      mentorInsight: {
        summary: "Great progress! You're strong in definitions but could improve on history and distinctions.",
        pattern: "You tend to guess on scenario questions.",
        suggestedPractice: "Review AI vs Automation",
        recommendedLesson: "History of AI",
        futureGoal: "Achieve 90%+ accuracy in the next quiz"
      }
    };
  }
};
