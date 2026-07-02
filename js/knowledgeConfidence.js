// knowledgeConfidence.js
LawAIApp.KnowledgeConfidence = {
  // 计算单张卡片的置信度 (0-100)
  calculate(lessonId) {
    const card = LawAIApp.KnowledgeCard.get(lessonId);
    if (!card) return 0;

    let score = 50; // base
    const now = Date.now();

    // 复习完成加分 (模拟：从复习队列取数据)
    const reviews = LawAIApp.ReviewQueue.getLessonReviews(lessonId);
    const doneReviews = reviews.filter(r => r.done).length;
    const totalReviews = reviews.length || 1;
    score += (doneReviews / totalReviews) * 20;

    // 最近学习加分
    if (card.updatedAt) {
      const daysSince = (now - new Date(card.updatedAt).getTime()) / 86400000;
      if (daysSince < 1) score += 20;
      else if (daysSince < 7) score += 10;
      else if (daysSince < 30) score += 0;
      else score -= 20; // 衰减
    }

    // 反思质量加分（如果有反思内容）
    if (card.reflection && card.reflection.length > 0) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  },

  // 检测知识衰减并触发事件
  checkDecay(lessonId) {
    const card = LawAIApp.KnowledgeCard.get(lessonId);
    if (!card) return;
    const confidence = this.calculate(lessonId);
    if (confidence < card.confidence) {
      LawAIApp.EventBus.emit('ConfidenceUpdated', { knowledgeId: card.knowledgeId, oldConfidence: card.confidence, newConfidence: confidence });
      if (confidence < 40) LawAIApp.EventBus.emit('DecayDetected', { knowledgeId: card.knowledgeId, lessonId, confidence });
    }
    // 更新卡片置信度
    LawAIApp.KnowledgeCard.update(lessonId, { confidence });
  },

  // 定期检查所有卡片衰减 (由引擎调用)
  checkAll() {
    const cards = LawAIApp.KnowledgeCard.getAllCards();
    cards.forEach(c => this.checkDecay(c.lessonId));
  }
};
