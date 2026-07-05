window.LawAIApp = window.LawAIApp || {};

LawAIApp.AmbientEngine = {
  setMood(mood) {
    console.log("🌫 ambient:", mood);

    document.body.setAttribute("data-mood", mood);
  }
};
