// diffAnalyzer.js
LawAIApp.DiffAnalyzer = {
  // 简单差异分析：比较两个版本的快照（假设快照保存为JSON对象）
  compare(oldSnapshot, newSnapshot) {
    const diff = {
      added: [],
      removed: [],
      changed: []
    };
    if (!oldSnapshot || !newSnapshot) return diff;
    const oldKeys = Object.keys(oldSnapshot);
    const newKeys = Object.keys(newSnapshot);
    // 新增字段
    newKeys.forEach(key => {
      if (!(key in oldSnapshot)) diff.added.push({ key, value: newSnapshot[key] });
      else if (JSON.stringify(oldSnapshot[key]) !== JSON.stringify(newSnapshot[key])) {
        diff.changed.push({ key, old: oldSnapshot[key], new: newSnapshot[key] });
      }
    });
    // 删除字段
    oldKeys.forEach(key => {
      if (!(key in newSnapshot)) diff.removed.push({ key, value: oldSnapshot[key] });
    });
    return diff;
  },

  // 生成可读的差异摘要
  generateSummary(diff) {
    const parts = [];
    if (diff.added.length) parts.push(`Added: ${diff.added.map(a => a.key).join(', ')}`);
    if (diff.removed.length) parts.push(`Removed: ${diff.removed.map(r => r.key).join(', ')}`);
    if (diff.changed.length) parts.push(`Changed: ${diff.changed.map(c => c.key).join(', ')}`);
    return parts.join('; ') || 'No structural changes';
  }
};
