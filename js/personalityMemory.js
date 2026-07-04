// personalityMemory.js
LawAIApp.PersonalityMemory = {
  _key: 'personality_memory',
  get() {
    return LawAIApp.StorageEngine.get(this._key, {
      preferredStyle: null,
      effectiveStyles: {},
      engagementHistory: [],
      lastPersonality: null
    });
  },
  save(memory) { LawAIApp.StorageEngine.set(this._key, memory); },
  recordEngagement(personality, userEngaged) {
    const mem = this.get();
    if (!mem.effectiveStyles[personality]) mem.effectiveStyles[personality] = 0;
    if (userEngaged) mem.effectiveStyles[personality] += 1;
    mem.lastPersonality = personality;
    mem.preferredStyle = Object.keys(mem.effectiveStyles).reduce((a, b) =>
      mem.effectiveStyles[a] > mem.effectiveStyles[b] ? a : b, personality);
    this.save(mem);
    return mem;
  }
};
