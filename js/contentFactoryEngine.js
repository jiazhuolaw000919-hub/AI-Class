// ===========================================
// contentFactoryEngine.js
// 内容工厂引擎：为文明生成结构化学习包
// ===========================================
LawAIApp.ContentFactoryEngine = {
  // 生成 AI 文明核心课程包
  bootstrapCoreContent() {
    // 定义核心领域
    const domains = [
      { id: 'ai_fundamentals', name: 'AI Fundamentals', skills: ['AI Basics', 'Machine Learning', 'Neural Networks'] },
      { id: 'prompt_engineering', name: 'Prompt Engineering', skills: ['Prompt Design', 'ChatGPT', 'Claude'] },
      { id: 'ai_ethics', name: 'AI Ethics & Safety', skills: ['Ethical AI', 'Bias Detection', 'Responsible AI'] }
    ];

    domains.forEach(domain => {
      // 创建课程包资产
      const assetId = `asset_civ_${domain.id}`;
      LawAIApp.LearningAssetManager.addAsset({
        id: assetId,
        type: 'course',
        title: domain.name,
        description: `Civilization core module: ${domain.name}`,
        creator: 'CivOS',
        lessons: [], // 稍后填充
        effectivenessScore: 85,
        rating: 4.8,
        tags: ['civilization', 'core']
      });

      // 创建技能节点
      domain.skills.forEach(skillName => {
        const skillId = `skill_${skillName.toLowerCase().replace(/\s/g, '_')}`;
        LawAIApp.SkillTracker?.register(skillId, {
          title: skillName,
          description: `Master ${skillName}`,
          academyId: 'academy_ai_foundation',
          relatedLessons: []
        });
        // 关联资产与技能
        LawAIApp.GraphEdgeManager.addEdge(assetId, skillId, 'teaches', 1);
      });

      // 生成基础课程节点（示例）
      for (let i = 1; i <= 3; i++) {
        const lessonId = `civ_${domain.id}_lesson_${i}`;
        LawAIApp.LessonEngine?.createLesson?.(lessonId, {
          title: `${domain.name} – Concept ${i}`,
          duration: '10 min',
          category: domain.name,
          xpReward: 25
        });
        // 将课程添加到资产
        const asset = LawAIApp.LearningAssetManager.getAsset(assetId);
        if (asset) {
          asset.lessons.push(lessonId);
          LawAIApp.LearningAssetManager.updateAsset(assetId, { lessons: asset.lessons });
        }
        // 注册图节点
        LawAIApp.GraphNodeManager.addNode(lessonId, 'lesson', {
          title: `${domain.name} – Concept ${i}`,
          category: domain.name,
          strength: 60
        });
        // 创建前置关系
        if (i > 1) {
          LawAIApp.GraphEdgeManager.addEdge(`civ_${domain.id}_lesson_${i-1}`, lessonId, 'prerequisite', 1);
        }
      }
    });

    console.log('Core civilization content bootstrapped.');
  }
};
