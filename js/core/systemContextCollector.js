/**
 * System Context Collector
 * Collects current system context information.
 * No business execution – read only.
 */

import { CONTEXT_TYPES } from './systemContextManifest.js';

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    contexts: {},
    runtime: null,
    session: null,
    user: null,
    learning: null,
    project: null,
    goal: null,
    device: null
  };

  // Collect runtime context
  try {
    var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
    if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
      result.runtime = {
        status: runtimeStatus.getStatus(),
        ready: runtimeStatus.isReady ? runtimeStatus.isReady() : false,
        version: LawAIApp.SystemComposer?.version || 'N/A'
      };
      result.contexts.RUNTIME_CONTEXT = result.runtime;
    }
  } catch (e) { /* ignore */ }

  // Collect session context
  try {
    var session = LawAIApp.SessionManager || window.sessionManager;
    if (session) {
      result.session = {
        active: typeof session.isActive === 'function' ? session.isActive() : false,
        id: session.sessionId || 'N/A'
      };
      result.contexts.SESSION_CONTEXT = result.session;
    }
  } catch (e) { /* ignore */ }

  // Collect user context
  try {
    var user = LawAIApp.UserManager || window.userManager || LawAIApp.authService || window.authService;
    if (user) {
      result.user = {
        loggedIn: user.isLoggedIn ? user.isLoggedIn() : false,
        name: user.userName || user.username || 'N/A'
      };
      result.contexts.USER_CONTEXT = result.user;
    }
  } catch (e) { /* ignore */ }

  // Collect learning context
  try {
    var learning = LawAIApp.LearningEngine || window.learningEngine;
    if (learning) {
      result.learning = {
        activePath: learning.currentPath || 'N/A',
        progress: learning.progress || 0
      };
      result.contexts.LEARNING_CONTEXT = result.learning;
    }
  } catch (e) { /* ignore */ }

  // Collect project context
  try {
    var project = LawAIApp.ProjectTracker || window.projectTracker;
    if (project) {
      result.project = {
        activeProject: project.currentProject || 'N/A',
        count: project.projectCount || 0
      };
      result.contexts.PROJECT_CONTEXT = result.project;
    }
  } catch (e) { /* ignore */ }

  // Collect goal context
  try {
    var goal = LawAIApp.GoalEngine || window.goalEngine;
    if (goal) {
      result.goal = {
        totalGoals: goal.goalCount || 0,
        completedGoals: goal.completedCount || 0
      };
      result.contexts.GOAL_CONTEXT = result.goal;
    }
  } catch (e) { /* ignore */ }

  // Collect device context
  try {
    result.device = {
      platform: navigator?.platform || 'unknown',
      userAgent: navigator?.userAgent?.substring(0, 50) || 'unknown',
      screenSize: window?.innerWidth + 'x' + window?.innerHeight || 'unknown'
    };
    result.contexts.DEVICE_CONTEXT = result.device;
  } catch (e) { /* ignore */ }

  return result;
}

export function collectContext(contextId) {
  var all = collectAll();
  return all.contexts[contextId] || null;
}

export function getAvailableContexts() {
  var all = collectAll();
  return Object.keys(all.contexts);
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemContextCollector = {
    collectAll: collectAll,
    collectContext: collectContext,
    getAvailableContexts: getAvailableContexts,
    init: function() {
      console.log('✅ SystemContextCollector ready');
      var contexts = getAvailableContexts();
      console.log('📋 Available Contexts:', contexts.join(', '));
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemContextCollector = window.systemContextCollector;
  }
}
