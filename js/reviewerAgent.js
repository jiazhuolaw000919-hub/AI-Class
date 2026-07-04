// reviewerAgent.js
LawAIApp.ReviewerAgent = class extends LawAIApp.AgentCore {
  constructor() {
    super('ReviewerAgent', 'Error detection');
  }
  init() {
    this.on('QuizFailed', (data) => this.analyzeErrors(data));
    this.on('PracticeCompleted', (data) => this.checkPracticeQuality(data));
  }
  analyzeErrors(quizData) {
    const failedConcepts = quizData.failedQuestions?.map(q => q.concept) || [];
    this.log(`Errors detected in concepts: ${failedConcepts.join(', ')}. Collaborating with Mentor...`);
    this.emit('CorrectiveActionNeeded', { concepts: failedConcepts });
  }
  checkPracticeQuality(data) {
    if (data.quality === 'partial') {
      this.log('Practice quality was partial. Recommending a review session.');
      this.emit('ReviewPracticeSuggested', { practiceId: data.practiceId });
    }
  }
};
