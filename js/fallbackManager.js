// fallbackManager.js
LawAIApp.FallbackManager = {
  async executeWithFallback(request, primaryProviderId) {
    const primary = LawAIApp.ProviderRouter.selectProvider(request.task, primaryProviderId);
    if (primary) {
      try {
        const resp = await this._callProvider(primary, request);
        return resp;
      } catch (e) {
        console.warn(`Fallback triggered: ${e}`);
      }
    }
    // 回退到模拟本地
    const local = LawAIApp.ProviderRegistry.providers.local;
    if (local) {
      const resp = await this._callProvider(local, request);
      LawAIApp.EventBus.emit('FallbackTriggered', { request, reason: 'primary failed' });
      return resp;
    }
    throw new Error('No available provider');
  },

  // 实际调用提供者（未来对接API，现在使用模拟）
  async _callProvider(provider, request) {
    if (provider.simulation) {
      return this._simulateResponse(provider, request);
    }
    // 未来实现真实 API 调用
    throw new Error('Provider not connected');
  },

  async _simulateResponse(provider, request) {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    return LawAIApp.ResponseNormalizer.normalize({
      provider: provider.id,
      model: 'simulated',
      content: `[Simulated ${request.task} response for: "${request.promptTemplate || 'none'}"]`,
      confidence: 0.8,
      latency: 300,
      tokenUsage: 20
    });
  }
};
