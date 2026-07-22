/**
 * Boot Pipeline
 * Central boot execution pipeline.
 * Read only controller.
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

export function runPipeline(executorFn) {
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

  console.log('🏗️ Boot Pipeline: Starting execution...');

  for (var i = 0; i < _pipeline.length; i++) {
    var stage = _pipeline[i];
    var stageName = stage.name;

    if (stage.status === 'completed') continue;

    _pipelineStatus.currentStage = stageName;
    console.log('  ➜ Running:', stageName);

    var startTime = Date.now();

    try {
      var result = executorFn(stageName, stage);

      if (result && result.error) {
        throw new Error(result.error);
      }

      stage.status = 'completed';
      stage.result = result || { success: true };
      stage.duration = Date.now() - startTime;
      _pipelineStatus.completedStages.push(stageName);
      _stageResults[stageName] = { success: true, duration: stage.duration };

      console.log('  ✅ Completed:', stageName, '(' + stage.duration + 'ms)');

    } catch (err) {
      stage.status = 'failed';
      stage.result = { error: err.message };
      stage.duration = Date.now() - startTime;
      _pipelineStatus.failedStage = stageName;
      _pipelineStatus.status = 'failed';
      _stageResults[stageName] = { success: false, error: err.message };

      console.error('  ❌ Failed:', stageName, '-', err.message);

      if (stage.required) {
        _isRunning = false;
        _pipelineStatus.completedAt = new Date().toISOString();
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

  console.log('🏗️ Boot Pipeline: Completed in', _pipelineStatus.totalDuration + 'ms');

  return true;
}

export function resetPipeline() {
  initializePipeline();
  _isRunning = false;
  _stageResults = {};
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
