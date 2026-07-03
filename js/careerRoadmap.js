// careerRoadmap.js
LawAIApp.CareerRoadmap = {
  // 为某个职业生成路线图
  generate(careerId) {
    const career = LawAIApp.CareerProfile.getCareer(careerId);
    if (!career) return null;

    const readiness = LawAIApp.CareerAnalytics.getReadiness(careerId);
    const gaps = LawAIApp.CareerGapAnalyzer.getSkillGaps(career);

    const milestones = [];
    if (gaps.length > 0) {
      milestones.push({
        name: 'Bridge Skill Gaps',
        description: `Improve ${gaps.map(g => g.name).join(', ')}`,
        lessons: gaps.map(g => `skill_${g.name.toLowerCase().replace(/\s/g,'_')}`),
        projects: [],
        status: 'pending'
      });
    }

    const missingProjects = LawAIApp.CareerGapAnalyzer.getMissingProjects(career);
    if (missingProjects.length > 0) {
      milestones.push({
        name: 'Complete Recommended Projects',
        description: `Build ${missingProjects.length} project(s) to demonstrate skills.`,
        projects: missingProjects,
        status: 'pending'
      });
    }

    const prediction = LawAIApp.PredictionEngine.predictCompletionDate();
    const roadmap = {
      careerId,
      careerName: career.careerName,
      currentReadiness: readiness,
      milestones,
      estimatedCompletion: prediction.date
    };

    LawAIApp.StorageEngine.set(`career_roadmap_${careerId}`, roadmap);
    LawAIApp.EventBus.emit('CareerRoadmapGenerated', { careerId, roadmap });
    return roadmap;
  },

  // 获取已存储的路线图
  get(careerId) {
    return LawAIApp.StorageEngine.get(`career_roadmap_${careerId}`, null);
  }
};
