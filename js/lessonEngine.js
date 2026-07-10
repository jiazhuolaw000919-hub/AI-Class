// ================================================================
// ENGINE: LessonEngine
// LAYER: Data Layer
// DOMAIN: Lesson Data Management
// RECOVERY STATUS: 🟢 Canon Locked
// VERSION: 1.0.0
// ================================================================
//
// PURPOSE
// ================================================================
//   Owns lesson data generation, retrieval, and management.
//   Provides access to 365 days of structured lesson content.
//   Acts as the single source of truth for all lesson data.
//
// PUBLIC API
// ================================================================
//   getLessonByDay(day)          -> Lesson object | null
//   getAllLessons()              -> Array of 365 Lesson objects
//   createLesson(day)            -> Lesson object
//   generateAllLessons(force)    -> Array of 365 Lesson objects
//   getStatus()                  -> Status object
//
// DEPENDENCIES
// ================================================================
//   - StorageEngine (optional) : For persistent storage
//     If unavailable, lessons are generated in memory.
//     Missing dependency fails gracefully.
//
// STORAGE
// ================================================================
//   - Key: 'allLessons'         : Array of 365 lesson objects
//   - Format: JSON array
//   - Schema version: 1.0.0
//   - Migration: Not required (generated on demand)
//
// EVENTS
// ================================================================
//   - None (read-only engine)
//   - LessonEngine is a data provider, not an event emitter.
//
// FUTURE COMPATIBILITY
// ================================================================
//   - New lesson fields can be added to createLesson()
//   - Existing fields must remain unchanged
//   - getLessonByDay() must always return an object
//   - getAllLessons() must always return an array
//
// ================================================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.LessonEngine = {
    // ============================================================
    // ENGINE METADATA
    // ============================================================
    _engineName: 'LessonEngine',
    _engineVersion: '1.0.0',
    _recoveryStatus: '🟢 Canon Locked',
    _layer: 'Data Layer',
    _domain: 'Lesson Data Management',

    categories: [
        'Foundation', 'Prompt Engineering', 'ChatGPT', 'Claude', 'Gemini',
        'AI Tools', 'Coding', 'GitHub', 'Supabase', 'API',
        'Automation', 'Business', 'Health AI', 'Future Tech'
    ],

    stages: [
        { name: 'Foundation', range: [1, 30] },
        { name: 'Prompt Engineering', range: [31, 70] },
        { name: 'AI Tools', range: [71, 120] },
        { name: 'AI Development', range: [121, 220] },
        { name: 'Projects', range: [221, 300] },
        { name: 'AI Business', range: [301, 365] }
    ],

    // ============================================================
    // PUBLIC API
    // ============================================================

    /**
     * createLesson(day)
     * 
     * Generates a single lesson object for the given day.
     * 
     * @param {number} day - 1 to 365
     * @returns {Object} Lesson object with all fields
     */
    createLesson: function(day) {
        const validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
        const stage = this.stages.find(s => validDay >= s.range[0] && validDay <= s.range[1]);
        const category = this.categories[validDay % this.categories.length] || 'General';
        const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        const difficulty = difficulties[Math.min(Math.floor(validDay / 122), 2)] || 'Beginner';
        const baseXP = 20 + Math.floor(validDay / 5);

        return {
            lessonId: `day-${validDay}`,
            day: validDay,
            title: `Day ${validDay}: ${category} Fundamentals`,
            subtitle: `Deep dive into ${category} concepts`,
            category: category,
            difficulty: difficulty,
            duration: `${Math.floor(Math.random() * 10) + 5} min`,
            estimatedTime: Math.floor(Math.random() * 12) + 5,
            officialArticle: `https://example.com/article/day-${validDay}`,
            officialVideo: `https://example.com/video/day-${validDay}`,
            summary: `Fake summary for day ${validDay}. Learn about ${category}.`,
            notes: [],
            quiz: [
                {
                    question: `What is the core idea of ${category}?`,
                    options: ['Option A', 'Option B', 'Option C'],
                    correct: 0
                },
                {
                    question: `Which tool is NOT used in ${category}?`,
                    options: ['Tool1', 'Tool2', 'Tool3'],
                    correct: 1
                },
                {
                    question: `True or False: ${category} is only for experts.`,
                    options: ['True', 'False'],
                    correct: 1
                }
            ],
            practice: [],
            completed: false,
            completedDate: null,
            reviewLevel: 'Need Review',
            xpReward: baseXP,
            tags: [category.toLowerCase(), difficulty.toLowerCase()],
            futureAIUpdate: {}
        };
    },

    /**
     * getAllLessons()
     * 
     * Returns all 365 lessons. Generates them if not stored.
     * 
     * @returns {Array} Array of 365 lesson objects
     */
    getAllLessons: function() {
        return this.generateAllLessons();
    },

    /**
     * getLessonByDay(day)
     * 
     * Retrieves a single lesson by day number.
     * 
     * @param {number} day - 1 to 365
     * @returns {Object|null} Lesson object or null if not found
     */
    getLessonByDay: function(day) {
        const validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
        const lessons = this.getAllLessons();
        return lessons.find(l => l.day === validDay) || null;
    },

    /**
     * generateAllLessons(force)
     * 
     * Generates or retrieves all 365 lessons.
     * 
     * @param {boolean} force - Force regeneration
     * @returns {Array} Array of 365 lesson objects
     */
    generateAllLessons: function(force) {
        if (force === undefined) force = false;
        
        // 确保 StorageEngine 存在
        if (!LawAIApp.StorageEngine || typeof LawAIApp.StorageEngine.get !== 'function') {
            console.warn('⚠️ StorageEngine not available, generating lessons in memory');
            const lessons = [];
            for (let i = 1; i <= 365; i++) {
                lessons.push(this.createLesson(i));
            }
            return lessons;
        }

        const existing = LawAIApp.StorageEngine.get('allLessons', []);
        if (existing.length === 365 && !force) return existing;

        const lessons = [];
        for (let i = 1; i <= 365; i++) {
            lessons.push(this.createLesson(i));
        }
        LawAIApp.StorageEngine.set('allLessons', lessons);
        return lessons;
    },

    /**
     * getStatus()
     * 
     * Returns engine health and status information.
     * 
     * @returns {Object} Status object
     */
    getStatus: function() {
        return {
            name: this._engineName,
            version: this._engineVersion,
            recoveryStatus: this._recoveryStatus,
            layer: this._layer,
            domain: this._domain,
            totalLessons: 365,
            categories: this.categories.length,
            storageAvailable: !!(LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function')
        };
    }
};

// ================================================================
// AUTO-INITIALIZATION
// ================================================================

if (window.LawAIApp && !window.LawAIApp.LessonEngine) {
    window.LawAIApp.LessonEngine = LawAIApp.LessonEngine;
}

console.log('📚 LessonEngine loaded');
