// providerRegistry.js
LawAIApp.ProviderRegistry = {
  providers: {
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      enabled: false,
      capabilities: ['summary', 'quiz', 'reflection', 'review', 'mentor']
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      enabled: false,
      capabilities: ['summary', 'quiz', 'reflection', 'review', 'mentor', 'code']
    },
    claude: {
      id: 'claude',
      name: 'Anthropic Claude',
      enabled: false,
      capabilities: ['summary', 'reflection', 'mentor']
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      enabled: false,
      capabilities: ['summary', 'code', 'mentor']
    },
    local: {
      id: 'local',
      name: 'Local AI (Simulated)',
      enabled: true,
      capabilities: ['summary', 'quiz', 'reflection', 'review', 'mentor'],
      simulation: true
    }
  },

  getEnabledProviders() {
    return Object.values(this.providers).filter(p => p.enabled);
  },

  getProvidersForCapability(capability) {
    return this.getEnabledProviders().filter(p => p.capabilities.includes(capability));
  },

  setProviderEnabled(id, enabled) {
    if (this.providers[id]) this.providers[id].enabled = enabled;
  }
};
