// projectTracker.js
LawAIApp.ProjectTracker = {
  _getStore() {
    return LawAIApp.StorageEngine.get('projects', []);
  },
  _save(list) { LawAIApp.StorageEngine.set('projects', list); },

  // 创建新项目
  create(projectDef) {
    const list = this._getStore();
    const project = {
      projectId: 'proj_' + Date.now(),
      ...projectDef,
      progress: {
        currentPhase: 'idea',
        completedMilestones: [],
        lessonsCompleted: 0,
        practiceCompleted: 0,
        notes: '',
        reflection: ''
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: projectDef.milestones || []
    };
    list.push(project);
    this._save(list);
    LawAIApp.EventBus.emit('ProjectCreated', { project });
    return project;
  },

  // 更新项目进度
  updateProgress(projectId, progressUpdate) {
    const list = this._getStore();
    const project = list.find(p => p.projectId === projectId);
    if (!project) return;
    Object.assign(project.progress, progressUpdate);
    project.updatedAt = new Date().toISOString();

    // 检查里程碑完成（基于 lessonsCompleted 与 requiredLessons 对比）
    if (project.requiredLessons && project.requiredLessons.length > 0) {
      const completedCount = project.progress.lessonsCompleted;
      const totalRequired = project.requiredLessons.length;
      if (completedCount >= totalRequired && !project.progress.completedMilestones.includes('lessons_complete')) {
        project.progress.completedMilestones.push('lessons_complete');
        LawAIApp.EventBus.emit('MilestoneCompleted', { projectId, milestone: 'lessons_complete' });
      }
    }

    // 如果所有里程碑都完成，且状态为 active，则自动标记为 completed
    if (project.milestones.every(m => project.progress.completedMilestones.includes(m)) && project.status === 'active') {
      project.status = 'completed';
      project.progress.currentPhase = 'completed';
      LawAIApp.EventBus.emit('ProjectFinished', { projectId });
    }

    this._save(list);
    LawAIApp.EventBus.emit('ProjectUpdated', { projectId, progress: project.progress });
  },

  // 获取项目列表
  getActiveProjects() {
    return this._getStore().filter(p => p.status === 'active');
  },

  getCompletedProjects() {
    return this._getStore().filter(p => p.status === 'completed');
  },

  getProject(projectId) {
    return this._getStore().find(p => p.projectId === projectId);
  }
};
