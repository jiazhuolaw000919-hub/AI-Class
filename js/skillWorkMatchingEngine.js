// ===========================================
// skillWorkMatchingEngine.js (主协调器)
// ===========================================
LawAIApp.SkillWorkMatchingEngine = {
  init() {
    // 当新证书生成时，自动生成任务匹配
    LawAIApp.EventBus.on('SkillCertified', (credential) => {
      LawAIApp.SkillTaskMatcher.generateMatches();
    });

    // 任务完成时更新劳动力数据
    LawAIApp.EventBus.on('WorkTaskCompleted', (task) => {
      LawAIApp.WorkforceSimulationEngine.updateAfterTask(task);
      // 检查是否需要生成新任务
      const availableTasks = LawAIApp.TaskGenerationEngine.getAvailableTasks();
      if (availableTasks.length < 3) {
        const matches = LawAIApp.SkillTaskMatcher.generateMatches();
        if (matches.length > 0) {
          LawAIApp.TaskGenerationEngine.generateTask(matches[0]);
        }
      }
    });

    // 定期刷新匹配 (仅当证书存在时)
    setInterval(() => {
      const certs = LawAIApp.SkillValidationEngine?.getCertificates();
      if (certs && certs.length > 0) {
        LawAIApp.SkillTaskMatcher.generateMatches();
      }
    }, 60000 * 10); // 每10分钟刷新一次

    console.log('Skill-to-Work Matching Engine activated.');
  },

  // 用户接口：获取当前可接的任务列表
  getJobBoard() {
    return LawAIApp.TaskGenerationEngine.getAvailableTasks();
  },

  // 接受并开始工作
  acceptJob(taskId) {
    return LawAIApp.WorkAssignmentEngine.acceptAndStartTask(taskId);
  },

  // 提交工作成果
  submitWork(taskId, performance) {
    return LawAIApp.WorkAssignmentEngine.completeTask(taskId, performance);
  },

  // 查看工作统计
  getWorkStats() {
    return LawAIApp.WorkforceSimulationEngine.getProductivityReport();
  }
};

// 自动初始化
setTimeout(() => LawAIApp.SkillWorkMatchingEngine.init(), 1000);
