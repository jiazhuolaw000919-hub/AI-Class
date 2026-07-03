// dailyBriefingEngine.js
LawAIApp.DailyBriefing = {
  _key: 'dailyBriefingLastDate',

  shouldShowToday() {
    const today = new Date().toDateString();
    const lastDate = LawAIApp.StorageEngine.get(this._key);
    return lastDate !== today;
  },

  markShown() {
    LawAIApp.StorageEngine.set(this._key, new Date().toDateString());
  },

  showFullExperience() {
    // 无论今天是否已显示，都可以强制打开（重新打开功能）
    LawAIApp.DailyPromptExperience.render(() => {
      this.markShown();
      // 刷新仪表盘上的紧凑卡片（如果仪表盘已渲染，可简单重新导航）
      if (LawAIApp.Router.currentPage === 'dashboard') {
        LawAIApp.Dashboard.render();
      }
    });
  },

  // 自动检查并显示（首次）
  autoShow() {
    if (this.shouldShowToday()) {
      // 延迟一点确保DOM就绪
      setTimeout(() => {
        this.showFullExperience();
      }, 200);
    }
  },

  // 获取紧凑卡片HTML
  getCompactCardHTML() {
    return LawAIApp.DailyBriefingCard.render();
  }
};
