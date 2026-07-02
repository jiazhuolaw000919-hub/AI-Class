// learningRhythm.js
LawAIApp.LearningRhythm = {
  analyze() {
    const log = LawAIApp.AnalyticsStorage.getEventLog();
    const lessonEvents = log.filter(e => e.eventType === 'LessonCompleted');
    if (lessonEvents.length === 0) {
      return { preferredTime: 'unknown', avgSessionLength: 0, preferredDays: [] };
    }

    const hourCount = {};
    const sessionDurations = [];
    let lastTime = null;
    lessonEvents.forEach(e => {
      const date = new Date(e.timestamp);
      const hour = date.getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
      if (lastTime) {
        const diff = (date - new Date(lastTime)) / 60000;
        if (diff < 120) sessionDurations.push(diff);
      }
      lastTime = e.timestamp;
    });

    const sortedHours = Object.entries(hourCount).sort((a, b) => b[1] - a[1]);
    const preferredTime = sortedHours.length > 0 ? parseInt(sortedHours[0][0]) : 0;
    const avgDuration = sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : 0;

    const dayCount = {};
    lessonEvents.forEach(e => {
      const day = new Date(e.timestamp).getDay();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const preferredDays = Object.entries(dayCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(d => parseInt(d[0]));

    return { preferredTime, avgSessionLength: avgDuration, preferredDays };
  }
};
