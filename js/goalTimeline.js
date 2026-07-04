// goalTimeline.js (升级版)
// ✅ 保留原有功能：generate()、getFullTimeline()
// ✅ 新增功能：学习旅程时间线、进度追踪、技能解锁预测、AI 建议
LawAIApp.GoalTimeline = {
  // 生成目标的时间线（里程碑、历史事件）
  generate(goalId) {
    const goal = LawAIApp.GoalTracker._getStore().find(g => g.goalId === goalId);
    if (!goal) return [];

    const timeline = [];
    // 创建事件
    timeline.push({ date: goal.createdAt, event: 'Goal Created', type: 'system' });

    // 里程碑事件
    goal.progress.milestones.forEach(m => {
      timeline.push({ date: goal.updatedAt, event: `Milestone: ${m}`, type: 'milestone' });
    });

    // 如果有完成日期
    if (goal.status === 'completed') {
      timeline.push({ date: goal.updatedAt, event: 'Goal Completed', type: 'achievement' });
    }

    // 可加入进度更新事件（从GoalUpdated日志中提取，这里简化）
    return timeline.sort((a,b) => new Date(a.date) - new Date(b.date));
  },

  // 获取所有目标的汇总时间线
  getFullTimeline() {
    const allGoals = LawAIApp.GoalTracker._getStore();
    let fullTimeline = [];
    allGoals.forEach(g => {
      fullTimeline = fullTimeline.concat(this.generate(g.goalId));
    });
    return fullTimeline.sort((a,b) => new Date(a.date) - new Date(b.date));
  },

  // ========== 新增：学习旅程时间线 ==========
  generateTimeline(userId) {
    const user = LawAIApp.AuthService?.getCurrentUser();
    if (!user) return [];

    const progress = LawAIApp.ProgressEngine.getProgress();
    const currentCourseId = LawAIApp.StorageEngine.get(`current_course_${userId}`, 'course_ai_basics');
    const missions = LawAIApp.MissionFlowEngine?.generateMissions(currentCourseId) || [];
    const completedMissions = missions.filter(m => m.completed).length;
    const totalMissions = missions.length;
    const journeyPercent = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

    const timeline = [
      {
        phase: 'Current Mission',
        title: missions.find(m => !m.completed)?.title || 'All done!',
        status: completedMissions < totalMissions ? 'active' : 'completed',
        progress: `${completedMissions}/${totalMissions} missions`
      },
      {
        phase: 'Next Unlock',
        title: completedMissions >= totalMissions ? 'Advanced AI Concepts' : (missions[completedMissions]?.title || 'Continue learning'),
        status: completedMissions >= totalMissions ? 'unlocked' : 'locked',
        condition: `Complete ${totalMissions - completedMissions} more mission(s)`
      },
      {
        phase: 'Milestone',
        title: 'AI Fundamentals Certified',
        status: completedMissions >= totalMissions * 0.7 ? 'unlocked' : 'locked',
        progressPercent: Math.min(100, Math.round((completedMissions / (totalMissions * 0.7)) * 100))
      },
      {
        phase: 'Skill Unlock Prediction',
        title: this._predictNextSkillUnlock(userId),
        status: 'upcoming',
        estimatedMissions: this._estimateMissionsToUnlock(userId)
      },
      {
        phase: 'Final Goal',
        title: LawAIApp.CareerMappingEngine?.getCareersForLesson(missions[0]?.title || 'AI Basics')[0] || 'AI Engineer Path',
        status: completedMissions >= totalMissions ? 'unlocked' : 'locked',
        condition: 'Complete full course',
        journeyPercent
      }
    ];

    if (completedMissions >= totalMissions) {
      timeline.forEach(t => {
        if (t.phase !== 'Skill Unlock Prediction') t.status = 'completed';
      });
    }

    const nextAction = this._getNextAction(userId, completedMissions, totalMissions);
    if (nextAction) {
      timeline.push({ phase: 'AI Recommendation', title: nextAction, status: 'suggestion' });
    }

    return timeline;
  },

  getNextMilestone(userId) {
    const timeline = this.generateTimeline(userId);
    return timeline.find(t => t.status === 'locked') || null;
  },

  getJourneyPercent(userId) {
    const timeline = this.generateTimeline(userId);
    const finalGoal = timeline.find(t => t.phase === 'Final Goal');
    return finalGoal?.journeyPercent || 0;
  },

  // 预测下一个技能解锁
  _predictNextSkillUnlock(userId) {
    const userSkills = LawAIApp.SkillTracker?.getAllSkills() || [];
    const unmastered = userSkills.filter(s => s.mastery < 70);
    return unmastered.length > 0 ? unmastered[0].title || 'Unknown Skill' : 'Prompt Engineering';
  },

  // 估算解锁技能所需任务数
  _estimateMissionsToUnlock(userId) {
    const userSkills = LawAIApp.SkillTracker?.getAllSkills() || [];
    const unmastered = userSkills.filter(s => s.mastery < 70);
    return unmastered.length > 0 ? Math.ceil((70 - unmastered[0].mastery) / 10) : 3;
  },

  // AI 建议下一动作
  _getNextAction(userId, completedMissions, totalMissions) {
    if (completedMissions === 0) return 'Start your first mission to begin your journey.';
    if (completedMissions >= totalMissions) return 'Congratulations! Consider exploring advanced courses.';
    if (completedMissions / totalMissions < 0.3) return 'Keep the momentum! Complete a mission today.';
    if (completedMissions / totalMissions < 0.7) return 'You are making great progress. Try a challenge to test your skills.';
    return 'Almost there! Focus on your weak areas for the final push.';
  }
};
