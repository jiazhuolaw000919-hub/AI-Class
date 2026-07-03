// emptyStates.js
LawAIApp.EmptyStates = {
  messages: {
    calendar: 'No learning history yet.',
    timeline: 'Complete your first lesson.',
    secondBrain: 'Your knowledge memories will appear here.',
    statistics: 'Start learning to generate statistics.',
    projects: 'No projects created.',
    reviewQueue: 'No review scheduled.',
    achievements: 'Keep learning to unlock achievements.',
    bookmarks: 'No bookmarked lessons.',
    favorites: 'No favorite content.',
    search: 'No matching results.',
    notes: 'No notes yet. Start taking notes!',
    goals: 'No learning goals set.',
    portfolio: 'Complete projects to build your portfolio.'
  },

  // 生成空状态 HTML
  render(moduleName, customMessage = null) {
    const message = customMessage || this.messages[moduleName] || 'Nothing here yet.';
    return `
      <div class="empty-state" style="text-align:center; padding: 2rem; opacity: 0.7;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p style="color: var(--text-secondary);">${message}</p>
      </div>
    `;
  }
};
