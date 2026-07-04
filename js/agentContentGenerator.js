LawAIApp.AgentContentGenerator = {
  generateCourseFromWeakAreas() {
    const weak = LawAIApp.GraphVisualizationEngine?.getWeakZones() || [];
    if (!weak.length) return null;
    const lessons = weak.map(w => w.id).slice(0, 3);
    const id = 'agent_course_' + Date.now();
    const asset = { id, type: 'course', title: 'Personalized Weakness Review', description: 'AI-generated', creator: 'MentorAgent', lessons, effectivenessScore: 70, usageCount: 0, rating: 0, tags: ['personalized','weakness'] };
    LawAIApp.LearningAssetManager.addAsset(asset);
    LawAIApp.KnowledgeAssetGraph.registerAssetNode(id);
    return asset;
  },
  recommendTopContent() {
    return LawAIApp.CourseRankingSystem.getTopAssets(3);
  }
};
