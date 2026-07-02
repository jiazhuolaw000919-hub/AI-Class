LawAIApp.Router = {
  currentPage: 'dashboard',
  pages: ['dashboard','learning','calendar','notes','tools','prompt','settings'],

  init() {
    this.loadPage('dashboard');
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        this.navigate(page);
      });
    });
  },

  navigate(page) {
    if (page === this.currentPage) return;
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
    // init page-specific logic
    if (page === 'dashboard') LawAIApp.Dashboard?.render();
    else if (page === 'learning') LawAIApp.Learning?.render();
    else if (page === 'calendar') LawAIApp.Calendar?.render();
    else if (page === 'notes') LawAIApp.Notes?.render();
    else if (page === 'settings') LawAIApp.Settings?.render();
    else if (page === 'tools') LawAIApp.Tools?.render?.();
    else if (page === 'prompt') LawAIApp.Prompt?.render?.();
  },

  updateNav(activePage) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.page === activePage);
    });
  }
};
