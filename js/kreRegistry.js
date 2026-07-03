// kreRegistry.js
LawAIApp.KRERegistry = {
  _getStore() {
    return LawAIApp.StorageEngine.get('kre_relationships', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('kre_relationships', list); },

  // 注册一条关系
  add(sourceNode, targetNode, type, weight = 1) {
    const list = this._getStore();
    const relationId = `rel_${sourceNode}_${targetNode}_${type}`;
    if (list.find(r => r.relationId === relationId)) return null; // 已存在
    const rel = {
      relationId,
      sourceNode,
      targetNode,
      relationshipType: type,
      direction: 'forward', // 可扩展为双向
      weight,
      strength: 50,
      createdAt: new Date().toISOString()
    };
    list.push(rel);
    this._save(list);
    LawAIApp.EventBus.emit('RelationshipCreated', { relationId, sourceNode, targetNode, type });
    return rel;
  },

  // 获取所有关系
  getAll() {
    return this._getStore();
  },

  // 查询与某个节点相关的所有关系
  getByNode(nodeId) {
    return this._getStore().filter(r => r.sourceNode === nodeId || r.targetNode === nodeId);
  },

  // 查询特定类型的关系
  getByType(type) {
    return this._getStore().filter(r => r.relationshipType === type);
  }
};
