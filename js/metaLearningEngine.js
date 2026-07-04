// ===========================================
// metaLearningEngine.js
// 元学习引擎：学习如何优化学习系统本身
// ===========================================
LawAIApp.MetaLearningEngine = {
  _experienceKey: 'meta_learning_experience',

  getExperience() {
    return LawAIApp.StorageEngine.get(this._experienceKey, {
      previousFixes: [],
      effectiveStrategies: {},
      failurePatterns: {}
    });
  },

  // 记录一次自我修复的结果（用于未来优化）
  recordOutcome(issue, fix, success) {
    const exp = this.getExperience();
    exp.previousFixes.push({
      issueType: issue.type,
      fixAction: fix.action,
      success,
      timestamp: new Date().toISOString()
    });
    // 保留最近50条
    if (exp.previousFixes.length > 50) exp.previousFixes.splice(0, exp.previousFixes.length - 50);

    // 统计有效策略
    if (success) {
      if (!exp.effectiveStrategies[issue.type]) exp.effectiveStrategies[issue.type] = [];
      exp.effectiveStrategies[issue.type].push(fix.action);
    } else {
      if (!exp.failurePatterns[issue.type]) exp.failurePatterns[issue.type] = [];
      exp.failurePatterns[issue.type].push(fix.action);
    }

    LawAIApp.StorageEngine.set(this._experienceKey, exp);
  },

  // 基于历史推荐最佳修复动作
  recommendFix(issueType) {
    const exp = this.getExperience();
    const effective = exp.effectiveStrategies[issueType] || [];
    const failures = exp.failurePatterns[issueType] || [];
    // 简单过滤：排除已知失败的策略
    return effective.find(s => !failures.includes(s)) || 'unknown';
  }
};
