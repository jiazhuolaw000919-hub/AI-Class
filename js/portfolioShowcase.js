// portfolioShowcase.js
LawAIApp.PortfolioShowcase = {
  // 获取完整作品集（项目 + 技能 + 成就 + 统计）
  getShowcase() {
    const projects = LawAIApp.PortfolioEngine ? LawAIApp.PortfolioEngine.getPortfolio() : [];
    const skills = LawAIApp.SkillTracker ? LawAIApp.SkillTracker.getAllSkills() : [];
    const achievements = LawAIApp.AchievementEngine ? LawAIApp.AchievementEngine.getUnlocked() : [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const xp = LawAIApp.XPEngine.getCurrentXP();
    const level = LawAIApp.LevelEngine.calculateLevel().level;
    const streak = LawAIApp.StreakEngine.getStreakData().currentStreak;

    return {
      projects: projects.map(p => ({
        id: p.projectId,
        title: p.title,
        description: p.description,
        skills: p.skills || [],
        completedDate: p.completedDate || p.addedAt,
        reflection: p.progress?.reflection || ''
      })),
      skills: skills.map(s => ({
        name: s.title,
        mastery: s.mastery,
        level: LawAIApp.MasteryEngine.getLevelName(s.mastery)
      })),
      achievements: achievements.map(id => {
        const ach = LawAIApp.AchievementEngine.achievements.find(a => a.id === id);
        return { name: ach?.name, description: ach?.desc };
      }),
      stats: {
        xp,
        level,
        lessonsCompleted: progress.completedLessons.length,
        completionPercent: progress.completionPercent.toFixed(1),
        streak,
        totalProjects: projects.length
      }
    };
  }
};
