// ================================================================
// dashboard.js — Part 70: Learning Experience Layer
// 从 "数据展示" 变成 "学习体验"
// EXPLORE 导航：Academy/Notes 有功能，其他显示 Coming Soon
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Dashboard = {
  _rendered: false,

  render: function() {
    const contract = window.LawAIApp?.ExperienceContract;
    const orchestrator = window.LawAIApp?.JourneyOrchestrator;
    const lc = window.LawAIApp?.LearningContext;

    let progress, streakData, levelInfo, achievements, contractState;
    let learnerState = 'unknown';

    if (lc && lc.getContext) {
      try {
        const ctx = lc.getContext();
        if (ctx && ctx.status) {
          if (ctx.status.hasActiveSession) learnerState = 'active';
          else if (ctx.status.hasActiveLesson) learnerState = 'learning';
          else if (ctx.status.hasActiveCourse) learnerState = 'idle';
          else if (ctx.progress && ctx.progress.course > 0) learnerState = 'returning';
          else learnerState = 'not_started';
        }
      } catch (e) {
        console.warn('[Dashboard] LearningContext error:', e);
      }
    }

    if (orchestrator) {
      try {
        const journeyState = orchestrator.getJourneyState({});
        contractState = journeyState;
        if (journeyState.currentContext && journeyState.currentContext.lesson) {
          const ctx = journeyState.currentContext;
          progress = {
            xp: 0,
            completedLessons: [],
            currentLesson: parseInt(ctx.lesson.id) || 1,
            completionPercent: 0,
            currentStage: ctx.course?.title || 'Foundation'
          };
          if (journeyState.stats) {
            progress.completedLessons = journeyState.stats.completedLessons || [];
            progress.completionPercent = journeyState.stats.completionPercent || 0;
            progress.xp = journeyState.stats.xp || 0;
          }
        } else {
          progress = this._getProgress();
        }
      } catch (e) {
        progress = this._getProgress();
      }
    } else {
      progress = this._getProgress();
    }

    streakData = this._getStreakData();
    levelInfo = this._getLevelInfo();
    achievements = this._getAchievements();

    if (contract) {
      const validation = contract.validate({
        status: progress.completedLessons.length > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        authority: 'COURSE'
      });
      if (!validation.valid) {
        console.warn('[Dashboard] State validation warning:', validation.errors);
      }
    }

    const allLessons = this._getAllLessons();
    const favorites = this._getFavorites();
    const todayLesson = this._getTodayLesson(allLessons, progress);
    const dailyBriefingHTML = this._getDailyBriefing();

    const completionRate = progress.completedLessons.length > 0
      ? ((progress.completedLessons.length / 365) * 100).toFixed(1)
      : '0.0';

    const currentStage = progress.currentStage || 'Foundation';
    const lastCompletedDate = this._getLastCompletedDate(streakData);
    const noteCount = this._getNoteCount();

    const heroData = this._getHeroData(learnerState, progress, streakData);

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
      allLessons,
      noteCount,
      heroData,
      learnerState
    });

    const app = document.getElementById('app') || document.getElementById('law-runtime-root');
    if (app) {
      app.innerHTML = html;
      this._rendered = true;
      this._initAnimations();
    }
  },

  // ============================================================
  // Part 70: 状态感知 Hero
  // ============================================================

  _getHeroData: function(state, progress, streakData) {
    const completed = progress.completedLessons?.length || 0;
    const streak = streakData.currentStreak || 0;

    const states = {
      'not_started': {
        greeting: 'Ready to start your AI journey?',
        message: 'Explore the Academy and find where you want to begin.',
        cta: 'Explore Academy',
        ctaLink: '/pages/academy.html',
        showStreak: false
      },
      'exploring': {
        greeting: 'You\'re exploring.',
        message: 'There are several directions you can take from here.',
        cta: 'Continue Exploring',
        ctaLink: '/pages/academy.html',
        showStreak: true
      },
      'learning': {
        greeting: 'Welcome back.',
        message: 'Continue building on what you\'ve been learning.',
        cta: 'Continue Learning',
        ctaLink: completed > 0 ? '/pages/lesson.html?day=' + (completed + 1) : '/pages/academy.html',
        showStreak: true
      },
      'active': {
        greeting: 'You\'re in the flow.',
        message: 'Keep the momentum going.',
        cta: 'Resume Learning',
        ctaLink: '/pages/lesson.html?day=' + (completed + 1),
        showStreak: true
      },
      'returning': {
        greeting: 'Welcome back.',
        message: 'Your learning journey is ready when you are.',
        cta: 'Resume Learning',
        ctaLink: completed > 0 ? '/pages/lesson.html?day=' + (completed + 1) : '/pages/academy.html',
        showStreak: true
      },
      'idle': {
        greeting: 'Ready when you are.',
        message: 'Take the next step in your learning journey.',
        cta: 'Continue Learning',
        ctaLink: completed > 0 ? '/pages/lesson.html?day=' + (completed + 1) : '/pages/academy.html',
        showStreak: true
      }
    };

    if (completed >= 292 && state !== 'active' && state !== 'learning') {
      return {
        greeting: 'You\'re making great progress.',
        message: 'Keep going, or step back and review what you\'ve learned.',
        cta: 'Continue Learning',
        ctaLink: '/pages/lesson.html?day=' + (completed + 1),
        showStreak: true
      };
    }

    if (completed >= 365) {
      return {
        greeting: '🏆 You\'ve completed everything!',
        message: 'You\'re a legend. Review or explore new topics.',
        cta: 'Review All',
        ctaLink: '/pages/lesson.html?day=365',
        showStreak: true
      };
    }

    return states[state] || states['not_started'];
  },

  // ============================================================
  // 数据获取方法
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

  _getNoteCount: function() {
    try {
      var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
      if (notes && typeof notes.getNotes === 'function') {
        var notesList = notes.getNotes();
        return notesList ? notesList.length : 0;
      }
    } catch (e) {}
    return 0;
  },

  _hasNotes: function() {
    return this._getNoteCount() > 0;
  },

  _getAuthorityStatus: function() {
    var contract = window.LawAIApp?.ExperienceContract;
    if (contract) {
      var status = contract.getStatus();
      return status.initialized ? 'Contract Active' : 'Contract Pending';
    }
    return 'Direct Engine Access';
  },

  _getStateSource: function() {
    var orchestrator = window.LawAIApp?.JourneyOrchestrator;
    if (orchestrator && orchestrator.initialized) {
      return 'Journey Orchestrator';
    }
    return 'Individual Engines';
  },

  // ============================================================
  // Part 68: 学习洞察
  // ============================================================

  _getLearningInsight: function() {
    var ei = window.LawAIApp?.ExperienceIntelligence;
    if (!ei || !ei.initialized) return null;

    try {
      var signals = ei.getSignals();
      if (!signals || !signals.learningState) return null;

      var state = signals.learningState;
      var momentum = signals.momentum;
      var summary = signals.summary || '';

      if (state === 'unknown' || state === 'idle') {
        return null;
      }

      return {
        state: state,
        momentum: momentum,
        summary: summary,
        message: this._buildInsightMessage(state, momentum, signals)
      };
    } catch (e) {
      return null;
    }
  },

  _buildInsightMessage: function(state, momentum, signals) {
    var messages = {
      'active': {
        'strong': '🔥 You\'re on a roll! Keep the momentum going.',
        'steady': '📊 Steady progress. Consistency is key.',
        'slowing': '⏳ You\'ve started something great. Keep showing up.'
      },
      'near_completion': {
        'strong': '🎯 Almost there! You\'re close to finishing this module.',
        'steady': '📊 You\'re making solid progress toward completion.',
        'slowing': '⏳ The finish line is near. One more push!'
      },
      'idle': {
        'strong': '💪 You\'ve built great momentum. Ready to continue?',
        'steady': '📊 You\'ve made good progress. What\'s next?',
        'slowing': '🌱 Your learning journey is waiting. Take the next step.'
      }
    };

    var stateMessages = messages[state];
    if (!stateMessages) return 'Your learning journey is unfolding.';

    var momentumKey = momentum || 'steady';
    var message = stateMessages[momentumKey] || stateMessages['steady'];

    if (signals.summary && signals.summary !== message) {
      message += ' · ' + signals.summary;
    }

    return message;
  },

  // ============================================================
  // Part 70: HTML 构建 — 学习体验层
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
      allLessons,
      noteCount,
      heroData,
      learnerState
    } = data;

    const greeting = this._getGreeting();
    const userName = this._getUserName();
    const completedCount = progress.completedLessons?.length || 0;
    const totalCount = 365;

    const heroGreeting = heroData.greeting || 'Ready to learn?';
    const heroMessage = heroData.message || 'Explore the Academy and begin your journey.';
    const ctaText = heroData.cta || 'Explore Academy';
    const ctaLink = heroData.ctaLink || '/pages/academy.html';

    const streak = streakData.currentStreak || 0;
    const streakDisplay = streak > 0 ? '🔥 ' + streak + 'd' : '🌱 Start your first streak';

    const levelDisplay = 'Lv.' + (levelInfo.level || 1);
    const xpDisplay = (progress.xp || 0) + ' XP';

    const percent = Math.round(progress.completionPercent || 0);
    const noteCountDisplay = noteCount || 0;

    const nextDay = Math.min(completedCount + 1, 365);
    const nextTitle = this._getLessonTitle(nextDay);
    const nextSummary = this._getLessonSummary(nextDay);

    const insight = this._getLearningInsight();
    const insightHTML = insight ? `
      <div style="
        background: rgba(74,158,255,0.04);
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 12px;
        border-left: 3px solid #4a9eff;
      ">
        <div style="font-size: 11px; color: #4a9eff; font-weight: 500; margin-bottom: 4px;">💡 Learning Insight</div>
        <div style="font-size: 14px; color: #e2e8f0; line-height: 1.5;">${insight.message}</div>
      </div>
    ` : '';

    const CARD_RADIUS = '16px';
    const CARD_BG = 'rgba(255,255,255,0.025)';
    const CARD_BORDER = '1px solid rgba(255,255,255,0.04)';
    const CARD_PADDING = '20px';

    const isDebugMode = true;
    const authorityHTML = isDebugMode ? `
      <section style="
        background: rgba(255,255,255,0.015);
        border-radius: 8px;
        padding: 8px 12px;
        border: 1px solid rgba(255,255,255,0.02);
        margin-bottom: 12px;
        font-size: 9px;
        color: #475569;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      ">
        <span>📋 Authority: Course + Module + Lesson</span>
        <span>⚡ State: ${this._getAuthorityStatus()}</span>
        <span>📊 Source: ${this._getStateSource()}</span>
        <span>📓 Notes: ${this._getNoteCount()} saved</span>
      </section>
    ` : '';

    return `
    <div id="dashboard-root" style="
      max-width: 960px;
      margin: 0 auto;
      padding: 16px 20px 100px;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, sans-serif;
    ">

      <!-- 🔥 EXPLORE 导航（有功能的跳转，没功能的 Coming Soon） -->
      <section style="
        margin-bottom: 16px;
        padding: 14px 18px;
        background: rgba(255,255,255,0.02);
        border-radius: 100px;
        border: 1px solid rgba(255,255,255,0.04);
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: center;
        animation: heroFadeIn 0.4s ease;
      ">
        <span style="
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.6px;
          margin-right: 6px;
        ">EXPLORE</span>
        ${[
          { icon: '📚', label: 'Academy', url: '/pages/academy.html' },
          { icon: '📓', label: 'Notes', url: '/pages/academy.html#notes' },
          { icon: '🧠', label: 'Intelligence', url: null },
          { icon: '💬', label: 'Chat', url: null },
          { icon: '📅', label: 'Calendar', url: null },
          { icon: '🛠️', label: 'Tools', url: null },
          { icon: '📋', label: 'Prompts', url: null },
          { icon: '🎯', label: 'Goals', url: null },
          { icon: '🧠', label: 'Mentor', url: null },
          { icon: '🚀', label: 'Showcase', url: null }
        ].map(function(btn) {
          var onClick = btn.url 
            ? "window.location.href='" + btn.url + "'"
            : "if(window.LawAIApp&&window.LawAIApp.Toast&&typeof window.LawAIApp.Toast.info==='function'){window.LawAIApp.Toast.info('" + btn.label + " coming soon! 🚧')}else{alert('" + btn.label + " coming soon! 🚧')}";
          
          return `
          <button onclick="${onClick}" style="
            padding: 8px 18px;
            background: transparent;
            border: none;
            border-radius: 100px;
            color: #94a3b8;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            white-space: nowrap;
          " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='transparent';this.style.color='#94a3b8'">
            ${btn.icon} ${btn.label}
          </button>
          `;
        }).join('')}
      </section>

      <!-- 🔥 HERO — 状态感知 -->
      <section id="dashboard-hero" style="
        min-height: 32vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 40px 24px 32px;
        margin-bottom: 20px;
        position: relative;
        isolation: isolate;
        animation: heroFadeIn 0.6s ease;
      ">
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

        <div style="position:relative;z-index:1;">
          <p style="
            margin: 0 0 4px;
            font-size: 14px;
            color: #64748b;
            letter-spacing: 0.4px;
            font-weight: 400;
          ">${greeting}</p>

          <h1 style="
            margin: 0 0 8px;
            font-size: clamp(28px, 5vw, 42px);
            font-weight: 700;
            letter-spacing: -0.6px;
            line-height: 1.1;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${userName}</h1>

          <p style="
            margin: 0 0 16px;
            font-size: 15px;
            color: #94a3b8;
            max-width: 440px;
            line-height: 1.5;
          ">${heroMessage}</p>

          <a href="${ctaLink}" style="
            display: inline-block;
            padding: 12px 36px;
            background: linear-gradient(135deg, #4a9eff, #6366f1);
            border-radius: 100px;
            color: white;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 24px rgba(74,158,255,0.15);
          " onmouseover="this.style.transform='scale(1.04)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.2)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 24px rgba(74,158,255,0.15)'">
            ${ctaText} →
          </a>

          <div style="
            display: flex;
            gap: 16px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 16px;
            font-size: 12px;
            color: #64748b;
          ">
            <span style="background: rgba(255,255,255,0.04); padding: 3px 14px; border-radius: 100px;">${levelDisplay}</span>
            <span style="background: rgba(255,255,255,0.04); padding: 3px 14px; border-radius: 100px;">${xpDisplay}</span>
            <span style="background: rgba(255,255,255,0.04); padding: 3px 14px; border-radius: 100px;">${streakDisplay}</span>
          </div>
        </div>
      </section>

      <!-- 🔥 CONTINUE LEARNING -->
      ${completedCount === 0 ? `
      <div style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: 24px 20px;
        border: ${CARD_BORDER};
        text-align: center;
        margin-bottom: 20px;
      ">
        <div style="font-size: 36px; margin-bottom: 8px;">🚀</div>
        <h3 style="font-size: 17px; font-weight: 600; margin: 0 0 4px;">Start Your Learning Journey</h3>
        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 12px;">Explore the Academy to begin building your AI knowledge.</p>
        <button onclick="window.location.href='/pages/academy.html'" style="
          padding: 10px 28px;
          background: #4a9eff;
          border: none;
          border-radius: 100px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        ">Explore Academy →</button>
      </div>
      ` : `
      <div style="
        background: linear-gradient(135deg, #1e3555, #162040);
        border-radius: ${CARD_RADIUS};
        padding: 18px 24px;
        border: 1px solid rgba(74,158,255,0.12);
        box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      ">
        <div style="flex:1;min-width:120px;">
          <p style="
            margin: 0 0 2px;
            font-size: 10px;
            font-weight: 500;
            color: #4a9eff;
            letter-spacing: 0.8px;
            text-transform: uppercase;
          ">${completedCount >= 365 ? '🎉 All Complete' : 'Continue Learning'}</p>
          <h2 style="
            margin: 0 0 2px;
            font-size: 18px;
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
          padding: 8px 24px;
          background: #4a9eff;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 2px 12px rgba(74,158,255,0.3);
        ">
          <a href="/pages/lesson.html?day=${completedCount + 1}" style="color:white;text-decoration:none;">
            ${completedCount >= 365 ? '🎉 Review' : 'Continue →'}
          </a>
        </div>
      </div>
      `}

      <!-- 📊 PROGRESS -->
      <section style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: 14px ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 16px;
      ">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:12px;color:#94a3b8;">Your Academy Journey</span>
          <span style="font-size:12px;color:#64748b;">${completedCount}/${totalCount} lessons</span>
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
        <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px;color:#475569;">
          <span>${currentStage}</span>
          <span>${percent}%</span>
        </div>
      </section>

      <!-- 📖 RECOMMENDATIONS -->
      <section id="dashboard-recommendations" style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 16px;
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

      <!-- 📈 LEARNING INSIGHTS -->
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
        ${insightHTML}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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
            <span style="font-size:10px;color:#64748b;">📓 Notes</span>
            <p style="margin:2px 0 0;font-size:14px;font-weight:500;">${noteCountDisplay} saved</p>
          </div>
        </div>
      </section>

      <!-- 🔒 Authority Status -->
      ${authorityHTML}

      <!-- FOOTER -->
      <footer style="
        text-align:center;
        padding:16px;
        color:#64748b;
        font-size:10px;
        letter-spacing:0.5px;
        border-top:1px solid rgba(255,255,255,0.03);
      ">
        Law AI Academy · Season 4
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
    </style>
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

  _getRecommendations: function() {
    var recs = [];
    try {
      if (LawAIApp.RecommendationEngine && typeof LawAIApp.RecommendationEngine.getRecommendations === 'function') {
        recs = LawAIApp.RecommendationEngine.getRecommendations(3) || [];
      }
    } catch (e) {}
    return recs;
  },

  _initAnimations: function() {
    var self = this;
    setTimeout(function() {
      self._loadRecommendations();
    }, 300);
  },

  _loadRecommendations: function() {
    var container = document.getElementById('dashboard-recommendations');
    if (!container) return;

    var recs = this._getRecommendations();
    var de = window.LawAIApp?.DecisionExperience;
    var explanations = {};

    if (de && typeof de.getExplanation === 'function') {
      try {
        var options = de.getOptions({ includeDismissed: false });
        if (options && options.length > 0) {
          for (var i = 0; i < Math.min(options.length, 3); i++) {
            var exp = de.getExplanation(options[i].id);
            if (exp && exp.available) {
              explanations[options[i].id] = exp.reason || 'Recommended based on your learning context.';
            }
          }
        }
      } catch (e) {
        console.warn('[Dashboard] DecisionExperience explanation error:', e);
      }
    }

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
      var explanation = explanations[rec.id] || 'Recommended for you.';

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
            ${explanation ? `<div style="font-size:9px;color:#4a9eff;opacity:0.7;margin-top:1px;">💡 ${explanation}</div>` : ''}
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
        ${Object.keys(explanations).length > 0 ? `<span style="font-size:9px;color:#64748b;margin-left:auto;">💡 Why this?</span>` : ''}
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
    console.log('📊 Recommendations loaded with explanations');
  },

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

console.log('📊 Dashboard V4.2 ready (Part 70 - Learning Experience Layer)');
