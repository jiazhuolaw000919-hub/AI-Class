window.LawAIApp = window.LawAIApp || {};

LawAIApp.ThemeExperience = {
  setTheme(name) {
    console.log("🎨 theme:", name);

    document.body.setAttribute("data-theme", name);
  }
};
