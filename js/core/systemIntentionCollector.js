/**
 * System Intention Collector
 * Collects current and historical system intentions.
 * Observation only – no execution.
 */

import { INTENTION_TYPES } from './systemIntentionManifest.js';

// Historical intention store
var _intentionHistory = [];
var _currentIntention = null;

export function collectAll() {
  var result = {
    timestamp: new Date().toISOString(),
    currentIntention: null,
    activeIntentions: [],
    historicalIntentions: [],
    intentionCount: 0
  };

  // Determine current intention based on system state
  var intention = determineCurrentIntention();
  result.currentIntention = intention;
  
  if (intention) {
    result.activeIntentions = [intention];
    result.intentionCount = 1;
  }

  // Add historical intentions
  result.historicalIntentions = _intentionHistory.slice(-10);

  return result;
}

function determineCurrentIntention() {
  var current = _currentIntention;
  
  // If not manually set, detect from system state
  if (!current) {
    try {
      var runtimeStatus = LawAIApp.RuntimeStatus || window.runtimeStatus;
      if (runtimeStatus && typeof runtimeStatus.getStatus === 'function') {
        var status = runtimeStatus.getStatus();
        if (status === 'boot' || status === 'starting') {
          current = 'SYSTEM_BOOT';
        } else if (status === 'recovery') {
          current = 'SYSTEM_RECOVERY';
        } else if (status === 'learning' || status === 'training') {
          current = 'SYSTEM_LEARNING';
        } else if (status === 'optimizing') {
          current = 'SYSTEM_OPTIMIZATION';
        } else if (status === 'evolving') {
          current = 'SYSTEM_EVOLUTION';
        } else if (status === 'analyzing' || status === 'analytics') {
          current = 'SYSTEM_ANALYSIS';
        }
      }
    } catch (e) { /* ignore */ }
  }

  // Validate against manifest
  if (current) {
    var valid = INTENTION_TYPES.some(function(i) { return i.id === current; });
    if (!valid) {
      current = null;
    }
  }

  return current;
}

export function setCurrentIntention(intentionId) {
  var valid = INTENTION_TYPES.some(function(i) { return i.id === intentionId; });
  if (!valid) {
    console.warn('⚠️ Invalid intention:', intentionId);
    return false;
  }

  // Record previous intention in history
  if (_currentIntention) {
    _intentionHistory.push({
      intention: _currentIntention,
      timestamp: new Date().toISOString()
    });
  }

  _currentIntention = intentionId;
  return true;
}

export function getCurrentIntention() {
  return _currentIntention || determineCurrentIntention();
}

export function getIntentionHistory() {
  return _intentionHistory.slice();
}

export function getIntentionHistoryByType(intentionId) {
  return _intentionHistory.filter(function(h) { return h.intention === intentionId; });
}

export function clearHistory() {
  _intentionHistory = [];
}

// Global mount
if (typeof window !== 'undefined') {
  window.systemIntentionCollector = {
    collectAll: collectAll,
    setCurrentIntention: setCurrentIntention,
    getCurrentIntention: getCurrentIntention,
    getIntentionHistory: getIntentionHistory,
    getIntentionHistoryByType: getIntentionHistoryByType,
    clearHistory: clearHistory,
    init: function() {
      console.log('✅ SystemIntentionCollector ready');
      var current = getCurrentIntention();
      if (current) {
        console.log('🎯 Current Intention:', current);
      }
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.SystemIntentionCollector = window.systemIntentionCollector;
  }
}
