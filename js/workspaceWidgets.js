// workspaceWidgets.js
LawAIApp.WorkspaceWidgets = {
  allWidgets: [
    { id: 'lesson', name: 'Lesson', icon: '📖' },
    { id: 'summary', name: 'Summary', icon: '📝' },
    { id: 'notebook', name: 'Notebook', icon: '📓' },
    { id: 'quiz', name: 'Quiz', icon: '❓' },
    { id: 'practice', name: 'Practice', icon: '⚡' },
    { id: 'reflection', name: 'Reflection', icon: '💭' },
    { id: 'ai_mentor', name: 'AI Mentor', icon: '🤖' },
    { id: 'second_brain', name: 'Second Brain', icon: '🧠' },
    { id: 'resources', name: 'Resources', icon: '📚' },
    { id: 'bookmarks', name: 'Bookmarks', icon: '⭐' },
    { id: 'progress', name: 'Progress', icon: '📊' },
    { id: 'roadmap', name: 'Roadmap', icon: '🗺️' }
  ],

  getActive(lessonId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    return ws.widgets;
  },

  addWidget(lessonId, widgetId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    if (!ws.widgets.includes(widgetId)) {
      ws.widgets.push(widgetId);
      LawAIApp.WorkspaceState.save(lessonId, ws);
    }
  },

  removeWidget(lessonId, widgetId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.widgets = ws.widgets.filter(w => w !== widgetId);
    LawAIApp.WorkspaceState.save(lessonId, ws);
  },

  togglePinWidget(lessonId, widgetId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    const idx = ws.pinnedWidgets.indexOf(widgetId);
    if (idx === -1) {
      ws.pinnedWidgets.push(widgetId);
    } else {
      ws.pinnedWidgets.splice(idx, 1);
    }
    LawAIApp.WorkspaceState.save(lessonId, ws);
    LawAIApp.EventBus.emit('WidgetPinned', { lessonId, widgetId, pinned: idx === -1 });
  },

  isPinned(lessonId, widgetId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    return ws.pinnedWidgets.includes(widgetId);
  }
};
