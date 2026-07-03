// mentorPlanner.js
LawAIApp.MentorPlanner = {
  getDailyPlan() {
    const recs = LawAIApp.MentorRecommendations.generate();
    const focus = LawAIApp.DailyFocusEngine.getTodayFocus();
    const progress = LawAIApp.ProgressEngine.getProgress();
    return {
      todayFocus: focus.title,
      estimatedMinutes: focus.estimatedMinutes,
      priorityActions: recs.filter(r=>r.priority==='high').map(r=>r.message),
      encouragement: recs.find(r=>r.type==='encouragement'||r.type==='congrats')?.message || 'Keep up the great work!'
    };
  }
};
