// ===========================================
// skillDeploymentEngine.js
// 技能部署引擎：处理任务完成后的反馈循环
// ===========================================
LawAIApp.SkillDeploymentEngine = {
  handleTaskCompletion(task) {
    // 1. 提升相关技能的实际应用分数（如果 SkillTracker 存在）
    if (LawAIApp.SkillTracker) {
      const skillId = task.skillId;
      LawAIApp.SkillTracker.addExperience?.(skillId, 'work_task', 8);
    }

    // 2. 更新证书的有效性（可根据任务表现调整）
    const certs = LawAIApp.SkillValidationEngine?.getCertificates() || [];
    const cert = certs.find(c => c.skillId === task.skillId);
    if (cert && task.performanceScore) {
      // 简单调整：如果表现好，略微提升证书分数
      const newScore = Math.min(100, cert.masteryScore + (task.performanceScore > 0.8 ? 3 : 0));
      // 注意：这里不直接修改证书，而是重新认证（会生成新证书）
      // 但为了简化，我们可以直接调用 CertificationGenerator 再次验证
      LawAIApp.CertificationGenerator.certifySkill(task.skillId);
    }

    // 3. 更新学习图谱：添加工作节点或加强边
    LawAIApp.GraphNodeManager.addNode(task.taskId, 'work_task', {
      strength: task.performanceScore ? task.performanceScore * 100 : 50,
      relatedSkill: task.skillId
    });
    LawAIApp.GraphEdgeManager.addEdge(task.skillId, task.taskId, 'deployed_in', 2);

    // 4. 生成新的任务建议
    LawAIApp.SkillTaskMatcher.generateMatches();
  }
};
