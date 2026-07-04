// ===========================================
// missionFlowEngine.js
// 任务流引擎：将课程分解为任务，管理任务进度、奖励与解锁
// ===========================================
LawAIApp.MissionFlowEngine = {
  // 为课程生成任务列表
  generateMissions(courseId) {
    const course = LawAIApp.StorageEngine.get(`course_${courseId}`);
    if (!course) return [];
    // 示例：将课程课程列表转换为任务
    const lessons = course.lessons || [];
    return lessons.map((lesson, index) => ({
      id: `mission_${courseId}_${index + 1}`,
      title: lesson.title || `Mission ${index + 1}`,
      goal: `Complete ${lesson.title} and master the core concepts.`,
      estimatedTime: lesson.estimatedTime || 15,
      xpReward: 50 + index * 10,
      skillsUnlocked: [`skill_${lesson.category}`] || [],
      badge: index === lessons.length - 1 ? 'Course Complete' : `Chapter ${index + 1}`,
      completed: false,
      order: index + 1
    }));
  },

  // 获取下一个未完成的任务
  getNextMission(courseId) {
    const missions = this.generateMissions(courseId);
    return missions.find(m => !m.completed) || null;
  },

  // 完成任务
  completeMission(courseId, missionId, userId) {
    const missions = this.generateMissions(courseId);
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return false;
    mission.completed = true;
    // 发放 XP
    if (userId) {
      LawAIApp.XPRewardEngine.awardMissionXP(userId, mission.xpReward);
    }
    // 保存任务进度
    const progress = LawAIApp.StorageEngine.get(`mission_progress_${userId}_${courseId}`, {});
    progress[missionId] = true;
    LawAIApp.StorageEngine.set(`mission_progress_${userId}_${courseId}`, progress);

    LawAIApp.EventBus.emit('MissionCompleted', { courseId, missionId, userId, xp: mission.xpReward });
    return true;
  }
};
