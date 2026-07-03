// toastSystem.js
LawAIApp.Toast = {
  _container: null,

  _ensureContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
      document.body.appendChild(this._container);
    }
  },

  show(message, type = 'info', duration = 3000) {
    this._ensureContainer();
    const toast = document.createElement('div');
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#3b82f6',
      warning: '#f59e0b',
      xp: '#8b5cf6'
    };
    const color = colors[type] || colors.info;

    toast.style.cssText = `
      background: var(--card);
      color: var(--text);
      padding: 0.8rem 1.2rem;
      border-radius: 12px;
      border-left: 4px solid ${color};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInRight 0.3s ease;
      font-size: 0.9rem;
      max-width: 300px;
    `;
    toast.textContent = message;

    this._container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  xp(amount) {
    this.show(`+${amount} XP earned!`, 'xp', 2000);
  }
};

// 注入动画
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(toastStyle);
