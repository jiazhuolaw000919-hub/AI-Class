// careerPathGenerator.js
LawAIApp.CareerPathGenerator = {
  careers: [
    { id: 'ai_engineer', name: 'AI Engineer', requiredCategories: ['AI', 'Machine Learning'], minLessons: 200 },
    { id: 'prompt_engineer', name: 'Prompt Engineer', requiredCategories: ['Prompt Engineering', 'ChatGPT'], minLessons: 50 },
    { id: 'software_dev', name: 'Software Developer', requiredCategories: ['Coding', 'API'], minLessons: 100 },
    { id: 'business_analyst', name: 'Business Analyst', requiredCategories: ['Business', 'Automation'], minLessons: 50 }
  ],

  getRecommendedCareer() {
    const prog = LawAIApp.ProgressEngine.getProgress();
    const allLessons = LawAIApp.LessonEngine.getAllLessons();
    const completedIds = prog.completedLessons;
    const completedCategories = {};
    completedIds.forEach(id => {
      const lesson = allLessons.find(l => l.lessonId === id);
      if (lesson) completedCategories[lesson.category] = (completedCategories[lesson.category] || 0) + 1;
    });

    let bestCareer = null;
    let bestScore = 0;
    this.careers.forEach(career => {
      const matchCount = career.requiredCategories.reduce((sum, cat) => sum + (completedCategories[cat] || 0), 0);
      const score = matchCount / career.minLessons;
      if (score > bestScore) {
        bestScore = score;
        bestCareer = { ...career, matchPercent: Math.min(100, Math.round(score * 100)) };
      }
    });
    return bestCareer;
  }
};
