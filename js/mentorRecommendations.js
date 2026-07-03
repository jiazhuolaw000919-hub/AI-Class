// mentorRecommendations.js
LawAIApp.MentorRecommendations = {
  generate() {
    const analysis = LawAIApp.MentorAnalytics.getComprehensiveAnalysis();
    const recs = [];

    if (analysis.reviewDue > 0) {
      recs.push({ type:'review', priority:'high', message:`You have ${analysis.reviewDue} reviews due.`, action:'open_review' });
    }
    if (analysis.weakTopics.length > 0) {
      recs.push({ type:'focus', priority:'high', message:`Focus on ${analysis.weakTopics[0]} to strengthen your foundation.`, action:'open_weak_topic' });
    }
    if (analysis.activeProjects > 0) {
      recs.push({ type:'project', priority:'normal', message:`Keep moving on your ${analysis.activeProjects} active project(s).`, action:'open_projects' });
    }
    if (analysis.completionRate < 20) {
      recs.push({ type:'encouragement', priority:'normal', message:`Great start! Every lesson counts.`, action:'none' });
    } else if (analysis.completionRate > 80) {
      recs.push({ type:'congrats', priority:'low', message:`You're almost there!`, action:'none' });
    }
    if (analysis.intelligenceHealth < 50) {
      recs.push({ type:'rest', priority:'low', message:`A short break could recharge your learning.`, action:'none' });
    }
    return recs;
  }
};
