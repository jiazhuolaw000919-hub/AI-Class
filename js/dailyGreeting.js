// dailyGreeting.js
LawAIApp.DailyGreeting = {
  get() {
    const hour = new Date().getHours();
    const name = (LawAIApp.IdentityEngine && LawAIApp.IdentityEngine.getProfile().displayName) || 'Law';
    if (hour < 12) return `Good Morning, ${name}.`;
    if (hour < 18) return `Good Afternoon, ${name}.`;
    return `Good Evening, ${name}.`;
  }
};
