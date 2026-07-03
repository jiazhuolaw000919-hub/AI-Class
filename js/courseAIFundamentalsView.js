// courseAIFundamentalsView.js
LawAIApp.CourseAIFundamentalsView = {
  _getProgress() {
    const key = 'courseProgress_course_ai_fundamentals';
    let progress = LawAIApp.StorageEngine.get(key);
    if (!progress) {
      progress = {
        completedModules: [],
        currentModule: 1,
        xpEarned: 0,
        started: false
      };
      LawAIApp.StorageEngine.set(key, progress);
    }
    return progress;
  },

  render() {
    const course = LawAIApp.CourseAIFundamentalsData.course;
    const progress = this._getProgress();
    const totalModules = course.modules.length;
    const completedModules = progress.completedModules.length;
    const completionPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    const currentModuleName = course.modules[progress.currentModule - 1]?.name || 'Start';

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('academy-dashboard')" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Academy
        </button>

        <!-- Course Header -->
        <div class="continue-card" style="background: linear-gradient(135deg, #3b82f6, #6366f1);">
          <h2>📖 ${course.name}</h2>
          <p>${course.description}</p>
          <div style="display:flex; gap:1rem; margin-top:0.5rem; font-size:0.85rem;">
            <span>⏱️ ${course.estimatedHours}</span>
            <span>⭐ ${course.estimatedXP} XP</span>
            <span>📊 ${course.difficulty}</span>
          </div>
        </div>

        <!-- Progress -->
        <div class="widget-card" style="margin:1rem 0;">
          <h3>Course Progress</h3>
          <div style="display:flex; justify-content:space-between;">
            <span>${completedModules}/${totalModules} modules completed</span>
            <span>${completionPercent}%</span>
          </div>
          <div class="progress-bar" style="margin:0.5rem 0;">
            <div class="progress-fill" style="width:${completionPercent}%"></div>
          </div>
          ${progress.started ? `
            <p><strong>Current:</strong> Module ${progress.currentModule}: ${currentModuleName}</p>
            <button class="quick-btn" onclick="alert('Modules coming in Phase 43')">Continue Module →</button>
          ` : `
            <button class="quick-btn" onclick="alert('Modules coming in Phase 43')">Start Course →</button>
          `}
        </div>

        <!-- Learning Objectives -->
        <div class="section-card">
          <h3>🎯 Learning Objectives</h3>
          <ul>
            ${course.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
          </ul>
        </div>

        <!-- Skills Gained -->
        <div class="section-card">
          <h3>🛠️ Skills You'll Gain</h3>
          <div class="quick-access">
            ${course.skillsGained.map(skill => `<span class="quick-btn" style="cursor:default;">${skill}</span>`).join('')}
          </div>
        </div>

        <!-- Module Outline -->
        <div class="section-card">
          <h3>📚 Course Outline</h3>
          ${course.modules.map((mod, idx) => `
            <div class="lesson-item" style="justify-content:space-between; padding:0.8rem;">
              <span>${idx+1}. ${mod.name}</span>
              <span style="color:var(--text-secondary);">🔒</span>
            </div>
          `).join('')}
        </div>

        <!-- Resources -->
        <div class="section-card">
          <h3>📚 Resources</h3>
          ${course.resources.map(res => `
            <a href="${res.url}" target="_blank" class="official-btn" style="display:block; margin:0.3rem 0;">${res.title}</a>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }
};
