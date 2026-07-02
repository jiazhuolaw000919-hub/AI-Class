// contentLoader.js
LawAIApp.ContentLoader = {
  // 尝试从本地文件系统 fetch JSON
  async fetchPack(academyId) {
    const base = `content/${academyId}/`;
    try {
      const [manifest, academy, courses, modules] = await Promise.all([
        fetch(base + 'manifest.json').then(r => r.json()),
        fetch(base + 'academy.json').then(r => r.json()),
        fetch(base + 'courses.json').then(r => r.json()),
        fetch(base + 'modules.json').then(r => r.json())
      ]);
      return { manifest, academy, courses, modules };
    } catch (e) {
      // 如果 fetch 失败（如文件协议），尝试从 LocalStorage 加载
      return this.loadFromLocalStorage(academyId);
    }
  },

  // 从 LocalStorage 获取之前缓存的包数据
  loadFromLocalStorage(academyId) {
    const packData = LawAIApp.StorageEngine.get(`pack_${academyId}`);
    return packData ? packData : null;
  },

  // 将包数据存入 LocalStorage
  cachePackToStorage(academyId, packData) {
    LawAIApp.StorageEngine.set(`pack_${academyId}`, packData);
  },

  // 安装默认的 AI 学习包（将 JSON 内容硬编码为后备，不算业务逻辑，只是安装器）
  installDefaultAIPack() {
    const packData = {
      manifest: {
        packName: "AI Academy",
        packId: "academy_ai",
        version: "1.0",
        author: "Law Academy",
        language: "English",
        academyId: "academy_ai",
        minimumEngineVersion: "1.0",
        totalCourses: 3,
        totalModules: 6,
        totalLessons: 12,
        createdDate: "2026-06-01",
        updatedDate: "2026-06-01",
        status: "published",
        description: "Complete AI learning path from beginner to advanced."
      },
      academy: {
        id: "academy_ai",
        name: "AI Academy",
        shortName: "AI",
        description: "Master Artificial Intelligence from fundamentals to advanced.",
        icon: "🤖",
        themeColor: "#3b82f6",
        difficulty: "Beginner",
        category: "Technology",
        status: "active",
        enabled: true,
        order: 1,
        estimatedHours: 48,
        estimatedLessons: 12
      },
      courses: [
        {
          id: "course_ai_foundation",
          academyId: "academy_ai",
          categoryId: "cat_ai",
          name: "AI Foundation",
          shortName: "AI Foundation",
          description: "Core principles of artificial intelligence.",
          icon: "🧠",
          themeColor: "#3b82f6",
          difficulty: "Beginner",
          difficultyScore: 10,
          status: "active",
          enabled: true,
          order: 1,
          estimatedHours: 8,
          estimatedLessons: 4,
          estimatedXP: 600,
          learningObjectives: ["Understand AI basics"],
          prerequisites: [],
          recommendedNext: ["course_prompt_engineering"],
          tags: ["AI", "Beginner"],
          author: "Law Academy",
          version: "1.0",
          language: "English"
        },
        {
          id: "course_prompt_engineering",
          academyId: "academy_ai",
          categoryId: "cat_ai",
          name: "Prompt Engineering",
          shortName: "Prompt Eng.",
          description: "Master the art of crafting effective prompts.",
          icon: "✍️",
          themeColor: "#8b5cf6",
          difficulty: "Intermediate",
          difficultyScore: 40,
          status: "active",
          enabled: true,
          order: 2,
          estimatedHours: 5,
          estimatedLessons: 4,
          estimatedXP: 500,
          learningObjectives: ["Write clear prompts"],
          prerequisites: ["course_ai_foundation"],
          recommendedNext: [],
          tags: ["Prompt", "ChatGPT"],
          author: "Law Academy",
          version: "1.0",
          language: "English"
        }
      ],
      modules: [
        { id: "module_ai_basics", courseId: "course_ai_foundation", name: "AI Basics", order: 1, estimatedLessons: 2 },
        { id: "module_ml_intro", courseId: "course_ai_foundation", name: "Intro to ML", order: 2, estimatedLessons: 2 },
        { id: "module_prompt_basics", courseId: "course_prompt_engineering", name: "Prompt Basics", order: 1, estimatedLessons: 2 },
        { id: "module_advanced_prompt", courseId: "course_prompt_engineering", name: "Advanced Prompts", order: 2, estimatedLessons: 2 }
      ]
    };
    this.cachePackToStorage('academy_ai', packData);
    // 同时更新全局 Academy 列表，确保 Academy 页面能显示 AI Academy 为 active
    const list = LawAIApp.StorageEngine.get('academy_list');
    if (list) {
      const ai = list.find(a => a.id === 'academy_ai');
      if (ai) ai.status = 'active';
      LawAIApp.StorageEngine.set('academy_list', list);
    }
  },

  // 懒加载单个 lesson JSON
  async fetchLesson(academyId, lessonNumber) {
    const base = `content/${academyId}/lessons/lesson-${String(lessonNumber).padStart(3, '0')}.json`;
    try {
      const resp = await fetch(base);
      return await resp.json();
    } catch (e) {
      // 从 LocalStorage 缓存取（如果之前缓存了整个包，但这里是单课，暂不考虑）
      return null;
    }
  },

  // 验证包结构完整性
  validatePack(packData) {
    const errors = [];
    if (!packData.manifest) errors.push('Missing manifest');
    if (!packData.academy) errors.push('Missing academy');
    if (!packData.courses || !Array.isArray(packData.courses)) errors.push('Missing courses array');
    if (!packData.modules || !Array.isArray(packData.modules)) errors.push('Missing modules array');
    // 可以添加更多验证...
    return errors;
  }
};
