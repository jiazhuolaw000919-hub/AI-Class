// data.js - Phase 1 基础数据层
// Season 1.5 升级：清除假数据，改为从真实引擎获取
LawAIApp.Data = {
  // ========== 课程生成器（保留，供 LessonEngine 使用） ==========
  generateLessons() {
    const topics = [
      "Introduction to AI", "Machine Learning Basics", "Neural Networks", "Deep Learning",
      "Computer Vision", "NLP", "Reinforcement Learning", "GANs", "Transformers",
      "Prompt Engineering", "AI Ethics", "AI in Healthcare", "AI in Law", "AI Tools",
      "Data Preprocessing", "Model Evaluation", "Overfitting", "Regularization",
      "Transfer Learning", "Time Series", "Recommendation Systems", "Anomaly Detection",
      "Explainable AI", "Deployment", "MLOps", "AI Safety", "Bias in AI", "Edge AI"
    ];
    const lessons = [];
    for (let i = 0; i < 365; i++) {
      const topic = topics[i % topics.length] + (i >= topics.length ? ` - Part ${Math.floor(i/topics.length)+1}` : "");
      lessons.push({
        id: i+1,
        title: `Day ${i+1}: ${topic}`,
        duration: Math.floor(Math.random() * 15) + 5 + " min",
        content: `Lesson content for day ${i+1}.`
      });
    }
    return lessons;
  },

  // ========== Season 1.5 修改：用户数据从真实引擎获取 ==========
  fakeUser() {
    // 基础信息（固定）
    const user = {
      name: "Law"
    };

    // 尝试从引擎获取真实数据
    try {
      const progress = LawAIApp.ProgressEngine 
        ? LawAIApp.ProgressEngine.getProgress() 
        : null;
      const streakData = LawAIApp.StreakEngine 
        ? LawAIApp.StreakEngine.getStreakData() 
        : null;
      const levelInfo = LawAIApp.LevelEngine 
        ? LawAIApp.LevelEngine.calculateLevel() 
        : null;

      user.xp = progress ? progress.xp : 0;
      user.level = levelInfo ? levelInfo.level : 1;
      user.streak = streakData ? streakData.currentStreak : 0;
      user.completedLessons = progress ? progress.completedLessons : [];
      user.currentLesson = progress ? progress.currentLesson : 1;
    } catch (e) {
      // 回退到空数据
      user.xp = 0;
      user.level = 1;
      user.streak = 0;
      user.completedLessons = [];
      user.currentLesson = 1;
    }

    return user;
  },

  // ========== Season 1.5 修改：笔记数据从真实引擎获取 ==========
  fakeNotes() {
    // 尝试从 SecondBrain 或存储中获取真实笔记
    try {
      if (LawAIApp.SecondBrainEngine) {
        const entries = LawAIApp.SecondBrainEngine.getAllCards 
          ? LawAIApp.SecondBrainEngine.getAllCards() 
          : [];
        if (entries.length > 0) {
          return entries.slice(0, 5).map(card => ({
            id: card.knowledgeId || card.lessonId,
            title: card.title || 'Untitled',
            summary: card.summary || '',
            tags: card.keywords || card.tags || [],
            date: card.updatedAt || card.createdAt || new Date().toISOString().slice(0, 10)
          }));
        }
      }

      // 回退：从存储中读取笔记
      const storedNotes = LawAIApp.StorageEngine 
        ? LawAIApp.StorageEngine.get('notes', []) 
        : [];
      if (storedNotes.length > 0) return storedNotes.slice(0, 5);
    } catch (e) {
      // 忽略错误
    }

    // 没有任何真实笔记时，返回空数组
    return [];
  },

  // ========== Season 1.5 修改：每周挑战改为基于真实进度 ==========
  weeklyChallenge() {
    try {
      const progress = LawAIApp.ProgressEngine 
        ? LawAIApp.ProgressEngine.getProgress() 
        : null;
      const remaining = progress 
        ? (progress.totalLessons - progress.completedLessons.length) 
        : 365;

      if (remaining > 0) {
        return {
          title: `Complete ${Math.min(5, remaining)} lessons this week`,
          xp: Math.min(5, remaining) * 50,
          progress: progress 
            ? Math.round((progress.completedLessons.length / progress.totalLessons) * 100) 
            : 0
        };
      }

      return {
        title: 'All lessons completed!',
        xp: 0,
        progress: 100
      };
    } catch (e) {
      // 回退到默认挑战
      return {
        title: 'Start your learning journey',
        xp: 100,
        progress: 0
      };
    }
  }
};
