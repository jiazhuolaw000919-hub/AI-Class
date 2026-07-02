// milestoneEngine.js
LawAIApp.MilestoneEngine = {
  milestones: [
    { id: 'foundation_complete', name: 'Foundation Complete', condition: (prog) => prog.completedLessons.length >= 30 },
    { id: 'skill_builder', name: 'Skill Builder', condition: (prog) => prog.completedLessons.length >= 100 },
    { id: 'advanced_learner', name: 'Advanced Learner', condition: (prog) => prog.completedLessons.length >= 220 },
    { id: 'expert_journey', name: 'Expert Journey', condition: (prog) => prog.completedLessons.length >= 300 },
    { id: 'academy_master', name: 'Academy Master', condition: (prog) => prog.completedLessons.length >= 365 }
  ],

  getUnlockedMilestones() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    return this.milestones.filter(m => m.condition(prog));
  },

  checkMilestone(prog) {
    const unlocked = this.getUnlockedMilestones();
    const previously = LawAIApp.StorageEngine.get('unlocked_milestones', []);
    const newUnlocked = unlocked.filter(m => !previously.includes(m.id));
    if (newUnlocked.length > 0) {
      const updated = [...previously, ...newUnlocked.map(m => m.id)];
      LawAIApp.StorageEngine.set('unlocked_milestones', updated);
      newUnlocked.forEach(m => LawAIApp.EventBus.emit('MilestoneUnlocked', { milestone: m }));
    }
  }
};
