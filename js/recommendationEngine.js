// recommendationEngine.js - 安全回退版
window.LawAIApp = window.LawAIApp || {};

LawAIApp.RecommendationEngine = {
  // 安全版 getRecommendations - 永远返回有效数据，绝不报错
  getRecommendations: function(limit) {
    limit = limit || 3;
    var recs = [];
    
    try {
      // 尝试从 LessonEngine 获取推荐
      if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
        var progress = null;
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
          progress = LawAIApp.ProgressEngine.getProgress();
        }
        var completed = progress ? (progress.completedLessons || []) : [];
        var nextDay = completed.length + 1;
        if (nextDay > 365) nextDay = 365;
        
        for (var i = 0; i < limit; i++) {
          var day = Math.min(nextDay + i, 365);
          var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
          recs.push({
            id: 'day-' + day,
            title: lesson ? lesson.title : 'Day ' + day,
            description: lesson ? (lesson.summary || lesson.subtitle || 'Continue your AI journey.') : 'Continue your AI journey.',
            icon: ['📖', '🧠', '💡', '🚀', '🌟'][i % 5],
            type: 'lesson'
          });
        }
      } else {
        // 兜底数据
        var fallbackTitles = ['Introduction to AI', 'How AI Learns', 'AI in Daily Life'];
        for (var j = 0; j < limit; j++) {
          recs.push({
            id: 'day-' + (j + 1),
            title: fallbackTitles[j] || 'Lesson ' + (j + 1),
            description: 'Continue your learning journey.',
            icon: ['📖', '🧠', '💡'][j % 3],
            type: 'lesson'
          });
        }
      }
    } catch (e) {
      // 任何错误都不让页面崩溃
      console.warn('⚠️ RecommendationEngine fallback:', e);
      for (var k = 0; k < limit; k++) {
        recs.push({
          id: 'day-' + (k + 1),
          title: 'Lesson ' + (k + 1),
          description: 'Continue your learning journey.',
          icon: '📖',
          type: 'lesson'
        });
      }
    }
    
    return recs;
  },
  
  // 其他方法保持空实现，防止调用报错
  getActiveRecommendations: function() { return []; },
  accept: function(id) {},
  dismiss: function(id) {},
  getHistory: function() { return []; },
  refresh: function() {}
};

console.log('📊 RecommendationEngine (safe fallback) loaded');
