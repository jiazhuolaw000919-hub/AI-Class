// ================================================================
// ENGINE: RecommendationEngine
// LAYER: Core Logic Layer
// DOMAIN: Learning Recommendations
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.1 - Added getRecommendations() for Academy
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.RecommendationEngine = (function() {
  
  // ============================================================
  // 内部方法
  // ============================================================
  
  function generateAndStore() {
    if (!LawAIApp.RecommendationRules || typeof LawAIApp.RecommendationRules.generate !== 'function') {
      console.warn('⚠️ RecommendationRules not available');
      return;
    }
    
    const newRecs = LawAIApp.RecommendationRules.generate();
    
    // 移除之前过期的活跃推荐（根据expiresAt）
    const active = LawAIApp.RecommendationHistory.getActive().filter(function(r) {
      if (r.expiresAt && new Date(r.expiresAt) < new Date()) {
        LawAIApp.RecommendationHistory.dismiss(r.recommendationId);
        return false;
      }
      return true;
    });
    
    const existingIds = active.map(function(r) { return r.recommendationId; });
    
    // 添加新推荐（避免重复ID）
    newRecs.forEach(function(rec) {
      if (existingIds.indexOf(rec.recommendationId) === -1) {
        LawAIApp.RecommendationHistory.add(rec);
      }
    });
    
    // 发射事件
    if (LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function') {
      LawAIApp.EventBus.emit('RecommendationGenerated', {
        active: LawAIApp.RecommendationHistory.getActive()
      });
    }
  }

  // ============================================================
  // 监听事件
  // ============================================================
  
  if (LawAIApp.EventBus) {
    LawAIApp.EventBus.on('AnalyticsUpdated', generateAndStore);
    LawAIApp.EventBus.on('ProgressUpdated', generateAndStore);
    LawAIApp.EventBus.on('LessonCompleted', generateAndStore);
    LawAIApp.EventBus.on('XPUpdated', generateAndStore);
  }

  // ============================================================
  // 初始化时生成一次
  // ============================================================
  setTimeout(function() {
    if (LawAIApp.RecommendationRules && typeof LawAIApp.RecommendationRules.generate === 'function') {
      generateAndStore();
      console.log('📊 RecommendationEngine initialized');
    }
  }, 500);

  // ============================================================
  // 公开 API
  // ============================================================
  
  return {
    /**
     * getActiveRecommendations()
     * 
     * @returns {Array} Active recommendations
     */
    getActiveRecommendations: function() {
      return LawAIApp.RecommendationHistory ? LawAIApp.RecommendationHistory.getActive() : [];
    },
    
    /**
     * accept(id)
     * 
     * @param {string} id - Recommendation ID to accept
     */
    accept: function(id) {
      if (LawAIApp.RecommendationHistory) {
        LawAIApp.RecommendationHistory.accept(id);
      }
    },
    
    /**
     * dismiss(id)
     * 
     * @param {string} id - Recommendation ID to dismiss
     */
    dismiss: function(id) {
      if (LawAIApp.RecommendationHistory) {
        LawAIApp.RecommendationHistory.dismiss(id);
      }
    },
    
    /**
     * getHistory()
     * 
     * @returns {Array} Recommendation history
     */
    getHistory: function() {
      return LawAIApp.RecommendationHistory ? LawAIApp.RecommendationHistory.getHistory() : [];
    },
    
    /**
     * refresh()
     * 
     * Manually refresh recommendations
     */
    refresh: function() {
      generateAndStore();
    },
    
    /**
     * getRecommendations(limit)
     * 
     * 🔥 新增：为 Academy 提供推荐列表
     * 从推荐历史中获取活跃推荐，如果不够则从 LessonEngine 生成备选
     * 
     * @param {number} limit - Maximum number of recommendations
     * @returns {Array} Recommendations array
     */
    getRecommendations: function(limit) {
      limit = limit || 3;
      var recs = [];
      
      // 1. 从推荐历史获取活跃推荐
      try {
        var active = this.getActiveRecommendations();
        if (active && active.length > 0) {
          recs = active.slice(0, limit).map(function(r) {
            return {
              id: r.lessonId || r.recommendationId || 'day-1',
              title: r.title || 'Lesson',
              description: r.description || 'Continue your learning journey.',
              icon: r.icon || '📖',
              type: r.type || 'lesson'
            };
          });
        }
      } catch (e) {
        console.warn('⚠️ Could not get active recommendations:', e);
      }
      
      // 2. 如果推荐不够，从 LessonEngine 生成备选
      if (recs.length < limit) {
        try {
          var progress = null;
          if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
            progress = LawAIApp.ProgressEngine.getProgress();
          }
          
          var completed = progress ? (progress.completedLessons || []) : [];
          var nextDay = completed.length + 1;
          if (nextDay > 365) nextDay = 365;
          
          var fallbackTitles = [
            'Introduction to AI',
            'How AI Learns',
            'AI in Daily Life',
            'The AI Toolbox',
            'Ethics in AI',
            'Your AI Companion',
            'The Future of AI',
            'AI and Creativity',
            'AI for Good',
            'Your AI Journey'
          ];
          
          for (var i = recs.length; i < limit; i++) {
            var day = Math.min(nextDay + i, 365);
            var id = 'day-' + day;
            var title = this._getLessonTitle(day) || fallbackTitles[i % fallbackTitles.length] || 'Day ' + day;
            var summary = this._getLessonSummary(day) || 'Continue your AI learning journey.';
            
            recs.push({
              id: id,
              title: title,
              description: summary,
              icon: ['📖', '🧠', '💡', '🚀', '🌟'][i % 5],
              type: 'lesson'
            });
          }
        } catch (e) {
          console.warn('⚠️ Could not generate fallback recommendations:', e);
          // 最简 fallback
          for (var j = recs.length; j < limit; j++) {
            recs.push({
              id: 'day-' + (j + 1),
              title: 'Lesson ' + (j + 1),
              description: 'Continue your learning journey.',
              icon: '📖',
              type: 'lesson'
            });
          }
        }
      }
      
      return recs.slice(0, limit);
    },
    
    /**
     * _getLessonTitle(day)
     * 
     * @param {number} day - Day number
     * @returns {string} Lesson title
     */
    _getLessonTitle: function(day) {
      try {
        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
          var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
          if (lesson && lesson.title) return lesson.title;
        }
      } catch (e) {}
      return 'Day ' + day;
    },
    
    /**
     * _getLessonSummary(day)
     * 
     * @param {number} day - Day number
     * @returns {string} Lesson summary
     */
    _getLessonSummary: function(day) {
      try {
        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
          var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
          if (lesson && lesson.summary) return lesson.summary;
          if (lesson && lesson.subtitle) return lesson.subtitle;
        }
      } catch (e) {}
      return 'Continue your AI learning journey.';
    }
  };
})();

console.log('📊 RecommendationEngine V1.0.1 ready');
