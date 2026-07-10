// ================================================================
// ENGINE: ReflectionEngine
// LAYER: Core Logic Layer
// DOMAIN: Reflection & Metacognition
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Captures and stores learner reflections on lessons.
//   Supports metacognitive learning by encouraging learners
//   to articulate what they've learned. Implements the
//   "Reflect" phase of the Learning Loop.
//
// PUBLIC API
// ================================================================
//   saveReflection(userId, lessonId, reflection) -> void
//   getReflections(userId)                       -> array
//   getReflectionsByLesson(userId, lessonId)     -> array
//   getStatus()                                  -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (required) : For persistent storage
//   - EventBus (optional)     : For emitting events
//
// STORAGE
// ================================================================
//   - Key: 'lawai_reflections_{userId}'
//   - Format: JSON array of reflection objects
//   - Schema: { lessonId, reflection, date }
//
// EVENTS
// ================================================================
//   EMITTED:
//   - 'ReflectionSaved' : When a reflection is saved
//     Payload: { userId, lessonId }
//
// FUTURE COMPATIBILITY
// ================================================================
//   - Reflections can be used for journaling features
//   - Can be integrated with AI for personalized feedback
//   - Can be exported as learning journal
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ReflectionEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'ReflectionEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Core Logic Layer',
    _domain: 'Reflection & Metacognition',

    // ============================================================
    // PUBLIC API
    // ============================================================

    /**
     * saveReflection(userId, lessonId, reflection)
     * 
     * Saves a learner's reflection for a specific lesson.
     * 
     * @param {string} userId - User identifier
     * @param {string} lessonId - Lesson identifier (e.g., 'day-1')
     * @param {string} reflection - Reflection text
     */
    saveReflection: function(userId, lessonId, reflection) {
        if (!userId || !lessonId || !reflection) {
            console.warn('⚠️ ReflectionEngine: Missing required fields');
            return;
        }

        var key = 'reflections_' + userId;
        var reflections = LawAIApp.StorageEngine.get(key, []);
        reflections.push({
            lessonId: lessonId,
            reflection: reflection,
            date: new Date().toISOString()
        });
        LawAIApp.StorageEngine.set(key, reflections);

        LawAIApp.EventBus?.emit?.('ReflectionSaved', { userId: userId, lessonId: lessonId });
        console.log('💭 Reflection saved for', lessonId);
    },

    /**
     * getReflections(userId)
     * 
     * Gets all reflections for a user.
     * 
     * @param {string} userId - User identifier
     * @returns {Array} Array of reflection objects
     */
    getReflections: function(userId) {
        if (!userId) return [];
        var key = 'reflections_' + userId;
        return LawAIApp.StorageEngine.get(key, []);
    },

    /**
     * getReflectionsByLesson(userId, lessonId)
     * 
     * Gets reflections for a specific lesson.
     * 
     * @param {string} userId - User identifier
     * @param {string} lessonId - Lesson identifier
     * @returns {Array} Array of reflection objects
     */
    getReflectionsByLesson: function(userId, lessonId) {
        if (!userId || !lessonId) return [];
        var all = this.getReflections(userId);
        return all.filter(function(r) { return r.lessonId === lessonId; });
    },

    /**
     * getStatus()
     * 
     * Returns engine health and status information.
     * 
     * @returns {Object} Status object
     */
    getStatus: function() {
        var userId = 'default';
        var reflections = this.getReflections(userId);
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            totalReflections: reflections.length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function'),
            eventBusAvailable: !!(LawAIApp.EventBus && typeof LawAIApp.EventBus.emit === 'function')
        };
    }
};

console.log('💭 ReflectionEngine V1.0 ready');
