// workspaceEngine.js
LawAIApp.WorkspaceEngine = (function() {
  const environments = [
    { id: 'default', name: 'Default Desk', unlocked: true, background: 'var(--bg)' },
    { id: 'ai_lab', name: 'AI Lab', unlocked: false, background: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
    { id: 'coding_cave', name: 'Coding Cave', unlocked: false, background: 'linear-gradient(135deg, #0f172a, #064e3b)' },
    { id: 'knowledge_library', name: 'Knowledge Library', unlocked: false, background: 'linear-gradient(135deg, #3c1f0e, #5b3a1a)' }
  ];

  let currentEnvId = LawAIApp.StorageEngine.get('current_environment', 'default');

  function getEnvironments() {
    return environments.map(e => ({ ...e, unlocked: e.unlocked || LawAIApp.UnlockEngine.isUnlocked('environment', e.id) }));
  }

  function setEnvironment(envId) {
    const env = environments.find(e => e.id === envId && (e.unlocked || LawAIApp.UnlockEngine.isUnlocked('environment', envId)));
    if (!env) return false;
    currentEnvId = envId;
    LawAIApp.StorageEngine.set('current_environment', envId);
    document.body.style.background = env.background;
    LawAIApp.EventBus.emit('EnvironmentChanged', { envId });
    return true;
  }

  // 监听解锁事件
  LawAIApp.EventBus.on('EnvironmentUnlocked', (data) => {
    const env = environments.find(e => e.id === data.id);
    if (env) env.unlocked = true;
  });

  return { getEnvironments, setEnvironment, getCurrentEnv: () => currentEnvId };
})();
