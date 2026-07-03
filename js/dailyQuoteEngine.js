// dailyQuoteEngine.js
LawAIApp.DailyQuoteEngine = {
  quotes: [
    "The only way to learn is by doing.",
    "Small steps every day lead to big results.",
    "Your future is created by what you learn today.",
    "Learning never exhausts the mind.",
    "Stay curious, keep learning.",
    "Every expert was once a beginner.",
    "Knowledge is power, practice is key.",
    "Today is a great day to learn something new."
  ],
  getTodayQuote() {
    // 基于日期生成固定索引，使同一天显示的格言不变
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % this.quotes.length;
    return this.quotes[index];
  }
};
