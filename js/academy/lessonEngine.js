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
//   getS4Lesson(lessonId)        -> Promise<Object|null>
//   hasS4Lesson(lessonId)        -> Promise<boolean>
//   getS4Practice(lessonId)      -> Promise<Array>
//   getS4Flashcards(lessonId)    -> Promise<Array>
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

    // ============================================================
    // 🔥 Fallback: 仅在没有任何真实 lesson 时使用
    // Bible Part 66: 不造假，所以这里用明确标注的 "template"
    // ============================================================
    createLesson: function(day) {
        var validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
        var stage = this.stages.find(function(s) {
            return validDay >= s.range[0] && validDay <= s.range[1];
        });
        var category = this.categories[validDay % this.categories.length] || 'General';
        var difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        var difficulty = difficulties[Math.min(Math.floor(validDay / 122), 2)] || 'Beginner';
        var baseXP = 20 + Math.floor(validDay / 5);
    },

    /**
     * getAllLessons()
     * 
     * 🔥 Season 5: 优先返回真实 S4 lessons，不再生成 365 个假 lesson
     * Fallback: 如果没有真实 lessons，才用 generateAllLessons()
     * 
     * @returns {Array} Array of lesson objects
     */
    getAllLessons: function() {
      // 1. 优先从 SubjectRegistry 读
      try {
        var sr = LawAIApp.SubjectRegistry;
        if (sr && typeof sr.getAllSubjects === 'function') {
          var subjects = sr.getAllSubjects() || [];
          var collected = [];
          subjects.forEach(function(subj) {
            // 🔥 从这个 subject 的 title 生成 skill tags
            var subjectTags = [];
            if (subj.title) {
              // title 拆词 + 小写
              var titleLower = String(subj.title).toLowerCase();
              subjectTags.push(titleLower);
    
              // 也加 subject id 的最后一段
              var idParts = String(subj.id).split('-');
              if (idParts.length > 2) {
                var lastPart = idParts.slice(2).join(' ');
                if (lastPart) subjectTags.push(lastPart);
              }
            }
    
            (subj.lessons || []).forEach(function(l) {
              if (typeof l === 'string') {
                collected.push({
                  lessonId: l,
                  id: l,
                  title: l,
                  tags: subjectTags.slice(),  // 🔥 从 subject 继承 tags
                  subjectId: subj.id,
                  subjectTitle: subj.title,
                  courseId: subj.courseId
                });
              } else if (l) {
                collected.push({
                  lessonId: l.id || l.lessonId,
                  id: l.id || l.lessonId,
                  title: l.title || l.name || 'Untitled',
                  tags: (l.tags && l.tags.length > 0) ? l.tags : subjectTags.slice(),
                  subjectId: subj.id,
                  subjectTitle: subj.title,
                  courseId: subj.courseId,
                  difficulty: l.difficulty
                });
              }
            });
          });
          if (collected.length > 0) return collected;
        }
      } catch (e) {}
    
      return this.generateAllLessons();
    },
    
    getLessonByDay: function(day) {
        var validDay = typeof day === 'number' && !isNaN(day) ? day : 1;
        var lessons = this.getAllLessons();
        
        // 1. 按 day 字段找
        var found = lessons.find(function(l) { return l.day === validDay; });
        if (found) return found;
        
        // 2. 按 lessonId 里含 day 找（如 day-1）
        var dayKey = 'day-' + validDay;
        found = lessons.find(function(l) {
            var id = String(l.id || l.lessonId || '');
            return id === dayKey || id.indexOf(dayKey) !== -1;
        });
        if (found) return found;
        
        // 3. 按顺序取第 validDay 个
        if (validDay > 0 && validDay <= lessons.length) {
            return lessons[validDay - 1];
        }
        
        return null;
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
            var lessons = [];
            for (var i = 1; i <= 365; i++) {
                lessons.push(this.createLesson(i));
            }
            return lessons;
        }

        var existing = LawAIApp.StorageEngine.get('allLessons', []);
        if (existing.length === 365 && !force) return existing;

        var lessons = [];
        for (var i = 1; i <= 365; i++) {
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
    },

    // ============================================================
    // ═══ S4 兼容方法 (Part 33) ═══
    // ============================================================

    /**
     * 通过 S4 Lesson ID 获取 Lesson
     * @param {string} lessonId - S4 Lesson ID (如 lesson-ai-fundamentals-001)
     * @returns {Promise<Object|null>} Lesson 对象
     */
    getS4Lesson: function(lessonId) {
        var self = this;
        return new Promise(function(resolve) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            if (!loader) {
                console.warn('[LessonEngine] ContentLoader not available');
                resolve(null);
                return;
            }

            try {
                var result = loader.getLessonManifest(lessonId);
                if (result && typeof result.then === 'function') {
                    result.then(function(lesson) {
                        if (lesson) {
                            resolve({
                                lessonId: lesson.id,
                                title: lesson.title,
                                subjectId: lesson.subjectId,
                                courseId: lesson.courseId,
                                difficulty: lesson.difficulty,
                                estimatedMinutes: lesson.estimatedMinutes,
                                hasVideo: lesson.hasVideo || false,
                                hasPractice: lesson.hasPractice || false,
                                hasFlashcards: lesson.hasFlashcards || false,
                                hasNotes: lesson.hasNotes || false,
                                hasAITools: lesson.hasAITools || false,
                                day: parseInt(lesson.id.split('-').pop()) || 0,
                                category: lesson.tags ? lesson.tags[0] || 'General' : 'General'
                            });
                        } else {
                            resolve(null);
                        }
                    }).catch(function(e) {
                        console.warn('[LessonEngine] Failed to get S4 lesson:', lessonId, e);
                        resolve(null);
                    });
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.warn('[LessonEngine] Error getting S4 lesson:', lessonId, e);
                resolve(null);
            }
        });
    },

    /**
     * 检查 Lesson 是否存在（S4 兼容）
     * @param {string} lessonId - Lesson ID
     * @returns {Promise<boolean>}
     */
    hasS4Lesson: function(lessonId) {
        return new Promise(function(resolve) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            if (!loader) {
                resolve(false);
                return;
            }
            try {
                var result = loader.hasLesson(lessonId);
                if (result && typeof result.then === 'function') {
                    result.then(resolve).catch(function() { resolve(false); });
                } else {
                    resolve(false);
                }
            } catch (e) {
                resolve(false);
            }
        });
    },

    /**
     * 获取 Lesson 的 Practice 问题（S4 兼容）
     * @param {string} lessonId - Lesson ID
     * @returns {Promise<Array>}
     */
    getS4Practice: function(lessonId) {
        return new Promise(function(resolve) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            if (!loader) {
                resolve([]);
                return;
            }
            try {
                var result = loader.getPracticeQuestions(lessonId);
                if (result && typeof result.then === 'function') {
                    result.then(function(practiceData) {
                        resolve(practiceData.questions || []);
                    }).catch(function() { resolve([]); });
                } else {
                    resolve([]);
                }
            } catch (e) {
                resolve([]);
            }
        });
    },

    /**
     * 获取 Lesson 的 Flashcards（S4 兼容）
     * @param {string} lessonId - Lesson ID
     * @returns {Promise<Array>}
     */
    getS4Flashcards: function(lessonId) {
        return new Promise(function(resolve) {
            var loader = window.LawAIApp && (window.LawAIApp.S4ContentLoader || window.LawAIApp.ContentLoader);
            if (!loader) {
                resolve([]);
                return;
            }
            try {
                var result = loader.getLessonAssets(lessonId);
                if (result && typeof result.then === 'function') {
                    result.then(function(assets) {
                        resolve(assets.assets && assets.assets.flashcards || []);
                    }).catch(function() { resolve([]); });
                } else {
                    resolve([]);
                }
            } catch (e) {
                resolve([]);
            }
        });
    }
};

// ================================================================
// AUTO-INITIALIZATION
// ================================================================

if (window.LawAIApp && !window.LawAIApp.LessonEngine) {
    window.LawAIApp.LessonEngine = LawAIApp.LessonEngine;
}

console.log('📚 LessonEngine loaded');
