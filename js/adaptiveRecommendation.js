// adaptiveRecommendation.js (Phase 34 专用，不覆盖 Phase 18)
LawAIApp.AdaptiveRecommendation = {
  // 生成带解释的智能推荐
  generate(limit = 3) {
    const recs = [];
    const gap = LawAIApp.GapDetector.getReport();

    // 如果存在知识缺口，推荐补全
    if (gap.missingPrerequisites.length > 0) {
      recs.push({
        type: 'review',
        priority: 'high',
        title: 'Fill Knowledge Gap',
        description: `Complete prerequisite lessons: ${gap.missingPrerequisites.slice(0,2).join(', ')}`,
        reason: 'Missing prerequisites may block your understanding of advanced topics.',
        expectedBenefit: 'Solidify foundation',
        estimatedTime: '10 min',
        goalImpact: 'High'
      });
    }

    // 弱项技能推荐
    if (gap.weakSkills.length > 0) {
      recs.push({
        type: 'skill',
        priority: 'high',
        title: 'Strengthen Weak Skills',
        description: `Focus on improving: ${gap.weakSkills.join(', ')}`,
        reason: 'Your mastery in these areas is below expectations.',
        expectedBenefit: 'Boost skill mastery',
        estimatedTime: '15 min',
        goalImpact: 'High'
      });
    }

    // 低保留率复习
    if (gap.lowRetention.length > 0) {
      recs.push({
        type: 'review',
        priority: 'normal',
        title: 'Memory Reinforcement',
        description: 'Review lessons with low memory strength.',
        reason: 'Regular review prevents knowledge decay.',
        expectedBenefit: 'Improve long-term retention',
        estimatedTime: '10 min',
        goalImpact: 'Medium'
      });
    }

    return recs.slice(0, limit);
  },

  // 获取推荐解释
  explain(recommendation) {
    return `${recommendation.reason} Expected benefit: ${recommendation.expectedBenefit}.`;
  }
};
