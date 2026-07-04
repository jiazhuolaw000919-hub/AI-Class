// eventRegistry.js
LawAIApp.EventRegistry = (function() {
  const subscribers = {}; // eventType -> Set of callbacks

  // 注册事件类型（可选，用于验证）
  const validTypes = new Set([
    'LessonOpened','LessonStarted','LessonPaused','LessonResumed','LessonCompleted',
    'QuizStarted','QuizCompleted','PracticeStarted','PracticeCompleted',
    'BookmarkAdded','FavoriteAdded','ReviewCreated','SecondBrainCreated',
    'SessionCreated','SessionRecovered','CacheUpdated','StorageSaved',
    'ProgressUpdated','StatisticsUpdated','ReviewGenerated',
    'PackLoaded','PackFailed','SyncStarted','SyncCompleted','Online','Offline',
    'stateChanged','lessonLoaded','lessonLoadError','sessionStarted'
  ]);

  function registerType(eventType) {
    validTypes.add(eventType);
  }

  function isValidType(eventType) {
    return validTypes.has(eventType);
  }

  function subscribe(eventType, callback) {
    if (!subscribers[eventType]) subscribers[eventType] = new Set();
    subscribers[eventType].add(callback);
  }

  function unsubscribe(eventType, callback) {
    if (subscribers[eventType]) subscribers[eventType].delete(callback);
  }

  function getSubscribers(eventType) {
    return subscribers[eventType] ? Array.from(subscribers[eventType]) : [];
  }

  return { subscribe, unsubscribe, getSubscribers, registerType, isValidType };
})();
