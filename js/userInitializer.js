// ===========================================
// userInitializer.js
// 用户初始化器：新用户首次登录时执行（Season 4 Chapter 4 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.UserInitializer = {
    _initialized: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('🚀 UserInitializer ready');

        // 监听用户创建事件
        LawAIApp.EventBus?.on?.('UserCreated', function(user) {
            this.initializeNewUser(user);
        }.bind(this));

        return this;
    },

    initializeNewUser: async function(user) {
        if (!user) return false;
        console.log('[UserInit] Initializing new user profile for ' + user.name);

        try {
            // 1. 分配初始技能
            var defaultSkills = ['AI Basics', 'Learning How to Learn', 'Productivity'];
            for (var i = 0; i < defaultSkills.length; i++) {
                var skillName = defaultSkills[i];
                var skillId = 'skill_' + skillName.toLowerCase().replace(/\s/g, '_');
                if (LawAIApp.SkillApi && typeof LawAIApp.SkillApi.updateMastery === 'function') {
                    await LawAIApp.SkillApi.updateMastery(user.id, skillId, 5);
                }
            }

            // 2. 生成入门课程
            if (LawAIApp.CourseGenerator && typeof LawAIApp.CourseGenerator.generate === 'function') {
                var starterCourse = await LawAIApp.CourseGenerator.generate('AI Basics', 'beginner');
                if (starterCourse && LawAIApp.CourseApi && typeof LawAIApp.CourseApi.createCourse === 'function') {
                    await LawAIApp.CourseApi.createCourse({
                        title: starterCourse.title || 'AI Basics Starter',
                        description: starterCourse.description || 'A gentle introduction to AI concepts.',
                        difficulty: 'beginner',
                        domain: 'AI Basics',
                        createdByAI: true
                    });
                }
            }

            // 3. 创建初始学习路径
            if (LawAIApp.AdaptivePathEngine && typeof LawAIApp.AdaptivePathEngine.getNextBestLesson === 'function') {
                var initialPath = await LawAIApp.AdaptivePathEngine.getNextBestLesson(user.id);
                try {
                    LawAIApp.StorageEngine?.set?.('user_path_' + user.id, initialPath);
                } catch (e) {}
            }

            // 4. 触发新手引导
            if (LawAIApp.OnboardingEngine && typeof LawAIApp.OnboardingEngine.startOnboarding === 'function') {
                LawAIApp.OnboardingEngine.startOnboarding(user);
            }

            LawAIApp.EventBus?.emit?.('UserInitialized', user);
            console.log('[UserInit] User initialization complete for:', user.name);
            return true;

        } catch (err) {
            console.error('[UserInit] Initialization failed:', err);
            return false;
        }
    },

    getStatus: function() {
        return {
            initialized: this._initialized
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.UserInitializer && typeof LawAIApp.UserInitializer.init === 'function') {
        LawAIApp.UserInitializer.init();
    }
}, 300);

console.log('🚀 UserInitializer V2.0 ready');
