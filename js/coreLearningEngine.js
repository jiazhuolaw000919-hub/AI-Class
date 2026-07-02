// coreLearningEngine.js
LawAIApp.CoreLearningEngine = (function() {
  const State = {
    IDLE: 'idle',
    LOADING: 'loading',
    READY: 'ready',
    LEARNING: 'learning',
    PAUSED: 'paused',
    QUIZ: 'quiz',
    COMPLETED: 'completed',
    REVIEW: 'review',
    ERROR: 'error'
  };

  let currentState = State.IDLE;
  let currentSession = null;
  let cache = {
    currentLesson: null,
    previousLesson: null,
    nextLesson: null,
    currentModule: null
  };

  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  function startSession(lessonId) {
    const lesson = LawAIApp.LessonEngine.getLessonByDay(parseInt(lessonId.split('-')[1]));
    if (!lesson) return null;
    const session = {
      sessionId: generateSessionId(),
      academyId: 'academy_ai', // 目前只有 AI Academy
      courseId: null,          // 未来可解析
      moduleId: null,
      lessonId: lessonId,
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      completedAt: null,
      elapsedTime: 0,
      completionStatus: 'in_progress'
    };
    currentSession = session;
    LawAIApp.StorageEngine.set('current_session', session);
    setState(State.LEARNING);
    LawAIApp.EventBus.emit('sessionStarted', session);
    return session;
  }

  function loadLesson(lessonId) {
    setState(State.LOADING);
    // 验证 ID
    const day = parseInt(lessonId.split('-')[1]);
    if (isNaN(day) || day < 1 || day > 365) {
      setState(State.ERROR);
      LawAIApp.EventBus.emit('lessonLoadError', { lessonId, error: 'Invalid lesson ID' });
      return null;
    }
    const lesson = LawAIApp.LessonEngine.getLessonByDay(day);
    if (!lesson) {
      setState(State.ERROR);
      LawAIApp.EventBus.emit('lessonLoadError', { lessonId, error: 'Lesson not found' });
      return null;
    }
    cache.currentLesson = lesson;
    // 更新上一课/下一课缓存
    cache.previousLesson = day > 1 ? LawAIApp.LessonEngine.getLessonByDay(day - 1) : null;
    cache.nextLesson = day < 365 ? LawAIApp.LessonEngine.getLessonByDay(day + 1) : null;
    setState(State.READY);
    LawAIApp.EventBus.emit('lessonLoaded', lesson);
    return lesson;
  }

  function startLearning(lessonId) {
    const lesson = loadLesson(lessonId);
    if (!lesson) return;
    const session = startSession(lessonId);
    LawAIApp.EventBus.emit('lessonStarted', { lesson, session });
    return { lesson, session };
  }

  function completeLesson(lessonId) {
    if (currentState !== State.LEARNING && currentState !== State.READY) {
      // 允许从外部直接触发完成（如 lesson 页面按钮）
      startSession(lessonId); // 快速建立会话
    }
    if (currentSession && currentSession.lessonId === lessonId) {
      currentSession.completedAt = new Date().toISOString();
      currentSession.completionStatus = 'completed';
      currentSession.elapsedTime = estimateElapsed(currentSession.startedAt);
      LawAIApp.StorageEngine.set('current_session', currentSession);
    }
    setState(State.COMPLETED);
    LawAIApp.EventBus.emit('lessonCompleted', { lessonId, session: currentSession });
    // 清除缓存
    cache.currentLesson = null;
    currentSession = null;
    LawAIApp.StorageEngine.remove('current_session');
  }

  function pauseLearning() {
    if (currentState !== State.LEARNING) return;
    setState(State.PAUSED);
    if (currentSession) {
      currentSession.lastActivity = new Date().toISOString();
      LawAIApp.StorageEngine.set('current_session', currentSession);
    }
    LawAIApp.EventBus.emit('lessonPaused', currentSession);
  }

  function resumeLearning() {
    if (currentState !== State.PAUSED) return;
    setState(State.LEARNING);
    if (currentSession) {
      currentSession.lastActivity = new Date().toISOString();
    }
    LawAIApp.EventBus.emit('lessonResumed', currentSession);
  }

  function restoreSession() {
    const saved = LawAIApp.StorageEngine.get('current_session');
    if (saved && saved.completionStatus === 'in_progress') {
      currentSession = saved;
      setState(State.PAUSED); // 需要用户手动恢复
      return saved;
    }
    return null;
  }

  function getState() { return currentState; }
  function getSession() { return currentSession; }
  function getCache() { return cache; }

  function setState(newState) {
    if (currentState !== newState) {
      currentState = newState;
      LawAIApp.EventBus.emit('stateChanged', { state: newState });
    }
  }

  function estimateElapsed(startedAt) {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000); // seconds
  }

  // 初始化：尝试恢复上次会话
  restoreSession();

  return {
    State,
    startLearning,
    loadLesson,
    completeLesson,
    pauseLearning,
    resumeLearning,
    restoreSession,
    getState,
    getSession,
    getCache,
    on: LawAIApp.EventBus.on,
    off: LawAIApp.EventBus.off
  };
})();
