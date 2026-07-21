/**
 * Boot Coordinator
 * Coordinates BootManager execution.
 * Works as a coordinator only – never replaces BootManager.
 */

import { BOOT_PHASES } from './bootSequenceManifest.js';

// Runtime state tracking
var _phaseStates = {};
var _currentPhase = null;
var _startTime = null;
var _completedPhases = [];
var _failedPhases = [];

// Initialize phase states
for (var i = 0; i < BOOT_PHASES.length; i++) {
  var phase = BOOT_PHASES[i];
  _phaseStates[phase.id] = {
    status: 'pending',
    started: null,
    completed: null,
    duration: null
  };
}

export function beforePhase(phaseId) {
  var phase = BOOT_PHASES.find(function(p) { return p.id === phaseId; });
  if (!phase) {
    console.warn('⚠️ Unknown phase:', phaseId);
    return false;
  }
  
  _currentPhase = phaseId;
  _phaseStates[phaseId].status = 'starting';
  _phaseStates[phaseId].started = new Date().toISOString();
  
  console.log('🚀 Boot Coordinator: Starting phase', phase.name);
  return true;
}

export function afterPhase(phaseId, success) {
  var phase = BOOT_PHASES.find(function(p) { return p.id === phaseId; });
  if (!phase) {
    console.warn('⚠️ Unknown phase:', phaseId);
    return false;
  }
  
  var now = new Date();
  var state = _phaseStates[phaseId];
  
  if (success !== false) {
    state.status = 'completed';
    _completedPhases.push(phaseId);
    console.log('✅ Boot Coordinator: Completed phase', phase.name);
  } else {
    state.status = 'failed';
    _failedPhases.push(phaseId);
    console.warn('⚠️ Boot Coordinator: Failed phase', phase.name);
  }
  
  state.completed = now.toISOString();
  if (state.started) {
    var start = new Date(state.started);
    state.duration = (now - start) + 'ms';
  }
  
  _currentPhase = null;
  return true;
}

export function phaseStatus(phaseId) {
  return _phaseStates[phaseId] || null;
}

export function getCurrentPhase() {
  return _currentPhase;
}

export function getCompletedPhases() {
  return _completedPhases.slice();
}

export function getFailedPhases() {
  return _failedPhases.slice();
}

export function getOverallStatus() {
  var total = BOOT_PHASES.length;
  var completed = _completedPhases.length;
  var failed = _failedPhases.length;
  
  var status = 'pending';
  if (completed === total) status = 'complete';
  else if (failed > 0) status = 'failed';
  else if (completed > 0) status = 'in_progress';
  
  return {
    status: status,
    total: total,
    completed: completed,
    failed: failed,
    remaining: total - completed - failed,
    currentPhase: _currentPhase,
    phases: _phaseStates
  };
}

export function resetCoordinator() {
  _phaseStates = {};
  _currentPhase = null;
  _startTime = null;
  _completedPhases = [];
  _failedPhases = [];
  
  for (var i = 0; i < BOOT_PHASES.length; i++) {
    var phase = BOOT_PHASES[i];
    _phaseStates[phase.id] = {
      status: 'pending',
      started: null,
      completed: null,
      duration: null
    };
  }
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootCoordinator = {
    beforePhase: beforePhase,
    afterPhase: afterPhase,
    phaseStatus: phaseStatus,
    getCurrentPhase: getCurrentPhase,
    getCompletedPhases: getCompletedPhases,
    getFailedPhases: getFailedPhases,
    getOverallStatus: getOverallStatus,
    resetCoordinator: resetCoordinator,
    init: function() { console.log('✅ BootCoordinator ready'); return this; }
  };
  
  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootCoordinator = window.bootCoordinator;
  }
}
