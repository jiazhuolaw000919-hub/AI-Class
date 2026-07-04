// plannerPriority.js
LawAIApp.PlannerPriority = {
  // 获取所有候选任务并计算优先级
  getRankedTasks() {
    const tasks = [];
    const progress = LawAIApp.ProgressEngine.getProgress();
    const memoryScheduler = LawAIApp.MemoryScheduler;
    const activeProjects = LawAIApp.ProjectTracker ? LawAIApp.ProjectTracker.getActiveProjects() : [];
    const goals = LawAIApp.GoalEngine ? LawAIApp.GoalEngine.getActiveGoals() : [];
    const todayReviewList = memoryScheduler ? memoryScheduler.getTodayReviewList() : [];
    const currentLesson = LawAIApp.LessonEngine.getLessonByDay(progress.currentLesson);
    const health = LawAIApp.IntelligenceHealth ? LawAIApp.IntelligenceHealth.calculate() : 50;
    const memoryHealth = memoryScheduler ? memoryScheduler.calculateMemoryHealth() : 100;

    // 1. 继续学习路径（如果没有完成）
    if (currentLesson && !progress.completedLessons.includes(currentLesson.lessonId)) {
      tasks.push({
        id: 'lesson_' + currentLesson.lessonId,
        type: 'lesson',
        title: currentLesson.title,
        description: 'Continue your learning path',
        estimatedMinutes: parseInt(currentLesson.duration) || 8,
        impact: 90,
        risk: 0,
        alignment: 80,
        source: 'learning_path'
      });
    }

    // 2. 今日复习任务（记忆风险高）
    todayReviewList.forEach(lessonId => {
      const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
      if (lesson) {
        const mem = LawAIApp.MemoryTracker.getOrCreate(lessonId);
        const risk = 100 - mem.strength; // 强度越低风险越高
        tasks.push({
          id: 'review_' + lessonId,
          type: 'review',
          title: 'Review: ' + lesson.title,
          description: 'Strengthen memory retention',
          estimatedMinutes: 5,
          impact: 70,
          risk: risk,
          alignment: 60,
          source: 'memory'
        });
      }
    });

    // 3. 未完成的实践（如果有）
    // 简化：取第一个模块的未完成实践
    if (LawAIApp.PracticeData) {
      const allModules = LawAIApp.ModuleData.modules;
      for (const mod of allModules) {
        const practices = LawAIApp.PracticeData.getPracticesByModule(mod.id);
        const progress = LawAIApp.ModuleProgress.get(mod.id);
        const incomplete = practices.filter(p => !progress.completedPractices?.includes(p.practiceId));
        if (incomplete.length > 0) {
          tasks.push({
            id: 'practice_' + incomplete[0].practiceId,
            type: 'practice',
            title: incomplete[0].title,
            description: 'Apply your knowledge',
            estimatedMinutes: incomplete[0].estimatedMinutes || 10,
            impact: 60,
            risk: 20,
            alignment: 50,
            source: 'practice'
          });
          break;
        }
      }
    }

    // 4. 活跃项目（高影响）
    activeProjects.forEach(project => {
      tasks.push({
        id: 'project_' + project.projectId,
        type: 'project',
        title: project.title,
        description: 'Continue your project',
        estimatedMinutes: 20,
        impact: 85,
        risk: 10,
        alignment: 75,
        source: 'project'
      });
    });

    // 5. 目标相关（如果有）
    goals.forEach(goal => {
      tasks.push({
        id: 'goal_' + goal.goalId,
        type: 'goal',
        title: goal.title,
        description: 'Work towards your goal',
        estimatedMinutes: 15,
        impact: 50,
        risk: 0,
        alignment: 100,
        source: 'goal'
      });
    });

    // 6. 可选挑战（如果学习健康高）
    if (health > 70 && memoryHealth > 70) {
      tasks.push({
        id: 'challenge_optional',
        type: 'challenge',
        title: 'Optional Challenge',
        description: 'Push your limits',
        estimatedMinutes: 10,
        impact: 40,
        risk: 0,
        alignment: 30,
        source: 'challenge'
      });
    }

    // 计算总分并排序
    tasks.forEach(task => {
      task.priorityScore = (task.impact * 0.4) + ((100 - task.risk) * 0.3) + (task.alignment * 0.3);
    });

    tasks.sort((a, b) => b.priorityScore - a.priorityScore);

    return tasks;
  }
};
