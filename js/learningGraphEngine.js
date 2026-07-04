// learningGraphEngine.js (Phase 62 升级版)
// ✅ 保留旧接口：addNode, markNodeCompleted, updateNodeStrength, addEdge, getGraph
// ✅ 新增：信号传播、路径生成、可视化数据、事件监听

LawAIApp.LearningGraphEngine = {
  _key: 'learningGraph',
  _graph: null,

  init() {
    // 从存储加载或初始化空图谱
    this._graph = LawAIApp.StorageEngine.get(this._key, { nodes: {}, edges: [] });

    // 如果节点为空，从课程数据自动生成
    if (Object.keys(this._graph.nodes).length === 0) {
      this._seedFromLessons();
    }

    // 订阅事件，自动维护图谱
    LawAIApp.EventBus.on('LessonCompleted', (data) => {
      const lessonId = data.lessonId;
      this.markNodeCompleted(lessonId);
      // 传播掌握信号
      this._propagateMastery(lessonId, 15);
    });

    LawAIApp.EventBus.on('QuizFailed', (data) => {
      const currentLesson = LawAIApp.ProgressEngine.getProgress().currentLesson;
      const lessonId = `day-${currentLesson}`;
      this._propagateConfusion(lessonId, 10);
    });

    LawAIApp.EventBus.on('MemoryDecayDetected', (data) => {
      this.updateNodeStrength(data.lessonId, -5);
    });

    this._initialized = true;
  },

  _save() {
    LawAIApp.StorageEngine.set(this._key, this._graph);
  },

  // ========== 旧接口（保持兼容） ==========

  addNode(id, type, properties = {}) {
    if (!this._graph.nodes[id]) {
      this._graph.nodes[id] = {
        id,
        type,
        ...properties,
        strength: properties.strength || 100,
        completed: properties.completed || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this._save();
      LawAIApp.EventBus.emit('GraphNodeAdded', { id, type });
    }
    return this._graph.nodes[id];
  },

  markNodeCompleted(id) {
    if (this._graph.nodes[id]) {
      this._graph.nodes[id].completed = true;
      this._graph.nodes[id].strength = Math.min(100, (this._graph.nodes[id].strength || 50) + 20);
      this._graph.nodes[id].updatedAt = new Date().toISOString();
      this._save();
      LawAIApp.EventBus.emit('GraphNodeCompleted', { id });
    }
  },

  updateNodeStrength(id, delta) {
    if (this._graph.nodes[id]) {
      this._graph.nodes[id].strength = Math.max(0, Math.min(100, (this._graph.nodes[id].strength || 50) + delta));
      this._graph.nodes[id].updatedAt = new Date().toISOString();
      this._save();
      LawAIApp.EventBus.emit('GraphNodeStrengthChanged', { id, strength: this._graph.nodes[id].strength });
    }
  },

  addEdge(from, to, relation, weight = 1) {
    // 避免重复
    const exists = this._graph.edges.some(e => e.from === from && e.to === to && e.relation === relation);
    if (!exists) {
      this._graph.edges.push({ from, to, relation, weight });
      this._save();
      LawAIApp.EventBus.emit('GraphEdgeAdded', { from, to, relation });
    }
  },

  getGraph() {
    return {
      nodes: { ...this._graph.nodes },
      edges: [...this._graph.edges]
    };
  },

  // ========== 新增高级接口 ==========

  // 生成个性化学习路径
  generatePath(strategy, startNodeId = null) {
    const allNodes = Object.values(this._graph.nodes);
    const completedIds = new Set(
      allNodes.filter(n => n.completed).map(n => n.id)
    );
    if (!startNodeId) {
      const firstIncomplete = allNodes.find(n => n.type === 'lesson' && !completedIds.has(n.id));
      startNodeId = firstIncomplete ? firstIncomplete.id : allNodes[0]?.id;
    }

    let candidates = allNodes.filter(n => n.type === 'lesson' && !completedIds.has(n.id));

    if (strategy === 'mastery-first' || strategy === 'weakness-targeted') {
      candidates.sort((a, b) => (a.strength || 50) - (b.strength || 50));
    }

    return candidates.map(n => n.id).slice(0, 10);
  },

  // 获取可视化数据
  getVisualization() {
    const allNodes = Object.values(this._graph.nodes);
    const clusters = {};
    allNodes.forEach(n => {
      const cat = n.category || 'General';
      if (!clusters[cat]) clusters[cat] = [];
      clusters[cat].push({ id: n.id, strength: n.strength, completed: n.completed });
    });

    return {
      clusters,
      heatmap: allNodes.map(n => ({ id: n.id, title: n.title || n.id, strength: n.strength || 50 })),
      weakZones: allNodes.filter(n => n.strength < 40).map(n => ({ id: n.id, title: n.title, strength: n.strength })),
      skillTree: allNodes.filter(n => n.type === 'lesson').sort((a, b) => {
        const aDay = parseInt(a.id.split('-')[1]) || 0;
        const bDay = parseInt(b.id.split('-')[1]) || 0;
        return aDay - bDay;
      }).map(n => ({ id: n.id, title: n.title || n.id, strength: n.strength, completed: n.completed }))
    };
  },

  // ========== 内部信号处理 ==========

  _seedFromLessons() {
    const lessons = LawAIApp.LessonEngine.getAllLessons();
    lessons.forEach(lesson => {
      this.addNode(lesson.lessonId, 'lesson', {
        title: lesson.title,
        category: lesson.category,
        difficulty: lesson.difficulty,
        strength: 50,
        completed: false
      });
    });

    // 构建默认边：前置关系（按day顺序）
    const lessonNodes = Object.values(this._graph.nodes)
      .filter(n => n.type === 'lesson')
      .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]));
    for (let i = 0; i < lessonNodes.length - 1; i++) {
      this.addEdge(lessonNodes[i].id, lessonNodes[i+1].id, 'prerequisite', 1);
    }

    // 同类别相似边
    const categoryMap = {};
    lessonNodes.forEach(n => {
      const cat = n.category || 'Uncategorized';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(n.id);
    });
    Object.values(categoryMap).forEach(list => {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          this.addEdge(list[i], list[j], 'similarity', 2);
        }
      }
    });
  },

  _propagateMastery(nodeId, intensity = 20) {
    this.updateNodeStrength(nodeId, intensity);
    // 向邻居传播部分信号
    const neighbors = this._graph.edges
      .filter(e => e.from === nodeId || e.to === nodeId)
      .map(e => e.from === nodeId ? e.to : e.from);
    neighbors.forEach(neighborId => {
      this.updateNodeStrength(neighborId, Math.floor(intensity * 0.3));
    });
  },

  _propagateConfusion(nodeId, intensity = 20) {
    this.updateNodeStrength(nodeId, -intensity);
    // 增加前置边权重
    this._graph.edges
      .filter(e => e.relation === 'prerequisite' && e.to === nodeId)
      .forEach(edge => {
        edge.weight = (edge.weight || 1) + 2;
      });
    this._save();
  }
};

// 自动初始化
setTimeout(() => LawAIApp.LearningGraphEngine.init(), 500);
