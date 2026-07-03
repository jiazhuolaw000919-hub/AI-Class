// router.js – Phase 5 升级版（已注册 academy 路由）
// Season 1.5 升级：增加页面缓存 + 面包屑导航
LawAIApp.Router = {
  currentPage: 'dashboard',
  currentParams: {},           // 用于传递参数，如 { day: 5 }
  pages: ['dashboard','learning','calendar','notes','tools','prompt','settings','lesson','academy'],

  // ========== Season 1.5 新增：页面缓存 ==========
  _pageCache: {},              // 缓存已渲染的页面 HTML
  _breadcrumbStack: [],        // 面包屑导航栈

  init() {
    this.loadPage('dashboard');
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.navigate(page);
      });
    });
  },

  // 导航到指定页面，可附带参数
  navigate(page, params = {}) {
    // 如果目标页面和当前页面相同，但参数不同（例如同一 lesson 不同 day），需要刷新
    if (page === this.currentPage && JSON.stringify(params) === JSON.stringify(this.currentParams)) {
      return;
    }
    this.currentParams = params;

    // ========== Season 1.5 新增：记录面包屑 ==========
    this._pushBreadcrumb(page, params);

    this.loadPage(page);
    this.updateNav(page);
  },

  loadPage(page) {
    // ========== Season 1.5 新增：尝试从缓存加载 ==========
    const cacheKey = this._getCacheKey(page, this.currentParams);
    if (this._pageCache[cacheKey]) {
      const app = document.getElementById('app');
      app.innerHTML = this._pageCache[cacheKey];
      this.currentPage = page;
      this._rerunPageScripts(page);
      return;
    }

    const template = document.getElementById(`template-${page}`);
    if (!template) return;
    const app = document.getElementById('app');
    app.innerHTML = '';
    const clone = template.content.cloneNode(true);
    app.appendChild(clone);
    this.currentPage = page;

    // ---------- 页面初始化分发 ----------
    if (page === 'dashboard') {
      LawAIApp.Dashboard?.render();
    }
    else if (page === 'learning') {
      LawAIApp.Learning?.render();
    }
    else if (page === 'calendar') {
      LawAIApp.Calendar?.render();
    }
    else if (page === 'notes') {
      LawAIApp.Notes?.render();
    }
    else if (page === 'settings') {
      LawAIApp.Settings?.render();
    }
    else if (page === 'tools') {
      LawAIApp.Tools?.render?.();
    }
    else if (page === 'prompt') {
      LawAIApp.Prompt?.render?.();
    }
    else if (page === 'lesson') {
      // 传递参数给 Lesson 页面（例如 { day: 12 }）
      LawAIApp.LessonPage?.render(this.currentParams);
    }
    else if (page === 'academy') {
      // Academy Home 页面 (Phase 5)
      LawAIApp.AcademyPage?.render();
    }

    // ========== Season 1.5 新增：缓存渲染结果 ==========
    // 延迟缓存，确保页面内容已渲染完成
    setTimeout(() => {
      const currentHTML = document.getElementById('app').innerHTML;
      // 只缓存非 lesson 页面（lesson 页面参数多变，避免缓存膨胀）
      if (page !== 'lesson') {
        this._pageCache[cacheKey] = currentHTML;
      }
    }, 100);
  },

  updateNav(activePage) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === activePage);
    });
    // ========== Season 1.5 新增：渲染面包屑 ==========
    this._renderBreadcrumb();
  },

  // ========== Season 1.5 新增方法 ==========

  // 生成缓存键
  _getCacheKey(page, params) {
    if (page === 'lesson' && params.day) {
      return `${page}_day_${params.day}`;
    }
    return page;
  },

  // 压入面包屑栈
  _pushBreadcrumb(page, params) {
    const titles = {
      dashboard: '📊 Dashboard',
      learning: '📚 Learning',
      calendar: '📅 Calendar',
      notes: '📝 Notes',
      tools: '🛠️ Tools',
      prompt: '📋 Prompts',
      settings: '⚙️ Settings',
      lesson: `📖 Day ${params?.day || '?'}`,
      academy: '🏫 Academy'
    };
    const title = titles[page] || page;

    // 避免重复压入相同页面
    if (this._breadcrumbStack.length > 0 && this._breadcrumbStack[this._breadcrumbStack.length - 1].page === page) {
      return;
    }

    this._breadcrumbStack.push({ page, title, params });
    // 限制面包屑深度，最多保留 5 层
    if (this._breadcrumbStack.length > 5) {
      this._breadcrumbStack.shift();
    }
  },

  // 渲染面包屑导航
  _renderBreadcrumb() {
    // 移除旧面包屑（如果存在）
    const oldBreadcrumb = document.getElementById('breadcrumb-nav');
    if (oldBreadcrumb) oldBreadcrumb.remove();

    // 只在非 Dashboard 页面显示（Dashboard 是首页）
    if (this.currentPage === 'dashboard' || this._breadcrumbStack.length <= 1) return;

    const breadcrumb = document.createElement('div');
    breadcrumb.id = 'breadcrumb-nav';
    breadcrumb.style.cssText = `
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.3rem;
      flex-wrap: wrap;
      max-width: 800px;
      margin: 0 auto;
      animation: fadeIn 0.3s ease;
    `;

    let html = '<span style="cursor:pointer;" onclick="LawAIApp.Router.navigate(\'dashboard\')">🏠 Home</span>';

    this._breadcrumbStack.forEach((crumb, index) => {
      html += ' <span style="opacity:0.5;">›</span> ';
      if (index === this._breadcrumbStack.length - 1) {
        // 最后一层不可点击（当前页面）
        html += `<span style="color: var(--primary);">${crumb.title}</span>`;
      } else {
        html += `<span style="cursor:pointer;" onclick="LawAIApp.Router.navigate('${crumb.page}', ${JSON.stringify(crumb.params || {}).replace(/"/g, "'")})">${crumb.title}</span>`;
      }
    });

    breadcrumb.innerHTML = html;

    // 插入到 app 容器之前
    const app = document.getElementById('app');
    if (app && app.parentNode) {
      app.parentNode.insertBefore(breadcrumb, app);
    }
  },

  // 清除缓存（供 FactoryReset 调用）
  clearCache() {
    this._pageCache = {};
    this._breadcrumbStack = [];
    const oldBreadcrumb = document.getElementById('breadcrumb-nav');
    if (oldBreadcrumb) oldBreadcrumb.remove();
  },

  // 重新执行页面脚本（从缓存恢复时，重新绑定事件等）
  _rerunPageScripts(page) {
    // 对于某些需要重新初始化交互的页面，在这里处理
    if (page === 'calendar') {
      // Calendar 页面需要重新绑定标签切换事件等
      // 这里先留空，根据实际需求添加
    }
    if (page === 'learning') {
      // Learning 页面可能需要重新绑定搜索、筛选事件
    }
  }
};
