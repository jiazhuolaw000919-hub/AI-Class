// ===========================================
// courseExperienceEngine.js
// 课程体验主引擎：协调任务、练习、挑战、反思和XP
// ===========================================
LawAIApp.CourseExperienceEngine = {
  // 开始一个课程体验
  async startCourse(userId, courseId) {
    // 检查或生成任务列表
    let missions = LawAIApp.StorageEngine.get(`missions_${courseId}`);
    if (!missions) {
      missions = LawAIApp.MissionFlowEngine.generateMissions(courseId);
      LawAIApp.StorageEngine.set(`missions_${courseId}`, missions);
    }

    // 获取当前未完成的任务
    const currentMission = missions.find(m => !m.completed);
    if (!currentMission) {
      console.log('All missions completed!');
      return { status: 'completed' };
    }

    // 生成练习
    const practice = LawAIApp.PracticeEngine.generatePractice(currentMission.title);

    // 返回完整体验包
    return {
      mission: currentMission,
      practice,
      challenge: LawAIApp.ChallengeSystem.generateChallenge(currentMission)
    };
  },

  // 完成任务并推进
  async completeMissionAndAdvance(userId, courseId, missionId, reflection) {
    // 完成任务
    LawAIApp.MissionFlowEngine.completeMission(courseId, missionId, userId);

    // 保存反思
    if (reflection) {
      LawAIApp.ReflectionEngine.saveReflection(userId, missionId, reflection);
    }

    // 自动解锁下一个任务
    const nextMission = LawAIApp.MissionFlowEngine.getNextMission(courseId);
    if (nextMission) {
      LawAIApp.EventBus.emit('NextMissionUnlocked', { courseId, mission: nextMission });
    } else {
      LawAIApp.EventBus.emit('CourseCompleted', { courseId, userId });
    }

    return nextMission;
  }
};
