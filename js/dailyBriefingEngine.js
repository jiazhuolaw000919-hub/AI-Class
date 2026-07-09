// ===========================================
// dailyBriefingEngine.js
// 每日简报体验 - 每日首次登录全屏动画简报（Phase 51.5 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DailyBriefing = {
    _key: 'dailyBriefingLastDate',

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

    shouldShowToday: function() {
        var today = new Date().toDateString();
        var lastDate = this._safeGet(this._key);
        return lastDate !== today;
    },

    markShown: function() {
        this._safeSet(this._key, new Date().toDateString());
    },

    showFullExperience: function() {
        var self = this;
        // 如果 DailyPromptExperience 存在，使用它
        if (LawAIApp.DailyPromptExperience && typeof LawAIApp.DailyPromptExperience.render === 'function') {
            LawAIApp.DailyPromptExperience.render(function() {
                self.markShown();
                if (LawAIApp.Router && LawAIApp.Router.currentPage === 'dashboard') {
                    if (LawAIApp.Dashboard && typeof LawAIApp.Dashboard.render === 'function') {
                        LawAIApp.Dashboard.render();
                    }
                }
            });
            return;
        }

        // 备用：显示简单简报
        this._showSimpleBriefing();
    },

    _showSimpleBriefing: function() {
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var streak = progress.streak || 0;
        var xp = 0;
        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
        } catch (e) {}

        var app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 80vh;
                padding: 20px;
                text-align: center;
                color: #e2e8f0;
                animation: fadeIn 0.6s ease;
            ">
                <div style="font-size: 64px; margin-bottom: 16px;">🌅</div>
                <h2 style="font-size: 28px; font-weight: 700; margin: 0 0 8px;">Good Morning!</h2>
                <p style="color: #94a3b8; font-size: 16px; margin: 0 0 20px;">Here's your daily learning briefing</p>

                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 12px;
                    width: 100%;
                    max-width: 400px;
                    margin-bottom: 20px;
                ">
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.04);">
                        <div style="font-size: 12px; color: #94a3b8;">📚 Lessons</div>
                        <div style="font-size: 24px; font-weight: 700; color: #4a9eff;">${completed}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.04);">
                        <div style="font-size: 12px; color: #94a3b8;">🔥 Streak</div>
                        <div style="font-size: 24px; font-weight: 700; color: #f97316;">${streak}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.04);">
                        <div style="font-size: 12px; color: #94a3b8;">⭐ XP</div>
                        <div style="font-size: 24px; font-weight: 700; color: #fbbf24;">${xp}</div>
                    </div>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: 'day-1'}) : location.reload()" style="
                        padding: 12px 32px;
                        background: #4a9eff;
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">📖 Start Learning</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('dashboard') : location.reload()" style="
                        padding: 12px 32px;
                        background: rgba(255,255,255,0.06);
                        border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 10px;
                        color: #e2e8f0;
                        font-size: 15px;
                        cursor: pointer;
                    ">🏠 Dashboard</button>
                </div>

                <p style="color: #64748b; font-size: 11px; margin-top: 20px;">💡 Tip: Complete your daily lesson to maintain your streak!</p>

                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            </div>
        `;

        this.markShown();
    },

    autoShow: function() {
        if (this.shouldShowToday()) {
            setTimeout(function() {
                LawAIApp.DailyBriefing.showFullExperience();
            }, 300);
        }
    },

    getCompactCardHTML: function() {
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var streak = progress.streak || 0;
        var xp = 0;
        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
        } catch (e) {}

        return `
            <div style="
                background: linear-gradient(135deg, rgba(74,158,255,0.1), rgba(139,92,246,0.1));
                border-radius: 12px;
                padding: 14px 18px;
                border: 1px solid rgba(74,158,255,0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 8px;
            ">
                <div>
                    <span style="font-size: 14px;">🌅 Daily Briefing</span>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
                        ${completed} lessons · ${streak} day streak · ${xp} XP
                    </div>
                </div>
                <button onclick="LawAIApp.DailyBriefing.showFullExperience()" style="
                    padding: 6px 16px;
                    background: rgba(74,158,255,0.15);
                    border: 1px solid rgba(74,158,255,0.2);
                    border-radius: 8px;
                    color: #4a9eff;
                    font-size: 12px;
                    cursor: pointer;
                ">View</button>
            </div>
        `;
    }
};

console.log('🌅 DailyBriefing ready');
