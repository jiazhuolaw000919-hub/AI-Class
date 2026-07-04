// mentorAgent.js
LawAIApp.MentorAgent = class extends LawAIApp.AgentCore {
  constructor() {
    super('MentorAgent', 'Teaching & guidance');
  }
  init() {
    this.on('LessonCompleted', (data) => {
      this.provideLessonFeedback(data.lessonId);
    });
    this.on('QuizFailed', (data) => {
      this.suggestCorrectiveLesson(data.quizId, data.failedQuestions);
    });
  }
  provideLessonFeedback(lessonId) {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (lesson) {
      this.log(`Great job on "${lesson.title}"! Consider reviewing the key takeaways.`);
      if (LawAIApp.LearningGraphEngine) {
        LawAIApp.LearningGraphEngine.markNodeCompleted(lessonId);
      }
    }
  }
  suggestCorrectiveLesson(quizId, failedQuestions) {
    this.log(`Detected difficulties. Generating a mini review lesson.`);
    this.emit('ReviewLessonRequested', { quizId, failedQuestions });
  }
};
