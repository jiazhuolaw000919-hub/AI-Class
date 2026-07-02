// providerRouter.js
LawAIApp.ProviderRouter = {
  selectProvider(capability, preferredId) {
    // 优先使用指定提供者
    if (preferredId) {
      const provider = LawAIApp.ProviderRegistry.providers[preferredId];
      if (provider && provider.enabled && provider.capabilities.includes(capability)) {
        return provider;
      }
    }
    // 否则按顺序选择第一个启用的
    const candidates = LawAIApp.ProviderRegistry.getProvidersForCapability(capability);
    return candidates.length > 0 ? candidates[0] : null;
  }
};
