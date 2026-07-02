// responseNormalizer.js
LawAIApp.ResponseNormalizer = {
  normalize(raw) {
    return {
      responseId: 'resp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      provider: raw.provider || 'unknown',
      model: raw.model || 'default',
      content: raw.content || '',
      confidence: raw.confidence || 0,
      latency: raw.latency || 0,
      tokenUsage: raw.tokenUsage || 0,
      generatedAt: new Date().toISOString()
    };
  },

  // 未来可针对不同提供商做标准化转换
  fromGemini(data) { return this.normalize({ provider: 'gemini', model: data.model, content: data.text }); },
  fromOpenAI(data) { return this.normalize({ provider: 'openai', model: data.model, content: data.choices?.[0]?.text }); }
};
