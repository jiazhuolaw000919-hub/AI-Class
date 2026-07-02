// resourceHealth.js
LawAIApp.ResourceHealth = {
  // 检查资源健康状态（模拟，基于 status 和 updatedAt）
  check(resource) {
    if (resource.status === 'deprecated') return 'deprecated';
    const daysSinceUpdate = (Date.now() - new Date(resource.updatedAt).getTime()) / 86400000;
    if (daysSinceUpdate > 365) return 'outdated';
    // 未来可加入链接检查，这里返回正常
    return 'healthy';
  },

  // 获取所有不健康的资源
  getUnhealthy() {
    const all = LawAIApp.ResourceRegistry.getAll();
    return all.filter(r => this.check(r) !== 'healthy');
  },

  // 自动标记过期资源为废弃
  autoDeprecate() {
    const unhealthy = this.getUnhealthy();
    unhealthy.forEach(r => {
      if (this.check(r) === 'outdated' || this.check(r) === 'deprecated') {
        LawAIApp.ResourceRegistry.deprecate(r.resourceId);
      }
    });
  }
};
