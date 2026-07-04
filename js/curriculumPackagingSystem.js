// ===========================================
// curriculumPackagingSystem.js
// 课程打包系统：将课程、练习、评估封装为标准课程包资产
// ===========================================
LawAIApp.CurriculumPackagingSystem = {
  // 打包领域下的所有课程为资产
  packageDomain(domainId, domainName, lessonIds) {
    const assetId = `curriculum_${domainId}`;
    // 移除旧版本（如果存在）
    if (LawAIApp.LearningAssetManager.getAsset(assetId)) {
      // 简单覆盖更新
    }
    LawAIApp.LearningAssetManager.addAsset({
      id: assetId,
      type: 'full_curriculum',
      title: `${domainName} – Complete Curriculum`,
      description: `Factory-produced curriculum for ${domainName}. Includes lessons, practice, and assessments.`,
      creator: 'CivOS Curriculum Factory',
      lessons: lessonIds,
      effectivenessScore: 85,
      rating: 4.8,
      tags: ['factory', domainId, 'complete']
    });
    // 同时将课程包注册到全球图谱
    LawAIApp.GraphNodeManager.addNode(assetId, 'curriculum_pack', {
      title: `${domainName} Curriculum`,
      lessonCount: lessonIds.length,
      status: 'active'
    });
    lessonIds.forEach(lessonId => {
      LawAIApp.GraphEdgeManager.addEdge(assetId, lessonId, 'packages', 1);
    });
    return assetId;
  }
};
