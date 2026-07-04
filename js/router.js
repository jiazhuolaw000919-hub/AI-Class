// router.js – Phase 60 升级版（Season 2 完结）
// Season 1.5 升级：增加页面缓存 + 面包屑导航
// Phase 42–53：注册所有 Season 2 路由
// Phase 54：注册 planner 路由
// Phase 55：注册 goal-intelligence 路由
// Phase 56：注册 command-center 路由
// Phase 58：注册 career-showcase 路由
// Phase 60：Season 2 正式完结

LawAIApp.Router = {
  currentPage: 'dashboard',
  currentParams: {},
  pages: [
    'dashboard','learning','calendar','notes','tools','prompt','settings',
    'lesson','academy','academy-dashboard','course-ai-fundamentals','module',
    'lesson-detail','practice','quiz-dashboard','smart-project','learning-hub',
    'knowledge-capture','knowledge-editor','knowledge-favorites','knowledge-export',
    'adaptive-memory','intelligence','mentor-brain','conversations',
    'planner','goal-intelligence','command-center','career-showcase'
  ],

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
    // ========== Phase 41：学院仪表盘 ==========
    if (page === 'academy-dashboard') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.AcademyAIView.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 42：课程视图 ==========
    if (page === 'course-ai-fundamentals') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.CourseAIFundamentalsView.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 43：模块视图 ==========
    if (page === 'module') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.ModuleView.render(this.currentParams.moduleId);
      this.currentPage = page;
      return;
    }

    // ========== Phase 44：课程详情 ==========
    if (page === 'lesson-detail') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.LessonView.render(this.currentParams.lessonId);
      this.currentPage = page;
      return;
    }

    // ========== Phase 45：实践视图 ==========
    if (page === 'practice') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.PracticeView.render(this.currentParams.practiceId);
      this.currentPage = page;
      return;
    }

    // ========== Phase 46：测验洞察仪表盘 ==========
    if (page === 'quiz-dashboard') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.QuizInsightDashboard.render(this.currentParams.moduleId);
      this.currentPage = page;
      return;
    }

    // ========== Phase 47：智能项目视图 ==========
    if (page === 'smart-project') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.SmartProjectView.render(this.currentParams.projectId);
      this.currentPage = page;
      return;
    }

    // ========== Phase 48：学习中心 ==========
    if (page === 'learning-hub') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.LearningHub.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 49：知识捕获相关路由 ==========
    if (page === 'knowledge-capture') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.KnowledgeDashboard.render();
      this.currentPage = page;
      return;
    }

    if (page === 'knowledge-editor') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.KnowledgeEditor.render(this.currentParams);
      this.currentPage = page;
      return;
    }

    if (page === 'knowledge-favorites') {
      const app = document.getElementById('app');
      const favorites = LawAIApp.KnowledgeCapture.getNotes({ isFavorite: true });
      const html = '<div class="page"><button class="back-btn" onclick="LawAIApp.Router.navigate(\'knowledge-capture\')">← Back</button><h2>⭐ Favorites</h2><div id="fav-list"></div></div>';
      app.innerHTML = html;
      document.getElementById('fav-list').innerHTML = LawAIApp.KnowledgeDashboard.renderNoteCards(favorites) || '<p style="color:var(--text-secondary);">No favorites yet.</p>';
      this.currentPage = page;
      return;
    }

    if (page === 'knowledge-export') {
      LawAIApp.KnowledgeExport.exportAll();
      this.navigate('knowledge-capture');
      return;
    }

    // ========== Phase 50：自适应记忆仪表盘 ==========
    if (page === 'adaptive-memory') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.MemoryDashboard.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 51：学习智能引擎 ==========
    if (page === 'intelligence') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.IntelligenceEngine.renderDashboard();
      this.currentPage = page;
      return;
    }

    // ========== Phase 52：AI Mentor 大脑 ==========
    if (page === 'mentor-brain') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.MentorBrain.renderDashboard();
      this.currentPage = page;
      return;
    }

    // ========== Phase 53：学习对话界面 ==========
    if (page === 'conversations') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.ConversationUI.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 54：智能学习规划器 ==========
    if (page === 'planner') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.PlannerDashboard.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 55：目标智能仪表盘 ==========
    if (page === 'goal-intelligence') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.GoalDashboard.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 56：指挥中心 ==========
    if (page === 'command-center') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.CommandCenter.render();
      this.currentPage = page;
      return;
    }

    // ========== Phase 58：职业生涯展示 ==========
    if (page === 'career-showcase') {
      const app = document.getElementById('app');
      app.innerHTML = '';
      LawAIApp.ShowcaseDashboard.render();
      this.currentPage = page;
      return;
    }

    // ---------- 原有模板页面加载逻辑 ----------
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
    if (page === 'dashboard') LawAIApp.Dashboard?.render();
    else if (page === 'learning') LawAIApp.Learning?.render();
    else if (page === 'calendar') LawAIApp.Calendar?.render();
    else if (page === 'notes') LawAIApp.Notes?.render();
    else if (page === 'settings') LawAIApp.Settings?.render();
    else if (page === 'tools') LawAIApp.Tools?.render?.();
    else if (page === 'prompt') LawAIApp.Prompt?.render?.();
    else if (page === 'lesson') LawAIApp.LessonPage?.render(this.currentParams);
    else if (page === 'academy') LawAIApp.AcademyPage?.render();

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
    if (page === 'lesson' && params.day) return `${page}_day_${params.day}`;
    if (page === 'module' && params.moduleId) return `${page}_${params.moduleId}`;
    if (page === 'lesson-detail' && params.lessonId) return `${page}_${params.lessonId}`;
    if (page === 'practice' && params.practiceId) return `${page}_${params.practiceId}`;
    if (page === 'quiz-dashboard' && params.moduleId) return `${page}_${params.moduleId}`;
    if (page === 'smart-project' && params.projectId) return `${page}_${params.projectId}`;
    if (page === 'knowledge-editor' && params.noteId) return `${page}_${params.noteId}`;
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
      module: `📦 ${params?.moduleId || 'Module'}`,
      'lesson-detail': `📖 ${params?.lessonId || 'Lesson'}`,
      practice: `⚡ ${params?.practiceId || 'Practice'}`,
      'quiz-dashboard': '📊 Quiz Insights',
      'smart-project': `🚀 ${params?.projectId || 'Project'}`,
      'learning-hub': '📚 Learning Hub',
      'knowledge-capture': '📓 Notes',
      'knowledge-editor': '✏️ Editor',
      'knowledge-favorites': '⭐ Favorites',
      'knowledge-export': '📤 Export',
      'adaptive-memory': '🧠 Adaptive Memory',
      'intelligence': '🧠 Intelligence',
      'mentor-brain': '🤖 Mentor Brain',
      'conversations': '💬 Chat',
      'planner': '📅 Planner',
      'goal-intelligence': '🎯 Goals',
      'command-center': '🚀 Command Center',
      'career-showcase': '🚀 Showcase'
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
