// contentPipeline.js
LawAIApp.ContentPipeline = {
  // 状态流转表
  transitions: {
    'draft': ['review'],
    'review': ['draft','qa'],
    'qa': ['review','published'],
    'published': ['deprecated','archived'],
    'deprecated': ['archived'],
    'archived': []
  },

  // 推进内容到下一阶段
  advance(contentId, targetStatus) {
    const content = LawAIApp.ContentRegistry.get(contentId);
    if (!content) return false;
    const allowed = this.transitions[content.status] || [];
    if (!allowed.includes(targetStatus)) return false;

    content.status = targetStatus;
    content.updatedAt = new Date().toISOString();
    if (targetStatus === 'published') {
      content.publishedAt = content.publishedAt || new Date().toISOString();
    }
    LawAIApp.ContentRegistry.register(content);

    if (targetStatus === 'published') {
      LawAIApp.EventBus.emit('ContentPublished', { contentId });
    }
    return true;
  },

  // 获取某个状态的所有内容
  getByStatus(status) {
    return LawAIApp.ContentRegistry.filter({ status });
  }
};
