window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceEngine = {
  xp: 0,

  init() {
    console.log("📈 ExperienceEngine ready");
  },

  addXP(amount) {
    this.xp += amount;
    return this.xp;
  },

  getXP() {
    return this.xp;
  }
};
