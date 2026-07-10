// ================================================================
// dashboard.js – Phase 1 Dashboard Recovery
// 恢复 Season 1 的情感体验：活着、简单、高级、有动力、专注
// 保留所有原有功能，只优化视觉层次和情感设计
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Dashboard = {
  _rendered: false,

  /**
   * 渲染 Dashboard — Phase 1 情感恢复版
   * 视觉层次：Hero → Continue Learning → Today's Mission → Quick Actions → 推荐 → 其他
   */
  render: function() {
    // ============================================================
    // 数据获取（所有引擎继续运行）
    // ============================================================
    const progress = this._getProgress();
    const streakData = this._getStreakData();
    const levelInfo = this._getLevelInfo();
    const achievements = this._getAchievements();
    const allLessons = this._getAllLessons();
    const favorites = this._getFavorites();
    const todayLesson = this._getTodayLesson(allLessons, progress);
    const dailyBriefingHTML = this._getDailyBriefing();

    const completionRate = progress.completedLessons.length > 0
      ? ((progress.completedLessons.length / 365) * 100).toFixed(1)
      : '0.0';

    const currentStage = progress.currentStage || 'Foundation';
    const lastCompletedDate = this._getLastCompletedDate(streakData);

    // ============================================================
    // 构建 UI — 层级清晰，情感驱动
    // ============================================================
    const html = this._buildHTML({
      progress,
      streakData,
      levelInfo,
      achievements,
      todayLesson,
      favorites,
      completionRate,
      currentStage,
      lastCompletedDate,
      dailyBriefingHTML,
      allLessons
    });

    const app = document.getElementById('app') || document.getElementById('law-runtime-root');
    if (app) {
      app.innerHTML = html;
      this._rendered = true;
      this._initAnimations();
    }
  },

  // ============================================================
  // 数据获取方法（保留所有引擎调用）
  // ============================================================

  _getProgress: function() {
    try {
      if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
        return LawAIApp.ProgressEngine.getProgress();
      }
    } catch (e) {}
    return { xp: 0, completedLessons: [], currentLesson: 1, completionPercent: 0, currentStage: 'Foundation' };
  },

  _getStreakData: function() {
    try {
      if (LawAIApp.StreakEngine && typeof LawAIApp.StreakEngine.getStreakData === 'function') {
        return LawAIApp.StreakEngine.getStreakData();
      }
    } catch (e) {}
    return { currentStreak: 0, longestStreak: 0, lastLearningDate: null };
  },

  _getLevelInfo: function() {
    try {
      if (LawAIApp.LevelEngine && typeof LawAIApp.LevelEngine.calculateLevel === 'function') {
        return LawAIApp.LevelEngine.calculateLevel();
      }
    } catch (e) {}
    return { level: 1, currentLevelXP: 0, nextLevelXP: 100 };
  },

  _getAchievements: function() {
    try {
      if (LawAIApp.AchievementEngine && typeof LawAIApp.AchievementEngine.getUnlocked === 'function') {
        return LawAIApp.AchievementEngine.getUnlocked();
      }
    } catch (e) {}
    return [];
  },

  _getAllLessons: function() {
    try {
      if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getAllLessons === 'function') {
        return LawAIApp.LessonEngine.getAllLessons();
      }
    } catch (e) {}
    return [];
  },

  _getFavorites: function() {
    try {
      if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
        return LawAIApp.StorageEngine.get('favorites') || [];
      }
    } catch (e) {}
    return [];
  },

  _getTodayLesson: function(allLessons, progress) {
    if (!allLessons || allLessons.length === 0) return null;
    return allLessons[progress.currentLesson - 1] || allLessons[0] || null;
  },

  _getDailyBriefing: function() {
    try {
      if (LawAIApp.DailyBriefing && typeof LawAIApp.DailyBriefing.getCompactCardHTML === 'function') {
        return LawAIApp.DailyBriefing.getCompactCardHTML();
      }
    } catch (e) {}
    return '';
  },

  _getLastCompletedDate: function(streakData) {
    if (!streakData.lastLearningDate) return 'Not started';
    try {
      return new Date(streakData.lastLearningDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Not started';
    }
  },

  // ============================================================
  // HTML 构建 — 层级清晰，情感驱动
  // ============================================================

  _buildHTML: function(data) {
    const {
      progress,
      streakData,
      levelInfo,
      achievements,
      todayLesson,
      favorites,
      completionRate,
      currentStage,
      lastCompletedDate,
      dailyBriefingHTML,
      allLessons
    } = data;

    // ---- 问候语 ----
    const greeting = this._getGreeting();
    const userName = this._getUserName();
    const motivation = this._getMotivation(progress, streakData);

    // ---- 状态徽章 ----
    const levelDisplay = 'Lv.' + (levelInfo.level || 1);
    const xpDisplay = (progress.xp || 0) + ' XP';
    const streakDisplay = (streakData.currentStreak || 0) + 'd';

    // ---- 进度 ----
    const percent = Math.round(progress.completionPercent || 0);
    const completedCount = progress.completedLessons?.length || 0;
    const totalCount = 365;

    // ---- 继续学习 ----
    const nextDay = Math.min(completedCount + 1, 365);
    const lessonLink = completedCount === 0 ? '/pages/academy.html' : '/pages/lesson.html?day=' + nextDay;
    const btnText = completedCount === 0 ? '📖 Start Learning' : (completedCount >= 365 ? '🎉 Review' : '📖 Continue');

    const nextTitle = this._getLessonTitle(nextDay);
    const nextSummary = this._getLessonSummary(nextDay);

    // ---- 周挑战 ----
    const challenge = this._getWeeklyChallenge();

    // ---- 推荐 ----
    const recommendations = this._getRecommendations();

    // ============================================================
    // HTML 模板（视觉优先，情感驱动）
    // ============================================================
    return `
    <div id="dashboard-root" style="
      max-width: 1000px;
      margin: 0 auto;
      padding: 12px 20px 100px;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, sans-serif;
    ">

      <!-- ========================================================== -->
      <!-- 🔥 HERO 区 —— 视觉焦点 -->
      <!-- ========================================================== -->
      <div id="dashboard-hero" style="
        background: linear-gradient(145deg, #1a2a4a, #0f1a2e);
        border-radius: 24px;
        padding: 32px 28px 28px;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
        isolation: isolate;
        min-height: 180px;
        animation: dashboardFade 0.5s ease;
      ">
        <!-- 装饰 -->
        <div style="
          position: absolute;
          top: -80px;
          right: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74,158,255,0.04), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        "></div>
        <div style="
          position: absolute;
          bottom: -60px;
          left: -40px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(124,58,237,0.03), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        "></div>

        <div style="position:relative;z-index:1;">

          <!-- 问候 + 状态 -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 12px;
          ">
            <div>
              <div style="
                font-size: 13px;
                font-weight: 400;
                opacity: 0.6;
                letter-spacing: 0.3px;
                margin-bottom: 2px;
              ">${greeting}</div>
              <h1 style="
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: -0.3px;
                line-height: 1.1;
                background: linear-gradient(90deg, #e2e8f0, #94a3b8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              ">${userName}</h1>
            </div>
            <div style="
              display: flex;
              gap: 6px;
              flex-wrap: wrap;
            ">
              <span style="
                font-size: 11px;
                background: rgba(74,158,255,0.1);
                padding: 3px 12px;
                border-radius: 100px;
                color: #4a9eff;
                font-weight: 500;
                border: 1px solid rgba(74,158,255,0.06);
              ">${levelDisplay}</span>
              <span style="
                font-size: 11px;
                background: rgba(251,191,36,0.08);
                padding: 3px 12px;
                border-radius: 100px;
                color: #fbbf24;
                font-weight: 500;
                border: 1px solid rgba(251,191,36,0.06);
              ">${xpDisplay}</span>
              <span style="
                font-size: 11px;
                background: rgba(249,115,22,0.08);
                padding: 3px 12px;
                border-radius: 100px;
                color: #f97316;
                font-weight: 500;
                border: 1px solid rgba(249,115,22,0.06);
              ">🔥 ${streakDisplay}</span>
            </div>
          </div>

          <!-- 激励语 -->
          <div style="
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 14px;
            max-width: 480px;
            line-height: 1.4;
          ">${motivation}</div>

          <!-- 进度条 -->
          <div style="max-width: 400px;">
            <div style="
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              opacity: 0.5;
              margin-bottom: 3px;
            ">
              <span>Progress</span>
              <span>${completedCount}/${totalCount} lessons</span>
            </div>
            <div style="
              height: 3px;
              background: rgba(255,255,255,0.06);
              border-radius: 100px;
              overflow: hidden;
            ">
              <div style="
                width: ${percent}%;
                height: 100%;
                background: linear-gradient(90deg, #4a9eff, #7c3aed);
                border-radius: 100px;
                transition: width 0.8s ease;
              "></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- 🔥 Continue Learning —— 唯一主行动点 -->
      <!-- ========================================================== -->
      <a href="${lessonLink}" id="continue-learning" style="
        display: block;
        background: linear-gradient(135deg, #4a9eff, #6366f1);
        border-radius: 18px;
        padding: 18px 24px;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        box-shadow: 0 8px 40px rgba(74,158,255,0.08);
        margin-bottom: 20px;
      " onmouseover="this.style.transform='scale(1.01)';this.style.boxShadow='0 12px 60px rgba(74,158,255,0.15)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.08)'">
        <div style="
          position: absolute;
          top: -40px;
          right: -30px;
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        "></div>
        <div style="position:relative;z-index:1;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
          <div style="flex:1;min-width:100px;">
            <div style="
              font-size: 11px;
              font-weight: 500;
              opacity: 0.7;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            ">${completedCount >= 365 ? '🎉 Complete' : 'Next Lesson'}</div>
            <div style="
              font-size: 17px;
              font-weight: 600;
              margin: 1px 0;
              line-height: 1.2;
            ">${nextTitle}</div>
            <div style="
              font-size: 13px;
              opacity: 0.8;
            ">${completedCount === 0 ? 'Begin your AI journey.' : (completedCount >= 365 ? 'You\'ve mastered everything!' : nextSummary)}</div>
          </div>
          <div style="
            padding: 8px 24px;
            background: rgba(255,255,255,0.12);
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
            backdrop-filter: blur(4px);
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,0.06);
          ">${btnText} →</div>
        </div>
      </a>

      <!-- ========================================================== -->
      <!-- ⚡ Quick Actions —— 紧凑，不抢戏 -->
      <!-- ========================================================== -->
      <div style="
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 20px;
      ">
        ${[
          { icon: '📚', label: 'Academy', route: 'academy' },
          { icon: '🧠', label: 'Intelligence', route: 'intelligence' },
          { icon: '📓', label: 'Notes', route: 'knowledge-capture' },
          { icon: '💬', label: 'Chat', route: 'conversations' },
          { icon: '📅', label: 'Planner', route: 'planner' }
        ].map(function(btn) {
          return `
          <button onclick="LawAIApp.Router?.navigate('${btn.route}')" style="
            padding: 5px 14px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 100px;
            color: #94a3b8;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            display: flex;
            align-items: center;
            gap: 4px;
          " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='#94a3b8'">
            ${btn.icon} ${btn.label}
          </button>
          `;
        }).join('')}
        <button onclick="this.style.display='none';document.getElementById('more-actions').style.display='flex'" style="
          padding: 5px 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 100px;
          color: #64748b;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
          + more
        </button>
        <div id="more-actions" style="display:none;flex-wrap:wrap;gap:6px;">
          ${[
            { icon: '🛠️', label: 'Tools', route: 'tools' },
            { icon: '📋', label: 'Prompts', route: 'prompt' },
            { icon: '🎯', label: 'Goals', route: 'goal-intelligence' },
            { icon: '🧠', label: 'Mentor', route: 'mentor-brain' },
            { icon: '🚀', label: 'Showcase', route: 'career-showcase' }
          ].map(function(btn) {
            return `
            <button onclick="LawAIApp.Router?.navigate('${btn.route}')" style="
              padding: 5px 14px;
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.04);
              border-radius: 100px;
              color: #94a3b8;
              font-size: 11px;
              cursor: pointer;
              transition: all 0.2s;
              font-family: inherit;
              display: flex;
              align-items: center;
              gap: 4px;
            " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='#94a3b8'">
              ${btn.icon} ${btn.label}
            </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- 📊 次要信息（轻量，不抢视觉） -->
      <!-- ========================================================== -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
        opacity: 0.7;
      ">
        <!-- 进度卡片 -->
        <div style="
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255,255,255,0.04);
        ">
          <div style="font-size: 11px;color:#64748b;font-weight:400;">📊 Completion</div>
          <div style="font-size: 18px;font-weight:600;margin:2px 0;">${completionRate}%</div>
          <div style="font-size: 10px;color:#64748b;">${completedCount} of ${totalCount} lessons</div>
        </div>

        <!-- 成就卡片 -->
        <div style="
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          padding: 12px 16px;
          border: 1px solid rgba(255,255,255,0.04);
        ">
          <div style="font-size: 11px;color:#64748b;font-weight:400;">🏆 Achievements</div>
          <div style="font-size: 18px;font-weight:600;margin:2px 0;">${achievements.length}</div>
          <div style="font-size: 10px;color:#64748b;">${achievements.length === 0 ? 'Complete lessons to unlock' : 'Keep going!'}</div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- 📖 推荐（延迟加载，不阻塞首屏） -->
      <!-- ========================================================== -->
      <div id="dashboard-recommendations" style="
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        padding: 14px 16px;
        border: 1px solid rgba(255,255,255,0.04);
        min-height: 80px;
        opacity: 0.6;
        transition: opacity 0.4s ease;
      ">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
          <span style="font-size:14px;">🌟</span>
          <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended for you</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;">
          ${[0,1,2].map(function(i) {
            return `
            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:${i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none'};">
              <span style="font-size:12px;opacity:0.4;">⏳</span>
              <div style="flex:1;height:8px;width:${70 - i * 15}%;background:rgba(255,255,255,0.04);border-radius:4px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
            </div>
            `;
          }).join('')}
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes dashboardFade {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        </style>
      </div>

      <!-- ========================================================== -->
      <!-- 页脚 -->
      <!-- ========================================================== -->
      <div style="
        text-align:center;
        margin-top:20px;
        padding:12px;
        color:#64748b;
        font-size:10px;
        letter-spacing:0.5px;
        border-top:1px solid rgba(255,255,255,0.03);
      ">
        Law AI Academy
      </div>

    </div>
    `;
  },

  // ============================================================
  // 辅助方法
  // ============================================================

  _getGreeting: function() {
    var hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 17) return '☀️ Good afternoon';
    if (hour < 21) return '🌇 Good evening';
    return '🌙 Good night';
  },

  _getUserName: function() {
    try {
      if (LawAIApp.IdentityEngine && typeof LawAIApp.IdentityEngine.getName === 'function') {
        return LawAIApp.IdentityEngine.getName();
      }
    } catch (e) {}
    return 'Learner';
  },

  _getMotivation: function(progress, streakData) {
    var completed = progress.completedLessons?.length || 0;
    var streak = streakData.currentStreak || 0;

    if (completed >= 365) {
      return '🏆 You\'ve completed everything! You\'re a legend.';
    }
    if (streak >= 30) {
      return '🔥 ' + streak + '-day streak! You\'re unstoppable.';
    }
    if (streak >= 7) {
      return '💪 ' + streak + ' days strong! Keep going.';
    }
    if (completed >= 10) {
      return '🌟 ' + completed + ' lessons done! Every step counts.';
    }
    if (completed > 0) {
      return '🌱 Every journey begins with a single step. Keep showing up.';
    }
    return '🚀 Ready to start your AI journey?';
  },

  _getLessonTitle: function(day) {
    try {
      if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
        if (lesson && lesson.title) return lesson.title;
      }
    } catch (e) {}
    return 'Day ' + day;
  },

  _getLessonSummary: function(day) {
    try {
      if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
        if (lesson && lesson.summary) return lesson.summary;
        if (lesson && lesson.subtitle) return lesson.subtitle;
      }
    } catch (e) {}
    return 'Continue building your AI knowledge.';
  },

  _getWeeklyChallenge: function() {
    try {
      if (LawAIApp.Data && typeof LawAIApp.Data.weeklyChallenge === 'function') {
        return LawAIApp.Data.weeklyChallenge();
      }
    } catch (e) {}
    return { title: 'Complete 3 lessons this week', xp: 200, progress: 0 };
  },

  _getRecommendations: function() {
    var recs = [];
    try {
      if (LawAIApp.RecommendationEngine && typeof LawAIApp.RecommendationEngine.getRecommendations === 'function') {
        recs = LawAIApp.RecommendationEngine.getRecommendations(3) || [];
      }
    } catch (e) {}
    return recs;
  },

  /**
   * 初始化动画
   */
  _initAnimations: function() {
    // 延迟加载推荐
    var self = this;
    setTimeout(function() {
      self._loadRecommendations();
    }, 300);
  },

  /**
   * 加载推荐（延迟）
   */
  _loadRecommendations: function() {
    var container = document.getElementById('dashboard-recommendations');
    if (!container) return;

    var recs = this._getRecommendations();
    if (recs.length === 0) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
          <span style="font-size:14px;">🌟</span>
          <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended for you</span>
        </div>
        <div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">
          Complete more lessons to get personalized recommendations.
        </div>
      `;
      container.style.opacity = '1';
      return;
    }

    var recsHtml = recs.slice(0, 3).map(function(rec, index) {
      var lessonId = rec.id || 'day-' + (index + 1);
      var dayNum = lessonId.replace('day-', '');
      var link = '/pages/lesson.html?day=' + dayNum;
      var delay = index * 0.06;
      return `
        <div style="
          display:flex;
          align-items:center;
          gap:8px;
          padding:4px 0;
          border-bottom:${index < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none'};
          animation:fadeIn 0.4s ease ${delay}s;
        ">
          <span style="font-size:14px;">${rec.icon || '📖'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:500;color:#e2e8f0;">${rec.title || 'Lesson'}</div>
            <div style="font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rec.description || 'Continue your learning journey.'}</div>
          </div>
          <a href="${link}" style="
            padding:3px 12px;
            background:rgba(74,158,255,0.08);
            border-radius:100px;
            color:#4a9eff;
            font-size:10px;
            text-decoration:none;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
            Start
          </a>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:14px;">🌟</span>
        <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended for you</span>
      </div>
      ${recsHtml}
      <style>
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;
    container.style.opacity = '1';
    console.log('📊 Recommendations loaded (deferred)');
  },

  /**
   * 刷新 Dashboard
   */
  refresh: function() {
    if (!this._rendered) {
      this.render();
      return;
    }
    // 简单刷新：重新渲染
    this.render();
    console.log('🔄 Dashboard refreshed');
  }
};

// ============================================================
// 自动初始化
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(function() {
    if (LawAIApp.Dashboard && !LawAIApp.Dashboard._rendered) {
      var app = document.getElementById('app') || document.getElementById('law-runtime-root');
      if (app && app.innerHTML.trim() === '') {
        LawAIApp.Dashboard.render();
      }
    }
  }, 500);
}

console.log('📊 Dashboard V3.0 ready (Phase 1 - Emotional Recovery)');
