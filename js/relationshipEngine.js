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

        // 1. 前置关系：如果目标课程的prerequisites包含源课程（这里简化：按阶段，前一阶段的课程作为后一阶段的prerequisite）
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
    // 更新节点内的连接列表（可选）
    const nodesMap = {};
    nodes.forEach(n => { nodesMap[n.lessonId] = []; });
    relationships.forEach(r => {
      if (nodesMap[r.sourceId]) nodesMap[r.sourceId].push(r.targetId);
      if (nodesMap[r.targetId]) nodesMap[r.targetId].push(r.sourceId); // 双向显示
    });
    // 保存到节点数据中
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
  }
};
