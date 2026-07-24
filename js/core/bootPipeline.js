/**
 * Boot Pipeline
 * Central boot execution pipeline.
 * Integrated with Runtime Observation (Part 40), Metrics (Part 41),
 * Tracing (Part 42), Performance Framework (Part 43),
 * Event Intelligence (Part 44.9), and State Integration (Part 45.7)
 */

import { BOOT_STAGE_REGISTRY } from './bootStageRegistry.js';

let _pipelineStatus = {
  status: 'idle',
  currentStage: null,
  completedStages: [],
  failedStage: null,
  startedAt: null,
  completedAt: null,
  totalDuration: null
};

let _isRunning = false;
let _pipeline = [];
let _stageResults = {};
var _pipelineTraceId = null;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function emitObservation(event, source, stage, metadata) {
  try {
    var collector = LawAIApp.RuntimeObservationCollector || window.runtimeObservationCollector;
    if (collector && typeof collector.collect === 'function') {
      collector.collect(event, source, stage, metadata || {});
    }
  } catch (e) { /* ignore */ }
}

function setMetric(id, value) {
  try {
    var collector = LawAIApp.RuntimeMetricsCollector || window.runtimeMetricsCollector;
    if (collector && typeof collector.setMetric === 'function') {
      collector.setMetric(id, value);
    }
  } catch (e) { /* ignore */ }
}

function emitEvent(eventId, payload, metadata) {
  try {
    var collector = LawAIApp.RuntimeEventCollector || window.runtimeEventCollector;
    if (collector && typeof collector.collect === 'function') {
      return collector.collect(eventId, payload, metadata);
    }
  } catch (e) { /* ignore */ }
  return null;
}

function emitStageEvent(stageName, eventType, duration, error) {
  var eventId = 'runtime.pipeline.stage.' + eventType;
  var payload = {
    stage: stageName,
    duration: duration || null,
    error: error || null
  };
  return emitEvent(eventId, payload, { source: 'bootPipeline' });
}

function startTrace(type, source, parentTraceId, metadata) {
  try {
    var collector = LawAIApp.RuntimeTraceCollector || window.runtimeTraceCollector;
    if (collector && typeof collector.startTrace === 'function') {
      return collector.startTrace(type, source, parentTraceId, metadata);
    }
  } catch (e) { /* ignore */ }
  return null;
}

function completeTrace(traceId, status, metadata) {
  try {
    var collector = LawAIApp.RuntimeTraceCollector || window.runtimeTraceCollector;
    if (collector && typeof collector.completeTrace === 'function') {
      return collector.completeTrace(traceId, status, metadata);
    }
  } catch (e) { /* ignore */ }
  return null;
}

function failTrace(traceId, error, metadata) {
  try {
    var collector = LawAIApp.RuntimeTraceCollector || window.runtimeTraceCollector;
    if (collector && typeof collector.failTrace === 'function') {
      return collector.failTrace(traceId, error, metadata);
    }
  } catch (e) { /* ignore */ }
  return null;
}

function trackStagePerformance(stageName, callback) {
  try {
    var perf = LawAIApp.Performance;
    if (perf && typeof perf.track === 'function') {
      return perf.track('runtime.module.duration', 'Pipeline:' + stageName, callback);
    }
  } catch (e) { /* ignore */ }
  return callback();
}

// ============================================================
// PIPELINE CORE
// ============================================================

export function initializePipeline() {
  _pipeline = BOOT_STAGE_REGISTRY.map(function(s) {
    return {
      name: s.name,
      order: s.order,
      owner: s.owner,
      required: s.required,
      status: 'pending',
      result: null,
      duration: null
    };
  });
  _pipelineStatus.status = 'idle';
  _pipelineStatus.completedStages = [];
  _stageResults = {};
}

export function getPipeline() {
  return _pipeline.slice();
}

export function getStageStatus(stageName) {
  return _pipeline.find(function(s) { return s.name === stageName; }) || null;
}

export function getPipelineStatus() {
  return _pipelineStatus;
}

// ============================================================
// 🔥 runPipeline 修复：executorFn 必须始终是函数
// ============================================================

export function runPipeline(executorFn) {
  // 🔥 确保 executorFn 是函数
  var execFn = executorFn;
  if (typeof execFn !== 'function') {
    console.warn('[Boot Pipeline] executorFn is not a function, creating default executor');
    // 创建默认执行器
    execFn = function(stageName, stage) {
      var handlerName = 'handle' + stageName;
      var handlers = LawAIApp.BootStageHandlers || window.bootStageHandlers || {};
      var handler = handlers[handlerName];
      if (typeof handler === 'function') {
        return handler();
      }
      return { success: true, warning: 'No handler for: ' + stageName };
    };
  }

  if (_isRunning) {
    console.warn('⚠️ Pipeline already running');
    return false;
  }

  if (!_pipeline || _pipeline.length === 0) {
    initializePipeline();
  }

  _isRunning = true;
  _pipelineStatus.status = 'running';
  _pipelineStatus.startedAt = new Date().toISOString();
  _pipelineStatus.currentStage = null;
  _pipelineStatus.completedStages = [];
  _pipelineStatus.failedStage = null;

  var pipelineTrace = startTrace('PIPELINE', 'bootPipeline', null, { startedAt: _pipelineStatus.startedAt });
  _pipelineTraceId = pipelineTrace ? pipelineTrace.traceId : null;

  emitObservation('BOOT_STARTED', 'bootPipeline', null, { startedAt: _pipelineStatus.startedAt });

  console.log('🏗️ Boot Pipeline: Starting execution...');

  for (var i = 0; i < _pipeline.length; i++) {
    var stage = _pipeline[i];
    var stageName = stage.name;

    if (stage.status === 'completed') continue;

    _pipelineStatus.currentStage = stageName;

    emitStageEvent(stageName, 'start');

    var stageTrace = startTrace('STAGE', 'bootPipeline', _pipelineTraceId, { 
      stage: stageName,
      order: stage.order,
      required: stage.required 
    });
    var stageTraceId = stageTrace ? stageTrace.traceId : null;

    emitObservation('BOOT_STAGE_STARTED', 'bootPipeline', stageName, { 
      order: stage.order, 
      required: stage.required,
      traceId: stageTraceId
    });

    console.log('  ➜ Running:', stageName);

    var startTime = Date.now();

    try {
      var result = trackStagePerformance(stageName, function() {
        // 🔥 使用 execFn（确保是函数）
        return execFn(stageName, stage);
      });

      if (result && result.error) {
        throw new Error(result.error);
      }

      stage.status = 'completed';
      stage.result = result || { success: true };
      stage.duration = Date.now() - startTime;
      _pipelineStatus.completedStages.push(stageName);
      _stageResults[stageName] = { success: true, duration: stage.duration };

      emitStageEvent(stageName, 'complete', stage.duration);

      if (stageTraceId) {
        completeTrace(stageTraceId, 'COMPLETED', { duration: stage.duration });
      }

      setMetric('STAGE_DURATION', stage.duration);

      emitObservation('BOOT_STAGE_COMPLETED', 'bootPipeline', stageName, { 
        duration: stage.duration,
        traceId: stageTraceId
      });

      console.log('  ✅ Completed:', stageName, '(' + stage.duration + 'ms)');

    } catch (err) {
      stage.status = 'failed';
      stage.result = { error: err.message };
      stage.duration = Date.now() - startTime;
      _pipelineStatus.failedStage = stageName;
      _pipelineStatus.status = 'failed';
      _stageResults[stageName] = { success: false, error: err.message };

      emitStageEvent(stageName, 'failed', stage.duration, err.message);

      if (stageTraceId) {
        failTrace(stageTraceId, err.message, { duration: stage.duration });
      }

      emitObservation('BOOT_STAGE_FAILED', 'bootPipeline', stageName, { 
        error: err.message, 
        duration: stage.duration,
        traceId: stageTraceId
      });

      console.error('  ❌ Failed:', stageName, '-', err.message);

      if (stage.required) {
        _isRunning = false;
        _pipelineStatus.completedAt = new Date().toISOString();
        
        if (_pipelineTraceId) {
          failTrace(_pipelineTraceId, 'Required stage failed: ' + stageName, { failedStage: stageName });
        }
        
        var start = new Date(_pipelineStatus.startedAt);
        var end = new Date(_pipelineStatus.completedAt);
        var duration = end - start;
        setMetric('PIPELINE_DURATION', duration);
        
        console.log('🏗️ Boot Pipeline: Failed on required stage');
        return false;
      } else {
        console.warn('  ⚠️ Optional stage failed, continuing...');
      }
    }
  }

  _isRunning = false;
  _pipelineStatus.status = 'completed';
  _pipelineStatus.completedAt = new Date().toISOString();

  var start = new Date(_pipelineStatus.startedAt);
  var end = new Date(_pipelineStatus.completedAt);
  _pipelineStatus.totalDuration = end - start;

  if (_pipelineTraceId) {
    completeTrace(_pipelineTraceId, 'COMPLETED', { duration: _pipelineStatus.totalDuration });
  }

  setMetric('PIPELINE_DURATION', _pipelineStatus.totalDuration);

  console.log('🏗️ Boot Pipeline: Completed in', _pipelineStatus.totalDuration + 'ms');

  return true;
}

export function resetPipeline() {
  initializePipeline();
  _isRunning = false;
  _stageResults = {};
  _pipelineTraceId = null;
  console.log('🏗️ Boot Pipeline: Reset');
}

export function getStageResult(stageName) {
  return _stageResults[stageName] || null;
}

// Global mount
if (typeof window !== 'undefined') {
  window.bootPipeline = {
    initializePipeline: initializePipeline,
    getPipeline: getPipeline,
    getStageStatus: getStageStatus,
    getPipelineStatus: getPipelineStatus,
    runPipeline: runPipeline,
    resetPipeline: resetPipeline,
    getStageResult: getStageResult,
    init: function() {
      initializePipeline();
      console.log('⚙️ Boot Pipeline Ready');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.BootPipeline = window.bootPipeline;
  }
}
