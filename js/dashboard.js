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

    // 🔥 Part 102: 尝试通过 ViewModel 覆盖数据
    try {
      var coreResult = this._getCoreIntelligenceResult();
      var surfaceData = LawAIApp.DashboardSurfaceAdapter 
          ? LawAIApp.DashboardSurfaceAdapter.adapt(coreResult)
          : null;
      var viewModel = LawAIApp.DashboardViewModel
          ? LawAIApp.DashboardViewModel.toRenderModel(surfaceData)
          : null;
      
      if (viewModel && viewModel.hero) {
        // 使用 ViewModel 的 Hero 数据
        var vmHero = viewModel.hero;
        heroData = {
          greeting: vmHero.greeting || heroData.greeting,
          message: vmHero.message || heroData.message,
          cta: vmHero.cta || heroData.cta,
          ctaLink: vmHero.ctaLink || heroData.ctaLink,
          showStreak: vmHero.showStreak !== undefined ? vmHero.showStreak : true
        };
        if (viewModel.progress && viewModel.progress.overall !== undefined) {
          progress.completionPercent = viewModel.progress.overall;
        }
      }
    } catch (e) {
      console.warn('[Dashboard] ViewModel error:', e);
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
    var hasRecentActivity = false;

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
  // Part 76: Contextual Priority & Attention Architecture
  // ============================================================

  /**
   * 确定当前上下文的优先级
   * 不新建引擎，只从现有系统派生
   */
  _getContextualPriority: function() {
    var priority = {
      level: this.PRIORITY.BACKGROUND,
      currentJourney: null,
      primaryAction: null,
      insight: null,
      recommendation: null,
      supportingData: null,
      explanation: null,
      hasActiveContext: false
    };

    // 1. 获取当前学习上下文
    var lc = window.LawAIApp?.LearningContext;
    var hasActiveSession = false;
    var hasLearningData = false;
    var currentCourse = null;
    var currentModule = null;
    var currentLesson = null;

    if (lc && lc.initialized) {
      try {
        var ctx = lc.getContext();
        if (ctx) {
          hasActiveSession = ctx.status?.hasActiveSession || false;
          hasLearningData = !!(ctx.course || ctx.module || ctx.lesson);
          currentCourse = ctx.course || null;
          currentModule = ctx.module || null;
          currentLesson = ctx.lesson || null;
        }
      } catch (e) {}
    }

    // 2. 获取活跃推荐
    var de = window.LawAIApp?.DecisionExperience;
    var hasActiveRecommendation = false;
    var recommendationCount = 0;
    var primaryRecommendation = null;

    if (de && de.initialized) {
      try {
        var options = de.getOptions({ includeDismissed: false, maxCount: 5 });
        if (options && options.length > 0) {
          hasActiveRecommendation = true;
          recommendationCount = options.length;
          primaryRecommendation = options[0] || null;
        }
      } catch (e) {}
    }

    // 3. 获取洞察
    var ei = window.LawAIApp?.ExperienceIntelligence;
    var hasInsight = false;
    var insightData = null;

    if (ei && ei.initialized) {
      try {
        var signals = ei.getSignals();
        if (signals && signals.learningState && signals.learningState !== 'unknown') {
          hasInsight = true;
          insightData = {
            state: signals.learningState,
            momentum: signals.momentum || 'steady',
            confidence: signals.confidence || 'medium',
            message: this._buildInsightMessage(signals.learningState, signals.momentum, signals)
          };
        }
      } catch (e) {}
    }

    // 4. 判断优先级（按层级）
    // 4a. PRIMARY: 有活跃会话 → 当前旅程
    if (hasActiveSession && hasLearningData) {
      priority.level = this.PRIORITY.PRIMARY;
      priority.currentJourney = {
        course: currentCourse,
        module: currentModule,
        lesson: currentLesson,
        status: 'active'
      };
      priority.explanation = 'You have an active learning session.';
      priority.hasActiveContext = true;
      
      // Primary Action: Continue
      if (currentLesson) {
        priority.primaryAction = {
          label: 'Continue Learning',
          action: 'continue',
          target: currentLesson.id || null
        };
      } else if (currentCourse) {
        priority.primaryAction = {
          label: 'Resume Course',
          action: 'continue',
          target: currentCourse.id || null
        };
      }
      
      // Insight (secondary within primary)
      if (hasInsight && insightData) {
        priority.insight = insightData;
      }
      
      return priority;
    }

    // 4b. PRIMARY: 有活跃推荐
    if (hasActiveRecommendation && primaryRecommendation) {
      priority.level = this.PRIORITY.PRIMARY;
      priority.currentJourney = {
        course: currentCourse,
        module: currentModule,
        lesson: currentLesson,
        status: hasLearningData ? 'idle' : 'exploring'
      };
      priority.explanation = 'A recommendation is available based on your learning context.';
      priority.hasActiveContext = true;
      
      priority.primaryAction = {
        label: primaryRecommendation.title || 'View Recommendation',
        action: 'recommendation',
        target: primaryRecommendation.id || null
      };
      
      if (primaryRecommendation.reason) {
        priority.explanation = primaryRecommendation.reason;
      }
      
      // 如果有洞察，作为 secondary
      if (hasInsight && insightData) {
        priority.insight = insightData;
      }
      
      return priority;
    }

    // 4c. SECONDARY: 有学习数据但无活跃会话/推荐
    if (hasLearningData) {
      priority.level = this.PRIORITY.SECONDARY;
      priority.currentJourney = {
        course: currentCourse,
        module: currentModule,
        lesson: currentLesson,
        status: 'paused'
      };
      priority.explanation = 'Your learning is ready when you are.';
      priority.hasActiveContext = true;
      
      if (currentLesson) {
        priority.primaryAction = {
          label: 'Resume Learning',
          action: 'continue',
          target: currentLesson.id || null
        };
      } else if (currentCourse) {
        priority.primaryAction = {
          label: 'Continue Course',
          action: 'continue',
          target: currentCourse.id || null
        };
      }
      
      if (hasInsight && insightData) {
        priority.insight = insightData;
      }
      
      return priority;
    }

    // 4d. TERTIARY: 有洞察但无学习数据
    if (hasInsight && insightData) {
      priority.level = this.PRIORITY.TERTIARY;
      priority.currentJourney = null;
      priority.explanation = 'Insight available based on your learning history.';
      priority.hasActiveContext = true;
      priority.insight = insightData;
      priority.primaryAction = {
        label: 'Explore Academy',
        action: 'explore',
        target: null
      };
      return priority;
    }

    // 4e. BACKGROUND: 有数据但无洞察
    if (this._getNoteCount() > 0 || this._getProgress().completedLessons?.length > 0) {
      priority.level = this.PRIORITY.BACKGROUND;
      priority.currentJourney = null;
      priority.explanation = 'You have learning history. Explore to continue.';
      priority.hasActiveContext = true;
      priority.primaryAction = {
        label: 'Explore Academy',
        action: 'explore',
        target: null
      };
      return priority;
    }

    // 4f. 默认：安静（无数据）
    priority.level = this.PRIORITY.BACKGROUND;
    priority.currentJourney = null;
    priority.explanation = null;
    priority.hasActiveContext = false;
    priority.primaryAction = {
      label: 'Start Learning',
      action: 'explore',
      target: null
    };

    return priority;
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

    // ============================================================
  // Part 77: Judgement Prompt (Compact)
  // ============================================================

  _renderJudgementPromptCompact: function() {
    var lc = window.LawAIApp?.LearningContext;
    var hasLearningData = false;
    var hasActiveSession = false;
    
    if (lc && lc.initialized) {
      try {
        var ctx = lc.getContext();
        if (ctx) {
          hasLearningData = !!(ctx.course || ctx.module || ctx.lesson);
          hasActiveSession = ctx.status?.hasActiveSession || false;
        }
      } catch (e) {}
    }

    if (!hasLearningData || hasActiveSession) {
      return '';
    }

    var judgement = this._getLearnerJudgement();
    if (judgement.hasJudgement && judgement.confidence) {
      // 如果已有判断，显示"已记录"状态（不占空间）
      var confidenceLabels = {
        'not_yet': '🌱 Not yet',
        'somewhat': '🔄 Somewhat',
        'confident': '💪 Confident',
        'very': '🎯 Very confident'
      };
      var label = confidenceLabels[judgement.confidence] || 'Recorded';
      return `
        <div style="
          font-size: 11px;
          color: #64748b;
          padding: 4px 0;
          border-top: 1px solid rgba(255,255,255,0.03);
          margin-top: 6px;
        ">
          ✅ Your judgement: ${label}
        </div>
      `;
    }

    var contextParts = [];
    if (lc && lc.initialized) {
      try {
        var ctx = lc.getContext();
        if (ctx) {
          if (ctx.lesson) contextParts.push(ctx.lesson.name || 'this lesson');
          else if (ctx.course) contextParts.push(ctx.course.title || 'this course');
        }
      } catch (e) {}
    }
    var targetName = contextParts.length > 0 ? contextParts[0] : 'this topic';

    return `
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 6px 0;
        border-top: 1px solid rgba(255,255,255,0.03);
        margin-top: 6px;
      ">
        <span style="font-size: 11px; color: #94a3b8;">🤔 How confident about ${targetName}?</span>
        <button onclick="LawAIApp.Dashboard._recordLearnerJudgement('confidence', 'not_yet')" style="
          padding: 1px 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 100px;
          color: #64748b;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
        ">Not yet</button>
        <button onclick="LawAIApp.Dashboard._recordLearnerJudgement('confidence', 'somewhat')" style="
          padding: 1px 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 100px;
          color: #64748b;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
        ">Somewhat</button>
        <button onclick="LawAIApp.Dashboard._recordLearnerJudgement('confidence', 'confident')" style="
          padding: 1px 10px;
          background: rgba(74,158,255,0.06);
          border: 1px solid rgba(74,158,255,0.08);
          border-radius: 100px;
          color: #4a9eff;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
        ">Confident</button>
        <button onclick="LawAIApp.Dashboard._recordLearnerJudgement('confidence', 'very')" style="
          padding: 1px 10px;
          background: rgba(16,185,129,0.06);
          border: 1px solid rgba(16,185,129,0.08);
          border-radius: 100px;
          color: #10b981;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
        ">Very</button>
        <button onclick="LawAIApp.Dashboard._recordLearnerJudgement('dismiss', 'judgement')" style="
          padding: 1px 8px;
          background: transparent;
          border: none;
          color: #475569;
          font-size: 10px;
          cursor: pointer;
          font-family: inherit;
        ">Skip</button>
      </div>
    `;
  },

  /**
   * 记录学习者的判断
   * 复用现有存储（localStorage），不新建数据库
   */
  _recordLearnerJudgement: function(type, value) {
    console.log('[Dashboard][Part77] Judgement recorded:', type, value);

    try {
      var stored = localStorage.getItem('dashboardLearnerJudgements') || '[]';
      var judgements = JSON.parse(stored);
      
      // 找到同类型的最近记录并更新，或追加新记录
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
      
      // 只保留最近 20 条
      if (judgements.length > 20) {
        judgements = judgements.slice(-20);
      }
      
      localStorage.setItem('dashboardLearnerJudgements', JSON.stringify(judgements));
      
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
    } catch (e) {
      console.warn('[Dashboard][Part77] Record judgement error:', e);
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

    if (response && response.length > 0) {
      var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
      if (notes && typeof notes.create === 'function') {
        var note = notes.create({
          title: 'Learning Reflection',
          content: response,
          type: 'REFLECTION',
          source: 'dashboard',
          tags: ['reflection']
        });
        if (note) {
          if (window.LawAIApp?.Toast && typeof window.LawAIApp.Toast.success === 'function') {
            window.LawAIApp.Toast.success('✅ Reflection saved to Notes');
          }
          this._reflectionStates[insightId] = false;
          this.render();
        }
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

    // 1. 调用 DecisionExperience.selectOption（如果存在）
    var de = window.LawAIApp?.DecisionExperience;
    if (de && de.initialized && typeof de.selectOption === 'function') {
      try {
        de.selectOption(choiceId);
        console.log('[Dashboard][Part74] ✅ DecisionExperience.selectOption called');
      } catch (e) {
        console.warn('[Dashboard][Part74] DecisionExperience.selectOption error:', e);
      }
    }

    // 2. 调用 ActionTracker.record（如果存在）
    var at = window.LawAIApp?.ActionTracker;
    if (at && at.initialized && typeof at.record === 'function') {
      try {
        at.record({
          type: actionType || 'SELECT',
          target: choiceId,
          source: 'dashboard-learning-loop',
          timestamp: Date.now()
        });
        console.log('[Dashboard][Part74] ✅ ActionTracker.record called');
      } catch (e) {
        console.warn('[Dashboard][Part74] ActionTracker.record error:', e);
      }
    }

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
        // 触发反思保存
        var insightId = 'loop_' + Date.now();
        var reflectionText = 'I chose to save this learning moment.';
        var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
        if (notes && typeof notes.create === 'function') {
          var note = notes.create({
            title: 'Learning Loop Save',
            content: reflectionText,
            type: 'REFLECTION',
            source: 'dashboard-learning-loop',
            tags: ['learning-loop', 'save']
          });
          if (note && window.LawAIApp?.Toast) {
            LawAIApp.Toast.success('✅ Saved to Notes');
          }
        } else {
          if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.info('📝 Notes will be available soon');
          }
        }
        // 刷新 Dashboard 以更新状态
        setTimeout(function() { LawAIApp.Dashboard.render(); }, 300);
      },
      'schedule': function() {
        var cal = window.LawAIApp?.CalendarEngine;
        if (cal && cal.initialized && typeof cal.createEvent === 'function') {
          try {
            var lc = window.LawAIApp?.LearningContext;
            var ctx = lc ? lc.getContext() : null;
            cal.createEvent({
              title: 'Review: ' + (ctx?.lesson?.name || 'Learning'),
              description: 'Scheduled from Dashboard Learning Loop',
              type: 'review',
              date: new Date(Date.now() + 86400000).toISOString() // tomorrow
            });
            if (window.LawAIApp?.Toast) {
              LawAIApp.Toast.success('📅 Scheduled for tomorrow');
            }
          } catch (e) {
            console.warn('[Dashboard][Part74] Calendar error:', e);
            if (window.LawAIApp?.Toast) {
              LawAIApp.Toast.info('📅 Calendar coming soon');
            }
          }
        } else {
          if (window.LawAIApp?.Toast) {
            LawAIApp.Toast.info('📅 Calendar coming soon');
          }
        }
        // 刷新 Dashboard
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

    // 记录关闭事件（使用现有 ActionTracker）
    var at = window.LawAIApp?.ActionTracker;
    if (at && at.initialized && typeof at.record === 'function') {
      try {
        at.record({
          type: 'CLOSE',
          target: 'learning-loop',
          source: 'dashboard',
          timestamp: Date.now()
        });
        console.log('[Dashboard][Part75] ✅ Closure recorded');
      } catch (e) {
        console.warn('[Dashboard][Part75] Closure record error:', e);
      }
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

    // ── Part 72: 获取洞察和对话状态 ──
    var insight = this._getLearningInsight();
    var insightId = insight ? 'insight_' + Date.now() : null;

    // 构建 Insight HTML (Part 72: 包含 Dialogue)
    var insightHTML = '';
    if (insight && insightId) {
      var dialogueState = this._getDialogueState(insightId);
      var isReflecting = this._reflectionStates && this._reflectionStates[insightId];

      var confidenceLabel = insight.confidence === 'high' ? '💪 Strong evidence' :
                           insight.confidence === 'medium' ? '📊 Moderate evidence' :
                           '🔍 Emerging pattern';

      // ── Part 72: Dialogue 响应选项 ──
      var dialogueOptions = '';
      if (dialogueState === 'open') {
        dialogueOptions = `
          <div style="display:flex; gap:8px; flex-wrap: wrap; margin-top: 6px;">
            <button onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'yes')" style="
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
            <button onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'somewhat')" style="
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
            <button onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'not_really')" style="
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
            <button onclick="LawAIApp.Dashboard._handleDialogueResponse('${insightId}', 'not_sure')" style="
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
            <button onclick="LawAIApp.Dashboard._handleDialogueSkip('${insightId}')" style="
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

      // ── Part 72: 对话触发器 ──
      var dialogueTrigger = '';
      if (dialogueState === 'idle' || dialogueState === 'dismissed') {
        dialogueTrigger = `
          <button onclick="LawAIApp.Dashboard._toggleDialogue('${insightId}')" style="
            background: rgba(74,158,255,0.06);
            border: 1px solid rgba(74,158,255,0.08);
            border-radius: 100px;
            color: #94a3b8;
            font-size: 11px;
            cursor: pointer;
            padding: 4px 14px;
            font-family: inherit;
            transition: all 0.2s;
          " onmouseover="this.style.background='rgba(74,158,255,0.12)'" onmouseout="this.style.background='rgba(74,158,255,0.06)'">
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
              <button onclick="LawAIApp.Dashboard._handleSelfAssessment('${insightId}', ${val})" style="
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
      if (isReflecting) {
        reflectionHTML = `
          <div style="
            margin-top: 10px;
            padding: 12px 14px;
            background: rgba(255,255,255,0.02);
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.04);
          ">
            <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0;">
              💭 What do you think about this?
            </p>
            <textarea id="reflection-text-${insightId}" style="
              width: 100%;
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.06);
              border-radius: 8px;
              color: #e2e8f0;
              padding: 8px 12px;
              font-family: inherit;
              font-size: 13px;
              resize: vertical;
              min-height: 50px;
              margin-bottom: 8px;
            " placeholder="What's on your mind?"></textarea>
            <div style="display:flex; gap: 8px; flex-wrap: wrap;">
              <button onclick="LawAIApp.Dashboard._handleReflectionResponse('${insightId}', document.getElementById('reflection-text-${insightId}').value)" style="
                padding: 5px 16px;
                background: #4a9eff;
                border: none;
                border-radius: 100px;
                color: white;
                font-size: 12px;
                cursor: pointer;
                font-family: inherit;
              ">💾 Save to Notes</button>
              <button onclick="LawAIApp.Dashboard._toggleReflection('${insightId}')" style="
                padding: 5px 16px;
                background: transparent;
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 100px;
                color: #64748b;
                font-size: 12px;
                cursor: pointer;
                font-family: inherit;
              ">Cancel</button>
            </div>
          </div>
        `;
      }

      // ── 完整 Insight Card ──
      insightHTML = `
        <div style="
          background: rgba(74,158,255,0.04);
          border-radius: 8px;
          padding: 14px 16px;
          margin-bottom: 12px;
          border-left: 3px solid #4a9eff;
        ">
          <!-- Fact -->
          <div style="margin-bottom: 4px;">
            <span style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.5px;">🔍 OBSERVED</span>
            <div style="font-size: 14px; color: #e2e8f0; margin-top: 2px;">${insight.fact}</div>
          </div>
          
          <!-- Interpretation -->
          <div style="margin-bottom: 6px; padding-left: 4px; border-left: 2px solid rgba(74,158,255,0.15); padding-left: 10px;">
            <span style="font-size: 10px; color: #4a9eff; font-weight: 500; letter-spacing: 0.5px;">💡 INTERPRETATION</span>
            <div style="font-size: 13px; color: #94a3b8; margin-top: 2px;">${insight.interpretation}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">${confidenceLabel}</div>
          </div>
          
          <!-- Part 72: Dialogue Trigger + Options -->
          ${dialogueState === 'idle' || dialogueState === 'dismissed' ? dialogueTrigger : ''}
          ${dialogueState === 'open' ? dialogueOptions : ''}
          ${dialogueStatus}
          
          <!-- Part 72: Self-assessment (always available) -->
          ${selfAssessmentHTML}
          
          <!-- Part 71: Reflection (toggled) -->
          ${reflectionHTML}
          
          <!-- Part 71: Disagree button -->
          <div style="margin-top: 6px;">
            <button onclick="LawAIApp.Dashboard._handleDisagree('${insightId}')" style="
              background: transparent;
              border: none;
              color: #64748b;
              font-size: 10px;
              cursor: pointer;
              text-decoration: underline;
              font-family: inherit;
              padding: 2px 4px;
            ">This doesn't feel accurate</button>
          </div>
        </div>
      `;
    }

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

      <!-- 🔥 EXPLORE 导航 -->
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
          { icon: '📓', label: 'Notes', url: action: 'notes' },
          { icon: '🧠', label: 'Intelligence', url: null },
          { icon: '💬', label: 'Chat', url: null },
          { icon: '📅', label: 'Calendar', action: 'calendar' },
          { icon: '⚙️', label: 'Settings', action: 'settings' },
          { icon: '📋', label: 'Prompts', url: null },
          { icon: '🎯', label: 'Goals', url: null },
          { icon: '🧠', label: 'Mentor', url: null },
          { icon: '🚀', label: 'Showcase', url: null }
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
              onClick = "if(window.LawAIApp&&window.LawAIApp.Toast&&typeof window.LawAIApp.Toast.info==='function'){window.LawAIApp.Toast.info('" + btn.label + " coming soon! 🚧')}else{alert('" + btn.label + " coming soon! 🚧')}";
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

      <!-- 🔥 HERO -->
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

            <!-- 📖 RECOMMENDATIONS (Part 82: Adaptive) -->
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
          ${this._renderAdaptiveRecommendations()}
        </div>
      </section>

      <!-- 📈 LEARNING INSIGHTS (Part 72 + 76 + 77) -->
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
        
        <!-- Part 72: Dialogue Insight -->
        ${insightHTML}
        
        <!-- Stats -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
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

      <!-- 🔄 LEARNING LOOP (Part 74: Choice → Outcome) -->
      ${this._renderLearningLoop()}

      <!-- 📚 LEARNING CONTINUITY (Part 73) -->
      ${this._buildContinuityHTML()}

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
      var notes = window.LawAIApp?.Notes || window.LawAIApp?.KnowledgeCapture;
      if (!notes) return [];

      try {
          var allNotes = notes.getNotes ? notes.getNotes() : [];
          if (!allNotes || allNotes.length === 0) return [];

          // 筛选反思类型的笔记
          var reflections = allNotes.filter(function(n) {
              return n.type === 'REFLECTION' || 
                     n.tags?.indexOf('reflection') !== -1 ||
                     n.source === 'dashboard';
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
  },

  /**
   * 获取即将到来的日程
   */
  _getUpcomingSchedule: function() {
      var cal = window.LawAIApp?.CalendarEngine;
      if (!cal) return [];

      try {
          // 简化版本：从 localStorage 或现有状态获取
          var upcoming = [];
          var stored = localStorage.getItem('dashboardUpcomingSchedule');
          if (stored) {
              var parsed = JSON.parse(stored);
              if (parsed && parsed.length > 0) {
                  return parsed;
              }
          }
          return [];
      } catch (e) {
          return [];
      }
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

  /**
   * 构建连续性卡片 HTML
   */
  _buildContinuityHTML: function() {
    // 🔥 添加常量定义（从 _buildHTML 复制过来）
    var CARD_RADIUS = '16px';
    var CARD_BG = 'rgba(255,255,255,0.025)';
    var CARD_BORDER = '1px solid rgba(255,255,255,0.04)';
    var CARD_PADDING = '20px';

    var context = this._getContinuityContext();

    var html = '';
  
    if (!context.hasRecentLearning && !context.hasReflection && !context.hasUpcoming) {
        return '';
    }

    html += `
        <section style="
            background: ${CARD_BG};
            border-radius: ${CARD_RADIUS};
            padding: ${CARD_PADDING};
            border: ${CARD_BORDER};
            margin-bottom: 16px;
        ">
            <p style="
                margin: 0 0 10px;
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
                letter-spacing: 0.6px;
            ">  
                📚 LEARNING CONTINUITY
            </p>
            <div style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                ${context.message}
            </div>
    `;

    if (context.hasReflection && context.recentReflections.length > 0) {
        var ref = context.recentReflections[0];
        var preview = ref.content ? ref.content.substring(0, 80) + (ref.content.length > 80 ? '...' : '') : 'Saved reflection';
        html += `
            <div style="
                margin-top: 8px;
                padding: 8px 12px;
                background: rgba(255,255,255,0.02);
                border-radius: 6px;
                border-left: 2px solid #4a9eff;
                font-size: 12px;
                color: #e2e8f0;
            ">
                💭 ${preview}
            </div>
        `;  
    }

    if (context.hasUpcoming && context.upcomingItems.length > 0) {
        html += `
            <div style="
                margin-top: 8px;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                font-size: 11px;
                color: #64748b;
            ">
                ${context.upcomingItems.map(function(item) {
                    return `<span style="background: rgba(255,255,255,0.03); padding: 2px 12px; border-radius: 100px;">📅 ${item.title || 'Review'}</span>`;
                }).join('')}
            </div>
        `;  
    }

    html += `
            <div style="
                margin-top: 10px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                border-top: 1px solid rgba(255,255,255,0.04);
                padding-top: 10px;
            ">
                <button onclick="window.location.href='/pages/academy.html'" style="
                    padding: 4px 14px;
                    background: rgba(74,158,255,0.06);
                    border: 1px solid rgba(74,158,255,0.08);
                    border-radius: 100px;
                    color: #94a3b8;
                    font-size: 10px;
                    cursor: pointer;
                    font-family: inherit;
                ">📚 Continue Learning</button>
                ${context.hasReflection ? `<button onclick="window.location.href='/pages/academy.html#notes'" style="
                    padding: 4px 14px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 100px;
                    color: #94a3b8;
                    font-size: 10px;
                    cursor: pointer;
                    font-family: inherit;
                ">📓 View Notes</button>` : ''}
            </div>
        </section>
    `;

    return html;
},
  
  // ============================================================
  // Part 74: Learning Loop Renderer
  // ============================================================

  /**
   * 渲染 Learning Loop 因果链
   */
  _renderLearningLoop: function() {
    var loopData = this._getLearningLoopData();

    if (loopData.isQuiet && loopData.quietMessage) {
      return `
        <div style="
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          padding: 16px 20px;
          border: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 16px;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 14px;">🌱</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 500; letter-spacing: 0.6px;">LEARNING LOOP</span>
            <span style="font-size: 9px; color: #64748b; background: rgba(255,255,255,0.04); padding: 2px 10px; border-radius: 100px;">QUIET</span>
          </div>
          <div style="font-size: 14px; color: #94a3b8; padding: 4px 0 2px 0;">
            ${loopData.quietMessage}
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            Check back when you're ready to continue.
          </div>
        </div>
      `;
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
          <button onclick="LawAIApp.Dashboard._handleLoopChoice('${actionId}', 'SELECT')"
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
          <button onclick="LawAIApp.Dashboard.render()" style="
            padding: 4px 14px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.04);
            border-radius: 100px;
            color: #64748b;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">🔄 Refresh</button>
          <button onclick="window.location.href='/pages/academy.html'" style="
            padding: 4px 14px;
            background: rgba(74,158,255,0.06);
            border: 1px solid rgba(74,158,255,0.08);
            border-radius: 100px;
            color: #4a9eff;
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
          ">📚 Go to Academy</button>
          <button onclick="LawAIApp.Dashboard._handleLoopClosure()" style="
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
  // Part 76: Priority Indicator (Compact)
  // ============================================================

  _renderPriorityIndicatorCompact: function() {
    var priority = this._getContextualPriority();
    
    // 如果没有活跃上下文，不显示
    if (!priority.hasActiveContext && !priority.currentJourney && !priority.insight) {
      return '';
    }

    var levelColor = this._getPriorityColor(priority.level);
    var levelLabel = this._getPriorityLabel(priority.level);

    var contextParts = [];
    if (priority.currentJourney) {
      var j = priority.currentJourney;
      if (j.course) contextParts.push(j.course.title || 'Course');
      if (j.module) contextParts.push(j.module.name || 'Module');
      if (j.lesson) contextParts.push(j.lesson.name || 'Lesson');
    }
    var contextDisplay = contextParts.length > 0 ? contextParts.join(' → ') : 'Exploring';

    var statusEmoji = priority.currentJourney?.status === 'active' ? '▶️' :
                      priority.currentJourney?.status === 'paused' ? '⏸️' :
                      priority.currentJourney?.status === 'idle' ? '📖' : '🔍';

    return `
      <div style="
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px;
        background: rgba(255,255,255,0.02);
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.03);
        margin-bottom: 10px;
        flex-wrap: wrap;
      ">
        <span style="font-size: 13px;">${statusEmoji}</span>
        <span style="font-size: 12px; color: #e2e8f0; font-weight: 500;">${contextDisplay}</span>
        <span style="font-size: 10px; color: #64748b; margin-left: auto;">${levelLabel}</span>
        ${priority.primaryAction ? `
          <button onclick="LawAIApp.Dashboard._handlePriorityAction('${priority.primaryAction.action}', '${priority.primaryAction.target || ''}')" style="
            padding: 2px 14px;
            background: ${levelColor}22;
            border: 1px solid ${levelColor}44;
            border-radius: 100px;
            color: ${levelColor};
            font-size: 10px;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
          " onmouseover="this.style.background='${levelColor}44'" onmouseout="this.style.background='${levelColor}22'">
            ${priority.primaryAction.label}
          </button>
        ` : ''}
      </div>
    `;
  },

    // ============================================================
  // Part 82: Adaptive Recommendation Renderer
  // ============================================================

  _renderAdaptiveRecommendations: function() {
    var adapter = window.LawAIApp?.LearningJourneyAdapter;
    if (!adapter || !adapter.initialized) {
      return `
        <div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">
          Learning recommendations are initializing...
        </div>
      `;
    }

    if (typeof adapter.getAdaptiveRecommendation !== 'function') {
      return `
        <div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">
          Complete more lessons to get personalized recommendations.
        </div>
      `;
    }

    var result = adapter.getAdaptiveRecommendation({ maxCandidates: 4 });

    if (!result.hasRecommendation || !result.recommendation) {
      return `
        <div style="color:#64748b;font-size:12px;text-align:center;padding:8px 0;">
          ${result.message || 'Complete more learning to unlock recommendations.'}
        </div>
      `;
    }

    var rec = result.recommendation;
    var explanation = result.explanation;

    // 构建推荐卡片
    var html = `
      <div style="
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        background: rgba(74,158,255,0.04);
        border-radius: 10px;
        border: 1px solid rgba(74,158,255,0.06);
        transition: all 0.2s;
      ">
        <span style="font-size: 18px;">${rec.type === 'continue' ? '▶️' : rec.type === 'review' ? '🔄' : rec.type === 'explore' ? '🔍' : '📌'}</span>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 500; color: #e2e8f0;">
            ${rec.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8;">
            ${rec.description}
          </div>
          ${explanation ? `
            <div style="font-size: 10px; color: #4a9eff; opacity: 0.7; margin-top: 2px;">
              💡 ${explanation.text}
            </div>
          ` : ''}
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          ${result.alternatives.length > 0 ? `
            <button onclick="LawAIApp.Dashboard._showAlternatives()" style="
              padding: 2px 10px;
              background: rgba(255,255,255,0.03);
              border: 1px solid rgba(255,255,255,0.06);
              border-radius: 100px;
              color: #64748b;
              font-size: 9px;
              cursor: pointer;
              font-family: inherit;
            ">${result.alternatives.length}+</button>
          ` : ''}
          <button onclick="LawAIApp.Dashboard._handleAdaptiveChoice('${rec.id}', '${rec.type}', '${rec.targetId}')" style="
            padding: 4px 16px;
            background: #4a9eff;
            border: none;
            border-radius: 100px;
            color: white;
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.2s;
          " onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
            Go →
          </button>
        </div>
      </div>
    `;

    // 如果有替代选项，添加隐藏的备选列表
    if (result.alternatives.length > 0) {
      html += `
        <div id="adaptive-alternatives" style="display:none; margin-top: 6px; padding: 8px 14px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">Alternative options:</div>
          ${result.alternatives.map(function(alt) {
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 2px 0; font-size: 12px; color: #94a3b8;">
                <span>${alt.title}</span>
                <button onclick="LawAIApp.Dashboard._handleAdaptiveChoice('${alt.id}', '${alt.type}', '${alt.targetId}')" style="
                  padding: 1px 12px;
                  background: rgba(255,255,255,0.04);
                  border: 1px solid rgba(255,255,255,0.06);
                  border-radius: 100px;
                  color: #64748b;
                  font-size: 9px;
                  cursor: pointer;
                  font-family: inherit;
                ">Choose</button>
              </div>
            `;
          }).join('')}
          <button onclick="LawAIApp.Dashboard._hideAlternatives()" style="
            margin-top: 4px;
            padding: 2px 10px;
            background: transparent;
            border: none;
            color: #475569;
            font-size: 9px;
            cursor: pointer;
            font-family: inherit;
            text-decoration: underline;
          ">Hide alternatives</button>
        </div>
      `;
    }

    return html;
  },

  // ============================================================
  // 🔥 直接渲染 Calendar（不跳转）
  // ============================================================
  _renderCalendarView: function() {
    console.log('[Dashboard] 📅 Rendering Calendar inline...');
    
    var container = document.getElementById('app') || document.getElementById('law-runtime-root') || document.getElementById('dashboard-root');
    if (!container) return;

    // 如果有完整 Calendar，使用它
    if (window.LawAIApp?.Calendar && typeof window.LawAIApp.Calendar.render === 'function') {
      try {
        window.LawAIApp.Calendar._root = container;
        window.LawAIApp.Calendar.render();
        return;
      } catch (e) {
        console.warn('[Dashboard] Full Calendar error:', e);
      }
    }

    // 懒加载完整 Calendar
    if (window.LawAIApp?.AcademyLoader?.loadCalendarLazy) {
      window.LawAIApp.AcademyLoader.loadCalendarLazy(function(calendar) {
        try {
          calendar._root = container;
          calendar.render();
        } catch (e) {
          console.warn('[Dashboard] Lazy Calendar error:', e);
        }
      });
    }

    // 先用内联 Calendar 渲染（快速显示）
    var inlineCalendar = {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      render: function() {
        var monthName = new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
        var daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        var firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        
        var gridHTML = '';
        for (var i = 0; i < firstDay; i++) gridHTML += '<div></div>';
        for (var d = 1; d <= daysInMonth; d++) {
          var isToday = d === new Date().getDate() && 
                          this.currentMonth === new Date().getMonth() && 
                          this.currentYear === new Date().getFullYear();
          gridHTML += '<div style="padding:12px 6px;text-align:center;border-radius:8px;background:' + 
            (isToday ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)') + 
            ';color:' + (isToday ? '#4a9eff' : '#e2e8f0') + 
            ';font-size:14px;cursor:pointer;font-family:inherit;">' + d + '</div>';
        }

        container.innerHTML = `
          <div style="max-width:900px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:12px;flex-wrap:wrap;">
              <button onclick="LawAIApp.Dashboard.render()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">← Back to Dashboard</button>
            </div>
            <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">📅 Calendar</h2>
            <p style="color:#94a3b8;margin:0 0 20px;">${monthName} ${this.currentYear}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <button onclick="window.LawAIApp.Calendar.changeMonth(-1)" style="padding:8px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:100px;color:#94a3b8;cursor:pointer;font-family:inherit;">←</button>
              <span style="font-weight:600;font-size:18px;">${monthName} ${this.currentYear}</span>
              <button onclick="window.LawAIApp.Calendar.changeMonth(1)" style="padding:8px 20px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:100px;color:#94a3b8;cursor:pointer;font-family:inherit;">→</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">${gridHTML}</div>
          </div>
        `;
      },
      changeMonth: function(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
        if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
        this.render();
      }
    };
    
    window.LawAIApp = window.LawAIApp || {};
    window.LawAIApp.Calendar = inlineCalendar;
    inlineCalendar.render();
  },

  // ============================================================
  // 🔥 直接渲染 Settings（不跳转）
  // ============================================================
  _renderSettingsView: function() {
    console.log('[Dashboard] ⚙️ Rendering Settings inline...');
    
    var container = document.getElementById('app') || document.getElementById('law-runtime-root') || document.getElementById('dashboard-root');
    if (!container) return;

    // 懒加载完整 Settings
    if (window.LawAIApp?.AcademyLoader?.loadSettingsLazy) {
      window.LawAIApp.AcademyLoader.loadSettingsLazy(function(settings) {
        try {
          settings.render();
        } catch (e) {
          console.warn('[Dashboard] Lazy Settings error:', e);
        }
      });
    }

    // 先用内联 Settings 渲染
    container.innerHTML = `
      <div style="max-width:700px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
          <button onclick="LawAIApp.Dashboard.render()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">← Back to Dashboard</button>
        </div>
        <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;">⚙️ Settings</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
            <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">👤 Profile</h3>
            <p style="margin:0;color:#94a3b8;font-size:13px;">Manage your profile settings</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
            <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">🎯 Learning Preferences</h3>
            <p style="margin:0;color:#94a3b8;font-size:13px;">Adjust your learning preferences</p>
          </div>
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
            <h3 style="margin:0 0 8px;font-size:14px;font-weight:600;">🔔 Notifications</h3>
            <p style="margin:0;color:#94a3b8;font-size:13px;">Manage notification settings</p>
          </div>
        </div>
      </div>
    `;
  },

  // ============================================================
  // 🔥 直接渲染 Notes（不跳转）
  // ============================================================
  _renderNotesView: function() {
    console.log('[Dashboard] 📝 Rendering Notes inline...');
    
    var container = document.getElementById('app') || document.getElementById('law-runtime-root') || document.getElementById('dashboard-root');
    if (!container) return;

    container.innerHTML = `
      <div style="max-width:700px;margin:0 auto;padding:20px;color:#e2e8f0;font-family:'Inter',sans-serif;">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
          <button onclick="LawAIApp.Dashboard.render()" style="background:rgba(74,158,255,0.08);border:1px solid rgba(74,158,255,0.15);color:#4a9eff;padding:8px 16px;border-radius:100px;cursor:pointer;font-family:inherit;font-size:13px;">← Back to Dashboard</button>
        </div>
        <h2 style="margin:0 0 20px;font-size:24px;font-weight:700;">📝 Notes</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px;border:1px solid rgba(255,255,255,0.04);">
            <p style="margin:0;color:#94a3b8;font-size:13px;">No notes yet. Create your first note!</p>
          </div>
        </div>
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
