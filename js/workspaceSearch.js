// workspaceSearch.js
LawAIApp.WorkspaceSearch = {
  // 在当前workspace的笔记和资源中搜索
  search(lessonId, query) {
    const results = [];
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    if (!query) return results;

    const q = query.toLowerCase();

    // 搜索笔记本内容（如果有的话，从状态中获取）
    if (ws.sessionState.notebookText && ws.sessionState.notebookText.toLowerCase().includes(q)) {
      results.push({ type: 'notebook', content: ws.sessionState.notebookText, match: 'Note contains query' });
    }

    // 搜索最近资源
    ws.recentResources.forEach(resId => {
      const resource = LawAIApp.ResourceEngine.getAllResources(lessonId).find(r => r.resourceId === resId);
      if (resource && (resource.title.toLowerCase().includes(q) || resource.description.toLowerCase().includes(q))) {
        results.push({ type: 'resource', resourceId: resId, title: resource.title });
      }
    });

    // 可扩展：搜索课程标题、summary等
    return results;
  },

  // 添加到最近资源
  addRecentResource(lessonId, resourceId) {
    const ws = LawAIApp.WorkspaceState.get(lessonId);
    ws.recentResources = [resourceId, ...ws.recentResources.filter(id => id !== resourceId)].slice(0, 5);
    LawAIApp.WorkspaceState.save(lessonId, ws);
  }
};
