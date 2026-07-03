// moduleView.js (升级版：集成实践任务列表 + Quiz 入口 + 项目入口 + Adaptive Memory 入口)
LawAIApp.ModuleView = {
  render(moduleId) {
    const module = LawAIApp.ModuleData.getById(moduleId);
    if (!module) {
      document.getElementById('app').innerHTML = '<p>Module not found.</p>';
      return;
    }

    const progress = LawAIApp.ModuleProgress.get(moduleId);
    const totalLessons = module.estimatedLessons;
    const completedLessons = progress.completedLessons.length;
    const lessonPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const moduleCompleted = LawAIApp.ModuleProgress.isCompleted(moduleId);
    const courseId = module.courseId;

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('course-ai-fundamentals')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Course
        </button>

        <div class="continue-card" style="background: linear-gradient(135deg, ${module.themeColor || '#3b82f6'}, #6366f1);">
          <h2>${module.icon} ${module.name}</h2>
          <p>${module.description}</p>
          <div style="display:flex; gap:1rem; margin-top:0.5rem; font-size:0.85rem;">
            <span>⏱️ ${module.estimatedMinutes} min</span>
            <span>⭐ ${module.estimatedXP} XP</span>
            <span>📊 ${module.difficulty}</span>
          </div>
        </div>

        <!-- Progress -->
        <div class="widget-card" style="margin:1rem 0;">
          <h3>Module Progress</h3>
          <div style="display:flex; justify-content:space-between;">
            <span>Lessons: ${completedLessons}/${totalLessons}</span>
            <span>${lessonPercent}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${lessonPercent}%"></div></div>
          <div style="margin-top:0.5rem;">
            <span>Practice: ${progress.practiceCompleted ? '✅' : '⬜'}</span> |
            <span>Quiz: ${progress.quizCompleted ? '✅' : '⬜'}</span> |
            <span>Reflection: ${progress.reflectionCompleted ? '✅' : '⬜'}</span>
          </div>
          <!-- 实践任务列表 -->
          <div style="margin-top:0.8rem;">
            ${(() => {
              const practices = LawAIApp.PracticeData.getPracticesByModule(moduleId);
              if (practices.length === 0) return '<p style="color:var(--text-secondary); font-size:0.9rem;">No practice tasks yet.</p>';
              return practices.map(p => `
                <div class="lesson-item" style="justify-content:space-between; padding:0.5rem 0.8rem; cursor:pointer;" onclick="LawAIApp.Router.navigate('practice', { practiceId: '${p.practiceId}' })">
                  <div>
                    <strong>${p.title}</strong>
                    <small style="color:var(--text-secondary); display:block;">⏱️ ${p.estimatedMinutes} min · ⭐ ${p.estimatedXP} XP</small>
                  </div>
                  <span>${LawAIApp.PracticeProgress.isCompleted(moduleId, p.practiceId) ? '✅' : '▶️'}</span>
                </div>
              `).join('');
            })()}
          </div>

          <!-- Quiz Section (新增) -->
          <div style="margin-top:1rem;">
            <h4>📝 Quiz</h4>
            ${progress.quizCompleted ? 
              `<p>✅ Quiz completed (Score: ${progress.quizScore || 'N/A'}%)</p>
               <button class="quick-btn" onclick="LawAIApp.Router.navigate('quiz-dashboard', { moduleId: '${moduleId}' })">📊 View Insights</button>` :
              `<button class="quick-btn" id="take-quiz-btn">📝 Take Quiz</button>`
            }
          </div>

          <!-- Projects Section (新增) -->
          <div style="margin-top:1rem;">
            <h4>🚀 Projects</h4>
            ${(() => {
              const projects = LawAIApp.SmartProjectData.getProjectsByModule(moduleId);
              if (projects.length === 0) return '<p style="color:var(--text-secondary); font-size:0.9rem;">No projects for this module yet.</p>';
              return projects.map(p => `
                <div class="lesson-item" style="justify-content:space-between; padding:0.5rem 0.8rem; cursor:pointer;" onclick="LawAIApp.Router.navigate('smart-project', { projectId: '${p.projectId}' })">
                  <div>
                    <strong>${p.title}</strong>
                    <small style="color:var(--text-secondary); display:block;">⏱️ ${p.estimatedHours}h · ⭐ ${p.estimatedXP} XP</small>
                  </div>
                  <span>▶️</span>
                </div>
              `).join('');
            })()}
          </div>

          ${moduleCompleted ? '<p style="margin-top:0.5rem;">🎉 Module Completed!</p>' : ''}
        </div>

        <!-- Learning Objectives -->
        <div class="section-card">
          <h3>🎯 Learning Objectives</h3>
          <ul>${module.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
        </div>

        <!-- Dynamic Lessons list -->
        <div class="section-card">
          <h3>📖 Lessons</h3>
          ${(() => {
            const lessons = LawAIApp.LessonData.getLessonsByModule(moduleId);
            if (!lessons || lessons.length === 0) {
              return '<p style="color:var(--text-secondary);">No lessons yet.</p>';
            }
            const prog = LawAIApp.ModuleProgress.get(moduleId);
            return lessons.map(les => `
              <div class="lesson-item" style="justify-content:space-between; padding:0.8rem; cursor:pointer;" onclick="LawAIApp.Router.navigate('lesson-detail', { lessonId: '${les.lessonId}' })">
                <div>
                  <strong>${les.order}. ${les.title}</strong>
                  <small style="color:var(--text-secondary); display:block;">⏱️ ${les.estimatedMinutes} min · ⭐ ${les.estimatedXP} XP</small>
                </div>
                <span>${prog.completedLessons.includes(les.lessonId) ? '✅' : '▶️'}</span>
              </div>
            `).join('');
          })()}
        </div>

        <!-- 🆕 Adaptive Memory 入口 -->
        <div style="text-align:center; margin-top:1rem;">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('adaptive-memory')">🧠 Adaptive Memory</button>
        </div>

        <!-- Navigation -->
        <div class="lesson-nav" style="display:flex; justify-content:space-between; margin-top:1rem;">
          <button class="quick-btn" onclick="alert('Previous module')">← Previous</button>
          <button class="quick-btn" onclick="alert('Next module')">Next →</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;

    // 绑定 Take Quiz 按钮事件 (如果尚未完成 quiz)
    const takeQuizBtn = document.getElementById('take-quiz-btn');
    if (takeQuizBtn) {
      takeQuizBtn.addEventListener('click', () => {
        LawAIApp.ModuleProgress.completeQuiz(moduleId, 85);
        LawAIApp.Router.navigate('quiz-dashboard', { moduleId: moduleId });
      });
    }
  }
};
