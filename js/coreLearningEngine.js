// ===========================================
// coreLearningEngine.js
// 核心学习引擎 - 学习会话管理（Phase 11 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CoreLearningEngine = (function() {
    var State = {
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

    var currentState = State.IDLE;
    var currentSession = null;
    var cache = {
        currentLesson: null,
        previousLesson: null,
        nextLesson: null,
        currentModule: null
    };
    var _sessionTimeout = null;
    var _sessionTimeoutDuration = 1800000; // 30 分钟

    function generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    function startSession(lessonId) {
        // 验证 LessonEngine 是否存在
        if (!LawAIApp.LessonEngine || typeof LawAIApp.LessonEngine.getLessonByDay !== 'function') {
            console.warn('⚠️ LessonEngine not ready, session started in limited mode');
            var session = {
                sessionId: generateSessionId(),
                lessonId: lessonId,
                startedAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                completedAt: null,
                elapsedTime: 0,
                completionStatus: 'in_progress',
                limitedMode: true
            };
            currentSession = session;
            LawAIApp.StorageEngine?.set?.('current_session', session);
            setState(State.LEARNING);
            LawAIApp.EventBus?.emit?.('sessionStarted', session);
            return session;
        }

        var day = parseInt(lessonId.split('-')[1]);
        if (isNaN(day) || day < 1 || day > 365) {
            setState(State.ERROR);
            LawAIApp.EventBus?.emit?.('sessionError', { lessonId: lessonId, error: 'Invalid lesson ID' });
            return null;
        }

        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
        var session = {
            sessionId: generateSessionId(),
            academyId: 'academy_ai',
            courseId: null,
            moduleId: null,
            lessonId: lessonId,
            lessonTitle: lesson ? lesson.title : 'Unknown Lesson',
            startedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            completedAt: null,
            elapsedTime: 0,
            completionStatus: 'in_progress'
        };
        currentSession = session;
        LawAIApp.StorageEngine?.set?.('current_session', session);
        setState(State.LEARNING);
        LawAIApp.EventBus?.emit?.('sessionStarted', session);
        startSessionTimeout();
        return session;
    }

    function startSessionTimeout() {
        if (_sessionTimeout) {
            clearTimeout(_sessionTimeout);
        }
        _sessionTimeout = setTimeout(function() {
            if (currentState === State.LEARNING || currentState === State.PAUSED) {
                console.warn('⏰ Session timeout due to inactivity');
                LawAIApp.EventBus?.emit?.('sessionTimeout', currentSession);
                // 自动暂停
                pauseLearning();
            }
            _sessionTimeout = null;
        }, _sessionTimeoutDuration);
    }

    function loadLesson(lessonId) {
        setState(State.LOADING);
        
        if (!LawAIApp.LessonEngine || typeof LawAIApp.LessonEngine.getLessonByDay !== 'function') {
            setState(State.ERROR);
            LawAIApp.EventBus?.emit?.('lessonLoadError', { lessonId: lessonId, error: 'LessonEngine not ready' });
            return null;
        }

        var day = parseInt(lessonId.split('-')[1]);
        if (isNaN(day) || day < 1 || day > 365) {
            setState(State.ERROR);
            LawAIApp.EventBus?.emit?.('lessonLoadError', { lessonId: lessonId, error: 'Invalid lesson ID' });
            return null;
        }

        var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
        if (!lesson) {
            setState(State.ERROR);
            LawAIApp.EventBus?.emit?.('lessonLoadError', { lessonId: lessonId, error: 'Lesson not found' });
            return null;
        }

        cache.currentLesson = lesson;
        cache.previousLesson = day > 1 ? LawAIApp.LessonEngine.getLessonByDay(day - 1) : null;
        cache.nextLesson = day < 365 ? LawAIApp.LessonEngine.getLessonByDay(day + 1) : null;
        
        setState(State.READY);
        LawAIApp.EventBus?.emit?.('lessonLoaded', lesson);
        return lesson;
    }

    function startLearning(lessonId) {
        var lesson = loadLesson(lessonId);
        if (!lesson) return null;
        var session = startSession(lessonId);
        if (!session) return null;
        LawAIApp.EventBus?.emit?.('lessonStarted', { lesson: lesson, session: session });
        return { lesson: lesson, session: session };
    }

    function completeLesson(lessonId) {
        if (currentState !== State.LEARNING && currentState !== State.READY) {
            startSession(lessonId);
        }

        if (currentSession && currentSession.lessonId === lessonId) {
            currentSession.completedAt = new Date().toISOString();
            currentSession.completionStatus = 'completed';
            currentSession.elapsedTime = estimateElapsed(currentSession.startedAt);
            LawAIApp.StorageEngine?.set?.('current_session', currentSession);
        }

        setState(State.COMPLETED);
        LawAIApp.EventBus?.emit?.('lessonCompleted', { lessonId: lessonId, session: currentSession });

        // 清理
        clearCache();
        currentSession = null;
        LawAIApp.StorageEngine?.remove?.('current_session');
        if (_sessionTimeout) {
            clearTimeout(_sessionTimeout);
            _sessionTimeout = null;
        }
    }

    function pauseLearning() {
        if (currentState !== State.LEARNING) return;
        setState(State.PAUSED);
        if (currentSession) {
            currentSession.lastActivity = new Date().toISOString();
            LawAIApp.StorageEngine?.set?.('current_session', currentSession);
        }
        LawAIApp.EventBus?.emit?.('lessonPaused', currentSession);
        if (_sessionTimeout) {
            clearTimeout(_sessionTimeout);
            _sessionTimeout = null;
        }
    }

    function resumeLearning() {
        if (currentState !== State.PAUSED) return;
        setState(State.LEARNING);
        if (currentSession) {
            currentSession.lastActivity = new Date().toISOString();
        }
        LawAIApp.EventBus?.emit?.('lessonResumed', currentSession);
        startSessionTimeout();
    }

    function restoreSession() {
        var saved = LawAIApp.StorageEngine?.get?.('current_session');
        if (saved && saved.completionStatus === 'in_progress') {
            currentSession = saved;
            setState(State.PAUSED);
            // 检查是否超时
            var lastActivity = new Date(saved.lastActivity).getTime();
            var now = Date.now();
            if (now - lastActivity > _sessionTimeoutDuration) {
                console.warn('⏰ Restored session is expired');
                LawAIApp.EventBus?.emit?.('sessionExpired', saved);
                return null;
            }
            LawAIApp.EventBus?.emit?.('sessionRestored', saved);
            return saved;
        }
        return null;
    }

    function clearCache() {
        cache.currentLesson = null;
        cache.previousLesson = null;
        cache.nextLesson = null;
        cache.currentModule = null;
    }

    function estimateElapsed(startedAt) {
        try {
            var start = new Date(startedAt).getTime();
            var now = Date.now();
            return Math.floor((now - start) / 1000);
        } catch (e) {
            return 0;
        }
    }

    function setState(newState) {
        if (currentState !== newState) {
            currentState = newState;
            LawAIApp.EventBus?.emit?.('stateChanged', { state: newState });
        }
    }

    function getState() { return currentState; }
    function getSession() { return currentSession; }
    function getCache() { return cache; }
    function getStates() { return State; }

    // 销毁（清理资源）
    function destroy() {
        if (_sessionTimeout) {
            clearTimeout(_sessionTimeout);
            _sessionTimeout = null;
        }
        currentSession = null;
        clearCache();
        setState(State.IDLE);
        console.log('🧹 CoreLearningEngine destroyed');
    }

    // 初始化：尝试恢复上次会话
    restoreSession();

    return {
        State: State,
        startLearning: startLearning,
        loadLesson: loadLesson,
        completeLesson: completeLesson,
        pauseLearning: pauseLearning,
        resumeLearning: resumeLearning,
        restoreSession: restoreSession,
        getState: getState,
        getSession: getSession,
        getCache: getCache,
        getStates: getStates,
        destroy: destroy,
        on: LawAIApp.EventBus?.on || function() {},
        off: LawAIApp.EventBus?.off || function() {}
    };
})();

console.log('🧠 CoreLearningEngine V2.0 ready');
