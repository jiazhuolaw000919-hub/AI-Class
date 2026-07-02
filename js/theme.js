LawAIApp.Theme = {
  init() {
    const dark = LawAIApp.Storage.get('darkMode', true);
    document.body.classList.toggle('light-mode', !dark);
  },
  toggle() {
    const isLight = document.body.classList.contains('light-mode');
    document.body.classList.toggle('light-mode', !isLight);
    LawAIApp.Storage.set('darkMode', isLight); // because toggled
  }
};
