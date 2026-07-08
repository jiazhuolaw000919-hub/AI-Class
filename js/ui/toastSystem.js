// ===========================================
// toastSystem.js (Phase 1 修复版)
// 挂载到 LawAIApp.Toast
// API: .show(msg, type, duration), .success(), .error(), .info(), .warning(), .xp()
// ===========================================

// 确保命名空间存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.Toast = {
  _container: null,
  _maxToasts: 5,

  _ensureContainer: function() {
    if (this._container && document.body.contains(this._container)) {
      return this._container;
    }

    var container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = [
      'position: fixed',
      'top: 70px',
      'right: 16px',
      'z-index: 99999',
      'display: flex',
      'flex-direction: column',
      'align-items: flex-end',
      'gap: 10px',
      'pointer-events: none',
      'max-width: 360px',
      'width: 100%'
    ].join(';');

    document.body.appendChild(container);
    this._container = container;
    return container;
  },

  _createToastElement: function(message, type, duration) {
    var colorMap = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      xp: '#8b5cf6'
    };
    var emojiMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      xp: '⭐'
    };

    var color = colorMap[type] || '#3b82f6';
    var emoji = emojiMap[type] || 'ℹ️';

    var toast = document.createElement('div');
    toast.className = 'toast-item toast-' + type;
    toast.style.cssText = [
      'background: #1e293b',
      'color: #f1f5f9',
      'padding: 14px 20px',
      'border-radius: 14px',
      'border-left: 4px solid ' + color,
      'box-shadow: 0 8px 30px rgba(0,0,0,0.5)',
      'border: 1px solid rgba(255,255,255,0.06)',
      'backdrop-filter: blur(12px)',
      'font-size: 14px',
      'font-weight: 500',
      'line-height: 1.4',
      'pointer-events: auto',
      'animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      'transition: opacity 0.3s ease, transform 0.3s ease',
      'max-width: 320px',
      'width: 100%',
      'word-break: break-word'
    ].join(';');

    toast.textContent = emoji + ' ' + message;

    // 悬停暂停消失
    toast.addEventListener('mouseenter', function() {
      toast._paused = true;
    });
    toast.addEventListener('mouseleave', function() {
      toast._paused = false;
      toast._scheduleRemove(duration);
    });

    return toast;
  },

  _scheduleRemove: function(toast, duration) {
    if (toast._removeTimer) {
      clearTimeout(toast._removeTimer);
    }
    if (toast._paused) return;

    toast._removeTimer = setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(30px)';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration || 3000);
  },

  show: function(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;

    var container = this._ensureContainer();

    // 限制最大显示数量
    while (container.children.length >= this._maxToasts) {
      var first = container.firstChild;
      if (first) first.remove();
    }

    var toast = this._createToastElement(message, type, duration);
    container.appendChild(toast);

    // 开始倒计时
    this._scheduleRemove(toast, duration);

    return toast;
  },

  success: function(message, duration) {
    return this.show(message, 'success', duration || 3000);
  },

  error: function(message, duration) {
    return this.show(message, 'error', duration || 4000);
  },

  warning: function(message, duration) {
    return this.show(message, 'warning', duration || 3000);
  },

  info: function(message, duration) {
    return this.show(message, 'info', duration || 2500);
  },

  xp: function(amount, message) {
    var msg = message || '+' + amount + ' XP earned! 🎉';
    return this.show(msg, 'xp', 2500);
  },

  // 清除所有 Toast
  clear: function() {
    if (this._container) {
      this._container.innerHTML = '';
    }
  },

  // 销毁容器
  destroy: function() {
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._container = null;
  }
};

// ===========================================
// 注入动画样式（只注入一次）
// ===========================================

(function() {
  var styleId = 'toast-animation-style';
  if (document.getElementById(styleId)) return;

  var style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes toastSlideIn {
      0% { opacity: 0; transform: translateX(40px) scale(0.96); }
      100% { opacity: 1; transform: translateX(0) scale(1); }
    }
    .toast-item {
      animation: toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @media (max-width: 480px) {
      #toast-container {
        top: 60px;
        right: 10px;
        left: 10px;
        max-width: none;
        width: auto;
        align-items: stretch;
      }
      .toast-item {
        max-width: none !important;
        font-size: 13px !important;
        padding: 12px 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

console.log('🍞 Toast System v1.0 ready');
