// workspaceEngine.js
LawAIApp.WorkspaceEngine = (function() {
  // 打开工作空间（通常在进入课程页面时调用）
  function openWorkspace(lessonId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.lastOpened = new Date().toISOString();
    LawAIApp.WorkspaceState.save(lessonId, ws);
    LawAIApp.EventBus.emit('WorkspaceOpened', { workspace: ws });
    return ws;
  }

  // 关闭工作空间并保存状态
  function closeWorkspace(lessonId, sessionState = {}) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.sessionState = { ...ws.sessionState, ...sessionState };
    LawAIApp.WorkspaceState.save(lessonId, ws);
    LawAIApp.EventBus.emit('WorkspaceClosed', { lessonId });
  }

  // 恢复上一次会话（检查是否有未关闭的工作空间，并自动打开）
  function restoreLastSession() {
    const allKeys = LawAIApp.StorageEngine.getAllKeys().filter(k => k.startsWith('workspace_day-'));
    if (allKeys.length === 0) return null;
    const workspaces = allKeys.map(k => LawAIApp.StorageEngine.get(k)).filter(Boolean);
    workspaces.sort((a,b) => new Date(b.lastOpened) - new Date(a.lastOpened));
    return workspaces[0] || null;
  }

  // 设置焦点模式
  function setFocusMode(lessonId, mode) {
    const validModes = ['focus', 'study', 'practice', 'research', 'review', 'custom'];
    if (!validModes.includes(mode)) return;
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.focusMode = mode;
    LawAIApp.WorkspaceState.save(lessonId, ws);
    if (mode === 'focus') LawAIApp.WorkspaceLayout.applyLayout(lessonId, 'focus');
    else if (mode === 'practice') LawAIApp.WorkspaceLayout.applyLayout(lessonId, 'practice');
    else if (mode === 'review') LawAIApp.WorkspaceLayout.applyLayout(lessonId, 'review');
  }

  // 当用户进入 lesson 页面（CLE 事件）时自动打开 workspace
  LawAIApp.EventBus.on('lessonStarted', (data) => {
    openWorkspace(data.lessonId);
  });

  // 当课程完成或离开，关闭 workspace（可选）
  LawAIApp.EventBus.on('LessonCompleted', (data) => {
    closeWorkspace(data.lessonId);
  });

  // ========== 新增：接入 Phase 26 资源引擎，直接获取当前课程推荐资源 ==========
  function getRecommendedResources(lessonId) {
    if (!LawAIApp.ResourceEngine) return null;
    return LawAIApp.ResourceEngine.getRecommendation(lessonId);
  }

  return {
    open: openWorkspace,
    close: closeWorkspace,
    restoreLast: restoreLastSession,
    setMode: setFocusMode,
    get: (lessonId) => LawAIApp.WorkspaceState.get(lessonId),
    addWidget: LawAIApp.WorkspaceWidgets.addWidget,
    removeWidget: LawAIApp.WorkspaceWidgets.removeWidget,
    pinWidget: LawAIApp.WorkspaceWidgets.togglePinWidget,
    search: LawAIApp.WorkspaceSearch.search,
    changeLayout: LawAIApp.WorkspaceLayout.applyLayout,
    // 新增接口
    getRecommendedResources: getRecommendedResources
  };
})();
