// startupValidator.js
LawAIApp.StartupValidator = {
  requiredEngines: [
    'StorageEngine', 'LessonEngine', 'StreakEngine', 'AchievementEngine', 'SearchEngine',
    'ReviewQueue', 'SecondBrain', 'CalendarEngine', 'AcademyData', 'AcademyStorage',
    'CategoryData', 'CourseData', 'CourseStorage', 'ModuleData', 'ModuleStorage',
    'LessonEvents', 'EventBus', 'CoreLearningEngine', 'ProgressEngine', 'XPEngine',
    'IdentityEngine', 'ThemeEngine', 'UnlockEngine', 'AvatarEngine', 'WorkspaceEngine',
    'CollectionEngine', 'CompanionEngine', 'AnalyticsEngine', 'StatisticsEngine',
    'RecommendationEngine', 'AILayer', 'SecondBrainEngine', 'MentorEngine', 'HabitEngine',
    'PracticeEngine', 'MemoryEngine', 'LearningPathEngine', 'ResourceEngine',
    'ContentPlatform', 'LearningPack', 'KnowledgeGraph', 'RelationshipEngine38',
    'KnowledgeEvolution', 'SkillEngine', 'LearningIntelligence', 'ProjectEngine',
    'GoalEngine', 'CareerEngine', 'AdaptiveLearning'
  ],

  validate() {
    const missing = [];
    this.requiredEngines.forEach(name => {
      if (!LawAIApp[name]) missing.push(name);
    });
    return missing;
  }
};
