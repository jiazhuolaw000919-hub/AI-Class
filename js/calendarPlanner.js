// calendarPlanner.js
LawAIApp.calendarPlanner = {
  // 获取未来 N 天的简要计划（基于复习和进度预测）
  getUpcomingSummary: function(days = 7) {
      var upcomingReviews = LawAIApp.MemoryScheduler ? LawAIApp.MemoryScheduler.getUpcomingReviews(days) : [];
      
      // ✅ 从 CalendarAuthority 读取实际日程
      var authority = LawAIApp.CalendarAuthority;
      var scheduledItems = authority ? authority.getUpcomingSchedules(days * 2) : [];
      
      var progress = LawAIApp.ProgressEngine.getProgress();
      var dailyLessons = [];
      var remainingLessons = 365 - progress.completedLessons.length;
      var lessonsPerDay = remainingLessons > 0 ? Math.ceil(remainingLessons / 30) : 0;
      
      for (var i = 0; i < days; i++) {
          var date = new Date(Date.now() + i * 86400000);
          var dateStr = date.toISOString().split('T')[0];
          var reviewsOnDay = upcomingReviews.filter(function(r) { return r.date.startsWith(dateStr); }).length;
          var scheduledOnDay = scheduledItems.filter(function(s) { 
              return new Date(s.startAt).toISOString().startsWith(dateStr); 
          }).length;
          
          dailyLessons.push({
              date: dateStr,
              reviews: reviewsOnDay,
              scheduled: scheduledOnDay,
              newLessons: i < 7 ? lessonsPerDay : 0
          });
      }
      return dailyLessons;
  },
};
