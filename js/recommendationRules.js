// recommendationRules.js
LawAIApp.RecommendationRules = {
  generate() {
    const recommendations = [];
    const prog = LawAIApp.ProgressEngine.getProgress();
    const streakData = LawAIApp.StreakEngine.getStreakData();
    const identity = LawAIApp.IdentityEngine.getProfile();
    const health = LawAIApp.HealthScore.calculate();
    const portfolio = LawAIApp.PortfolioGenerator.getDistribution();
    const reviewToday = LawAIApp.ReviewQueue.getTodayReviews();
    const analytics = LawAIApp.AnalyticsEngine.getMetrics();

    // 1. 下一课推荐 (Critical)
    const nextLessonId = LawAIApp.LearningPathGenerator.getNextLesson();
    if (nextLessonId && !prog.completedLessons.includes(nextLessonId)) {
      recommendations.push({
        recommendationId: 'rec_next_lesson',
        type: 'learning',
        priority: 'critical',
        confidence: 95,
        title: 'Continue Your Learning Journey',
        description: `Complete Day ${prog.currentLesson} to keep progressing.`,
        reason: 'You have an unfinished lesson that is part of your current learning path.',
        action: { type: 'open_lesson', lessonId: nextLessonId },
        generatedAt: new Date().toISOString(),
        expiresAt: null,
        status: 'active'
      });
    }

    // 2. 每日复习 (High) - 如果有今日复习任务
    if (reviewToday.length > 0) {
      recommendations.push({
        recommendationId: 'rec_daily_review',
        type: 'review',
        priority: 'high',
        confidence: 85,
        title: 'Daily Review Ready',
        description: `You have ${reviewToday.length} lesson(s) to review today.`,
        reason: 'Regular review strengthens memory retention.',
        action: { type: 'open_review' },
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'active'
      });
    }

    // 3. 弱点提升 (Normal) - 根据知识分布最少的类别
    const categories = Object.entries(portfolio).sort((a,b) => a[1] - b[1]);
    if (categories.length > 0 && categories[0][1] < 20) {
      const weakCat = categories[0][0];
      const weakLesson = LawAIApp.SearchEngine.search(weakCat, { status: 'incomplete' })[0];
      if (weakLesson) {
        recommendations.push({
          recommendationId: 'rec_weak_area',
          type: 'skill',
          priority: 'normal',
          confidence: 70,
          title: `Boost Your ${weakCat} Skills`,
          description: `Take a lesson in ${weakCat} to balance your knowledge.`,
          reason: `Your progress in ${weakCat} is lower than other areas.`,
          action: { type: 'open_lesson', lessonId: weakLesson.lessonId },
          generatedAt: new Date().toISOString(),
          expiresAt: null,
          status: 'active'
        });
      }
    }

    // 4. 挑战推荐 (Normal) - 如果连续7天以上
    if (streakData.currentStreak >= 7) {
      recommendations.push({
        recommendationId: 'rec_streak_challenge',
        type: 'challenge',
        priority: 'normal',
        confidence: 60,
        title: 'Streak Challenge',
        description: 'Complete 3 lessons today to earn a bonus XP multiplier.',
        reason: 'You are on a great streak! Challenge yourself to go further.',
        action: { type: 'start_challenge', target: 3 },
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        status: 'active'
      });
    }

    // 5. 休息提醒 (Low) - 如果长时间学习（模拟，如已完成超过5节课今天）
    const todayCompletions = analytics.eventLog?.filter(e => e.eventType === 'LessonCompleted' && new Date(e.timestamp).toDateString() === new Date().toDateString()).length || 0;
    if (todayCompletions >= 5) {
      recommendations.push({
        recommendationId: 'rec_take_break',
        type: 'break',
        priority: 'low',
        confidence: 90,
        title: 'Take a Break',
        description: 'You have completed many lessons today. Rest your mind.',
        reason: 'Rest improves long-term retention and prevents burnout.',
        action: { type: 'none' },
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'active'
      });
    }

    return recommendations;
  }
};
