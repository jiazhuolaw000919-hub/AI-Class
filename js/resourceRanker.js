// resourceRanker.js
LawAIApp.ResourceRanker = {
  // 根据质量分数排序（official > professional > community > reference > archive）
  qualityWeight: {
    'official': 100,
    'professional': 80,
    'community': 60,
    'reference': 40,
    'archive': 20
  },

  // 对资源列表排序（按质量降序，同质量按更新时间）
  rank(resources) {
    return resources.sort((a, b) => {
      const wA = this.qualityWeight[a.qualityScore] || 0;
      const wB = this.qualityWeight[b.qualityScore] || 0;
      if (wA !== wB) return wB - wA;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  },

  // 获取最佳资源
  getBest(lessonId) {
    const resources = LawAIApp.ResourceRegistry.getAll(lessonId);
    return this.rank(resources)[0] || null;
  }
};
