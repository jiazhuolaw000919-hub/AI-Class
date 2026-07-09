// ===========================================
// courseAIFundamentalsView.js
// 课程：AI 基础 - 课程仪表盘（Season 2 Phase 42 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.CourseAIFundamentalsView = {
    _getProgress: function() {
        var key = 'courseProgress_course_ai_fundamentals';
        var defaultProgress = {
            completedModules: [],
            currentModule: 1,
            xpEarned: 0,
            started: false
        };
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                var stored = LawAIApp.StorageEngine.get(key);
                if (stored) return stored;
            }
            var raw = localStorage.getItem('lawai_' + key);
            if (raw) {
                try { return JSON.parse(raw); } catch(e) {}
            }
        } catch (e) {}
        return defaultProgress;
    },

    _saveProgress: function(progress) {
        var key = 'courseProgress_course_ai_fundamentals';
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, progress);
                return;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(progress));
        } catch (e) {}
    },

    render: function() {
        var course = LawAIApp.CourseAIFundamentalsData?.course || {
            name: 'AI Fundamentals',
            description: 'Master the core concepts of AI.',
            estimatedHours: '40 hours',
            estimatedXP: 1000,
            difficulty: 'Beginner',
            learningObjectives: ['Understand AI basics', 'Learn prompt engineering', 'Explore AI tools'],
            skillsGained: ['AI Literacy', 'Prompt Design', 'Tool Usage'],
            modules: [
                { id: 'module_1', name: 'AI Foundations' },
                { id: 'module_2', name: 'Prompt Engineering' },
                { id: 'module_3', name: 'AI Tools' },
                { id: 'module_4', name: 'Coding with AI' },
                { id: 'module_5', name: 'AI Development' }
            ],
            resources: []
        };

        var progress = this._getProgress();
        var totalModules = course.modules?.length || 5;
        var completedModules = progress.completedModules?.length || 0;
        var completionPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
        var currentModuleName = course.modules?.[progress.currentModule - 1]?.name || 'Start';

        var html = `
            <div style="max-width:1000px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Academy
                </button>

                <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:24px;border-radius:16px;color:white;margin-bottom:20px;">
                    <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;">📖 ${course.name}</h2>
                    <p style="margin:0 0 8px;opacity:0.9;">${course.description}</p>
                    <div style="display:flex;gap:16px;font-size:13px;opacity:0.85;flex-wrap:wrap;">
                        <span>⏱️ ${course.estimatedHours || '40 hours'}</span>
                        <span>⭐ ${course.estimatedXP || 1000} XP</span>
                        <span>📊 ${course.difficulty || 'Beginner'}</span>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">Course Progress</h3>
                    <div style="display:flex;justify-content:space-between;font-size:14px;">
                        <span>${completedModules}/${totalModules} modules completed</span>
                        <span>${completionPercent}%</span>
                    </div>
                    <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-top:4px;">
                        <div style="width:${completionPercent}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;"></div>
                    </div>
                    ${progress.started ? `
                        <p style="margin-top:8px;font-size:13px;color:#94a3b8;"><strong>Current:</strong> Module ${progress.currentModule}: ${currentModuleName}</p>
                        <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('module', {moduleId: 'module_' + progress.currentModule}) : alert('Continue')" style="padding:8px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">Continue Module →</button>
                    ` : `
                        <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('module', {moduleId: 'module_1'}) : alert('Start')" style="padding:8px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">Start Course →</button>
                    `}
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🎯 Learning Objectives</h3>
                    <ul style="margin:0;padding-left:20px;color:#cbd5e1;font-size:13px;">
                        ${(course.learningObjectives || ['Understand AI basics']).map(function(obj) { return '<li>' + obj + '</li>'; }).join('')}
                    </ul>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📚 Course Outline</h3>
                    ${(course.modules || []).map(function(mod, idx) {
                        return `
                            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;cursor:pointer;" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('module', {moduleId: '${mod.id}'}) : alert('${mod.id}')">
                                <span>${idx+1}. ${mod.name}</span>
                                <span style="color:#4a9eff;">▶️</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${(course.resources || []).length > 0 ? `
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);">
                        <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📚 Resources</h3>
                        ${course.resources.map(function(res) {
                            return '<a href="' + res.url + '" target="_blank" style="display:block;padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:6px;margin-bottom:4px;color:#4a9eff;text-decoration:none;font-size:13px;">' + res.title + '</a>';
                        }).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        var app = document.getElementById('app');
        if (app) app.innerHTML = html;
    }
};

console.log('📖 CourseAIFundamentalsView V2.0 ready');
