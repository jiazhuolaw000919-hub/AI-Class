// eventRegistry.js
LawAIApp.EventRegistry = (function() {
  const subscribers = {}; // eventType -> Set of callbacks

  const validTypes = new Set([
    'LessonOpened','LessonStarted','LessonPaused','LessonResumed','LessonCompleted',
    'QuizStarted','QuizCompleted','PracticeStarted','PracticeCompleted',
    'BookmarkAdded','FavoriteAdded','ReviewCreated','SecondBrainCreated',
    'SessionCreated','SessionRecovered','CacheUpdated','StorageSaved',
    'ProgressUpdated','StatisticsUpdated','ReviewGenerated',
    'PackLoaded','PackFailed','SyncStarted','SyncCompleted','Online','Offline',
    'stateChanged','lessonLoaded','lessonLoadError','sessionStarted',
    // 🔥 Part 128: Reading 事件
    'READING_STARTED','READING_PROGRESS','READING_COMPLETED','READING_SECTION_VIEWED',
    'READING_EXITED','ACTIVITY_RESOLVED','ACTIVITY_VALIDATED','ACTIVITY_INITIALIZED',
    'ACTIVITY_OPENED','ACTIVITY_STARTED','ACTIVITY_PROGRESS','ACTIVITY_INTERACTION',
    'ACTIVITY_COMPLETED','ACTIVITY_SKIPPED','ACTIVITY_FAILED','ACTIVITY_UNMOUNTED',
    'RESPONSE_SELECTED','ACTIVITY_SUBMITTED','ACTIVITY_EVALUATED',
    // 🔥 Part 130: Attempt 事件
    'ATTEMPT_STARTED','ATTEMPT_SUBMITTED','ATTEMPT_EVALUATED','ATTEMPT_COMPLETED'
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
