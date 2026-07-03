// intelligenceRecommendations.js
LawAIApp.IntelligenceRecommendations = {
  generate() {
    const recommendations = [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const todayReviews = LawAIApp.MemoryScheduler?.getTodayReviewList() || [];
    const activeProjects = LawAIApp.ProjectTracker?.getActiveProjects() || [];
    const health = LawAIApp.IntelligenceHealth.calculate();

    // 1. 继续学习
    if (progress.currentLesson && progress.completionPercent < 100) {
      recommendations.push({
        type: 'lesson',
        priority: 'high',
        title: 'Continue Your Learning Path',
        description: `Next: Day ${progress.currentLesson}`,
        action: 'open_lesson'
      });
    }

    // 2. 复习提醒
    if (todayReviews.length > 0) {
      recommendations.push({
        type: 'review',
        priority: 'high',
        title: 'Memory Boost',
        description: `${todayReviews.length} review(s) due today`,
        action: 'open_review'
      });
    }

    // 3. 项目提醒
    if (activeProjects.length > 0) {
      recommendations.push({
        type: 'project',
        priority: 'normal',
        title: 'Continue Your Project',
        description: `${activeProjects.length} project(s) in progress`,
        action: 'open_project'
      });
    }

    // 4. 基于健康度的建议
    if (health < 50) {
      recommendations.push({
        type: 'break',
        priority: 'low',
        title: 'Take a Short Break',
        description: 'Learning health is low. Rest improves retention.',
        action: 'none'
      });
    } else if (health > 80) {
      recommendations.push({
        type: 'challenge',
        priority: 'low',
        title: 'Accept a Challenge',
        description: 'Your learning health is excellent!',
        action: 'open_challenge'
      });
    }

    return recommendations;
  }
};
