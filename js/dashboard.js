// ================================================================
// dashboard.js – Phase 1 Dashboard Recovery → First Impression Canon V2.0
// 保留所有原有功能，重构视觉层次：Hero → Continue → Progress → Recommendations
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Dashboard = {
  _rendered: false,

  /**
   * 渲染 Dashboard — Canon V2.0 第一印象重构版
   * 视觉层次：Hero (40%) → Continue Learning → Today's Progress → Recommendations
   */
  render: function() {
    // ============================================================
    // 数据获取（所有引擎继续运行，不改）
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
    // 构建 UI — Canon V2.0 层级
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
  // 数据获取方法（全部保留，不改）
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
  // HTML 构建 — Canon V2.0 第一印象重构
  // 视觉层次：Hero(40%) → Continue Learning → Today's Progress → Recommendations
  // 所有卡片统一圆角 16px，统一背景色，统一边框
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
    const btnText = completedCount === 0 ? 'Start Learning' : (completedCount >= 365 ? 'Review All' : 'Continue');

    const nextTitle = this._getLessonTitle(nextDay);
    const nextSummary = this._getLessonSummary(nextDay);

    // ---- 周挑战（保留变量，原逻辑不动） ----
    const challenge = this._getWeeklyChallenge();

    // ---- 推荐（保留变量，传给 _loadRecommendations 用） ----
    const recommendations = this._getRecommendations();

    // ============================================================
    // 统一卡片设计语言 (Canon Rule 004)
    // ============================================================
    const CARD_RADIUS = '16px';
    const CARD_BG = 'rgba(255,255,255,0.025)';
    const CARD_BORDER = '1px solid rgba(255,255,255,0.04)';
    const CARD_PADDING = '20px';

    // ============================================================
    // HTML 模板（Canon V2.0 第一印象重构）
    // ============================================================
    return `
    <div id="dashboard-root" style="
      max-width: 960px;
      margin: 0 auto;
      padding: 16px 20px 100px;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, sans-serif;
    ">

      <!-- ========================================================== -->
      <!-- 🔥 HERO — 占首屏 38-42%，唯一视觉焦点 (Rule 001)            -->
      <!-- 纯净：只有问候 + 名字 + 激励语 + 3 个轻量徽章               -->
      <!-- ========================================================== -->
      <section id="dashboard-hero" style="
        min-height: 38vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 44px 24px 36px;
        margin-bottom: 24px;
        position: relative;
        isolation: isolate;
        animation: heroFadeIn 0.6s ease;
      ">
        <!-- 背景光晕（柔和，不抢戏） -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(74,158,255,0.05), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        "></div>
        <div style="
          position: absolute;
          top: 30%;
          right: 20%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        "></div>

        <div style="position:relative;z-index:1;">

          <!-- 问候语（轻量小字） -->
          <p style="
            margin: 0 0 4px;
            font-size: 14px;
            color: #64748b;
            letter-spacing: 0.4px;
            font-weight: 400;
          ">${greeting}</p>

          <!-- 名字（Hero 核心，大字号） -->
          <h1 style="
            margin: 0 0 14px;
            font-size: clamp(28px, 5vw, 42px);
            font-weight: 700;
            letter-spacing: -0.6px;
            line-height: 1.1;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${userName}</h1>

          <!-- 激励语 -->
          <p style="
            margin: 0 0 22px;
            font-size: 15px;
            color: #94a3b8;
            max-width: 440px;
            line-height: 1.5;
          ">${motivation}</p>

          <!-- 状态徽章（轻量，不抢名字焦点） -->
          <div style="
            display: flex;
            gap: 8px;
            justify-content: center;
            flex-wrap: wrap;
          ">
            <span style="
              font-size: 12px;
              background: rgba(74,158,255,0.08);
              padding: 5px 18px;
              border-radius: 100px;
              color: #4a9eff;
              font-weight: 500;
            ">${levelDisplay}</span>
            <span style="
              font-size: 12px;
              background: rgba(251,191,36,0.06);
              padding: 5px 18px;
              border-radius: 100px;
              color: #fbbf24;
              font-weight: 500;
            ">${xpDisplay}</span>
            <span style="
              font-size: 12px;
              background: rgba(249,115,22,0.06);
              padding: 5px 18px;
              border-radius: 100px;
              color: #f97316;
              font-weight: 500;
            ">🔥 ${streakDisplay}</span>
          </div>
        </div>
      </section>

      <!-- ========================================================== -->
      <!-- 🔥 CONTINUE LEARNING — 第二视觉重点，紧贴 Hero (Rule 002)    -->
      <!-- 更大卡片，一个主操作按钮                                     -->
      <!-- ========================================================== -->
      <a href="${lessonLink}" id="continue-learning" style="
        display: block;
        background: linear-gradient(135deg, #1e3555, #162040);
        border-radius: ${CARD_RADIUS};
        padding: 24px 28px;
        color: white;
        text-decoration: none;
        transition: all 0.3s ease;
        border: 1px solid rgba(74,158,255,0.12);
        box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
      " onmouseover="this.style.borderColor='rgba(74,158,255,0.3)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.12)'" onmouseout="this.style.borderColor='rgba(74,158,255,0.12)';this.style.boxShadow='0 4px 24px rgba(0,0,0,0.25)'">
        <!-- 装饰光晕 -->
        <div style="
          position: absolute;
          top: -50px;
          right: -30px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(74,158,255,0.07), transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        "></div>

        <div style="position:relative;z-index:1;display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
          <div style="flex:1;min-width:150px;">
            <p style="
              margin: 0 0 4px;
              font-size: 11px;
              font-weight: 500;
              color: #4a9eff;
              letter-spacing: 0.8px;
              text-transform: uppercase;
            ">${completedCount >= 365 ? '🎉 All Complete' : 'Continue Learning'}</p>
            <h2 style="
              margin: 0 0 4px;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
            ">${nextTitle}</h2>
            <p style="
              margin: 0;
              font-size: 13px;
              color: #94a3b8;
            ">${nextSummary}</p>
          </div>
          <div style="
            padding: 10px 28px;
            background: #4a9eff;
            border-radius: 100px;
            font-size: 15px;
            font-weight: 600;
            white-space: nowrap;
            transition: background 0.2s;
            box-shadow: 0 2px 12px rgba(74,158,255,0.3);
          ">${btnText} →</div>
        </div>
      </a>

      <!-- ========================================================== -->
      <!-- 📊 TODAY'S PROGRESS — 第三视觉层，三列等宽卡片               -->
      <!-- ========================================================== -->
      <section style="
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      ">
        <!-- 完成率 -->
        <div style="
          background: ${CARD_BG};
          border-radius: ${CARD_RADIUS};
          padding: ${CARD_PADDING};
          border: ${CARD_BORDER};
          text-align: center;
        ">
          <p style="margin:0 0 6px;font-size:11px;color:#64748b;">📊 Progress</p>
          <p style="margin:0;font-size:24px;font-weight:700;">${completionRate}%</p>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;">${completedCount}/${totalCount} lessons</p>
        </div>

        <!-- 连续签到 -->
        <div style="
          background: ${CARD_BG};
          border-radius: ${CARD_RADIUS};
          padding: ${CARD_PADDING};
          border: ${CARD_BORDER};
          text-align: center;
        ">
          <p style="margin:0 0 6px;font-size:11px;color:#64748b;">🔥 Streak</p>
          <p style="margin:0;font-size:24px;font-weight:700;">${streakData.currentStreak || 0}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;">days</p>
        </div>

        <!-- 成就 -->
        <div style="
          background: ${CARD_BG};
          border-radius: ${CARD_RADIUS};
          padding: ${CARD_PADDING};
          border: ${CARD_BORDER};
          text-align: center;
        ">
          <p style="margin:0 0 6px;font-size:11px;color:#64748b;">🏆 Achievements</p>
          <p style="margin:0;font-size:24px;font-weight:700;">${achievements.length}</p>
          <p style="margin:4px 0 0;font-size:10px;color:#64748b;">unlocked</p>
        </div>
      </section>

      <!-- ========================================================== -->
      <!-- 📖 RECOMMENDATIONS — 第四视觉层，延迟加载内容               -->
      <!-- ========================================================== -->
      <section id="dashboard-recommendations" style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 20px;
        min-height: 60px;
        transition: opacity 0.4s ease;
      ">
        <p style="margin:0 0 12px;font-size:12px;color:#94a3b8;font-weight:500;">
          🌟 Recommended for you
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${[0,1,2].map(function(i) {
            return `
            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:${i < 2 ? '1px solid rgba(255,255,255,0.02)' : 'none'};">
              <span style="font-size:14px;opacity:0.3;">⏳</span>
              <div style="flex:1;height:10px;width:${75 - i * 18}%;background:rgba(255,255,255,0.03);border-radius:4px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
            </div>
            `;
          }).join('')}
        </div>
      </section>

      <!-- ========================================================== -->
      <!-- ⚡ QUICK ACTIONS — 所有导航入口，首屏下方                   -->
      <!-- ========================================================== -->
      <section style="margin-bottom: 16px;">
        <p style="margin:0 0 10px;font-size:11px;color:#64748b;font-weight:500;letter-spacing:0.6px;">
          EXPLORE
        </p>
        <div style="
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        ">
          ${[
            { icon: '📚', label: 'Academy', route: 'academy' },
            { icon: '🧠', label: 'Intelligence', route: 'intelligence' },
            { icon: '📓', label: 'Notes', route: 'knowledge-capture' },
            { icon: '💬', label: 'Chat', route: 'conversations' },
            { icon: '📅', label: 'Planner', route: 'planner' },
            { icon: '🛠️', label: 'Tools', route: 'tools' },
            { icon: '📋', label: 'Prompts', route: 'prompt' },
            { icon: '🎯', label: 'Goals', route: 'goal-intelligence' },
            { icon: '🧠', label: 'Mentor', route: 'mentor-brain' },
            { icon: '🚀', label: 'Showcase', route: 'career-showcase' }
          ].map(function(btn) {
            return `
            <button onclick="LawAIApp.Router?.navigate('${btn.route}')" style="
              padding: 6px 16px;
              background: ${CARD_BG};
              border: ${CARD_BORDER};
              border-radius: 100px;
              color: #94a3b8;
              font-size: 11px;
              cursor: pointer;
              transition: all 0.2s;
              font-family: inherit;
            " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='${CARD_BG}';this.style.color='#94a3b8'">
              ${btn.icon} ${btn.label}
            </button>
            `;
          }).join('')}
        </div>
      </section>

      <!-- ========================================================== -->
      <!-- 📈 进度条 + 详情（Hero 外的进度条）                         -->
      <!-- ========================================================== -->
      <section style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: 14px ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 20px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
          <span style="font-size:11px;color:#94a3b8;">Overall Progress</span>
          <span style="font-size:12px;font-weight:600;">${percent}%</span>
        </div>
        <div style="
          height: 4px;
          background: rgba(255,255,255,0.04);
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
      </section>

      <!-- ========================================================== -->
      <!-- 📈 LEARNING INSIGHTS — 次要详情，自然在滚动下方             -->
      <!-- ========================================================== -->
      <section style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 16px;
      ">
        <p style="margin:0 0 10px;font-size:11px;color:#64748b;font-weight:500;letter-spacing:0.6px;">
          📈 LEARNING INSIGHTS
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div>
            <span style="font-size:10px;color:#64748b;">Current Stage</span>
            <p style="margin:2px 0 0;font-size:14px;font-weight:500;">${currentStage}</p>
          </div>
          <div>
            <span style="font-size:10px;color:#64748b;">Last Active</span>
            <p style="margin:2px 0 0;font-size:14px;font-weight:500;">${lastCompletedDate}</p>
          </div>
          <div>
            <span style="font-size:10px;color:#64748b;">Longest Streak</span>
            <p style="margin:2px 0 0;font-size:14px;font-weight:500;">${streakData.longestStreak || 0} days</p>
          </div>
          <div>
            <span style="font-size:10px;color:#64748b;">Level Progress</span>
            <p style="margin:2px 0 0;font-size:14px;font-weight:500;">${levelInfo.currentLevelXP || 0} / ${levelInfo.nextLevelXP || 100} XP</p>
          </div>
        </div>
      </section>

      <!-- ========================================================== -->
      <!-- 页脚 -->
      <!-- ========================================================== -->
      <footer style="
        text-align:center;
        padding:16px;
        color:#64748b;
        font-size:10px;
        letter-spacing:0.5px;
        border-top:1px solid rgba(255,255,255,0.03);
      ">
        Law AI Academy · V${window.App?.version || '5.1.1'}
      </footer>

    </div>

    <style>
      @keyframes heroFadeIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
    `;
  },

  // ============================================================
  // 辅助方法（全部保留，不改）
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
   * 初始化动画（保留，不改）
   */
  _initAnimations: function() {
    var self = this;
    setTimeout(function() {
      self._loadRecommendations();
    }, 300);
  },

  /**
   * 加载推荐延迟（保留全部原有逻辑，不改）
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
   * 刷新 Dashboard（保留，不改）
   */
  refresh: function() {
    if (!this._rendered) {
      this.render();
      return;
    }
    this.render();
    console.log('🔄 Dashboard refreshed');
  }
};

// ============================================================
// 自动初始化（保留，不改）
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

console.log('📊 Dashboard V4.0 ready (Canon V2.0 - First Impression)');
