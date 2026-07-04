// careerStory.js
LawAIApp.CareerStory = {
  // 根据学习数据自动生成一段职业简介
  generateSummary() {
    const showcase = LawAIApp.PortfolioShowcase.getShowcase();
    const projectCount = showcase.stats.totalProjects;
    const topSkill = showcase.skills.sort((a,b) => b.mastery - a.mastery)[0];
    const topSkillName = topSkill ? topSkill.name : 'AI';
    const completion = showcase.stats.completionPercent;

    let summary = `I am an enthusiastic learner who has completed ${showcase.stats.lessonsCompleted} lessons in AI and related fields. `;
    if (projectCount > 0) {
      summary += `I have built ${projectCount} real-world projects, demonstrating practical skills in ${topSkillName}. `;
    }
    if (completion > 50) {
      summary += `My learning journey is ${completion}% complete, reflecting strong dedication.`;
    } else {
      summary += `I am actively expanding my knowledge, with ${completion}% of the curriculum completed.`;
    }
    return summary;
  }
};
