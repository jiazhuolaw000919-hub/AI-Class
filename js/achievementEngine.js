// achievementEngine.js
LawAIApp.AchievementEngine = {
  achievements: [
    { id: 'first_lesson', name: 'First Lesson', desc: 'Complete your first lesson', target: 1 },
    { id: 'streak_7', name: '7 Day Streak', desc: 'Maintain a 7-day streak', target: 7 },
    { id: 'streak_30', name: '30 Day Streak', desc: 'Maintain a 30-day streak', target: 30 },
    { id: 'lessons_100', name: 'Century', desc: 'Complete 100 lessons', target: 100 },
    { id: 'lessons_365', name: 'Year Round', desc: 'Complete all 365 lessons', target: 365 },
    { id: 'prompt_master', name: 'Prompt Master', desc: 'Complete all Prompt Engineering lessons', category: 'Prompt Engineering' },
    { id: 'coding_master', name: 'Coding Master', desc: 'Complete all Coding lessons', category: 'Coding' },
    { id: 'api_master', name: 'API Master', desc: 'Complete all API lessons', category: 'API' }
  ],

  getUnlocked() {
    return LawAIApp.StorageEngine.get('unlockedAchievements', []);
  },

  unlock(id) {
    const unlocked = this.getUnlocked();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      LawAIApp.StorageEngine.set('unlockedAchievements', unlocked);

      // 🔥 Bible Part 52: 发事件 → AvatarEngine 自动装备
      try {
        var def = this.achievements.find(function(a) { return a.id === id; });
        LawAIApp.EventBus.emit('AvatarUnlocked', {
          id: id,
          name: def ? def.name : id,
          timestamp: Date.now()
        });
      } catch (e) {}

      // 记录最近的成就（用于 Dashboard celebrate）
      try {
        var def2 = this.achievements.find(function(a) { return a.id === id; });
        LawAIApp.StorageEngine.set('recent_achievement', {
          id: id,
          title: def2 ? def2.name : id,
          icon: this._getIcon(id),
          earnedAt: new Date().toISOString()
        });
      } catch (e) {}
    }
  },

  _getIcon(id) {
    var ICON_MAP = {
      first_lesson: '📖',
      streak_7: '🔥',
      streak_30: '⚡',
      lessons_100: '💯',
      lessons_365: '🏆',
      prompt_master: '✏️',
      coding_master: '💻',
      api_master: '🔌'
    };
    return ICON_MAP[id] || '🏆';
  },

  // 在完成课程后调用，检查所有成就条件
  checkAll() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const streak = LawAIApp.StreakEngine.getStreakData();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();

    // 课程完成数
    const completedCount = prog.completedLessons.length;
    if (completedCount >= 1) this.unlock('first_lesson');
    if (completedCount >= 100) this.unlock('lessons_100');
    if (completedCount >= 365) this.unlock('lessons_365');

    // 连续签到
    if (streak.currentStreak >= 7) this.unlock('streak_7');
    if (streak.currentStreak >= 30) this.unlock('streak_30');

    // 特定类别成就
    const checkCategory = (catId, categoryName) => {
      const allInCategory = allLessons.filter(l => l.category === categoryName);
      const completedInCategory = allInCategory.filter(l => prog.completedLessons.includes(l.lessonId));
      if (allInCategory.length > 0 && completedInCategory.length === allInCategory.length) {
        this.unlock(catId);
      }
    };
    checkCategory('prompt_master', 'Prompt Engineering');
    checkCategory('coding_master', 'Coding');
    checkCategory('api_master', 'API');
  }
};
