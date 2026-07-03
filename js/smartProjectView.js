// smartProjectView.js
LawAIApp.SmartProjectView = {
  render(projectId) {
    const project = LawAIApp.SmartProjectData.getProjectsByModule('module_ai_intro') // 简单查找，未来扩展
      .find(p => p.projectId === projectId) || 
      (() => {
        for (const mod of LawAIApp.ModuleData.modules) {
          const found = LawAIApp.SmartProjectData.getProjectsByModule(mod.id).find(p => p.projectId === projectId);
          if (found) return found;
        }
        return null;
      })();

    if (!project) {
      document.getElementById('app').innerHTML = '<p>Project not found.</p>';
      return;
    }

    const progress = LawAIApp.SmartProjectProgress.get(projectId);
    LawAIApp.SmartProjectProgress.markStarted(projectId);

    const completedMilestones = progress.completedMilestones.length;
    const totalMilestones = project.milestones.length;
    const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('module', { moduleId: '${project.moduleId}' })" style="background:var(--card); border:none; color:var(--text); padding:0.5rem 1rem; border-radius:8px; cursor:pointer; margin-bottom:1rem; display:flex; align-items:center; gap:0.3rem; font-size:0.85rem;">
          ← Back to Module
        </button>

        <div class="hero-card" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
          <h2>🚀 ${project.title}</h2>
          <p>${project.description}</p>
          <div style="display:flex; gap:1rem; justify-content:center; margin-top:0.5rem;">
            <span class="badge">⏱️ ${project.estimatedHours}h</span>
            <span class="badge">⭐ ${project.estimatedXP} XP</span>
            <span class="badge">📊 ${project.difficulty}</span>
          </div>
          <p style="margin-top:0.5rem;">Stage: <strong>${progress.currentStage.replace('_',' ')}</strong></p>
        </div>

        <!-- Milestones -->
        <div class="dashboard-card">
          <h3>🗂️ Milestones</h3>
          <div class="progress-bar" style="margin-bottom:0.5rem;">
            <div class="progress-fill" style="width:${milestonePercent}%"></div>
          </div>
          <small>${completedMilestones}/${totalMilestones} completed</small>
          <div style="margin-top:0.5rem;">
            ${project.milestones.map(m => `
              <div class="lesson-item" style="justify-content:space-between; padding:0.5rem 0.8rem; cursor:pointer;" onclick="LawAIApp.SmartProjectProgress.toggleMilestone('${projectId}','${m.id}'); LawAIApp.SmartProjectView.render('${projectId}')">
                <span>${m.name}</span>
                <span>${progress.completedMilestones.includes(m.id) ? '✅' : '⬜'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Checklist -->
        <div class="dashboard-card">
          <h3>✅ Checklist</h3>
          ${project.checklist.map((item, idx) => `
            <div class="lesson-item" style="justify-content:space-between; padding:0.5rem 0.8rem; cursor:pointer;" onclick="LawAIApp.SmartProjectProgress.toggleChecklistItem('${projectId}',${idx}); LawAIApp.SmartProjectView.render('${projectId}')">
              <span>${item}</span>
              <span>${progress.checklistItems.includes(idx) ? '✅' : '⬜'}</span>
            </div>
          `).join('')}
        </div>

        <!-- Resources & AI Tips -->
        <div class="widget-grid">
          <div class="widget-card">
            <h3>📚 Resources</h3>
            ${project.resources.map(r => `<a href="${r.url}" target="_blank" class="official-btn" style="display:block; margin:0.2rem 0;">${r.title}</a>`).join('')}
          </div>
          <div class="widget-card">
            <h3>🤖 AI Tips</h3>
            <ul>${project.aiTips.map(tip => `<li style="font-size:0.85rem;">${tip}</li>`).join('')}</ul>
          </div>
        </div>

        <!-- Reflection & Completion -->
        ${!progress.completed ? `
          <div class="dashboard-card">
            <h3>💭 Reflection</h3>
            <textarea id="project-reflection" class="note-field" placeholder="What did you learn? What would you improve?" style="min-height:80px;"></textarea>
          </div>
          <button class="complete-btn" id="complete-project-btn" style="background: var(--success); color: white; border: none; padding: 1rem; border-radius: 12px; width: 100%; margin-top: 1rem; font-size: 1rem; cursor: pointer;">
            🏁 Complete Project
          </button>
        ` : `
          <div class="dashboard-card" style="text-align:center;">
            <h3>🎉 Project Completed!</h3>
            <p>Your project has been added to your portfolio.</p>
          </div>
        `}

        <!-- Progress Analytics (简化) -->
        <div class="widget-card" style="margin-top:1rem;">
          <h3>📊 Project Analytics</h3>
          <p>Milestones: ${milestonePercent}%</p>
          <p>Checklist: ${progress.checklistItems.length}/${project.checklist.length} items done</p>
          <p>Status: ${progress.completed ? 'Completed' : 'In Progress'}</p>
        </div>
      </div>
    `;
    document.getElementById('app').innerHTML = html;

    // 完成项目按钮事件
    const completeBtn = document.getElementById('complete-project-btn');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        const reflection = document.getElementById('project-reflection')?.value || '';
        LawAIApp.SmartProjectProgress.completeProject(projectId, reflection);
        this.render(projectId);
      });
    }
  }
};
