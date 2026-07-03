// relationshipEngine.js
LawAIApp.RelationshipEngine = {
  _getStore() {
    return LawAIApp.StorageEngine.get('graph_relationships', []);
  },
  _save(rels) { LawAIApp.StorageEngine.set('graph_relationships', rels); },

  // 自动构建所有节点之间的关系
  buildRelationships() {
    const nodes = LawAIApp.NodeRegistry.getAllNodes();
    const relationships = [];

    nodes.forEach(source => {
      nodes.forEach(target => {
        if (source.lessonId === target.lessonId) return;
        const sourceDay = parseInt(source.lessonId.split('-')[1]);
        const targetDay = parseInt(target.lessonId.split('-')[1]);

        // 1. 前置关系：按阶段
        const sourceStage = LawAIApp.LessonEngine.stages.find(s => sourceDay >= s.range[0] && sourceDay <= s.range[1]);
        const targetStage = LawAIApp.LessonEngine.stages.find(s => targetDay >= s.range[0] && targetDay <= s.range[1]);
        if (sourceStage && targetStage && sourceStage.name !== targetStage.name && targetDay > sourceDay) {
          relationships.push({
            id: `rel_${source.lessonId}_${target.lessonId}_prereq`,
            sourceId: source.lessonId,
            targetId: target.lessonId,
            type: 'prerequisite',
            weight: 1
          });
        }

        // 2. 共享类别/标签 → 相关关系
        const commonTags = source.tags.filter(t => target.tags.includes(t));
        if (commonTags.length > 0 && !relationships.some(r => r.sourceId === source.lessonId && r.targetId === target.lessonId && r.type === 'related')) {
          relationships.push({
            id: `rel_${source.lessonId}_${target.lessonId}_related`,
            sourceId: source.lessonId,
            targetId: target.lessonId,
            type: 'related',
            weight: commonTags.length
          });
        }

        // 3. 相邻课程之间添加“recommended_next”
        if (targetDay === sourceDay + 1) {
          relationships.push({
            id: `rel_${source.lessonId}_${target.lessonId}_next`,
            sourceId: source.lessonId,
            targetId: target.lessonId,
            type: 'recommended_next',
            weight: 10
          });
        }
      });
    });

    this._save(relationships);

    // 更新节点内的连接列表
    const nodesMap = {};
    nodes.forEach(n => { nodesMap[n.lessonId] = []; });
    relationships.forEach(r => {
      if (nodesMap[r.sourceId]) nodesMap[r.sourceId].push(r.targetId);
      if (nodesMap[r.targetId]) nodesMap[r.targetId].push(r.sourceId);
    });
    const updatedNodes = LawAIApp.NodeRegistry._getStore();
    updatedNodes.forEach(n => {
      n.connections = [...new Set(nodesMap[n.lessonId] || [])];
    });
    LawAIApp.NodeRegistry._save(updatedNodes);

    LawAIApp.EventBus.emit('GraphUpdated', { nodeCount: nodes.length, relCount: relationships.length });
  },

  // 获取某个节点的所有关系
  getRelationships(lessonId) {
    const all = this._getStore();
    return all.filter(r => r.sourceId === lessonId || r.targetId === lessonId);
  },

  // ========== Phase 38 新增方法（照旧追加） ==========

  // 添加单条关系
  addRelationship(sourceId, targetId, type, weight = 1) {
    const id = `rel_${sourceId}_${targetId}_${type}`;
    const all = this._getStore();
    if (all.find(r => r.id === id)) return false; // 已存在
    all.push({ id, sourceId, targetId, type, weight });
    this._save(all);
    LawAIApp.EventBus.emit('RelationshipCreated', { id, sourceId, targetId, type });
    return true;
  },

  // 验证关系是否合法（检查节点存在、无循环依赖等）
  validateRelationship(sourceId, targetId, type) {
    const errors = [];
    if (!sourceId || !targetId) errors.push('Source and target must be provided');
    const validTypes = ['prerequisite','related','recommended_next','alternative','extension'];
    if (!validTypes.includes(type)) errors.push(`Invalid relationship type: ${type}`);
    // 检查节点是否存在
    if (!LawAIApp.NodeRegistry.getNode(sourceId)) errors.push(`Source node ${sourceId} not found`);
    if (!LawAIApp.NodeRegistry.getNode(targetId)) errors.push(`Target node ${targetId} not found`);
    return errors;
  },

  // 扩展探索：从某节点沿关系类型探索 n 步
  explore(nodeId, type = null, depth = 2) {
    const visited = new Set();
    const result = [];
    const queue = [{ id: nodeId, d: 0 }];
    visited.add(nodeId);
    while (queue.length) {
      const cur = queue.shift();
      if (cur.d > depth) continue;
      result.push(cur.id);
      const rels = this.getRelationships(cur.id).filter(r => !type || r.type === type);
      rels.forEach(r => {
        const neighbor = r.sourceId === cur.id ? r.targetId : r.sourceId;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ id: neighbor, d: cur.d + 1 });
        }
      });
    }
    return result;
  },

  // 获取两个节点间的最短路径（简单 BFS）
  findPath(startId, endId) {
    if (startId === endId) return [startId];
    const visited = new Set();
    const queue = [{ id: startId, path: [startId] }];
    visited.add(startId);
    while (queue.length) {
      const cur = queue.shift();
      const rels = this.getRelationships(cur.id);
      for (const r of rels) {
        const next = r.sourceId === cur.id ? r.targetId : r.sourceId;
        if (!visited.has(next)) {
          const newPath = [...cur.path, next];
          if (next === endId) return newPath;
          visited.add(next);
          queue.push({ id: next, path: newPath });
        }
      }
    }
    return null;
  },

  // 获取某节点最相关的其他节点（按权重排序）
  getTopRelated(nodeId, limit = 5) {
    return this.getRelationships(nodeId)
      .filter(r => r.type === 'related' || r.type === 'recommended_next')
      .sort((a,b) => b.weight - a.weight)
      .slice(0, limit)
      .map(r => ({
        nodeId: r.sourceId === nodeId ? r.targetId : r.sourceId,
        type: r.type,
        weight: r.weight
      }));
  }
};
