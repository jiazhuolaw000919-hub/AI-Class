// smartProjectProgress.js
LawAIApp.SmartProjectProgress = {
  _keyPrefix: 'smartProject_',

  get(projectId) {
    const key = this._keyPrefix + projectId;
    let progress = LawAIApp.StorageEngine.get(key);
    if (!progress) {
      progress = {
        projectId,
        started: false,
        currentStage: 'introduction',
        completedMilestones: [],
        checklistItems: [],      // 已完成检查项索引
        reflection: '',
        completed: false,
        lastOpened: null
      };
      LawAIApp.StorageEngine.set(key, progress);
    }
    return progress;
  },

  save(projectId, progress) {
    LawAIApp.StorageEngine.set(this._keyPrefix + projectId, progress);
  },

  markStarted(projectId) {
    const p = this.get(projectId);
    if (!p.started) {
      p.started = true;
      p.lastOpened = new Date().toISOString();
      this.save(projectId, p);
    }
  },

  toggleMilestone(projectId, milestoneId) {
    const p = this.get(projectId);
    const idx = p.completedMilestones.indexOf(milestoneId);
    if (idx === -1) {
      p.completedMilestones.push(milestoneId);
    } else {
      p.completedMilestones.splice(idx, 1);
    }
    this.save(projectId, p);
    // 检查是否全部完成
    const project = LawAIApp.SmartProjectData.getProjectsByModule(p.moduleId)
      .find(proj => proj.projectId === projectId);
    if (project && p.completedMilestones.length === project.milestones.length) {
      p.currentStage = 'final_review';
      this.save(projectId, p);
    }
  },

  toggleChecklistItem(projectId, index) {
    const p = this.get(projectId);
    const idx = p.checklistItems.indexOf(index);
    if (idx === -1) {
      p.checklistItems.push(index);
    } else {
      p.checklistItems.splice(idx, 1);
    }
    this.save(projectId, p);
  },

  completeProject(projectId, reflection) {
    const p = this.get(projectId);
    p.completed = true;
    p.reflection = reflection;
    p.currentStage = 'completed';
    p.completedDate = new Date().toISOString();
    this.save(projectId, p);
    // 更新作品集（调用已有的 portfolioEngine）
    if (LawAIApp.PortfolioEngine) {
      LawAIApp.PortfolioEngine.addToPortfolio(projectId);
    }
    // 发放 XP
    const project = LawAIApp.SmartProjectData.getProjectsByModule(p.moduleId)
      .find(proj => proj.projectId === projectId);
    if (project && LawAIApp.XPEngine) {
      LawAIApp.XPEngine.awardXP('project_completion', projectId);
    }
    LawAIApp.EventBus.emit('ProjectCompleted', { projectId });
  }
};
