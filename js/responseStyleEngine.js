// responseStyleEngine.js
LawAIApp.ResponseStyleEngine = {
  generateResponse(originalContent, mode, context = {}) {
    const styles = {
      coach: () => `🚀 Let's go! ${originalContent} Start now!`,
      mentor: () => `📘 Let's break it down: ${originalContent}`,
      analyst: () => `📊 Analysis: ${originalContent} (Your performance: ${context.performance || 'stable'})`,
      strategist: () => `🗺️ Strategic view: ${originalContent} This aligns with your long-term goals.`
    };
    const styleFunc = styles[mode] || styles.mentor;
    return styleFunc();
  },
  getDecompositionStyle(mode) {
    switch(mode) {
      case 'coach': return 'micro_steps';
      case 'mentor': return 'guided_steps';
      case 'analyst': return 'data_driven';
      case 'strategist': return 'milestone_based';
    }
  }
};
