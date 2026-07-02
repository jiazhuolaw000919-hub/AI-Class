LawAIApp.Router = {
  currentPage: 'dashboard',
  currentParams: {},           // 用于传递参数，如 { day: 5 }
  pages: ['dashboard','learning','calendar','notes','tools','prompt','settings','lesson'],

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
    this.loadPage(page);
    this.updateNav(page);
  },

  loadPage(page) {
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
  },

  updateNav(activePage) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === activePage);
    });
  }
};
