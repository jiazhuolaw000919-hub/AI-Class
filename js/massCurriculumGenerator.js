// ===========================================
// massCurriculumGenerator.js
// 大规模课程生成器：管理多领域并行生成
// ===========================================
LawAIApp.MassCurriculumGenerator = {
  // 处理一个领域定义，返回生产报告
  produceCurriculum(domainDef) {
    const clusterResult = LawAIApp.SkillClusterProcessor.decomposeDomain(domainDef);
    // 1. 生成课程
    const lessonIds = LawAIApp.LessonPipelineEngine.generateLessonsForClusters(
      clusterResult.clusters, domainDef.id, 3
    );
    // 2. 生成评估
    LawAIApp.AssessmentFactory.generateForLessons(lessonIds);
    // 3. 打包
    const packageId = LawAIApp.CurriculumPackagingSystem.packageDomain(
      domainDef.id, domainDef.name, lessonIds
    );
    // 4. 返回生产摘要
    return {
      domain: domainDef.name,
      lessonCount: lessonIds.length,
      packageId,
      rootSkill: clusterResult.rootSkillId,
      clusterCount: clusterResult.clusters.length
    };
  },

  // 批量生产多个领域
  produceMultiple(domainDefs) {
    const reports = [];
    domainDefs.forEach(def => {
      const report = this.produceCurriculum(def);
      reports.push(report);
      console.log(`[Curriculum Factory] Produced: ${report.domain} (${report.lessonCount} lessons)`);
    });
    LawAIApp.EventBus.emit('CurriculumFactoryProductionComplete', { reports });
    return reports;
  }
};
