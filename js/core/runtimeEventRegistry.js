/**
 * Runtime Event Registry
 * Runtime Event Definition Manager
 * Part 44.2 - Runtime Event Registry Implementation
 */

// ============================================================
// EVENT REGISTRY STORE
// ============================================================

var _events = {};
var _eventIds = [];
var _isInitialized = false;

// ============================================================
// EVENT CATEGORIES
// ============================================================

export const EVENT_CATEGORIES = [
  'LIFECYCLE',
  'MODULE',
  'USER',
  'STATE',
  'SYSTEM',
  'SECURITY',
  'AI',
  'HEALTH'
];

// ============================================================
// DEFAULT EVENTS
// ============================================================

var DEFAULT_EVENTS = [
  {
    id: 'runtime.boot.start',
    name: 'Boot Start',
    category: 'LIFECYCLE',
    source: 'BootManager',
    description: 'Runtime boot process started',
    enabled: true
  },
  {
    id: 'runtime.boot.complete',
    name: 'Boot Complete',
    category: 'LIFECYCLE',
    source: 'BootManager',
    description: 'Runtime boot process completed',
    enabled: true
  },
  {
    id: 'runtime.module.loaded',
    name: 'Module Loaded',
    category: 'MODULE',
    source: 'Runtime',
    description: 'Module loaded successfully',
    enabled: true
  },
  {
    id: 'runtime.module.failed',
    name: 'Module Failed',
    category: 'MODULE',
    source: 'Runtime',
    description: 'Module load failed',
    enabled: true
  },
  {
    id: 'runtime.module.ready',
    name: 'Module Ready',
    category: 'MODULE',
    source: 'Runtime',
    description: 'Module is ready',
    enabled: true
  },
  {
    id: 'learning.lesson.completed',
    name: 'Lesson Completed',
    category: 'USER',
    source: 'LearningEngine',
    description: 'Lesson completed by user',
    enabled: true
  },
  {
    id: 'runtime.state.changed',
    name: 'State Changed',
    category: 'STATE',
    source: 'Runtime',
    description: 'Runtime state changed',
    enabled: true
  }
];

// ============================================================
// VALIDATION
// ============================================================

export function validateEvent(event) {
  var errors = [];

  if (!event) {
    errors.push('Event is null or undefined');
    return errors;
  }

  // Required: id
  if (!event.id || typeof event.id !== 'string' || event.id.trim() === '') {
    errors.push('Missing or invalid id');
  }

  // Required: name
  if (!event.name || typeof event.name !== 'string' || event.name.trim() === '') {
    errors.push('Missing or invalid name');
  }

  // Required: category
  if (!event.category || EVENT_CATEGORIES.indexOf(event.category) === -1) {
    errors.push('Invalid category: "' + event.category + '" (must be one of: ' + EVENT_CATEGORIES.join(', ') + ')');
  }

  // Required: source
  if (!event.source || typeof event.source !== 'string' || event.source.trim() === '') {
    errors.push('Missing or invalid source');
  }

  // Optional: description
  if (event.description && typeof event.description !== 'string') {
    errors.push('Description must be a string');
  }

  // Optional: enabled
  if (event.enabled !== undefined && typeof event.enabled !== 'boolean') {
    errors.push('Enabled must be a boolean');
  }

  return errors;
}

// ============================================================
// REGISTRY API
// ============================================================

export function register(event) {
  var errors = validateEvent(event);
  if (errors.length > 0) {
    console.warn('[Event Registry] Registration failed:', errors.join('; '));
    return { success: false, errors: errors };
  }

  // Check for duplicate
  if (_events[event.id]) {
    console.warn('[Event Registry] Duplicate event, registration rejected:', event.id);
    return { success: false, errors: ['Duplicate event: ' + event.id] };
  }

  // Store event
  _events[event.id] = {
    id: event.id,
    name: event.name,
    category: event.category,
    source: event.source,
    description: event.description || '',
    enabled: event.enabled !== undefined ? event.enabled : true,
    registeredAt: new Date().toISOString()
  };

  _eventIds.push(event.id);

  if (isDebugMode()) {
    console.log('[Event Registry] Event Registered:', event.id);
  }

  return { success: true, event: _events[event.id] };
}

export function get(eventId) {
  return _events[eventId] || null;
}

export function getAll() {
  var result = [];
  for (var i = 0; i < _eventIds.length; i++) {
    result.push(_events[_eventIds[i]]);
  }
  return result;
}

export function getEnabled() {
  var result = [];
  for (var i = 0; i < _eventIds.length; i++) {
    var e = _events[_eventIds[i]];
    if (e.enabled) {
      result.push(e);
    }
  }
  return result;
}

export function getByCategory(category) {
  var result = [];
  for (var i = 0; i < _eventIds.length; i++) {
    var e = _events[_eventIds[i]];
    if (e.category === category) {
      result.push(e);
    }
  }
  return result;
}

export function getBySource(source) {
  var result = [];
  for (var i = 0; i < _eventIds.length; i++) {
    var e = _events[_eventIds[i]];
    if (e.source === source) {
      result.push(e);
    }
  }
  return result;
}

export function remove(eventId) {
  if (!_events[eventId]) {
    console.warn('[Event Registry] Event not found for removal:', eventId);
    return false;
  }

  delete _events[eventId];
  var index = _eventIds.indexOf(eventId);
  if (index !== -1) {
    _eventIds.splice(index, 1);
  }

  if (isDebugMode()) {
    console.log('[Event Registry] Event Removed:', eventId);
  }

  return true;
}

export function isRegistered(eventId) {
  return !!_events[eventId];
}

export function isEnabled(eventId) {
  var event = _events[eventId];
  return event ? event.enabled : false;
}

export function count() {
  return _eventIds.length;
}

export function getCategories() {
  return EVENT_CATEGORIES.slice();
}

export function clear() {
  _events = {};
  _eventIds = [];
  if (isDebugMode()) {
    console.log('[Event Registry] Registry cleared');
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

function isDebugMode() {
  try {
    var manifest = LawAIApp.RuntimePerformanceManifest || window.runtimePerformanceManifest;
    if (manifest && typeof manifest.isDebugMode === 'function') {
      return manifest.isDebugMode();
    }
  } catch (e) { /* ignore */ }
  return false;
}

export function initRegistry() {
  if (_isInitialized) {
    return { success: true, status: 'already_initialized' };
  }

  // Register default events
  var registeredCount = 0;
  for (var i = 0; i < DEFAULT_EVENTS.length; i++) {
    var result = register(DEFAULT_EVENTS[i]);
    if (result.success) {
      registeredCount++;
    }
  }

  _isInitialized = true;

  if (isDebugMode()) {
    console.log('[Event Registry] Default events registered:', registeredCount);
  }

  return {
    success: true,
    registered: registeredCount,
    total: DEFAULT_EVENTS.length
  };
}

// ============================================================
// GLOBAL MOUNT
// ============================================================

if (typeof window !== 'undefined') {
  window.runtimeEventRegistry = {
    EVENT_CATEGORIES: EVENT_CATEGORIES,
    register: register,
    get: get,
    getAll: getAll,
    getEnabled: getEnabled,
    getByCategory: getByCategory,
    getBySource: getBySource,
    remove: remove,
    isRegistered: isRegistered,
    isEnabled: isEnabled,
    count: count,
    getCategories: getCategories,
    clear: clear,
    validateEvent: validateEvent,
    init: function() {
      var result = initRegistry();
      console.log('✅ RuntimeEventRegistry ready (' + result.registered + ' events registered)');
      return this;
    }
  };

  if (typeof LawAIApp !== 'undefined' && LawAIApp) {
    LawAIApp.RuntimeEventRegistry = window.runtimeEventRegistry;
  }
}
