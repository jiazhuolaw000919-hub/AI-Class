window.LawAIApp = window.LawAIApp || {};

LawAIApp.MotionSystem = {
  play(type) {
    console.log("🎬 motion:", type);

    document.body.classList.add(`motion-${type}`);

    setTimeout(() => {
      document.body.classList.remove(`motion-${type}`);
    }, 800);
  }
};
