// loadingStates.js
LawAIApp.LoadingStates = {
  // 骨架卡片
  skeletonCard() {
    return `
      <div class="skeleton-card" style="background: var(--card); border-radius: var(--radius); padding: 1rem; margin: 0.5rem 0; animation: pulse 1.5s infinite;">
        <div style="height: 1rem; background: rgba(255,255,255,0.1); border-radius: 4px; width: 60%; margin-bottom: 0.5rem;"></div>
        <div style="height: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 4px; width: 80%;"></div>
      </div>
    `;
  },

  // 加载动画
  spinner() {
    return `
      <div class="loading-spinner" style="text-align:center; padding: 2rem;">
        <div style="width: 40px; height: 40px; border: 4px solid var(--card); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 0.5rem; color: var(--text-secondary);">Loading...</p>
      </div>
    `;
  },

  // 页面加载进度
  progressBar(percent) {
    return `
      <div style="width: 100%; height: 4px; background: var(--card); border-radius: 2px; overflow: hidden;">
        <div style="width: ${percent}%; height: 100%; background: var(--primary); transition: width 0.3s ease;"></div>
      </div>
    `;
  }
};

// 注入动画关键帧
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
