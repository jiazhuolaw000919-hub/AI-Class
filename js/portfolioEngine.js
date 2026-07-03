// portfolioEngine.js
LawAIApp.PortfolioEngine = {
  _getStore() {
    return LawAIApp.StorageEngine.get('portfolio', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('portfolio', list); },

  // 将已完成项目加入作品集
  addToPortfolio(projectId) {
    const project = LawAIApp.ProjectTracker.getProject(projectId);
    if (!project || project.status !== 'completed') return false;
    const portfolio = this._getStore();
    if (portfolio.find(p => p.projectId === projectId)) return false; // 已存在
    const entry = {
      ...project,
      addedAt: new Date().toISOString()
    };
    portfolio.push(entry);
    this._save(portfolio);
    LawAIApp.EventBus.emit('PortfolioUpdated', { projectId });
    return true;
  },

  // 获取作品集
  getPortfolio() {
    return this._getStore();
  },

  // 移除作品集项目
  removeFromPortfolio(projectId) {
    const list = this._getStore().filter(p => p.projectId !== projectId);
    this._save(list);
    return true;
  }
};
