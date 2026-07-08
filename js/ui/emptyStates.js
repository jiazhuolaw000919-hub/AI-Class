// ===========================================
// emptyStates.js (Phase 1 修复版)
// 挂载到 LawAIApp.EmptyStates
// API: .render(moduleName, customMessage) → 返回 HTML 字符串
//       .renderTo(container, moduleName, customMessage) → 直接渲染到容器
//       .getMessage(moduleName) → 获取空状态文案
// ===========================================

window.LawAIApp = window.LawAIApp || {};

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
    portfolio: 'Complete projects to build your portfolio.',
    // 新增常见空状态
    dashboard: 'Start your AI journey today!',
    academy: 'No academies available yet.',
    lessons: 'No lessons completed yet.',
    skills: 'No skills tracked yet.',
    default: 'Nothing here yet. Start exploring!'
  },

  // 获取空状态文案（带兜底）
  getMessage: function(moduleName) {
    return this.messages[moduleName] || this.messages.default;
  },

  // 生成空状态 HTML（返回字符串）
  render: function(moduleName, customMessage) {
    var message = customMessage || this.getMessage(moduleName);
    var icon = '📭';

    // 根据类型选择不同图标
    var iconMap = {
      calendar: '📅',
      achievements: '🏆',
      projects: '📁',
      notes: '📝',
      bookmarks: '🔖',
      favorites: '❤️',
      search: '🔍',
      goals: '🎯',
      portfolio: '📊',
      skills: '🧠',
      lessons: '📖',
      academy: '🏛️',
      dashboard: '🚀'
    };
    icon = iconMap[moduleName] || '📭';

    return [
      '<div class="empty-state" style="',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 48px 24px;',
      '  text-align: center;',
      '  min-height: 200px;',
      '  background: rgba(255,255,255,0.02);',
      '  border-radius: 16px;',
      '  border: 1px dashed rgba(255,255,255,0.08);',
      '">',
      '  <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.6;">' + icon + '</div>',
      '  <p style="',
      '    margin: 0;',
      '    color: #94a3b8;',
      '    font-size: 15px;',
      '    line-height: 1.5;',
      '    max-width: 320px;',
      '  ">' + message + '</p>',
      '</div>'
    ].join('');
  },

  // 直接渲染到容器（便捷方法）
  renderTo: function(container, moduleName, customMessage) {
    if (!container) return;
    container.innerHTML = this.render(moduleName, customMessage);
  },

  // 检查是否为空状态（用于条件判断）
  isEmpty: function(data) {
    if (!data) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    if (typeof data === 'string') return data.trim() === '';
    return false;
  }
};

// ===========================================
// 别名：兼容 Phase 1 的 EmptyState 命名
// ===========================================

// 如果之前用的是 LawAIApp.EmptyState，这里做别名映射
if (window.LawAIApp) {
  // 如果 EmptyState 还没定义，使用 EmptyStates 的引用
  if (!LawAIApp.EmptyState) {
    LawAIApp.EmptyState = {
      render: function(container, options) {
        options = options || {};
        var moduleName = options.module || 'default';
        var message = options.desc || options.message || null;
        // 如果传了 container，直接渲染
        if (container && typeof container === 'object' && container.nodeType) {
          LawAIApp.EmptyStates.renderTo(container, moduleName, message);
        } else {
          // 否则返回 HTML
          return LawAIApp.EmptyStates.render(moduleName, message);
        }
      }
    };
    console.log('📭 EmptyState alias created (points to EmptyStates)');
  }
}

console.log('📭 EmptyStates v1.0 ready');
