// goalAdjuster.js
LawAIApp.GoalAdjuster = {
  adjustDailyGoal() {
    const habits = LawAIApp.HabitTracker.getWeekHistory();
    const recentCompletions = habits.map(d => d.lessonsCompleted).filter(c => c > 0);
    if (recentCompletions.length === 0) return;

    const avg = recentCompletions.reduce((a, b) => a + b, 0) / recentCompletions.length;
    const newTarget = Math.max(1, Math.round(avg * 1.2));

    const allGoals = LawAIApp.StorageEngine.get('mentor_goals', []);
    const dailyGoals = allGoals.filter(g => g.type === 'daily' && !g.completed);
    if (dailyGoals.length > 0) {
      dailyGoals.forEach(g => {
        if (g.targetValue !== newTarget) {
          g.targetValue = newTarget;
          LawAIApp.StorageEngine.set('mentor_goals', allGoals);
          LawAIApp.EventBus.emit('GoalAdjusted', { goalId: g.id, newTarget });
        }
      });
    } else {
      if (LawAIApp.MentorGoals) {
        LawAIApp.MentorGoals.addGoal('daily', 'Daily Learning Goal', Math.max(1, Math.round(avg * 1.2)));
      }
    }
  },

  createRecoveryGoal() {
    const habits = LawAIApp.HabitTracker.getWeekHistory();
    const daysActive = habits.filter(d => d.lessonsCompleted > 0).length;
    if (daysActive < 2 && LawAIApp.MentorGoals) {
      LawAIApp.MentorGoals.addGoal('daily', 'Comeback: Complete 1 lesson today', 1);
      LawAIApp.EventBus.emit('HabitRecovered', { message: 'Recovery goal created' });
    }
  }
};
