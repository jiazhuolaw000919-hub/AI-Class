// memoryAgent.js
LawAIApp.MemoryAgent = class extends LawAIApp.AgentCore {
  constructor() {
    super('MemoryAgent', 'Knowledge persistence');
  }
  init() {
    this.on('LessonCompleted', (data) => this.reinforceMemory(data.lessonId));
    this.on('MemoryDecayDetected', (data) => this.triggerReview(data));
  }
  reinforceMemory(lessonId) {
    if (LawAIApp.MemoryScheduler) {
      LawAIApp.MemoryScheduler.completeReview(lessonId, 'good');
      this.log(`Memory reinforced for lesson ${lessonId}`);
      if (LawAIApp.LearningGraphEngine) {
        LawAIApp.LearningGraphEngine.updateNodeStrength(lessonId, 10);
      }
    }
  }
  triggerReview(data) {
    this.log(`Memory decay detected for ${data.lessonId}. Scheduling review.`);
    this.emit('ReviewUrgentlyNeeded', { lessonId: data.lessonId });
  }
};
