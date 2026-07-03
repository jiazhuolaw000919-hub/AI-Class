// dependencyValidator.js (Phase 38 专用，避免冲突)
LawAIApp.KREDependencyValidator = {
  // 检查是否存在循环依赖（简单 DFS）
  hasCycle(nodeId, visited = new Set(), stack = new Set()) {
    if (stack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    stack.add(nodeId);
    const deps = LawAIApp.KRERegistry.getByNode(nodeId)
      .filter(r => r.relationshipType === 'requires' && r.sourceNode === nodeId)
      .map(r => r.targetNode);
    for (const dep of deps) {
      if (this.hasCycle(dep, visited, stack)) return true;
    }
    stack.delete(nodeId);
    return false;
  },

  // 验证某个节点的所有前置依赖是否存在
  checkPrerequisites(nodeId, availableNodeIds) {
    const missing = [];
    const prereqs = LawAIApp.KRERegistry.getByNode(nodeId)
      .filter(r => r.relationshipType === 'prerequisite' && r.targetNode === nodeId);
    prereqs.forEach(r => {
      if (!availableNodeIds.includes(r.sourceNode)) missing.push(r.sourceNode);
    });
    return missing;
  },

  // 对新增关系进行完整验证
  validateRelation(source, target, type) {
    const errors = [];
    if (!source || !target) errors.push('Source and target must be specified');
    const validTypes = ['prerequisite','requires','related','alternative','extension','recommendedBefore','recommendedAfter','supportsSkill','usedInProject','belongsToCareer'];
    if (!validTypes.includes(type)) errors.push(`Invalid relationship type: ${type}`);
    // 检查是否已存在相同的关系
    const exists = LawAIApp.KRERegistry.getAll().some(r =>
      r.sourceNode === source && r.targetNode === target && r.relationshipType === type);
    if (exists) errors.push('Duplicate relationship');
    return errors;
  }
};
