// dailyPlanner.js
LawAIApp.DailyPlanner = {
  // 生成今日学习计划
  generate() {
    const plan = {
      lessons: [],
      reviews: [],
      practice: [],
      projects: [],
      reflection: null,
      estimatedMinutes: 0
    };

    // 1. 下一节新课程
    const nextLesson = LawAIApp.LearningPathGenerator.getNextLesson();
    if (nextLesson) {
      plan.lessons.push(nextLesson);
      plan.estimatedMinutes += 8;
    }

    // 2. 今日复习
    const todayReviews = LawAIApp.ReviewQueue.getTodayReviews();
    if (todayReviews.length > 0) {
      plan.reviews = todayReviews;
      plan.estimatedMinutes += todayReviews.length * 5;
    }

    // 3. 练习推荐（如果有弱项技能）
    const weakSkills = LawAIApp.GapDetector.getWeakSkills();
    if (weakSkills.length > 0) {
      const practiceLesson = LawAIApp.SearchEngine.search(weakSkills[0].title, { status: 'incomplete' })[0];
      if (practiceLesson) {
        plan.practice.push(practiceLesson.lessonId);
        plan.estimatedMinutes += 10;
      }
    }

    // 4. 活跃项目提醒
    const activeProjects = LawAIApp.ProjectTracker.getActiveProjects();
    if (activeProjects.length > 0) {
      plan.projects = activeProjects.map(p => p.projectId);
      plan.estimatedMinutes += 15;
    }

    // 5. 如果接近周末，添加反思
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      plan.reflection = 'weekly_reflection';
      plan.estimatedMinutes += 5;
    }

    // 存储到 localStorage
    LawAIApp.StorageEngine.set('daily_plan', plan);
    LawAIApp.EventBus.emit('PlanGenerated', { plan });
    return plan;
  },

  getTodaysPlan() {
    return LawAIApp.StorageEngine.get('daily_plan', null);
  }
};
