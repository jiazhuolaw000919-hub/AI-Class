// js/experience/experienceContract.js
// Part 125: Learning Experience Foundation

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceContract = {
    ACTIVITY_TYPES: {
        READING: 'READING',
        VIDEO: 'VIDEO',
        PRACTICE: 'PRACTICE',
        QUIZ: 'QUIZ',
        FLASHCARD: 'FLASHCARD',
        RECALL: 'RECALL',
        REFLECTION: 'REFLECTION'
    },

    ACTIVITY_STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        SKIPPED: 'skipped',
        FAILED: 'failed'
    },

    /**
     * 标准化 Experience 结构
     */
    createExperience: function(lessonId, activities) {
        return {
            lessonId: lessonId,
            activities: activities || [],
            version: '1.0.0'
        };
    },

    /**
     * 创建 Activity
     */
    createActivity: function(type, data) {
        return {
            id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            type: type,
            order: data.order || 0,
            title: data.title || '',
            content: data.content || '',
            metadata: data.metadata || {},
            status: this.ACTIVITY_STATUS.PENDING,
            startedAt: null,
            completedAt: null,
            duration: 0
        };
    },

    /**
     * 创建 Learning Signal
     */
    createSignal: function(activityId, lessonId, signalType, payload) {
        return {
            id: 'sig_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            activityId: activityId,
            lessonId: lessonId,
            type: signalType,
            payload: payload || {},
            timestamp: new Date().toISOString(),
            source: 'experience'
        };
    },

    /**
     * 验证 Experience 结构
     */
    validateExperience: function(experience) {
        if (!experience || !experience.lessonId) {
            return { valid: false, errors: ['Missing lessonId'] };
        }
        if (!Array.isArray(experience.activities)) {
            return { valid: false, errors: ['Activities must be an array'] };
        }
        var errors = [];
        experience.activities.forEach(function(activity, index) {
            if (!activity.id) errors.push('Activity ' + index + ' missing id');
            if (!activity.type) errors.push('Activity ' + index + ' missing type');
            if (!Object.values(this.ACTIVITY_TYPES).includes(activity.type)) {
                errors.push('Activity ' + index + ' invalid type: ' + activity.type);
            }
        }.bind(this));
        return { valid: errors.length === 0, errors: errors };
    },

    // ============================================================
    // PART 126: Experience Runtime
    // ============================================================

    /**
     * 从 Lesson 构建 Experience
     * @param {Object} lesson - Lesson 对象
     * @param {Object} options - 配置选项
     * @returns {Object} Experience 对象
     */
    buildExperience: function(lesson, options) {
        options = options || {};
    
        if (!lesson) {
            return this._createEmptyExperience(null, 'Lesson not found');
        }
    
        var lessonId = lesson.lessonId || lesson.id;
        var activities = this._extractActivities(lesson);
    
        // 验证和排序
        var validated = this._validateActivities(activities);
        var sorted = this._sortActivities(validated);
    
        return {
            lessonId: lessonId,
            status: sorted.length > 0 ? 'READY' : 'EMPTY',
            activities: sorted,
            metadata: {
                total: sorted.length,
                valid: validated.length,
                invalid: activities.length - validated.length,
                lessonTitle: lesson.title || lessonId,
                source: options.source || 'lesson',
                generatedAt: new Date().toISOString()
            }
        };
    },

    /**
     * 从 Lesson 提取 Activities
     */
    _extractActivities: function(lesson) {
        var activities = [];
    
        // 1. 如果有 experience 字段 (新格式)
        if (lesson.experience && Array.isArray(lesson.experience)) {
            return lesson.experience;
        }    
    
        // 2. 如果有 activities 字段
        if (lesson.activities && Array.isArray(lesson.activities)) {
            return lesson.activities;
        }
    
        // 3. 从 lesson 各部分构建 Activities
        var lessonId = lesson.lessonId || lesson.id || 'unknown';
        var order = 0;
    
        // Reading (主内容)
        if (lesson.summary || lesson.content || lesson.description) {
            activities.push({
                id: lessonId + ':reading',
                type: 'READING',
                order: order++,
                title: 'Read',
                content: lesson.summary || lesson.description || 'Lesson content.',
                metadata: { lessonId: lessonId }
            });
        }
    
        // Video
        if (lesson.officialVideo && lesson.officialVideo !== 'https://example.com/video/day-' + (lesson.day || 0)) {
            activities.push({
                id: lessonId + ':video',
                type: 'VIDEO',
                order: order++,
                title: 'Watch',
                content: lesson.officialVideo,
                metadata: { lessonId: lessonId, url: lesson.officialVideo }
            });
        }
    
        // Reflection
        activities.push({
            id: lessonId + ':reflection',
            type: 'REFLECTION',
            order: order++,
            title: 'Reflect',
            metadata: { lessonId: lessonId }
        });
    
        // Practice
        activities.push({
            id: lessonId + ':practice',
            type: 'PRACTICE',
            order: order++,
            title: 'Practice',
            metadata: { lessonId: lessonId }
        });    
    
        // Quiz
        if (lesson.quiz && lesson.quiz.length > 0) {
            activities.push({
                id: lessonId + ':quiz',
                type: 'QUIZ',
                order: order++,
                title: 'Quiz',
                metadata: { lessonId: lessonId, questions: lesson.quiz }
            });
        }
    
        return activities;
    },    

    /**
     * 验证 Activities
     */
    _validateActivities: function(activities) {
        if (!activities || !Array.isArray(activities)) return [];
    
        var valid = [];
        var seenIds = {};
    
        for (var i = 0; i < activities.length; i++) {
             var activity = activities[i];
        
            // 必须有 ID
            if (!activity.id) {
                console.warn('[ExperienceContract] Activity missing id:', activity);
                continue;
            }
        
            // 必须有 type
            if (!activity.type) {
                console.warn('[ExperienceContract] Activity missing type:', activity.id);
                continue;
            }
        
            // 检查重复 ID
            if (seenIds[activity.id]) {
                console.warn('[ExperienceContract] Duplicate activity id:', activity.id);
                continue;
            }
            seenIds[activity.id] = true;
        
            valid.push(activity);
        }
    
        return valid;
    },

    /**
     * 排序 Activities
     */
    _sortActivities: function(activities) {
        return activities.slice().sort(function(a, b) {
            var orderA = a.order !== undefined ? a.order : 999;
            var orderB = b.order !== undefined ? b.order : 999;
            return orderA - orderB;
        });
    },

    /**
     * 创建空 Experience
     */
    _createEmptyExperience: function(lessonId, reason) {
        return {
            lessonId: lessonId || 'unknown',
            status: 'EMPTY',
            activities: [],
            metadata: {
                total: 0,
                valid: 0,
                invalid: 0,
                reason: reason || 'No activities available',
                generatedAt: new Date().toISOString()
            }
        };
    },
};
