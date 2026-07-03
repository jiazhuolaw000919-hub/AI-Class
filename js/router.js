// router.js – Phase 43 升级版（已注册 module 路由）
// Season 1.5 升级：增加页面缓存 + 面包屑导航
// Phase 42 升级：注册 course-ai-fundamentals 路由
// Phase 43 升级：注册 module 路由
LawAIApp.Router = {
  currentPage: 'dashboard',
  currentParams: {},
  pages: ['dashboard','learning','calendar','notes','tools','prompt','settings','lesson','academy','academy-dashboard','course-ai-fundamentals','module'],

  _pageCache: {},
  _breadcrumbStack: [],

  init() {
    this.loadPage('dashboard');
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.navigate(page);
      });
    });
  },

  navigate(page, params = {}) {
    if (page === this.currentPage && JSON.stringify(params) === JSON.stringify(this.currentParams)) {
      return;
    }
    this.currentParams = params;
    this._pushBreadcrumb(page, params);
    this.loadPage(page);
    this.updateNav(page);
  },

  loadPage(page) {
    // ========== Phase 41 新增：学院仪表盘直接渲染，无需模板 ==========
    if (page === 'academy-dashboard') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.AcademyAIView.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 42 新增：课程视图直接渲染，无需模板 ==========
    if (page === 'course-ai-fundamentals') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.CourseAIFundamentalsView.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 43 新增：模块视图直接渲染，无需模板 ==========
    if (page === 'module') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.ModuleView.render(this.currentParams.moduleId);
      this.currentPage = page;
      return;
    }

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
      LawAIApp.LessonPage?.render(this.currentParams);
    }
    else if (page === 'academy') {
      LawAIApp.AcademyPage?.render();
    }

    setTimeout(() => {
      const currentHTML = document.getElementById('app').innerHTML;
      if (page !== 'lesson') {
        this._pageCache[cacheKey] = currentHTML;
      }
    }, 100);
  },

  updateNav(activePage) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === activePage);
    });
    this._renderBreadcrumb();
  },

  _getCacheKey(page, params) {
    if (page === 'lesson' && params.day) {
      return `${page}_day_${params.day}`;
    }
    if (page === 'module' && params.moduleId) {
      return `${page}_${params.moduleId}`;
    }
    return page;
  },

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
      academy: '🏫 Academy',
      'academy-dashboard': '🤖 AI Foundation',
      'course-ai-fundamentals': '📖 AI Fundamentals',
      module: `📦 ${params?.moduleId || 'Module'}`  // Phase 43 新增
    };
    const title = titles[page] || page;

    if (this._breadcrumbStack.length > 0 && this._breadcrumbStack[this._breadcrumbStack.length - 1].page === page) {
      return;
    }

    this._breadcrumbStack.push({ page, title, params });
    if (this._breadcrumbStack.length > 5) {
      this._breadcrumbStack.shift();
    }
  },

  _renderBreadcrumb() {
    const oldBreadcrumb = document.getElementById('breadcrumb-nav');
    if (oldBreadcrumb) oldBreadcrumb.remove();

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
        html += `<span style="color: var(--primary);">${crumb.title}</span>`;
      } else {
        html += `<span style="cursor:pointer;" onclick="LawAIApp.Router.navigate('${crumb.page}', ${JSON.stringify(crumb.params || {}).replace(/"/g, "'")})">${crumb.title}</span>`;
      }
    });

    breadcrumb.innerHTML = html;

    const app = document.getElementById('app');
    if (app && app.parentNode) {
      app.parentNode.insertBefore(breadcrumb, app);
    }
  },

  clearCache() {
    this._pageCache = {};
    this._breadcrumbStack = [];
    const oldBreadcrumb = document.getElementById('breadcrumb-nav');
    if (oldBreadcrumb) oldBreadcrumb.remove();
  },

  _rerunPageScripts(page) {
    // 预留
  }
};
