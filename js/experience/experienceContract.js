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
    }
};
