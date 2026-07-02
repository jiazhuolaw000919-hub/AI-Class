// levelEngine.js（原版，保持不动）
LawAIApp.LevelEngine = {
  // 经验曲线：0-100 为 Lv1，之后每级所需经验递增
  getXPForLevel(level) {
    if (level <= 1) return 100;
    return 100 + (level - 1) * 150; // Lv2:250, Lv3:400, ...
  },

  calculateLevel() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    let xp = prog.xp;
    let level = 1;
    let xpNeeded = this.getXPForLevel(level);

    while (xp >= xpNeeded) {
      xp -= xpNeeded;
      level++;
      xpNeeded = this.getXPForLevel(level);
    }

    return { level, currentLevelXP: xp, nextLevelXP: xpNeeded };
  }
};
