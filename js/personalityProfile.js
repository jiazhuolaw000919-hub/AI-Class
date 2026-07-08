// ===========================================
// personalityProfile.js
// 人格档案：追踪用户学习风格和偏好
// ===========================================

// 确保 LawAIApp 存在
window.LawAIApp = window.LawAIApp || {};

LawAIApp.PersonalityProfile = {
  initialized: false,

  init() {
    if (this.initialized) return;
    this.initialized = true;
    console.log('🧠 PersonalityProfile initialized');
    return this;
  },

  // 获取进度（带防御）
  _getProgress() {
    try {
      if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
        return LawAIApp.ProgressEngine.getProgress();
      }
      console.warn('⚠️ ProgressEngine not ready, using default progress');
      return { completedLessons: [], xp: 0, level: 1 };
    } catch (err) {
      console.warn('⚠️ Failed to get progress:', err);
      return { completedLessons: [], xp: 0, level: 1 };
    }
  },

  // 分析学习事件（带防御）
  analyzeLearningEvents() {
    console.log('📊 PersonalityProfile analyzing learning events...');
    
    try {
      const progress = this._getProgress();
      
      // 计算学习特征
      const totalLessons = progress.totalLessons || 365;
      const completed = progress.completedLessons?.length || 0;
      const completionRate = totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
      
      const xp = progress.xp || 0;
      const level = progress.level || 1;
      
      // 生成学习风格分析
      const style = {
        // 学习速度：基于完成率
        pace: completionRate > 50 ? 'fast' : completionRate > 25 ? 'moderate' : 'slow',
        
        // 学习深度：基于 XP 与完成课程的比例
        depth: completed > 0 && xp > 0 ? Math.min(100, Math.round(xp / completed * 2)) : 50,
        
        // 一致性：基于每日学习习惯（简化版）
        consistency: 70,
        
        // 偏好类别（基于已完成的课程）
        preferredCategories: this._analyzeCategories(progress),
        
        // 当前状态
        level: level,
        xp: xp,
        completionRate: Math.round(completionRate)
      };
      
      console.log('✅ Personality analysis complete:', style);
      return style;
      
    } catch (err) {
      console.warn('⚠️ Personality analysis failed:', err);
      return {
        pace: 'moderate',
        depth: 50,
        consistency: 70,
        preferredCategories: ['General'],
        level: 1,
        xp: 0,
        completionRate: 0
      };
    }
  },

  // 分析偏好类别（带防御）
  _analyzeCategories(progress) {
    try {
      const completed = progress.completedLessons || [];
      if (!completed || completed.length === 0) {
        return ['General'];
      }
      
      // 从已完成的课程中提取类别
      const categories = [];
      const allLessons = LawAIApp.LessonEngine?.getAllLessons?.() || [];
      
      completed.forEach(lessonId => {
        try {
          const lesson = allLessons.find(l => l && l.lessonId === lessonId);
          if (lesson && lesson.category) {
            categories.push(lesson.category);
          }
        } catch (err) {
          // 忽略单个课程错误
        }
      });
      
      if (categories.length === 0) return ['General'];
      
      // 统计出现次数最多的类别
      const counts = {};
      categories.forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
      
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted.slice(0, 3).map(([cat]) => cat);
      
    } catch (err) {
      console.warn('⚠️ Category analysis failed:', err);
      return ['General'];
    }
  },

  // 获取学习风格摘要
  getStyleSummary() {
    try {
      return this.analyzeLearningEvents();
    } catch (err) {
      console.warn('⚠️ Failed to get style summary:', err);
      return {
        pace: 'moderate',
        depth: 50,
        consistency: 70,
        preferredCategories: ['General'],
        level: 1,
        xp: 0,
        completionRate: 0
      };
    }
  },

  // 获取学习建议
  getRecommendations() {
    try {
      const style = this.analyzeLearningEvents();
      const recommendations = [];
      
      if (style.pace === 'slow') {
        recommendations.push('Consider shorter, more frequent learning sessions');
      }
      
      if (style.depth < 40) {
        recommendations.push('Try to dive deeper into concepts with practice exercises');
      }
      
      if (style.consistency < 60) {
        recommendations.push('Try to establish a daily learning routine');
      }
      
      if (style.completionRate < 30) {
        recommendations.push('Start with foundational lessons to build momentum');
      }
      
      return {
        style: style,
        recommendations: recommendations,
        timestamp: new Date().toISOString()
      };
      
    } catch (err) {
      console.warn('⚠️ Failed to get recommendations:', err);
      return {
        style: { pace: 'moderate', depth: 50, consistency: 70 },
        recommendations: ['Continue learning at your own pace'],
        timestamp: new Date().toISOString()
      };
    }
  }
};

// 自动初始化
LawAIApp.PersonalityProfile.init();

console.log('🧠 PersonalityProfile V1.0 ready');
