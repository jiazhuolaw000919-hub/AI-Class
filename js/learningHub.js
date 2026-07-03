// learningHub.js
LawAIApp.LearningHub = {
  render() {
    const recommendations = LawAIApp.ResourceRecommendation.getRecommendations();
    const trending = LawAIApp.ResourceRecommendation.getTrending();
    const aiPicks = LawAIApp.ResourceRecommendation.getAIPicks();
    const recentIds = LawAIApp.ResourceBookmarks.getRecent();
    const recentResources = recentIds.map(id => LawAIApp.ResourceLibrary.library.find(r => r.id === id)).filter(Boolean);

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Dashboard
        </button>
        <h2>📚 Learning Hub</h2>
        <input class="search-box" id="hub-search" placeholder="Search resources, topics, keywords...">

        <!-- Smart Recommendations -->
        <div class="section-card">
          <h3>✨ Recommended for You</h3>
          <div class="resource-grid" id="recommended-list">
            ${this.renderResourceCards(recommendations)}
          </div>
        </div>

        <!-- AI Picks -->
        <div class="section-card">
          <h3>🤖 AI Mentor Picks</h3>
          <div class="resource-grid" id="ai-picks-list">
            ${this.renderResourceCards(aiPicks)}
          </div>
        </div>

        <!-- Trending -->
        <div class="section-card">
          <h3>🔥 Trending Now</h3>
          <div class="resource-grid">
            ${this.renderResourceCards(trending)}
          </div>
        </div>

        <!-- Recently Viewed -->
        ${recentResources.length > 0 ? `
          <div class="section-card">
            <h3>🕒 Recently Viewed</h3>
            <div class="resource-grid">
              ${this.renderResourceCards(recentResources)}
            </div>
          </div>
        ` : ''}

        <!-- Bookmark/Favorite quick access -->
        <div class="quick-access" style="margin-top:1rem;">
          <button class="quick-btn" onclick="LawAIApp.LearningHub.showBookmarks()">⭐ Bookmarks</button>
          <button class="quick-btn" onclick="LawAIApp.LearningHub.showFavorites()">❤️ Favorites</button>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
    this.attachSearch();
  },

  // 辅助：渲染资源卡片
  renderResourceCards(resources) {
    if (resources.length === 0) return '<p style="color:var(--text-secondary);">No resources yet.</p>';
    return resources.map(r => `
      <div class="resource-card widget-card" style="cursor:pointer;" onclick="LawAIApp.ResourceBookmarks.addRecent('${r.id}'); window.open('${r.url}', '_blank')">
        <div style="display:flex; justify-content:space-between;">
          <strong>${r.title}</strong>
          <span style="font-size:0.8rem;">
            <i onclick="event.stopPropagation(); LawAIApp.ResourceBookmarks.addBookmark('${r.id}'); this.textContent = '🔖'" style="cursor:pointer;">
              ${LawAIApp.ResourceBookmarks.isBookmarked(r.id) ? '🔖' : '📑'}
            </i>
            <i onclick="event.stopPropagation(); LawAIApp.ResourceBookmarks.addFavorite('${r.id}'); this.textContent = '❤️'" style="cursor:pointer; margin-left:4px;">
              ${LawAIApp.ResourceBookmarks.isFavorite(r.id) ? '❤️' : '🤍'}
            </i>
          </span>
        </div>
        <small style="color:var(--text-secondary);">${r.type} · ${r.estimatedTime} min · ${r.difficulty}</small>
        <p style="font-size:0.85rem;">${r.source}</p>
      </div>
    `).join('');
  },

  // 搜索功能
  attachSearch() {
    const searchInput = document.getElementById('hub-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.trim() === '') {
          this.render(); // 重新加载原版
          return;
        }
        const results = LawAIApp.ResourceLibrary.search(query);
        // 渲染搜索结果到推荐区域
        const recContainer = document.getElementById('recommended-list');
        if (recContainer) recContainer.innerHTML = this.renderResourceCards(results);
        // 隐藏其他区域 (简单做法：清空)
        const aiContainer = document.getElementById('ai-picks-list');
        if (aiContainer) aiContainer.innerHTML = '';
        document.querySelectorAll('.section-card')[2] ? document.querySelectorAll('.section-card')[2].style.display = 'none' : null;
      });
    }
  },

  // 显示书签列表（新页面或弹窗，这里使用页面导航简单实现）
  showBookmarks() {
    const ids = LawAIApp.ResourceBookmarks.getBookmarks();
    const resources = ids.map(id => LawAIApp.ResourceLibrary.library.find(r => r.id === id)).filter(Boolean);
    let html = '<div class="page"><button class="back-btn" onclick="LawAIApp.LearningHub.render()">← Back</button><h2>⭐ Bookmarks</h2><div class="resource-grid">';
    html += this.renderResourceCards(resources);
    html += '</div></div>';
    document.getElementById('app').innerHTML = html;
  },

  showFavorites() {
    const ids = LawAIApp.ResourceBookmarks.getFavorites();
    const resources = ids.map(id => LawAIApp.ResourceLibrary.library.find(r => r.id === id)).filter(Boolean);
    let html = '<div class="page"><button class="back-btn" onclick="LawAIApp.LearningHub.render()">← Back</button><h2>❤️ Favorites</h2><div class="resource-grid">';
    html += this.renderResourceCards(resources);
    html += '</div></div>';
    document.getElementById('app').innerHTML = html;
  }
};
