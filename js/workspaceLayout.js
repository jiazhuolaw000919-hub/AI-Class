// workspaceLayout.js
LawAIApp.WorkspaceLayout = {
  layouts: {
    default: {
      name: 'Default',
      columns: 1,
      sections: ['main']
    },
    twoColumn: {
      name: 'Two Columns',
      columns: 2,
      sections: ['primary', 'secondary']
    },
    focus: {
      name: 'Focus',
      columns: 1,
      hideAllBut: ['lesson']
    },
    practice: {
      name: 'Practice',
      columns: 1,
      sections: ['practice', 'quiz']
    },
    review: {
      name: 'Review',
      columns: 1,
      sections: ['memory', 'reflection']
    }
  },

  getLayout(id) {
    return this.layouts[id] || this.layouts.default;
  },

  applyLayout(lessonId, layoutId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.layout = layoutId;
    // 如果布局有强制显示的小部件，则调整小部件列表（逻辑待UI实现）
    LawAIApp.WorkspaceState.save(lessonId, ws);
    LawAIApp.EventBus.emit('LayoutChanged', { lessonId, layoutId });
    return ws;
  }
};
