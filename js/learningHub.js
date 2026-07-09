// ===========================================
// learningHub.js
// 智能学习中心 - 动态资源推荐（Season 2 Phase 48 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.LearningHub = {
    render: function() {
        var app = document.getElementById('app');
        if (!app) return;

        // 内置资源数据
        var resources = [
            { id: 'res_1', title: 'AI Fundamentals Guide', type: 'article', estimatedTime: 15, difficulty: 'Beginner', source: 'OpenAI', url: '#' },
            { id: 'res_2', title: 'Prompt Engineering Best Practices', type: 'video', estimatedTime: 20, difficulty: 'Beginner', source: 'YouTube', url: '#' },
            { id: 'res_3', title: 'AI Tool Ecosystem Overview', type: 'article', estimatedTime: 10, difficulty: 'Intermediate', source: 'Law AI', url: '#' },
            { id: 'res_4', title: 'Coding with AI: A Practical Guide', type: 'course', estimatedTime: 60, difficulty: 'Intermediate', source: 'Coursera', url: '#' },
            { id: 'res_5', title: 'Building AI Applications', type: 'project', estimatedTime: 120, difficulty: 'Advanced', source: 'Law AI', url: '#' }
        ];

        var recentIds = this._getRecentIds();
        var recentResources = resources.filter(function(r) { return recentIds.indexOf(r.id) !== -1; });

        var html = `
            <div style="max-width:1000px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <h2 style="margin:0 0 12px;font-size:24px;font-weight:700;">📚 Learning Hub</h2>
                <input class="search-box" id="hub-search" placeholder="Search resources, topics, keywords..." style="
                    width:100%;
                    padding:12px 16px;
                    background:rgba(255,255,255,0.05);
                    border:1px solid rgba(255,255,255,0.08);
                    border-radius:10px;
                    color:#e2e8f0;
                    font-size:14px;
                    margin-bottom:16px;
                ">

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">✨ Recommended for You</h3>
                    ${this._renderResourceCards(resources.slice(0, 3))}
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🤖 AI Mentor Picks</h3>
                    ${this._renderResourceCards(resources.slice(3))}
                </div>

                ${recentResources.length > 0 ? `
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                        <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🕒 Recently Viewed</h3>
                        ${this._renderResourceCards(recentResources)}
                    </div>
                ` : ''}

                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button onclick="alert('Bookmarks coming soon')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">⭐ Bookmarks</button>
                    <button onclick="alert('Favorites coming soon')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">❤️ Favorites</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
        this._attachSearch();
    },

    _renderResourceCards: function(resources) {
        if (!resources || resources.length === 0) {
            return '<p style="color:#64748b;font-size:13px;">No resources available.</p>';
        }
        return resources.map(function(r) {
            return `
                <div style="display:flex;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;cursor:pointer;" onclick="alert('Open: ${r.title}')">
                    <div>
                        <strong style="font-size:14px;">${r.title}</strong>
                        <small style="color:#94a3b8;display:block;">${r.type} · ${r.estimatedTime} min · ${r.difficulty}</small>
                    </div>
                    <span style="color:#4a9eff;">▶️</span>
                </div>
            `;
        }).join('');
    },

    _getRecentIds: function() {
        try {
            if (LawAIApp.ResourceBookmarks && typeof LawAIApp.ResourceBookmarks.getRecent === 'function') {
                return LawAIApp.ResourceBookmarks.getRecent() || [];
            }
        } catch (e) {}
        return ['res_1', 'res_2'];
    },

    _attachSearch: function() {
        var searchInput = document.getElementById('hub-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var query = e.target.value.trim();
                console.log('🔍 Searching:', query || '(empty)');
                if (!query) {
                    LawAIApp.Views.LearningHub.render();
                    return;
                }
                // 简单的客户端搜索
                var results = [];
                var resources = [
                    { id: 'res_1', title: 'AI Fundamentals Guide', type: 'article', estimatedTime: 15, difficulty: 'Beginner', source: 'OpenAI', url: '#' },
                    { id: 'res_2', title: 'Prompt Engineering Best Practices', type: 'video', estimatedTime: 20, difficulty: 'Beginner', source: 'YouTube', url: '#' },
                    { id: 'res_3', title: 'AI Tool Ecosystem Overview', type: 'article', estimatedTime: 10, difficulty: 'Intermediate', source: 'Law AI', url: '#' },
                    { id: 'res_4', title: 'Coding with AI: A Practical Guide', type: 'course', estimatedTime: 60, difficulty: 'Intermediate', source: 'Coursera', url: '#' },
                    { id: 'res_5', title: 'Building AI Applications', type: 'project', estimatedTime: 120, difficulty: 'Advanced', source: 'Law AI', url: '#' }
                ];
                var q = query.toLowerCase();
                results = resources.filter(function(r) {
                    return r.title.toLowerCase().indexOf(q) !== -1 ||
                           r.type.toLowerCase().indexOf(q) !== -1 ||
                           r.difficulty.toLowerCase().indexOf(q) !== -1;
                });
                var container = document.querySelector('.section-card:first-child .resource-grid') || document.querySelector('#recommended-list');
                var target = container || document.querySelector('[style*="border:1px solid rgba(255,255,255,0.06)"]');
                if (target) {
                    target.innerHTML = LawAIApp.Views.LearningHub._renderResourceCards(results);
                }
            });
        }
    }
};

console.log('📚 LearningHub V2.0 ready');
