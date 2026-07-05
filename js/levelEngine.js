window.LawAIApp = window.LawAIApp || {};

LawAIApp.LevelEngine = {
  level: 1,

  init() {
    console.log("🧠 LevelEngine ready");
  },

  addXP(amount) {
    this.level += Math.floor(amount / 100);
    return this.level;
  },

  getLevel() {
    return this.level;
  }
};
