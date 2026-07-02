// levelSystem.js
LawAIApp.LevelSystem = {
  // 获取达到某级所需的总 XP（阈值）
  getXPForLevel(level) {
    if (level <= 1) return 100;
    return 100 + (level - 1) * 150; // 每级递增 150 XP
  },

  // 根据总 XP 计算等级信息
  getLevelInfo(totalXP) {
    let level = 1;
    let xpNeeded = this.getXPForLevel(level);
    let remainingXP = totalXP;

    while (remainingXP >= xpNeeded) {
      remainingXP -= xpNeeded;
      level++;
      xpNeeded = this.getXPForLevel(level);
    }

    return {
      level: level,
      currentLevelXP: remainingXP,
      nextLevelXP: xpNeeded,
      totalXP: totalXP
    };
  },

  // 获取从某级升级所需 XP（含当前级已获取的）
  getXpToNextLevel(totalXP) {
    const info = this.getLevelInfo(totalXP);
    return info.nextLevelXP - info.currentLevelXP;
  }
};
