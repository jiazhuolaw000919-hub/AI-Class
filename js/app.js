(function() {
  LawAIApp.Theme.init();
  LawAIApp.Router.init();

  // Pre‑populate templates from pages/ folder content (for offline fallback)
  // In real server, this would be fetched. For direct file open, we embed.
  const templates = {
    dashboard: document.getElementById('template-dashboard'),
    learning: document.getElementById('template-learning'),
    calendar: document.getElementById('template-calendar'),
    notes: document.getElementById('template-notes'),
    tools: document.getElementById('template-tools'),
    prompt: document.getElementById('template-prompt'),
    settings: document.getElementById('template-settings')
  };

  // Dummy innerHTML placeholders (the router will replace on load, but we need valid templates)
  Object.keys(templates).forEach(key => {
    if (!templates[key].content.childNodes.length) {
      templates[key].innerHTML = `<div>Loading ${key}...</div>`;
    }
  });

  // Initial load
  LawAIApp.Router.loadPage('dashboard');
})();
