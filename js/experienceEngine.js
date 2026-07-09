// ===========================================
// experienceEngine.js
// 签名体验引擎 - 品牌个性与情感体验（Phase 57 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ExperienceEngine = {
    _initialized: false,
    _experienceLevel: 0,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;

        // 监听关键事件，累积体验分数
        LawAIApp.EventBus?.on?.('LessonCompleted', function() {
            this._addExperience(5);
        }.bind(this));

        LawAIApp.EventBus?.on?.('PracticeCompleted', function(data) {
            this._addExperience(data?.correct ? 3 : 1);
        }.bind(this));

        LawAIApp.EventBus?.on?.('ProjectFinished', function() {
            this._addExperience(15);
        }.bind(this));

        LawAIApp.EventBus?.on?.('LevelUp', function() {
            this._addExperience(10);
        }.bind(this));

        console.log('✨ ExperienceEngine initialized');
    },

    _addExperience: function(amount) {
        this._experienceLevel = (this._experienceLevel || 0) + amount;
        if (this._experienceLevel > 1000) this._experienceLevel = 1000;
        this._safeSet('experience_level', this._experienceLevel);

        // 检查里程碑
        this._checkMilestones();
    },

    _checkMilestones: function() {
        var milestones = [100, 250, 500, 750, 1000];
        for (var i = 0; i < milestones.length; i++) {
            if (this._experienceLevel >= milestones[i]) {
                LawAIApp.EventBus?.emit?.('ExperienceMilestone', { level: this._experienceLevel, milestone: milestones[i] });
            }
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    getExperienceLevel: function() {
        if (!this._experienceLevel) {
            this._experienceLevel = this._safeGet('experience_level', 0);
        }
        return this._experienceLevel || 0;
    },

    getExperienceProgress: function() {
        var level = this.getExperienceLevel();
        var nextMilestone = [100, 250, 500, 750, 1000].find(function(m) { return m > level; }) || 1000;
        var prevMilestone = [0, 100, 250, 500, 750].slice().reverse().find(function(m) { return m <= level; }) || 0;
        var progress = nextMilestone > prevMilestone ? Math.round(((level - prevMilestone) / (nextMilestone - prevMilestone)) * 100) : 100;
        return { level: level, nextMilestone: nextMilestone, progress: Math.min(100, progress) };
    },

    addXP: function(amount) {
        // 兼容旧 API
        this._addExperience(amount || 0);
        return this.getExperienceLevel();
    },

    getXP: function() {
        return this.getExperienceLevel();
    },

    renderCelebration: function(message) {
        var app = document.getElementById('app');
        if (!app) return;

        var html = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 60vh;
                padding: 20px;
                text-align: center;
                color: #e2e8f0;
                animation: celebrateIn 0.6s ease;
            ">
                <div style="font-size: 72px; margin-bottom: 16px;">🎉</div>
                <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">${message || 'Amazing Progress!'}</h2>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 20px;">You're building real AI expertise!</p>
                <div style="
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                ">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('dashboard') : location.reload()" style="
                        padding: 12px 32px;
                        background: #4a9eff;
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">🏠 Go to Dashboard</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: 'day-1'}) : location.reload()" style="
                        padding: 12px 32px;
                        background: rgba(255,255,255,0.06);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 10px;
                        color: #e2e8f0;
                        font-size: 15px;
                        cursor: pointer;
                    ">📖 Continue Learning</button>
                </div>
                <style>
                    @keyframes celebrateIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                </style>
            </div>
        `;

        app.innerHTML = html;
    }
};

// 自动初始化
setTimeout(function() {
    LawAIApp.ExperienceEngine.init();
}, 300);

console.log('✨ ExperienceEngine V2.0 ready');
