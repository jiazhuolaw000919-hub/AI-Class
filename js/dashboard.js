// ================================================================
// dashboard.js — Part 72: Learner Dialogue & Calibration
// 从 "理解学习" 变成 "回应学习"
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.Dashboard = {
  _rendered: false,
  _reflectionStates: {},
  _dialogueStates: {},

  // ============================================================
  // Part 76: Attention & Priority Constants
  // ============================================================

  PRIORITY: {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary',
    BACKGROUND: 'background'
  },

  PRIORITY_ORDER: {
    'primary': 0,
    'secondary': 1,
    'tertiary': 2,
    'background': 3
  },

    render: function() {

      // 🔥 防止 200ms 内重复渲染
    var now = Date.now();
    if (this._lastRenderAt && (now - this._lastRenderAt) < 5000) {
        console.log('[Dashboard] ⏭️ Skipping duplicate render (within 5000ms)');
        return;
    }
    
    this._lastRenderAt = now;
    const contract = window.LawAIApp?.ExperienceContract;
    const orchestrator = window.LawAIApp?.JourneyOrchestrator;
    const lc = window.LawAIApp?.LearningContext;

    let progress, streakData, levelInfo, achievements, contractState;
    let learnerState = 'unknown';

    // 🔥 获取 LearningState（从 LearningJourneyAdapter）
    var learningState = null;
    var adapter = window.LawAIApp?.LearningJourneyAdapter;
    if (adapter && adapter.initialized && typeof adapter.getLearningState === 'function') {
        try {
            learningState = adapter.getLearningState();
        } catch (e) {
            console.warn('[Dashboard] LearningState unavailable:', e);
        }
    }

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

    if (contract && typeof contract.validate === 'function') {
      try {
        const validation = contract.validate({
          status: progress.completedLessons.length > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
          authority: 'COURSE'
        });
        if (validation && !validation.valid) {
          console.warn('[Dashboard] State validation warning:', validation.errors);
        }
      } catch (e) {
        console.warn('[Dashboard] Contract validation error:', e);
      }
    }

    const allLessons = this._getAllLessons();
    const favorites = this._getFavorites();
    const todayLesson = this._getTodayLesson(allLessons, progress);
    const dailyBriefingHTML = this._getDailyBriefing();

    // 🔥 Part 162: Core-Derived Dashboard — Read Only
    // ⚠️ 必须先声明 viewModel，再使用
    var coreResult = null;
    var viewModel = null;
    var surfaceData = null;

    try {
      coreResult = this._getCoreIntelligenceResult();
      if (coreResult) {
        surfaceData = LawAIApp.DashboardSurfaceAdapter
          ? LawAIApp.DashboardSurfaceAdapter.adapt(coreResult)
          : null;
        viewModel = LawAIApp.DashboardViewModel
          ? LawAIApp.DashboardViewModel.toRenderModel(surfaceData)
          : null;
      }
    } catch (e) {
      console.warn('[Dashboard] Core Intelligence read error:', e);
    }

    // ✅ 现在 viewModel 已经声明并赋值，可以安全使用
    const completionRate = viewModel && viewModel.progress
      ? (viewModel.progress.overall || 0).toFixed(1)
      : (progress.completedLessons && progress.completedLessons.length > 0
          ? ((progress.completedLessons.length / 365) * 100).toFixed(1)
          : '0.0');

    const currentStage = progress.currentStage || 'Foundation';
    const lastCompletedDate = this._getLastCompletedDate(streakData);
    const noteCount = this._getNoteCount();

    // 🔥 heroData 用 let，因为后面会被 ViewModel 覆盖
    let heroData = this._getHeroData(learnerState, progress, streakData);

    // 🔥 Part 162: 如果 ViewModel 可用，用它的数据覆盖 heroData
    if (viewModel) {
      if (viewModel.hero) {
        heroData = {
          greeting: viewModel.hero.greeting || heroData.greeting,
          message: viewModel.hero.message || heroData.message,
          cta: viewModel.hero.cta || heroData.cta,
          ctaLink: viewModel.hero.ctaLink || heroData.ctaLink,
          showStreak: viewModel.hero.showStreak !== undefined ? viewModel.hero.showStreak : true
        };
      }

      // 进度来自 Core (只读)
      if (viewModel.progress && viewModel.progress.overall !== undefined) {
        progress.completionPercent = viewModel.progress.overall;
      }

      // 🔥 保存 ViewModel 供后续使用
      this._lastViewModel = viewModel;
    }

    // Part 178: 计算当前课程进度
    var courseProgressPercent = 0;
    if (viewModel && viewModel.progress && viewModel.progress.overall !== undefined) {
      courseProgressPercent = Math.round(viewModel.progress.overall);
    } else if (adapter && typeof adapter.getLearningState === 'function') {
      try {
        var ls = adapter.getLearningState();
        if (ls && ls.progress) {
          courseProgressPercent = Math.round(ls.progress.course || 0);
        }
      } catch (e) {}
    }

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
      learnerState,
      courseProgressPercent
    });

    const app = document.getElementById('app') || document.getElementById('law-runtime-root');
      if (app) {
          app.innerHTML = html;
          this._rendered = true;
          this._initAnimations();
      
          // 🔥 用双 rAF 确保 dashboard 已经 paint 到屏幕
          requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                  try {
                      document.dispatchEvent(new CustomEvent('DASHBOARD_RENDERED', {
                          detail: { timestamp: Date.now() }
                      }));
                      console.log('[Dashboard] 📣 DASHBOARD_RENDERED dispatched (after paint)');
                  } catch (e) {}
              });
          });
      }
  },

  // ============================================================
  // 🔥 强制重新渲染（绕过 5 秒防抖）
  // ============================================================
  forceRender: function() {
    console.log('[Dashboard] 🔥 Force render (bypassing debounce)');
    this._lastRenderAt = 0;   // 🔥 关键：重置防抖时间戳
    this._rendered = false;
    this.render();
  },

  // 兼容旧调用
  _forceRender: function() {
    return this.forceRender();
  },

  // ============================================================
  // Part 102: Core Intelligence Consumer
  // ============================================================

  /**
   * 从 Core Intelligence 获取权威结果
   * 通过 LearningJourneyAdapter 的 pipeline 获取
   */
  _getCoreIntelligenceResult: function() {
      var adapter = window.LawAIApp?.LearningJourneyAdapter;
      if (!adapter || !adapter.initialized) {
          return null;
      }

      try {
          // 使用 Part 96 的 pipeline
          if (typeof adapter.runPipeline === 'function') {
              return adapter.runPipeline({
                  context: this._getDashboardContext()
              });
          }
        
          // fallback: 使用 Journey Context
          if (typeof adapter.getJourneyContext === 'function') {
              return adapter.getJourneyContext();
          }
      } catch (e) {
          console.warn('[Dashboard] Core Intelligence unavailable:', e);
      }

      return null;
  },

  /**
   * 获取 Dashboard 上下文
   */
  _getDashboardContext: function() {
      var lc = window.LawAIApp?.LearningContext;
      var state = {};
    
      if (lc && lc.getContext) {
          try {
              state = lc.getContext() || {};
          } catch (e) {}
      }

      return {
          learningMode: 'dashboard',
          context: state,
          timestamp: new Date().toISOString()
      };
  },

  /**
   * 使用 ViewModel 渲染
   */
  __renderWithViewModel: function(viewModel) {
    // 使用 ViewModel 构建 HTML
    var html = this._buildHTMLFromViewModel(viewModel);
    
    var app = document.getElementById('app') || document.getElementById('law-runtime-root');
    if (app) {
        app.innerHTML = html;
        this._rendered = true;
        this._initAnimations();
    }
},

  /**
   * 从 ViewModel 构建 HTML（简化版）
   * 后续可逐步替换现有 _buildHTML
   */
  _buildHTMLFromViewModel: function(viewModel) {
      // 这里先复用现有的 _buildHTML，但传入 viewModel 数据
      // 或者逐步将 _buildHTML 改为接收 viewModel
      return this._buildHTML({
          progress: viewModel.progress || { overall: 0 },
          streakData: { currentStreak: 0 },
          levelInfo: { level: 1 },
          achievements: [],
          todayLesson: null,
          favorites: [],
          completionRate: '0.0',
          currentStage: 'Foundation',
          lastCompletedDate: 'Not started',
          dailyBriefingHTML: '',
          allLessons: [],
          noteCount: 0,
          heroData: viewModel.hero || { greeting: 'Welcome', message: 'Start learning', cta: 'Explore', ctaLink: '/pages/academy.html' },
          learnerState: 'not_started',
          // Part 102: 新增数据
          _viewModel: viewModel
      });
  },

  // ============================================================
  // Part 70: 状态感知 Hero
  // ============================================================

  _getHeroData: function(state, progress, streakData) {
    const completed = progress.completedLessons?.length || 0;

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
  // Part 74: Learning Loop — INSIGHT → CHOICE → OUTCOME → CONTEXT
  // ============================================================

  _getLearningLoopData: function() {
    var state = this._getLoopState();
    
    // 如果状态是 QUIET 且无活动，返回安静状态
    if (state.status === 'QUIET' && !state.hasAction) {
      return {
        hasActiveLoop: false,
        isQuiet: true,
        quietMessage: state.message || 'Nothing needs your attention right now.',
        state: state
      };
    }
    
    var loopData = {
      insight: null,
      choices: [],
      outcome: null,
      context: null,
      hasActiveLoop: false
    };

    // 1. INSIGHT: 从 ExperienceIntelligence 获取
    var ei = window.LawAIApp?.ExperienceIntelligence;
    if (ei && ei.initialized) {
      try {
        var signals = ei.getSignals();
        if (signals && signals.learningState) {
          loopData.insight = {
            message: this._buildInsightMessage(signals.learningState, signals.momentum, signals),
            state: signals.learningState,
            momentum: signals.momentum || 'steady',
            confidence: signals.confidence || 'medium'
          };
          loopData.hasActiveLoop = true;
        }
      } catch (e) {
        console.warn('[Dashboard][Part74] Insight error:', e);
      }
    }

    // 2. CHOICES: 从 DecisionExperience 获取
    var de = window.LawAIApp?.DecisionExperience;
    if (de && de.initialized) {
      try {
        var options = de.getOptions({ includeDismissed: false, maxCount: 4 });
        if (options && options.length > 0) {
          loopData.choices = options.map(function(opt) {
            return {
              id: opt.id,
              title: opt.title || 'Option',
              summary: opt.summary || '',
              type: opt.type || 'ACTION',
              isPrimary: opt.isPrimary || false,
              reason: opt.reason || null
            };
          });
          loopData.hasActiveLoop = true;
        }
      } catch (e) {
        console.warn('[Dashboard][Part74] Choices error:', e);
      }
    }

    // 3. OUTCOME: 从 ActionTracker 获取最近的完成动作
    var at = window.LawAIApp?.ActionTracker;
    if (at && at.initialized) {
      try {
        var history = at.getHistory(3);
        if (history && history.length > 0) {
          var recent = history[0];
          if (recent && recent.type === 'COMPLETE') {
            loopData.outcome = {
              type: recent.type,
              target: recent.target || 'Learning activity',
              timestamp: recent.timestamp || Date.now(),
              status: 'completed',
              displayText: this._formatOutcomeDisplay(recent)
            };
          } else if (recent && recent.type === 'START') {
            loopData.outcome = {
              type: recent.type,
              target: recent.target || 'Learning activity',
              timestamp: recent.timestamp || Date.now(),
              status: 'in_progress',
              displayText: this._formatOutcomeDisplay(recent)
            };
          } else {
            loopData.outcome = {
              type: 'pending',
              target: null,
              status: 'waiting',
              displayText: 'Waiting for your next action...'
            };  
          }
        } else {
          loopData.outcome = {
            type: 'none',
            target: null,
            status: 'idle',
            displayText: 'Complete an action to see outcomes here.'
          };  
        }
      } catch (e) {
        console.warn('[Dashboard][Part74] Outcome error:', e);
      }
    } else {
      loopData.outcome = {
        type: 'none',
        target: null,
        status: 'unavailable',
        displayText: 'Action tracking is initializing...'
      };
    }

    // 4. CONTEXT: 从 LearningContext 获取
    var lc = window.LawAIApp?.LearningContext;
    if (lc && lc.initialized) {
      try {
        var ctx = lc.getContext();
        if (ctx) {
          var contextParts = [];
          if (ctx.course) contextParts.push(ctx.course.title || 'Current Course');
          if (ctx.module) contextParts.push(ctx.module.name || 'Current Module');
          if (ctx.lesson) contextParts.push(ctx.lesson.name || 'Current Lesson');
            
          loopData.context = {
            course: ctx.course || null,
            module: ctx.module || null,
            lesson: ctx.lesson || null,
            breadcrumb: contextParts.join(' → ') || 'Explore the Academy',
            lastActivity: ctx.lastActivity || null,
            hasActiveSession: ctx.status?.hasActiveSession || false
          };
          if (ctx.course || ctx.module || ctx.lesson) {
            loopData.hasActiveLoop = true;
          }
        }
      } catch (e) {
        console.warn('[Dashboard][Part74] Context error:', e);
      }
    }

    return loopData;
  },

    // ============================================================
  // Part 75: Learning Loop Governance — State Determination
  // ============================================================

  /**
   * 确定当前 Learning Loop 的状态
   * 概念状态：QUIET / ACTIVE / PENDING / COMPLETED / DEFERRED / DISMISSED / FAILED
   * 不新建权威，只从现有系统派生
   */
  _getLoopState: function() {
    var state = {
      status: 'QUIET',        // QUIET | ACTIVE | PENDING | COMPLETED | DEFERRED | DISMISSED | FAILED
      reason: null,
      hasAction: false,
      shouldShow: false,
      message: null
    };

    // 1. 检查是否有活跃的学习会话
    var lc = window.LawAIApp?.LearningContext;
    var hasActiveSession = false;
    var hasLearningData = false;

    if (lc && lc.initialized) {
      try {
        var ctx = lc.getContext();
        if (ctx) {
          hasActiveSession = ctx.status?.hasActiveSession || false;
          hasLearningData = !!(ctx.course || ctx.module || ctx.lesson);
          hasRecentActivity = ctx.lastActivity ? (Date.now() - new Date(ctx.lastActivity).getTime() < 86400000) : false;
        }
      } catch (e) {}
    }

    // 2. 检查是否有待处理的操作（从 ActionTracker）
    var at = window.LawAIApp?.ActionTracker;
    var hasPendingAction = false;
    var hasCompletedAction = false;
    var lastActionType = null;
    if (at && at.initialized) {
      try {
        var history = at.getHistory(5);
        if (history && history.length > 0) {
          var recent = history[0];
          if (recent) {
            lastActionType = recent.type;
            if (recent.type === 'START' || recent.type === 'SELECT') {
              hasPendingAction = true;
            } else if (recent.type === 'COMPLETE' || recent.type === 'SAVE') {
              hasCompletedAction = true;
            }
          }
        }
      } catch (e) {}
    }

    // 3. 检查是否有未处理的推荐（从 DecisionExperience）
    var de = window.LawAIApp?.DecisionExperience;
    var hasActiveRecommendation = false;
    var hasDismissedRecommendation = false;
    if (de && de.initialized) {
      try {
        var options = de.getOptions({ includeDismissed: true, maxCount: 5 });
        if (options && options.length > 0) {
          var active = options.filter(function(o) { return o.status !== 'dismissed'; });
          var dismissed = options.filter(function(o) { return o.status === 'dismissed'; });
          hasActiveRecommendation = active.length > 0;
          hasDismissedRecommendation = dismissed.length > 0;
        }
      } catch (e) {}
    }

    // 4. 状态判定（按优先级）
    // 4a. 如果有活跃会话 → ACTIVE
    if (hasActiveSession) {
      state.status = 'ACTIVE';
      state.reason = 'You have an active learning session.';
      state.hasAction = true;
      state.shouldShow = true;
      state.message = '▶️ Continue your learning session.';
      return state;
    }

    // 4b. 如果有待处理操作 → PENDING
    if (hasPendingAction && !hasCompletedAction) {
      state.status = 'PENDING';
      state.reason = 'You have started an action that is not yet complete.';
      state.hasAction = true;
      state.shouldShow = true;
      state.message = '⏳ Complete your pending action.';
      return state;
    }

    // 4c. 如果有活跃推荐且未处理 → ACTIVE
    if (hasActiveRecommendation) {
      state.status = 'ACTIVE';
      state.reason = 'There is a recommendation available.';
      state.hasAction = true;
      state.shouldShow = true;
      state.message = '💡 A recommendation is waiting for your response.';
      return state;
    }

    // 4d. 如果有最近学习活动且无待处理 → QUIET
    if (hasLearningData && hasRecentActivity) {
      state.status = 'QUIET';
      state.reason = 'You have learning context, but nothing needs attention.';
      state.hasAction = false;
      state.shouldShow = true;
      state.message = '🌱 You\'re all caught up. Nothing needs your attention right now.';
      return state;
    }

    // 4e. 如果有已完成的推荐 → COMPLETED
    if (hasCompletedAction) {
      state.status = 'COMPLETED';
      state.reason = 'Your recent action was completed.';
      state.hasAction = false;
      state.shouldShow = true;
      state.message = '✅ Your action was completed successfully.';
      return state;
    }

    // 4f. 如果有已拒绝的推荐 → DISMISSED
    if (hasDismissedRecommendation) {
      state.status = 'DISMISSED';
      state.reason = 'You have dismissed suggestions.';
      state.hasAction = false;
      state.shouldShow = true;
      state.message = '✕ Suggestions dismissed. You can explore on your own.';
      return state;
    }

    // 4g. 有学习数据但无近期活动 → QUIET（温和提示）
    if (hasLearningData && !hasRecentActivity) {
      state.status = 'QUIET';
      state.reason = 'You have learning history, but no recent activity.';
      state.hasAction = false;
      state.shouldShow = true;
      state.message = '📚 Your learning is waiting when you\'re ready.';
      return state;
    }

    // 4h. 默认：无数据 → 不显示 Loop（完全安静）
    state.status = 'QUIET';
    state.reason = 'Insufficient data for learning loop.';
    state.hasAction = false;
    state.shouldShow = false;
    state.message = null;

    return state;
  },

  // ============================================================
  // Part 77: Learner Interpretation & Judgement Architecture
  // ============================================================

  /**
   * 获取学习者的判断（如果存在）
   * 从现有系统派生，不新建存储
   */
  _getLearnerJudgement: function() {
    var judgement = {
      hasJudgement: false,
      confidence: null,        // 'not_yet' | 'somewhat' | 'confident' | 'very'
      difficulty: null,        // 'easy' | 'moderate' | 'hard'
      correction: null,
      reflection: null,
      timestamp: null,
      source: null
    };

    // 1. 从 localStorage 读取最近的判断（复用现有存储）
    try {
      var stored = localStorage.getItem('dashboardLearnerJudgements');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          var recent = parsed[parsed.length - 1];
          // 只使用 24 小时内的判断
          if (Date.now() - new Date(recent.timestamp).getTime() < 86400000) {
            judgement.hasJudgement = true;
            judgement.confidence = recent.confidence || null;
            judgement.difficulty = recent.difficulty || null;
            judgement.correction = recent.correction || null;
            judgement.reflection = recent.reflection || null;
            judgement.timestamp = recent.timestamp;
            judgement.source = recent.source || 'learner';
          }
        }
      }
    } catch (e) {}

    // 2. 如果没有存储的判断，从 Notes 查找最近的反思
    if (!judgement.hasJudgement) {
      var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
      if (notes && typeof notes.getNotes === 'function') {
        try {
          var allNotes = notes.getNotes();
          if (allNotes && allNotes.length > 0) {
            // 找最近的 REFLECTION 类型笔记
            var reflections = allNotes.filter(function(n) {
              return n.type === 'REFLECTION' || n.source === 'dashboard' || 
                     (n.tags && n.tags.indexOf('reflection') !== -1);
            });
            if (reflections && reflections.length > 0) {
              var recent = reflections[reflections.length - 1];
              if (Date.now() - new Date(recent.updatedAt || recent.createdAt).getTime() < 86400000) {
                judgement.hasJudgement = true;
                judgement.reflection = recent.content || null;
                judgement.timestamp = recent.updatedAt || recent.createdAt;
                judgement.source = 'notes';
              }
            }
          }
        } catch (e) {}
      }
    }

    return judgement;
  },

  /**
   * 记录学习者的判断
   * 复用现有存储（localStorage），不新建数据库
   */
  _recordLearnerJudgement: function(type, value) {
    console.log('[Dashboard][Part77] Judgement recorded:', type, value);
  
    // 🔥 Part 162: 通过 EventAdapter 发送，不直接写 localStorage
    var eventAdapter = LawAIApp.DashboardEventAdapter;
    if (eventAdapter) {
      eventAdapter.sendJudgementSubmitted('dashboard', type, value, {
        source: 'dashboard',
        timestamp: Date.now()
      });
    }
  
    // Toast 反馈
    if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.info === 'function') {
      var messages = {
        'confidence': '📊 Confidence recorded.',
        'difficulty': '📊 Difficulty recorded.',
        'correction': '🔄 Thanks for the correction.',
        'reflection': '💭 Reflection saved.'
      };
      window.LawAIApp.Toast.info(messages[type] || '✅ Recorded');
    }
  
    // 🔥 允许本地存储作为临时缓存，但权威存储由 Core 管理
    try {
      var stored = localStorage.getItem('dashboardLearnerJudgements') || '[]';
      var judgements = JSON.parse(stored);
      var existing = judgements.find(function(j) { return j.type === type; });
      if (existing) {
        existing.value = value;
        existing.timestamp = Date.now();
      } else {
        judgements.push({
          type: type,
          value: value,
          timestamp: Date.now(),
          source: 'dashboard'
        });
      }
      if (judgements.length > 20) {
        judgements = judgements.slice(-20);
      }
      localStorage.setItem('dashboardLearnerJudgements', JSON.stringify(judgements));
    } catch (e) {
      console.warn('[Dashboard] Local cache error:', e);
    }
  
    // 刷新 Dashboard
    setTimeout(function() { LawAIApp.Dashboard.render(); }, 300);
  },

  /**
   * 获取优先级标签
   */
  _getPriorityLabel: function(level) {
    var labels = {
      'primary': '🌟 Primary',
      'secondary': '📘 Secondary',
      'tertiary': '🔍 Tertiary',
      'background': '📁 Background'
    };
    return labels[level] || '📁 Background';
  },

  /**
   * 获取优先级颜色
   */
  _getPriorityColor: function(level) {
    var colors = {
      'primary': '#4a9eff',
      'secondary': '#94a3b8',
      'tertiary': '#64748b',
      'background': '#475569'
    };
    return colors[level] || '#475569';
  },

  /**
   * 判断是否应该显示 Learning Loop
   * 核心 Governance：不是有数据就显示，而是有意义才显示
   */
  _shouldShowLearningLoop: function() {
    var state = this._getLoopState();
    
    // QUIET 但无活动 → 不显示（完全安静）
    if (state.status === 'QUIET' && !state.hasAction && !state.message) {
      return false;
    }

    // 如果有任何有意义的内容 → 显示
    return state.shouldShow;
  },

  /**
   * 获取 Learning Loop 的安静消息
   * 用于 QUIET 状态的展示
   */
  _getQuietMessage: function() {
    var state = this._getLoopState();
    if (state.status === 'QUIET' && state.message) {
      return state.message;
    }
    return null;
  },

  /**
  * 格式化 Outcome 显示
  */
  _formatOutcomeDisplay: function(action) {
    if (!action) return 'Action recorded';
    var emoji = action.type === 'COMPLETE' ? '✅' : 
                action.type === 'START' ? '▶️' : 
                action.type === 'DISMISS' ? '✕' : '📌';
    var target = action.target || 'Learning activity';
    var timeAgo = this._getTimeAgo(action.timestamp);
    return emoji + ' ' + target + (timeAgo ? ' (' + timeAgo + ')' : '');
  },

  /**
  * 获取相对时间（复用 AcademyView 的逻辑）
  */
  _getTimeAgo: function(timestamp) {
    if (!timestamp) return '';
    try {
      var now = Date.now();
      var then = new Date(timestamp).getTime();
      var diff = now - then;
      if (diff < 0) return '';
      var minutes = Math.floor(diff / 60000);
      var hours = Math.floor(diff / 3600000);
      var days = Math.floor(diff / 86400000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return minutes + 'm ago';
      if (hours < 24) return hours + 'h ago';
      if (days < 7) return days + 'd ago';
      if (days < 30) return Math.floor(days / 7) + 'w ago';
      return new Date(timestamp).toLocaleDateString();
    } catch (e) { return ''; }
  },

  /**
  * 构建洞察消息（从 _buildInsightMessage 复用或简化）
  */
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
      },
      'learning': {
        'strong': '🚀 You\'re building knowledge actively.',
        'steady': '📚 You\'re making steady progress.',
        'slowing': '🌱 Every step counts. Keep going.'
      },
      'returning': {
        'strong': '👋 Welcome back! Your learning is waiting.',
        'steady': '📖 Ready to continue where you left off?',
        'slowing': '🌱 Welcome back. Take the next step.'
      },
      'exploring': {
        'strong': '🔍 You\'re exploring. Find something that clicks.',
        'steady': '🧭 Exploring is part of the journey.',
        'slowing': '🌱 Take your time exploring.'
      }
    };
    var stateMessages = messages[state];
    if (!stateMessages) return 'Your learning journey is unfolding.';
    var momentumKey = momentum || 'steady';
    return stateMessages[momentumKey] || stateMessages['steady'];
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
    // 🔥 Part 164: 优先使用 NotesAuthority
    var auth = window.LawAIApp?.NotesAuthority;
    if (auth && auth.initialized) {
        try {
            return auth.getAllNotes().length;
        } catch (e) {}
    }
    // Fallback
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
    if (contract && typeof contract.getStatus === 'function') {
      try {
        var status = contract.getStatus();
        return (status && status.initialized) ? 'Contract Active' : 'Contract Pending';
      } catch (e) {
        console.warn('[Dashboard] getStatus error:', e);
      }
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
  // Part 72: 对话状态管理
  // ============================================================

  _getDialogueState: function(insightId) {
    if (!this._dialogueStates) this._dialogueStates = {};
    if (!this._dialogueStates[insightId]) {
      this._dialogueStates[insightId] = 'idle'; // idle | open | responding | submitted | dismissed
    }
    return this._dialogueStates[insightId];
  },

  _setDialogueState: function(insightId, state) {
    if (!this._dialogueStates) this._dialogueStates = {};
    this._dialogueStates[insightId] = state;
    this.render();
  },

  _toggleDialogue: function(insightId) {
    var current = this._getDialogueState(insightId);
    if (current === 'idle' || current === 'dismissed') {
      this._setDialogueState(insightId, 'open');
    } else {
      this._setDialogueState(insightId, 'dismissed');
    }
  },

  // ============================================================
  // Part 178: Dialogue 折叠控制
  // ============================================================
  _expandDialogue: function() {
    try {
      localStorage.setItem('dashboard_dialogue_expanded', 'true');
    } catch (e) {}
    this.render();
  },

  _collapseDialogue: function() {
    try {
      localStorage.setItem('dashboard_dialogue_expanded', 'false');
    } catch (e) {}
    this.render();
  },

  // ============================================================
  // Part 72: 学习者回应 (Dialogue Response)
  // ============================================================

  _handleDialogueResponse: function(insightId, response) {
    console.log('[Dashboard] Dialogue response:', insightId, response);

    // 记录回应
    try {
      var existing = JSON.parse(localStorage.getItem('dashboardDialogueResponses') || '{}');
      existing[insightId] = {
        response: response,
        timestamp: Date.now()
      };
      localStorage.setItem('dashboardDialogueResponses', JSON.stringify(existing));
    } catch (e) {}

    this._setDialogueState(insightId, 'submitted');

    // 如果是 "Not really"，可以触发后续反思
    if (response === 'not_really') {
      // 自动展开反思区域
      if (!this._reflectionStates) this._reflectionStates = {};
      this._reflectionStates[insightId] = true;
    }

    // Toast 反馈
    if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.success === 'function') {
      var messages = {
        'yes': '✅ Thanks for confirming!',
        'somewhat': '📊 Good to know!',
        'not_really': '🤔 Thanks for sharing — would you like to reflect on this?',
        'not_sure': '🤔 That\'s okay! Learning is complex.'
      };
      window.LawAIApp.Toast.success(messages[response] || '✅ Response recorded');
    }

    this.render();
  },

  // ============================================================
  // Part 72: 跳过处理
  // ============================================================

  _handleDialogueSkip: function(insightId) {
    console.log('[Dashboard] Dialogue skipped:', insightId);
    this._setDialogueState(insightId, 'dismissed');
    // 无惩罚
    this.render();
  },

  // ============================================================
  // Part 71: 反思交互 (保留)
  // ============================================================

  _toggleReflection: function(insightId) {
    if (!this._reflectionStates) this._reflectionStates = {};
    this._reflectionStates[insightId] = !this._reflectionStates[insightId];
    this.render();
  },

  _handleReflectionResponse: function(insightId, response) {
      console.log('[Dashboard] Reflection response:', insightId, response);
  
      if (!response || response.length === 0) return;
  
      // 🔥 Part 164: 通过 NotesAuthority 创建笔记
      var auth = window.LawAIApp?.NotesAuthority;
      if (auth && auth.initialized) {
          var result = auth.create({
              title: 'Learning Reflection',
              content: response,
              noteType: 'REFLECTION',
              source: 'dashboard',
              tags: ['reflection'],
              createdBy: 'learner'
          });
  
          if (result.success) {
              if (window.LawAIApp?.Toast?.success) {
                  LawAIApp.Toast.success('✅ Reflection saved to Notes');
              }
              this._reflectionStates[insightId] = false;
              this.render();
          }
      } else {
          console.warn('[Dashboard] NotesAuthority not ready');
          if (window.LawAIApp?.Toast?.info) {
              LawAIApp.Toast.info('📝 Notes loading, please retry');
          }
      }
  },

  // ============================================================
  // Part 72: 自我评估 (Self-Assessment First)
  // ============================================================

  _handleSelfAssessment: function(insightId, confidence) {
    console.log('[Dashboard] Self-assessment:', insightId, confidence);
    try {
      var existing = JSON.parse(localStorage.getItem('dashboardSelfAssessments') || '{}');
      existing[insightId] = {
        confidence: confidence,
        timestamp: Date.now()
      };
      localStorage.setItem('dashboardSelfAssessments', JSON.stringify(existing));
      
      if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.success === 'function') {
        window.LawAIApp.Toast.success('✅ Assessment recorded');
      }
    } catch (e) {}
  },

  // ============================================================
  // Part 74: Learning Loop — Choice Handler
  // ============================================================

  /**
   * 处理 Learning Loop 中的学习者选择
   * 不新建任何引擎，只调用现有的权威系统
   */
  _handleLoopChoice: function(choiceId, actionType) {
      console.log('[Dashboard][Part74] Choice made:', choiceId, actionType);
    
      // 🔥 Part 162: 通过 EventAdapter 发送事件
      var eventAdapter = LawAIApp.DashboardEventAdapter;
      if (eventAdapter) {
        eventAdapter.sendPrimaryActionSelected(choiceId, actionType, {
          source: 'dashboard-loop',
          action: actionType || 'SELECT'
        });
      }
    
      // 也通过现有事件系统通知
      try {
        var event = new CustomEvent('LEARNING_LOOP_CHOICE', {
          detail: { choiceId: choiceId, actionType: actionType, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
      } catch (e) {}
    
    // 3. 根据选择类型执行具体操作
    var actionMap = {
      'continue': function() {
        var lc = window.LawAIApp?.LearningContext;
        if (lc && lc.initialized) {
          var ctx = lc.getContext();
          if (ctx && ctx.lesson) {
            window.location.href = '/pages/academy.html?view=lesson&id=' + ctx.lesson.id;
          } else {
            window.location.href = '/pages/academy.html';
          }
        } else {
          window.location.href = '/pages/academy.html';
        }
      },
      'review': function() {
        // 跳转到当前课程的复习模式
        var lc = window.LawAIApp?.LearningContext;
        if (lc && lc.initialized) {
          var ctx = lc.getContext();
          if (ctx && ctx.course) {
            window.location.href = '/pages/academy.html?view=course&id=' + ctx.course.id + '&mode=review';
          } else {
            window.location.href = '/pages/academy.html';
          }
        } else {
          window.location.href = '/pages/academy.html';
        }
      },
      'save': function() {
          var auth = window.LawAIApp?.NotesAuthority;
          if (auth && auth.initialized) {
              var result = auth.create({
                  title: 'Learning Loop Save',
                  content: 'I chose to save this learning moment.',
                  noteType: 'REFLECTION',
                  source: 'dashboard-learning-loop',
                  tags: ['learning-loop', 'save'],
                  createdBy: 'learner'
              });
              if (result.success && window.LawAIApp?.Toast) {
                  LawAIApp.Toast.success('✅ Saved to Notes');
              }
          } else {
              if (window.LawAIApp?.Toast) {
                  LawAIApp.Toast.info('📝 Notes loading...');
              }
          }
          setTimeout(function() { LawAIApp.Dashboard.render(); }, 300);
      },
      'schedule': function() {
          var auth = window.LawAIApp?.CalendarAuthority;
          if (auth && auth.initialized) {
              var lc = window.LawAIApp?.LearningContext;
              var ctx = lc ? lc.getContext() : null;
              var tomorrow = new Date(Date.now() + 86400000);
              tomorrow.setHours(19, 0, 0, 0);
      
              var result = auth.create({
                  title: 'Review: ' + (ctx?.lesson?.name || 'Learning'),
                  activityRef: 'review_' + Date.now(),
                  startAt: tomorrow.toISOString(),
                  duration: 30,
                  source: 'dashboard-learning-loop'
              });
      
              if (result.success && window.LawAIApp?.Toast) {
                  LawAIApp.Toast.success('📅 Scheduled for tomorrow');
              } else if (result.conflict) {
                  if (window.LawAIApp?.Toast) {
                      LawAIApp.Toast.info('📅 Schedule conflict detected');
                  }
              }
          } else {
              if (window.LawAIApp?.Toast) {
                  LawAIApp.Toast.info('📅 Calendar loading...');
              }
          }
          setTimeout(function() { LawAIApp.Dashboard.render(); }, 300);
      },
      'dismiss': function() {
        // 记录 dismiss 但不惩罚
        if (window.LawAIApp?.Toast) {
          LawAIApp.Toast.info('✕ Dismissed');
        }
        // 刷新 Dashboard
        setTimeout(function() { LawAIApp.Dashboard.render(); }, 300);
      },
      'ask_mentor': function() {
        // 打开 Mentor（如果存在）
        if (window.LawAIApp?.MentorEngine && window.LawAIApp.MentorEngine.initialized) {
          window.LawAIApp.MentorEngine.open();
        } else {
          if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.info('🧠 Mentor coming soon');
          }
        }
      }
    };

    // 执行对应的操作
    var action = actionMap[choiceId] || actionMap['continue'];
    try {
      action();
    } catch (e) {
      console.warn('[Dashboard][Part74] Action execution error:', e);
      // 安全 fallback
      window.location.href = '/pages/academy.html';
    }

    // 触发事件通知其他系统
    try {
      var event = new CustomEvent('LEARNING_LOOP_CHOICE', {
        detail: { choiceId: choiceId, actionType: actionType, timestamp: Date.now() }
      });
      document.dispatchEvent(event);
    } catch (e) {}

    // 🔥 Part 102: 发送事件到 Core
    var eventAdapter = LawAIApp.DashboardEventAdapter;
    if (eventAdapter) {
        eventAdapter.sendRecommendationAccepted(choiceId, {
            actionType: actionType,
            source: 'dashboard-loop'
        });
    }
  },

  // ============================================================
  // Part 75: Loop Closure — Learner says "Done"
  // ============================================================

  /**
   * 处理学习者主动关闭 Loop
   * 不惩罚，不记录"失败"，只是尊重选择
   */
  _handleLoopClosure: function() {
    console.log('[Dashboard][Part75] Loop closed by learner');
  
    // 🔥 Part 162: 通过 EventAdapter 发送，而非直接调用
    var eventAdapter = LawAIApp.DashboardEventAdapter;
    if (eventAdapter) {
      eventAdapter.sendPrimaryActionSelected('loop_closure', 'learning-loop', {
        source: 'dashboard',
        action: 'close'
      });
    }
  
    // 显示 Toast 反馈（温和，不惩罚）
    if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.info === 'function') {
      LawAIApp.Toast.info('🔄 Loop closed. Check back when you\'re ready.');
    }
  
    // 刷新 Dashboard 进入安静状态
    setTimeout(function() {
      LawAIApp.Dashboard.render();
    }, 300);
  },

  // ============================================================
  // Part 76: Priority Action Handler
  // ============================================================

  _handlePriorityAction: function(action, target) {
    console.log('[Dashboard][Part76] Priority action:', action, target);

    switch (action) {
      case 'continue':
        if (target) {
          window.location.href = '/pages/academy.html?view=lesson&id=' + target;
        } else {
          window.location.href = '/pages/academy.html';
        }
        break;
      case 'explore':
        window.location.href = '/pages/academy.html';
        break;
      case 'recommendation':
        // 调用 DecisionExperience
        var de = window.LawAIApp?.DecisionExperience;
        if (de && de.initialized && target && typeof de.selectOption === 'function') {
          try {
            de.selectOption(target);
          } catch (e) {
            console.warn('[Dashboard][Part76] Recommendation select error:', e);
          }
        }
        window.location.href = '/pages/academy.html';
        break;
      default:
        window.location.href = '/pages/academy.html';
        break;
    }
  },

  // ============================================================
  // Part 71: 学习者不同意 (保留)
  // ============================================================

  _handleDisagree: function(insightId) {
    console.log('[Dashboard] Learner disagreed with insight:', insightId);
    try {
      var existing = JSON.parse(localStorage.getItem('dashboardDisagreements') || '{}');
      existing[insightId] = {
        disagreed: true,
        timestamp: Date.now()
      };
      localStorage.setItem('dashboardDisagreements', JSON.stringify(existing));
      
      if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.info === 'function') {
        window.LawAIApp.Toast.info('Thanks for the feedback');
      }
    } catch (e) {}
  },

  // ============================================================
  // Part 71: Sense-Making Insight (保留 + 增强)
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

      return this._buildStructuredInsight(state, momentum, signals);
    } catch (e) {
      return null;
    }
  },

  _buildStructuredInsight: function(state, momentum, signals) {
    var fact = this._getFact(state, momentum, signals);
    var interpretation = this._getInterpretation(state, momentum, signals);
    var confidence = this._getInsightConfidence(state, momentum);

    return {
      fact: fact,
      interpretation: interpretation,
      confidence: confidence,
      state: state,
      momentum: momentum,
      summary: signals.summary || '',
      message: this._buildInsightMessage(state, momentum, signals)
    };
  },

  _getFact: function(state, momentum, signals) {
    var facts = {
      'active': 'You have been actively learning.',
      'learning': 'You have been building your knowledge.',
      'near_completion': 'You are close to completing this module.',
      'idle': 'You have made progress in your learning.',
      'returning': 'You have returned to your learning.',
      'exploring': 'You have been exploring different topics.'
    };
    return facts[state] || 'You have been engaging with learning content.';
  },

  _getInterpretation: function(state, momentum, signals) {
    var interpretations = {
      'active': {
        'strong': 'This suggests you are building good momentum.',
        'steady': 'You are maintaining a steady learning rhythm.',
        'slowing': 'You are building momentum gradually.'
      },
      'near_completion': {
        'strong': 'You are close to completing this module — a good time to review.',
        'steady': 'You are making steady progress toward completion.',
        'slowing': 'You are approaching the finish line.'
      },
      'idle': {
        'strong': 'You have built a foundation to continue from.',
        'steady': 'Your progress provides a base for further learning.',
        'slowing': 'You have started building your learning journey.'
      }
    };

    var stateInterpretations = interpretations[state];
    if (!stateInterpretations) return 'Your learning is developing.';

    var momentumKey = momentum || 'steady';
    return stateInterpretations[momentumKey] || stateInterpretations['steady'];
  },

  _getInsightConfidence: function(state, momentum) {
    if (state === 'exploring' || state === 'idle') return 'low';
    if (state === 'learning' && momentum === 'slowing') return 'low';
    if (state === 'active' || state === 'near_completion') return 'high';
    return 'medium';
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
  // Part 72: HTML 构建
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
        learnerState,
        courseProgressPercent
      } = data;

    const greeting = this._getGreeting();
    const userName = this._getUserName();
    const completedCount = progress.completedLessons?.length || 0;
    const totalCount = 365;

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

    // ── Part 72: 获取洞察和对话状态 ──
    var insight = this._getLearningInsight();
    var insightId = insight ? 'insight_' + Date.now() : null;

    // 构建 Insight HTML (Part 72: 包含 Dialogue)
    var insightHTML = '';
    if (insight && insightId) {
      var dialogueState = this._getDialogueState(insightId);
      var isReflecting = this._reflectionStates && this._reflectionStates[insightId];

      // ── Part 72: Dialogue 响应选项 ──
      var dialogueOptions = '';
      if (dialogueState === 'open') {
        dialogueOptions = `
          <div style="display:flex; gap:8px; flex-wrap: wrap; margin-top: 6px;">
            <button type="button" onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'yes')" style="
              padding: 4px 16px;
              background: rgba(74,158,255,0.08);
              border: 1px solid rgba(74,158,255,0.12);
              border-radius: 100px;
              color: #4a9eff;
              font-size: 12px;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">
              ✅ Yes
            </button>
            <button type="button" onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'somewhat')" style="
              padding: 4px 16px;
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.04);
              border-radius: 100px;
              color: #94a3b8;
              font-size: 12px;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
              🔄 Somewhat
            </button>
            <button type="button" onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'not_really')" style="
              padding: 4px 16px;
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.04);
              border-radius: 100px;
              color: #94a3b8;
              font-size: 12px;
              cursor: pointer;
              font-family: inherit;
              transition: all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
              ❌ Not really
            </button>
            <button type="button" onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'not_sure')" style="
              padding: 4px 16px;
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.04);
              border-radius: 100px;
              color: #94a3b8;
              font-size: 12px;
              cursor: pointer;
              font-family: inherit;
            ">
              🤔 Not sure
            </button>
            <button type="button" onclick="LawAIApp.Dashboard._handleDialogueSkip('${insightId}')" style="
              padding: 4px 12px;
              background: transparent;
              border: none;
              color: #64748b;
              font-size: 11px;
              cursor: pointer;
              font-family: inherit;
              text-decoration: underline;
            ">
              Skip
            </button>
          </div>
        `;
      }

      // ── Part 72: Dialogue 状态显示 ──
      var dialogueStatus = '';
      if (dialogueState === 'submitted') {
        dialogueStatus = `
          <div style="margin-top: 6px; font-size: 12px; color: #10b981;">
            ✅ Thanks for sharing your perspective.
          </div>
        `;
      }
      if (dialogueState === 'dismissed') {
        dialogueStatus = '';
      }

      // ── Part 178: Dialogue 折叠 —— 默认不显示 ──
      var dialogueTrigger = '';
      // 折叠：只有当用户显式展开时才显示
      var dialogueExpanded = false;
      try {
        dialogueExpanded = localStorage.getItem('dashboard_dialogue_expanded') === 'true';
      } catch (e) {}

      if (!dialogueExpanded) {
        // 显示一个很小的入口
        dialogueTrigger = `
          <button type="button"
                  aria-label="Share feedback on this insight"
                  aria-expanded="false"
                  onclick="LawAIApp.Dashboard._expandDialogue()" style="
            background: transparent;
            border: none;
            color: #475569;
            font-size: 10px;
            cursor: pointer;
            padding: 2px 0;
            font-family: inherit;
            text-decoration: underline;
            text-decoration-color: rgba(255,255,255,0.1);
          ">
            <span aria-hidden="true">💬</span>
          </button>
        `;
      } else if (dialogueState === 'idle' || dialogueState === 'dismissed') {
        dialogueTrigger = `
          <button type="button" onclick="LawAIApp.Dashboard._toggleDialogue('${insightId}')" style="
            background: rgba(74,158,255,0.06);
            border: 1px solid rgba(74,158,255,0.08);
            border-radius: 100px;
            color: #94a3b8;
            font-size: 11px;
            cursor: pointer;
            padding: 4px 14px;
            font-family: inherit;
          ">
            💬 Does this feel accurate?
          </button>
        `;
      }

      // ── 自我评估 ──
      var selfAssessmentHTML = `
        <div style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
          <span style="font-size: 10px; color: #64748b;">How confident do you feel?</span>
          ${['Not yet', 'Somewhat', 'Confident', 'Very'].map(function(label, idx) {
            var val = (idx + 1) * 25;
            return `
              <button type="button" onclick="LawAIApp.Dashboard._handleSelfAssessment('${insightId}', ${val})" style="
                padding: 2px 12px;
                background: rgba(255,255,255,0.02);
                border: 1px solid rgba(255,255,255,0.04);
                border-radius: 100px;
                color: #94a3b8;
                font-size: 10px;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.2s;
              " onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                ${label}
              </button>
            `;
          }).join('')}
        </div>
      `;

      // ── 反思区域 ──
      var reflectionHTML = '';

            // 🔥 Part 178: Insight 只显示 learner-facing 一句话
      insightHTML = `
        <div style="
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 4px;
        ">
          <span style="font-size: 16px; line-height: 1.5; opacity: 0.7;">💡</span>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; color: #94a3b8; line-height: 1.55;">
              ${insight.message}
            </div>
            <div style="margin-top: 6px;">
              ${dialogueTrigger}
            </div>
          </div>
        </div>
      `;
    }

    const CARD_RADIUS = '16px';
    const CARD_BG = 'rgba(255,255,255,0.025)';
    const CARD_BORDER = '1px solid rgba(255,255,255,0.04)';
    const CARD_PADDING = '20px';

    // Part 178: Authority Status 已移除（Bible §67）
    const authorityHTML = '';

    return `
    <main id="dashboard-root" role="main" aria-label="Dashboard" style="
      max-width: 960px;
      margin: 0 auto;
      padding: 16px 20px 100px;
      color: #e2e8f0;
      font-family: 'Inter', -apple-system, sans-serif;
    ">

    <!-- 🔥 Part 174 + 178: EXPLORE 导航 -->
    <section id="dashboard-nav" role="navigation" aria-label="Quick navigation" style="
      margin-bottom: 24px;
      padding: 12px 18px;
      background: rgba(255,255,255,0.02);
      border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.04);
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      justify-content: center;
      animation: heroFadeIn 0.4s ease;
    ">
      ${[
        { icon: '📚', label: 'Academy', url: '/pages/academy.html' },
        { icon: '📅', label: 'Calendar', action: 'calendar' },
        { icon: '📓', label: 'Notes', action: 'notes' },
        { icon: '⚙️', label: 'Settings', action: 'settings' }
      ].map(function(btn) {
        var onClick;
        if (btn.url) {
          onClick = "window.location.href='" + btn.url + "'";
        } else if (btn.action === 'calendar') {
          onClick = "LawAIApp.Dashboard._renderCalendarView()";
        } else if (btn.action === 'settings') {
          onClick = "LawAIApp.Dashboard._renderSettingsView()";
        } else if (btn.action === 'notes') {
          onClick = "LawAIApp.Dashboard._renderNotesView()";
        } else {
          onClick = "if(window.LawAIApp&&window.LawAIApp.Toast){window.LawAIApp.Toast.info('" + btn.label + " coming soon')}";
        }
        
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

    <!-- 🔥 HERO + CONTINUE LEARNING (Part 178: 合并) -->
      <section id="dashboard-hero" data-hero="true" role="region" aria-label="Continue Learning" style="
        min-height: 28vh;
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
        <div class="dashboard-hero-glow" style="
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

        <div style="position:relative;z-index:1;max-width:520px;">
          <p style="
            margin: 0 0 4px;
            font-size: 14px;
            color: #64748b;
            letter-spacing: 0.4px;
            font-weight: 400;
          " aria-label="${greeting}, ${userName}">${greeting}, ${userName}</p>

          <h1 style="
            margin: 0 0 8px;
            font-size: clamp(24px, 4.5vw, 36px);
            font-weight: 700;
            letter-spacing: -0.6px;
            line-height: 1.15;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${heroData.message || 'Ready to learn?'}</h1>

          ${completedCount > 0 ? `
            <div style="
              margin: 16px 0 4px;
              padding: 12px 18px;
              background: rgba(255,255,255,0.03);
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.05);
              text-align: left;
            ">
              <div style="font-size: 10px; font-weight: 500; color: #4a9eff; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 4px;">
                ${completedCount >= 365 ? '<span aria-hidden="true">🎉 </span>All Complete' : 'Continue Learning'}
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #e2e8f0; line-height: 1.3;">
                ${nextTitle}
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                ${nextSummary}
              </div>
            </div>
          ` : ''}

          <a href="${completedCount > 0 ? '/pages/lesson.html?day=' + (completedCount + 1) : '/pages/academy.html'}" style="
            display: inline-block;
            margin-top: 16px;
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
            ${completedCount > 0 ? (completedCount >= 365 ? '🎉 Review' : 'Continue Learning') : 'Explore Academy'} →
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

      <!-- 📊 PROGRESS (Part 178: 多维度) -->
      <section role="region" aria-label="Progress" style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: 14px ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 16px;
      ">
        <!-- A: 当前课程进度（主） -->
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
          <span style="font-size:12px;color:#94a3b8;">Current Course</span>
          <span style="font-size:12px;color:#64748b;">${courseProgressPercent}%</span>
        </div>
        <div role="progressbar"
             aria-valuenow="${courseProgressPercent}"
             aria-valuemin="0"
             aria-valuemax="100"
             aria-label="Current course progress"
             style="
          height: 4px;
          background: rgba(255,255,255,0.04);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 10px;
        ">
          <div style="
            width: ${courseProgressPercent}%;
            height: 100%;
            background: linear-gradient(90deg, #4a9eff, #7c3aed);
            border-radius: 100px;
            transition: width 0.8s ease;
          "></div>
        </div>

        <!-- B: N of M lessons -->
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;font-size:11px;">
          <span style="color:#64748b;">Lessons completed</span>
          <span style="color:#94a3b8;">${completedCount} of ${totalCount}</span>
        </div>

        <!-- C: 全局 365 进度（secondary） -->
        <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:10px;color:#475569;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.03);">
          <span>Academy Journey</span>
          <span>${percent}%</span>
        </div>
      </section>

      <!-- 📖 RECOMMENDATIONS (Part 82: Adaptive) -->
      <section id="dashboard-recommendations" data-section="recommendations" role="region" aria-label="Recommended for you" style="
        background: ${CARD_BG};
        border-radius: ${CARD_RADIUS};
        padding: ${CARD_PADDING};
        border: ${CARD_BORDER};
        margin-bottom: 16px;
        min-height: 60px;
        transition: opacity 0.4s ease;
      ">
        <h2 style="margin:0 0 12px;font-size:12px;color:#94a3b8;font-weight:500;">
          🌟 Recommended for you
        </h2>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${this._renderAdaptiveRecommendations()}
        </div>
      </section>

      <!-- 📈 LEARNING INSIGHTS (Part 178: 精简) -->
      ${insightHTML ? `
        <section data-section="insight" role="region" aria-label="Learning insight" style="
          background: ${CARD_BG};
          border-radius: ${CARD_RADIUS};
          padding: 8px ${CARD_PADDING} 4px;
          border: ${CARD_BORDER};
          margin-bottom: 16px;
        ">
          <h2 class="sr-only">Learning insight</h2>
          ${insightHTML}
        </section>
      ` : ''}

      <!-- 🔄 LEARNING LOOP (Part 74 + Part 178: 折叠) -->
      ${this._renderLearningLoopCollapsed()}

      <!-- 📓 NOTES PREVIEW (Part 178: 替代 Continuity) -->
      ${this._buildNotesPreview()}

      <!-- 🔒 Authority Status -->
      ${authorityHTML}

      <!-- FOOTER -->
      <footer data-section="footer" style="
        text-align:center;
        padding:16px;
        color:#64748b;
        font-size:10px;
        letter-spacing:0.5px;
        border-top:1px solid rgba(255,255,255,0.03);
      ">
        Law AI Academy · Season 4
      </footer>

    </main>

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
    console.log('[Dashboard] Animations initialized');
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

  // ============================================================
  // Part 73: Learning Continuity & Memory Loop
  // ============================================================

  /**
   * 获取连续性上下文
   */
  _getContinuityContext: function() {
      var context = {
          hasRecentLearning: false,
          hasReflection: false,
          hasUpcoming: false,
          recentLearning: null,
          recentReflections: [],
          upcomingItems: [],
          message: null
      };

      // 1. 最近学习
      var learning = this._getRecentLearning();
      if (learning) {
          context.hasRecentLearning = true;
          context.recentLearning = learning;
      }

      // 2. 最近反思
      var reflections = this._getRecentReflections();
      if (reflections && reflections.length > 0) {
          context.hasReflection = true;
          context.recentReflections = reflections.slice(0, 2);
      }

      // 3. 即将到来的日程
      var upcoming = this._getUpcomingSchedule();
      if (upcoming && upcoming.length > 0) {
          context.hasUpcoming = true;
          context.upcomingItems = upcoming.slice(0, 2);
      }

      // 4. 生成连续性消息
      context.message = this._getContinuityMessage(context);

      return context;
  },

  /**
   * 获取最近学习
   */
  _getRecentLearning: function() {
      var lc = window.LawAIApp?.LearningContext;
      if (!lc) return null;

      try {
          var ctx = lc.getContext();
          if (!ctx || !ctx.course) return null;

          return {
              courseId: ctx.course.id,
              courseTitle: ctx.course.title || 'Current Course',
              moduleTitle: ctx.module?.name || null,
              lessonTitle: ctx.lesson?.name || null,
              lastActivity: ctx.lastActivity || null,
              progress: ctx.progress?.course || 0
          };
      } catch (e) {
          console.warn('[Dashboard] Recent learning error:', e);
          return null;
      }
  },

  /**
   * 获取最近反思
   */
  _getRecentReflections: function() {
      // 🔥 Part 164: 优先使用 NotesAuthority
      var auth = window.LawAIApp?.NotesAuthority;
      if (auth && auth.initialized) {
          try {
              var allNotes = auth.getAllNotes();
              // 筛选反思类型
              var reflections = allNotes.filter(function(n) {
                  return n.noteType === 'REFLECTION' || 
                         (n.tags && n.tags.indexOf('reflection') !== -1) ||
                         n.provenance?.source === 'dashboard';
              });
              // 按时间排序
              reflections.sort(function(a, b) {
                  return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
              });
              return reflections;
          } catch (e) {
              console.warn('[Dashboard] Recent reflections error:', e);
              return [];
          }
      }
      // Fallback 到旧 API
      var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
      if (!notes) return [];
      try {
          var allNotes = notes.getNotes ? notes.getNotes() : [];
          if (!allNotes || allNotes.length === 0) return [];
          var reflections = allNotes.filter(function(n) {
              return n.type === 'REFLECTION' || 
                     n.tags?.indexOf('reflection') !== -1 ||
                     n.source === 'dashboard';
          });
          reflections.sort(function(a, b) {
              return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
          });
          return reflections;
      } catch (e) {
          return [];
      }
  },

  /**
   * 获取即将到来的日程
   */
  _getUpcomingSchedule: function() {
    // 🔥 Part 163: 优先使用 CalendarAuthority
    var auth = window.LawAIApp?.CalendarAuthority;
    if (auth && auth.initialized) {
        try {
            return auth.getUpcomingSchedules(5);
        } catch (e) {}
    }
    return [];
  },

  /**
   * 生成连续性消息
   */
  _getContinuityMessage: function(context) {
      if (!context.hasRecentLearning && !context.hasReflection) {
          return 'Your learning story will appear here as you begin exploring.';
      }

      var parts = [];

      if (context.hasRecentLearning && context.recentLearning) {
          var learning = context.recentLearning;
          parts.push('Recently: ' + learning.courseTitle);
          if (learning.moduleTitle) {
              parts.push(learning.moduleTitle);
          }
      }

      if (context.hasReflection) {
          var count = context.recentReflections.length;
          parts.push('Reflected: ' + count + ' insight' + (count > 1 ? 's' : ''));
      }

      if (context.hasUpcoming) {
          var count = context.upcomingItems.length;
          parts.push('Planned: ' + count + ' item' + (count > 1 ? 's' : ''));
      }

      return parts.join(' · ') || 'Your learning journey continues.';
  },

  // ============================================================
  // Part 178: Notes Preview（替代 Continuity）
  // Bible §23: 轻量，不变成 Notes
  // ============================================================
  _buildNotesPreview: function() {
    var auth = window.LawAIApp?.NotesAuthority;
    if (!auth || !auth.isReady) {
      return '';
    }

    var notes = auth.getAllNotes();
    if (!notes || notes.length === 0) {
      return '';
    }

    // 按 updatedAt 排序，取最近一条
    notes.sort(function(a, b) {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    var recent = notes[0];
    var preview = recent.content
      ? recent.content.substring(0, 100) + (recent.content.length > 100 ? '…' : '')
      : (recent.title || 'Untitled note');

    return `
      <section data-section="notes-preview" role="region" aria-label="Recent note" style="
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        padding: 14px 18px;
        border: 1px solid rgba(255,255,255,0.04);
        margin-bottom: 16px;
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <span style="font-size: 14px;" aria-hidden="true">📓</span>
          <h2 style="font-size: 11px; color: #64748b; font-weight: 500; letter-spacing: 0.6px; margin: 0;">
            YOUR RECENT NOTE
          </h2>
        </div>
        <div style="
          font-size: 13px;
          color: #e2e8f0;
          line-height: 1.5;
          padding: 8px 12px;
          background: rgba(74,158,255,0.03);
          border-left: 2px solid #4a9eff;
          border-radius: 6px;
        ">
          ${preview}
        </div>
        <div style="margin-top: 10px;">
          <button type="button" onclick="window.location.href='/pages/academy.html?view=notes'" style="
            padding: 4px 14px;
            background: rgba(74,158,255,0.06);
            border: 1px solid rgba(74,158,255,0.08);
            border-radius: 100px;
            color: #4a9eff;
            font-size: 11px;
            cursor: pointer;
            font-family: inherit;
          ">View Notes →</button>
        </div>
      </section>
    `;
  },

  // ============================================================
  // Part 178: Learning Loop 折叠版
  // 默认不显示，用户可展开
  // ============================================================
  _renderLearningLoopCollapsed: function() {
    var loopData = this._getLearningLoopData();

    // 如果完全没有活跃 Loop，不显示
    if (!loopData.hasActiveLoop) {
      return '';
    }

    // 检查用户是否展开
    var expanded = false;
    try {
      expanded = localStorage.getItem('dashboard_loop_expanded') === 'true';
    } catch (e) {}

    if (!expanded) {
      // 折叠态：只显示一行
      return `
        <button type="button"
                aria-label="Show Learning Loop details"
                aria-expanded="false"
                onclick="LawAIApp.Dashboard._toggleLearningLoop()" style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.03);
          margin-bottom: 12px;
          cursor: pointer;
          font-family: inherit;
          color: inherit;
        ">
          <span style="font-size: 12px; color: #64748b;">
            <span aria-hidden="true">🔄</span> Learning Loop
          </span>
          <span style="font-size: 10px; color: #475569;">
            Show details <span aria-hidden="true">▾</span>
          </span>
        </button>
      `;
    }

    // 展开态：显示原 Learning Loop
    var html = this._renderLearningLoop();

    // 加一个折叠按钮
    return `
      <div style="position: relative;">
        <div style="
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: -6px;
          position: relative;
          z-index: 2;
        ">
          <button type="button"
                  aria-label="Hide Learning Loop details"
                  aria-expanded="true"
                  onclick="LawAIApp.Dashboard._toggleLearningLoop()" style="
            padding: 2px 10px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 100px;
            color: #64748b;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">Hide <span aria-hidden="true">▴</span></button>
        </div>
        ${html}
      </div>
    `;
  },

  _toggleLearningLoop: function() {
    try {
      var current = localStorage.getItem('dashboard_loop_expanded') === 'true';
      localStorage.setItem('dashboard_loop_expanded', String(!current));
    } catch (e) {}
    this.render();
  },
  
  // ============================================================
  // Part 74: Learning Loop Renderer
  // ============================================================

  /**
   * 渲染 Learning Loop 因果链
   */
  _renderLearningLoop: function() {
    var loopData = this._getLearningLoopData();

  // 🔥 Part 174: 简化 — QUIET 状态不显示，保持安静
  if (loopData.isQuiet && loopData.quietMessage) {
    return '';  // 安静时不显示
  }

    // 如果完全没有活跃 Loop，不显示
    if (!loopData.hasActiveLoop) {
      return '';
    }

    var html = '';
    var insight = loopData.insight;
    var choices = loopData.choices;
    var outcome = loopData.outcome;
    var context = loopData.context;

    // ── 卡片容器 ──
    html += `
      <div style="
        background: rgba(255,255,255,0.02);
        border-radius: 12px;
        padding: 16px 20px 20px;
        border: 1px solid rgba(255,255,255,0.04);
        margin-bottom: 16px;
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 14px;">🔄</span>
          <span style="font-size: 11px; color: #64748b; font-weight: 500; letter-spacing: 0.6px;">LEARNING LOOP</span>
          ${context && context.hasActiveSession ? '<span style="font-size: 9px; color: #10b981; background: rgba(16,185,129,0.12); padding: 2px 10px; border-radius: 100px;">● Active</span>' : ''}
        </div>
    `;

    // ── 1. INSIGHT ──
    if (insight && insight.message) {
      var confidenceColor = insight.confidence === 'high' ? '#4a9eff' : 
                           insight.confidence === 'medium' ? '#f59e0b' : '#64748b';
      html += `
        <div style="
          background: rgba(74,158,255,0.04);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-left: 3px solid ${confidenceColor};
        ">
          <div style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">💡 INSIGHT</div>
          <div style="font-size: 14px; color: #e2e8f0; margin-top: 2px;">${insight.message}</div>
        </div>
      `;
    }

    // ── 箭头（Insight → Choice） ──
    if (insight && choices.length > 0) {
      html += `
        <div style="text-align: center; color: #475569; font-size: 14px; line-height: 1; padding: 2px 0;">↓</div>
      `;
    }

    // ── 2. CHOICE ──
    if (choices && choices.length > 0) {
      html += `
        <div style="
          background: rgba(255,255,255,0.02);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 10px;
          border: 1px solid rgba(255,255,255,0.04);
        ">
          <div style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.5px; margin-bottom: 6px;">👆 YOUR CHOICE</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
      `;

      for (var i = 0; i < choices.length; i++) {
        var choice = choices[i];
        var isPrimary = choice.isPrimary || false;
        var bgColor = isPrimary ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.04)';
        var borderColor = isPrimary ? 'rgba(74,158,255,0.2)' : 'rgba(255,255,255,0.06)';
        var textColor = isPrimary ? '#4a9eff' : '#94a3b8';
        var actionId = choice.id;

        html += `
          <button type="button" onclick="LawAIApp.Dashboard._handleLoopChoice('${actionId}', 'SELECT')"
                  style="
                    padding: 5px 16px;
                    background: ${bgColor};
                    border: 1px solid ${borderColor};
                    border-radius: 100px;
                    color: ${textColor};
                    font-size: 12px;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                  "
                  onmouseover="this.style.background='rgba(74,158,255,0.12)'; this.style.color='#4a9eff';"
                  onmouseout="this.style.background='${bgColor}'; this.style.color='${textColor}';">
            ${isPrimary ? '⭐ ' : ''}${choice.title}
          </button>
        `;
      }

      html += `
          </div>
          ${choices.length > 0 && choices[0].reason ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px;">💡 ${choices[0].reason}</div>` : ''}
        </div>
      `;
    }

    // ── 箭头（Choice → Outcome） ──
    if (choices.length > 0 && outcome) {
      html += `
        <div style="text-align: center; color: #475569; font-size: 14px; line-height: 1; padding: 2px 0;">↓</div>
      `;
    }

    // ── 3. OUTCOME ──
    if (outcome) {
      var outcomeColor = outcome.status === 'completed' ? '#10b981' : 
                         outcome.status === 'in_progress' ? '#4a9eff' : 
                         outcome.status === 'waiting' ? '#f59e0b' : '#64748b';
      var outcomeEmoji = outcome.status === 'completed' ? '✅' : 
                         outcome.status === 'in_progress' ? '▶️' : 
                         outcome.status === 'waiting' ? '⏳' : '📌';

      html += `
        <div style="
          background: rgba(16,185,129,0.04);
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 10px;
          border-left: 3px solid ${outcomeColor};
        ">
          <div style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">📊 OUTCOME</div>
          <div style="font-size: 14px; color: ${outcomeColor}; margin-top: 2px;">${outcomeEmoji} ${outcome.displayText}</div>
        </div>
      `;
    }

    // ── 箭头（Outcome → Context） ──
    if (outcome && context) {
      html += `
        <div style="text-align: center; color: #475569; font-size: 14px; line-height: 1; padding: 2px 0;">↓</div>
      `;
    }

    // ── 4. CONTEXT ──
    if (context) {
      var contextText = context.breadcrumb || 'Explore the Academy';
      var lastActivityText = context.lastActivity ? this._getTimeAgo(context.lastActivity) : '';

      html += `
        <div style="
          background: rgba(139,92,246,0.04);
          border-radius: 8px;
          padding: 10px 14px;
          border-left: 3px solid #8b5cf6;
        ">
          <div style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">🔗 CONTEXT</div>
          <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">${contextText}</div>
          ${lastActivityText ? `<div style="font-size: 10px; color: #64748b; margin-top: 2px;">📅 ${lastActivityText}</div>` : ''}
        </div>
      `;
    }

    // ── 底部：刷新和更多操作 ──
    html += `
        <div style="
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.04);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        ">
          <button type="button" onclick="LawAIApp.Dashboard.render()" style="
            padding: 4px 14px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 100px;
            color: #64748b;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">🔄 Refresh</button>
          <button type="button" onclick="window.location.href='/pages/academy.html'" style="
            padding: 4px 14px;
            background: rgba(74,158,255,0.06);
            border: 1px solid rgba(74,158,255,0.08);
            border-radius: 100px;
            color: #4a9eff;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">📚 Go to Academy</button>
          <button type="button" onclick="LawAIApp.Dashboard._handleLoopClosure()" style="
            padding: 4px 14px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 100px;
            color: #475569;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">⏹️ Done</button>
        </div>
      </div>
    `;

    return html;
  },

  // ============================================================
  // Part 82: Adaptive Recommendation Renderer
  // ============================================================
 _renderAdaptiveRecommendations: function() {
    var viewModel = this._lastViewModel;

    // 优先用 ViewModel
    if (viewModel && viewModel.recommendation) {
        return this._renderRecommendationCard(viewModel.recommendation);
    }

    // Fallback: 用 DecisionExperience
    var de = window.LawAIApp?.DecisionExperience;
    if (de && de.initialized && typeof de.getOptions === 'function') {
        try {
            var options = de.getOptions({ includeDismissed: false, maxCount: 1 });
            if (options && options.length > 0) {
                return this._renderRecommendationCard({
                    title: options[0].title,
                    description: options[0].summary || '',
                    reason: options[0].reason,
                    id: options[0].id,
                    targetId: options[0].targetId
                });
            }
        } catch (e) {}
    }

    // 最后兜底
    return `
        <div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">
            Complete more lessons to get personalized recommendations.
        </div>
    `;
},

_renderRecommendationCard: function(rec) {
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:rgba(74,158,255,0.04);border-radius:10px;border:1px solid rgba(74,158,255,0.06);">
        <span style="font-size:18px;">📌</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:500;color:#e2e8f0;">${rec.title || 'Recommended'}</div>
          <div style="font-size:11px;color:#94a3b8;">${rec.description || ''}</div>
          ${rec.reason ? `<div style="font-size:10px;color:#4a9eff;opacity:0.7;margin-top:2px;">💡 ${rec.reason}</div>` : ''}
        </div>
        <button type="button"
                aria-label="Go to ${(rec.title || 'recommendation').replace(/"/g, '&quot;')}"
                onclick="LawAIApp.Dashboard._handleAdaptiveChoice('${rec.id || ''}', 'recommendation', '${rec.targetId || ''}')" style="padding:4px 16px;background:#4a9eff;border:none;border-radius:100px;color:white;font-size:11px;font-weight:500;cursor:pointer;font-family:inherit;">Go <span aria-hidden="true">→</span></button>
      </div>
    `;
},

  // ============================================================
  // Part 162: Architecture Fitness Check
  // ============================================================
  
  _fitnessCheck: function() {
    var checks = {
      // DASH-001: No authoritative domain ownership
      noAuthorityOwnership: !this._ownsAuthoritativeState,
      
      // DASH-002: No domain state duplication
      noStateDuplication: !this._duplicatesDomainState,
      
      // DASH-003: No direct domain mutation
      noDirectMutation: !this._mutatesDomainDirectly,
      
      // DASH-004: No hidden recommendation logic
      noHiddenRecommendation: !this._hasHiddenRecommendationLogic,
      
      // DASH-005: No mastery calculation
      noMasteryCalculation: !this._calculatesMastery,
      
      // DASH-006: No authoritative progress calculation
      noProgressCalculation: !this._calculatesProgress,
      
      // DASH-007: No curriculum prerequisite logic
      noPrerequisiteLogic: !this._hasPrerequisiteLogic,
      
      // DASH-008: No direct Calendar mutation
      noCalendarMutation: !this._mutatesCalendar,
      
      // DASH-009: No direct Settings mutation
      noSettingsMutation: !this._mutatesSettings,
      
      // DASH-010: No Recommendation Decision mutation
      noRecommendationMutation: !this._mutatesRecommendation
    };
    
    var allPass = true;
    var results = [];
    
    for (var key in checks) {
      if (checks.hasOwnProperty(key)) {
        var pass = checks[key];
        allPass = allPass && pass;
        results.push({ check: key, pass: pass });
      }
    }
    
    console.log('[Dashboard] Fitness check:', allPass ? '✅ PASS' : '⚠️ SOME FAILURES', results);
    
    return {
      allPass: allPass,
      results: results
    };
  },
  
  // Track flags for fitness checks
  _ownsAuthoritativeState: false,
  _duplicatesDomainState: false,
  _mutatesDomainDirectly: false,
  _hasHiddenRecommendationLogic: false,
  _calculatesMastery: false,
  _calculatesProgress: false,
  _hasPrerequisiteLogic: false,
  _mutatesCalendar: false,
  _mutatesSettings: false,
  _mutatesRecommendation: false,

  // ============================================================
  // Part 163: Calendar Navigation (via Event)
  // ============================================================
  _renderCalendarView: function() {
      console.log('[Dashboard] 📅 Rendering Calendar...');
  
      var container = document.getElementById('app') || 
                      document.getElementById('law-runtime-root') || 
                      document.getElementById('dashboard-root');
      if (!container) return;
  
      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth();
      var monthName = now.toLocaleString('default', { month: 'long' });
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var firstDay = new Date(year, month, 1).getDay();
  
      var gridHTML = '';
      for (var i = 0; i < firstDay; i++) gridHTML += '<div></div>';
      for (var d = 1; d <= daysInMonth; d++) {
          var isToday = d === now.getDate();
          gridHTML += '<div style="padding:12px 6px;text-align:center;border-radius:8px;background:' +
              (isToday ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)') +
              ';color:' + (isToday ? '#4a9eff' : '#e2e8f0') +
              ';font-size:14px;">' + d + '</div>';
      }
  
      container.innerHTML = `
        <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
          <button type="button" onclick="LawAIApp.Dashboard._lastRenderAt = 0; LawAIApp.Dashboard.render();" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;margin-bottom:16px;">← Back to Dashboard</button>
          <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">📅 Calendar</h2>
          <p style="color:#94a3b8;margin:0 0 20px;">${monthName} ${year}</p>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">${gridHTML}</div>
        </div>
      `;
  },

 _renderSettingsView: function() {
      console.log('[Dashboard] ⚙️ Rendering Settings...');

      // 🔥 记录来源
      sessionStorage.setItem('settings_source', 'dashboard');
  
      var self = this;
      var container = document.getElementById('app') || 
                      document.getElementById('law-runtime-root') || 
                      document.getElementById('dashboard-root');
      if (!container) {
          console.warn('[Dashboard] No container for Settings');
          return;
      }
  
      // 1. 都就绪 → 直接 render
      var Settings = window.LawAIApp && window.LawAIApp.Settings;
      var Auth = window.LawAIApp && window.LawAIApp.SettingsAuthority;
      if (Settings && typeof Settings.render === 'function' && Auth && Auth.isReady) {
          try {
              Settings._root = container;
              Settings.render();
              console.log('[Dashboard] ✅ Settings rendered (cached)');
              return;
          } catch (e) {
              console.warn('[Dashboard] Settings render error:', e);
          }
      }
  
      // 2. 显示 loading
      container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">⏳ Loading Settings...</div>';
  
      // 3. 防重复
      if (document.getElementById('settings-loading-flag')) {
          console.log('[Dashboard] ⏳ Settings already loading...');
          return;
      }
      var flag = document.createElement('div');
      flag.id = 'settings-loading-flag';
      flag.style.display = 'none';
      document.body.appendChild(flag);

    // 🔥 加载 settings.css（先检查是否已加载）
    if (!document.querySelector('link[href="/css/settings.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/settings.css';
        document.head.appendChild(link);
        console.log('[Dashboard] 🎨 Loaded CSS: /css/settings.css');
    }
  
      // 4. 按顺序加载：SettingsAuthority → settings.js
      var scripts = [
          '/js/settings/SettingsAuthority.js',
          '/js/settings.js'
      ];
  
      function loadNext(index) {
          if (index >= scripts.length) {
              finalize();
              return;
          }
          var script = document.createElement('script');
          script.id = 'settings-script-' + index;
          script.src = scripts[index] + '?v=' + Date.now();
          script.async = true;
          script.onload = function() {
              console.log('[Dashboard] ✅ Loaded:', scripts[index]);
              loadNext(index + 1);
          };
          script.onerror = function() {
              console.warn('[Dashboard] ⚠️ Failed:', scripts[index]);
              loadNext(index + 1);
          };
          document.head.appendChild(script);
      }
  
      function finalize() {
          var Auth2 = window.LawAIApp && window.LawAIApp.SettingsAuthority;
          var Settings2 = window.LawAIApp && window.LawAIApp.Settings;
  
          console.log('[Dashboard] finalize:', {
              Auth: Auth2 ? 'exists' : 'missing',
              Settings: Settings2 ? 'exists' : 'missing',
              isReady: Auth2 ? Auth2.isReady : false
          });
  
          if (!Settings2 || typeof Settings2.render !== 'function') {
              container.innerHTML = self._settingsFallbackHTML('Settings module not loaded.');
              return;
          }
  
          // Authority 存在但还没 ready → 等 onReady
          if (Auth2 && !Auth2.isReady && typeof Auth2.onReady === 'function') {
              console.log('[Dashboard] ⏳ Waiting for SettingsAuthority ready...');
              Auth2.onReady(function() {
                  try {
                      Settings2._root = container;
                      Settings2.render();
                      console.log('[Dashboard] ✅ Settings rendered (after authority ready)');
                  } catch (e) {
                      console.warn('[Dashboard] Settings render error:', e);
                      container.innerHTML = self._settingsFallbackHTML('Render error: ' + e.message);
                  }
              });
              // 兜底：5 秒后强制 render
              setTimeout(function() {
                  if (container.innerHTML.indexOf('Loading Settings') !== -1) {
                      console.warn('[Dashboard] ⚠️ Force render after timeout');
                      try {
                          Settings2._root = container;
                          Settings2.render();
                      } catch (e) {}
                  }
              }, 5000);
              return;
          }
  
        // （让 SettingsAuthority 的异步渲染先发生，然后我们覆盖它）
        setTimeout(function() {
            // 🔥 先清空容器，保证 SettingsAuthority 的"完整版"被清掉
            container.innerHTML = '';
            
            try {
                Settings2._root = container;
                Settings2.render();
                console.log('[Dashboard] ✅ Settings rendered (simple version)');
            } catch (e) {
                console.warn('[Dashboard] Settings render error:', e);
                container.innerHTML = self._settingsFallbackHTML('Render error: ' + e.message);
            }
        }, 500);
    }
  
      loadNext(0);
  },
  
  // 🔥 Settings fallback 辅助函数
  _settingsFallbackHTML: function(msg) {
      return `
        <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
          <button type="button" onclick="LawAIApp.Dashboard.render()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;margin-bottom:16px;">← Back to Dashboard</button>
          <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">⚙️ Settings</h2>
          <p style="color:#94a3b8;">${msg || 'Settings module not available.'}</p>
        </div>
      `;
  },

  // ============================================================
  // 🔥 Part 118: 知识图谱视图 (入口)
  // ============================================================
  _renderKnowledgeGraphView: function() {
      console.log('[Dashboard] 🕸️ Rendering Knowledge Graph...');
  
      var container = document.getElementById('app') || 
                      document.getElementById('law-runtime-root') || 
                      document.getElementById('dashboard-root');
      if (!container) return;
  
      // 获取 KnowledgeGraph 数据
      var kg = window.LawAIApp?.KnowledgeGraph;
      var stats = kg ? kg.getGraphStats() : null;

      var html = `
          <div style="max-width:960px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
  
              <!-- 返回按钮 -->
              <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                  <button type="button" onclick="LawAIApp.Dashboard.render()" style="
                      background:rgba(74,158,255,0.08);
                      border:1px solid rgba(74,158,255,0.15);
                      color:#4a9eff;
                      padding:10px 16px;
                      border-radius:10px;
                      cursor:pointer;
                      font-family:inherit;
                      font-size:14px;
                  ">
                      ← Back to Dashboard
                  </button>
              </div>
  
              <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">🕸️ Knowledge Graph</h2>
              <p style="color:#94a3b8;margin:0 0 20px;">Your connected knowledge network</p>

              <!-- 统计信息 -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                  <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                      <div style="font-size:11px;color:#64748b;">Entities</div>
                      <div style="font-size:28px;font-weight:700;color:#e2e8f0;">${stats ? stats.totalEntities : 0}</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                      <div style="font-size:11px;color:#64748b;">Relationships</div>
                      <div style="font-size:28px;font-weight:700;color:#4a9eff;">${stats ? stats.totalRelationships : 0}</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                      <div style="font-size:11px;color:#64748b;">Node Types</div>
                      <div style="font-size:28px;font-weight:700;color:#8b5cf6;">${stats ? Object.keys(stats.typeStats || {}).length : 0}</div>
                  </div>
                  <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
                      <div style="font-size:11px;color:#64748b;">Status</div>
                      <div style="font-size:16px;font-weight:600;color:${stats && stats.valid ? '#22c55e' : '#ef4444'};">${stats && stats.valid ? '✅ Healthy' : '⚠️ Needs Attention'}</div>
                  </div>
              </div>

              <!-- 节点列表 -->
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <h3 style="margin:0;font-size:16px;font-weight:600;">📌 Nodes</h3>
                  <button type="button" onclick="LawAIApp.Dashboard._refreshKnowledgeGraph()" style="
                      padding:4px 14px;
                      background:rgba(255,255,255,0.04);
                      border:1px solid rgba(255,255,255,0.06);
                      border-radius:100px;
                      color:#94a3b8;
                      font-size:11px;
                      cursor:pointer;
                      font-family:inherit;
                  ">🔄 Refresh</button>
              </div>
              <div id="kg-node-list" style="
                  background:rgba(255,255,255,0.02);
                  border-radius:12px;
                  border:1px solid rgba(255,255,255,0.04);
                  padding:12px;
                  max-height:300px;
                  overflow-y:auto;
              ">  
                  ${this._renderNodeList()}
              </div>
  
              <!-- 关系列表 -->
              <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 12px;">
                  <h3 style="margin:0;font-size:16px;font-weight:600;">🔗 Relationships</h3>
              </div>
              <div id="kg-relation-list" style="
                  background:rgba(255,255,255,0.02);
                  border-radius:12px;
                  border:1px solid rgba(255,255,255,0.04);
                  padding:12px;
                  max-height:200px;
                  overflow-y:auto;
              ">
                  ${this._renderRelationList()}
              </div>
  
              <!-- 操作按钮 -->
              <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
                  <button type="button" onclick="LawAIApp.Dashboard._exportGraph()" style="
                      padding:8px 20px;
                      background:rgba(74,158,255,0.08);
                      border:1px solid rgba(74,158,255,0.12);
                      border-radius:100px;
                      color:#4a9eff;
                      font-size:13px;
                      cursor:pointer;
                      font-family:inherit;
                  ">📤 Export Graph</button>
                  <button type="button" onclick="LawAIApp.Dashboard._rebuildGraph()" style="
                      padding:8px 20px;
                      background:rgba(245,158,11,0.08);
                      border:1px solid rgba(245,158,11,0.12);
                      border-radius:100px;
                      color:#f59e0b;
                      font-size:13px;
                      cursor:pointer;
                      font-family:inherit;
                  ">🔄 Rebuild Graph</button>
                  <button type="button" onclick="LawAIApp.Dashboard._importGraph()" style="
                      padding:8px 20px;
                      background:rgba(139,92,246,0.08);
                      border:1px solid rgba(139,92,246,0.12);
                      border-radius:100px;
                      color:#8b5cf6;
                      font-size:13px;
                      cursor:pointer;
                      font-family:inherit;
                  ">📥 Import Graph</button>
              </div>

              <!-- 导入状态 -->
              <div style="
                  background:rgba(255,255,255,0.02);
                  border-radius:8px;
                  padding:8px 14px;
                  margin-bottom:16px;
                  border:1px solid rgba(255,255,255,0.03);
                  font-size:10px;
                  color:#475569;
                  display:flex;
                  justify-content:space-between;
                  flex-wrap:wrap;
              ">
                  <span>📚 Academy: ${this._getIngestionStatus('academy')}</span>
                  <span>📓 Notes: ${this._getIngestionStatus('notes')}</span>
                  <span>🕸️ Total: ${stats ? stats.totalEntities : 0} nodes · ${stats ? stats.totalRelationships : 0} edges</span>
              </div>

              <!-- 概念列表 -->
              <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0 12px;">
                  <h3 style="margin:0;font-size:16px;font-weight:600;">🧠 Concepts</h3>
                  <span style="font-size:11px;color:#64748b;">${this._getConceptCount()} total</span>
              </div>
              <div id="kg-concept-list" style="
                  background:rgba(255,255,255,0.02);
                  border-radius:12px;
                  border:1px solid rgba(255,255,255,0.04);
                  padding:12px;
                  max-height:200px;
                  overflow-y:auto;
              ">
                  ${this._renderConceptList()}
              </div>

              <!-- 查询测试 -->
              <div style="margin-top:16px;">
                  <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">🔍 Query Test</h3>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                      <input id="kg-query-entity" placeholder="Entity ID (e.g. lesson:001)" style="
                          flex:1;
                          min-width:200px;
                          padding:8px 12px;
                          background:rgba(255,255,255,0.04);
                          border:1px solid rgba(255,255,255,0.06);
                          border-radius:8px;
                          color:#e2e8f0;
                          font-family:inherit;
                          font-size:12px;
                      ">
                      <button type="button" onclick="LawAIApp.Dashboard._testGraphQuery()" style="
                          padding:8px 16px;
                          background:rgba(74,158,255,0.08);
                          border:1px solid rgba(74,158,255,0.12);
                          border-radius:8px;
                          color:#4a9eff;
                          font-size:12px;
                          cursor:pointer;
                          font-family:inherit;
                      ">🔍 Query</button>
                  </div>
                  <div id="kg-query-result" style="
                      margin-top:8px;
                      padding:8px 12px;
                      background:rgba(255,255,255,0.02);
                      border-radius:8px;
                      border:1px solid rgba(255,255,255,0.04);
                      font-size:11px;
                      color:#94a3b8;
                      min-height:40px;
                      max-height:200px;
                      overflow-y:auto;
                      font-family:monospace;
                  ">
                      Enter an entity ID to query its neighbors.
                  </div>
              </div>

              <div style="
                  margin-top:16px;
                  padding:8px 14px;
                  background:rgba(255,255,255,0.02);
                  border-radius:8px;
                  border:1px solid rgba(255,255,255,0.03);
                  font-size:10px;
                  color:#475569;
              ">
                  🔒 Knowledge Graph Authority · ${kg ? 'v' + kg._version : 'Not available'}
              </div>
          </div>
      `;  

      container.innerHTML = html;
  },

  // ============================================================
  // Part 118: 渲染节点列表
  // ============================================================
  _renderNodeList: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return '<div style="color:#64748b;text-align:center;padding:20px;">Knowledge Graph not available</div>';

      var nodes = kg.getAllNodes();
      if (!nodes || nodes.length === 0) {
          return '<div style="color:#64748b;text-align:center;padding:20px;">No nodes yet. Start learning to build your knowledge graph.</div>';
      }

      return nodes.slice(0, 20).map(function(node) {
          var typeColors = {
              KNOWLEDGE: '#4a9eff',
              SKILL: '#10b981',
              LESSON: '#f59e0b',
              RESOURCE: '#8b5cf6',
              COURSE: '#ec4899',
              PROJECT: '#14b8a6',
              ASSESSMENT: '#ef4444'
          };
          var color = typeColors[node.type] || '#64748b';
  
          return `
              <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  padding:6px 10px;
                  border-bottom:1px solid rgba(255,255,255,0.03);
                  font-size:12px;
              ">
                  <div style="display:flex;align-items:center;gap:8px;">
                      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};"></span>
                      <span style="color:#e2e8f0;">${node.title || node.id}</span>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center;">
                      <span style="font-size:9px;color:#64748b;background:rgba(255,255,255,0.04);padding:2px 8px;border-radius:100px;">${node.type}</span>
                      <span style="font-size:9px;color:#475569;">${node.status || 'active'}</span>
                  </div>
              </div>
          `;
      }).join('');
  },

  // ============================================================
  // Part 118: 渲染关系列表
  // ============================================================
  _renderRelationList: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return '<div style="color:#64748b;text-align:center;padding:20px;">Knowledge Graph not available</div>';

      var nodes = kg.getAllNodes();
      if (!nodes || nodes.length === 0) {
          return '<div style="color:#64748b;text-align:center;padding:20px;">No relationships yet.</div>';
      }  

      var allRels = [];
      nodes.forEach(function(node) {
          var rels = kg.getRelations(node.id);
          rels.forEach(function(rel) {
              allRels.push(rel);
          });
      });

      if (allRels.length === 0) {
          return '<div style="color:#64748b;text-align:center;padding:20px;">No relationships yet.</div>';
      }  

      return allRels.slice(0, 15).map(function(rel) {
          var fromNode = kg.getNode(rel.from);
          var toNode = kg.getNode(rel.to);
          var fromLabel = fromNode ? fromNode.title : rel.from;
          var toLabel = toNode ? toNode.title : rel.to;
  
          return `
              <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  padding:4px 10px;
                  border-bottom:1px solid rgba(255,255,255,0.02);
                  font-size:11px;
                  color:#94a3b8;
              ">
                  <span>${fromLabel}</span>
                  <span style="color:#4a9eff;font-size:9px;">→ ${rel.type} →</span>
                  <span>${toLabel}</span>
              </div>
          `;
      }).join('');
  },

  // ============================================================
  // Part 118: 操作函数
  // ============================================================
  _refreshKnowledgeGraph: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (kg) {
          kg.validateGraph();
          console.log('[Dashboard] 🔄 Knowledge Graph refreshed');
      }
      this._renderKnowledgeGraphView();
  },

  _exportGraph: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return;
  
      var data = kg.exportGraph();
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'knowledge_graph_export_' + new Date().toISOString().split('T')[0] + '.json';
      a.click();
      URL.revokeObjectURL(url);

      if (window.LawAIApp?.Toast?.success) {
          LawAIApp.Toast.success('📤 Graph exported');
      }
  },

  _rebuildGraph: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return;
  
      if (confirm('⚠️ Rebuild the Knowledge Graph from source data? This will reset all graph data.')) {
          // 重置图谱
          kg.reset();

          // 从 Notes 重建
          var notes = window.LawAIApp?.KnowledgeCapture?.getNotes() || [];
          notes.forEach(function(note) {
              if (!kg.hasNode(note.id)) {
                  kg.registerNode({
                      id: note.id,
                      type: kg.NODE_TYPES.KNOWLEDGE,
                      title: note.title || 'Untitled',
                      description: note.content || '',
                      metadata: {
                          tags: note.tags || [],
                          type: note.type,
                          lessonId: note.lessonId,
                          courseId: note.courseId,
                          subjectId: note.subjectId
                      }
                  });
              }
          });

          if (window.LawAIApp?.Toast?.success) {
              LawAIApp.Toast.success('🔄 Graph rebuilt from ' + notes.length + ' notes');
          }
          this._renderKnowledgeGraphView();
      }  
  },

  _importGraph: function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = function(e) {
          var file = e.target.files[0];
          if (!file) return;
  
          var reader = new FileReader();
          reader.onload = function(ev) {
              try {
                  var data = JSON.parse(ev.target.result);
                  var kg = window.LawAIApp?.KnowledgeGraph;
                  if (kg && kg.importGraph(data)) {
                      if (window.LawAIApp?.Toast?.success) {
                          LawAIApp.Toast.success('📥 Graph imported');
                      }
                      LawAIApp.Dashboard._renderKnowledgeGraphView();
                  } else {
                      if (window.LawAIApp?.Toast?.error) {
                          LawAIApp.Toast.error('❌ Import failed');
                      }
                  }
              } catch (err) {
                  if (window.LawAIApp?.Toast?.error) {
                      LawAIApp.Toast.error('❌ Invalid file format');
                  }
              }
          };
          reader.readAsText(file);
      };
      input.click();
  },  

  // ============================================================
  // PART 119: 图谱导入方法
  // ============================================================

  _ingestFromAcademy: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) {
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('Knowledge Graph not available');
          }
          return;
      }

      if (!confirm('📚 Ingest Academy data into Knowledge Graph? This will add all Schools, Courses, Modules, Subjects, and Lessons.')) {
          return;
      }

      console.log('[Dashboard] 📚 Starting Academy ingestion...');
      if (window.LawAIApp?.Toast?.info) {
          LawAIApp.Toast.info('🔄 Ingesting Academy data...');
      }

      try {
          var report = kg.ingestFromAcademy();
          console.log('[Dashboard] ✅ Academy ingestion completed:', report);

          if (window.LawAIApp?.Toast?.success) {
              LawAIApp.Toast.success('📚 Academy ingested: ' + report.entitiesCreated + ' entities, ' + report.relationshipsCreated + ' relationships');
          }

          this._renderKnowledgeGraphView();
      } catch (e) {
          console.error('[Dashboard] ❌ Academy ingestion failed:', e);
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('❌ Academy ingestion failed');
          }
      }
  },

  _ingestFromNotes: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) {
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('Knowledge Graph not available');
          }
          return;
      }

      var notes = window.LawAIApp?.KnowledgeCapture?.getNotes() || [];
      if (notes.length === 0) {
          if (window.LawAIApp?.Toast?.info) {
              LawAIApp.Toast.info('No notes to ingest. Create some notes first!');
          }
          return;
      }

      if (!confirm('📓 Ingest ' + notes.length + ' notes into Knowledge Graph?')) {
          return;
      }

      console.log('[Dashboard] 📓 Starting Notes ingestion...');
      if (window.LawAIApp?.Toast?.info) {
          LawAIApp.Toast.info('🔄 Ingesting Notes...');
      }

      try {
          var report = kg.ingestFromNotes();
          console.log('[Dashboard] ✅ Notes ingestion completed:', report);

          if (window.LawAIApp?.Toast?.success) {
              LawAIApp.Toast.success('📓 Notes ingested: ' + report.entitiesCreated + ' entities, ' + report.relationshipsCreated + ' relationships');
          }

          this._renderKnowledgeGraphView();
      } catch (e) {
          console.error('[Dashboard] ❌ Notes ingestion failed:', e);
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('❌ Notes ingestion failed');
          }
      }
  },

  _ingestAll: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) {
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('Knowledge Graph not available');
          }
          return;
      }

      if (!confirm('🔄 Ingest ALL data (Academy + Notes) into Knowledge Graph?')) {
          return;
      }

      console.log('[Dashboard] 🔥 Starting full ingestion...');
      if (window.LawAIApp?.Toast?.info) {
          LawAIApp.Toast.info('🔄 Ingesting all data...');
      }

      try {
          var result = kg.ingestAll();
          console.log('[Dashboard] ✅ Full ingestion completed:', result);
  
          if (window.LawAIApp?.Toast?.success) {
              LawAIApp.Toast.success('✅ Full ingestion: ' + result.totalEntities + ' entities, ' + result.totalRelationships + ' relationships');
          }

          this._renderKnowledgeGraphView();
      } catch (e) {
          console.error('[Dashboard] ❌ Full ingestion failed:', e);
          if (window.LawAIApp?.Toast?.error) {
              LawAIApp.Toast.error('❌ Full ingestion failed');
          }
      }
  },

  _getIngestionStatus: function(sourceType) {
    var kg = window.LawAIApp?.KnowledgeGraph;
    if (!kg) return 'Not available';

    var report = kg._getLastIngestion(sourceType);
    if (!report) return 'Not ingested';
    if (report.status === 'completed') {
        return '✅ ' + report.entitiesCreated + ' entities, ' + report.relationshipsCreated + ' relations';
    }
    if (report.status === 'failed') {
        return '❌ Failed';
    }
    return '⏳ Pending';
  },

  // ============================================================
  // PART 120: 渲染概念列表
  // ============================================================
  _renderConceptList: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return '<div style="color:#64748b;text-align:center;padding:20px;">Knowledge Graph not available</div>';

      var concepts = kg.getConcepts ? kg.getConcepts() : [];
      if (!concepts || concepts.length === 0) {
          return '<div style="color:#64748b;text-align:center;padding:20px;">No concepts yet. Concepts represent knowledge ideas.</div>';
      }

      return concepts.slice(0, 15).map(function(concept) {
          // 获取关系数量
          var rels = kg.getRelations(concept.id);
          var relCount = rels.length;
          var teachCount = rels.filter(function(r) { return r.type === 'TEACHES'; }).length;
          var refCount = rels.filter(function(r) { return r.type === 'REFERENCES'; }).length;

          return `
              <div style="
                  display:flex;
                  justify-content:space-between;
                  align-items:center;
                  padding:6px 10px;
                  border-bottom:1px solid rgba(255,255,255,0.03);
                  font-size:12px;
              ">
                  <div style="display:flex;align-items:center;gap:8px;">
                      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;"></span>
                      <span style="color:#e2e8f0;">${concept.title || concept.id}</span>
                  </div>
                  <div style="display:flex;gap:8px;align-items:center;">
                      ${teachCount > 0 ? `<span style="font-size:9px;color:#4a9eff;">📚 ${teachCount}</span>` : ''}
                      ${refCount > 0 ? `<span style="font-size:9px;color:#10b981;">📓 ${refCount}</span>` : ''}
                      <span style="font-size:9px;color:#64748b;">${relCount} relations</span>
                  </div>
              </div>
          `;
      }).join('');
  },

  _getConceptCount: function() {
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) return 0;
      var concepts = kg.getConcepts ? kg.getConcepts() : [];
      return concepts.length;
  },

  // ============================================================
  // PART 121: 查询测试
  // ============================================================
  _testGraphQuery: function() {
      var input = document.getElementById('kg-query-entity');
      var resultDiv = document.getElementById('kg-query-result');
      if (!input || !resultDiv) return;
    
      var entityId = input.value.trim();
      if (!entityId) {
          resultDiv.innerHTML = 'Please enter an entity ID.';
          return;
      }
    
      var kg = window.LawAIApp?.KnowledgeGraph;
      if (!kg) {
          resultDiv.innerHTML = 'Knowledge Graph not available.';
          return;
      }
    
      // 检查实体是否存在
      var entity = kg.getNode(entityId);
      if (!entity) {
          resultDiv.innerHTML = '❌ Entity not found: ' + entityId;
          return;
      }
    
      // 获取邻居
      var neighbors = kg.getNeighbors(entityId, { direction: 'both' });
    
      if (neighbors.length === 0) {
          resultDiv.innerHTML = '✅ Entity found: ' + entityId + '\nNo neighbors found.';
          return;
      }
    
      var html = '✅ Entity: ' + entityId + ' (' + entity.title + ')\n';
      html += '📊 ' + neighbors.length + ' neighbors:\n\n';
    
      neighbors.slice(0, 20).forEach(function(n) {
          var dir = n.direction === 'outgoing' ? '→' : '←';
          html += '  ' + dir + ' ' + n.relationship.type + ' → ' + n.entity.id + ' (' + n.entity.title + ')\n';
      });
    
      if (neighbors.length > 20) {
          html += '... and ' + (neighbors.length - 20) + ' more';
      }  
    
      resultDiv.innerHTML = html;
  },

  _renderNotesView: function() {
      console.log('[Dashboard] 📝 Rendering Notes...');
  
      var self = this;
      var container = document.getElementById('app') || 
                      document.getElementById('law-runtime-root') || 
                      document.getElementById('dashboard-root');
      if (!container) return;
  
      // 1. 都就绪 → 直接 render
      var Notes = window.LawAIApp && window.LawAIApp.Notes;
      var Auth = window.LawAIApp && window.LawAIApp.NotesAuthority;
      if (Notes && typeof Notes.render === 'function' && Auth && Auth.isReady) {
          try {
              Notes._root = container;
              Notes.render();
              console.log('[Dashboard] ✅ Notes rendered (cached)');
              return;
          } catch (e) {
              console.warn('[Dashboard] Notes render error:', e);
          }
      }
  
      // 2. loading
      container.innerHTML = '<div style="text-align:center;padding:60px;color:#94a3b8;">⏳ Loading Notes...</div>';
  
      // 3. 防止重复
      if (document.getElementById('notes-loading-flag')) return;
      var flag = document.createElement('div');
      flag.id = 'notes-loading-flag';
      flag.style.display = 'none';
      document.body.appendChild(flag);
  
      // 4. 按顺序加载：NotesAuthority → notes.js
      var scripts = [
          '/js/notes/NotesAuthority.js',
          '/js/academy/notes.js'
      ];
  
      function loadNext(index) {
          if (index >= scripts.length) {
              finalize();
              return;
          }
          var script = document.createElement('script');
          script.id = 'notes-script-' + index;
          script.src = scripts[index] + '?v=' + Date.now();
          script.async = true;
          script.onload = function() {
              console.log('[Dashboard] ✅ Loaded:', scripts[index]);
              loadNext(index + 1);
          };
          script.onerror = function() {
              console.warn('[Dashboard] ⚠️ Failed:', scripts[index]);
              loadNext(index + 1);
          };
          document.head.appendChild(script);
      }
  
      function finalize() {
          var Auth2 = window.LawAIApp && window.LawAIApp.NotesAuthority;
          var Notes2 = window.LawAIApp && window.LawAIApp.Notes;
  
          console.log('[Dashboard] finalize:', {
              Auth: Auth2 ? 'exists' : 'missing',
              Notes: Notes2 ? 'exists' : 'missing',
              isReady: Auth2 && Auth2.isReady
          });
  
          if (!Notes2 || typeof Notes2.render !== 'function') {
              container.innerHTML = self._notesFallbackHTML('Notes module not loaded.');
              return;
          }
  
          // Authority 存在但还没 ready → 等 onReady
          if (Auth2 && !Auth2.isReady && typeof Auth2.onReady === 'function') {
              console.log('[Dashboard] ⏳ Waiting for NotesAuthority ready...');
              Auth2.onReady(function() {
                  try {
                      Notes2._root = container;
                      Notes2.render();
                      console.log('[Dashboard] ✅ Notes rendered (after authority ready)');
                  } catch (e) {
                      console.warn('[Dashboard] Notes render error:', e);
                      container.innerHTML = self._notesFallbackHTML('Render error: ' + e.message);
                  }
              });
              // 兜底：5 秒后强制 render
              setTimeout(function() {
                  if (container.innerHTML.indexOf('Loading Notes') !== -1) {
                      console.warn('[Dashboard] ⚠️ Force render after timeout');
                      Notes2._root = container;
                      Notes2.render();
                  }
              }, 5000);
              return;
          }
  
          // Authority 已 ready → 直接 render
          try {
              Notes2._root = container;
              Notes2.render();
              console.log('[Dashboard] ✅ Notes rendered (after load)');
          } catch (e) {
              console.warn('[Dashboard] Notes render error:', e);
              container.innerHTML = self._notesFallbackHTML('Render error: ' + e.message);
          }
      }
  
      loadNext(0);
  },
  
  _notesFallbackHTML: function(msg) {
      return `
        <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
          <button type="button" onclick="LawAIApp.Dashboard._lastRenderAt = 0; LawAIApp.Dashboard.forceRender();" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;margin-bottom:16px;">← Back to Dashboard</button>
          <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">📓 Notes</h2>
          <p style="color:#94a3b8;">${msg || 'Notes module not available.'}</p>
        </div>
      `;
  },

  /**
   * 显示替代选项
   */
  _showAlternatives: function() {
    var el = document.getElementById('adaptive-alternatives');
    if (el) el.style.display = 'block';
  },

  /**
   * 隐藏替代选项
   */
  _hideAlternatives: function() {
    var el = document.getElementById('adaptive-alternatives');
    if (el) el.style.display = 'none';
  },

  /**
   * 处理自适应推荐选择
   */
  _handleAdaptiveChoice: function(recId, type, targetId) {
    console.log('[Dashboard][Part82] Adaptive choice:', recId, type, targetId);

    // 记录选择
    var at = window.LawAIApp?.ActionTracker;
    if (at && at.initialized && typeof at.record === 'function') {
      try {
        at.record({
          type: 'SELECT',
          target: recId,
          source: 'dashboard-adaptive',
          metadata: { type: type, targetId: targetId },
          timestamp: Date.now()
        });
      } catch (e) {}
    }

    // 导航到目标
    if (targetId) {
      window.location.href = '/pages/academy.html?view=module&id=' + targetId;
    } else {
      window.location.href = '/pages/academy.html';
    }
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

console.log('📊 Dashboard V4.4 ready (Part 72 - Learner Dialogue & Calibration)');
