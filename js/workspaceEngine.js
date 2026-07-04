LawAIApp.WorkspaceEngine = (function() {

  function safeGet(moduleName) {
    const mod = LawAIApp[moduleName];
    if (!mod) {
      console.warn(`[WorkspaceEngine] Missing module: ${moduleName}`);
      return null;
    }
    return mod;
  }

  function openWorkspace(lessonId) {
    const State = safeGet("WorkspaceState");
    const Bus = safeGet("EventBus");

    if (!State) return null;

    const ws = State.get(lessonId);

    ws.lastOpened = new Date().toISOString();
    State.save(lessonId, ws);

    if (Bus) Bus.emit('WorkspaceOpened', { workspace: ws });

    return ws;
  }

  function closeWorkspace(lessonId, sessionState = {}) {
    const State = safeGet("WorkspaceState");
    const Bus = safeGet("EventBus");

    if (!State) return;

    const ws = State.get(lessonId);
    ws.sessionState = { ...ws.sessionState, ...sessionState };

    State.save(lessonId, ws);

    if (Bus) Bus.emit('WorkspaceClosed', { lessonId });
  }

  function restoreLastSession() {
    const Storage = safeGet("StorageEngine");
    const State = safeGet("WorkspaceState");

    if (!Storage || !State) return null;

    const keys = Storage.getAllKeys?.() || [];
    const wsKeys = keys.filter(k => k.startsWith('workspace_day-'));

    if (wsKeys.length === 0) return null;

    const workspaces = wsKeys
      .map(k => Storage.get(k))
      .filter(Boolean);

    workspaces.sort((a,b) =>
      new Date(b.lastOpened || 0) - new Date(a.lastOpened || 0)
    );

    return workspaces[0] || null;
  }

  function setFocusMode(lessonId, mode) {
    const State = safeGet("WorkspaceState");
    const Layout = safeGet("WorkspaceLayout");

    const validModes = ['focus','study','practice','research','review','custom'];
    if (!validModes.includes(mode)) return;

    if (!State) return;

    const ws = State.get(lessonId);
    ws.focusMode = mode;

    State.save(lessonId, ws);

    if (!Layout) return;

    if (mode === 'focus') Layout.applyLayout(lessonId, 'focus');
    else if (mode === 'practice') Layout.applyLayout(lessonId, 'practice');
    else if (mode === 'review') Layout.applyLayout(lessonId, 'review');
  }

  function getRecommendedResources(lessonId) {
    const Resource = safeGet("ResourceEngine");
    if (!Resource) return null;
    return Resource.getRecommendation(lessonId);
  }

  return {
    open: openWorkspace,
    close: closeWorkspace,
    restoreLast: restoreLastSession,
    setMode: setFocusMode,

    get: (id) => LawAIApp.WorkspaceState?.get?.(id),

    addWidget: (...args) =>
      LawAIApp.WorkspaceWidgets?.addWidget?.(...args),

    removeWidget: (...args) =>
      LawAIApp.WorkspaceWidgets?.removeWidget?.(...args),

    pinWidget: (...args) =>
      LawAIApp.WorkspaceWidgets?.togglePinWidget?.(...args),

    search: (...args) =>
      LawAIApp.WorkspaceSearch?.search?.(...args),

    changeLayout: (...args) =>
      LawAIApp.WorkspaceLayout?.applyLayout?.(...args),

    getRecommendedResources
  };

})();
