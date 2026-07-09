// ===========================================
// moduleView.js
// 智能学习模块系统 - 模块仪表盘（Season 2 Phase 43 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.ModuleView = {
    render: function(moduleId) {
        var app = document.getElementById('app');
        if (!app) return;

        // 获取模块数据
        var moduleData = null;
        try {
            if (LawAIApp.ModuleData && typeof LawAIApp.ModuleData.getById === 'function') {
                moduleData = LawAIApp.ModuleData.getById(moduleId);
            }
        } catch (e) {}

        if (!moduleData) {
            // 内置默认模块数据
            var moduleMap = {
                'module_1': { id: 'module_1', name: 'AI Foundations', icon: '🏛️', description: 'Learn the basics of AI.', estimatedMinutes: 120, estimatedXP: 200, difficulty: 'Beginner', themeColor: '#3b82f6', courseId: 'course_ai_fundamentals', estimatedLessons: 10, learningObjectives: ['Understand AI history', 'Learn key AI concepts'] },
                'module_2': { id: 'module_2', name: 'Prompt Engineering', icon: '✍️', description: 'Master the art of crafting prompts.', estimatedMinutes: 120, estimatedXP: 250, difficulty: 'Beginner', themeColor: '#8b5cf6', courseId: 'course_ai_fundamentals', estimatedLessons: 10, learningObjectives: ['Design effective prompts', 'Optimize prompt results'] },
                'module_3': { id: 'module_3', name: 'AI Tools', icon: '🛠️', description: 'Explore leading AI tools.', estimatedMinutes: 120, estimatedXP: 250, difficulty: 'Intermediate', themeColor: '#f59e0b', courseId: 'course_ai_fundamentals', estimatedLessons: 10, learningObjectives: ['Use AI tools effectively', 'Integrate AI into workflow'] },
                'module_4': { id: 'module_4', name: 'Coding with AI', icon: '💻', description: 'Learn to code with AI assistance.', estimatedMinutes: 120, estimatedXP: 300, difficulty: 'Intermediate', themeColor: '#22c55e', courseId: 'course_ai_fundamentals', estimatedLessons: 10, learningObjectives: ['Write code with AI', 'Debug with AI'] },
                'module_5': { id: 'module_5', name: 'AI Development', icon: '🤖', description: 'Build AI-powered applications.', estimatedMinutes: 120, estimatedXP: 350, difficulty: 'Advanced', themeColor: '#f97316', courseId: 'course_ai_fundamentals', estimatedLessons: 10, learningObjectives: ['Build AI apps', 'Deploy AI solutions'] }
            };
            moduleData = moduleMap[moduleId] || moduleMap['module_1'];
        }

        // 获取进度
        var progress = { completedLessons: [], practiceCompleted: false, quizCompleted: false, reflectionCompleted: false };
        try {
            if (LawAIApp.ModuleProgress && typeof LawAIApp.ModuleProgress.get === 'function') {
                progress = LawAIApp.ModuleProgress.get(moduleId) || progress;
            }
        } catch (e) {}

        var totalLessons = moduleData.estimatedLessons || 10;
        var completedLessons = progress.completedLessons?.length || 0;
        var lessonPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        var moduleCompleted = completedLessons >= totalLessons;

        var html = `
            <div style="max-width:800px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Course
                </button>

                <div style="background:linear-gradient(135deg, ${moduleData.themeColor || '#3b82f6'}, #6366f1);padding:24px;border-radius:16px;color:white;margin-bottom:16px;">
                    <h2 style="margin:0 0 4px;font-size:20px;font-weight:700;">${moduleData.icon || '📦'} ${moduleData.name}</h2>
                    <p style="margin:0 0 8px;opacity:0.9;">${moduleData.description || 'Learn key concepts.'}</p>
                    <div style="display:flex;gap:16px;font-size:13px;opacity:0.85;flex-wrap:wrap;">
                        <span>⏱️ ${moduleData.estimatedMinutes || 120} min</span>
                        <span>⭐ ${moduleData.estimatedXP || 200} XP</span>
                        <span>📊 ${moduleData.difficulty || 'Beginner'}</span>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:16px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">Module Progress</h3>
                    <div style="display:flex;justify-content:space-between;font-size:14px;">
                        <span>Lessons: ${completedLessons}/${totalLessons}</span>
                        <span>${lessonPercent}%</span>
                    </div>
                    <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-top:4px;">
                        <div style="width:${lessonPercent}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;"></div>
                    </div>
                    <div style="margin-top:8px;font-size:13px;color:#94a3b8;">
                        <span>Practice: ${progress.practiceCompleted ? '✅' : '⬜'}</span> |
                        <span>Quiz: ${progress.quizCompleted ? '✅' : '⬜'}</span> |
                        <span>Reflection: ${progress.reflectionCompleted ? '✅' : '⬜'}</span>
                    </div>
                    ${moduleCompleted ? '<p style="margin-top:8px;color:#22c55e;">🎉 Module Completed!</p>' : ''}
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📖 Lessons</h3>
                    ${Array.from({length: Math.min(totalLessons, 10)}, function(_, i) {
                        var lessonId = 'day-' + (i + 1 + (parseInt(moduleId.replace('module_', '')) - 1) * 10);
                        var isCompleted = progress.completedLessons?.indexOf(lessonId) !== -1;
                        return `
                            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;cursor:pointer;" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: '${lessonId}'}) : alert('${lessonId}')">
                                <div>
                                    <strong>${i+1}. Lesson ${i+1}</strong>
                                    <small style="color:#94a3b8;display:block;">⏱️ 10 min · ⭐ 20 XP</small>
                                </div>
                                <span>${isCompleted ? '✅' : '▶️'}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="display:flex;flex-direction:column;gap:8px;margin-top:12px;">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('learning-hub') : alert('Learning Hub')" style="padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">📚 Browse Learning Hub</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('knowledge-capture') : alert('Notes')" style="padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">📓 My Notes</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('adaptive-memory') : alert('Memory')" style="padding:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">🧠 Adaptive Memory</button>
                </div>

                <div style="display:flex;justify-content:space-between;margin-top:16px;gap:12px;">
                    <button onclick="alert('Previous module')" style="flex:1;padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#94a3b8;cursor:pointer;">← Previous</button>
                    <button onclick="alert('Next module')" style="flex:1;padding:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#94a3b8;cursor:pointer;">Next →</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
    }
};

console.log('📦 ModuleView V2.0 ready');
