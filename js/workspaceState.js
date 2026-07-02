// workspaceState.js
LawAIApp.WorkspaceState = {
  _key(lessonId) { return 'workspace_' + lessonId; },

  create(lessonId) {
    return {
      workspaceId: 'ws_' + lessonId,
      lessonId: lessonId,
      layout: 'default',
      widgets: ['lesson', 'summary', 'notebook', 'resources'],
      pinnedWidgets: [],
      focusMode: 'study',
      lastOpened: new Date().toISOString(),
      recentResources: [],
      recentNotes: [],
      sessionState: {
        scrollPosition: 0,
        openResources: [],
        notebookText: '',
        practiceProgress: {}
      }
    };
  },

  get(lessonId) {
    let ws = LawAIApp.StorageEngine.get(this._key(lessonId));
    if (!ws) {
      ws = this.create(lessonId);
      this.save(lessonId, ws);
    }
    return ws;
  },

  save(lessonId, workspace) {
    workspace.lastOpened = new Date().toISOString();
    LawAIApp.StorageEngine.set(this._key(lessonId), workspace);
  },

  remove(lessonId) {
    LawAIApp.StorageEngine.remove(this._key(lessonId));
  }
};
