// aiLayer.js
LawAIApp.AILayer = {
  async request(task, context = {}, preferredProvider = null) {
    const prompt = context.prompt || LawAIApp.PromptManager.fillTemplate(task, context);
    const requestObj = {
      requestId: 'aireq_' + Date.now(),
      provider: preferredProvider,
      task,
      promptTemplate: prompt,
      context,
      priority: context.priority || 'normal',
      createdAt: new Date().toISOString(),
      status: 'created'
    };
    LawAIApp.EventBus.emit('AIRequestCreated', requestObj);
    try {
      const response = await LawAIApp.FallbackManager.executeWithFallback(requestObj, preferredProvider);
      LawAIApp.EventBus.emit('AIResponseReceived', { request: requestObj, response });
      return response;
    } catch (error) {
      console.error('AI Request failed:', error);
      return null;
    }
  }
};
