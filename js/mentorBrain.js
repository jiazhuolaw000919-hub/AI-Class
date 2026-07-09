// ===========================================
// mentorBrain.js
// AI 导师大脑 - 综合分析 + 学习档案（Phase 52 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.MentorBrain = {
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

    _getProfile: function() {
        var defaultProfile = {
            learningStyle: 'balanced',
            learningMomentum: 50,
            strongSkills: [],
            knowledgeGaps: [],
            preferredTopics: [],
            lastUpdated: null
        };

        try {
            if (LawAIApp.MentorProfile && typeof LawAIApp.MentorProfile.get === 'function') {
                return LawAIApp.MentorProfile.get() || defaultProfile;
            }
        } catch (e) {}

        // 从存储加载
        var stored = this._safeGet('mentor_profile');
        if (stored) return stored;

        return defaultProfile;
    },

    _saveProfile: function(profile) {
        this._safeSet('mentor_profile', profile);
    },

    _updateProfile: function() {
        var profile = this._getProfile();
        var progress = {};
        var skills = [];

        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        try {
            if (LawAIApp.SkillEngine && typeof LawAIApp.SkillEngine.getAll === 'function') {
                skills = LawAIApp.SkillEngine.getAll() || [];
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

        // 计算学习风格
        if (streak > 14) profile.learningStyle = 'consistent';
        else if (xp > 500) profile.learningStyle = 'xp-focused';
        else if (completed > 50) profile.learningStyle = 'accelerated';
        else profile.learningStyle = 'balanced';

        // 计算 momentum
        profile.learningMomentum = Math.min(100, Math.round((completed / 365) * 60 + (streak / 30) * 40));

        // 提取强项和弱项
        if (skills.length > 0) {
            var sorted = skills.slice().sort(function(a, b) { return (b.mastery || 0) - (a.mastery || 0); });
            profile.strongSkills = sorted.slice(0, 3).map(function(s) { return s.title || s.name || 'Skill'; });
            profile.knowledgeGaps = sorted.slice(-2).map(function(s) { return s.title || s.name || 'Skill'; });
        } else {
            profile.strongSkills = ['Building foundation'];
            profile.knowledgeGaps = ['Exploring new topics'];
        }

        profile.lastUpdated = new Date().toISOString();
        this._saveProfile(profile);

        // 生成消息
        var msg = this._generateMessage(progress, profile);
        if (msg) this._safeSet('mentor_message', msg);

        return profile;
    },

    _generateMessage: function(progress, profile) {
        var completed = progress.completedLessons?.length || 0;
        var streak = progress.streak || 0;

        if (completed === 0) {
            return '🌟 Welcome! Complete your first lesson to start your AI journey.';
        }
        if (streak >= 30) {
            return '🏆 Amazing ' + streak + '-day streak! You\'re unstoppable!';
        }
        if (streak >= 7) {
            return '🔥 You\'re on a ' + streak + '-day streak! Keep the momentum going!';
        }
        if (completed >= 100) {
            return '🧠 You\'ve completed ' + completed + ' lessons! You\'re becoming an AI expert!';
        }
        if (completed >= 50) {
            return '💪 Great progress! You\'ve completed ' + completed + ' lessons. Keep going!';
        }
        if (completed >= 10) {
            return '📈 You\'re building momentum! ' + completed + ' lessons completed.';
        }
        return '🌱 Every journey starts with a single step. Complete your first lesson today!';
    },

    renderDashboard: function() {
        var app = document.getElementById('app');
        if (!app) return;

        var profile = this._getProfile();
        var plan = this._getDailyPlan();
        var message = this._safeGet('mentor_message', '💬 How can I help you today?');

        // 更新 profile
        this._updateProfile();

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">🤖 AI Mentor Brain</h2>

                ${message ? `
                    <div style="background:rgba(139,92,246,0.12);border-radius:12px;padding:16px 20px;border:1px solid rgba(139,92,246,0.15);margin-bottom:16px;display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">💬</span>
                        <p style="margin:0;color:#e2e8f0;">${message}</p>
                    </div>
                ` : ''}

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">🧠 Style</div>
                        <div style="font-size:16px;font-weight:600;color:#e2e8f0;">${profile.learningStyle || 'balanced'}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">⚡ Momentum</div>
                        <div style="font-size:16px;font-weight:600;color:${profile.learningMomentum > 70 ? '#22c55e' : '#f59e0b'};">${profile.learningMomentum || 50}/100</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">💪 Strengths</div>
                        <div style="font-size:14px;font-weight:600;color:#e2e8f0;">${(profile.strongSkills || []).slice(0, 2).join(', ') || 'Discovering...'}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">🎯 Gaps</div>
                        <div style="font-size:14px;font-weight:600;color:#e2e8f0;">${(profile.knowledgeGaps || []).join(', ') || 'None detected'}</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🗓️ Today's Plan</h3>
                    <p style="margin:0;font-size:14px;color:#e2e8f0;"><strong>Focus:</strong> ${plan.todayFocus || 'Complete your daily lesson'}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">⏱️ ${plan.estimatedMinutes || 15} min · ${plan.encouragement || 'You\'ve got this!'}</p>
                </div>

                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('conversations') : alert('Chat')" style="padding:10px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">💬 Chat with Mentor</button>
                    <button onclick="alert('Reflection coming soon')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">📝 Weekly Reflection</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('planner') : alert('Planner')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">📅 Planner</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
    },

    _getDailyPlan: function() {
        try {
            if (LawAIApp.MentorPlanner && typeof LawAIApp.MentorPlanner.getDailyPlan === 'function') {
                return LawAIApp.MentorPlanner.getDailyPlan() || {};
            }
        } catch (e) {}

        // 生成默认计划
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var total = progress.totalLessons || 365;
        var remaining = total - completed;

        return {
            todayFocus: completed < total ? 'Complete Day ' + (completed + 1) : 'Review previous lessons',
            estimatedMinutes: 15 + Math.min(completed, 30),
            encouragement: completed > 0 ? 'Keep building your streak!' : 'Start your journey today!'
        };
    },

    getProfile: function() {
        return this._getProfile();
    },

    getPlan: function() {
        return this._getDailyPlan();
    }
};

console.log('🤖 MentorBrain V2.0 ready');
