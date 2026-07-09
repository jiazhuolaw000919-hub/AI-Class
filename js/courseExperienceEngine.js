// ===========================================
// courseExperienceEngine.js
// 课程体验引擎：任务、练习、挑战、反思（Season 4 Chapter 5 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.CourseExperienceEngine = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🎓 CourseExperienceEngine initialized');
        return this;
    },

    startCourse: async function(userId, courseId) {
        console.log('🎓 Starting course experience for user:', userId, 'course:', courseId);

        var missions = [];
        try {
            missions = LawAIApp.StorageEngine?.get?.('missions_' + courseId) || [];
        } catch (e) {}

        if (!missions || missions.length === 0) {
            missions = this._generateMissions(courseId);
            try {
                LawAIApp.StorageEngine?.set?.('missions_' + courseId, missions);
            } catch (e) {}
        }

        var currentMission = null;
        for (var i = 0; i < missions.length; i++) {
            if (!missions[i].completed) {
                currentMission = missions[i];
                break;
            }
        }

        if (!currentMission) {
            console.log('🎓 All missions completed!');
            return { status: 'completed', missions: missions };
        }

        var practice = null;
        if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.startPractice === 'function') {
            practice = LawAIApp.PracticeEngine.startPractice(currentMission.title, 'mini_exercise');
        }

        var challenge = null;
        if (LawAIApp.ChallengeSystem && typeof LawAIApp.ChallengeSystem.generateChallenge === 'function') {
            challenge = LawAIApp.ChallengeSystem.generateChallenge(currentMission);
        }

        return {
            mission: currentMission,
            practice: practice,
            challenge: challenge,
            progress: {
                completed: missions.filter(function(m) { return m.completed; }).length,
                total: missions.length
            }
        };
    },

    _generateMissions: function(courseId) {
        var missions = [];
        var titles = ['Introduction', 'Core Concepts', 'Practical Application', 'Advanced Topics', 'Final Project'];
        for (var i = 0; i < titles.length; i++) {
            missions.push({
                id: 'mission_' + courseId + '_' + i,
                title: titles[i] + ' (Course ' + courseId + ')',
                completed: false,
                order: i,
                estimatedTime: 15 + i * 5
            });
        }
        return missions;
    },

    completeMissionAndAdvance: async function(userId, courseId, missionId, reflection) {
        console.log('🎓 Completing mission:', missionId);

        var missions = [];
        try {
            missions = LawAIApp.StorageEngine?.get?.('missions_' + courseId) || [];
        } catch (e) {}

        var found = false;
        for (var i = 0; i < missions.length; i++) {
            if (missions[i].id === missionId) {
                missions[i].completed = true;
                found = true;
                break;
            }
        }

        if (!found) {
            return { error: 'Mission not found' };
        }

        try {
            LawAIApp.StorageEngine?.set?.('missions_' + courseId, missions);
        } catch (e) {}

        // 保存反思
        if (reflection) {
            if (LawAIApp.ReflectionEngine && typeof LawAIApp.ReflectionEngine.saveReflection === 'function') {
                LawAIApp.ReflectionEngine.saveReflection(userId, missionId, reflection);
            }
        }

        // 获取下一个任务
        var nextMission = null;
        for (var j = 0; j < missions.length; j++) {
            if (!missions[j].completed) {
                nextMission = missions[j];
                break;
            }
        }

        if (nextMission) {
            LawAIApp.EventBus?.emit?.('NextMissionUnlocked', { courseId: courseId, mission: nextMission });
        } else {
            LawAIApp.EventBus?.emit?.('CourseCompleted', { courseId: courseId, userId: userId });
        }

        return {
            nextMission: nextMission,
            allCompleted: !nextMission
        };
    },

    getCourseProgress: function(courseId) {
        var missions = [];
        try {
            missions = LawAIApp.StorageEngine?.get?.('missions_' + courseId) || [];
        } catch (e) {}

        var completed = missions.filter(function(m) { return m.completed; }).length;
        return {
            courseId: courseId,
            completed: completed,
            total: missions.length,
            percent: missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0,
            missions: missions
        };
    },

    getStatus: function() {
        return {
            initialized: this._initialized
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.CourseExperienceEngine && typeof LawAIApp.CourseExperienceEngine.init === 'function') {
        LawAIApp.CourseExperienceEngine.init();
    }
}, 400);

console.log('🎓 CourseExperienceEngine V2.0 ready');
