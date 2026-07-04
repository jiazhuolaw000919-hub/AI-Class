LawAIApp.LearningAssetManager = {
  _assets: {},
  _storageKey: 'marketplace_assets',

  init() {
    const stored = LawAIApp.StorageEngine.get(this._storageKey, {});
    this._assets = stored;
    if (Object.keys(this._assets).length === 0) this._seedDefaultAssets();
  },
  _save() { LawAIApp.StorageEngine.set(this._storageKey, this._assets); },
  _seedDefaultAssets() {
    const sample = [
      { id: 'asset_ai_basics', type: 'course', title: 'AI Basics', description: 'Intro to AI', creator: 'system', lessons: ['day-1','day-2','day-3'], effectivenessScore: 80, usageCount: 0, rating: 4.5, tags: ['AI','beginner'] },
      { id: 'asset_prompt_101', type: 'lesson', title: 'Prompt Engineering 101', description: 'Learn prompts', creator: 'system', effectivenessScore: 75, usageCount: 0, rating: 4.0, tags: ['prompt','intermediate'] }
    ];
    sample.forEach(a => { this._assets[a.id] = a; });
    this._save();
  },
  addAsset(asset) {
    if (!this._assets[asset.id]) {
      this._assets[asset.id] = { ...asset, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      this._save();
      LawAIApp.EventBus.emit('AssetCreated', { assetId: asset.id });
    }
  },
  getAsset(id) { return this._assets[id] || null; },
  getAllAssets() { return Object.values(this._assets); },
  updateAsset(id, updates) {
    if (this._assets[id]) {
      Object.assign(this._assets[id], updates, { updatedAt: new Date().toISOString() });
      this._save();
      LawAIApp.EventBus.emit('AssetUpdated', { assetId: id, updates });
    }
  },
  recordUsage(id) {
    if (this._assets[id]) {
      this._assets[id].usageCount = (this._assets[id].usageCount || 0) + 1;
      this._save();
    }
  }
};
setTimeout(() => LawAIApp.LearningAssetManager.init(), 200);
