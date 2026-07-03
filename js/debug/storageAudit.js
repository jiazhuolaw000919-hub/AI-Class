// storageAudit.js
LawAIApp.StorageAudit = {
  // 审计所有 LocalStorage 键
  audit() {
    const report = [];
    const knownPrefixes = [
      'lawai_progress', 'lawai_completedLessons', 'lawai_streakData',
      'lawai_allLessons', 'lawai_secondBrain', 'lawai_reviewQueue',
      'lawai_achievements', 'lawai_favorites', 'lawai_bookmarks',
      'lawai_xp_data', 'lawai_xp_history', 'lawai_skill_',
      'lawai_goals', 'lawai_projects', 'lawai_portfolio',
      'lawai_content_', 'lawai_career_', 'lawai_learning_',
      'lawai_workspace_', 'lawai_daily_plan', 'lawai_memory_',
      'lawai_practice_', 'lawai_resource_', 'lawai_pack_',
      'lawai_boot_report', 'lawai_current_theme', 'lawai_darkMode'
    ];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lawai_')) {
        const isKnown = knownPrefixes.some(prefix => key.startsWith(prefix));
        report.push({ key, known: isKnown });
      }
    }

    const orphanKeys = report.filter(r => !r.known).map(r => r.key);
    return {
      totalKeys: report.length,
      orphanKeys,
      clean: orphanKeys.length === 0
    };
  },

  // 清理孤儿数据
  cleanOrphans() {
    const { orphanKeys } = this.audit();
    orphanKeys.forEach(key => localStorage.removeItem(key));
    return orphanKeys.length;
  }
};
