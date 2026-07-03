// resourceBookmarks.js
LawAIApp.ResourceBookmarks = {
  _keyBookmarks: 'resourceBookmarks',
  _keyFavorites: 'resourceFavorites',
  _keyHistory: 'recentResources',

  getBookmarks() { return LawAIApp.StorageEngine.get(this._keyBookmarks, []); },
  addBookmark(resourceId) {
    const list = this.getBookmarks();
    if (!list.includes(resourceId)) { list.push(resourceId); LawAIApp.StorageEngine.set(this._keyBookmarks, list); }
  },
  removeBookmark(resourceId) {
    const list = this.getBookmarks().filter(id => id !== resourceId);
    LawAIApp.StorageEngine.set(this._keyBookmarks, list);
  },
  isBookmarked(resourceId) { return this.getBookmarks().includes(resourceId); },

  getFavorites() { return LawAIApp.StorageEngine.get(this._keyFavorites, []); },
  addFavorite(resourceId) {
    const list = this.getFavorites();
    if (!list.includes(resourceId)) { list.push(resourceId); LawAIApp.StorageEngine.set(this._keyFavorites, list); }
  },
  removeFavorite(resourceId) {
    const list = this.getFavorites().filter(id => id !== resourceId);
    LawAIApp.StorageEngine.set(this._keyFavorites, list);
  },
  isFavorite(resourceId) { return this.getFavorites().includes(resourceId); },

  // 记录浏览历史（最近查看）
  addRecent(resourceId) {
    let recent = LawAIApp.StorageEngine.get(this._keyHistory, []);
    recent = [resourceId, ...recent.filter(id => id !== resourceId)].slice(0, 20);
    LawAIApp.StorageEngine.set(this._keyHistory, recent);
  },
  getRecent() { return LawAIApp.StorageEngine.get(this._keyHistory, []); }
};
