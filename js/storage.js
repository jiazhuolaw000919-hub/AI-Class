window.LawAIApp = window.LawAIApp || {};

LawAIApp.Storage = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(`lawai_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    localStorage.setItem(`lawai_${key}`, JSON.stringify(value));
  }
};
