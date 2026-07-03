// moduleView.js
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
        <button class="back-btn" onclick="LawAIApp.Router.navigate('course-ai-fundamentals')" style="...">← Back to Course</button>

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
          ${moduleCompleted ? '<p>🎉 Module Completed!</p>' : ''}
        </div>

        <!-- Learning Objectives -->
        <div class="section-card">
          <h3>🎯 Learning Objectives</h3>
          <ul>${module.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
        </div>

        <!-- Lessons placeholder -->
        <div class="section-card">
          <h3>📖 Lessons</h3>
          <p>Lessons will be available in the next chapter.</p>
        </div>

        <!-- Navigation -->
        <div class="lesson-nav" style="display:flex; justify-content:space-between; margin-top:1rem;">
          <button class="quick-btn" onclick="alert('Previous module')">← Previous</button>
          <button class="quick-btn" onclick="alert('Next module')">Next →</button>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
  }
};
